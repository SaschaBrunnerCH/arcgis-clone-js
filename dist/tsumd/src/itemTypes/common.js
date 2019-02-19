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
        define(["require", "exports", "tslib", "@esri/arcgis-rest-sharing", "@esri/arcgis-rest-items"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var sharing = require("@esri/arcgis-rest-sharing");
    var items = require("@esri/arcgis-rest-items");
    // -------------------------------------------------------------------------------------------------------------------//
    /**
     * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
     * itself; name has to be acceptable to AGOL, otherwise it discards the URL, so substitution must be
     * made before attempting to create the item.
     * @protected
     */
    exports.PLACEHOLDER_SERVER_NAME = "{{organization.portalBaseUrl}}";
    function doCommonTemplatizations(itemTemplate) {
        // Use the initiative's extent
        if (itemTemplate.item.extent) {
            itemTemplate.item.extent = "{{initiative.extent:optional}}";
        }
        // Templatize the item's id
        itemTemplate.item.id = templatize(itemTemplate.item.id);
    }
    exports.doCommonTemplatizations = doCommonTemplatizations;
    /**
     * Publishes an item and its data as an AGOL item.
     *
     * @param item Item's `item` section
     * @param data Item's `data` section
     * @param requestOptions Options for the request
     * @param folderId Id of folder to receive item; null indicates that the item goes into the root
     *                 folder; ignored for Group item type
     * @param access Access to set for item: 'public', 'org', 'private'
     * @return A promise that will resolve with an object reporting success and the Solution id
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
                    var options1 = tslib_1.__assign({ id: results.id, access: access }, requestOptions);
                    sharing.setItemAccess(options1)
                        .then(function (results2) {
                        resolve({
                            success: true,
                            id: results2.itemId
                        });
                    }, function () { return reject({ success: false }); });
                }
                else {
                    resolve({
                        success: true,
                        id: results.id
                    });
                }
            }, function () { return reject({ success: false }); });
        });
    }
    exports.createItemWithData = createItemWithData;
    function deTemplatize(id) {
        if (Array.isArray(id)) {
            return deTemplatizeList(id);
        }
        if (id && id.startsWith("{{")) {
            return id.substring(2, id.indexOf("."));
        }
        else {
            return id;
        }
    }
    exports.deTemplatize = deTemplatize;
    function deTemplatizeList(ids) {
        return ids.map(function (id) {
            return deTemplatize(id);
        });
    }
    function finalCallback(key, successful, progressCallback) {
        progressCallback && progressCallback({
            processId: key,
            status: successful ? "done" : "failed"
        });
    }
    exports.finalCallback = finalCallback;
    /**
     * Creates a timestamp string using the current date and time.
     *
     * @return Timestamp
     * @protected
     */
    function getUTCTimestamp() {
        var now = new Date();
        return padPositiveNum(now.getUTCFullYear(), 4) + padPositiveNum(now.getUTCMonth() + 1, 2) +
            padPositiveNum(now.getUTCDate(), 2) + "_" + padPositiveNum(now.getUTCHours(), 2) +
            padPositiveNum(now.getUTCMinutes(), 2) + "_" + padPositiveNum(now.getUTCSeconds(), 2) +
            padPositiveNum(now.getUTCMilliseconds(), 3);
    }
    exports.getUTCTimestamp = getUTCTimestamp;
    function padPositiveNum(n, totalSize) {
        var numStr = n.toString();
        var numPads = totalSize - numStr.length;
        if (numPads > 0) {
            numStr = "0".repeat(numPads) + numStr; // TODO IE11 does not support repeat()
        }
        return numStr;
    }
    function templatize(id, param) {
        if (param === void 0) { param = "id"; }
        if (Array.isArray(id)) {
            return templatizeList(id, param);
        }
        if (id && id.startsWith("{{")) {
            return id;
        }
        else {
            return "{{" + id + "." + param + "}}";
        }
    }
    exports.templatize = templatize;
    function templatizeList(ids, param) {
        if (param === void 0) { param = "id"; }
        return ids.map(function (id) {
            return templatize(id, param);
        });
    }
    exports.templatizeList = templatizeList;
    /**
     * Updates the URL of an item.
     *
     * @param id AGOL id of item to update
     * @param url URL to assign to item's base section
     * @param requestOptions Options for the request
     * @return A promise that will resolve when the item has been updated
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
            }, function () { return reject(); });
        });
    }
    exports.updateItemURL = updateItemURL;
});
//# sourceMappingURL=common.js.map