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
var tslib_1 = require("tslib");
var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
var mClassifier = require("../src/itemTypes/classifier");
var mCommon = require("../src/itemTypes/common");
var mFeatureService = require("../src/itemTypes/featureservice");
var mGroup = require("../src/itemTypes/group");
var mItemHelpers = require("../src/utils/item-helpers");
var mSolution = require("../src/solution");
var mWebMap = require("../src/itemTypes/webmap");
var utils_1 = require("./lib/utils");
var customMatchers_1 = require("./customMatchers");
var fetchMock = require("fetch-mock");
var mockItems = require("./mocks/agolItems");
var mockSolutions = require("./mocks/templates");
var mockUtils = require("./lib/utils");
// -------------------------------------------------------------------------------------------------------------------//
describe("Module `solution`: generation, publication, and cloning of a solution item", function () {
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
    var orgUrl = "https://myOrg.maps.arcgis.com";
    var portalUrl = "https://www.arcgis.com";
    beforeEach(function () {
        jasmine.addMatchers(customMatchers_1.CustomMatchers);
    });
    afterEach(function () {
        fetchMock.restore();
        jasmine.clock().uninstall();
    });
    describe("create solution", function () {
        it("for single item containing webmap WMA & feature service", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            spyOn(mItemHelpers, "createId").and.callFake(function () {
                return "i1a2b3c4";
            });
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("one text"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mSolution.createSolutionTemplate("wma1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                mockUtils.removeItemFcns(response);
                var template = mockSolutions.getWebMappingApplicationTemplate();
                template[0].resources = mockItems.getAGOLItemResources("one text").resources;
                expect(response).toEqual(template);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("for single item containing group WMA & feature service", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            spyOn(mItemHelpers, "createId").and.callFake(function () {
                return "i1a2b3c4";
            });
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemDataWMAGroup())
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("one text"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mSolution.createSolutionTemplate("wma1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                mockUtils.removeItemFcns(response);
                var template = mockSolutions.getWebMappingApplicationTemplateGroup();
                expect(response).toEqual(template);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("for single item containing WMA without folderId, webmap, or group", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            spyOn(mItemHelpers, "createId").and.callFake(function () {
                return "i1a2b3c4";
            });
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemDataWMANoWebmapOrGroup())
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources());
            mSolution.createSolutionTemplate("wma1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                mockUtils.removeItemFcns(response);
                var template = mockSolutions.getWebMappingApplicationTemplateNoWebmapOrGroup();
                expect(response).toEqual(template);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("for a group", function (done) {
            spyOn(mItemHelpers, "createId").and.callFake(function () {
                return "i1a2b3c4";
            });
            fetchMock
                .mock("path:/sharing/rest/content/items/grp1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/community/groups/grp1234567890", mockItems.getAGOLGroup())
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=1&num=100&token=fake-token", '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}');
            mSolution.createSolutionTemplate("grp1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                mockUtils.removeItemFcns(response);
                expect(response).toEqual([
                    mockSolutions.getGroupTemplatePart()
                ]);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("gets a service name from a layer if a service needs a name", function (done) {
            var itemTemplate = {
                itemId: "",
                type: "Feature Service",
                key: "",
                item: mockItems.getNoNameAGOLFeatureServiceItem(),
                data: mockItems.getAGOLItemData("Feature Service"),
                properties: {
                    service: null,
                    layers: null,
                    tables: null
                }
            };
            itemTemplate.itemId = itemTemplate.item.id;
            fetchMock
                .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(itemTemplate.item.url + "/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(itemTemplate.item.url + "/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
                .then(function () {
                expect(itemTemplate.properties.service.name).toEqual(mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]).layers[0].name);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("gets a service name from a table if a service needs a name--no layer", function (done) {
            var itemTemplate = {
                itemId: "",
                type: "Feature Service",
                key: "",
                item: mockItems.getNoNameAGOLFeatureServiceItem(),
                data: mockItems.getAGOLItemData("Feature Service"),
                properties: {
                    service: null,
                    layers: null,
                    tables: null
                }
            };
            itemTemplate.itemId = itemTemplate.item.id;
            fetchMock
                .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService(undefined, [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(itemTemplate.item.url + "/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(itemTemplate.item.url + "/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
                .then(function () {
                expect(itemTemplate.properties.service.name).toEqual(mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]).name);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("gets a service name from a table if a service needs a name--nameless layer", function (done) {
            var itemTemplate = {
                itemId: "",
                type: "Feature Service",
                key: "",
                item: mockItems.getNoNameAGOLFeatureServiceItem(),
                data: mockItems.getAGOLItemData("Feature Service"),
                properties: {
                    service: null,
                    layers: null,
                    tables: null
                }
            };
            itemTemplate.itemId = itemTemplate.item.id;
            fetchMock
                .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService(mockUtils.removeNameField([mockItems.getAGOLLayerOrTable(0, "", "Feature Layer")]), [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(itemTemplate.item.url + "/0?f=json", mockItems.getAGOLLayerOrTable(0, "", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(itemTemplate.item.url + "/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
                .then(function () {
                expect(itemTemplate.properties.service.name).toEqual(mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]).name);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("falls back to 'Feature Service' if a service needs a name", function (done) {
            var itemTemplate = {
                itemId: "",
                type: "Feature Service",
                key: "",
                item: mockItems.getNoNameAGOLFeatureServiceItem(),
                data: mockItems.getAGOLItemData("Feature Service"),
                properties: {
                    service: null,
                    layers: null,
                    tables: null
                }
            };
            itemTemplate.itemId = itemTemplate.item.id;
            fetchMock
                .post(itemTemplate.item.url + "?f=json", mockItems.getAGOLService(mockUtils.removeNameField([mockItems.getAGOLLayerOrTable(0, "", "Feature Layer")]), mockUtils.removeNameField([mockItems.getAGOLLayerOrTable(1, "", "Table")])))
                .post(itemTemplate.item.url + "/0?f=json", mockItems.getAGOLLayerOrTable(0, "", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(itemTemplate.item.url + "/1?f=json", mockItems.getAGOLLayerOrTable(1, "", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mFeatureService.fleshOutFeatureService(itemTemplate, MOCK_USER_REQOPTS)
                .then(function () {
                expect(itemTemplate.properties.service.name).toEqual("Feature Service");
                done();
            }, function (error) { return done.fail(error); });
        });
    });
    describe("publish solution", function () {
        it("for single item containing WMA & feature service", function (done) {
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"sln1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/sln1234567890/update", '{"success":true,"id":"sln1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/sln1234567890/share", '{"notSharedWith":[],"itemId":"sln1234567890"}');
            mSolution.publishSolutionTemplate("My Solution", mockSolutions.getWebMappingApplicationTemplate(), MOCK_USER_REQOPTS)
                .then(function (response) {
                expect(response).toEqual({
                    "success": true,
                    "id": "sln1234567890"
                });
                done();
            }, function (error) { return done.fail(error); });
        });
        it("for single item containing WMA & feature service, but item add fails", function (done) {
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get400Failure());
            mSolution.publishSolutionTemplate("My Solution", mockSolutions.getWebMappingApplicationTemplate(), MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("for single item containing WMA & feature service, but share as public fails", function (done) {
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"sln1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/sln1234567890/share", mockItems.get400Failure());
            mSolution.publishSolutionTemplate("My Solution", mockSolutions.getWebMappingApplicationTemplate(), MOCK_USER_REQOPTS, null, "public")
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
    });
    describe("clone solution", function () {
        it("should handle a missing solution", function (done) {
            mSolution.createSolutionFromTemplate(null, MOCK_USER_REQOPTS)
                .then(done, done.fail);
        });
        it("should handle an empty, nameless solution", function (done) {
            var settings = utils_1.createMockSettings();
            mSolution.createSolutionFromTemplate({}, MOCK_USER_REQOPTS, settings)
                .then(done, done.fail);
        });
        it("should handle failure to create solution's folder", function (done) {
            var solutionItem = mockSolutions.getWebMappingApplicationTemplate();
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createFolder", mockItems.get400Failure());
            mSolution.createSolutionFromTemplate(solutionItem, sessionWithMockedTime, settings)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should clone a solution using a generated folder", function (done) {
            var solutionItem = mockSolutions.getWebMappingApplicationTemplate();
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            // Provide different results for same route upon subsequent call
            var addItemUpdater = (function () {
                var stepNum = 0;
                return function () { return [
                    '{"success":true,"id":"map1234567890","folder":"fld1234567890"}',
                    '{"success":true,"id":"wma1234567890","folder":"fld1234567890"}',
                    '{"success":true,"id":"sto1234567890","folder":"fld1234567890"}'
                ][stepNum++]; };
            })();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createFolder", '{"success":true,"folder":{"username":"casey","id":"fld1234567890","title":"Solution (' + expected + ')"}}')
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move", '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/1/addToDefinition", '{"success":true}')
                .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem", addItemUpdater)
                .post("path:/sharing/rest/content/users/casey/items/wma1234567890/update", '{"success":true,"id":"wma1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/map1234567890/update", '{"success":true,"id":"map1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/sto1234567890/update", '{"success":true,"id":"sto1234567890"}');
            mSolution.createSolutionFromTemplate(solutionItem, sessionWithMockedTime, settings)
                .then(function (response) {
                expect(response.length).toEqual(3);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("for single item containing WMA without a data section", function (done) {
            var solutionItem = mockSolutions.getWebMappingApplicationTemplateNoWebmapOrGroup();
            delete solutionItem[0].data;
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createFolder", '{"success":true,"folder":{"username":"casey","id":"fld1234567890","title":"Solution (' + expected + ')"}}')
                .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem", '{"success":true,"id":"wma1234567890","folder":"fld1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/wma1234567890/update", '{"success":true,"id":"wma1234567890"}');
            mSolution.createSolutionFromTemplate(solutionItem, sessionWithMockedTime, settings)
                .then(function (response) {
                expect(response.length).toEqual(1);
                expect(response[0].data).toBeUndefined();
                done();
            }, function (error) { return done.fail(error); });
        });
        it("handle failure to create a single item containing WMA without a data section", function (done) {
            var solutionItem = mockSolutions.getWebMappingApplicationTemplateNoWebmapOrGroup();
            delete solutionItem[0].data;
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createFolder", '{"success":true,"folder":{"username":"casey","id":"fld1234567890","title":"Solution (' + expected + ')"}}')
                .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem", mockItems.get400Failure());
            mSolution.createSolutionFromTemplate(solutionItem, sessionWithMockedTime, settings)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should clone a solution using a supplied folder and supplied solution name", function (done) {
            var solutionItem = mockSolutions.getWebMappingApplicationTemplate();
            var folderId = "FLD1234567890";
            var settings = utils_1.createMockSettings("My Solution", folderId);
            // Test a code path
            solutionItem[2].dependencies = null;
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            // Provide different results for same route upon subsequent call
            var addItemUpdater = (function () {
                var stepNum = 0;
                return function () { return [
                    '{"success":true,"id":"map1234567890","folder":"FLD1234567890"}',
                    '{"success":true,"id":"wma1234567890","folder":"FLD1234567890"}',
                    '{"success":true,"id":"sto1234567890","folder":"FLD1234567890"}'
                ][stepNum++]; };
            })();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createFolder", '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                folderId + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"' + folderId + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' + folderId +
                '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move", '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"' + folderId + '"}')
                .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
                "/FeatureServer/1/addToDefinition", '{"success":true}')
                .post("path:/sharing/rest/content/users/casey/" + folderId + "/addItem", addItemUpdater)
                .post("path:/sharing/rest/content/users/casey/items/wma1234567890/update", '{"success":true,"id":"wma1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/map1234567890/update", '{"success":true,"id":"map1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/sto1234567890/update", '{"success":true,"id":"sto1234567890"}');
            mSolution.createSolutionFromTemplate(solutionItem, MOCK_USER_REQOPTS, settings)
                .then(function (response) {
                expect(response.length).toEqual(3);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should clone a solution using a supplied folder, but handle failed storymap", function (done) {
            var solutionItem = mockSolutions.getWebMappingApplicationTemplate();
            var folderId = "FLD1234567890";
            var settings = utils_1.createMockSettings(undefined, folderId, "org");
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            // Provide different results for same route upon subsequent call
            var addItemUpdater = (function () {
                var stepNum = 0;
                return function () { return [
                    '{"success":true,"id":"map1234567890","folder":"FLD1234567890"}',
                    '{"success":true,"id":"wma1234567890","folder":"FLD1234567890"}',
                    mockItems.get400Failure()
                ][stepNum++]; };
            })();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createFolder", '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                folderId + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"' + folderId + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' + folderId +
                '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move", '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"' + folderId + '"}')
                .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/" + folderId +
                "/FeatureServer/1/addToDefinition", '{"success":true}')
                .post("path:/sharing/rest/content/users/casey/" + folderId + "/addItem", addItemUpdater)
                .post("path:/sharing/rest/content/users/casey/items/map1234567890/update", '{"success":true,"id":"map1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/wma1234567890/update", '{"success":true,"id":"wma1234567890"}');
            mSolution.createSolutionFromTemplate(solutionItem, MOCK_USER_REQOPTS, settings)
                .then(function (response) {
                expect(response.length).toEqual(3);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle failure to create a contained item", function (done) {
            var solutionItem = mockSolutions.getWebMappingApplicationTemplate();
            var folderId = "FLD1234567890";
            var settings = utils_1.createMockSettings(undefined, folderId);
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createFolder", '{"success":true,"folder":{"username":"casey","id":"' + folderId + '","title":"' + folderId + '"}}')
                .post("path:/sharing/rest/content/users/casey/createService", mockItems.get400Failure());
            mSolution.createSolutionFromTemplate(solutionItem, MOCK_USER_REQOPTS, settings)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
    });
    describe("supporting routine: create item", function () {
        it("should create a Generic in the root folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Unsupported"));
            var settings = utils_1.createMockSettings();
            function progressCallback(update) {
                expect(update.processId).toEqual(itemTemplate.key);
            }
            ;
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"GEN1234567890","folder":null}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS, progressCallback)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("GEN1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a Dashboard in the root folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Dashboard"));
            var settings = utils_1.createMockSettings();
            function progressCallback(update) {
                expect(update.processId).toEqual(itemTemplate.key);
            }
            ;
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"DSH1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update", '{"success":true,"id":"DSH1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS, progressCallback)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("DSH1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a Dashboard in a specified folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Dashboard"));
            var settings = utils_1.createMockSettings();
            settings.folderId = "fld1234567890";
            fetchMock
                .post("path:/sharing/rest/content/users/casey/fld1234567890/addItem", '{"success":true,"id":"DSH1234567890","folder":"fld1234567890"}')
                .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update", '{"success":true,"id":"DSH1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("DSH1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a mapless Dashboard", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoWidgets());
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"DSH1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update", '{"success":true,"id":"DSH1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("DSH1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a dataless Dashboard", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getTemplatePartNoData("Dashboard"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"DSH1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update", '{"success":true,"id":"DSH1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("DSH1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a dataless Web Map", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getTemplatePartNoData("Web Map"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"MAP1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/MAP1234567890/update", '{"success":true,"id":"MAP1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("MAP1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a dataless Web Mapping Application", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getTemplatePartNoData("Web Mapping Application"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"WMA1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/WMA1234567890/update", '{"success":true,"id":"WMA1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("WMA1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle failure to create a Dashboard 200", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoWidgets());
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get200Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to create a Dashboard 400", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoWidgets());
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to update Dashboard URL", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getDashboardTemplatePartNoWidgets());
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"DSH1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/DSH1234567890/update", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should create an unsupported item in the root folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Unsupported"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"unk1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/unk1234567890/update", '{"success":true,"id":"unk1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("unk1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle failure to create an unsupported item 200", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Unsupported"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get200Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to create an unsupported item 400", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Unsupported"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should create Web Map in the root folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Map"));
            var settings = utils_1.createMockSettings();
            function progressCallback(update) {
                expect(update.processId).toEqual(itemTemplate.key);
            }
            ;
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"map1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/map1234567890/update", '{"success":true,"id":"map1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS, progressCallback)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("map1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle failure to update Web Map URL", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Map"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"map1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/map1234567890/update", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to create Web Map 200", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Map"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get200Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to create Web Map 400", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Map"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to create Web Mapping Application 200", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Mapping Application"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get200Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to create Web Mapping Application 400", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Mapping Application"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should create a Feature Service", function (done) {
            var templatePart = mockSolutions.getItemTemplatePart("Feature Service");
            var itemTemplate = mClassifier.initItemTemplateFromJSON(templatePart);
            var settings = utils_1.createMockSettings();
            function progressCallback(update) {
                expect(update.processId).toEqual(itemTemplate.key);
            }
            ;
            settings.folderId = "fld1234567890";
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            var templateItemId = templatePart.itemId;
            var expectedCreatedItemId = templateItemId.toUpperCase();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"SVC1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"SVC1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/sharing/rest/content/users/casey/items/SVC1234567890/move", '{"success":true,"itemId":"SVC1234567890","owner":"casey","folder":"fld1234567890"}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/1/addToDefinition", '{"success":true}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime, progressCallback)
                .then(function (createdItem) {
                // Check that we're appending a timestamp to the service name
                var createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
                var createServiceCallBody = createServiceCall[0][1].body;
                expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_" + expected + "%22%2C"))
                    .toBeGreaterThan(0);
                expect(settings[templateItemId].id).toEqual(expectedCreatedItemId);
                expect(createdItem.itemId).toEqual(expectedCreatedItemId);
                expect(createdItem.item.id).toEqual(expectedCreatedItemId);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a Feature Service without a data section", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getTemplatePartNoData("Feature Service"));
            var settings = utils_1.createMockSettings();
            settings.folderId = "fld1234567890";
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move", '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/1/addToDefinition", '{"success":true}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function (createdItem) {
                // Check that we're appending a timestamp to the service name
                var createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
                var createServiceCallBody = createServiceCall[0][1].body;
                expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_" + expected + "%22%2C"))
                    .toBeGreaterThan(0);
                expect(createdItem.itemId).toEqual("svc1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a Feature Service without relationships", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getFeatureServiceTemplatePartNoRelationships());
            var settings = utils_1.createMockSettings();
            settings.folderId = "fld1234567890";
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/sharing/rest/content/users/casey/items/svc1234567890/move", '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/1/addToDefinition", '{"success":true}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function (createdItem) {
                // Check that we're appending a timestamp to the service name
                var createServiceCall = fetchMock.calls("path:/sharing/rest/content/users/casey/createService");
                var createServiceCallBody = createServiceCall[0][1].body;
                expect(createServiceCallBody.indexOf("name%22%3A%22Name%20of%20an%20AGOL%20item_" + expected + "%22%2C"))
                    .toBeGreaterThan(0);
                expect(createdItem.itemId).toEqual("svc1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle an error while trying to create a Feature Service 200", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
            itemTemplate.item.url = null;
            var settings = utils_1.createMockSettings();
            settings.folderId = "fld1234567890";
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", mockItems.get200Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle an error while trying to create a Feature Service 400", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
            itemTemplate.item.url = null;
            var settings = utils_1.createMockSettings();
            settings.folderId = "fld1234567890";
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should create a Feature Service and handle failure to add layers|tables", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle Feature Service failure to update first layers|tables relationship in chain", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            // Feature layer indices are assigned incrementally as they are added to the feature service
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/0/addToDefinition", mockItems.get400Failure())
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/1/addToDefinition", '{"success":true}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle Feature Service failure to update second layers|tables relationship in chain", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            // Feature layer indices are assigned incrementally as they are added to the feature service
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/1/addToDefinition", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle Feature Service with four layers|tables relationship", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getFourItemFeatureServiceTemplatePart());
            var settings = utils_1.createMockSettings();
            // Verify template layers|tables ordering
            expect(itemTemplate.data.layers.length).toEqual(3);
            expect(itemTemplate.data.layers.map(function (item) { return item.popupInfo.title; }))
                .toEqual(["layer 0", "layer 2", "layer 3"]);
            expect(itemTemplate.data.tables.length).toEqual(1);
            expect(itemTemplate.data.tables.map(function (item) { return item.popupInfo.title; }))
                .toEqual(["table 1"]);
            expect(itemTemplate.properties.service.layers.length).toEqual(3);
            expect(itemTemplate.properties.service.layers.map(function (item) { return item.name; }))
                .toEqual(["ROW Permits", "ROW Permits layer 2", "ROW Permits layer 3"]);
            expect(itemTemplate.properties.service.tables.length).toEqual(1);
            expect(itemTemplate.properties.service.tables.map(function (item) { return item.name; }))
                .toEqual(["ROW Permit Comment"]);
            expect(itemTemplate.properties.layers.length).toEqual(3);
            expect(itemTemplate.properties.layers.map(function (item) { return item.name; }))
                .toEqual(["ROW Permits", "ROW Permits layer 2", "ROW Permits layer 3"]);
            expect(itemTemplate.properties.tables.length).toEqual(1);
            expect(itemTemplate.properties.tables.map(function (item) { return item.name; }))
                .toEqual(["ROW Permit Comment"]);
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum++ + '}]}'; };
            })();
            // Feature layer indices are assigned incrementally as they are added to the feature service
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater)
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/0/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/1/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/2/addToDefinition", '{"success":true}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/3/addToDefinition", '{"success":true}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function (response) {
                // Verify order of layers|tables adding
                var addToDefinitionCalls = fetchMock.calls("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                    "/FeatureServer/addToDefinition");
                expect(addToDefinitionCalls.map(function (call) {
                    // Each call record is [url, options], where options has method, credentials, body, headers properties
                    var body = call[1].body;
                    var iIdStart = body.indexOf("%2C%22id%22%3A") + "%2C%22id%22%3A".length;
                    var iIdEnd = body.indexOf("%2C", iIdStart);
                    var iNameStart = body.indexOf("%2C%22name%22%3A%22") + "%2C%22name%22%3A%22".length;
                    var iNameEnd = body.indexOf("%22%2C", iNameStart);
                    return body.substring(iIdStart, iIdEnd) + ":" + body.substring(iNameStart, iNameEnd);
                })).toEqual(["0:ROW%20Permits", "1:ROW%20Permit%20Comment",
                    "2:ROW%20Permits%20layer%202", "3:ROW%20Permits%20layer%203"]);
                done();
            }, function () { return done.fail(); });
        });
        it("should handle Feature Service failure to update third layers|tables relationship in chain", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getFourItemFeatureServiceTemplatePart());
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            // Feature layer indices are assigned incrementally as they are added to the feature service
            var layerNumUpdater = (function () {
                var layerNum = 0;
                return function () { return layerNum++ === 2 ?
                    mockItems.get400Failure() : '{"success":true,"layers":[{"name":"ROW Permits","id":' + layerNum + '}]}'; };
            })();
            // Feature layer indices are assigned incrementally as they are added to the feature service
            fetchMock
                .post("path:/sharing/rest/content/users/casey/createService", '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
                'ROWPermits_publiccomment_' + now + '/FeatureServer","itemId":"svc1234567890",' +
                '"name":"ROWPermits_publiccomment_' + now + '","serviceItemId":"svc1234567890",' +
                '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
                now + '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}')
                .post("path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" + now +
                "/FeatureServer/addToDefinition", layerNumUpdater);
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle service without any layers or tables", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Feature Service"));
            itemTemplate.properties.service.layers = null;
            itemTemplate.properties.service.tables = null;
            itemTemplate.properties.layers = null;
            itemTemplate.properties.tables = null;
            mFeatureService.addFeatureServiceLayersAndTables(itemTemplate, {}, MOCK_USER_REQOPTS)
                .then(function () { return done(); }, function (error) { return done.fail(error); });
        });
        it("should create a non-empty Group", function (done) {
            var templatePart = mockSolutions.getGroupTemplatePart(["wma1234567890", "map1234567890", "map1234567890"]);
            var groupTemplate = mClassifier.initItemTemplateFromJSON(templatePart);
            function progressCallback(update) {
                expect(update.processId).toEqual(groupTemplate.key);
            }
            ;
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            var templateItemId = templatePart.itemId;
            var expectedCreatedItemId = templateItemId.toUpperCase();
            fetchMock
                .post('path:/sharing/rest/community/createGroup', '{"success":true,"group":{"id":"' + expectedCreatedItemId +
                '","title":"Group_' + expected + '","owner":"casey"}}')
                .mock('path:/sharing/rest/community/users/casey', '{"username":"casey","id":"' + expectedCreatedItemId + '"}')
                .post('path:/sharing/rest/search', '{"query":"id: map1234567890 AND group: ' + expectedCreatedItemId + '",' +
                '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}')
                .mock('path:/sharing/rest/community/groups/' + expectedCreatedItemId + '', '{"id":"' + expectedCreatedItemId + '","title":"My group","owner":"casey",' +
                '"userMembership":{"username":"casey","memberType":"owner","applications":0}}')
                .post('path:/sharing/rest/content/users/casey/items/map1234567890/share', '{"notSharedWith":[],"itemId":"map1234567890"}')
                .post('path:/sharing/rest/content/users/casey/items/wma1234567890/share', '{"notSharedWith":[],"itemId":"wma1234567890"}');
            groupTemplate.fcns.createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime, progressCallback)
                .then(function (createdItem) {
                expect(settings[templateItemId].id).toEqual(expectedCreatedItemId);
                expect(createdItem.itemId).toEqual(expectedCreatedItemId);
                expect(createdItem.item.id).toEqual(expectedCreatedItemId);
                expect(createdItem.dependencies.length).toEqual(3);
                expect(createdItem.estimatedDeploymentCostFactor).toEqual(6);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create an empty Group", function (done) {
            var templatePart = mockSolutions.getGroupTemplatePart();
            var groupTemplate = mClassifier.initItemTemplateFromJSON(templatePart);
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            var templateItemId = templatePart.itemId;
            var expectedCreatedItemId = templateItemId.toUpperCase();
            fetchMock
                .post('path:/sharing/rest/community/createGroup', '{"success":true,"group":{"id":"' + expectedCreatedItemId +
                '","title":"Group_' + expected + '","owner":"casey"}}');
            groupTemplate.fcns.createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
                .then(function (createdItem) {
                expect(settings[templateItemId].id).toEqual(expectedCreatedItemId);
                expect(createdItem.itemId).toEqual(expectedCreatedItemId);
                expect(createdItem.item.id).toEqual(expectedCreatedItemId);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle the failure to create an empty Group 200", function (done) {
            var groupTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getGroupTemplatePart());
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post('path:/sharing/rest/community/createGroup', mockItems.get200Failure());
            groupTemplate.fcns.createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle the failure to create an empty Group 400", function (done) {
            var groupTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getGroupTemplatePart());
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post('path:/sharing/rest/community/createGroup', mockItems.get400Failure());
            groupTemplate.fcns.createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should handle failure to add to Group", function (done) {
            var groupTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getGroupTemplatePart(["map1234567890"]));
            var settings = utils_1.createMockSettings();
            // Because we make the service name unique by appending a timestamp, set up a clock & user session
            // with known results
            var date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
            var expected = "20190304_0506_07000"; // 1-based month
            var now = date.getTime();
            var sessionWithMockedTime = {
                authentication: utils_1.createRuntimeMockUserSession(utils_1.setMockDateTime(now))
            };
            fetchMock
                .post('path:/sharing/rest/community/createGroup', '{"success":true,"group":{"id":"grp1234567890","title":"Group_' + expected + '","owner":"casey"}}')
                .mock('path:/sharing/rest/community/users/casey', '{"username":"casey","id":"grp1234567890"}')
                .post('path:/sharing/rest/search', '{"query":"id: map1234567890 AND group: grp1234567890",' +
                '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}')
                .mock('path:/sharing/rest/community/groups/grp1234567890', '{"id":"grp1234567890","title":"My group","owner":"casey",' +
                '"userMembership":{"username":"casey","memberType":"owner","applications":0}}')
                .post('path:/sharing/rest/content/users/casey/items/map1234567890/share', mockItems.get400Failure());
            groupTemplate.fcns.createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should create a Web Mapping Application in the root folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Mapping Application"));
            var settings = utils_1.createMockSettings();
            function progressCallback(update) {
                expect(update.processId).toEqual(itemTemplate.key);
            }
            ;
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"WMA1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/WMA1234567890/update", '{"success":true,"id":"WMA1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS, progressCallback)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("WMA1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle the failure to update the URL of a Web Mapping Application being created", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Web Mapping Application"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"WMA1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/WMA1234567890/update", mockItems.get400Failure());
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("should create a public Dashboard in the root folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Dashboard"));
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"dsh1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share", '{"notSharedWith":[],"itemId":"dsh1234567890"}');
            mCommon.createItemWithData(itemTemplate.item, itemTemplate.data, MOCK_USER_REQOPTS, null, "public")
                .then(function (createdItemUpdateResponse) {
                expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a dataless public Dashboard in the root folder", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getTemplatePartNoData("Dashboard"));
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"dsh1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share", '{"notSharedWith":[],"itemId":"dsh1234567890"}');
            mCommon.createItemWithData(itemTemplate.item, itemTemplate.data, MOCK_USER_REQOPTS, null, "public")
                .then(function (createdItemUpdateResponse) {
                expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create a dataless public Dashboard with both folder and access undefined", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getTemplatePartNoData("Dashboard"));
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"dsh1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/dsh1234567890/share", '{"notSharedWith":[],"itemId":"dsh1234567890"}');
            mCommon.createItemWithData(itemTemplate.item, itemTemplate.data, MOCK_USER_REQOPTS, undefined, undefined)
                .then(function (createdItemUpdateResponse) {
                expect(createdItemUpdateResponse).toEqual({ success: true, id: "dsh1234567890" });
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should create an item that's not a Dashboard, Feature Service, Group, Web Map, or Web Mapping Application", function (done) {
            var itemTemplate = mClassifier.initItemTemplateFromJSON(mockSolutions.getItemTemplatePart("Map Template"));
            var settings = utils_1.createMockSettings();
            fetchMock
                .post("path:/sharing/rest/content/users/casey/addItem", '{"success":true,"id":"MTP1234567890","folder":null}')
                .post("path:/sharing/rest/content/users/casey/items/MTP1234567890/update", '{"success":true,"id":"MTP1234567890"}');
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
                .then(function (createdItem) {
                expect(createdItem.itemId).toEqual("MTP1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
    });
    describe("supporting routine: get cloning order", function () {
        it("sorts an item and its dependencies 1", function () {
            var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["ghi", "def"] });
            var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
            var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
            var results = mSolution.topologicallySortItems([abc, def, ghi]);
            expect(results.length).toEqual(3);
            expect(results).toHaveOrder({ predecessor: "ghi", successor: "abc" });
            expect(results).toHaveOrder({ predecessor: "def", successor: "abc" });
        });
        it("sorts an item and its dependencies 2", function () {
            var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["ghi", "def"] });
            var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def", dependencies: ["ghi"] });
            var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
            var results = mSolution.topologicallySortItems([abc, def, ghi]);
            expect(results.length).toEqual(3);
            expect(results).toHaveOrder({ predecessor: "ghi", successor: "abc" });
            expect(results).toHaveOrder({ predecessor: "def", successor: "abc" });
            expect(results).toHaveOrder({ predecessor: "ghi", successor: "def" });
        });
        it("sorts an item and its dependencies 3", function () {
            var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["ghi"] });
            var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
            var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi", dependencies: ["def"] });
            var results = mSolution.topologicallySortItems([abc, def, ghi]);
            expect(results.length).toEqual(3);
            expect(results).toHaveOrder({ predecessor: "ghi", successor: "abc" });
            expect(results).toHaveOrder({ predecessor: "def", successor: "abc" });
            expect(results).toHaveOrder({ predecessor: "def", successor: "ghi" });
        });
        it("reports a multi-item cyclic dependency graph", function () {
            var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc", dependencies: ["ghi"] });
            var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def", dependencies: ["ghi"] });
            var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi", dependencies: ["abc"] });
            expect(function () {
                mSolution.topologicallySortItems([abc, def, ghi]);
            }).toThrowError(Error, "Cyclical dependency graph detected");
        });
        it("reports a single-item cyclic dependency graph", function () {
            var abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc" });
            var def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def", dependencies: ["def"] });
            var ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });
            expect(function () {
                mSolution.topologicallySortItems([abc, def, ghi]);
            }).toThrowError(Error, "Cyclical dependency graph detected");
        });
    });
    describe("supporting routine: remove undesirable properties", function () {
        it("remove properties", function () {
            var abc = mockItems.getAGOLItem("Web Mapping Application", "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21");
            var abcCopy = mClassifier.removeUndesirableItemProperties(abc);
            expect(abc).toEqual(mockItems.getAGOLItem("Web Mapping Application", "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21"));
            expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());
        });
        it("shallow copy if properties already removed", function () {
            var abc = mockItems.getTrimmedAGOLItem();
            var abcCopy = mClassifier.removeUndesirableItemProperties(abc);
            expect(abc).toEqual(mockItems.getTrimmedAGOLItem());
            expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());
            abcCopy.name = "Renamed item";
            expect(abc.name).toEqual("Name of an AGOL item");
        });
        it("checks for item before attempting to access its properties", function () {
            var result = mClassifier.removeUndesirableItemProperties(null);
            expect(result).toBeNull();
        });
    });
    describe("supporting routine: count relationships", function () {
        it("should handle a layer with no relationships", function () {
            var layers = [{
                    relationships: undefined
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(0);
        });
        it("should handle layers with no relationships", function () {
            var layers = [{
                    relationships: []
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(0);
        });
        it("should handle layers with no relationships", function () {
            var layers = [{
                    relationships: undefined
                }, {
                    relationships: undefined
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(0);
        });
        it("should handle layers with no relationships", function () {
            var layers = [{
                    relationships: []
                }, {
                    relationships: []
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(0);
        });
        it("should handle layers with no relationships", function () {
            var layers = [{
                    relationships: undefined
                }, {
                    relationships: []
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(0);
        });
        it("should handle a layer with relationships 1", function () {
            var layers = [{
                    relationships: [1]
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(1);
        });
        it("should handle a layer with relationships 2", function () {
            var layers = [{
                    relationships: [1, 2]
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(2);
        });
        it("should handle a layer with relationships 1", function () {
            var layers = [{
                    relationships: [1, 2, 3, 4, 5]
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(5);
        });
        it("should handle layers with relationships", function () {
            var layers = [{
                    relationships: [1, 2]
                }, {
                    relationships: [1]
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(3);
        });
        it("should handle layers with and without relationships", function () {
            var layers = [{
                    relationships: undefined
                }, {
                    relationships: [1, 2, 3]
                }];
            expect(mFeatureService.countRelationships(layers)).toEqual(3);
        });
    });
    describe("supporting routine: initializing an item template from an id", function () {
        it("should handle an unknown item type", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/unk1234567890", mockItems.getAGOLItem("Unknown"))
                .mock("path:/sharing/rest/community/groups/unk1234567890", mockItems.getAGOLItem("Unknown"));
            mClassifier.convertItemToTemplate("unk1234567890", MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle an unsupported item type", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/uns1234567890", mockItems.getAGOLItem("Unsupported"))
                .mock("path:/sharing/rest/content/items/uns1234567890/data", mockItems.getAGOLItemData())
                .mock("path:/sharing/rest/content/items/uns1234567890/resources", mockItems.getAGOLItemResources());
            mClassifier.convertItemToTemplate("uns1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                expect(response.item.type).toEqual("Unsupported");
                expect(response.data).toBeNull();
                expect(response.resources).toBeNull();
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle an item without item.item property, data section, or resources sections", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getItemWithoutItemProp())
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData())
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources());
            mClassifier.convertItemToTemplate("map1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                expect(response.item.type).toEqual("Web Map");
                expect(response.data).toBeNull();
                expect(response.resources).toBeNull();
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle an item with a problem fetching dependencies", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/grp1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/community/groups/grp1234567890", mockItems.getAGOLGroup())
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=1&num=100&token=fake-token", mockItems.get400FailureResponse());
            mClassifier.convertItemToTemplate("grp1234567890", MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle an item with a problem completing an item description 1", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            fetchMock
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.get400FailureResponse());
            mClassifier.convertItemToTemplate("svc1234567890", MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle an item with a problem completing an item description 2", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            fetchMock
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.get400FailureResponse());
            mClassifier.convertItemToTemplate("svc1234567890", MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should handle a dashboard item", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/dsh1234567890", mockItems.getAGOLItem("Dashboard"))
                .mock("path:/sharing/rest/content/items/dsh1234567890/data", mockItems.getAGOLItemData("Dashboard"))
                .mock("path:/sharing/rest/content/items/dsh1234567890/resources", mockItems.getAGOLItemResources("none"));
            mClassifier.convertItemToTemplate("dsh1234567890", MOCK_USER_REQOPTS)
                .then(function () { return done(); }, function () { return done.fail(); });
        });
        it("should handle a widgetless dashboard item", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/dsh1234567890", mockItems.getAGOLItem("Dashboard"))
                .mock("path:/sharing/rest/content/items/dsh1234567890/data", mockItems.getItemDataWidgetlessDashboard())
                .mock("path:/sharing/rest/content/items/dsh1234567890/resources", mockItems.getAGOLItemResources("none"));
            mClassifier.convertItemToTemplate("dsh1234567890", MOCK_USER_REQOPTS)
                .then(function () { return done(); }, function () { return done.fail(); });
        });
    });
    describe("supporting routine: createItemFromTemplateWhenReady ", function () {
        it("should reject a missing AGOL", function (done) {
            var settings = {};
            mSolution.createItemFromTemplateWhenReady([], MOCK_USER_REQOPTS, settings, null)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should reject an AGOL id that isn't in the current solution", function (done) {
            var settings = {};
            mSolution.createItemFromTemplateWhenReady([], MOCK_USER_REQOPTS, settings, "wma1234567890")
                .then(function () { return done.fail(); }, function () { return done(); });
        });
    });
    describe("supporting routine: finalCallback", function () {
        it("should handle successful progress update", function () {
            function progressCallback(update) {
                expect(update.processId).toEqual("key");
                expect(update.status).toEqual("done");
            }
            mCommon.finalCallback("key", true, progressCallback);
        });
        it("should handle failed progress update", function () {
            function progressCallback(update) {
                expect(update.processId).toEqual("key");
                expect(update.status).toEqual("failed");
            }
            mCommon.finalCallback("key", false, progressCallback);
        });
    });
    describe("supporting routine: timestamp", function () {
        it("should return time 19951217_0324_00000", function () {
            var date = new Date(Date.UTC(1995, 11, 17, 3, 24)); // 0-based month
            var expected = "19951217_0324_00000"; // 1-based month
            jasmine.clock().install();
            jasmine.clock().mockDate(date);
            expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
            jasmine.clock().uninstall();
        });
        it("should return time 20050601_1559_23000", function () {
            var date = new Date(Date.UTC(2005, 5, 1, 15, 59, 23)); // 0-based month
            var expected = "20050601_1559_23000"; // 1-based month
            jasmine.clock().install();
            jasmine.clock().mockDate(date);
            expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
            jasmine.clock().uninstall();
        });
        it("should return time 20050601_0204_06000", function () {
            var date = new Date(Date.UTC(2005, 5, 1, 2, 4, 6)); // 0-based month
            var expected = "20050601_0204_06000"; // 1-based month
            jasmine.clock().install();
            jasmine.clock().mockDate(date);
            expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
            jasmine.clock().uninstall();
        });
        it("should return time 20190430_2003_04005", function () {
            var date = new Date(Date.UTC(2019, 3, 30, 20, 3, 4)); // 0-based month
            var expected = "20190430_2003_04000"; // 1-based month
            jasmine.clock().install();
            jasmine.clock().mockDate(date);
            expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
            jasmine.clock().uninstall();
        });
        it("should return time 20191231_2359_59000", function () {
            var date = new Date(Date.UTC(2019, 11, 31, 23, 59, 59)); // 0-based month
            var expected = "20191231_2359_59000"; // 1-based month
            jasmine.clock().install();
            jasmine.clock().mockDate(date);
            expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
            jasmine.clock().uninstall();
        });
        it("should return time 20200101_0000_00000", function () {
            var date = new Date(Date.UTC(2020, 0, 1, 0, 0, 0)); // 0-based month
            var expected = "20200101_0000_00000"; // 1-based month
            jasmine.clock().install();
            jasmine.clock().mockDate(date);
            expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
            jasmine.clock().uninstall();
        });
    });
    describe("supporting routine: doCommonTemplatizations", function () {
        it("should handle provided extent", function () {
            var templatePart = mockSolutions.getTemplatePartNoData("Dashboard");
            templatePart.item.extent = [
                [-8589300.590117617, 40.36926825227528],
                [-73.96624645399964, 4722244.554455302]
            ];
            mCommon.doCommonTemplatizations(templatePart);
            expect(templatePart.item.extent).not.toBeNull();
            expect(templatePart.item.extent).toEqual("{{initiative.extent:optional}}");
        });
        it("should handle missing extent", function () {
            var template = mockSolutions.getTemplatePartNoExtent("Dashboard");
            mCommon.doCommonTemplatizations(template);
            expect(template.item.extent).toBeNull();
        });
    });
    describe("supporting routine: getWebmapLayerIds", function () {
        it("should handle missing layer list", function () {
            var ids = mWebMap.getWebmapLayerIds();
            expect(Array.isArray(ids)).toBeTruthy();
            expect(ids.length).toEqual(0);
        });
        it("should handle missing itemId in layer in layer list", function () {
            var ids = mWebMap.getWebmapLayerIds([{
                    itemId: "a"
                }, {
                    itemId: "b"
                }, {
                    somethingElse: "c"
                }, {
                    itemId: "d"
                }]);
            expect(ids).toEqual(["a", "b", "d"]);
        });
    });
    describe("supporting routine: templatizeWebmapLayerIdsAndUrls", function () {
        it("should handle missing layer list", function () {
            expect(mWebMap.templatizeWebmapLayerIdsAndUrls).not.toThrowError();
        });
    });
    describe("supporting routine: templatizeList", function () {
        it("should handle default parameter", function () {
            var ids = ["abc", "def", "ghi"];
            var expectedTemplatized = ["{{abc.id}}", "{{def.id}}", "{{ghi.id}}"];
            var templatized = mCommon.templatizeList(ids);
            expect(templatized).toEqual(expectedTemplatized);
        });
        it("should handle custom parameter", function () {
            var ids = ["abc", "def", "ghi"];
            var expectedTemplatized = ["{{abc.url}}", "{{def.url}}", "{{ghi.url}}"];
            var templatized = mCommon.templatizeList(ids, "url");
            expect(templatized).toEqual(expectedTemplatized);
        });
        it("should handle empty list", function () {
            var ids = [];
            var expectedTemplatized = [];
            var templatized1 = mCommon.templatizeList(ids);
            expect(templatized1).toEqual(expectedTemplatized);
            var templatized2 = mCommon.templatizeList(ids, "url");
            expect(templatized2).toEqual(expectedTemplatized);
        });
    });
    describe("supporting routine: getGroupContentsTranche", function () {
        it("should handle single tranche", function (done) {
            var pagingRequest = tslib_1.__assign({ paging: {
                    start: 1,
                    num: 5
                } }, MOCK_USER_REQOPTS);
            fetchMock
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=1&num=" + pagingRequest.paging.num + "&token=fake-token", '{"total":0,"start":1,"num":5,"nextStart":-1,"items":[' +
                '{"id":"dsh1234567980", "owner":"fayard"},' +
                '{"id":"map1234567980", "owner":"fred"},' +
                '{"id":"svc1234567980", "owner":"cyd"},' +
                '{"id":"wma1234567980", "owner":"ginger"},' +
                '{"id":"wrk1234567980", "owner":"harold"}' +
                ']}');
            mGroup.getGroupContentsTranche("grp1234567890", pagingRequest)
                .then(function (contents) {
                expect(contents)
                    .toEqual(["dsh1234567980", "map1234567980", "svc1234567980", "wma1234567980", "wrk1234567980"]);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle two tranches", function (done) {
            var pagingRequest = tslib_1.__assign({ paging: {
                    start: 1,
                    num: 3
                } }, MOCK_USER_REQOPTS);
            fetchMock
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=1&num=" + pagingRequest.paging.num + "&token=fake-token", '{"total":0,"start":1,"num":3,"nextStart":4,"items":[' +
                '{"id":"dsh1234567980", "owner":"fayard"},' +
                '{"id":"map1234567980", "owner":"fred"},' +
                '{"id":"svc1234567980", "owner":"cyd"}' +
                ']}')
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=4&num=" + pagingRequest.paging.num + "&token=fake-token", '{"total":0,"start":4,"num":2,"nextStart":-1,"items":[' +
                '{"id":"wma1234567980", "owner":"ginger"},' +
                '{"id":"wrk1234567980", "owner":"harold"}' +
                ']}');
            mGroup.getGroupContentsTranche("grp1234567890", pagingRequest)
                .then(function (contents) {
                expect(contents)
                    .toEqual(["dsh1234567980", "map1234567980", "svc1234567980", "wma1234567980", "wrk1234567980"]);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle three tranches", function (done) {
            var pagingRequest = tslib_1.__assign({ paging: {
                    start: 1,
                    num: 2
                } }, MOCK_USER_REQOPTS);
            fetchMock
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=1&num=" + pagingRequest.paging.num + "&token=fake-token", '{"total":0,"start":1,"num":2,"nextStart":3,"items":[' +
                '{"id":"dsh1234567980", "owner":"fayard"},' +
                '{"id":"map1234567980", "owner":"fred"}' +
                ']}')
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=3&num=" + pagingRequest.paging.num + "&token=fake-token", '{"total":0,"start":3,"num":2,"nextStart":5,"items":[' +
                '{"id":"svc1234567980", "owner":"cyd"},' +
                '{"id":"wma1234567980", "owner":"ginger"}' +
                ']}')
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=5&num=" + pagingRequest.paging.num + "&token=fake-token", '{"total":0,"start":5,"num":1,"nextStart":-1,"items":[' +
                '{"id":"wrk1234567980", "owner":"harold"}' +
                ']}');
            mGroup.getGroupContentsTranche("grp1234567890", pagingRequest)
                .then(function (contents) {
                expect(contents)
                    .toEqual(["dsh1234567980", "map1234567980", "svc1234567980", "wma1234567980", "wrk1234567980"]);
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle a failure to get a tranche", function (done) {
            var pagingRequest = tslib_1.__assign({ paging: {
                    start: 1,
                    num: 2
                } }, MOCK_USER_REQOPTS);
            fetchMock
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=1&num=" + pagingRequest.paging.num + "&token=fake-token", '{"total":0,"start":1,"num":2,"nextStart":3,"items":[' +
                '{"id":"dsh1234567980", "owner":"fayard"},' +
                '{"id":"map1234567980", "owner":"fred"}' +
                ']}')
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=3&num=" + pagingRequest.paging.num + "&token=fake-token", mockItems.get400Failure());
            mGroup.getGroupContentsTranche("grp1234567890", pagingRequest)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
    });
    describe("supporting routine: get estimated deployment cost", function () {
        it("should handle empty solution", function () {
            var cost = mSolution.getEstimatedDeploymentCost([]);
            expect(cost).toEqual(0);
        });
        it("should handle solution with items 1", function () {
            var cost = mSolution.getEstimatedDeploymentCost(mockSolutions.getWebMappingApplicationTemplate());
            expect(cost).toEqual(4 + // Web Mapping Application
                4 + // Web Map
                7 // Feature Service
            );
        });
        it("should handle solution with items 2", function () {
            var solution = mockSolutions.getWebMappingApplicationTemplate();
            solution[1].estimatedDeploymentCostFactor = undefined;
            var cost = mSolution.getEstimatedDeploymentCost(solution);
            expect(cost).toEqual(4 + // Web Mapping Application
                3 + // Web Map
                7 // Feature Service
            );
        });
    });
    describe("supporting routine: add members to cloned group", function () {
        it("should handle empty group", function (done) {
            var group = mockSolutions.getGroupTemplatePart();
            mGroup.addGroupMembers(group, MOCK_USER_REQOPTS)
                .then(function () { return done(); }, function (error) { return done.fail(error); });
        });
        it("should handle failure to add to Group", function (done) {
            var group = mockSolutions.getGroupTemplatePart(["map1234567890"]);
            fetchMock
                .mock('path:/sharing/rest/community/users/casey', '{"username":"casey","id":"grp1234567890"}')
                .post('path:/sharing/rest/search', '{"query":"id: map1234567890 AND group: grp1234567890",' +
                '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}')
                .mock('path:/sharing/rest/community/groups/grp1234567890', '{"id":"grp1234567890","title":"My group","owner":"casey",' +
                '"userMembership":{"username":"casey","memberType":"owner","applications":0}}')
                .post('path:/sharing/rest/content/users/casey/items/map1234567890/share', mockItems.get400Failure());
            mGroup.addGroupMembers(group, MOCK_USER_REQOPTS)
                .then(function () { return done.fail(); }, function () { return done(); });
        });
        it("should add an item to a group", function (done) {
            var group = mockSolutions.getGroupTemplatePart(["map1234567890"]);
            function progressCallback(update) {
                expect(update.processId).toEqual(group.key);
            }
            ;
            fetchMock
                .mock('path:/sharing/rest/community/users/casey', '{"username":"casey","id":"grp1234567890"}')
                .post('path:/sharing/rest/search', '{"query":"id: map1234567890 AND group: grp1234567890",' +
                '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}')
                .mock('path:/sharing/rest/community/groups/grp1234567890', '{"id":"grp1234567890","title":"My group","owner":"casey",' +
                '"userMembership":{"username":"casey","memberType":"owner","applications":0}}')
                .post('path:/sharing/rest/content/users/casey/items/map1234567890/share', '{"notSharedWith":[],"itemId":"map1234567890"}');
            mGroup.addGroupMembers(group, MOCK_USER_REQOPTS, progressCallback)
                .then(function () { return done(); }, function (error) { return done.fail(error); });
        });
    });
    describe("successful fetches", function () {
        it("should return a list of WMA details for a valid AGOL id", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mSolution.createSolutionTemplate("wma1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                expect(response.length).toEqual(3);
                var itemTemplate = response[0];
                expect(itemTemplate.type).toEqual("Web Mapping Application");
                expect(itemTemplate.item.title).toEqual("An AGOL item");
                expect(itemTemplate.data.source).toEqual("tpl1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should return a list of WMA details for a valid AGOL id in a list", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mSolution.createSolutionTemplate(["wma1234567890"], MOCK_USER_REQOPTS)
                .then(function (response) {
                expect(response.length).toEqual(3);
                var itemTemplate = response[0];
                expect(itemTemplate.type).toEqual("Web Mapping Application");
                expect(itemTemplate.item.title).toEqual("An AGOL item");
                expect(itemTemplate.data.source).toEqual("tpl1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should return a list of WMA details for a valid AGOL id in a list with more than one id", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mSolution.createSolutionTemplate(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
                .then(function (response) {
                expect(response.length).toEqual(3);
                var itemTemplate = response[0];
                expect(itemTemplate.type).toEqual("Web Mapping Application");
                expect(itemTemplate.item.title).toEqual("An AGOL item");
                expect(itemTemplate.data.source).toEqual("tpl1234567890");
                done();
            }, function (error) { return done.fail(error); });
        });
        it("should handle repeat calls without re-fetching items", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]));
            mSolution.createSolutionTemplate("wma1234567890", MOCK_USER_REQOPTS)
                .then(function (response) {
                expect(response.length).toEqual(3);
                expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);
                mSolution.createSolutionTemplate("wma1234567890", MOCK_USER_REQOPTS, response)
                    .then(function (response2) {
                    expect(response2.length).toEqual(3); // unchanged
                    expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);
                    expect(response2).toEqual(response);
                    done();
                }, function (error) { return done.fail(error); });
            }, function (error) { return done.fail(error); });
        });
    });
    describe("catch bad input", function () {
        it("returns an error if the hierarchy to be created fails: missing id", function (done) {
            fetchMock.once("*", mockItems.getAGOLItem());
            mSolution.createSolutionTemplate(null, MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("returns an error if the hierarchy to be created fails: missing id", function (done) {
            fetchMock.once("*", mockItems.getAGOLItem());
            mSolution.createSolutionTemplate(null, MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("returns an error if the hierarchy to be created fails: empty id list", function (done) {
            fetchMock.once("*", mockItems.getAGOLItem());
            mSolution.createSolutionTemplate([], MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("returns an error if the hierarchy to be created fails: missing id in list", function (done) {
            fetchMock.once("*", mockItems.getAGOLItem());
            mSolution.createSolutionTemplate([null], MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
    });
    describe("failed fetches", function () {
        it("returns an error if the hierarchy to be created fails: inaccessible", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
            mSolution.createSolutionTemplate("fail1234567890", MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("returns an error if the hierarchy to be created fails: inaccessible in a list", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
            mSolution.createSolutionTemplate(["fail1234567890"], MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        // Displays
        // Unmatched GET to https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890?f=json&token=fake-token
        // because fetch order is root items wma1234567890, fail1234567890 followed by the first's dependencies.
        // Promise.all catches failure of fail1234567890 and returns from function before any dependency is resolved.
        it("returns an error if the hierarchy to be created fails: list of [valid, inaccessible]", function (done) {
            var baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
                .post(baseSvcURL + "FeatureServer?f=json", mockItems.getAGOLService([mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")], [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]))
                .post(baseSvcURL + "FeatureServer/0?f=json", mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")]))
                .post(baseSvcURL + "FeatureServer/1?f=json", mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")]))
                .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
            mSolution.createSolutionTemplate(["wma1234567890", "fail1234567890"], MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("returns an error if the hierarchy to be created fails: list of [valid, missing id]", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
            mSolution.createSolutionTemplate(["wma1234567890", null], MOCK_USER_REQOPTS)
                .then(fail, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
    });
    describe("catch inability to get dependents", function () {
        it("returns an error if getting group dependencies fails", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/grp1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/community/groups/grp1234567890", mockItems.getAGOLGroup())
                .mock("https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
                "?f=json&start=1&num=100&token=fake-token", mockItems.get400Failure());
            mSolution.createSolutionTemplate(["grp1234567890"], MOCK_USER_REQOPTS)
                .then(function () {
                done.fail();
            }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
        it("returns an error if a non-group dependency fails", function (done) {
            fetchMock
                .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
                .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
                .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
                .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/community/groups/svc1234567890", mockItems.getAGOLItem())
                .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
            mSolution.createSolutionTemplate(["wma1234567890"], MOCK_USER_REQOPTS)
                .then(function () {
                done.fail();
            }, function (error) {
                expect(error).toEqual(mockUtils.ArcgisRestSuccessFail);
                done();
            });
        });
    });
    describe("supporting routine: get template from template bundle", function () {
        it("empty bundle", function () {
            var bundle = [];
            var idToFind = "abc123";
            var replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi456" });
            expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeFalsy();
            expect(bundle.length).toEqual(0);
        });
        it("item not in bundle", function () {
            var placeholderTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "xyz098" });
            var bundle = [placeholderTemplate];
            var idToFind = "abc123";
            var replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi456" });
            expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeFalsy();
            expect(bundle.length).toEqual(1);
            expect(bundle[0].itemId).toEqual(placeholderTemplate.itemId);
        });
        it("item in bundle", function () {
            var placeholderTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "xyz098" });
            var bundle = [placeholderTemplate];
            var idToFind = "xyz098";
            var replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi456" });
            expect(mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)).toBeTruthy();
            expect(bundle.length).toEqual(1);
            expect(bundle[0].itemId).toEqual(replacementTemplate.itemId);
        });
    });
});
//# sourceMappingURL=solution.test.js.map