declare const _default: {
    'source': string;
    'folderId': string;
    'values': {
        'config': {
            'author': {
                'name': string;
            };
        };
        'settings': {
            'theme': {
                'colors': {
                    'id': string;
                    'label': string;
                    'themeMajor': string;
                    'themeContrast': string;
                    'bgMain': string;
                    'textMain': string;
                };
            };
            'header': {};
        };
        'template': {
            'name': string;
            'createdWith': string;
            'editedWith': string;
            'dataVersion': string;
        };
        'sections': ({
            'type': string;
            'foreground': {
                'title': string;
                'subtitle': string;
                'options': {
                    'titleStyle': {
                        'shadow': boolean;
                        'text': string;
                        'background': string;
                    };
                };
                'blocks'?: undefined;
            };
            'options': {};
            'layout': string;
            'background': {
                'type': string;
                'image': {
                    'url': string;
                    'isPlaceholder': boolean;
                    'options': {
                        'size': string;
                    };
                    'width': number;
                    'height': number;
                };
                'color'?: undefined;
            };
            'views'?: undefined;
        } | {
            'type': string;
            'background': {
                'type': string;
                'color': {
                    'value': string;
                };
                'image'?: undefined;
            };
            'foreground': {
                'blocks': {
                    'type': string;
                    'webmap': {
                        'type': string;
                        'id': string;
                        'options': {
                            'interaction': string;
                            'size': string;
                        };
                        'extras': {
                            'locate': {
                                'enabled': boolean;
                            };
                            'search': {
                                'enabled': boolean;
                            };
                            'legend': {
                                'enabled': boolean;
                            };
                        };
                        'caption': string;
                        'popup': {
                            'layerId': string;
                            'fieldName': string;
                            'fieldValue': number;
                            'anchorPoint': {
                                'x': number;
                                'y': number;
                                'spatialReference': {
                                    'wkid': number;
                                };
                            };
                        };
                    };
                }[];
                'title'?: undefined;
                'subtitle'?: undefined;
                'options'?: undefined;
            };
            'options'?: undefined;
            'layout'?: undefined;
            'views'?: undefined;
        } | {
            'type': string;
            'options': {};
            'views': ({
                'transition': string;
                'background': {
                    'type': string;
                    'webmap': {
                        'type': string;
                        'id': string;
                        'options': {
                            'interaction': string;
                        };
                        'extras': {
                            'locate': {
                                'enabled': boolean;
                            };
                            'search': {
                                'enabled': boolean;
                            };
                            'legend': {
                                'enabled': boolean;
                            };
                        };
                        'extent': {
                            'xmin': number;
                            'ymin': number;
                            'xmax': number;
                            'ymax': number;
                            'spatialReference': {
                                'wkid': number;
                            };
                        };
                        'layers': any[];
                    };
                    'empty'?: undefined;
                };
                'foreground': {
                    'panels': {
                        'layout': string;
                        'settings': {
                            'position-x': string;
                            'size': string;
                            'style': string;
                            'theme': string;
                        };
                        'blocks': {
                            'type': string;
                            'text': {
                                'value': string;
                            };
                        }[];
                    }[];
                    'title': {
                        'value': string;
                        'global': boolean;
                        'style': {
                            'shadow': boolean;
                            'text': string;
                            'background': string;
                        };
                    };
                };
            } | {
                'transition': string;
                'background': {
                    'type': string;
                    'webmap': {
                        'type': string;
                        'id': string;
                        'options': {
                            'interaction': string;
                        };
                        'extras': {
                            'locate': {
                                'enabled': boolean;
                            };
                            'search': {
                                'enabled': boolean;
                            };
                            'legend': {
                                'enabled': boolean;
                            };
                        };
                        'layers': any[];
                        'extent': {
                            'xmin': number;
                            'ymin': number;
                            'xmax': number;
                            'ymax': number;
                            'spatialReference': {
                                'wkid': number;
                            };
                        };
                    };
                    'empty'?: undefined;
                };
                'foreground': {
                    'panels': {
                        'layout': string;
                        'settings': {
                            'position-x': string;
                            'size': string;
                            'style': string;
                            'theme': string;
                        };
                        'blocks': {
                            'type': string;
                            'text': {
                                'value': string;
                            };
                        }[];
                    }[];
                    'title'?: undefined;
                };
            } | {
                'transition': string;
                'background': {
                    'type': string;
                    'empty': string;
                    webmap?: undefined;
                };
                'foreground': {
                    'panels': {
                        'layout': string;
                        'settings': {
                            'position-x': string;
                            'size': string;
                            'style': string;
                            'theme': string;
                        };
                        'blocks': {
                            'type': string;
                            'text': {
                                'value': string;
                            };
                        }[];
                    }[];
                    'title'?: undefined;
                };
            })[];
            'foreground'?: undefined;
            'layout'?: undefined;
            'background'?: undefined;
        })[];
    };
};
export default _default;
