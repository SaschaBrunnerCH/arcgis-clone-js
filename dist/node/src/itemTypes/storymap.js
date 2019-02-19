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
var object_helpers_1 = require("../utils/object-helpers");
var item_helpers_1 = require("../utils/item-helpers");
/**
 * Return a list of items this depends on
 */
function getDependencies(model) {
    // unknown types have no deps...
    var processor = function (m) { return []; };
    // find known types by typeKeyword
    if (item_helpers_1.hasTypeKeyword(model, 'Cascade')) {
        processor = getCascadeDependencies;
    }
    if (item_helpers_1.hasTypeKeyword(model, 'MapJournal')) {
        processor = getMapJournalDependencies;
    }
    if (item_helpers_1.hasTypeKeyword(model, 'mapseries')) {
        processor = getMapSeriesDependencies;
    }
    // execute
    return Promise.resolve(processor(model));
}
exports.getDependencies = getDependencies;
;
/**
 * Cascade specific logic
 */
function getCascadeDependencies(model) {
    // Cascade Example QA b908258efbba4f019450db46382a0c13
    var sections = object_helpers_1.getProp(model, 'data.values.sections') || [];
    return sections.reduce(function (a, s) {
        return a.concat(object_helpers_1.getDeepValues(s, 'webmap').map(function (e) {
            return e.id;
        }));
    }, []);
}
exports.getCascadeDependencies = getCascadeDependencies;
;
/**
 * Map Series specific logic
 */
function getMapSeriesDependencies(model) {
    var deps = object_helpers_1.getProps(model, ['data.values.webmap']);
    var entries = object_helpers_1.getProp(model, 'data.values.story.entries') || [];
    entries.forEach(function (e) {
        var entryWebmaps = object_helpers_1.getDeepValues(e, 'webmap').map(function (obj) {
            return obj.id;
        });
        // may be dupes...
        entryWebmaps.forEach(function (id) {
            if (deps.indexOf(id) === -1) {
                deps.push(id);
            }
        });
    });
    return deps;
}
exports.getMapSeriesDependencies = getMapSeriesDependencies;
;
function getMapJournalDependencies(model) {
    // MapJournal example QA 4c4d084c22d249fdbb032e4143c62546
    var sections = object_helpers_1.getProp(model, 'data.values.story.sections') || [];
    var deps = sections.reduce(function (a, s) {
        if (s.media) {
            if (s.media.type === 'webmap') {
                var v = object_helpers_1.getProp(s, 'media.webmap.id');
                if (v) {
                    a.push(v);
                }
            }
            if (s.media.type === 'webpage') {
                var url = object_helpers_1.getProp(s, 'media.webpage.url');
                var id = item_helpers_1.parseIdFromUrl(url);
                if (id) {
                    a.push(id);
                }
            }
        }
        return a;
    }, []);
    return deps;
}
exports.getMapJournalDependencies = getMapJournalDependencies;
;
//# sourceMappingURL=storymap.js.map