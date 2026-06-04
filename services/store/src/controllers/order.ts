import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { IMenuItem } from "../models/MenuItems.js";
import Order from "../models/Order.js";
import Store, { IStore } from "../models/Store.js";
import { publishEvent } from "../config/order.publisher.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { paymentMethod, addressId } = req.body;

  if (!addressId) {
    return res.status(400).json({
      message: "Address is required",
    });
  }

  const address = await Address.findOne({
    _id: addressId,
    userId: user._id,
  });

  if (!address) {
    return res.status(404).json({
      message: "Address Not found",
    });
  }

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const cartItems = await Cart.find({ userId: user._id })
    .populate<{ itemId: IMenuItem }>("itemId")
    .populate<{ storeId: IStore }>("storeId");

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const firstCartItem = cartItems[0];

  if (!firstCartItem || !firstCartItem.storeId) {
    return res.status(400).json({
      message: "Invailid Cart Data",
    });
  }

  const storeId = firstCartItem.storeId._id;

  const store = await Store.findById(storeId);

  if (!store) {
    return res.status(404).json({
      message: "No store with this id",
    });
  }

  if (store.isOpen === false) {
    return res.status(400).json({
      message: "Sorry this store is closed for now",
    });
  }

  const distance = getDistanceKm(
    address.location.coordinates[1],
    address.location.coordinates[0],
    store.autoLocation.coordinates[1],
    store.autoLocation.coordinates[0]
  );

  let subtotal = 0;

  const orderItems = cartItems.map((cart) => {
    const item = cart.itemId;

    if (!item) {
      throw new Error("Invalid cart item");
    }

    const itemTotal = item.price * cart.quauntity;

    subtotal += itemTotal;

    return {
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      quauntity: cart.quauntity,
    };
  });

  const deliveryFee = subtotal < 250 ? 49 : 0;
  const platfromFee = 7;
  const totalAmount = subtotal + deliveryFee + platfromFee;

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const [longitude, latitude] = address.location.coordinates;

  const riderAmount = Math.ceil(distance) * 17;

  const order = await Order.create({
    userId: user._id.toString(),
    storeId: storeId.toString(),
    storeName: store.name,
    riderId: null,
    distance,
    riderAmount,
    items: orderItems,
    subtotal,
    deliveryFee,
    platfromFee,
    totalAmount,
    addressId: address._id.toString(),
    deliveryAddress: {
      fromattedAddress: address.formattedAddress,
      mobile: address.mobile,
      latitude,
      longitude,
    },

    paymentMethod,
    paymentStatus: "pending",
    status: "placed",
    expiresAt,
  });

  // Cart will be cleared after payment is confirmed (in payment consumer)

  res.json({
    message: "Order created successfully",
    orderId: order._id.toString(),
    amount: totalAmount,
  });
});

export const fetchOrderForPayment = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({
      message: "Order already paid",
    });
  }

  res.json({
    orderId: order._id,
    amount: order.totalAmount,
    currency: "INR",
  });
});

export const fetchStoreOrders = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { storeId } = req.params;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!storeId) {
      return res.status(400).json({
        message: "Store id is required",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({
      storeId,
      paymentStatus: "paid",
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  }
);

const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"] as const;

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { orderId } = req.params;
    const { status } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(404).json({
        message: "Order not completed",
      });
    }

    const store = await Store.findById(order.storeId);

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    if (store.ownerId !== user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to update this order",
      });
    }

    order.status = status;

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `user:${order.userId}`,
        payload: {
          orderId: order._id,
          status: order.status,
        },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    // now assign riders
    if (status === "ready_for_rider") {
      console.log(
        "Publishing Order ready for rider event for order",
        order._id
      );

      await publishEvent("ORDER_READY_FOR_RIDER", {
        orderId: order._id.toString(),
        storeId: store._id.toString(),
        location: store.autoLocation,
      });

      console.log("Event Published successfully");
    }

    res.json({
      message: "order status updated successfully",
      order,
    });
  }
);

export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const orders = await Order.find({
    userId: req.user._id.toString(),
    paymentStatus: "paid",
  }).sort({ createdAt: -1 });

  res.json({ orders });
});

