var Harvey = require('./declare.js');

// create a form dynamically from json



;(function($) {
    "use strict";

    var DEBUG=true;

    var HarveyMakeForm=function(options,win){
	this.DEBUG=true;
	var that=this;
        //	Harvey._DisplayBase.call(this,options);  //use class inheritance - base Class
        Harvey.display._fieldsetBase.call(this,options,win);
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

            var fp=$("<ul></ul>");
            var p;
            for(var i=0;i<this.components.length;i++){
                var ll=$("<li></li>");
	        if(this.components[i].node){
                    this.addNode(this.components[i],ll);
		}
	        else if(this.components[i].field || this.components[i].type){
	            p=this.addField(this.components[i],ll);
		}
                fp.append(ll);
            }
            this.components.length=0; // delete

            container.append(fp);


	    if(this.buttons){
		var button_container=$("<div class='form_button_container ui-widget-content'></div>");
		this.element.append(button_container);

		for(var i=0;i<this.buttons.length;i++){

		    var button= $("<button id='" + this.buttons[i].name + "' class='ui-widget  '> "+  this.buttons[i].text  + "</button></div>");
		    var fn=this.buttons[i].action;
                    this.buttons[i].parent=this;
		   // console.log("got callback function");
		    if(this.buttons[i].action){
		        button[0].addEventListener("click",function(e){
                            e.stopPropagation();
                            e.preventDefault();
                            //that.buttons[i].action(that);
                            fn(that);
                            //console.log("form button clicked");
                        },false);
                        //console.log("button has action");
		    }
		    button_container.append(button);
		}
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
	resetInvalid: function(){
	    for(var i=0;i< this.fields.length;i++){
		if(this.fields[i].required){
		    this.fields[i].resetInvalid();
		}
	    }
	},
/*
	getField: function(name){
	    for(var i=0;i<this.fields.length;i++){
		if(this.fields[i].name == name){
		    return this.fields[i];
		}
	    }
	    return null;
	}, */
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
                if(opts === "methods"){
                    return HarveyMakeForm.prototype._getMethods();
                }
                else{
                    opts.display="form";
                    return new HarveyMakeForm(opts,win);
                }
            }

	}
    });





})(require('jquery'));
