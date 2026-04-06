import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Sparkle } from '@phosphor-icons/react';

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
    <div className="modal-overlay">
      <div className="glass-card modal-panel" style={{ width: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkle size={32} weight="duotone" color="var(--primary)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>New Project</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Namespace / Project Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Nexus Core Systems"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Context Description</label>
            <textarea
              className="form-input"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Define the scope of this API mock collection..."
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
             <button type="button" onClick={onClose} className="btn btn-ghost">Discard</button>
             <button type="submit" className="btn btn-primary">Initialize Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
