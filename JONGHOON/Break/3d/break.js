import * as THREE from "https://cdn.skypack.dev/three@0.132.2";

import Stats from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
//import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { ConvexObjectBreaker } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/misc/ConvexObjectBreaker.js";
import { ConvexGeometry } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/geometries/ConvexGeometry.js";

// - Global variables -
var custom_texture, custom_material;

// Graphics variables
let container, stats;
let camera, controls, scene, renderer;
let textureLoader;
const clock = new THREE.Clock();

const mouseCoords = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

// Physics variables
// const gravityConstant = 7.8;
const gravityConstant = 0.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let physicsWorld;
const margin = 0.05;

const convexBreaker = new ConvexObjectBreaker();

// Rigid bodies include all movable objects
const rigidBodies = [];

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
let transformAux1;
let tempBtVec3_1;

const objectsToRemove = [];

for (let i = 0; i < 500; i++) {
  objectsToRemove[i] = null;
}

let numObjectsToRemove = 0;

const impactPoint = new THREE.Vector3();
const impactNormal = new THREE.Vector3();

// - Main code -

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib;

  init();
  animate();
});

// - Functions -

function init() {
  initGraphics();

  initPhysics();

  createObjects();

  initInput();
}

function initGraphics() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.2,
    2000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);

  camera.position.set(-14, 8, 16);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, 0);
  controls.update();

  textureLoader = new THREE.TextureLoader();
  ////////

  // custom_texture = new THREE.MeshPhongMaterial();
  custom_material = new THREE.MeshBasicMaterial({
    map: textureLoader.load("./wall.jpg"),
  });

  ///////

  const ambientLight = new THREE.AmbientLight(0x707070);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-10, 18, 5);
  light.castShadow = true;
  const d = 14;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.near = 2;
  light.shadow.camera.far = 50;

  light.shadow.mapSize.x = 1024;
  light.shadow.mapSize.y = 1024;

  scene.add(light);

  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.top = "0px";
  container.appendChild(stats.domElement);

  //

  window.addEventListener("resize", onWindowResize);
}

function initPhysics() {
  // Physics configuration

  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  broadphase = new Ammo.btDbvtBroadphase();
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  );
  physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

  transformAux1 = new Ammo.btTransform();
  tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
}
//수정
// function createObject(mass, halfExtents, pos, quat, material) {
function createObject(mass, halfExtents, pos, quat) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(
      //수정
      halfExtents.x * 4,
      halfExtents.y * 4,
      halfExtents.z * 4
      // halfExtents.x * 2,
      // halfExtents.y * 2,
      // halfExtents.z * 2
    ),
    custom_material
  );
  //수정
  // object.material.needsUpdate = true;

  object.position.copy(pos);
  object.quaternion.copy(quat);

  object.material.needsUpdate = true;

  convexBreaker.prepareBreakableObject(
    object,
    mass,
    new THREE.Vector3(),
    new THREE.Vector3(),
    true
  );
  // console.log(object.material);
  createDebrisFromBreakableObject(object);
}

