const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { RECYCLING_POST_POINTS, DONOR_POINTS, COLLECTOR_POINTS, awardPointsAndBadge } = require('./pointsHelper');

// ─── Public / Basic CRUD ──────────────────────────────────────────────────────

// @desc    Get all active marketplace products (public browse)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        // Public browse only shows MARKETPLACE listings that are active.
        // Recycling ("Contact Recycling Center") posts go exclusively to
        // companies via GET /api/products/recycling.
        // Completed listings are soft-deleted (hidden) but preserved for reports.
        const products = await Product.find({
            listingType: 'marketplace',
            status: { $ne: 'completed' },
            isExpired: false
        }).populate({
            path: 'user',
            select: 'name email points'
        });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get products of logged-in user (all statuses, for their dashboard)
// @route   GET /api/products/my-products
// @access  Private
exports.getMyProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            user: req.user.id
        }).sort('-createdAt').populate({
            path: 'collectedBy',
            select: 'name email'
        });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        req.body.user = req.user.id;

        if (req.file) {
            req.body.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Award 5 pts immediately for "Contact Recycling Center" posts.
        // Marketplace posts earn 10 pts later via the dual-confirmation flow.
        const listingType = req.body.listingType || 'marketplace';
        const product = await Product.create(req.body);

        let pointsEarned = 0;
        let newTotal = 0;
        if (listingType === 'recycling' && req.user.role === 'user') {
            const result = await awardPointsAndBadge(req.user.id, RECYCLING_POST_POINTS);
            pointsEarned = RECYCLING_POST_POINTS;
            newTotal = result.newPoints;
        }

        res.status(201).json({
            success: true,
            data: product,
            pointsEarned,
            newTotal
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Mark expired products (cron job target)
// @route   Internal Cron Job
exports.expireProducts = async () => {
    try {
        await Product.updateMany(
            {
                expiresAt: { $lte: new Date() },
                isExpired: false,
                status: 'active' // Don't touch listings already in a workflow
            },
            {
                $set: { isExpired: true }
            }
        );

        console.log('Expired products updated');
    } catch (err) {
        console.error(err);
    }
};

// @desc    Reactivate product
// @route   PUT /api/products/:id/reactivate
// @access  Private
exports.reactivateProduct = async (req, res, next) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (
            product.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        product.isExpired = false;
        product.expiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        );

        await product.save();

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Delete product (hard delete — only for active listings by owner/admin)
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (
            product.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to delete this product'
            });
        }

        // Prevent deleting a listing that is in the middle of a collection workflow
        if (product.status === 'pending_collection') {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete a listing that is currently pending collection confirmation'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Make sure user is product owner or admin
        if (
            product.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this product'
            });
        }

        if (req.file) {
            req.body.imageUrl = `/uploads/${req.file.filename}`;
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'name email phone points role address status bio website averageRating ratingCount'
            })
            .populate({
                path: 'collectedBy',
                select: 'name email'
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all expired products for recycling companies
// @route   GET /api/products/expired
// @access  Private (Company/Admin)
exports.getExpiredProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            isExpired: true,
            status: { $ne: 'completed' }
        }).populate({
            path: 'user',
            select: 'name email phone points address'
        }).sort('-expiresAt');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all active recycling listings (for collectors to browse)
// @route   GET /api/products/recycling
// @access  Private (Company/Admin)
exports.getRecyclingListings = async (req, res, next) => {
    try {
        const products = await Product.find({
            listingType: 'recycling',
            status: { $in: ['active', 'pending_collection'] }
        }).populate({
            path: 'user',
            select: 'name email phone address'
        }).populate({
            path: 'collectedBy',
            select: 'name email'
        }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};


// ─── Dual-Confirmation Workflow moved to transactionController.js ───────────

exports.claimCollection = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        
        if (product.user.toString() === req.user.id) {
            return res.status(400).json({ success: false, error: 'You cannot claim your own product' });
        }
        if (product.status !== 'active') {
            return res.status(400).json({ success: false, error: 'Product is no longer available' });
        }

        product.status = 'pending_collection';
        product.collectedBy = req.user.id;
        await product.save();

        await Transaction.create({
            product: product._id,
            seller: product.user,
            buyer: req.user.id,
            status: 'accepted'
        });

        res.status(200).json({ success: true, message: 'Item claimed successfully. Waiting for donor confirmation.' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

async function _tryCompleteProductTransaction(transaction) {
    if (!transaction.buyerConfirmed || !transaction.sellerConfirmed) return { completed: false };

    if (transaction.status === 'completed') return { completed: true, alreadyAwarded: true };

    transaction.pointsAwarded = true;
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    await awardPointsAndBadge(transaction.seller, DONOR_POINTS);
    await awardPointsAndBadge(transaction.buyer, COLLECTOR_POINTS);

    await Product.findByIdAndUpdate(transaction.product, { status: 'completed' });

    return { completed: true };
}

exports.confirmCollector = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({ product: req.params.id, buyer: req.user.id, status: 'accepted' });
        if (!transaction) return res.status(404).json({ success: false, error: 'Active transaction not found' });

        transaction.buyerConfirmed = true;
        transaction.buyerConfirmedAt = new Date();
        await transaction.save();

        const comp = await _tryCompleteProductTransaction(transaction);
        res.status(200).json({ success: true, message: comp.completed ? 'Points awarded! Transaction complete.' : 'Confirmed. Waiting for donor.' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.confirmDonor = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({ product: req.params.id, seller: req.user.id, status: 'accepted' });
        if (!transaction) return res.status(404).json({ success: false, error: 'Active transaction not found' });

        transaction.sellerConfirmed = true;
        transaction.sellerConfirmedAt = new Date();
        await transaction.save();

        const comp = await _tryCompleteProductTransaction(transaction);
        res.status(200).json({ success: true, message: comp.completed ? 'Points awarded! Transaction complete.' : 'Confirmed. Waiting for collector.' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};