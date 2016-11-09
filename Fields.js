var Apoco=require('./declare').Apoco;
require('./Utils');
require("./Sort");
require('./Types');
require("./datepicker");

// editable: true by default
// required: false by default

;(function(){
    "use strict";

    Apoco.dbToHtml={
	integer:{html_type: "number", field: "input"}, 
	positiveInteger: {html_type:"number", field: "input"},
	negativeInteger:{html_type:"number", field: "input"},
	date: {html_type:"date", field: "date"},
	time: {html_type:"time",field: "time"},
	string: {html_type: "text", field: "input"},
	token: {html_type:"text", field: "input"},
	alphaNum: {html_type:"text", field: "input"},
	image: {html_type:"file", field: "input"},
	currency: {html_type:"number", field: "input"},
	email: {html_type:"email", field: "input"},
	float: {html_type:"number", field: "float"},
	integerArray: {html_type:"number", field: "numberArray"},
	phoneNumber: {html_type:"tel", field: "input"},
	floatArray: {html_type:"number", field: "numberArray"},
	boolean: {html_type: "checkbox",field: "checkBox"},
	text: { html_type:"text",field: "textArea"},
	stringArray: {html_type: "text",field: "stringArray"},
	imageArray: {html_type: "image", field: "imageArray"},
	password: {html_type: "password", field:"input"},
        range:{html_type:"range",field: "slider"},
        any:{html_type:"text",field:"input"} //default
    };

/*  Apoco.HtmlToType=function(field){
 	for(var k in  Apoco.dbToHtml){
	    if(Apoco.dbToHtml[k].field == field){
		return Apoco.dbToHtml[k].html_type;
	    }
	}
	return "";
    };
*/
    var _Field=function(d,element){
        var defaults={
            required:false,
            editable: true,
            type: "any",
            value: ""
        };
        if(!d){
            throw new Error("Field: must have some options");
        }
        if(!d.name){
            throw new Error("Apoco.field: Field must have a name");
        }
        if(!d.type){
            throw new Error("Apoco.field: must have a type");
	}
     
        for(var k in defaults){  
            if(d[k] === undefined){
                d[k]=defaults[k];
            }
        }
        
        for(var k in d){
            this[k]=d[k];
        }
        if(this.editable===false){
            this.popup=false; // no popup editor if not editable
        }
        
	this.html_type=Apoco.dbToHtml[this.type].html_type;
        if(element === undefined){
            this.element=document.createElement("div");
        }
	else if(element){
            this.element=element;
        }
	else {
            throw new Error("Field: element is not a html node");
            //this.element=element;
        }
        this.element.classList.add(this.type);
	this.element.setAttribute("name",this.name);
        if(this.title !== undefined){
            this.element.title=this.title;
        }
	if(this.label){
            var l=document.createElement("label");
            l.appendChild(document.createTextNode(this.label));
            l.setAttribute("for",this.name);
	    this.element.appendChild(l);
	}
        
	if(this.publish !== undefined){
	    Apoco.IO.publish(this);
	}
	if(this.listen !== undefined){
	    //console.log("field adding listener " + this.name);
	    Apoco.IO.listen(this);
	}
      //  console.log("in Fields parent is " + this.parent + " original parm is " + d.parent);
/*	if(this.action){
            var a=this.action;
            var ea=(function(that){
                console.log("Field action is here");
		return function(e){
                    e.stopPropagation();
                    console.log("event function is " +a);
                    //that.action(that);
                   that.action(that);
                };
	    })(this);
            this.element.addEventListener("click", ea,false);
        }     */
   
    };

    _Field.prototype={
	getElement:function(){
	    return this.element;
	},
	getInputElement: function(){
	    if(this.input){
		return this.input;
	    }
	    return null;
	},
        getLabel:function(){
            var t=this.element.getElementsByTagName("label")[0];
            if(t){
                return t;
            }
            return null;
        },
	getKey:function(){
            var k=(this.name)?this.name: this.label;
	    if(k){
		return k;
	    }
	    return null;
	},
	getValue:function(){
            if(this.input.pending){
                return undefined;
            }
	    var v=this.input.value;
	    if( v && v.length > 0){
		return this.input.value;
	    }
	    return undefined;
	},
	setValue:function(v){
	    this.value=v;
            //console.log("setting value " + v);
            if(this.value === null){
                this.input_value="";
            }
	    else {
                this.input.value=v;
            }
            if(this.input.pending){
                this.input.classList.remove("pending");
                this.input.pending=false;
            }
	},
        delete:function(){
            // remove all the nodes
            while (this.element.lastChild) {
                this.element.removeChild(this.element.lastChild);
            }
            if(this.element.parentNode){
                this.element.parentNode.removeChild(this.element);
            }
            if(this.action){ // cannot do if this.action is  wrapped in anonymous function
                this.element.removeEventListener("click",this.action,false);
            } 
            if(this.listen){
                Apoco.IO.unsubscribe(this);
            }
            this.element=null;
            this.input=null;
            this.value=null;
        },
	popupEditor:function(func){
            if(!this.editable){ return;}
	    if(this.input.length >0){ // element exists
		var cb=function(that){
		    return function(e){
			e.stopPropagation();
			if(e.which === 13){
			    //var v=this.input.val();
			    //console.log("editor got value " + that.input.val());
			    func(that.input.val());
			}
		    };
		}(this);
	//	this.input.keypress(cb);
	    //this.input.blur(func(this.input.val()));
	    }
	    else{
		throw new Error("no input element for this type " + this.type);
	    }
	},
        _resetValue:function(){
            if(Apoco.Utils.checkType["array"](this.value)){
                for(var i=0;i<this.value; i++){
                    this.input[i].value=this.value[i];
                }
                return;
            }
            this.input.value=this.value;
        },
/*	displayInvalid:function(element){
	    if(!element){
		element=this.element;
	    }
	    element.addClass("invalid");
	    //element.prop("title","Invalid input- should be of type " + this.type);
	},
	resetInvalid:function(element){
	    if(!element){
		element=this.element;
	    }
	    element.removeClass("invalid");
	    element.prop("title","");
	    //element.tooltip("disable");
	}, */
	checkValue:function(){
	    //console.log("_Field checking value " + this.getValue() + " of type " + this.type );
	    var array=false;
            var v=this.getValue();
            if(Apoco.checkType["blank"](v)){
   	        if(this.required){
                    return false;
                }
            }
            if(Apoco.checkType[this.type] !== undefined){
                if(!Apoco.checkType[this.type](v)){
                    return false;
                }
 	    }
	    return true;
	}
    };

 

    var InputField=function(d,element){
        var that=this;
	//console.log("INPUT FIELD IS HERE with required " + d.required);
        d.field="input";
	_Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        //s.className=this.type;

        this.input=s;
        if(this.min){
            this.input.setAttribute("min",this.min);
        }
        if(this.max){
            this.input.setAttribute("min",this.max);
        }
        if(this.step){
            this.input.setAttribute("step",this.step);
        }
        if(this.precision){
            this.input.setAttribute("pattern", "^[-+]?\d*\.?\/" + this.precision + "*$");
        }

        if(this.required === true){
            this.input.required=true;
        }
        this.element.appendChild(this.input);
   
	if(this.value !== null && this.value !== undefined){
            this.input.value=this.value;
	}
        if(this.editable === false){
            this.input.readOnly=true;
        }
        if(this.action){
            this.action(this);
        }
	return this;
    };

    Apoco.Utils.extend(InputField,_Field);

    var FloatField=function(d,element){
        var inp;
	var that=this;
	//console.log("FLOAT FIELD IS HERE");
        d.field="float";
        d.type="float";
	_Field.call(this,d,element);
	this.input=new Array(2);
        if(this.precision===undefined){
            this.precision=2;
        }
	var list=document.createElement("ul"); 
        list.classList.add('aligned_float');
	var el=document.createElement("li");
	var dec=document.createElement("div");
        dec.className='values';
        inp=document.createElement("input");
        inp.className="float_left";
        inp.setAttribute("pattern",'^[-+]?[0-9]*$');
        this.input[0]=inp;
        inp=document.createElement("input");
        inp.className="float_right";
       // inp.setAttribute("pattern",("'^[0-9]*.{0}|.{"+ this.precision + "}$'"));
        inp.setAttribute("type","text");
        this.input[1]=inp;
	this.setValue(this.value);

	dec.appendChild(this.input[0]);
        var s=document.createElement("span");
        s.textContent=".";//("&#46");
        dec.appendChild(s); // add the .
	dec.appendChild(this.input[1]);
	el.appendChild(dec);
	list.appendChild(el);
        if(this.required === true){
            this.input[1].required=true;
            this.input[0].required=true;
        }
        if(this.editable === false){
            this.input[0].readOnly=true;
            this.input[0].readOnly=true;
            this.spinner=false;
        }
        if(this.spinner){
	    el=document.createElement("li");
            list.appendChild(el);
            dec=document.createElement("div");
            dec.className="arrows";
            el.appendChild(dec);
            var up=document.createElement("span");
            up.classList.add("up","ui-icon","ui-icon-triangle-1-n");
            var down=document.createElement("span");
            down.classList.add("down","ui-icon","ui-icon-triangle-1-s");
            dec.appendChild(up);
	    dec.appendChild(down);
            if(this.step === undefined){
                this.step=0.1;
            }
            
	    var timer;
	    var step_fn=function (direction){
	        var t=that.getValue();
	        if(t=== null || t===""){
		    clearInterval(timer);
		    return;
	        }
	        if(!Apoco.checkType.float(t)){
		    clearInterval(timer);
		    throw new Error("stepfn return from getValue: this is not a floating point number");
	        }
	        if(direction==="up"){
		    t=parseFloat(t,10)+that.step;
	        }
	        else{
		    t=parseFloat(t,10)-that.step;
	        }
	        t=parseFloat(t,10).toFixed(that.precision);
	        //console.log("step_fn: after inc to fixed " +  t);
	        if(that.setValue(t) === null){
		    clearInterval(timer);
		    throw new Error("step_fn val is not floating point " + t);
	        }
	    };

	 /*   var dispatch_change=function(){
	        var e=new Event("change");
                that.element.dispatchEvent(e);
	    };
*/
	    var eObj={
	        mouseover: function(e) {
                    e.stopPropagation();
		    e.currentTarget.parentNode.classList.add('ui-state-hover');
	        },
	        mouseout: function(e) {
                    e.stopPropagation();
		    e.currentTarget.parentNode.classList.remove('ui-state-hover');
	        },
                click:function(e){
                    e.preventDefault();
		    e.stopPropagation();
		    if(e.currentTarget === down){
		       step_fn("down");
		    }
		    else{
		        step_fn("up");
		    }
                },
	        mousedown: function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    if(e.currentTarget === down){
		        timer=setInterval(function(){step_fn("down");},100);
		    }
		    else{
		        timer=setInterval(function(){step_fn("up");},100);
		    }
	        },
 	        mouseup: function(e){
                    e.stopPropagation();
		    if(timer){
		        clearInterval(timer);
		    }
		   // dispatch_change();
	        }
	    };
            for(var k in eObj){
                up.addEventListener(k,eObj[k],false);
                down.addEventListener(k,eObj[k],false);
            }
	   	    
        };
	this.element.appendChild(list);
        if(this.action){
            this.action(this);
        }
	return this;
    };


    FloatField.prototype={
	getValue: function(){
            var a=this.input[0].value;
            var b=this.input[1].value;
	    if(Apoco.checkType.blank(a)) {
		//console.log("input integer is null");
		if(Apoco.checkType.blank(b)){
		    return this.value="";
		}
		else{
		    this.value=parseFloat(("0."+b),10).toFixed(this.precision);
		}
	    }
	    else if(Apoco.checkType.blank(b)){
		//console.log("input decimal is null");
		//console.log("getValue: integer part null, value b is " + b);
		this.value=parseFloat((a + ".000"),10).toFixed(this.precision);
		//console.log("getValue: integer part null, value is " + this.value);
	    }
	    else{
                if(a<0){
		    this.value=(parseInt(a,10)-parseFloat(("." + b),10)).toFixed(this.precision);
                }
                else{
                    this.value=(parseInt(a,10)+parseFloat(("." + b),10)).toFixed(this.precision);
                }
	    }
	    if(!Apoco.checkType.float(this.value)){
		throw new Error("getValue: this is not a floating point number " + this.value);
		return null;
	    }
	    return this.value;
	},
        _resetValue:function(){
            this.setValue(this.value);
        },
	setValue: function(v){
            // console.log("float setValue " + v);
            
	    if(Apoco.checkType.blank(v)){
                this.input[0].value="";
                this.input[1].value="";
		this.value="";
		return;
	    }
            if(!Apoco.checkType["float"](v)){
		throw new Error("FloatField: setValue this value is not a float " + v);
	    }
	    v=parseFloat(v,10).toFixed(this.precision);  // not necessarily a number
	    var p=v.toString().split(".");
	    if(p.length !== 2){
		throw new Error("value is not a floating point number" + v);
		return null;
	    }
            //console.log("setValue: value is " + p[0]);	  
            this.input[0].value=p[0];
            this.input[1].value=p[1];
	    this.value=v;
	},
        popupEditor: null
    };

    Apoco.Utils.extend(FloatField,_Field);

    var DateField=function(d,element){
        var that=this;
        d.field="date";
        d.type="date";
        _Field.call(this,d,element);
        this.input=document.createElement("input");
        this.input.type=this.html_type;
        //this.input.className=this.type;
         if(this.required === true){
            this.input.required=true;
        }
        this.element.appendChild(this.input);
        if(this.value){
            this.input.value=this.value;
	}
	if(this.editable !== false){
            if(navigator.appCodeName === "Mozilla"){ //add a datepicker cause none on Mozilla
              //  console.log("Making datepicker for Mozilla");
                this.input.type="text";
                this.input.setAttribute("placeholder","YYYY-MM-DD");
                Apoco.datepicker.init(this.input);
            }
            else{
                this.picker=document.createElement("datepicker");
                this.picker.setAttribute("type","grid");
                this.input.appendChild(this.picker);
            }
        }
        if(this.action){
            this.action(this);
        }
 	return this;
    };
  
    Apoco.Utils.extend(DateField,_Field);

    var TimeField=function(d,element){
        d.field="time";
        d.type="time";

	_Field.call(this,d,element);
        this.input=document.createElement("input");
        this.input.setAttribute("type",this.html_type);
        if(this.required === true){
            this.input.required=true;
        }
        this.element.appendChild(this.input);
        if(this.editable === false){
            this.input.readOnly=true;
        }
        if(this.action){
            this.action(this);
        }
        return this;
    };

    Apoco.Utils.extend(TimeField,_Field);

    var CheckBoxField=function(d,element){
        d.field="checkBox";
        d.type="boolean";
  	_Field.call(this,d,element);
        this.input=document.createElement("input");
        this.input.setAttribute("type",this.html_type);
        this.input.className="check_box";
        
        this.element.appendChild(this.input);
        if(this.required===true){
            this.input.required=true;
        }
	//console.log("checkbox value is " + d.value);
        this.setValue(this.value);
        if(this.editable === false){
            this.input.setAttribute("disabled",true);
        }
        if(this.action){
            this.action(this);
        }
	return this;
    };

    CheckBoxField.prototype={
	getValue:function(){
	   // console.log("value of checkbox is " + this.input.value + " and prop is " + this.input.getAttribute('checked') + " value is " + this.value);
	   // console.log("this input.checked is " + this.input.checked);
            return this.input.checked;
	},
        setValue:function(val){
            if(val === "true" || val === true || val === 1){
	       // console.log("setting checkbox value to true");
                this.input.setAttribute("checked","checked");
	    }
	    else {
	        //console.log("setting checkbox value to false");
                if(this.input.hasAttribute("checked")){
                    this.input.removeAttribute("checked");
                }
	    }
        },
	popupEditor:function(func){
	    //console.log("checkbox editor is here");
            if(this.editable === true){
	        var cb=function(that){
		    return function(e){
		        e.stopPropagation();
		        func(that.input.checked);
		    };
	        }(this);
	        this.input.AddEventListener("click",cb,false);
            }
        }
    };

    Apoco.Utils.extend(CheckBoxField,_Field);

    var NumberArrayField=function(d,element){
        if(!d.size && !d.value ){
            throw new Error("NumberArrayfield needs a size or value");
        }
        d.field="numberArray";
	_Field.call(this,d,element);
        if(!this.size){
            this.size=this.value.length;
        }
	this.input=new Array(this.size);
	this.popup=true;
        if(this.type === "floatArray" && this.step === undefined){
            this.step=0.1;
        }
	if(this.value && !Apoco.checkType.array(this.value)){
	    throw new Error("NumberArrayField: value is not an array");
	}
	for(var i=0;i<this.input.length;i++){
            this.input[i]={};
            if(this.value){ 
	        this.input[i].value=(this.value[i] || "");
            }
            this.addValue(i,"internal");
   	}
        if(this.action){
            this.action(this);
        }
	return this;
    };

    NumberArrayField.prototype={
        addValue:function(i,internal){
            var s;
            if(internal !== "internal"){
                var v=i;
                i=this.input.length;
                this.input[i]={};
                this.input[i].value=v;
            }
            this.input[i].input=document.createElement("input");
            this.input[i].input.setAttribute("type", this.html_type);
            this.input[i].input.className=this.type;
            if(this.required===true){
                this.input[i].input.required=true;
            }
            this.input[i].input.value=this.input[i].value;
            if( this.delimiter !== undefined){
                if(i>0 && i<(this.input.length-1)){
                    s=document.createElement("span");
                    s.textContent=this.delimiter;
                    this.element[0].appendChild(s);
                }
            }
            if(this.editable === false){
                this.input[i].input.readOnly=true;
            }
            else{
                if(this.min){
                    this.input[i].input.setAttribute("min", this.min);
                }
                if(this.max){
                    this.input[i].input.setAttribute("max", this.max);
                }
                if(this.step){
                    this.input[i].input.setAttribute("step", this.step);
                }
            }
 	    this.element.appendChild(this.input[i].input);
            
        },
        deleteValue:function(value){
            var index = -1;
            for(var i=0;i<this.input.length;i++){
                if(this.input[i].value === value){
                    if(index !== -1){
                        throw new Error("Mpre than one values matches "+ value);
                    }
                    index=i;
                }
            }
            if(index !== -1){
                this.input.splice(index,1);
            }
        },
	setValue: function(v){
            if(v.length >this.input.length){
                throw new Error("NumverArratField: input array size is less than value size");
            }
   	    for(var i=0;i<this.input.length;i++){
                if(v[i]){
                    this.input[i].input.value=Number(v[i]);
                }
                else{
                    this.input[i].input.value="";
                }
	    }
            this.value=v;
	},
	getValue:function(index){
            if(index !== undefined && index< this.input.length){
                return this.input[index].input.value;
            }
            var v=new Array;
            for(var i=0;i<this.input.length;i++){
	        v[i]=this.input[i].input.value;
            }
            return v;
	},
	popupEditor:function(func){
	    if(this.input.length>0){
		var r=this.getValue();
		this.element.addEventListener("keypress",function(event){
		    event.stopPropagation();
		    if(event.which === 13){
			//console.log("got value " + this.input.val());
			func(r);
		    }
		},false);
	    }
	    throw new Error("no input element for this type " + this.type);
	}
    };

    Apoco.Utils.extend(NumberArrayField,_Field);

    var TextAreaField=function(d,element){
        //var settings=checkDefaultOptions("TextAreaField",d);
        d.field="textArea";
        d.type="text";
	_Field.call(this,d,element);
	this.popup=true;
        this.input=document.createElement("textarea");
        if(this.required===true){
            this.input.required=true;
        }
	this.element.appendChild(this.input);
	if(this.value){
            this.input.value=this.value;
	}
        if(this.editable === false){
            this.input.readOnly=true;
            this.popup=false;
        }
        if(this.action){
            this.action(this);
        }
	return this;
    };

    TextAreaField.prototype={
	popupEditor:function(func,ok,cancel){

	    if(ok && ok.length >0 && cancel && cancel.length >0){
		var cb=function(that){
		    return function(e){
			e.stopPropagation();
			that.value=that.input.val();
			func(that.input.val());
		    };
		}(this);
		var bb=function(that){
		    return function(e){
			e.stopPropagation();
			func(null);
		};
		}(this);
		ok.addEventListener("click",cb,false);
		cancel.addEventListener("click",bb,false);
	    }
	    else{
		throw new Error("no input element for this type " + this.type);
	    }
	}
    };

    Apoco.Utils.extend(TextAreaField,_Field);


    var SelectField=function(d,element){
	var i,o;
        d.field="select";
        d.type="string";
	_Field.call(this,d,element);

        var options=document.createElement("select");
        if(this.required === true){
            options.required=true;
        }
	for(i=0; i<this.options.length; i++){
	    if(i===0 && this.blank_option !== undefined && this.blank_option === true){ // add a blank option at the head of the list
                o=document.createElement("option");
                o.value="";
                options.appendChild(o);
	    }
            o=document.createElement("option");
            o.value=this.options[i];
            o.textContent=this.options[i];
            options.appendChild(o);
	}
        this.select=options;
	var cd=function(that){
		return function(e){
		    e.stopPropagation();
		    if(that.input.style.visibility === "visible"){ //}("visible")){
			that.input.style.visibility= "hidden"; //hide();
                        that.span.style.visibility="hidden";
                        that.element.style.visibility="visible";
		    }
		};
	}(this);


        var mk_input=function(){
            this.input=document.createElement("input");
           // this.input.className=this.type;
            this.input.setAttribute("type",this.html_type);
            this.input.style.visibility="hidden";
            this.span=document.createElement("span");
            if(this.required===true){
                this.input.required=true;
            }
            this.span.classList.add("ui-icon","ui-icon-triangle-1-s");
            this.span.style.visibility="hidden";
            this.element.appendChild(this.input);
            this.element.appendChild(this.span);
            this.span.addEventListener("click",cd);
        };

        var that=this;
	// if selection option is "Other" add a new input field
        this.select.addEventListener("change",function(){
	    //console.log("select option has changed");
            if(that.select.value === "Other"){      
		if(!this.input){ 
                    mk_input();
                }
                that.element.getElementsByTagName("select").style.visibility="hidden";
	        that.input.style.visibility="visible";
	        that.span.style.visibility="visible";
	        that.input.focus();
	    }
	    else if(that.edit_func){ //set for editor callback
		var v=that.getValue();
		that.value=v;
		//console.log("got value " + v);
		if(that.edit_func.context){
		    that.edit_func.cmd.call(that.edit_func.context,v);
		}
		else that.edit_func(v);
	    }

	});

	if(this.value){
            this.select.value=this.value;
	}
        this.element.appendChild(this.select);
        if(this.action){
            this.action(this);
        }
	return this;
    };


    SelectField.prototype={
        setValue: function(v){
            for(var i=0;i<this.options.length;i++){
                if(this.options[i] == v){
                    this.select.value=v;
                    return;
                }
            }
            if(this.input){
                this.input.value=v;
                return;
            }
            throw new Error("SelectField: Cannot set value to " + v + " options are " + this.options[0] + " " +  this.options[1] + " " + this.options[2] );
            this.value=v;
        },
	getValue:function(){
	   
	    if(this.input && this.input.value){
		var v=this.input.value;
	    }
	    else{
		var v=this.select.value;
	    }
	    if(v && v.length > 0){
		return v;
	    }
	    return null;

	},
	popupEditor:function(func){
	    this.edit_func=func;
	}

    };

   Apoco.Utils.extend(SelectField,_Field);

    var ButtonSetField=function(d,element){   // like select field - but not in a dropdown and not editable
        d.field="ButtonSetField";
        d.type="boolean";
        if(!d.labels || d.labels.length ===0){
	    throw new Error("must have a labels array for ButtonSetField");
	}
          
	_Field.call(this,d,element);
        this.input=[];
        for(var i=0;i<this.labels.length;i++){
            this.input[i]={};
            this.input[i].label=this.labels[i];
        }
        this.labels.length=0;
	this.popup=true;
        var u=document.createElement("ul");
        u.className="choice";
	this.element.appendChild(u);
	for(var i=0;i<this.input.length;i++){
	    //console.log("adding label " + this.labels[i]);
	    this.addValue(i);
	};
        if(this.action){
            this.action(this);
        }
	return this;
    };

    ButtonSetField.prototype={
	addValue:function(index){
            if(index === undefined){
                throw new Error("ButtonSetField: must supply a name");
            }
            if(!Apoco.checkType["integer"](index)){
                var label=index;
                index=this.input.length;
                this.input[index]={};
                this.input[index].label=label;
            }
            var l=document.createElement("li");
            l.textContent=this.input[index].label;
	    
	    this.element.getElementsByTagName('ul')[0].appendChild(l);

	    //console.log("buttonSet adding field " + p + " label " + this.labels[p]);
            this.input[index].input=document.createElement("input");
            if(this.checkbox === true ){
                this.input[index].input.type="checkbox"; //setAttribute("type","checkbox");
            }
            else{
                this.input[index].input.type="radio"; //setAttribute("type","radio"); 
            }
            
	    l.appendChild(this.input[index].input);

            if(this.checkbox !== true){
	        this.input[index].input.addEventListener("click",function(that,node){
		    return function(e){
		        e.stopPropagation();
                        console.log("click for " + node.parentNode.text);
                        console.log("current checked is " + node.checked);
                        console.log("radio buttons");
                        for(var i=0;i<that.input.length;i++){
                            if(that.input[i].input !== node){
                                console.log("setting checked for  " + that.input[i].input.parentNode.text);
                                console.log("from  " + that.input[i].checked + " to false ");
                                that.input[i].input.checked=false;
                            }
                        }
		    };
	        }(this,this.input[index].input)); 
            }
	},
	_resetValue:function(){
            for(var i=0;i<this.input.length;i++){
	        this.input[i].input.parentNode.classList.remove('selected');
                this.input[i].input.checked=false;
            }
	},
        setValue: function(name){  
            if(Apoco.checkType['string'](name)){
                for(var i=0;i<this.input.length;i++){
                    if(this.input[i].label === name){
                        this.input[i].input.click();
                        return;
                    }
                }
            }
            throw new Error("Buttonsetfield: setValue has no member called " + name);
        },
	deleteValue:function(label){
	    var that=this;
	    var index=null;
	    //console.log("remove value is " + value);
	    for(var i=0;i<this.input.length;i++){
		if(this.input[i].label === label){
		    index=i;
		    //console.log("found value " + value + " with index " + index);
		    break;
		}
	    }
	    if(index !== null){
		var p=this.input[index].input.parentNode;
                p.removeChild(this.input[index].input);
		this.input.splice(index,1);
                p.parentNode.removeChild(p);
	    }
	    else{
		throw new Error("could not remove value " + value);
	    }

	},
	getValue:function(){
            var ar=[],p;
            for(var i=0;i<this.input.length;i++){
                p={};
                p[this.input[i].label]=this.input[i].input.checked;
                ar[i]=p;
            }
	    return ar;
	},
	checkValue:function(){
	    if(this.required ){ // must have at least one value set to true.
                for(var i=0; i<this.input.length; i++){
                  //  console.log("checkbox value is " + this.value[i]);
                    if(this.input[i].input.checked === true){
                        return true;
                    }
                }
	    }
            else{
                return true;
            }
	    return false;
	}
    };
    Apoco.Utils.extend(ButtonSetField,_Field);

    var SliderField=function(d,element){
        d.field="SliderField";
        d.type="range";
        d.html_type="range";
      	_Field.call(this,d,element);
	this.popup=true;
	this.input= document.createElement("input");
        this.input.setAttribute("type",this.type);
        //this.input.className=this.type;
        this.element.appendChild(this.input);
	var that=this;
	if(this.min){
            this.input.setAttribute("min",this.min);
        }
        if(this.max){
             this.input.setAttribute("max",this.max);
        }
        if(this.step){
             this.input.setAttribute("step",this.step);
        }
        this.value=(this.value)?this.value: this.min;
        this.input.value=this.value;
        if(this.editable === false){
            this.input.readOnly=true;
        }
        if(this.action){
            this.action(this);
        }
        return this;
    };
     
    Apoco.Utils.extend(SliderField,_Field);

    var StringArrayField=function(d,element){
        d.field="StringArrayField";
        d.type="stringArray";
	_Field.call(this,d,element);
	this.popup=true;
	var that=this;
	var array_length=0;
        //this.element.className="stringArray";
	this.input=[];
        var dv=document.createElement("div");
        dv.className="list_container";
        this.element.appendChild(dv);
        var u=document.createElement("ul");
        u.className="string_fieldset";
        dv.appendChild(u);
	if(this.value && this.value.length>0){
	    array_length=this.value.length;
	}
	if(!this.length){
	    this.length=array_length;
	}
        this.length=Math.max(this.length,array_length);

	if(this.length === 0){
	    this.length=4;
	}

	//console.log("len of array is " + d.len);
	for(var i=0;i<this.length;i++){
	    this.addValue(i);
	}
	// this adds an extra field if you press return in last field
	if(this.editable !== false){

	    // add a glyph
            var sp=document.createElement("span");
            sp.classList.add("plus","ui-icon","ui-icon-plusthick");
            var p=this.element.getElementsByTagName("li")[(this.element.getElementsByTagName("li").length-1)];
            p.appendChild(sp);
            var sm=document.createElement("span");
            sm.classList.add("minus","ui-icon","ui-icon-minusthick");
            p.appendChild(sm);
            var addremove=function(add){
                var l=that.input.length,n;
                sp.parentNode.removeChild(sp);
                sm.parentNode.removeChild(sm);
                if(add=== "add"){
		    that.addValue(l);
                }
                else{
                    that.deleteValue(l-1);
                }
                n=parseInt(that.element.getElementsByTagName("li").length-1,10);
                var last_element=that.element.getElementsByTagName("li")[n];
		last_element.appendChild(sp);
                last_element.appendChild(sm);
            };
            
	    sp.addEventListener("click",function(e){
               // console.log("StringArrayField got click on plus");
		e.stopPropagation();
	        addremove("add");
	    });
	    sm.addEventListener("click",function(e){
		e.stopPropagation();
	        addremove("remove");
	    });

	}
        if(this.action){
            this.action(this);
        }
        return this;
    };
    
    StringArrayField.prototype={
        setValue:function(v,index){
            if(!Apoco.checkType["array"](v)){
                if( index !== undefined && index<this.length){
                    this.input[index].input.value=v;
                    this.value[index]=v;
                }
                else{
                    throw new Error("StringArrayField: setValue not an array");
                }
            } 
            else {
               if(v.length <= this.length){
                    for(var i=0;i<v.length;i++){
                        this.input[i].input.value=v[i];
                        this.value[i]=v[i];
                    }
               }
                else{
                    throw new Error("StringArrayField: setValue array is too long");
                } 
                
            }
        },
	getValue:function(){
	    var vals=[],t;
	    for(var i=0;i<this.input.length;i++){
		t=this.input[i].input.value;
		if(t !== ""){
		    vals.push(this.input[i].input.value);
		}
	    }
	    return vals;
	},
        deleteValue:function(i){
            var t;
            if(this.input.length>1){
                t=this.input[i].input.parentNode;
                this.input.splice(i,1);
                this.value.splice(i,1);
                t.parentNode.removeChild(t);
            }
        },
	addValue:function(i){
	    this.input[i]={};
	   // console.log("trying to add a string field");
            var element=document.createElement("li");
            element.className="string";
            this.input[i].input=document.createElement("input");
            if(this.required===true){
                this.input[i].input.required=true;
            }
            this.input[i].input.setAttribute("type","string");
            element.appendChild(this.input[i].input);
            this.element.getElementsByClassName("string_fieldset")[0].appendChild(element);
	    if(this.value[i]){
		this.input[i].input.value=this.value[i];
	    }
            if(this.editable === false){
                this.input[i].input.readOnly=true;
            }
	},
	checkValue:function(){
	    var valid;
	    (this.required)?valid=false: valid=true;
	    //console.log("string Array checkValue ");
	    var v=this.getValue();
	    for(var i=0;i<v.length;i++){
		//console.log("checking inputs " + i + " for stringArray");
		//console.log("got value " + v[i]);
		if(this.required){
		    if(!Apoco.checkType["blank"](v[i])){
			valid=true;   // at least one non blank value
		    }
		}
		if(!Apoco.checkType["string"](v[i])){  
		    valid=false;
		    break;
		}
	    }
	    //console.log("check field for string array returning valid = " + valid);
	    if(!valid){
		this.displayInvalid();
	    }
	    return valid;
	}
    };

    Apoco.Utils.extend(StringArrayField,_Field);


    var ImageArrayField =function(d,element){
        var that=this;
        var new_values=[];
        this.promises=[];
        d.field="ImageArrayField";
        d.type="imageArray";
	_Field.call(this,d,element);
	this.popup=true;
       
        this.width=this.width?this.width:120;
        this.height=this.height?this.height:90;
        if(!this.value){
            this.value=[];
        }
        if(this.editable !== false){
	    if(!window.FileReader){
	        Apoco.popup.dialog("Sorry No FileReader","Your browser does not support the image reader");
	        throw new Error("No FileReader");
	    }
            this.input=document.createElement("input");
            this.input.type="file";
            if(this.required===true){
                this.input.required=true;
            }
            this.input.setAttribute("name","files");
            this.input.setAttribute("multiple","multiple");
	    this.element.appendChild(this.input);
	    this.input.addEventListener("change",function(e){
                that._getImageFileSelect(e);
            });
        }
  
        if(this.value && this.value.length>0){  // start pre-loading
            this.loadImages();
        }
        if(this.thumbnails === true){ 
            this.mkThumbnails();
        }
        if(this.action){
            this.action(this);
        }
        return this;
    };

    ImageArrayField.prototype={
        _getImage: function(o){
            var that=this;
            var imm=document.createElement("img"); //new Image();  // get the width and height - need to load in to image
            imm.src=o.src;
	 //   console.log("getImage is here ");
            var promise=new Promise(function(resolve,reject){
	        imm.onload=function(){
	         //   console.log("getImage: +++++ reader onload got width " + this.width + " " + this.height);
                    o.width=parseFloat(this.width);
                    o.height=parseFloat(this.height);
                    o.title=o.name;
                    o.image=imm;
                    o.aspect_ratio=parseFloat(this.width/this.height);
                    resolve(o);
                };
                imm.onerror=function(){
                    o.image=null;
                 //   console.log("ERROR loading image");
                    reject("Field:ImageArray._getImage Could not load image " + o.src);
                };
            });
            return promise;
        }, 
        _getImageFileSelect: function(evt){
            var that=this;
            var td=this.element.querySelector("div.thumbnails");
   	    //new_values.length=0; // reset array
	    evt.stopPropagation();
	    var files = new Array; //evt.target.files;
	  //  console.log("got " + files.length + " number of files");
            //check that the files are images
            for(var i=0;i<evt.target.files.length;i++){
                if (evt.target.files[i].type.match('image.*')) {
                    files.push(evt.target.files[i]);
                }
            }
            var count=that.value.length;
	    var last=count+files.length;
          //  var promise=new Promise(function(resolve,reject){
	    for (var i=count,j=0; i<last; i++,j++) {
	     //   console.log("found file num " + i);
		var reader = new FileReader();
		reader.onload = (function(f,num) {
                    console.log("getImagefileselect  file is  %j",f);
		    return function(e) {
                        var p;
                     //   console.log("getImageFiles: that.value len is  " + that.value.length);
			e.stopPropagation();
	               // console.log("FileSelect: going to load " + f.name);
                       // console.log("FileSelect: last is " + last + " and count is " + count);
                        that.value[num]={src: e.target.result,name:f.name};
                      //  console.log("that.value is %j",that.value[num]);
                        that.promises[num]=that._getImage(that.value[num]);
                        if(that.thumbnails === true){
                         //   console.log("thumbnails is true");
                           // that.promises[num].then(function(v){
                            that._addThumbnail(td,num);
                           // });
                        }
                       // console.log("getImageFiles: that.value len is  " + that.value.length);
 		    };
		})(files[j],i);
		reader.readAsDataURL(files[j]);
	    }
  
           // });
	   // return promise;
        },
        loadImages: function(values){
            var i=0,last,that=this;
            if(values !==undefined && Apoco.checkType["array"](values)){ //loading more images after creation
                i=this.value.length;
             //   console.log("loadImages " + "starting at " + i);
                this.value=this.value.concat(values);
            }
            last=this.value.length;
    
            for(i; i<last;i++){
                this.promises[i]=that._getImage(that.value[i]);
            }
      
            return this.promises;
        },
        finishedLoading:function(){
            return Promise.all(this.promises); // rejects on first fail
        },
        _addThumbnail:function(pp,i){
            var that=this,div=document.createElement("div");
            if(this.value[i].name){
                div.setAttribute("name",this.value[i].name);
            }
            pp.appendChild(div);
            
            if(this.value[i].label){
                var r=document.createElement("h5");
                r.textContent=this.value[i].label;
                div.appendChild(r);
            }
            this.promises[i].then((function(el){
                return function(v){
                    if(!v.image){
                        throw new Error("mkThumbnails: image does not exist");
                    }
                    if(that.width){
                        v.image.style.width=(that.width.toString() + "px");
                    }
                    if(that.height){
                        v.image.style.height=(that.height.toString() + "px");
                    }
        	    el.appendChild(v.image); 
                    //that._addThumbnail(td,v);
                };
            }(div))); 
        },
        mkThumbnails: function(){
            var that=this,el;
	 //   console.log("mk_thumbnails got " + this.value.length + " number of files");
            var td=this.element.querySelector("div.thumbnails");
            if(!td){
           //     console.log("making a new image gallery");
                td=document.createElement("div");//"<div class='image_gallery'></div");
                td.className="thumbnails";
                this.element.appendChild(td);
	    }
	    for(var i=0;i<this.value.length;i++){ // each image
                that._addThumbnail(td,i);
            }
  	},
        _resetValue:function(){
            return;
        },
	getValue:function(){ // images are in this.value[i].image
	    return this.value;
	},
	checkValue:function(){
	    return true;
	},
        deleteValue:function(title){
            var index=-1;
            for(var i=0;i<this.value;i++){
                if(this.value[i].title == title){
                    index=i;
                    break;
                }
            }
            if(index > 0){
                this.value.splice(index,1);
            }
            if(this.thumbnails){
                this.mk_thumbnails();
            }
        }
    };

    Apoco.Utils.extend(ImageArrayField,_Field);

    var AutoCompleteField=function(d,element){
        var v,rect,offset={};
        var box,that=this;
        var contains=function(arr,item){
            var count=0,a,n=[];
            // make it case insensitive
            item=item.toLowerCase();
            for(var i=0;i<arr.length;i++){
                a=arr[i].toLowerCase();
           //     console.log("arr " + a + " item " + item);
                if((a).indexOf(item) !== -1){
                 //   console.log("Found one");
                    n[count]=arr[i];
                    count++;
                }
                if(count ===4){
                    return n;
                }
            }
            return n;
        };
        function getOffset (object, offset) {
            if (!object){
                return;
            }
            offset.x += object.offsetLeft;
            offset.y += object.offsetTop;
            getOffset (object.offsetParent, offset);
        }

        d.field="AutoCompleteField";
        d.type="string";

        _Field.call(this,d,element);
        box=document.createElement("div");
        box.classList.add(this.type,"apoco_autocomplete");
        this.element.appendChild(box);
        this.input=document.createElement("input");
        if(this.required===true){
            this.input.required=true;
        }
        this.input.setAttribute("type",this.html_type);
        //this.input.className=this.type;
        box.appendChild(this.input);  
        //sort the options
        Apoco.sort(this.options,"string");
       // for(var i=0;i<this.options.length;i++){
       //     console.log("sort to " + this.options[i]);
      //  }
      
        var select=document.createElement("ul");
        select.classList.add("choice","ui-autocomplete","ui-menu","ui-front","ui-widget-content");
        select.style.visibility="hidden";
        select.addEventListener("click",function(e){
            if(e.target.tagName === "LI"){
                e.stopPropagation();
                e.preventDefault();
               // console.log("clicked " + e.target.textContent);
                that.input.value=e.target.textContent;
                select.style.visibility="hidden";
                //console.log("setting select to hidden");
            }
        });
        select.addEventListener("mouseover",function(e){
            if(e.target.tagName === "LI"){
                e.stopPropagation();
                e.preventDefault();
                e.target.classList.add("ui-state-hover");
            }
        });
        
        select.addEventListener("mouseout",function(e){
            if(e.target.tagName === "LI"){
                e.stopPropagation();
                e.preventDefault();
                e.target.classList.remove("ui-state-hover");
            }
        });
        
        box.appendChild(select);
        var options=[];
        for(var i=0;i<4;i++){
            options[i]=document.createElement("li");
            select.appendChild(options[i]);
        }

        this.input.addEventListener("keyup",function(e){
            var r;
            e.stopPropagation();
            //  var v=e.currentTarget.value;
            v=that.input.value;
            offset={x:0,y:0};
            rect=that.input.getBoundingClientRect();
            //select.style.left = e.clientX + 'px';
            //select.style.top = e.clientY +  'px';
            getOffset(select,offset);
            //  console.log("console getOffset " + offset.x + " " + offset.y);
            select.style.top=((rect.bottom+window.scrollY - offset.y).toString() + "px"); //pos[0];
            select.style.left=((rect.left+window.scrollX - offset.x).toString() + "px"); //pos[1];
            // console.log("rect left " + rect.left + " bottom " + rect.bottom);
            // console.log("rect right " + rect.right + " top " + rect.top);
            // console.log("scroll is "+ window.scrollX  + " " + window.scrollY);
            //  console.log("keypress is here with value " + v);
            //console.log("this options length is " + that.options.length);
            //console.log("keyup setting visibility to hidden");
            select.style.visibility="hidden";
            r=contains(that.options,v);
            for(var i=0;i<r.length;i++){
                options[i].textContent=r[i];
            }
            //console.log("keyup setting visibility to visible");
            select.style.visibility="visible";
            this.value=v;
        });
        if(this.action){
            this.action(this);
        }
        return this;
    };

    AutoCompleteField.prototype={
        popupEditor: null
    };

    Apoco.Utils.extend(AutoCompleteField,_Field);

    Apoco.field={
        exists:function(field){
            if(this[field]){
                return true;
            }
            return false;
        },
        input:function(options,element){return new InputField(options,element);},
        inputMethods:function(){var n=[]; for(var k in InputField.prototype){  n.push(k);} return n;},
        float:function(options,element){return new FloatField(options,element);},
        floatMethods:function(){var n=[]; for(var k in FloatField.prototype){ n.push(k);} return n;},
        date:function(options,element){return new DateField(options,element);},
        dateMethods:function(){var n=[]; for(var k in DateField.prototype){  n.push(k);} return n;},
        time:function(options,element){return new TimeField(options,element);},
        timeMethods:function(){var n=[]; for(var k in TimeField.prototype){ n.push(k);} return n;},
	numberArray:function(options,element){return new  NumberArrayField(options,element);},
        numberArrayMethods:function(){var n=[]; for(var k in NumberArrayField.prototype){ n.push(k);} return n;},
	textArea:function(options,element){ return new  TextAreaField(options,element);},
        textAreaMethods:function(){var n=[]; for(var k in TextAreaField.prototype){ n.push(k);} return n;},
	select:function(options,element){ return new  SelectField(options,element);},
        selectMethods:function(){var n=[]; for(var k in SelectField.prototype){ n.push(k);} return n;},
	checkBox: function(options,element){return new CheckBoxField(options,element);},
        checkBoxMethods:function(){var n=[]; for(var k in CheckBoxField.prototype){ n.push(k);} return n;},
        slider:function(options,element){ return new  SliderField(options,element);},
        sliderMethods:function(){var n=[]; for(var k in SliderField.prototype){ n.push(k);} return n;},
	buttonSet:function(options,element){ return new  ButtonSetField(options,element);},
        buttonSetMethods:function(){var n=[]; for(var k in ButtonSetField.prototype){ n.push(k);} return n;},
	stringArray:function(options,element){ return new  StringArrayField(options,element);},
        stringArrayMethods:function(){var n=[]; for(var k in StringArrayField.prototype){ n.push(k);} return n;},
        imageArray:function(options,element){ return new  ImageArrayField(options,element);},
        imageArrayMethods:function(){var n=[]; for(var k in ImageArrayField.prototype){ n.push(k);} return n;},
	autoComplete: function(options,element){ return new AutoCompleteField(options,element);},
        autoCompleteMethods:function(){var n=[]; for(var k in AutoCompleteField.prototype){ n.push(k);} return n;}
    };

    


    
})();
