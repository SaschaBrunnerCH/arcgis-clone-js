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
import * as mockItems from "./agolItems";
import * as mockServices from "./featureServices";
// -- Exports -------------------------------------------------------------------------------------------------------//
export function getItemSolutionPart(type, dependencies, url) {
    if (dependencies === void 0) { dependencies = []; }
    if (url === void 0) { url = ""; }
    var solutionPart = null;
    // Supported item types
    switch (type) {
        case "ArcGIS Pro Add In":
            break;
        case "Code Attachment":
            break;
        case "Code Sample":
            break;
        case "Dashboard":
            solutionPart = getItemSolutionFundamentals(type, "dsh", dependencies, url);
            solutionPart.data = mockItems.getAGOLItemData(type);
            solutionPart.resources = null;
            break;
        case "Desktop Add In":
            break;
        case "Desktop Application Template":
            break;
        case "Document Link":
            break;
        case "Feature Collection":
            break;
        case "Feature Service":
            solutionPart = getItemSolutionFundamentals(type, "svc", dependencies, url ||
                "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer");
            solutionPart.item.url = url ||
                "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
            solutionPart.data = mockItems.getAGOLItemData(type);
            solutionPart.resources = null;
            var layer0 = mockServices.removeEditFieldsInfoField(mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer", [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]));
            var table1 = mockServices.removeEditFieldsInfoField(mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table", [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]));
            var properties = {
                service: mockServices.getService([layer0], [table1]),
                layers: [layer0],
                tables: [table1]
            };
            properties.service.name = solutionPart.item.name;
            properties.service.snippet = solutionPart.item.snippet;
            properties.service.description = solutionPart.item.description;
            solutionPart.properties = properties;
            break;
        case "Form":
            break;
        case "Geoprocessing Package":
            break;
        case "Geoprocessing Sample":
            break;
        case "Layer Package":
            break;
        case "Map Template": // //??? temporary definition
            solutionPart = getItemSolutionFundamentals(type, "mtp", dependencies, url);
            solutionPart.resources = null;
            break;
        case "Operation View":
            break;
        case "Pro Map":
            break;
        case "Project Package":
            break;
        case "Project Template":
            break;
        case "Web Map":
            solutionPart = getItemSolutionFundamentals(type, "map", dependencies, url);
            solutionPart.data = mockItems.getAGOLItemData(type);
            solutionPart.resources = null;
            break;
        case "Web Mapping Application":
            solutionPart = getItemSolutionFundamentals(type, "wma", dependencies, url || "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21");
            solutionPart.data = mockItems.getAGOLItemData(type);
            solutionPart.resources = null;
            break;
        case "Workforce Project":
            break;
        default:
            fail("Unsupported solution item type");
            break;
    }
    return solutionPart;
}
export function getDashboardSolutionPartNoWidgets() {
    var solutionPart = getItemSolutionPart("Dashboard");
    solutionPart.data.widgets = [];
    return solutionPart;
}
export function getDashboardSolutionPartNoData() {
    var solutionPart = getItemSolutionPart("Dashboard");
    solutionPart.data = null;
    return solutionPart;
}
export function getFeatureServiceSolutionPartNoRelationships() {
    var solutionPart = getItemSolutionPart("Feature Service");
    solutionPart.properties.layers[0].relationships = [];
    solutionPart.properties.tables[0].relationships = [];
    return solutionPart;
}
export function getGroupSolutionPart(dependencies) {
    if (dependencies === void 0) { dependencies = []; }
    return {
        "itemId": "grp1234567890",
        "type": "Group",
        "key": "i1a2b3c4",
        "item": {
            "id": "grp1234567890",
            "title": "An AGOL group",
            "isInvitationOnly": true,
            "description": "Description of an AGOL group",
            "snippet": "Snippet of an AGOL group",
            "typeKeywords": ["JavaScript"],
            "phone": null,
            "sortField": "title",
            "sortOrder": "asc",
            "isViewOnly": true,
            "thumbnail": "ROWPermitManager.png",
            "access": "public",
            "capabilities": [],
            "isFav": false,
            "isReadOnly": false,
            "protected": false,
            "autoJoin": false,
            "notificationsEnabled": false,
            "provider": null,
            "providerGroupName": null,
            "userMembership": {
                "username": "ArcGISTeamLocalGovOrg",
                "memberType": "none"
            },
            "collaborationInfo": {}
        },
        "dependencies": dependencies
    };
}
export function getWebMappingApplicationSolution() {
    var solution = [
        getItemSolutionPart("Web Mapping Application", ["map1234567890"], "https://arcgis.com/apps/CrowdsourcePolling/index.html?appid="),
        getItemSolutionPart("Web Map", ["svc1234567890"], "https://arcgis.com/home/webmap/viewer.html?webmap="),
        getItemSolutionPart("Feature Service", [])
    ];
    return solution;
}
// -- Internals ------------------------------------------------------------------------------------------------------//
function getItemSolutionFundamentals(type, typePrefix, dependencies, url) {
    if (dependencies === void 0) { dependencies = []; }
    if (url === void 0) { url = ""; }
    return {
        "itemId": typePrefix + "1234567890",
        "type": type,
        "key": "i1a2b3c4",
        "item": {
            "id": typePrefix + "1234567890",
            "item": typePrefix + "1234567890",
            "name": "Name of an AGOL item",
            "title": "An AGOL item",
            "type": type,
            "typeKeywords": ["JavaScript"],
            "description": "Description of an AGOL item",
            "tags": ["test"],
            "snippet": "Snippet of an AGOL item",
            "thumbnail": "thumbnail/ago_downloaded.png",
            "documentation": null,
            "extent": [],
            "categories": [],
            "spatialReference": null,
            "accessInformation": "Esri, Inc.",
            "licenseInfo": null,
            "culture": "en-us",
            "properties": null,
            "url": url,
            "proxyFilter": null,
            "access": "public",
            "appCategories": [],
            "industries": [],
            "languages": [],
            "largeThumbnail": null,
            "banner": null,
            "screenshots": [],
            "listed": false,
            "commentsEnabled": false,
            "groupDesignations": null
        },
        "dependencies": dependencies
    };
}
//# sourceMappingURL=solutions.js.map