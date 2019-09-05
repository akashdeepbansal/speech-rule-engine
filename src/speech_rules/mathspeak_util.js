// Copyright 2014 Volker Sorge
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility functions for mathspeak rules.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

goog.provide('sre.MathspeakUtil');

goog.require('sre.BaseUtil');
goog.require('sre.DomUtil');
goog.require('sre.Messages');
goog.require('sre.NumbersUtil');
goog.require('sre.Semantic');
goog.require('sre.SemanticProcessor');
goog.require('sre.SystemExternal');
goog.require('sre.XpathUtil');


goog.scope(function() {
var msg = sre.Messages;


/**
 * String function to separate text into single characters by adding
 * intermittent spaces.
 * @param {!Node} node The node to be processed.
 * @return {string} The spaced out text.
 */
sre.MathspeakUtil.spaceoutText = function(node) {
  return node.textContent.split('').join(' ');
};


/**
 * Spaces out content of the given node into new elements with single character
 * content.
 * @param {!Node} node The node to be processed.
 * @param {function(sre.SemanticNode)} correction A correction function applied
 *     to the newly created semantic node with single characters.
 * @return {Array.<Node>} List of single nodes.
 */
sre.MathspeakUtil.spaceoutNodes = function(node, correction) {
  var content = node.textContent.split('');
  var result = [];
  var processor = sre.SemanticProcessor.getInstance();
  var doc = node.ownerDocument;
  for (var i = 0, chr; chr = content[i]; i++) {
    var sn = processor.identifierNode(chr, sre.Semantic.Font.UNKNOWN, '');
    correction(sn);
    result.push(sn.xml(doc));
  }
  return result;

};


/**
 * Query function that splits into number nodes and content nodes.
 * @param {!Node} node The node to be processed.
 * @return {Array.<Node>} List of single number nodes.
 */
sre.MathspeakUtil.spaceoutNumber = function(node) {
  return sre.MathspeakUtil.spaceoutNodes(
      node,
      function(sn) {
        if (!sn.textContent.match(/\W/)) {
          sn.type = sre.Semantic.Type.NUMBER;
        }
      });
};


/**
 * Query function that splits into number nodes and content nodes.
 * @param {!Node} node The node to be processed.
 * @return {Array.<Node>} List of single identifier nodes.
 */
sre.MathspeakUtil.spaceoutIdentifier = function(node) {
  return sre.MathspeakUtil.spaceoutNodes(
      node,
      function(sn) {
        sn.font = sre.Semantic.Font.UNKNOWN;
        sn.type = sre.Semantic.Type.IDENTIFIER;
      });
};


/**
 * Tags that serve as a nesting barrier by default.
 * @type {Array.<sre.Semantic.Type>}
 */
sre.MathspeakUtil.nestingBarriers = [
  sre.Semantic.Type.CASES,
  sre.Semantic.Type.CELL,
  sre.Semantic.Type.INTEGRAL,
  sre.Semantic.Type.LINE,
  sre.Semantic.Type.MATRIX,
  sre.Semantic.Type.MULTILINE,
  sre.Semantic.Type.OVERSCORE,
  sre.Semantic.Type.ROOT,
  sre.Semantic.Type.ROW,
  sre.Semantic.Type.SQRT,
  sre.Semantic.Type.SUBSCRIPT,
  sre.Semantic.Type.SUPERSCRIPT,
  sre.Semantic.Type.TABLE,
  sre.Semantic.Type.UNDERSCORE,
  sre.Semantic.Type.VECTOR
];


/**
 * Dictionary to store the nesting depth of each node.
 * @type {Object.<Object.<number>>}
 */
sre.MathspeakUtil.nestingDepth = {};


/**
 * Resets the nesting depth parameters. Method should be used on every new
 * expression.
 * @param {Node} node The node to translate.
 * @return {Array.<Node>} Array containing the original node only.
 */
sre.MathspeakUtil.resetNestingDepth = function(node) {
  sre.MathspeakUtil.nestingDepth = {};
  return [node];
};


/**
 * Computes the depth of nested descendants of a particular set of tags for a
 * node.
 * @param {string} type The type of nesting depth.
 * @param {!Node} node The XML node to check.
 * @param {Array.<string>} tags The tags to be considered for the nesting depth.
 * @param {Array.<sre.Semantic.Attr>=} opt_barrierTags Optional list of tags
 *     that serve as barrier.
 * @param {Object.<string>=} opt_barrierAttrs Attribute value pairs that
 *     serve as barrier.
 * @param {function(!Node): boolean=} opt_func A function that overrides both
 *     tags and attribute barriers, i.e., if function returns true it will be
 *     considered as barrier, otherwise tags and attributes will be considered.
 * @return {number} The nesting depth.
 */
sre.MathspeakUtil.getNestingDepth = function(type, node, tags, opt_barrierTags,
                                             opt_barrierAttrs, opt_func) {
  opt_barrierTags = opt_barrierTags || sre.MathspeakUtil.nestingBarriers;
  opt_barrierAttrs = opt_barrierAttrs || {};
  opt_func = opt_func || function(node) { return false; };
  var xmlText = new sre.SystemExternal.xmldom.XMLSerializer().
          serializeToString(node);
  if (!sre.MathspeakUtil.nestingDepth[type]) {
    sre.MathspeakUtil.nestingDepth[type] = {};
  }
  if (sre.MathspeakUtil.nestingDepth[type][xmlText]) {
    return sre.MathspeakUtil.nestingDepth[type][xmlText];
  }
  if (opt_func(node) || tags.indexOf(node.tagName) < 0) {
    return 0;
  }
  var depth = sre.MathspeakUtil.computeNestingDepth_(
      node, tags, sre.BaseUtil.setdifference(opt_barrierTags, tags),
      opt_barrierAttrs, opt_func, 0);
  sre.MathspeakUtil.nestingDepth[type][xmlText] = depth;
  return depth;
};


/**
 * Checks if a node contains given attribute value pairs.
 * @param {!Node} node The XML node to check.
 * @param {Object.<string>} attrs Attribute value pairs.
 * @return {boolean} True if all attributes are contained and have the given
 *     values.
 */
sre.MathspeakUtil.containsAttr = function(node, attrs) {
  if (!node.attributes) {
    return false;
  }
  var attributes = sre.DomUtil.toArray(node.attributes);
  for (var i = 0, attr; attr = attributes[i]; i++) {
    if (attrs[attr.nodeName] === attr.nodeValue) {
      return true;
    }
  }
  return false;
};


/**
 * Computes the depth of nested descendants of a particular set of tags for a
 * node recursively.
 * @param {!Node} node The XML node to process.
 * @param {Array.<string>} tags The tags to be considered for the nesting depth.
 * @param {Array.<string>} barriers List of tags that serve as barrier.
 * @param {Object.<string>} attrs Attribute value pairs that serve as
 *     barrier.
 * @param {function(!Node): boolean} func A function that overrides both tags
 *     and attribute barriers, i.e., if function returns true it will be
 *     considered as barrier, otherwise tags and attributes will be considered.
 * @param {number} depth Accumulator for the nesting depth that is computed.
 * @return {number} The nesting depth.
 * @private
 */
sre.MathspeakUtil.computeNestingDepth_ = function(
    node, tags, barriers, attrs, func, depth) {
  if (func(node) ||
      barriers.indexOf(node.tagName) > -1 ||
      sre.MathspeakUtil.containsAttr(node, attrs))
  {
    return depth;
  }
  if (tags.indexOf(node.tagName) > -1) {
    depth++;
  }
  if (!node.childNodes || node.childNodes.length === 0) {
    return depth;
  }
  var children = sre.DomUtil.toArray(node.childNodes);
  return Math.max.apply(null, children.map(
      function(subNode) {
        return sre.MathspeakUtil.computeNestingDepth_(
            subNode, tags, barriers, attrs, func, depth);
      }));
};


// TODO (sorge) Refactor the following to functions wrt. style attribute.
/**
 * Computes and returns the nesting depth of fraction nodes.
 * @param {!Node} node The fraction node.
 * @return {number} The nesting depth. 0 if the node is not a fraction.
 */
sre.MathspeakUtil.fractionNestingDepth = function(node) {
  return sre.MathspeakUtil.getNestingDepth(
      'fraction', node, ['fraction'], sre.MathspeakUtil.nestingBarriers, {},
      msg.MS_FUNC.FRAC_NEST_DEPTH);
};


/**
 * Computes disambiguations for nested fractions.
 * @param {!Node} node The fraction node.
 * @param {string} expr The disambiguating expression.
 * @param {string=} opt_end Optional end expression.
 * @return {string} The disambiguating string.
 */
sre.MathspeakUtil.nestedFraction = function(node, expr, opt_end) {
  var depth = sre.MathspeakUtil.fractionNestingDepth(node);
  var annotation = Array.apply(null, Array(depth)).map(x => expr);
  if (opt_end) {
    annotation.push(opt_end);
  }
  return annotation.join(msg.REGEXP.JOINER_FRAC);
};


/**
 * Opening string for fractions in Mathspeak verbose mode.
 * @param {!Node} node The fraction node.
 * @return {string} The opening string.
 */
sre.MathspeakUtil.openingFractionVerbose = function(node) {
  return sre.MathspeakUtil.nestedFraction(node, msg.MS.START, msg.MS.FRAC_V);
};


/**
 * Closing string for fractions in Mathspeak verbose mode.
 * @param {!Node} node The fraction node.
 * @return {string} The closing string.
 */
sre.MathspeakUtil.closingFractionVerbose = function(node) {
  return sre.MathspeakUtil.nestedFraction(node, msg.MS.END, msg.MS.FRAC_V);
};


/**
 * Middle string for fractions in Mathspeak verbose mode.
 * @param {!Node} node The fraction node.
 * @return {string} The middle string.
 */
sre.MathspeakUtil.overFractionVerbose = function(node) {
  return sre.MathspeakUtil.nestedFraction(node, msg.MS.FRAC_OVER);
};


/**
 * Opening string for fractions in Mathspeak brief mode.
 * @param {!Node} node The fraction node.
 * @return {string} The opening string.
 */
sre.MathspeakUtil.openingFractionBrief = function(node) {
  return sre.MathspeakUtil.nestedFraction(node, msg.MS.START, msg.MS.FRAC_B);
};


/**
 * Closing string for fractions in Mathspeak brief mode.
 * @param {!Node} node The fraction node.
 * @return {string} The closing string.
 */
sre.MathspeakUtil.closingFractionBrief = function(node) {
  return sre.MathspeakUtil.nestedFraction(node, msg.MS.END, msg.MS.FRAC_B);
};


/**
 * Opening string for fractions in Mathspeak superbrief mode.
 * @param {!Node} node The fraction node.
 * @return {string} The opening string.
 */
sre.MathspeakUtil.openingFractionSbrief = function(node) {
  var depth = sre.MathspeakUtil.fractionNestingDepth(node);
  if (depth === 1) {
    return msg.MS.FRAC_S;
  }
  return msg.MS_FUNC.COMBINE_NESTED_FRACTION(
      msg.MS.NEST_FRAC, msg.MS_FUNC.RADICAL_NEST_DEPTH(depth - 1),
      msg.MS.FRAC_S);
};


/**
 * Closing string for fractions in Mathspeak superbrief mode.
 * @param {!Node} node The fraction node.
 * @return {string} The closing string.
 */
sre.MathspeakUtil.closingFractionSbrief = function(node) {
  var depth = sre.MathspeakUtil.fractionNestingDepth(node);
  if (depth === 1) {
    return msg.MS.ENDFRAC;
  }
  return msg.MS_FUNC.COMBINE_NESTED_FRACTION(
      msg.MS.NEST_FRAC,
      msg.MS_FUNC.RADICAL_NEST_DEPTH(depth - 1),
      msg.MS.ENDFRAC);
};


/**
 * Middle string for fractions in Mathspeak superbrief mode.
 * @param {!Node} node The fraction node.
 * @return {string} The middle string.
 */
sre.MathspeakUtil.overFractionSbrief = function(node) {
  var depth = sre.MathspeakUtil.fractionNestingDepth(node);
  if (depth === 1) {
    return msg.MS.FRAC_OVER;
  }
  return msg.MS_FUNC.COMBINE_NESTED_FRACTION(
      msg.MS.NEST_FRAC,
      msg.MS_FUNC.RADICAL_NEST_DEPTH(depth - 1),
      msg.MS.FRAC_OVER);
};


/**
 * Custom query function to check if a vulgar fraction is small enough to be
 * spoken as numbers in MathSpeak.
 * @param {!Node} node Fraction node to be tested.
 * @return {!Array.<Node>} List containing the node if it is eligible. Otherwise
 *     empty.
 */
sre.MathspeakUtil.isSmallVulgarFraction = function(node) {
  return sre.NumbersUtil.vulgarFractionSmall(node, 10, 100) ? [node] : [];
};


/**
 * Computes prefix for sub and superscript nodes.
 * @param {!Node} node Subscript node.
 * @param {string} init Initial prefix string.
 * @param {{sup: string, sub: string}} replace Prefix strings for sub and
 *     superscript.
 * @return {string} The complete prefix string.
 */
sre.MathspeakUtil.nestedSubSuper = function(node, init, replace) {
  while (node.parentNode) {
    var children = node.parentNode;
    var parent = children.parentNode;
    var nodeRole = node.getAttribute && node.getAttribute('role');
    if ((parent.tagName === sre.Semantic.Type.SUBSCRIPT &&
         node === children.childNodes[1]) ||
        (parent.tagName === sre.Semantic.Type.TENSOR && nodeRole &&
        (nodeRole === sre.Semantic.Role.LEFTSUB ||
        nodeRole === sre.Semantic.Role.RIGHTSUB))) {
      init = replace.sub + msg.REGEXP.JOINER_SUBSUPER + init;
    }
    if ((parent.tagName === sre.Semantic.Type.SUPERSCRIPT &&
         node === children.childNodes[1]) ||
        (parent.tagName === sre.Semantic.Type.TENSOR && nodeRole &&
        (nodeRole === sre.Semantic.Role.LEFTSUPER ||
        nodeRole === sre.Semantic.Role.RIGHTSUPER))) {
      init = replace.sup + msg.REGEXP.JOINER_SUBSUPER + init;
    }
    node = parent;
  }
  return init.trim();
};


/**
 * Computes subscript prefix in verbose mode.
 * @param {!Node} node Subscript node.
 * @return {string} The prefix string.
 */
sre.MathspeakUtil.subscriptVerbose = function(node) {
  return sre.MathspeakUtil.nestedSubSuper(
      node, msg.MS.SUBSCRIPT, {sup: msg.MS.SUPER, sub: msg.MS.SUB});
};


/**
 * Computes subscript prefix in brief mode.
 * @param {!Node} node Subscript node.
 * @return {string} The prefix string.
 */
sre.MathspeakUtil.subscriptBrief = function(node) {
  return sre.MathspeakUtil.nestedSubSuper(
      node, msg.MS.SUB, {sup: msg.MS.SUP, sub: msg.MS.SUB});
};


/**
 * Computes subscript prefix in verbose mode.
 * @param {!Node} node Subscript node.
 * @return {string} The prefix string.
 */
sre.MathspeakUtil.superscriptVerbose = function(node) {
  return sre.MathspeakUtil.nestedSubSuper(
      node, msg.MS.SUPERSCRIPT, {sup: msg.MS.SUPER, sub: msg.MS.SUB});
};


/**
 * Computes subscript prefix in brief mode.
 * @param {!Node} node Subscript node.
 * @return {string} The prefix string.
 */
sre.MathspeakUtil.superscriptBrief = function(node) {
  return sre.MathspeakUtil.nestedSubSuper(
      node, msg.MS.SUP, {sup: msg.MS.SUP, sub: msg.MS.SUB});
};


/**
 * Computes subscript prefix in verbose mode.
 * @param {!Node} node Subscript node.
 * @return {string} The prefix string.
 */
sre.MathspeakUtil.baselineVerbose = function(node) {
  var baseline = sre.MathspeakUtil.nestedSubSuper(
      node, '', {sup: msg.MS.SUPER, sub: msg.MS.SUB});
  if (!baseline) {
    return msg.MS.BASELINE;
  }
  return baseline.replace(new RegExp(msg.MS.SUB + '$'), msg.MS.SUBSCRIPT).
      replace(new RegExp(msg.MS.SUPER + '$'), msg.MS.SUPERSCRIPT);
};


/**
 * Computes subscript prefix in brief mode.
 * @param {!Node} node Subscript node.
 * @return {string} The prefix string.
 */
sre.MathspeakUtil.baselineBrief = function(node) {
  var baseline = sre.MathspeakUtil.nestedSubSuper(
      node, '', {sup: msg.MS.SUP, sub: msg.MS.SUB});
  return baseline || msg.MS.BASE;
};


// TODO (sorge) Refactor the following to functions wrt. style attribute.
/**
 * Computes and returns the nesting depth of radical nodes.
 * @param {!Node} node The radical node.
 * @return {number} The nesting depth. 0 if the node is not a radical.
 */
sre.MathspeakUtil.radicalNestingDepth = function(node) {
  return sre.MathspeakUtil.getNestingDepth(
      'radical', node, ['sqrt', 'root'], sre.MathspeakUtil.nestingBarriers, {});
};


/**
 * Nested string for radicals in Mathspeak mode putting together the nesting
 * depth with a pre- and postfix string that depends on the speech style.
 * @param {!Node} node The radical node.
 * @param {string} prefix A prefix string.
 * @param {string} postfix A postfix string.
 * @return {string} The opening string.
 */
sre.MathspeakUtil.nestedRadical = function(node, prefix, postfix) {
  var depth = sre.MathspeakUtil.radicalNestingDepth(node);
  var index = sre.MathspeakUtil.getRootIndex(node);
  postfix = index ? msg.MS_FUNC.COMBINE_ROOT_INDEX(postfix, index) : postfix;
  if (depth === 1) {
    return postfix;
  }
  return msg.MS_FUNC.COMBINE_NESTED_RADICAL(
      prefix, msg.MS_FUNC.RADICAL_NEST_DEPTH(depth - 1), postfix);
};


/**
 * A string indexing the root.
 * @param {!Node} node The radical node.
 * @return {string} The localised indexing string if it exists.
 */
sre.MathspeakUtil.getRootIndex = function(node) {
  var content = node.tagName === 'sqrt' ? '2' :
      // TODO (sorge): Make that safer?
      sre.XpathUtil.evalXPath('children/*[1]', node)[0].textContent.trim();
  return msg.MS_ROOT_INDEX[content] || '';
};


/**
 * Opening string for radicals in Mathspeak verbose mode.
 * @param {!Node} node The radical node.
 * @return {string} The opening string.
 */
sre.MathspeakUtil.openingRadicalVerbose = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NESTED, msg.MS.STARTROOT);
};


