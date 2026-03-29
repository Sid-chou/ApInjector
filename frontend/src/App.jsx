import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Settings, Activity, Terminal } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="logo">
             <Activity size={32} strokeWidth={2.5} color="#6366f1" />
             <span>APInjector</span>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link to="/logs" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              <Terminal size={20} />
              Logs
            </Link>
            <button className="btn btn-primary">
              <Plus size={20} />
              New Project
            </button>
          </div>
        </nav>

        <main>
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
