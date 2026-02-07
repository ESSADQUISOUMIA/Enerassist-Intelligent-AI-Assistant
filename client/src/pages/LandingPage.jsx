import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { useAppContext } from '../context/AppContext'
import { Wrench, Activity, AlertTriangle, Ticket, Zap, ArrowRight, Bot, Sparkles, MessageSquare, Cpu, Wifi, Star, Download, Pin } from 'lucide-react'
import { motion } from 'framer-motion'

const LandingPage = () => {
    const navigate = useNavigate()
    const { theme } = useAppContext()

    const features = [
        {
            icon: <Wrench className="w-6 h-6 text-purple-500" />,
            title: "Installation Multi-systèmes",
            desc: "Guides experts pour CVC, électricité et plomberie."
        },
        {
            icon: <Activity className="w-6 h-6 text-blue-500" />,
            title: "Maintenance Énergétique",
            desc: "Optimisation de la consommation et durabilité des équipements."
        },
        {
            icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
            title: "Dépannage Électrique",
            desc: "Diagnostic IA pour pannes de courant, courts-circuits et CVC."
        },
        {
            icon: <Ticket className="w-6 h-6 text-green-500" />,
            title: "Ticketing Automatique",
            desc: "Création automatique de tickets support si le problème persiste."
        },
        {
            icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
            title: "Réponses en Temps Réel",
            desc: "Streaming IA pour des réponses progressives et instantanées."
        },
        {
            icon: <Star className="w-6 h-6 text-yellow-500" />,
            title: "Tableau de Connaissances",
            desc: "Sauvegardez vos insights techniques importants en favoris."
        },
        {
            icon: <Download className="w-6 h-6 text-cyan-500" />,
            title: "Export & Copie Rapide",
            desc: "Exportez vos conversations et copiez les solutions facilement."
        },
        {
            icon: <Pin className="w-6 h-6 text-rose-500" />,
            title: "Épinglage Intelligent",
            desc: "Gardez vos discussions critiques toujours accessibles en haut."
        }
    ]

    return (
        <div className='min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-gradient-to-b from-white to-gray-50 dark:from-[#0f0f0f] dark:to-[#000000] text-gray-800 dark:text-gray-100 transition-colors duration-500 font-outfit'>

            {/* Navbar */}
            <div className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-20">
                <img
                    src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
                    alt="Agent AI Logo"
                    className='h-80 md:h-10 opacity-90 cursor-pointer hover:opacity-100 transition-opacity'
                />
                <button
                    onClick={() => navigate('/login')}
                    className='px-5 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all font-medium text-sm backdrop-blur-sm cursor-pointer'
                >
                    Connexion
                </button>
            </div>

            {/* Hero Section */}
            <header className='relative w-full max-w-7xl mx-auto pt-10 pb-24 px-6 grid lg:grid-cols-2 gap-12 items-center z-10'>

                {/* Background Effects */}
                <div className='absolute top-10 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0 w-[800px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none' />
                <div className='absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none' />

                {/* Left Column: Text */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
                        <Zap size={14} className="fill-current" />
                        <span>Nouvelle Génération d'Énergie</span>
                    </div>

                    <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-800 to-blue-900 dark:from-white dark:via-purple-200 dark:to-blue-400 mb-6 py-2 leading-tight animate-fade-in-up'>
                        Votre Puissance Technique&nbsp;<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Intelligente</span>
                    </h1>

                    <p className='text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-6 max-w-2xl leading-relaxed animate-fade-in-up delay-100'>
                        Ne laissez plus les courts-circuits vous ralentir. <br className="hidden md:block" />
                        Notre IA diagnostique vos surtensions et rétablit le courant de vos projets.
                    </p>

                    <div className='flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200'>
                        <button
                            onClick={() => navigate('/login')}
                            className='px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-bold text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 cursor-pointer'
                        >
                            Commencer maintenant <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className='px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-800 dark:text-white rounded-full font-semibold text-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm cursor-pointer'
                        >
                            En savoir plus
                        </button>
                    </div>
                </div>

                {/* Right Column: AI Visual (Premium Interface) */}
                <div className="relative flex justify-center lg:justify-end">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: -5 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative w-80 h-96 md:w-96 md:h-[28rem] perspective-1000"
                    >
                        {/* 3D Floating Glass Card */}
                        <motion.div
                            animate={{
                                y: [-10, 10, -10],
                                rotateX: [2, -2, 2],
                                rotateY: [-2, 2, -2]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-full h-full bg-gradient-to-br from-black/80 to-purple-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-mono text-purple-200">SYSTÈME ACTIF_</span>
                                </div>
                                <Wifi size={16} className="text-purple-400" />
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-6 space-y-6">
                                {/* Simulated Scanning Data */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-xs text-gray-300 font-mono opacity-80">
                                        <Cpu size={14} className="text-blue-400" />
                                        <span>Initialisation diagnostics...</span>
                                    </div>
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    />

                                    <div className="space-y-2 pt-2">
                                        {[
                                            "Détection anomalies CVC...",
                                            "Analyse flux électrique...",
                                            "Optimisation consommation..."
                                        ].map((text, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.8 + 1, duration: 0.5 }}
                                                className="flex items-center gap-2 text-[10px] text-gray-400 font-mono bg-white/5 p-2 rounded-lg border border-white/5"
                                            >
                                                <span className="text-green-400">✓</span> {text}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Central Visual Wave */}
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/50 to-transparent pointer-events-none" />
                                <div className="flex justify-center items-end gap-1 h-16 pt-4">
                                    {[...Array(10)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [10, 40, 10] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.1,
                                                ease: "easeInOut"
                                            }}
                                            className="w-1.5 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full opacity-80"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Reflection/Shine Line */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        </motion.div>

                        {/* Orbiting Elements */}
                        <motion.div
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                            className="absolute -right-8 top-12 p-3 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl"
                        >
                            <Sparkles className="w-6 h-6 text-amber-400" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [5, -5, 5] }}
                            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                            className="absolute -left-6 bottom-20 p-3 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl"
                        >
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            {/* Features Section */}
            <section className='w-full max-w-6xl mx-auto px-6 pb-24 relative z-10'>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 dark:hover:border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className='w-full border-t border-gray-200 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-md'>
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} HI5 Project. Capgemini Gen AI Hackathon
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <span className="hover:text-purple-500 transition-colors cursor-pointer">Confidentialité</span>
                        <span className="hover:text-purple-500 transition-colors cursor-pointer">Conditions</span>
                        <span className="hover:text-purple-500 transition-colors cursor-pointer">Support</span>
                    </div>
                </div>
            </footer>

        </div>
    )
}

export default LandingPage
