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
import { getProp } from '../utils/object-helpers';
/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export var OPS_DASHBOARD_APP_URL_PART = "/apps/opsdashboard/index.html#/";
// -- Externals ------------------------------------------------------------------------------------------------------//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//
export function completeItemTemplate(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        // Common templatizations: extent, item id, item dependency ids
        mCommon.doCommonTemplatizations(itemTemplate);
        // Templatize the app URL
        itemTemplate.item.url = mCommon.PLACEHOLDER_SERVER_NAME + OPS_DASHBOARD_APP_URL_PART;
        resolve(itemTemplate);
    });
}
/**
 * Gets the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        var dependencies = [];
        var widgets = getProp(itemTemplate, "data.widgets");
        if (widgets) {
            widgets.forEach(function (widget) {
                if (widget.type === "mapWidget") {
                    dependencies.push(widget.itemId);
                }
            });
        }
        resolve(dependencies);
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
            // Update the app URL
            mCommon.updateItemURL(itemTemplate.itemId, itemTemplate.item.url, requestOptions)
                .then(function () { return resolve(itemTemplate); }, function (error) { return reject(error.response.error.message); });
        }, function (error) { return reject(error.response.error.message); });
    });
}
//# sourceMappingURL=dashboard.js.map