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
var mSolution = require("./solution");
/**
 * Extracts item hierarchy structure from a solution template.
 *
 * @param templates A collection of AGO item templates
 * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are
 * repeated; each element of the structure contains the AGOL id of an item and a list of ids of the
 * item's dependencies
 */
function getItemHierarchy(templates) {
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
            var template = mSolution.findTemplateInList(templates, id);
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
exports.getItemHierarchy = getItemHierarchy;
/**
 * Gets a list of the top-level items in a Solution, i.e., the items that no other item depends on.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of top-level items in Solution
 */
function getTopLevelItemIds(templates) {
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
exports.getTopLevelItemIds = getTopLevelItemIds;
//# sourceMappingURL=viewing.js.map