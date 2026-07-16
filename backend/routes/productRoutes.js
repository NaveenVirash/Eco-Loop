const express = require('express');
const {
    getProducts,
    getMyProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    getProduct,
    getExpiredProducts,
    getRecyclingListings,
    claimCollection,
    confirmCollector,
    confirmDonor
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.route('/')
    .get(getProducts)
    .post(protect, upload.single('image'), createProduct);

router.get('/my-products', protect, getMyProducts);

// ─── Company / Admin only ─────────────────────────────────────────────────────

// All active+pending recycling listings (for collectors to browse)
router.route('/recycling')
    .get(protect, authorize('company', 'admin'), getRecyclingListings);

// Expired items routed to collectors (legacy cron-based flow)
router.route('/expired')
    .get(protect, authorize('company', 'admin'), getExpiredProducts);

// ─── Dual-Confirmation workflow ───────────────
router.put('/:id/claim', protect, claimCollection);
router.put('/:id/confirm-collector', protect, confirmCollector);
router.put('/:id/confirm-donor', protect, confirmDonor);

// ─── Standard CRUD ────────────────────────────────────────────────────────────
router.route('/:id')
    .get(getProduct)
    .put(protect, upload.single('image'), updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
