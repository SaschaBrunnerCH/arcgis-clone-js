import { UserSession } from "@esri/arcgis-rest-auth";
import * as mInterfaces from "../../src/interfaces";
export declare const TOMORROW: Date;
export declare const YESTERDAY: Date;
export declare const ArcgisRestSuccessFail: {
    success: boolean;
};
export declare function setMockDateTime(now: number): number;
export declare function createRuntimeMockUserSession(now: number): UserSession;
export declare function createMockSettings(solutionName?: string, folderId?: string, access?: string): any;
export declare function jsonClone(obj: any): any;
export declare function removeItemFcns(templates: mInterfaces.ITemplate | mInterfaces.ITemplate[]): void;
export declare function removeNameField(layerOrTable: any): any;
