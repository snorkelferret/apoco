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
	    var el,p,that=this;
            //            console.log("length of components is " + this.components.length);
            for(var i=0;i<this.components.length;i++){
              //  console.log("++++ adding child +++++ " + i);
                el=document.createElement("div");
               // el.classList.add("fieldset_child");
  	        this.addChild(i,el);
            }
           // console.log("length of components is NOW " + this.components.length);
	},
        _afterShow:function(){
            // put the focus on the first field
            if(this.components && this.components.length>0){
                for(var i=0;i<this.components.length;i++){
                    if(this.components[i].field){
                        var e=this.components[i].getElement();
                        var d=e.getElementsByTagName("input")[0];
                        if(d){
                            d.focus();
                        }
                        break;
                    }
                }
            }
        },
        addChild:function(index,el,parent_element){
            var n,d,p;
            if(Number.isInteger(index)){
                d=this.components[index]; 
            }
            else{
                d=index;
                index=this.components.length;
              //  console.log("adding to components " + index);
            }
            if(d.name && this.getChild(d.name) !== null && this.getChild(d.name).parent !== undefined){
                throw new Error("Cannot add component with non-unique name " + d.name);
            }
            if(el === undefined && this.display == "form"){
                el=document.createElement("li");
            }
            if(!parent_element){
                parent_element=this.element;
            }
            
            if(d.node){
                 n=Apoco.node(d,el);
            }
            else if(d.field || d.type){
                if(!d.field){
                    d.field=Apoco.type[d.type].field;
                }
                if(Apoco.field.exists(d.field)){
                    n=Apoco.field[d.field](d,el);
                }
                else{
                    throw new Error("no field of type " + d.field + " exists");
                }
            }
            else{
                throw new Error("Apoco.displayFieldset: meed to specify node type or field");
            }
            if(n){
                n.parent=this;
              
                p=n.element.parentNode; //this is for node entries which use the el parm as a parent not the root this.element like fields
                if(p){
                    parent_element.appendChild(p);
                }
                else{
                    parent_element.appendChild(n.element);
                }
	        this.components[index]=n;
                return n;
            }
            else{
                throw new Error("Apoco,fieldset, doesn't know how to make " + d.node);
            }
            return null;
        },
        getJSON: function(){
            var js={};
	    for(var i=0; i<this.components.length; i++){
             //   console.log("this field required is " + this.components[i].required);
                if(this.components[i].field){
                    if(this.components[i].required){
                       // console.log("return from checkValue is " + this.components[i].checkValue() );
                        if(this.components[i].checkValue() !== true){
                            return null;
                        }
                    }
		    js[ this.components[i].getKey()]=this.components[i].getValue();
                }
	    }
            return js;
        },
	check: function(){
            var valid=true;

	    for(var i=0;i<this.components.length;i++){
		//console.log("check components " + i);
                if(this.components[i].field){
		    if(!this.components[i].checkValue()){
		        //console.log("Value for " +  this.fields[i].getValue() + " is wrong");
		        valid=false;
		    }
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
