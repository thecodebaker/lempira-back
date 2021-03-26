/* eslint-disable no-unused-vars */
const defaultError = (err, _req, res, _next) => {
  res.status(500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

const NotFound = (_req, res, _next) => {
  res.status(404).json({
    success: false,
    message: '🔍 Could not find the resource you were looking',
  });
};

const jwt = require('jsonwebtoken');
const user = require('./models/user.model');

const secret = process.env.SECRET;
const checkJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    // eslint-disable-next-line consistent-return
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      user.findOne({ email: decoded.email }).then((userDoc) => {
        req.user = userDoc;
        next();
      });
    });
  } else {
    res.sendStatus(401);
  }
};
module.exports = { defaultError, NotFound, checkJWT };
