import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate } from "../interfaces";
export declare function completeItemTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export declare function getDependencies(model: any): Promise<string[]>;
/**
 * Generic Web App Dependencies
 */
export declare function getGenericWebAppDependencies(model: any): Promise<string[]>;
export declare function deployItem(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions): Promise<ITemplate>;