/**
 * Closing string for radicals in Mathspeak verbose mode.
 * @param {!Node} node The radical node.
 * @return {string} The closing string.
 */
sre.MathspeakUtil.closingRadicalVerbose = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NESTED, msg.MS.ENDROOT);
};


/**
 * Middle string for radicals in Mathspeak verbose mode.
 * @param {!Node} node The radical node.
 * @return {string} The middle string.
 */
sre.MathspeakUtil.indexRadicalVerbose = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NESTED,
                                         msg.MS.ROOTINDEX);
};


/**
 * Opening string for radicals in Mathspeak brief mode.
 * @param {!Node} node The radical node.
 * @return {string} The opening string.
 */
sre.MathspeakUtil.openingRadicalBrief = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NEST_ROOT,
                                         msg.MS.STARTROOT);
};


/**
 * Closing string for radicals in Mathspeak brief mode.
 * @param {!Node} node The radical node.
 * @return {string} The closing string.
 */
sre.MathspeakUtil.closingRadicalBrief = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NEST_ROOT,
                                         msg.MS.ENDROOT);
};


/**
 * Middle string for radicals in Mathspeak superbrief mode.
 * @param {!Node} node The radical node.
 * @return {string} The middle string.
 */
sre.MathspeakUtil.indexRadicalBrief = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NEST_ROOT,
                                         msg.MS.ROOTINDEX);
};


