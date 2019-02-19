"use strict";
/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
requestOptions: IUserRequestOptions = {
    authentication: new arcgis_rest_auth.UserSession({
        username: process.env["username"],
        password: process.env["password"]
    })
};
arcgis_rest_request.getPortal(null, requestOptions)
    .then(function (response) {
    arcgis_rest_request_1.request(serviceUrl + "/" + layer["id"] + "?f=json", requestOptions);
}, function () {
    document.getElementById('create').style.display = 'none';
    alert('Please refresh page and provide credentials');
});
//# sourceMappingURL=agol_rest_endpoint.test.js.map