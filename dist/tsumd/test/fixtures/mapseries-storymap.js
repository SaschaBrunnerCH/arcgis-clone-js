(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        item: {},
        data: {
            values: {
                webmap: '123',
                story: {
                    entries: [
                        {
                            media: {
                                type: 'webmap',
                                webmap: {
                                    id: '234'
                                }
                            }
                        },
                        {
                            media: {
                                type: 'webmap',
                                webmap: {
                                    id: '567'
                                }
                            }
                        }
                    ]
                }
            }
        }
    };
});
//# sourceMappingURL=mapseries-storymap.js.map