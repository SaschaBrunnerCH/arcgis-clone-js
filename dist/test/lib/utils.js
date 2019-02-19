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
var arcgis_rest_auth_1 = require("@esri/arcgis-rest-auth");
// -------------------------------------------------------------------------------------------------------------------//
var orgUrl = "https://myOrg.maps.arcgis.com";
var portalUrl = "https://www.arcgis.com";
exports.TOMORROW = (function () {
    var now = new Date();
    now.setDate(now.getDate() + 1);
    return now;
})();
exports.YESTERDAY = (function () {
    var now = new Date();
    now.setDate(now.getDate() - 1);
    return now;
})();
exports.ArcgisRestSuccessFail = {
    success: false
};
function setMockDateTime(now) {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(now));
    return now;
}
exports.setMockDateTime = setMockDateTime;
function createRuntimeMockUserSession(now) {
    var tomorrow = new Date(now + 86400000);
    return new arcgis_rest_auth_1.UserSession({
        clientId: "clientId",
        redirectUri: "https://example-app.com/redirect-uri",
        token: "fake-token",
        tokenExpires: tomorrow,
        refreshToken: "refreshToken",
        refreshTokenExpires: tomorrow,
        refreshTokenTTL: 1440,
        username: "casey",
        password: "123456",
        portal: "https://myorg.maps.arcgis.com/sharing/rest"
    });
}
exports.createRuntimeMockUserSession = createRuntimeMockUserSession;
function createMockSettings(solutionName, folderId, access) {
    if (solutionName === void 0) { solutionName = ""; }
    if (folderId === void 0) { folderId = null; }
    if (access === void 0) { access = "private"; }
    var settings = {
        organization: {
            orgUrl: orgUrl,
            portalBaseUrl: portalUrl
        },
        solutionName: solutionName,
        folderId: folderId,
        access: access
    };
    return settings;
}
exports.createMockSettings = createMockSettings;
function jsonClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.jsonClone = jsonClone;
function removeItemFcns(templates) {
    if (templates) {
        if (Array.isArray(templates)) {
            templates.forEach(function (template) {
                delete template.fcns;
            });
        }
        else {
            delete templates.fcns;
        }
    }
}
exports.removeItemFcns = removeItemFcns;
function removeNameField(layerOrTable) {
    layerOrTable.name = null;
    return layerOrTable;
}
exports.removeNameField = removeNameField;
//# sourceMappingURL=utils.js.map