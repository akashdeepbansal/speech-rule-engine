// Copyright 2013 Google Inc.
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
 * @fileoverview Rule store for math syntax tree nodes.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('sre.MathStore');

goog.require('sre.AuditoryDescription');
goog.require('sre.BaseRuleStore');
goog.require('sre.BaseUtil');
goog.require('sre.DynamicCstr');
goog.require('sre.Engine');
goog.require('sre.Locale.en');
goog.require('sre.Messages');
goog.require('sre.SpeechRule');
goog.require('sre.Trie');



/**
 * A store for Math rules.
 * @constructor
 * @extends {sre.BaseRuleStore}
 */
sre.MathStore = function() {
  sre.MathStore.base(this, 'constructor');

  /**
   * @type {Array.<function()>}
   */
  this.initializer = [];

};
goog.inherits(sre.MathStore, sre.BaseRuleStore);


/**
 * @override
 */
sre.MathStore.prototype.initialize = function() {
  if (this.initialized) return;
  for (var i = 0, func; func = this.initializer[i]; i++) {
    func();
  }
  this.setSpeechRules(this.trie.collectRules());
  this.initialized = true;
};


/**
 * Adds an alias for an existing rule.
 * @param {string} name The name of the rule.
 * @param {string} dynamic A math domain and style assignment.
 * @param {string} query Precondition query of the rule.
 * @param {...string} var_args Additional static precondition constraints.
 */
sre.MathStore.prototype.defineUniqueRuleAlias = function(
    name, dynamic, query, var_args) {
  var dynamicCstr = this.parseCstr(dynamic);
  var rule = this.findRule(
      goog.bind(
          function(rule) {
            return rule.name == name &&
                dynamicCstr.equal(rule.dynamicCstr);
          },
          this));
  if (!rule) {
    throw new sre.SpeechRule.OutputError(
        'Rule named ' + name + ' with style ' + dynamic + ' does not exist.');
  }
  this.addAlias_(rule, query, Array.prototype.slice.call(arguments, 3));
};


// TODO: Possibly defines a number of duplicate rules.
// (E.g., superscript-baseline in Mathspeak)
// These are automatically discarded in the Trie, but might still be worthwhile
// looking into the definition methods.
//
/**
 * Adds an alias for an existing rule.
 * @param {string} name The name of the rule.
 * @param {string} query Precondition query of the rule.
 * @param {...string} var_args Additional static precondition constraints.
 */
sre.MathStore.prototype.defineRuleAlias = function(name, query, var_args) {
  var rule = this.findRule(function(rule) {
    return rule.name == name;});
  if (!rule) {
    throw new sre.SpeechRule.OutputError(
        'Rule with named ' + name + ' does not exist.');
  }
  this.addAlias_(rule, query, Array.prototype.slice.call(arguments, 2));
};


/**
 * Adds an alias for an existing rule.
 * @param {string} name The name of the rule.
 * @param {string} query Precondition query of the rule.
 * @param {...string} var_args Additional static precondition constraints.
 */
sre.MathStore.prototype.defineRulesAlias = function(name, query, var_args) {
  var rules = this.findAllRules(function(rule) {return rule.name == name;});
  if (rules.length == 0) {
    throw new sre.SpeechRule.OutputError(
        'Rule with name ' + name + ' does not exist.');
  }
  var cstrList = Array.prototype.slice.call(arguments, 2);
  var keep = [];
  var findKeep = function(rule) {
    var cstr = rule.dynamicCstr.toString();
    var action = rule.action.toString();
    for (var i = 0, k; k = keep[i]; i++) {
      if (k.action === action && k.cstr === cstr) {
        return false;
      }
    }
    keep.push({cstr: cstr, action: action});
    return true;
  };
  rules.forEach(goog.bind(
      function(rule) {
        if (findKeep(rule)) {
          this.addAlias_(rule, query, cstrList);
        }
      },
      this));
};


/**
 * Adds a new speech rule as alias of the given rule.
 * @param {sre.SpeechRule} rule The existing rule.
 * @param {string} query Precondition query of the rule.
 * @param {Array.<string>} cstrList List of additional constraints.
 * @private
 */
sre.MathStore.prototype.addAlias_ = function(rule, query, cstrList) {
  var prec = new sre.SpeechRule.Precondition(query, cstrList);
  var newRule = new sre.SpeechRule(
      rule.name, rule.dynamicCstr, prec, rule.action);
  newRule.name = rule.name;
  this.addRule(newRule);
};


/**
 * Duplicates a speech rule for the old dynamic constraint for a new dynamic
 * constraint, keeping the same precondition, while possibly adding a new
 * action.
 * @param {string} name The name of the rule.
 * @param {string} oldDynamic The old math domain and style assignment.
 * @param {string} newDynamic The new math domain and style assignment.
 * @param {string=} opt_action String version of the speech rule.
 */
