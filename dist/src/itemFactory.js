/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@esri/arcgis-rest-groups", "@esri/arcgis-rest-items", "@esri/arcgis-rest-request", "./dashboard", "./FeatureService", "./item", "./group", "./webmap", "./webMappingApp"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var groups = require("@esri/arcgis-rest-groups");
    var items = require("@esri/arcgis-rest-items");
    var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
    var dashboard_1 = require("./dashboard");
    var FeatureService_1 = require("./FeatureService");
    var item_1 = require("./item");
    var group_1 = require("./group");
    var webmap_1 = require("./webmap");
    var webMappingApp_1 = require("./webMappingApp");
    var ItemFactory = /** @class */ (function () {
        function ItemFactory() {
        }
        /**
         * Instantiates an item subclass using an AGOL id to load the item and get its type.
         *
         * ```typescript
         * import { ItemFactory } from "../src/itemFactory";
         * import { AgolItem } from "../src/agolItem";
         * import { Item } from "../src/item";
         *
         * ItemFactory.itemToJSON("6fc5992522d34f26b2210d17835eea21")
         * .then(
         *   (response:AgolItem) => {
         *     console.log(response.type);  // => "Web Mapping Application"
         *     console.log(response.itemSection.title);  // => "ROW Permit Public Comment"
         *     console.log((response as Item).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
         *   },
         *   error => {
         *     // (should not see this as long as above id--a real one--stays available)
         *     console.log(error); // => "Item or group does not exist or is inaccessible."
         *   }
         * );
         * ```
         *
         * @param id AGOL id string
         * @param requestOptions Options for the request
         * @returns A promise that will resolve with a subclass of AgolItem
         */
        ItemFactory.itemToJSON = function (id, requestOptions) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                try {
                    // Fetch item base section
                    items.getItem(_this.baseId(id), requestOptions)
                        .then(function (itemSection) {
                        var newItem;
                        switch (itemSection.type) {
                            case "Dashboard":
                                newItem = new dashboard_1.Dashboard(itemSection);
                                break;
                            case "Feature Service":
                                newItem = new FeatureService_1.FeatureService(itemSection);
                                break;
                            case "Web Map":
                                newItem = new webmap_1.Webmap(itemSection);
                                break;
                            case "Web Mapping Application":
                                newItem = new webMappingApp_1.WebMappingApp(itemSection);
                                break;
                            default:
                                newItem = new item_1.Item(itemSection);
                                break;
                        }
                        newItem.init(requestOptions)
                            .then(resolve);
                    }, function () {
                        // If it fails, try URL for group base section
                        groups.getGroup(id, requestOptions)
                            .then(function (itemSection) {
                            var newGroup = new group_1.Group(itemSection);
                            newGroup.init(requestOptions)
                                .then(resolve);
                        }, function () {
                            var error = new arcgis_rest_request_1.ArcGISRequestError("Item or group does not exist or is inaccessible.");
                            reject(error);
                        });
                    });
                }
                catch (notUsed) {
                    var error = new arcgis_rest_request_1.ArcGISRequestError("Item or group does not exist or is inaccessible.");
                    reject(error);
                }
            });
        };
        /**
         * Instantiates an item subclass and its dependencies using an AGOL id to load the item and get its type.
         *
         * ```typescript
         * import { ItemFactory, IItemHash } from "../src/itemFactory";
         * import { AgolItem } from "../src/agolItem";
         * import { Item } from "../src/item";
         *
         * ItemFactory.itemToJSON(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
         * .then(
         *   (response:IItemHash) => {
         *     let keys = Object.keys(response);
         *     console.log(keys.length);  // => "6"
         *     console.log((response[keys[0]] as AgolItem).type);  // => "Web Mapping Application"
         *     console.log((response[keys[0]] as AgolItem).itemSection.title);  // => "ROW Permit Public Comment"
         *     console.log((response[keys[0]] as Item).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
         *   },
         *   error => {
         *     // (should not see this as long as both of the above ids--real ones--stay available)
         *     console.log(error); // => "Item or group does not exist or is inaccessible."
         *   }
         * );
         * ```
         *
         * @param rootIds AGOL id string or list of AGOL id strings
         * @param requestOptions Options for the request
         * @param collection A hash of items already converted useful for avoiding duplicate conversions and
         * hierarchy tracing
         * @returns A promise that will resolve with a hash by id of subclasses of AgolItem;
         * if either id is inaccessible, a single error response will be produced for the set
         * of ids
         */
        ItemFactory.itemHierarchyToJSON = function (rootIds, requestOptions, collection) {
            var _this = this;
            if (!collection) {
                collection = {};
            }
            return new Promise(function (resolve, reject) {
                if (typeof rootIds === "string") {
                    // Handle a single AGOL id
                    var rootId_1 = rootIds;
                    if (collection[_this.baseId(rootId_1)]) {
                        resolve(collection); // Item and its dependents are already in list or are queued
                    }
                    else {
                        // Add the id as a placeholder to show that it will be fetched
                        var itemFetchDfd = _this.itemToJSON(rootId_1, requestOptions);
                        collection[_this.baseId(rootId_1)] = itemFetchDfd;
                        // Get the specified item
                        itemFetchDfd
                            .then(function (item) {
                            // Set the value keyed by the id
                            collection[_this.baseId(rootId_1)] = item;
                            if (item.dependencies.length === 0) {
                                resolve(collection);
                            }
                            else {
                                // Get its dependents, asking each to get its dependents via
                                // recursive calls to this function
                                var dependentDfds_1 = [];
                                item.dependencies.forEach(function (dependentId) {
                                    if (!collection[_this.baseId(dependentId)]) {
                                        dependentDfds_1.push(_this.itemHierarchyToJSON(dependentId, requestOptions, collection));
                                    }
                                });
                                Promise.all(dependentDfds_1)
                                    .then(function () {
                                    resolve(collection);
                                });
                            }
                        }, function () {
                            var error = new arcgis_rest_request_1.ArcGISRequestError("Item or group does not exist or is inaccessible.");
                            reject(error);
                        });
                    }
                }
                else {
                    // Handle a list of one or more AGOL ids by stepping through the list
                    // and calling this function recursively
                    var hierarchyDfds_1 = [];
                    rootIds.forEach(function (rootId) {
                        hierarchyDfds_1.push(_this.itemHierarchyToJSON(rootId, requestOptions, collection));
                    });
                    Promise.all(hierarchyDfds_1)
                        .then(function () {
                        resolve(collection);
                    }, function () {
                        // A failure to get an id causes an error response from this function regardless of how
                        // many valid ids were also supplied
                        var error = new arcgis_rest_request_1.ArcGISRequestError("Item or group does not exist or is inaccessible.");
                        reject(error);
                    });
                }
            });
        };
        /**
         * Extracts the AGOL id from the front of a string.
         *
         * @param extendedId A string of hex characters that begins with an AGOL id;
         *   characters including and after "_" are considered a modifier
         * @returns An AGOL id
         */
        ItemFactory.baseId = function (extendedId) {
            var iModifierFlag = extendedId.indexOf("_");
            if (iModifierFlag < 0) {
                return extendedId;
            }
            else {
                return extendedId.substr(0, iModifierFlag);
            }
        };
        return ItemFactory;
    }());
    exports.ItemFactory = ItemFactory;
});
//# sourceMappingURL=itemFactory.js.map