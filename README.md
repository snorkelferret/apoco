
![] (https://snorkelferret.github.io/css/images/apoco02.png)

##  Javascript web framework
Apoco is a set of modules that can be used to form a 'Single Page Application' [SPA](https://en.wikipedia.org/wiki/Single-page_application) or used as a page or part of a page.It is a real time web framework, with automatic two way synchronisation between browser and server content.
The components can be used together or individually.Apoco employs a 'sort of' shabow dom, in so far as the DOM elements are kept in memory and accessed using getters and setters.
More in the spirit of a conventional C type window system. Writing html is not required, as Apoco creates all the HTML. Apoco can use an MVC pattern, where views are kept as a JSON (like) object, controls in a separate javascript file, and the model can come from another JSON object or the server or a combination of both. For larger and more complex projects an additional build.js file can be deployed, to construct more complex objects 
Apoco supports both REST and websockets. 

![] (https://snorkelferret.github.io/css/images/treeStruct.png)

Apoco is arranged hierarchically starting with windows and ending with nodes and/or fields. It supports multiple windows. Apoco is very fast, as it only updates specific element values sent by the server and doesn't need to update the page. Ypu can also add and remove elements without page refresh.
Data types are specified in the fields and nodes 

[Online manual](https://snorkelferret.github.io)

You don't have to use the hierarchy, any of the components can be used independently, e.g you can use the display templates without using the Panel, or fields without using displays, but you can't use displays without specifying the appropriate field(s)

You don't have to use Apoco to make an SPA it will happily make the components for any page.

All Apoco components which provide user input have methods to get set and reset the values.
Thereby the integrity of the data can be guaranteed, since the journalled value can only be set
by a call to setValue.


Apoco panels are generally defined in a config javascript file.,
for example,

```javascript
if(!UI){
   var UI={};
}

UI.Panels={
    MyPanel:{ components:[{ display: 'tabs',
                            DOM: 'Main',
                            id: 'Tabs',
                            tabs:[{name: 'someName',label: 'Some Name'},
                                  {name:'another', label:'Another'}
                                  ]
                            },
                            {display:'fieldset',
                            DOM:'right',
                            id:'fieldsetDisplay',
                            components:[{node:'heading',size:'h4',text:'Test'},
                                        {field:'select',name:'select_test',options:['one','two','three']}
                                        ]
                            }
                            // add another display template here
                          ]
            },
  AnotherPanel:{ components:[ {display:"form",
                               DOM:"Main",
                               id:"MyForm",
                               onSubmit:function(submit_event,that){ // do something},
                               components:[{name:"email",type:"email"},
                                           {name:"name",type:"string"},
                                           {submit:true,name:"submit",value:"Submit"}
                                           
                                        ]
                               }
                               // add other display components
                         ]

              }
 // add another panel here
};

 UI.start=["MyPanel","AnotherPanel"];

```
and so your html file might look like this

```html
<!DOCTYPE html>
<html>
<head>
 <script src="js/apoco.js"></script>
 <script src="js/config.js"></script> <!-- contains the UI.Panel defs above -->
</head>

  <body>
 <script>

     window.onload=function(){
          Apoco.start(UI.start);
      };

    </script>
    <div id="Main">  <!-- this is the parent of the elements created by Apoco -->
       <div id="right"> <!-- this is another root element used by the UI.Panels above -->
       </div>
    </div>
  </body>
</html>
```
However you might just as easily add a single Panel with
Apoco.Panel.add(some_panel_object);



Apoco is primarily a backend workhorse where there is a lot of realtime updating required,
however,there are some "shop front" Websites using apoco.

[Perluceo](http://www.perluceo.com)
[MyCleverIdea](https://www.mycleveridea.com)

(eating out own dogfood)
[Online manual](https://snorkelferret.github.io)
