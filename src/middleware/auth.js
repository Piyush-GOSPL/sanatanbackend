import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return sendError(res, 401, 'Access token is required', {});
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user || !user.isActive) {
      return sendError(res, 401, 'User is not active', {});
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token', { details: error.message });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required', {});
  }

  if (roles.length && !roles.includes(req.user.role)) {
    return sendError(res, 403, 'Forbidden: insufficient permissions', {});
  }

  next();
};
