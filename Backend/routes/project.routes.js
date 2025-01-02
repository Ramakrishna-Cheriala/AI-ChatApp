import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  body("name").isString().withMessage("Name is required"),
  authMiddleware.authUser,
  projectController.createProject
);

router.get("/all", authMiddleware.authUser, projectController.getAllProjects);

router.get("/:id", authMiddleware.authUser, projectController.getProjectById);

router.put(
  "/add-user/:id",
  authMiddleware.authUser,
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUserToProject
);

export default router;
