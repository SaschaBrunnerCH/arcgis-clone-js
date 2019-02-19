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
// This file contains examples of items of the type one would expect to get from the AGOL REST API.
// -- Exports -------------------------------------------------------------------------------------------------------//
function get200Failure() {
    return {
        "success": false
    };
}
exports.get200Failure = get200Failure;
function get400Failure() {
    return {
        "error": {
            "code": 400,
            "messageCode": "CONT_0001",
            "message": "Item does not exist or is inaccessible.",
            "details": []
        }
    };
}
exports.get400Failure = get400Failure;
function get400FailureResponse() {
    return {
        "name": "",
        "message": "400: Item or group does not exist or is inaccessible: fail1234567890",
        "originalMessage": "",
        "code": 400,
        "response": {
            "error": {
                "code": 400,
                "message": "Item or group does not exist or is inaccessible: fail1234567890",
                "details": [
                    "Item or group does not exist or is inaccessible: fail1234567890"
                ]
            }
        },
        "url": "",
        "options": null
    };
}
exports.get400FailureResponse = get400FailureResponse;
function getAGOLItem(type, url) {
    if (url === void 0) { url = ""; }
    var item = get400FailureResponse();
    // Supported item types
    switch (type) {
        case "ArcGIS Pro Add In":
            break;
        case "Code Attachment":
            break;
        case "Code Sample":
            break;
        case "Dashboard":
            item = getAGOLItemFundamentals(type, "dsh", url || null);
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
            item = getAGOLItemFundamentals(type, "svc", url ||
                "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer");
            break;
        case "Form":
            break;
        case "Geoprocessing Package":
            break;
        case "Geoprocessing Sample":
            break;
        case "Layer Package":
            break;
        case "Map Template":
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
            item = getAGOLItemFundamentals(type, "map", url || null);
            break;
        case "Web Mapping Application":
            item = getAGOLItemFundamentals(type, "wma", url || "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=wma1234567890");
            break;
        case "Workforce Project":
            break;
        case "Unsupported":
            item = getAGOLItemFundamentals(type, "uns");
            break;
    }
    return item;
}
exports.getAGOLItem = getAGOLItem;
function getSolutionItem() {
    return getAGOLItemFundamentals("Solution", "sol");
}
exports.getSolutionItem = getSolutionItem;
function getItemWithoutItemProp() {
    var agolItem = getAGOLItem("Web Map");
    delete agolItem.item;
    return agolItem;
}
exports.getItemWithoutItemProp = getItemWithoutItemProp;
function getTrimmedAGOLItem() {
    var item = getAGOLItemFundamentals("Web Mapping Application", "wma", "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21");
    delete item.avgRating;
    delete item.created;
    delete item.guid;
    delete item.lastModified;
    delete item.modified;
    delete item.numComments;
    delete item.numRatings;
    delete item.numViews;
    delete item.orgId;
    delete item.owner;
    delete item.scoreCompleteness;
    delete item.size;
    delete item.uploaded;
    return item;
}
exports.getTrimmedAGOLItem = getTrimmedAGOLItem;
function getNoNameAGOLFeatureServiceItem() {
    var item = getAGOLItem("Feature Service");
    item.name = null;
    return item;
}
exports.getNoNameAGOLFeatureServiceItem = getNoNameAGOLFeatureServiceItem;
function getAGOLItemData(type) {
    var data = get400Failure();
    // Supported item types
    switch (type) {
        case "ArcGIS Pro Add In":
            break;
        case "Code Attachment":
            break;
        case "Code Sample":
            break;
        case "Dashboard":
            data = {
                "version": 24,
                "layout": {
                    "rootElement": {
                        "type": "stackLayoutElement",
                        "orientation": "col",
                        "elements": []
                    }
                },
                "headerPanel": {
                    "type": "headerPanel"
                },
                "leftPanel": {
                    "type": "leftPanel",
                    "title": "<p>left panel description</p>\n",
                    "selectors": []
                },
                "widgets": [{
                        "showNavigation": true,
                        "events": [],
                        "flashRepeats": 3,
                        "itemId": "map1234567890",
                        "mapTools": [{
                                "type": "bookmarksTool"
                            }],
                        "type": "mapWidget",
                        "showPopup": true,
                        "layers": [{
                                "type": "featureLayerDataSource",
                                "layerId": "ROWPermitApplication_4605",
                                "name": "ROW Permits"
                            }],
                        "id": "1200f3f1-8f72-4ea6-af16-14f19e9a4517",
                        "name": "ROW Permit Map"
                    },
                    {
                        "type": "indicatorWidget",
                        "id": "3e796f16-722b-437f-89a4-e3787e105b24",
                        "name": "ROW Permit Count"
                    },
                    {
                        "type": "listWidget",
                        "id": "0f994268-e553-4d11-b8d1-afecf0818841",
                        "name": "ROW Permit List"
                    },
                    {
                        "type": "serialChartWidget",
                        "id": "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4",
                        "name": "Permit Type"
                    },
                    {
                        "type": "serialChartWidget",
                        "id": "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
                        "name": "Submission Date"
                    }
                ],
                "settings": {
                    "maxPaginationRecords": 50000
                },
                "theme": "light"
            };
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
            data = {
                "tables": [{
                        "id": 1,
                        "popupInfo": {
                            "title": "table 1"
                        }
                    }],
                "layers": [{
                        "id": 0,
                        "popupInfo": {
                            "title": "layer 0"
                        },
                        "layerDefinition": {
                            "defaultVisibility": true
                        }
                    }]
            };
            break;
        case "Form":
            break;
        case "Geoprocessing Package":
            break;
        case "Geoprocessing Sample":
            break;
        case "Layer Package":
            break;
        case "Map Template":
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
            data = {
                "operationalLayers": [{
                        "id": "ROWPermitApplication_4605",
                        "layerType": "ArcGISFeatureLayer",
                        "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/" +
                            "ROWPermits_publiccomment/FeatureServer/0",
                        "title": "ROW Permits",
                        "itemId": "svc1234567890",
                        "popupInfo": {},
                        "capabilities": "Query"
                    }],
                "baseMap": {
                    "baseMapLayers": [{
                            "id": "World_Hillshade_3689",
                            "layerType": "ArcGISTiledMapServiceLayer",
                            "url": "http://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
                            "title": "World Hillshade"
                        }, {
                            "id": "VectorTile_6451",
                            "type": "VectorTileLayer",
                            "layerType": "VectorTileLayer",
                            "title": "World Topographic Map",
                            "styleUrl": "https://www.arcgis.com/sharing/rest/content/items/" +
                                "7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json",
                            "itemId": "7dc6cea0b1764a1f9af2e679f642f0f5"
                        }],
                    "title": "Topographic"
                },
                "spatialReference": {
                    "wkid": 102100,
                    "latestWkid": 3857
                },
                "tables": [{
                        "url": "https://services123.arcgis.com/org1234567890/arcgis/rest/services/" +
                            "ROWPermits_publiccomment/FeatureServer/1",
                        "id": "ROWPermitApplication_4404",
                        "title": "ROW Permit Comment",
                        "layerDefinition": {},
                        "itemId": "svc1234567890",
                        "popupInfo": {}
                    }]
            };
            break;
        case "Web Mapping Application":
            data = {
                "source": "tpl1234567890",
                "folderId": "fld1234567890",
                "values": {
                    "webmap": "map1234567890",
                    "title": "A web mapping application",
                    "titleIcon": "images/banner.png",
                    "displayText": "<b>Welcome</p>",
                    "featureLayer": {
                        "id": "ROWPermitApplication_4605",
                        "fields": [{
                                "id": "sortField",
                                "fields": ["submitdt"]
                            }]
                    },
                    "showAllFeatures": "true",
                    "customUrlLayer": {
                        "id": "ROWPermitApplication_4605",
                        "fields": [{
                                "id": "urlField",
                                "fields": ["OBJECTID"]
                            }]
                    },
                    "customUrlParam": "id"
                }
            };
            break;
        case "Workforce Project":
            break;
        case "Unsupported":
            data = {};
            break;
    }
    return data;
}
exports.getAGOLItemData = getAGOLItemData;
function getAGOLItemDataWMAGroup() {
    var data = getAGOLItemData("Web Mapping Application");
    data.values.group = data.values.webmap;
    delete data.values.webmap;
    return data;
}
exports.getAGOLItemDataWMAGroup = getAGOLItemDataWMAGroup;
function getAGOLItemDataWMANoWebmapOrGroup() {
    var data = getAGOLItemData("Web Mapping Application");
    delete data.folderId;
    delete data.values.webmap;
    return data;
}
exports.getAGOLItemDataWMANoWebmapOrGroup = getAGOLItemDataWMANoWebmapOrGroup;
function getItemDataWidgetlessDashboard() {
    var data = getAGOLItemData("Dashboard");
    data.widgets = null;
    return data;
}
exports.getItemDataWidgetlessDashboard = getItemDataWidgetlessDashboard;
function getAGOLItemResources(testCase) {
    var resources = get400Failure();
    // Supported item types
    switch (testCase) {
        case "none":
            resources = {
                "total": 0,
                "start": 1,
                "num": 0,
                "nextStart": -1,
                "resources": []
            };
            break;
        case "one text":
            resources = {
                "total": 1,
                "start": 1,
                "num": 1,
                "nextStart": -1,
                "resources": [{
                        "value": "abc"
                    }]
            };
            break;
    }
    return resources;
}
exports.getAGOLItemResources = getAGOLItemResources;
function getAGOLGroup() {
    return {
        "id": "grp1234567890",
        "title": "An AGOL group",
        "isInvitationOnly": true,
        "owner": "LocalGovTryItLive",
        "description": "Description of an AGOL group",
        "snippet": "Snippet of an AGOL group",
        "typeKeywords": ["JavaScript"],
        "phone": null,
        "sortField": "title",
        "sortOrder": "asc",
        "isViewOnly": true,
        "thumbnail": "ROWPermitManager.png",
        "created": 1520967981000,
        "modified": 1523544543000,
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
    };
}
exports.getAGOLGroup = getAGOLGroup;
function getAGOLGroupContentsList(numToPutIntoGroup) {
    var group = {
        "total": 0,
        "start": 1,
        "num": 0,
        "nextStart": -1,
        "items": []
    };
    while (group.items.length < numToPutIntoGroup) {
        group.items.push("itm" + group.items.length);
    }
    return group;
}
exports.getAGOLGroupContentsList = getAGOLGroupContentsList;
function getAGOLService(layers, tables) {
    if (layers === void 0) { layers = []; }
    if (tables === void 0) { tables = []; }
    var service = {
        "currentVersion": 10.61,
        "serviceItemId": "svc1234567890",
        "isView": true,
        "isUpdatableView": true,
        "sourceSchemaChangesAllowed": true,
        "serviceDescription": "",
        "hasVersionedData": false,
        "supportsDisconnectedEditing": false,
        "hasStaticData": false,
        "maxRecordCount": 1000,
        "supportedQueryFormats": "JSON",
        "supportsVCSProjection": false,
        "capabilities": "Create,Query,Editing",
        "description": "",
        "copyrightText": "",
        "spatialReference": {
            "wkid": 102100,
            "latestWkid": 3857
        },
        "initialExtent": {
            "xmin": -14999999.999989873,
            "ymin": 2699999.9999980442,
            "xmax": -6199999.9999958146,
            "ymax": 6499999.99999407,
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            }
        },
        "fullExtent": {
            "xmin": -14999999.999989873,
            "ymin": 2699999.9999980442,
            "xmax": -6199999.9999958146,
            "ymax": 6499999.99999407,
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            }
        },
        "allowGeometryUpdates": true,
        "units": "esriMeters",
        "supportsAppend": true,
        "syncEnabled": false,
        "supportsApplyEditsWithGlobalIds": true,
        "editorTrackingInfo": {
            "enableEditorTracking": true,
            "enableOwnershipAccessControl": false,
            "allowOthersToQuery": true,
            "allowOthersToUpdate": true,
            "allowOthersToDelete": true,
            "allowAnonymousToQuery": true,
            "allowAnonymousToUpdate": true,
            "allowAnonymousToDelete": true
        },
        "xssPreventionInfo": {
            "xssPreventionEnabled": true,
            "xssPreventionRule": "InputOnly",
            "xssInputRule": "rejectInvalid"
        },
        "layers": [],
        "tables": []
    };
    function addCondensedFormOfLayer(layersOrTables, serviceLayerList) {
        layersOrTables.forEach(function (layer) {
            serviceLayerList.push({
                "id": layer.id,
                "name": layer.name,
                "parentLayerId": -1,
                "defaultVisibility": true,
                "subLayerIds": null,
                "minScale": 0,
                "maxScale": 0,
                "geometryType": "esriGeometryPoint"
            });
        });
    }
    addCondensedFormOfLayer(layers, service.layers);
    addCondensedFormOfLayer(tables, service.tables);
    return service;
}
exports.getAGOLService = getAGOLService;
function getAGOLLayerOrTable(id, name, type, relationships) {
    if (relationships === void 0) { relationships = []; }
    return {
        "currentVersion": 10.61,
        "id": id,
        "name": name,
        "type": type,
        "serviceItemId": "svc1234567890",
        "isView": true,
        "isUpdatableView": true,
        "sourceSchemaChangesAllowed": true,
        "displayField": "appname",
        "description": "PermitApplication",
        "copyrightText": "",
        "defaultVisibility": true,
        "editFieldsInfo": {
            "creationDateField": "CreationDate",
            "creatorField": "Creator",
            "editDateField": "EditDate",
            "editorField": "Editor"
        },
        "editingInfo": {
            "lastEditDate": 1538579807130
        },
        "relationships": relationships,
        "geometryType": "esriGeometryPoint",
        "minScale": 0,
        "maxScale": 0,
        "extent": {
            "xmin": -14999999.999989873,
            "ymin": -13315943.826968452,
            "xmax": 1604565.8194646926,
            "ymax": 6499999.99999407,
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            }
        },
        "allowGeometryUpdates": true,
        "hasAttachments": true,
        "viewSourceHasAttachments": false,
        "attachmentProperties": [{
                "name": "name",
                "isEnabled": true
            }, {
                "name": "size",
                "isEnabled": true
            }, {
                "name": "contentType",
                "isEnabled": true
            }, {
                "name": "keywords",
                "isEnabled": true
            }],
        "objectIdField": "OBJECTID",
        "uniqueIdField": {
            "name": "OBJECTID",
            "isSystemMaintained": true
        },
        "globalIdField": "globalid",
        "capabilities": "Create,Query,Editing",
        "viewDefinitionQuery": "status = 'BoardReview'",
        "definitionQuery": "status = 'BoardReview'"
    };
}
exports.getAGOLLayerOrTable = getAGOLLayerOrTable;
function createAGOLRelationship(id, relatedTableId, role) {
    var relationship = {
        "id": id,
        "name": "",
        "relatedTableId": relatedTableId,
        "cardinality": "esriRelCardinalityOneToMany",
        "role": role,
        "": "globalid",
        "composite": true
    };
    relationship.keyField = role === "esriRelRoleOrigin" ? "globalid" : "parentglobalid";
    return relationship;
}
exports.createAGOLRelationship = createAGOLRelationship;
// -- Internals ------------------------------------------------------------------------------------------------------//
function getAGOLItemFundamentals(type, typePrefix, url) {
    if (url === void 0) { url = ""; }
    return {
        "id": typePrefix + "1234567890",
        "item": typePrefix + "1234567890",
        "owner": "LocalGovTryItLive",
        "orgId": "org1234567890",
        "created": 1520968147000,
        "modified": 1522178539000,
        "guid": null,
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
        "lastModified": -1,
        "spatialReference": null,
        "accessInformation": "Esri, Inc.",
        "licenseInfo": null,
        "culture": "en-us",
        "properties": null,
        "url": url,
        "proxyFilter": null,
        "access": "public",
        "size": 1627,
        "appCategories": [],
        "industries": [],
        "languages": [],
        "largeThumbnail": null,
        "banner": null,
        "screenshots": [],
        "listed": false,
        "commentsEnabled": false,
        "numComments": 0,
        "numRatings": 0,
        "avgRating": 0,
        "numViews": 690,
        "scoreCompleteness": 78,
        "groupDesignations": null
    };
}
//# sourceMappingURL=agolItems.js.map