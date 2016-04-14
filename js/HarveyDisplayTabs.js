var Harvey = require('./declare.js').Harvey, UI = require('./declare.js').UI;

// Menu display object
//  requires HarveyDisplayBase.js
//


;(function($){

  "use strict";


// create the tabs display

    var HarveyMakeTabs=function(options,win){
	this.DEBUG=true;
	var that=this;
	Harvey._DisplayBase.call(this,options,win);  //use class inheritance - base Class
	//console.log("called display base");
    };


    var default_select_tabs_action=function (that,index){
        var name=that.tabs[index].name;
        if(name !== that.selected){
            Harvey.Window.hide(that.selected);
            Harvey.Window.show(name);
        }
    };

    HarveyMakeTabs.prototype={
	execute: function(){
	  // console.log("execute of DisplayTabs");

	    this.element=$("<div id='" + this.id + "' class='tab_container ui-tabs ui-widget ui-widget-content ui-corner-all'></div>");

	    if(!this.tabs){
		throw new Error("No tabs or action groupBy options");
	    }


	    //console.log("Tabs creating new element");
	    var tablist=$("<ul role='tablist' class='ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all tabs' > </ul>");

	    var label;
	    for(var i=0;i<this.tabs.length;i++){

		this.tabs[i].label?label=this.tabs[i].label: label=this.tabs[i].name;
		//if(this.DEBUG)console.log("tabs.execute creating tab  " );
		this.tabs[i].element=$("<li class='ui-state-default ui-corner-top'><span>" +  label + "</span> </li>");
		this.tabs[i].parent=this;
                if(this.tabs[i].action){
		    this.tabs[i].element[0].addEventListener("click",
							 function(that,index){
							     return function(e){
								 e.preventDefault();
								 e.stopPropagation();

								 that.tabs[index].action(that,index);
								 that.select(that.tabs[index].name);
                                                                 that.selected=that.tabs[index].name;
							     };
							 }(this,i),false);
                }
                $(this.tabs[i].element).hover(
                    function() {
                        $( this ).addClass( "ui-state-hover" );
                    }, function() {
                        $( this ).removeClass( "ui-state-hover" );
                    }
                );
		tablist.append(this.tabs[i].element);

	    }
            this.select(this.selected);

	    this.element.append(tablist);
	    return true;

	},
	update:function(name){
	    for(var i=0;i<this.tabs.length;i++){
		if(this.tabs[i].name == name){
		    var p=this.tabs[i].name;
		    break;
		}
	    }
	    if(p){
		p.element.trigger('click');
	    }
	    else{
		throw new Error("Harvey.tabs Could not find element " + name);
	    }

	},
	getTabs: function(){
	    return this.tabs;
	},
	getTab: function(name){
	    for(var i=0;i<this.tabs.length;i++){
		if(this.tabs[i].name == name){
		    return this.tabs[i];
		}
	    }
	    return null;
	},
	select: function(name){
	    for(var i=0;i<this.tabs.length;i++){
		if(this.tabs[i].name == name){
		    this.tabs[i].element.addClass("ui-state-active ui-tabs-active");
		}
		else{
		    this.tabs[i].element.removeClass("ui-state-active ui-tabs-active");
		}
	    }
	}
    };

    Harvey.Utils.extend(HarveyMakeTabs,Harvey._DisplayBase);

    // Create the namespace
    // Harvey.display.tabs
    $.extend(true, Harvey, {
	display: {
	    tabs: function(opts,win){
                if(opts === "methods"){
                    return HarveyMakeTabs.prototype._getMethods();
                }
                else{
                    opts.display="tabs";
                   // console.log("tabs: window is " + win);
                    return new HarveyMakeTabs(opts,win);
                }
            }
	}
    });



})(require('jquery'));
