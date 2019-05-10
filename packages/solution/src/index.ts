/** @license
 * Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Manages the highest-level of Solution creation and deployment.
 *
 * @module solution
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as deployItems from "./deployItems";
import * as portal from "@esri/arcgis-rest-portal";

// ------------------------------------------------------------------------------------------------------------------ //

export interface IPortalSubset {
  name: string;
  id: string;
  restUrl: string;
  portalUrl: string;
  urlKey: string;
}

export function createSolution(
  groupId: string,
  destUrl: string,
  userSession: auth.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {

    // Fetch group item info

    // Create an internal representation of the new solution item using group item info

    // Fetch group contents

    // For each group content item,
    //   * fetch item & data infos
    //   * create item & data JSONs
    //   * extract dependency ids & add them into list of group contents
    //   * templatize select components in item & data JSONs (e.g., extents)
    //   * add JSONs into items list in solution item representation

    // Create solution item using internal representation & and the data JSON

    resolve("createSolution");
  });
}

export function deploySolution(
  itemInfo: any,
  templateDictionary: any,
  portalSubset: IPortalSubset,
  userSession: auth.UserSession,
  progressCallback: (percentDone: number) => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const sourceId = itemInfo.id;
    let percentDone = 1;  // Let the caller know that we've started
    progressCallback(percentDone);

    // Fetch solution item's data info (partial item info is supplied via function's parameters)
    const itemDataParam: portal.IItemDataOptions = {
      authentication: userSession
    }
    const solutionItemDataDef = portal.getItemData(sourceId, itemDataParam);

    // Create a folder to hold the deployed solution
    const folderName = itemInfo.title + " (" + common.getUTCTimestamp() + ")";
    const folderCreationParam = {
      title: folderName,
      authentication: userSession
    };
    const folderCreationDef = portal.createFolder(folderCreationParam);

    // Await completion of async actions
    Promise.all([  // TODO IE11 does not support Promise
      solutionItemDataDef,
      folderCreationDef
    ])
    .then(
      responses => {
        const itemData = responses[0];
        const folderResponse = responses[1];
        templateDictionary.folderId = folderResponse.folder.id;

        const totalEstimatedCost = estimateDeploymentCost((itemData as common.ISolutionItemData).templates)
          + 3;    // overhead for data fetch and folder & solution item creation
        const progressPercentStep = 100 / totalEstimatedCost;
        console.log("totalEstimatedCost, progressPercentStep", totalEstimatedCost, progressPercentStep);
        progressCallback(percentDone += 2 * progressPercentStep);  // for data fetch and folder creation

        // Handle the contained item templates
        deployItems.deployItems(itemData.templates, templateDictionary, userSession,
          () => {
            progressCallback(percentDone += progressPercentStep);  // progress tick callback from deployItems
          }
        )
        .then(
          clonedSolutionItems => {
            // Update solution item's data JSON using template dictionary, and then
            // Create solution item using internal representation & and the updated data JSON
            common.createItemWithData(
              {
                type: "Solution",
                typeKeywords: ["Solution", "Deployed"],
                ...itemInfo
              },
              common.replaceInTemplate(itemData, templateDictionary),
              {
                authentication: userSession
              },
              templateDictionary.folderId
            )
            .then(
              response => {
                console.log(JSON.stringify(templateDictionary,null,2));
                progressCallback(100);
                resolve(response.id);
              },
              error => {
                console.error("createItemWithData", error);
              }
            )
          },
          error => {
            console.error("createItemWithData", error);
          }
        )
      },
      error => {
        console.error("Promise.all(solutionItemDataDef,folderCreationDef)", error);
      }
    );
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Accumulates the estimated deployment cost of a set of templates.
 *
 * @param templates Templates to examine
 * @return Sum of estimated deployment costs
 * @protected
 */
function estimateDeploymentCost (
  templates: common.IItemTemplate[]
): number {
  return templates.reduce(
    (accumulatedEstimatedCost: number, template: common.IItemTemplate) => {
      return accumulatedEstimatedCost + template.estimatedDeploymentCostFactor;
    }, 0
  );
}
