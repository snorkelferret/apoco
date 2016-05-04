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
        this.execute();
    };



    HarveyMakeFieldset.prototype={
	execute: function(){
	    var el,p;
	    this.element=$("<div id='" + this.id + "' class='field_container ui-tabs ui-widget ui-widget-content ui-corner-all'></div>");
            if(this.components !== undefined){
                for(var i=0;i<this.components.length;i++){
                    el=$("<div class='fieldset'></div>");
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
        addNode:function(d,el){
            var n;
            // check that the node has not already been created
            // if(d.parent=== this){ // already in the list
            // console.log("adding "+ d.node + " to parent " + this.id);
            if(d.name && this.getNode(d.name)!==null){
                    throw new Error("Cannot add node with non-unique name");
            }
            if(d.element && d.element.length>0){
                if(!d.node){
                    throw new Error("Harvey.displayFieldset: addNode - object is not a node");
                }
                n=d;
                this.element.append(n.element);
            }
            else{
              //  console.log("Fieldest calling Harvey.node " + d.node);
                n=Harvey.node(d,el);
                this.element.append(el);
            }
            if(n){
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
            this.nodes[index].element.remove();
            this.nodes.splice(index,1);
        },
        addField: function(d,el){
            var p;
            if(!d.field && d.type){
                d.field=Harvey.dbToHtml[d.type].field;
            }
            console.log("making field " + d.field);
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
            if(!p.setValue){
                console.log("method setValue does not exist for " + p.name);
            }
	    this.element.append(p.element);
            return p;
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
            if(index===-1){
                throw new Error("DisplayFieldset: deleteNode cannot find " + name);
            }
            this.fields[index].element.remove();
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
