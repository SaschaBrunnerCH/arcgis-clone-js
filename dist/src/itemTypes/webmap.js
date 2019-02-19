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
// -------------------------------------------------------------------------------------------------------------------//
/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
var WEBMAP_APP_URL_PART = "/home/webmap/viewer.html?webmap=";
// -- Externals ------------------------------------------------------------------------------------------------------//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//
function convertItemToTemplate(itemTemplate, requestOptions) {
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
        // Extract dependencies
        itemTemplate.dependencies = extractDependencies(itemTemplate);
        resolve(itemTemplate);
    });
}
exports.convertItemToTemplate = convertItemToTemplate;
// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
function createItemFromTemplate(itemTemplate, settings, requestOptions, progressCallback) {
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
exports.createItemFromTemplate = createItemFromTemplate;
// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)
/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @return List of dependencies
 * @protected
 */
function extractDependencies(itemTemplate) {
    var dependencies = [];
    if (itemTemplate.data) {
        dependencies = getWebmapLayerIds(itemTemplate.data.operationalLayers).concat(getWebmapLayerIds(itemTemplate.data.tables));
    }
    return dependencies;
}
exports.extractDependencies = extractDependencies;
/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @return List containing id of each layer or table that has an itemId
 * @protected
 */
function getWebmapLayerIds(layerList) {
    if (layerList === void 0) { layerList = []; }
    return layerList.reduce(function (ids, layer) {
        var itemId = layer.itemId;
        if (itemId) {
            ids.push(itemId);
        }
        return ids;
    }, []);
}
exports.getWebmapLayerIds = getWebmapLayerIds;
function templatizeWebmapLayerIdsAndUrls(layerList) {
    if (layerList === void 0) { layerList = []; }
    layerList
        .filter(function (layer) { return !!layer.itemId; })
        .forEach(function (layer) {
        var layerId = layer.url.substr(layer.url.lastIndexOf("/"));
        layer.itemId = mCommon.templatize(layer.itemId);
        layer.url = mCommon.templatize(mCommon.deTemplatize(layer.itemId), "url") + layerId;
    });
}
exports.templatizeWebmapLayerIdsAndUrls = templatizeWebmapLayerIdsAndUrls;
//# sourceMappingURL=webmap.js.map