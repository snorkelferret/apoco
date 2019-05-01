if(!UI){
    var UI={};
}

;(function(){
    "use strict";

    
    UI.Controls={
        mkSpaces:function(num){
            var t=new String;
            for(var i=0;i<num; i++){
                t=t.concat("&nbsp ");
            }
            return t;
        },
        getTypes:function(field){
            var f=[],t;
            for(var k in Apoco.type){
                if(Apoco.type[k].field == field){
                    f.push(k);
                }
            }
            return f;
        },
        setTab: function(name,pop){
            var b,c,
                old_tab=null,
                next_tab=null,
                ct=Apoco.Panel.get("Tabs").getChild("Tabs");
           
            if(Apoco.type["object"].check(name)){
                name=name.name;
            }
            // cleanup redirects if they exist
            if(Apoco.Panel.get("Redirects")){
                Apoco.Panel.hide("Redirects");
            }
            if(!ct){
                 throw new Error("Cannot find tab Panel tabs");
            }
            c=ct.getChildren();  // do this so can call setTab from anywhere not just from tab display
            for(var i=0;i<c.length;i++){
                if(c[i].name === name){
                    next_tab=c[i];
                    break;
                }
            }
            if(!next_tab){  // not currently in the display list
                next_tab={name:name};
            }
            if(ct.getSelected()){
                old_tab=ct.getSelected();
            }
            ct.reset();
           
            if(old_tab && Apoco.Panel.get(old_tab.name)){
                console.log("hiding " + old_tab.name);
                Apoco.Panel.hide(old_tab.name);
                console.log("hidden " +  old_tab.name);
            }
            console.log("select_tabs: trying to show " + next_tab.name);
            
            b=Apoco.Panel.get(next_tab.name);
            if(!b){
                console.log("adding panel " + next_tab.name);
                b=Apoco.Panel.add(next_tab.name);
            }
          
            if(b){
                console.log("showing " + next_tab.name);
                Apoco.Panel.show(next_tab.name);        
                if(!pop){
                    // console.log("pushing " + name);
                    Apoco.Utils.history.push(name);
                }
                else{  
                    that.parent.select(name); 
                }
                var ar=b.getChildren();
                if(ar){
                    for(var i=0; i< ar.length; i++){
                        var n=ar[i].getKey();
                        console.log("select_tabs n is " +  n);
                        if(n == "Blurb" ||  n == (name +"Menu")){
                            ar[i].show();
                        }
                        else{
                            console.log("select_tabs hiding " + n );
                            ar[i].hide();
                        }
                        if(n === (name + "Menu")){
                            ar[i].reset();
                        }
                    }
                }
            }
           // if we are using the burger bar
            // make it invisible after selection
            
            if(next_tab.parent === ct){
                if(ct.element.parentNode.style.display==="block"){
                    ct.element.parentNode.style.display="none";
                }
            }
        },
        mkMainEntry:function(name){
            var obj={components:[]};
            if(!UI.Model[name]["generic"]){
                throw new Error("cannot find Model generic " + name);
            }
            var data=UI.Model[name]["generic"];
            
            switch(name){
            case "display":
            case "node":
            case "field":
                obj.components.push({node:"heading",size:"h1",text:(name + " - Generic settings" )});
                return UI.Controls.mkMainDispl(obj,name);
               
            case "type":
                console.log("-------------------mkMainEntry got " + name);
                obj.components.push({node:"heading",size:"h1",text:name});
                obj.components.push({node:"paragraph", text: "Types are used by fields, to check that the user input is correct (using regex) "});
                
                UI.Build.Methods.mkMethods(obj,data,name);
                return obj.components;
            case "Panel":
                obj.components.push({node:"heading",size:"h1",text:name});
                obj.components.push({node:"paragraph",text:"A Panel is a container for displays, which are grouped in the DOM in a div element with the specified id. "});
                obj.components.push({node:"heading",size:"h2",text:"JSON Syntax"});
                obj.components.push({node:"code",text:"UI.Panels={ PanelName:{ window:win,components;objectArray}}"});
                obj.components.push({node:"heading",size:"h2",text:"Syntax"});
                var cmd=UI.Build.Commands.mkGenericCommand(name);
                cmd=cmd.replace("Apoco.Panel","Apoco.Panel.add");
                obj.components.push({node:"code",text:cmd});
                obj.components.push({node:"heading",size:"h2",
                                     text: "Parameters"});
                UI.Build.Parameters.mkParameters(obj,data.parameters,name);
               
                UI.Build.Return.mkReturn(obj,data.return,name);
                cmd="var myObj=Apoco.Panel.add({name:'TestPanel',components:[{display:'fieldset',id:'aDisplay',DOM:'Result',components:[{node:'paragraph',text:'here I am'}]}]});";
                
                obj.components.push({field:"textArea",name:"runCode",value: cmd});
                
                obj.components.push({node:"button",childClass:["btn","btn-primary"],
                                     name:"run",action:UI.Build.Commands.runCommand});
                // using test instaed of Result here because Panel.add automatically adds to DOM
                obj.components.push({node:"whatever",nodeType:"div",id:"Result"});
                
                UI.Build.Options.mkOptions(obj,data,["common"],name);
               
                return obj.components;
            default:
                return null;
            }
            
        },
        mkMainDispl:function(obj,name){
            var data=UI.Model[name]["generic"];
            console.log("mkMainEntry: +++++++++++++++++++++++++= " + name);
            obj.components.push({node:"heading",size:"h2",text:"JSON Syntax"});
            obj.components.push({node:"paragraph",text:"JSON version is just the object parameter with the addition of the " + name + "Type"});
            var cmd=UI.Build.Commands.mkJSONCommand(name);
            obj.components.push({node:"code",text:cmd});
            obj.components.push({node:"heading",size:"h2",text:"Syntax"});
            var cmd=UI.Build.Commands.mkGenericCommand(name);
            obj.components.push({node:"code",text:cmd});
            obj.components.push({node:"heading",size:"h2",
                                 text: "Parameters"});
            UI.Build.Parameters.mkParameters(obj,data.parameters,name);
            UI.Build.Return.mkReturn(obj,data.return,name);
         
            UI.Build.Options.mkOptions(obj,data,["required","common"],name);
            console.log("mkMainEntry components %j",obj.components);
            UI.Build.Methods.mkMethods(obj,data,name);
            return obj.components;
            
        },
        mkMenu:function(name){
            var f=[],list;
            list=UI.Build.Menu.mkList(name);
            if(!list){
                return f;
            }
            for(var i=0;i<list.length; i++){
                f[i]={};
                f[i].name=list[i];
                f[i].action=this.selectMenu;
            }
            return f;
        },
        selectMenu:function(that){
            var name=that.name,obj={},
                p=that.parent.getSibling();
            console.log("selecting menu for " + name);
            if(!p){
                throw new Error("Could not find siblings of " + that.parent.name);
            }
            console.log("menu panel name is " + that.parent.parent.name);
           
            var panel=Apoco.Panel.get(that.parent.parent.name);
            if(!panel){
                throw new Error("selectMenu: cannot find panel","controls.js");
            }
            
            var d=panel.getChild(name);
            if(!d){
                UI.Build.mkEntry(name,panel);
            }
            
            for(var i=0;i<p.length;i++){
                //     console.log("siblings are " + p[i].id);
                if(p[i].id.indexOf(name) > -1){
                    p[i].show();
                } 
                else{
                    p[i].hide();
                }
            } 
        },
        burgerBar:function(){
            var t=document.getElementById("mainNavbar");
            if(t.style.display === "none" || t.style.display === ""){
                //console.log("display is none");
                t.style.display="block";
              //  t.classList.add("tab_dropdown");
            }
            else{
                t.style.display="none";
               // t.classList.remove("tab_dropdown");
            }
        }
    };
    
    
    // see if the query string exists on url
    UI.tabname=Apoco.Utils.history.queryString();
    console.log("got start " + UI.tabname);
    var getRedirect=function(name){
        switch(name){
        case "Forbidden":
            break;
        default:
            name="notFound";
            break;
        }
        UI.Panels.Tabs.components[0].selected=null; // unselect default
        var p=Apoco.Panel.get("Redirects");
        if(!p){
            //      console.log("addimg Redirect page");
            p=Apoco.Panel.add("Redirects");
        }
        //  console.log("getRedirect Found panel " + p);
        p.getChild(name).show();
        //   console.log("going to hide all panels");
    };
    var history_update=function(){  // fires on pop from history bar in browser
        var a,name=Apoco.Utils.history.queryString();
        console.log("location: " + document.location + ", name: " + name);
        // console.log("history update going to tab " + name);
        if(!name){
            console.log("state name is wrong or null" + name);
        }
        else{
            a=Apoco.Panel.get("Tabs").getChild("Tabs").getChild(name);
            if(a){
                UI.Controls.setTab(a,true);
            }
            else getRedirect("notFound");
        } 
    };
    
    Apoco.Utils.history.init(history_update);
    Apoco.start=function(){
        
        if(UI.tabname){
            var t=UI.Panels.Tabs.components[0].components;
            for(var i=0;i<t.length;i++){
                if(t[i].name === UI.tabname){
                    UI.Panels.Tabs.components[0].selected=UI.tabname;
                    Apoco.Panel.UIStart(["Tabs",UI.tabname]);
                    return;
                }
            }
            Apoco.Panel.UIStart(["Tabs"]);
            getRedirect("notFound");
        }
        else{
            Apoco.Panel.UIStart(["Tabs","About"]);
        }
    };
    
})();
