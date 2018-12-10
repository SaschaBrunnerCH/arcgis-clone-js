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

import * as featureServiceAdmin from "@esri/arcgis-rest-feature-service-admin";
import * as groups from "@esri/arcgis-rest-groups";
import * as items from "@esri/arcgis-rest-items";
import * as sharing from "@esri/arcgis-rest-sharing";
import { ArcGISRequestError } from "@esri/arcgis-rest-request";
import { request } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import * as mFullItem from "./fullItem";

// -- Exports -------------------------------------------------------------------------------------------------------//

/**
 * A collection of AGOL items for serializing.
 */
export interface IFullItemHash {
  /**
   * An AGOL item description
   */
  [id:string]: mFullItem.IFullItem | Promise<mFullItem.IFullItem>;
}

/**
 * Converts one or more AGOL items and their dependencies into a hash by id of JSON item descriptions.
 *
 * ```typescript
 * import { IItemHash } from "../src/fullItemHierarchy";
 * import { createSolution } from "../src/solution";
 *
 * getFullItemHierarchy(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
 * .then(
 *   (response:IItemHash) => {
 *     let keys = Object.keys(response);
 *     console.log(keys.length);  // => "6"
 *     console.log((response[keys[0]] as IFullItem).type);  // => "Web Mapping Application"
 *     console.log((response[keys[0]] as IFullItem).item.title);  // => "ROW Permit Public Comment"
 *     console.log((response[keys[0]] as IFullItem).text.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
 *   },
 *   error => {
 *     // (should not see this as long as both of the above ids--real ones--stay available)
 *     console.log(error); // => "Item or group does not exist or is inaccessible: " + the problem id number
 *   }
 * );
 * ```
 *
 * @param solutionRootIds AGOL id string or list of AGOL id strings
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with a hash by id of IFullItems;
 * if any id is inaccessible, a single error response will be produced for the set
 * of ids
 */
export function createSolution (
  solutionRootIds: string | string[],
  requestOptions: IUserRequestOptions
): Promise<IFullItemHash> {
  return new Promise<IFullItemHash>((resolve, reject) => {

    // Get the items forming the solution
    getFullItemHierarchy(solutionRootIds, requestOptions)
    .then(
      solution => {
        const adjustmentPromises:Array<Promise<void>> = [];

        // Prepare the Solution by adjusting its items
        Object.keys(solution).forEach(
          key => {
            const fullItem = (solution[key] as mFullItem.IFullItem);

            // 1. remove unwanted properties
            fullItem.item = removeUndesirableItemProperties(fullItem.item);

            // 2. for web mapping apps,
            //    a. generalize app URL
            if (fullItem.type === "Web Mapping Application") {
              generalizeWebMappingApplicationURL(fullItem);

            // 3. for items missing their application URLs,
            //    a. fill in URL
            } else if (fullItem.type === "Dashboard" || fullItem.type === "Web Map") {
              addGeneralizedApplicationURL(fullItem);

            // 4. for feature services,
            //    a. fill in missing data
            //    b. get layer & table details
            //    c. generalize layer & table URLs
            } else if (fullItem.type === "Feature Service") {
              adjustmentPromises.push(
                fleshOutFeatureService(fullItem as mFullItem.IFullItemFeatureService, requestOptions));
            }
          }
        );

        if (adjustmentPromises.length === 0) {
          resolve(solution);
        } else {
          Promise.all(adjustmentPromises)
          .then(
            () => resolve(solution),
            reject
          );
        }
      },
      reject
    );
  });
}

/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param solution Hash of JSON descriptions of items to publish into Solution
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @returns A promise that will resolve with an object reporting success and the Solution id
 */
export function publishSolution (
  title: string,
  solution: IFullItemHash,
  requestOptions: IUserRequestOptions,
  folderId = null as string,
  access = "private"
): Promise<items.IItemUpdateResponse> {
  // Define the solution item
  const item = {
    title,
    type: "Solution",
    itemType: "text",
    access,
    listed: false,
    commentsEnabled: false
  };
  const data = {
    items: solution
  };

  return mCommon.createItemWithData(item, data, requestOptions, folderId, access);
}

