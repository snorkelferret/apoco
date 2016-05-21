var Harvey=require('./declare').Harvey,UI=require('./declare'); //UI,jQuery=require('jquery');
require('./Utils');
require('./Types');


// editable: true by default
// required: false by default

;(function($){
    "use strict";

    Harvey.dbToHtml={
	integer:{html_type: "number", field: "InputField",check: "integer",sort:"integer"},
	positiveInteger: {html_type:"number", field: "InputField",check:"positiveInteger",sort:"positiveInteger"},
	negativeInteger:{html_type:"number", field: "InputField",check:"negativeInteger",sort:"negativeInteger" },
	date: {html_type:"date", field: "DateField",check:"date",sort:"date"},
	time: {html_type:"time",field: "TimeField",check:"time",sort: "time"},
	string: {html_type: "text", field: "InputField",check:"string",sort: "string"},
	token: {html_type:"text", field: "InputField",check:"token",sort: "token"},
	alphaNum: {html_type:"text", field: "InputField",check:"alphaNum",sort:"alphaNum" },
	image: {html_type:"file", field: "InputField",check:"image",sort: null},
	currency: {html_type:"number", field: "InputField",check:"currency",sort: "currency"},
	email: {html_type:"email", field: "InputField",check:"email",sort:"email"},
	float: {html_type:"number", field: "FloatField",check:"float",sort:"float"},
	integerArray: {html_type:"number", field: "NumberArrayField",check:"integerArray",sort: null},
	phoneNumber: {html_type:"tel", field: "InputField",check:"phoneNumber",sort:null},
	floatArray: {html_type:"number", field: "NumberArrayField",check:"floatArray",sort: null},
	boolean: {html_type: "checkbox",field: "CheckBoxField",check:"boolean",sort:"boolean"},
	text: { html_type:"text",field: "TextAreaField",check:"text",sort:null},
	stringArray: {html_type: "text",field: "StringArrayField",check:null,sort: null},
	imageArray: {html_type: "image", field: "ImageArrayField",check:null,sort: null},
	password: {html_type: "password", field:"InputField", check: "string",sort: null},
        range:{html_type:"range",field: "SliderField",check: "number",sort:null}
    };

/*  Harvey.HtmlToType=function(field){
 	for(var k in  Harvey.dbToHtml){
	    if(Harvey.dbToHtml[k].field == field){
		return Harvey.dbToHtml[k].html_type;
	    }
	}
	return "";
    };
*/


    var _Field=function(d,element){

        if(!d.name){
            throw new Error("Harvey.field: Field must have a name");
        }

        if(!d.type){
            throw new Error("Harvey.field: must have a type");
	}
        $.extend(this,d);
	this.html_type=Harvey.dbToHtml[this.type].html_type;

        if(element === undefined){
            this.element=document.createElement("div");
        }
	else if(element instanceof jQuery){
            if(element.length === 0){
	        throw new Error("external element for field is null");
	    }
            this.element=element[0];
        }
	else {
            this.element=element;
        }
   
	this.element.setAttribute("name",this.name);

	if(this.label){
            var l=document.createElement("label");
            l.appendChild(document.createTextNode(this.label));
            l.setAttribute("for",this.name);
	    this.element.appendChild(l);
	}
        
	if(this.publish !== undefined){
	    Harvey.IO.publish(this);
	}
	if(this.listen !== undefined){
	    //console.log("field adding listener " + this.name);
	    Harvey.IO.listen(this);
	}
	if(this.action){
	    this.element.addEventListener("click", (function(that){
		return function(e){
                    e.stopPropagation();
                    that.action(that);
                };
	    })(this),false);
	}

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
	},
        delete:function(){
            // remove all the nodes
            while (this.element.lastChild) {
                this.element.removeChild(this.element.lastChild);
            }
            this.element.parentNode.removeChild(this.element);
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

		this.input.keypress(cb);

	    //this.input.blur(func(this.input.val()));
	    }
	    else{
		throw new Error("no input element for this type " + this.type);
	    }
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
	    //this.resetInvalid();
	    var v=this.getValue();
            if(Harvey.checkType["blank"](v)){
   	        if(this.required){
                    return false;
                }
            }
            if(this.type){
                var check=Harvey.dbToHtml[this.type].check;
                if(!Harvey.checkType[check](v)){
                    return false;
                }
                this.input.classList.remove("required");
                return true;
	    }
	    return true;
	}
    };

    var _mkStatic={
        float: function(that){
            var val,p=[];
            if(that.value){
                val=parseFloat(that.value).toFixed(this.precision);
	        p=val.toString().split("."); // align to decimal point
            }
            else{
                p[0]="";
                p[1]="";
            }
	    //	this.element.empty();
	    //this.element.append("<span class='float_left'>" + p[0] + "</span>");
            var s=document.createElement("span");
            s.textContent=p[0];
            s.className="float_left";
            //s=$(s);
            that.element.appendChild(s);
	    if (p.length >= 2){
                s=document.createElement("span");
                s.className="float_right";
                s.textContent=("." + p[1]);
                //s=$(s);
                that.element.appendChild(s);
		//this.element.append("<span class='float_right'> ." + p[1] + "</span>");
	    }
	    else{
                s=document.createElement("span");
                s.className="float_right";
                s.textContent=(",00");
		that.element.appendChild(s);
	    }
	    p.length=0;

        },
        integerArray:function(that){
            var r,s,len=that.value.length;

	    for(var i=0;i<len;i++){
               // console.log("i is " + i);
                //   this.input[i]=$("<input class='" + this.type + "' type='" + this.html_type + "'/>");
                r=document.createElement("span");
                r.setAttribute("type", that.html_type);
                r.className=that.type;

                if( that.delimiter !== undefined){
                    if(i>0 && i<len){
                        s=document.createElement("span");
                        s.textContent=that.delimiter;
                        that.element.appendChild(s);
                    }
                }
                that.element.appendChild(r);
            }
        }
    };
    var _setStatic={
        float: function(that){
            var p=parseFloat(that.value).toFixed(that.precision).toString().split(".");
            that.element.getElementsByClassName("float_left")[0].textContent=p[0];
            //that.element.find("span.float_left").html(p[0]);
            if (p.length >= 2){
                //that.element.find("span.float_left").html(p[1]);
                 that.element.getElemenstByClassName("float_rigbt")[0].textContent=p[1];
	    }
	    else{
	        //that.element.find("span.float_left").html(".00");
                that.element.getElementsByClassName("float_right")[0].textContent=".00";
	    }
        },
        integerArray:function(that){
            var len=that.value;
            //var el=that.element.find(("."+that.type));
            var el=that.element.getElemenstByClassName(that.type);
            for(var i=0;i<len;i++){
                //el[i].text(that.value[i]);
                el[i].textContent=that.value[i];
            }
        }
    };

    var StaticField=function(d,element){
	//console.log("static field is here");
        // var settings=checkDefaultOptions("StaticField",d);
        d.field="StaticField";
        if(d.type===undefined){
            d.type="string";
        }
	_Field.call(this,d,element);
   
        if(_mkStatic[this.type]){
            //console.log("got a method for " + this.type);
            _mkStatic[this.type](this);
        }
        else{
            if(this.value !== null){
                this.element.textContent=this.value;
            }
        }
    };


    StaticField.prototype={
	getValue: function(){
	    return this.value;
	},
        getElement:function(){
            return this.element;
        },
	setValue: function(val){
	    this.value=val;
            if(this.value !== null){
                if( _setStatic[this.type]){
                    _setStatic[this.type](this);
	        }
                else{
		    this.element.textContent=val;
	        }
            }
	},
        checkValue: function(){
           return Harvey.checkType[this.type](this.value);
           // return true;
        },
	popupEditor: null

    };
 

    var InputField=function(d,element){
	//console.log("INPUT FIELD IS HERE with required " + d.required);
       // var settings=checkDefaultOptions("InputField",d);
        d.field="InputField";
	_Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);

        s.className=this.type;

        //this.input=$(s);
        this.input=s;
        //this.input=$("<input class='" + this.type + "' type= '" + this.html_type +  "'/>");

        if(this.min){
            //this.input.prop("min", this.min);
            this.input.setAttribute("min",this.min);
        }
        if(this.max){
            //this.input.prop("max", this.max);
            this.input.setAttribute("min",this.max);
        }
        if(this.step){
            this.input.setAttribute("step",this.step);
           // this.input.prop("step", this.step);
        }
        if(this.precision){
            //this.input.prop("pattern", "^[-+]?\d*\.?\/" + this.precision + "*$");
            this.input.setAttribute("pattern", "^[-+]?\d*\.?\/" + this.precision + "*$");
        }

        if(this.required && !this.value ){
          //  console.log("REQUIRED is TRUE, value is " + this.required);
            if(this.field !== "CheckBoxField"){
                //  this.input.prop("required",true);
                this.input.setAttribute("required","required");
               // this.input.className="required";
              //  this.input.addClass("required");
            }
        }

        //this.element.append(this.input);
        this.element.appendChild(this.input);
	if(this.value !== null && this.value !== undefined){
	    // this.input.val(this.value);
            this.input.value=this.value;
	}
	return this;

    };

    Harvey.Utils.extend(InputField,_Field);


    var FloatField=function(d,element){
        var inp;
	//console.log("FLOAT FIELD IS HERE");
        //var settings=checkDefaultOptions("FloatField",d);
        d.field="FloatField";
        d.type="float";
	_Field.call(this,d,element);

	this.input=new Array(2);
	var that=this;
//	this.element.empty();
        this.element.classList.add("float");

	var list=document.createElement("ul"); //" class='aligned_float'></ul>");
        list.className='aligned_float';
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
	        if(!Harvey.checkType.float(t)){
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

	    var dispatch_change=function(){
	        //if(!that.input[0]) console.log("No input[0]");
	        var e=new Event("change");
	        //that.element[0].dispatchEvent(e);
                that.element.dispatchEvent(e);
	    };

	    var eObj={
	        mouseover: function(e) {
                    e.stopPropagation();
		    e.target.classList.add('ui-state-hover');
	        },
	        mouseout: function(e) {
                    e.stopPropagation();
		    e.target.classList.remove('ui-state-hover');
	        },
                click:function(e){
                    e.preventDefault();
		    e.stopPropagation();
		    if(e.target === down){
		       step_fn("down");
		    }
		    else{
		        step_fn("up");
		    }
                },
	        mousedown: function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    if(e.target === down){
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
		    dispatch_change();
	        }
	    };
            for(var k in eObj){
                up.addEventListener(k,eObj[k],false);
                down.addEventListener(k,eObj[k],false);
            }
	   	    
        };
	this.element.appendChild(list);

	return this;
    };


    FloatField.prototype={
	getValue: function(){
	   // var a=this.input[0].val();
	    //var b=this.input[1].val();
            var a=this.input[0].value;
            var b=this.input[1].value;
	    if(Harvey.checkType.blank(a)) {
		//console.log("input integer is null");
		if(Harvey.checkType.blank(b)){
		    return this.value="";
		}
		else{
		    this.value=parseFloat(("0."+b),10).toFixed(this.precision);
		}
	    }
	    else if(Harvey.checkType.blank(b)){
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
	    if(!Harvey.checkType.float(this.value)){
		throw new Error("getValue: this is not a floating point number " + this.value);
		return null;
	    }
	    return this.value;

	},
	setValue: function(v){
           // console.log("float setValue " + v);
	    if(Harvey.checkType.blank(v)){
		//this.input[0].val("");
		//this.input[1].val("");
                this.input[0].value="";
                this.input[1].value="";
		this.value="";
		return;
	    }
            if(!Harvey.checkType["float"](v)){
		throw new Error("FloatField: setValue this value is not a float " + v);
	    }
	    v=parseFloat(v,10).toFixed(this.precision);  // not necessarily a number
	    var p=v.toString().split(".");
	    if(p.length !== 2){
		throw new Error("value is not a floating point number" + v);
		return null;
	    }
            //console.log("setValue: value is " + p[0]);	  
//	    this.input[0].val(p[0]);
            //	    this.input[1].val(p[1]);
            this.input[0].value=p[0];
            this.input[1].value=p[1];
	    this.value=v;
	},
        popupEditor: null
    };

    Harvey.Utils.extend(FloatField,_Field);


    var DateField=function(d,element){
        var that=this;
        d.field="DateEield";
        d.type="date";
        _Field.call(this,d,element);
        var s=document.createElement("input");
        s.type=this.html_type;
        
        s.className=this.type;
        this.input=s;
        this.element.appendChild(s);
	if(this.editable !== false){
            //<datepicker type="grid" value="2007-03-26"/>
            this.picker=document.createElement("datepicker");
            this.picker.setAttribute("type","grid");
            this.picker.value="20150623";
            this.input.appendChild(this.picker);
        }
            
        if(this.value){
            
                this.input.value=this.value;
	       // $(this.input).datepicker("setDate",this.value);
        }
           // else{
              //  $(this.input).datepicker();
           // }
	    var that=this;
	    //$(this.input).datepicker('option','onSelect',function(date,object_inst){ that.value=date;}); // not tested
	
	return this;
    };
  
    Harvey.Utils.extend(DateField,_Field);

    var TimeField=function(d,element){
        d.field="TimeField";
        d.type="time";

	_Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        s.className=this.type;
        this.input=s;
        this.element.appendChild(this.input);
    };

    Harvey.Utils.extend(TimeField,_Field);

    var CheckBoxField=function(d,element){
        d.field="CheckBoxField";
        d.type="boolean";
  	_Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        s.className=this.type;
        this.input=s;
        this.element.appendChild(this.input);
	//console.log("checkbox value is " + d.value);
        this.setValue(this.value);
        if(this.editable === false){
            this.input.setAttribute("disabled",true);
        }
	return this;
    };



    CheckBoxField.prototype={
	getValue:function(){
	    console.log("value of checkbox is " + this.input.value + " and prop is " + this.input.getAttribute('checked') + " value is " + this.value);
	    console.log("this input.checked is " + this.input.checked);
            // return this.input.prop('checked');
            return this.input.checked;
	},
        setValue:function(val){
            
            if(val === "true" || val === true || val === 1){
	        console.log("setting checkbox value to true");
	        // this.input.prop("checked",true);
                this.input.setAttribute("checked","checked");
	        //this.input.val(true);
                //this.input.value="true";
                //this.value=true;
	    }
	    else {
	        console.log("setting checkbox value to false");
                if(this.input.hasAttribute("checked")){
                    this.input.removeAttribute("checked");
                }
	        // this.input.val(false);
                //this.input.value="false";
	        //this.input.prop("checked",false);
          //      this.input.setAttribute("checked","");
                //this.value=false;
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

    Harvey.Utils.extend(CheckBoxField,_Field);


    var NumberArrayField=function(d,element){
        if(!d.size && !d.value ){
            throw new Error("NumberArrayfield needs a size or value");
        }
        d.field="NumberArrayField";
	_Field.call(this,d,element);
        if(!this.size){
            this.size=this.value.length;
        }
	this.input=new Array(this.size);

	this.popup=true;

        if(this.type === "floatArray" && this.step === undefined){
            this.step=0.1;
        }

	if(this.value && !Harvey.checkType.array(this.value)){
	    throw new Error("NumberArrayField: value is not an array");
	}
	for(var i=0;i<this.input.length;i++){
            this.input[i]={};
            if(this.value){
	        this.input[i].value=(this.value[i] || "");
            }
            this.addValue(i,"internal");
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
            if( this.delimiter !== undefined){
                if(i>0 && i<(this.input.length-1)){
                    s=document.createElement("span");
                    s.textContent=this.delimiter;
                    this.element[0].appendChild(s);
                }
            }

            if(this.min){
                this.input[i].input.setAttribute("min", this.min);
            }
            if(this.max){
                this.input[i].input.setAttribute("max", this.max);
            }
            if(this.step){
                this.input[i].input.setAttribute("step", this.step);
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
                    this.input[i].input.value=v[i];
                }
                else{
                    this.input[i].input.value="";
                }
	    }
	},
	getValue:function(index){
            if(index !== undefined && index< this.input.length){
                return this.input[index].value;
            }
            var v=new Array;
            for(var i=0;i<this.input.length;i++){
	        v[i]=this.input[i].value;
            }
            return v;
	},
	popupEditor:function(func){
	    if(this.input.length>0){
		var r=this.getValue();
		$(this.element).keypress(function(event){
		    event.stopPropagation();
		    if(event.which === 13){
			//var v=this.input.val();
			//console.log("got value " + this.input.val());
			func(r);
		    }
		});
	    }
	    throw new Error("no input element for this type " + this.type);
	}
    };

    Harvey.Utils.extend(NumberArrayField,_Field);

    var TextAreaField=function(d,element){
        //var settings=checkDefaultOptions("TextAreaField",d);
        d.field="TextAreaField";
        d.type="text";
	_Field.call(this,d,element);
	this.popup=true;
	//this.input=$("<textarea ></textarea>");
        this.input=document.createElement("textarea");
	this.element.appendChild(this.input);

	if(this.value){
	    //this.input.val(this.value);
            this.input.value=this.value;
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
		ok.on("click",cb);
		cancel.on("click",bb);
	    }
	    else{
		throw new Error("no input element for this type " + this.type);
	    }
	}
    };

    Harvey.Utils.extend(TextAreaField,_Field);


    var SelectField=function(d,element){
	var i,o;
      //  var settings=checkDefaultOptions("SelectField",d);
        d.field="SelectField";
        d.type="string";
	_Field.call(this,d,element);

	//var options="<select>";
        var options=document.createElement("select");
	for(i=0; i<this.options.length; i++){
	    if(i===0 && this.blank_option !== undefined && this.blank_option === true){ // add a blank option at the head of the list
		//options=options.concat("<option value=\"\"></option>");
                o=document.createElement("option");
                o.value="";
                options.appendChild(o);
	    }
            o=document.createElement("option");
            o.value=this.options[i];
            o.textContent=this.options[i];
            options.appendChild(o);
	    //options=options.concat("<option value='" + this.options[i] + "'>" + this.options[i] + "</option>");
	}
	//options=options.concat("</select>");
        //this.select=$(options);
        this.select=options;
	var cd=function(that){
		return function(e){
		    e.stopPropagation();
		    if(that.input.style.visibility === "visible"){ //}("visible")){
			that.input.style.visibility= "hidden"; //hide();
			//that.span.hide();
                        that.span.style.visibility="hidden";
			//that.element.show();
                        that.element.style.visibility="visible";
		    }
		};
	}(this);


        var mk_input=function(){
	    //this.input=$("<input class='" + this.type + "' type= '" + this.html_type + "'/>").css('display','none');
	   // this.span=$("<span class='ui-icon ui-icon-triangle-1-s'>").css('display','none');
	    //this.element.append(this.input);
	   // this.element.append(this.span);
	    // this.span.on("click",cd);
            this.input=document.createElement("input");
            this.input.className=this.type;
            this.input.setAttribute("type",this.html_type);
            this.input.style.visibility="hidden";
            this.span=document.createElement("span");
            this.span.classList.add("ui-icon","ui-icon-triangle-1-s");
            this.span.style.visibility="hidden";
            this.element.appendChild(this.input);
            this.element.appendChild(this.span);
            this.span.addEventListener("click",cd);
            
        };
        

        var that=this;
	// if selection option is "Other" add a new input field
        //	this.select.change(function(){
        this.select.addEventListener("change",function(){
	    //console.log("select option has changed");
	  //  if (that.select.val() === "Other"){
            if(that.select.value === "Other"){      
		if(!this.input){ // || this.input.length === 0){
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
	    // this.select.val(this.value);
            this.select.value=this.value;
	}

	//this.element.append(this.select);
        this.element.appendChild(this.select);
	return this;

    };


    SelectField.prototype={
        setValue: function(v){
            for(var i=0;i<this.options.length;i++){
                if(this.options[i] == v){
                 //   this.select.val(v);
                    this.select.value=v;
                    return;
                }
            }
            if(this.input){
                // this.input.val(v);
                this.input.value=v;
                return;
            }
            throw new Error("SelectField: Cannot set value to " + v + " options are " + this.options[0] + " " +  this.options[1] + " " + this.options[2] );
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

   Harvey.Utils.extend(SelectField,_Field);

    var ButtonSetField=function(d,element){   // like select field - but not in a dropdown and not editable
        //var settings=checkDefaultOptions("RadioButtonSetField",d);
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
        
	//var u=$("<ul class='choice'></ul>"); // add the selection list
        var u=document.createElement("ul");
        u.className="choice";
	this.element.appendChild(u);
	for(var i=0;i<this.input.length;i++){
	    //console.log("adding label " + this.labels[i]);
	    this.addValue(i);
	};
	return this;
    };

    ButtonSetField.prototype={
	addValue:function(index){
            if(index === undefined){
                throw new Error("ButtonSetField: must supply a name");
            }
            if(!Harvey.checkType["integer"](index)){
                var label=index;
                index=this.input.length;
                this.input[index]={};
                this.input[index].label=label;
            }
	    //var l=$("<li>" + label + "</li>");
            var l=document.createElement("li");
            l.textContent=this.input[index].label;
	    
	    this.element.getElementsByTagName('ul')[0].appendChild(l);

	    //console.log("buttonSet adding field " + p + " label " + this.labels[p]);
            this.input[index].input=document.createElement("input");
            if(this.checkbox === true ){
                //this.input[p]=$("<input type='checkbox' >");
                this.input[index].input.type="checkbox"; //setAttribute("type","checkbox");
            }
            else{
	        //this.input[p]=$("<input type='radio' >");
                this.input[index].input.type="radio"; //setAttribute("type","radio"); 
            }
            
	    l.appendChild(this.input[index].input);

            if(this.checkbox !== true){
	        this.input[index].input.addEventListener("click",function(that,node){
		    return function(e){
		        e.stopPropagation();
                        console.log("click for " + node.parentNode.text);
                        console.log("current checked is " + node.checked);
                        /*  if(node.checked === true && val !== "true" ){
                         console.log("==================checked is true - setting val to true");
                         val = "true";
                         }
                         else {
                         console.log("================checked is false - setting val to false");
                         val = "false"; //node.checked;
                         } 
                         */
                        //  if(node.checked !== val){
                        //      val=node.checked;
                        // }
                        
                       
                        console.log("radio buttons");
                        for(var i=0;i<that.input.length;i++){
                            if(that.input[i].input !== node){
                                console.log("setting checked for  " + that.input[i].input.parentNode.text);
                                console.log("from  " + that.input[i].checked + " to false ");
                                that.input[i].input.checked=false;
                                // that.value[i]="false";
                            }
                            //else{
                            //     that.value[i]="true";
                            // }
                        }
		    };
	        }(this,this.input[index].input)); 
            }
	},
	reset:function(){
            for(var i=0;i<this.input.length;i++){
	        this.input[i].input.parentNode.classList.remove('selected');
                this.input[i].input.checked=false;
            }
	},
        setValue: function(name){  
            if(Harvey.checkType['string'](name)){
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
		//this.input[index].remove();
		this.input.splice(index,1);
		//p.remove();
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
    Harvey.Utils.extend(ButtonSetField,_Field);

    var SliderField=function(d,element){
        //var settings=checkDefaultOptions("SliderField",d);
        d.field="SliderField";
        d.type="range";
        d.html_type="range";
      	_Field.call(this,d,element);
	this.popup=true;
	this.input= document.createElement("input");
        this.input.setAttribute("type",this.type);
        this.input.className=this.type;
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
    };
     
    Harvey.Utils.extend(SliderField,_Field);

    var StringArrayField=function(d,element){
        //var settings=checkDefaultOptions("StringArrayField",d);
        d.field="StringArrayField";
        d.type="stringArray";
	_Field.call(this,d,element);
	this.popup=true;
	var that=this;
	var array_length=0;
	//this.element.addClass("stringArray");
        this.element.className="stringArray";
	this.input=[];
	//var dv=$("<div class='list_container'></div>");
        var dv=document.createElement("div");
        dv.className="list_container";
	//this.element.append(dv);
        this.element.appendChild(dv);
        var u=document.createElement("ul");
	//dv.append($("<ul class='fieldset'></ul>"));
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
	    //this.element.find('li').last().append("<span class='plus ui-icon ui-icon-plusthick stringArray_plus' style='float: right; margin-left: 5px; border: 1px solid #000'></span>");
            //this.element.find('li').last().append("<span class='minus ui-icon ui-icon-minusthick stringArray_minus' style='float: right; margin-left: 5px; border: 1px solid #000'></span>");
            var addremove=function(add){
                var l=that.input.length,n;
	       // var sp=that.element.find('li').last().find('span');
                //sp.detach();
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
		//var last_element=that.element.find('li').last();
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
    };
    
    StringArrayField.prototype={
        setValue:function(v,index){
            if(!Harvey.checkType["array"](v)){
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
                //this.input[i].input.parent().remove();
                t=this.input[i].input.parentNode;
                this.input.splice(i,1);
                this.value.splice(i,1);
                t.parentNode.removeChild(t);
            }
           // else{
             //   Harvey.popup.alert("StringArrayField: Cannot remove the last value");
            //}
        },
	addValue:function(i){
	    this.input[i]={};
	   // console.log("trying to add a string field");
	    // var element=$("<li type='string' class='string'></li>");
            var element=document.createElement("li");
            element.className="string";
           // element.setAttribute("type","string");
            // this.input[i].input=$("<input type='string'>");
            this.input[i].input=document.createElement("input");
            this.input[i].input.setAttribute("type","string");
	    //element.append(this.input[i].input);
            element.appendChild(this.input[i].input);
            //this.element.find(".string_fieldset").append(element);
            this.element.getElementsByClassName("string_fieldset")[0].appendChild(element);
	    if(this.value[i]){
		this.input[i].input.value=this.value[i];
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
		    if(!Harvey.checkType["blank"](v[i])){
			valid=true;   // at least one non blank value
		    }
		}
		if(!Harvey.checkType["string"](v[i])){   //this.inputs[i].checkValue()){
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

    Harvey.Utils.extend(StringArrayField,_Field);

    var ImageArrayField=function(d,element){
        var that=this;
        var promise,new_values=[];
        //var settings=checkDefaultOptions("ImageArrayField",d);
        d.field="ImageArrayField";
        d.type="imageArray";
	_Field.call(this,d,element);
	this.popup=true;
        this.width=this.width?this.width:100;
        this.height=this.height?this.height:100;

       // this.thumbnails=true;
        if(!this.value){
            this.value=[];
        }
        if(this.editable !== false){
	    if(!window.FileReader){
	        Harvey.popup.dialog("Sorry No FileReader","Your browser does not support the image reader");
	        throw new Error("No FileReader");
	    }
            // this.input=$("<input type='file' id='files' size='6' name='files[]' multiple />");
            this.input=document.createElement("input");
            this.input.setAttribute("type","file");
            this.input.setAttribute("name","files");
            this.input.setAttribute("multiple","multiple");
	    this.element.appendChild(this.input);
	    this.input.addEventListener("change",function(){
                return function (e){
	            //Harvey.popup.alert("Uploading Files in progress");
	            promise=that._getImageFileSelect(e,new_values);
                    promise.fail(function(){
                        throw new Error("Could not get images to upload");
                    });
	            promise.done(function(){
		        // Harvey.display.alert("Uploading done");
                        //                  console.log("Upload got " + new_values.length + " files");
                        //for(var i=0;i<new_values.length;i++){
                        that.value=that.value.concat(new_values);
                        //                                console.log("got new values " + that.value.length);
		        if(that.thumbnails){
    //                                  console.log("going to make thumbnails");
		            that.mkThumbnails();
		        }
	            });
                };
	    }(new_values));
        }

        if(this.value && this.value.length>0){  // start pre-loading
            promise=this.loadImages(this.value);
            if(this.thumbnails){
                promise.done( this.mkThumbnails());
            }
        }

    };



    ImageArrayField.prototype={
        _getImage: function(o,last,promise){
            var that=this;
            var imm=new Image();  // get the width and height - need to load in to image
	    imm.src=o.src; //e.target.result;
            console.log("getImage last is " + last);
            console.log("getImages");

	    imm.onload=function(){
	//	console.log("+++++ reader onload got width " + this.width + " " + this.height + " count " + that.count);
                o.width=this.width;
                o.height=this.height;
                o.title=o.name;
                o.aspect_ratio=this.width/this.height;
                if(last === that.count){
                    promise.resolve();
                }
                that.count++;
            };
         },
        _getImageFileSelect: function(evt,new_values){
            var that=this;
            var promise=$.Deferred();
	    new_values.length=0; // reset array
	    evt.stopPropagation();
	    var files = evt.target.files;
	    //  console.log("got " + files.length + " number of files");
	    var last=files.length;
	    var count=0,finished=false;
	    for (var i=0; i<files.length; i++) {
		//console.log("found file num " + i);
		if (!files[i].type.match('image.*')) {
		    last--;
		    continue;
		}
		var reader = new FileReader();
		reader.onload = (function(f,last,new_values) {
		    return function(e) {
			e.stopPropagation();
	//	        console.log(" reader got file " + JSON.stringify(e.target));
	//	        console.log("goind to load " + f.name);
        //                console.log("last is " + last + " and count is " + count);
                        if(count=== (last-1)){
        //                    console.log("finished true");
                            finished=true;
	                }
                        new_values[count]={src: e.target.result,name:f.name};
                        that._getImage(new_values[count],finished,promise);
        //                console.log("getImageFiles: new values has " + new_values.length);
			count++;
		    };
		})(files[i],last,new_values);
		reader.readAsDataURL(files[i]);
	    }
	    return promise;

        },
        loadImages: function(){
            var deferred=$.Deferred();
            var last=(this.value.length-1);
            this.count=0;
            for(var i=0;i<this.value.length;i++){
                this._getImage(this.value[i],last,deferred);
            }
            return deferred;
        },
        mkThumbnails: function(){
            var that=this;
	  //  console.log("mk_thumbnails got " + this.value.length + " number of files");
            var td=this.element(".image_gallery");

            if (td.length > 0){
		td.empty();
		if(td.hasClass("ui-selectable")){
		    td.selectable("destroy");
		}
	    }
	    else{
                td=$("<div class='image_gallery'></div");
	//	throw new Error("image gallery is null");
	    }
	    $(this.element).append(td);

	    var cb=function(e,s){
		for(var i=0;i<this.selected.length; i++){
	//	    console.log("got selected " + this.selected[i]);
                    for(var j=0;j<this.value.length;j++){
                        if(this.selected[i].data(index) === j){
                            this.value[j].selected=true;
                        }
                        else{
                            this.value[j].selected=false;
                        }
                    }
		}
	    };
	    for(var i=0;i<this.value.length;i++){ // each image
	//	console.log("mk_thumbnails image num " + i + " name " + this.value[i].title);
		var t=this.value[i].title || "";
		var div=$("<div title='" + t + "'></div>");
		div.data("index",i);
		var b= new Image(100,100);
		if(this.value[i].url && this.value[i].url != ""){
	//	    console.log("using the url");
		    b.src=this.value[i].url;
		}
		else{
	//	    console.log("using the src component - images are already loaded");
		    b.src=this.value[i].src;
		}
		div.append(b);
		td.append(div);
	    }
            if(this.editable){
                this.selected=[];
	        td.selectable({stop:
                               function(e,ui){
                                   that.selected=$("ui-selected");
                                   that.cb(e,that);
                               }
                              }); // make the thumbnails multi-select
	    }
	},
	getValue:function(){

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

    Harvey.Utils.extend(ImageArrayField,_Field);

    var AutoCompleteField=function(d,element){
        d.field="AutoCompleteField";
        d.type="string";
	var that=this;
        //var settings=checkDefaultOptions("AutoCompleteField",d);
        _Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        s.className=this.type;
        this.input=s;
        this.element.appendChild(this.input);
	
/*	this.input.autocomplete({
	    source: this.options
	}); */
    };

    AutoCompleteField.prototype={
        popupEditor: null
    };

    Harvey.Utils.extend(AutoCompleteField,_Field);

    Harvey.field=(function(){
  	var make_field_or_static = function(FieldType){
	    return function(options,element) {
		if (options.editable === false) {
		    return new StaticField(options,element);
		} else {
		    return new FieldType(options,element);
		}
	    };
	};


	var r={
            exists:function(field){
                if(this[field]){
                    return true;
                }
                return false;
            },
	    StaticField: function(options,element) { // readonly for users , writeable by machine
		return new StaticField(options,element);
	    },
	    InputField: make_field_or_static(InputField),
	    FloatField: make_field_or_static(FloatField),
	    DateField: make_field_or_static(DateField),
            TimeField: make_field_or_static(TimeField),
            NumberArrayField: make_field_or_static(NumberArrayField),
	  //  NumberArrayField:function(options,element){return new  NumberArrayField(options,element);},
	    TextAreaField:function(options,element){ return new  TextAreaField(options,element);},
	    SelectField:function(options,element){ return new  SelectField(options,element);},
	    CheckBoxField: function(options,element){return new CheckBoxField(options,element);},
            SliderField:function(options,element){ return new  SliderField(options,element);},
	    ButtonSetField:function(options,element){ return new  ButtonSetField(options,element);},
	    StringArrayField:function(options,element){ return new  StringArrayField(options,element);},
	    ImageArrayField:function(options,element){ return new  ImageArrayField(options,element);},
	    AutoCompleteField: function(options,element){ return new AutoCompleteField(options,element);}
	};
	return r;
    })();

       // get all the methods on the Fields
    Harvey.field._getMethods=function(){
        var Methods={};
        var ar={"StaticField":StaticField,
                "InputField":InputField,
                "FloatField":FloatField,
                "DateField":DateField,
                "TimeField":TimeField,
                "NumberArrayField":NumberArrayField,
                "TextAreaField":TextAreaField,
                "SelectField":SelectField,
                "CheckBoxField":CheckBoxField,
                "SliderField":SliderField,
                "ButtonSetField":ButtonSetField,
                "StringArrayField":StringArrayField,
                "ImageArrayField":ImageArrayField,
                "AutoCompleteField":AutoCompleteField
               };


        for(var n in  ar){
          //  console.log("Field is " + n);
            Methods[n]=[];
            for(var k in ar[n].prototype){
            //    console.log("========================= Method is " + k);
                if(this[n].prototype[k] !== null && k !== "constructor"){
                    if(!k.startsWith("_")){
                        Methods[n].push(k);
                    }
                }
            }
        }
         return Methods;
     };


})(jQuery);
