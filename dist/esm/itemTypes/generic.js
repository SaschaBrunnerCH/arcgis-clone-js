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
import * as tslib_1 from "tslib";
import * as adlib from "adlib";
import * as items from "@esri/arcgis-rest-items";
import * as mCommon from "./common";
// -- Externals ------------------------------------------------------------------------------------------------------//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//
export function completeItemTemplate(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        // Common templatizations: extent, item id, item dependency ids
        mCommon.doCommonTemplatizations(itemTemplate);
        resolve(itemTemplate);
    });
}
export function getDependencies(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        resolve([]);
    });
}
// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
export function deployItem(itemTemplate, settings, requestOptions) {
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
//# sourceMappingURL=generic.js.map