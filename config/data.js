if(!UI){
    var UI={};
}


;(function(){
    "use strict";
    function mk_spaces(num){
        var t=new String;
        for(var i=0;i<num; i++){
            t=t.concat("&nbsp ");
        }
        return t;
    }
    
    UI.Model={
        type:{
            generic:{
                methods:{
                    check:{
                        parameters:[{value:{type:'any',required:true}}],
                        cmd:"Apoco.type['someType'].check",
                        return: {
                            success:{type:"boolean"},
                            fail:{type:"boolean"}
                        },
                        descriptions:["returns true if the value is of the correct type"]
                    },
                    sort:{
                        parameters:[{value:{type:"array",required:true,descriptions:["either a simple array or an array of objects"]}},
                                    {sortOrder:{type:"objectArray",
                                            required: "false",
                                                descriptions:["for complex objects- use the sortOrder to control the precedence and a callback function to retrieve the element from the array","The array  has two key value pairs, type and fn, the position is the array determines the sort order precedence ","<code> let sortOrder=[{type:'date',fn:'function(s){ return s.myDate}'},{type:'string',fn:function(s){return s.lastName}}]</code> ","this would first sort on date and then by lastName"]}
                                    }],
                        cmd:"Apoco.sort",
                        return:{
                            success:{type: "array"},
                            fail:{type: "none"}
                        },
                        descriptions:["sort an array <br> where the second parameter (sort Order) is used to sort object arrays"]
                    }
                }
            },
            member:{
                alphaNum:{
                    example:["adh_050-020","yu78h","YU90","777 90"],
                    descriptions:["Any combination of letters and numbers"]
                },
                alphabetic:{
                    example:["dfs","fsfsd","NNNoo","rr","fs"],
                    descriptions:["strict alphabetic characters"]
                },
                any:{
                    example:[34,"sdds","fs",104.4],
                    descriptions:[]
                },
                array:{
                    example:[[3,4,5],["one","two","three"],["ddd",55]],
                    descriptions:["any array"]
                },
                blank:{
                    example:["",null,false,"false",undefined],
                    descriptions:["empty value"]
                },
                boolean:{
                    example:[true,false,"true","false", 0,1],
                    descriptions:["true, false, 'true', 'false'"]
                },
                booleanArray:{
                    example:[[true,false,true],[true,0,0],[0,1,0,0],["false","true"]],
                    descriptions:["an array of booleans"]
                },
                "class":{
                    example:['someClassName']
                },
                cols:{
                    example:[[{name: 'col1',type:'string',editable: false},{name:'col2',type:'integer'},{name:'col3',type: 'boolean'}]],
                    descriptions:[]
                },
                components:{
                    example:[[{node:"paragraph",text:"some text"},
                              {field:"select",name:'selection',options:['one','two','three']},
                              {type:"integer",name:'someName',value:10}
                             ]],
                    descriptions:[]
                },
                count:{
                    example:[34,6.7,12000,104.4],
                    descriptions:[]
                },
                currency:{
                    example:["USD39.00","AUD89.90","GBP78"],
                    descriptions:["currency with or without 3 letter currency code prefix"]
                },
                data:{
                    example:[{d:"something"}]
                },
                date:{
                    example:["20160623","2017-05-23","2020-12-10"],
                    descriptions:["YYYY-MM-DD or YYYYMMDD"]
                },
                decimal:{
                    example:[34.878,44.7888,99,104.4],
                    descriptions:[]
                },
                displayObject:{
                    example:[{display:'fieldset',id:'exampleDisplay',
                              DOM:'Result',
                              components:[{node:'paragraph',text:'some text'}]}
                    ]
                },
                email:{
                    example:["junk@nowhere.com","nobody@example.co.uk"],
                    descriptions:["e.g me@thisplace.com"]
                },
                enum:{
                    example:[["6767",7878,"re"],["sss","uiui","dog"]],
                    descriptions:["Not doing proper checks yet"]
                },
                fieldType:{
                    example:["input","float","checkbox"]
                },
                file:{
                    example:["css/images/alchemist1.jpg","css/images/alien1.jpg","css/images/rabbit_img1.jpg"],
                    descriptions:["Not a proper implementation"]
                },
                fileOpts:{
                    example:[{maxSize:1024,accept:['application/pdf','image/png']}
                            ]
                },
                fileArray:{
                    example:[["css/images/alchemist1.jpg","css/images/alien1.jpg"],["css/images/rabbit_img1.jpg"]],
                    descriptions:["Not a proper implementation"]
                },
                float:{
                    example:[89.90,90,89.90090, .90],
                    descriptions:["floating point number "]
                },
                floatArray:{
                    example:[[5.6,4.6,33.5],[444.55,424]],
                    descriptions:["an array of floating point numbers"]
                },
                function:{
                    // these functions are quoted, because functions are not valid JSON
                    example:[ "alert", "Apoco.Utils.dateNow"],
                    descriptions:["any function"]
                },
                href:{
                    example:["https:www.mozilla.com","css/images/alchemist1.jpg"]
                },
                HTMLType:{
                    example:["div","ul","p"]
                },
                image:{
                    example:["css/images/alchemist1.jpg","css/images/alien1.jpg","css/images/rabbit_img1.jpg"],
                    descriptions:["NOT IMPLEMENTED checks the mimetype of a file"]
                },
                imageArray:{
                    example:[["css/images/alchemist1.jpg","css/images/alien1.jpg"],["css/images/rabbit_img1.jpg"]],
                    descriptions:["NOT IMPLEMENTED array of files with mimetype image"]
                },
                integer:{
                    example:[4,90,-10,"23",66],
                    descriptions:["positive or negative whole number"]
                },
                integerArray:{
                    example:[[5,6,7,8],[89,5,45,76,34]],
                    descriptions:["array of integers"]
                },
                items:{
                    example:[[{label:'myLabel',description:'some description'},
                              {labels:['one','two'],descriptions:['describe something','and another thing']},
                              {label:'three',descriptions:['next description',"last description"]}
                             ]]
                },
                listenObject:{
                    example:[{listen:[{"name":'someString',action:"callbackFunction"},{"name":'otherText',action:'callbackFunction'}]}]
                   
                    
                },
                menuComponents:{
                    example:[[{name:"menu1"},{name:"menu2"}]]
                },
                negativeInteger:{
                    example:[-10,-9,-45,"-13"],
                    descriptions:[]
                },
                number:{
                    example:[-45,9.5,-6.4,"6",7],
                    descriptions:[]
                },
                object:{
                    example:[{c:1,b:3,x:5},{a:100,b:"mything"}],
                    descriptions:[]
                },
                objectArray:{
                    example:[[{abs:8989},{uuuu:8989}],[{},{}],[{},{a:"ddd"}]],
                    descriptions:[]
                },
                password:{
                    example:["ioioioi","uiioouiu"],
                    descriptions:[]
                },
                phoneNumber:{
                    example:[89898998,"90566666799"],
                    descriptions:[]
                },
                positiveInteger:{
                    example:[90,"909",666,34],
                    descriptions:[]
                },
                propertyObject:{
                    example:[{key:"Result"}]
                },
                publishObject:{
                    example:[{publish:[{name:'someString',data:'any'}]}]
                },
                range:{
                    example:[10,42,55,7,42,-10],
                    descriptions:[]
                },
                RESTString:{
                    example:["POST","GET","PUT"]
                },
                RESTOptions:{
                    example:[{url:"mypath",mimeType:'application/json'}]
                },
                rows:{
                    example:[[
                        {col1:'abc',col2: 10, col3: false},
                        {col1:'def',col2: 10, col3: false},
                        {col1:'vyd',col2: 15, col3: true},
                        {col1:'per',col2: 23, col3: true},
                        {col1:'ted',col2: 43, col3: false},
                        {col1:'tda',col2: 54, col3: true}]
                            ]
                },
                size:{
                    example:["h1","h2","h3","h4"]
                },
                slideshowComponents:{  // 
                    example: [[{"src":"css/images/alchemist1.jpg",
                                "content":[{"node":"paragraph","text":"alchemist"}]
                               },
                               {"src":"css/images/alchemist2.jpg",
                                "content":[{"node":"paragraph","text":"another alchemist"}]},
                               {"src":"css/images/rabbit_img1.jpg",
                                "content":[{"node":"paragraph","text":"A lovely rabbit"}]},
                               {"src":"css/images/alien1.jpg",
                                "content":[{"node":"paragraph","text":"What is it?"}]}
                              ]]
                },
                sortedArray:{
                    example:[[{name:'a',id:1},{name:'a',id:2},{name:'b',id:10},{name:'c',id:4}]]
                },
                sortedArrayElement:{
                    example:[{name:'b',id:10}]  
                },
                sortOrderArray:{
                    example:[['name','id']]
                },
                statusCode:{
                    example:["404","501"]
                },
                string:{
                    example:["someString","anotherString"],
                    descriptions:[]
                },
                stringArray:{
                    example:[["one","two","three","four"],["6767","7878","re"],["sss","uiui","dog"]],
                    descriptions:[]
                },
                src:{
                    example:["css/images/alchemist1.jpg"]
                },
                tabsComponents:{
                    example:[[{name:'tab1',label:'tab one'},{name:'tab2',label:'tab two'},{name:'tab3',label:'tab three'},{name:'tab4',label:'tab four'}]]
                },
                target:{
                    example:["_blank"]
                },
                text:{
                    example:["a line of text","lorem ipsum"],
                    descriptions:[]
                },
                time:{
                    example:[10,"10:02 PM","23:33:45","10:34"],
                    descriptions:[]
                },
                token:{
                    example:["78-VV78","78fs-rte",65,"%4","X&_89"],
                    descriptions:[]
                },
                type:{
                    example:["integer","string","float"]
                },
                url:{
                    example:["www.stackoverflow.com","http://www.developer.mozilla.org"],
                    descriptions:[]
                },
                windowObject:{
                    example:[{name:"someString",url:"child_window.html"}]
                }
            }
        },
        node:{
            generic:{
                parameters:[
                    {object:{type:"object",required:true,descriptions:[]}},
                    {element:{type:"HTMLElement",required:false,descriptions:["Append the node to an HTML element"]}}
                ],
                return:{
                    success:{type:"this"},
                    fail:{type:"null"}
                },
                required: {node:{type:"nodeType",default:"undefined",descriptions:["a string which is one of the listed nodes"]}},
                common: {
                    id:{type: "string",default: "undefined",descriptions:["type: string ", "Add an id"]},
                    class:{type:"string or string array",default: "undefined",descriptions:["add a class or classes to the node"]},
                    childClass:{type: "string or string array",default:"undefined",descriptions:["add a class or classes to the element contained by the div(default)" ]},
                    name:{type: "string",default: "undefined",descriptions:["add a name attribute to the node"]},
                    hidden:{type: "boolean",default: "false" ,descriptions:["set the element display to none or unset"]},
                    title:{type: "string",default: "undefined",descriptions:["set the title attribute for tooltips"]
                          }
                },
                methods:{
                    
                }
            },
            member:{
                anchor:{
                    parameters:[{href:{type:"href",default:"undefined",
                                       required:'false',
                                       descriptions:["type: string","a url"]}},
                                {text:{type:"string",default:"undefined",
                                       required:'false',
                                       descriptions: ["type: string",'the clickable text that appears in the DOM']}}
                                
                               ],
                    return:{
                        success:{type:'this'},
                        fail:{type:'null'}
                    },
                    options:{
                        "target":{type: "string",default:"undefined",descriptions: ["type:string","where to open the link "]}
                    },
                    methods:{
                        setText:{
                            parameters:[{text:{type:"string"}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"Error"}
                            },
                            descriptions:["set the text in the node"]
                        }
                    }
                },
                descriptionList:{
                    parameters:[{items:{type:"items",required:true,
                                        default:"undefined",
                                        descriptions: ["type: {label(s): 'string(Array)',description(s): 'string(Array)'}", "where ", "[{label:'string',description:'text'}","{labels:'stringArray',descriptions:'stringArray'}];","Example:","description:<code>var items=[{label:'myLabel',description:'some description'},<br> {labels:['one','two'],descriptions:['describe something','and another thing']}];<code>"]}
                        
                                }],
                    return:{
                        success:{type:"this"},
                        fail:{type:'null'}
                    },
                    options:{},
                    methods:{}
                },
                heading:{
                    parameters:[{size:{type:"size", required:true,
                                       default:"undefined",
                                       descriptions: ["size param: one of the following sizes","'h1' 'h2' 'h3' 'h4' 'h5'" ]}},
                                {text:{type:"text",required:'false'}}
                               ],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    methods:{
                        setText:{
                            parameters:[{text:{type:"string"}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"Error"}
                            },
                            descriptions:["set the text in the node"]
                        }
                    }
                },
                image:{
                    parameters:[{src:{type:"src",default:"undefined",
                                      required:true,
                                      descriptions:["type: string, the path to the image"]
                                     }}
                               ],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{
                        width:{type:"integer",descriptions:["integer width of the html image node"]},
                        height:{type:"integer",descriptions:["integer height of the html image node"]},
                        keepAspectRatio:{type:"boolean",default: true,descriptions:["size image according to parent size"]}
                    }
                },
                label:{
                    parameters:[{text:{type:"string",default:'empty string',
                                       required:'false'}}
                               ],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{
                        for:{type:"string",default: "undefined",description:"optional, id of the html element the label belongs to " }
                        
                    },
                    methods:{
                        setText:{
                            parameters:[{text:{type:"string"}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"Error"}
                            },
                            descriptions:["set the text in the node"]
                        }
                    }
                },
                list:{
                    parameters:[{list:{type:"stringArray",required:'false'}}
                               ],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{
                        
                        ordered:{type:"boolean",default: "false",descriptions:["type: boolean","default: false","create an ordered rather than an unordered list"]}
                        
                    }
                },
                code:{
                    parameters:[{text:{type:"text",
                                       default:"empty string",required:false,
                                       description:"text will be displayed as code"}
                                }],
                    return:{
                        success:{type:"this"},
                        fail:{type:"undefined"}
                    }
                },
                paragraph:{
                    parameters:[{
                   
                        text:{type: "string",default:"empty string",description:"the text can contain unicode and things like ' &#60br&#62'"}
                    }],
                    return:{
                        success:{type:"this"},
                        fail:{type:"undfined"}
                    },
                    methods:{
                        setText:{
                            parameters:[{text:{type:"string"}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"Error"}
                            },
                            descriptions:["set the text in the node"]
                        }
                    }
                },
                paginate:{
                    parameters:[{number:{type:"integer",required:true,default:0,
                                         description:"number of objects in the paginator"}},
                                {action:{type: "function", required:true,
                                         default: "undefined",
                                         description: "function with one parm the paginator context"}}
                               ],
                    
                    return:{
                        success:{type:"this"},
                        fail:{type:"undefined"}
                    },
                    options:{
                       
                    }
                },
                clock:{
                    parameters:[],
                    return:{
                        success:{type:"this"},
                        fail:{type:"undefined"}
                    },
                    options:{}
                },
                button:{
                    parameters:[{text:{type:"string",required:'false'}}
                               ],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{
                        action:{type:"function",default:"undefined",descriptions:["type: function","function to call when button is clicked"]}
                    }
                },
                whatever:{
                    parameters:[{nodeType:{type:"HTMLType",required:true,
                                           default:"undefined",
                                           description:"any valid html element"}
                                }],
                    return:{
                        success:{type:"this"},
                        fail:{type:"Error"}
                    },
                    options:{
                        text:{type:"string",default:"empty string",description: "text to add to element if applicable"},
                        attr:{type:"array",default:"undefined",descriptions:["optional key value array of attributes"]}
                    }
                }
 
            }  // end members
        },
        field: {
            generic:{
                parameters:[
                    {object:{type:"object",required:true,descriptions:[]}},
                    {element:{type:"HTMLElement",required:"false",descriptions:[]}}
                ],
                return:{
                    success:{type:"this",descriptions:["returns the ApocoField object"]},
                    fail:{type: "Error",descriptions:[]}
                },
                required:{name:{type: "string",descriptions:["All fields must have a name"]}},
                common: {required:{type:"boolean",default: "false",descriptions:["Is the cell allowed to be blank"]},
                         editable:{type:"boolean",default:true,descriptions:["If false user input is disabled"]},
                         label:{type: "string",default: "undefined",descriptions:["added next to the input field"]},
                         title:{type: "string",default: "undefined",descriptions:["add a tooltip"]},
                         class:{type:"string or stringArray",default:"undefined",descriptions:["add a class or classes to the field"] },
                         childClass:{type:"string or stringArray",default:"undefined",descriptions:["add a class or classes to the element contained by the div(default)"] },
                          hidden:{type:"boolean",default: "false",descriptions:["set the element display to none or unset"]},
                          action:{type:"function",default: "undefined",descriptions:["Function run after field has beenn created <br>","e.g <br>  <code>action:function(that){ alert('hullo');}</code>"]},
                         listen:{type:"objectArray",default:"undefined" ,descriptions:["e.g <code> listen:[{name:'some_name',action:function(that,data){ alert('got data ' + data);}}]</code>"]},
                         dependsOn:{type:"string",default:"undefined", descriptions:["used with 'action', only run the action function when the element with this name appears in the DOM "]},
                         publish:{type: "objectArray",default: "undefined",descriptions:["array can contain either an action function or static data e.g<br>", "<br><code> publish:[{name:'some_name', <br> &nbsp &nbsp &nbsp &nbsp &nbsp action:function(that,name){ <br>&nbsp &nbsp &nbsp &nbsp &nbsp var data={user:'me',password:'you'}; <br>  &nbsp &nbsp &nbsp &nbsp &nbsp Apoco.IO.dispatch(name,data);}<br> &nbsp &nbsp &nbsp &nbsp }];</code><br> or<br><code> publish:[{name:'some_name',data: my_data}]; </code> ",
                                                                                        " <br> <br>see dispatch and listen options. Also the IO page"]}
                        },
                methods:{
                    delete:{
                        parameters:[],
                        return: {
                            success:{type:"none"},
                            fail:{type:"none"}
                        },
                        descriptions:["delete the field both in html and from memory - see the hide method to remove it just from the DOM"]
                    },
                    checkValue:{
                        parameters:[],
                        return:{
                            success:{type:"boolean"},
                            fail:{type:"boolean"}
                        },
                        descriptions:["If the field is required, checks that the value exists"," If there is a value, checks that it is of the right type","Returns true if the value meets the criteria, or false if it does not."]
                    },
                    getElement:{
                        parameters:[],
                        return:{
                            success:{type:"HTMLElement"},
                            fail:{}
                        },
                        descriptions:["Return the root HTML element, typically a DIV"]
                    },
                    getInputElement:{
                        parameters:[],
                        return:{
                            success:{type:"HTMLElement"},
                            fail:{type: "null"}
                        },
                        descriptions:["Get the input HTML Element if it exists"]},
                    getKey:{
                        parameters:[],
                        return:{
                            success:{type:"string"},
                            fail:{type:"null"}
                        },
                        descriptions:["Returns the name attribute of the field"]},
                    getParent:{
                        parameters:[],
                        return:{
                            success:{type:"this.parent"},
                            fail:{type: "undefined"}
                        },
                        descriptions:["Returns the display object that contains the field"]},
                    getLabel:{
                        parameters:[],
                        return:{
                            success:{type:"HTMLElement"},
                            fail:{type:"null"}
                        },
                        descriptions:["Get the label html element if it exists"]},
                    getValue:{
                        parameters:[],
                        return:{
                            success:{type:"value"},
                            fail:{type: "null"}
                        },
                        descriptions:["Cet the value in the html field"]
                    },
                    hide:{
                        parameters:[],
                        return:{
                            success:{type:"this"},
                            fail:{type:"this"}
                        },
                        descriptions:["sets the display to 'none'"]},
                    isHidden:{
                        parameters:[],
                        return:{
                            success:{type:"boolean"},
                            fail:{type:"boolean"}
                        },
                        descriptions:["If the element is in the DOM returns true, otherwise returns false"]},
                    popupEditor:{
                        parameters:[{
                            callbackFuntion:{type:"function"}
                        }],
                        return:{
                            success:{type:"none"},
                            fail:{type:"Error"}
                        },
                        descriptions:["Field must have the editable option set to true","Adds a popup dialog window","If the input element does not exist, throws an error"]},
                    resetValue:{
                        parameters:[],
                        return:{
                            success:{type:"value"},
                            fail:{type: "null"}
                        },
                        descriptions:["sets the value to the last value set with  setValue method, or value used on field creation"]},
                    setRequired:{
                        parameters:[],
                        return:{
                            success:{ type: "this"},
                            fail:{ type: "this"}
                        },
                        descriptions:["set the required attribute on the field"]},
                    setValue:{
                        parameters:[
                            { value:{type:"value"}}],
                        return:{
                            success:{type: "value"},
                            fail:{type: "null"}
                        },
                        descriptions:["set the value in the field, in both the html and in memory","typically used with values from the server"]
                        },
                    show:{
                        parameters:[],
                        return:{
                            success:{type:"this"},
                            fail:{}
                        },
                        descriptions:["Make the root element visible using style.display "]},
                    valueChanged:{
                        parameters:[],
                        return:{
                            success:{type: "boolean"},
                            fail:{type:"boolean"}
                        },
                        descriptions:["Is the value in memory- set with setValue the same as that in the html"]
                    }
                }
            },
            member:{
                static:{ parameters:[{value:{type:"integer"}},
                                     {type:{type:"type"}}],
                         return:{
                             success:{type:"this"},
                             fail:{type:"null"}
                         },
                         options:{type:{type:"string",
                                        default: "string",
                                        params:"any",
                                        descriptions:["any type at all"]},
                                  value:{type: "any",default:"undefined",
                                         params: "any",
                                         descriptions:["single value or an array"]}
                                 }, 
                         descriptions:["For fields that are not editable but need to have field methods"],
                         methods:{
                             
                         }
                       },
                input:{ parameters:[{value:{type:"integer"}},
                                    {type:{type:"type"}}],
                        return:{
                            success:{type:"this"},
                            fail:{type:"null"}
                        },
                        options:{type:{type:"string",
                                       default:"string",
                                       params: UI.Controls.getTypes("input"),
                                       dependsOn:{float:{min:{default: "undefined"},
                                                         max:{default: "undefined"},
                                                         step:{default: 0.01},
                                                         precision:{default: 2,
                                                                    descriptions:["Number of places after the decimal point"]
                                                                   }
                                                        },
                                                  integer:{min:{default: "undefined"},
                                                           max:{default: "undefined"},
                                                           step:{default: 1}
                                                          },
                                                  currency:{ISOCurrencyCode:"3 letter string - default: 'GBP'"
                                                           }
                                                 }
                                      },
                                  value:{type: "any",default: "undefined",
                                         params:UI.Controls.getTypes("input"),
                                         descriptions:[""]},
                                  placeholder:{type: "string",default:"none",params: "string",descriptions:["placeholder text for field"]}
                                 },
                         descriptions:[""],
                         methods:{
                             
                         }
                       },
                select:{ parameters:[{ options:{type:"stringArray",
                                             default: "undefined",
                                             descriptions: ["where the options can be a stringArray,floatArray,integerArray  enum or objectArray"," the objectArray has two key value pairs","<code> options=[{label:'my label',value:10},{label:'another label',value:'pig'}]</code>","where label is of type string and value is of any allowed type (see above)"]}
                                     }],
                         return:{
                             success:{type:"this"},
                             fail:{type:"null"}
                         },
                         options:{ type:{type:"string",
                                         default:"string",
                                         descriptions:["type is one of enum, float, integer,object or string","The type must match the type of the options array - so if the options array is a stringArray the type must be string","If the type is enum the return value will be a string"]},
                                   
                                   blank_option:{type:"boolean",
                                                 default: "false",
                                                 descriptions:["adds an input fielg for the user to add an option","if you want a blank select add empty string to the options array"]},
                                   value:{type: "string",
                                          default: "undefined",
                                          descriptions:[ "An element from the options array"]},
                                   onChange:{type:"function",
                                             default: "undefined",
                                             descriptions:["adds EventListener on change and runs function ",
                                                           "<code> options=[{onChange:function(that){//run some code}}];</code>"]
                                            }
                                 },
                         descriptions:[""],
                         methods:{
                             addValue:{
                                 parameters:[{value:{type:"value"}}],
                                 return:{
                                     success:{type:"this"},
                                     fail:{type:"Error"}
                                 },
                                 descriptions:["Add a new entry to the selection list"]
                             }
                         }
                       },
                buttonSet:{parameters:[{labels:{type:"stringArray",default:"undefined",descriptions:["Labels for the buttons"]}}],
                           options:{checkbox:{type:"boolean",
                                              default: "false",descriptions:["radio buttom unless checkbox is set to true"]},
                                    value:{type:"booleanArray",default:"undefined",descriptions:["array of boolean  values for the buttons"]}},
                           descriptions:[""],
                           return:{
                               success:{type:"this"},
                               fail:{type:"null"}
                           },
                           methods:{
                               addValue:{
                                   parameters:[ {parms:{type:"object"}},
                                                {value:{type:"boolean"}}
                                              ],
                                   return:{
                                       success:{type:"this"},
                                       fail:{type:"Error"}
                                   },
                                   descriptions:["add another chechbox or radio button and set the value"]
                               }
                           }
                          },
                exists:{ parameters:[{fieldType:{type: "fieldType"}}],
                         return:{
                             success:{type:"boolean"},
                             fail:{type:"boolean"}
                         },
                         descriptions:["Utility to see of the feild type exists or not"]
                },
                slider:{ parameters:[{value:{type:"integer"}}],
                         return:{
                             success:{type:"this"},
                             fail:{type:"null"}
                         },
                         options:{ min:{type:"integer",default: 1},
                                   max:{type:"integer",default: 10},
                                   value:{type: "integer",default: "undefined"}
                                 },
                         descriptions:["This is a wrapper for the html5 slider, to access the htmlobject use var slider=my_slider_field.getFlement(); Please use the Apoco setValue and getValue methods "],
                         methods:{
                             
                         }
                       },
                numberArray:{ parameters:[{value:{type:"integerArray"}}],
                              options:{type:{type:"string",
                                             default: "integerArray"
                                            },
                                       value:{type:"array",
                                              default:"undefined"}
                                      },
                              return:{
                                  success:{type:"this"},
                                  fail:{type:"null"}
                              },
                              descriptions:[""],
                              methods:{
                                  deleteValue:{
                                      parameters:{value:{type:"number"}},
                                      return:{
                                          success:{type:"this"},
                                          fail:{type:"null"}
                                      },
                                      descriptions:["Remove a value form the array"]
                                  }
                              }
                            },
                object:{ parameters:[{value:{type:"object"}},
                                     {userGetValue:{type:"function",required:true}},
                                     {userSetValue:{type:"function",required:true}}],
                         return:{
                             success:{type:"this"},
                             fail:{type:"null"}
                         },
                         required:{ userGetValue:{type:"function",
                                                  default: "undefined"},
                                    userSetValue:{type:"function",
                                                  default: "undefined"}
                                  },
                         options:{ type:{type:"string",
                                         default:"object"},
                                   value:{type:"object",
                                          default: "null",
                                          descriptions:["object with key value pairs","e.g value={a: 1,b:2,c:3,d:'anything'}"]
                                         },
                                   inputType:{type:"string",
                                              default: "undefined",
                                              descriptions:["set the input node to a particular type" ]
                                             }
                                 },
                         descriptions:[],
                         methods:{
                             
                         }
                       },
                fileReader:{ parameters:[{ opts:{type: "fileOpts",
                                                 required: true,
                                                 default: "undefined",
                                                 descriptions:["maxSize type: integer, max filesize in bytes",
                                                           "accept: an array of strings of valid mimetypes","see the IO getFiles","e.g <code> var my_display=Apoco.field['fileReader']({name:'someName',opts:{maxSize:1024,accept:['application/pdf','image/png']}});</code> ",
                                                               "multiple: boolean - allow multiple files"]}}],
                             return:{
                                 success:{type:"this"},
                                 fail:{type:"undefined"}
                             },
                             options:{ type:{type:"string",default: "fileArray"},
                                       value:{type: "stringArray",default: "[]"},
                                      
                                       progressBar:{type:"boolean",default:"false",
                                                    descriptions:["make a progressBar for info and errors "]},
                                       progressCallback:{type:"function",default:"fileReader._doProgress",
                                                         descriptions:["Callback function for the progress event",
                                                                       "receives  event as param - onprogress and  onload events"]},
                                       resetButton:{type:"boolean",default:"false",
                                                    descriptions:["Create a button which removes all files values etc when clicked"]},
                                       resetClass:{type:"stringArray",default: "false",
                                                   descriptions:["add classes to the resetButton"]},
                                       dragDrop:{type:"boolean",default: "false",
                                                 descriptions:["make the containing div do drag and drop "]},
                                       accept:{type:"string",default: "undefined",description: "MiME type e.g 'image.*' , 'image/png' or 'application/pdf etc'"},
                                       maxNum:{type:"integer",default: "undefined",descriptions:["set the maxinum number of files to be read"]},
                                       filesHidden:{type:"boolean",default: "false"},
                                       resizable:{type: "boolean",default: "false"},
                                       width:{type:"integer",default: 400,description:"width of the file object"},
                                       height:{type:"integer",default: 400,description:"height of the file object"},
                                       multiple:{type:"boolean",default: true,description:"allow multiple file selects"}
                                       
                                     },
                             
                             descriptions:["Read file(s) into memory"]
                           },
                imageArray:{parameters:[{thumbnails:{type:"boolean"}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"null"}
                            },
                            options:{value:{type:"imageArray",
                                            default: "undefined",
                                            description: "key value javascript object"},
                                     thumbnails:{type:"boolean",default:"false",description:"Display the images as thumbnails" },
                                     width:{type:"integer",default: 120,description:"width of the thumbnails"},
                                     height:{type:"integer",default: 90,description:"height of the thumbnails"}
                                    },
                            descriptions:["Read image files into an array"]
                           },
                float:{ parameters:[{value:{type:"float"}}],
                        return:{
                            success:{type:"this"},
                            fail:{type:"null"}
                        },
                        options:{precision:{type:"integer",default: 2,description:"Number of places after the decimal point" },
                                 step:{type:"float",default: 0.1},
                                 value:{type: "float",default: "undefined"}},
                        descriptions:["Float field that aligns the decimal point"]
                      },
                autoComplete:{ parameters:[{options:{type: "stringArray"}}],
                               return:{
                                   success:{type:"this"},
                                   fail:{type:"null"}
                               },
                               options:{options:{type:"stringArray"}
                                       },
                               descriptions: ["This is a simple  autoComplete field. To access the htmlObject, use <br> <code> var auto_comp=ac.getInputElement();</code> ","  Please use the Apoco getValue and setValue methods "]
                             },
                checkBox:{
                    parameters:[],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{
                        value:{type: "boolean",
                               default: false}
                    },
                    descriptions: ["simple single checkbox"]
                },
                date:{
                    parameters:[],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{value:{type:"date",default:"undefined",params:["Date","string"] }},
                      descriptions:["An ISO string- e.g '2018-04-23'","or an integer milliseconds past 1970","This uses the browser datepicker(where available) or Apoco.datepicker"]
                     },
                time:{
                    parameters:[],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{value:{type:"time",default:"undefined",
                                      description:"A valid partial-time as defined in [RFC 3339]."}},
                      descriptions:[""]
                     },
                textArea:{
                    parameters:[],
                    return:{
                        success:{type:"this"},
                        fail:{type:"null"}
                    },
                    options:{value:{type:"text",default: "undefined"}},
                    descriptions:[""]
                },
                stringArray:{parameters:[{value:{type: "stringArray"}}],
                             return:{
                                 success:{type:"this"},
                                 fail:{type:"null"}
                             },
                             options:{ length:{type:"integer",
                                               default: 4,
                                               description:" Max of value array and length"},
                                       value:{type:"stringArray",default: "undefined"}
                                     },
                             descriptions:[""]
                            }
            }
        },
        display:{
            generic:{
                parameters:[
                    {object:{type:"object",required:true}},
                    {element:{type:"HTMLElement",required:"false"}}
                ],
                return:{
                    success:{type:"this"},
                    fail:{type: "Error"}
                },
                required:{
                    DOM:{type:"string",default:"undefined",
                         descriptions:["An existing node with an id (do not include #) which is used as the parent for the display","or","an html element with an id, (make sure that this element has been appended to the document"]},
                    id:{type:"string",default:"undefined",
                        descriptions:["id of the root html element"]}
                },
                common:{
                    components:{type:"ObjectArray",default:"undefined",
                                
                                descriptions:["Array of fields or nodes"]},
                    hidden:{type:"boolean",default: "false",
                            descriptions:["display the root element"]},
   
                    "class":{type:'string or array', required: "false",
                             descriptions:["add a class or an array of classes"]},
                    listen:{type:"objectArray",required:'false',
                            descriptions:["listener for things that have been dispatched","two key value pairs name and action","<code> listen:[{name:'somthings happened',action:'myCallback'}]</code>","action function receives one parameter which is the this context of the calling object"]},
                    action:{type:'function',required:'false',
                            descriptions:['run a callbakc function - see dependsOn']},
                    dependsOn:{type:"string",required:'false',
                               descriptions:["used with 'action', only run the action function when the element with this name appears in the DOM "]}
                    
                },
                methods:{
                    delete:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:["delete the display object and all it's children from memory"]
                    },
                    deleteAll:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:["deletes all the children of the displayObject"]
                    },
                    deleteChild:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[]
                    },
                    deleteChildren:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[]
                    },
                    getChild:{
                        parameters:[{type:"string",descriptions:["name attribute of the child component"]}],
                        return:{
                            success:{type:"objectArray",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[]
                    },
                    getChildren:{
                        parameters:[],
                        return:{
                            success:{type:"objectArray",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:["return an object array of all the child components"]
                    },
                    getDisplayType:{
                        parameters:[],
                        return:{
                            success:{type:"string",descriptions:[]},
                            fail:{type:"undefined",descriptions:[]}
                        },
                        descriptions:["What type of display- e.g tabs,menu etc"]
                    },
                    getElement:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:["the root element of the display"]
                    },
                    getKey:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[" return the name if it exists or id(which must exist)"]
                    },
                    getName:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[]
                    },
                    getParent:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[]
                    },
                    getSibling:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[" array of the other display objects that are in the same Panel"]
                    },
                    hide:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[]
                    },
                    isHidden:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:[]
                    },
                    show:{
                        parameters:[],
                        return:{
                            success:{type:"this",descriptions:[]},
                            fail:{type:"null",descriptions:[]}
                        },
                        descriptions:["add the root display element to the DOM"]
                    }
                }
            },
            member:{
                fieldset:{
                    parameters:[
                        { components:{type:"objectArray",default:"undefined",
                                      required:"false",
                                      descriptions:[ "An array of nodes and/or field objects"]}
                        }
                    ],
                    return:{
                        success:{type:"object"},
                        fail:{type:"undefined"}
                    }
                },
                form:{
                    parameters:[
                        { components:{type:"objectArray",required:"false",default: "undefined",
                                    descriptions:[ "An array of nodes and/or field objects. If the component has 'submit:true', creates an imput of type submit to use with onSubmit (see below) "]}
                        }
                    ],
                    return:{
                        success:{type:"object"},
                        fail:{type:"undefined"}
                    },
                    options:{
                        buttons:{type:"array of button objects",default:"undefined",descriptions:["an array of button objects","example","<code> buttons: [{name: 'string',text:'string',action: function(that){ //some code }}]</code>"]},
                        draggable:{type:"boolean",default:"false",descriptions:["type: boolean","default: false","if true the form is detached and can be dragged around the browser window - adds a close button top right"]},
                        attr:{type:"object array",default: "undefined",descriptions:["object array of attributes to add to the form"]},
                        onSubmit:{type:"function",default:"undefined",descriptions:["function to call","used with component which has 'submit:true'","<code> components=[{submit:true,name:'loginButton',value:'Login',class:'login'}]</code>","onSubmit: receives the click event, <code>var mySubmit=function(event){ //must return false;  }; </code>"]},
                        label:{type:"string",default:"undefined",descriptions: ["type: string"]
                              }
                    },
                    methods:{
                        addChild:{
                            parameters:[
                                {object:{type:"object",required:true,
                                         descriptions:["Where the object is a json object described in the field or node sections"]
                                        }
                                },
                                {HTMLElement:{type:"HTMLElement",
                                              required: false
                                            }
                                }
                            ],
                            return: {
                                success:{type:"this"},
                                fail:{type:"none"}
                            },
                            descriptions:["Add a node or field to an existing form"]
                        },
                        check:{
                            parameters:[],
                            return: {
                                success:{type:"boolean"},
                                fail:{type:"none"}
                            },
                            descriptions:["check that the entries of the fields are of the correct type and value - including making sure that required fields have an appropriate value"] 
                        },
                        getJSON:{
                            parameters:[],
                            return: {
                                success:{type:"object"},
                                fail:{type:"null"}
                            },
                            descriptions:["returns a JSON object that can be stringified and sent to the server"]
                        }
                    }
                },
                grid:{
                    parameters:[
                        {cols:{type:"objectArray",required:true,
                              default:"undefined",
                               descriptions:["type: objectArray","array of fields based on type or the field may be specified directly","example","<code>cols:[{name:'colname1',type:'string',editable:false},{name:'colname2',type:'float',required:true,resizable:true,precision:2,step:0.1},{field:'select',title; 'Pick one',name:'choose',options:['one','two','three']}]<code>","options are the same as for the fields with the addition of the title option - which is the text displayed in the head - defaults to name"]}},
                        {rows:{type:"objectArray",required:"false",
                              default: "undefined",
                               descriptions:["type:objectArray","if the cols were defined as above then the rows would be","<code> rows:[{colname1:'some_string',colname2:23.53,choose:'one'},{colname1:'another_string',colname2:34.66,choose:'three'}]"]}}
                    ],
                    return:{
                        success:{type:"object"},
                        fail:{type:"undefined"}
                    },
                    options:{
                        userSortable:{type:"stringArray",descriptions:["type:stringArray","default: cols are not sortable","list the columns by name that he user can sort"]},
                        sortOrder:{type:"stringArray",descriptions:["type:stringArray","column names to sort the grid rows","example","<code>sortOrder:['colname1','colname2']<code","Initial sortOrder-  sort the rows first by colname1 and then colname2","default: sort the grid with the uniqueKey"]},
                        groupBy:{type:"string",descriptions:["type: stting","split the row data into separate grids based on the value of the column in the row data","example","<code>groupBy: 'colname1',<code>","if the column has a title it will be used as a the subgrid seperator"]},
                        uniqueKey:{type:"stringArray",descriptions:["type: stringArray","the set of column names that  uniquely determine a row (f it exists)","If no uniqueKey is given an id is added called '_aid'","You can access the uniqeKey with <code> var key=mygrid.uniqueKey;<code> which returns a string array "]},
                        resizable:{type:"boolean",default:true,descriptions:["type: boolean","Add the resize widget to the bottom rhs"]}
                        
                    }
                },
                menu:{
                    parameters:[
                        { components:{ type:"objectArray",
                                       required: true,
                                       default:"undefined",
                                       descriptions:["The object must contain a name and optionally an action and/or label ","<code>{name:'menu1',action:some_function,label:'some_string'}</code>", "action: A function that receives one arg which is 'this'","the action can also be 'default' in which case the following code is substituted","<br><code> var select_menu=function(that,index){<br>" +
                                                     `var name=that.menu[index].name;
  var p=that.getSiblings();

  if(!p){
     throw new Error('Could not find siblings of ' + that.parent.name);
  }

  for(var i=0;i &#60 p.length;i++){
     if(p[i].id == name){
        p[i].show();
     }
     else{
        p[i].hide();
     }
  }` + "<code/>" ]}                                             
                        }],  
                    return:{
                        success:{type:"object"},
                        fail:{type:"undefined"}
                    },    
                    options:{
                        selected:{type:"string",default:"undefined",descriptions:["type:string","name of the menu from the list"]},
                        heading:{type:"string",default:"undefined",descriptions:["type:string","Add a Heading to the top of the menu "]}
                    }
                },
                slideshow:{
                    parameters:[{components:{type:"objectArray",
                                             default:"undefined",required:'false',
                                             descriptions:["type: objectArray","array of Image objects","<code> var objectArray=[{src:'css/images/image1.png'},{src:'css/images/image2.png'}]","optional content objectArray e.g <code>var objectArray=[src:'css/images/im1.jpg', content:[{node:'paragraph',text:'slide text'}]]"]}}],
                    return:{
                        success:{type:"object"},
                        fail:{type:"undefined"}
                    },
                    options:{
                        delay:{type:"integer",default: "4000",descriptions:["type: integer","default: 4000", "time in milliseconds to display each image"]},
                        fit_to:{type:"string",default:"height",descriptions:["type: string -  'width'or'height'","default: 'height'","defaults to fitting the slideshow to the height of the parent element, otherwise changes the height of the parent element so the images fit the width "]},
                        controls:{type:"boolean",default:true,descriptions:["type: Boolean","default: true","display the controls"]},
                        thumbnails:{type:"boolean",default:"false",descriptions:["type: Boolean","default: false","display the thumbnails"]},
                        autoplay:{type:"boolean",default:true,descriptions:["type: Boolean","default: true","start playing immeditately"]},
                        fullscreen:{type:"boolean",default:"false",descriptions:["type: Boolean","default: true","Allow images to be fullscreen"]},
                        fade:{type:"boolean",default: "false",descriptions:["type: Boolean","default: false","Crossfade between the images"]},
                        fadeDuration:{type:"integer",default:"2000",descriptions:["type: integer","default:2000","Length of fade in milliseconds- must be less than delay"]},
                        keepAspectRatio:{type:"boolean",default:true,descriptions:["type: boolean","default:true","Calculate width and height to preserve the aspect ratio, if false size is derived from parent"]}
                    },
                    methods:{
                        play:{ parameters:[],
                               return:{
                                   success:{type:"this"},
                                   fail:{type:"null"}
                               },
                               descriptions:["start the slideshow"]
                             },
                        stop:{parameters:[],
                               return:{
                                   success:{type:"this"},
                                   fail:{type:"null"}
                               },
                              descriptions:["stop the slideshow"]
                        },
                        step:{parameters:[{dir:{type:"string",default:"prev"}}],
                               return:{
                                   success:{type:"integer"},
                                   fail:{type:"undefined"}
                               },
                              descriptions:["step through the slideshow, 'prev' or 'next'"]
                        },
                        showFullscreen:{parameters:[],
                               return:{
                                   success:{type:"this"},
                                   fail:{type:"undefined"}
                               }
                        }
                    }
                },
                tabs:{
                    parameters:[{components:{type:"objectArray",required:'false'}}
                               ],
                    return:{
                        success:{type:"object"},
                        fail:{type:"undefined"}
                    },
                    options:{
                        components:{type:"objectArray",required:'false',
                                    default: "undefined",descriptions:["type: objectArray","components can have four key value pairs- name, label,hidden,action ","example","<code> tabs:[{name:'some_string',label:'lovely label',hidden:true,action:function(that){ // do something }},{name:'another_name',label:'very lovely label'}]","this would creates two tabs with the labels displayed as 'lovely label', 'very lovely label'","Note: setting the tab option to hidden:true sets the display of the element to 'none'.","Returning false in the action function stops the tab from being set to selected"]},
                        selected:{type:'string',required:'false',
                                  descriptions:["name of the selected tab"]}
                    },
                    
                    methods:{
                        addTab:{
                            parameters:[{tab:{type:"object",required: true,
                                              default:"undefined",
                                              descriptions:[]}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"null"}
                            },
                            descriptions:[]
                        },

                        getSelected:{
                            parameters:[],
                            return:{
                                success:{type:"object",descriptions:["returns the created tab object"]},
                                fail:{type:"null"}
                            },
                            descriptions:["Get the currently selected tab object or null if none are selected "]
                        },
                        hideTab:{
                            parameters:[{name:{type:"string",default:'undefined',
                                               required:true}}],
                            return:{
                                success:{type:"object",descriptions:[]},
                                fail:{type:"null"}
                            },
                            descriptions:["Remove the named tab component from the DOM"]
                        },
                        showTab:{
                            parameters:[{name:{type:"string",default:"undefined",
                                               required:true,
                                               descriptions:["name of the tab component to show"]}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"null"}
                            },
                            descriptions:["Make the named tab component visible in the DOM"]
                        },
                        select:{
                            parameters:[{name:{type:"string",required:true,
                                               default:"undefined",
                                               descriptions:["selects the named tab, add the css 'selected' class"]}}],
                            return:{
                                success:{type:"this"},
                                fail:{type:"null"}
                            },
                            descriptions:[]
                        },
                        update:{
                            parameters:[{name:{type:"string",required:true,
                                               default:"undefined",
                                               descriptions:["name of a tab component"]}}
                                       ],
                            return:{
                                success:{type:"this"},
                                fail:{type:"null"}
                            },
                            descriptions:["force click on named tab"]
                        },
                        reset:{
                            parameters:[],
                            return:{
                                success:{type:"this"},
                                fail:{type:"null"}
                            },
                            descriptions:["remove the selection from all tabs"]
                        }
                    }
                    
                }
            } // end member
        },  // end display
        Panel:{
            generic:{
                parameters:[
                    {object:{type:'object', default:'undefined',
                             required: true}
                    },
                    {window:{type:"window",default:'undefined',required:'false'}}
                ],
                return:{
                    success:{type:"object"},
                    fail:{type:"null"}
                },
                common:{
                    components:{type:'objectArray',required:'false',
                                descriptions:["an array of displays that make up the panel - see the displays page for JSON syntax"]},
                   
                    name:{type:"string",required:'false',
                          descriptions:["only required if calling as a standalone - not if you're using UI.Panels={MyPanelName:{///}}"]}
                }
            },
            methods:{
                UIStart:{parameters:[{panel:{type:'string',required:true}}],
                         descriptions:[ "Load a panel into the DOM"]
                        },
                add:{ parameters:[{panel:{type:"string",required:true}}],
                      return:{
                          success:{type:"object",descriptions:["return Panel object, with two keys name and components"]},
                          fail:{type:"Error"}
                      },
                      descriptions:[ "Add a panel to the DOM and memory"]
                    },
                clone:{parameters:[{panel:{type:"string",required:true}}],
                       return:{
                           success:{type:"object",descriptions:["a Panel object with all its components"]},
                          fail:{type:"undefined"}
                       },
                       descriptions:["clone a panel object that has already  been defined "]},
                delete:{parameters:[{panel:{type:"string",required:true}}],
                        return:{
                            success:{type:"integer",descriptions:["The number of Panels"]},
                            fail:{type:"undefined"}
                        },
                        descriptions:["Delete a Panel from the DOM and memory - can only be reinstated with a call to Panel.add or Panel.UIStart(if it is defined in UI.Panels)"]
                       },
                deleteAll:{parameters:[{callbackFuntion:{type:'function',required:'false',descriptions:["Remove all the panels and its descendants from the DOM and memory"]}}],
                           return:{
                               success:{type:"undefined"},
                               fail:{type:"undefined"}
                           },
                           
                           descriptions:["<span class='red'> WARNING- THIS REALLY WILL DELETE ALL THE PANELS </span> &nbsp delete all the panels, usually called with window beforeunload to teardown"]
                          },
                get:{parameters:[{panel:{type:"string",required:true}}],
                     return:{
                         success:{type:"object"},
                         fail:{type:"null"}
                     },
                     descriptions:["Get a Panel object if it exists"]
                    },
                hide:{parameters:[{panel:{type:"string",required:true,dscriptions:["Name of the Panel to hide"]}}],
                      return:{
                          success:{type:"object",descriptions:["hide all the components in a Panel"]},
                          fail:{type:"null"}
                      },
                      descriptions:["Hide the Panel - but keep Panel and its descendants in memory"]},
                hideAll:{parameters:[{window:{type:'window',required:'false'}}],
                         return:{
                             success:{type:"undefined"},
                             fail:{type:"undefined"}
                         },
                         descriptions:["Remove all the panels from the DOM- but not from memory - to delete completely use the delete method"]},
                getList:{parameters:[],
                         return:{
                             success:{type:"stringArray"},
                             fail:{type:"null"}
                         },
                         descriptions:["list the names of all the windows in Apoco"]},
                show:{parameters:[{panel:{type:"string",required:true}}],
                      return:{
                          success:{type:"object",description:'pannel object'},
                          fail:{type:"null"}
                      },
                      descriptions:["puts all the display pbjects into the DOM - unless the display has hidden=true e.g my_display.hidden=true "]},
                showAll:{parameters:[{window:{type:'window',required:'false'}}],
                         return:{
                          success:{type:"undefined"},
                          fail:{type:"undefined"}
                         },
                         descriptions:["Put all the Panels into the DOM"]},
                
                addChild:{
                    parameters:[{displayObject:{type:'displayObject',required:true}}
                               ],
                    return:{
                        success:{type:"this",descriptions:["Display object"]},
                        fail:{type:"Error"}
                    },
                    
                    cmd:"var myObj=Apoco.Panel.get('Panel').addChild",
                    descriptions:["Add a displsy object to a panel and add to DOM unless display object has hidden:true"]},
                deleteChild:{
                    parameters:[{childId:{type:'string || object',required:true,
                                             descriptions:["display object or name of the child (string)"]}}],
                    return:{
                        success:{type:"integer",descriptions:["Number of children in the panel"]},
                        fail:{type:"null"}
                    },
                    
                    cmd:"Apoco.Panel.get('Panel').deleteChild",
                    descriptions:["Remove the display from the DOM and memory, if you just want to remove from DOM - use hide(); - if deleting more than one child use deleteChildren"]},
                deleteChildren:{
                    parameters:[{childArray:{type:"stringArray || objectArray", required:'false',descriprions:["Array of display names or array of display objects"]}}],
                    return:{
                        success:{type:"integer",descriptions:["Number of children in Panel"]},
                        fail:{type:"null"}
                      },
                    
                    cmd:"Apoco.Panel.get('Panel').deleteChildren",
                    descriptions:["If no params - deletes all the children otherwise deletes children in array"]},
                findChild:{parameters:[{propertyObject:{type:"propertyObject",required:true,descriptions:[" needs to be an object with at least one key value pair - key:id or element:HTMLElement or name:someName "]}
                                       }],
                           return:{
                               success:{type:"object"},
                               fail:{type:"null"}
                           },
                           
                           cmd:"var myObj=Apoco.Panel.get('Panel').findChild",
                           descriptions:["<code>var v=Apoco.Panel.get(string).findChild(object);</code>"]},
                getChild:{parameters:[{id:{type:'string || object',required:true,
                                           descriptions:["id of the child display or the display object"]}}],
                          return:{
                              success:{type:"this",description:'child context obj'},
                              fail:{type:"null"}
                          },
                          cmd:"var myObj=Apoco.Panel.get('Panel').getChild",
                          descriptions:["Get a child display object of the Panel"]},
                getChildren:{parameters:[],
                             return:{
                                 success:{type:"objectArray",descriptions:["an array of display objects "]},
                                 fail:{type:"null"}
                             },
                             cmd:"var myObj=Apoco.Panel.get('Panel').getChildren",
                             descriptions:["Get all the child display onjects in the panel"]}
            }
        },
        Window:{
            generic:{
                required:{},
                common:{}
            },
            methods:{
                delete:{parameters:[{name:{type:'string',required:true,descriptions:["name that was used in the object at window creation"]}}],
                        return:{success:{type:'undefined'},
                                fail:{type:''}}
                       },
                get:{parameters:[{name:{type:'string',required:true}}],
                     return:{success:{type:'object',descriptions:["For example- {name:'someName',window:win,promise:p}"]},
                                fail:{type:'null'}}
                    },
                open:{parameters:[{windowObject:{type:'windowObject',required:true,default:'none'}}],
                      return:{success:{type:'promise'},
                              fail:{type:'undefined'}},
                      descriptions:["Open a window- either as a popup (if opts is defined) or in a new tab "],
                      options:{name:{required:true},
                               url:{required:true},
                               opts:{required:'false',default:["<code> opts:{<br> width:600,<br> height:600,<br> menubar:0,<br> toolbar:0,<br> location:0, <br>  personalbar:0}; </code>"],
                                   
                                     descriptions:["any options that can be passed to a call to window.open can be added here.","If this key is missing opens a new tab"]
                                    }
                              }
                     }  
            }
        },
        IO:{
            generic:{
                required:{},
                common:{} 
            },
            methods:{
                REST:{parameters:[{type:{type:"RESTString",required:true,descriptions:"GET POST or PUT"}},
                                  {options:{type:"RESTOptions",required:'false',descriptions:[ " "]}},
                                  {data:{type:"data",descriptions:[]}}
                                 ],
                      return:{
                          success:{type:"promise",descriptions:[""]},
                          fail:{type:""}
                      },
                      descriptions:[]
                     },
                dispatch:{parameters:[{name:{type:'string',required:true,descriptions:["dispatching causes all the listeners to run their callback function"]}},
                                      {arg:{type:'any',required:'false',default:'undefined',descriptions:["Parameter to be passed to the listeners callback function "]}}],
                          return:{
                              success:{type:"undefined"},
                              fail:{type:"undefined"}
                          }},
                getFiles:{parameters:[{fileArray:{type:"stringArray",required:true}},
                                      {options:{type:"object",required:true}}],
                          return:{
                              success:{type:"promiseArray"},
                              fail:{type:"none"}
                          }},
                getSubscribers:{parameters:[{name:{type:'string',required:true, descriptions:["list all the subscribers listening to this event"]}}],
                          return:{
                              success:{type:"objectArray"},
                              fail:{type:"null",descriptions:["no subscribers"]}
                          }},
                listen:{parameters:[{object:{type:'listenObject',required:true,descriptions:["Any Object which has a key value pair where the key, listen, is an array of objects with two keys name and action "]}}],
                        options:{name:{type:"string",required:'false'}},
                        return:{
                            success:{type:"undefined"},
                            fail:{type:"undefined"}
                        },
                        descriptions:["Listen is designed to work with fields and displays but can be added to any object which has a key value pair with  <code> var myObj={listen:[{name:'someName',action:callbackFunction },<br> {name:'anotherName',action:anotherCallback}]};\n </code> then call \n <code> Apoco.IO.listen(myObj); </code> "]
                       },
                publish:{parameters:[{object:{type:'publishObject',required:true}}],
                          return:{
                              success:{type:"undefined"},
                              fail:{type:"undefined"}
                          }},
                unsubscribe:{parameters:[{object:{type:'listenObject',required:true}}],
                          return:{
                              success:{type:"undefined"},
                              fail:{type:"undefined"}
                          }},
                webSocket:{parameters:[{options:{type:'object'}}],
                           return:{
                               success:{type:"object",descriptions:["a websocket object"]},
                               fail:{type:"undefined"}
                           },
                           descriptions:["Uses json, and pubSub dispatch to post messages",
                                        "any process can pick up the data with listen"],
                           options:{
                               url:{type:'string',required:'true',default:'none'},
                               reconnectMax:{type:'integer',default:6,required:'false'},
                               errorCallback:{type:'function',required:'false',
                                              descriptions:["function called on open or close errors"]},
                               closeCallback:{type:'function',required:'false',
                                              descriptions:["function called when socket closes"]}
                           },
                           methods:{
                               send:{parameters:[{data:{type:'json'}}],
                                     return:{ success:{type:'undefined'},
                                              fail:{type:'undefined'}
                                            }
                                    },
                               close:{parameters:[{}],
                                      return:{ success:{type:''},
                                               fail:{type:''}
                                             }
                                     },
                               cork:{parameters:[{on:{type:'boolean'}}],
                                      return:{ success:{type:''},
                                               fail:{type:''}
                                             }},
                               getSocket:{parameters:[{}],
                                      return:{ success:{type:''},
                                               fail:{type:''}
                                             }},
                               reconnect:{parameters:[{successFunction:{type:'function',required:'false'}},
                                                      {failFunction:{type:'function',required:'false'}}],
                                      return:{ success:{type:''},
                                               fail:{type:''}
                                             }}
                           }
                          }  
            } 
        },
        popup:{
            generic:{
                required:{},
                common:{} 
            },
            member:{
                alert:{
                    parameters:[{title:{type:"string"}},
                                {text:{type:"text"}}],
                    
                    return:{
                        success:{type:"HTMLElement",description:"root html element"},
                        fail:{type:"undefined"}
                    },
                    options:{
                        title:{type:"string",default:"undefined"},
                        text:{type: "string",default: "none"},
                        time:{ type:"integer",default: 0,
                               descriptions:["set a timeout on the display of the popup in milliseconds"]}
                    }
                },
                dialog:{
                    parameters:[{title:{type:"string",default:"''",required:'false'}},
                                {text:{type:"text",required:'false',default:"' '"}}],
                    return:{
                        success:{type:"object",description:"'this' - the dialog Object returned from call to 'new'"},
                        fail:{type:"undefined"}
                    },
                    options:{title:{type:"string",default:"undefined"},
                             text:{type: "string",default: "none"},
                             modal:{type: "boolean", default: "false"}
                            },
                    methods:{
                        close:{parameters:[],
                               return:{
                                   success:{type:"undefined"},
                                   fail:{type:"undefined"}
                               }},
                        exists:{parameters:[],
                                return:{
                                    success:{type:'boolean', descriptions:["true"]},
                                    fail:{type:'boolean',descriptions:['false']}
                                }},
                        update:{parameters:[{title:{type:'string'}},
                                            {msg:{type:"string"}}
                                           ],
                                return:{
                                    success:{type:"undefined"},
                                    fail:{type:"undefined"}
                                }
                               }
                    }
                },
                error:{
                    parameters:[{title:{type:"string",required:true,default:"undefined"}},
                                {text:{type: "text",required:'false',default:''}}],
                    return:{
                        success:{type:"undefined"},
                        fail:{type:"undefined"}
                    },
                    descriptions:["This is the popup that is called if a thrown error is not otherwise caught"]
                },
                spinner:{
                    parameters:[{state:{type: "boolean",default:'false',descriptions:["switch the spinner off and on"]}}],
                    return:{
                        success:{type:'HTMLElement',descriptions:["Root element"]},
                        fail:{type:"undefined"}
                    }
                },
                statusCode:{
                    cmd:"Apoco.popup.statusCode[404]",
                    parameters:[
                        {statusCode:{type:'statusCode',required:true}},
                    ],
                    return:{
                        success:{type:"undefined"},
                        fail:{type:"undefined"}
                    },
                    options:{
                        text:{type: "string",required:'false'}
                    }
                },
                trouble:{
                    parameters:[{title:{type: "string",required:true, descriptions:["Heading for dialog"]}},
                                {text: {type:"text",required:'false',descriptions:["message text body"]}}],
                    return:{
                        success:{type:"undefined"},
                        return:{type:"undefined"}
                    }
                    
                }
            }
        },
        Utils:{
            generic:{
                required:{},
                common:{}
            },
            methods:{
                addClass:{
                    parameters:[{element:{type:"HTMLElement"}},
                               {"class":{type:"string || array"}}],
                    return:{
                        success:{type:"undefined"},
                        fail:{type:"undefined"}
                    },
                    descriptions:[]
                },
                binarySearch:{
                    parameters:[{array:{type:"sortedArray",required:true,descriptions:["Array must be sorted, the array can be an objectArray"]}},
                                {sortOrder:{type:"sortOrderArray",required:'false',descriptions:["Array containing the order in which the array has been sorted e.g sortOrfer=['name','id']"]}},
                                {findItem:{type:"sortedArrayElement",required:true}}
                               ],
                    options:{
                        closest:{type:'object',required:'false',default:'false',descriptions:["If the item cannot be found in the array return the closest element two key value pairs {index:-1,dir:null} binarySearch populates this with the array index and direction - 'before' or 'after'"]}
                    },
                    return:{
                        success:{type:"arrayElement"},
                        fail:{type: "null || closest"}
                    },
                    descriptions:["The input must be a sorted Array or sorted objectArray"]},
                dateNow:{
                    parameters:[],
                    return:{
                        success:{type:"date"},
                        fail:{type:"undefined"}
                    },
                    descriptions:[]},
                datePast:{
                    parameters:[{date:{type:'date',required:true}}],
                    return:{
                        success:{type:"boolean",descriptions:['true if the date is in the past']},
                        fail:{type:"boolean",descriptions:['false if the dat is in the future']}
                    },
                    descriptions:["Determines if the date in the past"]},
                detectMobile:{
                    parameters:[],
                    return:{
                        success:{type:"boolean"},
                        fail:{type:"boolean"}
                    },
                    descriptions:[]},
                draggable:{
                    parameters:[{source:{type:'HTMLElement',required:true}}],
                    return:{
                        success:{type:'undefined'},
                        fail:{type:'Error'}
                    },
                    options:{
                        destination:{type:'HTMLElement',required:false,default:'body'},
                        handle:{type:'HTMLElement',required:false,default:'source'}
                    },
                    descriptions:["Make an HTML element draggable, if handle is specified that is the element which needs to be clicked to drag  "]
                },
                extend:{
                    parameters:[{base:{type:"object"}}],
                    return:{
                        success:{type:"object"},
                        fail:{type:"null"}
                    },
                    descriptions:[]},
                fontSizeToPixels:{
                    parameters:[{fontSize:{type:"integer"}}],
                    return:{
                        success:{type:"integer"},
                        fail:{type:"null"}
                    },
                    descriptions:["rough guide to convert font sizes to pixels"]},
                formatDate:{
                    parameters:[{date:{type:'date',required:true}}],
                    return:{
                        success:{type:"string"},
                        fail:{type:"Error"}
                    },
                    descriptions:["Comvert a date from YYYY-MM-DD or YYYYMMDD to long form"]},
                getCssValue:{
                    parameters:[],
                    return:{
                        success:{},
                        fail:{}
                    },
                    descriptions:["Doesn't work in Chrome"]},
                getSiblings:{
                    parameters:[{element:{type:"HTMLElement"}}
                               ],
                    return:{
                        success:{type:"array of HTMLElements"},
                        fail:{type:"empty array"}
                    },
                    descriptions:[]},
                hashCode:{
                    parameters:[{string:{type:'string',required:true}}],
                    return:{
                        success:{},
                        fail:{}
                    },
                    descriptions:["Very lightweight hashing - in all senses of lightweight"]},
                history:{
                    parameters:[],
                    return:{
                        success:{},
                        fail:{}
                    },
                    descriptions:[]},
                observer:{
                    parameters:[],
                    return:{
                        success:{},
                        fail:{}
                    },
                    descriptions:["If you are using the full Apoco implementation the observer will already be running, in which case you can use the 'dependsOn' option which is available with most Apoco objects"]},
                widthFromCssClass:{
                    parameters:[],
                    return:{
                        success:{},
                        fail:{}
                    },
                    descriptions:[]}
            } 
        }/*,
        Examples:{
            generic:{
                required:{},
                common:{},
                descriptions:[]
            },
            member:{
                login:{descriptions:["Login "]},
                tabs:{},
                grid:{},
                form:{}
            } 
        }*/
    };
    
})();
