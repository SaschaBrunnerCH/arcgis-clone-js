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
        define(["require", "exports", "tslib", "fetch-mock", "./customMatchers", "../src/solution", "@esri/arcgis-rest-auth", "./lib/utils", "./mocks/fullItemQueries"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var fetchMock = require("fetch-mock");
    var customMatchers_1 = require("./customMatchers");
    var solution = require("../src/solution");
    var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
    var utils_1 = require("./lib/utils");
    var fullItemQueries_1 = require("./mocks/fullItemQueries");
    //--------------------------------------------------------------------------------------------------------------------//
    describe("Module `solution`: generation, publication, and cloning of a solution item", function () {
        var MOCK_ITEM_PROTOTYPE = {
            type: "",
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
        beforeEach(function () {
            jasmine.addMatchers(customMatchers_1.CustomMatchers);
        });
        afterEach(function () {
            fetchMock.restore();
        });
        describe("supporting routine: get cloning order", function () {
            it("sorts an item and its dependencies 1", function () {
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.dependencies = ["ghi", "def"];
                var results = solution.topologicallySortItems({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                });
                expect(results.length).toEqual(3);
                expect(results).toHaveOrder({ predecessor: "ghi", successor: "abc" });
                expect(results).toHaveOrder({ predecessor: "def", successor: "abc" });
            });
            it("sorts an item and its dependencies 2", function () {
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.dependencies = ["ghi", "def"];
                def.dependencies = ["ghi"];
                var results = solution.topologicallySortItems({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                });
                expect(results.length).toEqual(3);
                expect(results).toHaveOrder({ predecessor: "ghi", successor: "abc" });
                expect(results).toHaveOrder({ predecessor: "def", successor: "abc" });
                expect(results).toHaveOrder({ predecessor: "ghi", successor: "def" });
            });
            it("sorts an item and its dependencies 3", function () {
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.dependencies = ["ghi"];
                ghi.dependencies = ["def"];
                var results = solution.topologicallySortItems({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                });
                expect(results.length).toEqual(3);
                expect(results).toHaveOrder({ predecessor: "ghi", successor: "abc" });
                expect(results).toHaveOrder({ predecessor: "def", successor: "abc" });
                expect(results).toHaveOrder({ predecessor: "def", successor: "ghi" });
            });
            it("reports a multi-item cyclic dependency graph", function () {
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                abc.dependencies = ["ghi"];
                def.dependencies = ["ghi"];
                ghi.dependencies = ["abc"];
                expect(function () {
                    var results = solution.topologicallySortItems({
                        "abc": abc,
                        "def": def,
                        "ghi": ghi,
                    });
                }).toThrowError(Error, "Cyclical dependency graph detected");
            });
            it("reports a single-item cyclic dependency graph", function () {
                var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var def = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                var ghi = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
                def.dependencies = ["def"];
                expect(function () {
                    var results = solution.topologicallySortItems({
                        "abc": abc,
                        "def": def,
                        "ghi": ghi,
                    });
                }).toThrowError(Error, "Cyclical dependency graph detected");
            });
        });
        describe("supporting routine: remove undesirable properties", function () {
            it("remove properties", function () {
                var abc = tslib_1.__assign({}, fullItemQueries_1.ItemSuccessResponseWMA);
                var abcCopy = solution.removeUndesirableItemProperties(abc);
                expect(abc).toEqual(fullItemQueries_1.ItemSuccessResponseWMA);
                expect(abcCopy).toEqual(fullItemQueries_1.ItemSuccessResponseWMAWithoutUndesirableProps);
            });
            it("shallow copy if properties already removed", function () {
                var abc = tslib_1.__assign({}, fullItemQueries_1.ItemSuccessResponseWMAWithoutUndesirableProps);
                var abcCopy = solution.removeUndesirableItemProperties(abc);
                expect(abc).toEqual(fullItemQueries_1.ItemSuccessResponseWMAWithoutUndesirableProps);
                expect(abcCopy).toEqual(fullItemQueries_1.ItemSuccessResponseWMAWithoutUndesirableProps);
                abcCopy.id = "WMA123";
                expect(abc.id).toEqual("wma1234567890");
            });
            it("checks for item before attempting to access its properties", function () {
                var result = solution.removeUndesirableItemProperties(null);
                expect(result).toBeNull();
            });
        });
        describe("supporting routine: timestamp", function () {
            it("should return time 1541440408000", function () {
                var expected = 1541440408000;
                jasmine.clock().install();
                jasmine.clock().mockDate(new Date(expected));
                expect(solution.getTimestamp()).toEqual(expected.toString());
                jasmine.clock().uninstall();
            });
        });
        describe("supporting routine: update WMA URL", function () {
            var orgSession = {
                orgUrl: "https://myOrg.maps.arcgis.com",
                portalUrl: "https://www.arcgis.com",
                authentication: MOCK_USER_SESSION
            };
            var abc = tslib_1.__assign({}, MOCK_ITEM_PROTOTYPE);
            abc.item = tslib_1.__assign({}, fullItemQueries_1.ItemSuccessResponseWMA);
            abc.item.url = solution.aPlaceholderServerName + "/apps/CrowdsourcePolling/index.html?appid=";
            it("success", function (done) {
                fetchMock
                    .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/wma1234567890/update", '{"success":true,"id":"wma1234567890"}');
                solution.updateWebMappingApplicationURL(abc, orgSession)
                    .then(function (response) {
                    expect(response).toEqual("wma1234567890");
                    done();
                });
            });
            it("failure", function (done) {
                fetchMock
                    .post("https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/wma1234567890/update", "Unable to update web mapping app: wma1234567890");
                solution.updateWebMappingApplicationURL(abc, orgSession)
                    .then(fail, function (error) {
                    expect(error).toEqual("Unable to update web mapping app: wma1234567890");
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=solution.test.js.map