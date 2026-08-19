import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listCities = async (_req, res) => {
  try {
    const cities = await prisma.city.findMany({ orderBy: { id: 'asc' } });
    return sendSuccess(res, 200, { data: cities });
  } catch (error) {
    return sendError(res, 500, 'Could not fetch cities', { details: error.message });
  }
};

export const createCity = async (req, res) => {
  try {
    const city = await prisma.city.create({ data: { name: req.body.name } });
    return sendSuccess(res, 201, { data: city, message: 'City created successfully' });
  } catch (error) {
    return sendError(res, 400, 'Could not create city', { details: error.message });
  }
};

export const getCity = async (req, res) => {
  try {
    const city = await prisma.city.findUnique({ where: { id: Number(req.params.id) } });
    if (!city) return sendError(res, 404, 'City not found', {});
    return sendSuccess(res, 200, { data: city });
  } catch (error) {
    return sendError(res, 500, 'Could not fetch city', { details: error.message });
  }
};

export const updateCity = async (req, res) => {
  try {
    const city = await prisma.city.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name },
    });
    return sendSuccess(res, 200, { data: city, message: 'City updated successfully' });
  } catch (error) {
    return sendError(res, 400, 'Could not update city', { details: error.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    await prisma.city.delete({ where: { id: Number(req.params.id) } });
    return sendSuccess(res, 200, { message: 'City deleted successfully', data: {} });
  } catch (error) {
    return sendError(res, 400, 'Could not delete city', { details: error.message });
  }
};
