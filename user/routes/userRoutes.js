import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import { getUser, updateUser, register, signIn} from "../controllers/userController.js";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

//ip rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// REGISTER
router.post("/register", limiter, register);

// SIGN IN
router.post("/login", signIn);

// GET user
router.post("/get-user", userAuth, getUser);

// UPDATE USER || PUT
router.put("/update-user", userAuth, updateUser);




export default router;
