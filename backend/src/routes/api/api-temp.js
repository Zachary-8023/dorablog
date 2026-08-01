/**
 * This file contains API routes for the temp data. You should
 * create your own API routes files for your project, and get rid of this one.
 */

// import express from "express";
// import { getMessages, addMessage } from "../../data/temp-dao.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   const messages = await getMessages();

//   const callCountCookie = req.cookies.callCount;
//   const callCount = callCountCookie ? parseInt(callCountCookie) + 1 : 1;

//   return res.cookie("callCount", callCount.toString(), { httpOnly: true }).json(messages);
// });

// router.post("/", async (req, res) => {
//   const { message } = req.body;
//   const dbMessage = await addMessage(message);
//   return res.status(201).location(`/api/messages/${message.id}`).json(dbMessage);
// })

// export default router;
