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
        define(["require", "exports", "tslib", "./agolItem", "./dashboard", "./featureService", "./group", "./item", "./itemFactory", "./solution", "./webmap", "./webMappingApp"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./agolItem"), exports);
    tslib_1.__exportStar(require("./dashboard"), exports);
    tslib_1.__exportStar(require("./featureService"), exports);
    tslib_1.__exportStar(require("./group"), exports);
    tslib_1.__exportStar(require("./item"), exports);
    tslib_1.__exportStar(require("./itemFactory"), exports);
    tslib_1.__exportStar(require("./solution"), exports);
    tslib_1.__exportStar(require("./webmap"), exports);
    tslib_1.__exportStar(require("./webMappingApp"), exports);
});
//# sourceMappingURL=index.js.map