/** @license
 * Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { simpleTypes } from "@esri/solution-simple-types";
import * as common from "@esri/solution-common";
import * as formProcessor from "../src/form";
import * as utils from "../../common/test/mocks/utils";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as hubFormHelpers from "../src/helpers/is-hub-form-template";

describe("Module `form`: Manages the creation and deployment of form item types", () => {
  let MOCK_USER_SESSION: common.UserSession;
  let template: common.IItemTemplate;

  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
    template = templates.getItemTemplate("Form");
  });

  describe("convertItemToTemplate", () => {
    it("should delegate to simple types template creation", done => {
      const simpleTypesSpy = spyOn(
        simpleTypes,
        "convertItemToTemplate"
      ).and.resolveTo(template);
      const formBase = mockItems.getAGOLItem("Form");
      formProcessor
        .convertItemToTemplate(
          "2c36d3679e7f4934ac599051df22daf6",
          formBase,
          MOCK_USER_SESSION
        )
        .then(
          results => {
            expect(simpleTypesSpy.calls.count()).toBe(1);
            expect(simpleTypesSpy.calls.first().args).toEqual([
              "2c36d3679e7f4934ac599051df22daf6",
              formBase,
              MOCK_USER_SESSION
            ]);
            expect(results).toEqual(template);
            done();
          },
          e => {
            done.fail(e);
          }
        );
    });
  });

  describe("createItemFromTemplate", () => {
    let templateDictionary: any;

    beforeEach(() => {
      templateDictionary = { key: "value" };
    });

    it("should reject with an error response for Hub Survey templates", done => {
      const failSpy = spyOn(common, "fail").and.callThrough();
      const isHubFormTemplateSpy = spyOn(
        hubFormHelpers,
        "isHubFormTemplate"
      ).and.returnValue(true);
      const progressCallback = jasmine.createSpy();
      formProcessor
        .createItemFromTemplate(
          template,
          templateDictionary,
          MOCK_USER_SESSION,
          progressCallback
        )
        .then(
          () => {
            done.fail("createItemFromTemplate should have rejected");
          },
          e => {
            const error =
              "createItemFromTemplate not yet implemented for Hub templates in solution-form package";
            const expected = { success: false, error };
            expect(isHubFormTemplateSpy.calls.count()).toBe(1);
            expect(isHubFormTemplateSpy.calls.first().args).toEqual([template]);
            expect(failSpy.calls.count()).toBe(1);
            expect(failSpy.calls.first().args).toEqual([error]);
            expect(e).toEqual(expected);
            done();
          }
        );
    });

    it("should delegate to simple types processing for non-Hub Survey templates", done => {
      const expectedResults = {
        id: "2c36d3679e7f4934ac599051df22daf6",
        type: "Form",
        postProcess: false
      };
      const simpleTypesSpy = spyOn(
        simpleTypes,
        "createItemFromTemplate"
      ).and.resolveTo(expectedResults);
      const isHubFormTemplateSpy = spyOn(
        hubFormHelpers,
        "isHubFormTemplate"
      ).and.returnValue(false);
      const progressCallback = jasmine.createSpy();
      formProcessor
        .createItemFromTemplate(
          template,
          templateDictionary,
          MOCK_USER_SESSION,
          progressCallback
        )
        .then(
          results => {
            expect(isHubFormTemplateSpy.calls.count()).toBe(1);
            expect(isHubFormTemplateSpy.calls.first().args).toEqual([template]);
            expect(simpleTypesSpy.calls.count()).toBe(1);
            expect(simpleTypesSpy.calls.first().args).toEqual([
              template,
              templateDictionary,
              MOCK_USER_SESSION,
              progressCallback
            ]);
            expect(results).toEqual(expectedResults);
            done();
          },
          e => {
            done.fail(e);
          }
        );
    });
  });
});