/**
 * Opening string for radicals in Mathspeak superbrief mode.
 * @param {!Node} node The radical node.
 * @return {string} The opening string.
 */
sre.MathspeakUtil.openingRadicalSbrief = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NEST_ROOT, msg.MS.ROOT);
};


/**
 * Middle string for radicals in Mathspeak superbrief mode.
 * @param {!Node} node The radical node.
 * @return {string} The middle string.
 */
sre.MathspeakUtil.indexRadicalSbrief = function(node) {
  return sre.MathspeakUtil.nestedRadical(node, msg.MS.NEST_ROOT, msg.MS.INDEX);
};


/**
 * Computes and returns the nesting depth of underscore nodes.
 * @param {!Node} node The underscore node.
 * @return {number} The nesting depth. 0 if the node is not an underscore.
 */
sre.MathspeakUtil.underscoreNestingDepth = function(node) {
  return sre.MathspeakUtil.getNestingDepth(
      'underscore', node, ['underscore'], sre.MathspeakUtil.nestingBarriers,
      {},
      function(node) {
        return node.tagName &&
            node.tagName === sre.Semantic.Type.UNDERSCORE &&
            node.childNodes[0].childNodes[1].getAttribute('role') ===
            sre.Semantic.Role.UNDERACCENT;
      });
};