sre.MathStore.prototype.defineSpecialisedRule = function(
    name, oldDynamic, newDynamic, opt_action) {
  var dynamicCstr = this.parseCstr(oldDynamic);
  var rule = this.findRule(
      goog.bind(
          function(rule) {
            return rule.name == name &&
                dynamicCstr.equal(rule.dynamicCstr);},
          this));
  if (!rule) {
    throw new sre.SpeechRule.OutputError(
        'Rule named ' + name + ' with style ' +
        oldDynamic + ' does not exist.');
  }
  var newCstr = this.parseCstr(newDynamic);
  var action = opt_action ? sre.SpeechRule.Action.fromString(opt_action) :
          rule.action;
  var newRule = new sre.SpeechRule(
      rule.name, newCstr, rule.precondition, action);
  this.addRule(newRule);
};


// Evaluator
/**
 * @override
 */
sre.MathStore.prototype.evaluateDefault = function(node) {
  return this.evaluateString_(node.textContent);
};


/**
 * Evaluates a single string of a math expressions. The method splits the given
 * string into components such as single characters, function names or words,
 * numbers, etc. and creates the appropriate auditory descriptions.
 * @param {string} str A string.
 * @return {!Array.<sre.AuditoryDescription>} Messages for the math expression.
 * @private
 */
sre.MathStore.prototype.evaluateString_ = function(str) {
  var descs = new Array();
  if (str.match(/^\s+$/)) {
    // Nothing but whitespace: Ignore.
    return descs;
  }
  // Case of numbers with whitespace for seperation.
  var num = this.matchNumber_(str);
  if (num && num.length === str.length) {
    descs.push(this.evaluate_(num.number));
    return descs;
  }
  var split = sre.BaseUtil.removeEmpty(str.replace(/\s/g, ' ').split(' '));
  for (var i = 0, s; s = split[i]; i++) {
    if (s.length == 1) {
      descs.push(this.evaluate_(s));
    } else if (s.match(new RegExp('^[' + sre.Messages.REGEXP.TEXT + ']+$'))) {
      descs.push(this.evaluate_(s));
    } else {
      // Break up string even further wrt. symbols vs alphanum substrings.
      var rest = s;
      while (rest) {
        num = this.matchNumber_(rest);
        var alpha = rest.match(new RegExp('^[' + sre.Messages.REGEXP.TEXT + ']+'));
        if (num) {
          descs.push(this.evaluate_(num.number));
          rest = rest.substring(num.length);
        } else if (alpha) {
          descs.push(this.evaluate_(alpha[0]));
          rest = rest.substring(alpha[0].length);
        } else {
          // Dealing with surrogate pairs.
          var chr = rest[0];
          var code = chr.charCodeAt(0);
          if (0xD800 <= code && code <= 0xDBFF &&
              rest.length > 1 && !isNaN(rest.charCodeAt(1))) {
            descs.push(this.evaluate_(rest.slice(0, 2)));
            rest = rest.substring(2);
          } else {
            descs.push(this.evaluate_(rest[0]));
            rest = rest.substring(1);
          }
        }
      }
    }
  }
  return descs;
};


/**
 * Matches a number with respect to locale. If it discovers it is a number in
 * English writing, it will attempt to translate it.
 * @param {string} str The string to match.
 * @return {?{number: string, length: number}} The number and its length.
 */
sre.MathStore.prototype.matchNumber_ = function(str) {
  var locNum = str.match(new RegExp('^' + sre.Messages.REGEXP.NUMBER));
  var enNum = str.match(new RegExp('^' + sre.Locale.en.REGEXP.NUMBER));
  if (!locNum && !enNum) {
    return null;
  }
  var isEn = enNum && enNum[0] === str;
  var isLoc = (locNum && locNum[0] === str) || !isEn;
  if (isLoc) {
    return {number: locNum[0], length: locNum[0].length};
  }
  var number = enNum[0].
      replace(new RegExp(sre.Locale.en.REGEXP.DIGIT_GROUP, 'g'), 'X').
      replace(new RegExp(sre.Locale.en.REGEXP.DECIMAL_MARK, 'g'),
              sre.Messages.REGEXP.DECIMAL_MARK).
      replace(/X/g, sre.Messages.REGEXP.DIGIT_GROUP);
  return {number: number, length: enNum[0].length};
};


/**
 * Creates a new Auditory Description for a math expression.
 * @param {string} text to be translated.
 * @return {sre.AuditoryDescription} Auditory description for the math
 *     expression.
 * @private
 */
sre.MathStore.prototype.evaluate_ = function(text) {
  return sre.AuditoryDescription.create(
      {text: text}, {adjust: true, translate: true});
};
