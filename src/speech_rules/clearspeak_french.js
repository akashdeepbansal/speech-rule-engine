// Copyright 2017 Volker Sorge
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
 * @fileoverview Clearspeak rules.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

goog.provide('sre.ClearspeakFrench');

goog.require('sre.ClearspeakPreferences');
goog.require('sre.ClearspeakUtil');
goog.require('sre.Engine');
goog.require('sre.Grammar');
goog.require('sre.MathStore');
goog.require('sre.MathspeakUtil');
goog.require('sre.StoreUtil');



/**
 * Rule initialization.
 * @constructor
 * @extends {sre.MathStore}
 */
sre.ClearspeakFrench = function() {
  sre.ClearspeakFrench.base(this, 'constructor');

  this.locale = 'fr';
};
goog.inherits(sre.ClearspeakFrench, sre.MathStore);
goog.addSingletonGetter(sre.ClearspeakFrench);


// TODO: Switch the . to , for the numbers in the tests!
/**
 * @type {sre.MathStore}
 */
sre.ClearspeakFrench.mathStore = sre.ClearspeakFrench.getInstance();


/** @private */
sre.ClearspeakFrench.defineRule_ = goog.bind(
    sre.ClearspeakFrench.mathStore.defineRule,
    sre.ClearspeakFrench.mathStore);


/** @private */
sre.ClearspeakFrench.defineRuleAlias_ = goog.bind(
    sre.ClearspeakFrench.mathStore.defineRulesAlias,
    sre.ClearspeakFrench.mathStore);


/** @private */
sre.ClearspeakFrench.defineSpecialisedRule_ = goog.bind(
    sre.ClearspeakFrench.mathStore.defineSpecialisedRule,
    sre.ClearspeakFrench.mathStore);


/** @private */
sre.ClearspeakFrench.addContextFunction_ = goog.bind(
    sre.ClearspeakFrench.mathStore.contextFunctions.add,
    sre.ClearspeakFrench.mathStore.contextFunctions);


/** @private */
sre.ClearspeakFrench.addCustomQuery_ = goog.bind(
    sre.ClearspeakFrench.mathStore.customQueries.add,
    sre.ClearspeakFrench.mathStore.customQueries);


/** @private */
sre.ClearspeakFrench.addCustomString_ = goog.bind(
    sre.ClearspeakFrench.mathStore.customStrings.add,
    sre.ClearspeakFrench.mathStore.customStrings);


