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
import * as adlib from "adlib";
import * as items from "@esri/arcgis-rest-items";
import * as mCommon from "./itemTypes/common";
import * as mClassifier from "./itemTypes/classifier";
// -- Externals ------------------------------------------------------------------------------------------------------//
/**
 * Converts one or more AGOL items and their dependencies into a hash by id of JSON item descriptions.
 *
 * ```typescript
 * import { ITemplate[] } from "../src/fullItemHierarchy";
 * import { createSolution } from "../src/solution";
 *
 * getFullItemHierarchy(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
 * .then(
 *   (response:ITemplate[]) => {
 *     let keys = Object.keys(response);
 *     console.log(keys.length);  // => "6"
 *     console.log((response[keys[0]] as ITemplate).type);  // => "Web Mapping Application"
 *     console.log((response[keys[0]] as ITemplate).item.title);  // => "ROW Permit Public Comment"
 *     console.log((response[keys[0]] as ITemplate).text.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
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
 * @return A promise that will resolve with a hash by id of IFullItems;
 * if any id is inaccessible, a single error response will be produced for the set
 * of ids
 */
export function createSolution(solutionRootIds, requestOptions) {
    return new Promise(function (resolve, reject) {
        // Get the items forming the solution
        getItemTemplateHierarchy(solutionRootIds, requestOptions)
            .then(function (solution) { return resolve(solution); }, reject);
    });
}
/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param solution Hash of JSON descriptions of items to publish into Solution
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function publishSolution(title, solution, requestOptions, folderId, access) {
    if (folderId === void 0) { folderId = null; }
    if (access === void 0) { access = "private"; }
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
        templates: solution
    };
    return mCommon.createItemWithData(item, data, requestOptions, folderId, access);
}
/**
 * Converts a hash by id of generic JSON item descriptions into AGOL items.
 *
 * @param solution A hash of item descriptions to convert; note that the item ids are updated
 *     to their cloned versions
 * @param requestOptions Options for the request
 * @param orgUrl The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
 * @param portalUrl The base URL for the portal, e.g., https://www.arcgis.com
 * @param solutionName Name root to use if folder is to be created
 * @param folderId AGOL id of folder to receive item, or null/empty if folder is to be created;
 *     if created, folder name is a combination of the solution name and a timestamp for uniqueness,
 *     e.g., "Dashboard (1540841846958)"
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with a list of the ids of items created in AGOL
 */
export function cloneSolution(solution, requestOptions, settings) {
    if (settings === void 0) { settings = {}; }
    return new Promise(function (resolve, reject) {
        var clonedSolution = [];
        // Don't bother creating folder if there are no items in solution
        if (!solution || Object.keys(solution).length === 0) {
            resolve(clonedSolution);
        }
        // Run through the list of item ids in clone order
        var cloneOrderChecklist = topologicallySortItems(solution);
        // -------------------------------------------------------------------------
        function runThroughChecklist() {
            if (cloneOrderChecklist.length === 0) {
                resolve(clonedSolution);
                return;
            }
            // Clone item at top of list
            var itemId = cloneOrderChecklist.shift();
            var itemTemplate = mClassifier.initItemTemplateFromJSON(getTemplateInSolution(solution, itemId));
            // Interpolate template
            itemTemplate = adlib.adlib(itemTemplate, settings);
            // Deploy it
            itemTemplate.fcns.deployItem(itemTemplate, settings, requestOptions)
                .then(function (itemClone) {
                clonedSolution.push(itemClone);
                runThroughChecklist();
            }, reject);
        }
        // -------------------------------------------------------------------------
        // Use specified folder to hold the hydrated items to avoid name clashes
        if (settings.folderId) {
            runThroughChecklist();
        }
        else {
            // Create a folder to hold the hydrated items to avoid name clashes
            var folderName = (settings.solutionName || "Solution") + " (" + mCommon.getTimestamp() + ")";
            var options = {
                title: folderName,
                authentication: requestOptions.authentication
            };
            items.createFolder(options)
                .then(function (createdFolderResponse) {
                settings.folderId = createdFolderResponse.folder.id;
                runThroughChecklist();
            }, function (error) {
                reject(error.response.error.message);
            });
        }
    });
}
/**
 * Finds template by id in a list of templates.
 *
 * @param templates List of templates to search
 * @param id AGOL id of template to find
 * @return Matching template or null
 */