/**
 * Converts a hash by id of generic JSON item descriptions into AGOL items.
 *
 * @param solution A hash of item descriptions to convert; note that the item ids are updated
 *     to their cloned versions
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @param solutionName Name root to use if folder is to be created
 * @param folderId AGOL id of folder to receive item, or null/empty if folder is to be created;
 *     if created, folder name is a combination of the solution name and a timestamp for uniqueness,
 *     e.g., "Dashboard (1540841846958)"
 * @param access Access to set for item: 'public', 'org', 'private'
 * @returns A promise that will resolve with a list of the ids of items created in AGOL
 */
export function cloneSolution (
  solution: IFullItemHash,
  orgSession: mCommon.IOrgSession,
  solutionName = "",
  folderId = null as string,
  access = "private"
): Promise<IFullItemHash> {
  return new Promise<IFullItemHash>((resolve, reject) => {
    const swizzles:mCommon.ISwizzleHash = {};
    const clonedSolution:IFullItemHash = {};


    // Don't bother creating folder if there are no items in solution
    if (!solution || Object.keys(solution).length === 0) {
      resolve(clonedSolution);
    }

    // Run through the list of item ids in clone order
    const cloneOrderChecklist:string[] = topologicallySortItems(solution);

    function runThroughChecklist () {
      if (cloneOrderChecklist.length === 0) {
        resolve(clonedSolution);
        return;
      }

      // Clone item at top of list
      const itemId = cloneOrderChecklist.shift();
      createSwizzledItem((solution[itemId] as mFullItem.IFullItem), folderId, swizzles, orgSession)
      .then(
        clone => {
          clonedSolution[clone.item.id] = clone;
          runThroughChecklist();
        },
        reject
      )
    }

    // Use specified folder to hold the hydrated items to avoid name clashes
    if (folderId) {
      runThroughChecklist();
    } else {
      // Create a folder to hold the hydrated items to avoid name clashes
      const folderName = (solutionName || "Solution") + " (" + getTimestamp() + ")";
      const options = {
        title: folderName,
        authentication: orgSession.authentication
      };
      items.createFolder(options)
      .then(
        createdFolderResponse => {
          folderId = createdFolderResponse.folder.id;
          runThroughChecklist();
        },
        error => {
          reject(error.response.error.message)
        }
      );
    }
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//

/**
 * A general server name to replace the organization URL in a Web Mapping Application's URL to itself;
 * name has to be acceptable to AGOL, otherwise it discards the URL.
 * @protected
 */
export const PLACEHOLDER_SERVER_NAME:string = "https://arcgis.com";

/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export const OPS_DASHBOARD_APP_URL_PART:string = "/apps/opsdashboard/index.html#/";

/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
export const WEBMAP_APP_URL_PART:string = "/home/webmap/viewer.html?webmap=";

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
 * A vertex used in the topological sort algorithm.
 * @protected
 */
interface ISortVertex {
  /**
   * Vertex (AGOL) id and its visited status, described by the SortVisitColor enum
   */
  [id:string]: number;
}

/**
 * A visit flag used in the topological sort algorithm.
 * @protected
 */
enum SortVisitColor {
  /** not yet visited */
  White,
  /** visited, in progress */
  Gray,
  /** finished */
  Black
}

/**
 * Replaces the application URL with a generalized form that omits the source server name and id
 * values in the URL query.
 * @param fullItem Item to update
 * @protected
 */
export function addGeneralizedApplicationURL (
  fullItem: mFullItem.IFullItem
): void {
  // Create URL with a placeholder server name because otherwise AGOL makes URL null; don't include item id; e.g.,
  // Dashboard: https://<PLACEHOLDER_SERVER_NAME>/apps/opsdashboard/index.html#/
  // Web Map: https://<PLACEHOLDER_SERVER_NAME>/home/webmap/viewer.html?webmap=
  if (fullItem.type === "Dashboard") {
    fullItem.item.url = PLACEHOLDER_SERVER_NAME + OPS_DASHBOARD_APP_URL_PART;
  } else if (fullItem.type === "Web Map") {
    fullItem.item.url = PLACEHOLDER_SERVER_NAME + WEBMAP_APP_URL_PART;
  }
}

/**
 * Adds the layers and tables of a feature service to it and restores their relationships.
 *
 * @param fullItem Feature service
 * @param swizzles Hash mapping Solution source id to id of its clone (and name & URL for feature service)
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @returns A promise that will resolve when fullItem has been updated
 * @protected
 */
export function addFeatureServiceLayersAndTables (
  fullItem: mFullItem.IFullItemFeatureService,
  swizzles: mCommon.ISwizzleHash,
  orgSession: mCommon.IOrgSession
): Promise<void> {
  return new Promise((resolve, reject) => {

    // Sort layers and tables by id so that they're added with the same ids
    const layersAndTables:any[] = [];

    (fullItem.layers || []).forEach(function (layer) {
      layersAndTables[layer.id] = {
        item: layer,
        type: "layer"
      };
    });

    (fullItem.tables || []).forEach(function (table) {
      layersAndTables[table.id] = {
        item: table,
        type: "table"
      };
    });

    // Hold a hash of relationships
    const relationships:IRelationship = {};

    // Add the service's layers and tables to it
    if (layersAndTables.length > 0) {
      updateFeatureServiceDefinition(fullItem.item.id, fullItem.item.url, layersAndTables,
        swizzles, relationships, orgSession)
      .then(
        () => {
          // Restore relationships for all layers and tables in the service
          const awaitRelationshipUpdates:Array<Promise<void>> = [];
          Object.keys(relationships).forEach(
            id => {
              awaitRelationshipUpdates.push(new Promise(resolveFn => {
                const options = {
                  params: {
                    updateFeatureServiceDefinition: {
                      relationships: relationships[id]
                    }
                  },
                  ...orgSession
                };
                featureServiceAdmin.addToServiceDefinition(fullItem.item.url + "/" + id, options)
                .then(
                  () => {
                    resolve();
                  },
                  resolveFn);
              }));
            }
          );
          Promise.all(awaitRelationshipUpdates)
          .then(
            () => {
              resolve();
            },
            reject
          );
        },
        reject
      );
    } else {
      resolve();
    }
  });
}

/**
 * Adds the members of a group to it.
 *
 * @param fullItem Group
 * @param swizzles Hash mapping Solution source id to id of its clone
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @returns A promise that will resolve when fullItem has been updated
 * @protected
 */
export function addGroupMembers (
  fullItem: mFullItem.IFullItem,
  orgSession: mCommon.IOrgSession
):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Add each of the group's items to it
    if (fullItem.dependencies.length > 0) {
      const awaitGroupAdds:Array<Promise<null>> = [];
      fullItem.dependencies.forEach(depId => {
        awaitGroupAdds.push(new Promise((resolve2, reject2) => {
          sharing.shareItemWithGroup({
            id: depId,
            groupId: fullItem.item.id,
            ...orgSession
          })
          .then(
            () => {
              resolve2();
            },
            error => reject2(error.response.error.message)
          );
        }));
      });
      // After all items have been added to the group
      Promise.all(awaitGroupAdds)
      .then(
        () => resolve(),
        reject
      );
    } else {
      // No items in this group
      resolve();
    }
  });
}

