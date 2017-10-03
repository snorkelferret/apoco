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
        listen:function(that,name){ //pubsub
            var t,found=false;
	    //var b=that.getKey();
            //  for(var k in that){
            //      console.log("listen has that " + k);
            //   }
           // console.log("listener is " + that.id);
            if(that === undefined || that.listen === undefined){
                throw new Error("IO.listen needs an object");
            }
	    for(var i=0; i< that.listen.length; i++){
	        var n=that.listen[i].name;
	    //   console.log("adding listener " + n );// + " to " + that.getKey());
	        if(!this._subscribers[n]){
		    this._subscribers[n]=[];
	        }
                // check that we are not adding it multiple times
                found=false;
                if(this._subscribers[n]){
                    for(var j=0;j<this._subscribers[n].length;j++){
                        t=this._subscribers[n][j];
                        // we already have this entry
                        if(t.context==that && t.action== that.listen[i].action){
                            found=true;
                        }
                    }
                }
	        if(!found){
                    if(name === undefined || name===n){
                        this._subscribers[n].push({context:that,action:that.listen[i].action});
                    }
                }
            }
        },
        getSubscribers:function(name){
            var p=[];
            if(name && this._subscribers[name]){
                for(var i=0; i<this._subscribers[name].length; i++){
                  //  console.log("name is " + name + " i is " + i);
                   // console.log("subscriber is %j ",this._subscribers[name][i]);
                    p.push(this._subscribers[name][i].context);
                }
            }
            return p;
        },
        unsubscribe:function(that,name){ //pubsub
	    // var names=[];
            var n;

	    for(var i=0; i< that.listen.length; i++){
                n=that.listen[i].name;
	        //   console.log("finding name " + that.listen[i].name);
               // if(name && that.listen[i].name === name){
	        if(this._subscribers[n]){
		    for(var j=0;j<this._subscribers[n].length;j++){
		        if(this._subscribers[n][j]["context"].action === that.action){
                            if(name === undefined || name === n){
			        this._subscribers[n].splice(j,1);
		            }
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
            var defaults={dataType: 'json',
                          mimeType: 'application/json'};
            if(UI && UI.URL){
                defaults.url=UI.URL;
            }
            else{
                defaults.url=".";
            }
            if(type !== "GET" && type !== "POST" && type !== "PUT"){
                throw new Error("REST: only knows about GET PUT and POST not " + type);
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
                           // console.log("return from server is %j ", request.response);
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
                for(var k in settings){
                    if(k === "mimeType"){
                        request.setRequestHeader("Content-Type", settings.mimeType);            
                    }
                    else if(k !== "url"){
                        request.setRequestHeader(k,settings[k]);
                    }
                }
                if(type === "POST"  || type === "PUT"){
                    console.log("PUT request %j",request );
                    request.send(data);
                }
                else{
                    request.responseType=settings.mimeType;
                    request.send();
                }
            });

            return promise;
        },
        getFiles:function(f,that,event){
            var promise,found=false;
            if(!that){
                throw new Error("getFiles: meeds options object");
            }
            if(!that._promises){
                that._promises=[];
            }
            if(!that._errors){
                that._errors=[];
            }
            if(!that._files){
                that._files=[];
            }
          //  console.log("getFiles that is %j",that);
            for (var i = 0; i<f.length; i++) {
              //  console.log("got file number " + i + " name " + f[i].name + " type " + f[i].type + " size " + f[i].size + " bytes, date  " + f[i].lastModifiedDate );
                if(that.opts){
                //    console.log("dropZone setting options");
                    if(that.opts["maxSize"]){
                        if(f[i].size > that.opts.maxSize ){
                            that._errors.push("File too large" + f[i].name + "exceeds the maximum allowable file size");
                            continue;
                        }
                    }
                    found=true;
                    if(that.opts["mimeType"]){
                       // console.log("got a mimetype");
                        found=false;
                        for(var j=0;j<that.opts["mimeType"].length;j++){ //e.g application/pdf
                       //     console.log("is " + f[i].type + " of type " + that.opts["mimeType"][j] );
                            if(f[i].type === that.opts["mimeType"][j]){
                                  found=true;
                            }
                        }
                        if(!found){
                            that._errors.push("File incorrect type " + f[i].name + " cannot be uploaded");
                        }
                    }
                    if(!found){
                        continue;
                    }
                }
             
                //f[i].lastModifiedDate.toLocaleDateString(
  
                promise=new Promise(function(resolve,reject){
                    var pb=null,pc,reader = new FileReader();
                    reader.onerror=function(evt){
                        reject("DropZone Error " + evt.target.error.code);
                    };
                    if(that.opts && that.opts.progressBar){
                        reader.onprogress=function(evt){
                            that._doProgress(evt);
                        };
                        pb=that.opts.progressBar; 
                    }
                    // Closure to capture the file information.
                    reader.onload = (function(file) {
                        return function(evt) {
                            evt.stopPropagation();
                            file.data=evt.target.result;
                           // console.log("reader file  is "+ file.name);
                            //console.log("evt.target.result " + evt.target.result);
                            that._files.push(file);//(evt.target.result);
                            resolve(file); //evt.target.result);
                            if(pb){
                                pb.style.width =  100 + '%';
                                pb.textContent=("Staged for upload " + file.name);
                            }
                        };
                    })(f[i]);
                    // Read in the image file as a data URL.
                    reader.readAsDataURL(f[i]);
                });
                that._promises.push(promise);
            }
            return that._promises;
        }
        
    };

    var _webSocket=function(options,data){
        var that=this,defaults={url: "."};
        this.retry_attempts=0;
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
        if(!this.settings["reconnectMax"]){
            this.settings.reconnectMax=6;
        }
        that.init();
        
      
    };
    
    _webSocket.prototype={
        init:function(){
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
                  //  console.log("that .settings is %j",that.settings);
                    that.socket=new WebSocket(a + "//" + window.location.host + that.settings.url);
                    this.socket.onopen=function(e){
                      //  console.log("onopen event");
                    };
                    this.socket.onerror=function(e){
                      //  console.log("onerror event");
                        if(that.settings.errorCallback){
                            that.settings.errorCallback(e);
                        }
                        else{
                            Apoco.popup.error("webSocket","Received an error msg %j" ,e);
                        }
                    };
                    this.socket.onclose=function(e){
                     //   console.log("onclose event");
                        this.socket=null;
                        if(e.code !== 1000){ // normal termination
                            if(that.settings.errorCallback){
                                that.settings.errorCallback(e);
                            }
                            else{
                                throw new Error("webSocket abnormal termination Exiting with code" + e.code);
                            }
                        }
                        if(that.settings.closeCallback){
                            that.settings.closeCallback(e);
                        }
                    };
                    this.socket.onmessage=function(e){
                       // console.log("onmessage event");
                        if(!e.data){
                            throw new Error("webSocket: no data or name from server");
                        }
                        var d=JSON.parse(e.data);
                        //    console.log("Websocket: got: %j %j",d[0],d[1]);
                        if(d[0] === "error"){
                            throw new Error("socket on message got error " + JSON.stringify(d[0]));
                        }
                        if(that.corking){
                            // console.log("corking data %j",d);
                            that.buffer.push(d);
                        }
                        else{
                            Apoco.IO.dispatch(d[0],d[1]);
                        }
                    };
                        /*  that.socket.onopen = function (e) {}; */
                }
                catch(err){
                    throw new Error("webSocket: failed to open" + err);
                }
	    }
        },
        reconnect:function(succ_func,fail_func){
            var that=this;

            //console.log("*********************8 start recoonnect socket is  " + that.socket + " retry attempt " + that.retry_attempts);
          
            if(that.socket && that.socket.readyState !== 1){
                that.socket.close();
                that.socket=null;
              //  console.log("socket was set to closed and set to null");
              
            }
            else{
                that.retry_attempts=0;
                if(succ_func){
                    succ_func();
                }
                return;
            }
           // var t=Apoco.Panel.get("TabPanel").getChild("Tabs").getChild("LogOut");   
            if(that.retry_attempts > that.settings.reconnectMax){
              //  console.log("Can't reconnect");
                that.socket=null;
                // logOut(t,"error");
                if(fail_func){
                    fail_func();
                }
                return;
            }
        
            that.retry_attempts++;
            window.setTimeout(function(){
               // console.log("before init: reconnect count is " + that.retry_attempts + " that.settings is %j " ,that.settings);
                that.init();
               // console.log(" iN timeout trying to open socket ready state is " + that.socket.readyState);
            },that.retry_attempts*1000);
                                
        },
        close:function(){
            if(this.socket){
                this.socket.close();
            }
        },
        send:function(data){
            var that=this;
            //  console.log("Trying to send message ___________________________________");
            var msg=JSON.stringify(data);
             //console.log("websocket ready state is " + that.socket.readyState);
            if(that.socket.readyState !== 1){
                var wait=function (event) {
                    that.socket.send(msg+'\n');
                    that.socket.removeEventListener('open',wait);
                };
                that.socket.addEventListener('open', wait,false);
            }
            else{
                try{
                    that.socket.send(msg+'\n');
                }
                catch(err){
                    Apoco.popup.error("websocket send", ("Could not send websocket message %j ",err));
                }
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
    
    var _dropZone=function(element,opts){
        var that=this,p;
        this.opts=opts;
        if (!window.File && !window.FileReader && !window.FileList && !window.Blob) {
            return false;
        }
        if(!element){
            throw new Error("Utils:dropZone - element does not exist");
        }
        if(this.opts && this.opts.progressBar){
            if(this.opts.progressBar.tagName !== "DIV"){
                throw new Error("Apoco.IO.dropZone - progressBar needs to be a div");
            }
        }
        element.addEventListener("dragover",function(e){
           // console.log("in drop zone");
            // var p=document.getElementById("CreateIdeaDrop");
            if(!element.classList.contains("drop_zone")){
                element.classList.add("drop_zone");
            }
            e.preventDefault();
            e.stopPropagation();
        },false);
        element.addEventListener("dragenter",function(e){
         //   console.log("enter drop zone");
            // var p=document.getElementById("CreateIdeaDrop");
            element.classList.add("drop_zone");
            e.stopPropagation();
        },false);
        element.addEventListener("dragleave",function(e){
           // console.log("leave drop zone");
            //var p=document.getElementById("CreateIdeaDrop");
            element.classList.remove("drop_zone");
            e.stopPropagation();
        },false);
        element.addEventListener("drop",function(e){
           // console.log("drop is here");
            //       var p=document.getElementById("CreateIdeaDrop");
            element.classList.remove("drop_zone");
            e.preventDefault();
            e.stopPropagation();
            //       Apoco.Utils.dropZone.getFiles(e);
            that._getFiles(e);
        },false);
        return true;
    };
    _dropZone.prototype={
        _promises: [],
        _files:[],
        _getFiles:function(e) {
            var f,that=this;
            e.stopPropagation();
            e.preventDefault();
            f=e.dataTransfer.files; // FileList object.
          //  console.log("got files %j",f);
            // f is a FileList of File objects. List some properties.
            Apoco.IO.getFiles(f,that,e);
            if(this.opts["action"]){
                this.opts.action(this._promises);
            }
        },
        _doProgress:function(evt){
            var pl,pb,that=this;
         //   console.log("do progress options %j", that.opts);
            if(that.opts && that.opts["progressBar"]){
                pb=that.opts.progressBar;
            }
            else{
                throw new Error("Cannot find progressBar");
            }
          //  console.log("do progress is here");
            if(!pb){ return;}
            if (evt.lengthComputable) {
                pl = Math.round((evt.loaded / evt.total) * 100);
                // Increase the progress bar length.
                if (pl< 100) {
                    pb.style.width = pl + '%';
                    pb.textContent = pl + '%';
                }
            }
        },
        getPromises:function(){
            return this._promises; //Promise.all(this._promises);
        },
        getFileList:function(){
            return this._files; 
        },
        clearPromises: function(){
            this._promises.length=0; 
        },
        clearFileList:function(){
            this._files.length=0;
        },
        reset:function(){
            this.clearFileList();
            this.clearPromises();
            this._errors=[];
            if(this.opts && this.opts.progressBar){
                this.opts.progressBar.innerHTML="";
            }
        }
        
    };
    Apoco.IO.dropZone=function(element,options){
        return new _dropZone(element,options);  // need to call new so prototype methods are instantiated 
    };
    
    }
)();
