import * as mInterfaces from "../src/interfaces";
import { IUserRequestOptions } from '@esri/arcgis-rest-auth';
import { IItem } from '@esri/arcgis-rest-common-types';
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
export interface IDeployedSolutionItemAccess {
    id: string;
    url: string;
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
export declare function createDeployedSolutionItem(title: string, solution: mInterfaces.ITemplate[], templateItem: IItem, requestOptions: IUserRequestOptions, settings?: any, access?: string): Promise<IDeployedSolutionItemAccess>;
