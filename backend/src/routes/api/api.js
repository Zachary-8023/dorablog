import express from "express";

const router = express.Router();

// import child routes
// import tempRoutes from "./api-temp.js";
// router.use("/messages", tempRoutes);
import authRoutes from "./api-auth.js";
router.use("/auth", authRoutes);
import userRoutes from "./api-users.js";
router.use("/users", userRoutes);
import articleRoutes from "./api-articles.js";
router.use("/articles", articleRoutes);
import commentRoutes from "./api-comments.js";
router.use("/comments", commentRoutes);

export default router;
