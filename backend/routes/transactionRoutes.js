const express = require('express');
const {
    requestProduct,
    getProductTransactions,
    acceptRequest,
    confirmBuyer,
    confirmSeller
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All transaction routes require authentication

router.post('/request', requestProduct);
router.get('/product/:id', getProductTransactions);
router.put('/:id/accept', acceptRequest);
router.put('/:id/confirm-buyer', confirmBuyer);
router.put('/:id/confirm-seller', confirmSeller);

module.exports = router;
