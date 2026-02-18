const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Use environment variable for production

const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Could not generate token');
  }
};

module.exports = {
  generateToken,
};
