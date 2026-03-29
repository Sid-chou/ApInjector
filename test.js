const apiUrl = 'http://localhost:8080/api';
const mockUrl = 'http://localhost:8080/m';

async function test() {
  try {
    const pRes = await fetch(`${apiUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Test', slug: 'e2e-test', description: 'Testing end to end' })
    });
    
    // Ignore error if project exists
    let project = await pRes.json();
    if (project.error) {
       console.log("Project already exists maybe. Getting ID...");
       const ps = await fetch(`${apiUrl}/projects`).then(r=>r.json());
       project = ps.find(p => p.slug === 'e2e-test');
    }
    console.log('Project ID:', project.id);
    
    const eRes = await fetch(`${apiUrl}/projects/${project.id}/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        path: '/hello',
        statusCode: 200,
        responseBody: '{"message":"hello world"}',
        contentType: 'application/json'
      })
    });
    const endpoint = await eRes.json();
    console.log('Endpoint ID:', endpoint.id);

    // Give it a moment to save to H2
    await new Promise(r => setTimeout(r, 500));

    const mRes = await fetch(`${mockUrl}/e2e-test/hello`);
    const mockData = await mRes.text();
    console.log('Mock Response:', mockData);
    console.log('Mock Status:', mRes.status);
    
    if (mockData.includes('hello world')) {
       console.log('✅ TEST PASSED');
    } else {
       console.log('❌ TEST FAILED');
    }
  } catch(e) {
    console.error(e);
  }
}
test();
