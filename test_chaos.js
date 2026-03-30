const testChaos = async () => {
    try {
        // 1. Get projects
        console.log("Fetching projects...");
        const res = await fetch('http://localhost:8080/api/projects');
        const projects = await res.json();
        
        if (!projects || projects.length === 0) {
            console.log("No projects found, skipping test. Try running node test.js first to create a project.");
            return;
        }
        const project = projects[0];
        console.log(`Using project: ${project.name} (${project.id})`);

        // 2. Fetch Chaos Config
        console.log("Fetching chaos config...");
        const chaosRes = await fetch(`http://localhost:8080/api/projects/${project.id}/chaos`);
        let chaos = await chaosRes.json();
        console.log("Initial Chaos Config:", chaos);

        // 3. Update Chaos Config (Enable and set 100% error rate)
        console.log("Setting Chaos Mode to 100% Error Rate...");
        const newConfig = {
            ...chaos,
            enabled: true,
            errorRatePercent: 100,
            latencySpikePercent: 0,
            malformedResponsePercent: 0,
            connectionDropPercent: 0
        };
        
        await fetch(`http://localhost:8080/api/projects/${project.id}/chaos`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });

        // 4. Hit mock endpoint
        console.log("Hitting mock endpoint expected to fail due to chaos...");
        const mockRes = await fetch(`http://localhost:8080/m/${project.slug}/hello`);
        
        if (mockRes.status >= 500) {
            console.log(`✅ Success! Received chaos failure: ${mockRes.status}`);
        } else {
            console.log(`❌ Test failed: expected 5xx error, got ${mockRes.status}`);
        }

        // 5. Cleanup
        console.log("Resetting Chaos config...");
        await fetch(`http://localhost:8080/api/projects/${project.id}/chaos`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chaos)
        });

    } catch (err) {
        console.error("Test execution failed:", err.message);
    }
};

testChaos();
