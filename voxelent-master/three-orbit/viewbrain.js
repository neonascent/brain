if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var container, stats;

			var camera, controls, scene, renderer;

			var cross;

			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
				
				//var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
				camera.position.z = 200;

				controls = new THREE.OrbitControls( camera );
				controls.addEventListener( 'change', render );

				scene = new THREE.Scene();
				//scene.fog = new THREE.FogExp2( 0x000, 0.002 );

				// world
		

				// add it to the scene
				//scene.add(loadPointCloudZIP(	'anatomy_xyz_mapped_to_rgb.zip', 'anatomy_xyz_mapped_to_rgb.json'));
				scene.add(loadPointCloud('anatomy_xyz_mapped_to_rgb.json'));
			

				
				// lights

				//light = new THREE.DirectionalLight( 0xffffff );
				//light.position.set( 1, 1, 1 );
				//scene.add( light );

				//light = new THREE.DirectionalLight( 0x002288 );
				//light.position.set( -1, -1, -1 );
				//scene.add( light );

				light = new THREE.AmbientLight( 0xffffff );
				scene.add( light );


				// renderer

				renderer = new THREE.WebGLRenderer( { antialias: false, clearAlpha: 1 } );
				//renderer.setClearColor( scene.fog.color, 1 );
				renderer.setSize( window.innerWidth, window.innerHeight );
				
				container = document.getElementById( 'container' );
				container.appendChild( renderer.domElement );

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				stats.domElement.style.zIndex = 100;
				container.appendChild( stats.domElement );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			/**
			 * Calculate the bounding box of this model and its centre
			 * 
			 */
			function computeBoundingBox(g) {	
			    
			    //This is the case with the scene toys
			    if (g.vertices.length == 0){
			        g.bb = [0,0,0,0,0,0];
			        g.centre = [0,0,0,0,0,0];
			        return;
			    }
			    
				var vs = g.vertices;
				var bbm  = [vs[0].x,vs[0].y,vs[0].z,vs[0].x,vs[0].y,vs[0].z];
				
				var i = vs.length;  
				for(var i=0, N = vs.length;i<N;i++){
					bbm[0] = Math.min(bbm[0],vs[i].x);
					bbm[1] = Math.min(bbm[1],vs[i].y);
					bbm[2] = Math.min(bbm[2],vs[i].z);
					bbm[3] = Math.max(bbm[3],vs[i].x);
					bbm[4] = Math.max(bbm[4],vs[i].y);
					bbm[5] = Math.max(bbm[5],vs[i].z);
				}
				
				
				var c = [0, 0, 0];
			     //computes the centre 
			    c[0] = (bbm[3] + bbm[0]) /2;
			    c[1] = (bbm[4] + bbm[1]) /2;
			    c[2] = (bbm[5] + bbm[2]) /2;
			    
			    
			    g.bb = bbm;  
			    g.centre = c;
			};
			
			
			function testData() {
				var particleCount = 60000;
				var particles = new THREE.Geometry();
				var pMaterial = 	new THREE.ParticleBasicMaterial({
					color: 0xFFFFFF, size: 10 
					});

				// now create the individual particles
				for(var p = 0; p < particleCount; p++) {

				  // create a particle with random
				  // position values, -250 -> 250
				  var pX = Math.random() * 500 - 250,
				      pY = Math.random() * 500 - 250,
				      pZ = Math.random() * 500 - 250,
				      particle = new THREE.Vertex(
				        new THREE.Vector3(pX, pY, pZ)
				      );

				  // add it to the geometry
				  particles.vertices.push(particle);
				}

				// create the particle system
				var particleSystem =
				  new THREE.ParticleSystem(
				    particles,
				    pMaterial);
				
				return particleSystem;
				
			}
			
			function centreModel(vertices) {
				// now create the individual particles
				var min = vertices[0];
				var max = vertices[0];
				
				for(var p = 0; p < vertices.length; p++) {
					if(vertices[p].x < min.x) {
						min.x = vertices[p].x;
					}
					if(vertices[p].y < min.y) {
						min.y = vertices[p].y;
					}
					if(vertices[p].z < min.z) {
						min.z = vertices[p].z;
					}
					if(vertices[p].x > max.x) {
						max.x = vertices[p].x;
					}
					if(vertices[p].y > max.y) {
						max.y = vertices[p].y;
					}
					if(vertices[p].z > max.z) {
						max.z = vertices[p].z;
					}
				}
				
				var centre = new THREE.Vector3(min.x + (max.x-min.x), min.y + (max.y-min.y), min.z + (max.z-min.z)  );
				return centre;
			}
			
			function loadPointCloudZIP(archiveURI, filename) {
			
				var loader = new ZipLoader(archiveURI);
				
				var zipcontents = loader.load(archiveURI + '://' + filename);
				data = jQuery.parseJSON(zipcontents);
						    
				return processData(data);
				
			}
			
			function loadPointCloud(filename) {
				var data;
				$.ajax({
				    type: 'GET',
				    url: filename,
				    dataType: 'json',
				    success: function(d) { data = d;},
				    data: {},
				    async: false
				});
				
				return processData(data);

			}
			
			
			function processData(data) {
				
				var particles = new THREE.Geometry();
				particles.bb  		= [0,0,0,0,0,0];
				particles.centre     = [0,0,0,0,0,0];
				
				var material = new THREE.ParticleBasicMaterial( { size: 10, vertexColors: true, transparent: false } );
				material.color.setHSL( 1.0, 0.2, 0.7 );
				
				//var vertices = data.vertices;
			    //    var colors = data.colors;
					

					var particle;
					
					
					var color;
					// for each 
					for(var p = 0; p < (data.vertices.length/3); p++) {

						particle = new THREE.Vector3(data.vertices[(p*3)], data.vertices[(p*3)+1], data.vertices[(p*3)+2]);
						
						
						
						
						color = new THREE.Color( 0xffffff );
						
						color.r = data.colors[(p*3)];
						color.g = data.colors[(p*3)+1];
						color.b = data.colors[(p*3)+2];
		
						// don't load colour
					//	color.r = 1;
					//	color.g = 1;
					//	color.b = 1;
						
						// add it to the geometry
						particles.vertices.push(particle);
						particles.colors.push(color);
					}
					
					
					computeBoundingBox(particles);
					
					// create the particle system
					var particleSystem =
					  new THREE.ParticleSystem(
					    particles,
					    material);
					
					particleSystem.sortParticles = true;
					// and the position
					
					camera.lookAt( particles.centre);


				   // particleSystem.position.x = particleSystem.position.x -particles.centre.x;
				   // particleSystem.position.y = particleSystem.position.y -particles.centre.y;
				  // particleSystem.position.z = particleSystem.position.z -particles.centre.z;
				   
				//    particleSystem.rotation.x  -= 90;

					return particleSystem;
				
			}
			
			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			function animate() {

				requestAnimationFrame( animate );
				controls.update();

			}

			function render() {

				renderer.render( scene, camera );
				stats.update();

			}