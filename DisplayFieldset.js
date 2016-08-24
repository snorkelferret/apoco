var Apoco=require('./declare').Apoco;
require("./DisplayBase.js");
require("./Nodes.js");


// requires ApocoDisplayBase.js

;(function(){

    "use strict";

    var ApocoMakeFieldset=function(options,win){
	//console.log("display.fieldset is here");
	this.DEBUG=true;
	var that=this;
        this.nodes=[];
        this.fields=[];
	Apoco._DisplayBase.call(this,options,win);  //use class inheritance - base Class
        if(this.display=="fieldset"){
            this._execute();
        }
    };

    ApocoMakeFieldset.prototype={
	_execute: function(){
	    var el,p;
	    this.element=document.createElement("div");
            this.element.id=this.id;
            this.element.classList.add("field_container","ui-widget-content","ui-corner-all");
            
            if(this.components !== undefined){
                for(var i=0;i<this.components.length;i++){
                    el=document.createElement("div");
                    el.classList.add("fieldset");
                    if(this.components[i].class){
                        el.classList.add(this.components[i].class);
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
            else{
                console.log("components for " + this.id + " is undefined");
            }
	},
        _afterShow:function(){
            // put the focus on the first field
            if(this.fields && this.fields.length>0){
                var e=this.fields[0].getElement();
                var d=e.getElementsByTagName("input")[0];
                if(d){
                    d.focus();
                }
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
                if(k !==null && !Apoco.checkType["array"](k)){
                    return k;
                }
                k=this.getNode(name);
                if(k !==null && !Apoco.checkType["array"](k)){
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
                    throw new Error("Apoco.displayFieldset: addNode - object is not a node");
                }
                n=d;
            }
            else{
                n=Apoco.node(d,el);
            }
            if(n){
                this.element.appendChild(n.element);
                n.parent=this;
	        this.nodes.push(n);
                return n;
            }
            else{
                throw new Error("Apoco,fieldset, doesn't know how to make " + d.node);
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
                    d.field=Apoco.dbToHtml[d.type].field;
                }
                else{
                    throw new Error("Must supply either a field or a type");
                }
            }
           // console.log("making field " + d.field);
            if(this.getField(d.name)!== null){
                throw new Error("Cannot add field with non-unique name " + d.name);
            }
            if(Apoco.field.exists(d.field)){
                // check that the field has not already been created
                if(d.element){
		    p=d;
                }
                else{
                    p=Apoco.field[d.field](d,el);
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
            //console.log("adding field " + d.name);
	    this.element.appendChild(p.element);
            
            return p;
        },
        deleteAll:function(){
            for(var i=0;i<this.fields.length;i++){
               /* if(this.fields[i].listen){
                    Apoco.unsubscribe(this.fields[i]);
                }
                //this.fields[i].element.empty();
                this.fields[i].element.parentNode.removeChild(this.fields[i].element); */
                this.fields[i].delete();
            }
            this.fields.length=0;
            for(var i=0;i<this.nodes.length;i++){
                if(this.nodes[i].listen){
                    Apoco.unsubscribe(this.nodes[i]);
                }
                if(this.nodes[i].element.parentNode){
                    //this.nodes[i].element.empty();
                    //this.nodes[i].element.remove();
                    this.nodes[i].element.parentNode.removeChild(this.nodes[i].element);
                }
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
                    Apoco.unsubscribe(this.fields[i]);
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
             //   console.log("this field required is " + this.fields[i].required);
                if(this.fields[i].required){
                    if(this.fields[i].checkValue() !== true){
                        return null;
                    }
                }
		js[ this.fields[i].getKey()]=this.fields[i].getValue();
	    }
            return js;
        },
	check: function(){
            var valid=true;

	    for(var i=0;i<this.fields.length;i++){
		//console.log("check components " + i);
		if(!this.fields[i].checkValue()){
		    //console.log("Value for " +  this.fields[i].getValue() + " is wrong");
		    valid=false;
		}
	    }
	    return valid;
        },
	submit: function(url){
            var j=this.getJSON();
            Apoco.IO.REST("POST",j,url);
	}
    };

    Apoco.Utils.extend(ApocoMakeFieldset,Apoco._DisplayBase);

    Apoco.display.fieldset=function(opts,win){
        opts.display="fieldset";
        return new ApocoMakeFieldset(opts,win);
    };
    Apoco.display.fieldsetMethods=function(){
        //   console.log("Apoco.display.fieldsetMethods: getting methods for fieldset");
        var ar=[];
        for(var k in ApocoMakeFieldset.prototype){
            ar.push(k);
        }
        return ar;
    };
    Apoco.display._fieldsetBase=ApocoMakeFieldset;


})();
