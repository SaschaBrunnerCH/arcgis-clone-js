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
        define(["require", "exports", "tslib", "@esri/arcgis-rest-items", "@esri/arcgis-rest-groups", "@esri/arcgis-rest-feature-service-admin", "@esri/arcgis-rest-sharing", "@esri/arcgis-rest-request", "./fullItemHierarchy", "./dependencies"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var items = require("@esri/arcgis-rest-items");
    var groups = require("@esri/arcgis-rest-groups");
    var featureServiceAdmin = require("@esri/arcgis-rest-feature-service-admin");
    var sharing = require("@esri/arcgis-rest-sharing");
    var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
    var fullItemHierarchy_1 = require("./fullItemHierarchy");
    var dependencies_1 = require("./dependencies");
    /**
     * Converts one or more AGOL items and their dependencies into a hash by id of JSON item descriptions.
     *
     * ```typescript
     * import { IItemHash } from "../src/fullItemHierarchy";
     * import { createSolution } from "../src/solution";
     *
     * getFullItemHierarchy(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
     * .then(
     *   (response:IItemHash) => {
     *     let keys = Object.keys(response);
     *     console.log(keys.length);  // => "6"
     *     console.log((response[keys[0]] as IFullItem).type);  // => "Web Mapping Application"
     *     console.log((response[keys[0]] as IFullItem).item.title);  // => "ROW Permit Public Comment"
     *     console.log((response[keys[0]] as IFullItem).text.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
     *   },
     *   error => {
     *     // (should not see this as long as both of the above ids--real ones--stay available)
     *     console.log(error); // => "Item or group does not exist or is inaccessible: " + the problem id number
     *   }
     * );
     * ```
     *
     * @param solutionRootIds AGOL id string or list of AGOL id strings
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve with a hash by id of IFullItems;
     * if any id is inaccessible, a single error response will be produced for the set
     * of ids
     */
    function createSolution(solutionRootIds, requestOptions) {
        return new Promise(function (resolve, reject) {
            // Get the items forming the solution
            fullItemHierarchy_1.getFullItemHierarchy(solutionRootIds, requestOptions)
                .then(function (solution) {
                var adjustmentPromises = [];
                // Prepare the Solution by adjusting its items
                Object.keys(solution).forEach(function (key) {
                    var fullItem = solution[key];
                    // 1. remove unwanted properties
                    fullItem.item = removeUndesirableItemProperties(fullItem.item);
                    // 2. for web mapping apps,
                    //    a. generalize app URL
                    if (fullItem.type === "Web Mapping Application") {
                        generalizeWebMappingApplicationURLs(fullItem);
                        // 3. for feature services,
                        //    a. fill in missing data
                        //    b. get layer & table details
                        //    c. generalize layer & table URLs
                    }
                    else if (fullItem.type === "Feature Service") {
                        adjustmentPromises.push(fleshOutFeatureService(fullItem, requestOptions));
                    }
                });
                if (adjustmentPromises.length === 0) {
                    resolve(solution);
                }
                else {
                    Promise.all(adjustmentPromises)
                        .then(function () { return resolve(solution); });
                }
            }, reject);
        });
    }
    exports.createSolution = createSolution;
    /**
     * Creates a Solution item containing JSON descriptions of items forming the solution.
     *
     * @param title Title for Solution item to create
     * @param solution Hash of JSON descriptions of items to publish into Solution
     * @param access Access to set for item: 'public', 'org', 'private'
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with an object reporting success and the Solution id
     */
    function publishSolution(title, solution, access, requestOptions) {
        return new Promise(function (resolve, reject) {
            // Define the solution item
            var item = {
                title: title,
                type: "Solution",
                itemType: "text",
                access: access,
                listed: false,
                commentsEnabled: false
            };
            var data = {
                items: solution
            };
            // Create it and add its data section
            var options = tslib_1.__assign({ title: title, item: item }, requestOptions);
            items.createItem(options)
                .then(function (results) {
                var options = tslib_1.__assign({ id: results.id, data: data }, requestOptions);
                items.addItemJsonData(options)
                    .then(function (results) {
                    // Set the access manually since the access value in createItem appears to be ignored
                    var options = tslib_1.__assign({ id: results.id, access: access }, requestOptions);
                    sharing.setItemAccess(options)
                        .then(function (results) {
                        resolve({
                            success: true,
                            id: results.itemId
                        });
                    }, function (error) { return reject(error.originalMessage); });
                }, function (error) { return reject(error.originalMessage); });
            }, function (error) { return reject(error.originalMessage); });
        });
    }
    exports.publishSolution = publishSolution;
    /**
     * Converts a hash by id of generic JSON item descriptions into AGOL items.
     *
     * @param solution A hash of item descriptions to convert
     * @param orgSession Options for requesting information from AGOL, including org and portal URLs
     * @param folderId AGOL id of folder to receive item, or null/empty if folder is to be created;
     *     if created, folder name is a combination of the solution name and a timestamp for uniqueness,
     *     e.g., "Dashboard (1540841846958)"
     * @param solutionName Name root to use if folder is to be created
     * @returns A promise that will resolve with a list of the ids of items created in AGOL
     */
    function cloneSolution(solution, orgSession, folderId, solutionName) {
        return new Promise(function (resolve, reject) {
            var itemIdList = [];
            var swizzles = {};
            // Don't bother creating folder if there are no items in solution
            if (!solution || Object.keys(solution).length === 0) {
                resolve(itemIdList);
            }
            // Run through the list of item ids in clone order
            var cloneOrderChecklist = topologicallySortItems(solution);
            function runThroughChecklist() {
                if (cloneOrderChecklist.length === 0) {
                    resolve(itemIdList);
                    return;
                }
                // Clone item at top of list
                var itemId = cloneOrderChecklist.shift();
                createItem(solution[itemId], folderId, swizzles, orgSession)
                    .then(function (newItemId) {
                    itemIdList.push(newItemId);
                    runThroughChecklist();
                }, function (error) {
                    reject(error);
                });
            }
            // Use specified folder to hold the hydrated items to avoid name clashes
            if (folderId) {
                runThroughChecklist();
            }
            else {
                // Create a folder to hold the hydrated items to avoid name clashes
                var folderName = (solutionName || "Solution") + " (" + getTimestamp() + ")";
                var options = {
                    title: folderName,
                    authentication: orgSession.authentication
                };
                items.createFolder(options)
                    .then(function (createdFolderResponse) {
                    folderId = createdFolderResponse.folder.id;
                    runThroughChecklist();
                }, function (error) {
                    reject(error.response.error.message);
                });
            }
        });
    }
    exports.cloneSolution = cloneSolution;
    //-- Internals -------------------------------------------------------------------------------------------------------//
    /**
     * A general server name to replace the organization URL in a Web Mapping Application's URL to itself;
     * name has to be acceptable to AGOL, otherwise it discards the URL.
     * @protected
     */
    exports.aPlaceholderServerName = "https://arcgis.com";
    /**
     * A visit flag used in the topological sort algorithm.
     * @protected
     */
    var SortVisitColor;
    (function (SortVisitColor) {
        /** not yet visited */
        SortVisitColor[SortVisitColor["White"] = 0] = "White";
        /** visited, in progress */
        SortVisitColor[SortVisitColor["Gray"] = 1] = "Gray";
        /** finished */
        SortVisitColor[SortVisitColor["Black"] = 2] = "Black";
    })(SortVisitColor || (SortVisitColor = {}));
    /**
     * Adds the layers and tables of a feature service to it and restores their relationships.
     *
     * @param fullItem Feature service
     * @param swizzles Hash mapping Solution source id to id of its clone (and name & URL for feature service)
     * @param orgSession Options for requesting information from AGOL, including org and portal URLs
     * @returns A promise that will resolve when fullItem has been updated
     * @protected
     */
    function addFeatureServiceLayersAndTables(fullItem, swizzles, orgSession) {
        return new Promise(function (resolve, reject) {
            // Sort layers and tables by id so that they're added with the same ids
            var layersAndTables = [];
            (fullItem.layers || []).forEach(function (layer) {
                layersAndTables[layer.id] = {
                    item: layer,
                    type: "layer"
                };
            });
            (fullItem.tables || []).forEach(function (table) {
                layersAndTables[table.id] = {
                    item: table,
                    type: "table"
                };
            });
            // Hold a hash of relationships
            var relationships = {};
            // Add the service's layers and tables to it
            if (layersAndTables.length > 0) {
                updateFeatureServiceDefinition(fullItem.item.id, fullItem.item.url, layersAndTables, swizzles, relationships, orgSession)
                    .then(function () {
                    // Restore relationships for all layers and tables in the service
                    var awaitRelationshipUpdates = [];
                    Object.keys(relationships).forEach(function (id) {
                        awaitRelationshipUpdates.push(new Promise(function (resolve) {
                            var options = tslib_1.__assign({ params: {
                                    updateFeatureServiceDefinition: {
                                        relationships: relationships[id]
                                    }
                                } }, orgSession);
                            featureServiceAdmin.addToServiceDefinition(fullItem.item.url + "/" + id, options)
                                .then(function () {
                                resolve();
                            }, resolve);
                        }));
                    });
                    Promise.all(awaitRelationshipUpdates)
                        .then(function () {
                        resolve();
                    });
                });
            }
            else {
                resolve();
            }
        });
    }
    exports.addFeatureServiceLayersAndTables = addFeatureServiceLayersAndTables;
    /**
     * Adds the members of a group to it.
     *
     * @param fullItem Group
     * @param swizzles Hash mapping Solution source id to id of its clone
     * @param orgSession Options for requesting information from AGOL, including org and portal URLs
     * @returns A promise that will resolve when fullItem has been updated
     * @protected
     */
    function addGroupMembers(fullItem, swizzles, orgSession) {
        return new Promise(function (resolve, reject) {
            // Add each of the group's items to it
            if (fullItem.dependencies.length > 0) {
                var awaitGroupAdds = [];
                fullItem.dependencies.forEach(function (depId) {
                    awaitGroupAdds.push(new Promise(function (resolve) {
                        sharing.shareItemWithGroup(tslib_1.__assign({ id: depId, groupId: fullItem.item.id }, orgSession))
                            .then(function () {
                            resolve();
                        }, function (error) { return reject(error.response.error.message); });
                    }));
                });
                // After all items have been added to the group
                Promise.all(awaitGroupAdds)
                    .then(function () { return resolve(); });
            }
            else {
                // No items in this group
                resolve();
            }
        });
    }
    exports.addGroupMembers = addGroupMembers;
    /**
     * Creates an item in a specified folder (except for Group item type).
     *
     * @param fullItem Item to be created; n.b.: this item is modified
     * @param folderId Id of folder to receive item; null indicates that the item goes into the root
     *                 folder; ignored for Group item type
     * @param swizzles Hash mapping Solution source id to id of its clone
     * @param orgSession Options for requesting information from AGOL, including org and portal URLs
     * @returns A promise that will resolve with the id of the created item
     * @protected
     */
    function createItem(fullItem, folderId, swizzles, orgSession) {
        return new Promise(function (resolve, reject) {
            // Swizzle item's dependencies
            dependencies_1.swizzleDependencies(fullItem, swizzles);
            // Feature Services
            if (fullItem.type === "Feature Service") {
                var options = tslib_1.__assign({ item: fullItem.item, folderId: folderId }, orgSession);
                if (fullItem.data) {
                    options.item.text = fullItem.data;
                }
                // Make the item name unique
                options.item.name += "_" + getTimestamp();
                // Remove the layers and tables from the create request because while they aren't added when
                // the service is added, their presence prevents them from being added later via updateFeatureServiceDefinition
                options.item.layers = [];
                options.item.tables = [];
                // Create the item
                featureServiceAdmin.createFeatureService(options)
                    .then(function (createResponse) {
                    // Add the new item to the swizzle list
                    swizzles[fullItem.item.id] = {
                        id: createResponse.serviceItemId,
                        url: createResponse.serviceurl
                    };
                    fullItem.item.id = createResponse.serviceItemId;
                    fullItem.item.url = createResponse.serviceurl;
                    // Add the feature service's layers and tables to it
                    addFeatureServiceLayersAndTables(fullItem, swizzles, orgSession)
                        .then(function () { return resolve(fullItem.item.id); });
                }, reject);
                // Groups
            }
            else if (fullItem.type === "Group") {
                var options = tslib_1.__assign({ group: fullItem.item }, orgSession);
                // Make the item title unique
                options.group.title += "_" + getTimestamp();
                // Create the item
                groups.createGroup(options)
                    .then(function (createResponse) {
                    // Add the new item to the swizzle list
                    swizzles[fullItem.item.id] = {
                        id: createResponse.group.id
                    };
                    fullItem.item.id = createResponse.group.id;
                    // Add the group's items to it
                    addGroupMembers(fullItem, swizzles, orgSession)
                        .then(function () { return resolve(fullItem.item.id); });
                }, function (error) { return reject(error.response.error.message); });
                // All other types
            }
            else {
                var options = tslib_1.__assign({ item: fullItem.item, folder: folderId }, orgSession);
                if (fullItem.data) {
                    options.item.text = fullItem.data;
                }
                // Create the item
                items.createItemInFolder(options)
                    .then(function (createResponse) {
                    // Add the new item to the swizzle list
                    swizzles[fullItem.item.id] = {
                        id: createResponse.id
                    };
                    fullItem.item.id = createResponse.id;
                    // For a web mapping app, update its app URL
                    if (fullItem.type === "Web Mapping Application") {
                        updateWebMappingApplicationURL(fullItem, orgSession)
                            .then(function () { return resolve(fullItem.item.id); }, function (error) { return reject(error.response.error.message); });
                    }
                    else {
                        resolve(fullItem.item.id);
                    }
                }, function (error) { return reject(error.response.error.message); });
            }
        });
    }
    exports.createItem = createItem;
    /**
     * Fills in missing data, including full layer and table definitions, in a feature services' definition.
     *
     * @param fullItem Feature service item, data, dependencies definition to be modified
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve when fullItem has been updated
     * @protected
     */
    function fleshOutFeatureService(fullItem, requestOptions) {
        return new Promise(function (resolve) {
            fullItem.service = {};
            fullItem.layers = [];
            fullItem.tables = [];
            // To have enough information for reconstructing the service, we'll supplement
            // the item and data sections with sections for the service, full layers, and
            // full tables
            // Get the service description
            var serviceUrl = fullItem.item.url;
            arcgis_rest_request_1.request(serviceUrl + "?f=json", requestOptions)
                .then(function (serviceData) {
                // Fill in some missing parts
                // If the service doesn't have a name, try to get a name from its layers or tables
                serviceData["name"] = fullItem.item["name"] ||
                    getFirstUsableName(serviceData["layers"]) ||
                    getFirstUsableName(serviceData["tables"]) ||
                    "Feature Service";
                serviceData["snippet"] = fullItem.item["snippet"];
                serviceData["description"] = fullItem.item["description"];
                fullItem.service = serviceData;
                // Get the affiliated layer and table items
                Promise.all([
                    getLayers(serviceUrl, serviceData["layers"], requestOptions),
                    getLayers(serviceUrl, serviceData["tables"], requestOptions)
                ])
                    .then(function (results) {
                    fullItem.layers = results[0];
                    fullItem.tables = results[1];
                    resolve();
                });
            });
        });
    }
    exports.fleshOutFeatureService = fleshOutFeatureService;
    /**
     * Simplifies a web mapping application's app URL for cloning.
     *
     * @param fullItem Web mapping application definition to be modified
     * @protected
     */
    function generalizeWebMappingApplicationURLs(fullItem) {
        // Remove org base URL and app id
        // Need to add placeholder server name because otherwise AGOL makes URL null
        var orgUrl = fullItem.item.url.replace(fullItem.item.id, "");
        var iSep = orgUrl.indexOf("//");
        fullItem.item.url = exports.aPlaceholderServerName + // add placeholder server name
            orgUrl.substr(orgUrl.indexOf("/", iSep + 2));
    }
    /**
     * Gets the name of the first layer in list of layers that has a name
     * @param layerList List of layers to use as a name source
     * @returns The name of the found layer or an empty string if no layers have a name
     * @protected
     */
    function getFirstUsableName(layerList) {
        var name = "";
        // Return the first layer name found
        if (Array.isArray(layerList) && layerList.length > 0) {
            layerList.some(function (layer) {
                if (layer["name"] !== "") {
                    name = layer["name"];
                    return true;
                }
                return false;
            });
        }
        return name;
    }
    /**
     * Gets the full definitions of the layers affiliated with a hosted service.
     *
     * @param serviceUrl URL to hosted service
     * @param layerList List of layers at that service
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with a list of the enhanced layers
     * @protected
     */
    function getLayers(serviceUrl, layerList, requestOptions) {
        return new Promise(function (resolve) {
            if (!Array.isArray(layerList) || layerList.length === 0) {
                resolve([]);
            }
            var requestsDfd = [];
            layerList.forEach(function (layer) {
                requestsDfd.push(arcgis_rest_request_1.request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions));
            });
            // Wait until all layers are heard from
            Promise.all(requestsDfd)
                .then(function (layers) {
                // Remove the editFieldsInfo because it references fields that may not be in the layer/table
                layers.forEach(function (layer) {
                    layer["editFieldsInfo"] = null;
                });
                resolve(layers);
            });
        });
    }
    /**
     * Creates a timestamp string using the current date and time.
     *
     * @returns Timestamp
     * @protected
     */
    function getTimestamp() {
        return (new Date()).getTime().toString();
    }
    exports.getTimestamp = getTimestamp;
    /**
     * Creates a copy of item base properties with properties irrelevant to cloning removed.
     *
     * @param item The base section of an item
     * @returns Cloned copy of item without certain properties such as `created`, `modified`,
     *        `owner`,...; note that is is a shallow copy
     * @protected
     */
    function removeUndesirableItemProperties(item) {
        if (item) {
            var itemSectionClone = tslib_1.__assign({}, item);
            delete itemSectionClone.avgRating;
            delete itemSectionClone.created;
            delete itemSectionClone.guid;
            delete itemSectionClone.lastModified;
            delete itemSectionClone.modified;
            delete itemSectionClone.numComments;
            delete itemSectionClone.numRatings;
            delete itemSectionClone.numViews;
            delete itemSectionClone.orgId;
            delete itemSectionClone.owner;
            delete itemSectionClone.scoreCompleteness;
            delete itemSectionClone.size;
            delete itemSectionClone.uploaded;
            return itemSectionClone;
        }
        return null;
    }
    exports.removeUndesirableItemProperties = removeUndesirableItemProperties;
    /**
     * Topologically sort a Solution's items into a build list.
     *
     * @param items Hash of JSON descriptions of items
     * @returns List of ids of items in the order in which they need to be built so that dependencies
     * are built before items that require those dependencies
     * @throws Error("Cyclical dependency graph detected")
     * @protected
     * @protected
     */
    function topologicallySortItems(items) {
        // Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford (2009)
        // Sections 22.3 (Depth-first search) & 22.4 (Topological sort), pp. 603-615
        // Introduction to Algorithms (3rd ed.), The MIT Press, ISBN 978-0-262-03384-8
        //
        // DFS(G)
        // 1 for each vertex u ∈ G,V
        // 2     u.color = WHITE
        // 3     u.π = NIL
        // 4 time = 0
        // 5 for each vertex u ∈ G,V
        // 6     if u.color == WHITE
        // 7         DFS-VISIT(G,u)
        //
        // DFS-VISIT(G,u)
        // 1 time = time + 1    // white vertex u has just been discovered
        // 2 u.d = time
        // 3 u.color = GRAY
        // 4 for each v ∈ G.Adj[u]     // explore edge (u,v)
        // 5     if v.color == WHITE
        // 6         v.π = u
        // 7         DFS-VISIT(G,v)
        // 8 u.color = BLACK         // blacken u; it is finished
        // 9 time = time + 1
        // 10 u.f = time
        //
        // TOPOLOGICAL-SORT(G)
        // 1 call DFS(G) to compute finishing times v.f for each vertex v
        // 2 as each vertex is finished, insert it onto front of a linked list
        // 3 return the linked list of vertices
        var buildList = []; // list of ordered vertices--don't need linked list because we just want relative ordering
        var verticesToVisit = {};
        Object.keys(items).forEach(function (vertexId) {
            verticesToVisit[vertexId] = SortVisitColor.White; // not yet visited
        });
        // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
        Object.keys(verticesToVisit).forEach(function (vertexId) {
            if (verticesToVisit[vertexId] === SortVisitColor.White) { // if not yet visited
                visit(vertexId);
            }
        });
        // Visit vertex
        function visit(vertexId) {
            verticesToVisit[vertexId] = SortVisitColor.Gray; // visited, in progress
            // Visit dependents if not already visited
            var dependencies = items[vertexId].dependencies || [];
            dependencies.forEach(function (dependencyId) {
                if (verticesToVisit[dependencyId] === SortVisitColor.White) { // if not yet visited
                    visit(dependencyId);
                }
                else if (verticesToVisit[dependencyId] === SortVisitColor.Gray) { // visited, in progress
                    throw Error("Cyclical dependency graph detected");
                }
            });
            verticesToVisit[vertexId] = SortVisitColor.Black; // finished
            buildList.push(vertexId); // add to end of list of ordered vertices because we want dependents first
        }
        return buildList;
    }
    exports.topologicallySortItems = topologicallySortItems;
    /**
     * Updates a feature service with a list of layers and/or tables.
     *
     * @param serviceItemId AGOL id of feature service
     * @param serviceUrl URL of feature service
     * @param listToAdd List of layers and/or tables to add
     * @param swizzles Hash mapping Solution source id to id of its clone (and name & URL for feature service)
     * @param relationships Hash mapping a layer's relationship id to the ids of its relationships
     * @param requestOptions Options for requesting information from AGOL
     * @returns A promise that will resolve when the feature service has been updated
     * @protected
     */
    function updateFeatureServiceDefinition(serviceItemId, serviceUrl, listToAdd, swizzles, relationships, requestOptions) {
        // Launch the adds serially because server doesn't support parallel adds
        return new Promise(function (resolve, reject) {
            if (listToAdd.length > 0) {
                var toAdd = listToAdd.shift();
                var item = toAdd.item;
                var originalId = item.id;
                delete item.serviceItemId; // Updated by updateFeatureServiceDefinition
                // Need to remove relationships and add them back individually after all layers and tables
                // have been added to the definition
                if (Array.isArray(item.relationships) && item.relationships.length > 0) {
                    relationships[originalId] = item.relationships;
                    item.relationships = [];
                }
                var options = tslib_1.__assign({}, requestOptions);
                if (toAdd.type === "layer") {
                    item.adminLayerInfo = {
                        "geometryField": {
                            "name": "Shape",
                            "srid": 102100
                        }
                    };
                    options.layers = [item];
                }
                else {
                    options.tables = [item];
                }
                featureServiceAdmin.addToServiceDefinition(serviceUrl, options)
                    .then(function () {
                    updateFeatureServiceDefinition(serviceItemId, serviceUrl, listToAdd, swizzles, relationships, requestOptions)
                        .then(resolve);
                }, reject);
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Updates the URL of a web mapping application to one usable for running the app.
     *
     * @param fullItem A web mapping application
     * @param orgSession Options for requesting information from AGOL, including org and portal URLs
     * @returns A promise that will resolve when fullItem has been updated
     * @protected
     */
    function updateWebMappingApplicationURL(fullItem, orgSession) {
        return new Promise(function (resolve, reject) {
            // Update its URL
            var options = {
                item: {
                    'id': fullItem.item.id,
                    'url': orgSession.orgUrl +
                        (fullItem.item.url.substr(exports.aPlaceholderServerName.length)) + // remove placeholder server name
                        fullItem.item.id
                },
                authentication: orgSession.authentication
            };
            items.updateItem(options)
                .then(function (updateResp) {
                resolve(fullItem.item.id);
            }, reject);
        });
    }
    exports.updateWebMappingApplicationURL = updateWebMappingApplicationURL;
});
//# sourceMappingURL=solution.js.map