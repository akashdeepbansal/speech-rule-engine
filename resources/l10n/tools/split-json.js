let fs = require('fs');
let shell = require('shelljs');
let xmldom = require('xmldom-sre');
let SplitJson = {};

// Mathmaps path
SplitJson.PATH_ = '/home/sorge/git/speech-rule-engine/src/mathmaps';

SplitJson.OUTPUT_PATH_ = '/tmp/output';

SplitJson.HTML_PATH_ = '/tmp/html';

SplitJson.TEMPLATE_PATH_ = '/tmp/ods';

SplitJson.ODS_PATH_ = '/tmp/spreadsheets';

SplitJson.ODS_TEMPLATE_ = '/home/sorge/git/speech-rule-engine/resources/l10n/templates/ods';

SplitJson.INPUT_PATH_ = '/tmp/input';

SplitJson.WWW_BASE_PATH = '/home/sorge/git/speech-rule-engine/resources/www';

/**
 * Subpath to dir containing ChromeVox JSON definitions for symbols.
 * @type {string}
 * @const
 * @private
 */
SplitJson.SYMBOLS_ = 'symbols';


/**
 * Name of functions file/directory.
 * @type {string}
 * @const
 * @private
 */
SplitJson.FUNCTIONS_ = 'functions';


/**
 * Name of units file/directory.
 * @type {string}
 * @const
 * @private
 */
SplitJson.UNITS_ = 'units';


/**
 * Name of prefix for units file.
 * @type {string}
 * @const
 * @private
 */
SplitJson.PREFIX_ = 'prefix';


/**
 * Subpath to dir containing ChromeVox JSON definitions for unused.
 * @type {string}
 * @const
 * @private
 */
SplitJson.UNUSED_PATH_ = 'unused';

/**
 * Array of JSON filenames containing symbol definitions for math speak.
 * @type {Array.<string>}
 * @const
 * @private
 */
SplitJson.SYMBOLS_FILES_ = [
  // Greek
  'greek-capital.js', 'greek-small.js', 'greek-scripts.js',
  'greek-mathfonts-bold.js', 'greek-mathfonts-italic.js',
  'greek-mathfonts-sans-serif-bold.js', 'greek-symbols.js',
  
  // Hebrew
  'hebrew_letters.js',

  // Latin
  'latin-lower-double-accent.js', 'latin-lower-normal.js',
  'latin-lower-phonetic.js', 'latin-lower-single-accent.js',
  'latin-rest.js', 'latin-upper-double-accent.js',
  'latin-upper-normal.js', 'latin-upper-single-accent.js',

  // Latin Mathfonts
  'latin-mathfonts-bold-fraktur.js', 'latin-mathfonts-bold.js',
  'latin-mathfonts-bold-script.js', 'latin-mathfonts-double-struck.js',
  'latin-mathfonts-fraktur.js', 'latin-mathfonts-italic.js',
  'latin-mathfonts-monospace.js', 'latin-mathfonts-sans-serif-bold.js',
  'latin-mathfonts-sans-serif-italic.js', 'latin-mathfonts-sans-serif.js',
  'latin-mathfonts-script.js',

  // Math Symbols
  'math_angles.js', 'math_arrows.js', 'math_characters.js',
  'math_delimiters.js', 'math_digits.js', 'math_geometry.js',
  'math_harpoons.js', 'math_non_characters.js', 'math_symbols.js',
  'math_whitespace.js', 'other_stars.js'

];


/**
 * Array of JSON filenames containing symbol definitions for math speak.
 * @type {Array.<string>}
 * @const
 * @private
 */
SplitJson.FUNCTIONS_FILES_ = [
  'algebra.js', 'elementary.js', 'hyperbolic.js', 'trigonometry.js'
];


/**
 * Array of JSON filenames containing unit definitions for math speak.
 * @type {Array.<string>}
 * @const
 * @private
 */
SplitJson.UNITS_FILES_ = [
  'energy.js', 'length.js', 'memory.js', 'other.js', 'speed.js',
  'temperature.js', 'time.js', 'volume.js', 'weight.js'
];


