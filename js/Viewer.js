 //проверяем, работает ли webgl
     function Main(model_path, model_texture_path) {

        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        var container, stats;
        var camera, controls, scene, renderer;

        //var model_path = model_path;
        //var model_texture_path = path_to_texture;

        init();
        render();

        function init() {

            camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 2, 2000 );
            camera.position.set(400, 400, 300);

            controls = new THREE.OrbitControls( camera );
            controls.addEventListener( 'change', render );

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2( 0xcccccc, 0.0008 );

            var axis = new THREE.AxisHelper(1000);
            scene.add(axis);

            // lights
            var light = new THREE.DirectionalLight();
            light.position.set( 1, 1, 1 ); scene.add( light );
            var light = new THREE.AmbientLight();
            light.position.set(-2, -2,-2); scene.add(light);

             // renderer

            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setClearColor( scene.fog.color, 1 );
            renderer.setSize( window.innerWidth, window.innerHeight);

            container = document.getElementById( 'container' );
            container.appendChild( renderer.domElement );

            // loader

            if(/stl/.test(model_path)){
                var stl_loader = new THREE.STLLoader();
                stl_loader.addEventListener( 'load', function ( event ) {
                    var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0x44a6c6, specular: 0x111111, shininess: 200 } );
                    var geometry = event.content;
                    var mesh = new THREE.Mesh( geometry, material );

                    mesh.position.set( 0, 0, 0);
                    //mesh.rotation.set( - Math.PI / 2, 0, 0 );
                    //mesh.scale.set( 2, 2, 2 );

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    scene.add( mesh );
                    render();
                });

                stl_loader.load(model_path);
            }

            if(/obj/.test(model_path)){

                var manager = new THREE.LoadingManager();
                manager.onProgress = function ( item, loaded, total ) {

                    console.log( item, loaded, total );
                };

                var texture = new THREE.Texture();

                var loader = new THREE.ImageLoader( manager );
                loader.load( model_texture_path, function ( image ) {

                    texture.image = image;
                    texture.needsUpdate = true;

                } );

                // model

                var loader = new THREE.OBJLoader( manager );
                loader.load( model_path, function ( object ) {
                    object.traverse( function ( child ) {
                        if ( child instanceof THREE.Mesh ) {
                            child.material.map = texture;
                        }
                    } );

                    object.position.set( 0, 0, 0);
                    object.castShadow = true;
                    object.receiveShadow = true;
                    scene.add( object );
                    render();
                    });

            }



            /*stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            stats.domElement.style.zIndex = 100;
            container.appendChild( stats.domElement );
            */

            //controls

            var gui = new dat.GUI();

            var control = new function() {
                this.Home  = function() {cameraStartPosition()};
                this.X = function() {camera.position.set(500, 0, 0); render();};
                this.Y = function() {camera.position.set(0, 500, 0); render();};
                this.Z = function() {camera.position.set(0, 0, 500); render();};
                this.Axis = true;

            };

            gui.add(control, "Home");
            gui.add(control, "X");
            gui.add(control, "Y");
            gui.add(control, 'Z');
            var c = gui.add(control, 'Axis');

            c.onChange(function(value){
                axis.visible = value;
                render();
            });

            window.addEventListener( 'resize', onWindowResize, false );

        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );

            render();

        }

        function render() {

            camera.lookAt(scene.position);
            renderer.render( scene, camera );
            //stats.update();

        }

         function cameraStartPosition() {
                camera.position.set(400, 400, 300);
                render();
            }

        render();
     }