import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Billing from './pages/Billing'
import Projects from './pages/Projects'
import './App.css'

function App() {
  return (
    <>
      <nav style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
          Home
        </Link>
        <Link to="/projects" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
          Projects
        </Link>
        <Link to="/billing" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
          Billing
        </Link>
        <Link to="/about" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
          About
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  )
}

export default App