/**
 * String function to construct and underscript prefix.
 * @param {!Node} node The underscore node.
 * @return {string} The correct prefix string.
 */
sre.MathspeakUtil.nestedUnderscore = function(node) {
  var depth = sre.MathspeakUtil.underscoreNestingDepth(node);
  return Array(depth).join(msg.MS.UNDER) + msg.MS.UNDERSCRIPT;
};


/**
 * Computes and returns the nesting depth of overscore nodes.
 * @param {!Node} node The overscore node.
 * @return {number} The nesting depth. 0 if the node is not an overscore.
 */
sre.MathspeakUtil.overscoreNestingDepth = function(node) {
  return sre.MathspeakUtil.getNestingDepth(
      'overscore', node, ['overscore'], sre.MathspeakUtil.nestingBarriers,
      {},
      function(node) {
        return node.tagName &&
            node.tagName === sre.Semantic.Type.OVERSCORE &&
            node.childNodes[0].childNodes[1].getAttribute('role') ===
            sre.Semantic.Role.OVERACCENT;
      });
};


/**
 * String function to construct and overscript prefix.
 * @param {!Node} node The overscore node.
 * @return {string} The correct prefix string.
 */
sre.MathspeakUtil.nestedOverscore = function(node) {
  var depth = sre.MathspeakUtil.overscoreNestingDepth(node);
  return Array(depth).join(msg.MS.OVER) + msg.MS.OVERSCRIPT;
};


