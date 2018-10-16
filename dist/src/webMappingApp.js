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
        define(["require", "exports", "tslib", "./item"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var item_1 = require("./item");
    /**
     *  AGOL web map application item
     */
    var WebMappingApp = /** @class */ (function (_super) {
        tslib_1.__extends(WebMappingApp, _super);
        function WebMappingApp() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Performs item-specific initialization.
         *
         * @param requestOptions Options for initialization request for item's data section
         * @returns A promise that will resolve with the item
         */
        WebMappingApp.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                _super.prototype.init.call(_this, requestOptions)
                    .then(function () {
                    _this.estimatedCost += 1; // cost to update URL after item is created
                    // Extract the dependencies
                    if (_this.dataSection && _this.dataSection.values) {
                        var values = _this.dataSection.values;
                        if (values.webmap) {
                            _this.dependencies.push(values.webmap);
                        }
                        if (values.group) {
                            _this.dependencies.push(values.group);
                        }
                    }
                    resolve(_this);
                });
            });
        };
        return WebMappingApp;
    }(item_1.Item));
    exports.WebMappingApp = WebMappingApp;
});
//# sourceMappingURL=webMappingApp.js.map