/*
 * Copyright (c) 2012 Frank Hellwig
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

//-----------------------------------------------------------------------------
// This module provides an interface to the JSON Schema Validator (JSV).
//-----------------------------------------------------------------------------

var os = require('os');
var util = require('util');
var JSV = require('JSV').JSV;

var env = JSV.createEnvironment();

/**
 * Validates the specified instance against the specified schema.
 */
function validate(instance, schema) {
    var report = env.validate(instance, schema);
    if (report.errors.length > 0) {
        throw error('Schema validation failed.', report.errors);
    }
    return instance;
}

exports.validate = validate;

/**
 * Checks that the specified schema is valid.
 */
function check(schema) {
    var jsonSchema = env.getDefaultSchema();
    var report = env.validate(schema, jsonSchema);
    if (report.errors.length > 0) {
        throw error('Invalid JSON schema.', report.errors);
    }
}

exports.check = check;

//-----------------------------------------------------------------------------
// Functions for creating a validation error from a list of JSV errors.
//-----------------------------------------------------------------------------

/**
 * Creates a new error that has an initial message followed by an EOL and a
 * list of JSV errors, each separated by an EOL.
 */
function error(message, errors) {
    var messages = [message];
    errors.forEach(function (error) {
        messages.push(errorMessage(error));
    });
    var err = new Error(messages.join(os.EOL));
    err.name = 'ValidationError';
    return err;
}

/**
 * Converts a JSV error object into an error message.  (This function is called
 * by the ValidationError constructor when creating the error messages from a
 * JSV error object array.)
 */
function errorMessage(error) {
    var message = [];
    message.push(error.message);
    var type = typeof error.details;
    if (type === 'string' || type === 'number' || type === 'object') {
        message.push(util.format(' (%s)', error.details));
    }
    var name = propertyName(error.uri);
    if (name) {
        message.push(util.format(': %s', name));
    }
    return message.join('');
}

/**
 * Returns the property name from the specified URI.  (This function is called
 * from the errorMessage function when creating an error message from a JSV
 * error object.)
 */
function propertyName(uri) {
    // Get the fragment from the URI.
    var fragment = uri.substring(uri.indexOf('#') + 1);
    // Convert "/foo/bar". to ["", "foo", "bar"].
    var path = fragment.split('/');
    // Convert ["", "foo", "bar"] to ["foo", "bar"].
    path.shift();
    // Convert ["foo", "bar"] to "foo.bar".
    var name = path.join('.');
    return decodeURI(name);
}
