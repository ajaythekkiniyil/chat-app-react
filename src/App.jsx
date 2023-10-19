import './chat.scss'
import ChatScreen from './components/ChatScreen'
import Login from './components/Login'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const userId = localStorage.getItem('userId')
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chats" element={userId ? <ChatScreen /> : <Navigate to="/" />} />
      </Routes>

    </Router>
  )
}

export default App
