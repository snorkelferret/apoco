var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');

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
        this.execute();
    };


    var default_select_tabs_action=function (that){
        var name=that.selected.name;
        Harvey.Panel.hideAll();
        Harvey.Panel.show(name);
        
    };

    HarveyMakeTabs.prototype={
	execute: function(){
            var tt=[],tablist;
	    // console.log("execute of DisplayTabs");
	    this.element=$("<div id='" + this.id + "' class='tab_container ui-tabs ui-widget ui-widget-content ui-corner-all'></div>");
	    if(!this.tabs){
	        this.tabs=[];
	    }
	    //console.log("Tabs creating new element");
	    tablist=$("<ul role='tablist' class='ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all tabs' > </ul>");
            // make a copy of the tabs
            for(var i=0;i<this.tabs.length;i++){
                tt[i]=this.tabs[i];
            }
            this.tabs.length=0;  // so we can put them back in clean container
            this.element.append(tablist);
            for(var i=0;i<tt.length;i++){
                console.log("add a tab with index " + i);
                this.addTab(tt[i],tablist);
	    }
            if(this.selected){
                this.select(this.selected);
            }
	    return true;
	},
        addTab:function(t,tablist){
            var label,index;
            t.label?label=t.label: label=t.name;
            if(tablist === undefined){
                tablist=this.element.find("ul.ui-tabs-nav");
            }
            index=this.tabs.length;
	    //if(this.DEBUG)console.log("tabs.execute creating tab  " );
	    t.element=$("<li class='ui-state-default ui-corner-top'><span>" +  label + "</span> </li>");
	    t.parent=this;
            if(t.action){
		t.element[0].addEventListener("click",
					      function(tab,that){
						  return function(e){
						      e.preventDefault();
						      e.stopPropagation();
						      tab.action(t);
                                                      that.select(tab.name);
						  };
					      }(t,this),false);
            }
            $(t.element).hover(
                function() {
                    $( this ).addClass( "ui-state-hover" );
                }, function() {
                    $( this ).removeClass( "ui-state-hover" );
                }
            );
            this.tabs[index]=t;
	    tablist.append(t.element);
        },
        getTab:function(name){
            if(name !== undefined){
                for(var i=0;i<this.tabs.length;i++){
                    if(this.tabs[i].name === name){
                        return this.tabs[i];
                    }
                }
                return null;
            }
            return this.tabs;
        },
        deleteAll:function(){
            for(var i=0;i<this.tabs.length;i++){
                if(this.tabs[i].listen){
                    Harvey.unsubscribe(this.tabs[i]);
                }
                this.tabs[i].element.empty();
                this.tabs[i].element.remove();
            }
            this.tabs.length=0;
        },
        deleteTab:function(name){
            var index=-1;
            if(name === undefined){
                throw new Error("DisplayTabs: deleteTab - needs a name");
            }
            for(var i=0;i<this.tabs.length;i++){
                if(this.tabs[i].name === name){
                    index=i;
                    break;
                }
            }
            if(index === -1){
                throw new Error("DisplayTabs: deleteTab - cannot find name " + name);
            }
            if(this.tabs[i].listen){
                    Harvey.unsubscribe(this.tabs[i]);
            }
            this.tabs[index].element.remove();
            this.tabs.splice(index,1);
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
        getSelected:function(){
            if(this.selected){
                return this.selected;
            }
            return null;
        },
	select: function(name){
	    for(var i=0;i<this.tabs.length;i++){
		if(this.tabs[i].name == name){
                    this.selected=this.tabs[i];
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
                opts.display="tabs";
                // console.log("tabs: window is " + win);
                return new HarveyMakeTabs(opts,win);
            },
            tabsMethods:function(){
                var ar=[];
                for(var k in HarveyMakeTabs.prototype){
                    ar.push(k);
                }
                return ar;
            }
	}
    });



})(jQuery);
