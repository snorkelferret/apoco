var Harvey=require('./declare').Harvey;
require("./Utils");
require("./Popups");
require("./Panel");

;(function(){
    "use strict";
    Harvey.Window={
        _list:[],
        delete:function(win){ // remove a panel that is in a separate browser
            var w;
            if(win === undefined){
                throw new Error("Window.delete  must supply window name or windowObject");
            }
            w=this._inList(win);
            if(w === null){
                return null; //may already have been deleted
                //throw new Error("Window.delete - could not find window " + win);
            }
           
            console.log("deleting the panels for window " + win);
            var p=Harvey.Panel._list;
            for(var j=0;j<p.length;j++){
                if(p[j].window && p[j].window === this._list[w].window){
                    console.log("deleting " + p[j].name);
                    Harvey.Panel.delete(p[j].name);
                }
            }
            this._list[w].window.onunload=null; // stop the close callback
            this._list[w].window.close();
            this._list.splice(w,1);
            return undefined;
        },
        _close:function(name){
            var p=this._inList(name);
            if(p !== null){
                this._list[p].window.close();
            }
            else{
                throw new Error("Harvey.Window: Cannot find window " + name);
            }
            this._list.splice(p,1);
        },
        _closeAll:function(){
            console.log("Close all is here");
            
            for(var i=0; i<this._list.length; i++){
                this._list[i].window.close();
            }
            this._list.length=0;
        },
        get:function(p){
            var i=this._inList(p);
            if(i=== null){
                console.log("return from inList is null");
                return null;
            }
            return this._list[i];
        },
        _inList:function(name){
            var str=false;
            if(name === undefined){
                throw new Error("no name given");
            }
            if(Harvey.checkType["string"](name)){
                str=true;
            }
            console.log("is " + name + " in list?");
            console.log("Window: inList length is " + this._list.length);
            for(var i=0; i<this._list.length;i++){
                console.log("testing list is " + i);
                if(str === true){
                    console.log("str is true name is " + this._list[i].name + " to match " + name);
                    if((this._list[i].name).toString() == (name).toString()){
                        console.log("found it " + name);
                        return i; //this._list[i].window;
                    }
                }
                else{
                    console.log("str is false name is " + this._list[i].name + " to match " + name);
                    if(this._list[i].window === name){
                        return i; //this._list[i].window;
                    }
                }
            }
            return null;
        },
        open:function(d){     // open a new window or a tab
            var settings=new String;
            var that=this;
            var defaults={
                width:600,
                height:600,
                menubar:0,
                toolbar:0,
                location:0,
                personalbar:0
            };
            if(!d.name){
                throw new Error("Window:open - must have a name");
            }
            if(!d.url){
                throw new Error("Window: open - must have a url");
            }
            if(this.get(d.name)){
                throw new Error("Harvey,Window: " + d.name + " already exists");
            }
	    if(!d.opts){
  	        settings="_blank"; // open in new tab
	    }
            else{
                for(var k in defaults){
                    if(d.opts[k] === undefined ){
                        d.opts[k]=defaults[k];
                    }
                }
               
                for(var k in d.opts){
                    if(settings === ""){
                        settings=settings.concat((k + "=" + d.opts[k]));
                    }
                    else{
                        settings=settings.concat(("," + k + "=" + d.opts[k]));
                    }
                }
                console.log("settings are " + settings);
            }
	    var win=window.open(d.url,d.name,("'"+ settings + "'"));
            var p=new Promise(function(resolve,reject){
	        if(!win){
                    reject("Could not open window");
	        }
	        window.addEventListener("childReady",function(){
	            return function(e){
		        if(e.data === win){
                            var tt={name: d.name,window:win,promise:p};
		            console.log("window equals e.data");
                            that._list.push(tt);
                            resolve(tt);
		        }
                        else{
                            reject(("Harvey.Window: could not open " + d.name));
                        }
		      //  console.log("Parent child is ready");
		    };
	        }(d.name,win,p),false);
            });
            
            p.then(function(d){
                d.window.onunload=function(e){
                   // console.log("got child closed " + d.name);
                    // delete the window from the list
                    var win= d.window; //that._list[d.name];
                    if(win !== null){
                        Harvey.Window.delete(win);
                    }
                    else{
                        throw new Error("Could not find window to remove");
                    }
                };
            }).catch(function(reason){
                Harvey.popup.error("Window Open Error",reason);
            });
                                        
	    return p;
        }
    };
})();
