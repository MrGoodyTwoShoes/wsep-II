import * as THREE from 'three';

export function createEarth() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://example.com/earth_texture.jpg'); // Replace with the actual Earth texture URL
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const earthMesh = new THREE.Mesh(geometry, material);
    return earthMesh;
}