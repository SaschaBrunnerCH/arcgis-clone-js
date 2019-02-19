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
        define(["require", "exports", "tslib", "adlib", "@esri/arcgis-rest-items", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var adlib = require("adlib");
    var items = require("@esri/arcgis-rest-items");
    var mCommon = require("./common");
    // -- Externals ------------------------------------------------------------------------------------------------------//
    // -- Create Bundle Process ------------------------------------------------------------------------------------------//
    function completeItemTemplate(itemTemplate, requestOptions) {
        return new Promise(function (resolve) {
            // Common templatizations: extent, item id, item dependency ids
            mCommon.doCommonTemplatizations(itemTemplate);
            resolve(itemTemplate);
        });
    }
    exports.completeItemTemplate = completeItemTemplate;
    function getDependencies(itemTemplate, requestOptions) {
        return new Promise(function (resolve) {
            resolve([]);
        });
    }
    exports.getDependencies = getDependencies;
    // -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
    function deployItem(itemTemplate, settings, requestOptions) {
        return new Promise(function (resolve, reject) {
            var options = tslib_1.__assign({ item: itemTemplate.item, folder: settings.folderId }, requestOptions);
            if (itemTemplate.data) {
                options.item.text = itemTemplate.data;
            }
            // Create the item
            items.createItemInFolder(options)
                .then(function (createResponse) {
                // Add the new item to the settings
                settings[mCommon.deTemplatize(itemTemplate.itemId)] = {
                    id: createResponse.id
                };
                itemTemplate.itemId = itemTemplate.item.id = createResponse.id;
                itemTemplate = adlib.adlib(itemTemplate, settings);
                resolve(itemTemplate);
            }, function (error) { return reject(error.response.error.message); });
        });
    }
    exports.deployItem = deployItem;
});
//# sourceMappingURL=generic.js.map