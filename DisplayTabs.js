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
	    //console.log("Tabs creating new element");
	    
            tablist=document.createElement("ul");
            tablist.role="tablist";
            tablist.classList.add("ui-tabs-nav","ui-helper-reset","ui-helper-clearfix","ui-widget-header","ui-corner-all","tabs");
            // make a copy of the tabs
            for(var i=0;i<this.components.length;i++){
                tt[i]=this.components[i];
            }
          //  this.components.length=0;  // so we can put them back in clean container
            this.element.appendChild(tablist);
            for(var i=0;i<tt.length;i++){
            //    console.log("add a tab with index " + i);
                this.addTab(i,tablist);
	    }
            if(this.selected){
                this.select(this.selected);
            }
	    return true;
	},
        addTab:function(t,tablist){
            var label,index,s,that=this;
        
            if(tablist === undefined){
                tablist=this.element.querySelector("ul.ui-tabs-nav");
            }
            if(Number.isInteger(t)){
                t=this.components[t];
            }
            else{
                index=this.components.length;
                this.components[index]=t;
            }
            t.label?label=t.label: label=t.name;   
	    t.element=document.createElement("li");
            t.element.classList.add("ui-state-default","ui-corner-top");
            t.element.setAttribute("name",t.name);

            if(t.class){
                if(Apoco.type["string"].check(t.class)){
                    t.element.classList.add(t.class);
                }
                else{
                    for(var i=0;i< t.class.length;i++){
                        t.element.classList.add(t.class[i]);
                    }
                }
            }
            s=document.createElement("span");
            s.textContent=label;
            t.element.appendChild(s);
	    t.parent=this;
         //   this.components[index]=t;
          //  this.components[index].parent=this;
            if(t.action){
                t.element.addEventListener("click",function(e){
                  
                    e.stopPropagation();
                    var p=t.action(t,index);
                    if(p !== false && p !== null){
                        that.select(t.name);
                    }
                },false);
             }
 	    tablist.appendChild(t.element);
        },
 
	update:function(name){
	    for(var i=0;i<this.components.length;i++){
		if(this.components[i].name == name){
		    var p=this.components[i].name;
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
	    for(var i=0;i<this.components.length;i++){
             	if(this.components[i].name == name){
                    this.selected=this.components[i];
		    this.components[i].element.classList.add("selected","ui-state-active","ui-tabs-active");
                    this.components[i].element.classList.remove("ui-state-default");
		}
		else{
                    this.components[i].element.classList.add("ui-state-default");
		    this.components[i].element.classList.remove("selected","ui-state-active","ui-tabs-active");
		}
	    }
	},
        reset:function(){
            for(var i=0;i<this.components.length;i++){
                this.components[i].element.classList.remove("selected","ui-state-active","ui-tabs-active");
            }
            this.selected=null;
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
