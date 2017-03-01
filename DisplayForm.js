var Apoco=require('./declare').Apoco;
require("./DisplayFieldset");

// create a form dynamically from json



;(function() {
    "use strict";

    var DEBUG=true;

    var ApocoMakeForm=function(options,win){
	this.DEBUG=true;
	var that=this;
        Apoco.display._fieldsetBase.call(this,options,win);
        this._execute();

    };


    // overwrite methods from base class
    ApocoMakeForm.prototype={
	_execute: function(){
	    var that=this,fp,lp,header,container,fc,h;
            /*console.log("make foem is here");
            this.element=document.createElement("div");
            this.element.id=this.id;   
             if(this.class !== undefined){
                this.element.classList.add(this.class);
            }
             */
            this.element.classList.add("apoco_form","resizable"); //"ui-widget-content","ui-corner-all");
      
            if(!this.height){
                this.height=400;
            }
            if(!this.width){
                this.width=Math.floor(this.height*0.75);
            }
            this.element.innerHeight=this.height;
            this.element.innerWidth=this.width;
            header=document.createElement("div");
            header.classList.add("form_header","ui-state-default", "ui-widget-header","ui-corner-all");
	    this.element.appendChild(header);
	    if(this.draggable !== false){
                this.draggable=Apoco.Utils.draggable(this.element,undefined,header);
	    }
            container=document.createElement("div");
            container.classList.add("form_scroll");
            fc=document.createElement("div");
            fc.classList.add("form_content");
	    this.element.appendChild(fc);
            fc.appendChild(container);
            h=document.createElement("h5");
            if(this.label){
                h.textContent=this.label;
	    }
	    header.appendChild(h);
            var close=document.createElement("span");
            close.innerHTML="&#x2715;"; 
            close.classList.add("ui-icon","ui-icon-close");
            header.appendChild(close);
	    var c=function(e){
		e.stopPropagation();
		that.hide();
	    };
	    close.addEventListener("click",c,false);

            fp=document.createElement("ul");
            fp.classList.add("apoco_form_list");
            container.appendChild(fp);
            
            if(this.components){
                for(var i=0;i<this.components.length;i++){
                    lp=document.createElement("li");
                    console.log("FORM CREATES ELEMENT " + lp);
                    this.addChild(i,lp,fp);
                }                   
            }
        
	    if(this.buttons){
                var button_container=document.createElement("div");
                button_container.classList.add("form_button_container","ui-widget-content");
		this.element.appendChild(button_container);
		for(var i=0;i<this.buttons.length;i++){
                    this.buttons[i].node="button";
                    this.buttons[i]=Apoco.node(this.buttons[i]);
                    this.buttons[i].parent=this;
		    button_container.appendChild(this.buttons[i].element);
		}
	    }
            else{
                this.buttons=[];
            }
	},
   
        addButton:function(d){
            var index,r,b;
            d.node="button";
            b=Apoco.node(d);
            index=this.buttons.length;
            if(b){
                this.buttons[index]=b;
                this.buttons[index].parent=this;
            }
            else{
                throw new Error("DisplayForm: Could not make button");
            }
            if(index ===0){
	        // no buttons so create button_container
                r=document.createElement("div");
		r.classList.add("form_button_container","ui-widget-content");
                this.element.appendChild(r);
            }
            else{
                r=this.element.querySelector("div.form_button_container");
            }
            if(r.length === 0){
                throw new Error("DisplayForm: addButton cannot find button container");
            }
            r.appendChild(this.buttons[index].element);
        },
        getButton:function(name){
            if(name !== undefined){
                for(var i=0;i<this.buttons.length;i++){
                    if(this.buttons[i].name === name){
                        return this.buttons[i];
                    }
                }
                return null;
            }
            return this.buttons;
        },
        deleteAll:function(){
            this.deleteChildren();
	    for(var i=0;i<this.buttons.length;i++){
                if(this.buttons[i].element.parentNode){
                    this.buttons[i].element.parentNode.removeChild(this.buttons[i].element);
                }
            }
            //console.log("this element is " + this.element + " parebt " + this.element.parentNode);
            this.buttons.length=0;
        },
        deleteButton:function(name){
            var n,index=-1;
            if(name === undefined){
                throw new Error("DisplayForm: deleteButton - must supply a name");
            }
            for(var i=0;i<this.buttons.length;i++){
                if(this.buttons[i].name === name){
                    index=i;
                    break;
                }
            }
            if(index===-1){
                throw new Error("DisplayFieldset: deleteNode cannot find " + name);
            }
            this.buttons[index].element.parentNode.removeChild(this.buttons[index].element);
            this.buttons[index].element=null;
            this.buttons.splice(index,1);
        },
	resetInvalid: function(){
	    for(var i=0;i< this.fields.length;i++){
		if(this.fields[i].required){
		    this.fields[i]._resetValue();
		}
	    }
	},

	print: function(){
	    var w=this.element.width();
	    var h=this.element.height();
	    var opts=("height=300 ,width=300, status=no" );
	    var win=window.open("","print",opts);
	    this.win=win;
	    win.document.write('<html><head><title></title>');
	    win.document.write('<link rel="stylesheet" href="css/form.css" type="text/css" media="print" >');
	    win.document.write('</head><body>');
	    var data=this.element.html();
	    win.document.write("<div id='" + this.id + "' class='apoco_form'>"); // this.element
	    win.document.write(data);
	    win.document.write("</div>");
	    win.document.write('</body></html>');
	    win.print();
	    win.close();
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
	}
    };

   
    Apoco.Utils.extend(ApocoMakeForm,Apoco.display._fieldsetBase);
  
    Apoco.display.form=function(opts,win){
        opts.display="form";
        return new ApocoMakeForm(opts,win);
    };
    Apoco.display.formMethods=function(){
        var ar=[];
        for(var k in ApocoMakeForm.prototype ){
            ar.push(k);
        }
        return ar;
    };


})();
