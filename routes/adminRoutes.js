const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const packageController = require('../controllers/packageController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auth routes
router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

// Protected routes
router.get('/dashboard', authMiddleware, adminController.dashboard);

// Settings
router.get('/settings', authMiddleware, adminController.settingsPage);
router.post('/settings', authMiddleware, adminController.updateSettings);

// Category routes
router.get('/categories', authMiddleware, categoryController.listCategories);
router.get('/categories/create', authMiddleware, categoryController.createCategoryPage);
router.post('/categories/create', authMiddleware, upload.single('image'), categoryController.createCategory);
router.get('/categories/edit/:id', authMiddleware, categoryController.editCategoryPage);
router.post('/categories/edit/:id', authMiddleware, upload.single('image'), categoryController.updateCategory);
router.post('/categories/delete/:id', authMiddleware, categoryController.deleteCategory);

// Package routes
router.get('/packages', authMiddleware, packageController.listPackages);
router.get('/packages/create', authMiddleware, packageController.createPackagePage);
router.post('/packages/create', authMiddleware, upload.single('image'), packageController.createPackage);
router.get('/packages/edit/:id', authMiddleware, packageController.editPackagePage);
router.post('/packages/edit/:id', authMiddleware, upload.single('image'), packageController.updatePackage);
router.post('/packages/delete/:id', authMiddleware, packageController.deletePackage);

module.exports = router;
