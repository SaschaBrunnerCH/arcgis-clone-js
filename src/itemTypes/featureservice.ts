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
import * as featureServiceAdmin from "@esri/arcgis-rest-feature-service-admin";
import * as items from "@esri/arcgis-rest-items";
import { request } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate, IProgressUpdate } from "../interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function convertItemToTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    // Update the estimated cost factor to deploy this item
    itemTemplate.estimatedDeploymentCostFactor = 3;

    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    fleshOutFeatureService(itemTemplate, requestOptions)
    .then(
      () => {
        // Extract dependencies
        extractDependencies(itemTemplate, requestOptions).then((dependencies) => {
          itemTemplate.dependencies = dependencies;

          resolve(itemTemplate);
        },
        (e) => reject({ success: false, error: e.error ? e.error : e })
        );
      },
      (e) => reject({ success: false, error: e.error ? e.error : e })
    );
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

/**
 * Creates an item in a specified folder (except for Group item type).
 *
 * @param itemTemplate Item to be created; n.b.: this item is modified
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param settings Hash mapping property names to replacement values
 * @param requestOptions Options for the request
 * @return A promise that will resolve with the id of the created item
 * @protected
 */
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
    const createOptions = {
      item: itemTemplate.item,
      folderId: settings.folderId,
      params: {
        isView: Boolean(itemTemplate.properties.service.isView)
      },
      preserveLayerIds: true,
      ...requestOptions
    }
    if (itemTemplate.data) {
      createOptions.item.text = itemTemplate.data;
    }

    // Make the item name unique
    createOptions.item.name = itemTemplate.item.name + "_" + mCommon.getUTCTimestamp();

    // Create the item
    progressCallback && progressCallback({
      processId: itemTemplate.key,
      status: "creating",
    });
    featureServiceAdmin.createFeatureService(createOptions)
    .then(
      createResponse => {
        // Add the new item to the settings list
        settings[itemTemplate.itemId] = {
          id: createResponse.serviceItemId,
          url: createResponse.serviceurl
        };
        itemTemplate.itemId = itemTemplate.item.id = createResponse.serviceItemId;
        itemTemplate = adlib.adlib(itemTemplate, settings);
        itemTemplate.item.url = createResponse.serviceurl;

        // Update item using a unique name because createFeatureService doesn't provide a way to specify
        // snippet, description, etc.
        const updateOptions:items.IItemUpdateRequestOptions = {
          item: {
            id: itemTemplate.itemId,
            title: itemTemplate.item.title,
            snippet: itemTemplate.item.snippet,
            description: itemTemplate.item.description,
            accessInfo: itemTemplate.item.accessInfo,
            licenseInfo: itemTemplate.item.licenseInfo,
            text: itemTemplate.data
          },
          ...requestOptions
        };

        items.updateItem(updateOptions)
        .then(
          () => {
            // Add the feature service's layers and tables to it
            addFeatureServiceLayersAndTables(itemTemplate, settings, requestOptions, progressCallback)
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
          },
          (e) => {
            mCommon.finalCallback(itemTemplate.key, false, progressCallback);
            reject({ success: false, error: e.error ? e.error : e });
          }
        );
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
 * Holds the extra information needed by feature services.
 */
export interface IFeatureServiceProperties {
  /**
   * Service description
   */
  service: any;
  /**
   * Description for each layer
   */
  layers: any[];
  /**
   * Description for each table
   */
  tables: any[];
}

/**
 * Storage of a one-way relationship.
 * @protected
 */
interface IRelationship {
  /**
   * Relationship id and the ids of the items that it is related to.
   */
  [id:string]: string[];
}

/**
 * Gets the ids of the dependencies of an AGOL feature service item.
 * Dependencies will only exist when the service is a view.
 *
 * @param itemTemplate Template of item to be created
 * @param requestOptions Options for the request
 * @return A promise that will resolve a list of dependencies
 * @protected
 */
export function extractDependencies(
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  const dependencies: string[] = [];
  return new Promise((resolve, reject) => {
    const serviceUrl: string = itemTemplate.item.url;
    itemTemplate.item.url = mCommon.templatize(itemTemplate.itemId, "url");
    // Get service dependencies when the item is a view
    if (itemTemplate.properties.service.isView) {
      request(serviceUrl + "/sources?f=json", requestOptions).then(response => {
        if (response && response.services) {
          response.services.forEach((layer: any) => {
            dependencies.push(layer.serviceItemId);
          });
          resolve(dependencies);
        }
      },
      (e) => reject({ success: false, error: e.error ? e.error : e })
      );
    } else {
      resolve(dependencies);
    }
  });
}

/**
 * Adds the layers and tables of a feature service to it and restores their relationships.
 *
 * @param itemTemplate Feature service
 * @param settings Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param requestOptions Options for the request
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function addFeatureServiceLayersAndTables (
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update:IProgressUpdate) => void
): Promise<void> {
  return new Promise((resolve, reject) => {

    // Sort layers and tables by id so that they're added with the same ids
    const properties:any = itemTemplate.properties as IFeatureServiceProperties;
    const layersAndTables:any[] = [];

    (properties.layers || []).forEach(function (layer:any) {
      layersAndTables[layer.id] = {
        item: layer,
        type: "layer"
      };
    });

    (properties.tables || []).forEach(function (table:any) {
      layersAndTables[table.id] = {
        item: table,
        type: "table"
      };
    });

    // Hold a hash of relationships
    const relationships:IRelationship = {};

    // Add the service's layers and tables to it
    if (layersAndTables.length > 0) {
      updateFeatureServiceDefinition(itemTemplate.itemId, itemTemplate.item.url, layersAndTables,
        settings, relationships, requestOptions, itemTemplate.key, progressCallback)
      .then(
        () => {
          // Restore relationships for all layers and tables in the service
          const awaitRelationshipUpdates:Array<Promise<void>> = [];
          Object.keys(relationships).forEach(
            id => {
              awaitRelationshipUpdates.push(new Promise((resolveFn, rejectFn) => {
                const options = {
                  params: {
                    updateFeatureServiceDefinition: {
                      relationships: relationships[id]
                    }
                  },
                  ...requestOptions
                };
                featureServiceAdmin.addToServiceDefinition(itemTemplate.item.url + "/" + id, options)
                .then(
                  () => {
                    progressCallback && progressCallback({
                      processId: itemTemplate.key,
                      status: "updated relationship"
                    });
                    resolveFn();
                  },
                  (e) => rejectFn(e)
                );
              }));
            }
          );
          Promise.all(awaitRelationshipUpdates)
          .then(
            () => resolve(),
            (e) => reject({ success: false, error: e.error ? e.error : e })
          );
        },
        (e) => reject({ success: false, error: e.error ? e.error : e })
      );
    } else {
      resolve();
    }
  });
}

export function countRelationships (
  layers: any[]
): number {
  const reducer = (accumulator:number, currentLayer:any) =>
    accumulator + (currentLayer.relationships ? currentLayer.relationships.length : 0);

  return layers.reduce(reducer, 0);
}

/**
 * Gets layers and tables via the admin api
 * Must be item owner to publish a solution from a given item 
 *
 * @param itemTemplate Feature service item, data, and dependencies
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve after the admin api has been checked
 * @protected
 */
export function getAdminLayersAndTables (
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    const serviceUrl = itemTemplate.item.url;

    // get the admin URL
    const adminUrl = serviceUrl.replace('/rest/services', '/rest/admin/services');

    request(adminUrl + "?f=json", requestOptions)
      .then(adminData => {
        resolve({
          adminLayers: adminData.layers,
          adminTables: adminData.tables
        });
      },
        (e) => reject({ success: false, error: e.error ? e.error : e })
      ).catch(
        (e) => reject({ success: false, error: e.error ? e.error : e })
      );
  });
}

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param itemTemplate Feature service item, data, dependencies definition to be modified
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function fleshOutFeatureService (
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const properties:IFeatureServiceProperties = {
      service: {},
      layers: [],
      tables: []
    };

    // To have enough information for reconstructing the service, we'll supplement
    // the item and data sections with sections for the service, full layers, and
    // full tables

    // Get the service description
    const serviceUrl = itemTemplate.item.url;
    request(serviceUrl + "?f=json", requestOptions)
    .then(
      serviceData => {
        serviceData.serviceItemId = mCommon.templatize(serviceData.serviceItemId);
        properties.service = serviceData;

        getAdminLayersAndTables(itemTemplate, requestOptions).then(adminData => {
          // Get the affiliated layer and table items
          Promise.all([
            getLayers(serviceUrl, serviceData["layers"], adminData.adminLayers, requestOptions),
            getLayers(serviceUrl, serviceData["tables"], adminData.adminTables, requestOptions)
          ])
            .then(
              results => {
                properties.layers = results[0];
                properties.tables = results[1];
                itemTemplate.properties = properties;

                itemTemplate.estimatedDeploymentCostFactor +=
                  properties.layers.length +               // layers
                  countRelationships(properties.layers) +  // layer relationships
                  properties.tables.length +               // tables & estimated single relationship for each
                  countRelationships(properties.tables);   // table relationships

                resolve();
              },
              (e) => reject({ success: false, error: e.error ? e.error : e })
            );
        },
        (e) => reject({ success: false, error: e.error ? e.error : e })
        );
      },
      (e) => reject({ success: false, error: e.error ? e.error : e })
    );
  });
}

