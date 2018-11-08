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
 | See the License for the specific language governing permissions andn
 | limitations under the License.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../src/viewing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var viewing = require("../src/viewing");
    //--------------------------------------------------------------------------------------------------------------------//
    describe("Module `viewing`: supporting solution item display in AGOL", function () {
        describe("get item hierarchies", function () {
            var MOCK_ITEM_PROTOTYPE = {
                type: "",
                item: {}
            };
            it("item without dependencies", function () {
                // hierarchy:
                // - abc
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var expected = [{
                        id: "abc",
                        dependencies: []
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc
                });
                expect(results).toEqual(expected);
            });
            it("item with empty list of dependencies", function () {
                // hierarchy:
                // - abc
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                abc.dependencies = [];
                var expected = [{
                        id: "abc",
                        dependencies: []
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc
                });
                expect(results).toEqual(expected);
            });
            it("item with single dependency", function () {
                // hierarchy:
                // - abc
                //   - def
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.item.id = "def";
                abc.dependencies = ["def"];
                var expected = [{
                        id: "abc",
                        dependencies: [{
                                id: "def",
                                dependencies: []
                            }]
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc,
                    "def": def
                });
                expect(results).toEqual(expected);
            });
            it("item with two dependencies", function () {
                // hierarchy:
                // - abc
                //   - def
                //   - ghi
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.item.id = "def";
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                ghi.item.id = "ghi";
                abc.dependencies = ["def", "ghi"];
                var expected = [{
                        id: "abc",
                        dependencies: [{
                                id: "def",
                                dependencies: []
                            }, {
                                id: "ghi",
                                dependencies: []
                            }]
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi
                });
                expect(results).toEqual(expected);
            });
            it("item with two-level dependencies", function () {
                // hierarchy:
                // - abc
                //   - ghi
                //     - def
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.item.id = "def";
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                ghi.item.id = "ghi";
                abc.dependencies = ["ghi"];
                ghi.dependencies = ["def"];
                var expected = [{
                        id: "abc",
                        dependencies: [{
                                id: "ghi",
                                dependencies: [{
                                        id: "def",
                                        dependencies: []
                                    }]
                            }]
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi
                });
                expect(results).toEqual(expected);
            });
            it("two top-level items, one with two dependencies", function () {
                // hierarchy:
                // - abc
                // - jkl
                //   - ghi
                //   - def
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.item.id = "def";
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                ghi.item.id = "ghi";
                var jkl = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                jkl.item.id = "jkl";
                jkl.dependencies = ["ghi", "def"];
                var expected = [{
                        id: "abc",
                        dependencies: []
                    }, {
                        id: "jkl",
                        dependencies: [{
                                id: "ghi",
                                dependencies: []
                            }, {
                                id: "def",
                                dependencies: []
                            }]
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                    "jkl": jkl
                });
                expect(results).toEqual(expected);
            });
            it("two top-level items with the same two dependencies", function () {
                // hierarchy:
                // - abc
                //   - def
                //   - ghi
                // - jkl
                //   - ghi
                //   - def
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.item.id = "def";
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                ghi.item.id = "ghi";
                var jkl = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                jkl.item.id = "jkl";
                abc.dependencies = ["def", "ghi"];
                jkl.dependencies = ["ghi", "def"];
                var expected = [{
                        id: "abc",
                        dependencies: [{
                                id: "def",
                                dependencies: []
                            }, {
                                id: "ghi",
                                dependencies: []
                            }]
                    }, {
                        id: "jkl",
                        dependencies: [{
                                id: "ghi",
                                dependencies: []
                            }, {
                                id: "def",
                                dependencies: []
                            }]
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                    "jkl": jkl
                });
                expect(results).toEqual(expected);
            });
            it("three top-level items, one with two dependencies, one with three-level dependencies", function () {
                // hierarchy:
                // - def
                //   - mno
                //     - abc
                // - jkl
                // - pqr
                //   - ghi
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.item.id = "def";
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                ghi.item.id = "ghi";
                var jkl = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                jkl.item.id = "jkl";
                var mno = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                mno.item.id = "mno";
                var pqr = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                pqr.item.id = "pqr";
                pqr.dependencies = ["ghi"];
                mno.dependencies = ["abc"];
                def.dependencies = ["mno"];
                var expected = [{
                        id: "def",
                        dependencies: [{
                                id: "mno",
                                dependencies: [{
                                        id: "abc",
                                        dependencies: []
                                    }]
                            }]
                    }, {
                        id: "jkl",
                        dependencies: []
                    }, {
                        id: "pqr",
                        dependencies: [{
                                id: "ghi",
                                dependencies: []
                            }]
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                    "jkl": jkl,
                    "mno": mno,
                    "pqr": pqr
                });
                expect(results).toEqual(expected);
            });
            it("only top-level items--no dependencies", function () {
                // hierarchy:
                // - abc
                // - jkl
                // - ghi
                // - def
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.item.id = "abc";
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.item.id = "def";
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                ghi.item.id = "ghi";
                var jkl = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                jkl.item.id = "jkl";
                var expected = [{
                        id: "abc",
                        dependencies: []
                    }, {
                        id: "def",
                        dependencies: []
                    }, {
                        id: "ghi",
                        dependencies: []
                    }, {
                        id: "jkl",
                        dependencies: []
                    }];
                var results = viewing.getItemHierarchy({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                    "jkl": jkl
                });
                expect(results).toEqual(expected);
            });
        });
    });
});
//# sourceMappingURL=viewing.test.js.map