/**
 * Array of JSON filenames containing unit unused unicode translations.
 * @type {Array.<string>}
 * @const
 * @private
 */
SplitJson.UNUSED_FILES_ = [
  'accented_characters.js', 'currencies_music.js', 'greek_accented.js',
  'private_area.js', 'special_symbols.js'
];


SplitJson.FILES_MAP_ = new Map([
  [SplitJson.SYMBOLS_, SplitJson.SYMBOLS_FILES_],
  [SplitJson.FUNCTIONS_, SplitJson.FUNCTIONS_FILES_],
  [SplitJson.UNITS_, SplitJson.UNITS_FILES_]
]);

//  'units_spanish.js'
// TODO: Sort this similar to the above.
// Localisation
// 'spanish.js', 'spanish_mathfonts.js'
//  'functions_spanish.js'



SplitJson.loadLocale = function(files, path) {
  path = path || '';
  let currentLocale = {};
  for (let file of files) {
    let content = fs.readFileSync(path + file);
    if (content) {
      JSON.parse(content).forEach(function(x) {
        let key = x['key'];
        if (key && key.length === 5 && key[0] === '0') {
          key = key.slice(1);
          x['key'] = key;
        }
        currentLocale[key] = x;
      }); 
    }
  }
  return currentLocale;
};


SplitJson.intoFile = function(src, dest, locale, iso) {
  let content = fs.readFileSync(src);
  if (!content) return;
  let list = JSON.parse(content);
  let result = SplitJson.splitContent(list, locale);
  result.unshift({"locale": iso});
  fs.writeFileSync(dest, JSON.stringify(result, null, 2));
};


SplitJson.splitContent = function(list, locale) {
  let result = [];
  for (let element of list) {
    let key = element['key'];
    let loc = locale[key];
    if (loc) {
      if (element.category) {
        loc.category = element.category;
      }
      if (element.names) {
        loc.names = element.names;
      }
      result.push(loc);
      delete locale[key];
    }
  }
  return result;
};


SplitJson.makePath = function(base, iso, kind) {
  let outputPath = `${base}/${iso}/${kind}/`;
  shell.mkdir('-p', outputPath);
  return outputPath;
};

SplitJson.splitFile = function(kind, files, locale, iso, model) {
  let inputPath = `${SplitJson.PATH_}/${model}/${kind}/`;
  let outputPath = SplitJson.makePath(SplitJson.OUTPUT_PATH_, iso, kind);
  files.forEach(function(x) {
    SplitJson.intoFile(inputPath + x, outputPath + x, locale, iso);
  });
};


SplitJson.splitFiles = function(kind, iso, model) {
  let files = SplitJson.FILES_MAP_.get(kind);
  let locale = SplitJson.loadLocale(
    [`${kind}.json`], `${SplitJson.INPUT_PATH_}/${iso}/`);
  SplitJson.splitFile(kind, files, locale, iso, model);
  let values = [];
  for(var key in locale) {
    values.push(locale[key]);
  }
  console.log(values.length);
  // Here we do the unused ones.
  fs.writeFileSync(`${SplitJson.OUTPUT_PATH_}/rest-${kind}-${iso}.js`,
                   JSON.stringify(values, null, 2));
};




SplitJson.allFiles = function(iso) {
  SplitJson.splitFiles(SplitJson.SYMBOLS_, iso, 'en');
  SplitJson.splitFiles(SplitJson.FUNCTIONS_, iso, 'en');
  SplitJson.splitFiles(SplitJson.UNITS_, iso, 'en');
};


SplitJson.getFromMapping = function(mappings) {
  return (mappings.mathspeak && mappings.mathspeak.default) ?
    mappings.mathspeak.default :
    (mappings.default.short ? mappings.default.short :
     mappings.default.default);
};