function createObjects() {
  // Ground
  pos.set(0, -0.5, 0);
  quat.set(0, 0, 0, 1);
  const ground = createParalellepipedWithPhysics(
    40,
    1,
    40,
    0,
    pos,
    quat,
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  ground.receiveShadow = true;
  // textureLoader.load("textures/grid.png", function (texture) {
  //   texture.wrapS = THREE.RepeatWrapping;
  //   texture.wrapT = THREE.RepeatWrapping;
  //   texture.repeat.set(40, 40);
  //   ground.material.map = texture;
  //   ground.material.needsUpdate = true;
  // });

  // Tower 1
  const towerMass = 1000; //1000
  const towerHalfExtents = new THREE.Vector3(2, 2, 2);
  // const towerHalfExtents = new THREE.Vector3(2, 5, 2);
  pos.set(0, 0, 0);
  quat.set(0, 0, 0, 1);
  createObject(towerMass, towerHalfExtents, pos, quat);

  const mountainMass = 860;
  const mountainHalfExtents = new THREE.Vector3(4, 5, 4);
  pos.set(5, mountainHalfExtents.y * 0.5, -7);
  quat.set(0, 0, 0, 1);
  const mountainPoints = [];
  mountainPoints.push(
    new THREE.Vector3(
      mountainHalfExtents.x,
      -mountainHalfExtents.y,
      mountainHalfExtents.z
    )
  );
  mountainPoints.push(
    new THREE.Vector3(
      -mountainHalfExtents.x,
      -mountainHalfExtents.y,
      mountainHalfExtents.z
    )
  );
  mountainPoints.push(
    new THREE.Vector3(
      mountainHalfExtents.x,
      -mountainHalfExtents.y,
      -mountainHalfExtents.z
    )
  );
  mountainPoints.push(
    new THREE.Vector3(
      -mountainHalfExtents.x,
      -mountainHalfExtents.y,
      -mountainHalfExtents.z
    )
  );
  mountainPoints.push(new THREE.Vector3(0, mountainHalfExtents.y, 0));
  const mountain = new THREE.Mesh(
    new ConvexGeometry(mountainPoints),
    custom_material
  );
  mountain.position.copy(pos);
  mountain.quaternion.copy(quat);
  convexBreaker.prepareBreakableObject(
    mountain,
    mountainMass,
    new THREE.Vector3(),
    new THREE.Vector3(),
    true
  );
  createDebrisFromBreakableObject(mountain);
}

function createParalellepipedWithPhysics(
  sx,
  sy,
  sz,
  mass,
  pos,
  quat,
  // material
  custom_material
) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
    //material
    custom_material
  );
  const shape = new Ammo.btBoxShape(
    new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
  );
  shape.setMargin(margin);

  createRigidBody(object, shape, mass, pos, quat);

  return object;
}

function createDebrisFromBreakableObject(object) {
  object.castShadow = true;
  object.receiveShadow = true;

  // object.material.needsUpdate = true;

  const shape = createConvexHullPhysicsShape(
    object.geometry.attributes.position.array
  );
  shape.setMargin(margin);

  object.material = custom_material;
  console.log(object);
  const body = createRigidBody(
    object,
    shape,
    object.userData.mass,
    null,
    null,
    object.userData.velocity,
    object.userData.angularVelocity
  );

  // Set pointer back to the three object only in the debris objects
  const btVecUserData = new Ammo.btVector3(0, 0, 0);
  btVecUserData.threeObject = object;
  body.setUserPointer(btVecUserData);
}

function removeDebris(object) {
  scene.remove(object);

  physicsWorld.removeRigidBody(object.userData.physicsBody);
}

function createConvexHullPhysicsShape(coords) {
  const shape = new Ammo.btConvexHullShape();

  for (let i = 0, il = coords.length; i < il; i += 3) {
    tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2]);
    const lastOne = i >= il - 3;
    shape.addPoint(tempBtVec3_1, lastOne);
  }

  return shape;
}

function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
  // console.log("break");
  if (pos) {
    object.position.copy(pos);
  } else {
    pos = object.position;
  }

  if (quat) {
    object.quaternion.copy(quat);
  } else {
    quat = object.quaternion;
  }

  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    physicsShape,
    localInertia
  );
  const body = new Ammo.btRigidBody(rbInfo);

  //수정
  body.setFriction(0.5); //0.5

  if (vel) {
    body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
  }

  if (angVel) {
    body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
  }

  object.userData.physicsBody = body;
  object.userData.collided = false;

  object.material = custom_material;

  scene.add(object);

  if (mass > 0) {
    rigidBodies.push(object);

    // Disable deactivation
    body.setActivationState(4);
  }

  physicsWorld.addRigidBody(body);

  return body;
}

function createRandomColor() {
  return Math.floor(Math.random() * (1 << 24));
}

function createMaterial(color) {
  color = color || createRandomColor();
  return new THREE.MeshPhongMaterial({ color: color });
}

