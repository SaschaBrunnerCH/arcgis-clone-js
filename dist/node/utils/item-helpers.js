"use strict";
/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var object_helpers_1 = require("../utils/object-helpers");
var is_guid_1 = require("../utils/is-guid");
/**
 * Does the model have a specific typeKeyword?
 */
function hasTypeKeyword(model, keyword) {
    var typeKeywords = object_helpers_1.getProp(model, 'item.typeKeywords') || model.typeKeywords || [];
    return typeKeywords.includes(keyword);
}
exports.hasTypeKeyword = hasTypeKeyword;
;
/**
 * Does the model have any of a set of keywords
 */
function hasAnyKeyword(model, keywords) {
    var typeKeywords = object_helpers_1.getProp(model, 'item.typeKeywords') || model.typeKeywords || [];
    return keywords.reduce(function (a, kw) {
        if (!a) {
            a = typeKeywords.includes(kw);
        }
        return a;
    }, false);
}
exports.hasAnyKeyword = hasAnyKeyword;
;
/**
 * Given the url of a webapp, parse our the id from the url
 */
function parseIdFromUrl(url) {
    var id = null;
    if (!url) {
        return id;
    }
    var qs = url.split('?')[1];
    if (qs) {
        id = qs.split('&').reduce(function (a, p) {
            var part = p.split('=')[1];
            if (part && is_guid_1.default(part)) {
                a = part;
            }
            return a;
        }, null);
    }
    return id;
}
exports.parseIdFromUrl = parseIdFromUrl;
;
/**
 * Return a random number, prefixed with a string. Used for unique identifiers that do not require
 * the rigor of a full UUID - i.e. node id's, process ids etc.
 * @param prefix String to prefix the random number with so the result is a valid javascript property
 */
function createId(prefix) {
    if (prefix === void 0) { prefix = "i"; }
    // prepend some char so it's always a valid dotable property name
    // get a random number, convert to base 36 representation, then grab chars 2-8
    return "" + prefix + Math.random()
        .toString(36)
        .substr(2, 8);
}
exports.createId = createId;
//# sourceMappingURL=item-helpers.js.map