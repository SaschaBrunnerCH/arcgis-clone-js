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
        define(["require", "exports", "@esri/arcgis-rest-auth", "../src/viewing", "./lib/utils", "fetch-mock", "./mocks/agolItems", "./mocks/templates", "./lib/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
    var mViewing = require("../src/viewing");
    var utils_1 = require("./lib/utils");
    var fetchMock = require("fetch-mock");
    var mockItems = require("./mocks/agolItems");
    var mockSolutions = require("./mocks/templates");
    var mockUtils = require("./lib/utils");
    // -------------------------------------------------------------------------------------------------------------------//
    describe("Module `viewing`: supporting solution item display in AGOL", function () {
        var MOCK_ITEM_PROTOTYPE = {
            itemId: "",
            type: "",
            key: "",
            item: null
        };
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms
        // Set up a UserSession to use in all these tests
        var MOCK_USER_SESSION = new arcgis_rest_auth_1.UserSession({
            clientId: "clientId",
            redirectUri: "https://example-app.com/redirect-uri",
            token: "fake-token",
            tokenExpires: utils_1.TOMORROW,
            refreshToken: "refreshToken",
            refreshTokenExpires: utils_1.TOMORROW,
            refreshTokenTTL: 1440,
            username: "casey",
            password: "123456",
            portal: "https://myorg.maps.arcgis.com/sharing/rest"
        });
        var MOCK_USER_REQOPTS = {
            authentication: MOCK_USER_SESSION
        };
        afterEach(function () {
            fetchMock.restore();
        });
        describe("get item hierarchies", function () {
            it("item without dependencies", function () {
                // hierarchy:
                // - abc
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc" });
                var expected = [{
                        id: "abc",
                        dependencies: []
                    }];
                var results = mViewing.getItemHierarchy([abc]);
                expect(results).toEqual(expected);
            });
            it("item with empty list of dependencies", function () {
                // hierarchy:
                // - abc
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: [] });
                var expected = [{
                        id: "abc",
                        dependencies: []
                    }];
                var results = mViewing.getItemHierarchy([abc]);
                expect(results).toEqual(expected);
            });
            it("item with single dependency", function () {
                // hierarchy:
                // - abc
                //   - def
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["def"] });
                var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
                var expected = [{
                        id: "abc",
                        dependencies: [{
                                id: "def",
                                dependencies: []
                            }]
                    }];
                var results = mViewing.getItemHierarchy([abc, def]);
                expect(results).toEqual(expected);
            });
            it("item with two dependencies", function () {
                // hierarchy:
                // - abc
                //   - def
                //   - ghi
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["def", "ghi"] });
                var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
                var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
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
                var results = mViewing.getItemHierarchy([abc, def, ghi]);
                expect(results).toEqual(expected);
            });
            it("item with two-level dependencies", function () {
                // hierarchy:
                // - abc
                //   - ghi
                //     - def
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["ghi"] });
                var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
                var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi", dependencies: ["def"] });
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
                var results = mViewing.getItemHierarchy([abc, def, ghi]);
                expect(results).toEqual(expected);
            });
            it("two top-level items, one with two dependencies", function () {
                // hierarchy:
                // - abc
                // - jkl
                //   - ghi
                //   - def
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc" });
                var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
                var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
                var jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "jkl", dependencies: ["ghi", "def"] });
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
                var results = mViewing.getItemHierarchy([abc, def, ghi, jkl]);
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
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["def", "ghi"] });
                var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
                var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
                var jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "jkl", dependencies: ["ghi", "def"] });
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
                var results = mViewing.getItemHierarchy([abc, def, ghi, jkl]);
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
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc" });
                var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def", dependencies: ["mno"] });
                var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
                var jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "jkl" });
                var mno = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "mno", dependencies: ["abc"] });
                var pqr = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "pqr", dependencies: ["ghi"] });
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
                var results = mViewing.getItemHierarchy([abc, def, ghi, jkl, mno, pqr]);
                expect(results).toEqual(expected);
            });
            it("only top-level items--no dependencies", function () {
                // hierarchy:
                // - abc
                // - jkl
                // - ghi
                // - def
                var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc" });
                var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
                var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
                var jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "jkl" });
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
                var results = mViewing.getItemHierarchy([abc, def, ghi, jkl]);
                expect(results).toEqual(expected);
            });
        });
        describe("create deployed solution item", function () {
            it("should create a deployed solution item in the default folder and with default access", function (done) {
                var title = "Solution item";
                var deployedSolution = mockSolutions.getWebMappingApplicationTemplate();
                var solutionItem = mockItems.getSolutionItem();
                fetchMock
                    .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"sol1234567890","folder":null}')
                    .post("path:/sharing/rest/content/users/casey/items/sol1234567890/update", '{"success":true,"id":"sol1234567890"}');
                mViewing.createDeployedSolutionItem(title, deployedSolution, solutionItem, MOCK_USER_REQOPTS)
                    .then(function (result) {
                    expect(result.id).toEqual("sol1234567890");
                    expect(result.url).toEqual("https://www.arcgis.com/home/item.html?id=sol1234567890");
                    done();
                }, function (error) { return done.fail(error); });
            });
            it("should create a deployed solution item using a specified folder and public access", function (done) {
                var title = "Solution item";
                var deployedSolution = mockSolutions.getWebMappingApplicationTemplate();
                var solutionItem = mockItems.getSolutionItem();
                var folderId = "fld1234567890";
                var settings = utils_1.createMockSettings(undefined, folderId);
                fetchMock
                    .post("path:/sharing/rest/content/users/casey/createFolder", '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
                    .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem", '{"success":true,"id":"sol1234567890","folder":"fld1234567890"}')
                    .post("path:/sharing/rest/content/users/casey/items/sol1234567890/update", '{"success":true,"id":"sol1234567890"}')
                    .post("path:/sharing/rest/content/users/casey/items/sol1234567890/share", '{"notSharedWith":[],"itemId":"sol1234567890"}');
                mViewing.createDeployedSolutionItem(title, deployedSolution, solutionItem, MOCK_USER_REQOPTS, settings, "public")
                    .then(function (result) {
                    expect(result.id).toEqual("sol1234567890");
                    expect(result.url).toEqual("https://myOrg.maps.arcgis.com/home/item.html?id=sol1234567890");
                    done();
                }, function (error) { return done.fail(error); });
            });
            it("should handle failure to create a deployed solution item", function (done) {
                var title = "Solution item";
                var deployedSolution = mockSolutions.getWebMappingApplicationTemplate();
                var solutionItem = mockItems.getSolutionItem();
                fetchMock
                    .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get400Failure());
                mViewing.createDeployedSolutionItem(title, deployedSolution, solutionItem, MOCK_USER_REQOPTS)
                    .then(function () { return done.fail(); }, function (error) {
                    expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                    done();
                });
            });
            it("should handle failure to update the URL after creating a deployed solution item", function (done) {
                var title = "Solution item";
                var deployedSolution = mockSolutions.getWebMappingApplicationTemplate();
                var solutionItem = mockItems.getSolutionItem();
                fetchMock
                    .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"sol1234567890","folder":null}')
                    .post("path:/sharing/rest/content/users/casey/items/sol1234567890/update", mockItems.get400Failure());
                mViewing.createDeployedSolutionItem(title, deployedSolution, solutionItem, MOCK_USER_REQOPTS)
                    .then(function () { return done.fail(); }, function (error) {
                    expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=viewing.test.js.map