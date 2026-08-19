import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      return sendError(res, 400, 'Invalid credentials', {});
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const roleDisplay = user.role === 'Admin' ? 'Super Admin' : user.role;

    return sendSuccess(res, 200, {
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleDisplay,
        access: accessToken,
        refresh: refreshToken,
        expires_in: 15 * 60,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Login failed', { details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refresh } = req.body;

    if (!refresh) {
      return sendError(res, 400, 'Refresh token is required', {});
    }

    jwt.verify(refresh, env.jwtRefreshSecret);

    return sendSuccess(res, 200, {
      message: 'Logout successful',
      data: {},
    });
  } catch (error) {
    return sendError(res, 400, 'Invalid or expired token', { details: error.message });
  }
};
