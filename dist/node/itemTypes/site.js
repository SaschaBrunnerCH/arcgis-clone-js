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
/**
 * Site Item Utility Functions
 */
var object_helpers_1 = require("../utils/object-helpers");
var layout_dependencies_1 = require("../utils/layout-dependencies");
/**
 * Return a list of items this site depends on
 */
function getDependencies(model) {
    var layout = object_helpers_1.getProp(model, 'data.values.layout') || {};
    return Promise.resolve(layout_dependencies_1.getLayoutDependencies(layout));
}
exports.getDependencies = getDependencies;
;
//# sourceMappingURL=site.js.map