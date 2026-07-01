const express = require('express');
const { getProducts, createProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, upload.single('image'), createProduct);

router.route('/:id')
    .put(protect, upload.single('image'), updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
