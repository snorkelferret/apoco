var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');
require("./DisplayFieldset");

// create a form dynamically from json



;(function($) {
    "use strict";

    var DEBUG=true;

    var HarveyMakeForm=function(options,win){
	this.DEBUG=true;
	var that=this;
        //	Harvey._DisplayBase.call(this,options);  //use class inheritance - base Class
        Harvey.display._fieldsetBase.call(this,options,win);
        this.execute();
    };


    // overwrite methods from base class
    HarveyMakeForm.prototype={
	execute: function(){
	    var that=this;
            
	    this.element=$("<div id='" + this.id + "' class='harvey_form ui-widget ui-widget-content ui-corner-all '></div>");

            if(!this.height){
                this.height=400;
            }
            if(!this.width){
                this.width=Math.floor(this.height*0.75);
            }
            this.element.height(this.height);
            this.element.width(this.width);

	    var header=$("<div class='form_header ui-widget ui-state-default ui-widget-header ui-corner-all'></div>");

	    this.element.append(header);

	    if(this.draggable !== false){
		this.element.draggable({handle: ".form_header", containment: "window"});
	    }

	    var container=$("<div class='form_scroll'></div>");
	    var fc=$("<div class='form_content'></div>");

	    this.element.append(fc);
            fc.append(container);

	    if(this.label){
	    	$("<h5> " + this.label + "</h5>").appendTo(header);
	    }
	    else{
		$("<h5> " + this.id + "</h5>").appendTo(header);
	    }
	    var close=$("<span  class=' ui-icon ui-icon-close'> </span>");

	    close.appendTo(header);

	    var c=(function(cmd){
		return function(e){
		    e.stopPropagation();
		    if(!cmd){
			throw new Error("command for " +  this.getKey + " does not exist");
		    }
		    cmd.delete();
		};
	    }(this));
	    close[0].addEventListener("click",c,false);

            var fp=$("<ul class='harvey_form_list'></ul>");
            var p;
            if(this.components){
                for(var i=0;i<this.components.length;i++){
   
	            if(this.components[i].node){
                        this.addNode(this.components[i]);
		    }
	            else if(this.components[i].field || this.components[i].type){
	                p=this.addField(this.components[i]);
		    }
                  //  fp.append(ll);
                }
                this.components.length=0; // delete
            }
            container.append(fp);

	    if(this.buttons){
		var button_container=$("<div class='form_button_container ui-widget-content'></div>");
		this.element.append(button_container);
		for(var i=0;i<this.buttons.length;i++){
                    this.buttons[i].node="button";
                    this.buttons[i]=Harvey.node(this.buttons[i]);
                    this.buttons[i].parent=this;
		    button_container.append(this.buttons[i].element);
		}
	    }
            else{
                this.buttons=[];
            }
	    this.element.resizable( {
		resize: function(e,ui){
		    $(".form_content").height(that.element.height()*0.95);
                },
		create: function(e,ui){
		    $(".harvey_form").height(400);
		    $(".form_content").height(that.element.height()*0.95);
                }
	    });
	},
        addNode:function(d,el){
            var n,parent_element;
            var ll=$("<li></li>");
            if(d.name && this.getNode(d.name)!==null){
                    throw new Error("Cannot add node with non-unique name");
            }
            if(d.element && d.element.length>0){
                if(!d.node){
                    throw new Error("Harvey.displayFieldset: addNode - object is not a node");
                }
                n=d;
            }
            else{
                n=Harvey.node(d,ll);
            }
            if(n){
                this.element.find("ul.harvey_form_list").append(n.element);
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
            var p,parent_element;
            var ll=$("<li></li>");
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
                    p=Harvey.field[d.field](d,ll);
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
	    this.element.find("ul.harvey_form_list").append(p.element);
            
            return p;
        },
        addButton:function(d){
            var index,r,b;
            d.node="button";
            b=Harvey.node(d);
            index=this.buttons.length;
            if(b){
                this.buttons[index]=b;
                this.buttons[index].parent=this;
            }
            if(index ===0){
	        // no buttons so create button_container
                r=$("<div class='form_button_container ui-widget-content'></div>");
		this.element.append(r);
            }
            else{
                r=this.element.find("div.form_button_container");
            }
            if(r.length === 0){
                throw new Error("DisplayForm: addButton cannot find button container");
            }
            r.append(this.buttons[index].element);
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
            this.buttons[index].element.remove();
            this.buttons.splice(index,1);
        },
	resetInvalid: function(){
	    for(var i=0;i< this.fields.length;i++){
		if(this.fields[i].required){
		    this.fields[i].resetInvalid();
		}
	    }
	},
	after_submit: function(callback,use_default_dialog){
	    var that=this;
	    if(use_default_dialog === undefined){
		var use_default_dialog=true;
	    }
	    var old_submit=this.submit;
	    that.submit=function(){
		that.element.css("display","none");
		var promise=old_submit.call(that);
		Harvey.display.dialog("Submitting","Waiting confirmation from server",true);  //need to override the dialog options

		promise.done(function(props){
		    callback(props);
		    that.destroy();
		    if(use_default_dialog){
			Harvey.display.dialog("Success", "Database updated");
			setTimeout(function(){
			    Harvey.display.dialog.close();
			},1000);
		    }
		});
		promise.fail(function(error){
		    that.destroy();
		    Harvey.display.dialog("Fail", "you have errors" + JSON.stringify(error));
		    setTimeout(function(){
			Harvey.display.dialog.close();
		    },5000);
		    that.element.css("display","");
		});
	    };
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
	    win.document.write("<div id='" + this.id + "' class='harvey_form'>"); // this.element
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
	},
	submit: function(){
	}
    };

    //Harvey.Utils.extend(HarveyMakeForm,Harvey._DisplayBase);
    Harvey.Utils.extend(HarveyMakeForm,Harvey.display._fieldsetBase);
    $.extend(true, Harvey, {
	display: {
	    form: function(opts,win){
                opts.display="form";
                return new HarveyMakeForm(opts,win);
            },
            formMethods:function(){
                var ar=[];
                for(var k in HarveyMakeForm.prototype ){
                    ar.push(k);
                }
                return ar;
            }

	}
    });





})(jQuery);
