export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Validation failed',
      data: result.error.flatten(),
    });
  }

  req.body = result.data;
  next();
};
