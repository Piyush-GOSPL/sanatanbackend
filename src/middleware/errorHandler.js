export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    status,
    message: err.message || 'Internal server error',
    data: {
      details: err.details || null,
    },
  });
};
