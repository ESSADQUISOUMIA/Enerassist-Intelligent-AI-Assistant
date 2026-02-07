import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import { Copy, Check, Download, Star } from 'lucide-react'
import api from '../api/axios'
import { useAppContext } from '../context/AppContext'

const Message = ({ message, onUpdate }) => {
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(message.is_favorite || false)
  const { selectedChat } = useAppContext()

  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  useEffect(() => {
    setIsFavorite(message.is_favorite || false)
  }, [message.is_favorite])

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assistant_response_${moment().format('YYYYMMDD_HHmmss')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleFavorite = async () => {
    if (!message.id || !selectedChat?._id) return;

    try {
      const newStatus = !isFavorite;
      setIsFavorite(newStatus); // Optimistic update

      // Update parent state for Knowledge Board
      if (onUpdate) {
        onUpdate({ ...message, is_favorite: newStatus });
      }

      await api.patch(`/conversations/${selectedChat._id}/messages/${message.id}/favorite`, null, {
        params: { is_favorite: newStatus }
      });

    } catch (error) {
      console.error("Failed to toggle favorite", error);
      setIsFavorite(!isFavorite); // Revert on error
      if (onUpdate) {
        onUpdate({ ...message, is_favorite: !isFavorite });
      }
    }
  }

  return (
    <div className='group'>
      {message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='relative flex flex-col gap-2 p-2 px-2 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl'>
            <p className='text-sm dark:text-primary pr-6'>{message.content}</p>
            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>{moment(message.timestamp).fromNow()}</span>

            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/50 dark:bg-black/20 rounded-md p-0.5 backdrop-blur-sm'>
              <button
                onClick={handleFavorite}
                className={`p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleCopy}
                className='p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-gray-400 cursor-pointer'
                title="Copier le message"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <img src={assets.user_icon} alt="" className='w-8 rounded-full' />
        </div>
      )
        :
        (
          <div className='relative inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4'>
            {message.isImage ? (
              <img src={message.content} className='w-full max-w-md mt-2 rounded-md' />
            ) :
              (
                <div className='text-sm dark:text-primary reset-tw pr-6'>
                  <Markdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:underline cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      )
                    }}
                  >
                    {message.content}
                  </Markdown>
                </div>
              )
            }
            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>{moment(message.timestamp).fromNow()}</span>

            {!message.isImage && (
              <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/50 dark:bg-black/20 rounded-md p-0.5 backdrop-blur-sm'>
                <button
                  onClick={handleFavorite}
                  className={`p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer ${isFavorite ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}
                  title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleExport}
                  className='p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-gray-500 dark:text-gray-400 cursor-pointer'
                  title="Télécharger la réponse"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={handleCopy}
                  className='p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-gray-500 dark:text-gray-400 cursor-pointer'
                  title="Copier le message"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}
// 1:31:32 
export default Message;