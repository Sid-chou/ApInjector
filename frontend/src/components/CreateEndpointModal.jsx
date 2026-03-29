import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Check } from 'lucide-react';

const CreateEndpointModal = ({ isOpen, onClose, projectId }) => {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [statusCode, setStatusCode] = useState(200);
  const [contentType, setContentType] = useState('application/json');
  const [delayMs, setDelayMs] = useState(0);
  const [responseBody, setResponseBody] = useState('{\n  "message": "success"\n}');
  
  const { createEndpoint } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-fix path to start with /
    const formattedPath = path.startsWith('/') ? path : `/${path}`;

    await createEndpoint(projectId, {
      method,
      path: formattedPath,
      statusCode: Number(statusCode),
      contentType,
      delayMs: Number(delayMs),
      responseBody
    });
    
    // Reset form
    setMethod('GET');
    setPath('');
    setStatusCode(200);
    setDelayMs(0);
    setResponseBody('{\n  "message": "success"\n}');
    
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', cursor: 'default', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Create New Endpoint</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.25rem' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', outline: 'none', font: 'inherit',
                  background: 'var(--bg-main)'
                }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Path</label>
              <input
                type="text"
                required
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/users/:id"
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', outline: 'none', font: 'inherit',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Status Code</label>
              <input
                type="number"
                required
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', outline: 'none', font: 'inherit'
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Delay (ms)</label>
              <input
                type="number"
                value={delayMs}
                onChange={(e) => setDelayMs(e.target.value)}
                min="0"
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', outline: 'none', font: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Response Body</label>
            <textarea
              rows="8"
              value={responseBody}
              onChange={(e) => setResponseBody(e.target.value)}
              style={{
                width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', outline: 'none', 
                fontFamily: 'monospace', fontSize: '14px', resize: 'vertical',
                background: '#1e1e1e', color: '#d4d4d4'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
             <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
             <button type="submit" className="btn btn-primary">
               <Check size={18} /> Save Endpoint
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEndpointModal;
