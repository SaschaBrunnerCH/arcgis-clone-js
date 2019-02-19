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
var groups = require("@esri/arcgis-rest-groups");
var items = require("@esri/arcgis-rest-items");
var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
var mDashboard = require("./itemTypes/dashboard");
var mGroup = require("./itemTypes/group");
var mWebmap = require("./itemTypes/webmap");
var mWebMappingApplication = require("./itemTypes/webmappingapplication");
// -- Exports -------------------------------------------------------------------------------------------------------//
/**
 * Fetches the item, data, and resources of an AGOL item.
 *
 * @param id AGOL item id
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with an ITemplate
 */
function getFullItem(id, requestOptions) {
    return new Promise(function (resolve, reject) {
        var fullItem;
        // Request item base section
        items.getItem(id, requestOptions)
            .then(function (itemResponse) {
            fullItem = {
                itemId: itemResponse.id,
                type: itemResponse.type,
                key: camelize(itemResponse.title),
                item: itemResponse,
                dependencies: []
            };
            // Request item data section
            var dataPromise = items.getItemData(id, requestOptions);
            // Request item resources
            var resourceRequestOptions = tslib_1.__assign({ id: id }, requestOptions);
            var resourcePromise = items.getItemResources(resourceRequestOptions);
            // Items without a data section return an error from the REST library, so we'll need to prevent it
            // from killing off both promises
            Promise.all([
                dataPromise.catch(function () { return null; }),
                resourcePromise.catch(function () { return null; })
            ])
                .then(function (responses) {
                var dataResponse = responses[0], resourceResponse = responses[1];
                fullItem.data = dataResponse;
                fullItem.resources = resourceResponse && resourceResponse.total > 0 ? resourceResponse.resources : null;
                // Get ids of item dependencies
                getDependencies(fullItem, requestOptions)
                    .then(function (dependencies) {
                    fullItem.dependencies = dependencies;
                    resolve(fullItem);
                }, reject);
            }, reject);
        }, function () {
            // If item query fails, try URL for group base section
            groups.getGroup(id, requestOptions)
                .then(function (itemResponse) {
                fullItem = {
                    itemId: itemResponse.id,
                    type: "Group",
                    key: camelize(itemResponse.title),
                    item: itemResponse,
                    dependencies: []
                };
                // Get ids of item dependencies
                getDependencies(fullItem, requestOptions)
                    .then(function (dependencies) {
                    fullItem.dependencies = dependencies;
                    resolve(fullItem);
                }, function () {
                    reject(createUnavailableItemError(id));
                });
            }, function () {
                reject(createUnavailableItemError(id));
            });
        });
    });
}
exports.getFullItem = getFullItem;
/**
 * Swizzles the dependencies of an AGOL item.
 *
 * @param fullItem An item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 */
function swizzleDependencies(fullItem, swizzles) {
    if (swizzles === void 0) { swizzles = {}; }
    var swizzleDependenciesByType = {
        "Dashboard": mDashboard.swizzleDependencies,
        "Web Map": mWebmap.swizzleDependencies,
        "Web Mapping Application": mWebMappingApplication.swizzleDependencies
    };
    if (swizzleDependenciesByType[fullItem.type]) {
        swizzleDependenciesByType[fullItem.type](fullItem, swizzles);
    }
    swizzleCommonDependencies(fullItem, swizzles);
}
exports.swizzleDependencies = swizzleDependencies;
/**
 * Creates an error object.
 *
 * @param id AGOL item id that caused failure
 * @return Error object with message "Item or group does not exist or is inaccessible: <id>"
 */
function createUnavailableItemError(id) {
    return new arcgis_rest_request_1.ArcGISRequestError("Item or group does not exist or is inaccessible: " + id);
}
exports.createUnavailableItemError = createUnavailableItemError;
/**
 * Removes spaces from a string and converts the first letter of each word to uppercase.
 * @param aString String to be modified
 * @return Modified string
 * @protected
 */
function camelize(aString) {
    if (!aString) {
        return "";
    }
    var stringParts = aString.split(/\s/);
    if (stringParts.length === 1) {
        return aString;
    }
    return stringParts
        .map(function (part, i) {
        if (i > 0) {
            part = part[0].toUpperCase() + (part.length > 1 ? part.substr(1) : "");
        }
        return part;
    })
        .join("");
}
exports.camelize = camelize;
/**
 * Gets the ids of the dependencies of an AGOL item.
 *
 * @param fullItem An item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
function getDependencies(fullItem, requestOptions) {
    return new Promise(function (resolve, reject) {
        var getDependenciesByType = {
            "Dashboard": mDashboard.getDependencies,
            "Group": mGroup.getDependencies,
            "Web Map": mWebmap.getDependencies,
            "Web Mapping Application": mWebMappingApplication.getDependencies
        };
        if (getDependenciesByType[fullItem.type]) {
            getDependenciesByType[fullItem.type](fullItem, requestOptions)
                .then(function (dependencies) { return resolve(removeDuplicates(dependencies)); }, reject);
        }
        else {
            resolve([]);
        }
    });
}
exports.getDependencies = getDependencies;
/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
function removeDuplicates(arrayWithDups) {
    var uniqueStrings = {};
    arrayWithDups.forEach(function (arrayElem) { return uniqueStrings[arrayElem] = true; });
    return Object.keys(uniqueStrings);
}
exports.removeDuplicates = removeDuplicates;
/**
 * Swizzles the ids of the dependencies of an ITemplate.
 *
 * @param fullItem Item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
function swizzleCommonDependencies(fullItem, swizzles) {
    if (Array.isArray(fullItem.dependencies) && fullItem.dependencies.length > 0) {
        // Swizzle the id of each of the items in the dependencies array
        var updatedDependencies_1 = [];
        fullItem.dependencies.forEach(function (depId) {
            updatedDependencies_1.push(swizzles[depId].id);
        });
        fullItem.dependencies = updatedDependencies_1;
    }
}
//# sourceMappingURL=fullItem.js.map