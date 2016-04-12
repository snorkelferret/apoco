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
    };
    
  

    HarveyMakeFieldset.prototype={
	execute: function(){
    
	    var el,p;
	    this.element=$("<div id='" + this.id + "' class='field_container ui-tabs ui-widget ui-widget-content ui-corner-all'></div>");
            
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
	},
	getFields: function(){
	    return this.fields;
	},
        getNodes:function(){
            return this.nodes;  
        },
        addNode:function(d,el){
            var n;
            // check that the node has not already been created
            // if(d.parent=== this){ // already in the list
           // console.log("adding "+ d.node + " to parent " + this.id);
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
        addField: function(d,el){
            var p;
            if(!d.field && d.type){
                d.field=Harvey.dbToHtml[d.type].html_field;
            }
            console.log("making field " + d.field);
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
        getJSON: function(){
            var js={};
	    for(var i=0; i<this.fields.length; i++){
                console.log("this field required is " + this.fields[i].required);
                if(this.fields[i].required){
                    if(this.fields[i].checkValue() !== true){
                        return null;
                    }
                }
		if(this.fields[i].editable && this.fields[i].getValue() !== null){
                   // console.log("JSON key " + this.fields[i].getKey() + " value " + this.fields[i].getValue());
		    js[ this.fields[i].getKey()]=this.fields[i].getValue();
		}
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
                if(opts==="methods"){
                    return HarveyMakeFieldset.prototype._getMethods();
                }
                else{
                    opts.display="fieldset";
                    return new HarveyMakeFieldset(opts,win);
                }
            },
            _fieldsetBase: HarveyMakeFieldset
	}
    });   



})(jQuery);

