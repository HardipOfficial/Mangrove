const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: userObj,
  });
};

module.exports = { generateToken, generateRefreshToken, sendTokenResponse };
