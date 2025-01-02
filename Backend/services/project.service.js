import mongoose from "mongoose";
import Project from "../models/project.model.js";

export const createProject = async (name, userId) => {
  if (!userId && !name) {
    throw new Error("Name and user are required");
  }

  const project = await Project.create({ name, users: [userId] });

  return project;
};

export const getProjectById = async (projectId, logedInUserId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const project = await Project.findOne({
    _id: projectId,
    users: logedInUserId,
  }).populate({
    path: "users",
    select: "email",
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

export const addUserToProject = async (projectId, users, logedInUserId) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!users) {
    throw new Error("users are required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!logedInUserId) {
    throw new Error("userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(logedInUserId)) {
    throw new Error("Invalid userId");
  }

  const project = await Project.findOne({
    _id: projectId,
    users: logedInUserId,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const updatedProject = await Project.findOneAndUpdate(
    {
      _id: projectId,
    },
    {
      $addToSet: { users: { $each: users } },
    },
    {
      new: true,
    }
  );

  return updatedProject;
};
