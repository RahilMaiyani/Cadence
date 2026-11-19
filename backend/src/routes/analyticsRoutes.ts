import { Router } from "express";
import { getDashboardData, getDateDetails, getHeatmap } from "../controllers/analyticsController";
import { protect } from "../middleware/authMiddleware";

const analyticsRouter = Router()

analyticsRouter.use(protect);

analyticsRouter.get('/dashboard', getDashboardData);
analyticsRouter.get('/heatmap', getHeatmap);
analyticsRouter.get('/date/:date', getDateDetails);

export default analyticsRouter;