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
var groups = require("@esri/arcgis-rest-groups");
var sharing = require("@esri/arcgis-rest-sharing");
var mCommon = require("./common");
// -- Externals ------------------------------------------------------------------------------------------------------//
//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//
function completeItemTemplate(itemTemplate, requestOptions) {
    return new Promise(function (resolve) {
        // Update the estimated cost factor to deploy this item
        itemTemplate.estimatedDeploymentCostFactor = 3;
        // Common templatizations: item id, item dependency ids
        mCommon.doCommonTemplatizations(itemTemplate);
        resolve(itemTemplate);
    });
}
exports.completeItemTemplate = completeItemTemplate;
/**
 * Gets the ids of the dependencies (contents) of an AGOL group.
 *
 * @param fullItem A group whose contents are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
function getDependencies(itemTemplate, requestOptions) {
    return new Promise(function (resolve, reject) {
        var pagingRequest = tslib_1.__assign({ paging: {
                start: 1,
                num: 100
            } }, requestOptions);
        // Fetch group items
        getGroupContentsTranche(itemTemplate.itemId, pagingRequest)
            .then(function (contents) {
            // Update the estimated cost factor to deploy this item
            itemTemplate.estimatedDeploymentCostFactor = 3 + contents.length;
            resolve(contents);
        }, function () { return reject({ success: false }); });
    });
}
exports.getDependencies = getDependencies;
// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
function deployItem(itemTemplate, settings, requestOptions, progressCallback) {
    progressCallback && progressCallback({
        processId: itemTemplate.key,
        type: itemTemplate.type,
        status: "starting",
        estimatedCostFactor: itemTemplate.estimatedDeploymentCostFactor
    });
    return new Promise(function (resolve, reject) {
        var options = tslib_1.__assign({ group: itemTemplate.item }, requestOptions);
        // Make the item title unique
        options.group.title += "_" + mCommon.getUTCTimestamp();
        // Create the item
        progressCallback && progressCallback({
            processId: itemTemplate.key,
            status: "creating",
        });
        groups.createGroup(options)
            .then(function (createResponse) {
            if (createResponse.success) {
                // Add the new item to the settings
                settings[mCommon.deTemplatize(itemTemplate.itemId)] = {
                    id: createResponse.group.id
                };
                itemTemplate.itemId = createResponse.group.id;
                itemTemplate = adlib.adlib(itemTemplate, settings);
                // Add the group's items to it
                addGroupMembers(itemTemplate, requestOptions, progressCallback)
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
// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)
/**
 * Adds the members of a group to it.
 *
 * @param itemTemplate Group
 * @param swizzles Hash mapping Solution source id to id of its clone
 * @param requestOptions Options for the request
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
function addGroupMembers(itemTemplate, requestOptions, progressCallback) {
    return new Promise(function (resolve, reject) {
        // Add each of the group's items to it
        if (itemTemplate.dependencies.length > 0) {
            var awaitGroupAdds_1 = [];
            itemTemplate.dependencies.forEach(function (depId) {
                awaitGroupAdds_1.push(new Promise(function (resolve2, reject2) {
                    sharing.shareItemWithGroup(tslib_1.__assign({ id: depId, groupId: itemTemplate.itemId }, requestOptions))
                        .then(function () {
                        progressCallback && progressCallback({
                            processId: itemTemplate.key,
                            status: "added group member"
                        });
                        resolve2();
                    }, function () {
                        mCommon.finalCallback(itemTemplate.key, false, progressCallback);
                        reject2({ success: false });
                    });
                }));
            });
            // After all items have been added to the group
            Promise.all(awaitGroupAdds_1)
                .then(function () { return resolve(); }, function () { return reject({ success: false }); });
        }
        else {
            // No items in this group
            resolve();
        }
    });
}
exports.addGroupMembers = addGroupMembers;
/**
 * Gets the ids of a group's contents.
 *
 * @param id Group id
 * @param pagingRequest Options for requesting group contents; note: its paging.start parameter may
 *                      be modified by this routine
 * @return A promise that will resolve with a list of the ids of the group's contents
 * @protected
 */
function getGroupContentsTranche(id, pagingRequest) {
    return new Promise(function (resolve, reject) {
        // Fetch group items
        groups.getGroupContent(id, pagingRequest)
            .then(function (contents) {
            if (contents.num > 0) {
                // Extract the list of content ids from the JSON returned
                var trancheIds_1 = contents.items.map(function (item) { return item.id; });
                // Are there more contents to fetch?
                if (contents.nextStart > 0) {
                    pagingRequest.paging.start = contents.nextStart;
                    getGroupContentsTranche(id, pagingRequest)
                        .then(function (allSubsequentTrancheIds) {
                        // Append all of the following tranches to this tranche and return it
                        resolve(trancheIds_1.concat(allSubsequentTrancheIds));
                    }, function () { return reject({ success: false }); });
                }
                else {
                    resolve(trancheIds_1);
                }
            }
            else {
                resolve([]);
            }
        }, function () { return reject({ success: false }); });
    });
}
exports.getGroupContentsTranche = getGroupContentsTranche;
//# sourceMappingURL=group.js.map