// satellites.js

import * as THREE from 'three';

export function loadSatellites(apiUrl, scene) {
    // Fetch satellite data from the backend API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(satellite => {
                // Create Three.js objects based on satellite data
                const geometry = new THREE.SphereGeometry(satellite.size);
                const material = new THREE.MeshBasicMaterial({ color: satellite.color });
                const satelliteMesh = new THREE.Mesh(geometry, material);
                satelliteMesh.position.set(satellite.position.x, satellite.position.y, satellite.position.z);

                // Add the satellite mesh to the scene
                scene.add(satelliteMesh);
            });
        })
        .catch(error => console.error('Error fetching satellite data:', error));
}