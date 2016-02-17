var camera, scene, renderer;
var geometry, material, mesh;
var controls;

var objects = [];

var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = '-webkit-box';
      blocker.style.display = '-moz-box';
      blocker.style.display = 'box';

      instructions.style.display = '';

    }

  };

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  };

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {

      var fullscreenchange = function ( event ) {

        if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

          document.removeEventListener( 'fullscreenchange', fullscreenchange );
          document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

          element.requestPointerLock();
        }

      };

      document.addEventListener( 'fullscreenchange', fullscreenchange, false );
      document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

      element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

      element.requestFullscreen();

    } else {

      element.requestPointerLock();

    }

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

var spotLight, pieceGeometry;
var fTileGeometry, rTileGeometry, tTileGeometry;

function init() {

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0.5, 1, 0.75 );
  scene.add( light );

  spotLight = new THREE.SpotLight( 0xff0066 );
  spotLight.position.set( camera.position.x, camera.position.y, camera.position.z );
  spotLight.castShadow = true;
  // scene.add( spotLight );

  controls = new THREE.PointerLockControls( camera );
  console.log('controls.getObject():', controls.getObject());

  scene.add( controls.getObject() );

  var onKeyDown = function ( event ) {
    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true; break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;

    }

  };

  var onKeyUp = function ( event ) {
    switch( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

    }

  };

  // document.addEventListener( 'keydown', onKeyDown, false );
  // document.addEventListener( 'keyup', onKeyUp, false );

  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

  // floor
  // geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
  // geometry.rotateX( - Math.PI / 2 );

  // for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

  //   var vertex = geometry.vertices[ i ];
  //   vertex.x += Math.random() * 20 - 10;
  //   vertex.y += Math.random() * 2;
  //   vertex.z += Math.random() * 20 - 10;

  // }

  // for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

  //   var face = geometry.faces[ i ];
  //   face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

  // }

  // material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

  // mesh = new THREE.Mesh( geometry, material );
  // scene.add( mesh );

  // board
  fTileGeometry = new THREE.BoxGeometry( 19, 19, 1 );
  rTileGeometry = fTileGeometry.clone().rotateY( - Math.PI / 2 );
  tTileGeometry = fTileGeometry.clone().rotateX( - Math.PI / 2 );

  pieceGeometry = new THREE.IcosahedronGeometry(.4, 0);

  var material = new THREE.MeshLambertMaterial({ color: 0x999999 });

  var board = [];
  for(var i = 0; i < 4; i++) {
    board[i] = [];
    for(var j = 0; j < 4; j++) {
      board[i][j] = new THREE.Mesh( fTileGeometry, new THREE.MeshLambertMaterial({ color: 0x999999 }) );
      board[i][j].position.x = (i) * 20 - 30;
      board[i][j].position.y = (j) * 20 - 30;
      board[i][j].position.z = -40.5;

      scene.add( board[i][j] );
    }
  }

  for(var i = 0; i < 4; i++) {
    board[i] = [];
    for(var j = 0; j < 4; j++) {
      board[i][j] = new THREE.Mesh( rTileGeometry, new THREE.MeshLambertMaterial({ color: 0x999999 }) );
      board[i][j].position.x = 40.5;
      board[i][j].position.y = (i) * 20 - 30;
      board[i][j].position.z = (j) * 20 - 30;

      scene.add( board[i][j] );
    }
  }

  for(var i = 0; i < 4; i++) {
    board[i] = [];
    for(var j = 0; j < 4; j++) {
      board[i][j] = new THREE.Mesh( fTileGeometry, new THREE.MeshLambertMaterial({ color: 0x999999 }) );
      board[i][j].position.x = (j) * 20 - 30;
      board[i][j].position.y = (i) * 20 - 30;
      board[i][j].position.z = 40.5;

      scene.add( board[i][j] );
    }
  }

  for(var i = 0; i < 4; i++) {
    board[i] = [];
    for(var j = 0; j < 4; j++) {
      board[i][j] = new THREE.Mesh( rTileGeometry, new THREE.MeshLambertMaterial({ color: 0x999999 }) );
      board[i][j].position.x = -40.5;
      board[i][j].position.y = (i) * 20 - 30;
      board[i][j].position.z = (j) * 20 - 30;

      scene.add( board[i][j] );
    }
  }

  for(var i = 0; i < 4; i++) {
    board[i] = [];
    for(var j = 0; j < 4; j++) {
      board[i][j] = new THREE.Mesh( tTileGeometry, new THREE.MeshLambertMaterial({ color: 0x999999 }) );
      board[i][j].position.x = (i) * 20 - 30;
      board[i][j].position.y = -40.5;
      board[i][j].position.z = (j) * 20 - 30;

      scene.add( board[i][j] );
    }
  }

  for(var i = 0; i < 4; i++) {
    board[i] = [];
    for(var j = 0; j < 4; j++) {
      board[i][j] = new THREE.Mesh( tTileGeometry, new THREE.MeshLambertMaterial({ color: 0x999999 }) );
      board[i][j].position.x = (i) * 20 - 30;
      board[i][j].position.y = 40.5;
      board[i][j].position.z = (j) * 20 - 30;

      scene.add( board[i][j] );
    }
  }

  // 3d board
  // function face() {

  // }

  // for(var i = 0; i < 3; i++) {
  //   for(var j = 0; j < 2; j++) {
  //     for(var k = 0; k < 2; k++) {

  //     }
  //   }
  // }

  // for(var i = 0; i < 4; i++) {
  //   board[i] = [];
  //   for(var j = 0; i < 2; j++) {
  //     board[i][j] = [];
  //     for(var k = 0; k < 2; k++) {
  //       board[i][j][k] = new THREE.Mesh( fTileGeometry, new THREE.MeshLambertMaterial({ color: 0x999999 }) );
  //       board[i][j][k].position.x = i - 3.5;
  //       board[i][j][k].position.y = j - 3.5;
  //       board[i][j][k].position.z = -10;

  //       scene.add( board[i][j][k] );
  //     }
  //   }
  //   fTileGeometry.rotateX( - Math.PI / 2 );
  // }

  // geometry = new THREE.BoxGeometry( 20, 20, 20 );

  // for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

  //   var face = geometry.faces[ i ];
  //   face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

  // }

  // for ( var i = 0; i < 500; i ++ ) {

  //   material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

  //   var mesh = new THREE.Mesh( geometry, material );
  //   mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
  //   mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
  //   mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
  //   scene.add( mesh );

  //   material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

  //   objects.push( mesh );

  // }

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

