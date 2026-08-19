import { prisma } from '../config/db.js';

const businessId = (value) => {
  if (!/^\d+$/.test(String(value))) {
    const error = new Error('Business id must be a positive integer');
    error.status = 400;
    throw error;
  }

  return BigInt(value);
};

const isMissingBusinessTable = (error) =>
  error?.code === 'P2021';

export const getBusinesses = async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    res.json({
      success: true,
      status: 200,
      data: businesses.map((business) => ({
        ...business,
        id: business.id.toString(),
      })),
    });
  } catch (error) {
    if (isMissingBusinessTable(error)) {
      return res.json({
        success: true,
        status: 200,
        data: [],
        message: 'No business records are available in the configured database.',
      });
    }

    console.error('Could not fetch businesses:', error);

    res.status(500).json({
      success: false,
      status: 500,
      message: 'Could not fetch businesses',
      data: {
        details: error.message,
      },
    });
  }
};

export const getBusinessById = async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId(req.params.id) },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Business not found',
      });
    }

    res.json({
      success: true,
      status: 200,
      data: {
        ...business,
        id: business.id.toString(),
      },
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: error.message,
      });
    }

    if (isMissingBusinessTable(error)) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Business not found',
      });
    }

    console.error('Could not fetch business:', error);

    res.status(500).json({
      success: false,
      status: 500,
      message: 'Could not fetch business',
      data: {
        details: error.message,
      },
    });
  }
};

export const updateBusinessStatus = async (req, res) => {
  try {
    const allowedStatuses = new Set(['Pending', 'Approved', 'Rejected', 'Delist']);
    const { status } = req.body;

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Invalid business status',
      });
    }

    const business = await prisma.business.update({
      where: { id: businessId(req.params.id) },
      data: {
        status,
        reviewedat: new Date(),
      },
    });

    return res.json({
      success: true,
      status: 200,
      data: { ...business, id: business.id.toString() },
    });
  } catch (error) {
    if (isMissingBusinessTable(error)) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Business not found',
      });
    }

    const status = error.status || 400;
    console.error('Could not update business status:', error);

    return res.status(status).json({
      success: false,
      status,
      message: 'Could not update business status',
      data: { details: error.message },
    });
  }
};