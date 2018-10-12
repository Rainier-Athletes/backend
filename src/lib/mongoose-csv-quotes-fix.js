/*
* this file is index.js from https://github.com/steenhansen/mongooseToCsv
* TW had to patch it with one line (see commented line below)
*/
/**
 * Module Dependencies
 */
/* eslint-disable */
var CsvBuilder = require('csv-builder');

function new_normalizeArray_(data_row) {
  console.log('new_normalizeArray_ data_row', data_row);
  var csved_row = data_row.map(column_data => {
    column_data = column_data || ''; // <<<<< TW added this line. was blowing up on null values
    text_data = column_data.toString();
    if (this.format.delimiter==='\t'){
      text_data = text_data.replace(/\t/g, '');
    } else if (this.format.delimiter===','){
      if (text_data.includes(',') || text_data.includes('\n') || text_data.includes('"')){
        if (text_data.includes('"')){
          text_data = text_data.replace(/"/g, '""');
        }
        text_data = `"${text_data}"`;
      }
    }
    return text_data;
  });
  return csved_row
}

// If options.show_headers == false OR undefined then do not return header names in output
function forgetHeader_(){
  return '';
}

/**
 * Create csv streams from a mongoose schema
 * @param {mongoose.Schema} schema
 * @param {Object} options CsvBuilder options
 * @param {String|Array} options.headers Space separated headers, or array of headers
 * @param {String} [options.delimiter = ','] Value delimiter for csv data
 * @param {String} [options.terminator = '\n'] Line terminator for csv data
 * @param {Object} options.constraints {"header": "prop"}
 * @param {Object} options.virtuals Virtual properties.
 */

 module.exports = function mongooseToCsv(schema, options) {
  // need options.headers
  if (!options.headers) throw new Error('MongooseToCsv requires the `headers` option');
  var builder = new CsvBuilder(options);
  builder._normalizeArray = new_normalizeArray_;

  if (typeof options.show_headers ==='undefined' || !options.show_headers) {
    builder.getHeaders = forgetHeader_;  
  }

  if (options.virtuals) {
    for (var v in options.virtuals) {
      builder.virtual(v, options.virtuals[v]);
    }
  }

  /**
   * Static Method `csvReadStream`
   * @param {Array<Documents>} docs Array of mongoose documents
   * @return {Stream} Csv read stream.
   */

   schema.static('csvReadStream', function(docs) {
    if (!docs) {
      throw new Error('[Model].csvReadStream requires an array of documents.');
    }
    var data = docs.map(function(obj) {
      return obj._doc;
    });
    return builder.createReadStream(data);
  });

  /**
   * Create a Csv stream from a query Object.
   * @param {Object} query Mongoose query
   * @return {Stream} Csv transform stream
   */

   schema.static('findAndStreamCsv', function(query) {
    query = query || {};

    return this.find(query).cursor().pipe(builder.createTransformStream());
  });

  /**
   * Create a transform stream
   * @return {Stream} transform stream
   */

   schema.static('csvTransformStream', function() {
    return builder.createTransformStream();
  });
 };
