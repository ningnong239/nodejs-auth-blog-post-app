import { Router } from "express";

const authRouter = Router();

import { db } from "../utils/db.js";

authRouter.post("/register", async (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  if (!username || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const usersCollection = db.collection("users");

  // Check if username already exists
  const existingUser = await usersCollection.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Insert new user
  await usersCollection.insertOne({
    username,
    password,
    firstName,
    lastName,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return res.json({ message: "User has been created successfully" });
});

import jwt from "jsonwebtoken";

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const usersCollection = db.collection("users");
  const user = await usersCollection.findOne({ username });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    "secret-key", // In production, use process.env.JWT_SECRET
    { expiresIn: "1h" }
  );

  return res.json({
    message: "login successfully",
    token,
  });
});

export default authRouter;