SplitJson.localeToTable = function(content, kind) {
  let table = [];
  let header = kind === SplitJson.UNITS_ ?
      SplitJson.HTML_CAPTIONS_.get('unitsen') :
      SplitJson.HTML_CAPTIONS_.get(kind).slice(0, -1);
  table.push(SplitJson.htmlRow(...header).replace(/td/g, 'th'));
  let keys = SplitJson.sortKeys(Object.keys(content));
  for (let key of keys) {
    let mappings = content[key].mappings;
    if (!mappings) {
      console.log('Missing: ' + key);
      continue;
    }
    // TODO: Sort this out for kind!
    let text = SplitJson.getFromMapping(mappings);
    let names = '';
    switch (kind) {
    case 'units':
      names = content[key].names.join(', ');
      let singular = mappings.default.singular || '';
      let dual = mappings.default.dual || '';
      table.push(SplitJson.htmlRow(key, names, text, singular, dual));
      break;
    case 'functions':
      names = content[key].names.join(', ');
      table.push(SplitJson.htmlRow(key, names, text));
      break;
    default:
      table.push(SplitJson.htmlRow(`&#x${key};`, key, text));
    }
  }
  return table;
};

SplitJson.htmlRow = function(...row) {
  return '<tr><td>' + row.join('</td><td>') + '</td></tr';
};

SplitJson.HTML_CAPTIONS_ = new Map([
  [SplitJson.SYMBOLS_, ['Char', 'Unicode', 'English', 'Locale']],
  [SplitJson.FUNCTIONS_, ['Function', 'Alt. Names', 'English', 'Locale']],
  [SplitJson.UNITS_, ['Unit', 'Alt. Names', 'English', 'Plural', 'Singular', 'Dual']],
  ['unitsen', ['Unit', 'Alt. Names', 'Plural', 'Singular', 'Dual']]
]);

SplitJson.compareLocaleToTable = function(english, locale, kind) {
  let table = [];
  table.push(SplitJson.htmlRow(...SplitJson.HTML_CAPTIONS_.get(kind)).replace(/td/g, 'th'));
  let keys = SplitJson.sortKeys(Object.keys(english));
  for (let key of keys) {
    let mappings = english[key].mappings;
    if (!mappings) {
      console.log('Missing: ' + key);
      continue;
    }
    let eng_text = SplitJson.getFromMapping(mappings);
    let loc_map = locale[key];
    let loc_text = '';
    if (loc_map) {
      loc_map = loc_map.mappings;
      loc_text = SplitJson.getFromMapping(loc_map);
    }
    let names = '';
    switch (kind) {
    case 'units':
      names = english[key].names.join(', ');
      let singular = loc_map ? loc_map.default.singular : '';
      let dual = loc_map ? loc_map.default.dual : '';
      table.push(SplitJson.htmlRow(key, names, eng_text, loc_text, singular, dual));
      break;
    case 'functions':
      names = english[key].names.join(', ');
      table.push(SplitJson.htmlRow(key, names, eng_text, loc_text));
      break;
    default:
      table.push(SplitJson.htmlRow(`&#x${key};`, key, eng_text, loc_text));
    }
  }
  return table;
};

SplitJson.tableToHTML = function(file, table, path = '/tmp/') {
  let filename = path + file + '.html';
  let style = '\n<style>\n' +
      'table, th, td {\n' +
      '  border: 1px solid black;' +
      '}\n</style>\n';
  let output = '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML//EN">';
  output += '\n<html><head>';
  output += '\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>';
  output += '\n<title>' + file + '</title>\n';
  output += style;
  output += '\n<body>';
  output += '\n<h2>' + file + '</h2>';
  output += '\n<table>\n';
  output += table.join('\n');
  output += '</body></html>';
  fs.writeFileSync(filename, output);
};