/**
 * Creates an item in a specified folder (except for Group item type).
 *
 * @param fullItem Item to be created; n.b.: this item is modified
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param swizzles Hash mapping Solution source id to id of its clone
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @returns A promise that will resolve with the id of the created item
 * @protected
 */
export function createSwizzledItem (
  fullItem: mFullItem.IFullItem,
  folderId: string,
  swizzles: mCommon.ISwizzleHash,
  orgSession: mCommon.IOrgSession
): Promise<mFullItem.IFullItem> {
  return new Promise<mFullItem.IFullItem>((resolve, reject) => {

    const clonedItem = JSON.parse(JSON.stringify(fullItem)) as mFullItem.IFullItem;

    // Swizzle item's dependencies
    mFullItem.swizzleDependencies(clonedItem, swizzles);

    // Feature Services
    if (clonedItem.type === "Feature Service") {
      const options = {
        item: clonedItem.item,
        folderId,
        ...orgSession
      }
      if (clonedItem.data) {
        options.item.text = clonedItem.data;
      }

      // Make the item name unique
      options.item.name += "_" + getTimestamp();

      // Remove the layers and tables from the create request because while they aren't added when
      // the service is added, their presence prevents them from being added later via updateFeatureServiceDefinition
      options.item.layers = [];
      options.item.tables = [];

      // Create the item
      featureServiceAdmin.createFeatureService(options)
      .then(
        createResponse => {
          // Add the new item to the swizzle list
          swizzles[clonedItem.item.id] = {
            id: createResponse.serviceItemId,
            url: createResponse.serviceurl
          };
          clonedItem.item.id = createResponse.serviceItemId;
          clonedItem.item.url = createResponse.serviceurl;

          // Add the feature service's layers and tables to it
          addFeatureServiceLayersAndTables((clonedItem as mFullItem.IFullItemFeatureService), swizzles, orgSession)
          .then(
            () => resolve(clonedItem),
            reject
          );
        },
        reject
      );

    // Groups
    } else if (clonedItem.type === "Group") {
      const options = {
        group: clonedItem.item,
        ...orgSession
      }

      // Make the item title unique
      options.group.title += "_" + getTimestamp();

      // Create the item
      groups.createGroup(options)
      .then(
        createResponse => {
          // Add the new item to the swizzle list
          swizzles[clonedItem.item.id] = {
            id: createResponse.group.id
          };
          clonedItem.item.id = createResponse.group.id;

          // Add the group's items to it
          addGroupMembers(clonedItem, orgSession)
          .then(
            () => resolve(clonedItem),
            reject
          );
        },
        error => reject(error.response.error.message)
      );

    // All other types
    } else {
      const options:items.IItemAddRequestOptions = {
        item: clonedItem.item,
        folder: folderId,
        ...orgSession
      };
      if (clonedItem.data) {
        options.item.text = clonedItem.data;
      }

      // Create the item
      items.createItemInFolder(options)
      .then(
        createResponse => {
          // Add the new item to the swizzle list
          swizzles[clonedItem.item.id] = {
            id: createResponse.id
          };
          clonedItem.item.id = createResponse.id;

          // Update the app URL of a dashboard, webmap, or web mapping app
          if (clonedItem.type === "Dashboard" ||
              clonedItem.type === "Web Map" ||
              clonedItem.type === "Web Mapping Application") {
            updateApplicationURL(clonedItem, orgSession)
            .then(
              () => resolve(clonedItem),
              error => reject(error.response.error.message)
            );
          } else {
            resolve(clonedItem)
          }
        },
        error => reject(error.response.error.message)
      );
    }

  });
}