export const fetchSingleOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to view this order",
      });
    }

    res.json(order);
  }
);

export const assignRiderToOrder = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId, riderId, riderName, riderPhone } = req.body;

  const orderAvailable = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  });

  if (orderAvailable) {
    return res.status(400).json({
      message: "You already have an order",
    });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.riderId) {
    return res.status(400).json({
      message: "Order Already taken",
    });
  }

  const orderUpdated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      $or: [{ riderId: null }, { riderId: { $exists: false } }],
    },
    {
      riderId,
      riderName,
      riderPhone,
      status: "rider_assigned",
    },
    { new: true }
  );

  if (!orderUpdated) {
    return res.status(400).json({
      message: "Order already taken",
    });
  }

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `user:${orderUpdated.userId}`,
      payload: orderUpdated,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `store:${orderUpdated.storeId}`,
      payload: orderUpdated,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );

  res.json({
    message: "Rider Assigned Successfully",
    success: true,
    order: orderUpdated,
  });
});

export const getCurrentOrderForRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { riderId } = req.query;

  if (!riderId) {
    return res.status(400).json({
      message: "Rider id is required",
    });
  }

  const order = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  }).populate("storeId");

  if (!order) {
    return res.status(404).json({
      message: "No active order for this rider",
    });
  }

  res.json(order);
});

export const updateOrderStatusRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.status === "rider_assigned") {
    order.status = "picked_up";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `store:${order.storeId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }

  if (order.status === "picked_up") {
    order.status = "delivered";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `store:${order.storeId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }
});

export const getRiderOrderHistory = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { riderId, page = "1", limit = "15", status = "delivered" } = req.query;

  if (!riderId) {
    return res.status(400).json({
      message: "Rider id is required",
    });
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 15));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {
    riderId: String(riderId),
  };

  if (status === "active") {
    filter.status = { $nin: ["delivered", "cancelled"] };
  } else if (status === "all") {
    filter.riderId = String(riderId);
  } else {
    filter.status = "delivered";
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const getRiderDashboardStats = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { riderId } = req.query;

  if (!riderId) {
    return res.status(400).json({
      message: "Rider id is required",
    });
  }

  const rid = String(riderId);
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const deliveredMatch = {
    riderId: rid,
    status: "delivered",
    paymentStatus: "paid",
  };

  const activeMatch = {
    riderId: rid,
    status: { $nin: ["delivered", "cancelled"] },
  };

  const [
    totalDelivered,
    earningsAgg,
    todayEarningsAgg,
    weekEarningsAgg,
    monthEarningsAgg,
    activeDeliveries,
    distanceAgg,
  ] = await Promise.all([
    Order.countDocuments(deliveredMatch),
    Order.aggregate([
      { $match: deliveredMatch },
      { $group: { _id: null, total: { $sum: "$riderAmount" } } },
    ]),
    Order.aggregate([
      {
        $match: { ...deliveredMatch, updatedAt: { $gte: startOfToday } },
      },
      { $group: { _id: null, total: { $sum: "$riderAmount" } } },
    ]),
    Order.aggregate([
      {
        $match: { ...deliveredMatch, updatedAt: { $gte: startOfWeek } },
      },
      { $group: { _id: null, total: { $sum: "$riderAmount" } } },
    ]),
    Order.aggregate([
      {
        $match: { ...deliveredMatch, updatedAt: { $gte: startOfMonth } },
      },
      { $group: { _id: null, total: { $sum: "$riderAmount" } } },
    ]),
    Order.countDocuments(activeMatch),
    Order.aggregate([
      { $match: deliveredMatch },
      { $group: { _id: null, total: { $sum: "$distance" } } },
    ]),
  ]);

  res.json({
    totalDelivered,
    totalEarnings: earningsAgg[0]?.total ?? 0,
    todayEarnings: todayEarningsAgg[0]?.total ?? 0,
    weekEarnings: weekEarningsAgg[0]?.total ?? 0,
    monthEarnings: monthEarningsAgg[0]?.total ?? 0,
    activeDeliveries,
    totalDistanceKm: Math.round((distanceAgg[0]?.total ?? 0) * 100) / 100,
  });
});
