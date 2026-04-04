export function createEarth(scene) {
  const geometry = new THREE.SphereGeometry(5, 64, 64)
  
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = '#1a4d7f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  ctx.fillStyle = '#2d5a2d'
  ctx.beginPath()
  ctx.arc(300, 400, 150, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(800, 350, 120, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(1400, 400, 100, 0, Math.PI * 2)
  ctx.fill()
  
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.MeshPhongMaterial({ map: texture })
  
  const earth = new THREE.Mesh(geometry, material)
  scene.add(earth)
  
  return earth
}