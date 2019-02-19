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
import * as mCommon from "./itemTypes/common";
import * as mSolution from "./solution";
/**
 * Gets a list of the top-level items in a Solution, i.e., the items that no other item depends on.
 *
 * @param items Solution to explore
 * @return List of ids of top-level items in Solution
 */
export function getTopLevelItemIds(templates) {
    // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
    var topLevelItemCandidateIds = templates.map(function (template) {
        return template.itemId;
    });
    templates.forEach(function (template) {
        (template.dependencies || []).forEach(function (dependencyId) {
            var iNode = topLevelItemCandidateIds.indexOf(dependencyId);
            if (iNode >= 0) {
                // Node is somebody's dependency, so remove the node from the list of top-level nodes
                // If iNode == -1, then it's a shared dependency and it has already been removed
                topLevelItemCandidateIds.splice(iNode, 1);
            }
        });
    });
    return topLevelItemCandidateIds;
}
/**
 * Extracts item hierarchy structure from a Solution's items list.
 *
 * @param items Hash of JSON descriptions of items
 * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are
 * repeated; each element of the structure contains the AGOL id of an item and a list of ids of the
 * item's dependencies
 */
export function getItemHierarchy(templates) {
    var hierarchy = [];
    // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
    var topLevelItemIds = getTopLevelItemIds(templates);
    // Hierarchically list the children of specified nodes
    function itemChildren(children, accumulatedHierarchy) {
        // Visit each child
        children.forEach(function (id) {
            var child = {
                id: id,
                dependencies: []
            };
            // Fill in the child's dependencies array with its children
            var template = mSolution.getTemplateInSolution(templates, id);
            var dependencyIds = template.dependencies;
            if (Array.isArray(dependencyIds) && dependencyIds.length > 0) {
                itemChildren(dependencyIds, child.dependencies);
            }
            accumulatedHierarchy.push(child);
        });
    }
    itemChildren(topLevelItemIds, hierarchy);
    return hierarchy;
}
export function createDeployedSolutionItem(title, solution, templateItem, requestOptions, settings, access) {
    if (settings === void 0) { settings = {}; }
    if (access === void 0) { access = "private"; }
    return new Promise(function (resolve, reject) {
        var thumbnailUrl = "https://www.arcgis.com/sharing/content/items/" +
            templateItem.id + "/info/" + templateItem.thumbnail;
        var item = {
            itemType: "text",
            name: null,
            title: title,
            description: templateItem.description,
            tags: templateItem.tags,
            snippet: templateItem.snippet,
            thumbnailurl: thumbnailUrl,
            accessInformation: templateItem.accessInformation,
            type: "Solution",
            typeKeywords: ["Solution", "Deployed"],
            commentsEnabled: false
        };
        var data = {
            templates: solution
        };
        mCommon.createItemWithData(item, data, requestOptions, settings.folderId, access)
            .then(function (createResponse) {
            // Update its app URL
            var orgUrl = (settings.organization && settings.organization.orgUrl) || "https://www.arcgis.com";
            var deployedSolutionItemId = createResponse.id;
            var deployedSolutionItemUrl = orgUrl + "/home/item.html?id=" + deployedSolutionItemId;
            mCommon.updateItemURL(deployedSolutionItemId, deployedSolutionItemUrl, requestOptions)
                .then(function (response) {
                var deployedSolutionItem = {
                    id: deployedSolutionItemId,
                    url: deployedSolutionItemUrl
                };
                resolve(deployedSolutionItem);
            }, function () { return reject({ success: false }); });
        }, function () { return reject({ success: false }); });
    });
}
//# sourceMappingURL=viewing.js.map