/**
 * Gets the admin layer info for the given layer id and removes unecessary props
 * and templatizes the key props
 * @param adminList List of layers with admin info
 * @param id Id for the layer we are working with
 * @return The modified copy of adminLayerInfo
 */
export function getAdminLayerInfo(
  adminList: any[],
  id: number
): any {
  let adminLayerInfo;
  if (adminList.hasOwnProperty(id)) {
    // Update adminLayerInfo
    adminLayerInfo = Object.assign({}, adminList[id].adminLayerInfo);

    deleteProp(adminLayerInfo, "xssTrustedFields");
    deleteProp(adminLayerInfo, "tableName");

    if (adminLayerInfo.viewLayerDefinition) {
      const viewDef = adminLayerInfo.viewLayerDefinition;

      deleteProp(viewDef, "sourceId");

      if (viewDef.table) {
        deleteProp(viewDef.table, "sourceId");
      }

      // Templatize key properties that will need new info after deploy
      viewDef["sourceServiceName"] = mCommon.templatize(
        String(viewDef.sourceServiceName),
        "adminLayerInfo.viewLayerDefinition.sourceServiceName");
    }
  }
  return adminLayerInfo;
}

/**
 * Helper function to test if object and property exist and if so delete the property
 *
 * @param obj object instance to test and update
 * @param prop name of the property we are after
 */