/**
 * Query function that Checks if we have a simple determinant in the sense that
 * every cell only contains single letters or numbers.
 * @param {!Node} node The determinant node.
 * @return {Array.<Node>} List containing input node if true.
 */
sre.MathspeakUtil.determinantIsSimple = function(node) {
  if (node.tagName !== sre.Semantic.Type.MATRIX ||
      node.getAttribute('role') !== sre.Semantic.Role.DETERMINANT) {
    return [];
  }
  var cells = sre.XpathUtil.evalXPath(
      'children/row/children/cell/children/*', node);
  for (var i = 0, cell; cell = cells[i]; i++) {
    if (cell.tagName === sre.Semantic.Type.NUMBER) {
      continue;
    }
    if (cell.tagName === sre.Semantic.Type.IDENTIFIER) {
      var role = cell.getAttribute('role');
      if (role === sre.Semantic.Role.LATINLETTER ||
          role === sre.Semantic.Role.GREEKLETTER ||
          role === sre.Semantic.Role.OTHERLETTER) {
        continue;
      }
    }
    return [];
  }
  return [node];
};


/**
 * Generate constraints for the specialised baseline rules of relation
 * sequences.
 * @return {string} The constraint string.
 */
sre.MathspeakUtil.generateBaselineConstraint = function() {
  var ignoreElems = ['subscript', 'superscript', 'tensor'];
  var mainElems = ['relseq', 'multrel'];
  var breakElems = ['fraction', 'punctuation', 'fenced', 'sqrt', 'root'];

  var ancestrify = function(elemList) {
    return elemList.map(function(elem) {return 'ancestor::' + elem;});
  };

  var notify = function(elem) {
    return 'not(' + elem + ')';
  };

  var prefix = 'ancestor::*/following-sibling::*';
  var middle = notify(ancestrify(ignoreElems).join(' or '));
  var mainList = ancestrify(mainElems);
  var breakList = ancestrify(breakElems);
  var breakCstrs = [];
  for (var i = 0, brk; brk = breakList[i]; i++) {
    breakCstrs = breakCstrs.concat(
        mainList.map(function(elem) {return brk + '/' + elem;}));
  }
  var postfix = notify(breakCstrs.join(' | '));
  return [prefix, middle, postfix].join(' and ');
};


