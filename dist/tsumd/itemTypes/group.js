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
        define(["require", "exports", "tslib", "adlib", "@esri/arcgis-rest-groups", "@esri/arcgis-rest-sharing", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
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
                    start: 0,
                    num: 100
                } }, requestOptions);
            // Fetch group items
            getGroupContentsTranche(itemTemplate.itemId, pagingRequest)
                .then(function (contents) { return resolve(contents); }, reject);
        });
    }
    exports.getDependencies = getDependencies;
    // -- Deploy Bundle Process ------------------------------------------------------------------------------------------//
    function deployItem(itemTemplate, settings, requestOptions) {
        return new Promise(function (resolve, reject) {
            var options = tslib_1.__assign({ group: itemTemplate.item }, requestOptions);
            // Make the item title unique
            options.group.title += "_" + mCommon.getTimestamp();
            // Create the item
            groups.createGroup(options)
                .then(function (createResponse) {
                // Add the new item to the swizzle list
                settings[itemTemplate.itemId] = {
                    id: createResponse.group.id
                };
                itemTemplate.itemId = createResponse.group.id;
                itemTemplate = adlib.adlib(itemTemplate, settings);
                // Add the group's items to it
                addGroupMembers(itemTemplate, requestOptions)
                    .then(function () { return resolve(itemTemplate); }, reject);
            }, function (error) { return reject(error.response.error.message); });
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
    function addGroupMembers(itemTemplate, requestOptions) {
        return new Promise(function (resolve, reject) {
            // Add each of the group's items to it
            if (itemTemplate.dependencies.length > 0) {
                var awaitGroupAdds_1 = [];
                itemTemplate.dependencies.forEach(function (depId) {
                    awaitGroupAdds_1.push(new Promise(function (resolve2, reject2) {
                        sharing.shareItemWithGroup(tslib_1.__assign({ id: depId, groupId: itemTemplate.itemId }, requestOptions))
                            .then(function () {
                            resolve2();
                        }, function (error) {
                            reject2(error.response.error.message);
                        });
                    }));
                });
                // After all items have been added to the group
                Promise.all(awaitGroupAdds_1)
                    .then(function () { return resolve(); }, reject);
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
                // Extract the list of content ids from the JSON returned
                var trancheIds = contents.items.map(function (item) { return item.id; });
                // Are there more contents to fetch?
                if (contents.nextStart > 0) {
                    pagingRequest.paging.start = contents.nextStart;
                    getGroupContentsTranche(id, pagingRequest)
                        .then(function (allSubsequentTrancheIds) {
                        // Append all of the following tranches to this tranche and return it
                        resolve(trancheIds.concat(allSubsequentTrancheIds));
                    }, reject);
                }
                else {
                    resolve(trancheIds);
                }
            }, function (error) {
                reject(error.originalMessage);
            });
        });
    }
    exports.getGroupContentsTranche = getGroupContentsTranche;
});
//# sourceMappingURL=group.js.map