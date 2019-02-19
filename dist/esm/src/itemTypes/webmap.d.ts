import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate, IProgressUpdate } from "../interfaces";
export declare function completeItemTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export declare function getDependencies(itemTemplate: ITemplate, requestOptions: IUserRequestOptions): Promise<string[]>;
export declare function deployItem(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<ITemplate>;
/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @return List containing id of each layer or table that has an itemId
 * @protected
 */
export declare function getWebmapLayerIds(layerList?: any[]): string[];
export declare function templatizeWebmapLayerIdsAndUrls(layerList?: any[]): void;
