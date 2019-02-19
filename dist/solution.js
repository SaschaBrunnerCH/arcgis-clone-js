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
var adlib = require("adlib");
var items = require("@esri/arcgis-rest-items");
var mCommon = require("./itemTypes/common");
var mClassifier = require("./itemTypes/classifier");
// -- Externals ------------------------------------------------------------------------------------------------------//
/**
 * Creates a solution template item.
 *
 * @param title The title to use for the item
 * @param version The version to include in the item's metadata
 * @param ids AGO id string or list of AGO id strings
 * @param sourceRequestOptions Options for requesting information from AGO about items to be
 *                             included in solution template
 * @param destinationRequestOptions Options for creating solution template item in AGO
 * @return A promise that will resolve with a solution template item
 */
function createSolutionTemplate(title, version, ids, sourceRequestOptions, destinationRequestOptions) {
    return new Promise(function (resolve, reject) {
        // Create an empty solution template item
        createSolutionTemplateItem(title, version, destinationRequestOptions, undefined, "public")
            .then(function (solutionTemplateItem) {
            // Get the templates for the items in the solution
            createSolutionItemTemplates(ids, solutionTemplateItem, sourceRequestOptions)
                .then(function (templates) {
                solutionTemplateItem.data.templates = templates;
                // Update the solution template item
                updateSolutionTemplateItem(solutionTemplateItem, destinationRequestOptions)
                    .then(function (updatedSolutionTemplateItem) {
                    resolve(updatedSolutionTemplateItem);
                }, function () { return reject({ success: false }); });
            }, function () { return reject({ success: false }); });
        }, function () { return reject({ success: false }); });
    });
}
exports.createSolutionTemplate = createSolutionTemplate;
/**
 * Converts a solution template into an AGO deployed solution and items.
 *
 * @param solutionTemplateItem Solution template to deploy
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param progressCallback Function for reporting progress updates from type-specific template
 *                         handlers
 * @return A promise that will resolve with a list of the ids of items created in AGO
 */
function createSolutionFromTemplate(solutionTemplateItem, requestOptions, settings, progressCallback) {
    if (settings === void 0) { settings = {}; }
    return new Promise(function (resolve, reject) {
        var templates = solutionTemplateItem.data.templates;
        var clonedSolution = [];
        settings.solutionName = settings.solutionName || "Solution";
        // Don't bother creating folder if there are no items in solution
        if (!templates || Object.keys(templates).length === 0) {
            resolve(clonedSolution);
        }
        // Run through the list of item ids in clone order
        var cloneOrderChecklist = topologicallySortItems(templates);
        // -------------------------------------------------------------------------
        // Common launch point whether using an existing folder or following the creation of one
        // Creates deployed solution item, then launches deployment of its items
        function launchDeployment() {
            createDeployedSolutionItem(settings.solutionName, solutionTemplateItem, requestOptions, settings, 'public')
                .then(function (solutionItem) {
                progressCallback({
                    processId: solutionItem.id,
                    type: "Solution",
                    status: "done"
                });
                runThroughChecklistInParallel();
            }, function () { return reject({ success: false }); });
        }
        // Trigger creation of all items in list and wait for completion
        function runThroughChecklistInParallel() {
            var awaitAllItems = [];
            cloneOrderChecklist.forEach(function (id) { return awaitAllItems.push(createItemFromTemplateWhenReady(id, templates, requestOptions, settings, progressCallback)); });
            // Wait until all items have been created
            Promise.all(awaitAllItems)
                .then(function (clonedSolutionItems) { return resolve(clonedSolutionItems); }, function () { return reject({ success: false }); });
        }
        // -------------------------------------------------------------------------
        // Use specified folder to hold the hydrated items to avoid name clashes
        if (settings.folderId) {
            launchDeployment();
        }
        else {
            // Create a folder to hold the hydrated items to avoid name clashes
            var folderName = settings.solutionName + " (" + mCommon.getUTCTimestamp() + ")";
            var options = {
                title: folderName,
                authentication: requestOptions.authentication
            };
            items.createFolder(options)
                .then(function (createdFolderResponse) {
                settings.folderId = createdFolderResponse.folder.id;
                launchDeployment();
            }, function () { return reject({ success: false }); });
        }
    });
}
exports.createSolutionFromTemplate = createSolutionFromTemplate;
/**
 * Returns the sum of the estimated cost factors of a set of templates.
 *
 * @param templates A collection of AGO item templates
 * @return Sum of cost factors
 */
