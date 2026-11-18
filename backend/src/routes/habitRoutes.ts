import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { validate } from "zod";
import { getHabits } from "../controllers/habitController";

const habitRouter = Router();

habitRouter.use(protect);

habitRouter.get("/", getHabits);

export default habitRouter;