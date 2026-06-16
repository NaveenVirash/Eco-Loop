/**
 * Calculates points awarded for a product listing.
 * 
 * Rules:
 * - Photo uploaded: +5 pts
 * - Marketplace listing: +5 pts
 * - Recycling donation: +20 pts
 * 
 * @param {boolean} hasImage - Whether the user uploaded an image
 * @param {string} listingType - 'marketplace' or 'recycling'
 * @returns {number} The total points earned
 */
exports.calculatePoints = (hasImage, listingType) => {
    let points = 0;
    
    if (hasImage) {
        points += 5;
    }

    if (listingType === 'marketplace') {
        points += 5;
    } else if (listingType === 'recycling') {
        points += 20;
    }

    return points;
};
