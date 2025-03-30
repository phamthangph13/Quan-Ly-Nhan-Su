const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Employee = require('./models/employee.model');
const Attendance = require('./models/attendance.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system')
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Hash password for employees
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create employees
    const employees = [
      {
        firstName: 'Admin',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        cccd: '123456789012',
        phone: '0987654321',
        email: 'admin@company.com',
        department: 'Ban Giám Đốc',
        position: 'Giám đốc',
        level: 'director',
        joinDate: new Date('2020-01-01'),
        contractType: 'fulltime',
        salary: 50000000,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      },
      {
        firstName: 'Trung',
        lastName: 'Nguyễn Văn',
        dateOfBirth: new Date('1992-05-15'),
        gender: 'male',
        cccd: '123456789013',
        phone: '0987654322',
        email: 'trung@company.com',
        department: 'Công Nghệ Thông Tin',
        position: 'Trưởng phòng IT',
        level: 'manager',
        joinDate: new Date('2020-02-01'),
        contractType: 'fulltime',
        salary: 30000000,
        username: 'trung',
        password: hashedPassword,
        role: 'manager',
        status: 'active'
      },
      {
        firstName: 'Linh',
        lastName: 'Trần Thị',
        dateOfBirth: new Date('1995-08-20'),
        gender: 'female',
        cccd: '123456789014',
        phone: '0987654323',
        email: 'linh@company.com',
        department: 'Nhân Sự',
        position: 'Chuyên viên HR',
        level: 'senior',
        joinDate: new Date('2021-01-15'),
        contractType: 'fulltime',
        salary: 20000000,
        username: 'linh',
        password: hashedPassword,
        role: 'employee',
        status: 'active'
      },
      {
        firstName: 'Dương',
        lastName: 'Phạm Văn',
        dateOfBirth: new Date('1997-03-12'),
        gender: 'male',
        cccd: '123456789015',
        phone: '0987654324',
        email: 'duong@company.com',
        department: 'Công Nghệ Thông Tin',
        position: 'Lập trình viên',
        level: 'junior',
        joinDate: new Date('2022-03-01'),
        contractType: 'fulltime',
        salary: 15000000,
        username: 'duong',
        password: hashedPassword,
        role: 'employee',
        status: 'active'
      },
      {
        firstName: 'Mai',
        lastName: 'Lê Thị',
        dateOfBirth: new Date('1998-11-05'),
        gender: 'female',
        cccd: '123456789016',
        phone: '0987654325',
        email: 'mai@company.com',
        department: 'Kế Toán',
        position: 'Kế toán viên',
        level: 'senior',
        joinDate: new Date('2021-05-10'),
        contractType: 'fulltime',
        salary: 18000000,
        username: 'mai',
        password: hashedPassword,
        role: 'employee',
        status: 'active'
      }
    ];
    
    // Insert employees
    const savedEmployees = await Employee.insertMany(employees);
    console.log(`${savedEmployees.length} employees created`);
    
    // Get current date
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    
    // Generate attendance data for the current month
    const attendanceRecords = [];
    
    for (const employee of savedEmployees) {
      // Generate attendance for each day of the month up to today
      for (let day = 1; day <= today.getDate(); day++) {
        // Skip weekends (Saturday and Sunday)
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Randomize attendance status
        const random = Math.random();
        let status, checkIn, checkOut;
        
        if (random > 0.9) {
          // Absent (10% chance)
          status = 'absent';
        } else if (random > 0.85) {
          // Leave (5% chance)
          status = 'leave';
        } else {
          // Present (85% chance)
          status = 'present';
          
          // Set check-in time (between 7:30 AM and 9:30 AM)
          const checkInHour = Math.floor(Math.random() * 2) + 7; // 7-8
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = new Date(year, month, day, checkInHour, checkInMinute);
          
          // Determine check-in status
          const checkInStatus = checkInHour >= 9 || (checkInHour === 8 && checkInMinute > 30) ? 'late' : 'on-time';
          
          checkIn = {
            time: checkInTime,
            status: checkInStatus
          };
          
          // Set check-out time (between 4:30 PM and 6:30 PM)
          const checkOutHour = Math.floor(Math.random() * 2) + 16; // 16-17
          const checkOutMinute = Math.floor(Math.random() * 60);
          const checkOutTime = new Date(year, month, day, checkOutHour, checkOutMinute);
          
          // Determine check-out status
          const checkOutStatus = checkOutHour < 17 || (checkOutHour === 17 && checkOutMinute < 30) ? 'early' : 'on-time';
          
          checkOut = {
            time: checkOutTime,
            status: checkOutStatus
          };
          
          // Calculate work hours
          const workHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);
          
          attendanceRecords.push({
            employeeId: employee._id,
            date,
            checkIn,
            checkOut,
            workHours,
            status
          });
        }
      }
    }
    
    // Insert attendance records
    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`${attendanceRecords.length} attendance records created`);
    }
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

// Run the seed function
seedDatabase(); 