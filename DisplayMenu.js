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
        var name=that.menu[index].name;
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
            this.menu=[];
	    this.element=$("<div id='" + this.id + "' class='menu ui-widget ui-widget-content ui-corner-all'></div>");
            if(this.heading){
                this.element.append("<span>" + this.heading + "</span>");
            }
	    if(this.list === undefined){
                this.list=[];
	    }
	    console.log("Menus creating new element");
	    var u=$("<ul class='harvey_menu_list ui-menu ui-widget ui-widget-content' role='menubar'></ul>");
	    this.element.append(u);
            
	    for(var i=0;i<this.list.length;i++){
                console.log("Making menu item " + i);
                this.addMenu(this.list[i],u);
            }
            this.list.length=0; // for garbage collection
	   // return true;
	},
	update:function(name){
	    var p=this.getMenu(name);
	    if(p !== null){
		p.element.trigger('click');
	    }
	    else{
		throw new Error("Harvey.menu Could not find element " + name);
	    }
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
            if(name !== undefined){
	        for(var i=0;i<this.menu.length;i++){
		    if(this.menu[i].name == name){
		        return this.menu[i];
		    }
	        }
                return null;
            }
	    return this.menu;
	},
        addMenu:function(d,parent_element){
            var index,l,that=this;
            if(parent_element === undefined){
                parent_element=this.element.find("ul.harvey_menu_list");
            }
            index=this.menu.length;
            console.log("addMenu index is " + index);
            
            if(d.seperator !== undefined){
                d.element=$("<li  class='seperator'></li>");
                d.element.append("<span class='seperator'>" + d.seperator + "</span>");
                parent_element.append(d.element);
            }
            else{
                l=d.label? d.label: d.name;
                if(this.getMenu(l) !== null){
                    throw new Error("DisplayMenu: get Menu - menu already exists " + l);
                }
	        d.element=$("<li  class='ui-menu-item' name='" + d.name + "' role='menuitem'>" + l + "</li>");
	        d.parent=this;
                parent_element.append(d.element);
                this.menu[index]=d;
                
                if(d.action !==undefined){
                    //console.log("menu has action " + this.menu[index].action);
	          //  this.menu[index].element[0].addEventListener("click",
                    //  function(that,index){
                    d.element.on("click",
                                 function(t,that){
                                     return function(e){
                                         e.stopPropagation();
                      //                   console.log("menu name is " + t.name);
                      //                   console.log("menu has action " + t.action);
                                         t.action(t);
                                         that.select(t.name);
                                     };
                                 }(d,that));//,false);
	            // }(that,index),false);
                }
	    }
        },
        deleteAll:function(){
            for(var i=0;i<this.menu.length;i++){
                if(this.menu[i].listen){
                    Harvey.unsubscribe(this.menu[i]);
                }
                this.menu[i].element.empty();
                this.menu[i].element.remove();
            }
            this.menu.length=0;
        },
        deleteMenu:function(name){
            var n,index=-1;
            if(name === undefined){
                throw new Error("DisplayMenu: deleteMenu needs a name");
            }
            for(var i=0;i<this.menu.length;i++){
                if(this.menu[i].name === name){
                    index=i;
                    break;
                }
            }
            if(index === -1){
                throw new Error("DisplayMenu: deleteMenu Cannot find menu" + name);
            }
            this.menu[index].element.remove();
            this.menu.splice(index,1);
        },
	select: function(val){
            for(var i=0;i<this.menu.length;i++){
                if (this.menu[i].name == val){
                    this.selected=this.menu[i];
                    //           var el=this.element.find("ul li:nth-child(" + (i+1) + ")");
                    this.selected.element.addClass("ui-state-active");
                    this.selected.element.siblings().removeClass("ui-state-active");
                    return;
                }
            }
	}
    };

    Harvey.Utils.extend(HarveyMakeMenu,Harvey._DisplayBase);

    // Create the namespace
    // Harvey.display.tabs
    $.extend(true, Harvey, {
	display: {
	    menu: function(opts,win){
                opts.display="menu";
                return new HarveyMakeMenu(opts,win);
            },
            menuMethods:function(){
                var ar=[];
                for(var k in HarveyMakeMenu.prototype){
                    ar.push(k);
                }
                return ar;
            }
	}
    });



})(jQuery);
