var Harvey=require('./declare').Harvey; //,UI=require('./declare').UI; //jQuery=require('jquery');

require("./DisplayBase.js");
// Menu display object
//  requires HarveyDisplayBase.js
//


;(function(){

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
	    //   this.element=$("<div id='" + this.id + "' class='tab_container ui-tabs ui-widget ui-widget-content ui-corner-all'></div>");
            this.element=document.createElement("div");
            this.element.id=this.id;
            this.element.classList.add("tab_container","ui-tabs","ui-widget","ui-widget-content","ui-corner-all");
	    if(!this.tabs){
	        this.tabs=[];
	    }
	    //console.log("Tabs creating new element");
	    //tablist=$("<ul role='tablist' class='ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all tabs' > </ul>");
            tablist=document.createElement("ul");
            tablist.role="tablist";
            tablist.classList.add("ui-tabs-nav","ui-helper-reset","ui-helper-clearfix","ui-widget-header","ui-corner-all","tabs");
            // make a copy of the tabs
            for(var i=0;i<this.tabs.length;i++){
                tt[i]=this.tabs[i];
            }
            this.tabs.length=0;  // so we can put them back in clean container
            this.element.appendChild(tablist);
            for(var i=0;i<tt.length;i++){
            //    console.log("add a tab with index " + i);
                this.addTab(tt[i],tablist);
	    }
            if(this.selected){
                this.select(this.selected);
            }
	    return true;
	},
        addTab:function(t,tablist){
            var label,index,s;
            t.label?label=t.label: label=t.name;
            if(tablist === undefined){
                tablist=this.element.querySelector("ul.ui-tabs-nav");
            }
            index=this.tabs.length;
	    //if(this.DEBUG)console.log("tabs.execute creating tab  " );
            t.element=document.createElement("li");
            t.element.classList.add("ui-state-default","ui-corner-top");
            s=document.createElement("span");
            s.textContent=label;
            t.element.appendChild(s);
	    t.parent=this;
            this.tabs[index]=t;
            if(t.action){
		t.element.addEventListener("click",
					   function(tab,that,i){
					       return function(e){
						   e.preventDefault();
						   e.stopPropagation();
						   tab.action(t,i);
                                                   that.select(tab.name);
					       };
					   }(t,this,index),false);
            }
            t.element.addEventListener("mouseover",function(e){
               // if(e.currentTarget.tagName === "LI"){
                    e.stopPropagation();
                    e.preventDefault();
                    e.currentTarget.classList.add("ui-state-hover");
                //}
            },false);
            t.element.addEventListener("mouseout",function(e){
               // if(e.target.tagName === "LI"){
                    e.stopPropagation();
                    e.preventDefault();
                    e.currentTarget.classList.remove("ui-state-hover");
                //}
            },false);
        
	    tablist.appendChild(t.element);
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
                this.tabs[i].element.parentNode.removeChild(this.tabs[i].element);
                this.tabs[i].element=null;
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
            this.tabs[index].element.parentNode.removeChild(this.tabs[index].element);
            this.tabs[index].element=null;
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
		p.element.click();
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
		    this.tabs[i].element.classList.add("ui-state-active","ui-tabs-active");
		}
		else{
		    this.tabs[i].element.classList.remove("ui-state-active","ui-tabs-active");
		}
	    }
	}
    };

    Harvey.Utils.extend(HarveyMakeTabs,Harvey._DisplayBase);

    // Create the namespace
    // Harvey.display.tabs
    // $.extend(true, Harvey, {
    Harvey.mixinDeep(Harvey,{
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



})();