/**
 * Removes parentheses around a label.
 * @param {!Node} node The label to be processed.
 * @return {string} The text of the label.
 */
sre.MathspeakUtil.removeParens = function(node) {
  if (!node.childNodes.length ||
      !node.childNodes[0].childNodes.length ||
      !node.childNodes[0].childNodes[0].childNodes.length) {
    return '';
  }
  var content = node.childNodes[0].childNodes[0].childNodes[0].textContent;
  return content.match(/^\(.+\)$/) ? content.slice(1, -1) : content;
};


// Generating rules for tensors.
/**
 * Component strings for tensor speech rules.
 * @enum {string}
 * @private
 */
sre.MathspeakUtil.componentString_ = {
  3 : 'CSFleftsuperscript',
  4 : 'CSFleftsubscript',
  2 : 'CSFbaseline',
  1 : 'CSFrightsubscript',
  0 : 'CSFrightsuperscript'
};


/**
 * Child number translation for tensor speech rules.
 * @enum {number}
 * @private
 */
sre.MathspeakUtil.childNumber_ = {
  4 : 2,
  3 : 3,
  2 : 1,
  1 : 4,
  0 : 5
};


/**
 * Generates the rule strings and constraints for tensor rules.
 * @param {string} constellation Bitvector representing of possible tensor
 *     constellation.
 * @return {Array.<string>} A list consisting of additional constraints for the
 *     tensor rule, plus the strings for the verbose and brief rule, in that
 *     order.
 * @private
 */
