const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Render Login Page
exports.loginPage = (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/admin/dashboard');
        } catch (e) { /* token invalid, show login */ }
    }
    res.render('admin/login', { error: null });
};

// Handle Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('admin/login', { error: 'Please provide email and password' });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (!admin) {
            return res.render('admin/login', { error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.render('admin/login', { error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('admin/login', { error: 'An error occurred. Please try again.' });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
};

// Dashboard
exports.dashboard = async (req, res) => {
    const Category = require('../models/Category');
    const Package = require('../models/Package');

    const categoryCount = await Category.countDocuments();
    const packageCount = await Package.countDocuments();
    const activePackages = await Package.countDocuments({ status: 'active' });

    res.render('admin/dashboard', {
        admin: req.admin,
        stats: { categoryCount, packageCount, activePackages }
    });
};

// Settings Page
exports.settingsPage = async (req, res) => {
    res.render('admin/settings', { admin: req.admin, success: null, error: null });
};

// Update Settings
exports.updateSettings = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin._id);

        if (email && email !== admin.email) {
            const exists = await Admin.findOne({ email: email.toLowerCase().trim() });
            if (exists) {
                return res.render('admin/settings', { admin: req.admin, success: null, error: 'Email already in use' });
            }
            admin.email = email.toLowerCase().trim();
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.render('admin/settings', { admin: req.admin, success: null, error: 'Current password is required to set a new password' });
            }
            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            if (!isMatch) {
                return res.render('admin/settings', { admin: req.admin, success: null, error: 'Current password is incorrect' });
            }
            admin.password = await bcrypt.hash(newPassword, 12);
        }

        await admin.save();
        res.render('admin/settings', { admin: { ...req.admin.toObject(), email: admin.email }, success: 'Settings updated successfully', error: null });
    } catch (error) {
        res.render('admin/settings', { admin: req.admin, success: null, error: 'Failed to update settings' });
    }
};
