(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

  // node_modules/toml/lib/parser.js
  var require_parser = __commonJS({
    "node_modules/toml/lib/parser.js"(exports, module) {
      module.exports = (function() {
        function peg$subclass(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
        }
        function SyntaxError(message, expected, found, offset, line, column) {
          this.message = message;
          this.expected = expected;
          this.found = found;
          this.offset = offset;
          this.line = line;
          this.column = column;
          this.name = "SyntaxError";
        }
        peg$subclass(SyntaxError, Error);
        function parse2(input) {
          var options = arguments.length > 1 ? arguments[1] : {}, peg$FAILED = {}, peg$startRuleFunctions = { start: peg$parsestart }, peg$startRuleFunction = peg$parsestart, peg$c0 = [], peg$c1 = function() {
            return nodes;
          }, peg$c2 = peg$FAILED, peg$c3 = "#", peg$c4 = { type: "literal", value: "#", description: '"#"' }, peg$c5 = void 0, peg$c6 = { type: "any", description: "any character" }, peg$c7 = "[", peg$c8 = { type: "literal", value: "[", description: '"["' }, peg$c9 = "]", peg$c10 = { type: "literal", value: "]", description: '"]"' }, peg$c11 = function(name) {
            addNode(node("ObjectPath", name, line, column));
          }, peg$c12 = function(name) {
            addNode(node("ArrayPath", name, line, column));
          }, peg$c13 = function(parts, name) {
            return parts.concat(name);
          }, peg$c14 = function(name) {
            return [name];
          }, peg$c15 = function(name) {
            return name;
          }, peg$c16 = ".", peg$c17 = { type: "literal", value: ".", description: '"."' }, peg$c18 = "=", peg$c19 = { type: "literal", value: "=", description: '"="' }, peg$c20 = function(key, value) {
            addNode(node("Assign", value, line, column, key));
          }, peg$c21 = function(chars) {
            return chars.join("");
          }, peg$c22 = function(node2) {
            return node2.value;
          }, peg$c23 = '"""', peg$c24 = { type: "literal", value: '"""', description: '"\\"\\"\\""' }, peg$c25 = null, peg$c26 = function(chars) {
            return node("String", chars.join(""), line, column);
          }, peg$c27 = '"', peg$c28 = { type: "literal", value: '"', description: '"\\""' }, peg$c29 = "'''", peg$c30 = { type: "literal", value: "'''", description: `"'''"` }, peg$c31 = "'", peg$c32 = { type: "literal", value: "'", description: `"'"` }, peg$c33 = function(char) {
            return char;
          }, peg$c34 = function(char) {
            return char;
          }, peg$c35 = "\\", peg$c36 = { type: "literal", value: "\\", description: '"\\\\"' }, peg$c37 = function() {
            return "";
          }, peg$c38 = "e", peg$c39 = { type: "literal", value: "e", description: '"e"' }, peg$c40 = "E", peg$c41 = { type: "literal", value: "E", description: '"E"' }, peg$c42 = function(left, right) {
            return node("Float", parseFloat(left + "e" + right), line, column);
          }, peg$c43 = function(text2) {
            return node("Float", parseFloat(text2), line, column);
          }, peg$c44 = "+", peg$c45 = { type: "literal", value: "+", description: '"+"' }, peg$c46 = function(digits) {
            return digits.join("");
          }, peg$c47 = "-", peg$c48 = { type: "literal", value: "-", description: '"-"' }, peg$c49 = function(digits) {
            return "-" + digits.join("");
          }, peg$c50 = function(text2) {
            return node("Integer", parseInt(text2, 10), line, column);
          }, peg$c51 = "true", peg$c52 = { type: "literal", value: "true", description: '"true"' }, peg$c53 = function() {
            return node("Boolean", true, line, column);
          }, peg$c54 = "false", peg$c55 = { type: "literal", value: "false", description: '"false"' }, peg$c56 = function() {
            return node("Boolean", false, line, column);
          }, peg$c57 = function() {
            return node("Array", [], line, column);
          }, peg$c58 = function(value) {
            return node("Array", value ? [value] : [], line, column);
          }, peg$c59 = function(values) {
            return node("Array", values, line, column);
          }, peg$c60 = function(values, value) {
            return node("Array", values.concat(value), line, column);
          }, peg$c61 = function(value) {
            return value;
          }, peg$c62 = ",", peg$c63 = { type: "literal", value: ",", description: '","' }, peg$c64 = "{", peg$c65 = { type: "literal", value: "{", description: '"{"' }, peg$c66 = "}", peg$c67 = { type: "literal", value: "}", description: '"}"' }, peg$c68 = function(values) {
            return node("InlineTable", values, line, column);
          }, peg$c69 = function(key, value) {
            return node("InlineTableValue", value, line, column, key);
          }, peg$c70 = function(digits) {
            return "." + digits;
          }, peg$c71 = function(date) {
            return date.join("");
          }, peg$c72 = ":", peg$c73 = { type: "literal", value: ":", description: '":"' }, peg$c74 = function(time) {
            return time.join("");
          }, peg$c75 = "T", peg$c76 = { type: "literal", value: "T", description: '"T"' }, peg$c77 = "Z", peg$c78 = { type: "literal", value: "Z", description: '"Z"' }, peg$c79 = function(date, time) {
            return node("Date", /* @__PURE__ */ new Date(date + "T" + time + "Z"), line, column);
          }, peg$c80 = function(date, time) {
            return node("Date", /* @__PURE__ */ new Date(date + "T" + time), line, column);
          }, peg$c81 = /^[ \t]/, peg$c82 = { type: "class", value: "[ \\t]", description: "[ \\t]" }, peg$c83 = "\n", peg$c84 = { type: "literal", value: "\n", description: '"\\n"' }, peg$c85 = "\r", peg$c86 = { type: "literal", value: "\r", description: '"\\r"' }, peg$c87 = /^[0-9a-f]/i, peg$c88 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" }, peg$c89 = /^[0-9]/, peg$c90 = { type: "class", value: "[0-9]", description: "[0-9]" }, peg$c91 = "_", peg$c92 = { type: "literal", value: "_", description: '"_"' }, peg$c93 = function() {
            return "";
          }, peg$c94 = /^[A-Za-z0-9_\-]/, peg$c95 = { type: "class", value: "[A-Za-z0-9_\\-]", description: "[A-Za-z0-9_\\-]" }, peg$c96 = function(d) {
            return d.join("");
          }, peg$c97 = '\\"', peg$c98 = { type: "literal", value: '\\"', description: '"\\\\\\""' }, peg$c99 = function() {
            return '"';
          }, peg$c100 = "\\\\", peg$c101 = { type: "literal", value: "\\\\", description: '"\\\\\\\\"' }, peg$c102 = function() {
            return "\\";
          }, peg$c103 = "\\b", peg$c104 = { type: "literal", value: "\\b", description: '"\\\\b"' }, peg$c105 = function() {
            return "\b";
          }, peg$c106 = "\\t", peg$c107 = { type: "literal", value: "\\t", description: '"\\\\t"' }, peg$c108 = function() {
            return "	";
          }, peg$c109 = "\\n", peg$c110 = { type: "literal", value: "\\n", description: '"\\\\n"' }, peg$c111 = function() {
            return "\n";
          }, peg$c112 = "\\f", peg$c113 = { type: "literal", value: "\\f", description: '"\\\\f"' }, peg$c114 = function() {
            return "\f";
          }, peg$c115 = "\\r", peg$c116 = { type: "literal", value: "\\r", description: '"\\\\r"' }, peg$c117 = function() {
            return "\r";
          }, peg$c118 = "\\U", peg$c119 = { type: "literal", value: "\\U", description: '"\\\\U"' }, peg$c120 = function(digits) {
            return convertCodePoint(digits.join(""));
          }, peg$c121 = "\\u", peg$c122 = { type: "literal", value: "\\u", description: '"\\\\u"' }, peg$currPos = 0, peg$reportedPos = 0, peg$cachedPos = 0, peg$cachedPosDetails = { line: 1, column: 1, seenCR: false }, peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$cache = {}, peg$result;
          if ("startRule" in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
              throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
            }
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
          }
          function text() {
            return input.substring(peg$reportedPos, peg$currPos);
          }
          function offset() {
            return peg$reportedPos;
          }
          function line() {
            return peg$computePosDetails(peg$reportedPos).line;
          }
          function column() {
            return peg$computePosDetails(peg$reportedPos).column;
          }
          function expected(description) {
            throw peg$buildException(
              null,
              [{ type: "other", description }],
              peg$reportedPos
            );
          }
          function error(message) {
            throw peg$buildException(message, null, peg$reportedPos);
          }
          function peg$computePosDetails(pos) {
            function advance(details, startPos, endPos) {
              var p, ch;
              for (p = startPos; p < endPos; p++) {
                ch = input.charAt(p);
                if (ch === "\n") {
                  if (!details.seenCR) {
                    details.line++;
                  }
                  details.column = 1;
                  details.seenCR = false;
                } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
                  details.line++;
                  details.column = 1;
                  details.seenCR = true;
                } else {
                  details.column++;
                  details.seenCR = false;
                }
              }
            }
            if (peg$cachedPos !== pos) {
              if (peg$cachedPos > pos) {
                peg$cachedPos = 0;
                peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
              }
              advance(peg$cachedPosDetails, peg$cachedPos, pos);
              peg$cachedPos = pos;
            }
            return peg$cachedPosDetails;
          }
          function peg$fail(expected2) {
            if (peg$currPos < peg$maxFailPos) {
              return;
            }
            if (peg$currPos > peg$maxFailPos) {
              peg$maxFailPos = peg$currPos;
              peg$maxFailExpected = [];
            }
            peg$maxFailExpected.push(expected2);
          }
          function peg$buildException(message, expected2, pos) {
            function cleanupExpected(expected3) {
              var i = 1;
              expected3.sort(function(a, b) {
                if (a.description < b.description) {
                  return -1;
                } else if (a.description > b.description) {
                  return 1;
                } else {
                  return 0;
                }
              });
              while (i < expected3.length) {
                if (expected3[i - 1] === expected3[i]) {
                  expected3.splice(i, 1);
                } else {
                  i++;
                }
              }
            }
            function buildMessage(expected3, found2) {
              function stringEscape(s) {
                function hex(ch) {
                  return ch.charCodeAt(0).toString(16).toUpperCase();
                }
                return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) {
                  return "\\x0" + hex(ch);
                }).replace(/[\x10-\x1F\x80-\xFF]/g, function(ch) {
                  return "\\x" + hex(ch);
                }).replace(/[\u0180-\u0FFF]/g, function(ch) {
                  return "\\u0" + hex(ch);
                }).replace(/[\u1080-\uFFFF]/g, function(ch) {
                  return "\\u" + hex(ch);
                });
              }
              var expectedDescs = new Array(expected3.length), expectedDesc, foundDesc, i;
              for (i = 0; i < expected3.length; i++) {
                expectedDescs[i] = expected3[i].description;
              }
              expectedDesc = expected3.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected3.length - 1] : expectedDescs[0];
              foundDesc = found2 ? '"' + stringEscape(found2) + '"' : "end of input";
              return "Expected " + expectedDesc + " but " + foundDesc + " found.";
            }
            var posDetails = peg$computePosDetails(pos), found = pos < input.length ? input.charAt(pos) : null;
            if (expected2 !== null) {
              cleanupExpected(expected2);
            }
            return new SyntaxError(
              message !== null ? message : buildMessage(expected2, found),
              expected2,
              found,
              pos,
              posDetails.line,
              posDetails.column
            );
          }
          function peg$parsestart() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 0, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseline();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseline();
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c1();
            }
            s0 = s1;
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseline() {
            var s0, s1, s2, s3, s4, s5, s6;
            var key = peg$currPos * 49 + 1, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseS();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseS();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseexpression();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseS();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseS();
                }
                if (s3 !== peg$FAILED) {
                  s4 = [];
                  s5 = peg$parsecomment();
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = peg$parsecomment();
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$parseNL();
                    if (s6 !== peg$FAILED) {
                      while (s6 !== peg$FAILED) {
                        s5.push(s6);
                        s6 = peg$parseNL();
                      }
                    } else {
                      s5 = peg$c2;
                    }
                    if (s5 === peg$FAILED) {
                      s5 = peg$parseEOF();
                    }
                    if (s5 !== peg$FAILED) {
                      s1 = [s1, s2, s3, s4, s5];
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = [];
              s2 = peg$parseS();
              if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                  s1.push(s2);
                  s2 = peg$parseS();
                }
              } else {
                s1 = peg$c2;
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseNL();
                if (s3 !== peg$FAILED) {
                  while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseNL();
                  }
                } else {
                  s2 = peg$c2;
                }
                if (s2 === peg$FAILED) {
                  s2 = peg$parseEOF();
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseNL();
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseexpression() {
            var s0;
            var key = peg$currPos * 49 + 2, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$parsecomment();
            if (s0 === peg$FAILED) {
              s0 = peg$parsepath();
              if (s0 === peg$FAILED) {
                s0 = peg$parsetablearray();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseassignment();
                }
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsecomment() {
            var s0, s1, s2, s3, s4, s5;
            var key = peg$currPos * 49 + 3, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
              s1 = peg$c3;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c4);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = peg$parseNL();
              if (s5 === peg$FAILED) {
                s5 = peg$parseEOF();
              }
              peg$silentFails--;
              if (s5 === peg$FAILED) {
                s4 = peg$c5;
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
              if (s4 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c6);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c2;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c2;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                s5 = peg$parseNL();
                if (s5 === peg$FAILED) {
                  s5 = peg$parseEOF();
                }
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                  s4 = peg$c5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c2;
                }
                if (s4 !== peg$FAILED) {
                  if (input.length > peg$currPos) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c6);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c2;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c2;
                }
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsepath() {
            var s0, s1, s2, s3, s4, s5;
            var key = peg$currPos * 49 + 4, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c7;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c8);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parseS();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseS();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsetable_key();
                if (s3 !== peg$FAILED) {
                  s4 = [];
                  s5 = peg$parseS();
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = peg$parseS();
                  }
                  if (s4 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s5 = peg$c9;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c11(s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsetablearray() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            var key = peg$currPos * 49 + 5, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c7;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c8);
              }
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 91) {
                s2 = peg$c7;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c8);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseS();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseS();
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsetable_key();
                  if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$parseS();
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$parseS();
                    }
                    if (s5 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 93) {
                        s6 = peg$c9;
                        peg$currPos++;
                      } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$c10);
                        }
                      }
                      if (s6 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 93) {
                          s7 = peg$c9;
                          peg$currPos++;
                        } else {
                          s7 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$c10);
                          }
                        }
                        if (s7 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c12(s4);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsetable_key() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 6, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsedot_ended_table_key_part();
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parsedot_ended_table_key_part();
              }
            } else {
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsetable_key_part();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c13(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsetable_key_part();
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c14(s1);
              }
              s0 = s1;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsetable_key_part() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 7, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseS();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseS();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsekey();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseS();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseS();
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c15(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = [];
              s2 = peg$parseS();
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parseS();
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsequoted_key();
                if (s2 !== peg$FAILED) {
                  s3 = [];
                  s4 = peg$parseS();
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseS();
                  }
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c15(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsedot_ended_table_key_part() {
            var s0, s1, s2, s3, s4, s5, s6;
            var key = peg$currPos * 49 + 8, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseS();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseS();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsekey();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseS();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseS();
                }
                if (s3 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s4 = peg$c16;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c17);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$parseS();
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$parseS();
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c15(s2);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = [];
              s2 = peg$parseS();
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parseS();
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsequoted_key();
                if (s2 !== peg$FAILED) {
                  s3 = [];
                  s4 = peg$parseS();
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseS();
                  }
                  if (s3 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 46) {
                      s4 = peg$c16;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c17);
                      }
                    }
                    if (s4 !== peg$FAILED) {
                      s5 = [];
                      s6 = peg$parseS();
                      while (s6 !== peg$FAILED) {
                        s5.push(s6);
                        s6 = peg$parseS();
                      }
                      if (s5 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c15(s2);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseassignment() {
            var s0, s1, s2, s3, s4, s5;
            var key = peg$currPos * 49 + 9, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$parsekey();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parseS();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseS();
              }
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 61) {
                  s3 = peg$c18;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c19);
                  }
                }
                if (s3 !== peg$FAILED) {
                  s4 = [];
                  s5 = peg$parseS();
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = peg$parseS();
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsevalue();
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c20(s1, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsequoted_key();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseS();
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parseS();
                }
                if (s2 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s3 = peg$c18;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c19);
                    }
                  }
                  if (s3 !== peg$FAILED) {
                    s4 = [];
                    s5 = peg$parseS();
                    while (s5 !== peg$FAILED) {
                      s4.push(s5);
                      s5 = peg$parseS();
                    }
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parsevalue();
                      if (s5 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c20(s1, s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsekey() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 10, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseASCII_BASIC();
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parseASCII_BASIC();
              }
            } else {
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c21(s1);
            }
            s0 = s1;
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsequoted_key() {
            var s0, s1;
            var key = peg$currPos * 49 + 11, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$parsedouble_quoted_single_line_string();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c22(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsesingle_quoted_single_line_string();
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c22(s1);
              }
              s0 = s1;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsevalue() {
            var s0;
            var key = peg$currPos * 49 + 12, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$parsestring();
            if (s0 === peg$FAILED) {
              s0 = peg$parsedatetime();
              if (s0 === peg$FAILED) {
                s0 = peg$parsefloat();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseinteger();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseboolean();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsearray();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseinline_table();
                      }
                    }
                  }
                }
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsestring() {
            var s0;
            var key = peg$currPos * 49 + 13, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$parsedouble_quoted_multiline_string();
            if (s0 === peg$FAILED) {
              s0 = peg$parsedouble_quoted_single_line_string();
              if (s0 === peg$FAILED) {
                s0 = peg$parsesingle_quoted_multiline_string();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsesingle_quoted_single_line_string();
                }
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsedouble_quoted_multiline_string() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 14, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c23) {
              s1 = peg$c23;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c24);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseNL();
              if (s2 === peg$FAILED) {
                s2 = peg$c25;
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsemultiline_string_char();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parsemultiline_string_char();
                }
                if (s3 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 3) === peg$c23) {
                    s4 = peg$c23;
                    peg$currPos += 3;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c24);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c26(s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsedouble_quoted_single_line_string() {
            var s0, s1, s2, s3;
            var key = peg$currPos * 49 + 15, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 34) {
              s1 = peg$c27;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c28);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsestring_char();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsestring_char();
              }
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 34) {
                  s3 = peg$c27;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c28);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c26(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsesingle_quoted_multiline_string() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 16, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c29) {
              s1 = peg$c29;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c30);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseNL();
              if (s2 === peg$FAILED) {
                s2 = peg$c25;
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsemultiline_literal_char();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parsemultiline_literal_char();
                }
                if (s3 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 3) === peg$c29) {
                    s4 = peg$c29;
                    peg$currPos += 3;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c30);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c26(s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsesingle_quoted_single_line_string() {
            var s0, s1, s2, s3;
            var key = peg$currPos * 49 + 17, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 39) {
              s1 = peg$c31;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c32);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parseliteral_char();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseliteral_char();
              }
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 39) {
                  s3 = peg$c31;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c32);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c26(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsestring_char() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 18, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$parseESCAPED();
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 34) {
                s2 = peg$c27;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c28);
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = peg$c5;
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
              if (s1 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c6);
                  }
                }
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c33(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseliteral_char() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 19, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            if (input.charCodeAt(peg$currPos) === 39) {
              s2 = peg$c31;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c32);
              }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
              s1 = peg$c5;
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c6);
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c33(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsemultiline_string_char() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 20, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$parseESCAPED();
            if (s0 === peg$FAILED) {
              s0 = peg$parsemultiline_string_delim();
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 3) === peg$c23) {
                  s2 = peg$c23;
                  peg$currPos += 3;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c24);
                  }
                }
                peg$silentFails--;
                if (s2 === peg$FAILED) {
                  s1 = peg$c5;
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
                if (s1 !== peg$FAILED) {
                  if (input.length > peg$currPos) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c6);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c34(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsemultiline_string_delim() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 21, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
              s1 = peg$c35;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c36);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseNL();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseNLS();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseNLS();
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c37();
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsemultiline_literal_char() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 22, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 3) === peg$c29) {
              s2 = peg$c29;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c30);
              }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
              s1 = peg$c5;
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c6);
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c33(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsefloat() {
            var s0, s1, s2, s3;
            var key = peg$currPos * 49 + 23, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$parsefloat_text();
            if (s1 === peg$FAILED) {
              s1 = peg$parseinteger_text();
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 101) {
                s2 = peg$c38;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c39);
                }
              }
              if (s2 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 69) {
                  s2 = peg$c40;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c41);
                  }
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parseinteger_text();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c42(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsefloat_text();
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c43(s1);
              }
              s0 = s1;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsefloat_text() {
            var s0, s1, s2, s3, s4, s5;
            var key = peg$currPos * 49 + 24, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 43) {
              s1 = peg$c44;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c45);
              }
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c25;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parseDIGITS();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s4 = peg$c16;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c17);
                  }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseDIGITS();
                  if (s5 !== peg$FAILED) {
                    s3 = [s3, s4, s5];
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c46(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 45) {
                s1 = peg$c47;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c48);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parseDIGITS();
                if (s3 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s4 = peg$c16;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c17);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseDIGITS();
                    if (s5 !== peg$FAILED) {
                      s3 = [s3, s4, s5];
                      s2 = s3;
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c2;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c49(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseinteger() {
            var s0, s1;
            var key = peg$currPos * 49 + 25, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$parseinteger_text();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c50(s1);
            }
            s0 = s1;
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseinteger_text() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 26, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 43) {
              s1 = peg$c44;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c45);
              }
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c25;
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parseDIGIT_OR_UNDER();
              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parseDIGIT_OR_UNDER();
                }
              } else {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 46) {
                  s4 = peg$c16;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c17);
                  }
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = peg$c5;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c2;
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c46(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 45) {
                s1 = peg$c47;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c48);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseDIGIT_OR_UNDER();
                if (s3 !== peg$FAILED) {
                  while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseDIGIT_OR_UNDER();
                  }
                } else {
                  s2 = peg$c2;
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s4 = peg$c16;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c17);
                    }
                  }
                  peg$silentFails--;
                  if (s4 === peg$FAILED) {
                    s3 = peg$c5;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c2;
                  }
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c49(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseboolean() {
            var s0, s1;
            var key = peg$currPos * 49 + 27, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c51) {
              s1 = peg$c51;
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c52);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c53();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 5) === peg$c54) {
                s1 = peg$c54;
                peg$currPos += 5;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c55);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c56();
              }
              s0 = s1;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsearray() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 28, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c7;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c8);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsearray_sep();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsearray_sep();
              }
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s3 = peg$c9;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c10);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c57();
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c7;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c8);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsearray_value();
                if (s2 === peg$FAILED) {
                  s2 = peg$c25;
                }
                if (s2 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s3 = peg$c9;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c10);
                    }
                  }
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c58(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 91) {
                  s1 = peg$c7;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c8);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = [];
                  s3 = peg$parsearray_value_list();
                  if (s3 !== peg$FAILED) {
                    while (s3 !== peg$FAILED) {
                      s2.push(s3);
                      s3 = peg$parsearray_value_list();
                    }
                  } else {
                    s2 = peg$c2;
                  }
                  if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s3 = peg$c9;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c59(s2);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 91) {
                    s1 = peg$c7;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c8);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = peg$parsearray_value_list();
                    if (s3 !== peg$FAILED) {
                      while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = peg$parsearray_value_list();
                      }
                    } else {
                      s2 = peg$c2;
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsearray_value();
                      if (s3 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 93) {
                          s4 = peg$c9;
                          peg$currPos++;
                        } else {
                          s4 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$c10);
                          }
                        }
                        if (s4 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c60(s2, s3);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                }
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsearray_value() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 29, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsearray_sep();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parsearray_sep();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsevalue();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsearray_sep();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parsearray_sep();
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c61(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsearray_value_list() {
            var s0, s1, s2, s3, s4, s5, s6;
            var key = peg$currPos * 49 + 30, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsearray_sep();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parsearray_sep();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsevalue();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsearray_sep();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parsearray_sep();
                }
                if (s3 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s4 = peg$c62;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c63);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$parsearray_sep();
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$parsearray_sep();
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c61(s2);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsearray_sep() {
            var s0;
            var key = peg$currPos * 49 + 31, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$parseS();
            if (s0 === peg$FAILED) {
              s0 = peg$parseNL();
              if (s0 === peg$FAILED) {
                s0 = peg$parsecomment();
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseinline_table() {
            var s0, s1, s2, s3, s4, s5;
            var key = peg$currPos * 49 + 32, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
              s1 = peg$c64;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c65);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parseS();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseS();
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseinline_table_assignment();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseinline_table_assignment();
                }
                if (s3 !== peg$FAILED) {
                  s4 = [];
                  s5 = peg$parseS();
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = peg$parseS();
                  }
                  if (s4 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s5 = peg$c66;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c67);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c68(s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseinline_table_assignment() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            var key = peg$currPos * 49 + 33, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseS();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseS();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsekey();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parseS();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseS();
                }
                if (s3 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s4 = peg$c18;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c19);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$parseS();
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$parseS();
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsevalue();
                      if (s6 !== peg$FAILED) {
                        s7 = [];
                        s8 = peg$parseS();
                        while (s8 !== peg$FAILED) {
                          s7.push(s8);
                          s8 = peg$parseS();
                        }
                        if (s7 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 44) {
                            s8 = peg$c62;
                            peg$currPos++;
                          } else {
                            s8 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$c63);
                            }
                          }
                          if (s8 !== peg$FAILED) {
                            s9 = [];
                            s10 = peg$parseS();
                            while (s10 !== peg$FAILED) {
                              s9.push(s10);
                              s10 = peg$parseS();
                            }
                            if (s9 !== peg$FAILED) {
                              peg$reportedPos = s0;
                              s1 = peg$c69(s2, s6);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c2;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = [];
              s2 = peg$parseS();
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parseS();
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsekey();
                if (s2 !== peg$FAILED) {
                  s3 = [];
                  s4 = peg$parseS();
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseS();
                  }
                  if (s3 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 61) {
                      s4 = peg$c18;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c19);
                      }
                    }
                    if (s4 !== peg$FAILED) {
                      s5 = [];
                      s6 = peg$parseS();
                      while (s6 !== peg$FAILED) {
                        s5.push(s6);
                        s6 = peg$parseS();
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parsevalue();
                        if (s6 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c69(s2, s6);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsesecfragment() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 34, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
              s1 = peg$c16;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c17);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseDIGITS();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c70(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsedate() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
            var key = peg$currPos * 49 + 35, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parseDIGIT_OR_UNDER();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseDIGIT_OR_UNDER();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseDIGIT_OR_UNDER();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseDIGIT_OR_UNDER();
                  if (s5 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 45) {
                      s6 = peg$c47;
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c48);
                      }
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseDIGIT_OR_UNDER();
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parseDIGIT_OR_UNDER();
                        if (s8 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 45) {
                            s9 = peg$c47;
                            peg$currPos++;
                          } else {
                            s9 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$c48);
                            }
                          }
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parseDIGIT_OR_UNDER();
                            if (s10 !== peg$FAILED) {
                              s11 = peg$parseDIGIT_OR_UNDER();
                              if (s11 !== peg$FAILED) {
                                s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11];
                                s1 = s2;
                              } else {
                                peg$currPos = s1;
                                s1 = peg$c2;
                              }
                            } else {
                              peg$currPos = s1;
                              s1 = peg$c2;
                            }
                          } else {
                            peg$currPos = s1;
                            s1 = peg$c2;
                          }
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c71(s1);
            }
            s0 = s1;
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsetime() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            var key = peg$currPos * 49 + 36, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parseDIGIT_OR_UNDER();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseDIGIT_OR_UNDER();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s4 = peg$c72;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c73);
                  }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseDIGIT_OR_UNDER();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseDIGIT_OR_UNDER();
                    if (s6 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 58) {
                        s7 = peg$c72;
                        peg$currPos++;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$c73);
                        }
                      }
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parseDIGIT_OR_UNDER();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parseDIGIT_OR_UNDER();
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parsesecfragment();
                            if (s10 === peg$FAILED) {
                              s10 = peg$c25;
                            }
                            if (s10 !== peg$FAILED) {
                              s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10];
                              s1 = s2;
                            } else {
                              peg$currPos = s1;
                              s1 = peg$c2;
                            }
                          } else {
                            peg$currPos = s1;
                            s1 = peg$c2;
                          }
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c74(s1);
            }
            s0 = s1;
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsetime_with_offset() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;
            var key = peg$currPos * 49 + 37, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parseDIGIT_OR_UNDER();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseDIGIT_OR_UNDER();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s4 = peg$c72;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c73);
                  }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseDIGIT_OR_UNDER();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseDIGIT_OR_UNDER();
                    if (s6 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 58) {
                        s7 = peg$c72;
                        peg$currPos++;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$c73);
                        }
                      }
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parseDIGIT_OR_UNDER();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parseDIGIT_OR_UNDER();
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parsesecfragment();
                            if (s10 === peg$FAILED) {
                              s10 = peg$c25;
                            }
                            if (s10 !== peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 45) {
                                s11 = peg$c47;
                                peg$currPos++;
                              } else {
                                s11 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$c48);
                                }
                              }
                              if (s11 === peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 43) {
                                  s11 = peg$c44;
                                  peg$currPos++;
                                } else {
                                  s11 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$c45);
                                  }
                                }
                              }
                              if (s11 !== peg$FAILED) {
                                s12 = peg$parseDIGIT_OR_UNDER();
                                if (s12 !== peg$FAILED) {
                                  s13 = peg$parseDIGIT_OR_UNDER();
                                  if (s13 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 58) {
                                      s14 = peg$c72;
                                      peg$currPos++;
                                    } else {
                                      s14 = peg$FAILED;
                                      if (peg$silentFails === 0) {
                                        peg$fail(peg$c73);
                                      }
                                    }
                                    if (s14 !== peg$FAILED) {
                                      s15 = peg$parseDIGIT_OR_UNDER();
                                      if (s15 !== peg$FAILED) {
                                        s16 = peg$parseDIGIT_OR_UNDER();
                                        if (s16 !== peg$FAILED) {
                                          s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16];
                                          s1 = s2;
                                        } else {
                                          peg$currPos = s1;
                                          s1 = peg$c2;
                                        }
                                      } else {
                                        peg$currPos = s1;
                                        s1 = peg$c2;
                                      }
                                    } else {
                                      peg$currPos = s1;
                                      s1 = peg$c2;
                                    }
                                  } else {
                                    peg$currPos = s1;
                                    s1 = peg$c2;
                                  }
                                } else {
                                  peg$currPos = s1;
                                  s1 = peg$c2;
                                }
                              } else {
                                peg$currPos = s1;
                                s1 = peg$c2;
                              }
                            } else {
                              peg$currPos = s1;
                              s1 = peg$c2;
                            }
                          } else {
                            peg$currPos = s1;
                            s1 = peg$c2;
                          }
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c74(s1);
            }
            s0 = s1;
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsedatetime() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 49 + 38, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$parsedate();
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 84) {
                s2 = peg$c75;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c76);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsetime();
                if (s3 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 90) {
                    s4 = peg$c77;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c78);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c79(s1, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsedate();
              if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 84) {
                  s2 = peg$c75;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c76);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parsetime_with_offset();
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c80(s1, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseS() {
            var s0;
            var key = peg$currPos * 49 + 39, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            if (peg$c81.test(input.charAt(peg$currPos))) {
              s0 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c82);
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseNL() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 40, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            if (input.charCodeAt(peg$currPos) === 10) {
              s0 = peg$c83;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c84);
              }
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 13) {
                s1 = peg$c85;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c86);
                }
              }
              if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 10) {
                  s2 = peg$c83;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c84);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseNLS() {
            var s0;
            var key = peg$currPos * 49 + 41, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$parseNL();
            if (s0 === peg$FAILED) {
              s0 = peg$parseS();
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseEOF() {
            var s0, s1;
            var key = peg$currPos * 49 + 42, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            peg$silentFails++;
            if (input.length > peg$currPos) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c6);
              }
            }
            peg$silentFails--;
            if (s1 === peg$FAILED) {
              s0 = peg$c5;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseHEX() {
            var s0;
            var key = peg$currPos * 49 + 43, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            if (peg$c87.test(input.charAt(peg$currPos))) {
              s0 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c88);
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseDIGIT_OR_UNDER() {
            var s0, s1;
            var key = peg$currPos * 49 + 44, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            if (peg$c89.test(input.charAt(peg$currPos))) {
              s0 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c90);
              }
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 95) {
                s1 = peg$c91;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c92);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c93();
              }
              s0 = s1;
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseASCII_BASIC() {
            var s0;
            var key = peg$currPos * 49 + 45, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            if (peg$c94.test(input.charAt(peg$currPos))) {
              s0 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c95);
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseDIGITS() {
            var s0, s1, s2;
            var key = peg$currPos * 49 + 46, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseDIGIT_OR_UNDER();
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parseDIGIT_OR_UNDER();
              }
            } else {
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c96(s1);
            }
            s0 = s1;
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseESCAPED() {
            var s0, s1;
            var key = peg$currPos * 49 + 47, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c97) {
              s1 = peg$c97;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c98);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c99();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c100) {
                s1 = peg$c100;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c101);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c102();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c103) {
                  s1 = peg$c103;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c104);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c105();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c106) {
                    s1 = peg$c106;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c107);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c108();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c109) {
                      s1 = peg$c109;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c110);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c111();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c112) {
                        s1 = peg$c112;
                        peg$currPos += 2;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$c113);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c114();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 2) === peg$c115) {
                          s1 = peg$c115;
                          peg$currPos += 2;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$c116);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c117();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseESCAPED_UNICODE();
                        }
                      }
                    }
                  }
                }
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseESCAPED_UNICODE() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            var key = peg$currPos * 49 + 48, cached = peg$cache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c118) {
              s1 = peg$c118;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c119);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parseHEX();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseHEX();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseHEX();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseHEX();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseHEX();
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parseHEX();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parseHEX();
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parseHEX();
                            if (s10 !== peg$FAILED) {
                              s3 = [s3, s4, s5, s6, s7, s8, s9, s10];
                              s2 = s3;
                            } else {
                              peg$currPos = s2;
                              s2 = peg$c2;
                            }
                          } else {
                            peg$currPos = s2;
                            s2 = peg$c2;
                          }
                        } else {
                          peg$currPos = s2;
                          s2 = peg$c2;
                        }
                      } else {
                        peg$currPos = s2;
                        s2 = peg$c2;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c2;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c120(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c121) {
                s1 = peg$c121;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c122);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parseHEX();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseHEX();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseHEX();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseHEX();
                      if (s6 !== peg$FAILED) {
                        s3 = [s3, s4, s5, s6];
                        s2 = s3;
                      } else {
                        peg$currPos = s2;
                        s2 = peg$c2;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c2;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c120(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
            peg$cache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          var nodes = [];
          function genError(err, line2, col) {
            var ex = new Error(err);
            ex.line = line2;
            ex.column = col;
            throw ex;
          }
          function addNode(node2) {
            nodes.push(node2);
          }
          function node(type, value, line2, column2, key) {
            var obj = { type, value, line: line2(), column: column2() };
            if (key) obj.key = key;
            return obj;
          }
          function convertCodePoint(str, line2, col) {
            var num = parseInt("0x" + str);
            if (!isFinite(num) || Math.floor(num) != num || num < 0 || num > 1114111 || num > 55295 && num < 57344) {
              genError("Invalid Unicode escape code: " + str, line2, col);
            } else {
              return fromCodePoint(num);
            }
          }
          function fromCodePoint() {
            var MAX_SIZE = 16384;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) {
              return "";
            }
            var result = "";
            while (++index < length) {
              var codePoint = Number(arguments[index]);
              if (codePoint <= 65535) {
                codeUnits.push(codePoint);
              } else {
                codePoint -= 65536;
                highSurrogate = (codePoint >> 10) + 55296;
                lowSurrogate = codePoint % 1024 + 56320;
                codeUnits.push(highSurrogate, lowSurrogate);
              }
              if (index + 1 == length || codeUnits.length > MAX_SIZE) {
                result += String.fromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
              }
            }
            return result;
          }
          peg$result = peg$startRuleFunction();
          if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
          } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
              peg$fail({ type: "end", description: "end of input" });
            }
            throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
          }
        }
        return {
          SyntaxError,
          parse: parse2
        };
      })();
    }
  });

  // node_modules/toml/lib/compiler.js
  var require_compiler = __commonJS({
    "node_modules/toml/lib/compiler.js"(exports, module) {
      "use strict";
      function compile(nodes) {
        var assignedPaths = [];
        var valueAssignments = [];
        var currentPath = "";
        var data = /* @__PURE__ */ Object.create(null);
        var context = data;
        var arrayMode = false;
        return reduce(nodes);
        function reduce(nodes2) {
          var node;
          for (var i = 0; i < nodes2.length; i++) {
            node = nodes2[i];
            switch (node.type) {
              case "Assign":
                assign(node);
                break;
              case "ObjectPath":
                setPath(node);
                break;
              case "ArrayPath":
                addTableArray(node);
                break;
            }
          }
          return data;
        }
        function genError(err, line, col) {
          var ex = new Error(err);
          ex.line = line;
          ex.column = col;
          throw ex;
        }
        function assign(node) {
          var key = node.key;
          var value = node.value;
          var line = node.line;
          var column = node.column;
          var fullPath;
          if (currentPath) {
            fullPath = currentPath + "." + key;
          } else {
            fullPath = key;
          }
          if (typeof context[key] !== "undefined") {
            genError("Cannot redefine existing key '" + fullPath + "'.", line, column);
          }
          context[key] = reduceValueNode(value);
          if (!pathAssigned(fullPath)) {
            assignedPaths.push(fullPath);
            valueAssignments.push(fullPath);
          }
        }
        function pathAssigned(path) {
          return assignedPaths.indexOf(path) !== -1;
        }
        function reduceValueNode(node) {
          if (node.type === "Array") {
            return reduceArrayWithTypeChecking(node.value);
          } else if (node.type === "InlineTable") {
            return reduceInlineTableNode(node.value);
          } else {
            return node.value;
          }
        }
        function reduceInlineTableNode(values) {
          var obj = /* @__PURE__ */ Object.create(null);
          for (var i = 0; i < values.length; i++) {
            var val = values[i];
            if (val.value.type === "InlineTable") {
              obj[val.key] = reduceInlineTableNode(val.value.value);
            } else if (val.type === "InlineTableValue") {
              obj[val.key] = reduceValueNode(val.value);
            }
          }
          return obj;
        }
        function setPath(node) {
          var path = node.value;
          var quotedPath = path.map(quoteDottedString).join(".");
          var line = node.line;
          var column = node.column;
          if (pathAssigned(quotedPath)) {
            genError("Cannot redefine existing key '" + path + "'.", line, column);
          }
          assignedPaths.push(quotedPath);
          context = deepRef(data, path, /* @__PURE__ */ Object.create(null), line, column);
          currentPath = path;
        }
        function addTableArray(node) {
          var path = node.value;
          var quotedPath = path.map(quoteDottedString).join(".");
          var line = node.line;
          var column = node.column;
          if (!pathAssigned(quotedPath)) {
            assignedPaths.push(quotedPath);
          }
          assignedPaths = assignedPaths.filter(function(p) {
            return p.indexOf(quotedPath) !== 0;
          });
          assignedPaths.push(quotedPath);
          context = deepRef(data, path, [], line, column);
          currentPath = quotedPath;
          if (context instanceof Array) {
            var newObj = /* @__PURE__ */ Object.create(null);
            context.push(newObj);
            context = newObj;
          } else {
            genError("Cannot redefine existing key '" + path + "'.", line, column);
          }
        }
        function deepRef(start, keys, value, line, column) {
          var traversed = [];
          var traversedPath = "";
          var path = keys.join(".");
          var ctx = start;
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            traversed.push(key);
            traversedPath = traversed.join(".");
            if (typeof ctx[key] === "undefined") {
              if (i === keys.length - 1) {
                ctx[key] = value;
              } else {
                ctx[key] = /* @__PURE__ */ Object.create(null);
              }
            } else if (i !== keys.length - 1 && valueAssignments.indexOf(traversedPath) > -1) {
              genError("Cannot redefine existing key '" + traversedPath + "'.", line, column);
            }
            ctx = ctx[key];
            if (ctx instanceof Array && ctx.length && i < keys.length - 1) {
              ctx = ctx[ctx.length - 1];
            }
          }
          return ctx;
        }
        function reduceArrayWithTypeChecking(array) {
          var firstType = null;
          for (var i = 0; i < array.length; i++) {
            var node = array[i];
            if (firstType === null) {
              firstType = node.type;
            } else {
              if (node.type !== firstType) {
                genError("Cannot add value of type " + node.type + " to array of type " + firstType + ".", node.line, node.column);
              }
            }
          }
          return array.map(reduceValueNode);
        }
        function quoteDottedString(str) {
          if (str.indexOf(".") > -1) {
            return '"' + str + '"';
          } else {
            return str;
          }
        }
      }
      module.exports = {
        compile
      };
    }
  });

  // node_modules/toml/index.js
  var require_toml = __commonJS({
    "node_modules/toml/index.js"(exports, module) {
      var parser = require_parser();
      var compiler = require_compiler();
      module.exports = {
        parse: function(input) {
          var nodes = parser.parse(input.toString());
          return compiler.compile(nodes);
        }
      };
    }
  });

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b642) {
        var len2 = b642.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b642.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b642) {
        var lens = getLens(b642);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b642, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b642) {
        var tmp;
        var lens = getLens(b642);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b642, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b642.charCodeAt(i2)] << 18 | revLookup[b642.charCodeAt(i2 + 1)] << 12 | revLookup[b642.charCodeAt(i2 + 2)] << 6 | revLookup[b642.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b642.charCodeAt(i2)] << 2 | revLookup[b642.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b642.charCodeAt(i2)] << 10 | revLookup[b642.charCodeAt(i2 + 1)] << 4 | revLookup[b642.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/buffer/index.js"(exports) {
      "use strict";
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer3;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer3.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer3.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function Buffer3(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer3.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer3.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer3, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer3.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer3.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer3.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer3.alloc(+length);
      }
      Buffer3.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer3.prototype;
      };
      Buffer3.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
        if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer3.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer3.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer3.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer3.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer3.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer3.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer3.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer3.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer3.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
      Buffer3.prototype.equals = function equals(b) {
        if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer3.compare(this, b) === 0;
      };
      Buffer3.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
      }
      Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer3.from(target, target.offset, target.byteLength);
        }
        if (!Buffer3.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer3.from(val, encoding);
        }
        if (Buffer3.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer3.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer3.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer3.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer3.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer3.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // node_modules/nodejs-base64/src/index.js
  var require_src = __commonJS({
    "node_modules/nodejs-base64/src/index.js"(exports) {
      "use strict";
      exports.__esModule = true;
      exports.base64decode = exports.base64encode = void 0;
      function base64encode2(str) {
        if (typeof str !== "string") {
          if (typeof str === "number") {
            str = str.toString();
          } else {
            throw new Error("Text to encode must be a string or a number.");
          }
        }
        return Buffer.from(str, "utf8").toString("base64");
      }
      exports.base64encode = base64encode2;
      function base64decode2(str) {
        if (typeof str !== "string") {
          throw new Error("Input value must be a string.");
        }
        return Buffer.from(str, "base64").toString("utf8");
      }
      exports.base64decode = base64decode2;
      exports["default"] = { base64encode: base64encode2, base64decode: base64decode2 };
    }
  });

  // conf.mjs
  var toml = __toESM(require_toml(), 1);
  var qs = Object.fromEntries(new URLSearchParams(location.search));
  console.log(qs);
  var confP = fetch(`${qs["baseurl"]}WebRTCInfo/?session=${qs["session"]}`, { cache: "no-store" }).then((res) => res.text()).then((txt) => {
    console.log(`GOT TOML: ${txt}`);
    return toml.parse(txt);
  });
  console.log(confP);

  // timedMessage.mjs
  var timedMessage = class {
    constructor(message) {
      this.Message = message;
      this.Timestamp = (/* @__PURE__ */ new Date()).getTime() + "000";
    }
    static checkAndReturn(timed) {
      let now = parseInt((/* @__PURE__ */ new Date()).getTime() + "000");
      if (Math.abs(parseInt(timed.Timestamp - now)) > 15 * 1e3 * 1e3)
        throw new Error("Message too old or too new.");
      else {
        return timed.Message;
      }
    }
  };

  // hashAuthenticatedMessage.mjs
  var hashAlgo = "SHA-256";
  var hashAuthenticatedMessage = class {
    #key8;
    MAC;
    MAC8;
    Message;
    key;
    constructor(message, key) {
      window.hashAlgo = hashAlgo;
      this.MessageWithTime = message;
      this.Message8 = new Uint8Array(message.length);
      this.key = key;
      let encoder = new TextEncoder();
      encoder.encodeInto(message, this.Message8);
      this.#key8 = new Uint8Array(key.length);
      encoder.encodeInto(key, this.#key8);
    }
    static async verifyHmacSHA256(message, key, expectedHex) {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        encoder.encode(message)
      );
      const computedHex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
      if (computedHex !== expectedHex) {
        console.error("HMAC verification failed", {
          message,
          key,
          expectedHex,
          computedHex
        });
        return false;
      }
      return true;
    }
    async hmacSHA256(message, key) {
      const enc = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        enc.encode(message)
      );
      return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    async compute() {
      this.MAC8 = await this.hmacSHA256(this.MessageWithTime, this.key);
      this.MAC = "";
      for (let i = 0; i < this.MAC8.length; i++) {
        this.MAC += this.MAC8[i].toString(16).padStart(2, 0);
      }
      console.log("MAC8 follows for: ${} ${}");
      console.log(this.MAC8);
      this.MAC = this.MAC8;
      return this.MAC8;
      delete this.MAC8;
      delete this.Message8;
      return this.MAC8;
    }
    static async verifyAndReturn(message, key, hash) {
      console.log(`called to verify: ${message}, ${hash}`);
      let encoder = new TextEncoder();
      let key8 = new Uint8Array(key.length);
      let message8 = new Uint8Array(message.length);
      let hashA = hash.split("");
      let hash8tmp = [];
      let b = "";
      console.log(hashA);
      while (hashA.length !== 0) {
        let b2 = hashA.splice(0, 2);
        hash8tmp.push(parseInt(b2.join(""), 16));
      }
      message8 = new Uint8Array(message.length);
      encoder.encodeInto(message, message8);
      message8 = encoder.encode(message);
      let hash8 = new Uint8Array(hash8tmp);
      encoder.encodeInto(key, key8);
      key8 = encoder.encode(key);
      let result = await this.verifyHmacSHA256(message, key, hash);
      let debugResult = "";
      var debugResultFormatted = "";
      for (let i = 0; i < debugResult.length; i++) {
        debugResultFormatted += debugResult[i].toString(16).padStart(2, 0);
      }
      if (result === false)
        throw new Error(
          `MAC Error, expected: ${hash}, got ${debugResultFormatted}`
        );
      else return message;
    }
  };

  // offer-listen.js
  var import_buffer = __toESM(require_buffer(), 1);
  var b64 = __toESM(require_src(), 1);
  globalThis.Buffer = globalThis.Buffer || import_buffer.Buffer;
  var qs2 = Object.fromEntries(new URLSearchParams(location.search));
  console.log(qs2);
  async function initDC() {
    var conf = await confP;
    window.conf = conf;
    console.assert(conf.WebRTCMode == "Offer");
    if (conf.WebRTCMode != "Offer") {
      console.error("Wrong TOOL: Wrong WebRTCMode");
      process.exit(2);
    }
    console.assert(conf.PublishType == "ws");
    let connected = false;
    let answerUnvalidated;
    let to_dc = (x) => {
      to_dc_queue.push(x);
    };
    let to_os = (x) => {
      to_os_queue.push(x);
    };
    let to_dc_queue = [];
    let to_os_queue = [];
    let os_connected = false;
    let MAX_BUF = 1024 * 1024;
    const selftest = false;
    if (selftest) {
      let verify = function(result) {
        hashAuthenticatedMessage.verifyAndReturn("hello", am, result);
      };
      let am = new hashAuthenticatedMessage("hello", "hello");
      let _stmac;
      _stmac = await am.compute();
      console.log(`stmac: ${_stmac}`);
      verify(_stmac);
      console.log(am);
    }
    let EndpointURL = conf.PublishEndpoint.split("//").slice(1).join("//");
    let wsurl = `wss://${conf.PublishAuthUser}:${conf.PublishAuthPass}@${EndpointURL}?user=${conf.PublishAuthUser}&pass=${conf.PublishAuthPass}`;
    console.log(wsurl);
    let sigSocket = new WebSocket(wsurl);
    sigSocket.addEventListener("message", (e) => {
      console.log(e.data);
      answerUnvalidated = e.data;
      gotAnswer();
    });
    sigSocket.addEventListener("close", (e) => {
      console.warn("websocket: closed");
      if (!window.vncDC || window.initDC.readyState !== "open") initDC();
    });
    sigSocket.addEventListener("open", (e) => {
      proceedToWebRTC();
    });
    let addrPortPair = `${conf.Address}:${conf.Port}`;
    console.log(`Should listen on: ${addrPortPair}`);
    let transformedICEServers = [];
    for (const serverList in conf.ICEServers) {
      let transformedServerList = {};
      for (const key in conf.ICEServers[serverList]) {
        Object.defineProperty(transformedServerList, key.toLowerCase(), {
          value: conf.ICEServers[serverList][key],
          enumerable: true
        });
      }
      transformedICEServers.push(transformedServerList);
    }
    const RTCConfig = { iceServers: transformedICEServers };
    if (selftest) console.log(JSON.stringify(RTCConfig));
    let pc_state_change = (x) => {
      console.log(
        "Peer connection state: " + JSON.stringify(x) + " " + pc.connectionState
      );
      if (pc.connectionState == "connected") {
        connected = true;
      }
    };
    let pc_ice_error = (x) => console.dir(x);
    let pc_ice_gathering_change = (x) => console.dir(x);
    let pc_ice_candidate = (x) => {
      if (selftest) console.dir(x);
      if (x.candidate == null) console.log(pc.localDescription);
    };
    let pc_negotiation_needed = (x) => pc.createOffer().then(offerReady);
    let offerReady = (x) => {
      console.dir(x);
      pc.setLocalDescription(x);
    };
    let dc_open = () => {
      window.Link();
      console.log("DC open");
      console.log(`to_dc_queue: ${to_dc_queue.length}`);
      to_dc = (x) => {
        TSLDCS = 0;
        if (dc.bufferedAmount < MAX_BUF) dc.send(x);
      };
      to_dc_queue.forEach((v) => to_dc(v));
    };
    let dc_close = () => {
      console.log("DC closed");
    };
    let dc_inc = (e) => {
      if (selftest)
        console.log(`DC incoming: ${JSON.stringify(e.data.byteLength)}`);
      to_os(import_buffer.Buffer.from(e.data));
    };
    let pc = new RTCPeerConnection(RTCConfig);
    let dc;
    let gotAnswer;
    function proceedToWebRTC() {
      pc.addEventListener("connectionstatechange", pc_state_change);
      pc.addEventListener("icegatheringerror", pc_ice_error);
      pc.addEventListener("icegatheringstatechange", pc_ice_gathering_change);
      pc.addEventListener("icecandidate", pc_ice_candidate);
      dc = pc.createDataChannel("data", {
        ordered: true
        // maxPacketLifetime: 0,
        //maxRetransmts: 0,
      });
      window.vncDC = dc;
      dc.addEventListener("message", dc_inc);
      dc.addEventListener("open", dc_open);
      dc.addEventListener("close", dc_close);
      dc.binaryType = "arraybuffer";
      pc.addEventListener("negotiationneeded", pc_negotiation_needed);
      if (selftest)
        setTimeout(
          () => console.log(
            "Gathered so far: " + JSON.stringify(pc.localDescription)
          ),
          5e3
        );
      setTimeout(
        () => doneGeneratingOffer(JSON.stringify(pc.localDescription)),
        2500
      );
      function doneGeneratingOffer(offer) {
        let timed = new timedMessage(b64.base64encode(offer));
        let serializedTimed = JSON.stringify(timed);
        let hmacMessage = new hashAuthenticatedMessage(
          serializedTimed,
          conf.PeerPSK
        );
        hmacMessage.compute().then(() => sendOffer(hmacMessage));
      }
      function sendOffer(hmacMessage) {
        window.currentSent = hmacMessage;
        console.log(JSON.stringify(hmacMessage));
        sigSocket.send(JSON.stringify(hmacMessage));
      }
      gotAnswer = async function() {
        let aU = JSON.parse(answerUnvalidated);
        console.log(aU);
        let hashValidated = await hashAuthenticatedMessage.verifyAndReturn(
          aU.MessageWithTime,
          conf.PeerPSK,
          aU.MAC
        );
        console.log({ hV: hashValidated });
        let timeValidated = timedMessage.checkAndReturn(
          JSON.parse(hashValidated)
        );
        console.log({ tV: timeValidated });
        pc.setRemoteDescription(
          new RTCSessionDescription(
            JSON.parse(b64.base64decode(timeValidated))
          )
        );
      };
    }
    let TSLDCS = 0;
    let TSLOSS = 0;
    setInterval(function() {
      TSLDCS++;
      TSLOSS++;
      if (TSLDCS >= conf.TimeoutCountMax || TSLOSS >= conf.TimeoutCountMax) {
      }
    }, 1e3);
  }
  window.initDC = initDC;
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
//# sourceMappingURL=bundle.js.map
