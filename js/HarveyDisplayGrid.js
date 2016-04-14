var Harvey = require('./declare.js').Harvey, UI = require('./declare.js').UI;

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
      subGrid: { groupby: some column name},

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


;(function($){
    // special functions for aligning the decimal points in non-editable cells
   /* var mk_aligned_float=function(cell){ // align to decimal point
        var p=[];
        var p=parseFloat(cell.value).toFixed(cell.precision).toString().split(".");
        if (!cell.value){
            p[0]="";
            p[1]="";
        }
	cell.element.append("<span class='float_left'>" + p[0] + "</span>");

	if (p.length >= 2){
	    cell.element.append("<span class='float_right'> ." + p[1] + "</span>");
	}
	else{
	    cell.element.append("<span class='float_right'> .00  </span>");
	}


    };
    var set_aligned_float=function(val){

        var p=parseFloat(cell.value).toFixed(cell.precision).toString().split(".");
        this.element.find("span.float_left").html(p[0]);
        if (p.length >= 2){
            this.element.find("span.float_left").html(p[1]);
	}
	else{
	    this.element.find("span.float_left").html(".00");
	}
    };
    */
    // end special functions

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
			    delete d; // remove all references
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
		    console.log("value was " + $(that.selection_list[i]).text());
		    if(update){
			p=$(that.selection_list[i]).data("harvey");
			cell=that.rows[p.row][that.cols[p.col].name];
			cell.setValue(val);
		    }
		     // just remove the class
		    $(that.selection_list[i]).removeClass("ui-selected");
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
	var cell=$(that.selection_list[that.selection_list.length-1]);
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
	    that.field=Harvey.field[n](that.cellEdit.data("harvey"),d);
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


    function sort_callback(col_num,that,dir){
	// turn it into an array
	$.fn.reverse=[].reverse;

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
	}

	for(var i=0;i<that.cols.length;i++){
	    that.cols[i].sorted=false;
	}
	that.cols[col_num].sorted=true;
	this.sorted=true;

	start_edits(that);
    }

    function sort_into_subGrids(that){
	if(that.rows){
	    console.log("sort_into_subGrids got that.rows length " + that.rows.length);
	}
	// see if the data has been put into subgrids
	if(that.rows && Harvey.checkType["array"](that.rows)){ // not sorted into subgrids
	    var n,tg,subgrid= new Object;
	    if(that.subGrid){
		var groupBy=that.subGrid.groupBy;
		for(var i=0;i<that.rows.length;i++){
		    n=that.rows[i][groupBy].toString();
		    if (!subgrid[n]){
			subgrid[n]={};
			subgrid[n].name = that.rows[i][groupBy];
			subgrid[n].rows = new Array;
		    }
		    subgrid[n]["rows"].push(that.rows[i]);
		}
	    }
	    else{
                subgrid["all"]=new Object;
		subgrid["all"].rows=that.rows;
	    }
	   // that.rows.length=0; // delete rows array
	    that.grids=new Array;
	    var i=0;
	    for(var k in subgrid){
		that.grids[i]=subgrid[k];
		i++;
	    }
	}
        that.rows.length=0; //
	if(!that.grids){
	    throw new Error("Harvey.display.grid: no rows or grids in " + that.id);
	}
    }




    var HarveyMakeGrid=function(options,win){
	var DEBUG=true;
	var that=this;

	Harvey._DisplayBase.call(this,options,win);  //use class inheritance - base Class
	this.selection_list=[];
	this.cellEdit=null; // cell currently being edited- this is of type Harvey.field
	this.allowEdit=true;  // are edits allowed?

	if(this.sortOrder && this.userSortable){
	    throw new Error("Cannot specify both sortOrder and sortable");
	    return null;
	}

    };


    HarveyMakeGrid.prototype={

	select_data: function(){
	    var that=this;
	    return{
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
	    };
	},
/*	show: function(){
	    console.log("Grid show is here ");
	    if(this.element && this.element.length>0){
		console.log("show found non null element");
		if(this.DOM && this.DOM.length > 0){

		    this.DOM.append(this.element).promise().done((function(that){
			// this only  works when the element is actually displayed in the DOM
			var width=0;
			for(var i=0;i<that.cols.length; i++){
			    if(that.cols[i].display !== false){
				width+=that.cols[i].element.outerWidth(true);
			    }
			    console.log("width is " + width);
			}
                        width=(width + "px").toString();
                        that.element.width(width);
		    })(this));
		}
	    }
	    else {
		console.log(" --- invalid element");
		throw new Error("No valid element for " + this.getKey());
		return null;
	    }

	   if(this.listen !== undefined){
		Harvey.listen(this);  // needs to be here cause listener needs element.
	    }

	    if(this.publish !== undefined){
		console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj Publish 99999999999999999999999999999");
		Harvey.publish(this);
	    }
	    else{
		console.log("NO PUBLISH NO PUBLISH NO PUBLISH for " + this.id);
	    }

	}, */
	_mkRowLookUp: function(grid){
	    if(!this.uniqueKey){
		throw new Error("Cannot make Row Lookup without a unique key");
	    }
	    if(grid.rowPos){
		delete grid.rowPos;
	    }
	    grid.rowPos=new Object; // keep a record of which row the element is in the grid
	    for(var i=0;i<grid.rows.length; i++){
		var n=(grid.rows[i][this.uniqueKey]).toString();
		grid.rowPos[n]=i;
	    }

	},
	sort: function(){
	    var isSortable=true;
	    if(this.sortOrder){
		var ar=[],t,s;
		for(var i=0; i< this.sortOrder.length; i++){
		    t=this.getColIndex(this.sortOrder[i]);
		    //		console.log("col index is " + t);
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
	    }
	    else if(this.uniqueKey){
		var type = this.cols[this.getColIndex(this.uniqueKey)].type;
                var col_num=this.getColIndex(this.uniqueKey);
		var ar={ type: type,
			 fn: function(a){ return a[col_num].value;}
		       };

	    }
	    else{
		isSortable=false;
	    }
	    if( isSortable){
		for(var j=0;j<this.grids.length;j++){
		    Harvey.sort(this.grids[j].rows,ar);
		    if(this.uniqueKey){ // create the lookup table
			this._mkRowLookUp(this.grids[j]);
		    }
		}
		this.sorted=true;
	    }

	},
	execute:function(){

	    sort_into_subGrids(this);
	    this.sort();
            var that=this;
 	    var t0=performance.now();
	   // var is_static=true;
            // is this grid static?
       /*     for(var i=0;i<this.cols.length;i++){
                if(this.cols[i].editable === true){
                    is_static=false;
                }
            } */
          //  if(this.element=== null){
	    this.element=$("<div id='" + this.id + "' class='grid htable'></div>");  // "  ui-widget-content'> </div>");
           // }
	    // right mouse button popup- not on all cols needs a rewrite
	    //rmouse_popup(this.element);
	    //this.DOM.append(this.element);

	    var headtable=$("<table class='ui-widget head'></table>");
	    var head=$("<thead></thead>");

	    headtable.append(head);
	    this.element.append(headtable);

	    var r=$("<tr></tr>");
	    // setup the grid columns

	    for(var i=0; i< this.cols.length; i++){

		if(this.cols[i].display !== false){
		   if(this.DEBUG) console.log("grid col " + this.cols[i].name);
		    var label=(this.cols[i].label)?this.cols[i].label:this.cols[i].name;
		    var h=$("<th class='ui-state-default " +  this.cols[i].type + "' type= '" + this.cols[i].type + "'> " + label + " </th>");
		    this.cols[i].element=h;
		    this.cols[i].sortable=Harvey.isSortable(this.cols[i].type);
		    if(this.cols[i].sortable && this.userSortable){
			var dec=$("<div class='arrows'></div>");
			var up=$("<span class='up ui-icon ui-icon-triangle-1-n '></span>");
			var down=$("<span class='down ui-icon ui-icon-triangle-1-s '></span>");
			dec.append(up);
			dec.append(down);
			h.append(dec);

			up[0].addEventListener("click",function(col_num,that){
			    return function(e){
                                e.stopPropagation();
                                e.preventDefault();
                                console.log("got that.cols " + that.cols[col_num].name);
				sort_callback(col_num,that,"up");
			    };
			}(i,that),false);  // col is + 1 for first row outside for loop +1 for index starts at 1 -
			down[0].addEventListener("click",function(col_num,that){
			    return function(e){
                                e.stopPropagation();
                                e.preventDefault();
                                console.log("got that.cols " + that.cols[col_num].name);
				sort_callback(col_num,that,"down");
			    };
			}(i,that),false);


		        h[0].addEventListener("mouseover",function(e){
			    $(this).addClass('ui-state-hover'); }, false);
		        h[0].addEventListener("mouseout",function(e){
			    $(this).removeClass('ui-state-hover');}, false);
                    }
		    r.append(h);
		    if(this.cols[i].hidden){
			h.hide();
		    }
		}
	    }


	    head.append(r); // put the head row into the dom
            var div_container=$("<div class='grid_content' </div>");
            if(this.resizable){
	        div_container.resizable(
                    {alsoResize: this.element});
	    }

            this.element.append(div_container);
	    //body.selectable(this.select_data()); // allow multiple cells to be selected


	    var mk_grid=function(grid){
		var new_row;
		var name=grid.name;
		var rows=grid.rows;
		if(name !== undefined){
		    var div=$("<div class='inner_table' id='" + name + "'> </div>");
		    div.append("<h4 class='ui-widget ui-widget-header'>" + name + "</h4>");
		}
		else{
		    var div=$("<div class='inner_table'> </div>");
		}
		var table=$("<table></table>");
		div.append(table);
		//var body=$("<tbody class='selectable'></tbody>");
		var body=$("<tbody class=''></tbody>");
		table.append(body);
		div_container.append(div);
                // add the data for the rows
            /*    if(is_static){
                    for(var i=0; i<rows.length; i++){  // rows
		        // console.log("adding row " + i);
		        new_row=that._mkStaticRow(rows[i]);
		        body.append(new_row);
		    }
                }
		else{ */
		    for(var i=0; i<rows.length; i++){  // rows
		        // console.log("adding row " + i);
		        new_row=that._mkRow(rows[i]);
		        body.append(new_row);
		    }
               // }
		return div;
	    };

	    for(var i=0;i<this.grids.length;i++){
    	        console.log("making grid " + i);
		this.grids[i].element= mk_grid(this.grids[i]);
	    }
	    var t1=performance.now();
	    console.log("grid load " + (t1-t0) + "milliseconds ");
	},
	getColIndex: function(name){
	    for(var i=0; i< this.cols.length;i++){
		if (this.cols[i].name === name){
		    return i;
		}
	    }
	    throw new Error("No column of name " + name + "exists");
	    return -1;
	},
	getCol: function(name,grid_name){
	   // console.log("getting columns");
	    var index=-1,col=new Array;
	    for(var i=0;i< this.cols.length;i++){
	//	console.log("col is " + this.cols[i].name);
		if(this.cols[i].name == name){
		    index=i;
		    break;
		}
	    }
	    if(index === -1){
		throw new Error("can't find column " + name);
		return null;
	    }
	  //  console.log("getCol found index " + index + " for " + name);
	    if(grid_name && this.grids[grid_name]){
		 col=this.grids[grid_name].rows.map(function(r){
			return r[index];
		    });
		return col;
	    }
	    if(!this.grids){
		throw new Error("Grid " + this.id + " has no grids");
	    }
	    for(var i in this.grids){
	//	console.log("getting row from grid " + this.grids[i].name);
		for(var j=0;j<this.grids[i].rows.length;j++){
		    col.push(this.grids[i].rows[j][name]);
		}
	    }
	    return col;
	},
	getGrid: function(name){
	    if(this.grids.length === 1 ){
		return this.grids["all"];
	    }
	    for(var i=0;i<this.grids.length;i++){
		if(this.grids[i].name == name){
		    return this.grids[i];
		}
	    }
	    return null;
	},
	getGrids: function(){
	    if(this.grids){
		return this.grids;
	    }
	    return null;
	},
	showGrid: function(name){
	    if(this.grids.length === 1 || !name){
		name="all";
	    }
	//    console.log("show grid is here");
	    for(var i=0; i< this.grids.length;i++){
		if(this.grids[i].name == name || name == "all"){
		    this.grids[i].element.show();
		}
		else{
		    this.grids[i].element.hide();
		}
	    }
	},
	hideGrid: function(name){
	    if(this.grids.length === 1){
		name="all";
	    }
	    for(var i=0; i< this.grids.length;i++){
		if(this.grids[i].name == name || name == "all"){
		    this.grids[i].element.hide();
		}
	    }
	},
   /*     _mkStaticRow: function(row){
            var val,col_name,len=this.cols.length;
            var r=$("<tr > </tr>");


            for(var i=0;i<len;i++){
                col_name=this.cols[i].name;
                val=row[col_name];
                if(this.cols[i].type === "float"){
                    row[col_name]={element:$("<td name='" + col_name + "'class='" +  this.cols[i].type + "'> </td>"),
                                   value: val, precision: this.cols[i].precision};
                    mk_aligned_float(row[col_name]);
                    row[col_name].setValue=set_aligned_float;
                }
                else{
                    row[col_name]={element:$("<td name='" + col_name + "'class='" +  this.cols[i].type + "'> " + val + " </td>"),
                               value:val};
                }
		if(this.cols[i].display !== false){
		    r.append(row[col_name].element);
		    row[col_name].element.data('harvey',{name: col_name,"context": row[col_name],"type": this.cols[i].type});
		}
		if(this.cols[i].hidden){
		    row[col_name].element.hide();
		}
            }
            return r;
        }, */
	_mkRow: function(row){
	    var c,type,settings,col_name;
	    var len=this.cols.length;

	    var r=$(document.createElement("tr"));

	    for(var i=0;i<len;i++){
		col_name=this.cols[i].name;

		if(row[col_name] !== undefined){  // row[col_name] can be null
		    settings= $.extend({},this.cols[i]);
		    //console.log("value is " + row[col_name]);
		    settings.value=row[col_name];
		}
		else{
		    throw new Error("No col named " + col_name + " in row_data number " + index);
		}

		// if settings has a label delete it...
		if(settings.label){
		    delete settings.label;  // not needed for grid cells
		}
                //c=("<td class=" + this.cols[i].type + "></td>");
	        c=document.createElement("td");
                c.className=this.cols[i].type;
                c=$(c);
                //console.log("c is " + JSON.stringify(c));
                //c.addClass(this.cols[i].type);
                row[col_name]=Harvey.field[Harvey.dbToHtml[this.cols[i].type].html_field](settings,c);

              //  new_cell.element.removeClass(this.cols[i].type);
		//if(!row[col_name]){ throw new Error("new cell is null");}

		if(this.cols[i].display !== false){
		    r.append(row[col_name].element);
		    row[col_name].element.data('harvey',{name: col_name,"context": row[col_name],"type": this.cols[i].type});
		}
		if(this.cols[i].hidden){
		    row[col_name].element.hide();
		}
	    }
	    return r;
	},
	insertRow: function(row_data){
	    var index=null,r,grid;
	    if(this.subGrid.groupBy){
		var t=this.subGrid.groupBy;
		if(!row_data.t){
		    throw new Error("no field in row data matches " + t);
		    return null;
		}
		grid=this.getGrid(row_data[t]);
	    }
	    else{
		grid=this.getGrid("all");
	    }

	    if(this.sorted && this.sortOrder){
		var p=Harvey.Utils.binarySearch(grid.rows,this.sortOrder,row_data,index);
		if(p !== null){
		    throw new Error("this row already exists cannot insert again");
		    return null;
		}
	    }
	    else{
		index=grid.rows.length-1;
	    }

	    r=this._mkRow(row_data);
	    grid.rows[index].element.after(r); // insert the element
	    // update the rowPos lookup table
	    if(grid.rowPos && this.uniqueKey){
		this._mkRowLookUp(grid);
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
	    var b=this.grids[grid_name].element.find("tbody");
	    b.empty();

	    for(var i=0; i<this.grids[grid_name].rows.length; i++){
		b.append(this.grids[grid_name].rows[i].element);
	    }
	},
	updateRow: function(cell_data){
	    var row,subGrid,index,g;
	    if(this.subGrid.groupBy){
		g=cell_data[this.subGrid.groupBy];
		if(!g){
		    throw new Error("No subGrid in cell update data");
		}
	    }
	    var grid=this.get_grid(g);

	    if(this.uniqueKey && grid.rowPos){ // we have a list of the row position in the grid
		if( !cell_data[this.uniqueKey] ){
		    throw new Error("No unique Key in data for cell Update");
		}
		index=grid.rowPos[cell_data[this.uniqueKey]];
	    }
	    else if(this.sortOrder && this.sorted){  // grids have a sort order and have been sorted
		index=Harvey.Utils.binarySearch(grid.rows,this.sortOrder,row_data);
		row=grid.rows[index];
	    }
	    else{
		// use a dumb way of finding this....

		throw new Error("No method available to find this cell");
	    }
	    //console.log("found row " + row);
	    if(row){   // need to check that we are not overwritting a sortOrder key, making sort invalid
		var to;
		for(var k in cell_data){
		  //  console.log("k is " + k + " uniqueKey is " + this.uniqueKey);
		    for(var i=0;  this.sortOrder.length;i++){
			if(this.sortOrder[i] === k){
			    this.sorted=false;   // overwritten a sortby field
			    this.cols[k].sorted=false;
			}
		    }
                    if(row[k].setValue){
		        row[k].setValue(cell_data[k]);
                    }
                    else{
                        row[k].value=cell_data[k];
                    }
		    var cl="cell_updated";
		    if(row[k].display !== false){
			if(row[k].getElement().hasClass(cl)){  // add colours to the cells to show update frequency
			    row[k].getElement().removeClass(cl).addClass("cell_updated_fast");
			    cl="cell_updated_fast";
			}
			else{
			    row[k].getElement().addClass(cl);
			}
			if(to){ clearTimeout(to);}
			to=setTimeout(function(){
			    row[k].getElement().removeClass(cl);},15000);
		    }
		}
	    }
	    else{
		throw new Error("No matching entry found in grid data");
	    }
	},
        getRowFromElement: function(element){
            var s,row=[];
            var c=element.data("harvey");
            row.push({context:c.context,name: c.name,
                          value:c.context.value });
            s=element.siblings();
            console.log("got siblings " + s.length);
            for(var i=0;i<s.length;i++){
                c= $(s[i]).data("harvey");
                console.log( "sib " + c.name + " value " + c.context.value);
                row.push({context: c.context,name: c.name,
                          value: c.context.value });
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
                      //  if(t<20){
                      //      console.log("row " + j + " col " + c + " value " + n.rows[t][c]);
                      //  }

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

    $.extend(true, Harvey, {
	display: {
	    grid: function(opts,win){
                if(opts === "methods"){
                    return HarveyMakeGrid.prototype._getMethods();
                }
                else{
                    opts.display="grid";
                    return new HarveyMakeGrid(opts,win);
                }
            }
	}
    });

})(require('jquery'));
