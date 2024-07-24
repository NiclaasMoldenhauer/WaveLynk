import express from 'express';
import { createChat, getAllUserChats } from '../controllers/messages/messagesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// chat routing
router.post("/chats", protect, createChat);
router.get("/chats/:userId", protect, getAllUserChats);

export default router;