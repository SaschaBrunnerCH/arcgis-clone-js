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

import * as adlib from "adlib";
import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate, IProgressUpdate } from "../interfaces";

// -------------------------------------------------------------------------------------------------------------------//

/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
const WEBMAP_APP_URL_PART:string = "/home/webmap/viewer.html?webmap=";

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function convertItemToTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise(resolve => {
    // Update the estimated cost factor to deploy this item
    itemTemplate.estimatedDeploymentCostFactor = 4;

    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    // Templatize the app URL
    itemTemplate.item.url =
      mCommon.PLACEHOLDER_SERVER_NAME + WEBMAP_APP_URL_PART + mCommon.templatize(itemTemplate.itemId);

    // Extract dependencies
    itemTemplate.dependencies = extractDependencies(itemTemplate);

    // Templatize the map layer ids after we've extracted them as dependencies
    if (itemTemplate.data) {
      templatizeWebmapLayerIdsAndUrls(itemTemplate.data.operationalLayers);
      templatizeWebmapLayerIdsAndUrls(itemTemplate.data.tables);
    }

    resolve(itemTemplate);
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

export function createItemFromTemplate (
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update:IProgressUpdate) => void
): Promise<ITemplate> {
  progressCallback && progressCallback({
    processId: itemTemplate.key,
    type: itemTemplate.type,
    status: "starting"
  });

  return new Promise((resolve, reject) => {
    const options:items.IItemAddRequestOptions = {
      item: itemTemplate.item,
      folder: settings.folderId,
      ...requestOptions
    };
    if (itemTemplate.data) {
      options.item.text = itemTemplate.data;
    }

    // Create the item
    progressCallback && progressCallback({
      processId: itemTemplate.key,
      status: "creating",
    });
    items.createItemInFolder(options)
    .then(
      createResponse => {
        if (createResponse.success) {
          // Add the new item to the settings
          settings[itemTemplate.itemId] = {
            id: createResponse.id
          };
          itemTemplate.itemId = itemTemplate.item.id = createResponse.id;
          itemTemplate = adlib.adlib(itemTemplate, settings);

          // Update the app URL
          progressCallback && progressCallback({
            processId: itemTemplate.key,
            status: "updating URL"
          });
          mCommon.updateItemURL(itemTemplate.itemId, itemTemplate.item.url, requestOptions)
          .then(
            () => {
              mCommon.finalCallback(itemTemplate.key, true, progressCallback);
              resolve(itemTemplate);
            },
            (e) => {
              mCommon.finalCallback(itemTemplate.key, false, progressCallback);
              reject({ success: false, error: e.error ? e.error : e });
            }
          );
        } else {
          mCommon.finalCallback(itemTemplate.key, false, progressCallback);
          reject({ success: false });
        }
      },
      (e) => {
        mCommon.finalCallback(itemTemplate.key, false, progressCallback);
        reject({ success: false, error: e.error ? e.error : e });
      }
    )
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @return List of dependencies
 * @protected
 */
export function extractDependencies (
  itemTemplate: ITemplate
): string[] {
  let dependencies:string[] = [];

  if (itemTemplate.data) {
    dependencies = [
      ...getWebmapLayerIds(itemTemplate.data.operationalLayers),
      ...getWebmapLayerIds(itemTemplate.data.tables)
    ];
  }

  return dependencies;
}

/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @return List containing id of each layer or table that has an itemId
 * @protected
 */
export function getWebmapLayerIds (
  layerList = [] as any[]
): string[] {
  return layerList.reduce(
    (ids:string[], layer:any) => {
      const itemId = layer.itemId as string;
      if (itemId) {
        ids.push(itemId);
      }
      return ids;
    },
    [] as string[]
  );
}

export function templatizeWebmapLayerIdsAndUrls (
  layerList = [] as any[]
): void {
  layerList
  .filter(
    (layer:any) => !!layer.itemId
  )
  .forEach(
    (layer:any) => {
      const layerId = layer.url.substr((layer.url as string).lastIndexOf("/"));
      layer.itemId = mCommon.templatize(layer.itemId);
      layer.url = mCommon.templatize(mCommon.deTemplatize(layer.itemId), "url") + layerId;
    }
  );
}
