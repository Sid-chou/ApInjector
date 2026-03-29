import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, ExternalLink, Trash2, Box } from 'lucide-react';
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <div className="loader">Loading your projects...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Your Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your mock API collections</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Create Project
        </button>
      </header>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', cursor: 'default' }}>
          <Box size={64} color="var(--border)" style={{ marginBottom: '1rem' }} />
          <h3>No projects yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Start by creating your first mock API project.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create New Project</button>
        </div>
      ) : (        <div className="dashboard-grid">
          {projects.map((project) => (
            <Link key={project.id} to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{project.name}</h3>
                  <span className={`badge ${project.active ? 'badge-green' : 'badge-orange'}`}>
                    {project.active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', height: '3rem', overflow: 'hidden' }}>
                  {project.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      0 Endpoints
                   </span>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.5rem' }} title="Open Mock URL">
                        <ExternalLink size={18} />
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.5rem', color: '#ef4444' }} title="Delete">
                        <Trash2 size={18} />
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
