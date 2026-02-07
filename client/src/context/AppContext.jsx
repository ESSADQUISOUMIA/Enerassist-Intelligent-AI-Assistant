import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../../assets/assets";
import api from "../api/axios";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );
    const [appLoading, setAppLoading] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(true);


    // Helper to sort chats: Pinned first, then by updatedAt
    const sortChats = (chatsList) => {
        return [...chatsList].sort((a, b) => {
            if (a.is_pinned === b.is_pinned) {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
            return a.is_pinned ? -1 : 1;
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null)
        setChats([])
        setSelectedChat(null)
    }

    const createNewChat = async () => {
        try {
            // Auto-clean previous empty chat if exists and is NOT temp (temp is handled by recycling below)
            if (selectedChat && selectedChat._id !== 'temp' && selectedChat.messages.length === 0) {
                api.delete(`/conversations/${selectedChat._id}`).catch(e => console.error(e));
                setChats(prev => prev.filter(c => c._id !== selectedChat._id));
            }

            // Deferred creation: Don't call API yet.
            // Create a temporary chat object.
            const newChat = {
                _id: "temp", // Marker for temporary chat
                name: "New Chat",
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                is_pinned: false
            }

            // If there's already a temp chat, don't add another one
            setChats(prev => {
                const hasTemp = prev.some(c => c._id === "temp");
                if (hasTemp) {
                    // Just select the existing temp chat
                    const temp = prev.find(c => c._id === "temp");
                    // Assuming setSelectedChat will happen in the component effect or next render? 
                    // No, we need to set it here.
                    // But wait, if we are in setChats updater... we can't setSelectedChat here clearly.
                    // We'll do it outside.
                    return prev;
                }
                return sortChats([newChat, ...prev]);
            });

            // We need to check if we effectively selected "temp"
            // The logic above ensures 'temp' is in the list.

            // Simplification: Always set selectedChat to the object (either new or existing found in list)
            // But relying on state 'chats' which might not be updated yet?
            // "newChat" object is valid.
            // If "temp" exists in "prev", we should probably find THAT one to maintain reference equality if needed?
            // Actually, for "temp", replacing it with a new empty "temp" object is fine too.
            // But let's stick to reuse to avoid flicker.

            // Ideally:
            setSelectedChat(prev => {
                // logic to reuse or set new is tricky with async state.
                // Let's just set it to 'newChat' object. 
                // If the list has a 'temp' object, it should match the ID.
                return newChat;
            });

        } catch (error) {
            console.error("Failed to create chat", error);
        }
    }

    const deleteChat = async (chatId) => {
        try {
            await api.delete(`/conversations/${chatId}`);
            setChats(prev => prev.filter(chat => chat._id !== chatId))

            // si le chat supprimé est celui sélectionné
            setSelectedChat(prev =>
                prev?._id === chatId ? null : prev
            )
        } catch (error) {
            console.error("Failed to delete chat", error);
        }
    }

    const fetchUser = async () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setAppLoading(false);
    };

    const fetchUserChats = async () => {
        try {
            const response = await api.get('/conversations/list');
            // Backend returns { conversations: [...], total: ... }
            if (response.data && response.data.conversations) {
                // Map backend structure to frontend structure if necessary
                // Backend: id, titre, last_updated, preview
                // Frontend: _id, name, updatedAt, messages (preview is just text)
                const formattedChats = response.data.conversations.map(c => ({
                    _id: c.id,
                    name: c.titre,
                    updatedAt: c.last_updated,
                    is_pinned: c.is_pinned,
                    messages: c.preview ? [{ content: c.preview, role: 'assistant' }] : [] // Placeholder for preview
                }));
                setChats(sortChats(formattedChats)); // Backend already sorts, but we could use sortChats(formattedChats) to be safe
            }
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    const loadChatDetails = async (chatId) => {
        try {
            // Check if actual selectedChat is empty and needs deletion
            // Note: selectedChat state might not be immediately updated if we just clicked, 
            // but here we are in the event handler context accessing component state.
            if (selectedChat && selectedChat._id !== chatId) {
                if (selectedChat.messages.length === 0) {
                    if (selectedChat._id === 'temp') {
                        setChats(prev => prev.filter(c => c._id !== 'temp'));
                    } else {
                        // It's a real chat but empty. User wants it deleted.
                        // We do this optimistically or await API
                        try {
                            // Don't await strictly if we want UI specific, but safer to catch
                            api.delete(`/conversations/${selectedChat._id}`).catch(err => console.error("Auto-delete failed", err));
                            setChats(prev => prev.filter(c => c._id !== selectedChat._id));
                        } catch (e) { console.error(e) }
                    }
                }
            }

            const response = await api.get(`/conversations/${chatId}`);
            // response.data is ConversationResponse: id, titre, messages, etc.
            const fullChat = response.data;

            // Map messages
            const formattedMessages = fullChat.messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.texte,
                date: m.date,
                is_favorite: m.is_favorite || false
            }));

            const updatedChat = {
                _id: fullChat.id,
                name: fullChat.titre,
                updatedAt: fullChat.last_updated,
                is_pinned: fullChat.is_pinned, // Ensure we get this
                messages: formattedMessages
            };

            setSelectedChat(updatedChat);

            // Also update it in the list and re-sort (in case date changed)
            setChats(prev => {
                const updatedList = prev.map(c => c._id === chatId ? updatedChat : c);
                // Optional: Re-sort if we want the active chat to jump to top (below pins)
                // return sortChats(updatedList);
                return updatedList;
            });

        } catch (error) {
            console.error("Failed to load chat details", error);
        }
    };

    // Dark mode
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Load chats when user exists
    useEffect(() => {
        if (user) {
            fetchUserChats();
        } else {
            setChats([]);
            setSelectedChat(null);
        }
    }, [user]);

    // Initial user fetch
    useEffect(() => {
        fetchUser();
    }, []);

    const pinChat = async (chatId, isPinned) => {
        try {
            await api.patch(`/conversations/${chatId}/pin`, null, {
                params: { is_pinned: isPinned }
            });

            // Note: pass params or body? Backend defined:
            // pin_conversation(conversation_id: str, is_pinned: bool, ...)
            // It expects query param usually if not Body(...).
            // In fastapi: is_pinned: bool defaults to query param if not specified as Body.
            // Let's check conversations.py again.
            // Yes, "is_pinned: bool" in args means query param.

            // Update local state
            setChats(prev => {
                const updated = prev.map(chat =>
                    chat._id === chatId ? { ...chat, is_pinned: isPinned } : chat
                );
                return sortChats(updated);
            });

        } catch (error) {
            console.error("Failed to pin chat", error);
        }
    }

    const value = {
        navigate,
        user,
        setUser,
        fetchUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        theme,
        setTheme,
        createNewChat,
        deleteChat,
        logout,
        loadChatDetails,
        pinChat,
        fetchUserChats,
        appLoading,
        isOnboarding,
        setIsOnboarding
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
// 01:01:29
export const useAppContext = () => {
    return useContext(AppContext);
};