const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { RECYCLING_POST_POINTS, DONOR_POINTS, COLLECTOR_POINTS, awardPointsAndBadge } = require('./pointsHelper');

// @desc    Express interest in a product (Buyer)
// @route   POST /api/transactions/request
// @access  Private
exports.requestProduct = async (req, res, next) => {
    try {
        const { productId, message } = req.body;
        const buyerId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.user.toString() === buyerId) {
            return res.status(400).json({ success: false, error: 'You cannot request your own product' });
        }

        if (product.status !== 'active') {
            return res.status(400).json({ success: false, error: 'This product is no longer available' });
        }

        // Check if already requested
        const existing = await Transaction.findOne({ product: productId, buyer: buyerId });
        if (existing) {
            return res.status(400).json({ success: false, error: 'You have already requested this item' });
        }

        const transaction = await Transaction.create({
            product: productId,
            seller: product.user,
            buyer: buyerId,
            message
        });

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all transactions/requests for a specific product
// @route   GET /api/transactions/product/:id
// @access  Private
exports.getProductTransactions = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Only seller can see all requests for their product, but buyers can see their own
        if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
            const myTransaction = await Transaction.findOne({ product: req.params.id, buyer: req.user.id })
                .populate('buyer', 'name email role')
                .populate('seller', 'name email phone role');
            return res.status(200).json({
                success: true,
                data: myTransaction ? [myTransaction] : []
            });
        }

        const transactions = await Transaction.find({ product: req.params.id })
            .populate('buyer', 'name email phone role averageRating ratingCount')
            .populate('seller', 'name email phone role averageRating ratingCount')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Seller accepts a buyer's request
// @route   PUT /api/transactions/:id/accept
// @access  Private
exports.acceptRequest = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('product');
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        if (transaction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        if (transaction.status !== 'requested') {
            return res.status(400).json({ success: false, error: 'Transaction is not in requested state' });
        }

        // Update transaction
        transaction.status = 'accepted';
        await transaction.save();

        // Reject other requests for this product
        await Transaction.updateMany(
            { product: transaction.product._id, _id: { $ne: transaction._id }, status: 'requested' },
            { $set: { status: 'rejected' } }
        );

        // Update Product status
        await Product.findByIdAndUpdate(transaction.product._id, {
            status: 'pending_collection'
        });

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

async function _tryComplete(transaction) {
    if (!transaction.buyerConfirmed || !transaction.sellerConfirmed) {
        return { completed: false };
    }

    const claimed = await Transaction.findOneAndUpdate(
        { _id: transaction._id, pointsAwarded: false },
        {
            $set: {
                pointsAwarded: true,
                status: 'completed',
                completedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    if (!claimed) {
        return { completed: true, alreadyAwarded: true };
    }

    // Award points
    const [donorResult, collectorResult] = await Promise.all([
        awardPointsAndBadge(transaction.seller, DONOR_POINTS),
        awardPointsAndBadge(transaction.buyer, COLLECTOR_POINTS)
    ]);

    // Set product status to completed
    await Product.findByIdAndUpdate(transaction.product, { status: 'completed' });

    return { completed: true, donorResult, collectorResult };
}

// @desc    Buyer confirms pickup
// @route   PUT /api/transactions/:id/confirm-buyer
// @access  Private
exports.confirmBuyer = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        if (transaction.buyer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'You are not the buyer' });
        }

        if (transaction.status === 'completed') {
            return res.status(200).json({ success: true, message: 'Already completed', data: transaction });
        }

        transaction.buyerConfirmed = true;
        transaction.buyerConfirmedAt = new Date();
        await transaction.save();

        const completionResult = await _tryComplete(transaction);

        res.status(200).json({
            success: true,
            message: completionResult.completed ? 'Points awarded!' : 'Confirmed. Waiting for seller.',
            data: transaction,
            completionResult
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Seller confirms handover
// @route   PUT /api/transactions/:id/confirm-seller
// @access  Private
exports.confirmSeller = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        if (transaction.seller.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'You are not the seller' });
        }

        if (transaction.status === 'completed') {
            return res.status(200).json({ success: true, message: 'Already completed', data: transaction });
        }

        transaction.sellerConfirmed = true;
        transaction.sellerConfirmedAt = new Date();
        await transaction.save();

        const completionResult = await _tryComplete(transaction);

        res.status(200).json({
            success: true,
            message: completionResult.completed ? 'Points awarded!' : 'Confirmed. Waiting for buyer.',
            data: transaction,
            completionResult
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
