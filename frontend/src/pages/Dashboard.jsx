import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, ArrowSquareOut, Trash, Cube, Sparkle, ChartBar } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';

const Dashboard = () => {
  const { projects, fetchProjects, isLoading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Sparkle size={48} color="var(--primary)" weight="duotone" className="pulse-icon" style={{ animationDuration: '1.5s', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Initializing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero" style={{ padding: '4rem 0 3rem', textAlign: 'left', background: 'none', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <ChartBar size={20} weight="bold" />
              Overview
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Your API Universe</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '600px' }}>
              Build, mock, and stress-test your communication layer with Netflix-grade resilience tools.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} weight="bold" />
            Create New Project
          </button>
        </div>
      </section>

      {projects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem', marginTop: '1rem' }}>
          <Cube size={80} weight="duotone" color="var(--border)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h2 style={{ marginBottom: '0.75rem' }}>No projects detected</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Every great system starts with a single mock. Create your first project to get started.
          </p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            Launch First Project
          </button>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
          {projects.map((project) => (
            <Link key={project.id} to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{project.name}</h3>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{project.slug}</code>
                  </div>
                  <span className={`badge ${project.active ? 'badge-success' : 'badge-warning'}`}>
                    {project.active ? 'LIVE' : 'IDLE'}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9375rem', marginBottom: '2rem', height: '3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                      <Cube size={16} weight="bold" />
                      {project.endpoints?.length || 0} Endpoints
                   </div>
                   <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.5rem' }} title="Visit Mock Server">
                        <ArrowSquareOut size={20} weight="bold" />
                      </button>
                      <button className="btn btn-danger-ghost" style={{ padding: '0.5rem' }} title="Delete Project">
                        <Trash size={20} weight="bold" />
                      </button>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