SplitJson.localeToHTML = function(locale = 'en',
                                  kind = SplitJson.SYMBOLS_,
                                  compare = true) {
  let fileList = SplitJson.FILES_MAP_.get(kind);
  let files = [];
  let localeContent = null;
  let path = SplitJson.makePath(SplitJson.HTML_PATH_, locale, kind);
  for (let file of fileList) {
    let content = SplitJson.loadLocale([file], `${SplitJson.PATH_}/${locale}/${kind}/`);
    if (compare) {
      localeContent = SplitJson.loadLocale([file], `${SplitJson.PATH_}/en/${kind}/`);
    }
    let name = file.split('.')[0];
    files.push(name);
    let table = compare ?
        SplitJson.compareLocaleToTable(localeContent, content, kind) :
        SplitJson.localeToTable(content, kind);
    SplitJson.tableToHTML(name, table, path);
  }
  let index = `<html><head><title>${kind}</title></head>`;
  index += '\n<body><ul>';
  for (let file of files) {
    index += '\n<li><a href="' + file + '.html">'  + file + '</a></li>';
  }
  index += '\n</ul></body></html>';
  fs.writeFileSync(`${path}/index.html`, index);
};


SplitJson.toHTML = function(iso = 'en', compare = true) {
  SplitJson.localeToHTML(iso, SplitJson.SYMBOLS_, compare);
  SplitJson.localeToHTML(iso, SplitJson.FUNCTIONS_, compare);
  SplitJson.localeToHTML(iso, SplitJson.UNITS_, compare);
  // SplitJson.localeToHTML(iso, SplitJson.PREFIX_, compare);
};

/************************************************************
/*   Create ods files directly 
/*********************************************/


SplitJson.toOds = function(iso = 'en') {
  console.log('doing it');
  shell.cp('-R', SplitJson.ODS_TEMPLATE_, '/tmp/');
  SplitJson.odsCreate(iso, SplitJson.SYMBOLS_);
  SplitJson.odsCreate(iso, SplitJson.FUNCTIONS_);
  SplitJson.odsCreate(iso, SplitJson.UNITS_);
  // SplitJson.localeToHTML(iso, SplitJson.PREFIX_, compare);
};

SplitJson.odsCreate = function(iso, kind) {
  SplitJson.localeToOds(iso, SplitJson.TEMPLATE_PATH_, kind);
  let outputPath = `${SplitJson.ODS_PATH_}/${iso}/`;
  console.log(outputPath);
  shell.mkdir('-p', outputPath);
  let file = `${kind}-${iso}.ods`;
  shell.cd(SplitJson.TEMPLATE_PATH_);
  shell.exec(`zip -r ../${file} .`);
  shell.mv(`/tmp/${file}`, outputPath);
};


SplitJson.localeToOds = function(locale = 'en',
                                 path = '/tmp/ods',
                                 kind = SplitJson.SYMBOLS_) {
  let tables = [];
  let fileList = SplitJson.FILES_MAP_.get(kind);
  for (let file of fileList) {
    let content = SplitJson.loadLocale([file], `${SplitJson.PATH_}/${locale}/${kind}/`);
    let english = SplitJson.loadLocale([file], `${SplitJson.PATH_}/en/${kind}/`);
    let name = file.split('.')[0];
    tables.push(SplitJson.odsTable(name, english, content, kind));
  }
  SplitJson.odsFile(tables.join(''), path);
};


SplitJson.odsRow = function(...row) {
  let cellStart = '<table:table-cell office:value-type="string" calcext:value-type="string"><text:p>';
  let cellEnd = '</text:p></table:table-cell>';
  return '<table:table-row table:style-name="ro1">' +
    cellStart +
    row.join(cellEnd + cellStart) +
    cellEnd +
    '</table:table-row>';
};


