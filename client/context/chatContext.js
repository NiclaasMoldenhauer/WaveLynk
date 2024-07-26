import axios, { all } from "axios";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { useUserContext } from "./userContext";

const ChatContext = React.createContext();

const serverUrl = "http://localhost:8000";

export const ChatProvider = ({ children }) => {
  const { user, setSearchResults, setUser } = useUserContext();

  const userId = user?._id;

  const router = useRouter();

  // state for chat
  const [chats, setChats] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [allChatsData, setAllChatsData] = React.useState([]);
  const [selectedChat, setSelectedChat] = React.useState(null);
  const [activeChatData, setActiveChatData] = React.useState([]);
  const [socket, setSocket] = React.useState();
  const [onlineUsers, setOnlineUsers] = React.useState([]);
  const [arrivedMessage, setArrivedMessage] = React.useState(null);

  useEffect(() => {
    // Erstelle einen Socket
    const newSocket = io(serverUrl);

    newSocket.on("Verbindung herstellen", () => {
      console.log("Verbindung hergestellt");
    });

    newSocket.on("Verbindung beenden", (reason) => {
      console.log("Verbindung beendet", reason);
    });

    setSocket(newSocket);

    // Cleanup wenn Komponente beendet wird
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Verhindern von Events wenn der Nutzer nicht eingeloggt ist
    if (!user) return;

    socket?.emit("User hinzufügen", user._Id);
    // listen for changes
    socket?.on("User online", (users) => {
      const getOnlineUsers = async () => {
        try {
          const usersOnline = await Promise.all(
            users.map(async (user) => {
              const userData = await getUserbyId(user.userId);
              return userData;
            })
          );
          // Aktuellen Nutzer von der Liste entfernen
          const onlineFriends = usersOnline.filter(
            (user) => user._id !== userId
          );

          // Checken ob aktueller Nutzer mit online user befreundet ist
          const isFriends = onlineFriends.filter((friend) =>
            users.friends.includes(friend._id)
          );

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
      socket?.off("get users");
      socket?.off("get message");
    };
  }, [user]);

  useEffect(() => {
    // Prüfen ob Nachricht vom participant in aktivem Chat ist
    if (
      arrivedMessage &&
      selectedChat &&
      selectedChat.participants.includes(arrivedMessage.sender)
    ) {
      // Message State updated
      setMessages((prev) => [...prev, arrivedMessage]);
    }
  }, [arrivedMessage, selectedChat?._id]);

  const getUserById = async (id) => {
    try {
      if (!id) return;

      const res = await axios.get(`${serverUrl}/api/v1/user/${id}`);
      return res.data;
    } catch (error) {
      console.log("Fehler beim Abrufen des getUserById", error.message);
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
    };


  // fetch Nachrichten für chat
  const fetchMessages = async (chatId, limit = 15, offset = 0) => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/messages/${chatId}`, {
        params: {
          limit,
          offset,
        },
      });

      // set messages in state
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
            // fetch user data for each participant
            chat.participants
              .filter((participant) => participant !== userId)
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

    // user finden der nicht der aktuelle user ist
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

      // update des chat states
      setChats((prev) => [...prev, res.data]);

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
