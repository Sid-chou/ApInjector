import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, UploadSimple, CheckCircle, Warning, FileCode } from '@phosphor-icons/react';

const EXAMPLE_SPEC = `{
  "openapi": "3.0.0",
  "info": { "title": "Sample API", "version": "1.0.0" },
  "paths": {
    "/users": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "example": [{"id": 1, "name": "Alice"}]
              }
            }
          }
        }
      }
    }
  }
}`;

const ImportSpecModal = ({ isOpen, onClose, projectId }) => {
  const [spec, setSpec] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { importOpenApiSpec } = useStore();

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!spec.trim()) { setError('Please paste your OpenAPI spec first.'); return; }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await importOpenApiSpec(projectId, spec);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSpec('');
    setResult(null);
    setError(null);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSpec(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-panel" style={{ width: '720px', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileCode size={32} weight="duotone" color="var(--primary)" />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Import OpenAPI Spec</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports OpenAPI 3.0 & Swagger 2.0 — JSON or YAML</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Result banner */}
        {result && (
          <div className="glass-card" style={{
            padding: '1.25rem', margin: '1.5rem 0',
            cursor: 'default', borderColor: 'var(--success)',
            background: 'rgba(34, 197, 94, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <CheckCircle size={24} weight="fill" color="var(--success)" />
              <strong style={{ color: 'var(--success)', fontSize: '1.05rem' }}>Import Complete</strong>
            </div>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
              <span>✅ <strong>{result.imported}</strong> endpoints imported</span>
              <span>⏭ <strong>{result.skipped}</strong> skipped (duplicates)</span>
              {result.errors?.length > 0 && (
                <span style={{ color: 'var(--warning)' }}>⚠ <strong>{result.errors.length}</strong> errors</span>
              )}
            </div>
            {result.errors?.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                {result.errors.map((e, i) => (
                  <p key={i} style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: 'var(--error)', fontFamily: 'monospace' }}>• {e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="glass-card" style={{ padding: '1rem', margin: '1.5rem 0', cursor: 'default', borderColor: 'var(--error)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)' }}>
              <Warning size={20} weight="fill" /> {error}
            </div>
          </div>
        )}

        {!result && (
          <>
            <div style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label className="btn btn-ghost" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                <UploadSimple size={18} weight="bold" /> Upload File
                <input type="file" accept=".json,.yaml,.yml" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>or paste below</span>
              <button onClick={() => setSpec(EXAMPLE_SPEC)} className="btn btn-ghost" style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>
                Load example
              </button>
            </div>

            <textarea
              className="form-input"
              rows="18"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="Paste your OpenAPI 3.0 or Swagger 2.0 JSON/YAML here..."
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '12.5px', lineHeight: '1.7',
                background: '#0f172a', color: '#e2e8f0',
                border: 'none', padding: '1.5rem', resize: 'vertical',
                width: '100%', boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <button onClick={handleClose} className="btn btn-ghost">Cancel</button>
              <button onClick={handleImport} className="btn btn-primary" disabled={isLoading}
                style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                {isLoading ? 'Importing...' : (
                  <><FileCode size={20} weight="bold" /> Import Endpoints</>
                )}
              </button>
            </div>
          </>
        )}

        {result && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={handleClose} className="btn btn-primary">Done</button>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default ImportSpecModal;
