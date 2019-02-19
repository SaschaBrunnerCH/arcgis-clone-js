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
var groups = require("@esri/arcgis-rest-groups");
var items = require("@esri/arcgis-rest-items");
var item_helpers_1 = require("../utils/item-helpers");
var mCommon = require("./common");
var DashboardModule = require("./dashboard");
var GroupModule = require("./group");
var FeatureServiceModule = require("./featureservice");
var WebMapModule = require("./webmap");
var WebMappingApplicationModule = require("./webmappingapplication");
var GenericModule = require("./generic");
/**
 * Mapping from item type to module with type-specific template-handling code
 */
var moduleMap = {
    "dashboard": DashboardModule,
    "feature service": FeatureServiceModule,
    "group": GroupModule,
    "web map": WebMapModule,
    "web mapping application": WebMappingApplicationModule
};
// -- Externals ------------------------------------------------------------------------------------------------------//
/**
 * Returns a list of the currently-supported AGO item types.
 *
 * @return List of item type names; names are all-lowercase forms of standard names
 */
function getSupportedItemTypes() {
    return Object.keys(moduleMap);
}
exports.getSupportedItemTypes = getSupportedItemTypes;
/**
 * Fetches the item and data sections, the resource and dependencies lists, and the item-type-specific
 * functions for an item using its AGOL item id, and then calls a type-specific function to convert
 * the item into a template.
 *
 * @param itemId AGO id of solution template item to templatize
 * @param requestOptions Options for the request
 * @return A promise which will resolve with an item template
 */
function convertItemToTemplate(itemId, requestOptions) {
    return new Promise(function (resolve, reject) {
        var itemTemplate;
        // Request item base section
        items.getItem(itemId, requestOptions)
            .then(function (itemResponse) {
            if (!moduleMap[itemResponse.type.toLowerCase()]) {
                console.warn("Unimplemented item type " + itemResponse.type + " for " + itemId);
            }
            itemTemplate = {
                itemId: itemResponse.id,
                type: itemResponse.type,
                key: item_helpers_1.createId(),
                item: removeUndesirableItemProperties(itemResponse),
                dependencies: [],
                fcns: moduleMap[itemResponse.type.toLowerCase()] || GenericModule,
                estimatedDeploymentCostFactor: 3 // minimal set is starting, creating, done|failed
            };
            itemTemplate.item.id = mCommon.templatize(itemTemplate.item.id);
            if (itemTemplate.item.item) {
                itemTemplate.item.item = mCommon.templatize(itemTemplate.item.item);
            }
            // Convert relative thumbnail URL to an absolute one so that it can be preserved
            // TODO disconnected deployment may not have access to the absolute URL
            itemTemplate.item.thumbnail = "https://www.arcgis.com/sharing/content/items/" +
                itemId + "/info/" + itemTemplate.item.thumbnail;
            // Request item data section
            var dataPromise = items.getItemData(itemId, requestOptions);
            // Request item resources
            var resourceRequestOptions = tslib_1.__assign({ id: itemId }, requestOptions);
            var resourcePromise = items.getItemResources(resourceRequestOptions);
            // Items without a data section return an error from the REST library, so we'll need to prevent it
            // from killing off both promises. This means that there's no `reject` clause to handle, hence:
            // tslint:disable-next-line:no-floating-promises
            Promise.all([
                dataPromise.catch(function () { return null; }),
                resourcePromise.catch(function () { return null; })
            ])
                .then(function (responses) {
                var dataResponse = responses[0], resourceResponse = responses[1];
                itemTemplate.data = dataResponse;
                itemTemplate.resources = resourceResponse && resourceResponse.total > 0 ? resourceResponse.resources : null;
                // Create the item's template
                itemTemplate.fcns.convertItemToTemplate(itemTemplate, requestOptions)
                    .then(function (template) {
                    itemTemplate.dependencies = removeDuplicates((template.dependencies || [])
                        .reduce(function (acc, val) { return acc.concat(val); }, []) // some dependencies come out as nested, so flatten
                    );
                    resolve(itemTemplate);
                }, function () { return reject({ success: false }); });
            });
        }, function () {
            // If item query fails, try URL for group base section
            groups.getGroup(itemId, requestOptions)
                .then(function (itemResponse) {
                itemTemplate = {
                    itemId: itemResponse.id,
                    type: "Group",
                    key: item_helpers_1.createId(),
                    item: removeUndesirableItemProperties(itemResponse),
                    dependencies: [],
                    fcns: moduleMap["group"],
                    estimatedDeploymentCostFactor: 3 // minimal set is starting, creating, done|failed
                };
                // Convert relative thumbnail URL to an absolute one so that it can be preserved
                // TODO disconnected deployment may not have access to the absolute URL
                itemTemplate.item.thumbnail = "https://www.arcgis.com/sharing/content/items/" +
                    itemId + "/info/" + itemTemplate.item.thumbnail;
                // Create the item's template
                itemTemplate.fcns.convertItemToTemplate(itemTemplate, requestOptions)
                    .then(function (template) {
                    itemTemplate.dependencies = removeDuplicates((template.dependencies || [])
                        .reduce(function (acc, val) { return acc.concat(val); }, []) // some dependencies come out as nested, so flatten
                    );
                    resolve(itemTemplate);
                }, function () { return reject({ success: false }); });
            }, function () { return reject({ success: false }); });
        });
    });
}
exports.convertItemToTemplate = convertItemToTemplate;
/**
 * Loads the item-type-specific functions for an item.
 *
 * @param itemTemplate Item template to update
 * @return Updated item template
 */
function initItemTemplateFromJSON(itemTemplate) {
    itemTemplate.fcns = moduleMap[itemTemplate.type.toLowerCase()] || GenericModule;
    return itemTemplate;
}
exports.initItemTemplateFromJSON = initItemTemplateFromJSON;
// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)
/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
function removeDuplicates(arrayWithDups) {
    var uniqueStrings = {};
    arrayWithDups.forEach(function (arrayElem) { return uniqueStrings[arrayElem] = true; });
    return Object.keys(uniqueStrings);
}
exports.removeDuplicates = removeDuplicates;
/**
 * Creates a copy of item base properties with properties irrelevant to cloning removed.
 *
 * @param item The base section of an item
 * @return Cloned copy of item without certain properties such as `created`, `modified`,
 *        `owner`,...; note that is is a shallow copy
 * @protected
 */
function removeUndesirableItemProperties(item) {
    if (item) {
        var itemSectionClone = tslib_1.__assign({}, item);
        delete itemSectionClone.avgRating;
        delete itemSectionClone.created;
        delete itemSectionClone.guid;
        delete itemSectionClone.lastModified;
        delete itemSectionClone.modified;
        delete itemSectionClone.numComments;
        delete itemSectionClone.numRatings;
        delete itemSectionClone.numViews;
        delete itemSectionClone.orgId;
        delete itemSectionClone.owner;
        delete itemSectionClone.scoreCompleteness;
        delete itemSectionClone.size;
        delete itemSectionClone.uploaded;
        return itemSectionClone;
    }
    return null;
}
exports.removeUndesirableItemProperties = removeUndesirableItemProperties;
//# sourceMappingURL=classifier.js.map