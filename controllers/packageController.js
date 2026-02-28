const Package = require('../models/Package');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

// List all packages (admin)
exports.listPackages = async (req, res) => {
    try {
        const packages = await Package.find().populate('categoryId').sort({ createdAt: -1 });
        res.render('admin/packages', { admin: req.admin, packages });
    } catch (error) {
        res.render('admin/packages', { admin: req.admin, packages: [], error: 'Failed to load packages' });
    }
};

// Create package form
exports.createPackagePage = async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    res.render('admin/package-form', { admin: req.admin, pkg: null, categories, error: null });
};

// Create package
exports.createPackage = async (req, res) => {
    try {
        const { categoryId, name, ram, storage, cpuPercentage, price, shortDescription, fullDescription, status } = req.body;
        const image = req.file ? '/uploads/' + req.file.filename : '';

        await Package.create({
            categoryId, name, image, ram, storage, cpuPercentage, price,
            shortDescription, fullDescription, status: status || 'active'
        });
        res.redirect('/admin/packages');
    } catch (error) {
        const categories = await Category.find().sort({ name: 1 });
        res.render('admin/package-form', {
            admin: req.admin,
            pkg: null,
            categories,
            error: error.message || 'Failed to create package'
        });
    }
};

// Edit package form
exports.editPackagePage = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.redirect('/admin/packages');
        const categories = await Category.find().sort({ name: 1 });
        res.render('admin/package-form', { admin: req.admin, pkg, categories, error: null });
    } catch (error) {
        res.redirect('/admin/packages');
    }
};

// Update package
exports.updatePackage = async (req, res) => {
    try {
        const { categoryId, name, ram, storage, cpuPercentage, price, shortDescription, fullDescription, status } = req.body;
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.redirect('/admin/packages');

        pkg.categoryId = categoryId;
        pkg.name = name;
        pkg.ram = ram;
        pkg.storage = storage;
        pkg.cpuPercentage = cpuPercentage;
        pkg.price = price;
        pkg.shortDescription = shortDescription;
        pkg.fullDescription = fullDescription;
        pkg.status = status || 'active';

        if (req.file) {
            if (pkg.image) {
                const oldPath = path.join(__dirname, '..', pkg.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            pkg.image = '/uploads/' + req.file.filename;
        }

        await pkg.save();
        res.redirect('/admin/packages');
    } catch (error) {
        const categories = await Category.find().sort({ name: 1 });
        const pkg = await Package.findById(req.params.id);
        res.render('admin/package-form', {
            admin: req.admin,
            pkg,
            categories,
            error: error.message || 'Failed to update package'
        });
    }
};

// Delete package
exports.deletePackage = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (pkg) {
            if (pkg.image) {
                const imgPath = path.join(__dirname, '..', pkg.image);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
            await Package.findByIdAndDelete(req.params.id);
        }
        res.redirect('/admin/packages');
    } catch (error) {
        res.redirect('/admin/packages');
    }
};
