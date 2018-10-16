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
        define(["require", "exports", "tslib", "@esri/arcgis-rest-items", "./agolItem"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var items = require("@esri/arcgis-rest-items");
    var agolItem_1 = require("./agolItem");
    var Item = /** @class */ (function (_super) {
        tslib_1.__extends(Item, _super);
        function Item() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Performs item-specific initialization.
         *
         * @param requestOptions Options for initialization request for item's data section
         * @returns A promise that will resolve with the item
         */
        Item.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                items.getItemData(_this.itemSection.id, requestOptions)
                    .then(function (dataSection) {
                    _this.dataSection = dataSection;
                    resolve(_this);
                }, function () {
                    // Items without a data section return an error from the REST library
                    resolve(_this);
                });
            });
        };
        return Item;
    }(agolItem_1.AgolItem));
    exports.Item = Item;
});
//# sourceMappingURL=item.js.map