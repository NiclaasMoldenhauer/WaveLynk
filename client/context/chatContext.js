import axios, { all } from "axios";
import React, { useEffect } from "react";
import { useUserContext } from "./userContext";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const ChatContext = React.createContext();

const serverUrl = "http://localhost:5000";

export const ChatProvider = ({ children }) => {
    const { user, setSearchResults, setUser } = useUserContext();

    const userId = user?._id;

    const router = useRouter();


    // state for chat
    const [chats, setChats] = React.useState([]);
    const [messages, setMessages] = React.useState([]);
    const [allChatsData, setAllChatsData] = React.useState([]);
    const [activeChatData, setActiveChatData] = React.useState([]);
    const [socket, setSocket] = React.useState();
    const [onlineUsers, setOnlineUsers] = React.useState([]);
    const [arrivedMessage, setArrivedMessage] = React.useState(null);

    useEffect (() => {
        // Erstelle einen Socket
        const newSocket = io(serverUrl)

        newSocket.on("Verbindung herstellen", () => {
            console.log("Verbindung hergestellt")
        })

        newSocket.on("Verbindung beenden", () => {
            console.log("Verbindung beendet", reason)
        })

        setSocket(newSocket);

        // Cleanup wenn Komponente beendet wird
        return () => {
            newSocket.disconnected();
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
                    const isFriends = onlineFriends.filter ((friend) =>
                        users.friends.includes(friend._id)
                    );

                    setOnlineUsers(isFriends);
                }   catch (error) {
                    console.log("Fehler beim Abrufen der Online-Nutzer", error.message);
                }
            };


            getOnlineUsers();
        })

        // listen für neue Nachrichten
        socket?.on("get message", (data) => {
            setArrivedMessage({
                sender: data.senderId,
                content: data.text,
                createdAt: Date.now(),
            })
        })

        return () => {
            socket?.off("get users")
            socket?.off("get message")
        }
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



    return (
        <ChatContext.Provider
            value={{
                chats,
                messages,
                getUserbyId,
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
}
export const useChatContext = () => {
    return React.useContext(ChatContext);
}