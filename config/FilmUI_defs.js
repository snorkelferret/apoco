var UI={};
;(function($){
    'use strict';

    UI.webSocketURL="/data/websocket";

    UI.AddValues=function(){
        var that=this;
        this.listen=[{name:"setup",
                      action:function(that,data){
                          //console.log(" listen to setup got " + JSON.stringify(data));
                          for(var k in data){
                              var p=$("#Clapper").find("h1[name='" + k +  "']");
                              if(p && p.length>0){
                                  //console.log("Found element " + k);
                                  if(k== "roll"){
                                      var cam=$("#Clapper").find("h1[name='camera']").text();
                                      p.html((data[k] + cam));
                                  }
                                  else{
                                      p.html(data[k]);
                                  }
                              }
                          }

                          var w=$("#QRcode");
                          if(!w){
                              throw new Error("Could not find QRCode parent");
                          }
                          w.empty();
                          var yy=("/qr/"+ data.code);
                          //console.log("got url " + yy);
                          
                          var n=Harvey.node({node:"image",width: 600, height: 600,url:(yy)},w);
                          if(!n){
                              throw new Error("could not create image");
                          }
                          //set the go button un disabled
                          $("div.buttons [name = 'go']").prop("disabled",false);
                      }},
                     {name: "clapperboard",
                      action: function(that,data){
                          //console.log(" listen to clapperboard  got " + JSON.stringify(data));
                          var p=$("#Clapper").find("h1[name='camera']");
                          if(p && p.length>0){
                              p.html(data["camera"]);
                          }
                      }},
                     {name:"avsync",
                      action: function(that,data){ //do the swap between slate and qrcode
                          //console.log(" listen to avsync is here");
                          var clapper=false;
                          if($("#selectCamera").length>0){
                              $("#selectCamera").css("display","none");
                              clapper=true;
                          }
                          if(clapper === true){
                              var t;
                              var swap=function(){
                                  //console.log("swapping images");
                                  Harvey.beep.beep(data.code);
                                  $("#Clapper").css("display","none");
                                  $("#QRcode").css("display","block");
                                  window.clearTimeout(t);
                              };
                              t=window.setTimeout(function(){
                                  swap();
                              },3000);
                              var tt;
                              var swap_back=function swap_back(){
                                  //console.log("swapping back");
                                  $("#Clapper").css("display","block");
                                  $("#QRcode").css("display","none");
                                  $("#selectCamera").css("display","block"); 
                                  window.clearTimeout(tt);
                              };
                              
                              tt=window.setTimeout(function(){
                                  swap_back();
                              },8000);
                          }
                          else{  // disable buttons on master controls
                              var tt;
                              $("div.buttons").find("button").prop("disabled",true);
                              tt=window.setTimeout(function(){
                                  //console.log("removing timeout on buttons");
                                  $("div.buttons").find("button").prop("disabled",false);
                                  window.clearTimeout(tt);
                              },8000);
                          }
                      }}
                    ];
        Harvey.IO.listen(this);
        
    };
    
    
    // Business Logic
    UI.Login={ DOM: "main",   // displayObject(s) do not get registered with harvey
 	       id: "Login",
	       object: "Login",
 	       display: "form",
	       label: "Clapper Login",
               draggable: true,
               listen: [{name:"start",action: function(that,data){
                   //console.log("listener got message start");
                   if(data.roles){
                       if(data.roles.director){
                           //console.log("got role director");
                           Harvey.Panel.UIStart(["Controls","Tabs"]);
                           //$("#Clapper").css("display","table");
                       } 
                      else if(data.roles.clapperboard){
                           $("#Clapper").css("display","table");
                           Harvey.Panel.UIStart(["SelectCamera"]);
                       }
                   }
                   that.delete();
               }}],
               components: [{node: "paragraph",text: "Welcome to Clapper"},
                            {name: "user", label: "User",type: "string", editable: true,required: true},
	                    {name: "password", label: "Password",type: "password", editable: true, required: true}
	                   ],
               buttons: [ {name: "login", label: "Login", text: "Login",
                           action: function(that){
                               //console.log("got a click on login");
                               var p=that.getChild("password").getValue();
                               var u=that.getChild("user").getValue();
                               if(p && u){
                                   //console.log("sending login details");
                                   Harvey.IO.webSocket({},["logon",{user: u,password: p}]);

                               }
                           }
                          }]
             };
    
    UI.Panels={
        Tabs:{ name:"Tabs",
                   components:[
                       { display:"tabs",
                         DOM: "Controls",
                         id:"tabs",
                         selected: "Controls",
                         tabs:[
                             {name: "Controls",label: "Controls",action:function(that,index){
                                 Harvey.Panel.show("Controls");
                              //   Harvey.Panel.hide("Notes");
                                 $("#Clapper").css("display","none");
                                 $("#QRcode").css("display","none");
                                 that.selected=that.tabs[index].name;
                             }},
                             {name: "Slate",label:"Slate",action:function(that,index){
                                 var n=$("#Clapper");
                                 Harvey.Panel.hide("Controls");
                               //  Harvey.Panel.hide("Notes");
                                 that.selected=that.tabs[index].name;
                                 n.css("display","block");
                             }}//,
                          //   {name: "Notes",label: "Notes",action: function(that,index){
                           //      $("#Clapper").css("display","none");
                           //      $("#QRcode").css("display","none");
                          //       Harvey.Panel.hide("Controls");
                               //  Harvey.Panel.show("Notes");
                               //  $("#Notes").css("display","block");
                         //        that.selected=that.tabs[index].name;
                        //     }}
                             
                         ]
                       }
                   ]
        },
        Controls:{ name:"Controls",
                   components:[
                    { display:"fieldset",
                      DOM: "main",
                      draggable: true,
                      id: "details",
                      action:function(){
                          $("#Clapper").css("display","none");  
                      },
                      components:[
                          {name: "scene",type: "alphaNum",label: "Scene",editable: true,required:true},
                          {name: "slate",type:"alphaNum",label: "Slate",editable: true,required: true},
                          {name: "take",type:"integer",label: "Take",editable: true,required: true},
                          //{name: "Roll",type:"alphaNum",label: "Roll",editable: false},
                          {name: "camera",field:"RadioButtonSetField",required: true,
                           multiple_selection: true,labels:["A","B","C","D"],label: "Cam",editable: true},
                          {name: "notes",editable: true,field: "TextAreaField",label: "Notes"},
                          {node: "button",name:"send",class:"buttons",text: "Send",action:function(that){
                              var j=that.parent.getJSON();
                              if(j=== null){
                                  Harvey.popup.dialog("Error","Must fill in all the fields");
                                  return;
                              }
                              var c=[];
                              for(var i=0;i<j.camera.length;i++){
                                  for(var k in j.camera[i]){
                                      if(j.camera[i][k]===true){
                                          c.push(k);
                                      }
                                  }
                              }
                              j.camera=c;
                              var s=["setup",j];
                              
                              Harvey.IO.webSocket({},s);
                          }},
                          {node: "button",name:"go",disabled: true,class:"buttons",text: "Go",action:function(that){
                              var s=["avsync",{}];
                              Harvey.IO.webSocket({},s);
                          }}
                      ]
                    },
       
                   ]
                 },
   
        SelectCamera:{ name:"SelectCamera",
                       components:[ {display: "fieldset",
                                     DOM: "main",
                                     id: "selectCamera",
                                     components:[ {name: "Camera",field:"SelectField",options:["A","B","C","D"],
                                                   label: "Choose the camera"},
                                                  {name: "setCamera",node:"button",text: "OK",
                                                   action: function(that){
                                                       var p=that.parent.getChild("Camera").getValue();
                                                       var s=["clapperboard",{camera: p}];
                                                       Harvey.IO.webSocket({},s);
                                                   }}
                                                ]
                                    }
                                  ]
                     }
    };

    //UI.start=["Controls","Tabs"];
})(jQuery);
