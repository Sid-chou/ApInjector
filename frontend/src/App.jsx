import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { House, Plus, Pulse, TerminalWindow, IdentificationBadge, Broadcast } from '@phosphor-icons/react';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container nav-content">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
               <Broadcast size={32} weight="fill" />
               <span style={{ letterSpacing: '-0.02em' }}>APInjector</span>
            </Link>
            
            <div className="nav-links" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                <House size={20} weight="bold" />
                Dashboard
              </Link>
              <Link to="/logs" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                <TerminalWindow size={20} weight="bold" />
                Live Hub
              </Link>
              <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
              <button className="btn btn-primary">
                <Plus size={20} weight="bold" />
                Connect API
              </button>
            </div>
          </div>
        </nav>

        <main style={{ paddingBottom: '4rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
