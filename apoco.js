(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

global.Apoco = require('./declare').Apoco;
require("./index.js");
require("./Utils.js");
require("./Panel.js");
require("./Popups.js");
var Promise = require('es6-promise').Promise;

(function () {
    'use strict';

    var that = this;
    window.onerror = function (msg, url, lineno, col_no, error) {
        Apoco.popup.error(url, "line number " + lineno + " " + msg);
    };

    window.addEventListener('beforeunload', function (e) {
        Apoco.stop();
    });

    Apoco.start = function (options) {
        if (options) {
            if (!Apoco.type["array"].check(options) && Apoco.type["object"].check(options)) {
                var p = Apoco.display[options.display](options);
                if (p) {
                    p.show();
                } else {
                    throw new Error("could not execute " + options.display);
                }
            } else if (Apoco.type["array"].check(options)) {
                Apoco.Panel.UIStart(options);
            } else {
                throw new Error("Apoco.start: Unknown options");
            }
        }
    };
    Apoco.stop = function () {
        Apoco.Panel.deleteAll();
        if (Apoco.webSocket) {
            Apoco.webSocket.close();
        }
    };
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Panel.js":12,"./Popups.js":13,"./Utils.js":16,"./declare":19,"./index.js":20,"es6-promise":43}],2:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./Utils");
require("./Popups");
require("./Fields");

;(function () {

    'use strict';

    var _display_components = ["Field", "Node", "Tab", "Grid", "Menu"];

    Apoco.display = {};

    var dp;
    Apoco._DisplayBase = function (options, win) {
        var defaults = {
            parent: null,
            element: null,
            DOM: null,
            id: null
        };
        var that = this,
            t;

        for (var k in defaults) {
            if (options[k] === undefined) {
                options[k] = defaults[k];
            }
        }
        for (var k in options) {
            this[k] = options[k];
        }

        if (this.DOM === null) {
            throw new Error(this.display + ": Must supply a DOM id for an existing node");
        }
        if (this.id === null) {
            throw new Error(this.display + ": Must supply a unique id string");
        }

        if (win) {
            this.DOM = win.document.getElementById(this.DOM);
            t = win.document.getElementById(this.id);
            if (this.dependsOn) {
                dp = win.document.getElementById(this.dependsOn);
            }
        } else {
            t = document.getElementById(this.id);
            this.DOM = document.getElementById(this.DOM);
            if (this.dependsOn) {
                dp = document.getElementById(this.dependsOn);
            }
        }
        if (!this.DOM) {
            throw new Error("_ApocoDisplayBase DOM element does not exist " + this.DOM);
        }

        if (t) {
            t.parentNode.removeChild(t);
        }

        var doit = function doit(context) {
            if (context.action) {
                context.action(context);
            }
        };

        if (this.action) {
            if (this.dependsOn && !dp) {
                if (!Apoco.Observer) {
                    Apoco.Utils.observer.create();
                    if (!Apoco.Observer) {
                        throw new Error("Np observer found");
                    }
                }
                var b = document.body;
                Apoco.Observer.observe(b, { childList: true, subtree: true, attributes: true, attributeFilter: ["id"] });
                Apoco.Utils.observer.add(this.dependsOn, doit, this);
            } else {
                this.action(this);
            }
        }

        if (this.listen !== undefined) {
            Apoco.IO.listen(this);
        }
    };

    Apoco._DisplayBase.prototype = {
        getChildren: function getChildren() {
            var comp = [];
            var k;
            for (var i = 0; i < _display_components.length; i++) {
                k = "get" + _display_components[i];
                if (this[k]) {
                    if (comp.length === 0) {
                        comp = this[k]();
                    } else {
                        comp.concat(this[k]());
                    }

                    return comp;
                }
            }
            return null;
        },
        getChild: function getChild(name) {
            var k;
            if (name !== undefined) {
                for (var i = 0; i < _display_components.length; i++) {
                    var k = "get" + _display_components[i];
                    if (this[k]) {
                        return this[k](name);
                    }
                }
                return null;
            }
            return null;
        },
        deleteChild: function deleteChild(name, no_splice) {
            var k;
            if (name !== undefined) {
                for (var i = 0; i < _display_components.length; i++) {
                    k = "delete" + _display_components[i];
                    if (this[k]) {
                        this[k](name);
                        return true;
                    }
                }
            } else {
                throw new Error("deleteChild- needs a name");
            }
            return null;
        },
        _getMethods: function _getMethods() {
            var m = [];
            for (var k in this) {
                m.push(k);
            }
            return m;
        },
        getElement: function getElement() {
            return this.element;
        },
        getDisplayType: function getDisplayType() {
            return this.display;
        },
        getName: function getName() {
            if (this.name) {
                return this.name;
            }
            return null;
        },
        getKey: function getKey() {
            if (this.name) {
                return this.name;
            }
            if (this.id) {
                return this.id;
            }
            return null;
        },
        getParent: function getParent() {
            return this.parent;
        },
        getSibling: function getSibling(name) {
            if (this.parent) {
                var t = this.parent.getChildren();
                var c = [];

                for (var i = 0; i < t.length; i++) {
                    if (t[i] !== this) {
                        if (name && t[i].getKey() === name) {
                            return t[i];
                        } else {
                            c.push(t[i]);
                        }
                    }
                }
                if (name) {
                    return null;
                }
                return c;
            } else {
                throw new Error("Parent is not defined for " + this.name);
            }
        },
        _execute: function _execute(data) {
            return null;
        },
        show: function show() {
            if (this.publish !== undefined) {
                Apoco.IO.publish(this);
            }
            if (!this.DOM.contains(this.element)) {
                if (this.element) {
                    if (this.after) {
                        var a = document.getElementById(this.after);
                        if (a && a.nextSibling) {
                            a.parentNode.insertBefore(this.element, a.nextSibling);
                        } else {
                            this.DOM.appendChild(this.element);
                        }
                    } else {
                        this.DOM.appendChild(this.element);
                    }
                    if (this._afterShow !== undefined) {
                        this._afterShow();
                    }
                } else {
                    throw new Error("No valid element for " + this.getKey());
                    return null;
                }
            }
            return true;
        },
        isHidden: function isHidden() {
            if (this.DOM.contains(this.element)) {
                return false;
            }
            return true;
        },
        displayType: function displayType() {
            return this.displayType;
        },
        hide: function hide() {
            if (this.DOM.contains(this.element)) {
                this.DOM.removeChild(this.element);
                return;
            }
        },
        delete: function _delete(msg_from_parent) {
            if (this.listen) {
                Apoco.IO.unsubscribe(this);
            }
            if (this.draggable) {
                console.log("Need method to delete draggable");
            }
            this.deleteAll();
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
                this.element = null;
            } else {
                console.log("this element should not be null " + this.id);
            }

            if (this.parent && msg_from_parent === undefined) {
                this.parent.deleteChild(this);
            }
        }
    };
})();

},{"./Fields":9,"./Popups":13,"./Utils":16,"./declare":19}],3:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./DisplayBase.js");
require("./Nodes.js");

;(function () {

    "use strict";

    var ApocoMakeFieldset = function ApocoMakeFieldset(options, win) {
        this.DEBUG = true;
        var that = this;
        this.nodes = [];
        this.fields = [];
        Apoco._DisplayBase.call(this, options, win);
        if (this.display == "fieldset") {
            this._execute();
        }
    };

    ApocoMakeFieldset.prototype = {
        _execute: function _execute() {
            var el,
                p,
                that = this;
            this.element = document.createElement("div");
            this.element.id = this.id;
            this.element.classList.add("field_container", "ui-widget-content", "ui-corner-all");

            if (this.components !== undefined) {
                for (var i = 0; i < this.components.length; i++) {
                    this.components[i].parent = that;
                    el = document.createElement("div");
                    el.classList.add("fieldset");
                    if (this.components[i].class) {
                        el.classList.add(this.components[i].class);
                    }
                    if (this.components[i].node) {
                        this.addNode(this.components[i], el);
                    } else if (this.components[i].field || this.components[i].type) {
                        p = this.addField(this.components[i], el);
                    }
                }
                this.components.length = 0;
            } else {
                console.log("components for " + this.id + " is undefined");
            }
        },
        _afterShow: function _afterShow() {
            if (this.fields && this.fields.length > 0) {
                var e = this.fields[0].getElement();
                var d = e.getElementsByTagName("input")[0];
                if (d) {
                    d.focus();
                }
            }
        },
        getChildren: function getChildren() {
            var comp;
            var comp = this.getField();
            var c = this.getNode();
            comp.concat(c);
            return comp;
        },
        getChild: function getChild(name) {
            var k;
            if (name !== undefined) {
                k = this.getField(name);
                if (k !== null && !Apoco.type["array"].check(k)) {
                    return k;
                }
                k = this.getNode(name);
                if (k !== null && !Apoco.type["array"].check(k)) {
                    return k;
                }
            }
            return null;
        },
        getField: function getField(name) {
            if (name !== undefined) {
                for (var i = 0; i < this.fields.length; i++) {
                    if (this.fields[i].name === name) {
                        return this.fields[i];
                    }
                }
                return null;
            }
            return this.fields;
        },
        getNode: function getNode(name) {
            if (name !== undefined) {
                for (var i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].name !== undefined && this.nodes[i].name === name) {
                        return this.nodes[i];
                    }
                }
                return null;
            }
            return this.nodes;
        },
        deleteChild: function deleteChild(name) {
            if (name !== undefined) {
                if (this.getNode(name) !== null) {
                    this.deleteNode(name);
                } else if (this.getField(name) !== null) {
                    this.deleteField(name);
                } else {
                    throw new Error("DisplayFieldset: deleteChild cannot find " + name);
                }
            } else {
                throw new Error("deleteChild- needs a name");
            }
        },
        addNode: function addNode(d, el) {
            var n, parent_element;
            if (d.name && this.getNode(d.name) !== null) {
                throw new Error("Cannot add node with non-unique name");
            }
            if (d.element) {
                if (!d.node) {
                    throw new Error("Apoco.displayFieldset: addNode - object is not a node");
                }
                n = d;
            } else {
                n = Apoco.node(d, el);
            }
            if (n) {
                this.element.appendChild(n.element);
                this.nodes.push(n);
                return n;
            } else {
                throw new Error("Apoco,fieldset, doesn't know how to make " + d.node);
            }
            return null;
        },
        deleteNode: function deleteNode(name) {
            var n,
                index = -1;
            if (name === undefined) {
                throw new Error("DisplayFieldset: deleteNode - must supply a name");
            }
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].name === name) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                throw new Error("DisplayFieldset: deleteNode cannot find " + name);
            }
            this.nodes[index].element.parentNode.removeChild(this.nodes[index].element);
            this.nodes[index].element = null;
            this.nodes.splice(index, 1);
        },
        addField: function addField(d, el) {
            var p, parent_element;
            if (!d.field) {
                if (d.type) {
                    d.field = Apoco.type[d.type].field;
                } else {
                    throw new Error("Must supply either a field or a type");
                }
            }

            if (this.getField(d.name) !== null) {
                throw new Error("Cannot add field with non-unique name " + d.name);
            }
            if (Apoco.field.exists(d.field)) {
                if (d.element) {
                    p = d;
                } else {
                    p = Apoco.field[d.field](d, el);
                }
                if (!p) {
                    throw new Error("Cannot make field " + d.field);
                }
            } else {
                throw new Error("no field of type " + d.field + " exists");
            }
            this.fields.push(p);

            this.element.appendChild(p.element);

            return p;
        },
        deleteAll: function deleteAll() {
            for (var i = 0; i < this.fields.length; i++) {
                this.fields[i].delete();
            }
            this.fields.length = 0;
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].listen) {
                    Apoco.unsubscribe(this.nodes[i]);
                }
                if (this.nodes[i].element.parentNode) {
                    this.nodes[i].element.parentNode.removeChild(this.nodes[i].element);
                }
            }
            this.nodes.length = 0;
        },
        deleteField: function deleteField(name) {
            var n,
                index = -1;
            if (name === undefined) {
                throw new Error("DisplayFieldset: deleteNode - must supply a name");
            }
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].name === name) {
                    index = i;
                    break;
                }
            }
            if (this.fields[index].listen) {
                Apoco.unsubscribe(this.fields[i]);
            }
            if (index === -1) {
                throw new Error("DisplayFieldset: deleteNode cannot find " + name);
            }

            this.fields[index].element.parentNode.removeChild(this.fields[index].element);
            this.fields[index].element = null;
            this.fields.splice(index, 1);
        },
        getJSON: function getJSON() {
            var js = {};
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].required) {
                    if (this.fields[i].checkValue() !== true) {
                        return null;
                    }
                }
                js[this.fields[i].getKey()] = this.fields[i].getValue();
            }
            return js;
        },
        check: function check() {
            var valid = true;

            for (var i = 0; i < this.fields.length; i++) {
                if (!this.fields[i].checkValue()) {
                    valid = false;
                }
            }
            return valid;
        },
        submit: function submit(url) {
            var j = this.getJSON();
            Apoco.IO.REST("POST", j, url);
        }
    };

    Apoco.Utils.extend(ApocoMakeFieldset, Apoco._DisplayBase);

    Apoco.display.fieldset = function (opts, win) {
        opts.display = "fieldset";
        return new ApocoMakeFieldset(opts, win);
    };
    Apoco.display.fieldsetMethods = function () {
        var ar = [];
        for (var k in ApocoMakeFieldset.prototype) {
            ar.push(k);
        }
        return ar;
    };
    Apoco.display._fieldsetBase = ApocoMakeFieldset;
})();

},{"./DisplayBase.js":2,"./Nodes.js":11,"./declare":19}],4:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./DisplayFieldset");

;(function () {
    "use strict";

    var DEBUG = true;

    var ApocoMakeForm = function ApocoMakeForm(options, win) {
        this.DEBUG = true;
        var that = this;
        Apoco.display._fieldsetBase.call(this, options, win);
        this._execute();
    };

    ApocoMakeForm.prototype = {
        _execute: function _execute() {
            var that = this,
                fp,
                header,
                container,
                fc,
                h;

            this.element = document.createElement("div");
            this.element.id = this.id;
            this.element.classList.add("apoco_form", "resizable", "ui-widget-content", "ui-corner-all");
            if (this.class !== undefined) {
                this.element.classList.add(this.class);
            }
            if (!this.height) {
                this.height = 400;
            }
            if (!this.width) {
                this.width = Math.floor(this.height * 0.75);
            }
            this.element.innerHeight = this.height;
            this.element.innerWidth = this.width;
            header = document.createElement("div");
            header.classList.add("form_header", "ui-state-default", "ui-widget-header", "ui-corner-all");
            this.element.appendChild(header);
            if (this.draggable !== false) {
                this.draggable = Apoco.Utils.draggable(this.element);
            }
            container = document.createElement("div");
            container.classList.add("form_scroll");
            fc = document.createElement("div");
            fc.classList.add("form_content");
            this.element.appendChild(fc);
            fc.appendChild(container);
            h = document.createElement("h5");
            if (this.label) {
                h.textContent = this.label;
            }
            header.appendChild(h);
            var close = document.createElement("span");
            close.classList.add("ui-icon", "ui-icon-close");
            header.appendChild(close);
            var c = function c(e) {
                e.stopPropagation();

                that.delete();
            };

            close.addEventListener("click", c, false);

            fp = document.createElement("ul");
            fp.classList.add("apoco_form_list");
            container.appendChild(fp);

            if (this.components) {
                for (var i = 0; i < this.components.length; i++) {
                    this.components[i].parent = that;
                    if (this.components[i].node) {
                        this.addNode(this.components[i], fp);
                    } else if (this.components[i].field || this.components[i].type) {
                        this.addField(this.components[i], fp);
                    }
                }
                this.components.length = 0;
            }

            if (this.buttons) {
                var button_container = document.createElement("div");
                button_container.classList.add("form_button_container", "ui-widget-content");
                this.element.appendChild(button_container);
                for (var i = 0; i < this.buttons.length; i++) {
                    this.buttons[i].node = "button";
                    this.buttons[i] = Apoco.node(this.buttons[i]);
                    this.buttons[i].parent = this;
                    button_container.appendChild(this.buttons[i].element);
                }
            } else {
                this.buttons = [];
            }
        },
        addNode: function addNode(d, parent_element) {
            var n;
            var ll = document.createElement("li");
            if (parent_element === undefined) {
                parent_element = this.element.querySelector("ul.apoco_form_list");
            }
            if (d.name && this.getNode(d.name) !== null) {
                throw new Error("Cannot add node with non-unique name");
            }
            if (d.element && d.element.length > 0) {
                if (!d.node) {
                    throw new Error("Apoco.displayFieldset: addNode - object is not a node");
                }
                n = d;
            } else {
                n = Apoco.node(d, ll);
            }
            if (n) {
                if (!n.element) {
                    throw new Error("DisplayForm.addNode element is null");
                }
                parent_element.appendChild(ll);

                this.nodes.push(n);
                return n;
            } else {
                throw new Error("Apoco,fieldset, doesn't know how to make " + d.node);
            }
            return n;
        },
        addField: function addField(d, parent_element) {
            var p;
            var ll = document.createElement("li");
            if (parent_element === undefined) {
                parent_element = this.element.querySelector("ul.apoco_form_list");
            }
            if (!d.field) {
                if (d.type) {
                    d.field = Apoco.type[d.type].field;
                } else {
                    throw new Error("Must supply either a field or a type");
                }
            }

            if (this.getField(d.name) !== null) {
                throw new Error("Cannot add field with non-unique name " + d.name);
            }
            if (Apoco.field.exists(d.field)) {
                if (d.element) {
                    p = d;
                } else {
                    p = Apoco.field[d.field](d, ll);
                }
                if (!p) {
                    throw new Error("Cannot make field " + d.field);
                }
            } else {
                throw new Error("no field of type " + d.field + " exists");
            }

            this.fields.push(p);
            parent_element.appendChild(p.element);

            return p;
        },
        addButton: function addButton(d) {
            var index, r, b;
            d.node = "button";
            b = Apoco.node(d);
            index = this.buttons.length;
            if (b) {
                this.buttons[index] = b;
                this.buttons[index].parent = this;
            } else {
                throw new Error("DisplayForm: Could not make button");
            }
            if (index === 0) {
                r = document.createElement("div");
                r.classList.add("form_button_container", "ui-widget-content");
                this.element.appendChild(r);
            } else {
                r = this.element.querySelector("div.form_button_container");
            }
            if (r.length === 0) {
                throw new Error("DisplayForm: addButton cannot find button container");
            }
            r.appendChild(this.buttons[index].element);
        },
        getButton: function getButton(name) {
            if (name !== undefined) {
                for (var i = 0; i < this.buttons.length; i++) {
                    if (this.buttons[i].name === name) {
                        return this.buttons[i];
                    }
                }
                return null;
            }
            return this.buttons;
        },
        deleteAll: function deleteAll() {
            for (var i = 0; i < this.fields.length; i++) {
                this.fields[i].delete();
            }
            this.fields.length = 0;
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].element.parentNode) {
                    this.nodes[i].element.parentNode.removeChild(this.nodes[i].element);
                }
            }
            this.nodes.length = 0;
            for (var i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].element.parentNode) {
                    this.buttons[i].element.parentNode.removeChild(this.buttons[i].element);
                }
            }
            this.buttons.length = 0;
        },
        deleteButton: function deleteButton(name) {
            var n,
                index = -1;
            if (name === undefined) {
                throw new Error("DisplayForm: deleteButton - must supply a name");
            }
            for (var i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].name === name) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                throw new Error("DisplayFieldset: deleteNode cannot find " + name);
            }
            this.buttons[index].element.parentNode.removeChild(this.buttons[index].element);
            this.buttons[index].element = null;
            this.buttons.splice(index, 1);
        },
        resetInvalid: function resetInvalid() {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].required) {
                    this.fields[i]._resetValue();
                }
            }
        },

        print: function print() {
            var w = this.element.width();
            var h = this.element.height();
            var opts = "height=300 ,width=300, status=no";
            var win = window.open("", "print", opts);
            this.win = win;
            win.document.write('<html><head><title></title>');
            win.document.write('<link rel="stylesheet" href="css/form.css" type="text/css" media="print" >');
            win.document.write('</head><body>');
            var data = this.element.html();
            win.document.write("<div id='" + this.id + "' class='apoco_form'>");
            win.document.write(data);
            win.document.write("</div>");
            win.document.write('</body></html>');
            win.print();
            win.close();
        },
        check: function check() {
            var valid = true;

            for (var i = 0; i < this.fields.length; i++) {
                if (!this.fields[i].checkValue()) {
                    valid = false;
                }
            }
            return valid;
        }
    };

    Apoco.Utils.extend(ApocoMakeForm, Apoco.display._fieldsetBase);

    Apoco.display.form = function (opts, win) {
        opts.display = "form";
        return new ApocoMakeForm(opts, win);
    };
    Apoco.display.formMethods = function () {
        var ar = [];
        for (var k in ApocoMakeForm.prototype) {
            ar.push(k);
        }
        return ar;
    };
})();

},{"./DisplayFieldset":3,"./declare":19}],5:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./DisplayBase.js");
require("./Sort.js");

