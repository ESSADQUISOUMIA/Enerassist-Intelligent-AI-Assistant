import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, MessageSquare } from 'lucide-react'
import Markdown from 'react-markdown'

const FavoritesPanel = ({ isOpen, onClose, favorites }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-[#1a1025] shadow-2xl border-l border-gray-200 dark:border-[#80609F]/30 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-[#80609F]/20 flex items-center justify-between bg-white/50 dark:bg-[#1a1025]/50 backdrop-blur-md">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                <Star size={20} fill="currentColor" />
                                <h2 className="font-semibold text-lg">Tableau de Connaissances</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                            {favorites.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-[#B1A6C0]/50">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Star size={32} className="opacity-50" />
                                    </div>
                                    <p className="font-medium mb-1">Aucune information enregistrée</p>
                                    <p className="text-sm">Marquez des messages en favoris pour les ajouter à votre tableau.</p>
                                </div>
                            ) : (
                                favorites.map((msg, index) => (
                                    <motion.div
                                        key={msg.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-3 bg-gray-50 dark:bg-[#57317C]/20 border border-gray-100 dark:border-[#80609F]/20 rounded-xl hover:border-purple-200 dark:hover:border-purple-500/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-[#B1A6C0]">
                                            {msg.role === 'user' ? (
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase font-bold text-[10px]">Utilisateur</span>
                                            ) : (
                                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded uppercase font-bold text-[10px]">AI</span>
                                            )}
                                            <span>•</span>
                                            <span>{new Date(msg.date || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        <div className="text-sm text-gray-700 dark:text-gray-200 line-clamp-4 max-h-32 overflow-hidden relative">
                                            <div className='pointer-events-none'>
                                                {/* Render simplified markdown or just text */}
                                                {msg.content}
                                            </div>
                                            {/* Blur gradient at bottom for potential overflow */}
                                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 dark:from-[#2a1b3d] to-transparent pointer-events-none" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer / Stats */}
                        <div className="p-3 border-t border-gray-100 dark:border-[#80609F]/20 text-center text-xs text-gray-400 dark:text-gray-500">
                            {favorites.length} élément{favorites.length !== 1 && 's'} enregistré{favorites.length !== 1 && 's'}
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default FavoritesPanel
