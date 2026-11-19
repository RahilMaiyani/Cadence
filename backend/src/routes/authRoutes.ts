import { Router } from "express";
import { getMe, login, logout, register } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validations/authValidation";

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.get("/me", protect, getMe);

export default authRouter;