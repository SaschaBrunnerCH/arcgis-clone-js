/** @license
 * Copyright 2021 Esri
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

// Helper functions shared across deploy and create

import { IItemTemplate, UserSession } from "./interfaces";
import { getProp, setCreateProp, setProp } from "./generalHelpers";
import { getItemBase } from "./restHelpersGet";
import { templatizeTerm } from "./templatization";
import { IItemUpdate } from "@esri/arcgis-rest-types";

/**
 * Used by deploy to evaluate if we have everything we need to deploy tracking views.
 *
 * This function will update the input templateDictionary with a boolean
 * indicating if tracking is enabled on the org and the user is an admin.
 *
 * @param portalResponse portal self response
 * @param userResponse portal user response
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param templates the list of IItemTemplates from the solution
 *
 * @protected
 */
export function setLocationTrackingEnabled(
  portalResponse: any,
  userResponse: any,
  templateDictionary: any,
  templates?: IItemTemplate[]
): void {
  // set locationTracking...contains service url and id
  const locationTracking = getProp(portalResponse, "helperServices.locationTracking");
  /* istanbul ignore else */
  if (locationTracking) {
    templateDictionary.locationTracking = locationTracking;
  }
  
  // verify we have location tracking service and the user is an admin
  templateDictionary.locationTrackingEnabled =
    templateDictionary.locationTracking &&
    getProp(userResponse, "role") === "org_admin"
      ? true
      : false;

    if (templates) {
      _validateTrackingTemplates(templates, templateDictionary);
    }
}

/**
 * Used by deploy to evaluate if we have everything we need to deploy tracking views.
 *
 * An error is thrown to prevent additional deployment work if we have Tracking items and tracking is
 * not enabled or the deployment user is not an admin in the organization.
 *
 * @param templates the list of IItemTemplates from the solution
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 *
 * @protected
 */
export function _validateTrackingTemplates(
  templates: IItemTemplate[],
  templateDictionary: any
): void {
  /* istanbul ignore else */
  if (
    !templateDictionary.locationTrackingEnabled &&
    templates.some(template => {
      const typeKeywords: string[] =
        getProp(template, "item.typeKeywords") || [];
      return typeKeywords.indexOf("Location Tracking View") > -1;
    })
  ) {
    console.error("Location tracking not enabled or user is not admin.");
    throw new Error("Location tracking not enabled or user is not admin.");
  }
}

export function getTackingServiceOwner(
  templateDictionary: any,
  authentication: UserSession
): Promise<boolean> {
  if (templateDictionary.locationTrackingEnabled) {
    const locationTrackingId: string = templateDictionary.locationTracking.id;
    return getItemBase(locationTrackingId, authentication).then(itemBase => {
      templateDictionary.locationTracking.owner = itemBase.owner;
      templateDictionary[itemBase.id] = {
        itemId: itemBase.id
      };
      return Promise.resolve(itemBase && itemBase.owner === authentication.username);
    }, () => Promise.resolve(false));
  } else {
    return Promise.resolve(false);
  }
}

export function isTrackingViewTemplate(
  itemTemplate?: IItemTemplate,
  itemUpdate?: IItemUpdate
): boolean {
  const typeKeywords: any = itemTemplate ? 
    getProp(itemTemplate, "item.typeKeywords") : itemUpdate ?
      getProp(itemUpdate, "typeKeywords") : [];
  const trackViewGroup: any = itemTemplate ? 
    getProp(itemTemplate, "item.properties.trackViewGroup") : itemUpdate ?
      getProp(itemUpdate, "properties.trackViewGroup") : [];
  return (typeKeywords && typeKeywords.indexOf("Location Tracking View") > -1 && trackViewGroup) ? true : false;
}

/**
 * Templatize the tracker view group id for location tracking views.
 * This function will update the itemTemplate that is passed in when it's a tracking view.
 *
 * @param itemTemplate Template for feature service item
 * 
 * @protected
 */
 export function templatizeTracker(
  itemTemplate: IItemTemplate
): void {
  /* istanbul ignore else */
  if (isTrackingViewTemplate(itemTemplate)) {
    const trackViewGroup: any = getProp(itemTemplate, "item.properties.trackViewGroup");
    itemTemplate.groups.push(trackViewGroup);
    itemTemplate.dependencies.push(trackViewGroup);
    const groupIdVar: string = templatizeTerm(trackViewGroup, trackViewGroup, ".itemId");
    setProp(
      itemTemplate, 
      "item.properties.trackViewGroup", 
      groupIdVar
    );
    _setName(itemTemplate, "item.name", trackViewGroup, groupIdVar);

    // TODO may get rid of these...we only use createService with specific args and do not add the existing definition
    _setName(itemTemplate, "properties.service.adminServiceInfo.name", trackViewGroup, groupIdVar);

    const layersAndTables: any[] = (itemTemplate.properties.layers || []).concat(itemTemplate.properties.tables || []);
    layersAndTables.forEach(l => {
      templatizeServiceItemId(l, "adminLayerInfo.viewLayerDefinition.sourceServiceItemId")
    });
  }
}

export function _setName(
  itemTemplate: IItemTemplate,
  path: string,
  groupId: string,
  groupIdVar: string
) {
  const name: string = getProp(itemTemplate, path);
  if (name) {
    setProp(
      itemTemplate,
      path,
      name.replace(groupId, groupIdVar)
    );
  }
}

export function templatizeServiceItemId(
  obj: any,
  path: string,
) {
  const serviceItemId = getProp(obj, path);
  /* istanbul ignore else */
  if (serviceItemId) {
    setProp(
      obj,
      path,
      templatizeTerm(serviceItemId, serviceItemId, ".itemId")
    );
  }
}

export function isTrackingViewGroup(
  itemTemplate: IItemTemplate
) {
  const typeKeywords: any = getProp(itemTemplate, "item.tags");
  return (typeKeywords && typeKeywords.indexOf("Location Tracking Group") > -1) ? true : false
}


export function setTrackingOptions(
  itemTemplate: IItemTemplate,
  options: any,
  templateDictionary: any
) {
  /* istanbul ignore else */
  if (isTrackingViewTemplate(itemTemplate)) {
    setCreateProp(options, "owner", templateDictionary.locationTracking.owner);

    setCreateProp(options.item, "name", itemTemplate.item.name);
    setCreateProp(options.item, "isView", true);
    setCreateProp(options.item, "owner", templateDictionary.locationTracking.owner);

    setCreateProp(options.params, "isView", true);
    setCreateProp(options.params, "outputType", "locationTrackingService");

    delete(options.folderId);
  }
  return options.item;
}