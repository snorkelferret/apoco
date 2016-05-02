var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');

// Menu display object
//  requires HarveyDisplayBase.js
//


;(function($){

  "use strict";


// create the  display

    var HarveyMakeMenu=function(options,win){
	this.DEBUG=true;
	var that=this;
	Harvey._DisplayBase.call(this,options,win);  //use class inheritance - base Class
	console.log("called display base");
        this.execute();
    };


    var select_menu=function(that,index){
        var name=that.list[index].name;
        var p=that.getSiblings();
        if(!p){
            throw new Error("Could not find siblings of " + that.parent.name);
        }
        for(var i=0;i<p.length;i++){

            if(p[i].id == name){
                p[i].show();
            }
            else{
                p[i].hide();
            }
        }
    };

    HarveyMakeMenu.prototype={
	execute: function(){
	    console.log("execute of DisplayMenu");
            this.selected=undefined;
	    this.element=$("<div id='" + this.id + "' class='menu ui-widget ui-widget-content ui-corner-all'></div>");
            if(this.heading){
                this.element.append("<span>" + this.heading + "</span>");
            }
	    if(!this.list){
		throw new Error("No list");
	    }

	    console.log("Menus creating new element");

	    var u=$("<ul class='ui-menu ui-widget ui-widget-content' role='menubar'></ul>");
	    for(var i=0;i<this.list.length;i++){
                if(this.list[i].seperator){
                    this.list[i].element=$("<li  class='seperator'></li>");
                    this.list[i].element.append("<span class='seperator'>" + this.list[i].seperator + "</span>");
                    u.append(this.list[i].element);
                }
                else{
                    var l=this.list[i].label? this.list[i].label: this.list[i].name;
	            this.list[i].element=$("<li  class='ui-menu-item' role='menuitem'>" + l + "</li>");
	            u.append(this.list[i].element);
                    if(this.list[i].action){
	                this.list[i].element[0].addEventListener("click",
                                                                 function(that,index){
                                                                     return function(e){
                                                                         e.stopPropagation();
		                                                         that.list[index].action(that,index);
                                                                         that.select(that.list[index].name);
                                                                     };
	                                                         }(this,i),false);
                    }
	        }
            }

	    this.element.append(u);
   /*         if(this.selected){
                var t=this.getMenu(this.selected);
                t.element.trigger("click");
            } */

	    return true;

	},
	update:function(name){
	    for(var i=0;i<this.list.length;i++){
		if(this.list[i].name == name){
		    var p=this.list[i].name;
		    break;
		}
	    }
	    if(p){
		p.element.trigger('click');
	    }
	    else{
		throw new Error("Harvey.menu Could not find element " + name);
	    }

	},
	getMenus: function(){
	    return this.list;
	},
        getSelected: function(){
            if(this.selected){
                return this.selected;
            }
            return null;
        },
        reset: function(){
            this.selected=null;
            this.element.find("ul li").removeClass("ui-state-active");
        },
	getMenu: function(name){
	    for(var i=0;i<this.list.length;i++){
		if(this.list[i].name == name){
		    return this.list[i];
		}
	    }
	    return null;
	},
	select: function(val){
            for(var i=0;i<this.list.length;i++){
                if (this.list[i].name == val){
                    this.selected=this.list[i];
                    //           var el=this.element.find("ul li:nth-child(" + (i+1) + ")");
                    this.selected.element.addClass("ui-state-active");
                    this.selected.element.siblings().removeClass("ui-state-active");
                    return;
                }

            }
	}
    };

    //Harvey.Utils.extend(HarveyMakeMenu,Harvey._DisplayBase);

    // Create the namespace
    // Harvey.display.tabs
    $.extend(true, Harvey, {
	display: {
	    menu: function(opts,win){
                if(opts==="methods"){
                    return HarveyMakeMenu.prototype._getMethods();
                }
                else{
                    opts.display="menu";
                    return new HarveyMakeMenu(opts,win);
                }
            }
	}
    });



})(jQuery);
