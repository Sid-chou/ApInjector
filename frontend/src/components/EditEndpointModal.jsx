import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, CheckCircle, Code, Clock, Terminal, Lightbulb } from '@phosphor-icons/react';

const PLACEHOLDER_HINTS = [
  '{{timestamp}}', '{{uuid}}', '{{randomInt}}',
  '{{faker.name.fullName}}', '{{faker.name.firstName}}', '{{faker.internet.email}}',
  '{{faker.internet.url}}', '{{faker.address.city}}', '{{faker.company.name}}',
  '{{request.query.id}}', '{{request.body.fieldName}}', '{{request.header.Authorization}}',
];

const EditEndpointModal = ({ isOpen, onClose, projectId, endpoint }) => {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [statusCode, setStatusCode] = useState(200);
  const [contentType, setContentType] = useState('application/json');
  const [delayMs, setDelayMs] = useState(0);
  const [responseBody, setResponseBody] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const { updateEndpoint } = useStore();

  useEffect(() => {
    if (endpoint) {
      setMethod(endpoint.method || 'GET');
      setPath(endpoint.path || '');
      setStatusCode(endpoint.statusCode || 200);
      setContentType(endpoint.contentType || 'application/json');
      setDelayMs(endpoint.delayMs || 0);
      setResponseBody(endpoint.responseBody || '');
      setIsTemplate(endpoint.isTemplate || false);
    }
  }, [endpoint]);

  if (!isOpen || !endpoint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    await updateEndpoint(projectId, endpoint.id, {
      method, path: formattedPath,
      statusCode: Number(statusCode), contentType,
      delayMs: Number(delayMs), responseBody, isTemplate,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-card" style={{ width: '680px', maxHeight: '92vh', overflowY: 'auto', cursor: 'default', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Code size={32} weight="duotone" color="var(--primary)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Edit Endpoint</h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '140px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Verb</label>
              <select className="form-input" value={method} onChange={(e) => setMethod(e.target.value)}
                style={{ appearance: 'none' }}>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Route Path</label>
              <input type="text" className="form-input" required value={path}
                onChange={(e) => setPath(e.target.value)} placeholder="/v1/resource/:id"
                style={{ fontFamily: 'monospace' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Status Code</label>
              <input type="number" className="form-input" required value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Latency (ms)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Clock size={18} weight="bold" style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input type="number" className="form-input" value={delayMs} min="0"
                  onChange={(e) => setDelayMs(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
          </div>

          {/* Template toggle */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Dynamic Templates</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Use {'{{placeholder}}'} variables in your response body</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button type="button" onClick={() => setShowHints(!showHints)}
                className="btn btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                <Lightbulb size={14} weight="bold" /> Hints
              </button>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: isTemplate ? 'var(--primary)' : 'var(--border)',
                  borderRadius: '12px', transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: isTemplate ? '23px' : '3px',
                    width: '18px', height: '18px',
                    background: '#fff', borderRadius: '50%', transition: '0.3s'
                  }} />
                </span>
              </label>
            </div>
          </div>

          {showHints && (
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', cursor: 'default' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)' }}>AVAILABLE PLACEHOLDERS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {PLACEHOLDER_HINTS.map(p => (
                  <code key={p} onClick={() => setResponseBody(prev => prev + p)}
                    style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', userSelect: 'none' }}>
                    {p}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
              <Terminal size={18} weight="bold" /> Response Payload
            </label>
            <textarea className="form-input" rows="10" value={responseBody}
              onChange={(e) => setResponseBody(e.target.value)}
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', lineHeight: '1.6', background: '#0f172a', color: '#e2e8f0', border: 'none', padding: '1.25rem', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Discard</button>
            <button type="submit" className="btn btn-primary" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <CheckCircle size={20} weight="bold" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default EditEndpointModal;
