export async function loadSatellites(scene) {
    try {
        const response = await fetch('http://localhost:8000/satellites');
        const data = await response.json();
        
        // Create satellite spheres
        data.satellites.forEach(sat => {
            const geometry = new THREE.SphereGeometry(0.05, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material);
            
            // Convert lat/lng to 3D coordinates
            const lat = sat.position.lat * Math.PI / 180;
            const lng = sat.position.lng * Math.PI / 180;
            const radius = 1.2;
            
            sphere.position.x = radius * Math.cos(lat) * Math.cos(lng);
            sphere.position.y = radius * Math.sin(lat);
            sphere.position.z = radius * Math.cos(lat) * Math.sin(lng);
            
            scene.add(sphere);
        });
    } catch (error) {
        console.error('Error loading satellites:', error);
    }
}