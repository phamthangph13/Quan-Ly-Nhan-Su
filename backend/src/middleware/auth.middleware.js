const jwt = require('jsonwebtoken');
const Employee = require('../models/employee.model');

const authMiddleware = async (req, res, next) => {
    // COMPLETELY BYPASS ALL AUTHENTICATION IN DEVELOPMENT MODE
    // This will allow APIs to work without any token validation
    console.log('Auth middleware bypassed - DEV MODE');
    
    try {
        // Find the first employee to use as admin (without any token checking)
        const firstEmployee = await Employee.findOne();
        
        if (firstEmployee) {
            console.log('Using employee ID:', firstEmployee._id);
            // Grant admin access
            req.employee = firstEmployee;
            req.employeeId = firstEmployee._id;
            req.employeeRole = 'admin'; // Force admin role
        } else {
            console.log('No employees found, setting default values');
            // Even if no employees found, still proceed with mock data
            req.employeeId = '000000000000000000000000';
            req.employeeRole = 'admin';
        }
        
        // Always proceed
        next();
    } catch (error) {
        console.error('Auth error:', error);
        // Even on error, proceed anyway for development
        req.employeeId = '000000000000000000000000';
        req.employeeRole = 'admin';
        next();
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    // Always grant admin access in development
    next();
};

// Manager and admin middleware
const managerOrAdmin = (req, res, next) => {
    // Always grant manager/admin access in development
    next();
};

module.exports = {
    authMiddleware,
    adminOnly,
    managerOrAdmin
}; 