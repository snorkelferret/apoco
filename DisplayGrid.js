var Harvey=require('./declare').Harvey,UI=require('./declare').UI; //jQuery=require('jquery');
require("./DisplayBase.js");
require("./Fields.js");
require("./Sort.js");
/*
 * Copyright (c) Pooka Ltd.2012-2016
 * Distributed under MIT license.
 * All rights reserved.
 */

/*
  TODO 
   right mouse buton - add functionality to add/remove columns
   resizable does not reappear after the element has been detached
   add support for displaying/ uploading images

Data Format
jsonishData={
      DOM: "Content",
      sortOrder: [cols[i].name,cols[j].name],
      groupby: some column name,

      cols:  // have these keys
      {  name: string, // required key
         type: // see HarveyTypes  // required key
         editable: boolean, (default true)
         unique: boolean,(default false)
         hidden: boolean,(default false)
         display: boolean, (default true) // setting to false means no dom element is created.
         userSortable: boolean (default: false)
         required: boolean (default: true)
         step: float, default(0.1) // FloatField only
         precision: integer, default(2) // FloatField only
 },
 rows:  // must have the same number of keys matching the names of the cols
 [ { key: matching cols name above, value, key: value ...},
 { ....}
 ]
 };

*/


;(function(){
    "use strict";



    
    var getWidth=function(cols){ 
        var class_list=[],width;
        for(var i=0;i<cols.length;i++){
            if(cols[i].display !== false){
                class_list[i]={};
                class_list[i].classname=("." + cols[i].type).toString();
            }
	}
        width=Harvey.Utils.widthFromCssClass(class_list,"base.css");
        console.log("get width of " + width);
        // need to add border - assume 1px;
        // and add any padding on td
        var padding=Harvey.Utils.getCssValue(".grid table td","padding","base.css");
        console.log("padding is " + padding);
        var pp=0;
        if(padding !== null){
            var b=padding.split(" ");
            if(b.length === 2){
                if(b[1].indexOf("em")>=0){
                    var p=b[1].split("em");
                    pp=p[0]*2;
                }
            }
        }
        console.log("pp is " + pp);
        if(width !== null){
            var b=class_list.length;
            if(width.indexOf("px")>=0){
                var d=width.split("px");
                width=((parseFloat(d[0])+b+2).toString() + "px");
            }
            else if(width.indexOf("em")>=0){
                var d=width.split("em");
                width=((parseFloat(d[0])+ parseFloat((b+2)/13)+ parseFloat(pp*b)).toString() + "em");
            }
            if(pp){
                for(var i=0;i<cols.length;i++){
                    if(cols[i].display !== false){
                        var v=((parseFloat(class_list[i].value) + pp).toString() + class_list[i].units).toString();
                        console.log("setting width to " + v);
                        cols[i].element.style.width=v;
                     }
                }
            }
        }
        return width;
    };

    function rmouse_popup(element){

	element.bind("contextmenu", function(e){
	    var x,y;
	    x=e.pageX;
	    y=e.pageY;
	    log("got mouse co-ords x " + x + " y " + y);
	    if(e.which === 3){
                //		alert("right mouse button");
		var p=$(this).parent().position();
		x=x-Math.floor(p.left);
		y=y-Math.floor(p.top);
		log("NEW mouse co-ords x " + x + " y " + y);
		log("parent position is " + p.top + " " + p.left);
		var d=$(this).parent().find('#grid_popup');
		if(d && d.length>0){
		    d.css({'position': "absolute",'top':(y + "px"), 'left': (x + "px")});
		}
		else {
		    var d=$("<div class='popup' id='grid_popup'> </div>").css({'position': "absolute",'top':(y + "px"), 'left': (x + "px")});
		    var cc=$("<div></div>").css({'width': '100px','height': '100px','background':'#101010'});

		    d.append(cc);
		    var ok=$("<button class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'>  OK  </span> </button>");
		    var cancel=$("<button class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'> Cancel </span> </button>");
		    d.append(ok);
		    d.append(cancel);
		    $(this).parent().append(d);

		    var cb=function(that){
			return function(e){
			    e.stopPropagation();
			    //func(that.textarea.val());
			};
		    }(this);
		    var bb=function(d){
			return function(e){
			    e.stopPropagation();
			    d.remove();
			  //  delete d; // remove all references
			    //console.log("cancel is here");
			};
		    }(d);
		    ok.on("click",cb);
		    cancel.on("click",bb);
		}
		d.focus();
	    }
	    return false;
	});
    }

    function stop_edits(that){
	 if(that.DEBUG) console.log("stop allowing edits");
	that.allowEdit=false;
    }

    function start_edits(that){
	 if(that.DEBUG) console.log("start allowing edits");
	that.allowEdit=true;
    }

    function update_column(that,val,update){
	var p,cell;
	if(that.cellEdit){
	    console.log("undo_cellEDIT: text in restore is " + val);
	    if(that.selection_list){
		for(var i=0;i< that.selection_list.length;i++){
		    console.log("value was " + that.selection_list[i].textContent);
		    if(update){
			p=that.selection_list[i].data["harvey"];
			cell=that.rows[p.row][that.cols[p.col].name];
			cell.setValue(val);
		    }
		     // just remove the class
		    that.selection_list[i].classList.remove("ui-selected");
		}
	    }
	    else{
		that.cellEdit.setValue(val);
		that.cellEdit=null;
	    }
	}
    }


    function do_edit(e,that){
	if(that == null){
	    throw new Error("that is null");
	}
	if(!that.allowEdit) {
	    console.log("Not allowing editing " + that.allowEdit);
	    return;
	}
	if(that.selection_list.length === 0){
	    return;
	}
	// select the last in the column and make it active
	var cell=that.selection_list[that.selection_list.length-1];
	if(!cell){
	    throw new Error("grid cell is null");
	}

	if( that.cellEdit &&  that.cellEdit.getElement() === cell){
	     console.log("already editing this" + cell);
	    return;
	}
	that.cellEdit=cell.data("harvey").context;

	if(that.cellEdit === null){
	    console.log("cell is null");
	    throw new Error("cell is null");
	}
	console.log("do_cell edit got  " + that.selection_list.length + " number of cells");
	var type=that.cellEdit["type"];
	if(!type){
	    throw new Error("edit cannot find field type");
	}
	var old_value=that.cellEdit.getValue();
	console.log("cell has value " + old_value + " and type " + type);
	// convert to html type

	var n=that.cellEdit.html_type;

	// if the col has options then it is a selectField
	//if( that.cellEdit.options){ //horrible
	//  n="SelectField";
	//}
	var input=that.cellEdit.input.detach();
	that.cellEdit.getElement().empty();
	that.cellEdit.getElement().append(input);
	that.cellEdit.setValue(old_value);
	that.cellEdit.input.show();


	if(that.cellEdit.popup){
	    console.log("popup is here for " + n);
	    var d=$("<div class='popup' id='grid_popup'> </div>");
	    that.field=Harvey.field[n](that.cellEdit.data["harvey"],d);
	    that.cellEdit.getEelement().append(d);
	    var ok=$("<button class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'>  OK  </span> </button>");
	    var cancel=$("<button class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'> Cancel </span> </button>");
	    d.append(ok);
	    d.append(cancel);
	    that.field.element.focus();
	    that.field.editor(edit_callback,ok,cancel);
	}
	else{
	    that.cellEdit.editor(edit_callback);
	    that.cellEdit.input.focus();
	   // that.cellEdit.input.off("focus");
	}

	function edit_callback(value){
	    console.log("edit_callback got value " + value);
	    if(value === null){
		// restore the original value
		update_column(that,old_value,false);
		return;
	    }
	    if(that.cellEdit.checkValue()){  // check that there is a real value
		update_column(that,value,true);
	    }
	    else{
		Harvey.display.dialog("Invalid Input","Incorrect type for this field should be a " + type);
	    }
	}


    }


    function sort_callback(col_num,that,dir){ //user sort
	// turn it into an array
	//$.fn.reverse=[].reverse;

	var type=that.cols[col_num].type;
	if(that.DEBUG) console.log("START SORT =======================  got sort type " + type);

	stop_edits(that);

	for(var k in that.grids){
	    Harvey.sort(that.grids[k].rows,{ type: type,
			                     fn: function(a){ return a[col_num];}
                                           });
            
	    if(dir === "down"){
		that.grids[k].rows.reverse();
	    }
	    that.redrawRows(k);
            that.grids[k].sorted=true;
	}

	for(var i=0;i<that.cols.length;i++){
	    that.cols[i].sorted=false;
	}
	that.cols[col_num].sorted=true;


	start_edits(that);
    }

    function sort_into_subGrids(that){
	if(that.rows){
	    console.log("sort_into_subGrids got that.rows length " + that.rows.length);
	}
	// see if the data has been put into subgrids
	if(that.rows && Harvey.checkType["array"](that.rows)){ // not sorted into subgrids
	    var n,tg,subgrid= new Object;
	    if(that.groupBy){
		for(var i=0;i<that.rows.length;i++){
		    n=that.rows[i][that.groupBy].toString();
		    if (!subgrid[n]){
			subgrid[n]={};
			subgrid[n].name = that.rows[i][that.groupBy];
			subgrid[n].rows = new Array;
		    }
		    subgrid[n]["rows"].push(that.rows[i]); 
		}
                that.rows.length=0; //
	    }
	    else{
                subgrid["all"]=new Object;
		subgrid["all"].rows=that.rows;
	    }
	    that.grids=new Array;
	    var i=0;
	    for(var k in subgrid){
		that.grids[i]=subgrid[k];
		i++;
	    }
	}
       	// that.rows.length=0; // delete rows array
	if(!that.grids){
	    throw new Error("Harvey.display.grid: no rows or grids in " + that.id);
	}
    }




    var HarveyMakeGrid=function(options,win){
	var DEBUG=true;
	var that=this,found,not_found=[];

       	Harvey._DisplayBase.call(this,options,win);  //use class inheritance - base Class
	this.selection_list=[];
	this.cellEdit=null; // cell currently being edited- this is of type Harvey.field
	this.allowEdit=true;  // are edits allowed?
 
	if(this.sortOrder && this.userSortable){
	    throw new Error("Cannot specify both sortOrder and sortable");
	}
        if(this.cols === undefined || this.cols.length === 0){
            throw new Error("DisplayGrid: need to supply a least one column");
        }
        if(this.uniqueKey){
       //     console.log("this,uniquekey length is " + this.uniqueKey.length);
            this.sortOrderUnique=true;
            if(this.sortOrder){
            //    console.log("MakeGrid sortOrder length is " + this.sortOrder.length);
                // to determine the absolute ordering is unique
                // uniqueKey must be a subset of sortOrder
                for(var i=0;i<this.uniqueKey.length;i++){
                    found=false;
                    for(var j=0;j<this.sortOrder.length;j++){
                        if(this.uniqueKey[i] == this.sortOrder[j]){
                            found=true;
                        }
                    }
                    if(!found){
                    //    console.log("not found was " + this.uniqueKey[i]);
                        not_found.push(this.uniqueKey[i]);
                    }
                }
               // if(found !== this.uniqueKey.length){
                for(var i=0;i<not_found.length;i++){
                   // console.log("not found is pushing " + not_found[i]);
                    this.sortOrder.push(not_found[i]);
                }
               // }
               // console.log("After MakeGrid sortOrder length is " + this.sortOrder.length);
            }
        }
        
  
        this.execute();
    };


    HarveyMakeGrid.prototype={

	select_data: function(){
	    var that=this;
	 /*   return{
		selected: function(event,ui){
		    console.log("selected is here");
		    for(var k in ui){
			console.log("got key " + k + " value " + ui[k]);
			that.selection_list.push(ui[k]);
		    }
		},
		selecting: function(event,ui){
		    if(that.current_index === null){
			that.current_index=$(ui["selecting"]).index();
			return;
		    }
		    if( $(ui["selecting"]).index() !== that.current_index){
			console.log("undo selecting " );
			$(ui["selecting"]).removeClass("ui-selecting");
		    }
		},
		start: function(event,ui){
		    that.selection_list.length=0; // empty out the selection list
		    that.current_index=null;
		    console.log("start got " + event.target);

		    console.log(" cellEdit is " + that.cellEdit);
		    if(that.cellEdit !== null){   // moved focus without updating cell
			var old_value=that.cellEdit.getValue();
			console.log("value in field is " +  old_value);
			if(that.cellEdit.checkValue(old_value)){
			    console.log("setting text to cellEdit value " + old_value);
			    update_column(that,old_value,false);
			}
			// else text=null;
			// update_column(that,old_value,true);
		    }

		},
		stop: function(event,ui){
		    console.log("stop event is here");
		    if(that.cellEdit){
			console.log("cellEdit is here");
		    }
		    else {
			console.log("cellEdit is null");
		    }
		    //make_cellEdit(event,that);
		    do_edit(event,that);
		    //		that.selection_list.length=0;
		},
		filter: ".editable"
		// filter: 'td:not(:first-child)'
	    }; */
	},
	sort: function(grid){
	    var isSortable=false,grids=[],sortOrder=[];
           
            if(this.sortOrder){
                console.log("this.sortOrder.length is " + this.sortOrder.length);
                sortOrder=this.sortOrder.slice();
            }
            else if(this.uniqueKey){
                sortOrder[0]=this.uniqueKey;
            }
	    if(sortOrder.length > 0){
		var ar=[],t,s;
                console.log("sortOrder.length is " + sortOrder.length);
		for(var i=0; i< sortOrder.length; i++){
                    console.log("this is sortOrder " + sortOrder[i]);
		    t=this.getColIndex(sortOrder[i]);
		    console.log("col index is " + t);
		    s=this.sortOrder[i];  // name of the column in the row
		    console.log("name is " + s);
		    if(this.cols){
			ar.push({type: this.cols[t].type,
				 fn:(function(s){
				     return function (a){
					 return  a[s]; };
				 })(s)
				});
		    }
		    this.cols[t].sorted=true;
		}
                isSortable=true;
	    }
	    if(isSortable){
                if(grid){
                    grids[0]=grid;
                }
                else{
                    grids=this.grids;
                }
		for(var j=0;j<grids.length;j++){
		    Harvey.sort(grids[j].rows,ar);
                    grids[j].sorted=true;
		}
	    }
	},
        addGrid:function(grid){
            var div_container,div,h;
	    var name=grid.name;
	    var rows=grid.rows;
            div=document.createElement("div");
            div.classList.add("inner_table");
	    if(name !== undefined){
	        div.id=name;
                h=document.createElement("h4");
                h.classList.add("ui-widget-header");
                h.textContent=name;
                div.appendChild(h);
	    }
	    
	    var table=document.createElement("table");
            table.style.width=this.element.style.width;
	    div.appendChild(table);
	    //var body=$("<tbody class='selectable'></tbody>");
	    var body=document.createElement("tbody");//$("<tbody class=''></tbody>");
	    table.appendChild(body);
            div_container=this.element.getElementsByClassName("grid_content")[0];
	    div_container.appendChild(div);
            grid.element=div;
        },
        addCol:function(col){
            var that=this,index,r,t,rows;
            if(Harvey.checkType["integer"](col)){
                index=col;
                col=this.cols[index];
                if(!col.name || !col.type){
                    throw new Error("column must have type and name");
                }
            }
            else{ // adding a column after creation
                if(!col.name || !col.type){
                    throw new Error("column must have type and name");
                }
                index=this.getColIndex(col.name);
                if(index<0){
                    index=this.cols.length;
                    this.cols[index]=col;
                }
                else{
                    throw new Error("Columns must have unique names");
                }
            }
            // col.options=$.extend({},col);  // keep a copy of the original parms- so not to copy crap into rows;
            col.options={};
            for(var k in col){
                col.options[k]=col[k];
            }
             if(this.grids){ // add the column rows
                for(var i=0;i<this.grids.length;i++){
                    rows=this.grids[i].rows;
                    if(rows){
                        for(var j=0;j<rows.length;j++){
                            t=Object.keys(rows[j])[0];
                            r=rows[j][t].element.parentNode;
                            rows[j][col.name]=null;
                            this._addCell(rows[j],col,r);
                        }
                    }
                }
            }
	    if(this.cols[index].display !== false){
		if(this.DEBUG) console.log("grid col " + this.cols[index].name);
		var label=(this.cols[index].label)?this.cols[i].label:this.cols[index].name;
	        //	var h=$("<th class='ui-state-default " +  this.cols[index].type + "' type= '" + this.cols[index].type + "'> " + label + " </th>");
                //  var h=document.createElement("th");
                var h=document.createElement("div");
                var s=document.createElement("soan");
                h.appendChild(s);
                h.classList.add(this.cols[index].type);
                h.type=this.cols[index].type;
                s.textContent=label;
		this.cols[index].element=h;
		this.cols[index].sortable=Harvey.isSortable(this.cols[index].type);
		if(this.cols[index].sortable && this.userSortable){
		    //  var dec=$("<div class='arrows'></div>");
                    var dec=document.createElement("div");
                    dec.classList.add("arrows");
		    //  var up=$("<span class='up ui-icon ui-icon-triangle-1-n '></span>");
                    var up=document.createElement("span");
                    up.classList.add("up","ui-icon","ui-icon-triangle-1-n");
		    //  var down=$("<span class='down ui-icon ui-icon-triangle-1-s '></span>");
                    var down=document.createElement("span");
                    down.classList.add("down","ui-icon","ui-icon-triangle-1-n");
		    dec.appendChild(up);
		    dec.appendChild(down);
		    h.appendChild(dec);

		    up.addEventListener("click",function(col_num,that){
			return function(e){
                            e.stopPropagation();
                            e.preventDefault();
                            console.log("got that.cols " + that.cols[col_num].name);
			    sort_callback(col_num,that,"up");
			};
		    }(i,that),false);  // col is + 1 for first row outside for loop +1 for index starts at 1 -
		    down.addEventListener("click",function(col_num,that){
			return function(e){
                            e.stopPropagation();
                            e.preventDefault();
                            console.log("got that.cols " + that.cols[col_num].name);
			    sort_callback(col_num,that,"down");
			};
		    }(index,that),false);
		    
		    h.addEventListener("mouseover",function(e){
                        e.stopPropagation();
		        e.target.classList.add('ui-state-hover');
                    }, false);
		    h.addEventListener("mouseout",function(e){
                        e.stopPropagation();
			e.target.classList.remove('ui-state-hover');
                    }, false);
                }
 		this.colElement.appendChild(h);
		if(this.cols[index].hidden){
		    h.visibility="hidden";
		}
	    }
        },
        deleteCol:function(name){
            var el,index=this.getColIndex(name);
            if(index>0){
                //check that the col is not used as unique key or sortOrder
                for(var i=0;i<this.sortOrder.length;i++){
                    if(this.sortOrder[i] == name){
                        throw new Error("Cannot delete col used for sorting");
                    }
                }
                // remove the associated rows
                for(var i=0;i<this.grids.length;i++){
                    for(var j=0;j<this.grids[i].rows.length;j++){
                        el=this.grids[i].rows[j][name].getElement();
                        el.parentNode.removeChild(el);
                        el=null;
                        delete this.grids[i].rows[j][name];
                    }
                }
                // remove the original data copied into col.options
                this.cols.splice(index,1);
            }
            else{
                throw new Error("cannot find column " + name);
            }
        },
	getColIndex: function(name){
	    for(var i=0; i< this.cols.length;i++){
		if (this.cols[i].name === name){
		    return i;
		}
	    }
	    return -1;
	},
	getCol: function(name){ //grid_name){
	    // console.log("getting columns");
	    var index=-1,col=new Array;
            if(name !== undefined){
	        for(var i=0;i< this.cols.length;i++){
	            //	console.log("col is " + this.cols[i].name);
		    if(this.cols[i].name == name){
		        return(this.cols[i]);
		    }
	        }
      	    }
            return this.cols;
 	},
	execute:function(){
            var rows,body,r,that=this;
            // var t0=performance.now();
            this.element=document.createElement("div"); 
            this.element.id=this.id;
            this.element.classList.add("grid","ui-widget","ui-state-default");
            // make the header
            this.colElement=document.createElement("div");
            this.colElement.classList.add("head");
            this.element.appendChild(this.colElement);

            var div_container=document.createElement("div");
            div_container.classList.add("grid_content");

            if(this.resizable){
                this.element.classList.add("resizable");
            }
            this.element.appendChild(div_container);
            //body.selectable(this.select_data()); // allow multiple cells to be selected
	    for(var i=0; i< this.cols.length; i++){
                this.addCol(i);
            }
            // div_container.style.width=width;
            var width=getWidth(this.cols);
            if(width !== null){
                this.element.style.width=width;
            }
            
            if(this.rows !== undefined){
                sort_into_subGrids(this);
                this.sort();
	        for(var i=0;i<this.grids.length;i++){
                  //  console.log("this is grid " + i);
                    this.addGrid(this.grids[i]);
                    body=this.grids[i].element.getElementsByTagName("tbody")[0]; //.find("tbody");
                    rows=this.grids[i].rows;
                //    console.log("grid has " + rows.length + " number of rows");
                    for(var j=0;j<rows.length;j++){
                      //  console.log("adding row");
                        r=document.createElement("tr");
                        for(var k=0;k<this.cols.length;k++){
                         //   console.log("adding cell");
                            this._addCell(rows[j],this.cols[k],r);
                        }
                        body.appendChild(r);
                    }
                }
            }
            if(this.sortOrder){
                console.log("End of execute this.sortOrder length is " + this.sortOrder.length);
            }
   
   	},
        _addCell:function(row,col,r){
            var c,type,settings={};
            
	    //settings=$.extend({},col.options);
            for(var k in col.options){
                settings[k]=col.options[k];
            }
            if(row[col.name] === undefined){  // row[col_name] can be null
                if(this.required === true){
                    
                    throw new Error("Field " + col.name + "is required");
                }
                row[col.name]=null;
            }
	    //console.log("value is " + row[col_name]);
	    settings.value=row[col.name];
            
	    c=document.createElement("td");
            c.className=col.type;
            //c=$(c);
            //console.log("c is " + JSON.stringify(c));
            row[col.name]=Harvey.field[Harvey.dbToHtml[col.type].field](settings,c);
            if(col.display !== false){
		r.appendChild(row[col.name].element);
                
	        //	$(row[col.name].element).data('harvey',{name: col.name,"context": row[col.name],"type": col.type});
                row[col.name].element.data={};
                row[col.name].element.data.harvey={name: col.name,"context": row[col.name],"type": col.type};
	    }
	    if(col.hidden){
		row[col.name].element.visibility="hidden";
	    }
        },
        addRow: function(row_data){
	    var row=null,r,grid,name,l,t,sortOrder=[],e;
            var closest={val:-1};
	    if(this.groupBy){
                if(row_data[this.groupBy] === undefined){
		    throw new Error("no field in row data matches " + this.groupBy);
		}
                name=row_data[this.groupBy];
	    }
	    else{
                name="all";
	    }
            grid=this.getGrid(name);
            console.log("addRow grid is " + grid);
            if(grid===null || grid === undefined){  // create a new grid
                console.log("creating grid");
                if(this.grids){
                    l=this.grids.length;
                }
                else{
                    this.grids=[];
                    l=0;
                }	
                this.grids[l]={name:name,rows:[]};
                this.addGrid(this.grids[l]);
                grid=this.grids[l];
                
            }
	    if(grid.sorted ){
               // console.log("addRow calling getRow length is " + this.sortOrder.length);
                row=this.getRow(row_data,name,closest);
                if(row!==null){
                    throw new Error("row already exists");
                }
	    }
            r=document.createElement("tr");
	    for(var i=0;i<this.cols.length;i++){
                this._addCell(row_data,this.cols[i],r);
            }
         
            if(!grid.sorted){
                console.log("adding row to end");
                grid.rows.push(row_data);
                grid.element.getElementsByTagName("tbody")[0].appendChild(r);//.find("tbody").append(r);
            }
            else{
              //  console.log("grid element is %j ", closest.val);//grid.rows[index]);
              //  console.log("slosest index is " + closest.index);
                t=Object.keys(grid.rows[closest.index])[0];
              //  console.log("key is " + t);
                if(closest.dir === "after"){
                    closest.index++;
                    //grid.rows.splice(closest.index,0,row_data); //insert row
                    // grid.rows[closest.index][t].element.parent().after(r); // insert the element
                    e= grid.rows[closest.index][t].element;
                    
                    e.parentNode.insertBefore(e,r.nextSibling); // insert after r
                    grid.rows.splice(closest.index,0,row_data); //insert row
                }
                else{
                    // grid.rows.splice(closest.index,0,row_data);
                    e=grid.rows[closest.index][t].element;
                    e.parentNode.insertBefore(r,e); // insert the element
                    grid.rows.splice(closest.index,0,row_data);
                }
            }
            return row_data;
        },
        deleteRow:function(key,group){
            var closest={},g,parent,el;
            var row=this.getRow(key,group,closest);
            if(row === null){
                throw new Error("deleteRow: cannot find row ");
            }
            if(group!==undefined){
                g=this.getGrid(group);
            }
            else if(this.groupBy && key[this.groupBy]){
                g=this.getGrid(key[this.groupBy]);
            }
            else{
                g=this.grids[0];
            }
            if(g===null){
                throw new Error("Cannot find group");
            }
            // remove from dom
            for(var i=0;i<this.cols.length;i++){
                console.log("deleting col " + this.cols[i].name);
                if(!row[this.cols[i].name]){
                    throw new Error("row is undefined");
                }
                if(!parent){
                    parent=row[this.cols[i].name].getElement().parentNode;
                }
                if(this.cols[i].display !== false){
                    el=row[this.cols[i].name].getElement();
                    el.parentNode.removeChild(el);
                    el=null;
                }
            }
            parent.parentNode.removeChild(parent);
            g.rows.splice(closest.index,1);
        },
        getRow:function(key,group,closest){
            var grid=[],row,sortOrder=[];
            if(!closest && this.sortOrderUnique !== true){
                throw new Error("No unique key to find row");
            }
            if(group && group !== null){
                grid[0]=this.getGrid(group);
            }
            else{
                if(this.groupBy && key[this.groupBy] ){
                    grid[0]=this.getGrid(key[this.groupBy]);
                    if(!grid[0]){
                        throw new Error("Cannot find grid " + this.groupBy);
                    }
                }
                else{
                    grid=this.grids;
                }
            }
            //console.log("getRow this.sortOrder length is " + this.sortOrder.length);
            for(var i=0;i<grid.length;i++){
               // console.log("searching grid ",grid[i].name);
                if(grid[i].sorted){
                    if(this.closest){
                        if(this.sortOrder === undefined){
                            for(var k=0; k<this.cols.length;k++){
                                if(this.cols[k].sorted=== true){
                                    sortOrder.push(this.cols[k].name);
                                }
                            }
                        }
                    }
                    else{
                        sortOrder=this.sortOrder;
                        for(var j=0;j<sortOrder.length; j++){
                            if(key[sortOrder[j]] === undefined || key[sortOrder[j]]===null){
                                throw new Error("getRow: key is not unique needs " + this.sortOrder[j] );
                            }
                        }
                        for(var j=0;j<grid[i].rows.length;j++){
                            for(k=0;k<this.cols.length;k++){
                                var v=this.cols[k].name;
                                //console.log("val is " + grid[i].rows[j][v].getValue());
                            }
                        }
                    }
		    row=Harvey.Utils.binarySearch(grid[i].rows,sortOrder,key,closest);
                    if(row){
                        return row;
                    }
                }
                else{
                     throw new Error("grid is not sorted");
                }
            }
            return null;
        },
	updateRow: function(cell_data){
	    var row,subGrid,index,g;
	    if(this.groupBy){
		g=cell_data[this.groupBy];
		if(g === undefined){
                    throw new Error("No subGrid called " + this.groupBy + " in cell update data " + g);
		}
	    }
	    var grid=this.getGrid(g);
            if(grid.sorted){  // grids have a sort order and have been sorted
                row=this.getRow(cell_data,g);
                if(row === null){
	            throw new Error("UpdateRow: cannot find row");
                }
	    }
	    else{
		// use a dumb way of finding this....
		throw new Error("No method available to find this cell");
	    }
	  //  console.log("UpdateRow: found row %j" ,row);
	    if(row){   // need to check that we are not overwritting a sortOrder key, making sort invalid
		var to,cell;
		for(var k in cell_data){               
 		    row[k].setValue(cell_data[k]);
                    var cl="cell_updated";
		    if(row[k].display !== false){
                        cell=row[k].getElement();
			if(cell.classList.contains(cl)){  // add colours to the cells to show update frequency
			    cell.classList.remove(cl);
                            cell.classList.add("cell_updated_fast");
			    cl="cell_updated_fast";
			}
			else{
			    row[k].getElement().classList.add(cl);
			}
			if(to){ clearTimeout(to);}
			to=setTimeout(function(){
			    row[k].getElement().classList.remove(cl);},15000);
		    }
		}
	    }
	    else{
		throw new Error("No matching entry found in grid data");
	    }
	},
	getGrid: function(name){
            if(!this.grids){
                return null;
            }
	    else if(this.grids.length === 1 ){
		return this.grids[0];
	    }
            if(name !== undefined){
	        for(var i=0;i<this.grids.length;i++){
		    if(this.grids[i].name == name){
		        return this.grids[i];
		    }
	        }
	        return null;
            }
            return this.grids;
	},
	deleteAll:function(){
            var el,parent,row;
            for(var i=0;i<this.grids.length;i++){
                this.grids[i].element.parentNode.removeChild(this.grids[i].element);
                for(var j=0;j<this.grids[i].rows.length;j++){
                    row=this.grids[i].rows[j];
                    for(var k=0;k<this.cols.length;k++){
                        el=row[this.cols[k].name].getElement();
                        if(k===0){
                            parent=el.parentNode;
                        }
                        parent.removeChild(el);
                    }
                    parent.parentNode.removeChild(parent);
                }
                this.grids[i].rows.length=0;
            }
            this.grids.length=0;
        },
	showGrid: function(name){
            var g;
            var p=this.element.querySelector("div.grid_content");
	    if(this.grids.length === 1 || name === undefined){
		name="all";
	    }
	    //console.log("show grid is here");
	    for(var i=0; i< this.grids.length;i++){
                g=this.grids[i];
                if(document.contains(this.grids[i].element)){
		    p.removeChild(g.element);
                }
		if(g.name == name || name == "all"){
                    if(!document.contains(g.element)){
		       p.appendChild(g.element);
                    }
		}
	    }
	},
	hideGrid: function(name){
	    if(this.grids.length === 1){
		name="all";
	    }
	    for(var i=0; i< this.grids.length;i++){
		if(this.grids[i].name == name || name == "all"){
		    this.grids[i].element.visibility="hidden";
		}
	    }
	},
	redrawRows: function(grid_name){
	    if(!grid_name){
		if(this.grids.length === 1){
		    grid_name="all";
		}
		else{
		    throw new Error("redrawRows: must specify the grid group name");
		    return null;
		}
	    }
	    var b=this.grids[grid_name].element.getElementsByTagName("tbody")[0];
	    b.innerHTML="";

	    for(var i=0; i<this.grids[grid_name].rows.length; i++){
		b.appendChild(this.grids[grid_name].rows[i].element);
	    }
	},
        getRowFromElement: function(element){  
            var s,row=[];
            var c=element.data.harvey;
            //element.data.harvey={name: col.name,"context": row[col.name],"type": col.type};
            console.log("name is " + c.name + " context " + c.context + " type " + c.type);
            row.push({context:c.context,name: c.name,
                      value:c.context.value });
            //s=$(element).siblings();
            s=element.parentNode.childNodes;
            console.log("got siblings " + s.length);   
            for(var i=0;i<s.length;i++){
                if(s[i] !== element){
                    //c= $(s[i]).data("harvey");
                    c=s[i].data.harvey;
                    console.log( "sib " + c.name + " value " + c.context.value);
                    row.push({context: c.context,name: c.name,
                              value: c.context.value });
                }
            }
            return row;
        }, 
        getJSON: function(){
            var c,t,m;
            var n={rows:[]};
            for(var i=0;i<this.grids.length; i++){
                m=this.grids[i].rows.length;
                for(var j=0;j<m;j++){
                    t=i*m+j;
                    n.rows[t]={};
                    for(var k=0;k<this.cols.length;k++){
                        c=this.cols[k].name;
                        n.rows[t][c]=this.grids[i].rows[j][c].value;
                    }
                }
            }
            return n;
        },
	submit: function(row,field_name){
	    var cols,rk,rv;

	    var jsq=this.submitDefaults;
	    jsq.type="POST";

	    if(row && field_name){
		if(this.uniqueKey){
		    rk=(row[this.uniqueKey].name).toString();
		    rv=(row[field_name].name).toString();
		    jsq.data.push({rk: row[this.uniqueKey].getValue(),
			       rv: row[field_name].getValue()});
		}
		else{
		    for(var i=0;i<row.length;i++){
			rk=row[i].name;
			jsq.data.push({rk: row[i].getValue()});
			console.log("value is " + row[i].getValue());
			console.log("key is " + row[i].name);
		    }
		    return;
		}
	    }
	    else { // submit the whole thing

	    }
	    if(this.DEBUG) console.log("jsq is " + JSON.stringify(jsq));

	    var submit_promise=Harvey.ajax.jsq(jsq,{url:"/JSQ/cbm",
						    type:"POST",
						    dataType:'json',
						    contentType:"application/json"});


	    submit_promise.done(function(that,p){
		return function(jq,textStatus){
		    if(this.DEBUG) console.log("Form.submit: promise success");
		    if(textStatus === "success"){
			if(this.DEBUG) console.log("Form.submit: deferred-resolve");
			Harvey.display.dialog(that.options.action + " of " +  that.template, p.name + " has been successfully committed to the Database");
	    		// var cmd=that.getCreator().getCmd(that);

			// cmd.undo();
			//var crt=that.getCreator().find({"command": cmd})
			// crt.element.removeClass("selected");
			// that.getCreator().getCmd(that).undo();

		    }
		    else{
			if(this.DEBUG) console.log("Form.submit: deferred-reject");
			//	deferred.reject();
		    }
		};
	    }(this,jsq.properties));

	    submit_promise.fail(function(jq, textStatus){
		console.log(" textStatus is " + textStatus);
		var msg=("callback Fail- status  " +  jq.status + "  "+ jq.statusText + " "  + jq.responseText );
		Harvey.display.dialog("Update Failed",msg);
		// highlight from components which were not accepted
		if(this.DEBUG) console.log("grid.submit: failed to commit to db");
	    });
	}
    };


    Harvey.Utils.extend(HarveyMakeGrid,Harvey._DisplayBase);

    //  $.extend(true, Harvey, {
    Harvey.mixinDeep( Harvey,{
	display: {
	    grid: function(opts,win){
                    opts.display="grid";
                    return new HarveyMakeGrid(opts,win);
            },
            gridMethods:function(){
                var ar=[];
                for(var k in HarveyMakeGrid.prototype ){
                    ar.push(k);
                }
                return ar;
            }
	}
    });

})();
