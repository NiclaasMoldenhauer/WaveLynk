import express from 'express';
import {
  createChat,
  getAllUserChats,
  createMessage,
  getChatMessages,
  getUserById,
} from '../controllers/messages/messagesController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router ();

// chat routing
router.post ('/chats', protect, createChat);
router.get ('/chats/:userId', protect, getAllUserChats);

// messages routes
router.post ('/message', protect, createMessage);
router.get ('/messages/:chatId', protect, getChatMessages);

// get user by id
router.get ('/user/:id', protect, getUserById);

export default router;
