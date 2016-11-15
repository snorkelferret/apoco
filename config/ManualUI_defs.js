// WARNING this script contains evil eval !!!!!!

;(function(){

    //UI.URL="/home/val";
    UI.webSocketURL=".";

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
        imageArray: [{src:"css/images/alchemist1.jpg",url:"",text:"alchemist"},
                     {src:"css/images/alchemist2.jpg",url:"",text:"another alchemist" },
                     {src:"css/images/rabbit_img1.jpg",url:"",text:"A lovely rabbit"},
                     {src:"css/images/alien1.jpg",url:"",text:"What is it?"}],
        password: "MyBadPassword1",
        array: ["One","Two","Three","Four"],
        path: "css/images/rabbit_img1.jpg",
        size: "h3",
        href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        target: "_blank",
        nodeType: "ul",
        thumbnails: "true",
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
                 Windows:[],
                 Utils:[]
                };
    function mkArrays(){
        var thing;
        for(var k in HThings){
           // console.log("k is " + k);
            switch(k){
            case "Fields":
                thing=Apoco.field;
                break;
            case "Displays":
                thing=Apoco.display;
                break;
            case "Nodes":
                thing=Apoco.node("node_list");
                break;
            case "Popups":
                thing=Apoco.popup;
                break;
            case "Types":
                thing= Apoco.type;
                break;
            case "Windows":
                thing=Apoco.Window;
                break;
            case "IO":
                thing=Apoco.IO;
                break;
            case "Panels":
                thing=Apoco.Panel;
                break;
            case "PanelComponents":
                thing=Apoco._panelComponents("methods");
                break;
            case "Utils":
                thing=Apoco.Utils;
                break;
            default:
                throw new Error("Don't know how to make " + k);
                return;

            }
            for(var n in thing){
                if(!n.startsWith("_")){
                    if(k === "Fields"){
                        if(n !== "exists" &&  n.indexOf("Methods")<= -1){  // method  not a field
                            HThings[k].push(n);
                        }
                        
                   }
                   else if(k==="Displays"){
                    //   console.log("got display " + n);
                       if(n.indexOf("Methods")<= -1){
                           HThings[k].push(n);
                       }
                   }
                   else{
                       HThings[k].push(n);
                   }
               }
            }
           
            Apoco.sort(HThings[k],"string");
        }

    }
    mkArrays(); // make the arrays of all the things Apoco knows how to build


    // FIELDS
    var fieldManual={
        get_types:function(field){
            var f=[];
            for(var k in Apoco.type){
                if(Apoco.type[k].field == field){
                    f.push(k);
                }
            }
            return f;
        },
        field_options: function(){
            var that=this;
            return{
            required:{name:{type: "string",descriptions:["tag used in Field methods"]}},
            common: {required:{type:"boolean",default: false,descriptions:["Is the cell allowed to be blank"]},
                     editable:{type:"boolean",default:true,descriptions:["If false user input is disabled"]},
                     label:{type: "string",default: undefined,descriptions:["added next to the input field"]},
                     title:{type: "string",default: undefined,descriptions:["add a tooltip"]}
                    },
            IO:{
                action:{type:"function",default: undefined,descriptions:["Function run after field has beenn created <br>","e.g <code>action:function(that){ alert('hullo');}</code>"]},
                listen:{type:"objectArray",default:undefined ,descriptions:["e.g <code> listen:[{name:'some_name',action:function(that,data){ alert('got data ' + data);}}]</code>"]},
                publish:{type: "objectArray",default: undefined,descriptions:["array can contain either an action function or static data e.g"," <code> publish:[{name:'some_name', <br> " + mk_spaces(4) + "action:function(that,name){ <br> " + mk_spaces(8) + " var data={user:'me',password:'you'}; <br> "+ mk_spaces(8) + "Apoco.IO.dispatch(name,data);}<br> " + mk_spaces(4) + "}];</code>","or","<code> publish:[{name:'some_name',data: my_data}]; </code> "]}
            },
            input: { options:{type:{type:"string",
                                    default:"string",
                                    params:that.get_types("input"),
                                    dependsOn:{float:{min:"default: undefined",
                                                      max:"default: undefined",
                                                      step:"default: 0.01",
                                                      precision:"default: 2,descriptions:Number of places after the decimal point"
                                                     },
                                               integer:{min:"default: undefined",
                                                        max:"default: undefined",
                                                        step:"default: 1"
                                                       },
                                               currency:{ISOCurrencyCode:"3 letter string - default: 'GBP'"
                                                        }
                                              }
                                   },
                              value:{type: "any",default: undefined,
                                     params:that.get_types("input"),
                                     descriptions:[""]}
                             },
                     descriptions:[""]
                   },
            select:{ required:{ options:{type:"stringArray",
                                         default: undefined,
                                         descriptions: [""]}
                              },
                     options:{blank_option:{type:"boolean",
                                            default: false,
                                            descriptions:[""]},
                              value:{type: "string",default: undefined,descriptions:[ "An element from the options string Array"]}
                             },
                     descriptions:[""]
                   },
            buttonSet:{required:{labels:{type:"stringArray"}},
                       options:{checkbox:{type:"boolean",
                                          default: false},
                                value:{type:"booleanArray"}},
                       descriptions:[""]
                      },
            slider:{ options:{ min:{type:"integer",default: 1},
                               max:{type:"integer",default: 10},
                               value:{type: "integer",default: undefined}
                             },
                     descriptions:["This is a wrapper for the html5 slider, to access the htmlobject use var slider=my_slider_field.getFlement(); Please use the Apoco setValue and getValue methods "]
                   },
            numberArray:{ options:{type:{type:"string",
                                         default: "integerArray",
                                         params:that.get_types("numberArray")
                                        },
                                   value:{type:"any",
                                          params:that.get_types("numberArray"),
                                          default:undefined}
                                  },
                          descriptions:[""]
                        },
            imageArray:{options:{value:{type:"imageArray",
                                        default: undefined,
                                        description: "key value javascript object"},
                                 thumbnails:{type:"boolean",default:false,description:"Display the images as thumbnails" },
                                 width:{type:"integer",default: 120,description:"width of the thumbnails"},
                                 height:{type:"integer",default: 90,description:"height of the thumbnails"}
                                },
                        descriptions:[""]
                       },
            float:{options:{precision:{type:"integer",default: 2,description:"Number of places after the decimal point" },
                            step:{type:"float",default: 0.1},
                            value:{type: "float",default: undefined}},
                   descriptions:["Float field that aligns the decimal point"]
                  },
            autoComplete:{options:{options:{type:"stringArray"},
                                   value:{type: "string",default: undefined}},
                          descriptions: ["This is a simple  autoComplete field. To access the htmlObject, use <br> <code> var auto_comp=ac.getInputElement();</code> ","  Please use the Apoco getValue and setValue methods "]
                         },
            checkBox:{ options:{ value:{type: "boolean",default: false}},
                       descriptions: [""]},
            date:{options:{value:{type:"time",default:undefined,params:["Date","string"] }},
                  descriptions:["This uses the browser datepicker(where available) or Apoco.datepicker"]
                 },
            time:{options:{value:{type:"time",default:undefined,
                                  description:"A valid partial-time as defined in [RFC 3339]."}},
                  descriptions:[""]
                 },
          /*  static:{options:{value:{type:"any",params:["string","float","integer"]}},
                    descriptions:[""]
                   }, */
            textArea:{options:{value:{type:"text",default: undefined}},
                      descriptions:[""]
                     },
            stringArray:{options:{ length:{type:"integer",
                                           default: 4,
                                           description:" Max of value array and length"},
                                   value:{type:"stringArray",default: undefined}
                                 },
                         descriptions:[""]
                        }
            };

        },
        execute:function(){
            var Options=this.field_options();
            this.fields={};
            this.mkOptions(Options);
            this.mkFieldOptionsList();
           /* for(var k in this.fields){
                console.log("fields  value %j",this.fields[k]);
                for(var h in this.fields[k]){
                    console.log("other fields is %j " ,this.fields[k][h]);
                }
            }*/
            this.Commands=this.mkFieldCommands();
            this.mkFields();
            this.mkFieldMethods();
        },
        mkOptions:function(Options){
            var HFields=HThings.Fields;
            var r=[],dpo=[];
            for(var j=0;j<HFields.length; j++){
                var f=HFields[j];
                this.fields[f]={};
                this.fields[f].required={};
                this.fields[f].options={};
                this.fields[f].IO={};
                //console.log("mkOptions: field is " + f);
                if(Options.required){
                    for(var n in Options.required){
                        this.fields[f].required[n]=Options.required[n];
                    }
                }
                if(Options.common){
                    for(var n in Options.common){
                       this.fields[f].options[n]=Options.common[n];
                    }
                }
                if(Options.IO){
                    for(var n in Options.IO){
                        this.fields[f].IO[n]=Options.IO[n];
                    }
                }
                if(Options[f].options){
                    for(var n in Options[f].options){
                       this.fields[f].options[n]=Options[f].options[n];
                    }
                }
                if(Options[f].required){
                    for(var n in Options[f].required){
                        this.fields[f].required[n]=Options[f].required[n];
                    }
                }
                if(Options[f].descriptions){
                    this.fields[f].descriptions=Options[f].descriptions;
                }
            }
        },
        mkFieldOptionsList:function(){ // make the descriptionlist
            var HFields=HThings.Fields;
            var f;
            var list_name;
            var mk_contained_list=function(obj){
                var hh="<dl>";
                for(var n in obj){
                    hh=hh.concat("<dt>" + n + "</dt>");
                    for(var m in obj[n]){
                        hh=hh.concat("<dd>"+ m + ": " + obj[n][m] + " </dd>");
                    }
                }
                hh=hh.concat("</dl>");
                return hh;
            };
            var mk_descriptions=function(obj,name){
                var t={},r;
                var BO=[];
                for(var n in obj[name]){
                    t={};
                    t.label=n;
                    t.descriptions=new Array;
                    for(var m in obj[name][n]){
                        if(m === "descriptions"){
                            t.descriptions.push("description:");
                            for(var i=0;i<obj[name][n][m].length;i++){
                                t.descriptions.push(obj[name][n][m][i]);
                            }
                        }
                        else if(m === "dependsOn"){
                            t.descriptions.push("<br>type dependent options");
                            r=mk_contained_list(obj[name][n][m]);
                            t.descriptions.push(r);
                        }
                        else{
                            t.descriptions.push((m + ":  " + obj[name][n][m] + " "));
                        }
                    }
                    BO.push(t);
                }
                list_name=(name + "_list");
                obj[list_name]=BO;
            };
            for(var i=0;i<HFields.length;i++){
                f=HFields[i];
                if(this.fields[f].required){
                    mk_descriptions(this.fields[f],"required");
                }
                if(this.fields[f].options){
                    mk_descriptions(this.fields[f],"options");
                }
                if(this.fields[f].IO){
                    mk_descriptions(this.fields[f],"IO");
                }
            }
        },
        mkFieldCommands:function(no_var_equals){
            var that=this;
            var Commands=[];
            var f,k,v;
            var HFields=HThings.Fields;

            var field_desirable={
                autoComplete:["options"],
               // static:["value"],
                stringArray:["value"],
                float:["value"],
                numberArray:["value","type"],
                input:["value","type"],
                imageArray:["thumbnails"]
            };
            for(var i=0;i<HFields.length;i++){
                f=HFields[i];
                var c="";
              //  console.log("Creating command for " + HFields[i]);
                if(no_var_equals){
                    c="{field:'" + HFields[i] + "'";
                }
                else{
                    c="var dataObject={field:'" + HFields[i] + "'";
                }
               // console.log(" c is " + c);
                // get the globally required opts
                v=this.fields[f].required;
                for(k in v){
                  //  console.log("GETTING REQUIRED");
                    c=c.concat("," + k + ":" + JSON.stringify(getAType[v[k].type]));
                }
                c=c.concat(", label: 'A Label'");

                if(field_desirable[HFields[i]]){
                    var fd=field_desirable[HFields[i]];
                    for(var j=0;j<fd.length;j++){
                        var n=this.fields[f].options[fd[j]];
                        //console.log("desirable field for " + fd[j] + " type " + n.type );
                        if(n){
                            c=c.concat(","+ fd[j] + ":");
                          //  console.log("adding desirable field " + fd[j] + " with type " + n.type);
                            if(n.default !== undefined){
                            //    console.log("adding default " + n.default);
                                c=c.concat(JSON.stringify(n.default));
                            }
                            else if(n.type){
                                if(n.type === "any"){
                                    if(this.fields[f].options[fd[j]].params){
                                        n.type=this.fields[f].options[fd[j]].params[0];
                                    }
                                }
                                c=c.concat(JSON.stringify(getAType[n.type]));
                            }
                        }
                    }
                }
                c=c.concat("};");
              //  console.log("Made command index i " + i + " cmd " + c);
                Commands[i]=c;
            }
            return Commands;
        },
        mkFields:function(){
            var f,fields=[];
            var that=this;
            var HFields=HThings.Fields;

            for(var i=0;i<HFields.length;i++){
             //  console.log("++++++++++++++++++== mkFields making " + HFields[i]);
                var k={};
                f=HFields[i];
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
                              {node: "paragraph",text: "Called as a standalone -"},
                              {node:"paragraph", text: " <code>var f=Apoco.field['" +HFields[i] +"'](dataObject,element);</code>"},
                              {node:"paragraph",text: "or as part of a display grid, fieldset or form"},
                              {node:"paragraph",text: "<code>{field:" + HFields[i] + " //... other options } </code>"},
                              {node:"paragraph",text:that.fields[f].descriptions},
                              {node: "heading",size: "h5",text: "dataObject settings"},
                              {node: "heading",size: "h5", text: "Required"},
                              {node: "descriptionList", items:that.fields[f].required_list},
                              {node: "heading", size: "h5", text: "Options"},
                              {node: "descriptionList", items:that.fields[f].options_list},
                              {node: "heading", size: "h5", text: "IO Options"},
                              {node: "descriptionList", items:that.fields[f].IO_list},
                              {node: "heading",size: "h5",text: "Live example"},
                              {name: "Input_params",field: "textArea", value: that.Commands[i]},
                              {name: "doit", node: "button", text: "Go",
                               action: function(that){
                                   //                        console.log("button action is here");
                                   var f=that.parent.getChild("Input_params");
                                   if(!f){
                                       throw new Error("can't get input params");
                                   }
                                //   console.log("f.getValue is %j",f.getValue());
                                   globalEval(f.getValue());
                                   //         console.log("parms are " + dataObject);
                                   if(Apoco.type["object"].check(dataObject)){
                                       //             console.log("and it is an object");
                                       var name=dataObject.name;
                                       if(that.parent.getChild(name)){
                                         //  console.log("deleting child");
                                           that.parent.deleteChild(name);
                                       }
                                       //            console.log("adding child");
                                       that.parent.addField(dataObject);
                                   }
                                   else{
                                       Apoco.display.dialog("Error", "Input is not a valid object");
                                   }
                               }
                              }
                             ];
                UI.Panels.Fields.components.push(k);
            }
        },
        mkFieldMethods: function(){
            var HFields=HThings.Fields;
            var fields=[];
            var field_methods_list={
                getValue:{descriptions:[
                    "<code>var r=field.getValue();</code>",
                    "return: type",
                    'returns the value currently displayed in the DOM <br> Use _reset() to set the values to the last setValue  <br>if no value is set returns "undefined"']
                         },
                setValue:{descriptions:[
                    "<code>var r=field.setValue(value[,index]);</code>",
                    "return: void",
                    "If the field is an array, value is an array, or a single value and index into the array<br> Set Value is the way to update values in memory"
                ]},
                checkValue:{descriptions:[
                    "<code>var r=field.checkValue();</code>",
                    "return: boolean",
                    "If the type has been specified checks the value is of the specified type "
                ]},
                getElement: {descriptions:[
                    "<code>var r=field.getElement();<code>",
                    "return: HTMLObject",
                    "The original html node supplied in the call to Apoco.Field"
                ] },
                getKey: {descriptions:[
                    "<code>var r=field.getKey();</code>",
                    "return: string",
                    "The name if it exists,or label if that has been supplied or null"
                ]},
                getInputElement:{descriptions:[
                    "<code>var r=field.getInputElement()</code>",
                    "return:HTMLObject",
                    "The input node"
                ]},
                resetValue:{descriptions:[
                    "<code>var r=field.resetValue()</code>",
                    "set the values of the DOM to the last good setValue() call or initial values"
                ]},
                delete:{descriptions:["<code> field.delete();</code>",
                                      "return void","delete the field"]},
                deleteValue:{ descriptions:["<code> field.deleteValue(value);</code>","return: void"]},
                addValue:{ descriptions:["<code> var r=field.addValue(new_value);</code>"]},
                popupEditor:{descriptions:["<code>field.popupEditor(function); </code>","return void",
                                           "supply the function to be called "]},
                getLabel:{descriptions:["<code>var r=field.getLabel();</code>","return string",
                                        "get the htmllabel element"]},
                mkThumbnails:{descriptions:["<code>field.mkThumbnails();</code>","make thumbnails from values array"]},
                loadImages:{descriptions:["<code>var promisee=field.loadImages(valueArray);</code>","returns an array of javascript promises","valueArray: Object array e.g","<code>valueArray=[{src:'pathToImage',url:'',title:'my_title',width:'100px',height: '100px'}];</code>",
                                          "load images from the values array"]},
                finishedLoading:{descriptions:["<code> var promise=field.finishedLoading();</code>","returns a promise"]},
                reset:{descriptions:["<code>field.reset();</code>","set all the values to false"]}
            };
            var items=[],fm;
              
  
            for(var i=0;i<HFields.length;i++){
                //console.log("mkFieldMethods making " + HFields[i]);
                var k={};
                items=[];
                fm=Apoco.field[HFields[i]+"Methods"]();
                Apoco.sort(fm,"string");
                for(var j=0;j<fm.length;j++){
                 //   console.log("method is "+fm[j]);
                    if(!fm[j].startsWith("_") && fm[j] !== "constructor"){
                        var m=fm[j];
                        items.push({label:m,
                                    descriptions:field_methods_list[m].descriptions});
                    }
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
                                   nf.setText(JSON.stringify(value));

                               }},
                              {node:"paragraph",text:"Result"},
                              {node:"heading",name:"Result",size:"h5" }

                             ];

                globalEval(this.Commands[i]);
                k.components.push(dataObject);

                UI.Panels.Fields.components.push(k);
            }
         }
    };

    var select_menu=function(that){
        var name=that.name;
        var p=that.parent.getSibling();
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
            alphaNum:{
                test:'["gh&*","yu78h","YU90","777 90"]',
                items:[{label: "description",description:"Any combination of letters and numbers"}]},
            alphabetic:{
                test:'["dfs8","fsfsd","667",66,";rr","/fs"]',
                items:[{label:"description",description: "strict alphabetic characters"}]
            },
            any:{
                test:'[34,"sdds","fs",104.4]',
                items:[{label:"description",description:""}]
            },
            array:{
                test:'[43,[3,4,5],"dddd",["ddd",55]]',
                items:[{label:"description",description:"any array"}]
            },
            blank:{
                test:'["",55,[1,3,4],null,false,undefined]',
                items:[{label:"description",description:"empty value"}]
            },
            boolean:{
                test:'[0,true,false,1,"true","uuio89"]',
                items:[{label:"description",description:"true,false,'true','false'"}]
            },
            booleanArray:{
                test:'[43,[3,4,5],[true,false],[0,1,0,0],"dddd",["ddd",55]]',
                items:[{label:"description",description:"any array"}]
            },
            count:{
                test:'[34,"sdds","fs",104.4]',
                items:[{label:"description",description:""}]
            },
            currency:{
                test:'["£39.00","$89.90","GBP78","udf90,67"]',
                items:[{label:"description",description:"currency with or without 3 letter currency code prefix"}]
            },
            date:{
                test:'["20160623","3rd October 2016","2017-05-23","780","7878wewe"]',
                items:[{label:"description",description:"YYYY-MM-DD or YYYYMMDD"}]
            },
            decimal:{
                test:'[34,"sdds","fs",104.4]',
                items:[{label:"description",description:""}]
            },            
            email:{
                test:'["junk@nowhere.com","uiui@op"]',
                items:[{label:"description",description:"e.g me@thisplace.com"}]
            },
            file:{
                test:'[34,"sdds","fs",104.4]',
                items:[{label:"description",description:""}]
            },
            float:{
                test:'[89.90,90,"89d", .90]',
                items:[{label:"description",description:"floating point number "}]
            },
            floatArray:{
                test:'[[5.6,4.6,33.5],[444.55,"3wa",424]]',
                items:[{label:"description",description:"an array of floating point numbers"}]
            },
            function:{
                test:'[89.90,function(){var a=1;},"89d", Apoco.Utils.dateNow]',
                items:[{label:"description",description:"Any function "}]
            },
            image:{
                test:'[{kiml:"ioioi"}]',
                items:[{label:"description",description:"checks an image element"}]
            },
            imageArray:{
                test:'[[]]',
                items:[{label:"description",description:"an array of image elements"}]
            },
            integer:{
                test:'[90,90.3,"ete","te5","-10","+23","-45/6"]',
                items:[{label:"description",description:"positive or negative whole number"}]
            },
            integerArray:{
                test:'[[5,6,7,8],[89.5,45.76,34]]',
                items:[{label:"description",description:"array of integers"}]
            },
            negativeInteger:{
                test:'[-45,9.5,-6.4,"rrr"]',
                items:[{label:"description",description:""}]
            },
            number:{
                test:'[-45,9.5,-6.4,"rrr"]',
                items:[{label:"description",description:""}]
            },
            object:{
                test:'[-45,9.5,-6.4,{s:"rrr"}]',
                items:[{label:"description",description:""}]
            },
            objectArray:{
                test:'[[5,6,7,8],[89.5,45.76,34],[{},{a:"ddd"}]]',
                items:[{label:"description",description:"array of objects"}]
            },
            password:{
                test:'["ioioioi","uiioouiu"]',
                items:[{label:"description",description:""}]
            },
            phoneNumber:{
                test:'[89898998,"90wr54"]',
                items:[{label:"description",description:""}]
            },
            positiveInteger:{
                test:'[90,"909ewr",666.4,-34]',
                items:[{label:"description",description:""}]
            },
            range:{
                test:'[42.55,"3wa",42,-10]',
                items:[{label:"description",description:""}]
            },
            string:{
                test:'["erre",78.6]',
                items:[{label:"description",description:""}]
            },
            stringArray:{
                test:'[["6767",7878,"re"],["sss","uiui","dog"]]',
                items:[{label:"description",description:""}]},
            text:{
                test:'["yuyuyuy",898.99]',
                items:[{label:"description",description:""}]
            },
            time:{
                test:'[78,"10:02 PM","23:33:45","10:34"]',
                items:[{label:"description",description:""}]
            },
            token:{
                test:'["7878","78fs-rte",65,"%4","^89"]',
                items:[{label:"description",description:""}]
            },
            url:{
                test:'[42.55,"www.junk",42,"http://www.hybj.com"]',
                items:[{label:"description",description:""}]
            }
 
        };

        for(var i=0;i<HTypes.length;i++){
         //   console.log("======== type is ++++++++++= " + HTypes[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.id=HTypes[i];
            k.hidden=true;
            if(!tests[HTypes[i]]){
                throw new Error("test for " + HTypes[i] + " does not exist");
            }
            var c=" var results=[]; var test= " + tests[HTypes[i]].test + ";  for(var i=0;i<test.length;i++){ results[i]=Apoco.type['" +  HTypes[i] + "'].check(test[i]);  }";
            
            k.components=[{node: "heading",size: "h3", text: HTypes[i]},
                          {node: "descriptionList",items:tests[HTypes[i]].items},
                          {node:"paragraph", text: "Live tests"},
                          {name: "Input_params",field: "textArea", value: c},
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
                               var f=that.parent.getChild("Input_params");
                               //console.log("f is " + f.getValue());
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                               globalEval(f.getValue());
                               console.log("got " + JSON.stringify(results));
                               var c=this.parent.getChild("result");
                               if(!c){
                                   throw new Error("Cannot find result node");
                               }
                               var t=new String;
                               for(var i=0;i<results.length;i++){
                                   t=t.concat("" + test[i] + " is " + results[i] + "<br>");
                               }
                               console.log("formatted results  " + JSON.stringify(t));
                               console.log("paragraph node is " + c);
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
        var opts=Apoco.node("node_list");
        var Commands=[];

        var opts={
            anchor:{
                parms:{href:"href",text:"string",target:"target"},
                options:{
                    items:[{label: 'href',descriptions:["type: string","a url"]},
                           {label: "text",descriptions: ["type: string",'the clickable text that appears in the DOM']},
                           {label: "target",descriptions: ["type:string","where to open the link "]}]
                },
                methods:[{label:"f.setText(string);",description:"params: string - text to insert"}]
            },
            descriptionList:{
                parms:{items:[ "objectArray"]},
                required:{
                    items:[{label:"objectArray",descriptions: ["type: {label(s): 'string(Array)',description(s): 'string(Array)'}", "where ", "[{label:'string',description:'text'}","{labels:'stringArray',descriptions:'stringArray'}];"]},
                           {label:"Example:",description:"<code>var items=[{label:'myLabel',description:'some description'},<br> {labels:['one','two'],descriptions:['describe something','and another thing']}];<code>"}]
                }

            },
            heading:{
                parms:{size:"size",text:"text"},
                required:{
                    items:[{label:"size",descriptions: ["type: string","size param: one of the following sizes","'h1'","'h2'","'h3'","'h4'","'h5'" ]}]
                },
                methods:[{label:"f.setText(string);",description:"params: string - text to insert"}]

            },
            image:{
                parms:{src:"path"},
                required:{items:[{label:"src",descriptions:["type: string","path to image"]}]},
                options:{
                    items:[{label:"width",descriptions:["type: integer","integer width of the html image node"]},
                           {label: "height",descriptions:["type: integer","integer height of the html image node"]}]
                }
            },
            label:{
                parms:{text:"string",for:"string"},
                options:{
                    items:[{label: 'for',description:"optional, id of the html element the label belongs to " }]
                },
                methods:[{label:"f.setText(string);",description:"params: string - text to insert"}]

            },
            list:{
                parms:{list:"stringArray"},
                required:{
                    items:[{label: "stringArray",description:"example: ['one','two'.'three']"}]
                }

            },
            code:{
                parms:{text:"text"},
                required:{
                    items:[{label: "text",description:"text will be displayed as code"}]
                }

            },
            paragraph:{
                parms:{text:"text"},
                options:{
                    items:[{label: "text",description:"the text can contain unicode and things like ' &#60br&#62'"}]
                },
                methods:[{label:"f.setText(string);",description:"params: string - text to insert"}]

            },
            paginate:{
                parms:{number:"integer",action:'function(that){alert("clicked page" + that.current_num);}'},
                required:{
                    items:[{label:"number",description:"number of objects in the paginator"}]
                },
                options:{
                    items:[{label: "action", description: "function with one parm the paginator context"}]
                }
            },
            clock:{
                parms:{}
            },
            button:{
                parms:{text:"string",action:"function(that){alert('button pressed');}"},
                options:{
                    items:[{label:"action",descriptions:["type: function","function to call when button is clicked"]}]
                }
            },
            whatever:{
                parms:{nodeType: "nodeType"},
                required: {
                    items:[{label:"nodeType",description:"any valid html element"}]
                },
                options:{
                    items:[{label:"text",description: "text to add to element if applicable"}]
                }
            }
        };

        for(var i=0;i<HNodes.length;i++){
            var k={};
            var t_opts=new String;
            Commands[i]=("var node=Apoco.node({node:'" + HNodes[i] +"'" + ",name: 'TESTNODE'");
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
            if(!opts[HNodes[i]].required){
                opts[HNodes[i]].required={};
                opts[HNodes[i]].required.items=[];
            }
            if(!opts[HNodes[i]].options){
                opts[HNodes[i]].options={};
                opts[HNodes[i]].options.items=[];
            }
            var common_options=[{label:"id",descriptions:["type: string ", "Add an id"]},{label:"class",descriptions:["type: string","add a class to the node"]},{label:"name",descriptions:["type: string","add a name attribute to the node"]}];
            opts[HNodes[i]].required.items.push({label:'node',description:"type: string - " + HNodes[i]});
            for(var j=0;j<common_options.length;j++){
                opts[HNodes[i]].options.items.push(common_options[j]);
            }
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
                          // {node:"paragraph", text: "<code>var node=Apoco.node({node:'" + HNodes[i] + "'" + t_opts + "});</code>"},
                          {node:"code", text: "var node=Apoco.node({node:'" + HNodes[i] + "'" + t_opts + "});"},
                          {node: "heading",size: "h3",text: "Settings"},
                          {node: "heading",size: "h5",text:"required"},
                          {node: "descriptionList",items:opts[HNodes[i]].required.items},
                          {node: "heading",size: "h5",text:"Options"},
                          {node: "descriptionList",items:opts[HNodes[i]].options.items},
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
                               if(Apoco.type["object"].check(node)){
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
                                   Apoco.display.dialog("Error", "Input is not a valid object");
                               }
                           }
                          },
                          {node:'heading',size:'h4',text:'Methods'},
                          {node:'descriptionList',items:[{label:'node.getElement();',descriptions:['params: none','return: HTML element Object']}]}

            ];
            if(opts[HNodes[i]].methods){
                k.components.push({node:'descriptionList',items:opts[HNodes[i]].methods});
            }
            UI.Panels.Nodes.components.push(k);
        }
    };



    var mkDisplays=function(){

        var stuff={
            fieldset:{required:[{label:"components",descriptions:[ "An array of nodes and/or field objects","example",
                                                                   "<code>components: [{node:'heading',size:'h4',text:'heading'},{field:'float',name:'some_name',value:10.0}}]</code>"]}],
                      options:[{label:"hidden",descriptions:["type:boolean","default: false","add the node to the DOM"]}]
                     },
            form:{required:[{label:"components",descriptions:[ "An array of nodes and/or field objects","example",
                                                               "<code>components: [{node:'heading',size:'h4',text:'heading'},{field:'float',name:'some_name',value:10.0}}]</code>"]}],
                  options:[{label:"buttons",descriptions:["an array of button objects","example","<code> buttons: [{name: 'string',text:'string',action: function(that){ //some code }}]</code>"]},{label:"hidden",descriptions:["type:boolean","default: false","add the node to the DOM"]},
                           {label:"draggable",descriptions:["type: boolean","default: true","if true the form is detached and can be dragged around the browser window"]},
                           {label: "label",description: "type: string"}]},
            grid:{required:[{label: "cols",descriptions:["type: objectArray","array of fields based on type","example","<code>cols:[{name:'colname1',type:'string',editable:false},{name:'colname2',type:'float',required:true,resizable:true,precision:2,step:0.1}]<code>"]},
                            {label:"rows",descriptions:["type:objectArray","if the cols were defined as above then the rows would be","<code> rows:[{colname1:'some_string',colname2:23.53},{colname1:'another_string',colname2:34.66}]"]}],
                  options:[
                      {label:"userSortable",descriptions:["type: boolean","can the user sort the cols","userSortable and sortOrder are mutually exclusive"]},
                      {label:"sortOrder",descriptions:["type:stringArray","column names to sort the grid rows","example","<code>sortOrder:['colname1','colname2']<code","sort the rows first by colname1 and then colname2"]},
                      {label:"groupBy",descriptions:["type: stting","split the row data into separate grids based on the value of the column in the row data","example","<code>groupBy: 'colname1',<code>","if the column has a label it will be used as a the subgrid seperator"]},
                      {label:"uniqueKey",descriptions:["type: string","the column name of the uniqueKey if it exists"]},
                      {label: "resizable",descriptions:["type: boolean","Add the resize widget to the bottom rhs"]},
                       {label:"hidden",descriptions:["type:boolean","default: false","add the node to the DOM"]}
                  ]},
            menu:{  required:[{label: "list",description:""}],
                    options:[{label: "label",description:""},
                             {label:"hidden",descriptions:["type:boolean","default: false","add the node to the DOM"]},
                             {label: "heading",description:""},
                            ]},
            slideshow:{options:[{label: "values",descriptions:["type: objectArray","array of Image objects","<code> var values=[{src:'css/images/image1.png'},{src:'css/images/image2.png'}]"]},
                                {label: "delay",descriptions:["type: integer","default: 4000", "time in milliseconds to display each image"]},
                                {label:"controls",descriptions:["type: Boolean","default: true","display the controls"]},
                                {label:"thumbnails",descriptions:["type: Boolean","default: false","display the thumbnails"]},
                                {label: "autoplay",descriptions:["type: Boolean","default: true","start playing immeditately"]},
                                {label:"hidden",descriptions:["type:boolean","default: false","add the node to the DOM"]},
	                        {label:"fullscreen",descriptions:["type: Boolean","default: true","Allow images to be fullscreen"]},
                                {label: "fade",descriptions:["type: Boolean","default: false","Crossfade between the images"]},
                                {label: "fadeDuration",descriptions:["type: integer","default:2000","Length of fade in milliseconds- must be less than delay"]}
                               ],
                       required:[]
                      },
            tabs:{required:[{label: "tabs",descriptions:["type: objectArray","example","<code> tabs:[{name:'some_string',label:'lovely label'},{name:'another_name',label:'very lovely label'}]","this would creates two tabs with the labels displayed as 'lovely label', 'very lovely label'"]}],
                  options:[{label:"hidden",descriptions:["type:boolean","default: false","add the node to the DOM"]}
                          ]
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
              //  console.log("triggering click with id ", that.id);
                var p=that.getChild("doit");
                p.element.click();
                var dobj=window[(that.id + "_obj")];
                if(dobj){
                    dobj.hide();  // hide the display first time round
                }
            },
            k.components=[{node: "heading",size: "h3", text: HDisplays[i]},
                          {node:"paragraph", text: "<code>var node=Apoco.display['" + HDisplays[i] + "'](dataObject);</code>"},
                          {node: "heading",size: "h4",text: "dataObject settings"},
                          {node: "heading",size: "h5",text: "required"},
                          {node: "descriptionList",items:[{label: "DOM",descriptions:["type: string","an existing node with an id (do not include #) which is used as the parent for the display"]},
                                                          {label: "id",descriptions:["type: string","id of the base htmlObject the display creates"]}]
                          },
                          {node:"descriptionList", items:stuff[HDisplays[i]].required},
                          {node: "heading",size: "h5",text: "options"},
                          {node: "descriptionList",items:[{label:"action",descriptions:["type: function","example","<code> action:function(that){//some code - that=this}<code>"]},
                                                          {label:"dependsOn",descriptions:["type: string","id of the node that needs to be created before the action function is run","example","<code> dependsOn:'nodeId'"]},
                                                          {label:"publish",descriptions:["type: objectArray","example","<code>publish:[{name:'some_name',action:function(that,name){ var data=that.myGetData(); <br> Apoco.dispatch(name,data)}}]</code>"]},
                                                          {label:"listen",descriptions:["type: objectArray","example","<code>listen:[{name:'some_name',action:function(that,data){//do something}}]<code>"]},
                                                          {label:"after",descriptions:["type: string","where the string is the id of an element that the new elemnent will be displayed after"]}]},
                          {node:"descriptionList",items:stuff[HDisplays[i]].options},
                          {node: "heading",size:'h4',text:"live Demo"},
                          {node: "paragraph",text:"Please Note that the display Object is being added to the global window namespace for slight security and ease of access for the methods below"},
                          {name: "Input_params",field: "textArea",
                           value: "var " + HDisplays[i] + "_obj=Apoco.display['" + HDisplays[i] + "']({DOM:'right',id:'" + HDisplays[i] + "Display', after:'" + HDisplays[i] + "', " + command[HDisplays[i]] + "});"},
                          {node:'button',name:'doit',text: "Go",
                           action: function(that){
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                               var n=that.parent.id;
                               globalEval(f.getValue());
                               var d=Apoco.Panel.get("Displays").getChild((n+"Display"));
                               if( d!== null){
                                   Apoco.Panel.get("Displays").deleteChild((n+"Display"));
                               }
                               var p=window[(n + "_obj")];
                               if(p){
                                   dobj=p;
                               }
                               else{
                                   throw new Error("Display Object " + n + " not in the DOM");
                               }
                               if(!Apoco.type['object'].check(dobj)){
                                   throw new Error("Cannot find display Object - Bad return");
                               }
                               Apoco.Panel.get("Displays").addChild(dobj);
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
           // console.log("getting method for " + HDisplays[i]);
            Methods[HDisplays[i]]=[];
            var p=Apoco.display[(HDisplays[i]+"Methods")]();
            Apoco.sort(p,"string");
            for(var j=0;j<p.length; j++){
             //   console.log("display " + HDisplays[i] + " has method " + p[j]);
                if(p[j] !== "constructor" && !p[j].startsWith("_")){
                    Methods[HDisplays[i]].push(p[j]);
                }
            }

        }
        var display_methods_list={
            show:["<code> var v=my_display.show();</code>","params: none","return: boolean","add the root display element to the DOM"],
            getElement:["<code> var v=my_display.getElement();</code>","params: none","return: htmlobject"," the root element of the display"],
            getChild:["<code>var c=my_display.getChild(name);</code>","params: type: string - name as defined in the components array ","return: object","returns null on fail"],
            getChildren:["<code> var v=my_display.getChildren();</code>","params: none","return: object","where the object has keys fields, tabs,grids etc depending on the type of children the display object creates"],
            getDisplayType:["<code> var v=my_display.getDisplayType();</code>","params: none","return: string","e.g 'tabs','form' etc"],
            getName:["<code> var v=my_display.getName(); </code>","return: string","params: none","returns the name if it exists"],
            getKey:["<code> var v=my_display.getKey(); </code> ","return string","params: none"," return the name if it exists or id(which must exist)"],
            getParent:["<code> var v=my_display.getParent(); </code>","params: none","return: Panel object"," returns window if it exists"],
            getSibling:["<code> var v=my_display.getSibling(); </code>","params:name, id or none","return: objectArray or object instance if name is given"," array of the other display objects that are in the same Panel"],
            hide: ["<code> my_display.hide(); </code>","return: none","params: none","remove the display from the DOM"],
            check: ["<code>var r=my_display.check();</code>","params: none","return: boolean"],
            delete: ["<code> my_display.delete(); </code>","return: none","params: none","delete the display object and all it's children from memory"],
            update: ["<code>my_display.update(name);</code>","params: name(string)","return: none","set the current selected  element to name"],
            getTabs:["<code> var v=my_display.getTabs(); </code>","params: none"],
            addTab:["<code> my_display.addTab(tab_object,[ ,html_tab_object]);</code>","params: tab_object, e.g <code> tab_object={name:'new_tab_name',action: my_func}</code> <br> html_tab_object- html object type ul (optional) defaults to the current object","return: none "],
            getTab:["<code>var t=my_display.getTab([ ,name]);</code>","params: name (string) or none, name of an existing tab object","return: none"],
            deleteTab:["<code>my_display.deleteTab(name);</code>","params: name(string)","return: none"],
            select: ["<code> my_display.select(name)</code>","params: name(string)","return: none"],
            addNode:["<code> my_display.addNode(node_object); </code>"],
            addField:["<code> my_display.addField(field_object); </code>"],
            getJSON: ["<code> var js=my_display.getJSON();</code>"],
            resetInvalid:["<code>my_display.resetInvalid();</code>","params: none","return: none","reset all fields to last known good value"],
            submit: [],
            play:["<code>my_display.play();</code>","start playback"],
            step:["<code>my_display.step(dir);</code>","params: dir (string) either 'next' or 'prev'","step forward one frame"],
            showFullscreen:["<code>my_display.showFullscreen();</code>","params: none","return: none","toggles fullscreen mode, i.e called once makes the display fullscreen called again it pops it back into the DOM tree"],
            stop:["<code>my_display.stop();</code>","stop playback"],
            sort: ["<code> my_display.sort([ ,grid_object]) </code>","params:none or grid object as returned by getGrid ","return: none (throws error on fail)","If no grid_object is specified sorts all the grids","Sorts using sortOrder if given or uniqueKey if that has been supplied"],
            isHidden:["<code> var t=my_display.isHidden(); </code>","params: none","return: boolean"],
            displayType:["<code> var t=my_display.displayType(); </code>","params: none","return: string"],
            getField:["<code> var f=my_display.getField(name); </code>"],
            deleteChild:["<code> my_display.deleteChild(name); </code>"],
            addButton:["<code> my_display.addButton(button_object); </code>","params: button_object - e.g <code> var button_object={name: 'new_button',action: my_func}</code>"],
            addMenu:["<code>my_display.addMenu(menu_object);</code>","params: menu_object - e.g <code> var=menu_object={name;'new_name'}; </code>"],
            deleteMenu:["<code>my_display.deleteMenu(name);</code>","params: name (string) - name of menu to delete","return: none"],
            getMenu:["<code> var m=my_display.getMenu([ ,name]);</code>","params: name(string) or none","return: if the name parameter is supplies returns the named menu object, otherwise returns an array of all the menus"],
            deleteButton:["<code>my_display.deleteButton(name);</code>","params: name(string) - name of button to delete","return: none"],
            getButton:["<code>var b=my_display.getButton([ ,name])</code>","params: name(string) or none","return: button object if name is supplied or array of all the buttons if no parms submitted" ],
            getSelected:["<code>var s=my_display.getSelected();</code>","params: none","return: selected Object or null"],
            getNode:["<code>var n=my_display.getNode([ ,name]);</code>","params: name(string) or none","return: node object if name is supplied or array of nodes"],
            deleteAll:["<code>my_display.deleteAll();</code>","params: none","return: none","deletes all the children of the displayObject"],
            deleteNode:["<code>my_display.deleteNode(name);</code>","params: name (string)","return: none"],
            deleteField:["<code> my_display.deleteField(name);</code>","params: name (string)","return: none"],
            deleteRow:["<code>my_display.deleteRow(key,[ ,grid_name]);</code>","params: "],
            deleteCol:["<code> my_display.deleteCol(col_name)</code>","params: string (col_name)","return: none"],
            addGrid:["<code>my_display.addGrid(grid_object);</code>","params: grid_object - as returned by getFrid()"],
            getRow:["<code>var r=my_display.getRow(key,[ ,grid_name],[ ,closest]);</code>","params: key -key value pairs that uniquely identify the row e.g if the grid has a unique key then <code> key={'uniqueKey': 10}</code> <br> grid_name - optional (name of the grid) if not given sorts through all the grids <br> closest: object e.g <code> var closest={} </code> optional if supplied and the row does not exist returns the closest_object with  keys e.g <code> closest={index: 10, dir: 'before'} <code> where dir is 'before' or 'after'","return: row_object or null if not found" ],
            addRow:["<code>my_display.addRow(row_object);</code>","params: row_object e.g <code> var r=my_display.addRow({stock:'XXX' value: 1,class:109,date:'2016-08-30'});<code> ","return: row_object"],
            addCol:["<code> my_display.addCol(col_object); </code>","params: col_object e.g <code> my_display.addCol({name:'other',type:'string',editable:false}); <code>","return: none - throws error on fail"],
            getColIndex:["<code>var v=my_display.getColIndex([ ,col_name]); </code>","parms: 'string',column name or none","return: integer - null on fail"],
            getCol: ["<code> var c=my_display.getCol([ ,name])</code>","params: name string or none","return: col_object is name is supplied or an array of cols if it is not"],
            getGrid: ["<code> var v=my_display.getGrid([ ,grid_name]); </code>","params: none or grid_name","return the grid object for named grid_name or an array of grids if the name is not supplied"],
            showGrid: ["<code> var v=my_display.showGrid(grid_name); </code>"],
            hideGrid: ["<code> var v=my_display.hideGrid(grid_name); </code>"],
            insertRow: ["<code> var v=my_display.insertRow(row); </code>"],
            redrawRows: ["<code> var v=my_display.redrawRows(grid_name); </code>"],
            updateRow: ["<code> var v=my_display.updateRow(row); </code>"],
            getRowFromElement: ["<code> var v=my_display.getRowFromElement(htmlObject); </code>"],
            print: ["<code> var v=my_display.print(); </code>"],
            start: ["<code> var v=my_display.start(); </code>"]
        };
        var items=[];
        for(var i=0;i<HDisplays.length;i++){
           //console.log("mkFieldMethods making " + HDisplays[i]);
            var k={};
            items[i]=[];
            for(var j in Methods[HDisplays[i]]){
                var m=Methods[HDisplays[i]][j];
             //   console.log("Methods " + m);
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
                           value: "var v=window." + HDisplays[i]+"_obj.getKey();"},
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
                               //                  console.log("button action is here");
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }
                              // console.log("text area is " + f.getValue());
                               globalEval(f.getValue());
                               var nf=that.parent.getChild("Result");
                               try{
                                   nf.setValue(JSON.stringify(v));
                               }
                               catch(e){
                                   console.log("methods doit got %j", v);
                                   nf.textContent=v;
                               }
                            }},
                          {node:"paragraph",text:"Result"},
                          {node:"heading",name:"Result",size:"h5" }

                         ];

           UI.Panels.Displays.components.push(k);
        }
    };

    var mkPopups=function(){
        var HPopups=HThings["Popups"];

        var command={
            alert:  function(c){ return c.concat('("Hi, An alert");');},
            dialog:function(c){return c.concat('("title","my message");');},
            error:function(c){return c.concat('("title","my message");');},
         /*   paginate:function(c){return c.concat('({DOM:"right",values:[{text:"1",action:function(that){alert("got a click");}},{text:"2",action:function(that){alert("got a click");}}]});');},
            progressBar:function(c){return c.concat( '(4);');}, */
            spinner: function(c){return c.concat('(true);');},
            statusCode:function(c){return c.concat( '[204]("Some more text");');},
            trouble:function(c){return c.concat('("TEST TROUBLE","something horrible text")');}
        };
        var ttt={
            statusCode:{items:[{label: "ERROR_CODE",descriptions:["type: integer","required: true","one of the following"]},
                               {label: 204,description: "There is no content for this page "},

	                       {label:205,description:"Response requires that the requester reset the document view "},
		               {label:400,description:"Bad request "},

	                       {label:401,description: "Unauthorised "},

	                       {label:403,description: "Forbidden " },

	                       {label:404,description:"Not Found "},
	                       {label: 410,description:" Gone "},
	                       {label:413,description:"Request entity too large "},
	                       {label: 424,description:"Method Failure "},
	                       {label: 500,description:"Internal server error "},
	                       {label:501,description:"Not Implemented "},
	                       {label: 503,description: "Service unavailable "},
	                       {label: 511,description:"Network authentication required " },
                               {label: " ",description:"<br>"},
                               {label: "text",descriptions: ["type: string","required: false"]}
                              ],
                        cmd: function(c){return c.concat( '[204]("Some more text");');},
                        usage: "<code>Apoco.popup['statusCode'][ERROR_CODE](text); </code>",
                        ret: "none"
                       },
            alert:{items:[{label:"text",description:"type: string, required: false "}],
                   cmd:  function(c){ return c.concat('("Hi, An alert");');},
                   usage:" <code>Apoco.popup['alert'](title);</code>",
                   ret: "HTML Element Object"
                  },
            dialog:{items:[{label:"title",description:"type: string, required: true"},
                           {label:"text",description:"type: string, required: false"},
                           {label: "modal",description: "type: boolean, required: false, default: false"}
                          ],
                    cmd: function(c){return c.concat('("title","my message");');},
                    usage: " <code>Apoco.popup['dialog'](title,[ ,text],[ , modal]);</code> ",
                    ret: "Object"
                   },
            error:{items:[{label: "title",description:"type: string, required: true"},
                          {label: "text",description: "type: string, required: false"}],
                   cmd: function(c){return c.concat('("title","my message");');},
                   usage:"<code>Apoco.popup['error'](title,text);</code>",
                   ret: "none"
                  },
            spinner:{items:[{label:"value",description:"type: boolean, required: true"}],
                     cmd:  function(c){return c.concat('(true);');},
                     usage:"<code>Apoco.popup['spinner'](value);</code>",
                     ret: "HTML Element Object"
                    },
            trouble:{items:[{label:"title",description:"type:string , required: true"},
                            {label: "text",description: "type: string, required: false"}
                           ],
                     cmd: function(c){return c.concat('("TEST TROUBLE","something horrible text")');},
                     usage:"<code>Apoco.popup['trouble'](title,text);</code>",
                     ret: "HTML Element Object"
                    }
        };

        for(var i=0;i<HPopups.length;i++){
            var c= "var dobj=Apoco.popup['" + HPopups[i] + "']" ;
            var cmd=ttt[HPopups[i]].cmd(c);

            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=HPopups[i];
            k.components=[{node:"heading",size:"h3",text: HPopups[i]},
                          {node:"heading",size:"h4",text: "Usage"},
                          {node: "paragraph",text: ttt[HPopups[i]].usage},
                          {node: "heading",size: "h5",text:"Parameters"},
                          {node: "descriptionList",items: ttt[HPopups[i]].items},
                          {node: "heading",size: "h5",text:"Return"},
                          {node: "paragraph",text: ttt[HPopups[i]].ret},
                          {node: "heading",size: "h5",text: "Live example"},
                          {name: "Input_params",field: "textArea", value: cmd},
                          {name: "doit", node: "button", text: "Go",action: function(that){
                              var f=that.parent.getChild("Input_params");

                              if(!f){
                                  throw new Error("can't get input params");
                              }
                              globalEval(f.getValue());
                              if(that.parent.id === "spinner"){
                                  window.setTimeout(function(){Apoco.popup["spinner"](false);},3000);
                              }
                          }}
                         ];
            UI.Panels.Popups.components.push(k);
        }

    };

    var mkIO=function(){
        var HIO=HThings["IO"];
        var items={
            REST:{code: "<code>var v=Apoco.IO.REST(type,options,data);</code>",
                  items:[{label: "type",descriptions:["string","'GET' or 'POST'"]},
                         {label: "options",descriptions:["key-value object","  var defaults={url: UI.URL,dataType: 'json',mimeType: 'application/json'};"," keys url(required) dataType(optional)"," defaults to 'json' mimeType(optional) defaults to 'application/json', any other values in the options object will be passed directly to the server","e.g <code>var options={url:'http://my_site/whatever'};</code>"]},

                         {label:"data",descriptions:["any data the can be stringified using JSON.stringify "]}],
                  cmd:"var v=Apoco.IO.REST('GET',{},'hi'); v.then(function(){ }).catch(function(msg){Apoco.popup.error('request failes',msg)});",
                  ret: "promise - javascript Promise",
                  des: " (Example will throw an error for security reasons)"
                 },
            dispatch:{code: "<code>Apoco.IO.dispatch(name,data);</code>",
                      items:[{label:"name",descriptions:["string","event identifier (matches listen)"]},
                             {label:"data",descriptions:["any data type","data to be sent to listeners"]}],
                      cmd:"Apoco.IO.dispatch('mySignal','hullo'); // go to listen page to see results",
                      ret: "none",
                      des:""
                     },
            listen:{code: "<code>Apoco.IO.listen(object);</code>",
                    items:[{label:"object",descriptions:["object contains and Array of key value Objects called listen","e.g <br> <code>var object={listen:[{name:'some_name',<br>" + mk_spaces(11)+ "action:my_func(that,data){ <br> " + mk_spaces(14) + "alert('got data' + data);<br> "+ mk_spaces(14)+ "}<br>"+ mk_spaces(13) + "}<br> " + mk_spaces(11) + "// add another here <br> "+ mk_spaces(11)+ "] <br> "+ mk_spaces(6) + "};</code>","Note: 'that' in my_func is a reference to the calling object"]}],
                    cmd: "Apoco.Panel.get('IO').getChild('listenMethods').addField({field:'input',editable: false,type: 'string',name:'test_listen',value: 'listener initialised',listen:[{name:'mySignal',action:function(that,data){ that.parent.addNode({node:'paragraph',text: data});  }}]});  // press go to initialise",
                    ret:"none",
                    des: "Listens for messages sent by publish,websocket or dispatch methods"
                   },
            publish:{code: "<code>Apoco.IO.publish(object);</code>",
                     items:[{label:"object",descriptions:["object contains and Array of key value Objects called publish","e.g <br> <code>var object={publish:[{name:'some_name',<br>" + mk_spaces(11)+ "action:my_func(that,data){ <br> " + mk_spaces(14) + "alert('got data' + data);<br> "+ mk_spaces(14)+ "}<br>"+ mk_spaces(13) + "}<br> " + mk_spaces(11) + "// add another here <br> "+ mk_spaces(11)+ "] <br> "+ mk_spaces(6) + "};</code>","Note: 'that' in my_func is a reference to the calling object"]}],
                     cmd: "Apoco.IO.publish({publish:[{name:'mySignal',action:function(that,name){ var t=Apoco.Panel.get('IO').getChild('publishMethods'); t.element.addEventListener('click',function(e){ Apoco.IO.dispatch(name,'hullo from publish');},false); }}]}); // press Go to initialise, and then click anywhere in the panel to send data- the data will be caught on the listen page",
                     ret: "none",
                     des:""
                    },
            unsubscribe:{code: "<code>Apoco.IO.unsubscribe(object);</code>",
                         items:[{label:"object",descriptions:[""]}],
                         cmd:"var t=Apoco.Panel.get('IO').getChild('listenMethods').getField('test_listen'); Apoco.IO.unsubscribe(t);",
                         ret: "null on error, or undefined on success",
                         des: "unsubscibe from all messages defined in object.listen"
                        },
            webSocket:{code: "<code>Apoco.IO.webSocket(options,data);</code>",
                       items:[{label:"options",descriptions:["key value object","default={url:UI.webSocketURL}; ","any other settings in options will be passed to the webSocket"]},
                              {label: "data",description: "any data that can be stringified using JSON.stringify"}
                             ],
                       ret: "none",
                       des: "sends and receives messages, received messages are sent with IO.dispatch (Example will throw an error for security reasons)",
                       cmd: " Apoco.IO.webSocket({url:'/data/websocket'},['logon',{user: 'fred',password: 'flinstone'}]); "
                      }
        };
        for(var i=0;i<HIO.length;i++){
           // console.log("making io panel",HIO[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(HIO[i] + "Methods").toString();
            k.components=[{node:"heading",size:"h3",text:HIO[i]},
                          {node:"heading",size: "h4",text:"Usage"},
                          {node: "paragraph",text:items[HIO[i]].code},
                          {node: "paragraph",text: items[HIO[i]].des},
                          {node:"heading",size:"h5",text:"Parameters"},
                          {node: "descriptionList",items: items[HIO[i]].items},
                          {node:"heading",size:"h5",text:"Return"},
                          {node:"paragraph",text:items[HIO[i]].ret }
                         ];
            if(items[HIO[i]].cmd){
                k.components.push({node: "heading",size:"h5",text: "Live Example"});
                k.components.push({field: "textArea",name:"Input_params",value:items[HIO[i]].cmd});
                k.components.push({node: "button",name: "Go",text: "Go",action:function(that){
                    var f=that.parent.getChild("Input_params");
                    if(!f){
                        throw new Error("can't get input params");
                    }
                    globalEval(f.getValue());
                }});

            }
            UI.Panels.IO.components.push(k);
        }
    };

    var mkWindows=function(){
        var W=HThings["Windows"];
        var items={
            close: {cmd:"Apoco.Window.close('TestWindow');",
                    params:[{label:"win",descriptions:["string - window name","or","object- windowObject"
                                                      ]}],
                    description:"close the window- don't delete the panels it may contain",
                    ret:[{label:"none",description:""}]
                   },
            deleteAll:{cmd:"Apoco.Window.closeAll();",
                       params:[{label:"none",description:"return none"}],
                       description:"",
                       ret:[{label:"none",description:""}]
                     },
            delete:{cmd: "Apoco.Window.delete('TestWindow');",
                    params:[{label:"win",descriptions:["string - window name","or","object - windowObject"
                                                     ]}],
                    description:"close the window and delete all the contents",
                    ret:[{label:"none",description:""}]
                   },
            get:{cmd: "var v=Apoco.Window.get('TestWindow');",
                 params:[{label:"win",descriptions:["string - window name"," or"," object - windowObject",
                                               ]}],
                 description:"",
                 ret: [{label:"",descriptions:[  "Apoco windowObject i.e",
                                                 "<code>w={name:'myName',window:'windowObject',promise:'Promise'}</code>"]}]
                },
            open:{cmd:"var v=Apoco.Window.open({name:'TestWindow',url:'child_window.html',opts:{width: 400}});",
                  params:[{label:"winObject",descriptions:["name: string -required ","url: string - required",
                                                           "opts: object - window options (optional) <br> default: <code>{width: 600,height: 600,menubar: 0,toolbar: 0, location: 0, personalbar: 0 }</code> <br> if no opts are supplied the window will be opened in a new tab","opts can included any options normally used by window.open"]}],
                  description:"Open a new browser window or tab",
                  ret:[{label:"promise",description:"A javascript promise" }]
                 }
        };
        for(var i=0;i<W.length;i++){
          //  console.log("making io panel",HUtils[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(W[i] + "Methods").toString();
            k.components=[{node:"heading",size:"h3",text:W[i]},
                          {node: "paragraph",text: "<code>" + items[W[i]].cmd + "</code>"},
                          {node: "paragraph",text: items[W[i]].description},
                          {node: "heading",size:"h5",text: "Params"},
                          {node: "descriptionList", items:items[W[i]].params},
                          {node: "heading",size:"h5",text: "Return"},
                          {node: "descriptionList",items: items[W[i]].ret},
                          {node: "heading",size: "h5",text: "Live Example"},
                          {name: "Input_params",field: "textArea", value: items[W[i]].cmd},
                          {name: "doit", node: "button", text: "Go",action: function(that){
                              var f=that.parent.getChild("Input_params");
                              if(!f){
                                  throw new Error("can't get input params");
                              }
                              globalEval(f.getValue());
                              var p=that.parent.getChild("Result");
                              try{
                                   p.setText(JSON.stringify(v));
                               }
                               catch(e){
                                   console.log("methods doit got %j", v);
                                   p.setText(v);
                               }

                          }},
                          {node: "paragraph",text:"Result"},
                          {node:"paragraph",text:"",name:"Result"}
                         ];

            UI.Panels.Windows.components.push(k);
        }
    };
    var mkUtils=function(){
        var HUtils=HThings["Utils"];
        var items={
            binarySearch:{p:"<code>var index=Apoco.Utils.binarySearch(array,[sortOrder],item,[closest])<code>",
                          params:"array - (any type),<br>sortOrder:(optional) array of fields in the array, <br> closest: -object",
                          description:"if exact match is not found, and closest object is supplied - fills in the closest oject e.g <code> {index: closest_index,dir: string(before/after),val: closest_value} <code>",
                          ret: "index - of the found array item or null",
                          cmd:" var v={}; var b=Apoco.Utils.binarySearch([1,2,13,24,45],null,15,v);"
                         },
            dateNow:{p:"<code>var today=Apoco.Utils.dateNow();<code>",
                     params: "none",
                     description:"",
                     cmd:"var v=Apoco.Utils.dateNow();",
                     ret: "date - YYYY-MM-DD"},
            datePast:{p:"<code>var t=Apoco.Utils.datePast(date);<code>",
                      params:"date: - YYYY-MM-DD",
                      description:"",
                      cmd:"var v=Apoco.Utils.datePast('2020-05-12');",
                      ret:"boolean"},
            detectMobile:{p:"<code>var r=Apoco.Utils.detectMobile();<code>",
                          params: "none",
                          description:"",
                          cmd:"var v=Apoco.Utils.detectMobile();",
                          ret: "boolean"},
            draggable:{p:"<code> var d=Apoco.Utils.draggable(htmlObject);</code>",
                       params:"a htmlObject",
                       description:"",
                       ret:"false - on fail"},
            extend:{p:"<code> Apoco.Utils.extend(subclass,superclass); </code>",
                    params: "subclass-constructor function, superclass: base constructor function",
                    description:"Adds the methods of the superclass to the subclass <br> typically used with new e.g <code> myObj=new subclass; </code>",
                    cmd: "var a= function(){this.p='hi';}; var b=function(){}; b.prototype={myVar: 'superClass'}; Apoco.Utils.extend(a,b); var v=a.prototype.myVar",
                    ret: "none"},
            formatDate:{p:"<code> var date_string=Apoco.Utils.formatDate(date); </code>",
                        params: "date of the form YYYY-MM-DD",
                        description:"",
                        cmd:"var v=Apoco.Utils.formatDate('2018-05-23')",
                        ret: "string - e.g 'Wednesday 22rd May 2018'"},
            getCssValue:{p:"<code> var css_value=Apoco.Utils.getCssValue(css_class,rule,[filename]); </code>",
                         params:"css_class, rule e.g width, filename[optional] the name of the css file in the header- if not given the function will search through all the css files",
                         ret: "string - containing the rule or none",
                         description: "Sadly this does not work in Chrome"},
            widthFromCssClass:{p:"<code> var width=Apoco.Utils.widthFromCssClass(class_list,filename); </code>",
                               params:"class_list - string array of classes to be included in width calculation ",
                               description:"Sadly does not work in Chrome",
                               ret:"string e.g '120px'"},
            fontSizeToPixels:{p:"<code> var d=Apoco.Utils.fontSizeToPixels(font-size);</code>",
                              params:"font_size: integer or string e.g '12pt'",
                              description:"",
                              cmd:"var v=Apoco.Utils.fontSizeToPixels(12);",
                              ret:"integer"},
            hashCode:{p:"<code> var d=Apoco.Utils.hashCode(str);</code>",
                      params:"str: some string value ",
                      description:" simple hashed string",
                      cmd:"var v=Apoco.Utils.hashCode('hullo')",
                      ret:"string - string of integers"},
            observer:{p:"<code>var c=Apoco.Utils.observe(str); </code>",
                      params:"str - string(required) id name of element to observe",
                      description:"",
                      ret:""},
            getSiblings:{p:"<code>var c=Apoco.Utils.getSiblings(htmlObject); </code>",
                         params:"htmlObject",
                         description:"find all the siblings",
                         ret: "array of sibling htmlObjects"}
        };
        for(var i=0;i<HUtils.length;i++){
          //  console.log("making io panel",HUtils[i]);
            var k={};
            k.display="fieldset";
            k.DOM="right";
            k.hidden=true;
            k.id=(HUtils[i] + "Methods").toString();
            k.components=[{node:"heading",size:"h3",text:HUtils[i]},
                          {node: "paragraph",text: items[HUtils[i]].p},
                          {node: "paragraph",text: items[HUtils[i]].description},
                          {node: "heading", size: "h5", text: "Parameters"},
                          {node:"paragraph",text: items[HUtils[i]].params},
                          {node: "heading", size: "h5", text: "Return"},
                          {node:"paragraph",text: items[HUtils[i]].ret}
                         ];
            if(items[HUtils[i]].cmd !== undefined){
                k.components.push({node:'heading',size:'h5',text:'Live Example'});
                k.components.push({field:'textArea',name:'input_params',value: items[HUtils[i]].cmd});
                k.components.push({node: "button",name: 'Go',action:function(that){
                    var f=that.parent.getField('input_params');
                    if(!f){
                        throw new Error("can't get input params");
                    }
                    globalEval(f.getValue());
                    var p=that.parent.getNode('Result');
                    if(Apoco.type['function'].check(v)){
                        p.setText(v);
                    }
                    else{
                        p.setText(JSON.stringify(v));
                    }

                }});
                k.components.push({node:"heading",size:"h5",text:"Result"});
                k.components.push({node:"paragraph",name:'Result'});
            }
            UI.Panels.Utils.components.push(k);
        }
    };

    var select_tabs=function (that,index){
        if(!that){
            console.log("select_tabs: that is  " + that);
        }
        var name=that.name;
       // console.log("select_tabs: trying to show " + name);
        if(that.parent.selected){
            Apoco.Panel.hide(that.parent.selected.name);
        }
     //   if(name !== that.selected){
          //  console.log("select_tabs: trying to show " + that.selected);
        //Apoco.Panel.hide(that.selected);

        Apoco.Panel.show(name);
        var b=Apoco.Panel.get(name);
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
            UIStart:[{label:"Usage",descriptions:[ "Called by default if", "<code> UI.start=['MyPanel']; </code> is defined"]},
                     {label: "Or",descriptions:[ "<br><code>Apoco.Panel.UIStart(stringArray);</code>","<br> return: nothing","parms: stringArray","string array of panel keys, as defined in the UI,Panels object that will be displayed immediately on load"," e.g if <code> UI.start=['MyPanel']; </code> is defined, Apoco will immediately load this panel by default in the main window","you then don't need to call this method"]}],
            add:[{label: "Usage",descriptions:[ "<code>Apoco.Panel.add(object|| string);</code>","return: nothing","parms: object or string","e.g from the above definition","<code>Apoco.Panel.add('MyPanel');</code>","or","<code> Apoco.Panel.add({name:'some_name',components:my_display_object_array});</code>","to use the string parm the window must be defined in the UI.Panels object"]}],
            clone:[{label:"Usage",descriptions:["<code>var p=Apoco.Panel.clone(panel_name);</code>","clone a panel object that has been defined in UI.Panels","Add to DOM with <code>Apoco.Panel.add(p);</code>"]}],
            delete:[{label:"Usage",descriptions:["<code>Apoco.Panel.delete(string);</code>","return: nothing","parms: string","the name of the window to be deleted"]}],
            deleteAll:[{label:"Usage",descriptions:["<code>Apoco.Panel.deleteAll();</code>","return: nothing","parms: none","delete all the windows"]}],
            get:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel.get(string);</code>","return: panel object","parms: string",(" " + mk_spaces(7) + "The name of the panel")]}],
            hide:[{label:"Usage",descriptions:["<code>Apoco.Panel.hide(string);</code>","return: none","parms: string",("" + mk_spaces(7) + "name of the window")]}],
            hideAll:[{label:"Usage",descriptions:["<code>Apoco.Panel.hideAll();</code>","return: none","parms: none","Remove all the panels from the DOM"]}],
            getList:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel.getList();</code>","return: stingArray","list the names of all the windows in Apoco"]}],
            show:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel.show(string);</code>"]}],
            showAll:[{label:"Usage",descriptions:["<code>Apoco.Panel.showAll([ ,win])</code>","params: none or string window name, or window Object"]}],
            addChild:[{label:"Usage",descriptions:["<code>Apoco.Panel[string].addChild(object);</code>","<br> return: nothing","parms: object","a Apoco display Object"]}],
            deleteChild:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel[string].deleteChild(object);</code>"]}],
            deleteChildren:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel[string].deleteChildren();</code>"]}],
            findChild:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel[string].findChild(object);</code>"]}],
            getChild:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel[string].getChild(string);</code>"]}],
            getChildren:[{label:"Usage",descriptions:["<code>var v=Apoco.Panel[string].getChildren();</code>"]}]
        };


        var HPanels=HThings["Panels"].concat(HThings["PanelComponents"]);

        for(var i=0;i<HPanels.length;i++){
          //  console.log("mkPanelMethods making " + HPanels[i]);
            var cmd={
                UIStart:"Apoco.Panel.UIStart(['Tabs']);",
                add:"Apoco.Panel.add({name: 'TestField', window:'TestWindow',components:[{display:'fieldset',DOM:'Content',id:'TestFieldSet',components:[{node:'heading',size:'h2',text:'Yippee'},{node:'button', name:'some buttom',label:'another button'},{field:'checkBox',name: 'checkBox',label:'a checkbox' }]}]});",
                "delete":"Apoco.Panel.delete('TestField');",
                clone:"var v=Apoco.Panel.clone('Tabs');",
                deleteAll:"Apoco.Panel.deleteAll();",
                get: "var v=Apoco.Panel.get('TestField');",
                getList:"var v=Apoco.Panel.getList();",
                hide:"Apoco.Panel.hide('TestField');",
                hideAll:"Apoco.Panel.hideAll('TestWindow');",
                inList:"var v=Apoco.Panel.inList('TestField');",
                show:"Apoco.Panel.show('TestField');",
                showAll:"Apoco.Panel.showAll('TestWindow')",
                addChild:"Apoco.Panel.get('TestField').addChild({display:'fieldset',id:'testaddChild',DOM:'Content',components:[{node:'paragraph',text:'Adding some text'}]})",
                deleteChild:"Apoco.Panel.get('TestField').deleteChild('testaddChild');",
                deleteChildren:"Apoco.Panel.get('TestField').deleteChildren();",
                findChild:"var v=Apoco.Panel.get('TestField').findChild('TestFieldSet');",
                getChild:"var v=Apoco.Panel.get('TestField').getChild('TestFieldSet');",
                getChildren:"var v=Apoco.Panel.get('TestField').getChildren();"
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
                          {node: "paragraph",text:"If TestWindow does not exist, either create it by creating ot in the main Panels tab, live example or in the windows open page"},
                          {name: "Input_params",field: "textArea", value: cmd[HPanels[i]]},
                          {name: "doit", node: "button", text: "Go",action: function(that){
                              var f=that.parent.getChild("Input_params");
                              if(!f){
                                  throw new Error("can't get input params");
                              }

                              var n=that.parent.id.split("Methods");
                            //  console.log("got " + n[0]);
                              if(Apoco.Panel.get('Panels').getChild(("test"+ n[0]))){
                                  Apoco.Panel.get('Panels').deleteChild(("test"+n[0]));
                              }
                              window.v=null;
                              that.parent.getChild("Result").setText("");
                              //$.globalEval(f.getValue());
                              globalEval(f.getValue());

                              var nf=that.parent.getChild("Result");
                              if(!nf){
                                  return;
                              }
                             // console.log("methods doit got " + v);
                              if(v !== undefined){
                                  if(Apoco.type["object"].check(v)){
                                      nf.setText("Object");
                                  }
                                  else{
                                      nf.setText(JSON.stringify(v));
                                  }
                              }
                          }},
                          {node:"paragraph",text:"Result"},
                          {node:"heading",name:"Result",size:"h5" }

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
                                 {name: "Types",label: "Types"},
                                 {name: "Fields",label: "Fields"},
                                 {name: "Nodes",label: "Nodes"},
                                 {name: "Displays",label: "Displays"},
                                 {name: "Panels",label: "Panels"},
                                 {name: "Windows",label: "Windows"},
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
                                list: mkMenu(HThings.Fields)
                               },
                               { display: "fieldset",
                                 DOM: "right",
                                 id: "Blurb",
                                 components:[{node:"heading", size: "h2",text: "Apoco Fields"},
                                             {node:"paragraph", text:"Fields.js <br> depends on Utils.js,Sort.js,Types.js, datepicker.js"} ,
                                             {node: "heading", size: "h3", text: "Usage" },
                                             {node: "paragraph", text: "<code>var field=Apoco.field[fieldType](fieldData,parentNode);</code>"},
                                             {node: "paragraph",text: "or as part of a config file <br> <code>{field: fieldType, value: val, //etc }</code>"},
                                             {node: "paragraph", text: "Returns a ApocoField object"},
                                             {node: "heading", size: "h5", text: "fieldType"},
                                             {node: "paragraph",text: "type: string -  Apoco field type"},
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
                          {node: "heading",size:"h2",text: "About Apoco"},
                          {node: "paragraph",text: "Apoco is a data-driven enterprise level SPA library/Frontend framework. The components can be used together or individually. <br> This site is made exclusively with Apoco Components, written in vanilla javascript."},
                          {node: "paragraph",text:"Apoco is arranged hierarchically."},
                          {node: "descriptionList",items:[{label: "Windows",description:"Windows contain"},
                                                          {label: "Panels",description:"Panels contain"},
                                                          {label: "displays",description:"displays contain"},
                                                          {label: "fields or nodes",description: "which contain"},
                                                          {label: "types",description: ""}
                                                         ]},

                          {node:"paragraph",text:"You don't have to use the hierarchy, any of the components can be used independently, e.g you can use the display templates without using the Panel, or fields without using displays, but you can't use displays without specifying the appropriate field(s) "}
                        //  {node: "heading",size: "h4",text:"Required"}

                      ]},
                    {display:"fieldset",
                     id: "start",
                     hidden:true,
                     DOM: "right",
                     components:[
                         {node: "heading",size:"h3",text: "Methods"},
                         {node: "descriptionList",items:[{label:"start",descriptions:["<code>Apoco.start(options);<code>","<br>Usually put in the html like so","<code> <br> &#60script type='text/javascript'> </code>","<code> &nbsp &nbsp  window.onload=function(){ Apoco.start(UI.Login);};</code>", "<code> &#60/script><code>","<br> or with jQuery", "<code> <br> &#60script type='text/javascript'> </code>",
                                                                                      "<code> &nbsp &nbsp $(document).ready(function(){</code>",
                                                                                      "<code>&nbsp &nbsp &nbsp &nbsp Apoco.start(UI.Login);<code>",
	                                                                              "<code>});<code>",
                                                                                      "<code> &#60/script><code>"
                                                                                                                                           ] }]
                         },
                         {node:"descriptionList",items:[{label: "param: options",descriptions:["displayObject","type: Any one of the display templates, templateData", "Unlike other calls to Apoco, this object is not held in memory and cannot be accessed through the Apoco.Panels methods(if these are being used). ","Typically used to display a login form"
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
                         {node: "descriptionList",items:[{label:"stop",descriptions:["<code>Apoco.stop();<code>","<br>Deletes all the elements from the DOM","Removes all Apoco objects from memory"]}] }
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
                          {node: "heading",size:"h2",text: "Apoco Nodes"},
                          {node:"paragraph", text:"Nodes.js"} ,
                          {node: "heading", size: "h3", text: "Usage" },
                          {node: "paragraph", text: "<code>var node=Apoco.node(nodeObject[,parentElement]);</code>"},
                          {node: "paragraph", text: "Returns a ApocoNode object"},
                          {node: "paragraph",text: "or as part of a config file"},
                          {node: "paragraph",text:"<code> {node: nodeType, ... options}"},
                         // {node: "heading", size: "h5", text: "nodeType"},
                         // {node: "paragraph",text: "type: string -  Apoco node type"},
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
                             {node: "heading",size:"h2",text: "Apoco Displays"},
                             {node:"paragraph", text:"DisplayMenu.js DisplayFieldset.js DisplayForm.js DisplayTabs.js DisplaySlideshow.js DisplayGrid.js"} ,
                             {node: "heading", size: "h4", text: "Usage" },
                             {node: "paragraph", text: "<code>var my_display=Apoco.display['templateName'](templateData);</code>"},
                             {node: "paragraph", text: "Returns a ApocoDisplay object"},
                             {node: "paragraph",text: "display Objects are not automatically added to the DOM, To add the HTML object to the DOM, use "},
                             {node: "paragraph",text: "<code> my_display.show();</code>"},
                             {node: "paragraph",text: "or to call as part of a config file"},
                             {node: "paragraph",text:"<code> {display: displayType, ... display options}</code>"},
                             {node:"paragraph",text:"(see panels tab for more information)" },
                             {node: "heading", size: "h5", text: "templateName"},
                             {node: "paragraph",text: "type: string -  Apoco  display template type"},
                             {node: "heading",size: "h5", text:"templateData"},
                             {node: "paragraph", text: "A javascript object that will be passed to the template"}
                            ]
                       }
                   ]},
        Windows:{ name: "Windows",
                  components:[
                      {display:"menu",
                       DOM: "left",
                       id: "WindowsMenu",
                       //  selected: "Menu",
                       heading:"Window Templates",
                       list: mkMenu(HThings.Windows)
                      },
                      { display: "fieldset",
                         id:"Blurb",
                         DOM: "right",
                         components:[
                             {node: "heading",size:"h2",text: "Apoco Windows"},
                             {node:"paragraph", text:"Window.js"} ,
                             {node: "heading", size: "h4", text: "Usage" },
                             {node: "paragraph", text: "<code>var my_window=Apoco.Window.open(templateData);</code>"},
                             {node: "paragraph", text: "Returns a new browser window object"},
                             {node: "paragraph",text: "or as option in config file"},
                             {node: "paragraph",text: "<code> MyPanel:{name:'MyPanel',window:{url:'stuff.html',name:'my_win'}<br> components: []}</code>"},
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
                          {node: "heading",size:"h2",text: "Apoco Panels"},
                          {node: "paragraph",text:"Panel.js"},
                          {node: "paragraph",text: "Only display templates can be added to the Panel components array."},
                          {node: "paragraph",text: ("Apoco panels are generally defined in a UI_defs.js file., <br> for example,<br><br> <code>   UI.Panels={<br> " + mk_spaces(2) + " MyPanel:{name: 'MyPanel',<br>" + mk_spaces(7) + "components:[ {display: 'tabs',<br>" + mk_spaces(14) + "DOM: 'Main',<br> " + mk_spaces(14) + "id: 'Tabs',<br> " + mk_spaces(14) + "tabs:[{name: 'someName',label: 'Some Name'},<br> " + mk_spaces(17) + "{name:'another', label:'Another'}<br>" + mk_spaces(17) + "]<br> " + mk_spaces(14) + "}  <br> " + mk_spaces(14) + " // add another display template here <br> " + mk_spaces(13) + "] <br> " + mk_spaces(7) + "} <br> " + mk_spaces(7) + " // add another panel here <br> }; " )},
                          {node:"paragraph",text: ("This would create a new panel with the name 'MyPanel' with one component, Tabs<br> To add another display component you add it to the components array.")},

                          {node: "heading", size: "h3", text: "Usage" },
                          {node: "paragraph", text: "<code>Apoco.Panel.add(PanelObject);</code><br> or"},
                          {node: "paragraph", text: "<code>Apoco.Panel.UIStart(PanelObjectArray);</code><br>"},
                          {node: "heading",size:"h4",text: "Panel object" },
                          {node: "heading",size: "h5",text:"required"},
                          {node: "descriptionList",items:[{label:"name",description:"type: 'string'"},

                                                          {label: "components",description:"type:'objectArray'"}]},
                          {node: "heading",size: "h5",text:"options"},
                          {node: "descriptionList",items:[{label: "window",descriptions:["type:'object'","defult: uses the current browser window","e.g","<code> var win_object={url:'string',name: 'string', opts:'width=600',height=600'}","The html file designated in the url must contain <code>ApocoCoreChild.js</code>","and when the document is loaded call <code>Apoco.childReady();</code>"]}]},

                          {node: "heading",size:"h4",text:"Live Example"},
                          {name: "Input_params",field: "textArea",
                           value: "if(Apoco.Window.get('TestWindow') === null){var promise=Apoco.Window.open({url:'child_window.html',name: 'TestWindow',opts:{width:600}});}else{ var promise=Apoco.Window.get('TestWindow').promise;} promise.then(function(){Apoco.Panel.add({name:'TestPanel',window:'TestWindow',components:[{display:'tabs',DOM:'Content',id:'Tabs',tabs:[{name:'tab1',label:'my tab'},{name:'tab2',label:'another tab'}]}]})}).catch(function(message){Apoco.popup.error('cannot open window',message)});"},
                          {name: "doit", node: "button", text: "Go",
                           action: function(that){
                               var f=that.parent.getChild("Input_params");
                               if(!f){
                                   throw new Error("can't get input params");
                               }

                               if(Apoco.Panel.get('TestPanel')){
                                   Apoco.Panel.delete('TestPanel');
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
                         {node: "heading",size:"h2",text: "Apoco Types"},
                         {node: "paragraph",text:"Types.js <br> Sort.js"},
                         {node:"heading",size: "h4",text: "Methods" },
                         {node: "descriptionList",items:[{label:"check",
                                                          descriptions:["<code>var t=Apoco.type[type].check(some_var);</code>","return boolean","params:","type is a Apoco type","some_var: a value whose type you want to check"]}]},
                         {node: "descriptionList",items:[{label:"sort",
                                                          descriptions:["<code> Apoco.sort[type](array,type_data);</code>",
                                                                        "return null",
                                                                        "params:",
                                                                        "type: is some Apoco type",
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
                          {node: "heading",size:"h2",text: "Apoco IO"},
                          {node: "paragraph",text: "IO.js"},
                          {node: "paragraph",text: "IO Must be done explicitly, none of the Apoco components will send data. There is no  submit or other built-in methods"},
                          {node: "paragraph",text: "IO is usually controlled through the action function e.g <br> <code> { node: 'button', <br>" + mk_spaces(1) + " name: 'my_button',<br> " + mk_spaces(1) + "action: function(that){ <br> " + mk_spaces(4) + "  var data=get_data(); <br> " + mk_spaces(4) + "Apoco.IO.webSocket({},['logon',{user: data.user,password: data.password}]);<br> " + mk_spaces(2) + "}<br>};</code>"},
                          {node:"paragraph",text:"Or set up publish/listen in the initialisation of a field or display e.g <br> <br> <code> var tabs=Apoco.display['tabs']({id:'myTabs',DOM:'Content',tabs:[{name:'tab1'}],<br> " + mk_spaces(16) + "listen:[{name:'mySignal',<br> " + mk_spaces(22) + "action:function(that,data){<br>" + mk_spaces(26) + " that.addTab({name: data}); <br> " + mk_spaces(22) + "  } <br> "+ mk_spaces(20) + "}]    <br> " + mk_spaces(16) + "}); </code>"}
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
                          {node: "heading",size:"h2",text: "Apoco Popups"},
                          {node: "paragraph",text: "Popups.js"},
                          {node: "heading",size: "h3",text:"Usage"},
                          {node: "paragraph",text:"<code>Apoco.popup[popup_name](params);</code>"}
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
                          {node: "heading",size:"h2",text: "Apoco Utils"},
                          {node: "paragraph",text: "Utils.js"}
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

    fieldManual.execute();
    mkNodes();
    mkDisplays();
    mkDisplayMethods();
    mkPanelMethods();
    mkPopups();
    mkTypes();
    mkIO();
    mkUtils();
    mkWindows();

    UI.start=["Tabs","About"];
    //console.log("UI.start is %j " + UI.start);

})();
