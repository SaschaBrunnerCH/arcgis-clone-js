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
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Extracts item hierarchy structure from a Solution's items list.
     *
     * @param items Hash of JSON descriptions of items
     * @returns JSON structure reflecting dependency hierarchy of items; shared dependencies are
     * repeated; each element of the structure contains the AGOL id of an item and a list of ids of the
     * item's dependencies
     */
    function getItemHierarchy(items) {
        var hierarchy = [];
        // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
        var topLevelNodes = Object.keys(items);
        Object.keys(items).forEach(function (id) {
            (items[id].dependencies || []).forEach(function (dependencyId) {
                var iNode = topLevelNodes.indexOf(dependencyId);
                if (iNode >= 0) {
                    // Node is somebody's dependency, so remove the node from the list of top-level nodes
                    // If iNode == -1, then it's a shared dependency and it has already been removed
                    topLevelNodes.splice(iNode, 1);
                }
            });
        });
        // Hierarchically list the children of specified nodes
        function itemChildren(children, hierarchy) {
            // Visit each child
            children.forEach(function (id) {
                var child = {
                    id: id,
                    dependencies: []
                };
                // Fill in the child's dependencies array with any of its children
                var dependencyIds = items[id].dependencies;
                if (Array.isArray(dependencyIds) && dependencyIds.length > 0) {
                    itemChildren(dependencyIds, child.dependencies);
                }
                hierarchy.push(child);
            });
        }
        itemChildren(topLevelNodes, hierarchy);
        return hierarchy;
    }
    exports.getItemHierarchy = getItemHierarchy;
});
//# sourceMappingURL=viewing.js.map