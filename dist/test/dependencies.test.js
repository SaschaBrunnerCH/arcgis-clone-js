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
        define(["require", "exports", "tslib", "fetch-mock", "../src/dependencies", "@esri/arcgis-rest-auth", "./lib/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var fetchMock = require("fetch-mock");
    var dependencies = require("../src/dependencies");
    var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
    var utils_1 = require("./lib/utils");
    //--------------------------------------------------------------------------------------------------------------------//
    describe("Module `dependencies`: managing dependencies of an item", function () {
        var MOCK_ITEM_PROTOTYPE = {
            type: "",
            item: {}
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
        describe("supporting routine: removing duplicates", function () {
            it("empty array", function () {
                var sourceArray = [];
                var expected = [];
                var results = dependencies.removeDuplicates(sourceArray);
                expect(results).toEqual(expected);
            });
            it("no duplicates", function () {
                var sourceArray = ["a", "b", "c", "d"];
                var expected = ["a", "b", "c", "d"];
                var results = dependencies.removeDuplicates(sourceArray);
                expect(results).toEqual(expected);
            });
            it("some duplicates", function () {
                var sourceArray = ["c", "a", "b", "b", "c", "d"];
                var expected = ["c", "a", "b", "d"];
                var results = dependencies.removeDuplicates(sourceArray);
                expect(results).toEqual(expected);
            });
        });
        describe("supporting routine: fetching group contents", function () {
            var firstGroupTrancheUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=0&num=3&token=fake-token";
            var secondGroupTrancheUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=3&num=3&token=fake-token";
            var thirdGroupTrancheUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=6&num=3&token=fake-token";
            it("fewer items than fetch batch size", function (done) {
                var pagingRequest = tslib_1.__assign({ paging: { start: 0, num: 3 } }, MOCK_USER_REQOPTS);
                fetchMock
                    .mock(firstGroupTrancheUrl, '{"total":1,"start":1,"num":1,"nextStart":-1,"items":[{"id":"a1"}]}', {});
                var expected = ["a1"];
                dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
                    .then(function (response) {
                    expect(response).toEqual(expected);
                    var calls = fetchMock.calls(firstGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(firstGroupTrancheUrl);
                    done();
                });
            });
            it("same number of items as fetch batch size", function (done) {
                var pagingRequest = tslib_1.__assign({ paging: { start: 0, num: 3 } }, MOCK_USER_REQOPTS);
                fetchMock
                    .mock(firstGroupTrancheUrl, '{"total":3,"start":1,"num":3,"nextStart":-1,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {});
                var expected = ["a1", "a2", "a3"];
                dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
                    .then(function (response) {
                    expect(response).toEqual(expected);
                    var calls = fetchMock.calls(firstGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(firstGroupTrancheUrl);
                    done();
                });
            });
            it("one more item than fetch batch size", function (done) {
                var pagingRequest = tslib_1.__assign({ paging: { start: 0, num: 3 } }, MOCK_USER_REQOPTS);
                fetchMock
                    .mock(firstGroupTrancheUrl, '{"total":4,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
                    .mock(secondGroupTrancheUrl, '{"total":4,"start":3,"num":1,"nextStart":-1,"items":[{"id":"a4"}]}', {});
                var expected = ["a1", "a2", "a3", "a4"];
                dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
                    .then(function (response) {
                    expect(response).toEqual(expected);
                    var calls = fetchMock.calls(firstGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(firstGroupTrancheUrl);
                    calls = fetchMock.calls(secondGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(secondGroupTrancheUrl);
                    done();
                });
            });
            it("twice the number of items as fetch batch size", function (done) {
                var pagingRequest = tslib_1.__assign({ paging: { start: 0, num: 3 } }, MOCK_USER_REQOPTS);
                fetchMock
                    .mock(firstGroupTrancheUrl, '{"total":6,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
                    .mock(secondGroupTrancheUrl, '{"total":6,"start":3,"num":3,"nextStart":-1,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {});
                var expected = ["a1", "a2", "a3", "a4", "a5", "a6"];
                dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
                    .then(function (response) {
                    expect(response).toEqual(expected);
                    var calls = fetchMock.calls(firstGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(firstGroupTrancheUrl);
                    calls = fetchMock.calls(secondGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(secondGroupTrancheUrl);
                    done();
                });
            });
            it("one more item than twice the number of items as fetch batch size", function (done) {
                var pagingRequest = tslib_1.__assign({ paging: { start: 0, num: 3 } }, MOCK_USER_REQOPTS);
                fetchMock
                    .mock(firstGroupTrancheUrl, '{"total":7,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
                    .mock(secondGroupTrancheUrl, '{"total":7,"start":3,"num":3,"nextStart":6,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {})
                    .mock(thirdGroupTrancheUrl, '{"total":7,"start":6,"num":1,"nextStart":-1,"items":[{"id":"a7"}]}', {});
                var expected = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];
                dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
                    .then(function (response) {
                    expect(response).toEqual(expected);
                    var calls = fetchMock.calls(firstGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(firstGroupTrancheUrl);
                    calls = fetchMock.calls(secondGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(secondGroupTrancheUrl);
                    calls = fetchMock.calls(thirdGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(thirdGroupTrancheUrl);
                    done();
                });
            });
            it("thrice the number of items as fetch batch size", function (done) {
                var pagingRequest = tslib_1.__assign({ paging: { start: 0, num: 3 } }, MOCK_USER_REQOPTS);
                fetchMock
                    .mock(firstGroupTrancheUrl, '{"total":9,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
                    .mock(secondGroupTrancheUrl, '{"total":9,"start":3,"num":3,"nextStart":6,"items":[{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {})
                    .mock(thirdGroupTrancheUrl, '{"total":9,"start":6,"num":3,"nextStart":-1,"items":[{"id":"a7"},{"id":"a8"},{"id":"a9"}]}', {});
                var expected = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"];
                dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
                    .then(function (response) {
                    expect(response).toEqual(expected);
                    var calls = fetchMock.calls(firstGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(firstGroupTrancheUrl);
                    calls = fetchMock.calls(secondGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(secondGroupTrancheUrl);
                    calls = fetchMock.calls(thirdGroupTrancheUrl); // => [string, fetchMock.MockRequest][]
                    expect(calls.length === 1);
                    expect(calls[0][0]).toEqual(thirdGroupTrancheUrl);
                    done();
                });
            });
            it("group with error", function (done) {
                var pagingRequest = tslib_1.__assign({ paging: { start: 0, num: 3 } }, MOCK_USER_REQOPTS);
                var expected = "Group does not exist or is inaccessible.";
                fetchMock
                    .mock(firstGroupTrancheUrl, '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}', {});
                dependencies.getGroupContentsTranche("grp1234567890", pagingRequest)
                    .then(function () {
                    done.fail();
                }, function (errorMessage) {
                    expect(errorMessage).toEqual(expected);
                    done();
                });
            });
        });
        describe("supporting routine: extracting layer ids", function () {
            it("no layer list", function () {
                var sourceArray = null;
                var expected = [];
                var results = dependencies.getWebmapLayerIds(sourceArray);
                expect(results).toEqual(expected);
            });
            it("empty layer list", function () {
                var sourceArray = [];
                var expected = [];
                var results = dependencies.getWebmapLayerIds(sourceArray);
                expect(results).toEqual(expected);
            });
            it("layer without itemId", function () {
                var sourceArray = [{
                        id: "abc"
                    }];
                var expected = [];
                var results = dependencies.getWebmapLayerIds(sourceArray);
                expect(results).toEqual(expected);
            });
            it("layer with itemId", function () {
                var sourceArray = [{
                        id: "abc",
                        itemId: "ABC"
                    }];
                var expected = ["ABC"];
                var results = dependencies.getWebmapLayerIds(sourceArray);
                expect(results).toEqual(expected);
            });
            it("multiple layers, one without itemId", function () {
                var sourceArray = [{
                        id: "abc",
                        itemId: "ABC"
                    }, {
                        id: "def"
                    }, {
                        id: "ghi",
                        itemId: "GHI"
                    }];
                var expected = ["ABC", "GHI"];
                var results = dependencies.getWebmapLayerIds(sourceArray);
                expect(results).toEqual(expected);
            });
        });
        describe("getDependencies", function () {
            describe("dashboard", function () {
                it("without widgets", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Dashboard";
                    abc.data = {};
                    var expected = [];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("without map widget", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Dashboard";
                    abc.data = {
                        widgets: [{
                                type: "indicatorWidget"
                            }, {
                                type: "listWidget"
                            }]
                    };
                    var expected = [];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("with map widget", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Dashboard";
                    abc.data = {
                        widgets: [{
                                type: "indicatorWidget"
                            }, {
                                type: "mapWidget",
                                itemId: "def"
                            }, {
                                type: "listWidget"
                            }]
                    };
                    var expected = ["def"];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
            });
            describe("feature service", function () {
                it("item type does not have dependencies", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Feature Service";
                    var expected = [];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
            });
            describe("group", function () {
                it("group with no items", function (done) {
                    var groupUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?" +
                        "f=json&start=0&num=100&token=fake-token";
                    fetchMock
                        .mock(groupUrl, '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}', {});
                    var expected = [];
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Group";
                    abc.item.id = "grp1234567890";
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("group with 6 items", function (done) {
                    var groupUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?" +
                        "f=json&start=0&num=100&token=fake-token";
                    fetchMock
                        .mock(groupUrl, '{"total":6,"start":1,"num":6,"nextStart":-1,' +
                        '"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"},{"id":"a4"},{"id":"a5"},{"id":"a6"}]}', {});
                    var expected = ["a1", "a2", "a3", "a4", "a5", "a6"];
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Group";
                    abc.item.id = "grp1234567890";
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("group with error", function (done) {
                    var groupUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                        "?f=json&start=0&num=100&token=fake-token";
                    var expected = "Group does not exist or is inaccessible.";
                    fetchMock
                        .mock("begin:" + groupUrl, '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}', {});
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Group";
                    abc.item.id = "grp1234567890";
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function () {
                        done.fail();
                    }, function (error) {
                        expect(error).toEqual(expected);
                        done();
                    });
                });
                it("group with error in second tranche", function (done) {
                    var groupUrl = "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json";
                    var expected = "Group does not exist or is inaccessible.";
                    fetchMock
                        .mock("begin:" + groupUrl + "&start=0&num=100&token=fake-token", '{"total":4,"start":1,"num":3,"nextStart":3,"items":[{"id":"a1"},{"id":"a2"},{"id":"a3"}]}', {})
                        .mock("begin:" + groupUrl + "&start=3&num=100&token=fake-token", '{"error":{"code":400,"messageCode":"CONT_0006","message":"' + expected + '","details":[]}}', {});
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Group";
                    abc.item.id = "grp1234567890";
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        done.fail();
                    }, function (error) {
                        expect(error).toEqual("Group does not exist or is inaccessible.");
                        done();
                    });
                });
            });
            describe("webmap", function () {
                it("no data", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    var expected = [];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("one operational layer", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {
                        operationalLayers: [{
                                itemId: "def"
                            }],
                        tables: []
                    };
                    var expected = ["def"];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("two operational layers", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {
                        operationalLayers: [{
                                itemId: "def"
                            }, {
                                itemId: "ghi"
                            }],
                        tables: []
                    };
                    var expected = ["def", "ghi"];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("one operational layer and a table", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {
                        operationalLayers: [{
                                itemId: "def"
                            }],
                        tables: [{
                                itemId: "ghi"
                            }]
                    };
                    var expected = ["def", "ghi"];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
            });
            describe("web mapping application", function () {
                it("no data", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    var expected = [];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("no data values", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    abc.data = {};
                    var expected = [];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("based on webmap", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    abc.data = {
                        values: {
                            webmap: "def"
                        }
                    };
                    var expected = ["def"];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
                it("based on group", function (done) {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    abc.data = {
                        values: {
                            group: "def"
                        }
                    };
                    var expected = ["def"];
                    dependencies.getDependencies(abc, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(response).toEqual(expected);
                        done();
                    });
                });
            });
        });
        describe("swizzleDependencies", function () {
            var swizzles = {
                def: {
                    id: "DEF",
                    name: "'Def'",
                    url: "http://services2/SVC67890"
                },
                ghi: {
                    id: "GHI",
                    name: "'Ghi'",
                    url: "http://services2/SVC67890"
                }
            };
            describe("dashboard", function () {
                it("without widgets", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Dashboard";
                    abc.data = {};
                    var expected = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    expected.type = "Dashboard";
                    expected.data = {};
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc).toEqual(expected);
                });
                it("without map widget", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Dashboard";
                    abc.data = {
                        widgets: [{
                                type: "indicatorWidget"
                            }, {
                                type: "listWidget"
                            }]
                    };
                    var expected = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    expected.type = "Dashboard";
                    expected.data = {
                        widgets: [{
                                type: "indicatorWidget"
                            }, {
                                type: "listWidget"
                            }]
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc).toEqual(expected);
                });
                it("with map widget", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Dashboard";
                    abc.data = {
                        widgets: [{
                                type: "indicatorWidget"
                            }, {
                                type: "mapWidget",
                                itemId: "def"
                            }, {
                                type: "listWidget"
                            }]
                    };
                    var expected = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    expected.type = "Dashboard";
                    expected.data = {
                        widgets: [{
                                type: "indicatorWidget"
                            }, {
                                type: "mapWidget",
                                itemId: "DEF"
                            }, {
                                type: "listWidget"
                            }]
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc).toEqual(expected);
                });
            });
            describe("feature service", function () {
                it("item type does not have dependencies", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Feature Service";
                    abc.dependencies = [];
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.dependencies).toEqual([]);
                });
            });
            describe("group", function () {
                it("group with no items", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Group";
                    abc.dependencies = [];
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.dependencies).toEqual([]);
                });
                it("group with 2 items", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Group";
                    abc.dependencies = ["ghi", "def"];
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.dependencies[0]).toEqual("GHI");
                    expect(abc.dependencies[1]).toEqual("DEF");
                });
            });
            describe("webmap", function () {
                it("no data", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data).toBeUndefined();
                });
                it("no operational layer or table", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {};
                    var expected = {};
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data).toEqual(expected);
                });
                it("one operational layer", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {
                        operationalLayers: [{
                                itemId: "def",
                                title: "'def'",
                                url: "http://services1/svc12345/0"
                            }],
                        tables: []
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
                    expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
                    expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");
                });
                it("two operational layers", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {
                        operationalLayers: [{
                                itemId: "def",
                                title: "'def'",
                                url: "http://services1/svc12345/0"
                            }, {
                                itemId: "ghi",
                                title: "'ghi'",
                                url: "http://services1/svc12345/1"
                            }],
                        tables: []
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
                    expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
                    expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");
                    expect(abc.data.operationalLayers[1].itemId).toEqual("GHI");
                    expect(abc.data.operationalLayers[1].title).toEqual("'Ghi'");
                    expect(abc.data.operationalLayers[1].url).toEqual("http://services2/SVC67890/1");
                });
                it("one operational layer and a table", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {
                        operationalLayers: [{
                                itemId: "def",
                                title: "'def'",
                                url: "http://services1/svc12345/0"
                            }],
                        tables: [{
                                itemId: "ghi",
                                title: "'ghi'",
                                url: "http://services1/svc12345/1"
                            }]
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data.operationalLayers[0].itemId).toEqual("DEF");
                    expect(abc.data.operationalLayers[0].title).toEqual("'Def'");
                    expect(abc.data.operationalLayers[0].url).toEqual("http://services2/SVC67890/0");
                    expect(abc.data.tables[0].itemId).toEqual("GHI");
                    expect(abc.data.tables[0].title).toEqual("'Ghi'");
                    expect(abc.data.tables[0].url).toEqual("http://services2/SVC67890/1");
                });
                it("one operational layer and a table, but neither has swizzles", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Map";
                    abc.data = {
                        operationalLayers: [{
                                itemId: "jkl",
                                title: "'jkl'",
                                url: "http://services1/svc12345/0"
                            }],
                        tables: [{
                                itemId: "mno",
                                title: "'mno'",
                                url: "http://services1/svc12345/1"
                            }]
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data.operationalLayers[0].itemId).toEqual("jkl");
                    expect(abc.data.operationalLayers[0].title).toEqual("'jkl'");
                    expect(abc.data.operationalLayers[0].url).toEqual("http://services1/svc12345/0");
                    expect(abc.data.tables[0].itemId).toEqual("mno");
                    expect(abc.data.tables[0].title).toEqual("'mno'");
                    expect(abc.data.tables[0].url).toEqual("http://services1/svc12345/1");
                });
            });
            describe("web mapping application", function () {
                it("no data", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data).toBeUndefined();
                });
                it("no data values", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    abc.data = {};
                    var expected = {};
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data).toEqual(expected);
                });
                it("based on webmap", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    abc.data = {
                        values: {
                            webmap: "def"
                        }
                    };
                    var expected = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    expected.type = "Dashboard";
                    expected.data = {
                        widgets: [{
                                type: "indicatorWidget"
                            }, {
                                type: "listWidget"
                            }]
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data.values.webmap).toEqual("DEF");
                });
                it("based on group", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    abc.data = {
                        values: {
                            group: "def"
                        }
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data.values.group).toEqual("DEF");
                });
                it("no webmap or group", function () {
                    var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                    abc.type = "Web Mapping Application";
                    abc.data = {
                        values: {}
                    };
                    var expected = {
                        values: {}
                    };
                    dependencies.swizzleDependencies(abc, swizzles);
                    expect(abc.data).toEqual(expected);
                });
            });
        });
    });
});
//# sourceMappingURL=dependencies.test.js.map