function initInput() {
  window.addEventListener("pointerdown", function (event) {
    mouseCoords.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouseCoords, camera);

    // Creates a ball and throws it
    const ballMass = 35;
    const ballRadius = 0.4;

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 14, 10),
      ballMaterial
    );
    ball.castShadow = true;
    ball.receiveShadow = true;
    const ballShape = new Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(margin);
    pos.copy(raycaster.ray.direction);
    pos.add(raycaster.ray.origin);
    quat.set(0, 0, 0, 1);
    const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

    pos.copy(raycaster.ray.direction);
    pos.multiplyScalar(24);
    ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  const deltaTime = clock.getDelta();

  updatePhysics(deltaTime);

  renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10);

  // Update rigid bodies
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const objThree = rigidBodies[i];
    const objPhys = objThree.userData.physicsBody;
    const ms = objPhys.getMotionState();

    if (ms) {
      ms.getWorldTransform(transformAux1);
      const p = transformAux1.getOrigin();
      const q = transformAux1.getRotation();
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

      objThree.userData.collided = false;
    }
  }

  for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {
    const contactManifold = dispatcher.getManifoldByIndexInternal(i);
    const rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
    const rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

    const threeObject0 = Ammo.castObject(
      rb0.getUserPointer(),
      Ammo.btVector3
    ).threeObject;
    const threeObject1 = Ammo.castObject(
      rb1.getUserPointer(),
      Ammo.btVector3
    ).threeObject;

    if (!threeObject0 && !threeObject1) {
      continue;
    }

    const userData0 = threeObject0 ? threeObject0.userData : null;
    const userData1 = threeObject1 ? threeObject1.userData : null;

    const breakable0 = userData0 ? userData0.breakable : false;
    const breakable1 = userData1 ? userData1.breakable : false;

    const collided0 = userData0 ? userData0.collided : false;
    const collided1 = userData1 ? userData1.collided : false;

    if ((!breakable0 && !breakable1) || (collided0 && collided1)) {
      continue;
    }

    let contact = false;
    let maxImpulse = 0;
    for (let j = 0, jl = contactManifold.getNumContacts(); j < jl; j++) {
      const contactPoint = contactManifold.getContactPoint(j);

      if (contactPoint.getDistance() < 0) {
        contact = true;
        const impulse = contactPoint.getAppliedImpulse();

        if (impulse > maxImpulse) {
          maxImpulse = impulse;
          const pos = contactPoint.get_m_positionWorldOnB();
          const normal = contactPoint.get_m_normalWorldOnB();
          impactPoint.set(pos.x(), pos.y(), pos.z());
          impactNormal.set(normal.x(), normal.y(), normal.z());
        }

        break;
      }
    }

    // If no point has contact, abort
    if (!contact) continue;

    // Subdivision

    //수정
    const fractureImpulse = 250; //250

    if (breakable0 && !collided0 && maxImpulse > fractureImpulse) {
      const debris = convexBreaker.subdivideByImpact(
        threeObject0,
        impactPoint,
        impactNormal,
        1,
        2,
        1.5
      );

      const numObjects = debris.length;
      for (let j = 0; j < numObjects; j++) {
        const vel = rb0.getLinearVelocity();
        const angVel = rb0.getAngularVelocity();
        const fragment = debris[j];
        fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
        fragment.userData.angularVelocity.set(
          angVel.x(),
          angVel.y(),
          angVel.z()
        );
        // fragment.texture = custom_material;
        // fragment.texture.image = "./wall.jpg";
        // fragment.texture.wrapS = THREE.RepeatWrapping;
        // fragment.texture.wrapT = THREE.RepeatWrapping;
        // fragment.texture.repeat.set(40, 40);
        // fragment.material.map = texture;
        // fragment.material.needsUpdate = true;
        //수정
        // console.log(fragment);

        createDebrisFromBreakableObject(fragment);
      }

      objectsToRemove[numObjectsToRemove++] = threeObject0;
      userData0.collided = true;
    }

    if (breakable1 && !collided1 && maxImpulse > fractureImpulse) {
      const debris = convexBreaker.subdivideByImpact(
        threeObject1,
        impactPoint,
        impactNormal,
        1,
        2,
        1.5
      );

      const numObjects = debris.length;
      for (let j = 0; j < numObjects; j++) {
        const vel = rb1.getLinearVelocity();
        const angVel = rb1.getAngularVelocity();
        const fragment = debris[j];
        fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
        fragment.userData.angularVelocity.set(
          angVel.x(),
          angVel.y(),
          angVel.z()
        );

        createDebrisFromBreakableObject(fragment);
      }

      objectsToRemove[numObjectsToRemove++] = threeObject1;
      userData1.collided = true;
    }
  }

  for (let i = 0; i < numObjectsToRemove; i++) {
    removeDebris(objectsToRemove[i]);
  }

  numObjectsToRemove = 0;
}

document.addEventListener("keydown", InputKey);
function InputKey(event) {
  console.log(camera.position);
}
