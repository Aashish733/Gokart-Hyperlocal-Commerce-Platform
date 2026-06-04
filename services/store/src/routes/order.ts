import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  assignRiderToOrder,
  createOrder,
  fetchOrderForPayment,
  fetchStoreOrders,
  fetchSingleOrder,
  getCurrentOrderForRider,
  getRiderDashboardStats,
  getRiderOrderHistory,
  getMyOrders,
  updateOrderStatus,
  updateOrderStatusRider,
} from "../controllers/order.js";

const router = express.Router();

// Static paths must be registered before /:id and /:orderId
router.get("/myorder", isAuth, getMyOrders);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/current/rider", getCurrentOrderForRider);
router.get("/history/rider", getRiderOrderHistory);
router.get("/stats/rider", getRiderDashboardStats);
router.get("/store/:storeId", isAuth, isSeller, fetchStoreOrders);
router.put("/assign/rider", assignRiderToOrder);
router.put("/update/status/rider", updateOrderStatusRider);
router.post("/new", isAuth, createOrder);
router.get("/:id", isAuth, fetchSingleOrder);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);

export default router;
