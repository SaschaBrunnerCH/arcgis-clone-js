declare const _default: {
    'sections': ({
        'containment': string;
        'isFooter': boolean;
        'style': {
            'background': {
                'isFile': boolean;
                'isUrl': boolean;
                'state': string;
                'display': {
                    'crop'?: undefined;
                };
                'transparency': number;
                'position': {
                    'x': string;
                    'y': string;
                };
                'color': string;
                'image': string;
                'fileSrc'?: undefined;
                'cropSrc'?: undefined;
                'cropId'?: undefined;
            };
            'color': string;
        };
        'rows': {
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'header': string;
                        'subheader': string;
                        'minHeight': string;
                        'showLocation': boolean;
                        'imageUrl': string;
                        'fileSrc': string;
                        'cropSrc': string;
                        'isUrl': boolean;
                        'isFile': boolean;
                        'state': string;
                        'position': {
                            'x': string;
                            'y': string;
                        };
                        'display': {};
                        'showSearch': boolean;
                    };
                };
                'width': number;
            }[];
        }[];
    } | {
        'containment': string;
        'isFooter': boolean;
        'style': {
            'background': {
                'isFile': boolean;
                'isUrl': boolean;
                'state': string;
                'display': {
                    'crop'?: undefined;
                };
                'transparency': number;
                'position': {
                    'x': string;
                    'y': string;
                };
                'color': string;
                'image': string;
                'fileSrc'?: undefined;
                'cropSrc'?: undefined;
                'cropId'?: undefined;
            };
            'color': string;
        };
        'rows': {
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'markdown': string;
                    };
                };
                'width': number;
                'showEditor': boolean;
            }[];
        }[];
    } | {
        'containment': string;
        'isFooter': boolean;
        'style': {
            'background': {
                'isFile': boolean;
                'isUrl': boolean;
                'state': string;
                'display': {
                    'crop': {
                        'transformAxis': string;
                        'position': {
                            'x': number;
                            'y': number;
                        };
                        'scale': {
                            'current': number;
                            'original': number;
                        };
                        'container': {
                            'left': number;
                            'top': number;
                            'width': number;
                            'height': number;
                        };
                        'natural': {
                            'width': number;
                            'height': number;
                        };
                        'output': {
                            'width': number;
                            'height': number;
                        };
                        'version': number;
                        'rendered': {
                            'width': number;
                            'height': number;
                        };
                    };
                };
                'transparency': number;
                'position': {
                    'x': string;
                    'y': string;
                };
                'color': string;
                'fileSrc': string;
                'cropSrc': string;
                'cropId': string;
                'image'?: undefined;
            };
            'color': string;
        };
        'rows': ({
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'initiativeId': string;
                        'callToActionText': string;
                        'callToActionAlign': string;
                        'buttonText': string;
                        'buttonAlign': string;
                        'buttonStyle': string;
                        'unfollowButtonText': string;
                    };
                };
                'width': number;
            }[];
        } | {
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'query': {
                            'mode': string;
                            'num': number;
                            'types': string[];
                            'tags': any[];
                            'groups': {
                                'title': string;
                                'id': string;
                            }[];
                            'ids': any[];
                        };
                        'display': {
                            'imageType': string;
                            'viewText': string;
                            'dropShadow': string;
                            'cornerStyle': string;
                        };
                        'version': number;
                        'orgId': string;
                        'siteId': string;
                    };
                };
                'width': number;
            }[];
        } | {
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'calendarEnabled': boolean;
                        'defaultView': string;
                        'eventListTitleAlign': string;
                        'height': number;
                        'listEnabled': boolean;
                        'showTitle': boolean;
                        'title': string;
                        'initiativeIds': string[];
                    };
                };
                'width': number;
            }[];
        } | {
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'header': string;
                        'subheader': string;
                        'minHeight': string;
                        'showLocation': boolean;
                        'imageUrl': string;
                        'fileSrc': string;
                        'cropSrc': string;
                        'isUrl': boolean;
                        'isFile': boolean;
                        'state': string;
                        'position': {
                            'x': string;
                            'y': string;
                        };
                        'display': {};
                        'showSearch': boolean;
                        'searchPlaceholder': string;
                    };
                };
                'width': number;
            }[];
        })[];
    } | {
        'containment': string;
        'isFooter': boolean;
        'style': {
            'background': {
                'isFile': boolean;
                'isUrl': boolean;
                'state': string;
                'display': {
                    'crop'?: undefined;
                };
                'transparency': number;
                'position': {
                    'x': string;
                    'y': string;
                };
                'color': string;
                'image'?: undefined;
                'fileSrc'?: undefined;
                'cropSrc'?: undefined;
                'cropId'?: undefined;
            };
            'color': string;
        };
        'rows': ({
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'markdown': string;
                    };
                };
                'width': number;
                'showEditor': boolean;
            }[];
        } | {
            'cards': {
                'component': {
                    'name': string;
                    'settings': {
                        'category': string;
                        'type': string;
                        'keyword': string;
                        'iconName': string;
                        'iconType': string;
                        'customAltText': string;
                        'iconColor': string;
                    };
                };
                'width': number;
            }[];
        })[];
    } | {
        'containment': string;
        'isFooter': boolean;
        'style': {
            'background': {
                'isFile': boolean;
                'isUrl': boolean;
                'state': string;
                'display': {
                    'crop'?: undefined;
                };
                'transparency': number;
                'position': {
                    'x': string;
                    'y': string;
                };
                'color': string;
                'image'?: undefined;
                'fileSrc'?: undefined;
                'cropSrc'?: undefined;
                'cropId'?: undefined;
            };
            'color': string;
        };
        'rows': {
            'cards': ({
                'component': {
                    'name': string;
                    'settings': {
                        'markdown': string;
                        'src'?: undefined;
                        'fileSrc'?: undefined;
                        'cropSrc'?: undefined;
                        'alt'?: undefined;
                        'caption'?: undefined;
                        'captionAlign'?: undefined;
                        'hyperlink'?: undefined;
                        'hyperlinkTabOption'?: undefined;
                        'isUrl'?: undefined;
                        'isFile'?: undefined;
                        'state'?: undefined;
                        'display'?: undefined;
                    };
                };
                'width': number;
                'showEditor': boolean;
            } | {
                'component': {
                    'name': string;
                    'settings': {
                        'src': string;
                        'fileSrc': string;
                        'cropSrc': string;
                        'alt': string;
                        'caption': string;
                        'captionAlign': string;
                        'hyperlink': string;
                        'hyperlinkTabOption': string;
                        'isUrl': boolean;
                        'isFile': boolean;
                        'state': string;
                        'display': {
                            'position': {
                                'x': string;
                                'y': string;
                            };
                            'reflow': boolean;
                        };
                        'markdown'?: undefined;
                    };
                };
                'width': number;
                'showEditor'?: undefined;
            })[];
        }[];
    })[];
    'header': {
        'component': {
            'name': string;
            'settings': {
                'fullWidth': boolean;
                'iframeHeight': string;
                'iframeUrl': string;
                'links': any[];
                'logoUrl': string;
                'title': string;
                'markdown': string;
                'headerType': string;
            };
        };
    };
};
export default _default;
