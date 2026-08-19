import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';

const parseListField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const normalizeTempleRecord = (temple) => ({
  ...temple,
  city: temple.city,
  main_deity: temple.mainDeity,
  images: temple.images || [],
  service_offered: typeof temple.service_offered === 'string' ? parseListField(temple.service_offered) : temple.service_offered,
  facilities_offered: typeof temple.facilities_offered === 'string' ? parseListField(temple.facilities_offered) : temple.facilities_offered,
});

export const listTemples = async (req, res) => {
  try {
    const { city, deity, temple } = req.query;

    const where = {};
    if (city) where.cityId = Number(city);
    if (deity) where.mainDeityId = Number(deity);
    if (temple) where.id = Number(temple);

    const temples = await prisma.temple.findMany({
      where,
      include: {
        city: true,
        mainDeity: true,
        images: true,
      },
      orderBy: { id: 'asc' },
    });

    return sendSuccess(res, 200, { data: temples.map(normalizeTempleRecord) });
  } catch (error) {
    return sendError(res, 500, 'Could not fetch temples', { details: error.message });
  }
};

export const createTemple = async (req, res) => {
  try {
    const payload = {
      mandir_name: req.body.mandir_name,
      full_address: req.body.full_address,
      cityId: Number(req.body.city_id),
      year_established: Number(req.body.year_established),
      mainDeityId: Number(req.body.main_deity_id),
      description: req.body.description,
      phone_no: req.body.phone_no,
      email: req.body.email,
      website: req.body.website,
      opening_hours: req.body.opening_hours,
      service_offered: JSON.stringify(parseListField(req.body.service_offered || [])),
      facilities_offered: JSON.stringify(parseListField(req.body.facilities_offered || [])),
      your_name: req.body.your_name,
      your_email: req.body.your_email,
      rating: Number(req.body.rating || 0),
      location: req.body.location,
      status: req.body.status || 'Pending',
      role: req.body.role || 'devotee',
    };

    const temple = await prisma.temple.create({
      data: payload,
      include: {
        city: true,
        mainDeity: true,
        images: true,
      },
    });

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length) {
      await Promise.all(files.slice(0, env.maxUploadFiles).map(async (file) => {
        await prisma.templeImage.create({
          data: {
            templeId: temple.id,
            file: file.path,
          },
        });
      }));
    }

    const savedTemple = await prisma.temple.findUnique({
      where: { id: temple.id },
      include: { city: true, mainDeity: true, images: true },
    });

    return sendSuccess(res, 201, { data: normalizeTempleRecord(savedTemple), message: 'Temple created successfully' });
  } catch (error) {
    return sendError(res, 400, 'Could not create temple', { details: error.message });
  }
};

export const getTemple = async (req, res) => {
  try {
    const temple = await prisma.temple.findUnique({
      where: { id: Number(req.params.id) },
      include: { city: true, mainDeity: true, images: true },
    });

    if (!temple) return sendError(res, 404, 'Temple not found', {});
    return sendSuccess(res, 200, { data: normalizeTempleRecord(temple) });
  } catch (error) {
    return sendError(res, 500, 'Could not fetch temple', { details: error.message });
  }
};

export const updateTemple = async (req, res) => {
  try {
    const current = await prisma.temple.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });

    if (!current) return sendError(res, 404, 'Temple not found', {});

    const rawPayload = {
      mandir_name: req.body.mandir_name,
      full_address: req.body.full_address,
      cityId: req.body.city_id ? Number(req.body.city_id) : undefined,
      year_established: req.body.year_established ? Number(req.body.year_established) : undefined,
      mainDeityId: req.body.main_deity_id ? Number(req.body.main_deity_id) : undefined,
      description: req.body.description,
      phone_no: req.body.phone_no,
      email: req.body.email,
      website: req.body.website,
      opening_hours: req.body.opening_hours,
      service_offered: req.body.service_offered !== undefined ? JSON.stringify(parseListField(req.body.service_offered || [])) : undefined,
      facilities_offered: req.body.facilities_offered !== undefined ? JSON.stringify(parseListField(req.body.facilities_offered || [])) : undefined,
      your_name: req.body.your_name,
      your_email: req.body.your_email,
      rating: req.body.rating !== undefined ? Number(req.body.rating) : undefined,
      location: req.body.location,
      status: req.body.status,
      role: req.body.role,
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, value]) => value !== undefined)
    );

    const temple = await prisma.temple.update({
      where: { id: Number(req.params.id) },
      data: cleanedPayload,
      include: { city: true, mainDeity: true, images: true },
    });

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length) {
      await prisma.templeImage.deleteMany({ where: { templeId: temple.id } });
      await Promise.all(files.slice(0, env.maxUploadFiles).map(async (file) => {
        await prisma.templeImage.create({
          data: {
            templeId: temple.id,
            file: file.path,
          },
        });
      }));
    }

    const updated = await prisma.temple.findUnique({
      where: { id: temple.id },
      include: { city: true, mainDeity: true, images: true },
    });

    return sendSuccess(res, 200, { data: normalizeTempleRecord(updated), message: 'Temple updated successfully' });
  } catch (error) {
    return sendError(res, 400, 'Could not update temple', { details: error.message });
  }
};

export const deleteTemple = async (req, res) => {
  try {
    const temple = await prisma.temple.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });

    if (!temple) return sendError(res, 404, 'Temple not found', {});

    for (const image of temple.images) {
      await fs.rm(image.file, { force: true });
    }

    await prisma.temple.delete({ where: { id: Number(req.params.id) } });
    return sendSuccess(res, 200, { message: 'Temple deleted successfully', data: {} });
  } catch (error) {
    return sendError(res, 400, 'Could not delete temple', { details: error.message });
  }
};

export const updateTempleStatus = async (req, res) => {
  try {
    const temple = await prisma.temple.update({
      where: { id: Number(req.params.id) },
      data: { status: req.body.status },
      include: { city: true, mainDeity: true, images: true },
    });

    return sendSuccess(res, 200, {
      message: 'Temple status updated successfully',
      data: normalizeTempleRecord(temple),
    });
  } catch (error) {
    return sendError(res, 400, 'Failed to update status', { details: error.message });
  }
};
