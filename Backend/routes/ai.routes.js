import { Router } from "express";
import * as ai_controller from "../controllers/ai.controller.js";

const router = Router();

router.get("/get-result", ai_controller.generateResult);

export default router;
