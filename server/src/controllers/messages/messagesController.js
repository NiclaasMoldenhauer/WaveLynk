import expressAsyncHandler from 'express-async-handler';
import Chat from '../../models/messages/Chat.js';
import Message from '../../models/messages/MessageSchema.js';
import User from '../../models/auth/userModel.js';

// Create chat handler
export const createChat = expressAsyncHandler (async (req, res) => {
  try {
    const newChat = new Chat ({
      participants: [req.body.senderId, req.body.receiverId],
    });

    const chat = await newChat.save ();

    res.status (200).json (chat);
  } catch (error) {
    res.status (500).json ({message: error.message});
  }
});

// get all user chats handler
export const getAllUserChats = expressAsyncHandler (async (req, res) => {
  try {
    const chat = await Chat.find ({
      // find all chats where the user is a participant in.
      participants: {$in: [req.params.userId]},
    }).sort ({lastModified: -1});

    res.status (200).json (chat);
  } catch (error) {
    console.log ('Fehler beim Abrufen der Chats...', error.message);
    res.status (500).json ({message: error.message});
  }
});

// create message handler
export const createMessage = expressAsyncHandler (async (req, res) => {
  try {
    const newMessage = new Message (req.body);

    const message = await newMessage.save ();
    // update chat with new message
    await Chat.findByIdAndUpdate (req.body.chatId, {
      lastModified: Date.now (),
    });

    res.status (200).json (message);
  } catch (error) {
    console.log ('Fehler beim Senden der Nachricht...', error.message);
    res.status (500).json ({message: error.message});
  }
});

// get chat messages handler
export const getChatMessages = expressAsyncHandler (async (req, res) => {
  // const {limit, offset} = req.query;
  // const limitNumber = parseInt (limit, 10) || 20;
  // const offsetNumber = parseInt (offset, 10) || 0;

  try {
    const messages = await Message.find ({chatId: req.params.chatId})
      // .sort ({createdAt: -1})
      // .limit (limitNumber)
      // .skip (offsetNumber);

    res.status (200).json (messages);
  } catch (error) {
    console.log ('Fehler beim Abrufen der Nachrichten...', error.message);
    res.status (500).json ({message: error.message});
  }
});

// get user by id handler
export const getUserById = expressAsyncHandler (async (req, res) => {
  try {
    const user = await User.findById (req.params.id).select ('-password');

    if (!user) {
      res.status (404).json ({message: 'User nicht gefunden'});
    }

    res.status (200).json (user);
  } catch (error) {
    console.log ('Fehler beim Abrufen des Users...', error.message);
    res.status (500).json ({message: error.message});
  }
});
