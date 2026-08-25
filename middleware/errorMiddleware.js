/**
 * @desc    404 Route Not Found Middleware Handler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * @desc    Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // If status code is 200, default to 500 Internal Server Error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
