var Harvey=require('./declare').Harvey,UI=require('./declare').UI; 
require("./Utils");
require("./Popups");
// Copyright (c) 2015 Pooka Ltd.
// Name: HarveyDisplaySet.js
// Function: maintains a reference to  all commands that are currently displayed in _DisplayObjects

;(function() {
    'use strict';
    var DEBUG=true;

   
    function check(ar){
	if(!Harvey.checkType["object"](ar)){
	    throw new Error("This is not a window display object " + ar);
	}
	for(var i in ar){
	    var OK=0;
	    var msg=new String;
            for(var k in ar[i]){
	//	console.log("key is " + k);
		switch(k){
		case "display": // check whether there is a display object
		    var d=ar[i][k];
		   //console.log("switch case display " + d);
		    if(!Harvey.display[d]){
			msg=msg.concat("Harvey does not know how to create " + d);
		    }
		    else{
			OK++;
		    }
                    break;
		case "DOM": // does this object exist ?
		    //var d=document.getElementById(ar[i][k]);
                    var d=true;
                    if(!ar[i][k] || ar[i][k].length===0){
                        d=false;
                    }
		  // console.log("switch case DOM ", d);
		    if(!d){
			msg=msg.concat("No Dom object called " + d);
		    }
		    else{
			OK++;
		    }
		    break;
		case "id":  // must have an id
		  //  console.log("switch case id");
		    if(!ar[i][k] || ar[i][k].length===0){
			msg=msg.concat("display objects must have an id");
		    }
		    else{
			OK++;
		    }
		    break;
		default:
		 //   console.log("this is default");
		    break;
		}

	    }
	    if(OK !== 3 ){
		//console.log("got " + OK );
		throw new Error(msg);
	    }
	}
	return true;
    }

    Harvey.Window={
        _list:{},
        close:function(name){
            var p=this._list[name];
            if(p){
                p.close();
            }
            else{
                throw new Error("Harvey.Window: Cannot find window " + name);
            }
        },
        closeAll:function(){
           // console.log("Close all is here");
            for(var k in this._list){
                this._list[k].close();
            }
           // this._list.length=0;
        },
        inList:function(name){
           // console.log("is " + name + " in list?");
           // console.log("Window: inList length is " + this._list.length);
            for(var k in this._list){
             //   console.log("window in list is " + k);
                if(k == name){
                    return this._list[k];
                }
            }
            return null;
        },
        open:function(d){     // open a new window or a tab
            var settings=new String;
            var that=this;
            var defaults={
                width:600,
                height:600,
                menubar:0,
                toolbar:0,
                location:0,
                personalbar:0
            };


            if(this.inList(d.name)){
                throw new Error("Harvey,Window: " + d.name + " already exists");
            }
	  //  console.log("creating new window");
          //  for(var k in d.opts){
          //      console.log("option is " + k);
         //   }
	    if(!d.opts){
         //      console.log("NO OPTS FOR WINDOW");
	        settings="_blank"; // open in new tab
	    }
            else{
                Harvey.mixinDeep(d.opts,defaults);
                
                for(var k in d.opts){
                    if(settings === ""){
                        settings=settings.concat((k + "=" + d.opts[k]));
                    }
                    else{
                        settings=settings.concat(("," + k + "=" + d.opts[k]));
                    }
                }
                console.log("settings are " + settings);
            }
	    var win=window.open(d.url,d.name,("'"+ settings + "'"));
            var p=new Promise(function(resolve,reject){
	        if(!win){
                    reject("Could not open window");
	        }
	        window.addEventListener("childReady",function(){
	            return function(e){
		        if(e.data === win){
		            console.log("window equals e.data");
                            that._list[d.name]=win;
                            resolve({"window":win,"name": d.name});
		        }
                        else{
                            reject(("Harvey.Window: could not open " + d.name));
                        }
		      //  console.log("Parent child is ready");
		    };
	        }(d.name,win,p),false);
            });
            
            p.then(function(d){
                d.window.onunload=function(e){
                   // console.log("got child closed " + d.name);
                    // delete the window from the list
                    var p=that._list[d.name];

                    if(p !== null){
                        Harvey.Panel._deletePanel(p);
                        delete that._list[d.name];
                    }
                    else{
                        throw new Error("Could not find window to remove");
                    }
                };
            }).catch(function(reason){
                Harvey.popup.error("Window Open Error",reason);
            });
                                        
	    return p;
        }
    };

    Harvey.Panel={
	_list: [],  // list of all the Panels. Panel is a group of elements comprising a logical UI object.
        UIStart:function(w){
            var nv;
            console.log("UIStart is here");
            if(w === undefined){
                throw new Error("Panel.UIStart needs a string array of valid UI Panel names");
            }
            for(var i=0;i<w.length;i++){
                console.log("trying to find " + w[i]);
                nv=this._UIGet(w[i]);
                if(nv !== null){
                    this.add(nv);
                }
                else{
                    throw new Error("Harvey.Panel: No panel called " + w[i] + " was found in UI.Panels");
                }
            }

        },
        _UIGet:function(name){
            console.log("UIGet trying to find " + name);
            console.log("UIGet Panels " + UI.Panels);
            if(name === undefined){
                throw new Error("Panel._UIGet: panel name is undefined");
            }
            for(var k in UI.Panels){
                console.log("trying to get panel " + name + " from " + k);
                if(k == name){
                    console.log("found " + name);
                    var cd=Harvey.cloneDeep(UI.Panels[k]);
                   // console.log("clone deep is " + cd);
                    return cd;
                }
            }
            return null;
        },
        _deletePanel:function(win){ // remove a panel that is in a separate browser
            for(var i=0;i<this._list.length;i++){
                if(this._list[i].window == win){
                    this.delete(this._list[i].name);
                }
            }
        },
	inList: function(k){
            if(k===undefined){
                throw new Error("Panel: inList name is undefined");
            }
	    for(var i=0;i< this._list.length;i++){
	//	console.log("i is " + i + "checking is in list " + this._list[i].name);
		if(this._list[i].name == k){
		    return i;
		}
	    }
	    return null;
	},
        get: function(k){
            var u=this.inList(k);
            if(u !== null){
                return this._list[u];
            }
          //  console.log("panel not yet in list");
            return null;
        },
        show:function(k){
            if(k===undefined){
                throw new Error("Panel.show name is undefined");
            }
            var p=this.get(k);
            if(!p){
                var w=this._UIGet(k);
                if(!w){
                    throw new Error("Cannot find panel " + k);
                }
                else{
                    p=this.add(w);
                    if(p === null){
                         throw new Error("Cannot find panel " + k);
                    }
                }
            }
            var c=p.getChildren();
            for(var i=0;i<c.length;i++){
               // if(!$.contains(window.document.body,c[i].element)){
              //        c[i].DOM.append(c[i].element);
                //  }
                c[i].show();
            }
        },
        hideAll: function(){
            for(var i=0;i<this._list.length;i++){
                this.hide(this._list[i].name);
            }
        },
        hide:function(k){
            var p=this.get(k);
            //console.log("hiding window " + k);
            if(!p){
                throw new Error("Panel.hide Cannot find panel " + k);
            }
            var c=p.getChildren();
            for(var i=0;i<c.length;i++){
                //c[i].element.detach();
                c[i].hide();
            }
        },
        getList: function(){
            var l=[];
            for(var i=0;i< this._list.length;i++){
              //  console.log("panel has " + this._list[i].name + " at " + i);
                l[i]=this._list[i].name;
            }
            return l;
        },
        clone: function(panel,win){ // clone an existing panel and put in new window
            var stuff={},np,p,name,i=0;
            
            if(!win){
                throw new Error("Harvey,Panel.clone: needs a window parm");
            }
            p=this.get(panel);
            if(p !== null){
                name=panel;
                np=this._UIGet(panel); //need to change the name
                if(np == null){
                    throw new Error("Panel can't find " + panel + " in UI.Panels");
                }
                while(this.get(name) !== null){
                    i++;
                    name=(name + i);
                }
                np.name=name;
            //    console.log("name is " + name + " i is " + i);
                for(var j=0;j<np.components.length;j++){
                    np.components[j].id = ( np.components[j].id + i);
                }
                return np;
            }
            else{
                throw new Error("Harvey.Panel.clone: No panel named " + panel + " found");
            }
        },
	add: function(panel){
	   console.log("Panel.add is here");
	    console.log("+++++++++++=adding panel object ++++++++++ " + panel.name);
            if(Harvey.checkType['string'](panel)){
                var w=this._UIGet(panel);
                panel=w;
            }

	    if(this.inList(panel.name) === null){
		check(panel.components);

		var p=Harvey._panelComponents(panel);
		// for(var k in p){
		//     console.log("panel base has keys " + k);
		// }
		this._list.push(p);
	    }
	    else{
		throw new Error("Panel.add " + panel.name + " is already in the display list");
	    }
            return p;
	},
        deleteAll: function(promise_resolve){
            var obj;
            var n=this._list.length;
            for(var i=0;i<n; i++){
               // console.log("window: removing panel " + this._list[i].name + " from list");
               	obj=this._list[i];
                obj.deleteChildren();
                if(promise_resolve){
                    if(i===(n-1)){
                       // console.log("***********************************8delete is done");
                        promise_resolve();
                    }
                }
                for(var k in obj){
                    delete obj[k];
                }
                obj=null;
            }
            if(!promise_resolve){
                Harvey.Window.closeAll();
            }
            this._list.length=0;
        },
        delete: function(name){
   	    var p=this.inList(name);
	    if(p !== null){
                var obj=this._list[p];
                obj.deleteChildren();
	//	console.log("panel: removing panel " + obj.name + " from list");
		this._list.splice(p,1);
                for(var k in obj){
                  //  console.log("DELETING " + k);
                    delete obj[k];
                    
                }
                obj=null;
            }
            else {
                throw new Error("Harvey.Panel delete -" + name + "is not in the list of Panels");
            }
	}
    };
    var _Components=function(obj){
        var that=this;
        //	for(var k in obj){
	//this[k]=obj[k];
	  //   console.log("_HarveyPanelComponents got value " + k + " value ", this[k]);
	//}
        Harvey.mixinDeep(this,obj);
	if(obj.window){
	    var p=Harvey.Window.open(obj.window);  // create a new browser window
	    p.then(function(w){
		w.window.focus();
            //    console.log("got object from window.open.done");
          //      for(var k in w){
          //          console.log("obj has parm " + k + " with value " + w[k]);
           //     }
		that.window=w.window;
        	that._addComponents();
        
	    } ).catch(function(reason){
                throw new Error("Panel: cannot open window " + reason);
            });
	}
        else{
            that._addComponents();
        }
    };

    _Components.prototype={

	_addComponents: function(){
	    var that=this;
            var d;
	    var doit=function(that,index){
              //  console.log("doit is here index is " + i);
                if(!d.hidden){ /// hmmmm
        	    d.show();
                }
		that.components[index]=d;
	    };

	    for(var i=0;i<this.components.length;i++){
                // check that DOM parent exists
                                                       
		var p=this.components[i].display;
             //   console.log("adding component " + p);
		this.components[i].parent=this;
               // console.log("addComponents window is " + that.window);
	        d=Harvey.display[p](this.components[i],that.window);
                
		if(!d){
		    throw new Error("could not create " + p);
		  
	        }
	            /*	if(d.deferred){
                    Harvey.popup.spinner(true);
		    d.deferred.done(function(that){
	//		console.log("deferred done");
			doit(that,i);
                        Harvey.popup.spinner(false);
		    }(that));
		}
		else{
		    doit(this,i);
		     } */
                doit(this,i);
	    }

	},
	addChild: function(display_object){ // to existing panel
            var d;

            if(this.getChild(display_object.id)){
                throw new Error("Harvey.Panel: already have a child with id " + display_object.id);
            }
            if(!display_object.display){
                throw new Error("You can only add display objects to a window");
            }

            if(!display_object.displayType){ //has not been instantiated
                d=display_object;
                display_object=Harvey.display[d.display](d,this.window);
                if(!display_object){
                    throw new Error("Panel.addChild: could not create display object " + d.display);
                }
            }
     //       console.log("adding child length is " + this.components.length);
            display_object.parent=this;
 	    this.components.push(display_object);
            if(display_object.hidden !== true){
                display_object.show();
            }
       //     console.log("after add adding child length is " + this.components.length);
	},
        deleteChildren: function(){
            if(!this.components){
                throw new Error("Panel: has no children " + this.name);
            }
            for(var i=0;i<this.components.length;i++){
            //    console.log("panel_components.deleteChildren: " + this.components[i].display);
                if(this.components[i].listen){
                    Harvey.IO.unsubscribe(this.components[i]);
                }
                this.components[i].delete("message from parent");
            }
            this.components.length=0;
        },
	deleteChild: function(obj){
            var index=-1;
            //var obj=o;
            if(!obj){
                throw new Error("Harvey.Panel: deleteChild obj is null");
            }
            if(Harvey.checkType['string'](obj)){
              //  console.log("got string for delete child");
                obj=this.getChild(obj);
            }
           // console.log("deleteing child length is " + this.components.length);
	   // console.log("Panel delete child is here");
            if(obj.listen){ // remove the listener
		Harvey.unsubscribe(obj);
	    }
	    for(var i=0;i<this.components.length;i++){
		if(obj === this.components[i]){
                    index=i;
                    break;
		}
	    }
            if(index !== -1){
                this.components[index].delete("message from parent");
	        this.components.splice(index,1);
            }
            else{
                throw new Error("Panel: deleteChild could not find child " + obj.id);
            }
	  //  if(this.components.length === 0){
	//	console.log("No components left");
	 //       Harvey.Panel.delete(this.name);
	 //   }
	  //  console.log("after delete child length is " + this.components.length);
	},
	getChildren: function(){
	    if (this.components && this.components.length>0){
		return this.components;
	    }
	    return null;
	},
        getChild: function(id){
            if(!this.components){
                return null;
            }
           // console.log("Panel.getChild Trying to find " + id);
            for(var i=0;i< this.components.length;i++){
             //   console.log("this is child " + this.components[i].id);
                if(this.components[i].id === id){
                    return this.components[i];
                }
            }
            return null;
        },
	findChild: function(child){
            if(!this.components){
                return null;
            }
	    var found=null;
	    for(var i=0;i<this.components.length; i++){
	//	console.log("this is child " + i);
		found=null;
		for(var k in child){ // if there is more than one property in the child - make sure all are matched
		    switch(k){
		    case "key":
			(child[k] === this.components[i].getKey())?found=i:found=-1;
			break;
		    case "element":
			(child[k] === this.components[i].getElement())? found=i: found=-1;
			break;
		    case "name":
			(child[k] === this.components[i].getName())? found=i: found=-1;
			break;
		    default:
			found=null;
			break;
		    }
		    //console.log("in keys found key " + k + " and found is " + found);
		    if(found === -1){
			break;   // has the key but not matched so move to next child
		    }
		}
		if(found !== null && found !== -1){
		    return this.components[i];
		}

	    }
	    return null;
	}
    };

    Harvey.mixinDeep(Harvey,
                     { _panelComponents:
                       function(t){
                           if(t === "methods"){
                               var f={};
                               for(var k in _Components.prototype ){
                                   f[k]=k;
                               }
                               return f;
                           }else{
                               return new _Components(t);
                           }
                       }
                     });
})();
