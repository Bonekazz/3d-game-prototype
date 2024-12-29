import * as THREE from 'three';
import { FBXLoader, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Entity } from './lib/Engine';

export type _3DObject = THREE.Group<THREE.Object3DEventMap>;

const objs: Entity[] = [];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera3 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let activeCamera = camera;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(activeCamera, renderer.domElement);

function genCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
  const cube = new THREE.Mesh(geometry, material);
  return cube;
}

const cube = genCube();

const loader = new GLTFLoader();

let creature: any;
const h = loader.load( 'assets/harry-mason/scene.gltf', 
  function ( gltf ) {
	  const model = gltf.scene; // The loaded model
    creature = model;
    console.log('creature model loaded:', model);
    // scene.add(model);
  },  
  // onProgress
  function (data) {
    console.log(`Loading: ${(data.loaded / data.total) * 100}%`);
  },
  // onError
  function ( error ) {
	  console.error( error );
  } 
);

let lisa: _3DObject;
loader.load( 'assets/lisa-garland/scene.gltf', 
  function ( gltf ) {
	  const model = gltf.scene; // The loaded model
    lisa = model;
    console.log('Model loaded:', model);
    lisa.position.set(0, 0, 0); // Position the model at the origin (0,0,0)
    lisa.scale.setScalar(0.007);
    // scene.add(model);
  },  
  // onProgress
  function (data) {
    console.log(`Loading: ${(data.loaded / data.total) * 100}%`);
  },
  // onError
  function ( error ) {
	  console.error( error );
  } 
);

loader.load( 'resources/jacks-hotel/hotel.gltf', 
  function ( gltf ) {
	  const model = gltf.scene; // The loaded model
    console.log('Hotel model loaded:', model);
    model.position.set(0, 0, 0); // Position the model at the origin (0,0,0)
    scene.add(model);
  },  
  // onProgress
  function (data) {
    // console.log(`Loading: ${(data.loaded / data.total) * 100}%`);
  },
  // onError
  function ( error ) {
	  console.error( error );
  } 
);

const textureLoader = new THREE.CubeTextureLoader();
const texture = textureLoader.load([
  './resources/posx.jpg',
  './resources/negx.jpg',
  './resources/posy.jpg',
  './resources/negy.jpg',
  './resources/posz.jpg',
  './resources/negz.jpg',
]);
scene.background = texture;


camera.position.set(0, 1, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Make the camera look at the center of the scene

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 10, 10),
  new THREE.MeshStandardMaterial({
      color: 0xFFFFFF, wireframe: true
  })
);
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

let mixer: THREE.AnimationMixer;

const actions: { [key: string]: THREE.AnimationAction } = {};
let activeAction: THREE.AnimationAction | null = null;
let previousAction: THREE.AnimationAction | null = null;

let guy: _3DObject | undefined = undefined;
const fbxLoader = new FBXLoader();
fbxLoader.load("resources/military/military.fbx", 
  (fbx) => {
    fbx.scale.setScalar(0.009);
    fbx.traverse(c => { c.castShadow = true });
    guy = fbx;
    console.log("guy loaded: ", fbx);
    scene.add(fbx);
    objs.push({id: "adaxa", name: "guy", model: fbx});

    mixer = new THREE.AnimationMixer(fbx);

    // Load the animation files
    loadAnimation('resources/military/walk.fbx', "walk");
    loadAnimation('resources/military/walk-back.fbx', "backwards");
    loadAnimation('resources/military/L-turn.fbx', "turn-l");
    loadAnimation('resources/military/R-turn.fbx', "turn-r");
    loadAnimation('resources/military/running.fbx', "run");
    loadAnimation('resources/military/capo.fbx', "capo");
    loadAnimation('resources/military/idle.fbx', "idle");
  }, 
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.error('An error occurred while loading the FBX:', error);
  }
)

// Load Animation Function
function loadAnimation(file: string, name: string) {
  fbxLoader.load(file, (animObject) => {
    const animationClip = animObject.animations[0]; // Assuming single animation per file
    const action = mixer.clipAction(animationClip);
    actions[name] = action;
  });


}

function setActiveAction(name: string) {
  if (activeAction !== actions[name]) {
    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction) {
      // Crossfade between animations
      previousAction.fadeOut(0.5);
    }

    activeAction.reset().fadeIn(0.5).play();
  }
}


let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(20, 100, 10);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500.0;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500.0;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 4.0);
scene.add(ambientLight);

const clock = new THREE.Clock();

const keys: { [key: string]: boolean } = {};
let isShifting: boolean = false;
document.addEventListener('keydown', (event) => {
  event.preventDefault();
  keys[event.key.toLowerCase()] = true;
  isShifting = event.shiftKey;
});
document.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
  isShifting = event.shiftKey;
});


let isCapo = false;
function updateMovement(model: _3DObject, delta: number) {
  if (!model) return; // Wait until model is loaded

  let speed = 1.5; // Units per second
  const rotationSpeed = 1.5; // Radians per second
  const backwardsSpeed = 0.45;

  const forward = new THREE.Vector3();
  model.getWorldDirection(forward);

  // Forward/Backward
  if (keys['w']) {
    if (keys["s"]) return setActiveAction("idle");

    if (isShifting) {
      setActiveAction("run")
      speed += 1.5;
    };
    if (!isShifting) setActiveAction("walk")
    model.position.add(forward.multiplyScalar(speed * delta));
  };


  if (keys['s']) {
    setActiveAction("backwards");
    model.position.add(forward.multiplyScalar(-backwardsSpeed * delta));
  };

  // Rotate
  if (keys['a']) {
    if (!keys["w"] && !keys["s"]) setActiveAction("turn-l");
    model.rotation.y += rotationSpeed * delta
  };

  if (keys['d']) {
    if (!keys["w"] && !keys["s"]) setActiveAction("turn-r");
    model.rotation.y -= rotationSpeed * delta
  };

  if (keys["1"]) activeCamera = camera;
  if (keys["2"]) activeCamera = camera2;
  if (keys["3"]) activeCamera = camera3;

  // if (keys["c"]) isCapo = !isCapo;
  // if (isCapo) setActiveAction("capo");

  if (
    !keys["a"] &&
    !keys["d"] &&
    !keys["w"] &&
    !keys["s"] // &&
    // !isCapo
  ) setActiveAction("idle");

}

setActiveAction("idle");

if (guy) {
  // Update camera position based on the model's position
  guy = guy as _3DObject;
  const guyPos = new THREE.Vector3();
  guy.getWorldPosition(guyPos);

  const { x, y, z } = guyPos;
  const { x: rotx, y: roty, z: rotz } = guy.position;

  // Update camera position based on the model's position
  camera3.position.set(x, y + 0.5, z - 0.8)
  camera3.rotation.set(rotx, roty + 1, rotz);

  camera2.position.set(x, y + 2, z);
  camera2.rotation.set(rotx, roty, rotz + 0.8);

}

function animate() {


  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  if (creature) {
    creature.rotation.y += 0.01;
  }

  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
    updateMovement(guy!, delta);
  }

  if (guy) {
    const guyPos = new THREE.Vector3();
    guy.getWorldPosition(guyPos);
    camera2.lookAt(guyPos);
    camera3.lookAt(guyPos);
  }


  controls.update();
	renderer.render( scene, activeCamera );

}

