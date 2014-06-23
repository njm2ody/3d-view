function Viewer(path_to_model, path_to_texture, container_id) {

    var path_to_model = path_to_model || 'models/portal/portal.json';
    var path_to_texture = path_to_texture || '';
    var container_id  = container_id  || 'container';
    var container = document.getElementById(container_id);
    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 2, 2000 );
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
//    var renderer = new THREE.CanvasRenderer({antialias: true});
    var controls = new THREE.OrbitControls(camera);

    var default_camera_position = new THREE.Vector3(400, 400, 300);

    var object;
    var gui;
    var command = new function() {
                  this.Home  = function() {camera.position.set(400, 400, 300); render();};
                  this.X = function() {camera.position.set(500, 0, 0); render();};
                  this.Y = function() {camera.position.set(0, 500, 0); render();};
                  this.Z = function() {camera.position.set(0, 0, 500); render();};
                };

    init();

    function init() {
        // web gl enable?
        if ( !Detector.webgl ) Detector.addGetWebGLMessage();
        
        //camera, controls and scene
        camera.position = default_camera_position;
        scene.fog = new THREE.FogExp2( 0xcccccc, 0.0008 );

        //lights
        var light = new THREE.DirectionalLight();
        light.position.set( 1, 1, 1 ); scene.add( light );
        var light = new THREE.AmbientLight();
        light.position.set(-2, -2,-2); scene.add(light);

        //renderer
        renderer.setClearColor( scene.fog.color, 1 );
        renderer.setSize( window.innerWidth, window.innerHeight);

        //container
        container.appendChild(renderer.domElement);

        //grid
        addGrid();

        //listeners
        window.addEventListener( 'resize', onWindowResize, false );
        controls.addEventListener( 'change', render );

        //gui
        addGui(command);

        //load
        load(path_to_model, path_to_texture);

        render();
    };

    function load(path, texture_path) {
        function json_loader(_path){
            var json_loader = new THREE.JSONLoader();
            var callbackObject = function(geometry, material){
            var zmesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
            zmesh.position.set( 0, 0, 0 );
            if(zmesh.height < 10) zmesh.scale.set(3, 3, 5 );
            object = zmesh;
            scene.add( zmesh );
            //return zmesh;
        }
            //scene.add(loader.load(_path, callbackObject));
            json_loader.load(_path, callbackObject);
       }
        function stl_loader(_path) {
           var stl_loader = new THREE.STLLoader();
           stl_loader.addEventListener( 'load', function ( event ) {
           var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0x44a6c6, specular: 0x111111, shininess: 200 } );
           var geometry = event.content;
           var mesh = new THREE.Mesh( geometry, material );
           mesh.position.set( 0, 0, 0);
           mesh.castShadow = true;
           mesh.receiveShadow = true;
           object = mesh;
            scene.add( mesh );
           });

            stl_loader.load(_path);
        }
        function obj_loader(_path, _texture) {
            var obj_manager = new THREE.LoadingManager();
            obj_manager.onProgress = function ( item, loaded, total ) {
                console.log( item, loaded, total );
            };

            var texture = new THREE.Texture();

            var obj_loader = new THREE.ImageLoader( obj_manager);
            obj_loader.load( _texture, function ( image ) {

                texture.image = image;
                texture.needsUpdate = true;

            } );

            // model

            var obj_loader = new THREE.OBJLoader( obj_manager );
            obj_loader.load( _path, function ( object ) {

                object.traverse( function ( child ) {

                    if ( child instanceof THREE.Mesh ) {

                        child.material.map = texture;

                    }

                } );

                scene.add( object );

            } );
        }

        if(/json/.test(path)) json_loader(path);
        if(/stl/.test(path))  stl_loader(path);
        if(/obj/.test(path))  obj_loader(path, texture_path);


        //render();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();

    }

    function render() {
   //     requestAnimationFrame(render);
        camera.lookAt(scene.position);
        renderer.render( scene, camera );
    }

    function addGrid(size, step){

        size = size || 500;
        step = step || 50;

        var geometry = new THREE.Geometry();

        for ( var i = - size; i <= size; i += step ) {

            geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
            geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

            geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
            geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

        }

        var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

        var line = new THREE.Line( geometry, material );
        line.type = THREE.LinePieces;
        scene.add(line);
    }

    function addGui(comm){
        gui = new dat.GUI();
        gui.add(comm, 'Home');
        gui.add(comm, 'X');
        gui.add(comm, 'Y');
        gui.add(comm, 'Z');
    }
}

