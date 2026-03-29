import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createProject } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    await createProject({ name, slug, description });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ width: '500px', cursor: 'default', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Create New Project</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.25rem' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., E-commerce API"
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', outline: 'none', font: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description (Optional)</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this API collection is for..."
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', outline: 'none', font: 'inherit', resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
             <button type="submit" className="btn btn-primary">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
