import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import * as mInterfaces from "./interfaces";
/**
 * Converts one or more AGOL items and their dependencies into a hash by id of JSON item descriptions.
 *
 * ```typescript
 * import { ITemplate[] } from "../src/fullItemHierarchy";
 * import { createSolution } from "../src/solution";
 *
 * getFullItemHierarchy(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
 * .then(
 *   (response:ITemplate[]) => {
 *     let keys = Object.keys(response);
 *     console.log(keys.length);  // => "6"
 *     console.log((response[keys[0]] as ITemplate).type);  // => "Web Mapping Application"
 *     console.log((response[keys[0]] as ITemplate).item.title);  // => "ROW Permit Public Comment"
 *     console.log((response[keys[0]] as ITemplate).text.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
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
 * @return A promise that will resolve with a hash by id of IFullItems;
 * if any id is inaccessible, a single error response will be produced for the set
 * of ids
 */
export declare function createSolution(solutionRootIds: string | string[], requestOptions: IUserRequestOptions): Promise<mInterfaces.ITemplate[]>;
/**
 * Creates a Solution item containing JSON descriptions of items forming the solution.
 *
 * @param title Title for Solution item to create
 * @param solution Hash of JSON descriptions of items to publish into Solution
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export declare function publishSolution(title: string, solution: mInterfaces.ITemplate[], requestOptions: IUserRequestOptions, folderId?: string, access?: string): Promise<items.IItemUpdateResponse>;
export declare function getEstimatedDeploymentCost(solution: mInterfaces.ITemplate[]): number;
/**
 * Converts a hash by id of generic JSON item descriptions into AGOL items.
 *
 * @param solution A hash of item descriptions to convert; note that the item ids are updated
 *     to their cloned versions
 * @param requestOptions Options for the request
 * @param orgUrl The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
 * @param portalUrl The base URL for the portal, e.g., https://www.arcgis.com
 * @param solutionName Name root to use if folder is to be created
 * @param folderId AGOL id of folder to receive item, or null/empty if folder is to be created;
 *     if created, folder name is a combination of the solution name and a timestamp for uniqueness,
 *     e.g., "Dashboard (1540841846958)"
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with a list of the ids of items created in AGOL
 */
export declare function deploySolution(solution: mInterfaces.ITemplate[], requestOptions: IUserRequestOptions, settings?: any, progressCallback?: (update: mInterfaces.IProgressUpdate) => void): Promise<mInterfaces.ITemplate[]>;
export declare function deployWhenReady(solution: mInterfaces.ITemplate[], requestOptions: IUserRequestOptions, settings: any, itemId: string, progressCallback?: (update: mInterfaces.IProgressUpdate) => void): Promise<mInterfaces.ITemplate>;
/**
 * Finds template by id in a list of templates.
 *
 * @param templates List of templates to search
 * @param id AGOL id of template to find
 * @return Matching template or null
 */
export declare function getTemplateInSolution(templates: mInterfaces.ITemplate[], id: string): mInterfaces.ITemplate;
/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGOL, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export declare const PLACEHOLDER_SERVER_NAME: string;
/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export declare const OPS_DASHBOARD_APP_URL_PART: string;
/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
export declare const WEBMAP_APP_URL_PART: string;
export declare function getItemTemplateHierarchy(rootIds: string | string[], requestOptions: IUserRequestOptions, templates?: mInterfaces.ITemplate[]): Promise<mInterfaces.ITemplate[]>;
/**
 * Replaces a template entry in a list of templates
 *
 * @param templates Templates list
 * @param id Id of item in templates list to find; if not found, no replacement is () => done()
 * @param template Replacement template
 * @return True if replacement was made
 * @protected
 */
export declare function replaceTemplate(templates: mInterfaces.ITemplate[], id: string, template: mInterfaces.ITemplate): boolean;
/**
 * Topologically sort a Solution's items into a build list.
 *
 * @param items Hash of JSON descriptions of items
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
export declare function topologicallySortItems(fullItems: mInterfaces.ITemplate[]): string[];
