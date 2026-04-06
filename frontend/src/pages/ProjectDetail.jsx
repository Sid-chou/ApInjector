import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  CaretLeft, Plus, GlobeHemisphereWest, Trash, PencilSimple, Gear,
  Play, Pause, Pulse, Broadcast, DotsThreeVertical, UploadSimple,
  FunnelSimple, Export, Broom, Rows, ChartBar, Stack
} from '@phosphor-icons/react';
import CreateEndpointModal from '../components/CreateEndpointModal';
import EditEndpointModal from '../components/EditEndpointModal';
import ResponseVariantModal from '../components/ResponseVariantModal';
import ImportSpecModal from '../components/ImportSpecModal';
import ChaosControlPanel from '../components/ChaosControlPanel';
import LatencyProfilePanel from '../components/LatencyProfilePanel';
import ChaosDashboard from '../components/ChaosDashboard';
import { Client } from '@stomp/stompjs';

const METHOD_COLORS = {
  GET: '#22c55e', POST: '#6366f1', PUT: '#f59e0b',
  PATCH: '#a855f7', DELETE: '#ef4444',
};

const ProjectDetail = () => {
  const { id } = useParams();
  const {
    currentProject, fetchProject, endpoints, fetchEndpoints,
    deleteEndpoint, toggleEndpoint, fetchLogs, clearLogs, exportLogs,
    isLoading
  } = useStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState(null);
  const [variantEndpoint, setVariantEndpoint] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Logs state
  const [liveLogs, setLiveLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'analytics'
  const [logFilter, setLogFilter] = useState({ method: '', status: '' });
  const [logPage, setLogPage] = useState(0);
  const [historicalLogs, setHistoricalLogs] = useState([]);
  const [clearConfirm, setClearConfirm] = useState(false);

  const loadHistoricalLogs = useCallback(async (page = 0, filters = {}) => {
    if (!id) return;
    await fetchLogs(id, filters, page);
    const { logs } = useStore.getState();
    setHistoricalLogs(logs);
  }, [id, fetchLogs]);

  useEffect(() => {
    fetchProject(id);
    fetchEndpoints(id);
    loadHistoricalLogs();

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        client.subscribe(`/topic/logs/${id}`, (msg) => {
          if (msg.body) {
            const incomingLog = JSON.parse(msg.body);
            setLiveLogs((prev) => [incomingLog, ...prev].slice(0, 100));
            setHistoricalLogs((prev) => [incomingLog, ...prev].slice(0, 200));
          }
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, [id, fetchProject, fetchEndpoints, loadHistoricalLogs]);

  const handleApplyFilter = () => {
    const filters = {};
    if (logFilter.method) filters.method = logFilter.method;
    if (logFilter.status) filters.status = logFilter.status;
    loadHistoricalLogs(0, filters);
    setLogPage(0);
  };

  const handleClearLogs = async () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    await clearLogs(id);
    setLiveLogs([]);
    setHistoricalLogs([]);
    setClearConfirm(false);
  };

  const handleExport = (format) => exportLogs(id, format);

  const displayedLogs = historicalLogs.length > 0 ? historicalLogs : liveLogs;

  if (isLoading || !currentProject) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Broadcast size={48} color="var(--primary)" weight="duotone" className="pulse-icon" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Syncing with project node...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0 4rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <Link to="/" className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <CaretLeft size={16} weight="bold" />
          Dashboard / {currentProject.slug}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: 0 }}>{currentProject.name}</h1>
              <span className={`badge ${currentProject.active ? 'badge-success' : 'badge-warning'}`}>
                {currentProject.active ? 'OPERATIONAL' : 'PAUSED'}
              </span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>{currentProject.description || 'No description provided.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost" onClick={() => setIsImportOpen(true)}>
              <UploadSimple size={18} weight="bold" /> Import OpenAPI
            </button>
            <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={20} weight="bold" /> New Endpoint
            </button>
          </div>
        </div>
      </header>

      {/* URL Banner */}
      <section className="glass-card" style={{ marginBottom: '3rem', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'var(--primary)', cursor: 'default', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'white', display: 'flex', alignItems: 'center' }}>
          <GlobeHemisphereWest size={28} weight="duotone" />
        </div>
        <div>
          <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '0.25rem' }}>Target Gateway</h4>
          <code style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 600 }}>
            http://localhost:8080/m/{currentProject.slug}
          </code>
        </div>
      </section>

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
        {/* Endpoints list */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Defined Endpoints</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>{endpoints.length} Total</span>
          </div>

          {endpoints.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', cursor: 'default' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This project has no endpoints defined yet.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setIsImportOpen(true)}>
                  <UploadSimple size={18} weight="bold" /> Import OpenAPI
                </button>
                <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>Initialize First Endpoint</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {endpoints.map((endpoint) => (
                <div key={endpoint.id} className="glass-card" style={{ cursor: 'default', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{
                        background: `${METHOD_COLORS[endpoint.method] || '#6366f1'}22`,
                        color: METHOD_COLORS[endpoint.method] || '#6366f1',
                        border: `1px solid ${METHOD_COLORS[endpoint.method] || '#6366f1'}44`,
                        padding: '0.2rem 0.6rem', borderRadius: '4px',
                        fontWeight: 800, fontSize: '0.75rem', minWidth: '58px', textAlign: 'center',
                        letterSpacing: '0.04em'
                      }}>{endpoint.method}</span>
                      <div>
                        <code style={{ fontSize: '1rem', fontWeight: 600, color: endpoint.active ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {endpoint.path}
                        </code>
                        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          <span style={{ color: endpoint.statusCode >= 400 ? 'var(--error)' : 'var(--success)' }}>
                            {endpoint.statusCode}
                          </span>
                          <span>{endpoint.contentType}</span>
                          {endpoint.delayMs > 0 && <span>+{endpoint.delayMs}ms</span>}
                          {endpoint.isTemplate && <span style={{ color: 'var(--primary)' }}>Template</span>}
                          {endpoint.activeVariantId && <span style={{ color: 'var(--warning)' }}>Variant Active</span>}
                          {!endpoint.active && <span style={{ color: 'var(--error)' }}>DISABLED</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.45rem', fontSize: '0.75rem' }}
                        title={endpoint.active ? 'Pause' : 'Enable'}
                        onClick={() => toggleEndpoint(id, endpoint.id)}>
                        {endpoint.active ? <Pause size={17} weight="bold" /> : <Play size={17} weight="bold" />}
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.45rem' }} title="Edit"
                        onClick={() => setEditEndpoint(endpoint)}>
                        <PencilSimple size={17} weight="bold" />
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.45rem', fontSize: '0.75rem' }}
                        title="Response Variants"
                        onClick={() => setVariantEndpoint(endpoint)}>
                        <Stack size={17} weight="bold" />
                      </button>
                      <button className="btn btn-danger-ghost" style={{ padding: '0.45rem' }} title="Delete"
                        onClick={() => deleteEndpoint(id, endpoint.id)}>
                        <Trash size={17} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Pulse size={22} weight="bold" color="var(--error)" />
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Chaos Mode</h2>
            </div>
            <ChaosControlPanel projectId={id} />
          </div>
          <LatencyProfilePanel projectId={id} />
        </aside>
      </div>

      {/* Logs / Analytics section */}
      <section style={{ marginTop: '4rem' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            {[
              { key: 'logs', label: 'Monitoring Station', icon: Rows },
              { key: 'analytics', label: 'Analytics', icon: ChartBar },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.25rem', border: 'none', cursor: 'pointer',
                  background: activeTab === key ? 'var(--primary)' : 'transparent',
                  color: activeTab === key ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
                }}>
                <Icon size={16} weight="bold" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'logs' && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Filter controls */}
              <select className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                value={logFilter.method} onChange={e => setLogFilter(p => ({ ...p, method: e.target.value }))}>
                <option value="">All Methods</option>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
              </select>
              <input type="number" className="form-input" placeholder="Status" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: '90px' }}
                value={logFilter.status} onChange={e => setLogFilter(p => ({ ...p, status: e.target.value }))} />
              <button className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={handleApplyFilter}>
                <FunnelSimple size={14} weight="bold" /> Filter
              </button>

              {/* Export & Clear */}
              <button className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleExport('csv')}>
                <Export size={14} weight="bold" /> CSV
              </button>
              <button className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleExport('json')}>
                <Export size={14} weight="bold" /> JSON
              </button>
              <button
                className={clearConfirm ? 'btn btn-danger-ghost' : 'btn btn-ghost'}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                onClick={handleClearLogs}
                onBlur={() => setTimeout(() => setClearConfirm(false), 2000)}>
                <Broom size={14} weight="bold" /> {clearConfirm ? 'Confirm?' : 'Clear'}
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                STOMP Live
              </span>
            </div>
          )}
        </div>

        {activeTab === 'analytics' ? (
          <ChaosDashboard projectId={id} liveLogs={liveLogs} />
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {displayedLogs.length === 0 ? (
              <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Broadcast size={48} weight="thin" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Standing by for incoming requests...</p>
              </div>
            ) : (
              <>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Time</th>
                      <th style={{ width: '90px' }}>Method</th>
                      <th>Path</th>
                      <th style={{ width: '90px' }}>Status</th>
                      <th style={{ width: '110px' }}>Latency</th>
                      <th style={{ textAlign: 'right' }}>Anomalies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedLogs.map((log) => (
                      <tr key={log.id} style={{ transition: 'all 0.2s ease' }}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                        </td>
                        <td>
                          <span style={{
                            background: `${METHOD_COLORS[log.method] || '#6366f1'}22`,
                            color: METHOD_COLORS[log.method] || '#6366f1',
                            padding: '0.15rem 0.5rem', borderRadius: '3px',
                            fontWeight: 800, fontSize: '0.7rem'
                          }}>{log.method}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{log.path}</td>
                        <td>
                          <span className={`badge ${log.responseStatus >= 500 ? 'badge-danger' : log.responseStatus >= 400 ? 'badge-warning' : 'badge-success'}`}>
                            {log.responseStatus}
                          </span>
                        </td>
                        <td style={{ color: log.latencyMs > 500 ? 'var(--warning)' : 'var(--text-dim)', fontWeight: 600 }}>
                          {log.latencyMs}ms
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {log.wasChaos ? (
                            <span className="badge badge-danger" style={{ fontSize: '0.68rem', border: '1px solid currentColor' }}>
                              {log.chaosType}
                            </span>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <button className="btn btn-ghost" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                    disabled={logPage === 0}
                    onClick={() => { const p = logPage - 1; setLogPage(p); loadHistoricalLogs(p, logFilter); }}>
                    ← Prev
                  </button>
                  <span style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Page {logPage + 1}
                  </span>
                  <button className="btn btn-ghost" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                    onClick={() => { const p = logPage + 1; setLogPage(p); loadHistoricalLogs(p, logFilter); }}>
                    Next →
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Modals */}
      <CreateEndpointModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} projectId={id} />
      <EditEndpointModal isOpen={!!editEndpoint} onClose={() => setEditEndpoint(null)} projectId={id} endpoint={editEndpoint} />
      <ResponseVariantModal isOpen={!!variantEndpoint} onClose={() => setVariantEndpoint(null)} endpoint={variantEndpoint} />
      <ImportSpecModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} projectId={id} />
    </div>
  );
};

export default ProjectDetail;
