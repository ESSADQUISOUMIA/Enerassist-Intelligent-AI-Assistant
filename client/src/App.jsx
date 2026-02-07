import React from "react"
import Sidebar from "./components/Sidebar"
import { Routes, Route, useLocation } from "react-router-dom"
import Login from "./pages/login"
import ChatBox from "./components/ChatBox"
import { assets } from "../assets/assets"
import '../assets/prism.css'
import Loading from "./pages/Loading"
import { useAppContext } from "./context/AppContext"
import LandingPage from "./pages/LandingPage"

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { pathname } = useLocation()
  // Only show sidebar if user is logged in, not on login page, and NOT in onboarding
  const { user, appLoading, isOnboarding } = useAppContext()
  const showSidebar = user && pathname !== '/login' && !isOnboarding

  return (
    <>
      {showSidebar && !isMenuOpen && <img src={assets.menu_icon} className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert" onClick={() => setIsMenuOpen(true)} />}
      <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
        <div className='flex h-screen w-screen'>
          {showSidebar && <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}
          <Routes>
            <Route path='/' element={user ? <ChatBox /> : <LandingPage />} />
            <Route path="/login" element={<Login />} />
          </Routes>

        </div>
      </div>
    </>
  )
}

export default App