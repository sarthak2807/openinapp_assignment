
const User = require('../models/user');
// Implement the getUserPriority function
const secretKey = 'your-secret-key'; // Replace with your actual secret key

// Function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
};

// Get User Priority
exports.getUserPriority = async (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ priority: user.priority });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
