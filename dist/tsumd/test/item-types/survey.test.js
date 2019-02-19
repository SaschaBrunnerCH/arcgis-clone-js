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
        define(["require", "exports", "../../src/itemTypes/survey"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var survey_1 = require("../../src/itemTypes/survey");
    describe('Surveys', function () {
        describe('get dependencies', function () {
            it('always returns an empty array', function (done) {
                return survey_1.getDependencies({ item: {}, data: {} })
                    .then(function (r) {
                    expect(r).toBeTruthy('should return a value');
                    expect(Array.isArray(r)).toBeTruthy('should be an array');
                    expect(r.length).toEqual(0, 'should have 0 entries');
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=survey.test.js.map