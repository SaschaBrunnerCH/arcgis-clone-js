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
var object_helpers_1 = require("../utils/object-helpers");
var item_helpers_1 = require("../utils/item-helpers");
var items = require("@esri/arcgis-rest-items");
var mCommon = require("./common");
var storymap_1 = require("./storymap");
var webappbuilder_1 = require("./webappbuilder");
// -- Externals ------------------------------------------------------------------------------------------------------//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//
function completeItemTemplate(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        // Update the estimated cost factor to deploy this item
        itemTemplate.estimatedDeploymentCostFactor = 4;
        // Common templatizations: extent, item id, item dependency ids
        mCommon.doCommonTemplatizations(itemTemplate);
        // Remove org base URL and app id, e.g.,
        //   http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21
        // to
        //   <PLACEHOLDER_SERVER_NAME>/apps/CrowdsourcePolling/index.html?appid={{<itemId>.id}}
        // Need to add placeholder server name because otherwise AGOL makes URL null
        var templatizedUrl = itemTemplate.item.url;
        var iSep = templatizedUrl.indexOf("//");
        itemTemplate.item.url = mCommon.PLACEHOLDER_SERVER_NAME + // add placeholder server name
            templatizedUrl.substring(templatizedUrl.indexOf("/", iSep + 2), templatizedUrl.lastIndexOf("=") + 1) +
            mCommon.templatize(itemTemplate.itemId);
        // Set the folder
        if (object_helpers_1.getProp(itemTemplate, "data.folderId")) {
            itemTemplate.data.folderId = "{{folderId}}";
        }
        // Set the map or group
        if (object_helpers_1.getProp(itemTemplate, "data.values.webmap")) {
            itemTemplate.data.values.webmap = mCommon.templatize(itemTemplate.data.values.webmap);
        }
        else if (object_helpers_1.getProp(itemTemplate, "data.values.group")) {
            itemTemplate.data.values.group = mCommon.templatize(itemTemplate.data.values.group);
        }
        resolve(itemTemplate);
    });
}
exports.completeItemTemplate = completeItemTemplate;
/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
function getDependencies(model) {
    var processor = getGenericWebAppDependencies;
    if (item_helpers_1.hasTypeKeyword(model, 'Story Map')) {
        processor = storymap_1.getDependencies;
    }
    if (item_helpers_1.hasAnyKeyword(model, ['WAB2D', 'WAB3D', 'Web AppBuilder'])) {
        processor = webappbuilder_1.getDependencies;
    }
    return processor(model);
}
exports.getDependencies = getDependencies;
;
/**
 * Generic Web App Dependencies
 */
function getGenericWebAppDependencies(model) {
    var props = ['data.webmap', 'data.itemId', 'data.values.webmap', 'data.values.group'];
    return Promise.resolve(object_helpers_1.getProps(model, props));
}
exports.getGenericWebAppDependencies = getGenericWebAppDependencies;
;
// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
function deployItem(itemTemplate, settings, requestOptions, progressCallback) {
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
exports.deployItem = deployItem;
//# sourceMappingURL=webmappingapplication.js.map