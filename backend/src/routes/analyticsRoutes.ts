import { Router } from "express";
import { getHabitAnalytics, getHeatmap, getSummaryStats } from "../controllers/analyticsController";
import { protect } from "../middleware/authMiddleware";

const analyticsRouter = Router()

analyticsRouter.use(protect);

analyticsRouter.get("/heatmap", getHeatmap);
analyticsRouter.get("/habit/:id", getHabitAnalytics);
analyticsRouter.get("/summary", getSummaryStats);

export default analyticsRouter;