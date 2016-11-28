var Apoco=require('./declare').Apoco; 

require("./DisplayBase.js");
// Menu display object


;(function(){

  "use strict";
// create the tabs display

    var ApocoMakeTabs=function(options,win){
	this.DEBUG=true;
	var that=this;
    
	Apoco._DisplayBase.call(this,options,win);  //use class inheritance - base Class
      //  console.log("tabs this listen is " + this.listen);
	//console.log("called display base");
        this._execute();
    };


    var default_select_tabs_action=function (that){
        var name=that.selected.name;
        Apoco.Panel.hideAll();
        Apoco.Panel.show(name);
        
    };

    ApocoMakeTabs.prototype={
	_execute: function(){
            var tt=[],tablist;
	    // console.log("execute of DisplayTabs");
	   
            this.element=document.createElement("div");
            this.element.id=this.id;
            this.element.classList.add("tab_container","ui-tabs","ui-widget-content","ui-corner-all");
	    if(!this.tabs){
	        this.tabs=[];
	    }
	    //console.log("Tabs creating new element");
	    
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
            var label,index,s,that=this;
            t.label?label=t.label: label=t.name;
            if(tablist === undefined){
                tablist=this.element.querySelector("ul.ui-tabs-nav");
            }
            index=this.tabs.length;
	    t.element=document.createElement("li");
            t.element.classList.add("ui-state-default","ui-corner-top");
            s=document.createElement("span");
            s.textContent=label;
            t.element.appendChild(s);
	    t.parent=this;
            this.tabs[index]=t;
            this.tabs[index].parent=this;
            if(t.action){
                t.element.addEventListener("click",function(e){
                    that.select(t.name);
                    t.action(t,index);
                   
                },false);
             }
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
                    Apoco.unsubscribe(this.tabs[i]);
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
                    Apoco.unsubscribe(this.tabs[i]);
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
		throw new Error("Apoco.tabs Could not find element " + name);
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
		    this.tabs[i].element.classList.add("selected","ui-state-active","ui-tabs-active");
                    this.tabs[i].element.classList.remove("ui-state-default");
		}
		else{
                    this.tabs[i].element.classList.add("ui-state-default");
		    this.tabs[i].element.classList.remove("selected","ui-state-active","ui-tabs-active");
		}
	    }
	}
    };

    Apoco.Utils.extend(ApocoMakeTabs,Apoco._DisplayBase);

    Apoco.display.tabs=function(opts,win){
        opts.display="tabs";
        // console.log("tabs: window is " + win);
        return new ApocoMakeTabs(opts,win);
    };
    Apoco.display.tabsMethods=function(){
        var ar=[];
        for(var k in ApocoMakeTabs.prototype){
            ar.push(k);
        }
        return ar;
    };


})();
