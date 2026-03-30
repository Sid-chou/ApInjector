import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Plus, Globe, Trash2, Edit3, Settings, Play, Pause, Activity } from 'lucide-react';
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
      debug: (str) => console.log('STOMP: ' + str),
      onChangeState: (state) => console.log('STOMP state: ', state),
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
    return <div className="container" style={{ padding: '100px' }}>Loading project...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/" className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: '1rem' }}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>{currentProject.name}</h1>
              <span className={`badge ${currentProject.active ? 'badge-green' : 'badge-orange'}`}>
                {currentProject.active ? 'Active' : 'Paused'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>{currentProject.description || 'No description provided.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost">
              <Settings size={20} />
              Setup
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              New Endpoint
            </button>
          </div>
        </div>
      </header>

      <section className="card" style={{ marginBottom: '2rem', background: 'var(--primary-light)', borderColor: 'var(--primary)', cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <Globe size={24} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--primary-hover)' }}>Base Mock URL</h4>
            <code style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
              http://localhost:8080/m/{currentProject.slug}
            </code>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1.5rem' }}>Endpoints</h2>
        {endpoints.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', cursor: 'default' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No endpoints defined for this project.</p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create Your First Endpoint</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="card" style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span className={`badge badge-blue`} style={{ width: '60px', textAlign: 'center' }}>
                    {endpoint.method}
                  </span>
                  <div>
                    <code style={{ fontSize: '1.1rem', fontWeight: 600 }}>{endpoint.path}</code>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Status: {endpoint.statusCode}</span>
                      <span>Type: {endpoint.contentType}</span>
                      {endpoint.delayMs > 0 && <span>Latency: {endpoint.delayMs}ms</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn btn-ghost" title={endpoint.active ? 'Pause' : 'Start'}>
                      {endpoint.active ? <Pause size={18} /> : <Play size={18} />}
                   </button>
                   <button className="btn btn-ghost" title="Edit">
                      <Edit3 size={18} />
                   </button>
                   <button className="btn btn-ghost" style={{ color: '#ef4444' }} title="Delete" onClick={() => deleteEndpoint(currentProject.id, endpoint.id)}>
                      <Trash2 size={18} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: '3rem' }}>
         <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} /> Chaos Settings
         </h2>
         <ChaosControlPanel projectId={id} />
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Live Request Logs</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Waiting for incoming requests... Try pinging your mock URL!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-document)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Time</th>
                  <th style={{ padding: '1rem' }}>Method & Path</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Latency</th>
                  <th style={{ padding: '1rem' }}>Chaos Event</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((logEntry) => (
                  <tr key={logEntry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {new Date(logEntry.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 600, marginRight: '8px' }}>{logEntry.method}</span>
                      {logEntry.path}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${logEntry.responseStatus >= 400 ? 'badge-orange' : 'badge-green'}`}>
                        {logEntry.responseStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{logEntry.latencyMs}ms</td>
                    <td style={{ padding: '1rem' }}>
                      {logEntry.wasChaos ? (
                        <span className="badge" style={{ background: '#fecaca', color: '#991b1b', border: '1px solid #f87171' }}>
                          {logEntry.chaosType}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
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
