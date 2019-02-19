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
        define(["require", "exports", "../../src/itemTypes/webappbuilder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var webappbuilder_1 = require("../../src/itemTypes/webappbuilder");
    describe('Web App Builder', function () {
        describe('getDependencies', function () {
            it('should return the itemid if it exists', function (done) {
                var model = {
                    item: {},
                    data: {
                        map: {
                            itemId: '3ef'
                        }
                    }
                };
                return webappbuilder_1.getDependencies(model)
                    .then(function (r) {
                    expect(Array.isArray(r)).toBeTruthy();
                    expect(r.length).toEqual(1, 'should have one dep');
                    expect(r.indexOf('3ef')).toBeGreaterThan(-1, 'should have one dep');
                    done();
                });
            });
            it('should return empty array if itemId does not exist', function (done) {
                var model = {
                    item: {},
                    data: {
                        map: {}
                    }
                };
                return webappbuilder_1.getDependencies(model)
                    .then(function (r) {
                    expect(Array.isArray(r)).toBeTruthy();
                    expect(r.length).toEqual(0, 'should have no deps');
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=webappbuilder.test.js.map