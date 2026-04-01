import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { ChartPieSlice, Timer, Atom, ShieldWarning, ArrowsClockwise } from '@phosphor-icons/react';

const CHAOS_COLORS = {
  SERVER_ERROR:       '#ef4444',
  CONNECTION_DROP:    '#a855f7',
  MALFORMED_RESPONSE: '#f97316',
  LATENCY_SPIKE:      '#eab308',
};

const StatCard = ({ label, value, sub, color }) => (
  <div className="glass-card" style={{ padding: '1.25rem 1.5rem', cursor: 'default', flex: 1 }}>
    <p style={{ margin: '0 0 0.35rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</p>
    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: color || 'var(--text-main)' }}>{value}</p>
    {sub && <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card" style={{ padding: '0.75rem 1rem', cursor: 'default', fontSize: '0.85rem' }}>
      {label && <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--text-dim)' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color || 'var(--primary)' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const ChaosDashboard = ({ projectId, liveLogs }) => {
  const { fetchLogStats, logStats } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    await fetchLogStats(projectId);
    setIsLoading(false);
  }, [projectId, fetchLogStats]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [loadStats]);

  const stats = logStats;

  // Build pie data from chaos breakdown
  const pieData = stats ? Object.entries(stats.chaosBreakdown || {}).map(([name, value]) => ({ name, value })) : [];

  // Build timeline from last 20 live logs
  const timelineData = (liveLogs || []).slice(0, 20).reverse().map((log, i) => ({
    name: i + 1,
    latency: log.latencyMs,
    status: log.responseStatus,
    chaos: log.wasChaos ? 1 : 0,
  }));

  // Reliability table
  const reliabilityData = stats?.endpointReliability || [];

  if (isLoading && !stats) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <ArrowsClockwise size={32} weight="bold" className="pulse-icon" style={{ marginBottom: '1rem' }} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  const totalReqs = stats?.totalRequests ?? 0;
  const chaosRate = stats?.chaosRatePercent?.toFixed(1) ?? '0.0';
  const avgLatency = stats?.avgLatencyMs?.toFixed(0) ?? '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <StatCard label="Total Requests" value={totalReqs.toLocaleString()} sub="All time" />
        <StatCard label="Chaos Rate" value={`${chaosRate}%`} sub={`${stats?.chaosCount ?? 0} injections`} color={Number(chaosRate) > 20 ? 'var(--error)' : 'var(--warning)'} />
        <StatCard label="Avg Latency" value={`${avgLatency}ms`} sub="All endpoints" color={Number(avgLatency) > 500 ? 'var(--warning)' : 'var(--success)'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Chaos type breakdown pie */}
        <div className="glass-card" style={{ padding: '1.5rem', cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ChartPieSlice size={20} weight="duotone" color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Chaos Breakdown</h4>
          </div>
          {pieData.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No chaos events recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CHAOS_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Latency timeline */}
        <div className="glass-card" style={{ padding: '1.5rem', cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Timer size={20} weight="duotone" color="var(--warning)" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Latency Timeline</h4>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 20 requests</span>
          </div>
          {timelineData.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No requests recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="ms" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={2} dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.chaos) return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill="#ef4444" />;
                  return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#6366f1" />;
                }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Endpoint reliability */}
      {reliabilityData.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem', cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ShieldWarning size={20} weight="duotone" color="var(--success)" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Endpoint Reliability</h4>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(120, reliabilityData.length * 36)}>
            <BarChart data={reliabilityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="path" width={150} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, 'Success Rate']} />
              <Bar dataKey="successRate" name="Success Rate" fill="#22c55e" radius={[0, 4, 4, 0]}>
                {reliabilityData.map((entry, i) => (
                  <Cell key={i} fill={entry.successRate >= 95 ? '#22c55e' : entry.successRate >= 70 ? '#eab308' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '-0.5rem' }}>
        <button onClick={loadStats} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
          <ArrowsClockwise size={14} weight="bold" /> Refresh
        </button>
        <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-refreshes every 15s</span>
      </div>
    </div>
  );
};

export default ChaosDashboard;
