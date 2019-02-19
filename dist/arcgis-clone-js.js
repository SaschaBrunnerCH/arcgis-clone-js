var arcgis_clone_js=function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){
/* @preserve
* arcgis-clone-js - v0.4.0 - Apache-2.0
* Copyright (c) 2018-2019 Esri, Inc.
* Thu Feb 14 2019 08:10:52 GMT-0800 (Pacifique)
*/
!function(e){"use strict";const t=(e,t,n)=>t.split(".").reduce((e,t)=>e?e[t]:n,e);function n(e,t){let n=Object.keys(e);var r=n.reduce(function(n,r){return n[r]=t(e[r],r,e),n},{});return r}const r=e=>e instanceof Date,i=e=>"function"==typeof e,o=e=>"object"==typeof e,a=e=>e instanceof RegExp,s=e=>"object"==typeof e;function u(e,t){if(t=t||"",Array.isArray(e)){let t=e.map(r).filter(e=>null!=e);return function(e){let t=e,n=e.reduce((e,t)=>{if(d(t)&&f(t)){let n=c(t);n>e&&(e=n)}return e},-1);return n>-1&&(t=0===n?[]:`{{delete:${n-1}}}`),t}(t)}return e&&s(e)?function(e){let t,n=Object.keys(e).reduce((t,n)=>{let r=e[n];if(d(r)&&f(r)){let e=c(r);e>t.maxLevel&&(t.maxLevel=e)}else t.obj[n]=r;return t},{obj:{},maxLevel:-1});return t=n.maxLevel>0?1===n.maxLevel?void 0:`{{delete:${n.maxLevel-1}}}`:n.obj}(n(e,r)):function(e){let t=e;return"string"==typeof e&&f(e)&&(t=function(e){let t=e,n=c(e);return t=0===n?void 0:`{{delete:${n}}}`}(e)),t}(e);function r(e,n){var r=t?t+"."+n:n;return u(e,r)}}const c=e=>parseInt(e.replace(/{|}/g,"").split(":")[1]);function f(e){return!(!e||"string"!=typeof e)&&e.indexOf("{{delete")>-1}const d=e=>"string"==typeof e;function m(e,t,n,r=0){let i=t;return t||(i=`{{delete:${r}}}`),i}const l=/{{\s*?[\w].*?}}/g,p=e=>"string"==typeof e;function h(e,s,c=null){if((c=c||{}).optional)throw new Error("Please do not pass in an `optional` transform; adlib provides that internally.");c.optional=m;let f=function e(t,s,u){if(u=u||"",Array.isArray(t))return t.map(c);if(!t||!o(t)||r(t)||a(t)||i(t)){let e=s(t,u);return e}return Object.assign({},t,n(t,c));function c(t,n){var r=u?u+"."+n:n;return e(t,s,r)}}(e,function(e,n){if(!p(e))return e;var r;let i=e.match(l);if(i&&i.length){let n=!1,o=i.map(e=>{let r=e.replace(/{|}/g,"").trim();if(r.indexOf("||")>-1){var i=r.split("||").map(e=>e.trim());let e=i.length;r=i.find((r,i)=>{let o=function(e,n){let r=e.split(":")[0],i=t(n,r,null);return null!=i}(r,s);return o?r:i+1===e&&(n=!0,isNaN(r)||(r=parseInt(r)),r)})}let o={key:e,value:r};return n||(o.value=function(e,n,r){let i,o=e.split(":");if(o.length>1){let a=o[0],s=o[1],u=null;if(o[2]&&(u=o[2]),!r||!r[s]||"function"!=typeof r[s])throw new Error(`Attempted to apply non-existant transform ${s} on ${a} with params ${e}`);i=t(n,a),i=r[s](a,i,n,u)}else i=t(n,e);return i}(r,s,c)||e),o});return o.forEach(t=>{e===t.key?("string"==typeof t.value&&(isNaN(t.value)||(t.value.indexOf(".")>-1?t.value=parseFloat(t.value):t.value=parseInt(t.value))),r=t.value):e=e.replace(t.key,t.value)}),r||e}return e});return u(f)}
/*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */var y=function(e,t){return(y=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},v=function(){return(v=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};function g(e){return Object.keys(e).some(function(t){var n=e[t];if(!n)return!1;var r=n.constructor.name;switch(r){case"Array":case"Object":case"Date":case"Function":case"Boolean":case"String":case"Number":return!1;default:return!0}})}function I(e){var t={};return Object.keys(e).forEach(function(n){var r=e[n];if(r||0===r||"boolean"==typeof r||"string"==typeof r){var i,o=r.constructor.name;switch(o){case"Array":i=r[0]&&r[0].constructor&&"Object"===r[0].constructor.name?JSON.stringify(r):r.join(",");break;case"Object":i=JSON.stringify(r);break;case"Date":i=r.valueOf();break;case"Function":i=null;break;case"Boolean":i=r+"";break;default:i=r}(i||0===i||"string"==typeof i)&&(t[n]=i)}}),t}function w(e){var t=I(e);return Object.keys(t).map(function(e){return function(e,t){return encodeURIComponent(e)+"="+encodeURIComponent(t)}(e,t[e])}).join("&")}var b=function(e,t,n,r,i){e=e||"UNKNOWN_ERROR",t=t||"UNKNOWN_ERROR_CODE",this.name="ArcGISRequestError",this.message="UNKNOWN_ERROR_CODE"===t?e:t+": "+e,this.originalMessage=e,this.code=t,this.response=n,this.url=r,this.options=i};b.prototype=Object.create(Error.prototype),b.prototype.constructor=b;var O="@esri/arcgis-rest-js";function P(e,t){void 0===t&&(t={params:{f:"json"}});var n=v({httpMethod:"POST"},t),r=[],i=[];if(n.fetch||"undefined"==typeof fetch?(r.push("`fetch`"),i.push("`isomorphic-fetch`")):n.fetch=fetch.bind(Function("return this")()),"undefined"==typeof Promise&&(r.push("`Promise`"),i.push("`es6-promise`")),"undefined"==typeof FormData&&(r.push("`FormData`"),i.push("`isomorphic-form-data`")),!n.fetch||"undefined"==typeof Promise||"undefined"==typeof FormData)throw new Error("`arcgis-rest-request` requires global variables for `fetch`, `Promise` and `FormData` to be present in the global scope. You are missing "+r.join(", ")+". We recommend installing the "+i.join(", ")+" modules at the root of your application to add these to the global scope. See https://bit.ly/2KNwWaJ for more info.");var o=n.httpMethod,a=n.authentication,s=v({f:"json"},t.params),u={method:o,credentials:"same-origin"};return(a?a.getToken(e,{fetch:n.fetch}):Promise.resolve("")).then(function(r){if(r.length&&(s.token=r),"GET"===u.method){var i=w(s),o=""===i?e:e+"?"+w(s);n.maxUrlLength&&o.length>n.maxUrlLength?u.method="POST":e=o}return"POST"===u.method&&(u.body=function(e){var t=g(e),n=I(e);if(t){var r=new FormData;return Object.keys(n).forEach(function(e){if("undefined"!=typeof Blob&&n[e]instanceof Blob){var t=n.fileName||n[e].name||e;r.append(e,n[e],t)}else r.append(e,n[e])}),r}return w(e)}(s)),u.headers=v({},t.headers),"undefined"!=typeof window||u.headers.referer||(u.headers.referer=O),g(s)||(u.headers["Content-Type"]="application/x-www-form-urlencoded"),n.fetch(e,u)}).then(function(t){if(!t.ok){var r=t.status,i=t.statusText;throw new b(i,"HTTP "+r,t,e,n)}switch(s.f){case"json":case"geojson":return t.json();case"html":case"text":return t.text();default:return t.blob()}}).then(function(t){return"json"===s.f||"geojson"===s.f?function(e,t,n,r){if(e.code>=400){var i=e.message,o=e.code;throw new b(i,o,e,t,r)}if(e.error){var a=e.error,i=a.message,o=a.code,s=a.messageCode,u=s||o||"UNKNOWN_ERROR_CODE";if(498===o||499===o||"GWM_0003"===s)throw new A(i,u,e,t,r);throw new b(i,u,e,t,r)}if("failed"===e.status||"failure"===e.status){var i=void 0,o="UNKNOWN_ERROR_CODE";try{i=JSON.parse(e.statusMessage).message,o=JSON.parse(e.statusMessage).code}catch(t){i=e.statusMessage||e.message}throw new b(i,o,e,t,r)}return e}(t,e,0,n):t})}var E,A=function(e){function t(t,n,r,i,o){void 0===t&&(t="AUTHENTICATION_ERROR"),void 0===n&&(n="AUTHENTICATION_ERROR_CODE");var a=e.call(this,t,n,r,i,o)||this;return a.name="ArcGISAuthError",a.message="AUTHENTICATION_ERROR_CODE"===n?t:n+": "+t,a}return function(e,t){function n(){this.constructor=e}y(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}(t,e),t.prototype.retry=function(e,t){var n=this;void 0===t&&(t=3);var r=0,i=function(o,a){e(n.url,n.options).then(function(e){var t=v({},n.options,{authentication:e});return r+=1,P(n.url,t)}).then(function(e){o(e)}).catch(function(e){"ArcGISAuthError"===e.name&&r<t?i(o,a):"ArcGISAuthError"===e.name&&r>=t?a(n):a(e)})};return new Promise(function(e,t){i(e,t)})},t}(b);function k(e){return"/"===(e=e.trim())[e.length-1]&&(e=e.slice(0,-1)),e}function T(e){return void 0===e&&(e={}),e.portal?k(e.portal):e.authentication?e.authentication.portal:"https://www.arcgis.com/sharing/rest"}function D(e){var t=JSON.parse(JSON.stringify(e)),n=e.typeKeywords,r=void 0===n?[]:n,i=e.tags,o=void 0===i?[]:i;return t.typeKeywords=r.join(", "),t.tags=o.join(", "),t.data&&(t.text=JSON.stringify(t.data),delete t.data),t.properties&&(t.properties=JSON.stringify(t.properties)),t}function S(e){return e.owner?e.owner:e.item&&e.item.owner?e.item.owner:e.authentication.username}function j(e){var t=S(e),n=T(e)+"/content/users/"+t,r=n+"/addItem";return e.folder&&(r=n+"/"+e.folder+"/addItem"),e.params=v({},e.params,D(e.item)),P(r,e)}function C(e){var t,n,r,i,o=T(e)+"/community/createGroup",a=v({},e);return a.params=(t=e.group,n=JSON.parse(JSON.stringify(t)),r=t.tags,i=void 0===r?[]:r,n.tags=i.join(", "),n),P(o,a)}function _(e,t){var n=T(t)+"/community/groups/"+e,r=v({httpMethod:"GET"},t);return P(n,r)}function R(e){var t=e.authentication;return t.getUser(e).then(function(e){return!(!e||"org_admin"!==e.role)})}function F(e){var t=function(e){var t=e.authentication.username,n=e.owner||t;return T(e)+"/content/users/"+encodeURIComponent(n)+"/items/"+e.id+"/share"}(e);return function(e){var t=e.authentication.username;return(e.owner||t)===t}(e)?x(t,e):R(e).then(function(n){if(n)return x(t,e);throw Error("This item can not be shared by "+e.authentication.username+". They are neither the item owner nor an organization admin.")})}function x(e,t){return t.params=v({org:!1,everyone:!1},t.params),"private"===t.access&&(t.params.groups=" "),"org"===t.access&&(t.params.org=!0),"public"===t.access&&(t.params.org=!0,t.params.everyone=!0),P(e,t)}function N(e){return function(e){var t=e.authentication.username,n=e.owner||t;return R(e).then(function(r){var i="share"===e.action?"notSharedWith":"notUnsharedFrom";return function(e){var t={q:"id: "+e.id+" AND group: "+e.groupId,start:1,num:10,sortField:"title"},n=v({},e);return n.params=v({},t,e.params),P(T(n)+"/search",n).then(function(t){return 0!==t.total&&(t.results.some(function(t){var r=t.id===e.id;return r&&(n=t),r}),!!n);var n})}(e).then(function(o){if("share"===e.action&&!0===o||"unshare"===e.action&&!1===o){var a={itemId:e.id,shortcut:!0};return a[i]=[],a}return function(e){return _(e.groupId,e).then(function(e){return e.userMembership.memberType}).catch(function(){return"nonmember"})}(e).then(function(i){if("nonmember"===i)throw Error("This item can not be "+e.action+"d by "+t+" as they are not a member of the specified group "+e.groupId+".");if(n===t||r)return T(e)+"/content/users/"+n+"/items/"+e.id+"/"+e.action;if("admin"===i||"owner"===i)return T(e)+"/content/items/"+e.id+"/"+e.action;throw Error("This item can not be "+e.action+"d by "+t+" as they are neither the owner, a groupAdmin of "+e.groupId+", nor an org_admin.")}).then(function(t){return e.params={groups:e.groupId,confirmItemControl:e.confirmItemControl},P(t,e)}).then(function(t){if(t[i].length)throw Error("Item "+e.id+" could not be "+e.action+"d to group "+e.groupId+".");return t})})})}(v({action:"share"},e))}!function(e){e.ArcGISRequestError="ArcGISRequestError",e.ArcGISAuthError="ArcGISAuthError"}(E||(E={}));var U="{{organization.portalBaseUrl}}";function M(e){e.item.extent&&(e.item.extent="{{initiative.extent:optional}}"),e.item.id=z(e.item.id)}function L(e,t,n,r,i){return void 0===r&&(r=null),void 0===i&&(i="private"),new Promise(function(o,a){var s=v({item:e,folder:r},n);t&&(s.item.text=t),j(s).then(function(e){if("private"!==i){var t=v({id:e.id,access:i},n);F(t).then(function(e){o({success:!0,id:e.itemId})},function(){return a({success:!1})})}else o({success:!0,id:e.id})},function(){return a({success:!1})})})}function W(e){return Array.isArray(e)?e.map(function(e){return W(e)}):e&&e.startsWith("{{")?e.substring(2,e.indexOf(".")):e}function G(e,t,n){n&&n({processId:e,status:t?"done":"failed"})}function B(){var e=new Date;return K(e.getUTCFullYear(),4)+K(e.getUTCMonth()+1,2)+K(e.getUTCDate(),2)+"_"+K(e.getUTCHours(),2)+K(e.getUTCMinutes(),2)+"_"+K(e.getUTCSeconds(),2)+K(e.getUTCMilliseconds(),3)}function K(e,t){var n=e.toString(),r=t-n.length;return r>0&&(n="0".repeat(r)+n),n}function z(e,t){return void 0===t&&(t="id"),Array.isArray(e)?function(e,t){return void 0===t&&(t="id"),e.map(function(e){return z(e,t)})}(e,t):e&&e.startsWith("{{")?e:"{{"+e+"."+t+"}}"}function J(e,t,n){return new Promise(function(r,i){var o=v({item:{id:e,url:t}},n);(function(e){var t=S(e),n=T(e)+"/content/users/"+t+"/items/"+e.item.id+"/update";return e.params=v({},e.params,D(e.item)),P(n,e)})(o).then(function(t){r(e)},function(){return i()})})}function H(e,t){return t.split(".").reduce(function(e,t){return e?e[t]:void 0},e)}function $(e,t){return t.reduce(function(t,n){var r=H(e,n);return r&&t.push(r),t},[])}function q(e,t){var n,r=[];if(!e)return r;for(n in e)e.hasOwnProperty(n)&&(n===t?r.push(e[n]):Array.isArray(e[n])?e[n].forEach(function(e){r=r.concat(q(e,t))}):"object"==typeof e[n]&&(r=r.concat(q(e[n],t))));return r}function V(e,t){var n=H(e,"item.typeKeywords")||e.typeKeywords||[];return n.includes(t)}function Y(e){return void 0===e&&(e="i"),""+e+Math.random().toString(36).substr(2,8)}var Q="/apps/opsdashboard/index.html#/",X=Object.freeze({OPS_DASHBOARD_APP_URL_PART:Q,completeItemTemplate:function(e,t){return new Promise(function(t){e.estimatedDeploymentCostFactor=4,M(e),e.item.url=U+Q,t(e)})},getDependencies:function(e,t){return new Promise(function(t){var n=[],r=H(e,"data.widgets");r&&r.forEach(function(e){"mapWidget"===e.type&&n.push(e.itemId)}),t(n)})},deployItem:function(e,t,n,r){return r&&r({processId:e.key,type:e.type,status:"starting",estimatedCostFactor:e.estimatedDeploymentCostFactor}),new Promise(function(i,o){var a=v({item:e.item,folder:t.folderId},n);e.data&&(a.item.text=e.data),r&&r({processId:e.key,status:"creating"}),j(a).then(function(a){a.success?(t[W(e.itemId)]={id:a.id},e.itemId=e.item.id=a.id,e=h(e,t),r&&r({processId:e.key,status:"updating URL"}),J(e.itemId,e.item.url,n).then(function(){G(e.key,!0,r),i(e)},function(){G(e.key,!1,r),o({success:!1})})):(G(e.key,!1,r),o({success:!1}))},function(){G(e.key,!1,r),o({success:!1})})})}});function Z(e,t,n){return new Promise(function(r,i){if(e.dependencies.length>0){var o=[];e.dependencies.forEach(function(r){o.push(new Promise(function(i,o){N(v({id:r,groupId:e.itemId},t)).then(function(){n&&n({processId:e.key,status:"added group member"}),i()},function(){G(e.key,!1,n),o({success:!1})})}))}),Promise.all(o).then(function(){return r()},function(){return i({success:!1})})}else r()})}function ee(e,t){return new Promise(function(n,r){(function(e,t){var n=T(t)+"/content/groups/"+e,r=v({httpMethod:"GET"},{params:{start:1,num:100}},t);return t&&t.paging&&(r.params=v({},t.paging)),P(n,r)})(e,t).then(function(i){if(i.num>0){var o=i.items.map(function(e){return e.id});i.nextStart>0?(t.paging.start=i.nextStart,ee(e,t).then(function(e){n(o.concat(e))},function(){return r({success:!1})})):n(o)}else n([])},function(){return r({success:!1})})})}var te=Object.freeze({completeItemTemplate:function(e,t){return new Promise(function(t){e.estimatedDeploymentCostFactor=3,M(e),t(e)})},getDependencies:function(e,t){return new Promise(function(n,r){var i=v({paging:{start:1,num:100}},t);ee(e.itemId,i).then(function(t){e.estimatedDeploymentCostFactor=3+t.length,n(t)},function(){return r({success:!1})})})},deployItem:function(e,t,n,r){return r&&r({processId:e.key,type:e.type,status:"starting",estimatedCostFactor:e.estimatedDeploymentCostFactor}),new Promise(function(i,o){var a=v({group:e.item},n);a.group.title+="_"+B(),r&&r({processId:e.key,status:"creating"}),C(a).then(function(a){a.success?(t[W(e.itemId)]={id:a.group.id},e.itemId=a.group.id,Z(e=h(e,t),n,r).then(function(){G(e.key,!0,r),i(e)},function(){G(e.key,!1,r),o({success:!1})})):(G(e.key,!1,r),o({success:!1}))},function(){G(e.key,!1,r),o({success:!1})})})},addGroupMembers:Z,getGroupContentsTranche:ee});function ne(e){var t=S(e),n=T(e)+"/content/users/"+t,r=n+"/createService";return e.params=v({createParameters:e.item,outputType:"featureService"},e.params),e.folderId&&"/"!==e.folderId?P(r,e).then(function(t){if(t.success)return function(e){var t=S(e),n=T(e)+"/content/users/"+t+"/items/"+e.itemId+"/move",r=e.folderId;return r||(r="/"),e.params=v({folder:r},e.params),P(n,e)}({itemId:t.itemId,folderId:e.folderId,authentication:e.authentication}).then(function(e){if(e.success)return t;throw Error("A problem was encountered when trying to move the service to a different folder.")});throw Error("A problem was encountered when trying to create the service.")}):P(r,e)}function re(e,t){var n=k(e).replace("/rest/services","/rest/admin/services")+"/addToDefinition";return t.params=v({addToDefinition:{}},t.params),t.layers&&t.layers.length>0&&(t.params.addToDefinition.layers=t.layers),t.tables&&t.tables.length>0&&(t.params.addToDefinition.tables=t.tables),P(n,t)}function ie(e,t,n,r){return new Promise(function(i,o){var a=e.properties,s=[];(a.layers||[]).forEach(function(e){s[e.id]={item:e,type:"layer"}}),(a.tables||[]).forEach(function(e){s[e.id]={item:e,type:"table"}});var u={};s.length>0?function e(t,n,r,i,o,a,s,u){return new Promise(function(c,f){if(r.length>0){var d=r.shift(),m=d.item,l=m.id;delete m.serviceItemId,Array.isArray(m.relationships)&&m.relationships.length>0&&(o[l]=m.relationships,m.relationships=[]);var p=v({},a);"layer"===d.type?(m.adminLayerInfo={geometryField:{name:"Shape",srid:102100}},p.layers=[m]):p.tables=[m],re(n,p).then(function(){u&&u({processId:s,status:"added layer"}),e(t,n,r,i,o,a,s,u).then(function(){return c()},function(){return f({success:!1})})},function(){return f({success:!1})})}else c()})}(e.itemId,e.item.url,s,t,u,n,e.key,r).then(function(){var t=[];Object.keys(u).forEach(function(i){t.push(new Promise(function(t,o){var a=v({params:{updateFeatureServiceDefinition:{relationships:u[i]}}},n);re(e.item.url+"/"+i,a).then(function(){r&&r({processId:e.key,status:"updated relationship"}),t()},function(){return o()})}))}),Promise.all(t).then(function(){return i()},function(){return o({success:!1})})},function(){return o({success:!1})}):i()})}function oe(e){return e.reduce(function(e,t){return e+(t.relationships?t.relationships.length:0)},0)}function ae(e,t){return new Promise(function(n,r){var i={service:{},layers:[],tables:[]},o=e.item.url;e.item.url=z(e.itemId,"url"),P(o+"?f=json",t).then(function(a){a.name=e.item.name||se(a.layers)||se(a.tables)||"Feature Service",a.snippet=e.item.snippet,a.description=e.item.description,a.serviceItemId=z(a.serviceItemId),i.service=a,Promise.all([ue(o,a.layers,t),ue(o,a.tables,t)]).then(function(t){i.layers=t[0],i.tables=t[1],e.properties=i,e.estimatedDeploymentCostFactor+=i.layers.length+oe(i.layers)+i.tables.length+oe(i.tables),n()},function(){return r({success:!1})})},function(){return r({success:!1})})})}function se(e){var t="";return Array.isArray(e)&&e.length>0&&e.some(function(e){return""!==e.name&&(t=e.name,!0)}),t}function ue(e,t,n){return new Promise(function(r,i){Array.isArray(t)&&0!==t.length||r([]);var o=[];t.forEach(function(t){o.push(P(e+"/"+t.id+"?f=json",n))}),Promise.all(o).then(function(e){e.forEach(function(e){e.editFieldsInfo=null,e.serviceItemId=z(e.serviceItemId)}),r(e)},function(){return i({success:!1})})})}var ce=Object.freeze({completeItemTemplate:function(e,t){return new Promise(function(n,r){e.estimatedDeploymentCostFactor=3,M(e),ae(e,t).then(function(){return n(e)},function(){return r({success:!1})})})},getDependencies:function(e,t){return new Promise(function(e){e([])})},deployItem:function(e,t,n,r){return r&&r({processId:e.key,type:e.type,status:"starting",estimatedCostFactor:e.estimatedDeploymentCostFactor}),new Promise(function(i,o){var a=v({item:e.item,folderId:t.folderId},n);e.data&&(a.item.text=e.data),a.item.name+="_"+B(),r&&r({processId:e.key,status:"creating"}),ne(a).then(function(a){t[W(e.itemId)]={id:a.serviceItemId,url:a.serviceurl},e.itemId=e.item.id=a.serviceItemId,(e=h(e,t)).item.url=a.serviceurl,ie(e,t,n,r).then(function(){G(e.key,!0,r),i(e)},function(){G(e.key,!1,r),o({success:!1})})},function(){G(e.key,!1,r),o({success:!1})})})},addFeatureServiceLayersAndTables:ie,countRelationships:oe,fleshOutFeatureService:ae}),fe="/home/webmap/viewer.html?webmap=";function de(e){return void 0===e&&(e=[]),e.reduce(function(e,t){var n=t.itemId;return n&&e.push(n),e},[])}function me(e){void 0===e&&(e=[]),e.filter(function(e){return!!e.itemId}).forEach(function(e){var t=e.url.substr(e.url.lastIndexOf("/"));e.itemId=z(e.itemId),e.url=z(W(e.itemId),"url")+t})}var le=Object.freeze({completeItemTemplate:function(e,t){return new Promise(function(t){e.estimatedDeploymentCostFactor=4,M(e),e.item.url=U+fe+z(e.itemId),e.data&&(me(e.data.operationalLayers),me(e.data.tables)),t(e)})},getDependencies:function(e,t){return new Promise(function(t){var n=[];e.data&&(n=de(e.data.operationalLayers).concat(de(e.data.tables))),t(n)})},deployItem:function(e,t,n,r){return r&&r({processId:e.key,type:e.type,status:"starting",estimatedCostFactor:e.estimatedDeploymentCostFactor}),new Promise(function(i,o){var a=v({item:e.item,folder:t.folderId},n);e.data&&(a.item.text=e.data),r&&r({processId:e.key,status:"creating"}),j(a).then(function(a){a.success?(t[W(e.itemId)]={id:a.id},e.itemId=e.item.id=a.id,e=h(e,t),r&&r({processId:e.key,status:"updating URL"}),J(e.itemId,e.item.url,n).then(function(){G(e.key,!0,r),i(e)},function(){G(e.key,!1,r),o({success:!1})})):(G(e.key,!1,r),o({success:!1}))},function(){G(e.key,!1,r),o({success:!1})})})},getWebmapLayerIds:de,templatizeWebmapLayerIdsAndUrls:me});function pe(e){var t=function(e){return[]};return V(e,"Cascade")&&(t=he),V(e,"MapJournal")&&(t=ve),V(e,"mapseries")&&(t=ye),Promise.resolve(t(e))}function he(e){var t=H(e,"data.values.sections")||[];return t.reduce(function(e,t){return e.concat(q(t,"webmap").map(function(e){return e.id}))},[])}function ye(e){var t=$(e,["data.values.webmap"]),n=H(e,"data.values.story.entries")||[];return n.forEach(function(e){var n=q(e,"webmap").map(function(e){return e.id});n.forEach(function(e){-1===t.indexOf(e)&&t.push(e)})}),t}function ve(e){var t=H(e,"data.values.story.sections")||[],n=t.reduce(function(e,t){if(t.media){if("webmap"===t.media.type){var n=H(t,"media.webmap.id");n&&e.push(n)}if("webpage"===t.media.type){var r=H(t,"media.webpage.url"),i=function(e){var t=null;if(!e)return t;var n=e.split("?")[1];return n&&(t=n.split("&").reduce(function(e,t){var n,r=t.split("=")[1];return r&&("string"==typeof(n=r)&&("{"===n[0]&&(n=n.substring(1,n.length-1)),/^(\{){0,1}[0-9a-fA-F]{8}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{12}(\}){0,1}$/gi.test(n)))&&(e=r),e},null)),t}(r);i&&e.push(i)}}return e},[]);return n}function ge(e){var t=[],n=H(e,"data.map.itemId");return n&&t.push(n),Promise.resolve(t)}function Ie(e){return Promise.resolve($(e,["data.webmap","data.itemId","data.values.webmap","data.values.group"]))}var we,be=Object.freeze({completeItemTemplate:function(e,t){return new Promise(function(t){e.estimatedDeploymentCostFactor=4,M(e);var n=e.item.url,r=n.indexOf("//");e.item.url=U+n.substring(n.indexOf("/",r+2),n.lastIndexOf("=")+1)+z(e.itemId),H(e,"data.folderId")&&(e.data.folderId="{{folderId}}"),H(e,"data.values.webmap")?e.data.values.webmap=z(e.data.values.webmap):H(e,"data.values.group")&&(e.data.values.group=z(e.data.values.group)),t(e)})},getDependencies:function(e){var t=Ie;return V(e,"Story Map")&&(t=pe),function(e,t){var n=H(e,"item.typeKeywords")||e.typeKeywords||[];return t.reduce(function(e,t){return e||(e=n.includes(t)),e},!1)}(e,["WAB2D","WAB3D","Web AppBuilder"])&&(t=ge),t(e)},getGenericWebAppDependencies:Ie,deployItem:function(e,t,n,r){return r&&r({processId:e.key,type:e.type,status:"starting",estimatedCostFactor:e.estimatedDeploymentCostFactor}),new Promise(function(i,o){var a=v({item:e.item,folder:t.folderId},n);e.data&&(a.item.text=e.data),r&&r({processId:e.key,status:"creating"}),j(a).then(function(a){a.success?(t[W(e.itemId)]={id:a.id},e.itemId=e.item.id=a.id,e=h(e,t),r&&r({processId:e.key,status:"updating URL"}),J(e.itemId,e.item.url,n).then(function(){G(e.key,!0,r),i(e)},function(){G(e.key,!1,r),o({success:!1})})):(G(e.key,!1,r),o({success:!1}))},function(){G(e.key,!1,r),o({success:!1})})})}}),Oe=Object.freeze({completeItemTemplate:function(e,t){return new Promise(function(t){M(e),t(e)})},getDependencies:function(e,t){return new Promise(function(e){e([])})},deployItem:function(e,t,n,r){return r&&r({processId:e.key,type:e.type,status:"starting",estimatedCostFactor:e.estimatedDeploymentCostFactor}),new Promise(function(i,o){var a=v({item:e.item,folder:t.folderId},n);e.data&&(a.item.text=e.data),r&&r({processId:e.key,status:"creating"}),j(a).then(function(n){n.success?(t[W(e.itemId)]={id:n.id},e.itemId=e.item.id=n.id,G((e=h(e,t)).key,!0,r),i(e)):(G(e.key,!1,r),o({success:!1}))},function(){G(e.key,!1,r),o({success:!1})})})}}),Pe={dashboard:X,"feature service":ce,group:te,"web map":le,"web mapping application":be};function Ee(e,t){return new Promise(function(n,r){var i;(function(e,t){var n=T(t)+"/content/items/"+e,r=v({httpMethod:"GET"},t);return P(n,r)})(e,t).then(function(o){Pe[o.type.toLowerCase()]||console.warn("Unimplemented item type "+o.type+" for "+e),(i={itemId:o.id,type:o.type,key:Y(),item:ke(o),dependencies:[],fcns:Pe[o.type.toLowerCase()]||Oe,estimatedDeploymentCostFactor:3}).item.id=z(i.item.id),i.item.item&&(i.item.item=z(i.item.item)),i.item.thumbnail="https://www.arcgis.com/sharing/content/items/"+o.id+"/info/"+i.item.thumbnail;var a=function(e,t){var n=T(t)+"/content/items/"+e+"/data",r=v({httpMethod:"GET",params:{}},t);return r.file&&(r.params.f=null),P(n,r)}(e,t),s=v({id:e},t),u=function(e){var t=T(e)+"/content/items/"+e.id+"/resources";return e.params=v({},e.params,{num:1e3}),P(t,e)}(s);Promise.all([a.catch(function(){return null}),u.catch(function(){return null})]).then(function(e){var o=e[0],a=e[1];i.data=o,i.resources=a&&a.total>0?a.resources:null;var s=i.fcns.completeItemTemplate(i,t),u=i.fcns.getDependencies(i,t);Promise.all([s,u]).then(function(e){var t=e[0],r=e[1];(i=t).dependencies=Ae(W(r.reduce(function(e,t){return e.concat(t)},[]))),n(i)},function(){return r({success:!1})})})},function(){_(e,t).then(function(e){(i={itemId:e.id,type:"Group",key:Y(),item:ke(e),dependencies:[],fcns:Pe.group,estimatedDeploymentCostFactor:3}).item.thumbnail="https://www.arcgis.com/sharing/content/items/"+e.id+"/info/"+i.item.thumbnail;var o=i.fcns.completeItemTemplate(i,t),a=i.fcns.getDependencies(i,t);Promise.all([o,a]).then(function(e){var t=e[0],r=e[1];(i=t).dependencies=Ae(W(r)),n(i)},function(){return r({success:!1})})},function(){return r({success:!1})})})})}function Ae(e){var t={};return e.forEach(function(e){return t[e]=!0}),Object.keys(t)}function ke(e){if(e){var t=v({},e);return delete t.avgRating,delete t.created,delete t.guid,delete t.lastModified,delete t.modified,delete t.numComments,delete t.numRatings,delete t.numViews,delete t.orgId,delete t.owner,delete t.scoreCompleteness,delete t.size,delete t.uploaded,t}return null}function Te(e,t,n,r,i){n[r]={};var o=new Promise(function(o,a){var s=De(e,r);s||a({success:!1});var u=[];(s.dependencies||[]).forEach(function(e){return u.push(n[e].def)}),Promise.all(u).then(function(){var s=function(e){return e.fcns=Pe[e.type.toLowerCase()]||Oe,e}(De(e,r));s.dependencies=s.dependencies?z(s.dependencies):[],(s=h(s,n)).fcns.deployItem(s,n,t,i).then(function(e){return o(e)},function(){return a({success:!1})})},function(){return a({success:!1})})});return n[r].def=o,o}function De(e,t){var n=je(e,t);return n>=0?e[n]:null}function Se(e,t,n){return n||(n=[]),new Promise(function(r,i){if("string"==typeof e){var o=e;if(De(n,o))r(n);else{var a=Ee(o,t);n.push({itemId:o,type:"",key:"",item:null}),a.then(function(e){if(Ce(n,e.itemId,e),0===e.dependencies.length)r(n);else{var o=[];e.dependencies.forEach(function(e){De(n,e)||o.push(Se(e,t,n))}),Promise.all(o).then(function(){r(n)},function(){return i({success:!1})})}},function(){return i({success:!1})})}}else if(Array.isArray(e)&&e.length>0){var s=[];e.forEach(function(e){s.push(Se(e,t,n))}),Promise.all(s).then(function(){r(n)},function(){return i({success:!1})})}else i({success:!1})})}function je(e,t){var n=W(t);return e.findIndex(function(e){return n===W(e.itemId)})}function Ce(e,t,n){var r=je(e,t);return r>=0&&(e[r]=n,!0)}function _e(e){var t=[],n={};return e.forEach(function(e){n[e.itemId]=we.White}),e.forEach(function(r){n[r.itemId]===we.White&&function r(i){n[i]=we.Gray;var o=De(e,i),a=o.dependencies||[];a.forEach(function(e){if(n[e]===we.White)r(e);else if(n[e]===we.Gray)throw Error("Cyclical dependency graph detected")}),n[i]=we.Black,t.push(i)}(r.itemId)}),t}function Re(e){var t=e.map(function(e){return e.itemId});return e.forEach(function(e){(e.dependencies||[]).forEach(function(e){var n=t.indexOf(e);n>=0&&t.splice(n,1)})}),t}(function(e){e[e.White=0]="White",e[e.Gray=1]="Gray",e[e.Black=2]="Black"})(we||(we={})),e.createSolution=function(e,t){return new Promise(function(n,r){Se(e,t).then(function(e){return n(e)},function(){return r({success:!1})})})},e.publishSolution=function(e,t,n,r,i){return void 0===r&&(r=null),void 0===i&&(i="private"),L({title:e,type:"Solution",itemType:"text",typeKeywords:["Template"],access:i,listed:!1,commentsEnabled:!1},{templates:t},n,r,i)},e.getEstimatedDeploymentCost=function(e){return e.reduce(function(e,t){return e+(t.estimatedDeploymentCostFactor?t.estimatedDeploymentCostFactor:3)},0)},e.deploySolution=function(e,t,n,r){return void 0===n&&(n={}),new Promise(function(i,o){e&&0!==Object.keys(e).length||i([]);var a=_e(e);function s(){var s=[];a.forEach(function(i){return s.push(Te(e,t,n,i,r))}),Promise.all(s).then(function(e){return i(e)},function(){return o({success:!1})})}if(n.folderId)s();else{var u=(n.solutionName||"Solution")+" ("+B()+")",c={title:u,authentication:t.authentication};(function(e){var t=S(e),n=T(e)+"/content/users/"+t+"/createFolder";return e.params=v({title:e.title},e.params),P(n,e)})(c).then(function(e){n.folderId=e.folder.id,s()},function(){return o({success:!1})})}})},e.deployWhenReady=Te,e.getTemplateInSolution=De,e.PLACEHOLDER_SERVER_NAME="{{organization.portalBaseUrl}}",e.OPS_DASHBOARD_APP_URL_PART="/apps/opsdashboard/index.html#/",e.WEBMAP_APP_URL_PART="/home/webmap/viewer.html?webmap=",e.getItemTemplateHierarchy=Se,e.replaceTemplate=Ce,e.topologicallySortItems=_e,e.getTopLevelItemIds=Re,e.getItemHierarchy=function(e){var t=[];return function t(n,r){n.forEach(function(n){var i={id:n,dependencies:[]},o=De(e,n),a=o.dependencies;Array.isArray(a)&&a.length>0&&t(a,i.dependencies),r.push(i)})}(Re(e),t),t},e.createDeployedSolutionItem=function(e,t,n,r,i,o){return void 0===i&&(i={}),void 0===o&&(o="private"),new Promise(function(a,s){var u="https://www.arcgis.com/sharing/content/items/"+n.id+"/info/"+n.thumbnail,c={itemType:"text",name:null,title:e,description:n.description,tags:n.tags,snippet:n.snippet,thumbnailurl:u,accessInformation:n.accessInformation,type:"Solution",typeKeywords:["Solution","Deployed"],commentsEnabled:!1},f={templates:t};L(c,f,r,i.folderId,o).then(function(e){var t=i.organization&&i.organization.orgUrl||"https://www.arcgis.com",n=e.id,o=t+"/home/item.html?id="+n;J(n,o,r).then(function(e){var t={id:n,url:o};a(t)},function(){return s({success:!1})})},function(){return s({success:!1})})})},Object.defineProperty(e,"__esModule",{value:!0})}(t)}]);