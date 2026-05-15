import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import './App.css'

function App() {
  return (
    <>
      <nav style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
          Home
        </Link>
        <Link to="/about" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
          About
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  )
}

export default App
