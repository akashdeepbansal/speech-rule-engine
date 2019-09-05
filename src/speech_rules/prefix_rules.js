// Copyright 2016 Volker Sorge
// Copyright (c) 2016 The MathJax Consortium
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
 * @fileoverview Prefix rules.
 * @author v.sorge@mathjax.com (Volker Sorge)
 */

goog.provide('sre.PrefixRules');

goog.require('sre.MathStore');
goog.require('sre.NumbersUtil');



/**
 * Rule initialization.
 * @constructor
 * @extends {sre.MathStore}
 */
sre.PrefixRules = function() {
  sre.PrefixRules.base(this, 'constructor');
  this.modality = 'prefix';
};
goog.inherits(sre.PrefixRules, sre.MathStore);
goog.addSingletonGetter(sre.PrefixRules);


/**
 * @type {sre.MathStore}
 */
sre.PrefixRules.mathStore = sre.PrefixRules.getInstance();


/** @private */
sre.PrefixRules.defineRule_ = goog.bind(
    sre.PrefixRules.mathStore.defineRule,
    sre.PrefixRules.mathStore);


/** @private */
sre.PrefixRules.defineRuleAlias_ = goog.bind(
    sre.PrefixRules.mathStore.defineRulesAlias,
    sre.PrefixRules.mathStore);


/** @private */
sre.PrefixRules.addCustomString_ = goog.bind(
    sre.PrefixRules.mathStore.customStrings.add,
    sre.PrefixRules.mathStore.customStrings);


goog.scope(function() {
var defineRule = sre.PrefixRules.defineRule_;
var defineRuleAlias = sre.PrefixRules.defineRuleAlias_;
var addCSF = sre.PrefixRules.addCustomString_;


/**
 * Initialize the custom functions.
 * @private
 */
sre.PrefixRules.initCustomFunctions_ = function() {
  addCSF('CSFordinalPosition', sre.NumbersUtil.ordinalPosition);
};


/**
 * Prefix rules.
 * @private
*/
sre.PrefixRules.initPrefixRules_ = function() {
  defineRule(
      'numerator', 'default.default',
      '[t] "Numerator"; [p] (pause:200)',
      'self::*', 'name(../..)="fraction"',
      'count(preceding-sibling::*)=0');
  defineRule(
      'denominator', 'default.default',
      '[t] "Denominator"; [p] (pause:200)',
      'self::*', 'name(../..)="fraction"',
      'count(preceding-sibling::*)=1');
  defineRule(
      'base', 'default.default',
      '[t] "Base"; [p] (pause:200)',
      'self::*', 'name(../..)="superscript" or name(../..)="subscript"' +
      ' or name(../..)="overscore" or name(../..)="underscore"' +
      ' or name(../..)="tensor"',
      'count(preceding-sibling::*)=0');
  defineRule(
      'exponent', 'default.default',
      '[t] "Exponent"; [p] (pause:200)',
      'self::*', 'name(../..)="superscript"',
      'count(preceding-sibling::*)=1');
  defineRule(
      'subscript', 'default.default',
      '[t] "Subscript"; [p] (pause:200)',
      'self::*', 'name(../..)="subscript"',
      'count(preceding-sibling::*)=1');
  defineRule(
      'overscript', 'default.default',
      '[t] "Overscript"; [p] (pause:200)',
      'self::*', 'name(../..)="overscore"',
      'count(preceding-sibling::*)=1');
  defineRule(
      'underscript', 'default.default',
      '[t] "Underscript"; [p] (pause:200)',
      'self::*', 'name(../..)="underscore"',
      'count(preceding-sibling::*)=1');
  defineRule(
      'radicand', 'default.default',
      '[t] "Radicand"; [p] (pause:200)',
      'self::*', 'name(../..)="sqrt"');
  defineRule(
      'radicand', 'default.default',
      '[t] "Radicand"; [p] (pause:200)',
      'self::*', 'name(../..)="root"',
      'count(preceding-sibling::*)=1');
  defineRule(
      'index', 'default.default',
      '[t] "Index"; [p] (pause:200)',
      'self::*', 'name(../..)="root"',
      'count(preceding-sibling::*)=0');
  defineRule(
      'leftsub', 'default.default',
      '[t] "Left Subscript"; [p] (pause:200)',
      'self::*', 'name(../..)="tensor"',
      '@role="leftsub"');
  defineRule(
      'leftsub', 'default.default',
      '[t] CSFordinalPosition; [t] "Left Subscript"; [p] (pause:200)',
      'self::*', 'name(../..)="punctuated"', 'name(../../../..)="tensor"',
      '../../@role="leftsub"');
  defineRule(
      'leftsuper', 'default.default',
      '[t] "Left Superscript"; [p] (pause:200)',
      'self::*', 'name(../..)="tensor"',
      '@role="leftsuper"');
  defineRule(
      'leftsuper', 'default.default',
      '[t] CSFordinalPosition; [t] "Left Superscript"; [p] (pause:200)',
      'self::*', 'name(../..)="punctuated"', 'name(../../../..)="tensor"',
      '../../@role="leftsuper"');
  defineRule(
      'rightsub', 'default.default',
      '[t] "Right Subscript"; [p] (pause:200)',
      'self::*', 'name(../..)="tensor"',
      '@role="rightsub"');
  defineRule(
      'rightsub', 'default.default',
      '[t] CSFordinalPosition; [t] "Right Subscript"; [p] (pause:200)',
      'self::*', 'name(../..)="punctuated"', 'name(../../../..)="tensor"',
      '../../@role="rightsub"');
  defineRule(
      'rightsuper', 'default.default',
      '[t] "Right Superscript"; [p] (pause:200)',
      'self::*', 'name(../..)="tensor"',
      '@role="rightsuper"');
  defineRule(
      'rightsuper', 'default.default',
      '[t] CSFordinalPosition; [t] "Right Superscript"; [p] (pause:200)',
      'self::*', 'name(../..)="punctuated"', 'name(../../../..)="tensor"',
      '../../@role="rightsuper"');
  defineRule(
      'choice', 'default.default',
      '[t] "Choice Quantity"; [p] (pause:200)',
      'self::line', '@role="binomial"', 'parent::*/parent::vector',
      'count(preceding-sibling::*)=0');
  defineRule(
      'select', 'default.default',
      '[t] "Selection Quantity"; [p] (pause:200)',
      'self::line', '@role="binomial"', 'parent::*/parent::vector',
      'count(preceding-sibling::*)=1');

  // Positions in tables
  defineRule(
      'row', 'default.default',
      '[t] CSFordinalPosition; [t] "Row"; [p] (pause:200)',
      'self::row'
  );
  defineRuleAlias(
      'row', 'self::line'
  );
  defineRule(
      'cell', 'default.default',
      '[n] ../..; [t] CSFordinalPosition; [t] "Column"; [p] (pause:200)',
      'self::cell', 'contains(@grammar,"depth")'
  );
  defineRule(
      'cell', 'default.default',
      '[t] CSFordinalPosition; [t] "Column"; [p] (pause:200)',
      'self::cell'
  );
};

});  // goog.scope


sre.PrefixRules.getInstance().initializer = [
  sre.PrefixRules.initCustomFunctions_,
  sre.PrefixRules.initPrefixRules_
];
