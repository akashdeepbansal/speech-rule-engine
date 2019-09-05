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
 * @fileoverview Summary rules for collapsed elements.
 * @author v.sorge@mathjax.com (Volker Sorge)
 */

goog.provide('sre.SummaryRules');

goog.require('sre.MathStore');



/**
 * Rule initialization.
 * @constructor
 * @extends {sre.MathStore}
 */
sre.SummaryRules = function() {
  sre.SummaryRules.base(this, 'constructor');
  this.modality = 'summary';
};
goog.inherits(sre.SummaryRules, sre.MathStore);
goog.addSingletonGetter(sre.SummaryRules);


/**
 * @type {sre.MathStore}
 */
sre.SummaryRules.mathStore = sre.SummaryRules.getInstance();


/** @private */
sre.SummaryRules.defineRule_ = goog.bind(
    sre.SummaryRules.mathStore.defineRule,
    sre.SummaryRules.mathStore);


/** @private */
sre.SummaryRules.defineRuleAlias_ = goog.bind(
    sre.SummaryRules.mathStore.defineRulesAlias,
    sre.SummaryRules.mathStore);


/** @private */
sre.SummaryRules.defineSpecialisedRule_ = goog.bind(
    sre.SummaryRules.mathStore.defineSpecialisedRule,
    sre.SummaryRules.mathStore);


/** @private */
sre.SummaryRules.defineUniqueRuleAlias_ = goog.bind(
    sre.SummaryRules.mathStore.defineUniqueRuleAlias,
    sre.SummaryRules.mathStore);


