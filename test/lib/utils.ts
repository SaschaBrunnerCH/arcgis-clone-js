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

import { UserSession } from "@esri/arcgis-rest-auth";

import * as common from "../../src/common";

// -------------------------------------------------------------------------------------------------------------------//

export const TOMORROW = (function() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return now;
})();

export const YESTERDAY = (function() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now;
})();

export function setMockDateTime (
  now: number
): number {
  jasmine.clock().install();
  jasmine.clock().mockDate(new Date(now));
  return now;
}

export function createRuntimeMockUserSession (
  now: number
): UserSession {
  const tomorrow = new Date(now + 86400000);
  return new UserSession({
    clientId: "clientId",
    redirectUri: "https://example-app.com/redirect-uri",
    token: "fake-token",
    tokenExpires: tomorrow,
    refreshToken: "refreshToken",
    refreshTokenExpires: tomorrow,
    refreshTokenTTL: 1440,
    username: "casey",
    password: "123456",
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  });
}

export function createMockSwizzle (
  itemId: string,
  swizzles = {} as common.ISwizzleHash
): common.ISwizzleHash {
  const swizzleKey = itemId;
  const swizzleValue = swizzleKey.toUpperCase();
  swizzles[swizzleKey] = {id: swizzleValue};
  return swizzles;
}

export function jsonClone (
  obj: any
) {
  return JSON.parse(JSON.stringify(obj));
}
