const Product = require('../models/Product');

const expireProducts = async () => {
    try {

        const result = await Product.updateMany(
            {
                expiresAt: { $lte: new Date() },
                isExpired: false,
                status: 'active' // Don't touch listings already in a collection workflow
            },
            {
                $set: {
                    isExpired: true
                }
            }
        );

        console.log(
            `${result.modifiedCount} products marked as expired`
        );

    } catch (error) {
        console.error('Product expiry error:', error);
    }
};

module.exports = expireProducts;