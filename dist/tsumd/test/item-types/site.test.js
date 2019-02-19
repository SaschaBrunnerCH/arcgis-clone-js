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
        define(["require", "exports", "../../src/itemTypes/site"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var site_1 = require("../../src/itemTypes/site");
    var testLayoutWithAllSupportedCards = {
        sections: [
            {
                rows: [
                    {
                        cards: [
                            {
                                component: {
                                    name: 'chart-card',
                                    settings: {
                                        itemId: 'cc1'
                                    }
                                }
                            },
                            {
                                component: {
                                    name: 'summary-statistic-card',
                                    settings: {
                                        itemId: 'cc2'
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                rows: [
                    {
                        cards: [
                            {
                                component: {
                                    name: 'webmap-card',
                                    settings: {
                                        webmap: 'cc3'
                                    }
                                }
                            },
                            {
                                component: {
                                    name: 'items/gallery-card',
                                    settings: {
                                        ids: [
                                            '0ee0b0a435db49969bbd93a7064a321c',
                                            'eb173fb9d0084c4bbd19b40ee186965f',
                                            'e8201f104dca4d8d87cb4ce1c7367257',
                                            '5a14dbb7b2f3417fb4a6ea0506c2eb26'
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    };
    describe('Site Item Utilities', function () {
        describe('getDependencies', function () {
            it('should not fail with a null layout', function (done) {
                return site_1.getDependencies({})
                    .then(function (result) {
                    expect(result).not.toBeNull('should return something');
                    expect(Array.isArray(result)).toBeTruthy('should return an array');
                    expect(result.length).toEqual(0, 'should return an empty array');
                    done();
                });
            });
            it('should extract dependencies from the layout', function (done) {
                var siteModel = {
                    item: {},
                    data: {
                        values: {
                            layout: testLayoutWithAllSupportedCards
                        }
                    }
                };
                return site_1.getDependencies(siteModel)
                    .then(function (r) {
                    expect(r).toBeTruthy('should return a value');
                    expect(Array.isArray(r)).toBeTruthy('should be an array');
                    expect(r.length).toEqual(7, 'should have 7 entries');
                    expect(r).toEqual([
                        'cc1',
                        'cc2',
                        'cc3',
                        '0ee0b0a435db49969bbd93a7064a321c',
                        'eb173fb9d0084c4bbd19b40ee186965f',
                        'e8201f104dca4d8d87cb4ce1c7367257',
                        '5a14dbb7b2f3417fb4a6ea0506c2eb26'
                    ], 'should return them');
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=site.test.js.map