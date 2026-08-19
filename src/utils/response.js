export const sendSuccess = (res, status = 200, payload = {}) => res.status(status).json({
  success: true,
  status,
  ...payload,
});

export const sendError = (res, status = 400, message = 'Request failed', data = {}) => res.status(status).json({
  success: false,
  status,
  message,
  data,
});
