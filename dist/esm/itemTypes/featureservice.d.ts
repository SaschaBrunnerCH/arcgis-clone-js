import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate } from "../interfaces";
export declare function completeItemTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
export declare function getDependencies(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<string[]>;
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
export declare function deployItem(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions): Promise<ITemplate>;
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
 * Adds the layers and tables of a feature service to it and restores their relationships.
 *
 * @param itemTemplate Feature service
 * @param settings Hash mapping Solution source id to id of its clone (and name & URL for feature
 *            service)
 * @param requestOptions Options for the request
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export declare function addFeatureServiceLayersAndTables(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions): Promise<void>;
/**
 * Fills in missing data, including full layer and table definitions, in a feature services' definition.
 *
 * @param itemTemplate Feature service item, data, dependencies definition to be modified
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export declare function fleshOutFeatureService(itemTemplate: ITemplate, requestOptions: IUserRequestOptions): Promise<void>;
