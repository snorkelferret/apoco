var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');

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
	password: {html_type: "password", field:"InputField", check: "string",sort: null}
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
	  //  console.log("got this field");
	   // this.html_type=Harvey.HtmlToType(this.field);
	    //console.log("setting type to " + this.html_type);
	}
        $.extend(this,d);
	this.html_type=Harvey.dbToHtml[this.type].html_type;

        if(!element){
            element=$("<div></div>");
        }
	else if(element.length === 0){
	    throw new Error("external element for field is null");
	}
	this.element=element;

	this.element.attr("name",d.name);

	if(this.label){
	    this.element.append($("<label> " + this.label + "</label>"));
/*	    if(d.tooltip){
		this.label_element.prop("title", d.tooltip);
		this.label_element.tooltip({tooltipClass: "tooltip"});
	    } */
	    //this.element.append(this.label_element);
	}
        // bug in jquery-ui-1.11.4.js creates millions of divs
	//<div class="ui-helper-hidden-accessible" role="log" aria-live="assertive" aria-relevant="additions"></div>
/*	I just modified the source code:
	First search for .ui-helper-hidden-accessible
	then remove .appendTo(this.document[0].body) */

//	if(this.required){
//	    this.element.append("<p class='required inline'> <span class='ui-icon ui-icon-star' style='margin-left: 10px'> </span></p>");
            /*	    this.element.prop("title",""); //Invalid input - this should be of type " + this.html_type);
	    this.element.tooltip({//disabled:true,
				  tooltipClass: "tooltip"
				 });
	    //this.element.tooltip("close"); */