function deleteProp(obj: any, prop:string) {
  if (obj && obj.hasOwnProperty(prop)) {
    delete(obj[prop]);
  }
}

/**
 * Gets the full definitions of the layers affiliated with a hosted service.
 *
 * @param serviceUrl URL to hosted service
 * @param layerList List of layers at that service
 * @param requestOptions Options for the request
 * @return A promise that will resolve with a list of the enhanced layers
 * @protected
 */
export function getLayers (
  serviceUrl: string,
  layerList: any[],
  adminList: any[],
  requestOptions: IUserRequestOptions
): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    if (!Array.isArray(layerList) || layerList.length === 0) {
      resolve([]);
    }

    const requestsDfd:Array<Promise<any>> = [];
    layerList.forEach(layer => {
      requestsDfd.push(request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions));
    });

    // Wait until all layers are heard from
    Promise.all(requestsDfd)
    .then(
      layers => {
        // Remove the editFieldsInfo because it references fields that may not be in the layer/table;
        // templatize the layer's serviceItemId
        layers.forEach(layer => {
          layer["editFieldsInfo"] = null;
          layer["serviceItemId"] = mCommon.templatize(layer["serviceItemId"]);

          // Update adminLayerInfo and add to layer
          if (adminList && adminList.indexOf(layer["id"]) > -1) {    
            layer["adminLayerInfo"] = getAdminLayerInfo(adminList, layer["id"]);
          }
        });
        resolve(layers);
      },
      (e) => reject({ success: false, error: e.error ? e.error : e })
    );
  });
}

/**
 * Updates a feature service with a list of layers and/or tables.
 *
 * @param serviceItemId AGOL id of feature service
 * @param serviceUrl URL of feature service
 * @param listToAdd List of layers and/or tables to add
 * @param settings Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param relationships Hash mapping a layer's relationship id to the ids of its relationships
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve when the feature service has been updated
 * @protected
 */
function updateFeatureServiceDefinition(
  serviceItemId: string,
  serviceUrl: string,
  listToAdd: any[],
  settings: any,
  relationships: IRelationship,
  requestOptions: IUserRequestOptions,
  key: string,
  progressCallback?: (update:IProgressUpdate) => void
): Promise<void> {
  // Launch the adds serially because server doesn't support parallel adds
  return new Promise((resolve, reject) => {
    if (listToAdd.length > 0) {
      const toAdd = listToAdd.shift();

      const item = toAdd.item;
      const originalId = item.id;
      delete item.serviceItemId;  // Updated by updateFeatureServiceDefinition

      // Need to remove relationships and add them back individually after all layers and tables
      // have been added to the definition
      if (Array.isArray(item.relationships) && item.relationships.length > 0) {
        relationships[originalId] = item.relationships;
        item.relationships = [];
      }

      const options:featureServiceAdmin.IAddToServiceDefinitionRequestOptions = {
        ...requestOptions
      };

      // Need to add layers and tables one at a time, waiting until one is complete before moving on to the next one
      if (toAdd.type === "layer") {
        options.layers = [item];
      } else {
        options.tables = [item];
      }

      featureServiceAdmin.addToServiceDefinition(serviceUrl, options)
      .then(
        () => {
          progressCallback && progressCallback({
            processId: key,
            status: "added layer"
          });

          updateFeatureServiceDefinition(serviceItemId, serviceUrl, listToAdd, settings, relationships,
            requestOptions, key, progressCallback)
          .then(
            () => resolve(),
            (e) => reject({ success: false, error: e.error ? e.error : e })
          );
        },
        (e) => reject({ success: false, error: e.error ? e.error : e })
      );
    } else {
      resolve();
    }
  });
}

