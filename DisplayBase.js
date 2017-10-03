var Apoco=require('./declare').Apoco;
require("./Utils");
require("./Popups");
require("./Fields");

;(function(){

    'use strict';
  
    Apoco.display={};  //setup container for display Objects
    
   
    Apoco._DisplayBase=function(options,win){
	var defaults={
	    parent: null,
	    element: null,
	    DOM: null,
            id: null,
            hidden: false,
            components:[]
	};
        var that=this,t,dp;
       
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
    
        if(!win){
            win=window; // set to default window
        }
          //  console.log("++++++++++++++++++++++= Adding display to child window " + this.display);
          //  console.log("adding to DOM " + this.DOM);
	this.DOM=win.document.getElementById(this.DOM);
        t=win.document.getElementById(this.id);
        if(this.dependsOn){
            dp=win.document.getElementById(this.dependsOn);
        }
        
        if(!this.DOM){
	    throw new Error("_ApocoDisplayBase DOM element does not exist " + this.DOM);
	}

	if(t){
	    t.parentNode.removeChild(t); //remove from DOM but can be reinserted
            this.element=t;
	}
        else{
            this.element=document.createElement("div");
            this.element.id=this.id;
        }
        
        this.element.classList.add("apoco_"+this.display);  
        if(this.class){
            if(Apoco.type["string"].check(this.class)){
                this.element.classList.add(this.class);
            }
            else{
                for(var i=0;i< this.class.length;i++){
                    this.element.classList.add(this.class[i]);
                }
            }
        }
        
        var doit=function(context){
           // console.log("DOIT IS HERE");
            if(context.action){
	 	context.action(context);
	    }
        };
         // if the execution depends on another node
        if(this.action){
            if( !this.dependsOn || dp){
                this.action(this);
            }
            else if(!dp){ //element not already in DOM
                if(!Apoco.Observer){    // create an observer- only need one
                    Apoco.Utils.observer.create();
                    if(!Apoco.Observer){ 
                        throw new Error("Np observer found");
                    }
                }
                var b=document.body;
                Apoco.Observer.observe(b,{childList:true,subtree:true,attributes:true,attributeFilter:["id"]});
                Apoco.Utils.observer.add(this.dependsOn, doit,this);
            }
        }
  
        
	if(this.listen !== undefined){
	    Apoco.IO.listen(this);  
	}
  
    };

    // var methods= {
    Apoco._DisplayBase.prototype={
	getChildren: function(){
	    if(this.components){
                return this.components;
            }
            return null;
        },
        getChild:function(name){
            if(name !== undefined && this.components){
                for(var i=0; i< this.components.length;i++){
                  //  console.log("getChild i is " + i + " with name " + this.components[i].name);
                    if(this.components[i].name == name){
                        return this.components[i];
                    }
                }
            }
            return null;
        },
        deleteChild:function(name,no_splice){
            var n,index=-1;
            if(name === undefined){
                throw new Error("DisplayMenu: deleteMenu needs a name");
            }
            for(var i=0;i<this.components.length;i++){
               // console.log("++++++ before delete component " + i + " name " + this.components[i].name);
                if(this.components[i].name == name){
                    index=i;
                 //   console.log("Found component to delete " + name + " with index " + index);
                    break;
                }
            }
            if(index === -1){
                throw new Error("Display:deleteChild  Cannot find component " + name);
            }
            this.components[index].element.parentNode.removeChild(this.components[index].element);
            this.components[index].element=null;
            if(no_splice === undefined){
              //  console.log("SPLICING OUT COMPONENT");
                this.components.splice(index,1);
            }
 
            return null;
        },
        deleteChildren:function(){
            for(var i=0;i<this.components.length;i++){
                if(this.components[i].listen){
                    Apoco.IO.unsubscribe(this.components[i]);
                }
                this.components[i].element.parentNode.removeChild(this.components[i].element);
            }
            this.components.length=0;
        },
        deleteAll:function(){
            this.deleteChildren();
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
              //  console.log("Showing element that is not in DOM" + this.element);
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
        },
	delete: function(msg_from_parent){
	//    console.log("delete display object is here msg is " + msg_from_parent);
            if(this.parent && msg_from_parent === undefined){
		this.parent.deleteChild(this);
	    }
            else{
                if(this.listen){
                    Apoco.IO.unsubscribe(this);
                }
                if(this.draggable){
                    //this.draggable.delete(); // FIX THIS
                    console.log("Need method to delete draggable");
                }
                this.deleteAll();
                if(this.element){
                  //  console.log("displayBase:delete this.element exists " + this.element);
                    if(this.element.parentNode){ // no parentNode if hidden
                    //    console.log("DisplayBase.delete: deleting this.element");
                        this.element.parentNode.removeChild(this.element);  //removes events and data as well
                    }
                    this.element=null;  
                }
	        else{
                    console.log("this element should not be null " + this.id);
                }
            }
	}
    };

})();