SplitJson.odsTable = function(name, english, locale, kind) {
  let start = `<table:table table:name="${name}" table:style-name="ta1">` +
      '<table:table-column table:style-name="co1"' +
      ' table:number-columns-repeated="3"' +
      ' table:default-cell-style-name="Default"/>';
  let secure = {
    '003C': '&lt;',
    '003E': '&gt;',
    '0026': '&amp;'
  };
  let table = [];
  for (let key in english) {
    let mappings = english[key].mappings;
    if (!mappings) {
      console.log('Missing: ' + key);
      continue;
    }
    // Not sure what that does.
    let eng_text = SplitJson.getFromMapping(mappings);
    let loc_map = locale[key];
    let loc_text = '';
    if (loc_map) {
      loc_map = loc_map.mappings;
      loc_text = SplitJson.getFromMapping(loc_map);
    }
    let names = '';
    let row = '';
    switch (kind) {
    case 'units':
      names = english[key].names.join(', ');
      let singular = loc_map ? loc_map.default.singular : '';
      let dual = loc_map ? loc_map.default.dual : '';
      table.push(SplitJson.odsRow(key, names, eng_text, loc_text, singular, dual));
      break;
    case 'functions':
      names = english[key].names.join(', ');
      table.push(SplitJson.odsRow(key, names, eng_text, loc_text));
      break;
    default:
      table.push(SplitJson.odsRow(
      secure[key] || SplitJson.numberToUnicode(parseInt(key, 16)),
        eng_text, loc_text));
    }
  }
  return start + table.join('') + '</table:table>';
};

SplitJson.odsFile = function(table, path = '/tmp/ods') {
  let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
  content += '<office:document-content' +
    ' xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"' +
    ' xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"' +
    ' xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"' +
    ' xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"' +
    ' xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"' +
    ' xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"' +
    ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
    ' xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    ' xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"' +
    ' xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"' +
    ' xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"' +
    ' xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"' +
    ' xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0"' +
    ' xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0"' +
    ' xmlns:math="http://www.w3.org/1998/Math/MathML"' +
    ' xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0"' +
    ' xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0"' +
    ' xmlns:ooo="http://openoffice.org/2004/office"' +
    ' xmlns:ooow="http://openoffice.org/2004/writer"' +
    ' xmlns:oooc="http://openoffice.org/2004/calc"' +
    ' xmlns:dom="http://www.w3.org/2001/xml-events"' +
    ' xmlns:xforms="http://www.w3.org/2002/xforms"' +
    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
    ' xmlns:rpt="http://openoffice.org/2005/report"' +
    ' xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"' +
    ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' +
    ' xmlns:grddl="http://www.w3.org/2003/g/data-view#"' +
    ' xmlns:tableooo="http://openoffice.org/2009/table"' +
    ' xmlns:drawooo="http://openoffice.org/2010/draw"' +
    ' xmlns:calcext="urn:org:documentfoundation:names:experimental:calc:xmlns:calcext:1.0"' +
    ' xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0"' +
    ' xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0"' +
    ' xmlns:formx="urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0"' +
    ' xmlns:css3t="http://www.w3.org/TR/css3-text/"' +
    ' office:version="1.2"><office:scripts/><office:font-face-decls>' +
    '<style:font-face style:name="Liberation Sans"' +
    ' svg:font-family="&apos;Liberation Sans&apos;"' +
    ' style:font-family-generic="swiss" style:font-pitch="variable"/>' +
    '<style:font-face style:name="AR PL SungtiL GB"' +
    ' svg:font-family="&apos;AR PL SungtiL GB&apos;"' +
    ' style:font-family-generic="system" style:font-pitch="variable"/>' +
    '<style:font-face style:name="DejaVu Sans"' +
    ' svg:font-family="&apos;DejaVu Sans&apos;"' +
    ' style:font-family-generic="system" style:font-pitch="variable"/>' +
    '<style:font-face style:name="Lohit Devanagari"' +
    ' svg:font-family="&apos;Lohit Devanagari&apos;"' +
    ' style:font-family-generic="system" style:font-pitch="variable"/>' +
    '</office:font-face-decls><office:automatic-styles><style:style' +
    ' style:name="co1" style:family="table-column">' +
    '<style:table-column-properties fo:break-before="auto"' +
    ' style:column-width="64.01pt"/></style:style><style:style' +
    ' style:name="co2" style:family="table-column">' +
    '<style:table-column-properties fo:break-before="auto"' +
    ' style:column-width="299.51pt"/></style:style><style:style' +
    ' style:name="co3" style:family="table-column">' +
    '<style:table-column-properties fo:break-before="auto"' +
    ' style:column-width="341.94pt"/></style:style><style:style' +
    ' style:name="co4" style:family="table-column">' +
    '<style:table-column-properties fo:break-before="auto"' +
    ' style:column-width="279.41pt"/></style:style><style:style' +
    ' style:name="ro1" style:family="table-row"><style:table-row-properties' +
    ' style:row-height="12.81pt" fo:break-before="auto"' +
    ' style:use-optimal-row-height="true"/></style:style><style:style' +
    ' style:name="ta1" style:family="table"' +
    ' style:master-page-name="Default"><style:table-properties' +
    ' table:display="true" style:writing-mode="lr-tb"/></style:style>' +
    '</office:automatic-styles><office:body><office:spreadsheet>' +
    '<table:calculation-settings table:automatic-find-labels="false"' +
    ' table:use-regular-expressions="false" table:use-wildcards="true"/>';
  content += table;
  content += '<table:named-expressions/></office:spreadsheet></office:body>' +
    '</office:document-content>';
  fs.writeFileSync(`${path}/content.xml`, content);
};


