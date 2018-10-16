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
        define(["require", "exports", "fetch-mock", "./customMatchers", "../src/solution", "../src/agolItem", "@esri/arcgis-rest-auth", "./lib/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fetchMock = require("fetch-mock");
    var customMatchers_1 = require("./customMatchers");
    var solution_1 = require("../src/solution");
    var agolItem_1 = require("../src/agolItem");
    var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
    var utils_1 = require("./lib/utils");
    describe("supporting Solution item", function () {
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
        beforeEach(function () {
            jasmine.addMatchers(customMatchers_1.CustomMatchers);
        });
        afterEach(function () {
            fetchMock.restore();
        });
        it("sorts an item and its dependencies 1", function () {
            var abc = new agolItem_1.AgolItem({});
            var def = new agolItem_1.AgolItem({});
            var ghi = new agolItem_1.AgolItem({});
            abc.dependencies = ["ghi", "def"];
            var results = solution_1.Solution.topologicallySortItems({
                "abc": abc,
                "def": def,
                "ghi": ghi,
            });
            expect(results.length).toEqual(3);
            expect(results).toHaveOrder({ predecessor: "ghi", successor: "abc" });
            expect(results).toHaveOrder({ predecessor: "def", successor: "abc" });
        });
        it("sorts an item and its dependencies 2", function () {
            var abc = new agolItem_1.AgolItem({});
            var def = new agolItem_1.AgolItem({});
            var ghi = new agolItem_1.AgolItem({});
            abc.dependencies = ["ghi", "def"];
            def.dependencies = ["ghi"];
            var results = solution_1.Solution.topologicallySortItems({
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
            var abc = new agolItem_1.AgolItem({});
            var def = new agolItem_1.AgolItem({});
            var ghi = new agolItem_1.AgolItem({});
            abc.dependencies = ["ghi"];
            ghi.dependencies = ["def"];
            var results = solution_1.Solution.topologicallySortItems({
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
            var abc = new agolItem_1.AgolItem({});
            var def = new agolItem_1.AgolItem({});
            var ghi = new agolItem_1.AgolItem({});
            abc.dependencies = ["ghi"];
            def.dependencies = ["ghi"];
            ghi.dependencies = ["abc"];
            expect(function () {
                var results = solution_1.Solution.topologicallySortItems({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                });
            }).toThrowError(Error, "Cyclical dependency graph detected");
        });
        it("reports a single-item cyclic dependency graph", function () {
            var abc = new agolItem_1.AgolItem({});
            var def = new agolItem_1.AgolItem({});
            var ghi = new agolItem_1.AgolItem({});
            def.dependencies = ["def"];
            expect(function () {
                var results = solution_1.Solution.topologicallySortItems({
                    "abc": abc,
                    "def": def,
                    "ghi": ghi,
                });
            }).toThrowError(Error, "Cyclical dependency graph detected");
        });
    });
});
//# sourceMappingURL=solution.test.js.map