function getEstimatedDeploymentCost(templates) {
    // Get the total estimated cost of creating this solution
    var reducer = function (accumulator, currentTemplate) {
        return accumulator + (currentTemplate.estimatedDeploymentCostFactor ?
            currentTemplate.estimatedDeploymentCostFactor : 3);
    };
    return templates.reduce(reducer, 0);
}
exports.getEstimatedDeploymentCost = getEstimatedDeploymentCost;
/**
 * Returns a list of the currently-supported AGO item types.
 *
 * @return List of item type names; names are all-lowercase forms of standard names
 */
function getSupportedItemTypes() {
    return mClassifier.getSupportedItemTypes();
}
exports.getSupportedItemTypes = getSupportedItemTypes;
// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)
/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGO, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
exports.PLACEHOLDER_SERVER_NAME = "{{organization.portalBaseUrl}}";
/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
exports.OPS_DASHBOARD_APP_URL_PART = "/apps/opsdashboard/index.html#/";
/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
exports.WEBMAP_APP_URL_PART = "/home/webmap/viewer.html?webmap=";
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
 * Creates an empty template.
 *
 * @param id AGO id of item
 * @return Empty template containing supplied id
 * @protected
 */
function createPlaceholderTemplate(id) {
    return {
        itemId: id,
        type: "",
        key: "",
        item: null
    };
}
/**
 * Creates an empty deployed solution AGO item.
 *
 * @param title Title to use for item
 * @param solutionTemplateItem Solution template to deploy; serves as source of text info for new
 *                             item
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Empty template item
 * @protected
 */
function createDeployedSolutionItem(title, solutionTemplateItem, requestOptions, settings, access) {
    if (settings === void 0) { settings = {}; }
    if (access === void 0) { access = "private"; }
    return new Promise(function (resolve, reject) {
        var templateItem = solutionTemplateItem.item;
        var thumbnailUrl = "https://www.arcgis.com/sharing/content/items/" +
            templateItem.id + "/info/" + templateItem.thumbnail;
        var item = {
            itemType: "text",
            name: null,
            title: title,
            description: templateItem.description,
            tags: templateItem.tags,
            snippet: templateItem.snippet,
            thumbnailurl: thumbnailUrl,
            accessInformation: templateItem.accessInformation,
            type: "Solution",
            typeKeywords: ["Solution", "Deployed"],
            commentsEnabled: false
        };
        mCommon.createItemWithData(item, null, requestOptions, settings.folderId, access)
            .then(function (createResponse) {
            var orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
            var deployedSolutionItem = {
                id: createResponse.id,
                url: orgUrl + "/home/item.html?id=" + createResponse.id
            };
            resolve(deployedSolutionItem);
        }, function () { return reject({ success: false }); });
    });
}
exports.createDeployedSolutionItem = createDeployedSolutionItem;
/**
 * Fetches an AGO item and converts it into a template after its dependencies have been fetched and
 * converted.
 *
 * @param itemId AGO id of solution template item to deploy
 * @param templates A collection of AGO item templates
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param progressCallback Function for reporting progress updates from type-specific template
 *                         handlers
 * @return A promise that will resolve with the item's template (which is simply returned if it's
 *         already in the templates list
 * @protected
 */