SplitJson.numberToUnicode = function(number) {
  if (number < 0x10000) {
    return String.fromCharCode(number);
  }
  var hi = (number - 0x10000) / 0x0400 + 0xD800;
  var lo = (number - 0x10000) % 0x0400 + 0xDC00;
  return String.fromCharCode(hi, lo);
};


SplitJson.moveFiles = function(locale) {
  let wwwLocale = SplitJson.WWW_BASE_PATH + '/localisation/' + locale + '/';
  shell.mkdir('-p', wwwLocale + 'sheets/');
  shell.cp('-f', SplitJson.ODS_PATH_ + '/' + locale + '/*.ods', wwwLocale + 'sheets/');
  shell.cp('-Rf', SplitJson.HTML_PATH_ + '/' + locale + '/*', wwwLocale);
};


SplitJson.sortKeys = function(keys) {
  let closure = function(x, y) {
    let xn = parseInt(x, 16);
    let yn = parseInt(y, 16);
    if (isNaN(xn)) {
      return 1;
    }
    if (isNaN(yn)) {
      return -1;
    }
    if (xn < yn) {
      return -1;
    }
    if (xn > yn) {
      return 1;
    }
    return 0;
  };
  return keys.sort(closure);
};

// SplitJson.defaultFiles = function() {
//   SplitJson.allFiles(SplitJson.SYMBOLS_FILES_, SplitJson.FUNCTIONS_FILES_)
// };

module.exports = SplitJson;

// SplitJson.splitFiles(SplitJson.SYMBOLS_PATH_,
//                       SplitJson.SYMBOLS_FILES_, french, 'fr', 'symbols');
// where french contained the locale.
// TODO: make an outer directory of the iso locale.


// Missing maths fonts:
// latin:
// bold-italic: seq 0x1d468 0x1d49b | while read n; do printf "%04X\n" $n; done > /tmp/latin-mathfonts-bold-italic
// sans-serif bold italic: seq 0X1D63C 0X1D66F | while read n; do printf "%04X\n" $n; done > /tmp/latin-mathfonts-sans-serif-bold-italic
//
// greek:
// Bold Italic : seq 0X1D71C 0X1D755 | while read n; do printf "%04X\n" $n; done > /tmp/greek-mathfonts-bold-italic
// sans-serif bold italic: seq 0X1D790 0X1D7C9 | while read n; do printf "%04X\n" $n; done > /tmp/greek-mathfonts-sans-serif-bold-italic
//
// cp latin-mathfonts-bold-script.js latin-mathfonts-bold-italic.js
// cp latin-mathfonts-sans-serif-bold.js latin-mathfonts-sans-serif-bold-italic.js
// 
// cp greek-mathfonts-bold.js greek-mathfonts-bold-italic.js
// cp greek-mathfonts-sans-serif-bold.js greek-mathfonts-sans-serif-bold-italic.js
//
