import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Lightning, Gauge, WifiHigh, WifiMedium, WifiLow, WifiNone, Sliders, CheckCircle } from '@phosphor-icons/react';

const PROFILES = [
  { id: 'NONE', label: 'No Delay', icon: WifiHigh, desc: '~0ms', color: 'var(--success)' },
  { id: 'FAST_LAN', label: 'Fast LAN', icon: WifiHigh, desc: '~5ms', color: 'var(--success)' },
  { id: 'CABLE', label: 'Cable', icon: WifiMedium, desc: '~50ms', color: 'var(--primary)' },
  { id: 'SLOW_3G', label: 'Slow 3G', icon: WifiLow, desc: '~1500ms', color: 'var(--warning)' },
  { id: 'CUSTOM', label: 'Custom', icon: Sliders, desc: 'Configure below', color: 'var(--text-dim)' },
];

const LatencyProfilePanel = ({ projectId }) => {
  const { currentProject, updateProject } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const project = currentProject;
  const [selectedProfile, setSelectedProfile] = useState(project?.latencyProfile || 'NONE');
  const [globalLatencyMs, setGlobalLatencyMs] = useState(project?.globalLatencyMs || 0);
  const [jitterMs, setJitterMs] = useState(project?.jitterMs || 0);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProject(projectId, {
        latencyProfile: selectedProfile,
        globalLatencyMs: Number(globalLatencyMs),
        jitterMs: Number(jitterMs),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Gauge size={22} weight="bold" color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Latency Profile</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {PROFILES.map(p => {
          const Icon = p.icon;
          const isSelected = selectedProfile === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProfile(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${isSelected ? p.color : 'var(--glass-border)'}`,
                background: isSelected ? `rgba(from ${p.color} r g b / 0.08)` : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left',
              }}
            >
              <Icon size={18} weight="bold" color={p.color} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: isSelected ? p.color : 'var(--text-main)' }}>{p.label}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{p.desc}</span>
            </button>
          );
        })}
      </div>

      {selectedProfile === 'CUSTOM' && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>
              <span>Base Delay</span>
              <span style={{ color: 'var(--primary)' }}>{globalLatencyMs}ms</span>
            </label>
            <input type="range" min="0" max="5000" step="50"
              value={globalLatencyMs}
              onChange={(e) => setGlobalLatencyMs(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>
              <span>Jitter ±</span>
              <span style={{ color: 'var(--warning)' }}>±{jitterMs}ms</span>
            </label>
            <input type="range" min="0" max="500" step="10"
              value={jitterMs}
              onChange={(e) => setJitterMs(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--warning)' }} />
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={isSaving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
        {saved ? (
          <><CheckCircle size={18} weight="bold" /> Saved!</>
        ) : isSaving ? 'Saving...' : (
          <><Lightning size={18} weight="bold" /> Apply Profile</>
        )}
      </button>
    </div>
  );
};

export default LatencyProfilePanel;
