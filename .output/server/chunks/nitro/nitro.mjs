import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import mongoose, { Schema as Schema$b } from 'mongoose';
import * as yup from 'yup';
import { v2 } from 'cloudinary';
import { SquareClient, SquareEnvironment } from 'square';
import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import nodeCrypto, { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$2, dirname as dirname$1, join } from 'node:path';
import { consola, createConsola } from 'consola';
import { colors } from 'consola/utils';
import { toValue } from 'vue';
import { fileURLToPath } from 'node:url';
import { getIcons } from '@iconify/utils';
import { XMLParser } from 'fast-xml-parser';
import { ipxFSStorage, ipxHttpStorage, createIPX, createIPXH3Handler } from 'ipx';

const subtle = nodeCrypto.webcrypto?.subtle || {};
const randomUUID = () => {
  return nodeCrypto.randomUUID();
};
const getRandomValues = (array) => {
  return nodeCrypto.webcrypto.getRandomValues(array);
};
const _crypto = {
  randomUUID,
  getRandomValues,
  subtle
};

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}
function withHttps(input) {
  return withProtocol(input, "https://");
}
function withProtocol(input, protocol) {
  let match = input.match(PROTOCOL_REGEX);
  if (!match) {
    match = input.match(/^\/{2,}/);
  }
  if (!match) {
    return protocol + input;
  }
  return protocol + input.slice(match[0].length);
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

// src/utils.ts
var alphabetByEncoding = {};
var alphabetByValue = Array.from({ length: 64 });
for (let i = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i + start <= limit; i++) {
  const char = String.fromCharCode(i + start);
  alphabetByEncoding[char] = i;
  alphabetByValue[i] = char;
}
for (let i = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i + start <= limit; i++) {
  const char = String.fromCharCode(i + start);
  const index = i + 26;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
for (let i = 0; i < 10; i++) {
  alphabetByEncoding[i.toString(10)] = i + 52;
  const char = i.toString(10);
  const index = i + 52;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
alphabetByEncoding["-"] = 62;
alphabetByValue[62] = "-";
alphabetByEncoding["_"] = 63;
alphabetByValue[63] = "_";
var bitsPerLetter = 6;
var bitsPerByte = 8;
var maxLetterValue = 63;
var stringToBuffer = (value) => {
  return new TextEncoder().encode(value);
};
var bufferToString = (value) => {
  return new TextDecoder().decode(value);
};
var base64urlDecode = (_input) => {
  const input = _input + "=".repeat((4 - _input.length % 4) % 4);
  let totalByteLength = input.length / 4 * 3;
  if (input.endsWith("==")) {
    totalByteLength -= 2;
  } else if (input.endsWith("=")) {
    totalByteLength--;
  }
  const out = new ArrayBuffer(totalByteLength);
  const dataView = new DataView(out);
  for (let i = 0; i < input.length; i += 4) {
    let bits = 0;
    let bitLength = 0;
    for (let j = i, limit = i + 3; j <= limit; j++) {
      if (input[j] === "=") {
        bits >>= bitsPerLetter;
      } else {
        if (!(input[j] in alphabetByEncoding)) {
          throw new TypeError(`Invalid character ${input[j]} in base64 string.`);
        }
        bits |= alphabetByEncoding[input[j]] << (limit - j) * bitsPerLetter;
        bitLength += bitsPerLetter;
      }
    }
    const chunkOffset = i / 4 * 3;
    bits >>= bitLength % bitsPerByte;
    const byteLength = Math.floor(bitLength / bitsPerByte);
    for (let k = 0; k < byteLength; k++) {
      const offset = (byteLength - k - 1) * bitsPerByte;
      dataView.setUint8(chunkOffset + k, (bits & 255 << offset) >> offset);
    }
  }
  return new Uint8Array(out);
};
var base64urlEncode = (_input) => {
  const input = typeof _input === "string" ? stringToBuffer(_input) : _input;
  let str = "";
  for (let i = 0; i < input.length; i += 3) {
    let bits = 0;
    let bitLength = 0;
    for (let j = i, limit = Math.min(i + 3, input.length); j < limit; j++) {
      bits |= input[j] << (limit - j - 1) * bitsPerByte;
      bitLength += bitsPerByte;
    }
    const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
    bits <<= bitClusterCount * bitsPerLetter - bitLength;
    for (let k = 1; k <= bitClusterCount; k++) {
      const offset = (bitClusterCount - k) * bitsPerLetter;
      str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
    }
  }
  return str;
};

// src/index.ts
var defaults = {
  encryption: { saltBits: 256, algorithm: "aes-256-cbc", iterations: 1, minPasswordlength: 32 },
  integrity: { saltBits: 256, algorithm: "sha256", iterations: 1, minPasswordlength: 32 },
  ttl: 0,
  timestampSkewSec: 60,
  localtimeOffsetMsec: 0
};
var clone = (options) => ({
  ...options,
  encryption: { ...options.encryption },
  integrity: { ...options.integrity }
});
var algorithms = {
  "aes-128-ctr": { keyBits: 128, ivBits: 128, name: "AES-CTR" },
  "aes-256-cbc": { keyBits: 256, ivBits: 128, name: "AES-CBC" },
  sha256: { keyBits: 256, name: "SHA-256" }
};
var macPrefix = "Fe26.2";
var randomBytes = (_crypto, size) => {
  const bytes = new Uint8Array(size);
  _crypto.getRandomValues(bytes);
  return bytes;
};
var randomBits = (_crypto, bits) => {
  if (bits < 1)
    throw new Error("Invalid random bits count");
  const bytes = Math.ceil(bits / 8);
  return randomBytes(_crypto, bytes);
};
var pbkdf2 = async (_crypto, password, salt, iterations, keyLength, hash) => {
  const passwordBuffer = stringToBuffer(password);
  const importedKey = await _crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const saltBuffer = stringToBuffer(salt);
  const params = { name: "PBKDF2", hash, salt: saltBuffer, iterations };
  const derivation = await _crypto.subtle.deriveBits(params, importedKey, keyLength * 8);
  return derivation;
};
var generateKey = async (_crypto, password, options) => {
  var _a;
  if (!(password == null ? void 0 : password.length))
    throw new Error("Empty password");
  if (options == null || typeof options !== "object")
    throw new Error("Bad options");
  if (!(options.algorithm in algorithms))
    throw new Error(`Unknown algorithm: ${options.algorithm}`);
  const algorithm = algorithms[options.algorithm];
  const result = {};
  const hmac = (_a = options.hmac) != null ? _a : false;
  const id = hmac ? { name: "HMAC", hash: algorithm.name } : { name: algorithm.name };
  const usage = hmac ? ["sign", "verify"] : ["encrypt", "decrypt"];
  if (typeof password === "string") {
    if (password.length < options.minPasswordlength)
      throw new Error(
        `Password string too short (min ${options.minPasswordlength} characters required)`
      );
    let { salt = "" } = options;
    if (!salt) {
      const { saltBits = 0 } = options;
      if (!saltBits)
        throw new Error("Missing salt and saltBits options");
      const randomSalt = randomBits(_crypto, saltBits);
      salt = [...new Uint8Array(randomSalt)].map((x) => x.toString(16).padStart(2, "0")).join("");
    }
    const derivedKey = await pbkdf2(
      _crypto,
      password,
      salt,
      options.iterations,
      algorithm.keyBits / 8,
      "SHA-1"
    );
    const importedEncryptionKey = await _crypto.subtle.importKey(
      "raw",
      derivedKey,
      id,
      false,
      usage
    );
    result.key = importedEncryptionKey;
    result.salt = salt;
  } else {
    if (password.length < algorithm.keyBits / 8)
      throw new Error("Key buffer (password) too small");
    result.key = await _crypto.subtle.importKey("raw", password, id, false, usage);
    result.salt = "";
  }
  if (options.iv)
    result.iv = options.iv;
  else if ("ivBits" in algorithm)
    result.iv = randomBits(_crypto, algorithm.ivBits);
  return result;
};
var getEncryptParams = (algorithm, key, data) => {
  return [
    algorithm === "aes-128-ctr" ? { name: "AES-CTR", counter: key.iv, length: 128 } : { name: "AES-CBC", iv: key.iv },
    key.key,
    typeof data === "string" ? stringToBuffer(data) : data
  ];
};
var encrypt = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, options);
  const encrypted = await _crypto.subtle.encrypt(...getEncryptParams(options.algorithm, key, data));
  return { encrypted: new Uint8Array(encrypted), key };
};
var decrypt = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, options);
  const decrypted = await _crypto.subtle.decrypt(...getEncryptParams(options.algorithm, key, data));
  return bufferToString(new Uint8Array(decrypted));
};
var hmacWithPassword = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, { ...options, hmac: true });
  const textBuffer = stringToBuffer(data);
  const signed = await _crypto.subtle.sign({ name: "HMAC" }, key.key, textBuffer);
  const digest = base64urlEncode(new Uint8Array(signed));
  return { digest, salt: key.salt };
};
var normalizePassword = (password) => {
  if (typeof password === "string" || password instanceof Uint8Array)
    return { encryption: password, integrity: password };
  if ("secret" in password)
    return { id: password.id, encryption: password.secret, integrity: password.secret };
  return { id: password.id, encryption: password.encryption, integrity: password.integrity };
};
var seal = async (_crypto, object, password, options) => {
  if (!password)
    throw new Error("Empty password");
  const opts = clone(options);
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  const objectString = JSON.stringify(object);
  const pass = normalizePassword(password);
  const { id = "", encryption, integrity } = pass;
  if (id && !/^\w+$/.test(id))
    throw new Error("Invalid password id");
  const { encrypted, key } = await encrypt(_crypto, encryption, opts.encryption, objectString);
  const encryptedB64 = base64urlEncode(new Uint8Array(encrypted));
  const iv = base64urlEncode(key.iv);
  const expiration = opts.ttl ? now + opts.ttl : "";
  const macBaseString = `${macPrefix}*${id}*${key.salt}*${iv}*${encryptedB64}*${expiration}`;
  const mac = await hmacWithPassword(_crypto, integrity, opts.integrity, macBaseString);
  const sealed = `${macBaseString}*${mac.salt}*${mac.digest}`;
  return sealed;
};
var fixedTimeComparison = (a, b) => {
  let mismatch = a.length === b.length ? 0 : 1;
  if (mismatch)
    b = a;
  for (let i = 0; i < a.length; i += 1)
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
};
var unseal = async (_crypto, sealed, password, options) => {
  if (!password)
    throw new Error("Empty password");
  const opts = clone(options);
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  const parts = sealed.split("*");
  if (parts.length !== 8)
    throw new Error("Incorrect number of sealed components");
  const prefix = parts[0];
  let passwordId = parts[1];
  const encryptionSalt = parts[2];
  const encryptionIv = parts[3];
  const encryptedB64 = parts[4];
  const expiration = parts[5];
  const hmacSalt = parts[6];
  const hmac = parts[7];
  const macBaseString = `${prefix}*${passwordId}*${encryptionSalt}*${encryptionIv}*${encryptedB64}*${expiration}`;
  if (macPrefix !== prefix)
    throw new Error("Wrong mac prefix");
  if (expiration) {
    if (!/^\d+$/.test(expiration))
      throw new Error("Invalid expiration");
    const exp = Number.parseInt(expiration, 10);
    if (exp <= now - opts.timestampSkewSec * 1e3)
      throw new Error("Expired seal");
  }
  let pass = "";
  passwordId = passwordId || "default";
  if (typeof password === "string" || password instanceof Uint8Array)
    pass = password;
  else if (passwordId in password) {
    pass = password[passwordId];
  } else {
    throw new Error(`Cannot find password: ${passwordId}`);
  }
  pass = normalizePassword(pass);
  const macOptions = opts.integrity;
  macOptions.salt = hmacSalt;
  const mac = await hmacWithPassword(_crypto, pass.integrity, macOptions, macBaseString);
  if (!fixedTimeComparison(mac.digest, hmac))
    throw new Error("Bad hmac value");
  const encrypted = base64urlDecode(encryptedB64);
  const decryptOptions = opts.encryption;
  decryptOptions.salt = encryptionSalt;
  decryptOptions.iv = base64urlDecode(encryptionIv);
  const decrypted = await decrypt(_crypto, pass.encryption, decryptOptions, encrypted);
  if (decrypted)
    return JSON.parse(decrypted);
  return null;
};

function o$1(n){throw new Error(`${n} is not implemented yet!`)}let i$2 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o$1("Readable.asyncIterator")}iterator(e){throw o$1("Readable.iterator")}map(e,t){throw o$1("Readable.map")}filter(e,t){throw o$1("Readable.filter")}forEach(e,t){throw o$1("Readable.forEach")}reduce(e,t,r){throw o$1("Readable.reduce")}find(e,t){throw o$1("Readable.find")}findIndex(e,t){throw o$1("Readable.findIndex")}some(e,t){throw o$1("Readable.some")}toArray(e){throw o$1("Readable.toArray")}every(e,t){throw o$1("Readable.every")}flatMap(e,t){throw o$1("Readable.flatMap")}drop(e,t){throw o$1("Readable.drop")}take(e,t){throw o$1("Readable.take")}asIndexedPairs(e){throw o$1("Readable.asIndexedPairs")}};let l$2 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$2=class c{allowHalfOpen=true;_destroy;constructor(e=new i$2,t=new l$2){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _$1(){return Object.assign(c$2.prototype,i$2.prototype),Object.assign(c$2.prototype,l$2.prototype),c$2}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_$1();let A$1 = class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};class y extends i$2{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$1;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$2{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$1(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$1=new Set([101,204,205,304]);async function b$1(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$1(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$1.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$1(n,e,t={}){try{const r=await b$1(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function useBase(base, handler) {
  base = withoutTrailingSlash(base);
  if (!base || base === "/") {
    return handler;
  }
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _path = event._path || event.node.req.url || "/";
    event._path = withoutBase(event.path || "/", base);
    event.node.req.url = event._path;
    try {
      return await handler(event);
    } finally {
      event._path = event.node.req.url = _path;
    }
  });
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function parse(multipartBodyBuffer, boundary) {
  let lastline = "";
  let state = 0 /* INIT */;
  let buffer = [];
  const allParts = [];
  let currentPartHeaders = [];
  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
    const currByte = multipartBodyBuffer[i];
    const newLineChar = currByte === 10 || currByte === 13;
    if (!newLineChar) {
      lastline += String.fromCodePoint(currByte);
    }
    const newLineDetected = currByte === 10 && prevByte === 13;
    if (0 /* INIT */ === state && newLineDetected) {
      if ("--" + boundary === lastline) {
        state = 1 /* READING_HEADERS */;
      }
      lastline = "";
    } else if (1 /* READING_HEADERS */ === state && newLineDetected) {
      if (lastline.length > 0) {
        const i2 = lastline.indexOf(":");
        if (i2 > 0) {
          const name = lastline.slice(0, i2).toLowerCase();
          const value = lastline.slice(i2 + 1).trim();
          currentPartHeaders.push([name, value]);
        }
      } else {
        state = 2 /* READING_DATA */;
        buffer = [];
      }
      lastline = "";
    } else if (2 /* READING_DATA */ === state) {
      if (lastline.length > boundary.length + 4) {
        lastline = "";
      }
      if ("--" + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);
        allParts.push(process$1(part, currentPartHeaders));
        buffer = [];
        currentPartHeaders = [];
        lastline = "";
        state = 3 /* READING_PART_SEPARATOR */;
      } else {
        buffer.push(currByte);
      }
      if (newLineDetected) {
        lastline = "";
      }
    } else if (3 /* READING_PART_SEPARATOR */ === state && newLineDetected) {
      state = 1 /* READING_HEADERS */;
    }
  }
  return allParts;
}
function process$1(data, headers) {
  const dataObj = {};
  const contentDispositionHeader = headers.find((h) => h[0] === "content-disposition")?.[1] || "";
  for (const i of contentDispositionHeader.split(";")) {
    const s = i.split("=");
    if (s.length !== 2) {
      continue;
    }
    const key = (s[0] || "").trim();
    if (key === "name" || key === "filename") {
      const _value = (s[1] || "").trim().replace(/"/g, "");
      dataObj[key] = Buffer.from(_value, "latin1").toString("utf8");
    }
  }
  const contentType = headers.find((h) => h[0] === "content-type")?.[1] || "";
  if (contentType) {
    dataObj.type = contentType;
  }
  dataObj.data = Buffer.from(data);
  return dataObj;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$1(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
async function readMultipartFormData(event) {
  const contentType = getRequestHeader(event, "content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return;
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
    return;
  }
  const body = await readRawBody(event, false);
  if (!body) {
    return;
  }
  return parse(body, boundary);
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

const getSessionPromise = Symbol("getSession");
const DEFAULT_NAME = "h3";
const DEFAULT_COOKIE = {
  path: "/",
  secure: true,
  httpOnly: true
};
async function useSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  await getSession(event, config);
  const sessionManager = {
    get id() {
      return event.context.sessions?.[sessionName]?.id;
    },
    get data() {
      return event.context.sessions?.[sessionName]?.data || {};
    },
    update: async (update) => {
      if (!isEvent(event)) {
        throw new Error("[h3] Cannot update read-only session.");
      }
      await updateSession(event, config, update);
      return sessionManager;
    },
    clear: () => {
      if (!isEvent(event)) {
        throw new Error("[h3] Cannot clear read-only session.");
      }
      clearSession(event, config);
      return Promise.resolve(sessionManager);
    }
  };
  return sessionManager;
}
async function getSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  if (!event.context.sessions) {
    event.context.sessions = /* @__PURE__ */ Object.create(null);
  }
  const existingSession = event.context.sessions[sessionName];
  if (existingSession) {
    return existingSession[getSessionPromise] || existingSession;
  }
  const session = {
    id: "",
    createdAt: 0,
    data: /* @__PURE__ */ Object.create(null)
  };
  event.context.sessions[sessionName] = session;
  let sealedSession;
  if (config.sessionHeader !== false) {
    const headerName = typeof config.sessionHeader === "string" ? config.sessionHeader.toLowerCase() : `x-${sessionName.toLowerCase()}-session`;
    const headerValue = _getReqHeader(event, headerName);
    if (typeof headerValue === "string") {
      sealedSession = headerValue;
    }
  }
  if (!sealedSession) {
    const cookieHeader = _getReqHeader(event, "cookie");
    if (cookieHeader) {
      sealedSession = parse$1(cookieHeader + "")[sessionName];
    }
  }
  if (sealedSession) {
    const promise = unsealSession(event, config, sealedSession).catch(() => {
    }).then((unsealed) => {
      Object.assign(session, unsealed);
      delete event.context.sessions[sessionName][getSessionPromise];
      return session;
    });
    event.context.sessions[sessionName][getSessionPromise] = promise;
    await promise;
  }
  if (!session.id) {
    if (!isEvent(event)) {
      throw new Error(
        "Cannot initialize a new session. Make sure using `useSession(event)` in main handler."
      );
    }
    session.id = config.generateId?.() ?? (config.crypto || _crypto).randomUUID();
    session.createdAt = Date.now();
    await updateSession(event, config);
  }
  return session;
}
function _getReqHeader(event, name) {
  if (event.node) {
    return event.node?.req.headers[name];
  }
  if (event.request) {
    return event.request.headers?.get(name);
  }
  if (event.headers) {
    return event.headers.get(name);
  }
}
async function updateSession(event, config, update) {
  const sessionName = config.name || DEFAULT_NAME;
  const session = event.context.sessions?.[sessionName] || await getSession(event, config);
  if (typeof update === "function") {
    update = update(session.data);
  }
  if (update) {
    Object.assign(session.data, update);
  }
  if (config.cookie !== false) {
    const sealed = await sealSession(event, config);
    setCookie(event, sessionName, sealed, {
      ...DEFAULT_COOKIE,
      expires: config.maxAge ? new Date(session.createdAt + config.maxAge * 1e3) : void 0,
      ...config.cookie
    });
  }
  return session;
}
async function sealSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  const session = event.context.sessions?.[sessionName] || await getSession(event, config);
  const sealed = await seal(
    config.crypto || _crypto,
    session,
    config.password,
    {
      ...defaults,
      ttl: config.maxAge ? config.maxAge * 1e3 : 0,
      ...config.seal
    }
  );
  return sealed;
}
async function unsealSession(_event, config, sealed) {
  const unsealed = await unseal(
    config.crypto || _crypto,
    sealed,
    config.password,
    {
      ...defaults,
      ttl: config.maxAge ? config.maxAge * 1e3 : 0,
      ...config.seal
    }
  );
  if (config.maxAge) {
    const age = Date.now() - (unsealed.createdAt || Number.NEGATIVE_INFINITY);
    if (age > config.maxAge * 1e3) {
      throw new Error("Session expired!");
    }
  }
  return unsealed;
}
function clearSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  if (event.context.sessions?.[sessionName]) {
    delete event.context.sessions[sessionName];
  }
  setCookie(event, sessionName, "", {
    ...DEFAULT_COOKIE,
    ...config.cookie
  });
  return Promise.resolve();
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i$1=globalThis.AbortController,l$1=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$1;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$1(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController$1 = globalThis.AbortController || i$1;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController: AbortController$1 });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive$1(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive$1(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$2(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c$1().serialize(o)}const c$1=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r$1="sha256",s="base64url";function digest(t){if(e)return e(r$1,t,s);const o=createHash(r$1).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {},
  "ui": {
    "colors": {
      "primary": "green",
      "secondary": "blue",
      "success": "green",
      "info": "blue",
      "warning": "yellow",
      "error": "red",
      "neutral": "slate"
    },
    "icons": {
      "arrowDown": "i-lucide-arrow-down",
      "arrowLeft": "i-lucide-arrow-left",
      "arrowRight": "i-lucide-arrow-right",
      "arrowUp": "i-lucide-arrow-up",
      "caution": "i-lucide-circle-alert",
      "check": "i-lucide-check",
      "chevronDoubleLeft": "i-lucide-chevrons-left",
      "chevronDoubleRight": "i-lucide-chevrons-right",
      "chevronDown": "i-lucide-chevron-down",
      "chevronLeft": "i-lucide-chevron-left",
      "chevronRight": "i-lucide-chevron-right",
      "chevronUp": "i-lucide-chevron-up",
      "close": "i-lucide-x",
      "copy": "i-lucide-copy",
      "copyCheck": "i-lucide-copy-check",
      "dark": "i-lucide-moon",
      "drag": "i-lucide-grip-vertical",
      "ellipsis": "i-lucide-ellipsis",
      "error": "i-lucide-circle-x",
      "external": "i-lucide-arrow-up-right",
      "eye": "i-lucide-eye",
      "eyeOff": "i-lucide-eye-off",
      "file": "i-lucide-file",
      "folder": "i-lucide-folder",
      "folderOpen": "i-lucide-folder-open",
      "hash": "i-lucide-hash",
      "info": "i-lucide-info",
      "light": "i-lucide-sun",
      "loading": "i-lucide-loader-circle",
      "menu": "i-lucide-menu",
      "minus": "i-lucide-minus",
      "panelClose": "i-lucide-panel-left-close",
      "panelOpen": "i-lucide-panel-left-open",
      "plus": "i-lucide-plus",
      "reload": "i-lucide-rotate-ccw",
      "search": "i-lucide-search",
      "stop": "i-lucide-square",
      "success": "i-lucide-circle-check",
      "system": "i-lucide-monitor",
      "tip": "i-lucide-lightbulb",
      "upload": "i-lucide-upload",
      "warning": "i-lucide-triangle-alert"
    },
    "tv": {
      "twMergeConfig": {}
    }
  },
  "icon": {
    "provider": "server",
    "class": "",
    "aliases": {},
    "iconifyApiEndpoint": "https://api.iconify.design",
    "localApiEndpoint": "/api/_nuxt_icon",
    "fallbackToApi": true,
    "cssSelectorPrefix": "i-",
    "cssWherePseudo": true,
    "cssLayer": "components",
    "mode": "css",
    "attrs": {
      "aria-hidden": true
    },
    "collections": [
      "academicons",
      "akar-icons",
      "ant-design",
      "arcticons",
      "basil",
      "bi",
      "bitcoin-icons",
      "bpmn",
      "brandico",
      "bx",
      "bxl",
      "bxs",
      "bytesize",
      "carbon",
      "catppuccin",
      "cbi",
      "charm",
      "ci",
      "cib",
      "cif",
      "cil",
      "circle-flags",
      "circum",
      "clarity",
      "codex",
      "codicon",
      "covid",
      "cryptocurrency",
      "cryptocurrency-color",
      "cuida",
      "dashicons",
      "devicon",
      "devicon-plain",
      "dinkie-icons",
      "duo-icons",
      "ei",
      "el",
      "emojione",
      "emojione-monotone",
      "emojione-v1",
      "entypo",
      "entypo-social",
      "eos-icons",
      "ep",
      "et",
      "eva",
      "f7",
      "fa",
      "fa-brands",
      "fa-regular",
      "fa-solid",
      "fa6-brands",
      "fa6-regular",
      "fa6-solid",
      "fa7-brands",
      "fa7-regular",
      "fa7-solid",
      "fad",
      "famicons",
      "fe",
      "feather",
      "file-icons",
      "flag",
      "flagpack",
      "flat-color-icons",
      "flat-ui",
      "flowbite",
      "fluent",
      "fluent-color",
      "fluent-emoji",
      "fluent-emoji-flat",
      "fluent-emoji-high-contrast",
      "fluent-mdl2",
      "fontelico",
      "fontisto",
      "formkit",
      "foundation",
      "fxemoji",
      "gala",
      "game-icons",
      "garden",
      "geo",
      "gg",
      "gis",
      "gravity-ui",
      "gridicons",
      "grommet-icons",
      "guidance",
      "healthicons",
      "heroicons",
      "heroicons-outline",
      "heroicons-solid",
      "hugeicons",
      "humbleicons",
      "ic",
      "icomoon-free",
      "icon-park",
      "icon-park-outline",
      "icon-park-solid",
      "icon-park-twotone",
      "iconamoon",
      "iconoir",
      "icons8",
      "il",
      "ion",
      "iwwa",
      "ix",
      "jam",
      "la",
      "lets-icons",
      "line-md",
      "lineicons",
      "logos",
      "ls",
      "lsicon",
      "lucide",
      "lucide-lab",
      "mage",
      "majesticons",
      "maki",
      "map",
      "marketeq",
      "material-icon-theme",
      "material-symbols",
      "material-symbols-light",
      "mdi",
      "mdi-light",
      "medical-icon",
      "memory",
      "meteocons",
      "meteor-icons",
      "mi",
      "mingcute",
      "mono-icons",
      "mynaui",
      "nimbus",
      "nonicons",
      "noto",
      "noto-v1",
      "nrk",
      "octicon",
      "oi",
      "ooui",
      "openmoji",
      "oui",
      "pajamas",
      "pepicons",
      "pepicons-pencil",
      "pepicons-pop",
      "pepicons-print",
      "ph",
      "picon",
      "pixel",
      "pixelarticons",
      "prime",
      "proicons",
      "ps",
      "qlementine-icons",
      "quill",
      "radix-icons",
      "raphael",
      "ri",
      "rivet-icons",
      "roentgen",
      "si",
      "si-glyph",
      "sidekickicons",
      "simple-icons",
      "simple-line-icons",
      "skill-icons",
      "solar",
      "stash",
      "streamline",
      "streamline-block",
      "streamline-color",
      "streamline-cyber",
      "streamline-cyber-color",
      "streamline-emojis",
      "streamline-flex",
      "streamline-flex-color",
      "streamline-freehand",
      "streamline-freehand-color",
      "streamline-kameleon-color",
      "streamline-logos",
      "streamline-pixel",
      "streamline-plump",
      "streamline-plump-color",
      "streamline-sharp",
      "streamline-sharp-color",
      "streamline-stickies-color",
      "streamline-ultimate",
      "streamline-ultimate-color",
      "subway",
      "svg-spinners",
      "system-uicons",
      "tabler",
      "tdesign",
      "teenyicons",
      "temaki",
      "token",
      "token-branded",
      "topcoat",
      "twemoji",
      "typcn",
      "uil",
      "uim",
      "uis",
      "uit",
      "uiw",
      "unjs",
      "vaadin",
      "vs",
      "vscode-icons",
      "websymbol",
      "weui",
      "whh",
      "wi",
      "wpf",
      "zmdi",
      "zondicons"
    ],
    "fetchTimeout": 1500
  }
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "03e3d530-f880-4e95-a4eb-7eb1e06d914a",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/**": {
        "headers": {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://www.facebook.com; frame-src https://www.facebook.com; connect-src 'self' https://*.facebook.com https://*.facebook.net"
        }
      },
      "/": {
        "prerender": true
      },
      "/about": {
        "prerender": true
      },
      "/privacy": {
        "prerender": true
      },
      "/contact": {
        "prerender": true
      },
      "/api/**": {
        "headers": {
          "Cache-Control": "private, no-store"
        }
      },
      "/admin/**": {
        "ssr": false
      },
      "/api/bottle/public": {
        "swr": 300,
        "cache": {
          "swr": true,
          "maxAge": 300
        }
      },
      "/api/cocktail/public": {
        "swr": 300,
        "cache": {
          "swr": true,
          "maxAge": 300
        }
      },
      "/api/event/upcoming": {
        "swr": 60,
        "cache": {
          "swr": true,
          "maxAge": 60
        }
      },
      "/__sitemap__/style.xsl": {
        "headers": {
          "Content-Type": "application/xslt+xml"
        }
      },
      "/sitemap.xml": {},
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_fonts/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/api/bottle/public/_payload.json": {
        "cache": {
          "swr": true,
          "maxAge": 300
        }
      },
      "/api/cocktail/public/_payload.json": {
        "cache": {
          "swr": true,
          "maxAge": 300
        }
      },
      "/api/event/upcoming/_payload.json": {
        "cache": {
          "swr": true,
          "maxAge": 60
        }
      }
    }
  },
  "public": {
    "squareLocationId": "",
    "metapixel": {
      "default": {
        "id": "1254208522870414"
      }
    },
    "wsUrl": ""
  },
  "sessionSecret": "",
  "domain": "",
  "squareAccessToken": "",
  "squareWebhookSignatureKey": "",
  "squareEnvironment": "sandbox",
  "cloudinaryCloudName": "",
  "cloudinaryApiKey": "",
  "cloudinaryApiSecret": "",
  "icon": {
    "serverKnownCssClasses": []
  },
  "mongoose": {
    "uri": "mongodb+srv://Timothy:EricAvis1989@galvestondistillingco.pjkvjym.mongodb.net/",
    "options": {
      "maxPoolSize": 10,
      "serverSelectionTimeoutMS": 5000
    },
    "devtools": false,
    "modelsDir": "/home/timothy/Coding/GDC/server/models"
  },
  "sitemap": {
    "isI18nMapped": false,
    "sitemapName": "sitemap.xml",
    "isMultiSitemap": false,
    "excludeAppSources": [],
    "cacheMaxAgeSeconds": 600,
    "autoLastmod": false,
    "defaultSitemapsChunkSize": 1000,
    "minify": false,
    "sortEntries": true,
    "debug": false,
    "discoverImages": true,
    "discoverVideos": true,
    "sitemapsPathPrefix": "/__sitemap__/",
    "isNuxtContentDocumentDriven": false,
    "xsl": "/__sitemap__/style.xsl",
    "xslTips": true,
    "xslColumns": [
      {
        "label": "URL",
        "width": "50%"
      },
      {
        "label": "Images",
        "width": "25%",
        "select": "count(image:image)"
      },
      {
        "label": "Last Updated",
        "width": "25%",
        "select": "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"
      }
    ],
    "credits": true,
    "version": "7.6.0",
    "sitemaps": {
      "sitemap.xml": {
        "sitemapName": "sitemap.xml",
        "route": "sitemap.xml",
        "defaults": {},
        "include": [],
        "exclude": [
          "/admin/**",
          "/login",
          "/return",
          "/_**",
          "/_nuxt/**"
        ],
        "includeAppSources": true
      }
    }
  },
  "nuxt-site-config": {
    "stack": [
      {
        "_context": "system",
        "_priority": -15,
        "name": "GDC",
        "env": "production"
      },
      {
        "_context": "package.json",
        "_priority": -10,
        "name": "gdc"
      },
      {
        "_priority": -3,
        "_context": "nuxt-site-config:config",
        "url": "https://galvestondistilling.com"
      }
    ],
    "version": "3.2.20",
    "debug": false,
    "multiTenancy": []
  },
  "ipx": {
    "baseURL": "/_ipx",
    "alias": {},
    "fs": {
      "dir": "../public"
    },
    "http": {
      "domains": []
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
const _sharedAppConfig = _deepFreeze(klona(appConfig));
function useAppConfig(event) {
  {
    return _sharedAppConfig;
  }
}
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

/**
* Nitro internal functions extracted from https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/utils.ts
*/
function isJsonRequest(event) {
	// If the client specifically requests HTML, then avoid classifying as JSON.
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		// let Nitro handle JSON errors
		return;
	}
	// invoke default Nitro error handler (which will log appropriately if required)
	const defaultRes = await defaultHandler(error, event, { json: true });
	// let Nitro handle redirect if appropriate
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	// remove proto/hostname/port from URL
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	// add default server message (keep sanitized for unhandled errors)
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	// we will be rendering this error internally so we can pass along the error.data safely
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	// Access request headers
	const reqHeaders = getRequestHeaders(event);
	// Detect to avoid recursion in SSR rendering of errors
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
	// HTML response (via SSR)
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	// Fallback to static rendered error page
	if (!res) {
		const { template } = await import('../_/error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

function defineNitroPlugin$1(def) {
  return def;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const r=Object.create(null),i=e=>globalThis.process?.env||globalThis._importMeta_.env||globalThis.Deno?.env.toObject()||globalThis.__env__||(e?r:globalThis),o=new Proxy(r,{get(e,s){return i()[s]??r[s]},has(e,s){const E=i();return s in E||s in r},set(e,s,E){const B=i(true);return B[s]=E,true},deleteProperty(e,s){if(!s)return  false;const E=i(true);return delete E[s],true},ownKeys(){const e=i(true);return Object.keys(e)}}),t=typeof process<"u"&&process.env&&"production"||"",f=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:true}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:true}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:true}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:false}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:false}],["VERCEL","VERCEL_ENV",{ci:false}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:false}],["CODESANDBOX","CODESANDBOX_HOST",{ci:false}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:true}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:true}]];function b(){if(globalThis.process?.env)for(const e of f){const s=e[1]||e[0];if(globalThis.process?.env[s])return {name:e[0].toLowerCase(),...e[2]}}return globalThis.process?.env?.SHELL==="/bin/jsh"&&globalThis.process?.versions?.webcontainer?{name:"stackblitz",ci:false}:{name:"",ci:false}}const l=b();l.name;function n(e){return e?e!=="false":false}const I=globalThis.process?.platform||"",T=n(o.CI)||l.ci!==false,R=n(globalThis.process?.stdout&&globalThis.process?.stdout.isTTY);n(o.DEBUG);const a=t==="test"||n(o.TEST),h=t==="dev"||t==="development";n(o.MINIMAL)||T||a||!R;const A=/^win/i.test(I);!n(o.NO_COLOR)&&(n(o.FORCE_COLOR)||(R||A)&&o.TERM!=="dumb"||T);const C=(globalThis.process?.versions?.node||"").replace(/^v/,"")||null;Number(C?.split(".")[0])||null;const W=globalThis.process||Object.create(null),_={versions:{}};new Proxy(W,{get(e,s){if(s==="env")return o;if(s in e)return e[s];if(s in _)return _[s]}});const O=globalThis.process?.release?.name==="node",c=!!globalThis.Bun||!!globalThis.process?.versions?.bun,D=!!globalThis.Deno,L=!!globalThis.fastly,S=!!globalThis.Netlify,u=!!globalThis.EdgeRuntime,N=globalThis.navigator?.userAgent==="Cloudflare-Workers",F=[[S,"netlify"],[u,"edge-light"],[N,"workerd"],[L,"fastly"],[D,"deno"],[c,"bun"],[O,"node"]];function G(){const e=F.find(s=>s[0]);if(e)return {name:e[1]}}const P=G();P?.name||"";

function baseURL() {
	// TODO: support passing event to `useRuntimeConfig`
	return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
	// TODO: support passing event to `useRuntimeConfig`
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	// TODO: support passing event to `useRuntimeConfig`
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const { Schema: Schema$a } = mongoose;
const vesselRef = { type: Schema$a.Types.ObjectId, ref: "Vessel" };
const volumeFields = { volume: Number, volumeUnit: String, abv: Number };
const volumeFieldsWithPG = { ...volumeFields, proofGallons: Number };
const stageBase = {
  startedAt: Date,
  completedAt: Date,
  vessel: vesselRef,
  notes: String
};
const cutSchema = {
  vessel: String,
  volume: Number,
  volumeUnit: String,
  abv: Number,
  disposed: Boolean
};
const Batch = defineMongooseModel({
  name: "Batch",
  schema: {
    recipe: {
      type: Schema$a.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true
    },
    batchNumber: String,
    pipeline: {
      type: [String],
      required: true
    },
    currentStage: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true
    },
    batchSize: {
      type: Number,
      required: true
    },
    batchSizeUnit: {
      type: String,
      required: true
    },
    recipeCost: {
      type: Number,
      required: true
    },
    batchCost: Number,
    barrelCost: Number,
    notes: String,
    // --- Stage data ---
    stages: {
      mashing: {
        ...stageBase,
        strikeWaterVolume: Number,
        strikeWaterVolumeUnit: String,
        strikeWaterTemp: Number,
        strikeWaterTempUnit: String,
        mashTemp: Number,
        mashTempUnit: String,
        mashDuration: Number,
        pH: Number,
        preBoilGravity: Number,
        postBoilGravity: Number,
        ingredientsWithdrawn: Boolean
      },
      fermenting: {
        ...stageBase,
        yeastStrain: String,
        pitchTemp: Number,
        pitchTempUnit: String,
        readings: [{
          date: Date,
          temperature: Number,
          temperatureUnit: String,
          gravity: Number,
          pH: Number,
          notes: String
        }],
        originalGravity: Number,
        finalGravity: Number,
        estimatedAbv: Number,
        washVolume: Number,
        washVolumeUnit: String
      },
      distilling: {
        ...stageBase,
        runs: [{
          runNumber: Number,
          runType: { type: String, enum: ["stripping", "spirit"] },
          date: Date,
          chargeVolume: Number,
          chargeVolumeUnit: String,
          chargeAbv: Number,
          chargeSourceVessel: String,
          chargeSourceVessels: [String],
          additions: [{
            label: String,
            sourceVessel: String,
            volume: Number,
            volumeUnit: String,
            abv: Number
          }],
          output: {
            vessel: String,
            volume: Number,
            volumeUnit: String,
            abv: Number,
            proofGallons: Number
          },
          collected: {
            foreshots: cutSchema,
            heads: cutSchema,
            lateHeads: cutSchema,
            hearts: cutSchema,
            tails: cutSchema
          },
          total: volumeFieldsWithPG,
          notes: String
        }],
        // Legacy fields preserved for existing documents
        runType: { type: String, enum: ["stripping", "spirit", "single"] },
        runNumber: Number,
        chargeVolume: Number,
        chargeVolumeUnit: String,
        chargeAbv: Number,
        additions: {
          tails: volumeFields,
          feints: volumeFields
        },
        collected: {
          foreshots: cutSchema,
          heads: cutSchema,
          lateHeads: cutSchema,
          hearts: cutSchema,
          tails: cutSchema,
          total: volumeFieldsWithPG
        }
      },
      maceration: {
        ...stageBase,
        baseSpirit: {
          source: String,
          ...volumeFields
        },
        botanicals: [{
          item: { type: Schema$a.Types.ObjectId, ref: "Item" },
          name: String,
          weight: Number,
          weightUnit: String
        }],
        method: { type: String, enum: ["direct", "vapor basket", "both"] },
        startDate: Date,
        endDate: Date,
        temperature: Number,
        temperatureUnit: String,
        duration: Number
      },
      filtering: {
        ...stageBase,
        method: String,
        preVolume: Number,
        preVolumeUnit: String,
        preAbv: Number,
        postVolume: Number,
        postVolumeUnit: String,
        postAbv: Number,
        filterMedia: String,
        passes: Number
      },
      barrelAging: {
        ...stageBase,
        barrelType: String,
        barrelSize: String,
        charLevel: String,
        previousUse: String,
        warehouseLocation: String,
        entry: {
          date: Date,
          ...volumeFieldsWithPG
        },
        exit: {
          date: Date,
          ...volumeFieldsWithPG
        },
        samplings: [{
          date: Date,
          abv: Number,
          volume: Number,
          volumeUnit: String,
          notes: String
        }],
        targetAge: Number
      },
      storage: {
        ...stageBase,
        ...volumeFieldsWithPG
      },
      blending: {
        ...stageBase,
        components: [{
          source: String,
          ...volumeFields
        }],
        resultVolume: Number,
        resultVolumeUnit: String,
        resultAbv: Number
      },
      proofing: {
        ...stageBase,
        startAbv: Number,
        targetAbv: Number,
        startVolume: Number,
        startVolumeUnit: String,
        waterAdded: Number,
        waterAddedUnit: String,
        finalVolume: Number,
        finalVolumeUnit: String,
        finalAbv: Number,
        finalProofGallons: Number,
        waterSource: String
      },
      bottled: {
        ...stageBase,
        productionRecord: {
          type: Schema$a.Types.ObjectId,
          ref: "Production"
        },
        bottleCount: Number,
        bottleSize: String,
        lotNumber: String,
        labeledAbv: Number
      }
    },
    // --- Tasting notes ---
    tastingNotes: [{
      date: { type: Date, default: Date.now },
      abv: Number,
      notes: String,
      addedBy: String
    }],
    // --- Volume tracking across stages ---
    stageVolumes: {
      type: Map,
      of: Number,
      default: {}
    },
    // --- Transfer log ---
    transferLog: [{
      from: String,
      to: String,
      volume: Number,
      volumeUnit: String,
      date: { type: Date, default: Date.now },
      vessel: String,
      user: String
    }],
    // --- Activity log ---
    log: [{
      date: { type: Date, default: Date.now },
      action: String,
      user: String,
      details: String
    }]
  },
  options: { timestamps: true }
});

const { Schema: Schema$9 } = mongoose;
const Bottle = defineMongooseModel({
  name: "Bottle",
  schema: {
    name: {
      type: String,
      required: true,
      index: true
    },
    class: {
      type: String,
      required: false,
      index: true
    },
    type: {
      type: String,
      required: false,
      index: true
    },
    abv: {
      type: Number,
      required: false
    },
    price: {
      type: Number,
      required: false
    },
    volume: {
      type: Number,
      required: false
    },
    volumeUnit: {
      type: String,
      required: false
    },
    img: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    recipe: {
      type: Schema$9.Types.ObjectId,
      ref: "Recipe",
      required: false
    },
    inStock: {
      type: Boolean,
      required: false
    },
    archived: {
      type: Boolean,
      required: false,
      default: false,
      index: true
    }
  },
  options: { timestamps: true }
});

const { Schema: Schema$8 } = mongoose;
const depositSchema = {
  batch: { type: Schema$8.Types.ObjectId, ref: "Batch", required: true },
  date: { type: Date, required: true },
  volume: { type: Number, required: true },
  volumeUnit: { type: String, required: true },
  abv: { type: Number, required: true },
  proofGallons: { type: Number, required: true },
  value: { type: Number, required: true },
  costPerProofGallon: { type: Number, required: true }
};
const withdrawalSchema = {
  batch: { type: Schema$8.Types.ObjectId, ref: "Batch" },
  date: { type: Date, required: true },
  volume: { type: Number, required: true },
  volumeUnit: { type: String, required: true },
  abv: { type: Number, required: true },
  proofGallons: { type: Number, required: true },
  value: { type: Number, required: true },
  costPerProofGallon: { type: Number, required: true }
};
const BulkSpirit = defineMongooseModel({
  name: "BulkSpirit",
  schema: {
    name: { type: String, required: true, index: true },
    spiritClass: { type: String, required: true, index: true },
    vessel: { type: Schema$8.Types.ObjectId, ref: "Vessel", index: true },
    volume: { type: Number, required: false },
    volumeUnit: { type: String, required: false },
    abv: { type: Number, required: false },
    proofGallons: { type: Number, required: false },
    costPerProofGallon: { type: Number, required: false },
    totalValue: { type: Number, required: false },
    deposits: [depositSchema],
    withdrawals: [withdrawalSchema],
    status: { type: String, required: false, index: true },
    notes: { type: String }
  },
  options: { timestamps: true }
});

const { Schema: Schema$7 } = mongoose;
const Cocktail = defineMongooseModel({
  name: "Cocktail",
  schema: {
    name: {
      type: String,
      required: true
    },
    glassware: {
      type: String,
      required: true
    },
    ingredients: [
      {
        item: {
          type: Schema$7.Types.ObjectId,
          required: true
        },
        amount: {
          type: Number,
          required: true
        },
        unit: {
          type: String,
          required: true
        },
        sourceType: {
          type: String,
          enum: ["item", "bottle"],
          default: "item"
        }
      }
    ],
    cost: {
      type: Number,
      required: false
    },
    price: {
      type: Number,
      required: true
    },
    menu: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    directions: {
      type: String,
      required: true
    },
    preparation: {
      type: String,
      required: false,
      trim: true
    },
    visible: {
      type: Boolean,
      required: true,
      index: true
    },
    img: {
      type: String,
      required: false
    }
  },
  options: { timestamps: true }
});

const Contact = defineMongooseModel({
  name: "Contact",
  schema: {
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: String,
      required: false
    },
    businessName: {
      type: String,
      required: false
    },
    type: {
      type: String,
      required: false,
      index: true
    },
    website: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
      required: false
    },
    notes: {
      type: String,
      required: false
    },
    newsletter: {
      type: Boolean,
      default: false,
      index: true
    },
    city: {
      type: String,
      required: false
    },
    state: {
      type: String,
      required: false
    },
    zip: {
      type: String,
      required: false
    }
  },
  options: { timestamps: true }
});

