import * as mInterfaces from "../src/interfaces";
import { IUserRequestOptions } from '@esri/arcgis-rest-auth';
/**
 * A recursive structure describing the hierarchy of a collection of AGOL items.
 */
export interface IHierarchyEntry {
    /**
     * AGOL item id
     */
    id: string;
    /**
     * Item's dependencies
     */
    dependencies: IHierarchyEntry[];
}
/**
 * Gets a list of the top-level items in a Solution, i.e., the items that no other item depends on.
 *
 * @param items Solution to explore
 * @return List of ids of top-level items in Solution
 */
export declare function getTopLevelItemIds(templates: mInterfaces.ITemplate[]): string[];
/**
 * Extracts item hierarchy structure from a Solution's items list.
 *
 * @param items Hash of JSON descriptions of items
 * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are
 * repeated; each element of the structure contains the AGOL id of an item and a list of ids of the
 * item's dependencies
 */
export declare function getItemHierarchy(templates: mInterfaces.ITemplate[]): IHierarchyEntry[];
/**
 * Creates a Storymap from the Web Mapping Applications in a Solution.
 *
 * @param title Title of Storymap
 * @param solution Solution to examine for content
 * @param requestOptions Options for requesting information from AGOL
 * @param orgUrl The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root folder
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return Storymap item that was published into AGOL
 */
export declare function createSolutionStorymap(title: string, solution: mInterfaces.ITemplate[], requestOptions: IUserRequestOptions, orgUrl: string, folderId?: string, access?: string): Promise<mInterfaces.ITemplate>;
/**
 * Creates a Storymap AGOL item.
 *
 * @param title Title of Storymap
 * @param solution Solution to examine for content
 * @param folderId Id of folder to receive item; null/empty indicates that the item goes into the root folder
 * @return Storymap AGOL item
 * @protected
 */
export declare function createSolutionStorymapItem(title: string, solution: mInterfaces.ITemplate[], folderId?: string): mInterfaces.ITemplate;
/**
 * Generates the base section of a Storymap AGOL item.
 *
 * @param title Title of Storymap
 * @return Storymap AGOL item's base section
 * @protected
 */
export declare function getStorymapItemFundamentals(title?: string): any;
/**
 * Creates a Storymap item describing the top-level webpages forming the solution.
 *
 * @param solutionStorymap Storymap AGOL item; item is modified
 * @param requestOptions Options for requesting information from AGOL
 * @param orgUrl The base URL for the AGOL organization, e.g., https://myOrg.maps.arcgis.com
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 * folder
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an updated solutionStorymap reporting the Storymap id
 * and URL
 * @protected
 */
export declare function publishSolutionStorymapItem(solutionStorymap: mInterfaces.ITemplate, requestOptions: IUserRequestOptions, orgUrl: string, folderId?: string, access?: string): Promise<mInterfaces.ITemplate>;