/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param fullItem Feature service item, data, dependencies definition to be modified
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve when fullItem has been updated
 * @protected
 */
export function fleshOutFeatureService (
  fullItem: mFullItem.IFullItemFeatureService,
  requestOptions: IUserRequestOptions
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fullItem.service = {};
    fullItem.layers = [];
    fullItem.tables = [];

    // To have enough information for reconstructing the service, we'll supplement
    // the item and data sections with sections for the service, full layers, and
    // full tables

    // Get the service description
    const serviceUrl = fullItem.item.url;
    request(serviceUrl + "?f=json", requestOptions)
    .then(
      serviceData => {
        // Fill in some missing parts
        // If the service doesn't have a name, try to get a name from its layers or tables
        serviceData["name"] = fullItem.item["name"] ||
          getFirstUsableName(serviceData["layers"]) ||
          getFirstUsableName(serviceData["tables"]) ||
          "Feature Service";
        serviceData["snippet"] = fullItem.item["snippet"];
        serviceData["description"] = fullItem.item["description"];

        fullItem.service = serviceData;

        // Get the affiliated layer and table items
        Promise.all([
          getLayers(serviceUrl, serviceData["layers"], requestOptions),
          getLayers(serviceUrl, serviceData["tables"], requestOptions)
        ])
        .then(
          results => {
            fullItem.layers = results[0];
            fullItem.tables = results[1];
            resolve();
          },
          reject
        );
      }
    );
  });
}

