const Employee = require('../models/employee.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên', error: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin nhân viên', error: error.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    // Check if email already exists
    const existingEmail = await Employee.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({ 
        message: 'Thông tin đã tồn tại', 
        error: `Email ${req.body.email} đã được sử dụng.` 
      });
    }
    
    // Check if username already exists
    const existingUsername = await Employee.findOne({ username: req.body.username });
    if (existingUsername) {
      return res.status(400).json({ 
        message: 'Thông tin đã tồn tại', 
        error: `Username ${req.body.username} đã được sử dụng.` 
      });
    }
    
    // Check if CCCD already exists
    const existingCccd = await Employee.findOne({ cccd: req.body.cccd });
    if (existingCccd) {
      return res.status(400).json({ 
        message: 'Thông tin đã tồn tại', 
        error: `CCCD ${req.body.cccd} đã được sử dụng.` 
      });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    // Create new employee with hashed password
    const newEmployee = new Employee({
      ...req.body,
      password: hashedPassword
    });
    
    // Save to database
    const savedEmployee = await newEmployee.save();
    
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      const fieldName = Object.keys(error.keyPattern)[0];
      const fieldValue = req.body[fieldName];
      
      return res.status(400).json({ 
        message: 'Thông tin đã tồn tại', 
        error: `Trường ${fieldName} với giá trị ${fieldValue} đã được sử dụng.` 
      });
    }
    
    res.status(500).json({ message: 'Lỗi khi tạo nhân viên mới', error: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { authorization } = req.headers;
    let isAdmin = false;
    let isOwnProfile = false;
    
    // Check if this is an employee updating their own profile
    if (authorization && authorization.startsWith('Bearer ')) {
      try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hr_system_secret_key');
        
        // Check if employee is updating their own profile
        isOwnProfile = decoded.id === req.params.id;
        
        // Check if user is admin
        isAdmin = decoded.role === 'admin';
      } catch (error) {
        // Invalid token, continue as non-authenticated request
      }
    }
    
    let updateData = { ...req.body };
    
    // If it's the employee updating their own profile, only allow specific fields
    if (isOwnProfile && !isAdmin) {
      // Only allow to update contact fields
      const allowedFields = ['phone', 'email', 'address'];
      Object.keys(updateData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      });
    }
    
    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(200).json(updatedEmployee);
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Thông tin đã tồn tại', 
        error: `Trường ${Object.keys(error.keyPattern)[0]} đã được sử dụng.` 
      });
    }
    
    res.status(500).json({ message: 'Lỗi khi cập nhật nhân viên', error: error.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(200).json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa nhân viên', error: error.message });
  }
};

// Filter employees
exports.filterEmployees = async (req, res) => {
  try {
    const { department, position, status, searchTerm } = req.query;
    const filter = {};
    
    // Add filters if they exist
    if (department) filter.department = department;
    if (position) filter.position = position;
    if (status) filter.status = status;
    
    // Add search term if it exists
    if (searchTerm) {
      filter.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { cccd: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    const employees = await Employee.find(filter);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lọc danh sách nhân viên', error: error.message });
  }
}; 