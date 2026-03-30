import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Zap, AlertTriangle, Unplug } from 'lucide-react';

const ChaosControlPanel = ({ projectId }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial config
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
    setConfig(newConfig); // optimistic update
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

  if (loading || !config) return <div className="card">Loading Chaos Panel...</div>;

  return (
    <div className="card" style={{ border: config.enabled ? '1px solid #ef4444' : '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: config.enabled ? '#ef4444' : 'inherit' }}>
          <ShieldAlert size={20} /> Chaos Mode
        </h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            name="enabled" 
            checked={config.enabled} 
            onChange={handleChange} 
            style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
          />
          <strong>{config.enabled ? 'Enabled' : 'Disabled'}</strong>
        </label>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Inject random failures into your mock endpoints to test frontend resilience. Applies to all endpoints in this project.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', opacity: config.enabled ? 1 : 0.5 }}>
        
        {/* Error Rate */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} color="#ef4444"/> 5xx Error Rate</span>
            <span>{config.errorRatePercent}%</span>
          </label>
          <input 
            type="range" 
            name="errorRatePercent" 
            min="0" max="100" 
            value={config.errorRatePercent} 
            onChange={handleChange} 
            disabled={!config.enabled}
            style={{ width: '100%', accentColor: '#ef4444' }}
          />
        </div>

        {/* Latency Spikes */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={14} color="#eab308" /> Latency Spikes</span>
            <span>{config.latencySpikePercent}%</span>
          </label>
          <input 
            type="range" 
            name="latencySpikePercent" 
            min="0" max="100" 
            value={config.latencySpikePercent} 
            onChange={handleChange} 
            disabled={!config.enabled}
            style={{ width: '100%', accentColor: '#eab308' }}
          />
        </div>

        {/* Malformed Response */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} color="#f97316"/> Malformed Bodies</span>
            <span>{config.malformedResponsePercent}%</span>
          </label>
          <input 
            type="range" 
            name="malformedResponsePercent" 
            min="0" max="100" 
            value={config.malformedResponsePercent} 
            onChange={handleChange} 
            disabled={!config.enabled}
            style={{ width: '100%', accentColor: '#f97316' }}
          />
        </div>

        {/* Connection Drops */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Unplug size={14} color="#8b5cf6"/> Connection Drops</span>
            <span>{config.connectionDropPercent}%</span>
          </label>
          <input 
            type="range" 
            name="connectionDropPercent" 
            min="0" max="100" 
            value={config.connectionDropPercent} 
            onChange={handleChange} 
            disabled={!config.enabled}
            style={{ width: '100%', accentColor: '#8b5cf6' }}
          />
        </div>

      </div>
    </div>
  );
};

export default ChaosControlPanel;