/**
 * Simplifies a web mapping application's app URL for cloning.
 *
 * @param fullItem Web mapping application definition to be modified
 * @protected
 */
function generalizeWebMappingApplicationURL (
  fullItem: mFullItem.IFullItem
): void {
  // Remove org base URL and app id, e.g.,
  //   http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21
  // to
  //   http://<PLACEHOLDER_SERVER_NAME>/apps/CrowdsourcePolling/index.html?appid=
  // Need to add placeholder server name because otherwise AGOL makes URL null
  const orgUrl = fullItem.item.url.replace(fullItem.item.id, "");
  const iSep = orgUrl.indexOf("//");
  fullItem.item.url = PLACEHOLDER_SERVER_NAME +  // add placeholder server name
    orgUrl.substr(orgUrl.indexOf("/", iSep + 2));
}

/**
 * Gets the name of the first layer in list of layers that has a name
 * @param layerList List of layers to use as a name source
 * @returns The name of the found layer or an empty string if no layers have a name
 * @protected
 */
function getFirstUsableName (
  layerList: any[]
): string {
  let name = "";
  // Return the first layer name found
  if (Array.isArray(layerList) && layerList.length > 0) {
    layerList.some(layer => {
      if (layer["name"] !== "") {
        name = layer["name"];
        return true;
      }
      return false;
    });
  }
  return name;
}

/**
 * Gets the full definitions of the layers affiliated with a hosted service.
 *
 * @param serviceUrl URL to hosted service
 * @param layerList List of layers at that service
 * @param requestOptions Options for the request
 * @returns A promise that will resolve with a list of the enhanced layers
 * @protected
 */
function getLayers (
  serviceUrl: string,
  layerList: any[],
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
        // Remove the editFieldsInfo because it references fields that may not be in the layer/table
        layers.forEach(layer => {
          layer["editFieldsInfo"] = null;
        });
        resolve(layers);
      },
      reject
    );
  });
}

/**
 * Creates a timestamp string using the current date and time.
 *
 * @returns Timestamp
 * @protected
 */
export function getTimestamp (): string {
  return (new Date()).getTime().toString();
}

/**
 * Creates a copy of item base properties with properties irrelevant to cloning removed.
 *
 * @param item The base section of an item
 * @returns Cloned copy of item without certain properties such as `created`, `modified`,
 *        `owner`,...; note that is is a shallow copy
 * @protected
 */
export function removeUndesirableItemProperties (
  item: any
): any {
  if (item) {
    const itemSectionClone = {...item};
    delete itemSectionClone.avgRating;
    delete itemSectionClone.created;
    delete itemSectionClone.guid;
    delete itemSectionClone.lastModified;
    delete itemSectionClone.modified;
    delete itemSectionClone.numComments;
    delete itemSectionClone.numRatings;
    delete itemSectionClone.numViews;
    delete itemSectionClone.orgId;
    delete itemSectionClone.owner;
    delete itemSectionClone.scoreCompleteness;
    delete itemSectionClone.size;
    delete itemSectionClone.uploaded;
    return itemSectionClone;
  }
  return null;
}

/**
 * Topologically sort a Solution's items into a build list.
 *
 * @param items Hash of JSON descriptions of items
 * @returns List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 * @protected
 */
