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
export var CustomMatchers = {
    toHaveOrder: function (util, customEqualityTester) {
        return {
            compare: function (actual, expected) {
                var iPredecessor = actual.indexOf(expected.predecessor);
                var iSuccessor = actual.indexOf(expected.successor);
                if (0 <= iPredecessor && iPredecessor < iSuccessor) {
                    return {
                        pass: true,
                        message: expected.predecessor + " precedes " + expected.successor
                    };
                }
                else {
                    return {
                        pass: false,
                        message: "Expected " + expected.predecessor + " to precede " + expected.successor
                    };
                }
            }
        };
    }
};
//# sourceMappingURL=customMatchers.js.map