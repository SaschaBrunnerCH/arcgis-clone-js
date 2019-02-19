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
var is_guid_1 = require("../../src/utils/is-guid");
describe('isGuid', function () {
    it('works', function () {
        expect(is_guid_1.default(1234)).toBeFalsy();
        expect(is_guid_1.default({ prop: 'val' })).toBeFalsy();
        expect(is_guid_1.default('1234')).toBeFalsy();
        expect(is_guid_1.default('imnotaguid')).toBeFalsy();
        expect(is_guid_1.default('76c3db4812d44f0087850093837e7a90')).toBeTruthy();
        expect(is_guid_1.default('{371acc8b-85cf-4251-8c01-7d0e48bac7e3}')).toBeTruthy();
    });
});
//# sourceMappingURL=is-guid.test.js.map