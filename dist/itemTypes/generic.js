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
var tslib_1 = require("tslib");
var adlib = require("adlib");
var items = require("@esri/arcgis-rest-items");
var mCommon = require("./common");
// -- Externals ------------------------------------------------------------------------------------------------------//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//
function convertItemToTemplate(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        // Common templatizations: extent, item id, item dependency ids
        mCommon.doCommonTemplatizations(itemTemplate);
        resolve(itemTemplate);
    });
}
exports.convertItemToTemplate = convertItemToTemplate;
// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
function createItemFromTemplate(itemTemplate, settings, requestOptions, progressCallback) {
    progressCallback && progressCallback({
        processId: itemTemplate.key,
        type: itemTemplate.type,
        status: "starting"
    });
    return new Promise(function (resolve, reject) {
        var options = tslib_1.__assign({ item: itemTemplate.item, folder: settings.folderId }, requestOptions);
        if (itemTemplate.data) {
            options.item.text = itemTemplate.data;
        }
        // Create the item
        progressCallback && progressCallback({
            processId: itemTemplate.key,
            status: "creating",
        });
        items.createItemInFolder(options)
            .then(function (createResponse) {
            if (createResponse.success) {
                // Add the new item to the settings
                settings[mCommon.deTemplatize(itemTemplate.itemId)] = {
                    id: createResponse.id
                };
                itemTemplate.itemId = itemTemplate.item.id = createResponse.id;
                itemTemplate = adlib.adlib(itemTemplate, settings);
                mCommon.finalCallback(itemTemplate.key, true, progressCallback);
                resolve(itemTemplate);
            }
            else {
                mCommon.finalCallback(itemTemplate.key, false, progressCallback);
                reject({ success: false });
            }
        }, function () {
            mCommon.finalCallback(itemTemplate.key, false, progressCallback);
            reject({ success: false });
        });
    });
}
exports.createItemFromTemplate = createItemFromTemplate;
//# sourceMappingURL=generic.js.map