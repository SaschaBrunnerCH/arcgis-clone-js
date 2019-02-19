import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate, IProgressUpdate } from "../interfaces";
/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export declare const OPS_DASHBOARD_APP_URL_PART: string;
export declare function completeItemTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
/**
 * Gets the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export declare function getDependencies(itemTemplate: ITemplate, requestOptions: IUserRequestOptions): Promise<string[]>;
export declare function deployItem(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<ITemplate>;
