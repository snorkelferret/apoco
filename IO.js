var Apoco=require('./declare').Apoco;
var Promise=require('es6-promise').Promise; //polyfill for ie11

;(function(){
    'use strict';
    Apoco.IO={
        _subscribers:{},
        dispatch:function(name,args){  //pubsub
           // console.log("dispatch is here name is " + name);
	    if(this._subscribers[name]){
           //     console.log("found subscriber");
	        try{
		    this._subscribers[name].forEach(function(s){
                        if(!s.action){
                            throw new Error("No action for " + s);
                        }
                    /*   for(var k in s.context){
                            console.log("before dispatch " + k);
                         }
                       console.log("action is " + s.action);
                       console.log("with args " + args); */
		        s.action(s.context,args);
		    });
	        } catch (err){
		    throw new Error("_Subscriber error on " + name + " " + err);
	       }
	    }
        },
        listen:function(that){ //pubsub
	    //var b=that.getKey();
            //  for(var k in that){
            //      console.log("listen has that " + k);
            //   }
            if(that === undefined || that.listen === undefined){
                throw new Error("IO.listen needs an object");
            }
	    for(var i=0; i< that.listen.length; i++){
	        var n=that.listen[i].name;
	    //   console.log("adding listener " + n );// + " to " + that.getKey());
	        if(!this._subscribers[n]){
		    this._subscribers[n]=[];
	        }
	        this._subscribers[n].push({context:that,action:that.listen[i].action});
	    }
        },
        unsubscribe:function(that){ //pubsub
	   // var names=[];

	    for(var i=0; i< that.listen.length; i++){
	     //   console.log("finding name " + that.listen[i].name);
	        if(this._subscribers[that.listen[i].name]){
		    for(var j=0;j<this._subscribers[that.listen[i].name].length;j++){
		        if(this._subscribers[that.listen[i].name][j]["context"].action === that.action){
			    this._subscribers[that.listen[i].name].splice(j,1);
		        }
		    }
	        }
	    }
            for(var k in this._subscribers){
                if(this._subscribers[k].length === 0){ //nobody listening
                    delete this._subscribers[k];
                }
            }
	    
        },
        publish:function(that) {//pubsub
            if(that === undefined || that.publish === undefined){
                throw new Error("IO.publish needs an object");
            }
          //  console.log("++++++++++++=+++ publish +++++++++ " + that.id);
	    for(var i=0;i<that.publish.length;i++){

	        if(that.publish[i].data){
		    this.dispatch(that.publish[i].name,that.publish[i].data);
	        }
	        else if(that.publish[i].action){
		    that.publish[i].action(that,that.publish[i].name);
	        }
	        else{
	            throw new Error("incorrect method for apoco.publish");
	        }
	    }
        },
 
  
        REST:function(type,options,data){
            var defaults={dataType: 'json',mimeType: 'application/json'};
            if(UI && UI.URL){
                defaults.url=UI.URL;
            }
            else{
                defaults.url=".";
            }
            if(type !== "GET" && type !== "POST"){
                throw new Error("REST: only knows about GET and POST not " + type);
            }
	    
            var settings={};
            for(var k in defaults){
                settings[k]=defaults[k];
            }
            for(var k in options){
                settings[k]=options[k];
            }
            if(settings.url === ""){
                throw new Error("Apoco.REST Must have a url");
            }
            if(data && settings.mimeType === 'application/json'){
                data=JSON.stringify(data);
            }
            var promise=new Promise(function(resolve,reject){
                var request=new XMLHttpRequest();
                var stateChange=function(){
                    if(request.readyState === XMLHttpRequest.DONE){
                        if(request.status === 200){ //success
                            //  console.log("return from server is " + request.responseText);
                            if(settings.mimeType === 'application/json'){
                                resolve(JSON.parse(request.responseText));
                            }
                            else{
                                resolve(request.responseText);
                            }
                        }
                        else{
                            reject(request.status);
                            if(!request){
                                throw new Error("REST failed with no return from server");
                            }
                           // Apoco.popup.statusCode[request.status]((request.statusText + " " + request.responseText));
                        }
                    }
                };
                var reqFail=function(e){
                    reject(request.status);
                };
                request.onreadystatechange=stateChange;
                request.open(type,settings.url);
                request.addEventListener('error',reqFail);
                if(type === "POST"){
                    request.setRequestHeader("Content-Type", settings.mimeType);
                    request.send(data);
                }
                else{
                    request.responseType=settings.mimeType;
                    request.send();
                }
            });

            return promise;
        }
    };

    var _webSocket=function(options,data){
        var that=this,defaults={url: "."};
        this.buffer=[];
        this.socket=null;
        
        if(UI && UI.webSocketURL){
            defaults={url: UI.webSocketURL};     
        }
        this.settings={};
        this.settings.url=defaults.url;
        for(var k in options){
            this.settings[k]=options[k];
        }
        that.init();
        
        this.socket.onerror=function(e){
            Apoco.popup.error("webSocket","Received an error msg");
        };
        this.socket.onclose=function(e){
            if(e.code !== 1000){ // normal termination
                Apoco.popup.error("webSocket abnormal termination", "Exiting with code" + e.code);
            }
            this.socket=null;
        };
        this.socket.onmessage=function(e){
            if(!e.data){
                throw new Error("webSocket: no data or name from server");
            }
            var d=JSON.parse(e.data);
        //    console.log("Websocket: got: %j %j",d[0],d[1]);
            
            if(that.corking){
               // console.log("corking data %j",d);
                that.buffer.push(d);
            }
            else if(d[0] === "error"){
                Apoco.popup.dialog("Error",JSON.stringify(d[1]));
            }
            else{
                Apoco.IO.dispatch(d[0],d[1]);
            }
        };
    };
    
    _webSocket.prototype={
        init:function(data){
            var that=this;
            //console.log("webSocket -init: settings %j",that.settings);
            if(!that.socket){
            //  console.log("creating websocket +++++++++++++++++++++++++++++++++++++++++++= ");
                var a={'http:':'ws:','https:':'wss:','file:':'wstest:'}[window.location.protocol];
                //  console.log("a is " + a + " protocol " + window.location.protocol);
                if(!a){
                    throw new Error("IO: Cannot get protocol for window " + window.location);
                }
            
                try{
                    that.socket=new WebSocket(a + "//" + window.location.host + that.settings.url);
                    that.socket.onopen = function (e) {
                    //     console.log("created websocket + + + + + + + + + + + + + + ++");
                   /* if(data !== undefined){ // in case of timing issue
                        that.send(data);
                    }*/
                    };
                }
                catch(err){
                    throw new Error(("webSocket: failed to open" + err));
                }
	    }
        },
        close:function(){
            this.socket.close();
        },
        send:function(data){
            var that=this;
            //  console.log("Trying to send message ___________________________________");
            var msg=JSON.stringify(data);
            //  console.log("got some data " + msg);
            if(!that.socket){
                that.init();
            }
            try{
                that.socket.send(msg+'\n');
            }
            catch(err){
                Apoco.popup.error("websocket send", ("Could not send websocket message %j ",err));
            } 
        },
        cork:function(on){
          //  console.log("tippppppppppppppppppppppppppppppppp");
         //   console.log("Yippppeeeeee cork is here");
            var msg,that=this;
            if(on){
                that.corking=true;
            }
            else{
               while ((msg=that.buffer.shift())!==undefined){
               //    console.log("uncorking %j",msg);
                   Apoco.IO.dispatch(msg[0],msg[1]);
                }
                if(that.buffer.length !==0){
                    throw new Error("Apoco.IO.websocket: corked buffer length is not 0");
                } 
                that.corking=false;
            }
        },
        setToNull: function(){
            var that=this;
            that.socket=null;
        },
        getSocket:function(){
            var that=this;
            return that.socket;
        }
    };
    Apoco.IO.webSocket=function(options,data){
        return new _webSocket(options,data);  // need to call new so prototype methods are instantiated 
    };

    
})();