function createItemFromTemplateWhenReady(itemId, templates, requestOptions, settings, progressCallback) {
    settings[itemId] = {};
    var itemDef = new Promise(function (resolve, reject) {
        var template = findTemplateInList(templates, itemId);
        if (!template) {
            reject({ success: false });
        }
        // Wait until all dependencies are deployed
        var awaitDependencies = [];
        (template.dependencies || []).forEach(function (dependencyId) { return awaitDependencies.push(settings[dependencyId].def); });
        Promise.all(awaitDependencies)
            .then(function () {
            // Prepare template
            var itemTemplate = mClassifier.initItemTemplateFromJSON(findTemplateInList(templates, itemId));
            // Interpolate it
            itemTemplate.dependencies = itemTemplate.dependencies ?
                mCommon.templatize(itemTemplate.dependencies) : [];
            itemTemplate = adlib.adlib(itemTemplate, settings);
            // Deploy it
            itemTemplate.fcns.createItemFromTemplate(itemTemplate, settings, requestOptions, progressCallback)
                .then(function (itemClone) { return resolve(itemClone); }, function () { return reject({ success: false }); });
        }, function () { return reject({ success: false }); });
    });
    // Save the deferred for the use of items that depend on this item being created first
    settings[itemId].def = itemDef;
    return itemDef;
}
exports.createItemFromTemplateWhenReady = createItemFromTemplateWhenReady;
/**
 * Creates templates for a set of AGO items.
 *
 * @param ids AGO id string or list of AGO id strings
 * @param solutionTemplateItem Solution template serving as parent for templates
 * @param requestOptions Options for the request
 * @param templates A collection of AGO item templates that can be referenced by newly-created
 *                  templates
 * @return A promise that will resolve with the created template items
 * @protected
 */
function createSolutionItemTemplates(ids, solutionTemplateItem, requestOptions, templates) {
    if (!templates) {
        templates = [];
    }
    return new Promise(function (resolve, reject) {
        if (typeof ids === "string") {
            // Handle a single AGO id
            var rootId = ids;
            if (findTemplateInList(templates, rootId)) {
                resolve(templates); // Item and its dependents are already in list or are queued
            }
            else {
                // Add the id as a placeholder to show that it will be fetched
                var getItemPromise = mClassifier.convertItemToTemplate(rootId, requestOptions);
                templates.push(createPlaceholderTemplate(rootId));
                // Get the specified item
                getItemPromise
                    .then(function (itemTemplate) {
                    // Set the value keyed by the id, replacing the placeholder
                    replaceTemplate(templates, itemTemplate.itemId, itemTemplate);
                    // Trace item dependencies
                    if (itemTemplate.dependencies.length === 0) {
                        resolve(templates);
                    }
                    else {
                        // Get its dependents, asking each to get its dependents via
                        // recursive calls to this function
                        var dependentDfds_1 = [];
                        itemTemplate.dependencies.forEach(function (dependentId) {
                            if (!findTemplateInList(templates, dependentId)) {
                                dependentDfds_1.push(createSolutionItemTemplates(dependentId, solutionTemplateItem, requestOptions, templates));
                            }
                        });
                        Promise.all(dependentDfds_1)
                            .then(function () {
                            resolve(templates);
                        }, function () { return reject({ success: false }); });
                    }
                }, function () { return reject({ success: false }); });
            }
        }
        else if (Array.isArray(ids) && ids.length > 0) {
            // Handle a list of one or more AGO ids by stepping through the list
            // and calling this function recursively
            var getHierarchyPromise_1 = [];
            ids.forEach(function (id) {
                getHierarchyPromise_1.push(createSolutionItemTemplates(id, solutionTemplateItem, requestOptions, templates));
            });
            Promise.all(getHierarchyPromise_1)
                .then(function () {
                resolve(templates);
            }, function () { return reject({ success: false }); });
        }
        else {
            reject({ success: false });
        }
    });
}
exports.createSolutionItemTemplates = createSolutionItemTemplates;
/**
 * Creates an empty solution template AGO item.
 *
 * @param title The title to use for the item
 * @param version The version to include in the item's metadata
 * @param requestOptions Options for the request
 * @param settings Hash of facts: org URL, adlib replacements
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Empty template item
 * @protected
 */
