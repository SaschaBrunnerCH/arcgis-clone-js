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
        define(["require", "exports", "./fullItem", "./dependencies"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fullItem_1 = require("./fullItem");
    var dependencies_1 = require("./dependencies");
    /**
     * Fetches the item, data, and resources of one or more AGOL items and their dependencies.
     *
     * ```typescript
     * import { IItemHash, getFullItemHierarchy } from "../src/fullItemHierarchy";
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
     * @param rootIds AGOL id string or list of AGOL id strings
     * @param requestOptions Options for requesting information from AGOL
     * @param collection A hash of items already converted useful for avoiding duplicate conversions and
     * hierarchy tracing
     * @returns A promise that will resolve with a hash by id of IFullItems;
     * if any id is inaccessible, a single error response will be produced for the set
     * of ids
     */
    function getFullItemHierarchy(rootIds, requestOptions, collection) {
        if (!collection) {
            collection = {};
        }
        return new Promise(function (resolve, reject) {
            if (!rootIds || (Array.isArray(rootIds) && rootIds.length === 0)) {
                reject(fullItem_1.createUnavailableItemError(null));
            }
            else if (typeof rootIds === "string") {
                // Handle a single AGOL id
                var rootId_1 = rootIds;
                if (collection[rootId_1]) {
                    resolve(collection); // Item and its dependents are already in list or are queued
                }
                else {
                    // Add the id as a placeholder to show that it will be fetched
                    var getItemPromise = fullItem_1.getFullItem(rootId_1, requestOptions);
                    collection[rootId_1] = getItemPromise;
                    // Get the specified item
                    getItemPromise
                        .then(function (fullItem) {
                        // Set the value keyed by the id
                        collection[rootId_1] = fullItem;
                        dependencies_1.getDependencies(fullItem, requestOptions)
                            .then(function (dependencies) {
                            fullItem.dependencies = dependencies;
                            if (dependencies.length === 0) {
                                resolve(collection);
                            }
                            else {
                                // Get its dependents, asking each to get its dependents via
                                // recursive calls to this function
                                var dependentDfds_1 = [];
                                dependencies.forEach(function (dependentId) {
                                    if (!collection[dependentId]) {
                                        dependentDfds_1.push(getFullItemHierarchy(dependentId, requestOptions, collection));
                                    }
                                });
                                Promise.all(dependentDfds_1)
                                    .then(function () {
                                    resolve(collection);
                                }, function (error) { return reject(error); });
                            }
                        }, function (error) { return reject(error); });
                    }, function (error) { return reject(error); });
                }
            }
            else {
                // Handle a list of one or more AGOL ids by stepping through the list
                // and calling this function recursively
                var getHierarchyPromise_1 = [];
                rootIds.forEach(function (rootId) {
                    getHierarchyPromise_1.push(getFullItemHierarchy(rootId, requestOptions, collection));
                });
                Promise.all(getHierarchyPromise_1)
                    .then(function () {
                    resolve(collection);
                }, function (error) { return reject(error); });
            }
        });
    }
    exports.getFullItemHierarchy = getFullItemHierarchy;
});
//# sourceMappingURL=fullItemHierarchy.js.map