export function getTemplateInSolution(templates, id) {
    var childId = getTemplateIndexInSolution(templates, id);
    return childId >= 0 ? templates[childId] : null;
}
// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)
/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGOL, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export var PLACEHOLDER_SERVER_NAME = "{{organization.portalBaseUrl}}";
/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export var OPS_DASHBOARD_APP_URL_PART = "/apps/opsdashboard/index.html#/";
/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
export var WEBMAP_APP_URL_PART = "/home/webmap/viewer.html?webmap=";
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
 * @param id AGOL id of item
 * @return Empty item containing supplied id
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
export function getItemTemplateHierarchy(rootIds, requestOptions, templates) {
    if (!templates) {
        templates = [];
    }
    return new Promise(function (resolve, reject) {
        if (typeof rootIds === "string") {
            // Handle a single AGOL id
            var rootId = rootIds;
            if (getTemplateInSolution(templates, rootId)) {
                resolve(templates); // Item and its dependents are already in list or are queued
            }
            else {
                // Add the id as a placeholder to show that it will be fetched
                var getItemPromise = mClassifier.initItemTemplateFromId(rootId, requestOptions);
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
                            if (!getTemplateInSolution(templates, dependentId)) {
                                dependentDfds_1.push(getItemTemplateHierarchy(dependentId, requestOptions, templates));
                            }
                        });
                        Promise.all(dependentDfds_1)
                            .then(function () {
                            resolve(templates);
                        }, function (error) { return reject(error); });
                    }
                }, function (error) { return reject(error); });
            }
        }
        else if (Array.isArray(rootIds) && rootIds.length > 0) {
            // Handle a list of one or more AGOL ids by stepping through the list
            // and calling this function recursively
            var getHierarchyPromise_1 = [];
            rootIds.forEach(function (rootId) {
                getHierarchyPromise_1.push(getItemTemplateHierarchy(rootId, requestOptions, templates));
            });
            Promise.all(getHierarchyPromise_1)
                .then(function () {
                resolve(templates);
            }, function (error) { return reject(error); });
        }
        else {
            reject(mCommon.createUnavailableItemError(null));
        }
    });
}
/**
 * Finds index of template by id in a list of templates.
 *
 * @param templates List of templates to search
 * @param id AGOL id of template to find
 * @return Id of matching template or -1 if not found
 * @protected
 */
function getTemplateIndexInSolution(templates, id) {
    var baseId = mCommon.deTemplatize(id);
    return templates.findIndex(function (template) {
        return baseId === mCommon.deTemplatize(template.itemId);
    });
}
/**
 * Replaces a template entry in a list of templates
 *
 * @param templates Templates list
 * @param id Id of item in templates list to find; if not found, no replacement is done
 * @param template Replacement template
 * @return True if replacement was made
 * @protected
 */
export function replaceTemplate(templates, id, template) {
    var i = getTemplateIndexInSolution(templates, id);
    if (i >= 0) {
        templates[i] = template;
        return true;
    }
    return false;
}
/**
 * Topologically sort a Solution's items into a build list.
 *
 * @param items Hash of JSON descriptions of items
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
export function topologicallySortItems(fullItems) {
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
    fullItems.forEach(function (template) {
        verticesToVisit[template.itemId] = SortVisitColor.White; // not yet visited
    });
    // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
    fullItems.forEach(function (template) {
        if (verticesToVisit[template.itemId] === SortVisitColor.White) { // if not yet visited
            visit(template.itemId);
        }
    });
    // Visit vertex
    function visit(vertexId) {
        verticesToVisit[vertexId] = SortVisitColor.Gray; // visited, in progress
        // Visit dependents if not already visited
        var template = getTemplateInSolution(fullItems, vertexId);
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
//# sourceMappingURL=solution.js.map