function createSolutionTemplateItem(title, version, requestOptions, settings, access) {
    if (settings === void 0) { settings = {}; }
    if (access === void 0) { access = "private"; }
    return new Promise(function (resolve, reject) {
        var solutionTemplateItem = {
            item: {
                itemType: "text",
                name: null,
                title: title,
                type: "Solution",
                typeKeywords: ["Solution", "Template"],
                commentsEnabled: false
            },
            data: {
                metadata: {
                    version: version
                },
                templates: []
            }
        };
        mCommon.createItemWithData(solutionTemplateItem.item, solutionTemplateItem.data, requestOptions, settings.folderId, access)
            .then(function (createResponse) {
            var orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
            solutionTemplateItem.item.id = createResponse.id;
            solutionTemplateItem.item.url = orgUrl + "/home/item.html?id=" + createResponse.id;
            resolve(solutionTemplateItem);
        }, function () { return reject({ success: false }); });
    });
}
exports.createSolutionTemplateItem = createSolutionTemplateItem;
/**
 * Finds index of template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Id of matching template or -1 if not found
 * @protected
 */
function findTemplateIndexInSolution(templates, id) {
    var baseId = mCommon.deTemplatize(id);
    return templates.findIndex(function (template) {
        return baseId === mCommon.deTemplatize(template.itemId);
    });
}
/**
 * Finds template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Matching template or null
 */
function findTemplateInList(templates, id) {
    var childId = findTemplateIndexInSolution(templates, id);
    return childId >= 0 ? templates[childId] : null;
}
exports.findTemplateInList = findTemplateInList;
/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param templates Hash of JSON descriptions of items to publish into Solution
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the solution id
 * @protected
 */
function publishSolutionTemplate(title, templates, requestOptions, folderId, access) {
    if (folderId === void 0) { folderId = null; }
    if (access === void 0) { access = "private"; }
    // Define the solution item
    var item = {
        title: title,
        type: "Solution",
        itemType: "text",
        typeKeywords: ["Template"],
        access: access,
        listed: false,
        commentsEnabled: false
    };
    var data = {
        templates: templates
    };
    return mCommon.createItemWithData(item, data, requestOptions, folderId, access);
}
exports.publishSolutionTemplate = publishSolutionTemplate;
/**
 * Replaces a template entry in a list of templates
 *
 * @param templates A collection of AGO item templates
 * @param id Id of item in templates list to find; if not found, no replacement is () => done()
 * @param template Replacement template
 * @return True if replacement was made
 * @protected
 */
function replaceTemplate(templates, id, template) {
    var i = findTemplateIndexInSolution(templates, id);
    if (i >= 0) {
        templates[i] = template;
        return true;
    }
    return false;
}
exports.replaceTemplate = replaceTemplate;
/**
 * Topologically sort a Solution's items into a build list.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
function topologicallySortItems(templates) {
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
    var buildList = []; // list of ordered vertices--don't need linked list because
    // we just want relative ordering
    var verticesToVisit = {};
    templates.forEach(function (template) {
        verticesToVisit[template.itemId] = SortVisitColor.White; // not yet visited
    });
    // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
    templates.forEach(function (template) {
        if (verticesToVisit[template.itemId] === SortVisitColor.White) { // if not yet visited
            visit(template.itemId);
        }
    });
    // Visit vertex
    function visit(vertexId) {
        verticesToVisit[vertexId] = SortVisitColor.Gray; // visited, in progress
        // Visit dependents if not already visited
        var template = findTemplateInList(templates, vertexId);
        var dependencies = template.dependencies || [];
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
 * Updates the data section of an solution template in AGO.
 *
 * @param solutionTemplateItem Solution template to update
 * @param requestOptions Options for the request
 * @return A promise that will resolve with solutionTemplateItem
 * @protected
 */
function updateSolutionTemplateItem(solutionTemplateItem, requestOptions) {
    return new Promise(function (resolve, reject) {
        // Update the data section of the solution item
        mCommon.updateItemData(solutionTemplateItem.item.id, solutionTemplateItem.data, requestOptions)
            .then(function () { return resolve(solutionTemplateItem); }, function () { return reject({ success: false }); });
    });
}
//# sourceMappingURL=solution.js.map