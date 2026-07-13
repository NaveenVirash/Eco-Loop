const Product = require('../models/Product');
const User = require('../models/User');
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
            new: true,
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
                select: 'name email phone points role address status bio website'
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


// ─── Dual-Confirmation Workflow ───────────────────────────────────────────────

/**
 * Internal helper — called by both confirm handlers.
 *
 * If both collectorConfirmed AND donorConfirmed are true, and points have NOT
 * yet been awarded, atomically:
 *   1. Credits DONOR_POINTS to the listing owner (Donor).
 *   2. Credits COLLECTOR_POINTS to the collector (Company).
 *   3. Sets status = 'completed', pointsAwarded = true, completedAt = now.
 *
 * The `pointsAwarded` flag is the idempotency guard — once true, this function
 * returns immediately without awarding more points, making the confirm
 * endpoints safe to call multiple times.
 *
 * @param {Product} product - Mongoose document (already saved with latest flags)
 * @returns {Promise<{ completed: boolean, donorResult?, collectorResult? }>}
 */
async function _tryComplete(product) {
    if (!product.collectorConfirmed || !product.donorConfirmed) {
        return { completed: false };
    }

    // Atomically claim the right to award points by toggling pointsAwarded
    // Only the first caller wins; subsequent calls see pointsAwarded === true.
    const claimed = await Product.findOneAndUpdate(
        { _id: product._id, pointsAwarded: false },
        {
            $set: {
                pointsAwarded: true,
                status: 'completed',
                completedAt: new Date()
            }
        },
        { new: true }
    );

    if (!claimed) {
        // pointsAwarded was already true — another request got here first
        return { completed: true, alreadyAwarded: true };
    }

    // Award points concurrently to both parties
    const [donorResult, collectorResult] = await Promise.all([
        awardPointsAndBadge(product.user, DONOR_POINTS),
        awardPointsAndBadge(product.collectedBy, COLLECTOR_POINTS)
    ]);

    return { completed: true, donorResult, collectorResult };
}

// ─────────────────────────────────────────────────────────────────────────────

// @desc    Collector claims a recycling listing for collection
//          Sets collectedBy, collectorConfirmed = true, status = pending_collection
// @route   PUT /api/products/:id/claim
// @access  Private (Company only)
exports.claimCollection = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.listingType !== 'recycling') {
            return res.status(400).json({ success: false, error: 'Only recycling listings can be claimed for collection' });
        }

        if (product.status === 'completed') {
            return res.status(400).json({ success: false, error: 'This listing has already been completed' });
        }

        if (product.collectedBy && product.collectedBy.toString() !== req.user.id) {
            return res.status(400).json({ success: false, error: 'This listing has already been claimed by another collector' });
        }

        // Claim the listing
        product.collectedBy        = req.user.id;
        product.collectorConfirmed = true;
        product.collectorConfirmedAt = new Date();
        product.status             = 'pending_collection';

        await product.save();

        // Attempt completion (in case donor had pre-confirmed — unlikely but handled)
        const completionResult = await _tryComplete(product);

        res.status(200).json({
            success: true,
            message: completionResult.completed
                ? 'Collection confirmed and points awarded!'
                : 'Collection claimed. Waiting for donor to confirm pickup.',
            data: product,
            completionResult
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Collector re-confirms collection (idempotent)
// @route   PUT /api/products/:id/confirm-collector
// @access  Private (Company only)
exports.confirmCollection = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.status === 'completed') {
            return res.status(200).json({ success: true, message: 'Already completed', data: product });
        }

        // Only the collector who claimed this item can confirm
        if (!product.collectedBy || product.collectedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'You are not the assigned collector for this listing' });
        }

        product.collectorConfirmed   = true;
        product.collectorConfirmedAt = new Date();
        await product.save();

        const completionResult = await _tryComplete(product);

        res.status(200).json({
            success: true,
            message: completionResult.completed
                ? 'Both parties confirmed — points awarded!'
                : 'Your confirmation saved. Waiting for donor to confirm.',
            data: product,
            completionResult
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Donor (listing owner) confirms the collector picked up the item
// @route   PUT /api/products/:id/confirm-donor
// @access  Private (User — must be the listing owner)
exports.confirmDonor = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.status === 'completed') {
            return res.status(200).json({ success: true, message: 'Already completed', data: product });
        }

        // Only the original donor (listing owner) can confirm
        if (product.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Only the listing owner can confirm donor pickup' });
        }

        // Collector must have claimed before the donor can confirm
        if (!product.collectedBy || !product.collectorConfirmed) {
            return res.status(400).json({
                success: false,
                error: 'No collector has claimed this listing yet. Please wait for a collector to confirm first.'
            });
        }

        product.donorConfirmed   = true;
        product.donorConfirmedAt = new Date();
        await product.save();

        const completionResult = await _tryComplete(product);

        res.status(200).json({
            success: true,
            message: completionResult.completed
                ? '🎉 Pickup confirmed! You have earned 10 Eco-Points!'
                : 'Your confirmation saved. Waiting for collector to confirm.',
            data: product,
            completionResult
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};