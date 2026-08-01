/**
 * This file contains a dummy DAO for the "Messages" database. You should
 * create your own DAOs for your project, and get rid of this one.
 */

import { getDatabase } from "./database.js";

export async function getMessages() {
  const db = await getDatabase();
  const messages = await db.all("SELECT * FROM Messages");
  return messages;
}

export async function addMessage(messageText) {
  const db = await getDatabase();
  const response = await db.run("INSERT INTO Messages (message) VALUES(?)", messageText);
  return {
    id: response.lastID,
    message: messageText
  }
}