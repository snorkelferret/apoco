var Harvey=require('./declare').Harvey,UI=require('./declare').UI; //,jQuery=require('jquery');

;(function(){

    Harvey.IO={
        _subscribers:{},
        dispatch:function(name,args){  //pubsub
            //console.log("dispatch is here name is " + name);
	    if(this._subscribers[name]){
              //  console.log("found subscriber");
	        try{
		    this._subscribers[name].forEach(function(s){
                        if(!s.action){
                            throw new Error("No action for " + s);
                        }
		        s.action(s.context,args);
		    });
	        } catch (err){
		   throw new Error("_Subscriber error on " + name);
	       }
	    }
        },
        listen:function(that){ //pubsub
	    //var b=that.getKey();

	    for(var i=0; i< that.listen.length; i++){
	        var n=that.listen[i].name;
	        console.log("adding listener " + n + " to " + that.getKey());
	        if(!this._subscribers[n]){
		    this._subscribers[n]=[];
	        }
	        this._subscribers[n].push({context:that,action:that.listen[i].action});
	    }
        },
        unsubscribe:function(that){ //pubsub
	    var index=-1;

	    for(var i=0; i< that.listen.length; i++){
	        // console.log("finding name " + that.listen[i].name);
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
	    }
	    else{
                console.log("Harvey.unsubscribe could not find listener");
	    }

        },
        publish:function(that) {//pubsub
            console.log("++++++++++++=+++ publish +++++++++ " + that.id);
	    for(var i=0;i<that.publish.length;i++){

	        if(that.publish[i].data){
		    this.dispatch(that.publish[i].name,that.publish[i].data);
	        }
	        else if(that.publish[i].action){
		    that.publish[i].action(that);

	        }
	        else{
		    throw new Error("incorrect method for harvey.publish");
	        }
	    }
        },
        webSocket:function(options,data){
            var that=this;
            var defaults={url: UI.webSocketURL};
            
            //var settings=$.extend({},defaults,options);
            var settings={};
            settings.url=defaults.url;
            for(var k in options){
                settings[k]=options[k];
            }
            
            if(!Harvey.webSocket){
                var a={'http:':'ws:','https:':'wss:'}[window.location.protocol];
                //console.log("a is " + a + " protocol " + window.location.protocol);
                Harvey.webSocket=new WebSocket(a + "//" + window.location.host + settings.url);
	    }
            Harvey.webSocket.onmessage=function(e){
                if(!e.data){
                    throw new Error("webSocket: no data or name from server");
                }
                var d=JSON.parse(e.data);
               // console.log("got: %j %j",d[0],d[1]);
                if(d[0] === "error"){
                    Harvey.popup.dialog("Error",d[1]);
                }
                else{
                    that.dispatch(d[0],d[1]);
                }
            };
            if(data !== undefined){
                var msg=JSON.stringify(data);
                //console.log("got some data " + msg);
                Harvey.webSocket.send(msg+'\n');
            }

        },
        REST:function(type,options,data){
            var defaults={url: UI.URL,dataType: 'json',mimeType: 'application/json'};
            if(type !== "GET" || type !== "POST"){
                throw new Error("REST: only knows about GET and POST not " + type);
            }         
	    //    var settings=$.extend({},defaults,options);
            var settings={};
            for(var k in defaults){
                settings[k]=defaults[k];
            }
            for(var k in options){
                settings[k]=options[k];
            }
            if(settings.url === ""){
                throw new Error("Harvey.REST Must have a url");
            }
            data=JSON.stringify(data);
            //var promise=$.ajax(settings);
            
            var promise=new Promise(function(resolve,reject){
                var request=new XMLHttpRequest();
                var stateChange=function(){
                    if(request.readyState === XMLHttpRequest.DONE){
                        if(request.status === 200){ //success
                            console.log("return from server is " + request.responseText);
                            resolve(JSON.parse(request.responseText));
                        }
                        else{
                            reject(request.status);
                            if(!request){
                                throw new Error("REST failed with no return from server");
                            }
                            Harvey.display.statusCode[request.status]((request.statusText + " " + request.responseText));
                        }
                    }  
                };
               
                request.onreadystatechange=stateChange;
                request.open(type,settings.url);
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
