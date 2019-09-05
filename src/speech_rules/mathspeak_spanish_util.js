// Copyright 2014-2017 Volker Sorge
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
 * @fileoverview Utility functions for mathspeak spanish rules.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

goog.provide('sre.MathspeakSpanishUtil');

goog.require('sre.Messages');
goog.require('sre.XpathUtil');


/**
 * Simple counter function for counting ordinals.
 * @param {!Node} node The node for the context function.
 * @param {string} context The context string.
 * @return {function(): string} The context function returning ordinals.
 */
sre.MathspeakSpanishUtil.ordinalCounter = function(node, context) {
  var counter = 0;
  return function() {
    return sre.Messages.NUMBERS.numberToOrdinal(++counter, null) +
        ' ' + context;
  };
};


/**
 * Predicate to decide if a root has a small index, i.e., between 1 and 10.
 * @param {Node} node The root node.
 * @return {Array.<Node>} The list with the given node, if it is a root with a
 *     small index.
 */
sre.MathspeakSpanishUtil.smallRoot = function(node) {
  if (!node.childNodes || node.childNodes.length === 0 ||
      !node.childNodes[0].childNodes) {
    return [];
  }
  var index = node.childNodes[0].childNodes[0].textContent;
  if (!/^\d+$/.test(index)) {
    return [];
  }
  var number = parseInt(index, 10);
  return (number > 1 && number <= 10) ? [node] : [];
};


/**
 * Iterates over the list of content nodes of a multiplication of units.
 * @param {Array.<Node>} nodes A node array.
 * @param {string} context A context string.
 * @return {function(): Array.<sre.AuditoryDescription>} A closure that returns
 *     "por" between two unit nodes, otherwise the empty string.
 */
sre.MathspeakSpanishUtil.unitMultipliers = function(nodes, context) {
  var children = nodes;
  var counter = 0;
  return function() {
    var descr = sre.AuditoryDescription.create({
      text: (sre.MathspeakSpanishUtil.rightMostUnit(children[counter]) &&
             sre.MathspeakSpanishUtil.leftMostUnit(children[counter + 1])) ?
          'por' : ''}, {});
    counter++;
    return [descr];
  };
};


/**
 * @type {Array.<sre.SemanticAttr.Type>}
 */
sre.MathspeakSpanishUtil.SCRIPT_ELEMENTS = [
  sre.SemanticAttr.Type.SUPERSCRIPT,
  sre.SemanticAttr.Type.SUBSCRIPT,
  sre.SemanticAttr.Type.OVERSCORE,
  sre.SemanticAttr.Type.UNDERSCORE
];


/**
 * Tests if node is a right most unit element in a sub-expression.
 * @param {Node} node The node to test.
 * @return {boolean} True if it is the right most unit in that subtree.
 */
sre.MathspeakSpanishUtil.rightMostUnit = function(node) {
  while (node) {
    if (node.getAttribute('role') === 'unit') {
      return true;
    }
    var tag = node.tagName;
    var children = sre.XpathUtil.evalXPath('children/*', node);
    node = (sre.MathspeakSpanishUtil.SCRIPT_ELEMENTS.indexOf(tag) !== -1) ?
        children[0] : children[children.length - 1];
  }
  return false;
};


/**
 * Tests if node is a left most unit element in a sub-expression.
 * @param {Node} node The node to test.
 * @return {boolean} True if it is the left most unit in that subtree.
 */
sre.MathspeakSpanishUtil.leftMostUnit = function(node) {
  while (node) {
    if (node.getAttribute('role') === 'unit') {
      return true;
    }
    var children = sre.XpathUtil.evalXPath('children/*', node);
    node = children[0];
  }
  return false;
};


/**
 * Checks if a given node is preceded by a 1. This is useful to decide if the
 * next text element is singular or plural.
 * @param {Node} node The base node.
 * @return {Array.<Node>} List with the base node if the preceding node (the
 *     next left in the subexpression containing node) is 1. Otherwise empty
 *     list.
 */
sre.MathspeakSpanishUtil.oneLeft = function(node) {
  while (node) {
    if (node.tagName === 'number' && node.textContent === '1') {
      return [node];
    }
    if (node.tagName !== 'infixop' ||
        (node.getAttribute('role') !== 'multiplication' &&
         node.getAttribute('role') !== 'implicit')) {
      return [];
    }
    node = sre.XpathUtil.evalXPath('children/*', node)[0];
  }
  return [];
};
