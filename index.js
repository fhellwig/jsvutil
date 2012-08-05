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

var jsv = require('./lib/jsv.js');

//-----------------------------------------------------------------------------
// PUBLIC
//-----------------------------------------------------------------------------

/**
 * Validates the specified instance against the specified schema. Note that
 * the instance is first copied using JSON.stringify so that applying default
 * values does not change the parameter, only the return (or callback) value.
 */
function validate(instance, schema, cb) {
    if (typeof cb === 'function') {
        try {
            return cb(null, validate(instance, schema));
        } catch (err) {
            return cb(err);
        }
    }
    if (typeof instance === 'object') {
        instance = JSON.stringify(instance); // copy
    } else if (typeof instance !== 'string') {
        throw new TypeError('Instance must be a string, object, or array.');
    }
    instance = JSON.parse(instance);
    if (typeof schema === 'string') {
        schema = JSON.parse(schema);
    } else if (typeof schema !== 'object') {
        throw new TypeError('Schema must be a string, object, or array.');
    }
    applyDefaultValues(instance, schema.properties);
    jsv.validate(instance, schema);
    return instance;
}

exports.validate = validate;

/**
 * Checks that the specified schema is valid.
 */
function check(schema, cb) {
    if (typeof cb === 'function') {
        try {
            return cb(null, check(schema));
        } catch (err) {
            return cb(err);
        }
    }
    if (typeof schema === 'string') {
        schema = JSON.parse(schema);
    } else if (typeof schema !== 'object') {
        throw new TypeError('Schema must be a string, object, or array.');
    }
    jsv.check(schema);
    return schema;
}

exports.check = check;

//-----------------------------------------------------------------------------
// PRIVATE
//-----------------------------------------------------------------------------

/**
 * Recursively populates the instance with the default values from the
 * properties. This function does not return anything since it modifies
 * the instance argument.
 */
function applyDefaultValues(instance, properties) {
    if (typeof instance === 'object' && typeof properties === 'object') {
        Object.keys(properties).forEach(function (name) {
            var schema = properties[name];
            if (typeof instance[name] === 'undefined') {
                var value = schema['default']
                if (typeof value !== 'undefined') {
                    instance[name] = value;
                }
            }
            applyDefaultValues(instance[name], schema.properties);
        });
    }
}
