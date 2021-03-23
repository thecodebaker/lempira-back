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

module.exports = { defaultError, NotFound };
