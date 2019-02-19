declare const _default: {
    item: {};
    data: {
        values: {
            story: {
                sections: ({
                    media: {
                        type: string;
                        webmap: {
                            id: string;
                            noid?: undefined;
                        };
                        webpage?: undefined;
                    };
                    notmedia?: undefined;
                } | {
                    notmedia: {
                        type: string;
                        props: {
                            val: string;
                        };
                    };
                    media?: undefined;
                } | {
                    media: {
                        type: string;
                        webmap: {
                            noid: string;
                            id?: undefined;
                        };
                        webpage?: undefined;
                    };
                    notmedia?: undefined;
                } | {
                    media: {
                        type: string;
                        webpage: {
                            url: string;
                            nourl?: undefined;
                        };
                        webmap?: undefined;
                    };
                    notmedia?: undefined;
                } | {
                    media: {
                        type: string;
                        webpage: {
                            nourl: string;
                            url?: undefined;
                        };
                        webmap?: undefined;
                    };
                    notmedia?: undefined;
                })[];
            };
        };
    };
};
export default _default;
