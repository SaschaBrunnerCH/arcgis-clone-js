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
        define(["require", "exports", "fetch-mock", "../src/fullItemHierarchy", "./mocks/fullItemQueries", "./mocks/featureService", "@esri/arcgis-rest-auth", "./lib/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fetchMock = require("fetch-mock");
    var fullItemHierarchy_1 = require("../src/fullItemHierarchy");
    var fullItemQueries_1 = require("./mocks/fullItemQueries");
    var featureService_1 = require("./mocks/featureService");
    var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
    var utils_1 = require("./lib/utils");
    //--------------------------------------------------------------------------------------------------------------------//
    describe("Module `fullItemHierarchy`: fetches one or more AGOL items and their dependencies", function () {
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
        describe("catch bad input", function () {
            it("throws an error if the hierarchy to be created fails: missing id", function (done) {
                fetchMock.once("*", fullItemQueries_1.ItemFailResponse);
                fullItemHierarchy_1.getFullItemHierarchy(null, MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
                    done();
                });
            });
            it("throws an error if the hierarchy to be created fails: empty id list", function (done) {
                fetchMock.once("*", fullItemQueries_1.ItemFailResponse);
                fullItemHierarchy_1.getFullItemHierarchy([], MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
                    done();
                });
            });
            it("throws an error if the hierarchy to be created fails: missing id in list", function (done) {
                fetchMock.once("*", fullItemQueries_1.ItemFailResponse);
                fullItemHierarchy_1.getFullItemHierarchy([null], MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
                    done();
                });
            });
        });
        describe("failed fetches", function () {
            it("throws an error if the hierarchy to be created fails: inaccessible", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/fail1234567890", fullItemQueries_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", fullItemQueries_1.ItemFailResponse, {});
                fullItemHierarchy_1.getFullItemHierarchy("fail1234567890", MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
                    done();
                });
            });
            it("throws an error if the hierarchy to be created fails: inaccessible in a list", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/fail1234567890", fullItemQueries_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", fullItemQueries_1.ItemFailResponse, {});
                fullItemHierarchy_1.getFullItemHierarchy(["fail1234567890"], MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
                    done();
                });
            });
            it("throws an error if the hierarchy to be created fails: list of [valid, inaccessible]", function (done) {
                var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", fullItemQueries_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", fullItemQueries_1.ItemDataSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .post(baseSvcURL + "FeatureServer?f=json", featureService_1.FeatureServiceSuccessResponse)
                    .post(baseSvcURL + "FeatureServer/0?f=json", featureService_1.FeatureServiceLayer0SuccessResponse)
                    .post(baseSvcURL + "FeatureServer/1?f=json", featureService_1.FeatureServiceLayer1SuccessResponse)
                    .mock("path:/sharing/rest/content/items/fail1234567890", fullItemQueries_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", fullItemQueries_1.ItemFailResponse, {});
                fullItemHierarchy_1.getFullItemHierarchy(["wma1234567890", "fail1234567890"], MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
                    done();
                });
            });
            it("throws an error if the hierarchy to be created fails: list of [valid, missing id]", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", fullItemQueries_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", fullItemQueries_1.ItemDataSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {});
                fullItemHierarchy_1.getFullItemHierarchy(["wma1234567890", null], MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
                    done();
                });
            });
            it("throws an error if getting dependencies fails", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/grp1234567890", fullItemQueries_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/grp1234567890", fullItemQueries_1.ItemSuccessResponseGroup, {})
                    .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                    "?f=json&start=0&num=100&token=fake-token", '{"error":{"code":400,"messageCode":"CONT_0006",' +
                    '"message":"Group does not exist or is inaccessible.","details":[]}}', {});
                fullItemHierarchy_1.getFullItemHierarchy(["grp1234567890"], MOCK_USER_REQOPTS)
                    .then(function () {
                    done.fail();
                }, function (error) {
                    expect(error).toEqual("Group does not exist or is inaccessible.");
                    done();
                });
            });
            it("throws an error if a dependency fails", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", fullItemQueries_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/svc1234567890", fullItemQueries_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {});
                fullItemHierarchy_1.getFullItemHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
                    .then(function () {
                    done.fail();
                }, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: svc1234567890");
                    done();
                });
            });
        });
        describe("successful fetches", function () {
            it("should return a list of WMA details for a valid AGOL id", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", fullItemQueries_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", fullItemQueries_1.ItemDataSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {});
                fullItemHierarchy_1.getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS)
                    .then(function (response) {
                    var keys = Object.keys(response);
                    expect(keys.length).toEqual(3);
                    var fullItem = response[keys[0]];
                    expect(fullItem.type).toEqual("Web Mapping Application");
                    expect(fullItem.item.title).toEqual("ROW Permit Public Comment");
                    expect(fullItem.data.source).toEqual("template1234567890");
                    done();
                }, done.fail);
            });
            it("should return a list of WMA details for a valid AGOL id in a list", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", fullItemQueries_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", fullItemQueries_1.ItemDataSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {});
                fullItemHierarchy_1.getFullItemHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
                    .then(function (response) {
                    var keys = Object.keys(response);
                    expect(keys.length).toEqual(3);
                    var fullItem = response[keys[0]];
                    expect(fullItem.type).toEqual("Web Mapping Application");
                    expect(fullItem.item.title).toEqual("ROW Permit Public Comment");
                    expect(fullItem.data.source).toEqual("template1234567890");
                    done();
                }, done.fail);
            });
            it("should return a list of WMA details for a valid AGOL id in a list with more than one id", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", fullItemQueries_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", fullItemQueries_1.ItemDataSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {});
                fullItemHierarchy_1.getFullItemHierarchy(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
                    .then(function (response) {
                    var keys = Object.keys(response);
                    expect(keys.length).toEqual(3);
                    var fullItem = response[keys[0]];
                    expect(fullItem.type).toEqual("Web Mapping Application");
                    expect(fullItem.item.title).toEqual("ROW Permit Public Comment");
                    expect(fullItem.data.source).toEqual("template1234567890");
                    done();
                }, done.fail);
            });
            it("should handle repeat calls without re-fetching items", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", fullItemQueries_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", fullItemQueries_1.ItemDataSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {});
                fullItemHierarchy_1.getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS)
                    .then(function (collection) {
                    var keys = Object.keys(collection);
                    expect(keys.length).toEqual(3);
                    expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);
                    fullItemHierarchy_1.getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS, collection)
                        .then(function (collection2) {
                        var keys = Object.keys(collection2);
                        expect(keys.length).toEqual(3); // unchanged
                        expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);
                        expect(collection2).toEqual(collection);
                        done();
                    }, done.fail);
                }, done.fail);
            });
        });
    });
});
//# sourceMappingURL=fullItemHierarchy.test.js.map