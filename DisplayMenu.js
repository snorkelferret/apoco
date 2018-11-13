var Apoco=require('./declare').Apoco;

require("./DisplayBase");

;(function(){

    "use strict";
// create the  display

    var ApocoMakeMenu=function(options,win){
	this.DEBUG=true;
	var that=this;
	Apoco._DisplayBase.call(this,options,win);  //use class inheritance - base Class
//	console.log("called display base");
        this._execute();
    };


    var select_menu=function(that,index){
        var name=that.components[index].name;
        var p=that.getSibling();
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

    ApocoMakeMenu.prototype={
	_execute: function(){
            var s,u;
            if(this.heading){
                s=document.createElement("span");
                s.textContent=this.heading;
                this.element.appendChild(s);
            }

//	    console.log("Menus creating new element");
	    u=document.createElement("ul");
            u.role="menubar";
            u.classList.add("apoco_menu_list");
            this.element.appendChild(u);
            
	    for(var i=0;i<this.components.length;i++){
                //  console.log("Making menu item " + i);
                
                this.addMenu(i,u);
            }
            if(this.selected){
                this.select(this.selected);
            }
            else{
	        this.selected=null;
            }
           // this.components.length=0; // for garbage collection
	},
	update:function(name){
	    var p=this.getChild(name);
	    if(p !== null){
		p.element.click();
	    }
	    else{
		throw new Error("Apoco.menu Could not find element " + name);
	    }
            return this;
	},
        getSelected: function(){
            if(this.selected){
                return this.selected;
            }
            return null;
        },
        reset: function(){
            this.selected=null;
            var p=this.element.getElementsByTagName("li");
            for(var i=0;i<p.length;i++){
                p[i].classList.remove("selected");
            }
            return this;
        },
        addMenu:function(index,parent_element){
            var d,s,l,that=this;
            if(parent_element === undefined){
                parent_element=this.element.getElementsByClassName("apoco_menu_list")[0];
            }
            if(Apoco.type.integer.check(index)){
                d=this.components[index];
            }
            else{
                d=index;
                index=this.components.length;
                //this.components[index]=d;
            }        
            l=d.label? d.label: d.name;
            if(d.name && this.getChild(d.name) !== null && this.getChild(d.name).parent !== undefined){
                throw new Error("DisplayMenu: Cannot add component with non-unique name " + d.name);
            }
            
            //console.log("addMenu index is " + index);
            d.element=document.createElement("li");
            if(d.class){
                d.element.classList.add(d.class);
            }
            if(d.seperator !== undefined){
                d.element.classList.add("seperator");
                s=document.createElement("span");
                s.className="seperator";
                s.textContent=d.seperator;
                d.element.appendChild(s);
                parent_element.appendChild(d.element);
            }
            else{
	       // d.element.classList.add("ui-menu-item");
                d.element.setAttribute("role","menuitem");
                d.element.textContent=l;
                d.element.setAttribute("name",d.name);
              //  console.log("menu text is "+ d.element.textContent);
	        d.parent=this;
                parent_element.appendChild(d.element);
               // this.components[index]=d;
                if(d.action === "default"){
                    d.action=select_menu;
                   
                }
                if(d.action !==undefined){
                    //console.log("menu has action " + this.components[index].action);
	            d.element.addEventListener("click",
                                 function(t,that){
                                     return function(e){
                                         e.stopPropagation();
                      //                   console.log("menu name is " + t.name);
                      //                   console.log("menu has action " + t.action);
                                         var p=t.action(t);
                                         if(p!== false && p!==null){
                                             that.select(t.name);
                                         }
                                     };
                                 }(d,that),false);//,false);
	            // }(that,index),false);
                }
	    }
            this.components[index]=d;
            return this.components[index];
        },
 
	select: function(val){
            var c;
            for(var i=0;i<this.components.length;i++){
                if (this.components[i].name == val){
                    this.selected=this.components[i];
                    //           var el=this.element.find("ul li:nth-child(" + (i+1) + ")");
                    c=this.selected.element.parentNode.children;
                    for(var j=0;j<c.length;j++){
                        c[j].classList.remove("selected");
                    }
                    this.selected.element.classList.add("selected");
                    return this.selected;
                }
            }
            return null; 
	}
    };

    Apoco.Utils.extend(ApocoMakeMenu,Apoco._DisplayBase);

    Apoco.display.menu=function(opts,win){
        opts.display="menu";
        return new ApocoMakeMenu(opts,win);
    };
    Apoco.display.menuMethods=function(){
        var ar=[];
        for(var k in ApocoMakeMenu.prototype){
            ar.push(k);
        }
        return ar;
    };


})();
