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
    var Dashboard = /** @class */ (function (_super) {
        tslib_1.__extends(Dashboard, _super);
        function Dashboard() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Performs item-specific initialization.
         *
         * @param requestOptions Options for initialization request for item's data section
         * @returns A promise that will resolve with the item
         */
        Dashboard.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                _super.prototype.init.call(_this, requestOptions)
                    .then(function () {
                    // Extract the dependencies
                    if (_this.dataSection && _this.dataSection.widgets) {
                        var widgets = _this.dataSection.widgets;
                        widgets.forEach(function (widget) {
                            if (widget.type === "mapWidget") {
                                _this.dependencies.push(widget.itemId);
                            }
                        });
                    }
                    resolve(_this);
                });
            });
        };
        return Dashboard;
    }(item_1.Item));
    exports.Dashboard = Dashboard;
});
//# sourceMappingURL=dashboard.js.map