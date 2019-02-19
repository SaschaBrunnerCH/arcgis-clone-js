import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
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
}
export interface IItemTypeModule {
    completeItemTemplate(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<ITemplate>;
    getDependencies(itemTemplate: ITemplate, requestOptions?: IUserRequestOptions): Promise<string[]>;
    deployItem(itemTemplate: ITemplate, settings: any, requestOptions: IUserRequestOptions): Promise<ITemplate>;
}