export function topologicallySortItems (
  fullItems: IFullItemHash
): string[] {
  // Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford (2009)
  // Sections 22.3 (Depth-first search) & 22.4 (Topological sort), pp. 603-615
  // Introduction to Algorithms (3rd ed.), The MIT Press, ISBN 978-0-262-03384-8
  //
  // DFS(G)
  // 1 for each vertex u ∈ G,V
  // 2     u.color = WHITE
  // 3     u.π = NIL
  // 4 time = 0
  // 5 for each vertex u ∈ G,V
  // 6     if u.color == WHITE
  // 7         DFS-VISIT(G,u)
  //
  // DFS-VISIT(G,u)
  // 1 time = time + 1    // white vertex u has just been discovered
  // 2 u.d = time
  // 3 u.color = GRAY
  // 4 for each v ∈ G.Adj[u]     // explore edge (u,v)
  // 5     if v.color == WHITE
  // 6         v.π = u
  // 7         DFS-VISIT(G,v)
  // 8 u.color = BLACK         // blacken u; it is finished
  // 9 time = time + 1
  // 10 u.f = time
  //
  // TOPOLOGICAL-SORT(G)
  // 1 call DFS(G) to compute finishing times v.f for each vertex v
  // 2 as each vertex is finished, insert it onto front of a linked list
  // 3 return the linked list of vertices

  const buildList:string[] = [];  // list of ordered vertices--don't need linked list because
                                // we just want relative ordering

  const verticesToVisit:ISortVertex = {};
  Object.keys(fullItems).forEach(function(vertexId) {
    verticesToVisit[vertexId] = SortVisitColor.White;  // not yet visited
  });

  // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
  Object.keys(verticesToVisit).forEach(function(vertexId) {
    if (verticesToVisit[vertexId] === SortVisitColor.White) {  // if not yet visited
      visit(vertexId);
    }
  });

  // Visit vertex
  function visit(vertexId:string) {
    verticesToVisit[vertexId] = SortVisitColor.Gray;  // visited, in progress

    // Visit dependents if not already visited
    const dependencies:string[] = (fullItems[vertexId] as mFullItem.IFullItem).dependencies || [];
    dependencies.forEach(function (dependencyId) {
      if (verticesToVisit[dependencyId] === SortVisitColor.White) {  // if not yet visited
        visit(dependencyId);
      } else if (verticesToVisit[dependencyId] === SortVisitColor.Gray) {  // visited, in progress
        throw Error("Cyclical dependency graph detected");
      }
    });

    verticesToVisit[vertexId] = SortVisitColor.Black;  // finished
    buildList.push(vertexId);  // add to end of list of ordered vertices because we want dependents first
  }

  return buildList;
}

/**
 * Updates the URL of an application to one usable for running the app.
 *
 * @param fullItem An item that has an application URL, e.g., a dashboard, webmap, or web mapping
 *                 application
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @returns A promise that will resolve when fullItem has been updated
 * @protected
 */
export function updateApplicationURL (
  fullItem: mFullItem.IFullItem,
  orgSession: mCommon.IOrgSession
): Promise<string> {
  const url = orgSession.orgUrl +
        (fullItem.item.url.substr(PLACEHOLDER_SERVER_NAME.length)) +  // remove placeholder server name
        fullItem.item.id;

  // Update local copy
  fullItem.item.url = url;

  // Update AGOL copy
  return mCommon.updateItemURL(fullItem.item.id, url, orgSession as IUserRequestOptions)
}

/**
 * Updates a feature service with a list of layers and/or tables.
 *
 * @param serviceItemId AGOL id of feature service
 * @param serviceUrl URL of feature service
 * @param listToAdd List of layers and/or tables to add
 * @param swizzles Hash mapping Solution source id to id of its clone (and name & URL for feature service)
 * @param relationships Hash mapping a layer's relationship id to the ids of its relationships
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve when the feature service has been updated
 * @protected
 */
