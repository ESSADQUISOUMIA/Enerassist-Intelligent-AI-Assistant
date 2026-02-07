import React, { useState, useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../../assets/assets'
import Message from './Message'
import api from '../api/axios'
import { Download, Star } from 'lucide-react'
import FavoritesPanel from './FavoritesPanel'
import WorkflowGuide from './WorkflowGuide'


const ChatBox = () => {
  const containerRef = useRef(null)

  const { selectedChat, setSelectedChat, setChats, theme, fetchUserChats, isOnboarding } = useAppContext()



  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  // Derived state for favorites
  const favorites = messages.filter(m => m.is_favorite);

  // Helper to parse SSE data
  // ... (keep helper)
  const parseSSE = (buffer) => {
    const events = [];
    const lines = buffer.split('\n\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          events.push(data);
        } catch (e) {
          console.error("Failed to parse SSE line", line);
        }
      }
    }
    return events;
  };

  const onSubmit = async (e) => {
    // ... (keep existing onSubmit logic)
    e.preventDefault()
    if (!prompt.trim()) return

    const userMessage = {
      role: 'user',
      content: prompt,
    }

    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setLoading(true)

    // Add placeholder for AI response
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      let chatId = selectedChat?._id || "temp";

      console.log("🔍 FRONTEND DEBUG: onSubmit called");
      console.log("  selectedChat._id:", selectedChat?._id);
      console.log("  chatId:", chatId);
      console.log("  Sending to backend:", chatId === "temp" ? null : chatId);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: chatId === "temp" ? null : chatId,
          message: userMessage.content
        })
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            try {
              const data = JSON.parse(part.substring(6));

              if (data.type === 'meta') {
                console.log("🔍 FRONTEND: Received meta", data);
                // CRITICAL: Save the conversation ID for subsequent messages!
                if (data.conversation_id && chatId === "temp") {
                  console.log("  Updating chatId from temp to", data.conversation_id);
                  chatId = data.conversation_id;
                  // Update selectedChat with the real ID
                  setSelectedChat(prev => ({
                    ...prev,
                    _id: data.conversation_id
                  }));
                  // Update chats list to replace temp with real conversation
                  setChats(prev => prev.map(c =>
                    c._id === "temp" ? { ...c, _id: data.conversation_id } : c
                  ));
                }
              } else if (data.type === 'content') {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content += data.chunk;
                  }
                  return newMsgs;
                });
              } else if (data.type === 'done') {
                console.log("🔍 FRONTEND: Stream done", data);
                if (data.user_message_id && data.assistant_message_id) {
                  setMessages((prev) => {
                    const newMsgs = [...prev];
                    // The last message is assistant, the one before is user
                    if (newMsgs.length >= 2) {
                      newMsgs[newMsgs.length - 1].id = data.assistant_message_id;
                      newMsgs[newMsgs.length - 2].id = data.user_message_id;
                    }
                    return newMsgs;
                  });
                }
              } else if (data.type === 'error') {
                console.error("Stream error:", data.error);
              }
            } catch (err) {
              console.error("JSON parse error", err);
            }
          }
        }
      }

    } catch (error) {
      console.error(error)
      setMessages((prev) => {
        return prev;
      });
    } finally {
      setLoading(false)
      if (fetchUserChats) fetchUserChats();
    }
  }


  const prevChatIdRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      // Only reset messages if we're switching to a DIFFERENT conversation
      // Don't reset if we just updated from "temp" to a real ID
      const currentId = selectedChat._id;
      const prevId = prevChatIdRef.current;

      if (prevId !== currentId && prevId !== "temp") {
        // We're switching to a different conversation, load its messages
        setMessages(selectedChat?.messages || []);
      }

      prevChatIdRef.current = currentId;
    }
  }, [selectedChat])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const handleMessageUpdate = (updatedMessage) => {
    setMessages((prev) => prev.map((msg) =>
      (msg.id && msg.id === updatedMessage.id) || (msg._id && msg._id === updatedMessage._id)
        ? { ...msg, ...updatedMessage }
        : msg
    ));
  };

  if (isOnboarding) {
    return <WorkflowGuide />
  }

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40 relative">

      {/* Knowledge Board Panel */}
      <FavoritesPanel
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        favorites={favorites}
      />

      {/* Chat Header with Tools */}
      {messages.length > 0 && (
        <div className="flex justify-end mb-2 px-2 gap-2">

          <button
            onClick={() => setShowFavorites(true)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-500 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md cursor-pointer"
            title="Ouvrir le Tableau de Connaissances"
          >
            <Star size={16} />
            Tableau de Connaissances ({favorites.length})
          </button>

          <button
            onClick={() => {
              // Export logic
              const chatTitle = selectedChat?.name || "conversation";
              const textContent = messages.map(m =>
                `[${m.role.toUpperCase()}] ${m.isImage ? '[Image]' : m.content}`
              ).join('\n\n');

              const blob = new Blob([textContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${chatTitle.replace(/\s+/g, '_')}_history.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-500 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md cursor-pointer"
            title="Exporter la Conversation"
          >
            <Download size={16} />
            Exporter la Discussion
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt="Logo"
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Posez-moi une question
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            onUpdate={handleMessageUpdate}
          />
        ))}

        {/* three dots loading  */}
        {
          loading && <div className='Loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>

          </div>
        }

      </div>



      {/* Prompt input box */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>


        <input onChange={(e) => setPrompt(e.target.value)} value={prompt} type="text" placeholder='Saisissez votre message ici...' className='flex-1 w-full text-sm outline-none' required />
        <button disabled={loading}>
          <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="" />
        </button>
      </form>
    </div>
  )
}

export default ChatBox;
