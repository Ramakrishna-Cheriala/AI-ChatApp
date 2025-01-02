import jwt from "jsonwebtoken";
import BlacklistToken from "../models/token.model.js";

export const authUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1] || req.cookies.token;

    if (!token) {
      return res.status(401).send({ error: "Login Required" });
    }

    const isBlacklisted = await BlacklistToken.findOne({ token });

    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token is blacklisted. Please log in again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ error: "Authentication Failed" });
  }
};
