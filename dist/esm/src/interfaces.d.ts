import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
export interface ISolutionItem {
    templates: ITemplate[];
}
/**
 * An AGOL item for serializing.
 */
export interface ITemplate {
    /**
     * Item's AGOL id
     */
    itemId: string;
    /**
     * AGOL item type name
     */
    type: string;
    /**
     * Camelized form of item title used as an identifier
     */
    key: string;
    /**
     * Item base section JSON
     */
    item: any;
    /**
     * Item data section JSON
     */
    data?: any;
    /**
     * Item resources section JSON
     */
    resources?: any[];
    /**
     * List of ids of AGOL items needed by this item
     */
    dependencies?: string[];
    /**
     * Miscellaneous item-specific properties
     */
    properties?: any;
    /**
     * Item-type-specific functions
     */
    fcns?: IItemTypeModule;
    estimatedDeploymentCostFactor?: number;
}
export interface IItemTypeModule {
    completeItemTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
    getDependencies(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<string[]>;
    deployItem(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions, progressCallback?: (update: IProgressUpdate) => void): Promise<ITemplate>;
}
export interface IProgressUpdate {
    processId?: string;
    type?: string;
    status?: string;
    activeStep?: string;
    estimatedCostFactor?: number;
}
