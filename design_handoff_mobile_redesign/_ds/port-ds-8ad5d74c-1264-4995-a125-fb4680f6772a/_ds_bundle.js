/* @ds-bundle: {"namespace":"PortDS","components":[{"name":"AnswerDiff","sourcePath":"components/general/AnswerDiff/AnswerDiff.jsx"},{"name":"AudioButton","sourcePath":"components/general/AudioButton/AudioButton.jsx"},{"name":"Markdown","sourcePath":"components/general/Markdown/Markdown.jsx"},{"name":"Recorder","sourcePath":"components/general/Recorder/Recorder.jsx"},{"name":"VerbConjugator","sourcePath":"components/general/VerbConjugator/VerbConjugator.jsx"}],"sourceHashes":{"components/general/AnswerDiff/AnswerDiff.jsx":"e46cd7aaad45","components/general/AnswerDiff/AnswerDiff.d.ts":"b9b33f994220","components/general/AnswerDiff/AnswerDiff.prompt.md":"2458f98bb57d","components/general/AudioButton/AudioButton.jsx":"5e3e12320f41","components/general/AudioButton/AudioButton.d.ts":"54bdb50fe152","components/general/AudioButton/AudioButton.prompt.md":"6e2e2c70de95","components/general/Markdown/Markdown.jsx":"ae32a17e79d8","components/general/Markdown/Markdown.d.ts":"a951afea7f60","components/general/Markdown/Markdown.prompt.md":"3b2357c9b471","components/general/Recorder/Recorder.jsx":"b805322511d2","components/general/Recorder/Recorder.d.ts":"2a6bcec80279","components/general/Recorder/Recorder.prompt.md":"b4319d44f56e","components/general/VerbConjugator/VerbConjugator.jsx":"9cfedf1e76de","components/general/VerbConjugator/VerbConjugator.d.ts":"7f7c110edf55","components/general/VerbConjugator/VerbConjugator.prompt.md":"5efa7a679648"},"inlinedExternals":["@ungap/structured-clone","bail","ccount","clsx","comma-separated-tokens","decode-named-character-reference","devlop","estree-util-is-identifier-name","extend","hast-util-to-jsx-runtime","hast-util-whitespace","html-url-attributes","inline-style-parser","is-plain-obj","longest-streak","markdown-table","mdast-util-find-and-replace","mdast-util-from-markdown","mdast-util-gfm","mdast-util-gfm-autolink-literal","mdast-util-gfm-footnote","mdast-util-gfm-strikethrough","mdast-util-gfm-table","mdast-util-gfm-task-list-item","mdast-util-phrasing","mdast-util-to-hast","mdast-util-to-markdown","mdast-util-to-string","micromark","micromark-core-commonmark","micromark-extension-gfm","micromark-extension-gfm-autolink-literal","micromark-extension-gfm-footnote","micromark-extension-gfm-strikethrough","micromark-extension-gfm-table","micromark-extension-gfm-tagfilter","micromark-extension-gfm-task-list-item","micromark-factory-destination","micromark-factory-label","micromark-factory-space","micromark-factory-title","micromark-factory-whitespace","micromark-util-character","micromark-util-chunked","micromark-util-classify-character","micromark-util-combine-extensions","micromark-util-decode-numeric-character-reference","micromark-util-decode-string","micromark-util-encode","micromark-util-html-tag-name","micromark-util-normalize-identifier","micromark-util-resolve-all","micromark-util-sanitize-uri","micromark-util-subtokenize","property-information","react-markdown","remark-gfm","remark-parse","remark-rehype","space-separated-tokens","style-to-js","style-to-object","tailwind-merge","trim-lines","trough","unified","unist-util-is","unist-util-position","unist-util-stringify-position","unist-util-visit","unist-util-visit-parents","vfile","vfile-message","zwitch"],"builtBy":"cc-design-sync"} */
"use strict";
var PortDS = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all2) => {
    for (var name2 in all2)
      __defProp(target, name2, { get: all2[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx7(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs6(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx7;
      module.exports.jsxs = jsxs6;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs6 : jsx7)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // node_modules/inline-style-parser/cjs/index.js
  var require_cjs = __commonJS({
    "node_modules/inline-style-parser/cjs/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
      var NEWLINE_REGEX = /\n/g;
      var WHITESPACE_REGEX = /^\s*/;
      var PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
      var COLON_REGEX = /^:\s*/;
      var VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
      var SEMICOLON_REGEX = /^[;\s]*/;
      var TRIM_REGEX = /^\s+|\s+$/g;
      var NEWLINE = "\n";
      var FORWARD_SLASH = "/";
      var ASTERISK = "*";
      var EMPTY_STRING = "";
      var TYPE_COMMENT = "comment";
      var TYPE_DECLARATION = "declaration";
      function index2(style, options) {
        if (typeof style !== "string") {
          throw new TypeError("First argument must be a string");
        }
        if (!style) return [];
        options = options || {};
        var lineno = 1;
        var column = 1;
        function updatePosition(str) {
          var lines = str.match(NEWLINE_REGEX);
          if (lines) lineno += lines.length;
          var i = str.lastIndexOf(NEWLINE);
          column = ~i ? str.length - i : column + str.length;
        }
        function position3() {
          var start2 = { line: lineno, column };
          return function(node2) {
            node2.position = new Position(start2);
            whitespace2();
            return node2;
          };
        }
        function Position(start2) {
          this.start = start2;
          this.end = { line: lineno, column };
          this.source = options.source;
        }
        Position.prototype.content = style;
        function error(msg) {
          var err = new Error(
            options.source + ":" + lineno + ":" + column + ": " + msg
          );
          err.reason = msg;
          err.filename = options.source;
          err.line = lineno;
          err.column = column;
          err.source = style;
          if (options.silent) ;
          else {
            throw err;
          }
        }
        function match(re2) {
          var m = re2.exec(style);
          if (!m) return;
          var str = m[0];
          updatePosition(str);
          style = style.slice(str.length);
          return m;
        }
        function whitespace2() {
          match(WHITESPACE_REGEX);
        }
        function comments(rules) {
          var c;
          rules = rules || [];
          while (c = comment()) {
            if (c !== false) {
              rules.push(c);
            }
          }
          return rules;
        }
        function comment() {
          var pos = position3();
          if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
          var i = 2;
          while (EMPTY_STRING != style.charAt(i) && (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))) {
            ++i;
          }
          i += 2;
          if (EMPTY_STRING === style.charAt(i - 1)) {
            return error("End of comment missing");
          }
          var str = style.slice(2, i - 2);
          column += 2;
          updatePosition(str);
          style = style.slice(i);
          column += 2;
          return pos({
            type: TYPE_COMMENT,
            comment: str
          });
        }
        function declaration() {
          var pos = position3();
          var prop = match(PROPERTY_REGEX);
          if (!prop) return;
          comment();
          if (!match(COLON_REGEX)) return error("property missing ':'");
          var val = match(VALUE_REGEX);
          var ret = pos({
            type: TYPE_DECLARATION,
            property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
            value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
          });
          match(SEMICOLON_REGEX);
          return ret;
        }
        function declarations() {
          var decls = [];
          comments(decls);
          var decl;
          while (decl = declaration()) {
            if (decl !== false) {
              decls.push(decl);
              comments(decls);
            }
          }
          return decls;
        }
        whitespace2();
        return declarations();
      }
      function trim(str) {
        return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
      }
      module.exports = index2;
    }
  });

  // node_modules/style-to-object/cjs/index.js
  var require_cjs2 = __commonJS({
    "node_modules/style-to-object/cjs/index.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.default = StyleToObject;
      var inline_style_parser_1 = __importDefault(require_cjs());
      function StyleToObject(style, iterator) {
        let styleObject = null;
        if (!style || typeof style !== "string") {
          return styleObject;
        }
        const declarations = (0, inline_style_parser_1.default)(style);
        const hasIterator = typeof iterator === "function";
        declarations.forEach((declaration) => {
          if (declaration.type !== "declaration") {
            return;
          }
          const { property, value } = declaration;
          if (hasIterator) {
            iterator(property, value, declaration);
          } else if (value) {
            styleObject = styleObject || {};
            styleObject[property] = value;
          }
        });
        return styleObject;
      }
    }
  });

  // node_modules/style-to-js/cjs/utilities.js
  var require_utilities = __commonJS({
    "node_modules/style-to-js/cjs/utilities.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.camelCase = void 0;
      var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
      var HYPHEN_REGEX = /-([a-z])/g;
      var NO_HYPHEN_REGEX = /^[^-]+$/;
      var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
      var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
      var skipCamelCase = function(property) {
        return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
      };
      var capitalize = function(match, character) {
        return character.toUpperCase();
      };
      var trimHyphen = function(match, prefix) {
        return "".concat(prefix, "-");
      };
      var camelCase = function(property, options) {
        if (options === void 0) {
          options = {};
        }
        if (skipCamelCase(property)) {
          return property;
        }
        property = property.toLowerCase();
        if (options.reactCompat) {
          property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
        } else {
          property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
        }
        return property.replace(HYPHEN_REGEX, capitalize);
      };
      exports.camelCase = camelCase;
    }
  });

  // node_modules/style-to-js/cjs/index.js
  var require_cjs3 = __commonJS({
    "node_modules/style-to-js/cjs/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      var style_to_object_1 = __importDefault(require_cjs2());
      var utilities_1 = require_utilities();
      function StyleToJS(style, options) {
        var output = {};
        if (!style || typeof style !== "string") {
          return output;
        }
        (0, style_to_object_1.default)(style, function(property, value) {
          if (property && value) {
            output[(0, utilities_1.camelCase)(property, options)] = value;
          }
        });
        return output;
      }
      StyleToJS.default = StyleToJS;
      module.exports = StyleToJS;
    }
  });

  // node_modules/extend/index.js
  var require_extend = __commonJS({
    "node_modules/extend/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var hasOwn = Object.prototype.hasOwnProperty;
      var toStr = Object.prototype.toString;
      var defineProperty = Object.defineProperty;
      var gOPD = Object.getOwnPropertyDescriptor;
      var isArray = function isArray2(arr) {
        if (typeof Array.isArray === "function") {
          return Array.isArray(arr);
        }
        return toStr.call(arr) === "[object Array]";
      };
      var isPlainObject2 = function isPlainObject3(obj) {
        if (!obj || toStr.call(obj) !== "[object Object]") {
          return false;
        }
        var hasOwnConstructor = hasOwn.call(obj, "constructor");
        var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
        if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
          return false;
        }
        var key;
        for (key in obj) {
        }
        return typeof key === "undefined" || hasOwn.call(obj, key);
      };
      var setProperty = function setProperty2(target, options) {
        if (defineProperty && options.name === "__proto__") {
          defineProperty(target, options.name, {
            enumerable: true,
            configurable: true,
            value: options.newValue,
            writable: true
          });
        } else {
          target[options.name] = options.newValue;
        }
      };
      var getProperty = function getProperty2(obj, name2) {
        if (name2 === "__proto__") {
          if (!hasOwn.call(obj, name2)) {
            return void 0;
          } else if (gOPD) {
            return gOPD(obj, name2).value;
          }
        }
        return obj[name2];
      };
      module.exports = function extend2() {
        var options, name2, src, copy, copyIsArray, clone;
        var target = arguments[0];
        var i = 1;
        var length = arguments.length;
        var deep = false;
        if (typeof target === "boolean") {
          deep = target;
          target = arguments[1] || {};
          i = 2;
        }
        if (target == null || typeof target !== "object" && typeof target !== "function") {
          target = {};
        }
        for (; i < length; ++i) {
          options = arguments[i];
          if (options != null) {
            for (name2 in options) {
              src = getProperty(target, name2);
              copy = getProperty(options, name2);
              if (target !== copy) {
                if (deep && copy && (isPlainObject2(copy) || (copyIsArray = isArray(copy)))) {
                  if (copyIsArray) {
                    copyIsArray = false;
                    clone = src && isArray(src) ? src : [];
                  } else {
                    clone = src && isPlainObject2(src) ? src : {};
                  }
                  setProperty(target, { name: name2, newValue: extend2(deep, clone, copy) });
                } else if (typeof copy !== "undefined") {
                  setProperty(target, { name: name2, newValue: copy });
                }
              }
            }
          }
        }
        return target;
      };
    }
  });

  // .design-sync/entry.tsx
  var entry_exports = {};
  __export(entry_exports, {
    AnswerDiff: () => AnswerDiff,
    AudioButton: () => AudioButton,
    Markdown: () => Markdown2,
    Recorder: () => Recorder,
    VerbConjugator: () => VerbConjugator
  });
  init_define_import_meta_env();

  // components/answer-diff.tsx
  init_define_import_meta_env();

  // lib/diff.ts
  init_define_import_meta_env();

  // lib/ditado.ts
  init_define_import_meta_env();

  // lib/diff.ts
  function tight(w) {
    return w.normalize("NFC").replace(/[^\p{L}\p{N}]/gu, "");
  }
  function spellingSlips(check) {
    const a = check.attempt.map((tok, i) => ({ tok, i })).filter(({ tok }) => tok.status === "same");
    const t = check.target.map((tok, i) => ({ tok, i })).filter(({ tok }) => tok.status === "same");
    const attempt = /* @__PURE__ */ new Set();
    const target = /* @__PURE__ */ new Set();
    for (let k = 0; k < Math.min(a.length, t.length); k++) {
      if (tight(a[k].tok.text) !== tight(t[k].tok.text)) {
        attempt.add(a[k].i);
        target.add(t[k].i);
      }
    }
    return { attempt, target };
  }

  // lib/utils.ts
  init_define_import_meta_env();

  // node_modules/clsx/dist/clsx.mjs
  init_define_import_meta_env();
  function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx() {
    for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
  }

  // node_modules/tailwind-merge/dist/bundle-mjs.mjs
  init_define_import_meta_env();
  var concatArrays = (array1, array2) => {
    const combinedArray = new Array(array1.length + array2.length);
    for (let i = 0; i < array1.length; i++) {
      combinedArray[i] = array1[i];
    }
    for (let i = 0; i < array2.length; i++) {
      combinedArray[array1.length + i] = array2[i];
    }
    return combinedArray;
  };
  var createClassValidatorObject = (classGroupId, validator) => ({
    classGroupId,
    validator
  });
  var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
    nextPart,
    validators,
    classGroupId
  });
  var CLASS_PART_SEPARATOR = "-";
  var EMPTY_CONFLICTS = [];
  var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
  var createClassGroupUtils = (config) => {
    const classMap = createClassMap(config);
    const {
      conflictingClassGroups,
      conflictingClassGroupModifiers
    } = config;
    const getClassGroupId = (className) => {
      if (className.startsWith("[") && className.endsWith("]")) {
        return getGroupIdForArbitraryProperty(className);
      }
      const classParts = className.split(CLASS_PART_SEPARATOR);
      const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
      return getGroupRecursive(classParts, startIndex, classMap);
    };
    const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
      if (hasPostfixModifier) {
        const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
        const baseConflicts = conflictingClassGroups[classGroupId];
        if (modifierConflicts) {
          if (baseConflicts) {
            return concatArrays(baseConflicts, modifierConflicts);
          }
          return modifierConflicts;
        }
        return baseConflicts || EMPTY_CONFLICTS;
      }
      return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
    };
    return {
      getClassGroupId,
      getConflictingClassGroupIds
    };
  };
  var getGroupRecursive = (classParts, startIndex, classPartObject) => {
    const classPathsLength = classParts.length - startIndex;
    if (classPathsLength === 0) {
      return classPartObject.classGroupId;
    }
    const currentClassPart = classParts[startIndex];
    const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
    if (nextClassPartObject) {
      const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
      if (result) return result;
    }
    const validators = classPartObject.validators;
    if (validators === null) {
      return void 0;
    }
    const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
    const validatorsLength = validators.length;
    for (let i = 0; i < validatorsLength; i++) {
      const validatorObj = validators[i];
      if (validatorObj.validator(classRest)) {
        return validatorObj.classGroupId;
      }
    }
    return void 0;
  };
  var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
    const content3 = className.slice(1, -1);
    const colonIndex = content3.indexOf(":");
    const property = content3.slice(0, colonIndex);
    return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
  })();
  var createClassMap = (config) => {
    const {
      theme,
      classGroups
    } = config;
    return processClassGroups(classGroups, theme);
  };
  var processClassGroups = (classGroups, theme) => {
    const classMap = createClassPartObject();
    for (const classGroupId in classGroups) {
      const group = classGroups[classGroupId];
      processClassesRecursively(group, classMap, classGroupId, theme);
    }
    return classMap;
  };
  var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
    const len = classGroup.length;
    for (let i = 0; i < len; i++) {
      const classDefinition = classGroup[i];
      processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
    }
  };
  var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
    if (typeof classDefinition === "string") {
      processStringDefinition(classDefinition, classPartObject, classGroupId);
      return;
    }
    if (typeof classDefinition === "function") {
      processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
      return;
    }
    processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
  };
  var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
    const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
    classPartObjectToEdit.classGroupId = classGroupId;
  };
  var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
    if (isThemeGetter(classDefinition)) {
      processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
      return;
    }
    if (classPartObject.validators === null) {
      classPartObject.validators = [];
    }
    classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
  };
  var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
    const entries = Object.entries(classDefinition);
    const len = entries.length;
    for (let i = 0; i < len; i++) {
      const [key, value] = entries[i];
      processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
    }
  };
  var getPart = (classPartObject, path2) => {
    let current = classPartObject;
    const parts = path2.split(CLASS_PART_SEPARATOR);
    const len = parts.length;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      let next = current.nextPart.get(part);
      if (!next) {
        next = createClassPartObject();
        current.nextPart.set(part, next);
      }
      current = next;
    }
    return current;
  };
  var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
  var createLruCache = (maxCacheSize) => {
    if (maxCacheSize < 1) {
      return {
        get: () => void 0,
        set: () => {
        }
      };
    }
    let cacheSize = 0;
    let cache = /* @__PURE__ */ Object.create(null);
    let previousCache = /* @__PURE__ */ Object.create(null);
    const update = (key, value) => {
      cache[key] = value;
      cacheSize++;
      if (cacheSize > maxCacheSize) {
        cacheSize = 0;
        previousCache = cache;
        cache = /* @__PURE__ */ Object.create(null);
      }
    };
    return {
      get(key) {
        let value = cache[key];
        if (value !== void 0) {
          return value;
        }
        if ((value = previousCache[key]) !== void 0) {
          update(key, value);
          return value;
        }
      },
      set(key, value) {
        if (key in cache) {
          cache[key] = value;
        } else {
          update(key, value);
        }
      }
    };
  };
  var IMPORTANT_MODIFIER = "!";
  var MODIFIER_SEPARATOR = ":";
  var EMPTY_MODIFIERS = [];
  var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
    modifiers,
    hasImportantModifier,
    baseClassName,
    maybePostfixModifierPosition,
    isExternal
  });
  var createParseClassName = (config) => {
    const {
      prefix,
      experimentalParseClassName
    } = config;
    let parseClassName = (className) => {
      const modifiers = [];
      let bracketDepth = 0;
      let parenDepth = 0;
      let modifierStart = 0;
      let postfixModifierPosition;
      const len = className.length;
      for (let index2 = 0; index2 < len; index2++) {
        const currentCharacter = className[index2];
        if (bracketDepth === 0 && parenDepth === 0) {
          if (currentCharacter === MODIFIER_SEPARATOR) {
            modifiers.push(className.slice(modifierStart, index2));
            modifierStart = index2 + 1;
            continue;
          }
          if (currentCharacter === "/") {
            postfixModifierPosition = index2;
            continue;
          }
        }
        if (currentCharacter === "[") bracketDepth++;
        else if (currentCharacter === "]") bracketDepth--;
        else if (currentCharacter === "(") parenDepth++;
        else if (currentCharacter === ")") parenDepth--;
      }
      const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
      let baseClassName = baseClassNameWithImportantModifier;
      let hasImportantModifier = false;
      if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
        baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
        hasImportantModifier = true;
      } else if (
        /**
         * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
         * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
         */
        baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
      ) {
        baseClassName = baseClassNameWithImportantModifier.slice(1);
        hasImportantModifier = true;
      }
      const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
      return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
    };
    if (prefix) {
      const fullPrefix = prefix + MODIFIER_SEPARATOR;
      const parseClassNameOriginal = parseClassName;
      parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
    }
    if (experimentalParseClassName) {
      const parseClassNameOriginal = parseClassName;
      parseClassName = (className) => experimentalParseClassName({
        className,
        parseClassName: parseClassNameOriginal
      });
    }
    return parseClassName;
  };
  var createSortModifiers = (config) => {
    const modifierWeights = /* @__PURE__ */ new Map();
    config.orderSensitiveModifiers.forEach((mod, index2) => {
      modifierWeights.set(mod, 1e6 + index2);
    });
    return (modifiers) => {
      const result = [];
      let currentSegment = [];
      for (let i = 0; i < modifiers.length; i++) {
        const modifier = modifiers[i];
        const isArbitrary = modifier[0] === "[";
        const isOrderSensitive = modifierWeights.has(modifier);
        if (isArbitrary || isOrderSensitive) {
          if (currentSegment.length > 0) {
            currentSegment.sort();
            result.push(...currentSegment);
            currentSegment = [];
          }
          result.push(modifier);
        } else {
          currentSegment.push(modifier);
        }
      }
      if (currentSegment.length > 0) {
        currentSegment.sort();
        result.push(...currentSegment);
      }
      return result;
    };
  };
  var createConfigUtils = (config) => ({
    cache: createLruCache(config.cacheSize),
    parseClassName: createParseClassName(config),
    sortModifiers: createSortModifiers(config),
    postfixLookupClassGroupIds: createPostfixLookupClassGroupIds(config),
    ...createClassGroupUtils(config)
  });
  var createPostfixLookupClassGroupIds = (config) => {
    const lookup = /* @__PURE__ */ Object.create(null);
    const classGroupIds = config.postfixLookupClassGroups;
    if (classGroupIds) {
      for (let i = 0; i < classGroupIds.length; i++) {
        lookup[classGroupIds[i]] = true;
      }
    }
    return lookup;
  };
  var SPLIT_CLASSES_REGEX = /\s+/;
  var mergeClassList = (classList, configUtils) => {
    const {
      parseClassName,
      getClassGroupId,
      getConflictingClassGroupIds,
      sortModifiers,
      postfixLookupClassGroupIds
    } = configUtils;
    const classGroupsInConflict = [];
    const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
    let result = "";
    for (let index2 = classNames.length - 1; index2 >= 0; index2 -= 1) {
      const originalClassName = classNames[index2];
      const {
        isExternal,
        modifiers,
        hasImportantModifier,
        baseClassName,
        maybePostfixModifierPosition
      } = parseClassName(originalClassName);
      if (isExternal) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      let hasPostfixModifier = !!maybePostfixModifierPosition;
      let classGroupId;
      if (hasPostfixModifier) {
        const baseClassNameWithoutPostfix = baseClassName.substring(0, maybePostfixModifierPosition);
        classGroupId = getClassGroupId(baseClassNameWithoutPostfix);
        const classGroupIdWithPostfix = classGroupId && postfixLookupClassGroupIds[classGroupId] ? getClassGroupId(baseClassName) : void 0;
        if (classGroupIdWithPostfix && classGroupIdWithPostfix !== classGroupId) {
          classGroupId = classGroupIdWithPostfix;
          hasPostfixModifier = false;
        }
      } else {
        classGroupId = getClassGroupId(baseClassName);
      }
      if (!classGroupId) {
        if (!hasPostfixModifier) {
          result = originalClassName + (result.length > 0 ? " " + result : result);
          continue;
        }
        classGroupId = getClassGroupId(baseClassName);
        if (!classGroupId) {
          result = originalClassName + (result.length > 0 ? " " + result : result);
          continue;
        }
        hasPostfixModifier = false;
      }
      const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
      const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
      const classId = modifierId + classGroupId;
      if (classGroupsInConflict.indexOf(classId) > -1) {
        continue;
      }
      classGroupsInConflict.push(classId);
      const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
      for (let i = 0; i < conflictGroups.length; ++i) {
        const group = conflictGroups[i];
        classGroupsInConflict.push(modifierId + group);
      }
      result = originalClassName + (result.length > 0 ? " " + result : result);
    }
    return result;
  };
  var twJoin = (...classLists) => {
    let index2 = 0;
    let argument;
    let resolvedValue;
    let string3 = "";
    while (index2 < classLists.length) {
      if (argument = classLists[index2++]) {
        if (resolvedValue = toValue(argument)) {
          string3 && (string3 += " ");
          string3 += resolvedValue;
        }
      }
    }
    return string3;
  };
  var toValue = (mix) => {
    if (typeof mix === "string") {
      return mix;
    }
    let resolvedValue;
    let string3 = "";
    for (let k = 0; k < mix.length; k++) {
      if (mix[k]) {
        if (resolvedValue = toValue(mix[k])) {
          string3 && (string3 += " ");
          string3 += resolvedValue;
        }
      }
    }
    return string3;
  };
  var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
    let configUtils;
    let cacheGet;
    let cacheSet;
    let functionToCall;
    const initTailwindMerge = (classList) => {
      const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
      configUtils = createConfigUtils(config);
      cacheGet = configUtils.cache.get;
      cacheSet = configUtils.cache.set;
      functionToCall = tailwindMerge;
      return tailwindMerge(classList);
    };
    const tailwindMerge = (classList) => {
      const cachedResult = cacheGet(classList);
      if (cachedResult) {
        return cachedResult;
      }
      const result = mergeClassList(classList, configUtils);
      cacheSet(classList, result);
      return result;
    };
    functionToCall = initTailwindMerge;
    return (...args) => functionToCall(twJoin(...args));
  };
  var fallbackThemeArr = [];
  var fromTheme = (key) => {
    const themeGetter = (theme) => theme[key] || fallbackThemeArr;
    themeGetter.isThemeGetter = true;
    return themeGetter;
  };
  var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
  var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
  var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
  var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
  var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
  var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
  var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
  var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
  var isFraction = (value) => fractionRegex.test(value);
  var isNumber = (value) => !!value && !Number.isNaN(Number(value));
  var isInteger = (value) => !!value && Number.isInteger(Number(value));
  var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
  var isTshirtSize = (value) => tshirtUnitRegex.test(value);
  var isAny = () => true;
  var isLengthOnly = (value) => (
    // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
    // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
    // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
    lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
  );
  var isNever = () => false;
  var isShadow = (value) => shadowRegex.test(value);
  var isImage = (value) => imageRegex.test(value);
  var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
  var isNamedContainerQuery = (value) => value.startsWith("@container") && (value[10] === "/" && value[11] !== void 0 || value[11] === "s" && value[16] !== void 0 && value.startsWith("-size/", 10) || value[11] === "n" && value[18] !== void 0 && value.startsWith("-normal/", 10));
  var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
  var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
  var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
  var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
  var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
  var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
  var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
  var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
  var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
  var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
  var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
  var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
  var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
  var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
  var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
  var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
  var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
  var getIsArbitraryValue = (value, testLabel, testValue) => {
    const result = arbitraryValueRegex.exec(value);
    if (result) {
      if (result[1]) {
        return testLabel(result[1]);
      }
      return testValue(result[2]);
    }
    return false;
  };
  var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
    const result = arbitraryVariableRegex.exec(value);
    if (result) {
      if (result[1]) {
        return testLabel(result[1]);
      }
      return shouldMatchNoLabel;
    }
    return false;
  };
  var isLabelPosition = (label) => label === "position" || label === "percentage";
  var isLabelImage = (label) => label === "image" || label === "url";
  var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
  var isLabelLength = (label) => label === "length";
  var isLabelNumber = (label) => label === "number";
  var isLabelFamilyName = (label) => label === "family-name";
  var isLabelWeight = (label) => label === "number" || label === "weight";
  var isLabelShadow = (label) => label === "shadow";
  var getDefaultConfig = () => {
    const themeColor = fromTheme("color");
    const themeFont = fromTheme("font");
    const themeText = fromTheme("text");
    const themeFontWeight = fromTheme("font-weight");
    const themeTracking = fromTheme("tracking");
    const themeLeading = fromTheme("leading");
    const themeBreakpoint = fromTheme("breakpoint");
    const themeContainer = fromTheme("container");
    const themeSpacing = fromTheme("spacing");
    const themeRadius = fromTheme("radius");
    const themeShadow = fromTheme("shadow");
    const themeInsetShadow = fromTheme("inset-shadow");
    const themeTextShadow = fromTheme("text-shadow");
    const themeDropShadow = fromTheme("drop-shadow");
    const themeBlur = fromTheme("blur");
    const themePerspective = fromTheme("perspective");
    const themeAspect = fromTheme("aspect");
    const themeEase = fromTheme("ease");
    const themeAnimate = fromTheme("animate");
    const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
    const scalePosition = () => [
      "center",
      "top",
      "bottom",
      "left",
      "right",
      "top-left",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "left-top",
      "top-right",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "right-top",
      "bottom-right",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "right-bottom",
      "bottom-left",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "left-bottom"
    ];
    const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
    const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
    const scaleOverscroll = () => ["auto", "contain", "none"];
    const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
    const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
    const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
    const scaleGridColRowStartAndEnd = () => ["auto", {
      span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
    }, isInteger, isArbitraryVariable, isArbitraryValue];
    const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
    const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
    const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
    const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
    const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
    const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
    const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
    const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
    const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
    const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
      position: [isArbitraryVariable, isArbitraryValue]
    }];
    const scaleBgRepeat = () => ["no-repeat", {
      repeat: ["", "x", "y", "space", "round"]
    }];
    const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
      size: [isArbitraryVariable, isArbitraryValue]
    }];
    const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
    const scaleRadius = () => [
      // Deprecated since Tailwind CSS v4.0.0
      "",
      "none",
      "full",
      themeRadius,
      isArbitraryVariable,
      isArbitraryValue
    ];
    const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
    const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
    const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
    const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
    const scaleBlur = () => [
      // Deprecated since Tailwind CSS v4.0.0
      "",
      "none",
      themeBlur,
      isArbitraryVariable,
      isArbitraryValue
    ];
    const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
    const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
    const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
    const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
    return {
      cacheSize: 500,
      theme: {
        animate: ["spin", "ping", "pulse", "bounce"],
        aspect: ["video"],
        blur: [isTshirtSize],
        breakpoint: [isTshirtSize],
        color: [isAny],
        container: [isTshirtSize],
        "drop-shadow": [isTshirtSize],
        ease: ["in", "out", "in-out"],
        font: [isAnyNonArbitrary],
        "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
        "inset-shadow": [isTshirtSize],
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
        perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
        radius: [isTshirtSize],
        shadow: [isTshirtSize],
        spacing: ["px", isNumber],
        text: [isTshirtSize],
        "text-shadow": [isTshirtSize],
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
      },
      classGroups: {
        // --------------
        // --- Layout ---
        // --------------
        /**
         * Aspect Ratio
         * @see https://tailwindcss.com/docs/aspect-ratio
         */
        aspect: [{
          aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
        }],
        /**
         * Container
         * @see https://tailwindcss.com/docs/container
         * @deprecated since Tailwind CSS v4.0.0
         */
        container: ["container"],
        /**
         * Container Type
         * @see https://tailwindcss.com/docs/responsive-design#container-queries
         */
        "container-type": [{
          "@container": ["", "normal", "size", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Container Name
         * @see https://tailwindcss.com/docs/responsive-design#named-containers
         */
        "container-named": [isNamedContainerQuery],
        /**
         * Columns
         * @see https://tailwindcss.com/docs/columns
         */
        columns: [{
          columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
        }],
        /**
         * Break After
         * @see https://tailwindcss.com/docs/break-after
         */
        "break-after": [{
          "break-after": scaleBreak()
        }],
        /**
         * Break Before
         * @see https://tailwindcss.com/docs/break-before
         */
        "break-before": [{
          "break-before": scaleBreak()
        }],
        /**
         * Break Inside
         * @see https://tailwindcss.com/docs/break-inside
         */
        "break-inside": [{
          "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
        }],
        /**
         * Box Decoration Break
         * @see https://tailwindcss.com/docs/box-decoration-break
         */
        "box-decoration": [{
          "box-decoration": ["slice", "clone"]
        }],
        /**
         * Box Sizing
         * @see https://tailwindcss.com/docs/box-sizing
         */
        box: [{
          box: ["border", "content"]
        }],
        /**
         * Display
         * @see https://tailwindcss.com/docs/display
         */
        display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
        /**
         * Screen Reader Only
         * @see https://tailwindcss.com/docs/display#screen-reader-only
         */
        sr: ["sr-only", "not-sr-only"],
        /**
         * Floats
         * @see https://tailwindcss.com/docs/float
         */
        float: [{
          float: ["right", "left", "none", "start", "end"]
        }],
        /**
         * Clear
         * @see https://tailwindcss.com/docs/clear
         */
        clear: [{
          clear: ["left", "right", "both", "none", "start", "end"]
        }],
        /**
         * Isolation
         * @see https://tailwindcss.com/docs/isolation
         */
        isolation: ["isolate", "isolation-auto"],
        /**
         * Object Fit
         * @see https://tailwindcss.com/docs/object-fit
         */
        "object-fit": [{
          object: ["contain", "cover", "fill", "none", "scale-down"]
        }],
        /**
         * Object Position
         * @see https://tailwindcss.com/docs/object-position
         */
        "object-position": [{
          object: scalePositionWithArbitrary()
        }],
        /**
         * Overflow
         * @see https://tailwindcss.com/docs/overflow
         */
        overflow: [{
          overflow: scaleOverflow()
        }],
        /**
         * Overflow X
         * @see https://tailwindcss.com/docs/overflow
         */
        "overflow-x": [{
          "overflow-x": scaleOverflow()
        }],
        /**
         * Overflow Y
         * @see https://tailwindcss.com/docs/overflow
         */
        "overflow-y": [{
          "overflow-y": scaleOverflow()
        }],
        /**
         * Overscroll Behavior
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        overscroll: [{
          overscroll: scaleOverscroll()
        }],
        /**
         * Overscroll Behavior X
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        "overscroll-x": [{
          "overscroll-x": scaleOverscroll()
        }],
        /**
         * Overscroll Behavior Y
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        "overscroll-y": [{
          "overscroll-y": scaleOverscroll()
        }],
        /**
         * Position
         * @see https://tailwindcss.com/docs/position
         */
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        /**
         * Inset
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        inset: [{
          inset: scaleInset()
        }],
        /**
         * Inset Inline
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-x": [{
          "inset-x": scaleInset()
        }],
        /**
         * Inset Block
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-y": [{
          "inset-y": scaleInset()
        }],
        /**
         * Inset Inline Start
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         * @todo class group will be renamed to `inset-s` in next major release
         */
        start: [{
          "inset-s": scaleInset(),
          /**
           * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
           * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
           */
          start: scaleInset()
        }],
        /**
         * Inset Inline End
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         * @todo class group will be renamed to `inset-e` in next major release
         */
        end: [{
          "inset-e": scaleInset(),
          /**
           * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
           * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
           */
          end: scaleInset()
        }],
        /**
         * Inset Block Start
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-bs": [{
          "inset-bs": scaleInset()
        }],
        /**
         * Inset Block End
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-be": [{
          "inset-be": scaleInset()
        }],
        /**
         * Top
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        top: [{
          top: scaleInset()
        }],
        /**
         * Right
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        right: [{
          right: scaleInset()
        }],
        /**
         * Bottom
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        bottom: [{
          bottom: scaleInset()
        }],
        /**
         * Left
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        left: [{
          left: scaleInset()
        }],
        /**
         * Visibility
         * @see https://tailwindcss.com/docs/visibility
         */
        visibility: ["visible", "invisible", "collapse"],
        /**
         * Z-Index
         * @see https://tailwindcss.com/docs/z-index
         */
        z: [{
          z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
        }],
        // ------------------------
        // --- Flexbox and Grid ---
        // ------------------------
        /**
         * Flex Basis
         * @see https://tailwindcss.com/docs/flex-basis
         */
        basis: [{
          basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
        }],
        /**
         * Flex Direction
         * @see https://tailwindcss.com/docs/flex-direction
         */
        "flex-direction": [{
          flex: ["row", "row-reverse", "col", "col-reverse"]
        }],
        /**
         * Flex Wrap
         * @see https://tailwindcss.com/docs/flex-wrap
         */
        "flex-wrap": [{
          flex: ["nowrap", "wrap", "wrap-reverse"]
        }],
        /**
         * Flex
         * @see https://tailwindcss.com/docs/flex
         */
        flex: [{
          flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
        }],
        /**
         * Flex Grow
         * @see https://tailwindcss.com/docs/flex-grow
         */
        grow: [{
          grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Flex Shrink
         * @see https://tailwindcss.com/docs/flex-shrink
         */
        shrink: [{
          shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Order
         * @see https://tailwindcss.com/docs/order
         */
        order: [{
          order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Grid Template Columns
         * @see https://tailwindcss.com/docs/grid-template-columns
         */
        "grid-cols": [{
          "grid-cols": scaleGridTemplateColsRows()
        }],
        /**
         * Grid Column Start / End
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-start-end": [{
          col: scaleGridColRowStartAndEnd()
        }],
        /**
         * Grid Column Start
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-start": [{
          "col-start": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Column End
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-end": [{
          "col-end": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Template Rows
         * @see https://tailwindcss.com/docs/grid-template-rows
         */
        "grid-rows": [{
          "grid-rows": scaleGridTemplateColsRows()
        }],
        /**
         * Grid Row Start / End
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-start-end": [{
          row: scaleGridColRowStartAndEnd()
        }],
        /**
         * Grid Row Start
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-start": [{
          "row-start": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Row End
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-end": [{
          "row-end": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Auto Flow
         * @see https://tailwindcss.com/docs/grid-auto-flow
         */
        "grid-flow": [{
          "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
        }],
        /**
         * Grid Auto Columns
         * @see https://tailwindcss.com/docs/grid-auto-columns
         */
        "auto-cols": [{
          "auto-cols": scaleGridAutoColsRows()
        }],
        /**
         * Grid Auto Rows
         * @see https://tailwindcss.com/docs/grid-auto-rows
         */
        "auto-rows": [{
          "auto-rows": scaleGridAutoColsRows()
        }],
        /**
         * Gap
         * @see https://tailwindcss.com/docs/gap
         */
        gap: [{
          gap: scaleUnambiguousSpacing()
        }],
        /**
         * Gap X
         * @see https://tailwindcss.com/docs/gap
         */
        "gap-x": [{
          "gap-x": scaleUnambiguousSpacing()
        }],
        /**
         * Gap Y
         * @see https://tailwindcss.com/docs/gap
         */
        "gap-y": [{
          "gap-y": scaleUnambiguousSpacing()
        }],
        /**
         * Justify Content
         * @see https://tailwindcss.com/docs/justify-content
         */
        "justify-content": [{
          justify: [...scaleAlignPrimaryAxis(), "normal"]
        }],
        /**
         * Justify Items
         * @see https://tailwindcss.com/docs/justify-items
         */
        "justify-items": [{
          "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
        }],
        /**
         * Justify Self
         * @see https://tailwindcss.com/docs/justify-self
         */
        "justify-self": [{
          "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
        }],
        /**
         * Align Content
         * @see https://tailwindcss.com/docs/align-content
         */
        "align-content": [{
          content: ["normal", ...scaleAlignPrimaryAxis()]
        }],
        /**
         * Align Items
         * @see https://tailwindcss.com/docs/align-items
         */
        "align-items": [{
          items: [...scaleAlignSecondaryAxis(), {
            baseline: ["", "last"]
          }]
        }],
        /**
         * Align Self
         * @see https://tailwindcss.com/docs/align-self
         */
        "align-self": [{
          self: ["auto", ...scaleAlignSecondaryAxis(), {
            baseline: ["", "last"]
          }]
        }],
        /**
         * Place Content
         * @see https://tailwindcss.com/docs/place-content
         */
        "place-content": [{
          "place-content": scaleAlignPrimaryAxis()
        }],
        /**
         * Place Items
         * @see https://tailwindcss.com/docs/place-items
         */
        "place-items": [{
          "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
        }],
        /**
         * Place Self
         * @see https://tailwindcss.com/docs/place-self
         */
        "place-self": [{
          "place-self": ["auto", ...scaleAlignSecondaryAxis()]
        }],
        // Spacing
        /**
         * Padding
         * @see https://tailwindcss.com/docs/padding
         */
        p: [{
          p: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Inline
         * @see https://tailwindcss.com/docs/padding
         */
        px: [{
          px: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Block
         * @see https://tailwindcss.com/docs/padding
         */
        py: [{
          py: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Inline Start
         * @see https://tailwindcss.com/docs/padding
         */
        ps: [{
          ps: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Inline End
         * @see https://tailwindcss.com/docs/padding
         */
        pe: [{
          pe: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Block Start
         * @see https://tailwindcss.com/docs/padding
         */
        pbs: [{
          pbs: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Block End
         * @see https://tailwindcss.com/docs/padding
         */
        pbe: [{
          pbe: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Top
         * @see https://tailwindcss.com/docs/padding
         */
        pt: [{
          pt: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Right
         * @see https://tailwindcss.com/docs/padding
         */
        pr: [{
          pr: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Bottom
         * @see https://tailwindcss.com/docs/padding
         */
        pb: [{
          pb: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Left
         * @see https://tailwindcss.com/docs/padding
         */
        pl: [{
          pl: scaleUnambiguousSpacing()
        }],
        /**
         * Margin
         * @see https://tailwindcss.com/docs/margin
         */
        m: [{
          m: scaleMargin()
        }],
        /**
         * Margin Inline
         * @see https://tailwindcss.com/docs/margin
         */
        mx: [{
          mx: scaleMargin()
        }],
        /**
         * Margin Block
         * @see https://tailwindcss.com/docs/margin
         */
        my: [{
          my: scaleMargin()
        }],
        /**
         * Margin Inline Start
         * @see https://tailwindcss.com/docs/margin
         */
        ms: [{
          ms: scaleMargin()
        }],
        /**
         * Margin Inline End
         * @see https://tailwindcss.com/docs/margin
         */
        me: [{
          me: scaleMargin()
        }],
        /**
         * Margin Block Start
         * @see https://tailwindcss.com/docs/margin
         */
        mbs: [{
          mbs: scaleMargin()
        }],
        /**
         * Margin Block End
         * @see https://tailwindcss.com/docs/margin
         */
        mbe: [{
          mbe: scaleMargin()
        }],
        /**
         * Margin Top
         * @see https://tailwindcss.com/docs/margin
         */
        mt: [{
          mt: scaleMargin()
        }],
        /**
         * Margin Right
         * @see https://tailwindcss.com/docs/margin
         */
        mr: [{
          mr: scaleMargin()
        }],
        /**
         * Margin Bottom
         * @see https://tailwindcss.com/docs/margin
         */
        mb: [{
          mb: scaleMargin()
        }],
        /**
         * Margin Left
         * @see https://tailwindcss.com/docs/margin
         */
        ml: [{
          ml: scaleMargin()
        }],
        /**
         * Space Between X
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-x": [{
          "space-x": scaleUnambiguousSpacing()
        }],
        /**
         * Space Between X Reverse
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-x-reverse": ["space-x-reverse"],
        /**
         * Space Between Y
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-y": [{
          "space-y": scaleUnambiguousSpacing()
        }],
        /**
         * Space Between Y Reverse
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-y-reverse": ["space-y-reverse"],
        // --------------
        // --- Sizing ---
        // --------------
        /**
         * Size
         * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
         */
        size: [{
          size: scaleSizing()
        }],
        /**
         * Inline Size
         * @see https://tailwindcss.com/docs/width
         */
        "inline-size": [{
          inline: ["auto", ...scaleSizingInline()]
        }],
        /**
         * Min-Inline Size
         * @see https://tailwindcss.com/docs/min-width
         */
        "min-inline-size": [{
          "min-inline": ["auto", ...scaleSizingInline()]
        }],
        /**
         * Max-Inline Size
         * @see https://tailwindcss.com/docs/max-width
         */
        "max-inline-size": [{
          "max-inline": ["none", ...scaleSizingInline()]
        }],
        /**
         * Block Size
         * @see https://tailwindcss.com/docs/height
         */
        "block-size": [{
          block: ["auto", ...scaleSizingBlock()]
        }],
        /**
         * Min-Block Size
         * @see https://tailwindcss.com/docs/min-height
         */
        "min-block-size": [{
          "min-block": ["auto", ...scaleSizingBlock()]
        }],
        /**
         * Max-Block Size
         * @see https://tailwindcss.com/docs/max-height
         */
        "max-block-size": [{
          "max-block": ["none", ...scaleSizingBlock()]
        }],
        /**
         * Width
         * @see https://tailwindcss.com/docs/width
         */
        w: [{
          w: [themeContainer, "screen", ...scaleSizing()]
        }],
        /**
         * Min-Width
         * @see https://tailwindcss.com/docs/min-width
         */
        "min-w": [{
          "min-w": [
            themeContainer,
            "screen",
            /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            "none",
            ...scaleSizing()
          ]
        }],
        /**
         * Max-Width
         * @see https://tailwindcss.com/docs/max-width
         */
        "max-w": [{
          "max-w": [
            themeContainer,
            "screen",
            "none",
            /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            "prose",
            /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            {
              screen: [themeBreakpoint]
            },
            ...scaleSizing()
          ]
        }],
        /**
         * Height
         * @see https://tailwindcss.com/docs/height
         */
        h: [{
          h: ["screen", "lh", ...scaleSizing()]
        }],
        /**
         * Min-Height
         * @see https://tailwindcss.com/docs/min-height
         */
        "min-h": [{
          "min-h": ["screen", "lh", "none", ...scaleSizing()]
        }],
        /**
         * Max-Height
         * @see https://tailwindcss.com/docs/max-height
         */
        "max-h": [{
          "max-h": ["screen", "lh", ...scaleSizing()]
        }],
        // ------------------
        // --- Typography ---
        // ------------------
        /**
         * Font Size
         * @see https://tailwindcss.com/docs/font-size
         */
        "font-size": [{
          text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
        }],
        /**
         * Font Smoothing
         * @see https://tailwindcss.com/docs/font-smoothing
         */
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        /**
         * Font Style
         * @see https://tailwindcss.com/docs/font-style
         */
        "font-style": ["italic", "not-italic"],
        /**
         * Font Weight
         * @see https://tailwindcss.com/docs/font-weight
         */
        "font-weight": [{
          font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
        }],
        /**
         * Font Stretch
         * @see https://tailwindcss.com/docs/font-stretch
         */
        "font-stretch": [{
          "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
        }],
        /**
         * Font Family
         * @see https://tailwindcss.com/docs/font-family
         */
        "font-family": [{
          font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
        }],
        /**
         * Font Feature Settings
         * @see https://tailwindcss.com/docs/font-feature-settings
         */
        "font-features": [{
          "font-features": [isArbitraryValue]
        }],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-normal": ["normal-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-ordinal": ["ordinal"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-slashed-zero": ["slashed-zero"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        /**
         * Letter Spacing
         * @see https://tailwindcss.com/docs/letter-spacing
         */
        tracking: [{
          tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Line Clamp
         * @see https://tailwindcss.com/docs/line-clamp
         */
        "line-clamp": [{
          "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
        }],
        /**
         * Line Height
         * @see https://tailwindcss.com/docs/line-height
         */
        leading: [{
          leading: [
            /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            themeLeading,
            ...scaleUnambiguousSpacing()
          ]
        }],
        /**
         * List Style Image
         * @see https://tailwindcss.com/docs/list-style-image
         */
        "list-image": [{
          "list-image": ["none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * List Style Position
         * @see https://tailwindcss.com/docs/list-style-position
         */
        "list-style-position": [{
          list: ["inside", "outside"]
        }],
        /**
         * List Style Type
         * @see https://tailwindcss.com/docs/list-style-type
         */
        "list-style-type": [{
          list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Text Alignment
         * @see https://tailwindcss.com/docs/text-align
         */
        "text-alignment": [{
          text: ["left", "center", "right", "justify", "start", "end"]
        }],
        /**
         * Placeholder Color
         * @deprecated since Tailwind CSS v3.0.0
         * @see https://v3.tailwindcss.com/docs/placeholder-color
         */
        "placeholder-color": [{
          placeholder: scaleColor()
        }],
        /**
         * Text Color
         * @see https://tailwindcss.com/docs/text-color
         */
        "text-color": [{
          text: scaleColor()
        }],
        /**
         * Text Decoration
         * @see https://tailwindcss.com/docs/text-decoration
         */
        "text-decoration": ["underline", "overline", "line-through", "no-underline"],
        /**
         * Text Decoration Style
         * @see https://tailwindcss.com/docs/text-decoration-style
         */
        "text-decoration-style": [{
          decoration: [...scaleLineStyle(), "wavy"]
        }],
        /**
         * Text Decoration Thickness
         * @see https://tailwindcss.com/docs/text-decoration-thickness
         */
        "text-decoration-thickness": [{
          decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
        }],
        /**
         * Text Decoration Color
         * @see https://tailwindcss.com/docs/text-decoration-color
         */
        "text-decoration-color": [{
          decoration: scaleColor()
        }],
        /**
         * Text Underline Offset
         * @see https://tailwindcss.com/docs/text-underline-offset
         */
        "underline-offset": [{
          "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Text Transform
         * @see https://tailwindcss.com/docs/text-transform
         */
        "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
        /**
         * Text Overflow
         * @see https://tailwindcss.com/docs/text-overflow
         */
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        /**
         * Text Wrap
         * @see https://tailwindcss.com/docs/text-wrap
         */
        "text-wrap": [{
          text: ["wrap", "nowrap", "balance", "pretty"]
        }],
        /**
         * Text Indent
         * @see https://tailwindcss.com/docs/text-indent
         */
        indent: [{
          indent: scaleUnambiguousSpacing()
        }],
        /**
         * Tab Size
         * @see https://tailwindcss.com/docs/tab-size
         */
        "tab-size": [{
          tab: [isInteger, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Vertical Alignment
         * @see https://tailwindcss.com/docs/vertical-align
         */
        "vertical-align": [{
          align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Whitespace
         * @see https://tailwindcss.com/docs/whitespace
         */
        whitespace: [{
          whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
        }],
        /**
         * Word Break
         * @see https://tailwindcss.com/docs/word-break
         */
        break: [{
          break: ["normal", "words", "all", "keep"]
        }],
        /**
         * Overflow Wrap
         * @see https://tailwindcss.com/docs/overflow-wrap
         */
        wrap: [{
          wrap: ["break-word", "anywhere", "normal"]
        }],
        /**
         * Hyphens
         * @see https://tailwindcss.com/docs/hyphens
         */
        hyphens: [{
          hyphens: ["none", "manual", "auto"]
        }],
        /**
         * Content
         * @see https://tailwindcss.com/docs/content
         */
        content: [{
          content: ["none", isArbitraryVariable, isArbitraryValue]
        }],
        // -------------------
        // --- Backgrounds ---
        // -------------------
        /**
         * Background Attachment
         * @see https://tailwindcss.com/docs/background-attachment
         */
        "bg-attachment": [{
          bg: ["fixed", "local", "scroll"]
        }],
        /**
         * Background Clip
         * @see https://tailwindcss.com/docs/background-clip
         */
        "bg-clip": [{
          "bg-clip": ["border", "padding", "content", "text"]
        }],
        /**
         * Background Origin
         * @see https://tailwindcss.com/docs/background-origin
         */
        "bg-origin": [{
          "bg-origin": ["border", "padding", "content"]
        }],
        /**
         * Background Position
         * @see https://tailwindcss.com/docs/background-position
         */
        "bg-position": [{
          bg: scaleBgPosition()
        }],
        /**
         * Background Repeat
         * @see https://tailwindcss.com/docs/background-repeat
         */
        "bg-repeat": [{
          bg: scaleBgRepeat()
        }],
        /**
         * Background Size
         * @see https://tailwindcss.com/docs/background-size
         */
        "bg-size": [{
          bg: scaleBgSize()
        }],
        /**
         * Background Image
         * @see https://tailwindcss.com/docs/background-image
         */
        "bg-image": [{
          bg: ["none", {
            linear: [{
              to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
            }, isInteger, isArbitraryVariable, isArbitraryValue],
            radial: ["", isArbitraryVariable, isArbitraryValue],
            conic: [isInteger, isArbitraryVariable, isArbitraryValue]
          }, isArbitraryVariableImage, isArbitraryImage]
        }],
        /**
         * Background Color
         * @see https://tailwindcss.com/docs/background-color
         */
        "bg-color": [{
          bg: scaleColor()
        }],
        /**
         * Gradient Color Stops From Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-from-pos": [{
          from: scaleGradientStopPosition()
        }],
        /**
         * Gradient Color Stops Via Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-via-pos": [{
          via: scaleGradientStopPosition()
        }],
        /**
         * Gradient Color Stops To Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-to-pos": [{
          to: scaleGradientStopPosition()
        }],
        /**
         * Gradient Color Stops From
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-from": [{
          from: scaleColor()
        }],
        /**
         * Gradient Color Stops Via
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-via": [{
          via: scaleColor()
        }],
        /**
         * Gradient Color Stops To
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-to": [{
          to: scaleColor()
        }],
        // ---------------
        // --- Borders ---
        // ---------------
        /**
         * Border Radius
         * @see https://tailwindcss.com/docs/border-radius
         */
        rounded: [{
          rounded: scaleRadius()
        }],
        /**
         * Border Radius Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-s": [{
          "rounded-s": scaleRadius()
        }],
        /**
         * Border Radius End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-e": [{
          "rounded-e": scaleRadius()
        }],
        /**
         * Border Radius Top
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-t": [{
          "rounded-t": scaleRadius()
        }],
        /**
         * Border Radius Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-r": [{
          "rounded-r": scaleRadius()
        }],
        /**
         * Border Radius Bottom
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-b": [{
          "rounded-b": scaleRadius()
        }],
        /**
         * Border Radius Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-l": [{
          "rounded-l": scaleRadius()
        }],
        /**
         * Border Radius Start Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-ss": [{
          "rounded-ss": scaleRadius()
        }],
        /**
         * Border Radius Start End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-se": [{
          "rounded-se": scaleRadius()
        }],
        /**
         * Border Radius End End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-ee": [{
          "rounded-ee": scaleRadius()
        }],
        /**
         * Border Radius End Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-es": [{
          "rounded-es": scaleRadius()
        }],
        /**
         * Border Radius Top Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-tl": [{
          "rounded-tl": scaleRadius()
        }],
        /**
         * Border Radius Top Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-tr": [{
          "rounded-tr": scaleRadius()
        }],
        /**
         * Border Radius Bottom Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-br": [{
          "rounded-br": scaleRadius()
        }],
        /**
         * Border Radius Bottom Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-bl": [{
          "rounded-bl": scaleRadius()
        }],
        /**
         * Border Width
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w": [{
          border: scaleBorderWidth()
        }],
        /**
         * Border Width Inline
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-x": [{
          "border-x": scaleBorderWidth()
        }],
        /**
         * Border Width Block
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-y": [{
          "border-y": scaleBorderWidth()
        }],
        /**
         * Border Width Inline Start
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-s": [{
          "border-s": scaleBorderWidth()
        }],
        /**
         * Border Width Inline End
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-e": [{
          "border-e": scaleBorderWidth()
        }],
        /**
         * Border Width Block Start
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-bs": [{
          "border-bs": scaleBorderWidth()
        }],
        /**
         * Border Width Block End
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-be": [{
          "border-be": scaleBorderWidth()
        }],
        /**
         * Border Width Top
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-t": [{
          "border-t": scaleBorderWidth()
        }],
        /**
         * Border Width Right
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-r": [{
          "border-r": scaleBorderWidth()
        }],
        /**
         * Border Width Bottom
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-b": [{
          "border-b": scaleBorderWidth()
        }],
        /**
         * Border Width Left
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-l": [{
          "border-l": scaleBorderWidth()
        }],
        /**
         * Divide Width X
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-x": [{
          "divide-x": scaleBorderWidth()
        }],
        /**
         * Divide Width X Reverse
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-x-reverse": ["divide-x-reverse"],
        /**
         * Divide Width Y
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-y": [{
          "divide-y": scaleBorderWidth()
        }],
        /**
         * Divide Width Y Reverse
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-y-reverse": ["divide-y-reverse"],
        /**
         * Border Style
         * @see https://tailwindcss.com/docs/border-style
         */
        "border-style": [{
          border: [...scaleLineStyle(), "hidden", "none"]
        }],
        /**
         * Divide Style
         * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
         */
        "divide-style": [{
          divide: [...scaleLineStyle(), "hidden", "none"]
        }],
        /**
         * Border Color
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color": [{
          border: scaleColor()
        }],
        /**
         * Border Color Inline
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-x": [{
          "border-x": scaleColor()
        }],
        /**
         * Border Color Block
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-y": [{
          "border-y": scaleColor()
        }],
        /**
         * Border Color Inline Start
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-s": [{
          "border-s": scaleColor()
        }],
        /**
         * Border Color Inline End
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-e": [{
          "border-e": scaleColor()
        }],
        /**
         * Border Color Block Start
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-bs": [{
          "border-bs": scaleColor()
        }],
        /**
         * Border Color Block End
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-be": [{
          "border-be": scaleColor()
        }],
        /**
         * Border Color Top
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-t": [{
          "border-t": scaleColor()
        }],
        /**
         * Border Color Right
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-r": [{
          "border-r": scaleColor()
        }],
        /**
         * Border Color Bottom
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-b": [{
          "border-b": scaleColor()
        }],
        /**
         * Border Color Left
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-l": [{
          "border-l": scaleColor()
        }],
        /**
         * Divide Color
         * @see https://tailwindcss.com/docs/divide-color
         */
        "divide-color": [{
          divide: scaleColor()
        }],
        /**
         * Outline Style
         * @see https://tailwindcss.com/docs/outline-style
         */
        "outline-style": [{
          outline: [...scaleLineStyle(), "none", "hidden"]
        }],
        /**
         * Outline Offset
         * @see https://tailwindcss.com/docs/outline-offset
         */
        "outline-offset": [{
          "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Outline Width
         * @see https://tailwindcss.com/docs/outline-width
         */
        "outline-w": [{
          outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
        }],
        /**
         * Outline Color
         * @see https://tailwindcss.com/docs/outline-color
         */
        "outline-color": [{
          outline: scaleColor()
        }],
        // ---------------
        // --- Effects ---
        // ---------------
        /**
         * Box Shadow
         * @see https://tailwindcss.com/docs/box-shadow
         */
        shadow: [{
          shadow: [
            // Deprecated since Tailwind CSS v4.0.0
            "",
            "none",
            themeShadow,
            isArbitraryVariableShadow,
            isArbitraryShadow
          ]
        }],
        /**
         * Box Shadow Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
         */
        "shadow-color": [{
          shadow: scaleColor()
        }],
        /**
         * Inset Box Shadow
         * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
         */
        "inset-shadow": [{
          "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
        }],
        /**
         * Inset Box Shadow Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
         */
        "inset-shadow-color": [{
          "inset-shadow": scaleColor()
        }],
        /**
         * Ring Width
         * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
         */
        "ring-w": [{
          ring: scaleBorderWidth()
        }],
        /**
         * Ring Width Inset
         * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
         * @deprecated since Tailwind CSS v4.0.0
         * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
         */
        "ring-w-inset": ["ring-inset"],
        /**
         * Ring Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
         */
        "ring-color": [{
          ring: scaleColor()
        }],
        /**
         * Ring Offset Width
         * @see https://v3.tailwindcss.com/docs/ring-offset-width
         * @deprecated since Tailwind CSS v4.0.0
         * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
         */
        "ring-offset-w": [{
          "ring-offset": [isNumber, isArbitraryLength]
        }],
        /**
         * Ring Offset Color
         * @see https://v3.tailwindcss.com/docs/ring-offset-color
         * @deprecated since Tailwind CSS v4.0.0
         * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
         */
        "ring-offset-color": [{
          "ring-offset": scaleColor()
        }],
        /**
         * Inset Ring Width
         * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
         */
        "inset-ring-w": [{
          "inset-ring": scaleBorderWidth()
        }],
        /**
         * Inset Ring Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
         */
        "inset-ring-color": [{
          "inset-ring": scaleColor()
        }],
        /**
         * Text Shadow
         * @see https://tailwindcss.com/docs/text-shadow
         */
        "text-shadow": [{
          "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
        }],
        /**
         * Text Shadow Color
         * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
         */
        "text-shadow-color": [{
          "text-shadow": scaleColor()
        }],
        /**
         * Opacity
         * @see https://tailwindcss.com/docs/opacity
         */
        opacity: [{
          opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Mix Blend Mode
         * @see https://tailwindcss.com/docs/mix-blend-mode
         */
        "mix-blend": [{
          "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
        }],
        /**
         * Background Blend Mode
         * @see https://tailwindcss.com/docs/background-blend-mode
         */
        "bg-blend": [{
          "bg-blend": scaleBlendMode()
        }],
        /**
         * Mask Clip
         * @see https://tailwindcss.com/docs/mask-clip
         */
        "mask-clip": [{
          "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
        }, "mask-no-clip"],
        /**
         * Mask Composite
         * @see https://tailwindcss.com/docs/mask-composite
         */
        "mask-composite": [{
          mask: ["add", "subtract", "intersect", "exclude"]
        }],
        /**
         * Mask Image
         * @see https://tailwindcss.com/docs/mask-image
         */
        "mask-image-linear-pos": [{
          "mask-linear": [isNumber]
        }],
        "mask-image-linear-from-pos": [{
          "mask-linear-from": scaleMaskImagePosition()
        }],
        "mask-image-linear-to-pos": [{
          "mask-linear-to": scaleMaskImagePosition()
        }],
        "mask-image-linear-from-color": [{
          "mask-linear-from": scaleColor()
        }],
        "mask-image-linear-to-color": [{
          "mask-linear-to": scaleColor()
        }],
        "mask-image-t-from-pos": [{
          "mask-t-from": scaleMaskImagePosition()
        }],
        "mask-image-t-to-pos": [{
          "mask-t-to": scaleMaskImagePosition()
        }],
        "mask-image-t-from-color": [{
          "mask-t-from": scaleColor()
        }],
        "mask-image-t-to-color": [{
          "mask-t-to": scaleColor()
        }],
        "mask-image-r-from-pos": [{
          "mask-r-from": scaleMaskImagePosition()
        }],
        "mask-image-r-to-pos": [{
          "mask-r-to": scaleMaskImagePosition()
        }],
        "mask-image-r-from-color": [{
          "mask-r-from": scaleColor()
        }],
        "mask-image-r-to-color": [{
          "mask-r-to": scaleColor()
        }],
        "mask-image-b-from-pos": [{
          "mask-b-from": scaleMaskImagePosition()
        }],
        "mask-image-b-to-pos": [{
          "mask-b-to": scaleMaskImagePosition()
        }],
        "mask-image-b-from-color": [{
          "mask-b-from": scaleColor()
        }],
        "mask-image-b-to-color": [{
          "mask-b-to": scaleColor()
        }],
        "mask-image-l-from-pos": [{
          "mask-l-from": scaleMaskImagePosition()
        }],
        "mask-image-l-to-pos": [{
          "mask-l-to": scaleMaskImagePosition()
        }],
        "mask-image-l-from-color": [{
          "mask-l-from": scaleColor()
        }],
        "mask-image-l-to-color": [{
          "mask-l-to": scaleColor()
        }],
        "mask-image-x-from-pos": [{
          "mask-x-from": scaleMaskImagePosition()
        }],
        "mask-image-x-to-pos": [{
          "mask-x-to": scaleMaskImagePosition()
        }],
        "mask-image-x-from-color": [{
          "mask-x-from": scaleColor()
        }],
        "mask-image-x-to-color": [{
          "mask-x-to": scaleColor()
        }],
        "mask-image-y-from-pos": [{
          "mask-y-from": scaleMaskImagePosition()
        }],
        "mask-image-y-to-pos": [{
          "mask-y-to": scaleMaskImagePosition()
        }],
        "mask-image-y-from-color": [{
          "mask-y-from": scaleColor()
        }],
        "mask-image-y-to-color": [{
          "mask-y-to": scaleColor()
        }],
        "mask-image-radial": [{
          "mask-radial": [isArbitraryVariable, isArbitraryValue]
        }],
        "mask-image-radial-from-pos": [{
          "mask-radial-from": scaleMaskImagePosition()
        }],
        "mask-image-radial-to-pos": [{
          "mask-radial-to": scaleMaskImagePosition()
        }],
        "mask-image-radial-from-color": [{
          "mask-radial-from": scaleColor()
        }],
        "mask-image-radial-to-color": [{
          "mask-radial-to": scaleColor()
        }],
        "mask-image-radial-shape": [{
          "mask-radial": ["circle", "ellipse"]
        }],
        "mask-image-radial-size": [{
          "mask-radial": [{
            closest: ["side", "corner"],
            farthest: ["side", "corner"]
          }]
        }],
        "mask-image-radial-pos": [{
          "mask-radial-at": scalePosition()
        }],
        "mask-image-conic-pos": [{
          "mask-conic": [isNumber]
        }],
        "mask-image-conic-from-pos": [{
          "mask-conic-from": scaleMaskImagePosition()
        }],
        "mask-image-conic-to-pos": [{
          "mask-conic-to": scaleMaskImagePosition()
        }],
        "mask-image-conic-from-color": [{
          "mask-conic-from": scaleColor()
        }],
        "mask-image-conic-to-color": [{
          "mask-conic-to": scaleColor()
        }],
        /**
         * Mask Mode
         * @see https://tailwindcss.com/docs/mask-mode
         */
        "mask-mode": [{
          mask: ["alpha", "luminance", "match"]
        }],
        /**
         * Mask Origin
         * @see https://tailwindcss.com/docs/mask-origin
         */
        "mask-origin": [{
          "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
        }],
        /**
         * Mask Position
         * @see https://tailwindcss.com/docs/mask-position
         */
        "mask-position": [{
          mask: scaleBgPosition()
        }],
        /**
         * Mask Repeat
         * @see https://tailwindcss.com/docs/mask-repeat
         */
        "mask-repeat": [{
          mask: scaleBgRepeat()
        }],
        /**
         * Mask Size
         * @see https://tailwindcss.com/docs/mask-size
         */
        "mask-size": [{
          mask: scaleBgSize()
        }],
        /**
         * Mask Type
         * @see https://tailwindcss.com/docs/mask-type
         */
        "mask-type": [{
          "mask-type": ["alpha", "luminance"]
        }],
        /**
         * Mask Image
         * @see https://tailwindcss.com/docs/mask-image
         */
        "mask-image": [{
          mask: ["none", isArbitraryVariable, isArbitraryValue]
        }],
        // ---------------
        // --- Filters ---
        // ---------------
        /**
         * Filter
         * @see https://tailwindcss.com/docs/filter
         */
        filter: [{
          filter: [
            // Deprecated since Tailwind CSS v3.0.0
            "",
            "none",
            isArbitraryVariable,
            isArbitraryValue
          ]
        }],
        /**
         * Blur
         * @see https://tailwindcss.com/docs/blur
         */
        blur: [{
          blur: scaleBlur()
        }],
        /**
         * Brightness
         * @see https://tailwindcss.com/docs/brightness
         */
        brightness: [{
          brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Contrast
         * @see https://tailwindcss.com/docs/contrast
         */
        contrast: [{
          contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Drop Shadow
         * @see https://tailwindcss.com/docs/drop-shadow
         */
        "drop-shadow": [{
          "drop-shadow": [
            // Deprecated since Tailwind CSS v4.0.0
            "",
            "none",
            themeDropShadow,
            isArbitraryVariableShadow,
            isArbitraryShadow
          ]
        }],
        /**
         * Drop Shadow Color
         * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
         */
        "drop-shadow-color": [{
          "drop-shadow": scaleColor()
        }],
        /**
         * Grayscale
         * @see https://tailwindcss.com/docs/grayscale
         */
        grayscale: [{
          grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Hue Rotate
         * @see https://tailwindcss.com/docs/hue-rotate
         */
        "hue-rotate": [{
          "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Invert
         * @see https://tailwindcss.com/docs/invert
         */
        invert: [{
          invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Saturate
         * @see https://tailwindcss.com/docs/saturate
         */
        saturate: [{
          saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Sepia
         * @see https://tailwindcss.com/docs/sepia
         */
        sepia: [{
          sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Filter
         * @see https://tailwindcss.com/docs/backdrop-filter
         */
        "backdrop-filter": [{
          "backdrop-filter": [
            // Deprecated since Tailwind CSS v3.0.0
            "",
            "none",
            isArbitraryVariable,
            isArbitraryValue
          ]
        }],
        /**
         * Backdrop Blur
         * @see https://tailwindcss.com/docs/backdrop-blur
         */
        "backdrop-blur": [{
          "backdrop-blur": scaleBlur()
        }],
        /**
         * Backdrop Brightness
         * @see https://tailwindcss.com/docs/backdrop-brightness
         */
        "backdrop-brightness": [{
          "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Contrast
         * @see https://tailwindcss.com/docs/backdrop-contrast
         */
        "backdrop-contrast": [{
          "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Grayscale
         * @see https://tailwindcss.com/docs/backdrop-grayscale
         */
        "backdrop-grayscale": [{
          "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Hue Rotate
         * @see https://tailwindcss.com/docs/backdrop-hue-rotate
         */
        "backdrop-hue-rotate": [{
          "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Invert
         * @see https://tailwindcss.com/docs/backdrop-invert
         */
        "backdrop-invert": [{
          "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Opacity
         * @see https://tailwindcss.com/docs/backdrop-opacity
         */
        "backdrop-opacity": [{
          "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Saturate
         * @see https://tailwindcss.com/docs/backdrop-saturate
         */
        "backdrop-saturate": [{
          "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Sepia
         * @see https://tailwindcss.com/docs/backdrop-sepia
         */
        "backdrop-sepia": [{
          "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        // --------------
        // --- Tables ---
        // --------------
        /**
         * Border Collapse
         * @see https://tailwindcss.com/docs/border-collapse
         */
        "border-collapse": [{
          border: ["collapse", "separate"]
        }],
        /**
         * Border Spacing
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing": [{
          "border-spacing": scaleUnambiguousSpacing()
        }],
        /**
         * Border Spacing X
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing-x": [{
          "border-spacing-x": scaleUnambiguousSpacing()
        }],
        /**
         * Border Spacing Y
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing-y": [{
          "border-spacing-y": scaleUnambiguousSpacing()
        }],
        /**
         * Table Layout
         * @see https://tailwindcss.com/docs/table-layout
         */
        "table-layout": [{
          table: ["auto", "fixed"]
        }],
        /**
         * Caption Side
         * @see https://tailwindcss.com/docs/caption-side
         */
        caption: [{
          caption: ["top", "bottom"]
        }],
        // ---------------------------------
        // --- Transitions and Animation ---
        // ---------------------------------
        /**
         * Transition Property
         * @see https://tailwindcss.com/docs/transition-property
         */
        transition: [{
          transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Transition Behavior
         * @see https://tailwindcss.com/docs/transition-behavior
         */
        "transition-behavior": [{
          transition: ["normal", "discrete"]
        }],
        /**
         * Transition Duration
         * @see https://tailwindcss.com/docs/transition-duration
         */
        duration: [{
          duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Transition Timing Function
         * @see https://tailwindcss.com/docs/transition-timing-function
         */
        ease: [{
          ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Transition Delay
         * @see https://tailwindcss.com/docs/transition-delay
         */
        delay: [{
          delay: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Animation
         * @see https://tailwindcss.com/docs/animation
         */
        animate: [{
          animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
        }],
        // ------------------
        // --- Transforms ---
        // ------------------
        /**
         * Backface Visibility
         * @see https://tailwindcss.com/docs/backface-visibility
         */
        backface: [{
          backface: ["hidden", "visible"]
        }],
        /**
         * Perspective
         * @see https://tailwindcss.com/docs/perspective
         */
        perspective: [{
          perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Perspective Origin
         * @see https://tailwindcss.com/docs/perspective-origin
         */
        "perspective-origin": [{
          "perspective-origin": scalePositionWithArbitrary()
        }],
        /**
         * Rotate
         * @see https://tailwindcss.com/docs/rotate
         */
        rotate: [{
          rotate: scaleRotate()
        }],
        /**
         * Rotate X
         * @see https://tailwindcss.com/docs/rotate
         */
        "rotate-x": [{
          "rotate-x": scaleRotate()
        }],
        /**
         * Rotate Y
         * @see https://tailwindcss.com/docs/rotate
         */
        "rotate-y": [{
          "rotate-y": scaleRotate()
        }],
        /**
         * Rotate Z
         * @see https://tailwindcss.com/docs/rotate
         */
        "rotate-z": [{
          "rotate-z": scaleRotate()
        }],
        /**
         * Scale
         * @see https://tailwindcss.com/docs/scale
         */
        scale: [{
          scale: scaleScale()
        }],
        /**
         * Scale X
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-x": [{
          "scale-x": scaleScale()
        }],
        /**
         * Scale Y
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-y": [{
          "scale-y": scaleScale()
        }],
        /**
         * Scale Z
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-z": [{
          "scale-z": scaleScale()
        }],
        /**
         * Scale 3D
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-3d": ["scale-3d"],
        /**
         * Skew
         * @see https://tailwindcss.com/docs/skew
         */
        skew: [{
          skew: scaleSkew()
        }],
        /**
         * Skew X
         * @see https://tailwindcss.com/docs/skew
         */
        "skew-x": [{
          "skew-x": scaleSkew()
        }],
        /**
         * Skew Y
         * @see https://tailwindcss.com/docs/skew
         */
        "skew-y": [{
          "skew-y": scaleSkew()
        }],
        /**
         * Transform
         * @see https://tailwindcss.com/docs/transform
         */
        transform: [{
          transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
        }],
        /**
         * Transform Origin
         * @see https://tailwindcss.com/docs/transform-origin
         */
        "transform-origin": [{
          origin: scalePositionWithArbitrary()
        }],
        /**
         * Transform Style
         * @see https://tailwindcss.com/docs/transform-style
         */
        "transform-style": [{
          transform: ["3d", "flat"]
        }],
        /**
         * Translate
         * @see https://tailwindcss.com/docs/translate
         */
        translate: [{
          translate: scaleTranslate()
        }],
        /**
         * Translate X
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-x": [{
          "translate-x": scaleTranslate()
        }],
        /**
         * Translate Y
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-y": [{
          "translate-y": scaleTranslate()
        }],
        /**
         * Translate Z
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-z": [{
          "translate-z": scaleTranslate()
        }],
        /**
         * Translate None
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-none": ["translate-none"],
        /**
         * Zoom
         * @see https://tailwindcss.com/docs/zoom
         */
        zoom: [{
          zoom: [isInteger, isArbitraryVariable, isArbitraryValue]
        }],
        // ---------------------
        // --- Interactivity ---
        // ---------------------
        /**
         * Accent Color
         * @see https://tailwindcss.com/docs/accent-color
         */
        accent: [{
          accent: scaleColor()
        }],
        /**
         * Appearance
         * @see https://tailwindcss.com/docs/appearance
         */
        appearance: [{
          appearance: ["none", "auto"]
        }],
        /**
         * Caret Color
         * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
         */
        "caret-color": [{
          caret: scaleColor()
        }],
        /**
         * Color Scheme
         * @see https://tailwindcss.com/docs/color-scheme
         */
        "color-scheme": [{
          scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
        }],
        /**
         * Cursor
         * @see https://tailwindcss.com/docs/cursor
         */
        cursor: [{
          cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Field Sizing
         * @see https://tailwindcss.com/docs/field-sizing
         */
        "field-sizing": [{
          "field-sizing": ["fixed", "content"]
        }],
        /**
         * Pointer Events
         * @see https://tailwindcss.com/docs/pointer-events
         */
        "pointer-events": [{
          "pointer-events": ["auto", "none"]
        }],
        /**
         * Resize
         * @see https://tailwindcss.com/docs/resize
         */
        resize: [{
          resize: ["none", "", "y", "x"]
        }],
        /**
         * Scroll Behavior
         * @see https://tailwindcss.com/docs/scroll-behavior
         */
        "scroll-behavior": [{
          scroll: ["auto", "smooth"]
        }],
        /**
         * Scrollbar Thumb Color
         * @see https://tailwindcss.com/docs/scrollbar-color
         */
        "scrollbar-thumb-color": [{
          "scrollbar-thumb": scaleColor()
        }],
        /**
         * Scrollbar Track Color
         * @see https://tailwindcss.com/docs/scrollbar-color
         */
        "scrollbar-track-color": [{
          "scrollbar-track": scaleColor()
        }],
        /**
         * Scrollbar Gutter
         * @see https://tailwindcss.com/docs/scrollbar-gutter
         */
        "scrollbar-gutter": [{
          "scrollbar-gutter": ["auto", "stable", "both"]
        }],
        /**
         * Scrollbar Width
         * @see https://tailwindcss.com/docs/scrollbar-width
         */
        "scrollbar-w": [{
          scrollbar: ["auto", "thin", "none"]
        }],
        /**
         * Scroll Margin
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-m": [{
          "scroll-m": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Inline
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mx": [{
          "scroll-mx": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Block
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-my": [{
          "scroll-my": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Inline Start
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-ms": [{
          "scroll-ms": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Inline End
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-me": [{
          "scroll-me": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Block Start
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mbs": [{
          "scroll-mbs": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Block End
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mbe": [{
          "scroll-mbe": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Top
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mt": [{
          "scroll-mt": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Right
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mr": [{
          "scroll-mr": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Bottom
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mb": [{
          "scroll-mb": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Left
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-ml": [{
          "scroll-ml": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-p": [{
          "scroll-p": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Inline
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-px": [{
          "scroll-px": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Block
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-py": [{
          "scroll-py": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Inline Start
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-ps": [{
          "scroll-ps": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Inline End
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pe": [{
          "scroll-pe": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Block Start
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pbs": [{
          "scroll-pbs": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Block End
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pbe": [{
          "scroll-pbe": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Top
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pt": [{
          "scroll-pt": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Right
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pr": [{
          "scroll-pr": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Bottom
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pb": [{
          "scroll-pb": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Left
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pl": [{
          "scroll-pl": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Snap Align
         * @see https://tailwindcss.com/docs/scroll-snap-align
         */
        "snap-align": [{
          snap: ["start", "end", "center", "align-none"]
        }],
        /**
         * Scroll Snap Stop
         * @see https://tailwindcss.com/docs/scroll-snap-stop
         */
        "snap-stop": [{
          snap: ["normal", "always"]
        }],
        /**
         * Scroll Snap Type
         * @see https://tailwindcss.com/docs/scroll-snap-type
         */
        "snap-type": [{
          snap: ["none", "x", "y", "both"]
        }],
        /**
         * Scroll Snap Type Strictness
         * @see https://tailwindcss.com/docs/scroll-snap-type
         */
        "snap-strictness": [{
          snap: ["mandatory", "proximity"]
        }],
        /**
         * Touch Action
         * @see https://tailwindcss.com/docs/touch-action
         */
        touch: [{
          touch: ["auto", "none", "manipulation"]
        }],
        /**
         * Touch Action X
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-x": [{
          "touch-pan": ["x", "left", "right"]
        }],
        /**
         * Touch Action Y
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-y": [{
          "touch-pan": ["y", "up", "down"]
        }],
        /**
         * Touch Action Pinch Zoom
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-pz": ["touch-pinch-zoom"],
        /**
         * User Select
         * @see https://tailwindcss.com/docs/user-select
         */
        select: [{
          select: ["none", "text", "all", "auto"]
        }],
        /**
         * Will Change
         * @see https://tailwindcss.com/docs/will-change
         */
        "will-change": [{
          "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
        }],
        // -----------
        // --- SVG ---
        // -----------
        /**
         * Fill
         * @see https://tailwindcss.com/docs/fill
         */
        fill: [{
          fill: ["none", ...scaleColor()]
        }],
        /**
         * Stroke Width
         * @see https://tailwindcss.com/docs/stroke-width
         */
        "stroke-w": [{
          stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
        }],
        /**
         * Stroke
         * @see https://tailwindcss.com/docs/stroke
         */
        stroke: [{
          stroke: ["none", ...scaleColor()]
        }],
        // ---------------------
        // --- Accessibility ---
        // ---------------------
        /**
         * Forced Color Adjust
         * @see https://tailwindcss.com/docs/forced-color-adjust
         */
        "forced-color-adjust": [{
          "forced-color-adjust": ["auto", "none"]
        }]
      },
      conflictingClassGroups: {
        "container-named": ["container-type"],
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        translate: ["translate-x", "translate-y", "translate-none"],
        "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
        "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"]
      },
      conflictingClassGroupModifiers: {
        "font-size": ["leading"]
      },
      postfixLookupClassGroups: ["container-type"],
      orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
    };
  };
  var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);

  // lib/utils.ts
  function cn(...inputs) {
    return twMerge(clsx(inputs));
  }

  // components/answer-diff.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  function AnswerDiff({
    check,
    nearMiss = false,
    className
  }) {
    const slips = spellingSlips(check);
    const onlySpelling = check.verdict === "quase";
    const lead = onlySpelling || nearMiss ? {
      pt: onlySpelling ? "Quase! A ideia estava certa \u2014 s\xF3 a escrita escorregou." : "Quase! A ideia estava certa \u2014 v\xEA as palavras marcadas.",
      en: onlySpelling ? "Right answer \u2014 only the accents or capitals slipped." : "Right idea \u2014 check the marked words.",
      tone: "text-terra-dark"
    } : check.verdict === "incompleto" ? {
      pt: "Bom at\xE9 aqui \u2014 a resposta ficou a meio.",
      en: "Correct as far as it goes \u2014 the marked words are missing.",
      tone: "text-olive"
    } : null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: cn(
          "space-y-2 rounded-xl border border-sand bg-white/70 px-3 py-2.5",
          className
        ),
        children: [
          lead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: cn("text-sm font-semibold", lead.tone), children: lead.pt }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-ink-soft", children: lead.en })
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Row, { glyph: "\u2717", tone: "text-terra", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sr-only", children: "A tua resposta: " }),
              check.attempt.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Line,
                {
                  toks: check.attempt,
                  slips: slips.attempt,
                  side: "attempt",
                  className: "text-[15px] text-ink-soft"
                }
              ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-[15px] text-ink-faint italic", children: "Ficou em branco." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Row, { glyph: "\u2713", tone: "text-olive", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-2xs font-semibold tracking-wide text-olive uppercase", children: "Assim fica certo" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Line,
                {
                  toks: check.target,
                  slips: slips.target,
                  side: "target",
                  className: "font-display text-[16px] text-ink"
                }
              )
            ] })
          ] })
        ]
      }
    );
  }
  function Row({
    glyph,
    tone,
    children
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-[0.9rem_minmax(0,1fr)] gap-x-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": true, className: cn("text-sm leading-6", tone), children: glyph }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-w-0", children })
    ] });
  }
  function Line({
    toks,
    slips,
    side,
    className
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "p",
      {
        className: cn("flex flex-wrap items-baseline gap-x-1 leading-6", className),
        children: toks.map((tok, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "span",
          {
            className: cn(
              tokenClass(tok.status, side),
              // Right word, wrong accent or capital — a nudge, not a mark.
              slips.has(i) && "underline decoration-dotted underline-offset-4"
            ),
            children: tok.text
          },
          i
        ))
      }
    );
  }
  function tokenClass(status, side) {
    if (status === "same") return "";
    if (side === "attempt") {
      return status === "extra" ? "rounded bg-terra-pale px-1 text-terra-dark line-through decoration-terra-dark/60" : "rounded bg-terra-pale px-1 font-semibold text-terra-dark";
    }
    return "rounded bg-sage-light px-1 font-semibold text-ink";
  }

  // components/audio-button.tsx
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim());
  var import_jsx_runtime2 = __toESM(require_react_shim());
  function AudioButton({
    text: text7,
    entryId,
    quizId,
    className,
    label,
    onEnded,
    autoFocusPlay = false
  }) {
    const audioRef = (0, import_react.useRef)(null);
    const [status, setStatus] = (0, import_react.useState)(
      "idle"
    );
    const src = entryId ? `/api/tts?entry=${entryId}` : quizId ? `/api/tts?quiz=${quizId}` : `/api/tts?text=${encodeURIComponent(text7 ?? "")}`;
    async function play() {
      if (status === "playing") {
        audioRef.current?.pause();
        setStatus("idle");
        return;
      }
      setStatus("loading");
      try {
        if (!audioRef.current) {
          const a = new Audio(src);
          a.onended = () => {
            setStatus("idle");
            onEnded?.();
          };
          a.onerror = () => setStatus("error");
          audioRef.current = a;
        }
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setStatus("playing");
      } catch {
        setStatus("error");
      }
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "button",
      {
        type: "button",
        onClick: play,
        autoFocus: autoFocusPlay,
        title: status === "error" ? "\xC1udio indispon\xEDvel" : "Ouvir",
        className: cn(
          "tap-44 inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-sand bg-white/70 px-2.5 text-sm transition-colors hover:border-sage hover:bg-sage-pale",
          status === "playing" && "border-olive bg-sage-pale",
          status === "error" && "opacity-40",
          className
        ),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": true, children: status === "loading" ? "\u2026" : status === "playing" ? "\u23F8" : "\u{1F50A}" }),
          label ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-xs font-medium", children: label }) : null
        ]
      }
    );
  }

  // components/markdown.tsx
  init_define_import_meta_env();

  // node_modules/react-markdown/index.js
  init_define_import_meta_env();

  // node_modules/react-markdown/lib/index.js
  init_define_import_meta_env();

  // node_modules/devlop/lib/default.js
  init_define_import_meta_env();
  function ok() {
  }
  function unreachable() {
  }

  // node_modules/hast-util-to-jsx-runtime/index.js
  init_define_import_meta_env();

  // node_modules/hast-util-to-jsx-runtime/lib/index.js
  init_define_import_meta_env();

  // node_modules/comma-separated-tokens/index.js
  init_define_import_meta_env();
  function stringify(values, options) {
    const settings = options || {};
    const input = values[values.length - 1] === "" ? [...values, ""] : values;
    return input.join(
      (settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")
    ).trim();
  }

  // node_modules/estree-util-is-identifier-name/index.js
  init_define_import_meta_env();

  // node_modules/estree-util-is-identifier-name/lib/index.js
  init_define_import_meta_env();
  var nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
  var nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
  var emptyOptions = {};
  function name(name2, options) {
    const settings = options || emptyOptions;
    const re2 = settings.jsx ? nameReJsx : nameRe;
    return re2.test(name2);
  }

  // node_modules/hast-util-whitespace/index.js
  init_define_import_meta_env();

  // node_modules/hast-util-whitespace/lib/index.js
  init_define_import_meta_env();
  var re = /[ \t\n\f\r]/g;
  function whitespace(thing) {
    return typeof thing === "object" ? thing.type === "text" ? empty(thing.value) : false : empty(thing);
  }
  function empty(value) {
    return value.replace(re, "") === "";
  }

  // node_modules/property-information/index.js
  init_define_import_meta_env();

  // node_modules/property-information/lib/util/merge.js
  init_define_import_meta_env();

  // node_modules/property-information/lib/util/schema.js
  init_define_import_meta_env();
  var Schema = class {
    /**
     * @param {SchemaType['property']} property
     *   Property.
     * @param {SchemaType['normal']} normal
     *   Normal.
     * @param {Space | undefined} [space]
     *   Space.
     * @returns
     *   Schema.
     */
    constructor(property, normal, space2) {
      this.normal = normal;
      this.property = property;
      if (space2) {
        this.space = space2;
      }
    }
  };
  Schema.prototype.normal = {};
  Schema.prototype.property = {};
  Schema.prototype.space = void 0;

  // node_modules/property-information/lib/util/merge.js
  function merge(definitions, space2) {
    const property = {};
    const normal = {};
    for (const definition3 of definitions) {
      Object.assign(property, definition3.property);
      Object.assign(normal, definition3.normal);
    }
    return new Schema(property, normal, space2);
  }

  // node_modules/property-information/lib/aria.js
  init_define_import_meta_env();

  // node_modules/property-information/lib/util/create.js
  init_define_import_meta_env();

  // node_modules/property-information/lib/normalize.js
  init_define_import_meta_env();
  function normalize(value) {
    return value.toLowerCase();
  }

  // node_modules/property-information/lib/util/defined-info.js
  init_define_import_meta_env();

  // node_modules/property-information/lib/util/info.js
  init_define_import_meta_env();
  var Info = class {
    /**
     * @param {string} property
     *   Property.
     * @param {string} attribute
     *   Attribute.
     * @returns
     *   Info.
     */
    constructor(property, attribute) {
      this.attribute = attribute;
      this.property = property;
    }
  };
  Info.prototype.attribute = "";
  Info.prototype.booleanish = false;
  Info.prototype.boolean = false;
  Info.prototype.commaOrSpaceSeparated = false;
  Info.prototype.commaSeparated = false;
  Info.prototype.defined = false;
  Info.prototype.mustUseProperty = false;
  Info.prototype.number = false;
  Info.prototype.overloadedBoolean = false;
  Info.prototype.property = "";
  Info.prototype.spaceSeparated = false;
  Info.prototype.space = void 0;

  // node_modules/property-information/lib/util/types.js
  var types_exports = {};
  __export(types_exports, {
    boolean: () => boolean,
    booleanish: () => booleanish,
    commaOrSpaceSeparated: () => commaOrSpaceSeparated,
    commaSeparated: () => commaSeparated,
    number: () => number,
    overloadedBoolean: () => overloadedBoolean,
    spaceSeparated: () => spaceSeparated
  });
  init_define_import_meta_env();
  var powers = 0;
  var boolean = increment();
  var booleanish = increment();
  var overloadedBoolean = increment();
  var number = increment();
  var spaceSeparated = increment();
  var commaSeparated = increment();
  var commaOrSpaceSeparated = increment();
  function increment() {
    return 2 ** ++powers;
  }

  // node_modules/property-information/lib/util/defined-info.js
  var checks = (
    /** @type {ReadonlyArray<keyof typeof types>} */
    Object.keys(types_exports)
  );
  var DefinedInfo = class extends Info {
    /**
     * @constructor
     * @param {string} property
     *   Property.
     * @param {string} attribute
     *   Attribute.
     * @param {number | null | undefined} [mask]
     *   Mask.
     * @param {Space | undefined} [space]
     *   Space.
     * @returns
     *   Info.
     */
    constructor(property, attribute, mask, space2) {
      let index2 = -1;
      super(property, attribute);
      mark(this, "space", space2);
      if (typeof mask === "number") {
        while (++index2 < checks.length) {
          const check = checks[index2];
          mark(this, checks[index2], (mask & types_exports[check]) === types_exports[check]);
        }
      }
    }
  };
  DefinedInfo.prototype.defined = true;
  function mark(values, key, value) {
    if (value) {
      values[key] = value;
    }
  }

  // node_modules/property-information/lib/util/create.js
  function create(definition3) {
    const properties = {};
    const normals = {};
    for (const [property, value] of Object.entries(definition3.properties)) {
      const info = new DefinedInfo(
        property,
        definition3.transform(definition3.attributes || {}, property),
        value,
        definition3.space
      );
      if (definition3.mustUseProperty && definition3.mustUseProperty.includes(property)) {
        info.mustUseProperty = true;
      }
      properties[property] = info;
      normals[normalize(property)] = property;
      normals[normalize(info.attribute)] = property;
    }
    return new Schema(properties, normals, definition3.space);
  }

  // node_modules/property-information/lib/aria.js
  var aria = create({
    properties: {
      ariaActiveDescendant: null,
      ariaAtomic: booleanish,
      ariaAutoComplete: null,
      ariaBusy: booleanish,
      ariaChecked: booleanish,
      ariaColCount: number,
      ariaColIndex: number,
      ariaColSpan: number,
      ariaControls: spaceSeparated,
      ariaCurrent: null,
      ariaDescribedBy: spaceSeparated,
      ariaDetails: null,
      ariaDisabled: booleanish,
      ariaDropEffect: spaceSeparated,
      ariaErrorMessage: null,
      ariaExpanded: booleanish,
      ariaFlowTo: spaceSeparated,
      ariaGrabbed: booleanish,
      ariaHasPopup: null,
      ariaHidden: booleanish,
      ariaInvalid: null,
      ariaKeyShortcuts: null,
      ariaLabel: null,
      ariaLabelledBy: spaceSeparated,
      ariaLevel: number,
      ariaLive: null,
      ariaModal: booleanish,
      ariaMultiLine: booleanish,
      ariaMultiSelectable: booleanish,
      ariaOrientation: null,
      ariaOwns: spaceSeparated,
      ariaPlaceholder: null,
      ariaPosInSet: number,
      ariaPressed: booleanish,
      ariaReadOnly: booleanish,
      ariaRelevant: null,
      ariaRequired: booleanish,
      ariaRoleDescription: spaceSeparated,
      ariaRowCount: number,
      ariaRowIndex: number,
      ariaRowSpan: number,
      ariaSelected: booleanish,
      ariaSetSize: number,
      ariaSort: null,
      ariaValueMax: number,
      ariaValueMin: number,
      ariaValueNow: number,
      ariaValueText: null,
      role: null
    },
    transform(_, property) {
      return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
    }
  });

  // node_modules/property-information/lib/html.js
  init_define_import_meta_env();

  // node_modules/property-information/lib/util/case-insensitive-transform.js
  init_define_import_meta_env();

  // node_modules/property-information/lib/util/case-sensitive-transform.js
  init_define_import_meta_env();
  function caseSensitiveTransform(attributes, attribute) {
    return attribute in attributes ? attributes[attribute] : attribute;
  }

  // node_modules/property-information/lib/util/case-insensitive-transform.js
  function caseInsensitiveTransform(attributes, property) {
    return caseSensitiveTransform(attributes, property.toLowerCase());
  }

  // node_modules/property-information/lib/html.js
  var html = create({
    attributes: {
      acceptcharset: "accept-charset",
      classname: "class",
      htmlfor: "for",
      httpequiv: "http-equiv"
    },
    mustUseProperty: ["checked", "multiple", "muted", "selected"],
    properties: {
      // Standard Properties.
      abbr: null,
      accept: commaSeparated,
      acceptCharset: spaceSeparated,
      accessKey: spaceSeparated,
      action: null,
      allow: null,
      allowFullScreen: boolean,
      allowPaymentRequest: boolean,
      allowUserMedia: boolean,
      alpha: boolean,
      alt: null,
      as: null,
      async: boolean,
      autoCapitalize: null,
      autoComplete: spaceSeparated,
      autoFocus: boolean,
      autoPlay: boolean,
      blocking: spaceSeparated,
      capture: null,
      charSet: null,
      checked: boolean,
      cite: null,
      className: spaceSeparated,
      closedBy: null,
      colorSpace: null,
      cols: number,
      colSpan: number,
      command: null,
      commandFor: null,
      content: null,
      contentEditable: booleanish,
      controls: boolean,
      controlsList: spaceSeparated,
      coords: number | commaSeparated,
      crossOrigin: null,
      data: null,
      dateTime: null,
      decoding: null,
      default: boolean,
      defer: boolean,
      dir: null,
      dirName: null,
      disabled: boolean,
      download: overloadedBoolean,
      draggable: booleanish,
      encType: null,
      enterKeyHint: null,
      fetchPriority: null,
      form: null,
      formAction: null,
      formEncType: null,
      formMethod: null,
      formNoValidate: boolean,
      formTarget: null,
      headers: spaceSeparated,
      height: number,
      hidden: overloadedBoolean,
      high: number,
      href: null,
      hrefLang: null,
      htmlFor: spaceSeparated,
      httpEquiv: spaceSeparated,
      id: null,
      imageSizes: null,
      imageSrcSet: null,
      inert: boolean,
      inputMode: null,
      integrity: null,
      is: null,
      isMap: boolean,
      itemId: null,
      itemProp: spaceSeparated,
      itemRef: spaceSeparated,
      itemScope: boolean,
      itemType: spaceSeparated,
      kind: null,
      label: null,
      lang: null,
      language: null,
      list: null,
      loading: null,
      loop: boolean,
      low: number,
      manifest: null,
      max: null,
      maxLength: number,
      media: null,
      method: null,
      min: null,
      minLength: number,
      multiple: boolean,
      muted: boolean,
      name: null,
      nonce: null,
      noModule: boolean,
      noValidate: boolean,
      onAbort: null,
      onAfterPrint: null,
      onAuxClick: null,
      onBeforeMatch: null,
      onBeforePrint: null,
      onBeforeToggle: null,
      onBeforeUnload: null,
      onBlur: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onContextLost: null,
      onContextMenu: null,
      onContextRestored: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFormData: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLanguageChange: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadEnd: null,
      onLoadStart: null,
      onMessage: null,
      onMessageError: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRejectionHandled: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onScrollEnd: null,
      onSecurityPolicyViolation: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onSlotChange: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnhandledRejection: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onWheel: null,
      open: boolean,
      optimum: number,
      pattern: null,
      ping: spaceSeparated,
      placeholder: null,
      playsInline: boolean,
      popover: null,
      popoverTarget: null,
      popoverTargetAction: null,
      poster: null,
      preload: null,
      readOnly: boolean,
      referrerPolicy: null,
      rel: spaceSeparated,
      required: boolean,
      reversed: boolean,
      rows: number,
      rowSpan: number,
      sandbox: spaceSeparated,
      scope: null,
      scoped: boolean,
      seamless: boolean,
      selected: boolean,
      shadowRootClonable: boolean,
      shadowRootCustomElementRegistry: boolean,
      shadowRootDelegatesFocus: boolean,
      shadowRootMode: null,
      shadowRootSerializable: boolean,
      shape: null,
      size: number,
      sizes: null,
      slot: null,
      span: number,
      spellCheck: booleanish,
      src: null,
      srcDoc: null,
      srcLang: null,
      srcSet: null,
      start: number,
      step: null,
      style: null,
      tabIndex: number,
      target: null,
      title: null,
      translate: null,
      type: null,
      typeMustMatch: boolean,
      useMap: null,
      value: booleanish,
      width: number,
      wrap: null,
      writingSuggestions: null,
      // Legacy.
      // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
      align: null,
      // Several. Use CSS `text-align` instead,
      aLink: null,
      // `<body>`. Use CSS `a:active {color}` instead
      archive: spaceSeparated,
      // `<object>`. List of URIs to archives
      axis: null,
      // `<td>` and `<th>`. Use `scope` on `<th>`
      background: null,
      // `<body>`. Use CSS `background-image` instead
      bgColor: null,
      // `<body>` and table elements. Use CSS `background-color` instead
      border: number,
      // `<table>`. Use CSS `border-width` instead,
      borderColor: null,
      // `<table>`. Use CSS `border-color` instead,
      bottomMargin: number,
      // `<body>`
      cellPadding: null,
      // `<table>`
      cellSpacing: null,
      // `<table>`
      char: null,
      // Several table elements. When `align=char`, sets the character to align on
      charOff: null,
      // Several table elements. When `char`, offsets the alignment
      classId: null,
      // `<object>`
      clear: null,
      // `<br>`. Use CSS `clear` instead
      code: null,
      // `<object>`
      codeBase: null,
      // `<object>`
      codeType: null,
      // `<object>`
      color: null,
      // `<font>` and `<hr>`. Use CSS instead
      compact: boolean,
      // Lists. Use CSS to reduce space between items instead
      declare: boolean,
      // `<object>`
      event: null,
      // `<script>`
      face: null,
      // `<font>`. Use CSS instead
      frame: null,
      // `<table>`
      frameBorder: null,
      // `<iframe>`. Use CSS `border` instead
      hSpace: number,
      // `<img>` and `<object>`
      leftMargin: number,
      // `<body>`
      link: null,
      // `<body>`. Use CSS `a:link {color: *}` instead
      longDesc: null,
      // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
      lowSrc: null,
      // `<img>`. Use a `<picture>`
      marginHeight: number,
      // `<body>`
      marginWidth: number,
      // `<body>`
      noResize: boolean,
      // `<frame>`
      noHref: boolean,
      // `<area>`. Use no href instead of an explicit `nohref`
      noShade: boolean,
      // `<hr>`. Use background-color and height instead of borders
      noWrap: boolean,
      // `<td>` and `<th>`
      object: null,
      // `<applet>`
      profile: null,
      // `<head>`
      prompt: null,
      // `<isindex>`
      rev: null,
      // `<link>`
      rightMargin: number,
      // `<body>`
      rules: null,
      // `<table>`
      scheme: null,
      // `<meta>`
      scrolling: booleanish,
      // `<frame>`. Use overflow in the child context
      standby: null,
      // `<object>`
      summary: null,
      // `<table>`
      text: null,
      // `<body>`. Use CSS `color` instead
      topMargin: number,
      // `<body>`
      valueType: null,
      // `<param>`
      version: null,
      // `<html>`. Use a doctype.
      vAlign: null,
      // Several. Use CSS `vertical-align` instead
      vLink: null,
      // `<body>`. Use CSS `a:visited {color}` instead
      vSpace: number,
      // `<img>` and `<object>`
      // Non-standard Properties.
      allowTransparency: null,
      autoCorrect: null,
      autoSave: null,
      credentialless: boolean,
      disablePictureInPicture: boolean,
      disableRemotePlayback: boolean,
      exportParts: commaSeparated,
      part: spaceSeparated,
      prefix: null,
      property: null,
      results: number,
      security: null,
      unselectable: null
    },
    space: "html",
    transform: caseInsensitiveTransform
  });

  // node_modules/property-information/lib/svg.js
  init_define_import_meta_env();
  var svg = create({
    attributes: {
      accentHeight: "accent-height",
      alignmentBaseline: "alignment-baseline",
      arabicForm: "arabic-form",
      baselineShift: "baseline-shift",
      capHeight: "cap-height",
      className: "class",
      clipPath: "clip-path",
      clipRule: "clip-rule",
      colorInterpolation: "color-interpolation",
      colorInterpolationFilters: "color-interpolation-filters",
      colorProfile: "color-profile",
      colorRendering: "color-rendering",
      crossOrigin: "crossorigin",
      dataType: "datatype",
      dominantBaseline: "dominant-baseline",
      enableBackground: "enable-background",
      fillOpacity: "fill-opacity",
      fillRule: "fill-rule",
      floodColor: "flood-color",
      floodOpacity: "flood-opacity",
      fontFamily: "font-family",
      fontSize: "font-size",
      fontSizeAdjust: "font-size-adjust",
      fontStretch: "font-stretch",
      fontStyle: "font-style",
      fontVariant: "font-variant",
      fontWeight: "font-weight",
      glyphName: "glyph-name",
      glyphOrientationHorizontal: "glyph-orientation-horizontal",
      glyphOrientationVertical: "glyph-orientation-vertical",
      hrefLang: "hreflang",
      horizAdvX: "horiz-adv-x",
      horizOriginX: "horiz-origin-x",
      horizOriginY: "horiz-origin-y",
      imageRendering: "image-rendering",
      letterSpacing: "letter-spacing",
      lightingColor: "lighting-color",
      markerEnd: "marker-end",
      markerMid: "marker-mid",
      markerStart: "marker-start",
      maskType: "mask-type",
      navDown: "nav-down",
      navDownLeft: "nav-down-left",
      navDownRight: "nav-down-right",
      navLeft: "nav-left",
      navNext: "nav-next",
      navPrev: "nav-prev",
      navRight: "nav-right",
      navUp: "nav-up",
      navUpLeft: "nav-up-left",
      navUpRight: "nav-up-right",
      onAbort: "onabort",
      onActivate: "onactivate",
      onAfterPrint: "onafterprint",
      onBeforePrint: "onbeforeprint",
      onBegin: "onbegin",
      onCancel: "oncancel",
      onCanPlay: "oncanplay",
      onCanPlayThrough: "oncanplaythrough",
      onChange: "onchange",
      onClick: "onclick",
      onClose: "onclose",
      onCopy: "oncopy",
      onCueChange: "oncuechange",
      onCut: "oncut",
      onDblClick: "ondblclick",
      onDrag: "ondrag",
      onDragEnd: "ondragend",
      onDragEnter: "ondragenter",
      onDragExit: "ondragexit",
      onDragLeave: "ondragleave",
      onDragOver: "ondragover",
      onDragStart: "ondragstart",
      onDrop: "ondrop",
      onDurationChange: "ondurationchange",
      onEmptied: "onemptied",
      onEnd: "onend",
      onEnded: "onended",
      onError: "onerror",
      onFocus: "onfocus",
      onFocusIn: "onfocusin",
      onFocusOut: "onfocusout",
      onHashChange: "onhashchange",
      onInput: "oninput",
      onInvalid: "oninvalid",
      onKeyDown: "onkeydown",
      onKeyPress: "onkeypress",
      onKeyUp: "onkeyup",
      onLoad: "onload",
      onLoadedData: "onloadeddata",
      onLoadedMetadata: "onloadedmetadata",
      onLoadStart: "onloadstart",
      onMessage: "onmessage",
      onMouseDown: "onmousedown",
      onMouseEnter: "onmouseenter",
      onMouseLeave: "onmouseleave",
      onMouseMove: "onmousemove",
      onMouseOut: "onmouseout",
      onMouseOver: "onmouseover",
      onMouseUp: "onmouseup",
      onMouseWheel: "onmousewheel",
      onOffline: "onoffline",
      onOnline: "ononline",
      onPageHide: "onpagehide",
      onPageShow: "onpageshow",
      onPaste: "onpaste",
      onPause: "onpause",
      onPlay: "onplay",
      onPlaying: "onplaying",
      onPopState: "onpopstate",
      onProgress: "onprogress",
      onRateChange: "onratechange",
      onRepeat: "onrepeat",
      onReset: "onreset",
      onResize: "onresize",
      onScroll: "onscroll",
      onSeeked: "onseeked",
      onSeeking: "onseeking",
      onSelect: "onselect",
      onShow: "onshow",
      onStalled: "onstalled",
      onStorage: "onstorage",
      onSubmit: "onsubmit",
      onSuspend: "onsuspend",
      onTimeUpdate: "ontimeupdate",
      onToggle: "ontoggle",
      onUnload: "onunload",
      onVolumeChange: "onvolumechange",
      onWaiting: "onwaiting",
      onZoom: "onzoom",
      overlinePosition: "overline-position",
      overlineThickness: "overline-thickness",
      paintOrder: "paint-order",
      panose1: "panose-1",
      pointerEvents: "pointer-events",
      referrerPolicy: "referrerpolicy",
      renderingIntent: "rendering-intent",
      shapeRendering: "shape-rendering",
      stopColor: "stop-color",
      stopOpacity: "stop-opacity",
      strikethroughPosition: "strikethrough-position",
      strikethroughThickness: "strikethrough-thickness",
      strokeDashArray: "stroke-dasharray",
      strokeDashOffset: "stroke-dashoffset",
      strokeLineCap: "stroke-linecap",
      strokeLineJoin: "stroke-linejoin",
      strokeMiterLimit: "stroke-miterlimit",
      strokeOpacity: "stroke-opacity",
      strokeWidth: "stroke-width",
      tabIndex: "tabindex",
      textAnchor: "text-anchor",
      textDecoration: "text-decoration",
      textRendering: "text-rendering",
      transformOrigin: "transform-origin",
      typeOf: "typeof",
      underlinePosition: "underline-position",
      underlineThickness: "underline-thickness",
      unicodeBidi: "unicode-bidi",
      unicodeRange: "unicode-range",
      unitsPerEm: "units-per-em",
      vAlphabetic: "v-alphabetic",
      vHanging: "v-hanging",
      vIdeographic: "v-ideographic",
      vMathematical: "v-mathematical",
      vectorEffect: "vector-effect",
      vertAdvY: "vert-adv-y",
      vertOriginX: "vert-origin-x",
      vertOriginY: "vert-origin-y",
      wordSpacing: "word-spacing",
      writingMode: "writing-mode",
      xHeight: "x-height",
      // These were camelcased in Tiny. Now lowercased in SVG 2
      playbackOrder: "playbackorder",
      timelineBegin: "timelinebegin"
    },
    properties: {
      about: commaOrSpaceSeparated,
      accentHeight: number,
      accumulate: null,
      additive: null,
      alignmentBaseline: null,
      alphabetic: number,
      amplitude: number,
      arabicForm: null,
      ascent: number,
      attributeName: null,
      attributeType: null,
      azimuth: number,
      bandwidth: null,
      baselineShift: null,
      baseFrequency: null,
      baseProfile: null,
      bbox: null,
      begin: null,
      bias: number,
      by: null,
      calcMode: null,
      capHeight: number,
      className: spaceSeparated,
      clip: null,
      clipPath: null,
      clipPathUnits: null,
      clipRule: null,
      color: null,
      colorInterpolation: null,
      colorInterpolationFilters: null,
      colorProfile: null,
      colorRendering: null,
      content: null,
      contentScriptType: null,
      contentStyleType: null,
      crossOrigin: null,
      cursor: null,
      cx: null,
      cy: null,
      d: null,
      dataType: null,
      defaultAction: null,
      descent: number,
      diffuseConstant: number,
      direction: null,
      display: null,
      dur: null,
      divisor: number,
      dominantBaseline: null,
      download: boolean,
      dx: null,
      dy: null,
      edgeMode: null,
      editable: null,
      elevation: number,
      enableBackground: null,
      end: null,
      event: null,
      exponent: number,
      externalResourcesRequired: null,
      fill: null,
      fillOpacity: number,
      fillRule: null,
      filter: null,
      filterRes: null,
      filterUnits: null,
      floodColor: null,
      floodOpacity: null,
      focusable: null,
      focusHighlight: null,
      fontFamily: null,
      fontSize: null,
      fontSizeAdjust: null,
      fontStretch: null,
      fontStyle: null,
      fontVariant: null,
      fontWeight: null,
      format: null,
      fr: null,
      from: null,
      fx: null,
      fy: null,
      g1: commaSeparated,
      g2: commaSeparated,
      glyphName: commaSeparated,
      glyphOrientationHorizontal: null,
      glyphOrientationVertical: null,
      glyphRef: null,
      gradientTransform: null,
      gradientUnits: null,
      handler: null,
      hanging: number,
      hatchContentUnits: null,
      hatchUnits: null,
      height: null,
      href: null,
      hrefLang: null,
      horizAdvX: number,
      horizOriginX: number,
      horizOriginY: number,
      id: null,
      ideographic: number,
      imageRendering: null,
      initialVisibility: null,
      in: null,
      in2: null,
      intercept: number,
      k: number,
      k1: number,
      k2: number,
      k3: number,
      k4: number,
      kernelMatrix: commaOrSpaceSeparated,
      kernelUnitLength: null,
      keyPoints: null,
      // SEMI_COLON_SEPARATED
      keySplines: null,
      // SEMI_COLON_SEPARATED
      keyTimes: null,
      // SEMI_COLON_SEPARATED
      kerning: null,
      lang: null,
      lengthAdjust: null,
      letterSpacing: null,
      lightingColor: null,
      limitingConeAngle: number,
      local: null,
      markerEnd: null,
      markerMid: null,
      markerStart: null,
      markerHeight: null,
      markerUnits: null,
      markerWidth: null,
      mask: null,
      maskContentUnits: null,
      maskType: null,
      maskUnits: null,
      mathematical: null,
      max: null,
      media: null,
      mediaCharacterEncoding: null,
      mediaContentEncodings: null,
      mediaSize: number,
      mediaTime: null,
      method: null,
      min: null,
      mode: null,
      name: null,
      navDown: null,
      navDownLeft: null,
      navDownRight: null,
      navLeft: null,
      navNext: null,
      navPrev: null,
      navRight: null,
      navUp: null,
      navUpLeft: null,
      navUpRight: null,
      numOctaves: null,
      observer: null,
      offset: null,
      onAbort: null,
      onActivate: null,
      onAfterPrint: null,
      onBeforePrint: null,
      onBegin: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnd: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFocusIn: null,
      onFocusOut: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadStart: null,
      onMessage: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onMouseWheel: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRepeat: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onShow: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onZoom: null,
      opacity: null,
      operator: null,
      order: null,
      orient: null,
      orientation: null,
      origin: null,
      overflow: null,
      overlay: null,
      overlinePosition: number,
      overlineThickness: number,
      paintOrder: null,
      panose1: null,
      path: null,
      pathLength: number,
      patternContentUnits: null,
      patternTransform: null,
      patternUnits: null,
      phase: null,
      ping: spaceSeparated,
      pitch: null,
      playbackOrder: null,
      pointerEvents: null,
      points: null,
      pointsAtX: number,
      pointsAtY: number,
      pointsAtZ: number,
      preserveAlpha: null,
      preserveAspectRatio: null,
      primitiveUnits: null,
      propagate: null,
      property: commaOrSpaceSeparated,
      r: null,
      radius: null,
      referrerPolicy: null,
      refX: null,
      refY: null,
      rel: commaOrSpaceSeparated,
      rev: commaOrSpaceSeparated,
      renderingIntent: null,
      repeatCount: null,
      repeatDur: null,
      requiredExtensions: commaOrSpaceSeparated,
      requiredFeatures: commaOrSpaceSeparated,
      requiredFonts: commaOrSpaceSeparated,
      requiredFormats: commaOrSpaceSeparated,
      resource: null,
      restart: null,
      result: null,
      rotate: null,
      rx: null,
      ry: null,
      scale: null,
      seed: null,
      shapeRendering: null,
      side: null,
      slope: null,
      snapshotTime: null,
      specularConstant: number,
      specularExponent: number,
      spreadMethod: null,
      spacing: null,
      startOffset: null,
      stdDeviation: null,
      stemh: null,
      stemv: null,
      stitchTiles: null,
      stopColor: null,
      stopOpacity: null,
      strikethroughPosition: number,
      strikethroughThickness: number,
      string: null,
      stroke: null,
      strokeDashArray: commaOrSpaceSeparated,
      strokeDashOffset: null,
      strokeLineCap: null,
      strokeLineJoin: null,
      strokeMiterLimit: number,
      strokeOpacity: number,
      strokeWidth: null,
      style: null,
      surfaceScale: number,
      syncBehavior: null,
      syncBehaviorDefault: null,
      syncMaster: null,
      syncTolerance: null,
      syncToleranceDefault: null,
      systemLanguage: commaOrSpaceSeparated,
      tabIndex: number,
      tableValues: null,
      target: null,
      targetX: number,
      targetY: number,
      textAnchor: null,
      textDecoration: null,
      textRendering: null,
      textLength: null,
      timelineBegin: null,
      title: null,
      transformBehavior: null,
      type: null,
      typeOf: commaOrSpaceSeparated,
      to: null,
      transform: null,
      transformOrigin: null,
      u1: null,
      u2: null,
      underlinePosition: number,
      underlineThickness: number,
      unicode: null,
      unicodeBidi: null,
      unicodeRange: null,
      unitsPerEm: number,
      values: null,
      vAlphabetic: number,
      vMathematical: number,
      vectorEffect: null,
      vHanging: number,
      vIdeographic: number,
      version: null,
      vertAdvY: number,
      vertOriginX: number,
      vertOriginY: number,
      viewBox: null,
      viewTarget: null,
      visibility: null,
      width: null,
      widths: null,
      wordSpacing: null,
      writingMode: null,
      x: null,
      x1: null,
      x2: null,
      xChannelSelector: null,
      xHeight: number,
      y: null,
      y1: null,
      y2: null,
      yChannelSelector: null,
      z: null,
      zoomAndPan: null
    },
    space: "svg",
    transform: caseSensitiveTransform
  });

  // node_modules/property-information/lib/xlink.js
  init_define_import_meta_env();
  var xlink = create({
    properties: {
      xLinkActuate: null,
      xLinkArcRole: null,
      xLinkHref: null,
      xLinkRole: null,
      xLinkShow: null,
      xLinkTitle: null,
      xLinkType: null
    },
    space: "xlink",
    transform(_, property) {
      return "xlink:" + property.slice(5).toLowerCase();
    }
  });

  // node_modules/property-information/lib/xmlns.js
  init_define_import_meta_env();
  var xmlns = create({
    attributes: { xmlnsxlink: "xmlns:xlink" },
    properties: { xmlnsXLink: null, xmlns: null },
    space: "xmlns",
    transform: caseInsensitiveTransform
  });

  // node_modules/property-information/lib/xml.js
  init_define_import_meta_env();
  var xml = create({
    properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
    space: "xml",
    transform(_, property) {
      return "xml:" + property.slice(3).toLowerCase();
    }
  });

  // node_modules/property-information/lib/hast-to-react.js
  init_define_import_meta_env();
  var hastToReact = {
    classId: "classID",
    dataType: "datatype",
    itemId: "itemID",
    strokeDashArray: "strokeDasharray",
    strokeDashOffset: "strokeDashoffset",
    strokeLineCap: "strokeLinecap",
    strokeLineJoin: "strokeLinejoin",
    strokeMiterLimit: "strokeMiterlimit",
    typeOf: "typeof",
    xLinkActuate: "xlinkActuate",
    xLinkArcRole: "xlinkArcrole",
    xLinkHref: "xlinkHref",
    xLinkRole: "xlinkRole",
    xLinkShow: "xlinkShow",
    xLinkTitle: "xlinkTitle",
    xLinkType: "xlinkType",
    xmlnsXLink: "xmlnsXlink"
  };

  // node_modules/property-information/lib/find.js
  init_define_import_meta_env();
  var cap = /[A-Z]/g;
  var dash = /-[a-z]/g;
  var valid = /^data[-\w.:]+$/i;
  function find(schema, value) {
    const normal = normalize(value);
    let property = value;
    let Type = Info;
    if (normal in schema.normal) {
      return schema.property[schema.normal[normal]];
    }
    if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
      if (value.charAt(4) === "-") {
        const rest = value.slice(5).replace(dash, camelcase);
        property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
      } else {
        const rest = value.slice(4);
        if (!dash.test(rest)) {
          let dashes = rest.replace(cap, kebab);
          if (dashes.charAt(0) !== "-") {
            dashes = "-" + dashes;
          }
          value = "data" + dashes;
        }
      }
      Type = DefinedInfo;
    }
    return new Type(property, value);
  }
  function kebab($0) {
    return "-" + $0.toLowerCase();
  }
  function camelcase($0) {
    return $0.charAt(1).toUpperCase();
  }

  // node_modules/property-information/index.js
  var html2 = merge([aria, html, xlink, xmlns, xml], "html");
  var svg2 = merge([aria, svg, xlink, xmlns, xml], "svg");

  // node_modules/space-separated-tokens/index.js
  init_define_import_meta_env();
  function stringify2(values) {
    return values.join(" ").trim();
  }

  // node_modules/hast-util-to-jsx-runtime/lib/index.js
  var import_style_to_js = __toESM(require_cjs3(), 1);

  // node_modules/unist-util-position/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-position/lib/index.js
  init_define_import_meta_env();
  var pointEnd = point("end");
  var pointStart = point("start");
  function point(type) {
    return point4;
    function point4(node2) {
      const point5 = node2 && node2.position && node2.position[type] || {};
      if (typeof point5.line === "number" && point5.line > 0 && typeof point5.column === "number" && point5.column > 0) {
        return {
          line: point5.line,
          column: point5.column,
          offset: typeof point5.offset === "number" && point5.offset > -1 ? point5.offset : void 0
        };
      }
    }
  }
  function position(node2) {
    const start2 = pointStart(node2);
    const end = pointEnd(node2);
    if (start2 && end) {
      return { start: start2, end };
    }
  }

  // node_modules/vfile-message/index.js
  init_define_import_meta_env();

  // node_modules/vfile-message/lib/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-stringify-position/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-stringify-position/lib/index.js
  init_define_import_meta_env();
  function stringifyPosition(value) {
    if (!value || typeof value !== "object") {
      return "";
    }
    if ("position" in value || "type" in value) {
      return position2(value.position);
    }
    if ("start" in value || "end" in value) {
      return position2(value);
    }
    if ("line" in value || "column" in value) {
      return point2(value);
    }
    return "";
  }
  function point2(point4) {
    return index(point4 && point4.line) + ":" + index(point4 && point4.column);
  }
  function position2(pos) {
    return point2(pos && pos.start) + "-" + point2(pos && pos.end);
  }
  function index(value) {
    return value && typeof value === "number" ? value : 1;
  }

  // node_modules/vfile-message/lib/index.js
  var VFileMessage = class extends Error {
    /**
     * Create a message for `reason`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {Options | null | undefined} [options]
     * @returns
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns
     *   Instance of `VFileMessage`.
     */
    // eslint-disable-next-line complexity
    constructor(causeOrReason, optionsOrParentOrPlace, origin) {
      super();
      if (typeof optionsOrParentOrPlace === "string") {
        origin = optionsOrParentOrPlace;
        optionsOrParentOrPlace = void 0;
      }
      let reason = "";
      let options = {};
      let legacyCause = false;
      if (optionsOrParentOrPlace) {
        if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) {
          options = { place: optionsOrParentOrPlace };
        } else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) {
          options = { place: optionsOrParentOrPlace };
        } else if ("type" in optionsOrParentOrPlace) {
          options = {
            ancestors: [optionsOrParentOrPlace],
            place: optionsOrParentOrPlace.position
          };
        } else {
          options = { ...optionsOrParentOrPlace };
        }
      }
      if (typeof causeOrReason === "string") {
        reason = causeOrReason;
      } else if (!options.cause && causeOrReason) {
        legacyCause = true;
        reason = causeOrReason.message;
        options.cause = causeOrReason;
      }
      if (!options.ruleId && !options.source && typeof origin === "string") {
        const index2 = origin.indexOf(":");
        if (index2 === -1) {
          options.ruleId = origin;
        } else {
          options.source = origin.slice(0, index2);
          options.ruleId = origin.slice(index2 + 1);
        }
      }
      if (!options.place && options.ancestors && options.ancestors) {
        const parent = options.ancestors[options.ancestors.length - 1];
        if (parent) {
          options.place = parent.position;
        }
      }
      const start2 = options.place && "start" in options.place ? options.place.start : options.place;
      this.ancestors = options.ancestors || void 0;
      this.cause = options.cause || void 0;
      this.column = start2 ? start2.column : void 0;
      this.fatal = void 0;
      this.file = "";
      this.message = reason;
      this.line = start2 ? start2.line : void 0;
      this.name = stringifyPosition(options.place) || "1:1";
      this.place = options.place || void 0;
      this.reason = this.message;
      this.ruleId = options.ruleId || void 0;
      this.source = options.source || void 0;
      this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
      this.actual = void 0;
      this.expected = void 0;
      this.note = void 0;
      this.url = void 0;
    }
  };
  VFileMessage.prototype.file = "";
  VFileMessage.prototype.name = "";
  VFileMessage.prototype.reason = "";
  VFileMessage.prototype.message = "";
  VFileMessage.prototype.stack = "";
  VFileMessage.prototype.column = void 0;
  VFileMessage.prototype.line = void 0;
  VFileMessage.prototype.ancestors = void 0;
  VFileMessage.prototype.cause = void 0;
  VFileMessage.prototype.fatal = void 0;
  VFileMessage.prototype.place = void 0;
  VFileMessage.prototype.ruleId = void 0;
  VFileMessage.prototype.source = void 0;

  // node_modules/hast-util-to-jsx-runtime/lib/index.js
  var own = {}.hasOwnProperty;
  var emptyMap = /* @__PURE__ */ new Map();
  var cap2 = /[A-Z]/g;
  var tableElements = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]);
  var tableCellElement = /* @__PURE__ */ new Set(["td", "th"]);
  var docs = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
  function toJsxRuntime(tree, options) {
    if (!options || options.Fragment === void 0) {
      throw new TypeError("Expected `Fragment` in options");
    }
    const filePath = options.filePath || void 0;
    let create2;
    if (options.development) {
      if (typeof options.jsxDEV !== "function") {
        throw new TypeError(
          "Expected `jsxDEV` in options when `development: true`"
        );
      }
      create2 = developmentCreate(filePath, options.jsxDEV);
    } else {
      if (typeof options.jsx !== "function") {
        throw new TypeError("Expected `jsx` in production options");
      }
      if (typeof options.jsxs !== "function") {
        throw new TypeError("Expected `jsxs` in production options");
      }
      create2 = productionCreate(filePath, options.jsx, options.jsxs);
    }
    const state = {
      Fragment: options.Fragment,
      ancestors: [],
      components: options.components || {},
      create: create2,
      elementAttributeNameCase: options.elementAttributeNameCase || "react",
      evaluater: options.createEvaluater ? options.createEvaluater() : void 0,
      filePath,
      ignoreInvalidStyle: options.ignoreInvalidStyle || false,
      passKeys: options.passKeys !== false,
      passNode: options.passNode || false,
      schema: options.space === "svg" ? svg2 : html2,
      stylePropertyNameCase: options.stylePropertyNameCase || "dom",
      tableCellAlignToStyle: options.tableCellAlignToStyle !== false
    };
    const result = one(state, tree, void 0);
    if (result && typeof result !== "string") {
      return result;
    }
    return state.create(
      tree,
      state.Fragment,
      { children: result || void 0 },
      void 0
    );
  }
  function one(state, node2, key) {
    if (node2.type === "element") {
      return element(state, node2, key);
    }
    if (node2.type === "mdxFlowExpression" || node2.type === "mdxTextExpression") {
      return mdxExpression(state, node2);
    }
    if (node2.type === "mdxJsxFlowElement" || node2.type === "mdxJsxTextElement") {
      return mdxJsxElement(state, node2, key);
    }
    if (node2.type === "mdxjsEsm") {
      return mdxEsm(state, node2);
    }
    if (node2.type === "root") {
      return root(state, node2, key);
    }
    if (node2.type === "text") {
      return text(state, node2);
    }
  }
  function element(state, node2, key) {
    const parentSchema = state.schema;
    let schema = parentSchema;
    if (node2.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
      schema = svg2;
      state.schema = schema;
    }
    state.ancestors.push(node2);
    const type = findComponentFromName(state, node2.tagName, false);
    const props = createElementProps(state, node2);
    let children = createChildren(state, node2);
    if (tableElements.has(node2.tagName)) {
      children = children.filter(function(child) {
        return typeof child === "string" ? !whitespace(child) : true;
      });
    }
    addNode(state, props, type, node2);
    addChildren(props, children);
    state.ancestors.pop();
    state.schema = parentSchema;
    return state.create(node2, type, props, key);
  }
  function mdxExpression(state, node2) {
    if (node2.data && node2.data.estree && state.evaluater) {
      const program = node2.data.estree;
      const expression = program.body[0];
      ok(expression.type === "ExpressionStatement");
      return (
        /** @type {Child | undefined} */
        state.evaluater.evaluateExpression(expression.expression)
      );
    }
    crashEstree(state, node2.position);
  }
  function mdxEsm(state, node2) {
    if (node2.data && node2.data.estree && state.evaluater) {
      return (
        /** @type {Child | undefined} */
        state.evaluater.evaluateProgram(node2.data.estree)
      );
    }
    crashEstree(state, node2.position);
  }
  function mdxJsxElement(state, node2, key) {
    const parentSchema = state.schema;
    let schema = parentSchema;
    if (node2.name === "svg" && parentSchema.space === "html") {
      schema = svg2;
      state.schema = schema;
    }
    state.ancestors.push(node2);
    const type = node2.name === null ? state.Fragment : findComponentFromName(state, node2.name, true);
    const props = createJsxElementProps(state, node2);
    const children = createChildren(state, node2);
    addNode(state, props, type, node2);
    addChildren(props, children);
    state.ancestors.pop();
    state.schema = parentSchema;
    return state.create(node2, type, props, key);
  }
  function root(state, node2, key) {
    const props = {};
    addChildren(props, createChildren(state, node2));
    return state.create(node2, state.Fragment, props, key);
  }
  function text(_, node2) {
    return node2.value;
  }
  function addNode(state, props, type, node2) {
    if (typeof type !== "string" && type !== state.Fragment && state.passNode) {
      props.node = node2;
    }
  }
  function addChildren(props, children) {
    if (children.length > 0) {
      const value = children.length > 1 ? children : children[0];
      if (value) {
        props.children = value;
      }
    }
  }
  function productionCreate(_, jsx7, jsxs6) {
    return create2;
    function create2(_2, type, props, key) {
      const isStaticChildren = Array.isArray(props.children);
      const fn = isStaticChildren ? jsxs6 : jsx7;
      return key ? fn(type, props, key) : fn(type, props);
    }
  }
  function developmentCreate(filePath, jsxDEV) {
    return create2;
    function create2(node2, type, props, key) {
      const isStaticChildren = Array.isArray(props.children);
      const point4 = pointStart(node2);
      return jsxDEV(
        type,
        props,
        key,
        isStaticChildren,
        {
          columnNumber: point4 ? point4.column - 1 : void 0,
          fileName: filePath,
          lineNumber: point4 ? point4.line : void 0
        },
        void 0
      );
    }
  }
  function createElementProps(state, node2) {
    const props = {};
    let alignValue;
    let prop;
    for (prop in node2.properties) {
      if (prop !== "children" && own.call(node2.properties, prop)) {
        const result = createProperty(state, prop, node2.properties[prop]);
        if (result) {
          const [key, value] = result;
          if (state.tableCellAlignToStyle && key === "align" && typeof value === "string" && tableCellElement.has(node2.tagName)) {
            alignValue = value;
          } else {
            props[key] = value;
          }
        }
      }
    }
    if (alignValue) {
      const style = (
        /** @type {Style} */
        props.style || (props.style = {})
      );
      style[state.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = alignValue;
    }
    return props;
  }
  function createJsxElementProps(state, node2) {
    const props = {};
    for (const attribute of node2.attributes) {
      if (attribute.type === "mdxJsxExpressionAttribute") {
        if (attribute.data && attribute.data.estree && state.evaluater) {
          const program = attribute.data.estree;
          const expression = program.body[0];
          ok(expression.type === "ExpressionStatement");
          const objectExpression = expression.expression;
          ok(objectExpression.type === "ObjectExpression");
          const property = objectExpression.properties[0];
          ok(property.type === "SpreadElement");
          Object.assign(
            props,
            state.evaluater.evaluateExpression(property.argument)
          );
        } else {
          crashEstree(state, node2.position);
        }
      } else {
        const name2 = attribute.name;
        let value;
        if (attribute.value && typeof attribute.value === "object") {
          if (attribute.value.data && attribute.value.data.estree && state.evaluater) {
            const program = attribute.value.data.estree;
            const expression = program.body[0];
            ok(expression.type === "ExpressionStatement");
            value = state.evaluater.evaluateExpression(expression.expression);
          } else {
            crashEstree(state, node2.position);
          }
        } else {
          value = attribute.value === null ? true : attribute.value;
        }
        props[name2] = /** @type {Props[keyof Props]} */
        value;
      }
    }
    return props;
  }
  function createChildren(state, node2) {
    const children = [];
    let index2 = -1;
    const countsByName = state.passKeys ? /* @__PURE__ */ new Map() : emptyMap;
    while (++index2 < node2.children.length) {
      const child = node2.children[index2];
      let key;
      if (state.passKeys) {
        const name2 = child.type === "element" ? child.tagName : child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement" ? child.name : void 0;
        if (name2) {
          const count = countsByName.get(name2) || 0;
          key = name2 + "-" + count;
          countsByName.set(name2, count + 1);
        }
      }
      const result = one(state, child, key);
      if (result !== void 0) children.push(result);
    }
    return children;
  }
  function createProperty(state, prop, value) {
    const info = find(state.schema, prop);
    if (value === null || value === void 0 || typeof value === "number" && Number.isNaN(value)) {
      return;
    }
    if (Array.isArray(value)) {
      value = info.commaSeparated ? stringify(value) : stringify2(value);
    }
    if (info.property === "style") {
      let styleObject = typeof value === "object" ? value : parseStyle(state, String(value));
      if (state.stylePropertyNameCase === "css") {
        styleObject = transformStylesToCssCasing(styleObject);
      }
      return ["style", styleObject];
    }
    return [
      state.elementAttributeNameCase === "react" && info.space ? hastToReact[info.property] || info.property : info.attribute,
      value
    ];
  }
  function parseStyle(state, value) {
    try {
      return (0, import_style_to_js.default)(value, { reactCompat: true });
    } catch (error) {
      if (state.ignoreInvalidStyle) {
        return {};
      }
      const cause = (
        /** @type {Error} */
        error
      );
      const message = new VFileMessage("Cannot parse `style` attribute", {
        ancestors: state.ancestors,
        cause,
        ruleId: "style",
        source: "hast-util-to-jsx-runtime"
      });
      message.file = state.filePath || void 0;
      message.url = docs + "#cannot-parse-style-attribute";
      throw message;
    }
  }
  function findComponentFromName(state, name2, allowExpression) {
    let result;
    if (!allowExpression) {
      result = { type: "Literal", value: name2 };
    } else if (name2.includes(".")) {
      const identifiers = name2.split(".");
      let index2 = -1;
      let node2;
      while (++index2 < identifiers.length) {
        const prop = name(identifiers[index2]) ? { type: "Identifier", name: identifiers[index2] } : { type: "Literal", value: identifiers[index2] };
        node2 = node2 ? {
          type: "MemberExpression",
          object: node2,
          property: prop,
          computed: Boolean(index2 && prop.type === "Literal"),
          optional: false
        } : prop;
      }
      ok(node2, "always a result");
      result = node2;
    } else {
      result = name(name2) && !/^[a-z]/.test(name2) ? { type: "Identifier", name: name2 } : { type: "Literal", value: name2 };
    }
    if (result.type === "Literal") {
      const name3 = (
        /** @type {string | number} */
        result.value
      );
      return own.call(state.components, name3) ? state.components[name3] : name3;
    }
    if (state.evaluater) {
      return state.evaluater.evaluateExpression(result);
    }
    crashEstree(state);
  }
  function crashEstree(state, place) {
    const message = new VFileMessage(
      "Cannot handle MDX estrees without `createEvaluater`",
      {
        ancestors: state.ancestors,
        place,
        ruleId: "mdx-estree",
        source: "hast-util-to-jsx-runtime"
      }
    );
    message.file = state.filePath || void 0;
    message.url = docs + "#cannot-handle-mdx-estrees-without-createevaluater";
    throw message;
  }
  function transformStylesToCssCasing(domCasing) {
    const cssCasing = {};
    let from;
    for (from in domCasing) {
      if (own.call(domCasing, from)) {
        cssCasing[transformStyleToCssCasing(from)] = domCasing[from];
      }
    }
    return cssCasing;
  }
  function transformStyleToCssCasing(from) {
    let to = from.replace(cap2, toDash);
    if (to.slice(0, 3) === "ms-") to = "-" + to;
    return to;
  }
  function toDash($0) {
    return "-" + $0.toLowerCase();
  }

  // node_modules/html-url-attributes/index.js
  init_define_import_meta_env();

  // node_modules/html-url-attributes/lib/index.js
  init_define_import_meta_env();
  var urlAttributes = {
    action: ["form"],
    cite: ["blockquote", "del", "ins", "q"],
    data: ["object"],
    formAction: ["button", "input"],
    href: ["a", "area", "base", "link"],
    icon: ["menuitem"],
    itemId: null,
    manifest: ["html"],
    ping: ["a", "area"],
    poster: ["video"],
    src: [
      "audio",
      "embed",
      "iframe",
      "img",
      "input",
      "script",
      "source",
      "track",
      "video"
    ]
  };

  // node_modules/react-markdown/lib/index.js
  var import_jsx_runtime3 = __toESM(require_react_shim(), 1);
  var import_react2 = __toESM(require_react_shim(), 1);

  // node_modules/remark-parse/index.js
  init_define_import_meta_env();

  // node_modules/remark-parse/lib/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-from-markdown/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-from-markdown/lib/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-string/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-string/lib/index.js
  init_define_import_meta_env();
  var emptyOptions2 = {};
  function toString(value, options) {
    const settings = options || emptyOptions2;
    const includeImageAlt = typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true;
    const includeHtml = typeof settings.includeHtml === "boolean" ? settings.includeHtml : true;
    return one2(value, includeImageAlt, includeHtml);
  }
  function one2(value, includeImageAlt, includeHtml) {
    if (node(value)) {
      if ("value" in value) {
        return value.type === "html" && !includeHtml ? "" : value.value;
      }
      if (includeImageAlt && "alt" in value && value.alt) {
        return value.alt;
      }
      if ("children" in value) {
        return all(value.children, includeImageAlt, includeHtml);
      }
    }
    if (Array.isArray(value)) {
      return all(value, includeImageAlt, includeHtml);
    }
    return "";
  }
  function all(values, includeImageAlt, includeHtml) {
    const result = [];
    let index2 = -1;
    while (++index2 < values.length) {
      result[index2] = one2(values[index2], includeImageAlt, includeHtml);
    }
    return result.join("");
  }
  function node(value) {
    return Boolean(value && typeof value === "object");
  }

  // node_modules/micromark/index.js
  init_define_import_meta_env();

  // node_modules/decode-named-character-reference/index.dom.js
  init_define_import_meta_env();
  var element2 = document.createElement("i");
  function decodeNamedCharacterReference(value) {
    const characterReference2 = "&" + value + ";";
    element2.innerHTML = characterReference2;
    const character = element2.textContent;
    if (character.charCodeAt(character.length - 1) === 59 && value !== "semi") {
      return false;
    }
    return character === characterReference2 ? false : character;
  }

  // node_modules/micromark-util-chunked/index.js
  init_define_import_meta_env();
  function splice(list4, start2, remove, items) {
    const end = list4.length;
    let chunkStart = 0;
    let parameters;
    if (start2 < 0) {
      start2 = -start2 > end ? 0 : end + start2;
    } else {
      start2 = start2 > end ? end : start2;
    }
    remove = remove > 0 ? remove : 0;
    if (items.length < 1e4) {
      parameters = Array.from(items);
      parameters.unshift(start2, remove);
      list4.splice(...parameters);
    } else {
      if (remove) list4.splice(start2, remove);
      while (chunkStart < items.length) {
        parameters = items.slice(chunkStart, chunkStart + 1e4);
        parameters.unshift(start2, 0);
        list4.splice(...parameters);
        chunkStart += 1e4;
        start2 += 1e4;
      }
    }
  }
  function push(list4, items) {
    if (list4.length > 0) {
      splice(list4, list4.length, 0, items);
      return list4;
    }
    return items;
  }

  // node_modules/micromark-util-combine-extensions/index.js
  init_define_import_meta_env();
  var hasOwnProperty = {}.hasOwnProperty;
  function combineExtensions(extensions) {
    const all2 = {};
    let index2 = -1;
    while (++index2 < extensions.length) {
      syntaxExtension(all2, extensions[index2]);
    }
    return all2;
  }
  function syntaxExtension(all2, extension2) {
    let hook;
    for (hook in extension2) {
      const maybe = hasOwnProperty.call(all2, hook) ? all2[hook] : void 0;
      const left = maybe || (all2[hook] = {});
      const right = extension2[hook];
      let code4;
      if (right) {
        for (code4 in right) {
          if (!hasOwnProperty.call(left, code4)) left[code4] = [];
          const value = right[code4];
          constructs(
            // @ts-expect-error Looks like a list.
            left[code4],
            Array.isArray(value) ? value : value ? [value] : []
          );
        }
      }
    }
  }
  function constructs(existing, list4) {
    let index2 = -1;
    const before = [];
    while (++index2 < list4.length) {
      ;
      (list4[index2].add === "after" ? existing : before).push(list4[index2]);
    }
    splice(existing, 0, 0, before);
  }

  // node_modules/micromark-util-decode-numeric-character-reference/index.js
  init_define_import_meta_env();
  function decodeNumericCharacterReference(value, base) {
    const code4 = Number.parseInt(value, base);
    if (
      // C0 except for HT, LF, FF, CR, space.
      code4 < 9 || code4 === 11 || code4 > 13 && code4 < 32 || // Control character (DEL) of C0, and C1 controls.
      code4 > 126 && code4 < 160 || // Lone high surrogates and low surrogates.
      code4 > 55295 && code4 < 57344 || // Noncharacters.
      code4 > 64975 && code4 < 65008 || /* eslint-disable no-bitwise */
      (code4 & 65535) === 65535 || (code4 & 65535) === 65534 || /* eslint-enable no-bitwise */
      // Out of range
      code4 > 1114111
    ) {
      return "\uFFFD";
    }
    return String.fromCodePoint(code4);
  }

  // node_modules/micromark-util-normalize-identifier/index.js
  init_define_import_meta_env();
  function normalizeIdentifier(value) {
    return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
  }

  // node_modules/micromark-util-sanitize-uri/index.js
  init_define_import_meta_env();

  // node_modules/micromark-util-character/index.js
  init_define_import_meta_env();
  var asciiAlpha = regexCheck(/[A-Za-z]/);
  var asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
  var asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
  function asciiControl(code4) {
    return (
      // Special whitespace codes (which have negative values), C0 and Control
      // character DEL
      code4 !== null && (code4 < 32 || code4 === 127)
    );
  }
  var asciiDigit = regexCheck(/\d/);
  var asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
  var asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
  function markdownLineEnding(code4) {
    return code4 !== null && code4 < -2;
  }
  function markdownLineEndingOrSpace(code4) {
    return code4 !== null && (code4 < 0 || code4 === 32);
  }
  function markdownSpace(code4) {
    return code4 === -2 || code4 === -1 || code4 === 32;
  }
  var unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
  var unicodeWhitespace = regexCheck(/\s/);
  function regexCheck(regex) {
    return check;
    function check(code4) {
      return code4 !== null && code4 > -1 && regex.test(String.fromCharCode(code4));
    }
  }

  // node_modules/micromark-util-sanitize-uri/index.js
  function normalizeUri(value) {
    const result = [];
    let index2 = -1;
    let start2 = 0;
    let skip = 0;
    while (++index2 < value.length) {
      const code4 = value.charCodeAt(index2);
      let replace2 = "";
      if (code4 === 37 && asciiAlphanumeric(value.charCodeAt(index2 + 1)) && asciiAlphanumeric(value.charCodeAt(index2 + 2))) {
        skip = 2;
      } else if (code4 < 128) {
        if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code4))) {
          replace2 = String.fromCharCode(code4);
        }
      } else if (code4 > 55295 && code4 < 57344) {
        const next = value.charCodeAt(index2 + 1);
        if (code4 < 56320 && next > 56319 && next < 57344) {
          replace2 = String.fromCharCode(code4, next);
          skip = 1;
        } else {
          replace2 = "\uFFFD";
        }
      } else {
        replace2 = String.fromCharCode(code4);
      }
      if (replace2) {
        result.push(value.slice(start2, index2), encodeURIComponent(replace2));
        start2 = index2 + skip + 1;
        replace2 = "";
      }
      if (skip) {
        index2 += skip;
        skip = 0;
      }
    }
    return result.join("") + value.slice(start2);
  }

  // node_modules/micromark/lib/parse.js
  init_define_import_meta_env();

  // node_modules/micromark/lib/initialize/content.js
  init_define_import_meta_env();

  // node_modules/micromark-factory-space/index.js
  init_define_import_meta_env();
  function factorySpace(effects, ok3, type, max) {
    const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
    let size = 0;
    return start2;
    function start2(code4) {
      if (markdownSpace(code4)) {
        effects.enter(type);
        return prefix(code4);
      }
      return ok3(code4);
    }
    function prefix(code4) {
      if (markdownSpace(code4) && size++ < limit) {
        effects.consume(code4);
        return prefix;
      }
      effects.exit(type);
      return ok3(code4);
    }
  }

  // node_modules/micromark/lib/initialize/content.js
  var content = {
    tokenize: initializeContent
  };
  function initializeContent(effects) {
    const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
    let previous3;
    return contentStart;
    function afterContentStartConstruct(code4) {
      if (code4 === null) {
        effects.consume(code4);
        return;
      }
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return factorySpace(effects, contentStart, "linePrefix");
    }
    function paragraphInitial(code4) {
      effects.enter("paragraph");
      return lineStart(code4);
    }
    function lineStart(code4) {
      const token = effects.enter("chunkText", {
        contentType: "text",
        previous: previous3
      });
      if (previous3) {
        previous3.next = token;
      }
      previous3 = token;
      return data(code4);
    }
    function data(code4) {
      if (code4 === null) {
        effects.exit("chunkText");
        effects.exit("paragraph");
        effects.consume(code4);
        return;
      }
      if (markdownLineEnding(code4)) {
        effects.consume(code4);
        effects.exit("chunkText");
        return lineStart;
      }
      effects.consume(code4);
      return data;
    }
  }

  // node_modules/micromark/lib/initialize/document.js
  init_define_import_meta_env();
  var document2 = {
    tokenize: initializeDocument
  };
  var containerConstruct = {
    tokenize: tokenizeContainer
  };
  function initializeDocument(effects) {
    const self2 = this;
    const stack = [];
    let continued = 0;
    let childFlow;
    let childToken;
    let lineStartOffset;
    return start2;
    function start2(code4) {
      if (continued < stack.length) {
        const item = stack[continued];
        self2.containerState = item[1];
        return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code4);
      }
      return checkNewContainers(code4);
    }
    function documentContinue(code4) {
      continued++;
      if (self2.containerState._closeFlow) {
        self2.containerState._closeFlow = void 0;
        if (childFlow) {
          closeFlow();
        }
        const indexBeforeExits = self2.events.length;
        let indexBeforeFlow = indexBeforeExits;
        let point4;
        while (indexBeforeFlow--) {
          if (self2.events[indexBeforeFlow][0] === "exit" && self2.events[indexBeforeFlow][1].type === "chunkFlow") {
            point4 = self2.events[indexBeforeFlow][1].end;
            break;
          }
        }
        exitContainers(continued);
        let index2 = indexBeforeExits;
        while (index2 < self2.events.length) {
          self2.events[index2][1].end = {
            ...point4
          };
          index2++;
        }
        splice(self2.events, indexBeforeFlow + 1, 0, self2.events.slice(indexBeforeExits));
        self2.events.length = index2;
        return checkNewContainers(code4);
      }
      return start2(code4);
    }
    function checkNewContainers(code4) {
      if (continued === stack.length) {
        if (!childFlow) {
          return documentContinued(code4);
        }
        if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) {
          return flowStart(code4);
        }
        self2.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
      }
      self2.containerState = {};
      return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code4);
    }
    function thereIsANewContainer(code4) {
      if (childFlow) closeFlow();
      exitContainers(continued);
      return documentContinued(code4);
    }
    function thereIsNoNewContainer(code4) {
      self2.parser.lazy[self2.now().line] = continued !== stack.length;
      lineStartOffset = self2.now().offset;
      return flowStart(code4);
    }
    function documentContinued(code4) {
      self2.containerState = {};
      return effects.attempt(containerConstruct, containerContinue, flowStart)(code4);
    }
    function containerContinue(code4) {
      continued++;
      stack.push([self2.currentConstruct, self2.containerState]);
      return documentContinued(code4);
    }
    function flowStart(code4) {
      if (code4 === null) {
        if (childFlow) closeFlow();
        exitContainers(0);
        effects.consume(code4);
        return;
      }
      childFlow = childFlow || self2.parser.flow(self2.now());
      effects.enter("chunkFlow", {
        _tokenizer: childFlow,
        contentType: "flow",
        previous: childToken
      });
      return flowContinue(code4);
    }
    function flowContinue(code4) {
      if (code4 === null) {
        writeToChild(effects.exit("chunkFlow"), true);
        exitContainers(0);
        effects.consume(code4);
        return;
      }
      if (markdownLineEnding(code4)) {
        effects.consume(code4);
        writeToChild(effects.exit("chunkFlow"));
        continued = 0;
        self2.interrupt = void 0;
        return start2;
      }
      effects.consume(code4);
      return flowContinue;
    }
    function writeToChild(token, endOfFile) {
      const stream = self2.sliceStream(token);
      if (endOfFile) stream.push(null);
      token.previous = childToken;
      if (childToken) childToken.next = token;
      childToken = token;
      childFlow.defineSkip(token.start);
      childFlow.write(stream);
      if (self2.parser.lazy[token.start.line]) {
        let index2 = childFlow.events.length;
        while (index2--) {
          if (
            // The token starts before the line ending…
            childFlow.events[index2][1].start.offset < lineStartOffset && // …and either is not ended yet…
            (!childFlow.events[index2][1].end || // …or ends after it.
            childFlow.events[index2][1].end.offset > lineStartOffset)
          ) {
            return;
          }
        }
        const indexBeforeExits = self2.events.length;
        let indexBeforeFlow = indexBeforeExits;
        let seen;
        let point4;
        while (indexBeforeFlow--) {
          if (self2.events[indexBeforeFlow][0] === "exit" && self2.events[indexBeforeFlow][1].type === "chunkFlow") {
            if (seen) {
              point4 = self2.events[indexBeforeFlow][1].end;
              break;
            }
            seen = true;
          }
        }
        exitContainers(continued);
        index2 = indexBeforeExits;
        while (index2 < self2.events.length) {
          self2.events[index2][1].end = {
            ...point4
          };
          index2++;
        }
        splice(self2.events, indexBeforeFlow + 1, 0, self2.events.slice(indexBeforeExits));
        self2.events.length = index2;
      }
    }
    function exitContainers(size) {
      let index2 = stack.length;
      while (index2-- > size) {
        const entry = stack[index2];
        self2.containerState = entry[1];
        entry[0].exit.call(self2, effects);
      }
      stack.length = size;
    }
    function closeFlow() {
      childFlow.write([null]);
      childToken = void 0;
      childFlow = void 0;
      self2.containerState._closeFlow = void 0;
    }
  }
  function tokenizeContainer(effects, ok3, nok) {
    return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok3, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
  }

  // node_modules/micromark/lib/initialize/flow.js
  init_define_import_meta_env();

  // node_modules/micromark-core-commonmark/index.js
  init_define_import_meta_env();

  // node_modules/micromark-core-commonmark/lib/attention.js
  init_define_import_meta_env();

  // node_modules/micromark-util-classify-character/index.js
  init_define_import_meta_env();
  function classifyCharacter(code4) {
    if (code4 === null || markdownLineEndingOrSpace(code4) || unicodeWhitespace(code4)) {
      return 1;
    }
    if (unicodePunctuation(code4)) {
      return 2;
    }
  }

  // node_modules/micromark-util-resolve-all/index.js
  init_define_import_meta_env();
  function resolveAll(constructs2, events, context) {
    const called = [];
    let index2 = -1;
    while (++index2 < constructs2.length) {
      const resolve = constructs2[index2].resolveAll;
      if (resolve && !called.includes(resolve)) {
        events = resolve(events, context);
        called.push(resolve);
      }
    }
    return events;
  }

  // node_modules/micromark-core-commonmark/lib/attention.js
  var attention = {
    name: "attention",
    resolveAll: resolveAllAttention,
    tokenize: tokenizeAttention
  };
  function resolveAllAttention(events, context) {
    let index2 = -1;
    let open;
    let group;
    let text7;
    let openingSequence;
    let closingSequence;
    let use;
    let nextEvents;
    let offset;
    while (++index2 < events.length) {
      if (events[index2][0] === "enter" && events[index2][1].type === "attentionSequence" && events[index2][1]._close) {
        open = index2;
        while (open--) {
          if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && // If the markers are the same:
          context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index2][1]).charCodeAt(0)) {
            if ((events[open][1]._close || events[index2][1]._open) && (events[index2][1].end.offset - events[index2][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index2][1].end.offset - events[index2][1].start.offset) % 3)) {
              continue;
            }
            use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index2][1].end.offset - events[index2][1].start.offset > 1 ? 2 : 1;
            const start2 = {
              ...events[open][1].end
            };
            const end = {
              ...events[index2][1].start
            };
            movePoint(start2, -use);
            movePoint(end, use);
            openingSequence = {
              type: use > 1 ? "strongSequence" : "emphasisSequence",
              start: start2,
              end: {
                ...events[open][1].end
              }
            };
            closingSequence = {
              type: use > 1 ? "strongSequence" : "emphasisSequence",
              start: {
                ...events[index2][1].start
              },
              end
            };
            text7 = {
              type: use > 1 ? "strongText" : "emphasisText",
              start: {
                ...events[open][1].end
              },
              end: {
                ...events[index2][1].start
              }
            };
            group = {
              type: use > 1 ? "strong" : "emphasis",
              start: {
                ...openingSequence.start
              },
              end: {
                ...closingSequence.end
              }
            };
            events[open][1].end = {
              ...openingSequence.start
            };
            events[index2][1].start = {
              ...closingSequence.end
            };
            nextEvents = [];
            if (events[open][1].end.offset - events[open][1].start.offset) {
              nextEvents = push(nextEvents, [["enter", events[open][1], context], ["exit", events[open][1], context]]);
            }
            nextEvents = push(nextEvents, [["enter", group, context], ["enter", openingSequence, context], ["exit", openingSequence, context], ["enter", text7, context]]);
            nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index2), context));
            nextEvents = push(nextEvents, [["exit", text7, context], ["enter", closingSequence, context], ["exit", closingSequence, context], ["exit", group, context]]);
            if (events[index2][1].end.offset - events[index2][1].start.offset) {
              offset = 2;
              nextEvents = push(nextEvents, [["enter", events[index2][1], context], ["exit", events[index2][1], context]]);
            } else {
              offset = 0;
            }
            splice(events, open - 1, index2 - open + 3, nextEvents);
            index2 = open + nextEvents.length - offset - 2;
            break;
          }
        }
      }
    }
    index2 = -1;
    while (++index2 < events.length) {
      if (events[index2][1].type === "attentionSequence") {
        events[index2][1].type = "data";
      }
    }
    return events;
  }
  function tokenizeAttention(effects, ok3) {
    const attentionMarkers2 = this.parser.constructs.attentionMarkers.null;
    const previous3 = this.previous;
    const before = classifyCharacter(previous3);
    let marker;
    return start2;
    function start2(code4) {
      marker = code4;
      effects.enter("attentionSequence");
      return inside(code4);
    }
    function inside(code4) {
      if (code4 === marker) {
        effects.consume(code4);
        return inside;
      }
      const token = effects.exit("attentionSequence");
      const after = classifyCharacter(code4);
      const open = !after || after === 2 && before || attentionMarkers2.includes(code4);
      const close = !before || before === 2 && after || attentionMarkers2.includes(previous3);
      token._open = Boolean(marker === 42 ? open : open && (before || !close));
      token._close = Boolean(marker === 42 ? close : close && (after || !open));
      return ok3(code4);
    }
  }
  function movePoint(point4, offset) {
    point4.column += offset;
    point4.offset += offset;
    point4._bufferIndex += offset;
  }

  // node_modules/micromark-core-commonmark/lib/autolink.js
  init_define_import_meta_env();
  var autolink = {
    name: "autolink",
    tokenize: tokenizeAutolink
  };
  function tokenizeAutolink(effects, ok3, nok) {
    let size = 0;
    return start2;
    function start2(code4) {
      effects.enter("autolink");
      effects.enter("autolinkMarker");
      effects.consume(code4);
      effects.exit("autolinkMarker");
      effects.enter("autolinkProtocol");
      return open;
    }
    function open(code4) {
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        return schemeOrEmailAtext;
      }
      if (code4 === 64) {
        return nok(code4);
      }
      return emailAtext(code4);
    }
    function schemeOrEmailAtext(code4) {
      if (code4 === 43 || code4 === 45 || code4 === 46 || asciiAlphanumeric(code4)) {
        size = 1;
        return schemeInsideOrEmailAtext(code4);
      }
      return emailAtext(code4);
    }
    function schemeInsideOrEmailAtext(code4) {
      if (code4 === 58) {
        effects.consume(code4);
        size = 0;
        return urlInside;
      }
      if ((code4 === 43 || code4 === 45 || code4 === 46 || asciiAlphanumeric(code4)) && size++ < 32) {
        effects.consume(code4);
        return schemeInsideOrEmailAtext;
      }
      size = 0;
      return emailAtext(code4);
    }
    function urlInside(code4) {
      if (code4 === 62) {
        effects.exit("autolinkProtocol");
        effects.enter("autolinkMarker");
        effects.consume(code4);
        effects.exit("autolinkMarker");
        effects.exit("autolink");
        return ok3;
      }
      if (code4 === null || code4 === 32 || code4 === 60 || asciiControl(code4)) {
        return nok(code4);
      }
      effects.consume(code4);
      return urlInside;
    }
    function emailAtext(code4) {
      if (code4 === 64) {
        effects.consume(code4);
        return emailAtSignOrDot;
      }
      if (asciiAtext(code4)) {
        effects.consume(code4);
        return emailAtext;
      }
      return nok(code4);
    }
    function emailAtSignOrDot(code4) {
      return asciiAlphanumeric(code4) ? emailLabel(code4) : nok(code4);
    }
    function emailLabel(code4) {
      if (code4 === 46) {
        effects.consume(code4);
        size = 0;
        return emailAtSignOrDot;
      }
      if (code4 === 62) {
        effects.exit("autolinkProtocol").type = "autolinkEmail";
        effects.enter("autolinkMarker");
        effects.consume(code4);
        effects.exit("autolinkMarker");
        effects.exit("autolink");
        return ok3;
      }
      return emailValue(code4);
    }
    function emailValue(code4) {
      if ((code4 === 45 || asciiAlphanumeric(code4)) && size++ < 63) {
        const next = code4 === 45 ? emailValue : emailLabel;
        effects.consume(code4);
        return next;
      }
      return nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/blank-line.js
  init_define_import_meta_env();
  var blankLine = {
    partial: true,
    tokenize: tokenizeBlankLine
  };
  function tokenizeBlankLine(effects, ok3, nok) {
    return start2;
    function start2(code4) {
      return markdownSpace(code4) ? factorySpace(effects, after, "linePrefix")(code4) : after(code4);
    }
    function after(code4) {
      return code4 === null || markdownLineEnding(code4) ? ok3(code4) : nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/block-quote.js
  init_define_import_meta_env();
  var blockQuote = {
    continuation: {
      tokenize: tokenizeBlockQuoteContinuation
    },
    exit,
    name: "blockQuote",
    tokenize: tokenizeBlockQuoteStart
  };
  function tokenizeBlockQuoteStart(effects, ok3, nok) {
    const self2 = this;
    return start2;
    function start2(code4) {
      if (code4 === 62) {
        const state = self2.containerState;
        if (!state.open) {
          effects.enter("blockQuote", {
            _container: true
          });
          state.open = true;
        }
        effects.enter("blockQuotePrefix");
        effects.enter("blockQuoteMarker");
        effects.consume(code4);
        effects.exit("blockQuoteMarker");
        return after;
      }
      return nok(code4);
    }
    function after(code4) {
      if (markdownSpace(code4)) {
        effects.enter("blockQuotePrefixWhitespace");
        effects.consume(code4);
        effects.exit("blockQuotePrefixWhitespace");
        effects.exit("blockQuotePrefix");
        return ok3;
      }
      effects.exit("blockQuotePrefix");
      return ok3(code4);
    }
  }
  function tokenizeBlockQuoteContinuation(effects, ok3, nok) {
    const self2 = this;
    return contStart;
    function contStart(code4) {
      if (markdownSpace(code4)) {
        return factorySpace(effects, contBefore, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code4);
      }
      return contBefore(code4);
    }
    function contBefore(code4) {
      return effects.attempt(blockQuote, ok3, nok)(code4);
    }
  }
  function exit(effects) {
    effects.exit("blockQuote");
  }

  // node_modules/micromark-core-commonmark/lib/character-escape.js
  init_define_import_meta_env();
  var characterEscape = {
    name: "characterEscape",
    tokenize: tokenizeCharacterEscape
  };
  function tokenizeCharacterEscape(effects, ok3, nok) {
    return start2;
    function start2(code4) {
      effects.enter("characterEscape");
      effects.enter("escapeMarker");
      effects.consume(code4);
      effects.exit("escapeMarker");
      return inside;
    }
    function inside(code4) {
      if (asciiPunctuation(code4)) {
        effects.enter("characterEscapeValue");
        effects.consume(code4);
        effects.exit("characterEscapeValue");
        effects.exit("characterEscape");
        return ok3;
      }
      return nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/character-reference.js
  init_define_import_meta_env();
  var characterReference = {
    name: "characterReference",
    tokenize: tokenizeCharacterReference
  };
  function tokenizeCharacterReference(effects, ok3, nok) {
    const self2 = this;
    let size = 0;
    let max;
    let test;
    return start2;
    function start2(code4) {
      effects.enter("characterReference");
      effects.enter("characterReferenceMarker");
      effects.consume(code4);
      effects.exit("characterReferenceMarker");
      return open;
    }
    function open(code4) {
      if (code4 === 35) {
        effects.enter("characterReferenceMarkerNumeric");
        effects.consume(code4);
        effects.exit("characterReferenceMarkerNumeric");
        return numeric;
      }
      effects.enter("characterReferenceValue");
      max = 31;
      test = asciiAlphanumeric;
      return value(code4);
    }
    function numeric(code4) {
      if (code4 === 88 || code4 === 120) {
        effects.enter("characterReferenceMarkerHexadecimal");
        effects.consume(code4);
        effects.exit("characterReferenceMarkerHexadecimal");
        effects.enter("characterReferenceValue");
        max = 6;
        test = asciiHexDigit;
        return value;
      }
      effects.enter("characterReferenceValue");
      max = 7;
      test = asciiDigit;
      return value(code4);
    }
    function value(code4) {
      if (code4 === 59 && size) {
        const token = effects.exit("characterReferenceValue");
        if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self2.sliceSerialize(token))) {
          return nok(code4);
        }
        effects.enter("characterReferenceMarker");
        effects.consume(code4);
        effects.exit("characterReferenceMarker");
        effects.exit("characterReference");
        return ok3;
      }
      if (test(code4) && size++ < max) {
        effects.consume(code4);
        return value;
      }
      return nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/code-fenced.js
  init_define_import_meta_env();
  var nonLazyContinuation = {
    partial: true,
    tokenize: tokenizeNonLazyContinuation
  };
  var codeFenced = {
    concrete: true,
    name: "codeFenced",
    tokenize: tokenizeCodeFenced
  };
  function tokenizeCodeFenced(effects, ok3, nok) {
    const self2 = this;
    const closeStart = {
      partial: true,
      tokenize: tokenizeCloseStart
    };
    let initialPrefix = 0;
    let sizeOpen = 0;
    let marker;
    return start2;
    function start2(code4) {
      return beforeSequenceOpen(code4);
    }
    function beforeSequenceOpen(code4) {
      const tail = self2.events[self2.events.length - 1];
      initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
      marker = code4;
      effects.enter("codeFenced");
      effects.enter("codeFencedFence");
      effects.enter("codeFencedFenceSequence");
      return sequenceOpen(code4);
    }
    function sequenceOpen(code4) {
      if (code4 === marker) {
        sizeOpen++;
        effects.consume(code4);
        return sequenceOpen;
      }
      if (sizeOpen < 3) {
        return nok(code4);
      }
      effects.exit("codeFencedFenceSequence");
      return markdownSpace(code4) ? factorySpace(effects, infoBefore, "whitespace")(code4) : infoBefore(code4);
    }
    function infoBefore(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("codeFencedFence");
        return self2.interrupt ? ok3(code4) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code4);
      }
      effects.enter("codeFencedFenceInfo");
      effects.enter("chunkString", {
        contentType: "string"
      });
      return info(code4);
    }
    function info(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("chunkString");
        effects.exit("codeFencedFenceInfo");
        return infoBefore(code4);
      }
      if (markdownSpace(code4)) {
        effects.exit("chunkString");
        effects.exit("codeFencedFenceInfo");
        return factorySpace(effects, metaBefore, "whitespace")(code4);
      }
      if (code4 === 96 && code4 === marker) {
        return nok(code4);
      }
      effects.consume(code4);
      return info;
    }
    function metaBefore(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        return infoBefore(code4);
      }
      effects.enter("codeFencedFenceMeta");
      effects.enter("chunkString", {
        contentType: "string"
      });
      return meta(code4);
    }
    function meta(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("chunkString");
        effects.exit("codeFencedFenceMeta");
        return infoBefore(code4);
      }
      if (code4 === 96 && code4 === marker) {
        return nok(code4);
      }
      effects.consume(code4);
      return meta;
    }
    function atNonLazyBreak(code4) {
      return effects.attempt(closeStart, after, contentBefore)(code4);
    }
    function contentBefore(code4) {
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return contentStart;
    }
    function contentStart(code4) {
      return initialPrefix > 0 && markdownSpace(code4) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code4) : beforeContentChunk(code4);
    }
    function beforeContentChunk(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code4);
      }
      effects.enter("codeFlowValue");
      return contentChunk(code4);
    }
    function contentChunk(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("codeFlowValue");
        return beforeContentChunk(code4);
      }
      effects.consume(code4);
      return contentChunk;
    }
    function after(code4) {
      effects.exit("codeFenced");
      return ok3(code4);
    }
    function tokenizeCloseStart(effects2, ok4, nok2) {
      let size = 0;
      return startBefore;
      function startBefore(code4) {
        effects2.enter("lineEnding");
        effects2.consume(code4);
        effects2.exit("lineEnding");
        return start3;
      }
      function start3(code4) {
        effects2.enter("codeFencedFence");
        return markdownSpace(code4) ? factorySpace(effects2, beforeSequenceClose, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code4) : beforeSequenceClose(code4);
      }
      function beforeSequenceClose(code4) {
        if (code4 === marker) {
          effects2.enter("codeFencedFenceSequence");
          return sequenceClose(code4);
        }
        return nok2(code4);
      }
      function sequenceClose(code4) {
        if (code4 === marker) {
          size++;
          effects2.consume(code4);
          return sequenceClose;
        }
        if (size >= sizeOpen) {
          effects2.exit("codeFencedFenceSequence");
          return markdownSpace(code4) ? factorySpace(effects2, sequenceCloseAfter, "whitespace")(code4) : sequenceCloseAfter(code4);
        }
        return nok2(code4);
      }
      function sequenceCloseAfter(code4) {
        if (code4 === null || markdownLineEnding(code4)) {
          effects2.exit("codeFencedFence");
          return ok4(code4);
        }
        return nok2(code4);
      }
    }
  }
  function tokenizeNonLazyContinuation(effects, ok3, nok) {
    const self2 = this;
    return start2;
    function start2(code4) {
      if (code4 === null) {
        return nok(code4);
      }
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return lineStart;
    }
    function lineStart(code4) {
      return self2.parser.lazy[self2.now().line] ? nok(code4) : ok3(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/code-indented.js
  init_define_import_meta_env();
  var codeIndented = {
    name: "codeIndented",
    tokenize: tokenizeCodeIndented
  };
  var furtherStart = {
    partial: true,
    tokenize: tokenizeFurtherStart
  };
  function tokenizeCodeIndented(effects, ok3, nok) {
    const self2 = this;
    return start2;
    function start2(code4) {
      effects.enter("codeIndented");
      return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code4);
    }
    function afterPrefix(code4) {
      const tail = self2.events[self2.events.length - 1];
      return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code4) : nok(code4);
    }
    function atBreak(code4) {
      if (code4 === null) {
        return after(code4);
      }
      if (markdownLineEnding(code4)) {
        return effects.attempt(furtherStart, atBreak, after)(code4);
      }
      effects.enter("codeFlowValue");
      return inside(code4);
    }
    function inside(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("codeFlowValue");
        return atBreak(code4);
      }
      effects.consume(code4);
      return inside;
    }
    function after(code4) {
      effects.exit("codeIndented");
      return ok3(code4);
    }
  }
  function tokenizeFurtherStart(effects, ok3, nok) {
    const self2 = this;
    return furtherStart2;
    function furtherStart2(code4) {
      if (self2.parser.lazy[self2.now().line]) {
        return nok(code4);
      }
      if (markdownLineEnding(code4)) {
        effects.enter("lineEnding");
        effects.consume(code4);
        effects.exit("lineEnding");
        return furtherStart2;
      }
      return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code4);
    }
    function afterPrefix(code4) {
      const tail = self2.events[self2.events.length - 1];
      return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok3(code4) : markdownLineEnding(code4) ? furtherStart2(code4) : nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/code-text.js
  init_define_import_meta_env();
  var codeText = {
    name: "codeText",
    previous,
    resolve: resolveCodeText,
    tokenize: tokenizeCodeText
  };
  function resolveCodeText(events) {
    let tailExitIndex = events.length - 4;
    let headEnterIndex = 3;
    let index2;
    let enter;
    if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
      index2 = headEnterIndex;
      while (++index2 < tailExitIndex) {
        if (events[index2][1].type === "codeTextData") {
          events[headEnterIndex][1].type = "codeTextPadding";
          events[tailExitIndex][1].type = "codeTextPadding";
          headEnterIndex += 2;
          tailExitIndex -= 2;
          break;
        }
      }
    }
    index2 = headEnterIndex - 1;
    tailExitIndex++;
    while (++index2 <= tailExitIndex) {
      if (enter === void 0) {
        if (index2 !== tailExitIndex && events[index2][1].type !== "lineEnding") {
          enter = index2;
        }
      } else if (index2 === tailExitIndex || events[index2][1].type === "lineEnding") {
        events[enter][1].type = "codeTextData";
        if (index2 !== enter + 2) {
          events[enter][1].end = events[index2 - 1][1].end;
          events.splice(enter + 2, index2 - enter - 2);
          tailExitIndex -= index2 - enter - 2;
          index2 = enter + 2;
        }
        enter = void 0;
      }
    }
    return events;
  }
  function previous(code4) {
    return code4 !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
  }
  function tokenizeCodeText(effects, ok3, nok) {
    const self2 = this;
    let sizeOpen = 0;
    let size;
    let token;
    return start2;
    function start2(code4) {
      effects.enter("codeText");
      effects.enter("codeTextSequence");
      return sequenceOpen(code4);
    }
    function sequenceOpen(code4) {
      if (code4 === 96) {
        effects.consume(code4);
        sizeOpen++;
        return sequenceOpen;
      }
      effects.exit("codeTextSequence");
      return between(code4);
    }
    function between(code4) {
      if (code4 === null) {
        return nok(code4);
      }
      if (code4 === 32) {
        effects.enter("space");
        effects.consume(code4);
        effects.exit("space");
        return between;
      }
      if (code4 === 96) {
        token = effects.enter("codeTextSequence");
        size = 0;
        return sequenceClose(code4);
      }
      if (markdownLineEnding(code4)) {
        effects.enter("lineEnding");
        effects.consume(code4);
        effects.exit("lineEnding");
        return between;
      }
      effects.enter("codeTextData");
      return data(code4);
    }
    function data(code4) {
      if (code4 === null || code4 === 32 || code4 === 96 || markdownLineEnding(code4)) {
        effects.exit("codeTextData");
        return between(code4);
      }
      effects.consume(code4);
      return data;
    }
    function sequenceClose(code4) {
      if (code4 === 96) {
        effects.consume(code4);
        size++;
        return sequenceClose;
      }
      if (size === sizeOpen) {
        effects.exit("codeTextSequence");
        effects.exit("codeText");
        return ok3(code4);
      }
      token.type = "codeTextData";
      return data(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/content.js
  init_define_import_meta_env();

  // node_modules/micromark-util-subtokenize/index.js
  init_define_import_meta_env();

  // node_modules/micromark-util-subtokenize/lib/splice-buffer.js
  init_define_import_meta_env();
  var SpliceBuffer = class {
    /**
     * @param {ReadonlyArray<T> | null | undefined} [initial]
     *   Initial items (optional).
     * @returns
     *   Splice buffer.
     */
    constructor(initial) {
      this.left = initial ? [...initial] : [];
      this.right = [];
    }
    /**
     * Array access;
     * does not move the cursor.
     *
     * @param {number} index
     *   Index.
     * @return {T}
     *   Item.
     */
    get(index2) {
      if (index2 < 0 || index2 >= this.left.length + this.right.length) {
        throw new RangeError("Cannot access index `" + index2 + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
      }
      if (index2 < this.left.length) return this.left[index2];
      return this.right[this.right.length - index2 + this.left.length - 1];
    }
    /**
     * The length of the splice buffer, one greater than the largest index in the
     * array.
     */
    get length() {
      return this.left.length + this.right.length;
    }
    /**
     * Remove and return `list[0]`;
     * moves the cursor to `0`.
     *
     * @returns {T | undefined}
     *   Item, optional.
     */
    shift() {
      this.setCursor(0);
      return this.right.pop();
    }
    /**
     * Slice the buffer to get an array;
     * does not move the cursor.
     *
     * @param {number} start
     *   Start.
     * @param {number | null | undefined} [end]
     *   End (optional).
     * @returns {Array<T>}
     *   Array of items.
     */
    slice(start2, end) {
      const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
      if (stop < this.left.length) {
        return this.left.slice(start2, stop);
      }
      if (start2 > this.left.length) {
        return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start2 + this.left.length).reverse();
      }
      return this.left.slice(start2).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
    }
    /**
     * Mimics the behavior of Array.prototype.splice() except for the change of
     * interface necessary to avoid segfaults when patching in very large arrays.
     *
     * This operation moves cursor is moved to `start` and results in the cursor
     * placed after any inserted items.
     *
     * @param {number} start
     *   Start;
     *   zero-based index at which to start changing the array;
     *   negative numbers count backwards from the end of the array and values
     *   that are out-of bounds are clamped to the appropriate end of the array.
     * @param {number | null | undefined} [deleteCount=0]
     *   Delete count (default: `0`);
     *   maximum number of elements to delete, starting from start.
     * @param {Array<T> | null | undefined} [items=[]]
     *   Items to include in place of the deleted items (default: `[]`).
     * @return {Array<T>}
     *   Any removed items.
     */
    splice(start2, deleteCount, items) {
      const count = deleteCount || 0;
      this.setCursor(Math.trunc(start2));
      const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
      if (items) chunkedPush(this.left, items);
      return removed.reverse();
    }
    /**
     * Remove and return the highest-numbered item in the array, so
     * `list[list.length - 1]`;
     * Moves the cursor to `length`.
     *
     * @returns {T | undefined}
     *   Item, optional.
     */
    pop() {
      this.setCursor(Number.POSITIVE_INFINITY);
      return this.left.pop();
    }
    /**
     * Inserts a single item to the high-numbered side of the array;
     * moves the cursor to `length`.
     *
     * @param {T} item
     *   Item.
     * @returns {undefined}
     *   Nothing.
     */
    push(item) {
      this.setCursor(Number.POSITIVE_INFINITY);
      this.left.push(item);
    }
    /**
     * Inserts many items to the high-numbered side of the array.
     * Moves the cursor to `length`.
     *
     * @param {Array<T>} items
     *   Items.
     * @returns {undefined}
     *   Nothing.
     */
    pushMany(items) {
      this.setCursor(Number.POSITIVE_INFINITY);
      chunkedPush(this.left, items);
    }
    /**
     * Inserts a single item to the low-numbered side of the array;
     * Moves the cursor to `0`.
     *
     * @param {T} item
     *   Item.
     * @returns {undefined}
     *   Nothing.
     */
    unshift(item) {
      this.setCursor(0);
      this.right.push(item);
    }
    /**
     * Inserts many items to the low-numbered side of the array;
     * moves the cursor to `0`.
     *
     * @param {Array<T>} items
     *   Items.
     * @returns {undefined}
     *   Nothing.
     */
    unshiftMany(items) {
      this.setCursor(0);
      chunkedPush(this.right, items.reverse());
    }
    /**
     * Move the cursor to a specific position in the array. Requires
     * time proportional to the distance moved.
     *
     * If `n < 0`, the cursor will end up at the beginning.
     * If `n > length`, the cursor will end up at the end.
     *
     * @param {number} n
     *   Position.
     * @return {undefined}
     *   Nothing.
     */
    setCursor(n) {
      if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
      if (n < this.left.length) {
        const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
        chunkedPush(this.right, removed.reverse());
      } else {
        const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
        chunkedPush(this.left, removed.reverse());
      }
    }
  };
  function chunkedPush(list4, right) {
    let chunkStart = 0;
    if (right.length < 1e4) {
      list4.push(...right);
    } else {
      while (chunkStart < right.length) {
        list4.push(...right.slice(chunkStart, chunkStart + 1e4));
        chunkStart += 1e4;
      }
    }
  }

  // node_modules/micromark-util-subtokenize/index.js
  function subtokenize(eventsArray) {
    const jumps = {};
    let index2 = -1;
    let event;
    let lineIndex;
    let otherIndex;
    let otherEvent;
    let parameters;
    let subevents;
    let more;
    const events = new SpliceBuffer(eventsArray);
    while (++index2 < events.length) {
      while (index2 in jumps) {
        index2 = jumps[index2];
      }
      event = events.get(index2);
      if (index2 && event[1].type === "chunkFlow" && events.get(index2 - 1)[1].type === "listItemPrefix") {
        subevents = event[1]._tokenizer.events;
        otherIndex = 0;
        if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") {
          otherIndex += 2;
        }
        if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") {
          while (++otherIndex < subevents.length) {
            if (subevents[otherIndex][1].type === "content") {
              break;
            }
            if (subevents[otherIndex][1].type === "chunkText") {
              subevents[otherIndex][1]._isInFirstContentOfListItem = true;
              otherIndex++;
            }
          }
        }
      }
      if (event[0] === "enter") {
        if (event[1].contentType) {
          Object.assign(jumps, subcontent(events, index2));
          index2 = jumps[index2];
          more = true;
        }
      } else if (event[1]._container) {
        otherIndex = index2;
        lineIndex = void 0;
        while (otherIndex--) {
          otherEvent = events.get(otherIndex);
          if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
            if (otherEvent[0] === "enter") {
              if (lineIndex) {
                events.get(lineIndex)[1].type = "lineEndingBlank";
              }
              otherEvent[1].type = "lineEnding";
              lineIndex = otherIndex;
            }
          } else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {
          } else {
            break;
          }
        }
        if (lineIndex) {
          event[1].end = {
            ...events.get(lineIndex)[1].start
          };
          parameters = events.slice(lineIndex, index2);
          parameters.unshift(event);
          events.splice(lineIndex, index2 - lineIndex + 1, parameters);
        }
      }
    }
    splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
    return !more;
  }
  function subcontent(events, eventIndex) {
    const token = events.get(eventIndex)[1];
    const context = events.get(eventIndex)[2];
    let startPosition = eventIndex - 1;
    const startPositions = [];
    let tokenizer = token._tokenizer;
    if (!tokenizer) {
      tokenizer = context.parser[token.contentType](token.start);
      if (token._contentTypeTextTrailing) {
        tokenizer._contentTypeTextTrailing = true;
      }
    }
    const childEvents = tokenizer.events;
    const jumps = [];
    const gaps = {};
    let stream;
    let previous3;
    let index2 = -1;
    let current = token;
    let adjust = 0;
    let start2 = 0;
    const breaks = [start2];
    while (current) {
      while (events.get(++startPosition)[1] !== current) {
      }
      startPositions.push(startPosition);
      if (!current._tokenizer) {
        stream = context.sliceStream(current);
        if (!current.next) {
          stream.push(null);
        }
        if (previous3) {
          tokenizer.defineSkip(current.start);
        }
        if (current._isInFirstContentOfListItem) {
          tokenizer._gfmTasklistFirstContentOfListItem = true;
        }
        tokenizer.write(stream);
        if (current._isInFirstContentOfListItem) {
          tokenizer._gfmTasklistFirstContentOfListItem = void 0;
        }
      }
      previous3 = current;
      current = current.next;
    }
    current = token;
    while (++index2 < childEvents.length) {
      if (
        // Find a void token that includes a break.
        childEvents[index2][0] === "exit" && childEvents[index2 - 1][0] === "enter" && childEvents[index2][1].type === childEvents[index2 - 1][1].type && childEvents[index2][1].start.line !== childEvents[index2][1].end.line
      ) {
        start2 = index2 + 1;
        breaks.push(start2);
        current._tokenizer = void 0;
        current.previous = void 0;
        current = current.next;
      }
    }
    tokenizer.events = [];
    if (current) {
      current._tokenizer = void 0;
      current.previous = void 0;
    } else {
      breaks.pop();
    }
    index2 = breaks.length;
    while (index2--) {
      const slice = childEvents.slice(breaks[index2], breaks[index2 + 1]);
      const start3 = startPositions.pop();
      jumps.push([start3, start3 + slice.length - 1]);
      events.splice(start3, 2, slice);
    }
    jumps.reverse();
    index2 = -1;
    while (++index2 < jumps.length) {
      gaps[adjust + jumps[index2][0]] = adjust + jumps[index2][1];
      adjust += jumps[index2][1] - jumps[index2][0] - 1;
    }
    return gaps;
  }

  // node_modules/micromark-core-commonmark/lib/content.js
  var content2 = {
    resolve: resolveContent,
    tokenize: tokenizeContent
  };
  var continuationConstruct = {
    partial: true,
    tokenize: tokenizeContinuation
  };
  function resolveContent(events) {
    subtokenize(events);
    return events;
  }
  function tokenizeContent(effects, ok3) {
    let previous3;
    return chunkStart;
    function chunkStart(code4) {
      effects.enter("content");
      previous3 = effects.enter("chunkContent", {
        contentType: "content"
      });
      return chunkInside(code4);
    }
    function chunkInside(code4) {
      if (code4 === null) {
        return contentEnd(code4);
      }
      if (markdownLineEnding(code4)) {
        return effects.check(continuationConstruct, contentContinue, contentEnd)(code4);
      }
      effects.consume(code4);
      return chunkInside;
    }
    function contentEnd(code4) {
      effects.exit("chunkContent");
      effects.exit("content");
      return ok3(code4);
    }
    function contentContinue(code4) {
      effects.consume(code4);
      effects.exit("chunkContent");
      previous3.next = effects.enter("chunkContent", {
        contentType: "content",
        previous: previous3
      });
      previous3 = previous3.next;
      return chunkInside;
    }
  }
  function tokenizeContinuation(effects, ok3, nok) {
    const self2 = this;
    return startLookahead;
    function startLookahead(code4) {
      effects.exit("chunkContent");
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return factorySpace(effects, prefixed, "linePrefix");
    }
    function prefixed(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        return nok(code4);
      }
      const tail = self2.events[self2.events.length - 1];
      if (!self2.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) {
        return ok3(code4);
      }
      return effects.interrupt(self2.parser.constructs.flow, nok, ok3)(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/definition.js
  init_define_import_meta_env();

  // node_modules/micromark-factory-destination/index.js
  init_define_import_meta_env();
  function factoryDestination(effects, ok3, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
    const limit = max || Number.POSITIVE_INFINITY;
    let balance = 0;
    return start2;
    function start2(code4) {
      if (code4 === 60) {
        effects.enter(type);
        effects.enter(literalType);
        effects.enter(literalMarkerType);
        effects.consume(code4);
        effects.exit(literalMarkerType);
        return enclosedBefore;
      }
      if (code4 === null || code4 === 32 || code4 === 41 || asciiControl(code4)) {
        return nok(code4);
      }
      effects.enter(type);
      effects.enter(rawType);
      effects.enter(stringType);
      effects.enter("chunkString", {
        contentType: "string"
      });
      return raw(code4);
    }
    function enclosedBefore(code4) {
      if (code4 === 62) {
        effects.enter(literalMarkerType);
        effects.consume(code4);
        effects.exit(literalMarkerType);
        effects.exit(literalType);
        effects.exit(type);
        return ok3;
      }
      effects.enter(stringType);
      effects.enter("chunkString", {
        contentType: "string"
      });
      return enclosed(code4);
    }
    function enclosed(code4) {
      if (code4 === 62) {
        effects.exit("chunkString");
        effects.exit(stringType);
        return enclosedBefore(code4);
      }
      if (code4 === null || code4 === 60 || markdownLineEnding(code4)) {
        return nok(code4);
      }
      effects.consume(code4);
      return code4 === 92 ? enclosedEscape : enclosed;
    }
    function enclosedEscape(code4) {
      if (code4 === 60 || code4 === 62 || code4 === 92) {
        effects.consume(code4);
        return enclosed;
      }
      return enclosed(code4);
    }
    function raw(code4) {
      if (!balance && (code4 === null || code4 === 41 || markdownLineEndingOrSpace(code4))) {
        effects.exit("chunkString");
        effects.exit(stringType);
        effects.exit(rawType);
        effects.exit(type);
        return ok3(code4);
      }
      if (balance < limit && code4 === 40) {
        effects.consume(code4);
        balance++;
        return raw;
      }
      if (code4 === 41) {
        effects.consume(code4);
        balance--;
        return raw;
      }
      if (code4 === null || code4 === 32 || code4 === 40 || asciiControl(code4)) {
        return nok(code4);
      }
      effects.consume(code4);
      return code4 === 92 ? rawEscape : raw;
    }
    function rawEscape(code4) {
      if (code4 === 40 || code4 === 41 || code4 === 92) {
        effects.consume(code4);
        return raw;
      }
      return raw(code4);
    }
  }

  // node_modules/micromark-factory-label/index.js
  init_define_import_meta_env();
  function factoryLabel(effects, ok3, nok, type, markerType, stringType) {
    const self2 = this;
    let size = 0;
    let seen;
    return start2;
    function start2(code4) {
      effects.enter(type);
      effects.enter(markerType);
      effects.consume(code4);
      effects.exit(markerType);
      effects.enter(stringType);
      return atBreak;
    }
    function atBreak(code4) {
      if (size > 999 || code4 === null || code4 === 91 || code4 === 93 && !seen || // To do: remove in the future once we’ve switched from
      // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
      // which doesn’t need this.
      // Hidden footnotes hook.
      /* c8 ignore next 3 */
      code4 === 94 && !size && "_hiddenFootnoteSupport" in self2.parser.constructs) {
        return nok(code4);
      }
      if (code4 === 93) {
        effects.exit(stringType);
        effects.enter(markerType);
        effects.consume(code4);
        effects.exit(markerType);
        effects.exit(type);
        return ok3;
      }
      if (markdownLineEnding(code4)) {
        effects.enter("lineEnding");
        effects.consume(code4);
        effects.exit("lineEnding");
        return atBreak;
      }
      effects.enter("chunkString", {
        contentType: "string"
      });
      return labelInside(code4);
    }
    function labelInside(code4) {
      if (code4 === null || code4 === 91 || code4 === 93 || markdownLineEnding(code4) || size++ > 999) {
        effects.exit("chunkString");
        return atBreak(code4);
      }
      effects.consume(code4);
      if (!seen) seen = !markdownSpace(code4);
      return code4 === 92 ? labelEscape : labelInside;
    }
    function labelEscape(code4) {
      if (code4 === 91 || code4 === 92 || code4 === 93) {
        effects.consume(code4);
        size++;
        return labelInside;
      }
      return labelInside(code4);
    }
  }

  // node_modules/micromark-factory-title/index.js
  init_define_import_meta_env();
  function factoryTitle(effects, ok3, nok, type, markerType, stringType) {
    let marker;
    return start2;
    function start2(code4) {
      if (code4 === 34 || code4 === 39 || code4 === 40) {
        effects.enter(type);
        effects.enter(markerType);
        effects.consume(code4);
        effects.exit(markerType);
        marker = code4 === 40 ? 41 : code4;
        return begin;
      }
      return nok(code4);
    }
    function begin(code4) {
      if (code4 === marker) {
        effects.enter(markerType);
        effects.consume(code4);
        effects.exit(markerType);
        effects.exit(type);
        return ok3;
      }
      effects.enter(stringType);
      return atBreak(code4);
    }
    function atBreak(code4) {
      if (code4 === marker) {
        effects.exit(stringType);
        return begin(marker);
      }
      if (code4 === null) {
        return nok(code4);
      }
      if (markdownLineEnding(code4)) {
        effects.enter("lineEnding");
        effects.consume(code4);
        effects.exit("lineEnding");
        return factorySpace(effects, atBreak, "linePrefix");
      }
      effects.enter("chunkString", {
        contentType: "string"
      });
      return inside(code4);
    }
    function inside(code4) {
      if (code4 === marker || code4 === null || markdownLineEnding(code4)) {
        effects.exit("chunkString");
        return atBreak(code4);
      }
      effects.consume(code4);
      return code4 === 92 ? escape : inside;
    }
    function escape(code4) {
      if (code4 === marker || code4 === 92) {
        effects.consume(code4);
        return inside;
      }
      return inside(code4);
    }
  }

  // node_modules/micromark-factory-whitespace/index.js
  init_define_import_meta_env();
  function factoryWhitespace(effects, ok3) {
    let seen;
    return start2;
    function start2(code4) {
      if (markdownLineEnding(code4)) {
        effects.enter("lineEnding");
        effects.consume(code4);
        effects.exit("lineEnding");
        seen = true;
        return start2;
      }
      if (markdownSpace(code4)) {
        return factorySpace(effects, start2, seen ? "linePrefix" : "lineSuffix")(code4);
      }
      return ok3(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/definition.js
  var definition = {
    name: "definition",
    tokenize: tokenizeDefinition
  };
  var titleBefore = {
    partial: true,
    tokenize: tokenizeTitleBefore
  };
  function tokenizeDefinition(effects, ok3, nok) {
    const self2 = this;
    let identifier;
    return start2;
    function start2(code4) {
      effects.enter("definition");
      return before(code4);
    }
    function before(code4) {
      return factoryLabel.call(
        self2,
        effects,
        labelAfter,
        // Note: we don’t need to reset the way `markdown-rs` does.
        nok,
        "definitionLabel",
        "definitionLabelMarker",
        "definitionLabelString"
      )(code4);
    }
    function labelAfter(code4) {
      identifier = normalizeIdentifier(self2.sliceSerialize(self2.events[self2.events.length - 1][1]).slice(1, -1));
      if (code4 === 58) {
        effects.enter("definitionMarker");
        effects.consume(code4);
        effects.exit("definitionMarker");
        return markerAfter;
      }
      return nok(code4);
    }
    function markerAfter(code4) {
      return markdownLineEndingOrSpace(code4) ? factoryWhitespace(effects, destinationBefore)(code4) : destinationBefore(code4);
    }
    function destinationBefore(code4) {
      return factoryDestination(
        effects,
        destinationAfter,
        // Note: we don’t need to reset the way `markdown-rs` does.
        nok,
        "definitionDestination",
        "definitionDestinationLiteral",
        "definitionDestinationLiteralMarker",
        "definitionDestinationRaw",
        "definitionDestinationString"
      )(code4);
    }
    function destinationAfter(code4) {
      return effects.attempt(titleBefore, after, after)(code4);
    }
    function after(code4) {
      return markdownSpace(code4) ? factorySpace(effects, afterWhitespace, "whitespace")(code4) : afterWhitespace(code4);
    }
    function afterWhitespace(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("definition");
        self2.parser.defined.push(identifier);
        return ok3(code4);
      }
      return nok(code4);
    }
  }
  function tokenizeTitleBefore(effects, ok3, nok) {
    return titleBefore2;
    function titleBefore2(code4) {
      return markdownLineEndingOrSpace(code4) ? factoryWhitespace(effects, beforeMarker)(code4) : nok(code4);
    }
    function beforeMarker(code4) {
      return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code4);
    }
    function titleAfter(code4) {
      return markdownSpace(code4) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code4) : titleAfterOptionalWhitespace(code4);
    }
    function titleAfterOptionalWhitespace(code4) {
      return code4 === null || markdownLineEnding(code4) ? ok3(code4) : nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/hard-break-escape.js
  init_define_import_meta_env();
  var hardBreakEscape = {
    name: "hardBreakEscape",
    tokenize: tokenizeHardBreakEscape
  };
  function tokenizeHardBreakEscape(effects, ok3, nok) {
    return start2;
    function start2(code4) {
      effects.enter("hardBreakEscape");
      effects.consume(code4);
      return after;
    }
    function after(code4) {
      if (markdownLineEnding(code4)) {
        effects.exit("hardBreakEscape");
        return ok3(code4);
      }
      return nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/heading-atx.js
  init_define_import_meta_env();
  var headingAtx = {
    name: "headingAtx",
    resolve: resolveHeadingAtx,
    tokenize: tokenizeHeadingAtx
  };
  function resolveHeadingAtx(events, context) {
    let contentEnd = events.length - 2;
    let contentStart = 3;
    let content3;
    let text7;
    if (events[contentStart][1].type === "whitespace") {
      contentStart += 2;
    }
    if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") {
      contentEnd -= 2;
    }
    if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) {
      contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
    }
    if (contentEnd > contentStart) {
      content3 = {
        type: "atxHeadingText",
        start: events[contentStart][1].start,
        end: events[contentEnd][1].end
      };
      text7 = {
        type: "chunkText",
        start: events[contentStart][1].start,
        end: events[contentEnd][1].end,
        contentType: "text"
      };
      splice(events, contentStart, contentEnd - contentStart + 1, [["enter", content3, context], ["enter", text7, context], ["exit", text7, context], ["exit", content3, context]]);
    }
    return events;
  }
  function tokenizeHeadingAtx(effects, ok3, nok) {
    let size = 0;
    return start2;
    function start2(code4) {
      effects.enter("atxHeading");
      return before(code4);
    }
    function before(code4) {
      effects.enter("atxHeadingSequence");
      return sequenceOpen(code4);
    }
    function sequenceOpen(code4) {
      if (code4 === 35 && size++ < 6) {
        effects.consume(code4);
        return sequenceOpen;
      }
      if (code4 === null || markdownLineEndingOrSpace(code4)) {
        effects.exit("atxHeadingSequence");
        return atBreak(code4);
      }
      return nok(code4);
    }
    function atBreak(code4) {
      if (code4 === 35) {
        effects.enter("atxHeadingSequence");
        return sequenceFurther(code4);
      }
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("atxHeading");
        return ok3(code4);
      }
      if (markdownSpace(code4)) {
        return factorySpace(effects, atBreak, "whitespace")(code4);
      }
      effects.enter("atxHeadingText");
      return data(code4);
    }
    function sequenceFurther(code4) {
      if (code4 === 35) {
        effects.consume(code4);
        return sequenceFurther;
      }
      effects.exit("atxHeadingSequence");
      return atBreak(code4);
    }
    function data(code4) {
      if (code4 === null || code4 === 35 || markdownLineEndingOrSpace(code4)) {
        effects.exit("atxHeadingText");
        return atBreak(code4);
      }
      effects.consume(code4);
      return data;
    }
  }

  // node_modules/micromark-core-commonmark/lib/html-flow.js
  init_define_import_meta_env();

  // node_modules/micromark-util-html-tag-name/index.js
  init_define_import_meta_env();
  var htmlBlockNames = [
    "address",
    "article",
    "aside",
    "base",
    "basefont",
    "blockquote",
    "body",
    "caption",
    "center",
    "col",
    "colgroup",
    "dd",
    "details",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "html",
    "iframe",
    "legend",
    "li",
    "link",
    "main",
    "menu",
    "menuitem",
    "nav",
    "noframes",
    "ol",
    "optgroup",
    "option",
    "p",
    "param",
    "search",
    "section",
    "summary",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "title",
    "tr",
    "track",
    "ul"
  ];
  var htmlRawNames = ["pre", "script", "style", "textarea"];

  // node_modules/micromark-core-commonmark/lib/html-flow.js
  var htmlFlow = {
    concrete: true,
    name: "htmlFlow",
    resolveTo: resolveToHtmlFlow,
    tokenize: tokenizeHtmlFlow
  };
  var blankLineBefore = {
    partial: true,
    tokenize: tokenizeBlankLineBefore
  };
  var nonLazyContinuationStart = {
    partial: true,
    tokenize: tokenizeNonLazyContinuationStart
  };
  function resolveToHtmlFlow(events) {
    let index2 = events.length;
    while (index2--) {
      if (events[index2][0] === "enter" && events[index2][1].type === "htmlFlow") {
        break;
      }
    }
    if (index2 > 1 && events[index2 - 2][1].type === "linePrefix") {
      events[index2][1].start = events[index2 - 2][1].start;
      events[index2 + 1][1].start = events[index2 - 2][1].start;
      events.splice(index2 - 2, 2);
    }
    return events;
  }
  function tokenizeHtmlFlow(effects, ok3, nok) {
    const self2 = this;
    let marker;
    let closingTag;
    let buffer;
    let index2;
    let markerB;
    return start2;
    function start2(code4) {
      return before(code4);
    }
    function before(code4) {
      effects.enter("htmlFlow");
      effects.enter("htmlFlowData");
      effects.consume(code4);
      return open;
    }
    function open(code4) {
      if (code4 === 33) {
        effects.consume(code4);
        return declarationOpen;
      }
      if (code4 === 47) {
        effects.consume(code4);
        closingTag = true;
        return tagCloseStart;
      }
      if (code4 === 63) {
        effects.consume(code4);
        marker = 3;
        return self2.interrupt ? ok3 : continuationDeclarationInside;
      }
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        buffer = String.fromCharCode(code4);
        return tagName;
      }
      return nok(code4);
    }
    function declarationOpen(code4) {
      if (code4 === 45) {
        effects.consume(code4);
        marker = 2;
        return commentOpenInside;
      }
      if (code4 === 91) {
        effects.consume(code4);
        marker = 5;
        index2 = 0;
        return cdataOpenInside;
      }
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        marker = 4;
        return self2.interrupt ? ok3 : continuationDeclarationInside;
      }
      return nok(code4);
    }
    function commentOpenInside(code4) {
      if (code4 === 45) {
        effects.consume(code4);
        return self2.interrupt ? ok3 : continuationDeclarationInside;
      }
      return nok(code4);
    }
    function cdataOpenInside(code4) {
      const value = "CDATA[";
      if (code4 === value.charCodeAt(index2++)) {
        effects.consume(code4);
        if (index2 === value.length) {
          return self2.interrupt ? ok3 : continuation;
        }
        return cdataOpenInside;
      }
      return nok(code4);
    }
    function tagCloseStart(code4) {
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        buffer = String.fromCharCode(code4);
        return tagName;
      }
      return nok(code4);
    }
    function tagName(code4) {
      if (code4 === null || code4 === 47 || code4 === 62 || markdownLineEndingOrSpace(code4)) {
        const slash = code4 === 47;
        const name2 = buffer.toLowerCase();
        if (!slash && !closingTag && htmlRawNames.includes(name2)) {
          marker = 1;
          return self2.interrupt ? ok3(code4) : continuation(code4);
        }
        if (htmlBlockNames.includes(buffer.toLowerCase())) {
          marker = 6;
          if (slash) {
            effects.consume(code4);
            return basicSelfClosing;
          }
          return self2.interrupt ? ok3(code4) : continuation(code4);
        }
        marker = 7;
        return self2.interrupt && !self2.parser.lazy[self2.now().line] ? nok(code4) : closingTag ? completeClosingTagAfter(code4) : completeAttributeNameBefore(code4);
      }
      if (code4 === 45 || asciiAlphanumeric(code4)) {
        effects.consume(code4);
        buffer += String.fromCharCode(code4);
        return tagName;
      }
      return nok(code4);
    }
    function basicSelfClosing(code4) {
      if (code4 === 62) {
        effects.consume(code4);
        return self2.interrupt ? ok3 : continuation;
      }
      return nok(code4);
    }
    function completeClosingTagAfter(code4) {
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return completeClosingTagAfter;
      }
      return completeEnd(code4);
    }
    function completeAttributeNameBefore(code4) {
      if (code4 === 47) {
        effects.consume(code4);
        return completeEnd;
      }
      if (code4 === 58 || code4 === 95 || asciiAlpha(code4)) {
        effects.consume(code4);
        return completeAttributeName;
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return completeAttributeNameBefore;
      }
      return completeEnd(code4);
    }
    function completeAttributeName(code4) {
      if (code4 === 45 || code4 === 46 || code4 === 58 || code4 === 95 || asciiAlphanumeric(code4)) {
        effects.consume(code4);
        return completeAttributeName;
      }
      return completeAttributeNameAfter(code4);
    }
    function completeAttributeNameAfter(code4) {
      if (code4 === 61) {
        effects.consume(code4);
        return completeAttributeValueBefore;
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return completeAttributeNameAfter;
      }
      return completeAttributeNameBefore(code4);
    }
    function completeAttributeValueBefore(code4) {
      if (code4 === null || code4 === 60 || code4 === 61 || code4 === 62 || code4 === 96) {
        return nok(code4);
      }
      if (code4 === 34 || code4 === 39) {
        effects.consume(code4);
        markerB = code4;
        return completeAttributeValueQuoted;
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return completeAttributeValueBefore;
      }
      return completeAttributeValueUnquoted(code4);
    }
    function completeAttributeValueQuoted(code4) {
      if (code4 === markerB) {
        effects.consume(code4);
        markerB = null;
        return completeAttributeValueQuotedAfter;
      }
      if (code4 === null || markdownLineEnding(code4)) {
        return nok(code4);
      }
      effects.consume(code4);
      return completeAttributeValueQuoted;
    }
    function completeAttributeValueUnquoted(code4) {
      if (code4 === null || code4 === 34 || code4 === 39 || code4 === 47 || code4 === 60 || code4 === 61 || code4 === 62 || code4 === 96 || markdownLineEndingOrSpace(code4)) {
        return completeAttributeNameAfter(code4);
      }
      effects.consume(code4);
      return completeAttributeValueUnquoted;
    }
    function completeAttributeValueQuotedAfter(code4) {
      if (code4 === 47 || code4 === 62 || markdownSpace(code4)) {
        return completeAttributeNameBefore(code4);
      }
      return nok(code4);
    }
    function completeEnd(code4) {
      if (code4 === 62) {
        effects.consume(code4);
        return completeAfter;
      }
      return nok(code4);
    }
    function completeAfter(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        return continuation(code4);
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return completeAfter;
      }
      return nok(code4);
    }
    function continuation(code4) {
      if (code4 === 45 && marker === 2) {
        effects.consume(code4);
        return continuationCommentInside;
      }
      if (code4 === 60 && marker === 1) {
        effects.consume(code4);
        return continuationRawTagOpen;
      }
      if (code4 === 62 && marker === 4) {
        effects.consume(code4);
        return continuationClose;
      }
      if (code4 === 63 && marker === 3) {
        effects.consume(code4);
        return continuationDeclarationInside;
      }
      if (code4 === 93 && marker === 5) {
        effects.consume(code4);
        return continuationCdataInside;
      }
      if (markdownLineEnding(code4) && (marker === 6 || marker === 7)) {
        effects.exit("htmlFlowData");
        return effects.check(blankLineBefore, continuationAfter, continuationStart)(code4);
      }
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("htmlFlowData");
        return continuationStart(code4);
      }
      effects.consume(code4);
      return continuation;
    }
    function continuationStart(code4) {
      return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code4);
    }
    function continuationStartNonLazy(code4) {
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return continuationBefore;
    }
    function continuationBefore(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        return continuationStart(code4);
      }
      effects.enter("htmlFlowData");
      return continuation(code4);
    }
    function continuationCommentInside(code4) {
      if (code4 === 45) {
        effects.consume(code4);
        return continuationDeclarationInside;
      }
      return continuation(code4);
    }
    function continuationRawTagOpen(code4) {
      if (code4 === 47) {
        effects.consume(code4);
        buffer = "";
        return continuationRawEndTag;
      }
      return continuation(code4);
    }
    function continuationRawEndTag(code4) {
      if (code4 === 62) {
        const name2 = buffer.toLowerCase();
        if (htmlRawNames.includes(name2)) {
          effects.consume(code4);
          return continuationClose;
        }
        return continuation(code4);
      }
      if (asciiAlpha(code4) && buffer.length < 8) {
        effects.consume(code4);
        buffer += String.fromCharCode(code4);
        return continuationRawEndTag;
      }
      return continuation(code4);
    }
    function continuationCdataInside(code4) {
      if (code4 === 93) {
        effects.consume(code4);
        return continuationDeclarationInside;
      }
      return continuation(code4);
    }
    function continuationDeclarationInside(code4) {
      if (code4 === 62) {
        effects.consume(code4);
        return continuationClose;
      }
      if (code4 === 45 && marker === 2) {
        effects.consume(code4);
        return continuationDeclarationInside;
      }
      return continuation(code4);
    }
    function continuationClose(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("htmlFlowData");
        return continuationAfter(code4);
      }
      effects.consume(code4);
      return continuationClose;
    }
    function continuationAfter(code4) {
      effects.exit("htmlFlow");
      return ok3(code4);
    }
  }
  function tokenizeNonLazyContinuationStart(effects, ok3, nok) {
    const self2 = this;
    return start2;
    function start2(code4) {
      if (markdownLineEnding(code4)) {
        effects.enter("lineEnding");
        effects.consume(code4);
        effects.exit("lineEnding");
        return after;
      }
      return nok(code4);
    }
    function after(code4) {
      return self2.parser.lazy[self2.now().line] ? nok(code4) : ok3(code4);
    }
  }
  function tokenizeBlankLineBefore(effects, ok3, nok) {
    return start2;
    function start2(code4) {
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return effects.attempt(blankLine, ok3, nok);
    }
  }

  // node_modules/micromark-core-commonmark/lib/html-text.js
  init_define_import_meta_env();
  var htmlText = {
    name: "htmlText",
    tokenize: tokenizeHtmlText
  };
  function tokenizeHtmlText(effects, ok3, nok) {
    const self2 = this;
    let marker;
    let index2;
    let returnState;
    return start2;
    function start2(code4) {
      effects.enter("htmlText");
      effects.enter("htmlTextData");
      effects.consume(code4);
      return open;
    }
    function open(code4) {
      if (code4 === 33) {
        effects.consume(code4);
        return declarationOpen;
      }
      if (code4 === 47) {
        effects.consume(code4);
        return tagCloseStart;
      }
      if (code4 === 63) {
        effects.consume(code4);
        return instruction;
      }
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        return tagOpen;
      }
      return nok(code4);
    }
    function declarationOpen(code4) {
      if (code4 === 45) {
        effects.consume(code4);
        return commentOpenInside;
      }
      if (code4 === 91) {
        effects.consume(code4);
        index2 = 0;
        return cdataOpenInside;
      }
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        return declaration;
      }
      return nok(code4);
    }
    function commentOpenInside(code4) {
      if (code4 === 45) {
        effects.consume(code4);
        return commentEnd;
      }
      return nok(code4);
    }
    function comment(code4) {
      if (code4 === null) {
        return nok(code4);
      }
      if (code4 === 45) {
        effects.consume(code4);
        return commentClose;
      }
      if (markdownLineEnding(code4)) {
        returnState = comment;
        return lineEndingBefore(code4);
      }
      effects.consume(code4);
      return comment;
    }
    function commentClose(code4) {
      if (code4 === 45) {
        effects.consume(code4);
        return commentEnd;
      }
      return comment(code4);
    }
    function commentEnd(code4) {
      return code4 === 62 ? end(code4) : code4 === 45 ? commentClose(code4) : comment(code4);
    }
    function cdataOpenInside(code4) {
      const value = "CDATA[";
      if (code4 === value.charCodeAt(index2++)) {
        effects.consume(code4);
        return index2 === value.length ? cdata : cdataOpenInside;
      }
      return nok(code4);
    }
    function cdata(code4) {
      if (code4 === null) {
        return nok(code4);
      }
      if (code4 === 93) {
        effects.consume(code4);
        return cdataClose;
      }
      if (markdownLineEnding(code4)) {
        returnState = cdata;
        return lineEndingBefore(code4);
      }
      effects.consume(code4);
      return cdata;
    }
    function cdataClose(code4) {
      if (code4 === 93) {
        effects.consume(code4);
        return cdataEnd;
      }
      return cdata(code4);
    }
    function cdataEnd(code4) {
      if (code4 === 62) {
        return end(code4);
      }
      if (code4 === 93) {
        effects.consume(code4);
        return cdataEnd;
      }
      return cdata(code4);
    }
    function declaration(code4) {
      if (code4 === null || code4 === 62) {
        return end(code4);
      }
      if (markdownLineEnding(code4)) {
        returnState = declaration;
        return lineEndingBefore(code4);
      }
      effects.consume(code4);
      return declaration;
    }
    function instruction(code4) {
      if (code4 === null) {
        return nok(code4);
      }
      if (code4 === 63) {
        effects.consume(code4);
        return instructionClose;
      }
      if (markdownLineEnding(code4)) {
        returnState = instruction;
        return lineEndingBefore(code4);
      }
      effects.consume(code4);
      return instruction;
    }
    function instructionClose(code4) {
      return code4 === 62 ? end(code4) : instruction(code4);
    }
    function tagCloseStart(code4) {
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        return tagClose;
      }
      return nok(code4);
    }
    function tagClose(code4) {
      if (code4 === 45 || asciiAlphanumeric(code4)) {
        effects.consume(code4);
        return tagClose;
      }
      return tagCloseBetween(code4);
    }
    function tagCloseBetween(code4) {
      if (markdownLineEnding(code4)) {
        returnState = tagCloseBetween;
        return lineEndingBefore(code4);
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return tagCloseBetween;
      }
      return end(code4);
    }
    function tagOpen(code4) {
      if (code4 === 45 || asciiAlphanumeric(code4)) {
        effects.consume(code4);
        return tagOpen;
      }
      if (code4 === 47 || code4 === 62 || markdownLineEndingOrSpace(code4)) {
        return tagOpenBetween(code4);
      }
      return nok(code4);
    }
    function tagOpenBetween(code4) {
      if (code4 === 47) {
        effects.consume(code4);
        return end;
      }
      if (code4 === 58 || code4 === 95 || asciiAlpha(code4)) {
        effects.consume(code4);
        return tagOpenAttributeName;
      }
      if (markdownLineEnding(code4)) {
        returnState = tagOpenBetween;
        return lineEndingBefore(code4);
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return tagOpenBetween;
      }
      return end(code4);
    }
    function tagOpenAttributeName(code4) {
      if (code4 === 45 || code4 === 46 || code4 === 58 || code4 === 95 || asciiAlphanumeric(code4)) {
        effects.consume(code4);
        return tagOpenAttributeName;
      }
      return tagOpenAttributeNameAfter(code4);
    }
    function tagOpenAttributeNameAfter(code4) {
      if (code4 === 61) {
        effects.consume(code4);
        return tagOpenAttributeValueBefore;
      }
      if (markdownLineEnding(code4)) {
        returnState = tagOpenAttributeNameAfter;
        return lineEndingBefore(code4);
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return tagOpenAttributeNameAfter;
      }
      return tagOpenBetween(code4);
    }
    function tagOpenAttributeValueBefore(code4) {
      if (code4 === null || code4 === 60 || code4 === 61 || code4 === 62 || code4 === 96) {
        return nok(code4);
      }
      if (code4 === 34 || code4 === 39) {
        effects.consume(code4);
        marker = code4;
        return tagOpenAttributeValueQuoted;
      }
      if (markdownLineEnding(code4)) {
        returnState = tagOpenAttributeValueBefore;
        return lineEndingBefore(code4);
      }
      if (markdownSpace(code4)) {
        effects.consume(code4);
        return tagOpenAttributeValueBefore;
      }
      effects.consume(code4);
      return tagOpenAttributeValueUnquoted;
    }
    function tagOpenAttributeValueQuoted(code4) {
      if (code4 === marker) {
        effects.consume(code4);
        marker = void 0;
        return tagOpenAttributeValueQuotedAfter;
      }
      if (code4 === null) {
        return nok(code4);
      }
      if (markdownLineEnding(code4)) {
        returnState = tagOpenAttributeValueQuoted;
        return lineEndingBefore(code4);
      }
      effects.consume(code4);
      return tagOpenAttributeValueQuoted;
    }
    function tagOpenAttributeValueUnquoted(code4) {
      if (code4 === null || code4 === 34 || code4 === 39 || code4 === 60 || code4 === 61 || code4 === 96) {
        return nok(code4);
      }
      if (code4 === 47 || code4 === 62 || markdownLineEndingOrSpace(code4)) {
        return tagOpenBetween(code4);
      }
      effects.consume(code4);
      return tagOpenAttributeValueUnquoted;
    }
    function tagOpenAttributeValueQuotedAfter(code4) {
      if (code4 === 47 || code4 === 62 || markdownLineEndingOrSpace(code4)) {
        return tagOpenBetween(code4);
      }
      return nok(code4);
    }
    function end(code4) {
      if (code4 === 62) {
        effects.consume(code4);
        effects.exit("htmlTextData");
        effects.exit("htmlText");
        return ok3;
      }
      return nok(code4);
    }
    function lineEndingBefore(code4) {
      effects.exit("htmlTextData");
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return lineEndingAfter;
    }
    function lineEndingAfter(code4) {
      return markdownSpace(code4) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code4) : lineEndingAfterPrefix(code4);
    }
    function lineEndingAfterPrefix(code4) {
      effects.enter("htmlTextData");
      return returnState(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/label-end.js
  init_define_import_meta_env();
  var labelEnd = {
    name: "labelEnd",
    resolveAll: resolveAllLabelEnd,
    resolveTo: resolveToLabelEnd,
    tokenize: tokenizeLabelEnd
  };
  var resourceConstruct = {
    tokenize: tokenizeResource
  };
  var referenceFullConstruct = {
    tokenize: tokenizeReferenceFull
  };
  var referenceCollapsedConstruct = {
    tokenize: tokenizeReferenceCollapsed
  };
  function resolveAllLabelEnd(events) {
    let index2 = -1;
    const newEvents = [];
    while (++index2 < events.length) {
      const token = events[index2][1];
      newEvents.push(events[index2]);
      if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
        const offset = token.type === "labelImage" ? 4 : 2;
        token.type = "data";
        index2 += offset;
      }
    }
    if (events.length !== newEvents.length) {
      splice(events, 0, events.length, newEvents);
    }
    return events;
  }
  function resolveToLabelEnd(events, context) {
    let index2 = events.length;
    let offset = 0;
    let token;
    let open;
    let close;
    let media;
    while (index2--) {
      token = events[index2][1];
      if (open) {
        if (token.type === "link" || token.type === "labelLink" && token._inactive) {
          break;
        }
        if (events[index2][0] === "enter" && token.type === "labelLink") {
          token._inactive = true;
        }
      } else if (close) {
        if (events[index2][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
          open = index2;
          if (token.type !== "labelLink") {
            offset = 2;
            break;
          }
        }
      } else if (token.type === "labelEnd") {
        close = index2;
      }
    }
    const group = {
      type: events[open][1].type === "labelLink" ? "link" : "image",
      start: {
        ...events[open][1].start
      },
      end: {
        ...events[events.length - 1][1].end
      }
    };
    const label = {
      type: "label",
      start: {
        ...events[open][1].start
      },
      end: {
        ...events[close][1].end
      }
    };
    const text7 = {
      type: "labelText",
      start: {
        ...events[open + offset + 2][1].end
      },
      end: {
        ...events[close - 2][1].start
      }
    };
    media = [["enter", group, context], ["enter", label, context]];
    media = push(media, events.slice(open + 1, open + offset + 3));
    media = push(media, [["enter", text7, context]]);
    media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
    media = push(media, [["exit", text7, context], events[close - 2], events[close - 1], ["exit", label, context]]);
    media = push(media, events.slice(close + 1));
    media = push(media, [["exit", group, context]]);
    splice(events, open, events.length, media);
    return events;
  }
  function tokenizeLabelEnd(effects, ok3, nok) {
    const self2 = this;
    let index2 = self2.events.length;
    let labelStart;
    let defined;
    while (index2--) {
      if ((self2.events[index2][1].type === "labelImage" || self2.events[index2][1].type === "labelLink") && !self2.events[index2][1]._balanced) {
        labelStart = self2.events[index2][1];
        break;
      }
    }
    return start2;
    function start2(code4) {
      if (!labelStart) {
        return nok(code4);
      }
      if (labelStart._inactive) {
        return labelEndNok(code4);
      }
      defined = self2.parser.defined.includes(normalizeIdentifier(self2.sliceSerialize({
        start: labelStart.end,
        end: self2.now()
      })));
      effects.enter("labelEnd");
      effects.enter("labelMarker");
      effects.consume(code4);
      effects.exit("labelMarker");
      effects.exit("labelEnd");
      return after;
    }
    function after(code4) {
      if (code4 === 40) {
        return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code4);
      }
      if (code4 === 91) {
        return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code4);
      }
      return defined ? labelEndOk(code4) : labelEndNok(code4);
    }
    function referenceNotFull(code4) {
      return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code4);
    }
    function labelEndOk(code4) {
      return ok3(code4);
    }
    function labelEndNok(code4) {
      labelStart._balanced = true;
      return nok(code4);
    }
  }
  function tokenizeResource(effects, ok3, nok) {
    return resourceStart;
    function resourceStart(code4) {
      effects.enter("resource");
      effects.enter("resourceMarker");
      effects.consume(code4);
      effects.exit("resourceMarker");
      return resourceBefore;
    }
    function resourceBefore(code4) {
      return markdownLineEndingOrSpace(code4) ? factoryWhitespace(effects, resourceOpen)(code4) : resourceOpen(code4);
    }
    function resourceOpen(code4) {
      if (code4 === 41) {
        return resourceEnd(code4);
      }
      return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code4);
    }
    function resourceDestinationAfter(code4) {
      return markdownLineEndingOrSpace(code4) ? factoryWhitespace(effects, resourceBetween)(code4) : resourceEnd(code4);
    }
    function resourceDestinationMissing(code4) {
      return nok(code4);
    }
    function resourceBetween(code4) {
      if (code4 === 34 || code4 === 39 || code4 === 40) {
        return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code4);
      }
      return resourceEnd(code4);
    }
    function resourceTitleAfter(code4) {
      return markdownLineEndingOrSpace(code4) ? factoryWhitespace(effects, resourceEnd)(code4) : resourceEnd(code4);
    }
    function resourceEnd(code4) {
      if (code4 === 41) {
        effects.enter("resourceMarker");
        effects.consume(code4);
        effects.exit("resourceMarker");
        effects.exit("resource");
        return ok3;
      }
      return nok(code4);
    }
  }
  function tokenizeReferenceFull(effects, ok3, nok) {
    const self2 = this;
    return referenceFull;
    function referenceFull(code4) {
      return factoryLabel.call(self2, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code4);
    }
    function referenceFullAfter(code4) {
      return self2.parser.defined.includes(normalizeIdentifier(self2.sliceSerialize(self2.events[self2.events.length - 1][1]).slice(1, -1))) ? ok3(code4) : nok(code4);
    }
    function referenceFullMissing(code4) {
      return nok(code4);
    }
  }
  function tokenizeReferenceCollapsed(effects, ok3, nok) {
    return referenceCollapsedStart;
    function referenceCollapsedStart(code4) {
      effects.enter("reference");
      effects.enter("referenceMarker");
      effects.consume(code4);
      effects.exit("referenceMarker");
      return referenceCollapsedOpen;
    }
    function referenceCollapsedOpen(code4) {
      if (code4 === 93) {
        effects.enter("referenceMarker");
        effects.consume(code4);
        effects.exit("referenceMarker");
        effects.exit("reference");
        return ok3;
      }
      return nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/label-start-image.js
  init_define_import_meta_env();
  var labelStartImage = {
    name: "labelStartImage",
    resolveAll: labelEnd.resolveAll,
    tokenize: tokenizeLabelStartImage
  };
  function tokenizeLabelStartImage(effects, ok3, nok) {
    const self2 = this;
    return start2;
    function start2(code4) {
      effects.enter("labelImage");
      effects.enter("labelImageMarker");
      effects.consume(code4);
      effects.exit("labelImageMarker");
      return open;
    }
    function open(code4) {
      if (code4 === 91) {
        effects.enter("labelMarker");
        effects.consume(code4);
        effects.exit("labelMarker");
        effects.exit("labelImage");
        return after;
      }
      return nok(code4);
    }
    function after(code4) {
      return code4 === 94 && "_hiddenFootnoteSupport" in self2.parser.constructs ? nok(code4) : ok3(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/label-start-link.js
  init_define_import_meta_env();
  var labelStartLink = {
    name: "labelStartLink",
    resolveAll: labelEnd.resolveAll,
    tokenize: tokenizeLabelStartLink
  };
  function tokenizeLabelStartLink(effects, ok3, nok) {
    const self2 = this;
    return start2;
    function start2(code4) {
      effects.enter("labelLink");
      effects.enter("labelMarker");
      effects.consume(code4);
      effects.exit("labelMarker");
      effects.exit("labelLink");
      return after;
    }
    function after(code4) {
      return code4 === 94 && "_hiddenFootnoteSupport" in self2.parser.constructs ? nok(code4) : ok3(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/line-ending.js
  init_define_import_meta_env();
  var lineEnding = {
    name: "lineEnding",
    tokenize: tokenizeLineEnding
  };
  function tokenizeLineEnding(effects, ok3) {
    return start2;
    function start2(code4) {
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      return factorySpace(effects, ok3, "linePrefix");
    }
  }

  // node_modules/micromark-core-commonmark/lib/list.js
  init_define_import_meta_env();

  // node_modules/micromark-core-commonmark/lib/thematic-break.js
  init_define_import_meta_env();
  var thematicBreak = {
    name: "thematicBreak",
    tokenize: tokenizeThematicBreak
  };
  function tokenizeThematicBreak(effects, ok3, nok) {
    let size = 0;
    let marker;
    return start2;
    function start2(code4) {
      effects.enter("thematicBreak");
      return before(code4);
    }
    function before(code4) {
      marker = code4;
      return atBreak(code4);
    }
    function atBreak(code4) {
      if (code4 === marker) {
        effects.enter("thematicBreakSequence");
        return sequence(code4);
      }
      if (size >= 3 && (code4 === null || markdownLineEnding(code4))) {
        effects.exit("thematicBreak");
        return ok3(code4);
      }
      return nok(code4);
    }
    function sequence(code4) {
      if (code4 === marker) {
        effects.consume(code4);
        size++;
        return sequence;
      }
      effects.exit("thematicBreakSequence");
      return markdownSpace(code4) ? factorySpace(effects, atBreak, "whitespace")(code4) : atBreak(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/list.js
  var list = {
    continuation: {
      tokenize: tokenizeListContinuation
    },
    exit: tokenizeListEnd,
    name: "list",
    tokenize: tokenizeListStart
  };
  var listItemPrefixWhitespaceConstruct = {
    partial: true,
    tokenize: tokenizeListItemPrefixWhitespace
  };
  var indentConstruct = {
    partial: true,
    tokenize: tokenizeIndent
  };
  function tokenizeListStart(effects, ok3, nok) {
    const self2 = this;
    const tail = self2.events[self2.events.length - 1];
    let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
    let size = 0;
    return start2;
    function start2(code4) {
      const kind = self2.containerState.type || (code4 === 42 || code4 === 43 || code4 === 45 ? "listUnordered" : "listOrdered");
      if (kind === "listUnordered" ? !self2.containerState.marker || code4 === self2.containerState.marker : asciiDigit(code4)) {
        if (!self2.containerState.type) {
          self2.containerState.type = kind;
          effects.enter(kind, {
            _container: true
          });
        }
        if (kind === "listUnordered") {
          effects.enter("listItemPrefix");
          return code4 === 42 || code4 === 45 ? effects.check(thematicBreak, nok, atMarker)(code4) : atMarker(code4);
        }
        if (!self2.interrupt || code4 === 49) {
          effects.enter("listItemPrefix");
          effects.enter("listItemValue");
          return inside(code4);
        }
      }
      return nok(code4);
    }
    function inside(code4) {
      if (asciiDigit(code4) && ++size < 10) {
        effects.consume(code4);
        return inside;
      }
      if ((!self2.interrupt || size < 2) && (self2.containerState.marker ? code4 === self2.containerState.marker : code4 === 41 || code4 === 46)) {
        effects.exit("listItemValue");
        return atMarker(code4);
      }
      return nok(code4);
    }
    function atMarker(code4) {
      effects.enter("listItemMarker");
      effects.consume(code4);
      effects.exit("listItemMarker");
      self2.containerState.marker = self2.containerState.marker || code4;
      return effects.check(
        blankLine,
        // Can’t be empty when interrupting.
        self2.interrupt ? nok : onBlank,
        effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix)
      );
    }
    function onBlank(code4) {
      self2.containerState.initialBlankLine = true;
      initialSize++;
      return endOfPrefix(code4);
    }
    function otherPrefix(code4) {
      if (markdownSpace(code4)) {
        effects.enter("listItemPrefixWhitespace");
        effects.consume(code4);
        effects.exit("listItemPrefixWhitespace");
        return endOfPrefix;
      }
      return nok(code4);
    }
    function endOfPrefix(code4) {
      self2.containerState.size = initialSize + self2.sliceSerialize(effects.exit("listItemPrefix"), true).length;
      return ok3(code4);
    }
  }
  function tokenizeListContinuation(effects, ok3, nok) {
    const self2 = this;
    self2.containerState._closeFlow = void 0;
    return effects.check(blankLine, onBlank, notBlank);
    function onBlank(code4) {
      self2.containerState.furtherBlankLines = self2.containerState.furtherBlankLines || self2.containerState.initialBlankLine;
      return factorySpace(effects, ok3, "listItemIndent", self2.containerState.size + 1)(code4);
    }
    function notBlank(code4) {
      if (self2.containerState.furtherBlankLines || !markdownSpace(code4)) {
        self2.containerState.furtherBlankLines = void 0;
        self2.containerState.initialBlankLine = void 0;
        return notInCurrentItem(code4);
      }
      self2.containerState.furtherBlankLines = void 0;
      self2.containerState.initialBlankLine = void 0;
      return effects.attempt(indentConstruct, ok3, notInCurrentItem)(code4);
    }
    function notInCurrentItem(code4) {
      self2.containerState._closeFlow = true;
      self2.interrupt = void 0;
      return factorySpace(effects, effects.attempt(list, ok3, nok), "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code4);
    }
  }
  function tokenizeIndent(effects, ok3, nok) {
    const self2 = this;
    return factorySpace(effects, afterPrefix, "listItemIndent", self2.containerState.size + 1);
    function afterPrefix(code4) {
      const tail = self2.events[self2.events.length - 1];
      return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self2.containerState.size ? ok3(code4) : nok(code4);
    }
  }
  function tokenizeListEnd(effects) {
    effects.exit(this.containerState.type);
  }
  function tokenizeListItemPrefixWhitespace(effects, ok3, nok) {
    const self2 = this;
    return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4 + 1);
    function afterPrefix(code4) {
      const tail = self2.events[self2.events.length - 1];
      return !markdownSpace(code4) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok3(code4) : nok(code4);
    }
  }

  // node_modules/micromark-core-commonmark/lib/setext-underline.js
  init_define_import_meta_env();
  var setextUnderline = {
    name: "setextUnderline",
    resolveTo: resolveToSetextUnderline,
    tokenize: tokenizeSetextUnderline
  };
  function resolveToSetextUnderline(events, context) {
    let index2 = events.length;
    let content3;
    let text7;
    let definition3;
    while (index2--) {
      if (events[index2][0] === "enter") {
        if (events[index2][1].type === "content") {
          content3 = index2;
          break;
        }
        if (events[index2][1].type === "paragraph") {
          text7 = index2;
        }
      } else {
        if (events[index2][1].type === "content") {
          events.splice(index2, 1);
        }
        if (!definition3 && events[index2][1].type === "definition") {
          definition3 = index2;
        }
      }
    }
    const heading3 = {
      type: "setextHeading",
      start: {
        ...events[content3][1].start
      },
      end: {
        ...events[events.length - 1][1].end
      }
    };
    events[text7][1].type = "setextHeadingText";
    if (definition3) {
      events.splice(text7, 0, ["enter", heading3, context]);
      events.splice(definition3 + 1, 0, ["exit", events[content3][1], context]);
      events[content3][1].end = {
        ...events[definition3][1].end
      };
    } else {
      events[content3][1] = heading3;
    }
    events.push(["exit", heading3, context]);
    return events;
  }
  function tokenizeSetextUnderline(effects, ok3, nok) {
    const self2 = this;
    let marker;
    return start2;
    function start2(code4) {
      let index2 = self2.events.length;
      let paragraph3;
      while (index2--) {
        if (self2.events[index2][1].type !== "lineEnding" && self2.events[index2][1].type !== "linePrefix" && self2.events[index2][1].type !== "content") {
          paragraph3 = self2.events[index2][1].type === "paragraph";
          break;
        }
      }
      if (!self2.parser.lazy[self2.now().line] && (self2.interrupt || paragraph3)) {
        effects.enter("setextHeadingLine");
        marker = code4;
        return before(code4);
      }
      return nok(code4);
    }
    function before(code4) {
      effects.enter("setextHeadingLineSequence");
      return inside(code4);
    }
    function inside(code4) {
      if (code4 === marker) {
        effects.consume(code4);
        return inside;
      }
      effects.exit("setextHeadingLineSequence");
      return markdownSpace(code4) ? factorySpace(effects, after, "lineSuffix")(code4) : after(code4);
    }
    function after(code4) {
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("setextHeadingLine");
        return ok3(code4);
      }
      return nok(code4);
    }
  }

  // node_modules/micromark/lib/initialize/flow.js
  var flow = {
    tokenize: initializeFlow
  };
  function initializeFlow(effects) {
    const self2 = this;
    const initial = effects.attempt(
      // Try to parse a blank line.
      blankLine,
      atBlankEnding,
      // Try to parse initial flow (essentially, only code).
      effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content2, afterConstruct)), "linePrefix"))
    );
    return initial;
    function atBlankEnding(code4) {
      if (code4 === null) {
        effects.consume(code4);
        return;
      }
      effects.enter("lineEndingBlank");
      effects.consume(code4);
      effects.exit("lineEndingBlank");
      self2.currentConstruct = void 0;
      return initial;
    }
    function afterConstruct(code4) {
      if (code4 === null) {
        effects.consume(code4);
        return;
      }
      effects.enter("lineEnding");
      effects.consume(code4);
      effects.exit("lineEnding");
      self2.currentConstruct = void 0;
      return initial;
    }
  }

  // node_modules/micromark/lib/initialize/text.js
  init_define_import_meta_env();
  var resolver = {
    resolveAll: createResolver()
  };
  var string = initializeFactory("string");
  var text2 = initializeFactory("text");
  function initializeFactory(field) {
    return {
      resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
      tokenize: initializeText
    };
    function initializeText(effects) {
      const self2 = this;
      const constructs2 = this.parser.constructs[field];
      const text7 = effects.attempt(constructs2, start2, notText);
      return start2;
      function start2(code4) {
        return atBreak(code4) ? text7(code4) : notText(code4);
      }
      function notText(code4) {
        if (code4 === null) {
          effects.consume(code4);
          return;
        }
        effects.enter("data");
        effects.consume(code4);
        return data;
      }
      function data(code4) {
        if (atBreak(code4)) {
          effects.exit("data");
          return text7(code4);
        }
        effects.consume(code4);
        return data;
      }
      function atBreak(code4) {
        if (code4 === null) {
          return true;
        }
        const list4 = constructs2[code4];
        let index2 = -1;
        if (list4) {
          while (++index2 < list4.length) {
            const item = list4[index2];
            if (!item.previous || item.previous.call(self2, self2.previous)) {
              return true;
            }
          }
        }
        return false;
      }
    }
  }
  function createResolver(extraResolver) {
    return resolveAllText;
    function resolveAllText(events, context) {
      let index2 = -1;
      let enter;
      while (++index2 <= events.length) {
        if (enter === void 0) {
          if (events[index2] && events[index2][1].type === "data") {
            enter = index2;
            index2++;
          }
        } else if (!events[index2] || events[index2][1].type !== "data") {
          if (index2 !== enter + 2) {
            events[enter][1].end = events[index2 - 1][1].end;
            events.splice(enter + 2, index2 - enter - 2);
            index2 = enter + 2;
          }
          enter = void 0;
        }
      }
      return extraResolver ? extraResolver(events, context) : events;
    }
  }
  function resolveAllLineSuffixes(events, context) {
    let eventIndex = 0;
    while (++eventIndex <= events.length) {
      if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
        const data = events[eventIndex - 1][1];
        const chunks = context.sliceStream(data);
        let index2 = chunks.length;
        let bufferIndex = -1;
        let size = 0;
        let tabs;
        while (index2--) {
          const chunk = chunks[index2];
          if (typeof chunk === "string") {
            bufferIndex = chunk.length;
            while (chunk.charCodeAt(bufferIndex - 1) === 32) {
              size++;
              bufferIndex--;
            }
            if (bufferIndex) break;
            bufferIndex = -1;
          } else if (chunk === -2) {
            tabs = true;
            size++;
          } else if (chunk === -1) {
          } else {
            index2++;
            break;
          }
        }
        if (context._contentTypeTextTrailing && eventIndex === events.length) {
          size = 0;
        }
        if (size) {
          const token = {
            type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
            start: {
              _bufferIndex: index2 ? bufferIndex : data.start._bufferIndex + bufferIndex,
              _index: data.start._index + index2,
              line: data.end.line,
              column: data.end.column - size,
              offset: data.end.offset - size
            },
            end: {
              ...data.end
            }
          };
          data.end = {
            ...token.start
          };
          if (data.start.offset === data.end.offset) {
            Object.assign(data, token);
          } else {
            events.splice(eventIndex, 0, ["enter", token, context], ["exit", token, context]);
            eventIndex += 2;
          }
        }
        eventIndex++;
      }
    }
    return events;
  }

  // node_modules/micromark/lib/constructs.js
  var constructs_exports = {};
  __export(constructs_exports, {
    attentionMarkers: () => attentionMarkers,
    contentInitial: () => contentInitial,
    disable: () => disable,
    document: () => document3,
    flow: () => flow2,
    flowInitial: () => flowInitial,
    insideSpan: () => insideSpan,
    string: () => string2,
    text: () => text3
  });
  init_define_import_meta_env();
  var document3 = {
    [42]: list,
    [43]: list,
    [45]: list,
    [48]: list,
    [49]: list,
    [50]: list,
    [51]: list,
    [52]: list,
    [53]: list,
    [54]: list,
    [55]: list,
    [56]: list,
    [57]: list,
    [62]: blockQuote
  };
  var contentInitial = {
    [91]: definition
  };
  var flowInitial = {
    [-2]: codeIndented,
    [-1]: codeIndented,
    [32]: codeIndented
  };
  var flow2 = {
    [35]: headingAtx,
    [42]: thematicBreak,
    [45]: [setextUnderline, thematicBreak],
    [60]: htmlFlow,
    [61]: setextUnderline,
    [95]: thematicBreak,
    [96]: codeFenced,
    [126]: codeFenced
  };
  var string2 = {
    [38]: characterReference,
    [92]: characterEscape
  };
  var text3 = {
    [-5]: lineEnding,
    [-4]: lineEnding,
    [-3]: lineEnding,
    [33]: labelStartImage,
    [38]: characterReference,
    [42]: attention,
    [60]: [autolink, htmlText],
    [91]: labelStartLink,
    [92]: [hardBreakEscape, characterEscape],
    [93]: labelEnd,
    [95]: attention,
    [96]: codeText
  };
  var insideSpan = {
    null: [attention, resolver]
  };
  var attentionMarkers = {
    null: [42, 95]
  };
  var disable = {
    null: []
  };

  // node_modules/micromark/lib/create-tokenizer.js
  init_define_import_meta_env();
  function createTokenizer(parser, initialize, from) {
    let point4 = {
      _bufferIndex: -1,
      _index: 0,
      line: from && from.line || 1,
      column: from && from.column || 1,
      offset: from && from.offset || 0
    };
    const columnStart = {};
    const resolveAllConstructs = [];
    let chunks = [];
    let stack = [];
    let consumed = true;
    const effects = {
      attempt: constructFactory(onsuccessfulconstruct),
      check: constructFactory(onsuccessfulcheck),
      consume,
      enter,
      exit: exit3,
      interrupt: constructFactory(onsuccessfulcheck, {
        interrupt: true
      })
    };
    const context = {
      code: null,
      containerState: {},
      defineSkip,
      events: [],
      now,
      parser,
      previous: null,
      sliceSerialize,
      sliceStream,
      write
    };
    let state = initialize.tokenize.call(context, effects);
    let expectedCode;
    if (initialize.resolveAll) {
      resolveAllConstructs.push(initialize);
    }
    return context;
    function write(slice) {
      chunks = push(chunks, slice);
      main();
      if (chunks[chunks.length - 1] !== null) {
        return [];
      }
      addResult(initialize, 0);
      context.events = resolveAll(resolveAllConstructs, context.events, context);
      return context.events;
    }
    function sliceSerialize(token, expandTabs) {
      return serializeChunks(sliceStream(token), expandTabs);
    }
    function sliceStream(token) {
      return sliceChunks(chunks, token);
    }
    function now() {
      const {
        _bufferIndex,
        _index,
        line,
        column,
        offset
      } = point4;
      return {
        _bufferIndex,
        _index,
        line,
        column,
        offset
      };
    }
    function defineSkip(value) {
      columnStart[value.line] = value.column;
      accountForPotentialSkip();
    }
    function main() {
      let chunkIndex;
      while (point4._index < chunks.length) {
        const chunk = chunks[point4._index];
        if (typeof chunk === "string") {
          chunkIndex = point4._index;
          if (point4._bufferIndex < 0) {
            point4._bufferIndex = 0;
          }
          while (point4._index === chunkIndex && point4._bufferIndex < chunk.length) {
            go(chunk.charCodeAt(point4._bufferIndex));
          }
        } else {
          go(chunk);
        }
      }
    }
    function go(code4) {
      consumed = void 0;
      expectedCode = code4;
      state = state(code4);
    }
    function consume(code4) {
      if (markdownLineEnding(code4)) {
        point4.line++;
        point4.column = 1;
        point4.offset += code4 === -3 ? 2 : 1;
        accountForPotentialSkip();
      } else if (code4 !== -1) {
        point4.column++;
        point4.offset++;
      }
      if (point4._bufferIndex < 0) {
        point4._index++;
      } else {
        point4._bufferIndex++;
        if (point4._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
        // strings.
        /** @type {string} */
        chunks[point4._index].length) {
          point4._bufferIndex = -1;
          point4._index++;
        }
      }
      context.previous = code4;
      consumed = true;
    }
    function enter(type, fields) {
      const token = fields || {};
      token.type = type;
      token.start = now();
      context.events.push(["enter", token, context]);
      stack.push(token);
      return token;
    }
    function exit3(type) {
      const token = stack.pop();
      token.end = now();
      context.events.push(["exit", token, context]);
      return token;
    }
    function onsuccessfulconstruct(construct, info) {
      addResult(construct, info.from);
    }
    function onsuccessfulcheck(_, info) {
      info.restore();
    }
    function constructFactory(onreturn, fields) {
      return hook;
      function hook(constructs2, returnState, bogusState) {
        let listOfConstructs;
        let constructIndex;
        let currentConstruct;
        let info;
        return Array.isArray(constructs2) ? (
          /* c8 ignore next 1 */
          handleListOfConstructs(constructs2)
        ) : "tokenize" in constructs2 ? (
          // Looks like a construct.
          handleListOfConstructs([
            /** @type {Construct} */
            constructs2
          ])
        ) : handleMapOfConstructs(constructs2);
        function handleMapOfConstructs(map3) {
          return start2;
          function start2(code4) {
            const left = code4 !== null && map3[code4];
            const all2 = code4 !== null && map3.null;
            const list4 = [
              // To do: add more extension tests.
              /* c8 ignore next 2 */
              ...Array.isArray(left) ? left : left ? [left] : [],
              ...Array.isArray(all2) ? all2 : all2 ? [all2] : []
            ];
            return handleListOfConstructs(list4)(code4);
          }
        }
        function handleListOfConstructs(list4) {
          listOfConstructs = list4;
          constructIndex = 0;
          if (list4.length === 0) {
            return bogusState;
          }
          return handleConstruct(list4[constructIndex]);
        }
        function handleConstruct(construct) {
          return start2;
          function start2(code4) {
            info = store();
            currentConstruct = construct;
            if (!construct.partial) {
              context.currentConstruct = construct;
            }
            if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) {
              return nok(code4);
            }
            return construct.tokenize.call(
              // If we do have fields, create an object w/ `context` as its
              // prototype.
              // This allows a “live binding”, which is needed for `interrupt`.
              fields ? Object.assign(Object.create(context), fields) : context,
              effects,
              ok3,
              nok
            )(code4);
          }
        }
        function ok3(code4) {
          consumed = true;
          onreturn(currentConstruct, info);
          return returnState;
        }
        function nok(code4) {
          consumed = true;
          info.restore();
          if (++constructIndex < listOfConstructs.length) {
            return handleConstruct(listOfConstructs[constructIndex]);
          }
          return bogusState;
        }
      }
    }
    function addResult(construct, from2) {
      if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
        resolveAllConstructs.push(construct);
      }
      if (construct.resolve) {
        splice(context.events, from2, context.events.length - from2, construct.resolve(context.events.slice(from2), context));
      }
      if (construct.resolveTo) {
        context.events = construct.resolveTo(context.events, context);
      }
    }
    function store() {
      const startPoint = now();
      const startPrevious = context.previous;
      const startCurrentConstruct = context.currentConstruct;
      const startEventsIndex = context.events.length;
      const startStack = Array.from(stack);
      return {
        from: startEventsIndex,
        restore
      };
      function restore() {
        point4 = startPoint;
        context.previous = startPrevious;
        context.currentConstruct = startCurrentConstruct;
        context.events.length = startEventsIndex;
        stack = startStack;
        accountForPotentialSkip();
      }
    }
    function accountForPotentialSkip() {
      if (point4.line in columnStart && point4.column < 2) {
        point4.column = columnStart[point4.line];
        point4.offset += columnStart[point4.line] - 1;
      }
    }
  }
  function sliceChunks(chunks, token) {
    const startIndex = token.start._index;
    const startBufferIndex = token.start._bufferIndex;
    const endIndex = token.end._index;
    const endBufferIndex = token.end._bufferIndex;
    let view;
    if (startIndex === endIndex) {
      view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
    } else {
      view = chunks.slice(startIndex, endIndex);
      if (startBufferIndex > -1) {
        const head = view[0];
        if (typeof head === "string") {
          view[0] = head.slice(startBufferIndex);
        } else {
          view.shift();
        }
      }
      if (endBufferIndex > 0) {
        view.push(chunks[endIndex].slice(0, endBufferIndex));
      }
    }
    return view;
  }
  function serializeChunks(chunks, expandTabs) {
    let index2 = -1;
    const result = [];
    let atTab;
    while (++index2 < chunks.length) {
      const chunk = chunks[index2];
      let value;
      if (typeof chunk === "string") {
        value = chunk;
      } else switch (chunk) {
        case -5: {
          value = "\r";
          break;
        }
        case -4: {
          value = "\n";
          break;
        }
        case -3: {
          value = "\r\n";
          break;
        }
        case -2: {
          value = expandTabs ? " " : "	";
          break;
        }
        case -1: {
          if (!expandTabs && atTab) continue;
          value = " ";
          break;
        }
        default: {
          value = String.fromCharCode(chunk);
        }
      }
      atTab = chunk === -2;
      result.push(value);
    }
    return result.join("");
  }

  // node_modules/micromark/lib/parse.js
  function parse(options) {
    const settings = options || {};
    const constructs2 = (
      /** @type {FullNormalizedExtension} */
      combineExtensions([constructs_exports, ...settings.extensions || []])
    );
    const parser = {
      constructs: constructs2,
      content: create2(content),
      defined: [],
      document: create2(document2),
      flow: create2(flow),
      lazy: {},
      string: create2(string),
      text: create2(text2)
    };
    return parser;
    function create2(initial) {
      return creator;
      function creator(from) {
        return createTokenizer(parser, initial, from);
      }
    }
  }

  // node_modules/micromark/lib/postprocess.js
  init_define_import_meta_env();
  function postprocess(events) {
    while (!subtokenize(events)) {
    }
    return events;
  }

  // node_modules/micromark/lib/preprocess.js
  init_define_import_meta_env();
  var search = /[\0\t\n\r]/g;
  function preprocess() {
    let column = 1;
    let buffer = "";
    let start2 = true;
    let atCarriageReturn;
    return preprocessor;
    function preprocessor(value, encoding, end) {
      const chunks = [];
      let match;
      let next;
      let startPosition;
      let endPosition;
      let code4;
      value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
      startPosition = 0;
      buffer = "";
      if (start2) {
        if (value.charCodeAt(0) === 65279) {
          startPosition++;
        }
        start2 = void 0;
      }
      while (startPosition < value.length) {
        search.lastIndex = startPosition;
        match = search.exec(value);
        endPosition = match && match.index !== void 0 ? match.index : value.length;
        code4 = value.charCodeAt(endPosition);
        if (!match) {
          buffer = value.slice(startPosition);
          break;
        }
        if (code4 === 10 && startPosition === endPosition && atCarriageReturn) {
          chunks.push(-3);
          atCarriageReturn = void 0;
        } else {
          if (atCarriageReturn) {
            chunks.push(-5);
            atCarriageReturn = void 0;
          }
          if (startPosition < endPosition) {
            chunks.push(value.slice(startPosition, endPosition));
            column += endPosition - startPosition;
          }
          switch (code4) {
            case 0: {
              chunks.push(65533);
              column++;
              break;
            }
            case 9: {
              next = Math.ceil(column / 4) * 4;
              chunks.push(-2);
              while (column++ < next) chunks.push(-1);
              break;
            }
            case 10: {
              chunks.push(-4);
              column = 1;
              break;
            }
            default: {
              atCarriageReturn = true;
              column = 1;
            }
          }
        }
        startPosition = endPosition + 1;
      }
      if (end) {
        if (atCarriageReturn) chunks.push(-5);
        if (buffer) chunks.push(buffer);
        chunks.push(null);
      }
      return chunks;
    }
  }

  // node_modules/micromark-util-decode-string/index.js
  init_define_import_meta_env();
  var characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
  function decodeString(value) {
    return value.replace(characterEscapeOrReference, decode);
  }
  function decode($0, $1, $2) {
    if ($1) {
      return $1;
    }
    const head = $2.charCodeAt(0);
    if (head === 35) {
      const head2 = $2.charCodeAt(1);
      const hex = head2 === 120 || head2 === 88;
      return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
    }
    return decodeNamedCharacterReference($2) || $0;
  }

  // node_modules/mdast-util-from-markdown/lib/index.js
  var own2 = {}.hasOwnProperty;
  function fromMarkdown(value, encoding, options) {
    if (encoding && typeof encoding === "object") {
      options = encoding;
      encoding = void 0;
    }
    return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
  }
  function compiler(options) {
    const config = {
      transforms: [],
      canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
      enter: {
        autolink: opener(link3),
        autolinkProtocol: onenterdata,
        autolinkEmail: onenterdata,
        atxHeading: opener(heading3),
        blockQuote: opener(blockQuote2),
        characterEscape: onenterdata,
        characterReference: onenterdata,
        codeFenced: opener(codeFlow),
        codeFencedFenceInfo: buffer,
        codeFencedFenceMeta: buffer,
        codeIndented: opener(codeFlow, buffer),
        codeText: opener(codeText2, buffer),
        codeTextData: onenterdata,
        data: onenterdata,
        codeFlowValue: onenterdata,
        definition: opener(definition3),
        definitionDestinationString: buffer,
        definitionLabelString: buffer,
        definitionTitleString: buffer,
        emphasis: opener(emphasis3),
        hardBreakEscape: opener(hardBreak3),
        hardBreakTrailing: opener(hardBreak3),
        htmlFlow: opener(html5, buffer),
        htmlFlowData: onenterdata,
        htmlText: opener(html5, buffer),
        htmlTextData: onenterdata,
        image: opener(image3),
        label: buffer,
        link: opener(link3),
        listItem: opener(listItem3),
        listItemValue: onenterlistitemvalue,
        listOrdered: opener(list4, onenterlistordered),
        listUnordered: opener(list4),
        paragraph: opener(paragraph3),
        reference: onenterreference,
        referenceString: buffer,
        resourceDestinationString: buffer,
        resourceTitleString: buffer,
        setextHeading: opener(heading3),
        strong: opener(strong3),
        thematicBreak: opener(thematicBreak4)
      },
      exit: {
        atxHeading: closer(),
        atxHeadingSequence: onexitatxheadingsequence,
        autolink: closer(),
        autolinkEmail: onexitautolinkemail,
        autolinkProtocol: onexitautolinkprotocol,
        blockQuote: closer(),
        characterEscapeValue: onexitdata,
        characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
        characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
        characterReferenceValue: onexitcharacterreferencevalue,
        characterReference: onexitcharacterreference,
        codeFenced: closer(onexitcodefenced),
        codeFencedFence: onexitcodefencedfence,
        codeFencedFenceInfo: onexitcodefencedfenceinfo,
        codeFencedFenceMeta: onexitcodefencedfencemeta,
        codeFlowValue: onexitdata,
        codeIndented: closer(onexitcodeindented),
        codeText: closer(onexitcodetext),
        codeTextData: onexitdata,
        data: onexitdata,
        definition: closer(),
        definitionDestinationString: onexitdefinitiondestinationstring,
        definitionLabelString: onexitdefinitionlabelstring,
        definitionTitleString: onexitdefinitiontitlestring,
        emphasis: closer(),
        hardBreakEscape: closer(onexithardbreak),
        hardBreakTrailing: closer(onexithardbreak),
        htmlFlow: closer(onexithtmlflow),
        htmlFlowData: onexitdata,
        htmlText: closer(onexithtmltext),
        htmlTextData: onexitdata,
        image: closer(onexitimage),
        label: onexitlabel,
        labelText: onexitlabeltext,
        lineEnding: onexitlineending,
        link: closer(onexitlink),
        listItem: closer(),
        listOrdered: closer(),
        listUnordered: closer(),
        paragraph: closer(),
        referenceString: onexitreferencestring,
        resourceDestinationString: onexitresourcedestinationstring,
        resourceTitleString: onexitresourcetitlestring,
        resource: onexitresource,
        setextHeading: closer(onexitsetextheading),
        setextHeadingLineSequence: onexitsetextheadinglinesequence,
        setextHeadingText: onexitsetextheadingtext,
        strong: closer(),
        thematicBreak: closer()
      }
    };
    configure(config, (options || {}).mdastExtensions || []);
    const data = {};
    return compile;
    function compile(events) {
      let tree = {
        type: "root",
        children: []
      };
      const context = {
        stack: [tree],
        tokenStack: [],
        config,
        enter,
        exit: exit3,
        buffer,
        resume,
        data
      };
      const listStack = [];
      let index2 = -1;
      while (++index2 < events.length) {
        if (events[index2][1].type === "listOrdered" || events[index2][1].type === "listUnordered") {
          if (events[index2][0] === "enter") {
            listStack.push(index2);
          } else {
            const tail = listStack.pop();
            index2 = prepareList(events, tail, index2);
          }
        }
      }
      index2 = -1;
      while (++index2 < events.length) {
        const handler = config[events[index2][0]];
        if (own2.call(handler, events[index2][1].type)) {
          handler[events[index2][1].type].call(Object.assign({
            sliceSerialize: events[index2][2].sliceSerialize
          }, context), events[index2][1]);
        }
      }
      if (context.tokenStack.length > 0) {
        const tail = context.tokenStack[context.tokenStack.length - 1];
        const handler = tail[1] || defaultOnError;
        handler.call(context, void 0, tail[0]);
      }
      tree.position = {
        start: point3(events.length > 0 ? events[0][1].start : {
          line: 1,
          column: 1,
          offset: 0
        }),
        end: point3(events.length > 0 ? events[events.length - 2][1].end : {
          line: 1,
          column: 1,
          offset: 0
        })
      };
      index2 = -1;
      while (++index2 < config.transforms.length) {
        tree = config.transforms[index2](tree) || tree;
      }
      return tree;
    }
    function prepareList(events, start2, length) {
      let index2 = start2 - 1;
      let containerBalance = -1;
      let listSpread = false;
      let listItem4;
      let lineIndex;
      let firstBlankLineIndex;
      let atMarker;
      while (++index2 <= length) {
        const event = events[index2];
        switch (event[1].type) {
          case "listUnordered":
          case "listOrdered":
          case "blockQuote": {
            if (event[0] === "enter") {
              containerBalance++;
            } else {
              containerBalance--;
            }
            atMarker = void 0;
            break;
          }
          case "lineEndingBlank": {
            if (event[0] === "enter") {
              if (listItem4 && !atMarker && !containerBalance && !firstBlankLineIndex) {
                firstBlankLineIndex = index2;
              }
              atMarker = void 0;
            }
            break;
          }
          case "linePrefix":
          case "listItemValue":
          case "listItemMarker":
          case "listItemPrefix":
          case "listItemPrefixWhitespace": {
            break;
          }
          default: {
            atMarker = void 0;
          }
        }
        if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
          if (listItem4) {
            let tailIndex = index2;
            lineIndex = void 0;
            while (tailIndex--) {
              const tailEvent = events[tailIndex];
              if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
                if (tailEvent[0] === "exit") continue;
                if (lineIndex) {
                  events[lineIndex][1].type = "lineEndingBlank";
                  listSpread = true;
                }
                tailEvent[1].type = "lineEnding";
                lineIndex = tailIndex;
              } else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {
              } else {
                break;
              }
            }
            if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) {
              listItem4._spread = true;
            }
            listItem4.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
            events.splice(lineIndex || index2, 0, ["exit", listItem4, event[2]]);
            index2++;
            length++;
          }
          if (event[1].type === "listItemPrefix") {
            const item = {
              type: "listItem",
              _spread: false,
              start: Object.assign({}, event[1].start),
              // @ts-expect-error: we’ll add `end` in a second.
              end: void 0
            };
            listItem4 = item;
            events.splice(index2, 0, ["enter", item, event[2]]);
            index2++;
            length++;
            firstBlankLineIndex = void 0;
            atMarker = true;
          }
        }
      }
      events[start2][1]._spread = listSpread;
      return length;
    }
    function opener(create2, and) {
      return open;
      function open(token) {
        enter.call(this, create2(token), token);
        if (and) and.call(this, token);
      }
    }
    function buffer() {
      this.stack.push({
        type: "fragment",
        children: []
      });
    }
    function enter(node2, token, errorHandler) {
      const parent = this.stack[this.stack.length - 1];
      const siblings = parent.children;
      siblings.push(node2);
      this.stack.push(node2);
      this.tokenStack.push([token, errorHandler || void 0]);
      node2.position = {
        start: point3(token.start),
        // @ts-expect-error: `end` will be patched later.
        end: void 0
      };
    }
    function closer(and) {
      return close;
      function close(token) {
        if (and) and.call(this, token);
        exit3.call(this, token);
      }
    }
    function exit3(token, onExitError) {
      const node2 = this.stack.pop();
      const open = this.tokenStack.pop();
      if (!open) {
        throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
          start: token.start,
          end: token.end
        }) + "): it\u2019s not open");
      } else if (open[0].type !== token.type) {
        if (onExitError) {
          onExitError.call(this, token, open[0]);
        } else {
          const handler = open[1] || defaultOnError;
          handler.call(this, token, open[0]);
        }
      }
      node2.position.end = point3(token.end);
    }
    function resume() {
      return toString(this.stack.pop());
    }
    function onenterlistordered() {
      this.data.expectingFirstListItemValue = true;
    }
    function onenterlistitemvalue(token) {
      if (this.data.expectingFirstListItemValue) {
        const ancestor = this.stack[this.stack.length - 2];
        ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
        this.data.expectingFirstListItemValue = void 0;
      }
    }
    function onexitcodefencedfenceinfo() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.lang = data2;
    }
    function onexitcodefencedfencemeta() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.meta = data2;
    }
    function onexitcodefencedfence() {
      if (this.data.flowCodeInside) return;
      this.buffer();
      this.data.flowCodeInside = true;
    }
    function onexitcodefenced() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.value = data2.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
      this.data.flowCodeInside = void 0;
    }
    function onexitcodeindented() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.value = data2.replace(/(\r?\n|\r)$/g, "");
    }
    function onexitdefinitionlabelstring(token) {
      const label = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.label = label;
      node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
    }
    function onexitdefinitiontitlestring() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.title = data2;
    }
    function onexitdefinitiondestinationstring() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.url = data2;
    }
    function onexitatxheadingsequence(token) {
      const node2 = this.stack[this.stack.length - 1];
      if (!node2.depth) {
        const depth = this.sliceSerialize(token).length;
        node2.depth = depth;
      }
    }
    function onexitsetextheadingtext() {
      this.data.setextHeadingSlurpLineEnding = true;
    }
    function onexitsetextheadinglinesequence(token) {
      const node2 = this.stack[this.stack.length - 1];
      node2.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
    }
    function onexitsetextheading() {
      this.data.setextHeadingSlurpLineEnding = void 0;
    }
    function onenterdata(token) {
      const node2 = this.stack[this.stack.length - 1];
      const siblings = node2.children;
      let tail = siblings[siblings.length - 1];
      if (!tail || tail.type !== "text") {
        tail = text7();
        tail.position = {
          start: point3(token.start),
          // @ts-expect-error: we’ll add `end` later.
          end: void 0
        };
        siblings.push(tail);
      }
      this.stack.push(tail);
    }
    function onexitdata(token) {
      const tail = this.stack.pop();
      tail.value += this.sliceSerialize(token);
      tail.position.end = point3(token.end);
    }
    function onexitlineending(token) {
      const context = this.stack[this.stack.length - 1];
      if (this.data.atHardBreak) {
        const tail = context.children[context.children.length - 1];
        tail.position.end = point3(token.end);
        this.data.atHardBreak = void 0;
        return;
      }
      if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
        onenterdata.call(this, token);
        onexitdata.call(this, token);
      }
    }
    function onexithardbreak() {
      this.data.atHardBreak = true;
    }
    function onexithtmlflow() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.value = data2;
    }
    function onexithtmltext() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.value = data2;
    }
    function onexitcodetext() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.value = data2;
    }
    function onexitlink() {
      const node2 = this.stack[this.stack.length - 1];
      if (this.data.inReference) {
        const referenceType = this.data.referenceType || "shortcut";
        node2.type += "Reference";
        node2.referenceType = referenceType;
        delete node2.url;
        delete node2.title;
      } else {
        delete node2.identifier;
        delete node2.label;
      }
      this.data.referenceType = void 0;
    }
    function onexitimage() {
      const node2 = this.stack[this.stack.length - 1];
      if (this.data.inReference) {
        const referenceType = this.data.referenceType || "shortcut";
        node2.type += "Reference";
        node2.referenceType = referenceType;
        delete node2.url;
        delete node2.title;
      } else {
        delete node2.identifier;
        delete node2.label;
      }
      this.data.referenceType = void 0;
    }
    function onexitlabeltext(token) {
      const string3 = this.sliceSerialize(token);
      const ancestor = this.stack[this.stack.length - 2];
      ancestor.label = decodeString(string3);
      ancestor.identifier = normalizeIdentifier(string3).toLowerCase();
    }
    function onexitlabel() {
      const fragment = this.stack[this.stack.length - 1];
      const value = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      this.data.inReference = true;
      if (node2.type === "link") {
        const children = fragment.children;
        node2.children = children;
      } else {
        node2.alt = value;
      }
    }
    function onexitresourcedestinationstring() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.url = data2;
    }
    function onexitresourcetitlestring() {
      const data2 = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.title = data2;
    }
    function onexitresource() {
      this.data.inReference = void 0;
    }
    function onenterreference() {
      this.data.referenceType = "collapsed";
    }
    function onexitreferencestring(token) {
      const label = this.resume();
      const node2 = this.stack[this.stack.length - 1];
      node2.label = label;
      node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
      this.data.referenceType = "full";
    }
    function onexitcharacterreferencemarker(token) {
      this.data.characterReferenceType = token.type;
    }
    function onexitcharacterreferencevalue(token) {
      const data2 = this.sliceSerialize(token);
      const type = this.data.characterReferenceType;
      let value;
      if (type) {
        value = decodeNumericCharacterReference(data2, type === "characterReferenceMarkerNumeric" ? 10 : 16);
        this.data.characterReferenceType = void 0;
      } else {
        const result = decodeNamedCharacterReference(data2);
        value = result;
      }
      const tail = this.stack[this.stack.length - 1];
      tail.value += value;
    }
    function onexitcharacterreference(token) {
      const tail = this.stack.pop();
      tail.position.end = point3(token.end);
    }
    function onexitautolinkprotocol(token) {
      onexitdata.call(this, token);
      const node2 = this.stack[this.stack.length - 1];
      node2.url = this.sliceSerialize(token);
    }
    function onexitautolinkemail(token) {
      onexitdata.call(this, token);
      const node2 = this.stack[this.stack.length - 1];
      node2.url = "mailto:" + this.sliceSerialize(token);
    }
    function blockQuote2() {
      return {
        type: "blockquote",
        children: []
      };
    }
    function codeFlow() {
      return {
        type: "code",
        lang: null,
        meta: null,
        value: ""
      };
    }
    function codeText2() {
      return {
        type: "inlineCode",
        value: ""
      };
    }
    function definition3() {
      return {
        type: "definition",
        identifier: "",
        label: null,
        title: null,
        url: ""
      };
    }
    function emphasis3() {
      return {
        type: "emphasis",
        children: []
      };
    }
    function heading3() {
      return {
        type: "heading",
        // @ts-expect-error `depth` will be set later.
        depth: 0,
        children: []
      };
    }
    function hardBreak3() {
      return {
        type: "break"
      };
    }
    function html5() {
      return {
        type: "html",
        value: ""
      };
    }
    function image3() {
      return {
        type: "image",
        title: null,
        url: "",
        alt: null
      };
    }
    function link3() {
      return {
        type: "link",
        title: null,
        url: "",
        children: []
      };
    }
    function list4(token) {
      return {
        type: "list",
        ordered: token.type === "listOrdered",
        start: null,
        spread: token._spread,
        children: []
      };
    }
    function listItem3(token) {
      return {
        type: "listItem",
        spread: token._spread,
        checked: null,
        children: []
      };
    }
    function paragraph3() {
      return {
        type: "paragraph",
        children: []
      };
    }
    function strong3() {
      return {
        type: "strong",
        children: []
      };
    }
    function text7() {
      return {
        type: "text",
        value: ""
      };
    }
    function thematicBreak4() {
      return {
        type: "thematicBreak"
      };
    }
  }
  function point3(d) {
    return {
      line: d.line,
      column: d.column,
      offset: d.offset
    };
  }
  function configure(combined, extensions) {
    let index2 = -1;
    while (++index2 < extensions.length) {
      const value = extensions[index2];
      if (Array.isArray(value)) {
        configure(combined, value);
      } else {
        extension(combined, value);
      }
    }
  }
  function extension(combined, extension2) {
    let key;
    for (key in extension2) {
      if (own2.call(extension2, key)) {
        switch (key) {
          case "canContainEols": {
            const right = extension2[key];
            if (right) {
              combined[key].push(...right);
            }
            break;
          }
          case "transforms": {
            const right = extension2[key];
            if (right) {
              combined[key].push(...right);
            }
            break;
          }
          case "enter":
          case "exit": {
            const right = extension2[key];
            if (right) {
              Object.assign(combined[key], right);
            }
            break;
          }
        }
      }
    }
  }
  function defaultOnError(left, right) {
    if (left) {
      throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
        start: left.start,
        end: left.end
      }) + "): a different token (`" + right.type + "`, " + stringifyPosition({
        start: right.start,
        end: right.end
      }) + ") is open");
    } else {
      throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
        start: right.start,
        end: right.end
      }) + ") is still open");
    }
  }

  // node_modules/remark-parse/lib/index.js
  function remarkParse(options) {
    const self2 = this;
    self2.parser = parser;
    function parser(doc) {
      return fromMarkdown(doc, {
        ...self2.data("settings"),
        ...options,
        // Note: these options are not in the readme.
        // The goal is for them to be set by plugins on `data` instead of being
        // passed by users.
        extensions: self2.data("micromarkExtensions") || [],
        mdastExtensions: self2.data("fromMarkdownExtensions") || []
      });
    }
  }

  // node_modules/remark-rehype/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-hast/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-hast/lib/handlers/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-hast/lib/handlers/blockquote.js
  init_define_import_meta_env();
  function blockquote(state, node2) {
    const result = {
      type: "element",
      tagName: "blockquote",
      properties: {},
      children: state.wrap(state.all(node2), true)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/break.js
  init_define_import_meta_env();
  function hardBreak(state, node2) {
    const result = { type: "element", tagName: "br", properties: {}, children: [] };
    state.patch(node2, result);
    return [state.applyData(node2, result), { type: "text", value: "\n" }];
  }

  // node_modules/mdast-util-to-hast/lib/handlers/code.js
  init_define_import_meta_env();
  function code(state, node2) {
    const value = node2.value ? node2.value + "\n" : "";
    const properties = {};
    const language = node2.lang ? node2.lang.split(/\s+/) : [];
    if (language.length > 0) {
      properties.className = ["language-" + language[0]];
    }
    let result = {
      type: "element",
      tagName: "code",
      properties,
      children: [{ type: "text", value }]
    };
    if (node2.meta) {
      result.data = { meta: node2.meta };
    }
    state.patch(node2, result);
    result = state.applyData(node2, result);
    result = { type: "element", tagName: "pre", properties: {}, children: [result] };
    state.patch(node2, result);
    return result;
  }

  // node_modules/mdast-util-to-hast/lib/handlers/delete.js
  init_define_import_meta_env();
  function strikethrough(state, node2) {
    const result = {
      type: "element",
      tagName: "del",
      properties: {},
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/emphasis.js
  init_define_import_meta_env();
  function emphasis(state, node2) {
    const result = {
      type: "element",
      tagName: "em",
      properties: {},
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/footnote-reference.js
  init_define_import_meta_env();
  function footnoteReference(state, node2) {
    const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
    const id = String(node2.identifier).toUpperCase();
    const safeId = normalizeUri(id.toLowerCase());
    const index2 = state.footnoteOrder.indexOf(id);
    let counter;
    let reuseCounter = state.footnoteCounts.get(id);
    if (reuseCounter === void 0) {
      reuseCounter = 0;
      state.footnoteOrder.push(id);
      counter = state.footnoteOrder.length;
    } else {
      counter = index2 + 1;
    }
    reuseCounter += 1;
    state.footnoteCounts.set(id, reuseCounter);
    const link3 = {
      type: "element",
      tagName: "a",
      properties: {
        href: "#" + clobberPrefix + "fn-" + safeId,
        id: clobberPrefix + "fnref-" + safeId + (reuseCounter > 1 ? "-" + reuseCounter : ""),
        dataFootnoteRef: true,
        ariaDescribedBy: ["footnote-label"]
      },
      children: [{ type: "text", value: String(counter) }]
    };
    state.patch(node2, link3);
    const sup = {
      type: "element",
      tagName: "sup",
      properties: {},
      children: [link3]
    };
    state.patch(node2, sup);
    return state.applyData(node2, sup);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/heading.js
  init_define_import_meta_env();
  function heading(state, node2) {
    const result = {
      type: "element",
      tagName: "h" + node2.depth,
      properties: {},
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/html.js
  init_define_import_meta_env();
  function html3(state, node2) {
    if (state.options.allowDangerousHtml) {
      const result = { type: "raw", value: node2.value };
      state.patch(node2, result);
      return state.applyData(node2, result);
    }
    return void 0;
  }

  // node_modules/mdast-util-to-hast/lib/handlers/image-reference.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-hast/lib/revert.js
  init_define_import_meta_env();
  function revert(state, node2) {
    const subtype = node2.referenceType;
    let suffix = "]";
    if (subtype === "collapsed") {
      suffix += "[]";
    } else if (subtype === "full") {
      suffix += "[" + (node2.label || node2.identifier) + "]";
    }
    if (node2.type === "imageReference") {
      return [{ type: "text", value: "![" + node2.alt + suffix }];
    }
    const contents = state.all(node2);
    const head = contents[0];
    if (head && head.type === "text") {
      head.value = "[" + head.value;
    } else {
      contents.unshift({ type: "text", value: "[" });
    }
    const tail = contents[contents.length - 1];
    if (tail && tail.type === "text") {
      tail.value += suffix;
    } else {
      contents.push({ type: "text", value: suffix });
    }
    return contents;
  }

  // node_modules/mdast-util-to-hast/lib/handlers/image-reference.js
  function imageReference(state, node2) {
    const id = String(node2.identifier).toUpperCase();
    const definition3 = state.definitionById.get(id);
    if (!definition3) {
      return revert(state, node2);
    }
    const properties = { src: normalizeUri(definition3.url || ""), alt: node2.alt };
    if (definition3.title !== null && definition3.title !== void 0) {
      properties.title = definition3.title;
    }
    const result = { type: "element", tagName: "img", properties, children: [] };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/image.js
  init_define_import_meta_env();
  function image(state, node2) {
    const properties = { src: normalizeUri(node2.url) };
    if (node2.alt !== null && node2.alt !== void 0) {
      properties.alt = node2.alt;
    }
    if (node2.title !== null && node2.title !== void 0) {
      properties.title = node2.title;
    }
    const result = { type: "element", tagName: "img", properties, children: [] };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/inline-code.js
  init_define_import_meta_env();
  function inlineCode(state, node2) {
    const text7 = { type: "text", value: node2.value.replace(/\r?\n|\r/g, " ") };
    state.patch(node2, text7);
    const result = {
      type: "element",
      tagName: "code",
      properties: {},
      children: [text7]
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/link-reference.js
  init_define_import_meta_env();
  function linkReference(state, node2) {
    const id = String(node2.identifier).toUpperCase();
    const definition3 = state.definitionById.get(id);
    if (!definition3) {
      return revert(state, node2);
    }
    const properties = { href: normalizeUri(definition3.url || "") };
    if (definition3.title !== null && definition3.title !== void 0) {
      properties.title = definition3.title;
    }
    const result = {
      type: "element",
      tagName: "a",
      properties,
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/link.js
  init_define_import_meta_env();
  function link(state, node2) {
    const properties = { href: normalizeUri(node2.url) };
    if (node2.title !== null && node2.title !== void 0) {
      properties.title = node2.title;
    }
    const result = {
      type: "element",
      tagName: "a",
      properties,
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/list-item.js
  init_define_import_meta_env();
  function listItem(state, node2, parent) {
    const results = state.all(node2);
    const loose = parent ? listLoose(parent) : listItemLoose(node2);
    const properties = {};
    const children = [];
    if (typeof node2.checked === "boolean") {
      const head = results[0];
      let paragraph3;
      if (head && head.type === "element" && head.tagName === "p") {
        paragraph3 = head;
      } else {
        paragraph3 = { type: "element", tagName: "p", properties: {}, children: [] };
        results.unshift(paragraph3);
      }
      if (paragraph3.children.length > 0) {
        paragraph3.children.unshift({ type: "text", value: " " });
      }
      paragraph3.children.unshift({
        type: "element",
        tagName: "input",
        properties: { type: "checkbox", checked: node2.checked, disabled: true },
        children: []
      });
      properties.className = ["task-list-item"];
    }
    let index2 = -1;
    while (++index2 < results.length) {
      const child = results[index2];
      if (loose || index2 !== 0 || child.type !== "element" || child.tagName !== "p") {
        children.push({ type: "text", value: "\n" });
      }
      if (child.type === "element" && child.tagName === "p" && !loose) {
        children.push(...child.children);
      } else {
        children.push(child);
      }
    }
    const tail = results[results.length - 1];
    if (tail && (loose || tail.type !== "element" || tail.tagName !== "p")) {
      children.push({ type: "text", value: "\n" });
    }
    const result = { type: "element", tagName: "li", properties, children };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }
  function listLoose(node2) {
    let loose = false;
    if (node2.type === "list") {
      loose = node2.spread || false;
      const children = node2.children;
      let index2 = -1;
      while (!loose && ++index2 < children.length) {
        loose = listItemLoose(children[index2]);
      }
    }
    return loose;
  }
  function listItemLoose(node2) {
    const spread = node2.spread;
    return spread === null || spread === void 0 ? node2.children.length > 1 : spread;
  }

  // node_modules/mdast-util-to-hast/lib/handlers/list.js
  init_define_import_meta_env();
  function list2(state, node2) {
    const properties = {};
    const results = state.all(node2);
    let index2 = -1;
    if (typeof node2.start === "number" && node2.start !== 1) {
      properties.start = node2.start;
    }
    while (++index2 < results.length) {
      const child = results[index2];
      if (child.type === "element" && child.tagName === "li" && child.properties && Array.isArray(child.properties.className) && child.properties.className.includes("task-list-item")) {
        properties.className = ["contains-task-list"];
        break;
      }
    }
    const result = {
      type: "element",
      tagName: node2.ordered ? "ol" : "ul",
      properties,
      children: state.wrap(results, true)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/paragraph.js
  init_define_import_meta_env();
  function paragraph(state, node2) {
    const result = {
      type: "element",
      tagName: "p",
      properties: {},
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/root.js
  init_define_import_meta_env();
  function root2(state, node2) {
    const result = { type: "root", children: state.wrap(state.all(node2)) };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/strong.js
  init_define_import_meta_env();
  function strong(state, node2) {
    const result = {
      type: "element",
      tagName: "strong",
      properties: {},
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/table.js
  init_define_import_meta_env();
  function table(state, node2) {
    const rows = state.all(node2);
    const firstRow = rows.shift();
    const tableContent = [];
    if (firstRow) {
      const head = {
        type: "element",
        tagName: "thead",
        properties: {},
        children: state.wrap([firstRow], true)
      };
      state.patch(node2.children[0], head);
      tableContent.push(head);
    }
    if (rows.length > 0) {
      const body = {
        type: "element",
        tagName: "tbody",
        properties: {},
        children: state.wrap(rows, true)
      };
      const start2 = pointStart(node2.children[1]);
      const end = pointEnd(node2.children[node2.children.length - 1]);
      if (start2 && end) body.position = { start: start2, end };
      tableContent.push(body);
    }
    const result = {
      type: "element",
      tagName: "table",
      properties: {},
      children: state.wrap(tableContent, true)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/table-row.js
  init_define_import_meta_env();
  function tableRow(state, node2, parent) {
    const siblings = parent ? parent.children : void 0;
    const rowIndex = siblings ? siblings.indexOf(node2) : 1;
    const tagName = rowIndex === 0 ? "th" : "td";
    const align = parent && parent.type === "table" ? parent.align : void 0;
    const length = align ? align.length : node2.children.length;
    let cellIndex = -1;
    const cells = [];
    while (++cellIndex < length) {
      const cell = node2.children[cellIndex];
      const properties = {};
      const alignValue = align ? align[cellIndex] : void 0;
      if (alignValue) {
        properties.align = alignValue;
      }
      let result2 = { type: "element", tagName, properties, children: [] };
      if (cell) {
        result2.children = state.all(cell);
        state.patch(cell, result2);
        result2 = state.applyData(cell, result2);
      }
      cells.push(result2);
    }
    const result = {
      type: "element",
      tagName: "tr",
      properties: {},
      children: state.wrap(cells, true)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/table-cell.js
  init_define_import_meta_env();
  function tableCell(state, node2) {
    const result = {
      type: "element",
      tagName: "td",
      // Assume body cell.
      properties: {},
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/text.js
  init_define_import_meta_env();

  // node_modules/trim-lines/index.js
  init_define_import_meta_env();
  var tab = 9;
  var space = 32;
  function trimLines(value) {
    const source = String(value);
    const search2 = /\r?\n|\r/g;
    let match = search2.exec(source);
    let last = 0;
    const lines = [];
    while (match) {
      lines.push(
        trimLine(source.slice(last, match.index), last > 0, true),
        match[0]
      );
      last = match.index + match[0].length;
      match = search2.exec(source);
    }
    lines.push(trimLine(source.slice(last), last > 0, false));
    return lines.join("");
  }
  function trimLine(value, start2, end) {
    let startIndex = 0;
    let endIndex = value.length;
    if (start2) {
      let code4 = value.codePointAt(startIndex);
      while (code4 === tab || code4 === space) {
        startIndex++;
        code4 = value.codePointAt(startIndex);
      }
    }
    if (end) {
      let code4 = value.codePointAt(endIndex - 1);
      while (code4 === tab || code4 === space) {
        endIndex--;
        code4 = value.codePointAt(endIndex - 1);
      }
    }
    return endIndex > startIndex ? value.slice(startIndex, endIndex) : "";
  }

  // node_modules/mdast-util-to-hast/lib/handlers/text.js
  function text4(state, node2) {
    const result = { type: "text", value: trimLines(String(node2.value)) };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/thematic-break.js
  init_define_import_meta_env();
  function thematicBreak2(state, node2) {
    const result = {
      type: "element",
      tagName: "hr",
      properties: {},
      children: []
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }

  // node_modules/mdast-util-to-hast/lib/handlers/index.js
  var handlers = {
    blockquote,
    break: hardBreak,
    code,
    delete: strikethrough,
    emphasis,
    footnoteReference,
    heading,
    html: html3,
    imageReference,
    image,
    inlineCode,
    linkReference,
    link,
    listItem,
    list: list2,
    paragraph,
    // @ts-expect-error: root is different, but hard to type.
    root: root2,
    strong,
    table,
    tableCell,
    tableRow,
    text: text4,
    thematicBreak: thematicBreak2,
    toml: ignore,
    yaml: ignore,
    definition: ignore,
    footnoteDefinition: ignore
  };
  function ignore() {
    return void 0;
  }

  // node_modules/mdast-util-to-hast/lib/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-hast/lib/footer.js
  init_define_import_meta_env();

  // node_modules/@ungap/structured-clone/esm/index.js
  init_define_import_meta_env();

  // node_modules/@ungap/structured-clone/esm/deserialize.js
  init_define_import_meta_env();

  // node_modules/@ungap/structured-clone/esm/types.js
  init_define_import_meta_env();
  var VOID = -1;
  var PRIMITIVE = 0;
  var ARRAY = 1;
  var OBJECT = 2;
  var DATE = 3;
  var REGEXP = 4;
  var MAP = 5;
  var SET = 6;
  var ERROR = 7;
  var BIGINT = 8;

  // node_modules/@ungap/structured-clone/esm/deserialize.js
  var env = typeof self === "object" ? self : globalThis;
  var guard = (name2, init) => {
    switch (name2) {
      case "Function":
      case "SharedWorker":
      case "Worker":
      case "eval":
      case "setInterval":
      case "setTimeout":
        throw new TypeError("unable to deserialize " + name2);
    }
    return new env[name2](init);
  };
  var deserializer = ($, _) => {
    const as = (out, index2) => {
      $.set(index2, out);
      return out;
    };
    const unpair = (index2) => {
      if ($.has(index2))
        return $.get(index2);
      const [type, value] = _[index2];
      switch (type) {
        case PRIMITIVE:
        case VOID:
          return as(value, index2);
        case ARRAY: {
          const arr = as([], index2);
          for (const index3 of value)
            arr.push(unpair(index3));
          return arr;
        }
        case OBJECT: {
          const object = as({}, index2);
          for (const [key, index3] of value)
            object[unpair(key)] = unpair(index3);
          return object;
        }
        case DATE:
          return as(new Date(value), index2);
        case REGEXP: {
          const { source, flags } = value;
          return as(new RegExp(source, flags), index2);
        }
        case MAP: {
          const map3 = as(/* @__PURE__ */ new Map(), index2);
          for (const [key, index3] of value)
            map3.set(unpair(key), unpair(index3));
          return map3;
        }
        case SET: {
          const set = as(/* @__PURE__ */ new Set(), index2);
          for (const index3 of value)
            set.add(unpair(index3));
          return set;
        }
        case ERROR: {
          const { name: name2, message } = value;
          return as(
            typeof env[name2] === "function" ? guard(name2, message) : new Error(message),
            index2
          );
        }
        case BIGINT:
          return as(BigInt(value), index2);
        case "BigInt":
          return as(Object(BigInt(value)), index2);
        case "ArrayBuffer":
          return as(new Uint8Array(value).buffer, value);
        case "DataView": {
          const { buffer } = new Uint8Array(value);
          return as(new DataView(buffer), value);
        }
      }
      return as(guard(type, value), index2);
    };
    return unpair;
  };
  var deserialize = (serialized) => deserializer(/* @__PURE__ */ new Map(), serialized)(0);

  // node_modules/@ungap/structured-clone/esm/serialize.js
  init_define_import_meta_env();
  var EMPTY = "";
  var { toString: toString2 } = {};
  var { keys } = Object;
  var typeOf = (value) => {
    const type = typeof value;
    if (type !== "object" || !value)
      return [PRIMITIVE, type];
    const asString = toString2.call(value).slice(8, -1);
    switch (asString) {
      case "Array":
        return [ARRAY, EMPTY];
      case "Object":
        return [OBJECT, EMPTY];
      case "Date":
        return [DATE, EMPTY];
      case "RegExp":
        return [REGEXP, EMPTY];
      case "Map":
        return [MAP, EMPTY];
      case "Set":
        return [SET, EMPTY];
      case "DataView":
        return [ARRAY, asString];
    }
    if (asString.includes("Array"))
      return [ARRAY, asString];
    if (value instanceof Error)
      return [ERROR, value.name || "Error"];
    return [OBJECT, asString];
  };
  var shouldSkip = ([TYPE, type]) => TYPE === PRIMITIVE && (type === "function" || type === "symbol");
  var serializer = (strict, json, $, _) => {
    const as = (out, value) => {
      const index2 = _.push(out) - 1;
      $.set(value, index2);
      return index2;
    };
    const pair = (value) => {
      if ($.has(value))
        return $.get(value);
      let [TYPE, type] = typeOf(value);
      switch (TYPE) {
        case PRIMITIVE: {
          let entry = value;
          switch (type) {
            case "bigint":
              TYPE = BIGINT;
              entry = value.toString();
              break;
            case "function":
            case "symbol":
              if (strict)
                throw new TypeError("unable to serialize " + type);
              entry = null;
              break;
            case "undefined":
              return as([VOID], value);
          }
          return as([TYPE, entry], value);
        }
        case ARRAY: {
          if (type) {
            let spread = value;
            if (type === "DataView") {
              spread = new Uint8Array(value.buffer);
            } else if (type === "ArrayBuffer") {
              spread = new Uint8Array(value);
            }
            return as([type, [...spread]], value);
          }
          const arr = [];
          const index2 = as([TYPE, arr], value);
          for (const entry of value)
            arr.push(pair(entry));
          return index2;
        }
        case OBJECT: {
          if (type) {
            switch (type) {
              case "BigInt":
                return as([type, value.toString()], value);
              case "Boolean":
              case "Number":
              case "String":
                return as([type, value.valueOf()], value);
            }
          }
          if (json && "toJSON" in value)
            return pair(value.toJSON());
          const entries = [];
          const index2 = as([TYPE, entries], value);
          for (const key of keys(value)) {
            if (strict || !shouldSkip(typeOf(value[key])))
              entries.push([pair(key), pair(value[key])]);
          }
          return index2;
        }
        case DATE:
          return as([TYPE, isNaN(value.getTime()) ? EMPTY : value.toISOString()], value);
        case REGEXP: {
          const { source, flags } = value;
          return as([TYPE, { source, flags }], value);
        }
        case MAP: {
          const entries = [];
          const index2 = as([TYPE, entries], value);
          for (const [key, entry] of value) {
            if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry))))
              entries.push([pair(key), pair(entry)]);
          }
          return index2;
        }
        case SET: {
          const entries = [];
          const index2 = as([TYPE, entries], value);
          for (const entry of value) {
            if (strict || !shouldSkip(typeOf(entry)))
              entries.push(pair(entry));
          }
          return index2;
        }
      }
      const { message } = value;
      return as([TYPE, { name: type, message }], value);
    };
    return pair;
  };
  var serialize = (value, { json, lossy } = {}) => {
    const _ = [];
    return serializer(!(json || lossy), !!json, /* @__PURE__ */ new Map(), _)(value), _;
  };

  // node_modules/@ungap/structured-clone/esm/index.js
  var esm_default = typeof structuredClone === "function" ? (
    /* c8 ignore start */
    (any, options) => options && ("json" in options || "lossy" in options) ? deserialize(serialize(any, options)) : structuredClone(any)
  ) : (any, options) => deserialize(serialize(any, options));

  // node_modules/mdast-util-to-hast/lib/footer.js
  function defaultFootnoteBackContent(_, rereferenceIndex) {
    const result = [{ type: "text", value: "\u21A9" }];
    if (rereferenceIndex > 1) {
      result.push({
        type: "element",
        tagName: "sup",
        properties: {},
        children: [{ type: "text", value: String(rereferenceIndex) }]
      });
    }
    return result;
  }
  function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
    return "Back to reference " + (referenceIndex + 1) + (rereferenceIndex > 1 ? "-" + rereferenceIndex : "");
  }
  function footer(state) {
    const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
    const footnoteBackContent = state.options.footnoteBackContent || defaultFootnoteBackContent;
    const footnoteBackLabel = state.options.footnoteBackLabel || defaultFootnoteBackLabel;
    const footnoteLabel = state.options.footnoteLabel || "Footnotes";
    const footnoteLabelTagName = state.options.footnoteLabelTagName || "h2";
    const footnoteLabelProperties = state.options.footnoteLabelProperties || {
      className: ["sr-only"]
    };
    const listItems = [];
    let referenceIndex = -1;
    while (++referenceIndex < state.footnoteOrder.length) {
      const definition3 = state.footnoteById.get(
        state.footnoteOrder[referenceIndex]
      );
      if (!definition3) {
        continue;
      }
      const content3 = state.all(definition3);
      const id = String(definition3.identifier).toUpperCase();
      const safeId = normalizeUri(id.toLowerCase());
      let rereferenceIndex = 0;
      const backReferences = [];
      const counts = state.footnoteCounts.get(id);
      while (counts !== void 0 && ++rereferenceIndex <= counts) {
        if (backReferences.length > 0) {
          backReferences.push({ type: "text", value: " " });
        }
        let children = typeof footnoteBackContent === "string" ? footnoteBackContent : footnoteBackContent(referenceIndex, rereferenceIndex);
        if (typeof children === "string") {
          children = { type: "text", value: children };
        }
        backReferences.push({
          type: "element",
          tagName: "a",
          properties: {
            href: "#" + clobberPrefix + "fnref-" + safeId + (rereferenceIndex > 1 ? "-" + rereferenceIndex : ""),
            dataFootnoteBackref: "",
            ariaLabel: typeof footnoteBackLabel === "string" ? footnoteBackLabel : footnoteBackLabel(referenceIndex, rereferenceIndex),
            className: ["data-footnote-backref"]
          },
          children: Array.isArray(children) ? children : [children]
        });
      }
      const tail = content3[content3.length - 1];
      if (tail && tail.type === "element" && tail.tagName === "p") {
        const tailTail = tail.children[tail.children.length - 1];
        if (tailTail && tailTail.type === "text") {
          tailTail.value += " ";
        } else {
          tail.children.push({ type: "text", value: " " });
        }
        tail.children.push(...backReferences);
      } else {
        content3.push(...backReferences);
      }
      const listItem3 = {
        type: "element",
        tagName: "li",
        properties: { id: clobberPrefix + "fn-" + safeId },
        children: state.wrap(content3, true)
      };
      state.patch(definition3, listItem3);
      listItems.push(listItem3);
    }
    if (listItems.length === 0) {
      return;
    }
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: true, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: footnoteLabelTagName,
          properties: {
            ...esm_default(footnoteLabelProperties),
            id: "footnote-label"
          },
          children: [{ type: "text", value: footnoteLabel }]
        },
        { type: "text", value: "\n" },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: state.wrap(listItems, true)
        },
        { type: "text", value: "\n" }
      ]
    };
  }

  // node_modules/mdast-util-to-hast/lib/state.js
  init_define_import_meta_env();

  // node_modules/unist-util-visit/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-visit/lib/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-visit-parents/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-visit-parents/lib/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-is/index.js
  init_define_import_meta_env();

  // node_modules/unist-util-is/lib/index.js
  init_define_import_meta_env();
  var convert = (
    // Note: overloads in JSDoc can’t yet use different `@template`s.
    /**
     * @type {(
     *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
     *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
     *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
     *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
     *   ((test?: Test) => Check)
     * )}
     */
    /**
     * @param {Test} [test]
     * @returns {Check}
     */
    (function(test) {
      if (test === null || test === void 0) {
        return ok2;
      }
      if (typeof test === "function") {
        return castFactory(test);
      }
      if (typeof test === "object") {
        return Array.isArray(test) ? anyFactory(test) : (
          // Cast because `ReadonlyArray` goes into the above but `isArray`
          // narrows to `Array`.
          propertiesFactory(
            /** @type {Props} */
            test
          )
        );
      }
      if (typeof test === "string") {
        return typeFactory(test);
      }
      throw new Error("Expected function, string, or object as test");
    })
  );
  function anyFactory(tests) {
    const checks2 = [];
    let index2 = -1;
    while (++index2 < tests.length) {
      checks2[index2] = convert(tests[index2]);
    }
    return castFactory(any);
    function any(...parameters) {
      let index3 = -1;
      while (++index3 < checks2.length) {
        if (checks2[index3].apply(this, parameters)) return true;
      }
      return false;
    }
  }
  function propertiesFactory(check) {
    const checkAsRecord = (
      /** @type {Record<string, unknown>} */
      check
    );
    return castFactory(all2);
    function all2(node2) {
      const nodeAsRecord = (
        /** @type {Record<string, unknown>} */
        /** @type {unknown} */
        node2
      );
      let key;
      for (key in check) {
        if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
      }
      return true;
    }
  }
  function typeFactory(check) {
    return castFactory(type);
    function type(node2) {
      return node2 && node2.type === check;
    }
  }
  function castFactory(testFunction) {
    return check;
    function check(value, index2, parent) {
      return Boolean(
        looksLikeANode(value) && testFunction.call(
          this,
          value,
          typeof index2 === "number" ? index2 : void 0,
          parent || void 0
        )
      );
    }
  }
  function ok2() {
    return true;
  }
  function looksLikeANode(value) {
    return value !== null && typeof value === "object" && "type" in value;
  }

  // node_modules/unist-util-visit-parents/lib/color.js
  init_define_import_meta_env();
  function color(d) {
    return d;
  }

  // node_modules/unist-util-visit-parents/lib/index.js
  var empty2 = [];
  var CONTINUE = true;
  var EXIT = false;
  var SKIP = "skip";
  function visitParents(tree, test, visitor, reverse) {
    let check;
    if (typeof test === "function" && typeof visitor !== "function") {
      reverse = visitor;
      visitor = test;
    } else {
      check = test;
    }
    const is2 = convert(check);
    const step = reverse ? -1 : 1;
    factory(tree, void 0, [])();
    function factory(node2, index2, parents) {
      const value = (
        /** @type {Record<string, unknown>} */
        node2 && typeof node2 === "object" ? node2 : {}
      );
      if (typeof value.type === "string") {
        const name2 = (
          // `hast`
          typeof value.tagName === "string" ? value.tagName : (
            // `xast`
            typeof value.name === "string" ? value.name : void 0
          )
        );
        Object.defineProperty(visit2, "name", {
          value: "node (" + color(node2.type + (name2 ? "<" + name2 + ">" : "")) + ")"
        });
      }
      return visit2;
      function visit2() {
        let result = empty2;
        let subresult;
        let offset;
        let grandparents;
        if (!test || is2(node2, index2, parents[parents.length - 1] || void 0)) {
          result = toResult(visitor(node2, parents));
          if (result[0] === EXIT) {
            return result;
          }
        }
        if ("children" in node2 && node2.children) {
          const nodeAsParent = (
            /** @type {UnistParent} */
            node2
          );
          if (nodeAsParent.children && result[0] !== SKIP) {
            offset = (reverse ? nodeAsParent.children.length : -1) + step;
            grandparents = parents.concat(nodeAsParent);
            while (offset > -1 && offset < nodeAsParent.children.length) {
              const child = nodeAsParent.children[offset];
              subresult = factory(child, offset, grandparents)();
              if (subresult[0] === EXIT) {
                return subresult;
              }
              offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
            }
          }
        }
        return result;
      }
    }
  }
  function toResult(value) {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "number") {
      return [CONTINUE, value];
    }
    return value === null || value === void 0 ? empty2 : [value];
  }

  // node_modules/unist-util-visit/lib/index.js
  function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
    let reverse;
    let test;
    let visitor;
    if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
      test = void 0;
      visitor = testOrVisitor;
      reverse = visitorOrReverse;
    } else {
      test = testOrVisitor;
      visitor = visitorOrReverse;
      reverse = maybeReverse;
    }
    visitParents(tree, test, overload, reverse);
    function overload(node2, parents) {
      const parent = parents[parents.length - 1];
      const index2 = parent ? parent.children.indexOf(node2) : void 0;
      return visitor(node2, index2, parent);
    }
  }

  // node_modules/mdast-util-to-hast/lib/state.js
  var own3 = {}.hasOwnProperty;
  var emptyOptions3 = {};
  function createState(tree, options) {
    const settings = options || emptyOptions3;
    const definitionById = /* @__PURE__ */ new Map();
    const footnoteById = /* @__PURE__ */ new Map();
    const footnoteCounts = /* @__PURE__ */ new Map();
    const handlers2 = { ...handlers, ...settings.handlers };
    const state = {
      all: all2,
      applyData,
      definitionById,
      footnoteById,
      footnoteCounts,
      footnoteOrder: [],
      handlers: handlers2,
      one: one3,
      options: settings,
      patch,
      wrap
    };
    visit(tree, function(node2) {
      if (node2.type === "definition" || node2.type === "footnoteDefinition") {
        const map3 = node2.type === "definition" ? definitionById : footnoteById;
        const id = String(node2.identifier).toUpperCase();
        if (!map3.has(id)) {
          map3.set(id, node2);
        }
      }
    });
    return state;
    function one3(node2, parent) {
      const type = node2.type;
      const handle2 = state.handlers[type];
      if (own3.call(state.handlers, type) && handle2) {
        return handle2(state, node2, parent);
      }
      if (state.options.passThrough && state.options.passThrough.includes(type)) {
        if ("children" in node2) {
          const { children, ...shallow } = node2;
          const result = esm_default(shallow);
          result.children = state.all(node2);
          return result;
        }
        return esm_default(node2);
      }
      const unknown = state.options.unknownHandler || defaultUnknownHandler;
      return unknown(state, node2, parent);
    }
    function all2(parent) {
      const values = [];
      if ("children" in parent) {
        const nodes = parent.children;
        let index2 = -1;
        while (++index2 < nodes.length) {
          const result = state.one(nodes[index2], parent);
          if (result) {
            if (index2 && nodes[index2 - 1].type === "break") {
              if (!Array.isArray(result) && result.type === "text") {
                result.value = trimMarkdownSpaceStart(result.value);
              }
              if (!Array.isArray(result) && result.type === "element") {
                const head = result.children[0];
                if (head && head.type === "text") {
                  head.value = trimMarkdownSpaceStart(head.value);
                }
              }
            }
            if (Array.isArray(result)) {
              values.push(...result);
            } else {
              values.push(result);
            }
          }
        }
      }
      return values;
    }
  }
  function patch(from, to) {
    if (from.position) to.position = position(from);
  }
  function applyData(from, to) {
    let result = to;
    if (from && from.data) {
      const hName = from.data.hName;
      const hChildren = from.data.hChildren;
      const hProperties = from.data.hProperties;
      if (typeof hName === "string") {
        if (result.type === "element") {
          result.tagName = hName;
        } else {
          const children = "children" in result ? result.children : [result];
          result = { type: "element", tagName: hName, properties: {}, children };
        }
      }
      if (result.type === "element" && hProperties) {
        Object.assign(result.properties, esm_default(hProperties));
      }
      if ("children" in result && result.children && hChildren !== null && hChildren !== void 0) {
        result.children = hChildren;
      }
    }
    return result;
  }
  function defaultUnknownHandler(state, node2) {
    const data = node2.data || {};
    const result = "value" in node2 && !(own3.call(data, "hProperties") || own3.call(data, "hChildren")) ? { type: "text", value: node2.value } : {
      type: "element",
      tagName: "div",
      properties: {},
      children: state.all(node2)
    };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }
  function wrap(nodes, loose) {
    const result = [];
    let index2 = -1;
    if (loose) {
      result.push({ type: "text", value: "\n" });
    }
    while (++index2 < nodes.length) {
      if (index2) result.push({ type: "text", value: "\n" });
      result.push(nodes[index2]);
    }
    if (loose && nodes.length > 0) {
      result.push({ type: "text", value: "\n" });
    }
    return result;
  }
  function trimMarkdownSpaceStart(value) {
    let index2 = 0;
    let code4 = value.charCodeAt(index2);
    while (code4 === 9 || code4 === 32) {
      index2++;
      code4 = value.charCodeAt(index2);
    }
    return value.slice(index2);
  }

  // node_modules/mdast-util-to-hast/lib/index.js
  function toHast(tree, options) {
    const state = createState(tree, options);
    const node2 = state.one(tree, void 0);
    const foot = footer(state);
    const result = Array.isArray(node2) ? { type: "root", children: node2 } : node2 || { type: "root", children: [] };
    if (foot) {
      ok("children" in result);
      result.children.push({ type: "text", value: "\n" }, foot);
    }
    return result;
  }

  // node_modules/remark-rehype/lib/index.js
  init_define_import_meta_env();
  function remarkRehype(destination, options) {
    if (destination && "run" in destination) {
      return async function(tree, file) {
        const hastTree = (
          /** @type {HastRoot} */
          toHast(tree, { file, ...options })
        );
        await destination.run(hastTree, file);
      };
    }
    return function(tree, file) {
      return (
        /** @type {HastRoot} */
        toHast(tree, { file, ...destination || options })
      );
    };
  }

  // node_modules/unified/index.js
  init_define_import_meta_env();

  // node_modules/unified/lib/index.js
  init_define_import_meta_env();

  // node_modules/bail/index.js
  init_define_import_meta_env();
  function bail(error) {
    if (error) {
      throw error;
    }
  }

  // node_modules/unified/lib/index.js
  var import_extend = __toESM(require_extend(), 1);

  // node_modules/is-plain-obj/index.js
  init_define_import_meta_env();
  function isPlainObject(value) {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
  }

  // node_modules/trough/index.js
  init_define_import_meta_env();

  // node_modules/trough/lib/index.js
  init_define_import_meta_env();
  function trough() {
    const fns = [];
    const pipeline = { run, use };
    return pipeline;
    function run(...values) {
      let middlewareIndex = -1;
      const callback = values.pop();
      if (typeof callback !== "function") {
        throw new TypeError("Expected function as last argument, not " + callback);
      }
      next(null, ...values);
      function next(error, ...output) {
        const fn = fns[++middlewareIndex];
        let index2 = -1;
        if (error) {
          callback(error);
          return;
        }
        while (++index2 < values.length) {
          if (output[index2] === null || output[index2] === void 0) {
            output[index2] = values[index2];
          }
        }
        values = output;
        if (fn) {
          wrap2(fn, next)(...output);
        } else {
          callback(null, ...output);
        }
      }
    }
    function use(middelware) {
      if (typeof middelware !== "function") {
        throw new TypeError(
          "Expected `middelware` to be a function, not " + middelware
        );
      }
      fns.push(middelware);
      return pipeline;
    }
  }
  function wrap2(middleware, callback) {
    let called;
    return wrapped;
    function wrapped(...parameters) {
      const fnExpectsCallback = middleware.length > parameters.length;
      let result;
      if (fnExpectsCallback) {
        parameters.push(done);
      }
      try {
        result = middleware.apply(this, parameters);
      } catch (error) {
        const exception = (
          /** @type {Error} */
          error
        );
        if (fnExpectsCallback && called) {
          throw exception;
        }
        return done(exception);
      }
      if (!fnExpectsCallback) {
        if (result && result.then && typeof result.then === "function") {
          result.then(then, done);
        } else if (result instanceof Error) {
          done(result);
        } else {
          then(result);
        }
      }
    }
    function done(error, ...output) {
      if (!called) {
        called = true;
        callback(error, ...output);
      }
    }
    function then(value) {
      done(null, value);
    }
  }

  // node_modules/vfile/index.js
  init_define_import_meta_env();

  // node_modules/vfile/lib/index.js
  init_define_import_meta_env();

  // node_modules/vfile/lib/minpath.browser.js
  init_define_import_meta_env();
  var minpath = { basename, dirname, extname, join, sep: "/" };
  function basename(path2, extname2) {
    if (extname2 !== void 0 && typeof extname2 !== "string") {
      throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path2);
    let start2 = 0;
    let end = -1;
    let index2 = path2.length;
    let seenNonSlash;
    if (extname2 === void 0 || extname2.length === 0 || extname2.length > path2.length) {
      while (index2--) {
        if (path2.codePointAt(index2) === 47) {
          if (seenNonSlash) {
            start2 = index2 + 1;
            break;
          }
        } else if (end < 0) {
          seenNonSlash = true;
          end = index2 + 1;
        }
      }
      return end < 0 ? "" : path2.slice(start2, end);
    }
    if (extname2 === path2) {
      return "";
    }
    let firstNonSlashEnd = -1;
    let extnameIndex = extname2.length - 1;
    while (index2--) {
      if (path2.codePointAt(index2) === 47) {
        if (seenNonSlash) {
          start2 = index2 + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd < 0) {
          seenNonSlash = true;
          firstNonSlashEnd = index2 + 1;
        }
        if (extnameIndex > -1) {
          if (path2.codePointAt(index2) === extname2.codePointAt(extnameIndex--)) {
            if (extnameIndex < 0) {
              end = index2;
            }
          } else {
            extnameIndex = -1;
            end = firstNonSlashEnd;
          }
        }
      }
    }
    if (start2 === end) {
      end = firstNonSlashEnd;
    } else if (end < 0) {
      end = path2.length;
    }
    return path2.slice(start2, end);
  }
  function dirname(path2) {
    assertPath(path2);
    if (path2.length === 0) {
      return ".";
    }
    let end = -1;
    let index2 = path2.length;
    let unmatchedSlash;
    while (--index2) {
      if (path2.codePointAt(index2) === 47) {
        if (unmatchedSlash) {
          end = index2;
          break;
        }
      } else if (!unmatchedSlash) {
        unmatchedSlash = true;
      }
    }
    return end < 0 ? path2.codePointAt(0) === 47 ? "/" : "." : end === 1 && path2.codePointAt(0) === 47 ? "//" : path2.slice(0, end);
  }
  function extname(path2) {
    assertPath(path2);
    let index2 = path2.length;
    let end = -1;
    let startPart = 0;
    let startDot = -1;
    let preDotState = 0;
    let unmatchedSlash;
    while (index2--) {
      const code4 = path2.codePointAt(index2);
      if (code4 === 47) {
        if (unmatchedSlash) {
          startPart = index2 + 1;
          break;
        }
        continue;
      }
      if (end < 0) {
        unmatchedSlash = true;
        end = index2 + 1;
      }
      if (code4 === 46) {
        if (startDot < 0) {
          startDot = index2;
        } else if (preDotState !== 1) {
          preDotState = 1;
        }
      } else if (startDot > -1) {
        preDotState = -1;
      }
    }
    if (startDot < 0 || end < 0 || // We saw a non-dot character immediately before the dot.
    preDotState === 0 || // The (right-most) trimmed path component is exactly `..`.
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return "";
    }
    return path2.slice(startDot, end);
  }
  function join(...segments) {
    let index2 = -1;
    let joined;
    while (++index2 < segments.length) {
      assertPath(segments[index2]);
      if (segments[index2]) {
        joined = joined === void 0 ? segments[index2] : joined + "/" + segments[index2];
      }
    }
    return joined === void 0 ? "." : normalize2(joined);
  }
  function normalize2(path2) {
    assertPath(path2);
    const absolute = path2.codePointAt(0) === 47;
    let value = normalizeString(path2, !absolute);
    if (value.length === 0 && !absolute) {
      value = ".";
    }
    if (value.length > 0 && path2.codePointAt(path2.length - 1) === 47) {
      value += "/";
    }
    return absolute ? "/" + value : value;
  }
  function normalizeString(path2, allowAboveRoot) {
    let result = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let index2 = -1;
    let code4;
    let lastSlashIndex;
    while (++index2 <= path2.length) {
      if (index2 < path2.length) {
        code4 = path2.codePointAt(index2);
      } else if (code4 === 47) {
        break;
      } else {
        code4 = 47;
      }
      if (code4 === 47) {
        if (lastSlash === index2 - 1 || dots === 1) {
        } else if (lastSlash !== index2 - 1 && dots === 2) {
          if (result.length < 2 || lastSegmentLength !== 2 || result.codePointAt(result.length - 1) !== 46 || result.codePointAt(result.length - 2) !== 46) {
            if (result.length > 2) {
              lastSlashIndex = result.lastIndexOf("/");
              if (lastSlashIndex !== result.length - 1) {
                if (lastSlashIndex < 0) {
                  result = "";
                  lastSegmentLength = 0;
                } else {
                  result = result.slice(0, lastSlashIndex);
                  lastSegmentLength = result.length - 1 - result.lastIndexOf("/");
                }
                lastSlash = index2;
                dots = 0;
                continue;
              }
            } else if (result.length > 0) {
              result = "";
              lastSegmentLength = 0;
              lastSlash = index2;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            result = result.length > 0 ? result + "/.." : "..";
            lastSegmentLength = 2;
          }
        } else {
          if (result.length > 0) {
            result += "/" + path2.slice(lastSlash + 1, index2);
          } else {
            result = path2.slice(lastSlash + 1, index2);
          }
          lastSegmentLength = index2 - lastSlash - 1;
        }
        lastSlash = index2;
        dots = 0;
      } else if (code4 === 46 && dots > -1) {
        dots++;
      } else {
        dots = -1;
      }
    }
    return result;
  }
  function assertPath(path2) {
    if (typeof path2 !== "string") {
      throw new TypeError(
        "Path must be a string. Received " + JSON.stringify(path2)
      );
    }
  }

  // node_modules/vfile/lib/minproc.browser.js
  init_define_import_meta_env();
  var minproc = { cwd };
  function cwd() {
    return "/";
  }

  // node_modules/vfile/lib/minurl.browser.js
  init_define_import_meta_env();

  // node_modules/vfile/lib/minurl.shared.js
  init_define_import_meta_env();
  function isUrl(fileUrlOrPath) {
    return Boolean(
      fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && // @ts-expect-error: indexing is fine.
      fileUrlOrPath.auth === void 0
    );
  }

  // node_modules/vfile/lib/minurl.browser.js
  function urlToPath(path2) {
    if (typeof path2 === "string") {
      path2 = new URL(path2);
    } else if (!isUrl(path2)) {
      const error = new TypeError(
        'The "path" argument must be of type string or an instance of URL. Received `' + path2 + "`"
      );
      error.code = "ERR_INVALID_ARG_TYPE";
      throw error;
    }
    if (path2.protocol !== "file:") {
      const error = new TypeError("The URL must be of scheme file");
      error.code = "ERR_INVALID_URL_SCHEME";
      throw error;
    }
    return getPathFromURLPosix(path2);
  }
  function getPathFromURLPosix(url) {
    if (url.hostname !== "") {
      const error = new TypeError(
        'File URL host must be "localhost" or empty on darwin'
      );
      error.code = "ERR_INVALID_FILE_URL_HOST";
      throw error;
    }
    const pathname = url.pathname;
    let index2 = -1;
    while (++index2 < pathname.length) {
      if (pathname.codePointAt(index2) === 37 && pathname.codePointAt(index2 + 1) === 50) {
        const third = pathname.codePointAt(index2 + 2);
        if (third === 70 || third === 102) {
          const error = new TypeError(
            "File URL path must not include encoded / characters"
          );
          error.code = "ERR_INVALID_FILE_URL_PATH";
          throw error;
        }
      }
    }
    return decodeURIComponent(pathname);
  }

  // node_modules/vfile/lib/index.js
  var order = (
    /** @type {const} */
    [
      "history",
      "path",
      "basename",
      "stem",
      "extname",
      "dirname"
    ]
  );
  var VFile = class {
    /**
     * Create a new virtual file.
     *
     * `options` is treated as:
     *
     * *   `string` or `Uint8Array` — `{value: options}`
     * *   `URL` — `{path: options}`
     * *   `VFile` — shallow copies its data over to the new file
     * *   `object` — all fields are shallow copied over to the new file
     *
     * Path related fields are set in the following order (least specific to
     * most specific): `history`, `path`, `basename`, `stem`, `extname`,
     * `dirname`.
     *
     * You cannot set `dirname` or `extname` without setting either `history`,
     * `path`, `basename`, or `stem` too.
     *
     * @param {Compatible | null | undefined} [value]
     *   File value.
     * @returns
     *   New instance.
     */
    constructor(value) {
      let options;
      if (!value) {
        options = {};
      } else if (isUrl(value)) {
        options = { path: value };
      } else if (typeof value === "string" || isUint8Array(value)) {
        options = { value };
      } else {
        options = value;
      }
      this.cwd = "cwd" in options ? "" : minproc.cwd();
      this.data = {};
      this.history = [];
      this.messages = [];
      this.value;
      this.map;
      this.result;
      this.stored;
      let index2 = -1;
      while (++index2 < order.length) {
        const field2 = order[index2];
        if (field2 in options && options[field2] !== void 0 && options[field2] !== null) {
          this[field2] = field2 === "history" ? [...options[field2]] : options[field2];
        }
      }
      let field;
      for (field in options) {
        if (!order.includes(field)) {
          this[field] = options[field];
        }
      }
    }
    /**
     * Get the basename (including extname) (example: `'index.min.js'`).
     *
     * @returns {string | undefined}
     *   Basename.
     */
    get basename() {
      return typeof this.path === "string" ? minpath.basename(this.path) : void 0;
    }
    /**
     * Set basename (including extname) (`'index.min.js'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be nullified (use `file.path = file.dirname` instead).
     *
     * @param {string} basename
     *   Basename.
     * @returns {undefined}
     *   Nothing.
     */
    set basename(basename2) {
      assertNonEmpty(basename2, "basename");
      assertPart(basename2, "basename");
      this.path = minpath.join(this.dirname || "", basename2);
    }
    /**
     * Get the parent path (example: `'~'`).
     *
     * @returns {string | undefined}
     *   Dirname.
     */
    get dirname() {
      return typeof this.path === "string" ? minpath.dirname(this.path) : void 0;
    }
    /**
     * Set the parent path (example: `'~'`).
     *
     * Cannot be set if there’s no `path` yet.
     *
     * @param {string | undefined} dirname
     *   Dirname.
     * @returns {undefined}
     *   Nothing.
     */
    set dirname(dirname2) {
      assertPath2(this.basename, "dirname");
      this.path = minpath.join(dirname2 || "", this.basename);
    }
    /**
     * Get the extname (including dot) (example: `'.js'`).
     *
     * @returns {string | undefined}
     *   Extname.
     */
    get extname() {
      return typeof this.path === "string" ? minpath.extname(this.path) : void 0;
    }
    /**
     * Set the extname (including dot) (example: `'.js'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be set if there’s no `path` yet.
     *
     * @param {string | undefined} extname
     *   Extname.
     * @returns {undefined}
     *   Nothing.
     */
    set extname(extname2) {
      assertPart(extname2, "extname");
      assertPath2(this.dirname, "extname");
      if (extname2) {
        if (extname2.codePointAt(0) !== 46) {
          throw new Error("`extname` must start with `.`");
        }
        if (extname2.includes(".", 1)) {
          throw new Error("`extname` cannot contain multiple dots");
        }
      }
      this.path = minpath.join(this.dirname, this.stem + (extname2 || ""));
    }
    /**
     * Get the full path (example: `'~/index.min.js'`).
     *
     * @returns {string}
     *   Path.
     */
    get path() {
      return this.history[this.history.length - 1];
    }
    /**
     * Set the full path (example: `'~/index.min.js'`).
     *
     * Cannot be nullified.
     * You can set a file URL (a `URL` object with a `file:` protocol) which will
     * be turned into a path with `url.fileURLToPath`.
     *
     * @param {URL | string} path
     *   Path.
     * @returns {undefined}
     *   Nothing.
     */
    set path(path2) {
      if (isUrl(path2)) {
        path2 = urlToPath(path2);
      }
      assertNonEmpty(path2, "path");
      if (this.path !== path2) {
        this.history.push(path2);
      }
    }
    /**
     * Get the stem (basename w/o extname) (example: `'index.min'`).
     *
     * @returns {string | undefined}
     *   Stem.
     */
    get stem() {
      return typeof this.path === "string" ? minpath.basename(this.path, this.extname) : void 0;
    }
    /**
     * Set the stem (basename w/o extname) (example: `'index.min'`).
     *
     * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
     * on windows).
     * Cannot be nullified (use `file.path = file.dirname` instead).
     *
     * @param {string} stem
     *   Stem.
     * @returns {undefined}
     *   Nothing.
     */
    set stem(stem) {
      assertNonEmpty(stem, "stem");
      assertPart(stem, "stem");
      this.path = minpath.join(this.dirname || "", stem + (this.extname || ""));
    }
    // Normal prototypal methods.
    /**
     * Create a fatal message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `true` (error; file not usable)
     * and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {never}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {never}
     *   Never.
     * @throws {VFileMessage}
     *   Message.
     */
    fail(causeOrReason, optionsOrParentOrPlace, origin) {
      const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
      message.fatal = true;
      throw message;
    }
    /**
     * Create an info message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `undefined` (info; change
     * likely not needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    info(causeOrReason, optionsOrParentOrPlace, origin) {
      const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
      message.fatal = void 0;
      return message;
    }
    /**
     * Create a message for `reason` associated with the file.
     *
     * The `fatal` field of the message is set to `false` (warning; change may be
     * needed) and the `file` field is set to the current file path.
     * The message is added to the `messages` field on `file`.
     *
     * > 🪦 **Note**: also has obsolete signatures.
     *
     * @overload
     * @param {string} reason
     * @param {MessageOptions | null | undefined} [options]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {string} reason
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Node | NodeLike | null | undefined} parent
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {Point | Position | null | undefined} place
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @overload
     * @param {Error | VFileMessage} cause
     * @param {string | null | undefined} [origin]
     * @returns {VFileMessage}
     *
     * @param {Error | VFileMessage | string} causeOrReason
     *   Reason for message, should use markdown.
     * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
     *   Configuration (optional).
     * @param {string | null | undefined} [origin]
     *   Place in code where the message originates (example:
     *   `'my-package:my-rule'` or `'my-rule'`).
     * @returns {VFileMessage}
     *   Message.
     */
    message(causeOrReason, optionsOrParentOrPlace, origin) {
      const message = new VFileMessage(
        // @ts-expect-error: the overloads are fine.
        causeOrReason,
        optionsOrParentOrPlace,
        origin
      );
      if (this.path) {
        message.name = this.path + ":" + message.name;
        message.file = this.path;
      }
      message.fatal = false;
      this.messages.push(message);
      return message;
    }
    /**
     * Serialize the file.
     *
     * > **Note**: which encodings are supported depends on the engine.
     * > For info on Node.js, see:
     * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
     *
     * @param {string | null | undefined} [encoding='utf8']
     *   Character encoding to understand `value` as when it’s a `Uint8Array`
     *   (default: `'utf-8'`).
     * @returns {string}
     *   Serialized file.
     */
    toString(encoding) {
      if (this.value === void 0) {
        return "";
      }
      if (typeof this.value === "string") {
        return this.value;
      }
      const decoder = new TextDecoder(encoding || void 0);
      return decoder.decode(this.value);
    }
  };
  function assertPart(part, name2) {
    if (part && part.includes(minpath.sep)) {
      throw new Error(
        "`" + name2 + "` cannot be a path: did not expect `" + minpath.sep + "`"
      );
    }
  }
  function assertNonEmpty(part, name2) {
    if (!part) {
      throw new Error("`" + name2 + "` cannot be empty");
    }
  }
  function assertPath2(path2, name2) {
    if (!path2) {
      throw new Error("Setting `" + name2 + "` requires `path` to be set too");
    }
  }
  function isUint8Array(value) {
    return Boolean(
      value && typeof value === "object" && "byteLength" in value && "byteOffset" in value
    );
  }

  // node_modules/unified/lib/callable-instance.js
  init_define_import_meta_env();
  var CallableInstance = (
    /**
     * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
     */
    /** @type {unknown} */
    /**
     * @this {Function}
     * @param {string | symbol} property
     * @returns {(...parameters: Array<unknown>) => unknown}
     */
    (function(property) {
      const self2 = this;
      const constr = self2.constructor;
      const proto = (
        /** @type {Record<string | symbol, Function>} */
        // Prototypes do exist.
        // type-coverage:ignore-next-line
        constr.prototype
      );
      const value = proto[property];
      const apply = function() {
        return value.apply(apply, arguments);
      };
      Object.setPrototypeOf(apply, proto);
      return apply;
    })
  );

  // node_modules/unified/lib/index.js
  var own4 = {}.hasOwnProperty;
  var Processor = class _Processor extends CallableInstance {
    /**
     * Create a processor.
     */
    constructor() {
      super("copy");
      this.Compiler = void 0;
      this.Parser = void 0;
      this.attachers = [];
      this.compiler = void 0;
      this.freezeIndex = -1;
      this.frozen = void 0;
      this.namespace = {};
      this.parser = void 0;
      this.transformers = trough();
    }
    /**
     * Copy a processor.
     *
     * @deprecated
     *   This is a private internal method and should not be used.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   New *unfrozen* processor ({@linkcode Processor}) that is
     *   configured to work the same as its ancestor.
     *   When the descendant processor is configured in the future it does not
     *   affect the ancestral processor.
     */
    copy() {
      const destination = (
        /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
        new _Processor()
      );
      let index2 = -1;
      while (++index2 < this.attachers.length) {
        const attacher = this.attachers[index2];
        destination.use(...attacher);
      }
      destination.data((0, import_extend.default)(true, {}, this.namespace));
      return destination;
    }
    /**
     * Configure the processor with info available to all plugins.
     * Information is stored in an object.
     *
     * Typically, options can be given to a specific plugin, but sometimes it
     * makes sense to have information shared with several plugins.
     * For example, a list of HTML elements that are self-closing, which is
     * needed during all phases.
     *
     * > **Note**: setting information cannot occur on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * > **Note**: to register custom data in TypeScript, augment the
     * > {@linkcode Data} interface.
     *
     * @example
     *   This example show how to get and set info:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   const processor = unified().data('alpha', 'bravo')
     *
     *   processor.data('alpha') // => 'bravo'
     *
     *   processor.data() // => {alpha: 'bravo'}
     *
     *   processor.data({charlie: 'delta'})
     *
     *   processor.data() // => {charlie: 'delta'}
     *   ```
     *
     * @template {keyof Data} Key
     *
     * @overload
     * @returns {Data}
     *
     * @overload
     * @param {Data} dataset
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Key} key
     * @returns {Data[Key]}
     *
     * @overload
     * @param {Key} key
     * @param {Data[Key]} value
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @param {Data | Key} [key]
     *   Key to get or set, or entire dataset to set, or nothing to get the
     *   entire dataset (optional).
     * @param {Data[Key]} [value]
     *   Value to set (optional).
     * @returns {unknown}
     *   The current processor when setting, the value at `key` when getting, or
     *   the entire dataset when getting without key.
     */
    data(key, value) {
      if (typeof key === "string") {
        if (arguments.length === 2) {
          assertUnfrozen("data", this.frozen);
          this.namespace[key] = value;
          return this;
        }
        return own4.call(this.namespace, key) && this.namespace[key] || void 0;
      }
      if (key) {
        assertUnfrozen("data", this.frozen);
        this.namespace = key;
        return this;
      }
      return this.namespace;
    }
    /**
     * Freeze a processor.
     *
     * Frozen processors are meant to be extended and not to be configured
     * directly.
     *
     * When a processor is frozen it cannot be unfrozen.
     * New processors working the same way can be created by calling the
     * processor.
     *
     * It’s possible to freeze processors explicitly by calling `.freeze()`.
     * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
     * `.stringify()`, `.process()`, or `.processSync()` are called.
     *
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   The current processor.
     */
    freeze() {
      if (this.frozen) {
        return this;
      }
      const self2 = (
        /** @type {Processor} */
        /** @type {unknown} */
        this
      );
      while (++this.freezeIndex < this.attachers.length) {
        const [attacher, ...options] = this.attachers[this.freezeIndex];
        if (options[0] === false) {
          continue;
        }
        if (options[0] === true) {
          options[0] = void 0;
        }
        const transformer = attacher.call(self2, ...options);
        if (typeof transformer === "function") {
          this.transformers.use(transformer);
        }
      }
      this.frozen = true;
      this.freezeIndex = Number.POSITIVE_INFINITY;
      return this;
    }
    /**
     * Parse text to a syntax tree.
     *
     * > **Note**: `parse` freezes the processor if not already *frozen*.
     *
     * > **Note**: `parse` performs the parse phase, not the run phase or other
     * > phases.
     *
     * @param {Compatible | undefined} [file]
     *   file to parse (optional); typically `string` or `VFile`; any value
     *   accepted as `x` in `new VFile(x)`.
     * @returns {ParseTree extends undefined ? Node : ParseTree}
     *   Syntax tree representing `file`.
     */
    parse(file) {
      this.freeze();
      const realFile = vfile(file);
      const parser = this.parser || this.Parser;
      assertParser("parse", parser);
      return parser(String(realFile), realFile);
    }
    /**
     * Process the given file as configured on the processor.
     *
     * > **Note**: `process` freezes the processor if not already *frozen*.
     *
     * > **Note**: `process` performs the parse, run, and stringify phases.
     *
     * @overload
     * @param {Compatible | undefined} file
     * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
     * @returns {undefined}
     *
     * @overload
     * @param {Compatible | undefined} [file]
     * @returns {Promise<VFileWithOutput<CompileResult>>}
     *
     * @param {Compatible | undefined} [file]
     *   File (optional); typically `string` or `VFile`]; any value accepted as
     *   `x` in `new VFile(x)`.
     * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
     *   Callback (optional).
     * @returns {Promise<VFile> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise a promise, rejected with a fatal error or resolved with the
     *   processed file.
     *
     *   The parsed, transformed, and compiled value is available at
     *   `file.value` (see note).
     *
     *   > **Note**: unified typically compiles by serializing: most
     *   > compilers return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@linkcode CompileResultMap}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    process(file, done) {
      const self2 = this;
      this.freeze();
      assertParser("process", this.parser || this.Parser);
      assertCompiler("process", this.compiler || this.Compiler);
      return done ? executor(void 0, done) : new Promise(executor);
      function executor(resolve, reject) {
        const realFile = vfile(file);
        const parseTree = (
          /** @type {HeadTree extends undefined ? Node : HeadTree} */
          /** @type {unknown} */
          self2.parse(realFile)
        );
        self2.run(parseTree, realFile, function(error, tree, file2) {
          if (error || !tree || !file2) {
            return realDone(error);
          }
          const compileTree = (
            /** @type {CompileTree extends undefined ? Node : CompileTree} */
            /** @type {unknown} */
            tree
          );
          const compileResult = self2.stringify(compileTree, file2);
          if (looksLikeAValue(compileResult)) {
            file2.value = compileResult;
          } else {
            file2.result = compileResult;
          }
          realDone(
            error,
            /** @type {VFileWithOutput<CompileResult>} */
            file2
          );
        });
        function realDone(error, file2) {
          if (error || !file2) {
            reject(error);
          } else if (resolve) {
            resolve(file2);
          } else {
            ok(done, "`done` is defined if `resolve` is not");
            done(void 0, file2);
          }
        }
      }
    }
    /**
     * Process the given file as configured on the processor.
     *
     * An error is thrown if asynchronous transforms are configured.
     *
     * > **Note**: `processSync` freezes the processor if not already *frozen*.
     *
     * > **Note**: `processSync` performs the parse, run, and stringify phases.
     *
     * @param {Compatible | undefined} [file]
     *   File (optional); typically `string` or `VFile`; any value accepted as
     *   `x` in `new VFile(x)`.
     * @returns {VFileWithOutput<CompileResult>}
     *   The processed file.
     *
     *   The parsed, transformed, and compiled value is available at
     *   `file.value` (see note).
     *
     *   > **Note**: unified typically compiles by serializing: most
     *   > compilers return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@linkcode CompileResultMap}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    processSync(file) {
      let complete = false;
      let result;
      this.freeze();
      assertParser("processSync", this.parser || this.Parser);
      assertCompiler("processSync", this.compiler || this.Compiler);
      this.process(file, realDone);
      assertDone("processSync", "process", complete);
      ok(result, "we either bailed on an error or have a tree");
      return result;
      function realDone(error, file2) {
        complete = true;
        bail(error);
        result = file2;
      }
    }
    /**
     * Run *transformers* on a syntax tree.
     *
     * > **Note**: `run` freezes the processor if not already *frozen*.
     *
     * > **Note**: `run` performs the run phase, not other phases.
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} file
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
     * @returns {undefined}
     *
     * @overload
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     * @param {Compatible | undefined} [file]
     * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {(
     *   RunCallback<TailTree extends undefined ? Node : TailTree> |
     *   Compatible
     * )} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
     *   Callback (optional).
     * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
     *   Nothing if `done` is given.
     *   Otherwise, a promise rejected with a fatal error or resolved with the
     *   transformed tree.
     */
    run(tree, file, done) {
      assertNode(tree);
      this.freeze();
      const transformers = this.transformers;
      if (!done && typeof file === "function") {
        done = file;
        file = void 0;
      }
      return done ? executor(void 0, done) : new Promise(executor);
      function executor(resolve, reject) {
        ok(
          typeof file !== "function",
          "`file` can\u2019t be a `done` anymore, we checked"
        );
        const realFile = vfile(file);
        transformers.run(tree, realFile, realDone);
        function realDone(error, outputTree, file2) {
          const resultingTree = (
            /** @type {TailTree extends undefined ? Node : TailTree} */
            outputTree || tree
          );
          if (error) {
            reject(error);
          } else if (resolve) {
            resolve(resultingTree);
          } else {
            ok(done, "`done` is defined if `resolve` is not");
            done(void 0, resultingTree, file2);
          }
        }
      }
    }
    /**
     * Run *transformers* on a syntax tree.
     *
     * An error is thrown if asynchronous transforms are configured.
     *
     * > **Note**: `runSync` freezes the processor if not already *frozen*.
     *
     * > **Note**: `runSync` performs the run phase, not other phases.
     *
     * @param {HeadTree extends undefined ? Node : HeadTree} tree
     *   Tree to transform and inspect.
     * @param {Compatible | undefined} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @returns {TailTree extends undefined ? Node : TailTree}
     *   Transformed tree.
     */
    runSync(tree, file) {
      let complete = false;
      let result;
      this.run(tree, file, realDone);
      assertDone("runSync", "run", complete);
      ok(result, "we either bailed on an error or have a tree");
      return result;
      function realDone(error, tree2) {
        bail(error);
        result = tree2;
        complete = true;
      }
    }
    /**
     * Compile a syntax tree.
     *
     * > **Note**: `stringify` freezes the processor if not already *frozen*.
     *
     * > **Note**: `stringify` performs the stringify phase, not the run phase
     * > or other phases.
     *
     * @param {CompileTree extends undefined ? Node : CompileTree} tree
     *   Tree to compile.
     * @param {Compatible | undefined} [file]
     *   File associated with `node` (optional); any value accepted as `x` in
     *   `new VFile(x)`.
     * @returns {CompileResult extends undefined ? Value : CompileResult}
     *   Textual representation of the tree (see note).
     *
     *   > **Note**: unified typically compiles by serializing: most compilers
     *   > return `string` (or `Uint8Array`).
     *   > Some compilers, such as the one configured with
     *   > [`rehype-react`][rehype-react], return other values (in this case, a
     *   > React tree).
     *   > If you’re using a compiler that doesn’t serialize, expect different
     *   > result values.
     *   >
     *   > To register custom results in TypeScript, add them to
     *   > {@linkcode CompileResultMap}.
     *
     *   [rehype-react]: https://github.com/rehypejs/rehype-react
     */
    stringify(tree, file) {
      this.freeze();
      const realFile = vfile(file);
      const compiler2 = this.compiler || this.Compiler;
      assertCompiler("stringify", compiler2);
      assertNode(tree);
      return compiler2(tree, realFile);
    }
    /**
     * Configure the processor to use a plugin, a list of usable values, or a
     * preset.
     *
     * If the processor is already using a plugin, the previous plugin
     * configuration is changed based on the options that are passed in.
     * In other words, the plugin is not added a second time.
     *
     * > **Note**: `use` cannot be called on *frozen* processors.
     * > Call the processor first to create a new unfrozen processor.
     *
     * @example
     *   There are many ways to pass plugins to `.use()`.
     *   This example gives an overview:
     *
     *   ```js
     *   import {unified} from 'unified'
     *
     *   unified()
     *     // Plugin with options:
     *     .use(pluginA, {x: true, y: true})
     *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
     *     .use(pluginA, {y: false, z: true})
     *     // Plugins:
     *     .use([pluginB, pluginC])
     *     // Two plugins, the second with options:
     *     .use([pluginD, [pluginE, {}]])
     *     // Preset with plugins and settings:
     *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
     *     // Settings only:
     *     .use({settings: {position: false}})
     *   ```
     *
     * @template {Array<unknown>} [Parameters=[]]
     * @template {Node | string | undefined} [Input=undefined]
     * @template [Output=Input]
     *
     * @overload
     * @param {Preset | null | undefined} [preset]
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {PluggableList} list
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *
     * @overload
     * @param {Plugin<Parameters, Input, Output>} plugin
     * @param {...(Parameters | [boolean])} parameters
     * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
     *
     * @param {PluggableList | Plugin | Preset | null | undefined} value
     *   Usable value.
     * @param {...unknown} parameters
     *   Parameters, when a plugin is given as a usable value.
     * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
     *   Current processor.
     */
    use(value, ...parameters) {
      const attachers = this.attachers;
      const namespace = this.namespace;
      assertUnfrozen("use", this.frozen);
      if (value === null || value === void 0) {
      } else if (typeof value === "function") {
        addPlugin(value, parameters);
      } else if (typeof value === "object") {
        if (Array.isArray(value)) {
          addList(value);
        } else {
          addPreset(value);
        }
      } else {
        throw new TypeError("Expected usable value, not `" + value + "`");
      }
      return this;
      function add(value2) {
        if (typeof value2 === "function") {
          addPlugin(value2, []);
        } else if (typeof value2 === "object") {
          if (Array.isArray(value2)) {
            const [plugin, ...parameters2] = (
              /** @type {PluginTuple<Array<unknown>>} */
              value2
            );
            addPlugin(plugin, parameters2);
          } else {
            addPreset(value2);
          }
        } else {
          throw new TypeError("Expected usable value, not `" + value2 + "`");
        }
      }
      function addPreset(result) {
        if (!("plugins" in result) && !("settings" in result)) {
          throw new Error(
            "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
          );
        }
        addList(result.plugins);
        if (result.settings) {
          namespace.settings = (0, import_extend.default)(true, namespace.settings, result.settings);
        }
      }
      function addList(plugins) {
        let index2 = -1;
        if (plugins === null || plugins === void 0) {
        } else if (Array.isArray(plugins)) {
          while (++index2 < plugins.length) {
            const thing = plugins[index2];
            add(thing);
          }
        } else {
          throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
        }
      }
      function addPlugin(plugin, parameters2) {
        let index2 = -1;
        let entryIndex = -1;
        while (++index2 < attachers.length) {
          if (attachers[index2][0] === plugin) {
            entryIndex = index2;
            break;
          }
        }
        if (entryIndex === -1) {
          attachers.push([plugin, ...parameters2]);
        } else if (parameters2.length > 0) {
          let [primary, ...rest] = parameters2;
          const currentPrimary = attachers[entryIndex][1];
          if (isPlainObject(currentPrimary) && isPlainObject(primary)) {
            primary = (0, import_extend.default)(true, currentPrimary, primary);
          }
          attachers[entryIndex] = [plugin, primary, ...rest];
        }
      }
    }
  };
  var unified = new Processor().freeze();
  function assertParser(name2, value) {
    if (typeof value !== "function") {
      throw new TypeError("Cannot `" + name2 + "` without `parser`");
    }
  }
  function assertCompiler(name2, value) {
    if (typeof value !== "function") {
      throw new TypeError("Cannot `" + name2 + "` without `compiler`");
    }
  }
  function assertUnfrozen(name2, frozen) {
    if (frozen) {
      throw new Error(
        "Cannot call `" + name2 + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
      );
    }
  }
  function assertNode(node2) {
    if (!isPlainObject(node2) || typeof node2.type !== "string") {
      throw new TypeError("Expected node, got `" + node2 + "`");
    }
  }
  function assertDone(name2, asyncName, complete) {
    if (!complete) {
      throw new Error(
        "`" + name2 + "` finished async. Use `" + asyncName + "` instead"
      );
    }
  }
  function vfile(value) {
    return looksLikeAVFile(value) ? value : new VFile(value);
  }
  function looksLikeAVFile(value) {
    return Boolean(
      value && typeof value === "object" && "message" in value && "messages" in value
    );
  }
  function looksLikeAValue(value) {
    return typeof value === "string" || isUint8Array2(value);
  }
  function isUint8Array2(value) {
    return Boolean(
      value && typeof value === "object" && "byteLength" in value && "byteOffset" in value
    );
  }

  // node_modules/react-markdown/lib/index.js
  var changelog = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md";
  var emptyPlugins = [];
  var emptyRemarkRehypeOptions = { allowDangerousHtml: true };
  var safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;
  var deprecations = [
    { from: "astPlugins", id: "remove-buggy-html-in-markdown-parser" },
    { from: "allowDangerousHtml", id: "remove-buggy-html-in-markdown-parser" },
    {
      from: "allowNode",
      id: "replace-allownode-allowedtypes-and-disallowedtypes",
      to: "allowElement"
    },
    {
      from: "allowedTypes",
      id: "replace-allownode-allowedtypes-and-disallowedtypes",
      to: "allowedElements"
    },
    { from: "className", id: "remove-classname" },
    {
      from: "disallowedTypes",
      id: "replace-allownode-allowedtypes-and-disallowedtypes",
      to: "disallowedElements"
    },
    { from: "escapeHtml", id: "remove-buggy-html-in-markdown-parser" },
    { from: "includeElementIndex", id: "#remove-includeelementindex" },
    {
      from: "includeNodeIndex",
      id: "change-includenodeindex-to-includeelementindex"
    },
    { from: "linkTarget", id: "remove-linktarget" },
    { from: "plugins", id: "change-plugins-to-remarkplugins", to: "remarkPlugins" },
    { from: "rawSourcePos", id: "#remove-rawsourcepos" },
    { from: "renderers", id: "change-renderers-to-components", to: "components" },
    { from: "source", id: "change-source-to-children", to: "children" },
    { from: "sourcePos", id: "#remove-sourcepos" },
    { from: "transformImageUri", id: "#add-urltransform", to: "urlTransform" },
    { from: "transformLinkUri", id: "#add-urltransform", to: "urlTransform" }
  ];
  function Markdown(options) {
    const processor = createProcessor(options);
    const file = createFile(options);
    return post(processor.runSync(processor.parse(file), file), options);
  }
  function createProcessor(options) {
    const rehypePlugins = options.rehypePlugins || emptyPlugins;
    const remarkPlugins = options.remarkPlugins || emptyPlugins;
    const remarkRehypeOptions = options.remarkRehypeOptions ? { ...options.remarkRehypeOptions, ...emptyRemarkRehypeOptions } : emptyRemarkRehypeOptions;
    const processor = unified().use(remarkParse).use(remarkPlugins).use(remarkRehype, remarkRehypeOptions).use(rehypePlugins);
    return processor;
  }
  function createFile(options) {
    const children = options.children || "";
    const file = new VFile();
    if (typeof children === "string") {
      file.value = children;
    } else {
      unreachable(
        "Unexpected value `" + children + "` for `children` prop, expected `string`"
      );
    }
    return file;
  }
  function post(tree, options) {
    const allowedElements = options.allowedElements;
    const allowElement = options.allowElement;
    const components = options.components;
    const disallowedElements = options.disallowedElements;
    const skipHtml = options.skipHtml;
    const unwrapDisallowed = options.unwrapDisallowed;
    const urlTransform = options.urlTransform || defaultUrlTransform;
    for (const deprecation of deprecations) {
      if (Object.hasOwn(options, deprecation.from)) {
        unreachable(
          "Unexpected `" + deprecation.from + "` prop, " + (deprecation.to ? "use `" + deprecation.to + "` instead" : "remove it") + " (see <" + changelog + "#" + deprecation.id + "> for more info)"
        );
      }
    }
    if (allowedElements && disallowedElements) {
      unreachable(
        "Unexpected combined `allowedElements` and `disallowedElements`, expected one or the other"
      );
    }
    visit(tree, transform);
    return toJsxRuntime(tree, {
      Fragment: import_jsx_runtime3.Fragment,
      components,
      ignoreInvalidStyle: true,
      jsx: import_jsx_runtime3.jsx,
      jsxs: import_jsx_runtime3.jsxs,
      passKeys: true,
      passNode: true
    });
    function transform(node2, index2, parent) {
      if (node2.type === "raw" && parent && typeof index2 === "number") {
        if (skipHtml) {
          parent.children.splice(index2, 1);
        } else {
          parent.children[index2] = { type: "text", value: node2.value };
        }
        return index2;
      }
      if (node2.type === "element") {
        let key;
        for (key in urlAttributes) {
          if (Object.hasOwn(urlAttributes, key) && Object.hasOwn(node2.properties, key)) {
            const value = node2.properties[key];
            const test = urlAttributes[key];
            if (test === null || test.includes(node2.tagName)) {
              node2.properties[key] = urlTransform(String(value || ""), key, node2);
            }
          }
        }
      }
      if (node2.type === "element") {
        let remove = allowedElements ? !allowedElements.includes(node2.tagName) : disallowedElements ? disallowedElements.includes(node2.tagName) : false;
        if (!remove && allowElement && typeof index2 === "number") {
          remove = !allowElement(node2, index2, parent);
        }
        if (remove && parent && typeof index2 === "number") {
          if (unwrapDisallowed && node2.children) {
            parent.children.splice(index2, 1, ...node2.children);
          } else {
            parent.children.splice(index2, 1);
          }
          return index2;
        }
      }
    }
  }
  function defaultUrlTransform(value) {
    const colon = value.indexOf(":");
    const questionMark = value.indexOf("?");
    const numberSign = value.indexOf("#");
    const slash = value.indexOf("/");
    if (
      // If there is no protocol, it’s relative.
      colon === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
      slash !== -1 && colon > slash || questionMark !== -1 && colon > questionMark || numberSign !== -1 && colon > numberSign || // It is a protocol, it should be allowed.
      safeProtocol.test(value.slice(0, colon))
    ) {
      return value;
    }
    return "";
  }

  // node_modules/remark-gfm/index.js
  init_define_import_meta_env();

  // node_modules/remark-gfm/lib/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm/lib/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm-autolink-literal/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm-autolink-literal/lib/index.js
  init_define_import_meta_env();

  // node_modules/ccount/index.js
  init_define_import_meta_env();
  function ccount(value, character) {
    const source = String(value);
    if (typeof character !== "string") {
      throw new TypeError("Expected character");
    }
    let count = 0;
    let index2 = source.indexOf(character);
    while (index2 !== -1) {
      count++;
      index2 = source.indexOf(character, index2 + character.length);
    }
    return count;
  }

  // node_modules/mdast-util-find-and-replace/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-find-and-replace/lib/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-find-and-replace/node_modules/escape-string-regexp/index.js
  init_define_import_meta_env();
  function escapeStringRegexp(string3) {
    if (typeof string3 !== "string") {
      throw new TypeError("Expected a string");
    }
    return string3.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
  }

  // node_modules/mdast-util-find-and-replace/lib/index.js
  function findAndReplace(tree, list4, options) {
    const settings = options || {};
    const ignored = convert(settings.ignore || []);
    const pairs = toPairs(list4);
    let pairIndex = -1;
    while (++pairIndex < pairs.length) {
      visitParents(tree, "text", visitor);
    }
    function visitor(node2, parents) {
      let index2 = -1;
      let grandparent;
      while (++index2 < parents.length) {
        const parent = parents[index2];
        const siblings = grandparent ? grandparent.children : void 0;
        if (ignored(
          parent,
          siblings ? siblings.indexOf(parent) : void 0,
          grandparent
        )) {
          return;
        }
        grandparent = parent;
      }
      if (grandparent) {
        return handler(node2, parents);
      }
    }
    function handler(node2, parents) {
      const parent = parents[parents.length - 1];
      const find2 = pairs[pairIndex][0];
      const replace2 = pairs[pairIndex][1];
      let start2 = 0;
      const siblings = parent.children;
      const index2 = siblings.indexOf(node2);
      let change = false;
      let nodes = [];
      find2.lastIndex = 0;
      let match = find2.exec(node2.value);
      while (match) {
        const position3 = match.index;
        const matchObject = {
          index: match.index,
          input: match.input,
          stack: [...parents, node2]
        };
        let value = replace2(...match, matchObject);
        if (typeof value === "string") {
          value = value.length > 0 ? { type: "text", value } : void 0;
        }
        if (value === false) {
          find2.lastIndex = position3 + 1;
        } else {
          if (start2 !== position3) {
            nodes.push({
              type: "text",
              value: node2.value.slice(start2, position3)
            });
          }
          if (Array.isArray(value)) {
            nodes.push(...value);
          } else if (value) {
            nodes.push(value);
          }
          start2 = position3 + match[0].length;
          change = true;
        }
        if (!find2.global) {
          break;
        }
        match = find2.exec(node2.value);
      }
      if (change) {
        if (start2 < node2.value.length) {
          nodes.push({ type: "text", value: node2.value.slice(start2) });
        }
        parent.children.splice(index2, 1, ...nodes);
      } else {
        nodes = [node2];
      }
      return index2 + nodes.length;
    }
  }
  function toPairs(tupleOrList) {
    const result = [];
    if (!Array.isArray(tupleOrList)) {
      throw new TypeError("Expected find and replace tuple or list of tuples");
    }
    const list4 = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
    let index2 = -1;
    while (++index2 < list4.length) {
      const tuple = list4[index2];
      result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
    }
    return result;
  }
  function toExpression(find2) {
    return typeof find2 === "string" ? new RegExp(escapeStringRegexp(find2), "g") : find2;
  }
  function toFunction(replace2) {
    return typeof replace2 === "function" ? replace2 : function() {
      return replace2;
    };
  }

  // node_modules/mdast-util-gfm-autolink-literal/lib/index.js
  var inConstruct = "phrasing";
  var notInConstruct = ["autolink", "link", "image", "label"];
  function gfmAutolinkLiteralFromMarkdown() {
    return {
      transforms: [transformGfmAutolinkLiterals],
      enter: {
        literalAutolink: enterLiteralAutolink,
        literalAutolinkEmail: enterLiteralAutolinkValue,
        literalAutolinkHttp: enterLiteralAutolinkValue,
        literalAutolinkWww: enterLiteralAutolinkValue
      },
      exit: {
        literalAutolink: exitLiteralAutolink,
        literalAutolinkEmail: exitLiteralAutolinkEmail,
        literalAutolinkHttp: exitLiteralAutolinkHttp,
        literalAutolinkWww: exitLiteralAutolinkWww
      }
    };
  }
  function gfmAutolinkLiteralToMarkdown() {
    return {
      unsafe: [
        {
          character: "@",
          before: "[+\\-.\\w]",
          after: "[\\-.\\w]",
          inConstruct,
          notInConstruct
        },
        {
          character: ".",
          before: "[Ww]",
          after: "[\\-.\\w]",
          inConstruct,
          notInConstruct
        },
        {
          character: ":",
          before: "[ps]",
          after: "\\/",
          inConstruct,
          notInConstruct
        }
      ]
    };
  }
  function enterLiteralAutolink(token) {
    this.enter({ type: "link", title: null, url: "", children: [] }, token);
  }
  function enterLiteralAutolinkValue(token) {
    this.config.enter.autolinkProtocol.call(this, token);
  }
  function exitLiteralAutolinkHttp(token) {
    this.config.exit.autolinkProtocol.call(this, token);
  }
  function exitLiteralAutolinkWww(token) {
    this.config.exit.data.call(this, token);
    const node2 = this.stack[this.stack.length - 1];
    ok(node2.type === "link");
    node2.url = "http://" + this.sliceSerialize(token);
  }
  function exitLiteralAutolinkEmail(token) {
    this.config.exit.autolinkEmail.call(this, token);
  }
  function exitLiteralAutolink(token) {
    this.exit(token);
  }
  function transformGfmAutolinkLiterals(tree) {
    findAndReplace(
      tree,
      [
        [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl],
        [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]
      ],
      { ignore: ["link", "linkReference"] }
    );
  }
  function findUrl(_, protocol, domain2, path2, match) {
    let prefix = "";
    if (!previous2(match)) {
      return false;
    }
    if (/^w/i.test(protocol)) {
      domain2 = protocol + domain2;
      protocol = "";
      prefix = "http://";
    }
    if (!isCorrectDomain(domain2)) {
      return false;
    }
    const parts = splitUrl(domain2 + path2);
    if (!parts[0]) return false;
    const result = {
      type: "link",
      title: null,
      url: prefix + protocol + parts[0],
      children: [{ type: "text", value: protocol + parts[0] }]
    };
    if (parts[1]) {
      return [result, { type: "text", value: parts[1] }];
    }
    return result;
  }
  function findEmail(_, atext, label, match) {
    if (
      // Not an expected previous character.
      !previous2(match, true) || // Label ends in not allowed character.
      /[-\d_]$/.test(label)
    ) {
      return false;
    }
    return {
      type: "link",
      title: null,
      url: "mailto:" + atext + "@" + label,
      children: [{ type: "text", value: atext + "@" + label }]
    };
  }
  function isCorrectDomain(domain2) {
    const parts = domain2.split(".");
    if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) {
      return false;
    }
    return true;
  }
  function splitUrl(url) {
    const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
    if (!trailExec) {
      return [url, void 0];
    }
    url = url.slice(0, trailExec.index);
    let trail2 = trailExec[0];
    let closingParenIndex = trail2.indexOf(")");
    const openingParens = ccount(url, "(");
    let closingParens = ccount(url, ")");
    while (closingParenIndex !== -1 && openingParens > closingParens) {
      url += trail2.slice(0, closingParenIndex + 1);
      trail2 = trail2.slice(closingParenIndex + 1);
      closingParenIndex = trail2.indexOf(")");
      closingParens++;
    }
    return [url, trail2];
  }
  function previous2(match, email) {
    const code4 = match.input.charCodeAt(match.index - 1);
    return (match.index === 0 || unicodeWhitespace(code4) || unicodePunctuation(code4)) && // If it’s an email, the previous character should not be a slash.
    (!email || code4 !== 47);
  }

  // node_modules/mdast-util-gfm-footnote/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm-footnote/lib/index.js
  init_define_import_meta_env();
  footnoteReference2.peek = footnoteReferencePeek;
  function enterFootnoteCallString() {
    this.buffer();
  }
  function enterFootnoteCall(token) {
    this.enter({ type: "footnoteReference", identifier: "", label: "" }, token);
  }
  function enterFootnoteDefinitionLabelString() {
    this.buffer();
  }
  function enterFootnoteDefinition(token) {
    this.enter(
      { type: "footnoteDefinition", identifier: "", label: "", children: [] },
      token
    );
  }
  function exitFootnoteCallString(token) {
    const label = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    ok(node2.type === "footnoteReference");
    node2.identifier = normalizeIdentifier(
      this.sliceSerialize(token)
    ).toLowerCase();
    node2.label = label;
  }
  function exitFootnoteCall(token) {
    this.exit(token);
  }
  function exitFootnoteDefinitionLabelString(token) {
    const label = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    ok(node2.type === "footnoteDefinition");
    node2.identifier = normalizeIdentifier(
      this.sliceSerialize(token)
    ).toLowerCase();
    node2.label = label;
  }
  function exitFootnoteDefinition(token) {
    this.exit(token);
  }
  function footnoteReferencePeek() {
    return "[";
  }
  function footnoteReference2(node2, _, state, info) {
    const tracker = state.createTracker(info);
    let value = tracker.move("[^");
    const exit3 = state.enter("footnoteReference");
    const subexit = state.enter("reference");
    value += tracker.move(
      state.safe(state.associationId(node2), { after: "]", before: value })
    );
    subexit();
    exit3();
    value += tracker.move("]");
    return value;
  }
  function gfmFootnoteFromMarkdown() {
    return {
      enter: {
        gfmFootnoteCallString: enterFootnoteCallString,
        gfmFootnoteCall: enterFootnoteCall,
        gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
        gfmFootnoteDefinition: enterFootnoteDefinition
      },
      exit: {
        gfmFootnoteCallString: exitFootnoteCallString,
        gfmFootnoteCall: exitFootnoteCall,
        gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
        gfmFootnoteDefinition: exitFootnoteDefinition
      }
    };
  }
  function gfmFootnoteToMarkdown(options) {
    let firstLineBlank = false;
    if (options && options.firstLineBlank) {
      firstLineBlank = true;
    }
    return {
      handlers: { footnoteDefinition, footnoteReference: footnoteReference2 },
      // This is on by default already.
      unsafe: [{ character: "[", inConstruct: ["label", "phrasing", "reference"] }]
    };
    function footnoteDefinition(node2, _, state, info) {
      const tracker = state.createTracker(info);
      let value = tracker.move("[^");
      const exit3 = state.enter("footnoteDefinition");
      const subexit = state.enter("label");
      value += tracker.move(
        state.safe(state.associationId(node2), { before: value, after: "]" })
      );
      subexit();
      value += tracker.move("]:");
      if (node2.children && node2.children.length > 0) {
        tracker.shift(4);
        value += tracker.move(
          (firstLineBlank ? "\n" : " ") + state.indentLines(
            state.containerFlow(node2, tracker.current()),
            firstLineBlank ? mapAll : mapExceptFirst
          )
        );
      }
      exit3();
      return value;
    }
  }
  function mapExceptFirst(line, index2, blank) {
    return index2 === 0 ? line : mapAll(line, index2, blank);
  }
  function mapAll(line, index2, blank) {
    return (blank ? "" : "    ") + line;
  }

  // node_modules/mdast-util-gfm-strikethrough/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm-strikethrough/lib/index.js
  init_define_import_meta_env();
  var constructsWithoutStrikethrough = [
    "autolink",
    "destinationLiteral",
    "destinationRaw",
    "reference",
    "titleQuote",
    "titleApostrophe"
  ];
  handleDelete.peek = peekDelete;
  function gfmStrikethroughFromMarkdown() {
    return {
      canContainEols: ["delete"],
      enter: { strikethrough: enterStrikethrough },
      exit: { strikethrough: exitStrikethrough }
    };
  }
  function gfmStrikethroughToMarkdown() {
    return {
      unsafe: [
        {
          character: "~",
          inConstruct: "phrasing",
          notInConstruct: constructsWithoutStrikethrough
        }
      ],
      handlers: { delete: handleDelete }
    };
  }
  function enterStrikethrough(token) {
    this.enter({ type: "delete", children: [] }, token);
  }
  function exitStrikethrough(token) {
    this.exit(token);
  }
  function handleDelete(node2, _, state, info) {
    const tracker = state.createTracker(info);
    const exit3 = state.enter("strikethrough");
    let value = tracker.move("~~");
    value += state.containerPhrasing(node2, {
      ...tracker.current(),
      before: value,
      after: "~"
    });
    value += tracker.move("~~");
    exit3();
    return value;
  }
  function peekDelete() {
    return "~";
  }

  // node_modules/mdast-util-gfm-table/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm-table/lib/index.js
  init_define_import_meta_env();

  // node_modules/markdown-table/index.js
  init_define_import_meta_env();
  function defaultStringLength(value) {
    return value.length;
  }
  function markdownTable(table2, options) {
    const settings = options || {};
    const align = (settings.align || []).concat();
    const stringLength = settings.stringLength || defaultStringLength;
    const alignments = [];
    const cellMatrix = [];
    const sizeMatrix = [];
    const longestCellByColumn = [];
    let mostCellsPerRow = 0;
    let rowIndex = -1;
    while (++rowIndex < table2.length) {
      const row2 = [];
      const sizes2 = [];
      let columnIndex2 = -1;
      if (table2[rowIndex].length > mostCellsPerRow) {
        mostCellsPerRow = table2[rowIndex].length;
      }
      while (++columnIndex2 < table2[rowIndex].length) {
        const cell = serialize2(table2[rowIndex][columnIndex2]);
        if (settings.alignDelimiters !== false) {
          const size = stringLength(cell);
          sizes2[columnIndex2] = size;
          if (longestCellByColumn[columnIndex2] === void 0 || size > longestCellByColumn[columnIndex2]) {
            longestCellByColumn[columnIndex2] = size;
          }
        }
        row2.push(cell);
      }
      cellMatrix[rowIndex] = row2;
      sizeMatrix[rowIndex] = sizes2;
    }
    let columnIndex = -1;
    if (typeof align === "object" && "length" in align) {
      while (++columnIndex < mostCellsPerRow) {
        alignments[columnIndex] = toAlignment(align[columnIndex]);
      }
    } else {
      const code4 = toAlignment(align);
      while (++columnIndex < mostCellsPerRow) {
        alignments[columnIndex] = code4;
      }
    }
    columnIndex = -1;
    const row = [];
    const sizes = [];
    while (++columnIndex < mostCellsPerRow) {
      const code4 = alignments[columnIndex];
      let before = "";
      let after = "";
      if (code4 === 99) {
        before = ":";
        after = ":";
      } else if (code4 === 108) {
        before = ":";
      } else if (code4 === 114) {
        after = ":";
      }
      let size = settings.alignDelimiters === false ? 1 : Math.max(
        1,
        longestCellByColumn[columnIndex] - before.length - after.length
      );
      const cell = before + "-".repeat(size) + after;
      if (settings.alignDelimiters !== false) {
        size = before.length + size + after.length;
        if (size > longestCellByColumn[columnIndex]) {
          longestCellByColumn[columnIndex] = size;
        }
        sizes[columnIndex] = size;
      }
      row[columnIndex] = cell;
    }
    cellMatrix.splice(1, 0, row);
    sizeMatrix.splice(1, 0, sizes);
    rowIndex = -1;
    const lines = [];
    while (++rowIndex < cellMatrix.length) {
      const row2 = cellMatrix[rowIndex];
      const sizes2 = sizeMatrix[rowIndex];
      columnIndex = -1;
      const line = [];
      while (++columnIndex < mostCellsPerRow) {
        const cell = row2[columnIndex] || "";
        let before = "";
        let after = "";
        if (settings.alignDelimiters !== false) {
          const size = longestCellByColumn[columnIndex] - (sizes2[columnIndex] || 0);
          const code4 = alignments[columnIndex];
          if (code4 === 114) {
            before = " ".repeat(size);
          } else if (code4 === 99) {
            if (size % 2) {
              before = " ".repeat(size / 2 + 0.5);
              after = " ".repeat(size / 2 - 0.5);
            } else {
              before = " ".repeat(size / 2);
              after = before;
            }
          } else {
            after = " ".repeat(size);
          }
        }
        if (settings.delimiterStart !== false && !columnIndex) {
          line.push("|");
        }
        if (settings.padding !== false && // Don’t add the opening space if we’re not aligning and the cell is
        // empty: there will be a closing space.
        !(settings.alignDelimiters === false && cell === "") && (settings.delimiterStart !== false || columnIndex)) {
          line.push(" ");
        }
        if (settings.alignDelimiters !== false) {
          line.push(before);
        }
        line.push(cell);
        if (settings.alignDelimiters !== false) {
          line.push(after);
        }
        if (settings.padding !== false) {
          line.push(" ");
        }
        if (settings.delimiterEnd !== false || columnIndex !== mostCellsPerRow - 1) {
          line.push("|");
        }
      }
      lines.push(
        settings.delimiterEnd === false ? line.join("").replace(/ +$/, "") : line.join("")
      );
    }
    return lines.join("\n");
  }
  function serialize2(value) {
    return value === null || value === void 0 ? "" : String(value);
  }
  function toAlignment(value) {
    const code4 = typeof value === "string" ? value.codePointAt(0) : 0;
    return code4 === 67 || code4 === 99 ? 99 : code4 === 76 || code4 === 108 ? 108 : code4 === 82 || code4 === 114 ? 114 : 0;
  }

  // node_modules/mdast-util-to-markdown/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/handle/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/handle/blockquote.js
  init_define_import_meta_env();
  function blockquote2(node2, _, state, info) {
    const exit3 = state.enter("blockquote");
    const tracker = state.createTracker(info);
    tracker.move("> ");
    tracker.shift(2);
    const value = state.indentLines(
      state.containerFlow(node2, tracker.current()),
      map
    );
    exit3();
    return value;
  }
  function map(line, _, blank) {
    return ">" + (blank ? "" : " ") + line;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/break.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js
  init_define_import_meta_env();
  function patternInScope(stack, pattern) {
    return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct, false);
  }
  function listInScope(stack, list4, none) {
    if (typeof list4 === "string") {
      list4 = [list4];
    }
    if (!list4 || list4.length === 0) {
      return none;
    }
    let index2 = -1;
    while (++index2 < list4.length) {
      if (stack.includes(list4[index2])) {
        return true;
      }
    }
    return false;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/break.js
  function hardBreak2(_, _1, state, info) {
    let index2 = -1;
    while (++index2 < state.unsafe.length) {
      if (state.unsafe[index2].character === "\n" && patternInScope(state.stack, state.unsafe[index2])) {
        return /[ \t]/.test(info.before) ? "" : " ";
      }
    }
    return "\\\n";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/code.js
  init_define_import_meta_env();

  // node_modules/longest-streak/index.js
  init_define_import_meta_env();
  function longestStreak(value, substring) {
    const source = String(value);
    let index2 = source.indexOf(substring);
    let expected = index2;
    let count = 0;
    let max = 0;
    if (typeof substring !== "string") {
      throw new TypeError("Expected substring");
    }
    while (index2 !== -1) {
      if (index2 === expected) {
        if (++count > max) {
          max = count;
        }
      } else {
        count = 1;
      }
      expected = index2 + substring.length;
      index2 = source.indexOf(substring, expected);
    }
    return max;
  }

  // node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js
  init_define_import_meta_env();
  function formatCodeAsIndented(node2, state) {
    return Boolean(
      state.options.fences === false && node2.value && // If there’s no info…
      !node2.lang && // And there’s a non-whitespace character…
      /[^ \r\n]/.test(node2.value) && // And the value doesn’t start or end in a blank…
      !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(node2.value)
    );
  }

  // node_modules/mdast-util-to-markdown/lib/util/check-fence.js
  init_define_import_meta_env();
  function checkFence(state) {
    const marker = state.options.fence || "`";
    if (marker !== "`" && marker !== "~") {
      throw new Error(
        "Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`"
      );
    }
    return marker;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/code.js
  function code2(node2, _, state, info) {
    const marker = checkFence(state);
    const raw = node2.value || "";
    const suffix = marker === "`" ? "GraveAccent" : "Tilde";
    if (formatCodeAsIndented(node2, state)) {
      const exit4 = state.enter("codeIndented");
      const value2 = state.indentLines(raw, map2);
      exit4();
      return value2;
    }
    const tracker = state.createTracker(info);
    const sequence = marker.repeat(Math.max(longestStreak(raw, marker) + 1, 3));
    const exit3 = state.enter("codeFenced");
    let value = tracker.move(sequence);
    if (node2.lang) {
      const subexit = state.enter(`codeFencedLang${suffix}`);
      value += tracker.move(
        state.safe(node2.lang, {
          before: value,
          after: " ",
          encode: ["`"],
          ...tracker.current()
        })
      );
      subexit();
    }
    if (node2.lang && node2.meta) {
      const subexit = state.enter(`codeFencedMeta${suffix}`);
      value += tracker.move(" ");
      value += tracker.move(
        state.safe(node2.meta, {
          before: value,
          after: "\n",
          encode: ["`"],
          ...tracker.current()
        })
      );
      subexit();
    }
    value += tracker.move("\n");
    if (raw) {
      value += tracker.move(raw + "\n");
    }
    value += tracker.move(sequence);
    exit3();
    return value;
  }
  function map2(line, _, blank) {
    return (blank ? "" : "    ") + line;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/definition.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/check-quote.js
  init_define_import_meta_env();
  function checkQuote(state) {
    const marker = state.options.quote || '"';
    if (marker !== '"' && marker !== "'") {
      throw new Error(
        "Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`"
      );
    }
    return marker;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/definition.js
  function definition2(node2, _, state, info) {
    const quote = checkQuote(state);
    const suffix = quote === '"' ? "Quote" : "Apostrophe";
    const exit3 = state.enter("definition");
    let subexit = state.enter("label");
    const tracker = state.createTracker(info);
    let value = tracker.move("[");
    value += tracker.move(
      state.safe(state.associationId(node2), {
        before: value,
        after: "]",
        ...tracker.current()
      })
    );
    value += tracker.move("]: ");
    subexit();
    if (
      // If there’s no url, or…
      !node2.url || // If there are control characters or whitespace.
      /[\0- \u007F]/.test(node2.url)
    ) {
      subexit = state.enter("destinationLiteral");
      value += tracker.move("<");
      value += tracker.move(
        state.safe(node2.url, { before: value, after: ">", ...tracker.current() })
      );
      value += tracker.move(">");
    } else {
      subexit = state.enter("destinationRaw");
      value += tracker.move(
        state.safe(node2.url, {
          before: value,
          after: node2.title ? " " : "\n",
          ...tracker.current()
        })
      );
    }
    subexit();
    if (node2.title) {
      subexit = state.enter(`title${suffix}`);
      value += tracker.move(" " + quote);
      value += tracker.move(
        state.safe(node2.title, {
          before: value,
          after: quote,
          ...tracker.current()
        })
      );
      value += tracker.move(quote);
      subexit();
    }
    exit3();
    return value;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/emphasis.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js
  init_define_import_meta_env();
  function checkEmphasis(state) {
    const marker = state.options.emphasis || "*";
    if (marker !== "*" && marker !== "_") {
      throw new Error(
        "Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`"
      );
    }
    return marker;
  }

  // node_modules/mdast-util-to-markdown/lib/util/encode-character-reference.js
  init_define_import_meta_env();
  function encodeCharacterReference(code4) {
    return "&#x" + code4.toString(16).toUpperCase() + ";";
  }

  // node_modules/mdast-util-to-markdown/lib/util/encode-info.js
  init_define_import_meta_env();
  function encodeInfo(outside, inside, marker) {
    const outsideKind = classifyCharacter(outside);
    const insideKind = classifyCharacter(inside);
    if (outsideKind === void 0) {
      return insideKind === void 0 ? (
        // Letter inside:
        // we have to encode *both* letters for `_` as it is looser.
        // it already forms for `*` (and GFMs `~`).
        marker === "_" ? { inside: true, outside: true } : { inside: false, outside: false }
      ) : insideKind === 1 ? (
        // Whitespace inside: encode both (letter, whitespace).
        { inside: true, outside: true }
      ) : (
        // Punctuation inside: encode outer (letter)
        { inside: false, outside: true }
      );
    }
    if (outsideKind === 1) {
      return insideKind === void 0 ? (
        // Letter inside: already forms.
        { inside: false, outside: false }
      ) : insideKind === 1 ? (
        // Whitespace inside: encode both (whitespace).
        { inside: true, outside: true }
      ) : (
        // Punctuation inside: already forms.
        { inside: false, outside: false }
      );
    }
    return insideKind === void 0 ? (
      // Letter inside: already forms.
      { inside: false, outside: false }
    ) : insideKind === 1 ? (
      // Whitespace inside: encode inner (whitespace).
      { inside: true, outside: false }
    ) : (
      // Punctuation inside: already forms.
      { inside: false, outside: false }
    );
  }

  // node_modules/mdast-util-to-markdown/lib/handle/emphasis.js
  emphasis2.peek = emphasisPeek;
  function emphasis2(node2, _, state, info) {
    const marker = checkEmphasis(state);
    const exit3 = state.enter("emphasis");
    const tracker = state.createTracker(info);
    const before = tracker.move(marker);
    let between = tracker.move(
      state.containerPhrasing(node2, {
        after: marker,
        before,
        ...tracker.current()
      })
    );
    const betweenHead = between.charCodeAt(0);
    const open = encodeInfo(
      info.before.charCodeAt(info.before.length - 1),
      betweenHead,
      marker
    );
    if (open.inside) {
      between = encodeCharacterReference(betweenHead) + between.slice(1);
    }
    const betweenTail = between.charCodeAt(between.length - 1);
    const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
    if (close.inside) {
      between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
    }
    const after = tracker.move(marker);
    exit3();
    state.attentionEncodeSurroundingInfo = {
      after: close.outside,
      before: open.outside
    };
    return before + between + after;
  }
  function emphasisPeek(_, _1, state) {
    return state.options.emphasis || "*";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/heading.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js
  init_define_import_meta_env();
  function formatHeadingAsSetext(node2, state) {
    let literalWithBreak = false;
    visit(node2, function(node3) {
      if ("value" in node3 && /\r?\n|\r/.test(node3.value) || node3.type === "break") {
        literalWithBreak = true;
        return EXIT;
      }
    });
    return Boolean(
      (!node2.depth || node2.depth < 3) && toString(node2) && (state.options.setext || literalWithBreak)
    );
  }

  // node_modules/mdast-util-to-markdown/lib/handle/heading.js
  function heading2(node2, _, state, info) {
    const rank = Math.max(Math.min(6, node2.depth || 1), 1);
    const tracker = state.createTracker(info);
    if (formatHeadingAsSetext(node2, state)) {
      const exit4 = state.enter("headingSetext");
      const subexit2 = state.enter("phrasing");
      const value2 = state.containerPhrasing(node2, {
        ...tracker.current(),
        before: "\n",
        after: "\n"
      });
      subexit2();
      exit4();
      return value2 + "\n" + (rank === 1 ? "=" : "-").repeat(
        // The whole size…
        value2.length - // Minus the position of the character after the last EOL (or
        // 0 if there is none)…
        (Math.max(value2.lastIndexOf("\r"), value2.lastIndexOf("\n")) + 1)
      );
    }
    const sequence = "#".repeat(rank);
    const exit3 = state.enter("headingAtx");
    const subexit = state.enter("phrasing");
    tracker.move(sequence + " ");
    let value = state.containerPhrasing(node2, {
      before: "# ",
      after: "\n",
      ...tracker.current()
    });
    if (/^[\t ]/.test(value)) {
      value = encodeCharacterReference(value.charCodeAt(0)) + value.slice(1);
    }
    value = value ? sequence + " " + value : sequence;
    if (state.options.closeAtx) {
      value += " " + sequence;
    }
    subexit();
    exit3();
    return value;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/html.js
  init_define_import_meta_env();
  html4.peek = htmlPeek;
  function html4(node2) {
    return node2.value || "";
  }
  function htmlPeek() {
    return "<";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/image.js
  init_define_import_meta_env();
  image2.peek = imagePeek;
  function image2(node2, _, state, info) {
    const quote = checkQuote(state);
    const suffix = quote === '"' ? "Quote" : "Apostrophe";
    const exit3 = state.enter("image");
    let subexit = state.enter("label");
    const tracker = state.createTracker(info);
    let value = tracker.move("![");
    value += tracker.move(
      state.safe(node2.alt, { before: value, after: "]", ...tracker.current() })
    );
    value += tracker.move("](");
    subexit();
    if (
      // If there’s no url but there is a title…
      !node2.url && node2.title || // If there are control characters or whitespace.
      /[\0- \u007F]/.test(node2.url)
    ) {
      subexit = state.enter("destinationLiteral");
      value += tracker.move("<");
      value += tracker.move(
        state.safe(node2.url, { before: value, after: ">", ...tracker.current() })
      );
      value += tracker.move(">");
    } else {
      subexit = state.enter("destinationRaw");
      value += tracker.move(
        state.safe(node2.url, {
          before: value,
          after: node2.title ? " " : ")",
          ...tracker.current()
        })
      );
    }
    subexit();
    if (node2.title) {
      subexit = state.enter(`title${suffix}`);
      value += tracker.move(" " + quote);
      value += tracker.move(
        state.safe(node2.title, {
          before: value,
          after: quote,
          ...tracker.current()
        })
      );
      value += tracker.move(quote);
      subexit();
    }
    value += tracker.move(")");
    exit3();
    return value;
  }
  function imagePeek() {
    return "!";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/image-reference.js
  init_define_import_meta_env();
  imageReference2.peek = imageReferencePeek;
  function imageReference2(node2, _, state, info) {
    const type = node2.referenceType;
    const exit3 = state.enter("imageReference");
    let subexit = state.enter("label");
    const tracker = state.createTracker(info);
    let value = tracker.move("![");
    const alt = state.safe(node2.alt, {
      before: value,
      after: "]",
      ...tracker.current()
    });
    value += tracker.move(alt + "][");
    subexit();
    const stack = state.stack;
    state.stack = [];
    subexit = state.enter("reference");
    const reference = state.safe(state.associationId(node2), {
      before: value,
      after: "]",
      ...tracker.current()
    });
    subexit();
    state.stack = stack;
    exit3();
    if (type === "full" || !alt || alt !== reference) {
      value += tracker.move(reference + "]");
    } else if (type === "shortcut") {
      value = value.slice(0, -1);
    } else {
      value += tracker.move("]");
    }
    return value;
  }
  function imageReferencePeek() {
    return "!";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/inline-code.js
  init_define_import_meta_env();
  inlineCode2.peek = inlineCodePeek;
  function inlineCode2(node2, _, state) {
    let value = node2.value || "";
    let sequence = "`";
    let index2 = -1;
    while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) {
      sequence += "`";
    }
    if (/[^ \r\n]/.test(value) && (/^[ \r\n]/.test(value) && /[ \r\n]$/.test(value) || /^`|`$/.test(value))) {
      value = " " + value + " ";
    }
    while (++index2 < state.unsafe.length) {
      const pattern = state.unsafe[index2];
      const expression = state.compilePattern(pattern);
      let match;
      if (!pattern.atBreak) continue;
      while (match = expression.exec(value)) {
        let position3 = match.index;
        if (value.charCodeAt(position3) === 10 && value.charCodeAt(position3 - 1) === 13) {
          position3--;
        }
        value = value.slice(0, position3) + " " + value.slice(match.index + 1);
      }
    }
    return sequence + value + sequence;
  }
  function inlineCodePeek() {
    return "`";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/link.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js
  init_define_import_meta_env();
  function formatLinkAsAutolink(node2, state) {
    const raw = toString(node2);
    return Boolean(
      !state.options.resourceLink && // If there’s a url…
      node2.url && // And there’s a no title…
      !node2.title && // And the content of `node` is a single text node…
      node2.children && node2.children.length === 1 && node2.children[0].type === "text" && // And if the url is the same as the content…
      (raw === node2.url || "mailto:" + raw === node2.url) && // And that starts w/ a protocol…
      /^[a-z][a-z+.-]+:/i.test(node2.url) && // And that doesn’t contain ASCII control codes (character escapes and
      // references don’t work), space, or angle brackets…
      !/[\0- <>\u007F]/.test(node2.url)
    );
  }

  // node_modules/mdast-util-to-markdown/lib/handle/link.js
  link2.peek = linkPeek;
  function link2(node2, _, state, info) {
    const quote = checkQuote(state);
    const suffix = quote === '"' ? "Quote" : "Apostrophe";
    const tracker = state.createTracker(info);
    let exit3;
    let subexit;
    if (formatLinkAsAutolink(node2, state)) {
      const stack = state.stack;
      state.stack = [];
      exit3 = state.enter("autolink");
      let value2 = tracker.move("<");
      value2 += tracker.move(
        state.containerPhrasing(node2, {
          before: value2,
          after: ">",
          ...tracker.current()
        })
      );
      value2 += tracker.move(">");
      exit3();
      state.stack = stack;
      return value2;
    }
    exit3 = state.enter("link");
    subexit = state.enter("label");
    let value = tracker.move("[");
    value += tracker.move(
      state.containerPhrasing(node2, {
        before: value,
        after: "](",
        ...tracker.current()
      })
    );
    value += tracker.move("](");
    subexit();
    if (
      // If there’s no url but there is a title…
      !node2.url && node2.title || // If there are control characters or whitespace.
      /[\0- \u007F]/.test(node2.url)
    ) {
      subexit = state.enter("destinationLiteral");
      value += tracker.move("<");
      value += tracker.move(
        state.safe(node2.url, { before: value, after: ">", ...tracker.current() })
      );
      value += tracker.move(">");
    } else {
      subexit = state.enter("destinationRaw");
      value += tracker.move(
        state.safe(node2.url, {
          before: value,
          after: node2.title ? " " : ")",
          ...tracker.current()
        })
      );
    }
    subexit();
    if (node2.title) {
      subexit = state.enter(`title${suffix}`);
      value += tracker.move(" " + quote);
      value += tracker.move(
        state.safe(node2.title, {
          before: value,
          after: quote,
          ...tracker.current()
        })
      );
      value += tracker.move(quote);
      subexit();
    }
    value += tracker.move(")");
    exit3();
    return value;
  }
  function linkPeek(node2, _, state) {
    return formatLinkAsAutolink(node2, state) ? "<" : "[";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/link-reference.js
  init_define_import_meta_env();
  linkReference2.peek = linkReferencePeek;
  function linkReference2(node2, _, state, info) {
    const type = node2.referenceType;
    const exit3 = state.enter("linkReference");
    let subexit = state.enter("label");
    const tracker = state.createTracker(info);
    let value = tracker.move("[");
    const text7 = state.containerPhrasing(node2, {
      before: value,
      after: "]",
      ...tracker.current()
    });
    value += tracker.move(text7 + "][");
    subexit();
    const stack = state.stack;
    state.stack = [];
    subexit = state.enter("reference");
    const reference = state.safe(state.associationId(node2), {
      before: value,
      after: "]",
      ...tracker.current()
    });
    subexit();
    state.stack = stack;
    exit3();
    if (type === "full" || !text7 || text7 !== reference) {
      value += tracker.move(reference + "]");
    } else if (type === "shortcut") {
      value = value.slice(0, -1);
    } else {
      value += tracker.move("]");
    }
    return value;
  }
  function linkReferencePeek() {
    return "[";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/list.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/check-bullet.js
  init_define_import_meta_env();
  function checkBullet(state) {
    const marker = state.options.bullet || "*";
    if (marker !== "*" && marker !== "+" && marker !== "-") {
      throw new Error(
        "Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`"
      );
    }
    return marker;
  }

  // node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js
  init_define_import_meta_env();
  function checkBulletOther(state) {
    const bullet = checkBullet(state);
    const bulletOther = state.options.bulletOther;
    if (!bulletOther) {
      return bullet === "*" ? "-" : "*";
    }
    if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") {
      throw new Error(
        "Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`"
      );
    }
    if (bulletOther === bullet) {
      throw new Error(
        "Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different"
      );
    }
    return bulletOther;
  }

  // node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js
  init_define_import_meta_env();
  function checkBulletOrdered(state) {
    const marker = state.options.bulletOrdered || ".";
    if (marker !== "." && marker !== ")") {
      throw new Error(
        "Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`"
      );
    }
    return marker;
  }

  // node_modules/mdast-util-to-markdown/lib/util/check-rule.js
  init_define_import_meta_env();
  function checkRule(state) {
    const marker = state.options.rule || "*";
    if (marker !== "*" && marker !== "-" && marker !== "_") {
      throw new Error(
        "Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`"
      );
    }
    return marker;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/list.js
  function list3(node2, parent, state, info) {
    const exit3 = state.enter("list");
    const bulletCurrent = state.bulletCurrent;
    let bullet = node2.ordered ? checkBulletOrdered(state) : checkBullet(state);
    const bulletOther = node2.ordered ? bullet === "." ? ")" : "." : checkBulletOther(state);
    let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
    if (!node2.ordered) {
      const firstListItem = node2.children ? node2.children[0] : void 0;
      if (
        // Bullet could be used as a thematic break marker:
        (bullet === "*" || bullet === "-") && // Empty first list item:
        firstListItem && (!firstListItem.children || !firstListItem.children[0]) && // Directly in two other list items:
        state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && // That are each the first child.
        state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0
      ) {
        useDifferentMarker = true;
      }
      if (checkRule(state) === bullet && firstListItem) {
        let index2 = -1;
        while (++index2 < node2.children.length) {
          const item = node2.children[index2];
          if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
            useDifferentMarker = true;
            break;
          }
        }
      }
    }
    if (useDifferentMarker) {
      bullet = bulletOther;
    }
    state.bulletCurrent = bullet;
    const value = state.containerFlow(node2, info);
    state.bulletLastUsed = bullet;
    state.bulletCurrent = bulletCurrent;
    exit3();
    return value;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/list-item.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js
  init_define_import_meta_env();
  function checkListItemIndent(state) {
    const style = state.options.listItemIndent || "one";
    if (style !== "tab" && style !== "one" && style !== "mixed") {
      throw new Error(
        "Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
      );
    }
    return style;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/list-item.js
  function listItem2(node2, parent, state, info) {
    const listItemIndent = checkListItemIndent(state);
    let bullet = state.bulletCurrent || checkBullet(state);
    if (parent && parent.type === "list" && parent.ordered) {
      bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node2)) + bullet;
    }
    let size = bullet.length + 1;
    if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node2.spread)) {
      size = Math.ceil(size / 4) * 4;
    }
    const tracker = state.createTracker(info);
    tracker.move(bullet + " ".repeat(size - bullet.length));
    tracker.shift(size);
    const exit3 = state.enter("listItem");
    const value = state.indentLines(
      state.containerFlow(node2, tracker.current()),
      map3
    );
    exit3();
    return value;
    function map3(line, index2, blank) {
      if (index2) {
        return (blank ? "" : " ".repeat(size)) + line;
      }
      return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
    }
  }

  // node_modules/mdast-util-to-markdown/lib/handle/paragraph.js
  init_define_import_meta_env();
  function paragraph2(node2, _, state, info) {
    const exit3 = state.enter("paragraph");
    const subexit = state.enter("phrasing");
    const value = state.containerPhrasing(node2, info);
    subexit();
    exit3();
    return value;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/root.js
  init_define_import_meta_env();

  // node_modules/mdast-util-phrasing/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-phrasing/lib/index.js
  init_define_import_meta_env();
  var phrasing = (
    /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
    convert([
      "break",
      "delete",
      "emphasis",
      // To do: next major: removed since footnotes were added to GFM.
      "footnote",
      "footnoteReference",
      "image",
      "imageReference",
      "inlineCode",
      // Enabled by `mdast-util-math`:
      "inlineMath",
      "link",
      "linkReference",
      // Enabled by `mdast-util-mdx`:
      "mdxJsxTextElement",
      // Enabled by `mdast-util-mdx`:
      "mdxTextExpression",
      "strong",
      "text",
      // Enabled by `mdast-util-directive`:
      "textDirective"
    ])
  );

  // node_modules/mdast-util-to-markdown/lib/handle/root.js
  function root3(node2, _, state, info) {
    const hasPhrasing = node2.children.some(function(d) {
      return phrasing(d);
    });
    const container = hasPhrasing ? state.containerPhrasing : state.containerFlow;
    return container.call(state, node2, info);
  }

  // node_modules/mdast-util-to-markdown/lib/handle/strong.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/check-strong.js
  init_define_import_meta_env();
  function checkStrong(state) {
    const marker = state.options.strong || "*";
    if (marker !== "*" && marker !== "_") {
      throw new Error(
        "Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`"
      );
    }
    return marker;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/strong.js
  strong2.peek = strongPeek;
  function strong2(node2, _, state, info) {
    const marker = checkStrong(state);
    const exit3 = state.enter("strong");
    const tracker = state.createTracker(info);
    const before = tracker.move(marker + marker);
    let between = tracker.move(
      state.containerPhrasing(node2, {
        after: marker,
        before,
        ...tracker.current()
      })
    );
    const betweenHead = between.charCodeAt(0);
    const open = encodeInfo(
      info.before.charCodeAt(info.before.length - 1),
      betweenHead,
      marker
    );
    if (open.inside) {
      between = encodeCharacterReference(betweenHead) + between.slice(1);
    }
    const betweenTail = between.charCodeAt(between.length - 1);
    const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
    if (close.inside) {
      between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
    }
    const after = tracker.move(marker + marker);
    exit3();
    state.attentionEncodeSurroundingInfo = {
      after: close.outside,
      before: open.outside
    };
    return before + between + after;
  }
  function strongPeek(_, _1, state) {
    return state.options.strong || "*";
  }

  // node_modules/mdast-util-to-markdown/lib/handle/text.js
  init_define_import_meta_env();
  function text5(node2, _, state, info) {
    return state.safe(node2.value, info);
  }

  // node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js
  init_define_import_meta_env();

  // node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js
  init_define_import_meta_env();
  function checkRuleRepetition(state) {
    const repetition = state.options.ruleRepetition || 3;
    if (repetition < 3) {
      throw new Error(
        "Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more"
      );
    }
    return repetition;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js
  function thematicBreak3(_, _1, state) {
    const value = (checkRule(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(state));
    return state.options.ruleSpaces ? value.slice(0, -1) : value;
  }

  // node_modules/mdast-util-to-markdown/lib/handle/index.js
  var handle = {
    blockquote: blockquote2,
    break: hardBreak2,
    code: code2,
    definition: definition2,
    emphasis: emphasis2,
    hardBreak: hardBreak2,
    heading: heading2,
    html: html4,
    image: image2,
    imageReference: imageReference2,
    inlineCode: inlineCode2,
    link: link2,
    linkReference: linkReference2,
    list: list3,
    listItem: listItem2,
    paragraph: paragraph2,
    root: root3,
    strong: strong2,
    text: text5,
    thematicBreak: thematicBreak3
  };

  // node_modules/mdast-util-gfm-table/lib/index.js
  function gfmTableFromMarkdown() {
    return {
      enter: {
        table: enterTable,
        tableData: enterCell,
        tableHeader: enterCell,
        tableRow: enterRow
      },
      exit: {
        codeText: exitCodeText,
        table: exitTable,
        tableData: exit2,
        tableHeader: exit2,
        tableRow: exit2
      }
    };
  }
  function enterTable(token) {
    const align = token._align;
    ok(align, "expected `_align` on table");
    this.enter(
      {
        type: "table",
        align: align.map(function(d) {
          return d === "none" ? null : d;
        }),
        children: []
      },
      token
    );
    this.data.inTable = true;
  }
  function exitTable(token) {
    this.exit(token);
    this.data.inTable = void 0;
  }
  function enterRow(token) {
    this.enter({ type: "tableRow", children: [] }, token);
  }
  function exit2(token) {
    this.exit(token);
  }
  function enterCell(token) {
    this.enter({ type: "tableCell", children: [] }, token);
  }
  function exitCodeText(token) {
    let value = this.resume();
    if (this.data.inTable) {
      value = value.replace(/\\([\\|])/g, replace);
    }
    const node2 = this.stack[this.stack.length - 1];
    ok(node2.type === "inlineCode");
    node2.value = value;
    this.exit(token);
  }
  function replace($0, $1) {
    return $1 === "|" ? $1 : $0;
  }
  function gfmTableToMarkdown(options) {
    const settings = options || {};
    const padding = settings.tableCellPadding;
    const alignDelimiters = settings.tablePipeAlign;
    const stringLength = settings.stringLength;
    const around = padding ? " " : "|";
    return {
      unsafe: [
        { character: "\r", inConstruct: "tableCell" },
        { character: "\n", inConstruct: "tableCell" },
        // A pipe, when followed by a tab or space (padding), or a dash or colon
        // (unpadded delimiter row), could result in a table.
        { atBreak: true, character: "|", after: "[	 :-]" },
        // A pipe in a cell must be encoded.
        { character: "|", inConstruct: "tableCell" },
        // A colon must be followed by a dash, in which case it could start a
        // delimiter row.
        { atBreak: true, character: ":", after: "-" },
        // A delimiter row can also start with a dash, when followed by more
        // dashes, a colon, or a pipe.
        // This is a stricter version than the built in check for lists, thematic
        // breaks, and setex heading underlines though:
        // <https://github.com/syntax-tree/mdast-util-to-markdown/blob/51a2038/lib/unsafe.js#L57>
        { atBreak: true, character: "-", after: "[:|-]" }
      ],
      handlers: {
        inlineCode: inlineCodeWithTable,
        table: handleTable,
        tableCell: handleTableCell,
        tableRow: handleTableRow
      }
    };
    function handleTable(node2, _, state, info) {
      return serializeData(handleTableAsData(node2, state, info), node2.align);
    }
    function handleTableRow(node2, _, state, info) {
      const row = handleTableRowAsData(node2, state, info);
      const value = serializeData([row]);
      return value.slice(0, value.indexOf("\n"));
    }
    function handleTableCell(node2, _, state, info) {
      const exit3 = state.enter("tableCell");
      const subexit = state.enter("phrasing");
      const value = state.containerPhrasing(node2, {
        ...info,
        before: around,
        after: around
      });
      subexit();
      exit3();
      return value;
    }
    function serializeData(matrix, align) {
      return markdownTable(matrix, {
        align,
        // @ts-expect-error: `markdown-table` types should support `null`.
        alignDelimiters,
        // @ts-expect-error: `markdown-table` types should support `null`.
        padding,
        // @ts-expect-error: `markdown-table` types should support `null`.
        stringLength
      });
    }
    function handleTableAsData(node2, state, info) {
      const children = node2.children;
      let index2 = -1;
      const result = [];
      const subexit = state.enter("table");
      while (++index2 < children.length) {
        result[index2] = handleTableRowAsData(children[index2], state, info);
      }
      subexit();
      return result;
    }
    function handleTableRowAsData(node2, state, info) {
      const children = node2.children;
      let index2 = -1;
      const result = [];
      const subexit = state.enter("tableRow");
      while (++index2 < children.length) {
        result[index2] = handleTableCell(children[index2], node2, state, info);
      }
      subexit();
      return result;
    }
    function inlineCodeWithTable(node2, parent, state) {
      let value = handle.inlineCode(node2, parent, state);
      if (state.stack.includes("tableCell")) {
        value = value.replace(/\|/g, "\\$&");
      }
      return value;
    }
  }

  // node_modules/mdast-util-gfm-task-list-item/index.js
  init_define_import_meta_env();

  // node_modules/mdast-util-gfm-task-list-item/lib/index.js
  init_define_import_meta_env();
  function gfmTaskListItemFromMarkdown() {
    return {
      exit: {
        taskListCheckValueChecked: exitCheck,
        taskListCheckValueUnchecked: exitCheck,
        paragraph: exitParagraphWithTaskListItem
      }
    };
  }
  function gfmTaskListItemToMarkdown() {
    return {
      unsafe: [{ atBreak: true, character: "-", after: "[:|-]" }],
      handlers: { listItem: listItemWithTaskListItem }
    };
  }
  function exitCheck(token) {
    const node2 = this.stack[this.stack.length - 2];
    ok(node2.type === "listItem");
    node2.checked = token.type === "taskListCheckValueChecked";
  }
  function exitParagraphWithTaskListItem(token) {
    const parent = this.stack[this.stack.length - 2];
    if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
      const node2 = this.stack[this.stack.length - 1];
      ok(node2.type === "paragraph");
      const head = node2.children[0];
      if (head && head.type === "text") {
        const siblings = parent.children;
        let index2 = -1;
        let firstParaghraph;
        while (++index2 < siblings.length) {
          const sibling = siblings[index2];
          if (sibling.type === "paragraph") {
            firstParaghraph = sibling;
            break;
          }
        }
        if (firstParaghraph === node2) {
          head.value = head.value.slice(1);
          if (head.value.length === 0) {
            node2.children.shift();
          } else if (node2.position && head.position && typeof head.position.start.offset === "number") {
            head.position.start.column++;
            head.position.start.offset++;
            node2.position.start = Object.assign({}, head.position.start);
          }
        }
      }
    }
    this.exit(token);
  }
  function listItemWithTaskListItem(node2, parent, state, info) {
    const head = node2.children[0];
    const checkable = typeof node2.checked === "boolean" && head && head.type === "paragraph";
    const checkbox = "[" + (node2.checked ? "x" : " ") + "] ";
    const tracker = state.createTracker(info);
    if (checkable) {
      tracker.move(checkbox);
    }
    let value = handle.listItem(node2, parent, state, {
      ...info,
      ...tracker.current()
    });
    if (checkable) {
      value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, check);
    }
    return value;
    function check($0) {
      return $0 + checkbox;
    }
  }

  // node_modules/mdast-util-gfm/lib/index.js
  function gfmFromMarkdown() {
    return [
      gfmAutolinkLiteralFromMarkdown(),
      gfmFootnoteFromMarkdown(),
      gfmStrikethroughFromMarkdown(),
      gfmTableFromMarkdown(),
      gfmTaskListItemFromMarkdown()
    ];
  }
  function gfmToMarkdown(options) {
    return {
      extensions: [
        gfmAutolinkLiteralToMarkdown(),
        gfmFootnoteToMarkdown(options),
        gfmStrikethroughToMarkdown(),
        gfmTableToMarkdown(options),
        gfmTaskListItemToMarkdown()
      ]
    };
  }

  // node_modules/micromark-extension-gfm/index.js
  init_define_import_meta_env();

  // node_modules/micromark-extension-gfm-autolink-literal/index.js
  init_define_import_meta_env();

  // node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js
  init_define_import_meta_env();
  var wwwPrefix = {
    tokenize: tokenizeWwwPrefix,
    partial: true
  };
  var domain = {
    tokenize: tokenizeDomain,
    partial: true
  };
  var path = {
    tokenize: tokenizePath,
    partial: true
  };
  var trail = {
    tokenize: tokenizeTrail,
    partial: true
  };
  var emailDomainDotTrail = {
    tokenize: tokenizeEmailDomainDotTrail,
    partial: true
  };
  var wwwAutolink = {
    name: "wwwAutolink",
    tokenize: tokenizeWwwAutolink,
    previous: previousWww
  };
  var protocolAutolink = {
    name: "protocolAutolink",
    tokenize: tokenizeProtocolAutolink,
    previous: previousProtocol
  };
  var emailAutolink = {
    name: "emailAutolink",
    tokenize: tokenizeEmailAutolink,
    previous: previousEmail
  };
  var text6 = {};
  function gfmAutolinkLiteral() {
    return {
      text: text6
    };
  }
  var code3 = 48;
  while (code3 < 123) {
    text6[code3] = emailAutolink;
    code3++;
    if (code3 === 58) code3 = 65;
    else if (code3 === 91) code3 = 97;
  }
  text6[43] = emailAutolink;
  text6[45] = emailAutolink;
  text6[46] = emailAutolink;
  text6[95] = emailAutolink;
  text6[72] = [emailAutolink, protocolAutolink];
  text6[104] = [emailAutolink, protocolAutolink];
  text6[87] = [emailAutolink, wwwAutolink];
  text6[119] = [emailAutolink, wwwAutolink];
  function tokenizeEmailAutolink(effects, ok3, nok) {
    const self2 = this;
    let dot;
    let data;
    return start2;
    function start2(code4) {
      if (!gfmAtext(code4) || !previousEmail.call(self2, self2.previous) || previousUnbalanced(self2.events)) {
        return nok(code4);
      }
      effects.enter("literalAutolink");
      effects.enter("literalAutolinkEmail");
      return atext(code4);
    }
    function atext(code4) {
      if (gfmAtext(code4)) {
        effects.consume(code4);
        return atext;
      }
      if (code4 === 64) {
        effects.consume(code4);
        return emailDomain;
      }
      return nok(code4);
    }
    function emailDomain(code4) {
      if (code4 === 46) {
        return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code4);
      }
      if (code4 === 45 || code4 === 95 || asciiAlphanumeric(code4)) {
        data = true;
        effects.consume(code4);
        return emailDomain;
      }
      return emailDomainAfter(code4);
    }
    function emailDomainDot(code4) {
      effects.consume(code4);
      dot = true;
      return emailDomain;
    }
    function emailDomainAfter(code4) {
      if (data && dot && asciiAlpha(self2.previous)) {
        effects.exit("literalAutolinkEmail");
        effects.exit("literalAutolink");
        return ok3(code4);
      }
      return nok(code4);
    }
  }
  function tokenizeWwwAutolink(effects, ok3, nok) {
    const self2 = this;
    return wwwStart;
    function wwwStart(code4) {
      if (code4 !== 87 && code4 !== 119 || !previousWww.call(self2, self2.previous) || previousUnbalanced(self2.events)) {
        return nok(code4);
      }
      effects.enter("literalAutolink");
      effects.enter("literalAutolinkWww");
      return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code4);
    }
    function wwwAfter(code4) {
      effects.exit("literalAutolinkWww");
      effects.exit("literalAutolink");
      return ok3(code4);
    }
  }
  function tokenizeProtocolAutolink(effects, ok3, nok) {
    const self2 = this;
    let buffer = "";
    let seen = false;
    return protocolStart;
    function protocolStart(code4) {
      if ((code4 === 72 || code4 === 104) && previousProtocol.call(self2, self2.previous) && !previousUnbalanced(self2.events)) {
        effects.enter("literalAutolink");
        effects.enter("literalAutolinkHttp");
        buffer += String.fromCodePoint(code4);
        effects.consume(code4);
        return protocolPrefixInside;
      }
      return nok(code4);
    }
    function protocolPrefixInside(code4) {
      if (asciiAlpha(code4) && buffer.length < 5) {
        buffer += String.fromCodePoint(code4);
        effects.consume(code4);
        return protocolPrefixInside;
      }
      if (code4 === 58) {
        const protocol = buffer.toLowerCase();
        if (protocol === "http" || protocol === "https") {
          effects.consume(code4);
          return protocolSlashesInside;
        }
      }
      return nok(code4);
    }
    function protocolSlashesInside(code4) {
      if (code4 === 47) {
        effects.consume(code4);
        if (seen) {
          return afterProtocol;
        }
        seen = true;
        return protocolSlashesInside;
      }
      return nok(code4);
    }
    function afterProtocol(code4) {
      return code4 === null || asciiControl(code4) || markdownLineEndingOrSpace(code4) || unicodeWhitespace(code4) || unicodePunctuation(code4) ? nok(code4) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code4);
    }
    function protocolAfter(code4) {
      effects.exit("literalAutolinkHttp");
      effects.exit("literalAutolink");
      return ok3(code4);
    }
  }
  function tokenizeWwwPrefix(effects, ok3, nok) {
    let size = 0;
    return wwwPrefixInside;
    function wwwPrefixInside(code4) {
      if ((code4 === 87 || code4 === 119) && size < 3) {
        size++;
        effects.consume(code4);
        return wwwPrefixInside;
      }
      if (code4 === 46 && size === 3) {
        effects.consume(code4);
        return wwwPrefixAfter;
      }
      return nok(code4);
    }
    function wwwPrefixAfter(code4) {
      return code4 === null ? nok(code4) : ok3(code4);
    }
  }
  function tokenizeDomain(effects, ok3, nok) {
    let underscoreInLastSegment;
    let underscoreInLastLastSegment;
    let seen;
    return domainInside;
    function domainInside(code4) {
      if (code4 === 46 || code4 === 95) {
        return effects.check(trail, domainAfter, domainAtPunctuation)(code4);
      }
      if (code4 === null || markdownLineEndingOrSpace(code4) || unicodeWhitespace(code4) || code4 !== 45 && unicodePunctuation(code4)) {
        return domainAfter(code4);
      }
      seen = true;
      effects.consume(code4);
      return domainInside;
    }
    function domainAtPunctuation(code4) {
      if (code4 === 95) {
        underscoreInLastSegment = true;
      } else {
        underscoreInLastLastSegment = underscoreInLastSegment;
        underscoreInLastSegment = void 0;
      }
      effects.consume(code4);
      return domainInside;
    }
    function domainAfter(code4) {
      if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) {
        return nok(code4);
      }
      return ok3(code4);
    }
  }
  function tokenizePath(effects, ok3) {
    let sizeOpen = 0;
    let sizeClose = 0;
    return pathInside;
    function pathInside(code4) {
      if (code4 === 40) {
        sizeOpen++;
        effects.consume(code4);
        return pathInside;
      }
      if (code4 === 41 && sizeClose < sizeOpen) {
        return pathAtPunctuation(code4);
      }
      if (code4 === 33 || code4 === 34 || code4 === 38 || code4 === 39 || code4 === 41 || code4 === 42 || code4 === 44 || code4 === 46 || code4 === 58 || code4 === 59 || code4 === 60 || code4 === 63 || code4 === 93 || code4 === 95 || code4 === 126) {
        return effects.check(trail, ok3, pathAtPunctuation)(code4);
      }
      if (code4 === null || markdownLineEndingOrSpace(code4) || unicodeWhitespace(code4)) {
        return ok3(code4);
      }
      effects.consume(code4);
      return pathInside;
    }
    function pathAtPunctuation(code4) {
      if (code4 === 41) {
        sizeClose++;
      }
      effects.consume(code4);
      return pathInside;
    }
  }
  function tokenizeTrail(effects, ok3, nok) {
    return trail2;
    function trail2(code4) {
      if (code4 === 33 || code4 === 34 || code4 === 39 || code4 === 41 || code4 === 42 || code4 === 44 || code4 === 46 || code4 === 58 || code4 === 59 || code4 === 63 || code4 === 95 || code4 === 126) {
        effects.consume(code4);
        return trail2;
      }
      if (code4 === 38) {
        effects.consume(code4);
        return trailCharacterReferenceStart;
      }
      if (code4 === 93) {
        effects.consume(code4);
        return trailBracketAfter;
      }
      if (
        // `<` is an end.
        code4 === 60 || // So is whitespace.
        code4 === null || markdownLineEndingOrSpace(code4) || unicodeWhitespace(code4)
      ) {
        return ok3(code4);
      }
      return nok(code4);
    }
    function trailBracketAfter(code4) {
      if (code4 === null || code4 === 40 || code4 === 91 || markdownLineEndingOrSpace(code4) || unicodeWhitespace(code4)) {
        return ok3(code4);
      }
      return trail2(code4);
    }
    function trailCharacterReferenceStart(code4) {
      return asciiAlpha(code4) ? trailCharacterReferenceInside(code4) : nok(code4);
    }
    function trailCharacterReferenceInside(code4) {
      if (code4 === 59) {
        effects.consume(code4);
        return trail2;
      }
      if (asciiAlpha(code4)) {
        effects.consume(code4);
        return trailCharacterReferenceInside;
      }
      return nok(code4);
    }
  }
  function tokenizeEmailDomainDotTrail(effects, ok3, nok) {
    return start2;
    function start2(code4) {
      effects.consume(code4);
      return after;
    }
    function after(code4) {
      return asciiAlphanumeric(code4) ? nok(code4) : ok3(code4);
    }
  }
  function previousWww(code4) {
    return code4 === null || code4 === 40 || code4 === 42 || code4 === 95 || code4 === 91 || code4 === 93 || code4 === 126 || markdownLineEndingOrSpace(code4);
  }
  function previousProtocol(code4) {
    return !asciiAlpha(code4);
  }
  function previousEmail(code4) {
    return !(code4 === 47 || gfmAtext(code4));
  }
  function gfmAtext(code4) {
    return code4 === 43 || code4 === 45 || code4 === 46 || code4 === 95 || asciiAlphanumeric(code4);
  }
  function previousUnbalanced(events) {
    let index2 = events.length;
    let result = false;
    while (index2--) {
      const token = events[index2][1];
      if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
        result = true;
        break;
      }
      if (token._gfmAutolinkLiteralWalkedInto) {
        result = false;
        break;
      }
    }
    if (events.length > 0 && !result) {
      events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
    }
    return result;
  }

  // node_modules/micromark-extension-gfm-footnote/index.js
  init_define_import_meta_env();

  // node_modules/micromark-extension-gfm-footnote/lib/syntax.js
  init_define_import_meta_env();
  var indent = {
    tokenize: tokenizeIndent2,
    partial: true
  };
  function gfmFootnote() {
    return {
      document: {
        [91]: {
          name: "gfmFootnoteDefinition",
          tokenize: tokenizeDefinitionStart,
          continuation: {
            tokenize: tokenizeDefinitionContinuation
          },
          exit: gfmFootnoteDefinitionEnd
        }
      },
      text: {
        [91]: {
          name: "gfmFootnoteCall",
          tokenize: tokenizeGfmFootnoteCall
        },
        [93]: {
          name: "gfmPotentialFootnoteCall",
          add: "after",
          tokenize: tokenizePotentialGfmFootnoteCall,
          resolveTo: resolveToPotentialGfmFootnoteCall
        }
      }
    };
  }
  function tokenizePotentialGfmFootnoteCall(effects, ok3, nok) {
    const self2 = this;
    let index2 = self2.events.length;
    const defined = self2.parser.gfmFootnotes || (self2.parser.gfmFootnotes = []);
    let labelStart;
    while (index2--) {
      const token = self2.events[index2][1];
      if (token.type === "labelImage") {
        labelStart = token;
        break;
      }
      if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") {
        break;
      }
    }
    return start2;
    function start2(code4) {
      if (!labelStart || !labelStart._balanced) {
        return nok(code4);
      }
      const id = normalizeIdentifier(self2.sliceSerialize({
        start: labelStart.end,
        end: self2.now()
      }));
      if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) {
        return nok(code4);
      }
      effects.enter("gfmFootnoteCallLabelMarker");
      effects.consume(code4);
      effects.exit("gfmFootnoteCallLabelMarker");
      return ok3(code4);
    }
  }
  function resolveToPotentialGfmFootnoteCall(events, context) {
    let index2 = events.length;
    let labelStart;
    while (index2--) {
      if (events[index2][1].type === "labelImage" && events[index2][0] === "enter") {
        labelStart = events[index2][1];
        break;
      }
    }
    events[index2 + 1][1].type = "data";
    events[index2 + 3][1].type = "gfmFootnoteCallLabelMarker";
    const call = {
      type: "gfmFootnoteCall",
      start: Object.assign({}, events[index2 + 3][1].start),
      end: Object.assign({}, events[events.length - 1][1].end)
    };
    const marker = {
      type: "gfmFootnoteCallMarker",
      start: Object.assign({}, events[index2 + 3][1].end),
      end: Object.assign({}, events[index2 + 3][1].end)
    };
    marker.end.column++;
    marker.end.offset++;
    marker.end._bufferIndex++;
    const string3 = {
      type: "gfmFootnoteCallString",
      start: Object.assign({}, marker.end),
      end: Object.assign({}, events[events.length - 1][1].start)
    };
    const chunk = {
      type: "chunkString",
      contentType: "string",
      start: Object.assign({}, string3.start),
      end: Object.assign({}, string3.end)
    };
    const replacement = [
      // Take the `labelImageMarker` (now `data`, the `!`)
      events[index2 + 1],
      events[index2 + 2],
      ["enter", call, context],
      // The `[`
      events[index2 + 3],
      events[index2 + 4],
      // The `^`.
      ["enter", marker, context],
      ["exit", marker, context],
      // Everything in between.
      ["enter", string3, context],
      ["enter", chunk, context],
      ["exit", chunk, context],
      ["exit", string3, context],
      // The ending (`]`, properly parsed and labelled).
      events[events.length - 2],
      events[events.length - 1],
      ["exit", call, context]
    ];
    events.splice(index2, events.length - index2 + 1, ...replacement);
    return events;
  }
  function tokenizeGfmFootnoteCall(effects, ok3, nok) {
    const self2 = this;
    const defined = self2.parser.gfmFootnotes || (self2.parser.gfmFootnotes = []);
    let size = 0;
    let data;
    return start2;
    function start2(code4) {
      effects.enter("gfmFootnoteCall");
      effects.enter("gfmFootnoteCallLabelMarker");
      effects.consume(code4);
      effects.exit("gfmFootnoteCallLabelMarker");
      return callStart;
    }
    function callStart(code4) {
      if (code4 !== 94) return nok(code4);
      effects.enter("gfmFootnoteCallMarker");
      effects.consume(code4);
      effects.exit("gfmFootnoteCallMarker");
      effects.enter("gfmFootnoteCallString");
      effects.enter("chunkString").contentType = "string";
      return callData;
    }
    function callData(code4) {
      if (
        // Too long.
        size > 999 || // Closing brace with nothing.
        code4 === 93 && !data || // Space or tab is not supported by GFM for some reason.
        // `\n` and `[` not being supported makes sense.
        code4 === null || code4 === 91 || markdownLineEndingOrSpace(code4)
      ) {
        return nok(code4);
      }
      if (code4 === 93) {
        effects.exit("chunkString");
        const token = effects.exit("gfmFootnoteCallString");
        if (!defined.includes(normalizeIdentifier(self2.sliceSerialize(token)))) {
          return nok(code4);
        }
        effects.enter("gfmFootnoteCallLabelMarker");
        effects.consume(code4);
        effects.exit("gfmFootnoteCallLabelMarker");
        effects.exit("gfmFootnoteCall");
        return ok3;
      }
      if (!markdownLineEndingOrSpace(code4)) {
        data = true;
      }
      size++;
      effects.consume(code4);
      return code4 === 92 ? callEscape : callData;
    }
    function callEscape(code4) {
      if (code4 === 91 || code4 === 92 || code4 === 93) {
        effects.consume(code4);
        size++;
        return callData;
      }
      return callData(code4);
    }
  }
  function tokenizeDefinitionStart(effects, ok3, nok) {
    const self2 = this;
    const defined = self2.parser.gfmFootnotes || (self2.parser.gfmFootnotes = []);
    let identifier;
    let size = 0;
    let data;
    return start2;
    function start2(code4) {
      effects.enter("gfmFootnoteDefinition")._container = true;
      effects.enter("gfmFootnoteDefinitionLabel");
      effects.enter("gfmFootnoteDefinitionLabelMarker");
      effects.consume(code4);
      effects.exit("gfmFootnoteDefinitionLabelMarker");
      return labelAtMarker;
    }
    function labelAtMarker(code4) {
      if (code4 === 94) {
        effects.enter("gfmFootnoteDefinitionMarker");
        effects.consume(code4);
        effects.exit("gfmFootnoteDefinitionMarker");
        effects.enter("gfmFootnoteDefinitionLabelString");
        effects.enter("chunkString").contentType = "string";
        return labelInside;
      }
      return nok(code4);
    }
    function labelInside(code4) {
      if (
        // Too long.
        size > 999 || // Closing brace with nothing.
        code4 === 93 && !data || // Space or tab is not supported by GFM for some reason.
        // `\n` and `[` not being supported makes sense.
        code4 === null || code4 === 91 || markdownLineEndingOrSpace(code4)
      ) {
        return nok(code4);
      }
      if (code4 === 93) {
        effects.exit("chunkString");
        const token = effects.exit("gfmFootnoteDefinitionLabelString");
        identifier = normalizeIdentifier(self2.sliceSerialize(token));
        effects.enter("gfmFootnoteDefinitionLabelMarker");
        effects.consume(code4);
        effects.exit("gfmFootnoteDefinitionLabelMarker");
        effects.exit("gfmFootnoteDefinitionLabel");
        return labelAfter;
      }
      if (!markdownLineEndingOrSpace(code4)) {
        data = true;
      }
      size++;
      effects.consume(code4);
      return code4 === 92 ? labelEscape : labelInside;
    }
    function labelEscape(code4) {
      if (code4 === 91 || code4 === 92 || code4 === 93) {
        effects.consume(code4);
        size++;
        return labelInside;
      }
      return labelInside(code4);
    }
    function labelAfter(code4) {
      if (code4 === 58) {
        effects.enter("definitionMarker");
        effects.consume(code4);
        effects.exit("definitionMarker");
        if (!defined.includes(identifier)) {
          defined.push(identifier);
        }
        return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
      }
      return nok(code4);
    }
    function whitespaceAfter(code4) {
      return ok3(code4);
    }
  }
  function tokenizeDefinitionContinuation(effects, ok3, nok) {
    return effects.check(blankLine, ok3, effects.attempt(indent, ok3, nok));
  }
  function gfmFootnoteDefinitionEnd(effects) {
    effects.exit("gfmFootnoteDefinition");
  }
  function tokenizeIndent2(effects, ok3, nok) {
    const self2 = this;
    return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 4 + 1);
    function afterPrefix(code4) {
      const tail = self2.events[self2.events.length - 1];
      return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok3(code4) : nok(code4);
    }
  }

  // node_modules/micromark-extension-gfm-strikethrough/index.js
  init_define_import_meta_env();

  // node_modules/micromark-extension-gfm-strikethrough/lib/syntax.js
  init_define_import_meta_env();
  function gfmStrikethrough(options) {
    const options_ = options || {};
    let single = options_.singleTilde;
    const tokenizer = {
      name: "strikethrough",
      tokenize: tokenizeStrikethrough,
      resolveAll: resolveAllStrikethrough
    };
    if (single === null || single === void 0) {
      single = true;
    }
    return {
      text: {
        [126]: tokenizer
      },
      insideSpan: {
        null: [tokenizer]
      },
      attentionMarkers: {
        null: [126]
      }
    };
    function resolveAllStrikethrough(events, context) {
      let index2 = -1;
      while (++index2 < events.length) {
        if (events[index2][0] === "enter" && events[index2][1].type === "strikethroughSequenceTemporary" && events[index2][1]._close) {
          let open = index2;
          while (open--) {
            if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && // If the sizes are the same:
            events[index2][1].end.offset - events[index2][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
              events[index2][1].type = "strikethroughSequence";
              events[open][1].type = "strikethroughSequence";
              const strikethrough2 = {
                type: "strikethrough",
                start: Object.assign({}, events[open][1].start),
                end: Object.assign({}, events[index2][1].end)
              };
              const text7 = {
                type: "strikethroughText",
                start: Object.assign({}, events[open][1].end),
                end: Object.assign({}, events[index2][1].start)
              };
              const nextEvents = [["enter", strikethrough2, context], ["enter", events[open][1], context], ["exit", events[open][1], context], ["enter", text7, context]];
              const insideSpan2 = context.parser.constructs.insideSpan.null;
              if (insideSpan2) {
                splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan2, events.slice(open + 1, index2), context));
              }
              splice(nextEvents, nextEvents.length, 0, [["exit", text7, context], ["enter", events[index2][1], context], ["exit", events[index2][1], context], ["exit", strikethrough2, context]]);
              splice(events, open - 1, index2 - open + 3, nextEvents);
              index2 = open + nextEvents.length - 2;
              break;
            }
          }
        }
      }
      index2 = -1;
      while (++index2 < events.length) {
        if (events[index2][1].type === "strikethroughSequenceTemporary") {
          events[index2][1].type = "data";
        }
      }
      return events;
    }
    function tokenizeStrikethrough(effects, ok3, nok) {
      const previous3 = this.previous;
      const events = this.events;
      let size = 0;
      return start2;
      function start2(code4) {
        if (previous3 === 126 && events[events.length - 1][1].type !== "characterEscape") {
          return nok(code4);
        }
        effects.enter("strikethroughSequenceTemporary");
        return more(code4);
      }
      function more(code4) {
        const before = classifyCharacter(previous3);
        if (code4 === 126) {
          if (size > 1) return nok(code4);
          effects.consume(code4);
          size++;
          return more;
        }
        if (size < 2 && !single) return nok(code4);
        const token = effects.exit("strikethroughSequenceTemporary");
        const after = classifyCharacter(code4);
        token._open = !after || after === 2 && Boolean(before);
        token._close = !before || before === 2 && Boolean(after);
        return ok3(code4);
      }
    }
  }

  // node_modules/micromark-extension-gfm-table/index.js
  init_define_import_meta_env();

  // node_modules/micromark-extension-gfm-table/lib/syntax.js
  init_define_import_meta_env();

  // node_modules/micromark-extension-gfm-table/lib/edit-map.js
  init_define_import_meta_env();
  var EditMap = class {
    /**
     * Create a new edit map.
     */
    constructor() {
      this.map = [];
    }
    /**
     * Create an edit: a remove and/or add at a certain place.
     *
     * @param {number} index
     * @param {number} remove
     * @param {Array<Event>} add
     * @returns {undefined}
     */
    add(index2, remove, add) {
      addImplementation(this, index2, remove, add);
    }
    // To do: add this when moving to `micromark`.
    // /**
    //  * Create an edit: but insert `add` before existing additions.
    //  *
    //  * @param {number} index
    //  * @param {number} remove
    //  * @param {Array<Event>} add
    //  * @returns {undefined}
    //  */
    // addBefore(index, remove, add) {
    //   addImplementation(this, index, remove, add, true)
    // }
    /**
     * Done, change the events.
     *
     * @param {Array<Event>} events
     * @returns {undefined}
     */
    consume(events) {
      this.map.sort(function(a, b) {
        return a[0] - b[0];
      });
      if (this.map.length === 0) {
        return;
      }
      let index2 = this.map.length;
      const vecs = [];
      while (index2 > 0) {
        index2 -= 1;
        vecs.push(events.slice(this.map[index2][0] + this.map[index2][1]), this.map[index2][2]);
        events.length = this.map[index2][0];
      }
      vecs.push(events.slice());
      events.length = 0;
      let slice = vecs.pop();
      while (slice) {
        for (const element3 of slice) {
          events.push(element3);
        }
        slice = vecs.pop();
      }
      this.map.length = 0;
    }
  };
  function addImplementation(editMap, at, remove, add) {
    let index2 = 0;
    if (remove === 0 && add.length === 0) {
      return;
    }
    while (index2 < editMap.map.length) {
      if (editMap.map[index2][0] === at) {
        editMap.map[index2][1] += remove;
        editMap.map[index2][2].push(...add);
        return;
      }
      index2 += 1;
    }
    editMap.map.push([at, remove, add]);
  }

  // node_modules/micromark-extension-gfm-table/lib/infer.js
  init_define_import_meta_env();
  function gfmTableAlign(events, index2) {
    let inDelimiterRow = false;
    const align = [];
    while (index2 < events.length) {
      const event = events[index2];
      if (inDelimiterRow) {
        if (event[0] === "enter") {
          if (event[1].type === "tableContent") {
            align.push(events[index2 + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
          }
        } else if (event[1].type === "tableContent") {
          if (events[index2 - 1][1].type === "tableDelimiterMarker") {
            const alignIndex = align.length - 1;
            align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
          }
        } else if (event[1].type === "tableDelimiterRow") {
          break;
        }
      } else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") {
        inDelimiterRow = true;
      }
      index2 += 1;
    }
    return align;
  }

  // node_modules/micromark-extension-gfm-table/lib/syntax.js
  function gfmTable() {
    return {
      flow: {
        null: {
          name: "table",
          tokenize: tokenizeTable,
          resolveAll: resolveTable
        }
      }
    };
  }
  function tokenizeTable(effects, ok3, nok) {
    const self2 = this;
    let size = 0;
    let sizeB = 0;
    let seen;
    return start2;
    function start2(code4) {
      let index2 = self2.events.length - 1;
      while (index2 > -1) {
        const type = self2.events[index2][1].type;
        if (type === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
        type === "linePrefix") index2--;
        else break;
      }
      const tail = index2 > -1 ? self2.events[index2][1].type : null;
      const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
      if (next === bodyRowStart && self2.parser.lazy[self2.now().line]) {
        return nok(code4);
      }
      return next(code4);
    }
    function headRowBefore(code4) {
      effects.enter("tableHead");
      effects.enter("tableRow");
      return headRowStart(code4);
    }
    function headRowStart(code4) {
      if (code4 === 124) {
        return headRowBreak(code4);
      }
      seen = true;
      sizeB += 1;
      return headRowBreak(code4);
    }
    function headRowBreak(code4) {
      if (code4 === null) {
        return nok(code4);
      }
      if (markdownLineEnding(code4)) {
        if (sizeB > 1) {
          sizeB = 0;
          self2.interrupt = true;
          effects.exit("tableRow");
          effects.enter("lineEnding");
          effects.consume(code4);
          effects.exit("lineEnding");
          return headDelimiterStart;
        }
        return nok(code4);
      }
      if (markdownSpace(code4)) {
        return factorySpace(effects, headRowBreak, "whitespace")(code4);
      }
      sizeB += 1;
      if (seen) {
        seen = false;
        size += 1;
      }
      if (code4 === 124) {
        effects.enter("tableCellDivider");
        effects.consume(code4);
        effects.exit("tableCellDivider");
        seen = true;
        return headRowBreak;
      }
      effects.enter("data");
      return headRowData(code4);
    }
    function headRowData(code4) {
      if (code4 === null || code4 === 124 || markdownLineEndingOrSpace(code4)) {
        effects.exit("data");
        return headRowBreak(code4);
      }
      effects.consume(code4);
      return code4 === 92 ? headRowEscape : headRowData;
    }
    function headRowEscape(code4) {
      if (code4 === 92 || code4 === 124) {
        effects.consume(code4);
        return headRowData;
      }
      return headRowData(code4);
    }
    function headDelimiterStart(code4) {
      self2.interrupt = false;
      if (self2.parser.lazy[self2.now().line]) {
        return nok(code4);
      }
      effects.enter("tableDelimiterRow");
      seen = false;
      if (markdownSpace(code4)) {
        return factorySpace(effects, headDelimiterBefore, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code4);
      }
      return headDelimiterBefore(code4);
    }
    function headDelimiterBefore(code4) {
      if (code4 === 45 || code4 === 58) {
        return headDelimiterValueBefore(code4);
      }
      if (code4 === 124) {
        seen = true;
        effects.enter("tableCellDivider");
        effects.consume(code4);
        effects.exit("tableCellDivider");
        return headDelimiterCellBefore;
      }
      return headDelimiterNok(code4);
    }
    function headDelimiterCellBefore(code4) {
      if (markdownSpace(code4)) {
        return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code4);
      }
      return headDelimiterValueBefore(code4);
    }
    function headDelimiterValueBefore(code4) {
      if (code4 === 58) {
        sizeB += 1;
        seen = true;
        effects.enter("tableDelimiterMarker");
        effects.consume(code4);
        effects.exit("tableDelimiterMarker");
        return headDelimiterLeftAlignmentAfter;
      }
      if (code4 === 45) {
        sizeB += 1;
        return headDelimiterLeftAlignmentAfter(code4);
      }
      if (code4 === null || markdownLineEnding(code4)) {
        return headDelimiterCellAfter(code4);
      }
      return headDelimiterNok(code4);
    }
    function headDelimiterLeftAlignmentAfter(code4) {
      if (code4 === 45) {
        effects.enter("tableDelimiterFiller");
        return headDelimiterFiller(code4);
      }
      return headDelimiterNok(code4);
    }
    function headDelimiterFiller(code4) {
      if (code4 === 45) {
        effects.consume(code4);
        return headDelimiterFiller;
      }
      if (code4 === 58) {
        seen = true;
        effects.exit("tableDelimiterFiller");
        effects.enter("tableDelimiterMarker");
        effects.consume(code4);
        effects.exit("tableDelimiterMarker");
        return headDelimiterRightAlignmentAfter;
      }
      effects.exit("tableDelimiterFiller");
      return headDelimiterRightAlignmentAfter(code4);
    }
    function headDelimiterRightAlignmentAfter(code4) {
      if (markdownSpace(code4)) {
        return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code4);
      }
      return headDelimiterCellAfter(code4);
    }
    function headDelimiterCellAfter(code4) {
      if (code4 === 124) {
        return headDelimiterBefore(code4);
      }
      if (code4 === null || markdownLineEnding(code4)) {
        if (!seen || size !== sizeB) {
          return headDelimiterNok(code4);
        }
        effects.exit("tableDelimiterRow");
        effects.exit("tableHead");
        return ok3(code4);
      }
      return headDelimiterNok(code4);
    }
    function headDelimiterNok(code4) {
      return nok(code4);
    }
    function bodyRowStart(code4) {
      effects.enter("tableRow");
      return bodyRowBreak(code4);
    }
    function bodyRowBreak(code4) {
      if (code4 === 124) {
        effects.enter("tableCellDivider");
        effects.consume(code4);
        effects.exit("tableCellDivider");
        return bodyRowBreak;
      }
      if (code4 === null || markdownLineEnding(code4)) {
        effects.exit("tableRow");
        return ok3(code4);
      }
      if (markdownSpace(code4)) {
        return factorySpace(effects, bodyRowBreak, "whitespace")(code4);
      }
      effects.enter("data");
      return bodyRowData(code4);
    }
    function bodyRowData(code4) {
      if (code4 === null || code4 === 124 || markdownLineEndingOrSpace(code4)) {
        effects.exit("data");
        return bodyRowBreak(code4);
      }
      effects.consume(code4);
      return code4 === 92 ? bodyRowEscape : bodyRowData;
    }
    function bodyRowEscape(code4) {
      if (code4 === 92 || code4 === 124) {
        effects.consume(code4);
        return bodyRowData;
      }
      return bodyRowData(code4);
    }
  }
  function resolveTable(events, context) {
    let index2 = -1;
    let inFirstCellAwaitingPipe = true;
    let rowKind = 0;
    let lastCell = [0, 0, 0, 0];
    let cell = [0, 0, 0, 0];
    let afterHeadAwaitingFirstBodyRow = false;
    let lastTableEnd = 0;
    let currentTable;
    let currentBody;
    let currentCell;
    const map3 = new EditMap();
    while (++index2 < events.length) {
      const event = events[index2];
      const token = event[1];
      if (event[0] === "enter") {
        if (token.type === "tableHead") {
          afterHeadAwaitingFirstBodyRow = false;
          if (lastTableEnd !== 0) {
            flushTableEnd(map3, context, lastTableEnd, currentTable, currentBody);
            currentBody = void 0;
            lastTableEnd = 0;
          }
          currentTable = {
            type: "table",
            start: Object.assign({}, token.start),
            // Note: correct end is set later.
            end: Object.assign({}, token.end)
          };
          map3.add(index2, 0, [["enter", currentTable, context]]);
        } else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
          inFirstCellAwaitingPipe = true;
          currentCell = void 0;
          lastCell = [0, 0, 0, 0];
          cell = [0, index2 + 1, 0, 0];
          if (afterHeadAwaitingFirstBodyRow) {
            afterHeadAwaitingFirstBodyRow = false;
            currentBody = {
              type: "tableBody",
              start: Object.assign({}, token.start),
              // Note: correct end is set later.
              end: Object.assign({}, token.end)
            };
            map3.add(index2, 0, [["enter", currentBody, context]]);
          }
          rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
        } else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
          inFirstCellAwaitingPipe = false;
          if (cell[2] === 0) {
            if (lastCell[1] !== 0) {
              cell[0] = cell[1];
              currentCell = flushCell(map3, context, lastCell, rowKind, void 0, currentCell);
              lastCell = [0, 0, 0, 0];
            }
            cell[2] = index2;
          }
        } else if (token.type === "tableCellDivider") {
          if (inFirstCellAwaitingPipe) {
            inFirstCellAwaitingPipe = false;
          } else {
            if (lastCell[1] !== 0) {
              cell[0] = cell[1];
              currentCell = flushCell(map3, context, lastCell, rowKind, void 0, currentCell);
            }
            lastCell = cell;
            cell = [lastCell[1], index2, 0, 0];
          }
        }
      } else if (token.type === "tableHead") {
        afterHeadAwaitingFirstBodyRow = true;
        lastTableEnd = index2;
      } else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
        lastTableEnd = index2;
        if (lastCell[1] !== 0) {
          cell[0] = cell[1];
          currentCell = flushCell(map3, context, lastCell, rowKind, index2, currentCell);
        } else if (cell[1] !== 0) {
          currentCell = flushCell(map3, context, cell, rowKind, index2, currentCell);
        }
        rowKind = 0;
      } else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
        cell[3] = index2;
      }
    }
    if (lastTableEnd !== 0) {
      flushTableEnd(map3, context, lastTableEnd, currentTable, currentBody);
    }
    map3.consume(context.events);
    index2 = -1;
    while (++index2 < context.events.length) {
      const event = context.events[index2];
      if (event[0] === "enter" && event[1].type === "table") {
        event[1]._align = gfmTableAlign(context.events, index2);
      }
    }
    return events;
  }
  function flushCell(map3, context, range, rowKind, rowEnd, previousCell) {
    const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
    const valueName = "tableContent";
    if (range[0] !== 0) {
      previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
      map3.add(range[0], 0, [["exit", previousCell, context]]);
    }
    const now = getPoint(context.events, range[1]);
    previousCell = {
      type: groupName,
      start: Object.assign({}, now),
      // Note: correct end is set later.
      end: Object.assign({}, now)
    };
    map3.add(range[1], 0, [["enter", previousCell, context]]);
    if (range[2] !== 0) {
      const relatedStart = getPoint(context.events, range[2]);
      const relatedEnd = getPoint(context.events, range[3]);
      const valueToken = {
        type: valueName,
        start: Object.assign({}, relatedStart),
        end: Object.assign({}, relatedEnd)
      };
      map3.add(range[2], 0, [["enter", valueToken, context]]);
      if (rowKind !== 2) {
        const start2 = context.events[range[2]];
        const end = context.events[range[3]];
        start2[1].end = Object.assign({}, end[1].end);
        start2[1].type = "chunkText";
        start2[1].contentType = "text";
        if (range[3] > range[2] + 1) {
          const a = range[2] + 1;
          const b = range[3] - range[2] - 1;
          map3.add(a, b, []);
        }
      }
      map3.add(range[3] + 1, 0, [["exit", valueToken, context]]);
    }
    if (rowEnd !== void 0) {
      previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
      map3.add(rowEnd, 0, [["exit", previousCell, context]]);
      previousCell = void 0;
    }
    return previousCell;
  }
  function flushTableEnd(map3, context, index2, table2, tableBody) {
    const exits = [];
    const related = getPoint(context.events, index2);
    if (tableBody) {
      tableBody.end = Object.assign({}, related);
      exits.push(["exit", tableBody, context]);
    }
    table2.end = Object.assign({}, related);
    exits.push(["exit", table2, context]);
    map3.add(index2 + 1, 0, exits);
  }
  function getPoint(events, index2) {
    const event = events[index2];
    const side = event[0] === "enter" ? "start" : "end";
    return event[1][side];
  }

  // node_modules/micromark-extension-gfm-task-list-item/index.js
  init_define_import_meta_env();

  // node_modules/micromark-extension-gfm-task-list-item/lib/syntax.js
  init_define_import_meta_env();
  var tasklistCheck = {
    name: "tasklistCheck",
    tokenize: tokenizeTasklistCheck
  };
  function gfmTaskListItem() {
    return {
      text: {
        [91]: tasklistCheck
      }
    };
  }
  function tokenizeTasklistCheck(effects, ok3, nok) {
    const self2 = this;
    return open;
    function open(code4) {
      if (
        // Exit if there’s stuff before.
        self2.previous !== null || // Exit if not in the first content that is the first child of a list
        // item.
        !self2._gfmTasklistFirstContentOfListItem
      ) {
        return nok(code4);
      }
      effects.enter("taskListCheck");
      effects.enter("taskListCheckMarker");
      effects.consume(code4);
      effects.exit("taskListCheckMarker");
      return inside;
    }
    function inside(code4) {
      if (markdownLineEndingOrSpace(code4)) {
        effects.enter("taskListCheckValueUnchecked");
        effects.consume(code4);
        effects.exit("taskListCheckValueUnchecked");
        return close;
      }
      if (code4 === 88 || code4 === 120) {
        effects.enter("taskListCheckValueChecked");
        effects.consume(code4);
        effects.exit("taskListCheckValueChecked");
        return close;
      }
      return nok(code4);
    }
    function close(code4) {
      if (code4 === 93) {
        effects.enter("taskListCheckMarker");
        effects.consume(code4);
        effects.exit("taskListCheckMarker");
        effects.exit("taskListCheck");
        return after;
      }
      return nok(code4);
    }
    function after(code4) {
      if (markdownLineEnding(code4)) {
        return ok3(code4);
      }
      if (markdownSpace(code4)) {
        return effects.check({
          tokenize: spaceThenNonSpace
        }, ok3, nok)(code4);
      }
      return nok(code4);
    }
  }
  function spaceThenNonSpace(effects, ok3, nok) {
    return factorySpace(effects, after, "whitespace");
    function after(code4) {
      return code4 === null ? nok(code4) : ok3(code4);
    }
  }

  // node_modules/micromark-extension-gfm/index.js
  function gfm(options) {
    return combineExtensions([
      gfmAutolinkLiteral(),
      gfmFootnote(),
      gfmStrikethrough(options),
      gfmTable(),
      gfmTaskListItem()
    ]);
  }

  // node_modules/remark-gfm/lib/index.js
  var emptyOptions4 = {};
  function remarkGfm(options) {
    const self2 = (
      /** @type {Processor<Root>} */
      this
    );
    const settings = options || emptyOptions4;
    const data = self2.data();
    const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
    const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
    const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
    micromarkExtensions.push(gfm(settings));
    fromMarkdownExtensions.push(gfmFromMarkdown());
    toMarkdownExtensions.push(gfmToMarkdown(settings));
  }

  // components/markdown.tsx
  var import_jsx_runtime4 = __toESM(require_react_shim());
  function Markdown2({ children, className }) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: cn("prose-basic", className), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Markdown, { remarkPlugins: [remarkGfm], children }) });
  }

  // components/recorder.tsx
  init_define_import_meta_env();
  var import_react3 = __toESM(require_react_shim());
  var import_jsx_runtime5 = __toESM(require_react_shim());
  function scoreColor(score) {
    if (score >= 85) return "text-olive";
    if (score >= 60) return "text-terra";
    return "text-terra-dark";
  }
  function Recorder({
    mode,
    target,
    prompt,
    autoStart = false
  }) {
    const recRef = (0, import_react3.useRef)(null);
    const chunksRef = (0, import_react3.useRef)([]);
    const autoStartedRef = (0, import_react3.useRef)(false);
    const [status, setStatus] = (0, import_react3.useState)("idle");
    const [result, setResult] = (0, import_react3.useState)(null);
    const [errorMsg, setErrorMsg] = (0, import_react3.useState)(null);
    async function start2() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        chunksRef.current = [];
        rec.ondataavailable = (e) => chunksRef.current.push(e.data);
        rec.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          setStatus("processing");
          const blob = new Blob(chunksRef.current, { type: rec.mimeType });
          const form = new FormData();
          form.append("audio", blob, "audio.webm");
          form.append("mode", mode);
          if (target) form.append("target", target);
          if (prompt) form.append("prompt", prompt);
          try {
            const res = await fetch("/api/stt", { method: "POST", body: form });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setResult(data);
            setStatus("done");
          } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : "Falhou.");
            setStatus("error");
          }
        };
        rec.start();
        recRef.current = rec;
        setStatus("recording");
        setResult(null);
      } catch {
        setErrorMsg("Sem acesso ao microfone \u2014 verifica as permiss\xF5es.");
        setStatus("error");
      }
    }
    function stop() {
      recRef.current?.stop();
    }
    (0, import_react3.useEffect)(() => {
      if (autoStart && !autoStartedRef.current) {
        autoStartedRef.current = true;
        start2();
      }
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-2", children: [
        status === "recording" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "btn-terra animate-pulse", onClick: stop, children: "\u23F9 Parar" }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            className: "btn-primary",
            onClick: start2,
            disabled: status === "processing",
            children: status === "processing" ? "A ouvir-te\u2026" : result ? "\u{1F399}\uFE0F Gravar outra vez" : "\u{1F399}\uFE0F Gravar"
          }
        ),
        status === "recording" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-xs text-terra", children: "a gravar\u2026 fala!" }) : null
      ] }),
      status === "error" && errorMsg ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark", children: errorMsg }) : null,
      result ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-2", children: [
        result.pron ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-4 rounded-xl border border-sand bg-white/70 px-4 py-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "text-center", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "div",
                {
                  className: cn(
                    "font-display text-4xl leading-none font-bold",
                    scoreColor(result.pron.score)
                  ),
                  children: result.pron.score
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "text-2xs text-ink-faint", children: "/100 pron\xFAncia" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "flex flex-1 flex-wrap gap-x-1.5 gap-y-1 font-display text-lg", children: result.pron.words.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "span",
              {
                title: w.status === "close" ? `A Sandra ouviu \u201C${w.heard}\u201D` : w.status === "missed" ? "N\xE3o ouvido" : void 0,
                className: cn(
                  "rounded px-0.5",
                  w.status === "ok" && "text-olive",
                  w.status === "close" && "bg-azul-pale text-azul underline decoration-dotted",
                  w.status === "missed" && "bg-terra-pale text-terra-dark"
                ),
                children: w.word
              },
              i
            )) })
          ] }),
          result.pron.words.some((w) => w.status === "close") ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-xs text-ink-faint", children: "Azul tracejado = quase \u2014 toca na palavra para ver o que a Sandra ouviu." }) : null,
          result.tips?.length ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ul", { className: "space-y-1.5", children: result.tips.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            "li",
            {
              className: "rounded-xl bg-azul-pale px-3 py-2 text-sm text-azul",
              children: [
                "\u{1F4A1} ",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Markdown2, { className: "inline text-[14px]", children: t })
              ]
            },
            i
          )) }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-2xs text-ink-faint", children: "Estimativa a partir do reconhecimento de voz \u2014 mede se foste percebido, palavra a palavra." })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "rounded-xl border border-sand bg-cream/60 px-3 py-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "text-2xs font-semibold tracking-wide text-ink-faint uppercase", children: "O que a Sandra ouviu" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-[15px]", children: result.transcript || "\u2014" })
        ] }),
        result.feedbackMd ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex gap-2 rounded-xl bg-sage-pale/60 px-3 py-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { "aria-hidden": true, children: "\u{1F469}\u200D\u{1F3EB}" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Markdown2, { className: "text-[14px]", children: result.feedbackMd })
        ] }) : null
      ] }) : null
    ] });
  }

  // components/verb-conjugator.tsx
  init_define_import_meta_env();
  var import_react4 = __toESM(require_react_shim());

  // lib/verb-filter.ts
  init_define_import_meta_env();

  // lib/verbs.ts
  init_define_import_meta_env();
  var TENSE_LABEL = {
    presente: "Presente",
    perfeito: "Pret\xE9rito perfeito",
    imperfeito: "Pret\xE9rito imperfeito",
    futuro: "Futuro",
    conjuntivo: "Conjuntivo (presente)",
    imperativo: "Imperativo"
  };
  var PERSONS = ["eu", "tu", "ele/ela", "n\xF3s", "eles/elas"];
  var IMPERATIVE_PERSONS = ["\u2014", "tu", "voc\xEA", "n\xF3s", "voc\xEAs"];
  function personLabel(tense, i) {
    return tense === "imperativo" ? IMPERATIVE_PERSONS[i] : PERSONS[i];
  }
  var VERBS = [
    { inf: "ser", en: "to be (permanent)", forms: { presente: ["sou", "\xE9s", "\xE9", "somos", "s\xE3o"], perfeito: ["fui", "foste", "foi", "fomos", "foram"], imperfeito: ["era", "eras", "era", "\xE9ramos", "eram"], conjuntivo: ["seja", "sejas", "seja", "sejamos", "sejam"], futuro: ["serei", "ser\xE1s", "ser\xE1", "seremos", "ser\xE3o"], imperativo: [null, "s\xEA", "seja", "sejamos", "sejam"] } },
    { inf: "estar", en: "to be (state)", forms: { presente: ["estou", "est\xE1s", "est\xE1", "estamos", "est\xE3o"], perfeito: ["estive", "estiveste", "esteve", "estivemos", "estiveram"], imperfeito: ["estava", "estavas", "estava", "est\xE1vamos", "estavam"], conjuntivo: ["esteja", "estejas", "esteja", "estejamos", "estejam"], futuro: ["estarei", "estar\xE1s", "estar\xE1", "estaremos", "estar\xE3o"], imperativo: [null, "est\xE1", "esteja", "estejamos", "estejam"] } },
    { inf: "ter", en: "to have", forms: { presente: ["tenho", "tens", "tem", "temos", "t\xEAm"], perfeito: ["tive", "tiveste", "teve", "tivemos", "tiveram"], imperfeito: ["tinha", "tinhas", "tinha", "t\xEDnhamos", "tinham"], conjuntivo: ["tenha", "tenhas", "tenha", "tenhamos", "tenham"], futuro: ["terei", "ter\xE1s", "ter\xE1", "teremos", "ter\xE3o"], imperativo: [null, "tem", "tenha", "tenhamos", "tenham"] } },
    { inf: "ir", en: "to go", forms: { presente: ["vou", "vais", "vai", "vamos", "v\xE3o"], perfeito: ["fui", "foste", "foi", "fomos", "foram"], imperfeito: ["ia", "ias", "ia", "\xEDamos", "iam"], conjuntivo: ["v\xE1", "v\xE1s", "v\xE1", "vamos", "v\xE3o"], futuro: ["irei", "ir\xE1s", "ir\xE1", "iremos", "ir\xE3o"], imperativo: [null, "vai", "v\xE1", "vamos", "v\xE3o"] } },
    { inf: "fazer", en: "to do / make", forms: { presente: ["fa\xE7o", "fazes", "faz", "fazemos", "fazem"], perfeito: ["fiz", "fizeste", "fez", "fizemos", "fizeram"], imperfeito: ["fazia", "fazias", "fazia", "faz\xEDamos", "faziam"], conjuntivo: ["fa\xE7a", "fa\xE7as", "fa\xE7a", "fa\xE7amos", "fa\xE7am"], futuro: ["farei", "far\xE1s", "far\xE1", "faremos", "far\xE3o"], imperativo: [null, "faz", "fa\xE7a", "fa\xE7amos", "fa\xE7am"] } },
    { inf: "poder", en: "to be able to", forms: { presente: ["posso", "podes", "pode", "podemos", "podem"], perfeito: ["pude", "pudeste", "p\xF4de", "pudemos", "puderam"], imperfeito: ["podia", "podias", "podia", "pod\xEDamos", "podiam"], conjuntivo: ["possa", "possas", "possa", "possamos", "possam"], futuro: ["poderei", "poder\xE1s", "poder\xE1", "poderemos", "poder\xE3o"] } },
    { inf: "querer", en: "to want", forms: { presente: ["quero", "queres", "quer", "queremos", "querem"], perfeito: ["quis", "quiseste", "quis", "quisemos", "quiseram"], imperfeito: ["queria", "querias", "queria", "quer\xEDamos", "queriam"], conjuntivo: ["queira", "queiras", "queira", "queiramos", "queiram"], futuro: ["quererei", "querer\xE1s", "querer\xE1", "quereremos", "querer\xE3o"] } },
    { inf: "dizer", en: "to say", forms: { presente: ["digo", "dizes", "diz", "dizemos", "dizem"], perfeito: ["disse", "disseste", "disse", "dissemos", "disseram"], imperfeito: ["dizia", "dizias", "dizia", "diz\xEDamos", "diziam"], conjuntivo: ["diga", "digas", "diga", "digamos", "digam"], futuro: ["direi", "dir\xE1s", "dir\xE1", "diremos", "dir\xE3o"], imperativo: [null, "diz", "diga", "digamos", "digam"] } },
    { inf: "ver", en: "to see", forms: { presente: ["vejo", "v\xEAs", "v\xEA", "vemos", "veem"], perfeito: ["vi", "viste", "viu", "vimos", "viram"], imperfeito: ["via", "vias", "via", "v\xEDamos", "viam"], conjuntivo: ["veja", "vejas", "veja", "vejamos", "vejam"], futuro: ["verei", "ver\xE1s", "ver\xE1", "veremos", "ver\xE3o"], imperativo: [null, "v\xEA", "veja", "vejamos", "vejam"] } },
    { inf: "vir", en: "to come", forms: { presente: ["venho", "vens", "vem", "vimos", "v\xEAm"], perfeito: ["vim", "vieste", "veio", "viemos", "vieram"], imperfeito: ["vinha", "vinhas", "vinha", "v\xEDnhamos", "vinham"], conjuntivo: ["venha", "venhas", "venha", "venhamos", "venham"], futuro: ["virei", "vir\xE1s", "vir\xE1", "viremos", "vir\xE3o"], imperativo: [null, "vem", "venha", "venhamos", "venham"] } },
    { inf: "dar", en: "to give", forms: { presente: ["dou", "d\xE1s", "d\xE1", "damos", "d\xE3o"], perfeito: ["dei", "deste", "deu", "demos", "deram"], imperfeito: ["dava", "davas", "dava", "d\xE1vamos", "davam"], conjuntivo: ["d\xEA", "d\xEAs", "d\xEA", "demos", "deem"], futuro: ["darei", "dar\xE1s", "dar\xE1", "daremos", "dar\xE3o"], imperativo: [null, "d\xE1", "d\xEA", "demos", "deem"] } },
    { inf: "saber", en: "to know (facts)", forms: { presente: ["sei", "sabes", "sabe", "sabemos", "sabem"], perfeito: ["soube", "soubeste", "soube", "soubemos", "souberam"], imperfeito: ["sabia", "sabias", "sabia", "sab\xEDamos", "sabiam"], conjuntivo: ["saiba", "saibas", "saiba", "saibamos", "saibam"], futuro: ["saberei", "saber\xE1s", "saber\xE1", "saberemos", "saber\xE3o"], imperativo: [null, "sabe", "saiba", "saibamos", "saibam"] } },
    { inf: "p\xF4r", en: "to put", forms: { presente: ["ponho", "p\xF5es", "p\xF5e", "pomos", "p\xF5em"], perfeito: ["pus", "puseste", "p\xF4s", "pusemos", "puseram"], imperfeito: ["punha", "punhas", "punha", "p\xFAnhamos", "punham"], conjuntivo: ["ponha", "ponhas", "ponha", "ponhamos", "ponham"], futuro: ["porei", "por\xE1s", "por\xE1", "poremos", "por\xE3o"], imperativo: [null, "p\xF5e", "ponha", "ponhamos", "ponham"] } },
    { inf: "trazer", en: "to bring", forms: { presente: ["trago", "trazes", "traz", "trazemos", "trazem"], perfeito: ["trouxe", "trouxeste", "trouxe", "trouxemos", "trouxeram"], imperfeito: ["trazia", "trazias", "trazia", "traz\xEDamos", "traziam"], futuro: ["trarei", "trar\xE1s", "trar\xE1", "traremos", "trar\xE3o"], imperativo: [null, "traz", "traga", "tragamos", "tragam"] } },
    { inf: "ler", en: "to read", forms: { presente: ["leio", "l\xEAs", "l\xEA", "lemos", "leem"], perfeito: ["li", "leste", "leu", "lemos", "leram"], imperfeito: ["lia", "lias", "lia", "l\xEDamos", "liam"], futuro: ["lerei", "ler\xE1s", "ler\xE1", "leremos", "ler\xE3o"], imperativo: [null, "l\xEA", "leia", "leiamos", "leiam"] } },
    { inf: "ouvir", en: "to hear", forms: { presente: ["ou\xE7o", "ouves", "ouve", "ouvimos", "ouvem"], perfeito: ["ouvi", "ouviste", "ouviu", "ouvimos", "ouviram"], imperfeito: ["ouvia", "ouvias", "ouvia", "ouv\xEDamos", "ouviam"], futuro: ["ouvirei", "ouvir\xE1s", "ouvir\xE1", "ouviremos", "ouvir\xE3o"], imperativo: [null, "ouve", "ou\xE7a", "ou\xE7amos", "ou\xE7am"] } },
    { inf: "pedir", en: "to ask for", forms: { presente: ["pe\xE7o", "pedes", "pede", "pedimos", "pedem"], perfeito: ["pedi", "pediste", "pediu", "pedimos", "pediram"], imperfeito: ["pedia", "pedias", "pedia", "ped\xEDamos", "pediam"], futuro: ["pedirei", "pedir\xE1s", "pedir\xE1", "pediremos", "pedir\xE3o"], imperativo: [null, "pede", "pe\xE7a", "pe\xE7amos", "pe\xE7am"] } },
    { inf: "dormir", en: "to sleep", forms: { presente: ["durmo", "dormes", "dorme", "dormimos", "dormem"], perfeito: ["dormi", "dormiste", "dormiu", "dormimos", "dormiram"], imperfeito: ["dormia", "dormias", "dormia", "dorm\xEDamos", "dormiam"], futuro: ["dormirei", "dormir\xE1s", "dormir\xE1", "dormiremos", "dormir\xE3o"], imperativo: [null, "dorme", "durma", "durmamos", "durmam"] } },
    { inf: "sair", en: "to go out / leave", forms: { presente: ["saio", "sais", "sai", "sa\xEDmos", "saem"], perfeito: ["sa\xED", "sa\xEDste", "saiu", "sa\xEDmos", "sa\xEDram"], imperfeito: ["sa\xEDa", "sa\xEDas", "sa\xEDa", "sa\xEDamos", "sa\xEDam"], futuro: ["sairei", "sair\xE1s", "sair\xE1", "sairemos", "sair\xE3o"], imperativo: [null, "sai", "saia", "saiamos", "saiam"] } },
    { inf: "ficar", en: "to stay / become", forms: { presente: ["fico", "ficas", "fica", "ficamos", "ficam"], perfeito: ["fiquei", "ficaste", "ficou", "fic\xE1mos", "ficaram"], imperfeito: ["ficava", "ficavas", "ficava", "fic\xE1vamos", "ficavam"], futuro: ["ficarei", "ficar\xE1s", "ficar\xE1", "ficaremos", "ficar\xE3o"], imperativo: [null, "fica", "fique", "fiquemos", "fiquem"] } },
    { inf: "come\xE7ar", en: "to begin", forms: { presente: ["come\xE7o", "come\xE7as", "come\xE7a", "come\xE7amos", "come\xE7am"], perfeito: ["comecei", "come\xE7aste", "come\xE7ou", "come\xE7\xE1mos", "come\xE7aram"], imperfeito: ["come\xE7ava", "come\xE7avas", "come\xE7ava", "come\xE7\xE1vamos", "come\xE7avam"], futuro: ["come\xE7arei", "come\xE7ar\xE1s", "come\xE7ar\xE1", "come\xE7aremos", "come\xE7ar\xE3o"], imperativo: [null, "come\xE7a", "comece", "comecemos", "comecem"] } },
    { inf: "chegar", en: "to arrive", forms: { presente: ["chego", "chegas", "chega", "chegamos", "chegam"], perfeito: ["cheguei", "chegaste", "chegou", "cheg\xE1mos", "chegaram"], imperfeito: ["chegava", "chegavas", "chegava", "cheg\xE1vamos", "chegavam"], futuro: ["chegarei", "chegar\xE1s", "chegar\xE1", "chegaremos", "chegar\xE3o"], imperativo: [null, "chega", "chegue", "cheguemos", "cheguem"] } },
    { inf: "falar", en: "to speak", forms: { presente: ["falo", "falas", "fala", "falamos", "falam"], perfeito: ["falei", "falaste", "falou", "fal\xE1mos", "falaram"], imperfeito: ["falava", "falavas", "falava", "fal\xE1vamos", "falavam"], futuro: ["falarei", "falar\xE1s", "falar\xE1", "falaremos", "falar\xE3o"], imperativo: [null, "fala", "fale", "falemos", "falem"] } },
    { inf: "comer", en: "to eat", forms: { presente: ["como", "comes", "come", "comemos", "comem"], perfeito: ["comi", "comeste", "comeu", "comemos", "comeram"], imperfeito: ["comia", "comias", "comia", "com\xEDamos", "comiam"], futuro: ["comerei", "comer\xE1s", "comer\xE1", "comeremos", "comer\xE3o"], imperativo: [null, "come", "coma", "comamos", "comam"] } },
    { inf: "abrir", en: "to open", forms: { presente: ["abro", "abres", "abre", "abrimos", "abrem"], perfeito: ["abri", "abriste", "abriu", "abrimos", "abriram"], imperfeito: ["abria", "abrias", "abria", "abr\xEDamos", "abriam"], futuro: ["abrirei", "abrir\xE1s", "abrir\xE1", "abriremos", "abrir\xE3o"], imperativo: [null, "abre", "abra", "abramos", "abram"] } },
    { inf: "gostar", en: "to like", forms: { presente: ["gosto", "gostas", "gosta", "gostamos", "gostam"], perfeito: ["gostei", "gostaste", "gostou", "gost\xE1mos", "gostaram"], imperfeito: ["gostava", "gostavas", "gostava", "gost\xE1vamos", "gostavam"], futuro: ["gostarei", "gostar\xE1s", "gostar\xE1", "gostaremos", "gostar\xE3o"] } },
    { inf: "precisar", en: "to need", forms: { presente: ["preciso", "precisas", "precisa", "precisamos", "precisam"], perfeito: ["precisei", "precisaste", "precisou", "precis\xE1mos", "precisaram"], imperfeito: ["precisava", "precisavas", "precisava", "precis\xE1vamos", "precisavam"], futuro: ["precisarei", "precisar\xE1s", "precisar\xE1", "precisaremos", "precisar\xE3o"] } },
    { inf: "conhecer", en: "to know (people/places)", forms: { presente: ["conhe\xE7o", "conheces", "conhece", "conhecemos", "conhecem"], perfeito: ["conheci", "conheceste", "conheceu", "conhecemos", "conheceram"], imperfeito: ["conhecia", "conhecias", "conhecia", "conhec\xEDamos", "conheciam"], futuro: ["conhecerei", "conhecer\xE1s", "conhecer\xE1", "conheceremos", "conhecer\xE3o"], imperativo: [null, "conhece", "conhe\xE7a", "conhe\xE7amos", "conhe\xE7am"] } },
    { inf: "escrever", en: "to write", forms: { presente: ["escrevo", "escreves", "escreve", "escrevemos", "escrevem"], perfeito: ["escrevi", "escreveste", "escreveu", "escrevemos", "escreveram"], imperfeito: ["escrevia", "escrevias", "escrevia", "escrev\xEDamos", "escreviam"], futuro: ["escreverei", "escrever\xE1s", "escrever\xE1", "escreveremos", "escrever\xE3o"], imperativo: [null, "escreve", "escreva", "escrevamos", "escrevam"] } },
    { inf: "comprar", en: "to buy", forms: { presente: ["compro", "compras", "compra", "compramos", "compram"], perfeito: ["comprei", "compraste", "comprou", "compr\xE1mos", "compraram"], imperfeito: ["comprava", "compravas", "comprava", "compr\xE1vamos", "compravam"], futuro: ["comprarei", "comprar\xE1s", "comprar\xE1", "compraremos", "comprar\xE3o"], imperativo: [null, "compra", "compre", "compremos", "comprem"] } },
    // ── Verbos regulares em -ar ────────────────────────────────────────────────
    // Reminder: EP perfeito nós takes the accent (andámos), and -car/-gar/-çar
    // shift spelling in the eu form (brinquei, joguei, almocei).
    { inf: "achar", en: "to think / to find", forms: { presente: ["acho", "achas", "acha", "achamos", "acham"], perfeito: ["achei", "achaste", "achou", "ach\xE1mos", "acharam"], imperfeito: ["achava", "achavas", "achava", "ach\xE1vamos", "achavam"], futuro: ["acharei", "achar\xE1s", "achar\xE1", "acharemos", "achar\xE3o"], imperativo: [null, "acha", "ache", "achemos", "achem"] } },
    { inf: "acabar", en: "to finish", forms: { presente: ["acabo", "acabas", "acaba", "acabamos", "acabam"], perfeito: ["acabei", "acabaste", "acabou", "acab\xE1mos", "acabaram"], imperfeito: ["acabava", "acabavas", "acabava", "acab\xE1vamos", "acabavam"], futuro: ["acabarei", "acabar\xE1s", "acabar\xE1", "acabaremos", "acabar\xE3o"], imperativo: [null, "acaba", "acabe", "acabemos", "acabem"] } },
    { inf: "acordar", en: "to wake up", forms: { presente: ["acordo", "acordas", "acorda", "acordamos", "acordam"], perfeito: ["acordei", "acordaste", "acordou", "acord\xE1mos", "acordaram"], imperfeito: ["acordava", "acordavas", "acordava", "acord\xE1vamos", "acordavam"], futuro: ["acordarei", "acordar\xE1s", "acordar\xE1", "acordaremos", "acordar\xE3o"], imperativo: [null, "acorda", "acorde", "acordemos", "acordem"] } },
    { inf: "ajudar", en: "to help", forms: { presente: ["ajudo", "ajudas", "ajuda", "ajudamos", "ajudam"], perfeito: ["ajudei", "ajudaste", "ajudou", "ajud\xE1mos", "ajudaram"], imperfeito: ["ajudava", "ajudavas", "ajudava", "ajud\xE1vamos", "ajudavam"], futuro: ["ajudarei", "ajudar\xE1s", "ajudar\xE1", "ajudaremos", "ajudar\xE3o"], imperativo: [null, "ajuda", "ajude", "ajudemos", "ajudem"] } },
    { inf: "almo\xE7ar", en: "to have lunch", forms: { presente: ["almo\xE7o", "almo\xE7as", "almo\xE7a", "almo\xE7amos", "almo\xE7am"], perfeito: ["almocei", "almo\xE7aste", "almo\xE7ou", "almo\xE7\xE1mos", "almo\xE7aram"], imperfeito: ["almo\xE7ava", "almo\xE7avas", "almo\xE7ava", "almo\xE7\xE1vamos", "almo\xE7avam"], futuro: ["almo\xE7arei", "almo\xE7ar\xE1s", "almo\xE7ar\xE1", "almo\xE7aremos", "almo\xE7ar\xE3o"], imperativo: [null, "almo\xE7a", "almoce", "almocemos", "almocem"] } },
    { inf: "andar", en: "to walk / to go about", forms: { presente: ["ando", "andas", "anda", "andamos", "andam"], perfeito: ["andei", "andaste", "andou", "and\xE1mos", "andaram"], imperfeito: ["andava", "andavas", "andava", "and\xE1vamos", "andavam"], futuro: ["andarei", "andar\xE1s", "andar\xE1", "andaremos", "andar\xE3o"], imperativo: [null, "anda", "ande", "andemos", "andem"] } },
    { inf: "apanhar", en: "to catch / to pick up", forms: { presente: ["apanho", "apanhas", "apanha", "apanhamos", "apanham"], perfeito: ["apanhei", "apanhaste", "apanhou", "apanh\xE1mos", "apanharam"], imperfeito: ["apanhava", "apanhavas", "apanhava", "apanh\xE1vamos", "apanhavam"], futuro: ["apanharei", "apanhar\xE1s", "apanhar\xE1", "apanharemos", "apanhar\xE3o"], imperativo: [null, "apanha", "apanhe", "apanhemos", "apanhem"] } },
    { inf: "arranjar", en: "to get / to fix", forms: { presente: ["arranjo", "arranjas", "arranja", "arranjamos", "arranjam"], perfeito: ["arranjei", "arranjaste", "arranjou", "arranj\xE1mos", "arranjaram"], imperfeito: ["arranjava", "arranjavas", "arranjava", "arranj\xE1vamos", "arranjavam"], futuro: ["arranjarei", "arranjar\xE1s", "arranjar\xE1", "arranjaremos", "arranjar\xE3o"], imperativo: [null, "arranja", "arranje", "arranjemos", "arranjem"] } },
    { inf: "arrumar", en: "to tidy up", forms: { presente: ["arrumo", "arrumas", "arruma", "arrumamos", "arrumam"], perfeito: ["arrumei", "arrumaste", "arrumou", "arrum\xE1mos", "arrumaram"], imperfeito: ["arrumava", "arrumavas", "arrumava", "arrum\xE1vamos", "arrumavam"], futuro: ["arrumarei", "arrumar\xE1s", "arrumar\xE1", "arrumaremos", "arrumar\xE3o"], imperativo: [null, "arruma", "arrume", "arrumemos", "arrumem"] } },
    { inf: "brincar", en: "to play (children)", forms: { presente: ["brinco", "brincas", "brinca", "brincamos", "brincam"], perfeito: ["brinquei", "brincaste", "brincou", "brinc\xE1mos", "brincaram"], imperfeito: ["brincava", "brincavas", "brincava", "brinc\xE1vamos", "brincavam"], futuro: ["brincarei", "brincar\xE1s", "brincar\xE1", "brincaremos", "brincar\xE3o"], imperativo: [null, "brinca", "brinque", "brinquemos", "brinquem"] } },
    { inf: "chamar", en: "to call / to be named", forms: { presente: ["chamo", "chamas", "chama", "chamamos", "chamam"], perfeito: ["chamei", "chamaste", "chamou", "cham\xE1mos", "chamaram"], imperfeito: ["chamava", "chamavas", "chamava", "cham\xE1vamos", "chamavam"], futuro: ["chamarei", "chamar\xE1s", "chamar\xE1", "chamaremos", "chamar\xE3o"], imperativo: [null, "chama", "chame", "chamemos", "chamem"] } },
    { inf: "contar", en: "to count / to tell", forms: { presente: ["conto", "contas", "conta", "contamos", "contam"], perfeito: ["contei", "contaste", "contou", "cont\xE1mos", "contaram"], imperfeito: ["contava", "contavas", "contava", "cont\xE1vamos", "contavam"], futuro: ["contarei", "contar\xE1s", "contar\xE1", "contaremos", "contar\xE3o"], imperativo: [null, "conta", "conte", "contemos", "contem"] } },
    { inf: "cozinhar", en: "to cook", forms: { presente: ["cozinho", "cozinhas", "cozinha", "cozinhamos", "cozinham"], perfeito: ["cozinhei", "cozinhaste", "cozinhou", "cozinh\xE1mos", "cozinharam"], imperfeito: ["cozinhava", "cozinhavas", "cozinhava", "cozinh\xE1vamos", "cozinhavam"], futuro: ["cozinharei", "cozinhar\xE1s", "cozinhar\xE1", "cozinharemos", "cozinhar\xE3o"], imperativo: [null, "cozinha", "cozinhe", "cozinhemos", "cozinhem"] } },
    { inf: "deixar", en: "to leave / to let", forms: { presente: ["deixo", "deixas", "deixa", "deixamos", "deixam"], perfeito: ["deixei", "deixaste", "deixou", "deix\xE1mos", "deixaram"], imperfeito: ["deixava", "deixavas", "deixava", "deix\xE1vamos", "deixavam"], futuro: ["deixarei", "deixar\xE1s", "deixar\xE1", "deixaremos", "deixar\xE3o"], imperativo: [null, "deixa", "deixe", "deixemos", "deixem"] } },
    { inf: "encontrar", en: "to find / to meet", forms: { presente: ["encontro", "encontras", "encontra", "encontramos", "encontram"], perfeito: ["encontrei", "encontraste", "encontrou", "encontr\xE1mos", "encontraram"], imperfeito: ["encontrava", "encontravas", "encontrava", "encontr\xE1vamos", "encontravam"], futuro: ["encontrarei", "encontrar\xE1s", "encontrar\xE1", "encontraremos", "encontrar\xE3o"], imperativo: [null, "encontra", "encontre", "encontremos", "encontrem"] } },
    { inf: "ensinar", en: "to teach", forms: { presente: ["ensino", "ensinas", "ensina", "ensinamos", "ensinam"], perfeito: ["ensinei", "ensinaste", "ensinou", "ensin\xE1mos", "ensinaram"], imperfeito: ["ensinava", "ensinavas", "ensinava", "ensin\xE1vamos", "ensinavam"], futuro: ["ensinarei", "ensinar\xE1s", "ensinar\xE1", "ensinaremos", "ensinar\xE3o"], imperativo: [null, "ensina", "ensine", "ensinemos", "ensinem"] } },
    { inf: "entrar", en: "to enter / to come in", forms: { presente: ["entro", "entras", "entra", "entramos", "entram"], perfeito: ["entrei", "entraste", "entrou", "entr\xE1mos", "entraram"], imperfeito: ["entrava", "entravas", "entrava", "entr\xE1vamos", "entravam"], futuro: ["entrarei", "entrar\xE1s", "entrar\xE1", "entraremos", "entrar\xE3o"], imperativo: [null, "entra", "entre", "entremos", "entrem"] } },
    { inf: "esperar", en: "to wait / to hope", forms: { presente: ["espero", "esperas", "espera", "esperamos", "esperam"], perfeito: ["esperei", "esperaste", "esperou", "esper\xE1mos", "esperaram"], imperfeito: ["esperava", "esperavas", "esperava", "esper\xE1vamos", "esperavam"], futuro: ["esperarei", "esperar\xE1s", "esperar\xE1", "esperaremos", "esperar\xE3o"], imperativo: [null, "espera", "espere", "esperemos", "esperem"] } },
    { inf: "estudar", en: "to study", forms: { presente: ["estudo", "estudas", "estuda", "estudamos", "estudam"], perfeito: ["estudei", "estudaste", "estudou", "estud\xE1mos", "estudaram"], imperfeito: ["estudava", "estudavas", "estudava", "estud\xE1vamos", "estudavam"], futuro: ["estudarei", "estudar\xE1s", "estudar\xE1", "estudaremos", "estudar\xE3o"], imperativo: [null, "estuda", "estude", "estudemos", "estudem"] } },
    { inf: "jantar", en: "to have dinner", forms: { presente: ["janto", "jantas", "janta", "jantamos", "jantam"], perfeito: ["jantei", "jantaste", "jantou", "jant\xE1mos", "jantaram"], imperfeito: ["jantava", "jantavas", "jantava", "jant\xE1vamos", "jantavam"], futuro: ["jantarei", "jantar\xE1s", "jantar\xE1", "jantaremos", "jantar\xE3o"], imperativo: [null, "janta", "jante", "jantemos", "jantem"] } },
    { inf: "jogar", en: "to play (a game)", forms: { presente: ["jogo", "jogas", "joga", "jogamos", "jogam"], perfeito: ["joguei", "jogaste", "jogou", "jog\xE1mos", "jogaram"], imperfeito: ["jogava", "jogavas", "jogava", "jog\xE1vamos", "jogavam"], futuro: ["jogarei", "jogar\xE1s", "jogar\xE1", "jogaremos", "jogar\xE3o"], imperativo: [null, "joga", "jogue", "joguemos", "joguem"] } },
    { inf: "lavar", en: "to wash", forms: { presente: ["lavo", "lavas", "lava", "lavamos", "lavam"], perfeito: ["lavei", "lavaste", "lavou", "lav\xE1mos", "lavaram"], imperfeito: ["lavava", "lavavas", "lavava", "lav\xE1vamos", "lavavam"], futuro: ["lavarei", "lavar\xE1s", "lavar\xE1", "lavaremos", "lavar\xE3o"], imperativo: [null, "lava", "lave", "lavemos", "lavem"] } },
    { inf: "lembrar", en: "to remember / to remind", forms: { presente: ["lembro", "lembras", "lembra", "lembramos", "lembram"], perfeito: ["lembrei", "lembraste", "lembrou", "lembr\xE1mos", "lembraram"], imperfeito: ["lembrava", "lembravas", "lembrava", "lembr\xE1vamos", "lembravam"], futuro: ["lembrarei", "lembrar\xE1s", "lembrar\xE1", "lembraremos", "lembrar\xE3o"], imperativo: [null, "lembra", "lembre", "lembremos", "lembrem"] } },
    { inf: "levantar", en: "to lift / to get up", forms: { presente: ["levanto", "levantas", "levanta", "levantamos", "levantam"], perfeito: ["levantei", "levantaste", "levantou", "levant\xE1mos", "levantaram"], imperfeito: ["levantava", "levantavas", "levantava", "levant\xE1vamos", "levantavam"], futuro: ["levantarei", "levantar\xE1s", "levantar\xE1", "levantaremos", "levantar\xE3o"], imperativo: [null, "levanta", "levante", "levantemos", "levantem"] } },
    { inf: "levar", en: "to take / to carry", forms: { presente: ["levo", "levas", "leva", "levamos", "levam"], perfeito: ["levei", "levaste", "levou", "lev\xE1mos", "levaram"], imperfeito: ["levava", "levavas", "levava", "lev\xE1vamos", "levavam"], futuro: ["levarei", "levar\xE1s", "levar\xE1", "levaremos", "levar\xE3o"], imperativo: [null, "leva", "leve", "levemos", "levem"] } },
    { inf: "ligar", en: "to phone / to switch on", forms: { presente: ["ligo", "ligas", "liga", "ligamos", "ligam"], perfeito: ["liguei", "ligaste", "ligou", "lig\xE1mos", "ligaram"], imperfeito: ["ligava", "ligavas", "ligava", "lig\xE1vamos", "ligavam"], futuro: ["ligarei", "ligar\xE1s", "ligar\xE1", "ligaremos", "ligar\xE3o"], imperativo: [null, "liga", "ligue", "liguemos", "liguem"] } },
    { inf: "limpar", en: "to clean", forms: { presente: ["limpo", "limpas", "limpa", "limpamos", "limpam"], perfeito: ["limpei", "limpaste", "limpou", "limp\xE1mos", "limparam"], imperfeito: ["limpava", "limpavas", "limpava", "limp\xE1vamos", "limpavam"], futuro: ["limparei", "limpar\xE1s", "limpar\xE1", "limparemos", "limpar\xE3o"], imperativo: [null, "limpa", "limpe", "limpemos", "limpem"] } },
    { inf: "morar", en: "to live (reside)", forms: { presente: ["moro", "moras", "mora", "moramos", "moram"], perfeito: ["morei", "moraste", "morou", "mor\xE1mos", "moraram"], imperfeito: ["morava", "moravas", "morava", "mor\xE1vamos", "moravam"], futuro: ["morarei", "morar\xE1s", "morar\xE1", "moraremos", "morar\xE3o"], imperativo: [null, "mora", "more", "moremos", "morem"] } },
    { inf: "mostrar", en: "to show", forms: { presente: ["mostro", "mostras", "mostra", "mostramos", "mostram"], perfeito: ["mostrei", "mostraste", "mostrou", "mostr\xE1mos", "mostraram"], imperfeito: ["mostrava", "mostravas", "mostrava", "mostr\xE1vamos", "mostravam"], futuro: ["mostrarei", "mostrar\xE1s", "mostrar\xE1", "mostraremos", "mostrar\xE3o"], imperativo: [null, "mostra", "mostre", "mostremos", "mostrem"] } },
    { inf: "pagar", en: "to pay", forms: { presente: ["pago", "pagas", "paga", "pagamos", "pagam"], perfeito: ["paguei", "pagaste", "pagou", "pag\xE1mos", "pagaram"], imperfeito: ["pagava", "pagavas", "pagava", "pag\xE1vamos", "pagavam"], futuro: ["pagarei", "pagar\xE1s", "pagar\xE1", "pagaremos", "pagar\xE3o"], imperativo: [null, "paga", "pague", "paguemos", "paguem"] } },
    { inf: "passar", en: "to pass / to spend (time)", forms: { presente: ["passo", "passas", "passa", "passamos", "passam"], perfeito: ["passei", "passaste", "passou", "pass\xE1mos", "passaram"], imperfeito: ["passava", "passavas", "passava", "pass\xE1vamos", "passavam"], futuro: ["passarei", "passar\xE1s", "passar\xE1", "passaremos", "passar\xE3o"], imperativo: [null, "passa", "passe", "passemos", "passem"] } },
    { inf: "pensar", en: "to think", forms: { presente: ["penso", "pensas", "pensa", "pensamos", "pensam"], perfeito: ["pensei", "pensaste", "pensou", "pens\xE1mos", "pensaram"], imperfeito: ["pensava", "pensavas", "pensava", "pens\xE1vamos", "pensavam"], futuro: ["pensarei", "pensar\xE1s", "pensar\xE1", "pensaremos", "pensar\xE3o"], imperativo: [null, "pensa", "pense", "pensemos", "pensem"] } },
    { inf: "perguntar", en: "to ask", forms: { presente: ["pergunto", "perguntas", "pergunta", "perguntamos", "perguntam"], perfeito: ["perguntei", "perguntaste", "perguntou", "pergunt\xE1mos", "perguntaram"], imperfeito: ["perguntava", "perguntavas", "perguntava", "pergunt\xE1vamos", "perguntavam"], futuro: ["perguntarei", "perguntar\xE1s", "perguntar\xE1", "perguntaremos", "perguntar\xE3o"], imperativo: [null, "pergunta", "pergunte", "perguntemos", "perguntem"] } },
    { inf: "procurar", en: "to look for", forms: { presente: ["procuro", "procuras", "procura", "procuramos", "procuram"], perfeito: ["procurei", "procuraste", "procurou", "procur\xE1mos", "procuraram"], imperfeito: ["procurava", "procuravas", "procurava", "procur\xE1vamos", "procuravam"], futuro: ["procurarei", "procurar\xE1s", "procurar\xE1", "procuraremos", "procurar\xE3o"], imperativo: [null, "procura", "procure", "procuremos", "procurem"] } },
    { inf: "tirar", en: "to take out / to take (a photo)", forms: { presente: ["tiro", "tiras", "tira", "tiramos", "tiram"], perfeito: ["tirei", "tiraste", "tirou", "tir\xE1mos", "tiraram"], imperfeito: ["tirava", "tiravas", "tirava", "tir\xE1vamos", "tiravam"], futuro: ["tirarei", "tirar\xE1s", "tirar\xE1", "tiraremos", "tirar\xE3o"], imperativo: [null, "tira", "tire", "tiremos", "tirem"] } },
    { inf: "tomar", en: "to take / to drink", forms: { presente: ["tomo", "tomas", "toma", "tomamos", "tomam"], perfeito: ["tomei", "tomaste", "tomou", "tom\xE1mos", "tomaram"], imperfeito: ["tomava", "tomavas", "tomava", "tom\xE1vamos", "tomavam"], futuro: ["tomarei", "tomar\xE1s", "tomar\xE1", "tomaremos", "tomar\xE3o"], imperativo: [null, "toma", "tome", "tomemos", "tomem"] } },
    { inf: "trabalhar", en: "to work", forms: { presente: ["trabalho", "trabalhas", "trabalha", "trabalhamos", "trabalham"], perfeito: ["trabalhei", "trabalhaste", "trabalhou", "trabalh\xE1mos", "trabalharam"], imperfeito: ["trabalhava", "trabalhavas", "trabalhava", "trabalh\xE1vamos", "trabalhavam"], futuro: ["trabalharei", "trabalhar\xE1s", "trabalhar\xE1", "trabalharemos", "trabalhar\xE3o"], imperativo: [null, "trabalha", "trabalhe", "trabalhemos", "trabalhem"] } },
    { inf: "usar", en: "to use / to wear", forms: { presente: ["uso", "usas", "usa", "usamos", "usam"], perfeito: ["usei", "usaste", "usou", "us\xE1mos", "usaram"], imperfeito: ["usava", "usavas", "usava", "us\xE1vamos", "usavam"], futuro: ["usarei", "usar\xE1s", "usar\xE1", "usaremos", "usar\xE3o"], imperativo: [null, "usa", "use", "usemos", "usem"] } },
    { inf: "voltar", en: "to return / to come back", forms: { presente: ["volto", "voltas", "volta", "voltamos", "voltam"], perfeito: ["voltei", "voltaste", "voltou", "volt\xE1mos", "voltaram"], imperfeito: ["voltava", "voltavas", "voltava", "volt\xE1vamos", "voltavam"], futuro: ["voltarei", "voltar\xE1s", "voltar\xE1", "voltaremos", "voltar\xE3o"], imperativo: [null, "volta", "volte", "voltemos", "voltem"] } },
    // ── Verbos em -er ─────────────────────────────────────────────────────────
    // No accent on the perfeito nós here: comemos, bebemos, vendemos.
    { inf: "aprender", en: "to learn", forms: { presente: ["aprendo", "aprendes", "aprende", "aprendemos", "aprendem"], perfeito: ["aprendi", "aprendeste", "aprendeu", "aprendemos", "aprenderam"], imperfeito: ["aprendia", "aprendias", "aprendia", "aprend\xEDamos", "aprendiam"], futuro: ["aprenderei", "aprender\xE1s", "aprender\xE1", "aprenderemos", "aprender\xE3o"], imperativo: [null, "aprende", "aprenda", "aprendamos", "aprendam"] } },
    { inf: "beber", en: "to drink", forms: { presente: ["bebo", "bebes", "bebe", "bebemos", "bebem"], perfeito: ["bebi", "bebeste", "bebeu", "bebemos", "beberam"], imperfeito: ["bebia", "bebias", "bebia", "beb\xEDamos", "bebiam"], futuro: ["beberei", "beber\xE1s", "beber\xE1", "beberemos", "beber\xE3o"], imperativo: [null, "bebe", "beba", "bebamos", "bebam"] } },
    { inf: "caber", en: "to fit", forms: { presente: ["caibo", "cabes", "cabe", "cabemos", "cabem"], perfeito: ["coube", "coubeste", "coube", "coubemos", "couberam"], imperfeito: ["cabia", "cabias", "cabia", "cab\xEDamos", "cabiam"], futuro: ["caberei", "caber\xE1s", "caber\xE1", "caberemos", "caber\xE3o"] } },
    { inf: "correr", en: "to run", forms: { presente: ["corro", "corres", "corre", "corremos", "correm"], perfeito: ["corri", "correste", "correu", "corremos", "correram"], imperfeito: ["corria", "corrias", "corria", "corr\xEDamos", "corriam"], futuro: ["correrei", "correr\xE1s", "correr\xE1", "correremos", "correr\xE3o"], imperativo: [null, "corre", "corra", "corramos", "corram"] } },
    { inf: "crescer", en: "to grow", forms: { presente: ["cres\xE7o", "cresces", "cresce", "crescemos", "crescem"], perfeito: ["cresci", "cresceste", "cresceu", "crescemos", "cresceram"], imperfeito: ["crescia", "crescias", "crescia", "cresc\xEDamos", "cresciam"], futuro: ["crescerei", "crescer\xE1s", "crescer\xE1", "cresceremos", "crescer\xE3o"], imperativo: [null, "cresce", "cres\xE7a", "cres\xE7amos", "cres\xE7am"] } },
    { inf: "descer", en: "to go down", forms: { presente: ["des\xE7o", "desces", "desce", "descemos", "descem"], perfeito: ["desci", "desceste", "desceu", "descemos", "desceram"], imperfeito: ["descia", "descias", "descia", "desc\xEDamos", "desciam"], futuro: ["descerei", "descer\xE1s", "descer\xE1", "desceremos", "descer\xE3o"], imperativo: [null, "desce", "des\xE7a", "des\xE7amos", "des\xE7am"] } },
    { inf: "dever", en: "to owe / must", forms: { presente: ["devo", "deves", "deve", "devemos", "devem"], perfeito: ["devi", "deveste", "deveu", "devemos", "deveram"], imperfeito: ["devia", "devias", "devia", "dev\xEDamos", "deviam"], futuro: ["deverei", "dever\xE1s", "dever\xE1", "deveremos", "dever\xE3o"] } },
    { inf: "entender", en: "to understand", forms: { presente: ["entendo", "entendes", "entende", "entendemos", "entendem"], perfeito: ["entendi", "entendeste", "entendeu", "entendemos", "entenderam"], imperfeito: ["entendia", "entendias", "entendia", "entend\xEDamos", "entendiam"], futuro: ["entenderei", "entender\xE1s", "entender\xE1", "entenderemos", "entender\xE3o"], imperativo: [null, "entende", "entenda", "entendamos", "entendam"] } },
    { inf: "escolher", en: "to choose", forms: { presente: ["escolho", "escolhes", "escolhe", "escolhemos", "escolhem"], perfeito: ["escolhi", "escolheste", "escolheu", "escolhemos", "escolheram"], imperfeito: ["escolhia", "escolhias", "escolhia", "escolh\xEDamos", "escolhiam"], futuro: ["escolherei", "escolher\xE1s", "escolher\xE1", "escolheremos", "escolher\xE3o"], imperativo: [null, "escolhe", "escolha", "escolhamos", "escolham"] } },
    { inf: "esquecer", en: "to forget", forms: { presente: ["esque\xE7o", "esqueces", "esquece", "esquecemos", "esquecem"], perfeito: ["esqueci", "esqueceste", "esqueceu", "esquecemos", "esqueceram"], imperfeito: ["esquecia", "esquecias", "esquecia", "esquec\xEDamos", "esqueciam"], futuro: ["esquecerei", "esquecer\xE1s", "esquecer\xE1", "esqueceremos", "esquecer\xE3o"], imperativo: [null, "esquece", "esque\xE7a", "esque\xE7amos", "esque\xE7am"] } },
    { inf: "haver", en: "there to be / to have to", forms: { presente: ["hei", "h\xE1s", "h\xE1", "havemos", "h\xE3o"], perfeito: ["houve", "houveste", "houve", "houvemos", "houveram"], imperfeito: ["havia", "havias", "havia", "hav\xEDamos", "haviam"], futuro: ["haverei", "haver\xE1s", "haver\xE1", "haveremos", "haver\xE3o"] } },
    { inf: "nascer", en: "to be born", forms: { presente: ["nas\xE7o", "nasces", "nasce", "nascemos", "nascem"], perfeito: ["nasci", "nasceste", "nasceu", "nascemos", "nasceram"], imperfeito: ["nascia", "nascias", "nascia", "nasc\xEDamos", "nasciam"], futuro: ["nascerei", "nascer\xE1s", "nascer\xE1", "nasceremos", "nascer\xE3o"] } },
    { inf: "parecer", en: "to seem / to look", forms: { presente: ["pare\xE7o", "pareces", "parece", "parecemos", "parecem"], perfeito: ["pareci", "pareceste", "pareceu", "parecemos", "pareceram"], imperfeito: ["parecia", "parecias", "parecia", "parec\xEDamos", "pareciam"], futuro: ["parecerei", "parecer\xE1s", "parecer\xE1", "pareceremos", "parecer\xE3o"] } },
    { inf: "perceber", en: "to understand", forms: { presente: ["percebo", "percebes", "percebe", "percebemos", "percebem"], perfeito: ["percebi", "percebeste", "percebeu", "percebemos", "perceberam"], imperfeito: ["percebia", "percebias", "percebia", "perceb\xEDamos", "percebiam"], futuro: ["perceberei", "perceber\xE1s", "perceber\xE1", "perceberemos", "perceber\xE3o"], imperativo: [null, "percebe", "perceba", "percebamos", "percebam"] } },
    { inf: "perder", en: "to lose / to miss", forms: { presente: ["perco", "perdes", "perde", "perdemos", "perdem"], perfeito: ["perdi", "perdeste", "perdeu", "perdemos", "perderam"], imperfeito: ["perdia", "perdias", "perdia", "perd\xEDamos", "perdiam"], futuro: ["perderei", "perder\xE1s", "perder\xE1", "perderemos", "perder\xE3o"], imperativo: [null, "perde", "perca", "percamos", "percam"] } },
    { inf: "receber", en: "to receive", forms: { presente: ["recebo", "recebes", "recebe", "recebemos", "recebem"], perfeito: ["recebi", "recebeste", "recebeu", "recebemos", "receberam"], imperfeito: ["recebia", "recebias", "recebia", "receb\xEDamos", "recebiam"], futuro: ["receberei", "receber\xE1s", "receber\xE1", "receberemos", "receber\xE3o"], imperativo: [null, "recebe", "receba", "recebamos", "recebam"] } },
    { inf: "responder", en: "to answer", forms: { presente: ["respondo", "respondes", "responde", "respondemos", "respondem"], perfeito: ["respondi", "respondeste", "respondeu", "respondemos", "responderam"], imperfeito: ["respondia", "respondias", "respondia", "respond\xEDamos", "respondiam"], futuro: ["responderei", "responder\xE1s", "responder\xE1", "responderemos", "responder\xE3o"], imperativo: [null, "responde", "responda", "respondamos", "respondam"] } },
    { inf: "valer", en: "to be worth", forms: { presente: ["valho", "vales", "vale", "valemos", "valem"], perfeito: ["vali", "valeste", "valeu", "valemos", "valeram"], imperfeito: ["valia", "valias", "valia", "val\xEDamos", "valiam"], futuro: ["valerei", "valer\xE1s", "valer\xE1", "valeremos", "valer\xE3o"] } },
    { inf: "vender", en: "to sell", forms: { presente: ["vendo", "vendes", "vende", "vendemos", "vendem"], perfeito: ["vendi", "vendeste", "vendeu", "vendemos", "venderam"], imperfeito: ["vendia", "vendias", "vendia", "vend\xEDamos", "vendiam"], futuro: ["venderei", "vender\xE1s", "vender\xE1", "venderemos", "vender\xE3o"], imperativo: [null, "vende", "venda", "vendamos", "vendam"] } },
    { inf: "viver", en: "to live", forms: { presente: ["vivo", "vives", "vive", "vivemos", "vivem"], perfeito: ["vivi", "viveste", "viveu", "vivemos", "viveram"], imperfeito: ["vivia", "vivias", "vivia", "viv\xEDamos", "viviam"], futuro: ["viverei", "viver\xE1s", "viver\xE1", "viveremos", "viver\xE3o"], imperativo: [null, "vive", "viva", "vivamos", "vivam"] } },
    // ── Verbos em -ir ─────────────────────────────────────────────────────────
    // Watch the vowel changes: subo/sobes, sigo/segues, sinto/sentes, visto/vestes.
    { inf: "assistir", en: "to watch / to attend", forms: { presente: ["assisto", "assistes", "assiste", "assistimos", "assistem"], perfeito: ["assisti", "assististe", "assistiu", "assistimos", "assistiram"], imperfeito: ["assistia", "assistias", "assistia", "assist\xEDamos", "assistiam"], futuro: ["assistirei", "assistir\xE1s", "assistir\xE1", "assistiremos", "assistir\xE3o"], imperativo: [null, "assiste", "assista", "assistamos", "assistam"] } },
    { inf: "cair", en: "to fall", forms: { presente: ["caio", "cais", "cai", "ca\xEDmos", "caem"], perfeito: ["ca\xED", "ca\xEDste", "caiu", "ca\xEDmos", "ca\xEDram"], imperfeito: ["ca\xEDa", "ca\xEDas", "ca\xEDa", "ca\xEDamos", "ca\xEDam"], futuro: ["cairei", "cair\xE1s", "cair\xE1", "cairemos", "cair\xE3o"], imperativo: [null, "cai", "caia", "caiamos", "caiam"] } },
    { inf: "conduzir", en: "to drive", forms: { presente: ["conduzo", "conduzes", "conduz", "conduzimos", "conduzem"], perfeito: ["conduzi", "conduziste", "conduziu", "conduzimos", "conduziram"], imperfeito: ["conduzia", "conduzias", "conduzia", "conduz\xEDamos", "conduziam"], futuro: ["conduzirei", "conduzir\xE1s", "conduzir\xE1", "conduziremos", "conduzir\xE3o"], imperativo: [null, "conduz", "conduza", "conduzamos", "conduzam"] } },
    { inf: "conseguir", en: "to manage / to be able", forms: { presente: ["consigo", "consegues", "consegue", "conseguimos", "conseguem"], perfeito: ["consegui", "conseguiste", "conseguiu", "conseguimos", "conseguiram"], imperfeito: ["conseguia", "conseguias", "conseguia", "consegu\xEDamos", "conseguiam"], futuro: ["conseguirei", "conseguir\xE1s", "conseguir\xE1", "conseguiremos", "conseguir\xE3o"], imperativo: [null, "consegue", "consiga", "consigamos", "consigam"] } },
    { inf: "construir", en: "to build", forms: { presente: ["construo", "constr\xF3is", "constr\xF3i", "constru\xEDmos", "constroem"], perfeito: ["constru\xED", "constru\xEDste", "construiu", "constru\xEDmos", "constru\xEDram"], imperfeito: ["constru\xEDa", "constru\xEDas", "constru\xEDa", "constru\xEDamos", "constru\xEDam"], futuro: ["construirei", "construir\xE1s", "construir\xE1", "construiremos", "construir\xE3o"], imperativo: [null, "constr\xF3i", "construa", "construamos", "construam"] } },
    { inf: "decidir", en: "to decide", forms: { presente: ["decido", "decides", "decide", "decidimos", "decidem"], perfeito: ["decidi", "decidiste", "decidiu", "decidimos", "decidiram"], imperfeito: ["decidia", "decidias", "decidia", "decid\xEDamos", "decidiam"], futuro: ["decidirei", "decidir\xE1s", "decidir\xE1", "decidiremos", "decidir\xE3o"], imperativo: [null, "decide", "decida", "decidamos", "decidam"] } },
    { inf: "divertir", en: "to amuse (divertir-se: to have fun)", forms: { presente: ["divirto", "divertes", "diverte", "divertimos", "divertem"], perfeito: ["diverti", "divertiste", "divertiu", "divertimos", "divertiram"], imperfeito: ["divertia", "divertias", "divertia", "divert\xEDamos", "divertiam"], futuro: ["divertirei", "divertir\xE1s", "divertir\xE1", "divertiremos", "divertir\xE3o"], imperativo: [null, "diverte", "divirta", "divirtamos", "divirtam"] } },
    { inf: "fugir", en: "to run away", forms: { presente: ["fujo", "foges", "foge", "fugimos", "fogem"], perfeito: ["fugi", "fugiste", "fugiu", "fugimos", "fugiram"], imperfeito: ["fugia", "fugias", "fugia", "fug\xEDamos", "fugiam"], futuro: ["fugirei", "fugir\xE1s", "fugir\xE1", "fugiremos", "fugir\xE3o"], imperativo: [null, "foge", "fuja", "fujamos", "fujam"] } },
    { inf: "incluir", en: "to include", forms: { presente: ["incluo", "incluis", "inclui", "inclu\xEDmos", "incluem"], perfeito: ["inclu\xED", "inclu\xEDste", "incluiu", "inclu\xEDmos", "inclu\xEDram"], imperfeito: ["inclu\xEDa", "inclu\xEDas", "inclu\xEDa", "inclu\xEDamos", "inclu\xEDam"], futuro: ["incluirei", "incluir\xE1s", "incluir\xE1", "incluiremos", "incluir\xE3o"] } },
    { inf: "partir", en: "to leave / to break", forms: { presente: ["parto", "partes", "parte", "partimos", "partem"], perfeito: ["parti", "partiste", "partiu", "partimos", "partiram"], imperfeito: ["partia", "partias", "partia", "part\xEDamos", "partiam"], futuro: ["partirei", "partir\xE1s", "partir\xE1", "partiremos", "partir\xE3o"], imperativo: [null, "parte", "parta", "partamos", "partam"] } },
    { inf: "preferir", en: "to prefer", forms: { presente: ["prefiro", "preferes", "prefere", "preferimos", "preferem"], perfeito: ["preferi", "preferiste", "preferiu", "preferimos", "preferiram"], imperfeito: ["preferia", "preferias", "preferia", "prefer\xEDamos", "preferiam"], futuro: ["preferirei", "preferir\xE1s", "preferir\xE1", "preferiremos", "preferir\xE3o"], imperativo: [null, "prefere", "prefira", "prefiramos", "prefiram"] } },
    { inf: "repetir", en: "to repeat", forms: { presente: ["repito", "repetes", "repete", "repetimos", "repetem"], perfeito: ["repeti", "repetiste", "repetiu", "repetimos", "repetiram"], imperfeito: ["repetia", "repetias", "repetia", "repet\xEDamos", "repetiam"], futuro: ["repetirei", "repetir\xE1s", "repetir\xE1", "repetiremos", "repetir\xE3o"], imperativo: [null, "repete", "repita", "repitamos", "repitam"] } },
    { inf: "rir", en: "to laugh", forms: { presente: ["rio", "ris", "ri", "rimos", "riem"], perfeito: ["ri", "riste", "riu", "rimos", "riram"], imperfeito: ["ria", "rias", "ria", "r\xEDamos", "riam"], futuro: ["rirei", "rir\xE1s", "rir\xE1", "riremos", "rir\xE3o"], imperativo: [null, "ri", "ria", "riamos", "riam"] } },
    { inf: "seguir", en: "to follow / to carry on", forms: { presente: ["sigo", "segues", "segue", "seguimos", "seguem"], perfeito: ["segui", "seguiste", "seguiu", "seguimos", "seguiram"], imperfeito: ["seguia", "seguias", "seguia", "segu\xEDamos", "seguiam"], futuro: ["seguirei", "seguir\xE1s", "seguir\xE1", "seguiremos", "seguir\xE3o"], imperativo: [null, "segue", "siga", "sigamos", "sigam"] } },
    { inf: "sentir", en: "to feel", forms: { presente: ["sinto", "sentes", "sente", "sentimos", "sentem"], perfeito: ["senti", "sentiste", "sentiu", "sentimos", "sentiram"], imperfeito: ["sentia", "sentias", "sentia", "sent\xEDamos", "sentiam"], futuro: ["sentirei", "sentir\xE1s", "sentir\xE1", "sentiremos", "sentir\xE3o"], imperativo: [null, "sente", "sinta", "sintamos", "sintam"] } },
    { inf: "servir", en: "to serve", forms: { presente: ["sirvo", "serves", "serve", "servimos", "servem"], perfeito: ["servi", "serviste", "serviu", "servimos", "serviram"], imperfeito: ["servia", "servias", "servia", "serv\xEDamos", "serviam"], futuro: ["servirei", "servir\xE1s", "servir\xE1", "serviremos", "servir\xE3o"], imperativo: [null, "serve", "sirva", "sirvamos", "sirvam"] } },
    { inf: "subir", en: "to go up", forms: { presente: ["subo", "sobes", "sobe", "subimos", "sobem"], perfeito: ["subi", "subiste", "subiu", "subimos", "subiram"], imperfeito: ["subia", "subias", "subia", "sub\xEDamos", "subiam"], futuro: ["subirei", "subir\xE1s", "subir\xE1", "subiremos", "subir\xE3o"], imperativo: [null, "sobe", "suba", "subamos", "subam"] } },
    { inf: "vestir", en: "to wear / to dress", forms: { presente: ["visto", "vestes", "veste", "vestimos", "vestem"], perfeito: ["vesti", "vestiste", "vestiu", "vestimos", "vestiram"], imperfeito: ["vestia", "vestias", "vestia", "vest\xEDamos", "vestiam"], futuro: ["vestirei", "vestir\xE1s", "vestir\xE1", "vestiremos", "vestir\xE3o"], imperativo: [null, "veste", "vista", "vistamos", "vistam"] } }
  ];

  // lib/verb-filter.ts
  var TENSES = [
    "presente",
    "perfeito",
    "imperfeito",
    "futuro",
    "conjuntivo",
    "imperativo"
  ];
  var CLASS_LABEL = {
    ar: "-ar",
    er: "-er",
    ir: "-ir",
    outro: "p\xF4r"
  };
  function verbClass(verb) {
    const inf = verb.inf;
    if (inf.endsWith("p\xF4r")) return "outro";
    if (inf.endsWith("ar")) return "ar";
    if (inf.endsWith("er")) return "er";
    if (inf.endsWith("ir")) return "ir";
    return "outro";
  }
  var STEM_ENDINGS = {
    ar: {
      presente: ["o", "as", "a", "amos", "am"],
      // EP keeps the accent in the 1st person plural: falámos, not falamos.
      perfeito: ["ei", "aste", "ou", "\xE1mos", "aram"],
      imperfeito: ["ava", "avas", "ava", "\xE1vamos", "avam"],
      conjuntivo: ["e", "es", "e", "emos", "em"]
    },
    er: {
      presente: ["o", "es", "e", "emos", "em"],
      perfeito: ["i", "este", "eu", "emos", "eram"],
      imperfeito: ["ia", "ias", "ia", "\xEDamos", "iam"],
      conjuntivo: ["a", "as", "a", "amos", "am"]
    },
    ir: {
      presente: ["o", "es", "e", "imos", "em"],
      perfeito: ["i", "iste", "iu", "imos", "iram"],
      imperfeito: ["ia", "ias", "ia", "\xEDamos", "iam"],
      conjuntivo: ["a", "as", "a", "amos", "am"]
    }
  };
  var FUTURO_ENDINGS = ["ei", "\xE1s", "\xE1", "emos", "\xE3o"];
  function frontVowel(ending) {
    return /^[eéêií]/.test(ending);
  }
  function join2(stem, ending, cls) {
    const front = frontVowel(ending);
    if (cls === "ar") {
      if (!front) return stem + ending;
      if (stem.endsWith("\xE7")) return stem.slice(0, -1) + "c" + ending;
      if (stem.endsWith("c")) return stem.slice(0, -1) + "qu" + ending;
      if (stem.endsWith("g")) return stem.slice(0, -1) + "gu" + ending;
      return stem + ending;
    }
    if (front) return stem + ending;
    if (stem.endsWith("gu")) return stem.slice(0, -2) + "g" + ending;
    if (stem.endsWith("qu")) return stem.slice(0, -2) + "c" + ending;
    if (stem.endsWith("c")) return stem.slice(0, -1) + "\xE7" + ending;
    if (stem.endsWith("g")) return stem.slice(0, -1) + "j" + ending;
    return stem + ending;
  }
  function regularForms(inf, tense) {
    const cls = inf.endsWith("p\xF4r") ? "outro" : inf.endsWith("ar") ? "ar" : inf.endsWith("er") ? "er" : inf.endsWith("ir") ? "ir" : "outro";
    if (cls === "outro") return null;
    const stem = inf.slice(0, -2);
    if (tense === "futuro") return FUTURO_ENDINGS.map((e) => inf + e);
    const table2 = STEM_ENDINGS[cls];
    if (tense === "imperativo") {
      const pres = table2.presente.map((e) => join2(stem, e, cls));
      const conj = table2.conjuntivo.map((e) => join2(stem, e, cls));
      return [null, pres[2], conj[2], conj[3], conj[4]];
    }
    return table2[tense].map((e) => join2(stem, e, cls));
  }
  function isRegular(verb, tense) {
    const actual = verb.forms[tense];
    if (!actual) return false;
    const expected = regularForms(verb.inf, tense);
    if (!expected) return false;
    return actual.every((a, i) => (a ?? "") === (expected[i] ?? ""));
  }
  function tensesOf(verb) {
    return TENSES.filter((t) => verb.forms[t]);
  }
  function findVerb(inf) {
    return VERBS.find((v) => v.inf === inf);
  }
  function stripAccents(s) {
    return s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // components/verb-conjugator.tsx
  var import_jsx_runtime6 = __toESM(require_react_shim());
  function VerbConjugator({
    initialVerb,
    initialTense
  }) {
    const [query, setQuery] = (0, import_react4.useState)("");
    const [inf, setInf] = (0, import_react4.useState)(initialVerb ?? "falar");
    const [only, setOnly] = (0, import_react4.useState)(initialTense ?? "todos");
    const q = stripAccents(query);
    const matches = q ? VERBS.filter(
      (v) => stripAccents(v.inf).includes(q) || v.en.toLowerCase().includes(q)
    ) : VERBS;
    const verb = findVerb(inf);
    const tenses = verb ? tensesOf(verb) : [];
    const active = only !== "todos" && tenses.includes(only) ? only : "todos";
    const shown = active === "todos" ? tenses : tenses.filter((t) => t === active);
    const irregulars = verb ? tenses.filter((t) => !isRegular(verb, t)) : [];
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "card space-y-3 p-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("label", { className: "label", htmlFor: "verbo-procurar", children: "Procurar verbo" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "input",
            {
              id: "verbo-procurar",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              className: "input",
              placeholder: "ex.: ficar \xB7 to stay \xB7 dorm",
              autoCapitalize: "off",
              autoCorrect: "off",
              spellCheck: false
            }
          )
        ] }),
        matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "text-sm text-ink-soft", children: [
          "Nenhum verbo com \xAB",
          query,
          "\xBB.",
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-ink-faint", children: "No match \u2014 try the English." })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "max-h-48 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex flex-wrap gap-1.5 pr-1", children: matches.map((v) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            onClick: () => setInf(v.inf),
            "aria-pressed": v.inf === inf,
            className: cn(
              "min-h-11 rounded-full border px-3 py-1.5 text-sm transition-colors",
              v.inf === inf ? "border-olive bg-olive text-paper" : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
            ),
            children: v.inf
          },
          v.inf
        )) }) })
      ] }),
      !verb ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "card p-5 text-sm text-ink-soft", children: "Escolhe um verbo em cima." }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "card space-y-3 p-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "min-w-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { className: "font-display text-3xl leading-tight font-semibold", children: verb.inf }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "mt-0.5 text-sm text-ink-soft", children: verb.en })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(AudioButton, { text: verb.inf })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex flex-wrap items-center gap-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "chip", children: [
              "verbo em ",
              CLASS_LABEL[verbClass(verb)]
            ] }),
            irregulars.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "chip", children: "regular em tudo" }) : irregulars.map((t) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "chip bg-terra-pale text-terra-dark", children: [
              TENSE_LABEL[t],
              " irregular"
            ] }, t))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "text-xs text-ink-faint", children: [
            "Regularity is worked out by rebuilding the form from the infinitive \u2014 spelling shifts like ",
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("em", { children: "fiquei" }),
            " and",
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("em", { children: "comecei" }),
            " still count as regular."
          ] })
        ] }),
        tenses.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex flex-wrap gap-1.5", children: ["todos", ...tenses].map((t) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            onClick: () => setOnly(t),
            "aria-pressed": active === t,
            className: cn(
              "min-h-11 rounded-full border px-3 py-1.5 text-sm transition-colors",
              active === t ? "border-olive bg-olive text-paper" : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
            ),
            children: t === "todos" ? "Todos os tempos" : TENSE_LABEL[t]
          },
          t
        )) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "grid gap-3 sm:grid-cols-2", children: shown.map((t) => {
          const forms = verb.forms[t] ?? [];
          const regular = isRegular(verb, t);
          const spoken = forms.filter(Boolean).join(", ");
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { className: "card overflow-hidden", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("header", { className: "flex items-center justify-between gap-2 border-b border-sand bg-cream/60 px-4 py-2.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "min-w-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: "font-display text-base font-semibold", children: TENSE_LABEL[t] }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                  "p",
                  {
                    className: cn(
                      "text-2xs",
                      regular ? "text-ink-faint" : "text-terra-dark"
                    ),
                    children: regular ? "segue o padr\xE3o" : "irregular \u2014 decora esta"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(AudioButton, { text: spoken, label: "tudo" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { className: "divide-y divide-sand/60", children: forms.map(
              (f, i) => f ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("li", { className: "flex items-center gap-3 px-4 py-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "w-16 shrink-0 text-xs text-ink-faint", children: personLabel(t, i) }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "flex-1 font-display text-lg break-words", children: f }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(AudioButton, { text: f })
              ] }, i) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "li",
                {
                  className: "px-4 py-2 text-xs text-ink-faint italic",
                  children: "n\xE3o h\xE1 imperativo para \xABeu\xBB"
                },
                i
              )
            ) })
          ] }, t);
        }) })
      ] })
    ] });
  }
  return __toCommonJS(entry_exports);
})();
window.PortDS=PortDS.__dsMainNs?Object.assign({},PortDS,PortDS.__dsMainNs,{__dsMainNs:undefined}):PortDS;
