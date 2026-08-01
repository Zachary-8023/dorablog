import express from "express";
import {
  updateUser,
  getAllUsers,
  createUser,
  deleteUser,
  getUserWithUserId
} from "../../data/users-dao.js";
import { requireAuth } from "../../middleware/auth.js";
import { hashPassword } from "../../utils/password-utils.js";

const router = express.Router();
/**
 * Sending a GET request to /api/users/ will return an array of all users in the system.
 *
 * This route is protected by the requireAuth middleware, so only admin users can access it.
 * Returns 401 if unauthenticated, 403 if authenticated but not admin.
 */
router.get("/", requireAuth, (req, res) => {
  // Check if user is admin
  if (!req.user.admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  getAllUsers().then((users) => {
    return res.status(200).json(users);
  });
});

/**
 * Sending a GET request to /api/users/me will return the user info for the currently authenticated user,
 * or return a 401 if there's an authentication error.
 *
 * The authentication functionality is handled by the requireAuth middleware, which adds the user
 * info to req.user. So we just need to return that.
 */
router.get("/me", requireAuth, (req, res) => {
  return res.json(req.user);
});

/**
 * Sending a PATCH request to /api/users/me will allow requesters to update the currently authenticated user's
 * username, password, realname, description, and avatarUrl.
 *
 * If there is no currently authenticated user, a 401 response is returned (handled by requireAuth middleware).
 *
 * If the "update user" info in req.body is invalid, a 422 response is returned.
 *
 * Otherwise, the user info is updated and a 200 response with updated user is returned.
 */
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If password is being updated, hash it and store as passwordHash
    if (updateData.password) {
      updateData.passwordHash = await hashPassword(updateData.password);
      delete updateData.password; // Remove plain password
    }

    const updatedUser = await updateUser(req.user.id, updateData);

    // Remove password hash from response
    delete updatedUser.passwordHash;
    delete updatedUser.password;

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(422).json({ error: error.message });
  }
});

/**
 * Sending a POST request to /api/users/ will create a new user with the given info in req.body.
 * If successful, a 200 response is returned with the created user info.
 * If there's an error, a 500 response is returned.
 */
router.post("/Info", (req, res) => {
  try {
    const userInfo = req.body;
    createUser(userInfo).then((newUser) => {
      return res.status(200).json(newUser);
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a DELETE request to /api/users/me will delete the currently authenticated user's account,
 * along with all their articles and comments (CASCADE).
 *
 * If there is no currently authenticated user, a 401 response is returned.
 *
 * Otherwise, the user is deleted and a 204 response is returned.
 */
router.delete("/me", requireAuth, async (req, res) => {
  try {
    await deleteUser(req.user.id);
    // Clear the auth cookie
    res.clearCookie("token");
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

/**
 * Sending a DELETE request to /api/users/:id will delete the user with the given id (admin only),
 * along with all their articles and comments (CASCADE).
 *
 * If the requestor is unauthenticated, it should return 401.
 * If the user is authenticated but not an admin, it should return 403.
 * Otherwise, the user is deleted and a 204 response is returned.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.admin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const userId = parseInt(req.params.id);

    // Check if user exists
    const user = await getUserWithUserId(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await deleteUser(userId);
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
