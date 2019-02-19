(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../utils/object-helpers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    /**
     * Site and Page Layout Depdendency functions
     */
    var object_helpers_1 = require("../utils/object-helpers");
    ;
    /**
     * Entry point that walks the Layout object graph and inspects
     * the Sections/Rows/Cards for dependencies
     *
     * @param layout Layout object
     *
     * @returns Array of the id's of the dependant items
     */
    function getLayoutDependencies(layout) {
        var sections = layout.sections || [];
        return sections.reduce(function (deps, section) {
            return deps.concat(getSectionDependencies(section));
        }, []);
    }
    exports.getLayoutDependencies = getLayoutDependencies;
    ;
    /**
     * Iterate the Rows in the Section...
     * @param section Section Object
     *
     * @returns Array of the id's of the dependant items
     */
    function getSectionDependencies(section) {
        return section.rows.reduce(function (deps, row) {
            return deps.concat(getRowDependencies(row));
        }, []);
    }
    exports.getSectionDependencies = getSectionDependencies;
    ;
    /**
     * Iterate the Cards in the Row...
     * @param row Row Object
     *
     * @returns Array of the id's of the dependant items
     */
    function getRowDependencies(row) {
        return row.cards.reduce(function (deps, card) {
            return deps.concat(getCardDependencies(card));
        }, []);
    }
    exports.getRowDependencies = getRowDependencies;
    ;
    /**
     * Parse the card settings to extract the dependency ids.
     * This is where the actual useful work happens
     *
     * @param card Card Object
     *
     * @returns Array of the id's of the dependant items
     */
    function getCardDependencies(card) {
        var paths = [];
        var componentName = object_helpers_1.getProp(card, 'component.name');
        switch (componentName) {
            case 'chart-card':
                paths = ['component.settings.itemId'];
                break;
            case 'summary-statistic-card':
                paths = ['component.settings.itemId'];
                break;
            case 'webmap-card':
                paths = ['component.settings.webmap'];
                break;
            case 'items/gallery-card':
                paths = ['component.settings.ids'];
                break;
        }
        return paths.reduce(function (a, p) {
            var v = object_helpers_1.getProp(card, p);
            if (v) {
                if (Array.isArray(v)) {
                    a = a.concat(v);
                }
                else {
                    a.push(v);
                }
            }
            return a;
        }, []);
    }
    exports.getCardDependencies = getCardDependencies;
    ;
});
//# sourceMappingURL=layout-dependencies.js.map