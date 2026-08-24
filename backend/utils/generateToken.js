const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1000d', // Token berlaku selama 1000 hari
  });
};

module.exports = generateToken;