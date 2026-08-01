
import yup from "yup";
import { getDatabase } from "./database.js";

/**
 * Gets all users in the database.
 * 
 * @returns array of user objects
 */
export async function getAllUsers() {
  const db = await getDatabase();
  const users = await db.all("SELECT * FROM Users");
  return users;
}

/**
 * Gets the user with the given username, if it exists.
 * 
 * @param {number} userId the user id
 * @returns usrer object if found, null otherwise
 */
export async function getUserWithUserId(userId) {
  const db = await getDatabase();
  const user = await db.get("SELECT * FROM Users WHERE id = ?", userId);
  return user;
}

/**
 * Gets the user with the given username, if it exists.
 * @param {string} username the user name
 * @returns user object if found, null otherwise
 */
export async function getUserWithusername(username) {
  const db = await getDatabase();
  const user = await db.get("SELECT * FROM Users WHERE username = ?", username);
  return user;
}

/**
 * Gets the user with the given username and password, if it exists.
 *
 * @param {string} username the username to search
 * @param {string} password the password to search
 * @returns the user with the given credentials, or undefined.
 */
export async function getUserWithCredentials(username, password) {
  const db = await getDatabase();
  const user = await db.get("SELECT * FROM Users WHERE username = ? AND password = ?", username, password);
  return user;
}

/**
 * Schema for "update user". We can optionally supply a username, password/passwordHash, realname, admin, 
 * description, birthdate, and / or avatarUrl. We cannot edit the id,
 * or supply any other random data.
 */
const updateUserSchema = yup
  .object({
    username: yup.string().min(1).optional(),
    password: yup.string().min(5).optional(),
    passwordHash: yup.string().optional(),
    realname: yup.string().optional(),
    birthdate: yup.string().optional(),
    admin: yup.boolean().optional(),
    description: yup.string().optional(),
    avatarUrl: yup.string().optional()
  })
  .required();

/**
 * Updates the user with the given id if it exists, with the given update data. Update data can optionally include a username,
 * password, realname, admin, description, and / or avatarUrl.
 *
 * Throws an exception if the user with the given id is not found, or the update data is invalid.
 *
 * @param {*} id the user id to update
 * @param {*} updateData the update data to apply.
 */
export async function updateUser(id, updateData) {
  const db = await getDatabase();
  
  // Check if user exists
  const user = await getUserWithUserId(id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }

  // Validate incoming data (throw error if invalid)
  const parsedUpdateData = updateUserSchema.validateSync(updateData, {
    abortEarly: false,
    stripUnknown: true
  });

  // Build update query dynamically
  const fields = Object.keys(parsedUpdateData);
  if (fields.length === 0) {
    return user; // Nothing to update
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => parsedUpdateData[field]);
  values.push(id); // Add id for WHERE clause

  await db.run(
    `UPDATE Users SET ${setClause} WHERE id = ?`,
    ...values
  );

  // Return updated user
  return await getUserWithUserId(id);
}

export async function createUser(userData) {
  // Implementation for creating a new user
  const db = await getDatabase();
  const {username, password, realname, admin, description, avatarUrl} = userData;
  const user = await db.run(
    "INSERT INTO Users (username, password, realname, admin, description, avatarUrl) VALUES (?, ?, ?, ?, ?, ?)", 
    username, password, realname, admin, description, avatarUrl);
  return user;
}

/**
 * Deletes the user with the given id, along with all their articles and comments (CASCADE).
 *
 * @param {number} id the user id to delete
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  const db = await getDatabase();
  
  // Check if user exists
  const user = await getUserWithUserId(id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }

  // Delete user (CASCADE will automatically delete articles, comments, likes, etc.)
  await db.run("DELETE FROM Users WHERE id = ?", id);
}