;(function () {
    "use strict";

    function rmouse_popup(element) {

        element.bind("contextmenu", function (e) {
            var x, y;
            x = e.pageX;
            y = e.pageY;
            log("got mouse co-ords x " + x + " y " + y);
            if (e.which === 3) {
                var p = $(this).parent().position();
                x = x - Math.floor(p.left);
                y = y - Math.floor(p.top);
                log("NEW mouse co-ords x " + x + " y " + y);
                log("parent position is " + p.top + " " + p.left);
                var d = $(this).parent().find('#grid_popup');
                if (d && d.length > 0) {
                    d.css({ 'position': "absolute", 'top': y + "px", 'left': x + "px" });
                } else {
                    var d = $("<div class='popup' id='grid_popup'> </div>").css({ 'position': "absolute", 'top': y + "px", 'left': x + "px" });
                    var cc = $("<div></div>").css({ 'width': '100px', 'height': '100px', 'background': '#101010' });

                    d.append(cc);
                    var ok = $("<button class='ui-button ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'>  OK  </span> </button>");
                    var cancel = $("<button class='ui-button ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'> Cancel </span> </button>");
                    d.append(ok);
                    d.append(cancel);
                    $(this).parent().append(d);

                    var cb = function (that) {
                        return function (e) {
                            e.stopPropagation();
                        };
                    }(this);
                    var bb = function (d) {
                        return function (e) {
                            e.stopPropagation();
                            d.remove();
                        };
                    }(d);
                    ok.on("click", cb);
                    cancel.on("click", bb);
                }
                d.focus();
            }
            return false;
        });
    }

    function stop_edits(that) {
        if (that.DEBUG) console.log("stop allowing edits");
        that.allowEdit = false;
    }

    function start_edits(that) {
        if (that.DEBUG) console.log("start allowing edits");
        that.allowEdit = true;
    }

    function update_column(that, val, update) {
        var p, cell;
        if (that.cellEdit) {
            console.log("undo_cellEDIT: text in restore is " + val);
            if (that.selection_list) {
                for (var i = 0; i < that.selection_list.length; i++) {
                    console.log("value was " + that.selection_list[i].textContent);
                    if (update) {
                        p = that.selection_list[i].data["apoco"];
                        cell = that.rows[p.row][that.cols[p.col].name];
                        cell.setValue(val);
                    }

                    that.selection_list[i].classList.remove("ui-selected");
                }
            } else {
                that.cellEdit.setValue(val);
                that.cellEdit = null;
            }
        }
    }

    function do_edit(e, that) {
        if (that == null) {
            throw new Error("that is null");
        }
        if (!that.allowEdit) {
            console.log("Not allowing editing " + that.allowEdit);
            return;
        }
        if (that.selection_list.length === 0) {
            return;
        }

        var cell = that.selection_list[that.selection_list.length - 1];
        if (!cell) {
            throw new Error("grid cell is null");
        }

        if (that.cellEdit && that.cellEdit.getElement() === cell) {
            console.log("already editing this" + cell);
            return;
        }
        that.cellEdit = cell.data("apoco").context;

        if (that.cellEdit === null) {
            console.log("cell is null");
            throw new Error("cell is null");
        }
        console.log("do_cell edit got  " + that.selection_list.length + " number of cells");
        var type = that.cellEdit["type"];
        if (!type) {
            throw new Error("edit cannot find field type");
        }
        var old_value = that.cellEdit.getValue();
        console.log("cell has value " + old_value + " and type " + type);


        var n = that.cellEdit.html_type;

        var input = that.cellEdit.input.detach();
        that.cellEdit.getElement().empty();
        that.cellEdit.getElement().append(input);
        that.cellEdit.setValue(old_value);
        that.cellEdit.input.show();

        if (that.cellEdit.popup) {
            console.log("popup is here for " + n);
            var d = $("<div class='popup' id='grid_popup'> </div>");
            that.field = Apoco.field[n](that.cellEdit.data["apoco"], d);
            that.cellEdit.getEelement().append(d);
            var ok = $("<button class='ui-button  ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'>  OK  </span> </button>");
            var cancel = $("<button class='ui-button  ui-state-default ui-corner-all ui-button-text-only '> <span class='ui-button-text'> Cancel </span> </button>");
            d.append(ok);
            d.append(cancel);
            that.field.element.focus();
            that.field.editor(edit_callback, ok, cancel);
        } else {
            that.cellEdit.editor(edit_callback);
            that.cellEdit.input.focus();
        }

        function edit_callback(value) {
            console.log("edit_callback got value " + value);
            if (value === null) {
                update_column(that, old_value, false);
                return;
            }
            if (that.cellEdit.checkValue()) {
                update_column(that, value, true);
            } else {
                Apoco.display.dialog("Invalid Input", "Incorrect type for this field should be a " + type);
            }
        }
    }

    function sort_callback(col_num, that, dir) {
        var type = that.cols[col_num].type;
        if (that.DEBUG) console.log("START SORT =======================  got sort type " + type);
        stop_edits(that);
        for (var k in that.grids) {
            Apoco.sort(that.grids[k].rows, { type: type,
                fn: function fn(a) {
                    return a[col_num];
                }
            });
            if (dir === "down") {
                that.grids[k].rows.reverse();
            }
            that.redrawRows(k);
            that.grids[k].sorted = true;
        }

        for (var i = 0; i < that.cols.length; i++) {
            that.cols[i].sorted = false;
        }
        that.cols[col_num].sorted = true;
        start_edits(that);
    }

    function sort_into_subGrids(that) {
        if (that.rows && Apoco.type["array"].check(that.rows)) {
            var n,
                tg,
                subgrid = new Object();
            if (that.groupBy) {
                for (var i = 0; i < that.rows.length; i++) {
                    n = that.rows[i][that.groupBy];
                    if (!n) {
                        throw new Error("Grid - sort_into_subGrids field " + that.groupBy + " does not exist");
                    }
                    n = n.toString();
                    if (!subgrid[n]) {
                        subgrid[n] = {};
                        subgrid[n].name = that.rows[i][that.groupBy];
                        subgrid[n].rows = new Array();
                    }
                    subgrid[n]["rows"].push(that.rows[i]);
                }
                that.rows.length = 0;
            } else {
                subgrid["all"] = new Object();
                subgrid["all"].rows = that.rows;
            }
            that.grids = new Array();
            var i = 0;
            for (var k in subgrid) {
                that.grids[i] = subgrid[k];
                i++;
            }
        }

        if (!that.grids) {
            throw new Error("Apoco.display.grid: no rows or grids in " + that.id);
        }
    }

    var ApocoMakeGrid = function ApocoMakeGrid(options, win) {
        var DEBUG = true;
        var that = this,
            found,
            not_found = [];

        Apoco._DisplayBase.call(this, options, win);
        this.selection_list = [];
        this.cellEdit = null;
        this.allowEdit = true;

        if (this.sortOrder && this.userSortable) {
            throw new Error("Cannot specify both sortOrder and sortable");
        }
        if (this.cols === undefined || this.cols.length === 0) {
            throw new Error("DisplayGrid: need to supply a least one column");
        }
        if (this.uniqueKey) {
            this.sortOrderUnique = true;
            if (this.sortOrder) {
                for (var i = 0; i < this.uniqueKey.length; i++) {
                    found = false;
                    for (var j = 0; j < this.sortOrder.length; j++) {
                        if (this.uniqueKey[i] == this.sortOrder[j]) {
                            found = true;
                        }
                    }
                    if (!found) {
                        not_found.push(this.uniqueKey[i]);
                    }
                }

                for (var i = 0; i < not_found.length; i++) {
                    this.sortOrder.push(not_found[i]);
                }
            }
        }

        this._execute();
    };

    ApocoMakeGrid.prototype = {

        _select_data: function _select_data() {
            var that = this;
        },
        _afterShow: function _afterShow() {
            var v,
                c,
                width = 0,
                d,
                t;
            var that = this;

            if (!this.grids) {
                return;
            }
            v = that.element.getElementsByClassName("head")[0];
            if (v) {
                c = v.getElementsByTagName("div");

                if (c) {
                    for (var i = 0; i < c.length; i++) {
                        d = window.getComputedStyle(c[i], null).getPropertyValue("width");

                        if (d.indexOf("px") >= 0) {
                            t = d.split("px");
                        } else {
                            return;
                        }
                        width += parseFloat(t[0]);
                    }

                    width = Math.ceil(width).toString() + "px";
                    for (var i = 0; i < this.grids.length; i++) {
                        this.grids[i].element.style.width = width;
                    }
                    v.style.width = width;
                }

                this.element.appendChild(this.grid_container);
            } else {
                console.log("cannot find head element ");
            }
        },
        sort: function sort(grid) {
            var isSortable = false,
                grids = [],
                sortOrder = [];

            if (this.sortOrder) {
                console.log("this.sortOrder.length is " + this.sortOrder.length);
                sortOrder = this.sortOrder.slice();
            } else if (this.uniqueKey) {
                sortOrder[0] = this.uniqueKey;
            }
            if (sortOrder.length > 0) {
                var ar = [],
                    t,
                    s;
                console.log("sortOrder.length is " + sortOrder.length);
                for (var i = 0; i < sortOrder.length; i++) {
                    console.log("this is sortOrder " + sortOrder[i]);
                    t = this.getColIndex(sortOrder[i]);
                    console.log("col index is " + t);
                    s = this.sortOrder[i];
                    console.log("name is " + s);
                    if (this.cols) {
                        ar.push({ type: this.cols[t].type,
                            fn: function (s) {
                                return function (a) {
                                    return a[s];
                                };
                            }(s)
                        });
                    }
                    this.cols[t].sorted = true;
                }
                isSortable = true;
            }
            if (isSortable) {
                if (grid) {
                    grids[0] = grid;
                } else {
                    grids = this.grids;
                }
                for (var j = 0; j < grids.length; j++) {
                    Apoco.sort(grids[j].rows, ar);
                    grids[j].sorted = true;
                }
            }
        },
        addGrid: function addGrid(grid) {
            var div, h;
            var name = grid.name;
            var rows = grid.rows;
            div = document.createElement("div");
            div.classList.add("inner_table");
            if (name !== undefined) {
                div.id = name;
                h = document.createElement("h4");
                h.classList.add("ui-widget-header");
                h.textContent = name;
                div.appendChild(h);
            }

            var table = document.createElement("table");

            div.appendChild(table);

            var body = document.createElement("tbody");
            table.appendChild(body);

            this.grid_container.appendChild(div);
            grid.element = div;
        },
        addCol: function addCol(col) {
            var that = this,
                index,
                r,
                t,
                rows;
            var was_hidden = this.isHidden();
            if (Apoco.type["integer"].check(col)) {
                index = col;
                col = this.cols[index];
                if (!col.name || !col.type) {
                    throw new Error("column must have type and name");
                }
            } else {
                if (!col.name || !col.type) {
                    throw new Error("column must have type and name");
                }
                index = this.getColIndex(col.name);
                if (index === null) {
                    index = this.cols.length;
                    this.cols[index] = col;
                } else {
                    throw new Error("Columns must have unique names");
                }
                if (!was_hidden) {
                    Apoco.popup.spinner("true");
                    this.hide();
                }
            }

            col.options = {};
            for (var k in col) {
                col.options[k] = col[k];
            }
            if (this.grids) {
                for (var i = 0; i < this.grids.length; i++) {
                    rows = this.grids[i].rows;
                    if (rows) {
                        for (var j = 0; j < rows.length; j++) {
                            t = Object.keys(rows[j])[0];
                            r = rows[j][t].element.parentNode;
                            rows[j][col.name] = null;
                            this._addCell(rows[j], col, r);
                        }
                    }
                }
            }
            if (this.cols[index].display !== false) {
                var label = this.cols[index].label ? this.cols[i].label : this.cols[index].name;
                var h = document.createElement("div");
                var s = document.createElement("soan");
                h.appendChild(s);
                h.classList.add(this.cols[index].type);
                h.type = this.cols[index].type;
                s.textContent = label;
                this.cols[index].element = h;
                this.cols[index].sortable = Apoco.isSortable(this.cols[index].type);
                if (this.cols[index].sortable && this.userSortable) {
                    var dec = document.createElement("div");
                    dec.classList.add("arrows");
                    var up = document.createElement("span");
                    up.classList.add("up", "ui-icon", "ui-icon-triangle-1-n");
                    var down = document.createElement("span");
                    down.classList.add("down", "ui-icon", "ui-icon-triangle-1-n");
                    dec.appendChild(up);
                    dec.appendChild(down);
                    h.appendChild(dec);

                    up.addEventListener("click", function (col_num, that) {
                        return function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log("got that.cols " + that.cols[col_num].name);
                            sort_callback(col_num, that, "up");
                        };
                    }(i, that), false);
                    down.addEventListener("click", function (col_num, that) {
                        return function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log("got that.cols " + that.cols[col_num].name);
                            sort_callback(col_num, that, "down");
                        };
                    }(index, that), false);

                    h.addEventListener("mouseover", function (e) {
                        e.stopPropagation();
                        e.target.classList.add('ui-state-hover');
                    }, false);
                    h.addEventListener("mouseout", function (e) {
                        e.stopPropagation();
                        e.target.classList.remove('ui-state-hover');
                    }, false);
                }
                this.colElement.appendChild(h);
                if (this.cols[index].hidden) {
                    h.visibility = "hidden";
                }
            }

            if (!was_hidden) {
                Apoco.popup.spinner(false);
                this.show();
            }
        },
        deleteCol: function deleteCol(name) {
            var el,
                index = this.getColIndex(name);

            if (index > 0) {
                for (var i = 0; i < this.sortOrder.length; i++) {
                    if (this.sortOrder[i] == name) {
                        throw new Error("Cannot delete col used for sorting");
                    }
                }

                for (var i = 0; i < this.grids.length; i++) {
                    for (var j = 0; j < this.grids[i].rows.length; j++) {
                        el = this.grids[i].rows[j][name].getElement();
                        el.parentNode.removeChild(el);
                        el = null;
                        delete this.grids[i].rows[j][name];
                    }
                }

                this.colElement.removeChild(this.cols[index].element);
                this.cols[index].element = null;

                this.cols.splice(index, 1);
            } else {
                throw new Error("cannot find column " + name);
            }
        },
        getColIndex: function getColIndex(name) {
            if (name === undefined) {
                return null;
            }
            for (var i = 0; i < this.cols.length; i++) {
                if (this.cols[i].name === name) {
                    return i;
                }
            }
            return null;
        },
        getCol: function getCol(name) {
            var index = -1,
                col = new Array();
            if (name !== undefined) {
                for (var i = 0; i < this.cols.length; i++) {
                    if (this.cols[i].name == name) {
                        return this.cols[i];
                    }
                }
            }
            return this.cols;
        },
        _execute: function _execute() {
            var rows,
                body,
                r,
                that = this;

            this.element = document.createElement("div");
            this.element.id = this.id;
            this.element.classList.add("grid", "ui-widget-content");

            this.colElement = document.createElement("div");
            this.colElement.classList.add("head");
            this.element.appendChild(this.colElement);

            this.grid_container = document.createElement("div");
            this.grid_container.classList.add("grid_content");

            if (this.resizable) {
                this.element.classList.add("resizable");
            }

            this.element.appendChild(this.grid_container);

            for (var i = 0; i < this.cols.length; i++) {
                this.addCol(i);
            }

            if (this.rows !== undefined) {
                sort_into_subGrids(this);
                this.sort();
                for (var i = 0; i < this.grids.length; i++) {
                    this.addGrid(this.grids[i]);
                    body = this.grids[i].element.getElementsByTagName("tbody")[0];
                    rows = this.grids[i].rows;

                    for (var j = 0; j < rows.length; j++) {
                        r = document.createElement("tr");
                        for (var k = 0; k < this.cols.length; k++) {
                            this._addCell(rows[j], this.cols[k], r);
                        }
                        body.appendChild(r);
                    }
                }
            }
        },
        _addCell: function _addCell(row, col, r) {
            var c,
                type,
                settings = {};

            for (var k in col.options) {
                settings[k] = col.options[k];
            }
            if (row[col.name] === undefined) {
                if (this.required === true) {

                    throw new Error("Field " + col.name + "is required");
                }
                row[col.name] = null;
            }

            settings.value = row[col.name];
            c = document.createElement("td");
            c.className = col.type;

            row[col.name] = Apoco.field[Apoco.type[col.type].field](settings, c);
            if (col.display !== false) {
                r.appendChild(row[col.name].element);

                row[col.name].element.data = {};
                row[col.name].element.data.apoco = { name: col.name, "context": row[col.name], "type": col.type };
            }
            if (col.hidden) {
                row[col.name].element.visibility = "hidden";
            }
        },
        addRow: function addRow(row_data) {
            var row = null,
                r,
                grid,
                name,
                l,
                t,
                sortOrder = [],
                e;
            var closest = { val: -1 };
            if (this.groupBy) {
                if (row_data[this.groupBy] === undefined) {
                    throw new Error("no field in row data matches " + this.groupBy);
                }
                name = row_data[this.groupBy];
            } else {
                name = "all";
            }
            grid = this.getGrid(name);
            console.log("addRow grid is " + grid);
            if (grid === null || grid === undefined) {
                console.log("creating grid");
                if (this.grids) {
                    l = this.grids.length;
                } else {
                    this.grids = [];
                    l = 0;
                }
                this.grids[l] = { name: name, rows: [] };
                this.addGrid(this.grids[l]);
                grid = this.grids[l];
            }
            if (grid.sorted) {
                row = this.getRow(row_data, name, closest);
                if (row !== null) {
                    throw new Error("row already exists");
                }
            }
            r = document.createElement("tr");
            for (var i = 0; i < this.cols.length; i++) {
                this._addCell(row_data, this.cols[i], r);
            }

            if (!grid.sorted) {
                grid.rows.push(row_data);
                grid.element.getElementsByTagName("tbody")[0].appendChild(r);
            } else {
                t = Object.keys(grid.rows[closest.index])[0];

                if (closest.dir === "after") {
                    closest.index++;

                    e = grid.rows[closest.index][t].element;

                    e.parentNode.insertBefore(e, r.nextSibling);
                    grid.rows.splice(closest.index, 0, row_data);
                } else {
                    e = grid.rows[closest.index][t].element;
                    e.parentNode.insertBefore(r, e);
                    grid.rows.splice(closest.index, 0, row_data);
                }
            }
            return row_data;
        },
        deleteRow: function deleteRow(key, group) {
            var closest = {},
                g,
                parent,
                el;
            var row = this.getRow(key, group, closest);
            if (row === null) {
                throw new Error("deleteRow: cannot find row ");
            }
            if (group !== undefined) {
                g = this.getGrid(group);
            } else if (this.groupBy && key[this.groupBy]) {
                g = this.getGrid(key[this.groupBy]);
            } else {
                g = this.grids[0];
            }
            if (g === null) {
                throw new Error("Cannot find group");
            }

            for (var i = 0; i < this.cols.length; i++) {
                if (!row[this.cols[i].name]) {
                    throw new Error("row is undefined");
                }
                if (!parent) {
                    parent = row[this.cols[i].name].getElement().parentNode;
                }
                if (this.cols[i].display !== false) {
                    el = row[this.cols[i].name].getElement();
                    el.parentNode.removeChild(el);
                    el = null;
                }
            }
            parent.parentNode.removeChild(parent);
            g.rows.splice(closest.index, 1);
        },
        getRow: function getRow(key, group, closest) {
            var grid = [],
                row,
                sortOrder = [];
            if (!closest && this.sortOrderUnique !== true) {
                throw new Error("No unique key to find row");
            }
            if (group && group !== null) {
                grid[0] = this.getGrid(group);
            } else {
                if (this.groupBy && key[this.groupBy]) {
                    grid[0] = this.getGrid(key[this.groupBy]);
                    if (!grid[0]) {
                        throw new Error("Cannot find grid " + this.groupBy);
                    }
                } else {
                    grid = this.grids;
                }
            }

            for (var i = 0; i < grid.length; i++) {
                if (grid[i].sorted) {
                    if (this.closest) {
                        if (this.sortOrder === undefined) {
                            for (var k = 0; k < this.cols.length; k++) {
                                if (this.cols[k].sorted === true) {
                                    sortOrder.push(this.cols[k].name);
                                }
                            }
                        }
                    } else {
                        sortOrder = this.sortOrder;
                        for (var j = 0; j < sortOrder.length; j++) {
                            if (key[sortOrder[j]] === undefined || key[sortOrder[j]] === null) {
                                throw new Error("getRow: key is not unique needs " + this.sortOrder[j]);
                            }
                        }
                        for (var j = 0; j < grid[i].rows.length; j++) {
                            for (k = 0; k < this.cols.length; k++) {
                                var v = this.cols[k].name;
                            }
                        }
                    }
                    row = Apoco.Utils.binarySearch(grid[i].rows, sortOrder, key, closest);
                    if (row) {
                        return row;
                    }
                } else {
                    throw new Error("grid is not sorted");
                }
            }
            return null;
        },
        updateRow: function updateRow(cell_data) {
            var row, subGrid, index, g;
            if (this.groupBy) {
                g = cell_data[this.groupBy];
                if (g === undefined) {
                    throw new Error("No subGrid called " + this.groupBy + " in cell update data " + g);
                }
            }
            var grid = this.getGrid(g);
            if (grid.sorted) {
                row = this.getRow(cell_data, g);
                if (row === null) {
                    throw new Error("UpdateRow: cannot find row");
                }
            } else {
                throw new Error("No method available to find this cell");
            }

            if (row) {
                var to, cell;
                for (var k in cell_data) {
                    row[k].setValue(cell_data[k]);
                    var cl = "cell_updated";
                    if (row[k].display !== false) {
                        cell = row[k].getElement();
                        if (cell.classList.contains(cl)) {
                            cell.classList.remove(cl);
                            cell.classList.add("cell_updated_fast");
                            cl = "cell_updated_fast";
                        } else {
                            row[k].getElement().classList.add(cl);
                        }
                        if (to) {
                            clearTimeout(to);
                        }
                        to = setTimeout(function () {
                            row[k].getElement().classList.remove(cl);
                        }, 15000);
                    }
                }
            } else {
                throw new Error("No matching entry found in grid data");
            }
        },
        getGrid: function getGrid(name) {
            if (!this.grids) {
                return null;
            } else if (this.grids.length === 1) {
                return this.grids[0];
            }
            if (name !== undefined) {
                for (var i = 0; i < this.grids.length; i++) {
                    if (this.grids[i].name == name) {
                        return this.grids[i];
                    }
                }
                return null;
            }
            return this.grids;
        },
        deleteAll: function deleteAll() {
            var el, parent, row;
            if (this.grids) {
                for (var i = 0; i < this.grids.length; i++) {
                    for (var j = 0; j < this.grids[i].rows.length; j++) {
                        row = this.grids[i].rows[j];
                        for (var k = 0; k < this.cols.length; k++) {
                            el = row[this.cols[k].name].element;
                            if (this.cols[k].display !== false) {
                                if (k === 0) {
                                    parent = el.parentNode;
                                }
                                parent.removeChild(el);
                            }
                        }
                        if (parent) {
                            parent.parentNode.removeChild(parent);
                        }
                    }
                    this.grids[i].rows.length = 0;
                    this.grids[i].element.parentNode.removeChild(this.grids[i].element);
                }
                this.grids.length = 0;
            }
        },
        showGrid: function showGrid(name) {
            var g;
            var p = this.element.querySelector("div.grid_content");
            if (this.grids.length === 1 || name === undefined) {
                name = "all";
            }

            for (var i = 0; i < this.grids.length; i++) {
                g = this.grids[i];
                if (document.contains(this.grids[i].element)) {
                    p.removeChild(g.element);
                }
                if (g.name == name || name == "all") {
                    if (!document.contains(g.element)) {
                        p.appendChild(g.element);
                    }
                }
            }
        },
        hideGrid: function hideGrid(name) {
            if (this.grids.length === 1) {
                name = "all";
            }
            for (var i = 0; i < this.grids.length; i++) {
                if (this.grids[i].name == name || name == "all") {
                    this.grids[i].element.visibility = "hidden";
                }
            }
        },
        redrawRows: function redrawRows(grid_name) {
            if (!grid_name) {
                if (this.grids.length === 1) {
                    grid_name = "all";
                } else {
                    throw new Error("redrawRows: must specify the grid group name");
                    return null;
                }
            }
            var b = this.grids[grid_name].element.getElementsByTagName("tbody")[0];
            b.innerHTML = "";

            for (var i = 0; i < this.grids[grid_name].rows.length; i++) {
                b.appendChild(this.grids[grid_name].rows[i].element);
            }
        },
        getRowFromElement: function getRowFromElement(element) {
            var s,
                row = [];
            var c = element.data.apoco;

            row.push({ context: c.context, name: c.name,
                value: c.context.value });
            s = element.parentNode.childNodes;

            for (var i = 0; i < s.length; i++) {
                if (s[i] !== element) {
                    c = s[i].data.apoco;

                    row.push({ context: c.context, name: c.name,
                        value: c.context.value });
                }
            }
            return row;
        },
        getJSON: function getJSON() {
            var c, t, m;
            var n = { rows: [] };
            for (var i = 0; i < this.grids.length; i++) {
                m = this.grids[i].rows.length;
                for (var j = 0; j < m; j++) {
                    t = i * m + j;
                    n.rows[t] = {};
                    for (var k = 0; k < this.cols.length; k++) {
                        c = this.cols[k].name;
                        n.rows[t][c] = this.grids[i].rows[j][c].value;
                    }
                }
            }
            return n;
        },
        submit: function submit(row, field_name) {
            var cols, rk, rv;

            var jsq = this.submitDefaults;
            jsq.type = "POST";

            if (row && field_name) {
                if (this.uniqueKey) {
                    rk = row[this.uniqueKey].name.toString();
                    rv = row[field_name].name.toString();
                    jsq.data.push({ rk: row[this.uniqueKey].getValue(),
                        rv: row[field_name].getValue() });
                } else {
                    for (var i = 0; i < row.length; i++) {
                        rk = row[i].name;
                        jsq.data.push({ rk: row[i].getValue() });
                    }
                    return;
                }
            } else {}
            if (this.DEBUG) console.log("jsq is " + JSON.stringify(jsq));

            var submit_promise = Apoco.ajax.jsq(jsq, { url: "/JSQ/cbm",
                type: "POST",
                dataType: 'json',
                contentType: "application/json" });

            submit_promise.done(function (that, p) {
                return function (jq, textStatus) {
                    if (this.DEBUG) console.log("Form.submit: promise success");
                    if (textStatus === "success") {
                        Apoco.display.dialog(that.options.action + " of " + that.template, p.name + " has been successfully committed to the Database");
                    } else {
                        if (this.DEBUG) console.log("Form.submit: deferred-reject");
                    }
                };
            }(this, jsq.properties));

            submit_promise.fail(function (jq, textStatus) {
                var msg = "callback Fail- status  " + jq.status + "  " + jq.statusText + " " + jq.responseText;
                Apoco.display.dialog("Update Failed", msg);
            });
        }
    };

    Apoco.Utils.extend(ApocoMakeGrid, Apoco._DisplayBase);

    Apoco.display.grid = function (opts, win) {
        opts.display = "grid";
        return new ApocoMakeGrid(opts, win);
    };
    Apoco.display.gridMethods = function () {
        var ar = [];
        for (var k in ApocoMakeGrid.prototype) {
            ar.push(k);
        }
        return ar;
    };
})();

},{"./DisplayBase.js":2,"./Sort.js":14,"./declare":19}],6:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;

