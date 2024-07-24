import expressAsyncHandler from 'express-async-handler';
import Chat from '../../models/messages/Chat.js';
import Message from '../../models/messages/MessageSchema.js';

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

export const getAllUserChats = expressAsyncHandler(async (req, res) => {
    try {
      const chat = await Chat.find({
        // find all chats where the user is a participant in.
        participants: { $in: [req.params.userId] },
      }).sort({ lastModified: -1 });
  
      res.status(200).json(chat);
    } catch (error) {
      console.log("Fehler beim Abrufen der Chats...", error.message);
      res.status(500).json({ message: error.message });
    }
  });

  export const createMessage = expressAsyncHandler(async (req, res) => {
      try {
        const newMessage = new Message (req.body)


        const message = await newMessage.save()
        // update chat with new message
        await Chat.findByIdAndUpdate(req.body.chatId, {
          lastModified: Date.now(),
        })

        res.status(200).json(message)
      } catch (error) {
        console.log("Fehler beim Senden der Nachricht...", error.message);
        res.status(500).json({ message: error.message });
      }
  })