const { Schema: Schema$6 } = mongoose;
const EquipmentLog = defineMongooseModel({
  name: "EquipmentLog",
  schema: {
    equipment: { type: String, required: true },
    action: { type: String, required: true },
    value: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true },
    batch: { type: Schema$6.Types.ObjectId, ref: "Batch" }
  },
  options: {
    timestamps: true
  }
});

const Event = defineMongooseModel({
  name: "Event",
  schema: {
    date: {
      type: Date,
      required: true,
      index: true
    },
    groupSize: {
      type: Number,
      required: false,
      default: 0
    },
    contact: {
      type: Schema$b.Types.ObjectId,
      ref: "Contact",
      required: false,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ["Cocktail Class", "Private Class", "Private Event", "Tasting"],
      index: true
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      index: true
    },
    notes: {
      type: String,
      required: false
    },
    capacity: {
      type: Number,
      required: false
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    price: {
      type: Number,
      required: false,
      min: 0
    },
    addOns: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      description: { type: String }
    }],
    bookings: [{
      contact: { type: Schema$b.Types.ObjectId, ref: "Contact", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      amount: { type: Number, required: true, min: 0 },
      orderId: { type: String, required: true },
      bookedAt: { type: Date, default: Date.now }
    }],
    processedOrders: [{
      type: String
    }]
  },
  options: { timestamps: true }
});

const { Schema: Schema$5 } = mongoose;
const Inventory = defineMongooseModel({
  name: "Inventory",
  schema: {
    date: {
      type: Date,
      required: true
    },
    item: {
      type: Schema$5.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true
    },
    location: {
      type: Schema$5.Types.ObjectId,
      ref: "Vessel",
      required: false
    },
    quantity: {
      type: Number,
      required: true
    },
    unitSize: {
      type: Number,
      required: false
    },
    unitSizeUnit: {
      type: String,
      required: false
    }
  },
  options: {
    timestamps: true,
    autoIndex: true
  },
  hooks(schema) {
    schema.index({ item: 1, date: -1 });
    schema.index({ date: -1 });
  }
});

const { Schema: Schema$4 } = mongoose;
const Item = defineMongooseModel({
  name: "Item",
  schema: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      index: true
    },
    inventoryUnit: {
      type: String
    },
    purchaseHistory: [
      {
        type: Schema$4.Types.ObjectId,
        ref: "PurchaseOrder"
      }
    ],
    inventoryHistory: [
      {
        type: Schema$4.Types.ObjectId,
        ref: "Inventory"
      }
    ],
    category: {
      type: String,
      default: "Other",
      index: true
    },
    trackInventory: {
      type: Boolean,
      default: true
    },
    unitSize: {
      type: Number
    },
    unitLabel: {
      type: String,
      trim: true
    },
    minStock: {
      type: Number,
      default: 0
    },
    reorderPoint: {
      type: Number,
      default: 0
    },
    usePerMonth: {
      type: Number,
      default: 0
    },
    baseCostPrice: {
      type: Number
    },
    baseCostSize: {
      type: Number
    },
    baseCostUnit: {
      type: String
    },
    notes: {
      type: String,
      trim: true
    }
  },
  options: { timestamps: true }
});

const Message = defineMongooseModel({
  name: "Message",
  schema: {
    contact: {
      type: Schema$b.Types.ObjectId,
      ref: "Contact",
      required: false,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  options: { timestamps: true }
});

const { Schema: Schema$3 } = mongoose;
const Production = defineMongooseModel({
  name: "Production",
  schema: {
    date: {
      type: Date,
      required: true,
      index: true
    },
    vessel: [
      {
        type: Schema$3.Types.ObjectId,
        ref: "Vessel"
      }
    ],
    bottle: {
      type: Schema$3.Types.ObjectId,
      ref: "Bottle",
      required: true,
      index: true
    },
    bottling: {
      glassware: {
        type: Schema$3.Types.ObjectId,
        ref: "Item"
      },
      cap: {
        type: Schema$3.Types.ObjectId,
        ref: "Item"
      },
      label: {
        type: Schema$3.Types.ObjectId,
        ref: "Item"
      }
    },
    quantity: {
      type: Number,
      required: true
    },
    costs: {
      batch: { type: Number, default: 0, min: 0 },
      barrel: { type: Number, default: 0, min: 0 },
      bottling: { type: Number, default: 0, min: 0 },
      labor: { type: Number, default: 0, min: 0 },
      ttbTax: { type: Number, default: 0, min: 0 },
      tabcTax: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    productionCost: {
      type: Number,
      required: true,
      min: 0
    },
    bottleCost: {
      type: Number,
      required: true,
      min: 0
    }
  },
  options: { timestamps: true, autoIndex: true },
  hooks(schema) {
    schema.index({ bottle: 1, date: -1 });
  }
});

const { Schema: Schema$2 } = mongoose;
const PurchaseOrder = defineMongooseModel({
  name: "PurchaseOrder",
  schema: {
    status: {
      type: String,
      required: true,
      index: true
    },
    vendor: {
      type: Schema$2.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true
    },
    items: [
      {
        item: {
          type: Schema$2.Types.ObjectId,
          ref: "Item",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        size: {
          type: Number,
          required: true
        },
        sizeUnit: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        taxable: {
          type: Boolean,
          default: false
        },
        brand: {
          type: String,
          default: ""
        }
      }
    ],
    total: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      default: 0.0825
    },
    shipping: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      required: true,
      index: true
    }
  },
  options: { timestamps: true }
});

const { Schema: Schema$1 } = mongoose;
const Recipe = defineMongooseModel({
  name: "Recipe",
  schema: {
    name: {
      type: String,
      required: true,
      index: true
    },
    class: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: false,
      index: true
    },
    volume: {
      type: Number,
      required: true
    },
    volumeUnit: {
      type: String,
      required: true
    },
    items: [
      {
        _id: {
          type: Schema$1.Types.ObjectId,
          required: true
        },
        amount: {
          type: Number,
          required: true
        },
        unit: {
          type: String,
          required: true
        }
      }
    ],
    bulkSpirits: [
      {
        bulkSpirit: {
          type: Schema$1.Types.ObjectId,
          ref: "BulkSpirit",
          required: true
        },
        volume: {
          type: Number,
          required: true
        },
        volumeUnit: {
          type: String,
          required: true
        }
      }
    ],
    directions: {
      type: String
    },
    notes: {
      type: String
    },
    targetAbv: {
      type: Number
    },
    macerationDays: {
      type: Number
    },
    pipeline: {
      type: [String],
      required: true,
      default: [
        "Mashing",
        "Fermenting",
        "Distilling",
        "Storage",
        "Proofing",
        "Bottled"
      ]
    },
    pipelineTemplate: {
      type: String
    }
  },
  options: { timestamps: true }
});

const DEFAULT_CATEGORIES = [
  { key: "bottling", label: "Bottling Supplies", category: "Bottling", icon: "i-lucide-wine", description: "Bottles, caps, labels, shrink wraps, and packaging materials" },
  { key: "ingredients", label: "Base Ingredients", category: "Base Ingredient", icon: "i-lucide-wheat", description: "Grains, sugars, yeast, and primary fermentation ingredients" },
  { key: "botanicals", label: "Botanicals", category: "Botanical", icon: "i-lucide-leaf", description: "Herbs, spices, citrus peels, and botanical flavorings" },
  { key: "bar-supplies", label: "Bar Supplies", category: "Bar Supplies", icon: "i-lucide-cup-soda", description: "Mixers, garnishes, glassware, and bar tools" },
  { key: "other", label: "Other", category: "Other", icon: "i-lucide-box", description: "Cleaning supplies, lab supplies, and miscellaneous items" }
];
const InventoryCategoryDefSchema = {
  key: { type: String, required: true },
  label: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: "i-lucide-box" },
  description: { type: String, default: "" }
};
const Settings = defineMongooseModel({
  name: "Settings",
  schema: {
    itemCategories: {
      type: [InventoryCategoryDefSchema],
      default: () => DEFAULT_CATEGORIES
    },
    barrelAgeDefaults: {
      type: Map,
      of: Number,
      default: () => /* @__PURE__ */ new Map([
        ["5 Gallon", 12],
        ["10 Gallon", 15],
        ["15 Gallon", 18],
        ["30 Gallon", 24],
        ["53 Gallon", 36]
      ])
    },
    theme: {
      primaryColor: { type: String, default: "amber" }
    },
    distillery: {
      name: { type: String, default: "Galveston Distilling Co" },
      address: { type: String, default: "" },
      permitNumbers: {
        ttb: { type: String, default: "" },
        tabc: { type: String, default: "" }
      }
    }
  },
  options: { timestamps: true }
});

const User = defineMongooseModel({
  name: "User",
  schema: {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: String,
      required: false
    },
    role: {
      type: String,
      required: false
    }
  },
  options: { timestamps: true }
});

const { Schema } = mongoose;
const Vessel = defineMongooseModel({
  name: "Vessel",
  schema: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      index: true
    },
    stats: {
      weight: {
        type: Number,
        required: false
      },
      weightUnit: {
        type: String,
        required: false
      },
      volume: {
        type: Number,
        required: false
      },
      volumeUnit: {
        type: String,
        required: false
      }
    },
    barrel: {
      size: {
        type: String,
        required: false
      },
      char: {
        type: String,
        required: false
      },
      cost: {
        type: Number,
        required: false
      }
    },
    contents: [
      {
        batch: {
          type: Schema.Types.ObjectId,
          ref: "Batch"
        },
        volume: Number,
        volumeUnit: String,
        abv: Number,
        value: Number
      }
    ],
    current: {
      volume: {
        type: Number,
        required: false
      },
      volumeUnit: {
        type: String,
        required: false
      },
      abv: {
        type: Number,
        required: false
      },
      value: {
        type: Number,
        required: false
      }
    },
    cost: {
      type: Number,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: false,
      index: true
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    previousContents: String,
    targetAge: Number
  },
  options: { timestamps: true }
});

function isLocalhostHost(host) {
  if (!host || host.startsWith("localhost") || host.startsWith("127."))
    return true;
  const hostname = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host;
  return hostname === "[::1]" || hostname === "::1";
}
function extractHostname(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    return close !== -1 ? host.slice(0, close + 1) : host;
  }
  const colonCount = host.split(":").length - 1;
  return colonCount === 1 ? host.slice(0, host.indexOf(":")) : host;
}
function splitHostPort(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    const hostname = close !== -1 ? host.slice(0, close + 1) : host;
    const port = close !== -1 && host[close + 1] === ":" ? host.slice(close + 2) : "";
    return { host: hostname === "[::1]" ? "localhost" : hostname, port };
  }
  const colonCount = host.split(":").length - 1;
  if (colonCount === 1) {
    const i = host.indexOf(":");
    return { host: host.slice(0, i), port: host.slice(i + 1) };
  }
  if (colonCount > 1) {
    return { host: host === "::1" ? "localhost" : `[${host}]`, port: "" };
  }
  return { host, port: "" };
}
function getNitroOrigin$1(ctx = {}) {
  const isDev = ctx.isDev ?? h;
  const isPrerender = ctx.isPrerender ?? !!o.prerender;
  let host = "";
  let port = "";
  let protocol = o.NITRO_SSL_CERT && o.NITRO_SSL_KEY ? "https" : "http";
  if (isDev || isPrerender) {
    const devEnv = o.__NUXT_DEV__ || o.NUXT_VITE_NODE_OPTIONS;
    if (devEnv) {
      const parsed = JSON.parse(devEnv);
      const origin = parsed.proxy?.url || parsed.baseURL?.replace("/__nuxt_vite_node__", "");
      host = origin.replace(/^https?:\/\//, "").replace(/\/$/, "");
      protocol = origin.startsWith("https") ? "https" : "http";
    }
  }
  if (isDev && isLocalhostHost(host) && ctx.requestHost) {
    const reqHost = extractHostname(ctx.requestHost);
    if (reqHost && !isLocalhostHost(reqHost)) {
      host = ctx.requestHost;
      protocol = ctx.requestProtocol || protocol;
    }
  }
  if (!host && ctx.requestHost) {
    host = ctx.requestHost;
    protocol = ctx.requestProtocol || protocol;
  }
  if (!host) {
    host = o.NITRO_HOST || o.HOST || "";
    if (isDev)
      port = o.NITRO_PORT || o.PORT || "3000";
  }
  const split = splitHostPort(host);
  host = split.host;
  if (split.port)
    port = split.port;
  host = o.NUXT_SITE_HOST_OVERRIDE || host;
  port = o.NUXT_SITE_PORT_OVERRIDE || port;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    protocol = host.startsWith("https://") ? "https" : "http";
    host = host.replace(/^https?:\/\//, "");
  } else if (!host || !isLocalhostHost(host)) {
    protocol = "https";
  }
  return `${protocol}://${host}${port ? `:${port}` : ""}/`;
}

function getNitroOrigin(e) {
  return getNitroOrigin$1({
    isDev: false,
    isPrerender: false,
    requestHost: e ? getRequestHost(e, { xForwardedHost: true }) : void 0,
    requestProtocol: e ? getRequestProtocol(e, { xForwardedProto: true }) : void 0
  });
}

function normalizeSiteConfig(config) {
  if (typeof config.indexable !== "undefined")
    config.indexable = String(config.indexable) !== "false";
  if (typeof config.trailingSlash !== "undefined" && !config.trailingSlash)
    config.trailingSlash = String(config.trailingSlash) !== "false";
  if (config.url && !hasProtocol(String(config.url), { acceptRelative: true, strict: false }))
    config.url = withHttps(String(config.url));
  const keys = Object.keys(config).sort((a, b) => a.localeCompare(b));
  const newConfig = {};
  for (const k of keys)
    newConfig[k] = config[k];
  return newConfig;
}
function createSiteConfigStack(options) {
  const debug = options?.debug || false;
  const stack = [];
  function push(input) {
    if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
      return () => {
      };
    }
    if (!input._context && debug) {
      let lastFunctionName = new Error("tmp").stack?.split("\n")[2]?.split(" ")[5];
      if (lastFunctionName?.includes("/"))
        lastFunctionName = "anonymous";
      input._context = lastFunctionName;
    }
    const entry = {};
    for (const k in input) {
      const val = input[k];
      if (typeof val !== "undefined" && val !== "")
        entry[k] = val;
    }
    if (Object.keys(entry).filter((k) => !k.startsWith("_")).length === 0) {
      return () => {
      };
    }
    stack.push(entry);
    return () => {
      const idx = stack.indexOf(entry);
      if (idx !== -1)
        stack.splice(idx, 1);
    };
  }
  function get(options2) {
    const siteConfig = {};
    if (options2?.debug)
      siteConfig._context = {};
    siteConfig._priority = {};
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k;
        const val = options2?.resolveRefs ? toValue(stack[o][k]) : stack[o][k];
        if (!k.startsWith("_") && typeof val !== "undefined" && val !== "") {
          siteConfig[k] = val;
          if (typeof stack[o]._priority !== "undefined" && stack[o]._priority !== -1) {
            siteConfig._priority[key] = stack[o]._priority;
          }
          if (options2?.debug)
            siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || "anonymous";
        }
      }
    }
    return options2?.skipNormalize ? siteConfig : normalizeSiteConfig(siteConfig);
  }
  return {
    stack,
    push,
    get
  };
}