require("./DisplayBase");

;(function () {

    "use strict";

    var ApocoMakeMenu = function ApocoMakeMenu(options, win) {
        this.DEBUG = true;
        var that = this;
        Apoco._DisplayBase.call(this, options, win);
        this._execute();
    };

    var select_menu = function select_menu(that, index) {
        var name = that.menu[index].name;
        var p = that.getSiblings();
        if (!p) {
            throw new Error("Could not find siblings of " + that.parent.name);
        }
        for (var i = 0; i < p.length; i++) {
            if (p[i].id == name) {
                p[i].show();
            } else {
                p[i].hide();
            }
        }
    };

    ApocoMakeMenu.prototype = {
        _execute: function _execute() {
            var s, u;

            this.selected = undefined;
            this.menu = [];
            this.element = document.createElement("div");
            this.element.id = this.id;
            this.element.classList.add("menu", "ui-widget-content", "ui-corner-all");
            if (this.heading) {
                s = document.createElement("span");
                s.textContent = this.heading;
                this.element.appendChild(s);
            }
            if (this.list === undefined) {
                this.list = [];
            }

            u = document.createElement("ul");
            u.role = "menubar";
            u.classList.add("apoco_menu_list", "ui-menu", "ui-widget-content");
            this.element.appendChild(u);

            for (var i = 0; i < this.list.length; i++) {
                this.list[i].parent = this;
                this.addMenu(this.list[i], u);
            }
            this.list.length = 0;
        },
        update: function update(name) {
            var p = this.getMenu(name);
            if (p !== null) {
                p.element.click();
            } else {
                throw new Error("Apoco.menu Could not find element " + name);
            }
        },
        getSelected: function getSelected() {
            if (this.selected) {
                return this.selected;
            }
            return null;
        },
        reset: function reset() {
            this.selected = null;
            var p = this.element.getElementsByTagName("li");
            for (var i = 0; i < p.length; i++) {
                p[i].classList.remove("ui-state-active");
            }
        },
        getMenu: function getMenu(name) {
            if (name !== undefined) {
                for (var i = 0; i < this.menu.length; i++) {
                    if (this.menu[i].name == name) {
                        return this.menu[i];
                    }
                }
                return null;
            }
            return this.menu;
        },
        addMenu: function addMenu(d, parent_element) {
            var index,
                s,
                l,
                that = this;
            if (parent_element === undefined) {
                parent_element = this.element.getElementsByClassName("apoco_menu_list")[0];
            }
            index = this.menu.length;

            d.element = document.createElement("li");
            if (d.seperator !== undefined) {
                d.element.classList.add("seperator");
                s = document.createElement("span");
                s.className = "seperator";
                s.textContent = d.seperator;
                d.element.appendChild(s);
                parent_element.appendChild(d.element);
            } else {
                l = d.label ? d.label : d.name;
                if (this.getMenu(l) !== null) {
                    throw new Error("DisplayMenu: get Menu - menu already exists " + l);
                }
                d.element.classList.add("ui-menu-item");
                d.element.setAttribute("role", "menuitem");
                d.element.textContent = l;

                d.parent = this;
                parent_element.appendChild(d.element);
                this.menu[index] = d;

                if (d.action !== undefined) {
                    d.element.addEventListener("click", function (t, that) {
                        return function (e) {
                            e.stopPropagation();

                            t.action(t);
                            that.select(t.name);
                        };
                    }(d, that), false);
                }
            }
        },
        deleteAll: function deleteAll() {
            for (var i = 0; i < this.menu.length; i++) {
                if (this.menu[i].listen) {
                    Apoco.unsubscribe(this.menu[i]);
                }
                this.menu[i].element.parentNode.removeChild(this.menu[i].element);
            }
            this.menu.length = 0;
        },
        deleteMenu: function deleteMenu(name) {
            var n,
                index = -1;
            if (name === undefined) {
                throw new Error("DisplayMenu: deleteMenu needs a name");
            }
            for (var i = 0; i < this.menu.length; i++) {
                if (this.menu[i].name === name) {
                    index = i;

                    break;
                }
            }
            if (index === -1) {
                throw new Error("DisplayMenu: deleteMenu Cannot find menu" + name);
            }
            this.menu[index].element.parentNode.removeChild(this.menu[index].element);
            this.menu[index].element = null;
            this.menu.splice(index, 1);
        },
        select: function select(val) {
            var c;
            for (var i = 0; i < this.menu.length; i++) {
                if (this.menu[i].name == val) {
                    this.selected = this.menu[i];

                    c = this.selected.element.parentNode.children;
                    for (var j = 0; j < c.length; j++) {
                        c[j].classList.remove("ui-state-active");
                    }
                    this.selected.element.classList.add("ui-state-active");
                    return;
                }
            }
        }
    };

    Apoco.Utils.extend(ApocoMakeMenu, Apoco._DisplayBase);

    Apoco.display.menu = function (opts, win) {
        opts.display = "menu";
        return new ApocoMakeMenu(opts, win);
    };
    Apoco.display.menuMethods = function () {
        var ar = [];
        for (var k in ApocoMakeMenu.prototype) {
            ar.push(k);
        }
        return ar;
    };
})();

},{"./DisplayBase":2,"./declare":19}],7:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./DisplayBase");

;(function () {
    "use strict";

    var ApocoMakeSlideshow = function ApocoMakeSlideshow(options, win) {
        var defaults = {
            autoplay: true,
            fullscreen: true,
            delay: 4000,
            element: null,
            editable: false,
            thumbnails: false,
            fade: false,
            fadeDuration: 2000,
            current: 0,
            controls: true
        };
        var f,
            that = this;

        for (var k in defaults) {
            if (options[k] === undefined) {
                options[k] = defaults[k];
            }
        }

        if (options.fade === true) {
            if (options.delay <= 250) {
                Apoco.popup.error("Slideshow: image delay is less than 1/4 second- setting fade to false");
                options.fade = false;
            } else if (options.fadeDuration >= options.delay) {
                Apoco.popup.error("Slideshow: Fade Duration is greater than image delay - setting fade to  " + (options.delay - 50));
                options.fadeDuration = Math.max(options.delay - 50, 200);
            }
        }

        Apoco._DisplayBase.call(this, options, win);
        if (this.thumbnails === true) {
            this.thumbnails = document.createElement("div");
            this.thumbnails.classList.add("thumbnails");
        }
        if (this.values) {
            f = Apoco.field["imageArray"]({ name: "slideshow" });
            if (!f) {
                throw new Error("Slideshow: cannot make imageArray");
            }
            this.promises = f.loadImages(this.values);
        } else if (this.editable === true) {
            f = Apoco.field["imageArray"]({ name: "slideshow", editable: this.editable });
        }
        this._execute();
    };

    ApocoMakeSlideshow.prototype = {
        _isVisible: function _isVisible(e) {
            var that = this;
            if (that.DOM.contains(that.element)) {
                if (document.hidden) {
                    if (that.interval) {
                        that.stop();
                    }
                } else {
                    if (that.autoplay) {
                        if (that.controls) {
                            that.element.querySelector("span.ui-icon-play").click();
                        } else {
                            that.play();
                        }
                    }
                }
            }
        },
        handleEvent: function handleEvent(e) {
            if (e.type == "visibilitychange") {
                this._isVisible(e);
            }
        },
        _controls: function _controls() {
            var that = this;
            var d, u, l, s, sibs;
            var icons = [{ class: "ui-icon-seek-prev", action: "step", params: "prev" }, { class: "ui-icon-play", action: "play" }, { class: "ui-icon-pause", action: "stop" }, { class: "ui-icon-seek-next", action: "step", params: "next" }, { class: "ui-icon-arrow-4-diag", action: "showFullscreen" }];
            d = document.createElement("div");
            d.classList.add("slideshow_controls");
            u = document.createElement("ul");
            d.appendChild(u);
            for (var i = 0; i < icons.length; i++) {
                if (icons[i].action === "showFullscreen" && this.fullscreen !== true) {
                    continue;
                }
                l = document.createElement("li");
                l.classList.add("ui-state-default", "ui-corner-all");
                l.addEventListener("click", function (icon, that) {
                    return function (e) {
                        e.stopPropagation();
                        if (icon.action === "play" && that.interval) {
                            e.currentTarget.classList.remove("ui-state-active");
                            that["stop"]();
                            that.autoplay = false;
                            return;
                        }
                        if (icon.action === "step" && that.interval) {
                            that.stop();
                        }
                        e.currentTarget.classList.add("ui-state-active");
                        sibs = Apoco.Utils.getSiblings(e.currentTarget);

                        for (var j = 0; j < sibs.length; j++) {
                            sibs[j].classList.remove("ui-state-active");
                        }
                        if (icon.params) {
                            that[icon.action](icon.params);
                        } else {
                            that[icon.action]();
                        }
                    };
                }(icons[i], this), false);
                s = document.createElement("span");
                s.classList.add(icons[i].class);
                s.classList.add("ui-icon");
                l.appendChild(s);
                u.appendChild(l);
            }
            that.element.appendChild(d);
        },
        _calculateCover: function _calculateCover(v) {
            var that = this;
            this._setWidth();
            var ar = this.width / this.height;
            v.SSimage.style.margin = "0";
            if (v.aspect_ratio > ar) {
                var h = that.width / v.aspect_ratio;

                var w = that.width.toString() + "px";

                v.SSimage.style.width = w;
                v.SSimage.style.height = h.toString() + "px";
                h = (that.height - h) / 2;
                v.SSimage.style.marginTop = h.toString() + "px";
                v.SSimage.style.marginBottom = h.toString() + "px";
            } else {
                var w = that.height * v.aspect_ratio;

                v.SSimage.style.width = w + "px";
                v.SSimage.style.height = that.height + "px";
                w = (that.width - w) / 2;
                v.SSimage.style.marginLeft = w + "px";
                v.SSimage.style.marginRight = w + "px";
            }
        },
        _setWidth: function _setWidth() {
            this.width = window.getComputedStyle(this.slideshow_container, null).getPropertyValue("width").split("px");
            this.height = window.getComputedStyle(this.slideshow_container, null).getPropertyValue("height").split("px");

            this.height = parseInt(this.height);
            this.width = parseInt(this.width);
        },
        _afterShow: function _afterShow() {
            var that = this,
                lis = [];


            this._setWidth();
            for (var i = 0; i < this.values.length; i++) {
                if (this.values[i].loaded) {
                    this._calculateCover(this.values[i]);
                }
            }
            lis = that.slideshow_container.querySelectorAll("li.slide");

            if (lis.length !== that.values.length) {
                throw new Error("Slideshow: slide lis do not exist");
            }

            var car = this.slideshow_container.getElementsByTagName("ul")[0];

            if (that.autoplay === true) {
                if (that.interval) {
                    that.stop();
                }
                if (that.controls) {
                    that.element.querySelector("span.ui-icon-play").click();
                } else {
                    that.play();
                }
            };
        },
        _execute: function _execute() {
            var that = this,
                l,
                temp,
                pp;

            this.element = document.createElement("div");
            this.element.id = this.id;
            this.element.classList.add("Apoco_slideshow", "ui-widget-content", "ui-corner-all");
            this.slideshow_container = document.createElement("div");
            this.slideshow_container.classList.add("slideshow", "pic_area");
            this.element.appendChild(this.slideshow_container);
            var car = document.createElement("ul");
            car.classList.add("carousel");
            that.slideshow_container.appendChild(car);
            for (var i = 0; i < this.values.length; i++) {
                l = document.createElement("li");
                l.classList.add("slide");
                car.appendChild(l);
                this.values[i].SSimage = document.createElement("img");
                l.appendChild(this.values[i].SSimage);
                that.values[i].SSimage.parentElement.style.visibility = "hidden";

                if (this.values[i].text) {
                    temp = document.createElement("div");
                    l.appendChild(temp);
                    pp = document.createElement("p");
                    pp.textContent = this.values[i].text;
                    temp.appendChild(pp);
                    this.hasText = true;
                }

                this.promises[i].then(function (v) {
                    v.SSimage.src = v.src;
                    that._calculateCover(v);
                    v.loaded = true;
                });
            }
            if (that.controls === true) {
                that._controls();
            }
            document.addEventListener("visibilitychange", this, false);
        },
        deleteAll: function deleteAll() {
            if (this.values) {
                for (var i = 0; i < this.values; i++) {
                    this.slideshow_container.removeChild(this.values[i].SSimage);
                }
            }
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }
        },
        showFullscreen: function showFullscreen() {
            var that = this,
                c,
                t;

            var width = parseInt(window.innerWidth - 36);
            var height = parseInt(window.innerHeight - 48);

            var r = document.getElementsByClassName("slideshow_cover")[0];

            that.element.parentNode.removeChild(this.element);

            that.stop();
            if (!document.body.contains(r)) {
                that.element.style.width = width.toString() + "px";
                that.element.style.height = height.toString() + "px";
                that.slideshow_container.style.width = width.toString() + "px";
                that.slideshow_container.style.height = height.toString() + "px";

                that.slideshow_container.classList.remove("pic_area");
                that.slideshow_container.classList.add("pic_area_full");
                that.element.classList.add("show_full_screen");
                document.body.appendChild(that.element);
                c = that.element.querySelector("div.slideshow_controls");
                c.style.position = "absolute";
                c.style.top = height.toString() + "px";
                c.style.left = (width / 2 - 70).toString() + "px";
                t = document.createElement("div");
                t.classList.add("slideshow_cover");
                document.body.appendChild(t);
                that._afterShow();
                window.scrollTo(0, 0);
            } else {
                document.body.removeChild(r);
                that.element.style.width = "";
                that.element.style.height = "";
                that.slideshow_container.style.width = "";
                that.slideshow_container.style.height = "";
                that.element.classList.remove("show_full_screen");
                that.slideshow_container.classList.remove("pic_area_full");
                that.slideshow_container.classList.add("pic_area");
                c = that.element.querySelector("div.slideshow_controls");
                c.style.position = "";
                c.style.top = "";
                c.style.left = "";

                if (this.after) {
                    t = document.getElementById(that.after);
                    if (t) {
                        t.parentNode.insertBefore(that.element, t.nextSibling);
                    } else {
                        this.DOM.appendChild(that.element);
                    }
                } else {
                    that.DOM.appendChild(that.element);
                }
                that._afterShow();
            }
        },
        play: function play() {
            var that = this;
            this.step("next");
            this.autoplay = true;
            this.interval = setInterval(function () {
                that.step("next", "play");
            }, this.delay);
        },
        stop: function stop() {
            var that = this;
            if (this.interval) {
                clearInterval(that.interval);
            }
            this.interval = null;
        },
        _crossFade: function _crossFade(prev, next) {
            var that = this;
            var timer,
                op = 0.05,
                inc = 0.1,
                step = 40;

            var n = parseInt(this.fadeDuration / step);

            inc = Math.pow(1 / op, 1 / n) - 1.0;
            if (inc <= 0) return;
            that.values[next].SSimage.parentElement.style.visibility = "visible";

            that.values[next].SSimage.parentElement.style.top = 0;
            that.values[next].SSimage.parentElement.style.left = 0;
            that.values[next].SSimage.parentElement.style.opacity = op;
            that.values[next].SSimage.parentElement.style.filter = 'alpha(opacity=' + op * 100 + ")";

            timer = setInterval(function () {
                if (op >= 1.0) {
                    clearInterval(timer);

                    that.values[prev].SSimage.parentElement.style.visibility = "hidden";
                    that.values[prev].SSimage.parentElement.style.opacity = 1;
                    that.values[prev].SSimage.parentElement.style.filter = 'alpha(opacity=' + 100 + ")";
                } else {
                    that.values[prev].SSimage.parentElement.style.opacity = 1 - op;
                    that.values[prev].SSimage.parentElement.style.filter = 'alpha(opacity=' + (1 - op) * 100 + ")";
                    that.values[next].SSimage.parentElement.style.opacity = op;
                    that.values[next].SSimage.parentElement.style.filter = 'alpha(opacity=' + op * 100 + ")";
                    op += op * inc;
                }
            }, step);
        },
        step: function step(dir, caller) {
            var num = this.values.length;
            var next,
                prev = this.current;
            if (dir === "next") {
                if (this.current >= num - 1) {
                    this.current = 0;
                } else {
                    this.current++;
                }
            } else {
                if (this.current <= 0) {
                    this.current = num - 1;
                } else {
                    this.current--;
                }
            }
            next = this.current;

            if (this.fade === false || caller !== "play") {
                this.values[prev].SSimage.parentElement.style.visibility = "hidden";
                this.values[next].SSimage.parentElement.style.visibility = "visible";

                this.values[next].SSimage.parentElement.style.opacity = 1;
                this.values[next].SSimage.parentElement.style.filter = "alpha(opacity=100)";
                this.values[next].SSimage.parentElement.style.top = 0;
                this.values[next].SSimage.parentElement.style.left = 0;
            } else {
                this._crossFade(prev, next);
            }
        }
    };

    Apoco.Utils.extend(ApocoMakeSlideshow, Apoco._DisplayBase);

    Apoco.display.slideshow = function (opts, win) {
        opts.display = "slideshow";
        return new ApocoMakeSlideshow(opts, win);
    };
    Apoco.display.slideshowMethods = function () {
        var ar = [];
        for (var k in ApocoMakeSlideshow.prototype) {
            ar.push(k);
        }
        return ar;
    };
})();

},{"./DisplayBase":2,"./declare":19}],8:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;

require("./DisplayBase.js");


