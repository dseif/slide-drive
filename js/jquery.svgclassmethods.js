// This replaces the standard addClass, removeClass, toggleClass and hasClass methods to add
// compatability for SVG DOM elements. (Using the "class" attribute instead of the "className" property.)
// 
// These are based on and should behave the identically to the equivalent jQuery 1.6.2 methods.
// The clobbered methods will be available as ex. jQuery.fn.addClass.original.

(function(jQuery) {
	var rspace = /\s+/,
	    rclass = /[\n\t\r]/g,
		newMethods = {
			addClass: function (value) {
			    var classNames, i, l, elem, setClass, c, cl, elemClass;

			    if (jQuery.isFunction(value)) {
			        return this.each(function (j) {
			            jQuery(this).addClass(value.call(this, j, this.getAttribute("class")));
			        });
			    }

			    if (value && typeof value === "string") {
			        classNames = value.split(rspace);

			        for (i = 0, l = this.length; i < l; i++) {
			            elem = this[i];
						elemClass = elem.getAttribute("class");

			            if (elem.nodeType === 1) {
			                if (!elemClass && classNames.length === 1) {
			                    elem.setAttribute("class", value);

			                } else {
			                    setClass = " " + elemClass + " ";

			                    for (c = 0, cl = classNames.length; c < cl; c++) {
			                        if (!~setClass.indexOf(" " + classNames[c] + " ")) {
			                            setClass += classNames[c] + " ";
			                        }
			                    }
			                    elem.setAttribute("class", jQuery.trim(setClass));
			                }
			            }
			        }
			    }

			    return this;
			},
			removeClass: function (value) {
			    var classNames, i, l, elem, className, c, cl, elemClass;

			    if (jQuery.isFunction(value)) {
			        return this.each(function (j) {
			            jQuery(this).removeClass(value.call(this, j, this.getAttribute("class")));
			        });
			    }

			    if ((value && typeof value === "string") || value === undefined) {
			        classNames = (value || "").split(rspace);

			        for (i = 0, l = this.length; i < l; i++) {
			            elem = this[i];
						elemClass = elem.getAttribute("class");

			            if (elem.nodeType === 1 && elemClass) {
			                if (value) {
			                    className = (" " + elemClass + " ").replace(rclass, " ");
			                    for (c = 0, cl = classNames.length; c < cl; c++) {
			                        className = className.replace(" " + classNames[c] + " ", " ");
			                    }
			                    elem.setAttribute("class", jQuery.trim(className));

			                } else {
			                    elem.setAttribute("class", "");
			                }
			            }
			        }
			    }

			    return this;
			},
			toggleClass: function (value, stateVal) {
			    var type = typeof value,
			        isBool = typeof stateVal === "boolean";

			    if (jQuery.isFunction(value)) {
			        return this.each(function (i) {
			            jQuery(this).toggleClass(value.call(this, i, this.getAttribute("class"), stateVal), stateVal);
			        });
			    }

			    return this.each(function () {
			        if (type === "string") {
			            // toggle individual class names
			            var className, i = 0,
			                self = jQuery(this),
			                state = stateVal,
			                classNames = value.split(rspace);

			            while ((className = classNames[i++])) {
			                // check each className given, space seperated list
			                state = isBool ? state : !self.hasClass(className);
			                self[state ? "addClass" : "removeClass"](className);
			            }

			        } else if (type === "undefined" || type === "boolean") {
						var thisClass = this.getAttribute("class");
						
			            if (thisClass) {
			                // store className if set
			                jQuery._data(this, "__className__", thisClass);
			            }

			            // toggle whole className
			            this.setAttribute("class", thisClass || value === false ? "" : jQuery._data(this, "__className__") || "");
			        }
			    });
			},
			hasClass: function (selector) {
			    var className = " " + selector + " ";
			    for (var i = 0, l = this.length; i < l; i++) {
			        if ((" " + this[i].getAttribute("class") + " ").replace(rclass, " ").indexOf(className) > -1) {
			            return true;
			        }
			    }

			    return false;
			}
		};

	for (var name in newMethods) {
		newMethods[name].original = jQuery.fn[name];
		jQuery.fn[name] = newMethods[name];
	}
})(jQuery);
