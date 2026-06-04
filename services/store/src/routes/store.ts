import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  addRestraunt,
  fetchMyStore,
  fetchSingleStore,
  getNearbyStore,
  updateStore,
  updateStatusStore,
} from "../controllers/store.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestraunt);
router.get("/my", isAuth, isSeller, fetchMyStore);
router.put("/status", isAuth, isSeller, updateStatusStore);
router.put("/edit", isAuth, isSeller, updateStore);
router.get("/all", isAuth, getNearbyStore);
router.get("/:id", isAuth, fetchSingleStore);

export default router;
