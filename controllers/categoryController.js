const Category = require('../models/Category');
const Package = require('../models/Package');
const fs = require('fs');
const path = require('path');

// List all categories (admin)
exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('admin/categories', { admin: req.admin, categories });
    } catch (error) {
        res.render('admin/categories', { admin: req.admin, categories: [], error: 'Failed to load categories' });
    }
};

// Create category form
exports.createCategoryPage = (req, res) => {
    res.render('admin/category-form', { admin: req.admin, category: null, error: null });
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? '/uploads/' + req.file.filename : '';

        await Category.create({ name, description, image });
        res.redirect('/admin/categories');
    } catch (error) {
        res.render('admin/category-form', {
            admin: req.admin,
            category: null,
            error: error.message || 'Failed to create category'
        });
    }
};

// Edit category form
exports.editCategoryPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.redirect('/admin/categories');
        res.render('admin/category-form', { admin: req.admin, category, error: null });
    } catch (error) {
        res.redirect('/admin/categories');
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) return res.redirect('/admin/categories');

        category.name = name;
        category.description = description;

        if (req.file) {
            // Delete old image
            if (category.image) {
                const oldPath = path.join(__dirname, '..', category.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            category.image = '/uploads/' + req.file.filename;
        }

        await category.save();
        res.redirect('/admin/categories');
    } catch (error) {
        const category = await Category.findById(req.params.id);
        res.render('admin/category-form', {
            admin: req.admin,
            category,
            error: error.message || 'Failed to update category'
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            // Delete image file
            if (category.image) {
                const imgPath = path.join(__dirname, '..', category.image);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
            // Delete associated packages images
            const packages = await Package.find({ categoryId: category._id });
            for (const pkg of packages) {
                if (pkg.image) {
                    const pkgImgPath = path.join(__dirname, '..', pkg.image);
                    if (fs.existsSync(pkgImgPath)) fs.unlinkSync(pkgImgPath);
                }
            }
            await Package.deleteMany({ categoryId: category._id });
            await Category.findByIdAndDelete(req.params.id);
        }
        res.redirect('/admin/categories');
    } catch (error) {
        res.redirect('/admin/categories');
    }
};
