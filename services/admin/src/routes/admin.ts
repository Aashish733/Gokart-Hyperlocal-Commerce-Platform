import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  getPendingStore,
  getPendingRiders,
  verifyStore,
  verifyRider,
} from "../controllers/admin.js";

const router = express.Router();

router.get("/admin/store/pending", isAuth, isAdmin, getPendingStore);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);
router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/store/:id", isAuth, isAdmin, verifyStore);

export default router;