function updateFeatureServiceDefinition(
  serviceItemId: string,
  serviceUrl: string,
  listToAdd: any[],
  swizzles: mCommon.ISwizzleHash,
  relationships: IRelationship,
  requestOptions: IUserRequestOptions
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

      if (toAdd.type === "layer") {
        item.adminLayerInfo = {  // ???
          "geometryField": {
            "name": "Shape",
            "srid": 102100
          }
        };
        options.layers = [item];
      } else {
        options.tables = [item];
      }

      featureServiceAdmin.addToServiceDefinition(serviceUrl, options)
      .then(
        () => {
          updateFeatureServiceDefinition(serviceItemId, serviceUrl, listToAdd, swizzles, relationships, requestOptions)
          .then(
            () => resolve(),
            reject
          );
        },
        reject
      );
    } else {
      resolve();
    }
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//

/**
 * Fetches the item, data, and resources of one or more AGOL items and their dependencies.
 *
 * ```typescript
 * import { IItemHash, getFullItemHierarchy } from "../src/fullItemHierarchy";
 *
 * getFullItemHierarchy(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
 * .then(
 *   (response:IItemHash) => {
 *     let keys = Object.keys(response);
 *     console.log(keys.length);  // => "6"
 *     console.log((response[keys[0]] as IFullItem).type);  // => "Web Mapping Application"
 *     console.log((response[keys[0]] as IFullItem).item.title);  // => "ROW Permit Public Comment"
 *     console.log((response[keys[0]] as IFullItem).text.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
 *   },
 *   error => {
 *     // (should not see this as long as both of the above ids--real ones--stay available)
 *     console.log(error); // => "Item or group does not exist or is inaccessible: " + the problem id number
 *   }
 * );
 * ```
 *
 * @param rootIds AGOL id string or list of AGOL id strings
 * @param requestOptions Options for requesting information from AGOL
 * @param collection A hash of items already converted useful for avoiding duplicate conversions and
 * hierarchy tracing
 * @returns A promise that will resolve with a hash by id of IFullItems;
 * if any id is inaccessible, a single error response will be produced for the set
 * of ids
 * @protected
 */
export function getFullItemHierarchy (
  rootIds: string | string[],
  requestOptions: IUserRequestOptions,
  collection?: IFullItemHash
): Promise<IFullItemHash> {
  if (!collection) {
    collection = {};
  }

  return new Promise((resolve, reject) => {
    if (!rootIds || (Array.isArray(rootIds) && rootIds.length === 0)) {
      reject(mFullItem.createUnavailableItemError(null));

    } else if (typeof rootIds === "string") {
      // Handle a single AGOL id
      const rootId = rootIds;
      if (collection[rootId]) {
        resolve(collection);  // Item and its dependents are already in list or are queued

      } else {
        // Add the id as a placeholder to show that it will be fetched
        const getItemPromise = mFullItem.getFullItem(rootId, requestOptions);
        collection[rootId] = getItemPromise;

        // Get the specified item
        getItemPromise
        .then(
          fullItem => {
            // Set the value keyed by the id
            collection[rootId] = fullItem;

            // Trace item dependencies
            if (fullItem.dependencies.length === 0) {
              resolve(collection);

            } else {
              // Get its dependents, asking each to get its dependents via
              // recursive calls to this function
              const dependentDfds:Array<Promise<IFullItemHash>> = [];

              fullItem.dependencies.forEach(
                dependentId => {
                  if (!collection[dependentId]) {
                    dependentDfds.push(getFullItemHierarchy(dependentId, requestOptions, collection));
                  }
                }
              );
              Promise.all(dependentDfds)
              .then(
                () => {
                  resolve(collection);
                },
                (error:ArcGISRequestError) => reject(error)
              );
            }
          },
          (error:ArcGISRequestError) => reject(error)
        );
      }

    } else {
      // Handle a list of one or more AGOL ids by stepping through the list
      // and calling this function recursively
      const getHierarchyPromise:Array<Promise<IFullItemHash>> = [];

      rootIds.forEach(rootId => {
        getHierarchyPromise.push(getFullItemHierarchy(rootId, requestOptions, collection));
      });
      Promise.all(getHierarchyPromise)
      .then(
        () => {
          resolve(collection);
        },
        (error:ArcGISRequestError) => reject(error)
      );
    }
  });
}

