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
    var AgolItem = /** @class */ (function () {
        /**
         * Performs common item initialization.
         *
         * @param itemSection The item's JSON
         */
        function AgolItem(itemSection) {
            if (itemSection && itemSection.type) {
                this.type = itemSection.type;
            }
            this.dependencies = [];
            this.itemSection = itemSection;
            this.estimatedCost = 1;
            this.removeUncloneableItemProperties();
        }
        /**
         * Performs item-specific initialization.
         *
         * @param requestOptions Options for initialization request(s)
         * @returns A promise that will resolve with the item
         */
        AgolItem.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                resolve(_this);
            });
        };
        /**
         * Removes item properties irrelevant to cloning.
         */
        AgolItem.prototype.removeUncloneableItemProperties = function () {
            var itemSection = this.itemSection;
            delete itemSection.avgRating;
            delete itemSection.created;
            delete itemSection.modified;
            delete itemSection.numComments;
            delete itemSection.numRatings;
            delete itemSection.numViews;
            delete itemSection.orgId;
            delete itemSection.owner;
            delete itemSection.scoreCompleteness;
            delete itemSection.size;
            delete itemSection.uploaded;
        };
        return AgolItem;
    }());
    exports.AgolItem = AgolItem;
});
//# sourceMappingURL=agolItem.js.map