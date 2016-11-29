var Apoco=require('./declare').Apoco;
var Promise=require('es6-promise').Promise; //polyfill for ie11

;(function(){

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
	    var index=-1;

	    for(var i=0; i< that.listen.length; i++){
	     //   console.log("finding name " + that.listen[i].name);
	        if(this._subscribers[that.listen[i].name]){
		    for(var j=0;j<this._subscribers[that.listen[i].name].length;j++){
		        if(this._subscribers[that.listen[i].name][j]["context"].action === that.action){
			    this._subscribers[that.listen[i].name].splice(j,1);
			    index=j;
		        }
		    }
	        }
	    }
	    if(index !== -1){
	        if(this._subscribers[that.listen[index].name].length === 0){ // nobody listening
		    delete this._subscribers[that.listen[index].name];
	        }
                return undefined;
	    }
	    else{
                console.log("Apoco.unsubscribe could not find listener");
                return null;
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
        webSocket:function(options,data){
            var that=this;
            if(UI && UI.webSocketURL){
                var defaults={url: UI.webSocketURL};     
            }
            else{
                 var defaults={url: "."}; 
            }
            var settings={};
            var sendMessage=function(data){
              //  console.log("Trying to send message ___________________________________");
                var msg=JSON.stringify(data);
              //  console.log("got some data " + msg);
                try{
                    Apoco.webSocket.send(msg+'\n');
                }
                catch(err){
                    Apoco.popup.error("websocket send", ("Could not send websocket message %j ",err));
                }
            };
            settings.url=defaults.url;
            for(var k in options){
                settings[k]=options[k];
            }
            
            if(!Apoco.webSocket){
              //  console.log("creating websocket +++++++++++++++++++++++++++++++++++++++++++= ");
                var a={'http:':'ws:','https:':'wss:','file:':'wstest:'}[window.location.protocol];
              //  console.log("a is " + a + " protocol " + window.location.protocol);
                if(!a){
                    throw new Error("IO: Cannot get protocol for window " + window.location);
                }
              //  console.log("location host " + window.location.host + " hostname " + window.location.hostname);
                try{
                    Apoco.webSocket=new WebSocket(a + "//" + window.location.host + settings.url);
                    Apoco.webSocket.onopen = function (e) {
                          //     console.log("created websocket + + + + + + + + + + + + + + ++");
                        if(data !== undefined){ // in case of timing issue
                              sendMessage(data);
                        }
                    };
                }
                catch(err){
                    throw new Error(("webSocket: failed to open" + err));
                }
	    }
            else if(data !== undefined){
                sendMessage(data);
            }

            Apoco.webSocket.onerror=function(e){
                Apoco.popup.error("webSocket","Received an error msg");
            };
            Apoco.webSocket.onclose=function(e){
                if(e.code !== 1000){ // normal termination
                    Apoco.popup.error("webSocket abnormal termination", "Exiting with code" + e.code);
                }
            };
            Apoco.webSocket.onmessage=function(e){
                if(!e.data){
                    throw new Error("webSocket: no data or name from server");
                }
                var d=JSON.parse(e.data);
                console.log("got: %j %j",d[0],d[1]);
                if(d[0] === "error"){
                    Apoco.popup.dialog("Error",JSON.stringify(d[1]));
                }
                else{
                    that.dispatch(d[0],d[1]);
                }
            };
            //if(data !== undefined){
            //    sendMessage(data);
           // }

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
})();
