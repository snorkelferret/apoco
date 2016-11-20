global.Apoco=require('./declare').Apoco;
require("./index.js");
require("./Utils.js");
require("./Panel.js");
require("./Popups.js");
var Promise=require('es6-promise').Promise; //polyfill for ie11

// Apoco is a singleton 

(function(){
    'use strict';

    var that=this;
    window.onerror=function(msg,url,lineno,col_no,error){
   	Apoco.popup.error(url, ("line number " + lineno + " " + msg));
    };

    window.addEventListener('beforeunload',function(e){  
        Apoco.stop(); 
      
    });
 
    Apoco.start=function(options) {
        if(options){
	    if(!Apoco.type["array"].check(options) && Apoco.type["object"].check(options)){
		var p=Apoco.display[options.display](options);
		if(p){
		    p.show();
		}
		else {
		    throw new Error("could not execute " + options.display);
		}
	    }
            else if(Apoco.type["array"].check(options)){
                Apoco.Panel.UIStart(options);
            }
            else{
                throw new Error("Apoco.start: Unknown options");
            }
        }
    };
    Apoco.stop=function(){
        Apoco.Panel.deleteAll();
        if(Apoco.webSocket){
            Apoco.webSocket.close();
        }

    };    
 
})();