sre.MathspeakUtil.generateTensorRuleStrings_ = function(constellation) {
  var constraints = [];
  var verbString = '';
  var briefString = '';
  var constel = parseInt(constellation, 2);

  for (var i = 0; i < 5; i++) {
    var childString = 'children/*[' + sre.MathspeakUtil.childNumber_[i] + ']';
    if (constel & 1) {
      var compString = sre.MathspeakUtil.componentString_[i % 5];
      verbString = '[t] ' + compString + 'Verbose; [n] ' + childString + ';' +
          verbString;
      briefString = '[t] ' + compString + 'Brief; [n] ' + childString + ';' +
          briefString;
    } else {
      constraints.unshift('name(' + childString + ')="empty"');
    }
    constel >>= 1;
  }
  constraints.push(verbString);
  constraints.push(briefString);
  return constraints;
};


/**
 * Generator for tensor speech rules.
 * @param {sre.MathStore} store The mathstore to which the rules are added.
 */
sre.MathspeakUtil.generateTensorRules = function(store) {
  // Constellations are built as bitvectors with the meaning:
  //
  //  lsub lsuper base rsub rsuper
  var defineRule = goog.bind(store.defineRule, store);
  var defineRulesAlias = goog.bind(store.defineRulesAlias, store);
  var defineSpecialisedRule = goog.bind(store.defineSpecialisedRule, store);
  var constellations = ['11111', '11110', '11101', '11100',
                        '10111', '10110', '10101', '10100',
                        '01111', '01110', '01101', '01100'
  ];
  for (var i = 0, constel; constel = constellations[i]; i++) {
    var name = 'tensor' + constel;
    var components = sre.MathspeakUtil.generateTensorRuleStrings_(constel);
    var briefStr = components.pop();
    var verbStr = components.pop();
    var verbList = [name, 'mathspeak.default', verbStr, 'self::tensor'].
        concat(components);
    var briefList = [name, 'mathspeak.brief', briefStr, 'self::tensor'].
        concat(components);
    // Rules without neighbour.
    defineRule.apply(null, verbList);
    defineRule.apply(null, briefList);
    defineSpecialisedRule(name, 'mathspeak.brief', 'mathspeak.sbrief');
    // Rules with baseline.
    var baselineStr = sre.MathspeakUtil.componentString_[2];
    verbStr += '; [t]' + baselineStr + 'Verbose';
    briefStr += '; [t]' + baselineStr + 'Brief';
    name = name + '-baseline';
    verbList = [name, 'mathspeak.default', verbStr, 'self::tensor',
                'following-sibling::*'].
        concat(components);
    briefList = [name, 'mathspeak.brief', briefStr, 'self::tensor',
                 'following-sibling::*'].
        concat(components);
    defineRule.apply(null, verbList);
    defineRule.apply(null, briefList);
    defineSpecialisedRule(name, 'mathspeak.brief', 'mathspeak.sbrief');
    // Rules without neighbour but baseline.
    var aliasList = [name, 'self::tensor', 'not(following-sibling::*)',
                     'ancestor::fraction|ancestor::punctuated|' +
                     'ancestor::fenced|ancestor::root|ancestor::sqrt|' +
                     'ancestor::relseq|ancestor::multirel|' +
                     '@embellished'].
        concat(components);
    defineRulesAlias.apply(null, aliasList);
  }
};


});  // goog.scope
