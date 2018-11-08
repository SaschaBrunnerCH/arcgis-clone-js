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
        define(["require", "exports", "tslib", "@esri/arcgis-rest-items", "@esri/arcgis-rest-groups", "@esri/arcgis-rest-request"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var items = require("@esri/arcgis-rest-items");
    var groups = require("@esri/arcgis-rest-groups");
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
                    resolve(fullItem);
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
                    resolve(fullItem);
                }, function () {
                    reject(createUnavailableItemError(id));
                });
            });
        });
    }
    exports.getFullItem = getFullItem;
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
});
//# sourceMappingURL=fullItem.js.map