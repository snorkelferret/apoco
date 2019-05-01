if(!UI){
    var UI={};
}

;(function(){
    "use strict";
    //UI.URL="/home/val";
    UI.webSocketURL=".";
    UI.URL=",";
    
    UI.Windows={
        TestWindow:{name: "TestWindow",opts:{height:800}}
    };

    UI.Panels={
        Tabs:{ 
            components:[
                {display: "tabs",
                 DOM: "mainNavbar",
                 id: "Tabs",
                 selected: "About",
                 components: [
                     {name: "About",label: "About",action:UI.Controls.setTab},
                     {name: "GettingStarted",label: "Get started",action: UI.Controls.setTab},
                     {name: "type",label: "Types",action:UI.Controls.setTab},
                     {name: "field",label: "Fields",action:UI.Controls.setTab},
                     {name: "node",label: "Nodes",action:UI.Controls.setTab},
                     {name: "display",label: "Displays",action:UI.Controls.setTab},
                     {name: "Panel",label: "Panels",action:UI.Controls.setTab},
                     {name: "Window",label: "Windows",action:UI.Controls.setTab},
                     {name: "IO",label: "IO",action:UI.Controls.setTab},
                     {name: "popup",label: "Popups",action:UI.Controls.setTab},
                     {name: "Utils",label: "Utils",action:UI.Controls.setTab},
                     {name: "Examples",label: "Exanples",action:UI.Controls.setTab}
                 ]
                }
            ]
        },
        About:{
            components:[
                {display:"fieldset",
                 DOM: "right",
                 id:"Blurb",
                 class:["col-sm-12","col-md-10","col-lg-8"],
                 components:[
                     {node:"heading", class:"center-block", size:"h1",text: "Apoco"},
                     {node:"paragraph",text:"Apoco is a set of modules that can be used to form a 'Single Page Application' (SPA) or used as a page or part of a page.<br>It is a real time web framework, with automatic two way synchronisation between browser and server content.<br>The components can be used together or individually.<br> Apoco employs a 'sort of' shabow dom, in so far as the DOM elements are kept in memory and accessed using getters and setters. More in the spirit of a conventional C type window system. Writing html is not required, as Apoco creates all the HTML. <br>  Apoco can use an MVC pattern, where views are kept as a JSON (like) object, controls in a separate javascript file, and the model can come from another JSON object or the server or a combination of both. For larger and more complex projects an additional build.js file can be deployed, to construct more complex objects <br> Apoco supports both REST and websockets. <br>"},
                     {node:"image",src:"css/images/treeStruct.png"},
                     {node:"paragraph",text:"Apoco is arranged hierarchically starting with windows and ending with nodes and/or fields. It supports multiple windows. Apoco is very fast, as it only updates specific element values sent by the server and doesn't need to update the page. Ypu can also add and remove elements without page refresh.<br>Data types are specified in the fields and nodes "}
                 ]
                }
            ]
        },    
        GettingStarted:{
            components:[{display:"fieldset",
                         DOM:"right",
                         id:"Blurb",
                         class:["col-sm-12","col-md-10","col-lg-8"],
                         components:[
                             {node:"heading",size:"h1",text:"Getting Started"},
                             {node:"heading",size:"h2", text: "Download and install"},
                             {node:"paragraph", text:"Using node package manager"},
                             {node:"code",text:"npm install apoco"},
                             {node: "paragraph", text:" or from github <br>"},
                             {node:"anchor",href:"https://github.com/snorkelferret/apoco", text:"apoco at github"},
                             {node:"paragraph", text:"<br>Then add to your html in a script tag.<br>  src=' mypath/apoco.js'"},
                             {node: "heading",size:"h2",text:"Add an Apoco component"},
                             {node:"paragraph",text:"To add an individual standalone Apoco component, just call the creator<br> For exmaple <br>"},
                             {node:"code",text: "let myDisplay = Apoco.display.form({id:'MyId',components:[{node:'heading',size:'h2',text:'example'},{field:'input',name:'intField',type:'integer',value:2}]});"},
                             {node:"paragraph",text:"This call creates a div which contains a form element with two children, a heading and an input element.<br> To add the element to the DOM <br>"},
                             {node:"code",text:"existingElement.appendChild(myDisplay.getElement());"},
                             {node:"paragraph",text:"where 'existingElement' is an HTML element<br> You can then use setter and getter methods like this:-"},
                             {node:"code", text:"myDisplay['intField'].setValue(3);"},
                             {node:"paragraph",text: "and get a value..."},
                             {node:"code", text:"let val=myDisplay['intField'].getValue();"},
                             {node:"paragraph", text: "which returns 3<br> You can use any of the methods in a similar way - see display man pages"},
                             {node:"heading",size:"h2", text:"Making Panels with JSON"},
                             {node:"paragraph", text:"Alternatively you can specifiy the Panel(s) with JSON, typically kept in a file called views.js<br> For Example: the views.js file contains the following, which was used to create this page ( truncated for brevity)"},
                             {node:"code",text:`
UI.Panels={ <br>  
` + UI.Controls.mkSpaces(2) +`Tabs:{ <br>
` + UI.Controls.mkSpaces(4) + `components:[ <br>
` + UI.Controls.mkSpaces(6) + `{display: "tabs", <br>
` + UI.Controls.mkSpaces(6) + `DOM: "mainNavbar", <br>
` + UI.Controls.mkSpaces(6) + `id: "Tabs", <br> 
` + UI.Controls.mkSpaces(6) + `selected: "About", <br>
` + UI.Controls.mkSpaces(6) + `components:[ <br>
` + UI.Controls.mkSpaces(8) +`{name: "About",label: "About",<br>
` + UI.Controls.mkSpaces(8) +`action:UI.Controls.setTab}, <br>
` + UI.Controls.mkSpaces(8) +`{name: "GettingStarted",label: "Get started",<br>
` + UI.Controls.mkSpaces(8) +`action: UI.Controls.setTab}, <br>
` + UI.Controls.mkSpaces(8) +`{name: "type",label: "Types",<br>
` + UI.Controls.mkSpaces(8) +`action:UI.Controls.setTab}, <br>
` + UI.Controls.mkSpaces(8) +`{name: "field",label: "Fields",<br>
` + UI.Controls.mkSpaces(8) +`action:UI.Controls.setTab}, <br>
` + UI.Controls.mkSpaces(8) +`{name: "node",label: "Nodes",<br>
` + UI.Controls.mkSpaces(8) +`action:UI.Controls.setTab} <br>
` + UI.Controls.mkSpaces(8) +`// etc <br>
` + UI.Controls.mkSpaces(6) + `] <br>
` + UI.Controls.mkSpaces(6) +`} <br>
` + UI.Controls.mkSpaces(4) + `] <br>
` + UI.Controls.mkSpaces(2) + `}, <br>
` + UI.Controls.mkSpaces(2) + ` GettingStarted:{<br>  
` + UI.Controls.mkSpaces(4) + ` components:[ <br>
` + UI.Controls.mkSpaces(6) + ` {display:"fieldset", <br> 
` + UI.Controls.mkSpaces(6) + ` DOM:"right", <br>
` + UI.Controls.mkSpaces(6) + `id:"Blurb", <br>
` + UI.Controls.mkSpaces(6) + `class:["col-sm-12","col-md-10","col-lg-8"],<br>
` + UI.Controls.mkSpaces(6) + `components:[ <br>
` + UI.Controls.mkSpaces(8) +`{node:"heading",size:"h1",text:"Getting Started"}, <br>
` + UI.Controls.mkSpaces(8) +`{node:"heading",size:"h2", text: "Download and install"},<br>
` + UI.Controls.mkSpaces(8) +`{node:"paragraph", text:"Using node package manager"}, <br>
` + UI.Controls.mkSpaces(8) +`{node:"code",text:"npm install apoco"} <br>
` + UI.Controls.mkSpaces(4) +` ]}  <br>
` + UI.Controls.mkSpaces(4) +` // add another display here <br>
` + UI.Controls.mkSpaces(4) +` ] <br>
` + UI.Controls.mkSpaces(2) +` // add another Panel here <br>
};`

                             },
                             {node:"paragraph", text:"To build the panels, use"},
                             {node:"code",text:"Apoco.start(['Tabs','GettingStarted']);"},
                             {node:"paragraph", text:"for this method to work, the object must be named UI.Panels <br> or you can use"},
                             {node:"code",text:"let myPanel=Apoco.Panel.add(UI.Panels.GettingStarted);"},
                             {node:"paragraph",text:"which adds just the 'GettingStarted Panel' <br>  P.S Use the debugger to look at the views.js file to see the whole specification, or if you have downloaded the package look in downloadDir/apoco/config/views.js, where you can also find the other config files for this manual. controls.js and data.js " },
                             {node:"heading",size:'h2',text:"Selecting Components"},
                             {node:"paragraph",text:"Once a components has been added initialised (not necessarily added to the DOM), it can be accessed like so;"},
                             {node:"code", text:"var aTab=Apoco.Panel.get('Tabs').getChild('Tabs').getChild('About');"},
                             {node:"paragraph",text:"The object returns is the tab called About, methods can then be used, e.g"},
                             {node:"code",text:"var el=aTab.element"},
                             {node:"paragraph", text:"This is the HTMLElement - in this case LI"}
                             
                             
                         ]}
                       ]
        },
        type:{
            components:[
                {display:"menu",
                 DOM: "left",
                 id: "typeMenu",
                 class:["well"],
                 heading:"Types",
                 components:UI.Controls.mkMenu("type")
                },
                { display: "fieldset",
                  id:"Blurb",
                  DOM: "right",
                  components:UI.Controls.mkMainEntry("type")
                }
            ]
        },
        node:{
            components:[ {display:"menu",
                          DOM: "left",
                          id: "nodeMenu",
                          class:["well"],
                          heading:"Nodes",
                          components: UI.Controls.mkMenu("node")
                         },
                         { display: "fieldset",
                           id:"Blurb",
                           DOM: "right",
                           components:UI.Controls.mkMainEntry("node")
                         }
                       ]
        },
        field: {
            components:[ {display:"menu",
                          DOM: "left",
                          id: "fieldMenu",
                          class:["well"],
                          heading:"Fields",
                          components: UI.Controls.mkMenu("field")
                         },
                          { display: "fieldset",
                            id:"Blurb",
                            DOM: "right",
                            components:UI.Controls.mkMainEntry("field")
                          }
                       ]
        },
        display: {
            components:[ {display:"menu",
                          DOM: "left",
                          id: "displayMenu",
                          class:["well"],
                          heading:"Displays",
                          components: UI.Controls.mkMenu("display")
                         },
                          { display: "fieldset",
                            id:"Blurb",
                            DOM: "right",
                            components:UI.Controls.mkMainEntry("display")
                          }
                       ]
        },
        Panel: {
            components:[ {display:"menu",
                          DOM: "left",
                          id: "PanelMenu",
                          class:["well"],
                          heading:"Panel Methods",
                          components: UI.Controls.mkMenu("Panel")
                         },
                         { display: "fieldset",
                            id:"Blurb",
                            DOM: "right",
                            components:UI.Controls.mkMainEntry("Panel")
                          }
                       ]
        },
        Window:{
            components:[ {display:"menu",
                          DOM: "left",
                          id: "WindowMenu",
                          class:["well"],
                          heading:"Windows",
                          components: UI.Controls.mkMenu("Window")
                         },
                         { display: "fieldset",
                           id:"Blurb",
                           DOM: "right",
                           components:[
                               {node: "heading",size:"h1",text: "Window"},
                               {node:"paragraph",text:"By default all Apoco Panels are in the current window, however you can create any number of windows all with their own Panels"},
                               {node:"heading",size:"h3",text:"JSON syntax"},
                               {node:"code",text:"MyPanel:{window:{url:'stuff.html',name:'my_win'},components: []}"},
                               {node:"heading",size:"h3",text:"Syntax"},
                               {node:"code",text:"let myPanel=Apoco.Panel(name:'MyPanel',<br> window:{url:'stuff.html,name:'mywindow'},<br>components:[])"}
                           ]
                         }
                       ]
        },
        IO:{
            components:[ {display:"menu",
                          DOM: "left",
                          id: "IOMenu",
                          class:["well"],
                          heading:"I0",
                          components: UI.Controls.mkMenu("IO")
                         },
                          { display: "fieldset",
                            id:"Blurb",
                            DOM: "right",
                            components:[
                                {node: "heading",size:"h1",text: "Input/Output"},
                                {node: "paragraph",text: "IO is usually controlled through the action function e.g"},
                                {node: "code", text: "{ node: 'button', <br>" + UI.Controls.mkSpaces(1) + " name: 'my_button',<br> " + UI.Controls.mkSpaces(1) + "action: function(that){ <br> " + UI.Controls.mkSpaces(4) + "  var data=get_data(); <br> " + UI.Controls.mkSpaces(4) + "Apoco.IO.webSocket({},['logon',{user: data.user,password: data.password}]);<br> " + UI.Controls.mkSpaces(2) + "}<br>};</code>"},
                                {node:"paragraph",text:"Or set up publish/listen in the initialisation of a field or display e.g <br> <br> <code> var tabs=Apoco.display['tabs']({id:'myTabs',DOM:'Content',tabs:[{name:'tab1'}],<br> " + UI.Controls.mkSpaces(16) + "listen:[{name:'mySignal',<br> " + UI.Controls.mkSpaces(22) + "action:function(that,data){<br>" + UI.Controls.mkSpaces(26) + " that.addTab({name: data}); <br> " + UI.Controls.mkSpaces(22) + "  } <br> "+ UI.Controls.mkSpaces(20) + "}]    <br> " + UI.Controls.mkSpaces(16) + "}); </code>"}
                                
                            ]
                          }
                       ] 
        }, 
        popup:{
             components:[ {display:"menu",
                           DOM: "left",
                           id: "popupMenu",
                           class:["well"],
                           heading:"popup",
                           components: UI.Controls.mkMenu("popup")
                          },
                          { display: "fieldset",
                            id:"Blurb",
                            DOM: "right",
                            components:[
                                {node: "heading",size:"h1",text: "popup"}
                            ]
                          }
                       ]
        },
        Utils:{
            components:[ {display:"menu",
                          DOM: "left",
                          id: "UtilsMenu",
                          class:["well"],
                          heading:"Utils Methods",
                          components: UI.Controls.mkMenu("Utils")
                         },
                         { display: "fieldset",
                           id:"Blurb",
                           DOM: "right",
                           components:[
                               {node: "heading",size:"h1",text: "Utils"},
                               {node:"paragraph",text:"Miscellaneous collection of functions"}
                           ]
                         }
                       ]
        },
        Examples:{
            components:[ {display:"menu",
                          DOM: "left",
                          id: "ExamplesMenu",
                          class:["well"],
                          heading:"Examples",
                          components: UI.Controls.mkMenu("Examples")
                         },
                         { display: "fieldset",
                           id:"Blurb",
                           DOM: "right",
                           components:[
                               {node: "heading",size:"h1",text: "Examples"}
                           ]
                         }
                       ]
        }, 
        Redirects:{
            components:[
                { display:"fieldset",
                  DOM: "Content",
                  id: "notFound",
                  hidden: true,
                  class:["hero","text-center"],
                  components:[
                      {node: "heading",size: "h1", text:"404 Page not found",childClass:"masked"},
                      {node: "heading", size: "h2",text: "Oops! Something has gone wrong"}
                  ]
                }
            ]
        }
    };
})();
