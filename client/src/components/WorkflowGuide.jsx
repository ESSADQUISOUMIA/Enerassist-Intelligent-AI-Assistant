import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Star, Ticket, Download, ArrowRight, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const WorkflowStep = ({ icon: Icon, title, description, delay, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.05, translateY: -5 }}
        className="flex flex-col items-center p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300 group shadow-sm hover:shadow-xl"
    >
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white text-center">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
            {description}
        </p>
    </motion.div>
);

const WorkflowGuide = () => {
    const { setIsOnboarding } = useAppContext();

    const steps = [
        {
            icon: Bot,
            title: "Diagnostic IA",
            description: "Décrivez votre panne technique. L'IA analyse les symptômes et propose des solutions immédiates.",
            delay: 0.1,
            color: "bg-blue-500"
        },
        {
            icon: Star,
            title: "Base de Connaissances",
            description: "Sauvegardez les meilleures solutions en favoris pour enrichir votre tableau technique.",
            delay: 0.2,
            color: "bg-yellow-500"
        },
        {
            icon: Ticket,
            title: "Support Jira",
            description: "Si l'IA ne peut pas résoudre la panne, un ticket est automatiquement créé pour l'équipe support.",
            delay: 0.3,
            color: "bg-purple-500"
        },
        {
            icon: Download,
            title: "Export d'Intervention",
            description: "Exportez l'historique complet de vos diagnostics pour vos rapports de maintenance.",
            delay: 0.4,
            color: "bg-green-500"
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center p-4 max-w-5xl mx-auto min-h-screen bg-transparent">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-widest mb-4">
                    <Sparkles size={14} className="fill-current" />
                    <span>Guide de Workflow Assistant HI5</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Optimisez vos <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Interventions</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto italic">
                    Découvrez comment notre IA vous accompagne de la détection à la résolution.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
                {steps.map((step, index) => (
                    <WorkflowStep key={index} {...step} />
                ))}
            </div>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                    console.log("Onboarding dismissed");
                    setIsOnboarding(false);
                }}
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-bold text-xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 cursor-pointer z-50"
            >
                Commencer mon Diagnostic
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />

                <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-widest"
            >
                Propulsé par HI5 Intelligence Artificielle • Hackathon Capgemini
            </motion.p>
        </div>
    );
};

export default WorkflowGuide;
