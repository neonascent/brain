/*-------------------------------------------------------------------------
    This file is part of Voxelent's Nucleo

    Nucleo is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation version 3.

    Nucleo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Nucleo.  If not, see <http://www.gnu.org/licenses/>.
---------------------------------------------------------------------------*/ 
/**
 * @namespace Application Programing Interface namespace.
 *  
 * Using vxl.api in your programs you will be able to access many of the features offered by 
 * Voxelent's Nucleo library.
 * 
 * By design, type checking is enforced throughout the functions provided by the public API. 
 * The goal is to help novice programmers that will use the API more often than advanced programmers.
  */
vxl.api = {
 
 /**
  * Creates and returns a vxlView object
  * @param {String} canvas_id The canvas' Document Object Model (DOM) id.
  * @param {vxlScene} scene optional, the scene associated to this view
  * @param {Boolean} handleLayout if true or absent, the canvas will be resized dynamically
  * @returns {vxlView} a new vxlView object
  */
 setup : function(canvas_id, scene, handleLayout){
 	if (scene != null && !(scene instanceof vxlScene)) throw ('api.setup: scene parameter is invalid');
 	return new vxlView(canvas_id,scene,handleLayout);
 },
  
  /**
   * Sets the rendering rate of the current view
   * @param {Number} r the new rendering rate given as a number in milliseconds
   * @see api#setCurrentView
   */
 setRenderRate : function(r){
	vxl.c.view.renderer.setRenderRate(r);
  },
  
  /**
   *Sets the render mode for the current view or the view passed as second
   * parameter 
   * @param {String} mode one of the modes defined in <code>vxl.def.renderer.mode</code>
   * @param {vxlView} view the view (Optional) If this is not set up then the current view is used
   */
  setRenderMode : function(mode, view){
      if (view == undefined && vxl.c.view == undefined){
          throw ('api.setRnederMode: you need to define a view');
      }
      else if (view != undefined && view instanceof vxlView){
          view.renderer.setMode(mode);
      }
      else {
          vxl.c.view.renderer.setMode(mode);
      }
      
  },
  /**
   *Changes the field of view of the current camera
   * 
   * @param{Number} fov the field of view in degrees [0-360] 
   */
  setFieldOfView : function(fov){
      if (fov >0 && fov <= 360){
        vxl.c.camera.setFieldOfView(fov);
      }
      else{
          throw('api.setFieldOfView: the field of view should be between 0 and 360 degrees');
      }
  },
 
 /**
  * If the object passed as a parameter is a vxlView then it sets it up as the current view.
  * All subsequent calls to API functions that reference the current view will be redirected
  * to affect the newly set object.
  * @param {a} the vxlView object that we want to make the current one
  */
 setCurrentView :  function(a){
	if (a instanceof vxlView){
		vxl.c.view = a;
	}
 },

 /**
  * Returns the current view. This is the view that is receiving all the API calls
  * @returns {vxlView} the current view
  */
 getCurrentView :  function(){
	return vxl.c.view;
 },
 
 
 /**
  * Sets the current actor
  * @param {vxlActor, String} actor This could be an actor object or an actor name
  * 
  * If the actor name is passed to this method, there must be a current scene. 
  * Otherwise an exception will raise.
  */
 setCurrentActor :  function(actor){
	if (actor instanceof vxlActor){
		vxl.c.actor = actor;
	}
	else if (typeof actor == 'string'){
		if (vxl.c.scene == undefined) throw ('vxl.api.setCurrentActor: there is no Current scene. Please call vxl.api.setCurrentScene');
		
		var theActor = vxl.c.scene.getActorByName(actor);
		if (theActor != undefined){
			vxl.c.actor = theActor;
		}
		else {
			throw ('vxl.api.setCurrentActor: the actor '+actor+' does not exist in the current scene');
		}
	}
	else{
	    vxl.c.actor = actor;
	}
 },
 
 getCurrentActor :  function(){
	return vxl.c.actor;
 },

 setCurrentCamera :  function(a){
	if (a instanceof vxlCamera){
		vxl.c.camera = a;
	}
 },
 
 getCurrentCamera :  function(){
	return vxl.c.camera;
 },

 setLookupTable :  function(name){
 	if (!vxl.go.lookupTableManager.isLoaded(name)){
		vxl.go.console('Lookup Table '+name+' has not been loaded');
		return;
	}
	
	vxl.c.view.scene.setLookupTable(name);
 },
 
 /**
  *@param {String} folder. This parameter is required. It specifies the location from where
  * the lookup tables will be loaded. If this parameter is not passed the current folder will
  * be used. The current folder is determined on running time and it is the folder where voxelent is 
  * located.
  */
 loadLUTS :  function(folder){
 	vxl.go.lookupTableManager.setLocation(folder);
	vxl.go.lookupTableManager.loadAll();
 },

 /**
  * Go back to square one. A clean scene with no actors
  * @TODO: Provide the option to keep the models in the cache (vxlModelManager)
  */
 resetScene :  function(){
    if (vxl.c.animation) vxl.c.animation.stop();
	vxl.c.view.reset();
	vxl.go.modelManager.reset();
 },
 
 /**
  * Loads 3D models, textures and other models to a Voxelent's scene.
  * 
  * This method is very flexible. It can load one or multiple models depending on the type of the 
  * first parameter. If it is a String, it will try to find the file with that name in Voxelent's data folder
  * (voxdata by default). Otherwise, if  the parameter 'arguments' is an Array, load will iterate
  * through it and will try to load every element of this list. Every element being the file name.
  * 
  * Nucleo supports three different loading modes which are defined in 
  * vxl.def.model.loadingMode:
  * 
  * LIVE: As each asset is loaded it is added immediately into the scene by creating the corresponding actor
  * 
  * LATER: All the models are loaded first THEN the actors are created. 
  * This is useful when you want to display a full scene instead of showing incremental updates.
  * 
  * DETACHED: The models are loaded into the vxlModelManager object but actors are never created.
  * This allows background loading.
  * 
  * @param {String|Array} arguments the name of the asset or the list of models (each element being the file name).
  * @param {String} path the path that will be concatenated to the list of files (optional).
  * @param {vxl.def.model.loadingMode} mode the loading mode
  * @param {vxlScene} scene the scene in case we do not want to load these models in the current one
  * 
  * @see {vxl#def#asset#loadingMode}
  * @see {vxlAssetManager}
  * @see {vxlScene#setLoadingMode}
  * 
  */
 load :  function(arguments,path,mode,scene){
 	
 	var scene = scene==null?vxl.c.scene:scene;
 	var models = [];
 	
 	var p = vxl.util.getPath(path);
 	
 	if (typeof(arguments) == 'string' || arguments instanceof String){
 		models.push(p  + arguments);
 	}
 	else if (arguments instanceof Array){
 		for(var i=0; i<arguments.length;i++){
			models.push(p + arguments[i]);
		}
 	}
 	if (mode != undefined && mode != null){
		scene.setLoadingMode(mode);
	}
	
	vxl.go.modelManager.loadList(models, scene);
 },
 
 /**
  * Loads a sequence
  * @param {String} prefix the shared name by all the files. For instance part in part1, part2, ...
  * @param {Number} start start number in the sequence
  * @param {Number} end end number in the sequence
  * @param {String} path relative path to the webpage where the files are located
  * @param {String} mode a loading mode (See load method)
  * @param {String} scene the scene where the generated actors should be placed
  */
 loadSequence :  function(prefix, start, end, path,mode,scene){
    
    var scene = scene==null?vxl.c.scene:scene;
    var models = [];
    
    var p = vxl.util.getPath(path);
    
    for(var i=start;i<=end; i+=1){
        models.push(p + prefix+i+'.json');
    }
    if (mode != undefined && mode != null){
        scene.setLoadingMode(mode);
    }
    
    vxl.go.modelManager.loadList(models, scene);
 },
 
 /**
  * Activates the axis in the current view
  * The axis is always centered in the focal point of the camera
  */
 axisON :  function(){
    if (vxl.c.scene == undefined){
       throw ('vxl.api.axisON: There is no current scene');
    }
	vxl.c.scene.toys.axis.setVisible(true);
	vxl.c.camera.refresh();
 },
 
 /**
  * Hides the axis in the current view
  */
 axisOFF :  function(){
    if (vxl.c.scene == undefined){
        throw ('vxl.api.axisOFF: There is no current scene');
    }
	vxl.c.scene.toys.axis.setVisible(false);
	vxl.c.camera.refresh();
 },
 
 /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 boundingBoxON :  function(){
    if (vxl.c.scene == undefined){
        throw ('vxl.api.boundingBoxON: There is no current scene');
    } 
	vxl.c.scene.toys.boundingbox.setVisible(true);
	vxl.c.camera.refresh();
 },
 
  /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 boundingBoxOFF:  function(){
    if (vxl.c.scene == undefined){
        throw ('vxl.api.boundingBoxOFF: There is no current scene');
    }
	vxl.c.scene.toys.boundingbox.setVisible(false);
	vxl.c.camera.refresh();
 },
 
/**
 * Shows the scene's floor. If the dimension and spacing have not been set, then the floor wiill not be visible'
 * @param{NUmber} dimension the floor dimension (this number will be multiplied by 2 to cover the negative cartesian space)
 * @param{Number} spacing the spacing tells how often we have grid divisions
 */
floorON: function(dimension, spacing){
    if (vxl.c.scene == undefined){
        throw ('vxl.api.floorON: There is no current scene');
    }
    if (dimension == undefined || spacing == undefined){
        vxl.c.scene.toys.floor.setVisible(true);
    }
    else{
        vxl.c.scene.toys.floor.setGrid(dimension, spacing);
    }
    vxl.c.camera.refresh();   
},

/**
 * Hides the floor in the current scene 
 */
floorOFF: function(){
    if (vxl.c.scene == undefined){
        throw ('vxl.api.floorOFF: There is no current scene');
    }
    vxl.c.scene.toys.floor.setVisible(false);
    vxl.c.camera.refresh();
},
 

/**
 * Sets the background color of the current view.
 * @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} g if r is a number, then this parameter corresponds to the green component
 * @param {Number} b if r is a number, then this parameter corresponds to the blue component
 */ 
 setBackgroundColor :  function(r,g,b){
	vxl.c.view.setBackgroundColor(r,g,b);
 },



/**
 * If an actor has been selected (If there is an current actor in vxl.c.actor), 
 * changes its visualization mode to WIREFRAME. 
 * Otherwise,shows all the scene in WIREFRAME mode.
 * 
 * @see vxl.def.actor.mode
 */ 
wireframeON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	else {
		vxl.c.scene.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	vxl.go.console('API:Wireframe is shown.');
 },
 
 /**
  * Changes the visualization mode of the current actor (or all the actors if there's no current actor')
  * to a solid representation
  * @see vxl.def.actor.mode
  */
 surfaceON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	vxl.go.console('API:Wireframe is hidden.');
 },
 
 /**
  * Changes the visualization mode of the current actor (or all the actors if there's no current actor')
  * to a point representation
  * @see vxl.def.actor.mode
  */
 pointsON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
 },
 
  /**
  * Changes the visualization mode of the current actor (or all the actors if there's no current actor')
  * to a solid representation
  * @see vxl.def.actor.mode
  */
 solidWireframeON :  function(){
    if (vxl.c.actor){
        vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.WIRED_AND_SOLID);
    }
    else {
        vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.WIRED_AND_SOLID);
    }
    vxl.go.console('API:Wireframe is hidden.');
 },
 /**
  * Returns a list of actor names. 
  * @param {vxlScene} scene the scene. This parameter is optional 
  */
 getActorNames : function(scene){
    var _scene = scene;
    if (_scene == undefined){ //look in the current scene
        if (vxl.c.scene == undefined){
            throw ('vxl.api.getActorNames: There is no current scene');
        }
        else{
            _scene = vxl.c.scene;
        }
    }
    return _scene.getActorNames();
 },
 
 /**
  *Creates an actor group for the current scene
  * @param {String} name name of the actor group
  * @param {List} list list of actors to add to the actor group
  * @returns {vxlActorGroup} the actor group
  * @see {vxlScene#createActorGroup} 
  */
 createActorGroup: function(name, list){
     return vxl.c.scene.createActorGroup(name, list);
 },
 
 /**
  *Retrieves an actor by name or UID
  * @param {String} actorNameOrUID actor name or UID
  * @param {vxlScene} scene looks in the specified scene. This parameter is optional. 
  * If not specified, the current scene (vxl.c.scene) will be queried
  */
 getActor: function(actorNameOrUID, scene){
     var actor = this.getActorByName(actorNameOrUID, scene);
     
     if (actor == null){
         actor = this.getActorByUID(actorNameOrUID, scene);
     }
     return actor;
 },
 /**
  * Retrieves an actor object by UID
  * @param {String} actorUID the UID of the actor
  * @param {vxlScene} scene looks in the specified scene. This parameter is optional. 
  * If not specified, the current scene (vxl.c.scene) will be queried
  *  
  */
 getActorByUID :  function(actorUID,scene){
    var _scene = scene;
    if (_scene == undefined){ //look in the current scene
        if (vxl.c.scene == undefined){
            throw ('vxl.api.getActorByUID: There is no current scene. Please the scene you want to look the actor with uid: '+UID+' into');
        }
        else{
            _scene = vxl.c.scene;
        }
    }
    
    return _scene.getActorByUID(actorUID);
 },
 /**
  * Retrieves an actor object by name
  * @param {String} actorName the name of the actor
  * @param {vxlScene} scene looks in the specified scene. This parameter is optional. 
  * If not specified, the current scene (vxl.c.scene) will be queried
  *  
  */
 getActorByName :  function(actorName,scene){
 	var _scene = scene;
 	if (_scene == undefined){ //look in the current scene
 		if (vxl.c.scene == undefined){
 			throw ('vxl.api.getActorByName: There is no current scene. Please the scene you want to look the actor '+actorName+' into');
 		}
 		else{
 			_scene = vxl.c.scene;
 		}
 	}
 	
 	return _scene.getActorByName(actorName);
 },
 
 /**
  * @param {Number} op  opacity value between 0 and 1 (float)
  * @TODO: Reevaluate this method. Opacity is shader dependent
  */
 setActorOpacity :  function(op){
    var opacity = Math.min(Math.max(0,Math.abs(op)),1);
	if (vxl.c.actor){
		vxl.c.actor.setOpacity(op);
	}
	else{
		vxl.c.view.scene.setOpacity(opacity);
	}
	vxl.c.view.refresh();
	vxl.go.console('API:Opacity changed to '+(op*100)+'%');
  },
  
 
 /**
  * Sets a property for one of the actors in the current scene.
  * This metod requires a current scene
  * @param {vxlActor, String} actor it can be a vxlActor or a String with the actor name
  * @param {String} property the property to change 
  * @param {Object} value the new value
  */
 setActorProperty :  function (actor, property, value){
	
	if (vxl.c.scene == undefined) throw ('vxl.api.setActorProperty: there is no current scene. Please call vxl.api.setCurrentScene');
	
	var scene = vxl.c.scene;
	var _actor = actor;
	if (_actor instanceof vxlActor){
		_actor.setProperty(property,value);
	}
	else{ //TODO: assuming string.VALIDATE!
		_actor = scene.getActorByName(_actor);
		if (_actor == undefined) throw 'The actor '+_actor+' does not belong to the current scene'
		_actor.setProperty(property,value);
	}
 },
 
 /**
  * Sets a property for all the actors 
  * @param {String} property the property to change 
  * @param {Object} value the new value
  * @param {vxlScene} scene the scene (optional). If this parameter is not passed the current scene is used 
  */
 setPropertyForAll : function (property, value, scene){
    var s = undefined; 
    if (vxl.c.scene == undefined && scene == undefined) throw ('vxl.api.setPropertyForAll: there is no current scene. Please call vxl.api.setCurrentScene');
    if (scene == undefined){
        s  = vxl.c.scene;
    }
    else {
        s = scene;
    }
    s.setPropertyForAll(property,value);         
 },
 
 
 /**
  * Sets a property for all the actors in the list 
  * @param {Array} list list of actors (String or vxlActor)
  * @param {String} property the property to change 
  * @param {Object} value the new value
  * @param {vxlScene} scene the scene (optional). If this parameter is not passed the current scene is used 
  */
 setPropertyFor : function(list, property, value, scene){
    var s = undefined; 
    if (vxl.c.scene == undefined && scene == undefined) throw ('vxl.api.setPropertyForAll: there is no current scene. Please call vxl.api.setCurrentScene');
    if (scene == undefined){
        s  = vxl.c.scene;
    }
    else {
        s = scene;
    }
    s.setPropertyFor(list,property,value);
 },
 
 /**
 * <p>Returns a list of actors based on the condition passed as parameter.</p>
 * <p>The condition is a function with the following signature:</p>
 * <p><code> condition(vxlActor): returns boolean</code></p>
 * <p>If the condition evaluates true then that actor is included in the results</p>
 * 
 * @param {function} condition the condition to evaluate in the actor list
 * @param {vxlScene} scene (Optional) If this parameter is not set, the current scene will be used
 * @returns {Array} list of actors 
 */
 getActorsThat : function(condition, scene){
    var s = undefined;
    if (vxl.c.scene == undefined && scene == undefined) throw ('vxl.api.setPropertyForAll: there is no current scene. Please call vxl.api.setCurrentScene');
    if (scene == undefined){
        s = vxl.c.scene;
    }
    else{
        s = scene;
    }
    return s.getActorsThat(condition);
 },
 
 /**
  * Flip the normals of the current actor or the whole scene if the current actor is undefined
  */
 flipActorNormals :  function (){
	if (vxl.c.actor){
		vxl.c.actor.flipNormals();
	}
	else{
		vxl.c.view.scene.flipNormals();
	}
	vxl.c.view.refresh();
 },
 
 /**
  *If there is an animation object (vxl.c.animation) then
  * it stops the animation 
  */
 stopAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.stop();
 },
 
 /**
  *If there is an animation object (vxl.c.animation) then 
  * it starts the animation 
  */
 startAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.start();
 },
 
 /**
  * If there is a vxlFrameAnimation object attached to the scene then it 
  * sets the current animation frame
  * @param {Number} f the animation frame index
  */
 setFrame :  function(f){
	if (vxl.c.animation == null) return;
	var a = vxl.c.animation;
	a.stop();
	if (f>=1){
		a.setFrame(f);
	}
	else{
		vxl.go.console('API:frame ' + f +' does not exist. Animation goes back to the beginning');
		a.setFrame(1);
	}
 },

 /**
  *Removes the current animation from the scene 
  */
 clearAnimation :  function(){
	if(vxl.c.animation){
		vxl.c.animation.stop();
		vxl.c.animation = null;
	}
 },
 /**
  * Resets the current camera
  */
 resetCamera :  function(){
	vxl.c.camera.reset();
 },
 
 /**
  * Saves the current camera state
  */
 saveCamera :  function(){
	vxl.c.camera.save();
 },
 
 /**
  * Retrieves the last saved camera state
  */
 retrieveCamera :  function(){
	vxl.c.camera.retrieve();
 },
 
 /**
  * Sets the azimuth of the camera
  * @param {Number} a azimuth
  */
 setAzimuth :  function(a){
	vxl.c.camera.setAzimuth(a);
 },
 
 /**
  * Sets the elevation of the camera
  * @param {Number} e elevation
  */
 setElevation :  function(e){
	vxl.c.camera.setElevation(e);
 },
 
 
 getLookupTables :  function(){
    return vxl.go.lookupTableManager.getAllLoaded();
 },
 
 //runScript :  function(file){
 //use JQuery here.
 //}
 

 //TODO: Wwork in progress... sorry for the mess.
 //buildProgramFromDOM: function(id,VERTEX_SHADER_DOM_ID,FRAGMENT_SHADER_DOM_ID){
 //       var vshader= document.getElementById(VERTEX_SHADER_DOM_ID);
        
     
 //},
  /**
  * Forces the renderer to use a specific program
  * @param{vxlView} view the view to configure
  * @param{Object} program a JSON object that defines the progrma to execute
  * @param{vxlEngine} engine (optional) the engine that the renderer should use to communicate with the program. T
  *                        
  */
 setProgram :  function(view,program,engine){
    view.renderer.setProgram(program,engine,true);
    
 },
 
 /**
  *Releases the program used by the view passed as parameter
  * @param{vxlView} view
  */
 releaseProgram: function(view){
     view.renderer.releaseProgram();
 },
 /**
  * Returns the name of the current program
  * @param {vxlView} view the view that we want to query. If this parameter is not passed,
  * the current view will be used (vxl.c.view) 
  */
 getProgram : function(view){
     if (view == undefined){
         view = vxl.c.view
     }
     if (view == undefined){
         throw ('vxl.api.getProgram: please indicate a view');
     }
     return view.renderer.pm._currentProgramID;
 },
 /**
  * Sets the default value for an uniform
  */
  setUniformDefault: function(programID, uniformID, value){
      vxl.c.view.renderer.pm.setDefault(programID, uniformID, value)
  },
  
  setUniform: function(uniformID, value){
      vxl.c.view.renderer.pm.setUniform(uniformID, value)
  },
  
  /**
   * Gets the default value for an uniform 
   */
  getUniformDefault: function(programID, uniformID){
      vxl.c.view.renderer.pm.getDefault(programID, uniformID);
  },
  
  /**
   * Return the uniform names of the current program
   */
  getUniformList: function(){
      return vxl.c.view.renderer.pm._uniformList[vxl.c.view.renderer.pm._currentProgramID].slice(0);
  },
  
  getUniform : function(uniformID){
     return vxl.c.view.renderer.pm.getUniform(uniformID);  
  },
  
  /**
   * <p>Suscribes the to Voxelent events </p>
   * 
   * <p>The context parameter corresponds to the class that is going to listen for Voxelent events.</p>
   * 
   * <p>Such class needs to implement a method to handle the events that it has subscribed to. This method/function needs
   * to have the following signature:</p>
   * 
   * <p><code>handleEvent(event, src)</code></p>
   * 
   * <p> The event parameter corresponds to the event that has been fired by Voxelent. Notice that 
   * your class will only be notified of those events that it has been subscribed to.
   * 
   * @param {String, Array} list the event or events that we are going to subscribe to
   * @param {Object} context the object that needs to implement the handleEvent method
   * 
   */
  subscribe: function(list, context){
  	vxl.go.notifier.subscribe(list, context);
  }
  
 }; 
 