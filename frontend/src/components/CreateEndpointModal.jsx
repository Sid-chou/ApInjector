import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, CheckCircle, Code, Clock, Terminal } from '@phosphor-icons/react';

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
    const formattedPath = path.startsWith('/') ? path : `/${path}`;

    await createEndpoint(projectId, {
      method,
      path: formattedPath,
      statusCode: Number(statusCode),
      contentType,
      delayMs: Number(delayMs),
      responseBody
    });
    
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
      background: 'rgba(15, 23, 42, 0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-card" style={{ width: '640px', maxHeight: '90vh', overflowY: 'auto', cursor: 'default', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Code size={32} weight="duotone" color="var(--primary)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Define Endpoint</h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '140px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Verb</label>
              <select
                className="form-input"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{ appearance: 'none', background: 'var(--bg-main) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center' }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Route Path</label>
              <input
                type="text"
                className="form-input"
                required
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/v1/resource/:id"
                style={{ fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Status Override</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={statusCode}
                  onChange={(e) => setStatusCode(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Latency (ms)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Clock size={18} weight="bold" style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  className="form-input"
                  value={delayMs}
                  onChange={(e) => setDelayMs(e.target.value)}
                  min="0"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={18} weight="bold" />
                Response Payload (JSON)
              </label>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>PRETTY PRINTED</span>
            </div>
            <textarea
              className="form-input"
              rows="10"
              value={responseBody}
              onChange={(e) => setResponseBody(e.target.value)}
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                background: '#0f172a',
                color: '#e2e8f0',
                border: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                padding: '1.25rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
             <button type="button" onClick={onClose} className="btn btn-ghost">Discard</button>
             <button type="submit" className="btn btn-primary" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
               <CheckCircle size={20} weight="bold" />
               Deploy Endpoint
             </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CreateEndpointModal;
