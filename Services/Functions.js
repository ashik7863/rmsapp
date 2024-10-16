const crypto = require('crypto');
// Function to generate MD5 hash
const HashPassword = (password) => {
    return crypto.createHash('md5').update(password).digest('hex');
};

module.exports={HashPassword};