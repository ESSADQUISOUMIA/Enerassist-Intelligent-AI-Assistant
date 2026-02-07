import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../../assets/assets";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Pin } from "lucide-react";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    deleteChat,
    createNewChat,
    logout,
    loadChatDetails,
    pinChat
  } = useAppContext();
  const [search, setSearch] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [chatToDelete, setChatToDelete] = useState(null)



  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5 
      dark:bg-gradient-to-b from-[#242124]/30 to-[#000000] 
      border-r border-[#80609F]/30 backdrop-blur-3xl 
      transition-all duration-500 max-md:absolute left-0 z-10 
      ${!isMenuOpen && "max-md:-translate-x-full"}`}
    >

      {/* logo */}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt="Logo"
        className="w-full max-w-48"
      />

      {/* new chat */}
      <button
        onClick={() => {
          createNewChat()
          navigate("/")
          setIsMenuOpen(false)
        }}
        className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-b from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer hover:opacity-90 transition"
      >
        <span className="mr-2 text-xl">+</span> Nouveau Chat
      </button>


      {/* search */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} className="w-4 not-dark:invert" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Rechercher des conversations"
          className="text-xs placeholder:text-gray-400 outline-none bg-transparent w-full"
        />
      </div>

      {/* chats */}
      {chats.length > 0 && <p className="mt-4 text-sm">Discussions récentes</p>}

      <div className="flex-1 overflow-y-scroll mt-3 space-y-3 text-sm">
        {chats
          .filter(chat =>
            chat.messages[0]
              ? chat.messages[0].content.toLowerCase().includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(chat => (
            <div
              key={chat._id}
              onClick={() => {
                navigate("/");
                loadChatDetails(chat._id);
                setIsMenuOpen(false);
              }}
              className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group"
            >
              <div className="flex-1">
                <p className="truncate">
                  {chat.messages.length
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Pin
                  className={`w-4 h-4 cursor-pointer hover:text-purple-400 ${chat.is_pinned ? 'fill-current text-purple-500' : 'text-gray-400 hidden group-hover:block'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    pinChat(chat._id, !chat.is_pinned);
                  }}
                />
                <img
                  src={assets.bin_icon}
                  onClick={(e) => {
                    e.stopPropagation()
                    setChatToDelete(chat._id)
                  }}
                  className="hidden group-hover:block w-4 not-dark:invert opacity-70 hover:opacity-100 cursor-pointer"
                />
              </div>

            </div>
          ))}
      </div>



      {/* dark mode */}
      <div className="flex items-center justify-between p-3 mt-4 border rounded-md cursor-pointer select-none">
        <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="w-4 not-dark:invert" />
          <p>Mode Sombre</p>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600"></div>
          <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
        </label>
      </div>

      {/* user */}
      <div className="flex items-center gap-3 p-3 mt-4 border rounded-md group">
        <img src={assets.user_icon} className="w-7 rounded-full" />
        <p className="flex-1 text-sm truncate">
          {user ? (user.username || user.name) : "Connectez-vous"}
        </p>
        {user && (
          <img
            src={assets.logout_icon}
            onClick={() => setShowLogoutConfirm(true)}
            className="h-5 hidden group-hover:block not-dark:invert cursor-pointer"
          />

        )}
      </div>

      {/* close mobile */}
      <img
        src={assets.close_icon}
        onClick={() => setIsMenuOpen(false)}
        className="absolute top-3 right-3 w-5 h-5 md:hidden cursor-pointer not-dark:invert"
      />
      {chatToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1E1B22] p-6 rounded-xl w-80 text-center space-y-4 shadow-xl">

            <p className="text-sm">
              Supprimer cette conversation?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setChatToDelete(null)}
                className="px-4 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  deleteChat(chatToDelete)
                  setChatToDelete(null)
                }}
                className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>

          </div>
        </div>
      )}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1E1B22] p-6 rounded-xl w-80 text-center space-y-4 shadow-xl">

            <p className="text-sm">
              Voulez-vous vraiment vous déconnecter?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  logout()
                  setShowLogoutConfirm(false)
                  navigate("/")
                }}
                className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Déconnexion
              </button>
            </div>

          </div>
        </div>
      )}

    </div>



  );
};

export default Sidebar;