//	}

	if(this.publish !== undefined){
	    Harvey.IO.publish(this);
	}
	if(this.listen !== undefined){
	    //console.log("field adding listener " + this.name);
	    Harvey.IO.listen(this);
	}
	if(this.action){
	    this.element[0].addEventListener("click", (function(that){
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
            var t=this.element.find("label");
            if(t.length>0){
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
	    var v=this.input.val();
	    if( v && v.length > 0){
		return this.input.val();
	    }
	    return undefined;
	},
	setValue:function(v){
	    this.value=v;
            //console.log("setting value " + v);
            if(this.value === null){
                this.input_val("");
            }
	    else {
                this.input.val(v);
            }
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
                if(!Harvey.checkType[this.type](v)){
                    return false;
                }

                this.input.removeClass("required");
                return true;
	    }
	    return true;
	}
    };



    var _mkStatic={
        float: function(that){
            var val,p=[];
            if(that.value){
                val=that.value.toFixed(this.precision);
	        p=val.toString().split("."); // align to decimal point
            }
            else{
                p[0]="";
                p[1]="";
            }
	    //	this.element.empty();
	    //this.element.append("<span class='float_left'>" + p[0] + "</span>");
            var s=document.createElement("span");
            s.innerHTML=p[0];
            s.className="float_left";
            s=$(s);
            that.element.append(s);
	    if (p.length >= 2){
                s=document.createElement("span");
                s.className="float_right";
                s.innerHTML=("." + p[1]);
                s=$(s);
                that.element.append(s);
		//this.element.append("<span class='float_right'> ." + p[1] + "</span>");
	    }
	    else{
		that.element.append("<span class='float_right'> .00  </span>");
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
                        s.innerHTML=that.delimiter;
                        that.element[0].appendChild(s);
                    }
                }
                that.element[0].appendChild(r);
            }
        }
    };
    var _setStatic={
        float: function(that){
            var p=parseFloat(that.value).toFixed(that.precision).toString().split(".");
            that.element.find("span.float_left").html(p[0]);
            if (p.length >= 2){
                that.element.find("span.float_left").html(p[1]);
	    }
	    else{
	        that.element.find("span.float_left").html(".00");
	    }
        },
        integerArray:function(that){
            var len=that.value;
            var el=that.element.find(("."+that.type));
            for(var i=0;i<len;i++){
                el[i].text(that.value[i]);
            }
        }
    };

    var StaticField=function(d,element){
	//console.log("static field is here");
        // var settings=checkDefaultOptions("StaticField",d);
        d.field="StaticField";
	_Field.call(this,d,element);
        if(_mkStatic[this.type]){
            //console.log("got a method for " + this.type);
            _mkStatic[this.type](this);
        }
        else{
            if(this.value !== null){
                this.element.text(this.value);
            }
        }
    };


    StaticField.prototype={
	getValue: function(){
	    return this.value;
	},
	setValue: function(val){
	    this.value=val;
            if(this.value !== null){
                if( _setStatic[this.type]){
                    _setStatic[this.type](this);
	        }
                else{
		    this.element.text(val);
	        }

            }
	},
        checkValue: function(){
            return true;
        },
	popupEditor: null

    };
  //  Harvey.Utils.extend(StaticField,_Field);


    var InputField=function(d,element){
	//console.log("INPUT FIELD IS HERE with required " + d.required);
       // var settings=checkDefaultOptions("InputField",d);
        d.field="InputField";
	_Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);

        s.className=this.type;

        this.input=$(s);
        //this.input=$("<input class='" + this.type + "' type= '" + this.html_type +  "'/>");

        if(this.min){
            this.input.prop("min", this.min);
        }
        if(this.max){
            this.input.prop("max", this.max);
        }
        if(this.step){
            this.input.prop("step", this.step);
        }
        if(this.precision){
            this.input.prop("pattern", "^[-+]?\d*\.?\/" + this.precision + "*$");
        }

        if(this.required && !this.value ){
          //  console.log("REQUIRED is TRUE, value is " + this.required);
            if(this.field !== "CheckBoxField"){
                this.input.prop("required",true);
                this.input.addClass("required");
            }
        }

        this.element.append(this.input);

	if(this.value !== null && this.value !== undefined){
	    this.input.val(this.value);
	}
	return this;

    };

    Harvey.Utils.extend(InputField,_Field);


    var FloatField=function(d,element){
	//console.log("FLOAT FIELD IS HERE");
        //var settings=checkDefaultOptions("FloatField",d);
        d.field="FloatField";
        d.type="float";
	_Field.call(this,d,element);

	this.input=new Array(2);
	var that=this;
//	this.element.empty();
        this.element.addClass("float");

	var list=document.createElement("ul"); //" class='aligned_float'></ul>");
        list.className='aligned_float';
	var el=document.createElement("li");
	var dec=document.createElement("div");
        dec.className='values';
        var i=document.createElement("input");
        i.className="float_left";
        i.setAttribute("pattern",'^[-+]?[0-9]*$');
        this.input[0]=$(i);
        i=document.createElement("input");
        i.className="float_right";
       // i.setAttribute("pattern",("'^[0-9]*.{0}|.{"+ this.precision + "}$'"));
        i.setAttribute("type","text");
        this.input[1]=$(i);


	//this.input[0]=$("<input type='text' class='float_left' pattern='^[-+]?[0-9]*$' >");
	//this.input[1]=$("<input type='text' class='float_right' pattern='^[0-9]*.{0}|.{"+ this.precision + "}$' >");

        // console.log("FloatField got value " + this.value);

	this.setValue(this.value);


	dec.appendChild(this.input[0][0]);
        var s=document.createElement("span");
        s.innerHTML="&#46";
        dec.appendChild(s); // add the .
	dec.appendChild(this.input[1][0]);
	el.appendChild(dec);
	list.appendChild(el);

        if(this.spinner){
	    el=document.createElement("li");
            dec=document.createElement("div");
            dec.className="arrows";
	    //var dec=$("<div class='arrows'></div>");
            var up=document.createElement("span");
            up.className="up ui-icon ui-icon-triangle-1-n";
	    //var up=$("<span class='up ui-icon ui-icon-triangle-1-n '></span>");
            var down=document.createElement("span");
            up.className="up ui-icon ui-icon-triangle-1-s";
            //var down=$("<span class='down ui-icon ui-icon-triangle-1-s '></span>");
            up=$(up);
            down=$(down);

	    var timer;
	    var step_fn=function (direction){

	        var t=that.getValue();
	        if(t=== null || t===""){
		    clearInterval(timer);
		    return;
	        }

	        //console.log("step_fn: before inc " +  t + " step is " + that.step);
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
	        //t+=that.step;
	        //console.log("step_fn: after inc " +  t);
	        t=parseFloat(t,10).toFixed(that.precision);
	        //console.log("step_fn: after inc to fixed " +  t);
	        if(	that.setValue(t) === null){
		    //console.log("value is " + t);
		    clearInterval(timer);
		    throw new Error("step_fn val is not floating point " + t);
	        }
	    };

	    var dispatch_change=function(){
	        //if(!that.input[0]) console.log("No input[0]");
	        var e=new Event("change");
	        that.element[0].dispatchEvent(e);
	    };

	    var eObj={
	        mouseover: function() {
		    $(this).addClass('ui-state-hover');
	        },
	        mouseout: function() {
		    $(this).removeClass('ui-state-hover');
	        },
	        mousedown: function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    if(e.target === down[0]){
		        timer=setInterval(function(){step_fn("down");},100);
		    }
		    else{
		        timer=setInterval(function(){step_fn("up");},100);
		    }
	        },
	        mouseup: function(){
		    if(timer){
		        clearInterval(timer);
		    }
		    dispatch_change();
	        }
	};
	up.on(eObj);
	down.on(eObj);

	dec.appendChild(up[0]);
	dec.appendChild(down[0]);
	el.appendChild(dec);
	list.appendChild(el);
        };
	this.element.append($(list));

	return this;
    };


    FloatField.prototype={
	getValue: function(){
	    var a=this.input[0].val();
	    var b=(this.input[1].val());

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
		this.input[0].val("");
		this.input[1].val("");
		this.value="";
		return;
	    }
            if(!Harvey.checkType["float"](v)){
		throw new Error("setValue: this value is not a float " + v);
	    }
	    v=parseFloat(v,10).toFixed(this.precision);  // not necessarily a number
	    var p=v.toString().split(".");
	    if(p.length !== 2){
		throw new Error("value is not a floating point number" + v);
		return null;
	    }
            //console.log("setValue: value is " + p[0]);	  
	    this.input[0].val(p[0]);
	    this.input[1].val(p[1]);
	    this.value=v;
	},
        popupEditor: null
    };

    Harvey.Utils.extend(FloatField,_Field);


    var DateField=function(d,element){
        d.field="DateEield";
        d.type="date";
        _Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        s.className=this.type;
        this.input=$(s);
        this.element.append(this.input);
	if(this.editable !== false){
            if(this.value){
	        this.input.datepicker("setDate",this.value);
            }
            else{
                this.input.datepicker();
            }
	    var that=this;
	    this.input.datepicker('option','onSelect',function(date,object_inst){ that.value=date;}); // not tested
	}
	return this;
    };


    Harvey.Utils.extend(DateField,_Field);

    var TimeField=function(d,element){
        d.field="TimeField";
        d.type="time";

	_Field.call(this,settings,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        s.className=this.type;
        this.input=$(s);
        this.element.append(this.input);
    };

    Harvey.Utils.extend(TimeField,_Field);

    var CheckBoxField=function(d,element){
        d.field="CheckBoxField";
        d.type="boolean";
  	_Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        s.className=this.type;
        this.input=$(s);
        this.element.append(this.input);
	//console.log("checkbox value is " + d.value);
        this.setValue(this.value);
        if(this.editable === false){
            this.input.prop("disabled",true);
        }
	return this;
    };



    CheckBoxField.prototype={
	getValue:function(){
	    //console.log("value of checkbox is " + this.input.val() + " and prop is " + this.input.prop('checked'));
	    return this.input.prop('checked');
	},
        setValue:function(val){
            
            if(val === "true" || val === true || val === 1){
	        // console.log("setting checkbox value to true");
	        this.input.prop("checked",true);
	        this.input.val(true);
                this.value=true;
	    }
	    else {
	        //console.log("setting checkbox value to false");
	        this.input.val(false);
	        this.input.prop("checked",false);
                this.value=false;
	    }
            
        },
	popupEditor:function(func){
	    //console.log("checkbox editor is here");
            if(this.editable === true){
	        var cb=function(that){
		    return function(e){
		        e.stopPropagation();
		        func(that.input.prop('checked'));
		    };
	        }(this);
	        this.input.on("click",cb);
            }
        }
    };

    Harvey.Utils.extend(CheckBoxField,_Field);


    var NumberArrayField=function(d,element){
       // var settings=checkDefaultOptions("NumberArrayField",d);
        var r,s;
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
	for(var i=0;i<this.size;i++){

            r=document.createElement("input");
            r.setAttribute("type", this.html_type);
            r.className=this.type;
            this.input[i]=$(r);
            if( this.delimiter !== undefined){
                if(i>0 && i<(this.size-1)){
                    s=document.createElement("span");
                    s.innerHTML=this.delimiter;
                    this.element[0].appendChild(s);
                }
            }

            if(this.min){
                this.input[i].prop("min", this.min);
            }
            if(this.max){
                this.input[i].prop("max", this.max);
            }
            if(this.step){
                this.input[i].prop("step", this.step);
            }
            if(this.value){
	        this.input[i].val((this.value[i] || ""));
                this.value[i]=this.input[i].val();
            }
	    this.element.append(this.input[i]);
	}
	return this;

    };


    NumberArrayField.prototype={
	setValue: function(v){
            if(v.length >this.size){
                throw new Error("NumverArratField: input array size is less than value size");
            }
            this.value=v;

	    for(var i=0;i<this.input.length;i++){
                if(v[i]){
	            this.input[i].val(v[i]);
                }
                else{
                    this.input[i].val("");
                }
	    }
	},
	getValue:function(){
	    return this.value;
	},
	popupEditor:function(func){
	    if(this.value.length>0){
		var r=[];
		for(var i=0; i< this.value.length;i++){
		    r[i]=this.value[i];
		}

		this.element.keypress(function(event){
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
	this.input=$("<textarea ></textarea>");

	this.element.append(this.input);

	if(this.value){
	    this.input.val(this.value);
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
	var i;
      //  var settings=checkDefaultOptions("SelectField",d);
        d.field="SelectField";
	_Field.call(this,d,element);

	var options="<select>";
	for(i=0; i<this.options.length; i++){
	    if(i===0 && this.blank_option !== undefined && this.blank_option === true){ // add a blank option at the head of the list
		options=options.concat("<option value=\"\"></option>");
	    }
	    options=options.concat("<option value='" + this.options[i] + "'>" + this.options[i] + "</option>");
	}
	options=options.concat("</select>");
        this.select=$(options);

	var cd=function(that){
		return function(e){
		    e.stopPropagation();
		    if((that.input).is("visible")){
			that.input.hide();
			that.span.hide();
			that.element.show();
		    }
		};
	}(this);


        var mk_input=function(){
	    this.input=$("<input class='" + this.type + "' type= '" + this.html_type + "'/>").css('display','none');
	    this.span=$("<span class='ui-icon ui-icon-triangle-1-s'>").css('display','none');
	    this.element.append(this.input);
	    this.element.append(this.span);
	    this.span.on("click",cd);
        };
        

        var that=this;
	// if selection option is "Other" add a new input field
	this.select.change(function(){
	    //console.log("select option has changed");
	    if (that.select.val() === "Other"){
                
		if(!this.input || this.input.length === 0){
                    mk_input();
                }
                that.element.find("select").hide();
		that.input.css('display','inline');
		that.span.css('display','inline');
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
	    this.select.val(this.value);
	}

	this.element.append(this.select);

	return this;

    };


    SelectField.prototype={
        setValue: function(v){
            for(var i=0;i<this.options.length;i++){
                if(this.options[i] == v){
                    this.select.val(v);
                  //  this.input.val("");
                    return;
                }
            }
            if(this.input){
                this.input.val(v);
                return;
            }
            throw new Error("SelectField: Cannot set value to " + v + " options are " + this.options[0] + " " +  this.options[1] + " " + this.options[2] );
        },
	getValue:function(){
	    // return this.select[this.select.selectedIndex].val();
	    if(this.input && this.input.val()){
		var v=this.input.val();
	    }
	    else{
		var v=this.select.val();
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

    var RadioButtonSetField=function(d,element){   // like select field - but not in a dropdown and not editable
        //var settings=checkDefaultOptions("RadioButtonSetField",d);
        d.field="RadioButtonSetField";
        d.type="boolean";
	_Field.call(this,d,element);
	this.popup=true;
	if(!this.labels && this.labels.length ===0){
	    throw new Error("must have a labels array for ButtonSetField");
	}
	this.input=[];
        this.value=[];
	var u=$("<ul class='choice'></ul>"); // add the selection list
	this.element.append(u);
	this.current_selection=null;
	for(var i=0;i<this.labels.length;i++){
	    //console.log("adding label " + this.labels[i]);
	    this.addValue();
	};

	return this;
    };



    RadioButtonSetField.prototype={
	addValue:function(new_label){
	    var p=this.input.length;
	    if(new_label){
		this.labels[p]=new_label;
	    }
	    var label=this.labels[p];
	    if(!label){
		throw new Error("ButtonSet requires a label before adding a new button");
	    }
	    var l=$("<li>" + label + "</li>");
	    var u=this.element.find('ul');
	    this.element.find('ul').append(l);

	    //console.log("buttonSet adding field " + p + " label " + this.labels[p]);
            if(this.multiple_selection){
                this.input[p]=$("<input type='checkbox' >");
            }
            else{
	        this.input[p]=$("<input type='radio' >");
            }
            this.value[p]=false;
	    l.append(this.input[p]);

	    l.on("click",function(that,index){
		return function(e){
		    e.stopPropagation();
                   // console.log("current value is " + that.input[index].val());
                    //console.log("current checked is " + that.input[index].prop("checked"));

                    if(that.input[index].prop("checked") === true && that.value[index]=== false){
                        that.value[index] = true;
                    }
                    else {
                        that.value[index] = false;
                    }

		};
	    }(this,p));
	},
	reset:function(){

            for(var i=0;i<this.value.length; i++){
                this.value[i]=false;
            }
	    this.element.find('li').removeClass('selected');
	    this.element.find('input').prop("checked",false).val(false);
	},
        setValue: function(value){
            if(Harvey.checkType['string'](value)){
                var n= $("li:contains('" + value + "')");
                if(n.length>0){
                    n.find('input').prop("checked",true);
                    n.trigger("click");
                    return true;
                }
            }
            throw new Error("RadioButtonsetfield: setValue has no member called " + value);
        },
	deleteValue:function(label){
	    var that=this;
	    var index=null;
	    //console.log("remove value is " + value);
	    for(var i=0;i<this.labels.length;i++){
		if(this.labels[i] === label){
		    index=i;
		    //console.log("found value " + value + " with index " + index);
		    break;
		}
	    }
	    if(index !== null){
		//console.log("found index " + index);
                this.labels.splice(index,1);
		this.value.splice(index,1);
		var p=this.input[index].parent();
		this.input[index].remove();
		this.input.splice(index,1);
		p.remove();
	    }
	    else{
		throw new Error("could not remove value " + value);
	    }

	},
	getValue:function(){
            var ar=[];
            for(var i=0;i<this.labels.length;i++){
                var p={};
                p[this.labels[i]]=this.value[i];
                ar[i]=p;
            }
	    return ar;
	},
	checkValue:function(){
	    if(this.required ){ // must have at least one value set to true.
                for(var i=0; i<this.value.length; i++){
                  //  console.log("checkbox value is " + this.value[i]);
                    if(this.value[i] == true){
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
    Harvey.Utils.extend(RadioButtonSetField,_Field);

    var CounterField=function(d,element){
        //var settings=checkDefaultOptions("CounterField",d);
        d.field="CounterField";
	_Field.call(this,d,element);

	this.input=$("<input class='" + this.type + "' name='value' type= '" + this.html_type + "'/>");
	this.element.append(this.input);
	this.spinner=this.input.spinner({min: this.min});
	this.spinner.spinner("value",(this.value));
        
    };


    CounterField.prototype={
        getValue:function(){
	    return this.spinner.spinner("value").toString();
        },
        setValue:function(v){
            if(!Harvey.checkType[this.type](v)){
                throw new Error("CounterField: setValue wrong type for value");
            }
            this.spinner.spinner("value",v);
            this.value=v;
            this.input.val(v);
        }
    };

    Harvey.Utils.extend(CounterField,_Field);

    var SliderField=function(d,element){
        //var settings=checkDefaultOptions("SliderField",d);
        d.field="SliderField";
	_Field.call(this,d,element);
	this.popup=true;
	this.input=$("<input class='" + d.type + "' type= '" + this.html_type + "'/>").css('display','none');

        this.element.append(this.input);
	var that=this;
	this.slider=$("<div class='slider'></div>");

	this.value=(this.value)?this.value: this.min;

	//this.label.prop("for","amount");
        if(this.label){
	    this.getLabel().append("<span> " + this.value + "</span>");
        }
	this.element.append(this.slider);

	this.slider.slider({range: "max", min: this.min, max:this.max, value:this.value,
		       slide: function(e,ui){
			   that.input.val(ui.value);
			   that.element.find('label span').text((" " + ui.value));
		       }
		      });

	this.input.val(this.slider.slider('value'));
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
	this.element.addClass("stringArray");
	this.input=[];
	var dv=$("<div class='list_container'></div>");
	this.element.append(dv);

	dv.append($("<ul class='fieldset'></ul>"));

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
	    this.element.find('li').last().append("<span class='plus ui-icon ui-icon-plusthick' style='float: right; margin-left: 5px; border: 1px solid #000'></span>");
            this.element.find('li').last().append("<span class='minus ui-icon ui-icon-minusthick' style='float: right; margin-left: 5px; border: 1px solid #000'></span>");
	    this.element.find('span.plus').on("click",function(e){
               // console.log("StringArrayField got click on plus");
		e.stopPropagation();
		var l=that.input.length;
	        var sp=that.element.find('li').last().find('span');
                sp.detach();
		that.addValue(l);
		var last_element=that.element.find('li').last();
		last_element.append(sp);
	    });
	    this.element.find('li').last().find('span.minus').on("click",function(e){
		e.stopPropagation();
		var l=that.input.length-1; //should be able to delete more than just the last
		var sp=that.element.find('li').last().find('span');
                sp.detach();
                that.deleteValue(l);
	  	var last_element=that.element.find('li').last();
		last_element.append(sp);

	    });

	}
    };

    StringArrayField.prototype={
        setValue:function(v,index){
            if(!Harvey.checkType["array"](v)){
                if( index !== undefined && index<this.length){
                    this.input[index].input.val(v);
                    this.value[index]=v;
                }
                else{
                    throw new Error("StringArrayField: setValue not an array");
                }
            } 
            else {
               if(v.length <= this.length){
                    for(var i=0;i<v.length;i++){
                        this.input[i].input.val(v[i]);
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
		t=this.input[i].input.val();
		if(t !== ""){
		    vals.push(this.input[i].input.val());
		}
	    }
	    return vals;
	},
        deleteValue:function(i){
            if(this.input.length>1){
                this.input[i].input.parent().remove();
                this.input.splice(i,1);
                this.value.splice(i,1);
            }
           // else{
             //   Harvey.popup.alert("StringArrayField: Cannot remove the last value");
            //}
        },
	addValue:function(i){
	    this.input[i]={};
	   // console.log("trying to add a string field");
	    var element=$("<li type='string' class='string'></li>");
            this.input[i].input=$("<input type='string'>");
	    element.append(this.input[i].input);
            this.element.find(".fieldset").append(element);
	    if(this.value[i]){
		this.input[i].input.val(this.value[i]);
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
        //var settings=checkDefaultOptions("ImageArrayField",d);
        d.field="ImageArrayField";
        d.type="imageArray";
	_Field.call(this,d,element);
	this.popup=true;
        this.width=this.width?this.width:100;
        this.height=this.height?this.height:100;
	var that=this;
        var promise,new_values=[];
       // this.thumbnails=true;
        if(!this.value){
            this.value=[];
        }
        if(this.editable !== false){
	    if(!window.FileReader){
	        Harvey.popup.dialog("Sorry No FileReader","Your browser does not support the image reader");
	        throw new Error("No FileReader");
	    }
            this.input=$("<input type='file' id='files' size='6' name='files[]' multiple />");
	    this.element.append(this.input);
	    this.input.on("change",function(){
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
            var td=this.element.find(".image_gallery");

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
	    this.element.append(td);

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
	var that=this;
        //var settings=checkDefaultOptions("AutoCompleteField",d);
        _Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        s.className=this.type;
        this.input=$(s);
        this.element.append(this.input);
	
	this.input.autocomplete({
	    source: this.options
	});
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
            CounterField:function(options,element){ return new  CounterField(options,element);},
	    SliderField:function(options,element){ return new  SliderField(options,element);},
	    RadioButtonSetField:function(options,element){ return new  RadioButtonSetField(options,element);},
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
                "CounterField":CounterField,
                "SliderField":SliderField,
                "RadioButtonSetField":RadioButtonSetField,
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
