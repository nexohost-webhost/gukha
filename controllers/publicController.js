const Category = require('../models/Category');
const Package = require('../models/Package');

// Homepage - show all categories
exports.homePage = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('public/home', { categories });
    } catch (error) {
        res.render('public/home', { categories: [] });
    }
};

// Category page - show packages in category
exports.categoryPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.redirect('/');

        const packages = await Package.find({
            categoryId: category._id,
            status: 'active'
        }).sort({ price: 1 });

        res.render('public/category', { category, packages });
    } catch (error) {
        res.redirect('/');
    }
};

// Package details page
exports.packagePage = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id).populate('categoryId');
        if (!pkg || pkg.status === 'disabled') return res.redirect('/');

        // Get related packages in same category
        const relatedPackages = await Package.find({
            categoryId: pkg.categoryId._id,
            _id: { $ne: pkg._id },
            status: 'active'
        }).limit(3).sort({ price: 1 });

        res.render('public/package', { pkg, relatedPackages });
    } catch (error) {
        res.redirect('/');
    }
};
