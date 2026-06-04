import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Rider Image is required",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to generate image buffer",
      });
    }

    let uploadResult: { url: string };
    try {
      const { data } = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        {
          buffer: fileBuffer.content,
        }
      );
      uploadResult = data;
    } catch (uploadError: any) {
      console.error("Rider image upload failed:", uploadError.message);
      return res.status(502).json({
        message:
          uploadError.response?.data?.message ||
          "Image upload failed. Ensure utils service is running and Cloudinary is configured.",
      });
    }

    const {
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !phoneNumber ||
      !aadharNumber ||
      !drivingLicenseNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingProfile = await Rider.findOne({
      userId: user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Rider profile already exists",
      });
    }

    const riderProfile = await Rider.create({
      userId: user._id,
      picture: uploadResult.url,
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      isAvailble: false,
      isVerified: false,
    });

    return res.status(201).json({
      message: "Rider profile created successfully",
      riderProfile,
    });
  }
);

export const fetchMyProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const account = await Rider.findOne({ userId: user._id });

    res.json(account);
  }
);

export const toggleRiderAvailablity = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const { isAvailble, latitude, longitude } = req.body;

    if (typeof isAvailble !== "boolean") {
      return res.status(400).json({
        message: "isAvailble must be boolean",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "location is required",
      });
    }

    const rider = await Rider.findOne({
      userId: user._id,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider profile not found",
      });
    }

    if (isAvailble && !rider.isVerified) {
      return res.status(403).json({
        message: "Rider is not verified",
      });
    }

    rider.isAvailble = isAvailble;

    rider.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    rider.lastActiveAt = new Date();

    await rider.save();

    res.json({
      message: isAvailble ? "Rider is now online" : "Rider is now offline",
      rider,
    });
  }
);

export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  const { orderId } = req.params;

  if (!riderUserId) {
    return res.status(400).json({
      message: "Please Login",
    });
  }

  const rider = await Rider.findOne({ userId: riderUserId, isAvailble: true });

  if (!rider) {
    return res.status(404).json({ message: "rider not found" });
  }

  try {
    const { data } = await axios.put(
      `${process.env.STORE_SERVICE}/api/order/assign/rider`,
      {
        orderId,
        riderId: rider._id.toString(),
        riderUserId: rider.userId,
        riderName: rider.picture,
        riderPhone: rider.phoneNumber,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    if (data.success) {
      const riderDetails = await Rider.findOneAndUpdate(
        {
          userId: riderUserId,
          isAvailble: true,
        },
        { isAvailble: false },
        { new: true }
      );

      res.json({ message: "Order accepted" });
    }
  } catch (error) {
    res.status(400).json({
      message: "Order already taken",
    });
  }
});

export const fetchMyCurrentOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;

    if (!riderUserId) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const rider = await Rider.findOne({ userId: riderUserId });

    if (!rider) {
      return res.json({ order: null });
    }

    if (!process.env.STORE_SERVICE || !process.env.INTERNAL_SERVICE_KEY) {
      return res.status(500).json({
        message: "Server misconfiguration: STORE_SERVICE or INTERNAL_SERVICE_KEY missing",
      });
    }

    try {
      const { data } = await axios.get(
        `${process.env.STORE_SERVICE}/api/order/current/rider?riderId=${rider._id}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        }
      );

      res.json({
        order: data ?? null,
      });
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        return res.json({ order: null });
      }
      console.error("fetchMyCurrentOrder store error:", error.message);
      return res.status(502).json({
        message:
          error.response?.data?.message ||
          "Could not fetch current order from store service",
      });
    }
  }
);

const getRiderForUser = async (userId: string) => {
  return Rider.findOne({ userId });
};

const storeHeaders = () => ({
  headers: {
    "x-internal-key": process.env.INTERNAL_SERVICE_KEY as string,
  },
});

export const fetchRiderDashboardStats = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const rider = await getRiderForUser(req.user?._id as string);

    if (!rider) {
      return res.json({
        totalDelivered: 0,
        totalEarnings: 0,
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: 0,
        activeDeliveries: 0,
        totalDistanceKm: 0,
      });
    }

    try {
      const { data } = await axios.get(
        `${process.env.STORE_SERVICE}/api/order/stats/rider?riderId=${rider._id}`,
        storeHeaders()
      );
      res.json(data);
    } catch (error: any) {
      console.error("fetchRiderDashboardStats:", error.message);
      return res.status(502).json({
        message: "Could not load dashboard stats",
      });
    }
  }
);

export const fetchRiderOrderHistory = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const rider = await getRiderForUser(req.user?._id as string);

    if (!rider) {
      return res.json({
        orders: [],
        pagination: { page: 1, limit: 15, total: 0, pages: 1 },
      });
    }

    const { page, limit, status } = req.query;

    try {
      const { data } = await axios.get(
        `${process.env.STORE_SERVICE}/api/order/history/rider`,
        {
          params: {
            riderId: rider._id,
            page,
            limit,
            status: status || "delivered",
          },
          ...storeHeaders(),
        }
      );
      res.json(data);
    } catch (error: any) {
      console.error("fetchRiderOrderHistory:", error.message);
      return res.status(502).json({
        message: "Could not load order history",
      });
    }
  }
);

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({ userId: userId });

    if (!rider) {
      return res.status(404).json({
        message: "Please Login",
      });
    }

    const { orderId } = req.params;

    try {
      const { data } = await axios.put(
        `${process.env.STORE_SERVICE}/api/order/update/status/rider`,
        { orderId },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        }
      );

      res.json({
        message: data.message,
      });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        message: error.response.data.message,
      });
    }
  }
);