function envSiteConfig(env = {}) {
  return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith("NUXT_SITE_") || k.startsWith("NUXT_PUBLIC_SITE_")).map(([k, v]) => [
    k.replace(/^NUXT_(PUBLIC_)?SITE_/, "").split("_").map((s, i) => i === 0 ? s.toLowerCase() : s[0]?.toUpperCase() + s.slice(1).toLowerCase()).join(""),
    v
  ]));
}

function getSiteConfig(e, _options) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack();
  const options = defu(_options, useRuntimeConfig(e)["nuxt-site-config"], { debug: false });
  return e.context.siteConfig.get(options);
}

function useSiteConfig(e, _options) {
  return getSiteConfig(e, _options);
}

function resolveSitePath(pathOrUrl, options) {
  let path = pathOrUrl;
  if (hasProtocol(pathOrUrl, { strict: false, acceptRelative: true })) {
    const parsed = parseURL(pathOrUrl);
    path = parsed.pathname;
  }
  const base = withLeadingSlash(options.base || "/");
  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  let origin = withoutTrailingSlash(options.absolute ? options.siteUrl : "");
  if (base !== "/" && origin.endsWith(base)) {
    origin = origin.slice(0, origin.indexOf(base));
  }
  const baseWithOrigin = options.withBase ? withBase(base, origin || "/") : origin;
  const resolvedUrl = withBase(path, baseWithOrigin);
  return path === "/" && !options.withBase ? withTrailingSlash(resolvedUrl) : fixSlashes(options.trailingSlash, resolvedUrl);
}
const fileExtensions = [
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "markdown",
  // Archives
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  // Audio
  "mp3",
  "wav",
  "flac",
  "ogg",
  "opus",
  "m4a",
  "aac",
  "midi",
  "mid",
  // Video
  "mp4",
  "avi",
  "mkv",
  "mov",
  "wmv",
  "flv",
  "webm",
  // Web
  "html",
  "css",
  "js",
  "json",
  "xml",
  "tsx",
  "jsx",
  "ts",
  "vue",
  "svelte",
  "xsl",
  "rss",
  "atom",
  // Programming
  "php",
  "py",
  "rb",
  "java",
  "c",
  "cpp",
  "h",
  "go",
  // Data formats
  "csv",
  "tsv",
  "sql",
  "yaml",
  "yml",
  // Fonts
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  // Executables/Binaries
  "exe",
  "msi",
  "apk",
  "ipa",
  "dmg",
  "iso",
  "bin",
  // Scripts/Config
  "bat",
  "cmd",
  "sh",
  "env",
  "htaccess",
  "conf",
  "toml",
  "ini",
  // Package formats
  "deb",
  "rpm",
  "jar",
  "war",
  // E-books
  "epub",
  "mobi",
  // Common temporary/backup files
  "log",
  "tmp",
  "bak",
  "old",
  "sav"
];
function isPathFile(path) {
  const lastSegment = path.split("/").pop();
  const ext = (lastSegment || path).match(/\.[0-9a-z]+$/i)?.[0];
  return ext && fileExtensions.includes(ext.replace(".", ""));
}
function fixSlashes(trailingSlash, pathOrUrl) {
  const $url = parseURL(pathOrUrl);
  if (isPathFile($url.pathname))
    return pathOrUrl;
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname);
  return `${$url.protocol ? `${$url.protocol}//` : ""}${$url.host || ""}${fixedPath}${$url.search || ""}${$url.hash || ""}`;
}

function createSitePathResolver(e, options = {}) {
  const siteConfig = getSiteConfig(e);
  const nitroOrigin = getNitroOrigin(e);
  const nuxtBase = useRuntimeConfig(e).app.baseURL || "/";
  return (path) => {
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || false ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase
    });
  };
}

function isH3Error(error) {
  return typeof error === "object" && error !== null && ("status" in error || "statusCode" in error);
}

function validateObjectId(id, label = "ID") {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw createError$1({ status: 400, statusText: `Invalid ${label} format` });
  }
  return id;
}
function sanitize(obj) {
  if (obj === null || obj === void 0) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (obj instanceof Date) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    if (key === "__proto__" || key === "constructor" || key === "prototype")
      continue;
    result[key] = typeof value === "object" ? sanitize(value) : value;
  }
  return result;
}
async function validateBody(body, schema) {
  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      throw createError$1({
        status: 400,
        statusText: "Validation Error",
        data: error.errors
      });
    }
    throw error;
  }
}
const userCreateSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phoneNumber: yup.string()
});
const userLoginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required")
});
const batchCreateSchema = yup.object({
  recipe: yup.string().required("Recipe is required"),
  batchSize: yup.number().positive("Must be greater than 0").required("Batch size is required"),
  batchSizeUnit: yup.string().required("Unit is required"),
  pipeline: yup.array().of(yup.string()).min(1, "Pipeline must have at least one stage").required("Pipeline is required").test("unique-stages", "Pipeline must not contain duplicate stages", (val) => !val || new Set(val).size === val.length),
  currentStage: yup.string().required("Current stage is required")
});
const bottleCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  abv: yup.number().nullable().transform((value, original) => original === "" ? null : value).min(0, "ABV cannot be negative").max(100, "ABV cannot exceed 100"),
  price: yup.number().nullable().transform((value, original) => original === "" ? null : value).min(0, "Price cannot be negative"),
  archived: yup.boolean()
});
const cocktailCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  price: yup.number().min(0, "Price cannot be negative"),
  preparation: yup.string().trim().max(50, "Preparation must be 50 characters or less")
});
const contactCreateSchema = yup.object({
  businessName: yup.string(),
  type: yup.string().required("Type is required"),
  email: yup.string().email("Invalid email"),
  newsletter: yup.boolean()
});
const inventoryCreateSchema = yup.object({
  date: yup.date().required("Date is required"),
  item: yup.string().required("Item is required"),
  quantity: yup.number().nullable().transform((value, original) => original === "" ? null : value).required("Quantity is required"),
  location: yup.string().nullable(),
  unitSize: yup.number().min(0, "Unit size cannot be negative").nullable(),
  unitSizeUnit: yup.string().nullable()
});
const itemCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  category: yup.string(),
  trackInventory: yup.boolean(),
  unitSize: yup.number().min(0, "Unit size cannot be negative").nullable(),
  unitLabel: yup.string(),
  minStock: yup.number().min(0, "Min stock cannot be negative"),
  reorderPoint: yup.number().min(0, "Reorder point cannot be negative"),
  usePerMonth: yup.number().min(0, "Use per month cannot be negative"),
  notes: yup.string()
});
const productionCostsSchema = yup.object({
  batch: yup.number().min(0, "Batch cost cannot be negative").default(0),
  barrel: yup.number().min(0, "Barrel cost cannot be negative").default(0),
  bottling: yup.number().min(0, "Bottling cost cannot be negative").default(0),
  labor: yup.number().min(0, "Labor cost cannot be negative").default(0),
  ttbTax: yup.number().min(0, "TTB tax cannot be negative").default(0),
  tabcTax: yup.number().min(0, "TABC tax cannot be negative").default(0),
  other: yup.number().min(0, "Other cost cannot be negative").default(0)
});
const productionCreateSchema = yup.object({
  date: yup.date().required("Date is required"),
  bottle: yup.string().required("Bottle is required"),
  quantity: yup.number().positive("Must be greater than 0").required("Quantity is required"),
  costs: productionCostsSchema.optional().default(void 0)
});
const purchaseOrderCreateSchema = yup.object({
  vendor: yup.string().required("Vendor is required"),
  date: yup.date().required("Date is required"),
  taxRate: yup.number().min(0, "Tax rate cannot be negative").max(1, "Tax rate must be a decimal (e.g. 0.0825)"),
  shipping: yup.number().min(0, "Shipping cannot be negative")
});
const recipeCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  pipeline: yup.array().of(yup.string()).min(1, "Pipeline must have at least one stage").test("unique-stages", "Pipeline must not contain duplicate stages", (val) => !val || new Set(val).size === val.length),
  pipelineTemplate: yup.string()
});
const newsletterSubscribeSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  firstName: yup.string(),
  lastName: yup.string(),
  phone: yup.string()
});
const eventCreateSchema = yup.object({
  date: yup.date().required("Date is required"),
  groupSize: yup.number().min(0, "Must be 0 or greater").default(0),
  contact: yup.string().nullable(),
  type: yup.string().oneOf(["Cocktail Class", "Private Class", "Private Event", "Tasting"]).required("Type is required"),
  status: yup.string().oneOf(["Pending", "Confirmed", "Completed", "Cancelled"]),
  notes: yup.string(),
  capacity: yup.number().positive().nullable(),
  isPublic: yup.boolean(),
  price: yup.number().min(0, "Price cannot be negative").nullable(),
  addOns: yup.array().of(
    yup.object({
      name: yup.string().required("Add-on name is required"),
      price: yup.number().min(0).required("Add-on price is required"),
      description: yup.string()
    })
  ).nullable()
});
const eventRequestSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  date: yup.date().required("Preferred date is required"),
  groupSize: yup.number().positive("Must be greater than 0").required("Group size is required"),
  type: yup.string().oneOf(["Cocktail Class", "Private Class", "Private Event", "Tasting"]).required("Type is required"),
  notes: yup.string()
});
const contactInquirySchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  topic: yup.string().required("Please select a topic"),
  message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters")
});
const messageCreateSchema = yup.object({
  contact: yup.string(),
  firstName: yup.string().trim().max(100, "First name must be 100 characters or less").required("First name is required"),
  lastName: yup.string().trim().max(100, "Last name must be 100 characters or less").required("Last name is required"),
  email: yup.string().trim().email("Invalid email").required("Email is required"),
  phone: yup.string().trim().max(20, "Phone must be 20 characters or less"),
  topic: yup.string().trim().max(100, "Topic must be 100 characters or less").required("Please select a topic"),
  message: yup.string().trim().max(5e3, "Message must be 5000 characters or less").required("Message is required").min(10, "Message must be at least 10 characters"),
  read: yup.boolean()
}).noUnknown();
const vesselCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
  isUsed: yup.boolean(),
  previousContents: yup.string()
});
const bulkSpiritCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  spiritClass: yup.string().required("Spirit class is required"),
  vessel: yup.string().nullable(),
  volumeUnit: yup.string().default("gallon"),
  notes: yup.string()
});
const userUpdateSchema = yup.object({
  email: yup.string().email("Invalid email"),
  password: yup.string().min(8, "Password must be at least 8 characters"),
  firstName: yup.string(),
  lastName: yup.string(),
  phoneNumber: yup.string(),
  role: yup.string().oneOf(["Admin", "Manager", "Staff", "ReadOnly"])
});
const batchUpdateSchema = yup.object({
  recipe: yup.string(),
  batchSize: yup.number().positive("Must be greater than 0"),
  batchSizeUnit: yup.string(),
  pipeline: yup.array().of(yup.string()).test("unique-stages", "Pipeline must not contain duplicate stages", (val) => !val || new Set(val).size === val.length),
  currentStage: yup.string(),
  status: yup.string().oneOf(["active", "completed", "cancelled"]),
  batchCost: yup.number().min(0),
  barrelCost: yup.number().min(0),
  recipeCost: yup.number().min(0)
});
const bottleUpdateSchema = yup.object({
  name: yup.string(),
  abv: yup.number().nullable().transform((value, original) => original === "" ? null : value).min(0, "ABV cannot be negative").max(100, "ABV cannot exceed 100"),
  price: yup.number().nullable().transform((value, original) => original === "" ? null : value).min(0, "Price cannot be negative"),
  archived: yup.boolean()
});
const cocktailUpdateSchema = yup.object({
  name: yup.string(),
  price: yup.number().min(0, "Price cannot be negative"),
  preparation: yup.string().trim().max(50, "Preparation must be 50 characters or less")
});
const contactUpdateSchema = yup.object({
  businessName: yup.string(),
  type: yup.string(),
  email: yup.string().email("Invalid email"),
  newsletter: yup.boolean()
});
const inventoryUpdateSchema = yup.object({
  date: yup.date(),
  item: yup.string(),
  quantity: yup.number().nullable().transform((value, original) => original === "" ? null : value),
  location: yup.string().nullable(),
  unitSize: yup.number().min(0, "Unit size cannot be negative").nullable(),
  unitSizeUnit: yup.string().nullable()
});
const itemUpdateSchema = yup.object({
  name: yup.string(),
  category: yup.string(),
  trackInventory: yup.boolean(),
  unitSize: yup.number().min(0, "Unit size cannot be negative").nullable(),
  unitLabel: yup.string(),
  minStock: yup.number().min(0, "Min stock cannot be negative"),
  reorderPoint: yup.number().min(0, "Reorder point cannot be negative"),
  usePerMonth: yup.number().min(0, "Use per month cannot be negative"),
  notes: yup.string()
});
const productionUpdateSchema = yup.object({
  date: yup.date(),
  bottle: yup.string(),
  quantity: yup.number().positive("Must be greater than 0"),
  costs: productionCostsSchema.optional().default(void 0)
});
const purchaseOrderUpdateSchema = yup.object({
  vendor: yup.string(),
  date: yup.date(),
  status: yup.string(),
  taxRate: yup.number().min(0, "Tax rate cannot be negative").max(1, "Tax rate must be a decimal (e.g. 0.0825)"),
  shipping: yup.number().min(0, "Shipping cannot be negative")
});
const recipeUpdateSchema = yup.object({
  name: yup.string(),
  pipeline: yup.array().of(yup.string()).test("unique-stages", "Pipeline must not contain duplicate stages", (val) => !val || new Set(val).size === val.length),
  pipelineTemplate: yup.string()
});
const eventUpdateSchema = yup.object({
  date: yup.date(),
  groupSize: yup.number().min(0, "Must be 0 or greater"),
  contact: yup.string().nullable(),
  type: yup.string().oneOf(["Cocktail Class", "Private Class", "Private Event", "Tasting"]),
  status: yup.string().oneOf(["Pending", "Confirmed", "Completed", "Cancelled"]),
  notes: yup.string(),
  capacity: yup.number().positive().nullable(),
  isPublic: yup.boolean(),
  price: yup.number().min(0, "Price cannot be negative").nullable(),
  addOns: yup.array().of(
    yup.object({
      _id: yup.string(),
      name: yup.string().required("Add-on name is required"),
      price: yup.number().min(0).required("Add-on price is required"),
      description: yup.string()
    })
  ).nullable()
});
const messageUpdateSchema = yup.object({
  contact: yup.string(),
  firstName: yup.string().trim().max(100, "First name must be 100 characters or less"),
  lastName: yup.string().trim().max(100, "Last name must be 100 characters or less"),
  email: yup.string().trim().email("Invalid email"),
  phone: yup.string().trim().max(20, "Phone must be 20 characters or less"),
  topic: yup.string().trim().max(100, "Topic must be 100 characters or less"),
  message: yup.string().trim().max(5e3, "Message must be 5000 characters or less"),
  read: yup.boolean()
}).noUnknown();
const vesselUpdateSchema = yup.object({
  name: yup.string(),
  type: yup.string(),
  isUsed: yup.boolean(),
  previousContents: yup.string()
});
const bulkSpiritUpdateSchema = yup.object({
  name: yup.string(),
  spiritClass: yup.string(),
  vessel: yup.string().nullable(),
  notes: yup.string(),
  status: yup.string().oneOf(["active", "depleted"])
});
const equipmentLogCreateSchema = yup.object({
  equipment: yup.string().required("Equipment is required"),
  action: yup.string().required("Action is required"),
  value: yup.number().nullable(),
  batch: yup.string().nullable()
});
const inventoryCategoryDefSchema = yup.object({
  key: yup.string().required("Key is required"),
  label: yup.string().required("Label is required"),
  category: yup.string().required("Category is required"),
  icon: yup.string().default("i-lucide-box"),
  description: yup.string().default("")
});
const settingsUpdateSchema = yup.object({
  itemCategories: yup.array().of(inventoryCategoryDefSchema).min(1, "At least one category is required"),
  barrelAgeDefaults: yup.object(),
  theme: yup.object({
    primaryColor: yup.string()
  }),
  distillery: yup.object({
    name: yup.string(),
    address: yup.string(),
    permitNumbers: yup.object({
      ttb: yup.string(),
      tabc: yup.string()
    })
  })
});

function extractId(event, paramName) {
  var _a;
  const params = event.context.params;
  const id = paramName ? params == null ? void 0 : params[paramName] : (_a = params == null ? void 0 : params._id) != null ? _a : params == null ? void 0 : params.id;
  if (!id) {
    throw createError$1({ status: 400, statusText: "Missing document ID" });
  }
  return id;
}
function modelLabel(model) {
  return model.modelName.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}
function createGetAllHandler(model, options = {}) {
  const label = modelLabel(model);
  return defineEventHandler(async () => {
    try {
      let query = model.find({});
      if (options.select) query = query.select(options.select);
      if (options.sort) query = query.sort(options.sort);
      if (options.populate) query = query.populate(options.populate);
      if (options.limit) query = query.limit(options.limit);
      return await query.lean();
    } catch (error) {
      throw createError$1({
        status: 500,
        statusText: `Failed to fetch ${label}s`
      });
    }
  });
}
function createGetByIdHandler(model, options = {}) {
  const label = modelLabel(model);
  return defineEventHandler(async (event) => {
    try {
      const id = extractId(event, options.paramName);
      let query = model.findById(id);
      if (options.populate) query = query.populate(options.populate);
      const doc = await query.lean();
      if (!doc) {
        throw createError$1({
          status: 404,
          statusText: `${model.modelName} not found`
        });
      }
      return doc;
    } catch (error) {
      if (isH3Error(error)) throw error;
      throw createError$1({
        status: 500,
        statusText: `Failed to fetch ${label}`
      });
    }
  });
}
function createCreateHandler(model, options = {}) {
  const label = modelLabel(model);
  return defineEventHandler(async (event) => {
    const body = await readBody(event);
    const sanitized = sanitize(body);
    if (options.schema) {
      await validateBody(sanitized, options.schema);
    }
    if (options.falsyFields) {
      for (const [field, action] of Object.entries(options.falsyFields)) {
        if (action === "deleteIfFalsy" && !sanitized[field]) {
          delete sanitized[field];
        }
      }
    }
    try {
      const doc = new model(sanitized);
      await doc.save();
      if (options.populate) {
        await doc.populate(options.populate);
      }
      return doc;
    } catch (error) {
      console.error(`Failed to create ${label}:`, (error == null ? void 0 : error.message) || error);
      if (error == null ? void 0 : error.errors) {
        const fields = Object.keys(error.errors).join(", ");
        console.error(`Validation failed on fields: ${fields}`);
      }
      throw createError$1({
        status: 500,
        statusText: `Failed to create ${label}`
      });
    }
  });
}
function createUpdateHandler(model, options = {}) {
  const label = modelLabel(model);
  return defineEventHandler(async (event) => {
    const id = extractId(event, options.paramName);
    const body = await readBody(event);
    const sanitized = sanitize(body);
    if (options.schema) {
      await validateBody(sanitized, options.schema);
    }
    if (options.nullableFields) {
      for (const field of options.nullableFields) {
        if (!sanitized[field]) {
          sanitized[field] = null;
        }
      }
    }
    try {
      let query = model.findByIdAndUpdate(id, sanitized, { new: true });
      if (options.populate) query = query.populate(options.populate);
      const updated = await query;
      if (!updated) {
        throw createError$1({
          status: 404,
          statusText: `${model.modelName} not found`
        });
      }
      return updated;
    } catch (error) {
      if (isH3Error(error)) throw error;
      throw createError$1({
        status: 500,
        statusText: `Failed to update ${label}`
      });
    }
  });
}
function createDeleteHandler(model, options = {}) {
  const label = modelLabel(model);
  return defineEventHandler(async (event) => {
    try {
      const id = extractId(event, options.paramName);
      if (options.referenceChecks) {
        for (const check of options.referenceChecks) {
          const count = await check.model.countDocuments({ [check.field]: id });
          if (count > 0) {
            throw createError$1({
              status: 400,
              statusText: `Cannot delete: ${count} ${check.label} reference this ${label}`
            });
          }
        }
      }
      if (options.preDelete) {
        await options.preDelete(id, event);
      }
      const deleted = await model.findByIdAndDelete(id);
      if (!deleted) {
        throw createError$1({
          status: 404,
          statusText: `${model.modelName} not found`
        });
      }
      return { message: `${model.modelName} deleted successfully` };
    } catch (error) {
      if (isH3Error(error)) throw error;
      throw createError$1({
        status: 500,
        statusText: `Failed to delete ${label}`
      });
    }
  });
}

let configured = false;
function getCloudinary(event) {
  if (!configured) {
    const config = useRuntimeConfig(event);
    v2.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret
    });
    configured = true;
  }
  return v2;
}

let cachedSecret = null;
function getSessionSecret(event) {
  if (cachedSecret) return cachedSecret;
  const config = useRuntimeConfig(event);
  const secret = config.sessionSecret;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET env var must be set and be at least 32 characters");
  }
  cachedSecret = secret;
  return cachedSecret;
}
async function getAuthSession(event) {
  return await useSession(event, {
    password: getSessionSecret(event),
    maxAge: 60 * 60 * 24 * 7,
    // 7 days
    name: "gdc-session",
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    }
  });
}

async function requireRole(event, ...allowedRoles) {
  const session = await getAuthSession(event);
  if (!session.data.userId) {
    throw createError$1({
      status: 401,
      statusText: "Unauthorized"
    });
  }
  const user = await User.findById(session.data.userId).select("role");
  if (!user) {
    throw createError$1({
      status: 401,
      statusText: "User not found"
    });
  }
  const userRole = user.role || "Staff";
  if (!allowedRoles.includes(userRole)) {
    throw createError$1({
      status: 403,
      statusText: `Forbidden: requires ${allowedRoles.join(" or ")} role`
    });
  }
  return userRole;
}

let _client = null;
function useSquareClient(event) {
  if (_client) return _client;
  const config = useRuntimeConfig(event);
  _client = new SquareClient({
    token: config.squareAccessToken,
    environment: config.squareEnvironment === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox
  });
  return _client;
}

async function defineMongooseConnection({ uri, options } = {}) {
  const config = useRuntimeConfig().mongoose;
  const mongooseUri = uri || config.uri;
  const mongooseOptions = options || config.options;
  try {
    await mongoose.connect(mongooseUri, { ...mongooseOptions });
    consola.success("Connected to MongoDB");
  } catch (err) {
    consola.error(colors.red(`Error connecting to MongoDB: ${err}`));
  }
}

function defineMongooseModel(nameOrOptions, schema, options, hooks) {
  let name;
  if (typeof nameOrOptions === "string") {
    name = nameOrOptions;
  } else {
    name = nameOrOptions.name;
    schema = nameOrOptions.schema;
    options = nameOrOptions.options;
    hooks = nameOrOptions.hooks;
  }
  const newSchema = new mongoose.Schema(schema, options);
  if (hooks)
    hooks(newSchema);
  return mongoose.model(name, newSchema);
}

function defineNitroPlugin(def) {
  return def;
}
const _arj7K3AH_Vw9yb1byf4lW9I2NyhtXNZvQJkwcdIDVE = defineNitroPlugin(() => {
  defineMongooseConnection();
});

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
const unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
const reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
const escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  const counts = /* @__PURE__ */ new Map();
  let logNum = 0;
  function log(message) {
    if (logNum < 100) {
      console.warn(message);
      logNum += 1;
    }
  }
  function walk(thing) {
    if (typeof thing === "function") {
      log(`Cannot stringify a function ${thing.name}`);
      return;
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          const proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            if (typeof thing.toJSON !== "function") {
              log(`Cannot stringify arbitrary non-POJOs ${thing.constructor.name}`);
            }
          } else if (Object.getOwnPropertySymbols(thing).length > 0) {
            log(`Cannot stringify POJOs with symbolic keys ${Object.getOwnPropertySymbols(thing).map((symbol) => symbol.toString())}`);
          } else {
            Object.keys(thing).forEach((key) => walk(thing[key]));
          }
      }
    }
  }
  walk(value);
  const names = /* @__PURE__ */ new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    const type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return `Object(${stringify(thing.valueOf())})`;
      case "RegExp":
        return thing.toString();
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "Array":
        const members = thing.map((v, i) => i in thing ? stringify(v) : "");
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return `[${members.join(",")}${tail}]`;
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify).join(",")}])`;
      default:
        if (thing.toJSON) {
          let json = thing.toJSON();
          if (getType(json) === "String") {
            try {
              json = JSON.parse(json);
            } catch (e) {
            }
          }
          return stringify(json);
        }
        if (Object.getPrototypeOf(thing) === null) {
          if (Object.keys(thing).length === 0) {
            return "Object.create(null)";
          }
          return `Object.create(null,{${Object.keys(thing).map((key) => `${safeKey(key)}:{writable:true,enumerable:true,value:${stringify(thing[key])}}`).join(",")}})`;
        }
        return `{${Object.keys(thing).map((key) => `${safeKey(key)}:${stringify(thing[key])}`).join(",")}}`;
    }
  }
  const str = stringify(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (isPrimitive(thing)) {
        values.push(stringifyPrimitive(thing));
        return;
      }
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values.push(`Object(${stringify(thing.valueOf())})`);
          break;
        case "RegExp":
          values.push(thing.toString());
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify(v)}`);
          });
          break;
        case "Set":
          values.push("new Set");
          statements.push(`${name}.${Array.from(thing).map((v) => `add(${stringify(v)})`).join(".")}`);
          break;
        case "Map":
          values.push("new Map");
          statements.push(`${name}.${Array.from(thing).map(([k, v]) => `set(${stringify(k)}, ${stringify(v)})`).join(".")}`);
          break;
        default:
          values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach((key) => {
            statements.push(`${name}${safeProp(key)}=${stringify(thing[key])}`);
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function getName(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string") {
    return stringifyString(thing);
  }
  if (thing === void 0) {
    return "void 0";
  }
  if (thing === 0 && 1 / thing < 0) {
    return "-0";
  }
  const str = String(thing);
  if (typeof thing === "number") {
    return str.replace(/^(-)?0\./, "$1.");
  }
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escapeUnsafeChars(JSON.stringify(key))}]`;
}
function stringifyString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}

const _sltePtaGRDbqBlqwpZ8ldk2brO8nDI861kV9vayKjg = defineNitroPlugin$1(async (nitroApp) => {
  nitroApp.hooks.hook("render:html", async (ctx, { event }) => {
    const routeOptions = getRouteRules(event);
    const isIsland = process.env.NUXT_COMPONENT_ISLANDS && event.path.startsWith("/__nuxt_island");
    event.path;
    const noSSR = !!process.env.NUXT_NO_SSR || event.context.nuxt?.noSSR || routeOptions.ssr === false && !isIsland || (false);
    if (noSSR) {
      const siteConfig = Object.fromEntries(
        Object.entries(getSiteConfig(event)).map(([k, v]) => [k, toValue(v)])
      );
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}<\/script>`);
    }
  });
});

const script = "\"use strict\";(()=>{const t=window,e=document.documentElement,c=[\"dark\",\"light\"],n=getStorageValue(\"localStorage\",\"nuxt-color-mode\")||\"system\";let i=n===\"system\"?u():n;const r=e.getAttribute(\"data-color-mode-forced\");r&&(i=r),l(i),t[\"__NUXT_COLOR_MODE__\"]={preference:n,value:i,getColorScheme:u,addColorScheme:l,removeColorScheme:d};function l(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.add(s):e.className+=\" \"+s,a&&e.setAttribute(\"data-\"+a,o)}function d(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.remove(s):e.className=e.className.replace(new RegExp(s,\"g\"),\"\"),a&&e.removeAttribute(\"data-\"+a)}function f(o){return t.matchMedia(\"(prefers-color-scheme\"+o+\")\")}function u(){if(t.matchMedia&&f(\"\").media!==\"not all\"){for(const o of c)if(f(\":\"+o).matches)return o}return\"light\"}})();function getStorageValue(t,e){switch(t){case\"localStorage\":return window.localStorage.getItem(e);case\"sessionStorage\":return window.sessionStorage.getItem(e);case\"cookie\":return getCookie(e);default:return null}}function getCookie(t){const c=(\"; \"+window.document.cookie).split(\"; \"+t+\"=\");if(c.length===2)return c.pop()?.split(\";\").shift()}";

