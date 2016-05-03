var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');


;(function($){

    'use strict';
    // these are the components allowed in display objects

    var _display_components=["fields","nodes","tabs","grids","list"];

    Harvey._DisplayBase=function(options,win){

	this.DEBUG=true;
	var defaults={
	    parent: null,
	    element: null,
	    DOM: null,
            id: null
	};
       // var observer=null;
        var that=this,t;
	this.options = $.extend({}, defaults,options);


	for(var k in this.options){
	    this[k]=this.options[k];
	    //console.log("_HarveyDisplayBase got value " + k + " value ", this[k]);
	}
        if(this.DOM === null){
            throw new Error("Must supply a DOM id for an existing node");
        }
        if(this.id === null){
            throw new Error("Must supply a unique id string");
        }
        
        if(win){
            console.log("Adding display to child window");
	    this.DOM=$(win.document).find("#" + this.DOM);
            t=$(win.document).find("#"+ this.id);
        }
        else{
            t=$("#"+ this.id);
	    this.DOM=$("#" + this.DOM);
            // console.log("hpy  %j" , this.DOM);
            //console.log("length is " + this.DOM.length);
        }
	if(this.DOM.length === 0){
	    throw new Error("_HarveyDisplayBase DOM element does not exist " + this.DOM);
	}

	if($(t)){
	    $(t).remove();
	}

        var doit=function(context){
           // console.log("DOIT IS HERE");
            if(context.action){
	 	context.action(context);
	    }
        };
        // if the execution depends on another node
        if(this.dependsOn && $("#" + this.dependsOn).length === 0){ // watch for node
            //console.log("in displayBase id is " + this.dependsOn);
            Harvey.Utils.observer.add(this.dependsOn, doit,this);
            if(!Harvey.Observer){
                throw new Error("Np observer found");
            }
            Harvey.Observer.observe((this.DOM)[0],{childList: true,attributeFilter:["id"]});
        }
        else if(this.action){
            this.action(this);
        }

	if(this.listen !== undefined){
            //console.log("listen listen listen");
	    Harvey.IO.listen(this);  // needs to be here cause listener needs element.
	}

    	//console.log("end of libbase");
    };



    // var methods= {
    Harvey._DisplayBase.prototype={
	getChildren: function(){
	    var comp=[];
            var k;
            for(var i=0; i< _display_components.length;i++){
                k=_display_components[i];
	        if(this[k]){
		    for(var j=0;j<this[k].length;j++){
                        comp.push(this[k][j]);
                    }
	        }
            }
            return comp;
	},
        getChild:function(name){
            var k;
            for(var i=0; i< _display_components.length;i++){
                var k=_display_components[i];
             //   console.log("get child of type " + k);
                if(this[k]){
           //         console.log("get child has component of type " + k);
                    for(var j=0;j<this[k].length;j++){
                        if(this[k].length===1 && k==="grids"){
                            return this[k].grids("all");
                        }
         //               console.log("trying to find child " + this[k][j].name);
                        if(this[k][j].name == name){
                            return this[k][j];
                        }
                    }
                }
            }
            return null;
        },
        deleteChild:function(name,no_splice){
            var k;
            for(var i=0; i< _display_components.length;i++){
                k=_display_components[i];
                if(this[k]){
                    for(var j=0;j<this[k].length;j++){
                        if(this[k][j].name == name){
	                    if(this[k][j].listen !== undefined){
		                Harvey.unsubscribe(this[k][j]);
		            }
                            this[k][j].element.empty();
                            this[k][j].element.remove();
                            this[k][j].element=null;  // stop memory leak
                            if(no_splice === undefined){
                                this[k].splice(j,1);
                            }
                            return true;
                        }
                    }
                }
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
	getKey: function(){  // this is used by CBM Command etc as the key to look up the obj in templates or DB
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
	getSiblings: function(){
	    if(this.parent){
		var t=this.parent.getChildren();
                var c=[];
		//console.log("getSiblings: creator has " + this.parent.Components.length + " elements");
		for(var i=0;i<t.length;i++){
		    if(t[i] !== this){
			//console.log("getSiblings: found " + t[i].getKey());
			c.push(t[i]);
		    }
		}
		return c;
	    }
	    else{
		throw new Error("Parent is not defined for " + this.name);
	    }
	},
	execute: function( data ) {
	    return null;  // if function has not been overwritten - bad return null
	},
	show: function(){
           console.log("HarveyDisplayBase: showing " + this.id);
	    if(this.publish !== undefined){
	        //console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj Publish 99999999999999999999999999999");
	        Harvey.IO.publish(this);
	    }
            if(!$.contains(this.DOM[0],this.element[0])){
              //  console.log("Showing element that is not in DOM");
	        if(this.element && this.element.length>0){
		//    console.log("show found non null element");
                    if(this.after){
                        var a=$("#" + this.after);
                        if(a.length>0){    // && $.contains(this.DOM[0],a[0])){
                            $("#" + this.after).after(this.element);
                        }
                        else{
                            this.DOM.append(this.element);
                            //throw new Error("Harvey.display.show: cannot find element " + this.after );
                        }
                    }
                    else{
                        this.DOM.append(this.element);
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
        displayType: function(){
            return this.displayType;
        },
        hide:function(){
          // console.log("trying to hide " + this.id);
            if($.contains(this.DOM[0],this.element[0])){
            //    console.log("Hiding element that is in dom");
                this.element.detach();
                return;
            }
//           console.log("Can't hide element that is NOT in dom");
        },
	check: function(name){
	    throw new Error("Base Class check is not implemented");
	},
	delete: function(msg_from_parent){
	    //console.log("delete display object is here");
            if(this.listen){
                Harvey.IO.unsubscribe(this);
            }
	    for(var k=0; k < _display_components.length; k++){
                var c=_display_components[k];
              //  console.log("test display_component " + c);
                if(this[c]){
                //    console.log("display has components " + c + " with length "+ this[c].length);
                    for(var i=0;i<this[c].length;i++){
                      //  console.log("display.delete: deleting " + this[c][i].name);
                        this.deleteChild(this[c][i].name,"no_splice");
                         if(this[c][i].listen !== undefined){
		            Harvey.IO.unsubscribe(this[c][i]);
		        }
                    }
                    this[c].length=0;
                }
            }

	    this.element.remove();  //removes events and data as well
            this.element=null;
	    if(this.parent && msg_from_parent === undefined){
		//console.log("WE have a parent");
		this.parent.deleteChild(this);
	    }
	}
    };

})(jQuery);
