import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { useUserContext } from "./userContext";
import toast from 'react-hot-toast';

const ChatContext = React.createContext();

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const ChatProvider = ({ children }) => {
  const { user, setSearchResults, setUser } = useUserContext();
  const userId = user?._id;
  const router = useRouter();
  
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allChatsData, setAllChatsData] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeChatData, setActiveChatData] = useState({});
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [arrivedMessage, setArrivedMessage] = useState(null);

  const addMessageToChat = useCallback((message, chatId) => {
    setMessages(prevMessages => [...prevMessages, message]);
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage: message,
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  }, []);

  useEffect(() => {
    const newSocket = io(serverUrl);

    newSocket.on("connect", () => {
      console.log("Connected to the server");
      if (userId) {
        newSocket.emit('add user', userId);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("disconnected from the server", reason);
    });

    newSocket.on('get users', async (users) => {
      const onlineFriends = await Promise.all(
        users.map(async (user) => {
          const userData = await getUserById(user.userId);
          return { ...userData, online: userData.online };
        })
      );
      setOnlineUsers(onlineFriends.filter(friend => friend.friends.includes(userId)));
    });

    newSocket.on("get message", (data) => {
      const newMessage = {
        _id: Date.now(),
        sender: data.senderId,
        content: data.text,
        createdAt: new Date().toISOString(),
      };

      if (selectedChat && selectedChat.participants.includes(data.senderId)) {
        addMessageToChat(newMessage, selectedChat._id);
      } else {
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.participants.includes(data.senderId)) {
              return {
                ...chat,
                lastMessage: newMessage,
                updatedAt: new Date().toISOString(),
              };
            }
            return chat;
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          return updatedChats;
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      newSocket.off("get users");
      newSocket.off("get message");
    };
  }, [userId, selectedChat, addMessageToChat]);

  useEffect(() => {
    if (!user) return;
    socket?.emit("User hinzufügen", user._id);
    
    socket?.on("User online", (users) => {
      const getOnlineUsers = async () => {
        try {
          const usersOnline = await Promise.all(
            users.map(async (user) => {
              const userData = await getUserById(user.userId);
              return userData;
            })
          );
          const onlineFriends = usersOnline.filter(user => user._id !== userId);
          const isFriends = onlineFriends.filter(friend => users.friends.includes(friend._id));
          setOnlineUsers(isFriends);
        } catch (error) {
          console.log("Fehler beim Abrufen der Online-Nutzer", error.message);
        }
      };

      getOnlineUsers();
    });

    // listen für neue Nachrichten
    socket?.on("get message", (data) => {
      setArrivedMessage({
        sender: data.senderId,
        content: data.text,
        createdAt: Date.now(),
      });
    });

    return () => {
      socket?.off("User online");
      socket?.off("get message");
    };
  }, [user]);

  useEffect(() => {
    if (
      arrivedMessage &&
      selectedChat &&
      selectedChat.participants.includes(arrivedMessage.sender)
    ) {
      setMessages(prev => [...prev, arrivedMessage]);
    }
  }, [arrivedMessage, selectedChat?._id]);

  const getUserById = async (id) => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/user/${id}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Fehler beim Abrufen des getUserById", error.message);
      if (error.response && error.response.status === 404) {
        toast.error("Benutzer nicht gefunden");
      } else {
        toast.error("Fehler beim Laden der Benutzerdaten");
      }
      return null;
    }
  };

  // fetch user Chats
  const fetchChats = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${serverUrl}/api/v1/chats/${userId}`);
      setChats(res.data);
    } catch (error) {
      console.log("Fehler beim Abrufen von fetchChats", error.message);
    }
  }

  // fetch Nachrichten für chat
  const fetchMessages = async (chatId, limit = 15, offset = 0) => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/messages/${chatId}`, {
        params: { limit, offset },
      });
      setMessages(res.data);
    } catch (error) {
      console.log("Fehler beim Abrufen von fetchMessages", error.message);
    }
  };

  const fetchAllMessages = async (chatId) => {
    if (!chatId) return;
    try {
      const res = await axios.get(`${serverUrl}/api/v1/messages/${chatId}`);
      return res.data;
    } catch (error) {
      console.log("Fehler beim Abrufen von fetchAllMessages", error.message);
    }
  };

  // fetch all chats data
  const getAllChatsData = async () => {
    try {
      const updatedChats = await Promise.all(
        chats.map(async (chat) => {
          const participantsData = await Promise.all(
            chat.participants
              .filter(participant => participant !== userId)
              .map(async (participant) => {
                const user = await getUserById(participant);
                return user;
              })
          );
          return {
            ...chat,
            participantsData,
          };
        })
      );

      // update mit neuen Daten
      setAllChatsData(updatedChats);
    } catch (error) {
      console.log("Fehler beim Abrufen von getAllChatsData", error.message);
    }
  };

  // Nachrichten senden
  const sendMessage = async (data) => {
    try {
      const res = await axios.post(`${serverUrl}/api/v1/message`, data);

      // update des Nachrichten states
      setMessages((prev) => [...prev, res.data]);

      // update des Chat states
      setChats((prev) => {
        const updatedChats = prev.map((chat) => {
          if (chat._id === data.chatId) {
            return {
              ...chat,
              lastMessage: res.data,
              updatedAt: new Date().toISOString(),
            };
          }
          return chat;
        });

        // Chat nach oben in der liste bewegen
        updatedChats.sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        return updatedChats;
      });

      // emit Nachricht an den Empfänger
      socket.emit("send message", {
        senderId: data.sender,
        receiverId: activeChatData._id,
        text: data.content,
      });

      return res.data;
    } catch (error) {
      console.log("Fehler beim Senden einer Nachricht", error.message);
    }
  };

  // handle selected chat
  const handleSelectedChat = async (chat) => {
    setSelectedChat(chat);
    const isNotLoggedInUser = chat.participants.find(
      (participant) => participant !== userId
    );
    const data = await getUserById(isNotLoggedInUser);
    setActiveChatData(data);
  };

  // Neuen Chat erstellen
  const createChat = async (senderId, receiverId) => {
    try {
      const res = await axios.post(`${serverUrl}/api/v1/chats`, {
        senderId,
        receiverId,
      });
      setChats(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.log("Fehler beim Erstellen eines neuen Chats", error.message);
    }
  };

  // logout user
  const logoutUser = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/logout`);

      // Clear cookies and all states
      setChats([]);
      setMessages([]);
      setAllChatsData([]);
      setSelectedChat(null);
      setActiveChatData({});
      setOnlineUsers([]);
      setSocket(null);
      setArrivedMessage(null);
      setSearchResults([]);
      setUser(null);

      toast.success("Erfolgreich ausgeloggt!");

      // Weiterleitung zur Login-Seite
      router.push("/login");
    } catch (error) {
      console.log("Fehler beim Ausloggen", error.message);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [userId]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (chats && user) {
      getAllChatsData();
    }
  }, [chats, user]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        getUserById,
        allChatsData,
        selectedChat,
        handleSelectedChat,
        fetchAllMessages,
        fetchMessages,
        activeChatData,
        sendMessage,
        logoutUser,
        onlineUsers,
        socket,
        setOnlineUsers,
        createChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return React.useContext(ChatContext);
};
