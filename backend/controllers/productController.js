const Product = require('../models/Product');

// @desc    Get all active products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            isExpired: false
        }).populate({
            path: 'user',
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

// @desc    Get products of logged-in user
// @route   GET /api/products/my-products
// @access  Private
exports.getMyProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            user: req.user.id
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

        const product = await Product.create(req.body);

        res.status(201).json({
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

// @desc    Mark expired products
// @route   Internal Cron Job
exports.expireProducts = async () => {
    try {
        await Product.updateMany(
            {
                expiresAt: { $lte: new Date() },
                isExpired: false
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

// @desc    Delete product
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