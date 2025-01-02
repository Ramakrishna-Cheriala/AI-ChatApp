import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import BlacklistToken from "../models/token.model.js";
import User from "../models/user.model.js";

export const createUserController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }
    const user = await userService.createUser(req.body);

    const token = await user.generateJWT();

    res
      .status(201)
      .json({ success: true, message: "Registration successful", user, token });
  } catch (error) {
    console.log(error);
  }
};

export const loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "User dose not exists" });
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = await user.generateJWT();

    delete user._doc.password;

    res
      .status(200)
      .json({ success: true, message: "Login successful", user, token });
  } catch (error) {
    console.log(error);
  }
};

export const profileController = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    await BlacklistToken.create({ token });

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {}
};

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUser = await User.findOne({ email: req.user.email });

    const users = await User.find({ _id: { $ne: loggedInUser._id } });

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.params.query;
    console.log(searchTerm);

    const users = await User.find({
      $or: [{ email: { $regex: searchTerm, $options: "i" } }],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
