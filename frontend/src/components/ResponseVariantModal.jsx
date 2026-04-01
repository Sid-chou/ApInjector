import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, CheckCircle, Trash, Star, ArrowCounterClockwise } from '@phosphor-icons/react';

const ResponseVariantModal = ({ isOpen, onClose, endpoint }) => {
  const [variants, setVariants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newVariant, setNewVariant] = useState({ name: '', statusCode: 200, body: '{}', contentType: 'application/json', isTemplate: false });
  const [isLoading, setIsLoading] = useState(false);

  const { fetchVariants, createVariant, deleteVariant, activateVariant, deactivateVariant } = useStore();

  const loadVariants = useCallback(async () => {
    if (!endpoint) return;
    setIsLoading(true);
    const data = await fetchVariants(endpoint.id);
    setVariants(data);
    setIsLoading(false);
  }, [endpoint, fetchVariants]);

  useEffect(() => {
    if (isOpen && endpoint) loadVariants();
  }, [isOpen, loadVariants, endpoint]);

  if (!isOpen || !endpoint) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    await createVariant(endpoint.id, newVariant);
    setIsAdding(false);
    setNewVariant({ name: '', statusCode: 200, body: '{}', contentType: 'application/json', isTemplate: false });
    loadVariants();
  };

  const handleDelete = async (variantId) => {
    await deleteVariant(variantId);
    loadVariants();
  };

  const handleActivate = async (variantId) => {
    await activateVariant(endpoint.id, variantId);
    loadVariants();
  };

  const handleDeactivate = async () => {
    await deactivateVariant(endpoint.id);
    loadVariants();
  };

  const statusColor = (code) => {
    if (code >= 500) return 'var(--error)';
    if (code >= 400) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-card" style={{ width: '680px', maxHeight: '90vh', overflowY: 'auto', cursor: 'default', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Response Variants</h2>
            <code style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{endpoint.method} {endpoint.path}</code>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Define multiple response variants. <strong>Activate</strong> one to serve it from the mock engine. The <Star size={12} weight="fill" /> marks the currently active variant.
        </p>

        {/* Active variant note */}
        {endpoint.activeVariantId && (
          <div className="glass-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', cursor: 'default', borderColor: 'var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
              <Star size={14} weight="fill" /> A variant is currently active
            </span>
            <button onClick={handleDeactivate} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
              <ArrowCounterClockwise size={14} weight="bold" /> Use base response
            </button>
          </div>
        )}

        {/* Variant list */}
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading variants...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {variants.length === 0 && !isAdding && (
              <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', cursor: 'default' }}>
                <p style={{ color: 'var(--text-muted)' }}>No variants yet. Create one below.</p>
              </div>
            )}
            {variants.map(v => {
              const isActive = endpoint.activeVariantId === v.id;
              return (
                <div key={v.id} className="glass-card" style={{
                  padding: '1rem 1.25rem', cursor: 'default',
                  borderColor: isActive ? 'var(--primary)' : undefined,
                  background: isActive ? 'rgba(99,102,241,0.05)' : undefined,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isActive && <Star size={14} weight="fill" color="var(--primary)" />}
                      <strong style={{ fontSize: '0.95rem' }}>{v.name}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: statusColor(v.statusCode), fontWeight: 700 }}>{v.statusCode}</span>
                      <span>{v.contentType}</span>
                      {v.isTemplate && <span style={{ color: 'var(--primary)' }}>Template</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isActive && (
                      <button onClick={() => handleActivate(v.id)} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                        Activate
                      </button>
                    )}
                    <button onClick={() => handleDelete(v.id)} className="btn btn-danger-ghost" style={{ padding: '0.4rem' }}>
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add variant form */}
        {isAdding ? (
          <form onSubmit={handleCreate} className="glass-card" style={{ padding: '1.5rem', cursor: 'default' }}>
            <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem' }}>New Variant</h4>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>Name</label>
                <input className="form-input" required placeholder="e.g. Success, Not Found" value={newVariant.name}
                  onChange={e => setNewVariant(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>Status</label>
                <input type="number" className="form-input" value={newVariant.statusCode}
                  onChange={e => setNewVariant(p => ({ ...p, statusCode: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>Response Body</label>
              <textarea className="form-input" rows="5" value={newVariant.body}
                onChange={e => setNewVariant(p => ({ ...p, body: e.target.value }))}
                style={{ fontFamily: 'monospace', fontSize: '13px', background: '#0f172a', color: '#e2e8f0' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" className="btn btn-primary">
                <CheckCircle size={18} weight="bold" /> Create Variant
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--border)' }}>
            <Plus size={18} weight="bold" /> Add Variant
          </button>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default ResponseVariantModal;
