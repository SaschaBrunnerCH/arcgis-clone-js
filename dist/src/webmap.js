/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@esri/arcgis-rest-request", "./item"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
    var item_1 = require("./item");
    /**
     *  AGOL webmap item
     */
    var Webmap = /** @class */ (function (_super) {
        tslib_1.__extends(Webmap, _super);
        function Webmap() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Performs item-specific initialization.
         *
         * @param requestOptions Options for initialization request for item's data section
         * @returns A promise that will resolve with the item
         */
        Webmap.prototype.init = function (requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Fetch item data section
                _super.prototype.init.call(_this, requestOptions)
                    .then(function () {
                    // Extract the dependencies
                    var dependencyIdsDfd = [];
                    if (_this.dataSection) {
                        if (_this.dataSection.operationalLayers) {
                            dependencyIdsDfd.push(_this.getDependencyLayerIds(_this.dataSection.operationalLayers, requestOptions));
                        }
                        if (_this.dataSection.tables) {
                            dependencyIdsDfd.push(_this.getDependencyLayerIds(_this.dataSection.tables, requestOptions));
                        }
                    }
                    Promise.all(dependencyIdsDfd)
                        .then(function (results) {
                        results.forEach(function (subarray) {
                            _this.dependencies = _this.dependencies.concat(subarray);
                        });
                        resolve(_this);
                    });
                });
            });
        };
        /**
         * Updates the item's list of dependencies.
         *
         * @param layerList List of operational layers or tables to examine
         * @param requestOptions Options for the request
         * @returns A promise that will resolve with the ids of the layers in the layer list
         */
        Webmap.prototype.getDependencyLayerIds = function (layerList, requestOptions) {
            var _this = this;
            return new Promise(function (resolve) {
                // Request the AGOL item id(s)
                var dependencyIdsDfd = [];
                layerList.forEach(function (layer) {
                    var urlStr = layer.url;
                    var layerDfd = new Promise(function (resolve) {
                        _this.getLayerItemId(layer, requestOptions)
                            .then(function (itemId) {
                            // Get the feature layer index number
                            var id = urlStr.substr(urlStr.lastIndexOf("/") + 1);
                            // Append the index number to the end of the AGOL item id to uniquely identify the feature layer
                            // and save as a dependency
                            itemId += "_" + id;
                            // Remove the URL parameter from the layer definition and update/add its item id
                            delete layer.url;
                            layer.itemId = itemId;
                            // Return the updated itemId
                            resolve(itemId);
                        });
                    });
                    dependencyIdsDfd.push(layerDfd);
                });
                // Assemble the results
                Promise.all(dependencyIdsDfd)
                    .then(resolve);
            });
        };
        /**
         * Gets the AGOL id of a layer either from the layer or via a query to its service.
         *
         * @param layer Layer whose id is sought
         * @param requestOptions Options for the request
         * @returns A promise that will resolve with the item id string
         */
        Webmap.prototype.getLayerItemId = function (layer, requestOptions) {
            return new Promise(function (resolve) {
                var urlStr = layer.url;
                var itemId = layer.itemId;
                if (!itemId) { // no itemId if the feature layer is specified only via a URL, e.g.; need to fetch it
                    var serviceUrl = urlStr.substr(0, urlStr.lastIndexOf("/")) + "?f=json";
                    arcgis_rest_request_1.request(serviceUrl, requestOptions)
                        .then(function (serviceData) {
                        resolve(serviceData.serviceItemId);
                    });
                }
                else {
                    resolve(itemId);
                }
            });
        };
        return Webmap;
    }(item_1.Item));
    exports.Webmap = Webmap;
});
//# sourceMappingURL=webmap.js.map