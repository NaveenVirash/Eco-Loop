const express = require('express');
const { getProducts, createProduct, deleteProduct, updateProduct, getProduct, getExpiredProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, upload.single('image'), createProduct);

router.route('/expired')
    .get(protect, authorize('company', 'admin'), getExpiredProducts);

router.route('/:id')
    .get(getProduct)
    .put(protect, upload.single('image'), updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;

