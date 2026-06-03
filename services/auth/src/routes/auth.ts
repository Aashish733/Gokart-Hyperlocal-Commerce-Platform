import express from "express";
import { addUserRole, loginUser, myProfile, registerWithEmail, loginWithEmail } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser); // Google login
router.post("/register", registerWithEmail);
router.post("/login/email", loginWithEmail);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;
