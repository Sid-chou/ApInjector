import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheckered, ShieldWarning, Bug, Timer, FileCode, Plugs, Info } from '@phosphor-icons/react';

const ChaosControlPanel = ({ projectId }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/projects/${projectId}/chaos`);
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to fetch chaos config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [projectId]);

  const updateConfig = async (newConfig) => {
    setConfig(newConfig); 
    try {
      await axios.put(`http://localhost:8080/api/projects/${projectId}/chaos`, newConfig);
    } catch (err) {
      console.error('Failed to update chaos config:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : parseInt(value, 10) || 0;
    
    const updated = { ...config, [name]: newValue };
    updateConfig(updated);
  };

  if (loading || !config) return <div className="glass-card">Initializing Chaos Cores...</div>;

  return (
    <div className="glass-card" style={{ 
      border: config.enabled ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--glass-border)',
      boxShadow: config.enabled ? '0 0 20px rgba(239, 68, 68, 0.1)' : 'var(--shadow-sm)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      {config.enabled && (
        <div style={{ position: 'absolute', top: -100, right: -100, width: 200, height: 200, background: 'rgba(239, 68, 68, 0.05)', filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, color: config.enabled ? 'var(--error)' : 'inherit', fontSize: '1.1rem' }}>
          {config.enabled ? <ShieldWarning size={24} weight="bold" /> : <ShieldCheckered size={24} weight="bold" />}
          Chaos Engine
        </h3>
        <label className="btn" style={{ 
          padding: '0.4rem 0.8rem', 
          background: config.enabled ? 'var(--error)' : 'rgba(100, 116, 139, 0.1)', 
          color: config.enabled ? 'white' : 'var(--text-dim)',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          <input 
            type="checkbox" 
            name="enabled" 
            checked={config.enabled} 
            onChange={handleChange} 
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{config.enabled ? 'ONLINE' : 'OFFLINE'}</span>
        </label>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
        Inject controlled failures into your mock system to validate resilience patterns.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: config.enabled ? 1 : 0.4, pointerEvents: config.enabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        
        {/* Error Rate */}
        <ChaosSlider 
          icon={<Bug size={18} weight="bold" color="var(--error)" />}
          label="Server Error Rate"
          name="errorRatePercent"
          value={config.errorRatePercent}
          onChange={handleChange}
          color="var(--error)"
        />

        {/* Latency Spikes */}
        <ChaosSlider 
          icon={<Timer size={18} weight="bold" color="var(--warning)" />}
          label="Latency Injection"
          name="latencySpikePercent"
          value={config.latencySpikePercent}
          onChange={handleChange}
          color="var(--warning)"
        />

        {/* Malformed Response */}
        <ChaosSlider 
          icon={<FileCode size={18} weight="bold" color="#a855f7" />}
          label="Malformed Payloads"
          name="malformedResponsePercent"
          value={config.malformedResponsePercent}
          onChange={handleChange}
          color="#a855f7"
        />

        {/* Connection Drops */}
        <ChaosSlider 
          icon={<Plugs size={18} weight="bold" color="#3b82f6" />}
          label="Connection Drops"
          name="connectionDropPercent"
          value={config.connectionDropPercent}
          onChange={handleChange}
          color="#3b82f6"
        />
      </div>

      {!config.enabled && (
        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Info size={18} color="var(--info)" weight="bold" style={{ marginTop: '2px' }} />
          <p style={{ color: '#1e40af', fontSize: '0.75rem', fontWeight: 500 }}>
            Engine is currently idle. Enable to simulate failure patterns across all defined project endpoints.
          </p>
        </div>
      )}
    </div>
  );
};

const ChaosSlider = ({ icon, label, name, value, onChange, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
        {icon}
        {label}
      </span>
      <span style={{ color: value > 0 ? color : 'var(--text-muted)' }}>{value}%</span>
    </div>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input 
        type="range" 
        name={name} 
        min="0" max="100" 
        value={value} 
        onChange={onChange} 
        style={{ 
          width: '100%', 
          height: '6px',
          appearance: 'none',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '3px',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      {/* Custom track fill emulation via inline style or CSS logic would go here, 
          but standard range input with accentColor is usually sufficient for polish */}
      <style>{`
        input[name="${name}"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.1s;
        }
        input[name="${name}"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  </div>
);

export default ChaosControlPanel;