const _hlmaurORSwo2VNoYFzN_PCqsU6CLXOq9bfJxqnwlFIg = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const plugins = [
  _arj7K3AH_Vw9yb1byf4lW9I2NyhtXNZvQJkwcdIDVE,
_sltePtaGRDbqBlqwpZ8ldk2brO8nDI861kV9vayKjg,
_hlmaurORSwo2VNoYFzN_PCqsU6CLXOq9bfJxqnwlFIg
];

const assets = {
  "/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-SDzs72YTG3j9abIpCqo5TKpm7JQ\"",
    "mtime": "2026-04-04T20:23:28.282Z",
    "size": 69,
    "path": "../public/_payload.json"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"10be-n8egyE9tcb7sKGr/pYCaQ4uWqxI\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/contact/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-zutOqgSLZtatkYcw8ZCXKEsSMgc\"",
    "mtime": "2026-04-04T20:23:28.264Z",
    "size": 69,
    "path": "../public/contact/_payload.json"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"a7-W6/Vg/XZ0/28bYFfdkPkkfEuV6I\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 167,
    "path": "../public/robots.txt"
  },
  "/about/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-zutOqgSLZtatkYcw8ZCXKEsSMgc\"",
    "mtime": "2026-04-04T20:23:28.281Z",
    "size": 69,
    "path": "../public/about/_payload.json"
  },
  "/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"16ee0-PyaEvNRsZ1O5l235m3uAyeSPucQ\"",
    "mtime": "2026-04-04T20:23:28.271Z",
    "size": 93920,
    "path": "../public/index.html"
  },
  "/contact/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"15cdb-NDWjX7ViNcepHYv0RyuDDx6FtSI\"",
    "mtime": "2026-04-04T20:23:28.236Z",
    "size": 89307,
    "path": "../public/contact/index.html"
  },
  "/about/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"1459f-mqkwnSU5aLA9UHsYyrgMIfetBFw\"",
    "mtime": "2026-04-04T20:23:28.271Z",
    "size": 83359,
    "path": "../public/about/index.html"
  },
  "/images/Logo.png": {
    "type": "image/png",
    "etag": "\"22069-dD6h8PQXY3yL5uFSwwymNSC+9g0\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 139369,
    "path": "../public/images/Logo.png"
  },
  "/images/20231017_104945.jpg": {
    "type": "image/jpeg",
    "etag": "\"364ca-hT3GF2OuGie72SeWp8u8t5k8G6I\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 222410,
    "path": "../public/images/20231017_104945.jpg"
  },
  "/images/20231205_174024 (3).jpg": {
    "type": "image/jpeg",
    "etag": "\"6a053-sEguwSbXtkBhP5QOq2x5Ticq0hQ\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 434259,
    "path": "../public/images/20231205_174024 (3).jpg"
  },
  "/images/Logo 2.png": {
    "type": "image/png",
    "etag": "\"321ea-fhSiLOCvD39CBqzv1a8b1xSe2I4\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 205290,
    "path": "../public/images/Logo 2.png"
  },
  "/images/MainLogo.png": {
    "type": "image/png",
    "etag": "\"61e6e-i9Rw58dnP6aTAz2pJ8OQEw19rgM\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 401006,
    "path": "../public/images/MainLogo.png"
  },
  "/images/class.jpg": {
    "type": "image/jpeg",
    "etag": "\"607e1-PiP9Cxz18H1/y8XJIaUa/GGpk2M\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 395233,
    "path": "../public/images/class.jpg"
  },
  "/images/hero.jpg": {
    "type": "image/jpeg",
    "etag": "\"59d9d-StGERgvB4kI8eNQ0DGLVnSS0iKI\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 368029,
    "path": "../public/images/hero.jpg"
  },
  "/images/logo.png": {
    "type": "image/png",
    "etag": "\"1d8d3-EfdqqUSHJnVSmxo575bTJWhVQLQ\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 121043,
    "path": "../public/images/logo.png"
  },
  "/images/cocktail.jpg": {
    "type": "image/jpeg",
    "etag": "\"426d9-0UOqD/FLXAxAjWYzdxtZ+sFXTaQ\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 272089,
    "path": "../public/images/cocktail.jpg"
  },
  "/privacy/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-zutOqgSLZtatkYcw8ZCXKEsSMgc\"",
    "mtime": "2026-04-04T20:23:28.236Z",
    "size": 69,
    "path": "../public/privacy/_payload.json"
  },
  "/images/absinthe.jpg": {
    "type": "image/jpeg",
    "etag": "\"569b9-Od8P+INKttZ5X39CIZn671b3gmU\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 354745,
    "path": "../public/images/absinthe.jpg"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-EGx8Kou8JbuAQ_fJ7O_Ls3LhIwmrNJg8FnKix9DNk7U.woff": {
    "type": "font/woff",
    "etag": "\"1776c-8epDKADyUKXYtuFVGFDpFZFhS7o\"",
    "mtime": "2026-04-04T20:23:28.719Z",
    "size": 96108,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-EGx8Kou8JbuAQ_fJ7O_Ls3LhIwmrNJg8FnKix9DNk7U.woff"
  },
  "/privacy/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"13505-M6Yor0W5R+SJR3a0dB/2Y6yK+eQ\"",
    "mtime": "2026-04-04T20:23:28.224Z",
    "size": 79109,
    "path": "../public/privacy/index.html"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-TeMLP6CiYLZ0769ViwnkIzqiAjfy_KcpAqC5soKUjhw.woff": {
    "type": "font/woff",
    "etag": "\"181d4-n/y9vr2rj8gzIqRMiJ1airPSBu8\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 98772,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-TeMLP6CiYLZ0769ViwnkIzqiAjfy_KcpAqC5soKUjhw.woff"
  },
  "/images/landing-hero.png": {
    "type": "image/png",
    "etag": "\"6ae23-PQJTi6RlzZWmiPE1+fWg0eDEvis\"",
    "mtime": "2026-04-04T20:23:28.734Z",
    "size": 437795,
    "path": "../public/images/landing-hero.png"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-KhQ6i83qvWvl7pHRUYTb6Phc1buw2V6eoXQXsgXgMMs.woff": {
    "type": "font/woff",
    "etag": "\"181a4-34UajwQQuI+3y2q0rSM/f9vqVwM\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 98724,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-KhQ6i83qvWvl7pHRUYTb6Phc1buw2V6eoXQXsgXgMMs.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-XQhZNpC0QXakJOeDxyxOLrpaLIYiFdd1VIzugTLIfEA.woff": {
    "type": "font/woff",
    "etag": "\"17fcc-XDLJObh0V1EcLDof35NDJ1VOTVU\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 98252,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-XQhZNpC0QXakJOeDxyxOLrpaLIYiFdd1VIzugTLIfEA.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-qCZJBx2kjYaMe9v0orZcK_DKQBNHwatoWm9h73k3xlo.woff": {
    "type": "font/woff",
    "etag": "\"17074-Ls1e+2LYf//IR4tgQRPSJQxjJqI\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 94324,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-qCZJBx2kjYaMe9v0orZcK_DKQBNHwatoWm9h73k3xlo.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-qnSqfB10F7O5b1w6EhnzhP68s_HgHi4F7kIGq_bPDrQ.woff": {
    "type": "font/woff",
    "etag": "\"1698c-MjvrQT2VXOibCZktmxcyu/ajcDc\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 92556,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-qnSqfB10F7O5b1w6EhnzhP68s_HgHi4F7kIGq_bPDrQ.woff"
  },
  "/_fonts/3Euo1hdGK-Js_Eyfgq8u09u4N4_XxiBl3kbljcxwvX0-kxR7s9jaKVI1eztz71KAviULk_k6uM2szb8ATJYh4A8.woff2": {
    "type": "font/woff2",
    "etag": "\"528c-g9IHuYp3VaXr5R0f9es/iwhkLU8\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 21132,
    "path": "../public/_fonts/3Euo1hdGK-Js_Eyfgq8u09u4N4_XxiBl3kbljcxwvX0-kxR7s9jaKVI1eztz71KAviULk_k6uM2szb8ATJYh4A8.woff2"
  },
  "/_fonts/D0K_eWq0fsX79H3CVWWa4xH9wSGL3F6t3HFkg4WVveU-cvl4xzrqsaNFpZVMVuDJP7Z330B_RCa3OegkKumW5Xk.woff2": {
    "type": "font/woff2",
    "etag": "\"626c-hKBy8lKTclaSTdY6hj3tcZPuuWk\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 25196,
    "path": "../public/_fonts/D0K_eWq0fsX79H3CVWWa4xH9wSGL3F6t3HFkg4WVveU-cvl4xzrqsaNFpZVMVuDJP7Z330B_RCa3OegkKumW5Xk.woff2"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-xAIpj8BS_7q4Sz8PZT8bh1c1z7YOsF8dV_ryYsMou2o.woff": {
    "type": "font/woff",
    "etag": "\"1766c-rn2G1ic8tQi4B5JYdyPEEE8S/wE\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 95852,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-xAIpj8BS_7q4Sz8PZT8bh1c1z7YOsF8dV_ryYsMou2o.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-wXvjfkwVFCycdGPAWzjr5TdLUYOFP5eMO309IZI0Xhc.woff": {
    "type": "font/woff",
    "etag": "\"17358-R8ArTY9++1Jxwt3Om84QBbukRoM\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 95064,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-wXvjfkwVFCycdGPAWzjr5TdLUYOFP5eMO309IZI0Xhc.woff"
  },
  "/_fonts/MwZllZsWQ3Mw9YxCG_PzWWlscyUINhDdmf91-F4XVfM-1Hgy1bdTFQd5KimhYd5FfccBhb8syoQMaRWsHj4Hkn4.woff2": {
    "type": "font/woff2",
    "etag": "\"83cc-a4vz3YWkoAMT8vij45EXjhUpcx4\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 33740,
    "path": "../public/_fonts/MwZllZsWQ3Mw9YxCG_PzWWlscyUINhDdmf91-F4XVfM-1Hgy1bdTFQd5KimhYd5FfccBhb8syoQMaRWsHj4Hkn4.woff2"
  },
  "/_fonts/GbkHFSgbtLGh1LFVSX3un7PDH9VaxAgZcJgelF_t9c8-610SP3qNzw9YoXQggra0cd9VEJbWyMv2h7by10JJ2o4.woff2": {
    "type": "font/woff2",
    "etag": "\"9390-Wn+UofoJYVBspwgRehqNbm3rr7Q\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 37776,
    "path": "../public/_fonts/GbkHFSgbtLGh1LFVSX3un7PDH9VaxAgZcJgelF_t9c8-610SP3qNzw9YoXQggra0cd9VEJbWyMv2h7by10JJ2o4.woff2"
  },
  "/_fonts/fbwVIvjsq9c5cPfht2PuyLMJoqNUtbI9Cd5gBXMn8IE-zZTvNiUa1KVOfOsurjiJMY_BelT6CLDNhPP_gIXFo7c.woff2": {
    "type": "font/woff2",
    "etag": "\"868c-45CKFf9ZZssvy9aG/Q4v+SwjEOQ\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 34444,
    "path": "../public/_fonts/fbwVIvjsq9c5cPfht2PuyLMJoqNUtbI9Cd5gBXMn8IE-zZTvNiUa1KVOfOsurjiJMY_BelT6CLDNhPP_gIXFo7c.woff2"
  },
  "/_fonts/hvthPadz3y5tC3IPffHvvW2G1Ux_hjAtSPU5qvJNnwo-UOUk69gguapxuzxF91eW7BObcVbXhILgKrGWER07o_w.woff2": {
    "type": "font/woff2",
    "etag": "\"5310-bU74ZSGdfrNo69K2B59rhaOGi1U\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 21264,
    "path": "../public/_fonts/hvthPadz3y5tC3IPffHvvW2G1Ux_hjAtSPU5qvJNnwo-UOUk69gguapxuzxF91eW7BObcVbXhILgKrGWER07o_w.woff2"
  },
  "/_fonts/mJt_LdIE_seJuty8IuPNRjAo6bSVednClU6pKv9Bm0w-O9io9e0cY_V7CIDlO3_cuUEaYNe3mbUfbcVXwF0lXfo.woff2": {
    "type": "font/woff2",
    "etag": "\"5b70-EnGaXHNJA3Ayxc5p1uKmDTbhQks\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 23408,
    "path": "../public/_fonts/mJt_LdIE_seJuty8IuPNRjAo6bSVednClU6pKv9Bm0w-O9io9e0cY_V7CIDlO3_cuUEaYNe3mbUfbcVXwF0lXfo.woff2"
  },
  "/_fonts/g0qRVvkJp3gKUA2BKVjFxaNTQSAL_-JuIVlIIYZ8Hz0-BLYQFqFXfbfZwPGB8r_w2aV68LBQ4Azha_6VjFpzuog.woff2": {
    "type": "font/woff2",
    "etag": "\"9988-AcknWqDYmgQVepmBrgIPfX8MeVM\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 39304,
    "path": "../public/_fonts/g0qRVvkJp3gKUA2BKVjFxaNTQSAL_-JuIVlIIYZ8Hz0-BLYQFqFXfbfZwPGB8r_w2aV68LBQ4Azha_6VjFpzuog.woff2"
  },
  "/_fonts/p46ye7QJYZigWS9NxBzAV5e_BUySRlfICfSGvI1mCVQ-KlK1XVsXVeMzr2xkcxXBQ_wbBzFG9sT07_8gudAsQnk.woff2": {
    "type": "font/woff2",
    "etag": "\"2c00-spkTbMVmtJAmS6gMYwsDcdzMztM\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 11264,
    "path": "../public/_fonts/p46ye7QJYZigWS9NxBzAV5e_BUySRlfICfSGvI1mCVQ-KlK1XVsXVeMzr2xkcxXBQ_wbBzFG9sT07_8gudAsQnk.woff2"
  },
  "/_fonts/rSEhDWkMiPN2flMh4M_09qdh7svtVQktuX_w7fazWhA-d1FJN7hu7J5BGFByYYvHs0GNpDpdVCyjT_H9EUglEVo.woff2": {
    "type": "font/woff2",
    "etag": "\"2d24-c71olG+ky2sxe6s9+WlKmdR3u2I\"",
    "mtime": "2026-04-04T20:23:28.720Z",
    "size": 11556,
    "path": "../public/_fonts/rSEhDWkMiPN2flMh4M_09qdh7svtVQktuX_w7fazWhA-d1FJN7hu7J5BGFByYYvHs0GNpDpdVCyjT_H9EUglEVo.woff2"
  },
  "/_nuxt/004TjaU8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f1-hYKX3oaiCXp4N00sV2Fdn2+CbhE\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 2289,
    "path": "../public/_nuxt/004TjaU8.js"
  },
  "/_nuxt/1BFPVFf7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4999-HCxXMZpO7sVFCRhQbmk/9tpNfdM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 18841,
    "path": "../public/_nuxt/1BFPVFf7.js"
  },
  "/_nuxt/0OtJH9pz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f4b-N2NlaaqKqjhsLcB4yloCxGu917o\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 16203,
    "path": "../public/_nuxt/0OtJH9pz.js"
  },
  "/_nuxt/2I1Z_MbQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a9-B7K2ePpC4+eFRa9mkvRTxZ3JGOk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1193,
    "path": "../public/_nuxt/2I1Z_MbQ.js"
  },
  "/_nuxt/3yhKEqUc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"520-ssHF5IY+5iWLbgN6js8kgu0mU8c\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1312,
    "path": "../public/_nuxt/3yhKEqUc.js"
  },
  "/_nuxt/3oVUf7kF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3252-rAtuWH0PW51VZdu2G9qlpfxp/kM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 12882,
    "path": "../public/_nuxt/3oVUf7kF.js"
  },
  "/_nuxt/561R1XSU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f30-JgYA8ZzMurEcdy1O36GTEvGtKo0\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 7984,
    "path": "../public/_nuxt/561R1XSU.js"
  },
  "/_nuxt/84u2-mrf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14dd-osiF5BHi0Drhmw/Wwt5pHmnhGIo\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5341,
    "path": "../public/_nuxt/84u2-mrf.js"
  },
  "/_nuxt/9YSRZU0I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c712-jtJ0wCb9/9942aqTT4TLeJdCdDI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 50962,
    "path": "../public/_nuxt/9YSRZU0I.js"
  },
  "/_nuxt/9xirQoWJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e6c-YWyAk+K5aQyliAh6e82MLz114HA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 3692,
    "path": "../public/_nuxt/9xirQoWJ.js"
  },
  "/_nuxt/B1TPWM--.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"699-x4t9mt2xm7tuB2rfOP42I7AL2hQ\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1689,
    "path": "../public/_nuxt/B1TPWM--.js"
  },
  "/_nuxt/B1vxDUO6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44d-1NibdVh1WRagyvms4wGMCFxGlUU\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1101,
    "path": "../public/_nuxt/B1vxDUO6.js"
  },
  "/_nuxt/B2RhjdKV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"492b-PTTOQU5zybFblHZkco3UZT7pbJg\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 18731,
    "path": "../public/_nuxt/B2RhjdKV.js"
  },
  "/_nuxt/B6otPCdb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c4-1Fwy9bLtc+18RkY8sd3KT7DqE04\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1476,
    "path": "../public/_nuxt/B6otPCdb.js"
  },
  "/_nuxt/B3BklLOi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"57b-4EOTSQ1OAjvH4G2M2OUJMxrNhbk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1403,
    "path": "../public/_nuxt/B3BklLOi.js"
  },
  "/_nuxt/B7MIcbei.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"79-Ocq5pbNwLN9IIWwKfG5kvw0Ez5E\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 121,
    "path": "../public/_nuxt/B7MIcbei.js"
  },
  "/_nuxt/B8iLdbf-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"298-jDHoGgo9DKNEb2RmZ3JQGgCZ7xM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 664,
    "path": "../public/_nuxt/B8iLdbf-.js"
  },
  "/_nuxt/B9AQ-fRR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1772-nRqh711oMMvX5V7A6TuOLxtsC4g\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 6002,
    "path": "../public/_nuxt/B9AQ-fRR.js"
  },
  "/_nuxt/B9eo2APe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"922-0FtxvwXAoCJ8r79DE75akgeY9f8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 2338,
    "path": "../public/_nuxt/B9eo2APe.js"
  },
  "/_nuxt/BEf3Vy1j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2822-kFupJW2RXJtPXBfaQA0lxRP8nxE\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 10274,
    "path": "../public/_nuxt/BEf3Vy1j.js"
  },
  "/_nuxt/BH8bv5mS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e24-wgG4tIflOPQV4G9WIGz7Hod5jMI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 7716,
    "path": "../public/_nuxt/BH8bv5mS.js"
  },
  "/_nuxt/BIyQqva0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1090-3EH5fDRK7oHMRPimfFlbzUJnxM8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 4240,
    "path": "../public/_nuxt/BIyQqva0.js"
  },
  "/_nuxt/BK_Edd3H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"49f-CD+uIseGkXnqdxQk5GKHZlyA5WM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1183,
    "path": "../public/_nuxt/BK_Edd3H.js"
  },
  "/_nuxt/BKcfQjN0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4b1-emCJ5TuTU2kB2m/gp3ail1znGlQ\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1201,
    "path": "../public/_nuxt/BKcfQjN0.js"
  },
  "/_nuxt/BKk5HYGT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15db-3V07tA6i8OxxdYPKco/fWZaIxvI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5595,
    "path": "../public/_nuxt/BKk5HYGT.js"
  },
  "/_nuxt/BLgv7XfK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f48-IxnTDveyaX9I0D9si53x6d/WaqU\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 3912,
    "path": "../public/_nuxt/BLgv7XfK.js"
  },
  "/_nuxt/BKlXf-_x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f82-GfNfLS93X/xWPqpcw4RYYHvKnRc\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 12162,
    "path": "../public/_nuxt/BKlXf-_x.js"
  },
  "/_nuxt/BMGTuxmj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f9a-w62pNXmn043FoDkNZNxgjV9N0QU\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 8090,
    "path": "../public/_nuxt/BMGTuxmj.js"
  },
  "/_nuxt/BNy3dulK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"162b-dxM9aHLQUhR8KNjdkuQZ3Np7LsI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5675,
    "path": "../public/_nuxt/BNy3dulK.js"
  },
  "/_nuxt/BP5V6d4A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4af-NzLXHJBhRAptAAsmW+KuhZ159Vc\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1199,
    "path": "../public/_nuxt/BP5V6d4A.js"
  },
  "/_nuxt/BPou6PVN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ce6-G8KxRyw0Rhm53lUTKnUZYRvsGgk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 3302,
    "path": "../public/_nuxt/BPou6PVN.js"
  },
  "/_nuxt/BQfVG_fK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e5a-hVvvRTBMvSTrH1E+cwc+TKxaEbE\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 7770,
    "path": "../public/_nuxt/BQfVG_fK.js"
  },
  "/_nuxt/BRT9-TyK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"116-k90XXQJO2BurENBHeZylAARcGUE\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 278,
    "path": "../public/_nuxt/BRT9-TyK.js"
  },
  "/_nuxt/BTNCBAF7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25de-z9J0lB14FXpdDpDp9Nb/8c+VMBM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 9694,
    "path": "../public/_nuxt/BTNCBAF7.js"
  },
  "/_nuxt/BU0hGsbt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"148f-kQPBG9AQ1BpsTTdBXF6MzP9xaO8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5263,
    "path": "../public/_nuxt/BU0hGsbt.js"
  },
  "/_nuxt/BU1ycW34.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cd-4Inj7sdrW+CgtOmA3Swby8Fddmk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 205,
    "path": "../public/_nuxt/BU1ycW34.js"
  },
  "/_nuxt/BY2hDTvM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b9-xkwh3jEfaEsh2wRNPuD7cYRz7N8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 185,
    "path": "../public/_nuxt/BY2hDTvM.js"
  },
  "/_nuxt/BXE35u4_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13f8-48unVaI4gPh7O+X09wTZJ4aKYZA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5112,
    "path": "../public/_nuxt/BXE35u4_.js"
  },
  "/_nuxt/BYWMYGJA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"691-bYOhtxokvE9/6pGy3FRGY8irTBI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1681,
    "path": "../public/_nuxt/BYWMYGJA.js"
  },
  "/_nuxt/BZK8LdG1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2bd-QNqsY+HhjyCWOjqXX/SMwTbFlag\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 701,
    "path": "../public/_nuxt/BZK8LdG1.js"
  },
  "/_nuxt/BeJ69-_e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d4a-v2a4/E3pq/06zlCDMd2UEj2v/QI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 7498,
    "path": "../public/_nuxt/BeJ69-_e.js"
  },
  "/_nuxt/BeUN6sVc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16d8-ZozWBfO5vbcBYOTcuogBk47wYrw\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5848,
    "path": "../public/_nuxt/BeUN6sVc.js"
  },
  "/_nuxt/BgHx4NLE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"134-CS+0jJUyHtOhublY6Iodlc5uCj4\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 308,
    "path": "../public/_nuxt/BgHx4NLE.js"
  },
  "/_nuxt/BgzNFOb4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e99-JRDW3KTAIPtywYocQ4HRUIkAU54\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 7833,
    "path": "../public/_nuxt/BgzNFOb4.js"
  },
  "/_nuxt/BiaGQ0s4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"508-YwRAuvce31WgqZhuFtPkjgYGTNE\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1288,
    "path": "../public/_nuxt/BiaGQ0s4.js"
  },
  "/_nuxt/Bj84SgNQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4f5-NiPzr4G9hBhI1JTxWLi1j/aQh/8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1269,
    "path": "../public/_nuxt/Bj84SgNQ.js"
  },
  "/_nuxt/BjT2lL6K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"169c-DVnQ0dh3l2pdyG0nMUuHUg9aFsc\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5788,
    "path": "../public/_nuxt/BjT2lL6K.js"
  },
  "/_nuxt/BkQ5gPgU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ac9-WhxhDieKKNTA4AdwjiJz/ZOSlCI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 6857,
    "path": "../public/_nuxt/BkQ5gPgU.js"
  },
  "/_nuxt/BktQY9NB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c75-MPAgCWid4+3SVi0n7oty9YdROmg\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 11381,
    "path": "../public/_nuxt/BktQY9NB.js"
  },
  "/_nuxt/Bl7P2AMq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29ca-CjYcEwYRBYyH+Go91OGmqrUe6iI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 10698,
    "path": "../public/_nuxt/Bl7P2AMq.js"
  },
  "/_nuxt/BqfqNZkW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ab-hygnuWPCAQel4ecLe78PjnbyvkA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 683,
    "path": "../public/_nuxt/BqfqNZkW.js"
  },
  "/_nuxt/Br2mXmtO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"109a-+JEhv3mrsN5iVZVaqhaGkLwk+Bw\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 4250,
    "path": "../public/_nuxt/Br2mXmtO.js"
  },
  "/_nuxt/Bse2XX0S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a1c-xNzjllPpI/wmFfqB9+wwMLy2Qmk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 2588,
    "path": "../public/_nuxt/Bse2XX0S.js"
  },
  "/_nuxt/BtxqwatG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"345-A3DcRCiIG7c332kywPKxZhJ6k+Q\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 837,
    "path": "../public/_nuxt/BtxqwatG.js"
  },
  "/_nuxt/BstbYvQo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75-50qBYYv7flmkKj5C5Y4k5pKiEsU\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 117,
    "path": "../public/_nuxt/BstbYvQo.js"
  },
  "/_nuxt/BwETPZu7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3199-47Q0y+Iu0cQiAdpQuHzoKoKlsM8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 12697,
    "path": "../public/_nuxt/BwETPZu7.js"
  },
  "/_nuxt/BwOgC41x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b4-PJ4mdNE6jW3icdRVRKY1hsdMBrQ\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 180,
    "path": "../public/_nuxt/BwOgC41x.js"
  },
  "/_nuxt/BxZIFFI2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18c-10yhPDhjmEKFVgCGG7kkuMuETdo\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 396,
    "path": "../public/_nuxt/BxZIFFI2.js"
  },
  "/_nuxt/BzF_8ENJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"46c-8lpWbJhnaEVIx4KSBqMFZSpd6xA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1132,
    "path": "../public/_nuxt/BzF_8ENJ.js"
  },
  "/_nuxt/C-phvrw6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ad7-MMfrEB9rYRzsz1fMYyoFfaCTXWA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 15063,
    "path": "../public/_nuxt/C-phvrw6.js"
  },
  "/_nuxt/C0B8Gt8d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9fa-W9NX6kejYHyCfntOoK71ELYnUZ0\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 2554,
    "path": "../public/_nuxt/C0B8Gt8d.js"
  },
  "/_nuxt/C4-d67Ul.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"243b-wKHdzgs85uLfKhV+n5nSXwc0sYg\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 9275,
    "path": "../public/_nuxt/C4-d67Ul.js"
  },
  "/_nuxt/C6a5AHMW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18ba-tJdXaEQFzbfyQhz++OJVqBE+/Zo\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 6330,
    "path": "../public/_nuxt/C6a5AHMW.js"
  },
  "/_nuxt/C4fjWzrV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"631a-0Jhv/geRBwW899tMEQ4nhjd65no\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 25370,
    "path": "../public/_nuxt/C4fjWzrV.js"
  },
  "/_nuxt/C6wuWZa0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1583-+kGpPe+Yfgz0KBwJx8Thi7p0kjA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5507,
    "path": "../public/_nuxt/C6wuWZa0.js"
  },
  "/_nuxt/C7MXWWZr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"139d-lIyknAWh9kiDfxyvs9RicVKppig\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 5021,
    "path": "../public/_nuxt/C7MXWWZr.js"
  },
  "/_nuxt/C7cnwJJK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7ae-pbBC9M4jOT5enhUieiiv+0GTfUg\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1966,
    "path": "../public/_nuxt/C7cnwJJK.js"
  },
  "/_nuxt/C414gmLX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8bb8-+z0c+Inei8d0v53Q339yIVRyLQQ\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 35768,
    "path": "../public/_nuxt/C414gmLX.js"
  },
  "/_nuxt/C7yBNG9r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"132f-phJcvi4FXaWPRPXAdnkVUutwvIo\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 4911,
    "path": "../public/_nuxt/C7yBNG9r.js"
  },
  "/_nuxt/CB4jDrHN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f76-R/OAMbPollJQ9Jx3n45cHE9hcCc\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 8054,
    "path": "../public/_nuxt/CB4jDrHN.js"
  },
  "/_nuxt/CB6uQmCH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"253-DLL1UZoDX3mN99R1K7k8Wia79sk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 595,
    "path": "../public/_nuxt/CB6uQmCH.js"
  },
  "/_nuxt/CBO0j1Qu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2551-rt/peV7PbBmMIJcYEs23d/t7VTs\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 9553,
    "path": "../public/_nuxt/CBO0j1Qu.js"
  },
  "/_nuxt/CBOkwgr2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29a3-vzR2PQCR81FUtRv7t30ZS3mjpyc\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 10659,
    "path": "../public/_nuxt/CBOkwgr2.js"
  },
  "/_nuxt/CBjACgJx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b9-X6s5sM8j1poZ5vagEVjoipCBw+U\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 441,
    "path": "../public/_nuxt/CBjACgJx.js"
  },
  "/_nuxt/CEDVWyhe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36bc-OKC7gglKKE6RdZWpWQPbFd/TNwc\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 14012,
    "path": "../public/_nuxt/CEDVWyhe.js"
  },
  "/_nuxt/CGBp5IeO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c76-m/IH6g0LtA92wnuoCmc4hbGQiWk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 7286,
    "path": "../public/_nuxt/CGBp5IeO.js"
  },
  "/_nuxt/CGfGUZba.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3bcd-npoh1Doxm57rIQD0iYG8opj/sT4\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 15309,
    "path": "../public/_nuxt/CGfGUZba.js"
  },
  "/_nuxt/CK5SC5l8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"59-8pZAcswaoQMLxWmKMoAviDSzacQ\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 89,
    "path": "../public/_nuxt/CK5SC5l8.js"
  },
  "/_nuxt/CKTgbkdb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"201-u+9Xgf+BFUSAS5qBCwHrAwGcPp4\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 513,
    "path": "../public/_nuxt/CKTgbkdb.js"
  },
  "/_nuxt/CL7TdaOA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20ad-1PZV728LswwWyqik5u0q1RMpjHo\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 8365,
    "path": "../public/_nuxt/CL7TdaOA.js"
  },
  "/_nuxt/CLi5P4rN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ee-5H6VGxCYCk0GrvRniOO3LEdUpNM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1006,
    "path": "../public/_nuxt/CLi5P4rN.js"
  },
  "/_nuxt/CMzIe-Kd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1056-4I6udvJY8ezH9byoFxmzGUNPREA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 4182,
    "path": "../public/_nuxt/CMzIe-Kd.js"
  },
  "/_nuxt/CPKTjwDA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"53c-PpC8H/eoh8qcx+WKkDgcljPmOY4\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1340,
    "path": "../public/_nuxt/CPKTjwDA.js"
  },
  "/_nuxt/CT3RmJgC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1374-8HBdMHgmOFbp4NXZzbkU0hyL1PI\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 4980,
    "path": "../public/_nuxt/CT3RmJgC.js"
  },
  "/_nuxt/CR8RSR7E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d3dd-Y31psuhr+DsjUeIwsVgyp5AMgpQ\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 185309,
    "path": "../public/_nuxt/CR8RSR7E.js"
  },
  "/_nuxt/CTam5H54.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4b4c-lGgGkm/2m/imOFO96hDt+sxxWq8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 19276,
    "path": "../public/_nuxt/CTam5H54.js"
  },
  "/_nuxt/CVlnfhOO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a15-6m8t1xFGz7G31H9CnFBTIvJLRyA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 10773,
    "path": "../public/_nuxt/CVlnfhOO.js"
  },
  "/_nuxt/CVovyBP4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"251c-TZW5XfylJUuJZqzlRUZuXnDZ6Xc\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 9500,
    "path": "../public/_nuxt/CVovyBP4.js"
  },
  "/_nuxt/CX0-DH27.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6d9-ElxLuBJTe5L7jA5FRn1dOkQR0cM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1753,
    "path": "../public/_nuxt/CX0-DH27.js"
  },
  "/_nuxt/CY708RyS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"129b-RA0AfjQ6ux/JlP6QCB+ZRQzHy9U\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 4763,
    "path": "../public/_nuxt/CY708RyS.js"
  },
  "/_nuxt/CX1174Mc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"56a0-Gr4i3ib01aZ6FflnFx9A7qmESlA\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 22176,
    "path": "../public/_nuxt/CX1174Mc.js"
  },
  "/_nuxt/CYo8IfuB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1019-Ol0tMRpumdkzvSw8bu6xPTubL28\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 4121,
    "path": "../public/_nuxt/CYo8IfuB.js"
  },
  "/_nuxt/C_2eTWph.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cf4-DHmgHMwSdjrMpop885AhoS8BxTM\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 7412,
    "path": "../public/_nuxt/C_2eTWph.js"
  },
  "/_nuxt/CY99oh6S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31dd-Ni1Ww20SQtSNTvkhf8SUB1zm8V8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 12765,
    "path": "../public/_nuxt/CY99oh6S.js"
  },
  "/_nuxt/C_FRMSJe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e89-aYOKSwSGoC2KpZjrs7/H4pWNXP4\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 3721,
    "path": "../public/_nuxt/C_FRMSJe.js"
  },
  "/_nuxt/Cg3rUC6m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e4-JZVZBTGU4PYfyozm/RrdIFy23Mk\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 484,
    "path": "../public/_nuxt/Cg3rUC6m.js"
  },
  "/_nuxt/CaTnBHTD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8d41-qTwpiexwI0qD4AqW9RR3VKb1f4c\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 36161,
    "path": "../public/_nuxt/CaTnBHTD.js"
  },
  "/_nuxt/CgS5PLSB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2e78-+Y7W/9K9gBBs99AjRnegxKcVLrE\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 11896,
    "path": "../public/_nuxt/CgS5PLSB.js"
  },
  "/_nuxt/CgUyTEXX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"414-N5K4PGTsvs9ofB3YsCxtmV+hmv8\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1044,
    "path": "../public/_nuxt/CgUyTEXX.js"
  },
  "/_nuxt/CiXH8W7-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b3b-JXUBU/WuYDKwgk2nhWZcFjrQ6F0\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 2875,
    "path": "../public/_nuxt/CiXH8W7-.js"
  },
  "/_nuxt/CkXQhrt5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"45d-aOavgb9CMSfmLhBQlDflsw7mH6Y\"",
    "mtime": "2026-04-04T20:23:28.731Z",
    "size": 1117,
    "path": "../public/_nuxt/CkXQhrt5.js"
  },
  "/_nuxt/CkiTQoVj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35c-0613WJImt+5Txflh5C5Iyh16glA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 860,
    "path": "../public/_nuxt/CkiTQoVj.js"
  },
  "/_nuxt/ClOS1TdB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21ad-SzN5T+7GqPHIrtUBU+RZtJjvAg0\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 8621,
    "path": "../public/_nuxt/ClOS1TdB.js"
  },
  "/_nuxt/ClVQrhzq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b37-ZTmnQDVIW8+HaZnxEMVdzzimqBE\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2871,
    "path": "../public/_nuxt/ClVQrhzq.js"
  },
  "/_nuxt/Cmi9y9z2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"385-KfdR4zxXQdX2iyDkIwVcUwZsQAs\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 901,
    "path": "../public/_nuxt/Cmi9y9z2.js"
  },
  "/_nuxt/Cn9vMa50.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"867-BE55U7AoBC6nwKzM/TFt6mKuWWI\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2151,
    "path": "../public/_nuxt/Cn9vMa50.js"
  },
  "/_nuxt/Cnyyup8y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1118-sEg728qY+KKj6ibwBG75cQDmgV8\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 4376,
    "path": "../public/_nuxt/Cnyyup8y.js"
  },
  "/_nuxt/CovN8vff.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"495-O4SFWcwLAqR1H9ne8cQw3u93lfU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1173,
    "path": "../public/_nuxt/CovN8vff.js"
  },
  "/_nuxt/CplqDxc-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2df2-K95BMRPwPSSHdQ7/3g1FlK2UvQw\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 11762,
    "path": "../public/_nuxt/CplqDxc-.js"
  },
  "/_nuxt/Cr9AYUoZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"512-7L0WsKROGVQO9zadg2pgreBDQ6Q\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1298,
    "path": "../public/_nuxt/Cr9AYUoZ.js"
  },
  "/_nuxt/Cr9N5oPL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a2f-rrdvuidSAq7VOt+/2cLKMhCWtVw\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 6703,
    "path": "../public/_nuxt/Cr9N5oPL.js"
  },
  "/_nuxt/CriqgHBA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8fd-XPuI4QaTQJyZ21LD+O33EmA3xDU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2301,
    "path": "../public/_nuxt/CriqgHBA.js"
  },
  "/_nuxt/CsIUHu4A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1478-nD5LwKb56r0h+NxVA6plXhdI6aI\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5240,
    "path": "../public/_nuxt/CsIUHu4A.js"
  },
  "/_nuxt/CsoACKgI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9f-nUSneRf4kMors/pr/k4SnBiYsAE\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 159,
    "path": "../public/_nuxt/CsoACKgI.js"
  },
  "/_nuxt/Csy03hSI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"60-B5yn0RO1TyXmadWtmOBM+SZVz9s\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 96,
    "path": "../public/_nuxt/Csy03hSI.js"
  },
  "/_nuxt/Ct_wdkJf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35d3-zwcyaHXXMCHJTiBauBgRoHLNRlU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 13779,
    "path": "../public/_nuxt/Ct_wdkJf.js"
  },
  "/_nuxt/CuPRPb5v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b4-Cuw92FncqI5DDBsDSFeO7E4YjpA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 180,
    "path": "../public/_nuxt/CuPRPb5v.js"
  },
  "/_nuxt/CsXdmqVw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cbf1-nBOAa1BrtY0O5dahbM5LnRNJaTY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 183281,
    "path": "../public/_nuxt/CsXdmqVw.js"
  },
  "/_nuxt/CundgqNg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"296-u0ygpsQhGNwcFIR7OugnihKzFdA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 662,
    "path": "../public/_nuxt/CundgqNg.js"
  },
  "/_nuxt/CvxL8w5O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"df6-S3pv5WQJ8hF7HKQrrro+aH/282s\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 3574,
    "path": "../public/_nuxt/CvxL8w5O.js"
  },
  "/_nuxt/Cx04ukex.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"205-f+I4VvumDLiwXlBO6KzJp/ezHAk\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 517,
    "path": "../public/_nuxt/Cx04ukex.js"
  },
  "/_nuxt/CyZUiJ3s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15bb-gpw66VunqqQSwt7/lt14TsGuJp4\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5563,
    "path": "../public/_nuxt/CyZUiJ3s.js"
  },
  "/_nuxt/CzW5icOm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"295-LW1nms+rJmKEPhM2Qwi2eIgbJOs\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 661,
    "path": "../public/_nuxt/CzW5icOm.js"
  },
  "/_nuxt/D2-tpj-9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f80-xe+dYehz4HX0HPaVLEPOkW+raXE\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 3968,
    "path": "../public/_nuxt/D2-tpj-9.js"
  },
  "/_nuxt/D0p2kez3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11d6-F6W5Wdi8rh29OQvHBaTptZiWbEg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 4566,
    "path": "../public/_nuxt/D0p2kez3.js"
  },
  "/_nuxt/D6mR_TlB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30a-+g1UyD6jXq9qaTF8Ml3KuM85XMM\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 778,
    "path": "../public/_nuxt/D6mR_TlB.js"
  },
  "/_nuxt/D7Cib_dY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"81b-4Sgf32IwkZn9hqT3iQkifbVOPCI\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2075,
    "path": "../public/_nuxt/D7Cib_dY.js"
  },
  "/_nuxt/D7T8xN0c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7f1-V+OfErZ7pcgJdzz2nBOSYOV6pOg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2033,
    "path": "../public/_nuxt/D7T8xN0c.js"
  },
  "/_nuxt/D7oyOS_L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21ff-FMspAULJWNyb7lDtqSC+yi/CdDE\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 8703,
    "path": "../public/_nuxt/D7oyOS_L.js"
  },
  "/_nuxt/D8S8_yjm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f0b-SnDlbDi3FsLKa5Bc0qaVYcMOLEA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 7947,
    "path": "../public/_nuxt/D8S8_yjm.js"
  },
  "/_nuxt/DDFOTKQC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b0-2lyKi+4T9I4meDEUHttAoSiNF9g\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 944,
    "path": "../public/_nuxt/DDFOTKQC.js"
  },
  "/_nuxt/DFq6QeHC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d91-Sv7J2yqUts709xQKE4SLo4aWMr8\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 11665,
    "path": "../public/_nuxt/DFq6QeHC.js"
  },
  "/_nuxt/DGoQIbt4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"500-9eORj2UG4IPHGGITTEUyC8vNGyE\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1280,
    "path": "../public/_nuxt/DGoQIbt4.js"
  },
  "/_nuxt/DGqrdeq9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cbc-Ka9cBkyDaN9fDRiC5+khIkJH864\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 3260,
    "path": "../public/_nuxt/DGqrdeq9.js"
  },
  "/_nuxt/DI7IyZJa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26ca-JHlkzGmADS+ktY3X5i/Qk1agJ8E\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 9930,
    "path": "../public/_nuxt/DI7IyZJa.js"
  },
  "/_nuxt/DJgIl-yD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"345-WKMBvL9jH8qL8GkiMQ5vn424iPg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 837,
    "path": "../public/_nuxt/DJgIl-yD.js"
  },
  "/_nuxt/DLtqUwqw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34c-aNrDitSmZRnsI6pt3w4ekYycDmA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 844,
    "path": "../public/_nuxt/DLtqUwqw.js"
  },
  "/_nuxt/DMA__p0R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"414-Rxs4XBrPBjixueP4+EtcIUUqKqc\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1044,
    "path": "../public/_nuxt/DMA__p0R.js"
  },
  "/_nuxt/DM5-kozI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7180-AixScva39AGwF7Vb5GjtFzxneQ8\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 29056,
    "path": "../public/_nuxt/DM5-kozI.js"
  },
  "/_nuxt/DNM1xuCg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9239-FEvsBWJ5E1oqx6fhfxWjZ8neSts\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 37433,
    "path": "../public/_nuxt/DNM1xuCg.js"
  },
  "/_nuxt/DQgwAW35.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b5-v4zg2SXXPijssnewiFy9Urx0zp4\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 949,
    "path": "../public/_nuxt/DQgwAW35.js"
  },
  "/_nuxt/DQHWEuQK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3369-zm/5Rz7dhjCdAm2bqGZVtMmW0o4\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 13161,
    "path": "../public/_nuxt/DQHWEuQK.js"
  },
  "/_nuxt/DR6vYxMu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ed-6EuhkzqaP5mU3U2HglKYCcrsuwc\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 237,
    "path": "../public/_nuxt/DR6vYxMu.js"
  },
  "/_nuxt/DUFSrvg5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ea3-ytwsgLlwlTX/1pH/uJPg5rU5I8A\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 7843,
    "path": "../public/_nuxt/DUFSrvg5.js"
  },
  "/_nuxt/DW4Gk2uG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"377-z2PHTsKJLI3ClKNgeGmr4MfQh4c\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 887,
    "path": "../public/_nuxt/DW4Gk2uG.js"
  },
  "/_nuxt/DXK0L0Nb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1967-ltatxghaB6g2j7t3blWqjZJnbCU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 6503,
    "path": "../public/_nuxt/DXK0L0Nb.js"
  },
  "/_nuxt/DZY4b178.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d9e-2Onpbt31eVw9fsbSEoT7WIQPhlU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 3486,
    "path": "../public/_nuxt/DZY4b178.js"
  },
  "/_nuxt/D_amvb_O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9ac-guV5+9WRzlmvxAtuJr0T+RkQREQ\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2476,
    "path": "../public/_nuxt/D_amvb_O.js"
  },
  "/_nuxt/DaOvOFR3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2935-6wkgeLLYwqUNDqfmSeArD5wDMMM\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 10549,
    "path": "../public/_nuxt/DaOvOFR3.js"
  },
  "/_nuxt/DcGkN3cA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"189f-lBgnOiNNAfyUkmDE/bxOh1lCUF4\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 6303,
    "path": "../public/_nuxt/DcGkN3cA.js"
  },
  "/_nuxt/DdtfQntb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d1f-Bkivd50z4sJfI4NotyEtB80Jbxc\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 7455,
    "path": "../public/_nuxt/DdtfQntb.js"
  },
  "/_nuxt/DemkjF28.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d6-83m2sy0psea/PR4424TLIqO1j+0\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 470,
    "path": "../public/_nuxt/DemkjF28.js"
  },
  "/_nuxt/DewKTyz3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"90-Etw4WNS+6AWAEUpdahnyeBp5RYc\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 144,
    "path": "../public/_nuxt/DewKTyz3.js"
  },
  "/_nuxt/DguxIbmn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18d4-6MiAejd5mbkSRShjjoEX/65geMI\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 6356,
    "path": "../public/_nuxt/DguxIbmn.js"
  },
  "/_nuxt/Div0kX3f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b9-m6ZmfsR6yFFFOc2GeY2a4W27XtM\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 697,
    "path": "../public/_nuxt/Div0kX3f.js"
  },
  "/_nuxt/DjJpnm5b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b9-x56oX8NGxomn8zX00W/oMDYZvlc\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 441,
    "path": "../public/_nuxt/DjJpnm5b.js"
  },
  "/_nuxt/Djol_QgO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"86c-7w54cMSupOIY82gA58cxxUp+bqA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2156,
    "path": "../public/_nuxt/Djol_QgO.js"
  },
  "/_nuxt/Dk6CkQdR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1404-QxrT95lL4F82H0kBEcIF3D/jW1o\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5124,
    "path": "../public/_nuxt/Dk6CkQdR.js"
  },
  "/_nuxt/DlAUqK2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b-eFCz/UrraTh721pgAl0VxBNR1es\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 91,
    "path": "../public/_nuxt/DlAUqK2U.js"
  },
  "/_nuxt/DkTukVUR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24d4f-JyBCTYS45TClAnkcrXNijE6zPQw\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 150863,
    "path": "../public/_nuxt/DkTukVUR.js"
  },
  "/_nuxt/DnSK7qkz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27dc-2WAQRF0wvuJVooQgCSD3a+W9lvA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 10204,
    "path": "../public/_nuxt/DnSK7qkz.js"
  },
  "/_nuxt/DoJcbi9H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29fa-gDYNpFXSq75CXPG/Iz0hlSpp6ZY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 10746,
    "path": "../public/_nuxt/DoJcbi9H.js"
  },
  "/_nuxt/DokFwXxQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35b7-G8mGggLQJh1phkKrcMhSH2736es\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 13751,
    "path": "../public/_nuxt/DokFwXxQ.js"
  },
  "/_nuxt/DokOO8h0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25c6-UOBNGKZklA8APxq7StSxbJHKWGs\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 9670,
    "path": "../public/_nuxt/DokOO8h0.js"
  },
  "/_nuxt/Dp-5Az4S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"502-Vp9Zs6W+rEu/CKo6CRNvJVLwpmg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1282,
    "path": "../public/_nuxt/Dp-5Az4S.js"
  },
  "/_nuxt/DttxZeAA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1309-PxzdmCEJNeQSlMteYAxHarLZ0HM\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 4873,
    "path": "../public/_nuxt/DttxZeAA.js"
  },
  "/_nuxt/Dv88SixD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d2-acfo6bMd+36hf1vma2ITu2gcUKU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 9170,
    "path": "../public/_nuxt/Dv88SixD.js"
  },
  "/_nuxt/DvScs5Sl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15f7-Jk/GrpC6B1ft8SOuOxm5+MURVR0\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5623,
    "path": "../public/_nuxt/DvScs5Sl.js"
  },
  "/_nuxt/DvYqBr81.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14b2-ipX6521Y3jMO/EEcomUWMpZH5YM\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5298,
    "path": "../public/_nuxt/DvYqBr81.js"
  },
  "/_nuxt/DykXtQ2P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37f8-s7nxNO3ZFCe4Pj3tggBLJcNtIYU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 14328,
    "path": "../public/_nuxt/DykXtQ2P.js"
  },
  "/_nuxt/Esi3qRnV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9dd-PgGT6C4mzoOdJSc268hKMJgNVlY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2525,
    "path": "../public/_nuxt/Esi3qRnV.js"
  },
  "/_nuxt/Gj8hekdE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eae-OKKuy+vqVn9YvoE7O6r9rNXnJ9Q\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 7854,
    "path": "../public/_nuxt/Gj8hekdE.js"
  },
  "/_nuxt/I2mSjlQr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ae7-HGVW8OPOUWtgtO8P3fcq2wsVjPg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 10983,
    "path": "../public/_nuxt/I2mSjlQr.js"
  },
  "/_nuxt/Irf1oUTg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a719-R6D5RNVXefUYLRz1q4uIHWPI2hg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 42777,
    "path": "../public/_nuxt/Irf1oUTg.js"
  },
  "/_nuxt/LRZkEW4a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5bb-tQ+aqFwQImg+mpUkkmGP8C9P1iw\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1467,
    "path": "../public/_nuxt/LRZkEW4a.js"
  },
  "/_nuxt/KUrkT5U0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4e31-DiQm9OobzmS2gmgWFEPGoUTw2AE\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 20017,
    "path": "../public/_nuxt/KUrkT5U0.js"
  },
  "/_nuxt/R-UouhLL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"865-9CsfYPj+lMUZ0DnM7BwPaZWnalM\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2149,
    "path": "../public/_nuxt/R-UouhLL.js"
  },
  "/_nuxt/Rd7HBTTH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"49c-ev4LEBJYrMz8FOoJqdDA/gfITyU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1180,
    "path": "../public/_nuxt/Rd7HBTTH.js"
  },
  "/_nuxt/SBJoyLAH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7de-YSwppP7w8LucjxACeLf0Svxzg+Q\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2014,
    "path": "../public/_nuxt/SBJoyLAH.js"
  },
  "/_nuxt/SWw72eNz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ba0-LDrheY+yPMPwEdLe1DfS2Mky4ec\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2976,
    "path": "../public/_nuxt/SWw72eNz.js"
  },
  "/_nuxt/SXavYHvY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1534-fb+WE7clOJd0m/u25sqVlD0W9hY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5428,
    "path": "../public/_nuxt/SXavYHvY.js"
  },
  "/_nuxt/SiteDatePicker.CVttKGEG.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5d21-hNNGElYPXhJlLInd4heVoO7aWAk\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 23841,
    "path": "../public/_nuxt/SiteDatePicker.CVttKGEG.css"
  },
  "/_nuxt/U9mFLMcu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"243a-pt4Ah16DhOJL58ogIw8ktid7tQA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 9274,
    "path": "../public/_nuxt/U9mFLMcu.js"
  },
  "/_nuxt/UOGI1_kH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c18-5lg+T8YLuQyEjx83fKQ3E51rIJg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 7192,
    "path": "../public/_nuxt/UOGI1_kH.js"
  },
  "/_nuxt/Prj0Dqqr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"69915-mrPJ0t7/xOQ1UZE8wK1p7PYc5aA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 432405,
    "path": "../public/_nuxt/Prj0Dqqr.js"
  },
  "/_nuxt/USXtQQnL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16be-f5026WsUHzmhWpqrncVRCpUZYwA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5822,
    "path": "../public/_nuxt/USXtQQnL.js"
  },
  "/_nuxt/UYKjT5Vj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"504-Q9DSpZZHHjNjASfRDmHQonW1neY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1284,
    "path": "../public/_nuxt/UYKjT5Vj.js"
  },
  "/_nuxt/Ui32-yxq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b877-fwq8kmu3KqpQJDBMxD10a8sDnmk\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 47223,
    "path": "../public/_nuxt/Ui32-yxq.js"
  },
  "/_nuxt/ePYfKAu2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"400-E69sLWk3/ZVrXe4zbt8cLAt6gYY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1024,
    "path": "../public/_nuxt/ePYfKAu2.js"
  },
  "/_nuxt/VwGZWo3e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10cf4-FGBdcdL0NGJ6eScBBMxJYevSzzc\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 68852,
    "path": "../public/_nuxt/VwGZWo3e.js"
  },
  "/_nuxt/eUpn-f5b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"803-U0gkQ6YWZhHC6qjfCcj5UMySBmA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2051,
    "path": "../public/_nuxt/eUpn-f5b.js"
  },
  "/_nuxt/fH80iY82.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6bd-eTyM+nh+/8wATRVuqTJ/CBkuWns\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1725,
    "path": "../public/_nuxt/fH80iY82.js"
  },
  "/_nuxt/fXMGs5Ve.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9d0-t1yoCoHzatMfebSc2lxKo+wnnHY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 2512,
    "path": "../public/_nuxt/fXMGs5Ve.js"
  },
  "/_nuxt/grid.f6USsIAA.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"54-2yPM/jlrPssMBq9ux4wj2m6PRGU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 84,
    "path": "../public/_nuxt/grid.f6USsIAA.css"
  },
  "/_nuxt/hgd2R5fl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d66-V9gUYrOMtWzDlwPAX4HpXk3YPPA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 11622,
    "path": "../public/_nuxt/hgd2R5fl.js"
  },
  "/_nuxt/inventory.BWr4bKkf.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7e-Ldsyyrr0tbOp4BkXmNvcsoiMd0E\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 126,
    "path": "../public/_nuxt/inventory.BWr4bKkf.css"
  },
  "/_nuxt/jW8mfXMO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5e1-nfzo4QAxMKB5cAVWtUH61ca4NzU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1505,
    "path": "../public/_nuxt/jW8mfXMO.js"
  },
  "/_nuxt/lzMK-uOb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23f7-fqgTGwEk8ikQojQ6ROUI8Vcc91o\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 9207,
    "path": "../public/_nuxt/lzMK-uOb.js"
  },
  "/_nuxt/mfV6AO0g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17d2-BThO33Q7SV0Qz0O9rFFO1YltU0g\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 6098,
    "path": "../public/_nuxt/mfV6AO0g.js"
  },
  "/_nuxt/oKqrv14m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"242a-ktTyl5y7gtkiiPU65Xs/Yi8divs\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 9258,
    "path": "../public/_nuxt/oKqrv14m.js"
  },
  "/_nuxt/pikw1gel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f7-LMHq0+myVfZtyhighBYqD8S9+IA\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 759,
    "path": "../public/_nuxt/pikw1gel.js"
  },
  "/_nuxt/entry.5nLDYqg0.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"44be0-mGT3iWLlx8SPIhHJlJ33d+d6SkY\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 281568,
    "path": "../public/_nuxt/entry.5nLDYqg0.css"
  },
  "/_nuxt/print.D8ZM0_s6.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a9-y4hKQmIyEazH6N7mw5F/UeBMUQ4\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 169,
    "path": "../public/_nuxt/print.D8ZM0_s6.css"
  },
  "/_nuxt/tAHLmhMY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c96-qwzJCPXMHvvwlfje4uhLHSvV75k\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 7318,
    "path": "../public/_nuxt/tAHLmhMY.js"
  },
  "/_nuxt/toydcvb5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2bfa-ESiziCtfgEw8lngb7hUQTwOQRBg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 11258,
    "path": "../public/_nuxt/toydcvb5.js"
  },
  "/_nuxt/tvDKzd2B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"299-uUd/RHd/E7J4XY4+fmrnG/En8z4\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 665,
    "path": "../public/_nuxt/tvDKzd2B.js"
  },
  "/_nuxt/y20SVIRH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1dd1-NVh4KumMnyNcDOEOXUc7RQYBmUg\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 7633,
    "path": "../public/_nuxt/y20SVIRH.js"
  },
  "/_nuxt/yOwBHRRs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16cb-4KHcxBN/Pqhwd9p6knvBvszASGU\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 5835,
    "path": "../public/_nuxt/yOwBHRRs.js"
  },
  "/_nuxt/zDFv9GtA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6ae-W7LDbnULfpyFvM4HFSeo3Z0uJT0\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 1710,
    "path": "../public/_nuxt/zDFv9GtA.js"
  },
  "/_nuxt/zN0rPGPX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d6-JW8CVCx5ffJ5oUoS34oLHyxd8QI\"",
    "mtime": "2026-04-04T20:23:28.732Z",
    "size": 726,
    "path": "../public/_nuxt/zN0rPGPX.js"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-BtP1hPR9eMMJPlDqgHpFURztmqQ\"",
    "mtime": "2026-04-04T20:23:28.718Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_ipx/f_webp&q_80&s_192x192/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"2400-OX7nft/Xj1nCdEUzRNijdZLYI1Q\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 9216,
    "path": "../public/_ipx/f_webp&q_80&s_192x192/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_192x96/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"164e-phOj2FuTYSQfEIvbCGangPLTT4g\"",
    "mtime": "2026-04-04T20:23:28.280Z",
    "size": 5710,
    "path": "../public/_ipx/f_webp&q_80&s_192x96/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_320x160/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"2c38-Y36vRgdA1ScaRxHpeT7IGMTykmQ\"",
    "mtime": "2026-04-04T20:23:28.273Z",
    "size": 11320,
    "path": "../public/_ipx/f_webp&q_80&s_320x160/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_112x56/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"b3a-BK0UbP+O8E5oP3Sb0J9sl4fZh5s\"",
    "mtime": "2026-04-04T20:23:28.271Z",
    "size": 2874,
    "path": "../public/_ipx/f_webp&q_80&s_112x56/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_1280x1536/images/cocktail.jpg": {
    "type": "image/webp",
    "etag": "\"13b2a-08q8fNaw7FvVLsaWyHO0PIQoJ5E\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 80682,
    "path": "../public/_ipx/f_webp&q_80&s_1280x1536/images/cocktail.jpg"
  },
  "/_ipx/f_webp&q_80&s_1280x1536/images/class.jpg": {
    "type": "image/webp",
    "etag": "\"20f02-tslt8Tbo5OueZjvpGcpUUjUyciw\"",
    "mtime": "2026-04-04T20:23:28.650Z",
    "size": 134914,
    "path": "../public/_ipx/f_webp&q_80&s_1280x1536/images/class.jpg"
  },
  "/_ipx/f_webp&q_80&s_224x112/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"1bba-FrpkScBebBCjoIjv1SlyzX52+ys\"",
    "mtime": "2026-04-04T20:23:28.273Z",
    "size": 7098,
    "path": "../public/_ipx/f_webp&q_80&s_224x112/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_384x192/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"3872-egqGt7Hd0YOl2lVQi2gxEyhVpKA\"",
    "mtime": "2026-04-04T20:23:28.541Z",
    "size": 14450,
    "path": "../public/_ipx/f_webp&q_80&s_384x192/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_338x406/images/absinthe.jpg": {
    "type": "image/webp",
    "etag": "\"48f0-F0GEVT3WBj7rWjy2LAixh1oQqYc\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 18672,
    "path": "../public/_ipx/f_webp&q_80&s_338x406/images/absinthe.jpg"
  },
  "/_ipx/f_webp&q_80&s_338x406/images/class.jpg": {
    "type": "image/webp",
    "etag": "\"4340-5vZh1LPAw+J+Ier+i+1HVgXtRgI\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 17216,
    "path": "../public/_ipx/f_webp&q_80&s_338x406/images/class.jpg"
  },
  "/_ipx/f_webp&q_80&s_338x406/images/cocktail.jpg": {
    "type": "image/webp",
    "etag": "\"38f6-G/PC3LtGDNJdg+TCL8OvgVU/AQg\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 14582,
    "path": "../public/_ipx/f_webp&q_80&s_338x406/images/cocktail.jpg"
  },
  "/_ipx/f_webp&q_80&s_1280x1536/images/absinthe.jpg": {
    "type": "image/webp",
    "etag": "\"1c1ca-0ke5L7SEpn214WhF84dcNDyRZoM\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 115146,
    "path": "../public/_ipx/f_webp&q_80&s_1280x1536/images/absinthe.jpg"
  },
  "/_ipx/f_webp&q_80&s_3840x2160/images/20231017_104945.jpg": {
    "type": "image/webp",
    "etag": "\"198e6-dmSqViV9JfLRYKeIT6+bIjDhBl8\"",
    "mtime": "2026-04-04T20:23:28.674Z",
    "size": 104678,
    "path": "../public/_ipx/f_webp&q_80&s_3840x2160/images/20231017_104945.jpg"
  },
  "/_ipx/f_webp&q_80&s_384x384/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"5992-bqz00vPQtL75FhpWW85jPuKCnNM\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 22930,
    "path": "../public/_ipx/f_webp&q_80&s_384x384/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_676x812/images/absinthe.jpg": {
    "type": "image/webp",
    "etag": "\"b85c-pWvtD0ezKXGFTAeaVkzAXedQB4c\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 47196,
    "path": "../public/_ipx/f_webp&q_80&s_676x812/images/absinthe.jpg"
  },
  "/_ipx/f_webp&q_80&s_3840x2160/images/hero.jpg": {
    "type": "image/webp",
    "etag": "\"1bdde-UQRW/NTKOnu/6vxkvZ5Q5cQTJmE\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 114142,
    "path": "../public/_ipx/f_webp&q_80&s_3840x2160/images/hero.jpg"
  },
  "/_ipx/f_webp&q_80&s_676x812/images/cocktail.jpg": {
    "type": "image/webp",
    "etag": "\"895c-mUELbjTKs0SdQsScNxJ2PDPa6dU\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 35164,
    "path": "../public/_ipx/f_webp&q_80&s_676x812/images/cocktail.jpg"
  },
  "/_ipx/f_webp&q_80&s_640x768/images/absinthe.jpg": {
    "type": "image/webp",
    "etag": "\"aa4e-98+iqNWyNy3OxnHbsnx5IY8TzqA\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 43598,
    "path": "../public/_ipx/f_webp&q_80&s_640x768/images/absinthe.jpg"
  },
  "/_ipx/f_webp&q_80&s_640x768/images/class.jpg": {
    "type": "image/webp",
    "etag": "\"a2be-su5Jw0CcRe70zAFWaI7tUzDlOlg\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 41662,
    "path": "../public/_ipx/f_webp&q_80&s_640x768/images/class.jpg"
  },
  "/_ipx/f_webp&q_80&s_676x812/images/class.jpg": {
    "type": "image/webp",
    "etag": "\"b48e-uktV2r1vK1uPV/FX/JHhEOZufsQ\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 46222,
    "path": "../public/_ipx/f_webp&q_80&s_676x812/images/class.jpg"
  },
  "/_ipx/f_webp&q_80&s_3840x2160/images/20231205_174024 (3).jpg": {
    "type": "image/webp",
    "etag": "\"4a55e-qPq6JqR6E0x0h3F9khHgLgqEyzA\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 304478,
    "path": "../public/_ipx/f_webp&q_80&s_3840x2160/images/20231205_174024 (3).jpg"
  },
  "/_ipx/f_webp&q_80&s_640x768/images/cocktail.jpg": {
    "type": "image/webp",
    "etag": "\"7fa0-4VqK4ULBs9k9R9nwi8zlOZfo8Eo\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 32672,
    "path": "../public/_ipx/f_webp&q_80&s_640x768/images/cocktail.jpg"
  },
  "/_ipx/f_webp&q_80&s_160x80/images/Logo.png": {
    "type": "image/webp",
    "etag": "\"11b4-v/geR/smwSGilZzOzWBtpwR56CQ\"",
    "mtime": "2026-04-04T20:23:28.273Z",
    "size": 4532,
    "path": "../public/_ipx/f_webp&q_80&s_160x80/images/Logo.png"
  },
  "/_ipx/f_webp&q_80&s_1920x1080/images/20231017_104945.jpg": {
    "type": "image/webp",
    "etag": "\"198e6-dmSqViV9JfLRYKeIT6+bIjDhBl8\"",
    "mtime": "2026-04-04T20:23:28.703Z",
    "size": 104678,
    "path": "../public/_ipx/f_webp&q_80&s_1920x1080/images/20231017_104945.jpg"
  },
  "/_ipx/f_webp&q_80&s_1920x1080/images/20231205_174024 (3).jpg": {
    "type": "image/webp",
    "etag": "\"4a55e-qPq6JqR6E0x0h3F9khHgLgqEyzA\"",
    "mtime": "2026-04-04T20:23:28.649Z",
    "size": 304478,
    "path": "../public/_ipx/f_webp&q_80&s_1920x1080/images/20231205_174024 (3).jpg"
  },
  "/_nuxt/builds/meta/03e3d530-f880-4e95-a4eb-7eb1e06d914a.json": {
    "type": "application/json",
    "etag": "\"7a-pidHUzoSjEBJbpk4PxltTJ0jkEQ\"",
    "mtime": "2026-04-04T20:23:28.717Z",
    "size": 122,
    "path": "../public/_nuxt/builds/meta/03e3d530-f880-4e95-a4eb-7eb1e06d914a.json"
  },
  "/_ipx/f_webp&q_80&s_1920x1080/images/hero.jpg": {
    "type": "image/webp",
    "etag": "\"1bdde-UQRW/NTKOnu/6vxkvZ5Q5cQTJmE\"",
    "mtime": "2026-04-04T20:23:28.648Z",
    "size": 114142,
    "path": "../public/_ipx/f_webp&q_80&s_1920x1080/images/hero.jpg"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve$1 = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_fonts/":{"maxAge":31536000},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _H8X7Hl = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _3ukuB7 = defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;
  const method = event.method;
  if (!path.startsWith("/api/")) {
    return;
  }
  const publicRoutes = [
    { path: "/api/auth/login", method: "POST" },
    { path: "/api/auth/logout", method: "POST" },
    { path: "/api/contact/create", method: "POST" },
    { path: "/api/contact/subscribe", method: "POST" },
    { path: "/api/contact/inquiry", method: "POST" },
    { path: "/api/event/request", method: "POST" },
    { path: "/api/square", method: "*" }
  ];
  const publicGetRoutes = ["/api/cocktail", "/api/bottle", "/api/item", "/api/auth/me", "/api/event/upcoming", "/api/event/public"];
  for (const route of publicRoutes) {
    if (path.startsWith(route.path) && (route.method === "*" || method === route.method)) {
      return;
    }
  }
  if (method === "GET") {
    for (const route of publicGetRoutes) {
      if (path.startsWith(route)) {
        return;
      }
    }
  }
  const session = await getAuthSession(event);
  if (!session.data.userId) {
    throw createError$1({
      status: 401,
      statusText: "Unauthorized"
    });
  }
});

