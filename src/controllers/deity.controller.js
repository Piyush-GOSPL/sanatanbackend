import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listDeities = async (_req, res) => {
  try {
    const deities = await prisma.deity.findMany({ orderBy: { id: 'asc' } });
    return sendSuccess(res, 200, { data: deities });
  } catch (error) {
    return sendError(res, 500, 'Could not fetch deities', { details: error.message });
  }
};

export const createDeity = async (req, res) => {
  try {
    const deity = await prisma.deity.create({ data: { name: req.body.name } });
    return sendSuccess(res, 201, { data: deity, message: 'Deity created successfully' });
  } catch (error) {
    return sendError(res, 400, 'Could not create deity', { details: error.message });
  }
};

export const getDeity = async (req, res) => {
  try {
    const deity = await prisma.deity.findUnique({ where: { id: Number(req.params.id) } });
    if (!deity) return sendError(res, 404, 'Deity not found', {});
    return sendSuccess(res, 200, { data: deity });
  } catch (error) {
    return sendError(res, 500, 'Could not fetch deity', { details: error.message });
  }
};

export const updateDeity = async (req, res) => {
  try {
    const deity = await prisma.deity.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name },
    });
    return sendSuccess(res, 200, { data: deity, message: 'Deity updated successfully' });
  } catch (error) {
    return sendError(res, 400, 'Could not update deity', { details: error.message });
  }
};

export const deleteDeity = async (req, res) => {
  try {
    await prisma.deity.delete({ where: { id: Number(req.params.id) } });
    return sendSuccess(res, 200, { message: 'Deity deleted successfully', data: {} });
  } catch (error) {
    return sendError(res, 400, 'Could not delete deity', { details: error.message });
  }
};
