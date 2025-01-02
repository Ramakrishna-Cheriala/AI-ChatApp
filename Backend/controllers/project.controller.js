import mongoose from "mongoose";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const logedInUser = await User.findOne({ email: req.user.email });

    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(400).json({ error: "Project already exists" });
    }

    const newProject = await projectService.createProject(
      name,
      logedInUser._id
    );

    return res
      .status(201)
      .json({ message: "Project created successfully", newProject });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const logedInUser = await User.findOne({ email: req.user.email });

    const projects = await Project.find({ users: logedInUser._id });

    // .populate({
    //   path: "users",
    //   select: "email",
    // });

    return res.status(200).send({ projects });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const logedInUser = await User.findOne({ email: req.user.email });
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await projectService.getProjectById(
      projectId,
      logedInUser._id
    );

    return res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const projecyId = req.params.id;
    const { users } = req.body;

    const loggedInUser = await User.findOne({ email: req.user.email });

    const project = await projectService.addUserToProject(
      projecyId,
      users,
      loggedInUser._id
    );

    return res
      .status(200)
      .json({ message: "Users added successfully", project });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
};
