import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate } from "../interfaces";
/**
 * Fetches the item and data sections, the resource and dependencies lists, and the item-type-specific
 * functions for an item using its AGOL item id.
 *
 * @param itemId
 * @param requestOptions
 */
export declare function initItemTemplateFromId(itemId: string, requestOptions: IUserRequestOptions): Promise<ITemplate>;
export declare function initItemTemplateFromJSON(itemTemplate: ITemplate): ITemplate;
/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
export declare function removeDuplicates(arrayWithDups: string[]): string[];
/**
 * Creates a copy of item base properties with properties irrelevant to cloning removed.
 *
 * @param item The base section of an item
 * @return Cloned copy of item without certain properties such as `created`, `modified`,
 *        `owner`,...; note that is is a shallow copy
 * @protected
 */
export declare function removeUndesirableItemProperties(item: any): any;
