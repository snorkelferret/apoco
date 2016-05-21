var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');
require("./DisplayBase.js");
require("./Fields.js");
require("./Nodes.js");


// requires HarveyDisplayBase.js

;(function($){

    "use strict";

    var HarveyMakeFieldset=function(options,win){
	//console.log("display.fieldset is here");
	this.DEBUG=true;
	var that=this;
        this.nodes=[];
        this.fields=[];
	Harvey._DisplayBase.call(this,options,win);  //use class inheritance - base Class
        if(this.display=="fieldset"){
            this.execute();
        }
    };

    HarveyMakeFieldset.prototype={
	execute: function(){
	    var el,p;
	    //this.element=$("<div id='" + this.id + "' class='field_container ui-tabs ui-widget ui-widget-content ui-corner-all'></div>");
            this.element=document.createElement("div");
            this.element.id=this.id;
            this.element.classList.add("field_container","ui-widget","ui-widget-content","ui-corner-all");
            
            if(this.components !== undefined){
                for(var i=0;i<this.components.length;i++){
                    el=document.createElement("div");//$("<div class='fieldset'></div>");
                    el.classList.add("fieldset");
                    if(this.components[i].class){
                        el.addClass(this.components[i].class);
                    }
 	            if(this.components[i].node){
                        this.addNode(this.components[i],el);
		    }
	            else if(this.components[i].field || this.components[i].type){
	                p=this.addField(this.components[i],el);
		    }
                }
                this.components.length=0; // delete
            }
	},
	getChildren: function(){
	    var comp;
            var comp=this.getField();
            var c=this.getNode();
            comp.concat(c);
            return comp;
        },
        getChild:function(name){
            var k;
            if(name !== undefined){
                k=this.getField(name);
                if(k !==null && !Harvey.checkType["array"](k)){
                    return k;
                }
                k=this.getNode(name);
                if(k !==null && !Harvey.checkType["array"](k)){
                    return k;
                }
            }
            return null;
        },
	getField: function(name){
            if(name !== undefined){
                for(var i=0;i<this.fields.length;i++){
                    if(this.fields[i].name === name){
                        return this.fields[i];
                    }
                }
                return null;
            }
	    return this.fields;
	},
        getNode:function(name){  //nodes don't have to have a name
            if(name !== undefined){
                for(var i=0;i<this.nodes.length;i++){
                    if(this.nodes[i].name !== undefined && this.nodes[i].name === name){
                        return this.nodes[i];
                    }
                }
                return null;
            }
            return this.nodes;
        },
        deleteChild:function(name){
            if(name !== undefined){
                //is it a node or a field?
                if(this.getNode(name)!== null){
                    this.deleteNode(name);
                }
                else if(this.getField(name)!== null){
                    this.deleteField(name);
                }
                else {
                    throw new Error("DisplayFieldset: deleteChild cannot find " + name);
                }
            }
            else{
                throw new Error("deleteChild- needs a name");
            }              

        },
        addNode:function(d,el){
            var n,parent_element;
            if(d.name && this.getNode(d.name)!==null){
                throw new Error("Cannot add node with non-unique name");
            }
            if(d.element){
                if(!d.node){
                    throw new Error("Harvey.displayFieldset: addNode - object is not a node");
                }
                n=d;
            }
            else{
                n=Harvey.node(d,el);
            }
            if(n){
                this.element.appendChild(n.element);
                n.parent=this;
	        this.nodes.push(n);
                return n;
            }
            else{
                throw new Error("Harvey,fieldset, doesn't know how to make " + d.node);
            }
            return null;
        },
        deleteNode: function(name){
            var n,index=-1;
            if(name === undefined){
                throw new Error("DisplayFieldset: deleteNode - must supply a name");
            }
            for(var i=0;i<this.nodes.length;i++){
                if(this.nodes[i].name === name){
                    index=i;
                    break;
                }
            }
            if(index===-1){
                throw new Error("DisplayFieldset: deleteNode cannot find " + name);
            }
            this.nodes[index].element.parentNode.removeChild(this.nodes[index].element);
            this.nodes[index].element=null;
            this.nodes.splice(index,1);
        },
        addField: function(d,el){
            var p,parent_element;
            if(!d.field){
                if(d.type){
                    d.field=Harvey.dbToHtml[d.type].field;
                }
                else{
                    throw new Error("Must supply either a field or a type");
                }
            }
           // console.log("making field " + d.field);
            if(this.getField(d.name)!== null){
                throw new Error("Cannot add field with non-unique name " + d.name);
            }
            if(Harvey.field.exists(d.field)){
                // check that the field has not already been created
                if(d.element && d.element.length>0){
		    p=d;
                }
                else{
                    p=Harvey.field[d.field](d,el);
                }
		if(!p){
		    throw new Error("Cannot make field " + d.field);
		}
            }
            else{
                throw new Error("no field of type " + d.field + " exists");
            }
            p.parent=this;
	    this.fields.push(p);
	    this.element.appendChild(p.element);
            
            return p;
        },
        deleteAll:function(){
            for(var i=0;i<this.fields.length;i++){
                if(this.fields[i].listen){
                    Harvey.unsubscribe(this.fields[i]);
                }
                //this.fields[i].element.empty();
                this.fields[i].element.parentNode.removeChild(this.fields[i].element);
            }
            this.fields.length=0;
            for(var i=0;i<this.nodes.length;i++){
                if(this.nodes[i].listen){
                    Harvey.unsubscribe(this.nodes[i]);
                }
                //this.nodes[i].element.empty();
                //this.nodes[i].element.remove();
                this.nodes[i].element.parentNode.removeChild(this.nodes[i].element);
            }
            this.nodes.length=0;
        },
        deleteField:function(name){
            var n,index=-1;
            if(name === undefined){
                throw new Error("DisplayFieldset: deleteNode - must supply a name");
            }
            for(var i=0;i<this.fields.length;i++){
                if(this.fields[i].name === name){
                    index=i;
                    break;
                }
            }
            if(this.fields[index].listen){
                    Harvey.unsubscribe(this.fields[i]);
            }
            if(index===-1){
                throw new Error("DisplayFieldset: deleteNode cannot find " + name);
            }
            //this.fields[index].element.remove();
            this.fields[index].element.parentNode.removeChild(this.fields[index].element);
            this.fields[index].element=null;
            this.fields.splice(index,1);
        },
        getJSON: function(){
            var js={};
	    for(var i=0; i<this.fields.length; i++){
                console.log("this field required is " + this.fields[i].required);
                if(this.fields[i].required){
                    if(this.fields[i].checkValue() !== true){
                        return null;
                    }
                }
		js[ this.fields[i].getKey()]=this.fields[i].getValue();
	    }
            return js;
        },
	submit: function(url){
            var j=this.getJSON();
            Harvey.IO.REST("POST",j,url);
	}
    };



    Harvey.Utils.extend(HarveyMakeFieldset,Harvey._DisplayBase);

    $.extend(true, Harvey, {
	display: {
	    fieldset: function(opts,win){
                opts.display="fieldset";
                return new HarveyMakeFieldset(opts,win);
            },
            fieldsetMethods:function(){
                var ar=[];
                for(var k in HarveyMakeFieldset.prototype){
                    ar.push(k);
                }
                return ar;
            },
            _fieldsetBase: HarveyMakeFieldset
	}
    });



})(jQuery);