const _SxA8c9 = defineEventHandler(() => {});

const collections = {
  'carbon': () => import('../_/icons.mjs').then(m => m.default),
  'logos': () => import('../_/icons2.mjs').then(m => m.default),
  'lucide': () => import('../_/icons3.mjs').then(m => m.default),
  'ri': () => import('../_/icons4.mjs').then(m => m.default),
  'tabler': () => import('../_/icons5.mjs').then(m => m.default),
};

const DEFAULT_ENDPOINT = "https://api.iconify.design";
const _R8lesc = defineCachedEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (!url)
    return createError$1({ status: 400, message: "Invalid icon request" });
  const options = useAppConfig().icon;
  const collectionName = event.context.params?.collection?.replace(/\.json$/, "");
  const collection = collectionName ? await collections[collectionName]?.() : null;
  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT;
  const icons = url.searchParams.get("icons")?.split(",");
  if (collection) {
    if (icons?.length) {
      const data = getIcons(
        collection,
        icons
      );
      consola.debug(`[Icon] serving ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from bundled collection`);
      return data;
    }
  }
  if (options.fallbackToApi === true || options.fallbackToApi === "server-only") {
    const apiUrl = new URL("./" + basename(url.pathname) + url.search, apiEndPoint);
    consola.debug(`[Icon] fetching ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from iconify api`);
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError$1({ status: 400, message: "Invalid icon request" });
    }
    try {
      const data = await $fetch(apiUrl.href);
      return data;
    } catch (e) {
      consola.error(e);
      if (e.status === 404)
        return createError$1({ status: 404 });
      else
        return createError$1({ status: 500, message: "Failed to fetch fallback icon" });
    }
  }
  return createError$1({ status: 404 });
}, {
  group: "nuxt",
  name: "icon",
  getKey(event) {
    const collection = event.context.params?.collection?.replace(/\.json$/, "") || "unknown";
    const icons = String(getQuery(event).icons || "");
    return `${collection}_${icons.split(",")[0]}_${icons.length}_${hash$1(icons)}`;
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7
  // 1 week
});

