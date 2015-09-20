(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * SheetClip - Spreadsheet Clipboard Parser
 * version 0.2
 *
 * This tiny library transforms JavaScript arrays to strings that are pasteable by LibreOffice, OpenOffice,
 * Google Docs and Microsoft Excel.
 *
 * Copyright 2012, Marcin Warpechowski
 * Licensed under the MIT license.
 * http://github.com/warpech/sheetclip/
 */
/*jslint white: true*/
(function (global) {
  "use strict";

  function countQuotes(str) {
    return str.split('"').length - 1;
  }

  var SheetClip = {
    /**
     * Decode spreadsheet string into array
     *
     * @param {String} str
     * @returns {Array}
     */
    parse: function (str) {
      var r, rLen, rows, arr = [], a = 0, c, cLen, multiline, last;

      rows = str.split('\n');

      if (rows.length > 1 && rows[rows.length - 1] === '') {
        rows.pop();
      }
      for (r = 0, rLen = rows.length; r < rLen; r += 1) {
        rows[r] = rows[r].split('\t');

        for (c = 0, cLen = rows[r].length; c < cLen; c += 1) {
          if (!arr[a]) {
            arr[a] = [];
          }
          if (multiline && c === 0) {
            last = arr[a].length - 1;
            arr[a][last] = arr[a][last] + '\n' + rows[r][0];

            if (multiline && (countQuotes(rows[r][0]) & 1)) { //& 1 is a bitwise way of performing mod 2
              multiline = false;
              arr[a][last] = arr[a][last].substring(0, arr[a][last].length - 1).replace(/""/g, '"');
            }
          }
          else {
            if (c === cLen - 1 && rows[r][c].indexOf('"') === 0 && (countQuotes(rows[r][c]) & 1)) {
              arr[a].push(rows[r][c].substring(1).replace(/""/g, '"'));
              multiline = true;
            }
            else {
              arr[a].push(rows[r][c].replace(/""/g, '"'));
              multiline = false;
            }
          }
        }
        if (!multiline) {
          a += 1;
        }
      }

      return arr;
    },

    /**
     * Encode array into valid spreadsheet string
     *
     * @param arr
     * @returns {String}
     */
    stringify: function (arr) {
      var r, rLen, c, cLen, str = '', val;

      for (r = 0, rLen = arr.length; r < rLen; r += 1) {
        cLen = arr[r].length;

        for (c = 0; c < cLen; c += 1) {
          if (c > 0) {
            str += '\t';
          }
          val = arr[r][c];

          if (typeof val === 'string') {
            if (val.indexOf('\n') > -1) {
              str += '"' + val.replace(/"/g, '""') + '"';
            }
            else {
              str += val;
            }
          }
          else if (val === null || val === void 0) { // void 0 resolves to undefined
            str += '';
          }
          else {
            str += val;
          }
        }
        str += '\n';
      }

      return str;
    }
  };

  if (typeof exports !== 'undefined') {
    exports.parse = SheetClip.parse;
    exports.stringify = SheetClip.stringify;
  } else {
    global.SheetClip = SheetClip;
  }
}(window));

},{}],2:[function(require,module,exports){
/**
 * autoResize - resizes a DOM element to the width and height of another DOM element
 *
 * Copyright 2014, Marcin Warpechowski
 * Licensed under the MIT license
 */


function autoResize() {
  var defaults = {
      minHeight: 200,
      maxHeight: 300,
      minWidth: 100,
      maxWidth: 300
    },
    el,
    body = document.body,
    text = document.createTextNode(''),
    span = document.createElement('SPAN'),
    observe = function (element, event, handler) {
      if (window.attachEvent) {
        element.attachEvent('on' + event, handler);
      } else {
        element.addEventListener(event, handler, false);
      }
    },
    unObserve = function (element, event, handler) {
      if (window.removeEventListener) {
        element.removeEventListener(event, handler, false);
      } else {
        element.detachEvent('on' + event, handler);
      }
    },
    resize = function (newChar) {
      var width, scrollHeight;

      if (!newChar) {
        newChar = "";
      } else if (!/^[a-zA-Z \.,\\\/\|0-9]$/.test(newChar)) {
        newChar = ".";
      }

      if (text.textContent !== void 0) {
        text.textContent = el.value + newChar;
      }
      else {
        text.data = el.value + newChar; //IE8
      }
      span.style.fontSize = Handsontable.Dom.getComputedStyle(el).fontSize;
      span.style.fontFamily = Handsontable.Dom.getComputedStyle(el).fontFamily;
      span.style.whiteSpace = "pre";

      body.appendChild(span);
      width = span.clientWidth + 2;
      body.removeChild(span);

      el.style.height = defaults.minHeight + 'px';

      if (defaults.minWidth > width) {
        el.style.width = defaults.minWidth + 'px';

      } else if (width > defaults.maxWidth) {
        el.style.width = defaults.maxWidth + 'px';

      } else {
        el.style.width = width + 'px';
      }
      scrollHeight = el.scrollHeight ? el.scrollHeight - 1 : 0;

      if (defaults.minHeight > scrollHeight) {
        el.style.height = defaults.minHeight + 'px';

      } else if (defaults.maxHeight < scrollHeight) {
        el.style.height = defaults.maxHeight + 'px';
        el.style.overflowY = 'visible';

      } else {
        el.style.height = scrollHeight + 'px';
      }
    },
    delayedResize = function () {
      window.setTimeout(resize, 0);
    },
    extendDefaults = function (config) {

      if (config && config.minHeight) {
        if (config.minHeight == 'inherit') {
          defaults.minHeight = el.clientHeight;
        } else {
          var minHeight = parseInt(config.minHeight);
          if (!isNaN(minHeight)) {
            defaults.minHeight = minHeight;
          }
        }
      }

      if (config && config.maxHeight) {
        if (config.maxHeight == 'inherit') {
          defaults.maxHeight = el.clientHeight;
        } else {
          var maxHeight = parseInt(config.maxHeight);
          if (!isNaN(maxHeight)) {
            defaults.maxHeight = maxHeight;
          }
        }
      }

      if (config && config.minWidth) {
        if (config.minWidth == 'inherit') {
          defaults.minWidth = el.clientWidth;
        } else {
          var minWidth = parseInt(config.minWidth);
          if (!isNaN(minWidth)) {
            defaults.minWidth = minWidth;
          }
        }
      }

      if (config && config.maxWidth) {
        if (config.maxWidth == 'inherit') {
          defaults.maxWidth = el.clientWidth;
        } else {
          var maxWidth = parseInt(config.maxWidth);
          if (!isNaN(maxWidth)) {
            defaults.maxWidth = maxWidth;
          }
        }
      }

      if(!span.firstChild) {
        span.className = "autoResize";
        span.style.display = 'inline-block';
        span.appendChild(text);
      }
    },
    init = function (el_, config, doObserve) {
      el = el_;
      extendDefaults(config);

      if (el.nodeName == 'TEXTAREA') {

        el.style.resize = 'none';
        el.style.overflowY = '';
        el.style.height = defaults.minHeight + 'px';
        el.style.minWidth = defaults.minWidth + 'px';
        el.style.maxWidth = defaults.maxWidth + 'px';
        el.style.overflowY = 'hidden';
      }

      if(doObserve) {
        observe(el, 'change', resize);
        observe(el, 'cut', delayedResize);
        observe(el, 'paste', delayedResize);
        observe(el, 'drop', delayedResize);
        observe(el, 'keydown', delayedResize);
      }

      resize();
    };

  return {
    init: function (el_, config, doObserve) {
      init(el_, config, doObserve);
    },
    unObserve: function () {
      unObserve(el, 'change', resize);
      unObserve(el, 'cut', delayedResize);
      unObserve(el, 'paste', delayedResize);
      unObserve(el, 'drop', delayedResize);
      unObserve(el, 'keydown', delayedResize);
    },
    resize: resize
  };
}

if (typeof exports !== 'undefined') {
  module.exports = autoResize;
}

},{}],3:[function(require,module,exports){
(function (global){
/*!
 * Copyright (C) 2011 by Andrea Giammarchi, @WebReflection
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(exports) {
  'use strict';
  //shared pointer
  var i;
  //shortcuts
  var defineProperty = Object.defineProperty,
    is = function(a, b) {
      return isNaN(a) ? isNaN(b) : a === b;
    };


  //Polyfill global objects
  if (typeof WeakMap == 'undefined') {
    exports.WeakMap = createCollection({
      // WeakMap#delete(key:void*):boolean
      'delete': sharedDelete,
      // WeakMap#clear():
      clear: sharedClear,
      // WeakMap#get(key:void*):void*
      get: sharedGet,
      // WeakMap#has(key:void*):boolean
      has: mapHas,
      // WeakMap#set(key:void*, value:void*):void
      set: sharedSet
    }, true);
  }

  if (typeof Map == 'undefined') {
    exports.Map = createCollection({
      // WeakMap#delete(key:void*):boolean
      'delete': sharedDelete,
      //:was Map#get(key:void*[, d3fault:void*]):void*
      // Map#has(key:void*):boolean
      has: mapHas,
      // Map#get(key:void*):boolean
      get: sharedGet,
      // Map#set(key:void*, value:void*):void
      set: sharedSet,
      // Map#keys(void):Iterator
      keys: sharedKeys,
      // Map#values(void):Iterator
      values: sharedValues,
      // Map#entries(void):Iterator
      entries: mapEntries,
      // Map#forEach(callback:Function, context:void*):void ==> callback.call(context, key, value, mapObject) === not in specs`
      forEach: sharedForEach,
      // Map#clear():
      clear: sharedClear
    });
  }

  if (typeof Set == 'undefined') {
    exports.Set = createCollection({
      // Set#has(value:void*):boolean
      has: setHas,
      // Set#add(value:void*):boolean
      add: sharedAdd,
      // Set#delete(key:void*):boolean
      'delete': sharedDelete,
      // Set#clear():
      clear: sharedClear,
      // Set#keys(void):Iterator
      keys: sharedValues, // specs actually say "the same function object as the initial value of the values property"
      // Set#values(void):Iterator
      values: sharedValues,
      // Set#entries(void):Iterator
      entries: setEntries,
      // Set#forEach(callback:Function, context:void*):void ==> callback.call(context, value, index) === not in specs
      forEach: sharedForEach
    });
  }

  if (typeof WeakSet == 'undefined') {
    exports.WeakSet = createCollection({
      // WeakSet#delete(key:void*):boolean
      'delete': sharedDelete,
      // WeakSet#add(value:void*):boolean
      add: sharedAdd,
      // WeakSet#clear():
      clear: sharedClear,
      // WeakSet#has(value:void*):boolean
      has: setHas
    }, true);
  }


  /**
   * ES6 collection constructor
   * @return {Function} a collection class
   */
  function createCollection(proto, objectOnly) {
    function Collection(a) {
      if (!this || this.constructor !== Collection) return new Collection(a);
      this._keys = [];
      this._values = [];
      this._itp = []; // iteration pointers
      this.objectOnly = objectOnly;

      //parse initial iterable argument passed
      if (a) init.call(this, a);
    }

    //define size for non object-only collections
    if (!objectOnly) {
      defineProperty(proto, 'size', {
        get: sharedSize
      });
    }

    //set prototype
    proto.constructor = Collection;
    Collection.prototype = proto;

    return Collection;
  }


  /** parse initial iterable argument passed */
  function init(a) {
    var i;
    //init Set argument, like `[1,2,3,{}]`
    if (this.add) a.forEach(this.add, this);
    //init Map argument like `[[1,2], [{}, 4]]`
    else a.forEach(function(a) {
      this.set(a[0], a[1])
    }, this);
  }


  /** delete */
  function sharedDelete(key) {
    if (this.has(key)) {
      this._keys.splice(i, 1);
      this._values.splice(i, 1);
      // update iteration pointers
      this._itp.forEach(function(p) {
        if (i < p[0]) p[0]--;
      });
    }
    // Aurora here does it while Canary doesn't
    return -1 < i;
  };

  function sharedGet(key) {
    return this.has(key) ? this._values[i] : undefined;
  }

  function has(list, key) {
    if (this.objectOnly && key !== Object(key)) throw new TypeError("Invalid value used as weak collection key");
    //NaN or 0 passed
    if (key != key || key === 0) for (i = list.length; i-- && !is(list[i], key);) {} else i = list.indexOf(key);
    return -1 < i;
  }

  function setHas(value) {
    return has.call(this, this._values, value);
  }

  function mapHas(value) {
    return has.call(this, this._keys, value);
  }

  /** @chainable */
  function sharedSet(key, value) {
    this.has(key) ? this._values[i] = value : this._values[this._keys.push(key) - 1] = value;
    return this;
  }

  /** @chainable */
  function sharedAdd(value) {
    if (!this.has(value)) this._values.push(value);
    return this;
  }

  function sharedClear() {
    this._values.length = 0;
  }

  /** keys, values, and iterate related methods */
  function sharedKeys() {
    return sharedIterator(this._itp, this._keys);
  }

  function sharedValues() {
    return sharedIterator(this._itp, this._values);
  }

  function mapEntries() {
    return sharedIterator(this._itp, this._keys, this._values);
  }

  function setEntries() {
    return sharedIterator(this._itp, this._values, this._values);
  }

  function sharedIterator(itp, array, array2) {
    var p = [0],
      done = false;
    itp.push(p);
    return {
      next: function() {
        var v, k = p[0];
        if (!done && k < array.length) {
          v = array2 ? [array[k], array2[k]] : array[k];
          p[0]++;
        } else {
          done = true;
          itp.splice(itp.indexOf(p), 1);
        }
        return {
          done: done,
          value: v
        };
      }
    };
  }

  function sharedSize() {
    return this._values.length;
  }

  function sharedForEach(callback, context) {
    var it = this.entries();
    for (;;) {
      var r = it.next();
      if (r.done) break;
      callback.call(context, r.value[1], r.value[0], this);
    }
  }

})(typeof exports != 'undefined' && typeof global != 'undefined' ? global : window);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = getParsingFlags(from);
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function Locale() {
    }

    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && typeof module !== 'undefined' &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (typeof values === 'undefined') {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function get_set__set (mom, unit, value) {
        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

    var regexes = {};

    function isFunction (sth) {
        // https://github.com/moment/moment/issues/2325
        return typeof sth === 'function' &&
            Object.prototype.toString.call(sth) === '[object Function]';
    }


    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  matchWord);
    addRegexToken('MMMM', matchWord);

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m) {
        return this._months[m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m) {
        return this._monthsShort[m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
        ['YYYY-DDD', /\d{4}-\d{3}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
        ['HH:mm', /(T| )\d\d:\d\d/],
        ['HH', /(T| )\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = from_string__isoRegex.exec(string);

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0];
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    // match[6] should be 'T' or space
                    config._f += (match[6] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (string.match(matchOffset)) {
                config._f += 'Z';
            }
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
        if (d < firstDayOfWeek) {
            d += 7;
        }

        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;

        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
        }
        return [now.getFullYear(), now.getMonth(), now.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             return other < this ? this : other;
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            return other > this ? this : other;
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchOffset);
    addRegexToken('ZZ', matchOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(string) {
        var matches = ((string || '').match(matchOffset) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(input);
            }
            if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (typeof this._isDSTShifted !== 'undefined') {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return !this._isUTC;
    }

    function isUtcOffset () {
        return this._isUTC;
    }

    function isUtc () {
        return this._isUTC && this._offset === 0;
    }

    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = create__isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                d : parseIso(match[4], sign),
                h : parseIso(match[5], sign),
                m : parseIso(match[6], sign),
                s : parseIso(match[7], sign),
                w : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this > +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return inputMs < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this < +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return +this.clone().endOf(units) < inputMs;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var inputMs;
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this === +input;
        } else {
            inputMs = +local__createLocal(input);
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function diff (input, units, asFloat) {
        var that = cloneWithOffset(input, this),
            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
            delta, output;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if ('function' === typeof Date.prototype.toISOString) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function weeksInYear(year, dow, doy) {
        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    // MOMENTS

    function getSetWeekYear (input) {
        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getSetISOWeekYear (input) {
        var year = weekOfYear(this, 1, 4).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    addFormatToken('Q', 0, 0, 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
        var weekday = config._locale.weekdaysParse(input);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m) {
        return this._weekdays[m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName) {
        var i, mom, regex;

        this._weekdaysParse = this._weekdaysParse || [];

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            if (!this._weekdaysParse[i]) {
                mom = local__createLocal([2000, 1]).day(i);
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, function () {
        return this.hours() % 12 || 12;
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add          = add_subtract__add;
    momentPrototype__proto.calendar     = moment_calendar__calendar;
    momentPrototype__proto.clone        = clone;
    momentPrototype__proto.diff         = diff;
    momentPrototype__proto.endOf        = endOf;
    momentPrototype__proto.format       = format;
    momentPrototype__proto.from         = from;
    momentPrototype__proto.fromNow      = fromNow;
    momentPrototype__proto.to           = to;
    momentPrototype__proto.toNow        = toNow;
    momentPrototype__proto.get          = getSet;
    momentPrototype__proto.invalidAt    = invalidAt;
    momentPrototype__proto.isAfter      = isAfter;
    momentPrototype__proto.isBefore     = isBefore;
    momentPrototype__proto.isBetween    = isBetween;
    momentPrototype__proto.isSame       = isSame;
    momentPrototype__proto.isValid      = moment_valid__isValid;
    momentPrototype__proto.lang         = lang;
    momentPrototype__proto.locale       = locale;
    momentPrototype__proto.localeData   = localeData;
    momentPrototype__proto.max          = prototypeMax;
    momentPrototype__proto.min          = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set          = getSet;
    momentPrototype__proto.startOf      = startOf;
    momentPrototype__proto.subtract     = add_subtract__subtract;
    momentPrototype__proto.toArray      = toArray;
    momentPrototype__proto.toObject     = toObject;
    momentPrototype__proto.toDate       = toDate;
    momentPrototype__proto.toISOString  = moment_format__toISOString;
    momentPrototype__proto.toJSON       = moment_format__toISOString;
    momentPrototype__proto.toString     = toString;
    momentPrototype__proto.unix         = unix;
    momentPrototype__proto.valueOf      = to_type__valueOf;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return typeof output === 'function' ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (typeof output === 'function') ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (typeof prop === 'function') {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months       =        localeMonths;
    prototype__proto._months      = defaultLocaleMonths;
    prototype__proto.monthsShort  =        localeMonthsShort;
    prototype__proto._monthsShort = defaultLocaleMonthsShort;
    prototype__proto.monthsParse  =        localeMonthsParse;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes === 1          && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   === 1          && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    === 1          && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  === 1          && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   === 1          && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.10.6';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
},{}],5:[function(require,module,exports){
/*!
 * numeral.js
 * version : 1.5.3
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */

(function () {

    /************************************
        Constants
    ************************************/

    var numeral,
        VERSION = '1.5.3',
        // internal storage for language config files
        languages = {},
        currentLanguage = 'en',
        zeroFormat = null,
        defaultFormat = '0,0',
        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports);


    /************************************
        Constructors
    ************************************/


    // Numeral prototype object
    function Numeral (number) {
        this._value = number;
    }

    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     */
    function toFixed (value, precision, roundingFunction, optionals) {
        var power = Math.pow(10, precision),
            optionalsRegExp,
            output;

        //roundingFunction = (roundingFunction !== undefined ? roundingFunction : Math.round);
        // Multiply up by precision, round accurately, then divide and use native toFixed():
        output = (roundingFunction(value * power) / power).toFixed(precision);

        if (optionals) {
            optionalsRegExp = new RegExp('0{1,' + optionals + '}$');
            output = output.replace(optionalsRegExp, '');
        }

        return output;
    }

    /************************************
        Formatting
    ************************************/

    // determine what type of formatting we need to do
    function formatNumeral (n, format, roundingFunction) {
        var output;

        // figure out what kind of format we are dealing with
        if (format.indexOf('$') > -1) { // currency!!!!!
            output = formatCurrency(n, format, roundingFunction);
        } else if (format.indexOf('%') > -1) { // percentage
            output = formatPercentage(n, format, roundingFunction);
        } else if (format.indexOf(':') > -1) { // time
            output = formatTime(n, format);
        } else { // plain ol' numbers or bytes
            output = formatNumber(n._value, format, roundingFunction);
        }

        // return string
        return output;
    }

    // revert to number
    function unformatNumeral (n, string) {
        var stringOriginal = string,
            thousandRegExp,
            millionRegExp,
            billionRegExp,
            trillionRegExp,
            suffixes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            bytesMultiplier = false,
            power;

        if (string.indexOf(':') > -1) {
            n._value = unformatTime(string);
        } else {
            if (string === zeroFormat) {
                n._value = 0;
            } else {
                if (languages[currentLanguage].delimiters.decimal !== '.') {
                    string = string.replace(/\./g,'').replace(languages[currentLanguage].delimiters.decimal, '.');
                }

                // see if abbreviations are there so that we can multiply to the correct number
                thousandRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.thousand + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.million + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.billion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.trillion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');

                // see if bytes are there so that we can multiply to the correct number
                for (power = 0; power <= suffixes.length; power++) {
                    bytesMultiplier = (string.indexOf(suffixes[power]) > -1) ? Math.pow(1024, power + 1) : false;

                    if (bytesMultiplier) {
                        break;
                    }
                }

                // do some math to create our number
                n._value = ((bytesMultiplier) ? bytesMultiplier : 1) * ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) * ((stringOriginal.match(millionRegExp)) ? Math.pow(10, 6) : 1) * ((stringOriginal.match(billionRegExp)) ? Math.pow(10, 9) : 1) * ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) * ((string.indexOf('%') > -1) ? 0.01 : 1) * (((string.split('-').length + Math.min(string.split('(').length-1, string.split(')').length-1)) % 2)? 1: -1) * Number(string.replace(/[^0-9\.]+/g, ''));

                // round if we are talking about bytes
                n._value = (bytesMultiplier) ? Math.ceil(n._value) : n._value;
            }
        }
        return n._value;
    }

    function formatCurrency (n, format, roundingFunction) {
        var symbolIndex = format.indexOf('$'),
            openParenIndex = format.indexOf('('),
            minusSignIndex = format.indexOf('-'),
            space = '',
            spliceIndex,
            output;

        // check for space before or after currency
        if (format.indexOf(' $') > -1) {
            space = ' ';
            format = format.replace(' $', '');
        } else if (format.indexOf('$ ') > -1) {
            space = ' ';
            format = format.replace('$ ', '');
        } else {
            format = format.replace('$', '');
        }

        // format the number
        output = formatNumber(n._value, format, roundingFunction);

        // position the symbol
        if (symbolIndex <= 1) {
            if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {
                output = output.split('');
                spliceIndex = 1;
                if (symbolIndex < openParenIndex || symbolIndex < minusSignIndex){
                    // the symbol appears before the "(" or "-"
                    spliceIndex = 0;
                }
                output.splice(spliceIndex, 0, languages[currentLanguage].currency.symbol + space);
                output = output.join('');
            } else {
                output = languages[currentLanguage].currency.symbol + space + output;
            }
        } else {
            if (output.indexOf(')') > -1) {
                output = output.split('');
                output.splice(-1, 0, space + languages[currentLanguage].currency.symbol);
                output = output.join('');
            } else {
                output = output + space + languages[currentLanguage].currency.symbol;
            }
        }

        return output;
    }

    function formatPercentage (n, format, roundingFunction) {
        var space = '',
            output,
            value = n._value * 100;

        // check for space before %
        if (format.indexOf(' %') > -1) {
            space = ' ';
            format = format.replace(' %', '');
        } else {
            format = format.replace('%', '');
        }

        output = formatNumber(value, format, roundingFunction);

        if (output.indexOf(')') > -1 ) {
            output = output.split('');
            output.splice(-1, 0, space + '%');
            output = output.join('');
        } else {
            output = output + space + '%';
        }

        return output;
    }

    function formatTime (n) {
        var hours = Math.floor(n._value/60/60),
            minutes = Math.floor((n._value - (hours * 60 * 60))/60),
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));
        return hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
    }

    function unformatTime (string) {
        var timeArray = string.split(':'),
            seconds = 0;
        // turn hours and minutes into seconds and add them all up
        if (timeArray.length === 3) {
            // hours
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);
            // minutes
            seconds = seconds + (Number(timeArray[1]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[2]);
        } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + (Number(timeArray[0]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[1]);
        }
        return Number(seconds);
    }

    function formatNumber (value, format, roundingFunction) {
        var negP = false,
            signed = false,
            optDec = false,
            abbr = '',
            abbrK = false, // force abbreviation to thousands
            abbrM = false, // force abbreviation to millions
            abbrB = false, // force abbreviation to billions
            abbrT = false, // force abbreviation to trillions
            abbrForce = false, // force abbreviation
            bytes = '',
            ord = '',
            abs = Math.abs(value),
            suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            min,
            max,
            power,
            w,
            precision,
            thousands,
            d = '',
            neg = false;

        // check if number is zero and a custom zero format has been set
        if (value === 0 && zeroFormat !== null) {
            return zeroFormat;
        } else {
            // see if we should use parentheses for negative number or if we should prefix with a sign
            // if both are present we default to parentheses
            if (format.indexOf('(') > -1) {
                negP = true;
                format = format.slice(1, -1);
            } else if (format.indexOf('+') > -1) {
                signed = true;
                format = format.replace(/\+/g, '');
            }

            // see if abbreviation is wanted
            if (format.indexOf('a') > -1) {
                // check if abbreviation is specified
                abbrK = format.indexOf('aK') >= 0;
                abbrM = format.indexOf('aM') >= 0;
                abbrB = format.indexOf('aB') >= 0;
                abbrT = format.indexOf('aT') >= 0;
                abbrForce = abbrK || abbrM || abbrB || abbrT;

                // check for space before abbreviation
                if (format.indexOf(' a') > -1) {
                    abbr = ' ';
                    format = format.replace(' a', '');
                } else {
                    format = format.replace('a', '');
                }

                if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {
                    // trillion
                    abbr = abbr + languages[currentLanguage].abbreviations.trillion;
                    value = value / Math.pow(10, 12);
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {
                    // billion
                    abbr = abbr + languages[currentLanguage].abbreviations.billion;
                    value = value / Math.pow(10, 9);
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {
                    // million
                    abbr = abbr + languages[currentLanguage].abbreviations.million;
                    value = value / Math.pow(10, 6);
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {
                    // thousand
                    abbr = abbr + languages[currentLanguage].abbreviations.thousand;
                    value = value / Math.pow(10, 3);
                }
            }

            // see if we are formatting bytes
            if (format.indexOf('b') > -1) {
                // check for space before
                if (format.indexOf(' b') > -1) {
                    bytes = ' ';
                    format = format.replace(' b', '');
                } else {
                    format = format.replace('b', '');
                }

                for (power = 0; power <= suffixes.length; power++) {
                    min = Math.pow(1024, power);
                    max = Math.pow(1024, power+1);

                    if (value >= min && value < max) {
                        bytes = bytes + suffixes[power];
                        if (min > 0) {
                            value = value / min;
                        }
                        break;
                    }
                }
            }

            // see if ordinal is wanted
            if (format.indexOf('o') > -1) {
                // check for space before
                if (format.indexOf(' o') > -1) {
                    ord = ' ';
                    format = format.replace(' o', '');
                } else {
                    format = format.replace('o', '');
                }

                ord = ord + languages[currentLanguage].ordinal(value);
            }

            if (format.indexOf('[.]') > -1) {
                optDec = true;
                format = format.replace('[.]', '.');
            }

            w = value.toString().split('.')[0];
            precision = format.split('.')[1];
            thousands = format.indexOf(',');

            if (precision) {
                if (precision.indexOf('[') > -1) {
                    precision = precision.replace(']', '');
                    precision = precision.split('[');
                    d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                } else {
                    d = toFixed(value, precision.length, roundingFunction);
                }

                w = d.split('.')[0];

                if (d.split('.')[1].length) {
                    d = languages[currentLanguage].delimiters.decimal + d.split('.')[1];
                } else {
                    d = '';
                }

                if (optDec && Number(d.slice(1)) === 0) {
                    d = '';
                }
            } else {
                w = toFixed(value, null, roundingFunction);
            }

            // format number
            if (w.indexOf('-') > -1) {
                w = w.slice(1);
                neg = true;
            }

            if (thousands > -1) {
                w = w.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + languages[currentLanguage].delimiters.thousands);
            }

            if (format.indexOf('.') === 0) {
                w = '';
            }

            return ((negP && neg) ? '(' : '') + ((!negP && neg) ? '-' : '') + ((!neg && signed) ? '+' : '') + w + d + ((ord) ? ord : '') + ((abbr) ? abbr : '') + ((bytes) ? bytes : '') + ((negP && neg) ? ')' : '');
        }
    }

    /************************************
        Top Level Functions
    ************************************/

    numeral = function (input) {
        if (numeral.isNumeral(input)) {
            input = input.value();
        } else if (input === 0 || typeof input === 'undefined') {
            input = 0;
        } else if (!Number(input)) {
            input = numeral.fn.unformat(input);
        }

        return new Numeral(Number(input));
    };

    // version number
    numeral.version = VERSION;

    // compare numeral object
    numeral.isNumeral = function (obj) {
        return obj instanceof Numeral;
    };

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    numeral.language = function (key, values) {
        if (!key) {
            return currentLanguage;
        }

        if (key && !values) {
            if(!languages[key]) {
                throw new Error('Unknown language : ' + key);
            }
            currentLanguage = key;
        }

        if (values || !languages[key]) {
            loadLanguage(key, values);
        }

        return numeral;
    };

    // This function provides access to the loaded language data.  If
    // no arguments are passed in, it will simply return the current
    // global language object.
    numeral.languageData = function (key) {
        if (!key) {
            return languages[currentLanguage];
        }

        if (!languages[key]) {
            throw new Error('Unknown language : ' + key);
        }

        return languages[key];
    };

    numeral.language('en', {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$'
        }
    });

    numeral.zeroFormat = function (format) {
        zeroFormat = typeof(format) === 'string' ? format : null;
    };

    numeral.defaultFormat = function (format) {
        defaultFormat = typeof(format) === 'string' ? format : '0.0';
    };

    numeral.validate = function(val, culture) {

        var _decimalSep,
          _thousandSep,
          _currSymbol,
          _valArray,
          _abbrObj,
          _thousandRegEx,
          languageData,
          temp;

        //coerce val to string
        if (typeof val !== 'string') {
            val += '';
            if (console.warn) {
                console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
            }
        }

        //trim whitespaces from either sides
        val = val.trim();


        //if val is empty return false
        if (val === '') {
            return false;
        }

        //replace the initial '+' or '-' sign if present
        val = val.replace(/^[+-]?/, '');


        //get the decimal and thousands separator from numeral.languageData
        try {
            //check if the culture is understood by numeral. if not, default it to current language
            languageData = numeral.languageData(culture);
        } catch (e) {
            languageData = numeral.languageData(numeral.language());
        }

        //setup the delimiters and currency symbol based on culture/language
        _currSymbol = languageData.currency.symbol;
        _abbrObj = languageData.abbreviations;
        _decimalSep = languageData.delimiters.decimal;
        if (languageData.delimiters.thousands === '.') {
            _thousandSep = '\\.';
        } else {
            _thousandSep = languageData.delimiters.thousands;
        }

        //validating currency symbol
        temp = val.match(/^[^\d\.\,]+/);
        if (temp !== null) {
            //chuck the currency symbol away
            val = val.substr(1);
            if (temp[0] !== _currSymbol) {
                return false;
            }
        }

        //validating abbreviation symbol
        temp = val.match(/[^\d]+$/);
        if (temp !== null) {
            val = val.slice(0, - 1);
            if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million && temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
                return false;
            }
        }

        //if val is just digits the return true
        if ( !! val.match(/^\d+$/)) {
            return true;
        }
        _thousandRegEx = new RegExp(_thousandSep + '{2}');

        if (!val.match(/[^\d.,]/g)) {
            _valArray = val.split(_decimalSep);
            if (_valArray.length > 2) {
                return false;
            } else {
                if (_valArray.length < 2) {
                    return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx));
                } else {
                    // for values without leading zero eg. .984
                    if (_valArray[0] === '') {
                        return ( !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                    } else if (_valArray[0].length === 1) {
                        return ( !! _valArray[0].match(/^\d+$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                    } else {
                        return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                    }
                }
            }
        }

        return false;
    };

    /************************************
        Helpers
    ************************************/

    function loadLanguage(key, values) {
        languages[key] = values;
    }

    /************************************
        Floating-point helpers
    ************************************/

    // The floating-point helper functions and implementation
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/

    /**
     * Array.prototype.reduce for browsers that don't support it
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
     */
    if ('function' !== typeof Array.prototype.reduce) {
        Array.prototype.reduce = function (callback, opt_initialValue) {
            'use strict';

            if (null === this || 'undefined' === typeof this) {
                // At the moment all modern browsers, that support strict mode, have
                // native implementation of Array.prototype.reduce. For instance, IE8
                // does not support strict mode, so this check is actually useless.
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }

            if ('function' !== typeof callback) {
                throw new TypeError(callback + ' is not a function');
            }

            var index,
                value,
                length = this.length >>> 0,
                isValueSet = false;

            if (1 < arguments.length) {
                value = opt_initialValue;
                isValueSet = true;
            }

            for (index = 0; length > index; ++index) {
                if (this.hasOwnProperty(index)) {
                    if (isValueSet) {
                        value = callback(value, this[index], index, this);
                    } else {
                        value = this[index];
                        isValueSet = true;
                    }
                }
            }

            if (!isValueSet) {
                throw new TypeError('Reduce of empty array with no initial value');
            }

            return value;
        };
    }


    /**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
    function multiplier(x) {
        var parts = x.toString().split('.');
        if (parts.length < 2) {
            return 1;
        }
        return Math.pow(10, parts[1].length);
    }

    /**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
    function correctionFactor() {
        var args = Array.prototype.slice.call(arguments);
        return args.reduce(function (prev, next) {
            var mp = multiplier(prev),
                mn = multiplier(next);
        return mp > mn ? mp : mn;
        }, -Infinity);
    }


    /************************************
        Numeral Prototype
    ************************************/


    numeral.fn = Numeral.prototype = {

        clone : function () {
            return numeral(this);
        },

        format : function (inputString, roundingFunction) {
            return formatNumeral(this,
                  inputString ? inputString : defaultFormat,
                  (roundingFunction !== undefined) ? roundingFunction : Math.round
              );
        },

        unformat : function (inputString) {
            if (Object.prototype.toString.call(inputString) === '[object Number]') {
                return inputString;
            }
            return unformatNumeral(this, inputString ? inputString : defaultFormat);
        },

        value : function () {
            return this._value;
        },

        valueOf : function () {
            return this._value;
        },

        set : function (value) {
            this._value = Number(value);
            return this;
        },

        add : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);

            function cback(accum, curr, currI, O) {
                return accum + corrFactor * curr;
            }
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;
            return this;
        },

        subtract : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);

            function cback(accum, curr, currI, O) {
                return accum - corrFactor * curr;
            }
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;
            return this;
        },

        multiply : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) * (curr * corrFactor) /
                    (corrFactor * corrFactor);
            }
            this._value = [this._value, value].reduce(cback, 1);
            return this;
        },

        divide : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) / (curr * corrFactor);
            }
            this._value = [this._value, value].reduce(cback);
            return this;
        },

        difference : function (value) {
            return Math.abs(numeral(this._value).subtract(value).value());
        }

    };

    /************************************
        Exposing Numeral
    ************************************/

    // CommonJS module is defined
    if (hasModule) {
        module.exports = numeral;
    }

    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `numeral` as a global object via a string identifier,
        // for Closure Compiler 'advanced' mode
        this['numeral'] = numeral;
    }

    /*global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return numeral;
        });
    }
}).call(window);

},{}],6:[function(require,module,exports){
/*!
 * Pikaday
 *
 * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikaday
 */

(function (root, factory)
{
    'use strict';

    var moment;
    if (typeof exports === 'object') {
        // CommonJS module
        // Load moment.js as an optional dependency
        try { moment = require('moment'); } catch (e) {}
        module.exports = factory(moment);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function (req)
        {
            // Load moment.js as an optional dependency
            var id = 'moment';
            try { moment = req(id); } catch (e) {}
            return factory(moment);
        });
    } else {
        root.Pikaday = factory(root.moment);
    }
}(this, function (moment)
{
    'use strict';

    /**
     * feature detection and helper functions
     */
    var hasMoment = typeof moment === 'function',

    hasEventListeners = !!window.addEventListener,

    document = window.document,

    sto = window.setTimeout,

    addEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.addEventListener(e, callback, !!capture);
        } else {
            el.attachEvent('on' + e, callback);
        }
    },

    removeEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.removeEventListener(e, callback, !!capture);
        } else {
            el.detachEvent('on' + e, callback);
        }
    },

    fireEvent = function(el, eventName, data)
    {
        var ev;

        if (document.createEvent) {
            ev = document.createEvent('HTMLEvents');
            ev.initEvent(eventName, true, false);
            ev = extend(ev, data);
            el.dispatchEvent(ev);
        } else if (document.createEventObject) {
            ev = document.createEventObject();
            ev = extend(ev, data);
            el.fireEvent('on' + eventName, ev);
        }
    },

    trim = function(str)
    {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
    },

    hasClass = function(el, cn)
    {
        return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
    },

    addClass = function(el, cn)
    {
        if (!hasClass(el, cn)) {
            el.className = (el.className === '') ? cn : el.className + ' ' + cn;
        }
    },

    removeClass = function(el, cn)
    {
        el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
    },

    isArray = function(obj)
    {
        return (/Array/).test(Object.prototype.toString.call(obj));
    },

    isDate = function(obj)
    {
        return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
    },

    isWeekend = function(date)
    {
        var day = date.getDay();
        return day === 0 || day === 6;
    },

    isLeapYear = function(year)
    {
        // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    },

    getDaysInMonth = function(year, month)
    {
        return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },

    setToStartOfDay = function(date)
    {
        if (isDate(date)) date.setHours(0,0,0,0);
    },

    compareDates = function(a,b)
    {
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        return a.getTime() === b.getTime();
    },

    extend = function(to, from, overwrite)
    {
        var prop, hasProp;
        for (prop in from) {
            hasProp = to[prop] !== undefined;
            if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
                if (isDate(from[prop])) {
                    if (overwrite) {
                        to[prop] = new Date(from[prop].getTime());
                    }
                }
                else if (isArray(from[prop])) {
                    if (overwrite) {
                        to[prop] = from[prop].slice(0);
                    }
                } else {
                    to[prop] = extend({}, from[prop], overwrite);
                }
            } else if (overwrite || !hasProp) {
                to[prop] = from[prop];
            }
        }
        return to;
    },

    adjustCalendar = function(calendar) {
        if (calendar.month < 0) {
            calendar.year -= Math.ceil(Math.abs(calendar.month)/12);
            calendar.month += 12;
        }
        if (calendar.month > 11) {
            calendar.year += Math.floor(Math.abs(calendar.month)/12);
            calendar.month -= 12;
        }
        return calendar;
    },

    /**
     * defaults and localisation
     */
    defaults = {

        // bind the picker to a form field
        field: null,

        // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
        bound: undefined,

        // position of the datepicker, relative to the field (default to bottom & left)
        // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
        position: 'bottom left',

        // automatically fit in the viewport even if it means repositioning from the position option
        reposition: true,

        // the default output format for `.toString()` and `field` value
        format: 'YYYY-MM-DD',

        // the initial date to view when first opened
        defaultDate: null,

        // make the `defaultDate` the initial selected value
        setDefaultDate: false,

        // first day of week (0: Sunday, 1: Monday etc)
        firstDay: 0,

        // the minimum/earliest date that can be selected
        minDate: null,
        // the maximum/latest date that can be selected
        maxDate: null,

        // number of years either side, or array of upper/lower range
        yearRange: 10,

        // show week numbers at head of row
        showWeekNumber: false,

        // used internally (don't config outside)
        minYear: 0,
        maxYear: 9999,
        minMonth: undefined,
        maxMonth: undefined,

        startRange: null,
        endRange: null,

        isRTL: false,

        // Additional text to append to the year in the calendar title
        yearSuffix: '',

        // Render the month after year in the calendar title
        showMonthAfterYear: false,

        // how many months are visible
        numberOfMonths: 1,

        // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
        // only used for the first display or when a selected date is not visible
        mainCalendar: 'left',

        // Specify a DOM element to render the calendar in
        container: undefined,

        // internationalization
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
            weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        },

        // Theme Classname
        theme: null,

        // callback function
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    },


    /**
     * templating functions to abstract HTML rendering
     */
    renderDayName = function(opts, day, abbr)
    {
        day += opts.firstDay;
        while (day >= 7) {
            day -= 7;
        }
        return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
    },

    renderDay = function(opts)
    {
        if (opts.isEmpty) {
            return '<td class="is-empty"></td>';
        }
        var arr = [];
        if (opts.isDisabled) {
            arr.push('is-disabled');
        }
        if (opts.isToday) {
            arr.push('is-today');
        }
        if (opts.isSelected) {
            arr.push('is-selected');
        }
        if (opts.isInRange) {
            arr.push('is-inrange');
        }
        if (opts.isStartRange) {
            arr.push('is-startrange');
        }
        if (opts.isEndRange) {
            arr.push('is-endrange');
        }
        return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '">' +
                 '<button class="pika-button pika-day" type="button" ' +
                    'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' +
                        opts.day +
                 '</button>' +
               '</td>';
    },

    renderWeek = function (d, m, y) {
        // Lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
        var onejan = new Date(y, 0, 1),
            weekNum = Math.ceil((((new Date(y, m, d) - onejan) / 86400000) + onejan.getDay()+1)/7);
        return '<td class="pika-week">' + weekNum + '</td>';
    },

    renderRow = function(days, isRTL)
    {
        return '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
    },

    renderBody = function(rows)
    {
        return '<tbody>' + rows.join('') + '</tbody>';
    },

    renderHead = function(opts)
    {
        var i, arr = [];
        if (opts.showWeekNumber) {
            arr.push('<th></th>');
        }
        for (i = 0; i < 7; i++) {
            arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
        }
        return '<thead>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</thead>';
    },

    renderTitle = function(instance, c, year, month, refYear)
    {
        var i, j, arr,
            opts = instance._o,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div class="pika-title">',
            monthHtml,
            yearHtml,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
            arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
                (i === month ? ' selected': '') +
                ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled' : '') + '>' +
                opts.i18n.months[i] + '</option>');
        }
        monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select></div>';

        if (isArray(opts.yearRange)) {
            i = opts.yearRange[0];
            j = opts.yearRange[1] + 1;
        } else {
            i = year - opts.yearRange;
            j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
            if (i >= opts.minYear) {
                arr.push('<option value="' + i + '"' + (i === year ? ' selected': '') + '>' + (i) + '</option>');
            }
        }
        yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select></div>';

        if (opts.showMonthAfterYear) {
            html += yearHtml + monthHtml;
        } else {
            html += monthHtml + yearHtml;
        }

        if (isMinYear && (month === 0 || opts.minMonth >= month)) {
            prev = false;
        }

        if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
            next = false;
        }

        if (c === 0) {
            html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
        }
        if (c === (instance._o.numberOfMonths - 1) ) {
            html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
        }

        return html += '</div>';
    },

    renderTable = function(opts, data)
    {
        return '<table cellpadding="0" cellspacing="0" class="pika-table">' + renderHead(opts) + renderBody(data) + '</table>';
    },


    /**
     * Pikaday constructor
     */
    Pikaday = function(options)
    {
        var self = this,
            opts = self.config(options);

        self._onMouseDown = function(e)
        {
            if (!self._v) {
                return;
            }
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }

            if (!hasClass(target.parentNode, 'is-disabled')) {
                if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty')) {
                    self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
                    if (opts.bound) {
                        sto(function() {
                            self.hide();
                            if (opts.field) {
                                opts.field.blur();
                            }
                        }, 100);
                    }
                    return;
                }
                else if (hasClass(target, 'pika-prev')) {
                    self.prevMonth();
                }
                else if (hasClass(target, 'pika-next')) {
                    self.nextMonth();
                }
            }
            if (!hasClass(target, 'pika-select')) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                    return false;
                }
            } else {
                self._c = true;
            }
        };

        self._onChange = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }
            if (hasClass(target, 'pika-select-month')) {
                self.gotoMonth(target.value);
            }
            else if (hasClass(target, 'pika-select-year')) {
                self.gotoYear(target.value);
            }
        };

        self._onInputChange = function(e)
        {
            var date;

            if (e.firedBy === self) {
                return;
            }
            if (hasMoment) {
                date = moment(opts.field.value, opts.format);
                date = (date && date.isValid()) ? date.toDate() : null;
            }
            else {
                date = new Date(Date.parse(opts.field.value));
            }
            if (isDate(date)) {
              self.setDate(date);
            }
            if (!self._v) {
                self.show();
            }
        };

        self._onInputFocus = function()
        {
            self.show();
        };

        self._onInputClick = function()
        {
            self.show();
        };

        self._onInputBlur = function()
        {
            // IE allows pika div to gain focus; catch blur the input field
            var pEl = document.activeElement;
            do {
                if (hasClass(pEl, 'pika-single')) {
                    return;
                }
            }
            while ((pEl = pEl.parentNode));

            if (!self._c) {
                self._b = sto(function() {
                    self.hide();
                }, 50);
            }
            self._c = false;
        };

        self._onClick = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement,
                pEl = target;
            if (!target) {
                return;
            }
            if (!hasEventListeners && hasClass(target, 'pika-select')) {
                if (!target.onchange) {
                    target.setAttribute('onchange', 'return;');
                    addEvent(target, 'change', self._onChange);
                }
            }
            do {
                if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
                    return;
                }
            }
            while ((pEl = pEl.parentNode));
            if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
                self.hide();
            }
        };

        self.el = document.createElement('div');
        self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');

        addEvent(self.el, 'ontouchend' in document ? 'touchend' : 'mousedown', self._onMouseDown, true);
        addEvent(self.el, 'change', self._onChange);

        if (opts.field) {
            if (opts.container) {
                opts.container.appendChild(self.el);
            } else if (opts.bound) {
                document.body.appendChild(self.el);
            } else {
                opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
            }
            addEvent(opts.field, 'change', self._onInputChange);

            if (!opts.defaultDate) {
                if (hasMoment && opts.field.value) {
                    opts.defaultDate = moment(opts.field.value, opts.format).toDate();
                } else {
                    opts.defaultDate = new Date(Date.parse(opts.field.value));
                }
                opts.setDefaultDate = true;
            }
        }

        var defDate = opts.defaultDate;

        if (isDate(defDate)) {
            if (opts.setDefaultDate) {
                self.setDate(defDate, true);
            } else {
                self.gotoDate(defDate);
            }
        } else {
            self.gotoDate(new Date());
        }

        if (opts.bound) {
            this.hide();
            self.el.className += ' is-bound';
            addEvent(opts.trigger, 'click', self._onInputClick);
            addEvent(opts.trigger, 'focus', self._onInputFocus);
            addEvent(opts.trigger, 'blur', self._onInputBlur);
        } else {
            this.show();
        }
    };


    /**
     * public Pikaday API
     */
    Pikaday.prototype = {


        /**
         * configure functionality
         */
        config: function(options)
        {
            if (!this._o) {
                this._o = extend({}, defaults, true);
            }

            var opts = extend(this._o, options, true);

            opts.isRTL = !!opts.isRTL;

            opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

            opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null;

            opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

            opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

            opts.disableWeekends = !!opts.disableWeekends;

            opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null;

            var nom = parseInt(opts.numberOfMonths, 10) || 1;
            opts.numberOfMonths = nom > 4 ? 4 : nom;

            if (!isDate(opts.minDate)) {
                opts.minDate = false;
            }
            if (!isDate(opts.maxDate)) {
                opts.maxDate = false;
            }
            if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
                opts.maxDate = opts.minDate = false;
            }
            if (opts.minDate) {
                this.setMinDate(opts.minDate);
            }
            if (opts.maxDate) {
                setToStartOfDay(opts.maxDate);
                opts.maxYear  = opts.maxDate.getFullYear();
                opts.maxMonth = opts.maxDate.getMonth();
            }

            if (isArray(opts.yearRange)) {
                var fallback = new Date().getFullYear() - 10;
                opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
            } else {
                opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                if (opts.yearRange > 100) {
                    opts.yearRange = 100;
                }
            }

            return opts;
        },

        /**
         * return a formatted string of the current selection (using Moment.js if available)
         */
        toString: function(format)
        {
            return !isDate(this._d) ? '' : hasMoment ? moment(this._d).format(format || this._o.format) : this._d.toDateString();
        },

        /**
         * return a Moment.js object of the current selection (if available)
         */
        getMoment: function()
        {
            return hasMoment ? moment(this._d) : null;
        },

        /**
         * set the current selection from a Moment.js object (if available)
         */
        setMoment: function(date, preventOnSelect)
        {
            if (hasMoment && moment.isMoment(date)) {
                this.setDate(date.toDate(), preventOnSelect);
            }
        },

        /**
         * return a Date object of the current selection
         */
        getDate: function()
        {
            return isDate(this._d) ? new Date(this._d.getTime()) : null;
        },

        /**
         * set the current selection
         */
        setDate: function(date, preventOnSelect)
        {
            if (!date) {
                this._d = null;

                if (this._o.field) {
                    this._o.field.value = '';
                    fireEvent(this._o.field, 'change', { firedBy: this });
                }

                return this.draw();
            }
            if (typeof date === 'string') {
                date = new Date(Date.parse(date));
            }
            if (!isDate(date)) {
                return;
            }

            var min = this._o.minDate,
                max = this._o.maxDate;

            if (isDate(min) && date < min) {
                date = min;
            } else if (isDate(max) && date > max) {
                date = max;
            }

            this._d = new Date(date.getTime());
            setToStartOfDay(this._d);
            this.gotoDate(this._d);

            if (this._o.field) {
                this._o.field.value = this.toString();
                fireEvent(this._o.field, 'change', { firedBy: this });
            }
            if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                this._o.onSelect.call(this, this.getDate());
            }
        },

        /**
         * change view to a specific date
         */
        gotoDate: function(date)
        {
            var newCalendar = true;

            if (!isDate(date)) {
                return;
            }

            if (this.calendars) {
                var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
                    lastVisibleDate = new Date(this.calendars[this.calendars.length-1].year, this.calendars[this.calendars.length-1].month, 1),
                    visibleDate = date.getTime();
                // get the end of the month
                lastVisibleDate.setMonth(lastVisibleDate.getMonth()+1);
                lastVisibleDate.setDate(lastVisibleDate.getDate()-1);
                newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
            }

            if (newCalendar) {
                this.calendars = [{
                    month: date.getMonth(),
                    year: date.getFullYear()
                }];
                if (this._o.mainCalendar === 'right') {
                    this.calendars[0].month += 1 - this._o.numberOfMonths;
                }
            }

            this.adjustCalendars();
        },

        adjustCalendars: function() {
            this.calendars[0] = adjustCalendar(this.calendars[0]);
            for (var c = 1; c < this._o.numberOfMonths; c++) {
                this.calendars[c] = adjustCalendar({
                    month: this.calendars[0].month + c,
                    year: this.calendars[0].year
                });
            }
            this.draw();
        },

        gotoToday: function()
        {
            this.gotoDate(new Date());
        },

        /**
         * change view to a specific month (zero-index, e.g. 0: January)
         */
        gotoMonth: function(month)
        {
            if (!isNaN(month)) {
                this.calendars[0].month = parseInt(month, 10);
                this.adjustCalendars();
            }
        },

        nextMonth: function()
        {
            this.calendars[0].month++;
            this.adjustCalendars();
        },

        prevMonth: function()
        {
            this.calendars[0].month--;
            this.adjustCalendars();
        },

        /**
         * change view to a specific full year (e.g. "2012")
         */
        gotoYear: function(year)
        {
            if (!isNaN(year)) {
                this.calendars[0].year = parseInt(year, 10);
                this.adjustCalendars();
            }
        },

        /**
         * change the minDate
         */
        setMinDate: function(value)
        {
            setToStartOfDay(value);
            this._o.minDate = value;
            this._o.minYear  = value.getFullYear();
            this._o.minMonth = value.getMonth();
        },

        /**
         * change the maxDate
         */
        setMaxDate: function(value)
        {
            this._o.maxDate = value;
        },

        setStartRange: function(value)
        {
            this._o.startRange = value;
        },

        setEndRange: function(value)
        {
            this._o.endRange = value;
        },

        /**
         * refresh the HTML
         */
        draw: function(force)
        {
            if (!this._v && !force) {
                return;
            }
            var opts = this._o,
                minYear = opts.minYear,
                maxYear = opts.maxYear,
                minMonth = opts.minMonth,
                maxMonth = opts.maxMonth,
                html = '';

            if (this._y <= minYear) {
                this._y = minYear;
                if (!isNaN(minMonth) && this._m < minMonth) {
                    this._m = minMonth;
                }
            }
            if (this._y >= maxYear) {
                this._y = maxYear;
                if (!isNaN(maxMonth) && this._m > maxMonth) {
                    this._m = maxMonth;
                }
            }

            for (var c = 0; c < opts.numberOfMonths; c++) {
                html += '<div class="pika-lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year) + this.render(this.calendars[c].year, this.calendars[c].month) + '</div>';
            }

            this.el.innerHTML = html;

            if (opts.bound) {
                if(opts.field.type !== 'hidden') {
                    sto(function() {
                        opts.trigger.focus();
                    }, 1);
                }
            }

            if (typeof this._o.onDraw === 'function') {
                var self = this;
                sto(function() {
                    self._o.onDraw.call(self);
                }, 0);
            }
        },

        adjustPosition: function()
        {
            var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect;
            
            if (this._o.container) return;
            
            this.el.style.position = 'absolute';
            
            field = this._o.trigger;
            pEl = field;
            width = this.el.offsetWidth;
            height = this.el.offsetHeight;
            viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

            if (typeof field.getBoundingClientRect === 'function') {
                clientRect = field.getBoundingClientRect();
                left = clientRect.left + window.pageXOffset;
                top = clientRect.bottom + window.pageYOffset;
            } else {
                left = pEl.offsetLeft;
                top  = pEl.offsetTop + pEl.offsetHeight;
                while((pEl = pEl.offsetParent)) {
                    left += pEl.offsetLeft;
                    top  += pEl.offsetTop;
                }
            }

            // default position is bottom & left
            if ((this._o.reposition && left + width > viewportWidth) ||
                (
                    this._o.position.indexOf('right') > -1 &&
                    left - width + field.offsetWidth > 0
                )
            ) {
                left = left - width + field.offsetWidth;
            }
            if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
                (
                    this._o.position.indexOf('top') > -1 &&
                    top - height - field.offsetHeight > 0
                )
            ) {
                top = top - height - field.offsetHeight;
            }

            this.el.style.left = left + 'px';
            this.el.style.top = top + 'px';
        },

        /**
         * render HTML for a particular month
         */
        render: function(year, month)
        {
            var opts   = this._o,
                now    = new Date(),
                days   = getDaysInMonth(year, month),
                before = new Date(year, month, 1).getDay(),
                data   = [],
                row    = [];
            setToStartOfDay(now);
            if (opts.firstDay > 0) {
                before -= opts.firstDay;
                if (before < 0) {
                    before += 7;
                }
            }
            var cells = days + before,
                after = cells;
            while(after > 7) {
                after -= 7;
            }
            cells += 7 - after;
            for (var i = 0, r = 0; i < cells; i++)
            {
                var dayConfig,
                    day = new Date(year, month, 1 + (i - before)),
                    isSelected = isDate(this._d) ? compareDates(day, this._d) : false,
                    isToday = compareDates(day, now),
                    isEmpty = i < before || i >= (days + before),
                    isStartRange = opts.startRange && compareDates(opts.startRange, day),
                    isEndRange = opts.endRange && compareDates(opts.endRange, day),
                    isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
                    isDisabled = (opts.minDate && day < opts.minDate) ||
                                 (opts.maxDate && day > opts.maxDate) ||
                                 (opts.disableWeekends && isWeekend(day)) ||
                                 (opts.disableDayFn && opts.disableDayFn(day)),
                    dayConfig = {
                        day: 1 + (i - before),
                        month: month,
                        year: year,
                        isSelected: isSelected,
                        isToday: isToday,
                        isDisabled: isDisabled,
                        isEmpty: isEmpty,
                        isStartRange: isStartRange,
                        isEndRange: isEndRange,
                        isInRange: isInRange
                    };

                row.push(renderDay(dayConfig));

                if (++r === 7) {
                    if (opts.showWeekNumber) {
                        row.unshift(renderWeek(i - before, month, year));
                    }
                    data.push(renderRow(row, opts.isRTL));
                    row = [];
                    r = 0;
                }
            }
            return renderTable(opts, data);
        },

        isVisible: function()
        {
            return this._v;
        },

        show: function()
        {
            if (!this._v) {
                removeClass(this.el, 'is-hidden');
                this._v = true;
                this.draw();
                if (this._o.bound) {
                    addEvent(document, 'click', this._onClick);
                    this.adjustPosition();
                }
                if (typeof this._o.onOpen === 'function') {
                    this._o.onOpen.call(this);
                }
            }
        },

        hide: function()
        {
            var v = this._v;
            if (v !== false) {
                if (this._o.bound) {
                    removeEvent(document, 'click', this._onClick);
                }
                this.el.style.position = 'static'; // reset
                this.el.style.left = 'auto';
                this.el.style.top = 'auto';
                addClass(this.el, 'is-hidden');
                this._v = false;
                if (v !== undefined && typeof this._o.onClose === 'function') {
                    this._o.onClose.call(this);
                }
            }
        },

        /**
         * GAME OVER
         */
        destroy: function()
        {
            this.hide();
            removeEvent(this.el, 'mousedown', this._onMouseDown, true);
            removeEvent(this.el, 'change', this._onChange);
            if (this._o.field) {
                removeEvent(this._o.field, 'change', this._onInputChange);
                if (this._o.bound) {
                    removeEvent(this._o.trigger, 'click', this._onInputClick);
                    removeEvent(this._o.trigger, 'focus', this._onInputFocus);
                    removeEvent(this._o.trigger, 'blur', this._onInputBlur);
                }
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }

    };

    return Pikaday;

}));

},{"moment":4}],7:[function(require,module,exports){
'use strict';

if (window.jQuery) {
  (function (window, $, Handsontable) {
    $.fn.handsontable = function (action) {
      var i,
          ilen,
          args,
          output,
          userSettings,
          $this = this.first(),
          // Use only first element from list
      instance = $this.data('handsontable');

      // Init case
      if (typeof action !== 'string') {
        userSettings = action || {};
        if (instance) {
          instance.updateSettings(userSettings);
        } else {
          instance = new Handsontable.Core($this[0], userSettings);
          $this.data('handsontable', instance);
          instance.init();
        }

        return $this;
      }
      // Action case
      else {
          args = [];
          if (arguments.length > 1) {
            for (i = 1, ilen = arguments.length; i < ilen; i++) {
              args.push(arguments[i]);
            }
          }

          if (instance) {
            if (typeof instance[action] !== 'undefined') {
              output = instance[action].apply(instance, args);

              if (action === 'destroy') {
                $this.removeData();
              }
            } else {
              throw new Error('Handsontable do not provide action: ' + action);
            }
          }

          return output;
        }
    };
  })(window, jQuery, Handsontable);
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

var _helpersDomEvent = require('./../../../helpers/dom/event');

var _eventManager = require('./../../../eventManager');

var _cellCoords = require('./cell/coords');

var WalkontableBorder = (function () {
  /**
   * @param {Walkontable} wotInstance
   * @param {Object} settings
   */

  function WalkontableBorder(wotInstance, settings) {
    _classCallCheck(this, WalkontableBorder);

    if (!settings) {
      return;
    }
    this.eventManager = new _eventManager.EventManager(wotInstance);
    this.instance = wotInstance;
    this.wot = wotInstance;
    this.settings = settings;
    this.mouseDown = false;
    this.main = null;

    this.top = null;
    this.left = null;
    this.bottom = null;
    this.right = null;

    this.topStyle = null;
    this.leftStyle = null;
    this.bottomStyle = null;
    this.rightStyle = null;

    this.cornerDefaultStyle = {
      width: '5px',
      height: '5px',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#FFF'
    };
    this.corner = null;
    this.cornerStyle = null;

    this.createBorders(settings);
    this.registerListeners();
  }

  /**
   * Register all necessary events
   */

  _createClass(WalkontableBorder, [{
    key: 'registerListeners',
    value: function registerListeners() {
      var _this2 = this;

      this.eventManager.addEventListener(document.body, 'mousedown', function () {
        return _this2.onMouseDown();
      });
      this.eventManager.addEventListener(document.body, 'mouseup', function () {
        return _this2.onMouseUp();
      });

      for (var c = 0, len = this.main.childNodes.length; c < len; c++) {
        this.eventManager.addEventListener(this.main.childNodes[c], 'mouseenter', function (event) {
          return _this2.onMouseEnter(event);
        });
      }
    }

    /**
     * Mouse down listener
     *
     * @private
     */
  }, {
    key: 'onMouseDown',
    value: function onMouseDown() {
      this.mouseDown = true;
    }

    /**
     * Mouse up listener
     *
     * @private
     */
  }, {
    key: 'onMouseUp',
    value: function onMouseUp() {
      this.mouseDown = false;
    }

    /**
     * Mouse enter listener
     *
     * @private
     * @param {Event} event Dom event
     */
  }, {
    key: 'onMouseEnter',
    value: function onMouseEnter(event) {
      if (!this.mouseDown || !this.wot.getSetting('hideBorderOnMouseDownOver')) {
        return;
      }
      event.preventDefault();
      (0, _helpersDomEvent.stopImmediatePropagation)(event);

      var _this = this;
      var bounds = this.getBoundingClientRect();
      this.style.display = 'none';

      function isOutside(event) {
        if (event.clientY < Math.floor(bounds.top)) {
          return true;
        }
        if (event.clientY > Math.ceil(bounds.top + bounds.height)) {
          return true;
        }
        if (event.clientX < Math.floor(bounds.left)) {
          return true;
        }
        if (event.clientX > Math.ceil(bounds.left + bounds.width)) {
          return true;
        }
      }
      function handler(event) {
        if (isOutside(event)) {
          _this.eventManager.removeEventListener(document.body, 'mousemove', handler);
          _this.style.display = 'block';
        }
      }
      this.eventManager.addEventListener(document.body, 'mousemove', handler);
    }

    /**
     * Create border elements
     *
     * @param {Object} settings
     */
  }, {
    key: 'createBorders',
    value: function createBorders(settings) {
      this.main = document.createElement('div');

      var borderDivs = ['top', 'left', 'bottom', 'right', 'corner'];
      var style = this.main.style;
      style.position = 'absolute';
      style.top = 0;
      style.left = 0;

      for (var i = 0; i < 5; i++) {
        var position = borderDivs[i];
        var div = document.createElement('div');
        div.className = 'wtBorder ' + (this.settings.className || ''); // + borderDivs[i];

        if (this.settings[position] && this.settings[position].hide) {
          div.className += ' hidden';
        }
        style = div.style;
        style.backgroundColor = this.settings[position] && this.settings[position].color ? this.settings[position].color : settings.border.color;
        style.height = this.settings[position] && this.settings[position].width ? this.settings[position].width + 'px' : settings.border.width + 'px';
        style.width = this.settings[position] && this.settings[position].width ? this.settings[position].width + 'px' : settings.border.width + 'px';

        this.main.appendChild(div);
      }
      this.top = this.main.childNodes[0];
      this.left = this.main.childNodes[1];
      this.bottom = this.main.childNodes[2];
      this.right = this.main.childNodes[3];

      this.topStyle = this.top.style;
      this.leftStyle = this.left.style;
      this.bottomStyle = this.bottom.style;
      this.rightStyle = this.right.style;

      this.corner = this.main.childNodes[4];
      this.corner.className += ' corner';
      this.cornerStyle = this.corner.style;
      this.cornerStyle.width = this.cornerDefaultStyle.width;
      this.cornerStyle.height = this.cornerDefaultStyle.height;
      this.cornerStyle.border = [this.cornerDefaultStyle.borderWidth, this.cornerDefaultStyle.borderStyle, this.cornerDefaultStyle.borderColor].join(' ');

      if (Handsontable.mobileBrowser) {
        this.createMultipleSelectorHandles();
      }
      this.disappear();

      if (!this.wot.wtTable.bordersHolder) {
        this.wot.wtTable.bordersHolder = document.createElement('div');
        this.wot.wtTable.bordersHolder.className = 'htBorders';
        this.wot.wtTable.spreader.appendChild(this.wot.wtTable.bordersHolder);
      }
      this.wot.wtTable.bordersHolder.insertBefore(this.main, this.wot.wtTable.bordersHolder.firstChild);
    }

    /**
     * Create multiple selector handler for mobile devices
     */
  }, {
    key: 'createMultipleSelectorHandles',
    value: function createMultipleSelectorHandles() {
      this.selectionHandles = {
        topLeft: document.createElement('DIV'),
        topLeftHitArea: document.createElement('DIV'),
        bottomRight: document.createElement('DIV'),
        bottomRightHitArea: document.createElement('DIV')
      };
      var width = 10;
      var hitAreaWidth = 40;

      this.selectionHandles.topLeft.className = 'topLeftSelectionHandle';
      this.selectionHandles.topLeftHitArea.className = 'topLeftSelectionHandle-HitArea';
      this.selectionHandles.bottomRight.className = 'bottomRightSelectionHandle';
      this.selectionHandles.bottomRightHitArea.className = 'bottomRightSelectionHandle-HitArea';

      this.selectionHandles.styles = {
        topLeft: this.selectionHandles.topLeft.style,
        topLeftHitArea: this.selectionHandles.topLeftHitArea.style,
        bottomRight: this.selectionHandles.bottomRight.style,
        bottomRightHitArea: this.selectionHandles.bottomRightHitArea.style
      };

      var hitAreaStyle = {
        'position': 'absolute',
        'height': hitAreaWidth + 'px',
        'width': hitAreaWidth + 'px',
        'border-radius': parseInt(hitAreaWidth / 1.5, 10) + 'px'
      };

      for (var prop in hitAreaStyle) {
        if (hitAreaStyle.hasOwnProperty(prop)) {
          this.selectionHandles.styles.bottomRightHitArea[prop] = hitAreaStyle[prop];
          this.selectionHandles.styles.topLeftHitArea[prop] = hitAreaStyle[prop];
        }
      }

      var handleStyle = {
        'position': 'absolute',
        'height': width + 'px',
        'width': width + 'px',
        'border-radius': parseInt(width / 1.5, 10) + 'px',
        'background': '#F5F5FF',
        'border': '1px solid #4285c8'
      };

      for (var prop in handleStyle) {
        if (handleStyle.hasOwnProperty(prop)) {
          this.selectionHandles.styles.bottomRight[prop] = handleStyle[prop];
          this.selectionHandles.styles.topLeft[prop] = handleStyle[prop];
        }
      }
      this.main.appendChild(this.selectionHandles.topLeft);
      this.main.appendChild(this.selectionHandles.bottomRight);
      this.main.appendChild(this.selectionHandles.topLeftHitArea);
      this.main.appendChild(this.selectionHandles.bottomRightHitArea);
    }
  }, {
    key: 'isPartRange',
    value: function isPartRange(row, col) {
      if (this.wot.selections.area.cellRange) {
        if (row != this.wot.selections.area.cellRange.to.row || col != this.wot.selections.area.cellRange.to.col) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: 'updateMultipleSelectionHandlesPosition',
    value: function updateMultipleSelectionHandlesPosition(row, col, top, left, width, height) {
      var handleWidth = parseInt(this.selectionHandles.styles.topLeft.width, 10);
      var hitAreaWidth = parseInt(this.selectionHandles.styles.topLeftHitArea.width, 10);

      this.selectionHandles.styles.topLeft.top = parseInt(top - handleWidth, 10) + "px";
      this.selectionHandles.styles.topLeft.left = parseInt(left - handleWidth, 10) + "px";

      this.selectionHandles.styles.topLeftHitArea.top = parseInt(top - hitAreaWidth / 4 * 3, 10) + "px";
      this.selectionHandles.styles.topLeftHitArea.left = parseInt(left - hitAreaWidth / 4 * 3, 10) + "px";

      this.selectionHandles.styles.bottomRight.top = parseInt(top + height, 10) + "px";
      this.selectionHandles.styles.bottomRight.left = parseInt(left + width, 10) + "px";

      this.selectionHandles.styles.bottomRightHitArea.top = parseInt(top + height - hitAreaWidth / 4, 10) + "px";
      this.selectionHandles.styles.bottomRightHitArea.left = parseInt(left + width - hitAreaWidth / 4, 10) + "px";

      if (this.settings.border.multipleSelectionHandlesVisible && this.settings.border.multipleSelectionHandlesVisible()) {
        this.selectionHandles.styles.topLeft.display = "block";
        this.selectionHandles.styles.topLeftHitArea.display = "block";

        if (!this.isPartRange(row, col)) {
          this.selectionHandles.styles.bottomRight.display = "block";
          this.selectionHandles.styles.bottomRightHitArea.display = "block";
        } else {
          this.selectionHandles.styles.bottomRight.display = "none";
          this.selectionHandles.styles.bottomRightHitArea.display = "none";
        }
      } else {
        this.selectionHandles.styles.topLeft.display = "none";
        this.selectionHandles.styles.bottomRight.display = "none";
        this.selectionHandles.styles.topLeftHitArea.display = "none";
        this.selectionHandles.styles.bottomRightHitArea.display = "none";
      }

      if (row == this.wot.wtSettings.getSetting('fixedRowsTop') || col == this.wot.wtSettings.getSetting('fixedColumnsLeft')) {
        this.selectionHandles.styles.topLeft.zIndex = "9999";
        this.selectionHandles.styles.topLeftHitArea.zIndex = "9999";
      } else {
        this.selectionHandles.styles.topLeft.zIndex = "";
        this.selectionHandles.styles.topLeftHitArea.zIndex = "";
      }
    }

    /**
     * Show border around one or many cells
     *
     * @param {Array} corners
     */
  }, {
    key: 'appear',
    value: function appear(corners) {
      if (this.disabled) {
        return;
      }
      var isMultiple, fromTD, toTD, fromOffset, toOffset, containerOffset, top, minTop, left, minLeft, height, width, fromRow, fromColumn, toRow, toColumn, ilen;

      if (this.wot.cloneOverlay instanceof WalkontableTopOverlay || this.wot.cloneOverlay instanceof WalkontableCornerOverlay) {
        ilen = this.wot.getSetting('fixedRowsTop');
      } else {
        ilen = this.wot.wtTable.getRenderedRowsCount();
      }

      for (var i = 0; i < ilen; i++) {
        var s = this.wot.wtTable.rowFilter.renderedToSource(i);

        if (s >= corners[0] && s <= corners[2]) {
          fromRow = s;
          break;
        }
      }

      for (var i = ilen - 1; i >= 0; i--) {
        var s = this.wot.wtTable.rowFilter.renderedToSource(i);

        if (s >= corners[0] && s <= corners[2]) {
          toRow = s;
          break;
        }
      }

      ilen = this.wot.wtTable.getRenderedColumnsCount();

      for (var i = 0; i < ilen; i++) {
        var s = this.wot.wtTable.columnFilter.renderedToSource(i);

        if (s >= corners[1] && s <= corners[3]) {
          fromColumn = s;
          break;
        }
      }

      for (var i = ilen - 1; i >= 0; i--) {
        var s = this.wot.wtTable.columnFilter.renderedToSource(i);

        if (s >= corners[1] && s <= corners[3]) {
          toColumn = s;
          break;
        }
      }
      if (fromRow === void 0 || fromColumn === void 0) {
        this.disappear();

        return;
      }
      isMultiple = fromRow !== toRow || fromColumn !== toColumn;
      fromTD = this.wot.wtTable.getCell(new _cellCoords.WalkontableCellCoords(fromRow, fromColumn));
      toTD = isMultiple ? this.wot.wtTable.getCell(new _cellCoords.WalkontableCellCoords(toRow, toColumn)) : fromTD;
      fromOffset = (0, _helpersDomElement.offset)(fromTD);
      toOffset = isMultiple ? (0, _helpersDomElement.offset)(toTD) : fromOffset;
      containerOffset = (0, _helpersDomElement.offset)(this.wot.wtTable.TABLE);

      minTop = fromOffset.top;
      height = toOffset.top + (0, _helpersDomElement.outerHeight)(toTD) - minTop;
      minLeft = fromOffset.left;
      width = toOffset.left + (0, _helpersDomElement.outerWidth)(toTD) - minLeft;

      top = minTop - containerOffset.top - 1;
      left = minLeft - containerOffset.left - 1;
      var style = (0, _helpersDomElement.getComputedStyle)(fromTD);

      if (parseInt(style.borderTopWidth, 10) > 0) {
        top += 1;
        height = height > 0 ? height - 1 : 0;
      }
      if (parseInt(style.borderLeftWidth, 10) > 0) {
        left += 1;
        width = width > 0 ? width - 1 : 0;
      }

      this.topStyle.top = top + 'px';
      this.topStyle.left = left + 'px';
      this.topStyle.width = width + 'px';
      this.topStyle.display = 'block';

      this.leftStyle.top = top + 'px';
      this.leftStyle.left = left + 'px';
      this.leftStyle.height = height + 'px';
      this.leftStyle.display = 'block';

      var delta = Math.floor(this.settings.border.width / 2);

      this.bottomStyle.top = top + height - delta + 'px';
      this.bottomStyle.left = left + 'px';
      this.bottomStyle.width = width + 'px';
      this.bottomStyle.display = 'block';

      this.rightStyle.top = top + 'px';
      this.rightStyle.left = left + width - delta + 'px';
      this.rightStyle.height = height + 1 + 'px';
      this.rightStyle.display = 'block';

      if (Handsontable.mobileBrowser || (!this.hasSetting(this.settings.border.cornerVisible) || this.isPartRange(toRow, toColumn))) {
        this.cornerStyle.display = 'none';
      } else {
        this.cornerStyle.top = top + height - 4 + 'px';
        this.cornerStyle.left = left + width - 4 + 'px';
        this.cornerStyle.borderRightWidth = this.cornerDefaultStyle.borderWidth;
        this.cornerStyle.width = this.cornerDefaultStyle.width;
        this.cornerStyle.display = 'block';

        if (toColumn === this.wot.getSetting('totalColumns') - 1) {
          var trimmingContainer = (0, _helpersDomElement.getTrimmingContainer)(this.wot.wtTable.TABLE);
          var cornerOverlappingContainer = toTD.offsetLeft + (0, _helpersDomElement.outerWidth)(toTD) >= (0, _helpersDomElement.innerWidth)(trimmingContainer);

          if (cornerOverlappingContainer) {
            this.cornerStyle.left = Math.floor(left + width - 3 - parseInt(this.cornerDefaultStyle.width) / 2) + "px";
            this.cornerStyle.borderRightWidth = 0;
          }
        }
      }

      if (Handsontable.mobileBrowser) {
        this.updateMultipleSelectionHandlesPosition(fromRow, fromColumn, top, left, width, height);
      }
    }

    /**
     * Hide border
     */
  }, {
    key: 'disappear',
    value: function disappear() {
      this.topStyle.display = 'none';
      this.leftStyle.display = 'none';
      this.bottomStyle.display = 'none';
      this.rightStyle.display = 'none';
      this.cornerStyle.display = 'none';

      if (Handsontable.mobileBrowser) {
        this.selectionHandles.styles.topLeft.display = 'none';
        this.selectionHandles.styles.bottomRight.display = 'none';
      }
    }

    /**
     * @param {Function} setting
     * @returns {*}
     */
  }, {
    key: 'hasSetting',
    value: function hasSetting(setting) {
      if (typeof setting === 'function') {
        return setting();
      }

      return !!setting;
    }
  }]);

  return WalkontableBorder;
})();

exports.WalkontableBorder = WalkontableBorder;

window.WalkontableBorder = WalkontableBorder;

},{"./../../../eventManager":46,"./../../../helpers/dom/element":50,"./../../../helpers/dom/event":51,"./cell/coords":11}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var privatePool = new WeakMap();

/**
 * Calculates indexes of columns to render OR columns that are visible.
 * To redo the calculation, you need to create a new calculator.
 *
 * @class WalkontableViewportColumnsCalculator
 */

var WalkontableViewportColumnsCalculator = (function () {
  _createClass(WalkontableViewportColumnsCalculator, null, [{
    key: 'DEFAULT_WIDTH',

    /**
     * Default column width
     *
     * @type {Number}
     */
    get: function get() {
      return 50;
    }

    /**
     * @param {Number} viewportWidth Width of the viewport
     * @param {Number} scrollOffset Current horizontal scroll position of the viewport
     * @param {Number} totalColumns Total number of rows
     * @param {Function} columnWidthFn Function that returns the width of the column at a given index (in px)
     * @param {Function} overrideFn Function that changes calculated this.startRow, this.endRow (used by MergeCells plugin)
     * @param {Boolean} onlyFullyVisible if `true`, only startRow and endRow will be indexes of rows that are fully in viewport
     * @param {Boolean} stretchH
     */
  }]);

  function WalkontableViewportColumnsCalculator(viewportWidth, scrollOffset, totalColumns, columnWidthFn, overrideFn, onlyFullyVisible, stretchH) {
    _classCallCheck(this, WalkontableViewportColumnsCalculator);

    privatePool.set(this, {
      viewportWidth: viewportWidth,
      scrollOffset: scrollOffset,
      totalColumns: totalColumns,
      columnWidthFn: columnWidthFn,
      overrideFn: overrideFn,
      onlyFullyVisible: onlyFullyVisible
    });

    /**
     * Number of rendered/visible columns
     *
     * @type {Number}
     */
    this.count = 0;

    /**
     * Index of the first rendered/visible column (can be overwritten using overrideFn)
     *
     * @type {Number|null}
     */
    this.startColumn = null;

    /**
     * Index of the last rendered/visible column (can be overwritten using overrideFn)
     *
     * @type {null}
     */
    this.endColumn = null;

    /**
     * Position of the first rendered/visible column (in px)
     *
     * @type {Number|null}
     */
    this.startPosition = null;

    this.stretchAllRatio = 0;
    this.stretchLastWidth = 0;
    this.stretch = stretchH;
    this.totalTargetWidth = 0;
    this.needVerifyLastColumnWidth = true;
    this.stretchAllColumnsWidth = [];

    this.calculate();
  }

  /**
   * Calculates viewport
   */

  _createClass(WalkontableViewportColumnsCalculator, [{
    key: 'calculate',
    value: function calculate() {
      var sum = 0;
      var needReverse = true;
      var startPositions = [];
      var columnWidth = undefined;

      var priv = privatePool.get(this);
      var onlyFullyVisible = priv.onlyFullyVisible;
      var overrideFn = priv.overrideFn;
      var scrollOffset = priv.scrollOffset;
      var totalColumns = priv.totalColumns;
      var viewportWidth = priv.viewportWidth;

      for (var i = 0; i < totalColumns; i++) {
        columnWidth = this._getColumnWidth(i);

        if (sum <= scrollOffset && !onlyFullyVisible) {
          this.startColumn = i;
        }

        if (sum >= scrollOffset && sum + columnWidth <= scrollOffset + viewportWidth) {
          if (this.startColumn == null) {
            this.startColumn = i;
          }
          this.endColumn = i;
        }
        startPositions.push(sum);
        sum += columnWidth;

        if (!onlyFullyVisible) {
          this.endColumn = i;
        }
        if (sum >= scrollOffset + viewportWidth) {
          needReverse = false;
          break;
        }
      }

      if (this.endColumn === totalColumns - 1 && needReverse) {
        this.startColumn = this.endColumn;

        while (this.startColumn > 0) {
          var viewportSum = startPositions[this.endColumn] + columnWidth - startPositions[this.startColumn - 1];

          if (viewportSum <= viewportWidth || !onlyFullyVisible) {
            this.startColumn--;
          }
          if (viewportSum > viewportWidth) {
            break;
          }
        }
      }

      if (this.startColumn !== null && overrideFn) {
        overrideFn(this);
      }
      this.startPosition = startPositions[this.startColumn];

      if (this.startPosition == void 0) {
        this.startPosition = null;
      }
      if (this.startColumn !== null) {
        this.count = this.endColumn - this.startColumn + 1;
      }
    }

    /**
     * Recalculate columns stretching.
     *
     * @param {Number} totalWidth
     */
  }, {
    key: 'refreshStretching',
    value: function refreshStretching(totalWidth) {
      if (this.stretch === 'none') {
        return;
      }
      var sumAll = 0;
      var columnWidth = undefined;
      var remainingSize = undefined;

      var priv = privatePool.get(this);
      var totalColumns = priv.totalColumns;

      for (var i = 0; i < totalColumns; i++) {
        columnWidth = this._getColumnWidth(i);
        sumAll += columnWidth;
      }
      this.totalTargetWidth = totalWidth;
      remainingSize = sumAll - totalWidth;

      if (this.stretch === 'all' && remainingSize < 0) {
        this.stretchAllRatio = totalWidth / sumAll;
        this.stretchAllColumnsWidth = [];
        this.needVerifyLastColumnWidth = true;
      } else if (this.stretch === 'last' && totalWidth !== Infinity) {
        this.stretchLastWidth = -remainingSize + this._getColumnWidth(totalColumns - 1);
      }
    }

    /**
     * Get stretched column width based on stretchH (all or last) setting passed in handsontable instance.
     *
     * @param {Number} column
     * @param {Number} baseWidth
     * @returns {Number|null}
     */
  }, {
    key: 'getStretchedColumnWidth',
    value: function getStretchedColumnWidth(column, baseWidth) {
      var result = null;

      if (this.stretch === 'all' && this.stretchAllRatio !== 0) {
        result = this._getStretchedAllColumnWidth(column, baseWidth);
      } else if (this.stretch === 'last' && this.stretchLastWidth !== 0) {
        result = this._getStretchedLastColumnWidth(column);
      }

      return result;
    }

    /**
     * @param {Number} column
     * @param {Number} baseWidth
     * @returns {Number}
     * @private
     */
  }, {
    key: '_getStretchedAllColumnWidth',
    value: function _getStretchedAllColumnWidth(column, baseWidth) {
      var sumRatioWidth = 0;
      var priv = privatePool.get(this);
      var totalColumns = priv.totalColumns;

      if (!this.stretchAllColumnsWidth[column]) {
        this.stretchAllColumnsWidth[column] = Math.round(baseWidth * this.stretchAllRatio);
      }

      if (this.stretchAllColumnsWidth.length === totalColumns && this.needVerifyLastColumnWidth) {
        this.needVerifyLastColumnWidth = false;

        for (var i = 0; i < this.stretchAllColumnsWidth.length; i++) {
          sumRatioWidth += this.stretchAllColumnsWidth[i];
        }
        if (sumRatioWidth !== this.totalTargetWidth) {
          this.stretchAllColumnsWidth[this.stretchAllColumnsWidth.length - 1] += this.totalTargetWidth - sumRatioWidth;
        }
      }

      return this.stretchAllColumnsWidth[column];
    }

    /**
     * @param {Number} column
     * @returns {Number|null}
     * @private
     */
  }, {
    key: '_getStretchedLastColumnWidth',
    value: function _getStretchedLastColumnWidth(column) {
      var priv = privatePool.get(this);
      var totalColumns = priv.totalColumns;

      if (column === totalColumns - 1) {
        return this.stretchLastWidth;
      }

      return null;
    }

    /**
     * @param {Number} column
     * @returns {Number}
     * @private
     */
  }, {
    key: '_getColumnWidth',
    value: function _getColumnWidth(column) {
      var width = privatePool.get(this).columnWidthFn(column);

      if (width === undefined) {
        width = WalkontableViewportColumnsCalculator.DEFAULT_WIDTH;
      }

      return width;
    }
  }]);

  return WalkontableViewportColumnsCalculator;
})();

exports.WalkontableViewportColumnsCalculator = WalkontableViewportColumnsCalculator;

window.WalkontableViewportColumnsCalculator = WalkontableViewportColumnsCalculator;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var privatePool = new WeakMap();

/**
 * Calculates indexes of rows to render OR rows that are visible.
 * To redo the calculation, you need to create a new calculator.
 *
 * @class WalkontableViewportRowsCalculator
 */

var WalkontableViewportRowsCalculator = (function () {
  _createClass(WalkontableViewportRowsCalculator, null, [{
    key: "DEFAULT_HEIGHT",

    /**
     * Default row height
     *
     * @type {Number}
     */
    get: function get() {
      return 23;
    }

    /**
     * @param {Number} viewportHeight Height of the viewport
     * @param {Number} scrollOffset Current vertical scroll position of the viewport
     * @param {Number} totalRows Total number of rows
     * @param {Function} rowHeightFn Function that returns the height of the row at a given index (in px)
     * @param {Function} overrideFn Function that changes calculated this.startRow, this.endRow (used by MergeCells plugin)
     * @param {Boolean} onlyFullyVisible if `true`, only startRow and endRow will be indexes of rows that are fully in viewport
     */
  }]);

  function WalkontableViewportRowsCalculator(viewportHeight, scrollOffset, totalRows, rowHeightFn, overrideFn, onlyFullyVisible, horizontalScrollbarHeight) {
    _classCallCheck(this, WalkontableViewportRowsCalculator);

    privatePool.set(this, {
      viewportHeight: viewportHeight,
      scrollOffset: scrollOffset,
      totalRows: totalRows,
      rowHeightFn: rowHeightFn,
      overrideFn: overrideFn,
      onlyFullyVisible: onlyFullyVisible,
      horizontalScrollbarHeight: horizontalScrollbarHeight
    });

    /**
     * Number of rendered/visible rows
     *
     * @type {Number}
     */
    this.count = 0;

    /**
     * Index of the first rendered/visible row (can be overwritten using overrideFn)
     *
     * @type {Number|null}
     */
    this.startRow = null;

    /**
     * Index of the last rendered/visible row (can be overwritten using overrideFn)
     *
     * @type {null}
     */
    this.endRow = null;

    /**
     * Position of the first rendered/visible row (in px)
     *
     * @type {Number|null}
     */
    this.startPosition = null;

    this.calculate();
  }

  /**
   * Calculates viewport
   */

  _createClass(WalkontableViewportRowsCalculator, [{
    key: "calculate",
    value: function calculate() {
      var sum = 0;
      var needReverse = true;
      var startPositions = [];

      var priv = privatePool.get(this);
      var onlyFullyVisible = priv.onlyFullyVisible;
      var overrideFn = priv.overrideFn;
      var rowHeightFn = priv.rowHeightFn;
      var scrollOffset = priv.scrollOffset;
      var totalRows = priv.totalRows;
      var viewportHeight = priv.viewportHeight;
      var horizontalScrollbarHeight = priv.horizontalScrollbarHeight || 0;

      // Calculate the number (start and end index) of rows needed
      for (var i = 0; i < totalRows; i++) {
        var _rowHeight = rowHeightFn(i);

        if (_rowHeight === undefined) {
          _rowHeight = WalkontableViewportRowsCalculator.DEFAULT_HEIGHT;
        }
        if (sum <= scrollOffset && !onlyFullyVisible) {
          this.startRow = i;
        }

        // the row is within the "visible range"
        if (sum >= scrollOffset && sum + _rowHeight <= scrollOffset + viewportHeight - horizontalScrollbarHeight) {
          if (this.startRow === null) {
            this.startRow = i;
          }
          this.endRow = i;
        }
        startPositions.push(sum);
        sum += _rowHeight;

        if (!onlyFullyVisible) {
          this.endRow = i;
        }
        if (sum >= scrollOffset + viewportHeight - horizontalScrollbarHeight) {
          needReverse = false;
          break;
        }
      }

      //If the estimation has reached the last row and there is still some space available in the viewport,
      //we need to render in reverse in order to fill the whole viewport with rows
      if (this.endRow === totalRows - 1 && needReverse) {
        this.startRow = this.endRow;

        while (this.startRow > 0) {
          // rowHeight is the height of the last row
          var viewportSum = startPositions[this.endRow] + rowHeight - startPositions[this.startRow - 1];

          if (viewportSum <= viewportHeight - horizontalScrollbarHeight || !onlyFullyVisible) {
            this.startRow--;
          }
          if (viewportSum >= viewportHeight - horizontalScrollbarHeight) {
            break;
          }
        }
      }

      if (this.startRow !== null && overrideFn) {
        overrideFn(this);
      }
      this.startPosition = startPositions[this.startRow];

      if (this.startPosition == void 0) {
        this.startPosition = null;
      }
      if (this.startRow !== null) {
        this.count = this.endRow - this.startRow + 1;
      }
    }
  }]);

  return WalkontableViewportRowsCalculator;
})();

exports.WalkontableViewportRowsCalculator = WalkontableViewportRowsCalculator;

window.WalkontableViewportRowsCalculator = WalkontableViewportRowsCalculator;

},{}],11:[function(require,module,exports){

/**
 * WalkontableCellCoords holds cell coordinates (row, column) and few method to validate them and
 * retrieve as an array or an object
 *
 * @class WalkontableCellCoords
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var WalkontableCellCoords = (function () {
  /**
   * @param {Number} row Row index
   * @param {Number} col Column index
   */

  function WalkontableCellCoords(row, col) {
    _classCallCheck(this, WalkontableCellCoords);

    if (typeof row !== 'undefined' && typeof col !== 'undefined') {
      this.row = row;
      this.col = col;
    } else {
      this.row = null;
      this.col = null;
    }
  }

  /**
   * Checks if given set of coordinates is valid in context of a given Walkontable instance
   *
   * @param {Walkontable} wotInstance
   * @returns {Boolean}
   */

  _createClass(WalkontableCellCoords, [{
    key: 'isValid',
    value: function isValid(wotInstance) {
      // is it a valid cell index (0 or higher)
      if (this.row < 0 || this.col < 0) {
        return false;
      }
      // is selection within total rows and columns
      if (this.row >= wotInstance.getSetting('totalRows') || this.col >= wotInstance.getSetting('totalColumns')) {
        return false;
      }

      return true;
    }

    /**
     * Checks if this cell coords are the same as cell coords given as a parameter
     *
     * @param {WalkontableCellCoords} cellCoords
     * @returns {Boolean}
     */
  }, {
    key: 'isEqual',
    value: function isEqual(cellCoords) {
      if (cellCoords === this) {
        return true;
      }

      return this.row === cellCoords.row && this.col === cellCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in south-east from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */
  }, {
    key: 'isSouthEastOf',
    value: function isSouthEastOf(testedCoords) {
      return this.row >= testedCoords.row && this.col >= testedCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in north-east from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */
  }, {
    key: 'isNorthWestOf',
    value: function isNorthWestOf(testedCoords) {
      return this.row <= testedCoords.row && this.col <= testedCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in south-west from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */
  }, {
    key: 'isSouthWestOf',
    value: function isSouthWestOf(testedCoords) {
      return this.row >= testedCoords.row && this.col <= testedCoords.col;
    }

    /**
     * Checks if tested coordinates are positioned in north-east from this cell coords
     *
     * @param {Object} testedCoords
     * @returns {Boolean}
     */
  }, {
    key: 'isNorthEastOf',
    value: function isNorthEastOf(testedCoords) {
      return this.row <= testedCoords.row && this.col >= testedCoords.col;
    }
  }]);

  return WalkontableCellCoords;
})();

exports.WalkontableCellCoords = WalkontableCellCoords;

window.WalkontableCellCoords = WalkontableCellCoords;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _cellCoords = require('./../cell/coords');

/**
 * A cell range is a set of exactly two WalkontableCellCoords (that can be the same or different)
 *
 * @class WalkontableCellRange
 */

var WalkontableCellRange = (function () {
  /**
   * @param {WalkontableCellCoords} highlight Used to draw bold border around a cell where selection was
   *                                          started and to edit the cell when you press Enter
   * @param {WalkontableCellCoords} from Usually the same as highlight, but in Excel there is distinction - one can change
   *                                     highlight within a selection
   * @param {WalkontableCellCoords} to End selection
   */

  function WalkontableCellRange(highlight, from, to) {
    _classCallCheck(this, WalkontableCellRange);

    this.highlight = highlight;
    this.from = from;
    this.to = to;
  }

  /**
   * Checks if given coords are valid in context of a given Walkontable instance
   *
   * @param {Walkontable} wotInstance
   * @returns {Boolean}
   */

  _createClass(WalkontableCellRange, [{
    key: 'isValid',
    value: function isValid(wotInstance) {
      return this.from.isValid(wotInstance) && this.to.isValid(wotInstance);
    }

    /**
     * Checks if this cell range is restricted to one cell
     *
     * @returns {Boolean}
     */
  }, {
    key: 'isSingle',
    value: function isSingle() {
      return this.from.row === this.to.row && this.from.col === this.to.col;
    }

    /**
     * Returns selected range height (in number of rows)
     *
     * @returns {Number}
     */
  }, {
    key: 'getHeight',
    value: function getHeight() {
      return Math.max(this.from.row, this.to.row) - Math.min(this.from.row, this.to.row) + 1;
    }

    /**
     * Returns selected range width (in number of columns)
     *
     * @returns {Number}
     */
  }, {
    key: 'getWidth',
    value: function getWidth() {
      return Math.max(this.from.col, this.to.col) - Math.min(this.from.col, this.to.col) + 1;
    }

    /**
     * Checks if given cell coords is within `from` and `to` cell coords of this range
     *
     * @param {WalkontableCellCoords} cellCoords
     * @returns {Boolean}
     */
  }, {
    key: 'includes',
    value: function includes(cellCoords) {
      var topLeft = this.getTopLeftCorner();
      var bottomRight = this.getBottomRightCorner();

      if (cellCoords.row < 0) {
        cellCoords.row = 0;
      }
      if (cellCoords.col < 0) {
        cellCoords.col = 0;
      }

      return topLeft.row <= cellCoords.row && bottomRight.row >= cellCoords.row && topLeft.col <= cellCoords.col && bottomRight.col >= cellCoords.col;
    }

    /**
     * Checks if given range is within of this range
     *
     * @param {WalkontableCellRange} testedRange
     * @returns {Boolean}
     */
  }, {
    key: 'includesRange',
    value: function includesRange(testedRange) {
      return this.includes(testedRange.getTopLeftCorner()) && this.includes(testedRange.getBottomRightCorner());
    }

    /**
     * Checks if given range is equal to this range
     *
     * @param {WalkontableCellRange} testedRange
     * @returns {Boolean}
     */
  }, {
    key: 'isEqual',
    value: function isEqual(testedRange) {
      return Math.min(this.from.row, this.to.row) == Math.min(testedRange.from.row, testedRange.to.row) && Math.max(this.from.row, this.to.row) == Math.max(testedRange.from.row, testedRange.to.row) && Math.min(this.from.col, this.to.col) == Math.min(testedRange.from.col, testedRange.to.col) && Math.max(this.from.col, this.to.col) == Math.max(testedRange.from.col, testedRange.to.col);
    }

    /**
     * Checks if tested range overlaps with the range.
     * Range A is considered to to be overlapping with range B if intersection of A and B or B and A is not empty.
     *
     * @param {WalkontableCellRange} testedRange
     * @returns {Boolean}
     */
  }, {
    key: 'overlaps',
    value: function overlaps(testedRange) {
      return testedRange.isSouthEastOf(this.getTopLeftCorner()) && testedRange.isNorthWestOf(this.getBottomRightCorner());
    }

    /**
     * @param {WalkontableCellRange} testedCoords
     * @returns {Boolean}
     */
  }, {
    key: 'isSouthEastOf',
    value: function isSouthEastOf(testedCoords) {
      return this.getTopLeftCorner().isSouthEastOf(testedCoords) || this.getBottomRightCorner().isSouthEastOf(testedCoords);
    }

    /**
     * @param {WalkontableCellRange} testedCoords
     * @returns {Boolean}
     */
  }, {
    key: 'isNorthWestOf',
    value: function isNorthWestOf(testedCoords) {
      return this.getTopLeftCorner().isNorthWestOf(testedCoords) || this.getBottomRightCorner().isNorthWestOf(testedCoords);
    }

    /**
     * Adds a cell to a range (only if exceeds corners of the range). Returns information if range was expanded
     *
     * @param {WalkontableCellCoords} cellCoords
     * @returns {Boolean}
     */
  }, {
    key: 'expand',
    value: function expand(cellCoords) {
      var topLeft = this.getTopLeftCorner();
      var bottomRight = this.getBottomRightCorner();

      if (cellCoords.row < topLeft.row || cellCoords.col < topLeft.col || cellCoords.row > bottomRight.row || cellCoords.col > bottomRight.col) {
        this.from = new _cellCoords.WalkontableCellCoords(Math.min(topLeft.row, cellCoords.row), Math.min(topLeft.col, cellCoords.col));
        this.to = new _cellCoords.WalkontableCellCoords(Math.max(bottomRight.row, cellCoords.row), Math.max(bottomRight.col, cellCoords.col));

        return true;
      }

      return false;
    }

    /**
     * @param {WalkontableCellRange} expandingRange
     * @returns {Boolean}
     */
  }, {
    key: 'expandByRange',
    value: function expandByRange(expandingRange) {
      if (this.includesRange(expandingRange) || !this.overlaps(expandingRange)) {
        return false;
      }

      var topLeft = this.getTopLeftCorner();
      var bottomRight = this.getBottomRightCorner();
      var topRight = this.getTopRightCorner();
      var bottomLeft = this.getBottomLeftCorner();

      var expandingTopLeft = expandingRange.getTopLeftCorner();
      var expandingBottomRight = expandingRange.getBottomRightCorner();

      var resultTopRow = Math.min(topLeft.row, expandingTopLeft.row);
      var resultTopCol = Math.min(topLeft.col, expandingTopLeft.col);
      var resultBottomRow = Math.max(bottomRight.row, expandingBottomRight.row);
      var resultBottomCol = Math.max(bottomRight.col, expandingBottomRight.col);

      var finalFrom = new _cellCoords.WalkontableCellCoords(resultTopRow, resultTopCol),
          finalTo = new _cellCoords.WalkontableCellCoords(resultBottomRow, resultBottomCol);
      var isCorner = new WalkontableCellRange(finalFrom, finalFrom, finalTo).isCorner(this.from, expandingRange),
          onlyMerge = expandingRange.isEqual(new WalkontableCellRange(finalFrom, finalFrom, finalTo));

      if (isCorner && !onlyMerge) {
        if (this.from.col > finalFrom.col) {
          finalFrom.col = resultBottomCol;
          finalTo.col = resultTopCol;
        }
        if (this.from.row > finalFrom.row) {
          finalFrom.row = resultBottomRow;
          finalTo.row = resultTopRow;
        }
      }
      this.from = finalFrom;
      this.to = finalTo;

      return true;
    }

    /**
     * @returns {String}
     */
  }, {
    key: 'getDirection',
    value: function getDirection() {
      if (this.from.isNorthWestOf(this.to)) {
        // NorthWest - SouthEast
        return 'NW-SE';
      } else if (this.from.isNorthEastOf(this.to)) {
        // NorthEast - SouthWest
        return 'NE-SW';
      } else if (this.from.isSouthEastOf(this.to)) {
        // SouthEast - NorthWest
        return 'SE-NW';
      } else if (this.from.isSouthWestOf(this.to)) {
        // SouthWest - NorthEast
        return 'SW-NE';
      }
    }

    /**
     * @param {String} direction
     */
  }, {
    key: 'setDirection',
    value: function setDirection(direction) {
      switch (direction) {
        case 'NW-SE':
          this.from = this.getTopLeftCorner();
          this.to = this.getBottomRightCorner();
          break;
        case 'NE-SW':
          this.from = this.getTopRightCorner();
          this.to = this.getBottomLeftCorner();
          break;
        case 'SE-NW':
          this.from = this.getBottomRightCorner();
          this.to = this.getTopLeftCorner();
          break;
        case 'SW-NE':
          this.from = this.getBottomLeftCorner();
          this.to = this.getTopRightCorner();
          break;
      }
    }

    /**
     * Get top left corner of this range
     *
     * @returns {WalkontableCellCoords}
     */
  }, {
    key: 'getTopLeftCorner',
    value: function getTopLeftCorner() {
      return new _cellCoords.WalkontableCellCoords(Math.min(this.from.row, this.to.row), Math.min(this.from.col, this.to.col));
    }

    /**
     * Get bottom right corner of this range
     *
     * @returns {WalkontableCellCoords}
     */
  }, {
    key: 'getBottomRightCorner',
    value: function getBottomRightCorner() {
      return new _cellCoords.WalkontableCellCoords(Math.max(this.from.row, this.to.row), Math.max(this.from.col, this.to.col));
    }

    /**
     * Get top right corner of this range
     *
     * @returns {WalkontableCellCoords}
     */
  }, {
    key: 'getTopRightCorner',
    value: function getTopRightCorner() {
      return new _cellCoords.WalkontableCellCoords(Math.min(this.from.row, this.to.row), Math.max(this.from.col, this.to.col));
    }

    /**
     * Get bottom left corner of this range
     *
     * @returns {WalkontableCellCoords}
     */
  }, {
    key: 'getBottomLeftCorner',
    value: function getBottomLeftCorner() {
      return new _cellCoords.WalkontableCellCoords(Math.max(this.from.row, this.to.row), Math.min(this.from.col, this.to.col));
    }

    /**
     * @param {WalkontableCellCoords} coords
     * @param {WalkontableCellRange} expandedRange
     * @returns {*}
     */
  }, {
    key: 'isCorner',
    value: function isCorner(coords, expandedRange) {
      if (expandedRange) {
        if (expandedRange.includes(coords)) {
          if (this.getTopLeftCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.from.row, expandedRange.from.col)) || this.getTopRightCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.from.row, expandedRange.to.col)) || this.getBottomLeftCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.to.row, expandedRange.from.col)) || this.getBottomRightCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.to.row, expandedRange.to.col))) {
            return true;
          }
        }
      }

      return coords.isEqual(this.getTopLeftCorner()) || coords.isEqual(this.getTopRightCorner()) || coords.isEqual(this.getBottomLeftCorner()) || coords.isEqual(this.getBottomRightCorner());
    }

    /**
     * @param {WalkontableCellCoords} coords
     * @param {WalkontableCellRange} expandedRange
     * @returns {WalkontableCellCoords}
     */
  }, {
    key: 'getOppositeCorner',
    value: function getOppositeCorner(coords, expandedRange) {
      if (!(coords instanceof _cellCoords.WalkontableCellCoords)) {
        return false;
      }

      if (expandedRange) {
        if (expandedRange.includes(coords)) {
          if (this.getTopLeftCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.from.row, expandedRange.from.col))) {
            return this.getBottomRightCorner();
          }
          if (this.getTopRightCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.from.row, expandedRange.to.col))) {
            return this.getBottomLeftCorner();
          }
          if (this.getBottomLeftCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.to.row, expandedRange.from.col))) {
            return this.getTopRightCorner();
          }
          if (this.getBottomRightCorner().isEqual(new _cellCoords.WalkontableCellCoords(expandedRange.to.row, expandedRange.to.col))) {
            return this.getTopLeftCorner();
          }
        }
      }

      if (coords.isEqual(this.getBottomRightCorner())) {
        return this.getTopLeftCorner();
      } else if (coords.isEqual(this.getTopLeftCorner())) {
        return this.getBottomRightCorner();
      } else if (coords.isEqual(this.getTopRightCorner())) {
        return this.getBottomLeftCorner();
      } else if (coords.isEqual(this.getBottomLeftCorner())) {
        return this.getTopRightCorner();
      }
    }

    /**
     * @param {WalkontableCellRange} range
     * @returns {Array}
     */
  }, {
    key: 'getBordersSharedWith',
    value: function getBordersSharedWith(range) {
      if (!this.includesRange(range)) {
        return [];
      }

      var thisBorders = {
        top: Math.min(this.from.row, this.to.row),
        bottom: Math.max(this.from.row, this.to.row),
        left: Math.min(this.from.col, this.to.col),
        right: Math.max(this.from.col, this.to.col)
      };
      var rangeBorders = {
        top: Math.min(range.from.row, range.to.row),
        bottom: Math.max(range.from.row, range.to.row),
        left: Math.min(range.from.col, range.to.col),
        right: Math.max(range.from.col, range.to.col)
      };
      var result = [];

      if (thisBorders.top == rangeBorders.top) {
        result.push('top');
      }
      if (thisBorders.right == rangeBorders.right) {
        result.push('right');
      }
      if (thisBorders.bottom == rangeBorders.bottom) {
        result.push('bottom');
      }
      if (thisBorders.left == rangeBorders.left) {
        result.push('left');
      }

      return result;
    }

    /**
     * Get inner selected cell coords defined by this range
     *
     * @returns {Array}
     */
  }, {
    key: 'getInner',
    value: function getInner() {
      var topLeft = this.getTopLeftCorner();
      var bottomRight = this.getBottomRightCorner();
      var out = [];

      for (var r = topLeft.row; r <= bottomRight.row; r++) {
        for (var c = topLeft.col; c <= bottomRight.col; c++) {
          if (!(this.from.row === r && this.from.col === c) && !(this.to.row === r && this.to.col === c)) {
            out.push(new _cellCoords.WalkontableCellCoords(r, c));
          }
        }
      }
      return out;
    }

    /**
     * Get all selected cell coords defined by this range
     *
     * @returns {Array}
     */
  }, {
    key: 'getAll',
    value: function getAll() {
      var topLeft = this.getTopLeftCorner();
      var bottomRight = this.getBottomRightCorner();
      var out = [];

      for (var r = topLeft.row; r <= bottomRight.row; r++) {
        for (var c = topLeft.col; c <= bottomRight.col; c++) {
          if (topLeft.row === r && topLeft.col === c) {
            out.push(topLeft);
          } else if (bottomRight.row === r && bottomRight.col === c) {
            out.push(bottomRight);
          } else {
            out.push(new _cellCoords.WalkontableCellCoords(r, c));
          }
        }
      }

      return out;
    }

    /**
     * Runs a callback function against all cells in the range. You can break the iteration by returning
     * `false` in the callback function
     *
     * @param callback {Function}
     */
  }, {
    key: 'forAll',
    value: function forAll(callback) {
      var topLeft = this.getTopLeftCorner();
      var bottomRight = this.getBottomRightCorner();

      for (var r = topLeft.row; r <= bottomRight.row; r++) {
        for (var c = topLeft.col; c <= bottomRight.col; c++) {
          var breakIteration = callback(r, c);

          if (breakIteration === false) {
            return;
          }
        }
      }
    }
  }]);

  return WalkontableCellRange;
})();

exports.WalkontableCellRange = WalkontableCellRange;

window.WalkontableCellRange = WalkontableCellRange;

},{"./../cell/coords":11}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

var _helpersObject = require('./../../../helpers/object');

var _helpersString = require('./../../../helpers/string');

var _event = require('./event');

var _overlays = require('./overlays');

var _scroll = require('./scroll');

var _settings = require('./settings');

var _table = require('./table');

var _viewport = require('./viewport');

/**
 * @class Walkontable
 */

var Walkontable = (function () {
  /**
   * @param {Object} settings
   */

  function Walkontable(settings) {
    _classCallCheck(this, Walkontable);

    var originalHeaders = [];

    // this is the namespace for global events
    this.guid = 'wt_' + (0, _helpersString.randomString)();

    // bootstrap from settings
    if (settings.cloneSource) {
      this.cloneSource = settings.cloneSource;
      this.cloneOverlay = settings.cloneOverlay;
      this.wtSettings = settings.cloneSource.wtSettings;
      this.wtTable = new _table.WalkontableTable(this, settings.table, settings.wtRootElement);
      this.wtScroll = new _scroll.WalkontableScroll(this);
      this.wtViewport = settings.cloneSource.wtViewport;
      this.wtEvent = new _event.WalkontableEvent(this);
      this.selections = this.cloneSource.selections;
    } else {
      this.wtSettings = new _settings.WalkontableSettings(this, settings);
      this.wtTable = new _table.WalkontableTable(this, settings.table);
      this.wtScroll = new _scroll.WalkontableScroll(this);
      this.wtViewport = new _viewport.WalkontableViewport(this);
      this.wtEvent = new _event.WalkontableEvent(this);
      this.selections = this.getSetting('selections');
      this.wtOverlays = new _overlays.WalkontableOverlays(this);
      this.exportSettingsAsClassNames();
    }

    // find original headers
    if (this.wtTable.THEAD.childNodes.length && this.wtTable.THEAD.childNodes[0].childNodes.length) {
      for (var c = 0, clen = this.wtTable.THEAD.childNodes[0].childNodes.length; c < clen; c++) {
        originalHeaders.push(this.wtTable.THEAD.childNodes[0].childNodes[c].innerHTML);
      }
      if (!this.getSetting('columnHeaders').length) {
        this.update('columnHeaders', [function (column, TH) {
          (0, _helpersDomElement.fastInnerText)(TH, originalHeaders[column]);
        }]);
      }
    }
    this.drawn = false;
    this.drawInterrupted = false;
  }

  /**
   * Force rerender of Walkontable
   *
   * @param {Boolean} [fastDraw=false] When `true`, try to refresh only the positions of borders without rerendering
   *                                   the data. It will only work if WalkontableTable.draw() does not force
   *                                   rendering anyway
   * @returns {Walkontable}
   */

  _createClass(Walkontable, [{
    key: 'draw',
    value: function draw() {
      var fastDraw = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this.drawInterrupted = false;

      if (!fastDraw && !(0, _helpersDomElement.isVisible)(this.wtTable.TABLE)) {
        // draw interrupted because TABLE is not visible
        this.drawInterrupted = true;
      } else {
        this.wtTable.draw(fastDraw);
      }

      return this;
    }

    /**
     * Returns the TD at coords. If topmost is set to true, returns TD from the topmost overlay layer,
     * if not set or set to false, returns TD from the master table.
     *
     * @param {WalkontableCellCoords} coords
     * @param {Boolean} [topmost=false]
     * @returns {Object}
     */
  }, {
    key: 'getCell',
    value: function getCell(coords) {
      var topmost = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (!topmost) {
        return this.wtTable.getCell(coords);
      }

      var fixedRows = this.wtSettings.getSetting('fixedRowsTop');
      var fixedColumns = this.wtSettings.getSetting('fixedColumnsLeft');

      if (coords.row < fixedRows && coords.col < fixedColumns) {
        return this.wtOverlays.topLeftCornerOverlay.clone.wtTable.getCell(coords);
      } else if (coords.row < fixedRows) {
        return this.wtOverlays.topOverlay.clone.wtTable.getCell(coords);
      } else if (coords.col < fixedColumns) {
        return this.wtOverlays.leftOverlay.clone.wtTable.getCell(coords);
      }

      return this.wtTable.getCell(coords);
    }

    /**
     * @param {Object} settings
     * @param {*} value
     * @returns {Walkontable}
     */
  }, {
    key: 'update',
    value: function update(settings, value) {
      return this.wtSettings.update(settings, value);
    }

    /**
     * Scroll the viewport to a row at the given index in the data source
     *
     * @param {Number} row
     * @returns {Walkontable}
     */
  }, {
    key: 'scrollVertical',
    value: function scrollVertical(row) {
      this.wtOverlays.topOverlay.scrollTo(row);
      this.getSetting('onScrollVertically');

      return this;
    }

    /**
     * Scroll the viewport to a column at the given index in the data source
     *
     * @param {Number} column
     * @returns {Walkontable}
     */
  }, {
    key: 'scrollHorizontal',
    value: function scrollHorizontal(column) {
      this.wtOverlays.leftOverlay.scrollTo(column);
      this.getSetting('onScrollHorizontally');

      return this;
    }

    /**
     * Scrolls the viewport to a cell (rerenders if needed)
     *
     * @param {WalkontableCellCoords} coords
     * @returns {Walkontable}
     */
  }, {
    key: 'scrollViewport',
    value: function scrollViewport(coords) {
      this.wtScroll.scrollViewport(coords);

      return this;
    }

    /**
     * @returns {Array}
     */
  }, {
    key: 'getViewport',
    value: function getViewport() {
      return [this.wtTable.getFirstVisibleRow(), this.wtTable.getFirstVisibleColumn(), this.wtTable.getLastVisibleRow(), this.wtTable.getLastVisibleColumn()];
    }

    /**
     * Get overlay name
     *
     * @returns {String}
     */
  }, {
    key: 'getOverlayName',
    value: function getOverlayName() {
      return this.cloneOverlay ? this.cloneOverlay.type : 'master';
    }

    /**
     * Export settings as class names added to the parent element of the table.
     */
  }, {
    key: 'exportSettingsAsClassNames',
    value: function exportSettingsAsClassNames() {
      var _this = this;

      var toExport = {
        rowHeaders: ['array'],
        columnHeaders: ['array']
      };
      var allClassNames = [];
      var newClassNames = [];

      (0, _helpersObject.objectEach)(toExport, function (optionType, key) {
        if (optionType.indexOf('array') > -1 && _this.getSetting(key).length) {
          newClassNames.push('ht' + (0, _helpersString.toUpperCaseFirst)(key));
        }
        allClassNames.push('ht' + (0, _helpersString.toUpperCaseFirst)(key));
      });
      (0, _helpersDomElement.removeClass)(this.wtTable.wtRootElement.parentNode, allClassNames);
      (0, _helpersDomElement.addClass)(this.wtTable.wtRootElement.parentNode, newClassNames);
    }

    /**
     * Get/Set Walkontable instance setting
     *
     * @param {String} key
     * @param {*} [param1]
     * @param {*} [param2]
     * @param {*} [param3]
     * @param {*} [param4]
     * @returns {*}
     */
  }, {
    key: 'getSetting',
    value: function getSetting(key, param1, param2, param3, param4) {
      // this is faster than .apply - https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
      return this.wtSettings.getSetting(key, param1, param2, param3, param4);
    }

    /**
     * Checks if setting exists
     *
     * @param {String} key
     * @returns {Boolean}
     */
  }, {
    key: 'hasSetting',
    value: function hasSetting(key) {
      return this.wtSettings.has(key);
    }

    /**
     * Destroy instance
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.wtOverlays.destroy();
      this.wtEvent.destroy();
    }
  }]);

  return Walkontable;
})();

exports.Walkontable = Walkontable;

window.Walkontable = Walkontable;

},{"./../../../helpers/dom/element":50,"./../../../helpers/object":55,"./../../../helpers/string":57,"./event":14,"./overlays":22,"./scroll":23,"./settings":25,"./table":26,"./viewport":28}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../../../helpers/dom/element');

var _eventManager = require('./../../../eventManager');

function WalkontableEvent(instance) {
  var that = this;

  var eventManager = (0, _eventManager.eventManager)(instance);

  //reference to instance
  this.instance = instance;

  var dblClickOrigin = [null, null];
  this.dblClickTimeout = [null, null];

  var onMouseDown = function onMouseDown(event) {
    var cell = that.parentCell(event.realTarget);

    if ((0, _helpersDomElement.hasClass)(event.realTarget, 'corner')) {
      that.instance.getSetting('onCellCornerMouseDown', event, event.realTarget);
    } else if (cell.TD) {
      if (that.instance.hasSetting('onCellMouseDown')) {
        that.instance.getSetting('onCellMouseDown', event, cell.coords, cell.TD, that.instance);
      }
    }

    if (event.button !== 2) {
      //if not right mouse button
      if (cell.TD) {
        dblClickOrigin[0] = cell.TD;
        clearTimeout(that.dblClickTimeout[0]);
        that.dblClickTimeout[0] = setTimeout(function () {
          dblClickOrigin[0] = null;
        }, 1000);
      }
    }
  };

  var onTouchMove = function onTouchMove(event) {
    that.instance.touchMoving = true;
  };

  var longTouchTimeout;

  ///**
  // * Update touch event target - if user taps on resize handle 'hit area', update the target to the cell itself
  // * @param event
  // */
  /*
   var adjustTapTarget = function (event) {
   var currentSelection
   , properTarget;
    if(hasClass(event.target,'SelectionHandle')) {
   if(that.instance.selections[0].cellRange) {
   currentSelection = that.instance.selections[0].cellRange.highlight;
    properTarget = that.instance.getCell(currentSelection, true);
   }
   }
    if(properTarget) {
   Object.defineProperty(event,'target',{
   value: properTarget
   });
   }
    return event;
   };*/

  var onTouchStart = function onTouchStart(event) {
    var container = this;

    eventManager.addEventListener(this, 'touchmove', onTouchMove);

    //this.addEventListener("touchmove", onTouchMove, false);

    // touch-and-hold event
    //longTouchTimeout = setTimeout(function () {
    //  if(!that.instance.touchMoving) {
    //    that.instance.longTouch = true;
    //
    //    var targetCoords = offset(event.target);
    //    var contextMenuEvent = new MouseEvent('contextmenu', {
    //      clientX: targetCoords.left + event.target.offsetWidth,
    //      clientY: targetCoords.top + event.target.offsetHeight,
    //      button: 2
    //    });
    //
    //    that.instance.wtTable.holder.parentNode.parentNode.dispatchEvent(contextMenuEvent);
    //  }
    //},200);

    // Prevent cell selection when scrolling with touch event - not the best solution performance-wise
    that.checkIfTouchMove = setTimeout(function () {
      if (that.instance.touchMoving === true) {
        that.instance.touchMoving = void 0;

        eventManager.removeEventListener("touchmove", onTouchMove, false);

        return;
      } else {
        //event = adjustTapTarget(event);

        onMouseDown(event);
      }
    }, 30);

    //eventManager.removeEventListener(that.instance.wtTable.holder, "mousedown", onMouseDown);
  };

  var lastMouseOver;
  var onMouseOver = function onMouseOver(event) {
    var table, td;

    if (that.instance.hasSetting('onCellMouseOver')) {
      table = that.instance.wtTable.TABLE;
      td = (0, _helpersDomElement.closest)(event.realTarget, ['TD', 'TH'], table);

      if (td && td !== lastMouseOver && (0, _helpersDomElement.isChildOf)(td, table)) {
        lastMouseOver = td;
        that.instance.getSetting('onCellMouseOver', event, that.instance.wtTable.getCoords(td), td, that.instance);
      }
    }
  };

  /*  var lastMouseOut;
   var onMouseOut = function (event) {
   if (that.instance.hasSetting('onCellMouseOut')) {
   var TABLE = that.instance.wtTable.TABLE;
   var TD = closest(event.target, ['TD', 'TH'], TABLE);
   if (TD && TD !== lastMouseOut && isChildOf(TD, TABLE)) {
   lastMouseOut = TD;
   if (TD.nodeName === 'TD') {
   that.instance.getSetting('onCellMouseOut', event, that.instance.wtTable.getCoords(TD), TD);
   }
   }
   }
   };*/

  var onMouseUp = function onMouseUp(event) {
    if (event.button !== 2) {
      //if not right mouse button
      var cell = that.parentCell(event.realTarget);

      if (cell.TD === dblClickOrigin[0] && cell.TD === dblClickOrigin[1]) {
        if ((0, _helpersDomElement.hasClass)(event.realTarget, 'corner')) {
          that.instance.getSetting('onCellCornerDblClick', event, cell.coords, cell.TD, that.instance);
        } else {
          that.instance.getSetting('onCellDblClick', event, cell.coords, cell.TD, that.instance);
        }

        dblClickOrigin[0] = null;
        dblClickOrigin[1] = null;
      } else if (cell.TD === dblClickOrigin[0]) {
        dblClickOrigin[1] = cell.TD;
        clearTimeout(that.dblClickTimeout[1]);
        that.dblClickTimeout[1] = setTimeout(function () {
          dblClickOrigin[1] = null;
        }, 500);
      }
    }
  };

  var onTouchEnd = function onTouchEnd(event) {
    clearTimeout(longTouchTimeout);
    //that.instance.longTouch == void 0;

    event.preventDefault();

    onMouseUp(event);

    //eventManager.removeEventListener(that.instance.wtTable.holder, "mouseup", onMouseUp);
  };

  eventManager.addEventListener(this.instance.wtTable.holder, 'mousedown', onMouseDown);

  eventManager.addEventListener(this.instance.wtTable.TABLE, 'mouseover', onMouseOver);

  eventManager.addEventListener(this.instance.wtTable.holder, 'mouseup', onMouseUp);

  // check if full HOT instance, or detached WOT AND run on mobile device
  if (this.instance.wtTable.holder.parentNode.parentNode && Handsontable.mobileBrowser && !that.instance.wtTable.isWorkingOnClone()) {
    var classSelector = "." + this.instance.wtTable.holder.parentNode.className.split(" ").join(".");

    eventManager.addEventListener(this.instance.wtTable.holder, 'touchstart', function (event) {
      that.instance.touchApplied = true;
      if ((0, _helpersDomElement.isChildOf)(event.target, classSelector)) {
        onTouchStart.call(event.target, event);
      }
    });
    eventManager.addEventListener(this.instance.wtTable.holder, 'touchend', function (event) {
      that.instance.touchApplied = false;
      if ((0, _helpersDomElement.isChildOf)(event.target, classSelector)) {
        onTouchEnd.call(event.target, event);
      }
    });

    if (!that.instance.momentumScrolling) {
      that.instance.momentumScrolling = {};
    }
    eventManager.addEventListener(this.instance.wtTable.holder, 'scroll', function (event) {
      clearTimeout(that.instance.momentumScrolling._timeout);

      if (!that.instance.momentumScrolling.ongoing) {
        that.instance.getSetting('onBeforeTouchScroll');
      }
      that.instance.momentumScrolling.ongoing = true;

      that.instance.momentumScrolling._timeout = setTimeout(function () {
        if (!that.instance.touchApplied) {
          that.instance.momentumScrolling.ongoing = false;

          that.instance.getSetting('onAfterMomentumScroll');
        }
      }, 200);
    });
  }

  eventManager.addEventListener(window, 'resize', function () {
    if (that.instance.getSetting('stretchH') !== 'none') {
      that.instance.draw();
    }
  });

  this.destroy = function () {
    clearTimeout(this.dblClickTimeout[0]);
    clearTimeout(this.dblClickTimeout[1]);

    eventManager.destroy();
  };
}

WalkontableEvent.prototype.parentCell = function (elem) {
  var cell = {};
  var TABLE = this.instance.wtTable.TABLE;
  var TD = (0, _helpersDomElement.closest)(elem, ['TD', 'TH'], TABLE);

  if (TD && (0, _helpersDomElement.isChildOf)(TD, TABLE)) {
    cell.coords = this.instance.wtTable.getCoords(TD);
    cell.TD = TD;
  } else if ((0, _helpersDomElement.hasClass)(elem, 'wtBorder') && (0, _helpersDomElement.hasClass)(elem, 'current')) {
    cell.coords = this.instance.selections.current.cellRange.highlight; //selections.current is current selected cell
    cell.TD = this.instance.wtTable.getCell(cell.coords);
  } else if ((0, _helpersDomElement.hasClass)(elem, 'wtBorder') && (0, _helpersDomElement.hasClass)(elem, 'area')) {
    if (this.instance.selections.area.cellRange) {
      cell.coords = this.instance.selections.area.cellRange.to; //selections.area is area selected cells
      cell.TD = this.instance.wtTable.getCell(cell.coords);
    }
  }

  return cell;
};

exports.WalkontableEvent = WalkontableEvent;

window.WalkontableEvent = WalkontableEvent;

},{"./../../../eventManager":46,"./../../../helpers/dom/element":50}],15:[function(require,module,exports){

/**
 * @class WalkontableColumnFilter
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WalkontableColumnFilter = (function () {
  /**
   * @param {Number} offset
   * @param {Number} total
   * @param {Number} countTH
   */

  function WalkontableColumnFilter(offset, total, countTH) {
    _classCallCheck(this, WalkontableColumnFilter);

    this.offset = offset;
    this.total = total;
    this.countTH = countTH;
  }

  /**
   * @param index
   * @returns {Number}
   */

  _createClass(WalkontableColumnFilter, [{
    key: "offsetted",
    value: function offsetted(index) {
      return index + this.offset;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "unOffsetted",
    value: function unOffsetted(index) {
      return index - this.offset;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "renderedToSource",
    value: function renderedToSource(index) {
      return this.offsetted(index);
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "sourceToRendered",
    value: function sourceToRendered(index) {
      return this.unOffsetted(index);
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "offsettedTH",
    value: function offsettedTH(index) {
      return index - this.countTH;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "unOffsettedTH",
    value: function unOffsettedTH(index) {
      return index + this.countTH;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "visibleRowHeadedColumnToSourceColumn",
    value: function visibleRowHeadedColumnToSourceColumn(index) {
      return this.renderedToSource(this.offsettedTH(index));
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "sourceColumnToVisibleRowHeadedColumn",
    value: function sourceColumnToVisibleRowHeadedColumn(index) {
      return this.unOffsettedTH(this.sourceToRendered(index));
    }
  }]);

  return WalkontableColumnFilter;
})();

exports.WalkontableColumnFilter = WalkontableColumnFilter;

window.WalkontableColumnFilter = WalkontableColumnFilter;

},{}],16:[function(require,module,exports){

/**
 * @class WalkontableRowFilter
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WalkontableRowFilter = (function () {
  /**
   * @param {Number} offset
   * @param {Number} total
   * @param {Number} countTH
   */

  function WalkontableRowFilter(offset, total, countTH) {
    _classCallCheck(this, WalkontableRowFilter);

    this.offset = offset;
    this.total = total;
    this.countTH = countTH;
  }

  /**
   * @param index
   * @returns {Number}
   */

  _createClass(WalkontableRowFilter, [{
    key: "offsetted",
    value: function offsetted(index) {
      return index + this.offset;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "unOffsetted",
    value: function unOffsetted(index) {
      return index - this.offset;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "renderedToSource",
    value: function renderedToSource(index) {
      return this.offsetted(index);
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "sourceToRendered",
    value: function sourceToRendered(index) {
      return this.unOffsetted(index);
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "offsettedTH",
    value: function offsettedTH(index) {
      return index - this.countTH;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "unOffsettedTH",
    value: function unOffsettedTH(index) {
      return index + this.countTH;
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "visibleColHeadedRowToSourceRow",
    value: function visibleColHeadedRowToSourceRow(index) {
      return this.renderedToSource(this.offsettedTH(index));
    }

    /**
     * @param index
     * @returns {Number}
     */
  }, {
    key: "sourceRowToVisibleColHeadedRow",
    value: function sourceRowToVisibleColHeadedRow(index) {
      return this.unOffsettedTH(this.sourceToRendered(index));
    }
  }]);

  return WalkontableRowFilter;
})();

exports.WalkontableRowFilter = WalkontableRowFilter;

window.WalkontableRowFilter = WalkontableRowFilter;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../../helpers/dom/element');

var _helpersObject = require('./../../../../helpers/object');

var _eventManager = require('./../../../../eventManager');

/**
 * Creates an overlay over the original Walkontable instance. The overlay renders the clone of the original Walkontable
 * and (optionally) implements behavior needed for native horizontal and vertical scrolling.
 *
 * @class WalkontableOverlay
 */

var WalkontableOverlay = (function () {
  _createClass(WalkontableOverlay, null, [{
    key: 'CLONE_TOP',

    /**
     * @type {String}
     */
    get: function get() {
      return 'top';
    }

    /**
     * @type {String}
     */
  }, {
    key: 'CLONE_LEFT',
    get: function get() {
      return 'left';
    }

    /**
     * @type {String}
     */
  }, {
    key: 'CLONE_CORNER',
    get: function get() {
      return 'corner';
    }

    /**
     * @type {String}
     */
  }, {
    key: 'CLONE_DEBUG',
    get: function get() {
      return 'debug';
    }

    /**
     * List of all availables clone types
     *
     * @type {Array}
     */
  }, {
    key: 'CLONE_TYPES',
    get: function get() {
      return [WalkontableOverlay.CLONE_TOP, WalkontableOverlay.CLONE_LEFT, WalkontableOverlay.CLONE_CORNER, WalkontableOverlay.CLONE_DEBUG];
    }

    /**
     * @param {Walkontable} wotInstance
     */
  }]);

  function WalkontableOverlay(wotInstance) {
    _classCallCheck(this, WalkontableOverlay);

    (0, _helpersObject.defineGetter)(this, 'wot', wotInstance, {
      writable: false
    });

    // legacy support, deprecated in the future
    this.instance = this.wot;

    this.type = '';
    this.TABLE = this.wot.wtTable.TABLE;
    this.hider = this.wot.wtTable.hider;
    this.spreader = this.wot.wtTable.spreader;
    this.holder = this.wot.wtTable.holder;
    this.wtRootElement = this.wot.wtTable.wtRootElement;
    this.trimmingContainer = (0, _helpersDomElement.getTrimmingContainer)(this.hider.parentNode.parentNode);
    this.mainTableScrollableElement = (0, _helpersDomElement.getScrollableElement)(this.wot.wtTable.TABLE);
    this.needFullRender = this.shouldBeRendered();
    this.areElementSizesAdjusted = false;
  }

  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */

  _createClass(WalkontableOverlay, [{
    key: 'shouldBeRendered',
    value: function shouldBeRendered() {
      return true;
    }

    /**
     * Make a clone of table for overlay
     *
     * @param {String} direction Can be `WalkontableOverlay.CLONE_TOP`, `WalkontableOverlay.CLONE_LEFT`,
     *                           `WalkontableOverlay.CLONE_CORNER`, `WalkontableOverlay.CLONE_DEBUG`
     * @returns {Walkontable}
     */
  }, {
    key: 'makeClone',
    value: function makeClone(direction) {
      if (WalkontableOverlay.CLONE_TYPES.indexOf(direction) === -1) {
        throw new Error('Clone type "' + direction + '" is not supported.');
      }
      var clone = document.createElement('DIV');
      var clonedTable = document.createElement('TABLE');

      clone.className = 'ht_clone_' + direction + ' handsontable';
      clone.style.position = 'absolute';
      clone.style.top = 0;
      clone.style.left = 0;
      clone.style.overflow = 'hidden';

      clonedTable.className = this.wot.wtTable.TABLE.className;
      clone.appendChild(clonedTable);

      this.type = direction;
      this.wot.wtTable.wtRootElement.parentNode.appendChild(clone);

      return new Walkontable({
        cloneSource: this.wot,
        cloneOverlay: this,
        table: clonedTable
      });
    }

    /**
     * Refresh/Redraw overlay
     *
     * @param {Boolean} [fastDraw=false]
     */
  }, {
    key: 'refresh',
    value: function refresh() {
      var fastDraw = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      // When hot settings are changed we allow to refresh overlay once before blocking
      var nextCycleRenderFlag = this.shouldBeRendered();

      if (this.clone && (this.needFullRender || nextCycleRenderFlag)) {
        this.clone.draw(fastDraw);
      }
      this.needFullRender = nextCycleRenderFlag;
    }

    /**
     * Destroy overlay instance
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      (0, _eventManager.eventManager)(this.clone).destroy();
    }
  }]);

  return WalkontableOverlay;
})();

exports.WalkontableOverlay = WalkontableOverlay;

window.WalkontableOverlay = WalkontableOverlay;

},{"./../../../../eventManager":46,"./../../../../helpers/dom/element":50,"./../../../../helpers/object":55}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helpersDomElement = require('./../../../../helpers/dom/element');

var _base = require('./_base');

/**
 * @class WalkontableCornerOverlay
 */

var WalkontableCornerOverlay = (function (_WalkontableOverlay) {
  _inherits(WalkontableCornerOverlay, _WalkontableOverlay);

  /**
   * @param {Walkontable} wotInstance
   */

  function WalkontableCornerOverlay(wotInstance) {
    _classCallCheck(this, WalkontableCornerOverlay);

    _get(Object.getPrototypeOf(WalkontableCornerOverlay.prototype), 'constructor', this).call(this, wotInstance);
    this.clone = this.makeClone(_base.WalkontableOverlay.CLONE_CORNER);
  }

  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */

  _createClass(WalkontableCornerOverlay, [{
    key: 'shouldBeRendered',
    value: function shouldBeRendered() {
      return (this.wot.getSetting('fixedRowsTop') || this.wot.getSetting('columnHeaders').length) && (this.wot.getSetting('fixedColumnsLeft') || this.wot.getSetting('rowHeaders').length) ? true : false;
    }

    /**
     * Updates the corner overlay position
     */
  }, {
    key: 'resetFixedPosition',
    value: function resetFixedPosition() {
      if (!this.wot.wtTable.holder.parentNode) {
        // removed from DOM
        return;
      }
      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var tableHeight = (0, _helpersDomElement.outerHeight)(this.clone.wtTable.TABLE);
      var tableWidth = (0, _helpersDomElement.outerWidth)(this.clone.wtTable.TABLE);

      if (this.trimmingContainer === window) {
        var box = this.wot.wtTable.hider.getBoundingClientRect();
        var _top = Math.ceil(box.top);
        var left = Math.ceil(box.left);
        var bottom = Math.ceil(box.bottom);
        var right = Math.ceil(box.right);
        var finalLeft = undefined;
        var finalTop = undefined;

        if (left < 0 && right - overlayRoot.offsetWidth > 0) {
          finalLeft = -left + 'px';
        } else {
          finalLeft = '0';
        }

        if (_top < 0 && bottom - overlayRoot.offsetHeight > 0) {
          finalTop = -_top + 'px';
        } else {
          finalTop = '0';
        }
        (0, _helpersDomElement.setOverlayPosition)(overlayRoot, finalLeft, finalTop);
      }
      overlayRoot.style.height = (tableHeight === 0 ? tableHeight : tableHeight + 4) + 'px';
      overlayRoot.style.width = (tableWidth === 0 ? tableWidth : tableWidth + 4) + 'px';
    }
  }]);

  return WalkontableCornerOverlay;
})(_base.WalkontableOverlay);

exports.WalkontableCornerOverlay = WalkontableCornerOverlay;

window.WalkontableCornerOverlay = WalkontableCornerOverlay;

},{"./../../../../helpers/dom/element":50,"./_base":17}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helpersDomElement = require('./../../../../helpers/dom/element');

var _base = require('./_base');

/**
 * A overlay that renders ALL available rows & columns positioned on top of the original Walkontable instance and all other overlays.
 * Used for debugging purposes to see if the other overlays (that render only part of the rows & columns) are positioned correctly
 *
 * @class WalkontableDebugOverlay
 */

var WalkontableDebugOverlay = (function (_WalkontableOverlay) {
  _inherits(WalkontableDebugOverlay, _WalkontableOverlay);

  /**
   * @param {Walkontable} wotInstance
   */

  function WalkontableDebugOverlay(wotInstance) {
    _classCallCheck(this, WalkontableDebugOverlay);

    _get(Object.getPrototypeOf(WalkontableDebugOverlay.prototype), 'constructor', this).call(this, wotInstance);

    this.clone = this.makeClone(_base.WalkontableOverlay.CLONE_DEBUG);
    this.clone.wtTable.holder.style.opacity = 0.4;
    this.clone.wtTable.holder.style.textShadow = '0 0 2px #ff0000';

    (0, _helpersDomElement.addClass)(this.clone.wtTable.holder.parentNode, 'wtDebugVisible');
  }

  return WalkontableDebugOverlay;
})(_base.WalkontableOverlay);

exports.WalkontableDebugOverlay = WalkontableDebugOverlay;

window.WalkontableDebugOverlay = WalkontableDebugOverlay;

},{"./../../../../helpers/dom/element":50,"./_base":17}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helpersDomElement = require('./../../../../helpers/dom/element');

var _base = require('./_base');

/**
 * @class WalkontableLeftOverlay
 */

var WalkontableLeftOverlay = (function (_WalkontableOverlay) {
  _inherits(WalkontableLeftOverlay, _WalkontableOverlay);

  /**
   * @param {Walkontable} wotInstance
   */

  function WalkontableLeftOverlay(wotInstance) {
    _classCallCheck(this, WalkontableLeftOverlay);

    _get(Object.getPrototypeOf(WalkontableLeftOverlay.prototype), 'constructor', this).call(this, wotInstance);
    this.clone = this.makeClone(_base.WalkontableOverlay.CLONE_LEFT);
  }

  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */

  _createClass(WalkontableLeftOverlay, [{
    key: 'shouldBeRendered',
    value: function shouldBeRendered() {
      return this.wot.getSetting('fixedColumnsLeft') || this.wot.getSetting('rowHeaders').length ? true : false;
    }

    /**
     * Updates the left overlay position
     */
  }, {
    key: 'resetFixedPosition',
    value: function resetFixedPosition() {
      if (!this.needFullRender || !this.wot.wtTable.holder.parentNode) {
        // removed from DOM
        return;
      }
      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var headerPosition = 0;

      if (this.trimmingContainer === window) {
        var box = this.wot.wtTable.hider.getBoundingClientRect();
        var left = Math.ceil(box.left);
        var right = Math.ceil(box.right);
        var finalLeft = undefined;
        var finalTop = undefined;

        finalTop = this.wot.wtTable.hider.style.top;
        finalTop = finalTop === '' ? 0 : finalTop;

        if (left < 0 && right - overlayRoot.offsetWidth > 0) {
          finalLeft = -left;
        } else {
          finalLeft = 0;
        }
        headerPosition = finalLeft;
        finalLeft = finalLeft + 'px';

        (0, _helpersDomElement.setOverlayPosition)(overlayRoot, finalLeft, finalTop);
      } else {
        headerPosition = this.getScrollPosition();
      }
      this.adjustHeaderBordersPosition(headerPosition);

      this.adjustElementsSize();
    }

    /**
     * Sets the main overlay's horizontal scroll position
     *
     * @param {Number} pos
     */
  }, {
    key: 'setScrollPosition',
    value: function setScrollPosition(pos) {
      if (this.mainTableScrollableElement === window) {
        window.scrollTo(pos, (0, _helpersDomElement.getWindowScrollTop)());
      } else {
        this.mainTableScrollableElement.scrollLeft = pos;
      }
    }

    /**
     * Triggers onScroll hook callback
     */
  }, {
    key: 'onScroll',
    value: function onScroll() {
      this.wot.getSetting('onScrollHorizontally');
    }

    /**
     * Calculates total sum cells width
     *
     * @param {Number} from Column index which calculates started from
     * @param {Number} to Column index where calculation is finished
     * @returns {Number} Width sum
     */
  }, {
    key: 'sumCellSizes',
    value: function sumCellSizes(from, to) {
      var sum = 0;
      var defaultColumnWidth = this.wot.wtSettings.defaultColumnWidth;

      while (from < to) {
        sum += this.wot.wtTable.getStretchedColumnWidth(from) || defaultColumnWidth;
        from++;
      }

      return sum;
    }

    /**
     * Adjust overlay root element, childs and master table element sizes (width, height).
     *
     * @param {Boolean} [force=false]
     */
  }, {
    key: 'adjustElementsSize',
    value: function adjustElementsSize() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (this.needFullRender || force) {
        this.adjustRootElementSize();
        this.adjustRootChildsSize();

        if (!force) {
          this.areElementSizesAdjusted = true;
        }
      }
    }

    /**
     * Adjust overlay root element size (width and height).
     */
  }, {
    key: 'adjustRootElementSize',
    value: function adjustRootElementSize() {
      var masterHolder = this.wot.wtTable.holder;
      var scrollbarHeight = masterHolder.clientHeight !== masterHolder.offsetHeight ? (0, _helpersDomElement.getScrollbarWidth)() : 0;
      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var overlayRootStyle = overlayRoot.style;
      var tableWidth = undefined;

      if (this.trimmingContainer !== window) {
        overlayRootStyle.height = this.wot.wtViewport.getWorkspaceHeight() - scrollbarHeight + 'px';
      }
      this.clone.wtTable.holder.style.height = overlayRootStyle.height;

      tableWidth = (0, _helpersDomElement.outerWidth)(this.clone.wtTable.TABLE);
      overlayRootStyle.width = (tableWidth === 0 ? tableWidth : tableWidth + 4) + 'px';
    }

    /**
     * Adjust overlay root childs size
     */
  }, {
    key: 'adjustRootChildsSize',
    value: function adjustRootChildsSize() {
      var scrollbarWidth = (0, _helpersDomElement.getScrollbarWidth)();

      this.clone.wtTable.hider.style.height = this.hider.style.height;
      this.clone.wtTable.holder.style.height = this.clone.wtTable.holder.parentNode.style.height;

      if (scrollbarWidth === 0) {
        scrollbarWidth = 30;
      }
      this.clone.wtTable.holder.style.width = parseInt(this.clone.wtTable.holder.parentNode.style.width, 10) + scrollbarWidth + 'px';
    }

    /**
     * Adjust the overlay dimensions and position
     */
  }, {
    key: 'applyToDOM',
    value: function applyToDOM() {
      var total = this.wot.getSetting('totalColumns');

      if (!this.areElementSizesAdjusted) {
        this.adjustElementsSize();
      }
      if (typeof this.wot.wtViewport.columnsRenderCalculator.startPosition === 'number') {
        this.spreader.style.left = this.wot.wtViewport.columnsRenderCalculator.startPosition + 'px';
      } else if (total === 0) {
        this.spreader.style.left = '0';
      } else {
        throw new Error('Incorrect value of the columnsRenderCalculator');
      }
      this.spreader.style.right = '';

      if (this.needFullRender) {
        this.syncOverlayOffset();
      }
    }

    /**
     * Synchronize calculated top position to an element
     */
  }, {
    key: 'syncOverlayOffset',
    value: function syncOverlayOffset() {
      if (typeof this.wot.wtViewport.rowsRenderCalculator.startPosition === 'number') {
        this.clone.wtTable.spreader.style.top = this.wot.wtViewport.rowsRenderCalculator.startPosition + 'px';
      } else {
        this.clone.wtTable.spreader.style.top = '';
      }
    }

    /**
     * Scrolls horizontally to a column at the left edge of the viewport
     *
     * @param sourceCol {Number} Column index which you want to scroll to
     * @param [beyondRendered=false] {Boolean} if `true`, scrolls according to the bottom edge (top edge is by default)
     */
  }, {
    key: 'scrollTo',
    value: function scrollTo(sourceCol, beyondRendered) {
      var newX = this.getTableParentOffset();
      var sourceInstance = this.wot.cloneSource ? this.wot.cloneSource : this.wot;
      var mainHolder = sourceInstance.wtTable.holder;
      var scrollbarCompensation = 0;

      if (beyondRendered && mainHolder.offsetWidth !== mainHolder.clientWidth) {
        scrollbarCompensation = (0, _helpersDomElement.getScrollbarWidth)();
      }
      if (beyondRendered) {
        newX += this.sumCellSizes(0, sourceCol + 1);
        newX -= this.wot.wtViewport.getViewportWidth();
      } else {
        newX += this.sumCellSizes(this.wot.getSetting('fixedColumnsLeft'), sourceCol);
      }
      newX += scrollbarCompensation;

      this.setScrollPosition(newX);
    }

    /**
     * Gets table parent left position
     *
     * @returns {Number}
     */
  }, {
    key: 'getTableParentOffset',
    value: function getTableParentOffset() {
      if (this.trimmingContainer === window) {
        return this.wot.wtTable.holderOffset.left;
      } else {
        return 0;
      }
    }

    /**
     * Gets the main overlay's horizontal scroll position
     *
     * @returns {Number} Main table's vertical scroll position
     */
  }, {
    key: 'getScrollPosition',
    value: function getScrollPosition() {
      return (0, _helpersDomElement.getScrollLeft)(this.mainTableScrollableElement);
    }

    /**
     * Adds css classes to hide the header border's header (cell-selection border hiding issue)
     *
     * @param {Number} position Header X position if trimming container is window or scroll top if not
     */
  }, {
    key: 'adjustHeaderBordersPosition',
    value: function adjustHeaderBordersPosition(position) {
      var masterParent = this.wot.wtTable.holder.parentNode;
      var rowHeaders = this.wot.getSetting('rowHeaders');
      var fixedColumnsLeft = this.wot.getSetting('fixedColumnsLeft');

      if (fixedColumnsLeft && !rowHeaders.length) {
        (0, _helpersDomElement.addClass)(masterParent, 'innerBorderLeft');
      } else if (!fixedColumnsLeft && rowHeaders.length) {
        var previousState = (0, _helpersDomElement.hasClass)(masterParent, 'innerBorderLeft');

        if (position) {
          (0, _helpersDomElement.addClass)(masterParent, 'innerBorderLeft');
        } else {
          (0, _helpersDomElement.removeClass)(masterParent, 'innerBorderLeft');
        }
        if (!previousState && position || previousState && !position) {
          this.wot.wtOverlays.adjustElementsSize();
        }
      }
    }
  }]);

  return WalkontableLeftOverlay;
})(_base.WalkontableOverlay);

exports.WalkontableLeftOverlay = WalkontableLeftOverlay;

window.WalkontableLeftOverlay = WalkontableLeftOverlay;

},{"./../../../../helpers/dom/element":50,"./_base":17}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helpersDomElement = require('./../../../../helpers/dom/element');

var _base = require('./_base');

/**
 * @class WalkontableTopOverlay
 */

var WalkontableTopOverlay = (function (_WalkontableOverlay) {
  _inherits(WalkontableTopOverlay, _WalkontableOverlay);

  /**
   * @param {Walkontable} wotInstance
   */

  function WalkontableTopOverlay(wotInstance) {
    _classCallCheck(this, WalkontableTopOverlay);

    _get(Object.getPrototypeOf(WalkontableTopOverlay.prototype), 'constructor', this).call(this, wotInstance);
    this.clone = this.makeClone(_base.WalkontableOverlay.CLONE_TOP);
  }

  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */

  _createClass(WalkontableTopOverlay, [{
    key: 'shouldBeRendered',
    value: function shouldBeRendered() {
      return this.wot.getSetting('fixedRowsTop') || this.wot.getSetting('columnHeaders').length ? true : false;
    }

    /**
     * Updates the top overlay position
     */
  }, {
    key: 'resetFixedPosition',
    value: function resetFixedPosition() {
      if (!this.needFullRender || !this.wot.wtTable.holder.parentNode) {
        // removed from DOM
        return;
      }
      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var headerPosition = 0;

      if (this.wot.wtOverlays.leftOverlay.trimmingContainer === window) {
        var box = this.wot.wtTable.hider.getBoundingClientRect();
        var _top = Math.ceil(box.top);
        var bottom = Math.ceil(box.bottom);
        var finalLeft = undefined;
        var finalTop = undefined;

        finalLeft = this.wot.wtTable.hider.style.left;
        finalLeft = finalLeft === '' ? 0 : finalLeft;

        if (_top < 0 && bottom - overlayRoot.offsetHeight > 0) {
          finalTop = -_top;
        } else {
          finalTop = 0;
        }
        headerPosition = finalTop;
        finalTop = finalTop + 'px';

        (0, _helpersDomElement.setOverlayPosition)(overlayRoot, finalLeft, finalTop);
      } else {
        headerPosition = this.getScrollPosition();
      }
      this.adjustHeaderBordersPosition(headerPosition);

      this.adjustElementsSize();
    }

    /**
     * Sets the main overlay's vertical scroll position
     *
     * @param {Number} pos
     */
  }, {
    key: 'setScrollPosition',
    value: function setScrollPosition(pos) {
      if (this.mainTableScrollableElement === window) {
        window.scrollTo((0, _helpersDomElement.getWindowScrollLeft)(), pos);
      } else {
        this.mainTableScrollableElement.scrollTop = pos;
      }
    }

    /**
     * Triggers onScroll hook callback
     */
  }, {
    key: 'onScroll',
    value: function onScroll() {
      this.wot.getSetting('onScrollVertically');
    }

    /**
     * Calculates total sum cells height
     *
     * @param {Number} from Row index which calculates started from
     * @param {Number} to Row index where calculation is finished
     * @returns {Number} Height sum
     */
  }, {
    key: 'sumCellSizes',
    value: function sumCellSizes(from, to) {
      var sum = 0;
      var defaultRowHeight = this.wot.wtSettings.settings.defaultRowHeight;

      while (from < to) {
        sum += this.wot.wtTable.getRowHeight(from) || defaultRowHeight;
        from++;
      }

      return sum;
    }

    /**
     * Adjust overlay root element, childs and master table element sizes (width, height).
     *
     * @param {Boolean} [force=false]
     */
  }, {
    key: 'adjustElementsSize',
    value: function adjustElementsSize() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (this.needFullRender || force) {
        this.adjustRootElementSize();
        this.adjustRootChildsSize();

        if (!force) {
          this.areElementSizesAdjusted = true;
        }
      }
    }

    /**
     * Adjust overlay root element size (width and height).
     */
  }, {
    key: 'adjustRootElementSize',
    value: function adjustRootElementSize() {
      var masterHolder = this.wot.wtTable.holder;
      var scrollbarWidth = masterHolder.clientWidth !== masterHolder.offsetWidth ? (0, _helpersDomElement.getScrollbarWidth)() : 0;
      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var overlayRootStyle = overlayRoot.style;
      var tableHeight = undefined;

      if (this.trimmingContainer !== window) {
        overlayRootStyle.width = this.wot.wtViewport.getWorkspaceWidth() - scrollbarWidth + 'px';
      }
      this.clone.wtTable.holder.style.width = overlayRootStyle.width;

      tableHeight = (0, _helpersDomElement.outerHeight)(this.clone.wtTable.TABLE);
      overlayRootStyle.height = (tableHeight === 0 ? tableHeight : tableHeight + 4) + 'px';
    }

    /**
     * Adjust overlay root childs size
     */
  }, {
    key: 'adjustRootChildsSize',
    value: function adjustRootChildsSize() {
      var scrollbarWidth = (0, _helpersDomElement.getScrollbarWidth)();

      this.clone.wtTable.hider.style.width = this.hider.style.width;
      this.clone.wtTable.holder.style.width = this.clone.wtTable.holder.parentNode.style.width;

      if (scrollbarWidth === 0) {
        scrollbarWidth = 30;
      }
      this.clone.wtTable.holder.style.height = parseInt(this.clone.wtTable.holder.parentNode.style.height, 10) + scrollbarWidth + 'px';
    }

    /**
     * Adjust the overlay dimensions and position
     */
  }, {
    key: 'applyToDOM',
    value: function applyToDOM() {
      var total = this.wot.getSetting('totalRows');

      if (!this.areElementSizesAdjusted) {
        this.adjustElementsSize();
      }
      if (typeof this.wot.wtViewport.rowsRenderCalculator.startPosition === 'number') {
        this.spreader.style.top = this.wot.wtViewport.rowsRenderCalculator.startPosition + 'px';
      } else if (total === 0) {
        // can happen if there are 0 rows
        this.spreader.style.top = '0';
      } else {
        throw new Error("Incorrect value of the rowsRenderCalculator");
      }
      this.spreader.style.bottom = '';

      if (this.needFullRender) {
        this.syncOverlayOffset();
      }
    }

    /**
     * Synchronize calculated left position to an element
     */
  }, {
    key: 'syncOverlayOffset',
    value: function syncOverlayOffset() {
      if (typeof this.wot.wtViewport.columnsRenderCalculator.startPosition === 'number') {
        this.clone.wtTable.spreader.style.left = this.wot.wtViewport.columnsRenderCalculator.startPosition + 'px';
      } else {
        this.clone.wtTable.spreader.style.left = '';
      }
    }

    /**
     * Scrolls vertically to a row
     *
     * @param sourceRow {Number} Row index which you want to scroll to
     * @param [bottomEdge=false] {Boolean} if `true`, scrolls according to the bottom edge (top edge is by default)
     */
  }, {
    key: 'scrollTo',
    value: function scrollTo(sourceRow, bottomEdge) {
      var newY = this.getTableParentOffset();
      var sourceInstance = this.wot.cloneSource ? this.wot.cloneSource : this.wot;
      var mainHolder = sourceInstance.wtTable.holder;
      var scrollbarCompensation = 0;

      if (bottomEdge && mainHolder.offsetHeight !== mainHolder.clientHeight) {
        scrollbarCompensation = (0, _helpersDomElement.getScrollbarWidth)();
      }

      if (bottomEdge) {
        newY += this.sumCellSizes(0, sourceRow + 1);
        newY -= this.wot.wtViewport.getViewportHeight();
        // Fix 1 pixel offset when cell is selected
        newY += 1;
      } else {
        newY += this.sumCellSizes(this.wot.getSetting('fixedRowsTop'), sourceRow);
      }
      newY += scrollbarCompensation;

      this.setScrollPosition(newY);
    }

    /**
     * Gets table parent top position
     *
     * @returns {Number}
     */
  }, {
    key: 'getTableParentOffset',
    value: function getTableParentOffset() {
      if (this.mainTableScrollableElement === window) {
        return this.wot.wtTable.holderOffset.top;
      } else {
        return 0;
      }
    }

    /**
     * Gets the main overlay's vertical scroll position
     *
     * @returns {Number} Main table's vertical scroll position
     */
  }, {
    key: 'getScrollPosition',
    value: function getScrollPosition() {
      return (0, _helpersDomElement.getScrollTop)(this.mainTableScrollableElement);
    }

    /**
     * Adds css classes to hide the header border's header (cell-selection border hiding issue)
     *
     * @param {Number} position Header Y position if trimming container is window or scroll top if not
     */
  }, {
    key: 'adjustHeaderBordersPosition',
    value: function adjustHeaderBordersPosition(position) {
      if (this.wot.getSetting('fixedRowsTop') === 0 && this.wot.getSetting('columnHeaders').length > 0) {
        var masterParent = this.wot.wtTable.holder.parentNode;
        var previousState = (0, _helpersDomElement.hasClass)(masterParent, 'innerBorderTop');

        if (position) {
          (0, _helpersDomElement.addClass)(masterParent, 'innerBorderTop');
        } else {
          (0, _helpersDomElement.removeClass)(masterParent, 'innerBorderTop');
        }
        if (!previousState && position || previousState && !position) {
          this.wot.wtOverlays.adjustElementsSize();
        }
      }
      // nasty workaround for double border in the header, TODO: find a pure-css solution
      if (this.wot.getSetting('rowHeaders').length === 0) {
        var secondHeaderCell = this.clone.wtTable.THEAD.querySelector('th:nth-of-type(2)');

        if (secondHeaderCell) {
          secondHeaderCell.style['border-left-width'] = 0;
        }
      }
    }
  }]);

  return WalkontableTopOverlay;
})(_base.WalkontableOverlay);

exports.WalkontableTopOverlay = WalkontableTopOverlay;

window.WalkontableTopOverlay = WalkontableTopOverlay;

},{"./../../../../helpers/dom/element":50,"./_base":17}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

var _helpersUnicode = require('./../../../helpers/unicode');

var _eventManager = require('./../../../eventManager');

var _overlayCorner = require('./overlay/corner');

var _overlayDebug = require('./overlay/debug');

var _overlayLeft = require('./overlay/left');

var _overlayTop = require('./overlay/top');

/**
 * @class WalkontableOverlays
 */

var WalkontableOverlays = (function () {
  /**
   * @param {Walkontable} wotInstance
   */

  function WalkontableOverlays(wotInstance) {
    _classCallCheck(this, WalkontableOverlays);

    this.wot = wotInstance;

    // legacy support
    this.instance = this.wot;
    this.eventManager = new _eventManager.EventManager(this.wot);

    this.wot.update('scrollbarWidth', (0, _helpersDomElement.getScrollbarWidth)());
    this.wot.update('scrollbarHeight', (0, _helpersDomElement.getScrollbarWidth)());

    this.mainTableScrollableElement = (0, _helpersDomElement.getScrollableElement)(this.wot.wtTable.TABLE);

    this.topOverlay = new _overlayTop.WalkontableTopOverlay(this.wot);
    this.leftOverlay = new _overlayLeft.WalkontableLeftOverlay(this.wot);

    if (this.topOverlay.needFullRender && this.leftOverlay.needFullRender) {
      this.topLeftCornerOverlay = new _overlayCorner.WalkontableCornerOverlay(this.wot);
    }
    if (this.wot.getSetting('debug')) {
      this.debug = new _overlayDebug.WalkontableDebugOverlay(this.wot);
    }

    this.destroyed = false;
    this.keyPressed = false;
    this.spreaderLastSize = {
      width: null,
      height: null
    };
    this.overlayScrollPositions = {
      'master': {
        top: 0,
        left: 0
      },
      'top': {
        top: null,
        left: 0
      },
      'left': {
        top: 0,
        left: null
      }
    };
    this.registerListeners();
  }

  /**
   * Refresh and redraw table
   */

  _createClass(WalkontableOverlays, [{
    key: 'refreshAll',
    value: function refreshAll() {
      if (!this.wot.drawn) {
        return;
      }
      if (!this.wot.wtTable.holder.parentNode) {
        // Walkontable was detached from DOM, but this handler was not removed
        this.destroy();

        return;
      }
      this.wot.draw(true);

      this.topOverlay.onScroll();
      this.leftOverlay.onScroll();
    }

    /**
     * Register all necessary event listeners
     */
  }, {
    key: 'registerListeners',
    value: function registerListeners() {
      var _this = this;

      this.eventManager.addEventListener(document.documentElement, 'keydown', function (event) {
        return _this.onKeyDown(event);
      });
      this.eventManager.addEventListener(document.documentElement, 'keyup', function () {
        return _this.onKeyUp();
      });
      this.eventManager.addEventListener(document, 'visibilitychange', function () {
        return _this.onKeyUp();
      });

      this.eventManager.addEventListener(this.mainTableScrollableElement, 'scroll', function (event) {
        return _this.onTableScroll(event);
      });

      if (this.topOverlay.needFullRender) {
        this.eventManager.addEventListener(this.topOverlay.clone.wtTable.holder, 'scroll', function (event) {
          return _this.onTableScroll(event);
        });
        this.eventManager.addEventListener(this.topOverlay.clone.wtTable.holder, 'wheel', function (event) {
          return _this.onTableScroll(event);
        });
      }

      if (this.leftOverlay.needFullRender) {
        this.eventManager.addEventListener(this.leftOverlay.clone.wtTable.holder, 'scroll', function (event) {
          return _this.onTableScroll(event);
        });
        this.eventManager.addEventListener(this.leftOverlay.clone.wtTable.holder, 'wheel', function (event) {
          return _this.onTableScroll(event);
        });
      }

      if (this.topOverlay.trimmingContainer !== window && this.leftOverlay.trimmingContainer !== window) {
        // This is necessary?
        //eventManager.addEventListener(window, 'scroll', (event) => this.refreshAll(event));
        this.eventManager.addEventListener(window, 'wheel', function (event) {
          var overlay = undefined;
          var deltaY = event.wheelDeltaY || event.deltaY;
          var deltaX = event.wheelDeltaX || event.deltaX;

          if (_this.topOverlay.clone.wtTable.holder.contains(event.realTarget)) {
            overlay = 'top';
          } else if (_this.leftOverlay.clone.wtTable.holder.contains(event.realTarget)) {
            overlay = 'left';
          }

          if (overlay == 'top' && deltaY !== 0) {
            event.preventDefault();
          } else if (overlay == 'left' && deltaX !== 0) {
            event.preventDefault();
          }
        });
      }
    }

    /**
     * Scroll listener
     *
     * @param {Event} event
     */
  }, {
    key: 'onTableScroll',
    value: function onTableScroll(event) {
      // if mobile browser, do not update scroll positions, as the overlays are hidden during the scroll
      if (Handsontable.mobileBrowser) {
        return;
      }
      // For key press, sync only master -> overlay position because while pressing Walkontable.render is triggered
      // by hot.refreshBorder
      if (this.keyPressed && this.mainTableScrollableElement !== window && !event.target.contains(this.mainTableScrollableElement)) {
        return;
      }
      if (event.type === 'scroll') {
        this.syncScrollPositions(event);
      } else {
        this.translateMouseWheelToScroll(event);
      }
    }

    /**
     * Key down listener
     */
  }, {
    key: 'onKeyDown',
    value: function onKeyDown(event) {
      this.keyPressed = (0, _helpersUnicode.isKey)(event.keyCode, 'ARROW_UP|ARROW_RIGHT|ARROW_DOWN|ARROW_LEFT');
    }

    /**
     * Key up listener
     */
  }, {
    key: 'onKeyUp',
    value: function onKeyUp() {
      this.keyPressed = false;
    }

    /**
     * Translate wheel event into scroll event and sync scroll overlays position
     *
     * @param {Event} event
     * @returns {Boolean}
     */
  }, {
    key: 'translateMouseWheelToScroll',
    value: function translateMouseWheelToScroll(event) {
      var topOverlay = this.topOverlay.clone.wtTable.holder;
      var leftOverlay = this.leftOverlay.clone.wtTable.holder;
      var eventMockup = { type: 'wheel' };
      var tempElem = event.target;
      var deltaY = event.wheelDeltaY || -1 * event.deltaY;
      var deltaX = event.wheelDeltaX || -1 * event.deltaX;
      var parentHolder = undefined;

      while (tempElem != document && tempElem != null) {
        if (tempElem.className.indexOf('wtHolder') > -1) {
          parentHolder = tempElem;
          break;
        }
        tempElem = tempElem.parentNode;
      }
      eventMockup.target = parentHolder;

      if (parentHolder == topOverlay) {
        this.syncScrollPositions(eventMockup, -0.2 * deltaY);
      } else if (parentHolder == leftOverlay) {
        this.syncScrollPositions(eventMockup, -0.2 * deltaX);
      }

      return false;
    }

    /**
     * Synchronize scroll position between master table and overlay table
     *
     * @param {Event|Object} event
     * @param {Number} [fakeScrollValue=null]
     */
  }, {
    key: 'syncScrollPositions',
    value: function syncScrollPositions(event) {
      var fakeScrollValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (this.destroyed) {
        return;
      }
      if (arguments.length === 0) {
        this.syncScrollWithMaster();

        return;
      }
      var master = this.mainTableScrollableElement;
      var target = event.target;
      var tempScrollValue = 0;
      var scrollValueChanged = false;
      var topOverlay = undefined;
      var leftOverlay = undefined;

      if (this.topOverlay.needFullRender) {
        topOverlay = this.topOverlay.clone.wtTable.holder;
      }
      if (this.leftOverlay.needFullRender) {
        leftOverlay = this.leftOverlay.clone.wtTable.holder;
      }

      if (target === document) {
        target = window;
      }

      if (target === master) {
        tempScrollValue = (0, _helpersDomElement.getScrollLeft)(target);

        // if scrolling the master table - populate the scroll values to both top and left overlays
        if (this.overlayScrollPositions.master.left !== tempScrollValue) {
          this.overlayScrollPositions.master.left = tempScrollValue;
          scrollValueChanged = true;

          if (topOverlay) {
            topOverlay.scrollLeft = tempScrollValue;
          }
        }
        tempScrollValue = (0, _helpersDomElement.getScrollTop)(target);

        if (this.overlayScrollPositions.master.top !== tempScrollValue) {
          this.overlayScrollPositions.master.top = tempScrollValue;
          scrollValueChanged = true;

          if (leftOverlay) {
            leftOverlay.scrollTop = tempScrollValue;
          }
        }
      } else if (target === topOverlay) {
        tempScrollValue = (0, _helpersDomElement.getScrollLeft)(target);

        // if scrolling the top overlay - populate the horizontal scroll to the master table
        if (this.overlayScrollPositions.top.left !== tempScrollValue) {
          this.overlayScrollPositions.top.left = tempScrollValue;
          scrollValueChanged = true;

          master.scrollLeft = tempScrollValue;
        }

        // "fake" scroll value calculated from the mousewheel event
        if (fakeScrollValue !== null) {
          scrollValueChanged = true;
          master.scrollTop += fakeScrollValue;
        }
      } else if (target === leftOverlay) {
        tempScrollValue = (0, _helpersDomElement.getScrollTop)(target);

        // if scrolling the left overlay - populate the vertical scroll to the master table
        if (this.overlayScrollPositions.left.top !== tempScrollValue) {
          this.overlayScrollPositions.left.top = tempScrollValue;
          scrollValueChanged = true;

          master.scrollTop = tempScrollValue;
        }

        // "fake" scroll value calculated from the mousewheel event
        if (fakeScrollValue !== null) {
          scrollValueChanged = true;
          master.scrollLeft += fakeScrollValue;
        }
      }

      if (!this.keyPressed && scrollValueChanged && event.type === 'scroll') {
        this.refreshAll();
      }
    }

    /**
     * Synchronize overlay scrollbars with the master scrollbar
     */
  }, {
    key: 'syncScrollWithMaster',
    value: function syncScrollWithMaster() {
      var master = this.topOverlay.mainTableScrollableElement;

      if (this.topOverlay.needFullRender) {
        this.topOverlay.clone.wtTable.holder.scrollLeft = master.scrollLeft;
      }
      if (this.leftOverlay.needFullRender) {
        this.leftOverlay.clone.wtTable.holder.scrollTop = master.scrollTop;
      }
    }

    /**
     *
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.eventManager.destroy();
      this.topOverlay.destroy();
      this.leftOverlay.destroy();

      if (this.topLeftCornerOverlay) {
        this.topLeftCornerOverlay.destroy();
      }
      if (this.debug) {
        this.debug.destroy();
      }
      this.destroyed = true;
    }

    /**
     * @param {Boolean} [fastDraw=false]
     */
  }, {
    key: 'refresh',
    value: function refresh() {
      var fastDraw = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (this.topOverlay.areElementSizesAdjusted && this.leftOverlay.areElementSizesAdjusted) {
        var container = this.wot.wtTable.wtRootElement.parentNode || this.wot.wtTable.wtRootElement;
        var width = container.clientWidth;
        var height = container.clientHeight;

        if (width !== this.spreaderLastSize.width || height !== this.spreaderLastSize.height) {
          this.spreaderLastSize.width = width;
          this.spreaderLastSize.height = height;
          this.adjustElementsSize();
        }
      }
      this.leftOverlay.refresh(fastDraw);
      this.topOverlay.refresh(fastDraw);

      if (this.topLeftCornerOverlay) {
        this.topLeftCornerOverlay.refresh(fastDraw);
      }
      if (this.debug) {
        this.debug.refresh(fastDraw);
      }
    }

    /**
     * Adjust overlays elements size and master table size
     *
     * @param {Boolean} [force=false]
     */
  }, {
    key: 'adjustElementsSize',
    value: function adjustElementsSize() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var totalColumns = this.wot.getSetting('totalColumns');
      var totalRows = this.wot.getSetting('totalRows');
      var headerRowSize = this.wot.wtViewport.getRowHeaderWidth();
      var headerColumnSize = this.wot.wtViewport.getColumnHeaderHeight();
      var hiderStyle = this.wot.wtTable.hider.style;

      hiderStyle.width = headerRowSize + this.leftOverlay.sumCellSizes(0, totalColumns) + 'px';
      hiderStyle.height = headerColumnSize + this.topOverlay.sumCellSizes(0, totalRows) + 1 + 'px';

      this.topOverlay.adjustElementsSize(force);
      this.leftOverlay.adjustElementsSize(force);
    }

    /**
     *
     */
  }, {
    key: 'applyToDOM',
    value: function applyToDOM() {
      if (!this.topOverlay.areElementSizesAdjusted || !this.leftOverlay.areElementSizesAdjusted) {
        this.adjustElementsSize();
      }
      this.topOverlay.applyToDOM();
      this.leftOverlay.applyToDOM();
    }
  }]);

  return WalkontableOverlays;
})();

exports.WalkontableOverlays = WalkontableOverlays;

window.WalkontableOverlays = WalkontableOverlays;

},{"./../../../eventManager":46,"./../../../helpers/dom/element":50,"./../../../helpers/unicode":58,"./overlay/corner":18,"./overlay/debug":19,"./overlay/left":20,"./overlay/top":21}],23:[function(require,module,exports){

/**
 * @class WalkontableScroll
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var WalkontableScroll = (function () {
  /**
   * @param {Walkontable} wotInstance
   */

  function WalkontableScroll(wotInstance) {
    _classCallCheck(this, WalkontableScroll);

    this.wot = wotInstance;

    // legacy support
    this.instance = wotInstance;
  }

  /**
   * Scrolls viewport to a cell by minimum number of cells
   *
   * @param {WalkontableCellCoords} coords
   */

  _createClass(WalkontableScroll, [{
    key: 'scrollViewport',
    value: function scrollViewport(coords) {
      if (!this.wot.drawn) {
        return;
      }
      var totalRows = this.wot.getSetting('totalRows');
      var totalColumns = this.wot.getSetting('totalColumns');

      if (coords.row < 0 || coords.row > totalRows - 1) {
        throw new Error('row ' + coords.row + ' does not exist');
      }

      if (coords.col < 0 || coords.col > totalColumns - 1) {
        throw new Error('column ' + coords.col + ' does not exist');
      }

      if (coords.row > this.instance.wtTable.getLastVisibleRow()) {
        this.wot.wtOverlays.topOverlay.scrollTo(coords.row, true);
      } else if (coords.row >= this.instance.getSetting('fixedRowsTop') && coords.row < this.instance.wtTable.getFirstVisibleRow()) {
        this.wot.wtOverlays.topOverlay.scrollTo(coords.row);
      }

      if (coords.col > this.instance.wtTable.getLastVisibleColumn()) {
        this.wot.wtOverlays.leftOverlay.scrollTo(coords.col, true);
      } else if (coords.col >= this.instance.getSetting('fixedColumnsLeft') && coords.col < this.instance.wtTable.getFirstVisibleColumn()) {
        this.wot.wtOverlays.leftOverlay.scrollTo(coords.col);
      }
    }
  }]);

  return WalkontableScroll;
})();

exports.WalkontableScroll = WalkontableScroll;

window.WalkontableScroll = WalkontableScroll;

},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

var _border = require('./border');

var _cellCoords = require('./cell/coords');

var _cellRange = require('./cell/range');

/**
 * @class WalkontableSelection
 */

var WalkontableSelection = (function () {
  /**
   * @param {Object} settings
   * @param {WalkontableCellRange} cellRange
   */

  function WalkontableSelection(settings, cellRange) {
    _classCallCheck(this, WalkontableSelection);

    this.settings = settings;
    this.cellRange = cellRange || null;
    this.instanceBorders = {};
  }

  /**
   * Each Walkontable clone requires it's own border for every selection. This method creates and returns selection
   * borders per instance
   *
   * @param {Walkontable} wotInstance
   * @returns {WalkontableBorder}
   */

  _createClass(WalkontableSelection, [{
    key: 'getBorder',
    value: function getBorder(wotInstance) {
      if (this.instanceBorders[wotInstance.guid]) {
        return this.instanceBorders[wotInstance.guid];
      }
      // where is this returned?
      this.instanceBorders[wotInstance.guid] = new _border.WalkontableBorder(wotInstance, this.settings);
    }

    /**
     * Checks if selection is empty
     *
     * @returns {Boolean}
     */
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.cellRange === null;
    }

    /**
     * Adds a cell coords to the selection
     *
     * @param {WalkontableCellCoords} coords
     */
  }, {
    key: 'add',
    value: function add(coords) {
      if (this.isEmpty()) {
        this.cellRange = new _cellRange.WalkontableCellRange(coords, coords, coords);
      } else {
        this.cellRange.expand(coords);
      }
    }

    /**
     * If selection range from or to property equals oldCoords, replace it with newCoords. Return boolean
     * information about success
     *
     * @param {WalkontableCellCoords} oldCoords
     * @param {WalkontableCellCoords} newCoords
     * @returns {Boolean}
     */
  }, {
    key: 'replace',
    value: function replace(oldCoords, newCoords) {
      if (!this.isEmpty()) {
        if (this.cellRange.from.isEqual(oldCoords)) {
          this.cellRange.from = newCoords;

          return true;
        }
        if (this.cellRange.to.isEqual(oldCoords)) {
          this.cellRange.to = newCoords;

          return true;
        }
      }

      return false;
    }

    /**
     * Clears selection
     */
  }, {
    key: 'clear',
    value: function clear() {
      this.cellRange = null;
    }

    /**
     * Returns the top left (TL) and bottom right (BR) selection coordinates
     *
     * @returns {Array} Returns array of coordinates for example `[1, 1, 5, 5]`
     */
  }, {
    key: 'getCorners',
    value: function getCorners() {
      var topLeft = this.cellRange.getTopLeftCorner();
      var bottomRight = this.cellRange.getBottomRightCorner();

      return [topLeft.row, topLeft.col, bottomRight.row, bottomRight.col];
    }

    /**
     * Adds class name to cell element at given coords
     *
     * @param {Walkontable} wotInstance Walkontable instance
     * @param {Number} sourceRow Cell row coord
     * @param {Number} sourceColumn Cell column coord
     * @param {String} className Class name
     */
  }, {
    key: 'addClassAtCoords',
    value: function addClassAtCoords(wotInstance, sourceRow, sourceColumn, className) {
      var TD = wotInstance.wtTable.getCell(new _cellCoords.WalkontableCellCoords(sourceRow, sourceColumn));

      if (typeof TD === 'object') {
        (0, _helpersDomElement.addClass)(TD, className);
      }
    }

    /**
     * @param wotInstance
     */
  }, {
    key: 'draw',
    value: function draw(wotInstance) {
      if (this.isEmpty()) {
        if (this.settings.border) {
          var border = this.getBorder(wotInstance);

          if (border) {
            border.disappear();
          }
        }

        return;
      }
      var renderedRows = wotInstance.wtTable.getRenderedRowsCount();
      var renderedColumns = wotInstance.wtTable.getRenderedColumnsCount();
      var corners = this.getCorners();
      var sourceRow = undefined,
          sourceCol = undefined,
          TH = undefined;

      for (var column = 0; column < renderedColumns; column++) {
        sourceCol = wotInstance.wtTable.columnFilter.renderedToSource(column);

        if (sourceCol >= corners[1] && sourceCol <= corners[3]) {
          TH = wotInstance.wtTable.getColumnHeader(sourceCol);

          if (TH && this.settings.highlightColumnClassName) {
            (0, _helpersDomElement.addClass)(TH, this.settings.highlightColumnClassName);
          }
        }
      }

      for (var row = 0; row < renderedRows; row++) {
        sourceRow = wotInstance.wtTable.rowFilter.renderedToSource(row);

        if (sourceRow >= corners[0] && sourceRow <= corners[2]) {
          TH = wotInstance.wtTable.getRowHeader(sourceRow);

          if (TH && this.settings.highlightRowClassName) {
            (0, _helpersDomElement.addClass)(TH, this.settings.highlightRowClassName);
          }
        }

        for (var column = 0; column < renderedColumns; column++) {
          sourceCol = wotInstance.wtTable.columnFilter.renderedToSource(column);

          if (sourceRow >= corners[0] && sourceRow <= corners[2] && sourceCol >= corners[1] && sourceCol <= corners[3]) {
            // selected cell
            if (this.settings.className) {
              this.addClassAtCoords(wotInstance, sourceRow, sourceCol, this.settings.className);
            }
          } else if (sourceRow >= corners[0] && sourceRow <= corners[2]) {
            // selection is in this row
            if (this.settings.highlightRowClassName) {
              this.addClassAtCoords(wotInstance, sourceRow, sourceCol, this.settings.highlightRowClassName);
            }
          } else if (sourceCol >= corners[1] && sourceCol <= corners[3]) {
            // selection is in this column
            if (this.settings.highlightColumnClassName) {
              this.addClassAtCoords(wotInstance, sourceRow, sourceCol, this.settings.highlightColumnClassName);
            }
          }
        }
      }
      wotInstance.getSetting('onBeforeDrawBorders', corners, this.settings.className);

      if (this.settings.border) {
        var border = this.getBorder(wotInstance);

        if (border) {
          // warning! border.appear modifies corners!
          border.appear(corners);
        }
      }
    }
  }]);

  return WalkontableSelection;
})();

exports.WalkontableSelection = WalkontableSelection;

window.WalkontableSelection = WalkontableSelection;

},{"./../../../helpers/dom/element":50,"./border":8,"./cell/coords":11,"./cell/range":12}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

/**
 * @class WalkontableSettings
 */

var WalkontableSettings = (function () {
  /**
   * @param {Walkontable} wotInstance
   * @param {Object} settings
   */

  function WalkontableSettings(wotInstance, settings) {
    var _this = this;

    _classCallCheck(this, WalkontableSettings);

    this.wot = wotInstance;
    // legacy support
    this.instance = wotInstance;

    // default settings. void 0 means it is required, null means it can be empty
    this.defaults = {
      table: void 0,
      debug: false, // shows WalkontableDebugOverlay

      // presentation mode
      externalRowCalculator: false,
      stretchH: 'none', // values: all, last, none
      currentRowClassName: null,
      currentColumnClassName: null,

      //data source
      data: void 0,
      fixedColumnsLeft: 0,
      fixedRowsTop: 0,
      // this must be array of functions: [function (row, TH) {}]
      rowHeaders: function rowHeaders() {
        return [];
      },
      // this must be array of functions: [function (column, TH) {}]
      columnHeaders: function columnHeaders() {
        return [];
      },
      totalRows: void 0,
      totalColumns: void 0,
      cellRenderer: function cellRenderer(row, column, TD) {
        var cellData = _this.getSetting('data', row, column);

        (0, _helpersDomElement.fastInnerText)(TD, cellData === void 0 || cellData === null ? '' : cellData);
      },
      // columnWidth: 50,
      columnWidth: function columnWidth(col) {
        return; //return undefined means use default size for the rendered cell content
      },
      rowHeight: function rowHeight(row) {
        return; //return undefined means use default size for the rendered cell content
      },
      defaultRowHeight: 23,
      defaultColumnWidth: 50,
      selections: null,
      hideBorderOnMouseDownOver: false,
      viewportRowCalculatorOverride: null,
      viewportColumnCalculatorOverride: null,

      //callbacks
      onCellMouseDown: null,
      onCellMouseOver: null,
      //    onCellMouseOut: null,
      onCellDblClick: null,
      onCellCornerMouseDown: null,
      onCellCornerDblClick: null,
      beforeDraw: null,
      onDraw: null,
      onBeforeDrawBorders: null,
      onScrollVertically: null,
      onScrollHorizontally: null,
      onBeforeTouchScroll: null,
      onAfterMomentumScroll: null,

      //constants
      scrollbarWidth: 10,
      scrollbarHeight: 10,

      renderAllRows: false,
      groups: false
    };
    // reference to settings
    this.settings = {};

    for (var i in this.defaults) {
      if (this.defaults.hasOwnProperty(i)) {
        if (settings[i] !== void 0) {
          this.settings[i] = settings[i];
        } else if (this.defaults[i] === void 0) {
          throw new Error('A required setting "' + i + '" was not provided');
        } else {
          this.settings[i] = this.defaults[i];
        }
      }
    }
  }

  /**
   * Update settings
   *
   * @param {Object} settings
   * @param {*} value
   * @returns {Walkontable}
   */

  _createClass(WalkontableSettings, [{
    key: 'update',
    value: function update(settings, value) {
      if (value === void 0) {
        //settings is object
        for (var i in settings) {
          if (settings.hasOwnProperty(i)) {
            this.settings[i] = settings[i];
          }
        }
      } else {
        //if value is defined then settings is the key
        this.settings[settings] = value;
      }
      return this.wot;
    }

    /**
     * Get setting by name
     *
     * @param {String} key
     * @param {*} param1
     * @param {*} param2
     * @param {*} param3
     * @param {*} param4
     * @returns {*}
     */
  }, {
    key: 'getSetting',
    value: function getSetting(key, param1, param2, param3, param4) {
      if (typeof this.settings[key] === 'function') {
        // this is faster than .apply - https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
        return this.settings[key](param1, param2, param3, param4);
      } else if (param1 !== void 0 && Array.isArray(this.settings[key])) {
        // perhaps this can be removed, it is only used in tests
        return this.settings[key][param1];
      } else {
        return this.settings[key];
      }
    }

    /**
     * Checks if setting exists
     *
     * @param {Boolean} key
     * @returns {Boolean}
     */
  }, {
    key: 'has',
    value: function has(key) {
      return !!this.settings[key];
    }
  }]);

  return WalkontableSettings;
})();

exports.WalkontableSettings = WalkontableSettings;

window.WalkontableSettings = WalkontableSettings;

},{"./../../../helpers/dom/element":50}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

var _cellCoords = require('./cell/coords');

var _cellRange = require('./cell/range');

var _filterColumn = require('./filter/column');

var _overlayCorner = require('./overlay/corner');

var _overlayDebug = require('./overlay/debug');

var _overlayLeft = require('./overlay/left');

var _filterRow = require('./filter/row');

var _tableRenderer = require('./tableRenderer');

var _overlayTop = require('./overlay/top');

var WalkontableTable = (function () {
  /**
   * @param {Walkontable} wotInstance
   * @param {HTMLTableElement} table
   */

  function WalkontableTable(wotInstance, table) {
    _classCallCheck(this, WalkontableTable);

    this.wot = wotInstance;
    // legacy support
    this.instance = this.wot;
    this.TABLE = table;
    this.TBODY = null;
    this.THEAD = null;
    this.COLGROUP = null;
    this.tableOffset = 0;
    this.holderOffset = 0;

    (0, _helpersDomElement.removeTextNodes)(this.TABLE);

    this.spreader = this.createSpreader(this.TABLE);
    this.hider = this.createHider(this.spreader);
    this.holder = this.createHolder(this.hider);

    this.wtRootElement = this.holder.parentNode;
    this.alignOverlaysWithTrimmingContainer();
    this.fixTableDomTree();

    this.colgroupChildrenLength = this.COLGROUP.childNodes.length;
    this.theadChildrenLength = this.THEAD.firstChild ? this.THEAD.firstChild.childNodes.length : 0;
    this.tbodyChildrenLength = this.TBODY.childNodes.length;

    this.rowFilter = null;
    this.columnFilter = null;
  }

  /**
   *
   */

  _createClass(WalkontableTable, [{
    key: 'fixTableDomTree',
    value: function fixTableDomTree() {
      this.TBODY = this.TABLE.querySelector('tbody');

      if (!this.TBODY) {
        this.TBODY = document.createElement('tbody');
        this.TABLE.appendChild(this.TBODY);
      }
      this.THEAD = this.TABLE.querySelector('thead');

      if (!this.THEAD) {
        this.THEAD = document.createElement('thead');
        this.TABLE.insertBefore(this.THEAD, this.TBODY);
      }
      this.COLGROUP = this.TABLE.querySelector('colgroup');

      if (!this.COLGROUP) {
        this.COLGROUP = document.createElement('colgroup');
        this.TABLE.insertBefore(this.COLGROUP, this.THEAD);
      }

      if (this.wot.getSetting('columnHeaders').length && !this.THEAD.childNodes.length) {
        this.THEAD.appendChild(document.createElement('TR'));
      }
    }

    /**
     * @param table
     * @returns {HTMLElement}
     */
  }, {
    key: 'createSpreader',
    value: function createSpreader(table) {
      var parent = table.parentNode;
      var spreader = undefined;

      if (!parent || parent.nodeType !== 1 || !(0, _helpersDomElement.hasClass)(parent, 'wtHolder')) {
        spreader = document.createElement('div');
        spreader.className = 'wtSpreader';

        if (parent) {
          // if TABLE is detached (e.g. in Jasmine test), it has no parentNode so we cannot attach holder to it
          parent.insertBefore(spreader, table);
        }
        spreader.appendChild(table);
      }
      spreader.style.position = 'relative';

      return spreader;
    }

    /**
     * @param spreader
     * @returns {HTMLElement}
     */
  }, {
    key: 'createHider',
    value: function createHider(spreader) {
      var parent = spreader.parentNode;
      var hider = undefined;

      if (!parent || parent.nodeType !== 1 || !(0, _helpersDomElement.hasClass)(parent, 'wtHolder')) {
        hider = document.createElement('div');
        hider.className = 'wtHider';

        if (parent) {
          // if TABLE is detached (e.g. in Jasmine test), it has no parentNode so we cannot attach holder to it
          parent.insertBefore(hider, spreader);
        }
        hider.appendChild(spreader);
      }

      return hider;
    }

    /**
     *
     * @param hider
     * @returns {HTMLElement}
     */
  }, {
    key: 'createHolder',
    value: function createHolder(hider) {
      var parent = hider.parentNode;
      var holder = undefined;

      if (!parent || parent.nodeType !== 1 || !(0, _helpersDomElement.hasClass)(parent, 'wtHolder')) {
        holder = document.createElement('div');
        holder.style.position = 'relative';
        holder.className = 'wtHolder';

        if (parent) {
          // if TABLE is detached (e.g. in Jasmine test), it has no parentNode so we cannot attach holder to it
          parent.insertBefore(holder, hider);
        }
        if (!this.isWorkingOnClone()) {
          holder.parentNode.className += 'ht_master handsontable';
        }
        holder.appendChild(hider);
      }

      return holder;
    }
  }, {
    key: 'alignOverlaysWithTrimmingContainer',
    value: function alignOverlaysWithTrimmingContainer() {
      var trimmingElement = (0, _helpersDomElement.getTrimmingContainer)(this.wtRootElement);

      if (!this.isWorkingOnClone()) {
        this.holder.parentNode.style.position = 'relative';

        if (trimmingElement === window) {
          this.holder.style.overflow = 'visible';
          this.wtRootElement.style.overflow = 'visible';
        } else {
          this.holder.style.width = (0, _helpersDomElement.getStyle)(trimmingElement, 'width');
          this.holder.style.height = (0, _helpersDomElement.getStyle)(trimmingElement, 'height');
          this.holder.style.overflow = '';
        }
      }
    }
  }, {
    key: 'isWorkingOnClone',
    value: function isWorkingOnClone() {
      return !!this.wot.cloneSource;
    }

    /**
     * Redraws the table
     *
     * @param fastDraw {Boolean} If TRUE, will try to avoid full redraw and only update the border positions. If FALSE or UNDEFINED, will perform a full redraw
     * @returns {WalkontableTable}
     */
  }, {
    key: 'draw',
    value: function draw(fastDraw) {
      if (!this.isWorkingOnClone()) {
        this.holderOffset = (0, _helpersDomElement.offset)(this.holder);
        fastDraw = this.wot.wtViewport.createRenderCalculators(fastDraw);
      }

      if (!fastDraw) {
        if (this.isWorkingOnClone()) {
          this.tableOffset = this.wot.cloneSource.wtTable.tableOffset;
        } else {
          this.tableOffset = (0, _helpersDomElement.offset)(this.TABLE);
        }
        var startRow = undefined;

        if (this.wot.cloneOverlay instanceof _overlayDebug.WalkontableDebugOverlay || this.wot.cloneOverlay instanceof _overlayTop.WalkontableTopOverlay || this.wot.cloneOverlay instanceof _overlayCorner.WalkontableCornerOverlay) {
          startRow = 0;
        } else {
          startRow = this.wot.wtViewport.rowsRenderCalculator.startRow;
        }
        var startColumn = undefined;

        if (this.wot.cloneOverlay instanceof _overlayDebug.WalkontableDebugOverlay || this.wot.cloneOverlay instanceof _overlayLeft.WalkontableLeftOverlay || this.wot.cloneOverlay instanceof _overlayCorner.WalkontableCornerOverlay) {
          startColumn = 0;
        } else {
          startColumn = this.wot.wtViewport.columnsRenderCalculator.startColumn;
        }
        this.rowFilter = new _filterRow.WalkontableRowFilter(startRow, this.wot.getSetting('totalRows'), this.wot.getSetting('columnHeaders').length);
        this.columnFilter = new _filterColumn.WalkontableColumnFilter(startColumn, this.wot.getSetting('totalColumns'), this.wot.getSetting('rowHeaders').length);
        this._doDraw(); //creates calculator after draw

        this.alignOverlaysWithTrimmingContainer();
      } else {
        if (!this.isWorkingOnClone()) {
          // in case we only scrolled without redraw, update visible rows information in oldRowsCalculator
          this.wot.wtViewport.createVisibleCalculators();
        }
        if (this.wot.wtOverlays) {
          this.wot.wtOverlays.refresh(true);
        }
      }
      this.refreshSelections(fastDraw);

      if (!this.isWorkingOnClone()) {
        this.wot.wtOverlays.topOverlay.resetFixedPosition();
        this.wot.wtOverlays.leftOverlay.resetFixedPosition();

        if (this.wot.wtOverlays.topLeftCornerOverlay) {
          this.wot.wtOverlays.topLeftCornerOverlay.resetFixedPosition();
        }
      }
      this.wot.drawn = true;

      return this;
    }
  }, {
    key: '_doDraw',
    value: function _doDraw() {
      var wtRenderer = new _tableRenderer.WalkontableTableRenderer(this);

      wtRenderer.render();
    }
  }, {
    key: 'removeClassFromCells',
    value: function removeClassFromCells(className) {
      var nodes = this.TABLE.querySelectorAll('.' + className);

      for (var i = 0, len = nodes.length; i < len; i++) {
        (0, _helpersDomElement.removeClass)(nodes[i], className);
      }
    }
  }, {
    key: 'refreshSelections',
    value: function refreshSelections(fastDraw) {
      if (!this.wot.selections) {
        return;
      }
      var len = this.wot.selections.length;

      if (fastDraw) {
        for (var i = 0; i < len; i++) {
          // there was no rerender, so we need to remove classNames by ourselves
          if (this.wot.selections[i].settings.className) {
            this.removeClassFromCells(this.wot.selections[i].settings.className);
          }
          if (this.wot.selections[i].settings.highlightRowClassName) {
            this.removeClassFromCells(this.wot.selections[i].settings.highlightRowClassName);
          }
          if (this.wot.selections[i].settings.highlightColumnClassName) {
            this.removeClassFromCells(this.wot.selections[i].settings.highlightColumnClassName);
          }
        }
      }
      for (var i = 0; i < len; i++) {
        this.wot.selections[i].draw(this.wot, fastDraw);
      }
    }

    /**
     * Get cell element at coords.
     *
     * @param {WalkontableCellCoords} coords
     * @returns {HTMLElement|Number} HTMLElement on success or Number one of the exit codes on error:
     *  -1 row before viewport
     *  -2 row after viewport
     */
  }, {
    key: 'getCell',
    value: function getCell(coords) {
      if (this.isRowBeforeRenderedRows(coords.row)) {
        // row before rendered rows
        return -1;
      } else if (this.isRowAfterRenderedRows(coords.row)) {
        // row after rendered rows
        return -2;
      }
      var TR = this.TBODY.childNodes[this.rowFilter.sourceToRendered(coords.row)];

      if (TR) {
        return TR.childNodes[this.columnFilter.sourceColumnToVisibleRowHeadedColumn(coords.col)];
      }
    }

    /**
     * getColumnHeader
     *
     * @param {Number} col Column index
     * @param {Number} [level=0] Header level (0 = most distant to the table)
     * @returns {Object} HTMLElement on success or undefined on error
     */
  }, {
    key: 'getColumnHeader',
    value: function getColumnHeader(col) {
      var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      var TR = this.THEAD.childNodes[level];

      if (TR) {
        return TR.childNodes[this.columnFilter.sourceColumnToVisibleRowHeadedColumn(col)];
      }
    }

    /**
     * getRowHeader
     *
     * @param {Number} row Row index
     * @returns {HTMLElement} HTMLElement on success or Number one of the exit codes on error: `null table doesn't have row headers`
     */
  }, {
    key: 'getRowHeader',
    value: function getRowHeader(row) {
      if (this.columnFilter.sourceColumnToVisibleRowHeadedColumn(0) === 0) {
        return null;
      }
      var TR = this.TBODY.childNodes[this.rowFilter.sourceToRendered(row)];

      if (TR) {
        return TR.childNodes[0];
      }
    }

    /**
     * Returns cell coords object for a given TD
     *
     * @param {HTMLTableCellElement} TD
     * @returns {WalkontableCellCoords}
     */
  }, {
    key: 'getCoords',
    value: function getCoords(TD) {
      var TR = TD.parentNode;
      var row = (0, _helpersDomElement.index)(TR);

      if (TR.parentNode === this.THEAD) {
        row = this.rowFilter.visibleColHeadedRowToSourceRow(row);
      } else {
        row = this.rowFilter.renderedToSource(row);
      }
      var col = this.columnFilter.visibleRowHeadedColumnToSourceColumn(TD.cellIndex);

      return new _cellCoords.WalkontableCellCoords(row, col);
    }
  }, {
    key: 'getTrForRow',
    value: function getTrForRow(row) {
      return this.TBODY.childNodes[this.rowFilter.sourceToRendered(row)];
    }
  }, {
    key: 'getFirstRenderedRow',
    value: function getFirstRenderedRow() {
      return this.wot.wtViewport.rowsRenderCalculator.startRow;
    }
  }, {
    key: 'getFirstVisibleRow',
    value: function getFirstVisibleRow() {
      return this.wot.wtViewport.rowsVisibleCalculator.startRow;
    }
  }, {
    key: 'getFirstRenderedColumn',
    value: function getFirstRenderedColumn() {
      return this.wot.wtViewport.columnsRenderCalculator.startColumn;
    }

    /**
     * @returns {Number} Returns -1 if no row is visible
     */
  }, {
    key: 'getFirstVisibleColumn',
    value: function getFirstVisibleColumn() {
      return this.wot.wtViewport.columnsVisibleCalculator.startColumn;
    }

    /**
     * @returns {Number} Returns -1 if no row is visible
     */
  }, {
    key: 'getLastRenderedRow',
    value: function getLastRenderedRow() {
      return this.wot.wtViewport.rowsRenderCalculator.endRow;
    }
  }, {
    key: 'getLastVisibleRow',
    value: function getLastVisibleRow() {
      return this.wot.wtViewport.rowsVisibleCalculator.endRow;
    }
  }, {
    key: 'getLastRenderedColumn',
    value: function getLastRenderedColumn() {
      return this.wot.wtViewport.columnsRenderCalculator.endColumn;
    }

    /**
     * @returns {Number} Returns -1 if no column is visible
     */
  }, {
    key: 'getLastVisibleColumn',
    value: function getLastVisibleColumn() {
      return this.wot.wtViewport.columnsVisibleCalculator.endColumn;
    }
  }, {
    key: 'isRowBeforeRenderedRows',
    value: function isRowBeforeRenderedRows(row) {
      return this.rowFilter.sourceToRendered(row) < 0 && row >= 0;
    }
  }, {
    key: 'isRowAfterViewport',
    value: function isRowAfterViewport(row) {
      return row > this.getLastVisibleRow();
    }
  }, {
    key: 'isRowAfterRenderedRows',
    value: function isRowAfterRenderedRows(row) {
      return row > this.getLastRenderedRow();
    }
  }, {
    key: 'isColumnBeforeViewport',
    value: function isColumnBeforeViewport(column) {
      return this.columnFilter.sourceToRendered(column) < 0 && column >= 0;
    }
  }, {
    key: 'isColumnAfterViewport',
    value: function isColumnAfterViewport(column) {
      return column > this.getLastVisibleColumn();
    }
  }, {
    key: 'isLastRowFullyVisible',
    value: function isLastRowFullyVisible() {
      return this.getLastVisibleRow() === this.getLastRenderedRow();
    }
  }, {
    key: 'isLastColumnFullyVisible',
    value: function isLastColumnFullyVisible() {
      return this.getLastVisibleColumn() === this.getLastRenderedColumn();
    }
  }, {
    key: 'getRenderedColumnsCount',
    value: function getRenderedColumnsCount() {
      if (this.wot.cloneOverlay instanceof _overlayDebug.WalkontableDebugOverlay) {
        return this.wot.getSetting('totalColumns');
      } else if (this.wot.cloneOverlay instanceof _overlayLeft.WalkontableLeftOverlay || this.wot.cloneOverlay instanceof _overlayCorner.WalkontableCornerOverlay) {
        return this.wot.getSetting('fixedColumnsLeft');
      } else {
        return this.wot.wtViewport.columnsRenderCalculator.count;
      }
    }
  }, {
    key: 'getRenderedRowsCount',
    value: function getRenderedRowsCount() {
      if (this.wot.cloneOverlay instanceof _overlayDebug.WalkontableDebugOverlay) {
        return this.wot.getSetting('totalRows');
      } else if (this.wot.cloneOverlay instanceof _overlayTop.WalkontableTopOverlay || this.wot.cloneOverlay instanceof _overlayCorner.WalkontableCornerOverlay) {
        return this.wot.getSetting('fixedRowsTop');
      }

      return this.wot.wtViewport.rowsRenderCalculator.count;
    }
  }, {
    key: 'getVisibleRowsCount',
    value: function getVisibleRowsCount() {
      return this.wot.wtViewport.rowsVisibleCalculator.count;
    }
  }, {
    key: 'allRowsInViewport',
    value: function allRowsInViewport() {
      return this.wot.getSetting('totalRows') == this.getVisibleRowsCount();
    }

    /**
     * Checks if any of the row's cells content exceeds its initial height, and if so, returns the oversized height
     *
     * @param {Number} sourceRow
     * @returns {Number}
     */
  }, {
    key: 'getRowHeight',
    value: function getRowHeight(sourceRow) {
      var height = this.wot.wtSettings.settings.rowHeight(sourceRow);
      var oversizedHeight = this.wot.wtViewport.oversizedRows[sourceRow];

      if (oversizedHeight !== void 0) {
        height = height ? Math.max(height, oversizedHeight) : oversizedHeight;
      }

      return height;
    }
  }, {
    key: 'getColumnHeaderHeight',
    value: function getColumnHeaderHeight(level) {
      var height = this.wot.wtSettings.settings.defaultRowHeight;
      var oversizedHeight = this.wot.wtViewport.oversizedColumnHeaders[level];

      if (oversizedHeight !== void 0) {
        height = height ? Math.max(height, oversizedHeight) : oversizedHeight;
      }

      return height;
    }
  }, {
    key: 'getVisibleColumnsCount',
    value: function getVisibleColumnsCount() {
      return this.wot.wtViewport.columnsVisibleCalculator.count;
    }
  }, {
    key: 'allColumnsInViewport',
    value: function allColumnsInViewport() {
      return this.wot.getSetting('totalColumns') == this.getVisibleColumnsCount();
    }
  }, {
    key: 'getColumnWidth',
    value: function getColumnWidth(sourceColumn) {
      var width = this.wot.wtSettings.settings.columnWidth;

      if (typeof width === 'function') {
        width = width(sourceColumn);
      } else if (typeof width === 'object') {
        width = width[sourceColumn];
      }

      return width || this.wot.wtSettings.settings.defaultColumnWidth;
    }
  }, {
    key: 'getStretchedColumnWidth',
    value: function getStretchedColumnWidth(sourceColumn) {
      var width = this.getColumnWidth(sourceColumn);
      var calculator = this.wot.wtViewport.columnsRenderCalculator;

      if (calculator) {
        var stretchedWidth = calculator.getStretchedColumnWidth(sourceColumn, width);

        if (stretchedWidth) {
          width = stretchedWidth;
        }
      }

      return width;
    }
  }]);

  return WalkontableTable;
})();

exports.WalkontableTable = WalkontableTable;

window.WalkontableTable = WalkontableTable;

},{"./../../../helpers/dom/element":50,"./cell/coords":11,"./cell/range":12,"./filter/column":15,"./filter/row":16,"./overlay/corner":18,"./overlay/debug":19,"./overlay/left":20,"./overlay/top":21,"./tableRenderer":27}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

/**
 * @class WalkontableTableRenderer
 */

var WalkontableTableRenderer = (function () {
  /**
   * @param {WalkontableTable} wtTable
   */

  function WalkontableTableRenderer(wtTable) {
    _classCallCheck(this, WalkontableTableRenderer);

    this.wtTable = wtTable;
    this.wot = wtTable.instance;
    // legacy support
    this.instance = wtTable.instance;

    this.rowFilter = wtTable.rowFilter;
    this.columnFilter = wtTable.columnFilter;

    this.TABLE = wtTable.TABLE;
    this.THEAD = wtTable.THEAD;
    this.TBODY = wtTable.TBODY;
    this.COLGROUP = wtTable.COLGROUP;

    this.rowHeaders = [];
    this.rowHeaderCount = 0;
    this.columnHeaders = [];
    this.columnHeaderCount = 0;
    this.fixedRowsTop = 0;
  }

  /**
   *
   */

  _createClass(WalkontableTableRenderer, [{
    key: 'render',
    value: function render() {
      if (!this.wtTable.isWorkingOnClone()) {
        this.wot.getSetting('beforeDraw', true);
      }

      this.rowHeaders = this.wot.getSetting('rowHeaders');
      this.rowHeaderCount = this.rowHeaders.length;
      this.fixedRowsTop = this.wot.getSetting('fixedRowsTop');
      this.columnHeaders = this.wot.getSetting('columnHeaders');
      this.columnHeaderCount = this.columnHeaders.length;

      var columnsToRender = this.wtTable.getRenderedColumnsCount();
      var rowsToRender = this.wtTable.getRenderedRowsCount();
      var totalColumns = this.wot.getSetting('totalColumns');
      var totalRows = this.wot.getSetting('totalRows');
      var workspaceWidth = undefined;
      var adjusted = false;

      if (totalColumns > 0) {
        // prepare COL and TH elements for rendering
        this.adjustAvailableNodes();
        adjusted = true;

        // adjust column widths according to user widths settings
        this.renderColumnHeaders();

        //Render table rows
        this.renderRows(totalRows, rowsToRender, columnsToRender);

        if (!this.wtTable.isWorkingOnClone()) {
          workspaceWidth = this.wot.wtViewport.getWorkspaceWidth();
          this.wot.wtViewport.containerWidth = null;
        }
        this.adjustColumnHeaderHeights();
        this.adjustColumnWidths(columnsToRender);
        this.markOversizedColumns();
      }

      if (!adjusted) {
        this.adjustAvailableNodes();
      }
      this.removeRedundantRows(rowsToRender);

      if (!this.wtTable.isWorkingOnClone()) {
        this.markOversizedRows();

        this.wot.wtViewport.createVisibleCalculators();
        this.wot.wtOverlays.refresh(false);
        this.wot.wtOverlays.applyToDOM();

        if (workspaceWidth !== this.wot.wtViewport.getWorkspaceWidth()) {
          //workspace width changed though to shown/hidden vertical scrollbar. Let's reapply stretching
          this.wot.wtViewport.containerWidth = null;

          var firstRendered = this.wtTable.getFirstRenderedColumn();
          var lastRendered = this.wtTable.getLastRenderedColumn();

          for (var i = firstRendered; i < lastRendered; i++) {
            var width = this.wtTable.getStretchedColumnWidth(i);
            var renderedIndex = this.columnFilter.sourceToRendered(i);

            this.COLGROUP.childNodes[renderedIndex + this.rowHeaderCount].style.width = width + 'px';
          }
        }

        this.wot.getSetting('onDraw', true);
      }
    }

    /**
     * @param {Number} renderedRowsCount
     */
  }, {
    key: 'removeRedundantRows',
    value: function removeRedundantRows(renderedRowsCount) {
      while (this.wtTable.tbodyChildrenLength > renderedRowsCount) {
        this.TBODY.removeChild(this.TBODY.lastChild);
        this.wtTable.tbodyChildrenLength--;
      }
    }

    /**
     * @param {Number} totalRows
     * @param {Number} rowsToRender
     * @param {Number} columnsToRender
     */
  }, {
    key: 'renderRows',
    value: function renderRows(totalRows, rowsToRender, columnsToRender) {
      var lastTD = undefined,
          TR = undefined;
      var visibleRowIndex = 0;
      var sourceRowIndex = this.rowFilter.renderedToSource(visibleRowIndex);
      var isWorkingOnClone = this.wtTable.isWorkingOnClone();

      while (sourceRowIndex < totalRows && sourceRowIndex >= 0) {
        if (visibleRowIndex > 1000) {
          throw new Error('Security brake: Too much TRs. Please define height for your table, which will enforce scrollbars.');
        }
        if (rowsToRender !== void 0 && visibleRowIndex === rowsToRender) {
          // We have as much rows as needed for this clone
          break;
        }
        TR = this.getOrCreateTrForRow(visibleRowIndex, TR);

        // Render row headers
        this.renderRowHeaders(sourceRowIndex, TR);
        // Add and/or remove TDs to TR to match the desired number
        this.adjustColumns(TR, columnsToRender + this.rowHeaderCount);

        lastTD = this.renderCells(sourceRowIndex, TR, columnsToRender);

        if (!isWorkingOnClone) {
          // Reset the oversized row cache for this row
          this.resetOversizedRow(sourceRowIndex);
        }

        if (TR.firstChild) {
          // if I have 2 fixed columns with one-line content and the 3rd column has a multiline content, this is
          // the way to make sure that the overlay will has same row height
          var height = this.wot.wtTable.getRowHeight(sourceRowIndex);

          if (height) {
            // Decrease height. 1 pixel will be "replaced" by 1px border top
            height--;
            TR.firstChild.style.height = height + 'px';
          } else {
            TR.firstChild.style.height = '';
          }
        }
        visibleRowIndex++;
        sourceRowIndex = this.rowFilter.renderedToSource(visibleRowIndex);
      }
    }

    /**
     * Reset the oversized row cache for the provided index
     *
     * @param {Number} sourceRow Row index
     */
  }, {
    key: 'resetOversizedRow',
    value: function resetOversizedRow(sourceRow) {
      if (this.wot.getSetting('externalRowCalculator')) {
        return;
      }
      if (this.wot.wtViewport.oversizedRows && this.wot.wtViewport.oversizedRows[sourceRow]) {
        this.wot.wtViewport.oversizedRows[sourceRow] = void 0;
      }
    }

    /**
     * Check if any of the rendered rows is higher than expected, and if so, cache them
     */
  }, {
    key: 'markOversizedRows',
    value: function markOversizedRows() {
      if (this.wot.getSetting('externalRowCalculator')) {
        return;
      }
      var rowCount = this.instance.wtTable.TBODY.childNodes.length;
      var expectedTableHeight = rowCount * this.instance.wtSettings.settings.defaultRowHeight;
      var actualTableHeight = (0, _helpersDomElement.innerHeight)(this.instance.wtTable.TBODY) - 1;
      var previousRowHeight = undefined;
      var rowInnerHeight = undefined;
      var sourceRowIndex = undefined;
      var currentTr = undefined;
      var rowHeader = undefined;

      if (expectedTableHeight === actualTableHeight) {
        // If the actual table height equals rowCount * default single row height, no row is oversized -> no need to iterate over them
        return;
      }

      while (rowCount) {
        rowCount--;
        sourceRowIndex = this.instance.wtTable.rowFilter.renderedToSource(rowCount);
        previousRowHeight = this.instance.wtTable.getRowHeight(sourceRowIndex);
        currentTr = this.instance.wtTable.getTrForRow(sourceRowIndex);
        rowHeader = currentTr.querySelector('th');

        if (rowHeader) {
          rowInnerHeight = (0, _helpersDomElement.innerHeight)(rowHeader);
        } else {
          rowInnerHeight = (0, _helpersDomElement.innerHeight)(currentTr) - 1;
        }

        if (!previousRowHeight && this.instance.wtSettings.settings.defaultRowHeight < rowInnerHeight || previousRowHeight < rowInnerHeight) {
          this.instance.wtViewport.oversizedRows[sourceRowIndex] = ++rowInnerHeight;
        }
      }
    }

    /**
     * Check if any of the rendered columns is wider than expected, and if so, cache them.
     */
  }, {
    key: 'markOversizedColumns',
    value: function markOversizedColumns() {
      var overlayName = this.wot.getOverlayName();

      if (!this.columnHeaderCount || this.wot.wtViewport.isMarkedOversizedColumn[overlayName] || this.wtTable.isWorkingOnClone()) {
        return;
      }
      var columnCount = this.wtTable.getRenderedColumnsCount();

      for (var i = 0; i < this.columnHeaderCount; i++) {
        for (var renderedColumnIndex = -1 * this.rowHeaderCount; renderedColumnIndex < columnCount; renderedColumnIndex++) {
          this.markIfOversizedColumnHeader(renderedColumnIndex);
        }
      }
      this.wot.wtViewport.isMarkedOversizedColumn[overlayName] = true;
    }

    /**
     *
     */
  }, {
    key: 'adjustColumnHeaderHeights',
    value: function adjustColumnHeaderHeights() {
      var columnHeaders = this.wot.getSetting('columnHeaders');
      var childs = this.wot.wtTable.THEAD.childNodes;
      var oversizedCols = this.wot.wtViewport.oversizedColumnHeaders;

      for (var i = 0, len = columnHeaders.length; i < len; i++) {
        if (oversizedCols[i]) {
          if (childs[i].childNodes.length === 0) {
            return;
          }
          childs[i].childNodes[0].style.height = oversizedCols[i] + 'px';
        }
      }
    }

    /**
     * Check if column header for the specified column is higher than expected, and if so, cache it
     *
     * @param {Number} col Index of column
     */
  }, {
    key: 'markIfOversizedColumnHeader',
    value: function markIfOversizedColumnHeader(col) {
      var sourceColIndex = this.wot.wtTable.columnFilter.renderedToSource(col);
      var level = this.columnHeaderCount;
      var defaultRowHeight = this.wot.wtSettings.settings.defaultRowHeight;
      var previousColHeaderHeight = undefined;
      var currentHeader = undefined;
      var currentHeaderHeight = undefined;

      while (level) {
        level--;

        previousColHeaderHeight = this.wot.wtTable.getColumnHeaderHeight(level);
        currentHeader = this.wot.wtTable.getColumnHeader(sourceColIndex, level);

        if (!currentHeader) {
          continue;
        }
        //currentHeaderHeight = defaultRowHeight;
        currentHeaderHeight = (0, _helpersDomElement.innerHeight)(currentHeader);

        if (!previousColHeaderHeight && defaultRowHeight < currentHeaderHeight || previousColHeaderHeight < currentHeaderHeight) {
          this.wot.wtViewport.oversizedColumnHeaders[level] = currentHeaderHeight;
        }
      }
    }

    /**
     * @param {Number} sourceRowIndex
     * @param {HTMLTableRowElement} TR
     * @param {Number} columnsToRender
     * @returns {HTMLTableCellElement}
     */
  }, {
    key: 'renderCells',
    value: function renderCells(sourceRowIndex, TR, columnsToRender) {
      var TD = undefined;
      var sourceColIndex = undefined;

      for (var visibleColIndex = 0; visibleColIndex < columnsToRender; visibleColIndex++) {
        sourceColIndex = this.columnFilter.renderedToSource(visibleColIndex);

        if (visibleColIndex === 0) {
          TD = TR.childNodes[this.columnFilter.sourceColumnToVisibleRowHeadedColumn(sourceColIndex)];
        } else {
          TD = TD.nextSibling; //http://jsperf.com/nextsibling-vs-indexed-childnodes
        }
        // If the number of headers has been reduced, we need to replace excess TH with TD
        if (TD.nodeName == 'TH') {
          TD = replaceThWithTd(TD, TR);
        }
        if (!(0, _helpersDomElement.hasClass)(TD, 'hide')) {
          TD.className = '';
        }
        TD.removeAttribute('style');
        this.wot.wtSettings.settings.cellRenderer(sourceRowIndex, sourceColIndex, TD);
      }

      return TD;
    }

    /**
     * @param {Number} columnsToRender
     */
  }, {
    key: 'adjustColumnWidths',
    value: function adjustColumnWidths(columnsToRender) {
      var scrollbarCompensation = 0;
      var sourceInstance = this.wot.cloneSource ? this.wot.cloneSource : this.wot;
      var mainHolder = sourceInstance.wtTable.holder;

      if (mainHolder.offsetHeight < mainHolder.scrollHeight) {
        scrollbarCompensation = (0, _helpersDomElement.getScrollbarWidth)();
      }
      this.wot.wtViewport.columnsRenderCalculator.refreshStretching(this.wot.wtViewport.getViewportWidth() - scrollbarCompensation);

      for (var renderedColIndex = 0; renderedColIndex < columnsToRender; renderedColIndex++) {
        var width = this.wtTable.getStretchedColumnWidth(this.columnFilter.renderedToSource(renderedColIndex));
        this.COLGROUP.childNodes[renderedColIndex + this.rowHeaderCount].style.width = width + 'px';
      }
    }

    /**
     * @param {HTMLTableCellElement} TR
     */
  }, {
    key: 'appendToTbody',
    value: function appendToTbody(TR) {
      this.TBODY.appendChild(TR);
      this.wtTable.tbodyChildrenLength++;
    }

    /**
     * @param {Number} rowIndex
     * @param {HTMLTableRowElement} currentTr
     * @returns {HTMLTableCellElement}
     */
  }, {
    key: 'getOrCreateTrForRow',
    value: function getOrCreateTrForRow(rowIndex, currentTr) {
      var TR = undefined;

      if (rowIndex >= this.wtTable.tbodyChildrenLength) {
        TR = this.createRow();
        this.appendToTbody(TR);
      } else if (rowIndex === 0) {
        TR = this.TBODY.firstChild;
      } else {
        // http://jsperf.com/nextsibling-vs-indexed-childnodes
        TR = currentTr.nextSibling;
      }

      return TR;
    }

    /**
     * @returns {HTMLTableCellElement}
     */
  }, {
    key: 'createRow',
    value: function createRow() {
      var TR = document.createElement('TR');

      for (var visibleColIndex = 0; visibleColIndex < this.rowHeaderCount; visibleColIndex++) {
        TR.appendChild(document.createElement('TH'));
      }

      return TR;
    }

    /**
     * @param {Number} row
     * @param {Number} col
     * @param {HTMLTableCellElement} TH
     */
  }, {
    key: 'renderRowHeader',
    value: function renderRowHeader(row, col, TH) {
      TH.className = '';
      TH.removeAttribute('style');
      this.rowHeaders[col](row, TH, col);
    }

    /**
     * @param {Number} row
     * @param {HTMLTableCellElement} TR
     */
  }, {
    key: 'renderRowHeaders',
    value: function renderRowHeaders(row, TR) {
      for (var TH = TR.firstChild, visibleColIndex = 0; visibleColIndex < this.rowHeaderCount; visibleColIndex++) {
        // If the number of row headers increased we need to create TH or replace an existing TD node with TH
        if (!TH) {
          TH = document.createElement('TH');
          TR.appendChild(TH);
        } else if (TH.nodeName == 'TD') {
          TH = replaceTdWithTh(TH, TR);
        }
        this.renderRowHeader(row, visibleColIndex, TH);
        // http://jsperf.com/nextsibling-vs-indexed-childnodes
        TH = TH.nextSibling;
      }
    }

    /**
     * Adjust the number of COL and TH elements to match the number of columns and headers that need to be rendered
     */
  }, {
    key: 'adjustAvailableNodes',
    value: function adjustAvailableNodes() {
      this.adjustColGroups();
      this.adjustThead();
    }

    /**
     * Renders the column headers
     */
  }, {
    key: 'renderColumnHeaders',
    value: function renderColumnHeaders() {
      var overlayName = this.wot.getOverlayName();

      if (!this.columnHeaderCount) {
        return;
      }
      var columnCount = this.wtTable.getRenderedColumnsCount();

      for (var i = 0; i < this.columnHeaderCount; i++) {
        var TR = this.getTrForColumnHeaders(i);

        for (var renderedColumnIndex = -1 * this.rowHeaderCount; renderedColumnIndex < columnCount; renderedColumnIndex++) {
          var sourceCol = this.columnFilter.renderedToSource(renderedColumnIndex);

          this.renderColumnHeader(i, sourceCol, TR.childNodes[renderedColumnIndex + this.rowHeaderCount]);
        }
      }
    }

    /**
     * Adjusts the number of COL elements to match the number of columns that need to be rendered
     */
  }, {
    key: 'adjustColGroups',
    value: function adjustColGroups() {
      var columnCount = this.wtTable.getRenderedColumnsCount();

      while (this.wtTable.colgroupChildrenLength < columnCount + this.rowHeaderCount) {
        this.COLGROUP.appendChild(document.createElement('COL'));
        this.wtTable.colgroupChildrenLength++;
      }
      while (this.wtTable.colgroupChildrenLength > columnCount + this.rowHeaderCount) {
        this.COLGROUP.removeChild(this.COLGROUP.lastChild);
        this.wtTable.colgroupChildrenLength--;
      }
      if (this.rowHeaderCount) {
        (0, _helpersDomElement.addClass)(this.COLGROUP.childNodes[0], 'rowHeader');
      }
    }

    /**
     * Adjusts the number of TH elements in THEAD to match the number of headers and columns that need to be rendered
     */
  }, {
    key: 'adjustThead',
    value: function adjustThead() {
      var columnCount = this.wtTable.getRenderedColumnsCount();
      var TR = this.THEAD.firstChild;

      if (this.columnHeaders.length) {
        for (var i = 0, len = this.columnHeaders.length; i < len; i++) {
          TR = this.THEAD.childNodes[i];

          if (!TR) {
            TR = document.createElement('TR');
            this.THEAD.appendChild(TR);
          }
          this.theadChildrenLength = TR.childNodes.length;

          while (this.theadChildrenLength < columnCount + this.rowHeaderCount) {
            TR.appendChild(document.createElement('TH'));
            this.theadChildrenLength++;
          }
          while (this.theadChildrenLength > columnCount + this.rowHeaderCount) {
            TR.removeChild(TR.lastChild);
            this.theadChildrenLength--;
          }
        }
        var theadChildrenLength = this.THEAD.childNodes.length;

        if (theadChildrenLength > this.columnHeaders.length) {
          for (var i = this.columnHeaders.length; i < theadChildrenLength; i++) {
            this.THEAD.removeChild(this.THEAD.lastChild);
          }
        }
      } else if (TR) {
        (0, _helpersDomElement.empty)(TR);
      }
    }

    /**
     * @param {Number} index
     * @returns {HTMLTableCellElement}
     */
  }, {
    key: 'getTrForColumnHeaders',
    value: function getTrForColumnHeaders(index) {
      return this.THEAD.childNodes[index];
    }

    /**
     * @param {Number} row
     * @param {Number} col
     * @param {HTMLTableCellElement} TH
     * @returns {*}
     */
  }, {
    key: 'renderColumnHeader',
    value: function renderColumnHeader(row, col, TH) {
      TH.className = '';
      TH.removeAttribute('style');

      return this.columnHeaders[row](col, TH, row);
    }

    /**
     * Add and/or remove the TDs to match the desired number
     *
     * @param {HTMLTableCellElement} TR Table row in question
     * @param {Number} desiredCount The desired number of TDs in the TR
     */
  }, {
    key: 'adjustColumns',
    value: function adjustColumns(TR, desiredCount) {
      var count = TR.childNodes.length;

      while (count < desiredCount) {
        var TD = document.createElement('TD');

        TR.appendChild(TD);
        count++;
      }
      while (count > desiredCount) {
        TR.removeChild(TR.lastChild);
        count--;
      }
    }

    /**
     * @param {Number} columnsToRender
     */
  }, {
    key: 'removeRedundantColumns',
    value: function removeRedundantColumns(columnsToRender) {
      while (this.wtTable.tbodyChildrenLength > columnsToRender) {
        this.TBODY.removeChild(this.TBODY.lastChild);
        this.wtTable.tbodyChildrenLength--;
      }
    }
  }]);

  return WalkontableTableRenderer;
})();

function replaceTdWithTh(TD, TR) {
  var TH = document.createElement('TH');

  TR.insertBefore(TH, TD);
  TR.removeChild(TD);

  return TH;
}

function replaceThWithTd(TH, TR) {
  var TD = document.createElement('TD');

  TR.insertBefore(TD, TH);
  TR.removeChild(TH);

  return TD;
}

exports.WalkontableTableRenderer = WalkontableTableRenderer;

window.WalkontableTableRenderer = WalkontableTableRenderer;

},{"./../../../helpers/dom/element":50}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./../../../helpers/dom/element');

var _eventManager = require('./../../../eventManager');

var _calculatorViewportColumns = require('./calculator/viewportColumns');

var _calculatorViewportRows = require('./calculator/viewportRows');

/**
 * @class WalkontableViewport
 */

var WalkontableViewport = (function () {
  /**
   * @param wotInstance
   */

  function WalkontableViewport(wotInstance) {
    var _this = this;

    _classCallCheck(this, WalkontableViewport);

    this.wot = wotInstance;

    // legacy support
    this.instance = this.wot;

    this.oversizedRows = [];
    this.oversizedColumnHeaders = [];
    this.isMarkedOversizedColumn = {};
    this.clientHeight = 0;
    this.containerWidth = NaN;
    this.rowHeaderWidth = NaN;
    this.rowsVisibleCalculator = null;
    this.columnsVisibleCalculator = null;

    this.eventManager = new _eventManager.EventManager(this.wot);
    this.eventManager.addEventListener(window, 'resize', function () {
      _this.clientHeight = _this.getWorkspaceHeight();
    });
  }

  /**
   * @returns {number}
   */

  _createClass(WalkontableViewport, [{
    key: 'getWorkspaceHeight',
    value: function getWorkspaceHeight() {
      // var scrollHandler = this.instance.wtOverlays.topOverlay.scrollHandler;
      var trimmingContainer = this.instance.wtOverlays.topOverlay.trimmingContainer;
      var elemHeight = undefined;
      var height = 0;

      if (trimmingContainer === window) {
        height = document.documentElement.clientHeight;
      } else {
        elemHeight = (0, _helpersDomElement.outerHeight)(trimmingContainer);
        // returns height without DIV scrollbar
        height = elemHeight > 0 && trimmingContainer.clientHeight > 0 ? trimmingContainer.clientHeight : Infinity;
      }

      return height;
    }
  }, {
    key: 'getWorkspaceWidth',
    value: function getWorkspaceWidth() {
      var width = undefined;
      var totalColumns = this.instance.getSetting("totalColumns");
      var trimmingContainer = this.instance.wtOverlays.leftOverlay.trimmingContainer;
      var overflow = undefined;
      var stretchSetting = this.instance.getSetting('stretchH');
      var docOffsetWidth = document.documentElement.offsetWidth;

      if (Handsontable.freezeOverlays) {
        width = Math.min(docOffsetWidth - this.getWorkspaceOffset().left, docOffsetWidth);
      } else {
        width = Math.min(this.getContainerFillWidth(), docOffsetWidth - this.getWorkspaceOffset().left, docOffsetWidth);
      }

      if (trimmingContainer === window && totalColumns > 0 && this.sumColumnWidths(0, totalColumns - 1) > width) {
        // in case sum of column widths is higher than available stylesheet width, let's assume using the whole window
        // otherwise continue below, which will allow stretching
        // this is used in `scroll_window.html`
        // TODO test me
        return document.documentElement.clientWidth;
      }

      if (trimmingContainer !== window) {
        overflow = (0, _helpersDomElement.getStyle)(this.instance.wtOverlays.leftOverlay.trimmingContainer, 'overflow');

        if (overflow == "scroll" || overflow == "hidden" || overflow == "auto") {
          // this is used in `scroll.html`
          // TODO test me
          return Math.max(width, trimmingContainer.clientWidth);
        }
      }

      if (stretchSetting === 'none' || !stretchSetting) {
        // if no stretching is used, return the maximum used workspace width
        return Math.max(width, (0, _helpersDomElement.outerWidth)(this.instance.wtTable.TABLE));
      } else {
        // if stretching is used, return the actual container width, so the columns can fit inside it
        return width;
      }
    }

    /**
     * Checks if viewport has vertical scroll
     *
     * @returns {Boolean}
     */
  }, {
    key: 'hasVerticalScroll',
    value: function hasVerticalScroll() {
      return this.getWorkspaceActualHeight() > this.getWorkspaceHeight();
    }

    /**
     * Checks if viewport has horizontal scroll
     *
     * @returns {Boolean}
     */
  }, {
    key: 'hasHorizontalScroll',
    value: function hasHorizontalScroll() {
      return this.getWorkspaceActualWidth() > this.getWorkspaceWidth();
    }

    /**
     * @param from
     * @param length
     * @returns {Number}
     */
  }, {
    key: 'sumColumnWidths',
    value: function sumColumnWidths(from, length) {
      var sum = 0;

      while (from < length) {
        sum += this.wot.wtTable.getColumnWidth(from);
        from++;
      }

      return sum;
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getContainerFillWidth',
    value: function getContainerFillWidth() {
      if (this.containerWidth) {
        return this.containerWidth;
      }
      var mainContainer = this.instance.wtTable.holder;
      var fillWidth = undefined;
      var dummyElement = undefined;

      dummyElement = document.createElement("DIV");
      dummyElement.style.width = "100%";
      dummyElement.style.height = "1px";
      mainContainer.appendChild(dummyElement);
      fillWidth = dummyElement.offsetWidth;

      this.containerWidth = fillWidth;
      mainContainer.removeChild(dummyElement);

      return fillWidth;
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getWorkspaceOffset',
    value: function getWorkspaceOffset() {
      return (0, _helpersDomElement.offset)(this.wot.wtTable.TABLE);
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getWorkspaceActualHeight',
    value: function getWorkspaceActualHeight() {
      return (0, _helpersDomElement.outerHeight)(this.wot.wtTable.TABLE);
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getWorkspaceActualWidth',
    value: function getWorkspaceActualWidth() {
      return (0, _helpersDomElement.outerWidth)(this.wot.wtTable.TABLE) || (0, _helpersDomElement.outerWidth)(this.wot.wtTable.TBODY) || (0, _helpersDomElement.outerWidth)(this.wot.wtTable.THEAD); //IE8 reports 0 as <table> offsetWidth;
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getColumnHeaderHeight',
    value: function getColumnHeaderHeight() {
      if (isNaN(this.columnHeaderHeight)) {
        this.columnHeaderHeight = (0, _helpersDomElement.outerHeight)(this.wot.wtTable.THEAD);
      }

      return this.columnHeaderHeight;
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getViewportHeight',
    value: function getViewportHeight() {
      var containerHeight = this.getWorkspaceHeight();
      var columnHeaderHeight = undefined;

      if (containerHeight === Infinity) {
        return containerHeight;
      }
      columnHeaderHeight = this.getColumnHeaderHeight();

      if (columnHeaderHeight > 0) {
        containerHeight -= columnHeaderHeight;
      }

      return containerHeight;
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getRowHeaderWidth',
    value: function getRowHeaderWidth() {
      if (this.wot.cloneSource) {
        return this.wot.cloneSource.wtViewport.getRowHeaderWidth();
      }
      if (isNaN(this.rowHeaderWidth)) {
        var rowHeaders = this.instance.getSetting('rowHeaders');

        if (rowHeaders.length) {
          var TH = this.instance.wtTable.TABLE.querySelector('TH');
          this.rowHeaderWidth = 0;

          for (var i = 0, len = rowHeaders.length; i < len; i++) {
            if (TH) {
              this.rowHeaderWidth += (0, _helpersDomElement.outerWidth)(TH);
              TH = TH.nextSibling;
            } else {
              // yes this is a cheat but it worked like that before, just taking assumption from CSS instead of measuring.
              // TODO: proper fix
              this.rowHeaderWidth += 50;
            }
          }
        } else {
          this.rowHeaderWidth = 0;
        }
      }

      return this.rowHeaderWidth;
    }

    /**
     * @returns {Number}
     */
  }, {
    key: 'getViewportWidth',
    value: function getViewportWidth() {
      var containerWidth = this.getWorkspaceWidth();
      var rowHeaderWidth = undefined;

      if (containerWidth === Infinity) {
        return containerWidth;
      }
      rowHeaderWidth = this.getRowHeaderWidth();

      if (rowHeaderWidth > 0) {
        return containerWidth - rowHeaderWidth;
      }

      return containerWidth;
    }

    /**
     * Creates:
     *  - rowsRenderCalculator (before draw, to qualify rows for rendering)
     *  - rowsVisibleCalculator (after draw, to measure which rows are actually visible)
     *
     * @returns {WalkontableViewportRowsCalculator}
     */
  }, {
    key: 'createRowsCalculator',
    value: function createRowsCalculator() {
      var _this2 = this;

      var visible = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var height = undefined;
      var pos = undefined;
      var fixedRowsTop = undefined;
      var scrollbarHeight = undefined;

      this.rowHeaderWidth = NaN;

      if (this.wot.wtSettings.settings.renderAllRows) {
        height = Infinity;
      } else {
        height = this.getViewportHeight();
      }
      pos = (0, _helpersDomElement.getScrollTop)(this.wot.wtOverlays.mainTableScrollableElement) - this.wot.wtOverlays.topOverlay.getTableParentOffset();

      if (pos < 0) {
        pos = 0;
      }
      fixedRowsTop = this.wot.getSetting('fixedRowsTop');

      if (fixedRowsTop) {
        var fixedRowsHeight = this.wot.wtOverlays.topOverlay.sumCellSizes(0, fixedRowsTop);
        pos += fixedRowsHeight;
        height -= fixedRowsHeight;
      }

      if (this.wot.wtTable.holder.clientHeight !== this.wot.wtTable.holder.offsetHeight) {
        scrollbarHeight = (0, _helpersDomElement.getScrollbarWidth)();
      } else {
        scrollbarHeight = 0;
      }

      return new _calculatorViewportRows.WalkontableViewportRowsCalculator(height, pos, this.wot.getSetting('totalRows'), function (sourceRow) {
        return _this2.wot.wtTable.getRowHeight(sourceRow);
      }, visible ? null : this.wot.wtSettings.settings.viewportRowCalculatorOverride, visible, scrollbarHeight);
    }

    /**
     * Creates:
     *  - columnsRenderCalculator (before draw, to qualify columns for rendering)
     *  - columnsVisibleCalculator (after draw, to measure which columns are actually visible)
     *
     * @returns {WalkontableViewportRowsCalculator}
     */
  }, {
    key: 'createColumnsCalculator',
    value: function createColumnsCalculator() {
      var _this3 = this;

      var visible = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var width = this.getViewportWidth();
      var pos = undefined;
      var fixedColumnsLeft = undefined;

      this.columnHeaderHeight = NaN;

      pos = this.wot.wtOverlays.leftOverlay.getScrollPosition() - this.wot.wtOverlays.leftOverlay.getTableParentOffset();

      if (pos < 0) {
        pos = 0;
      }
      fixedColumnsLeft = this.wot.getSetting('fixedColumnsLeft');

      if (fixedColumnsLeft) {
        var fixedColumnsWidth = this.wot.wtOverlays.leftOverlay.sumCellSizes(0, fixedColumnsLeft);
        pos += fixedColumnsWidth;
        width -= fixedColumnsWidth;
      }
      if (this.wot.wtTable.holder.clientWidth !== this.wot.wtTable.holder.offsetWidth) {
        width -= (0, _helpersDomElement.getScrollbarWidth)();
      }

      return new _calculatorViewportColumns.WalkontableViewportColumnsCalculator(width, pos, this.wot.getSetting('totalColumns'), function (sourceCol) {
        return _this3.wot.wtTable.getColumnWidth(sourceCol);
      }, visible ? null : this.wot.wtSettings.settings.viewportColumnCalculatorOverride, visible, this.wot.getSetting('stretchH'));
    }

    /**
     * Creates rowsRenderCalculator and columnsRenderCalculator (before draw, to determine what rows and
     * cols should be rendered)
     *
     * @param fastDraw {Boolean} If `true`, will try to avoid full redraw and only update the border positions.
     *                           If `false` or `undefined`, will perform a full redraw
     * @returns fastDraw {Boolean} The fastDraw value, possibly modified
     */
  }, {
    key: 'createRenderCalculators',
    value: function createRenderCalculators() {
      var fastDraw = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (fastDraw) {
        var proposedRowsVisibleCalculator = this.createRowsCalculator(true);
        var proposedColumnsVisibleCalculator = this.createColumnsCalculator(true);

        if (!(this.areAllProposedVisibleRowsAlreadyRendered(proposedRowsVisibleCalculator) && this.areAllProposedVisibleColumnsAlreadyRendered(proposedColumnsVisibleCalculator))) {
          fastDraw = false;
        }
      }

      if (!fastDraw) {
        this.rowsRenderCalculator = this.createRowsCalculator();
        this.columnsRenderCalculator = this.createColumnsCalculator();
      }
      // delete temporarily to make sure that renderers always use rowsRenderCalculator, not rowsVisibleCalculator
      this.rowsVisibleCalculator = null;
      this.columnsVisibleCalculator = null;

      return fastDraw;
    }

    /**
     * Creates rowsVisibleCalculator and columnsVisibleCalculator (after draw, to determine what are
     * the actually visible rows and columns)
     */
  }, {
    key: 'createVisibleCalculators',
    value: function createVisibleCalculators() {
      this.rowsVisibleCalculator = this.createRowsCalculator(true);
      this.columnsVisibleCalculator = this.createColumnsCalculator(true);
    }

    /**
     * Returns information whether proposedRowsVisibleCalculator viewport
     * is contained inside rows rendered in previous draw (cached in rowsRenderCalculator)
     *
     * @param {Object} proposedRowsVisibleCalculator
     * @returns {Boolean} Returns `true` if all proposed visible rows are already rendered (meaning: redraw is not needed).
     *                    Returns `false` if at least one proposed visible row is not already rendered (meaning: redraw is needed)
     */
  }, {
    key: 'areAllProposedVisibleRowsAlreadyRendered',
    value: function areAllProposedVisibleRowsAlreadyRendered(proposedRowsVisibleCalculator) {
      if (this.rowsVisibleCalculator) {
        if (proposedRowsVisibleCalculator.startRow < this.rowsRenderCalculator.startRow || proposedRowsVisibleCalculator.startRow === this.rowsRenderCalculator.startRow && proposedRowsVisibleCalculator.startRow > 0) {
          return false;
        } else if (proposedRowsVisibleCalculator.endRow > this.rowsRenderCalculator.endRow || proposedRowsVisibleCalculator.endRow === this.rowsRenderCalculator.endRow && proposedRowsVisibleCalculator.endRow < this.wot.getSetting('totalRows') - 1) {
          return false;
        } else {
          return true;
        }
      }

      return false;
    }

    /**
     * Returns information whether proposedColumnsVisibleCalculator viewport
     * is contained inside column rendered in previous draw (cached in columnsRenderCalculator)
     *
     * @param {Object} proposedColumnsVisibleCalculator
     * @returns {Boolean} Returns `true` if all proposed visible columns are already rendered (meaning: redraw is not needed).
     *                    Returns `false` if at least one proposed visible column is not already rendered (meaning: redraw is needed)
     */
  }, {
    key: 'areAllProposedVisibleColumnsAlreadyRendered',
    value: function areAllProposedVisibleColumnsAlreadyRendered(proposedColumnsVisibleCalculator) {
      if (this.columnsVisibleCalculator) {
        if (proposedColumnsVisibleCalculator.startColumn < this.columnsRenderCalculator.startColumn || proposedColumnsVisibleCalculator.startColumn === this.columnsRenderCalculator.startColumn && proposedColumnsVisibleCalculator.startColumn > 0) {
          return false;
        } else if (proposedColumnsVisibleCalculator.endColumn > this.columnsRenderCalculator.endColumn || proposedColumnsVisibleCalculator.endColumn === this.columnsRenderCalculator.endColumn && proposedColumnsVisibleCalculator.endColumn < this.wot.getSetting('totalColumns') - 1) {
          return false;
        } else {
          return true;
        }
      }

      return false;
    }
  }]);

  return WalkontableViewport;
})();

exports.WalkontableViewport = WalkontableViewport;

window.WalkontableViewport = WalkontableViewport;

},{"./../../../eventManager":46,"./../../../helpers/dom/element":50,"./calculator/viewportColumns":9,"./calculator/viewportRows":10}],29:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

require('./shims/classes');

require('es6collections');

var _pluginHooks = require('./pluginHooks');

require('./core');

require('./renderers/_cellDecorator');

require('./cellTypes');

require('./../plugins/jqueryHandsontable');

// export helpers

var _helpersArray = require('./helpers/array');

var arrayHelpers = _interopRequireWildcard(_helpersArray);

var _helpersBrowser = require('./helpers/browser');

var browserHelpers = _interopRequireWildcard(_helpersBrowser);

var _helpersData = require('./helpers/data');

var dataHelpers = _interopRequireWildcard(_helpersData);

var _helpersFunction = require('./helpers/function');

var functionHelpers = _interopRequireWildcard(_helpersFunction);

var _helpersMixed = require('./helpers/mixed');

var mixedHelpers = _interopRequireWildcard(_helpersMixed);

var _helpersNumber = require('./helpers/number');

var numberHelpers = _interopRequireWildcard(_helpersNumber);

var _helpersObject = require('./helpers/object');

var objectHelpers = _interopRequireWildcard(_helpersObject);

var _helpersSetting = require('./helpers/setting');

var settingHelpers = _interopRequireWildcard(_helpersSetting);

var _helpersString = require('./helpers/string');

var stringHelpers = _interopRequireWildcard(_helpersString);

var _helpersUnicode = require('./helpers/unicode');

var unicodeHelpers = _interopRequireWildcard(_helpersUnicode);

// export helpers

var _helpersDomElement = require('./helpers/dom/element');

var domHelpers = _interopRequireWildcard(_helpersDomElement);

var _helpersDomEvent = require('./helpers/dom/event');

var domEventHelpers = _interopRequireWildcard(_helpersDomEvent);

var version = Handsontable.version;
var buildDate = Handsontable.buildDate;

window.Handsontable = function Handsontable(rootElement, userSettings) {
  var instance = new Handsontable.Core(rootElement, userSettings || {});

  instance.init();

  return instance;
};

Handsontable.version = version;
Handsontable.buildDate = buildDate;

Handsontable.plugins = {};

if (!Handsontable.hooks) {
  Handsontable.hooks = new _pluginHooks.Hooks();
}

var helpers = [arrayHelpers, browserHelpers, dataHelpers, functionHelpers, mixedHelpers, numberHelpers, objectHelpers, settingHelpers, stringHelpers, unicodeHelpers];

Handsontable.helper = {};

arrayHelpers.arrayEach(helpers, function (helper) {
  arrayHelpers.arrayEach(Object.getOwnPropertyNames(helper), function (key) {
    if (key.charAt(0) !== '_') {
      Handsontable.helper[key] = helper[key];
    }
  });
});

Handsontable.dom = {};
Handsontable.Dom = Handsontable.dom; // legacy support

arrayHelpers.arrayEach([domHelpers, domEventHelpers], function (helper) {
  arrayHelpers.arrayEach(Object.getOwnPropertyNames(helper), function (key) {
    if (key.charAt(0) !== '_') {
      Handsontable.dom[key] = helper[key];
    }
  });
});

},{"./../plugins/jqueryHandsontable":7,"./cellTypes":30,"./core":31,"./helpers/array":47,"./helpers/browser":48,"./helpers/data":49,"./helpers/dom/element":50,"./helpers/dom/event":51,"./helpers/function":52,"./helpers/mixed":53,"./helpers/number":54,"./helpers/object":55,"./helpers/setting":56,"./helpers/string":57,"./helpers/unicode":58,"./pluginHooks":60,"./renderers/_cellDecorator":63,"./shims/classes":70,"es6collections":3}],30:[function(require,module,exports){
/**
 * Cell type is just a shortcut for setting bunch of cellProperties (used in getCellMeta)
 */

'use strict';

var _helpersBrowser = require('./helpers/browser');

var _editors = require('./editors');

var _renderers = require('./renderers');

var _editorsAutocompleteEditor = require('./editors/autocompleteEditor');

var _editorsCheckboxEditor = require('./editors/checkboxEditor');

var _editorsDateEditor = require('./editors/dateEditor');

var _editorsDropdownEditor = require('./editors/dropdownEditor');

var _editorsHandsontableEditor = require('./editors/handsontableEditor');

var _editorsMobileTextEditor = require('./editors/mobileTextEditor');

var _editorsNumericEditor = require('./editors/numericEditor');

var _editorsPasswordEditor = require('./editors/passwordEditor');

var _editorsSelectEditor = require('./editors/selectEditor');

var _editorsTextEditor = require('./editors/textEditor');

var _renderersAutocompleteRenderer = require('./renderers/autocompleteRenderer');

var _renderersCheckboxRenderer = require('./renderers/checkboxRenderer');

var _renderersHtmlRenderer = require('./renderers/htmlRenderer');

var _renderersNumericRenderer = require('./renderers/numericRenderer');

var _renderersPasswordRenderer = require('./renderers/passwordRenderer');

var _renderersTextRenderer = require('./renderers/textRenderer');

var _validatorsAutocompleteValidator = require('./validators/autocompleteValidator');

var _validatorsDateValidator = require('./validators/dateValidator');

var _validatorsNumericValidator = require('./validators/numericValidator');

Handsontable.mobileBrowser = (0, _helpersBrowser.isMobileBrowser)();

Handsontable.AutocompleteCell = {
  editor: (0, _editors.getEditorConstructor)('autocomplete'),
  renderer: (0, _renderers.getRenderer)('autocomplete'),
  validator: Handsontable.AutocompleteValidator
};

Handsontable.CheckboxCell = {
  editor: (0, _editors.getEditorConstructor)('checkbox'),
  renderer: (0, _renderers.getRenderer)('checkbox')
};

Handsontable.TextCell = {
  editor: Handsontable.mobileBrowser ? (0, _editors.getEditorConstructor)('mobile') : (0, _editors.getEditorConstructor)('text'),
  renderer: (0, _renderers.getRenderer)('text')
};

Handsontable.NumericCell = {
  editor: (0, _editors.getEditorConstructor)('numeric'),
  renderer: (0, _renderers.getRenderer)('numeric'),
  validator: Handsontable.NumericValidator,
  dataType: 'number'
};

Handsontable.DateCell = {
  editor: (0, _editors.getEditorConstructor)('date'),
  validator: Handsontable.DateValidator,
  // displays small gray arrow on right side of the cell
  renderer: (0, _renderers.getRenderer)('autocomplete')
};

Handsontable.HandsontableCell = {
  editor: (0, _editors.getEditorConstructor)('handsontable'),
  //displays small gray arrow on right side of the cell
  renderer: (0, _renderers.getRenderer)('autocomplete')
};

Handsontable.PasswordCell = {
  editor: (0, _editors.getEditorConstructor)('password'),
  renderer: (0, _renderers.getRenderer)('password'),
  copyable: false
};

Handsontable.DropdownCell = {
  editor: (0, _editors.getEditorConstructor)('dropdown'),
  //displays small gray arrow on right side of the cell
  renderer: (0, _renderers.getRenderer)('autocomplete'),
  validator: Handsontable.AutocompleteValidator
};

//here setup the friendly aliases that are used by cellProperties.type
Handsontable.cellTypes = {
  text: Handsontable.TextCell,
  date: Handsontable.DateCell,
  numeric: Handsontable.NumericCell,
  checkbox: Handsontable.CheckboxCell,
  autocomplete: Handsontable.AutocompleteCell,
  handsontable: Handsontable.HandsontableCell,
  password: Handsontable.PasswordCell,
  dropdown: Handsontable.DropdownCell
};

//here setup the friendly aliases that are used by cellProperties.renderer and cellProperties.editor
Handsontable.cellLookup = {
  validator: {
    numeric: Handsontable.NumericValidator,
    autocomplete: Handsontable.AutocompleteValidator
  }
};

},{"./editors":34,"./editors/autocompleteEditor":36,"./editors/checkboxEditor":37,"./editors/dateEditor":38,"./editors/dropdownEditor":39,"./editors/handsontableEditor":40,"./editors/mobileTextEditor":41,"./editors/numericEditor":42,"./editors/passwordEditor":43,"./editors/selectEditor":44,"./editors/textEditor":45,"./helpers/browser":48,"./renderers":62,"./renderers/autocompleteRenderer":64,"./renderers/checkboxRenderer":65,"./renderers/htmlRenderer":66,"./renderers/numericRenderer":67,"./renderers/passwordRenderer":68,"./renderers/textRenderer":69,"./validators/autocompleteValidator":72,"./validators/dateValidator":73,"./validators/numericValidator":74}],31:[function(require,module,exports){
'use strict';function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}var _numeral=require('numeral');var _numeral2=_interopRequireDefault(_numeral);var _helpersDomElement=require('./helpers/dom/element');var _helpersSetting=require('./helpers/setting');var _dataMap=require('./dataMap');var _editorManager=require('./editorManager');var _eventManager=require('./eventManager');var _helpersObject=require('./helpers/object');var _plugins=require('./plugins');var _renderers=require('./renderers');var _helpersString=require('./helpers/string');var _tableView=require('./tableView');var _helpersData=require('./helpers/data');var _rdpartyWalkontableSrcCellCoords=require('./3rdparty/walkontable/src/cell/coords');var _rdpartyWalkontableSrcCellRange=require('./3rdparty/walkontable/src/cell/range');var _rdpartyWalkontableSrcSelection=require('./3rdparty/walkontable/src/selection');var _rdpartyWalkontableSrcCalculatorViewportColumns=require('./3rdparty/walkontable/src/calculator/viewportColumns');Handsontable.activeGuid = null; /**
 * Handsontable constructor
 *
 * @core
 * @dependencies numeral
 * @constructor Core
 * @description
 *
 * After Handsontable is constructed, you can modify the grid behavior using the available public methods.
 *
 * ---
 * ## How to call methods
 *
 * These are 2 equal ways to call a Handsontable method:
 *
 * ```js
 * // all following examples assume that you constructed Handsontable like this
 * var ht = new Handsontable(document.getElementById('example1'), options);
 *
 * // now, to use setDataAtCell method, you can either:
 * ht.setDataAtCell(0, 0, 'new value');
 * ```
 *
 * Alternatively, you can call the method using jQuery wrapper (__obsolete__, requires initialization using our jQuery guide
 * ```js
 *   $('#example1').handsontable('setDataAtCell', 0, 0, 'new value');
 * ```
 * ---
 */Handsontable.Core = function Core(rootElement,userSettings){var priv,datamap,grid,selection,editorManager,instance=this,GridSettings=function GridSettings(){},eventManager=(0,_eventManager.eventManager)(instance);(0,_helpersObject.extend)(GridSettings.prototype,DefaultSettings.prototype); //create grid settings as a copy of default settings
(0,_helpersObject.extend)(GridSettings.prototype,userSettings); //overwrite defaults with user settings
(0,_helpersObject.extend)(GridSettings.prototype,expandType(userSettings));this.rootElement = rootElement;this.isHotTableEnv = (0,_helpersDomElement.isChildOfWebComponentTable)(this.rootElement);Handsontable.eventManager.isHotTableEnv = this.isHotTableEnv;this.container = document.createElement('DIV');this.renderCall = false;rootElement.insertBefore(this.container,rootElement.firstChild);this.guid = 'ht_' + (0,_helpersString.randomString)(); //this is the namespace for global events
if(!this.rootElement.id || this.rootElement.id.substring(0,3) === "ht_"){this.rootElement.id = this.guid; //if root element does not have an id, assign a random id
}priv = {cellSettings:[],columnSettings:[],columnsSettingConflicts:['data','width'],settings:new GridSettings(), // current settings instance
selRange:null, //exposed by public method `getSelectedRange`
isPopulated:null,scrollable:null,firstRun:true};grid = { /**
     * Inserts or removes rows and columns
     *
     * @memberof Core#
     * @function alter
     * @private
     * @param {String} action Possible values: "insert_row", "insert_col", "remove_row", "remove_col"
     * @param {Number} index
     * @param {Number} amount
     * @param {String} [source] Optional. Source of hook runner.
     * @param {Boolean} [keepEmptyRows] Optional. Flag for preventing deletion of empty rows.
     */alter:function alter(action,index,amount,source,keepEmptyRows){var delta;amount = amount || 1;switch(action){case "insert_row":if(instance.getSettings().maxRows === instance.countRows()){return;}delta = datamap.createRow(index,amount);if(delta){if(selection.isSelected() && priv.selRange.from.row >= index){priv.selRange.from.row = priv.selRange.from.row + delta;selection.transformEnd(delta,0); //will call render() internally
}else {selection.refreshBorders(); //it will call render and prepare methods
}}break;case "insert_col": // //column order may have changes, so we need to translate the selection column index -> source array index
// index = instance.runHooksAndReturn('modifyCol', index);
delta = datamap.createCol(index,amount);if(delta){if(Array.isArray(instance.getSettings().colHeaders)){var spliceArray=[index,0];spliceArray.length += delta; //inserts empty (undefined) elements at the end of an array
Array.prototype.splice.apply(instance.getSettings().colHeaders,spliceArray); //inserts empty (undefined) elements into the colHeader array
}if(selection.isSelected() && priv.selRange.from.col >= index){priv.selRange.from.col = priv.selRange.from.col + delta;selection.transformEnd(0,delta); //will call render() internally
}else {selection.refreshBorders(); //it will call render and prepare methods
}}break;case "remove_row": //column order may have changes, so we need to translate the selection column index -> source array index
index = instance.runHooks('modifyCol',index);datamap.removeRow(index,amount);priv.cellSettings.splice(index,amount);var fixedRowsTop=instance.getSettings().fixedRowsTop;if(fixedRowsTop >= index + 1){instance.getSettings().fixedRowsTop -= Math.min(amount,fixedRowsTop - index);}grid.adjustRowsAndCols();selection.refreshBorders(); //it will call render and prepare methods
break;case "remove_col":datamap.removeCol(index,amount);for(var row=0,len=datamap.getAll().length;row < len;row++) {if(row in priv.cellSettings){ //if row hasn't been rendered it wouldn't have cellSettings
priv.cellSettings[row].splice(index,amount);}}var fixedColumnsLeft=instance.getSettings().fixedColumnsLeft;if(fixedColumnsLeft >= index + 1){instance.getSettings().fixedColumnsLeft -= Math.min(amount,fixedColumnsLeft - index);}if(Array.isArray(instance.getSettings().colHeaders)){if(typeof index == 'undefined'){index = -1;}instance.getSettings().colHeaders.splice(index,amount);} //priv.columnSettings.splice(index, amount);
grid.adjustRowsAndCols();selection.refreshBorders(); //it will call render and prepare methods
break; /* jshint ignore:start */default:throw new Error('There is no such action "' + action + '"');break; /* jshint ignore:end */}if(!keepEmptyRows){grid.adjustRowsAndCols(); //makes sure that we did not add rows that will be removed in next refresh
}}, /**
     * Makes sure there are empty rows at the bottom of the table
     */adjustRowsAndCols:function adjustRowsAndCols(){if(priv.settings.minRows){ // should I add empty rows to data source to meet minRows?
var rows=instance.countRows();if(rows < priv.settings.minRows){for(var r=0,minRows=priv.settings.minRows;r < minRows - rows;r++) {datamap.createRow(instance.countRows(),1,true);}}}if(priv.settings.minSpareRows){var emptyRows=instance.countEmptyRows(true); // should I add empty rows to meet minSpareRows?
if(emptyRows < priv.settings.minSpareRows){for(;emptyRows < priv.settings.minSpareRows && instance.countRows() < priv.settings.maxRows;emptyRows++) {datamap.createRow(instance.countRows(),1,true);}}}{var emptyCols=undefined; // count currently empty cols
if(priv.settings.minCols || priv.settings.minSpareCols){emptyCols = instance.countEmptyCols(true);} // should I add empty cols to meet minCols?
if(priv.settings.minCols && !priv.settings.columns && instance.countCols() < priv.settings.minCols){for(;instance.countCols() < priv.settings.minCols;emptyCols++) {datamap.createCol(instance.countCols(),1,true);}} // should I add empty cols to meet minSpareCols?
if(priv.settings.minSpareCols && !priv.settings.columns && instance.dataType === 'array' && emptyCols < priv.settings.minSpareCols){for(;emptyCols < priv.settings.minSpareCols && instance.countCols() < priv.settings.maxCols;emptyCols++) {datamap.createCol(instance.countCols(),1,true);}}}var rowCount=instance.countRows();var colCount=instance.countCols();if(rowCount === 0 || colCount === 0){selection.deselect();}if(selection.isSelected()){var selectionChanged=false;var fromRow=priv.selRange.from.row;var fromCol=priv.selRange.from.col;var toRow=priv.selRange.to.row;var toCol=priv.selRange.to.col; // if selection is outside, move selection to last row
if(fromRow > rowCount - 1){fromRow = rowCount - 1;selectionChanged = true;if(toRow > fromRow){toRow = fromRow;}}else if(toRow > rowCount - 1){toRow = rowCount - 1;selectionChanged = true;if(fromRow > toRow){fromRow = toRow;}} // if selection is outside, move selection to last row
if(fromCol > colCount - 1){fromCol = colCount - 1;selectionChanged = true;if(toCol > fromCol){toCol = fromCol;}}else if(toCol > colCount - 1){toCol = colCount - 1;selectionChanged = true;if(fromCol > toCol){fromCol = toCol;}}if(selectionChanged){instance.selectCell(fromRow,fromCol,toRow,toCol);}}if(instance.view){instance.view.wt.wtOverlays.adjustElementsSize();}}, /**
     * Populate cells at position with 2d array
     *
     * @private
     * @param {Object} start Start selection position
     * @param {Array} input 2d array
     * @param {Object} [end] End selection position (only for drag-down mode)
     * @param {String} [source="populateFromArray"]
     * @param {String} [method="overwrite"]
     * @param {String} direction (left|right|up|down)
     * @param {Array} deltas array
     * @returns {Object|undefined} ending td in pasted area (only if any cell was changed)
     */populateFromArray:function populateFromArray(start,input,end,source,method,direction,deltas){var r,rlen,c,clen,setData=[],current={};rlen = input.length;if(rlen === 0){return false;}var repeatCol,repeatRow,cmax,rmax; // insert data with specified pasteMode method
switch(method){case 'shift_down':repeatCol = end?end.col - start.col + 1:0;repeatRow = end?end.row - start.row + 1:0;input = (0,_helpersData.translateRowsToColumns)(input);for(c = 0,clen = input.length,cmax = Math.max(clen,repeatCol);c < cmax;c++) {if(c < clen){for(r = 0,rlen = input[c].length;r < repeatRow - rlen;r++) {input[c].push(input[c][r % rlen]);}input[c].unshift(start.col + c,start.row,0);instance.spliceCol.apply(instance,input[c]);}else {input[c % clen][0] = start.col + c;instance.spliceCol.apply(instance,input[c % clen]);}}break;case 'shift_right':repeatCol = end?end.col - start.col + 1:0;repeatRow = end?end.row - start.row + 1:0;for(r = 0,rlen = input.length,rmax = Math.max(rlen,repeatRow);r < rmax;r++) {if(r < rlen){for(c = 0,clen = input[r].length;c < repeatCol - clen;c++) {input[r].push(input[r][c % clen]);}input[r].unshift(start.row + r,start.col,0);instance.spliceRow.apply(instance,input[r]);}else {input[r % rlen][0] = start.row + r;instance.spliceRow.apply(instance,input[r % rlen]);}}break; /* jshint ignore:start */case 'overwrite':default: /* jshint ignore:end */ // overwrite and other not specified options
current.row = start.row;current.col = start.col;var iterators={row:0,col:0}, // number of packages
selected={ // selected range
row:end && start?end.row - start.row + 1:1,col:end && start?end.col - start.col + 1:1},pushData=true;if(['up','left'].indexOf(direction) !== -1){iterators = {row:Math.ceil(selected.row / rlen) || 1,col:Math.ceil(selected.col / input[0].length) || 1};}else if(['down','right'].indexOf(direction) !== -1){iterators = {row:1,col:1};}for(r = 0;r < rlen;r++) {if(end && current.row > end.row || !priv.settings.allowInsertRow && current.row > instance.countRows() - 1 || current.row >= priv.settings.maxRows){break;}current.col = start.col;clen = input[r]?input[r].length:0;for(c = 0;c < clen;c++) {if(end && current.col > end.col || !priv.settings.allowInsertColumn && current.col > instance.countCols() - 1 || current.col >= priv.settings.maxCols){break;}if(!instance.getCellMeta(current.row,current.col).readOnly){var result,value=input[r][c],orgValue=instance.getDataAtCell(current.row,current.col),index={row:r,col:c},valueSchema,orgValueSchema;if(source === 'autofill'){result = instance.runHooks('beforeAutofillInsidePopulate',index,direction,input,deltas,iterators,selected);if(result){iterators = typeof result.iterators !== 'undefined'?result.iterators:iterators;value = typeof result.value !== 'undefined'?result.value:value;}}if(value !== null && typeof value === 'object'){if(orgValue === null || typeof orgValue !== 'object'){pushData = false;}else {orgValueSchema = (0,_helpersObject.duckSchema)(orgValue[0] || orgValue);valueSchema = (0,_helpersObject.duckSchema)(value[0] || value); /* jshint -W073 */if((0,_helpersObject.isObjectEquals)(orgValueSchema,valueSchema)){value = (0,_helpersObject.deepClone)(value);}else {pushData = false;}}}else if(orgValue !== null && typeof orgValue === 'object'){pushData = false;}if(pushData){setData.push([current.row,current.col,value]);}pushData = true;}current.col++;if(end && c === clen - 1){c = -1;if(['down','right'].indexOf(direction) !== -1){iterators.col++;}else if(['up','left'].indexOf(direction) !== -1){if(iterators.col > 1){iterators.col--;}}}}current.row++;iterators.col = 1;if(end && r === rlen - 1){r = -1;if(['down','right'].indexOf(direction) !== -1){iterators.row++;}else if(['up','left'].indexOf(direction) !== -1){if(iterators.row > 1){iterators.row--;}}}}instance.setDataAtCell(setData,null,null,source || 'populateFromArray');break;}}};this.selection = selection = { //this public assignment is only temporary
inProgress:false,selectedHeader:{cols:false,rows:false}, /**
     * @param {Boolean} rows
     * @param {Boolean} cols
     */setSelectedHeaders:function setSelectedHeaders(rows,cols){instance.selection.selectedHeader.rows = rows;instance.selection.selectedHeader.cols = cols;}, /**
     * Sets inProgress to `true`. This enables onSelectionEnd and onSelectionEndByProp to function as desired.
     */begin:function begin(){instance.selection.inProgress = true;}, /**
     * Sets inProgress to `false`. Triggers onSelectionEnd and onSelectionEndByProp.
     */finish:function finish(){var sel=instance.getSelected();Handsontable.hooks.run(instance,"afterSelectionEnd",sel[0],sel[1],sel[2],sel[3]);Handsontable.hooks.run(instance,"afterSelectionEndByProp",sel[0],instance.colToProp(sel[1]),sel[2],instance.colToProp(sel[3]));instance.selection.inProgress = false;}, /**
     * @returns {Boolean}
     */isInProgress:function isInProgress(){return instance.selection.inProgress;}, /**
     * Starts selection range on given td object.
     *
     * @param {WalkontableCellCoords} coords
     * @param keepEditorOpened
     */setRangeStart:function setRangeStart(coords,keepEditorOpened){Handsontable.hooks.run(instance,"beforeSetRangeStart",coords);priv.selRange = new _rdpartyWalkontableSrcCellRange.WalkontableCellRange(coords,coords,coords);selection.setRangeEnd(coords,null,keepEditorOpened);}, /**
     * Ends selection range on given td object.
     *
     * @param {WalkontableCellCoords} coords
     * @param {Boolean} [scrollToCell=true] If `true`, viewport will be scrolled to range end
     * @param {Boolean} [keepEditorOpened] If `true`, cell editor will be still opened after changing selection range
     */setRangeEnd:function setRangeEnd(coords,scrollToCell,keepEditorOpened){if(priv.selRange === null){return;}var disableVisualSelection,isHeaderSelected=false,areCoordsPositive=true;var firstVisibleRow=instance.view.wt.wtTable.getFirstVisibleRow();var firstVisibleColumn=instance.view.wt.wtTable.getFirstVisibleColumn();var newRangeCoords={row:null,col:null}; //trigger handlers
Handsontable.hooks.run(instance,"beforeSetRangeEnd",coords);instance.selection.begin();newRangeCoords.row = coords.row < 0?firstVisibleRow:coords.row;newRangeCoords.col = coords.col < 0?firstVisibleColumn:coords.col;priv.selRange.to = new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(newRangeCoords.row,newRangeCoords.col);if(!priv.settings.multiSelect){priv.selRange.from = coords;} // set up current selection
instance.view.wt.selections.current.clear();disableVisualSelection = instance.getCellMeta(priv.selRange.highlight.row,priv.selRange.highlight.col).disableVisualSelection;if(typeof disableVisualSelection === 'string'){disableVisualSelection = [disableVisualSelection];}if(disableVisualSelection === false || Array.isArray(disableVisualSelection) && disableVisualSelection.indexOf('current') === -1){instance.view.wt.selections.current.add(priv.selRange.highlight);} // set up area selection
instance.view.wt.selections.area.clear();if((disableVisualSelection === false || Array.isArray(disableVisualSelection) && disableVisualSelection.indexOf('area') === -1) && selection.isMultiple()){instance.view.wt.selections.area.add(priv.selRange.from);instance.view.wt.selections.area.add(priv.selRange.to);} // set up highlight
if(priv.settings.currentRowClassName || priv.settings.currentColClassName){instance.view.wt.selections.highlight.clear();instance.view.wt.selections.highlight.add(priv.selRange.from);instance.view.wt.selections.highlight.add(priv.selRange.to);} // trigger handlers
Handsontable.hooks.run(instance,"afterSelection",priv.selRange.from.row,priv.selRange.from.col,priv.selRange.to.row,priv.selRange.to.col);Handsontable.hooks.run(instance,"afterSelectionByProp",priv.selRange.from.row,datamap.colToProp(priv.selRange.from.col),priv.selRange.to.row,datamap.colToProp(priv.selRange.to.col));if(priv.selRange.from.row === 0 && priv.selRange.to.row === instance.countRows() - 1 && instance.countRows() > 1 || priv.selRange.from.col === 0 && priv.selRange.to.col === instance.countCols() - 1 && instance.countCols() > 1){isHeaderSelected = true;}if(coords.row < 0 || coords.col < 0){areCoordsPositive = false;}if(scrollToCell !== false && !isHeaderSelected && areCoordsPositive){if(priv.selRange.from && !selection.isMultiple()){instance.view.scrollViewport(priv.selRange.from);}else {instance.view.scrollViewport(coords);}}selection.refreshBorders(null,keepEditorOpened);}, /**
     * Destroys editor, redraws borders around cells, prepares editor.
     *
     * @param {Boolean} [revertOriginal]
     * @param {Boolean} [keepEditor]
     */refreshBorders:function refreshBorders(revertOriginal,keepEditor){if(!keepEditor){editorManager.destroyEditor(revertOriginal);}instance.view.render();if(selection.isSelected() && !keepEditor){editorManager.prepareEditor();}}, /**
     * Returns information if we have a multiselection.
     *
     * @returns {Boolean}
     */isMultiple:function isMultiple(){var isMultiple=!(priv.selRange.to.col === priv.selRange.from.col && priv.selRange.to.row === priv.selRange.from.row),modifier=Handsontable.hooks.run(instance,'afterIsMultipleSelection',isMultiple);if(isMultiple){return modifier;}}, /**
     * Selects cell relative to current cell (if possible).
     */transformStart:function transformStart(rowDelta,colDelta,force,keepEditorOpened){var delta=new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(rowDelta,colDelta),rowTransformDir=0,colTransformDir=0,totalRows,totalCols,coords;instance.runHooks('modifyTransformStart',delta);totalRows = instance.countRows();totalCols = instance.countCols(); /* jshint ignore:start */if(priv.selRange.highlight.row + rowDelta > totalRows - 1){if(force && priv.settings.minSpareRows > 0){instance.alter("insert_row",totalRows);totalRows = instance.countRows();}else if(priv.settings.autoWrapCol){delta.row = 1 - totalRows;delta.col = priv.selRange.highlight.col + delta.col == totalCols - 1?1 - totalCols:1;}}else if(priv.settings.autoWrapCol && priv.selRange.highlight.row + delta.row < 0 && priv.selRange.highlight.col + delta.col >= 0){delta.row = totalRows - 1;delta.col = priv.selRange.highlight.col + delta.col == 0?totalCols - 1:-1;}if(priv.selRange.highlight.col + delta.col > totalCols - 1){if(force && priv.settings.minSpareCols > 0){instance.alter("insert_col",totalCols);totalCols = instance.countCols();}else if(priv.settings.autoWrapRow){delta.row = priv.selRange.highlight.row + delta.row == totalRows - 1?1 - totalRows:1;delta.col = 1 - totalCols;}}else if(priv.settings.autoWrapRow && priv.selRange.highlight.col + delta.col < 0 && priv.selRange.highlight.row + delta.row >= 0){delta.row = priv.selRange.highlight.row + delta.row == 0?totalRows - 1:-1;delta.col = totalCols - 1;} /* jshint ignore:end */coords = new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(priv.selRange.highlight.row + delta.row,priv.selRange.highlight.col + delta.col);if(coords.row < 0){rowTransformDir = -1;coords.row = 0;}else if(coords.row > 0 && coords.row >= totalRows){rowTransformDir = 1;coords.row = totalRows - 1;}if(coords.col < 0){colTransformDir = -1;coords.col = 0;}else if(coords.col > 0 && coords.col >= totalCols){colTransformDir = 1;coords.col = totalCols - 1;}instance.runHooks('afterModifyTransformStart',coords,rowTransformDir,colTransformDir);selection.setRangeStart(coords,keepEditorOpened);}, /**
     * Sets selection end cell relative to current selection end cell (if possible).
     */transformEnd:function transformEnd(rowDelta,colDelta){var delta=new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(rowDelta,colDelta),rowTransformDir=0,colTransformDir=0,totalRows,totalCols,coords;instance.runHooks('modifyTransformEnd',delta);totalRows = instance.countRows();totalCols = instance.countCols();coords = new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(priv.selRange.to.row + delta.row,priv.selRange.to.col + delta.col);if(coords.row < 0){rowTransformDir = -1;coords.row = 0;}else if(coords.row > 0 && coords.row >= totalRows){rowTransformDir = 1;coords.row = totalRows - 1;}if(coords.col < 0){colTransformDir = -1;coords.col = 0;}else if(coords.col > 0 && coords.col >= totalCols){colTransformDir = 1;coords.col = totalCols - 1;}instance.runHooks('afterModifyTransformEnd',coords,rowTransformDir,colTransformDir);selection.setRangeEnd(coords,true);}, /**
     * Returns `true` if currently there is a selection on screen, `false` otherwise.
     *
     * @returns {Boolean}
     */isSelected:function isSelected(){return priv.selRange !== null;}, /**
     * Returns `true` if coords is within current selection coords.
     *
     * @param {WalkontableCellCoords} coords
     * @returns {Boolean}
     */inInSelection:function inInSelection(coords){if(!selection.isSelected()){return false;}return priv.selRange.includes(coords);}, /**
     * Deselects all selected cells
     */deselect:function deselect(){if(!selection.isSelected()){return;}instance.selection.inProgress = false; //needed by HT inception
priv.selRange = null;instance.view.wt.selections.current.clear();instance.view.wt.selections.area.clear();if(priv.settings.currentRowClassName || priv.settings.currentColClassName){instance.view.wt.selections.highlight.clear();}editorManager.destroyEditor();selection.refreshBorders();Handsontable.hooks.run(instance,'afterDeselect');}, /**
     * Select all cells
     */selectAll:function selectAll(){if(!priv.settings.multiSelect){return;}selection.setRangeStart(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(0,0));selection.setRangeEnd(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(instance.countRows() - 1,instance.countCols() - 1),false);}, /**
     * Deletes data from selected cells
     */empty:function empty(){if(!selection.isSelected()){return;}var topLeft=priv.selRange.getTopLeftCorner();var bottomRight=priv.selRange.getBottomRightCorner();var r,c,changes=[];for(r = topLeft.row;r <= bottomRight.row;r++) {for(c = topLeft.col;c <= bottomRight.col;c++) {if(!instance.getCellMeta(r,c).readOnly){changes.push([r,c,'']);}}}instance.setDataAtCell(changes);}};this.init = function(){Handsontable.hooks.run(instance,'beforeInit');if(Handsontable.mobileBrowser){(0,_helpersDomElement.addClass)(instance.rootElement,'mobile');}this.updateSettings(priv.settings,true);this.view = new _tableView.TableView(this);editorManager = new _editorManager.EditorManager(instance,priv,selection,datamap);this.forceFullRender = true; //used when data was changed
Handsontable.hooks.run(instance,'init');this.view.render();if(typeof priv.firstRun === 'object'){Handsontable.hooks.run(instance,'afterChange',priv.firstRun[0],priv.firstRun[1]);priv.firstRun = false;}Handsontable.hooks.run(instance,'afterInit');};function ValidatorsQueue(){ //moved this one level up so it can be used in any function here. Probably this should be moved to a separate file
var resolved=false;return {validatorsInQueue:0,valid:true,addValidatorToQueue:function addValidatorToQueue(){this.validatorsInQueue++;resolved = false;},removeValidatorFormQueue:function removeValidatorFormQueue(){this.validatorsInQueue = this.validatorsInQueue - 1 < 0?0:this.validatorsInQueue - 1;this.checkIfQueueIsEmpty();},onQueueEmpty:function onQueueEmpty(valid){},checkIfQueueIsEmpty:function checkIfQueueIsEmpty(){ /* jshint ignore:start */if(this.validatorsInQueue == 0 && resolved == false){resolved = true;this.onQueueEmpty(this.valid);} /* jshint ignore:end */}};}function validateChanges(changes,source,callback){var waitingForValidator=new ValidatorsQueue();waitingForValidator.onQueueEmpty = resolve;for(var i=changes.length - 1;i >= 0;i--) {if(changes[i] === null){changes.splice(i,1);}else {var row=changes[i][0];var col=datamap.propToCol(changes[i][1]); //column order may have changes, so we need to translate physical col index (stored in datasource) to logical (displayed to user)
var logicalCol=instance.runHooks('modifyCol',col);var cellProperties=instance.getCellMeta(row,logicalCol);if(cellProperties.type === 'numeric' && typeof changes[i][3] === 'string'){if(changes[i][3].length > 0 && (/^-?[\d\s]*(\.|\,)?\d*$/.test(changes[i][3]) || cellProperties.format)){var len=changes[i][3].length;if(typeof cellProperties.language == 'undefined'){_numeral2['default'].language('en');} //this input in format XXXX.XX is likely to come from paste. Let's parse it using international rules
else if(changes[i][3].indexOf(".") === len - 3 && changes[i][3].indexOf(",") === -1){_numeral2['default'].language('en');}else {_numeral2['default'].language(cellProperties.language);}if(_numeral2['default'].validate(changes[i][3])){changes[i][3] = (0,_numeral2['default'])().unformat(changes[i][3]);}}} /* jshint ignore:start */if(instance.getCellValidator(cellProperties)){waitingForValidator.addValidatorToQueue();instance.validateCell(changes[i][3],cellProperties,(function(i,cellProperties){return function(result){if(typeof result !== 'boolean'){throw new Error("Validation error: result is not boolean");}if(result === false && cellProperties.allowInvalid === false){changes.splice(i,1); // cancel the change
cellProperties.valid = true; // we cancelled the change, so cell value is still valid
--i;}waitingForValidator.removeValidatorFormQueue();};})(i,cellProperties),source);} /* jshint ignore:end */}}waitingForValidator.checkIfQueueIsEmpty();function resolve(){var beforeChangeResult;if(changes.length){beforeChangeResult = Handsontable.hooks.run(instance,"beforeChange",changes,source);if(typeof beforeChangeResult === 'function'){console.warn("Your beforeChange callback returns a function. It's not supported since Handsontable 0.12.1 (and the returned function will not be executed).");}else if(beforeChangeResult === false){changes.splice(0,changes.length); //invalidate all changes (remove everything from array)
}}callback(); //called when async validators are resolved and beforeChange was not async
}} /**
   * Internal function to apply changes. Called after validateChanges
   *
   * @private
   * @param {Array} changes Array in form of [row, prop, oldValue, newValue]
   * @param {String} source String that identifies how this change will be described in changes array (useful in onChange callback)
   * @fires Hooks#beforeChangeRender
   * @fires Hooks#afterChange
   */function applyChanges(changes,source){var i=changes.length - 1;if(i < 0){return;}for(;0 <= i;i--) {if(changes[i] === null){changes.splice(i,1);continue;}if(changes[i][2] == null && changes[i][3] == null){continue;}if(priv.settings.allowInsertRow){while(changes[i][0] > instance.countRows() - 1) {datamap.createRow();}}if(instance.dataType === 'array' && priv.settings.allowInsertColumn){while(datamap.propToCol(changes[i][1]) > instance.countCols() - 1) {datamap.createCol();}}datamap.set(changes[i][0],changes[i][1],changes[i][3]);}instance.forceFullRender = true; //used when data was changed
grid.adjustRowsAndCols();Handsontable.hooks.run(instance,'beforeChangeRender',changes,source);selection.refreshBorders(null,true);instance.view.wt.wtOverlays.adjustElementsSize();Handsontable.hooks.run(instance,'afterChange',changes,source || 'edit');}this.validateCell = function(value,cellProperties,callback,source){var validator=instance.getCellValidator(cellProperties);function done(valid){var col=cellProperties.col,row=cellProperties.row,td=instance.getCell(row,col,true);if(td){instance.view.wt.wtSettings.settings.cellRenderer(row,col,td);}callback(valid);}if(Object.prototype.toString.call(validator) === '[object RegExp]'){validator = (function(validator){return function(value,callback){callback(validator.test(value));};})(validator);}if(typeof validator == 'function'){value = Handsontable.hooks.run(instance,"beforeValidate",value,cellProperties.row,cellProperties.prop,source); // To provide consistent behaviour, validation should be always asynchronous
instance._registerTimeout(setTimeout(function(){validator.call(cellProperties,value,function(valid){valid = Handsontable.hooks.run(instance,"afterValidate",valid,value,cellProperties.row,cellProperties.prop,source);cellProperties.valid = valid;done(valid);Handsontable.hooks.run(instance,"postAfterValidate",valid,value,cellProperties.row,cellProperties.prop,source);});},0));}else { //resolve callback even if validator function was not found
cellProperties.valid = true;done(cellProperties.valid);}};function setDataInputToArray(row,propOrCol,value){if(typeof row === "object"){ //is it an array of changes
return row;}else {return [[row,propOrCol,value]];}} /**
   * @description
   * Set new value to a cell. To change many cells at once, pass an array of `changes` in format `[[row, col, value], ...]` as
   * the only parameter. `col` is the index of __visible__ column (note that if columns were reordered,
   * the current order will be used). `source` is a flag for before/afterChange events. If you pass only array of
   * changes then `source` could be set as second parameter.
   *
   * @memberof Core#
   * @function setDataAtCell
   * @param {Number|Array} row or array of changes in format `[[row, col, value], ...]`
   * @param {Number|String} col or source String
   * @param {String} value
   * @param {String} [source] String that identifies how this change will be described in changes array (useful in onChange callback)
   */this.setDataAtCell = function(row,col,value,source){var input=setDataInputToArray(row,col,value),i,ilen,changes=[],prop;for(i = 0,ilen = input.length;i < ilen;i++) {if(typeof input[i] !== 'object'){throw new Error('Method `setDataAtCell` accepts row number or changes array of arrays as its first parameter');}if(typeof input[i][1] !== 'number'){throw new Error('Method `setDataAtCell` accepts row and column number as its parameters. If you want to use object property name, use method `setDataAtRowProp`');}prop = datamap.colToProp(input[i][1]);changes.push([input[i][0],prop,datamap.get(input[i][0],prop),input[i][2]]);}if(!source && typeof row === "object"){source = col;}validateChanges(changes,source,function(){applyChanges(changes,source);});}; /**
   * Same as above, except instead of `col`, you provide name of the object property (e.g. `[0, 'first.name', 'Jennifer']`).
   *
   * @memberof Core#
   * @function setDataAtRowProp
   * @param {Number|Array} row or array of changes in format `[[row, prop, value], ...]`
   * @param {String} prop or source String
   * @param {String} value
   * @param {String} [source] String that identifies how this change will be described in changes array (useful in onChange callback)
   */this.setDataAtRowProp = function(row,prop,value,source){var input=setDataInputToArray(row,prop,value),i,ilen,changes=[];for(i = 0,ilen = input.length;i < ilen;i++) {changes.push([input[i][0],input[i][1],datamap.get(input[i][0],input[i][1]),input[i][2]]);}if(!source && typeof row === "object"){source = prop;}validateChanges(changes,source,function(){applyChanges(changes,source);});}; /**
   * Listen to keyboard input on document body.
   *
   * @memberof Core#
   * @function listen
   * @since 0.11
   */this.listen = function(){Handsontable.activeGuid = instance.guid;if(document.activeElement && document.activeElement !== document.body){document.activeElement.blur();}else if(!document.activeElement){ //IE
document.body.focus();}}; /**
   * Stop listening to keyboard input on document body.
   *
   * @memberof Core#
   * @function unlisten
   * @since 0.11
   */this.unlisten = function(){Handsontable.activeGuid = null;}; /**
   * Returns `true` if current Handsontable instance is listening to keyboard input on document body.
   *
   * @memberof Core#
   * @function isListening
   * @since 0.11
   * @returns {Boolean}
   */this.isListening = function(){return Handsontable.activeGuid === instance.guid;}; /**
   * Destroys current editor, renders and selects current cell.
   *
   * @memberof Core#
   * @function destroyEditor
   * @param {Boolean} [revertOriginal] If != `true`, edited data is saved. Otherwise previous value is restored
   */this.destroyEditor = function(revertOriginal){selection.refreshBorders(revertOriginal);}; /**
   * Populate cells at position with 2D input array (e.g. `[[1, 2], [3, 4]]`).
   * Use `endRow`, `endCol` when you want to cut input when certain row is reached.
   * Optional `source` parameter (default value "populateFromArray") is used to identify this call in the resulting events (beforeChange, afterChange).
   * Optional `populateMethod` parameter (default value "overwrite", possible values "shift_down" and "shift_right")
   * has the same effect as pasteMethod option (see Options page)
   *
   * @memberof Core#
   * @function populateFromArray
   * @since 0.9.0
   * @param {Number} row Start row
   * @param {Number} col Start column
   * @param {Array} input 2d array
   * @param {Number} [endRow] End row (use when you want to cut input when certain row is reached)
   * @param {Number} [endCol] End column (use when you want to cut input when certain column is reached)
   * @param {String} [source="populateFromArray"]
   * @param {String} [method="overwrite"]
   * @param {String} direction edit (left|right|up|down)
   * @param {Array} deltas array
   * @returns {Object|undefined} ending td in pasted area (only if any cell was changed)
   */this.populateFromArray = function(row,col,input,endRow,endCol,source,method,direction,deltas){var c;if(!(typeof input === 'object' && typeof input[0] === 'object')){throw new Error("populateFromArray parameter `input` must be an array of arrays"); //API changed in 0.9-beta2, let's check if you use it correctly
}c = typeof endRow === 'number'?new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(endRow,endCol):null;return grid.populateFromArray(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(row,col),input,c,source,method,direction,deltas);}; /**
   * Adds/removes data from the column. This function works is modelled after Array.splice.
   * Parameter `col` is the index of column in which do you want to do splice.
   * Parameter `index` is the row index at which to start changing the array.
   * If negative, will begin that many elements from the end. Parameter `amount`, is the number of old array elements to remove.
   * If the amount is 0, no elements are removed. Fourth and further parameters are the `elements` to add to the array.
   * If you don't specify any elements, spliceCol simply removes elements from the array.
   * {@link DataMap#spliceCol}
   *
   * @memberof Core#
   * @function spliceCol
   * @since 0.9-beta2
   * @param {Number} col Index of column in which do you want to do splice.
   * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end
   * @param {Number} amount An integer indicating the number of old array elements to remove. If amount is 0, no elements are removed
   * @param {*} [elements] The elements to add to the array. If you don't specify any elements, spliceCol simply removes elements from the array
   */this.spliceCol = function(col,index,amount /*, elements... */){return datamap.spliceCol.apply(datamap,arguments);}; /**
   * Adds/removes data from the row. This function works is modelled after Array.splice.
   * Parameter `row` is the index of row in which do you want to do splice.
   * Parameter `index` is the column index at which to start changing the array.
   * If negative, will begin that many elements from the end. Parameter `amount`, is the number of old array elements to remove.
   * If the amount is 0, no elements are removed. Fourth and further parameters are the `elements` to add to the array.
   * If you don't specify any elements, spliceCol simply removes elements from the array.
   * {@link DataMap#spliceRow}
   *
   * @memberof Core#
   * @function spliceRow
   * @since 0.11
   * @param {Number} row Index of column in which do you want to do splice.
   * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end
   * @param {Number} amount An integer indicating the number of old array elements to remove. If amount is 0, no elements are removed
   * @param {*} [elements] The elements to add to the array. If you don't specify any elements, spliceCol simply removes elements from the array
   */this.spliceRow = function(row,index,amount /*, elements... */){return datamap.spliceRow.apply(datamap,arguments);}; /**
   * Return index of the currently selected cells as an array `[startRow, startCol, endRow, endCol]`.
   *
   * Start row and start col are the coordinates of the active cell (where the selection was started).
   *
   * @memberof Core#
   * @function getSelected
   * @returns {Array}
   */this.getSelected = function(){ //https://github.com/handsontable/handsontable/issues/44  //cjl
if(selection.isSelected()){return [priv.selRange.from.row,priv.selRange.from.col,priv.selRange.to.row,priv.selRange.to.col];}}; /**
   * Returns current selection as a WalkontableCellRange object.
   *
   * @memberof Core#
   * @function getSelectedRange
   * @since 0.11
   * @returns {WalkontableCellRange} Returns `undefined` if there is no selection.
   */this.getSelectedRange = function(){ //https://github.com/handsontable/handsontable/issues/44  //cjl
if(selection.isSelected()){return priv.selRange;}}; /**
   * Rerender the table.
   *
   * @memberof Core#
   * @function render
   */this.render = function(){if(instance.view){instance.renderCall = true;instance.forceFullRender = true; //used when data was changed
selection.refreshBorders(null,true);}}; /**
   * Reset all cells in the grid to contain data from the data array.
   *
   * @memberof Core#
   * @function loadData
   * @param {Array} data
   * @fires Hooks#afterLoadData
   * @fires Hooks#afterChange
   */this.loadData = function(data){if(typeof data === 'object' && data !== null){if(!(data.push && data.splice)){ //check if data is array. Must use duck-type check so Backbone Collections also pass it
//when data is not an array, attempt to make a single-row array of it
data = [data];}}else if(data === null){data = [];var row;for(var r=0,rlen=priv.settings.startRows;r < rlen;r++) {row = [];for(var c=0,clen=priv.settings.startCols;c < clen;c++) {row.push(null);}data.push(row);}}else {throw new Error("loadData only accepts array of objects or array of arrays (" + typeof data + " given)");}priv.isPopulated = false;GridSettings.prototype.data = data;if(Array.isArray(priv.settings.dataSchema) || Array.isArray(data[0])){instance.dataType = 'array';}else if(typeof priv.settings.dataSchema === 'function'){instance.dataType = 'function';}else {instance.dataType = 'object';}datamap = new _dataMap.DataMap(instance,priv,GridSettings);clearCellSettingCache();grid.adjustRowsAndCols();Handsontable.hooks.run(instance,'afterLoadData');if(priv.firstRun){priv.firstRun = [null,'loadData'];}else {Handsontable.hooks.run(instance,'afterChange',null,'loadData');instance.render();}priv.isPopulated = true;function clearCellSettingCache(){priv.cellSettings.length = 0;}}; /**
   * Return the current data object (the same that was passed by `data` configuration option or `loadData` method).
   * Optionally you can provide cell range `row`, `col`, `row2`, `col2` to get only a fragment of grid data.
   *
   * @memberof Core#
   * @function getData
   * @param {Number} [r] From row
   * @param {Number} [c] From col
   * @param {Number} [r2] To row
   * @param {Number} [c2] To col
   * @returns {Array|Object}
   */this.getData = function(r,c,r2,c2){if(typeof r === 'undefined'){return datamap.getAll();}else {return datamap.getRange(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(r,c),new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(r2,c2),datamap.DESTINATION_RENDERER);}}; /**
   * Get value of selected range. Each column is separated by tab, each row is separated by new line character.
   * {@link DataMap#getCopyableText}
   *
   * @memberof Core#
   * @function getCopyableData
   * @since 0.11
   * @param {Number} startRow From row
   * @param {Number} startCol From col
   * @param {Number} endRow To row
   * @param {Number} endCol To col
   * @returns {Array|Object}
   */this.getCopyableData = function(startRow,startCol,endRow,endCol){return datamap.getCopyableText(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(startRow,startCol),new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(endRow,endCol));}; /**
   * Get schema provided by constructor settings or if it doesn't exist return schema based on data
   * structure on the first row.
   *
   * @memberof Core#
   * @function getSchema
   * @since 0.13.2
   * @returns {Object}
   */this.getSchema = function(){return datamap.getSchema();}; /**
   * Use it if you need to change configuration after initialization.
   *
   * @memberof Core#
   * @function updateSettings
   * @param {Object} settings Settings to update
   * @param {Boolean} init
   * @fires Hooks#afterCellMetaReset
   * @fires Hooks#afterUpdateSettings
   */this.updateSettings = function(settings,init){var i,clen;if(typeof settings.rows !== "undefined"){throw new Error("'rows' setting is no longer supported. do you mean startRows, minRows or maxRows?");}if(typeof settings.cols !== "undefined"){throw new Error("'cols' setting is no longer supported. do you mean startCols, minCols or maxCols?");}for(i in settings) {if(i === 'data'){continue; //loadData will be triggered later
}else {if(Handsontable.hooks.getRegistered().indexOf(i) > -1){if(typeof settings[i] === 'function' || Array.isArray(settings[i])){instance.addHook(i,settings[i]);}}else { // Update settings
if(!init && settings.hasOwnProperty(i)){GridSettings.prototype[i] = settings[i];}}}} // Load data or create data map
if(settings.data === void 0 && priv.settings.data === void 0){instance.loadData(null); //data source created just now
}else if(settings.data !== void 0){instance.loadData(settings.data); //data source given as option
}else if(settings.columns !== void 0){datamap.createMap();} // Init columns constructors configuration
clen = instance.countCols(); //Clear cellSettings cache
priv.cellSettings.length = 0;if(clen > 0){var proto,column;for(i = 0;i < clen;i++) {priv.columnSettings[i] = (0,_helpersSetting.columnFactory)(GridSettings,priv.columnsSettingConflicts); // shortcut for prototype
proto = priv.columnSettings[i].prototype; // Use settings provided by user
if(GridSettings.prototype.columns){column = GridSettings.prototype.columns[i];(0,_helpersObject.extend)(proto,column);(0,_helpersObject.extend)(proto,expandType(column));}}}if(typeof settings.cell !== 'undefined'){for(i in settings.cell) {if(settings.cell.hasOwnProperty(i)){var cell=settings.cell[i];instance.setCellMetaObject(cell.row,cell.col,cell);}}}Handsontable.hooks.run(instance,'afterCellMetaReset');if(typeof settings.className !== "undefined"){if(GridSettings.prototype.className){(0,_helpersDomElement.removeClass)(instance.rootElement,GridSettings.prototype.className); //        instance.rootElement.removeClass(GridSettings.prototype.className);
}if(settings.className){(0,_helpersDomElement.addClass)(instance.rootElement,settings.className); //        instance.rootElement.addClass(settings.className);
}}if(typeof settings.height != 'undefined'){var height=settings.height;if(typeof height == 'function'){height = height();}instance.rootElement.style.height = height + 'px';}if(typeof settings.width != 'undefined'){var width=settings.width;if(typeof width == 'function'){width = width();}instance.rootElement.style.width = width + 'px';} /* jshint ignore:start */if(height){instance.rootElement.style.overflow = 'hidden';} /* jshint ignore:end */if(!init){Handsontable.hooks.run(instance,'afterUpdateSettings');}grid.adjustRowsAndCols();if(instance.view && !priv.firstRun){instance.forceFullRender = true; //used when data was changed
selection.refreshBorders(null,true);}}; /**
   * Get value from selected cell.
   *
   * @memberof Core#
   * @function getValue
   * @since 0.11
   * @returns {*} Returns value of selected cell
   */this.getValue = function(){var sel=instance.getSelected();if(GridSettings.prototype.getValue){if(typeof GridSettings.prototype.getValue === 'function'){return GridSettings.prototype.getValue.call(instance);}else if(sel){return instance.getData()[sel[0]][GridSettings.prototype.getValue];}}else if(sel){return instance.getDataAtCell(sel[0],sel[1]);}};function expandType(obj){if(!obj.hasOwnProperty('type')){ //ignore obj.prototype.type
return;}var type,expandedType={};if(typeof obj.type === 'object'){type = obj.type;}else if(typeof obj.type === 'string'){type = Handsontable.cellTypes[obj.type];if(type === void 0){throw new Error('You declared cell type "' + obj.type + '" as a string that is not mapped to a known object. Cell type must be an object or a string mapped to an object in Handsontable.cellTypes');}}for(var i in type) {if(type.hasOwnProperty(i) && !obj.hasOwnProperty(i)){expandedType[i] = type[i];}}return expandedType;} /**
   * Get object settings.
   *
   * @memberof Core#
   * @function getSettings
   * @returns {Object} Returns an object containing the current grid settings
   */this.getSettings = function(){return priv.settings;}; /**
   * Clears grid.
   *
   * @memberof Core#
   * @function clear
   * @since 0.11
   */this.clear = function(){selection.selectAll();selection.empty();}; /**
   * @memberof Core#
   * @function alter
   * @param {String} action See grid.alter for possible values: `"insert_row"`, `"insert_col"`, `"remove_row"`, `"remove_col"`
   * @param {Number} index
   * @param {Number} amount
   * @param {String} [source] Source of hook runner
   * @param {Boolean} [keepEmptyRows] Flag for preventing deletion of empty rows
   * @description
   *
   * Insert new row(s) above the row at given `index`. If index is `null` or `undefined`, the new row will be
   * added after the current last row. Default `amount` equals 1.
   * ```js
   * var hot = new Handsontable(document.getElementById('example'));
   * hot.alter('insert_row', 10);
   * ```
   *
   * Insert new column(s) before the column at given `index`. If index is `null` or `undefined`, the new column
   * will be added after the current last column. Default `amount` equals 1
   * ```js
   * var hot = new Handsontable(document.getElementById('example'));
   * hot.alter('insert_col', 10);
   * ```
   *
   * Remove the row(s) at given `index`. Default `amount` equals 1
   * ```js
   * var hot = new Handsontable(document.getElementById('example'));
   * hot.alter('remove_row', 10);
   * ```
   *
   * Remove the column(s) at given `index`. Default `amount` equals 1
   * ```js
   * var hot = new Handsontable(document.getElementById('example'));
   * hot.alter('remove_col', 10);
   * ```
   */this.alter = function(action,index,amount,source,keepEmptyRows){grid.alter(action,index,amount,source,keepEmptyRows);}; /**
   * Returns TD element for given `row`, `col` if it is rendered on screen.
   * Returns `null` if the TD is not rendered on screen (probably because that part of table is not visible).
   *
   * @memberof Core#
   * @function getCell
   * @param {Number} row
   * @param {Number} col
   * @param {Boolean} topmost
   * @returns {Element}
   */this.getCell = function(row,col,topmost){return instance.view.getCellAtCoords(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(row,col),topmost);}; /**
   * Returns coordinates for the provided element.
   *
   * @memberof Core#
   * @function getCoords
   * @param {Element} elem
   * @returns {WalkontableCellCoords}
   */this.getCoords = function(elem){return this.view.wt.wtTable.getCoords.call(this.view.wt.wtTable,elem);}; /**
   * Returns property name that corresponds with the given column index. {@link DataMap#colToProp}
   *
   * @memberof Core#
   * @function colToProp
   * @param {Number} col Column index
   * @returns {String}
   */this.colToProp = function(col){return datamap.colToProp(col);}; /**
   * Returns column index that corresponds with the given property. {@link DataMap#propToCol}
   *
   * @memberof Core#
   * @function propToCol
   * @param {String} prop
   * @returns {Number}
   */this.propToCol = function(prop){return datamap.propToCol(prop);}; /**
   * @description
   * Return cell value at `row`, `col`. `row` and `col` are the __visible__ indexes (note that if columns were reordered or sorted,
   * the current order will be used).
   *
   * @memberof Core#
   * @function getDataAtCell
   * @param {Number} row
   * @param {Number} col
   * @returns {*}
   */this.getDataAtCell = function(row,col){return datamap.get(row,datamap.colToProp(col));}; /**
   * Return value at `row`, `prop`. {@link DataMap#get}
   *
   * @memberof Core#
   * @function getDataAtRowProp
   * @param {Number} row
   * @param {String} prop
   * @returns {*}
   */this.getDataAtRowProp = function(row,prop){return datamap.get(row,prop);}; /**
   * @description
   * Returns array of column values from the data source. `col` is the __visible__ index of the column.
   *
   * @memberof Core#
   * @function getDataAtCol
   * @since 0.9-beta2
   * @param {Number} col
   * @returns {Array}
   */this.getDataAtCol = function(col){var out=[];return out.concat.apply(out,datamap.getRange(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(0,col),new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(priv.settings.data.length - 1,col),datamap.DESTINATION_RENDERER));}; /**
   * Given the object property name (e.g. `'first.name'`), returns array of column values from the data source.
   *
   * @memberof Core#
   * @function getDataAtProp
   * @since 0.9-beta2
   * @param {String} prop
   * @returns {*}
   */this.getDataAtProp = function(prop){var out=[],range;range = datamap.getRange(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(0,datamap.propToCol(prop)),new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(priv.settings.data.length - 1,datamap.propToCol(prop)),datamap.DESTINATION_RENDERER);return out.concat.apply(out,range);}; /**
   * Returns array of column values from the data source. `col` is the index of the row in the data source.
   *
   * @memberof Core#
   * @function getSourceDataAtCol
   * @since 0.11.0-beta3
   * @param {Number} col
   * @returns {Array}
   */this.getSourceDataAtCol = function(col){var out=[],data=priv.settings.data;for(var i=0;i < data.length;i++) {out.push(data[i][col]);}return out;}; /**
   * Returns a single row of the data (array or object, depending on what you have). `row` is the index of the row in the data source.
   *
   * @memberof Core#
   * @function getSourceDataAtRow
   * @since 0.11.0-beta3
   * @param {Number} row
   * @returns {Array|Object}
   */this.getSourceDataAtRow = function(row){return priv.settings.data[row];}; /**
   * @description
   * Returns a single row of the data (array or object, depending on what you have). `row` is the __visible__ index of the row.
   *
   * @memberof Core#
   * @function getDataAtRow
   * @param {Number} row
   * @returns {*}
   * @since 0.9-beta2
   */this.getDataAtRow = function(row){var data=datamap.getRange(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(row,0),new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(row,this.countCols() - 1),datamap.DESTINATION_RENDERER);return data[0];}; /**
   * Remove `key` property object from cell meta data corresponding to params `row`, `col`.
   *
   * @memberof Core#
   * @function removeCellMeta
   * @param {Number} row
   * @param {Number} col
   * @param {String} key
   */this.removeCellMeta = function(row,col,key){var cellMeta=instance.getCellMeta(row,col); /* jshint ignore:start */if(cellMeta[key] != undefined){delete priv.cellSettings[row][col][key];} /* jshint ignore:end */}; /**
   * Set cell meta data object `prop` to corresponding params `row`, `col`
   *
   * @memberof Core#
   * @function setCellMetaObject
   * @since 0.11
   * @param {Number} row
   * @param {Number} col
   * @param {Object} prop
   */this.setCellMetaObject = function(row,col,prop){if(typeof prop === 'object'){for(var key in prop) {if(prop.hasOwnProperty(key)){var value=prop[key];this.setCellMeta(row,col,key,value);}}}}; /**
   * Sets cell meta data object `key` corresponding to params `row`, `col`.
   *
   * @memberof Core#
   * @function setCellMeta
   * @since 0.11
   * @param {Number} row
   * @param {Number} col
   * @param {String} key
   * @param {String} val
   * @fires Hooks#afterSetCellMeta
   */this.setCellMeta = function(row,col,key,val){if(!priv.cellSettings[row]){priv.cellSettings[row] = [];}if(!priv.cellSettings[row][col]){priv.cellSettings[row][col] = new priv.columnSettings[col]();}priv.cellSettings[row][col][key] = val;Handsontable.hooks.run(instance,'afterSetCellMeta',row,col,key,val);}; /**
   * Return cell properties for given `row`, `col` coordinates.
   *
   * @memberof Core#
   * @function getCellMeta
   * @param {Number} row
   * @param {Number} col
   * @returns {Object}
   * @fires Hooks#beforeGetCellMeta
   * @fires Hooks#afterGetCellMeta
   */this.getCellMeta = function(row,col){var prop=datamap.colToProp(col),cellProperties;row = translateRowIndex(row);col = translateColIndex(col);if(!priv.columnSettings[col]){priv.columnSettings[col] = (0,_helpersSetting.columnFactory)(GridSettings,priv.columnsSettingConflicts);}if(!priv.cellSettings[row]){priv.cellSettings[row] = [];}if(!priv.cellSettings[row][col]){priv.cellSettings[row][col] = new priv.columnSettings[col]();}cellProperties = priv.cellSettings[row][col]; //retrieve cellProperties from cache
cellProperties.row = row;cellProperties.col = col;cellProperties.prop = prop;cellProperties.instance = instance;Handsontable.hooks.run(instance,'beforeGetCellMeta',row,col,cellProperties);(0,_helpersObject.extend)(cellProperties,expandType(cellProperties)); //for `type` added in beforeGetCellMeta
if(cellProperties.cells){var settings=cellProperties.cells.call(cellProperties,row,col,prop);if(settings){(0,_helpersObject.extend)(cellProperties,settings);(0,_helpersObject.extend)(cellProperties,expandType(settings)); //for `type` added in cells
}}Handsontable.hooks.run(instance,'afterGetCellMeta',row,col,cellProperties);return cellProperties;}; /**
   * Checks if the data format and config allows user to modify the column structure.
   * @returns {boolean}
   */this.isColumnModificationAllowed = function(){return !(instance.dataType === 'object' || instance.getSettings().columns);}; /**
   * If displayed rows order is different than the order of rows stored in memory (i.e. sorting is applied)
   * we need to translate logical (stored) row index to physical (displayed) index.
   *
   * @memberof Core#
   * @function translateRowIndex
   * @param {Number} row Original row index
   * @returns {Number} Translated row index
   * @fires Hooks#modifyRow
   */function translateRowIndex(row){return Handsontable.hooks.run(instance,'modifyRow',row);} /**
   * If displayed columns order is different than the order of columns stored in memory (i.e. column were moved using manualColumnMove plugin)
   * we need to translate logical (stored) column index to physical (displayed) index.
   *
   * @memberof Core#
   * @function translateColIndex
   * @param {Number} col Original column index
   * @returns {Number} Translated column index
   * @fires Hooks#modifyCol
   */function translateColIndex(col){ // warning: this must be done after datamap.colToProp
return Handsontable.hooks.run(instance,'modifyCol',col);}var rendererLookup=(0,_helpersData.cellMethodLookupFactory)('renderer'); /**
   * Get cell renderer type by `row` and `col`.
   *
   * @memberof Core#
   * @function getCellRenderer
   * @since 0.11
   * @param {Number} row
   * @param {Number} col
   * @returns {Function} Returns rederer type
   */this.getCellRenderer = function(row,col){var renderer=rendererLookup.call(this,row,col);return (0,_renderers.getRenderer)(renderer);}; /**
   * Get cell editor by `row` and `col`.
   *
   * @memberof Core#
   * @function getCellEditor
   * @returns {*}
   */this.getCellEditor = (0,_helpersData.cellMethodLookupFactory)('editor'); /**
   * Get cell validator by `row` and `col`
   *
   * @memberof Core#
   * @function getCellValidator
   * @returns {*}
   */this.getCellValidator = (0,_helpersData.cellMethodLookupFactory)('validator'); /**
   * Validates all cells using their validator functions and calls callback when finished. Does not render the view.
   *
   * If one of cells is invalid callback will be fired with `'valid'` arguments as `false` otherwise `true`.
   *
   * @memberof Core#
   * @function validateCells
   * @param {Function} callback
   */this.validateCells = function(callback){var waitingForValidator=new ValidatorsQueue();waitingForValidator.onQueueEmpty = callback; /* jshint ignore:start */var i=instance.countRows() - 1;while(i >= 0) {var j=instance.countCols() - 1;while(j >= 0) {waitingForValidator.addValidatorToQueue();instance.validateCell(instance.getDataAtCell(i,j),instance.getCellMeta(i,j),function(result){if(typeof result !== 'boolean'){throw new Error("Validation error: result is not boolean");}if(result === false){waitingForValidator.valid = false;}waitingForValidator.removeValidatorFormQueue();},'validateCells');j--;}i--;} /* jshint ignore:end */waitingForValidator.checkIfQueueIsEmpty();}; /**
   * Returns array of row headers (if they are enabled). If param `row` given, return header at given row as string.
   *
   * @memberof Core#
   * @function getRowHeader
   * @param {Number} [row]
   * @returns {Array|String}
   */this.getRowHeader = function(row){if(row === void 0){var out=[];for(var i=0,ilen=instance.countRows();i < ilen;i++) {out.push(instance.getRowHeader(i));}return out;}else if(Array.isArray(priv.settings.rowHeaders) && priv.settings.rowHeaders[row] !== void 0){return priv.settings.rowHeaders[row];}else if(typeof priv.settings.rowHeaders === 'function'){return priv.settings.rowHeaders(row);}else if(priv.settings.rowHeaders && typeof priv.settings.rowHeaders !== 'string' && typeof priv.settings.rowHeaders !== 'number'){return row + 1;}else {return priv.settings.rowHeaders;}}; /**
   * Returns information of this table is configured to display row headers.
   *
   * @memberof Core#
   * @function hasRowHeaders
   * @returns {Boolean}
   * @since 0.11
   */this.hasRowHeaders = function(){return !!priv.settings.rowHeaders;}; /**
   * Returns information of this table is configured to display column headers.
   *
   * @memberof Core#
   * @function hasColHeaders
   * @since 0.11
   * @returns {Boolean}
   */this.hasColHeaders = function(){if(priv.settings.colHeaders !== void 0 && priv.settings.colHeaders !== null){ //Polymer has empty value = null
return !!priv.settings.colHeaders;}for(var i=0,ilen=instance.countCols();i < ilen;i++) {if(instance.getColHeader(i)){return true;}}return false;}; /**
   * Return array of column headers (if they are enabled). If param `col` given, return header at given column as string
   *
   * @memberof Core#
   * @function getColHeader
   * @param {Number} [col] Column index
   * @returns {Array|String}
   */this.getColHeader = function(col){if(col === void 0){var out=[];for(var i=0,ilen=instance.countCols();i < ilen;i++) {out.push(instance.getColHeader(i));}return out;}else {var baseCol=col;col = Handsontable.hooks.run(instance,'modifyCol',col);if(priv.settings.columns && priv.settings.columns[col] && priv.settings.columns[col].title){return priv.settings.columns[col].title;}else if(Array.isArray(priv.settings.colHeaders) && priv.settings.colHeaders[col] !== void 0){return priv.settings.colHeaders[col];}else if(typeof priv.settings.colHeaders === 'function'){return priv.settings.colHeaders(col);}else if(priv.settings.colHeaders && typeof priv.settings.colHeaders !== 'string' && typeof priv.settings.colHeaders !== 'number'){return (0,_helpersData.spreadsheetColumnLabel)(baseCol); //see #1458
}else {return priv.settings.colHeaders;}}}; /**
   * Return column width from settings (no guessing). Private use intended.
   *
   * @private
   * @memberof Core#
   * @function _getColWidthFromSettings
   * @param {Number} col
   * @returns {Number}
   */this._getColWidthFromSettings = function(col){var cellProperties=instance.getCellMeta(0,col);var width=cellProperties.width;if(width === void 0 || width === priv.settings.width){width = cellProperties.colWidths;}if(width !== void 0 && width !== null){switch(typeof width){case 'object': // array
width = width[col];break;case 'function':width = width(col);break;}if(typeof width === 'string'){width = parseInt(width,10);}}return width;}; /**
   * Return column width
   *
   * @memberof Core#
   * @function getColWidth
   * @since 0.11
   * @param {Number} col
   * @returns {Number}
   * @fires Hooks#modifyColWidth
   */this.getColWidth = function(col){var width=instance._getColWidthFromSettings(col);width = Handsontable.hooks.run(instance,'modifyColWidth',width,col);if(width === void 0){width = _rdpartyWalkontableSrcCalculatorViewportColumns.WalkontableViewportColumnsCalculator.DEFAULT_WIDTH;}return width;}; /**
   * Return row height from settings (no guessing). Private use intended.
   *
   * @private
   * @memberof Core#
   * @function _getRowHeightFromSettings
   * @param {Number} row
   * @returns {Number}
   */this._getRowHeightFromSettings = function(row){ //let cellProperties = instance.getCellMeta(row, 0);
//let height = cellProperties.height;
//
//if (height === void 0 || height === priv.settings.height) {
//  height = cellProperties.rowHeights;
//}
var height=priv.settings.rowHeights;if(height !== void 0 && height !== null){switch(typeof height){case 'object': // array
height = height[row];break;case 'function':height = height(row);break;}if(typeof height === 'string'){height = parseInt(height,10);}}return height;}; /**
   * Return row height.
   *
   * @memberof Core#
   * @function getRowHeight
   * @since 0.11
   * @param {Number} row
   * @returns {Number}
   * @fires Hooks#modifyRowHeight
   */this.getRowHeight = function(row){var height=instance._getRowHeightFromSettings(row);height = Handsontable.hooks.run(instance,'modifyRowHeight',height,row);return height;}; /**
   * Returns total number of rows in the grid.
   *
   * @memberof Core#
   * @function countRows
   * @returns {Number} Total number in rows the grid
   */this.countRows = function(){return priv.settings.data.length;}; /**
   * Returns total number of columns in the grid.
   *
   * @memberof Core#
   * @function countCols
   * @returns {Number} Total number of columns
   */this.countCols = function(){if(instance.dataType === 'object' || instance.dataType === 'function'){if(priv.settings.columns && priv.settings.columns.length){return priv.settings.columns.length;}else {return datamap.colToPropCache.length;}}else if(instance.dataType === 'array'){if(priv.settings.columns && priv.settings.columns.length){return priv.settings.columns.length;}else if(priv.settings.data && priv.settings.data[0] && priv.settings.data[0].length){return priv.settings.data[0].length;}else {return 0;}}}; /**
   * Get index of first visible row.
   *
   * @memberof Core#
   * @function rowOffset
   * @returns {Number} Returns index of first visible row
   */this.rowOffset = function(){return instance.view.wt.wtTable.getFirstRenderedRow();}; /**
   * Get index of first visible column.
   *
   * @memberof Core#
   * @function colOffset
   * @returns {Number} Return index of first visible column.
   */this.colOffset = function(){return instance.view.wt.wtTable.getFirstRenderedColumn();}; /**
   * Return number of rendered rows (including rows partially or fully rendered outside viewport).
   *
   * @memberof Core#
   * @function countRenderedRows
   * @returns {Number} Returns -1 if table is not visible
   */this.countRenderedRows = function(){return instance.view.wt.drawn?instance.view.wt.wtTable.getRenderedRowsCount():-1;}; /**
   * Return number of visible rows (rendered rows that fully fit inside viewport).
   *
   * @memberof Core#
   * @function countVisibleRows
   * @returns {Number} Returns -1 if table is not visible
   */this.countVisibleRows = function(){return instance.view.wt.drawn?instance.view.wt.wtTable.getVisibleRowsCount():-1;}; /**
   * Return number of visible columns.
   *
   * @memberof Core#
   * @function countRenderedCols
   * @returns {Number} Returns -1 if table is not visible
   */this.countRenderedCols = function(){return instance.view.wt.drawn?instance.view.wt.wtTable.getRenderedColumnsCount():-1;}; /**
   * Return number of visible columns. Returns -1 if table is not visible
   *
   * @memberof Core#
   * @function countVisibleCols
   * @return {Number}
   */this.countVisibleCols = function(){return instance.view.wt.drawn?instance.view.wt.wtTable.getVisibleColumnsCount():-1;}; /**
   * Returns number of empty rows. If the optional ending parameter is `true`, returns
   * number of empty rows at the bottom of the table.
   *
   * @memberof Core#
   * @function countEmptyRows
   * @param {Boolean} [ending] If `true`, will only count empty rows at the end of the data source
   * @returns {Number} Count empty rows
   * @fires Hooks#modifyRow
   */this.countEmptyRows = function(ending){var i=instance.countRows() - 1,empty=0,row;while(i >= 0) {row = Handsontable.hooks.run(this,'modifyRow',i);if(instance.isEmptyRow(row)){empty++;}else if(ending){break;}i--;}return empty;}; /**
   * Returns number of empty columns. If the optional ending parameter is `true`, returns number of empty
   * columns at right hand edge of the table.
   *
   * @memberof Core#
   * @function countEmptyCols
   * @param {Boolean} [ending] If `true`, will only count empty columns at the end of the data source row
   * @returns {Number} Count empty cols
   */this.countEmptyCols = function(ending){if(instance.countRows() < 1){return 0;}var i=instance.countCols() - 1,empty=0;while(i >= 0) {if(instance.isEmptyCol(i)){empty++;}else if(ending){break;}i--;}return empty;}; /**
   * Check is `row` is empty.
   *
   * @memberof Core#
   * @function isEmptyRow
   * @param {Number} row Row index
   * @returns {Boolean} Return `true` if the row at the given `row` is empty, `false` otherwise.
   */this.isEmptyRow = function(row){return priv.settings.isEmptyRow.call(instance,row);}; /**
   * Check is `col` is empty.
   *
   * @memberof Core#
   * @function isEmptyCol
   * @param {Number} col Column index
   * @returns {Boolean} Return `true` if the column at the given `col` is empty, `false` otherwise.
   */this.isEmptyCol = function(col){return priv.settings.isEmptyCol.call(instance,col);}; /**
   * Select cell `row`, `col` or range of cells finishing at `endRow`, `endCol`.
   * By default, viewport will be scrolled to selection and after `selectCell` call instance will be listening
   * to keyboard input on document.
   *
   * @memberof Core#
   * @function selectCell
   * @param {Number} row
   * @param {Number} col
   * @param {Number} [endRow]
   * @param {Number} [endCol]
   * @param {Boolean} [scrollToCell=true] If `true`, viewport will be scrolled to the selection
   * @param {Boolean} [changeListener=true] If `false`, Handsontable will not change keyboard events listener to
   *                                        himself (default `true`)
   * @returns {Boolean}
   */this.selectCell = function(row,col,endRow,endCol,scrollToCell,changeListener){var coords;changeListener = typeof changeListener === 'undefined' || changeListener === true;if(typeof row !== 'number' || row < 0 || row >= instance.countRows()){return false;}if(typeof col !== 'number' || col < 0 || col >= instance.countCols()){return false;}if(typeof endRow !== 'undefined'){if(typeof endRow !== 'number' || endRow < 0 || endRow >= instance.countRows()){return false;}if(typeof endCol !== 'number' || endCol < 0 || endCol >= instance.countCols()){return false;}}coords = new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(row,col);priv.selRange = new _rdpartyWalkontableSrcCellRange.WalkontableCellRange(coords,coords,coords);if(document.activeElement && document.activeElement !== document.documentElement && document.activeElement !== document.body){ // needed or otherwise prepare won't focus the cell. selectionSpec tests this (should move focus to selected cell)
document.activeElement.blur();}if(changeListener){instance.listen();}if(typeof endRow === 'undefined'){selection.setRangeEnd(priv.selRange.from,scrollToCell);}else {selection.setRangeEnd(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(endRow,endCol),scrollToCell);}instance.selection.finish();return true;}; /**
   * Select cell `row`, `prop` or range finishing at `endRow`, `endProp`. By default, viewport will be scrolled to selection.
   *
   * @memberof Core#
   * @function selectCellByProp
   * @param {Number} row
   * @param {Object} prop
   * @param {Number} [endRow]
   * @param {Object} [endProp]
   * @param {Boolean} [scrollToCell=true] If `true`, viewport will be scrolled to the selection
   * @returns {Boolean}
   */this.selectCellByProp = function(row,prop,endRow,endProp,scrollToCell){ /* jshint ignore:start */arguments[1] = datamap.propToCol(arguments[1]);if(typeof arguments[3] !== "undefined"){arguments[3] = datamap.propToCol(arguments[3]);}return instance.selectCell.apply(instance,arguments); /* jshint ignore:end */}; /**
   * Deselects current cell selection on grid.
   *
   * @memberof Core#
   * @function deselectCell
   */this.deselectCell = function(){selection.deselect();}; /**
   * Remove grid from DOM.
   *
   * @memberof Core#
   * @function destroy
   * @fires Hooks#afterDestroy
   */this.destroy = function(){instance._clearTimeouts();if(instance.view){ //in case HT is destroyed before initialization has finished
instance.view.destroy();}(0,_helpersDomElement.empty)(instance.rootElement);eventManager.destroy();Handsontable.hooks.run(instance,'afterDestroy');Handsontable.hooks.destroy(instance);for(var i in instance) {if(instance.hasOwnProperty(i)){ //replace instance methods with post mortem
if(typeof instance[i] === "function"){instance[i] = postMortem;} //replace instance properties with null (restores memory)
//it should not be necessary but this prevents a memory leak side effects that show itself in Jasmine tests
else if(i !== "guid"){instance[i] = null;}}} //replace private properties with null (restores memory)
//it should not be necessary but this prevents a memory leak side effects that show itself in Jasmine tests
priv = null;datamap = null;grid = null;selection = null;editorManager = null;instance = null;GridSettings = null;}; /**
   * Replacement for all methods after Handsotnable was destroyed.
   *
   * @private
   */function postMortem(){throw new Error("This method cannot be called because this Handsontable instance has been destroyed");} /**
   * Returns active editor object. {@link Handsontable.EditorManager#getActiveEditor}
   *
   * @memberof Core#
   * @function getActiveEditor
   * @returns {Object}
   */this.getActiveEditor = function(){return editorManager.getActiveEditor();}; /**
   * Returns plugin instance by plugin name
   *
   * @memberof Core#
   * @function getPlugin
   * @param {String} pluginName
   * @returns {*}
   * @since 0.15.0
   */this.getPlugin = function(pluginName){return (0,_plugins.getPlugin)(this,pluginName);}; /**
   * Return Handsontable instance.
   *
   * @memberof Core#
   * @function getInstance
   * @returns {Handsontable}
   */this.getInstance = function(){return instance;}; /**
   * Adds listener to specified hook name and only for this Handsontable instance.
   *
   * @memberof Core#
   * @function addHook
   * @see Hooks#add
   * @param {String} key Hook name
   * @param {Function|Array} callback Function or array of Functions
   *
   * @example
   * ```js
   * hot.addHook('beforeInit', myCallback);
   * ```
   */this.addHook = function(key,callback){Handsontable.hooks.add(key,callback,instance);}; /**
   * Adds listener to specified hook name and only for this Handsontable instance. After hook runs this
   * listener will be automatically removed.
   *
   * @memberof Core#
   * @function addHookOnce
   * @see Hooks#once
   * @param {String} key Hook name
   * @param {Function|Array} callback Function or array of Functions
   *
   * @example
   * ```js
   * hot.addHookOnce('beforeInit', myCallback);
   * ```
   */this.addHookOnce = function(key,callback){Handsontable.hooks.once(key,callback,instance);}; /**
   * Removes the hook listener previously registered with {@link Core#addHook}.
   *
   * @memberof Core#
   * @function removeHook
   * @see Hooks#remove
   * @param {String} key Hook name
   * @param {Function} callback Function which have been registered via {@link Core#addHook}
   *
   * @example
   * ```js
   * hot.removeHook('beforeInit', myCallback);
   * ```
   */this.removeHook = function(key,callback){Handsontable.hooks.remove(key,callback,instance);}; /**
   * @memberof Core#
   * @function runHooks
   * @see Hooks#run
   * @param {String} key Hook name
   * @param {*} [p1]
   * @param {*} [p2]
   * @param {*} [p3]
   * @param {*} [p4]
   * @param {*} [p5]
   * @param {*} [p6]
   * @returns {*}
   *
   * @example
   * ```js
   * hot.runHooks('beforeInit');
   * ```
   */this.runHooks = function(key,p1,p2,p3,p4,p5,p6){return Handsontable.hooks.run(instance,key,p1,p2,p3,p4,p5,p6);};this.timeouts = []; /**
   * Sets timeout. Purpose of this method is to clear all known timeouts when `destroy` method is called.
   *
   * @param {*} handle
   * @private
   */this._registerTimeout = function(handle){this.timeouts.push(handle);}; /**
   * Clears all known timeouts.
   *
   * @private
   */this._clearTimeouts = function(){for(var i=0,ilen=this.timeouts.length;i < ilen;i++) {clearTimeout(this.timeouts[i]);}}; /**
   * Handsontable version
   *
   * @type {String}
   */this.version = Handsontable.version;Handsontable.hooks.run(instance,'construct');}; /**
 * @alias Options
 * @constructor
 * @description

 * ## Constructor options
 *
 * Constructor options are applied using an object literal passed as a first argument to the Handsontable constructor.
 *
 * ```js
 * var hot = new Handsontable(document.getElementById('example1'), {
 *   data: myArray,
 *   width: 400,
 *   height: 300
 * })
 * ```
 *
 * ---
 * ## Cascading configuration
 *
 * Handsontable 0.9 and newer is using *Cascading Configuration*, which is fast way to provide configuration options
 * for whole table, its columns and particular cells.
 *
 * Consider the following example:
 * ```js
 * var hot = new Handsontable(document.getElementById('example'), {
 *   readOnly: true,
 *   columns: [
 *     {readOnly: false},
 *     {},
 *     {}
 *   ],
 *   cells: function (row, col, prop) {
 *     var cellProperties = {};
 *
 *     if (row === 0 && col === 0) {
 *       cellProperties.readOnly = true;
 *     }
 *
 *     return cellProperties;
 *   }
 * });
 * ```
 *
 * The above notation will result in all TDs being *read only*, except for first column TDs which will be *editable*, except for the TD in top left corner which will still be *read only*.
 *
 * ### The Cascading Configuration model
 *
 * ##### 1. Constructor
 *
 * Configuration options that are provided using first-level `handsontable(container, {option: "value"})` and `updateSettings` method.
 *
 * ##### 2. Columns
 *
 * Configuration options that are provided using second-level object `handsontable(container, {columns: {option: "value"}]})`
 *
 * ##### 3. Cells
 *
 * Configuration options that are provided using second-level function `handsontable(container, {cells: function: (row, col, prop){ }})`
 *
 * ---
 * ## Architecture performance
 *
 * The Cascading Configuration model is based on prototypical inheritance. It is much faster and memory efficient compared
 * to the previous model that used jQuery extend. See: [http://jsperf.com/extending-settings](http://jsperf.com/extending-settings).
 *
 * ---
 * __Important notice:__ In order for the data separation to work properly, make sure that each instance of Handsontable has a unique `id`.
 */var DefaultSettings=function DefaultSettings(){};DefaultSettings.prototype = { /**
   * @description
   * Initial data source that will be bound to the data grid __by reference__ (editing data grid alters the data source).
   * Can be Array of Array, Array of Objects or Function.
   *
   * See [Understanding binding as reference](http://handsontable.com/demo/understanding_reference.html).
   *
   * @type {Array|Function}
   * @default undefined
   */data:void 0, /**
   * @description
   * Defines the structure of a new row when data source is an object.
   * Default like the first data row Array or Object.
   *
   *  See [demo/datasources.html](http://handsontable.com/demo/datasources.html) for examples.
   *
   * @type {Object}
   * @default undefined
   */dataSchema:void 0, /**
   * Width of the grid. Can be a number or a function that returns a number.
   *
   * @type {Number|Function}
   * @default undefined
   */width:void 0, /**
   * Height of the grid. Can be a number or a function that returns a number.
   *
   * @type {Number|Function}
   * @default undefined
   */height:void 0, /**
   * @description
   * Initial number of rows.
   *
   * __Notice:__ This option only has effect in Handsontable constructor and only if `data` option is not provided
   *
   * @type {Number}
   * @default 5
   */startRows:5, /**
   * @description
   * Initial number of columns.
   *
   * __Notice:__ This option only has effect in Handsontable constructor and only if `data` option is not provided
   *
   * @type {Number}
   * @default 5
   */startCols:5, /**
   * Setting `true` or `false` will enable or disable the default row headers (1, 2, 3).
   * You can also define an array `['One', 'Two', 'Three', ...]` or a function to define the headers.
   * If a function is set the index of the row is passed as a parameter.
   *
   * @type {Boolean|Array|Function}
   * @default null
   * @example
   * ```js
   * ...
   * // as boolean
   * rowHeaders: true,
   * ...
   *
   * ...
   * // as array
   * rowHeaders: [1, 2, 3],
   * ...
   *
   * ...
   * // as function
   * rowHeaders: function(index) {
   *   return index + ': AB';
   * },
   * ...
   * ```
   */rowHeaders:null, /**
   * Setting `true` or `false` will enable or disable the default column headers (A, B, C).
   * You can also define an array `['One', 'Two', 'Three', ...]` or a function to define the headers.
   * If a function is set the index of the column is passed as a parameter.
   *
   * @type {Boolean|Array|Function}
   * @default null
   * @example
   * ```js
   * ...
   * // as boolean
   * colHeaders: true,
   * ...
   *
   * ...
   * // as array
   * colHeaders: ['A', 'B', 'C'],
   * ...
   *
   * ...
   * // as function
   * colHeaders: function(index) {
   *   return index + ': AB';
   * },
   * ...
   * ```
   */colHeaders:null, /**
   * Defines column widths in pixels. Accepts number, string (that will be converted to number),
   * array of numbers (if you want to define column width separately for each column) or a
   * function (if you want to set column width dynamically on each render).
   *
   * @type {Array|Function|Number|String}
   * @default undefined
   */colWidths:void 0, /**
   * @description
   * Defines the cell properties and data binding for certain columns.
   *
   * __Notice:__ Using this option sets a fixed number of columns (options `startCols`, `minCols`, `maxCols` will be ignored).
   *
   * See [demo/datasources.html](http://handsontable.com/demo/datasources.html) for examples.
   *
   * @type {Array}
   * @default undefined
   * @example
   * ```js
   * ...
   * var exampleContainer = document.getElementById('example');
   * var hot = new Handsontable(exampleContainer, {
   *   columns: [
   *     {
   *       // column options for the first column
   *       type: 'numeric',
   *       format: '0,0.00 $'
   *     },
   *     {
   *       // column options for the second column
   *       type: 'text',
   *       readOnly: true
   *     }
   *   ]
   * });
   * ...
   * ```
   */columns:void 0, /**
   * @description
   * Defines the cell properties for given `row`, `col`, `prop` coordinates.
   * Any constructor or column option may be overwritten for a particular cell (row/column combination), using `cell`
   * array passed to the Handsontable constructor. Or using `cells` function property to the Handsontable constructor.
   *
   * @type {Function}
   * @default undefined
   * @example
   * ```js
   * ...
   * var hot = new Handsontable(document.getElementById('example'), {
   *   cells: function (row, col, prop) {
   *     var cellProperties = {};
   *
   *     if (row === 0 && col === 0) {
   *       cellProperties.readOnly = true;
   *     }
   *
   *     return cellProperties;
   *   }
   * });
   * ...
   * ```
   */cells:void 0, /**
   * Any constructor or column option may be overwritten for a particular cell (row/column combination), using `cell`
   * array passed to the Handsontable constructor.
   *
   * @type {Array}
   * @default []
   * @example
   * ```js
   * ...
   * var hot = new Handsontable(document.getElementById('example'), {
   *   cell: [
   *     {row: 0, col: 0, readOnly: true}
   *   ]
   * });
   * ...
   * ```
   */cell:[], /**
   * @description
   * If `true`, enables {@link Comments} plugin, which enables applying cell comments through the context menu
   * (configurable with context menu keys commentsAddEdit, commentsRemove).
   *
   * To initialize Handsontable with predefined comments, provide cell coordinates and comment texts in form of an array.
   *
   * See [Comments](http://handsontable.com/demo/comments.html) demo for examples.
   *
   * @since 0.11.0
   * @type {Boolean|Array}
   * @default false
   * @example
   * ```js
   * ...
   * var hot = new Handsontable(document.getElementById('example'), {
   *   comments: [{row: 1, col: 1, comment: "Test comment"}]
   * });
   * ...
   * ```
   */comments:false, /**
   * @description
   * If `true`, enables Custom Borders plugin, which enables applying custom borders through the context menu (configurable with context menu key borders).
   *
   * To initialize Handsontable with predefined custom borders, provide cell coordinates and border styles in form of an array.
   *
   * See [Custom Borders](http://handsontable.com/demo/custom_borders.html) demo for examples.
   *
   * @since 0.11.0
   * @type {Boolean|Array}
   * @default false
   * @example
   * ```js
   * ...
   * var hot = new Handsontable(document.getElementById('example'), {
   *   customBorders: [
   *     {range: {
   *       from: {row: 1, col: 1},
   *       to: {row: 3, col: 4}},
   *       left: {},
   *       right: {},
   *       top: {},
   *       bottom: {}
   *     }
   *   ],
   * });
   * ...
   *
   * // or
   * ...
   * var hot = new Handsontable(document.getElementById('example'), {
   *   customBorders: [
   *     {row: 2, col: 2, left: {width: 2, color: 'red'},
   *       right: {width: 1, color: 'green'}, top: '', bottom: ''}
   *   ],
   * });
   * ...
   * ```
   */customBorders:false, /**
   * Minimum number of rows. At least that amount of rows will be created during initialization.
   *
   * @type {Number}
   * @default 0
   */minRows:0, /**
   * Minimum number of columns. At least that many of columns will be created during initialization.
   *
   * @type {Number}
   * @default 0
   */minCols:0, /**
   * Maximum number of rows.
   *
   * @type {Number}
   * @default Infinity
   */maxRows:Infinity, /**
   * Maximum number of cols.
   *
   * @type {Number}
   * @default Infinity
   */maxCols:Infinity, /**
   * When set to 1 (or more), Handsontable will add a new row at the end of grid if there are no more empty rows.
   *
   * @type {Number}
   * @default 0
   */minSpareRows:0, /**
   * When set to 1 (or more), Handsontable will add a new column at the end of grid if there are no more empty columns.
   *
   * @type {Number}
   * @default 0
   */minSpareCols:0, /**
   * @type {Boolean}
   * @default true
   */allowInsertRow:true, /**
   * @type {Boolean}
   * @default true
   */allowInsertColumn:true, /**
   * @type {Boolean}
   * @default true
   */allowRemoveRow:true, /**
   * @type {Boolean}
   * @default true
   */allowRemoveColumn:true, /**
   * If true, selection of multiple cells using keyboard or mouse is allowed.
   *
   * @type {Boolean}
   * @default true
   */multiSelect:true, /**
   * Enables the fill handle (drag-down and copy-down) functionality, which shows the small rectangle in bottom
   * right corner of the selected area, that let's you expand values to the adjacent cells.
   *
   * Possible values: `true` (to enable in all directions), `"vertical"` or `"horizontal"` (to enable in one direction),
   * `false` (to disable completely). Setting to `true` enables the fillHandle plugin.
   *
   * @type {Boolean|String}
   * @default true
   */fillHandle:true, /**
   * Allows to specify the number of rows fixed (aka freezed) on the top of the table.
   *
   * @type {Number}
   * @default 0
   */fixedRowsTop:0, /**
   * Allows to specify the number of columns fixed (aka freezed) on the left side of the table.
   *
   * @type {Number}
   * @default 0
   */fixedColumnsLeft:0, /**
   * If `true`, mouse click outside the grid will deselect the current selection.
   *
   * @type {Boolean}
   * @default true
   */outsideClickDeselects:true, /**
   * If `true`, <kbd>ENTER</kbd> begins editing mode (like Google Docs). If `false`, <kbd>ENTER</kbd> moves to next
   * row (like Excel) and adds new row if necessary. <kbd>TAB</kbd> adds new column if necessary.
   *
   * @type {Boolean}
   * @default true
   */enterBeginsEditing:true, /**
   * Defines cursor move after <kbd>ENTER</kbd> is pressed (<kbd>SHIFT</kbd> + <kbd>ENTER</kbd> uses negative vector).
   * Can be an object or a function that returns an object. The event argument passed to the function
   * is a DOM Event object received after a <kbd>ENTER</kbd> key has been pressed. This event object can be used to check
   * whether user pressed <kbd>ENTER</kbd> or <kbd>SHIFT</kbd> + <kbd>ENTER</kbd>.
   *
   * @type {Object|Function}
   * @default {row: 1, col: 0}
   */enterMoves:{row:1,col:0}, /**
   * Defines cursor move after <kbd>TAB</kbd> is pressed (<kbd>SHIFT</kbd> + <kbd>TAB</kbd> uses negative vector).
   * Can be an object or a function that returns an object. The event argument passed to the function
   * is a DOM Event object received after a <kbd>TAB</kbd> key has been pressed. This event object can be used to check
   * whether user pressed <kbd>TAB</kbd> or <kbd>SHIFT</kbd> + <kbd>TAB</kbd>.
   *
   * @type {Object}
   * @default {row: 0, col: 1}
   */tabMoves:{row:0,col:1}, /**
   * If `true`, pressing <kbd>TAB</kbd> or right arrow in the last column will move to first column in next row
   *
   * @type {Boolean}
   * @default false
   */autoWrapRow:false, /**
   * If `true`, pressing <kbd>ENTER</kbd> or down arrow in the last row will move to first row in next column
   *
   * @type {Boolean}
   * @default false
   */autoWrapCol:false, /**
   * Maximum number of rows than can be copied to clipboard using <kbd>CTRL</kbd> + <kbd>C</kbd>.
   *
   * @type {Number}
   * @default 1000
   */copyRowsLimit:1000, /**
   * Maximum number of columns than can be copied to clipboard using <kbd>CTRL</kbd> + <kbd>C</kbd>.
   *
   * @type {Number}
   * @default 1000
   */copyColsLimit:1000, /**
   * Defines paste (<kbd>CTRL</kbd> + <kbd>V</kbd>) behavior. Default value `"overwrite"` will paste clipboard value over current selection.
   * When set to `"shift_down"`, clipboard data will be pasted in place of current selection, while all selected cells are moved down.
   * When set to `"shift_right"`, clipboard data will be pasted in place of current selection, while all selected cells are moved right.
   *
   * @type {String}
   * @default 'overwrite'
   */pasteMode:'overwrite', /**
   * @description
   * Turn on saving the state of column sorting, columns positions and columns sizes in local storage.
   *
   * You can save any sort of data in local storage in to preserve table state between page reloads.
   * In order to enable data storage mechanism, `persistentState` option must be set to `true` (you can set it
   * either during Handsontable initialization or using the `updateSettings` method). When `persistentState` is enabled it exposes 3 hooks:
   *
   * __persistentStateSave__ (key: String, value: Mixed)
   *
   *   * Saves value under given key in browser local storage.
   *
   * __persistentStateLoad__ (key: String, valuePlaceholder: Object)
   *
   *   * Loads `value`, saved under given key, form browser local storage. The loaded `value` will be saved in `valuePlaceholder.value`
   *     (this is due to specific behaviour of `Hooks.run()` method). If no value have been saved under key `valuePlaceholder.value`
   *     will be `undefined`.
   *
   * __persistentStateReset__ (key: String)
   *
   *   * Clears the value saved under `key`. If no `key` is given, all values associated with table will be cleared.
   *
   * __Note:__ The main reason behind using `persistentState` hooks rather than regular LocalStorage API is that it
   * ensures separation of data stored by multiple Handsontable instances. In other words, if you have two (or more)
   * instances of Handsontable on one page, data saved by one instance won't be accessible by the second instance.
   * Those two instances can store data under the same key and no data would be overwritten.
   *
   * __Important:__ In order for the data separation to work properly, make sure that each instance of Handsontable has a unique `id`.
   *
   * @type {Boolean}
   * @default false
   */persistentState:false, /**
   * Class name for all visible rows in current selection.
   *
   * @type {String}
   * @default undefined
   */currentRowClassName:void 0, /**
   * Class name for all visible columns in current selection.
   *
   * @type {String}
   * @default undefined
   */currentColClassName:void 0, /**
   * Class name for all handsontable container element.
   *
   * @type {String|Array}
   * @default undefined
   */className:void 0, /**
   * Class name for all tables inside container element.
   *
   * @since 0.17.0
   * @type {String|Array}
   * @default undefined
   */tableClassName:void 0, /**
   * @description
   * [Column stretching](http://handsontable.com/demo/scroll.html) mode. Possible values: `"none"`, `"last"`, `"all"`.
   *
   * @type {String}
   * @default 'none'
   */stretchH:'none', /**
   * Lets you overwrite the default `isEmptyRow` method.
   *
   * @type {Function}
   * @param {Number} row
   * @returns {Boolean}
   */isEmptyRow:function isEmptyRow(row){var col,colLen,value,meta;for(col = 0,colLen = this.countCols();col < colLen;col++) {value = this.getDataAtCell(row,col);if(value !== '' && value !== null && typeof value !== 'undefined'){if(typeof value === 'object'){meta = this.getCellMeta(row,col);return (0,_helpersObject.isObjectEquals)(this.getSchema()[meta.prop],value);}return false;}}return true;}, /**
   * Lets you overwrite the default `isEmptyCol` method.
   *
   * @type {Function}
   * @param {Number} col
   * @returns {Boolean}
   */isEmptyCol:function isEmptyCol(col){var row,rowLen,value;for(row = 0,rowLen = this.countRows();row < rowLen;row++) {value = this.getDataAtCell(row,col);if(value !== '' && value !== null && typeof value !== 'undefined'){return false;}}return true;}, /**
   * When set to `true`, the table is rerendered when it is detected that it was made visible in DOM.
   *
   * @type {Boolean}
   * @default true
   */observeDOMVisibility:true, /**
   * If set to `true`, cells will accept value that is marked as invalid by cell `validator`, with a background color
   * automatically applied using CSS class `htInvalid`. If set to `false`, cells will not accept invalid value.
   *
   * @type {Boolean}
   * @default true
   * @since 0.9.5
   */allowInvalid:true, /**
   * CSS class name for cells that did not pass validation.
   *
   * @type {String}
   * @default 'htInvalid'
   */invalidCellClassName:'htInvalid', /**
   * When set to an non-empty string, displayed as the cell content for empty cells.
   *
   * @type {Boolean|String}
   * @default false
   */placeholder:false, /**
   * CSS class name for cells that have a placeholder in use.
   *
   * @type {String}
   * @default 'htPlaceholder'
   */placeholderCellClassName:'htPlaceholder', /**
   * CSS class name for read-only cells.
   *
   * @type {String}
   * @default 'htDimmed'
   */readOnlyCellClassName:'htDimmed', /**
   * String may be one of the following predefined values: `autocomplete`, `checkbox`, `text`, `numeric`. Function will
   * receive the following arguments: `function(instance, TD, row, col, prop, value, cellProperties) {}`.
   * You can map your own function to a string like this: `Handsontable.cellLookup.renderer.myRenderer = myRenderer;`
   *
   * @type {String|Function}
   * @default undefined
   */renderer:void 0, /**
   * @type {String}
   * @default 'htCommentCell'
   */commentedCellClassName:'htCommentCell', /**
   * Setting to `true` enables selecting just a fragment of the text within a single cell or between adjacent cells.
   *
   * @type {Boolean}
   * @default false
   */fragmentSelection:false, /**
   * @description
   * Make cell [read only](http://handsontable.com/demo/readonly.html).
   *
   * @type {Boolean}
   * @default false
   */readOnly:false, /**
   * @description
   * Setting to true enables the search plugin (see [demo](http://handsontable.com/demo/search.html)).
   *
   * @type {Boolean}
   * @default false
   */search:false, /**
   * @description
   * Shortcut to define combination of cell renderer and editor for the column.
   *
   * Possible values:
   *  * text
   *  * [numeric](http://handsontable.com/demo/numeric.html)
   *  * [date](http://handsontable.com/demo/date.html)
   *  * [checkbox](http://handsontable.com/demo/checkbox.html)
   *  * [autocomplete](http://handsontable.com/demo/autocomplete.html)
   *  * [handsontable](http://handsontable.com/demo/handsontable.html)
   *
   * @type {String}
   * @default 'text'
   */type:'text', /**
   * @description
   * Make cell copyable (pressing <kbd>CTRL</kbd> + <kbd>C</kbd> on your keyboard moves its value to system clipboard).
   *
   * __Note:__ this setting is `false` by default for cells with type `password`.
   *
   * @type {Boolean}
   * @default true
   * @since 0.10.2
   */copyable:true, /**
   * String, rendering function or boolean.
   *
   * String may be one of the following predefined values:
   *  * [autocomplete](http://handsontable.com/demo/autocomplete.html)
   *  * [checkbox](http://handsontable.com/demo/checkbox.html)
   *  * [date](http://handsontable.com/demo/date.html)
   *  * [dropdown](http://handsontable.com/demo/dropdown.html)
   *  * [handsontable](http://handsontable.com/demo/handsontable.html)
   *  * [mobile](http://docs.handsontable.com/demo-mobiles-and-tablets.html)
   *  * [password](http://handsontable.com/demo/password.html)
   *  * [select](http://handsontable.com/demo/selectEditor.html)
   *  * text
   *
   * Or you can disable cell editing passing `false`.
   *
   * @type {String|Function|Boolean}
   * @default 'text'
   */editor:void 0, /**
   * @description
   * Autocomplete definitions. See [demo/autocomplete.html](http://handsontable.com/demo/autocomplete.html) for examples and definitions.
   *
   * @type {Array}
   * @default undefined
   */autoComplete:void 0, /**
   * Control number of choices for autocomplete (or dropdown) cells. After exceeding it scrollbar for dropdown list of choices will be visible.
   *
   * @since 0.18.0
   * @type {Number}
   * @default 10
   */visibleRows:10, /**
   * Makes autocomplete or dropdown width the same as the edited cell width. If `false` then editor will be scaled
   * according to its content.
   *
   * @since 0.17.0
   * @type {Boolean}
   * @default true
   */trimDropdown:true, /**
   * Setting to true enables the debug mode, currently used to test the correctness of the row and column
   * header fixed positioning on a layer above the master table.
   *
   * @type {Boolean}
   * @default false
   */debug:false, /**
   * When set to `true`, the text of the cell content is wrapped if it does not fit in the fixed column width.
   *
   * @type {Boolean}
   * @default true
   * @since 0.11.0
   */wordWrap:true, /**
   * CSS class name added to cells with cell meta `wordWrap: false`.
   *
   * @type {String}
   * @default 'htNoWrap'
   * @since 0.11.0
   */noWordWrapClassName:'htNoWrap', /**
   * @description
   * Defines if the right-click context menu should be enabled. Context menu allows to create new row or
   * column at any place in the grid. Possible values: `true` (to enable basic options), `false` (to disable completely)
   * or array of any available strings: `["row_above", "row_below", "col_left", "col_right",
   * "remove_row", "remove_col", "undo", "redo", "sep1", "sep2", "sep3"]`.
   *
   * See [demo/contextmenu.html](http://handsontable.com/demo/contextmenu.html) for examples.
   *
   * @type {Boolean|Array|Object}
   * @default undefined
   */contextMenu:void 0, /**
   * @description
   * Defines if the dropdown menu in headers should be enabled. Dropdown menu allows to put custom or predefined actions
   * which can intreact with selected column.
   * Possible values: `true` (to enable basic options), `false` (to disable completely)
   * or array of any available strings: `["row_above", "row_below", "col_left", "col_right",
   * "remove_row", "remove_col", "undo", "redo", "clear_column", "sep1", "sep2", "sep3"]`.
   *
   * See [demo/dropdownmenu.html](http://handsontable.com/demo/dropdownmenu.html) for examples.
   *
   * @type {Boolean|Array|Object}
   * @default undefined
   */dropdownMenu:void 0, /**
   * If `true`, undo/redo functionality is enabled.
   *
   * @type {Boolean}
   * @default undefined
   */undo:void 0, /**
   * @description
   * Turn on [Column sorting](http://handsontable.com/demo/sorting.html).
   *
   * @type {Boolean|Object}
   * @default undefined
   */columnSorting:void 0, /**
   * @description
   * Turn on [Manual column move](http://docs.handsontable.com/demo-resizing.html), if set to a boolean or define initial
   * column order, if set to an array of column indexes.
   *
   * @type {Boolean|Array}
   * @default undefined
   */manualColumnMove:void 0, /**
   * @description
   * Turn on [Manual column resize](http://docs.handsontable.com/demo-resizing.html), if set to a boolean or define initial
   * column resized widths, if set to an array of numbers.
   *
   * @type {Boolean|Array}
   * @default undefined
   */manualColumnResize:void 0, /**
   * @description
   * Turn on [Manual row move](http://docs.handsontable.com/demo-resizing.html), if set to a boolean or define initial
   * row order, if set to an array of row indexes.
   *
   * @type {Boolean|Array}
   * @default undefined
   * @since 0.11.0
   */manualRowMove:void 0, /**
   * @description
   * Turn on [Manual row resize](http://docs.handsontable.com/demo-resizing.html), if set to a boolean or define initial
   * row resized heights, if set to an array of numbers.
   *
   * @type {Boolean|Array}
   * @default undefined
   * @since 0.11.0
   */manualRowResize:void 0, /**
   * @description
   * Setting to true or array enables the mergeCells plugin, which enables the merging of the cells. (see [demo](http://handsontable.com/demo/merge_cells.html)).
   * You can provide the merged cells on the pageload if you feed the mergeCells option with an array.
   *
   * @type {Boolean|Array}
   * @default false
   */mergeCells:false, /**
   * Number of rows to be prerendered before and after the viewport is changed. Default value is `'auto'` which means
   * that Handsontable tries to calculates offset for best performance.
   *
   * @type {Number|String}
   * @default 'auto'
   */viewportRowRenderingOffset:'auto', /**
   * Number of columns to be prerendered before and after the viewport is changed. Default value is `'auto'` which means
   * that Handsontable tries to calculates offset for best performance.
   *
   * @type {Number|String}
   * @default 'auto'
   */viewportColumnRenderingOffset:'auto', /**
   * @description
   * If `true`, enables Grouping plugin, which enables applying expandable row and column groups.
   * To initialize Handsontable with predefined groups, provide row or column group start and end coordinates in form of an array.
   *
   * See [Grouping](http://handsontable.com/demo/grouping.html) demo for examples.
   *
   * @type {Boolean|Array}
   * @default undefined
   * @since 0.11.4
   * @example
   * ```js
   * ...
   * // as boolean
   * groups: true,
   * ...
   *
   * ...
   * // as array
   * groups: [{cols: [0, 2]}, {cols: [5, 15], rows: [0, 5]}],
   * ...
   * ```
   */groups:void 0, /**
   * A usually small function or regular expression that validates the input.
   * After you determine if the input is valid, execute `callback(true)` or `callback(false)` to proceed with the execution.
   * In function, `this` binds to cellProperties.
   *
   * @type {Function|RegExp}
   * @default undefined
   * @since 0.9.5
   */validator:void 0, /**
   * @description
   * Disable visual cells selection.
   *
   * Possible values:
   *  * `true` - Disables any type of visual selection (current and area selection),
   *  * `false` - Enables any type of visual selection. This is default value.
   *  * `current` - Disables to appear only current selected cell.
   *  * `area` - Disables to appear only multiple selected cells.
   *
   * @type {Boolean|String|Array}
   * @default false
   * @since 0.13.2
   * @example
   * ```js
   * ...
   * // as boolean
   * disableVisualSelection: true,
   * ...
   *
   * ...
   * // as string ('current' or 'area')
   * disableVisualSelection: 'current',
   * ...
   *
   * ...
   * // as array
   * disableVisualSelection: ['current', 'area'],
   * ...
   * ```
   */disableVisualSelection:false, /**
   * @description
   * Set whether to display the current sorting indicator (a triangle icon in the column header, specifying the sorting order).
   *
   * @type {Boolean}
   * @default false
   * @since 0.15.0-beta3
   */sortIndicator:false,manualColumnFreeze:void 0, /**
   * @description
   * Defines whether Handsontable should trim the whitespace at the begging and the end of the cell contents
   *
   * @type {Boolean}
   * @default true
   */trimWhitespace:true,settings:void 0,source:void 0,title:void 0, /**
   * Data template for `'checkbox'` type when checkbox is checked.
   *
   * Option desired for cell which `'checkbox'` type.
   *
   * @type {Boolean|String}
   * @default true
   */checkedTemplate:void 0, /**
   * Data template for `'checkbox'` type when checkbox is unchecked.
   *
   * Option desired for cell which `'checkbox'` type.
   *
   * @type {Boolean|String}
   * @default false
   */uncheckedTemplate:void 0, /**
   * Display format. See http://numeric.com.
   *
   * Option desired for cell which `'numeric'` type.
   */format:void 0, /**
   * Language display format. See http://numeric.com.
   *
   * Option desired for cell which `'numeric'` type.
   *
   * @type {String}
   * @default 'en'
   */language:void 0, /**
   * Data source for cell with `'select'` type.
   *
   * @type {Array}
   */selectOptions:void 0, /**
   * Enables or disables autoColumnSize plugin. Default value is `undefined` which is the same effect as `true`.
   * Disable this plugin can increase performance.
   *
   * Column width calculations are divided into sync and async part. Each of this part has own advantages and
   * disadvantages. Synchronous counting is faster but it blocks browser UI and asynchronous is slower but it does not
   * block Browser UI.
   *
   * To configure this sync/async line you can pass absolute value (columns) or percentage.
   * @example
   * ```js
   * ...
   * // as number (300 columns in sync, rest async)
   * autoColumnSize: {syncLimit: 300},
   * ...
   *
   * ...
   * // as string (percent)
   * autoColumnSize: {syncLimit: '40%'},
   * ...
   * ```
   *
   * `syncLimit` options is available since 0.16.0.
   *
   * @type {Object|Boolean}
   * @default {syncLimit: 50}
   */autoColumnSize:void 0, /**
   * Enables or disables autoRowSize plugin. Default value is `undefined` which is the same effect as `true`.
   * Disable this plugin can increase performance.
   *
   * Row height calculations are divided into sync and async part. Each of this part has own advantages and
   * disadvantages. Synchronous counting is faster but it blocks browser UI and asynchronous is slower but it does not
   * block Browser UI.
   *
   * To configure this sync/async line you can pass absolute value (rows) or percentage.
   * @example
   * ```js
   * ...
   * // as number (300 columns in sync, rest async)
   * autoRowSize: {syncLimit: 300},
   * ...
   *
   * ...
   * // as string (percent)
   * autoRowSize: {syncLimit: '40%'},
   * ...
   * ```
   *
   * `syncLimit` options is available since 0.16.0.
   *
   * @type {Object|Boolean}
   * @default {syncLimit: 1000}
   */autoRowSize:void 0, /**
   * Date validation format.
   *
   * Option desired for cell which `'date'` type.
   *
   * @type {String}
   * @default 'DD/MM/YYYY'
   */dateFormat:void 0, /**
   * If `true` then dates will be automatically formatted to match the desired format.
   *
   * Option desired for cell which `'date'` type.
   *
   * @type {Boolean}
   * @default false
   */correctFormat:false, /**
   * Definition of default value which will fill empty cells.
   *
   * Option desired for cell which `'date'` type.
   *
   * @type {String}
   */defaultDate:void 0, /**
   * If typed `true` value entered into cell must match to the autocomplete source. Otherwise cell will be invalid.
   *
   * Option desired for cell which `'autocomplete'` type.
   *
   * @type {Boolean}
   */strict:void 0};Handsontable.DefaultSettings = DefaultSettings;

},{"./3rdparty/walkontable/src/calculator/viewportColumns":9,"./3rdparty/walkontable/src/cell/coords":11,"./3rdparty/walkontable/src/cell/range":12,"./3rdparty/walkontable/src/selection":24,"./dataMap":32,"./editorManager":33,"./eventManager":46,"./helpers/data":49,"./helpers/dom/element":50,"./helpers/object":55,"./helpers/setting":56,"./helpers/string":57,"./plugins":61,"./renderers":62,"./tableView":71,"numeral":5}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _SheetClip = require('SheetClip');

var _SheetClip2 = _interopRequireDefault(_SheetClip);

var _helpersData = require('./helpers/data');

var _helpersSetting = require('./helpers/setting');

var _helpersObject = require('./helpers/object');

var _helpersArray = require('./helpers/array');

var _multiMap = require('./multiMap');

/**
 * Utility class that gets and saves data from/to the data source using mapping of columns numbers to object property names
 * @todo refactor arguments of methods getRange, getText to be numbers (not objects)
 * @todo remove priv, GridSettings from object constructor
 *
 * @param {Object} instance Instance of Handsontable
 * @param {*} priv
 * @param {*} GridSettings Grid settings
 * @util
 * @class DataMap
 * @dependencies SheetClip
 */
function DataMap(instance, priv, GridSettings) {
  this.instance = instance;
  this.priv = priv;
  this.GridSettings = GridSettings;
  this.dataSource = this.instance.getSettings().data;

  if (this.dataSource[0]) {
    this.duckSchema = this.recursiveDuckSchema(this.dataSource[0]);
  } else {
    this.duckSchema = {};
  }
  this.createMap();
}

DataMap.prototype.DESTINATION_RENDERER = 1;
DataMap.prototype.DESTINATION_CLIPBOARD_GENERATOR = 2;

/**
 * @param {Object|Array} object
 * @returns {Object|Array}
 */
DataMap.prototype.recursiveDuckSchema = function (object) {
  return (0, _helpersObject.duckSchema)(object);
};

/**
 * @param {Object} schema
 * @param {Number} lastCol
 * @param {Number} parent
 * @returns {Number}
 */
DataMap.prototype.recursiveDuckColumns = function (schema, lastCol, parent) {
  var prop, i;
  if (typeof lastCol === 'undefined') {
    lastCol = 0;
    parent = '';
  }
  if (typeof schema === "object" && !Array.isArray(schema)) {
    for (i in schema) {
      if (schema.hasOwnProperty(i)) {
        if (schema[i] === null) {
          prop = parent + i;
          this.colToPropCache.push(prop);
          this.propToColCache.set(prop, lastCol);

          lastCol++;
        } else {
          lastCol = this.recursiveDuckColumns(schema[i], lastCol, i + '.');
        }
      }
    }
  }
  return lastCol;
};

DataMap.prototype.createMap = function () {
  var i,
      ilen,
      schema = this.getSchema();
  if (typeof schema === "undefined") {
    throw new Error("trying to create `columns` definition but you didnt' provide `schema` nor `data`");
  }
  this.colToPropCache = [];
  this.propToColCache = new _multiMap.MultiMap();
  var columns = this.instance.getSettings().columns;
  if (columns) {
    for (i = 0, ilen = columns.length; i < ilen; i++) {

      if (typeof columns[i].data != 'undefined') {
        this.colToPropCache[i] = columns[i].data;
        this.propToColCache.set(columns[i].data, i);
      }
    }
  } else {
    this.recursiveDuckColumns(schema);
  }
};

/**
 * Returns property name that corresponds with the given column index.
 *
 * @param {Number} col
 * @returns {Number}
 */
DataMap.prototype.colToProp = function (col) {
  col = Handsontable.hooks.run(this.instance, 'modifyCol', col);

  if (this.colToPropCache && typeof this.colToPropCache[col] !== 'undefined') {
    return this.colToPropCache[col];
  }

  return col;
};

/**
 * @param {Object} prop
 * @fires Hooks#modifyCol
 * @returns {*}
 */
DataMap.prototype.propToCol = function (prop) {
  var col;

  if (typeof this.propToColCache.get(prop) !== 'undefined') {
    col = this.propToColCache.get(prop);
  } else {
    col = prop;
  }
  col = Handsontable.hooks.run(this.instance, 'modifyCol', col);

  return col;
};

/**
 * @returns {Object}
 */
DataMap.prototype.getSchema = function () {
  var schema = this.instance.getSettings().dataSchema;
  if (schema) {
    if (typeof schema === 'function') {
      return schema();
    }
    return schema;
  }

  return this.duckSchema;
};

/**
 * Creates row at the bottom of the data array.
 *
 * @param {Number} [index] Index of the row before which the new row will be inserted
 * @fires Hooks#afterCreateRow
 * @returns {Number} Returns number of created rows
 */
DataMap.prototype.createRow = function (index, amount, createdAutomatically) {
  var row,
      colCount = this.instance.countCols(),
      numberOfCreatedRows = 0,
      currentIndex;

  if (!amount) {
    amount = 1;
  }

  if (typeof index !== 'number' || index >= this.instance.countRows()) {
    index = this.instance.countRows();
  }

  currentIndex = index;
  var maxRows = this.instance.getSettings().maxRows;
  while (numberOfCreatedRows < amount && this.instance.countRows() < maxRows) {

    if (this.instance.dataType === 'array') {
      row = [];
      for (var c = 0; c < colCount; c++) {
        row.push(null);
      }
    } else if (this.instance.dataType === 'function') {
      row = this.instance.getSettings().dataSchema(index);
    } else {
      row = {};
      (0, _helpersObject.deepExtend)(row, this.getSchema());
    }

    if (index === this.instance.countRows()) {
      this.dataSource.push(row);
    } else {
      this.dataSource.splice(index, 0, row);
    }

    numberOfCreatedRows++;
    currentIndex++;
  }

  Handsontable.hooks.run(this.instance, 'afterCreateRow', index, numberOfCreatedRows, createdAutomatically);
  this.instance.forceFullRender = true; //used when data was changed

  return numberOfCreatedRows;
};

/**
 * Creates col at the right of the data array.
 *
 * @param {Number} [index] Index of the column before which the new column will be inserted
 * @param {Number} [amount]
 * @param {Number} [createdAutomatically]
 * @fires Hooks#afterCreateCol
 * @returns {Number} Returns number of created columns
 */
DataMap.prototype.createCol = function (index, amount, createdAutomatically) {
  if (!this.instance.isColumnModificationAllowed()) {
    throw new Error("Cannot create new column. When data source in an object, " + "you can only have as much columns as defined in first data row, data schema or in the 'columns' setting." + "If you want to be able to add new columns, you have to use array datasource.");
  }
  var rlen = this.instance.countRows(),
      data = this.dataSource,
      constructor,
      numberOfCreatedCols = 0,
      currentIndex;

  if (!amount) {
    amount = 1;
  }

  currentIndex = index;

  var maxCols = this.instance.getSettings().maxCols;
  while (numberOfCreatedCols < amount && this.instance.countCols() < maxCols) {
    constructor = (0, _helpersSetting.columnFactory)(this.GridSettings, this.priv.columnsSettingConflicts);
    if (typeof index !== 'number' || index >= this.instance.countCols()) {
      for (var r = 0; r < rlen; r++) {
        if (typeof data[r] === 'undefined') {
          data[r] = [];
        }
        data[r].push(null);
      }
      // Add new column constructor
      this.priv.columnSettings.push(constructor);
    } else {
      for (var r = 0; r < rlen; r++) {
        data[r].splice(currentIndex, 0, null);
      }
      // Add new column constructor at given index
      this.priv.columnSettings.splice(currentIndex, 0, constructor);
    }

    numberOfCreatedCols++;
    currentIndex++;
  }

  Handsontable.hooks.run(this.instance, 'afterCreateCol', index, numberOfCreatedCols, createdAutomatically);
  this.instance.forceFullRender = true; //used when data was changed

  return numberOfCreatedCols;
};

/**
 * Removes row from the data array.
 *
 * @param {Number} [index] Index of the row to be removed. If not provided, the last row will be removed
 * @param {Number} [amount] Amount of the rows to be removed. If not provided, one row will be removed
 * @fires Hooks#beforeRemoveRow
 * @fires Hooks#afterRemoveRow
 */
DataMap.prototype.removeRow = function (index, amount) {
  if (!amount) {
    amount = 1;
  }
  if (typeof index !== 'number') {
    index = -amount;
  }

  index = (this.instance.countRows() + index) % this.instance.countRows();

  // We have to map the physical row ids to logical and than perform removing with (possibly) new row id
  var logicRows = this.physicalRowsToLogical(index, amount);

  var actionWasNotCancelled = Handsontable.hooks.run(this.instance, 'beforeRemoveRow', index, amount);

  if (actionWasNotCancelled === false) {
    return;
  }

  var data = this.dataSource;
  var newData = data.filter(function (row, index) {
    return logicRows.indexOf(index) == -1;
  });

  data.length = 0;
  Array.prototype.push.apply(data, newData);

  Handsontable.hooks.run(this.instance, 'afterRemoveRow', index, amount);

  this.instance.forceFullRender = true; //used when data was changed
};

/**
 * Removes column from the data array.
 *
 * @param {Number} [index] Index of the column to be removed. If not provided, the last column will be removed
 * @param {Number} [amount] Amount of the columns to be removed. If not provided, one column will be removed
 * @fires Hooks#beforeRemoveCol
 * @fires Hooks#afterRemoveCol
 */
DataMap.prototype.removeCol = function (index, amount) {
  if (this.instance.dataType === 'object' || this.instance.getSettings().columns) {
    throw new Error("cannot remove column with object data source or columns option specified");
  }
  if (!amount) {
    amount = 1;
  }
  if (typeof index !== 'number') {
    index = -amount;
  }

  index = (this.instance.countCols() + index) % this.instance.countCols();

  var actionWasNotCancelled = Handsontable.hooks.run(this.instance, 'beforeRemoveCol', index, amount);

  if (actionWasNotCancelled === false) {
    return;
  }

  var data = this.dataSource;
  for (var r = 0, rlen = this.instance.countRows(); r < rlen; r++) {
    data[r].splice(index, amount);
  }
  this.priv.columnSettings.splice(index, amount);

  Handsontable.hooks.run(this.instance, 'afterRemoveCol', index, amount);
  this.instance.forceFullRender = true; //used when data was changed
};

/**
 * Add/Removes data from the column.
 *
 * @param {Number} col Index of column in which do you want to do splice
 * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end
 * @param {Number} amount An integer indicating the number of old array elements to remove. If amount is 0, no elements are removed
 * @returns {Array} Returns removed portion of columns
 */
DataMap.prototype.spliceCol = function (col, index, amount /*, elements...*/) {
  var elements = 4 <= arguments.length ? [].slice.call(arguments, 3) : [];

  var colData = this.instance.getDataAtCol(col);
  var removed = colData.slice(index, index + amount);
  var after = colData.slice(index + amount);

  (0, _helpersArray.extendArray)(elements, after);
  var i = 0;
  while (i < amount) {
    elements.push(null); //add null in place of removed elements
    i++;
  }
  (0, _helpersArray.to2dArray)(elements);
  this.instance.populateFromArray(index, col, elements, null, null, 'spliceCol');

  return removed;
};

/**
 * Add/Removes data from the row.
 *
 * @param {Number} row Index of row in which do you want to do splice
 * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end
 * @param {Number} amount An integer indicating the number of old array elements to remove. If amount is 0, no elements are removed
 * @returns {Array} Returns removed portion of rows
 */
DataMap.prototype.spliceRow = function (row, index, amount /*, elements...*/) {
  var elements = 4 <= arguments.length ? [].slice.call(arguments, 3) : [];

  var rowData = this.instance.getSourceDataAtRow(row);
  var removed = rowData.slice(index, index + amount);
  var after = rowData.slice(index + amount);

  (0, _helpersArray.extendArray)(elements, after);
  var i = 0;
  while (i < amount) {
    elements.push(null); //add null in place of removed elements
    i++;
  }
  this.instance.populateFromArray(row, index, [elements], null, null, 'spliceRow');

  return removed;
};

/**
 * Returns single value from the data array.
 *
 * @param {Number} row
 * @param {Number} prop
 */
DataMap.prototype.get = function (row, prop) {
  row = Handsontable.hooks.run(this.instance, 'modifyRow', row);

  if (typeof prop === 'string' && prop.indexOf('.') > -1) {
    var sliced = prop.split(".");
    var out = this.dataSource[row];
    if (!out) {
      return null;
    }
    for (var i = 0, ilen = sliced.length; i < ilen; i++) {
      out = out[sliced[i]];
      if (typeof out === 'undefined') {
        return null;
      }
    }
    return out;
  } else if (typeof prop === 'function') {
    /**
     *  allows for interacting with complex structures, for example
     *  d3/jQuery getter/setter properties:
     *
     *    {columns: [{
     *      data: function(row, value){
     *        if(arguments.length === 1){
     *          return row.property();
     *        }
     *        row.property(value);
     *      }
     *    }]}
     */
    return prop(this.dataSource.slice(row, row + 1)[0]);
  } else {
    return this.dataSource[row] ? this.dataSource[row][prop] : null;
  }
};

var copyableLookup = (0, _helpersData.cellMethodLookupFactory)('copyable', false);

/**
 * Returns single value from the data array (intended for clipboard copy to an external application).
 *
 * @param {Number} row
 * @param {Number} prop
 * @returns {String}
 */
DataMap.prototype.getCopyable = function (row, prop) {
  if (copyableLookup.call(this.instance, row, this.propToCol(prop))) {
    return this.get(row, prop);
  }
  return '';
};

/**
 * Saves single value to the data array.
 *
 * @param {Number} row
 * @param {Number} prop
 * @param {String} value
 * @param {String} [source] Source of hook runner.
 */
DataMap.prototype.set = function (row, prop, value, source) {
  row = Handsontable.hooks.run(this.instance, 'modifyRow', row, source || "datamapGet");

  if (typeof prop === 'string' && prop.indexOf('.') > -1) {
    var sliced = prop.split(".");
    var out = this.dataSource[row];
    for (var i = 0, ilen = sliced.length - 1; i < ilen; i++) {

      if (typeof out[sliced[i]] === 'undefined') {
        out[sliced[i]] = {};
      }
      out = out[sliced[i]];
    }
    out[sliced[i]] = value;
  } else if (typeof prop === 'function') {
    /* see the `function` handler in `get` */
    prop(this.dataSource.slice(row, row + 1)[0], value);
  } else {
    this.dataSource[row][prop] = value;
  }
};

/**
 * This ridiculous piece of code maps rows Id that are present in table data to those displayed for user.
 * The trick is, the physical row id (stored in settings.data) is not necessary the same
 * as the logical (displayed) row id (e.g. when sorting is applied).
 *
 * @param {Number} index
 * @param {Number} amount
 * @fires Hooks#modifyRow
 * @returns {Number}
 */
DataMap.prototype.physicalRowsToLogical = function (index, amount) {
  var totalRows = this.instance.countRows();
  var physicRow = (totalRows + index) % totalRows;
  var logicRows = [];
  var rowsToRemove = amount;
  var row;

  while (physicRow < totalRows && rowsToRemove) {
    row = Handsontable.hooks.run(this.instance, 'modifyRow', physicRow);
    logicRows.push(row);

    rowsToRemove--;
    physicRow++;
  }

  return logicRows;
};

/**
 * Clears the data array.
 */
DataMap.prototype.clear = function () {
  for (var r = 0; r < this.instance.countRows(); r++) {
    for (var c = 0; c < this.instance.countCols(); c++) {
      this.set(r, this.colToProp(c), '');
    }
  }
};

/**
 * Returns the data array.
 *
 * @returns {Array}
 */
DataMap.prototype.getAll = function () {
  return this.dataSource;
};

/**
 * Returns data range as array.
 *
 * @param {Object} [start] Start selection position
 * @param {Object} [end] End selection position
 * @param {Number} destination Destination of datamap.get
 * @returns {Array}
 */
DataMap.prototype.getRange = function (start, end, destination) {
  var r,
      rlen,
      c,
      clen,
      output = [],
      row;

  var getFn = destination === this.DESTINATION_CLIPBOARD_GENERATOR ? this.getCopyable : this.get;

  rlen = Math.max(start.row, end.row);
  clen = Math.max(start.col, end.col);

  for (r = Math.min(start.row, end.row); r <= rlen; r++) {
    row = [];
    for (c = Math.min(start.col, end.col); c <= clen; c++) {
      row.push(getFn.call(this, r, this.colToProp(c)));
    }
    output.push(row);
  }

  return output;
};

/**
 * Return data as text (tab separated columns).
 *
 * @param {Object} [start] Start selection position
 * @param {Object} [end] End selection position
 * @returns {String}
 */
DataMap.prototype.getText = function (start, end) {
  return _SheetClip2['default'].stringify(this.getRange(start, end, this.DESTINATION_RENDERER));
};

/**
 * Return data as copyable text (tab separated columns intended for clipboard copy to an external application).
 *
 * @param {Object} [start] Start selection position
 * @param {Object} [end] End selection position
 * @returns {String}
 */
DataMap.prototype.getCopyableText = function (start, end) {
  return _SheetClip2['default'].stringify(this.getRange(start, end, this.DESTINATION_CLIPBOARD_GENERATOR));
};

exports.DataMap = DataMap;

// Support for older hot versions
Handsontable.DataMap = DataMap;

},{"./helpers/array":47,"./helpers/data":49,"./helpers/object":55,"./helpers/setting":56,"./multiMap":59,"SheetClip":1}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _rdpartyWalkontableSrcCellCoords = require('./3rdparty/walkontable/src/cell/coords');

var _helpersUnicode = require('./helpers/unicode');

var _helpersDomEvent = require('./helpers/dom/event');

var _editors = require('./editors');

var _eventManager = require('./eventManager');

exports.EditorManager = EditorManager;

// support for older versions of Handsontable
Handsontable.EditorManager = EditorManager;

function EditorManager(instance, priv, selection) {
  var _this = this,
      destroyed = false,
      eventManager,
      activeEditor;

  eventManager = (0, _eventManager.eventManager)(instance);

  function moveSelectionAfterEnter(shiftKey) {
    var enterMoves = typeof priv.settings.enterMoves === 'function' ? priv.settings.enterMoves(event) : priv.settings.enterMoves;

    if (shiftKey) {
      // move selection up
      selection.transformStart(-enterMoves.row, -enterMoves.col);
    } else {
      // move selection down (add a new row if needed)
      selection.transformStart(enterMoves.row, enterMoves.col, true);
    }
  }

  function moveSelectionUp(shiftKey) {
    if (shiftKey) {
      selection.transformEnd(-1, 0);
    } else {
      selection.transformStart(-1, 0);
    }
  }

  function moveSelectionDown(shiftKey) {
    if (shiftKey) {
      // expanding selection down with shift
      selection.transformEnd(1, 0);
    } else {
      // move selection down
      selection.transformStart(1, 0);
    }
  }

  function moveSelectionRight(shiftKey) {
    if (shiftKey) {
      selection.transformEnd(0, 1);
    } else {
      selection.transformStart(0, 1);
    }
  }

  function moveSelectionLeft(shiftKey) {
    if (shiftKey) {
      selection.transformEnd(0, -1);
    } else {
      selection.transformStart(0, -1);
    }
  }

  function onKeyDown(event) {
    var ctrlDown, rangeModifier;

    if (!instance.isListening()) {
      return;
    }
    Handsontable.hooks.run(instance, 'beforeKeyDown', event);

    if (destroyed) {
      return;
    }
    if ((0, _helpersDomEvent.isImmediatePropagationStopped)(event)) {
      return;
    }
    priv.lastKeyCode = event.keyCode;

    if (!selection.isSelected()) {
      return;
    }
    // catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
    ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey;

    if (activeEditor && !activeEditor.isWaiting()) {
      if (!(0, _helpersUnicode.isMetaKey)(event.keyCode) && !(0, _helpersUnicode.isCtrlKey)(event.keyCode) && !ctrlDown && !_this.isEditorOpened()) {
        _this.openEditor("", event);

        return;
      }
    }
    rangeModifier = event.shiftKey ? selection.setRangeEnd : selection.setRangeStart;

    switch (event.keyCode) {

      case _helpersUnicode.KEY_CODES.A:
        if (!_this.isEditorOpened() && ctrlDown) {
          selection.selectAll();

          event.preventDefault();
          (0, _helpersDomEvent.stopPropagation)(event);
        }
        break;

      case _helpersUnicode.KEY_CODES.ARROW_UP:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }
        moveSelectionUp(event.shiftKey);

        event.preventDefault();
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.ARROW_DOWN:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }
        moveSelectionDown(event.shiftKey);

        event.preventDefault();
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.ARROW_RIGHT:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }
        moveSelectionRight(event.shiftKey);

        event.preventDefault();
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.ARROW_LEFT:
        if (_this.isEditorOpened() && !activeEditor.isWaiting()) {
          _this.closeEditorAndSaveChanges(ctrlDown);
        }
        moveSelectionLeft(event.shiftKey);

        event.preventDefault();
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.TAB:
        var tabMoves = typeof priv.settings.tabMoves === 'function' ? priv.settings.tabMoves(event) : priv.settings.tabMoves;

        if (event.shiftKey) {
          // move selection left
          selection.transformStart(-tabMoves.row, -tabMoves.col);
        } else {
          // move selection right (add a new column if needed)
          selection.transformStart(tabMoves.row, tabMoves.col, true);
        }
        event.preventDefault();
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.BACKSPACE:
      case _helpersUnicode.KEY_CODES.DELETE:
        selection.empty(event);
        _this.prepareEditor();
        event.preventDefault();
        break;

      case _helpersUnicode.KEY_CODES.F2:
        /* F2 */
        _this.openEditor(null, event);

        if (activeEditor) {
          activeEditor.enableFullEditMode();
        }
        event.preventDefault(); //prevent Opera from opening 'Go to Page dialog'
        break;

      case _helpersUnicode.KEY_CODES.ENTER:
        /* return/enter */
        if (_this.isEditorOpened()) {

          if (activeEditor && activeEditor.state !== Handsontable.EditorState.WAITING) {
            _this.closeEditorAndSaveChanges(ctrlDown);
          }
          moveSelectionAfterEnter(event.shiftKey);
        } else {
          if (instance.getSettings().enterBeginsEditing) {
            _this.openEditor(null, event);

            if (activeEditor) {
              activeEditor.enableFullEditMode();
            }
          } else {
            moveSelectionAfterEnter(event.shiftKey);
          }
        }
        event.preventDefault(); //don't add newline to field
        (0, _helpersDomEvent.stopImmediatePropagation)(event); //required by HandsontableEditor
        break;

      case _helpersUnicode.KEY_CODES.ESCAPE:
        if (_this.isEditorOpened()) {
          _this.closeEditorAndRestoreOriginalValue(ctrlDown);
        }
        event.preventDefault();
        break;

      case _helpersUnicode.KEY_CODES.HOME:
        if (event.ctrlKey || event.metaKey) {
          rangeModifier(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(0, priv.selRange.from.col));
        } else {
          rangeModifier(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(priv.selRange.from.row, 0));
        }
        event.preventDefault(); //don't scroll the window
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.END:
        if (event.ctrlKey || event.metaKey) {
          rangeModifier(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(instance.countRows() - 1, priv.selRange.from.col));
        } else {
          rangeModifier(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(priv.selRange.from.row, instance.countCols() - 1));
        }
        event.preventDefault(); //don't scroll the window
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.PAGE_UP:
        selection.transformStart(-instance.countVisibleRows(), 0);
        event.preventDefault(); //don't page up the window
        (0, _helpersDomEvent.stopPropagation)(event);
        break;

      case _helpersUnicode.KEY_CODES.PAGE_DOWN:
        selection.transformStart(instance.countVisibleRows(), 0);
        event.preventDefault(); //don't page down the window
        (0, _helpersDomEvent.stopPropagation)(event);
        break;
    }
  }

  function init() {
    instance.addHook('afterDocumentKeyDown', onKeyDown);

    eventManager.addEventListener(document.documentElement, 'keydown', function (event) {
      instance.runHooks('afterDocumentKeyDown', event);
    });

    function onDblClick(event, coords, elem) {
      // may be TD or TH
      if (elem.nodeName == "TD") {
        _this.openEditor();

        if (activeEditor) {
          activeEditor.enableFullEditMode();
        }
      }
    }
    instance.view.wt.update('onCellDblClick', onDblClick);

    instance.addHook('afterDestroy', function () {
      destroyed = true;
    });
  }

  /**
   * Destroy current editor, if exists.
   *
   * @function destroyEditor
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} revertOriginal
   */
  this.destroyEditor = function (revertOriginal) {
    this.closeEditor(revertOriginal);
  };

  /**
   * Get active editor.
   *
   * @function getActiveEditor
   * @memberof! Handsontable.EditorManager#
   * @returns {*}
   */
  this.getActiveEditor = function () {
    return activeEditor;
  };

  /**
   * Prepare text input to be displayed at given grid cell.
   *
   * @function prepareEditor
   * @memberof! Handsontable.EditorManager#
   */
  this.prepareEditor = function () {
    var row, col, prop, td, originalValue, cellProperties, editorClass;

    if (activeEditor && activeEditor.isWaiting()) {
      this.closeEditor(false, false, function (dataSaved) {
        if (dataSaved) {
          _this.prepareEditor();
        }
      });

      return;
    }
    row = priv.selRange.highlight.row;
    col = priv.selRange.highlight.col;
    prop = instance.colToProp(col);
    td = instance.getCell(row, col);
    originalValue = instance.getDataAtCell(row, col);
    cellProperties = instance.getCellMeta(row, col);
    editorClass = instance.getCellEditor(cellProperties);

    if (editorClass) {
      activeEditor = Handsontable.editors.getEditor(editorClass, instance);
      activeEditor.prepare(row, col, prop, td, originalValue, cellProperties);
    } else {
      activeEditor = void 0;
    }
  };

  /**
   * Check is editor is opened/showed.
   *
   * @function isEditorOpened
   * @memberof! Handsontable.EditorManager#
   * @returns {Boolean}
   */
  this.isEditorOpened = function () {
    return activeEditor && activeEditor.isOpened();
  };

  /**
   * Open editor with initial value.
   *
   * @function openEditor
   * @memberof! Handsontable.EditorManager#
   * @param {String} initialValue
   * @param {DOMEvent} event
   */
  this.openEditor = function (initialValue, event) {
    if (activeEditor && !activeEditor.cellProperties.readOnly) {
      activeEditor.beginEditing(initialValue, event);
    } else if (activeEditor && activeEditor.cellProperties.readOnly) {

      // move the selection after opening the editor with ENTER key
      if (event && event.keyCode === _helpersUnicode.KEY_CODES.ENTER) {
        moveSelectionAfterEnter();
      }
    }
  };

  /**
   * Close editor, finish editing cell.
   *
   * @function closeEditor
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} restoreOriginalValue
   * @param {Boolean} [ctrlDown]
   * @param {Function} [callback]
   */
  this.closeEditor = function (restoreOriginalValue, ctrlDown, callback) {
    if (!activeEditor) {
      if (callback) {
        callback(false);
      }
    } else {
      activeEditor.finishEditing(restoreOriginalValue, ctrlDown, callback);
    }
  };

  /**
   * Close editor and save changes.
   *
   * @function closeEditorAndSaveChanges
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} ctrlDown
   */
  this.closeEditorAndSaveChanges = function (ctrlDown) {
    return this.closeEditor(false, ctrlDown);
  };

  /**
   * Close editor and restore original value.
   *
   * @function closeEditorAndRestoreOriginalValue
   * @memberof! Handsontable.EditorManager#
   * @param {Boolean} ctrlDown
   */
  this.closeEditorAndRestoreOriginalValue = function (ctrlDown) {
    return this.closeEditor(true, ctrlDown);
  };

  init();
}

},{"./3rdparty/walkontable/src/cell/coords":11,"./editors":34,"./eventManager":46,"./helpers/dom/event":51,"./helpers/unicode":58}],34:[function(require,module,exports){
/**
 * Utility to register editors and common namespace for keeping reference to all editor classes
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersString = require('./helpers/string');

exports.registerEditor = registerEditor;
exports.getEditor = getEditor;
exports.hasEditor = hasEditor;
exports.getEditorConstructor = getEditorConstructor;

var registeredEditorNames = {},
    registeredEditorClasses = new WeakMap();

// support for older versions of Handsontable
Handsontable.editors = Handsontable.editors || {};
Handsontable.editors.registerEditor = registerEditor;
Handsontable.editors.getEditor = getEditor;

function RegisteredEditor(editorClass) {
  var Clazz, instances;

  instances = {};
  Clazz = editorClass;

  this.getConstructor = function () {
    return editorClass;
  };

  this.getInstance = function (hotInstance) {
    if (!(hotInstance.guid in instances)) {
      instances[hotInstance.guid] = new Clazz(hotInstance);
    }

    return instances[hotInstance.guid];
  };
}

/**
 * Registers editor under given name
 * @param {String} editorName
 * @param {Function} editorClass
 */
function registerEditor(editorName, editorClass) {
  var editor = new RegisteredEditor(editorClass);

  if (typeof editorName === 'string') {
    registeredEditorNames[editorName] = editor;
    Handsontable.editors[(0, _helpersString.toUpperCaseFirst)(editorName) + 'Editor'] = editorClass;
  }
  registeredEditorClasses.set(editorClass, editor);
}

/**
 * Returns instance (singleton) of editor class
 *
 * @param {String} editorName
 * @param {Object} hotInstance
 * @returns {Function} editorClass
 */
function getEditor(editorName, hotInstance) {
  var editor;

  if (typeof editorName == 'function') {
    if (!registeredEditorClasses.get(editorName)) {
      registerEditor(null, editorName);
    }
    editor = registeredEditorClasses.get(editorName);
  } else if (typeof editorName == 'string') {
    editor = registeredEditorNames[editorName];
  } else {
    throw Error('Only strings and functions can be passed as "editor" parameter ');
  }

  if (!editor) {
    throw Error('No editor registered under name "' + editorName + '"');
  }

  return editor.getInstance(hotInstance);
}

/**
 * Get editor constructor class
 *
 * @param {String} editorName
 * @returns {Function}
 */
function getEditorConstructor(editorName) {
  var editor;

  if (typeof editorName == 'string') {
    editor = registeredEditorNames[editorName];
  } else {
    throw Error('Only strings and functions can be passed as "editor" parameter ');
  }

  if (!editor) {
    throw Error('No editor registered under name "' + editorName + '"');
  }

  return editor.getConstructor();
}

/**
 * @param editorName
 * @returns {Boolean}
 */
function hasEditor(editorName) {
  return registeredEditorNames[editorName] ? true : false;
}

},{"./helpers/string":57}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersMixed = require('./../helpers/mixed');

var _rdpartyWalkontableSrcCellCoords = require('./../3rdparty/walkontable/src/cell/coords');

exports.BaseEditor = BaseEditor;

Handsontable.editors = Handsontable.editors || {};
Handsontable.editors.BaseEditor = BaseEditor;

Handsontable.EditorState = {
  VIRGIN: 'STATE_VIRGIN', //before editing
  EDITING: 'STATE_EDITING',
  WAITING: 'STATE_WAITING', //waiting for async validation
  FINISHED: 'STATE_FINISHED'
};

function BaseEditor(instance) {
  this.instance = instance;
  this.state = Handsontable.EditorState.VIRGIN;

  this._opened = false;
  this._fullEditMode = false;
  this._closeCallback = null;

  this.init();
}

BaseEditor.prototype._fireCallbacks = function (result) {
  if (this._closeCallback) {
    this._closeCallback(result);
    this._closeCallback = null;
  }
};

BaseEditor.prototype.init = function () {};

BaseEditor.prototype.getValue = function () {
  throw Error('Editor getValue() method unimplemented');
};

BaseEditor.prototype.setValue = function (newValue) {
  throw Error('Editor setValue() method unimplemented');
};

BaseEditor.prototype.open = function () {
  throw Error('Editor open() method unimplemented');
};

BaseEditor.prototype.close = function () {
  throw Error('Editor close() method unimplemented');
};

BaseEditor.prototype.prepare = function (row, col, prop, td, originalValue, cellProperties) {
  this.TD = td;
  this.row = row;
  this.col = col;
  this.prop = prop;
  this.originalValue = originalValue;
  this.cellProperties = cellProperties;

  this.state = Handsontable.EditorState.VIRGIN;
};

BaseEditor.prototype.extend = function () {
  var baseClass = this.constructor;

  function Editor() {
    baseClass.apply(this, arguments);
  }

  function inherit(Child, Parent) {
    function Bridge() {}
    Bridge.prototype = Parent.prototype;
    Child.prototype = new Bridge();
    Child.prototype.constructor = Child;

    return Child;
  }

  return inherit(Editor, baseClass);
};

BaseEditor.prototype.saveValue = function (val, ctrlDown) {
  var sel, tmp;

  // if ctrl+enter and multiple cells selected, behave like Excel (finish editing and apply to all cells)
  if (ctrlDown) {
    sel = this.instance.getSelected();

    if (sel[0] > sel[2]) {
      tmp = sel[0];
      sel[0] = sel[2];
      sel[2] = tmp;
    }
    if (sel[1] > sel[3]) {
      tmp = sel[1];
      sel[1] = sel[3];
      sel[3] = tmp;
    }

    this.instance.populateFromArray(sel[0], sel[1], val, sel[2], sel[3], 'edit');
  } else {
    this.instance.populateFromArray(this.row, this.col, val, null, null, 'edit');
  }
};

BaseEditor.prototype.beginEditing = function (initialValue, event) {
  if (this.state != Handsontable.EditorState.VIRGIN) {
    return;
  }
  this.instance.view.scrollViewport(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(this.row, this.col));
  this.instance.view.render();
  this.state = Handsontable.EditorState.EDITING;

  initialValue = typeof initialValue == 'string' ? initialValue : this.originalValue;
  this.setValue((0, _helpersMixed.stringify)(initialValue));

  this.open(event);
  this._opened = true;
  this.focus();

  // only rerender the selections (FillHandle should disappear when beginediting is triggered)
  this.instance.view.render();
};

BaseEditor.prototype.finishEditing = function (restoreOriginalValue, ctrlDown, callback) {
  var _this = this,
      val;

  if (callback) {
    var previousCloseCallback = this._closeCallback;

    this._closeCallback = function (result) {
      if (previousCloseCallback) {
        previousCloseCallback(result);
      }
      callback(result);
    };
  }

  if (this.isWaiting()) {
    return;
  }

  if (this.state == Handsontable.EditorState.VIRGIN) {
    this.instance._registerTimeout(setTimeout(function () {
      _this._fireCallbacks(true);
    }, 0));

    return;
  }

  if (this.state == Handsontable.EditorState.EDITING) {
    if (restoreOriginalValue) {
      this.cancelChanges();
      this.instance.view.render();

      return;
    }

    if (this.instance.getSettings().trimWhitespace) {
      // String.prototype.trim is defined in Walkontable polyfill.js
      val = [
      // We trim only string values
      [typeof this.getValue() === 'string' ? String.prototype.trim.call(this.getValue() || '') : this.getValue()]];
    } else {
      val = [[this.getValue()]];
    }

    this.state = Handsontable.EditorState.WAITING;
    this.saveValue(val, ctrlDown);

    if (this.instance.getCellValidator(this.cellProperties)) {
      this.instance.addHookOnce('postAfterValidate', function (result) {
        _this.state = Handsontable.EditorState.FINISHED;
        _this.discardEditor(result);
      });
    } else {
      this.state = Handsontable.EditorState.FINISHED;
      this.discardEditor(true);
    }
  }
};

BaseEditor.prototype.cancelChanges = function () {
  this.state = Handsontable.EditorState.FINISHED;
  this.discardEditor();
};

BaseEditor.prototype.discardEditor = function (result) {
  if (this.state !== Handsontable.EditorState.FINISHED) {
    return;
  }
  // validator was defined and failed
  if (result === false && this.cellProperties.allowInvalid !== true) {
    this.instance.selectCell(this.row, this.col);
    this.focus();
    this.state = Handsontable.EditorState.EDITING;
    this._fireCallbacks(false);
  } else {
    this.close();
    this._opened = false;
    this._fullEditMode = false;
    this.state = Handsontable.EditorState.VIRGIN;
    this._fireCallbacks(true);
  }
};

/**
 * Switch editor into full edit mode. In this state navigation keys don't close editor. This mode is activated
 * automatically after hit ENTER or F2 key on the cell or while editing cell press F2 key.
 */
BaseEditor.prototype.enableFullEditMode = function () {
  this._fullEditMode = true;
};

/**
 * Checks if editor is in full edit mode.
 *
 * @returns {Boolean}
 */
BaseEditor.prototype.isInFullEditMode = function () {
  return this._fullEditMode;
};

BaseEditor.prototype.isOpened = function () {
  return this._opened;
};

BaseEditor.prototype.isWaiting = function () {
  return this.state === Handsontable.EditorState.WAITING;
};

},{"./../3rdparty/walkontable/src/cell/coords":11,"./../helpers/mixed":53}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersUnicode = require('./../helpers/unicode');

var _helpersMixed = require('./../helpers/mixed');

var _helpersArray = require('./../helpers/array');

var _helpersDomElement = require('./../helpers/dom/element');

var _editors = require('./../editors');

var _handsontableEditor = require('./handsontableEditor');

var AutocompleteEditor = _handsontableEditor.HandsontableEditor.prototype.extend();

/**
 * @private
 * @editor AutocompleteEditor
 * @class AutocompleteEditor
 * @dependencies HandsontableEditor
 */
AutocompleteEditor.prototype.init = function () {
  _handsontableEditor.HandsontableEditor.prototype.init.apply(this, arguments);

  this.query = null;
  this.choices = [];
};

AutocompleteEditor.prototype.createElements = function () {
  _handsontableEditor.HandsontableEditor.prototype.createElements.apply(this, arguments);

  (0, _helpersDomElement.addClass)(this.htContainer, 'autocompleteEditor');
  (0, _helpersDomElement.addClass)(this.htContainer, window.navigator.platform.indexOf('Mac') !== -1 ? 'htMacScroll' : '');
};

var skipOne = false;
function onBeforeKeyDown(event) {
  skipOne = false;
  var editor = this.getActiveEditor();

  if ((0, _helpersUnicode.isPrintableChar)(event.keyCode) || event.keyCode === _helpersUnicode.KEY_CODES.BACKSPACE || event.keyCode === _helpersUnicode.KEY_CODES.DELETE || event.keyCode === _helpersUnicode.KEY_CODES.INSERT) {
    var timeOffset = 0;

    // on ctl+c / cmd+c don't update suggestion list
    if (event.keyCode === _helpersUnicode.KEY_CODES.C && (event.ctrlKey || event.metaKey)) {
      return;
    }
    if (!editor.isOpened()) {
      timeOffset += 10;
    }

    if (editor.htEditor) {
      editor.instance._registerTimeout(setTimeout(function () {
        editor.queryChoices(editor.TEXTAREA.value);
        skipOne = true;
      }, timeOffset));
    }
  }
}

AutocompleteEditor.prototype.prepare = function () {
  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
  _handsontableEditor.HandsontableEditor.prototype.prepare.apply(this, arguments);
};

AutocompleteEditor.prototype.open = function () {
  // Ugly fix for handsontable which grab window object for autocomplete scroll listener instead table element.
  this.TEXTAREA_PARENT.style.overflow = 'auto';
  _handsontableEditor.HandsontableEditor.prototype.open.apply(this, arguments);
  this.TEXTAREA_PARENT.style.overflow = '';

  var choicesListHot = this.htEditor.getInstance();
  var that = this;
  var trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;

  this.TEXTAREA.style.visibility = 'visible';
  this.focus();

  choicesListHot.updateSettings({
    colWidths: trimDropdown ? [(0, _helpersDomElement.outerWidth)(this.TEXTAREA) - 2] : void 0,
    width: trimDropdown ? (0, _helpersDomElement.outerWidth)(this.TEXTAREA) + (0, _helpersDomElement.getScrollbarWidth)() + 2 : void 0,
    afterRenderer: function afterRenderer(TD, row, col, prop, value) {
      var caseSensitive = this.getCellMeta(row, col).filteringCaseSensitive === true,
          indexOfMatch,
          match,
          value = (0, _helpersMixed.stringify)(value);

      if (value) {
        indexOfMatch = caseSensitive ? value.indexOf(this.query) : value.toLowerCase().indexOf(that.query.toLowerCase());

        if (indexOfMatch != -1) {
          match = value.substr(indexOfMatch, that.query.length);
          TD.innerHTML = value.replace(match, '<strong>' + match + '</strong>');
        }
      }
    },
    autoColumnSize: true,
    modifyColWidth: function modifyColWidth(width, col) {
      // workaround for <strong> text overlapping the dropdown, not really accurate
      var autoWidths = this.getPlugin('autoColumnSize').widths;

      if (autoWidths[col]) {
        width = autoWidths[col];
      }

      return trimDropdown ? width : width + 15;
    }
  });

  // Add additional space for autocomplete holder
  this.htEditor.view.wt.wtTable.holder.parentNode.style['padding-right'] = (0, _helpersDomElement.getScrollbarWidth)() + 2 + 'px';

  if (skipOne) {
    skipOne = false;
  }

  that.instance._registerTimeout(setTimeout(function () {
    that.queryChoices(that.TEXTAREA.value);
  }, 0));
};

AutocompleteEditor.prototype.close = function () {
  _handsontableEditor.HandsontableEditor.prototype.close.apply(this, arguments);
};
AutocompleteEditor.prototype.queryChoices = function (query) {
  this.query = query;

  if (typeof this.cellProperties.source == 'function') {
    var that = this;

    this.cellProperties.source(query, function (choices) {
      that.updateChoicesList(choices);
    });
  } else if (Array.isArray(this.cellProperties.source)) {

    var choices;

    if (!query || this.cellProperties.filter === false) {
      choices = this.cellProperties.source;
    } else {

      var filteringCaseSensitive = this.cellProperties.filteringCaseSensitive === true;
      var lowerCaseQuery = query.toLowerCase();

      choices = this.cellProperties.source.filter(function (choice) {

        if (filteringCaseSensitive) {
          return choice.indexOf(query) != -1;
        } else {
          return choice.toLowerCase().indexOf(lowerCaseQuery) != -1;
        }
      });
    }

    this.updateChoicesList(choices);
  } else {
    this.updateChoicesList([]);
  }
};

AutocompleteEditor.prototype.updateChoicesList = function (choices) {
  var pos = (0, _helpersDomElement.getCaretPosition)(this.TEXTAREA),
      endPos = (0, _helpersDomElement.getSelectionEndPosition)(this.TEXTAREA);

  var orderByRelevance = AutocompleteEditor.sortByRelevance(this.getValue(), choices, this.cellProperties.filteringCaseSensitive);
  var highlightIndex;

  /* jshint ignore:start */
  if (this.cellProperties.filter != false) {
    var sorted = [];
    for (var i = 0, choicesCount = orderByRelevance.length; i < choicesCount; i++) {
      sorted.push(choices[orderByRelevance[i]]);
    }
    highlightIndex = 0;
    choices = sorted;
  } else {
    highlightIndex = orderByRelevance[0];
  }
  /* jshint ignore:end */

  this.choices = choices;
  this.htEditor.loadData((0, _helpersArray.pivot)([choices]));

  this.updateDropdownHeight();

  if (this.cellProperties.strict === true) {
    this.highlightBestMatchingChoice(highlightIndex);
  }

  this.instance.listen();
  this.TEXTAREA.focus();
  (0, _helpersDomElement.setCaretPosition)(this.TEXTAREA, pos, pos != endPos ? endPos : void 0);
};

AutocompleteEditor.prototype.updateDropdownHeight = function () {
  var currentDropdownWidth = this.htEditor.getColWidth(0) + (0, _helpersDomElement.getScrollbarWidth)() + 2;
  var trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;

  this.htEditor.updateSettings({
    height: this.getDropdownHeight(),
    width: trimDropdown ? void 0 : currentDropdownWidth
  });

  this.htEditor.view.wt.wtTable.alignOverlaysWithTrimmingContainer();
};

AutocompleteEditor.prototype.finishEditing = function (restoreOriginalValue) {
  if (!restoreOriginalValue) {
    this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
  }
  _handsontableEditor.HandsontableEditor.prototype.finishEditing.apply(this, arguments);
};

AutocompleteEditor.prototype.highlightBestMatchingChoice = function (index) {
  if (typeof index === "number") {
    this.htEditor.selectCell(index, 0);
  } else {
    this.htEditor.deselectCell();
  }
};

/**
 * Filters and sorts by relevance
 * @param value
 * @param choices
 * @param caseSensitive
 * @returns {Array} array of indexes in original choices array
 */
AutocompleteEditor.sortByRelevance = function (value, choices, caseSensitive) {

  var choicesRelevance = [],
      currentItem,
      valueLength = value.length,
      valueIndex,
      charsLeft,
      result = [],
      i,
      choicesCount;

  if (valueLength === 0) {
    for (i = 0, choicesCount = choices.length; i < choicesCount; i++) {
      result.push(i);
    }
    return result;
  }

  for (i = 0, choicesCount = choices.length; i < choicesCount; i++) {
    currentItem = (0, _helpersMixed.stringify)(choices[i]);

    if (caseSensitive) {
      valueIndex = currentItem.indexOf(value);
    } else {
      valueIndex = currentItem.toLowerCase().indexOf(value.toLowerCase());
    }

    if (valueIndex == -1) {
      continue;
    }
    charsLeft = currentItem.length - valueIndex - valueLength;

    choicesRelevance.push({
      baseIndex: i,
      index: valueIndex,
      charsLeft: charsLeft,
      value: currentItem
    });
  }

  choicesRelevance.sort(function (a, b) {

    if (b.index === -1) {
      return -1;
    }
    if (a.index === -1) {
      return 1;
    }

    if (a.index < b.index) {
      return -1;
    } else if (b.index < a.index) {
      return 1;
    } else if (a.index === b.index) {
      if (a.charsLeft < b.charsLeft) {
        return -1;
      } else if (a.charsLeft > b.charsLeft) {
        return 1;
      } else {
        return 0;
      }
    }
  });

  for (i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
    result.push(choicesRelevance[i].baseIndex);
  }

  return result;
};

AutocompleteEditor.prototype.getDropdownHeight = function () {
  var firstRowHeight = this.htEditor.getInstance().getRowHeight(0) || 23;
  var _visibleRows = this.cellProperties.visibleRows;

  return this.choices.length >= _visibleRows ? _visibleRows * firstRowHeight : this.choices.length * firstRowHeight + 8;
};

AutocompleteEditor.prototype.allowKeyEventPropagation = function (keyCode) {
  var selected = { row: this.htEditor.getSelectedRange() ? this.htEditor.getSelectedRange().from.row : -1 };
  var allowed = false;

  if (keyCode === _helpersUnicode.KEY_CODES.ARROW_DOWN && selected.row < this.htEditor.countRows() - 1) {
    allowed = true;
  }
  if (keyCode === _helpersUnicode.KEY_CODES.ARROW_UP && selected.row > -1) {
    allowed = true;
  }

  return allowed;
};

exports.AutocompleteEditor = AutocompleteEditor;

(0, _editors.registerEditor)('autocomplete', AutocompleteEditor);

},{"./../editors":34,"./../helpers/array":47,"./../helpers/dom/element":50,"./../helpers/mixed":53,"./../helpers/unicode":58,"./handsontableEditor":40}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _editors = require('./../editors');

var _baseEditor = require('./_baseEditor');

var _helpersDomElement = require('./../helpers/dom/element');

/**
 * @private
 * @editor CheckboxEditor
 * @class CheckboxEditor
 */

var CheckboxEditor = (function (_BaseEditor) {
  _inherits(CheckboxEditor, _BaseEditor);

  function CheckboxEditor() {
    _classCallCheck(this, CheckboxEditor);

    _get(Object.getPrototypeOf(CheckboxEditor.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CheckboxEditor, [{
    key: 'beginEditing',
    value: function beginEditing() {
      var checkbox = this.TD.querySelector('input[type="checkbox"]');

      if (!(0, _helpersDomElement.hasClass)(checkbox, 'htBadValue')) {
        checkbox.click();
      }
    }
  }, {
    key: 'finishEditing',
    value: function finishEditing() {}
  }, {
    key: 'init',
    value: function init() {}
  }, {
    key: 'open',
    value: function open() {}
  }, {
    key: 'close',
    value: function close() {}
  }, {
    key: 'getValue',
    value: function getValue() {}
  }, {
    key: 'setValue',
    value: function setValue() {}
  }, {
    key: 'focus',
    value: function focus() {}
  }]);

  return CheckboxEditor;
})(_baseEditor.BaseEditor);

exports.CheckboxEditor = CheckboxEditor;

(0, _editors.registerEditor)('checkbox', CheckboxEditor);

},{"./../editors":34,"./../helpers/dom/element":50,"./_baseEditor":35}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helpersDomElement = require('./../helpers/dom/element');

var _helpersObject = require('./../helpers/object');

var _eventManager = require('./../eventManager');

var _editors = require('./../editors');

var _helpersUnicode = require('./../helpers/unicode');

var _helpersDomEvent = require('./../helpers/dom/event');

var _textEditor = require('./textEditor');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _pikaday = require('pikaday');

var _pikaday2 = _interopRequireDefault(_pikaday);

Handsontable.editors = Handsontable.editors || {};
Handsontable.editors.DateEditor = DateEditor;

/**
 * @private
 * @editor DateEditor
 * @class DateEditor
 * @dependencies TextEditor moment pikaday
 */

var DateEditor = (function (_TextEditor) {
  _inherits(DateEditor, _TextEditor);

  /**
   * @param {Core} hotInstance Handsontable instance
   */

  function DateEditor(hotInstance) {
    _classCallCheck(this, DateEditor);

    _get(Object.getPrototypeOf(DateEditor.prototype), 'constructor', this).call(this, hotInstance);

    this.$datePicker = null;
    this.datePicker = null;
    this.datePickerStyle = null;
    this.defaultDateFormat = 'DD/MM/YYYY';
    this.isCellEdited = false;
    this.parentDestroyed = false;
  }

  _createClass(DateEditor, [{
    key: 'init',
    value: function init() {
      var _this = this;

      if (typeof _moment2['default'] !== 'function') {
        throw new Error("You need to include moment.js to your project.");
      }

      if (typeof _pikaday2['default'] !== 'function') {
        throw new Error("You need to include Pikaday to your project.");
      }
      _get(Object.getPrototypeOf(DateEditor.prototype), 'init', this).call(this);
      this.instance.addHook('afterDestroy', function () {
        _this.parentDestroyed = true;
        _this.destroyElements();
      });
    }

    /**
     * Create data picker instance
     */
  }, {
    key: 'createElements',
    value: function createElements() {
      _get(Object.getPrototypeOf(DateEditor.prototype), 'createElements', this).call(this);

      this.datePicker = document.createElement('DIV');
      this.datePickerStyle = this.datePicker.style;
      this.datePickerStyle.position = 'absolute';
      this.datePickerStyle.top = 0;
      this.datePickerStyle.left = 0;
      this.datePickerStyle.zIndex = 9999;

      (0, _helpersDomElement.addClass)(this.datePicker, 'htDatepickerHolder');
      document.body.appendChild(this.datePicker);

      this.$datePicker = new _pikaday2['default'](this.getDatePickerConfig());
      var eventManager = new _eventManager.EventManager(this);

      /**
       * Prevent recognizing clicking on datepicker as clicking outside of table
       */
      eventManager.addEventListener(this.datePicker, 'mousedown', function (event) {
        return (0, _helpersDomEvent.stopPropagation)(event);
      });
      this.hideDatepicker();
    }

    /**
     * Destroy data picker instance
     */
  }, {
    key: 'destroyElements',
    value: function destroyElements() {
      this.$datePicker.destroy();
    }

    /**
     * Prepare editor to appear
     *
     * @param {Number} row Row index
     * @param {Number} col Column index
     * @param {String} prop Property name (passed when datasource is an array of objects)
     * @param {HTMLTableCellElement} td Table cell element
     * @param {*} originalValue Original value
     * @param {Object} cellProperties Object with cell properties ({@see Core#getCellMeta})
     */
  }, {
    key: 'prepare',
    value: function prepare(row, col, prop, td, originalValue, cellProperties) {
      this._opened = false;
      _get(Object.getPrototypeOf(DateEditor.prototype), 'prepare', this).call(this, row, col, prop, td, originalValue, cellProperties);
    }

    /**
     * Open editor
     *
     * @param {Event} [event=null]
     */
  }, {
    key: 'open',
    value: function open() {
      var event = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      _get(Object.getPrototypeOf(DateEditor.prototype), 'open', this).call(this);
      this.showDatepicker(event);
    }

    /**
     * Close editor
     */
  }, {
    key: 'close',
    value: function close() {
      var _this2 = this;

      this._opened = false;
      this.instance._registerTimeout(setTimeout(function () {
        _this2.instance.selection.refreshBorders();
      }, 0));

      _get(Object.getPrototypeOf(DateEditor.prototype), 'close', this).call(this);
    }

    /**
     * @param {Boolean} [isCancelled=false]
     * @param {Boolean} [ctrlDown=false]
     */
  }, {
    key: 'finishEditing',
    value: function finishEditing() {
      var isCancelled = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
      var ctrlDown = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (isCancelled) {
        // pressed ESC, restore original value
        // var value = this.instance.getDataAtCell(this.row, this.col);
        var value = this.originalValue;

        if (value !== void 0) {
          this.setValue(value);
        }
      }
      this.hideDatepicker();
      _get(Object.getPrototypeOf(DateEditor.prototype), 'finishEditing', this).call(this, isCancelled, ctrlDown);
    }

    /**
     * Show data picker
     *
     * @param {Event} event
     */
  }, {
    key: 'showDatepicker',
    value: function showDatepicker(event) {
      this.$datePicker.config(this.getDatePickerConfig());

      var offset = this.TD.getBoundingClientRect();
      var dateFormat = this.cellProperties.dateFormat || this.defaultDateFormat;
      var datePickerConfig = this.$datePicker.config();
      var dateStr = undefined;
      var isMouseDown = this.instance.view.isMouseDown();
      var isMeta = event ? (0, _helpersUnicode.isMetaKey)(event.keyCode) : false;

      this.datePickerStyle.top = window.pageYOffset + offset.top + (0, _helpersDomElement.outerHeight)(this.TD) + 'px';
      this.datePickerStyle.left = window.pageXOffset + offset.left + 'px';

      this.$datePicker._onInputFocus = function () {};
      datePickerConfig.format = dateFormat;

      if (this.originalValue) {
        dateStr = this.originalValue;

        if ((0, _moment2['default'])(dateStr, dateFormat, true).isValid()) {
          this.$datePicker.setMoment((0, _moment2['default'])(dateStr, dateFormat), true);
        }
        if (!isMeta && !isMouseDown) {
          this.setValue('');
        }
      } else {
        if (this.cellProperties.defaultDate) {
          dateStr = this.cellProperties.defaultDate;

          datePickerConfig.defaultDate = dateStr;

          if ((0, _moment2['default'])(dateStr, dateFormat, true).isValid()) {
            this.$datePicker.setMoment((0, _moment2['default'])(dateStr, dateFormat), true);
          }

          if (!isMeta && !isMouseDown) {
            this.setValue('');
          }
        } else {
          // if a default date is not defined, set a soft-default-date: display the current day and month in the
          // datepicker, but don't fill the editor input
          this.$datePicker.gotoToday();
        }
      }

      this.datePickerStyle.display = 'block';
      this.$datePicker.show();
    }

    /**
     * Hide data picker
     */
  }, {
    key: 'hideDatepicker',
    value: function hideDatepicker() {
      this.datePickerStyle.display = 'none';
      this.$datePicker.hide();
    }

    /**
     * Get date picker options.
     *
     * @returns {Object}
     */
  }, {
    key: 'getDatePickerConfig',
    value: function getDatePickerConfig() {
      var _this3 = this;

      var htInput = this.TEXTAREA;
      var options = {};

      if (this.cellProperties && this.cellProperties.datePickerConfig) {
        (0, _helpersObject.deepExtend)(options, this.cellProperties.datePickerConfig);
      }
      var origOnSelect = options.onSelect;
      var origOnClose = options.onClose;

      options.field = htInput;
      options.trigger = htInput;
      options.container = this.datePicker;
      options.bound = false;
      options.format = options.format || this.defaultDateFormat;
      options.reposition = options.reposition || false;
      options.onSelect = function (dateStr) {
        if (!isNaN(dateStr.getTime())) {
          dateStr = (0, _moment2['default'])(dateStr).format(_this3.cellProperties.dateFormat || _this3.defaultDateFormat);
        }
        _this3.setValue(dateStr);
        _this3.hideDatepicker();

        if (origOnSelect) {
          origOnSelect();
        }
      };
      options.onClose = function () {
        if (!_this3.parentDestroyed) {
          _this3.finishEditing(false);
        }
        if (origOnClose) {
          origOnClose();
        }
      };

      return options;
    }
  }]);

  return DateEditor;
})(_textEditor.TextEditor);

exports.DateEditor = DateEditor;

(0, _editors.registerEditor)('date', DateEditor);

},{"./../editors":34,"./../eventManager":46,"./../helpers/dom/element":50,"./../helpers/dom/event":51,"./../helpers/object":55,"./../helpers/unicode":58,"./textEditor":45,"moment":4,"pikaday":6}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _editors = require('./../editors');

var _autocompleteEditor = require('./autocompleteEditor');

/**
 * @private
 * @editor DropdownEditor
 * @class DropdownEditor
 * @dependencies AutocompleteEditor
 */

var DropdownEditor = (function (_AutocompleteEditor) {
  _inherits(DropdownEditor, _AutocompleteEditor);

  function DropdownEditor() {
    _classCallCheck(this, DropdownEditor);

    _get(Object.getPrototypeOf(DropdownEditor.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DropdownEditor, [{
    key: 'prepare',
    value: function prepare(row, col, prop, td, originalValue, cellProperties) {
      _get(Object.getPrototypeOf(DropdownEditor.prototype), 'prepare', this).call(this, row, col, prop, td, originalValue, cellProperties);
      this.cellProperties.filter = false;
      this.cellProperties.strict = true;
    }
  }]);

  return DropdownEditor;
})(_autocompleteEditor.AutocompleteEditor);

Handsontable.hooks.add('beforeValidate', function (value, row, col, source) {
  var cellMeta = this.getCellMeta(row, col);

  if (cellMeta.editor === Handsontable.editors.DropdownEditor) {
    if (cellMeta.strict === void 0) {
      cellMeta.filter = false;
      cellMeta.strict = true;
    }
  }
});

exports.DropdownEditor = DropdownEditor;

(0, _editors.registerEditor)('dropdown', DropdownEditor);

},{"./../editors":34,"./autocompleteEditor":36}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersUnicode = require('./../helpers/unicode');

var _helpersObject = require('./../helpers/object');

var _helpersDomElement = require('./../helpers/dom/element');

var _helpersDomEvent = require('./../helpers/dom/event');

var _editors = require('./../editors');

var _textEditor = require('./textEditor');

var HandsontableEditor = _textEditor.TextEditor.prototype.extend();

/**
 * @private
 * @editor HandsontableEditor
 * @class HandsontableEditor
 * @dependencies TextEditor
 */
HandsontableEditor.prototype.createElements = function () {
  _textEditor.TextEditor.prototype.createElements.apply(this, arguments);

  var DIV = document.createElement('DIV');
  DIV.className = 'handsontableEditor';
  this.TEXTAREA_PARENT.appendChild(DIV);

  this.htContainer = DIV;
  this.assignHooks();
};

HandsontableEditor.prototype.prepare = function (td, row, col, prop, value, cellProperties) {

  _textEditor.TextEditor.prototype.prepare.apply(this, arguments);

  var parent = this;
  var options = {
    startRows: 0,
    startCols: 0,
    minRows: 0,
    minCols: 0,
    className: 'listbox',
    copyPaste: false,
    autoColumnSize: false,
    autoRowSize: false,
    readOnly: true,
    fillHandle: false,
    afterOnCellMouseDown: function afterOnCellMouseDown() {
      var value = this.getValue();

      // if the value is undefined then it means we don't want to set the value
      if (value !== void 0) {
        parent.setValue(value);
      }
      parent.instance.destroyEditor();
    }
  };

  if (this.cellProperties.handsontable) {
    (0, _helpersObject.extend)(options, cellProperties.handsontable);
  }
  this.htOptions = options;
};

var onBeforeKeyDown = function onBeforeKeyDown(event) {
  if ((0, _helpersDomEvent.isImmediatePropagationStopped)(event)) {
    return;
  }
  var editor = this.getActiveEditor();

  var innerHOT = editor.htEditor.getInstance(); //Handsontable.tmpHandsontable(editor.htContainer, 'getInstance');

  var rowToSelect;

  if (event.keyCode == _helpersUnicode.KEY_CODES.ARROW_DOWN) {
    if (!innerHOT.getSelected()) {
      rowToSelect = 0;
    } else {
      var selectedRow = innerHOT.getSelected()[0];
      var lastRow = innerHOT.countRows() - 1;
      rowToSelect = Math.min(lastRow, selectedRow + 1);
    }
  } else if (event.keyCode == _helpersUnicode.KEY_CODES.ARROW_UP) {
    if (innerHOT.getSelected()) {
      var selectedRow = innerHOT.getSelected()[0];
      rowToSelect = selectedRow - 1;
    }
  }

  if (rowToSelect !== void 0) {
    if (rowToSelect < 0) {
      innerHOT.deselectCell();
    } else {
      innerHOT.selectCell(rowToSelect, 0);
    }
    if (innerHOT.getData().length) {
      event.preventDefault();
      (0, _helpersDomEvent.stopImmediatePropagation)(event);

      editor.instance.listen();
      editor.TEXTAREA.focus();
    }
  }
};

HandsontableEditor.prototype.open = function () {

  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);

  _textEditor.TextEditor.prototype.open.apply(this, arguments);

  if (this.htEditor) {
    this.htEditor.destroy();
  }
  this.htEditor = new Handsontable(this.htContainer, this.htOptions);

  if (this.cellProperties.strict) {
    this.htEditor.selectCell(0, 0);
    this.TEXTAREA.style.visibility = 'hidden';
  } else {
    this.htEditor.deselectCell();
    this.TEXTAREA.style.visibility = 'visible';
  }

  (0, _helpersDomElement.setCaretPosition)(this.TEXTAREA, 0, this.TEXTAREA.value.length);
};

HandsontableEditor.prototype.close = function () {
  this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
  this.instance.listen();

  _textEditor.TextEditor.prototype.close.apply(this, arguments);
};

HandsontableEditor.prototype.focus = function () {
  this.instance.listen();
  _textEditor.TextEditor.prototype.focus.apply(this, arguments);
};

HandsontableEditor.prototype.beginEditing = function (initialValue) {
  var onBeginEditing = this.instance.getSettings().onBeginEditing;

  if (onBeginEditing && onBeginEditing() === false) {
    return;
  }
  _textEditor.TextEditor.prototype.beginEditing.apply(this, arguments);
};

HandsontableEditor.prototype.finishEditing = function (isCancelled, ctrlDown) {
  if (this.htEditor && this.htEditor.isListening()) {
    //if focus is still in the HOT editor

    //if (Handsontable.tmpHandsontable(this.htContainer,'isListening')) { //if focus is still in the HOT editor
    //if (this.$htContainer.handsontable('isListening')) { //if focus is still in the HOT editor
    this.instance.listen(); //return the focus to the parent HOT instance
  }

  if (this.htEditor && this.htEditor.getSelected()) {
    //if (Handsontable.tmpHandsontable(this.htContainer,'getSelected')) {
    //if (this.$htContainer.handsontable('getSelected')) {
    //  var value = this.$htContainer.handsontable('getInstance').getValue();
    var value = this.htEditor.getInstance().getValue();
    //var value = Handsontable.tmpHandsontable(this.htContainer,'getInstance').getValue();
    if (value !== void 0) {
      //if the value is undefined then it means we don't want to set the value
      this.setValue(value);
    }
  }

  return _textEditor.TextEditor.prototype.finishEditing.apply(this, arguments);
};

HandsontableEditor.prototype.assignHooks = function () {
  var _this = this;

  this.instance.addHook('afterDestroy', function () {
    if (_this.htEditor) {
      _this.htEditor.destroy();
    }
  });
};

exports.HandsontableEditor = HandsontableEditor;

(0, _editors.registerEditor)('handsontable', HandsontableEditor);

},{"./../editors":34,"./../helpers/dom/element":50,"./../helpers/dom/event":51,"./../helpers/object":55,"./../helpers/unicode":58,"./textEditor":45}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersUnicode = require('./../helpers/unicode');

var _helpersDomEvent = require('./../helpers/dom/event');

var _helpersDomElement = require('./../helpers/dom/element');

var _editors = require('./../editors');

var _baseEditor = require('./_baseEditor');

var _eventManager = require('./../eventManager');

var MobileTextEditor = _baseEditor.BaseEditor.prototype.extend(),
    domDimensionsCache = {};

/**
 * @private
 * @editor MobileTextEditor
 * @class MobileTextEditor
 */
var createControls = function createControls() {
  this.controls = {};

  this.controls.leftButton = document.createElement('DIV');
  this.controls.leftButton.className = 'leftButton';
  this.controls.rightButton = document.createElement('DIV');
  this.controls.rightButton.className = 'rightButton';
  this.controls.upButton = document.createElement('DIV');
  this.controls.upButton.className = 'upButton';
  this.controls.downButton = document.createElement('DIV');
  this.controls.downButton.className = 'downButton';

  for (var button in this.controls) {
    if (this.controls.hasOwnProperty(button)) {
      this.positionControls.appendChild(this.controls[button]);
    }
  }
};

MobileTextEditor.prototype.valueChanged = function () {
  return this.initValue != this.getValue();
};

MobileTextEditor.prototype.init = function () {
  var that = this;
  this.eventManager = (0, _eventManager.eventManager)(this.instance);

  this.createElements();
  this.bindEvents();

  this.instance.addHook('afterDestroy', function () {
    that.destroy();
  });
};

MobileTextEditor.prototype.getValue = function () {
  return this.TEXTAREA.value;
};

MobileTextEditor.prototype.setValue = function (newValue) {
  this.initValue = newValue;

  this.TEXTAREA.value = newValue;
};

MobileTextEditor.prototype.createElements = function () {
  this.editorContainer = document.createElement('DIV');
  this.editorContainer.className = "htMobileEditorContainer";

  this.cellPointer = document.createElement('DIV');
  this.cellPointer.className = "cellPointer";

  this.moveHandle = document.createElement('DIV');
  this.moveHandle.className = "moveHandle";

  this.inputPane = document.createElement('DIV');
  this.inputPane.className = "inputs";

  this.positionControls = document.createElement('DIV');
  this.positionControls.className = "positionControls";

  this.TEXTAREA = document.createElement('TEXTAREA');
  (0, _helpersDomElement.addClass)(this.TEXTAREA, 'handsontableInput');

  this.inputPane.appendChild(this.TEXTAREA);

  this.editorContainer.appendChild(this.cellPointer);
  this.editorContainer.appendChild(this.moveHandle);
  this.editorContainer.appendChild(this.inputPane);
  this.editorContainer.appendChild(this.positionControls);

  createControls.call(this);

  document.body.appendChild(this.editorContainer);
};

MobileTextEditor.prototype.onBeforeKeyDown = function (event) {
  var instance = this;
  var that = instance.getActiveEditor();

  if (event.target !== that.TEXTAREA || (0, _helpersDomEvent.isImmediatePropagationStopped)(event)) {
    return;
  }

  switch (event.keyCode) {
    case _helpersUnicode.KEY_CODES.ENTER:
      that.close();
      event.preventDefault(); //don't add newline to field
      break;
    case _helpersUnicode.KEY_CODES.BACKSPACE:
      (0, _helpersDomEvent.stopImmediatePropagation)(event); //backspace, delete, home, end should only work locally when cell is edited (not in table context)
      break;
  }
};

MobileTextEditor.prototype.open = function () {
  this.instance.addHook('beforeKeyDown', this.onBeforeKeyDown);

  (0, _helpersDomElement.addClass)(this.editorContainer, 'active');
  (0, _helpersDomElement.removeClass)(this.cellPointer, 'hidden');

  this.updateEditorPosition();
};

MobileTextEditor.prototype.focus = function () {
  this.TEXTAREA.focus();
  (0, _helpersDomElement.setCaretPosition)(this.TEXTAREA, this.TEXTAREA.value.length);
};

MobileTextEditor.prototype.close = function () {
  this.TEXTAREA.blur();
  this.instance.removeHook('beforeKeyDown', this.onBeforeKeyDown);

  (0, _helpersDomElement.removeClass)(this.editorContainer, 'active');
};

MobileTextEditor.prototype.scrollToView = function () {
  var coords = this.instance.getSelectedRange().highlight;
  this.instance.view.scrollViewport(coords);
};

MobileTextEditor.prototype.hideCellPointer = function () {
  if (!(0, _helpersDomElement.hasClass)(this.cellPointer, 'hidden')) {
    (0, _helpersDomElement.addClass)(this.cellPointer, 'hidden');
  }
};

MobileTextEditor.prototype.updateEditorPosition = function (x, y) {
  if (x && y) {
    x = parseInt(x, 10);
    y = parseInt(y, 10);

    this.editorContainer.style.top = y + "px";
    this.editorContainer.style.left = x + "px";
  } else {
    var selection = this.instance.getSelected(),
        selectedCell = this.instance.getCell(selection[0], selection[1]);

    //cache sizes
    if (!domDimensionsCache.cellPointer) {
      domDimensionsCache.cellPointer = {
        height: (0, _helpersDomElement.outerHeight)(this.cellPointer),
        width: (0, _helpersDomElement.outerWidth)(this.cellPointer)
      };
    }
    if (!domDimensionsCache.editorContainer) {
      domDimensionsCache.editorContainer = {
        width: (0, _helpersDomElement.outerWidth)(this.editorContainer)
      };
    }

    if (selectedCell !== undefined) {
      var scrollLeft = this.instance.view.wt.wtOverlays.leftOverlay.trimmingContainer == window ? 0 : (0, _helpersDomElement.getScrollLeft)(this.instance.view.wt.wtOverlays.leftOverlay.holder);
      var scrollTop = this.instance.view.wt.wtOverlays.topOverlay.trimmingContainer == window ? 0 : (0, _helpersDomElement.getScrollTop)(this.instance.view.wt.wtOverlays.topOverlay.holder);

      var selectedCellOffset = (0, _helpersDomElement.offset)(selectedCell),
          selectedCellWidth = (0, _helpersDomElement.outerWidth)(selectedCell),
          currentScrollPosition = {
        x: scrollLeft,
        y: scrollTop
      };

      this.editorContainer.style.top = parseInt(selectedCellOffset.top + (0, _helpersDomElement.outerHeight)(selectedCell) - currentScrollPosition.y + domDimensionsCache.cellPointer.height, 10) + "px";
      this.editorContainer.style.left = parseInt(window.innerWidth / 2 - domDimensionsCache.editorContainer.width / 2, 10) + "px";

      if (selectedCellOffset.left + selectedCellWidth / 2 > parseInt(this.editorContainer.style.left, 10) + domDimensionsCache.editorContainer.width) {
        this.editorContainer.style.left = window.innerWidth - domDimensionsCache.editorContainer.width + "px";
      } else if (selectedCellOffset.left + selectedCellWidth / 2 < parseInt(this.editorContainer.style.left, 10) + 20) {
        this.editorContainer.style.left = 0 + "px";
      }

      this.cellPointer.style.left = parseInt(selectedCellOffset.left - domDimensionsCache.cellPointer.width / 2 - (0, _helpersDomElement.offset)(this.editorContainer).left + selectedCellWidth / 2 - currentScrollPosition.x, 10) + "px";
    }
  }
};

// For the optional dont-affect-editor-by-zooming feature:

//MobileTextEditor.prototype.updateEditorDimensions = function () {
//  if(!this.beginningWindowWidth) {
//    this.beginningWindowWidth = window.innerWidth;
//    this.beginningEditorWidth = Handsontable.outerWidth(this.editorContainer);
//    this.scaleRatio = this.beginningEditorWidth / this.beginningWindowWidth;
//
//    this.editorContainer.style.width = this.beginningEditorWidth + "px";
//    return;
//  }
//
//  var currentScaleRatio = this.beginningEditorWidth / window.innerWidth;
//  //if(currentScaleRatio > this.scaleRatio + 0.2 || currentScaleRatio < this.scaleRatio - 0.2) {
//  if(currentScaleRatio != this.scaleRatio) {
//    this.editorContainer.style["zoom"] = (1 - ((currentScaleRatio * this.scaleRatio) - this.scaleRatio)) * 100 + "%";
//  }
//
//};

MobileTextEditor.prototype.updateEditorData = function () {
  var selected = this.instance.getSelected(),
      selectedValue = this.instance.getDataAtCell(selected[0], selected[1]);

  this.row = selected[0];
  this.col = selected[1];
  this.setValue(selectedValue);
  this.updateEditorPosition();
};

MobileTextEditor.prototype.prepareAndSave = function () {
  var val;

  if (!this.valueChanged()) {
    return true;
  }

  if (this.instance.getSettings().trimWhitespace) {
    val = [[String.prototype.trim.call(this.getValue())]];
  } else {
    val = [[this.getValue()]];
  }

  this.saveValue(val);
};

MobileTextEditor.prototype.bindEvents = function () {
  var that = this;

  this.eventManager.addEventListener(this.controls.leftButton, "touchend", function (event) {
    that.prepareAndSave();
    that.instance.selection.transformStart(0, -1, null, true);
    that.updateEditorData();
    event.preventDefault();
  });
  this.eventManager.addEventListener(this.controls.rightButton, "touchend", function (event) {
    that.prepareAndSave();
    that.instance.selection.transformStart(0, 1, null, true);
    that.updateEditorData();
    event.preventDefault();
  });
  this.eventManager.addEventListener(this.controls.upButton, "touchend", function (event) {
    that.prepareAndSave();
    that.instance.selection.transformStart(-1, 0, null, true);
    that.updateEditorData();
    event.preventDefault();
  });
  this.eventManager.addEventListener(this.controls.downButton, "touchend", function (event) {
    that.prepareAndSave();
    that.instance.selection.transformStart(1, 0, null, true);
    that.updateEditorData();
    event.preventDefault();
  });

  this.eventManager.addEventListener(this.moveHandle, "touchstart", function (event) {
    if (event.touches.length == 1) {
      var touch = event.touches[0],
          onTouchPosition = {
        x: that.editorContainer.offsetLeft,
        y: that.editorContainer.offsetTop
      },
          onTouchOffset = {
        x: touch.pageX - onTouchPosition.x,
        y: touch.pageY - onTouchPosition.y
      };

      that.eventManager.addEventListener(this, "touchmove", function (event) {
        var touch = event.touches[0];
        that.updateEditorPosition(touch.pageX - onTouchOffset.x, touch.pageY - onTouchOffset.y);
        that.hideCellPointer();
        event.preventDefault();
      });
    }
  });

  this.eventManager.addEventListener(document.body, "touchend", function (event) {
    if (!(0, _helpersDomElement.isChildOf)(event.target, that.editorContainer) && !(0, _helpersDomElement.isChildOf)(event.target, that.instance.rootElement)) {
      that.close();
    }
  });

  this.eventManager.addEventListener(this.instance.view.wt.wtOverlays.leftOverlay.holder, "scroll", function (event) {
    if (that.instance.view.wt.wtOverlays.leftOverlay.trimmingContainer != window) {
      that.hideCellPointer();
    }
  });

  this.eventManager.addEventListener(this.instance.view.wt.wtOverlays.topOverlay.holder, "scroll", function (event) {
    if (that.instance.view.wt.wtOverlays.topOverlay.trimmingContainer != window) {
      that.hideCellPointer();
    }
  });
};

MobileTextEditor.prototype.destroy = function () {
  this.eventManager.clear();

  this.editorContainer.parentNode.removeChild(this.editorContainer);
};

exports.MobileTextEditor = MobileTextEditor;

(0, _editors.registerEditor)('mobile', MobileTextEditor);

},{"./../editors":34,"./../eventManager":46,"./../helpers/dom/element":50,"./../helpers/dom/event":51,"./../helpers/unicode":58,"./_baseEditor":35}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

var _editors = require('./../editors');

var _textEditor = require('./textEditor');

/**
 * @private
 * @editor NumericEditor
 * @class NumericEditor
 * @dependencies TextEditor numeral
 */

var NumericEditor = (function (_TextEditor) {
  _inherits(NumericEditor, _TextEditor);

  function NumericEditor() {
    _classCallCheck(this, NumericEditor);

    _get(Object.getPrototypeOf(NumericEditor.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NumericEditor, [{
    key: 'beginEditing',

    /**
     * @param {*} initialValue
     */
    value: function beginEditing(initialValue) {
      if (typeof initialValue === 'undefined' && this.originalValue) {
        if (typeof this.cellProperties.language !== 'undefined') {
          _numeral2['default'].language(this.cellProperties.language);
        }
        var decimalDelimiter = _numeral2['default'].languageData().delimiters.decimal;
        initialValue = ('' + this.originalValue).replace('.', decimalDelimiter);
      }
      _get(Object.getPrototypeOf(NumericEditor.prototype), 'beginEditing', this).call(this, initialValue);
    }
  }]);

  return NumericEditor;
})(_textEditor.TextEditor);

exports.NumericEditor = NumericEditor;

(0, _editors.registerEditor)('numeric', NumericEditor);

},{"./../editors":34,"./textEditor":45,"numeral":5}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _helpersDomElement = require('./../helpers/dom/element');

var _editors = require('./../editors');

var _textEditor = require('./textEditor');

/**
 * @private
 * @editor PasswordEditor
 * @class PasswordEditor
 * @dependencies TextEditor
 */

var PasswordEditor = (function (_TextEditor) {
  _inherits(PasswordEditor, _TextEditor);

  function PasswordEditor() {
    _classCallCheck(this, PasswordEditor);

    _get(Object.getPrototypeOf(PasswordEditor.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PasswordEditor, [{
    key: 'createElements',
    value: function createElements() {
      _get(Object.getPrototypeOf(PasswordEditor.prototype), 'createElements', this).call(this);

      this.TEXTAREA = document.createElement('input');
      this.TEXTAREA.setAttribute('type', 'password');
      this.TEXTAREA.className = 'handsontableInput';
      this.textareaStyle = this.TEXTAREA.style;
      this.textareaStyle.width = 0;
      this.textareaStyle.height = 0;

      (0, _helpersDomElement.empty)(this.TEXTAREA_PARENT);
      this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
    }
  }]);

  return PasswordEditor;
})(_textEditor.TextEditor);

exports.PasswordEditor = PasswordEditor;

(0, _editors.registerEditor)('password', PasswordEditor);

},{"./../editors":34,"./../helpers/dom/element":50,"./textEditor":45}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../helpers/dom/element');

var _helpersDomEvent = require('./../helpers/dom/event');

var _helpersUnicode = require('./../helpers/unicode');

var _editors = require('./../editors');

var _baseEditor = require('./_baseEditor');

var SelectEditor = _baseEditor.BaseEditor.prototype.extend();

/**
 * @private
 * @editor SelectEditor
 * @class SelectEditor
 */
SelectEditor.prototype.init = function () {
  this.select = document.createElement('SELECT');
  (0, _helpersDomElement.addClass)(this.select, 'htSelectEditor');
  this.select.style.display = 'none';
  this.instance.rootElement.appendChild(this.select);
  this.registerHooks();
};

SelectEditor.prototype.registerHooks = function () {
  var _this = this;

  this.instance.addHook('afterScrollVertically', function () {
    return _this.refreshDimensions();
  });
  this.instance.addHook('afterColumnResize', function () {
    return _this.refreshDimensions();
  });
  this.instance.addHook('afterRowResize', function () {
    return _this.refreshDimensions();
  });
};

SelectEditor.prototype.prepare = function () {
  _baseEditor.BaseEditor.prototype.prepare.apply(this, arguments);

  var selectOptions = this.cellProperties.selectOptions;
  var options;

  if (typeof selectOptions == 'function') {
    options = this.prepareOptions(selectOptions(this.row, this.col, this.prop));
  } else {
    options = this.prepareOptions(selectOptions);
  }

  (0, _helpersDomElement.empty)(this.select);

  for (var option in options) {
    if (options.hasOwnProperty(option)) {
      var optionElement = document.createElement('OPTION');
      optionElement.value = option;
      (0, _helpersDomElement.fastInnerHTML)(optionElement, options[option]);
      this.select.appendChild(optionElement);
    }
  }
};

SelectEditor.prototype.prepareOptions = function (optionsToPrepare) {
  var preparedOptions = {};

  if (Array.isArray(optionsToPrepare)) {
    for (var i = 0, len = optionsToPrepare.length; i < len; i++) {
      preparedOptions[optionsToPrepare[i]] = optionsToPrepare[i];
    }
  } else if (typeof optionsToPrepare == 'object') {
    preparedOptions = optionsToPrepare;
  }

  return preparedOptions;
};

SelectEditor.prototype.getValue = function () {
  return this.select.value;
};

SelectEditor.prototype.setValue = function (value) {
  this.select.value = value;
};

var onBeforeKeyDown = function onBeforeKeyDown(event) {
  var instance = this;
  var editor = instance.getActiveEditor();

  switch (event.keyCode) {
    case _helpersUnicode.KEY_CODES.ARROW_UP:
      var previousOptionIndex = editor.select.selectedIndex - 1;
      if (previousOptionIndex >= 0) {
        editor.select[previousOptionIndex].selected = true;
      }

      (0, _helpersDomEvent.stopImmediatePropagation)(event);
      event.preventDefault();
      break;

    case _helpersUnicode.KEY_CODES.ARROW_DOWN:
      var nextOptionIndex = editor.select.selectedIndex + 1;
      if (nextOptionIndex <= editor.select.length - 1) {
        editor.select[nextOptionIndex].selected = true;
      }

      (0, _helpersDomEvent.stopImmediatePropagation)(event);
      event.preventDefault();
      break;
  }
};

// TODO: Refactor this with the use of new getCell() after 0.12.1
SelectEditor.prototype.checkEditorSection = function () {
  if (this.row < this.instance.getSettings().fixedRowsTop) {
    if (this.col < this.instance.getSettings().fixedColumnsLeft) {
      return 'corner';
    } else {
      return 'top';
    }
  } else {
    if (this.col < this.instance.getSettings().fixedColumnsLeft) {
      return 'left';
    }
  }
};

SelectEditor.prototype.open = function () {
  this._opened = true;
  this.refreshDimensions();
  this.select.style.display = '';
  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
};

SelectEditor.prototype.close = function () {
  this._opened = false;
  this.select.style.display = 'none';
  this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
};

SelectEditor.prototype.focus = function () {
  this.select.focus();
};

SelectEditor.prototype.refreshDimensions = function () {
  if (this.state !== Handsontable.EditorState.EDITING) {
    return;
  }
  this.TD = this.getEditedCell();

  // TD is outside of the viewport.
  if (!this.TD) {
    this.close();

    return;
  }
  var width = (0, _helpersDomElement.outerWidth)(this.TD) + 1,
      height = (0, _helpersDomElement.outerHeight)(this.TD) + 1,
      currentOffset = (0, _helpersDomElement.offset)(this.TD),
      containerOffset = (0, _helpersDomElement.offset)(this.instance.rootElement),
      scrollableContainer = (0, _helpersDomElement.getScrollableElement)(this.TD),
      editTop = currentOffset.top - containerOffset.top - 1 - (scrollableContainer.scrollTop || 0),
      editLeft = currentOffset.left - containerOffset.left - 1 - (scrollableContainer.scrollLeft || 0),
      editorSection = this.checkEditorSection(),
      cssTransformOffset;

  var settings = this.instance.getSettings();
  var rowHeadersCount = settings.rowHeaders ? 1 : 0;
  var colHeadersCount = settings.colHeaders ? 1 : 0;

  switch (editorSection) {
    case 'top':
      cssTransformOffset = (0, _helpersDomElement.getCssTransform)(this.instance.view.wt.wtOverlays.topOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'left':
      cssTransformOffset = (0, _helpersDomElement.getCssTransform)(this.instance.view.wt.wtOverlays.leftOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'corner':
      cssTransformOffset = (0, _helpersDomElement.getCssTransform)(this.instance.view.wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.holder.parentNode);
      break;
  }
  if (this.instance.getSelected()[0] === 0) {
    editTop += 1;
  }

  if (this.instance.getSelected()[1] === 0) {
    editLeft += 1;
  }

  var selectStyle = this.select.style;

  if (cssTransformOffset && cssTransformOffset != -1) {
    selectStyle[cssTransformOffset[0]] = cssTransformOffset[1];
  } else {
    (0, _helpersDomElement.resetCssTransform)(this.select);
  }
  var cellComputedStyle = (0, _helpersDomElement.getComputedStyle)(this.TD);

  if (parseInt(cellComputedStyle.borderTopWidth, 10) > 0) {
    height -= 1;
  }
  if (parseInt(cellComputedStyle.borderLeftWidth, 10) > 0) {
    width -= 1;
  }

  selectStyle.height = height + 'px';
  selectStyle.minWidth = width + 'px';
  selectStyle.top = editTop + 'px';
  selectStyle.left = editLeft + 'px';
  selectStyle.margin = '0px';
};

SelectEditor.prototype.getEditedCell = function () {
  var editorSection = this.checkEditorSection(),
      editedCell;

  switch (editorSection) {
    case 'top':
      editedCell = this.instance.view.wt.wtOverlays.topOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.select.style.zIndex = 101;
      break;
    case 'corner':
      editedCell = this.instance.view.wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.select.style.zIndex = 103;
      break;
    case 'left':
      editedCell = this.instance.view.wt.wtOverlays.leftOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.select.style.zIndex = 102;
      break;
    default:
      editedCell = this.instance.getCell(this.row, this.col);
      this.select.style.zIndex = '';
      break;
  }

  return editedCell != -1 && editedCell != -2 ? editedCell : void 0;
};

exports.SelectEditor = SelectEditor;

(0, _editors.registerEditor)('select', SelectEditor);

},{"./../editors":34,"./../helpers/dom/element":50,"./../helpers/dom/event":51,"./../helpers/unicode":58,"./_baseEditor":35}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersDomElement = require('./../helpers/dom/element');

var _autoResize = require('autoResize');

var _autoResize2 = _interopRequireDefault(_autoResize);

var _baseEditor = require('./_baseEditor');

var _eventManager = require('./../eventManager');

var _editors = require('./../editors');

var _helpersUnicode = require('./../helpers/unicode');

var _helpersDomEvent = require('./../helpers/dom/event');

var TextEditor = _baseEditor.BaseEditor.prototype.extend();

/**
 * @private
 * @editor TextEditor
 * @class TextEditor
 * @dependencies autoResize
 */
TextEditor.prototype.init = function () {
  var that = this;
  this.createElements();
  this.eventManager = (0, _eventManager.eventManager)(this);
  this.bindEvents();
  this.autoResize = (0, _autoResize2['default'])();

  this.instance.addHook('afterDestroy', function () {
    that.destroy();
  });
};

TextEditor.prototype.getValue = function () {
  return this.TEXTAREA.value;
};

TextEditor.prototype.setValue = function (newValue) {
  this.TEXTAREA.value = newValue;
};

var onBeforeKeyDown = function onBeforeKeyDown(event) {
  var instance = this,
      that = instance.getActiveEditor(),
      ctrlDown;

  // catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
  ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey;

  // Process only events that have been fired in the editor
  if (event.target !== that.TEXTAREA || (0, _helpersDomEvent.isImmediatePropagationStopped)(event)) {
    return;
  }

  if (event.keyCode === 17 || event.keyCode === 224 || event.keyCode === 91 || event.keyCode === 93) {
    // when CTRL or its equivalent is pressed and cell is edited, don't prepare selectable text in textarea
    (0, _helpersDomEvent.stopImmediatePropagation)(event);
    return;
  }

  switch (event.keyCode) {
    case _helpersUnicode.KEY_CODES.ARROW_RIGHT:
      if (that.isInFullEditMode()) {
        if (!that.isWaiting() && !that.allowKeyEventPropagation || !that.isWaiting() && that.allowKeyEventPropagation && !that.allowKeyEventPropagation(event.keyCode)) {
          (0, _helpersDomEvent.stopImmediatePropagation)(event);
        }
      }
      break;
    case _helpersUnicode.KEY_CODES.ARROW_LEFT:
      if (that.isInFullEditMode()) {
        if (!that.isWaiting() && !that.allowKeyEventPropagation || !that.isWaiting() && that.allowKeyEventPropagation && !that.allowKeyEventPropagation(event.keyCode)) {
          (0, _helpersDomEvent.stopImmediatePropagation)(event);
        }
      }
      break;
    case _helpersUnicode.KEY_CODES.ARROW_UP:
    case _helpersUnicode.KEY_CODES.ARROW_DOWN:
      if (that.isInFullEditMode()) {
        if (!that.isWaiting() && !that.allowKeyEventPropagation || !that.isWaiting() && that.allowKeyEventPropagation && !that.allowKeyEventPropagation(event.keyCode)) {
          (0, _helpersDomEvent.stopImmediatePropagation)(event);
        }
      }
      break;

    case _helpersUnicode.KEY_CODES.ENTER:
      var selected = that.instance.getSelected();
      var isMultipleSelection = !(selected[0] === selected[2] && selected[1] === selected[3]);
      if (ctrlDown && !isMultipleSelection || event.altKey) {
        //if ctrl+enter or alt+enter, add new line
        if (that.isOpened()) {
          var caretPosition = (0, _helpersDomElement.getCaretPosition)(that.TEXTAREA),
              value = that.getValue();

          var newValue = value.slice(0, caretPosition) + '\n' + value.slice(caretPosition);

          that.setValue(newValue);

          (0, _helpersDomElement.setCaretPosition)(that.TEXTAREA, caretPosition + 1);
        } else {
          that.beginEditing(that.originalValue + '\n');
        }
        (0, _helpersDomEvent.stopImmediatePropagation)(event);
      }
      event.preventDefault(); //don't add newline to field
      break;

    case _helpersUnicode.KEY_CODES.A:
    case _helpersUnicode.KEY_CODES.X:
    case _helpersUnicode.KEY_CODES.C:
    case _helpersUnicode.KEY_CODES.V:
      if (ctrlDown) {
        (0, _helpersDomEvent.stopImmediatePropagation)(event); //CTRL+A, CTRL+C, CTRL+V, CTRL+X should only work locally when cell is edited (not in table context)
      }
      break;

    case _helpersUnicode.KEY_CODES.BACKSPACE:
    case _helpersUnicode.KEY_CODES.DELETE:
    case _helpersUnicode.KEY_CODES.HOME:
    case _helpersUnicode.KEY_CODES.END:
      (0, _helpersDomEvent.stopImmediatePropagation)(event); //backspace, delete, home, end should only work locally when cell is edited (not in table context)
      break;
  }

  if ([_helpersUnicode.KEY_CODES.ARROW_UP, _helpersUnicode.KEY_CODES.ARROW_RIGHT, _helpersUnicode.KEY_CODES.ARROW_DOWN, _helpersUnicode.KEY_CODES.ARROW_LEFT].indexOf(event.keyCode) === -1) {
    that.autoResize.resize(String.fromCharCode(event.keyCode));
  }
};

TextEditor.prototype.open = function () {
  this.refreshDimensions(); //need it instantly, to prevent https://github.com/handsontable/handsontable/issues/348

  this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
};

TextEditor.prototype.close = function () {
  this.textareaParentStyle.display = 'none';

  this.autoResize.unObserve();

  if (document.activeElement === this.TEXTAREA) {
    this.instance.listen(); //don't refocus the table if user focused some cell outside of HT on purpose
  }
  this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
};

TextEditor.prototype.focus = function () {
  this.TEXTAREA.focus();
  (0, _helpersDomElement.setCaretPosition)(this.TEXTAREA, this.TEXTAREA.value.length);
};

TextEditor.prototype.createElements = function () {
  //    this.$body = $(document.body);

  this.TEXTAREA = document.createElement('TEXTAREA');

  (0, _helpersDomElement.addClass)(this.TEXTAREA, 'handsontableInput');

  this.textareaStyle = this.TEXTAREA.style;
  this.textareaStyle.width = 0;
  this.textareaStyle.height = 0;

  this.TEXTAREA_PARENT = document.createElement('DIV');
  (0, _helpersDomElement.addClass)(this.TEXTAREA_PARENT, 'handsontableInputHolder');

  this.textareaParentStyle = this.TEXTAREA_PARENT.style;
  this.textareaParentStyle.top = 0;
  this.textareaParentStyle.left = 0;
  this.textareaParentStyle.display = 'none';

  this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);

  this.instance.rootElement.appendChild(this.TEXTAREA_PARENT);

  var that = this;
  this.instance._registerTimeout(setTimeout(function () {
    that.refreshDimensions();
  }, 0));
};

TextEditor.prototype.checkEditorSection = function () {
  if (this.row < this.instance.getSettings().fixedRowsTop) {
    if (this.col < this.instance.getSettings().fixedColumnsLeft) {
      return 'corner';
    } else {
      return 'top';
    }
  } else {
    if (this.col < this.instance.getSettings().fixedColumnsLeft) {
      return 'left';
    }
  }
};

TextEditor.prototype.getEditedCell = function () {
  var editorSection = this.checkEditorSection(),
      editedCell;

  switch (editorSection) {
    case 'top':
      editedCell = this.instance.view.wt.wtOverlays.topOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 101;
      break;
    case 'corner':
      editedCell = this.instance.view.wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 103;
      break;
    case 'left':
      editedCell = this.instance.view.wt.wtOverlays.leftOverlay.clone.wtTable.getCell({
        row: this.row,
        col: this.col
      });
      this.textareaParentStyle.zIndex = 102;
      break;
    default:
      editedCell = this.instance.getCell(this.row, this.col);
      this.textareaParentStyle.zIndex = "";
      break;
  }

  return editedCell != -1 && editedCell != -2 ? editedCell : void 0;
};

TextEditor.prototype.refreshDimensions = function () {
  if (this.state !== Handsontable.EditorState.EDITING) {
    return;
  }
  this.TD = this.getEditedCell();

  // TD is outside of the viewport.
  if (!this.TD) {
    this.close();

    return;
  }
  var currentOffset = (0, _helpersDomElement.offset)(this.TD),
      containerOffset = (0, _helpersDomElement.offset)(this.instance.rootElement),
      scrollableContainer = (0, _helpersDomElement.getScrollableElement)(this.TD),
      editTop = currentOffset.top - containerOffset.top - 1 - (scrollableContainer.scrollTop || 0),
      editLeft = currentOffset.left - containerOffset.left - 1 - (scrollableContainer.scrollLeft || 0),
      settings = this.instance.getSettings(),
      rowHeadersCount = settings.rowHeaders ? 1 : 0,
      colHeadersCount = settings.colHeaders ? 1 : 0,
      editorSection = this.checkEditorSection(),
      backgroundColor = this.TD.style.backgroundColor,
      cssTransformOffset;

  // TODO: Refactor this to the new instance.getCell method (from #ply-59), after 0.12.1 is released
  switch (editorSection) {
    case 'top':
      cssTransformOffset = (0, _helpersDomElement.getCssTransform)(this.instance.view.wt.wtOverlays.topOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'left':
      cssTransformOffset = (0, _helpersDomElement.getCssTransform)(this.instance.view.wt.wtOverlays.leftOverlay.clone.wtTable.holder.parentNode);
      break;
    case 'corner':
      cssTransformOffset = (0, _helpersDomElement.getCssTransform)(this.instance.view.wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.holder.parentNode);
      break;
  }

  if (this.instance.getSelected()[0] === 0) {
    editTop += 1;
  }

  if (this.instance.getSelected()[1] === 0) {
    editLeft += 1;
  }

  if (cssTransformOffset && cssTransformOffset != -1) {
    this.textareaParentStyle[cssTransformOffset[0]] = cssTransformOffset[1];
  } else {
    (0, _helpersDomElement.resetCssTransform)(this.textareaParentStyle);
  }

  this.textareaParentStyle.top = editTop + 'px';
  this.textareaParentStyle.left = editLeft + 'px';
  ///end prepare textarea position

  var cellTopOffset = this.TD.offsetTop - this.instance.view.wt.wtOverlays.topOverlay.getScrollPosition(),
      cellLeftOffset = this.TD.offsetLeft - this.instance.view.wt.wtOverlays.leftOverlay.getScrollPosition();

  var width = (0, _helpersDomElement.innerWidth)(this.TD) - 8;
  // 10 is TEXTAREAs padding
  var maxWidth = this.instance.view.maximumVisibleElementWidth(cellLeftOffset) - 9;
  var height = this.TD.scrollHeight + 1;
  // 10 is TEXTAREAs border and padding
  var maxHeight = Math.max(this.instance.view.maximumVisibleElementHeight(cellTopOffset) - 2, 23);

  var cellComputedStyle = (0, _helpersDomElement.getComputedStyle)(this.TD);

  this.TEXTAREA.style.fontSize = cellComputedStyle.fontSize;
  this.TEXTAREA.style.fontFamily = cellComputedStyle.fontFamily;

  this.TEXTAREA.style.backgroundColor = ''; //RESET STYLE

  this.TEXTAREA.style.backgroundColor = backgroundColor ? backgroundColor : (0, _helpersDomElement.getComputedStyle)(this.TEXTAREA).backgroundColor;

  this.autoResize.init(this.TEXTAREA, {
    minHeight: Math.min(height, maxHeight),
    maxHeight: maxHeight, //TEXTAREA should never be wider than visible part of the viewport (should not cover the scrollbar)
    minWidth: Math.min(width, maxWidth),
    maxWidth: maxWidth //TEXTAREA should never be wider than visible part of the viewport (should not cover the scrollbar)
  }, true);

  this.textareaParentStyle.display = 'block';
};

TextEditor.prototype.bindEvents = function () {
  var editor = this;

  this.eventManager.addEventListener(this.TEXTAREA, 'cut', function (event) {
    (0, _helpersDomEvent.stopPropagation)(event);
  });

  this.eventManager.addEventListener(this.TEXTAREA, 'paste', function (event) {
    (0, _helpersDomEvent.stopPropagation)(event);
  });

  this.instance.addHook('afterScrollVertically', function () {
    editor.refreshDimensions();
  });

  this.instance.addHook('afterColumnResize', function () {
    editor.refreshDimensions();
    editor.focus();
  });

  this.instance.addHook('afterRowResize', function () {
    editor.refreshDimensions();
    editor.focus();
  });

  this.instance.addHook('afterDestroy', function () {
    editor.eventManager.destroy();
  });
};

TextEditor.prototype.destroy = function () {
  this.eventManager.destroy();
};

exports.TextEditor = TextEditor;

(0, _editors.registerEditor)('text', TextEditor);

},{"./../editors":34,"./../eventManager":46,"./../helpers/dom/element":50,"./../helpers/dom/event":51,"./../helpers/unicode":58,"./_baseEditor":35,"autoResize":2}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersDomElement = require('./helpers/dom/element');

var _helpersBrowser = require('./helpers/browser');

/**
 * Event DOM manager for internal use in Handsontable.
 *
 * @class EventManager
 * @private
 * @util
 */

var EventManager = (function () {
  /**
   * @param {Object} [context=null]
   */

  function EventManager() {
    var context = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, EventManager);

    this.context = context || this;

    if (!this.context.eventListeners) {
      this.context.eventListeners = [];
    }
  }

  /**
   * @param {Object} context
   * @param {Event} event
   * @private
   * @returns {*}
   */

  /**
   * Add event
   *
   * @param {Element} element
   * @param {String} eventName
   * @param {Function} callback
   * @returns {Function} Returns function which you can easily call to remove that event
   */

  _createClass(EventManager, [{
    key: 'addEventListener',
    value: function addEventListener(element, eventName, callback) {
      var _this = this;

      var context = this.context;

      function callbackProxy(event) {
        if (event.target == void 0 && event.srcElement != void 0) {
          if (event.definePoperty) {
            event.definePoperty('target', {
              value: event.srcElement
            });
          } else {
            event.target = event.srcElement;
          }
        }
        if (event.preventDefault == void 0) {
          if (event.definePoperty) {
            event.definePoperty('preventDefault', {
              value: function value() {
                this.returnValue = false;
              }
            });
          } else {
            event.preventDefault = function () {
              this.returnValue = false;
            };
          }
        }
        event = extendEvent(context, event);

        /* jshint validthis:true */
        callback.call(this, event);
      }
      this.context.eventListeners.push({
        element: element,
        event: eventName,
        callback: callback,
        callbackProxy: callbackProxy
      });

      if (window.addEventListener) {
        element.addEventListener(eventName, callbackProxy, false);
      } else {
        element.attachEvent('on' + eventName, callbackProxy);
      }
      Handsontable.countEventManagerListeners++;

      return function () {
        _this.removeEventListener(element, eventName, callback);
      };
    }

    /**
     * Remove event
     *
     * @param {Element} element
     * @param {String} eventName
     * @param {Function} callback
     */
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(element, eventName, callback) {
      var len = this.context.eventListeners.length;
      var tmpEvent = undefined;

      while (len--) {
        tmpEvent = this.context.eventListeners[len];

        if (tmpEvent.event == eventName && tmpEvent.element == element) {
          if (callback && callback != tmpEvent.callback) {
            continue;
          }
          this.context.eventListeners.splice(len, 1);

          if (tmpEvent.element.removeEventListener) {
            tmpEvent.element.removeEventListener(tmpEvent.event, tmpEvent.callbackProxy, false);
          } else {
            tmpEvent.element.detachEvent('on' + tmpEvent.event, tmpEvent.callbackProxy);
          }
          Handsontable.countEventManagerListeners--;
        }
      }
    }

    /**
     * Clear all events
     *
     * @since 0.15.0-beta3
     */
  }, {
    key: 'clearEvents',
    value: function clearEvents() {
      if (!this.context) {
        return;
      }
      var len = this.context.eventListeners.length;

      while (len--) {
        var _event = this.context.eventListeners[len];

        if (_event) {
          this.removeEventListener(_event.element, _event.event, _event.callback);
        }
      }
    }

    /**
     * Clear all events
     */
  }, {
    key: 'clear',
    value: function clear() {
      this.clearEvents();
    }

    /**
     * Destroy instance
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.clearEvents();
      this.context = null;
    }

    /**
     * Trigger event
     *
     * @param {Element} element
     * @param {String} eventName
     */
  }, {
    key: 'fireEvent',
    value: function fireEvent(element, eventName) {
      var options = {
        bubbles: true,
        cancelable: eventName !== 'mousemove',
        view: window,
        detail: 0,
        screenX: 0,
        screenY: 0,
        clientX: 1,
        clientY: 1,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: undefined
      };
      var event;

      if (document.createEvent) {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent(eventName, options.bubbles, options.cancelable, options.view, options.detail, options.screenX, options.screenY, options.clientX, options.clientY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, options.relatedTarget || document.body.parentNode);
      } else {
        event = document.createEventObject();
      }

      if (element.dispatchEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent('on' + eventName, event);
      }
    }
  }]);

  return EventManager;
})();

function extendEvent(context, event) {
  var componentName = 'HOT-TABLE';
  var isHotTableSpotted = undefined;
  var fromElement = undefined;
  var realTarget = undefined;
  var target = undefined;
  var len = undefined;

  event.isTargetWebComponent = false;
  event.realTarget = event.target;

  if (!Handsontable.eventManager.isHotTableEnv) {
    return event;
  }
  event = (0, _helpersDomElement.polymerWrap)(event);
  len = event.path ? event.path.length : 0;

  while (len--) {
    if (event.path[len].nodeName === componentName) {
      isHotTableSpotted = true;
    } else if (isHotTableSpotted && event.path[len].shadowRoot) {
      target = event.path[len];

      break;
    }
    if (len === 0 && !target) {
      target = event.path[len];
    }
  }
  if (!target) {
    target = event.target;
  }
  event.isTargetWebComponent = true;

  if ((0, _helpersBrowser.isWebComponentSupportedNatively)()) {
    event.realTarget = event.srcElement || event.toElement;
  } else if (context instanceof Handsontable.Core || context instanceof Walkontable) {
    // Polymer doesn't support `event.target` property properly we must emulate it ourselves
    if (context instanceof Handsontable.Core) {
      fromElement = context.view ? context.view.wt.wtTable.TABLE : null;
    } else if (context instanceof Walkontable) {
      // .wtHider
      fromElement = context.wtTable.TABLE.parentNode.parentNode;
    }
    realTarget = (0, _helpersDomElement.closest)(event.target, [componentName], fromElement);

    if (realTarget) {
      event.realTarget = fromElement.querySelector(componentName) || event.target;
    } else {
      event.realTarget = event.target;
    }
  }

  Object.defineProperty(event, 'target', {
    get: function get() {
      return (0, _helpersDomElement.polymerWrap)(target);
    },
    enumerable: true,
    configurable: true
  });

  return event;
}

exports.EventManager = EventManager;
exports.eventManager = eventManager;

window.Handsontable = window.Handsontable || {};
// used to debug memory leaks
Handsontable.countEventManagerListeners = 0;
// support for older versions of Handsontable, deprecated
Handsontable.eventManager = eventManager;

function eventManager(context) {
  return new EventManager(context);
}

},{"./helpers/browser":48,"./helpers/dom/element":50}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.to2dArray = to2dArray;
exports.extendArray = extendArray;
exports.pivot = pivot;
exports.arrayFilter = arrayFilter;
exports.arrayEach = arrayEach;
exports.arraySum = arraySum;
exports.arrayAvg = arrayAvg;

function to2dArray(arr) {
  var i = 0,
      ilen = arr.length;
  while (i < ilen) {
    arr[i] = [arr[i]];
    i++;
  }
}

function extendArray(arr, extension) {
  var i = 0,
      ilen = extension.length;
  while (i < ilen) {
    arr.push(extension[i]);
    i++;
  }
}

function pivot(arr) {
  var pivotedArr = [];

  if (!arr || arr.length === 0 || !arr[0] || arr[0].length === 0) {
    return pivotedArr;
  }

  var rowCount = arr.length;
  var colCount = arr[0].length;

  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < colCount; j++) {
      if (!pivotedArr[j]) {
        pivotedArr[j] = [];
      }

      pivotedArr[j][i] = arr[i][j];
    }
  }

  return pivotedArr;
}

/**
 * A specialized version of `.reduce` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * {@link https://github.com/lodash/lodash/blob/master/lodash.js}
 *
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {Boolean} [initFromArray] Specify using the first element of `array` as the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initFromArray) {
  var index = -1,
      length = array.length;

  if (initFromArray && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }

  return accumulator;
}

/**
 * A specialized version of `.filter` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * {@link https://github.com/lodash/lodash/blob/master/lodash.js}
 *
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */

function arrayFilter(array, predicate) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    var value = array[index];

    if (predicate(value, index, array)) {
      result[++resIndex] = value;
    }
  }

  return result;
}

/**
 * A specialized version of `.forEach` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * {@link https://github.com/lodash/lodash/blob/master/lodash.js}
 *
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */

function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }

  return array;
}

/**
 * Calculate sum value for each item of the array.
 *
 * @param {Array} array The array to process.
 * @returns {Number} Returns calculated sum value.
 */

function arraySum(array) {
  return arrayReduce(array, function (a, b) {
    return a + b;
  }, 0);
}

/**
 * Calculate average value for each item of the array.
 *
 * @param {Array} array The array to process.
 * @returns {Number} Returns calculated average value.
 */

function arrayAvg(array) {
  if (!array.length) {
    return 0;
  }

  return arraySum(array) / array.length;
}

},{}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isIE8 = isIE8;
exports.isIE9 = isIE9;
exports.isSafari = isSafari;
exports.isChrome = isChrome;
exports.isMobileBrowser = isMobileBrowser;
exports.isTouchSupported = isTouchSupported;
exports.isWebComponentSupportedNatively = isWebComponentSupportedNatively;
exports.hasCaptionProblem = hasCaptionProblem;

var _isIE8 = !document.createTextNode('test').textContent;

function isIE8() {
  return _isIE8;
}

var _isIE9 = !!document.documentMode;

function isIE9() {
  return _isIE9;
}

var _isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

function isSafari() {
  return _isSafari;
}

var _isChrome = /Chrome/.test(navigator.userAgent) && /Google/.test(navigator.vendor);

function isChrome() {
  return _isChrome;
}

function isMobileBrowser(userAgent) {
  if (!userAgent) {
    userAgent = navigator.userAgent;
  }

  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  );
}

function isTouchSupported() {
  return 'ontouchstart' in window;
}

/**
 * Checks if browser is support web components natively
 *
 * @returns {Boolean}
 */

function isWebComponentSupportedNatively() {
  var test = document.createElement('div');

  return test.createShadowRoot && test.createShadowRoot.toString().match(/\[native code\]/) ? true : false;
}

var _hasCaptionProblem;

function detectCaptionProblem() {
  var TABLE = document.createElement('TABLE');
  TABLE.style.borderSpacing = 0;
  TABLE.style.borderWidth = 0;
  TABLE.style.padding = 0;
  var TBODY = document.createElement('TBODY');
  TABLE.appendChild(TBODY);
  TBODY.appendChild(document.createElement('TR'));
  TBODY.firstChild.appendChild(document.createElement('TD'));
  TBODY.firstChild.firstChild.innerHTML = '<tr><td>t<br>t</td></tr>';

  var CAPTION = document.createElement('CAPTION');
  CAPTION.innerHTML = 'c<br>c<br>c<br>c';
  CAPTION.style.padding = 0;
  CAPTION.style.margin = 0;
  TABLE.insertBefore(CAPTION, TBODY);

  document.body.appendChild(TABLE);
  _hasCaptionProblem = TABLE.offsetHeight < 2 * TABLE.lastChild.offsetHeight; //boolean
  document.body.removeChild(TABLE);
}

function hasCaptionProblem() {
  if (_hasCaptionProblem === void 0) {
    detectCaptionProblem();
  }

  return _hasCaptionProblem;
}

},{}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.spreadsheetColumnLabel = spreadsheetColumnLabel;
exports.createSpreadsheetData = createSpreadsheetData;
exports.createSpreadsheetObjectData = createSpreadsheetObjectData;
exports.translateRowsToColumns = translateRowsToColumns;
exports.cellMethodLookupFactory = cellMethodLookupFactory;

var _object = require('./object');

/**
 * Generates spreadsheet-like column names: A, B, C, ..., Z, AA, AB, etc
 * @param index
 * @returns {String}
 */

function spreadsheetColumnLabel(index) {
  var dividend = index + 1;
  var columnLabel = '';
  var modulo;
  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    columnLabel = String.fromCharCode(65 + modulo) + columnLabel;
    dividend = parseInt((dividend - modulo) / 26, 10);
  }
  return columnLabel;
}

/**
 * Creates 2D array of Excel-like values "A1", "A2", ...
 * @param rowCount
 * @param colCount
 * @returns {Array}
 */

function createSpreadsheetData(rowCount, colCount) {
  rowCount = typeof rowCount === 'number' ? rowCount : 100;
  colCount = typeof colCount === 'number' ? colCount : 4;

  var rows = [],
      i,
      j;

  for (i = 0; i < rowCount; i++) {
    var row = [];
    for (j = 0; j < colCount; j++) {
      row.push(spreadsheetColumnLabel(j) + (i + 1));
    }
    rows.push(row);
  }
  return rows;
}

function createSpreadsheetObjectData(rowCount, colCount) {
  rowCount = typeof rowCount === 'number' ? rowCount : 100;
  colCount = typeof colCount === 'number' ? colCount : 4;

  var rows = [],
      i,
      j;

  for (i = 0; i < rowCount; i++) {
    var row = {};
    for (j = 0; j < colCount; j++) {
      row['prop' + j] = spreadsheetColumnLabel(j) + (i + 1);
    }
    rows.push(row);
  }
  return rows;
}

function translateRowsToColumns(input) {
  var i,
      ilen,
      j,
      jlen,
      output = [],
      olen = 0;

  for (i = 0, ilen = input.length; i < ilen; i++) {
    for (j = 0, jlen = input[i].length; j < jlen; j++) {
      if (j == olen) {
        output.push([]);
        olen++;
      }
      output[j].push(input[i][j]);
    }
  }
  return output;
}

/**
 * Factory that produces a function for searching methods (or any properties) which could be defined directly in
 * table configuration or implicitly, within cell type definition.
 *
 * For example: renderer can be defined explicitly using "renderer" property in column configuration or it can be
 * defined implicitly using "type" property.
 *
 * Methods/properties defined explicitly always takes precedence over those defined through "type".
 *
 * If the method/property is not found in an object, searching is continued recursively through prototype chain, until
 * it reaches the Object.prototype.
 *
 *
 * @param methodName {String} name of the method/property to search (i.e. 'renderer', 'validator', 'copyable')
 * @param allowUndefined {Boolean} [optional] if false, the search is continued if methodName has not been found in cell "type"
 * @returns {Function}
 */

function cellMethodLookupFactory(methodName, allowUndefined) {

  allowUndefined = typeof allowUndefined == 'undefined' ? true : allowUndefined;

  return function cellMethodLookup(row, col) {

    return (function getMethodFromProperties(_x) {
      var _again = true;

      _function: while (_again) {
        var properties = _x;
        type = undefined;
        _again = false;

        if (!properties) {

          return; //method not found
        } else if (properties.hasOwnProperty(methodName) && properties[methodName] !== void 0) {
            //check if it is own and is not empty

            return properties[methodName]; //method defined directly
          } else if (properties.hasOwnProperty('type') && properties.type) {
              //check if it is own and is not empty

              var type;

              if (typeof properties.type != 'string') {
                throw new Error('Cell type must be a string ');
              }

              type = translateTypeNameToObject(properties.type);

              if (type.hasOwnProperty(methodName)) {
                return type[methodName]; //method defined in type.
              } else if (allowUndefined) {
                  return; //method does not defined in type (eg. validator), returns undefined
                }
            }

        _x = (0, _object.getPrototypeOf)(properties);
        _again = true;
        continue _function;
      }
    })(typeof row == 'number' ? this.getCellMeta(row, col) : row);
  };

  function translateTypeNameToObject(typeName) {
    var type = Handsontable.cellTypes[typeName];

    if (typeof type == 'undefined') {
      throw new Error('You declared cell type "' + typeName + '" as a string that is not mapped to a known object. ' + 'Cell type must be an object or a string mapped to an object in Handsontable.cellTypes');
    }

    return type;
  }
}

},{"./object":55}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.closest = closest;
exports.isChildOf = isChildOf;
exports.isChildOfWebComponentTable = isChildOfWebComponentTable;
exports.polymerWrap = polymerWrap;
exports.polymerUnwrap = polymerUnwrap;
exports.index = index;
exports.overlayContainsElement = overlayContainsElement;
exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.removeTextNodes = removeTextNodes;
exports.empty = empty;
exports.fastInnerHTML = fastInnerHTML;
exports.fastInnerText = fastInnerText;
exports.isVisible = isVisible;
exports.offset = offset;
exports.getWindowScrollTop = getWindowScrollTop;
exports.getWindowScrollLeft = getWindowScrollLeft;
exports.getScrollTop = getScrollTop;
exports.getScrollLeft = getScrollLeft;
exports.getScrollableElement = getScrollableElement;
exports.getTrimmingContainer = getTrimmingContainer;
exports.getStyle = getStyle;
exports.getComputedStyle = getComputedStyle;
exports.outerWidth = outerWidth;
exports.outerHeight = outerHeight;
exports.innerHeight = innerHeight;
exports.innerWidth = innerWidth;
exports.addEvent = addEvent;
exports.removeEvent = removeEvent;
exports.getCaretPosition = getCaretPosition;
exports.getSelectionEndPosition = getSelectionEndPosition;
exports.setCaretPosition = setCaretPosition;
exports.getScrollbarWidth = getScrollbarWidth;
exports.setOverlayPosition = setOverlayPosition;
exports.getCssTransform = getCssTransform;
exports.resetCssTransform = resetCssTransform;
exports.isInput = isInput;
exports.isOutsideInput = isOutsideInput;
exports.requestAnimationFrame = requestAnimationFrame;
exports.cancelAnimationFrame = cancelAnimationFrame;

var _browser = require('../browser');

/**
 * Goes up the DOM tree (including given element) until it finds an element that matches the nodes or nodes name.
 * This method goes up through web components.
 *
 * @param {HTMLElement} element Element from which traversing is started
 * @param {Array} nodes Array of elements or Array of elements name
 * @param {HTMLElement} [until]
 * @returns {HTMLElement|null}
 */

function closest(element, nodes, until) {
  while (element != null && element !== until) {
    if (element.nodeType === Node.ELEMENT_NODE && (nodes.indexOf(element.nodeName) > -1 || nodes.indexOf(element) > -1)) {
      return element;
    }
    if (element.host && element.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      element = element.host;
    } else {
      element = element.parentNode;
    }
  }

  return null;
}

/**
 * Goes up the DOM tree and checks if element is child of another element.
 *
 * @param child Child element
 * @param {Object|String} parent Parent element OR selector of the parent element.
 *                               If string provided, function returns `true` for the first occurance of element with that class.
 * @returns {Boolean}
 */

function isChildOf(child, parent) {
  var node = child.parentNode;
  var queriedParents = [];

  if (typeof parent === "string") {
    queriedParents = Array.prototype.slice.call(document.querySelectorAll(parent), 0);
  } else {
    queriedParents.push(parent);
  }

  while (node != null) {
    if (queriedParents.indexOf(node) > -1) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

/**
 * Check if an element is part of `hot-table` web component.
 *
 * @param {Element} element
 * @returns {Boolean}
 */

function isChildOfWebComponentTable(element) {
  var hotTableName = 'hot-table',
      result = false,
      parentNode;

  parentNode = polymerWrap(element);

  function isHotTable(element) {
    return element.nodeType === Node.ELEMENT_NODE && element.nodeName === hotTableName.toUpperCase();
  }

  while (parentNode != null) {
    if (isHotTable(parentNode)) {
      result = true;
      break;
    } else if (parentNode.host && parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      result = isHotTable(parentNode.host);

      if (result) {
        break;
      }
      parentNode = parentNode.host;
    }
    parentNode = parentNode.parentNode;
  }

  return result;
}

/**
 * Wrap element into polymer/webcomponent container if exists
 *
 * @param element
 * @returns {*}
 */

function polymerWrap(element) {
  /* global Polymer */
  return typeof Polymer !== 'undefined' && typeof wrap === 'function' ? wrap(element) : element;
}

/**
 * Unwrap element from polymer/webcomponent container if exists
 *
 * @param element
 * @returns {*}
 */

function polymerUnwrap(element) {
  /* global Polymer */
  return typeof Polymer !== 'undefined' && typeof unwrap === 'function' ? unwrap(element) : element;
}

/**
 * Counts index of element within its parent
 * WARNING: for performance reasons, assumes there are only element nodes (no text nodes). This is true for Walkotnable
 * Otherwise would need to check for nodeType or use previousElementSibling
 *
 * @see http://jsperf.com/sibling-index/10
 * @param {Element} element
 * @return {Number}
 */

function index(element) {
  var i = 0;

  if (element.previousSibling) {
    /* jshint ignore:start */
    while (element = element.previousSibling) {
      ++i;
    }
    /* jshint ignore:end */
  }

  return i;
}

/**
 * Check if the provided overlay contains the provided element
 *
 * @param {String} overlay
 * @param {HTMLElement} element
 * @returns {boolean}
 */

function overlayContainsElement(overlayType, element) {
  var overlayElement = document.querySelector('.ht_clone_' + overlayType);
  return overlayElement ? overlayElement.contains(element) : null;
}

var classListSupport = document.documentElement.classList ? true : false;
var _hasClass, _addClass, _removeClass;

function filterEmptyClassNames(classNames) {
  var len = 0,
      result = [];

  if (!classNames || !classNames.length) {
    return result;
  }
  while (classNames[len]) {
    result.push(classNames[len]);
    len++;
  }

  return result;
}

if (classListSupport) {
  var isSupportMultipleClassesArg = (function () {
    var element = document.createElement('div');

    element.classList.add('test', 'test2');

    return element.classList.contains('test2');
  })();

  _hasClass = function _hasClass(element, className) {
    if (className === '') {
      return false;
    }

    return element.classList.contains(className);
  };

  _addClass = function _addClass(element, className) {
    var len = 0;

    if (typeof className === 'string') {
      className = className.split(' ');
    }
    className = filterEmptyClassNames(className);

    if (isSupportMultipleClassesArg) {
      element.classList.add.apply(element.classList, className);
    } else {
      while (className && className[len]) {
        element.classList.add(className[len]);
        len++;
      }
    }
  };

  _removeClass = function _removeClass(element, className) {
    var len = 0;

    if (typeof className === 'string') {
      className = className.split(' ');
    }
    className = filterEmptyClassNames(className);

    if (isSupportMultipleClassesArg) {
      element.classList.remove.apply(element.classList, className);
    } else {
      while (className && className[len]) {
        element.classList.remove(className[len]);
        len++;
      }
    }
  };
} else {
  var createClassNameRegExp = function createClassNameRegExp(className) {
    return new RegExp('(\\s|^)' + className + '(\\s|$)');
  };

  _hasClass = function _hasClass(element, className) {
    // http://snipplr.com/view/3561/addclass-removeclass-hasclass/
    return element.className.match(createClassNameRegExp(className)) ? true : false;
  };

  _addClass = function _addClass(element, className) {
    var len = 0,
        _className = element.className;

    if (typeof className === 'string') {
      className = className.split(' ');
    }
    if (_className === '') {
      _className = className.join(' ');
    } else {
      while (className && className[len]) {
        if (!createClassNameRegExp(className[len]).test(_className)) {
          _className += ' ' + className[len];
        }
        len++;
      }
    }
    element.className = _className;
  };

  _removeClass = function _removeClass(element, className) {
    var len = 0,
        _className = element.className;

    if (typeof className === 'string') {
      className = className.split(' ');
    }
    while (className && className[len]) {
      // String.prototype.trim is defined in polyfill.js
      _className = _className.replace(createClassNameRegExp(className[len]), ' ').trim();
      len++;
    }
    if (element.className !== _className) {
      element.className = _className;
    }
  };
}

/**
 * Checks if element has class name
 *
 * @param {HTMLElement} element
 * @param {String} className Class name to check
 * @returns {Boolean}
 */

function hasClass(element, className) {
  return _hasClass(element, className);
}

/**
 * Add class name to an element
 *
 * @param {HTMLElement} element
 * @param {String|Array} className Class name as string or array of strings
 */

function addClass(element, className) {
  return _addClass(element, className);
}

/**
 * Remove class name from an element
 *
 * @param {HTMLElement} element
 * @param {String|Array} className Class name as string or array of strings
 */

function removeClass(element, className) {
  return _removeClass(element, className);
}

function removeTextNodes(element, parent) {
  if (element.nodeType === 3) {
    parent.removeChild(element); //bye text nodes!
  } else if (['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR'].indexOf(element.nodeName) > -1) {
      var childs = element.childNodes;
      for (var i = childs.length - 1; i >= 0; i--) {
        removeTextNodes(childs[i], element);
      }
    }
}

/**
 * Remove childs function
 * WARNING - this doesn't unload events and data attached by jQuery
 * http://jsperf.com/jquery-html-vs-empty-vs-innerhtml/9
 * http://jsperf.com/jquery-html-vs-empty-vs-innerhtml/11 - no siginificant improvement with Chrome remove() method
 *
 * @param element
 * @returns {void}
 */
//

function empty(element) {
  var child;
  /* jshint ignore:start */
  while (child = element.lastChild) {
    element.removeChild(child);
  }
  /* jshint ignore:end */
}

var HTML_CHARACTERS = /(<(.*)>|&(.*);)/;

exports.HTML_CHARACTERS = HTML_CHARACTERS;
/**
 * Insert content into element trying avoid innerHTML method.
 * @return {void}
 */

function fastInnerHTML(element, content) {
  if (HTML_CHARACTERS.test(content)) {
    element.innerHTML = content;
  } else {
    fastInnerText(element, content);
  }
}

/**
 * Insert text content into element
 * @return {void}
 */

var textContextSupport = document.createTextNode('test').textContent ? true : false;

function fastInnerText(element, content) {
  var child = element.firstChild;

  if (child && child.nodeType === 3 && child.nextSibling === null) {
    // fast lane - replace existing text node

    if (textContextSupport) {
      // http://jsperf.com/replace-text-vs-reuse
      child.textContent = content;
    } else {
      // http://jsperf.com/replace-text-vs-reuse
      child.data = content;
    }
  } else {
    //slow lane - empty element and insert a text node
    empty(element);
    element.appendChild(document.createTextNode(content));
  }
}

/**
 * Returns true if element is attached to the DOM and visible, false otherwise
 * @param elem
 * @returns {boolean}
 */

function isVisible(_x) {
  var _again = true;

  _function: while (_again) {
    var elem = _x;
    next = undefined;
    _again = false;

    var next = elem;

    while (polymerUnwrap(next) !== document.documentElement) {
      //until <html> reached
      if (next === null) {
        //parent detached from DOM
        return false;
      } else if (next.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        if (next.host) {
          //this is Web Components Shadow DOM
          //see: http://w3c.github.io/webcomponents/spec/shadow/#encapsulation
          //according to spec, should be if (next.ownerDocument !== window.document), but that doesn't work yet
          if (next.host.impl) {
            //Chrome 33.0.1723.0 canary (2013-11-29) Web Platform features disabled
            _x = next.host.impl;
            _again = true;
            continue _function;
          } else if (next.host) {
            //Chrome 33.0.1723.0 canary (2013-11-29) Web Platform features enabled
            _x = next.host;
            _again = true;
            continue _function;
          } else {
            throw new Error("Lost in Web Components world");
          }
        } else {
          return false; //this is a node detached from document in IE8
        }
      } else if (next.style.display === 'none') {
          return false;
        }
      next = next.parentNode;
    }

    return true;
  }
}

/**
 * Returns elements top and left offset relative to the document. Function is not compatible with jQuery offset.
 *
 * @param {HTMLElement} elem
 * @return {Object} Returns object with `top` and `left` props
 */

function offset(elem) {
  var offsetLeft, offsetTop, lastElem, docElem, box;

  docElem = document.documentElement;

  if ((0, _browser.hasCaptionProblem)() && elem.firstChild && elem.firstChild.nodeName === 'CAPTION') {
    // fixes problem with Firefox ignoring <caption> in TABLE offset (see also export outerHeight)
    // http://jsperf.com/offset-vs-getboundingclientrect/8
    box = elem.getBoundingClientRect();

    return {
      top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
      left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
    };
  }
  offsetLeft = elem.offsetLeft;
  offsetTop = elem.offsetTop;
  lastElem = elem;

  /* jshint ignore:start */
  while (elem = elem.offsetParent) {
    // from my observation, document.body always has scrollLeft/scrollTop == 0
    if (elem === document.body) {
      break;
    }
    offsetLeft += elem.offsetLeft;
    offsetTop += elem.offsetTop;
    lastElem = elem;
  }
  /* jshint ignore:end */

  //slow - http://jsperf.com/offset-vs-getboundingclientrect/6
  if (lastElem && lastElem.style.position === 'fixed') {
    //if(lastElem !== document.body) { //faster but does gives false positive in Firefox
    offsetLeft += window.pageXOffset || docElem.scrollLeft;
    offsetTop += window.pageYOffset || docElem.scrollTop;
  }

  return {
    left: offsetLeft,
    top: offsetTop
  };
}

/**
 * Returns the document's scrollTop property.
 *
 * @returns {Number}
 */

function getWindowScrollTop() {
  var res = window.scrollY;

  if (res === void 0) {
    //IE8-11
    res = document.documentElement.scrollTop;
  }

  return res;
}

/**
 * Returns the document's scrollLeft property.
 *
 * @returns {Number}
 */

function getWindowScrollLeft() {
  var res = window.scrollX;

  if (res === void 0) {
    //IE8-11
    res = document.documentElement.scrollLeft;
  }

  return res;
}

/**
 * Returns the provided element's scrollTop property.
 *
 * @param element
 * @returns {Number}
 */

function getScrollTop(element) {
  if (element === window) {
    return getWindowScrollTop();
  } else {
    return element.scrollTop;
  }
}

/**
 * Returns the provided element's scrollLeft property.
 *
 * @param element
 * @returns {Number}
 */

function getScrollLeft(element) {
  if (element === window) {
    return getWindowScrollLeft();
  } else {
    return element.scrollLeft;
  }
}

/**
 * Returns a DOM element responsible for scrolling of the provided element.
 *
 * @param {HTMLElement} element
 * @returns {HTMLElement} Element's scrollable parent
 */

function getScrollableElement(element) {
  var el = element.parentNode,
      props = ['auto', 'scroll'],
      overflow,
      overflowX,
      overflowY,
      computedStyle = '',
      computedOverflow = '',
      computedOverflowY = '',
      computedOverflowX = '';

  while (el && el.style && document.body !== el) {
    overflow = el.style.overflow;
    overflowX = el.style.overflowX;
    overflowY = el.style.overflowY;

    if (overflow == 'scroll' || overflowX == 'scroll' || overflowY == 'scroll') {
      return el;
    } else if (window.getComputedStyle) {
      computedStyle = window.getComputedStyle(el);
      computedOverflow = computedStyle.getPropertyValue('overflow');
      computedOverflowY = computedStyle.getPropertyValue('overflow-y');
      computedOverflowX = computedStyle.getPropertyValue('overflow-x');

      if (computedOverflow === 'scroll' || computedOverflowX === 'scroll' || computedOverflowY === 'scroll') {
        return el;
      }
    }

    if (el.clientHeight <= el.scrollHeight && (props.indexOf(overflowY) !== -1 || props.indexOf(overflow) !== -1 || props.indexOf(computedOverflow) !== -1 || props.indexOf(computedOverflowY) !== -1)) {
      return el;
    }
    if (el.clientWidth <= el.scrollWidth && (props.indexOf(overflowX) !== -1 || props.indexOf(overflow) !== -1 || props.indexOf(computedOverflow) !== -1 || props.indexOf(computedOverflowX) !== -1)) {
      return el;
    }
    el = el.parentNode;
  }

  return window;
}

/**
 * Returns a DOM element responsible for trimming the provided element.
 *
 * @param {HTMLElement} base Base element
 * @returns {HTMLElement} Base element's trimming parent
 */

function getTrimmingContainer(base) {
  var el = base.parentNode;

  while (el && el.style && document.body !== el) {
    if (el.style.overflow !== 'visible' && el.style.overflow !== '') {
      return el;
    } else if (window.getComputedStyle) {
      var computedStyle = window.getComputedStyle(el);

      if (computedStyle.getPropertyValue('overflow') !== 'visible' && computedStyle.getPropertyValue('overflow') !== '') {
        return el;
      }
    }

    el = el.parentNode;
  }

  return window;
}

/**
 * Returns a style property for the provided element. (Be it an inline or external style).
 *
 * @param {HTMLElement} element
 * @param {string} prop Wanted property
 * @returns {string} Element's style property
 */

function getStyle(element, prop) {
  if (!element) {
    return;
  } else if (element === window) {
    if (prop === 'width') {
      return window.innerWidth + 'px';
    } else if (prop === 'height') {
      return window.innerHeight + 'px';
    }
    return;
  }

  var styleProp = element.style[prop],
      computedStyle;
  if (styleProp !== "" && styleProp !== void 0) {
    return styleProp;
  } else {
    computedStyle = getComputedStyle(element);
    if (computedStyle[prop] !== "" && computedStyle[prop] !== void 0) {
      return computedStyle[prop];
    }
    return void 0;
  }
}

/**
 * Returns a computed style object for the provided element. (Needed if style is declared in external stylesheet).
 *
 * @param element
 * @returns {IEElementStyle|CssStyle} Elements computed style object
 */

function getComputedStyle(element) {
  return element.currentStyle || document.defaultView.getComputedStyle(element);
}

/**
 * Returns the element's outer width.
 *
 * @param element
 * @returns {number} Element's outer width
 */

function outerWidth(element) {
  return element.offsetWidth;
}

/**
 * Returns the element's outer height
 * @param elem
 * @returns {number} Element's outer height
 */

function outerHeight(elem) {
  if ((0, _browser.hasCaptionProblem)() && elem.firstChild && elem.firstChild.nodeName === 'CAPTION') {
    //fixes problem with Firefox ignoring <caption> in TABLE.offsetHeight
    //jQuery (1.10.1) still has this unsolved
    //may be better to just switch to getBoundingClientRect
    //http://bililite.com/blog/2009/03/27/finding-the-size-of-a-table/
    //http://lists.w3.org/Archives/Public/www-style/2009Oct/0089.html
    //http://bugs.jquery.com/ticket/2196
    //http://lists.w3.org/Archives/Public/www-style/2009Oct/0140.html#start140
    return elem.offsetHeight + elem.firstChild.offsetHeight;
  } else {
    return elem.offsetHeight;
  }
}

/**
 * Returns the element's inner height.
 *
 * @param element
 * @returns {number} Element's inner height
 */

function innerHeight(element) {
  return element.clientHeight || element.innerHeight;
}

/**
 * Returns the element's inner width.
 *
 * @param element
 * @returns {number} Element's inner width
 */

function innerWidth(element) {
  return element.clientWidth || element.innerWidth;
}

function addEvent(element, event, callback) {
  if (window.addEventListener) {
    element.addEventListener(event, callback, false);
  } else {
    element.attachEvent('on' + event, callback);
  }
}

function removeEvent(element, event, callback) {
  if (window.removeEventListener) {
    element.removeEventListener(event, callback, false);
  } else {
    element.detachEvent('on' + event, callback);
  }
}

/**
 * Returns caret position in text input
 *
 * @author http://stackoverflow.com/questions/263743/how-to-get-caret-position-in-textarea
 * @return {Number}
 */

function getCaretPosition(el) {
  if (el.selectionStart) {
    return el.selectionStart;
  } else if (document.selection) {
    // IE8
    el.focus();

    var r = document.selection.createRange();

    if (r == null) {
      return 0;
    }
    var re = el.createTextRange();
    var rc = re.duplicate();

    re.moveToBookmark(r.getBookmark());
    rc.setEndPoint('EndToStart', re);

    return rc.text.length;
  }

  return 0;
}

/**
 * Returns end of the selection in text input
 *
 * @return {Number}
 */

function getSelectionEndPosition(el) {
  if (el.selectionEnd) {
    return el.selectionEnd;
  } else if (document.selection) {
    //IE8
    var r = document.selection.createRange();

    if (r == null) {
      return 0;
    }
    var re = el.createTextRange();

    return re.text.indexOf(r.text) + r.text.length;
  }
}

/**
 * Sets caret position in text input.
 *
 * @author http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
 * @param {Element} element
 * @param {Number} pos
 * @param {Number} endPos
 */

function setCaretPosition(element, pos, endPos) {
  if (endPos === void 0) {
    endPos = pos;
  }
  if (element.setSelectionRange) {
    element.focus();

    try {
      element.setSelectionRange(pos, endPos);
    } catch (err) {
      var elementParent = element.parentNode;
      var parentDisplayValue = elementParent.style.display;
      elementParent.style.display = 'block';
      element.setSelectionRange(pos, endPos);
      elementParent.style.display = parentDisplayValue;
    }
  } else if (element.createTextRange) {
    //IE8
    var range = element.createTextRange();
    range.collapse(true);
    range.moveEnd('character', endPos);
    range.moveStart('character', pos);
    range.select();
  }
}

var cachedScrollbarWidth;

//http://stackoverflow.com/questions/986937/how-can-i-get-the-browsers-scrollbar-sizes
function walkontableCalculateScrollbarWidth() {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);

  (document.body || document.documentElement).appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) {
    w2 = outer.clientWidth;
  }

  (document.body || document.documentElement).removeChild(outer);

  return w1 - w2;
}

/**
 * Returns the computed width of the native browser scroll bar.
 *
 * @return {Number} width
 */

function getScrollbarWidth() {
  if (cachedScrollbarWidth === void 0) {
    cachedScrollbarWidth = walkontableCalculateScrollbarWidth();
  }

  return cachedScrollbarWidth;
}

/**
 * Sets overlay position depending on it's type and used browser
 */

function setOverlayPosition(overlayElem, left, top) {
  if ((0, _browser.isIE8)() || (0, _browser.isIE9)()) {
    overlayElem.style.top = top;
    overlayElem.style.left = left;
  } else if ((0, _browser.isSafari)()) {
    /* jshint sub:true */
    overlayElem.style['-webkit-transform'] = 'translate3d(' + left + ',' + top + ',0)';
  } else {
    overlayElem.style.transform = 'translate3d(' + left + ',' + top + ',0)';
  }
}

function getCssTransform(element) {
  var transform;

  /* jshint sub:true */
  if (element.style['transform'] && (transform = element.style['transform']) !== '') {
    return ['transform', transform];
  } else if (element.style['-webkit-transform'] && (transform = element.style['-webkit-transform']) !== '') {

    return ['-webkit-transform', transform];
  }

  return -1;
}

function resetCssTransform(element) {
  /* jshint sub:true */
  if (element['transform'] && element['transform'] !== '') {
    element['transform'] = '';
  } else if (element['-webkit-transform'] && element['-webkit-transform'] !== '') {
    element['-webkit-transform'] = '';
  }
}

/**
 * Determines if the given DOM element is an input field.
 * Notice: By 'input' we mean input, textarea and select nodes
 * @param element - DOM element
 * @returns {boolean}
 */

function isInput(element) {
  var inputs = ['INPUT', 'SELECT', 'TEXTAREA'];

  return inputs.indexOf(element.nodeName) > -1 || element.contentEditable === 'true';
}

/**
 * Determines if the given DOM element is an input field placed OUTSIDE of HOT.
 * Notice: By 'input' we mean input, textarea and select nodes
 * @param element - DOM element
 * @returns {boolean}
 */

function isOutsideInput(element) {
  return isInput(element) && element.className.indexOf('handsontableInput') == -1 && element.className.indexOf('copyPaste') == -1;
}

// https://gist.github.com/paulirish/1579671
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
var _requestAnimationFrame = window.requestAnimationFrame;
var _cancelAnimationFrame = window.cancelAnimationFrame;

for (var x = 0; x < vendors.length && !_requestAnimationFrame; ++x) {
  _requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
  _cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!_requestAnimationFrame) {
  _requestAnimationFrame = function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;

    return id;
  };
}

if (!_cancelAnimationFrame) {
  _cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

/**
 * Polyfill for requestAnimationFrame
 *
 * @param {Function} callback
 * @returns {Number}
 */

function requestAnimationFrame(callback) {
  return _requestAnimationFrame.call(window, callback);
}

/**
 * Polyfill for cancelAnimationFrame
 *
 * @param {Number} id
 */

function cancelAnimationFrame(id) {
  _cancelAnimationFrame.call(window, id);
}

},{"../browser":48}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.stopImmediatePropagation = stopImmediatePropagation;
exports.isImmediatePropagationStopped = isImmediatePropagationStopped;
exports.stopPropagation = stopPropagation;
exports.pageX = pageX;
exports.pageY = pageY;

function stopImmediatePropagation(event) {
  event.isImmediatePropagationEnabled = false;
  event.cancelBubble = true;
}

function isImmediatePropagationStopped(event) {
  return event.isImmediatePropagationEnabled === false;
}

function stopPropagation(event) {
  // ie8
  //http://msdn.microsoft.com/en-us/library/ie/ff975462(v=vs.85).aspx
  if (typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  } else {
    event.cancelBubble = true;
  }
}

function pageX(event) {
  if (event.pageX) {
    return event.pageX;
  }

  var scrollLeft = getWindowScrollLeft();
  var cursorX = event.clientX + scrollLeft;

  return cursorX;
}

function pageY(event) {
  if (event.pageY) {
    return event.pageY;
  }

  var scrollTop = getWindowScrollTop();
  var cursorY = event.clientY + scrollTop;

  return cursorY;
}

},{}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = proxy;
exports.throttle = throttle;
exports.throttleAfterHits = throttleAfterHits;

function proxy(fun, context) {
  return function () {
    return fun.apply(context, arguments);
  };
}

/**
 * Creates throttle function that invokes `func` only once per `wait` (in miliseconds).
 *
 * @param {Function} func
 * @param {Number} wait
 * @returns {Function}
 */

function throttle(func) {
  var wait = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];

  var lastCalled = 0;
  var result = {
    lastCallThrottled: true
  };
  var lastTimer = null;

  function _throttle() {
    var _this = this;

    var args = arguments;
    var stamp = Date.now();
    var needCall = false;

    result.lastCallThrottled = true;

    if (!lastCalled) {
      lastCalled = stamp;
      needCall = true;
    }
    var remaining = wait - (stamp - lastCalled);

    if (needCall) {
      result.lastCallThrottled = false;
      func.apply(this, args);
    } else {
      if (lastTimer) {
        clearTimeout(lastTimer);
      }
      lastTimer = setTimeout(function () {
        result.lastCallThrottled = false;
        func.apply(_this, args);
        lastCalled = 0;
        lastTimer = void 0;
      }, remaining);
    }

    return result;
  }

  return _throttle;
}

/**
 * Creates throttle function that invokes `func` only once per `wait` (in miliseconds) after hits.
 *
 * @param {Function} func
 * @param {Number} wait
 * @param {Number} hits
 * @returns {Function}
 */

function throttleAfterHits(func) {
  var wait = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];
  var hits = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];

  var funcThrottle = throttle(func, wait);
  var remainHits = hits;

  function _clearHits() {
    remainHits = hits;
  }
  function _throttleAfterHits() {
    if (remainHits) {
      remainHits--;

      return func.apply(this, arguments);
    }

    return funcThrottle.apply(this, arguments);
  }
  _throttleAfterHits.clearHits = _clearHits;

  return _throttleAfterHits;
}

},{}],53:[function(require,module,exports){

/**
 * Converts any value to string.
 *
 * @param {*} value
 * @returns {String}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.stringify = stringify;

function stringify(value) {
  switch (typeof value) {
    case 'string':
    case 'number':
      return value + '';

    case 'object':
      if (value === null) {
        return '';
      } else {
        return value.toString();
      }
      break;
    case 'undefined':
      return '';

    default:
      return value.toString();
  }
}

},{}],54:[function(require,module,exports){

/**
 * Checks if value of n is a numeric one
 * http://jsperf.com/isnan-vs-isnumeric/4
 * @param n
 * @returns {boolean}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isNumeric = isNumeric;
exports.rangeEach = rangeEach;
exports.valueAccordingPercent = valueAccordingPercent;

function isNumeric(n) {
  var t = typeof n;
  return t == 'number' ? !isNaN(n) && isFinite(n) : t == 'string' ? !n.length ? false : n.length == 1 ? /\d/.test(n) : /^\s*[+-]?\s*(?:(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?)|(?:0x[a-f\d]+))\s*$/i.test(n) : t == 'object' ? !!n && typeof n.valueOf() == "number" && !(n instanceof Date) : false;
}

/**
 * A specialized version of `.forEach` defined by ranges.
 *
 * @param {Number} rangeFrom The number from start iterate.
 * @param {Number} rangeTo The number where finish iterate.
 * @param {Function} iteratee The function invoked per iteration.
 */

function rangeEach(rangeFrom, rangeTo, iteratee) {
  var index = -1;

  if (typeof rangeTo === 'function') {
    iteratee = rangeTo;
    rangeTo = rangeFrom;
  } else {
    index = rangeFrom - 1;
  }
  while (++index <= rangeTo) {
    if (iteratee(index) === false) {
      break;
    }
  }
}

/**
 * Calculate value from percent.
 *
 * @param {Number} value Base value from percent will be calculated.
 * @param {String|Number} percent Can be Number or String (eq. `'33%'`).
 * @returns {Number}
 */

function valueAccordingPercent(value, percent) {
  percent = parseInt(percent.toString().replace('%', ''), 10);
  percent = parseInt(value * percent / 100);

  return percent;
}

},{}],55:[function(require,module,exports){

/**
 * Generate schema for passed object.
 *
 * @param {Array|Object} object
 * @returns {Array|Object}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.duckSchema = duckSchema;
exports.inherit = inherit;
exports.extend = extend;
exports.deepExtend = deepExtend;
exports.deepClone = deepClone;
exports.clone = clone;
exports.isObjectEquals = isObjectEquals;
exports.isObject = isObject;
exports.getPrototypeOf = getPrototypeOf;
exports.defineGetter = defineGetter;
exports.objectEach = objectEach;

function duckSchema(object) {
  var schema;

  if (Array.isArray(object)) {
    schema = [];
  } else {
    schema = {};

    objectEach(object, function (value, key) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        schema[key] = duckSchema(value);
      } else if (Array.isArray(value)) {
        if (value.length && typeof value[0] === 'object' && !Array.isArray(value[0])) {
          schema[key] = [duckSchema(value[0])];
        } else {
          schema[key] = [];
        }
      } else {
        schema[key] = null;
      }
    });
  }

  return schema;
}

/**
 * Inherit without without calling parent constructor, and setting `Child.prototype.constructor` to `Child` instead of `Parent`.
 * Creates temporary dummy function to call it as constructor.
 * Described in ticket: https://github.com/handsontable/handsontable/pull/516
 *
 * @param  {Object} Child  child class
 * @param  {Object} Parent parent class
 * @return {Object}        extended Child
 */

function inherit(Child, Parent) {
  Parent.prototype.constructor = Parent;
  Child.prototype = new Parent();
  Child.prototype.constructor = Child;

  return Child;
}

/**
 * Perform shallow extend of a target object with extension's own properties
 * @param {Object} target An object that will receive the new properties
 * @param {Object} extension An object containing additional properties to merge into the target
 */

function extend(target, extension) {
  objectEach(extension, function (value, key) {
    target[key] = value;
  });
}

/**
 * Perform deep extend of a target object with extension's own properties
 * @param {Object} target An object that will receive the new properties
 * @param {Object} extension An object containing additional properties to merge into the target
 */

function deepExtend(target, extension) {
  objectEach(extension, function (value, key) {
    if (extension[key] && typeof extension[key] === 'object') {
      if (!target[key]) {
        if (Array.isArray(extension[key])) {
          target[key] = [];
        } else {
          target[key] = {};
        }
      }
      deepExtend(target[key], extension[key]);
    } else {
      target[key] = extension[key];
    }
  });
}

/**
 * Perform deep clone of an object.
 * WARNING! Only clones JSON properties. Will cause error when `obj` contains a function, Date, etc.
 *
 * @param {Object} obj An object that will be cloned
 * @return {Object}
 */

function deepClone(obj) {
  if (typeof obj === "object") {
    return JSON.parse(JSON.stringify(obj));
  }

  return obj;
}

/**
 * Shallow clone object.
 *
 * @param {Object} object
 * @returns {Object}
 */

function clone(object) {
  var result = {};

  objectEach(object, function (value, key) {
    return result[key] = value;
  });

  return result;
}

/**
 * Checks if two objects or arrays are (deep) equal
 *
 * @param {Object|Array} object1
 * @param {Object|Array} object2
 * @returns {Boolean}
 */

function isObjectEquals(object1, object2) {
  return JSON.stringify(object1) === JSON.stringify(object2);
}

/**
 * Determines whether given object is a plain Object.
 * Note: String and Array are not plain Objects
 * @param {*} obj
 * @returns {boolean}
 */

function isObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]';
}

function getPrototypeOf(obj) {
  var prototype;

  /* jshint ignore:start */
  if (typeof obj.__proto__ == "object") {
    prototype = obj.__proto__;
  } else {
    var oldConstructor,
        constructor = obj.constructor;

    if (typeof obj.constructor == "function") {
      oldConstructor = constructor;

      if (delete obj.constructor) {
        constructor = obj.constructor; // get real constructor
        obj.constructor = oldConstructor; // restore constructor
      }
    }

    prototype = constructor ? constructor.prototype : null; // needed for IE
  }
  /* jshint ignore:end */

  return prototype;
}

function defineGetter(object, property, value, options) {
  options.value = value;
  options.writable = options.writable === false ? false : true;
  options.enumerable = options.enumerable === false ? false : true;
  options.configurable = options.configurable === false ? false : true;

  Object.defineProperty(object, property, options);
}

/**
 * A specialized version of `.forEach` for objects.
 *
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */

function objectEach(object, iteratee) {
  for (var key in object) {
    if (!object.hasOwnProperty || object.hasOwnProperty && object.hasOwnProperty(key)) {
      if (iteratee(object[key], key, object) === false) {
        break;
      }
    }
  }

  return object;
}

},{}],56:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.columnFactory = columnFactory;

var _object = require('./object');

/**
 * Factory for columns constructors.
 *
 * @param {Object} GridSettings
 * @param {Array} conflictList
 * @return {Object} ColumnSettings
 */

function columnFactory(GridSettings, conflictList) {
  function ColumnSettings() {};

  (0, _object.inherit)(ColumnSettings, GridSettings);

  // Clear conflict settings
  for (var i = 0, len = conflictList.length; i < len; i++) {
    ColumnSettings.prototype[conflictList[i]] = void 0;
  }

  return ColumnSettings;
}

},{"./object":55}],57:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.toUpperCaseFirst = toUpperCaseFirst;
exports.equalsIgnoreCase = equalsIgnoreCase;
exports.randomString = randomString;
exports.isPercentValue = isPercentValue;

var _mixed = require('./mixed');

/**
 * Convert string to upper case first letter.
 *
 * @param {String} string String to convert.
 * @returns {String}
 */

function toUpperCaseFirst(string) {
  return string[0].toUpperCase() + string.substr(1);
}

/**
 * Compare strings case insensitively.
 *
 * @param {...String} strings Strings to compare.
 * @returns {Boolean}
 */

function equalsIgnoreCase() {
  var unique = [];

  for (var _len = arguments.length, strings = Array(_len), _key = 0; _key < _len; _key++) {
    strings[_key] = arguments[_key];
  }

  var length = strings.length;

  while (length--) {
    var string = (0, _mixed.stringify)(strings[length]).toLowerCase();

    if (unique.indexOf(string) === -1) {
      unique.push(string);
    }
  }

  return unique.length === 1;
}

/**
 * Generates a random hex string. Used as namespace for Handsontable instance events.
 * @return {String} - 16 character random string: "92b1bfc74ec4"
 */

function randomString() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + s4() + s4();
}

/**
 * Checks if value is valid percent.
 *
 * @param {String} value
 * @returns {Boolean}
 */

function isPercentValue(value) {
  return (/^([0-9][0-9]?\%$)|(^100\%$)/.test(value)
  );
}

},{"./mixed":53}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isPrintableChar = isPrintableChar;
exports.isMetaKey = isMetaKey;
exports.isCtrlKey = isCtrlKey;
exports.isKey = isKey;

var _array = require('./array');

var KEY_CODES = {
  MOUSE_LEFT: 1,
  MOUSE_RIGHT: 3,
  MOUSE_MIDDLE: 2,
  BACKSPACE: 8,
  COMMA: 188,
  INSERT: 45,
  DELETE: 46,
  END: 35,
  ENTER: 13,
  ESCAPE: 27,
  CONTROL_LEFT: 91,
  COMMAND_LEFT: 17,
  COMMAND_RIGHT: 93,
  ALT: 18,
  HOME: 36,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  PERIOD: 190,
  SPACE: 32,
  SHIFT: 16,
  CAPS_LOCK: 20,
  TAB: 9,
  ARROW_RIGHT: 39,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  A: 65,
  X: 88,
  C: 67,
  V: 86
};

exports.KEY_CODES = KEY_CODES;
/**
 * Returns true if keyCode represents a printable character.
 *
 * @param {Number} keyCode
 * @returns {Boolean}
 */

function isPrintableChar(keyCode) {
  return keyCode == 32 || //space
  keyCode >= 48 && keyCode <= 57 || //0-9
  keyCode >= 96 && keyCode <= 111 || //numpad
  keyCode >= 186 && keyCode <= 192 || //;=,-./`
  keyCode >= 219 && keyCode <= 222 || //[]{}\|"'
  keyCode >= 226 || //special chars (229 for Asian chars)
  keyCode >= 65 && keyCode <= 90; //a-z
}

/**
 * @param {Number} keyCode
 * @returns {Boolean}
 */

function isMetaKey(keyCode) {
  var metaKeys = [KEY_CODES.ARROW_DOWN, KEY_CODES.ARROW_UP, KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_RIGHT, KEY_CODES.HOME, KEY_CODES.END, KEY_CODES.DELETE, KEY_CODES.BACKSPACE, KEY_CODES.F1, KEY_CODES.F2, KEY_CODES.F3, KEY_CODES.F4, KEY_CODES.F5, KEY_CODES.F6, KEY_CODES.F7, KEY_CODES.F8, KEY_CODES.F9, KEY_CODES.F10, KEY_CODES.F11, KEY_CODES.F12, KEY_CODES.TAB, KEY_CODES.PAGE_DOWN, KEY_CODES.PAGE_UP, KEY_CODES.ENTER, KEY_CODES.ESCAPE, KEY_CODES.SHIFT, KEY_CODES.CAPS_LOCK, KEY_CODES.ALT];

  return metaKeys.indexOf(keyCode) !== -1;
}

/**
 * @param {Number} keyCode
 * @returns {Boolean}
 */

function isCtrlKey(keyCode) {
  return [KEY_CODES.CONTROL_LEFT, 224, KEY_CODES.COMMAND_LEFT, KEY_CODES.COMMAND_RIGHT].indexOf(keyCode) !== -1;
}

/**
 * @param {Number} keyCode
 * @param {String} baseCode
 * @returns {Boolean}
 */

function isKey(keyCode, baseCode) {
  var keys = baseCode.split('|');
  var result = false;

  (0, _array.arrayEach)(keys, function (key) {
    if (keyCode === KEY_CODES[key]) {
      result = true;

      return false;
    }
  });

  return result;
}

},{"./array":47}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.MultiMap = MultiMap;

// TODO: Global expose for tests
window.MultiMap = MultiMap;

function MultiMap() {
  var map = {
    arrayMap: [],
    weakMap: new WeakMap()
  };

  return {
    'get': function get(key) {
      if (canBeAnArrayMapKey(key)) {
        return map.arrayMap[key];
      } else if (canBeAWeakMapKey(key)) {
        return map.weakMap.get(key);
      }
    },

    'set': function set(key, value) {
      if (canBeAnArrayMapKey(key)) {
        map.arrayMap[key] = value;
      } else if (canBeAWeakMapKey(key)) {
        map.weakMap.set(key, value);
      } else {
        throw new Error('Invalid key type');
      }
    },

    'delete': function _delete(key) {
      if (canBeAnArrayMapKey(key)) {
        delete map.arrayMap[key];
      } else if (canBeAWeakMapKey(key)) {
        map.weakMap['delete'](key); //Delete must be called using square bracket notation, because IE8 does not handle using `delete` with dot notation
      }
    }
  };

  function canBeAnArrayMapKey(obj) {
    return obj !== null && !isNaNSymbol(obj) && (typeof obj == 'string' || typeof obj == 'number');
  }

  function canBeAWeakMapKey(obj) {
    return obj !== null && (typeof obj == 'object' || typeof obj == 'function');
  }

  function isNaNSymbol(obj) {
    return obj !== obj; // NaN === NaN is always false
  }
}

},{}],60:[function(require,module,exports){

/**
 * @description
 * Handsontable events are the common interface that function in 2 ways: as __callbacks__ and as __hooks__.
 *
 * @example
 *
 * ```js
 * // Using events as callbacks:
 * ...
 * var hot1 = new Handsontable(document.getElementById('example1'), {
 *   afterChange: function(changes, source) {
 *     $.ajax({
 *       url: "save.php",
 *       data: change
 *     });
 *   }
 * });
 * ...
 * ```
 *
 * ```js
 * // Using events as plugin hooks:
 * ...
 * var hot1 = new Handsontable(document.getElementById('example1'), {
 *   myPlugin: true
 * });
 *
 * var hot2 = new Handsontable(document.getElementById('example2'), {
 *   myPlugin: false
 * });
 *
 * // global hook
 * Handsontable.hooks.add('afterChange', function() {
 *   // Fired twice - for hot1 and hot2
 *   if (this.getSettings().myPlugin) {
 *     // function body - will only run for hot1
 *   }
 * });
 *
 * // local hook (has same effect as a callback)
 * hot2.addHook('afterChange', function() {
 *   // function body - will only run in #example2
 * });
 * ```
 * ...
 */

// @TODO: Move plugin description hooks to plugin?
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _eventManager = require('./eventManager');

var _helpersArray = require('./helpers/array');

var _helpersObject = require('./helpers/object');

var REGISTERED_HOOKS = [
/**
 * Callback fired after reset cell's meta.
 *
 * @event Hooks#afterCellMetaReset
 * @since 0.11
 */
"afterCellMetaReset",

/**
 * @description
 * Callback fired after one or more cells is changed. Its main use case is to save the input.
 *
 * __Note:__ For performance reasons, the `changes` array is null for `"loadData"` source.
 *
 * @event Hooks#afterChange
 * @param {Array} changes 2D array containing information about each of the edited cells `[[row, prop, oldVal, newVal], ...]`
 * @param {String} source Is one of the strings: `"alter", "empty", "edit", "populateFromArray", "loadData", "autofill", "paste"`.
 */
"afterChange", "afterChangesObserved", "afterColumnMove", "afterColumnResize", "afterContextMenuDefaultOptions", "afterContextMenuHide", "afterContextMenuShow", "afterCopyLimit",

/**
 * Callback is fired when a new column is created.
 *
 * @event Hooks#afterCreateCol
 * @param {Number} index Represents the index of first newly created column in the data source array.
 * @param {Number} amount Number of newly created columns in the data source array.
 */
"afterCreateCol",

/**
 * Callback is fired when a new row is created.
 *
 * @event Hooks#afterCreateRow
 * @param {Number} index Represents the index of first newly created row in the data source array.
 * @param {Number} amount Number of newly created rows in the data source array.
 */
"afterCreateRow",

/**
 * Event called when current cell is deselected.
 *
 * @event Hooks#afterDeselect
 */
"afterDeselect",

/**
 * Callback fired after destroying Handsontable instance.
 *
 * @event Hooks#afterDestroy
 */
"afterDestroy",

/**
 * @event Hooks#afterDocumentKeyDown
 */
"afterDocumentKeyDown",

/**
 * Callback fired after getting cell settings.
 *
 * @event Hooks#afterGetCellMeta
 * @param {Number} row
 * @param {Number} col
 * @param {Object} cellProperties
 */
"afterGetCellMeta",

/**
 * Callback fired after getting info about column header.
 *
 * @event Hooks#afterGetColHeader
 * @param {Number} col
 * @param {Element} TH
 */
"afterGetColHeader",

/**
 * @event Hooks#afterGetRowHeader
 */
"afterGetRowHeader",

/**
 * Callback fired after Handsontable instance is initiated.
 *
 * @event Hooks#afterInit
 */
"afterInit",

/**
 * @event Hooks#afterIsMultipleSelectionCheck
 */
"afterIsMultipleSelectionCheck",

/**
 * Callback fired after new data is loaded (by `loadData` method) into the data source array.
 *
 * @event Hooks#afterLoadData
 */
"afterLoadData",

/**
 * @event Hooks#afterMomentumScroll
 */
"afterMomentumScroll",

/**
 * @event Hooks#afterOnCellCornerMouseDown
 * @since 0.11
 * @param {Object} event
 */
"afterOnCellCornerMouseDown",

/**
 * Callback fired after clicking on a cell or row/column header.
 * In case the row/column header was clicked, the index is negative.
 * For example clicking on the row header of cell (0, 0) results with `afterOnCellMouseDown` called with coords `{row: 0, col: -1}`.
 *
 * @event Hooks#afterOnCellMouseDown
 * @since 0.11
 * @param {Object} event
 * @param {Object} coords
 * @param {Object} TD
 */
"afterOnCellMouseDown",

/**
 * Callback fired after hovering a cell or row/column header with the mouse cursor.
 * In case the row/column header was hovered, the index is negative.
 * For example clicking on the row header of cell (0, 0) results with `afterOnCellMouseOver` called with coords `{row: 0, col: -1}`.
 *
 * @event Hooks#afterOnCellMouseOver
 * @since 0.11
 * @param {Object} event
 * @param {Object} coords
 * @param {Object} TD
 */
"afterOnCellMouseOver",

/**
 * Callback is fired when one or more columns are removed.
 *
 * @event Hooks#afterRemoveCol
 * @param {Number} index Is an index of starter column.
 * @param {Number} amount Is an amount of removed columns.
 */
"afterRemoveCol",

/**
 * Callback is fired when one or more rows are removed.
 *
 * @event Hooks#afterRemoveRow
 * @param {Number} index Is an index of starter row.
 * @param {Number} amount Is an amount of removed rows.
 */
"afterRemoveRow",

/**
 * Callback fired after Handsontable table is rendered.
 *
 * @event Hooks#afterRender
 * @param {Boolean} isForced Is `true` if rendering was triggered by a change of settings or data; or `false` if
 *                           rendering was triggered by scrolling or moving selection.
 */
"afterRender",

/**
 * @event Hooks#afterRenderer
 * @since 0.11
 * @param {Object} TD
 * @param {Number} row
 * @param {Number} col
 * @param {String} prop
 * @param {String} value
 * @param {Object} cellProperties
 */
"afterRenderer", "afterRowMove", "afterRowResize",

/**
 * @event Hooks#afterScrollHorizontally
 * @since 0.11
 */
"afterScrollHorizontally",

/**
 * @event Hooks#afterScrollVertically
 * @since 0.11
 */
"afterScrollVertically",

/**
 * Callback fired while one or more cells are being selected (on mouse move).
 *
 * @event Hooks#afterSelection
 * @param {Number} r Selection start row
 * @param {Number} c Selection start column
 * @param {Number} r2 Selection end row
 * @param {Number} c2 Selection end column
 */
"afterSelection",

/**
 * The same as above, but data source object property name is used instead of the column number.
 *
 * @event Hooks#afterSelectionByProp
 * @param {Number} r Selection start row
 * @param {String} p Selection start data source object property
 * @param {Number} r2 Selection end row
 * @param {String} p2 Selection end data source object property
 */
"afterSelectionByProp",

/**
 * Callback fired after one or more cells are selected (on mouse up).
 *
 * @event Hooks#afterSelectionEnd
 * @param {Number} r Selection start row
 * @param {Number} c Selection start column
 * @param {Number} r2 Selection end row
 * @param {Number} c2 Selection end column
 */
"afterSelectionEnd",

/**
 * The same as above, but data source object property name is used instead of the column number.
 *
 * @event Hooks#afterSelectionEndByProp
 * @param {Number} r Selection start row
 * @param {String} p Selection start data source object property
 * @param {Number} r2 Selection end row
 * @param {String} p2 Selection end data source object property
 */
"afterSelectionEndByProp",

/**
 * Called after cell meta was changed, e.g. using the context menu.
 *
 * @event Hooks#afterSetCellMeta
 * @since 0.11.0
 * @param {Number} row
 * @param {Number} col
 * @param {String} key
 * @param {*} value
 */
"afterSetCellMeta",

/**
 * @event Hooks#afterUpdateSettings
 */
"afterUpdateSettings",

/**
 * @description
 * A plugin hook executed after validator function, only if validator function is defined.
 * Validation result is the first parameter. This can be used to determinate if validation passed successfully or not.
 *
 * __You can cancel current change by returning false.__
 *
 * @event Hooks#afterValidate
 * @since 0.9.5
 * @param {Boolean} isValid
 * @param {*} value
 * @param {Number} row
 * @param {String} prop
 * @param {String} source
 */
"afterValidate",

/**
 * @event Hooks#beforeAutofill
 * @param {Object} start Object containing information about first filled cell: `{row: 2, col: 0}`
 * @param {Object} end Object containing information about last filled cell: `{row: 4, col: 1}`
 * @param {Array} data 2D array containing information about fill pattern: `[["1", "Ted"], ["1", "John"]]`
 */
"beforeAutofill",

/**
 * @event Hooks#beforeCellAlignment
 */
"beforeCellAlignment",

/**
 * Callback fired before one or more cells is changed. Its main purpose is to alter changes silently before input.
 *
 * @event Hooks#beforeChange
 * @param {Array} changes 2D array containing information about each of the edited cells.
 * @param {String} source The name of a source of changes.
 * @example
 * ```js
 * // To disregard a single change, set changes[i] to null or remove it from array using changes.splice(i, 1).
 * ...
 * new Handsontable(document.getElementById('example'), {
 *   beforeChange: function(changes, source) {
 *     // [[row, prop, oldVal, newVal], ...]
 *     changes[0] = null;
 *   }
 * });
 * ...
 *
 * // To alter a single change, overwrite the desired value to changes[i][3].
 * ...
 * new Handsontable(document.getElementById('example'), {
 *   beforeChange: function(changes, source) {
 *     // [[row, prop, oldVal, newVal], ...]
 *     changes[0][1] = 10;
 *   }
 * });
 * ...
 *
 * // To cancel all edit, return false from the callback or set array length to 0 (changes.length = 0).
 * ...
 * new Handsontable(document.getElementById('example'), {
 *   beforeChange: function(changes, source) {
 *     // [[row, prop, oldVal, newVal], ...]
 *     return false;
 *   }
 * });
 * ...
 * ```
 */
"beforeChange",

/**
 * @event Hooks#beforeChangeRender
 * @since 0.11
 */
"beforeChangeRender",

/**
 * @event Hooks#beforeDrawBorders
 */
"beforeDrawBorders",

/**
 * Callback fired before getting cell settings.
 *
 * @event Hooks#beforeGetCellMeta
 * @param {Number} row
 * @param {Number} col
 * @param {Object} cellProperties
 */
"beforeGetCellMeta",

/**
 * @description
 * Callback fired before Handsontable instance is initiated.
 *
 * @event Hooks#beforeInit
 */

"beforeInit",

/**
 * Callback fired before Walkontable instance is initiated.
 *
 * @since 0.11
 * @event Hooks#beforeInitWalkontable
 */
"beforeInitWalkontable",

/**
 * Callback fired before keydown event is handled. It can be used to overwrite default key bindings.
 * Caution - in your `beforeKeyDown` handler you need to call `event.stopImmediatePropagation()` to prevent default key behavior.
 *
 * @event Hooks#beforeKeyDown
 * @since 0.9.0
 * @param {Object} event Original DOM event
 */
"beforeKeyDown",

/**
 * @event Hooks#beforeOnCellMouseDown
 */
"beforeOnCellMouseDown",

/**
 * Callback is fired when one or more columns are about to be removed.
 *
 * @event Hooks#beforeRemoveCol
 * @param {Number} index Index of starter column.
 * @param {Number} amount Amount of columns to be removed.
 */
"beforeRemoveCol",

/**
 * Callback is fired when one or more rows are about to be removed.
 *
 * @event Hooks#beforeRemoveRow
 * @param {Number} index Index of starter column.
 * @param {Number} amount Amount of columns to be removed.
 */
"beforeRemoveRow",

/**
 * Callback fired before Handsontable table is rendered.
 *
 * @event Hooks#beforeRender
 * @param {Boolean} isForced If `true` rendering was triggered by a change of settings or data; or `false` if
 *                           rendering was triggered by scrolling or moving selection.
 */
"beforeRender",

/**
 * Callback fired before setting range is ended.
 *
 * @event Hooks#beforeSetRangeEnd
 * @param {Array} coords WalkontableCellCoords array.
 */
"beforeSetRangeEnd",

/**
 * @event Hooks#beforeTouchScroll
 */
"beforeTouchScroll",

/**
 * @description
 * A plugin hook executed before validator function, only if validator function is defined.
 * This can be used to manipulate value of changed cell before it is applied to the validator function.
 *
 * __Notice:__ this will not affect values of changes. This will change value ONLY for validation!
 *
 * @event Hooks#beforeValidate
 * @since 0.9.5
 * @param {*} value
 * @param {Number} row
 * @param {String} prop
 * @param {String} source
 */
"beforeValidate",

/**
 * Callback fired after Handsontable instance is constructed (via `new` operator).
 *
 * @event Hooks#construct
 * @since 0.16.1
 */
"construct",

/**
 * Callback fired after Handsontable instance is initiated but before table is rendered.
 *
 * @event Hooks#init
 * @since 0.16.1
 */
"init",

/**
 * Callback fired after column modify.
 *
 * @event Hooks#modifyCol
 * @since 0.11
 * @param {Number} col
 */
"modifyCol",

/**
 * Callback fired after modify column's width.
 *
 * @event Hooks#modifyColWidth
 * @since 0.11
 * @param {Number} width
 * @param {Number} col
 */
"modifyColWidth",

/**
 * Callback fired after row modify.
 *
 * @event Hooks#modifyRow
 * @since 0.11
 * @param {Number} row
 */
"modifyRow",

/**
 * Callback fired after modify height of row.
 *
 * @event Hooks#modifyRowHeight
 * @since 0.11
 * @param {Number} height
 * @param {Number} row
 */
"modifyRowHeight",

/**
 * @event Hooks#persistentStateLoad
 */
"persistentStateLoad",

/**
 * @event Hooks#persistentStateReset
 */
"persistentStateReset",

/**
 * @event Hooks#persistentStateSave
 */
"persistentStateSave"];

var Hooks = (function () {
  /**
   *
   */

  function Hooks() {
    _classCallCheck(this, Hooks);

    this.globalBucket = this.createEmptyBucket();
  }

  /**
   * Returns new object with empty handlers related to every registered hook name.
   *
   * @returns {Object}
   *
   * @example
   * ```js
   * Handsontable.hooks.createEmptyBucket();
   * // Results:
   * {
   * ...
   * afterCreateCol: [],
   * afterCreateRow: [],
   * beforeInit: [],
   * ...
   * }
   * ```
   */

  _createClass(Hooks, [{
    key: "createEmptyBucket",
    value: function createEmptyBucket() {
      var bucket = Object.create(null);

      (0, _helpersArray.arrayEach)(REGISTERED_HOOKS, function (hook) {
        return bucket[hook] = [];
      });

      return bucket;
    }

    /**
     * Get hook bucket based on context object or if argument is `undefined` get global hook bucked.
     *
     * @param {Object} [context=null]
     * @returns {Object} Returns global or handsontable instance bucket
     */
  }, {
    key: "getBucket",
    value: function getBucket() {
      var context = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (context) {
        if (!context.pluginHookBucket) {
          context.pluginHookBucket = this.createEmptyBucket();
        }

        return context.pluginHookBucket;
      }

      return this.globalBucket;
    }

    /**
     * Adds listener (globally or locally) to specified hook name.
     *
     * @see Core#addHook
     * @param {String} key Hook/Event name
     * @param {Function|Array} callback Callback function or array of functions
     * @param {Object} [context=null]
     * @returns {Hooks} Instance of Hooks
     *
     * @example
     * ```js
     * Handsontable.hooks.add('beforeInit', myCallback, hotInstance);
     * ```
     */
  }, {
    key: "add",
    value: function add(key, callback) {
      var _this = this;

      var context = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      if (Array.isArray(callback)) {
        (0, _helpersArray.arrayEach)(callback, function (c) {
          return _this.add(key, c, context);
        });
      } else {
        var bucket = this.getBucket(context);

        if (typeof bucket[key] === 'undefined') {
          this.register(key);
          bucket[key] = [];
        }
        callback.skip = false;

        if (bucket[key].indexOf(callback) === -1) {
          // only add a hook if it has not already been added (adding the same hook twice is now silently ignored)
          bucket[key].push(callback);
        }
      }

      return this;
    }

    /**
     * Adds listener to specified hook. After hook runs this listener will be automatically removed.
     *
     * @see Core#addHookOnce
     * @param {String} key Hook/Event name
     * @param {Function} callback Callback function
     * @param {Object} [context=null]
     *
     * @example
     * ```js
     * Handsontable.hooks.once('beforeInit', myCallback, hotInstance);
     * ```
     */
  }, {
    key: "once",
    value: function once(key, callback) {
      var _this2 = this;

      var context = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      if (Array.isArray(callback)) {
        (0, _helpersArray.arrayEach)(callback, function (c) {
          return _this2.once(key, c, context);
        });
      } else {
        callback.runOnce = true;
        this.add(key, callback, context);
      }
    }

    /**
     * Removes listener from hooks.
     *
     * @see Core#removeHook
     * @param {String} key Hook/Event name
     * @param {Function} callback Callback function
     * @param {Object} [context=null]
     * @return {Boolean} Returns `true` if hook was removed
     *
     * @example
     * ```js
     * Handsontable.hooks.remove('beforeInit', myCallback);
     * ```
     */
  }, {
    key: "remove",
    value: function remove(key, callback) {
      var context = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var bucket = this.getBucket(context);

      if (typeof bucket[key] !== 'undefined') {
        if (bucket[key].indexOf(callback) >= 0) {
          callback.skip = true;

          return true;
        }
      }

      return false;
    }

    /**
     * Run all local and global listeners by hook name.
     *
     * @see Core#runHooks
     * @param {Object} context
     * @param {String} key Hook/Event name
     * @param {*} [p1]
     * @param {*} [p2]
     * @param {*} [p3]
     * @param {*} [p4]
     * @param {*} [p5]
     * @param {*} [p6]
     * @returns {*}
     *
     * @example
     * ```js
     * Handsontable.hooks.run(hot, 'beforeInit');
     * ```
     */
  }, {
    key: "run",
    value: function run(context, key, p1, p2, p3, p4, p5, p6) {
      {
        var globalHandlers = this.globalBucket[key];
        var index = -1;
        var _length = globalHandlers ? globalHandlers.length : 0;

        if (_length) {
          // Do not optimise this loop with arrayEach or arrow function! If you do You'll decrease perf because of GC.
          while (++index < _length) {
            if (!globalHandlers[index] || globalHandlers[index].skip) {
              continue;
            }
            // performance considerations - http://jsperf.com/call-vs-apply-for-a-plugin-architecture
            var res = globalHandlers[index].call(context, p1, p2, p3, p4, p5, p6);

            if (res !== void 0) {
              p1 = res;
            }
            if (globalHandlers[index] && globalHandlers[index].runOnce) {
              this.remove(key, globalHandlers[index]);
            }
          }
        }
      }
      {
        var localHandlers = this.getBucket(context)[key];
        var index = -1;
        var _length2 = localHandlers ? localHandlers.length : 0;

        if (_length2) {
          // Do not optimise this loop with arrayEach or arrow function! If you do You'll decrease perf because of GC.
          while (++index < _length2) {
            if (!localHandlers[index] || localHandlers[index].skip) {
              continue;
            }
            // performance considerations - http://jsperf.com/call-vs-apply-for-a-plugin-architecture
            var res = localHandlers[index].call(context, p1, p2, p3, p4, p5, p6);

            if (res !== void 0) {
              p1 = res;
            }
            if (localHandlers[index] && localHandlers[index].runOnce) {
              this.remove(key, localHandlers[index], context);
            }
          }
        }
      }

      return p1;
    }

    /**
     * Destroy all listeners connected to the context. If context is not exists then listeners will by destroy
     * from globally.
     *
     * @param {Object} [context=null]
     */
  }, {
    key: "destroy",
    value: function destroy() {
      var context = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      (0, _helpersObject.objectEach)(this.getBucket(context), function (value, key, bucket) {
        return bucket[key].length = 0;
      });
    }

    /**
     * Registers a hook name (adds it to the list of the known hook names). Used by plugins. It is not necessary to call,
     * register, but if you use it, your plugin hook will be used returned by getRegistered
     * (which itself is used in the demo http://handsontable.com/demo/callbacks.html).
     *
     * @param key {String} Hook name
     *
     * @example
     * ```js
     * Handsontable.hooks.register('myHook');
     * ```
     */
  }, {
    key: "register",
    value: function register(key) {
      if (!this.isRegistered(key)) {
        REGISTERED_HOOKS.push(key);
      }
    }

    /**
     * Unregister a hook name (removes it from the list of known hook names).
     *
     * @param key {String} Hook name
     *
     * @example
     * ```js
     * Handsontable.hooks.deregister('myHook');
     * ```
     */
  }, {
    key: "deregister",
    value: function deregister(key) {
      if (this.isRegistered(key)) {
        REGISTERED_HOOKS.splice(REGISTERED_HOOKS.indexOf(key), 1);
      }
    }

    /**
     * Returns boolean information if a hook by such name has been registered.
     *
     * @param key {String} Hook name
     * @returns {Boolean}
     *
     * @example
     * ```js
     * Handsontable.hooks.isRegistered('beforeInit');
     * // Results:
     * true
     * ```
     */
  }, {
    key: "isRegistered",
    value: function isRegistered(key) {
      return REGISTERED_HOOKS.indexOf(key) >= 0;
    }

    /**
     * Returns an array of registered hooks.
     *
     * @returns {Array}
     *
     * @example
     * ```js
     * Handsontable.hooks.getRegistered();
     * // Results:
     * [
     * ...
     *   "beforeInit",
     *   "beforeRender",
     *   "beforeSetRangeEnd",
     *   "beforeDrawBorders",
     *   "beforeChange",
     * ...
     * ]
     * ```
     */
  }, {
    key: "getRegistered",
    value: function getRegistered() {
      return REGISTERED_HOOKS;
    }
  }]);

  return Hooks;
})();

exports.Hooks = Hooks;

// temp for tests only!
Handsontable.utils = Handsontable.utils || {};
Handsontable.utils.Hooks = Hooks;

},{"./eventManager":46,"./helpers/array":47,"./helpers/object":55}],61:[function(require,module,exports){
/**
 * Utility to register plugins and common namespace for keeping reference to all plugins classes
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersObject = require('./helpers/object');

var _helpersString = require('./helpers/string');

var registeredPlugins = new WeakMap();

/**
 * Registers plugin under given name
 *
 * @param {String} pluginName
 * @param {Function} PluginClass
 */
function registerPlugin(pluginName, PluginClass) {
  pluginName = (0, _helpersString.toUpperCaseFirst)(pluginName);

  Handsontable.hooks.add('construct', function () {
    var holder;

    if (!registeredPlugins.has(this)) {
      registeredPlugins.set(this, {});
    }
    holder = registeredPlugins.get(this);

    if (!holder[pluginName]) {
      holder[pluginName] = new PluginClass(this);
    }
  });
  Handsontable.hooks.add('afterDestroy', function () {
    var i, pluginsHolder;

    if (registeredPlugins.has(this)) {
      pluginsHolder = registeredPlugins.get(this);

      for (i in pluginsHolder) {
        if (pluginsHolder.hasOwnProperty(i)) {
          pluginsHolder[i].destroy();
        }
      }
      registeredPlugins['delete'](this);
    }
  });
}

/**
 * @param {Object} instance
 * @param {String|Function} pluginName
 * @returns {Function} pluginClass Returns plugin instance if exists or `undefined` if not exists.
 */
function getPlugin(instance, pluginName) {
  if (typeof pluginName != 'string') {
    throw Error('Only strings can be passed as "plugin" parameter');
  }
  var _pluginName = (0, _helpersString.toUpperCaseFirst)(pluginName);

  if (!registeredPlugins.has(instance) || !registeredPlugins.get(instance)[_pluginName]) {
    return void 0;
  }

  return registeredPlugins.get(instance)[_pluginName];
}

/**
 * Get all registred plugins names for concrete Handsontable instance.
 *
 * @param {Object} hotInstance
 * @returns {Array}
 */
function getRegistredPluginNames(hotInstance) {
  return registeredPlugins.has(hotInstance) ? Object.keys(registeredPlugins.get(hotInstance)) : [];
}

/**
 * Get plugin name.
 *
 * @param {Object} hotInstance
 * @param {Object} plugin
 * @returns {String|null}
 */
function getPluginName(hotInstance, plugin) {
  var pluginName = null;

  if (registeredPlugins.has(hotInstance)) {
    (0, _helpersObject.objectEach)(registeredPlugins.get(hotInstance), function (pluginInstance, name) {
      if (pluginInstance === plugin) {
        pluginName = name;
      }
    });
  }

  return pluginName;
}

exports.registerPlugin = registerPlugin;
exports.getPlugin = getPlugin;
exports.getRegistredPluginNames = getRegistredPluginNames;
exports.getPluginName = getPluginName;

},{"./helpers/object":55,"./helpers/string":57}],62:[function(require,module,exports){
/**
 * Utility to register renderers and common namespace for keeping reference to all renderers classes
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersString = require('./helpers/string');

var registeredRenderers = {};

// support for older versions of Handsontable
Handsontable.renderers = Handsontable.renderers || {};
Handsontable.renderers.registerRenderer = registerRenderer;
Handsontable.renderers.getRenderer = getRenderer;

/**
 * Registers renderer under given name
 * @param {String} rendererName
 * @param {Function} rendererFunction
 */
function registerRenderer(rendererName, rendererFunction) {
  var registerName;

  registeredRenderers[rendererName] = rendererFunction;

  registerName = (0, _helpersString.toUpperCaseFirst)(rendererName) + 'Renderer';
  // support for older versions of Handsontable
  Handsontable.renderers[registerName] = rendererFunction;
  Handsontable[registerName] = rendererFunction;
}

/**
 * @param {String|Function} rendererName
 * @returns {Function} rendererFunction
 */
function getRenderer(rendererName) {
  if (typeof rendererName == 'function') {
    return rendererName;
  }

  if (typeof rendererName != 'string') {
    throw Error('Only strings and functions can be passed as "renderer" parameter');
  }

  if (!(rendererName in registeredRenderers)) {
    throw Error('No editor registered under name "' + rendererName + '"');
  }

  return registeredRenderers[rendererName];
}

/**
 * @param rendererName
 * @returns {Boolean}
 */
function hasRenderer(rendererName) {
  return rendererName in registeredRenderers;
}

exports.registerRenderer = registerRenderer;
exports.getRenderer = getRenderer;
exports.hasRenderer = hasRenderer;

},{"./helpers/string":57}],63:[function(require,module,exports){
/**
 * Adds appropriate CSS class to table cell, based on cellProperties
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../helpers/dom/element');

var _renderers = require('./../renderers');

exports.cellDecorator = cellDecorator;

(0, _renderers.registerRenderer)('base', cellDecorator);

// support for older versions of Handsontable
Handsontable.renderers.cellDecorator = cellDecorator;

function cellDecorator(instance, TD, row, col, prop, value, cellProperties) {
  if (cellProperties.className) {
    if (TD.className) {
      TD.className = TD.className + " " + cellProperties.className;
    } else {
      TD.className = cellProperties.className;
    }
  }

  if (cellProperties.readOnly) {
    (0, _helpersDomElement.addClass)(TD, cellProperties.readOnlyCellClassName);
  }

  if (cellProperties.valid === false && cellProperties.invalidCellClassName) {
    (0, _helpersDomElement.addClass)(TD, cellProperties.invalidCellClassName);
  } else {
    (0, _helpersDomElement.removeClass)(TD, cellProperties.invalidCellClassName);
  }

  if (cellProperties.wordWrap === false && cellProperties.noWordWrapClassName) {
    (0, _helpersDomElement.addClass)(TD, cellProperties.noWordWrapClassName);
  }

  if (!value && cellProperties.placeholder) {
    (0, _helpersDomElement.addClass)(TD, cellProperties.placeholderCellClassName);
  }
}

},{"./../helpers/dom/element":50,"./../renderers":62}],64:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../helpers/dom/element');

var _eventManager = require('./../eventManager');

var _renderers = require('./../renderers');

var _rdpartyWalkontableSrcCellCoords = require('./../3rdparty/walkontable/src/cell/coords');

var clonableWRAPPER = document.createElement('DIV');
clonableWRAPPER.className = 'htAutocompleteWrapper';

var clonableARROW = document.createElement('DIV');
clonableARROW.className = 'htAutocompleteArrow';
// workaround for https://github.com/handsontable/handsontable/issues/1946
// this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
clonableARROW.appendChild(document.createTextNode(String.fromCharCode(9660)));

var wrapTdContentWithWrapper = function wrapTdContentWithWrapper(TD, WRAPPER) {
  WRAPPER.innerHTML = TD.innerHTML;
  dom.empty(TD);
  TD.appendChild(WRAPPER);
};

/**
 * Autocomplete renderer
 *
 * @private
 * @renderer AutocompleteRenderer
 * @param {Object} instance Handsontable instance
 * @param {Element} TD Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
function autocompleteRenderer(instance, TD, row, col, prop, value, cellProperties) {

  var WRAPPER = clonableWRAPPER.cloneNode(true); //this is faster than createElement
  var ARROW = clonableARROW.cloneNode(true); //this is faster than createElement

  (0, _renderers.getRenderer)('text')(instance, TD, row, col, prop, value, cellProperties);

  TD.appendChild(ARROW);
  (0, _helpersDomElement.addClass)(TD, 'htAutocomplete');

  if (!TD.firstChild) {
    //http://jsperf.com/empty-node-if-needed
    //otherwise empty fields appear borderless in demo/renderers.html (IE)
    TD.appendChild(document.createTextNode(String.fromCharCode(160))); // workaround for https://github.com/handsontable/handsontable/issues/1946
    //this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
  }

  if (!instance.acArrowListener) {
    var eventManager = (0, _eventManager.eventManager)(instance);

    //not very elegant but easy and fast
    instance.acArrowListener = function (event) {
      if ((0, _helpersDomElement.hasClass)(event.target, 'htAutocompleteArrow')) {
        instance.view.wt.getSetting('onCellDblClick', null, new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(row, col), TD);
      }
    };

    eventManager.addEventListener(instance.rootElement, 'mousedown', instance.acArrowListener);

    //We need to unbind the listener after the table has been destroyed
    instance.addHookOnce('afterDestroy', function () {
      eventManager.destroy();
    });
  }
}

exports.autocompleteRenderer = autocompleteRenderer;

(0, _renderers.registerRenderer)('autocomplete', autocompleteRenderer);

},{"./../3rdparty/walkontable/src/cell/coords":11,"./../eventManager":46,"./../helpers/dom/element":50,"./../renderers":62}],65:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../helpers/dom/element');

var _helpersString = require('./../helpers/string');

var _eventManager = require('./../eventManager');

var _renderers = require('./../renderers');

var _helpersUnicode = require('./../helpers/unicode');

var _helpersDomEvent = require('./../helpers/dom/event');

var isListeningKeyDownEvent = new WeakMap();
var BAD_VALUE_CLASS = 'htBadValue';

/**
 * Checkbox renderer
 *
 * @private
 * @renderer CheckboxRenderer
 * @param {Object} instance Handsontable instance
 * @param {Element} TD Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properties (shared by cell renderer and editor)
 */
function checkboxRenderer(instance, TD, row, col, prop, value, cellProperties) {
  var eventManager = new _eventManager.EventManager(instance);
  var input = createInput();

  if (typeof cellProperties.checkedTemplate === 'undefined') {
    cellProperties.checkedTemplate = true;
  }
  if (typeof cellProperties.uncheckedTemplate === 'undefined') {
    cellProperties.uncheckedTemplate = false;
  }
  (0, _helpersDomElement.empty)(TD); // TODO identify under what circumstances this line can be removed

  if (value === cellProperties.checkedTemplate || (0, _helpersString.equalsIgnoreCase)(value, cellProperties.checkedTemplate)) {
    input.checked = true;
    TD.appendChild(input);
  } else if (value === cellProperties.uncheckedTemplate || (0, _helpersString.equalsIgnoreCase)(value, cellProperties.uncheckedTemplate)) {
    TD.appendChild(input);
  } else if (value === null) {
    // default value
    (0, _helpersDomElement.addClass)(input, 'noValue');
    TD.appendChild(input);
  } else {
    input.style.display = 'none';
    (0, _helpersDomElement.addClass)(input, BAD_VALUE_CLASS);
    TD.appendChild(input);
    TD.appendChild(document.createTextNode('#bad-value#'));
  }

  if (cellProperties.readOnly) {
    eventManager.addEventListener(input, 'click', preventDefault);
  } else {
    eventManager.addEventListener(input, 'mousedown', _helpersDomEvent.stopPropagation);
    eventManager.addEventListener(input, 'mouseup', _helpersDomEvent.stopPropagation);
    eventManager.addEventListener(input, 'change', function (event) {
      instance.setDataAtRowProp(row, prop, event.target.checked ? cellProperties.checkedTemplate : cellProperties.uncheckedTemplate);
    });
  }

  if (!isListeningKeyDownEvent.has(instance)) {
    isListeningKeyDownEvent.set(instance, true);
    instance.addHook('beforeKeyDown', onBeforeKeyDown);
  }

  /**
   * On before key down DOM listener.
   *
   * @private
   * @param {Event} event
   */
  function onBeforeKeyDown(event) {
    var allowedKeys = [_helpersUnicode.KEY_CODES.SPACE, _helpersUnicode.KEY_CODES.ENTER, _helpersUnicode.KEY_CODES.DELETE, _helpersUnicode.KEY_CODES.BACKSPACE];

    if (allowedKeys.indexOf(event.keyCode) !== -1 && !(0, _helpersDomEvent.isImmediatePropagationStopped)(event)) {
      eachSelectedCheckboxCell(function () {
        (0, _helpersDomEvent.stopImmediatePropagation)(event);
        event.preventDefault();
      });
    }
    if (event.keyCode == _helpersUnicode.KEY_CODES.SPACE || event.keyCode == _helpersUnicode.KEY_CODES.ENTER) {
      toggleSelected();
    }
    if (event.keyCode == _helpersUnicode.KEY_CODES.DELETE || event.keyCode == _helpersUnicode.KEY_CODES.BACKSPACE) {
      toggleSelected(false);
    }
  }

  /**
   * Toggle checkbox checked property
   *
   * @private
   * @param {Boolean} [checked=null]
   */
  function toggleSelected() {
    var checked = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    eachSelectedCheckboxCell(function (checkboxes) {
      for (var i = 0, len = checkboxes.length; i < len; i++) {
        // Block changing checked property on toggle keys (SPACE and ENTER)
        if ((0, _helpersDomElement.hasClass)(checkboxes[i], BAD_VALUE_CLASS) && checked === null) {
          return;
        }
        toggleCheckbox(checkboxes[i], checked);
      }
    });
  }

  /**
   * Toggle checkbox element.
   *
   * @private
   * @param {HTMLInputElement} checkbox
   * @param {Boolean} [checked=null]
   */
  function toggleCheckbox(checkbox) {
    var checked = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (checked === null) {
      checkbox.checked = !checkbox.checked;
    } else {
      checkbox.checked = checked;
    }
    eventManager.fireEvent(checkbox, 'change');
  }

  /**
   * Call callback for each found selected cell with checkbox type.
   *
   * @private
   * @param {Function} callback
   */
  function eachSelectedCheckboxCell(callback) {
    var selRange = instance.getSelectedRange();
    var topLeft = selRange.getTopLeftCorner();
    var bottomRight = selRange.getBottomRightCorner();

    for (var _row = topLeft.row; _row <= bottomRight.row; _row++) {
      for (var _col = topLeft.col; _col <= bottomRight.col; _col++) {
        var cell = instance.getCell(_row, _col);
        var _cellProperties = instance.getCellMeta(_row, _col);
        var checkboxes = cell.querySelectorAll('input[type=checkbox]');

        if (checkboxes.length > 0 && !_cellProperties.readOnly) {
          callback(checkboxes);
        }
      }
    }
  }
}

exports.checkboxRenderer = checkboxRenderer;

(0, _renderers.registerRenderer)('checkbox', checkboxRenderer);

/**
 * Create input element.
 *
 * @returns {Node}
 */
function createInput() {
  var input = document.createElement('INPUT');

  input.className = 'htCheckboxRendererInput';
  input.type = 'checkbox';
  input.setAttribute('autocomplete', 'off');

  return input.cloneNode(false);
}

function preventDefault(event) {
  event.preventDefault();
}

},{"./../eventManager":46,"./../helpers/dom/element":50,"./../helpers/dom/event":51,"./../helpers/string":57,"./../helpers/unicode":58,"./../renderers":62}],66:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../helpers/dom/element');

var _renderers = require('./../renderers');

/**
 * @private
 * @renderer HtmlRenderer
 * @param instance
 * @param TD
 * @param row
 * @param col
 * @param prop
 * @param value
 * @param cellProperties
 */
function htmlRenderer(instance, TD, row, col, prop, value, cellProperties) {
  (0, _renderers.getRenderer)('base').apply(this, arguments);
  (0, _helpersDomElement.fastInnerHTML)(TD, value);
}

exports.htmlRenderer = htmlRenderer;

(0, _renderers.registerRenderer)('html', htmlRenderer);

},{"./../helpers/dom/element":50,"./../renderers":62}],67:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

var _helpersDomElement = require('./../helpers/dom/element');

var _renderers = require('./../renderers');

var _helpersNumber = require('./../helpers/number');

/**
 * Numeric cell renderer
 *
 * @private
 * @renderer NumericRenderer
 * @dependencies numeral
 * @param {Object} instance Handsontable instance
 * @param {Element} TD Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properties (shared by cell renderer and editor)
 */
function numericRenderer(instance, TD, row, col, prop, value, cellProperties) {
  if ((0, _helpersNumber.isNumeric)(value)) {
    if (typeof cellProperties.language !== 'undefined') {
      _numeral2['default'].language(cellProperties.language);
    }
    value = (0, _numeral2['default'])(value).format(cellProperties.format || '0'); //docs: http://numeraljs.com/
    (0, _helpersDomElement.addClass)(TD, 'htNumeric');
  }
  (0, _renderers.getRenderer)('text')(instance, TD, row, col, prop, value, cellProperties);
}

exports.numericRenderer = numericRenderer;

(0, _renderers.registerRenderer)('numeric', numericRenderer);

},{"./../helpers/dom/element":50,"./../helpers/number":54,"./../renderers":62,"numeral":5}],68:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../helpers/dom/element');

var _renderers = require('./../renderers');

/**
 * @private
 * @renderer PasswordRenderer
 * @param instance
 * @param TD
 * @param row
 * @param col
 * @param prop
 * @param value
 * @param cellProperties
 */
function passwordRenderer(instance, TD, row, col, prop, value, cellProperties) {
  (0, _renderers.getRenderer)('text').apply(this, arguments);

  value = TD.innerHTML;

  var hash;
  var hashLength = cellProperties.hashLength || value.length;
  var hashSymbol = cellProperties.hashSymbol || '*';

  for (hash = ''; hash.split(hashSymbol).length - 1 < hashLength; hash += hashSymbol) {}

  (0, _helpersDomElement.fastInnerHTML)(TD, hash);
}

exports.passwordRenderer = passwordRenderer;

(0, _renderers.registerRenderer)('password', passwordRenderer);

},{"./../helpers/dom/element":50,"./../renderers":62}],69:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./../helpers/dom/element');

var _helpersMixed = require('./../helpers/mixed');

var _renderers = require('./../renderers');

/**
 * Default text renderer
 *
 * @private
 * @renderer TextRenderer
 * @param {Object} instance Handsontable instance
 * @param {Element} TD Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properties (shared by cell renderer and editor)
 */
function textRenderer(instance, TD, row, col, prop, value, cellProperties) {
  (0, _renderers.getRenderer)('base').apply(this, arguments);

  if (!value && cellProperties.placeholder) {
    value = cellProperties.placeholder;
  }

  var escaped = (0, _helpersMixed.stringify)(value);

  if (!instance.getSettings().trimWhitespace) {
    escaped = escaped.replace(/ /g, String.fromCharCode(160));
  }

  if (cellProperties.rendererTemplate) {
    (0, _helpersDomElement.empty)(TD);
    var TEMPLATE = document.createElement('TEMPLATE');
    TEMPLATE.setAttribute('bind', '{{}}');
    TEMPLATE.innerHTML = cellProperties.rendererTemplate;
    HTMLTemplateElement.decorate(TEMPLATE);
    TEMPLATE.model = instance.getSourceDataAtRow(row);
    TD.appendChild(TEMPLATE);
  } else {
    // this is faster than innerHTML. See: https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
    (0, _helpersDomElement.fastInnerText)(TD, escaped);
  }
}

exports.textRenderer = textRenderer;

(0, _renderers.registerRenderer)('text', textRenderer);

},{"./../helpers/dom/element":50,"./../helpers/mixed":53,"./../renderers":62}],70:[function(require,module,exports){
/* jshint ignore:start */
'use strict';

(function (global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isShimSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isShimSymbol(v)) return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol)) return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function () {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols')) return symbolValue[symbolInternalProperty];
    if (!symbolValue) throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined) desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function () {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue) throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols')) return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, { value: this });
    $defineProperty(this, symbolInternalProperty, { value: key });
    $defineProperty(this, symbolDescriptionProperty, { value: description });
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = { value: undefined };
  var hashObjectProperties = {
    hash: { value: undefined },
    self: { value: undefined }
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object) return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  freeze(SymbolValue.prototype);
  function isSymbolString(s) {
    return symbolValues[s] || privateNames[s];
  }
  function toProperty(name) {
    if (isShimSymbol(name)) return name[symbolInternalProperty];
    return name;
  }
  function removeSymbolKeys(array) {
    var rv = [];
    for (var i = 0; i < array.length; i++) {
      if (!isSymbolString(array[i])) {
        rv.push(array[i]);
      }
    }
    return rv;
  }
  function getOwnPropertyNames(object) {
    return removeSymbolKeys($getOwnPropertyNames(object));
  }
  function keys(object) {
    return removeSymbolKeys($keys(object));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) {
        rv.push(symbol);
      }
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function defineProperty(object, name, descriptor) {
    if (isShimSymbol(name)) {
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', { value: defineProperty });
    $defineProperty(Object, 'getOwnPropertyNames', { value: getOwnPropertyNames });
    $defineProperty(Object, 'getOwnPropertyDescriptor', { value: getOwnPropertyDescriptor });
    $defineProperty(Object.prototype, 'hasOwnProperty', { value: hasOwnProperty });
    $defineProperty(Object, 'freeze', { value: freeze });
    $defineProperty(Object, 'preventExtensions', { value: preventExtensions });
    $defineProperty(Object, 'seal', { value: seal });
    $defineProperty(Object, 'keys', { value: keys });
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (isSymbolString(name)) continue;
        (function (mod, name) {
          $defineProperty(object, name, {
            get: function get() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null) throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function polyfillSymbol(global, Symbol) {
    if (!global.Symbol) {
      global.Symbol = Symbol;
      Object.getOwnPropertySymbols = getOwnPropertySymbols;
    }
    if (!global.Symbol.iterator) {
      global.Symbol.iterator = Symbol('Symbol.iterator');
    }
  }
  function setupGlobals(global) {
    polyfillSymbol(global, Symbol);
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    checkObjectCoercible: checkObjectCoercible,
    createPrivateName: createPrivateName,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    isObject: isObject,
    isPrivateName: isPrivateName,
    isSymbolString: isSymbolString,
    keys: $keys,
    setupGlobals: setupGlobals,
    toObject: toObject,
    toProperty: toProperty,
    'typeof': typeOf
  };
})(window);
(function () {
  'use strict';
  var $toProperty = $traceurRuntime.toProperty;

  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function () {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $toProperty = $traceurRuntime.toProperty;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result) return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superConstructor(ctor) {
    return ctor.__proto__;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get) return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {};
    var names = getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    var symbols = getOwnPropertySymbols(object);
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      descriptors[$toProperty(symbol)] = $getOwnPropertyDescriptor(object, $toProperty(symbol));
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function') ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null) return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null) return null;
    throw new $TypeError("Super expression must either be null or a function, not " + typeof superClass + ".");
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null) superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superConstructor = superConstructor;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
/* jshint ignore:end */

},{}],71:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _helpersDomElement = require('./helpers/dom/element');

var _eventManager = require('./eventManager');

var _helpersDomEvent = require('./helpers/dom/event');

var _rdpartyWalkontableSrcCellCoords = require('./3rdparty/walkontable/src/cell/coords');

var _rdpartyWalkontableSrcSelection = require('./3rdparty/walkontable/src/selection');

var _rdpartyWalkontableSrcCore = require('./3rdparty/walkontable/src/core');

// Support for older Handsontable versions
Handsontable.TableView = TableView;

/**
 * Handsontable TableView constructor
 * @param {Object} instance
 */
function TableView(instance) {
  var that = this;

  this.eventManager = (0, _eventManager.eventManager)(instance);
  this.instance = instance;
  this.settings = instance.getSettings();

  var originalStyle = instance.rootElement.getAttribute('style');

  if (originalStyle) {
    instance.rootElement.setAttribute('data-originalstyle', originalStyle); //needed to retrieve original style in jsFiddle link generator in HT examples. may be removed in future versions
  }

  (0, _helpersDomElement.addClass)(instance.rootElement, 'handsontable');
  //  instance.rootElement.addClass('handsontable');

  var table = document.createElement('TABLE');
  (0, _helpersDomElement.addClass)(table, 'htCore');

  if (instance.getSettings().tableClassName) {
    (0, _helpersDomElement.addClass)(table, instance.getSettings().tableClassName);
  }
  this.THEAD = document.createElement('THEAD');
  table.appendChild(this.THEAD);
  this.TBODY = document.createElement('TBODY');
  table.appendChild(this.TBODY);

  instance.table = table;

  instance.container.insertBefore(table, instance.container.firstChild);

  this.eventManager.addEventListener(instance.rootElement, 'mousedown', function (event) {
    if (!that.isTextSelectionAllowed(event.target)) {
      clearTextSelection();
      event.preventDefault();
      window.focus(); //make sure that window that contains HOT is active. Important when HOT is in iframe.
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'keyup', function (event) {
    if (instance.selection.isInProgress() && !event.shiftKey) {
      instance.selection.finish();
    }
  });

  var isMouseDown;
  this.isMouseDown = function () {
    return isMouseDown;
  };

  this.eventManager.addEventListener(document.documentElement, 'mouseup', function (event) {
    if (instance.selection.isInProgress() && event.which === 1) {
      //is left mouse button
      instance.selection.finish();
    }

    isMouseDown = false;

    if ((0, _helpersDomElement.isOutsideInput)(document.activeElement)) {
      instance.unlisten();
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'mousedown', function (event) {
    var next = event.target;
    var eventX = event.x || event.clientX;
    var eventY = event.y || event.clientY;

    if (isMouseDown || !instance.rootElement) {
      return; // it must have been started in a cell
    }

    // immediate click on "holder" means click on the right side of vertical scrollbar
    if (next !== instance.view.wt.wtTable.holder) {
      while (next !== document.documentElement) {
        if (next === null) {
          if (event.isTargetWebComponent) {
            break;
          }
          // click on something that was a row but now is detached (possibly because your click triggered a rerender)
          return;
        }
        if (next === instance.rootElement) {
          // click inside container
          return;
        }
        next = next.parentNode;
      }
    } else {
      var scrollbarWidth = (0, _helpersDomElement.getScrollbarWidth)();

      if (document.elementFromPoint(eventX + scrollbarWidth, eventY) !== instance.view.wt.wtTable.holder || document.elementFromPoint(eventX, eventY + scrollbarWidth) !== instance.view.wt.wtTable.holder) {
        return;
      }
    }

    // function did not return until here, we have an outside click!
    if (that.settings.outsideClickDeselects) {
      instance.deselectCell();
    } else {
      instance.destroyEditor();
    }
  });

  this.eventManager.addEventListener(table, 'selectstart', function (event) {
    if (that.settings.fragmentSelection) {
      return;
    }

    //https://github.com/handsontable/handsontable/issues/160
    //selectstart is IE only event. Prevent text from being selected when performing drag down in IE8
    event.preventDefault();
  });

  var clearTextSelection = function clearTextSelection() {
    //http://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
    if (window.getSelection) {
      if (window.getSelection().empty) {
        // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {
      // IE?
      document.selection.empty();
    }
  };

  var selections = [new _rdpartyWalkontableSrcSelection.WalkontableSelection({
    className: 'current',
    border: {
      width: 2,
      color: '#5292F7',
      //style: 'solid', //not used
      cornerVisible: function cornerVisible() {
        return that.settings.fillHandle && !that.isCellEdited() && !instance.selection.isMultiple();
      },
      multipleSelectionHandlesVisible: function multipleSelectionHandlesVisible() {
        return !that.isCellEdited() && !instance.selection.isMultiple();
      }
    }
  }), new _rdpartyWalkontableSrcSelection.WalkontableSelection({
    className: 'area',
    border: {
      width: 1,
      color: '#89AFF9',
      //style: 'solid', // not used
      cornerVisible: function cornerVisible() {
        return that.settings.fillHandle && !that.isCellEdited() && instance.selection.isMultiple();
      },
      multipleSelectionHandlesVisible: function multipleSelectionHandlesVisible() {
        return !that.isCellEdited() && instance.selection.isMultiple();
      }
    }
  }), new _rdpartyWalkontableSrcSelection.WalkontableSelection({
    className: 'highlight',
    highlightRowClassName: that.settings.currentRowClassName,
    highlightColumnClassName: that.settings.currentColClassName
  }), new _rdpartyWalkontableSrcSelection.WalkontableSelection({
    className: 'fill',
    border: {
      width: 1,
      color: 'red'
      //style: 'solid' // not used
    }
  })];
  selections.current = selections[0];
  selections.area = selections[1];
  selections.highlight = selections[2];
  selections.fill = selections[3];

  var walkontableConfig = {
    debug: function debug() {
      return that.settings.debug;
    },
    externalRowCalculator: this.instance.getPlugin('autoRowSize') && this.instance.getPlugin('autoRowSize').isEnabled(),
    table: table,
    stretchH: this.settings.stretchH,
    data: instance.getDataAtCell,
    totalRows: instance.countRows,
    totalColumns: instance.countCols,
    fixedColumnsLeft: function fixedColumnsLeft() {
      return that.settings.fixedColumnsLeft;
    },
    fixedRowsTop: function fixedRowsTop() {
      return that.settings.fixedRowsTop;
    },
    renderAllRows: that.settings.renderAllRows,
    rowHeaders: function rowHeaders() {
      var arr = [];
      if (instance.hasRowHeaders()) {
        arr.push(function (index, TH) {
          that.appendRowHeader(index, TH);
        });
      }
      Handsontable.hooks.run(instance, 'afterGetRowHeaderRenderers', arr);
      return arr;
    },
    columnHeaders: function columnHeaders() {

      var arr = [];
      if (instance.hasColHeaders()) {
        arr.push(function (index, TH) {
          that.appendColHeader(index, TH);
        });
      }
      Handsontable.hooks.run(instance, 'afterGetColumnHeaderRenderers', arr);
      return arr;
    },
    columnWidth: instance.getColWidth,
    rowHeight: instance.getRowHeight,
    cellRenderer: function cellRenderer(row, col, TD) {

      var prop = that.instance.colToProp(col),
          cellProperties = that.instance.getCellMeta(row, col),
          renderer = that.instance.getCellRenderer(cellProperties);

      var value = that.instance.getDataAtRowProp(row, prop);

      renderer(that.instance, TD, row, col, prop, value, cellProperties);
      Handsontable.hooks.run(that.instance, 'afterRenderer', TD, row, col, prop, value, cellProperties);
    },
    selections: selections,
    hideBorderOnMouseDownOver: function hideBorderOnMouseDownOver() {
      return that.settings.fragmentSelection;
    },
    onCellMouseDown: function onCellMouseDown(event, coords, TD, wt) {
      instance.listen();
      that.activeWt = wt;

      isMouseDown = true;

      Handsontable.hooks.run(instance, 'beforeOnCellMouseDown', event, coords, TD);

      if (!(0, _helpersDomEvent.isImmediatePropagationStopped)(event)) {
        if (event.button === 2 && instance.selection.inInSelection(coords)) {//right mouse button
          //do nothing
        } else if (event.shiftKey) {
            if (coords.row >= 0 && coords.col >= 0) {
              instance.selection.setRangeEnd(coords);
            }
          } else {
            if ((coords.row < 0 || coords.col < 0) && (coords.row >= 0 || coords.col >= 0)) {
              if (coords.row < 0) {
                instance.selectCell(0, coords.col, instance.countRows() - 1, coords.col);
                instance.selection.setSelectedHeaders(false, true);
              }
              if (coords.col < 0) {
                instance.selectCell(coords.row, 0, coords.row, instance.countCols() - 1);
                instance.selection.setSelectedHeaders(true, false);
              }
            } else {
              coords.row = coords.row < 0 ? 0 : coords.row;
              coords.col = coords.col < 0 ? 0 : coords.col;

              instance.selection.setRangeStart(coords);

              instance.selection.setSelectedHeaders(false, false);
            }
          }

        Handsontable.hooks.run(instance, 'afterOnCellMouseDown', event, coords, TD);

        that.activeWt = that.wt;
      }
    },
    /*onCellMouseOut: function (/*event, coords, TD* /) {
     if (isMouseDown && that.settings.fragmentSelection === 'single') {
     clearTextSelection(); //otherwise text selection blinks during multiple cells selection
     }
     },*/
    onCellMouseOver: function onCellMouseOver(event, coords, TD, wt) {
      that.activeWt = wt;
      if (coords.row >= 0 && coords.col >= 0) {
        //is not a header
        if (isMouseDown) {
          /*if (that.settings.fragmentSelection === 'single') {
           clearTextSelection(); //otherwise text selection blinks during multiple cells selection
           }*/
          instance.selection.setRangeEnd(coords);
        }
      } else {
        if (isMouseDown) {
          // multi select columns
          if (coords.row < 0) {
            if (instance.selection.selectedHeader.cols) {
              instance.selection.setRangeEnd(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(instance.countRows() - 1, coords.col));
              instance.selection.setSelectedHeaders(false, true);
            } else {
              instance.selection.setRangeEnd(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(coords.row, coords.col));
            }
          }

          // multi select rows
          if (coords.col < 0) {
            if (instance.selection.selectedHeader.rows) {
              instance.selection.setRangeEnd(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(coords.row, instance.countCols() - 1));
              instance.selection.setSelectedHeaders(true, false);
            } else {
              instance.selection.setRangeEnd(new _rdpartyWalkontableSrcCellCoords.WalkontableCellCoords(coords.row, coords.col));
            }
          }
        }
      }

      Handsontable.hooks.run(instance, 'afterOnCellMouseOver', event, coords, TD);
      that.activeWt = that.wt;
    },
    onCellCornerMouseDown: function onCellCornerMouseDown(event) {
      event.preventDefault();
      Handsontable.hooks.run(instance, 'afterOnCellCornerMouseDown', event);
    },
    beforeDraw: function beforeDraw(force) {
      that.beforeRender(force);
    },
    onDraw: function onDraw(force) {
      that.onDraw(force);
    },
    onScrollVertically: function onScrollVertically() {
      instance.runHooks('afterScrollVertically');
    },
    onScrollHorizontally: function onScrollHorizontally() {
      instance.runHooks('afterScrollHorizontally');
    },
    onBeforeDrawBorders: function onBeforeDrawBorders(corners, borderClassName) {
      instance.runHooks('beforeDrawBorders', corners, borderClassName);
    },
    onBeforeTouchScroll: function onBeforeTouchScroll() {
      instance.runHooks('beforeTouchScroll');
    },
    onAfterMomentumScroll: function onAfterMomentumScroll() {
      instance.runHooks('afterMomentumScroll');
    },
    viewportRowCalculatorOverride: function viewportRowCalculatorOverride(calc) {
      var rows = instance.countRows();
      var viewportOffset = that.settings.viewportRowRenderingOffset;

      if (viewportOffset === 'auto' && that.settings.fixedRowsTop) {
        viewportOffset = 10;
      }
      if (typeof viewportOffset === 'number') {
        calc.startRow = Math.max(calc.startRow - viewportOffset, 0);
        calc.endRow = Math.min(calc.endRow + viewportOffset, rows - 1);
      }
      if (viewportOffset === 'auto') {
        var center = calc.startRow + calc.endRow - calc.startRow;
        var offset = Math.ceil(center / rows * 12);

        calc.startRow = Math.max(calc.startRow - offset, 0);
        calc.endRow = Math.min(calc.endRow + offset, rows - 1);
      }
      instance.runHooks('afterViewportRowCalculatorOverride', calc);
    },
    viewportColumnCalculatorOverride: function viewportColumnCalculatorOverride(calc) {
      var cols = instance.countCols();
      var viewportOffset = that.settings.viewportColumnRenderingOffset;

      if (viewportOffset === 'auto' && that.settings.fixedColumnsLeft) {
        viewportOffset = 10;
      }
      if (typeof viewportOffset === 'number') {
        calc.startColumn = Math.max(calc.startColumn - viewportOffset, 0);
        calc.endColumn = Math.min(calc.endColumn + viewportOffset, cols - 1);
      }
      if (viewportOffset === 'auto') {
        var center = calc.startColumn + calc.endColumn - calc.startColumn;
        var offset = Math.ceil(center / cols * 12);

        calc.startRow = Math.max(calc.startColumn - offset, 0);
        calc.endColumn = Math.min(calc.endColumn + offset, cols - 1);
      }
      instance.runHooks('afterViewportColumnCalculatorOverride', calc);
    }
  };

  Handsontable.hooks.run(instance, 'beforeInitWalkontable', walkontableConfig);

  this.wt = new _rdpartyWalkontableSrcCore.Walkontable(walkontableConfig);
  this.activeWt = this.wt;

  this.eventManager.addEventListener(that.wt.wtTable.spreader, 'mousedown', function (event) {
    //right mouse button exactly on spreader means right click on the right hand side of vertical scrollbar
    if (event.target === that.wt.wtTable.spreader && event.which === 3) {
      (0, _helpersDomEvent.stopPropagation)(event);
      //event.stopPropagation();
    }
  });

  this.eventManager.addEventListener(that.wt.wtTable.spreader, 'contextmenu', function (event) {
    //right mouse button exactly on spreader means right click on the right hand side of vertical scrollbar
    if (event.target === that.wt.wtTable.spreader && event.which === 3) {
      (0, _helpersDomEvent.stopPropagation)(event);
      //event.stopPropagation();
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'click', function () {
    if (that.settings.observeDOMVisibility) {
      if (that.wt.drawInterrupted) {
        that.instance.forceFullRender = true;
        that.render();
      }
    }
  });
}

TableView.prototype.isTextSelectionAllowed = function (el) {
  if ((0, _helpersDomElement.isInput)(el)) {
    return true;
  }
  if (this.settings.fragmentSelection && (0, _helpersDomElement.isChildOf)(el, this.TBODY)) {
    return true;
  }

  return false;
};

TableView.prototype.isCellEdited = function () {
  var activeEditor = this.instance.getActiveEditor();

  return activeEditor && activeEditor.isOpened();
};

TableView.prototype.beforeRender = function (force) {
  if (force) {
    //this.instance.forceFullRender = did Handsontable request full render?
    Handsontable.hooks.run(this.instance, 'beforeRender', this.instance.forceFullRender);
  }
};

TableView.prototype.onDraw = function (force) {
  if (force) {
    //this.instance.forceFullRender = did Handsontable request full render?
    Handsontable.hooks.run(this.instance, 'afterRender', this.instance.forceFullRender);
  }
};

TableView.prototype.render = function () {
  this.wt.draw(!this.instance.forceFullRender);
  this.instance.forceFullRender = false;
  this.instance.renderCall = false;
};

/**
 * Returns td object given coordinates
 * @param {WalkontableCellCoords} coords
 * @param {Boolean} topmost
 */
TableView.prototype.getCellAtCoords = function (coords, topmost) {
  var td = this.wt.getCell(coords, topmost);
  //var td = this.wt.wtTable.getCell(coords);
  if (td < 0) {
    //there was an exit code (cell is out of bounds)
    return null;
  } else {
    return td;
  }
};

/**
 * Scroll viewport to selection
 * @param {WalkontableCellCoords} coords
 */
TableView.prototype.scrollViewport = function (coords) {
  this.wt.scrollViewport(coords);
};

/**
 * Append row header to a TH element
 * @param row
 * @param TH
 */
TableView.prototype.appendRowHeader = function (row, TH) {
  if (TH.firstChild) {
    var container = TH.firstChild;

    if (!(0, _helpersDomElement.hasClass)(container, 'relative')) {
      (0, _helpersDomElement.empty)(TH);
      this.appendRowHeader(row, TH);

      return;
    }
    this.updateCellHeader(container.querySelector('.rowHeader'), row, this.instance.getRowHeader);
  } else {
    var div = document.createElement('div');
    var span = document.createElement('span');

    div.className = 'relative';
    span.className = 'rowHeader';
    this.updateCellHeader(span, row, this.instance.getRowHeader);

    div.appendChild(span);
    TH.appendChild(div);
  }
  Handsontable.hooks.run(this.instance, 'afterGetRowHeader', row, TH);
};

/**
 * Append column header to a TH element
 * @param col
 * @param TH
 */
TableView.prototype.appendColHeader = function (col, TH) {
  if (TH.firstChild) {
    var container = TH.firstChild;

    if (!(0, _helpersDomElement.hasClass)(container, 'relative')) {
      (0, _helpersDomElement.empty)(TH);
      this.appendRowHeader(col, TH);

      return;
    }
    this.updateCellHeader(container.querySelector('.colHeader'), col, this.instance.getColHeader);
  } else {
    var div = document.createElement('div');
    var span = document.createElement('span');

    div.className = 'relative';
    span.className = 'colHeader';
    this.updateCellHeader(span, col, this.instance.getColHeader);

    div.appendChild(span);
    TH.appendChild(div);
  }
  Handsontable.hooks.run(this.instance, 'afterGetColHeader', col, TH);
};

/**
 * Update header cell content
 *
 * @since 0.15.0-beta4
 * @param {HTMLElement} element Element to update
 * @param {Number} index Row index or column index
 * @param {Function} content Function which should be returns content for this cell
 */
TableView.prototype.updateCellHeader = function (element, index, content) {
  if (index > -1) {
    (0, _helpersDomElement.fastInnerHTML)(element, content(index));
  } else {
    // workaround for https://github.com/handsontable/handsontable/issues/1946
    (0, _helpersDomElement.fastInnerText)(element, String.fromCharCode(160));
    (0, _helpersDomElement.addClass)(element, 'cornerHeader');
  }
};

/**
 * Given a element's left position relative to the viewport, returns maximum element width until the right
 * edge of the viewport (before scrollbar)
 *
 * @param {Number} leftOffset
 * @return {Number}
 */
TableView.prototype.maximumVisibleElementWidth = function (leftOffset) {
  var workspaceWidth = this.wt.wtViewport.getWorkspaceWidth();
  var maxWidth = workspaceWidth - leftOffset;
  return maxWidth > 0 ? maxWidth : 0;
};

/**
 * Given a element's top position relative to the viewport, returns maximum element height until the bottom
 * edge of the viewport (before scrollbar)
 *
 * @param {Number} topOffset
 * @return {Number}
 */
TableView.prototype.maximumVisibleElementHeight = function (topOffset) {
  var workspaceHeight = this.wt.wtViewport.getWorkspaceHeight();
  var maxHeight = workspaceHeight - topOffset;
  return maxHeight > 0 ? maxHeight : 0;
};

TableView.prototype.mainViewIsActive = function () {
  return this.wt === this.activeWt;
};

TableView.prototype.destroy = function () {
  this.wt.destroy();
  this.eventManager.destroy();
};

exports.TableView = TableView;

},{"./3rdparty/walkontable/src/cell/coords":11,"./3rdparty/walkontable/src/core":13,"./3rdparty/walkontable/src/selection":24,"./eventManager":46,"./helpers/dom/element":50,"./helpers/dom/event":51}],72:[function(require,module,exports){
'use strict';

var _helpersMixed = require('./../helpers/mixed');

/**
 * Autocomplete cell validator.
 *
 * @private
 * @validator AutocompleteValidator
 * @param {*} value - Value of edited cell
 * @param {Function} callback - Callback called with validation result
 */
Handsontable.AutocompleteValidator = function (value, callback) {
  if (this.strict && this.source) {
    if (typeof this.source === 'function') {
      this.source(value, process(value, callback));
    } else {
      process(value, callback)(this.source);
    }
  } else {
    callback(true);
  }
};

/**
 * Function responsible for validation of autocomplete value.
 *
 * @param {*} value - Value of edited cell
 * @param {Function} callback - Callback called with validation result
 */
function process(value, callback) {
  var originalVal = value;
  var lowercaseVal = typeof originalVal === 'string' ? originalVal.toLowerCase() : null;

  return function (source) {
    var found = false;
    for (var s = 0, slen = source.length; s < slen; s++) {
      if (originalVal === source[s]) {
        found = true; //perfect match
        break;
      } else if (lowercaseVal === (0, _helpersMixed.stringify)(source[s]).toLowerCase()) {
        // changes[i][3] = source[s]; //good match, fix the case << TODO?
        found = true;
        break;
      }
    }

    callback(found);
  };
}

},{"./../helpers/mixed":53}],73:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _editors = require('./../editors');

/**
 * Date cell validator
 *
 * @private
 * @validator DateValidator
 * @dependencies moment
 * @param {*} value - Value of edited cell
 * @param {Function} callback - Callback called with validation result
 */
Handsontable.DateValidator = function (value, callback) {
  var valid = true;
  var dateEditor = (0, _editors.getEditor)('date', this.instance);

  if (value === null) {
    value = '';
  }
  var isValidDate = (0, _moment2['default'])(new Date(value)).isValid();
  // is it in the specified format
  var isValidFormat = (0, _moment2['default'])(value, this.dateFormat || dateEditor.defaultDateFormat, true).isValid();

  if (!isValidDate) {
    valid = false;
  }
  if (!isValidDate && isValidFormat) {
    valid = true;
  }

  if (isValidDate && !isValidFormat) {
    if (this.correctFormat === true) {
      // if format correction is enabled
      var correctedValue = correctFormat(value, this.dateFormat);

      this.instance.setDataAtCell(this.row, this.col, correctedValue, 'dateValidator');
      valid = true;
    } else {
      valid = false;
    }
  }

  callback(valid);
};

/**
 * Format the given string using moment.js' format feature
 *
 * @param {String} value
 * @param {String} dateFormat
 * @returns {String}
 */
var correctFormat = function correctFormat(value, dateFormat) {
  var date = (0, _moment2['default'])(new Date(value));
  var year = date.format('YYYY');
  var yearNow = (0, _moment2['default'])().format('YYYY');

  // Firefox and IE counting 2-digits year from 1900 rest from current age.
  if (year.substr(0, 2) !== yearNow.substr(0, 2)) {
    if (!value.match(new RegExp(year))) {
      date.year(year.replace(year.substr(0, 2), yearNow.substr(0, 2)));
    }
  } else if (year.length > 4) {
    // Ugly fix for moment bug which can not format 5-digits year using YYYY
    date.year((date.year() + '').substr(0, 4));
  }

  return date.format(dateFormat);
};

},{"./../editors":34,"moment":4}],74:[function(require,module,exports){
/**
 * Numeric cell validator
 *
 * @private
 * @validator NumericValidator
 * @param {*} value - Value of edited cell
 * @param {*} callback - Callback called with validation result
 */
'use strict';

Handsontable.NumericValidator = function (value, callback) {
  if (value === null) {
    value = '';
  }
  callback(/^-?\d*(\.|\,)?\d*$/.test(value));
};

},{}]},{},[29]);
