const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.homePage);
router.get('/category/:id', publicController.categoryPage);
router.get('/package/:id', publicController.packagePage);

module.exports = router;
