const express = require('express');
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, createProduct);

router.route('/:id')
    .delete(protect, deleteProduct);

module.exports = router;