var INTERSECTED;

function animate() {

  requestAnimationFrame( animate );

  // if ( controlsEnabled ) {
  //   raycaster.ray.origin.copy( controls.getObject().position );
  //   raycaster.ray.origin.y -= 10;

  //   var intersections = raycaster.intersectObjects( objects );

  //   var isOnObject = intersections.length > 0;

  //   var time = performance.now();
  //   var delta = ( time - prevTime ) / 1000;

  //   velocity.x -= velocity.x * 10.0 * delta;
  //   velocity.z -= velocity.z * 10.0 * delta;

  //   velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

  //   if ( moveForward ) velocity.z -= 400.0 * delta;
  //   if ( moveBackward ) velocity.z += 400.0 * delta;

  //   if ( moveLeft ) velocity.x -= 400.0 * delta;
  //   if ( moveRight ) velocity.x += 400.0 * delta;

  //   if ( isOnObject === true ) {
  //     velocity.y = Math.max( 0, velocity.y );

  //     canJump = true;
  //   }

  //   controls.getObject().translateX( velocity.x * delta );
  //   controls.getObject().translateY( velocity.y * delta );
  //   controls.getObject().translateZ( velocity.z * delta );

  //   if ( controls.getObject().position.y < 10 ) {

  //     velocity.y = 0;
  //     controls.getObject().position.y = 10;

  //     canJump = true;

  //   }

  //   prevTime = time;

  // }

  var raycaster2 = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // update the picking ray with the camera and mouse position
  raycaster2.setFromCamera( mouse, camera );

  // calculate objects intersecting the picking ray
  var intersects = raycaster2.intersectObjects( scene.children );

  if ( intersects.length > 0 ) {
    // document.body.style.cursor = 'pointer';
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      // Save previous properties of intersected object to restore its properties on blur
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );

      spotLight.target = INTERSECTED;
      // INTERSECTED.geometry = pieceGeometry;
    }
  } else {
    if(INTERSECTED) {
      // document.body.style.cursor = 'crosshair';
      // Restore previous properties of intersection
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      // INTERSECTED.geometry = fTileGeometry;
      INTERSECTED = null;
    }
  }

  renderer.render( scene, camera );

}
