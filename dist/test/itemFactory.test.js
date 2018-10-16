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
        define(["require", "exports", "fetch-mock", "../src/itemFactory", "./mocks/item", "./mocks/dashboard", "./mocks/featureService", "./mocks/webmap", "./mocks/webMappingApp", "@esri/arcgis-rest-auth", "./lib/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fetchMock = require("fetch-mock");
    var itemFactory_1 = require("../src/itemFactory");
    var item_1 = require("./mocks/item");
    var dashboard_1 = require("./mocks/dashboard");
    var featureService_1 = require("./mocks/featureService");
    var webmap_1 = require("./mocks/webmap");
    var webMappingApp_1 = require("./mocks/webMappingApp");
    var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
    var utils_1 = require("./lib/utils");
    describe("converting an item into JSON", function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // default is 5000 ms
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
        it("throws an error if the item id is not accessible: missing id", function (done) {
            fetchMock.once("*", item_1.ItemFailResponse);
            itemFactory_1.ItemFactory.itemToJSON(null, MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
                done();
            });
        });
        it("throws an error if the item id is not accessible: inaccessible", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/fail1234567890", item_1.ItemFailResponse, {})
                .mock("path:/sharing/rest/community/groups/fail1234567890", item_1.ItemFailResponse, {});
            itemFactory_1.ItemFactory.itemToJSON("fail1234567890", MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
                done();
            });
        });
        describe("with accurate function documentation", function () {
            it("should return WMA details for a valid AGOL id", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", item_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", item_1.ItemDataSuccessResponseWMA, {});
                itemFactory_1.ItemFactory.itemToJSON("wma1234567890")
                    .then(function (response) {
                    expect(response.type).toEqual("Web Mapping Application");
                    expect(response.itemSection.title).toEqual("ROW Permit Public Comment");
                    expect(response.dataSection.source).toEqual("template1234567890");
                    done();
                }, done.fail);
            });
            it("should return an error message for an invalid AGOL id (itemToJSON)", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/fail1234567890", item_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", item_1.ItemFailResponse, {});
                itemFactory_1.ItemFactory.itemToJSON("fail1234567890", MOCK_USER_REQOPTS)
                    .then(function () {
                    done.fail("Invalid item 'found'");
                }, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
                    done();
                });
            });
            it("should return a list of WMA details for a valid AGOL id", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", item_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", item_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", item_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", item_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", item_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", item_1.ItemDataSuccessResponseService, {})
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", featureService_1.FeatureServiceSuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", featureService_1.FeatureServiceLayer0SuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", featureService_1.FeatureServiceLayer1SuccessResponse);
                itemFactory_1.ItemFactory.itemHierarchyToJSON("wma1234567890", MOCK_USER_REQOPTS)
                    .then(function (response) {
                    var keys = Object.keys(response);
                    expect(keys.length).toEqual(3);
                    expect(response[keys[0]].type).toEqual("Web Mapping Application");
                    expect(response[keys[0]].itemSection.title).toEqual("ROW Permit Public Comment");
                    expect(response[keys[0]].dataSection.source).toEqual("template1234567890");
                    done();
                }, done.fail);
            });
            it("should return a list of WMA details for a valid AGOL id in a list", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", item_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", item_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", item_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", item_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", item_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", item_1.ItemDataSuccessResponseService, {})
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", featureService_1.FeatureServiceSuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", featureService_1.FeatureServiceLayer0SuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", featureService_1.FeatureServiceLayer1SuccessResponse);
                itemFactory_1.ItemFactory.itemHierarchyToJSON(["wma1234567890"], MOCK_USER_REQOPTS)
                    .then(function (response) {
                    var keys = Object.keys(response);
                    expect(keys.length).toEqual(3);
                    expect(response[keys[0]].type).toEqual("Web Mapping Application");
                    expect(response[keys[0]].itemSection.title).toEqual("ROW Permit Public Comment");
                    expect(response[keys[0]].dataSection.source).toEqual("template1234567890");
                    done();
                }, done.fail);
            });
            it("should return a list of WMA details for a valid AGOL id in a list with more than one id", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", item_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", item_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", item_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", item_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", item_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", item_1.ItemDataSuccessResponseService, {})
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", featureService_1.FeatureServiceSuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", featureService_1.FeatureServiceLayer0SuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", featureService_1.FeatureServiceLayer1SuccessResponse);
                itemFactory_1.ItemFactory.itemHierarchyToJSON(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
                    .then(function (response) {
                    var keys = Object.keys(response);
                    expect(keys.length).toEqual(3);
                    expect(response[keys[0]].type).toEqual("Web Mapping Application");
                    expect(response[keys[0]].itemSection.title).toEqual("ROW Permit Public Comment");
                    expect(response[keys[0]].dataSection.source).toEqual("template1234567890");
                    done();
                }, done.fail);
            });
            it("should return an error message for an invalid AGOL id (itemHierarchyToJSON)", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/fail1234567890", item_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", item_1.ItemFailResponse, {});
                itemFactory_1.ItemFactory.itemHierarchyToJSON("fail1234567890", MOCK_USER_REQOPTS)
                    .then(function () {
                    done.fail("Invalid item 'found'");
                }, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
                    done();
                });
            });
            it("should return an error message for an invalid AGOL id in a list", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/fail1234567890", item_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", item_1.ItemFailResponse, {});
                itemFactory_1.ItemFactory.itemHierarchyToJSON(["fail1234567890"], MOCK_USER_REQOPTS)
                    .then(function () {
                    done.fail("Invalid item 'found'");
                }, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
                    done();
                });
            });
            it("should return an error message for an invalid AGOL id in a list with more than one id", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/wma1234567890", item_1.ItemSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/wma1234567890/data", item_1.ItemDataSuccessResponseWMA, {})
                    .mock("path:/sharing/rest/content/items/map1234567890", item_1.ItemSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/map1234567890/data", item_1.ItemDataSuccessResponseWebmap, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890", item_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", item_1.ItemDataSuccessResponseService, {})
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", featureService_1.FeatureServiceSuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", featureService_1.FeatureServiceLayer0SuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", featureService_1.FeatureServiceLayer1SuccessResponse)
                    .mock("path:/sharing/rest/content/items/fail1234567890", item_1.ItemFailResponse, {})
                    .mock("path:/sharing/rest/community/groups/fail1234567890", item_1.ItemFailResponse, {});
                itemFactory_1.ItemFactory.itemHierarchyToJSON(["wma1234567890", "fail1234567890"], MOCK_USER_REQOPTS)
                    .then(function () {
                    done.fail("Invalid item 'found'");
                }, function (error) {
                    expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
                    done();
                });
            });
        });
        describe("for different item types", function () {
            [
                { id: "dash1234657890", type: "Dashboard", item: dashboard_1.DashboardItemSuccessResponse, data: dashboard_1.DashboardItemDataSuccessResponse },
                { id: "map1234657890", type: "Web Map", item: webmap_1.WebMapItemSuccessResponse, data: webmap_1.WebMapItemDataSuccessResponse },
                { id: "wma1234657890", type: "Web Mapping Application", item: webMappingApp_1.WebMappingAppItemSuccessResponse, data: webMappingApp_1.WebMappingAppItemDataSuccessResponse }
            ].forEach(function (_a) {
                var id = _a.id, type = _a.type, item = _a.item, data = _a.data;
                it("should create a " + type + " based on the AGOL response", function (done) {
                    fetchMock
                        .mock("path:/sharing/rest/content/items/" + id, item, {})
                        .mock("path:/sharing/rest/content/items/" + id + "/data", data, {});
                    itemFactory_1.ItemFactory.itemToJSON(id, MOCK_USER_REQOPTS)
                        .then(function (response) {
                        expect(fetchMock.called("path:/sharing/rest/content/items/" + id)).toEqual(true);
                        expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/data")).toEqual(true);
                        expect(response.type).toEqual(type);
                        expect(response.itemSection).toEqual(jasmine.anything());
                        expect(Object.keys(response.itemSection).length).toEqual(16);
                        //console.log(Object.keys(response.itemSection)); //???
                        expect(response.itemSection.owner).toBeUndefined();
                        expect(response.itemSection.created).toBeUndefined();
                        expect(response.itemSection.modified).toBeUndefined();
                        expect(response.dataSection).toEqual(jasmine.anything());
                        done();
                    })
                        .catch(function (e) {
                        fail(e);
                    });
                });
            });
            it("should create a Feature Service based on the AGOL response", function (done) {
                fetchMock
                    .mock("path:/sharing/rest/content/items/svc1234567890", item_1.ItemSuccessResponseService, {})
                    .mock("path:/sharing/rest/content/items/svc1234567890/data", item_1.ItemDataSuccessResponseService, {})
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", featureService_1.FeatureServiceSuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", featureService_1.FeatureServiceLayer0SuccessResponse)
                    .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", featureService_1.FeatureServiceLayer1SuccessResponse);
                itemFactory_1.ItemFactory.itemToJSON("svc1234567890", MOCK_USER_REQOPTS)
                    .then(function (response) {
                    expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890")).toEqual(true);
                    expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/data")).toEqual(true);
                    expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json")).toEqual(true);
                    expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json")).toEqual(true);
                    expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json")).toEqual(true);
                    expect(response.type).toEqual("Feature Service");
                    expect(response.itemSection).toEqual(jasmine.anything());
                    expect(Object.keys(response.itemSection).length).toEqual(33);
                    expect(response.itemSection.owner).toBeUndefined();
                    expect(response.itemSection.created).toBeUndefined();
                    expect(response.itemSection.modified).toBeUndefined();
                    expect(response.dataSection).toEqual(jasmine.anything());
                    done();
                })
                    .catch(function (e) {
                    fail(e);
                });
            });
        });
    });
});
//# sourceMappingURL=itemFactory.test.js.map