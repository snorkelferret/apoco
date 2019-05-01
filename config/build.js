if(!UI){
    var UI={};
}


;(function(){
    "use strict";
    UI.Build={
        globalEval:function( code ) {
            var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
	    var script,indirect = eval;
	    var trim=function( text ) {
	        return text == null ?
		    "" :
		    ( text + "" ).replace( rtrim, "" );
	    };
	    code = trim( code );
	    if ( code ) {
	        // If the code includes a valid, prologue position
	        // strict mode pragma, execute code by injecting a
	        // script tag into the document.
	        if ( code.indexOf( "use strict" ) === 1 ) {
		    script = document.createElement( "script" );
		    script.text = code;
		    document.head.appendChild( script ).parentNode.removeChild( script );
	        } else {
		    // Otherwise, avoid the DOM node creation, insertion
		    // and removal by using an indirect global eval
		    indirect( code );
	        }
	    }
        },
        mkEntry:function(name,panel,components){
            var obj={},d,cmd,root,arr=[],methods=false;
          
            obj={display:"fieldset",DOM:"right",id:name};
            obj.components=[];
          
            obj.components.push({node:"heading",size:"h1",text:name});
            console.log("mkEntry: panel is " + panel.name);
            if(!UI.Model){
                throw new Error("cannot find UI.Model","build.js");
            }

            // are we a panel with members ??
            if(UI.Model[panel.name]["member"]){
                root=UI.Model[panel.name]["member"];
            }
            else if(UI.Model[panel.name]["methods"]){
                root=UI.Model[panel.name]["methods"];
                console.log("Methods is true");
                methods=true;
            }
           
            d=root[name].descriptions;
            if(d){
              
                for(var i=0;i<d.length;i++){
                    obj.components.push({node:"paragraph",text:d[i]});
                }
            }
            if(panel.name === "type"){
                UI.Build.Commands.mkTypeCommand(obj,name);
                panel.addChild(obj);
                return;
            }
            obj.components.push({node:"heading",size:"h2",text:"Syntax"});
            var c=UI.Build.Commands.mkCommand(panel,name,root[name].cmd);
            obj.components.push({node:"code",text:c.genericCmd});
            // add the generic parameters
            //arr=UI.Model[panel.name]["generic"].parameters.slice(0);
            for(var i=0;i<root[name].parameters.length;i++){
                arr.push(root[name].parameters[i] );
            }
            obj.components.push({node:"heading",size:"h2",
                                     text: "Parameters"});
            
            obj.components.push({node:"paragraph",class:"inline",
                                 text:"To see the common options and return value see the main page"});
            obj.components.push({node:"button",class:["buttonAsAnchor","inline"],
                                 name:name,text:"Generic parameters",
                                 action:function(){UI.Controls.setTab(panel.name);}});
            UI.Build.Parameters.mkParameters(obj,arr,name);
            UI.Build.Return.mkReturn(obj,root[name].return,name);
           // obj.components.push({node:"whatever",nodeType:"div",id:"test"});
            obj.components.push({field:"textArea",name:"runCode",value: c.cmd});
            obj.components.push({node:"button",childClass:["btn","btn-primary"],
                                 name:"run",action:UI.Build.Commands.runCommand});
            obj.components.push({node:"whatever",nodeType:"div",id:"Result"});
            
            UI.Build.Options.mkOptions(obj,root[name],["required","options"],panel.name,methods); 
            // UI.Build.Parameters.mkList(obj,panel,name);
           
            
            UI.Build.Methods.mkMethods(obj,root[name],name);
            
            panel.addChild(obj);
            
        },
        Parameters:{
            mkList:function(obj,type,f ){
                //  console.log("type is " + type.name + " name " + f);
          
                var p=[];
                for(var k in Apoco[type.name]){
                //    console.log("subtype of " + type.name +  " is k " + k);
                    if(k === f){
                  //      console.log("found leaf " + k);
                    //    console.log("as json %j ", Apoco[type.name][f]);
                        // get the constructor
                       // f=f.charAt(0).toUpperCase() + f.slice(1) + "Field";
                        for(var n in Apoco[type.name][f]){
                      //      console.log("property is " + n);
                            p.push(n);
                        }
                        break;
                    }
                }
                
                //console.log("got parameters %j" , p);
                return p;
            },
            mkParameters:function(obj,p,name){
                var items=[];
                
                for(var i=0;i<p.length;i++){
                    items=[];
                    for(var k in p[i]){
                        obj.components.push({node:"heading",size:"h4",text:k});
                        for(var m in p[i][k]){
                            if(Apoco.type["array"].check(p[i][k][m])){
                                items.push({label:m,descriptions:p[i][k][m]});
                            }
                            else{
                                if(p[i][k][m] === false){
                                    items.push({label:m,description:"false"});   
                                }
                                else items.push({label:m,description:p[i][k][m]});   
                            }
                        }
                    }
                    obj.components.push({node:"descriptionList",childClass:["well"],items:items});
                }
            }
        },
        Return:{
            mkReturn:function(obj,p,name){
                var items=[];
                obj.components.push({node:"heading",size:"h2",
                                     text: "Return"});
                for(var k in p){
                    items=[];
                    obj.components.push({node:"heading",class:"indent",size:"h3",text:k});
                    for(var m in p[k]){
                        items.push({label:m,description:p[k][m]});
                    }
                    obj.components.push({node:"descriptionList",class:"indent",childClass:["well"],items:items});            
                }

            }
        },
        Menu:{ 
            mkList:function(data_type){
                var n,r,list=[];
                //var sortFunc=function(f){
                //    return f.name;
               // };
              //  console.log("mkList is here with display type " + data_type);
                //var string=string.charAt(0).toUpperCase() + string.slice(1);
                for(var t in UI.Model){
                //   console.log("display_type is " + t);
                    if(t === data_type){
                  //     console.log("element is " + t);
                        if(t === "node"){
                            r=Apoco.node("node_list");
                        }
                        else if(t === "Examples"){
                            r=UI.Model.Examples.member;
                        }
                        else {
                            r=Apoco[t];
                        }
                        for(var k in r){
                            if(k.indexOf("Methods") === -1 && !k.startsWith("_") ){
                       //         console.log("got this " + k);
                                list.push(k);
                            }
                        }
                        if(data_type === "Panel"){
                            console.log("mkList is Panel" );
                            n=Apoco._panelComponents("methods");
                            console.log("got array %j ",n);
                            for(var k in n){
                                if(!k.startsWith("_")){
                                    list.push(k);
                                }
                            }
                        }
                        console.log("Build.Menu.mkList: got list %j ",list);
                        Apoco.sort(list,"string"); //,fn:sortFunc});
                        return list;
                    }
                }
                return null;
            },
            mkSyntax:function(){
                var parent="field",list;
                list=UI.Model.DOMElements[parent].syntax;
            }
         },
        Commands:{
            mkGenericCommand:function(name){
                var m=UI.Model[name].generic.parameters;
                var cmd="let my"+name + "= Apoco."+ name +"(";
                for(var i=0;i<m.length;i++){
                    if(i>0){
                        cmd=cmd.concat(",");
                    }
                   
                    for(var k in m[i]){
                     
                        if(m[i][k].required !== true){
                            cmd=cmd.concat("[");
                        }
                        cmd=cmd.concat(k);
                        if(m[i][k].required !== true){
                            cmd=cmd.concat("]");
                        }
                    }
                }
                cmd=cmd.concat(");");
                return cmd;
            },
            mkJSONCommand:function(name){
                var count=0,m=UI.Model[name].generic.required;
                var js="{"+ name + ":" + name +"Type ," ;
                for(var k in m){
                    if(k !== "node"){
                        if(count > 0){
                            js=js.concat(",");
                        }
                        count++;
                        js=js.concat(k + ":");
                        for(var p in m[k]){
                            if(p === "type"){
                                js=js.concat(m[k][p]);
                            }
                        }
                    }
                }
                js=js.concat(" <br>// other object key value pairs}");
                return js;
            },
            mkCommand:function(panel,name,command){
                var t,cmd="";
                var r,count=0,obj=false;
                var g,oo,example;
                var genericCmd;
                console.log("panel name is " + panel.name + " name in mkCommand is " + name + "-");
                if(UI.Model[panel.name]["member"]){
                    console.log("found member for " + panel.name);
                    t=UI.Model[panel.name]["member"][name];
                    g=UI.Model[panel.name]["generic"];
                }
                else if(UI.Model[panel.name]["methods"]){
                    t=UI.Model[panel.name]["methods"][name];   
                }
                console.log("t is %j ", t);
                // is there a return value??
                if(t.return && t.return.success){
                    switch(t.return.success.type){
                    case "":
                    case "undefined":
                        break;
                    default:
                        cmd="var myObj=";
                        break;
                    }
                }
                
                if(panel.name === "node"){
                    cmd="var myObj=Apoco." + panel.name + "(";
                }
                else{
                    if(command){
                        cmd=command + "(";
                    }
                    else{
                        cmd=cmd.concat("Apoco." + panel.name + "." + name + "(");
                    }
                }
             
                r=t.parameters;
              
                if(g){
                  
                    if(g.parameters && g.parameters[0].object){
                        cmd=cmd.concat("{");
                        obj=true;
                    }
                
                    if(g.required){
                        for(var k in g.required){
                            console.log("required is " + k + " with value %j" , g.required[k]);
                            if(count>0){
                                cmd=cmd.concat(",");
                            }
                            if(obj){
                                cmd=cmd.concat(k + ":");
                            }
                            if(k !== "node"){
                                if(k !== "DOM"){
                                    cmd=cmd.concat(JSON.stringify(UI.Model.type.member[g.required[k]["type"]].example[0]));
                                }
                                else{
                                    cmd=cmd.concat(JSON.stringify("Result")); // name of the parent node
                                }
                            }
                            else{
                                cmd=cmd.concat(JSON.stringify(name));
                            }
                            count++;
                        }
                    }
                }
                genericCmd=cmd.slice(0);
                if(r){
                    console.log("command got " + r.length + " parameters");
                    for(var i=0; i< r.length;i++){
                        console.log("i is " + i);
                        for(var k in r[i]){
                            console.log("command parameters are " + k);
                            if(count>0){
                                cmd=cmd.concat(",\n \t ");
                                genericCmd=genericCmd.concat(", ");
                            }
                            console.log("get example of k type " + k + " is %j " , r[i][k]);
                            oo=r[i][k].type.split(" || ");
                            if(oo.length> 1){
                                example=oo[0];
                            }
                            else{
                                example=r[i][k].type;
                            }
                            console.log("example is " + example);
                            if(obj){
                                cmd=cmd.concat(k + ":");
                                genericCmd=genericCmd.concat(k + ":");
                            }
                            switch(k){
                            case "components":
                                if(name === "slideshow"){
                                    cmd=cmd.concat(JSON.stringify(UI.Model.type.member["slideshowComponents"].example[0]));
                                    break;
                                }
                                else if(name === "tabs"){
                                    cmd=cmd.concat(JSON.stringify(UI.Model.type.member["tabsComponents"].example[0]));
                                    break;
                                }
                                else if(name === "menu"){
                                     cmd=cmd.concat(JSON.stringify(UI.Model.type.member["menuComponents"].example[0]));
                                    break;
                                }
                                else {
                                    cmd=cmd.concat(JSON.stringify(UI.Model.type.member[k].example[0]));
                                    break;
                                }
                               
                            case "element":
                                console.log("mkCommang asking for HTMLElement");
                                var el=document.getElementById("Main");
                                console.log("el is " + el);
                                cmd=cmd.concat(el);
                                break;
                            case "rows":
                            case "cols":
                                cmd=cmd.concat(JSON.stringify(UI.Model.type.member[k].example[0]));
                                break;
                            case "action":
                            case "userGetValue":
                            case "userSetValue":
                                cmd=cmd.concat("function(that){ alert('got a callbackFuntion');}");
                                break;
                            default:
                                var c=JSON.stringify(UI.Model.type.member[example].example[0]).split('"action":"callbackFunction"');
                               // console.log("c length is " + c.length);
                                if(c.length>1){
                                    for(var j=0;j<c.length;j++){
                                        cmd=cmd.concat(c[j]);
                                        if(j<c.length-1){
                                            cmd=cmd.concat("action:");
                                            cmd=cmd.concat("function(that){ alert('got a callbackFuntion');}");
                                        }
                                        
                                    }
                                }
                                else{
                                    cmd=cmd.concat(JSON.stringify(UI.Model.type.member[example].example[0]));
                                };
                            } 
                            genericCmd=genericCmd.concat(JSON.stringify(r[i][k].type));
                            count++;
                        }
                    }
                }
                if(obj){
                    cmd=cmd.concat("}");
                    genericCmd=genericCmd.concat("}");
                    
                }
                cmd=cmd.concat(");");
                genericCmd=genericCmd.concat(");");
              
                return {cmd:cmd,genericCmd: genericCmd};
            },
            mkTypeCommand:function(obj,name){
                obj.components.push({node:"heading",size:"h2",text:"Example"});
                var cmd="var example=";
                if(name !== "function"){
                    cmd=cmd.concat(JSON.stringify(UI.Model.type.member[name].example));
                }
                else{   // need this so as to not stringify functions already strings
                    cmd=cmd.concat("[");
                    for(var i=0;i<UI.Model.type.member[name].example.length;i++){
                        if(i>0){
                            cmd=cmd.concat(",");
                        }
                        cmd=cmd.concat((UI.Model.type.member[name].example[i]));
                    }
                    cmd=cmd.concat("]");
                }
                cmd=cmd.concat(", \n a=[]; \n");
                cmd=cmd.concat("for (var i=0; i< example.length;i++){ \n");
                cmd=cmd.concat(" a[i]=('Result for ' + example[i] + ' is ' + Apoco.type['" + name + "'].check( example[i])); \n");
                cmd=cmd.concat("}; \n \n // create the node that gets appended to DOM \n  var myObj=Apoco.node({node:'list',list:a});");
                
                obj.components.push({field:"textArea",name:"runCode",value: cmd});
                obj.components.push({node:"button",childClass:["btn","btn-primary"],
                                     name:"run",action:UI.Build.Commands.runCommand});
                obj.components.push({node:"whatever",nodeType:"div",id:"Result"});
                
            },
            runCommand:function(that){
                var f=that.parent.getChild("runCode");
                console.log("runCommand is here");
                if(!f){
                    throw new Error("UI.Build.Commands.runCommand: cannot fimd command", "build.js");
                }
                
                if(window.myObj && window.myObj.delete){
                    console.log("deleting myObj");
                    window.myObj.delete();
                }
                else{
                    if(Apoco.Panel.get('TestPanel')){
                        Apoco.Panel.delete('TestPanel');
                    }
                }
                window.myObj=null;
                UI.Build.globalEval(f.getValue());
                UI.Build.Commands.showResult(that.parent.getChild("Result"));
                
                return;
            },
            showResult:function(result){
                var n,r;
                                
                // check the type of the result to work out how to display it
                console.log("showResult is here");
                if(window.myObj){
                   // console.log("myObj.show",window.myObj.show);
                   // console.log("myObj.DOM",window.myObj.DOM);
                   // console.log("keys ",Object.keys(window.myObj));
                    if(window.myObj.show && window.myObj.DOM){
                        console.log("Using show method to display result");
                        window.myObj.show();
                    }
                    else if(window.myObj.element){
                        console.log("appending elment to Result");
                        result.element.innerHTML="";
                        result.element.appendChild(window.myObj.element);    
                    }
                    else{
                        if(Apoco.type.objectArray.check(window.myObj)){
                            console.log("Result is obj array");
                            result.element.innerHTML="";
                            r=window.myObj;
                        }
                        else{
                            console.log("stringifying myObj");
                            try {
                                r=JSON.stringify(window.myObj);
                            }
                            catch(err){
                                console.log("Cannot stringify %j", window.myObj);
                            }
                        }
                        if(r){
                            n=Apoco.node({"node":"paragraph",text: r});
                            result.element.appendChild(n.element);
                        }
                        
                    }
                }
            }
        },
        Options:{
            mkOptions:function(obj,p,opts,name,isMethod){
                var items;
                console.log("name " + name + " methods " + isMethod);
                if(isMethod){
                    obj.components.push({node:"heading",size:"h1",
                                         text: "Options"});
                }
                else{
                    obj.components.push({node:"heading",size:"h1",
                                     text: "Object settings"});
                    // for specific entries only
                //
                    if(opts.indexOf("common") < 0){ // not the generic page
                        obj.components.push({node:"paragraph",class:"inline",text:"For a full list of Object options see the main page"});
                        obj.components.push({node:"button",class:["buttonAsAnchor","inline"],name:name,text:"Generic Options",
                                             action:UI.Controls.setTab});
                    }
                }
                for(var i=0;i<opts.length;i++){
                    if(p[opts[i]]){
                        obj.components.push({node:"heading",size:"h2",
                                             text: opts[i]});
                        for(var k in p[opts[i]]){
                            obj.components.push({node:"heading",size:"h4",
                                                 text: k});
                            items=[];
                            for(var l in p[opts[i]][k]){
                                if(l === "descriptions"){
                                    items.push({label:l,descriptions: p[opts[i]][k][l]});
                                }
                                else{
                                    items.push({label: l,description: p[opts[i]][k][l]});
                                }
                            }
                            obj.components.push({node:"descriptionList",childClass:["well"],items:items});
                        }
                    }
                }
               // console.log("mkOptions:- compontents %j",obj.components);
             
            }
          
        },
        Methods:{
            getMethods:function(display_type,name){
                var n=[],ar=[];
                if(Apoco[display_type] && Apoco[display_type][(name + "Methods")]){
                    n=Apoco[display_type][(name + "Methods")]();
                    for(var i=0;i<n.length;i++){
                        if(!n[i].startsWith("_")){
                            ar.push(n[i]);
                        }
                    }
                    return ar;
                }
                return null;
            },
            mkMethods:function(obj,p,name){
                var cmd,items=[],dl=[],parms,d;
              
                if(p.methods){
                    console.log("got methods");
                    obj.components.push({node:"heading",size:"h2",
                                         text: "Methods"});
                    var m=UI.Build.Methods.getMethods(p.name,name);
                    
                    for(var k in p.methods){
                        cmd="";
                        obj.components.push({node:"heading",size:"h4",text:k});
                        if(p.methods[k].descriptions){
                                for(var i=0;i<p.methods[k].descriptions.length;i++){
                                    obj.components.push({node:"paragraph",class:"indent",
                                                         text:p.methods[k].descriptions[i]});
                                }
                        }
                        
                        obj.components.push({node:"heading",size:"h3",text:"Syntax"});

                        if(p.methods[k].return.success.type !== "undefined"){
                            cmd=("let v=");
                        }
                        if(p.methods[k].cmd){
                            cmd=cmd.concat(p.methods[k].cmd + "(");
                        }
                        else{
                            cmd=cmd.concat("my" + name + "."+ k + "(");
                        }
                        if(p.methods[k].parameters){
                            dl=[];
                            parms=p.methods[k].parameters;
                            for(var i=0;i<parms.length;i++){
                                if(i>0){
                                    cmd=cmd.concat(",");
                                }
                                for(var m in parms[i]){
                                    d=[];
                                    if(parms[i][m].required !== true){
                                        cmd=cmd.concat("[");
                                    }
                                    cmd=cmd.concat(m);
                                    if(parms[i][m].required !== true){
                                        cmd=cmd.concat("]");
                                    }
                                    d.push(("type:" + parms[i][m].type));
                                    d.push(("required:" + parms[i][m].required));
                                    if(parms[i][m].descriptions){
                                       
                                        for(var j=0;j<parms[i][m].descriptions.length; j++){
                                            d.push(parms[i][m].descriptions[j]);
                                        }
                                    }
                                    dl.push({label:m,descriptions:d});
                                }
                            }
                            cmd=cmd.concat(");");
                            obj.components.push({node:"code",class:"indent",text:cmd});
                            obj.components.push({node:"heading",class:"indent",size:"h3",text:"Parameters"});
                            obj.components.push({node:"descriptionList",childClass:["well","indentBig"],items:dl});

                        }
                        obj.components.push({node:"heading",size:"h3",class:["indent"],text:"Return value"});
                        obj.components.push({node:"descriptionList",childClass:["well","indentBig"],
                                             items:[{label:"success",description:("type:" + p.methods[k].return.success.type)},
                                                    {label:"fail",description:("type:" + p.methods[k].return.fail.type)}
                                                   ]});
                      
                    }
                    
                }
            }
        }
    };
    
})();
