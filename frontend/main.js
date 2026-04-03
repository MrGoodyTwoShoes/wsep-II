import {createEarth} from "./earth.js"
import {loadSatellites} from "./satellites.js"

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
)

camera.position.z = 12

const renderer = new THREE.WebGLRenderer({antialias:true})

renderer.setSize(window.innerWidth,window.innerHeight)

document.body.appendChild(renderer.domElement)

const light = new THREE.PointLight(0xffffff,1)

light.position.set(10,10,10)

scene.add(light)

const earth = createEarth(scene)

function animate(){

requestAnimationFrame(animate)

earth.rotation.y += 0.0005

renderer.render(scene,camera)

}

animate()

loadSatellites(scene)