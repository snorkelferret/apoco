var Apoco=require('./declare').Apoco;
require('./Utils');
require("./Sort");
require('./Types');
require("./datepicker");
var Promise=require('es6-promise').Promise; //polyfill for ie11

// editable: true by default
// required: false by default

;(function(){
    "use strict";

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
        
	this.html_type=Apoco.type[this.type].html_type;
        if(element === undefined){
            this.element=document.createElement("div");
        }
	else if(element){
            this.element=element;
        }
	else {
            throw new Error("Field: element is not a html node");
        }
        this.element.classList.add(this.type);

        if(this.class){
            if(Apoco.type["string"].check(this.class)){
                this.element.classList.add(this.class);
            }
            else{
                for(var i=0;i< this.class.length;i++){
                    this.element.classList.add(this.class[i]);
                }
            }
        }
        
	this.element.setAttribute("name",this.name);
        if(this.title !== undefined){
            this.element.title=this.title;
        }
	if(this.label){
            var l=document.createElement("label");
            l.appendChild(document.createTextNode(this.label));
 	    this.element.appendChild(l);
	}
        
	if(this.publish !== undefined){
	    Apoco.IO.publish(this);
	}
	if(this.listen !== undefined){
	    Apoco.IO.listen(this);
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
            if(!Apoco.type[this.type].check(v)){
                throw new Error("Field: setValue " + v  + " is the wrong type, expects " + this.type);
            }
	    this.value=v;
            if(this.value === null){
                this.input.value="";
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
			    func(that.input.val());
			}
		    };
		}(this);
	    }
	    else{
		throw new Error("no input element for this type " + this.type);
	    }
	},
        resetValue:function(){
            if(this.value === undefined){
                this.input.value = "";
                return null;
            }
           
            if(Apoco.type["array"].check(this.value)){
                for(var i=0;i<this.value.length; i++){
                    this.input[i].value=this.value[i];
                }
                return this.value;
            }
            this.input.value=this.value;
            return this.value;
        },
	checkValue:function(){
	    var array=false;
            var v=this.getValue();
            if(Apoco.type["blank"].check(v)){
   	        if(this.required){
                    return false;
                }
            }
            if(Apoco.type[this.type].check !== undefined){
                if(!Apoco.type[this.type].check(v)){
                    return false;
                }
 	    }
	    return true;
	}
    };

    var StaticField=function(d,element){
        var that=this;
        d.field="static";
        _Field.call(this,d,element);
        this.span=document.createElement("span");
        //s.setAttribute("type",this.html_type);
        this.setValue(this.value);
        this.element.appendChild(this.span);
    };
    StaticField.prototype={
        setValue:function(v){
            var t=new String,p;
            if(!v){
                v=this.value;
            }
            else{
                this.value=v;
            }
            if(Apoco.type["array"].check(v)){
                for(var i=0;i<v.length;i++){
                    p=v[i];
                    t=t.concat(p.toString());
                    if(i<(v.length-1)){
                        t=t.concat(", ");
                    }
                }
                this.span.textContent=t;
            }
            else{
                this.span.textContent=v;
            }
            
        },
        getValue:function(){
            return this.value;
        }
    };

    Apoco.Utils.extend(StaticField,_Field);
    
    var InputField=function(d,element){
        var that=this;
        d.field="input";
	_Field.call(this,d,element);
        var s=document.createElement("input");
        s.setAttribute("type",this.html_type);
        this.input=s;
        if( this.min !== undefined){
            this.input.setAttribute("min",this.min);
        }
        if(this.max !== undefined){
            this.input.setAttribute("max",this.max);
        }
        if(this.step){
            this.input.setAttribute("step",this.step);
        }
        if(this.precision){
            this.input.setAttribute("pattern", "^[-+]?\d*\.?\/" + this.precision + "*$");
        }
        if(this.placeholder){
            this.input.setAttribute("placeholder",this.placeholder);
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
            this.input[1].readOnly=true;
            this.spinner=false;
        }
        if(this.spinner){
	    el=document.createElement("li");
            list.appendChild(el);
            dec=document.createElement("div");
            dec.className="arrows";
            el.appendChild(dec);
            var up=document.createElement("span");
            up.classList.add("up");
            var down=document.createElement("span");
            down.classList.add("down");
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
	        if(!Apoco.type.float.check(t)){
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
	        if(that.setValue(t) === null){
		    clearInterval(timer);
		    throw new Error("step_fn val is not floating point " + t);
	        }
	    };
	    var eObj={
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
	    if(Apoco.type.blank.check(a)) {
		if(Apoco.type.blank.check(b)){
		    return this.value="";
		}
		else{
		    this.value=parseFloat(("0."+b),10).toFixed(this.precision);
		}
	    }
	    else if(Apoco.type.blank.check(b)){
		this.value=parseFloat((a + ".000"),10).toFixed(this.precision);
	    }
	    else{
                if(a<0){
		    this.value=(parseInt(a,10)-parseFloat(("." + b),10)).toFixed(this.precision);
                }
                else{
                    this.value=(parseInt(a,10)+parseFloat(("." + b),10)).toFixed(this.precision);
                }
	    }
	    if(!Apoco.type.float.check(this.value)){
		throw new Error("getValue: this is not a floating point number " + this.value);
		return null;
	    }
	    return this.value;
	},
        resetValue:function(){
            this.setValue(this.value);
        },
	setValue: function(v){
 	    if(Apoco.type.blank.check(v)){
                this.input[0].value="";
                this.input[1].value="";
		this.value="";
		return;
	    }
            if(!Apoco.type["float"].check(v)){
		throw new Error("FloatField: setValue this value is not a float " + v);
	    }
	    v=parseFloat(v,10).toFixed(this.precision);  // not necessarily a number
	    var p=v.toString().split(".");
	    if(p.length !== 2){
		throw new Error("value is not a floating point number" + v);
		return null;
	    }
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
        if(this.required === true){
            this.input.required=true;
        }
        this.element.appendChild(this.input);
        if(this.value){
            this.input.value=this.value;
	}
	if(this.editable !== false){
            if(navigator.appCodeName === "Mozilla"){ //add a datepicker cause none on Mozilla
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
            return this.input.checked;
	},
        setValue:function(val){
            if(val === "true" || val === true || val === 1){
                this.input.setAttribute("checked","checked");
	    }
	    else {
                if(this.input.hasAttribute("checked")){
                    this.input.removeAttribute("checked");
                }
	    }
        },
	popupEditor:function(func){
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
	if(this.value && !Apoco.type.array.check(this.value)){
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
            return true;
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
			func(r);
		    }
		},false);
	    }
	    throw new Error("no input element for this type " + this.type);
	}
    };

    Apoco.Utils.extend(NumberArrayField,_Field);

    var TextAreaField=function(d,element){
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
	var i,o,that=this,select_el;
        d.field="select";
        d.type="string";
	_Field.call(this,d,element);
        select_el=document.createElement("select");
        if(this.required === true){
            select_el.required=true;
        }
	for(i=0; i<this.options.length; i++){
            o=document.createElement("option");
            o.value=this.options[i];
            o.textContent=this.options[i];
            select_el.appendChild(o);
	}
	if(this.blank_option === true){ // add a blank option at the head of the list
            o=document.createElement("option");
            o.value="";
            select_el.appendChild(o);
	}
        this.select=select_el;
     
	var cd=function(that){
		return function(e){
		    e.stopPropagation();
                    if(e.keyCode === 13){
		        if(that.input.style.visibility === "visible"){ //}("visible")){
			    that.input.style.visibility= "hidden"; //hide();
                            that.select.style.visibility="visible";
                            console.log("target value" + e.target.value);
                            o=document.createElement("option");
                            o.value=e.target.value;
                            o.textContent=e.target.value;
                            that.select.appendChild(o);
                            that.options.push(that.select.value);
                            that.select.value=e.target.value;
		        }
                    }
		};
	}(this);


        var mk_input=function(){
            that.input=document.createElement("input");
            that.input.setAttribute("type",that.html_type);
            that.element.appendChild(that.input);
            that.input.addEventListener("keypress",cd);
        };

        // if selection option is "Other" add a new input field
        this.select.addEventListener("change",function(){
	    console.log("select option has changed");
            if(that.select.value === ""){      
		if(!that.input){ 
                    mk_input();
                }
                that.select.style.visibility="hidden";
	        that.input.style.visibility="visible";
	        that.input.focus();
	    }
	    else if(that.edit_func){ //set for editor callback
		var v=that.getValue();
		that.value=v;
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
                    this.value=v;
                    return;
                }
            }
            if(this.input){
                this.input.value=v;
                this.value=v;
                return;
            }
            throw new Error("SelectField: Cannot set value to " + v );
           
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
	},
        resetValue:function(){
            this.select.value=this.value;
            return this.select.value;
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
        if(!this.value){
            this.value=[];  
        }
        
        for(var i=0;i<this.labels.length;i++){
            this.input[i]={};
            this.input[i].label=this.labels[i];
            if(!this.value[i]){
                this.value[i]=false;
            }
         }
        this.labels.length=0;
	this.popup=true;
        var u=document.createElement("ul");
        u.className="choice";
	this.element.appendChild(u);
        
	for(var i=0;i<this.input.length;i++){
	    this.addValue(i);
	};
        this.setValue(this.value);
        if(this.action){
            this.action(this);
        }
	return this;
    };

    ButtonSetField.prototype={
	addValue:function(index,value){
            var l,p;
            if(index === undefined){
                throw new Error("ButtonSetField: must supply a name");
            }
            if(!Apoco.type["integer"].check(index)){
                var label=index;
                index=this.input.length;
                this.input[index]={};
                this.input[index].label=label;
                this.value[index]=(value)?value:false;
            }
            l=document.createElement("li");
  	    this.element.getElementsByTagName('ul')[0].appendChild(l);
            this.input[index].input=document.createElement("input");
            if(this.checkbox === true ){
                this.input[index].input.type="checkbox";
                if(this.editable === false){
                    this.input[index].input.disabled=true;
                }
            }
            else{
                this.input[index].input.type="radio";
                if(this.editable === false){
                    if(this.value[index] === false){
                        this.input[index].input.disabled=true;
                    }
                }
            }
            this.input[index].input.id=this.input[index].label;
            this.input[index].input.checked=this.value[index];
          
            l.appendChild(this.input[index].input);
            p=document.createElement("label");
            p.setAttribute("for",this.input[index].label);
            p.textContent=this.input[index].label;
            l.appendChild(p);
            if(this.checkbox !== true){
                this.element.addEventListener("click",function(e){
                    var b;
                  //  console.log("element has tag" + e.target.tagName);
                    if(e.target.tagName === "INPUT" ){
                    //    console.log("e.terget has checked = " +  e.target.checked);
                        // set the siblings to false
                        b=e.currentTarget.getElementsByTagName('input');
                        for(var i=0;i<b.length;i++){
                            if(b[i] !== e.target){
                                b[i].checked=false;
                            }
                        }
                        //(e.target.checked==false)?e.target.checked=true: e.target.checked=false;
                        e.stopPropagation();
                    }
                },false);
            }
            return true;
	},
	resetValue:function(){
            for(var i=0;i<this.input.length;i++){
                this.input[i].input.checked=this.value[i];
            }
	},
        setValue: function(value,index){
            var t=0;
            if(!Apoco.type["array"].check(value)){
                if( index !== undefined && index<=this.input.length){
                    if(this.checkbox !== true){
                        if(value === true){ //set all the others to false
                            for(var i=0;i<this.input.length;i++){
                                this.input[i].input.checked=false;
                                this.value[i]=false;
                            }
                        }
                    }
                    this.input[index].input.checked=value;
                    this.value[index]=value;
                    
                }
                else{
                    throw new Error("ButtonSetField: value must be a boolean array");
                }
                return;
            }
            
            if(value.length!== this.input.length){
                throw new Error("ButtonSetField: values array length " + value.length + " does not match labels " + this.input.length);
            }
            else if(this.checkbox !== true){ //radio button only one true value
                 for(var i=0;i<value.length;i++){
                    if(value[i] === true){
                        t++;
                    }
                }
                if(t> 1){
                    throw new Error("ButtonSetField: only one true value for radio buttons");
                }
            }
            for(var i=0;i<value.length;i++){
                this.value[i]=value[i];
                this.input[i].input.checked =value[i];
            }
        },
	deleteValue:function(label){
	    var that=this;
	    var index=null;
	    for(var i=0;i<this.input.length;i++){
		if(this.input[i].label === label){
		    index=i;
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
	for(var i=0;i<this.length;i++){
            if(this.value[i]){
	        this.addValue(this.value[i],i);
            }
            else{
                this.addValue("",i); 
            }
	}
	// this adds an extra field if you press return in last field
	if(this.editable !== false){
	    // add a glyph
            var sp=document.createElement("span");
            sp.classList.add("plus");
            var p=this.element.getElementsByTagName("li")[(this.element.getElementsByTagName("li").length-1)];
            p.appendChild(sp);
            var sm=document.createElement("span");
            sm.classList.add("minus");
            p.appendChild(sm);
            var addremove=function(add){
                var l=that.input.length,n;
                sp.parentNode.removeChild(sp);
                sm.parentNode.removeChild(sm);
                if(add=== "add"){
		    that.addValue("",l); // add a blank value
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
            if(!Apoco.type["array"].check(v)){
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
                if(this.value[i]){
                    this.value.splice(i,1);
                }
                t.parentNode.removeChild(t);
            }
        },
	addValue:function(value,i){
            if(i===undefined){
                i=this.input.length;
            }
 	    this.input[i]={};
            var element=document.createElement("li");
            element.className="string";
            this.input[i].input=document.createElement("input");
            if(this.required===true){
                this.input[i].input.required=true;
            }
            this.input[i].input.setAttribute("type","string");
            element.appendChild(this.input[i].input);
            this.element.getElementsByClassName("string_fieldset")[0].appendChild(element);
	   
	    this.input[i].input.value=value;
            if(this.editable === false){
                this.input[i].input.readOnly=true;
            }
	},
	checkValue:function(){
	    var valid;
	    (this.required)?valid=false: valid=true;
	    var v=this.getValue();
	    for(var i=0;i<v.length;i++){
		if(this.required){
		    if(!Apoco.type["blank"].check(v[i])){
			valid=true;   // at least one non blank value
		    }
		}
		if(!Apoco.type["string"].check(v[i])){  
		    valid=false;
		    break;
		}
	    }
	    if(!valid){
		this.displayInvalid();
	    }
	    return valid;
	},
        resetValue:function(){
            var v;
            for(var i=0;i<this.length;i++){ // original length
                v=(this.value[i])?this.value[i]:"";
                if(this.input[i]){
                    this.input[i].input.value=v;
                }
                else{  // value has been deleted
                    this.addValue(v,i);
                }
            }
            if(this.input.length > this.length && this.length>0){
                console.log("this input length " + this.input.length + " original length " + this.length);
                for(var i=this.input.length-1; i>this.length;i--){
                    this.deleteValue(i);
                }
            }
        }
    };

    Apoco.Utils.extend(StringArrayField,_Field);


    var ImageArrayField =function(d,element){
        var that=this,rc=true;
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
                rc=that._getImageFileSelect(e);
            });
        }
        if(!rc){
            Apoco.popup["dialog"]("Image Load Error","One or more of the selected files is not a readable image");
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
            var promise=new Promise(function(resolve,reject){
	        imm.onload=function(){
                    o.width=parseFloat(this.width);
                    o.height=parseFloat(this.height);
                    o.title=o.name;
                    o.image=imm;
                    o.aspect_ratio=parseFloat(this.width/this.height);
                    resolve(o);
                };
                imm.onerror=function(){
                    o.image=null;
                    reject("Field:ImageArray._getImage Could not load image " + o.src);
                };
            });
            return promise;
        }, 
        _getImageFileSelect: function(evt){
            var that=this,rc=true;
            var td=this.element.querySelector("div.thumbnails");
   	    //new_values.length=0; // reset array
	    evt.stopPropagation();
	    var files = new Array; //evt.target.files;
            //check that the files are images
            for(var i=0;i<evt.target.files.length;i++){
                if (evt.target.files[i].type.match('image.*')) {
                    files.push(evt.target.files[i]);
                }
                else{
                    rc=false;
                }
            }
            var count=that.value.length;
	    var last=count+files.length;
	    for (var i=count,j=0; i<last; i++,j++) {
		var reader = new FileReader();
		reader.onload = (function(f,num) {
                 //   console.log("getImagefileselect  file is  %j",f);
		    return function(e) {
                        var p;
			e.stopPropagation();
                        that.value[num]={src: e.target.result,name:f.name};
                        that.promises[num]=that._getImage(that.value[num]);
                        if(that.thumbnails === true){
                            that._addThumbnail(td,num);
                        }
 		    };
		})(files[j],i);
		reader.readAsDataURL(files[j]);
	    }
            return rc;
        },
        loadImages: function(values){
            var i=0,last,that=this;
            if(values !==undefined && Apoco.type["array"].check(values)){ //loading more images after creation
                i=this.value.length;
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
            var td=this.element.querySelector("div.thumbnails");
            if(!td){
                td=document.createElement("div");
                td.className="thumbnails";
                this.element.appendChild(td);
	    }
	    for(var i=0;i<this.value.length;i++){ // each image
                that._addThumbnail(td,i);
            }
  	},
        resetValue:function(){
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
        var v;
        var box,that=this;
        var pubsub;
        d.field="AutoCompleteField";
        d.type="string";

        _Field.call(this,d,element);
        if(this.options === undefined){
            this.options=[];
        }
        box=document.createElement("div");
        box.classList.add(this.type,"apoco_autocomplete");
        this.element.appendChild(box);
        var p=document.createElement("span");
        p.classList.add("search");
        p.innerHTML="&#x26B2;";
        box.appendChild(p);
        this.input=document.createElement("input");
        this.input.setAttribute("placeholder","Search");
        if(this.required===true){
            this.input.required=true;
        }
        this.input.setAttribute("type",this.html_type);
        box.appendChild(this.input);
      
        this.select=document.createElement("ul");
        this.select.classList.add("choice");
        this.select.style.visibility="hidden";
        box.appendChild(this.select);
        var handleEvent=function(e){
            var pubsub;
            switch(e.type){
            case "input":
                var r;
                //  console.log("INPUT event on %j ",e.target);
                var v=that.input.value;
              
                e.stopPropagation();
                Apoco.IO.dispatch(pubsub,v);
                that.select.style.visibility="hidden";
                r=that.contains(that.options,v);
                if(r.length>0){
                    that._make_list(r);
                    that.select.style.visibility="visible";
                }
                break;
            case "blur":
                e.stopPropagation();
                that.select.style.visibility="hidden";
                break;
            case "keypress":
                pubsub=(that.name + "_value_selected");
            default: return;
            }
        };
        //make a list of 10 things
        for(var i=0;i<10;i++){
            this.select.appendChild(document.createElement("li"));
        }
        
        //click event triggers after the blur so the link gets hidden.
        // Instead of click use mousedown it will work.
        
        this.select.addEventListener("mousedown", function(e){
            e.stopPropagation();
            pubsub=(that.name + "_value_selected");
            that.input.value=e.target.textContent;
            Apoco.IO.dispatch(pubsub,that.input.value);
        //    console.log("setting value to " + that.input.value);
            that.select.style.visibility="hidden";
        },false);
        
        this.input.addEventListener("input", function(e){
            var r;
             //  console.log("INPUT event on %j ",e.target);
            var v=that.input.value;
            pubsub=(that.name + "_value_changed");
            e.stopPropagation();
            Apoco.IO.dispatch(pubsub,v);
            that.select.style.visibility="hidden";
            r=that.contains(that.options,v);
            if(r.length>0){
                that._make_list(r);
                that.select.style.visibility="visible";
            }
       },false);
        
        this.input.addEventListener("keyup",function(e){
            e.stopPropagation();
            if(e.key === "Enter"){
                pubsub=(that.name + "_value_selected");
             //   console.log("key was " + e.key);
                var v=that.input.value;
                Apoco.IO.dispatch(pubsub,v);
            }
        },true);
       this.input.addEventListener("blur", function(e){
            e.stopPropagation();
            that.select.style.visibility="hidden";
        },true); 	
       
       
        if(this.action){
            this.action(this);
        }
        return this;
    };

    AutoCompleteField.prototype={
        deleteOptions:function(){
            this.options.length=0;
        },
        addOptions:function(n){
            for(var i=0;i<n.length;i++){
                this.options.push(n[i]);
            }
            if(this.options.length>1){
                Apoco.sort(this.options,"string");
            }
         },
        _make_list:function(ar){
            var p;
            var l=this.element.getElementsByTagName("li");
            
            for(var i=0;i<10;i++){
                if(ar[i]){
                    l[i].textContent=ar[i];
                    l[i].style.visibility="inherit";
                }
                else{
                    l[i].textContent="";
                    l[i].style.visibility="hidden";
                }
            }
         },
        contains:function(arr,item){
            var count=0,a,n=[];
            // make it case insensitive
            item=item.toLowerCase();
            for(var i=0;i<arr.length;i++){
                a=arr[i].toLowerCase();
                if(arr[i].startsWith(item)){
                  //  console.log("item " + item + " starts with " + arr[i]);
                    n[count]=arr[i];
                    count++;
                }
                if(count ===10){
                    return n;
                }
            }
            return n;
        },
    /*    offset:function(){
            var that=this;
            var  offset={x:0,y:0};
            var rect=that.input.getBoundingClientRect();
            that._getOffset(that.select,offset);
            that.select.style.top=((rect.bottom+window.scrollY - offset.y).toString() + "px"); //pos[0];
            that.select.style.left=((rect.left+window.scrollX - offset.x).toString() + "px"); //pos[1];

        },
        _getOffset: function(object, offset) {
            if (!object){
                return;
            }
            offset.x += object.offsetLeft;
            offset.y += object.offsetTop;
            this._getOffset(object.offsetParent, offset);
        }, */
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
        static: function(options,element){return new StaticField(options,element)},
        staticMethods:function(){var n=[]; for(var k in StaticField.prototype){  n.push(k);} return n;},
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