goog.scope(function() {
var defineRule = sre.SummaryRules.defineRule_;
var defineRuleAlias = sre.SummaryRules.defineRuleAlias_;
var defineSpecialisedRule = sre.SummaryRules.defineSpecialisedRule_;
var defineUniqueRuleAlias = sre.SummaryRules.defineUniqueRuleAlias_;


/**
 * Summary rules.
 * @private
*/
sre.SummaryRules.initSummaryRules_ = function() {

  // Identifier
  defineRule(
      'abstr-identifier', 'default.default',
      '[t] "long identifier"',
      'self::identifier', 'contains(@grammar, "collapsed")'
  );
  defineRule(
      'abstr-identifier', 'default.default',
      '[t] "identifier"',
      'self::identifier'
  );

  // Numbers
  defineRule(
      'abstr-number', 'default.default',
      '[t] "long number"',
      'self::number', 'contains(@grammar, "collapsed")'
  );
  defineRule(
      'abstr-number', 'default.default',
      '[t] "number"',
      'self::number'
  );

  defineRule(
      'abstr-mixed-number', 'default.default',
      '[t] "long mixed number"',
      'self::number', '@role="mixed"', 'contains(@grammar, "collapsed")'
  );
  defineRule(
      'abstr-mixed-number', 'default.default',
      '[t] "mixed number"',
      'self::number', '@role="mixed"'
  );

  // Text
  defineRule(
      'abstr-text', 'default.default',
      '[t] "text"',
      'self::text'
  );

  // Functions
  defineRule(
      'abstr-function', 'default.default',
      '[t] "functional expression"',
      'self::function'
  );
  defineRule(
      'abstr-function', 'mathspeak.brief',
      '[t] "function"',
      'self::function'
  );
  defineSpecialisedRule(
      'abstr-function', 'mathspeak.brief', 'mathspeak.sbrief'
  );

  defineRule(
      'abstr-lim', 'default.default',
      '[t] "limit function"',
      'self::function', '@role="limit function"'
  );
  defineRule(
      'abstr-lim', 'mathspeak.brief',
      '[t] "lim"',
      'self::function', '@role="limit function"'
  );
  defineSpecialisedRule(
      'abstr-lim', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  // TODO: Missing simple function
  // TODO: Application

  // Fraction
  defineRule(
      'abstr-fraction', 'default.default',
      '[t] "fraction"',
      'self::fraction'
  );
  defineRule(
      'abstr-fraction', 'mathspeak.brief',
      '[t] "frac"',
      'self::fraction'
  );
  defineSpecialisedRule(
      'abstr-fraction', 'mathspeak.brief', 'mathspeak.sbrief'
  );

  defineRule(
      'abstr-continued-fraction', 'default.default',
      '[t] "continued fraction"',
      'self::fraction',
      'children/*[2]/descendant-or-self::*[@role="ellipsis"]'
  );
  defineRule(
      'abstr-continued-fraction', 'mathspeak.brief',
      '[t] "continued frac"',
      'self::fraction',
      'children/*[2]/descendant-or-self::*[@role="ellipsis"]'
  );
  defineSpecialisedRule(
      'abstr-continued-fraction', 'mathspeak.brief', 'mathspeak.sbrief'
  );


  // Roots
  defineRule(
      'abstr-sqrt', 'default.default',
      '[t] "square root"',
      'self::sqrt'
  );

  defineRule(
      'abstr-sqrt-nested', 'default.default',
      '[t] "nested square root"',
      'self::sqrt',
      'children/*/descendant-or-self::sqrt or' +
      ' children/*/descendant-or-self::root'
  );

  // Content following the root expression.
  defineRule(
      'abstr-root', 'default.default',
      '[t] "root of index"; [n] children/*[1] (engine:modality="speech");' +
      ' [t] "endindex"',
      'self::root', 'contains(@grammar, "collapsed")',
      'following-sibling::* or ancestor::*/following-sibling::*'
  );
  defineRule(
      'abstr-root', 'default.default',
      '[t] "root of index"; [n] children/*[1] (engine:modality=speech)',
      'self::root'
  );
  defineRule(
      'abstr-root', 'mathspeak.brief',
      '[t] "root"',
      'self::root'
  );
  defineSpecialisedRule(
      'abstr-root', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  // Content following the root expression.
  defineRule(
      'abstr-root-nested', 'default.default',
      '[t] "nested root of index"; ' +
      '[n] children/*[1] (engine:modality="speech"); [t] "endindex"',
      'self::root', 'contains(@grammar, "collapsed")',
      'children/*/descendant-or-self::sqrt or' +
      ' children/*/descendant-or-self::root',
      'following-sibling::* or ancestor::*/following-sibling::*'
  );
  defineRule(
      'abstr-root-nested', 'default.default',
      '[t] "nested root of index"; ' +
      '[n] children/*[1] (engine:modality="speech")',
      'self::root', 'children/*/descendant-or-self::sqrt or' +
      ' children/*/descendant-or-self::root'
  );
  defineRule(
      'abstr-root-nested', 'mathspeak.brief',
      '[t] "nested root"',
      'self::root', 'children/*/descendant-or-self::sqrt or ' +
      'children/*/descendant-or-self::root'
  );
  defineSpecialisedRule(
      'abstr-root-nested', 'mathspeak.brief', 'mathspeak.sbrief'
  );

  // Superscript
  defineRule(
      'abstr-superscript', 'default.default',
      '[t] "power"',
      'self::superscript'
  );

  // Subscript
  defineRule(
      'abstr-subscript', 'default.default',
      '[t] "subscript"',
      'self::subscript'
  );

  // Subsuperscript
  defineRule(
      'abstr-subsup', 'default.default',
      '[t] "power with subscript"',
      'self::superscript',
      'name(children/*[1])="subscript"'
  );

  // Infixop
  defineRule(
      'abstr-infixop', 'default.default',
      '[t] @role (grammar:localRole); [t] "with"; [t] count(./children/*);' +
      ' [t] "elements"',
      'self::infixop'
  );
  defineRule(
      'abstr-infixop', 'default.default',
      '[t] @role (grammar:localRole); [t] "with variable number of elements"',
      'self::infixop', 'count(./children/*)>2',
      './children/punctuation[@role="ellipsis"]'
  );
  defineRule(
      'abstr-infixop', 'mathspeak.brief',
      '[t] @role (grammar:localRole)',
      'self::infixop'
  );
  defineSpecialisedRule(
      'abstr-infixop', 'mathspeak.brief', 'mathspeak.sbrief'
  );

  defineRule(
      'abstr-addition', 'default.default',
      '[t] "sum with"; [t] count(./children/*); [t] "summands"',
      'self::infixop', '@role="addition"'
  );
  defineRule(
      'abstr-addition', 'mathspeak.brief',
      '[t] "sum"',
      'self::infixop', '@role="addition"'
  );
  defineSpecialisedRule(
      'abstr-addition', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-addition', 'default.default',
      '[t] "sum with variable number of summands"',
      'self::infixop', '@role="addition"',
      'count(./children/*)>2', './children/punctuation[@role="ellipsis"]'
  );

  defineRule(
      'abstr-multiplication', 'default.default',
      '[t] "product with"; [t] count(./children/*); [t] "factors"',
      'self::infixop', '@role="multiplication"'
  );
  defineRule(
      'abstr-multiplication', 'mathspeak.brief',
      '[t] "product"',
      'self::infixop', '@role="multiplication"'
  );
  defineSpecialisedRule(
      'abstr-multiplication', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRuleAlias(
      'abstr-multiplication',
      'self::infixop', '@role="implicit"'
  );
  defineRule(
      'abstr-var-multiplication', 'default.default',
      '[t] "product with variable number of factors"',
      'self::infixop', '@role="multiplication"',
      'count(./children/*)>2', './children/punctuation[@role="ellipsis"]'
  );
  defineRuleAlias(
      'abstr-var-multiplication',
      'self::infixop', '@role="implicit"',
      'count(./children/*)>2', './children/punctuation[@role="ellipsis"]'
  );


  // Vector
  defineRule(
      'abstr-vector', 'default.default',
      '[t] count(./children/*) ; [t] "dimensional vector"',
      'self::vector'
  );
  defineRule(
      'abstr-vector', 'mathspeak.brief',
      '[t] "vector"',
      'self::vector'
  );
  defineSpecialisedRule(
      'abstr-vector', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-vector', 'default.default',
      '[t] "n dimensional vector"',
      'self::vector',
      './children/*/children/punctuation[@role="ellipsis"]'
  );

  defineRule(
      'abstr-binomial', 'default.default',
      '[t] "binomial"',
      'self::vector', '@role="binomial"'
  );
  // These two are needed to avoid the vector rule firing.
  defineSpecialisedRule(
      'abstr-binomial', 'default.default', 'mathspeak.brief');
  defineSpecialisedRule(
      'abstr-binomial', 'default.default', 'mathspeak.sbrief');


  // Matrix
  defineRule(
      'abstr-determinant', 'default.default',
      '[t] count(./children/*); [t] "dimensional determinant"',
      'self::matrix', '@role="determinant"'
  );
  defineRule(
      'abstr-determinant', 'mathspeak.brief',
      '[t] "determinant"',
      'self::matrix', '@role="determinant"'
  );
  defineSpecialisedRule(
      'abstr-determinant', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-determinant', 'default.default',
      '[t] "n dimensional determinant"',
      'self::matrix', '@role="determinant"',
      './children/*/children/*/children/punctuation[@role="ellipsis"]'
  );

  defineRule(
      'abstr-squarematrix', 'default.default',
      '[t] count(./children/*); [t] "dimensional square matrix"',
      'self::matrix', '@role="squarematrix"'
  );
  defineRule(
      'abstr-squarematrix', 'mathspeak.brief',
      '[t] "square matrix"',
      'self::matrix', '@role="squarematrix"'
  );
  defineSpecialisedRule(
      'abstr-squarematrix', 'mathspeak.brief', 'mathspeak.sbrief'
  );

  defineRule(
      'abstr-rowvector', 'default.default',
      '[t] count(./children/row/children/*); [t] "dimensional row vector"',
      'self::matrix', '@role="rowvector"'
  );
  defineRule(
      'abstr-rowvector', 'mathspeak.brief',
      '[t] "row vector"',
      'self::matrix', '@role="rowvector"'
  );
  defineSpecialisedRule(
      'abstr-rowvector', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-matrix', 'default.default',
      '[t] "n dimensional row vector"',
      'self::matrix', '@role="rowvector"',
      './children/*/children/*/children/punctuation[@role="ellipsis"]'
  );

  defineRule(
      'abstr-matrix', 'default.default',
      '[t] count(children/*);  [t] "by";' +
      '[t] count(children/*[1]/children/*); [t] "matrix"',
      'self::matrix'
  );
  defineRule(
      'abstr-matrix', 'mathspeak.brief',
      '[t] "matrix"',
      'self::matrix'
  );
  defineSpecialisedRule(
      'abstr-matrix', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-matrix', 'default.default',
      '[t] "n by m dimensional matrix"',
      'self::matrix',
      './children/*/children/*/children/punctuation[@role="ellipsis"]'
  );


  // Cases
  defineRule(
      'abstr-cases', 'default.default',
      '[t] "case statement";' +
      '[t] "with"; [t] count(children/*); [t] "cases"',
      'self::cases'
  );
  defineRule(
      'abstr-cases', 'mathspeak.brief',
      '[t] "case statement"',
      'self::cases'
  );
  defineSpecialisedRule(
      'abstr-cases', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-cases', 'default.default',
      '[t] "case statement with variable number of cases"',
      'self::cases',
      './children/row/children/cell/children/punctuation[@role="ellipsis"]' +
      'or ./children/line/children/punctuation[@role="ellipsis"]'
  );


  // Punctuated
  defineRule(
      'abstr-punctuated', 'default.default',
      '[n] content/*[1]; [t] "separated list"; ' +
      '[t] "of length"; [t] count(children/*) - count(content/*)',
      'self::punctuated'
  );
  defineRule(
      'abstr-punctuated', 'mathspeak.brief',
      '[n] content/*[1]; [t] "separated list"',
      'self::punctuated'
  );
  defineSpecialisedRule(
      'abstr-punctuated', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-punctuated', 'default.default',
      '[n] content/*[1]; [t] "separated list";' +
      '[t] "of variable length"',
      'self::punctuated',
      './children/punctuation[@role="ellipsis"]'
  );


  defineRule(
      'abstr-bigop', 'default.default',
      '[n] content/*[1]',
      'self::bigop'
  );

  defineRule(
      'abstr-integral', 'default.default',
      '[t] "integral"',
      '@role="integral"'
  );

  defineRule(
      'abstr-relation', 'default.default',
      '[t] @role (grammar:localRole);',
      'self::relseq', 'count(./children/*)=2'
  );

  defineRule(
      'abstr-relation-seq', 'default.default',
      '[t] @role (grammar:localRole); [t] "sequence";' +
      ' [t] "with"; [t] count(./children/*); [t] "elements"',
      'self::relseq', 'count(./children/*)>2'
  );
  defineRule(
      'abstr-relation-seq', 'mathspeak.brief',
      '[t] @role (grammar:localRole); [t] "sequence"',
      'self::relseq', 'count(./children/*)>2'
  );
  defineSpecialisedRule(
      'abstr-relation-seq', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-relation', 'default.default',
      '[t] @role (grammar:localRole); [t] "sequence";' +
      ' [t] "with variable number of elements"',
      'self::relseq', 'count(./children/*)>2',
      './children/punctuation[@role="ellipsis"]'
  );

  defineUniqueRuleAlias(
      'abstr-relation', 'default.default',
      'self::multirel',
      '@role!="unknown"', 'count(./children/*)>2'
  );
  defineRuleAlias(
      'abstr-var-relation',
      'self::multirel', '@role!="unknown"',
      'count(./children/*)>2', './children/punctuation[@role="ellipsis"]'
  );

  defineRule(
      'abstr-multirel', 'default.default',
      '[t] "relation sequence";' +
      ' [t] "with"; [t] count(./children/*); [t] "elements"',
      'self::multirel', 'count(./children/*)>2'
  );
  defineRule(
      'abstr-multirel', 'mathspeak.brief',
      '[t] "relation sequence"',
      'self::multirel', 'count(./children/*)>2'
  );
  defineSpecialisedRule(
      'abstr-multirel', 'mathspeak.brief', 'mathspeak.sbrief'
  );
  defineRule(
      'abstr-var-multirel', 'default.default',
      '[t] "relation sequence with variable number of elements"',
      'self::multirel', 'count(./children/*)>2',
      './children/punctuation[@role="ellipsis"]'
  );

  defineRule(
      'abstr-table', 'default.default',
      '[t] "table with"; ' +
      '[t] count(children/*); [t] "rows and";' +
      '[t] count(children/*[1]/children/*); [t] "columns"',
      'self::table'
  );
  defineRule(
      'abstr-line', 'default.default',
      '[t] "in"; [t] @role (grammar:localRole);',
      'self::line'
  );
  defineRule(
      'abstr-row', 'default.default',
      '[t] "in"; [t] @role (grammar:localRole);' +
      '[t] count(preceding-sibling::..); [t] "with";' +
      '[t] count(children/*); [t] "columns"',
      'self::row'
  );
  defineRule(
      'abstr-cell', 'default.default',
      '[t] "in"; [t] @role (grammar:localRole);',
      'self::cell'
  );

};

});  // goog.scope


sre.SummaryRules.getInstance().initializer = [
  sre.SummaryRules.initSummaryRules_
];