const _O3dEYj = eventHandler(async (e) => {
  if (e.context._initedSiteConfig)
    return;
  const runtimeConfig = useRuntimeConfig(e);
  const config = runtimeConfig["nuxt-site-config"];
  const nitroApp = useNitroApp();
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug
  });
  const nitroOrigin = getNitroOrigin(e);
  e.context.siteConfigNitroOrigin = nitroOrigin;
  {
    siteConfig.push({
      _context: "nitro:init",
      _priority: -4,
      url: nitroOrigin
    });
  }
  siteConfig.push({
    _context: "runtimeEnv",
    _priority: 0,
    ...runtimeConfig.site || {},
    ...runtimeConfig.public.site || {},
    ...envSiteConfig(globalThis._importMeta_.env || {})
    // just in-case, shouldn't be needed
  });
  const buildStack = config.stack || [];
  buildStack.forEach((c) => siteConfig.push(c));
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: "route-rules",
      ...e.context._nitro.routeRules.site
    });
  }
  if (config.multiTenancy) {
    const host = parseURL(nitroOrigin).host;
    const tenant = config.multiTenancy?.find((t) => t.hosts.includes(host));
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: 0,
        ...tenant.config
      });
    }
  }
  const ctx = { siteConfig, event: e };
  await nitroApp.hooks.callHook("site-config:init", ctx);
  e.context.siteConfig = ctx.siteConfig;
  e.context._initedSiteConfig = true;
});

const logger = createConsola({
  defaults: {
    tag: "@nuxt/sitemap"
  }
});
const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value))
    obj[key] = Array.from(/* @__PURE__ */ new Set([...obj[key], ...value]));
  return obj[key];
});
function mergeOnKey(arr, key) {
  const seen = /* @__PURE__ */ new Map();
  let resultLength = 0;
  const result = Array.from({ length: arr.length });
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) {
      const existingIndex = seen.get(k);
      result[existingIndex] = merger(item, result[existingIndex]);
    } else {
      seen.set(k, resultLength);
      result[resultLength++] = item;
    }
  }
  result.length = resultLength;
  return result;
}
function splitForLocales(path, locales) {
  const prefix = withLeadingSlash(path).split("/")[1];
  if (prefix && locales.includes(prefix))
    return [prefix, path.replace(`/${prefix}`, "")];
  return [null, path];
}
const StringifiedRegExpPattern = /\/(.*?)\/([gimsuy]*)$/;
function normalizeRuntimeFilters(input) {
  return (input || []).map((rule) => {
    if (rule instanceof RegExp || typeof rule === "string")
      return rule;
    const match = rule.regex.match(StringifiedRegExpPattern);
    if (match)
      return new RegExp(match[1], match[2]);
    return false;
  }).filter(Boolean);
}
function createPathFilter(options = {}) {
  const urlFilter = createFilter(options);
  return (loc) => {
    let path = loc;
    try {
      path = parseURL(loc).pathname;
    } catch {
      return false;
    }
    return urlFilter(path);
  };
}
function findPageMapping(pathWithoutPrefix, pages) {
  const stripped = pathWithoutPrefix[0] === "/" ? pathWithoutPrefix.slice(1) : pathWithoutPrefix;
  const pageKey = stripped.endsWith("/index") ? stripped.slice(0, -6) || "index" : stripped || "index";
  if (pages[pageKey])
    return { mappings: pages[pageKey], paramSegments: [] };
  const sortedKeys = Object.keys(pages).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (pageKey.startsWith(key + "/")) {
      const paramPath = pageKey.slice(key.length + 1);
      return { mappings: pages[key], paramSegments: paramPath.split("/") };
    }
  }
  return null;
}
function applyDynamicParams(customPath, paramSegments) {
  if (!paramSegments.length)
    return customPath;
  let i = 0;
  return customPath.replace(/\[[^\]]+\]/g, () => paramSegments[i++] || "");
}
function createFilter(options = {}) {
  const include = options.include || [];
  const exclude = options.exclude || [];
  if (include.length === 0 && exclude.length === 0)
    return () => true;
  const excludeRegex = exclude.filter((r) => r instanceof RegExp);
  const includeRegex = include.filter((r) => r instanceof RegExp);
  const excludeStrings = exclude.filter((r) => typeof r === "string");
  const includeStrings = include.filter((r) => typeof r === "string");
  const excludeMatcher = excludeStrings.length > 0 ? toRouteMatcher(createRouter$1({
    routes: Object.fromEntries(excludeStrings.map((r) => [r, true])),
    strictTrailingSlash: false
  })) : null;
  const includeMatcher = includeStrings.length > 0 ? toRouteMatcher(createRouter$1({
    routes: Object.fromEntries(includeStrings.map((r) => [r, true])),
    strictTrailingSlash: false
  })) : null;
  const excludeExact = new Set(excludeStrings);
  const includeExact = new Set(includeStrings);
  return function(path) {
    if (excludeRegex.some((r) => r.test(path)))
      return false;
    if (excludeExact.has(path))
      return false;
    if (excludeMatcher && excludeMatcher.matchAll(path).length > 0)
      return false;
    if (includeRegex.some((r) => r.test(path)))
      return true;
    if (includeExact.has(path))
      return true;
    if (includeMatcher && includeMatcher.matchAll(path).length > 0)
      return true;
    return include.length === 0;
  };
}

function xmlEscape(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function useSitemapRuntimeConfig(e) {
  const clone = JSON.parse(JSON.stringify(useRuntimeConfig(e).sitemap));
  for (const k in clone.sitemaps) {
    const sitemap = clone.sitemaps[k];
    sitemap.include = normalizeRuntimeFilters(sitemap.include);
    sitemap.exclude = normalizeRuntimeFilters(sitemap.exclude);
    clone.sitemaps[k] = sitemap;
  }
  return Object.freeze(clone);
}

const _QbdIe0 = defineEventHandler(async (e) => {
  const fixPath = createSitePathResolver(e, { absolute: false, withBase: true });
  const { sitemapName: fallbackSitemapName, cacheMaxAgeSeconds, version, xslColumns, xslTips } = useSitemapRuntimeConfig();
  setHeader(e, "Content-Type", "application/xslt+xml");
  if (cacheMaxAgeSeconds)
    setHeader(e, "Cache-Control", `public, max-age=${cacheMaxAgeSeconds}, must-revalidate`);
  else
    setHeader(e, "Cache-Control", `no-cache, no-store`);
  const { name: siteName, url: siteUrl } = useSiteConfig(e);
  const referrer = getHeader(e, "Referer") || "/";
  const referrerPath = parseURL(referrer).pathname;
  const isNotIndexButHasIndex = referrerPath !== "/sitemap.xml" && referrerPath !== "/sitemap_index.xml" && referrerPath.endsWith(".xml");
  const sitemapName = parseURL(referrer).pathname.split("/").pop()?.split("-sitemap")[0] || fallbackSitemapName;
  const title = `${siteName}${sitemapName !== "sitemap.xml" ? ` - ${sitemapName === "sitemap_index.xml" ? "index" : sitemapName}` : ""}`.replace(/&/g, "&amp;");
  getQuery$1(referrer).canonical;
  const debugUrl = xmlEscape(withQuery("/__sitemap__/debug.json", { sitemap: sitemapName }));
  xmlEscape(referrerPath);
  xmlEscape(withQuery(referrerPath, { canonical: "" }));
  const fetchErrors = [];
  const xslQuery = getQuery(e);
  if (xslQuery.error_messages) {
    const errorMessages = xslQuery.error_messages;
    const errorUrls = xslQuery.error_urls;
    if (errorMessages) {
      const messages = Array.isArray(errorMessages) ? errorMessages : [errorMessages];
      const urls = Array.isArray(errorUrls) ? errorUrls : errorUrls ? [errorUrls] : [];
      messages.forEach((msg, i) => {
        const errorParts = [xmlEscape(msg)];
        if (urls[i])
          errorParts.push(xmlEscape(urls[i]));
        fetchErrors.push(`<span class="error-item">${errorParts.join(" \u2014 ")}</span>`);
      });
    }
  }
  const hasRuntimeErrors = fetchErrors.length > 0;
  let columns = [...xslColumns];
  if (!columns.length) {
    columns = [
      { label: "URL", width: "50%" },
      { label: "Images", width: "25%", select: "count(image:image)" },
      { label: "Last Updated", width: "25%", select: "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))" }
    ];
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          :root {
            --accent: #00dc82;
            --accent-hover: #00b86b;
            --bg: #0a0a0a;
            --bg-elevated: #141414;
            --bg-subtle: #1a1a1a;
            --border: #262626;
            --border-subtle: #1f1f1f;
            --text: #e5e5e5;
            --text-muted: #737373;
            --text-faint: #525252;
            --error: #ef4444;
            --error-bg: rgba(239,68,68,0.1);
            --warning: #f59e0b;
          }
          * { box-sizing: border-box; }
          body {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
            font-size: 13px;
            color: var(--text);
            background: var(--bg);
            margin: 0;
            padding: 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          a { color: inherit; transition: color 0.15s; }
          a:hover { color: var(--accent); }

          /* Debug bar (dev only) */
          .debug-bar {
            position: fixed;
            bottom: 0.75rem;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0 1rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 100;
            font-size: 11px;
          }
          .debug-bar-brand {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            text-decoration: none;
          }
          .debug-bar-brand:hover { color: var(--text); }
          .debug-bar-brand svg { flex-shrink: 0; }
          .debug-bar-hint {
            color: var(--text-faint);
            margin-right: auto;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .debug-bar-hint code {
            background: var(--bg-subtle);
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-size: 10px;
          }
          .mode-badge {
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
          }
          .mode-dev { background: rgba(245,158,11,0.15); color: var(--warning); }
          .mode-prod { background: rgba(0,220,130,0.12); color: var(--accent); }
          .mode-toggle {
            display: inline-flex;
            border-radius: 4px;
            overflow: hidden;
            background: var(--bg-subtle);
            padding: 2px;
            gap: 1px;
          }
          .mode-toggle a {
            padding: 0.2rem 0.4rem;
            font-size: 9px;
            font-weight: 500;
            text-decoration: none;
            color: var(--text-muted);
            border-radius: 2px;
            transition: all 0.15s;
          }
          .mode-toggle a:hover { color: var(--text); }
          .mode-toggle a.active {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-size: 10px;
            font-weight: 500;
            transition: all 0.15s;
          }
          .btn-primary {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn-primary:hover { background: var(--accent-hover); color: #0a0a0a; }
          .btn svg { width: 12px; height: 12px; }

          /* Error banner */
          .error-banner {
            background: var(--error-bg);
            border-bottom: 1px solid rgba(239,68,68,0.2);
            padding: 0.75rem 1.5rem;
            color: #fca5a5;
            font-size: 12px;
          }
          .error-banner strong { color: var(--error); }
          .error-item { display: block; margin-top: 0.375rem; color: #fca5a5; }
          .error-debug-link {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.625rem;
            padding: 0.25rem 0.5rem;
            background: var(--error);
            color: #fff;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.15s;
          }
          .error-debug-link:hover { background: #dc2626; color: #fff; }

          /* Main content */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
          }
          .header {
            margin-bottom: 1.25rem;
          }
          .header h1 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 0.25rem 0;
            color: var(--text);
          }
          .header-meta {
            color: var(--text-muted);
            font-size: 12px;
          }
          .header-meta a {
            color: var(--text-muted);
            text-decoration: underline;
            text-decoration-color: var(--border);
            text-underline-offset: 2px;
          }
          .header-meta a:hover { color: var(--accent); text-decoration-color: var(--accent); }

          /* Table */
          .table-wrap {
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-elevated);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            padding: 0.625rem 1rem;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            background: var(--bg-subtle);
            border-bottom: 1px solid var(--border);
          }
          td {
            padding: 0.5rem 1rem;
            border-bottom: 1px solid var(--border-subtle);
            font-size: 12px;
            color: var(--text);
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: rgba(255,255,255,0.02); }
          td a {
            text-decoration: none;
            word-break: break-all;
            color: var(--text);
          }
          td a:hover { color: var(--accent); }
          .inline-warning {
            font-size: 11px;
            color: var(--warning);
            margin-top: 0.25rem;
            line-height: 1.4;
          }
          .inline-warning::before {
            content: "\u26A0 ";
          }
          .count {
            display: inline-block;
            min-width: 1.25rem;
            padding: 0.125rem 0.375rem;
            background: var(--bg-subtle);
            border-radius: 4px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
            font-variant-numeric: tabular-nums;
          }
          .count:empty::before { content: "0"; }

          /* Light mode */
          @media (prefers-color-scheme: light) {
            :root {
              --accent: #00a963;
              --accent-hover: #008f54;
              --bg: #ffffff;
              --bg-elevated: #f5f5f5;
              --bg-subtle: #ebebeb;
              --border: #d4d4d4;
              --border-subtle: #e5e5e5;
              --text: #171717;
              --text-muted: #525252;
              --text-faint: #737373;
              --error: #dc2626;
              --error-bg: rgba(220,38,38,0.08);
              --warning: #b45309;
            }
            tr:hover td { background: rgba(0,0,0,0.02); }
            .btn-primary { color: #fff; }
            .btn-primary:hover { color: #fff; }
            .mode-toggle a.active { color: #fff; }
            .error-banner { color: #991b1b; }
            .error-item { color: #b91c1c; }
            .error-debug-link { color: #fff; }
            .error-debug-link:hover { color: #fff; }
          }

          .debug-bar-version {
            color: var(--text-faint);
            font-size: 10px;
          }

          /* Responsive */
          @media (max-width: 640px) {
            .debug-bar { padding: 0 0.75rem; gap: 0.5rem; width: 95%; }
            .debug-bar-brand span { display: none; }
            .debug-bar-hint { display: none; }
            .debug-bar-version { display: none; }
            .mode-badge { display: none; }
            .container { padding: 1rem; }
            th, td { padding: 0.5rem 0.75rem; }
          }
          ${""}
        </style>
      </head>
      <body>
        ${hasRuntimeErrors ? `<div class="error-banner">
            <strong>Sitemap Generation Errors</strong>
            ${fetchErrors.join("")}
            <a href="${debugUrl}" target="_blank" class="error-debug-link">View Debug Info \u2192</a>
          </div>` : ""}
        <div class="container">
          <div class="header">
            <h1>${xmlEscape(title)}</h1>
            <div class="header-meta">
              ${isNotIndexButHasIndex ? `Part of <a href="${xmlEscape(fixPath("/sitemap_index.xml"))}">${xmlEscape(fixPath("/sitemap_index.xml"))}</a> \xB7 ` : ""}
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps
              </xsl:if>
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs
              </xsl:if>
            </div>
          </div>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style="width:70%">Sitemap</th>
                    <th style="width:30%">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <xsl:variable name="sitemapURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <tr>
                      <td>
                        <a href="{$sitemapURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td>
                        <xsl:value-of
                          select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    ${columns.map((c) => `<th style="width:${c.width}">${c.label}</th>`).join("\n")}
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <xsl:variable name="itemURL">
                          <xsl:value-of select="sitemap:loc"/>
                        </xsl:variable>
                        <a href="{$itemURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                        ${""}
                      </td>
                      ${columns.filter((c) => c.label !== "URL").map((c) => `<td><span class="count"><xsl:value-of select="${c.select}"/></span></td>`).join("\n")}
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
        </div>
        ${""}
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
});

function withoutQuery(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [path === "/" ? path : withoutTrailingSlash(path), rules])
      )
    })
  );
  return (pathOrUrl) => {
    const path = pathOrUrl[0] === "/" ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname;
    const pathWithoutQuery = withoutQuery(path);
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(pathWithoutQuery === "/" ? pathWithoutQuery : withoutTrailingSlash(pathWithoutQuery), app.baseURL)
    ).reverse());
  };
}

function resolve(s, resolvers) {
  if (typeof s === "undefined")
    return void 0;
  const str = typeof s === "string" ? s : s.toString();
  if (!resolvers)
    return str;
  if (hasProtocol(str, { acceptRelative: true, strict: false }))
    return resolvers.fixSlashes(str);
  return resolvers.canonicalUrlResolver(str);
}
function removeTrailingSlash(s) {
  return s.replace(/\/(\?|#|$)/, "$1");
}
function preNormalizeEntry(_e, resolvers) {
  const input = typeof _e === "string" ? { loc: _e } : { ..._e };
  if (input.url && !input.loc) {
    input.loc = input.url;
  }
  delete input.url;
  if (typeof input.loc !== "string") {
    input.loc = "";
  }
  const skipEncoding = input._encoded === true;
  const e = input;
  e.loc = removeTrailingSlash(e.loc);
  e._abs = hasProtocol(e.loc, { acceptRelative: false, strict: false });
  try {
    e._path = e._abs ? parseURL(e.loc) : parsePath(e.loc);
  } catch {
    e._path = null;
  }
  if (e._path) {
    const search = e._path.search;
    const qs = search && search.length > 1 ? stringifyQuery(parseQuery(search)) : "";
    const pathname = skipEncoding ? e._path.pathname : encodePath(e._path.pathname);
    e._relativeLoc = `${pathname}${qs.length ? `?${qs}` : ""}`;
    if (e._path.host) {
      e.loc = stringifyParsedURL(e._path);
    } else {
      e.loc = e._relativeLoc;
    }
  } else if (!skipEncoding && !isEncoded(e.loc)) {
    e.loc = encodeURI(e.loc);
  }
  if (e.loc === "")
    e.loc = `/`;
  e.loc = resolve(e.loc, resolvers);
  e._key = `${e._sitemap || ""}${withoutTrailingSlash(e.loc)}`;
  return e;
}
function isEncoded(url) {
  try {
    return url !== decodeURIComponent(url);
  } catch {
    return false;
  }
}
function normaliseEntry(_e, defaults, resolvers) {
  const e = defu(_e, defaults);
  if (e.lastmod) {
    const date = normaliseDate(e.lastmod);
    if (date)
      e.lastmod = date;
    else
      delete e.lastmod;
  }
  if (!e.lastmod)
    delete e.lastmod;
  e.loc = resolve(e.loc, resolvers);
  if (e.alternatives) {
    const alternatives = e.alternatives.map((a) => ({ ...a }));
    for (const alt of alternatives) {
      if (typeof alt.href === "string") {
        alt.href = resolve(alt.href, resolvers);
      } else if (typeof alt.href === "object" && alt.href) {
        alt.href = resolve(alt.href.href, resolvers);
      }
    }
    e.alternatives = mergeOnKey(alternatives, "hreflang");
  }
  if (e.images) {
    const images = e.images.map((i) => ({ ...i }));
    for (const img of images) {
      img.loc = resolve(img.loc, resolvers);
    }
    e.images = mergeOnKey(images, "loc");
  }
  if (e.videos) {
    const videos = e.videos.map((v) => ({ ...v }));
    for (const video of videos) {
      if (video.content_loc) {
        video.content_loc = resolve(video.content_loc, resolvers);
      }
    }
    e.videos = mergeOnKey(videos, "content_loc");
  }
  return e;
}
const IS_VALID_W3C_DATE = [
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
  /^\d{4}-[01]\d-[0-3]\d$/,
  /^\d{4}-[01]\d$/,
  /^\d{4}$/
];
function isValidW3CDate(d) {
  return IS_VALID_W3C_DATE.some((r) => r.test(d));
}
function normaliseDate(d) {
  if (typeof d === "string") {
    const tIdx = d.indexOf("T");
    if (tIdx !== -1) {
      const t = d.slice(tIdx + 1);
      if (!t.includes("+") && !t.includes("-") && !t.includes("Z")) {
        d += "Z";
      }
    }
    if (!isValidW3CDate(d))
      return false;
    d = new Date(d);
    d.setMilliseconds(0);
    if (Number.isNaN(d.getTime()))
      return false;
  }
  const z = (n) => `0${n}`.slice(-2);
  const date = `${d.getUTCFullYear()}-${z(d.getUTCMonth() + 1)}-${z(d.getUTCDate())}`;
  if (d.getUTCHours() > 0 || d.getUTCMinutes() > 0 || d.getUTCSeconds() > 0) {
    return `${date}T${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}Z`;
  }
  return date;
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function parseNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseFloat(value.trim());
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function parseInteger(value) {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseInt(value.trim(), 10);
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function extractUrlFromParsedElement(urlElement, warnings) {
  if (!isValidString(urlElement.loc)) {
    warnings.push({
      type: "validation",
      message: "URL entry missing required loc element",
      context: { url: String(urlElement.loc || "undefined") }
    });
    return null;
  }
  const urlObj = { loc: urlElement.loc };
  if (isValidString(urlElement.lastmod)) {
    urlObj.lastmod = urlElement.lastmod;
  }
  if (isValidString(urlElement.changefreq)) {
    const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
    if (validFreqs.includes(urlElement.changefreq)) {
      urlObj.changefreq = urlElement.changefreq;
    } else {
      warnings.push({
        type: "validation",
        message: "Invalid changefreq value",
        context: { url: urlElement.loc, field: "changefreq", value: urlElement.changefreq }
      });
    }
  }
  const priority = parseNumber(urlElement.priority);
  if (priority !== void 0 && !Number.isNaN(priority)) {
    if (priority < 0 || priority > 1) {
      warnings.push({
        type: "validation",
        message: "Priority value should be between 0.0 and 1.0, clamping to valid range",
        context: { url: urlElement.loc, field: "priority", value: priority }
      });
    }
    urlObj.priority = Math.max(0, Math.min(1, priority));
  } else if (urlElement.priority !== void 0) {
    warnings.push({
      type: "validation",
      message: "Invalid priority value",
      context: { url: urlElement.loc, field: "priority", value: urlElement.priority }
    });
  }
  if (urlElement.image) {
    const images = Array.isArray(urlElement.image) ? urlElement.image : [urlElement.image];
    const validImages = images.map((img) => {
      if (isValidString(img.loc)) {
        return { loc: img.loc };
      } else {
        warnings.push({
          type: "validation",
          message: "Image missing required loc element",
          context: { url: urlElement.loc, field: "image.loc" }
        });
        return null;
      }
    }).filter((img) => img !== null);
    if (validImages.length > 0) {
      urlObj.images = validImages;
    }
  }
  if (urlElement.video) {
    const videos = Array.isArray(urlElement.video) ? urlElement.video : [urlElement.video];
    const validVideos = videos.map((video) => {
      const missingFields = [];
      if (!isValidString(video.title)) missingFields.push("title");
      if (!isValidString(video.thumbnail_loc)) missingFields.push("thumbnail_loc");
      if (!isValidString(video.description)) missingFields.push("description");
      if (!isValidString(video.content_loc)) missingFields.push("content_loc");
      if (missingFields.length > 0) {
        warnings.push({
          type: "validation",
          message: `Video missing required fields: ${missingFields.join(", ")}`,
          context: { url: urlElement.loc, field: "video" }
        });
        return null;
      }
      const videoObj = {
        title: video.title,
        thumbnail_loc: video.thumbnail_loc,
        description: video.description,
        content_loc: video.content_loc
      };
      if (isValidString(video.player_loc)) {
        videoObj.player_loc = video.player_loc;
      }
      const duration = parseInteger(video.duration);
      if (duration !== void 0) {
        videoObj.duration = duration;
      } else if (video.duration !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video duration value",
          context: { url: urlElement.loc, field: "video.duration", value: video.duration }
        });
      }
      if (isValidString(video.expiration_date)) {
        videoObj.expiration_date = video.expiration_date;
      }
      const rating = parseNumber(video.rating);
      if (rating !== void 0) {
        if (rating < 0 || rating > 5) {
          warnings.push({
            type: "validation",
            message: "Video rating should be between 0.0 and 5.0",
            context: { url: urlElement.loc, field: "video.rating", value: rating }
          });
        }
        videoObj.rating = rating;
      } else if (video.rating !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video rating value",
          context: { url: urlElement.loc, field: "video.rating", value: video.rating }
        });
      }
      const viewCount = parseInteger(video.view_count);
      if (viewCount !== void 0) {
        videoObj.view_count = viewCount;
      } else if (video.view_count !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video view_count value",
          context: { url: urlElement.loc, field: "video.view_count", value: video.view_count }
        });
      }
      if (isValidString(video.publication_date)) {
        videoObj.publication_date = video.publication_date;
      }
      if (isValidString(video.family_friendly)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.family_friendly)) {
          videoObj.family_friendly = video.family_friendly;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video family_friendly value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.family_friendly", value: video.family_friendly }
          });
        }
      }
      if (isValidString(video.requires_subscription)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.requires_subscription)) {
          videoObj.requires_subscription = video.requires_subscription;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video requires_subscription value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.requires_subscription", value: video.requires_subscription }
          });
        }
      }
      if (isValidString(video.live)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.live)) {
          videoObj.live = video.live;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video live value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.live", value: video.live }
          });
        }
      }
      if (video.restriction && typeof video.restriction === "object") {
        const restriction = video.restriction;
        if (isValidString(restriction.relationship) && isValidString(restriction["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(restriction.relationship)) {
            videoObj.restriction = {
              relationship: restriction.relationship,
              restriction: restriction["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video restriction relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.restriction.relationship", value: restriction.relationship }
            });
          }
        }
      }
      if (video.platform && typeof video.platform === "object") {
        const platform = video.platform;
        if (isValidString(platform.relationship) && isValidString(platform["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(platform.relationship)) {
            videoObj.platform = {
              relationship: platform.relationship,
              platform: platform["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video platform relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.platform.relationship", value: platform.relationship }
            });
          }
        }
      }
      if (video.price) {
        const prices = Array.isArray(video.price) ? video.price : [video.price];
        const validPrices = prices.map((price) => {
          const priceValue = price["#text"];
          if (priceValue == null || typeof priceValue !== "string" && typeof priceValue !== "number") {
            warnings.push({
              type: "validation",
              message: "Video price missing value",
              context: { url: urlElement.loc, field: "video.price" }
            });
            return null;
          }
          const validTypes = ["rent", "purchase", "package", "subscription"];
          if (price.type && !validTypes.includes(price.type)) {
            warnings.push({
              type: "validation",
              message: `Invalid video price type "${price.type}", should be one of: ${validTypes.join(", ")}`,
              context: { url: urlElement.loc, field: "video.price.type", value: price.type }
            });
          }
          return {
            price: String(priceValue),
            currency: price.currency,
            type: price.type
          };
        }).filter((p) => p !== null);
        if (validPrices.length > 0) {
          videoObj.price = validPrices;
        }
      }
      if (video.uploader && typeof video.uploader === "object") {
        const uploader = video.uploader;
        if (isValidString(uploader.info) && isValidString(uploader["#text"])) {
          videoObj.uploader = {
            uploader: uploader["#text"],
            info: uploader.info
          };
        } else {
          warnings.push({
            type: "validation",
            message: "Video uploader missing required info or name",
            context: { url: urlElement.loc, field: "video.uploader" }
          });
        }
      }
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        const validTags = tags.filter(isValidString);
        if (validTags.length > 0) {
          videoObj.tag = validTags;
        }
      }
      return videoObj;
    }).filter((video) => video !== null);
    if (validVideos.length > 0) {
      urlObj.videos = validVideos;
    }
  }
  if (urlElement.link) {
    const links = Array.isArray(urlElement.link) ? urlElement.link : [urlElement.link];
    const alternatives = links.map((link) => {
      if (link.rel === "alternate" && isValidString(link.hreflang) && isValidString(link.href)) {
        return {
          hreflang: link.hreflang,
          href: link.href
        };
      } else {
        warnings.push({
          type: "validation",
          message: 'Alternative link missing required rel="alternate", hreflang, or href',
          context: { url: urlElement.loc, field: "link" }
        });
        return null;
      }
    }).filter((alt) => alt !== null);
    if (alternatives.length > 0) {
      urlObj.alternatives = alternatives;
    }
  }
  if (urlElement.news && typeof urlElement.news === "object") {
    const news = urlElement.news;
    if (isValidString(news.title) && isValidString(news.publication_date) && news.publication && isValidString(news.publication.name) && isValidString(news.publication.language)) {
      urlObj.news = {
        title: news.title,
        publication_date: news.publication_date,
        publication: {
          name: news.publication.name,
          language: news.publication.language
        }
      };
    } else {
      warnings.push({
        type: "validation",
        message: "News entry missing required fields (title, publication_date, publication.name, publication.language)",
        context: { url: urlElement.loc, field: "news" }
      });
    }
  }
  return Object.fromEntries(
    Object.entries(urlObj).filter(
      ([_, value]) => value != null && (!Array.isArray(value) || value.length > 0)
    )
  );
}
async function parseSitemapXml(xml) {
  const warnings = [];
  if (!xml) {
    throw new Error("Empty XML input provided");
  }
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({
    isArray: (tagName) => ["url", "image", "video", "link", "tag", "price"].includes(tagName),
    removeNSPrefix: true,
    parseAttributeValue: false,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true
  });
  try {
    const parsed = parser.parse(xml);
    if (!parsed?.urlset) {
      throw new Error("XML does not contain a valid urlset element");
    }
    if (!parsed.urlset.url) {
      throw new Error("Sitemap contains no URL entries");
    }
    const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    const validUrls = urls.map((url) => extractUrlFromParsedElement(url, warnings)).filter((url) => url !== null);
    if (validUrls.length === 0 && urls.length > 0) {
      warnings.push({
        type: "validation",
        message: "No valid URLs found in sitemap after validation"
      });
    }
    return { urls: validUrls, warnings };
  } catch (error) {
    if (error instanceof Error && (error.message === "Empty XML input provided" || error.message === "XML does not contain a valid urlset element" || error.message === "Sitemap contains no URL entries")) {
      throw error;
    }
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

new XMLParser({
  isArray: (tagName) => tagName === "sitemap",
  removeNSPrefix: true,
  trimValues: true
});

function normalizeSourceInput(source) {
  if (typeof source === "string") {
    return { context: { name: "hook" }, fetch: source };
  }
  if (Array.isArray(source)) {
    return { context: { name: "hook" }, fetch: source };
  }
  return source;
}
async function tryFetchWithFallback(url, options, event) {
  const isExternalUrl = !url.startsWith("/");
  if (isExternalUrl) {
    const strategies = [
      // Strategy 1: Use globalThis.$fetch (original approach)
      () => globalThis.$fetch(url, options),
      // Strategy 2: If event is available, try using event context even for external URLs
      event ? () => event.$fetch(url, options) : null,
      // Strategy 3: Use native fetch as last resort
      () => $fetch(url, options)
    ].filter(Boolean);
    let lastError = null;
    for (const strategy of strategies) {
      try {
        return await strategy();
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    throw lastError;
  }
  const fetchContainer = url.startsWith("/") && event ? event : globalThis;
  return await fetchContainer.$fetch(url, options);
}
async function fetchDataSource(input, event) {
  const context = typeof input.context === "string" ? { name: input.context } : input.context || { name: "fetch" };
  const url = typeof input.fetch === "string" ? input.fetch : input.fetch[0];
  const options = typeof input.fetch === "string" ? {} : input.fetch[1];
  const start = Date.now();
  const isExternalUrl = !url.startsWith("/");
  const timeout = isExternalUrl ? 1e4 : options.timeout || 5e3;
  const timeoutController = new AbortController();
  const abortRequestTimeout = setTimeout(() => timeoutController.abort(), timeout);
  try {
    let isMaybeErrorResponse = false;
    const isXmlRequest = parseURL(url).pathname.endsWith(".xml");
    const mergedHeaders = defu(
      options?.headers,
      {
        Accept: isXmlRequest ? "text/xml" : "application/json"
      },
      event && !isExternalUrl ? { host: getRequestHost(event, { xForwardedHost: true }) } : {}
    );
    const fetchOptions = {
      ...options,
      responseType: isXmlRequest ? "text" : "json",
      signal: timeoutController.signal,
      headers: mergedHeaders,
      // Use ofetch's built-in retry for external sources
      ...isExternalUrl && {
        retry: 2,
        retryDelay: 200
      },
      // @ts-expect-error untyped
      onResponse({ response }) {
        if (typeof response._data === "string" && response._data.startsWith("<!DOCTYPE html>"))
          isMaybeErrorResponse = true;
      }
    };
    const res = await tryFetchWithFallback(url, fetchOptions, event);
    const timeTakenMs = Date.now() - start;
    if (isMaybeErrorResponse) {
      return {
        ...input,
        context,
        urls: [],
        timeTakenMs,
        error: "Received HTML response instead of JSON"
      };
    }
    let urls = [];
    if (typeof res === "object") {
      urls = res.urls || res;
    } else if (typeof res === "string" && parseURL(url).pathname.endsWith(".xml")) {
      const result = await parseSitemapXml(res);
      urls = result.urls;
    }
    return {
      ...input,
      context,
      timeTakenMs,
      urls
    };
  } catch (_err) {
    const error = _err;
    if (isExternalUrl) {
      const errorInfo = {
        url,
        timeout,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        method: options?.method || "GET"
      };
      logger.error("Failed to fetch external source.", errorInfo);
    } else {
      logger.error("Failed to fetch source.", { url, error: error.message });
    }
    return {
      ...input,
      context,
      urls: [],
      error: error.message,
      _isFailure: true
      // Mark as failure to prevent caching
    };
  } finally {
    if (abortRequestTimeout) {
      clearTimeout(abortRequestTimeout);
    }
  }
}
async function globalSitemapSources() {
  const m = await import('../virtual/global-sources.mjs');
  return [...m.sources];
}
async function childSitemapSources(definition) {
  if (!definition?._hasSourceChunk)
    return [];
  const m = await import('../virtual/child-sources.mjs');
  return [...m.sources[definition.sitemapName] || []];
}
async function resolveSitemapSources(sources, event) {
  return (await Promise.all(
    sources.map((source) => {
      const normalized = normalizeSourceInput(source);
      if ("urls" in normalized) {
        return {
          timeTakenMs: 0,
          ...normalized,
          urls: normalized.urls
        };
      }
      if (normalized.fetch)
        return fetchDataSource(normalized, event);
      return {
        ...normalized,
        error: "Invalid source"
      };
    })
  )).flat();
}

function sortInPlace(urls) {
  urls.sort((a, b) => {
    const aLoc = typeof a === "string" ? a : a.loc;
    const bLoc = typeof b === "string" ? b : b.loc;
    const aSegments = aLoc.split("/").length;
    const bSegments = bLoc.split("/").length;
    if (aSegments !== bSegments) {
      return aSegments - bSegments;
    }
    return aLoc.localeCompare(bLoc, void 0, { numeric: true });
  });
  return urls;
}

function parseChunkInfo(sitemapName, sitemaps, defaultChunkSize) {
  defaultChunkSize = defaultChunkSize || 1e3;
  if (typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName))) {
    return {
      isChunked: true,
      baseSitemapName: "sitemap",
      chunkIndex: Number(sitemapName),
      chunkSize: defaultChunkSize
    };
  }
  if (sitemapName.includes("-")) {
    const parts = sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const baseSitemapName = parts.join("-");
      const baseSitemap = sitemaps[baseSitemapName];
      if (baseSitemap && (baseSitemap.chunks || baseSitemap._isChunking)) {
        const chunkSize = typeof baseSitemap.chunks === "number" ? baseSitemap.chunks : baseSitemap.chunkSize || defaultChunkSize;
        return {
          isChunked: true,
          baseSitemapName,
          chunkIndex: Number(lastPart),
          chunkSize
        };
      }
    }
  }
  return {
    isChunked: false,
    baseSitemapName: sitemapName,
    chunkIndex: void 0,
    chunkSize: defaultChunkSize
  };
}
function sliceUrlsForChunk(urls, sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const startIndex = chunkInfo.chunkIndex * chunkInfo.chunkSize;
    const endIndex = (chunkInfo.chunkIndex + 1) * chunkInfo.chunkSize;
    return urls.slice(startIndex, endIndex);
  }
  return urls;
}

