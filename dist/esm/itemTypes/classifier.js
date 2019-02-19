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
import * as groups from "@esri/arcgis-rest-groups";
import * as items from "@esri/arcgis-rest-items";
import { createId } from '../utils/item-helpers';
import * as mCommon from "./common";
import * as DashboardModule from "./dashboard";
import * as GroupModule from "./group";
import * as FeatureServiceModule from "./featureservice";
import * as WebMapModule from "./webmap";
import * as WebMappingApplicationModule from "./webmappingapplication";
import * as GenericModule from "./generic";
var moduleMap = {
    "dashboard": DashboardModule,
    "feature service": FeatureServiceModule,
    "group": GroupModule,
    "web map": WebMapModule,
    "web mapping application": WebMappingApplicationModule
};
// -- Externals ------------------------------------------------------------------------------------------------------//
/**
 * Fetches the item and data sections, the resource and dependencies lists, and the item-type-specific
 * functions for an item using its AGOL item id.
 *
 * @param itemId
 * @param requestOptions
 */
export function initItemTemplateFromId(itemId, requestOptions) {
    return new Promise(function (resolve, reject) {
        var itemTemplate;
        // Request item base section
        items.getItem(itemId, requestOptions)
            .then(function (itemResponse) {
            itemTemplate = {
                itemId: itemResponse.id,
                type: itemResponse.type,
                key: createId(),
                item: removeUndesirableItemProperties(itemResponse),
                dependencies: [],
                fcns: moduleMap[itemResponse.type.toLowerCase()] || GenericModule
            };
            itemTemplate.item.id = mCommon.templatize(itemTemplate.item.id);
            if (itemTemplate.item.item) {
                itemTemplate.item.item = mCommon.templatize(itemTemplate.item.item);
            }
            // Request item data section
            var dataPromise = items.getItemData(itemId, requestOptions);
            // Request item resources
            var resourceRequestOptions = tslib_1.__assign({ id: itemId }, requestOptions);
            var resourcePromise = items.getItemResources(resourceRequestOptions);
            // Items without a data section return an error from the REST library, so we'll need to prevent it
            // from killing off both promises
            Promise.all([
                dataPromise.catch(function () { return null; }),
                resourcePromise.catch(function () { return null; })
            ])
                .then(function (responses) {
                var dataResponse = responses[0], resourceResponse = responses[1];
                itemTemplate.data = dataResponse;
                itemTemplate.resources = resourceResponse && resourceResponse.total > 0 ? resourceResponse.resources : null;
                // Complete item
                var completionPromise = itemTemplate.fcns.completeItemTemplate(itemTemplate, requestOptions);
                // Request item dependencies
                var dependenciesPromise = itemTemplate.fcns.getDependencies(itemTemplate, requestOptions);
                Promise.all([
                    completionPromise,
                    dependenciesPromise
                ])
                    .then(function (responses2) {
                    var completionResponse = responses2[0], dependenciesResponse = responses2[1];
                    itemTemplate = completionResponse;
                    itemTemplate.dependencies = removeDuplicates(mCommon.deTemplatizeList(dependenciesResponse));
                    resolve(itemTemplate);
                }, reject);
            }, reject);
        }, function () {
            // If item query fails, try URL for group base section
            groups.getGroup(itemId, requestOptions)
                .then(function (itemResponse) {
                itemTemplate = {
                    itemId: itemResponse.id,
                    type: "Group",
                    key: createId(),
                    item: removeUndesirableItemProperties(itemResponse),
                    dependencies: [],
                    fcns: moduleMap["group"]
                };
                // Get ids of item dependencies (i.e., the group's contents)
                itemTemplate.fcns.getDependencies(itemTemplate, requestOptions)
                    .then(function (dependencies) {
                    // We can templatize the item's id now that we're done using it to get the group members
                    itemTemplate.item.id = mCommon.templatize(itemTemplate.item.id);
                    itemTemplate.dependencies = removeDuplicates(dependencies);
                    resolve(itemTemplate);
                }, function () {
                    reject(mCommon.createUnavailableItemError(itemId));
                });
            }, function () {
                reject(mCommon.createUnavailableItemError(itemId));
            });
        });
    });
}
export function initItemTemplateFromJSON(itemTemplate) {
    itemTemplate.fcns = moduleMap[itemTemplate.type.toLowerCase()] || GenericModule;
    return itemTemplate;
}
// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)
/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
export function removeDuplicates(arrayWithDups) {
    var uniqueStrings = {};
    arrayWithDups.forEach(function (arrayElem) { return uniqueStrings[arrayElem] = true; });
    return Object.keys(uniqueStrings);
}
/**
 * Creates a copy of item base properties with properties irrelevant to cloning removed.
 *
 * @param item The base section of an item
 * @return Cloned copy of item without certain properties such as `created`, `modified`,
 *        `owner`,...; note that is is a shallow copy
 * @protected
 */
export function removeUndesirableItemProperties(item) {
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
//# sourceMappingURL=classifier.js.map