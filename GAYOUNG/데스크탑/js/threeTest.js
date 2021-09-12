// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// const canvas = document.querySelector("#canvas")
// const renderer = new THREE.WebGLRenderer({canvas});
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// camera.position.z = 5;

// const animate = function () {
// requestAnimationFrame( animate );

// cube.rotation.x += 0.01;
// cube.rotation.y += 0.01;

// renderer.render( scene, camera );
// };

// animate();

// 파킹관련 클래스

// function main(){
//     const canvas = document.querySelector('#c');
//     const renderer = new THREE.WebGLRenderer({canvas});
  
//     const aspect = 2;   //캔버스 기본값
//     const near = 0.1;
//     const far = 200;
//     const fov = 60;

//     const camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color("white");

//     // 카메라를 별도 Object 3D의 자식으로 추가해 카메라가 셀카봉처럼 장면 주위를 돌 수 있도록 한다.
//     const cameraPole = new THREE.Object3D();
//     scene.add(cameraPole);
//     cameraPole.add(camera); // 카메라를 봉(pole)에 추가하고 render 함수 안에서 카메라 봉을 돌린다 
//     camera.add(light);  // 카메라에 조명도 추가하여 조명이 카메라와 같이 움직이도록 한다
//     // 이러면 봉을 회전시켜 카메라가 장면 주위를 돌도록 할 수 있습니다.


//     /***** 무작위의 위치, 방향, 크기를 가진 100개의 정육면체 생성 *****/
//     const boxWidth = 1;
//     const boxHeight = 1;
//     const boxDepth = 1;
//     const geometry = new THREE.BoxGeometry(boxWidth,boxHeight,boxDepth);
    
//     // 랜덤 함수
//     function rand(min,max){
//         if(max == undefined){
//             max = min;
//             min = 0;
//         }
//         return min + (max - min) * Math.random();
//     }
//     // 랜덤으로 컬러를 return하는 함수
//     function randomColor(){
//         return "hsl(${ rand(360) | 0 },${ rand(50,100) | 0 }%, 50%)";
//     }

//     const numObjects = 100; // 정육면체 개수
//     for(let i =0; i < numObjects; i++){     // 100개의 정육면체 생성

//         // random컬러의 material
//         const material = new THREE.MeshPhongMaterial({
//            color : randomColor(),
//         });

//         const cube = new THREE.Mesh(geometry.material);
//         scene.add(cube);    //scene에 cube 추가

//         // 랜덤으로 위치. 방향.크기를 성정
//         cube.position.set(rand(-20,20),rand(-20,20),rand(-20,20));
//         cube.rotation.set(rand(Math.PI),rand(Math.PI),0);
//         cube.scale.set(rand(3,6),rand(3,6),rand(3,6));
//     }


//     function render(time){
//         time *= 0.001   // 초로 변환

//         cameraPole.rotation.y = time = .1;  // render 함수 안에서 카메라 봉을 돌린다 

//     }

//     class PickHelper{
//         constructor(){
//             this.raycaster = new THREE.raycaster();
//             this.pickedObject = null;
//             this.pickedObjectSavedColor = 0;
//         }
    
//         pick(normalizedPosition, scene, camera, time){
//             // 이미 다른 물체를 피킹했다면 색을 복원하기
//             if(this.pickedObject){
//                 this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
//                 this.pickedObject = undefined;
//             }
    
//             // 절두체 안에 광선을 쏜다
//             this.raycaster.setFromCamera(normalizedPosition,camera);
            
//             // 광선과 교차하는 물체들을 배열로 만든다
//             const intertsectedObjects = this.raycaster.intertsectedObjects(scene,children);
    
//             if(intertsectedObjects.length){
//                 // 첫 번째 물체가 제일 가까우므로 해당 물체를 고른다
//                 this.pickedObject = intertsectedObjects[0].object;
//                 // 기존의 색을 저장하기
//                 this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
//                 // emissive 색을 빨강/노랑으로 빛나게 만듭니다
//                 this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
//             }
//         }
//     }

//     // 사용자의 마우스 포인터 아래의 있는 요소를 피킹하도록한다
//     const pickPosition = { x : 0, y : 0 };
//     clearPickPosition();

//     function getCanvasRelativePosition(event){
//         const rect = canvas.getBoundingClientRect();
//         return{
//             x : ( event.clientX - rect.left ) * canvas.width / rect.width,
//             y : ( event.clientX - rect.top ) * canvas.boxHeight / rect.height, 
//         }
//     }

//     function setPickPosition(event){
//         const pos = getCanvasRelativePosition(event);