goog.scope(function() {
var defineRule = sre.ClearspeakFrench.defineRule_;
var defineRuleAlias = sre.ClearspeakFrench.defineRuleAlias_;
var defineSpecialisedRule = sre.ClearspeakFrench.defineSpecialisedRule_;

var addCQF = sre.ClearspeakFrench.addCustomQuery_;
var addCSF = sre.ClearspeakFrench.addCustomString_;
var addCTXF = sre.ClearspeakFrench.addContextFunction_;


/**
 * Initialize the custom functions.
 * @private
 */
sre.ClearspeakFrench.initCustomFunctions_ = function() {
  addCTXF('CTXFpauseSeparator', sre.StoreUtil.pauseSeparator);
  addCTXF('CTXFnodeCounter', sre.ClearspeakUtil.nodeCounter);
  addCTXF('CTXFcontentIterator', sre.MathmlStoreUtil.contentIterator);
  addCSF('CSFvulgarFraction', sre.NumbersUtil.vulgarFraction);
  addCQF('CQFvulgarFractionSmall', sre.ClearspeakUtil.isSmallVulgarFraction);
  addCQF('CQFcellsSimple', sre.ClearspeakUtil.allCellsSimple);
  // TODO: Fix ordinals.
  addCSF('CSFordinalExponent', sre.ClearspeakUtil.ordinalExponent);
  addCSF('CSFwordOrdinal', sre.Messages.NUMBERS.wordOrdinal);
  addCQF('CQFisCapital', sre.ClearspeakUtil.isCapitalLetter);
  addCQF('CQFmatchingFences', sre.ClearspeakUtil.matchingFences);
  addCSF('CSFnestingDepth', sre.ClearspeakUtil.nestingDepth);
  addCQF('CQFfencedArguments', sre.ClearspeakUtil.fencedArguments);
  addCQF('CQFsimpleArguments', sre.ClearspeakUtil.simpleArguments);
  addCQF('CQFisHyperbolic', sre.ClearspeakUtil.isHyperbolic);
  addCQF('CQFisLogarithm', sre.ClearspeakUtil.isLogarithmWithBase);
  addCQF('CQFspaceoutNumber', sre.MathspeakUtil.spaceoutNumber);
};


/**
 * Clearspeak rules.
 * @private
*/
sre.ClearspeakFrench.initClearspeakFrench_ = function() {
  defineRule(
      'collapsed', 'clearspeak.default',
      '[t] "compressée"; [n] . (engine:modality=summary,grammar:collapsed)',
      'self::*', '@alternative', 'not(contains(@grammar, "collapsed"))',
      'self::*', 'self::*', 'self::*', 'self::*', 'self::*'
  );

  // Initial rule
  defineRule(
      'stree', 'clearspeak.default',
      '[n] ./*[1]', 'self::stree');

  // Dummy rules
  defineRule(
      'unknown', 'clearspeak.default', '[n] text()',
      'self::unknown');

  defineRule(
      'protected', 'clearspeak.default', '[t] text()',
      'self::number', 'contains(@grammar, "protected")');

  defineRule(
      'omit-empty', 'clearspeak.default',
      '[p] (pause:"short")', 'self::empty');

  // Font rules
  defineRule(
      'font', 'clearspeak.default',
      '[n] . (grammar:ignoreFont=@font); [t] "en";' +
      ' [t] @font (grammar:localFont,pause:"short")',
      'self::*', '@font', 'not(contains(@grammar, "ignoreFont"))',
      '@font!="normal"');

  defineRule(
      'font-identifier', 'clearspeak.default',
      '[n] . (grammar:ignoreFont=@font); [t] "en";' +
      ' [t] @font (grammar:localFont,pause:"short")',
      'self::identifier', 'string-length(text())=1',
      '@font', '@font="normal"', 'not(contains(@grammar, "ignoreFont"))',
      '@role!="unit"');

  defineRule(
      'omit-font', 'clearspeak.default',
      '[n] self::* (grammar:ignoreFont=@font)',
      'self::identifier', 'string-length(text())=1', '@font',
      'not(contains(@grammar, "ignoreFont"))', '@font="italic"');

  //
  // Text rules
  //
  defineRule(
      'text', 'clearspeak.default', '[n] text()', 'self::text');

  //
  // Symbols
  //

  // Capital letters
  // TODO: Make that work on tensor elements?
  defineRule(
      'capital', 'clearspeak.default',
      '[n] text() (pitch:0.6,grammar:ignoreFont="majuscule")',
      'self::identifier',
      '@role="latinletter" or @role="greekletter" or @role="simple function"',
      'CQFisCapital');
  defineRule(
      'capital', 'clearspeak.Caps_SayCaps',
      '[n] text()',
      'self::identifier', '@role="latinletter" or @role="greekletter"',
      'CQFisCapital');
  defineRule(
      'capital', 'clearspeak.Caps_SayCaps',
      '[p] (pause:"short"); [n] text()',
      'self::identifier', '@role="latinletter" or @role="greekletter"',
      'CQFisCapital', 'preceding-sibling::*[1]',
      'not(name(preceding-sibling::*[1])="function")',
      'not(contains(@grammar, "angle"))');
  defineRule(
      'capital', 'clearspeak.Caps_SayCaps',
      '[n] text() (pause:"short")',
      'self::identifier', '@role="latinletter" or @role="greekletter"',
      'CQFisCapital', 'following-sibling::*[1]');
  defineRule(
      'capital', 'clearspeak.Caps_SayCaps',
      '[p] (pause:"short"); [n] text() (pause:"short")',
      'self::identifier', '@role="latinletter" or @role="greekletter"',
      'CQFisCapital', 'preceding-sibling::*[1]', 'following-sibling::*[1]',
      'not(name(preceding-sibling::*[1])="function")',
      'not(contains(@grammar, "angle"))');

  // Comma
  defineRule(
      'punctuation-lr', 'clearspeak.default',
      '[p] (pause:"short"); [n] text() (pause:"short")',
      'self::punctuation', '@role="comma"');
  defineRule(
      'punctuation', 'clearspeak.default',
      '[n] text()',
      'self::punctuation', '@role="comma"',
      'not(preceding-sibling::*[1]/children)',
      'not(following-sibling::*[1]/children)');
  defineRule(
      'punctuation-l', 'clearspeak.default',
      '[p] (pause:"short"); [n] text()',
      'self::punctuation', '@role="comma"',
      'not(following-sibling::*[1]/children)');
  defineRule(
      'punctuation-r', 'clearspeak.default',
      '[n] text() (pause:"short")',
      'self::punctuation', '@role="comma"',
      'not(preceding-sibling::*[1]/children)');

  // Ellipses
  defineRule(
      'ellipsis', 'clearspeak.Ellipses_AndSoOn',
      '[t] "et ainsi de suite"',
      'self::punctuation', '@role="ellipsis"', 'not(following-sibling::*[1])',
      'not(preceding-sibling::*[last()][@role="ellipsis"])'
  );
  defineRule(
      'ellipsis', 'clearspeak.Ellipses_AndSoOn',
      '[t] "et ainsi de suite jusqu\'à"',
      'self::punctuation', '@role="ellipsis"',
      'preceding-sibling::*[1]', 'following-sibling::*[1]'
  );

  // Vertical bar
  defineRule(
      'vbar-evaluated', 'clearspeak.default',
      '[n] children/*[1]; [p] (pause:"short"); [t] "évalué à";' +
      ' [n] content/*[1]/children/*[2]; [p] (pause:"short")',
      'self::punctuated', '@role="endpunct"', 'content/*[1][@role="vbar"]',
      'content/*[1][@embellished]', 'name(content/*[1])="subscript"'
  );
  defineRule(
      'vbar-evaluated', 'clearspeak.default',
      '[n] children/*[1]; [p] (pause:"short"); [t] "évalué à";' +
      ' [n] content/*[1]/children/*[2]; [p] (pause:"short"); ' +
      '[t] "moins la même expression évaluée à";' +
      ' [n] content/*[1]/children/*[1]/children/*[2]; [p] (pause:"short")',
      'self::punctuated', '@role="endpunct"', 'content/*[1][@role="vbar"]',
      'content/*[1][@embellished]', 'name(content/*[1])="superscript"',
      'name(content/*[1]/children/*[1])="subscript"'
  );

  defineRule(
      'vbar-such-that', 'clearspeak.VerticalLine_SuchThat',
      '[t] "tel que"', 'self::punctuation', '@role="vbar"',
      'not(parent::*/parent::*[@embellished="punctuation"])'
  );
  defineRule(
      'vbar-such-that', 'clearspeak.VerticalLine_Divides',
      '[t] "diviseur de"', 'self::punctuation', '@role="vbar"',
      'not(parent::*/parent::*[@embellished="punctuation"])'
  );
  defineRule(
      'vbar-such-that', 'clearspeak.VerticalLine_Given',
      '[t] "sachant"', 'self::punctuation', '@role="vbar"',
      'not(parent::*/parent::*[@embellished="punctuation"])'
  );

  // Element/Member
  //
  // TODO: Maybe rename the preferences to reflect the actual expressions?
  defineRule(
      'set-member', 'clearspeak.default',
      '[t] "est un"', 'self::operator', '@role="set extended"',
      'text()="\u2208" or text()="\u220A"');
  defineSpecialisedRule(
      'set-member', 'clearspeak.default', 'clearspeak.SetMemberSymbol_Member',
      '[t] "appartient à"');
  defineSpecialisedRule(
      'set-member', 'clearspeak.default', 'clearspeak.SetMemberSymbol_Element',
      '[t] "est un élément de"');
  defineSpecialisedRule(
      'set-member', 'clearspeak.default', 'clearspeak.SetMemberSymbol_Belongs',
      '[t] "est dans"');
  defineRule(
      'set-not-member', 'clearspeak.default',
      '[t] "n\'est pas un"', 'self::operator', '@role="set extended"',
      'text()="\u2209"'
  );
  defineSpecialisedRule(
      'set-not-member', 'clearspeak.default',
      'clearspeak.SetMemberSymbol_Member',
      '[t] "n\'appartient pas à"');
  defineSpecialisedRule(
      'set-not-member', 'clearspeak.default',
      'clearspeak.SetMemberSymbol_Element',
      '[t] "n\'est pas un élément de"');
  defineSpecialisedRule(
      'set-not-member', 'clearspeak.default',
      'clearspeak.SetMemberSymbol_Belongs',
      '[t] "n\'est pas dans"');


  // Adornments
  //
  // Primes
  // This rule uses some redundancy for ordering!
  //
  // TODO: Fix together with units.
  defineRule(
      'prime', 'clearspeak.default',
      '[n] children/*[1]; [n] children/*[2]',
      'self::superscript', 'children/*[2]',
      'children/*[2][@role="prime"]', 'self::*');
  defineRule(
      'feet', 'clearspeak.default',
      '[n] children/*[1]; [t] "feet"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'name(children/*[1])="number"',
      'children/*[2][text()="′"]', 'not(preceding-sibling::*[@role="degree"])');
  defineRule(
      'foot', 'clearspeak.default',
      '[n] children/*[1]; [t] "foot"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'name(children/*[1])="number"',
      'children/*[2][text()="′"]', 'children/*[1][text()="1"]',
      'not(preceding-sibling::*[@role="degree"])');
  defineRule(
      'inches', 'clearspeak.default',
      '[n] children/*[1]; [t] "inches"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'name(children/*[1])="number"',
      'children/*[2][text()="″"]', 'not(preceding-sibling::*[@role="degree"])');
  defineRule(
      'inch', 'clearspeak.default',
      '[n] children/*[1]; [t] "inch"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'name(children/*[1])="number"',
      'children/*[2][text()="″"]', 'children/*[1][text()="1"]',
      'not(preceding-sibling::*[@role="degree"])');
  // Degrees, minutes, and seconds
  defineRule(
      'minutes', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "minutes"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'preceding-sibling::*[@role="degree"]',
      'children/*[2][text()="′"]');
  defineRule(
      'minute', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "minute"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'preceding-sibling::*[@role="degree"]',
      'children/*[2][text()="′"]', 'children/*[1][text()="1"]');
  // TODO: (Simons) Sort these out properly.
  defineRule(
      'seconds', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "seconds"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'preceding-sibling::*[@role="degree"]',
      'children/*[2][text()="″"]');
  defineRule(
      'second', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "second"',
      'self::superscript', 'children/*[2][@role="prime"]',
      'preceding-sibling::*[@role="degree"]',
      'children/*[2][text()="″"]', 'children/*[1][text()="1"]');
  // Angle preference
  defineRule(
      'degrees-angle', 'clearspeak.Prime_Angle',
      '[n] children/*[1]; [t] "degrees"; [p] (pause:short)',
      'self::punctuation', '@role="degree"');
  defineRule(
      'degree-angle', 'clearspeak.Prime_Angle',
      '[n] children/*[1]; [t] "degree"; [p] (pause:short)',
      'self::punctuation', '@role="degree"', 'children/*[1][text()="1"]');
  defineRule(
      'minutes-angle', 'clearspeak.Prime_Angle',
      '[n] children/*[1]; [t] "minutes"; [p] (pause:short)',
      'self::superscript',
      'children/*[2][@role="prime"]',
      'name(children/*[1])="number" or (children/*[1][@role="latinletter"]' +
      ' and ' +
      '""=translate(children/*[1]/text(),"abcdefghijklmnopqrstuvwxyz", ""))',
      'children/*[2][text()="′"]');
  defineRule(
      'minute-angle', 'clearspeak.Prime_Angle',
      '[n] children/*[1]; [t] "minute"; [p] (pause:short)',
      'self::superscript', 'children/*[2][@role="prime"]',
      'children/*[2][text()="′"]', 'children/*[1][text()="1"]');
  defineRule(
      'seconds-angle', 'clearspeak.Prime_Angle',
      '[n] children/*[1]; [t] "seconds"; [p] (pause:short)',
      'self::superscript', 'children/*[2][@role="prime"]',
      'name(children/*[1])="number" or (children/*[1][@role="latinletter"]' +
      ' and ' +
      '""=translate(children/*[1]/text(),"abcdefghijklmnopqrstuvwxyz", ""))',
      'children/*[2][text()="″"]');
  defineRule(
      'second-angle', 'clearspeak.Prime_Angle',
      '[n] children/*[1]; [t] "second"; [p] (pause:short)',
      'self::superscript', 'children/*[2][@role="prime"]',
      'children/*[2][text()="″"]', 'children/*[1][text()="1"]');
  // Length preference
  defineRule(
      'feet-length', 'clearspeak.Prime_Length',
      '[n] children/*[1]; [t] "feet"; [p] (pause:short)',
      'self::superscript', 'children/*[2][@role="prime"]',
      'name(children/*[1])="number" or (children/*[1][@role="latinletter"]' +
      ' and ' +
      '""=translate(children/*[1]/text(),"abcdefghijklmnopqrstuvwxyz", ""))',
      'children/*[2][text()="′"]');
  defineRule(
      'foot-length', 'clearspeak.Prime_Length',
      '[n] children/*[1]; [t] "foot"; [p] (pause:short)',
      'self::superscript', 'children/*[2][@role="prime"]',
      'children/*[2][text()="′"]', 'children/*[1][text()="1"]');
  defineRule(
      'inches-length', 'clearspeak.Prime_Length',
      '[n] children/*[1]; [t] "inches"; [p] (pause:short)',
      'self::superscript', 'children/*[2][@role="prime"]',
      'name(children/*[1])="number" or (children/*[1][@role="latinletter"]' +
      ' and ' +
      '""=translate(children/*[1]/text(),"abcdefghijklmnopqrstuvwxyz", ""))',
      'children/*[2][text()="″"]');
  defineRule(
      'inch-length', 'clearspeak.Prime_Length',
      '[n] children/*[1]; [t] "inch"; [p] (pause:short)',
      'self::superscript', 'children/*[2][@role="prime"]',
      'children/*[2][text()="″"]', 'children/*[1][text()="1"]');



  // Punctuated
  defineRule(
      'punctuated', 'clearspeak.default',
      '[m] children/*',
      'self::punctuated');

  //
  // Function rules
  //
  defineRule(
      'function', 'clearspeak.default',
      '[n] text()', 'self::function');

  defineRule(
      'appl', 'clearspeak.default',
      '[n] children/*[1]; [t] "de"; [n] children/*[2]; [p] (pause:"short")',
      'self::appl');
  defineRule(
      'appl-simple', 'clearspeak.default',
      '[n] children/*[1]; [t] "de"; [p] (pause:"short"); [n] children/*[2];' +
      ' [p] (pause:"short")',
      'self::appl', '@role="simple function"', 'name(children/*[2])="appl"');
  defineRule(
      'appl-simple', 'clearspeak.default',
      '[n] children/*[1]; [t] "de"; [p] (pause:"short"); [n] children/*[2];' +
      ' [p] (pause:"short")',
      'self::appl', '@role="simple function"', 'name(children/*[2])="fenced"',
      'name(children/*[2]/children/*[1])="appl"');

  defineRule(
      'appl', 'clearspeak.Functions_None',
      '[p] (pause:"short"); [n] children/*[1]; [t] "fois"; ' +
      '[n] children/*[2]; [p] (pause:"short")',
      'self::appl');

  defineRule(
      'function-prefix', 'clearspeak.default',
      '[n] children/*[1]; [n] children/*[2]',
      'self::appl', '@role="prefix function"');

  // TODO: This could be problematic. Decide at end if it is worth keeping.
  // Does not fully work with ImpTimes065 for example.
  //
  // (changes: testCap003, testCap013, testFracfunct009, testLog018,
  // testTrig035)
  //
  // defineRule(
  //     'function-prefix', 'clearspeak.default',
  //     '[n] children/*[1]; [n] children/*[2]; [p] (pause:"short")',
  //   'self::appl', '@role="prefix function"',
  //   'parent::*/parent::infixop[@role!="implicit"]|
  //    parent::*/parent::relseq|parent::*/parent::multrel',
  //   'following-sibling::*');

  defineRule(
      'binary-operation', 'clearspeak.ImpliedTimes_MoreImpliedTimes',
      '[n] . (grammar:impliedTimes); [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'parent::*/parent::infixop[@role="implicit"]', 'following-sibling::*',
      'not(contains(@grammar, "impliedTimes"))');

  defineRule(
      'function-prefix-simple-arg', 'clearspeak.default',
      '[n] children/*[1]; [n] children/*[2]',
      'self::appl', '@role="prefix function"',
      'name(children/*[2])="fenced"',
      'contains(children/*[2]/children/*[1]/@annotation, "clearspeak:simple")',
      'name(children/*[2]/children/*[1])!="number"',
      'name(children/*[2]/children/*[1])!="identifier"',
      'name(children/*[2]/children/*[1])!="appl"'
  );
  defineRule(
      'function-prefix-embell', 'clearspeak.default',
      '[p] (pause:"short"); [n] children/*[1]; [n] children/*[2];' +
      ' [p] (pause:"short"); ',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])!="function"');

  // REMEMBER: When testing for function we can use the one in content!
  defineRule(
      'function-prefix-fenced-or-frac-arg', 'clearspeak.default',
      '[p] (pause:"short"); [n] children/*[1]; [t] "de";' +
      ' [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      '(name(children/*[2])="fenced" and not(contains(' +
      'children/*[2]/children/*[1]/@annotation, "clearspeak:simple")))' +
      ' or name(children/*[2])="fraction" or ' +
      '(name(children/*[2])!="fenced" and not(contains(children/*[2]/@annotation' +
      ', "clearspeak:simple")))',
      'self::*');
  defineRule(
      'function-prefix-subscript', 'clearspeak.default',
      '[p] (pause:"short"); [n] children/*[1]; [t] "de";' +
      ' [p] (pause:"short"); [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="subscript"', 'self::*');


  // ln rules!
  // TODO: (QUESTION) These pauses are not consistent!
  defineRule(
      'function-ln', 'clearspeak.default',
      '[n] children/*[1]; [n] children/*[2]',
      'self::appl', '@role="prefix function"',
      'content/*[2][text()="ln"]', 'not(following-sibling::*)',
      'not(contains(@grammar, "NatLog"))');
  defineRule(
      'function-ln', 'clearspeak.default',
      '[n] children/*[1]; [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'content/*[2][text()="ln"]',
      'not(contains(@grammar, "NatLog"))');
  defineRule(
      'function-ln', 'clearspeak.default',
      '[n] children/*[1]; [t] "de"; [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'content/*[2][text()="ln"]', 'name(children/*[2])="fenced"',
      'not(contains(@grammar, "NatLog"))');
  // TODO: (MS2.3) This grammar rule can be ditched with a better treatment of
  //               the preferences.
  defineRule(
      'function-ln', 'clearspeak.Log_LnAsNaturalLog',
      '[n] . (grammar:NatLog)',
      'self::appl', '@role="prefix function"',
      'content/*[2][text()="ln"]', 'not(following-sibling::*)',
      'not(contains(@grammar, "NatLog"))');
  defineRule(
      'function-ln', 'clearspeak.Log_LnAsNaturalLog',
      '[n] . (grammar:NatLog); [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'content/*[2][text()="ln"]',
      'not(contains(@grammar, "NatLog"))');


  // Pauses?
  defineRule(
      'function-prefix-as-exp', 'clearspeak.default',
      '[n] children/*[1]; [t] "de";' +
      ' [p] (pause:"short"); [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(parent::*/parent::*)="superscript"', 'not(following-sibling::*)',
      '(name(children/*[2])="fenced" and not(contains(' +
      'children/*[2]/children/*[1]/@annotation, "clearspeak:simple")))' +
      ' or name(children/*[2])="fraction" or (name(children/*[2])!="fenced"' +
      ' and not(contains(children/*[2]/@annotation, "clearspeak:simple")))');
  defineRule(
      'function-prefix-subscript-as-exp', 'clearspeak.default',
      '[n] children/*[1]; [t] "de";' +
      ' [p] (pause:"short"); [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(parent::*/parent::*)="superscript"', 'not(following-sibling::*)',
      'name(children/*[1])="subscript"');


  defineRule(
      'function-prefix-hyper', 'clearspeak.default',
      '[p] (pause:"short"); [n] children/*[1]; [t] "de"; [n] children/*[2];' +
      ' [p] (pause:"short")',
      'self::appl', '@role="prefix function"', 'CQFisHyperbolic');

  defineRule(
      'function-prefix-inverse', 'clearspeak.default',
      '[p] (pause:"short"); ' +
      ' [n] children/*[1]/children/*[1]; [t] "inverse de";' +
      ' [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="superscript"',
      'name(children/*[1]/children/*[2])="prefixop"',
      'children/*[1]/children/*[2][@role="negative"]',
      'children/*[1]/children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))');

  // TODO: Maybe add a pause after function if argument is not simple.
  // 'contains(children/*[2]/children/*[1]/@annotation, "clearspeak:simple")',
  defineRule(
      'function-prefix-inverse', 'clearspeak.Trig_Reciprocal',
      '[p] (pause:"short"); ' +
      '[t] "la reciproque de"; [n] children/*[1]/children/*[1];' +
      ' [p] (pause:"short"); [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="superscript"',
      'name(children/*[1]/children/*[2])="prefixop"',
      'children/*[1]/children/*[2][@role="negative"]',
      'children/*[1]/children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))');
  defineRule(
      'function-prefix-inverse', 'clearspeak.Trig_Reciprocal',
      '[p] (pause:"short"); ' +
      '[t] "la reciproque de"; [n] children/*[1]/children/*[1];' +
      '[n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="superscript"',
      'name(children/*[1]/children/*[2])="prefixop"',
      'contains(children/*[2]/@annotation, "clearspeak:simple")',
      'children/*[1]/children/*[2][@role="negative"]',
      'children/*[1]/children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))');


  defineRule(
      'appl-triginverse', 'clearspeak.Trig_TrigInverse',
      '[p] (pause:"short"); [n] children/*[1]; [t] "de";' +
      ' [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="superscript"',
      'name(children/*[1]/children/*[2])="prefixop"',
      'children/*[1]/children/*[2][@role="negative"]',
      'children/*[1]/children/*[2]/children/*[1][text()="1"]');

  defineRule(
      'function-prefix-arc-simple', 'clearspeak.Trig_ArcTrig',
      '[p] (pause:"short"); [t] "arc"; [n] children/*[1]/children/*[1];' +
      ' [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="superscript"',
      'name(children/*[1]/children/*[2])="prefixop"',
      'children/*[1]/children/*[2][@role="negative"]',
      'children/*[1]/children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))');
  defineRule(
      'function-prefix-arc-simple', 'clearspeak.Trig_ArcTrig',
      '[p] (pause:"short"); [t] "arc"; [n] children/*[1]/children/*[1];' +
      ' [p] (pause:"short"); [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="superscript"',
      'name(children/*[1]/children/*[2])="prefixop"',
      'children/*[1]/children/*[2][@role="negative"]',
      'children/*[1]/children/*[2]/children/*[1][text()="1"]',
      'name(children/*[2])="fenced"',
      'children/*[2]/children/*[1][@role="prefix function"]',
      'contains(children/*[2]/children/*[1]/@annotation, "clearspeak:simple")',
      'not(contains(@grammar, "functions_none"))');


  defineRule(
      'function-prefix-arc', 'clearspeak.Trig_ArcTrig',
      '[p] (pause:"short"); [t] "arc"; [n] children/*[1]/children/*[1];' +
      ' [t] "de"; [n] children/*[2]; [p] (pause:"short")',
      'self::appl', '@role="prefix function"',
      'name(children/*[1])="superscript"',
      'name(children/*[1]/children/*[2])="prefixop"',
      'children/*[1]/children/*[2][@role="negative"]',
      'children/*[1]/children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))',
      '(name(children/*[2])="fenced" and not(contains(' +
      'children/*[2]/children/*[1]/@annotation, "clearspeak:simple")))' +
      ' or (name(children/*[2])="fraction" and ' +
      'children/*[2][@role!="vulgar"])');

  // TODO: Either of the two are firing but not separately!
  defineRule(
      'function-inverse', 'clearspeak.default',
      '[n] children/*[1]; [t] "inverse"',
      'self::superscript', '@role="prefix function" or @role="simple function"',
      'name(children/*[2])="prefixop"', 'children/*[2][@role="negative"]',
      'children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))');
  defineRule(
      'function-inverse', 'clearspeak.Functions_Reciprocal',
      '[t] "la reciproque de"; [n] children/*[1]',
      'self::superscript', '@role="prefix function" or @role="simple function"',
      'name(children/*[2])="prefixop"', 'children/*[2][@role="negative"]',
      'children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))');

  // TODO: (MS2.3) Better handling of preferences.
  defineRule(
      'function-inverse', 'clearspeak.Functions_None',
      '[n] . (grammar:functions_none)',
      'self::superscript',
      '@role="prefix function" or @role="simple function"',
      'name(children/*[2])="prefixop"', 'children/*[2][@role="negative"]',
      'children/*[2]/children/*[1][text()="1"]',
      'not(contains(@grammar, "functions_none"))');

  //
  // Superscript rules
  //
  defineRule(
      'superscript', 'clearspeak.default',
      '[n] children/*[1]; [t] "à l\'exposant" (pause:"short"); ' +
      '[n] children/*[2]; [p] (pause:"short");' +
      ' [t] "fin exposant" (pause:"short")',
      'self::superscript');
  defineRule(
      'superscript-simple-exponent', 'clearspeak.default',
      '[n] children/*[1]; [t] "à la puissance"; [n] children/*[2]; [p] (pause:"medium")',
      'self::superscript', 'not(descendant::superscript)');
  defineRule(
      'superscript-simple-exponent', 'clearspeak.default',
      '[n] children/*[1]; [t] "à la puissance"; [n] children/*[2]; [p] (pause:"medium") ',
      'self::superscript', 'not(descendant::superscript)',
      'not(following-sibling::*)');

  defineRuleAlias(
      'superscript-simple-exponent', 'self::superscript',
      'children/superscript/children/*[2][text()="2"] or ' +
      'children/superscript/children/*[2][text()="3"]',
      'name(children/superscript/children/*[1])="number"',
      'contains(children/superscript/children/*[1]/@annotation, ' +
      '"clearspeak:simple")');
  defineRuleAlias(
      'superscript-simple-exponent', 'self::superscript',
      'children/superscript/children/*[2][text()="2"] or ' +
      'children/superscript/children/*[2][text()="3"]',
      'name(children/superscript/children/*[1])="fraction"',
      'contains(children/superscript/children/*[1]/@annotation,' +
      ' "clearspeak:simple")');
  defineRuleAlias(
      'superscript-simple-exponent', 'self::superscript',
      'children/superscript/children/*[2][text()="2"] or' +
      ' children/superscript/children/*[2][text()="3"]',
      'name(children/superscript/children/*[1])="identifier"');

  defineRuleAlias(
      'superscript-simple-exponent', 'self::superscript',
      'children/*[2][@role="implicit"]', 'count(children/*[2]/children/*)=2',
      'contains(children/*[2]/children/*[1]/@annotation, "simple")',
      'name(children/*[2]/children/*[2])="superscript"',
      '(name(children/*[2]/children/*[2]/children/*[1])="number" and ' +
      'contains(children/*[2]/children/*[2]/children/*[1]/@annotation,' +
      ' "clearspeak:simple")) or ' +
      'name(children/*[2]/children/*[2]/children/*[1])="identifier"',
      'children/*[2]/children/*[2]/children/*[2][text()="2"] or ' +
      'children/*[2]/children/*[2]/children/*[2][text()="3"]');

  defineRule(
      'superscript-simple-function', 'clearspeak.Functions_None',
      '[n] . (grammar:functions_none)',
      'self::superscript', 'name(children/*[1])="identifier"',
      'children/*[1][@role="simple function"]',
      'not(contains(@grammar, "functions_none"))');

  defineRule(
      'superscript-ordinal', 'clearspeak.Exponent_Ordinal',
      '[n] children/*[1]; [t] "à la"; ' +
      '[n] children/*[2] (grammar:ordinal);' +
      ' [t] "puissance" (pause:"medium")',
      'self::superscript', 'name(children/*[2])="identifier"',
      'children/*[2][@role="latinletter"]');
  defineRule(
      'superscript-ordinal', 'clearspeak.Exponent_Ordinal',
      '[n] children/*[1]; [t] "à la puissance"; ' +
      '[n] children/*[2]; [p] (pause:"medium")',
      'self::superscript', 'name(children/*[2])="identifier"',
      'children/*[2][@role="latinletter"]', 'CQFisCaptial');

  // TODO....
  defineRule(
      'exponent', 'clearspeak.default',
      '[n] text() (join:"-"); [t] "ième"', 'self::identifier',
      'contains(@grammar, "ordinal")');
  defineRule(
      'exponent', 'clearspeak.default',
      '[t] CSFordinalExponent', 'self::number', '@role="integer"',
      'contains(@grammar, "ordinal")', 'text()!="0"');
  defineRule(
      'exponent', 'clearspeak.Exponent_Ordinal',
      '[t] CSFwordOrdinal', 'self::number', '@role="integer"',
      'contains(@grammar, "ordinal")', 'text()!="0"');
  defineRule(
      'exponent', 'clearspeak.Exponent_Ordinal',
      '[t] "zero"', 'self::number', '@role="integer"',
      'contains(@grammar, "ordinal")', 'text()="0"');
  defineRule(
      'exponent', 'clearspeak.Exponent_OrdinalPower',
      '[t] CSFwordOrdinal', 'self::number', '@role="integer"',
      'contains(@grammar, "ordinal")', 'text()!="0"');
  defineRule(
      'exponent', 'clearspeak.Exponent_OrdinalPower',
      '[t] "zero"', 'self::number', '@role="integer"',
      'contains(@grammar, "ordinal")', 'text()="0"');

  // Square
  defineRule(
      'square', 'clearspeak.default',
      '[n] children/*[1]; [t] "au carré"',
      'self::superscript', 'children/*[2][text()="2"]',
      'name(children/*[1])!="text" or ' +
      // Special exception dealing with footnotes.
      'not(name(children/*[1])="text" and ' +
      '(name(../../../punctuated[@role="text"]/..)="stree" ' +
      'or name(..)="stree"))', 'self::*', 'self::*'
  );

  // Cube
  defineRule(
      'cube', 'clearspeak.default',
      '[n] children/*[1]; [t] "au cube"',
      'self::superscript', 'children/*[2][text()="3"]',
      'name(children/*[1])!="text" or ' +
      // Special exception dealing with footnotes.
      'not(name(children/*[1])="text" and ' +
      '(name(../../../punctuated[@role="text"]/..)="stree" ' +
      'or name(..)="stree"))', 'self::*', 'self::*'
  );


  //
  // Parentheses rules
  //
  defineRule(
      'paren-simple', 'clearspeak.default',
      '[n] children/*[1]',
      'self::fenced', '@role="leftright"',
      'contains(children/*[1]/@annotation, "clearspeak:simple")',
      'name(../..)!="superscript" and name(../..)!="subscript"'
  );
  defineRule(
      'paren-simple-exp', 'clearspeak.default',
      '[n] children/*[1]',
      'self::fenced', '@role="leftright"',
      'name(../..)="superscript"',
      'children/*[1][@role="integer"] or children/*[1][@role="float"] or ' +
      '(children/*[1][@role="vulgar"] and contains(children/*[1]/@annotation,' +
      ' "clearspeak:simple")) or children/*[1][@role="latinletter"] or ' +
      'children/*[1][@role="greekletter"] or children/*[1][@role="otherletter"]'
  );
  defineRule(
      'paren-simple-nested-func', 'clearspeak.default',
      '[n] children/*[1]',
      'self::fenced', '@role="leftright"',
      'name(../*[1])="identifier" or name(../*[1])="function"',
      'parent::*/parent::*[@role="simple function" or @role="prefix function"]',
      'children/*[1][@role="simple function" or @role="prefix function"]',
      'contains(children/*[1]/children/*[2]/children/*[1]/@annotation,' +
      ' "clearspeak:simple") or ' +
      'name(children/*[1]/children/*[2]/children/*[1])="subscript" or ' +
      'name(children/*[1]/children/*[2]/children/*[1])="superscript" or ' +
      'children/*[1]/children/*[2]/children/*[1][@role="vulgar"] '
  );
  defineRule(
      'paren-simple-nested-func-no-bracket', 'clearspeak.Functions_None',
      '[n] children/*[1];',
      'self::fenced', '@role="leftright"',
      'name(../*[1])="identifier" or name(../*[1])="function"',
      'parent::*/parent::*[@role="simple function" or @role="prefix function"]',
      'children/*[1][@role="simple function" or @role="prefix function"]',
      'name(children/*[1]/children/*[1])="identifier" or' +
      ' name(children/*[1]/children/*[1])="function"',
      'contains(children/*[1]/children/*[2]/children/*[1]/@annotation,' +
      ' "clearspeak:simple")',
      'name(children/*[1]/children/*[2]/children/*[1])="identifier" or ' +
      'name(children/*[1]/children/*[2]/children/*[1])="number"'
  );
  // Parens spoken
  defineRule(
      'fences-open-close', 'clearspeak.default',
      '[p] (pause:"short"); [n] content/*[1] (grammar:spokenFence);' +
      ' [p] (pause:"short"); [n] children/*[1];' +
      ' [p] (pause:"short"); [n] content/*[2] (grammar:spokenFence);' +
      ' [p] (pause:"short")',
      'self::fenced', '@role="leftright"');
  defineRule(
      'paren-simple-nested-func', 'clearspeak.default',
      '[p] (pause:"short"); [n] content/*[1];' +
      ' [p] (pause:"short"); [n] children/*[1];' +
      ' [p] (pause:"short"); [n] content/*[2];' +
      ' [p] (pause:"short")',
      'self::fenced', '@role="leftright"',
      'name(../*[1])="identifier" or name(../*[1])="function"',
      'parent::*/parent::*[@role="simple function" or @role="prefix function"]',
      'not(contains(children/*[1]/@annotation, "clearspeak:simple"))');
  defineRule(
      'paren-simple-nested-func', 'clearspeak.Functions_None',
      '[p] (pause:"short"); [n] content/*[1] (grammar:spokenFence);' +
      ' [p] (pause:"short"); [n] children/*[1];' +
      ' [p] (pause:"short"); [n] content/*[2] (grammar:spokenFence);' +
      ' [p] (pause:"short")',
      'self::fenced', '@role="leftright"',
      'name(../*[1])="identifier" or name(../*[1])="function"',
      'parent::*/parent::*[@role="simple function" or @role="prefix function"]',
      'children/*[1][@role="simple function" or @role="prefix function"]',
      'contains(children/*[1]/children/*[2]/children/*[1]/@annotation,' +
      ' "clearspeak:simple") or ' +
      'name(children/*[1]/children/*[2]/children/*[1])="subscript" or ' +
      'name(children/*[1]/children/*[2]/children/*[1])="superscript" or ' +
      'children/*[1]/children/*[2]/children/*[1][@role="vulgar"] '
  );
  // Order important!
  defineSpecialisedRule(
      'fences-open-close', 'clearspeak.default', 'clearspeak.Paren_Speak');
  defineRuleAlias(
      'fences-open-close', 'self::fenced', '@role="composed function"');
  defineRule(
      'fence-silent', 'clearspeak.Paren_Silent',
      '[p] (pause:"short"); [n] children/*[1]; [p] (pause:"short")',
      'self::fenced'
  );

  defineRule(
      'fences-open-close', 'clearspeak.ImpliedTimes_None',
      '[p] (pause:"short"); [n] content/*[1] (grammar:spokenFence);' +
      ' [p] (pause:"short"); [n] children/*[1];' +
      ' [p] (pause:"short"); [n] content/*[2] (grammar:spokenFence);' +
      ' [p] (pause:"short")',
      'self::fenced', '@role="leftright"',
      'parent::*/parent::*[@role!="simple function"]',
      'parent::*/parent::*[@role!="prefix function"]');

  // TODO: Localise nesting level method. Uses mathspeak English ordinal method.
  defineRule(
      'fence-nesting', 'clearspeak.Paren_SpeakNestingLevel',
      '[n] text() (grammar:insertNesting=CSFnestingDepth)',
      'self::fence', 'contains(@grammar, "spokenFence")', 'CQFmatchingFences'
  );
  defineRule(
      'fence-no-nesting', 'clearspeak.Paren_SpeakNestingLevel',
      '[n] text()', 'self::fence'
  );

  // Coordinates
  defineRule(
      'fences-points', 'clearspeak.Paren_CoordPoint',
      '[t] "le point avec coordonées"; [n] children/*[1]',
      'self::fenced', 'name(children/*[1])="punctuated"',
      'children/*[1][@role="sequence"]');

  // Intervals
  defineRule(
      'fences-interval', 'clearspeak.Paren_Interval',
      '[t] "un intervalle de"; ' +
      '[n] children/*[1]/children/*[1]; [t] "à"; ' +
      '[n] children/*[1]/children/*[3]; [p] (pause:"short"); ' +
      '[n] . (grammar:interval)',
      'self::fenced', 'not(contains(@grammar, "interval"))',
      'name(children/*[1])="punctuated"',
      'children/*[1][@role="sequence"]', 'count(./children/*[1]/content/*)=1',
      'children/*[1]/content/*[1][@role="comma"]'
  );

  defineRule(
      'interval-open', 'clearspeak.Paren_Interval',
      '[t] "sans inclure"; [n] children/*[1]/children/*[1]; ' +
      '[t] "ni"; [n] children/*[1]/children/*[3]',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="("',
      'content/*[2]/text()=")"'
  );
  defineRule(
      'interval-closed-open', 'clearspeak.Paren_Interval',
      '[t] "avec"; [n] children/*[1]/children/*[1]; [t] "inclus";' +
      ' [p] (pause:"short"); ' +
      '[t] "mais sans inclure"; [n] children/*[1]/children/*[3]',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="["',
      'content/*[2]/text()=")"'
  );
  defineRule(
      'interval-open-closed', 'clearspeak.Paren_Interval',
      '[t] "sans inclure"; [n] children/*[1]/children/*[1];' +
      ' [p] (pause:"short"); ' +
      '[t] "mais avec"; [n] children/*[1]/children/*[3]; [t] "inclus"',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="("',
      'content/*[2]/text()="]"'
  );
  defineRule(
      'interval-closed', 'clearspeak.Paren_Interval',
      '[t] "avec"; [n] children/*[1]/children/*[1]; ' +
      '[t] "et"; [n] children/*[1]/children/*[3]; [t] "inclus"',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="["',
      'content/*[2]/text()="]"'
  );
  // Infinity cases.
  defineRule(
      'interval-open-inf-r', 'clearspeak.Paren_Interval',
      '[t] "sans inclure"; [n] children/*[1]/children/*[1]',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="("',
      'content/*[2]/text()=")"',
      'children/*[1]/children/*[3]/text()="∞" or' +
      ' (name(children/*[1]/children/*[3])="prefixop" and ' +
      'children/*[1]/children/*[3]/children/*[1]/text()="∞")');
  defineRule(
      'interval-open-inf-l', 'clearspeak.Paren_Interval',
      '[t] "sans inclure"; [n] children/*[1]/children/*[3]',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="("',
      'content/*[2]/text()=")"',
      'children/*[1]/children/*[1]/text()="∞" or' +
      ' (name(children/*[1]/children/*[1])="prefixop" and ' +
      'children/*[1]/children/*[1]/children/*[1]/text()="∞")');
  defineRule(
      'interval-open-inf-lr', 'clearspeak.Paren_Interval',
      '',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="("',
      'content/*[2]/text()=")"',
      'children/*[1]/children/*[3]/text()="∞" or' +
      ' (name(children/*[1]/children/*[3])="prefixop" and ' +
      'children/*[1]/children/*[3]/children/*[1]/text()="∞")',
      'children/*[1]/children/*[1]/text()="∞" or' +
      ' (name(children/*[1]/children/*[1])="prefixop" and ' +
      'children/*[1]/children/*[1]/children/*[1]/text()="∞")');
  defineRule(
      'interval-closed-open-inf', 'clearspeak.Paren_Interval',
      '[t] "avec"; [n] children/*[1]/children/*[1]; [t] "inclus"',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="["',
      'content/*[2]/text()=")"',
      'children/*[1]/children/*[3]/text()="∞" or' +
      ' (name(children/*[1]/children/*[3])="prefixop" and ' +
      'children/*[1]/children/*[3]/children/*[1]/text()="∞")');
  defineRule(
      'interval-open-closed-inf', 'clearspeak.Paren_Interval',
      '[t] "avec"; [n] children/*[1]/children/*[3]; [t] "inclus"',
      'self::fenced', 'contains(@grammar, "interval")',
      'content/*[1]/text()="("',
      'content/*[2]/text()="]"',
      'children/*[1]/children/*[1]/text()="∞" or' +
      ' (name(children/*[1]/children/*[1])="prefixop" and ' +
      'children/*[1]/children/*[1]/children/*[1]/text()="∞")');

  defineRule(
      'paren-nested-embellished-funcs', 'clearspeak.Functions_None',
      '[p] (pause:"short"); [n] content/*[1];' +
      ' [p] (pause:"short"); [n] children/*[1];' +
      ' [p] (pause:"short"); [n] content/*[2]; [p] (pause:"short")',
      'self::fenced', '@role="leftright"',
      'name(../..)="appl"', 'name(children/*[1]) = "appl"',
      'preceding-sibling::*/descendant-or-self::*[@role="subsup"] or ' +
      'children/*[1]/descendant-or-self::*[@role="subsup"]'
  );

  // Set braces
  defineRule(
      'set-empty', 'clearspeak.default',
      '[t] "ensemble vide"',
      'self::fenced', '@role="set empty"');
  defineRule(
      'set-extended', 'clearspeak.default',
      '[t] "ensemble des"; [n] children/*[1]/children/*[1]; ' +
      '[t] "tel que"; [n] children/*[1]/children/*[3]',
      'self::fenced', '@role="set extended"');
  defineRule(
      'set-collection', 'clearspeak.default',
      '[t] "ensemble"; [n] children/*[1]',
      'self::fenced', '@role="set collection"');
  defineRuleAlias(
      'set-collection', 'self::fenced', '@role="set singleton"');

  defineRule(
      'set-extended', 'clearspeak.Sets_woAll',
      '[t] "ensemble de"; [n] children/*[1]/children/*[1]; ' +
      '[t] "tel que"; [n] children/*[1]/children/*[3]',
      'self::fenced', '@role="set extended"');
  defineRule(
      'set-collection', 'clearspeak.Sets_SilentBracket',
      '[n] children/*[1]',
      'self::fenced', '@role="set collection"');


  // Subscript
  defineRule(
      'subscript', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "sub";' +
      ' [n] children/*[2]; [p] (pause:short)',
      'self::subscript');
  defineRule(
      'subscript-base', 'clearspeak.default',
      '[n] children/*[1]; [t] "base"; [n] children/*[2]',
      'self::subscript', 'CQFisLogarithm');
  // TODO: (Simons) This should be removed once we have index structures.
  defineRule(
      'subscript-index', 'clearspeak.default',
      '[n] children/*[1]; [t] "sub"; [n] children/*[2]',
      'self::subscript', 'contains(@grammar, "simpleDet")');


  // Fraction rules
  defineRule(
      'fraction', 'clearspeak.default',
      '[p] (pause:short); [t] "fraction avec numérateur";' +
      ' [n] children/*[1]; [p] (pause:short);' +
      ' [t] "et dénominateur"; [n] children/*[2]; [p] (pause:short)',
      'self::fraction');
  defineRule(
      'fraction', 'clearspeak.Functions_None',
      '[p] (pause:short); [t] "fraction avec numérateur";' +
      ' [n] children/*[1]; [p] (pause:short);' +
      ' [t] "et dénominateur"; [n] children/*[2]; [p] (pause:short)',
      'self::fraction',
      'name(children/*[1])="appl" or name(children/*[2])="appl"'
  );
  defineRule(
      'simple-fraction', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "sur";' +
      ' [n] children/*[2]; [p] (pause:short)',
      'self::fraction',
      'contains(children/*[1]/@annotation, "clearspeak:simple")' +
      ' or contains(children/*[1]/@annotation, "clearspeak:unit")',
      'contains(children/*[2]/@annotation, "clearspeak:simple")' +
      ' or contains(children/*[2]/@annotation, "clearspeak:unit")');
  defineRule(
      'simple-vulgar-fraction', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "sur";' +
      ' [n] children/*[2]; [p] (pause:short)',
      'self::fraction', '@role="vulgar"');
  defineRule(
      'simple-text-fraction', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "sur";' +
      ' [n] children/*[2]; [p] (pause:short)',
      'self::fraction', 'name(children/*[1])="text"',
      'name(children/*[2])="text"');
  defineRule(
      'simple-text-fraction', 'clearspeak.default',
      '[p] (pause:short); [n] children/*[1]; [t] "sur";' +
      ' [n] children/*[2]; [p] (pause:short)',
      'self::fraction',
      'name(children/*[1])="infixop"', 'children/*[1][@role="unit"]',
      'name(children/*[2])="text"');
  defineRule(
      'vulgar-fraction', 'clearspeak.default',
      '[t] CSFvulgarFraction', 'self::fraction', '@role="vulgar"',
      'CQFvulgarFractionSmall');
  // Preferences
  defineRule(
      'fraction', 'clearspeak.Fraction_Over',
      '[p] (pause:short); [n] children/*[1];' +
          ' [t] "sur"; [n] children/*[2]; [p] (pause:short)',
      'self::fraction');
  defineRule(
      'fraction', 'clearspeak.Fraction_OverEndFrac',
      '[p] (pause:short); [n] children/*[1]; [t] "sur"; [n] children/*[2];' +
      ' [p] (pause:short); [t] "fin fraction"; [p] (pause:short)',
      'self::fraction');
  defineRule(
      'fraction', 'clearspeak.Fraction_FracOver',
      '[p] (pause:short); [t] "fraction"; [n] children/*[1];' +
          ' [t] "sur"; [n] children/*[2]; [p] (pause:short)',
      'self::fraction');
  // TODO: Really par everything?
  defineRule(
      'fraction', 'clearspeak.Fraction_Per',
      '[p] (pause:short); [n] children/*[1];' +
          ' [t] "par"; [n] children/*[2]; [p] (pause:short)',
      'self::fraction');
  defineRule(
      'fraction', 'clearspeak.Fraction_GeneralEndFrac',
      '[p] (pause:short); [t] "fraction avec numérateur";' +
      ' [n] children/*[1]; [p] (pause:short);' +
          ' [t] "et dénominateur"; [n] children/*[2]; [p] (pause:short);' +
      ' [t] "fin fraction"; [p] (pause:short)',
      'self::fraction');
  defineRule(
      'fraction', 'clearspeak.Fraction_General',
      '[p] (pause:short); [t] "fraction avec numérateur";' +
      ' [n] children/*[1]; [p] (pause:short);' +
          ' [t] "et dénominateur"; [n] children/*[2]; [p] (pause:short)',
      'self::fraction');

  defineRule(
      'simple-vulgar-fraction', 'clearspeak.Fraction_Ordinal',
      '[t] CSFvulgarFraction', 'self::fraction', '@role="vulgar"');

  defineRule(
      'fraction', 'clearspeak.Fraction_EndFrac',
      '[p] (pause:short); [n] . (grammar:endfrac); [t] "fin fraction";' +
      ' [p] (pause:short)',
      'self::fraction', 'not(contains(@grammar, "endfrac"))',
      'not(contains(children/*[1]/@annotation, "clearspeak:unit"))',
      'not(contains(children/*[2]/@annotation, "clearspeak:unit"))');
  defineRule(
      'vulgar-fraction', 'clearspeak.Fraction_EndFrac',
      '[p] (pause:short); [n] children/*[1]; [t] "sur"; [n] children/*[2];' +
      ' [p] (pause:short)',
      'self::fraction', 'name(children/*[1])="fraction"',
      'name(children/*[2])="fraction"',
      'contains(children/*[1]/@annotation, "clearspeak:simple")',
      'contains(children/*[2]/@annotation, "clearspeak:simple")');
  defineRule(
      'simple-vulgar-fraction', 'clearspeak.Fraction_EndFrac',
      '[t] CSFvulgarFraction', 'self::fraction', '@role="vulgar"',
      'contains(@annotation, "clearspeak:simple")', 'self::*');


  // Roots
  //
  // Square root
  //
  // TODO: Deal with the extra pause recursively and reduce number of rules!
  defineRule(
      'sqrt', 'clearspeak.default',
      '[t] "la racine carrée de"; [n] children/*[1] (grammar:EndRoot=false);' +
      ' [p] (pause:short)',
      'self::sqrt');
  defineRule(
      'sqrt-nested', 'clearspeak.default',
      '[p] (pause: "short"); [t] "la racine carrée de";' +
      ' [n] children/*[1] (grammar:EndRoot=false); [p] (pause:short)',
      'self::sqrt', 'not(preceding-sibling::*)',
      'ancestor::sqrt|ancestor::root');
  defineRule(
      'negative-sqrt', 'clearspeak.default',
      '[t] "la racine carrée négative de";' +
      ' [n] children/*[1]/children/*[1] (grammar:EndRoot=false);' +
      ' [p] (pause:short)',
      'self::prefixop', '@role="negative"', 'name(children/*[1])="sqrt"');
  defineRule(
      'negative-sqrt', 'clearspeak.default',
      '[p] (pause: "short"); [t] "la racine carrée négative de";' +
      ' [n] children/*[1]/children/*[1] (grammar:EndRoot=false);' +
      ' [p] (pause:short)',
      'self::prefixop', '@role="negative"', 'name(children/*[1])="sqrt"',
      'not(preceding-sibling::*)', 'ancestor::sqrt|ancestor::root');

  defineRule(
      'sqrt-plus-minus', 'clearspeak.Roots_PosNegSqRoot',
      '[t] "la racine carrée positive de";' +
      ' [n] children/*[1] (grammar:EndRoot=false); [p] (pause:short)',
      'self::sqrt',
      'parent::stree or not(parent::*/parent::infixop[@role="addition"]) or' +
      ' (parent::*/parent::*[1]/text()!="±"' +
      ' and parent::*/parent::*/text()!="∓")');
  defineRule(
      'sqrt-nested-plus-minus', 'clearspeak.Roots_PosNegSqRoot',
      '[p] (pause: "short"); [t] "la racine carrée positive de";' +
      ' [n] children/*[1] (grammar:EndRoot=false); [p] (pause:short)',
      'self::sqrt', 'not(preceding-sibling::*)',
      'ancestor::sqrt|ancestor::root',
      'parent::stree or not(parent::*/parent::infixop[@role="addition"]) or' +
      ' (parent::*/parent::*[1]/text()!="±"' +
      ' and parent::*/parent::*/text()!="∓")');
  defineRule(
      'sqrt-plus-minus', 'clearspeak.Roots_PosNegSqRootEnd',
      '[t] "la racine carrée positive de";' +
      ' [n] children/*[1] (grammar:EndRoot=false); [p] (pause:short)',
      'self::sqrt', 'parent::stree or' +
      ' not(parent::*/parent::infixop[@role="addition"]) or' +
      ' (parent::*/parent::*[1]/text()!="±" and' +
      ' parent::*/parent::*/text()!="∓")');
  defineRule(
      'sqrt-nested-plus-minus', 'clearspeak.Roots_PosNegSqRootEnd',
      '[p] (pause: "short"); [t] "la racine carrée positive de";' +
      ' [n] children/*[1] (grammar:EndRoot=false); [p] (pause:short)',
      'self::sqrt', 'not(preceding-sibling::*)',
      'ancestor::sqrt|ancestor::root',
      'parent::stree or' +
      ' not(parent::*/parent::infixop[@role="addition"]) or' +
      ' (parent::*/parent::*[1]/text()!="±"' +
      ' and parent::*/parent::*/text()!="∓")');

  defineRule(
      'sqrt-endroot', 'clearspeak.Roots_RootEnd',
      '[n] . (grammar:EndRoot); [t] "fin racine"; [p] (pause:short)',
      'self::sqrt', 'not(contains(@grammar, "EndRoot"))');
  defineRule(
      'negative-sqrt-endroot', 'clearspeak.Roots_RootEnd',
      '[n] . (grammar:EndRoot); [t] "fin racine"; [p] (pause:short)',
      'self::prefixop', '@role="negative"', 'name(children/*[1])="sqrt"',
      'not(contains(@grammar, "EndRoot"))');
  defineRule(
      'sqrt-endroot', 'clearspeak.Roots_PosNegSqRootEnd',
      '[n] . (grammar:EndRoot); [t] "fin racine"; [p] (pause:short)',
      'self::sqrt', 'not(contains(@grammar, "EndRoot"))');
  defineRule(
      'negative-sqrt-endroot', 'clearspeak.Roots_PosNegSqRootEnd',
      '[n] . (grammar:EndRoot); [t] "fin racine"; [p] (pause:short)',
      'self::prefixop', '@role="negative"', 'name(children/*[1])="sqrt"',
      'not(contains(@grammar, "EndRoot"))');

  // Cube roots
  defineRule(
      'cube', 'clearspeak.default',
      '[t] "la racine cubique de"; [n] children/*[2] (grammar:EndRoot=false);' +
      ' [p] (pause:short)',
      'self::root', 'children/*[1][text()="3"]');
  defineRule(
      'cube-nested', 'clearspeak.default',
      '[p] (pause:short); [t] "la racine cubique de"; ' +
      '[n] children/*[2] (grammar:EndRoot=false); [p] (pause:short)',
      'self::root', 'children/*[1][text()="3"]', 'not(preceding-sibling::*)',
      'ancestor::sqrt|ancestor::root');
  // Higher roots
  defineRule(
      'root', 'clearspeak.default',
      '[t] "la"; [n] children/*[1] (grammar:ordinal); [t] "racine de";' +
      ' [n] children/*[2] (grammar:EndRoot=false); [p] (pause:short)',
      'self::root');
  defineRule(
      'root-nested', 'clearspeak.default',
      '[p] (pause:short); [t] "la"; [n] children/*[1] (grammar:ordinal); ' +
      '[t] "racine de"; [n] children/*[2] (grammar:EndRoot=false);' +
      ' [p] (pause:short)',
      'self::root', 'not(preceding-sibling::*)',
      'ancestor::sqrt|ancestor::root');

  defineRule(
      'root-endroot', 'clearspeak.Roots_RootEnd',
      '[n] . (grammar:EndRoot); [t] "fin racine"; [p] (pause:short)',
      'self::root', 'not(contains(@grammar, "EndRoot"))');
  defineRule(
      'root-endroot', 'clearspeak.Roots_PosNegSqRootEnd',
      '[n] . (grammar:EndRoot); [t] "fin racine"; [p] (pause:short)',
      'self::root', 'not(contains(@grammar, "EndRoot"))');


  // minus sign
  defineRule(
      'negative', 'clearspeak.default',
      '[t] "négatif"; [n] children/*[1]',
      'self::prefixop', '@role="negative"');
  defineRule(
      'positive', 'clearspeak.default',
      '[t] "positif"; [n] children/*[1]',
      'self::prefixop', '@role="positive"');

  // Angle
  defineRule(
      'angle-measure', 'clearspeak.default',
      '[t] "la mesure de l\'" (join:""); [n] content/*[1]; ' +
      '[n] children/*[2] (grammar:angle)',
      'self::infixop', 'content/*[1]/text()="∠"', 'children/*[1][text()="m"]');

  // Operator rules
  defineRule(
      'prefix', 'clearspeak.default',
      '[m] content/* (grammar:prefix); [n] children/*[1]',
      'self::prefixop');
  defineRule(
      'postfix', 'clearspeak.default',
      '[n] children/*[1]; [m] content/* (grammar:postfix)',
      'self::postfixop');

  // TODO: (Simons) A very special case that could be made more general with
  //                additional semantic annotation.
  defineRule(
      'set-prefix-operators', 'clearspeak.default',
      '[t] "le"; [n] self::* (grammar:!prefix); [t] "de"',
      'self::*', 'contains(@grammar,"prefix")',
      'descendant-or-self::*/text()="\u2229" or' +
      ' descendant-or-self::*/text()="\u222A"',
      'self::*', 'self::*', 'self::*');

  defineRule(
      'binary-operation', 'clearspeak.default',
      '[m] children/* (sepFunc:CTXFcontentIterator);', 'self::infixop');
  defineRule(
      'binary-operation', 'clearspeak.ImpliedTimes_MoreImpliedTimes',
      '[m] children/* (sepFunc:CTXFcontentIterator);', 'self::infixop',
      '@role="implicit"');
  defineRule(
      'binary-operation-pause', 'clearspeak.default',
      '[p] (pause:short); [m] children/* (sepFunc:CTXFcontentIterator);',
      'self::infixop', '@role="implicit"', 'name(children/*[1])="appl"');
  defineRule(
      'binary-operation-pause', 'clearspeak.default',
      '[m] children/* (sepFunc:CTXFcontentIterator); [p] (pause:short)',
      'self::infixop', '@role="implicit"', 'name(children/*[last()])="appl"');
  defineRule(
      'binary-operation-pause', 'clearspeak.default',
      '[p] (pause:short); [m] children/* (sepFunc:CTXFcontentIterator);' +
      ' [p] (pause:short)',
      'self::infixop', '@role="implicit"', 'name(children/*[1])="appl"',
      'name(children/*[last()])="appl"');
  // Maybe restrict those to prefix function role only!

  defineRule(
      'implicit-times', 'clearspeak.default',
      '[p] (pause:short)', 'self::operator', '@role="multiplication"',
      'text()="⁢"');
  defineRule(
      'implicit-times', 'clearspeak.default',
      '', 'self::operator', '@role="multiplication"', 'text()="⁢"',
      'CQFsimpleArguments');
  defineRule(
      'implicit-times', 'clearspeak.default',
      '[n] text()', 'self::operator', '@role="multiplication"', 'text()="⁢"',
      'CQFfencedArguments');
  defineRule(
      'implicit-times', 'clearspeak.ImpliedTimes_MoreImpliedTimes',
      '[n] text()', 'self::operator', '@role="multiplication"', 'text()="⁢"');
  defineRule(
      'implicit-times', 'clearspeak.ImpliedTimes_None',
      '', 'self::operator', '@role="multiplication"', 'text()="⁢"');
  // TODO: XPath 2.0 would help here!

  // REMARK: Currently we have accelerated rate only with multi-character simple
  // expressions or if they are the enumerator of a fraction.
  //
  defineRule(
      'binary-operation-simple', 'clearspeak.default',
      '[m] children/* (rate:"0.5"); [p] (pause:short)',
      'self::infixop', '@role="implicit"',
      'contains(@annotation, "clearspeak:simple")',
      'not(contains(@grammar, "inFrac"))');

  defineRule(
      'simple-in-fraction', 'clearspeak.default',
      '[n] . (rate:"0.5",grammar:inFrac)',
      'self::*', 'contains(@annotation, "clearspeak:simple")',
      'not(contains(@grammar, "inFrac"))',
      'name(.)!="identifier"', 'name(.)!="function"', 'name(.)!="number"',
      'name(parent::*/parent::*)="fraction"',
      'not(preceding-sibling::*)');

  defineRule(
      'operators-after-power', 'clearspeak.Exponent_AfterPower',
      '[m] children/* (rate:"0.5")', 'self::infixop',
      '@role="implicit"', 'contains(@grammar, "afterPower")'
  );


  // Relations
  defineRule(
      'relseq', 'clearspeak.default',
      '[m] children/* (sepFunc:CTXFcontentIterator)',
      'self::relseq');

  defineRule(
      'multrel', 'clearspeak.default',
      '[m] children/* (sepFunc:CTXFcontentIterator)',
      'self::multirel');

  // Named sets (They need additional dummy constraints for ordering!)
  //
  defineRule(
      'natural-numbers', 'clearspeak.default',
      '[t] "les nombres entier naturel"', 'self::identifier',
      'text()="\u2115" or (text()="N" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'integers', 'clearspeak.default',
      '[t] "les nombres entiers"', 'self::identifier',
      'text()="\u2124" or (text()="Z" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'rational-numbers', 'clearspeak.default',
      '[t] "les Nombres rationnels"', 'self::identifier',
      'text()="\u211A" or (text()="Q" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'real-numbers', 'clearspeak.default',
      '[t] "les nombres réels"', 'self::identifier',
      'text()="\u211D" or (text()="R" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'complex-numbers', 'clearspeak.default',
      '[t] "les nombres complexes"', 'self::identifier',
      'text()="\u2102" or (text()="C" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');

  // Named sets with superscripts
  defineRule(
      'natural-numbers-super', 'clearspeak.default',
      '[t] "n" (join: "-"); [n] children/*[2] (grammar:numbers2alpha)',
      'self::superscript', 'children/*[1]/text()="\u2115"' +
      ' or (children/*[1]/text()="N" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'integers-super', 'clearspeak.default',
      '[t] "z" (join: "-"); [n] children/*[2] (grammar:numbers2alpha)',
      'self::superscript', 'children/*[1]/text()="\u2124"' +
      ' or (children/*[1]/text()="Z" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'rational-numbers-super', 'clearspeak.default',
      '[t] "q" (join: "-"); [n] children/*[2] (grammar:numbers2alpha)',
      'self::superscript', 'children/*[1]/text()="\u211A"' +
      ' or (children/*[1]/text()="Q" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'real-numbers-super', 'clearspeak.default',
      '[t] "r" (join:"-"); [n] children/*[2] (grammar:numbers2alpha)',
      'self::superscript', 'children/*[1]/text()="\u211D"' +
      ' or (children/*[1]/text()="R" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'complex-numbers-super', 'clearspeak.default',
      '[t] "c" (join:"-"); [n] children/*[2] (grammar:numbers2alpha)',
      'self::superscript', 'children/*[1]/text()="\u2102"' +
      ' or (children/*[1]/text()="C" and @font="double-struck")',
      'self::*', 'self::*', 'self::*');

  // Partial named sets.
  defineRule(
      'natural-numbers-with-zero', 'clearspeak.default',
      '[t] "les nombres entiers naturel avec zero"',
      'self::subscript', 'children/*[1]/text()="\u2115"' +
      ' or (children/*[1]/text()="N" and @font="double-struck")',
      'children/*[2]/text()="0"');
  defineRule(
      'positive-integers', 'clearspeak.default',
      '[t] "les nombres entiers positif"',
      'self::superscript', 'children/*[1]/text()="\u2124"' +
      ' or (children/*[1]/text()="Z" and @font="double-struck")',
      'children/*[2]/text()="+"',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'positive-integers', 'clearspeak.default',
      '[t] "les nombres entiers négatif"',
      'self::superscript', 'children/*[1]/text()="\u2124"' +
      ' or (children/*[1]/text()="Z" and @font="double-struck")',
      'children/*[2]/text()="-"',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'positive-rational-numbers', 'clearspeak.default',
      '[t] "les nombres rationnels positif"',
      'self::superscript', 'children/*[1]/text()="\u211A"' +
      ' or (children/*[1]/text()="Q" and @font="double-struck")',
      'children/*[2]/text()="+"',
      'self::*', 'self::*', 'self::*');
  defineRule(
      'negative-rational-numbers', 'clearspeak.default',
      '[t] "les nombres rationnels négatif"',
      'self::superscript', 'children/*[1]/text()="\u211A"' +
      ' or (children/*[1]/text()="Q" and @font="double-struck")',
      'children/*[2]/text()="-"',
      'self::*', 'self::*', 'self::*');
  // TODO: Do we need positive and negative real numbers. Usually they are more
  //       complex notation!

  // Absolute Values
  defineRule(
      'fences-neutral', 'clearspeak.default',
      '[p] (pause:short); [t] "la valeur absolue de"; ' +
      '[n] children/*[1]; [p] (pause: short)',
      'self::fenced', '@role="neutral"',
      'content/*[1][text()]="|" or content/*[1][text()]="❘" or' +
      ' content/*[1][text()]="｜"');
  defineRule(
      'fences-neutral', 'clearspeak.AbsoluteValue_AbsEnd',
      '[p] (pause:short); [t] "la valeur absolue de"; ' +
      '[n] children/*[1]; [p] (pause: short); ' +
      '[t] "fin de valeur absolue"; [p] (pause: short)',
      'self::fenced', '@role="neutral"',
      'content/*[1][text()]="|" or content/*[1][text()]="❘" or' +
      ' content/*[1][text()]="｜"');
  defineRule(
      'fences-neutral', 'clearspeak.AbsoluteValue_Cardinality',
      '[p] (pause:short); [t] "la cardinalité de"; ' +
      '[n] children/*[1]; [p] (pause: short)',
      'self::fenced', '@role="neutral"',
      'content/*[1][text()]="|" or content/*[1][text()]="❘" or' +
      ' content/*[1][text()]="｜"');
  defineRule(
      'fences-neutral', 'clearspeak.AbsoluteValue_Determinant',
      '[p] (pause:short); [t] "le déterminant de"; ' +
      '[n] children/*[1]; [p] (pause: short)',
      'self::fenced', '@role="neutral"',
      'content/*[1][text()]="|" or content/*[1][text()]="❘" or' +
      ' content/*[1][text()]="｜"');

  // Layout elements: Matrix like structures
  // Order of rules is important!
  //
  // Matrix
  defineRule(
      'matrix', 'clearspeak.default',
      '[t] "la matrice de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); [p] (pause:long);' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:"rangée-:");' +
      ' [p] (pause:long)',
      'self::matrix');
  defineRule(
      'matrix-simple', 'clearspeak.default',
      '[t] "la matrice de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      ' [p] (pause:long); [m] children/* ' +
      '(ctxtFunc:CTXFnodeCounter,context:"rangée-:",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::matrix', 'count(children/*)<4',
      'count(children/*[1]/children/*)<4', 'CQFcellsSimple');
  defineRule(
      'matrix-trivial', 'clearspeak.default',
      '[t] "la matrice de dimension 1 par 1 avec élément";' +
      ' [n] children/*[1]; [p] (pause:long)',
      'self::vector', '@role="squarematrix"');
  // Determinant
  defineRule(
      'determinant', 'clearspeak.default',
      '[t] "le déterminant de la matrice de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/* ' +
      '(ctxtFunc:CTXFnodeCounter,context:"rangée-:",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::matrix', '@role="determinant"', 'count(children/*)<4',
      'CQFcellsSimple');
  defineRule(
      'determinant-simple', 'clearspeak.default',
      '[t] "le déterminant de la matrice de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/* ' +
      '(ctxtFunc:CTXFnodeCounter,context:"rangée-:");' +
      ' [p] (pause:long)',
      'self::matrix', '@role="determinant"');
  // Vector
  defineRule(
      'matrix-vector', 'clearspeak.default',
      '[t] "la matrice colonne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/* ' +
      '(ctxtFunc:CTXFnodeCounter,context:"rangée-:",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::vector');
  defineSpecialisedRule(
      'matrix-vector', 'clearspeak.default', 'clearspeak.Matrix_SpeakColNum');
  defineRule(
      'matrix-vector-simple', 'clearspeak.default',
      '[t] "la matrice colonne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/* ' +
      '(sepFunc:CTXFpauseSeparator,separator:"short",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::vector', 'count(children/*)<4', 'CQFcellsSimple',
      '@role!="squarematrix"');
  defineRule(
      'matrix-vector-simple', 'clearspeak.Matrix_SilentColNum',
      '[t] "la matrice colonne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/* ' +
      '(sepFunc:CTXFpauseSeparator,separator:"short",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::vector');

  defineRule(
      'matrix-row-vector', 'clearspeak.default',
      '[t] "la matrice ligne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/*[1]/children/* ' +
      '(ctxtFunc:CTXFnodeCounter,context:"colonne-:",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::matrix', '@role="rowvector"');
  defineSpecialisedRule(
      'matrix-row-vector', 'clearspeak.default',
      'clearspeak.Matrix_SpeakColNum');
  defineRule(
      'matrix-row-vector-simple', 'clearspeak.default',
      '[t] "la matrice ligne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/*[1]/children/* ' +
      '(sepFunc:CTXFpauseSeparator,separator:"short",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::matrix', '@role="rowvector"', 'count(children/*[1]/children/*)<4',
      'CQFcellsSimple');
  defineRule(
      'matrix-row-vector-simple', 'clearspeak.Matrix_SilentColNum',
      '[t] "la matrice ligne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/*[1]/children/* ' +
      '(sepFunc:CTXFpauseSeparator,separator:"short",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::matrix', '@role="rowvector"');


  defineRule(
      'matrix-row-simple', 'clearspeak.default',
      '[m] children/* (sepFunc:CTXFpauseSeparator,separator:"short")',
      'self::row', 'contains(@grammar, "simpleDet")');
  defineRule(
      'matrix-row-simple', 'clearspeak.Matrix_SilentColNum',
      '[m] children/* (sepFunc:CTXFpauseSeparator,separator:"short")',
      'self::row');
  defineRule(
      'line-simple', 'clearspeak.default',
      '[n] children/*[1]',
      'self::line', 'contains(@grammar, "simpleDet")');
  defineRule(
      'matrix-row', 'clearspeak.default',
      '[m] children/* (ctxtFunc:CTXFnodeCounter,context:"colonne-,- ",' +
      'sepFunc:CTXFpauseSeparator,separator:"medium"); [p] (pause:long)',
      'self::row');
  defineSpecialisedRule(
      'matrix-row', 'clearspeak.default', 'clearspeak.Matrix_SpeakColNum');
  defineRule(
      'matrix-cell', 'clearspeak.default',
      '[n] children/*[1]', 'self::cell');

  defineRule(
      'matrix-end-matrix', 'clearspeak.Matrix_EndMatrix',
      '[n] . (grammar:EndMatrix); [t] "fin matrice"',
      'self::matrix', 'not(contains(@grammar, "EndMatrix"))');
  defineRule(
      'matrix-end-vector', 'clearspeak.Matrix_EndMatrix',
      '[n] . (grammar:EndMatrix); [t] "fin matrice"',
      'self::vector', 'not(contains(@grammar, "EndMatrix"))');
  defineRule(
      'matrix-end-determinant', 'clearspeak.Matrix_EndMatrix',
      '[n] . (grammar:EndMatrix); [t] "fin déterminant"',
      'self::matrix', '@role="determinant"',
      'not(contains(@grammar, "EndMatrix"))');

  defineRule(
      'vector', 'clearspeak.Matrix_Vector',
      '[t] "le vecteur colonne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/* ' +
      '(ctxtFunc:CTXFnodeCounter,context:"rangée-:",grammar:simpleDet); ' +
      '[p] (pause:long)',
      'self::vector');
  defineSpecialisedRule(
      'vector', 'clearspeak.Matrix_Vector', 'clearspeak.Matrix_EndVector');
  defineRule(
      'vector-simple', 'clearspeak.Matrix_Vector',
      '[t] "le vecteur colonne de dimension"; [t] count(children/*);  [t] "par"; ' +
      '[t] count(children/*[1]/children/*); ' +
      '[p] (pause:long); [m] children/* ' +
      '(sepFunc:CTXFpauseSeparator,separator:"short",grammar:simpleDet); ' +
      '[p] (pause:long)',
      'self::vector', 'count(children/*)<4', 'CQFcellsSimple');
  defineSpecialisedRule(
      'vector-simple', 'clearspeak.Matrix_Vector',
      'clearspeak.Matrix_EndVector');

  defineRule(
      'row-vector', 'clearspeak.Matrix_Vector',
      '[t] "le vecteur ligne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*);' +
      ' [p] (pause:long); [m] children/*[1]/children/* ' +
      '(ctxtFunc:CTXFnodeCounter,context:"colonne-:",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::matrix', '@role="rowvector"');
  defineSpecialisedRule(
      'row-vector', 'clearspeak.Matrix_Vector', 'clearspeak.Matrix_EndVector');
  defineRule(
      'row-vector-simple', 'clearspeak.Matrix_Vector',
      '[t] "le vecteur ligne de dimension"; [t] count(children/*);  [t] "par";' +
      '[t] count(children/*[1]/children/*);' +
      ' [p] (pause:long); [m] children/*[1]/children/* ' +
      '(sepFunc:CTXFpauseSeparator,separator:"short",grammar:simpleDet);' +
      ' [p] (pause:long)',
      'self::matrix', '@role="rowvector"', 'count(children/*[1]/children/*)<4',
      'CQFcellsSimple');
  defineSpecialisedRule(
      'row-vector-simple', 'clearspeak.Matrix_Vector',
      'clearspeak.Matrix_EndVector');

  // TODO: Consider the nesting problem!
  defineRule(
      'vector-end-matrix', 'clearspeak.Matrix_EndVector',
      '[n] . (grammar:EndMatrix); [t] "fin matrice"',
      'self::matrix', 'not(contains(@grammar, "EndMatrix"))',
      'self::*');
  defineRule(
      'vector-end-vector', 'clearspeak.Matrix_EndVector',
      '[n] . (grammar:EndMatrix); [t] "fin vecteur"',
      'self::vector', 'not(contains(@grammar, "EndMatrix"))',
      'self::*');
  defineRule(
      'vector-end-vector', 'clearspeak.Matrix_EndVector',
      '[n] . (grammar:EndMatrix); [t] "fin vecteur"',
      'self::matrix', '@role="rowvector"',
      'not(contains(@grammar, "EndMatrix"))',
      'self::*');
  defineRule(
      'vector-end-determinant', 'clearspeak.Matrix_EndVector',
      '[n] . (grammar:EndMatrix); [t] "fin déterminant"',
      'self::matrix', '@role="determinant"',
      'not(contains(@grammar, "EndMatrix"))',
      'self::*');

  defineRule(
      'binomial', 'clearspeak.Matrix_Combinatoric',
      '[n] children/*[2]/children/*[1]; ' +
      '[t] "parmi"; [n] children/*[1]/children/*[1]; ',
      'self::vector', '@role="binomial"');

  // Tables/Multiline elements
  defineRule(
      'lines-summary', 'clearspeak.default',
      '[p] (pause:short); [t] count(children/*); [t] "lignes";' +
      '  [n] . (grammar:layoutSummary)',
      'self::multiline', 'not(contains(@grammar, "layoutSummary"))', 'self::*'
  );
  defineRule(
      'lines-summary', 'clearspeak.MultiLineOverview_None',
      '[n] . (grammar:layoutSummary)',
      'self::multiline', 'not(contains(@grammar, "layoutSummary"))', 'self::*'
  );
  defineRuleAlias(
      'lines-summary', 'self::table', 'not(contains(@grammar, "layoutSummary"))'
  );

  defineRule(
      'cases-summary', 'clearspeak.default',
      '[p] (pause:short); [t] count(children/*); [t] "cas";' +
      '  [n] . (grammar:layoutSummary)',
      'self::cases', 'not(contains(@grammar, "layoutSummary"))'
  );
  defineRule(
      'cases-summary', 'clearspeak.MultiLineOverview_None',
      '[n] . (grammar:layoutSummary)',
      'self::cases', 'not(contains(@grammar, "layoutSummary"))', 'self::*'
  );

  defineRule(
      'lines', 'clearspeak.default',
      '[p] (pause:short);' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:"Ligne-:",' + //
      'sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::table');
  defineRuleAlias(
      'lines', 'self::multiline');

  defineRule(
      'line', 'clearspeak.default',
      '[n] children/*[1]', 'self::line');
  defineRule(
      'row-medium', 'clearspeak.default',
      '[m] children/* (sepFunc:CTXFpauseSeparator,separator:"medium")',
      'self::row', '@role="table"');
  defineRuleAlias('row-medium', 'self::row', '@role="cases"');
  defineRule(
      'row-long', 'clearspeak.MultiLinePausesBetweenColumns_Long',
      '[m] children/* (sepFunc:CTXFpauseSeparator,separator:"long")',
      'self::row', '@role="table"');
  defineRuleAlias('row-long', 'self::row', '@role="cases"');
  defineRule(
      'row-short', 'clearspeak.MultiLinePausesBetweenColumns_Short',
      '[m] children/* (sepFunc:CTXFpauseSeparator,separator:"short")',
      'self::row', '@role="table"');
  defineRuleAlias('row-short', 'self::row', '@role="cases"');
  // TODO: Get rid of blank!
  defineRule(
      'blank-cell', 'clearspeak.default',
      '[t] "vide"', 'self::cell', 'count(children/*)=0');
  defineRule(
      'blank-empty', 'clearspeak.default',
      '[t] "vide"', 'self::empty', 'count(../*)=1',
      'name(../..)="cell" or name(../..)="line"');

  defineRule(
      'cases', 'clearspeak.default',
      '[p] (pause:short); ' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:"Cas-:",' +
      'sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::cases');

  // Label Preferences:
  // Case
  defineRule(
      'lines-cases-summary', 'clearspeak.MultiLineLabel_Case',
      '[p] (pause:short); [t] count(children/*); [t] "cas";' +
      '  [n] . (grammar:layoutSummary)',
      'self::multiline', 'not(contains(@grammar, "layoutSummary"))'
  );
  defineRuleAlias(
      'lines-cases-summary', 'self::table',
      'not(contains(@grammar, "layoutSummary"))'
  );
  defineRule(
      'lines-cases', 'clearspeak.MultiLineLabel_Case',
      '[p] (pause:short);' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:"Cas-:",' +
      'sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::table');
  defineRuleAlias(
      'lines-cases', 'self::multiline');

  // Equation
  defineRule(
      'lines-equations-summary', 'clearspeak.MultiLineLabel_Equation',
      '[p] (pause:short); [t] count(children/*); [t] "équations";' +
      '  [n] . (grammar:layoutSummary)',
      'self::multiline', 'not(contains(@grammar, "layoutSummary"))'
  );
  defineRuleAlias(
      'lines-equations-summary', 'self::table',
      'not(contains(@grammar, "layoutSummary"))'
  );
  defineRule(
      'lines-equations', 'clearspeak.MultiLineLabel_Equation',
      '[p] (pause:short);' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:"Équation-:",' +
      'sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::table');
  defineRuleAlias(
      'lines-equations', 'self::multiline');

  // Step
  defineRule(
      'lines-steps-summary', 'clearspeak.MultiLineLabel_Step',
      '[p] (pause:short); [t] count(children/*); [t] " étapes";' +
      '  [n] . (grammar:layoutSummary)',
      'self::multiline', 'not(contains(@grammar, "layoutSummary"))'
  );
  defineRuleAlias(
      'lines-steps-summary', 'self::table',
      'not(contains(@grammar, "layoutSummary"))'
  );
  defineRule(
      'lines-steps', 'clearspeak.MultiLineLabel_Step',
      '[p] (pause:short);' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:" Étape-:",' +
      'sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::table');
  defineRuleAlias(
      'lines-steps', 'self::multiline');

  // Row
  defineRule(
      'lines-rows-summary', 'clearspeak.MultiLineLabel_Row',
      '[p] (pause:short); [t] count(children/*); [t] "colonnes";' +
      '  [n] . (grammar:layoutSummary)',
      'self::multiline', 'not(contains(@grammar, "layoutSummary"))'
  );
  defineRuleAlias(
      'lines-rows-summary', 'self::table',
      'not(contains(@grammar, "layoutSummary"))'
  );
  defineRule(
      'lines-rows', 'clearspeak.MultiLineLabel_Row',
      '[p] (pause:short);' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:"rangée-:",' +
      'sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::table');
  defineRuleAlias(
      'lines-rows', 'self::multiline');

  // Constraint
  defineRule(
      'lines-constraints-summary', 'clearspeak.MultiLineLabel_Constraint',
      '[p] (pause:short); [t] count(children/*); [t] "contraintes";' +
      '  [n] . (grammar:layoutSummary)',
      'self::multiline', 'not(contains(@grammar, "layoutSummary"))'
  );
  defineRuleAlias(
      'lines-constraints-summary', 'self::table',
      'not(contains(@grammar, "layoutSummary"))'
  );
  defineRule(
      'lines-constraints', 'clearspeak.MultiLineLabel_Constraint',
      '[p] (pause:short);' +
      ' [m] children/* (ctxtFunc:CTXFnodeCounter,context:"Contrainte-:",' +
      'sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::table');
  defineRuleAlias(
      'lines-constraints', 'self::multiline');

  // None
  defineRule(
      'lines-none', 'clearspeak.MultiLineLabel_None',
      '[p] (pause:short);' +
      ' [m] children/* (sepFunc:CTXFpauseSeparator,separator:"long");' +
      ' [p] (pause:long)', 'self::table',
      'contains(@grammar, "layoutSummary")');
  defineRuleAlias('lines-none', 'self::multiline',
      'contains(@grammar, "layoutSummary")');
  defineRuleAlias('lines-none', 'self::cases',
      'contains(@grammar, "layoutSummary")');



  //
  // Big operators
  defineRule(
      'bigop', 'clearspeak.default',
      '[t] "le"; [n] children/*[1]; [t] "de"; [n] children/*[2];' +
      ' [p] (pause:short)',
      'self::bigop');
  defineRule(
      'limboth', 'clearspeak.default',
      '[n] children/*[1]; [t] "de"; [n] children/*[2];' +
      '[t] "à"; [n] children/*[3];',
      'self::limboth');
  defineRule(
      'limlower', 'clearspeak.default',
      '[n] children/*[1]; [t] "sur"; [n] children/*[2]; [p] (pause:short)',
      'self::limlower');
  defineRule(
      'limupper', 'clearspeak.default',
      '[n] children/*[1]; [t] "sous"; [n] children/*[2]; [p] (pause:short)',
      'self::limupper');
  defineRule(
      'integral', 'clearspeak.default',
      '[t] "le"; [n] children/*[1]; [t] "de"; [n] children/*[2];' +
      ' [p] (pause:short)',
      'self::integral');

  // Over/under rules.
  // Default rules:
  defineRule(
      'overscript', 'clearspeak.default',
      '[n] children/*[1]; [t] "sous"; [n] children/*[2]; [p] (pause:short)',
      'self::overscore'
  );
  defineRule(
      'overscript', 'clearspeak.default',
      '[n] children/*[1]; [n] children/*[2];',
      'self::overscore', 'children/*[2][@role="overaccent"]'
  );
  defineRule(
      'overscript-limits', 'clearspeak.default',
      '[n] children/*[1]; [t] "à"; [n] children/*[2]',
      'self::overscore', 'children/*[2][@role!="overaccent"]',
      'name(children/*[1])="underscore"',
      'children/*[1]/children/*[2][@role!="underaccent"]'
  );
  defineRule(
      'underscript', 'clearspeak.default',
      '[n] children/*[1]; [t] "sur"; [n] children/*[2]; [p] (pause:short)',
      'self::underscore'
  );
  defineRule(
      'underscript-limits', 'clearspeak.default',
      '[n] children/*[1]; [t] "de"; [n] children/*[2]',
      'self::underscore', '@role="underover"',
      'children/*[2][@role!="underaccent"]'
  );

  // Number rules
  defineRule(
      'number', 'clearspeak.default', '[n] text()', 'self::number');
  defineRule(
      'mixed-number', 'clearspeak.default',
      '[n] children/*[1]; [t] "et"; [n] children/*[2]; ',
      'self::number', '@role="mixed"');
  defineRule(
      'number-with-chars', 'clearspeak.default',
      '[t] "nombre"; [m] CQFspaceoutNumber (grammar:protected)',
      'self::number', '@role="othernumber"',
      '"" != translate(text(), "0123456789.,", "")',
      'not(contains(@grammar, "protected"))');

  // Decimal periods:
  // TODO: Plural for chiffre repete!
  defineRule(
      'decimal-period', 'clearspeak.default',
      '[t] "la décimale"; [n] children/*[1] (grammar:spaceout); ' +
      '[t] "virgule suivi par les chiffres répétés"; ' +
      ' [n] children/*[3]/children/*[1] (grammar:spaceout)',
      'self::punctuated', '@role="sequence"', 'count(./content/*)=1',
      './content/*[1][@role="fullstop"]',
      'name(children/*[1])="number"', 'children/*[1][@role="integer"]',
      'name(children/*[3])="overscore"', 'children/*[3][@role="integer"]',
      'children/*[3]/children/*[2][@role="overaccent"]',
      'children/*[3]/children/*[2][text()="\u00AF" or text()="\uFFE3"' +
      ' or text()="\uFF3F" or text()="\u005F" or text()="\u203E"]'
  );
  defineRule(
      'decimal-period', 'clearspeak.default',
      '[t] "la décimale"; [n] children/*[1] (grammar:spaceout); ' +
      '[t] "suivi par les chiffres répétés"; ' +
      ' [n] children/*[2]/children/*[1] (grammar:spaceout);',
      'self::infixop', '@role="implicit"', 'count(./children/*)=2',
      'name(children/*[1])="number"', 'children/*[1][@role="float"]',
      'name(children/*[2])="overscore"', 'children/*[2][@role="integer"]',
      'children/*[2]/children/*[2][@role="overaccent"]',
      'children/*[2]/children/*[2][text()="\u00AF" or text()="\uFFE3"' +
      ' or text()="\uFF3F" or text()="\u005F" or text()="\u203E"]'
  );
  defineRule(
      'decimal-period-singular', 'clearspeak.default',
      '[t] "la décimale"; [n] children/*[1] (grammar:spaceout); ' +
      '[t] "virgule suivi par le chiffre répété"; ' +
      ' [n] children/*[3]/children/*[1] (grammar:spaceout)',
      'self::punctuated', '@role="sequence"', 'count(./content/*)=1',
      './content/*[1][@role="fullstop"]',
      'name(children/*[1])="number"', 'children/*[1][@role="integer"]',
      'name(children/*[3])="overscore"', 'children/*[3][@role="integer"]',
      'children/*[3]/children/*[2][@role="overaccent"]',
      'children/*[3]/children/*[2][text()="\u00AF" or text()="\uFFE3"' +
      ' or text()="\uFF3F" or text()="\u005F" or text()="\u203E"]',
      'string-length(./children/*[3]/children/*[1]/text())=1'
  );
  defineRule(
      'decimal-period-singular', 'clearspeak.default',
      '[t] "la décimale"; [n] children/*[1] (grammar:spaceout); ' +
      '[t] "suivi par le chiffre répété"; ' +
      ' [n] children/*[2]/children/*[1] (grammar:spaceout);',
      'self::infixop', '@role="implicit"', 'count(./children/*)=2',
      'name(children/*[1])="number"', 'children/*[1][@role="float"]',
      'name(children/*[2])="overscore"', 'children/*[2][@role="integer"]',
      'children/*[2]/children/*[2][@role="overaccent"]',
      'children/*[2]/children/*[2][text()="\u00AF" or text()="\uFFE3"' +
      ' or text()="\uFF3F" or text()="\u005F" or text()="\u203E"]',
      'string-length(./children/*[2]/children/*[1]/text())=1'
  );
  defineRule(
      'number-with-spaces', 'clearspeak.default',
      '[m] CQFspaceoutNumber (grammar:!spaceout:number)', 'self::number',
      'contains(@grammar, "spaceout")');
  defineRule(
      'decimal-point', 'clearspeak.default',
      '[t] "point"', 'self::punctuation', '@role="fullstop"',
      'contains(@grammar,"number")');

  // Line segments:
  defineRule(
      'line-segment', 'clearspeak.default',
      '[t] "le segment"; [n] children/*[1]/children/*[1]; ' +
      '[n] children/*[1]/children/*[2]; [p] (pause:short)',
      'self::overscore', '@role="implicit"',
      'children/*[2][@role="overaccent"]',
      'children/*[2][text()="\u00AF" or text()="\uFFE3"' +
      ' or text()="\uFF3F" or text()="\u005F" or text()="\u203E"]',
      'name(children/*[1])="infixop"', 'count(./children/*[1]/children/*)=2'
  );

  // Congutates:
  defineRule(
      'conjugate', 'clearspeak.Bar_Conjugate',
      '[t] "le complexe conjugué de"; [n] children/*[1]',
      'self::overscore',
      'children/*[2][@role="overaccent"]',
      'children/*[2][text()="\u00AF" or text()="\uFFE3"' +
      ' or text()="\uFF3F" or text()="\u005F" or text()="\u203E"]'
  );

  // Special rules:
  defineRule(
      'defined-by', 'clearspeak.default',
      '[t] "est défini par" (pause:short)',
      'self::overscore', '@role="equality"', '@embellished="relation"',
      'name(children/*[2])="text"', 'children/*[2][text()]="def"'
  );
  defineRule(
      'adorned-sign', 'clearspeak.default',
      '[t] "signe"; [n] children/*[1] ; [t] "avec"; [n] children/*[2]; [t] "dessus"',
      'self::overscore', '@embellished',
      'name(children/*[1])="operator" or name(children/*[1])="relation"'
  );
  defineRule(
      'factorial', 'clearspeak.default', '[t] "factorielle"', 'self::punctuation',
      'text()="!"', 'name(preceding-sibling::*[1])!="text"');

  // Tensors:
  defineRule(
      'tensor-base', 'clearspeak.default',
      '[n] children/*[2]; [n] children/*[3]; [n] children/*[1];' +
      ' [n] children/*[4]; [n] children/*[5]',
      'self::tensor'
  );
  defineRule(
      'left-super', 'clearspeak.default',
      '[t] "exposant gauche"; [n] text()', 'self::*[@role="leftsuper"]',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'left-super', 'clearspeak.default',
      '[t] "exposant gauche"; [m] children/*',
      'self::punctuated', '@role="leftsuper"',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'left-sub', 'clearspeak.default',
      '[t] "indice gauche"; [n] text()', 'self::*[@role="leftsub"]',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'left-sub', 'clearspeak.default',
      '[t] "indice gauche"; [m] children/*',
      'self::punctuated', '@role="leftsub"',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'right-super', 'clearspeak.default',
      '[t] "exposant droite"; [n] text()', 'self::*[@role="rightsuper"]',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'right-super', 'clearspeak.default',
      '[t] "exposant droite"; [m] children/*',
      'self::punctuated', '@role="rightsuper"',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'right-sub', 'clearspeak.default',
      '[t] "indice droite"; [n] text()', 'self::*[@role="rightsub"]',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'right-sub', 'clearspeak.default',
      '[t] "indice droite"; [m] children/*',
      'self::punctuated', '@role="rightsub"',
      'not(contains(@grammar,"combinatorics"))'
  );
  defineRule(
      'empty-index', 'clearspeak.default',
      '[p] (pause:medium)', 'self::empty',
      '@role="rightsub" or @role="rightsuper" or' +
      ' @role="leftsub" or @role="leftsuper"'
  );

  // Special rules for combinatorics.
  defineRule(
      'combinatorics', 'clearspeak.default',
      '[n] children/*[2] (grammar:combinatorics); [n] children/*[1]; ' +
      '[n] children/*[4] (grammar:combinatorics)',
      'self::tensor', 'name(children/*[3])="empty"',
      'name(children/*[5])="empty"',
      'children/*[1][text()="P" or text()="C"]'
  );
  defineRule(
      'choose', 'clearspeak.CombinationPermutation_ChoosePermute',
      '[t] "combinaison de"; [n] children/*[3] (grammar:combinatorics); [t] "parmi"; ' +
      '[n] children/*[4] (grammar:combinatorics)',
      'self::tensor', 'name(children/*[3])="empty"',
      'name(children/*[5])="empty"',
      'children/*[1][text()="C"]'
  );
  defineRule(
      'permute', 'clearspeak.CombinationPermutation_ChoosePermute',
      '[t] "permutation de"; [n] children/*[2] (grammar:combinatorics); [t] "parmi"; ' +
      '[n] children/*[4] (grammar:combinatorics)',
      'self::tensor', 'name(children/*[3])="empty"',
      'name(children/*[5])="empty"',
      'children/*[1][text()="P"]'
  );



};

});  // goog.scope


sre.ClearspeakFrench.getInstance().initializer = [
  sre.ClearspeakFrench.initCustomFunctions_,
  sre.ClearspeakFrench.initClearspeakFrench_
];


sre.Grammar.getInstance().setPreprocessor('numbers2alpha',
                                          sre.ClearspeakUtil.numbersToAlpha);
