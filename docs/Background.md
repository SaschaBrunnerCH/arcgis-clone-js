## arcgis-clone-js

### Table of Contents

- Primary Capabilities
	- [Creating a solution template](#creating-a-solution-template)
	- [Viewing a solution template](#viewing-a-solution-template)
	- [Deploying a solution template](#deploying-a-solution-template)
- Data Structures
	- [Solution template](#solution-template)
	- [Deployed solution](#deployed-solution)
	- [Template](#template)
	- [Example solution template](#example-solution-template)

---

### Primary Capabilities

#### Creating a solution template
This is the function chain that transforms a collection of ArcGIS Online (AGO) items into a collection of templates and bundles them into a solution template. Each item is checked for AGO item dependencies, and those dependencies are recursively included in the collection.

| Level | Function | Returns |
| ---- | ---- | ---- |
| external | `createSolutionTemplate (title, version, ids, sourceRequestOptions, destinationRequestOptions)` | Promise => ISolutionTemplateItem |
| | This is the entry point that constructs a Solution Template item based on the passed in item and its dependencies. This function's main job is to produce the Solution Template item itself. It then delegates the template construction. | |
| internal | `convertItemToTemplate(itemId, requestOptions, templates?)` | Promise => ITemplate |
| | This orchestrates the construction the actual item template by getting the source item's information, creating a base template, and then delegating to type-specific services to complete the template. | |
| internal | `completeItemTemplate(itemTemplate, requestOptions)` | Promise => ITemplate |
| | This function gets the item's dependencies, injects the correct [adlib](https://github.com/Esri/adlib) template properties, and performs type-specific template adjustments. | |

#### Viewing a solution template
These functions assist in the display of solution templates.

| Level | Function | Returns |
| ---- | ---- | ---- |
| external | `getTopLevelItemIds (templates)` | string[] |
| | Gets a list of the top-level items in a Solution, i.e., the items that no other item depends on. | |
| external | `getItemHierarchy (templates`) | IHierarchyEntry[] |
| | Extracts item hierarchy structure from a solution template. | |

#### Deploying a solution template
This is the function chain that transforms a solution template's templates into a set of instantiated items in an AGO organization and creates a deployed solution AGO item linked to the instantiated items.

| Level | Function | Returns |
| ---- | ---- | ---- |
| external | `createSolutionFromTemplate (solutionTemplate, requestOptions, settings, progressCallback?)` | Promise => IAGOItemAccess |
| | Converts a solution template into an AGO deployed solution and items. | |
| internal | `createDeployedSolutionItem (title, solutionTemplate, requestOptions, settings?, access?)` | Promise => IAGOItemAccess |
| | Creates an AGO deployed solution. | |
| internal | `createItemFromTemplateWhenReady (itemId, templates, requestOptions, settings, progressCallback?)` | Promise => IAGOItemAccess |
| | Creates an AGO item from its template after its dependencies have been created. | |
| internal | `createItemFromTemplate (template, settings, requestOptions, settings, progressCallback?)` | Promise => IAGOItemAccess |
| | Creates an AGO item from its template. | |

---

### Data Structures

#### Solution template

```js
{
  metadata: {
    version: ''
  },
  templates: [ <itemTemplate>, <itemTemplate>, <itemTemplate>]
}
```

The Solution does not contain explicit information about its hierarchy or the order in which items need to be created to satisfy dependencies because these can be quickly generated on the fly. Deployment routines attempt to deploy items in parallel while honoring dependencies.

The solution template has the type keywords `Solution` and `Template`.

#### Deployed solution

The deployed solution has the type keywords `Solution` and `Deployed`.

#### Template

```js
{
  itemId: '3ef...',
  type: 'Web Mapping Application', // whatever the item type is; for groups, "Group" is used
  key: 'ifhpyqjyr', // 'i' + chars 2-8 of a random number in base 36
  item: {...},
  data: {...},
  thumbnail: '<id>-<original-thumbnail-name>.<png|jpg>'
  dependencies: ['bc4', '00f'],
  resources: ['cat.png', 'someFile.json'],
  properties: { // general property bag for various types
    service: {...}, // feature services
    layers: [{...}], // feature services
    tables: [{...}], // feature services
    form: {...} // surveys
    ... // other type-specific props as needed
  },
  estimatedDeploymentCostFactor: 3
}
```

##### Thumbnail and resources
An item's thumbnail and resources are not stored in its template; they are contained in the solution template's resources in a folder keyed to the item's itemId.

##### item property
Property `item` is the JSON structure that every AGOL item and group has as its basic information (e.g., what is returned by http://www.arcgis.com/sharing/content/items/6fc5992522d34f26b2210d17835eea21?f=json).

##### data property
Property `data` is the JSON structure holding additional data for the item (e.g., what is returned by http://www.arcgis.com/sharing/content/items/6fc5992522d34f26b2210d17835eea21/data?f=json).

##### estimatedDeploymentCostFactor property
Property `estimatedDeploymentCostFactor` is a number indicating the approximate relative cost of deploying the item; for example, a web map has an estimated cost of 3, while a web mapping app has an estimated cost of 4 because it requires an extra server call to update its URL; feature services and their layers are particularly slow and have an increased cost estimate as a result.

##### JSON templates
The templates themselves are simply JSON, but the `item`, `data`, and `properties` properties may contain template strings which are replaced during the Item creation process. This interpolation is done using the `adlib` library, and more information about how this works is available in the [Adlib Readme](https://github.com/ArcGIS/adlib/blob/master/README.md)

Thus, a template with the itemID '3ef83c' would have an item.id property value '{{3ef83c.id}}'. When instantiated, this value is replaced with the instantiated item's id. While trivial in this case, it is useful for references from, say, a web mapping application to its webmaps and from the webmaps to the supporting feature services. Properties other than the three mentioned above do not use template strings.

##### Item thumbnails
Thumbnail images are downloaded from the source item during the templatization process, and uploaded to the Solution Bundle item as a resource. The `thumbnail` property holds the resource file name, and during deployment, the file will be downloaded from the bundle item, and the original item id is stripped from the file name, and then is is uploaded to the deployed item.

##### Type-specific properties
The `properties` object is a general container for type-specific information that is not contained in the `data` object. For example: service definitions, or survey form definitions. Type specific functions are responsible for managing the contents of this, and thus the structure is not formally defined.

#### Example solution template

Example data section of a Solution template AGO item: [exampleSolutionItem.json](/docs/exampleSolutionItem.json). It contains three independent apps and their dependencies; hierarchies of dependencies are shown via indentation:

1. ROW Permit Dashboard (Dashboard)
	* ROW Permit Dashboard (Webmap)
		* ROWPermits_dashboard (Feature Service)
2. ROW Permit Manager (Web Mapping Application)
	* ROW Permit Manager (Group)
		* ROW Permit Manager (Webmap)
			* ROWPermits_manager (Feature Service)
3. ROW Permit Public Comment (Web Mapping Application)
	* ROW Permit Public Comment (Webmap)
		* ROWPermits_publiccomment (Feature Service)
