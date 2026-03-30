import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CaretLeft, Plus, GlobeHemisphereWest, Trash, PencilSimple, Gear, Play, Pause, Pulse, Broadcast } from '@phosphor-icons/react';
import CreateEndpointModal from '../components/CreateEndpointModal';
import ChaosControlPanel from '../components/ChaosControlPanel';
import { Client } from '@stomp/stompjs';

const ProjectDetail = () => {
  const { id } = useParams();
  const { currentProject, fetchProject, endpoints, fetchEndpoints, deleteEndpoint, isLoading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchProject(id);
    fetchEndpoints(id);

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        client.subscribe(`/topic/logs/${id}`, (msg) => {
          if (msg.body) {
            const incomingLog = JSON.parse(msg.body);
            setLogs((prevLogs) => [incomingLog, ...prevLogs].slice(0, 50));
          }
        });
      },
    });
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [id, fetchProject, fetchEndpoints]);

  if (isLoading || !currentProject) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Broadcast size={48} color="var(--primary)" weight="duotone" className="pulse-icon" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Syncing with project node...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
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
            <button className="btn btn-ghost">
              <Gear size={20} weight="bold" />
              Settings
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} weight="bold" />
              New Endpoint
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
        {/* Endpoints List */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Defined Endpoints</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>{endpoints.length} Total</span>
          </div>
          
          {endpoints.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', cursor: 'default' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This project has no endpoints defined yet.</p>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Initialize First Endpoint</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {endpoints.map((endpoint) => (
                <div key={endpoint.id} className="glass-card" style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span className="badge badge-indigo" style={{ minWidth: '60px', textAlign: 'center', fontWeight: 800 }}>
                      {endpoint.method}
                    </span>
                    <div>
                      <code style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{endpoint.path}</code>
                      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }}></span>
                          {endpoint.statusCode} OK
                        </span>
                        <span>{endpoint.contentType}</span>
                        {endpoint.delayMs > 0 && <span>+{endpoint.delayMs}ms Delay</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                     <button className="btn btn-ghost" style={{ padding: '0.5rem' }} title={endpoint.active ? 'Pause' : 'Start'}>
                        {endpoint.active ? <Pause size={20} weight="bold" /> : <Play size={20} weight="bold" />}
                     </button>
                     <button className="btn btn-ghost" style={{ padding: '0.5rem' }} title="Edit">
                        <PencilSimple size={20} weight="bold" />
                     </button>
                     <button className="btn btn-danger-ghost" style={{ padding: '0.5rem' }} title="Delete" onClick={() => deleteEndpoint(currentProject.id, endpoint.id)}>
                        <Trash size={20} weight="bold" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar: Chaos Settings */}
        <aside>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
             <Pulse size={24} weight="bold" color="var(--error)" /> 
             <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Chaos Mode</h2>
          </div>
          <ChaosControlPanel projectId={id} />
        </aside>
      </div>

      {/* Live Logs Table */}
      <section style={{ marginTop: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
           <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              Monitoring Station
              <span className="pulse-icon"></span>
           </h2>
           <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real-time STOMP Stream
           </span>
        </div>
        
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Broadcast size={48} weight="thin" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Standing by for incoming requests...</p>
            </div>
          ) : (
            <table className="premium-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Timestamp</th>
                  <th style={{ width: '100px' }}>Method</th>
                  <th>Path</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '120px' }}>Latency</th>
                  <th style={{ textAlign: 'right' }}>Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((logEntry) => (
                  <tr key={logEntry.id} style={{ transition: 'all 0.2s ease' }}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {new Date(logEntry.timestamp).toLocaleTimeString([], { hour12: false })}
                    </td>
                    <td>
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{logEntry.method}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {logEntry.path}
                    </td>
                    <td>
                      <span className={`badge ${logEntry.responseStatus >= 400 ? 'badge-danger' : 'badge-success'}`}>
                        {logEntry.responseStatus}
                      </span>
                    </td>
                    <td style={{ color: logEntry.latencyMs > 500 ? 'var(--warning)' : 'var(--text-dim)', fontWeight: 600 }}>
                      {logEntry.latencyMs}ms
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {logEntry.wasChaos ? (
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem', border: '1px solid currentColor' }}>
                          {logEntry.chaosType}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <CreateEndpointModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectId={id} 
      />
    </div>
  );
};

export default ProjectDetail;
