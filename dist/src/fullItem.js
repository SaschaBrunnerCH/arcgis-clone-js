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
        define(["require", "exports", "tslib", "@esri/arcgis-rest-groups", "@esri/arcgis-rest-items", "@esri/arcgis-rest-request"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var groups = require("@esri/arcgis-rest-groups");
    var items = require("@esri/arcgis-rest-items");
    var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
    /**
     * Fetches the item, data, and resources of an AGOL item.
     *
     * @param id AGOL item id
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve with an IFullItem; its dependencies section is not filled in
     */
    function getFullItem(id, requestOptions) {
        return new Promise(function (resolve, reject) {
            var fullItem;
            // Request item base section
            items.getItem(id, requestOptions)
                .then(function (itemResponse) {
                fullItem = {
                    type: itemResponse.type,
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
                    fullItem.data = responses[0];
                    fullItem.resources = responses[1] && responses[1].total > 0 ? responses[1].resources : null;
                    // Get ids of item dependencies
                    getDependencies(fullItem, requestOptions)
                        .then(function (dependencies) {
                        fullItem.dependencies = dependencies;
                        resolve(fullItem);
                    });
                });
            }, function () {
                // If item query fails, try URL for group base section
                groups.getGroup(id, requestOptions)
                    .then(function (itemResponse) {
                    fullItem = {
                        type: "Group",
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
            "Dashboard": swizzleDashboardDependencies,
            "Web Map": swizzleWebmapDependencies,
            "Web Mapping Application": swizzleWebMappingApplicationDependencies
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
     * @returns Error object with message "Item or group does not exist or is inaccessible: <id>"
     */
    function createUnavailableItemError(id) {
        return new arcgis_rest_request_1.ArcGISRequestError("Item or group does not exist or is inaccessible: " + id);
    }
    exports.createUnavailableItemError = createUnavailableItemError;
    /**
     * Gets the ids of the dependencies of an AGOL item.
     *
     * @param fullItem An item whose dependencies are sought
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve with list of dependent ids
     * @protected
     */
    function getDependencies(fullItem, requestOptions) {
        return new Promise(function (resolve, reject) {
            var getDependenciesByType = {
                "Dashboard": getDashboardDependencies,
                "Group": getGroupDependencies,
                "Web Map": getWebmapDependencies,
                "Web Mapping Application": getWebMappingApplicationDependencies
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
     * Gets the ids of the dependencies of an AGOL dashboard item.
     *
     * @param fullItem A dashboard item whose dependencies are sought
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve with list of dependent ids
     * @protected
     */
    function getDashboardDependencies(fullItem, requestOptions) {
        return new Promise(function (resolve) {
            var dependencies = [];
            var widgets = fullItem.data && fullItem.data.widgets;
            if (widgets) {
                widgets.forEach(function (widget) {
                    if (widget.type === "mapWidget") {
                        dependencies.push(widget.itemId);
                    }
                });
            }
            resolve(dependencies);
        });
    }
    /**
     * Gets the ids of the dependencies (contents) of an AGOL group.
     *
     * @param fullItem A group whose contents are sought
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve with list of dependent ids
     * @protected
     */
    function getGroupDependencies(fullItem, requestOptions) {
        return new Promise(function (resolve, reject) {
            var pagingRequest = tslib_1.__assign({ paging: {
                    start: 0,
                    num: 100
                } }, requestOptions);
            // Fetch group items
            getGroupContentsTranche(fullItem.item.id, pagingRequest)
                .then(function (contents) { return resolve(contents); }, reject);
        });
    }
    /**
     * Gets the ids of the dependencies of an AGOL webmap item.
     *
     * @param fullItem A webmap item whose dependencies are sought
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve with list of dependent ids
     * @protected
     */
    function getWebmapDependencies(fullItem, requestOptions) {
        return new Promise(function (resolve) {
            var dependencies = [];
            if (fullItem.data) {
                dependencies = getWebmapLayerIds(fullItem.data.operationalLayers).concat(getWebmapLayerIds(fullItem.data.tables));
            }
            resolve(dependencies);
        });
    }
    /**
     * Gets the ids of the dependencies of an AGOL webapp item.
     *
     * @param fullItem A webapp item whose dependencies are sought
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve with list of dependent ids
     * @protected
     */
    function getWebMappingApplicationDependencies(fullItem, requestOptions) {
        return new Promise(function (resolve) {
            var dependencies = [];
            var values = fullItem.data && fullItem.data.values;
            if (values) {
                if (values.webmap) {
                    dependencies.push(values.webmap);
                }
                if (values.group) {
                    dependencies.push(values.group);
                }
            }
            resolve(dependencies);
        });
    }
    /**
     * Swizzles the ids of the dependencies of an AGOL dashboard item.
     *
     * @param fullItem A dashboard item whose dependencies are to be swizzled
     * @param swizzles Hash mapping original ids to replacement ids
     * @protected
     */
    function swizzleDashboardDependencies(fullItem, swizzles) {
        // Swizzle its webmap(s)
        var widgets = fullItem.data && fullItem.data.widgets;
        if (Array.isArray(widgets)) {
            widgets.forEach(function (widget) {
                if (widget.type === "mapWidget") {
                    widget.itemId = swizzles[widget.itemId].id;
                }
            });
        }
    }
    /**
     * Swizzles the ids of the dependencies of an AGOL webmap item.
     *
     * @param fullItem A webmap item whose dependencies are to be swizzled
     * @param swizzles Hash mapping original ids to replacement ids
     * @protected
     */
    function swizzleWebmapDependencies(fullItem, swizzles) {
        if (fullItem.data) {
            // Swizzle its map layers
            if (Array.isArray(fullItem.data.operationalLayers)) {
                fullItem.data.operationalLayers.forEach(function (layer) {
                    var itsSwizzle = swizzles[layer.itemId];
                    if (itsSwizzle) {
                        layer.title = itsSwizzle.name;
                        layer.itemId = itsSwizzle.id;
                        layer.url = itsSwizzle.url + layer.url.substr(layer.url.lastIndexOf("/"));
                    }
                });
            }
            // Swizzle its tables
            if (Array.isArray(fullItem.data.tables)) {
                fullItem.data.tables.forEach(function (layer) {
                    var itsSwizzle = swizzles[layer.itemId];
                    if (itsSwizzle) {
                        layer.title = itsSwizzle.name;
                        layer.itemId = itsSwizzle.id;
                        layer.url = itsSwizzle.url + layer.url.substr(layer.url.lastIndexOf("/"));
                    }
                });
            }
        }
    }
    /**
     * Swizzles the ids of the dependencies of an AGOL webapp item.
     *
     * @param fullItem A webapp item whose dependencies are to be swizzled
     * @param swizzles Hash mapping original ids to replacement ids
     * @protected
     */
    function swizzleWebMappingApplicationDependencies(fullItem, swizzles) {
        // Swizzle its webmap or group
        var values = fullItem.data && fullItem.data.values;
        if (values) {
            if (values.webmap) {
                values.webmap = swizzles[values.webmap].id;
            }
            else if (values.group) {
                values.group = swizzles[values.group].id;
            }
        }
    }
    /**
     * Swizzles the ids of the dependencies of an IFullItem.
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
    //-- Internals -------------------------------------------------------------------------------------------------------//
    /**
     * Gets the ids of a group's contents.
     *
     * @param id Group id
     * @param pagingRequest Options for requesting group contents; note: its paging.start parameter may
     *                      be modified by this routine
     * @returns A promise that will resolve with a list of the ids of the group's contents
     * @protected
     */
    function getGroupContentsTranche(id, pagingRequest) {
        return new Promise(function (resolve, reject) {
            // Fetch group items
            groups.getGroupContent(id, pagingRequest)
                .then(function (contents) {
                // Extract the list of content ids from the JSON returned
                var trancheIds = contents.items.map(function (item) { return item.id; });
                // Are there more contents to fetch?
                if (contents.nextStart > 0) {
                    pagingRequest.paging.start = contents.nextStart;
                    getGroupContentsTranche(id, pagingRequest)
                        .then(function (allSubsequentTrancheIds) {
                        // Append all of the following tranches to this tranche and return it
                        Array.prototype.push.apply(trancheIds, allSubsequentTrancheIds);
                        resolve(trancheIds);
                    }, reject);
                }
                else {
                    resolve(trancheIds);
                }
            }, function (error) {
                reject(error.originalMessage);
            });
        });
    }
    exports.getGroupContentsTranche = getGroupContentsTranche;
    /**
     * Extracts the AGOL id or URL for each layer or table object in a list.
     *
     * @param layerList List of map layers or tables
     * @returns List of ids and/or URLs
     * @protected
     */
    function getWebmapLayerIds(layerList) {
        var dependencies = [];
        if (Array.isArray(layerList)) {
            layerList.forEach(function (layer) {
                var itemId = layer.itemId;
                if (itemId) {
                    dependencies.push(itemId);
                }
            });
        }
        return dependencies;
    }
    exports.getWebmapLayerIds = getWebmapLayerIds;
    /**
     * Removes duplicates from an array of strings.
     *
     * @param arrayWithDups An array to be copied
     * @returns Copy of array with duplicates removed
     * @protected
     */
    function removeDuplicates(arrayWithDups) {
        var uniqueStrings = {};
        arrayWithDups.forEach(function (arrayElem) { return uniqueStrings[arrayElem] = true; });
        return Object.keys(uniqueStrings);
    }
    exports.removeDuplicates = removeDuplicates;
});
//# sourceMappingURL=fullItem.js.map