function escapeValueForXml(value) {
  if (value === true || value === false)
    return value ? "yes" : "no";
  return xmlEscape(String(value));
}
const yesNo = (v) => v === "yes" || v === true ? "yes" : "no";
const URLSET_OPENING_TAG = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
function buildUrlXml(url, NL, I1, I2, I3, I4) {
  let xml = `${I1}<url>${NL}`;
  if (url.loc) xml += `${I2}<loc>${xmlEscape(url.loc)}</loc>${NL}`;
  if (url.lastmod) xml += `${I2}<lastmod>${url.lastmod}</lastmod>${NL}`;
  if (url.changefreq) xml += `${I2}<changefreq>${url.changefreq}</changefreq>${NL}`;
  if (url.priority !== void 0) {
    const p = typeof url.priority === "number" ? url.priority : Number.parseFloat(url.priority);
    xml += `${I2}<priority>${p.toFixed(1)}</priority>${NL}`;
  }
  if (url.alternatives) {
    for (const alt of url.alternatives) {
      let attrs = "";
      for (const [k, v] of Object.entries(alt)) attrs += ` ${k}="${xmlEscape(String(v))}"`;
      xml += `${I2}<xhtml:link rel="alternate"${attrs} />${NL}`;
    }
  }
  if (url.images) {
    for (const img of url.images) {
      xml += `${I2}<image:image>${NL}${I3}<image:loc>${xmlEscape(img.loc)}</image:loc>${NL}`;
      if (img.title) xml += `${I3}<image:title>${xmlEscape(img.title)}</image:title>${NL}`;
      if (img.caption) xml += `${I3}<image:caption>${xmlEscape(img.caption)}</image:caption>${NL}`;
      if (img.geo_location) xml += `${I3}<image:geo_location>${xmlEscape(img.geo_location)}</image:geo_location>${NL}`;
      if (img.license) xml += `${I3}<image:license>${xmlEscape(img.license)}</image:license>${NL}`;
      xml += `${I2}</image:image>${NL}`;
    }
  }
  if (url.videos) {
    for (const video of url.videos) {
      xml += `${I2}<video:video>${NL}${I3}<video:title>${xmlEscape(video.title)}</video:title>${NL}`;
      if (video.thumbnail_loc) xml += `${I3}<video:thumbnail_loc>${xmlEscape(video.thumbnail_loc)}</video:thumbnail_loc>${NL}`;
      xml += `${I3}<video:description>${xmlEscape(video.description)}</video:description>${NL}`;
      if (video.content_loc) xml += `${I3}<video:content_loc>${xmlEscape(video.content_loc)}</video:content_loc>${NL}`;
      if (video.player_loc) xml += `${I3}<video:player_loc>${xmlEscape(video.player_loc)}</video:player_loc>${NL}`;
      if (video.duration !== void 0) xml += `${I3}<video:duration>${video.duration}</video:duration>${NL}`;
      if (video.expiration_date) xml += `${I3}<video:expiration_date>${video.expiration_date}</video:expiration_date>${NL}`;
      if (video.rating !== void 0) xml += `${I3}<video:rating>${video.rating}</video:rating>${NL}`;
      if (video.view_count !== void 0) xml += `${I3}<video:view_count>${video.view_count}</video:view_count>${NL}`;
      if (video.publication_date) xml += `${I3}<video:publication_date>${video.publication_date}</video:publication_date>${NL}`;
      if (video.family_friendly !== void 0) xml += `${I3}<video:family_friendly>${yesNo(video.family_friendly)}</video:family_friendly>${NL}`;
      if (video.restriction) xml += `${I3}<video:restriction relationship="${video.restriction.relationship || "allow"}">${xmlEscape(video.restriction.restriction)}</video:restriction>${NL}`;
      if (video.platform) xml += `${I3}<video:platform relationship="${video.platform.relationship || "allow"}">${xmlEscape(video.platform.platform)}</video:platform>${NL}`;
      if (video.requires_subscription !== void 0) xml += `${I3}<video:requires_subscription>${yesNo(video.requires_subscription)}</video:requires_subscription>${NL}`;
      if (video.price) {
        for (const price of video.price) {
          const c = price.currency ? ` currency="${price.currency}"` : "";
          const t = price.type ? ` type="${price.type}"` : "";
          xml += `${I3}<video:price${c}${t}>${xmlEscape(String(price.price ?? ""))}</video:price>${NL}`;
        }
      }
      if (video.uploader) {
        const info = video.uploader.info ? ` info="${xmlEscape(video.uploader.info)}"` : "";
        xml += `${I3}<video:uploader${info}>${xmlEscape(video.uploader.uploader)}</video:uploader>${NL}`;
      }
      if (video.live !== void 0) xml += `${I3}<video:live>${yesNo(video.live)}</video:live>${NL}`;
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        for (const t of tags) xml += `${I3}<video:tag>${xmlEscape(t)}</video:tag>${NL}`;
      }
      if (video.category) xml += `${I3}<video:category>${xmlEscape(video.category)}</video:category>${NL}`;
      if (video.gallery_loc) xml += `${I3}<video:gallery_loc>${xmlEscape(video.gallery_loc)}</video:gallery_loc>${NL}`;
      xml += `${I2}</video:video>${NL}`;
    }
  }
  if (url.news) {
    xml += `${I2}<news:news>${NL}${I3}<news:publication>${NL}`;
    xml += `${I4}<news:name>${xmlEscape(url.news.publication.name)}</news:name>${NL}`;
    xml += `${I4}<news:language>${xmlEscape(url.news.publication.language)}</news:language>${NL}`;
    xml += `${I3}</news:publication>${NL}`;
    if (url.news.title) xml += `${I3}<news:title>${xmlEscape(url.news.title)}</news:title>${NL}`;
    if (url.news.publication_date) xml += `${I3}<news:publication_date>${url.news.publication_date}</news:publication_date>${NL}`;
    xml += `${I2}</news:news>${NL}`;
  }
  xml += `${I1}</url>`;
  return xml;
}
function urlsToXml(urls, resolvers, { version, xsl, credits, minify }, errorInfo) {
  let xslHref = xsl ? resolvers.relativeBaseUrlResolver(xsl) : false;
  if (xslHref && errorInfo?.messages.length) {
    xslHref = withQuery(xslHref, {
      errors: "true",
      error_messages: errorInfo.messages,
      error_urls: errorInfo.urls
    });
  }
  const NL = minify ? "" : "\n";
  const I1 = minify ? "" : "    ";
  const I2 = minify ? "" : "        ";
  const I3 = minify ? "" : "            ";
  const I4 = minify ? "" : "                ";
  let xml = xslHref ? `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${escapeValueForXml(xslHref)}"?>${NL}` : `<?xml version="1.0" encoding="UTF-8"?>${NL}`;
  xml += URLSET_OPENING_TAG + NL;
  for (const url of urls) {
    xml += buildUrlXml(url, NL, I1, I2, I3, I4) + NL;
  }
  xml += "</urlset>";
  if (credits) {
    xml += `${NL}<!-- XML Sitemap generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`;
  }
  return xml;
}

function resolveSitemapEntries(sitemap, urls, runtimeConfig, resolvers) {
  const {
    autoI18n,
    isI18nMapped
  } = runtimeConfig;
  const filterPath = createPathFilter({
    include: sitemap.include,
    exclude: sitemap.exclude
  });
  const _urls = urls.map((_e) => {
    const e = preNormalizeEntry(_e, resolvers);
    if (!e.loc || !filterPath(e.loc))
      return false;
    return e;
  }).filter(Boolean);
  let validI18nUrlsForTransform = [];
  const withoutPrefixPaths = {};
  if (autoI18n && autoI18n.strategy !== "no_prefix") {
    const localeCodes = autoI18n.locales.map((l) => l.code);
    const localeByCode = new Map(autoI18n.locales.map((l) => [l.code, l]));
    const isPrefixStrategy = autoI18n.strategy === "prefix";
    const isPrefixExceptOrAndDefault = autoI18n.strategy === "prefix_and_default" || autoI18n.strategy === "prefix_except_default";
    const xDefaultAndLocales = [{ code: "x-default", _hreflang: "x-default" }, ...autoI18n.locales];
    const defaultLocale = autoI18n.defaultLocale;
    const hasPages = !!autoI18n.pages;
    const hasDifferentDomains = !!autoI18n.differentDomains;
    validI18nUrlsForTransform = _urls.map((_e, i) => {
      if (_e._abs)
        return false;
      const split = splitForLocales(_e._relativeLoc, localeCodes);
      let localeCode = split[0];
      const pathWithoutPrefix = split[1];
      if (!localeCode)
        localeCode = defaultLocale;
      const e = _e;
      e._pathWithoutPrefix = pathWithoutPrefix;
      const locale = localeByCode.get(localeCode);
      if (!locale)
        return false;
      e._locale = locale;
      e._index = i;
      e._key = `${e._sitemap || ""}${e._path?.pathname || "/"}${e._path?.search || ""}`;
      withoutPrefixPaths[pathWithoutPrefix] = withoutPrefixPaths[pathWithoutPrefix] || [];
      if (!withoutPrefixPaths[pathWithoutPrefix].some((e2) => e2._locale.code === locale.code))
        withoutPrefixPaths[pathWithoutPrefix].push(e);
      return e;
    }).filter(Boolean);
    for (const e of validI18nUrlsForTransform) {
      if (!e._i18nTransform && !e.alternatives?.length) {
        const alternatives = (withoutPrefixPaths[e._pathWithoutPrefix] || []).map((u) => {
          const entries = [];
          if (u._locale.code === defaultLocale) {
            entries.push({
              href: u.loc,
              hreflang: "x-default"
            });
          }
          entries.push({
            href: u.loc,
            hreflang: u._locale._hreflang || defaultLocale
          });
          return entries;
        }).flat().filter(Boolean);
        if (alternatives.length)
          e.alternatives = alternatives;
      } else if (e._i18nTransform) {
        delete e._i18nTransform;
        if (hasDifferentDomains) {
          const defLocale = localeByCode.get(defaultLocale);
          e.alternatives = [
            {
              ...defLocale,
              code: "x-default"
            },
            ...autoI18n.locales.filter((l) => !!l.domain)
          ].map((locale) => {
            return {
              hreflang: locale._hreflang,
              href: joinURL(withHttps(locale.domain), e._pathWithoutPrefix)
            };
          });
        } else {
          const pageMatch = hasPages ? findPageMapping(e._pathWithoutPrefix, autoI18n.pages) : null;
          const pathSearch = e._path?.search || "";
          const pathWithoutPrefix = e._pathWithoutPrefix;
          for (const l of autoI18n.locales) {
            let loc = pathWithoutPrefix;
            if (pageMatch && pageMatch.mappings[l.code] !== void 0) {
              const customPath = pageMatch.mappings[l.code];
              if (customPath === false)
                continue;
              if (typeof customPath === "string") {
                loc = customPath[0] === "/" ? customPath : `/${customPath}`;
                loc = applyDynamicParams(loc, pageMatch.paramSegments);
                if (isPrefixStrategy || isPrefixExceptOrAndDefault && l.code !== defaultLocale)
                  loc = joinURL(`/${l.code}`, loc);
              }
            } else if (!hasDifferentDomains && !(isPrefixExceptOrAndDefault && l.code === defaultLocale)) {
              loc = joinURL(`/${l.code}`, pathWithoutPrefix);
            }
            const _sitemap = isI18nMapped ? l._sitemap : void 0;
            const alternatives = [];
            for (const locale of xDefaultAndLocales) {
              const code = locale.code === "x-default" ? defaultLocale : locale.code;
              const isDefault = locale.code === "x-default" || locale.code === defaultLocale;
              let href = pathWithoutPrefix;
              if (pageMatch && pageMatch.mappings[code] !== void 0) {
                const customPath = pageMatch.mappings[code];
                if (customPath === false)
                  continue;
                if (typeof customPath === "string") {
                  href = customPath[0] === "/" ? customPath : `/${customPath}`;
                  href = applyDynamicParams(href, pageMatch.paramSegments);
                  if (isPrefixStrategy || isPrefixExceptOrAndDefault && !isDefault)
                    href = joinURL("/", code, href);
                }
              } else if (isPrefixStrategy) {
                href = joinURL("/", code, pathWithoutPrefix);
              } else if (isPrefixExceptOrAndDefault && !isDefault) {
                href = joinURL("/", code, pathWithoutPrefix);
              }
              if (!filterPath(href))
                continue;
              alternatives.push({
                hreflang: locale._hreflang,
                href
              });
            }
            const { _index: _, ...rest } = e;
            const newEntry = preNormalizeEntry({
              _sitemap,
              ...rest,
              _key: `${_sitemap || ""}${loc || "/"}${pathSearch}`,
              _locale: l,
              loc,
              alternatives
            }, resolvers);
            if (e._locale.code === newEntry._locale.code) {
              _urls[e._index] = newEntry;
              e._index = void 0;
            } else {
              _urls.push(newEntry);
            }
          }
        }
      }
      if (isI18nMapped) {
        e._sitemap = e._sitemap || e._locale._sitemap;
        e._key = `${e._sitemap || ""}${e.loc || "/"}${e._path?.search || ""}`;
      }
      if (e._index)
        _urls[e._index] = e;
    }
  }
  return _urls;
}
async function buildSitemapUrls(sitemap, resolvers, runtimeConfig, nitro) {
  const {
    sitemaps,
    // enhancing
    autoI18n,
    isI18nMapped,
    isMultiSitemap,
    // sorting
    sortEntries,
    // chunking
    defaultSitemapsChunkSize
  } = runtimeConfig;
  const chunkSize = defaultSitemapsChunkSize || void 0;
  const chunkInfo = parseChunkInfo(sitemap.sitemapName, sitemaps, chunkSize);
  function maybeSort(urls2) {
    return sortEntries ? sortInPlace(urls2) : urls2;
  }
  function maybeSlice(urls2) {
    return sliceUrlsForChunk(urls2, sitemap.sitemapName, sitemaps, chunkSize);
  }
  if (autoI18n?.differentDomains) {
    const domain = autoI18n.locales.find((e) => e.language === sitemap.sitemapName || e.code === sitemap.sitemapName)?.domain;
    if (domain) {
      const _tester = resolvers.canonicalUrlResolver;
      resolvers.canonicalUrlResolver = (path) => resolveSitePath(path, {
        absolute: true,
        withBase: false,
        siteUrl: withHttps(domain),
        trailingSlash: _tester("/test/").endsWith("/"),
        base: "/"
      });
    }
  }
  let effectiveSitemap = sitemap;
  const baseSitemapName = chunkInfo.baseSitemapName;
  if (chunkInfo.isChunked && baseSitemapName !== sitemap.sitemapName && sitemaps[baseSitemapName]) {
    effectiveSitemap = sitemaps[baseSitemapName];
  }
  let sourcesInput = effectiveSitemap.includeAppSources ? [...await globalSitemapSources(), ...await childSitemapSources(effectiveSitemap)] : await childSitemapSources(effectiveSitemap);
  if (nitro && resolvers.event) {
    const ctx = {
      event: resolvers.event,
      sitemapName: baseSitemapName,
      sources: sourcesInput
    };
    await nitro.hooks.callHook("sitemap:sources", ctx);
    sourcesInput = ctx.sources;
  }
  const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
  const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
    url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
    error: source.error || "Unknown error"
  }));
  const resolvedCtx = {
    urls: sources.flatMap((s) => s.urls),
    sitemapName: sitemap.sitemapName,
    event: resolvers.event
  };
  await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
  const enhancedUrls = resolveSitemapEntries(sitemap, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers);
  if (isMultiSitemap) {
    const sitemapNames = Object.keys(sitemaps).filter((k) => k !== "index");
    const warnedSitemaps = nitro?._sitemapWarnedSitemaps || /* @__PURE__ */ new Set();
    for (const e of enhancedUrls) {
      if (typeof e._sitemap === "string" && !sitemapNames.includes(e._sitemap)) {
        if (!warnedSitemaps.has(e._sitemap)) {
          warnedSitemaps.add(e._sitemap);
          logger.error(`Sitemap \`${e._sitemap}\` not found in sitemap config. Available sitemaps: ${sitemapNames.join(", ")}. Entry \`${e.loc}\` will be omitted.`);
        }
      }
    }
    if (nitro) {
      nitro._sitemapWarnedSitemaps = warnedSitemaps;
    }
  }
  const filteredUrls = enhancedUrls.filter((e) => {
    if (e._sitemap === false)
      return false;
    if (isMultiSitemap && e._sitemap && sitemap.sitemapName) {
      if (sitemap._isChunking)
        return sitemap.sitemapName.startsWith(e._sitemap + "-");
      return e._sitemap === sitemap.sitemapName;
    }
    return true;
  });
  const sortedUrls = maybeSort(filteredUrls);
  const urls = maybeSlice(sortedUrls);
  return { urls, failedSources };
}

