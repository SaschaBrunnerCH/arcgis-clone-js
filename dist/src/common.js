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
        define(["require", "exports", "tslib", "@esri/arcgis-rest-items", "@esri/arcgis-rest-sharing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var items = require("@esri/arcgis-rest-items");
    var sharing = require("@esri/arcgis-rest-sharing");
    /**
     * Publishes an item and its data as an AGOL item.
     *
     * @param item Item's `item` section
     * @param data Item's `data` section
     * @param requestOptions Options for the request
     * @param folderId Id of folder to receive item; null indicates that the item goes into the root
     *                 folder; ignored for Group item type
     * @param access Access to set for item: 'public', 'org', 'private'
     * @returns A promise that will resolve with an object reporting success and the Solution id
     */
    function createItemWithData(item, data, requestOptions, folderId, access) {
        if (folderId === void 0) { folderId = null; }
        if (access === void 0) { access = "private"; }
        return new Promise(function (resolve, reject) {
            var options = tslib_1.__assign({ item: item, folder: folderId }, requestOptions);
            if (data) {
                options.item.text = data;
            }
            // Create item and add its optional data section
            items.createItemInFolder(options)
                .then(function (results) {
                if (access !== "private") { // set access if it is not AGOL default
                    // Set the access manually since the access value in createItem appears to be ignored
                    var options_1 = tslib_1.__assign({ id: results.id, access: access }, requestOptions);
                    sharing.setItemAccess(options_1)
                        .then(function (results) {
                        resolve({
                            success: true,
                            id: results.itemId
                        });
                    }, function (error) { return reject(error.originalMessage); });
                }
                else {
                    resolve({
                        success: true,
                        id: results.id
                    });
                }
            }, function (error) { return reject(error.originalMessage); });
        });
    }
    exports.createItemWithData = createItemWithData;
    /**
     * Updates the URL of an item.
     *
     * @param id AGOL id of item to update
     * @param url URL to assign to item's base section
     * @param requestOptions Options for the request
     * @returns A promise that will resolve when the item has been updated
     */
    function updateItemURL(id, url, requestOptions) {
        return new Promise(function (resolve, reject) {
            // Update its URL
            var options = tslib_1.__assign({ item: {
                    'id': id,
                    'url': url
                } }, requestOptions);
            items.updateItem(options)
                .then(function (updateResp) {
                resolve(id);
            }, reject);
        });
    }
    exports.updateItemURL = updateItemURL;
});
//# sourceMappingURL=common.js.map