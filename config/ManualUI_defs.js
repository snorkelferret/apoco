// WARNING this script contains evil eval !!!!!!
global.Harvey=require('../declare').Harvey;
global.UI=require('../declare').UI;
//global.jQuery=require('jquery');

require("../index.js");

;(function(){
    "use strict";
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    var globalEval=function( code ) {
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
    };
    
    UI.URL="/home/val";
    UI.webSocketURL="home/val";
    
    var getAType={
        integer:14,
        positiveInteger: 10,
        negativeInteger: -10,
        date: "20160623",
        time: 1100,
        string: "SomeString",
        token: "hr-208f",
        alphaNum: "Au8hV",
        image: "images/animage.jpg",
        currency: "£10.00",
        label: "Label",
        email: "info@perluceo.com",
        float: 20.458,
        integerArray: [5,4,6,8,1],
        PhoneNumber: "02073522023",
        floatArray: [1.456,1.59900,7.89,1044.55],
        boolean: true,
        text: "Some text",
        stringArray: ["some","string","array"],
        imageArray: [{src:"css/images/alchemist1.jpg",url:"",width: "64px",height:"64px",title:"alchemist"},
                     {src:"css/images/alchemist2.jpg",url:"",width: "64px",height:"64px",title:"another alchemist" },
                     {src:"css/images/rabbit_img1.jpg",url:"",title:"A lovely rabbit"},
                     {src:"css/images/alien1.jpg",url:"",title:"What is it?"}],
        password: "MyBadPassword1",
        array: ["One","Two","Three","Four"],
        path: "css/images/rabbit_img1.jpg",
        size: "h3",
        href: "https://jquery.com",
        target: "_blank",
        objectArray:[{label:"value",description: "describe value"},{label:"another_value",descriptions:["one","two","three"]}]
    };
    
    var HThings={Fields:[],
                 Displays:[],
                 Nodes:[],
                 Popups:[],
                 Types:[],
                 IO:[],
                 Panels:[],
                 PanelComponents:[],
                 Utils:[]
                };
    function mkArrays(){
        var thing;
        for(var k in HThings){
           // console.log("k is " + k);
            switch(k){
            case "Fields":
                thing=Harvey.field;
                break;
            case "Displays":
                thing=Harvey.display;
                break;
            case "Nodes":
                thing=Harvey.node("node_list");
                break;
            case "Popups":
                thing=Harvey.popup;
                break;
            case "Types":
                thing= Harvey.dbToHtml;
                break;
            case "IO":
                thing=Harvey.IO;
                break;
            case "Panels":
                thing=Harvey.Panel;
                break;
            case "PanelComponents":
                thing=Harvey._panelComponents("methods");
                break;
            case "Utils":
                thing=Harvey.Utils;
                break;
            default:
                throw new Error("Don't know how to make " + k);
                return;
                
            }
            for(var n in thing){
               if(!n.startsWith("_")){
                   if(k === "Fields"){
                     //  console.log("+++++++++++++++++++++++++++++++got field " + n);
                       //  if(n.indexOf("Field")> -1){
                       if(n !== "exists"){  // method  not a field
                           HThings[k].push(n);
                       }
                      // }
                   }
                   else if(k==="Displays"){
                      // console.log("got display " + n);
                       if(n.indexOf("Methods")<= -1){
                           HThings[k].push(n);
                       }
                   }
                   else{
                       HThings[k].push(n);
                   }
               }
            }
            Harvey.sort(HThings[k],"string");
        }
        
    }
    mkArrays();
   
   
    var get_types=function(field){
        var f=[];
        for(var k in Harvey.dbToHtml){
            if(Harvey.dbToHtml[k].field == field){
                f.push(k);  
            }
        }
        return f;
    };
   
       
    var field_options={
        required:{name:{type: "string",description:"tag used in Field methods"}},
        common: {required:{type:"boolean",default: false,description:"Is the cell allowed to be blank"},
                 editable:{type:"boolean",default:true,description: "If false some fields become a StaticField"},
                 label:{type: "string",default: undefined,description:"added next to the input field"}
                },
        special:{
                 action:{type:"function",default: undefined,description:"Function fired on click on element"},
                 listen:{type:"objectArray",default:undefined },
                 publish:{type: "objectArray",default: undefined,description:""}
                },
        input: { options:{type:{type:"string",
                                     default:"string",
                                     parms:get_types("input"),
                                     dependsOn:{float:{min:{default: undefined},
                                                       max:{default: undefined},
                                                       step:{default: 0.01},
                                                       precision:{default: 2,description:"Number of places after the decimal point"}
                                                      },
                                                integer:{min:{default: undefined},
                                                       max:{default: undefined},
                                                       step:{default: 1}
                                                        },
                                                currency:{ ISOCurrencyCode:{default: "GBP"}
                                                         }
                                               }
                                    },
                               value:{type: "any",default: undefined, description:""}
                              },
                      description:""
                    },
        select:{ required:{ options:{type:"stringArray",
                                          default: undefined,
                                          description: ""}
                               },
                      options:{blank_option:{type:"boolean",
                                             default: false,
                                             description:""},
                               value:{type: "string",default: undefined,description: "An element from the options string Array"}
                              },
                      description:""
               },
        buttonSet:{required:{labels:{type:"stringArray"}},
                             options:{checkbox:{type:"boolean",
                                                          default: false},
                                      value:{type:"booleanArray"}},
                             description:""
                            },
        slider:{ options:{ min:{type:"integer",default: 1},
                                max:{type:"integer",default: 10},
                                value:{type: "integer",default: undefined}
                              },
                      description: "This is a wrapper for the jQuery slider, to access the jQuery object use var slider=my_slider_field.getFlement().find('slider'); Please use the Harvey setValue and getValue methods "
                    },
        numberArray:{ options:{type:{type:"string",
                                          default: "integerArray",
                                          params:get_types("numberArray")
                                         },
                                    value:{type:"any",default:undefined}
                                   },
                           description:""
                         },
        imageArray:{options:{value:{type:"imageArray",
                                         default: undefined,
                                         description: "key value javascript object"},
                                  thumbnails:{type:"boolean",default: true,description:"Display the images as thumbnails" },
                                  width:{type:"integer",default: 120,description:"width of the thumbnails"},
                                  height:{type:"integer",default: 90,description:"height of the thumbnails"}
                                 },
                         description:""
                        },
        float:{options:{precision:{type:"integer",default: 2,description:"Number of places after the decimal point" },
                             step:{type:"float",default: 0.1},
                             value:{type: "float",default: undefined}},
                    description:"Float field that aligns the decimal point"
                   },
        autoComplete:{options:{options:{type:"stringArray"},
                                    value:{type: "string",default: undefined}},
                           description: "This is a wrapper for the jQuery autoComplete field. To access the jQuery Object, use <br> <code> var auto_comp=ac.getInputElement();</code> <br>  Please use the Harvey getValue and setValue methods "
                          },
        checkBox:{ options:{ value:{type: "boolean",default: false}},
                        description: ""},
        date:{options:{value:{type:"any",default:undefined,params:["Date","string"] }},
                   description:"This is just a wrapper for the jQuery datepicker, to access the jQuery element use var jquery_dp=my_field.getInputElement().datepicker;"
                  },
        time:{options:{value:{type:"time",default:undefined,
                                   description:"A valid partial-time as defined in [RFC 3339]."}},
                   description:""
                  },
        static:{options:{value:{type:"any",params:["string","float","integer"]}},
                     description:""
                    },
        textArea:{options:{value:{type:"text",default: undefined}},
                       description:""
                      },
        stringArray:{options:{ length:{type:"integer",
                                            default: 4,
                                            description:" Max of value array and length"},
                                    value:{type:"stringArray",default: undefined}
                                  },
                          description:""
                         }
        
    };

    // fill in the type field where applicable - from Harvey.dbToHtml
    function mk_default_types(){
        for(var k in field_options){
            var p;
            // if(k.indexOf("Field")> -1){
            if(k!== "common" && k !== "special" && k !== "required"){
                var t=get_types(k);
                if(t && t.length > 0){
                    p=field_options[k].options;
                    if(p && !p["type"]){
                        p["type"]=new Object;
                        p["type"].type="string";
                        p["type"].default=t[0];
                        if(t.length > 1){
                            p["type"].params=t;
                        }
                    }
                }
            }
        }
    }
    mk_default_types();
    
    var Required=new Map;
    var Dependencies=new Map;
   
    
    var mkDefaultOptions=function(){
        var HFields=[];
        var Options={};
        var r=[],dpo=[];
        
        for(var k in field_options){
           // if(k.indexOf("Field")> -1){
            if(k!== "common" && k !== "special" && k !== "required"){
                HFields.push(k);
            }
        }
        
        for(var j=0;j<HFields.length; j++){
            var f=HFields[j];
            var d={};
            r.length=0;
            dpo.length=0;
            if(field_options.required){
                for(var n in field_options.required){
                    if(field_options.required[n].default && field_options.required[n].default !== undefined){
                        d[n]=field_options.required[n].default;
                    }
                    r.push(n);
                }
            }
            if(field_options.common){
                for(var n in field_options.common){
             //       console.log("making common default option " + n);
                    if(field_options.common[n].default !== undefined){
                        d[n]=field_options.common[n].default;
                        if(n === "required"){
               //             console.log("mkDefaultoptions setting required to " + d[n]);
                        }
                    }
                }
            }
            for(var k in field_options[f].options){
               // console.log("option is " + k);
                var ee=field_options[f].options[k].default;
                if(ee && ee !== undefined){
                    d[k]=ee;
                }
                if(field_options[f].options[k].dependsOn){
                    for(var n in field_options[f].options[k].dependsOn){
                        dpo.push(field_options[f].options[k].dependsOn[n]);
                    }
                }
            }
            for(var k in field_options[f].required){
               // console.log("Setting required for " + f + " with value " + k);
                r.push(k);
            }
            if(r.length>0){
      //          for(var t=0;t<r.length;t++){
        //            console.log("Field " + f  + " option " + r[t] + " is required ");   
          //      }
                Required.set(f,r);
                Dependencies.set(f,dpo);
            }
            Options[f]=d;
        }
        return Options;
    };

    var Options=mkDefaultOptions();
  /*  
    for(var k in Options){
        console.log("Field is " + k);
        console.log("with options " + JSON.stringify(Options[k]));
    }
    
 */    
  /*  
    var checkDefaultOptions=function(f,d){
        var p=$.extend({},Options[f],d);
        var r=Required.get(f);
        if(!r){ throw new Error("field " + f + "has not got any required parms");}
        for(var i=0;i<r.length;r++){
            if(p && !p[r[i]]){
                throw new Error("Field " + f + " requires " + r[i]);
            }
        }
        var dop=Dependencies.get(f);
        if(dop){
            for(var i=0;i<dop.length;i++){
                if(p[dop[i]]){
                    for(var k in dop[i]){
                        if(dop[i][k].default !== undefined){
                            p[k]= dop[i][k].default;
                        }
                    }
                }
            }
        }
        return p;
    };

*/
  
    
    var mkFieldOptionsList=function(Options,Required){
        var HFields=HThings.Fields;
        //var field_options=Harvey.field._getAllSettings;
        var t={};
        var mk_descriptions=function(obj,BO){
            var t={};
            for(var n in obj){
                t={};
                t.label=n;
                t.descriptions=new Array;
                for(var m in obj[n]){
                    t.descriptions.push((m + ":  " + obj[n][m] + " ")); 
                }
                BO.push(t);
            }
        };
        
        for(var i=0;i<HFields.length;i++){
            Options[i]=[];
            Required[i]=[];
            if(field_options.required){
                mk_descriptions(field_options.required,Required[i]);
            }
            if(field_options.common){
                mk_descriptions(field_options.common,Options[i]);
            }
            if(field_options.special){
                mk_descriptions(field_options.special,Options[i]);
            }
            if(field_options[HFields[i]]){
                if(field_options[HFields[i]].required){
                    mk_descriptions(field_options[HFields[i]].required,Required[i]);
                }
                if(field_options[HFields[i]].options){
                    mk_descriptions(field_options[HFields[i]].options,Options[i]);
                }
            }
        }
    };

   
    
    var mkFieldCommands=function(no_var_equals){
        var Commands=[];
        var k,v;
        var HFields=HThings.Fields;
  
        var field_desirable={
            autoComplete:["options"],
            static:["value"],
            stringArray:["value"],
            float:["value"],
            numberArray:["value"]
        };


       // Harvey.field._getAllSettings=field_options;
       // Harvey.field.getDefaultOptions=Options;
        
      //  var field_options=Harvey.field._getAllSettings;
        for(var i=0;i<HFields.length;i++){
            var c="";
            //console.log("Creating command for " + HFields[i]);
            //var c="var dataObject={name:'anyName', editable: true, field:'" + HFields[i] + "'";
            if(no_var_equals){
                c="{field:'" + HFields[i] + "'";
            }
            else{
                c="var dataObject={field:'" + HFields[i] + "'";
            }
            
            for(k in Options[HFields[i]]){
                c=c.concat("," + k + ":" + JSON.stringify(Options[HFields[i]][k]) );
            }
           
            //console.log(" c is " + c);
            // get the globally required opts
            v=field_options["required"];
            for(k in v){
              // console.log("GETTING REQUIRED");
                c=c.concat("," + k + ":" + JSON.stringify(getAType[v[k].type]));
            }
            // get the required for the specific field
            v=field_options[HFields[i]].required;
            for(k in v){
                c=c.concat("," + k + ":" + JSON.stringify(getAType[v[k].type]));
            }
            // add a label field
            c=c.concat(", label: 'A Label'");
       
            if(field_desirable[HFields[i]]){
                var fd=field_desirable[HFields[i]];
                for(var j=0;j<fd.length;j++){
                    var n=field_options[HFields[i]].options[fd[j]];
                    //console.log("desirable field " + fd[j] + " type " + n.type );
                    
                    if(n){
                        c=c.concat(","+ fd[j] + ":");
                      //  console.log("adding desirable field " + fd[j] + " with type " + n.type);
                        if(n.default !== undefined){
                        //    console.log("adding default " + n.default);
                            c=c.concat(n.default);
                        }
                        else if(n.type){
                            if(n.type === "any"){
                                if(field_options[HFields[i]].options["type"]){
                                    n.type=field_options[HFields[i]].options["type"].params[0];
                                }
                            }
                          //  console.log("getting value for " + n.type + " is " + getAType[n.type]);
                            c=c.concat(JSON.stringify(getAType[n.type]));
                        }
                    }
                }
            }
            c=c.concat("};");
           // console.log("Made command index i " + i + " cmd " + c);
            Commands[i]=c;
        }
        return Commands;
    };

   // var Commands=mkFieldCommands();
  
    var mkFields=function(){
        var fields=[];
        var Options=[];
        var Required=[];
        var Commands=mkFieldCommands();
        var HFields=HThings.Fields;
        mkFieldOptionsList(Options,Required);
        //var des=Harvey.field._getAllSettings;
        var des=field_options;
        for(var i=0;i<HFields.length;i++){
            //console.log("++++++++++++++++++== mkFields making " + HFields[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=HFields[i];
            k.dependsOn=HFields[i];
            k.action=function(that){
                var p=that.getChild("doit");
      
                p.element.click();
            },
            k.components=[{node: "heading",size: "h3", text: HFields[i]},
                          {node:"paragraph", text: "<code>var f=Harvey.field['" +HFields[i] +"'](dataObject,element);</code>"},
                          {node:"paragraph",text:des[HFields[i]].description },
                          {node: "heading",size: "h5",text: "dataObject settings"},
                          {node: "heading",size: "h5", text: "Required"},
                          {node: "descriptionList", items:Required[i]},
                          {node: "heading", size: "h5", text: "Options"},
                          {node: "descriptionList", items:Options[i]},
                          {node: "heading",size: "h5",text: "Live example"},
                          {name: "Input_params",field: "textArea", value: Commands[i]}, 
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
       //                        console.log("button action is here");
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                              // $.globalEval(f.getValue());
                               globalEval(f.getValue());
                      //         console.log("parms are " + dataObject);
                               if(Harvey.checkType["object"](dataObject)){
                      //             console.log("and it is an object");
                                   var name=dataObject.name;
                                   if(that.parent.getChild(name)){
                                       console.log("deleting child");
                                       that.parent.deleteChild(name);
                                   }
                       //            console.log("adding child");
                                   that.parent.addField(dataObject);
                               }
                               else{
                                   Harvey.display.dialog("Error", "Input is not a valid object");
                               } 
                           }
                          }
                         ];
       
            UI.Panels.Fields.components.push(k);
        }
       
    };
  
    var select_menu=function(that){
        var name=that.name;
        var p=that.parent.getSiblings();
     //   console.log("selecting menu for " + name);
        if(!p){
            throw new Error("Could not find siblings of " + that.parent.name);
        }
        for(var i=0;i<p.length;i++){
       //     console.log("siblings are " + p[i].id);
        /*    if(p[i].id.indexOf(name) > -1){
                p[i].show();
            } */
           if(p[i].id == name){
                p[i].show();
            }
            else if(p[i].id == (name + "Methods") ){
                p[i].show();
            }
            else if(p[i].id === (name + "Display")){
                   p[i].show();
            }
            else if(p[i].id ==("test" + name)){
                p[i].show();
            } 
            else{
                p[i].hide();
            }
        }
    };

    var mkMenu=function(AList,action){
        var f=[];
        for(var i=0;i<AList.length; i++){
            f[i]={};
            f[i].name=AList[i];
            f[i].action=select_menu;
        }
        if(AList === HThings.Panels){
            f.push({seperator: "Child methods"});
            for(var i=0;i<HThings["PanelComponents"].length;i++){
                f.push({name: HThings["PanelComponents"][i], action: select_menu });
            }
        }
        
        return f;
    };


    var mkTypes=function(){
        var HTypes=HThings.Types;
        var tests={
            alphaNum: { test:'["gh&*","yu78h","YU90","777 90"]',
                        items:[{label: "Alphanum",description:"Any combination of letters and numbers"}]},
            boolean:{test:'[0,true,false,1,"true","uuio89"]'},
            currency:{test:'["£39.00","$89.90","GBP78","udf90"]'},
            date:{test:'["20160623","3rd October","780","7878wewe"]'},
            email:{test:'["junk@nowhere.com","uiui@op"]'},
            float:{test:'[89.90,90,"89d", .90]'},
            floatArray:{test:'[[5.6,4.6,33.5],[444.55,"3wa",424]]'},
            image:{test:'[{kiml:"ioioi"}]'},
            imageArray:{test:'[[]]'},
            integer:{test:'[90,90.3,"ete","te5"]'},
            integerArray:{test:'[[5,6,7,8],[89.5,45.76,34]]'},
            negativeInteger:{test:'[-45,9.5,-6.4]'},
            password:{test:'["ioioioi"]'},
            phoneNumber:{test:'[89898998,"90wr54"]'},
            positiveInteger:{test:'[90,"909ewr",666.4]'},
            string:{test:'["erre",78.6]'},
            stringArray:{test:'[["6767",7878,"re"]]'},
            text:{test:'["yuyuyuy",898.99]'},
            time:{test:'[78,"10:02 PM","23:33:45","10:34"]'},
            token:{test:'["7878","78fs-rte",65]'},
            range:{test:'[42.55,"3wa",42,-10]'}
        };
      
        for(var i=0;i<HTypes.length;i++){
         //   console.log("======== type is ++++++++++= " + HTypes[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.id=HTypes[i];
            k.hidden=true;
            var c=" var results=[]; var test= " + tests[HTypes[i]].test + ";  for(var i=0;i<test.length;i++){ results[i]=Harvey.checkType['" +  HTypes[i] + "'](test[i]);  }";
            k.components=[{node: "heading",size: "h3", text: HTypes[i]},
                          {node:"paragraph", text: ""},
                          {name: "Input_params",field: "textArea", value: c}, 
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
                               var f=that.parent.getChild("Input_params");
                               //console.log("f is " + f.getValue());
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                               //$.globalEval(f.getValue());
                               globalEval(f.getValue());
                               //console.log("got " + JSON.stringify(results));
                               var c=this.parent.getChild("result");
                               if(!c){
                                   throw new Error("Cannot find result node");
                               }
                               var t=new String;
                               for(var i=0;i<results.length;i++){
                                   t=t.concat("" + test[i] + " is " + results[i] + "<br>");
                               }
                               c.setText(t);
                               
                           }},
                          {node:"heading",size:"h4", text:"Result"},
                          {node:"paragraph",name: "result", text:"" }
                          ];
            UI.Panels.Types.components.push(k);
        }
        
       
    };

    var mkNodes=function(){
        var HNodes=HThings.Nodes;
        var node_items=[];
        var opts=Harvey.node("node_list");
        var Commands=[];

        var opts={
            anchor:{
                parms:{href:"href",text:"string",target:"target"},
                items:[{label: 'href',descriptions:["type: string","a url"]},
                       {label: "text",descriptions: ["type: string",'the clickable text that appears in the DOM']},
                       {label: "target",descriptions: ["type:string","where to open the link "]}]
            },
            descriptionList:{
                parms:{items:[ "objectArray"]},
                items:[{label:"objectArray",descriptions: ["type: {label(s): 'string(Array)',description(s): 'string(Array)'}", "where ", "[{label:'string',description:'text'}","{labels:'stringArray',descriptions:'stringArray'}];"]},
                       {label:"Example:",description:"<code>var items=[{label:'myLabel',description:'some description'},<br> {labels:['one','two'],descriptions:['describe something','and another thing']}];<code>"}]
            },
            heading:{
                parms:{size:"size",text:"text"},
                items:[{label:"size",descriptions: ["type: string","size param: one of the following sizes","'h1'","'h2'","'h3'","'h4'","'h5'" ]}]
            },
            image:{ 
                parms:{src:"path"},
                items:[{label:"width",description:"integer width of the html image node"},
                       {label: "height",description:"integer height of the html image node"}]
            },
            label:{
                parms:{text:"string",for:"string"},
                items:[{label: 'for',description:"optional, id of the html element the label belongs to " }]
            },
            list:{
                parms:{list:"stringArray"},
                items:[{label: "stringArray",description:"example: ['one','two'.'three']"}]
            },
            code:{
                parms:{text:"text"},
                items:[{label: "text",description:"text will be displayed as code"}]
            },
            paragraph:{
                parms:{text:"text"},
                items:[{label: "text",description:"the text can contain unicode and things like ' &#60br&#62'"}]
            },
            progressBar:{
                parms:{value:"integer"},
                items:[{label:"integer",description:"current value"}]
            },
            paginate:{
                parms:{number:"integer",action:'function(that){alert("clicked page" + that.current_num);}'},
                items:[{label:"number",description:"number of objects in the paginator"},
                       {label: "action", description: "function with one parm the paginator context"}]
            },
            clock:{
                parms:{},
                items:[]
            },
            button:{
                parms:{text:"string",action:'function(that){alert("button pressed");}'},
                items:[]
            }
        };
        
        for(var i=0;i<HNodes.length;i++){
            var k={};
            var t_opts=new String;
            Commands[i]=("var node=Harvey.node({node:'" + HNodes[i] +"'" + ",name: 'TESTNODE'");
            for(var n in opts[HNodes[i]].parms){
                t_opts=t_opts.concat(", " + n + ": ");
                t_opts=t_opts.concat(JSON.stringify(opts[HNodes[i]].parms[n]));
                if(n == "action"){
                    Commands[i]=Commands[i].concat(","+ n + ":" + opts[HNodes[i]].parms[n]);                
                }
                else{
                    Commands[i]=Commands[i].concat(","+ n + ":" + JSON.stringify(getAType[opts[HNodes[i]].parms[n]]));
                }
            } 
            Commands[i]=Commands[i].concat("});");
            k.display="fieldset";
            k.DOM="right";
            k.id=HNodes[i];
            k.dependsOn=HNodes[i];
            k.action=function(that){
                var p=that.getChild("doit");
                //$(p.element).trigger("click");
                p.element.click();
            }, 
            k.hidden=true;
            k.components=[{node: "heading",size: "h3", text: HNodes[i]},
                          // {node:"paragraph", text: "<code>var node=Harvey.node({node:'" + HNodes[i] + "'" + t_opts + "});</code>"},
                          {node:"code", text: "var node=Harvey.node({node:'" + HNodes[i] + "'" + t_opts + "});"},
                          {node: "heading",size: "h5",text: "Paraneters"},
                          {node: "descriptionList",items:opts[HNodes[i]].items},
                          {node: "heading",size: "h5",text:"Options"},
                          {node: "descriptionList",items:[{label:"id",descriptions:["type: string ", "Add an id"]},{label:"class",description:"add a class to the node"},{label:"name",descriptions:["type: string","add a name attribute to the node"]}]},
                          {node: "heading",size: "h5",text: "Live example"},
                          {name: "Input_params",field: "textArea", value: Commands[i]}, 
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
                               // console.log("button action is here");
                               var f=that.parent.getChild("Input_params");
                            //   console.log("f is " + f.getValue());
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                     
                               globalEval(f.getValue());
                               if(Harvey.checkType["object"](node)){
                      //             console.log("and it is an object");
                                   var name=node.name;
                                   if(that.parent.getChild(name)){
                                       console.log("deleting child");
                                       that.parent.deleteChild(name);
                                   }
                       //            console.log("adding child");
                                   that.parent.addNode(node);
                              // console.log("parms are " + node);
                                  
                               }
                               else{
                                   Harvey.display.dialog("Error", "Input is not a valid object");
                               } 
                           }
                          }
            ];
        
            UI.Panels.Nodes.components.push(k);
        }
    };


    
    var mkFieldMethods=function(){
        var fm=Harvey.field._getMethods();
        var Commands=mkFieldCommands();
        var HFields=HThings.Fields;
        var fields=[];
        // strip the var dataObject= from the head
        
        var field_methods_list={
            getValue:{descriptions:[
                "<code>var r=field.getValue();</code>",
                "return: type",
                'if no value is set returns "undefined"']
                     },
            setValue:{descriptions:[
                "<code>var r=field.setValue(value);</code>",
                "return: void"
            ]},
            checkValue:{descriptions:[
                "<code>var r=field.checkValue();</code>",
                "return: boolean",
                "If the type has been specified checks the value is of the specified type "
            ]},
            getElement: {descriptions:[
                "<code>var r=field.getElement();<code>",
                "return: jQueryObject",
                "The original jquery node supplied in the call to Harvey.Field"
            ] },
            getKey: {descriptions:[
                "<code>var r=field.getKey();</code>",
                "return: string",
                "The name if it exists,or label if that has been supplied or null"
            ]},
            getInputElement:{descriptions:[
                "<code>var r=getInputElement()</code>",
                "return:jQueryObject",
                "The input node"
            ]},
            delete:{descriptions:[]},
            deleteValue:{ descriptions:[]},
            addValue:{ descriptions:[]},
            popupEditor:{descriptions:[]},
            getLabel:{descriptions:["get the jQuery label element"]},
            mkThumbnails:{descriptions:["make thumbnails from values array"]},
            loadImages:{descriptions:["load images from the values array"]},
            reset:{descriptions:["set all the values to false"]}
        };
        var items=[];
              
        for(var i=0;i<HFields.length;i++){
           // console.log("mkFieldMethods making " + HFields[i]);
            var k={};
            items=[];
            for(var j=0;j<fm[HFields[i]].length;j++){
                var m=fm[HFields[i]][j];
                items[j]={label:m,
                          descriptions:field_methods_list[m].descriptions};    
            }
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(HFields[i] + "Methods").toString();
            k.components=[{node: "heading", size: "h4", text: "Methods"},
                          {node: "descriptionList", items:items},
                          {node: "heading",size: "h5",text: "Live example"},
                          {name: "Input_params",field: "textArea",
                           value: "var value=field.getKey();"}, 
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
             //                  console.log("button action is here");
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                               window.field=that.parent.getChild("SomeString");
                               //$.globalEval(f.getValue());
                               globalEval(f.getValue());
                               var nf=that.parent.getChild("Result");
                              // console.log("methods doit got " + value);
                               nf.setValue(JSON.stringify(value));
                               
                           }},
                          {node:"paragraph",text:"Result"},
                          {field:"static",name:"Result",type:"string" }
                          
                         ];
   
            globalEval(Commands[i]);
            k.components.push(dataObject);
            
            UI.Panels.Fields.components.push(k);
        }
       
    };

    var mkDisplays=function(){
        
        var stuff={
            fieldset:{required:[{label:"components",descriptions:[ "An array of nodes and/or field objects","example",
                                                                   "<code>components: [{node:'heading',size:'h4',text:'heading'},{field:'float',name:'some_name',value:10.0}}]</code>"]}],
                      options:[]
                     },
            form:{required:[{label:"components",descriptions:[ "An array of nodes and/or field objects","example",
                                                               "<code>components: [{node:'heading',size:'h4',text:'heading'},{field:'float',name:'some_name',value:10.0}}]</code>"]}],
                  options:[{label:"buttons",descriptions:["an array of button objects","example","<code> buttons: [{name: 'string',text:'string',action: function(that){ //some code }}]</code>"]},
                           {label:"draggable",descriptions:["type: boolean","default: true","if true the form is detached and can be dragged around the browser window"]},
                           {label: "label",description: "type: string"}]},
            grid:{required:[{label: "cols",descriptions:["type: objectArray","array of fields based on type","example","<code>cols:[{name:'colname1',type:'string',editable:false},{name:'colname2',type:'float',required:true,resizable:true,precision:2,step:0.1}]<code>"]},
                            {label:"rows",descriptions:["type:objectArray","if the cols were defined as above then the rows would be","<code> rows:[{colname1:'some_string',colname2:23.53},{colname1:'another_string',colname2:34.66}]"]}],
                  options:[
                      {label:"userSortable",descriptions:["type: boolean","can the user sort the cols","userSortable and sortOrder are mutually exclusive"]},
                      {label:"sortOrder",descriptions:["type:stringArray","column names to sort the grid rows","example","<code>sortOrder:['colname1','colname2']<code","sort the rows first by colname1 and then colname2"]},
                      {label:"groupby",descriptions:["type: stting","split the row data into separate grids based on the value of the column in the row data","example","<code>groupBy: 'colname1',<code>","if the column has a label it will be used as a the subgrid seperator"]},
                      {label:"uniqueKey",descriptions:["type: string","the column name of the uniqueKey if it exists"]},
                      {label: "resizable",descriptions:["type: boolean","Add the resize widget to the bottom rhs"]}
                  ]}, 
            menu:{  required:[{label: "list",description:""}],
                    options:[{label: "label",description:""},
                             {label: "heading",description:""},
                            ]},
            slideshow:{options:[{label: "values",descriptions:["type: objectArray","array of Image objects","<code> var values=[{src:'css/images/image1.png'},{src:'css/images/image2.png'}]"]}],
                       required:[]
                      },
            tabs:{required:[{label: "tabs",descriptions:["type: objectArray","example","<code> tabs:[{name:'some_string',label:'lovely label'},{name:'another_name',label:'very lovely label'}]","this would creates two tabs with the labels displayed as 'lovely label', 'very lovely label'"]}],
                  options:[]
                 }
        };
        var command={
            fieldset:"components:[{node:'heading',size:'h4',text:'Test'},{field:'select',name:'select_test',options:['one','two','three']}]",
            form:"draggable: true, components:[{node:'heading',size:'h4',text:'Test'},{field:'select',name:'select_test',options:['one','two','three']}],buttons:[{name:'ok',text:'OK',action:function(that){alert('OK clicked');}}]",
            grid:"cols:[{name: 'col1',type:'string',editable: false},{name:'col2',type:'integer',editable: true},{name:'col3',type: 'boolean',editable: true}], rows:[{col1:'abc',col2: 10, col3: false},{col1:'def',col2: 10, col3: false},{col1:'vyd',col2: 15, col3: true},{col1:'per',col2: 23, col3: true},{col1:'ted',col2: 43, col3: false},{col1:'tda',col2: 54, col3: true}]",
            menu:"heading: 'Test Menu',list:[{name:'menu1',label: 'menu item 1'},{name:'menu2',label: 'menu item 2'},{name:'menu3',label: 'menu item 3'},{name:'menu4',label: 'menu item 4'} ]",
            slideshow:("values:" +  JSON.stringify(getAType['imageArray']) + ""),
            tabs:"tabs:[{name:'tab1',label:'tab one'},{name:'tab2',label:'tab two'},{name:'tab3',label:'tab three'},{name:'tab4',label:'tab four'}],selected: 'tab1'"
        };

        var HDisplays=HThings.Displays;
     

        for(var i=0;i<HDisplays.length;i++){
            //console.log("mkDisplays making " + HDisplays[i]);
            var k={};
          
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=HDisplays[i];
            k.dependsOn=HDisplays[i];
            k.action=function(that){
               // console.log("triggering click");
                var p=that.getChild("doit");
                p.element.click();
            },
            k.components=[{node: "heading",size: "h3", text: HDisplays[i]},
                          {node:"paragraph", text: "<code>var node=Harvey.display['" + HDisplays[i] + "'](dataObject);</code>"},
                          {node: "heading",size: "h4",text: "dataObject settings"},
                          {node: "heading",size: "h5",text: "required"},
                          {node: "descriptionList",items:[{label: "DOM",descriptions:["type: string","an existing node with an id (do not include #) which is used as the parent for the display"]},
                                                          {label: "id",descriptions:["type: string","id of the base jQuery Object the display creates"]}]
                          },
                          {node:"descriptionList", items:stuff[HDisplays[i]].required},
                          {node: "heading",size: "h5",text: "options"},
                          {node: "descriptionList",items:[{label:"action",descriptions:["type: function","example","<code> action:function(that){//some code - that=this}<code>"]},
                                                          {label:"dependsOn",descriptions:["type: string","id of the node that needs to be created before the action function is run","example","<code> dependsOn:'nodeId'"]},
                                                          {label:"publish",descriptions:["type: objectArray","example","<code>publish:[{name:'some_name',action:function(that){ Harvey.dispatch('some_name')}}]</code>"]},
                                                          {label:"listen",descriptions:["type: objectArray","example","<code>listen:[{name:'some_name',action:function(that,data){//do something}}]<code>"]},
                                                          {label:"after",descriptions:["type: string","where the string is the id of an element that the new elemnent will be displayed after"]}]},
                          {node:"descriptionList",items:stuff[HDisplays[i]].options},
                          {node: "heading",size:'h4',text:"live Demo"},
                          {name: "Input_params",field: "textArea",
                           value: "var dobj=Harvey.display['" + HDisplays[i] + "']({DOM:'right',id:'" + HDisplays[i] + "Display', after:'" + HDisplays[i] + "', " + command[HDisplays[i]] + "});"},
                          {node:'button',name:'doit',text: "Go",
                           action: function(that){
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                               var n=that.parent.id;
                               //$.globalEval(f.getValue());
                               globalEval(f.getValue());
                               var d=Harvey.Panel.get("Displays").getChild((n+"Display"));
                               if( d!== null){
                                   Harvey.Panel.get("Displays").deleteChild((n+"Display"));
                               }
                               //   else{
                            //      dobj.hidden=true;
                               //   }
                               if(!Harvey.checkType['object'](dobj)){
                                   throw new Error("Bad return");
                               }
                               Harvey.Panel.get("Displays").addChild(dobj);
                           }
                          }
                         ];
            
            UI.Panels.Displays.components.push(k);
        }
    }; 

    var mkDisplayMethods=function(){
        var HDisplays=HThings.Displays;
        var Methods={};
        for(var i=0;i<HDisplays.length;i++){
            console.log("getting method for " + HDisplays[i]);
            Methods[HDisplays[i]]=[];
            var p=Harvey.display[(HDisplays[i]+"Methods")]();
            for(var j=0;j<p.length; j++){
                console.log("display " + HDisplays[i] + " has method " + p[j]);
                if(p[j] !== "constructor" && !p[j].startsWith("_")){
                    Methods[HDisplays[i]].push(p[j]);
                }
            }
        }
        var display_methods_list={
            show:["<code> var v=my_display.show();)</code>","return: boolean","add the display to the DOM"],
            getElement:["<code> var v=my_display.getElement();</code>","return: jQuery object"," the root element of the display"],
            getChildren:["<code> var v=my_display.getChildren();</code>","return: object","where the object has keys fields, tabs,grids etc depending on the type of children the display object creates"],
            getDisplayType:["<code> var v=my_display.getDisplayType();</code>","return: string","e.g 'tabs','form' etc"],
            getName:["<code> var v=my_display.getName(); </code>","return: string","returns the name if it exists"],
            getKey:["<code> var v=my_display.getKey(); </code> ","return string"," return the name if it exists or id(which must exist)"],
            getParent:["<code> var v=my_display.getParent(); </code>","return: Panel object"," returns window if it exists"],
            getSiblings:["<code> var v=my_display.getSiblings(); </code>","return: objectArray"," array of the other display objects that are in the same Panel"],
            hide: ["<code> my_display.hide(); </code>","return: none","remove the display from the DOM"],
            check: [],
            delete: ["<code> my_display.delete(); </code>","return: none","delete the display object and all it's children from memory"],
            update: [],
            getTabs:["<code> var v=mk_display.getTabs(); </code>"],
            getTab:[],
            select: [],
            addNode:["<code> my_display.addNode(node_object); </code>"],
            addField:["<code> my_display.addField(field_object); </code>"],
            getJSON: ["<code> var js=my.display.getJSON();</code>"],
            submit: [],
            sort: [],
            getColIndex:["<code>var v=my_display.getColIndex(col_name); </code>","parms: 'string',column name"],
            getCol: [],
            getGrid: ["<code> var v=my_display.getGrid(grid_name); </code>","return the grid object named grid_name"],
            getGrids: ["<code> var v=my_display.getGrids(); </code>"],
            showGrid: [],
            hideGrid: [],
            insertRow: [],
            redrawRows: [],
            updateRow: [],
            getRowFromElement: [],
            print: [],
            start: [],
            showFullscreen: []
        };
        var items=[];
        for(var i=0;i<HDisplays.length;i++){
           console.log("mkFieldMethods making " + HDisplays[i]);
            var k={};
            items[i]=[];
            for(var j in Methods[HDisplays[i]]){
                var m=Methods[HDisplays[i]][j];
                console.log("Methods " + m);
                items[i].push({label:m,
                               descriptions:display_methods_list[m]});    
            }
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(HDisplays[i] + "Methods").toString();
            k.components=[{node: "heading", size: "h4", text: "Methods"},
                          {node: "descriptionList", items:items[i]},
                          {node: "heading",size: "h5",text: "Live example"},
                          {node: "paragraph",text: "(global variable for eval)"},
                          {name: "Input_params",field: "textArea",
                           value: "var v=window.dobj.getKey();"}, 
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
                               //                  console.log("button action is here");
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                               //window.field=that.parent.getChild("SomeString");
                               //$.globalEval(f.getValue());
                               globalEval(f.getValue());
                               var nf=that.parent.getChild("Result");
                              // console.log("methods doit got " + value);
                               nf.setValue(JSON.stringify(v));
                               
                           }},
                          {node:"paragraph",text:"Result"},
                          {field:"static",name:"Result",type:"string" }
                          
                         ];
          
           UI.Panels.Displays.components.push(k);  
        }
    };

    var mkPopups=function(){
        var HPopups=HThings["Popups"];
       
        var command={
            alert:  function(c){ return c.concat('("Hi, An alert");');},
            clock:function(c){ return c.concat('("clock");');},
            dialog:function(c){return c.concat('("title","my message");');},
            error:function(c){return c.concat('("title","my message");');},
            paginate:function(c){return c.concat('({DOM:"right",values:[{text:"1",action:function(that){alert("got a click");}},{text:"2",action:function(that){alert("got a click");}}]});');},
            progressBar:function(c){return c.concat( '(4);');},
            spinner: function(c){return c.concat('(true);');},
            statusCode:function(c){return c.concat( '[204]("");');},
            trouble:function(c){return c.concat('("TEST TROUBLE","something horrible text")');}
        };
        
        for(var i=0;i<HPopups.length;i++){
            var c= "var dobj=Harvey.popup['" + HPopups[i] + "']" ;   
            var cmd=command[HPopups[i]](c);
            
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=HPopups[i];
            k.components=[{node:"heading",size:"h3",text: HPopups[i]},
                          {node: "heading",size: "h5",text: "Live example"},
                          {name: "Input_params",field: "textArea", value: cmd},
                          {name: "doit", node: "button", text: "Go",action: function(that){
                              var f=that.parent.getChild("Input_params");
                             
                              if(!f){
                                  throw new Error("can't get input params");
                              }
                              //$.globalEval(f.getValue());
                              globalEval(f.getValue());
                              if(that.parent.id === "spinner"){
                                  
                                  window.setTimeout(function(){Harvey.popup["spinner"](false);},3000);
                              } 
                          }}
                         ];
            UI.Panels.Popups.components.push(k);
        }
        
    };

    var mkIO=function(){
        var HIO=HThings["IO"];
        for(var i=0;i<HIO.length;i++){
           // console.log("making io panel",HIO[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(HIO[i] + "Methods").toString();
            k.components=[{node:"heading",size:"h3",text:HIO[i]},
                          {node: "heading",size:"h5",text: "Live Example"}
                         ];
            UI.Panels.IO.components.push(k);
        }
    };
    var mkUtils=function(){
        var HUtils=HThings["Utils"];
        var items={
            binarySearch:{p:"<code>Harvey.Utils.binarySearch(array,item,[sortOrder],[closest])<code>"},
            dateNow:{p:"<code>Harvey.Utils.dateNow()<code>"},
            datePast:{p:"<code>Harvey.Utils.datePast()<code>"},
            detectMobile:{p:"<code>Harvey.Utils.detectMobile()<code>"},
            draggable:{p:""},
            extend:{p:""},
            formatDate:{p:""},
            getCssValue:{p:""},
            hashCode:{p:""},
            observer:{p:""}
        };
        for(var i=0;i<HUtils.length;i++){
           // console.log("making io panel",HUtils[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(HUtils[i] + "Methods").toString();
            k.components=[{node:"heading",size:"h3",text:HUtils[i]},
                          {node: "paragraph",text: items[HUtils[i]].p},
                          {node: "heading", size: "h4", text: "Methods"}
                         
                         ];
            UI.Panels.Utils.components.push(k);
        }
    };
    
    var select_tabs=function (that){
        var name=that.name;
      //  console.log("select_tabs: trying to show " + name);
        if(that.parent.selected){
            Harvey.Panel.hide(that.parent.selected.name);
        }
     //   if(name !== that.selected){
          //  console.log("select_tabs: trying to show " + that.selected);
        //Harvey.Panel.hide(that.selected);
        
        Harvey.Panel.show(name);
        var b=Harvey.Panel.get(name);
        if(b){ // may or may not be loaded yet
            var ar=b.getChildren();
            for(var i=0; i< ar.length; i++){
                var n=ar[i].getKey();
                // console.log("select_tabs n is " +  n);
                if(n == "Blurb" ||  n == (name +"Menu")){
                    ar[i].show();
                }
                else{
                    //   console.log("select_tabs hiding " + n );
                    ar[i].hide();
                }
                if(n === (name + "Menu")){
                    ar[i].reset();
                }
            }
        }
       // }
    };

    function mk_spaces(num){
        var t=new String;
        for(var i=0;i<num; i++){
            t=t.concat("&nbsp ");
        }
        return t;
    }


    var mkPanelMethods=function(){
        var panel_methods={
            UIStart:[{label: "called by default if",description: "<code> UI.start=['MyPanel']; </code> <br> is defined"},{label: "<br><code>Harvey.Panel.UIStart(stringArray);</code>",descriptions:["<br> return: nothing","parms: stringArray","string array of panel keys, as defined in the UI,Panels object that will be displayed immediately on load"," e.g if <code> UI.start=['MyPanel']; </code> is defined, Harvey will immediately load this panel by default in the main window","you then don't need to call this method"]}],
            add:[{label: "<code>Harvey.Panel.add(object|| string);</code>",descriptions:["return: nothing","parms: object or string","e.g from the above definition","<code>Harvey.Panel.add('MyPanel');</code>","or","<code> Harvey.Panel.add({name:'some_name',components:my_display_object_array});</code>","to use the string parm the window must be defined in the UI.Panels object"]}],
            clone:[{label:"<code></code>",description:"clone an object"}],
            delete:[{label:"<code>Harvey.Panel.delete(string);</code>",descriptions:["return: nothing","parms: string","the name of the window to be deleted"]}],
            deleteAll:[{label:"<code>Harvey.Panel.deleteAll();</code>",descriptions:["return: nothing","parms: none","delete all the windows"]}],
            get:[{label:"<code>var v=Harvey.Panel.get(string);</code>",descriptions:["return: panel object","parms: string",(" " + mk_spaces(7) + "The name of the panel")]}],
            hide:[{label:"<code>Harvey.Panel.hide(string);</code>",descriptions:["return: none","parms: string",("" + mk_spaces(7) + "name of the window")]}],
            hideAll:[{label:"<code>Harvey.Panel.hideAll();</code>",descriptions:["return: none","parms: none","Remove all the windows from the DOM"]}],
            inList: [{label:"<code>var v=Harvey.Panel.inList(string);</code>",descriptions:["return: string","the name of the window or null","parms: string","the name of a window" ]}],
            getList:[{label:"<code>var v=Harvey.Panel.getList();</code>",descriptions:["return: stingArray","list the names of all the windows in Harvey"]}],
            show:[{label:"<code>var v=Harvey.Panel.show(string);</code>",descriptions:[]}],
            addChild:[{label:"<code>Harvey.Panel[string].addChild(object);</code>",descriptions:["<br> return: nothing","parms: object","a Harvey display Object"]}],
            deleteChild:[{label:"<code>var v=Harvey.Panel[string].deleteChild(object);</code>",descriptions:[]}],
            deleteChildren:[{label:"<code>var v=Harvey.Panel[string].deleteChildren();</code>",descriptions:[]}],
            findChild:[{label:"<code>var v=Harvey.Panel[string].findChild(object);</code>",descriptions:[]}],
            getChild:[{label:"<code>var v=Harvey.Panel[string].getChild(string);</code>",descriptions:[]}],
            getChildren:[{label:"<code>var v=Harvey.Panel[string].getChildren();</code>",descriptions:[]}]
        };
   

        var HPanels=HThings["Panels"].concat(HThings["PanelComponents"]);
        
        for(var i=0;i<HPanels.length;i++){
          //  console.log("mkPanelMethods making " + HPanels[i]);
            var cmd={
                UIStart:"Harvey.Panel.UIStart();",
                add:"Harvey.Panel.add({name: 'MyName', components:[{display:'tabs',DOM:'right',id:'TestTabs',tabs:[{name:'tab1',label:'my tab'},{name:'tab2',label:'another tab'}]}]});",
                "delete":"Harvey.Panel.delete('MyName');",
                clone:"Harvey.Panel.clone(child_display_object)",
                deleteAll:"Harvey.Panel.deleteAll();",
                get: "var v=Harvey.Panel.get('MyName');",
                getList:"var v=Harvey.Panel.getList();",
                hide:"Harvey.Panel.hide('MyName');",
                hideAll:"Harvey.Panel.hideAll();",
                inList:"var v=Harvey.Panel.inList('MyName');",
                show:"Harvey.Panel.show('MyName');",
                addChild:"Harvey.Panel['MyName'].addChild({display:'fieldset',id:'testaddChild',DOM:'right',components:[{node:'paragraph',text:'Adding some text'}]})",
                deleteChild:"Harvey.Panel['MyNmae'].deleteChild('Tabs');",
                deleteChildren:"Harvey.Panel['MyName'].deleteChildren();",
                findChild:"var v=Harvey.Panel['MyName'].findChild('Tabs');",
                getChild:"var v=Harvey.Panel['MyName'].getChild('Tabs');",
                getChildren:"var v=Harvey.Panel['MyName'].getChildren();"
            };
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(HPanels[i] + "Methods").toString();
           // console.log("methods description is " + panel_methods[HPanels[i]]);
            k.components=[{node: "heading", size: "h3", text: "Methods"},
                          {node: "heading",size: "h4",text: HPanels[i]},
                          {node: "descriptionList", items:panel_methods[HPanels[i]]},
                          {node: "heading",size: "h5",text: "Live example"},
                          {name: "Input_params",field: "textArea", value: cmd[HPanels[i]]},
                          {name: "doit", node: "button", text: "Go",action: function(that){
                              var f=that.parent.getChild("Input_params");
                              if(!f){
                                  throw new Error("can't get input params");
                              }
                              
                              var n=that.parent.id.split("Methods");
                            //  console.log("got " + n[0]);
                              if(Harvey.Panel.get('Panels').getChild(("test"+ n[0]))){
                                  Harvey.Panel.get('Panels').deleteChild(("test"+n[0]));
                              }
                              window.v=null;
                              that.parent.getChild("Result").setValue("");
                              //$.globalEval(f.getValue());
                              globalEval(f.getValue());
                              var nf=that.parent.getChild("Result");
                             // console.log("methods doit got " + v);
                              if(v !== undefined){
                                  if(Harvey.checkType["object"](v)){
                                      nf.setValue("Object");
                                  }
                                  else{
                                      nf.setValue(JSON.stringify(v));
                                  }
                              }
                          }},
                          {node:"paragraph",text:"Result"},
                          {field:"static",name:"Result",type:"string" }
                                                    
                         ];
           UI.Panels.Panels.components.push(k);  
        }
        
    };
    UI.Windows={
        TestWindow:{name: "TestWindow",opts:{height:800}}
        
    };
    
    UI.Panels={
        Tabs:{ name: "Tabs",
               components:[ {display: "tabs",
                             DOM: "Main",
                             id: "Tabs",
                             selected: "About",
                             action: function(that){
                                 for(var i=0; i<that.tabs.length;i++){
                                     that.tabs[i].action=select_tabs;
                                 }
                             },
                             tabs: [
                                 {name: "About",label: "About"},
                                 {name: "Fields",label: "Fields"},
                                 {name: "Nodes",label: "Nodes"},
                                 {name: "Displays",label: "Displays"},
                                 {name: "Panels",label: "Panels"},
                                 {name: "Types",label: "Types"},
                                 {name: "IO",label: "IO"},
                                 {name: "Popups",label: "Popups"},
                                 {name: "Utils",label: "Utils"}
                             ]
                            }
                          ]
             },
        Fields: { name: "Fields",
                  components:[ {display:"menu",
                                DOM: "left",
                                id: "FieldsMenu",
                            //    selected: "StaticField",
                                heading:"Field Types",
                              /*  dependsOn:"AutoCompleteField",
                                action: function(that){
                                    if(that.selected){
                                        var t=that.getMenu(that.selected);
                                        t.element.trigger("click");
                                    }},*/
                                list: mkMenu(HThings.Fields)
                               },
                               { display: "fieldset",
                                 DOM: "right",
                                 id: "Blurb",
                                 components:[{node:"heading", size: "h2",text: "Harvey Fields"},
                                             {node:"paragraph", text:"HarveyFields.js  Include in the head of your html file with <br><code> &#60script type='text/javascript' src='HarveyFields.js' &#62 &#60/script><code> <br> or use require(HarveyFields.js) within your javascript <br> Depends on HarveyUtils.js jquery.js and HarveyTypes.js"} ,
                                             {node: "heading", size: "h3", text: "Usage" },
                                             {node: "paragraph", text: "<code>var field=Harvey.field[fieldType](fieldData,parentNode);</code>"},
                                             {node: "paragraph", text: "Returns a HarveyField object"},
                                             {node: "heading", size: "h5", text: "fieldType"},
                                             {node: "paragraph",text: "type: string -  Harvey field type"},
                                             {node: "heading",size: "h5", text:"fieldData"},
                                             {node: "paragraph", text: "A javascript object that will be passed to the field"},
                                             {node: "heading",size:"h5", text: "parentNode"},
                                             {node:"paragraph", text: "A HTML node that is used as the parent of the field,typically a div or li node. DO NOT supply an input node!"}
                                            ]
                               },
                             ] 
                },
        About:{ name: "About",
                components:[
                    {display:"menu",
                     DOM: "left",
                     id: "AboutMenu",
              //       selected: "heading",
                     heading:"Core Methods",
                     list: [{label: "start",name: "start",action:select_menu},
                            {label: "stop",name:"stop",action: select_menu}]
                    },
                    { display: "fieldset",
                      id:"Blurb",
                      DOM: "right",
                      components:[
                          {node: "heading",size:"h2",text: "About Harvey"},
                          {node: "paragraph",text: "Harvey is a data-driven enterprise level SPA library. The components can be used together or individually. This site is made exclusively with Harvey Components, written in vanilla javascript."},
                          {node: "paragraph",text:"Harvey is arranged hierarchically."},
                          {node: "descriptionList",items:[{label: "Windows",description:"Windows contain"},
                                                          {label: "Panels",description:"Panels contain"},
                                                          {label: "displays",description:"displays contain"},
                                                          {label: "fields or nodes",description: "which contain"},
                                                          {label: "types",description: ""}
                                                         ]},
      
                          {node:"paragraph",text:"You don't have to use the hierarchy, any of the components can be used independently, e.g you can use the display templates without using the Panel, or fields without using displays, but you can't use displays without specifying the appropriate field(s) "},
                          {node: "heading",size: "h4",text:"Required"}
           
                      ]},
                    {display:"fieldset",
                     id: "start",
                     hidden:true,
                     DOM: "right",
                     components:[
                         {node: "heading",size:"h3",text: "Methods"},
                         {node: "descriptionList",items:[{label:"start",descriptions:["<code>Harvey.start(options);<code>","<br>Usually put in the html like so","<code> <br> &#60script type='text/javascript'> </code>","<code> &nbsp &nbsp  window.onload=function(){ Harvey.start(UI.Login);};</code>", "<code> &#60/script><code>","<br> or with jQuery", "<code> <br> &#60script type='text/javascript'> </code>",
                                                                                      "<code> &nbsp &nbsp $(document).ready(function(){</code>",
                                                                                      "<code>&nbsp &nbsp &nbsp &nbsp Harvey.start(UI.Login);<code>",
	                                                                              "<code>});<code>",
                                                                                      "<code> &#60/script><code>"
                                                                                                                                           ] }]
                         },
                         {node:"descriptionList",items:[{label: "param: options",descriptions:["displayObject","type: Any one of the display templates, templateData", "Unlike other calls to Harvey, this object is not held in memory and cannot be accessed through the Harvey.Panels methods(if these are being used). ","Typically used to display a login form"
                                                                                              ]},
                                                        {label:"or string array",descriptions:["where the elements of the array are UI.Panel names"]}
                                                       ]}
                         
                     ]
                    },
                    {display:"fieldset",
                     id: "stop",
                     hidden:true,
                     DOM: "right",
                     components:[
                         {node: "heading",size:"h3",text: "Methods"},
                         {node: "descriptionList",items:[{label:"stop",descriptions:["<code>Harvey.stop();<code>","<br>Deletes all the elements from the DOM","Removes all Harvey objects from memory"]}] }
                     ]
                    }
                ]},
        Nodes:{ name: "Nodes",
                components:[
                    {display:"menu",
                     DOM: "left",
                     id: "NodesMenu",
              //       selected: "heading",
                     heading:"Node Types",
                     list: mkMenu(HThings.Nodes)
                    },
                    { display: "fieldset",
                      id:"Blurb",
                      DOM: "right",
                      components:[
                          {node: "heading",size:"h2",text: "Harvey Nodes"},
                          {node:"paragraph", text:"HarveyNodes.js  Include in the head of your html file with <br> &#60 script type='text/javascript' src='HarveyNodess.js' &#62 &#60/script> <br> or use require(HarveyNodes.js) within your javascript <br> Depends on HarveyUtils.js  and HarveyTypes.js"} ,
                          {node: "heading", size: "h3", text: "Usage" },
                          {node: "paragraph", text: "<code>var node=Harvey.node(nodeObject[,parentElement]);</code>"},
                          {node: "paragraph", text: "Returns a HarveyNode object"},
                         // {node: "heading", size: "h5", text: "nodeType"},
                         // {node: "paragraph",text: "type: string -  Harvey node type"},
                          {node: "heading",size: "h5", text:"nodeObject"},
                          {node: "paragraph", text: "A javascript object that will be passed to the field"},
                          {node: "heading",size:"h5", text: "parentElement"},
                          {node:"paragraph", text: "An Optional HTML node that is used as the parent of the field,typically a div or li node, if this is not provided the new node is not appended to anything"},
                          {node:"heading",size:"h3",text: "Methods"},
                          {node: "descriptionList",items:[{label:"getElement",descriptions:["<code> var v=myNode.getElement();</code","returns the created HTML element"] },{label:"setText",descriptions:["<code> myNode.setText('some string');</code>","No return value","only applies if the node has a text option"]}]}
                      ]
                      
                    }
                ]
              },
        Displays:{ name: "Displays",
                   components:[
                       {display:"menu",
                        DOM: "left",
                        id: "DisplaysMenu",
                      //  selected: "Menu",
                        heading:"Display Templates",
                        list: mkMenu(HThings.Displays) 
                       },
                       { display: "fieldset",
                         id:"Blurb",
                         DOM: "right",
                         components:[
                             {node: "heading",size:"h2",text: "Harvey Displays"},
                             {node:"paragraph", text:"HarveyDisplay.'TemplateName'.js Where 'TemplateName' is one of the display templates.<br> e.g HarveyDisplayMenu.js  <br> Include in the head of your html file with <br> &#60 script type='text/javascript' src='HarveyDisplay.'Templatename'.js' &#62 &#60/script> <br> or use require(HarveyDisplay.'Templatename'.js) within your javascript <br> Depends on HarveyUtils.js and HarveyTypes.js and HarveyDisplayBase.js"} ,
                             {node: "heading", size: "h4", text: "Usage" },
                             {node: "paragraph", text: "<code>var display=Harvey.display['templateName'](templateData);</code>"},
                             {node: "paragraph", text: "Returns a HarveyDisplay object"},
                             {node: "heading", size: "h5", text: "templateName"},
                             {node: "paragraph",text: "type: string -  Harvey  display template type"},
                             {node: "heading",size: "h5", text:"templateData"},
                             {node: "paragraph", text: "A javascript object that will be passed to the template"}
                            ]
                         
                       }
                ]},
        Panels:{ name: "Panels",
                  components:[
                    { display: "fieldset",
                      id:"Blurb",
                      DOM: "right",
                      components:[
                          {node: "heading",size:"h2",text: "Harvey Panels"},
                          {node: "paragraph",text: ("Harvey panels are generally defined in a UI_defs.js file., <br> for example,<br><br> <code>   UI.Panels={<br> " + mk_spaces(2) + " MyPanel:{name: 'MyPanel',<br>" + mk_spaces(7) + "components:[ {display: 'tabs',<br>" + mk_spaces(14) + "DOM: 'Main',<br> " + mk_spaces(14) + "id: 'Tabs',<br> " + mk_spaces(14) + "tabs:[{name: 'someName',label: 'Some Name'},<br> " + mk_spaces(17) + "{name:'another', label:'Another'}<br>" + mk_spaces(17) + "]<br> " + mk_spaces(14) + "}  <br> " + mk_spaces(14) + " // add another display template here <br> " + mk_spaces(13) + "] <br> " + mk_spaces(7) + "} <br> " + mk_spaces(7) + " // add another panel here <br> }; " )},
                          {node:"paragraph",text: ("This would create a new panel with the name 'MyPanel' with one component, Tabs<br> To add another display component you add it to the components array.")},
                          {node: "paragraph",text: "Only display templates can be added to the Panel components array."}, {node: "heading", size: "h3", text: "Usage" },
                          {node: "paragraph", text: "<code>Harvey.Panel.add(PanelObject);</code><br> or"},
                          {node: "paragraph", text: "<code>Harvey.Panel.UIStart(PanelObjectArray);</code><br>"},
                          
                          {node: "heading",size:"h4",text: "Panel object" },
                          {node: "heading",size: "h5",text:"required"},
                          {node: "descriptionList",items:[{label:"name",description:"type: 'string'"},
                                                         
                                                          {label: "components",description:"type:'objectArray'"}]},
                          {node: "heading",size: "h5",text:"options"},
                          {node: "descriptionList",items:[{label: "window",descriptions:["type:'object'","defult: uses the current browser window","e.g","<code> var win_object={url:'string',name: 'string', opts:'width=600',height=600'}","The html file designated in the url must contain <code>HarveyCoreChild.js</code>","and when the document is loaded call <code>Harvey.childReady();</code>"]}]},
                          {node: "anchor", href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/open#Position_and_size_features",target:'_blank',text: "click here for window options"},
                          {node: "heading",size:"h4",text:"Live Example"},
                          {name: "Input_params",field: "textArea",
                           value: "Harvey.Panel.add({name:'TestPanel',window:{url:'child_window.html',name: 'TestWindow',opts:{width:600}},components:[{display:'tabs',DOM:'Content',id:'Tabs',tabs:[{name:'tab1',label:'my tab'},{name:'tab2',label:'another tab'}]}]})"}, 
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                            
                               if(Harvey.Panel.inList('TestPanel')){
                                   Harvey.Panel.delete('TestPanel');
                               }
                               // $.globalEval(f.getValue());
                               globalEval(f.getValue());
                           }
                          }
                      ]
                      
                    },
                      {display:"menu",
                       DOM: "left",
                       id: "PanelsMenu",
    //                   selected: "Heading",
                       heading:"Panel Methods",
                       list: mkMenu(HThings.Panels)
                      },
                  ]
                },
        Types:{name: "Types",
               components:[
                   {display:"menu",
                    DOM: "left",
                    id: "TypesMenu",
                    //selected: "Menu",
                    heading:"Types",
                    list: mkMenu(HThings.Types) 
                   },
                   { display: "fieldset",
                     id:"Blurb",
                     DOM: "right",
                     components:[
                         {node: "heading",size:"h2",text: "Harvey Types"},
                         {node:"heading",size: "h4",text: "Methods" },
                         {node: "descriptionList",items:[{label:"checkType",
                                                          descriptions:["<code>var t=Harvey.checkType[type](some_var);</code>","return boolean","params:","type is a Harvey type","some_var: a value whose type you want to check"]}]},
                         {node: "descriptionList",items:[{label:"sort",
                                                          descriptions:["<code> Harvey.sort[type](array,type_data);</code>",
                                                                        "return null",
                                                                        "params:",
                                                                        "type: is some Harvey type",
                                                                        "array: is some array of the appropriate type",
                                                                        "type_data: string, object, or objectArray for multiple sort ordering, ", " <br> ",
                                                                        "See the utils page for more info and examples."
                                                                       ]}
                                                         
                                                        ]},
                               ]
                   }
               ]
              },
        IO:{name: "IO",
                  components:[
                    { display: "fieldset",
                      id:"Blurb",
                      DOM: "right",
                      components:[
                          {node: "heading",size:"h2",text: "Harvey IO"}
                      ]
                      
                    },
                      {display:"menu",
                       DOM: "left",
                       id: "IOMenu",
                      // selected: "Heading",
                       heading:"IO Methods",
                       list: mkMenu(HThings.IO)
                      },
                  ]
            
           },
        Popups:{name: "Popups",
                components:[
                    {display:"menu",
                    DOM: "left",
                    id: "PopupsMenu",
                    //selected: "Menu",
                    heading:"Popups",
                    list: mkMenu(HThings.Popups) 
                   },
                    { display: "fieldset",
                      id:"Blurb",
                      DOM: "right",
                      components:[
                          {node: "heading",size:"h2",text: "Harvey Popups"}
                      ]
                      
                    }
                  ]
              },
        Utils:{name: "Utils",
                  components:[
                    { display: "fieldset",
                      id:"Blurb",
                      DOM: "right",
                      components:[
                          {node: "heading",size:"h2",text: "Harvey Utils"}
                      ]
                      
                    },
                      {display:"menu",
                       DOM: "left",
                       id: "UtilsMenu",
                   //    selected: "Menu",
                       heading:"Utility Methods",
                       list: mkMenu(HThings.Utils) 
                      }
                  ]
        }
    };
                                           

    mkFields();
    mkFieldMethods();
    mkNodes();
    mkDisplays();
    mkDisplayMethods();
    mkPanelMethods();
    mkPopups();
    mkTypes();
    mkIO();
    mkUtils();
    
    UI.start=["Tabs","About"];
   
    
})();
