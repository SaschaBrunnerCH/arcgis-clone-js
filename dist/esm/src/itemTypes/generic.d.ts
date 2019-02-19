import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ITemplate, IProgressUpdate } from "../interfaces";
export declare function completeItemTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
export declare function getDependencies(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<string[]>;
export declare function deployItem(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<ITemplate>;
