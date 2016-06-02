global.Harvey=require('../declare').Harvey;
global.UI=require('../declare').UI;

require("../index.js");
//var UI={};
;(function(){
    'use strict';
    // Business Logic
    

     // fields are required (i.e not nullable) by default
    UI.Objects={  // Objects are things with key values from the server
	Blotter:[
	    {name: "stock", type: "string",  editable: false},
            {name: "bid",type: "float",step: 0.1, precision: 3,editable: false, required: false},
            {name: "offer",type: "float",step: 0.1, precision: 3,editable: false, required: false},
            {name: "client_bid",type:"integer",editable: false,required: false},
  	    {name: "volume",type: "integerArray",size:2, delimiter: "X", editable: false,required: false},
	    {name: "client_offer",type:"integer",editable: false,required: false},
	    {name: "maturity",type: "date",editable: false,display:true},
	    {name: "subclass",type:"integer",editable: false,display: false}
	],
        Broker:[
	    {name: "client",type: "integer",label: "client", editable: true},
	    {name: "stock",type: "token", label: "stock",editable: true},
	    {name: "price", type: "float", step: 0.1, precision: 3, label: "price",editable: true},
	    {name: "volume", type: "integer", label: "volume",editable: true},
	    {name: "aggro", type: "integer", label: "aggro",editable: true}/*,
	    {name: "AorN", type: "boolean", label: "A or N", editable: true},
	    {name: "indic", type: "boolean", label: "indic", editable: true} */
	],
	RoboBroker:[
	    {name: "meanArrivalTime", type: "integer", label: "mean arrival time (ms)", editable: true},
	    {name: "newPriceWeight", type: "integer", label: "new price weight", editable: true},
	    {name: "newTradeWeight", type: "integer", label: "new trade weight", editable: true},
	    {name: "nullEventWeight", type: "integer", label: "null event weight", editable: true},
	    {name: "meanPriceLifetime", type: "integer", label: "mean price lifetime", editable: true}
	]

    };

   UI.Login={ DOM: "Content",   // displayObject(s) do not get registered with harvey
 	      id: "Login",
	      object: "Login",
 	      display: "form",
	      label: "Malaya Login",
              draggable: true,
              components: [{node: "paragraph",text: "Welcome to Malaya"},
                           {name: "user", label: "User", type: "string", editable: true,required: true},
	                   {name: "password", label: "Password", type: "password", editable: true, required: true}
	                  ],
              buttons: [ {name: "login", label: "Login",
                          action: function(that){
                              console.log("login post data someday");
                          }
                         }]
            };

    UI.Panels={   //  PanelObject(s) kept in memory by Harvey
        
	Blotter:{ name: "Blotter",
		  //   listen: [{name:"create_window",action: "post"},{name:"stock_selection",action:"post"}]
		  // window: {url: "new_window.html", opts: "toolbar=0,frame=0,resizable=1, width=800, height=500, min_width=400,min_height=200,max_width=800,max_height=600,location=0"}
	
		  components: [
		      {display: "tabs",
		       DOM: "Head",
		       id: "TopTab",
                       selected: "all",
		       tabs:[  { name:"all", label: "all",
				 action: function(that){/*that.parent.getChild("Blotter").showGrid();*/}},
			       { name:"custom1",label: "custom1", action: "" },
			       { name:"custom2",label: "custom2", action: "" },
			       { name: "custom3",label: "custom3", action: "" }
			    ]
		      },
		      {display: "grid",
		       object: "Blotter",
		       DOM: "Content",
		       id: "Blotter",
		       /* publish: [ {name: "dfjh", //simple publish
			              data: "Hi"
				      }], */
		       publish:[{
			   name: "stockSelection",
			   action: function(that){
			       // that.element.find("[name='stock']").on("click",function(e){
                               that.element.querySelector("div.grid_content").addEventListener("click",function(e){
                                   if(e.target.name === "stock"){
				       console.log("got a click on stock");
				       e.stopPropagation();
				       e.preventDefault();
				       // var c=$(this).data("harvey").context;
                                       
				       // var m=c.getValue();
                                       var row=that.getRowFromElement(e.target);
                                       Harvey.IO.dispatch("stockSelection",row);
                                   }
			       },false);
			   }
		       }],
		       listen: [{name:"price",
				 action: function(that,data){ that.updateRow(data);}
				}],
		       userSortable: false,    // this must be false if sortOrder is used
		       sortOrder: ["maturity","stock"],
		       uniqueKey: ["stock"],
		       groupBy: "subclass",
		       cols: UI.Objects.Blotter,
                       rows:data.rows
		     /*  action: function(that){
			   that.rows=data.rows; //Harvey.IO.Server({get:that.object});
			   if(that.rows){
			       if(!Harvey.checkType["array"](that.rows)){
				   throw new Error("Blotter action rows is not an array");
			       }
			   }
		       } */
		      },
		      {display: "tabs",
		       id: "BottomTabs",
		       DOM: "Content",
                       selected: "all",
		       dependsOn: "Blotter",
		       action: function(that){
			   function mk_tabs(b,that){
			       var g=b.getGrid();
			       for(var i in g){
				   console.log("this is grid " + g[i].name);
				   that.tabs.push({name: g[i].name,label:g[i].name,
						   action: function(that,index){
						       var n=that.tabs[index].name;
                                                       that.selected=n;
                                                       console.log("clicked tab " + n);
						       b.showGrid(n);}});
			       }
			   }
			   console.log("Bottom tabs action is here");
			   var b=that.parent.findChild({key:"Blotter"}); // depends on Blotter existing!!!!!
			   if(b){
			       console.log("Bottom tabs found parent Blotter");
			       mk_tabs(b,that);
			       return true;
			   }
			   return false;
		      }, 
                       
		       tabs:[{ name: "all",label: "All",
			       action: function(that,index){
                                   if(!that.parent){
                                       throw new Error("tabs parent is null");
                                   }
				   that.parent.findChild({key:"Blotter"}).showGrid("all");
                                   that.selected=that.tabs[index].name;
			       }},
                             {name:"conventionals",label:"Conventionals",
                              action: function(that,index){
                                  var n=that.tabs[index].name;
                                  that.selected=n;
                                  var b=that.parent.findChild({key:"Blotter"});
                                  for(var i=0;i<4;i++){
                                      b.showGrid(i);
                                  }
                                  
                              }},
                             {name:"linkers",label:"Linkers",
                              action: function(that,index){
                                  var n=that.tabs[index].name;
                                  that.selected=n;
                                  var b=that.parent.findChild({key:"Blotter"});
                                  for(var i=4;i<6;i++){
                                      b.showGrid(i);
                                  }
                              }},
                             {name:"i_swaps",label:"I swaps",
                              action: function(that,index){
                                  var n=that.tabs[index].name;
                                  that.selected=n;
                                  var b=that.parent.findChild({key:"Blotter"});
                                  for(var i=6;i<10;i++){
                                      b.showGrid(i);
                                  }
                              }},
                             {name:"swaps",label:"Swaps",
                              action: function(that,index){
                                  var n=that.tabs[index].name;
                                  that.selected=n;
                                  var b=that.parent.findChild({key:"Blotter"});
                                  for(var i=11;i<13;i++){
                                      b.showGrid(i);
                                  }
                              }},
                            ]
		      },

		      {display: "fieldset",
		       DOM: "controls",
		       id: "Active",
		       components:[ { field: "checkBox",label: "active",name: "active",
				  action: function(that){ console.log("active is here");}},
			      ]
		      }
                  ]
                },
        Controls:{
            name: "Controls",
            components: [
		{display: "fieldset",
		 DOM: "controls",
		 id: "Create",
		 components:[{ field: "select", name: "selection_dropdown", options: [ "Blotter","Broker","Bigfig","Auction-control","Trades","robo-broker","knock-down-ginger","auction"]},
                             { node: "button", name: "create_window",text: "new",
			       action: function(that){
				   var h=that.parent.getChild("selection_dropdown").getValue();
                                 
                                   if(Harvey.Panel.inList(h) === null){
                                       var p=Harvey.Panel.add(h);
                                   }
                                   else if(h === "Blotter"){
                                       // add another Blotter in a new window
                                       var w={name: "Blotter",url:"dowgate_form.html",opts:{width: 660}};
                                       Harvey.Panel.clone("Blotter",w);
                                   }
			       }},
                             { node: "button",name: "logout",text: "logout",
                               action: function(that){
                                   Harvey.stop();
                               }
                             }]
                }
	    ]
	},
    	Broker:{
	    name: "Broker",
            window:{name: "DowgateBroker",url:"dowgate_form.html",opts:{width: 440,height:260}}, 
	    components: [
		{ display: "fieldset",
                 // hidden: true,
		  id: "Broker",
		  DOM: "Content",
		  object: "Broker",
		  label: "Broker Window",
		  //draggable: true,
		  components: UI.Objects.Broker,
		  listen: [{name:"stockSelection",
			    action: function(that,row){
                                console.log("got data for stockSelection");
                                that.element.show();
                                for(var i=0; i<row.length; i++){
                                    console.log("form listener got row " + row[i].name);
                                    for(var j=0;j<that.fields.length;j++){
                                        console.log("field is " + that.fields[j].name);
                                        if(row[i].name != "volume" && row[i].name === that.fields[j].name){
                                            if(row[i].value !== null){
                                                console.log("Trying to set Value for " + row[i].name + " value " + row[i].value );
                                                if(!that.fields[j].setValue){
                                                    throw new Error("no method setValue");
                                                }
                                                that.fields[j].setValue(row[i].value);
                                                console.log("set value " + row[i].value);
                                            }
                                        }       
                                    }
                                }
                                that.parent.window.focus(); 
			    }
                           }]
	        },
                { display: "fieldset",
                //  hidden: true,
                  id:"Bid",
                  DOM: "Dleft",
                  components:[ {node: "button",name: "bid",text: "bid"},
                               {node: "button",name: "deleteBid",text: "delete bid"},
                               {node: "button",name: "hit",text: "hit"},
                               {field: "checkBox",name: "indic",type: "boolean",label: "indic",editable: true }
                             ]
                },
                { display: "fieldset",
                //  hidden: true,
                  id:"Offer",
                  DOM: "Dright",
                  components:[ {node: "button",name: "offer",text: "offer"},
                               {node: "button",name: "deleteOffer",text: "delete offer"},
                               {node: "button",name: "take",text: "take"}
                             ]
                },
                { display: "fieldset",
                //  hidden: true,
                  id:"Other",
                  DOM: "Dmiddle",
                  components:[ {node: "button",name: "clear",text: "clear"},
                               {field: "checkBox",name: "AorN",type: "boolean",label: "A or N",editable: true },        
                               {node: "button",name: "endTrade",text: "end trade"},
                               {node: "button",name:"error",text:"ERROR"}
                             ]
                }
            ]
        }
	/*RoboBroker:{
		} */
    };
  


    UI.start=["Blotter","Controls"];
    

})();


