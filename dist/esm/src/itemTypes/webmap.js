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
// -------------------------------------------------------------------------------------------------------------------//
/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
var WEBMAP_APP_URL_PART = "/home/webmap/viewer.html?webmap=";
// -- Externals ------------------------------------------------------------------------------------------------------//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//
export function completeItemTemplate(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        // Update the estimated cost factor to deploy this item
        itemTemplate.estimatedDeploymentCostFactor = 4;
        // Common templatizations: extent, item id, item dependency ids
        mCommon.doCommonTemplatizations(itemTemplate);
        // Templatize the app URL
        itemTemplate.item.url =
            mCommon.PLACEHOLDER_SERVER_NAME + WEBMAP_APP_URL_PART + mCommon.templatize(itemTemplate.itemId);
        // Templatize the map layer ids
        if (itemTemplate.data) {
            templatizeWebmapLayerIdsAndUrls(itemTemplate.data.operationalLayers);
            templatizeWebmapLayerIdsAndUrls(itemTemplate.data.tables);
        }
        resolve(itemTemplate);
    });
}
/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        var dependencies = [];
        if (itemTemplate.data) {
            dependencies = getWebmapLayerIds(itemTemplate.data.operationalLayers).concat(getWebmapLayerIds(itemTemplate.data.tables));
        }
        resolve(dependencies);
    });
}
// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
export function deployItem(itemTemplate, settings, requestOptions, progressCallback) {
    progressCallback && progressCallback({
        processId: itemTemplate.key,
        type: itemTemplate.type,
        status: "starting",
        estimatedCostFactor: itemTemplate.estimatedDeploymentCostFactor
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
                // Update the app URL
                progressCallback && progressCallback({
                    processId: itemTemplate.key,
                    status: "updating URL"
                });
                mCommon.updateItemURL(itemTemplate.itemId, itemTemplate.item.url, requestOptions)
                    .then(function () {
                    mCommon.finalCallback(itemTemplate.key, true, progressCallback);
                    resolve(itemTemplate);
                }, function () {
                    mCommon.finalCallback(itemTemplate.key, false, progressCallback);
                    reject({ success: false });
                });
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
// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)
/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @return List containing id of each layer or table that has an itemId
 * @protected
 */
export function getWebmapLayerIds(layerList) {
    if (layerList === void 0) { layerList = []; }
    return layerList.reduce(function (ids, layer) {
        var itemId = layer.itemId;
        if (itemId) {
            ids.push(itemId);
        }
        return ids;
    }, []);
}
export function templatizeWebmapLayerIdsAndUrls(layerList) {
    if (layerList === void 0) { layerList = []; }
    layerList
        .filter(function (layer) { return !!layer.itemId; })
        .forEach(function (layer) {
        var layerId = layer.url.substr(layer.url.lastIndexOf("/"));
        layer.itemId = mCommon.templatize(layer.itemId);
        layer.url = mCommon.templatize(mCommon.deTemplatize(layer.itemId), "url") + layerId;
    });
}
//# sourceMappingURL=webmap.js.map