//         pickPosition.x = (pos.x / canvas.width) * 2 - 1;
//         pickPosition.y = (pos.y / canvas.height) * -2 + 1; //reverse Y
//     }

//     function clearPickPosition(){
        
//         // 마우스의 경우는 항상 위치가 있어 그다지 큰 상관이 없지만,
//         // 터치 같은 경우 사용자가 손가락을 떼면 피킹을 멈춰야 합니다.
//         // 자금은 일단 어떤 것도 선택할 수 없으로 지정해두었습니다.
        

//         pickPosition.x = -100000;
//         pickPosition.y = -100000;
//     }
    
//     // 마우스 좌표를 정규화 캔버스 크기와 상관없이
//     // 완쪽 끝이 -1 오른쪽 끝이 +1이 벡터값이 필요
//     window.addEventListener('mousemove', setPickPosition);
//     window.addEventListener('mouseout', clearPickPosition);
//     window.addEventListener('mouseleave', clearPickPosition);

//     // 모바일 환경을 지원하기 위한 이벤트 리스너
//     window.adddEventListener('touchstart',(event) =>{
//         event.preventDefault(); // 스크롤 이벤트 방지
//         setPickPosition(event.touches[0]);
//     }, {passive : false});

//     window.addEventListener('touchmove', (event) =>{
//         setPickPosition(event.touches[0]);
//     });

//     window.addEventListener('touched',clearPickPosition);
// }

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,1000);
  camera.position.set(0,30,55);

  const light1 = new THREE.DirectionalLight(0xffffff,1);
  scene.add(light1);

  var sphere = new Array();
  // const boxWidth = 1;
  // const boxHeight = 1;
  // const boxDepth = 1;
  // const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // function rand(min, max) {
  //   if (max === undefined) {
  //     max = min;
  //     min = 0;
  //   }
  //   return min + (max - min) * Math.random();
  // }

  // function randomColor() {
  //   return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
  // }

  // const numObjects = 100;
  // for (let i = 0; i < numObjects; ++i) {
  //   const material = new THREE.MeshPhongMaterial({
  //     color: randomColor(), 
  //   });

  //   const cube = new THREE.Mesh(geometry, material);
  //   scene.add(cube);

  //   cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
  //   cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  //   cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
  // }

  let onMouseClick = function(e){

    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse

    vec.set(
        ( e.clientX / window.innerWidth ) * 2 - 1,
        - ( e.clientY / window.innerHeight ) * 2 + 1,
        0.5 );
    
    vec.unproject( camera );

    vec.sub( camera.position ).normalize();

    var distance = - camera.position.z / vec.z;

    pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

   
 
    createSphere(pos);


}

let createSphere = function(pos){
  // pos -> 벡터값이 매개변수로 들어옴

  let geometry = new THREE.SphereGeometry(4,30,30);
  let material = new THREE.MeshPhongMaterial({color:0xffffff*Math.random(),shininess:100});
  let ballon = new THREE.Mesh(geometry,material);
  ballon.position.set(pos.x,pos.y,pos.z);
  
  // console.log("pos : \n"+pos.x+"\n"+pos.y+"\n"+pos.z)
  scene.add(ballon);

  sphere.push(ballon);
  console.log(sphere);


}


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
      // restore the color if there is a picked object
      if (this.pickedObject) {
        this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        this.pickedObject = undefined;
      }

      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
        // save its color
        this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        // set its emissive color to flashing red/yellow
        this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      }
      // 마지막을 제외한 나머지 삭제
      if(this.pickedObject != sphere[sphere.length - 1])
        scene.remove(this.pickedObject);
    }
  }

  const pickPosition = {x: 0, y: 0};
  const pickHelper = new PickHelper();
  clearPickPosition();

  function render(time) {
    time *= 0.001;  // convert to seconds;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    pickHelper.pick(pickPosition, scene, camera, time);

    renderer.render(scene, camera);

    if(sphere != null){
      sphere.forEach(function(value){
          value.position.y += 0.2;
      });
  }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width  / rect.width,
      y: (event.clientY - rect.top ) * canvas.height / rect.height,
    };
  }

  function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
  }

  function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
  }
  window.addEventListener("click",onMouseClick,false);
  window.addEventListener('mousemove', setPickPosition);
  window.addEventListener('mouseout', clearPickPosition);
  window.addEventListener('mouseleave', clearPickPosition);

  window.addEventListener('touchstart', (event) => {
    // prevent the window from scrolling
    event.preventDefault();
    setPickPosition(event.touches[0]);
  }, {passive: false});

  window.addEventListener('touchmove', (event) => {
    setPickPosition(event.touches[0]);
  });

  window.addEventListener('touchend', clearPickPosition);
}

main();
