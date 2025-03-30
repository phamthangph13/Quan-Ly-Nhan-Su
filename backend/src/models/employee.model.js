const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Personal information
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  cccd: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String
  },

  // Job information
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['intern', 'junior', 'senior', 'manager', 'director'],
    required: true
  },
  joinDate: {
    type: Date,
    required: true
  },
  contractType: {
    type: String,
    enum: ['fulltime', 'parttime', 'contractor', 'intern'],
    required: true
  },
  salary: {
    type: Number,
    required: true
  },

  // Login information
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'onLeave', 'inactive'],
    default: 'active',
    required: true
  }
}, {
  timestamps: true
});

// Create a virtual for the full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName}`;
});

// Ensure virtuals are included when converting document to JSON
employeeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Don't send password in API responses
    return ret;
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 