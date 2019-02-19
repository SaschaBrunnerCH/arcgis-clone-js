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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../src/utils/item-helpers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var item_helpers_1 = require("../../src/utils/item-helpers");
    describe('item-helpers', function () {
        describe('hasKeyword', function () {
            it('accepts a model', function () {
                var m = {
                    item: {
                        typeKeywords: ['foo', 'bar']
                    }
                };
                expect(item_helpers_1.hasTypeKeyword(m, 'foo')).toBeTruthy();
                expect(item_helpers_1.hasTypeKeyword(m, 'not-present')).toBeFalsy();
            });
            it('accepts an item', function () {
                var i = {
                    typeKeywords: ['foo', 'bar']
                };
                expect(item_helpers_1.hasTypeKeyword(i, 'foo')).toBeTruthy();
                expect(item_helpers_1.hasTypeKeyword(i, 'not-present')).toBeFalsy();
            });
            it('works if typeKeywords is undefined', function () {
                var i = {
                    notTypeKeywords: ['foo', 'bar']
                };
                expect(item_helpers_1.hasTypeKeyword(i, 'foo')).toBeFalsy();
                expect(item_helpers_1.hasTypeKeyword(i, 'not-present')).toBeFalsy();
            });
        });
        describe('hasAnyKeyword', function () {
            it('accepts a model', function () {
                var m = {
                    item: {
                        typeKeywords: ['foo', 'bar']
                    }
                };
                expect(item_helpers_1.hasAnyKeyword(m, ['bar'])).toBeTruthy();
                expect(item_helpers_1.hasAnyKeyword(m, ['not-present'])).toBeFalsy();
            });
            it('accepts an item', function () {
                var i = {
                    typeKeywords: ['foo', 'bar']
                };
                expect(item_helpers_1.hasAnyKeyword(i, ['foo', 'bar'])).toBeTruthy();
                expect(item_helpers_1.hasAnyKeyword(i, ['not-present'])).toBeFalsy();
            });
            it('works if typeKeywords is undefined', function () {
                var i = {
                    notTypeKeywords: ['foo', 'bar']
                };
                expect(item_helpers_1.hasAnyKeyword(i, ['foo', 'bar'])).toBeFalsy();
                expect(item_helpers_1.hasAnyKeyword(i, ['not-present'])).toBeFalsy();
            });
        });
        describe('createId', function () {
            it("should accept custom prefix character", function () {
                expect(item_helpers_1.createId("x").substr(0, 1)).toEqual("x");
            });
        });
        describe('parseIdFromUrl', function () {
            it('works for common types', function () {
                var examples = [
                    {
                        url: 'https://www.arcgis.com/home/webscene/viewer.html?webscene=91b46c2b162c48dba264b2190e1dbcff&ui=min',
                        expected: '91b46c2b162c48dba264b2190e1dbcff'
                    },
                    {
                        url: 'https://www.arcgis.com/home/webscene/viewer.html?webmap=81b46c2b162c48dba264b2190e1dbcff&ui=min',
                        expected: '81b46c2b162c48dba264b2190e1dbcff'
                    },
                    {
                        url: 'https://www.arcgis.com/home/webscene/viewer.html?webmap=notaguid&ui=min',
                        expected: null
                    },
                    {
                        url: 'https://www.arcgis.com/home/webscene/viewer.html',
                        expected: null
                    },
                    {
                        url: null,
                        expected: null
                    }
                ];
                examples.forEach(function (ex) {
                    var r = item_helpers_1.parseIdFromUrl(ex.url);
                    expect(r).toEqual(ex.expected);
                });
            });
        });
    });
});
//# sourceMappingURL=item-helpers.test.js.map