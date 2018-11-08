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
        define(["require", "exports", "fetch-mock", "../src/fullItem", "./mocks/fullItemQueries", "@esri/arcgis-rest-auth", "./lib/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fetchMock = require("fetch-mock");
    var fullItem_1 = require("../src/fullItem");
    var fullItemQueries_1 = require("./mocks/fullItemQueries");
    var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
    var utils_1 = require("./lib/utils");
    //--------------------------------------------------------------------------------------------------------------------//
    describe("Module `fullItem`: fetches the item, data, and resources of an AGOL item", function () {
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
            it("throws an error if the item to be created fails: missing id", function (done) {
                fetchMock.mock("*", fullItemQueries_1.ItemFailResponse);
                fullItem_1.getFullItem(null, MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
                    done();
                });
            });
            it("throws an error if the item to be created fails: inaccessible", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/fail1234567890", fullItemQueries_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", fullItemQueries_1.ItemFailResponse, {});
                fullItem_1.getFullItem("fail1234567890", MOCK_USER_REQOPTS)
                    .then(fail, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
                    done();
                });
            });
        });
        describe("fetch different item types", function () {
            [
                {
                    id: "dash1234657890", type: "Dashboard", item: fullItemQueries_1.ItemSuccessResponseDashboard,
                    data: fullItemQueries_1.ItemDataSuccessResponseDashboard, resources: fullItemQueries_1.ItemResourcesSuccessResponseNone
                },
                {
                    id: "map1234657890", type: "Web Map", item: fullItemQueries_1.ItemSuccessResponseWebmap,
                    data: fullItemQueries_1.ItemDataSuccessResponseWebmap, resources: fullItemQueries_1.ItemResourcesSuccessResponseNone
                },
                {
                    id: "wma1234657890", type: "Web Mapping Application", item: fullItemQueries_1.ItemSuccessResponseWMA,
                    data: fullItemQueries_1.ItemDataSuccessResponseWMA, resources: fullItemQueries_1.ItemResourcesSuccessResponseNone
                }
            ].forEach(function (_a) {
                var id = _a.id, type = _a.type, item = _a.item, data = _a.data, resources = _a.resources;
                it("should create a " + type + " based on the AGOL response", function (done) {
                    fetchMock
                        .mock("path:/sharing/rest/content/items/" + id, item, {})
                        .mock("path:/sharing/rest/content/items/" + id + "/data", data, {})
                        .mock("path:/sharing/rest/content/items/" + id + "/resources", resources, {});
                    fullItem_1.getFullItem(id, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(fetchMock.called("path:/sharing/rest/content/items/" + id)).toEqual(true);
                        expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/data")).toEqual(true);
                        expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/resources")).toEqual(true);
                        expect(response.type).toEqual(type);
                        expect(response.item).toEqual(jasmine.anything());
                        expect(Object.keys(response.item).length).toEqual(42);
                        expect(response.data).toEqual(jasmine.anything());
                        done();
                    })
                        .catch(function (e) { return fail(e); });
                });
            });
            it("should create a Feature Service based on the AGOL response", function (done) {
                var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
                fetchMock
                    .mock("path:/sharing/rest/content/items/svc1234567890", fullItemQueries_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", fullItemQueries_1.ItemDataSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseNone, {});
                fullItem_1.getFullItem("svc1234567890", MOCK_USER_REQOPTS)
                    .then(function (response) {
                    expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890")).toEqual(true);
                    expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/data")).toEqual(true);
                    expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/resources")).toEqual(true);
                    expect(response.type).toEqual("Feature Service");
                    expect(response.item).toEqual(jasmine.anything());
                    expect(Object.keys(response.item).length).toEqual(42);
                    expect(response.data).toEqual(jasmine.anything());
                    done();
                })
                    .catch(function (e) { return fail(e); });
            });
            it("should return WMA details for a valid AGOL id", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemResourcesSuccessResponseOne, {});
                fullItem_1.getFullItem("wma1234567890")
                    .then(function (response) {
                    expect(response.type).toEqual("Web Mapping Application");
                    expect(response.item.title).toEqual("ROW Permit Public Comment");
                    expect(response.data.source).toEqual("template1234567890");
                    expect(response.resources).toEqual([{ "value": "abc" }]);
                    done();
                }, done.fail);
            });
            it("should handle an item without a data or a resource section", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", fullItemQueries_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", fullItemQueries_1.ItemDataOrResourceFailResponse, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/resources", fullItemQueries_1.ItemDataOrResourceFailResponse, {});
                fullItem_1.getFullItem("wma1234567890")
                    .then(function (response) {
                    expect(response.type).toEqual("Web Mapping Application");
                    expect(response.item.title).toEqual("ROW Permit Public Comment");
                    done();
                }, done.fail);
            });
        });
    });
});
//# sourceMappingURL=fullItem.test.js.map