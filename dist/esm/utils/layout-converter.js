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
/**
 * Site and Page Layout Conversion functions
 */
import { cloneObject, getProp } from '../utils/object-helpers';
/**
 * Walk the tree and templatize the layout...
 */
/**
 * Convert a Layout instance to a Template
 *
 * @param layout Layout Object
 *
 * @returns Hash with the converted Layout, as well as an array of assets
 */
export function convertLayoutToTemplate(layout) {
    if (!layout) {
        return layout;
    }
    // walk the sections, rows, cards... then call to fn's to convert specific cards...
    var converted = layout.sections.reduce(function (acc, section) {
        var convertedSection = convertSection(section);
        acc.assets = acc.assets.concat(convertedSection.assets);
        acc.sections.push(convertedSection.section);
        return acc;
    }, { assets: [], sections: [] });
    // assemble the response
    var result = {
        assets: converted.assets,
        layout: {
            sections: converted.sections,
            header: {},
            footer: {}
        }
    };
    if (layout.header) {
        result.layout.header = cloneObject(layout.header);
    }
    if (layout.footer) {
        result.layout.footer = cloneObject(layout.footer);
    }
    return result;
}
;
/**
 * Convert a section, collecting assets along the way...
 */
export function convertSection(section) {
    var clone = cloneObject(section);
    // if the section has a background image, and it has a url, we should
    // add that to the asset hash so it can be downloaded and added to the template item
    // and also cook some unique asset name so we can inject a placeholder
    var rowResult = section.rows.reduce(function (acc, row) {
        var convertedRow = convertRow(row);
        // concat in the assets...
        acc.assets = acc.assets.concat(convertedRow.assets);
        acc.rows.push({ cards: convertedRow.cards });
        return acc;
    }, { assets: [], rows: [] });
    clone.rows = rowResult.rows;
    var result = {
        section: clone,
        assets: rowResult.assets
    };
    // check for assets...
    if (getProp(clone, 'style.background.fileSrc')) {
        result.assets = result.assets.concat(extractAssets(clone.style.background));
    }
    // return the section and assets...
    return result;
}
;
export function extractAssets(obj) {
    var assets = [];
    if (obj.fileSrc) {
        assets.push(obj.fileSrc);
    }
    if (obj.cropSrc) {
        assets.push(obj.cropSrc);
    }
    return assets;
}
;
/**
 * Convert a row, really just iterates the cards and collects their outputs
 * @param row Row object, which will contain cards
 *
 * @returns Hash of assets and converted cards
 */
export function convertRow(row) {
    // if the section has a background image, and it has a url, we should
    // add that to the asset hash so it can be downloaded and added to the template item
    // and also cook some unique asset name so we can inject a placeholder
    return row.cards.reduce(function (acc, card) {
        // convert the card...
        var result = convertCard(card);
        // concat in the assets...
        acc.assets = acc.assets.concat(result.assets);
        // and stuff in the converted card...
        acc.cards.push(result.card);
        // return the acc...
        return acc;
    }, { assets: [], cards: [] });
}
;
/**
 * Convert a card to a templatized version of itself
 * @param card Card object
 *
 * @returns Hash of the conveted card and any assets
 */
export function convertCard(card) {
    var clone = cloneObject(card);
    switch (clone.component.name) {
        case 'event-list-card':
            return convertEventListCard(clone);
        case 'follow-initiative-card':
            return convertFollowCard(clone);
        case 'items/gallery-card':
            return convertItemGalleryCard(clone);
        case 'image-card':
            return convertImageCard(clone);
        case 'jumbotron-card':
            return convertJumbotronCard(clone);
        default:
            return { card: clone, assets: [] };
    }
}
;
// ------------- CARD SPECIFIC FUNCTIONS -----------------
/**
 * Convert an Image Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export function convertImageCard(card) {
    var result = {
        card: card,
        assets: []
    };
    if (getProp(card, 'component.settings.fileSrc')) {
        result.assets.push(card.component.settings.fileSrc);
    }
    if (getProp(card, 'component.settings.cropSrc')) {
        result.assets.push(card.component.settings.cropSrc);
    }
    return result;
}
;
/**
 * Convert an Jumbotron Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export function convertJumbotronCard(card) {
    var result = {
        card: card,
        assets: []
    };
    if (getProp(card, 'component.settings.fileSrc')) {
        result.assets.push(card.component.settings.fileSrc);
    }
    if (getProp(card, 'component.settings.cropSrc')) {
        result.assets.push(card.component.settings.cropSrc);
    }
    return result;
}
;
/**
 * Convert an Item Gallery Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export function convertItemGalleryCard(card) {
    var settings = card.component.settings;
    if (settings.groups) {
        settings.groups = [
            {
                title: '{{initiative.name}}',
                id: '{{initiative.collaborationGroupId}}'
            }
        ];
    }
    if (getProp(settings, 'query.groups')) {
        settings.query.groups = [
            {
                title: '{{initiative.name}}',
                id: '{{initiative.collaborationGroupId}}'
            }
        ];
    }
    settings.orgId = '{{organization.id}}';
    if (settings.siteId) {
        settings.siteId = '{{appid}}';
    }
    return { card: card, assets: [] };
}
;
/**
 * Convert an Follow Initiative Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export function convertFollowCard(card) {
    card.component.settings.initiativeId = '{{initiative.id}}';
    return { card: card, assets: [] };
}
;
/**
 * Convert an Event List Card
 * @param card Card Object
 *
 * @returns Hash including the converted card, and any assets
 */
export function convertEventListCard(card) {
    card.component.settings.initiativeIds = ['{{initiative.id}}'];
    return { card: card, assets: [] };
}
;
//# sourceMappingURL=layout-converter.js.map