;(function () {

    "use strict";

    var ApocoMakeTabs = function ApocoMakeTabs(options, win) {
        this.DEBUG = true;
        var that = this;

        Apoco._DisplayBase.call(this, options, win);
        this._execute();
    };

    var default_select_tabs_action = function default_select_tabs_action(that) {
        var name = that.selected.name;
        Apoco.Panel.hideAll();
        Apoco.Panel.show(name);
    };

    ApocoMakeTabs.prototype = {
        _execute: function _execute() {
            var tt = [],
                tablist;


            this.element = document.createElement("div");
            this.element.id = this.id;
            this.element.classList.add("tab_container", "ui-tabs", "ui-widget-content", "ui-corner-all");
            if (!this.tabs) {
                this.tabs = [];
            }


            tablist = document.createElement("ul");
            tablist.role = "tablist";
            tablist.classList.add("ui-tabs-nav", "ui-helper-reset", "ui-helper-clearfix", "ui-widget-header", "ui-corner-all", "tabs");

            for (var i = 0; i < this.tabs.length; i++) {
                tt[i] = this.tabs[i];
            }
            this.tabs.length = 0;
            this.element.appendChild(tablist);
            for (var i = 0; i < tt.length; i++) {
                this.addTab(tt[i], tablist);
            }
            if (this.selected) {
                this.select(this.selected);
            }
            return true;
        },
        addTab: function addTab(t, tablist) {
            var label,
                index,
                s,
                that = this;
            t.label ? label = t.label : label = t.name;
            if (tablist === undefined) {
                tablist = this.element.querySelector("ul.ui-tabs-nav");
            }
            index = this.tabs.length;
            t.element = document.createElement("li");
            t.element.classList.add("ui-state-default", "ui-corner-top");
            s = document.createElement("span");
            s.textContent = label;
            t.element.appendChild(s);
            t.parent = this;
            this.tabs[index] = t;
            this.tabs[index].parent = this;
            if (t.action) {
                t.element.addEventListener("click", function (e) {
                    t.action(t, index);
                    that.select(t.name);
                }, false);
            }
            tablist.appendChild(t.element);
        },
        getTab: function getTab(name) {
            if (name !== undefined) {
                for (var i = 0; i < this.tabs.length; i++) {
                    if (this.tabs[i].name === name) {
                        return this.tabs[i];
                    }
                }
                return null;
            }
            return this.tabs;
        },
        deleteAll: function deleteAll() {
            for (var i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].listen) {
                    Apoco.unsubscribe(this.tabs[i]);
                }
                this.tabs[i].element.parentNode.removeChild(this.tabs[i].element);
                this.tabs[i].element = null;
            }
            this.tabs.length = 0;
        },
        deleteTab: function deleteTab(name) {
            var index = -1;
            if (name === undefined) {
                throw new Error("DisplayTabs: deleteTab - needs a name");
            }
            for (var i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].name === name) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                throw new Error("DisplayTabs: deleteTab - cannot find name " + name);
            }
            if (this.tabs[i].listen) {
                Apoco.unsubscribe(this.tabs[i]);
            }
            this.tabs[index].element.parentNode.removeChild(this.tabs[index].element);
            this.tabs[index].element = null;
            this.tabs.splice(index, 1);
        },
        update: function update(name) {
            for (var i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].name == name) {
                    var p = this.tabs[i].name;
                    break;
                }
            }
            if (p) {
                p.element.click();
            } else {
                throw new Error("Apoco.tabs Could not find element " + name);
            }
        },
        getSelected: function getSelected() {
            if (this.selected) {
                return this.selected;
            }
            return null;
        },
        select: function select(name) {
            for (var i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].name == name) {
                    this.selected = this.tabs[i];
                    this.tabs[i].element.classList.add("selected", "ui-state-active", "ui-tabs-active");
                    this.tabs[i].element.classList.remove("ui-state-default");
                } else {
                    this.tabs[i].element.classList.add("ui-state-default");
                    this.tabs[i].element.classList.remove("selected", "ui-state-active", "ui-tabs-active");
                }
            }
        }
    };

    Apoco.Utils.extend(ApocoMakeTabs, Apoco._DisplayBase);

    Apoco.display.tabs = function (opts, win) {
        opts.display = "tabs";

        return new ApocoMakeTabs(opts, win);
    };
    Apoco.display.tabsMethods = function () {
        var ar = [];
        for (var k in ApocoMakeTabs.prototype) {
            ar.push(k);
        }
        return ar;
    };
})();

},{"./DisplayBase.js":2,"./declare":19}],9:[function(require,module,exports){
'use strict';

var Apoco = require('./declare').Apoco;
require('./Utils');
require("./Sort");
require('./Types');
require("./datepicker");
var Promise = require('es6-promise').Promise;

;(function () {
    "use strict";

    var _Field = function _Field(d, element) {
        var defaults = {
            required: false,
            editable: true,
            type: "any",
            value: ""
        };
        if (!d) {
            throw new Error("Field: must have some options");
        }
        if (!d.name) {
            throw new Error("Apoco.field: Field must have a name");
        }
        if (!d.type) {
            throw new Error("Apoco.field: must have a type");
        }

        for (var k in defaults) {
            if (d[k] === undefined) {
                d[k] = defaults[k];
            }
        }

        for (var k in d) {
            this[k] = d[k];
        }
        if (this.editable === false) {
            this.popup = false;
        }

        this.html_type = Apoco.type[this.type].html_type;
        if (element === undefined) {
            this.element = document.createElement("div");
        } else if (element) {
            this.element = element;
        } else {
            throw new Error("Field: element is not a html node");
        }
        this.element.classList.add(this.type);
        this.element.setAttribute("name", this.name);
        if (this.title !== undefined) {
            this.element.title = this.title;
        }
        if (this.label) {
            var l = document.createElement("label");
            l.appendChild(document.createTextNode(this.label));
            this.element.appendChild(l);
        }

        if (this.publish !== undefined) {
            Apoco.IO.publish(this);
        }
        if (this.listen !== undefined) {
            Apoco.IO.listen(this);
        }
    };

    _Field.prototype = {
        getElement: function getElement() {
            return this.element;
        },
        getInputElement: function getInputElement() {
            if (this.input) {
                return this.input;
            }
            return null;
        },
        getLabel: function getLabel() {
            var t = this.element.getElementsByTagName("label")[0];
            if (t) {
                return t;
            }
            return null;
        },
        getKey: function getKey() {
            var k = this.name ? this.name : this.label;
            if (k) {
                return k;
            }
            return null;
        },
        getValue: function getValue() {
            if (this.input.pending) {
                return undefined;
            }
            var v = this.input.value;
            if (v && v.length > 0) {
                return this.input.value;
            }
            return undefined;
        },
        setValue: function setValue(v) {
            if (!Apoco.type[this.type].check(v)) {
                throw new Error("Field: setValue " + v + " is the wrong type, expects " + this.type);
            }
            this.value = v;
            if (this.value === null) {
                this.input.value = "";
            } else {
                this.input.value = v;
            }
            if (this.input.pending) {
                this.input.classList.remove("pending");
                this.input.pending = false;
            }
        },
        delete: function _delete() {
            while (this.element.lastChild) {
                this.element.removeChild(this.element.lastChild);
            }
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            if (this.action) {
                this.element.removeEventListener("click", this.action, false);
            }
            if (this.listen) {
                Apoco.IO.unsubscribe(this);
            }
            this.element = null;
            this.input = null;
            this.value = null;
        },
        popupEditor: function popupEditor(func) {
            if (!this.editable) {
                return;
            }
            if (this.input.length > 0) {
                var cb = function (that) {
                    return function (e) {
                        e.stopPropagation();
                        if (e.which === 13) {
                            func(that.input.val());
                        }
                    };
                }(this);
            } else {
                throw new Error("no input element for this type " + this.type);
            }
        },
        resetValue: function resetValue() {
            if (this.value === undefined) {
                this.input.value = "";
                return null;
            }

            if (Apoco.type["array"].check(this.value)) {
                for (var i = 0; i < this.value.length; i++) {
                    this.input[i].value = this.value[i];
                }
                return this.value;
            }
            this.input.value = this.value;
            return this.value;
        },
        checkValue: function checkValue() {
            var array = false;
            var v = this.getValue();
            if (Apoco.type["blank"].check(v)) {
                if (this.required) {
                    return false;
                }
            }
            if (Apoco.type[this.type].check !== undefined) {
                if (!Apoco.type[this.type].check(v)) {
                    return false;
                }
            }
            return true;
        }
    };

    var InputField = function InputField(d, element) {
        var that = this;
        d.field = "input";
        _Field.call(this, d, element);
        var s = document.createElement("input");
        s.setAttribute("type", this.html_type);
        this.input = s;
        if (this.min) {
            this.input.setAttribute("min", this.min);
        }
        if (this.max) {
            this.input.setAttribute("min", this.max);
        }
        if (this.step) {
            this.input.setAttribute("step", this.step);
        }
        if (this.precision) {
            this.input.setAttribute("pattern", "^[-+]?\d*\.?\/" + this.precision + "*$");
        }

        if (this.required === true) {
            this.input.required = true;
        }
        this.element.appendChild(this.input);

        if (this.value !== null && this.value !== undefined) {
            this.input.value = this.value;
        }
        if (this.editable === false) {
            this.input.readOnly = true;
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    Apoco.Utils.extend(InputField, _Field);

    var FloatField = function FloatField(d, element) {
        var inp;
        var that = this;
        d.field = "float";
        d.type = "float";
        _Field.call(this, d, element);
        this.input = new Array(2);
        if (this.precision === undefined) {
            this.precision = 2;
        }
        var list = document.createElement("ul");
        list.classList.add('aligned_float');
        var el = document.createElement("li");
        var dec = document.createElement("div");
        dec.className = 'values';
        inp = document.createElement("input");
        inp.className = "float_left";
        inp.setAttribute("pattern", '^[-+]?[0-9]*$');
        this.input[0] = inp;
        inp = document.createElement("input");
        inp.className = "float_right";

        inp.setAttribute("type", "text");
        this.input[1] = inp;
        this.setValue(this.value);

        dec.appendChild(this.input[0]);
        var s = document.createElement("span");
        s.textContent = ".";
        dec.appendChild(s);
        dec.appendChild(this.input[1]);
        el.appendChild(dec);
        list.appendChild(el);
        if (this.required === true) {
            this.input[1].required = true;
            this.input[0].required = true;
        }
        if (this.editable === false) {
            this.input[0].readOnly = true;
            this.input[0].readOnly = true;
            this.spinner = false;
        }
        if (this.spinner) {
            el = document.createElement("li");
            list.appendChild(el);
            dec = document.createElement("div");
            dec.className = "arrows";
            el.appendChild(dec);
            var up = document.createElement("span");
            up.classList.add("up", "ui-icon", "ui-icon-triangle-1-n");
            var down = document.createElement("span");
            down.classList.add("down", "ui-icon", "ui-icon-triangle-1-s");
            dec.appendChild(up);
            dec.appendChild(down);
            if (this.step === undefined) {
                this.step = 0.1;
            }

            var timer;
            var step_fn = function step_fn(direction) {
                var t = that.getValue();
                if (t === null || t === "") {
                    clearInterval(timer);
                    return;
                }
                if (!Apoco.type.float.check(t)) {
                    clearInterval(timer);
                    throw new Error("stepfn return from getValue: this is not a floating point number");
                }
                if (direction === "up") {
                    t = parseFloat(t, 10) + that.step;
                } else {
                    t = parseFloat(t, 10) - that.step;
                }
                t = parseFloat(t, 10).toFixed(that.precision);
                if (that.setValue(t) === null) {
                    clearInterval(timer);
                    throw new Error("step_fn val is not floating point " + t);
                }
            };
            var eObj = {
                mouseover: function mouseover(e) {
                    e.stopPropagation();
                    e.currentTarget.parentNode.classList.add('ui-state-hover');
                },
                mouseout: function mouseout(e) {
                    e.stopPropagation();
                    e.currentTarget.parentNode.classList.remove('ui-state-hover');
                },
                click: function click(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.currentTarget === down) {
                        step_fn("down");
                    } else {
                        step_fn("up");
                    }
                },
                mousedown: function mousedown(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.currentTarget === down) {
                        timer = setInterval(function () {
                            step_fn("down");
                        }, 100);
                    } else {
                        timer = setInterval(function () {
                            step_fn("up");
                        }, 100);
                    }
                },
                mouseup: function mouseup(e) {
                    e.stopPropagation();
                    if (timer) {
                        clearInterval(timer);
                    }
                }
            };
            for (var k in eObj) {
                up.addEventListener(k, eObj[k], false);
                down.addEventListener(k, eObj[k], false);
            }
        };
        this.element.appendChild(list);
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    FloatField.prototype = {
        getValue: function getValue() {
            var a = this.input[0].value;
            var b = this.input[1].value;
            if (Apoco.type.blank.check(a)) {
                if (Apoco.type.blank.check(b)) {
                    return this.value = "";
                } else {
                    this.value = parseFloat("0." + b, 10).toFixed(this.precision);
                }
            } else if (Apoco.type.blank.check(b)) {
                this.value = parseFloat(a + ".000", 10).toFixed(this.precision);
            } else {
                if (a < 0) {
                    this.value = (parseInt(a, 10) - parseFloat("." + b, 10)).toFixed(this.precision);
                } else {
                    this.value = (parseInt(a, 10) + parseFloat("." + b, 10)).toFixed(this.precision);
                }
            }
            if (!Apoco.type.float.check(this.value)) {
                throw new Error("getValue: this is not a floating point number " + this.value);
                return null;
            }
            return this.value;
        },
        resetValue: function resetValue() {
            this.setValue(this.value);
        },
        setValue: function setValue(v) {
            if (Apoco.type.blank.check(v)) {
                this.input[0].value = "";
                this.input[1].value = "";
                this.value = "";
                return;
            }
            if (!Apoco.type["float"].check(v)) {
                throw new Error("FloatField: setValue this value is not a float " + v);
            }
            v = parseFloat(v, 10).toFixed(this.precision);
            var p = v.toString().split(".");
            if (p.length !== 2) {
                throw new Error("value is not a floating point number" + v);
                return null;
            }
            this.input[0].value = p[0];
            this.input[1].value = p[1];
            this.value = v;
        },
        popupEditor: null
    };

    Apoco.Utils.extend(FloatField, _Field);

    var DateField = function DateField(d, element) {
        var that = this;
        d.field = "date";
        d.type = "date";
        _Field.call(this, d, element);
        this.input = document.createElement("input");
        this.input.type = this.html_type;
        if (this.required === true) {
            this.input.required = true;
        }
        this.element.appendChild(this.input);
        if (this.value) {
            this.input.value = this.value;
        }
        if (this.editable !== false) {
            if (navigator.appCodeName === "Mozilla") {
                this.input.type = "text";
                this.input.setAttribute("placeholder", "YYYY-MM-DD");
                Apoco.datepicker.init(this.input);
            } else {
                this.picker = document.createElement("datepicker");
                this.picker.setAttribute("type", "grid");
                this.input.appendChild(this.picker);
            }
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    Apoco.Utils.extend(DateField, _Field);

    var TimeField = function TimeField(d, element) {
        d.field = "time";
        d.type = "time";

        _Field.call(this, d, element);
        this.input = document.createElement("input");
        this.input.setAttribute("type", this.html_type);
        if (this.required === true) {
            this.input.required = true;
        }
        this.element.appendChild(this.input);
        if (this.editable === false) {
            this.input.readOnly = true;
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    Apoco.Utils.extend(TimeField, _Field);

    var CheckBoxField = function CheckBoxField(d, element) {
        d.field = "checkBox";
        d.type = "boolean";
        _Field.call(this, d, element);
        this.input = document.createElement("input");
        this.input.setAttribute("type", this.html_type);
        this.input.className = "check_box";

        this.element.appendChild(this.input);
        if (this.required === true) {
            this.input.required = true;
        }
        this.setValue(this.value);
        if (this.editable === false) {
            this.input.setAttribute("disabled", true);
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    CheckBoxField.prototype = {
        getValue: function getValue() {
            return this.input.checked;
        },
        setValue: function setValue(val) {
            if (val === "true" || val === true || val === 1) {
                this.input.setAttribute("checked", "checked");
            } else {
                if (this.input.hasAttribute("checked")) {
                    this.input.removeAttribute("checked");
                }
            }
        },
        popupEditor: function popupEditor(func) {
            if (this.editable === true) {
                var cb = function (that) {
                    return function (e) {
                        e.stopPropagation();
                        func(that.input.checked);
                    };
                }(this);
                this.input.AddEventListener("click", cb, false);
            }
        }
    };

    Apoco.Utils.extend(CheckBoxField, _Field);

    var NumberArrayField = function NumberArrayField(d, element) {
        if (!d.size && !d.value) {
            throw new Error("NumberArrayfield needs a size or value");
        }
        d.field = "numberArray";
        _Field.call(this, d, element);
        if (!this.size) {
            this.size = this.value.length;
        }
        this.input = new Array(this.size);
        this.popup = true;
        if (this.type === "floatArray" && this.step === undefined) {
            this.step = 0.1;
        }
        if (this.value && !Apoco.type.array.check(this.value)) {
            throw new Error("NumberArrayField: value is not an array");
        }
        for (var i = 0; i < this.input.length; i++) {
            this.input[i] = {};
            if (this.value) {
                this.input[i].value = this.value[i] || "";
            }
            this.addValue(i, "internal");
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    NumberArrayField.prototype = {
        addValue: function addValue(i, internal) {
            var s;
            if (internal !== "internal") {
                var v = i;
                i = this.input.length;
                this.input[i] = {};
                this.input[i].value = v;
            }
            this.input[i].input = document.createElement("input");
            this.input[i].input.setAttribute("type", this.html_type);
            this.input[i].input.className = this.type;
            if (this.required === true) {
                this.input[i].input.required = true;
            }
            this.input[i].input.value = this.input[i].value;
            if (this.delimiter !== undefined) {
                if (i > 0 && i < this.input.length - 1) {
                    s = document.createElement("span");
                    s.textContent = this.delimiter;
                    this.element[0].appendChild(s);
                }
            }
            if (this.editable === false) {
                this.input[i].input.readOnly = true;
            } else {
                if (this.min) {
                    this.input[i].input.setAttribute("min", this.min);
                }
                if (this.max) {
                    this.input[i].input.setAttribute("max", this.max);
                }
                if (this.step) {
                    this.input[i].input.setAttribute("step", this.step);
                }
            }
            this.element.appendChild(this.input[i].input);
            return true;
        },
        deleteValue: function deleteValue(value) {
            var index = -1;
            for (var i = 0; i < this.input.length; i++) {
                if (this.input[i].value === value) {
                    if (index !== -1) {
                        throw new Error("Mpre than one values matches " + value);
                    }
                    index = i;
                }
            }
            if (index !== -1) {
                this.input.splice(index, 1);
            }
        },
        setValue: function setValue(v) {
            if (v.length > this.input.length) {
                throw new Error("NumverArratField: input array size is less than value size");
            }
            for (var i = 0; i < this.input.length; i++) {
                if (v[i]) {
                    this.input[i].input.value = Number(v[i]);
                } else {
                    this.input[i].input.value = "";
                }
            }
            this.value = v;
        },
        getValue: function getValue(index) {
            if (index !== undefined && index < this.input.length) {
                return this.input[index].input.value;
            }
            var v = new Array();
            for (var i = 0; i < this.input.length; i++) {
                v[i] = this.input[i].input.value;
            }
            return v;
        },
        popupEditor: function popupEditor(func) {
            if (this.input.length > 0) {
                var r = this.getValue();
                this.element.addEventListener("keypress", function (event) {
                    event.stopPropagation();
                    if (event.which === 13) {
                        func(r);
                    }
                }, false);
            }
            throw new Error("no input element for this type " + this.type);
        }
    };

    Apoco.Utils.extend(NumberArrayField, _Field);

    var TextAreaField = function TextAreaField(d, element) {
        d.field = "textArea";
        d.type = "text";
        _Field.call(this, d, element);
        this.popup = true;
        this.input = document.createElement("textarea");
        if (this.required === true) {
            this.input.required = true;
        }
        this.element.appendChild(this.input);
        if (this.value) {
            this.input.value = this.value;
        }
        if (this.editable === false) {
            this.input.readOnly = true;
            this.popup = false;
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    TextAreaField.prototype = {
        popupEditor: function popupEditor(func, ok, cancel) {
            if (ok && ok.length > 0 && cancel && cancel.length > 0) {
                var cb = function (that) {
                    return function (e) {
                        e.stopPropagation();
                        that.value = that.input.val();
                        func(that.input.val());
                    };
                }(this);
                var bb = function (that) {
                    return function (e) {
                        e.stopPropagation();
                        func(null);
                    };
                }(this);
                ok.addEventListener("click", cb, false);
                cancel.addEventListener("click", bb, false);
            } else {
                throw new Error("no input element for this type " + this.type);
            }
        }
    };

    Apoco.Utils.extend(TextAreaField, _Field);

    var SelectField = function SelectField(d, element) {
        var i,
            o,
            that = this;
        d.field = "select";
        d.type = "string";
        _Field.call(this, d, element);

        var options = document.createElement("select");
        if (this.required === true) {
            options.required = true;
        }
        for (i = 0; i < this.options.length; i++) {

            o = document.createElement("option");
            o.value = this.options[i];
            o.textContent = this.options[i];
            options.appendChild(o);
        }
        if (this.blank_option === true) {
            o = document.createElement("option");
            o.value = "";
            options.appendChild(o);
        }
        this.select = options;
        var cd = function (that) {
            return function (e) {
                e.stopPropagation();
                if (e.keyCode === 13) {
                    if (that.input.style.visibility === "visible") {
                        that.input.style.visibility = "hidden";
                        that.select.style.visibility = "visible";
                        console.log("target value" + e.target.value);
                        o = document.createElement("option");
                        o.value = e.target.value;
                        o.textContent = e.target.value;
                        that.select.appendChild(o);
                        that.options.push(that.select.value);
                        that.select.value = e.target.value;
                    }
                }
            };
        }(this);

        var mk_input = function mk_input() {
            that.input = document.createElement("input");
            that.input.setAttribute("type", that.html_type);
            that.element.appendChild(that.input);
            that.input.addEventListener("keypress", cd);
        };

        this.select.addEventListener("change", function () {
            console.log("select option has changed");
            if (that.select.value === "") {
                if (!that.input) {
                    mk_input();
                }
                that.select.style.visibility = "hidden";
                that.input.style.visibility = "visible";
                that.input.focus();
            } else if (that.edit_func) {
                var v = that.getValue();
                that.value = v;
                if (that.edit_func.context) {
                    that.edit_func.cmd.call(that.edit_func.context, v);
                } else that.edit_func(v);
            }
        });

        if (this.value) {
            this.select.value = this.value;
        }
        this.element.appendChild(this.select);
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    SelectField.prototype = {
        setValue: function setValue(v) {
            for (var i = 0; i < this.options.length; i++) {
                if (this.options[i] == v) {
                    this.select.value = v;
                    this.value = v;
                    return;
                }
            }
            if (this.input) {
                this.input.value = v;
                this.value = v;
                return;
            }
            throw new Error("SelectField: Cannot set value to " + v);
        },
        getValue: function getValue() {

            if (this.input && this.input.value) {
                var v = this.input.value;
            } else {
                var v = this.select.value;
            }
            if (v && v.length > 0) {
                return v;
            }
            return null;
        },
        popupEditor: function popupEditor(func) {
            this.edit_func = func;
        },
        resetValue: function resetValue() {
            this.select.value = this.value;
            return this.select.value;
        }

    };

    Apoco.Utils.extend(SelectField, _Field);

    var ButtonSetField = function ButtonSetField(d, element) {
        d.field = "ButtonSetField";
        d.type = "boolean";
        if (!d.labels || d.labels.length === 0) {
            throw new Error("must have a labels array for ButtonSetField");
        }

        _Field.call(this, d, element);
        this.input = [];
        if (!this.value) {
            this.value = [];
        }

        for (var i = 0; i < this.labels.length; i++) {
            this.input[i] = {};
            this.input[i].label = this.labels[i];
            if (!this.value[i]) {
                this.value[i] = false;
            }
        }
        this.labels.length = 0;
        this.popup = true;
        var u = document.createElement("ul");
        u.className = "choice";
        this.element.appendChild(u);

        for (var i = 0; i < this.input.length; i++) {
            this.addValue(i);
        };
        this.setValue(this.value);
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    ButtonSetField.prototype = {
        addValue: function addValue(index, value) {
            var l, p;
            if (index === undefined) {
                throw new Error("ButtonSetField: must supply a name");
            }
            if (!Apoco.type["integer"].check(index)) {
                var label = index;
                index = this.input.length;
                this.input[index] = {};
                this.input[index].label = label;
                this.value[index] = value ? value : false;
            }
            l = document.createElement("li");
            this.element.getElementsByTagName('ul')[0].appendChild(l);
            this.input[index].input = document.createElement("input");
            if (this.checkbox === true) {
                this.input[index].input.type = "checkbox";
            } else {
                this.input[index].input.type = "radio";
            }
            this.input[index].input.checked = this.value[index];
            l.appendChild(this.input[index].input);
            p = document.createElement("p");
            p.textContent = this.input[index].label;
            l.appendChild(p);

            if (this.checkbox !== true) {
                this.input[index].input.addEventListener("click", function (that, node) {
                    return function (e) {
                        e.stopPropagation();
                        for (var i = 0; i < that.input.length; i++) {
                            if (that.input[i].input !== node) {
                                that.input[i].input.checked = false;
                            }
                        }
                    };
                }(this, this.input[index].input));
            }
            return true;
        },
        resetValue: function resetValue() {
            for (var i = 0; i < this.input.length; i++) {
                this.input[i].input.checked = this.value[i];
            }
        },
        setValue: function setValue(value, index) {
            var t = 0;
            if (!Apoco.type["array"].check(value)) {
                if (index !== undefined && index <= this.input.length) {
                    if (this.checkbox !== true) {
                        if (value === true) {
                            for (var i = 0; i < this.input.length; i++) {
                                this.input[i].input.checked = false;
                                this.value[i] = false;
                            }
                        }
                    }
                    this.input[index].input.checked = value;
                    this.value[index] = value;
                } else {
                    throw new Error("ButtonSetField: value must be a boolean array");
                }
                return;
            }

            if (value.length !== this.input.length) {
                throw new Error("ButtonSetField: values array length " + value.length + " does not match labels " + this.input.length);
            } else if (this.checkbox !== true) {
                for (var i = 0; i < value.length; i++) {
                    if (value[i] === true) {
                        t++;
                    }
                }
                if (t > 1) {
                    throw new Error("ButtonSetField: only one true value for radio buttons");
                }
            }
            for (var i = 0; i < value.length; i++) {
                this.value[i] = value[i];
                this.input[i].input.checked = value[i];
            }
        },
        deleteValue: function deleteValue(label) {
            var that = this;
            var index = null;
            for (var i = 0; i < this.input.length; i++) {
                if (this.input[i].label === label) {
                    index = i;
                    break;
                }
            }
            if (index !== null) {
                var p = this.input[index].input.parentNode;
                p.removeChild(this.input[index].input);
                this.input.splice(index, 1);
                p.parentNode.removeChild(p);
            } else {
                throw new Error("could not remove value " + value);
            }
        },
        getValue: function getValue() {
            var ar = [],
                p;
            for (var i = 0; i < this.input.length; i++) {
                p = {};
                p[this.input[i].label] = this.input[i].input.checked;
                ar[i] = p;
            }
            return ar;
        },
        checkValue: function checkValue() {
            if (this.required) {
                for (var i = 0; i < this.input.length; i++) {
                    if (this.input[i].input.checked === true) {
                        return true;
                    }
                }
            } else {
                return true;
            }
            return false;
        }
    };
    Apoco.Utils.extend(ButtonSetField, _Field);

    var SliderField = function SliderField(d, element) {
        d.field = "SliderField";
        d.type = "range";
        d.html_type = "range";
        _Field.call(this, d, element);
        this.popup = true;
        this.input = document.createElement("input");
        this.input.setAttribute("type", this.type);
        this.element.appendChild(this.input);
        var that = this;
        if (this.min) {
            this.input.setAttribute("min", this.min);
        }
        if (this.max) {
            this.input.setAttribute("max", this.max);
        }
        if (this.step) {
            this.input.setAttribute("step", this.step);
        }
        this.value = this.value ? this.value : this.min;
        this.input.value = this.value;
        if (this.editable === false) {
            this.input.readOnly = true;
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    Apoco.Utils.extend(SliderField, _Field);

    var StringArrayField = function StringArrayField(d, element) {
        d.field = "StringArrayField";
        d.type = "stringArray";
        _Field.call(this, d, element);
        this.popup = true;
        var that = this;
        var array_length = 0;
        this.input = [];
        var dv = document.createElement("div");
        dv.className = "list_container";
        this.element.appendChild(dv);
        var u = document.createElement("ul");
        u.className = "string_fieldset";
        dv.appendChild(u);
        if (this.value && this.value.length > 0) {
            array_length = this.value.length;
        }
        if (!this.length) {
            this.length = array_length;
        }
        this.length = Math.max(this.length, array_length);

        if (this.length === 0) {
            this.length = 4;
        }
        for (var i = 0; i < this.length; i++) {
            if (this.value[i]) {
                this.addValue(this.value[i], i);
            } else {
                this.addValue("", i);
            }
        }

        if (this.editable !== false) {
            var sp = document.createElement("span");
            sp.classList.add("plus", "ui-icon", "ui-icon-plusthick");
            var p = this.element.getElementsByTagName("li")[this.element.getElementsByTagName("li").length - 1];
            p.appendChild(sp);
            var sm = document.createElement("span");
            sm.classList.add("minus", "ui-icon", "ui-icon-minusthick");
            p.appendChild(sm);
            var addremove = function addremove(add) {
                var l = that.input.length,
                    n;
                sp.parentNode.removeChild(sp);
                sm.parentNode.removeChild(sm);
                if (add === "add") {
                    that.addValue("", l);
                } else {
                    that.deleteValue(l - 1);
                }
                n = parseInt(that.element.getElementsByTagName("li").length - 1, 10);
                var last_element = that.element.getElementsByTagName("li")[n];
                last_element.appendChild(sp);
                last_element.appendChild(sm);
            };

            sp.addEventListener("click", function (e) {
                e.stopPropagation();
                addremove("add");
            });
            sm.addEventListener("click", function (e) {
                e.stopPropagation();
                addremove("remove");
            });
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    StringArrayField.prototype = {
        setValue: function setValue(v, index) {
            if (!Apoco.type["array"].check(v)) {
                if (index !== undefined && index < this.length) {
                    this.input[index].input.value = v;
                    this.value[index] = v;
                } else {
                    throw new Error("StringArrayField: setValue not an array");
                }
            } else {
                if (v.length <= this.length) {
                    for (var i = 0; i < v.length; i++) {
                        this.input[i].input.value = v[i];
                        this.value[i] = v[i];
                    }
                } else {
                    throw new Error("StringArrayField: setValue array is too long");
                }
            }
        },
        getValue: function getValue() {
            var vals = [],
                t;
            for (var i = 0; i < this.input.length; i++) {
                t = this.input[i].input.value;
                if (t !== "") {
                    vals.push(this.input[i].input.value);
                }
            }
            return vals;
        },
        deleteValue: function deleteValue(i) {
            var t;
            if (this.input.length > 1) {
                t = this.input[i].input.parentNode;
                this.input.splice(i, 1);
                if (this.value[i]) {
                    this.value.splice(i, 1);
                }
                t.parentNode.removeChild(t);
            }
        },
        addValue: function addValue(value, i) {
            if (i === undefined) {
                i = this.input.length;
            }
            this.input[i] = {};
            var element = document.createElement("li");
            element.className = "string";
            this.input[i].input = document.createElement("input");
            if (this.required === true) {
                this.input[i].input.required = true;
            }
            this.input[i].input.setAttribute("type", "string");
            element.appendChild(this.input[i].input);
            this.element.getElementsByClassName("string_fieldset")[0].appendChild(element);

            this.input[i].input.value = value;
            if (this.editable === false) {
                this.input[i].input.readOnly = true;
            }
        },
        checkValue: function checkValue() {
            var valid;
            this.required ? valid = false : valid = true;
            var v = this.getValue();
            for (var i = 0; i < v.length; i++) {
                if (this.required) {
                    if (!Apoco.type["blank"].check(v[i])) {
                        valid = true;
                    }
                }
                if (!Apoco.type["string"].check(v[i])) {
                    valid = false;
                    break;
                }
            }
            if (!valid) {
                this.displayInvalid();
            }
            return valid;
        },
        resetValue: function resetValue() {
            var v;
            for (var i = 0; i < this.length; i++) {
                v = this.value[i] ? this.value[i] : "";
                if (this.input[i]) {
                    this.input[i].input.value = v;
                } else {
                    this.addValue(v, i);
                }
            }
            if (this.input.length > this.length && this.length > 0) {
                console.log("this input length " + this.input.length + " original length " + this.length);
                for (var i = this.input.length - 1; i > this.length; i--) {
                    this.deleteValue(i);
                }
            }
        }
    };

    Apoco.Utils.extend(StringArrayField, _Field);

    var ImageArrayField = function ImageArrayField(d, element) {
        var that = this;
        var new_values = [];
        this.promises = [];
        d.field = "ImageArrayField";
        d.type = "imageArray";
        _Field.call(this, d, element);
        this.popup = true;

        this.width = this.width ? this.width : 120;
        this.height = this.height ? this.height : 90;
        if (!this.value) {
            this.value = [];
        }
        if (this.editable !== false) {
            if (!window.FileReader) {
                Apoco.popup.dialog("Sorry No FileReader", "Your browser does not support the image reader");
                throw new Error("No FileReader");
            }
            this.input = document.createElement("input");
            this.input.type = "file";
            if (this.required === true) {
                this.input.required = true;
            }
            this.input.setAttribute("name", "files");
            this.input.setAttribute("multiple", "multiple");
            this.element.appendChild(this.input);
            this.input.addEventListener("change", function (e) {
                that._getImageFileSelect(e);
            });
        }

        if (this.value && this.value.length > 0) {
            this.loadImages();
        }
        if (this.thumbnails === true) {
            this.mkThumbnails();
        }
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    ImageArrayField.prototype = {
        _getImage: function _getImage(o) {
            var that = this;
            var imm = document.createElement("img");
            imm.src = o.src;
            var promise = new Promise(function (resolve, reject) {
                imm.onload = function () {
                    o.width = parseFloat(this.width);
                    o.height = parseFloat(this.height);
                    o.title = o.name;
                    o.image = imm;
                    o.aspect_ratio = parseFloat(this.width / this.height);
                    resolve(o);
                };
                imm.onerror = function () {
                    o.image = null;
                    reject("Field:ImageArray._getImage Could not load image " + o.src);
                };
            });
            return promise;
        },
        _getImageFileSelect: function _getImageFileSelect(evt) {
            var that = this;
            var td = this.element.querySelector("div.thumbnails");

            evt.stopPropagation();
            var files = new Array();
            for (var i = 0; i < evt.target.files.length; i++) {
                if (evt.target.files[i].type.match('image.*')) {
                    files.push(evt.target.files[i]);
                }
            }
            var count = that.value.length;
            var last = count + files.length;
            for (var i = count, j = 0; i < last; i++, j++) {
                var reader = new FileReader();
                reader.onload = function (f, num) {
                    console.log("getImagefileselect  file is  %j", f);
                    return function (e) {
                        var p;
                        e.stopPropagation();
                        that.value[num] = { src: e.target.result, name: f.name };
                        that.promises[num] = that._getImage(that.value[num]);
                        if (that.thumbnails === true) {
                            that._addThumbnail(td, num);
                        }
                    };
                }(files[j], i);
                reader.readAsDataURL(files[j]);
            }
        },
        loadImages: function loadImages(values) {
            var i = 0,
                last,
                that = this;
            if (values !== undefined && Apoco.type["array"].check(values)) {
                i = this.value.length;
                this.value = this.value.concat(values);
            }
            last = this.value.length;

            for (i; i < last; i++) {
                this.promises[i] = that._getImage(that.value[i]);
            }

            return this.promises;
        },
        finishedLoading: function finishedLoading() {
            return Promise.all(this.promises);
        },
        _addThumbnail: function _addThumbnail(pp, i) {
            var that = this,
                div = document.createElement("div");
            if (this.value[i].name) {
                div.setAttribute("name", this.value[i].name);
            }
            pp.appendChild(div);

            if (this.value[i].label) {
                var r = document.createElement("h5");
                r.textContent = this.value[i].label;
                div.appendChild(r);
            }
            this.promises[i].then(function (el) {
                return function (v) {
                    if (!v.image) {
                        throw new Error("mkThumbnails: image does not exist");
                    }
                    if (that.width) {
                        v.image.style.width = that.width.toString() + "px";
                    }
                    if (that.height) {
                        v.image.style.height = that.height.toString() + "px";
                    }
                    el.appendChild(v.image);
                };
            }(div));
        },
        mkThumbnails: function mkThumbnails() {
            var that = this,
                el;
            var td = this.element.querySelector("div.thumbnails");
            if (!td) {
                td = document.createElement("div");
                td.className = "thumbnails";
                this.element.appendChild(td);
            }
            for (var i = 0; i < this.value.length; i++) {
                that._addThumbnail(td, i);
            }
        },
        resetValue: function resetValue() {
            return;
        },
        getValue: function getValue() {
            return this.value;
        },
        checkValue: function checkValue() {
            return true;
        },
        deleteValue: function deleteValue(title) {
            var index = -1;
            for (var i = 0; i < this.value; i++) {
                if (this.value[i].title == title) {
                    index = i;
                    break;
                }
            }
            if (index > 0) {
                this.value.splice(index, 1);
            }
            if (this.thumbnails) {
                this.mk_thumbnails();
            }
        }
    };

    Apoco.Utils.extend(ImageArrayField, _Field);

    var AutoCompleteField = function AutoCompleteField(d, element) {
        var v,
            rect,
            offset = {};
        var box,
            that = this;
        var contains = function contains(arr, item) {
            var count = 0,
                a,
                n = [];

            item = item.toLowerCase();
            for (var i = 0; i < arr.length; i++) {
                a = arr[i].toLowerCase();
                if (a.indexOf(item) !== -1) {
                    n[count] = arr[i];
                    count++;
                }
                if (count === 4) {
                    return n;
                }
            }
            return n;
        };
        function getOffset(object, offset) {
            if (!object) {
                return;
            }
            offset.x += object.offsetLeft;
            offset.y += object.offsetTop;
            getOffset(object.offsetParent, offset);
        }

        d.field = "AutoCompleteField";
        d.type = "string";

        _Field.call(this, d, element);
        box = document.createElement("div");
        box.classList.add(this.type, "apoco_autocomplete");
        this.element.appendChild(box);
        this.input = document.createElement("input");
        if (this.required === true) {
            this.input.required = true;
        }
        this.input.setAttribute("type", this.html_type);
        box.appendChild(this.input);

        Apoco.sort(this.options, "string");

        var select = document.createElement("ul");
        select.classList.add("choice", "ui-autocomplete", "ui-menu", "ui-front", "ui-widget-content");
        select.style.visibility = "hidden";
        select.addEventListener("click", function (e) {
            if (e.target.tagName === "LI") {
                e.stopPropagation();
                e.preventDefault();
                that.input.value = e.target.textContent;
                select.style.visibility = "hidden";
            }
        });
        select.addEventListener("mouseover", function (e) {
            if (e.target.tagName === "LI") {
                e.stopPropagation();
                e.preventDefault();
                e.target.classList.add("ui-state-hover");
            }
        });

        select.addEventListener("mouseout", function (e) {
            if (e.target.tagName === "LI") {
                e.stopPropagation();
                e.preventDefault();
                e.target.classList.remove("ui-state-hover");
            }
        });

        box.appendChild(select);
        var options = [];
        for (var i = 0; i < 4; i++) {
            options[i] = document.createElement("li");
            select.appendChild(options[i]);
        }

        this.input.addEventListener("keyup", function (e) {
            var r;
            e.stopPropagation();
            v = that.input.value;
            offset = { x: 0, y: 0 };
            rect = that.input.getBoundingClientRect();
            getOffset(select, offset);
            select.style.top = (rect.bottom + window.scrollY - offset.y).toString() + "px";
            select.style.left = (rect.left + window.scrollX - offset.x).toString() + "px";
            select.style.visibility = "hidden";
            r = contains(that.options, v);
            for (var i = 0; i < r.length; i++) {
                options[i].textContent = r[i];
            }
            select.style.visibility = "visible";
            this.value = v;
        });
        if (this.action) {
            this.action(this);
        }
        return this;
    };

    AutoCompleteField.prototype = {
        popupEditor: null
    };

    Apoco.Utils.extend(AutoCompleteField, _Field);

    Apoco.field = {
        exists: function exists(field) {
            if (this[field]) {
                return true;
            }
            return false;
        },
        input: function input(options, element) {
            return new InputField(options, element);
        },
        inputMethods: function inputMethods() {
            var n = [];for (var k in InputField.prototype) {
                n.push(k);
            }return n;
        },
        float: function float(options, element) {
            return new FloatField(options, element);
        },
        floatMethods: function floatMethods() {
            var n = [];for (var k in FloatField.prototype) {
                n.push(k);
            }return n;
        },
        date: function date(options, element) {
            return new DateField(options, element);
        },
        dateMethods: function dateMethods() {
            var n = [];for (var k in DateField.prototype) {
                n.push(k);
            }return n;
        },
        time: function time(options, element) {
            return new TimeField(options, element);
        },
        timeMethods: function timeMethods() {
            var n = [];for (var k in TimeField.prototype) {
                n.push(k);
            }return n;
        },
        numberArray: function numberArray(options, element) {
            return new NumberArrayField(options, element);
        },
        numberArrayMethods: function numberArrayMethods() {
            var n = [];for (var k in NumberArrayField.prototype) {
                n.push(k);
            }return n;
        },
        textArea: function textArea(options, element) {
            return new TextAreaField(options, element);
        },
        textAreaMethods: function textAreaMethods() {
            var n = [];for (var k in TextAreaField.prototype) {
                n.push(k);
            }return n;
        },
        select: function select(options, element) {
            return new SelectField(options, element);
        },
        selectMethods: function selectMethods() {
            var n = [];for (var k in SelectField.prototype) {
                n.push(k);
            }return n;
        },
        checkBox: function checkBox(options, element) {
            return new CheckBoxField(options, element);
        },
        checkBoxMethods: function checkBoxMethods() {
            var n = [];for (var k in CheckBoxField.prototype) {
                n.push(k);
            }return n;
        },
        slider: function slider(options, element) {
            return new SliderField(options, element);
        },
        sliderMethods: function sliderMethods() {
            var n = [];for (var k in SliderField.prototype) {
                n.push(k);
            }return n;
        },
        buttonSet: function buttonSet(options, element) {
            return new ButtonSetField(options, element);
        },
        buttonSetMethods: function buttonSetMethods() {
            var n = [];for (var k in ButtonSetField.prototype) {
                n.push(k);
            }return n;
        },
        stringArray: function stringArray(options, element) {
            return new StringArrayField(options, element);
        },
        stringArrayMethods: function stringArrayMethods() {
            var n = [];for (var k in StringArrayField.prototype) {
                n.push(k);
            }return n;
        },
        imageArray: function imageArray(options, element) {
            return new ImageArrayField(options, element);
        },
        imageArrayMethods: function imageArrayMethods() {
            var n = [];for (var k in ImageArrayField.prototype) {
                n.push(k);
            }return n;
        },
        autoComplete: function autoComplete(options, element) {
            return new AutoCompleteField(options, element);
        },
        autoCompleteMethods: function autoCompleteMethods() {
            var n = [];for (var k in AutoCompleteField.prototype) {
                n.push(k);
            }return n;
        }
    };
})();

},{"./Sort":14,"./Types":15,"./Utils":16,"./datepicker":18,"./declare":19,"es6-promise":43}],10:[function(require,module,exports){
'use strict';

var Apoco = require('./declare').Apoco;
var Promise = require('es6-promise').Promise;

;(function () {

    Apoco.IO = {
        _subscribers: {},
        dispatch: function dispatch(name, args) {
            if (this._subscribers[name]) {
                try {
                    this._subscribers[name].forEach(function (s) {
                        if (!s.action) {
                            throw new Error("No action for " + s);
                        }

                        s.action(s.context, args);
                    });
                } catch (err) {
                    throw new Error("_Subscriber error on " + name + " " + err);
                }
            }
        },
        listen: function listen(that) {
            if (that === undefined || that.listen === undefined) {
                throw new Error("IO.listen needs an object");
            }
            for (var i = 0; i < that.listen.length; i++) {
                var n = that.listen[i].name;

                if (!this._subscribers[n]) {
                    this._subscribers[n] = [];
                }
                this._subscribers[n].push({ context: that, action: that.listen[i].action });
            }
        },
        unsubscribe: function unsubscribe(that) {
            var index = -1;

            for (var i = 0; i < that.listen.length; i++) {
                if (this._subscribers[that.listen[i].name]) {
                    for (var j = 0; j < this._subscribers[that.listen[i].name].length; j++) {
                        if (this._subscribers[that.listen[i].name][j]["context"].action === that.action) {
                            this._subscribers[that.listen[i].name].splice(j, 1);
                            index = j;
                        }
                    }
                }
            }
            if (index !== -1) {
                if (this._subscribers[that.listen[index].name].length === 0) {
                    delete this._subscribers[that.listen[index].name];
                }
                return undefined;
            } else {
                console.log("Apoco.unsubscribe could not find listener");
                return null;
            }
        },
        publish: function publish(that) {
            if (that === undefined || that.publish === undefined) {
                throw new Error("IO.publish needs an object");
            }

            for (var i = 0; i < that.publish.length; i++) {

                if (that.publish[i].data) {
                    this.dispatch(that.publish[i].name, that.publish[i].data);
                } else if (that.publish[i].action) {
                    that.publish[i].action(that, that.publish[i].name);
                } else {
                    throw new Error("incorrect method for apoco.publish");
                }
            }
        },
        webSocket: function webSocket(options, data) {
            var that = this;
            if (UI && UI.webSocketURL) {
                var defaults = { url: UI.webSocketURL };
            } else {
                var defaults = { url: "." };
            }
            var settings = {};
            var sendMessage = function sendMessage(data) {
                var msg = JSON.stringify(data);

                try {
                    Apoco.webSocket.send(msg + '\n');
                } catch (err) {
                    Apoco.popup.error("websocket send", ("Could not send websocket message %j ", err));
                }
            };
            settings.url = defaults.url;
            for (var k in options) {
                settings[k] = options[k];
            }

            if (!Apoco.webSocket) {
                var a = { 'http:': 'ws:', 'https:': 'wss:', 'file:': 'wstest:' }[window.location.protocol];

                if (!a) {
                    throw new Error("IO: Cannot get protocol for window " + window.location);
                }

                try {
                    Apoco.webSocket = new WebSocket(a + "//" + window.location.host + settings.url);
                    Apoco.webSocket.onopen = function (e) {
                        if (data !== undefined) {
                            sendMessage(data);
                        }
                    };
                } catch (err) {
                    throw new Error("webSocket: failed to open" + err);
                }
            } else if (data !== undefined) {
                sendMessage(data);
            }

            Apoco.webSocket.onerror = function (e) {
                Apoco.popup.error("webSocket", "Received an error msg");
            };
            Apoco.webSocket.onclose = function (e) {
                if (e.code !== 1000) {
                    Apoco.popup.error("webSocket abnormal termination", "Exiting with code" + e.code);
                }
            };
            Apoco.webSocket.onmessage = function (e) {
                if (!e.data) {
                    throw new Error("webSocket: no data or name from server");
                }
                var d = JSON.parse(e.data);
                console.log("got: %j %j", d[0], d[1]);
                if (d[0] === "error") {
                    Apoco.popup.dialog("Error", JSON.stringify(d[1]));
                } else {
                    that.dispatch(d[0], d[1]);
                }
            };
        },
        REST: function REST(type, options, data) {
            var defaults = { dataType: 'json', mimeType: 'application/json' };
            if (UI && UI.URL) {
                defaults.url = UI.URL;
            } else {
                defaults.url = ".";
            }

            if (type !== "GET" && type !== "POST") {
                throw new Error("REST: only knows about GET and POST not " + type);
            }

            var settings = {};
            for (var k in defaults) {
                settings[k] = defaults[k];
            }
            for (var k in options) {
                settings[k] = options[k];
            }
            if (settings.url === "") {
                throw new Error("Apoco.REST Must have a url");
            }
            data = JSON.stringify(data);


            var promise = new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                var stateChange = function stateChange() {
                    if (request.readyState === XMLHttpRequest.DONE) {
                        if (request.status === 200) {
                            resolve(JSON.parse(request.responseText));
                        } else {
                            reject(request.status);
                            if (!request) {
                                throw new Error("REST failed with no return from server");
                            }
                            Apoco.display.statusCode[request.status](request.statusText + " " + request.responseText);
                        }
                    }
                };
                var reqFail = function reqFail(e) {
                    reject(request.status);
                };
                request.onreadystatechange = stateChange;
                request.open(type, settings.url);
                request.addEventListener('error', reqFail);
                if (type === "POST") {
                    request.setRequestHeader("Content-Type", settings.mimeType);
                    request.send(data);
                } else {
                    request.responseType = settings.mimeType;
                    request.send();
                }
            });

            return promise;
        }
    };
})();

},{"./declare":19,"es6-promise":43}],11:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./Types.js");


;(function () {

    var _Node = function _Node(d, element) {
        if (!d) {
            throw new Error("Apoco: node, No params");
        }
        if (d && !d.node) {
            throw new Error("Apoco: node doesn't know how to make", d.node);
        };
        for (var k in d) {
            this[k] = d[k];
        }
        _getNode[d.node](this);

        if (this.class) {
            this.element.classList.add(this.class);
        }
        if (this.id) {
            this.element.id = this.id;
        }
        if (this.name) {
            this.element.setAttribute("name", this.name);
        }
        if (element) {
            element.appendChild(this.element);
        }
    };

    _Node.prototype = {
        getElement: function getElement() {
            return this.element;
        },
        setText: function setText(text) {
            switch (this.node) {
                case "heading":
                case "paragraph":
                case "label":
                case "anchor":
                    this.element.innerHTML = text;
                    this.text = text;
                    return;
                default:
                    throw new Error("Cannot set text of " + this.node);
            }
        }
    };

    var _getNode = {
        anchor: function anchor(that) {
            that.element = document.createElement("a");
            that.element.href = that.href;
            that.element.textContent = that.text;
            if (that.target) {
                that.element.target = "_blank";
            }
        },
        whatever: function whatever(that) {
            if (that.nodeType) {
                that.element = document.createElement(that.nodeType);
                if (that.element !== null) {
                    if (that.text) {
                        that.element.textContent = that.text;
                    }
                }
                if (that.attr) {
                    for (var i = 0; i < that.attr.length; i++) {
                        for (var k in that.attr[i]) {
                            that.element.setAttribute(k, that.attr[i][k]);
                        }
                    }
                }
            } else {
                throw new Error("Node: whatever no nodeType specified");
            }
        },
        heading: function heading(that) {
            switch (that.size) {
                case "h1":
                case "H1":
                    that.element = document.createElement("h1");
                    that.element.textContent = that.text;
                    return;
                case "h2":
                case "H2":
                    that.element = document.createElement("h2");
                    that.element.textContent = that.text;
                    return;
                case "h3":
                case "H3":
                    that.element = document.createElement("h3");
                    that.element.textContent = that.text;
                    return;
                case "h4":
                case "H4":
                    that.element = document.createElement("h4");
                    that.element.textContent = that.text;
                    return;
                case "h5":
                case "H5":
                    that.element = document.createElement("h5");
                    that.element.textContent = that.text;
                    return;
                case "h6":
                case "H6":
                    that.element = document.createElement("h6");
                    that.element.textContent = that.text;
                    return;
                default:
                    throw new Error("invalid arg for header " + that.size);
            };
        },
        label: function label(that) {
            that.element = document.createElement("label");
            that.element.textContent = that.text;
            if (that.for) {
                that.element.htmlFor = that.for;
            }
        },
        code: function code(that) {
            that.element = document.createElement("code");
            if (that.text !== undefined) {
                that.element.textContent = that.text;
            }
        },
        paragraph: function paragraph(that) {
            that.element = document.createElement("p");
            if (that.text !== undefined) {
                that.element.innerHTML = that.text;
            }
        },
        list: function list(that) {
            that.element = document.createElement("ul");
            that.element.classList.add("list");
            for (var i = 0; i < that.list.length; i++) {
                var l = that.list[i];
                var el = document.createElement("li");
                el.textContent = l;
                that.element.appendChild(el);
            }
        },
        descriptionList: function descriptionList(that) {
            var d;
            if (that.items === undefined) {
                throw new Error("Node: descriptionList requires at least one item" + that.name);
            }
            that.element = document.createElement("dl");
            for (var i = 0; i < that.items.length; i++) {
                if (that.items[i].label) {
                    d = document.createElement("dt");
                    d.textContent = that.items[i].label;
                    that.element.appendChild(d);
                } else if (that.items[i].labels) {
                    if (Apoco.type['array'].check(that.items[i].labels)) {
                        for (var j = 0; j < that.items[i].labels.length; j++) {
                            d = document.createElement("dt");
                            d.textContent = that.items[i].labels[j];
                            that.element.appendChild(d);
                        }
                    }
                }
                if (that.items[i].description) {
                    d = document.createElement("dd");
                    d.innerHTML = that.items[i].description;
                    that.element.appendChild(d);
                } else if (that.items[i].descriptions) {
                    if (Apoco.type['array'].check(that.items[i].descriptions)) {
                        for (var j = 0; j < that.items[i].descriptions.length; j++) {
                            d = document.createElement("dd");
                            d.innerHTML = that.items[i].descriptions[j];
                            that.element.appendChild(d);
                        }
                    }
                }
            }
        },
        image: function image(that) {
            var imm = document.createElement("img");
            if (that.url !== undefined) {
                imm.src = that.url;
            } else if (that.src !== undefined) {
                imm.src = that.src;
            } else {
                throw new Error("Node: image no url or src parm supplied");
            }
            that.element = document.createElement("div");
            imm.onload = function () {
                if (that.width) {
                    this.width = that.width;
                } else {
                    that.element.style.width = this.width.toString() + "px";
                }
                if (that.height) {
                    this.height = that.height;
                } else {
                    that.element.style.height = this.height.toString() + "px";
                }
                that.element.appendChild(imm);
            };
        },
        clock: function clock(that) {
            that.element = document.createElement("div");
            that.element.classList.add("Apoco_clock");
            var cb = function cb(t) {
                var d = new Date();
                that.element.textContent = d.toLocaleTimeString();
            };
            window.setInterval(function () {
                cb(that);
            }, 1000);
        },
        button: function button(that) {
            var t = that.text ? that.text : that.name;
            that.element = document.createElement("button");
            that.element.type = "button";
            that.element.classList.add("ui-button");
            that.element.textContent = t;
            if (that.disabled === true) {
                that.element.setAttribute("disabled", "disabled");
            }
            if (that.action) {
                that.element.addEventListener("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    that.action(that);
                }, false);
            }
        },
        paginate: function paginate(that) {
            var n;
            if (!that.number) {
                throw new Error("paginate needs a number");
            }
            that.current_num = 0;

            that.element = document.createElement("div");
            that.element.classList.add("Apoco_paginate");
            var cb = function cb(index, el) {
                n = el.parentNode.childNodes;
                for (var i = 0; i < n.length; i++) {
                    n[i].classList.remove("ui-state-active");
                }
                el.classList.add("ui-state-active");
                that.current_num = index;
                that.action(that);
            };
            if (this.prevNext) {
                var n;
                var b = document.createElement("button");
                b.textContent = "previous";
                this.element.appendChild(b);
                b.addEventListener("click", function (e) {
                    e.stopPropagation();
                    if (that.current_num === 0) {
                        n = that.number - 1;
                    } else {
                        n = that.current_num - 1;
                    }
                    var t = this.element.getElementsByName(n)[0];
                    t.click();
                }, false);
            }
            for (var i = 0; i < that.number; i++) {
                var b = document.createElement("button");
                b.name = i;
                b.textContent = i + 1;
                that.element.appendChild(b);
                b.addEventListener("click", function () {
                    var index = i;
                    return function (e) {
                        e.stopPropagation();
                        cb(index, e.target);
                    };
                }(i), false);
            }
            if (this.prevNext) {
                var b = document.createElement("button");
                b.textContent = "next";
                this.element.appendChild(b);
                b.addEventListener("click", function (e) {
                    var n = (that.current_num + 1) % that.number;
                    var t = this.element.getElementsByName(n);
                    t.click();
                }, false);
            }
        } };

    Apoco.node = function (options, el) {
        if (options === "node_list") {
            var nl = {};
            for (var k in _getNode) {
                nl[k] = k;
            }
            return nl;
        } else {
            return new _Node(options, el);
        }
    };
})();

},{"./Types.js":15,"./declare":19}],12:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Apoco = require('./declare').Apoco;
require("./Utils");
require("./Popups");
require("./Window");

;(function () {
    'use strict';

    function check(ar) {
        if (!Apoco.type["object"].check(ar)) {
            throw new Error("This is not a window display object " + ar);
        }
        for (var i in ar) {
            var OK = 0;
            var msg = new String();
            for (var k in ar[i]) {
                switch (k) {
                    case "display":
                        var d = ar[i][k];

                        if (!Apoco.display[d]) {
                            msg = msg.concat("Apoco does not know how to create " + d);
                        } else {
                            OK++;
                        }
                        break;
                    case "DOM":
                        var d = true;
                        if (!ar[i][k] || ar[i][k].length === 0) {
                            d = false;
                        }

                        if (!d) {
                            msg = msg.concat("No Dom object called " + d);
                        } else {
                            OK++;
                        }
                        break;
                    case "id":
                        if (!ar[i][k] || ar[i][k].length === 0) {
                            msg = msg.concat("display objects must have an id");
                        } else {
                            OK++;
                        }
                        break;
                    default:
                        break;
                }
            }
            if (OK !== 3) {
                throw new Error(msg);
            }
        }
        return true;
    }

    Apoco.Panel = {
        _list: [],
        UIStart: function UIStart(w) {
            var nv;

            if (w === undefined) {
                throw new Error("Panel.UIStart needs a string array of valid UI Panel names");
            }
            for (var i = 0; i < w.length; i++) {
                nv = this._UIGet(w[i]);
                if (nv !== null) {
                    this.add(nv);
                } else {
                    throw new Error("Apoco.Panel: No panel called " + w[i] + " was found in UI.Panels");
                }
            }
        },
        _UIGet: function _UIGet(name) {
            if (name === undefined) {
                throw new Error("Panel._UIGet: panel name is undefined");
            }
            if ((typeof UI === "undefined" ? "undefined" : _typeof(UI)) === undefined) {
                throw new Error("Panels: UIGet needs UI.Panels to be defined");
            }
            if (_typeof(UI.Panels) === undefined) {
                throw new Error("Panel: UI.Panels is not defined");
            }
            for (var k in UI.Panels) {
                if (k == name) {
                    var cd = Apoco.cloneDeep(UI.Panels[k]);

                    return cd;
                }
            }
            return null;
        },
        _inList: function _inList(k) {
            if (k === undefined) {
                throw new Error("Panel: inList name is undefined");
            }
            for (var i = 0; i < this._list.length; i++) {
                if (this._list[i].name == k) {
                    return i;
                }
            }
            return null;
        },
        get: function get(k) {
            var u = this._inList(k);
            if (u !== null) {
                return this._list[u];
            }

            return null;
        },
        show: function show(k) {
            if (k === undefined) {
                throw new Error("Panel.show name is undefined");
            }
            var p = this.get(k);
            if (!p) {
                var w = this._UIGet(k);
                if (!w) {
                    throw new Error("Cannot find panel " + k);
                } else {
                    p = this.add(w);
                    if (p === null) {
                        throw new Error("Cannot find panel " + k);
                    }
                }
            }
            var c = p.getChildren();
            for (var i = 0; i < c.length; i++) {
                if (c[i].hidden !== true) {
                    c[i].show();
                }
            }
        },
        showAll: function showAll(win) {
            var w,
                tw = null;
            if (win !== undefined) {
                w = Apoco.Window.get(win);
                if (w === null) {
                    throw new Error("Panel.hideAll - cannot find window " + w);
                }
                tw = w.window;
            }
            for (var i = 0; i < this._list.length; i++) {
                if (tw !== null) {
                    if (this._list[i].window === tw) {
                        this.show(this._list[i].name);
                    }
                } else {
                    this.show(this._list[i].name);
                }
            }
        },
        hideAll: function hideAll(win) {
            var w,
                tw = null;
            if (win !== undefined) {
                w = Apoco.Window.get(win);
                if (w === null) {
                    throw new Error("Panel.hideAll - cannot find window " + w);
                }
                tw = w.window;
            }
            for (var i = 0; i < this._list.length; i++) {
                if (tw !== null) {
                    if (this._list[i].window === tw) {
                        this.hide(this._list[i].name);
                    }
                } else {
                    this.hide(this._list[i].name);
                }
            }
        },
        hide: function hide(k) {
            var p = this.get(k);

            if (!p) {
                throw new Error("Panel.hide Cannot find panel " + k);
            }
            var c = p.getChildren();
            for (var i = 0; i < c.length; i++) {
                c[i].hide();
            }
        },
        getList: function getList() {
            var l = [];
            for (var i = 0; i < this._list.length; i++) {
                l[i] = this._list[i].name;
            }
            return l;
        },
        clone: function clone(panel) {
            var stuff = {},
                np,
                p,
                name,
                i = 0;

            p = this.get(panel);
            if (p !== null) {
                name = panel;
                np = this._UIGet(panel);
                if (np == null) {
                    throw new Error("Panel can't find " + panel + " in UI.Panels");
                }
                while (this.get(name) !== null) {
                    i++;
                    name = name + i;
                }
                np.name = name;

                for (var j = 0; j < np.components.length; j++) {
                    np.components[j].id = np.components[j].id + i;
                }
                return np;
            } else {
                throw new Error("Apoco.Panel.clone: No panel named " + panel + " found");
            }
        },
        add: function add(panel) {
            if (!panel) {
                throw new Error("Panel.add must have a name or object");
            }
            if (Apoco.type['string'].check(panel)) {
                var w = this._UIGet(panel);
                panel = w;
            }

            if (this._inList(panel.name) === null) {
                check(panel.components);
                var p = Apoco._panelComponents(panel);

                this._list.push(p);
            } else {
                throw new Error("Panel.add " + panel.name + " is already in the display list");
            }
            return p;
        },
        deleteAll: function deleteAll(promise_resolve) {
            var obj;
            var n = this._list.length;

            for (var i = 0; i < n; i++) {
                obj = this._list[i];
                obj.deleteChildren();

                if (promise_resolve) {
                    if (i === n - 1) {
                        promise_resolve();
                    }
                }
            }

            Apoco.Window._closeAll();

            this._list.length = 0;
        },
        delete: function _delete(name) {
            var p = this._inList(name);
            if (p !== null) {
                var obj = this._list[p];
                obj.deleteChildren();

                this._list.splice(p, 1);
                for (var k in obj) {
                    delete obj[k];
                }
                obj = null;
            } else {
                throw new Error("Apoco.Panel delete -" + name + "is not in the list of Panels");
            }
        }
    };
    var _Components = function _Components(obj) {
        var that = this,
            w;
        for (var k in obj) {
            this[k] = obj[k];
        }


        if (this.window) {
            w = Apoco.Window.get(this.window);
            if (w !== null) {
                w.window.focus();
                that.window = w.window;
                that._addComponents();
            } else {
                var p = Apoco.Window.open(obj.window);
                p.then(function (w) {
                    w.window.focus();
                    that.window = w.window;
                    that._addComponents();
                }).catch(function (msg) {
                    throw new Error("window " + that.window + " does not exist " + msg);
                });
            }
        } else {
            that._addComponents();
        }
    };

    _Components.prototype = {
        _addComponents: function _addComponents() {
            var that = this;
            var d;

            for (var i = 0; i < this.components.length; i++) {
                var p = this.components[i].display;

                this.components[i].parent = this;

                d = Apoco.display[p](this.components[i], that.window);
                if (!d) {
                    throw new Error("could not create " + p);
                }

                if (d.hidden === undefined || d.hidden !== true) {
                    d.show();
                }

                this.components[i] = d;
            }
        },
        addChild: function addChild(display_object) {
            var d;
            if (this.getChild(display_object.id)) {
                throw new Error("Apoco.Panel: already have a child with id " + display_object.id);
            }
            if (!display_object.display) {
                throw new Error("You can only add display objects to a window");
            }
            if (!display_object.displayType) {
                d = display_object;
                display_object = Apoco.display[d.display](d, this.window);
                if (!display_object) {
                    throw new Error("Panel.addChild: could not create display object " + d.display);
                }
            }

            display_object.parent = this;
            this.components.push(display_object);
            if (display_object.hidden !== true) {
                display_object.show();
            }
        },
        deleteChildren: function deleteChildren() {
            if (!this.components) {
                throw new Error("Panel: has no children " + this.name);
            }
            for (var i = 0; i < this.components.length; i++) {
                this.components[i].delete("message from parent");
            }
            this.components.length = 0;
        },
        deleteChild: function deleteChild(obj) {
            var index = -1;

            if (!obj) {
                throw new Error("Apoco.Panel: deleteChild obj is null");
            }
            if (Apoco.type['string'].check(obj)) {
                obj = this.getChild(obj);
            }

            if (obj.listen) {
                Apoco.unsubscribe(obj);
            }
            for (var i = 0; i < this.components.length; i++) {
                if (obj === this.components[i]) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                this.components[index].delete("message from parent");
                this.components.splice(index, 1);
            } else {
                throw new Error("Panel: deleteChild could not find child " + obj.id);
            }
        },
        getChildren: function getChildren() {
            if (this.components && this.components.length > 0) {
                return this.components;
            }
            return null;
        },
        getChild: function getChild(id) {
            if (!this.components) {
                return null;
            }

            for (var i = 0; i < this.components.length; i++) {
                if (this.components[i].id === id) {
                    return this.components[i];
                }
            }
            return null;
        },
        findChild: function findChild(child) {
            if (!this.components) {
                return null;
            }
            var found = null;
            for (var i = 0; i < this.components.length; i++) {
                found = null;
                for (var k in child) {
                    switch (k) {
                        case "key":
                            child[k] === this.components[i].getKey() ? found = i : found = -1;
                            break;
                        case "element":
                            child[k] === this.components[i].getElement() ? found = i : found = -1;
                            break;
                        case "name":
                            child[k] === this.components[i].getName() ? found = i : found = -1;
                            break;
                        default:
                            found = null;
                            break;
                    }

                    if (found === -1) {
                        break;
                    }
                }
                if (found !== null && found !== -1) {
                    return this.components[i];
                }
            }
            return null;
        }
    };
    Apoco._panelComponents = function (t) {
        if (t === "methods") {
            var f = {};
            for (var k in _Components.prototype) {
                f[k] = k;
            }
            return f;
        } else {
            return new _Components(t);
        }
    };
})();

},{"./Popups":13,"./Utils":16,"./Window":17,"./declare":19}],13:[function(require,module,exports){
'use strict';

var Apoco = require('./declare').Apoco;

;(function () {
    'use strict';

    Apoco.popup = {
        error: function error(title, message) {
            var t = "ERROR ";
            if (Apoco.error === undefined) {
                title = t.concat(title);
                Apoco.error = this.dialog(title, message, true);
                Apoco.error.close = function () {
                    document.body.removeChild();
                };
                return;
            }
            Apoco.error.update(title, message, true);
        },
        dialog: function dialog(title, message, modal) {
            var mkDialog = function mkDialog(title, message, modal) {
                var Hdialog, message_text, title_text, Modal, draggable;
                if (modal && Apoco.modal === undefined) {
                    console.log("creating a modal ");
                    Apoco.modal = document.createElement("div");
                    Apoco.modal.id = "Apoco_modal";
                }
                if (message === undefined) {
                    message = "";
                }
                if (title === undefined) {
                    title = "";
                }
                if (modal === undefined) {
                    modal = false;
                }

                this.close = function () {
                    console.log("click closed is here");
                    console.log("Gdiakof is " + Hdialog);
                    if (modal === true) {
                        Apoco.modal.removeChild(Hdialog);
                        document.body.removeChild(Apoco.modal);
                    } else {
                        document.body.removeChild(Hdialog);
                    }
                };

                this.create = function () {
                    var s, b, t, header;
                    Hdialog = document.createElement("div");
                    Hdialog.classList.add("Apoco_dialog", "ui-dialog", "resizable", "ui-widget", "ui-widget-content", "ui-corner-all");
                    draggable = Apoco.Utils.draggable(Hdialog);

                    header = document.createElement("div");
                    header.classList.add("ui-dialog-titlebar", "ui-widget-header", "ui-corner-all");
                    title_text = document.createElement("span");
                    title_text.classList.add("ui-dialog-title");
                    title_text.textContent = title;
                    header.appendChild(title_text);
                    b = document.createElement("button");
                    b.classList.add("ui-button", "ui-widget", "ui-state-default", "ui-corner-all", "ui-button-icon-only", "ui-dialog-titlebar-close");
                    header.appendChild(b);
                    b.role = "button";
                    b.style.float = "right";
                    s = document.createElement("span");
                    s.classList.add("ui-button-icon-primary", "ui-icon", "ui-icon-closethick");
                    b.addEventListener("click", this.close, false);
                    b.appendChild(s);
                    Hdialog.appendChild(header);

                    s = document.createElement("div");
                    s.classList.add("ui-dialog-content", "ui-widget-content");

                    message_text = document.createElement("p");
                    message_text.style.float = "right";
                    message_text.textContent = message;
                    b = document.createElement("span");
                    b.classList.add("ui-icon", "ui-icon-circle-check");
                    s.appendChild(b);
                    s.appendChild(message_text);
                    Hdialog.appendChild(s);

                    s = document.createElement("div");
                    s.classList.add("ui-dialog-buttonpane", "ui-widget-content");
                    t = document.createElement("div");
                    t.classList.add("ui-dialog-buttonset");
                    s.appendChild(t);
                    b = document.createElement("button");
                    b.classList.add("ui-button", "ui-widget", "ui-state-default", "ui-corner-all", "ui-button-text-only");
                    b.type = "button";
                    b.addEventListener("click", this.close, false);
                    t.appendChild(b);
                    t = document.createElement("span");
                    t.classList.add("ui-button-text");
                    t.textContent = "OK";
                    b.appendChild(t);
                    Hdialog.appendChild(s);
                    if (modal === true) {
                        document.body.appendChild(Apoco.modal);
                        Apoco.modal.appendChild(Hdialog);
                    } else {
                        document.body.appendChild(Hdialog);
                    }
                };
                this.exists = function () {
                    if (Hdialog === undefined) {
                        return false;
                    }
                    return true;
                }, this.update = function (title, message) {
                    message_text.textContent = message;
                    title_text.textContent = title;
                    if (modal === true) {
                        document.body.appendChild(Apoco.modal);

                        Apoco.modal.appendChild(Hdialog);
                    } else {
                        document.body.appendChild(Hdialog);
                    }
                };
            };

            var d = new mkDialog(title, message, modal);
            d.create();
            return d;
        },
        spinner: function spinner(on) {

            if (!document.contains(document.getElementById("Apoco_spinner"))) {
                var spinner = document.createElement("div");
                spinner.id = "Apoco_spinner";
                document.body.appendChild(spinner);
            }
            if (on === true) {
                console.log("Apoco spinner on");
                document.getElementById("Apoco_spinner").style.display = "inherit";
            } else {
                console.log("Apoco spinner off");
                document.getElementById("Apoco_spinner").style.display = "none";
            }
            return spinner;
        },
        alert: function alert(text, time) {
            var nd, ns, np, s;
            nd = document.createElement("div");
            nd.id = "Apoco_alert";
            nd.classList.add("ui-widget");
            Apoco.Utils.draggable(nd);
            ns = document.createElement("div");
            ns.classList.add("ui-state-error", "ui-corner-all");
            ns.style.padding = "10px";
            np = document.createElement("p");
            np.classList.add("ui-state-error-text");
            s = document.createElement("span");
            s.classList.add("ui-icon", "ui-icon-alert");
            s.style.float = "left";
            s.style.margin = "1em";
            np.appendChild(s);
            s = document.createElement("strong");
            s.textContent = "Alert";
            np.appendChild(s);
            s = document.createElement("span");
            s.style.margin = "1em";
            s.textContent = text;
            np.appendChild(s);

            ns.appendChild(np);
            nd.appendChild(ns);
            document.body.appendChild(nd);

            var t;
            if (time === undefined) {
                time = 10000;
            }
            t = window.setTimeout(function () {
                document.body.removeChild(nd);
                window.clearTimeout(t);
            }, time);

            return nd;
        },
        trouble: function trouble(heading, text) {
            var a = document.createElement("div");
            a.id = "Apoco_trouble";

            var b = document.createElement("h1");
            b.textContent = heading;
            a.appendChild(b);
            if (text !== undefined) {

                var c = document.createElement("div");
                var d = document.createElement("h2");
                d.textContent = text;
                c.appendChild(d);
                a.appendChild(c);
            }

            document.body.appendChild(a);
            var t;

            t = window.setTimeout(function () {
                document.body.removeChild(a);
                a = null;
                window.clearTimeout(t);
                Apoco.popup.error("Unrecoverable Error", "Please shutdown now");
            }, 5000);
        },

        statusCode: {
            204: function _(s) {
                Apoco.popup.error("Bad Return from server: 204", "There is no content for this page " + s);
            },
            205: function _(s) {
                Apoco.popup.error("Bad Return from server: 205", "Response requires that the requester reset the document view " + s);
            },
            400: function _(s) {
                Apoco.popup.error("Bad Return from server: 400", "Bad request " + s);
            },
            401: function _(s) {
                Apoco.popup.error("Bad Return from server: 401", "Unauthorised " + s);
            },
            403: function _(s) {
                Apoco.popup.error("Bad Return from server: 403", "Forbidden " + s);
            },
            404: function _(s) {
                Apoco.popup.error("Bad Return from server: 404", "Not Found " + s);
            },
            410: function _(s) {
                Apoco.popup.error("Bad Return from server: 410", "Gone " + s);
            },
            413: function _(s) {
                Apoco.popup.error("Bad Return from server: 413", "Request entity too large " + s);
            },
            424: function _(s) {
                Apoco.popup.error("Bad Return from server: 424", "Method Failure " + s);
            },
            500: function _(s) {
                Apoco.popup.error("Bad Return from server: 500", "Internal server error " + s);
            },
            501: function _(s) {
                Apoco.popup.error("Bad Return from server: 501", "Not Implemented " + s);
            },
            503: function _(s) {
                Apoco.popup.error("Bad Return from server: 503", "Service unavailable " + s);
            },
            511: function _(s) {
                Apoco.popup.error("Bad Return from server: 511", "Network authentication required " + s);
            }
        }
    };
})();

},{"./declare":19}],14:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./Utils");
require("./Types");(function () {

	'use strict';

	function chunkify(t) {
		var tz = [],
		    x = 0,
		    y = -1,
		    n = 0,
		    i,
		    j;

		while (i = (j = t.charAt(x++)).charCodeAt(0)) {
			var m = i == 46 || i >= 48 && i <= 57;
			if (m !== n) {
				tz[++y] = "";
				n = m;
			}
			tz[y] += j;
		}
		return tz;
	}

	var default_compare = function default_compare(a) {
		return a;
	};

	function generic_compare(a, b, fn) {
		var s = fn(a);
		var t = fn(b);
		if (s < t) return -1;
		if (s > t) return 1;
		return 0;
	}

	var sort_fn = function sort_fn(type) {
		var a, b, aa, bb, c, d;
		switch (type) {
			case "integer":
			case "count":
			case "phoneNumber":
			case "maxCount":
			case "string":
			case "float":
			case "positiveInteger":
			case "date":
				return generic_compare;
			case "token":
			case "alphaNum":
				return function (s, t, fn) {
					a = fn(s);
					b = fn(t);
					if (a === b) return 0;
					aa = chunkify(a);
					bb = chunkify(b);

					for (var x = 0; aa[x] && bb[x]; x++) {
						if (aa[x] !== bb[x]) {
							c = Number(aa[x]), d = Number(bb[x]);
							if (c == aa[x] && d == bb[x]) {
								return c - d;
							} else return aa[x] > bb[x] ? 1 : -1;
						}
					}
					return aa.length - bb.length;
				};
			case "negativeInteger":
				return function (a, b, fn) {
					var s = fn(a);
					var t = fn(b);
					if (t < s) return -1;
					if (t > s) return 1;
					return 0;
				};
			case "boolean":
			case "currency":
			case "email":
			case "integers2":
			case "floats2":
			case "text":
			case "time":
			default:
				return undefined;
		}
		return undefined;
	};

	Apoco.isSortable = function (type) {
		if (sort_fn(type) !== undefined) {
			return true;
		}
		return false;
	};
	Apoco.sort = function (r, type_data) {
		var compare, fn, t;
		if (r === undefined) {
			throw new Error("Apoco.sort needs an input array");
		}
		if (Apoco.type['array'].check(type_data)) {
			for (var i = 0; i < type_data.length; i++) {
				if (!Apoco.isSortable(type_data[i].type)) {
					throw new Error("Apoco.sort:- Don't know how to sort type " + type_data[i].type);
				}

				if (!type_data[i].fn) {
					throw new Error("Apoco.sort needs a function to retrieve the array element");
				}

				type_data[i].compare = sort_fn(type_data[i].type);
			}
			r.sort(function (a, b) {
				for (var i = 0; i < type_data.length; i++) {
					t = type_data[i].compare(a, b, type_data[i].fn);
					if (t !== 0) {
						return t;
					}
				}
				return t;
			});
		} else {
			if (type_data && Apoco.type["object"].check(type_data)) {
				compare = sort_fn(type_data.type);
				if (!type_data.fn) {
					throw new Error("Apoco.sort needs a function to retrieve the array element");
				}
				fn = type_data.fn;
			} else if (Apoco.type["string"].check(type_data)) {
				compare = sort_fn(type_data);
				if (compare === undefined) {
					throw new Error("Sort: don't know how to sort " + type_data);
				}
				fn = default_compare;
			} else {
				throw new Error("Apoco.sort: Incorrect parameters ");
			}
			r.sort(function (a, b) {
				return compare(a, b, fn);
			});
		}
		return r;
	};
})();

},{"./Types":15,"./Utils":16,"./declare":19}],15:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Apoco = require('./declare').Apoco;

;(function () {

    Apoco.type = {
        alphaNum: {
            html_type: "text",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                s = s.trim();
                var isAlphaNumeric = /^[a-zA-Z0-9]+$/;
                if (s.search(isAlphaNumeric) != -1) {
                    return true;
                }
                return false;
            } },
        alphabetic: {
            html_type: "text",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(String(s))) {
                    return false;
                }
                var isAlpha = /^[a-zA-Z]+$/;
                s = String(s);
                if (s.search(isAlpha) != -1) {
                    return true;
                }
                return false;
            } },
        any: {
            html_type: "text",
            field: "input",
            check: function check(s) {
                return true;
            } },
        array: {
            html_type: "text",
            field: "stringArray",
            check: function check(a) {
                if (Object.prototype.toString.call(a) === '[object Array]') {
                    if (a.length >= 0) {
                        return true;
                    }
                }
                return false;
            } },
        blank: {
            check: function check(s) {
                if (s == "undefined" || s == undefined) {
                    return true;
                } else if (s === null) {
                    return true;
                } else if (s === false) {
                    return null;
                } else {
                    var isNonblank_re = /\S/;
                    var st = String(s);
                    if (st.search(isNonblank_re) === -1) {
                        return true;
                    } else {
                        return null;
                    }
                }
                return true;
            } },
        boolean: {
            html_type: "checkbox",
            field: "checkBox",
            check: function check(s) {
                var rf = /^([Vv]+(erdade(iro)?)?|[Ff]+(als[eo])?|[Tt]+(rue)?|0|[\+\-]?1)$/;
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                if (s.search(rf) !== -1) {
                    return true;
                }
                return false;
            } },
        booleanArray: {
            html_type: "checkbox",
            field: "buttonSet",
            check: function check(a) {
                if (Apoco.type.array.check(a)) {
                    for (var i = 0; i < a.length; i++) {
                        if (!Apoco.type.boolean.check(a[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            } },
        count: {
            html_type: "number",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                if (isNaN(parseFloat(s))) {
                    return false;
                }
                return true;
            } },
        currency: {
            html_type: "number",
            field: "input",
            check: function check(s) {

                if (Apoco.type.blank.check(s)) {
                    return false;
                }

                var re = /^([A-Z]{0,3})?[ ]?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/;

                var s = String(s);
                if (s.search(re) != -1) {
                    return true;
                }
                return false;
            } },
        date: {
            html_type: "date",
            field: "date",
            check: function check(s) {
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                var yyyymmdd = new RegExp("^(?:(?:(?:(?:(?:[13579][26]|[2468][048])00)|(?:[0-9]{2}(?:(?:[13579][26])|(?:[2468][048]|0[48]))))(?:(?:(?:09|04|06|11)(?:0[1-9]|1[0-9]|2[0-9]|30))|(?:(?:01|03|05|07|08|10|12)(?:0[1-9]|1[0-9]|2[0-9]|3[01]))|(?:02(?:0[1-9]|1[0-9]|2[0-9]))))|(?:[0-9]{4}(?:(?:(?:09|04|06|11)(?:0[1-9]|1[0-9]|2[0-9]|30))|(?:(?:01|03|05|07|08|10|12)(?:0[1-9]|1[0-9]|2[0-9]|3[01]))|(?:02(?:[01][0-9]|2[0-8])))))$");
                s = String(s);
                if (s.search(yyyymmdd) !== -1) {
                    return true;
                }

                var isDate_re = /^(19|20)?[0-9]{2}[- \/.](0?[1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])$/;
                if (s.search(isDate_re) !== -1) {
                    return true;
                }
                return false;
            } },
        decimal: {
            html_type: "number",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(s) || isNaN(s)) {
                    return false;
                }
                s = String(s);
                if (!s.search) {
                    return false;
                }
                var isDecimal_re = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (s.search(isDecimal_re) != -1) {
                    s = parseFloat(s);
                    return true;
                }
                return false;
            } },
        email: {
            html_type: "email",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                s = s.trim();
                var isEmail_re = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
                if (s.search(isEmail_re) != -1) {
                    return true;
                }
                return false;
            } },
        file: {
            html_type: "file",
            field: "input",
            check: function check(s) {
                return true;
            } },
        float: {
            html_type: "number",
            field: "float",
            check: function check(s) {
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                if (isNaN(s)) {
                    return false;
                }
                if (s == 0) {
                    return true;
                }
                s = String(s);
                if (!s.search) {
                    return false;
                }
                var isDecimal_re = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (s.search(isDecimal_re) != -1) {
                    s = parseFloat(s);
                    return true;
                }
                return false;
            } },
        floatArray: {
            html_type: "number",
            field: "numberArray",
            check: function check(s) {
                if (Apoco.type.array.check(s)) {
                    for (var i = 0; i < s.length; i++) {
                        if (!Apoco.type.float.check(s[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            } },
        function: {
            check: function check(a) {
                function isFunction(object) {
                    var obj = {};
                    return !!(object && obj.toString.call(object) == '[object Function]');
                }

                if (typeof a === "function") {
                    return true;
                }
                return false;
            } },
        image: {
            html_type: "image",

            check: function check(img) {
                if (!img) {
                    return false;
                }
                if (!img.naturalWidth) {
                    return false;
                }
                if (_typeof(img.naturalWidth) != undefined && img.naturalWidth === 0) {
                    return false;
                }

                return true;
            } },
        imageArray: {
            html_type: "image",
            field: "imageArray",
            check: function check(a) {
                if (Apoco.type.array.check(a)) {
                    for (var i = 0; i < a.length; i++) {
                        if (!Apoco.type.object.check(a[i])) {
                            return false;
                        } else if (!Apoco.type.image.check(a)) {
                            return false;
                        }
                    }
                } else {
                    return false;
                }
                return true;
            } },
        integer: {
            html_type: "number",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                var isInteger_re = /^\s*(\+|-)?\d+\s*$/;
                if (s.search(isInteger_re) !== -1) {
                    return true;
                }

                return false;
            } },
        integerArray: {
            html_type: "number",
            field: "numberArray",
            check: function check(a) {
                if (Apoco.type.array.check(a)) {
                    for (var i = 0; i < a.length; i++) {
                        if (!Apoco.type.integer.check(a[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            } },
        negativeInteger: {
            html_type: "number",
            field: "input",
            check: function check(s) {
                var isNegativeInteger_re = /-\s?\d+\s*$/;
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                if (s.search(isNegativeInteger_re) !== -1) {
                    return true;
                }

                return false;
            } },
        number: {
            html_type: "number",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(s) || isNaN(s)) {
                    return false;
                }
                s = String(s);
                return true;
            } },
        object: {
            check: function check(a) {
                if (a === undefined) {
                    return false;
                }
                if (a !== null && (typeof a === "undefined" ? "undefined" : _typeof(a)) === 'object') {
                    return true;
                }
                return false;
            } },
        objectArray: {
            check: function check(a) {
                if (Apoco.type.array.check(a)) {
                    for (var i = 0; i < a.length; i++) {
                        if (!Apoco.type.object.check(a[i])) {
                            return false;
                        }
                    }
                } else {
                    return false;
                }
                return true;
            } },
        password: {
            html_type: "password",
            field: "input",
            check: function check(s) {
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                if (Apoco.type.token.check(s)) {
                    return true;
                }
                return false;
            } },
        phoneNumber: {
            html_type: "tel",
            field: "input",
            check: function check(s) {
                var pn_re = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;

                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                if (s.search(pn_re) !== -1) {
                    return true;
                }

                return false;
            } },
        positiveInteger: {
            html_type: "number",
            field: "input",
            check: function check(s) {
                var isPositiveInteger_re = /^\s*\d+\s*$/;
                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                if (s.search(isPositiveInteger_re) !== -1) {
                    return true;
                }
                return false;
            } },
        range: {
            html_type: "range",
            field: "slider",
            check: function check(s) {
                if (Apoco.type.float.check(s)) {
                    return true;
                }
                if (Apoco.type.integer.check(s)) {
                    return true;
                }
                return false;
            } },
        string: {
            html_type: "text",
            field: "input",
            alt: "autoComplete",
            check: function check(s) {
                if (s === "") {
                    return true;
                }
                if (Apoco.type.blank.check(String(s))) {
                    return false;
                }
                if (typeof s === 'string' || s instanceof String) {
                    return true;
                }
                return false;
            } },
        stringArray: {
            html_type: "text",
            field: "stringArray",
            alt: "select",
            check: function check(s) {
                if (Apoco.type.array.check(s)) {
                    for (var i = 0; i < s.length; i++) {
                        if (!Apoco.type.string.check(s[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            } },
        text: {
            html_type: "text",
            field: "textArea",
            check: function check(s) {
                if (Apoco.type.blank.check(String(s))) {
                    return false;
                }
                return true;
            } },
        time: {
            html_type: "time",
            field: "input",
            check: function check(s) {

                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);

                s = s.trim();
                var isTime = /^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/;
                if (s.search(isTime) !== -1) {
                    return true;
                } else {
                    return false;
                }
            } },
        token: {
            html_type: "text",
            field: "input",
            check: function check(s) {

                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);

                s = s.trim();
                var invalidChar = /[^A-Za-z0-9.#_\\-]/;

                if (s.search(invalidChar) === -1) {
                    return true;
                }

                return false;
            } },
        url: {
            html_type: "url",
            field: "input",
            check: function check(s) {

                if (Apoco.type.blank.check(s)) {
                    return false;
                }
                s = String(s);
                var isURL = /^(ht|f)tp(s?)\:\/\/(([a-zA-Z0-9\-\._]+(\.[a-zA-Z0-9\-\._]+)+)|localhost)(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?([\d\w\.\/\%\+\-\=\&amp;\?\:\\\&quot;\'\,\|\~\;]*)$/;

                if (s.search(isURL) !== -1) {
                    return true;
                }
                return false;
            } }
    };
})();

},{"./declare":19}],16:[function(require,module,exports){
'use strict';

var Apoco = require('./declare').Apoco;

String.prototype.trim = String.prototype.trim || function trim() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

;(function () {
    var DEBUG = true;
    'use strict';
    Apoco.cloneDeep = require("clone-deep");
    Apoco.Utils = {
        getCssValue: function getCssValue(css_class, rule, filename) {
            var stylesheets;
            console.log("class is " + css_class + " rule " + rule + " filename " + filename);
            if (document && document.styleSheets) {
                stylesheets = document.styleSheets;
            } else {
                return null;
            }

            var found = -100;
            for (var j = 0; j < stylesheets.length; j++) {
                if (filename !== undefined) {
                    if (stylesheets[j].href && stylesheets[j].href.indexOf(filename) > 0) {
                        found = j;
                        break;
                    }
                }
            }
            if (found >= 0) {
                var classes = stylesheets[j].rules || stylesheets[j].cssRules;
                if (classes === undefined || classes === null) {
                    return null;
                }

                for (var i = 0; i < classes.length; i++) {
                    if (classes[i].selectorText == css_class) {
                        if (classes[i].style[rule]) {
                            return classes[i].style[rule];
                        }
                    }
                }
            }
            return null;
        },
        widthFromCssClass: function widthFromCssClass(class_list, filename) {
            var value = 0,
                units,
                v;
            for (var i = 0; i < class_list.length; i++) {
                var t = Apoco.Utils.getCssValue(class_list[i].classname, "width", filename);

                if (t === null) {
                    return null;
                }
                if (t.indexOf("em") > 0) {
                    var v = t.split("em");
                    if (units !== undefined && units !== "em") {
                        return null;
                    }
                    units = "em";
                } else if (t.indexOf("px") > 0) {
                    var v = t.split("px");
                    if (units !== undefined && units !== "px") {
                        return null;
                    }
                    units = "px";
                } else {
                    return null;
                }
                class_list[i].value = v[0];
                class_list[i].units = units;
                value += parseFloat(v[0]);
            }
            return value.toString() + units;
        },
        fontSizeToPixels: function fontSizeToPixels(font_size) {
            var p,
                pp = "";
            var lu = { "6": 8, "7": 9, "7.5": 10, "8": 11, "9": 12, "10": 13, "11": 15, "12": 16, "13": 17, "13.5": 18, "14": 19, "14.5": 20, "15": 21, "16": 22, "17": 23, "18": 24, "20": 26, "22": 29, "24": 32, "26": 35, "27": 36, "28": 37, "29": 38, "30": 40, "32": 42, "34": 45, "36": 48 };
            if (font_size === undefined) {
                return null;
            }
            pp = font_size.toString();
            if (pp.indexOf("pt") >= 0) {
                p = pp.split("pt");
                pp = p[0].toString();
            } else if (isNaN(font_size)) {
                return null;
            }
            if (lu[pp]) {
                return lu[pp];
            }

            return null;
        },
        binarySearch: function binarySearch(arr, sort_order, data, closest) {
            var mid, r, compare;
            var len = arr.length;


            if (sort_order === null) {
                compare = function compare(aa) {
                    if (aa == data) {
                        return 0;
                    } else if (aa > data) {
                        return 1;
                    } else if (aa < data) {
                        return -1;
                    } else {
                        throw new Error("binarySearch: should never get here");
                    }
                };
            } else {
                compare = function compare(aa) {
                    var field, item;

                    for (var i = 0; i < sort_order.length; i++) {
                        field = sort_order[i];
                        item = data[field];

                        if (aa[field].value == item) {
                            continue;
                        } else if (aa[field].value > item) {
                            return 1;
                        } else if (aa[field].value < item) {
                            return -1;
                        } else {
                            throw new Error("binarySearch: should never get here");
                        }
                    }
                    return 0;
                };
            }

            mid = Math.floor(arr.length / 2);

            if (closest) {
                if (closest.index === undefined) {
                    closest.index = mid;
                } else {
                    closest.index = closest.dir === "after" ? closest.index + mid : closest.index - Math.ceil(arr.length / 2);
                }
            }
            r = compare(arr[mid]);
            if (r < 0 && arr.length > 1) {
                if (closest) {
                    closest.dir = "after";
                }
                return Apoco.Utils.binarySearch(arr.slice(mid, Number.MAX_VALUE), sort_order, data, closest);
            } else if (r > 0 && arr.length > 1) {
                if (closest) {
                    closest.dir = "before";
                }
                return Apoco.Utils.binarySearch(arr.slice(0, mid), sort_order, data, closest);
            } else if (r === 0) {
                return arr[mid];
            } else {
                if (closest) {
                    closest.val = arr[mid];
                    if (r < 0) {
                        closest.dir = "after";
                    } else {
                        closest.dir = "before";
                    }
                }
                return null;
            }
        },
        hashCode: function hashCode(str) {
            var hash = 0;
            var char;
            if (str.length == 0) return hash;
            for (var i = 0; i < str.length; i++) {
                char = str.charCodeAt(i);
                hash = (hash << 5) - hash + char;
                hash = hash & hash;
            }
            return hash;
        },
        extend: function extend(subClass, superClass) {
            var F = function F() {};
            F.prototype = superClass.prototype;
            var subProto = subClass.prototype;

            subClass.prototype = new F();
            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;

            for (var k in subProto) {
                if (subProto.hasOwnProperty(k)) {
                    subClass.prototype[k] = subProto[k];
                }
            }

            if (superClass.prototype) {
                if (superClass.prototype.constructor === Object.prototype.constructor) {
                    superClass.prototype.constructor = superClass;
                }
            }
        },

        draggable: function draggable(source, destination) {
            if (destination === undefined) {
                destination = document.body;
            }
            source.classList.add("isdraggable");

            var allowDrag = function allowDrag(e) {
                e.preventDefault();
                return false;
            };
            var dragEnd = function dragEnd(e) {
                e.stopPropagation();

                e.currentTarget.classList.remove("draggable");
                destination.removeEventListener("drop", drop);
                destination.removeEventListener("dragover", allowDrag);
            };
            var drop = function drop(e) {
                console.log("drop is here");
                e.preventDefault();
                e.stopPropagation();
                var data = e.dataTransfer.getData("text").split(",");
                if (!source) {
                    throw new Error("source is undefined");
                }
                if (source.classList.contains("draggable")) {
                    source.style.left = e.clientX + parseInt(data[0], 10) + 'px';
                    source.style.top = e.clientY + parseInt(data[1], 10) + 'px';
                    source.classList.remove("draggable");
                }

                return false;
            };

            var dragStart = function dragStart(e) {
                e.currentTarget.classList.add("draggable");
                destination.addEventListener("dragover", allowDrag, false);
                destination.addEventListener("drop", drop, false);
                var style = window.getComputedStyle(e.target, null);

                e.dataTransfer.setData("text", parseInt(style.getPropertyValue("left"), 10) - e.clientX + ',' + (parseInt(style.getPropertyValue("top"), 10) - e.clientY));
            };

            if (source.draggable === false) {
                source.draggable = true;
                source.addEventListener("dragstart", dragStart, false);
                source.addEventListener("dragend", dragEnd, false);
            }
        },
        formatDate: function formatDate(d) {
            var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            var parts = d.split("-");
            var date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            var month = date.getMonth();
            var day = date.getDay();
            var n = date.getDate();
            var year = date.getFullYear();
            var ending;
            var last_char = n.toString().slice(-1);

            var d = parseInt(n);
            if (d > 10 && d < 14) {
                ending = "th";
            } else if (last_char === "1") {

                ending = "st";
            } else if (last_char === "2") {
                ending = "nd";
            } else if (last_char === "3") {
                ending = "rd";
            } else {
                ending = "th";
            }

            return days[day] + " " + n + ending + " " + months[month] + " " + year;
        },

        dateNow: function dateNow() {
            var n = new Date();
            var now = n.getFullYear() + "-" + ('0' + (n.getMonth() + 1)).slice(-2) + "-" + ('0' + n.getDate()).slice(-2);
            return now;
        },
        datePast: function datePast(date) {
            var n = new Date();
            var now = n.getFullYear() + "-" + ('0' + (n.getMonth() + 1)).slice(-2) + "-" + ('0' + n.getDate()).slice(-2);

            var r = now > date ? true : false;
            return r;
        },
        observer: {
            _list: [],
            create: function create() {
                var that = this;
                var check = function check(mutations) {
                    if (that._list.length > 0) {
                        mutations.forEach(function (mutation) {
                            for (var k in mutation) {
                                if (k === "addedNodes") {
                                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                                        for (var j = 0; j < that._list.length; j++) {
                                            if (mutation.addedNodes[i].id == that._list[j].id && that._list[j].found === false) {
                                                that._list[j].found = true;
                                                that._list[j].fn.call(that._list[j].context, that._list[j].context);
                                            };
                                        }
                                    }
                                    break;
                                }
                            }
                        });
                    }
                    var temp = [];

                    for (var k = 0; k < that._list.length; k++) {
                        if (that._list[k].found === false) {
                            temp.push(that._list[k]);
                        }
                    }
                    that._list = temp;
                    if (that._list.length == 0) {
                        Apoco.Observer.takeRecords();
                        Apoco.Observer.disconnect();
                    }
                };
                if (!Apoco.Observer) {
                    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

                    Apoco.Observer = new MutationObserver(function (mutations) {
                        check(mutations);
                    });
                }
            },
            add: function add(id, fn, context) {
                if (id !== undefined) {
                    this._list.push({ id: id, fn: fn, context: context, found: false });
                }
            }

        },
        getSiblings: function getSiblings(elem) {
            var siblings = [];
            var sibling = elem.parentNode.firstChild;
            while (sibling) {
                if (sibling.nodeType == 1 && sibling != elem) {
                    siblings.push(sibling);
                }
                sibling = sibling.nextSibling;
            }
            return siblings;
        },
        detectMobile: function detectMobile() {
            if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/IEMobile/i)) {
                return true;
            } else {
                return false;
            }
        }
    };
})();

},{"./declare":19,"clone-deep":26}],17:[function(require,module,exports){
"use strict";

var Apoco = require('./declare').Apoco;
require("./Utils");
require("./Popups");
require("./Panel");
var Promise = require('es6-promise').Promise;

;(function () {
    "use strict";

    Apoco.Window = {
        _list: [],
        delete: function _delete(win) {
            var w;
            if (win === undefined) {
                throw new Error("Window.delete  must supply window name or windowObject");
            }
            w = this._inList(win);
            if (w === null) {
                return null;
            }

            var p = Apoco.Panel._list;
            for (var j = 0; j < p.length; j++) {
                if (p[j].window && p[j].window === this._list[w].window) {
                    Apoco.Panel.delete(p[j].name);
                }
            }
            this._list[w].window.onunload = null;
            this._list[w].window.close();
            this._list.splice(w, 1);
            return undefined;
        },
        _close: function _close(name) {
            var p = this._inList(name);
            if (p !== null) {
                this._list[p].window.close();
            } else {
                throw new Error("Apoco.Window: Cannot find window " + name);
            }
            this._list.splice(p, 1);
        },
        _closeAll: function _closeAll() {

            for (var i = 0; i < this._list.length; i++) {
                this._list[i].window.close();
            }
            this._list.length = 0;
        },
        get: function get(p) {
            var i = this._inList(p);
            if (i === null) {
                return null;
            }
            return this._list[i];
        },
        _inList: function _inList(name) {
            var str = false;
            if (name === undefined) {
                throw new Error("no name given");
            }
            if (Apoco.type["string"].check(name)) {
                str = true;
            }

            for (var i = 0; i < this._list.length; i++) {
                if (str === true) {
                    if (this._list[i].name.toString() == name.toString()) {
                        return i;
                    }
                } else {
                    if (this._list[i].window === name) {
                        return i;
                    }
                }
            }
            return null;
        },
        open: function open(d) {
            var settings = new String();
            var that = this;
            var defaults = {
                width: 600,
                height: 600,
                menubar: 0,
                toolbar: 0,
                location: 0,
                personalbar: 0
            };
            if (!d.name) {
                throw new Error("Window:open - must have a name");
            }
            if (!d.url) {
                throw new Error("Window: open - must have a url");
            }
            if (this.get(d.name)) {
                throw new Error("Apoco,Window: " + d.name + " already exists");
            }
            if (!d.opts) {
                settings = "_blank";
            } else {
                for (var k in defaults) {
                    if (d.opts[k] === undefined) {
                        d.opts[k] = defaults[k];
                    }
                }

                for (var k in d.opts) {
                    if (settings === "") {
                        settings = settings.concat(k + "=" + d.opts[k]);
                    } else {
                        settings = settings.concat("," + k + "=" + d.opts[k]);
                    }
                }
                console.log("settings are " + settings);
            }
            var win = window.open(d.url, d.name, "'" + settings + "'");
            var p = new Promise(function (resolve, reject) {
                if (!win) {
                    reject("Could not open window");
                }
                window.addEventListener("childReady", function () {
                    return function (e) {
                        if (e.data === win) {
                            var tt = { name: d.name, window: win, promise: p };

                            that._list.push(tt);
                            resolve(tt);
                        } else {
                            reject("Apoco.Window: could not open " + d.name);
                        }
                    };
                }(d.name, win, p), false);
            });

            p.then(function (d) {
                d.window.onunload = function (e) {
                    var win = d.window;
                    if (win !== null) {
                        Apoco.Window.delete(win);
                    } else {
                        throw new Error("Could not find window to remove");
                    }
                };
            }).catch(function (reason) {
                Apoco.popup.error("Window Open Error", reason);
            });

            return p;
        }
    };
})();

},{"./Panel":12,"./Popups":13,"./Utils":16,"./declare":19,"es6-promise":43}],18:[function(require,module,exports){
'use strict';

var Apoco = require('./declare').Apoco;

;(function () {
    "use strict";

    function Datepicker(element) {
        var that = this;
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months = [{ name: 'January', len: 31 }, { name: 'February', len: 28 }, { name: 'March', len: 31 }, { name: 'April', len: 30 }, { name: 'May', len: 31 }, { name: 'June', len: 30 }, { name: 'July', len: 31 }, { name: 'August', len: 31 }, { name: 'September', len: 30 }, { name: 'October', len: 31 }, { name: 'November', len: 30 }, { name: 'December', len: 31 }];
    };
    Datepicker.prototype = {
        init: function init(element) {
            var that = this;


            var click = function click(e) {
                var pos = [];
                if (that.element === undefined) {
                    that.create();
                }
                e.stopPropagation();
                e.preventDefault();

                var date = e.target.value;

                if (that.current_element !== undefined) {
                    if (element == that.current_element) {
                        if (that.element.style.visibility === "visible") {
                            that.close();
                            return;
                        }
                    }
                }
                that.close();
                that.current_element = element;
                var t = that.parseDate(date);
                if (!t) {
                    that.selectedDate = new Date();
                } else {
                    that.selectedDate = t;
                    e.target.value = that.dateToString(that.selectedDate);
                }

                that.mkCalendarBody();
                var rect = element.getBoundingClientRect();

                that.element.style.top = (rect.bottom + window.scrollY).toString() + "px";
                that.element.style.left = (rect.right + window.scrollX).toString() + "px";
                that.element.style.visibility = "visible";
            };
            var change = function change(e) {
                var date;

                date = e.target.value;
                var t = that.parseDate(date);
                if (t) {
                    that.selectedDate = t;

                    e.target.value = that.dateToString(that.selectedDate);

                    that.mkCalendarBody();
                } else {
                    e.target.value = "";
                }
            };
            if (element !== undefined) {
                if (element.tagName.toLowerCase() !== "input") {
                    throw new Error("datepicker: element must be an input node");
                }

                element.classList.add("Apoco_datepicker_input");
                element.addEventListener("click", click, false);
                element.addEventListener("change", change, false);
            }
        },
        close: function close() {
            if (this.element) {
                this.element.style.visibility = "hidden";
            }
        },
        parseDate: function parseDate(date) {
            var p;
            if (date === undefined || date === "") {
                return null;
            }
            p = new Date(date);
            if (!p || p < 0) {
                throw new Error("datepicker: cannot parse this as a date  " + date);
            }

            return p;
        },
        mkCalendarHeader: function mkCalendarHeader(date) {
            var table,
                row,
                body,
                head,
                col,
                title,
                span,
                that = this;
            var icons = [{ id: "Apoco_datepicker_prevYear",
                func: function func(e) {
                    e.stopPropagation();
                    if (that.selectedDate) {
                        var f = that.selectedDate.getFullYear() - 1;
                        that.selectedDate.setFullYear(f);
                        that.mkCalendarBody(this.selectedDate);
                        var p = that.calendar.querySelector("td.ui-state-active");
                        if (p) {
                            p.classList.remove("ui-state-active");
                        }
                    }
                }
            }, { id: "Apoco_datepicker_prevMonth",
                func: function func(e) {
                    e.stopPropagation();
                    if (that.selectedDate) {
                        var f = that.selectedDate.getMonth() - 1;
                        that.selectedDate.setMonth(f);
                        that.mkCalendarBody(that.selectedDate);
                        var p = that.calendar.querySelector("td.ui-state-active");
                        if (p) {
                            p.classList.remove("ui-state-active");
                        }
                    }
                }
            }, { id: "Apoco_datepicker_nextYear",
                func: function func(e) {
                    e.stopPropagation();
                    if (that.selectedDate) {
                        var f = that.selectedDate.getFullYear() + 1;
                        that.selectedDate.setFullYear(f);
                        that.mkCalendarBody(that.selectedDate);
                        var p = that.calendar.querySelector("td.ui-state-active");
                        if (p) {
                            p.classList.remove("ui-state-active");
                        }
                    }
                }
            }, { id: "Apoco_datepicker_nextMonth",
                func: function func(e) {
                    e.stopPropagation();
                    if (that.selectedDate) {
                        var f = that.selectedDate.getMonth() + 1;
                        that.selectedDate.setMonth(f);
                        that.mkCalendarBody(that.selectedDate);
                        var p = that.calendar.querySelector("td.ui-state-active");
                        if (p) {
                            p.classList.remove("ui-state-active");
                        }
                    }
                }
            }];
            table = document.createElement("table");
            table.id = "Apoco_datepicker_controls";
            table.classList.add("ui-datepicker-header", "ui-widget-header", "ui-helper-clearfix", "ui-corner-all");
            this.element.appendChild(table);
            body = document.createElement("tbody");
            table.appendChild(body);
            row = document.createElement("tr");

            body.appendChild(row);
            col = document.createElement("td");
            col.classList.add("arrows");
            row.appendChild(col);
            for (var i = 0; i < 2; i++) {
                span = document.createElement("span");
                span.id = icons[i].id;
                if (i === 0) {
                    span.classList.add("ui-icon", "ui-icon-circle-arrow-w");
                } else {
                    span.classList.add("ui-icon", "ui-icon-circle-triangle-w");
                }
                span.addEventListener("click", icons[i].func, false);
                col.appendChild(span);
            }
            title = document.createElement("td");
            title.id = "Apoco_datepicker_title";
            title.classList.add("ui-datepicker-title");
            row.appendChild(title);
            col = document.createElement("td");
            col.classList.add("arrows");
            col.style.float = "right";
            row.appendChild(col);
            for (var i = 2; i < icons.length; i++) {
                span = document.createElement("span");
                span.id = icons[i].id;
                if (i === 2) {
                    span.classList.add("ui-icon", "ui-icon-circle-arrow-e");
                } else {
                    span.classList.add("ui-icon", "ui-icon-circle-triangle-e");
                }
                span.addEventListener("click", icons[i].func, false);
                col.appendChild(span);
            }
            this.calendar = document.createElement("table");
            this.calendar.id = "Apoco_datepicker_grid";
            this.element.appendChild(this.calendar);
            body = document.createElement("tbody");
            this.calendar.appendChild(body);
            row = document.createElement("tr");
            body.appendChild(row);
            for (var i = 0; i < this.days.length; i++) {
                col = document.createElement("th");
                col.textContent = this.days[i];
                row.appendChild(col);
            }
            var selectDay = function selectDay(e) {
                var day, s, p;

                if (e.target.classList.contains("Apoco_date")) {
                    day = e.target.textContent;

                    e.stopPropagation();
                    e.preventDefault();

                    p = that.calendar.querySelector("td.ui-state-active");
                    if (p) {
                        p.classList.remove("ui-state-active");
                    }
                    e.target.classList.add("ui-state-active");

                    that.selectedDate.setDate(day);
                    s = that.dateToString(that.selectedDate);

                    that.current_element.value = s;
                }
            };
            this.calendar.addEventListener("click", selectDay, false);
        },
        dateToString: function dateToString(date) {
            var y, m, s, d;
            y = date.getFullYear().toString();
            m = date.getMonth() + 1;
            d = date.getDate();
            if (m < 10) {
                m = ("0" + m).toString();
            }
            if (d < 10) {
                d = ("0" + d).toString();
            }
            s = y + "-" + m + "-" + d;
            return s;
        },
        mkCalendarBody: function mkCalendarBody() {
            var c, r, last_day, s;

            var current_month = this.selectedDate.getMonth();
            var prev_month = current_month === 0 ? 11 : current_month - 1;
            var next_month = (current_month + 1) % 12;
            var current_year = this.selectedDate.getFullYear();
            var day = this.selectedDate.getDate();
            var t = new Date(),
                today = -1;

            if (t.getFullYear() === current_year) {
                if (t.getMonth() === current_month) {
                    today = t.getDate();
                    console.log("today is " + today);
                }
            }

            c = document.getElementById("Apoco_datepicker_title");
            c.textContent = (this.months[current_month].name + " " + current_year).toString();

            var tbody = this.calendar.getElementsByTagName("tbody")[0];
            r = tbody.getElementsByTagName("tr")[0];
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }

            tbody.appendChild(r);

            if (current_month + 1 > 9) {
                s = current_year.toString() + "-" + (current_month + 1).toString() + "-01";
            } else {
                s = current_year.toString() + "-0" + (current_month + 1).toString() + "-01";
            }

            var start_day = new Date(s).getDay();

            if (start_day !== 0) {
                if (prev_month === 1) {
                    last_day = this.months[prev_month].len;
                    if (current_year % 4 === 0) {
                        last_day++;
                    }
                } else {
                    last_day = this.months[prev_month].len;
                }
            }
            c = Math.ceil((start_day + this.months[current_month].len) / 7);
            var len = c * 7;

            var ml = this.months[current_month].len;

            var p = last_day - start_day + 1;
            for (var i = 0; i < len; i++) {
                if (i % 7 === 0) {
                    r = document.createElement("tr");
                    tbody.appendChild(r);
                }
                c = document.createElement("td");
                if (i < start_day) {
                    c.className = "ui-state-disabled";
                } else if (i === start_day) {
                    p = 1;
                    c.classList.add("Apoco_date");
                } else if (i === ml + start_day) {
                    p = 1;
                    c.className = "ui-state-disabled";
                } else if (i > ml + start_day) {
                    c.className = "ui-state-disabled";
                }
                c.textContent = p;
                if (i >= start_day && i < ml + start_day) {
                    c.classList.add("Apoco_date");
                    if (p === today) {
                        c.classList.add("ui-state-highlight");
                    }
                    if (p === day) {
                        c.classList.add("ui-state-active");
                    }
                }
                r.appendChild(c);
                p++;
            }
        },

        create: function create() {
            if (this.element === undefined) {
                this.element = document.createElement('div');

                this.element.id = "Apoco_datepicker";
                this.element.classList.add("ui-datepicker", "ui-widget-content", "ui-corner-all");
                document.getElementsByTagName("body").item(0).appendChild(this.element);
                this.mkCalendarHeader();
            }
            this.format = "YYYY-MM-DD";
            this.selectedDate = Date();
        }
    };


    Apoco.datepicker = new Datepicker();
})();

},{"./declare":19}],19:[function(require,module,exports){
"use strict";

module.exports = { Apoco: {} };

},{}],20:[function(require,module,exports){
"use strict";

var dcl = require('./declare.js');

require('./Core');
require('./Utils');
require('./Types');
require('./Window');
require('./Fields');
require('./Popups');
require('./DisplayBase');
require('./DisplayFieldset');
require('./DisplayForm');
require('./DisplayMenu');
require('./DisplayTabs');
require('./DisplayGrid');
require('./DisplaySlideshow');
require('./IO');
require('./Nodes');
require('./Panel');
require('./Sort');

module.exports = dcl;

},{"./Core":1,"./DisplayBase":2,"./DisplayFieldset":3,"./DisplayForm":4,"./DisplayGrid":5,"./DisplayMenu":6,"./DisplaySlideshow":7,"./DisplayTabs":8,"./Fields":9,"./IO":10,"./Nodes":11,"./Panel":12,"./Popups":13,"./Sort":14,"./Types":15,"./Utils":16,"./Window":17,"./declare.js":19}],21:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; i++) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  that.write(string, encoding)
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

function arrayIndexOf (arr, val, byteOffset, encoding) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var foundIndex = -1
  for (var i = 0; byteOffset + i < arrLength; i++) {
    if (read(arr, byteOffset + i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
      if (foundIndex === -1) foundIndex = i
      if (i - foundIndex + 1 === valLength) return (byteOffset + foundIndex) * indexSize
    } else {
      if (foundIndex !== -1) i -= i - foundIndex
      foundIndex = -1
    }
  }
  return -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  if (Buffer.isBuffer(val)) {
    // special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(this, val, byteOffset, encoding)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset, encoding)
  }

  throw new TypeError('val must be string, number or Buffer')
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; i++) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; i++) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":22,"ieee754":23,"isarray":24}],22:[function(require,module,exports){
'use strict'

exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

function init () {
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }

  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
}

init()

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],23:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],24:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],25:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],26:[function(require,module,exports){
'use strict';

/**
 * Module dependenices
 */

var utils = require('./utils');

/**
 * Recursively clone native types.
 */

function cloneDeep(val, instanceClone) {
  switch (utils.typeOf(val)) {
    case 'object':
      return cloneObjectDeep(val, instanceClone);
    case 'array':
      return cloneArrayDeep(val, instanceClone);
    default:
      return utils.clone(val);
  }
}

function cloneObjectDeep(obj, instanceClone) {
  if (utils.isObject(obj)) {
    var res = {};
    utils.forOwn(obj, function(obj, key) {
      this[key] = cloneDeep(obj, instanceClone);
    }, res);
    return res;
  } else if (instanceClone) {
    return instanceClone(obj);
  } else {
    return obj;
  }
}

function cloneArrayDeep(arr, instanceClone) {
  var len = arr.length, res = [];
  var i = -1;
  while (++i < len) {
    res[i] = cloneDeep(arr[i], instanceClone);
  }
  return res;
}

/**
 * Expose `cloneDeep`
 */

module.exports = cloneDeep;

},{"./utils":42}],27:[function(require,module,exports){
/*!
 * for-own <https://github.com/jonschlinkert/for-own>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var forIn = require('for-in');
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function forOwn(o, fn, thisArg) {
  forIn(o, function(val, key) {
    if (hasOwn.call(o, key)) {
      return fn.call(thisArg, o[key], key, o);
    }
  });
};

},{"for-in":28}],28:[function(require,module,exports){
/*!
 * for-in <https://github.com/jonschlinkert/for-in>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function forIn(o, fn, thisArg) {
  for (var key in o) {
    if (fn.call(thisArg, o[key], key, o) === false) {
      break;
    }
  }
};

},{}],29:[function(require,module,exports){
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;
  
  if (isObjectObject(o) === false) return false;
  
  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;
  
  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;
  
  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }
  
  // Most likely a plain Object
  return true;
};

},{"isobject":30}],30:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return val != null && typeof val === 'object'
    && !Array.isArray(val);
};

},{}],31:[function(require,module,exports){
(function (Buffer){
var isBuffer = require('is-buffer');
var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

module.exports = function kindOf(val) {
  // primitivies
  if (typeof val === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val === 'string' || val instanceof String) {
    return 'string';
  }
  if (typeof val === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (typeof val === 'function' || val instanceof Function) {
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  var type = toString.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }

  // buffer
  if (typeof Buffer !== 'undefined' && isBuffer(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }

  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

}).call(this,require("buffer").Buffer)
},{"buffer":21,"is-buffer":32}],32:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],33:[function(require,module,exports){
(function (process){
'use strict';

/**
 * Cache results of the first function call to ensure only calling once.
 *
 * ```js
 * var utils = require('lazy-cache')(require);
 * // cache the call to `require('ansi-yellow')`
 * utils('ansi-yellow', 'yellow');
 * // use `ansi-yellow`
 * console.log(utils.yellow('this is yellow'));
 * ```
 *
 * @param  {Function} `fn` Function that will be called only once.
 * @return {Function} Function that can be called to get the cached function
 * @api public
 */

function lazyCache(fn) {
  var cache = {};
  var proxy = function(mod, name) {
    name = name || camelcase(mod);

    // check both boolean and string in case `process.env` cases to string
    if (process.env.UNLAZY === 'true' || process.env.UNLAZY === true || process.env.TRAVIS) {
      cache[name] = fn(mod);
    }

    Object.defineProperty(proxy, name, {
      enumerable: true,
      configurable: true,
      get: getter
    });

    function getter() {
      if (cache.hasOwnProperty(name)) {
        return cache[name];
      }
      return (cache[name] = fn(mod));
    }
    return getter;
  };
  return proxy;
}

/**
 * Used to camelcase the name to be stored on the `lazy` object.
 *
 * @param  {String} `str` String containing `_`, `.`, `-` or whitespace that will be camelcased.
 * @return {String} camelcased string.
 */

function camelcase(str) {
  if (str.length === 1) {
    return str.toLowerCase();
  }
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase();
  return str.replace(/[\W_]+(\w|$)/g, function(_, ch) {
    return ch.toUpperCase();
  });
}

/**
 * Expose `lazyCache`
 */

module.exports = lazyCache;

}).call(this,require('_process'))
},{"_process":25}],34:[function(require,module,exports){
/*!
 * shallow-clone <https://github.com/jonschlinkert/shallow-clone>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Shallow copy an object, array or primitive.
 *
 * @param  {any} `val`
 * @return {any}
 */

function clone(val) {
  var type = utils.typeOf(val);

  if (clone.hasOwnProperty(type)) {
    return clone[type](val);
  }
  return val;
}

clone.array = function cloneArray(arr) {
  return arr.slice();
};

clone.date = function cloneDate(date) {
  return new Date(+date);
};

clone.object = function cloneObject(obj) {
  if (utils.isObject(obj)) {
    return utils.mixin({}, obj);
  } else {
    return obj;
  }
};

clone.regexp = function cloneRegExp(re) {
  var flags = '';
  flags += re.multiline ? 'm' : '';
  flags += re.global ? 'g' : '';
  flags += re.ignorecase ? 'i' : '';
  return new RegExp(re.source, flags);
};

/**
 * Expose `clone`
 */

module.exports = clone;

},{"./utils":41}],35:[function(require,module,exports){
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isExtendable(val) {
  return typeof val !== 'undefined' && val !== null
    && (typeof val === 'object' || typeof val === 'function');
};

},{}],36:[function(require,module,exports){
(function (Buffer){
var isBuffer = require('is-buffer');
var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

module.exports = function kindOf(val) {
  // primitivies
  if (typeof val === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val === 'string' || val instanceof String) {
    return 'string';
  }
  if (typeof val === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (typeof val === 'function' || val instanceof Function) {
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  var type = toString.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }

  // buffer
  if (typeof Buffer !== 'undefined' && isBuffer(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }

  // must be a plain object
  return 'object';
};

}).call(this,require("buffer").Buffer)
},{"buffer":21,"is-buffer":37}],37:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"dup":32}],38:[function(require,module,exports){
(function (process){
'use strict';

/**
 * Cache results of the first function call to ensure only calling once.
 *
 * ```js
 * var utils = require('lazy-cache')(require);
 * // cache the call to `require('ansi-yellow')`
 * utils('ansi-yellow', 'yellow');
 * // use `ansi-yellow`
 * console.log(utils.yellow('this is yellow'));
 * ```
 *
 * @param  {Function} `fn` Function that will be called only once.
 * @return {Function} Function that can be called to get the cached function
 * @api public
 */

function lazyCache(fn) {
  var cache = {};
  var proxy = function(mod, name) {
    name = name || camelcase(mod);

    // check both boolean and string in case `process.env` cases to string
    if (process.env.UNLAZY === 'true' || process.env.UNLAZY === true) {
      cache[name] = fn(mod);
    }

    Object.defineProperty(proxy, name, {
      enumerable: true,
      configurable: true,
      get: getter
    });

    function getter() {
      if (cache.hasOwnProperty(name)) {
        return cache[name];
      }
      return (cache[name] = fn(mod));
    }
    return getter;
  };
  return proxy;
}

/**
 * Used to camelcase the name to be stored on the `lazy` object.
 *
 * @param  {String} `str` String containing `_`, `.`, `-` or whitespace that will be camelcased.
 * @return {String} camelcased string.
 */

function camelcase(str) {
  if (str.length === 1) {
    return str.toLowerCase();
  }
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase();
  return str.replace(/[\W_]+(\w|$)/g, function(_, ch) {
    return ch.toUpperCase();
  });
}

/**
 * Expose `lazyCache`
 */

module.exports = lazyCache;

}).call(this,require('_process'))
},{"_process":25}],39:[function(require,module,exports){
'use strict';

var isObject = require('is-extendable');
var forIn = require('for-in');

function mixin(target, objects) {
  if (!isObject(target)) {
    throw new TypeError('mixin-object expects the first argument to be an object.');
  }
  var len = arguments.length, i = 0;
  while (++i < len) {
    var obj = arguments[i];
    if (isObject(obj)) {
      forIn(obj, copy, target);
    }
  }
  return target;
}

/**
 * copy properties from the source object to the
 * target object.
 *
 * @param  {*} `value`
 * @param  {String} `key`
 */

function copy(value, key) {
  this[key] = value;
}

/**
 * Expose `mixin`
 */

module.exports = mixin;
},{"for-in":40,"is-extendable":35}],40:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28}],41:[function(require,module,exports){
'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;
require('is-extendable', 'isObject');
require('mixin-object', 'mixin');
require('kind-of', 'typeOf');
require = fn;
module.exports = utils;

},{"is-extendable":35,"kind-of":36,"lazy-cache":38,"mixin-object":39}],42:[function(require,module,exports){
'use strict';

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;

require = utils;
require('is-plain-object', 'isObject');
require('shallow-clone', 'clone');
require('kind-of', 'typeOf');
require('for-own');
require = fn;

/**
 * Expose `utils`
 */

module.exports = utils;

},{"for-own":27,"is-plain-object":29,"kind-of":31,"lazy-cache":33,"shallow-clone":34}],43:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.0.5
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":25}]},{},[20]);
