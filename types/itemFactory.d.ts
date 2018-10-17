import { IRequestOptions } from "@esri/arcgis-rest-request";
import { AgolItem } from "./agolItem";
export interface IItemHash {
    [id: string]: AgolItem | Promise<AgolItem>;
}
export declare class ItemFactory {
    /**
     * Instantiates an item subclass using an AGOL id to load the item and get its type.
     *
     * ```typescript
     * import { ItemFactory } from "../src/itemFactory";
     * import { AgolItem } from "../src/agolItem";
     * import { Item } from "../src/item";
     *
     * ItemFactory.itemToJSON("6fc5992522d34f26b2210d17835eea21")
     * .then(
     *   (response:AgolItem) => {
     *     console.log(response.type);  // => "Web Mapping Application"
     *     console.log(response.itemSection.title);  // => "ROW Permit Public Comment"
     *     console.log((response as Item).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
     *   },
     *   error => {
     *     // (should not see this as long as above id--a real one--stays available)
     *     console.log(error); // => "Item or group does not exist or is inaccessible."
     *   }
     * );
     * ```
     *
     * @param id AGOL id string
     * @param requestOptions Options for the request
     * @returns A promise that will resolve with a subclass of AgolItem
     */
    static itemToJSON(id: string, requestOptions?: IRequestOptions): Promise<AgolItem>;
    /**
     * Instantiates an item subclass and its dependencies using an AGOL id to load the item and get its type.
     *
     * ```typescript
     * import { ItemFactory, IItemHash } from "../src/itemFactory";
     * import { AgolItem } from "../src/agolItem";
     * import { Item } from "../src/item";
     *
     * ItemFactory.itemToJSON(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
     * .then(
     *   (response:IItemHash) => {
     *     let keys = Object.keys(response);
     *     console.log(keys.length);  // => "6"
     *     console.log((response[keys[0]] as AgolItem).type);  // => "Web Mapping Application"
     *     console.log((response[keys[0]] as AgolItem).itemSection.title);  // => "ROW Permit Public Comment"
     *     console.log((response[keys[0]] as Item).dataSection.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
     *   },
     *   error => {
     *     // (should not see this as long as both of the above ids--real ones--stay available)
     *     console.log(error); // => "Item or group does not exist or is inaccessible."
     *   }
     * );
     * ```
     *
     * @param rootIds AGOL id string or list of AGOL id strings
     * @param requestOptions Options for the request
     * @param collection A hash of items already converted useful for avoiding duplicate conversions and
     * hierarchy tracing
     * @returns A promise that will resolve with a hash by id of subclasses of AgolItem;
     * if either id is inaccessible, a single error response will be produced for the set
     * of ids
     */
    static itemHierarchyToJSON(rootIds: string | string[], requestOptions?: IRequestOptions, collection?: IItemHash): Promise<IItemHash>;
    /**
     * Extracts the AGOL id from the front of a string.
     *
     * @param extendedId A string of hex characters that begins with an AGOL id;
     *   characters including and after "_" are considered a modifier
     * @returns An AGOL id
     */
    private static baseId;
}
