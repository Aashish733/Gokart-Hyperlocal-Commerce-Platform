import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Store from "../models/Store.js";
import jwt from "jsonwebtoken";

export const addRestraunt = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const existingRestaunrant = await Store.findOne({
    ownerId: user._id,
  });

  if (existingRestaunrant) {
    return res.status(400).json({
      message: "You already have a store",
    });
  }

  const { name, description, serviceType, latitude, longitude, formattedAddress, phone } =
    req.body;

  if (!name || !latitude || !longitude) {
    return res.status(400).json({
      message: "Please give all details",
    });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Please give image",
    });
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content) {
    return res.status(500).json({
      message: "Failed to create file buffer",
    });
  }

  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVICE}/api/upload`,
    {
      buffer: fileBuffer.content,
    }
  );

  const store = await Store.create({
    name,
    description,
    serviceType: serviceType || 'food',
    phone,
    image: uploadResult.url,
    ownerId: user._id,
    autoLocation: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
      formattedAddress,
    },
    isVerified: false,
  });

  return res.status(201).json({
    message: "Store created successfully",
    store,
  });
});

export const fetchMyStore = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please Login",
      });
    }
    const store = await Store.findOne({ ownerId: req.user._id });

    if (!store) {
      return res.status(400).json({
        message: "No Store found",
      });
    }

    if (!req.user.storeId) {
      const token = jwt.sign(
        {
          user: {
            ...req.user,
            storeId: store._id,
          },
        },
        process.env.JWT_SEC as string,
        {
          expiresIn: "15d",
        }
      );

      return res.json({ store, token });
    }

    res.json({ store });
  }
);

export const updateStatusStore = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({
        message: "Status must be boolean",
      });
    }

    const store = await Store.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      { isOpen: status },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.json({
      message: "Store status Updated",
      store,
    });
  }
);

export const updateStore = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { name, description } = req.body;

    const store = await Store.findOneAndUpdate(
      { ownerId: req.user._id },
      { name: name, description: description },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.json({
      message: "Store Updated",
      store,
    });
  }
);

export const getNearbyStore = TryCatch(async (req, res) => {
  const { latitude, longitude, radius = 5000, search = "", serviceType } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      message: "Latitude and longitude are required",
    });
  }

  const query: any = {
    isVerified: true,
  };

  if (serviceType && typeof serviceType === "string") {
    query.serviceType = serviceType;
  } else {
    query.serviceType = "food";
  }

  if (search && typeof search === "string") {
    query.name = { $regex: search, $options: "i" };
  }

  const stores = await Store.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        maxDistance: Number(radius),
        spherical: true,
        query,
      },
    },
    {
      $sort: {
        isOpen: -1,
        distance: 1,
      },
    },
    {
      $addFields: {
        distanceKm: {
          $round: [{ $divide: ["$distance", 1000] }, 2],
        },
      },
    },
  ]);

  res.json({
    success: true,
    count: stores.length,
    stores,
  });
});

export const fetchSingleStore = TryCatch(async (req, res) => {
  const store = await Store.findById(req.params.id);
  res.json(store);
});
