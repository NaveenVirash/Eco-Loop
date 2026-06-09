const Product = require('../models/Product');

const expireProducts = async () => {
    try {

        const result = await Product.updateMany(
            {
                expiresAt: { $lte: new Date() },
                isExpired: false
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