function useNitroUrlResolvers(e) {
  const canonicalQuery = getQuery(e).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const siteConfig = getSiteConfig(e);
  return {
    event: e,
    fixSlashes: (path) => fixSlashes(siteConfig.trailingSlash, path),
    // we need these as they depend on the nitro event
    canonicalUrlResolver: createSitePathResolver(e, {
      canonical: isShowingCanonical || true,
      absolute: true,
      withBase: true
    }),
    relativeBaseUrlResolver: createSitePathResolver(e, { absolute: false, withBase: true })
  };
}
async function buildSitemapXml(event, definition, resolvers, runtimeConfig) {
  const { sitemapName } = definition;
  const nitro = useNitroApp();
  const { urls: sitemapUrls, failedSources } = await buildSitemapUrls(definition, resolvers, runtimeConfig, nitro);
  const routeRuleMatcher = createNitroRouteRuleMatcher();
  const { autoI18n } = runtimeConfig;
  let validCount = 0;
  for (let i = 0; i < sitemapUrls.length; i++) {
    const u = sitemapUrls[i];
    const path = u._path?.pathname || u.loc;
    let routeRules = routeRuleMatcher(path);
    if (autoI18n?.locales && autoI18n?.strategy !== "no_prefix") {
      const match = splitForLocales(path, autoI18n.locales.map((l) => l.code));
      const pathWithoutPrefix = match[1];
      if (pathWithoutPrefix && pathWithoutPrefix !== path)
        routeRules = defu(routeRules, routeRuleMatcher(pathWithoutPrefix));
    }
    if (routeRules.sitemap === false)
      continue;
    if (typeof routeRules.robots !== "undefined" && !routeRules.robots)
      continue;
    const hasRobotsDisabled = Object.entries(routeRules.headers || {}).some(([name, value]) => name.toLowerCase() === "x-robots-tag" && value.toLowerCase().includes("noindex"));
    if (routeRules.redirect || hasRobotsDisabled)
      continue;
    sitemapUrls[validCount++] = routeRules.sitemap ? defu(u, routeRules.sitemap) : u;
  }
  sitemapUrls.length = validCount;
  const locSize = sitemapUrls.length;
  const resolvedCtx = {
    urls: sitemapUrls,
    sitemapName,
    event
  };
  await nitro.hooks.callHook("sitemap:resolved", resolvedCtx);
  if (resolvedCtx.urls.length !== locSize) {
    resolvedCtx.urls = resolvedCtx.urls.map((e) => preNormalizeEntry(e, resolvers));
  }
  const maybeSort = (urls2) => runtimeConfig.sortEntries ? sortInPlace(urls2) : urls2;
  const defaults = definition.defaults || {};
  const normalizedPreDedupe = resolvedCtx.urls.map((e) => normaliseEntry(e, defaults, resolvers));
  const urls = maybeSort(mergeOnKey(normalizedPreDedupe, "_key").map((e) => normaliseEntry(e, defaults, resolvers)));
  if (definition._isChunking && definition.sitemapName.includes("-")) {
    const parts = definition.sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const chunkIndex = Number(lastPart);
      const baseSitemapName = parts.join("-");
      if (urls.length === 0 && chunkIndex > 0) {
        throw createError$1({
          statusCode: 404,
          message: `Sitemap chunk ${chunkIndex} for "${baseSitemapName}" does not exist.`
        });
      }
    }
  }
  const errorInfo = failedSources.length > 0 ? {
    messages: failedSources.map((f) => f.error),
    urls: failedSources.map((f) => f.url)
  } : void 0;
  const sitemap = urlsToXml(urls, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap, sitemapName, event };
  await nitro.hooks.callHook("sitemap:output", ctx);
  return ctx.sitemap;
}
const buildSitemapXmlCached = defineCachedFunction(
  buildSitemapXml,
  {
    name: "sitemap:xml",
    group: "sitemap",
    maxAge: 60 * 10,
    // Default 10 minutes
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event, definition) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      const sitemapName = definition.sitemapName || "default";
      return `${sitemapName}-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function createSitemap(event, definition, runtimeConfig) {
  const resolvers = useNitroUrlResolvers(event);
  const shouldCache = typeof runtimeConfig.cacheMaxAgeSeconds === "number" && runtimeConfig.cacheMaxAgeSeconds > 0;
  const xml = shouldCache ? await buildSitemapXmlCached(event, definition, resolvers, runtimeConfig) : await buildSitemapXml(event, definition, resolvers, runtimeConfig);
  setHeader(event, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(event, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(event, "X-Sitemap-Generated", now.toISOString());
    setHeader(event, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(event, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(event, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(event, "Cache-Control", `no-cache, no-store`);
  }
  event.context._isSitemap = true;
  return xml;
}

async function sitemapXmlEventHandler(e) {
  const runtimeConfig = useSitemapRuntimeConfig();
  const { sitemaps } = runtimeConfig;
  if ("index" in sitemaps)
    return sendRedirect(e, withBase("/sitemap_index.xml", useRuntimeConfig().app.baseURL), 301);
  return createSitemap(e, Object.values(sitemaps)[0], runtimeConfig);
}

const _I4b0He = defineEventHandler(sitemapXmlEventHandler);

const _V30t1l = lazyEventHandler(() => {
  const opts = useRuntimeConfig().ipx || {};
  const fsDir = opts?.fs?.dir ? (Array.isArray(opts.fs.dir) ? opts.fs.dir : [opts.fs.dir]).map((dir) => isAbsolute(dir) ? dir : fileURLToPath(new URL(dir, globalThis._importMeta_.url))) : void 0;
  const fsStorage = opts.fs?.dir ? ipxFSStorage({ ...opts.fs, dir: fsDir }) : void 0;
  const httpStorage = opts.http?.domains ? ipxHttpStorage({ ...opts.http }) : void 0;
  if (!fsStorage && !httpStorage) {
    throw new Error("IPX storage is not configured!");
  }
  const ipxOptions = {
    ...opts,
    storage: fsStorage || httpStorage,
    httpStorage
  };
  const ipx = createIPX(ipxOptions);
  const ipxHandler = createIPXH3Handler(ipx);
  return useBase(opts.baseURL, ipxHandler);
});

const _lazy_RSALqR = () => import('../routes/api/auth/login.post.mjs');
const _lazy_2EVG6f = () => import('../routes/api/auth/logout.post.mjs');
const _lazy_nmS4gf = () => import('../routes/api/auth/me.get.mjs');
const _lazy_XrNmJG = () => import('../routes/api/batch/_id_.delete.mjs');
const _lazy_udzmPJ = () => import('../routes/api/batch/_id_.get.mjs');
const _lazy_ct0R51 = () => import('../routes/api/batch/_id_.put.mjs');
const _lazy_Fj4Lgc = () => import('../routes/api/batch/create.post.mjs');
const _lazy_pryAEm = () => import('../routes/api/batch/deduplicate-pipelines.post.mjs');
const _lazy_321GNE = () => import('../routes/api/index.get.mjs');
const _lazy_0kRtWt = () => import('../routes/api/bottle/__id_.delete.mjs');
const _lazy_9wakVI = () => import('../routes/api/bottle/__id_.get.mjs');
const _lazy_2Amv4j = () => import('../routes/api/bottle/__id_.put.mjs');
const _lazy_Pz_i3b = () => import('../routes/api/bottle/create.post.mjs');
const _lazy_G433CM = () => import('../routes/api/index.get2.mjs');
const _lazy_aJTFtw = () => import('../routes/api/bottle/public.get.mjs');
const _lazy_YQ5Foc = () => import('../routes/api/bulkSpirit/__id_.delete.mjs');
const _lazy_cux7YO = () => import('../routes/api/bulkSpirit/__id_.get.mjs');
const _lazy_a5FSGw = () => import('../routes/api/bulkSpirit/__id_.put.mjs');
const _lazy_7Hn5Xx = () => import('../routes/api/bulkSpirit/create.post.mjs');
const _lazy_xlP8rW = () => import('../routes/api/index.get3.mjs');
const _lazy_En40qO = () => import('../routes/api/cocktail/_id_.delete.mjs');
const _lazy_IPfPEj = () => import('../routes/api/cocktail/_id_.get.mjs');
const _lazy_UhVKVA = () => import('../routes/api/cocktail/_id_.put.mjs');
const _lazy_mjZ4mK = () => import('../routes/api/cocktail/create.post.mjs');
const _lazy_XtFdWl = () => import('../routes/api/index.get4.mjs');
const _lazy_KQwuzG = () => import('../routes/api/cocktail/public.get.mjs');
const _lazy_FBPgB1 = () => import('../routes/api/contact/_id_.delete.mjs');
const _lazy_rPG85t = () => import('../routes/api/contact/_id_.get.mjs');
const _lazy_w0H2dF = () => import('../routes/api/contact/_id_.put.mjs');
const _lazy_2bFKyP = () => import('../routes/api/contact/create.post.mjs');
const _lazy_212AR0 = () => import('../routes/api/index.get5.mjs');
const _lazy_m2CUvF = () => import('../routes/api/contact/inquiry.post.mjs');
const _lazy_OpgCZP = () => import('../routes/api/contact/merge.post.mjs');
const _lazy_CMfuaS = () => import('../routes/api/contact/subscribe.post.mjs');
const _lazy_2Ad2Tz = () => import('../routes/api/equipmentLog/create.post.mjs');
const _lazy_VENtbC = () => import('../routes/api/index.get6.mjs');
const _lazy_IWFAMh = () => import('../routes/api/event/_id_.delete.mjs');
const _lazy_zrs3qO = () => import('../routes/api/event/_id_.get.mjs');
const _lazy_DtSDM2 = () => import('../routes/api/event/_id_.put.mjs');
const _lazy_20JAhr = () => import('../routes/api/event/create.post.mjs');
const _lazy_LCDazQ = () => import('../routes/api/index.get7.mjs');
const _lazy_3UrTb7 = () => import('../routes/api/event/public/_id_.get.mjs');
const _lazy_lApv7N = () => import('../routes/api/event/request.post.mjs');
const _lazy_V6rcPG = () => import('../routes/api/event/upcoming.get.mjs');
const _lazy_7jKQ9U = () => import('../routes/api/inventory/__id_.delete.mjs');
const _lazy_8PokA0 = () => import('../routes/api/inventory/__id_.get.mjs');
const _lazy_LsYou9 = () => import('../routes/api/inventory/__id_.put.mjs');
const _lazy_Ry_d7m = () => import('../routes/api/inventory/bulk.post.mjs');
const _lazy_dKbJaf = () => import('../routes/api/inventory/by-item/_item_.get.mjs');
const _lazy_Pn4Fp6 = () => import('../routes/api/inventory/create.post.mjs');
const _lazy_eWeGwN = () => import('../routes/api/index.get8.mjs');
const _lazy__Q6S4V = () => import('../routes/api/item/__id_.delete.mjs');
const _lazy_03SrH6 = () => import('../routes/api/item/__id_.get.mjs');
const _lazy_10VLhu = () => import('../routes/api/item/__id_.put.mjs');
const _lazy_NL6ArV = () => import('../routes/api/item/create.post.mjs');
const _lazy_AmCJZT = () => import('../routes/api/index.get9.mjs');
const _lazy_lbUJym = () => import('../routes/api/message/_id_.delete.mjs');
const _lazy_E0v9Mn = () => import('../routes/api/message/_id_.get.mjs');
const _lazy_Cv9vvz = () => import('../routes/api/message/_id_.put.mjs');
const _lazy_DDMAAj = () => import('../routes/api/message/create.post.mjs');
const _lazy_vvVjlX = () => import('../routes/api/index.get10.mjs');
const _lazy_BRmLxU = () => import('../routes/api/production/_id_.delete.mjs');
const _lazy_ct0la4 = () => import('../routes/api/production/_id_.get.mjs');
const _lazy_JvQOgP = () => import('../routes/api/production/_id_.put.mjs');
const _lazy_ywyiER = () => import('../routes/api/production/create.post.mjs');
const _lazy_kaKjun = () => import('../routes/api/index.get11.mjs');
const _lazy_MBWj0E = () => import('../routes/api/purchaseOrder/__id_.delete.mjs');
const _lazy_GsxGsD = () => import('../routes/api/purchaseOrder/__id_.get.mjs');
const _lazy_HRPwv_ = () => import('../routes/api/purchaseOrder/__id_.put.mjs');
const _lazy_TtuS7_ = () => import('../routes/api/purchaseOrder/create.post.mjs');
const _lazy_LZKkxk = () => import('../routes/api/index.get12.mjs');
const _lazy_REBghK = () => import('../routes/api/recipe/__id_.delete.mjs');
const _lazy_40CWTT = () => import('../routes/api/recipe/__id_.get.mjs');
const _lazy_U00iSs = () => import('../routes/api/recipe/__id_.put.mjs');
const _lazy_M2DyBS = () => import('../routes/api/recipe/backfill-pipelines.post.mjs');
const _lazy_cU77pX = () => import('../routes/api/recipe/create.post.mjs');
const _lazy_fXQo70 = () => import('../routes/api/index.get13.mjs');
const _lazy_bj_HU6 = () => import('../routes/api/index.get14.mjs');
const _lazy_eiDCLt = () => import('../routes/api/index.put.mjs');
const _lazy_zyBLw7 = () => import('../routes/api/square/confirm-order.post.mjs');
const _lazy_BbnMvx = () => import('../routes/api/square/create-checkout.post.mjs');
const _lazy_TpeYn0 = () => import('../routes/api/square/order-status.get.mjs');
const _lazy_x1peee = () => import('../routes/api/square/webhook.post.mjs');
const _lazy_gc6Ckc = () => import('../routes/api/upload/_id_.delete.mjs');
const _lazy_M6wh0D = () => import('../routes/api/index.post.mjs');
const _lazy_0PVjRU = () => import('../routes/api/users/__id_.delete.mjs');
const _lazy_JoeMf6 = () => import('../routes/api/users/__id_.put.mjs');
const _lazy_F9ZsJi = () => import('../routes/api/users/create.post.mjs');
const _lazy_pb_URr = () => import('../routes/api/index.get15.mjs');
const _lazy_cysr6y = () => import('../routes/api/vessel/_id_.delete.mjs');
const _lazy_WU7kzG = () => import('../routes/api/vessel/_id_.get.mjs');
const _lazy_PDdvYT = () => import('../routes/api/vessel/_id_.put.mjs');
const _lazy_S9Bd3f = () => import('../routes/api/vessel/create.post.mjs');
const _lazy_xFSTRx = () => import('../routes/api/index.get16.mjs');
const _lazy_oqE_dW = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _H8X7Hl, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _3ukuB7, lazy: false, middleware: true, method: undefined },
  { route: '/api/auth/login', handler: _lazy_RSALqR, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_2EVG6f, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_nmS4gf, lazy: true, middleware: false, method: "get" },
  { route: '/api/batch/:id', handler: _lazy_XrNmJG, lazy: true, middleware: false, method: "delete" },
  { route: '/api/batch/:id', handler: _lazy_udzmPJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/batch/:id', handler: _lazy_ct0R51, lazy: true, middleware: false, method: "put" },
  { route: '/api/batch/create', handler: _lazy_Fj4Lgc, lazy: true, middleware: false, method: "post" },
  { route: '/api/batch/deduplicate-pipelines', handler: _lazy_pryAEm, lazy: true, middleware: false, method: "post" },
  { route: '/api/batch', handler: _lazy_321GNE, lazy: true, middleware: false, method: "get" },
  { route: '/api/bottle/:_id', handler: _lazy_0kRtWt, lazy: true, middleware: false, method: "delete" },
  { route: '/api/bottle/:_id', handler: _lazy_9wakVI, lazy: true, middleware: false, method: "get" },
  { route: '/api/bottle/:_id', handler: _lazy_2Amv4j, lazy: true, middleware: false, method: "put" },
  { route: '/api/bottle/create', handler: _lazy_Pz_i3b, lazy: true, middleware: false, method: "post" },
  { route: '/api/bottle', handler: _lazy_G433CM, lazy: true, middleware: false, method: "get" },
  { route: '/api/bottle/public', handler: _lazy_aJTFtw, lazy: true, middleware: false, method: "get" },
  { route: '/api/bulkSpirit/:_id', handler: _lazy_YQ5Foc, lazy: true, middleware: false, method: "delete" },
  { route: '/api/bulkSpirit/:_id', handler: _lazy_cux7YO, lazy: true, middleware: false, method: "get" },
  { route: '/api/bulkSpirit/:_id', handler: _lazy_a5FSGw, lazy: true, middleware: false, method: "put" },
  { route: '/api/bulkSpirit/create', handler: _lazy_7Hn5Xx, lazy: true, middleware: false, method: "post" },
  { route: '/api/bulkSpirit', handler: _lazy_xlP8rW, lazy: true, middleware: false, method: "get" },
  { route: '/api/cocktail/:id', handler: _lazy_En40qO, lazy: true, middleware: false, method: "delete" },
  { route: '/api/cocktail/:id', handler: _lazy_IPfPEj, lazy: true, middleware: false, method: "get" },
  { route: '/api/cocktail/:id', handler: _lazy_UhVKVA, lazy: true, middleware: false, method: "put" },
  { route: '/api/cocktail/create', handler: _lazy_mjZ4mK, lazy: true, middleware: false, method: "post" },
  { route: '/api/cocktail', handler: _lazy_XtFdWl, lazy: true, middleware: false, method: "get" },
  { route: '/api/cocktail/public', handler: _lazy_KQwuzG, lazy: true, middleware: false, method: "get" },
  { route: '/api/contact/:id', handler: _lazy_FBPgB1, lazy: true, middleware: false, method: "delete" },
  { route: '/api/contact/:id', handler: _lazy_rPG85t, lazy: true, middleware: false, method: "get" },
  { route: '/api/contact/:id', handler: _lazy_w0H2dF, lazy: true, middleware: false, method: "put" },
  { route: '/api/contact/create', handler: _lazy_2bFKyP, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact', handler: _lazy_212AR0, lazy: true, middleware: false, method: "get" },
  { route: '/api/contact/inquiry', handler: _lazy_m2CUvF, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/merge', handler: _lazy_OpgCZP, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/subscribe', handler: _lazy_CMfuaS, lazy: true, middleware: false, method: "post" },
  { route: '/api/equipmentLog/create', handler: _lazy_2Ad2Tz, lazy: true, middleware: false, method: "post" },
  { route: '/api/equipmentLog', handler: _lazy_VENtbC, lazy: true, middleware: false, method: "get" },
  { route: '/api/event/:id', handler: _lazy_IWFAMh, lazy: true, middleware: false, method: "delete" },
  { route: '/api/event/:id', handler: _lazy_zrs3qO, lazy: true, middleware: false, method: "get" },
  { route: '/api/event/:id', handler: _lazy_DtSDM2, lazy: true, middleware: false, method: "put" },
  { route: '/api/event/create', handler: _lazy_20JAhr, lazy: true, middleware: false, method: "post" },
  { route: '/api/event', handler: _lazy_LCDazQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/event/public/:id', handler: _lazy_3UrTb7, lazy: true, middleware: false, method: "get" },
  { route: '/api/event/request', handler: _lazy_lApv7N, lazy: true, middleware: false, method: "post" },
  { route: '/api/event/upcoming', handler: _lazy_V6rcPG, lazy: true, middleware: false, method: "get" },
  { route: '/api/inventory/:_id', handler: _lazy_7jKQ9U, lazy: true, middleware: false, method: "delete" },
  { route: '/api/inventory/:_id', handler: _lazy_8PokA0, lazy: true, middleware: false, method: "get" },
  { route: '/api/inventory/:_id', handler: _lazy_LsYou9, lazy: true, middleware: false, method: "put" },
  { route: '/api/inventory/bulk', handler: _lazy_Ry_d7m, lazy: true, middleware: false, method: "post" },
  { route: '/api/inventory/by-item/:item', handler: _lazy_dKbJaf, lazy: true, middleware: false, method: "get" },
  { route: '/api/inventory/create', handler: _lazy_Pn4Fp6, lazy: true, middleware: false, method: "post" },
  { route: '/api/inventory', handler: _lazy_eWeGwN, lazy: true, middleware: false, method: "get" },
  { route: '/api/item/:_id', handler: _lazy__Q6S4V, lazy: true, middleware: false, method: "delete" },
  { route: '/api/item/:_id', handler: _lazy_03SrH6, lazy: true, middleware: false, method: "get" },
  { route: '/api/item/:_id', handler: _lazy_10VLhu, lazy: true, middleware: false, method: "put" },
  { route: '/api/item/create', handler: _lazy_NL6ArV, lazy: true, middleware: false, method: "post" },
  { route: '/api/item', handler: _lazy_AmCJZT, lazy: true, middleware: false, method: "get" },
  { route: '/api/message/:id', handler: _lazy_lbUJym, lazy: true, middleware: false, method: "delete" },
  { route: '/api/message/:id', handler: _lazy_E0v9Mn, lazy: true, middleware: false, method: "get" },
  { route: '/api/message/:id', handler: _lazy_Cv9vvz, lazy: true, middleware: false, method: "put" },
  { route: '/api/message/create', handler: _lazy_DDMAAj, lazy: true, middleware: false, method: "post" },
  { route: '/api/message', handler: _lazy_vvVjlX, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_BRmLxU, lazy: true, middleware: false, method: "delete" },
  { route: '/api/production/:id', handler: _lazy_ct0la4, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_JvQOgP, lazy: true, middleware: false, method: "put" },
  { route: '/api/production/create', handler: _lazy_ywyiER, lazy: true, middleware: false, method: "post" },
  { route: '/api/production', handler: _lazy_kaKjun, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchaseOrder/:_id', handler: _lazy_MBWj0E, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchaseOrder/:_id', handler: _lazy_GsxGsD, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchaseOrder/:_id', handler: _lazy_HRPwv_, lazy: true, middleware: false, method: "put" },
  { route: '/api/purchaseOrder/create', handler: _lazy_TtuS7_, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchaseOrder', handler: _lazy_LZKkxk, lazy: true, middleware: false, method: "get" },
  { route: '/api/recipe/:_id', handler: _lazy_REBghK, lazy: true, middleware: false, method: "delete" },
  { route: '/api/recipe/:_id', handler: _lazy_40CWTT, lazy: true, middleware: false, method: "get" },
  { route: '/api/recipe/:_id', handler: _lazy_U00iSs, lazy: true, middleware: false, method: "put" },
  { route: '/api/recipe/backfill-pipelines', handler: _lazy_M2DyBS, lazy: true, middleware: false, method: "post" },
  { route: '/api/recipe/create', handler: _lazy_cU77pX, lazy: true, middleware: false, method: "post" },
  { route: '/api/recipe', handler: _lazy_fXQo70, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings', handler: _lazy_bj_HU6, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings', handler: _lazy_eiDCLt, lazy: true, middleware: false, method: "put" },
  { route: '/api/square/confirm-order', handler: _lazy_zyBLw7, lazy: true, middleware: false, method: "post" },
  { route: '/api/square/create-checkout', handler: _lazy_BbnMvx, lazy: true, middleware: false, method: "post" },
  { route: '/api/square/order-status', handler: _lazy_TpeYn0, lazy: true, middleware: false, method: "get" },
  { route: '/api/square/webhook', handler: _lazy_x1peee, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload/:id', handler: _lazy_gc6Ckc, lazy: true, middleware: false, method: "delete" },
  { route: '/api/upload', handler: _lazy_M6wh0D, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/:_id', handler: _lazy_0PVjRU, lazy: true, middleware: false, method: "delete" },
  { route: '/api/users/:_id', handler: _lazy_JoeMf6, lazy: true, middleware: false, method: "put" },
  { route: '/api/users/create', handler: _lazy_F9ZsJi, lazy: true, middleware: false, method: "post" },
  { route: '/api/users', handler: _lazy_pb_URr, lazy: true, middleware: false, method: "get" },
  { route: '/api/vessel/:id', handler: _lazy_cysr6y, lazy: true, middleware: false, method: "delete" },
  { route: '/api/vessel/:id', handler: _lazy_WU7kzG, lazy: true, middleware: false, method: "get" },
  { route: '/api/vessel/:id', handler: _lazy_PDdvYT, lazy: true, middleware: false, method: "put" },
  { route: '/api/vessel/create', handler: _lazy_S9Bd3f, lazy: true, middleware: false, method: "post" },
  { route: '/api/vessel', handler: _lazy_xFSTRx, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_oqE_dW, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/api/_nuxt_icon/:collection', handler: _R8lesc, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _O3dEYj, lazy: false, middleware: true, method: undefined },
  { route: '/__sitemap__/style.xsl', handler: _QbdIe0, lazy: false, middleware: false, method: undefined },
  { route: '/sitemap.xml', handler: _I4b0He, lazy: false, middleware: false, method: undefined },
  { route: '/_ipx/**', handler: _V30t1l, lazy: false, middleware: false, method: undefined },
  { route: '/api/bottle/public/_payload.json', handler: _lazy_oqE_dW, lazy: true, middleware: false, method: undefined },
  { route: '/api/cocktail/public/_payload.json', handler: _lazy_oqE_dW, lazy: true, middleware: false, method: undefined },
  { route: '/api/event/upcoming/_payload.json', handler: _lazy_oqE_dW, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_oqE_dW, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$1(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$1(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { messageUpdateSchema as $, PurchaseOrder as A, BulkSpirit as B, Cocktail as C, Event as D, EquipmentLog as E, Contact as F, contactUpdateSchema as G, contactCreateSchema as H, Inventory as I, contactInquirySchema as J, validateObjectId as K, newsletterSubscribeSchema as L, Message as M, equipmentLogCreateSchema as N, eventUpdateSchema as O, Production as P, eventCreateSchema as Q, Recipe as R, getRouterParam as S, eventRequestSchema as T, User as U, Vessel as V, inventoryUpdateSchema as W, inventoryCreateSchema as X, getQuery as Y, itemUpdateSchema as Z, itemCreateSchema as _, getAuthSession as a, messageCreateSchema as a0, productionUpdateSchema as a1, productionCreateSchema as a2, purchaseOrderUpdateSchema as a3, purchaseOrderCreateSchema as a4, recipeUpdateSchema as a5, recipeCreateSchema as a6, Settings as a7, isH3Error as a8, settingsUpdateSchema as a9, isScriptProtocol as aA, parseQuery as aB, defuFn as aC, withQuery as aD, sanitizeStatusCode as aE, parseURL as aF, encodePath as aG, decodePath as aH, getContext as aI, withTrailingSlash as aJ, withoutTrailingSlash as aK, withLeadingSlash as aL, $fetch$1 as aM, baseURL as aN, createHooks as aO, executeAsync as aP, encodeParam as aQ, upperFirst as aR, hash$1 as aS, nodeServer as aT, useSquareClient as aa, useRuntimeConfig as ab, getRequestProtocol as ac, getRequestHost as ad, readRawBody as ae, getHeader as af, getCloudinary as ag, readMultipartFormData as ah, userUpdateSchema as ai, userCreateSchema as aj, vesselUpdateSchema as ak, vesselCreateSchema as al, buildAssetsURL as am, getResponseStatusText as an, getResponseStatus as ao, defineRenderHandler as ap, publicAssetsURL as aq, destr as ar, getRouteRules as as, joinURL as at, useNitroApp as au, serialize$1 as av, isEqual as aw, defu as ax, klona as ay, hasProtocol as az, createDeleteHandler as b, createError$1 as c, defineEventHandler as d, Batch as e, createGetByIdHandler as f, getRequestIP as g, createUpdateHandler as h, batchUpdateSchema as i, batchCreateSchema as j, requireRole as k, createGetAllHandler as l, Bottle as m, bottleUpdateSchema as n, createCreateHandler as o, bottleCreateSchema as p, defineCachedEventHandler as q, readBody as r, sanitize as s, bulkSpiritUpdateSchema as t, userLoginSchema as u, validateBody as v, bulkSpiritCreateSchema as w, cocktailUpdateSchema as x, cocktailCreateSchema as y, Item as z };
//# sourceMappingURL=nitro.mjs.map
