import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { createHabit, deleteHabit, getHabits, toggleHabit, updateHabit } from "../controllers/habitController";
import { createHabitSchema, toggleHabitSchema, updateHabitSchema } from "../validations/habitValidation";
import { validate } from "../middleware/validate";

const habitRouter = Router();

habitRouter.use(protect);

habitRouter.get("/", getHabits);
habitRouter.post("/", validate(createHabitSchema), createHabit);
habitRouter.put("/:id", validate(updateHabitSchema), updateHabit);
habitRouter.delete("/:id", deleteHabit);
habitRouter.post("/:id/toggle", validate(toggleHabitSchema), toggleHabit);

export default habitRouter;