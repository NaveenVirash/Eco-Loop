const express = require('express');
const {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    getProduct,
    getExpiredProducts,
    getRecyclingListings,
    claimCollection,
    confirmCollection,
    confirmDonor
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.route('/')
    .get(getProducts)
    .post(protect, upload.single('image'), createProduct);

// ─── Company / Admin only ─────────────────────────────────────────────────────

// All active+pending recycling listings (for collectors to browse)
router.route('/recycling')
    .get(protect, authorize('company', 'admin'), getRecyclingListings);

// Expired items routed to collectors (legacy cron-based flow)
router.route('/expired')
    .get(protect, authorize('company', 'admin'), getExpiredProducts);

// ─── Dual-Confirmation workflow ───────────────────────────────────────────────

// Collector claims a listing for collection and sets collectorConfirmed = true
router.put('/:id/claim', protect, authorize('company', 'admin'), claimCollection);

// Collector re-confirms (idempotent)
router.put('/:id/confirm-collector', protect, authorize('company', 'admin'), confirmCollection);

// Donor confirms the collector picked it up
router.put('/:id/confirm-donor', protect, authorize('user', 'admin'), confirmDonor);

// ─── Standard CRUD ────────────────────────────────────────────────────────────
router.route('/:id')
    .get(getProduct)
    .put(protect, upload.single('image'), updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
