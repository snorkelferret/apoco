var Apoco=require('./declare').Apoco;
require("./Utils");
require("./Popups");
require("./Fields");

;(function(){

    'use strict';
    // these are the components allowed in display objects
  
    var _display_components=["Field","Node","Tab","Grid","Menu"];

    Apoco.display={};  //setup container for display Objects
    
    var dp;
    Apoco._DisplayBase=function(options,win){
	var defaults={
	    parent: null,
	    element: null,
	    DOM: null,
            id: null
	};
        var that=this,t;
       
        for(var k in defaults){
            if(options[k] === undefined){
                options[k]=defaults[k];
            }
        }
        for(var k in options){
            this[k]=options[k];
        }

        //console.log("DisplayBase parent is " + this.parent);
        if(this.DOM === null){
            throw new Error(this.display + ": Must supply a DOM id for an existing node");
        }
        if(this.id === null){
            throw new Error(this.display + ": Must supply a unique id string");
        }
    
        if(win){
          //  console.log("++++++++++++++++++++++= Adding display to child window " + this.display);
          //  console.log("adding to DOM " + this.DOM);
	    this.DOM=win.document.getElementById(this.DOM);
            t=win.document.getElementById(this.id);
            if(this.dependsOn){
                dp=win.document.getElementById(this.dependsOn);
            }
        }
        else{
            t=document.getElementById(this.id); 
	    this.DOM=document.getElementById(this.DOM);
            if(this.dependsOn){
                dp=document.getElementById(this.dependsOn);
            }
            // console.log("hpy  %j" , this.DOM);
            //console.log("length is " + this.DOM.length);
        }
	if(!this.DOM){
	    throw new Error("_ApocoDisplayBase DOM element does not exist " + this.DOM);
	}

	if(t){
	   t.parentNode.removeChild(t);
	}

        var doit=function(context){
           // console.log("DOIT IS HERE");
            if(context.action){
	 	context.action(context);
	    }
        };
        // if the execution depends on another node
        if(this.action){
            if(this.dependsOn && !dp){
                //this.dependsOn).length === 0){ // watch for node
                //console.log("in displayBase id is " + this.dependsOn);
                if(!Apoco.Observer){    // create an observer- only need one
                    Apoco.Utils.observer.create();
                    if(!Apoco.Observer){ 
                        throw new Error("Np observer found");
                    }
                }
                var b=document.getElementsByTagName("body")[0];
                Apoco.Observer.observe(b,{childList:true,subtree:true,attributeFilter:["id"]});
                Apoco.Utils.observer.add(this.dependsOn, doit,this);
                // Apoco.Observer.observe(this.DOM,{childList: true,attributeFilter:["id"]});
            }
            else{ 
                this.action(this);
            }
        }

	if(this.listen !== undefined){
       //    console.log("listen listen listen");
         //   for(var k in this){
         //       console.log("just before listen " + k);
        //    }
	    Apoco.IO.listen(this);  
	}
        // add the display type to the display_components list
        
      //  var d=(this.display).substr( 0, 1 ).toUpperCase() + this.display.substr( 1 );
      //  console.log("d is " + d + " this.display " + this.display);
    	//console.log("end of libbase");
    };

    // var methods= {
    Apoco._DisplayBase.prototype={
	getChildren: function(){
	    var comp=[];
            var k;
            for(var i=0; i< _display_components.length;i++){
                k=("get" + _display_components[i]);
	        if(this[k]){
                    if(comp.length === 0){
                        comp=this[k]();
                    }
                    else{
                        comp.concat(this[k]());
                    }
                  //  console.log("getChildren got " + comp.length);
                    return comp; //this[k];
	        }
            }
            return null;
        },
        getChild:function(name){
            var k;
            if(name !== undefined){
                for(var i=0; i< _display_components.length;i++){
                    var k=("get" + _display_components[i]);
                    if(this[k]){
                        return  this[k](name);
                    }
                }
                return null;
            }
            return null;
        },
        deleteChild:function(name,no_splice){
            var k;
            if(name !== undefined){
                for(var i=0; i< _display_components.length;i++){
                    k=("delete"+_display_components[i]); 
                    if(this[k]){
                        this[k](name);
                        return true;
                    }
                }
            }
            else{
                throw new Error("deleteChild- needs a name");
            }
            return null;
        },
        _getMethods:function(){
            var m=[];
            for(var k in this){
                m.push(k);
            }
            return m;
        },
	getElement: function(){
	    return this.element;
	},
	getDisplayType: function(){
	    return this.display;
	},
	getName: function(){
	    if(this.name){
		return this.name;
	    }
	    return null;
	},
	getKey: function(){  
	    if(this.name){  // if this is a real instance
		return this.name;
	    }
	    if(this.id){
		return this.id;
	    }
	    return null;
	},
	getParent: function(){
	    return this.parent;  // DisplaySet to which this element belongs
	},
	getSibling: function(name){
	    if(this.parent){
		var t=this.parent.getChildren();
                var c=[];
		//console.log("getSiblings: creator has " + this.parent.Components.length + " elements");
		for(var i=0;i<t.length;i++){
		    if(t[i] !== this){
			//console.log("getSiblings: found " + t[i].getKey());
                        if(name && t[i].getKey() === name){
                            return t[i];
                        }
			else{
                            c.push(t[i]);
                        }
		    }
		}
                if(name){  // not found
                    return null;
                }
		return c;
	    }
	    else{
		throw new Error("Parent is not defined for " + this.name);
	    }
	},
	_execute: function( data ) {
	    return null;  // if function has not been overwritten - bad return null
	},
	show: function(){
          // console.log("ApocoDisplayBase: showing " + this.id);
	    if(this.publish !== undefined){
	        //console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj Publish 99999999999999999999999999999");
	        Apoco.IO.publish(this);
	    }
            if(!this.DOM.contains(this.element)){
              //  console.log("Showing element that is not in DOM");
	        if(this.element){
		  //  console.log("show found non null element");
                    if(this.after){
                        var a=document.getElementById(this.after);
                        if(a && a.nextSibling){    // && $.contains(this.DOM[0],a[0])){ //insert after
                            a.parentNode.insertBefore(this.element,a.nextSibling);
                            //$("#" + this.after).after(this.element);
                        }
                        else{
                            this.DOM.appendChild(this.element);
                            //throw new Error("Apoco.display.show: cannot find element " + this.after );
                        }
                    }
                    else{
                        this.DOM.appendChild(this.element);
                    }
                    if(this._afterShow !== undefined){
                     //   console.log("DisplayBase: calling afterShow ");
                        this._afterShow();
                    }
		}
	        else {
		    //console.log(" --- invalid element");
		    throw new Error("No valid element for " + this.getKey());
		    return null;
	        }
             }
            return true;
 	},
        isHidden:function(){
            if(this.DOM.contains(this.element)){
                return false;
            }
            return true;
        },
        displayType: function(){
            return this.displayType;
        },
        hide:function(){
          //  console.log("trying to hide " + this.id);
            if(this.DOM.contains(this.element)){
             //   console.log("Hiding element that is in dom");
                this.DOM.removeChild(this.element);
                return;
            }
//           console.log("Can't hide element that is NOT in dom");
        },
	delete: function(msg_from_parent){
	    //console.log("delete display object is here");
            if(this.listen){
                Apoco.IO.unsubscribe(this);
            }
            if(this.draggable){
                //this.draggable.delete(); // FIX THIS
                console.log("Need method to delete draggable");
            }
            this.deleteAll();
            if(this.element && this.element.parentNode){
                this.element.parentNode.removeChild(this.element);  //removes events and data as well
                this.element=null;
            }
	    else{
                console.log("this element should not be null " + this.id);
            }
          
	    if(this.parent && msg_from_parent === undefined){
		//console.log("WE have a parent");
		this.parent.deleteChild(this);
	    }
            //this.element=null;
            
	}
    };

})();
