var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base642 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base642 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base642 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* toIterator(parts, clone2 = true) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name2, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name2}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name2, value] of form) {
    yield getHeader(boundary, name2, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name2, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name2, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = import_stream.default.Readable.from(body.stream());
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error3 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error3);
        throw error3;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    const error_ = error3 instanceof FetchBaseError ? error3 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers2 = []) {
  return new Headers(headers2.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []).filter(([name2, value]) => {
    try {
      validateHeaderName(name2);
      validateHeaderValue(name2, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url2, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url2, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url2}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error3) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error3.message}`, "system", error3));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error3) => {
      response.body.destroy(error3);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error3 = new Error("Premature close");
            error3.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error3);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers2 = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location2 = headers2.get("Location");
        const locationURL = location2 === null ? null : new URL(location2, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers2.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers: headers2,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers2.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers: headers2 } = response;
    isChunkedTransfer = headers2["transfer-encoding"] === "chunked" && !headers2["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error3 = new Error("Premature close");
        error3.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error3);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, commonjsGlobal, src, dataUriToBuffer$1, ponyfill_es2018, POOL_SIZE$1, POOL_SIZE, _parts, _type, _size, _a, _Blob, Blob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ponyfill_es2018 = { exports: {} };
    (function(module2, exports) {
      (function(global2, factory) {
        factory(exports);
      })(commonjsGlobal, function(exports2) {
        const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
        function noop2() {
          return void 0;
        }
        function getGlobals() {
          if (typeof self !== "undefined") {
            return self;
          } else if (typeof window !== "undefined") {
            return window;
          } else if (typeof commonjsGlobal !== "undefined") {
            return commonjsGlobal;
          }
          return void 0;
        }
        const globals = getGlobals();
        function typeIsObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        const rethrowAssertionErrorRejection = noop2;
        const originalPromise = Promise;
        const originalPromiseThen = Promise.prototype.then;
        const originalPromiseResolve = Promise.resolve.bind(originalPromise);
        const originalPromiseReject = Promise.reject.bind(originalPromise);
        function newPromise(executor) {
          return new originalPromise(executor);
        }
        function promiseResolvedWith(value) {
          return originalPromiseResolve(value);
        }
        function promiseRejectedWith(reason) {
          return originalPromiseReject(reason);
        }
        function PerformPromiseThen(promise, onFulfilled, onRejected) {
          return originalPromiseThen.call(promise, onFulfilled, onRejected);
        }
        function uponPromise(promise, onFulfilled, onRejected) {
          PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
        }
        function uponFulfillment(promise, onFulfilled) {
          uponPromise(promise, onFulfilled);
        }
        function uponRejection(promise, onRejected) {
          uponPromise(promise, void 0, onRejected);
        }
        function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
          return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
        }
        function setPromiseIsHandledToTrue(promise) {
          PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
        }
        const queueMicrotask = (() => {
          const globalQueueMicrotask = globals && globals.queueMicrotask;
          if (typeof globalQueueMicrotask === "function") {
            return globalQueueMicrotask;
          }
          const resolvedPromise = promiseResolvedWith(void 0);
          return (fn) => PerformPromiseThen(resolvedPromise, fn);
        })();
        function reflectCall(F, V, args) {
          if (typeof F !== "function") {
            throw new TypeError("Argument is not a function");
          }
          return Function.prototype.apply.call(F, V, args);
        }
        function promiseCall(F, V, args) {
          try {
            return promiseResolvedWith(reflectCall(F, V, args));
          } catch (value) {
            return promiseRejectedWith(value);
          }
        }
        const QUEUE_MAX_ARRAY_SIZE = 16384;
        class SimpleQueue {
          constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = {
              _elements: [],
              _next: void 0
            };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
          }
          get length() {
            return this._size;
          }
          push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
              newBack = {
                _elements: [],
                _next: void 0
              };
            }
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
              this._back = newBack;
              oldBack._next = newBack;
            }
            ++this._size;
          }
          shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
              newFront = oldFront._next;
              newCursor = 0;
            }
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
              this._front = newFront;
            }
            elements[oldCursor] = void 0;
            return element;
          }
          forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== void 0) {
              if (i === elements.length) {
                node = node._next;
                elements = node._elements;
                i = 0;
                if (elements.length === 0) {
                  break;
                }
              }
              callback(elements[i]);
              ++i;
            }
          }
          peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
          }
        }
        function ReadableStreamReaderGenericInitialize(reader, stream) {
          reader._ownerReadableStream = stream;
          stream._reader = reader;
          if (stream._state === "readable") {
            defaultReaderClosedPromiseInitialize(reader);
          } else if (stream._state === "closed") {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
          } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
          }
        }
        function ReadableStreamReaderGenericCancel(reader, reason) {
          const stream = reader._ownerReadableStream;
          return ReadableStreamCancel(stream, reason);
        }
        function ReadableStreamReaderGenericRelease(reader) {
          if (reader._ownerReadableStream._state === "readable") {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          }
          reader._ownerReadableStream._reader = void 0;
          reader._ownerReadableStream = void 0;
        }
        function readerLockException(name2) {
          return new TypeError("Cannot " + name2 + " a stream using a released reader");
        }
        function defaultReaderClosedPromiseInitialize(reader) {
          reader._closedPromise = newPromise((resolve2, reject) => {
            reader._closedPromise_resolve = resolve2;
            reader._closedPromise_reject = reject;
          });
        }
        function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseReject(reader, reason);
        }
        function defaultReaderClosedPromiseInitializeAsResolved(reader) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseResolve(reader);
        }
        function defaultReaderClosedPromiseReject(reader, reason) {
          if (reader._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(reader._closedPromise);
          reader._closedPromise_reject(reason);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        function defaultReaderClosedPromiseResetToRejected(reader, reason) {
          defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
        }
        function defaultReaderClosedPromiseResolve(reader) {
          if (reader._closedPromise_resolve === void 0) {
            return;
          }
          reader._closedPromise_resolve(void 0);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
        const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
        const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
        const PullSteps = SymbolPolyfill("[[PullSteps]]");
        const NumberIsFinite = Number.isFinite || function(x) {
          return typeof x === "number" && isFinite(x);
        };
        const MathTrunc = Math.trunc || function(v) {
          return v < 0 ? Math.ceil(v) : Math.floor(v);
        };
        function isDictionary(x) {
          return typeof x === "object" || typeof x === "function";
        }
        function assertDictionary(obj, context) {
          if (obj !== void 0 && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertFunction(x, context) {
          if (typeof x !== "function") {
            throw new TypeError(`${context} is not a function.`);
          }
        }
        function isObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        function assertObject(x, context) {
          if (!isObject(x)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertRequiredArgument(x, position, context) {
          if (x === void 0) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
          }
        }
        function assertRequiredField(x, field, context) {
          if (x === void 0) {
            throw new TypeError(`${field} is required in '${context}'.`);
          }
        }
        function convertUnrestrictedDouble(value) {
          return Number(value);
        }
        function censorNegativeZero(x) {
          return x === 0 ? 0 : x;
        }
        function integerPart(x) {
          return censorNegativeZero(MathTrunc(x));
        }
        function convertUnsignedLongLongWithEnforceRange(value, context) {
          const lowerBound = 0;
          const upperBound = Number.MAX_SAFE_INTEGER;
          let x = Number(value);
          x = censorNegativeZero(x);
          if (!NumberIsFinite(x)) {
            throw new TypeError(`${context} is not a finite number`);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
          }
          if (!NumberIsFinite(x) || x === 0) {
            return 0;
          }
          return x;
        }
        function assertReadableStream(x, context) {
          if (!IsReadableStream(x)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
          }
        }
        function AcquireReadableStreamDefaultReader(stream) {
          return new ReadableStreamDefaultReader(stream);
        }
        function ReadableStreamAddReadRequest(stream, readRequest) {
          stream._reader._readRequests.push(readRequest);
        }
        function ReadableStreamFulfillReadRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readRequest = reader._readRequests.shift();
          if (done) {
            readRequest._closeSteps();
          } else {
            readRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadRequests(stream) {
          return stream._reader._readRequests.length;
        }
        function ReadableStreamHasDefaultReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamDefaultReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamDefaultReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: () => resolvePromise({ value: void 0, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
              throw defaultReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultReader",
            configurable: true
          });
        }
        function IsReadableStreamDefaultReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultReader;
        }
        function ReadableStreamDefaultReaderRead(reader, readRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "closed") {
            readRequest._closeSteps();
          } else if (stream._state === "errored") {
            readRequest._errorSteps(stream._storedError);
          } else {
            stream._readableStreamController[PullSteps](readRequest);
          }
        }
        function defaultReaderBrandCheckException(name2) {
          return new TypeError(`ReadableStreamDefaultReader.prototype.${name2} can only be used on a ReadableStreamDefaultReader`);
        }
        const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
        }).prototype);
        class ReadableStreamAsyncIteratorImpl {
          constructor(reader, preventCancel) {
            this._ongoingPromise = void 0;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
          }
          next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
          }
          return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
          }
          _nextSteps() {
            if (this._isFinished) {
              return Promise.resolve({ value: void 0, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("iterate"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => {
                this._ongoingPromise = void 0;
                queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
              },
              _closeSteps: () => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                resolvePromise({ value: void 0, done: true });
              },
              _errorSteps: (reason) => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                rejectPromise(reason);
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
          }
          _returnSteps(value) {
            if (this._isFinished) {
              return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("finish iterating"));
            }
            if (!this._preventCancel) {
              const result = ReadableStreamReaderGenericCancel(reader, value);
              ReadableStreamReaderGenericRelease(reader);
              return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
          }
        }
        const ReadableStreamAsyncIteratorPrototype = {
          next() {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            }
            return this._asyncIteratorImpl.next();
          },
          return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            }
            return this._asyncIteratorImpl.return(value);
          }
        };
        if (AsyncIteratorPrototype !== void 0) {
          Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
        }
        function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
          const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
          iterator._asyncIteratorImpl = impl;
          return iterator;
        }
        function IsReadableStreamAsyncIterator(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
            return false;
          }
          try {
            return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
          } catch (_a2) {
            return false;
          }
        }
        function streamAsyncIteratorBrandCheckException(name2) {
          return new TypeError(`ReadableStreamAsyncIterator.${name2} can only be used on a ReadableSteamAsyncIterator`);
        }
        const NumberIsNaN = Number.isNaN || function(x) {
          return x !== x;
        };
        function CreateArrayFromList(elements) {
          return elements.slice();
        }
        function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
          new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
        }
        function TransferArrayBuffer(O) {
          return O;
        }
        function IsDetachedBuffer(O) {
          return false;
        }
        function ArrayBufferSlice(buffer, begin, end) {
          if (buffer.slice) {
            return buffer.slice(begin, end);
          }
          const length = end - begin;
          const slice = new ArrayBuffer(length);
          CopyDataBlockBytes(slice, 0, buffer, begin, length);
          return slice;
        }
        function IsNonNegativeNumber(v) {
          if (typeof v !== "number") {
            return false;
          }
          if (NumberIsNaN(v)) {
            return false;
          }
          if (v < 0) {
            return false;
          }
          return true;
        }
        function CloneAsUint8Array(O) {
          const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
          return new Uint8Array(buffer);
        }
        function DequeueValue(container) {
          const pair = container._queue.shift();
          container._queueTotalSize -= pair.size;
          if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
          }
          return pair.value;
        }
        function EnqueueValueWithSize(container, value, size) {
          if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
          }
          container._queue.push({ value, size });
          container._queueTotalSize += size;
        }
        function PeekQueueValue(container) {
          const pair = container._queue.peek();
          return pair.value;
        }
        function ResetQueue(container) {
          container._queue = new SimpleQueue();
          container._queueTotalSize = 0;
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("view");
            }
            return this._view;
          }
          respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respond");
            }
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(this._view.buffer))
              ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
          }
          respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respondWithNewView");
            }
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) {
              throw new TypeError("You can only respond with array buffer views");
            }
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: true },
          respondWithNewView: { enumerable: true },
          view: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBRequest",
            configurable: true
          });
        }
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("byobRequest");
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
          }
          get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("desiredSize");
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("close");
            }
            if (this._closeRequested) {
              throw new TypeError("The stream has already been closed; do not close it again!");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
          }
          enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("enqueue");
            }
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) {
              throw new TypeError("chunk must be an array buffer view");
            }
            if (chunk.byteLength === 0) {
              throw new TypeError("chunk must have non-zero byteLength");
            }
            if (chunk.buffer.byteLength === 0) {
              throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
              throw new TypeError("stream is closed or draining");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("error");
            }
            ReadableByteStreamControllerError(this, e);
          }
          [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
              const entry = this._queue.shift();
              this._queueTotalSize -= entry.byteLength;
              ReadableByteStreamControllerHandleQueueDrain(this);
              const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
              readRequest._chunkSteps(view);
              return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== void 0) {
              let buffer;
              try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
              } catch (bufferE) {
                readRequest._errorSteps(bufferE);
                return;
              }
              const pullIntoDescriptor = {
                buffer,
                bufferByteLength: autoAllocateChunkSize,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default"
              };
              this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
          }
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          byobRequest: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableByteStreamController",
            configurable: true
          });
        }
        function IsReadableByteStreamController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
            return false;
          }
          return x instanceof ReadableByteStreamController;
        }
        function IsReadableStreamBYOBRequest(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBRequest;
        }
        function ReadableByteStreamControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableByteStreamControllerError(controller, e);
          });
        }
        function ReadableByteStreamControllerClearPendingPullIntos(controller) {
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          controller._pendingPullIntos = new SimpleQueue();
        }
        function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
          let done = false;
          if (stream._state === "closed") {
            done = true;
          }
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          if (pullIntoDescriptor.readerType === "default") {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
          } else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
          }
        }
        function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
          const bytesFilled = pullIntoDescriptor.bytesFilled;
          const elementSize = pullIntoDescriptor.elementSize;
          return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
        }
        function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
          controller._queue.push({ buffer, byteOffset, byteLength });
          controller._queueTotalSize += byteLength;
        }
        function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
          const elementSize = pullIntoDescriptor.elementSize;
          const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
          const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
          const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
          const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
          let totalBytesToCopyRemaining = maxBytesToCopy;
          let ready = false;
          if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
          }
          const queue = controller._queue;
          while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
              queue.shift();
            } else {
              headOfQueue.byteOffset += bytesToCopy;
              headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
          }
          return ready;
        }
        function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
          pullIntoDescriptor.bytesFilled += size;
        }
        function ReadableByteStreamControllerHandleQueueDrain(controller) {
          if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
          } else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }
        }
        function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
          if (controller._byobRequest === null) {
            return;
          }
          controller._byobRequest._associatedReadableByteStreamController = void 0;
          controller._byobRequest._view = null;
          controller._byobRequest = null;
        }
        function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
          while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
              return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
          const stream = controller._controlledReadableByteStream;
          let elementSize = 1;
          if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
          }
          const ctor = view.constructor;
          const buffer = TransferArrayBuffer(view.buffer);
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: "byob"
          };
          if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
          }
          if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
          }
          if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
              ReadableByteStreamControllerHandleQueueDrain(controller);
              readIntoRequest._chunkSteps(filledView);
              return;
            }
            if (controller._closeRequested) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              readIntoRequest._errorSteps(e);
              return;
            }
          }
          controller._pendingPullIntos.push(pullIntoDescriptor);
          ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
          const stream = controller._controlledReadableByteStream;
          if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
              const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
          ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
          if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
          }
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
          if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
          }
          pullIntoDescriptor.bytesFilled -= remainderSize;
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
          ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            ReadableByteStreamControllerRespondInClosedState(controller);
          } else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerShiftPendingPullInto(controller) {
          const descriptor = controller._pendingPullIntos.shift();
          return descriptor;
        }
        function ReadableByteStreamControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return false;
          }
          if (controller._closeRequested) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableByteStreamControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
        }
        function ReadableByteStreamControllerClose(controller) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
          }
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              throw e;
            }
          }
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamClose(stream);
        }
        function ReadableByteStreamControllerEnqueue(controller, chunk) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          const buffer = chunk.buffer;
          const byteOffset = chunk.byteOffset;
          const byteLength = chunk.byteLength;
          const transferredBuffer = TransferArrayBuffer(buffer);
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer))
              ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
          }
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
              ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            } else {
              const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
              ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
          } else if (ReadableStreamHasBYOBReader(stream)) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
          } else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerError(controller, e) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return;
          }
          ReadableByteStreamControllerClearPendingPullIntos(controller);
          ResetQueue(controller);
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableByteStreamControllerGetBYOBRequest(controller) {
          if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
          }
          return controller._byobRequest;
        }
        function ReadableByteStreamControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableByteStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableByteStreamControllerRespond(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (bytesWritten !== 0) {
              throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
            }
          } else {
            if (bytesWritten === 0) {
              throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
              throw new RangeError("bytesWritten out of range");
            }
          }
          firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
          ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
        }
        function ReadableByteStreamControllerRespondWithNewView(controller, view) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (view.byteLength !== 0) {
              throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
            }
          } else {
            if (view.byteLength === 0) {
              throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
            }
          }
          if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError("The region specified by view does not match byobRequest");
          }
          if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError("The buffer of view has different capacity than byobRequest");
          }
          if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError("The region specified by view is larger than byobRequest");
          }
          firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
          ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
        }
        function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
          controller._controlledReadableByteStream = stream;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._byobRequest = null;
          controller._queue = controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._closeRequested = false;
          controller._started = false;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          controller._autoAllocateChunkSize = autoAllocateChunkSize;
          controller._pendingPullIntos = new SimpleQueue();
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableByteStreamControllerError(controller, r);
          });
        }
        function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
          const controller = Object.create(ReadableByteStreamController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingByteSource.start !== void 0) {
            startAlgorithm = () => underlyingByteSource.start(controller);
          }
          if (underlyingByteSource.pull !== void 0) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
          }
          if (underlyingByteSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
          }
          const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
          if (autoAllocateChunkSize === 0) {
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          }
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
        }
        function SetUpReadableStreamBYOBRequest(request, controller, view) {
          request._associatedReadableByteStreamController = controller;
          request._view = view;
        }
        function byobRequestBrandCheckException(name2) {
          return new TypeError(`ReadableStreamBYOBRequest.prototype.${name2} can only be used on a ReadableStreamBYOBRequest`);
        }
        function byteStreamControllerBrandCheckException(name2) {
          return new TypeError(`ReadableByteStreamController.prototype.${name2} can only be used on a ReadableByteStreamController`);
        }
        function AcquireReadableStreamBYOBReader(stream) {
          return new ReadableStreamBYOBReader(stream);
        }
        function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
          stream._reader._readIntoRequests.push(readIntoRequest);
        }
        function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readIntoRequest = reader._readIntoRequests.shift();
          if (done) {
            readIntoRequest._closeSteps(chunk);
          } else {
            readIntoRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadIntoRequests(stream) {
          return stream._reader._readIntoRequests.length;
        }
        function ReadableStreamHasBYOBReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamBYOBReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamBYOBReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
              throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("read"));
            }
            if (!ArrayBuffer.isView(view)) {
              return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            }
            if (view.byteLength === 0) {
              return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            }
            if (view.buffer.byteLength === 0) {
              return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readIntoRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
              throw byobReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readIntoRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBReader",
            configurable: true
          });
        }
        function IsReadableStreamBYOBReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBReader;
        }
        function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "errored") {
            readIntoRequest._errorSteps(stream._storedError);
          } else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
          }
        }
        function byobReaderBrandCheckException(name2) {
          return new TypeError(`ReadableStreamBYOBReader.prototype.${name2} can only be used on a ReadableStreamBYOBReader`);
        }
        function ExtractHighWaterMark(strategy, defaultHWM) {
          const { highWaterMark } = strategy;
          if (highWaterMark === void 0) {
            return defaultHWM;
          }
          if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError("Invalid highWaterMark");
          }
          return highWaterMark;
        }
        function ExtractSizeAlgorithm(strategy) {
          const { size } = strategy;
          if (!size) {
            return () => 1;
          }
          return size;
        }
        function convertQueuingStrategy(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
          return {
            highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
            size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
          };
        }
        function convertQueuingStrategySize(fn, context) {
          assertFunction(fn, context);
          return (chunk) => convertUnrestrictedDouble(fn(chunk));
        }
        function convertUnderlyingSink(original, context) {
          assertDictionary(original, context);
          const abort = original === null || original === void 0 ? void 0 : original.abort;
          const close = original === null || original === void 0 ? void 0 : original.close;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          const write = original === null || original === void 0 ? void 0 : original.write;
          return {
            abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
          };
        }
        function convertUnderlyingSinkAbortCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSinkCloseCallback(fn, original, context) {
          assertFunction(fn, context);
          return () => promiseCall(fn, original, []);
        }
        function convertUnderlyingSinkStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertUnderlyingSinkWriteCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        function assertWritableStream(x, context) {
          if (!IsWritableStream(x)) {
            throw new TypeError(`${context} is not a WritableStream.`);
          }
        }
        function isAbortSignal2(value) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          try {
            return typeof value.aborted === "boolean";
          } catch (_a2) {
            return false;
          }
        }
        const supportsAbortController = typeof AbortController === "function";
        function createAbortController() {
          if (supportsAbortController) {
            return new AbortController();
          }
          return void 0;
        }
        class WritableStream {
          constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === void 0) {
              rawUnderlyingSink = null;
            } else {
              assertObject(rawUnderlyingSink, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== void 0) {
              throw new RangeError("Invalid type is specified");
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
          }
          get locked() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("locked");
            }
            return IsWritableStreamLocked(this);
          }
          abort(reason = void 0) {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("abort"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            }
            return WritableStreamAbort(this, reason);
          }
          close() {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("close"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamClose(this);
          }
          getWriter() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("getWriter");
            }
            return AcquireWritableStreamDefaultWriter(this);
          }
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          getWriter: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStream",
            configurable: true
          });
        }
        function AcquireWritableStreamDefaultWriter(stream) {
          return new WritableStreamDefaultWriter(stream);
        }
        function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(WritableStream.prototype);
          InitializeWritableStream(stream);
          const controller = Object.create(WritableStreamDefaultController.prototype);
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function InitializeWritableStream(stream) {
          stream._state = "writable";
          stream._storedError = void 0;
          stream._writer = void 0;
          stream._writableStreamController = void 0;
          stream._writeRequests = new SimpleQueue();
          stream._inFlightWriteRequest = void 0;
          stream._closeRequest = void 0;
          stream._inFlightCloseRequest = void 0;
          stream._pendingAbortRequest = void 0;
          stream._backpressure = false;
        }
        function IsWritableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
            return false;
          }
          return x instanceof WritableStream;
        }
        function IsWritableStreamLocked(stream) {
          if (stream._writer === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamAbort(stream, reason) {
          var _a2;
          if (stream._state === "closed" || stream._state === "errored") {
            return promiseResolvedWith(void 0);
          }
          stream._writableStreamController._abortReason = reason;
          (_a2 = stream._writableStreamController._abortController) === null || _a2 === void 0 ? void 0 : _a2.abort();
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseResolvedWith(void 0);
          }
          if (stream._pendingAbortRequest !== void 0) {
            return stream._pendingAbortRequest._promise;
          }
          let wasAlreadyErroring = false;
          if (state === "erroring") {
            wasAlreadyErroring = true;
            reason = void 0;
          }
          const promise = newPromise((resolve2, reject) => {
            stream._pendingAbortRequest = {
              _promise: void 0,
              _resolve: resolve2,
              _reject: reject,
              _reason: reason,
              _wasAlreadyErroring: wasAlreadyErroring
            };
          });
          stream._pendingAbortRequest._promise = promise;
          if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
          }
          return promise;
        }
        function WritableStreamClose(stream) {
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
          }
          const promise = newPromise((resolve2, reject) => {
            const closeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._closeRequest = closeRequest;
          });
          const writer = stream._writer;
          if (writer !== void 0 && stream._backpressure && state === "writable") {
            defaultWriterReadyPromiseResolve(writer);
          }
          WritableStreamDefaultControllerClose(stream._writableStreamController);
          return promise;
        }
        function WritableStreamAddWriteRequest(stream) {
          const promise = newPromise((resolve2, reject) => {
            const writeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._writeRequests.push(writeRequest);
          });
          return promise;
        }
        function WritableStreamDealWithRejection(stream, error3) {
          const state = stream._state;
          if (state === "writable") {
            WritableStreamStartErroring(stream, error3);
            return;
          }
          WritableStreamFinishErroring(stream);
        }
        function WritableStreamStartErroring(stream, reason) {
          const controller = stream._writableStreamController;
          stream._state = "erroring";
          stream._storedError = reason;
          const writer = stream._writer;
          if (writer !== void 0) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
          }
          if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
          }
        }
        function WritableStreamFinishErroring(stream) {
          stream._state = "errored";
          stream._writableStreamController[ErrorSteps]();
          const storedError = stream._storedError;
          stream._writeRequests.forEach((writeRequest) => {
            writeRequest._reject(storedError);
          });
          stream._writeRequests = new SimpleQueue();
          if (stream._pendingAbortRequest === void 0) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const abortRequest = stream._pendingAbortRequest;
          stream._pendingAbortRequest = void 0;
          if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
          uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          });
        }
        function WritableStreamFinishInFlightWrite(stream) {
          stream._inFlightWriteRequest._resolve(void 0);
          stream._inFlightWriteRequest = void 0;
        }
        function WritableStreamFinishInFlightWriteWithError(stream, error3) {
          stream._inFlightWriteRequest._reject(error3);
          stream._inFlightWriteRequest = void 0;
          WritableStreamDealWithRejection(stream, error3);
        }
        function WritableStreamFinishInFlightClose(stream) {
          stream._inFlightCloseRequest._resolve(void 0);
          stream._inFlightCloseRequest = void 0;
          const state = stream._state;
          if (state === "erroring") {
            stream._storedError = void 0;
            if (stream._pendingAbortRequest !== void 0) {
              stream._pendingAbortRequest._resolve();
              stream._pendingAbortRequest = void 0;
            }
          }
          stream._state = "closed";
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseResolve(writer);
          }
        }
        function WritableStreamFinishInFlightCloseWithError(stream, error3) {
          stream._inFlightCloseRequest._reject(error3);
          stream._inFlightCloseRequest = void 0;
          if (stream._pendingAbortRequest !== void 0) {
            stream._pendingAbortRequest._reject(error3);
            stream._pendingAbortRequest = void 0;
          }
          WritableStreamDealWithRejection(stream, error3);
        }
        function WritableStreamCloseQueuedOrInFlight(stream) {
          if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamHasOperationMarkedInFlight(stream) {
          if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamMarkCloseRequestInFlight(stream) {
          stream._inFlightCloseRequest = stream._closeRequest;
          stream._closeRequest = void 0;
        }
        function WritableStreamMarkFirstWriteRequestInFlight(stream) {
          stream._inFlightWriteRequest = stream._writeRequests.shift();
        }
        function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
          if (stream._closeRequest !== void 0) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = void 0;
          }
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
          }
        }
        function WritableStreamUpdateBackpressure(stream, backpressure) {
          const writer = stream._writer;
          if (writer !== void 0 && backpressure !== stream._backpressure) {
            if (backpressure) {
              defaultWriterReadyPromiseReset(writer);
            } else {
              defaultWriterReadyPromiseResolve(writer);
            }
          }
          stream._backpressure = backpressure;
        }
        class WritableStreamDefaultWriter {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
              if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                defaultWriterReadyPromiseInitialize(this);
              } else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
              }
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
              defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
              defaultWriterReadyPromiseInitializeAsResolved(this);
              defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
              const storedError = stream._storedError;
              defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
              defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
          }
          get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("desiredSize");
            }
            if (this._ownerWritableStream === void 0) {
              throw defaultWriterLockException("desiredSize");
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
          }
          get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            }
            return this._readyPromise;
          }
          abort(reason = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("abort"));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
          }
          close() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("close"));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamDefaultWriterClose(this);
          }
          releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("releaseLock");
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return;
            }
            WritableStreamDefaultWriterRelease(this);
          }
          write(chunk = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("write to"));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
          }
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          releaseLock: { enumerable: true },
          write: { enumerable: true },
          closed: { enumerable: true },
          desiredSize: { enumerable: true },
          ready: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultWriter",
            configurable: true
          });
        }
        function IsWritableStreamDefaultWriter(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultWriter;
        }
        function WritableStreamDefaultWriterAbort(writer, reason) {
          const stream = writer._ownerWritableStream;
          return WritableStreamAbort(stream, reason);
        }
        function WritableStreamDefaultWriterClose(writer) {
          const stream = writer._ownerWritableStream;
          return WritableStreamClose(stream);
        }
        function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          return WritableStreamDefaultWriterClose(writer);
        }
        function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error3) {
          if (writer._closedPromiseState === "pending") {
            defaultWriterClosedPromiseReject(writer, error3);
          } else {
            defaultWriterClosedPromiseResetToRejected(writer, error3);
          }
        }
        function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error3) {
          if (writer._readyPromiseState === "pending") {
            defaultWriterReadyPromiseReject(writer, error3);
          } else {
            defaultWriterReadyPromiseResetToRejected(writer, error3);
          }
        }
        function WritableStreamDefaultWriterGetDesiredSize(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (state === "errored" || state === "erroring") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
        }
        function WritableStreamDefaultWriterRelease(writer) {
          const stream = writer._ownerWritableStream;
          const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
          WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
          WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
          stream._writer = void 0;
          writer._ownerWritableStream = void 0;
        }
        function WritableStreamDefaultWriterWrite(writer, chunk) {
          const stream = writer._ownerWritableStream;
          const controller = stream._writableStreamController;
          const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
          if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException("write to"));
          }
          const state = stream._state;
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
          }
          if (state === "erroring") {
            return promiseRejectedWith(stream._storedError);
          }
          const promise = WritableStreamAddWriteRequest(stream);
          WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
          return promise;
        }
        const closeSentinel = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("abortReason");
            }
            return this._abortReason;
          }
          get signal() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("signal");
            }
            if (this._abortController === void 0) {
              throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            }
            return this._abortController.signal;
          }
          error(e = void 0) {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("error");
            }
            const state = this._controlledWritableStream._state;
            if (state !== "writable") {
              return;
            }
            WritableStreamDefaultControllerError(this, e);
          }
          [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [ErrorSteps]() {
            ResetQueue(this);
          }
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          error: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultController",
            configurable: true
          });
        }
        function IsWritableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultController;
        }
        function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledWritableStream = stream;
          stream._writableStreamController = controller;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._abortReason = void 0;
          controller._abortController = createAbortController();
          controller._started = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._writeAlgorithm = writeAlgorithm;
          controller._closeAlgorithm = closeAlgorithm;
          controller._abortAlgorithm = abortAlgorithm;
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
          const startResult = startAlgorithm();
          const startPromise = promiseResolvedWith(startResult);
          uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (r) => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
          });
        }
        function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(WritableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let writeAlgorithm = () => promiseResolvedWith(void 0);
          let closeAlgorithm = () => promiseResolvedWith(void 0);
          let abortAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSink.start !== void 0) {
            startAlgorithm = () => underlyingSink.start(controller);
          }
          if (underlyingSink.write !== void 0) {
            writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
          }
          if (underlyingSink.close !== void 0) {
            closeAlgorithm = () => underlyingSink.close();
          }
          if (underlyingSink.abort !== void 0) {
            abortAlgorithm = (reason) => underlyingSink.abort(reason);
          }
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function WritableStreamDefaultControllerClearAlgorithms(controller) {
          controller._writeAlgorithm = void 0;
          controller._closeAlgorithm = void 0;
          controller._abortAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function WritableStreamDefaultControllerClose(controller) {
          EnqueueValueWithSize(controller, closeSentinel, 0);
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
          try {
            return controller._strategySizeAlgorithm(chunk);
          } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
          }
        }
        function WritableStreamDefaultControllerGetDesiredSize(controller) {
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
          try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
          } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
          }
          const stream = controller._controlledWritableStream;
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
          }
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
          const stream = controller._controlledWritableStream;
          if (!controller._started) {
            return;
          }
          if (stream._inFlightWriteRequest !== void 0) {
            return;
          }
          const state = stream._state;
          if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
          }
          if (controller._queue.length === 0) {
            return;
          }
          const value = PeekQueueValue(controller);
          if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
          } else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
          }
        }
        function WritableStreamDefaultControllerErrorIfNeeded(controller, error3) {
          if (controller._controlledWritableStream._state === "writable") {
            WritableStreamDefaultControllerError(controller, error3);
          }
        }
        function WritableStreamDefaultControllerProcessClose(controller) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkCloseRequestInFlight(stream);
          DequeueValue(controller);
          const sinkClosePromise = controller._closeAlgorithm();
          WritableStreamDefaultControllerClearAlgorithms(controller);
          uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
          }, (reason) => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkFirstWriteRequestInFlight(stream);
          const sinkWritePromise = controller._writeAlgorithm(chunk);
          uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
              const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
              WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (reason) => {
            if (stream._state === "writable") {
              WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerGetBackpressure(controller) {
          const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
          return desiredSize <= 0;
        }
        function WritableStreamDefaultControllerError(controller, error3) {
          const stream = controller._controlledWritableStream;
          WritableStreamDefaultControllerClearAlgorithms(controller);
          WritableStreamStartErroring(stream, error3);
        }
        function streamBrandCheckException$2(name2) {
          return new TypeError(`WritableStream.prototype.${name2} can only be used on a WritableStream`);
        }
        function defaultControllerBrandCheckException$2(name2) {
          return new TypeError(`WritableStreamDefaultController.prototype.${name2} can only be used on a WritableStreamDefaultController`);
        }
        function defaultWriterBrandCheckException(name2) {
          return new TypeError(`WritableStreamDefaultWriter.prototype.${name2} can only be used on a WritableStreamDefaultWriter`);
        }
        function defaultWriterLockException(name2) {
          return new TypeError("Cannot " + name2 + " a stream using a released writer");
        }
        function defaultWriterClosedPromiseInitialize(writer) {
          writer._closedPromise = newPromise((resolve2, reject) => {
            writer._closedPromise_resolve = resolve2;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
          });
        }
        function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseReject(writer, reason);
        }
        function defaultWriterClosedPromiseInitializeAsResolved(writer) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseResolve(writer);
        }
        function defaultWriterClosedPromiseReject(writer, reason) {
          if (writer._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._closedPromise);
          writer._closedPromise_reject(reason);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "rejected";
        }
        function defaultWriterClosedPromiseResetToRejected(writer, reason) {
          defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterClosedPromiseResolve(writer) {
          if (writer._closedPromise_resolve === void 0) {
            return;
          }
          writer._closedPromise_resolve(void 0);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "resolved";
        }
        function defaultWriterReadyPromiseInitialize(writer) {
          writer._readyPromise = newPromise((resolve2, reject) => {
            writer._readyPromise_resolve = resolve2;
            writer._readyPromise_reject = reject;
          });
          writer._readyPromiseState = "pending";
        }
        function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseReject(writer, reason);
        }
        function defaultWriterReadyPromiseInitializeAsResolved(writer) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseResolve(writer);
        }
        function defaultWriterReadyPromiseReject(writer, reason) {
          if (writer._readyPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._readyPromise);
          writer._readyPromise_reject(reason);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "rejected";
        }
        function defaultWriterReadyPromiseReset(writer) {
          defaultWriterReadyPromiseInitialize(writer);
        }
        function defaultWriterReadyPromiseResetToRejected(writer, reason) {
          defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterReadyPromiseResolve(writer) {
          if (writer._readyPromise_resolve === void 0) {
            return;
          }
          writer._readyPromise_resolve(void 0);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "fulfilled";
        }
        const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
        function isDOMExceptionConstructor(ctor) {
          if (!(typeof ctor === "function" || typeof ctor === "object")) {
            return false;
          }
          try {
            new ctor();
            return true;
          } catch (_a2) {
            return false;
          }
        }
        function createDOMExceptionPolyfill() {
          const ctor = function DOMException2(message2, name2) {
            this.message = message2 || "";
            this.name = name2 || "Error";
            if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
            }
          };
          ctor.prototype = Object.create(Error.prototype);
          Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
          return ctor;
        }
        const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
        function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
          const reader = AcquireReadableStreamDefaultReader(source);
          const writer = AcquireWritableStreamDefaultWriter(dest);
          source._disturbed = true;
          let shuttingDown = false;
          let currentWrite = promiseResolvedWith(void 0);
          return newPromise((resolve2, reject) => {
            let abortAlgorithm;
            if (signal !== void 0) {
              abortAlgorithm = () => {
                const error3 = new DOMException$1("Aborted", "AbortError");
                const actions = [];
                if (!preventAbort) {
                  actions.push(() => {
                    if (dest._state === "writable") {
                      return WritableStreamAbort(dest, error3);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                if (!preventCancel) {
                  actions.push(() => {
                    if (source._state === "readable") {
                      return ReadableStreamCancel(source, error3);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error3);
              };
              if (signal.aborted) {
                abortAlgorithm();
                return;
              }
              signal.addEventListener("abort", abortAlgorithm);
            }
            function pipeLoop() {
              return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                  if (done) {
                    resolveLoop();
                  } else {
                    PerformPromiseThen(pipeStep(), next, rejectLoop);
                  }
                }
                next(false);
              });
            }
            function pipeStep() {
              if (shuttingDown) {
                return promiseResolvedWith(true);
              }
              return PerformPromiseThen(writer._readyPromise, () => {
                return newPromise((resolveRead, rejectRead) => {
                  ReadableStreamDefaultReaderRead(reader, {
                    _chunkSteps: (chunk) => {
                      currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop2);
                      resolveRead(false);
                    },
                    _closeSteps: () => resolveRead(true),
                    _errorSteps: rejectRead
                  });
                });
              });
            }
            isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
              if (!preventAbort) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesClosed(source, reader._closedPromise, () => {
              if (!preventClose) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
              } else {
                shutdown();
              }
            });
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
              const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
              } else {
                shutdown(true, destClosed);
              }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
              const oldCurrentWrite = currentWrite;
              return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
            }
            function isOrBecomesErrored(stream, promise, action) {
              if (stream._state === "errored") {
                action(stream._storedError);
              } else {
                uponRejection(promise, action);
              }
            }
            function isOrBecomesClosed(stream, promise, action) {
              if (stream._state === "closed") {
                action();
              } else {
                uponFulfillment(promise, action);
              }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
              } else {
                doTheRest();
              }
              function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
              }
            }
            function shutdown(isError, error3) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error3));
              } else {
                finalize(isError, error3);
              }
            }
            function finalize(isError, error3) {
              WritableStreamDefaultWriterRelease(writer);
              ReadableStreamReaderGenericRelease(reader);
              if (signal !== void 0) {
                signal.removeEventListener("abort", abortAlgorithm);
              }
              if (isError) {
                reject(error3);
              } else {
                resolve2(void 0);
              }
            }
          });
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("desiredSize");
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("close");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits close");
            }
            ReadableStreamDefaultControllerClose(this);
          }
          enqueue(chunk = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("enqueue");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits enqueue");
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("error");
            }
            ReadableStreamDefaultControllerError(this, e);
          }
          [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const chunk = DequeueValue(this);
              if (this._closeRequested && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
              } else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
              }
              readRequest._chunkSteps(chunk);
            } else {
              ReadableStreamAddReadRequest(stream, readRequest);
              ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
          }
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultController",
            configurable: true
          });
        }
        function IsReadableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultController;
        }
        function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableStreamDefaultControllerError(controller, e);
          });
        }
        function ReadableStreamDefaultControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableStream;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableStreamDefaultControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function ReadableStreamDefaultControllerClose(controller) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          controller._closeRequested = true;
          if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
          }
        }
        function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
          } else {
            let chunkSize;
            try {
              chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
              ReadableStreamDefaultControllerError(controller, chunkSizeE);
              throw chunkSizeE;
            }
            try {
              EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
              ReadableStreamDefaultControllerError(controller, enqueueE);
              throw enqueueE;
            }
          }
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        function ReadableStreamDefaultControllerError(controller, e) {
          const stream = controller._controlledReadableStream;
          if (stream._state !== "readable") {
            return;
          }
          ResetQueue(controller);
          ReadableStreamDefaultControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableStreamDefaultControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableStreamDefaultControllerHasBackpressure(controller) {
          if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
          }
          return true;
        }
        function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
          const state = controller._controlledReadableStream._state;
          if (!controller._closeRequested && state === "readable") {
            return true;
          }
          return false;
        }
        function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledReadableStream = stream;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._started = false;
          controller._closeRequested = false;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableStreamDefaultControllerError(controller, r);
          });
        }
        function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSource.start !== void 0) {
            startAlgorithm = () => underlyingSource.start(controller);
          }
          if (underlyingSource.pull !== void 0) {
            pullAlgorithm = () => underlyingSource.pull(controller);
          }
          if (underlyingSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
          }
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function defaultControllerBrandCheckException$1(name2) {
          return new TypeError(`ReadableStreamDefaultController.prototype.${name2} can only be used on a ReadableStreamDefaultController`);
        }
        function ReadableStreamTee(stream, cloneForBranch2) {
          if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
          }
          return ReadableStreamDefaultTee(stream);
        }
        function ReadableStreamDefaultTee(stream, cloneForBranch2) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function pullAlgorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  const chunk2 = chunk;
                  if (!canceled1) {
                    ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
          }
          branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
          branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
          uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          });
          return [branch1, branch2];
        }
        function ReadableByteStreamTee(stream) {
          let reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r) => {
              if (thisReader !== reader) {
                return;
              }
              ReadableByteStreamControllerError(branch1._readableStreamController, r);
              ReadableByteStreamControllerError(branch2._readableStreamController, r);
              if (!canceled1 || !canceled2) {
                resolveCancelPromise(void 0);
              }
            });
          }
          function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamDefaultReader(stream);
              forwardReaderError(reader);
            }
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  let chunk2 = chunk;
                  if (!canceled1 && !canceled2) {
                    try {
                      chunk2 = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                  }
                  if (!canceled1) {
                    ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableByteStreamControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableByteStreamControllerClose(branch2._readableStreamController);
                }
                if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                }
                if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
          }
          function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamBYOBReader(stream);
              forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const byobCanceled = forBranch2 ? canceled2 : canceled1;
                  const otherCanceled = forBranch2 ? canceled1 : canceled2;
                  if (!otherCanceled) {
                    let clonedChunk;
                    try {
                      clonedChunk = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                    if (!byobCanceled) {
                      ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                    }
                    ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                  } else if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                });
              },
              _closeSteps: (chunk) => {
                reading = false;
                const byobCanceled = forBranch2 ? canceled2 : canceled1;
                const otherCanceled = forBranch2 ? canceled1 : canceled2;
                if (!byobCanceled) {
                  ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                }
                if (!otherCanceled) {
                  ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                }
                if (chunk !== void 0) {
                  if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                  if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                  }
                }
                if (!byobCanceled || !otherCanceled) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
          }
          function pull1Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(void 0);
          }
          function pull2Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
            return;
          }
          branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
          branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
          forwardReaderError(reader);
          return [branch1, branch2];
        }
        function convertUnderlyingDefaultOrByteSource(source, context) {
          assertDictionary(source, context);
          const original = source;
          const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
          const cancel = original === null || original === void 0 ? void 0 : original.cancel;
          const pull = original === null || original === void 0 ? void 0 : original.pull;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          return {
            autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
          };
        }
        function convertUnderlyingSourceCancelCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSourcePullCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertUnderlyingSourceStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertReadableStreamType(type, context) {
          type = `${type}`;
          if (type !== "bytes") {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
          }
          return type;
        }
        function convertReaderOptions(options2, context) {
          assertDictionary(options2, context);
          const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
          return {
            mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
          };
        }
        function convertReadableStreamReaderMode(mode, context) {
          mode = `${mode}`;
          if (mode !== "byob") {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
          }
          return mode;
        }
        function convertIteratorOptions(options2, context) {
          assertDictionary(options2, context);
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          return { preventCancel: Boolean(preventCancel) };
        }
        function convertPipeOptions(options2, context) {
          assertDictionary(options2, context);
          const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
          const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
          if (signal !== void 0) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
          }
          return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
          };
        }
        function assertAbortSignal(signal, context) {
          if (!isAbortSignal2(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
          }
        }
        function convertReadableWritablePair(pair, context) {
          assertDictionary(pair, context);
          const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
          assertRequiredField(readable, "readable", "ReadableWritablePair");
          assertReadableStream(readable, `${context} has member 'readable' that`);
          const writable3 = pair === null || pair === void 0 ? void 0 : pair.writable;
          assertRequiredField(writable3, "writable", "ReadableWritablePair");
          assertWritableStream(writable3, `${context} has member 'writable' that`);
          return { readable, writable: writable3 };
        }
        class ReadableStream2 {
          constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === void 0) {
              rawUnderlyingSource = null;
            } else {
              assertObject(rawUnderlyingSource, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
              if (strategy.size !== void 0) {
                throw new RangeError("The strategy for a byte stream cannot have a size function");
              }
              const highWaterMark = ExtractHighWaterMark(strategy, 0);
              SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
              const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
              const highWaterMark = ExtractHighWaterMark(strategy, 1);
              SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
          }
          get locked() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("locked");
            }
            return IsReadableStreamLocked(this);
          }
          cancel(reason = void 0) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            }
            return ReadableStreamCancel(this, reason);
          }
          getReader(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("getReader");
            }
            const options2 = convertReaderOptions(rawOptions, "First parameter");
            if (options2.mode === void 0) {
              return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
          }
          pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("pipeThrough");
            }
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options2 = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            }
            if (IsWritableStreamLocked(transform.writable)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
          }
          pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            }
            if (destination === void 0) {
              return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
              return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options2;
            try {
              options2 = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
              return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            }
            if (IsWritableStreamLocked(destination)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            }
            return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
          }
          tee() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("tee");
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
          }
          values(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("values");
            }
            const options2 = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
          }
        }
        Object.defineProperties(ReadableStream2.prototype, {
          cancel: { enumerable: true },
          getReader: { enumerable: true },
          pipeThrough: { enumerable: true },
          pipeTo: { enumerable: true },
          tee: { enumerable: true },
          values: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStream",
            configurable: true
          });
        }
        if (typeof SymbolPolyfill.asyncIterator === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream2.prototype.values,
            writable: true,
            configurable: true
          });
        }
        function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableByteStreamController.prototype);
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
          return stream;
        }
        function InitializeReadableStream(stream) {
          stream._state = "readable";
          stream._reader = void 0;
          stream._storedError = void 0;
          stream._disturbed = false;
        }
        function IsReadableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
            return false;
          }
          return x instanceof ReadableStream2;
        }
        function IsReadableStreamLocked(stream) {
          if (stream._reader === void 0) {
            return false;
          }
          return true;
        }
        function ReadableStreamCancel(stream, reason) {
          stream._disturbed = true;
          if (stream._state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (stream._state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          ReadableStreamClose(stream);
          const reader = stream._reader;
          if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._closeSteps(void 0);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
          const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
          return transformPromiseWith(sourceCancelPromise, noop2);
        }
        function ReadableStreamClose(stream) {
          stream._state = "closed";
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseResolve(reader);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
          }
        }
        function ReadableStreamError(stream, e) {
          stream._state = "errored";
          stream._storedError = e;
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseReject(reader, e);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
          } else {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
        }
        function streamBrandCheckException$1(name2) {
          return new TypeError(`ReadableStream.prototype.${name2} can only be used on a ReadableStream`);
        }
        function convertQueuingStrategyInit(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
          return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
          };
        }
        const byteLengthSizeFunction = (chunk) => {
          return chunk.byteLength;
        };
        Object.defineProperty(byteLengthSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class ByteLengthQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("highWaterMark");
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("size");
            }
            return byteLengthSizeFunction;
          }
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "ByteLengthQueuingStrategy",
            configurable: true
          });
        }
        function byteLengthBrandCheckException(name2) {
          return new TypeError(`ByteLengthQueuingStrategy.prototype.${name2} can only be used on a ByteLengthQueuingStrategy`);
        }
        function IsByteLengthQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof ByteLengthQueuingStrategy;
        }
        const countSizeFunction = () => {
          return 1;
        };
        Object.defineProperty(countSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class CountQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "CountQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("highWaterMark");
            }
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("size");
            }
            return countSizeFunction;
          }
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "CountQueuingStrategy",
            configurable: true
          });
        }
        function countBrandCheckException(name2) {
          return new TypeError(`CountQueuingStrategy.prototype.${name2} can only be used on a CountQueuingStrategy`);
        }
        function IsCountQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof CountQueuingStrategy;
        }
        function convertTransformer(original, context) {
          assertDictionary(original, context);
          const flush = original === null || original === void 0 ? void 0 : original.flush;
          const readableType = original === null || original === void 0 ? void 0 : original.readableType;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const transform = original === null || original === void 0 ? void 0 : original.transform;
          const writableType = original === null || original === void 0 ? void 0 : original.writableType;
          return {
            flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType,
            start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
          };
        }
        function convertTransformerFlushCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertTransformerStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertTransformerTransformCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        class TransformStream {
          constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === void 0) {
              rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== void 0) {
              throw new RangeError("Invalid readableType specified");
            }
            if (transformer.writableType !== void 0) {
              throw new RangeError("Invalid writableType specified");
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve2) => {
              startPromise_resolve = resolve2;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== void 0) {
              startPromise_resolve(transformer.start(this._transformStreamController));
            } else {
              startPromise_resolve(void 0);
            }
          }
          get readable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("readable");
            }
            return this._readable;
          }
          get writable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("writable");
            }
            return this._writable;
          }
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: true },
          writable: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStream",
            configurable: true
          });
        }
        function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
          function startAlgorithm() {
            return startPromise;
          }
          function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
          }
          function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
          }
          function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
          }
          stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
          function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
          }
          function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(void 0);
          }
          stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
          stream._backpressure = void 0;
          stream._backpressureChangePromise = void 0;
          stream._backpressureChangePromise_resolve = void 0;
          TransformStreamSetBackpressure(stream, true);
          stream._transformStreamController = void 0;
        }
        function IsTransformStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
            return false;
          }
          return x instanceof TransformStream;
        }
        function TransformStreamError(stream, e) {
          ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
          TransformStreamErrorWritableAndUnblockWrite(stream, e);
        }
        function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
          TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
          WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
          if (stream._backpressure) {
            TransformStreamSetBackpressure(stream, false);
          }
        }
        function TransformStreamSetBackpressure(stream, backpressure) {
          if (stream._backpressureChangePromise !== void 0) {
            stream._backpressureChangePromise_resolve();
          }
          stream._backpressureChangePromise = newPromise((resolve2) => {
            stream._backpressureChangePromise_resolve = resolve2;
          });
          stream._backpressure = backpressure;
        }
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("desiredSize");
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
          }
          enqueue(chunk = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("enqueue");
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
          }
          error(reason = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("error");
            }
            TransformStreamDefaultControllerError(this, reason);
          }
          terminate() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("terminate");
            }
            TransformStreamDefaultControllerTerminate(this);
          }
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: true },
          error: { enumerable: true },
          terminate: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStreamDefaultController",
            configurable: true
          });
        }
        function IsTransformStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
            return false;
          }
          return x instanceof TransformStreamDefaultController;
        }
        function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
          controller._controlledTransformStream = stream;
          stream._transformStreamController = controller;
          controller._transformAlgorithm = transformAlgorithm;
          controller._flushAlgorithm = flushAlgorithm;
        }
        function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
          const controller = Object.create(TransformStreamDefaultController.prototype);
          let transformAlgorithm = (chunk) => {
            try {
              TransformStreamDefaultControllerEnqueue(controller, chunk);
              return promiseResolvedWith(void 0);
            } catch (transformResultE) {
              return promiseRejectedWith(transformResultE);
            }
          };
          let flushAlgorithm = () => promiseResolvedWith(void 0);
          if (transformer.transform !== void 0) {
            transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
          }
          if (transformer.flush !== void 0) {
            flushAlgorithm = () => transformer.flush(controller);
          }
          SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
        }
        function TransformStreamDefaultControllerClearAlgorithms(controller) {
          controller._transformAlgorithm = void 0;
          controller._flushAlgorithm = void 0;
        }
        function TransformStreamDefaultControllerEnqueue(controller, chunk) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError("Readable side is not in a state that permits enqueue");
          }
          try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
          } catch (e) {
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
          }
          const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
          if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
          }
        }
        function TransformStreamDefaultControllerError(controller, e) {
          TransformStreamError(controller._controlledTransformStream, e);
        }
        function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
          const transformPromise = controller._transformAlgorithm(chunk);
          return transformPromiseWith(transformPromise, void 0, (r) => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
          });
        }
        function TransformStreamDefaultControllerTerminate(controller) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          ReadableStreamDefaultControllerClose(readableController);
          const error3 = new TypeError("TransformStream terminated");
          TransformStreamErrorWritableAndUnblockWrite(stream, error3);
        }
        function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
          const controller = stream._transformStreamController;
          if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
              const writable3 = stream._writable;
              const state = writable3._state;
              if (state === "erroring") {
                throw writable3._storedError;
              }
              return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        }
        function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
          TransformStreamError(stream, reason);
          return promiseResolvedWith(void 0);
        }
        function TransformStreamDefaultSinkCloseAlgorithm(stream) {
          const readable = stream._readable;
          const controller = stream._transformStreamController;
          const flushPromise = controller._flushAlgorithm();
          TransformStreamDefaultControllerClearAlgorithms(controller);
          return transformPromiseWith(flushPromise, () => {
            if (readable._state === "errored") {
              throw readable._storedError;
            }
            ReadableStreamDefaultControllerClose(readable._readableStreamController);
          }, (r) => {
            TransformStreamError(stream, r);
            throw readable._storedError;
          });
        }
        function TransformStreamDefaultSourcePullAlgorithm(stream) {
          TransformStreamSetBackpressure(stream, false);
          return stream._backpressureChangePromise;
        }
        function defaultControllerBrandCheckException(name2) {
          return new TypeError(`TransformStreamDefaultController.prototype.${name2} can only be used on a TransformStreamDefaultController`);
        }
        function streamBrandCheckException(name2) {
          return new TypeError(`TransformStream.prototype.${name2} can only be used on a TransformStream`);
        }
        exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
        exports2.CountQueuingStrategy = CountQueuingStrategy;
        exports2.ReadableByteStreamController = ReadableByteStreamController;
        exports2.ReadableStream = ReadableStream2;
        exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
        exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
        exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
        exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
        exports2.TransformStream = TransformStream;
        exports2.TransformStreamDefaultController = TransformStreamDefaultController;
        exports2.WritableStream = WritableStream;
        exports2.WritableStreamDefaultController = WritableStreamDefaultController;
        exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    })(ponyfill_es2018, ponyfill_es2018.exports);
    POOL_SIZE$1 = 65536;
    if (!globalThis.ReadableStream) {
      try {
        const process2 = require("node:process");
        const { emitWarning } = process2;
        try {
          process2.emitWarning = () => {
          };
          Object.assign(globalThis, require("node:stream/web"));
          process2.emitWarning = emitWarning;
        } catch (error3) {
          process2.emitWarning = emitWarning;
          throw error3;
        }
      } catch (error3) {
        Object.assign(globalThis, ponyfill_es2018.exports);
      }
    }
    try {
      const { Blob: Blob2 } = require("buffer");
      if (Blob2 && !Blob2.prototype.stream) {
        Blob2.prototype.stream = function name2(params) {
          let position = 0;
          const blob = this;
          return new ReadableStream({
            type: "bytes",
            async pull(ctrl) {
              const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
              const buffer = await chunk.arrayBuffer();
              position += buffer.byteLength;
              ctrl.enqueue(new Uint8Array(buffer));
              if (position === blob.size) {
                ctrl.close();
              }
            }
          });
        };
      }
    } catch (error3) {
    }
    POOL_SIZE = 65536;
    _Blob = (_a = class {
      constructor(blobParts = [], options2 = {}) {
        __privateAdd(this, _parts, []);
        __privateAdd(this, _type, "");
        __privateAdd(this, _size, 0);
        if (typeof blobParts !== "object" || blobParts === null) {
          throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
        }
        if (typeof blobParts[Symbol.iterator] !== "function") {
          throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
        }
        if (typeof options2 !== "object" && typeof options2 !== "function") {
          throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
        }
        if (options2 === null)
          options2 = {};
        const encoder = new TextEncoder();
        for (const element of blobParts) {
          let part;
          if (ArrayBuffer.isView(element)) {
            part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
          } else if (element instanceof ArrayBuffer) {
            part = new Uint8Array(element.slice(0));
          } else if (element instanceof _a) {
            part = element;
          } else {
            part = encoder.encode(element);
          }
          __privateSet(this, _size, __privateGet(this, _size) + (ArrayBuffer.isView(part) ? part.byteLength : part.size));
          __privateGet(this, _parts).push(part);
        }
        const type = options2.type === void 0 ? "" : String(options2.type);
        __privateSet(this, _type, /^[\x20-\x7E]*$/.test(type) ? type : "");
      }
      get size() {
        return __privateGet(this, _size);
      }
      get type() {
        return __privateGet(this, _type);
      }
      async text() {
        const decoder = new TextDecoder();
        let str = "";
        for await (const part of toIterator(__privateGet(this, _parts), false)) {
          str += decoder.decode(part, { stream: true });
        }
        str += decoder.decode();
        return str;
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of toIterator(__privateGet(this, _parts), false)) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        const it = toIterator(__privateGet(this, _parts), true);
        return new globalThis.ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = await it.next();
            chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
          },
          async cancel() {
            await it.return();
          }
        });
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = __privateGet(this, _parts);
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          if (added >= span) {
            break;
          }
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            let chunk;
            if (ArrayBuffer.isView(part)) {
              chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.byteLength;
            } else {
              chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.size;
            }
            relativeEnd -= size2;
            blobParts.push(chunk);
            relativeStart = 0;
          }
        }
        const blob = new _a([], { type: String(type).toLowerCase() });
        __privateSet(blob, _size, span);
        __privateSet(blob, _parts, blobParts);
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    }, _parts = new WeakMap(), _type = new WeakMap(), _size = new WeakMap(), _a);
    Object.defineProperties(_Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Blob = _Blob;
    Blob$1 = Blob;
    FetchBaseError = class extends Error {
      constructor(message2, type) {
        super(message2);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message2, type, systemError) {
        super(message2, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (error_) => {
            const error3 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance2, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance2;
      if (instance2.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance2[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        import_stream.default.Readable.from(body.stream()).pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name2) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name2)) {
        const error3 = new TypeError(`Header name must be a valid HTTP token [${name2}]`);
        Object.defineProperty(error3, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw error3;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name2, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error3 = new TypeError(`Invalid character in header content ["${name2}"]`);
        Object.defineProperty(error3, "code", { value: "ERR_INVALID_CHAR" });
        throw error3;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name2, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name2, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name2, value]) => {
          validateHeaderName(name2);
          validateHeaderValue(name2, String(value));
          return [String(name2).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name2, value) => {
                  validateHeaderName(name2);
                  validateHeaderValue(name2, String(value));
                  return URLSearchParams.prototype[p].call(target, String(name2).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name2) => {
                  validateHeaderName(name2);
                  return URLSearchParams.prototype[p].call(target, String(name2).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name2) {
        const values = this.getAll(name2);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name2)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback, thisArg = void 0) {
        for (const name2 of this.keys()) {
          Reflect.apply(callback, thisArg, [this.get(name2), name2, this]);
        }
      }
      *values() {
        for (const name2 of this.keys()) {
          yield this.get(name2);
        }
      }
      *entries() {
        for (const name2 of this.keys()) {
          yield [name2, this.get(name2)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status != null ? options2.status : 200;
        const headers2 = new Headers(options2.headers);
        if (body !== null && !headers2.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers2.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          type: "default",
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers: headers2,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get type() {
        return this[INTERNALS$1].type;
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          type: this.type,
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url2, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url2).toString()
          },
          status
        });
      }
      static error() {
        const response = new Response(null, { status: 0, statusText: "" });
        response[INTERNALS$1].type = "error";
        return response;
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      type: { enumerable: true },
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers2 = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers2.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers2.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers: headers2,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers2 = new Headers(request[INTERNALS].headers);
      if (!headers2.has("Accept")) {
        headers2.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers2.set("Content-Length", contentLengthValue);
      }
      if (!headers2.has("User-Agent")) {
        headers2.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers2.has("Accept-Encoding")) {
        headers2.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers2.has("Connection") && !agent) {
        headers2.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers2[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message2, type = "aborted") {
        super(message2, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/svelte-adapter-firebase/src/files/shims.js
var init_shims = __esm({
  "node_modules/svelte-adapter-firebase/src/files/shims.js"() {
    init_install_fetch();
  }
});

// .svelte-kit/output/server/chunks/__layout-2812f51c.js
var layout_2812f51c_exports = {};
__export(layout_2812f51c_exports, {
  default: () => _layout
});
function deepCopy(value) {
  return deepExtend(void 0, value);
}
function deepExtend(target, source) {
  if (!(source instanceof Object)) {
    return source;
  }
  switch (source.constructor) {
    case Date:
      const dateValue = source;
      return new Date(dateValue.getTime());
    case Object:
      if (target === void 0) {
        target = {};
      }
      break;
    case Array:
      target = [];
      break;
    default:
      return source;
  }
  for (const prop in source) {
    if (!source.hasOwnProperty(prop) || !isValidKey$1(prop)) {
      continue;
    }
    target[prop] = deepExtend(target[prop], source[prop]);
  }
  return target;
}
function isValidKey$1(key) {
  return key !== "__proto__";
}
function getUA() {
  if (typeof navigator !== "undefined" && typeof navigator["userAgent"] === "string") {
    return navigator["userAgent"];
  } else {
    return "";
  }
}
function isMobileCordova() {
  return typeof window !== "undefined" && !!(window["cordova"] || window["phonegap"] || window["PhoneGap"]) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA());
}
function isReactNative() {
  return typeof navigator === "object" && navigator["product"] === "ReactNative";
}
function isNodeSdk() {
  return CONSTANTS.NODE_CLIENT === true || CONSTANTS.NODE_ADMIN === true;
}
function jsonEval(str) {
  return JSON.parse(str);
}
function stringify(data) {
  return JSON.stringify(data);
}
function contains(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function safeGet(obj, key) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key];
  } else {
    return void 0;
  }
}
function isEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}
function map(obj, fn, contextObj) {
  const res = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      res[key] = fn.call(contextObj, obj[key], key, obj);
    }
  }
  return res;
}
function querystring(querystringParams) {
  const params = [];
  for (const [key, value] of Object.entries(querystringParams)) {
    if (Array.isArray(value)) {
      value.forEach((arrayVal) => {
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(arrayVal));
      });
    } else {
      params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
  }
  return params.length ? "&" + params.join("&") : "";
}
function errorPrefix(fnName, argName) {
  return `${fnName} failed: ${argName} argument `;
}
function getModularInstance(service) {
  if (service && service._delegate) {
    return service._delegate;
  } else {
    return service;
  }
}
function isVersionServiceProvider(provider) {
  const component = provider.getComponent();
  return (component === null || component === void 0 ? void 0 : component.type) === "VERSION";
}
function _addComponent(app2, component) {
  try {
    app2.container.addComponent(component);
  } catch (e) {
    logger$1.debug(`Component ${component.name} failed to register with FirebaseApp ${app2.name}`, e);
  }
}
function _registerComponent(component) {
  const componentName = component.name;
  if (_components.has(componentName)) {
    logger$1.debug(`There were multiple attempts to register component ${componentName}.`);
    return false;
  }
  _components.set(componentName, component);
  for (const app2 of _apps.values()) {
    _addComponent(app2, component);
  }
  return true;
}
function registerVersion(libraryKeyOrName, version2, variant) {
  var _a2;
  let library = (_a2 = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a2 !== void 0 ? _a2 : libraryKeyOrName;
  if (variant) {
    library += `-${variant}`;
  }
  const libraryMismatch = library.match(/\s|\//);
  const versionMismatch = version2.match(/\s|\//);
  if (libraryMismatch || versionMismatch) {
    const warning = [
      `Unable to register library "${library}" with version "${version2}":`
    ];
    if (libraryMismatch) {
      warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
    }
    if (libraryMismatch && versionMismatch) {
      warning.push("and");
    }
    if (versionMismatch) {
      warning.push(`version name "${version2}" contains illegal characters (whitespace or "/")`);
    }
    logger$1.warn(warning.join(" "));
    return;
  }
  _registerComponent(new Component(`${library}-version`, () => ({ library, version: version2 }), "VERSION"));
}
function registerCoreComponents(variant) {
  _registerComponent(new Component("platform-logger", (container) => new PlatformLoggerServiceImpl(container), "PRIVATE"));
  registerVersion(name$o, version$1$1, variant);
  registerVersion(name$o, version$1$1, "esm2017");
  registerVersion("fire-js", "");
}
function HTTPParser(type) {
  assert.ok(type === HTTPParser.REQUEST || type === HTTPParser.RESPONSE || type === void 0);
  if (type === void 0)
    ;
  else {
    this.initialize(type);
  }
}
function parseErrorCode(code) {
  var err = new Error("Parse Error");
  err.code = code;
  return err;
}
function each(obj, fn) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn(key, obj[key]);
    }
  }
}
function repoInfoNeedsQueryParam(repoInfo) {
  return repoInfo.host !== repoInfo.internalHost || repoInfo.isCustomHost() || repoInfo.includeNamespaceInQueryParams;
}
function repoInfoConnectionURL(repoInfo, type, params) {
  assert$1(typeof type === "string", "typeof type must == string");
  assert$1(typeof params === "object", "typeof params must == object");
  let connURL;
  if (type === WEBSOCKET) {
    connURL = (repoInfo.secure ? "wss://" : "ws://") + repoInfo.internalHost + "/.ws?";
  } else if (type === LONG_POLLING) {
    connURL = (repoInfo.secure ? "https://" : "http://") + repoInfo.internalHost + "/.lp?";
  } else {
    throw new Error("Unknown connection type: " + type);
  }
  if (repoInfoNeedsQueryParam(repoInfo)) {
    params["ns"] = repoInfo.namespace;
  }
  const pairs = [];
  each(params, (key, value) => {
    pairs.push(key + "=" + value);
  });
  return connURL + pairs.join("&");
}
function statsManagerGetCollection(repoInfo) {
  const hashString = repoInfo.toString();
  if (!collections[hashString]) {
    collections[hashString] = new StatsCollection();
  }
  return collections[hashString];
}
function statsManagerGetOrCreateReporter(repoInfo, creatorFunction) {
  const hashString = repoInfo.toString();
  if (!reporters[hashString]) {
    reporters[hashString] = creatorFunction();
  }
  return reporters[hashString];
}
function setSDKVersion(version2) {
  SDK_VERSION = version2;
}
function setWebSocketImpl(impl) {
  WebSocketImpl = impl;
}
function newEmptyPath() {
  return new Path("");
}
function pathGetFront(path) {
  if (path.pieceNum_ >= path.pieces_.length) {
    return null;
  }
  return path.pieces_[path.pieceNum_];
}
function pathGetLength(path) {
  return path.pieces_.length - path.pieceNum_;
}
function pathPopFront(path) {
  let pieceNum = path.pieceNum_;
  if (pieceNum < path.pieces_.length) {
    pieceNum++;
  }
  return new Path(path.pieces_, pieceNum);
}
function pathGetBack(path) {
  if (path.pieceNum_ < path.pieces_.length) {
    return path.pieces_[path.pieces_.length - 1];
  }
  return null;
}
function pathToUrlEncodedString(path) {
  let pathString = "";
  for (let i = path.pieceNum_; i < path.pieces_.length; i++) {
    if (path.pieces_[i] !== "") {
      pathString += "/" + encodeURIComponent(String(path.pieces_[i]));
    }
  }
  return pathString || "/";
}
function pathSlice(path, begin = 0) {
  return path.pieces_.slice(path.pieceNum_ + begin);
}
function pathParent(path) {
  if (path.pieceNum_ >= path.pieces_.length) {
    return null;
  }
  const pieces = [];
  for (let i = path.pieceNum_; i < path.pieces_.length - 1; i++) {
    pieces.push(path.pieces_[i]);
  }
  return new Path(pieces, 0);
}
function pathChild(path, childPathObj) {
  const pieces = [];
  for (let i = path.pieceNum_; i < path.pieces_.length; i++) {
    pieces.push(path.pieces_[i]);
  }
  if (childPathObj instanceof Path) {
    for (let i = childPathObj.pieceNum_; i < childPathObj.pieces_.length; i++) {
      pieces.push(childPathObj.pieces_[i]);
    }
  } else {
    const childPieces = childPathObj.split("/");
    for (let i = 0; i < childPieces.length; i++) {
      if (childPieces[i].length > 0) {
        pieces.push(childPieces[i]);
      }
    }
  }
  return new Path(pieces, 0);
}
function pathIsEmpty(path) {
  return path.pieceNum_ >= path.pieces_.length;
}
function newRelativePath(outerPath, innerPath) {
  const outer = pathGetFront(outerPath), inner = pathGetFront(innerPath);
  if (outer === null) {
    return innerPath;
  } else if (outer === inner) {
    return newRelativePath(pathPopFront(outerPath), pathPopFront(innerPath));
  } else {
    throw new Error("INTERNAL ERROR: innerPath (" + innerPath + ") is not within outerPath (" + outerPath + ")");
  }
}
function pathEquals(path, other) {
  if (pathGetLength(path) !== pathGetLength(other)) {
    return false;
  }
  for (let i = path.pieceNum_, j = other.pieceNum_; i <= path.pieces_.length; i++, j++) {
    if (path.pieces_[i] !== other.pieces_[j]) {
      return false;
    }
  }
  return true;
}
function pathContains(path, other) {
  let i = path.pieceNum_;
  let j = other.pieceNum_;
  if (pathGetLength(path) > pathGetLength(other)) {
    return false;
  }
  while (i < path.pieces_.length) {
    if (path.pieces_[i] !== other.pieces_[j]) {
      return false;
    }
    ++i;
    ++j;
  }
  return true;
}
function validationPathPush(validationPath, child) {
  if (validationPath.parts_.length > 0) {
    validationPath.byteLength_ += 1;
  }
  validationPath.parts_.push(child);
  validationPath.byteLength_ += stringLength(child);
  validationPathCheckValid(validationPath);
}
function validationPathPop(validationPath) {
  const last = validationPath.parts_.pop();
  validationPath.byteLength_ -= stringLength(last);
  if (validationPath.parts_.length > 0) {
    validationPath.byteLength_ -= 1;
  }
}
function validationPathCheckValid(validationPath) {
  if (validationPath.byteLength_ > MAX_PATH_LENGTH_BYTES) {
    throw new Error(validationPath.errorPrefix_ + "has a key path longer than " + MAX_PATH_LENGTH_BYTES + " bytes (" + validationPath.byteLength_ + ").");
  }
  if (validationPath.parts_.length > MAX_PATH_DEPTH) {
    throw new Error(validationPath.errorPrefix_ + "path specified exceeds the maximum depth that can be written (" + MAX_PATH_DEPTH + ") or object contains a cycle " + validationPathToErrorString(validationPath));
  }
}
function validationPathToErrorString(validationPath) {
  if (validationPath.parts_.length === 0) {
    return "";
  }
  return "in property '" + validationPath.parts_.join(".") + "'";
}
function NAME_ONLY_COMPARATOR(left, right) {
  return nameCompare(left.name, right.name);
}
function NAME_COMPARATOR(left, right) {
  return nameCompare(left, right);
}
function setMaxNode$1(val) {
  MAX_NODE$2 = val;
}
function setNodeFromJSON(val) {
  nodeFromJSON$1 = val;
}
function setMaxNode(val) {
  MAX_NODE$1 = val;
}
function nodeFromJSON(json, priority = null) {
  if (json === null) {
    return ChildrenNode.EMPTY_NODE;
  }
  if (typeof json === "object" && ".priority" in json) {
    priority = json[".priority"];
  }
  assert$1(priority === null || typeof priority === "string" || typeof priority === "number" || typeof priority === "object" && ".sv" in priority, "Invalid priority type found: " + typeof priority);
  if (typeof json === "object" && ".value" in json && json[".value"] !== null) {
    json = json[".value"];
  }
  if (typeof json !== "object" || ".sv" in json) {
    const jsonLeaf = json;
    return new LeafNode(jsonLeaf, nodeFromJSON(priority));
  }
  if (!(json instanceof Array) && USE_HINZE) {
    const children = [];
    let childrenHavePriority = false;
    const hinzeJsonObj = json;
    each(hinzeJsonObj, (key, child) => {
      if (key.substring(0, 1) !== ".") {
        const childNode = nodeFromJSON(child);
        if (!childNode.isEmpty()) {
          childrenHavePriority = childrenHavePriority || !childNode.getPriority().isEmpty();
          children.push(new NamedNode(key, childNode));
        }
      }
    });
    if (children.length === 0) {
      return ChildrenNode.EMPTY_NODE;
    }
    const childSet = buildChildSet(children, NAME_ONLY_COMPARATOR, (namedNode) => namedNode.name, NAME_COMPARATOR);
    if (childrenHavePriority) {
      const sortedChildSet = buildChildSet(children, PRIORITY_INDEX.getCompare());
      return new ChildrenNode(childSet, nodeFromJSON(priority), new IndexMap({ ".priority": sortedChildSet }, { ".priority": PRIORITY_INDEX }));
    } else {
      return new ChildrenNode(childSet, nodeFromJSON(priority), IndexMap.Default);
    }
  } else {
    let node = ChildrenNode.EMPTY_NODE;
    each(json, (key, childData) => {
      if (contains(json, key)) {
        if (key.substring(0, 1) !== ".") {
          const childNode = nodeFromJSON(childData);
          if (childNode.isLeafNode() || !childNode.isEmpty()) {
            node = node.updateImmediateChild(key, childNode);
          }
        }
      }
    });
    return node.updatePriority(nodeFromJSON(priority));
  }
}
function changeValue(snapshotNode) {
  return { type: "value", snapshotNode };
}
function changeChildAdded(childName, snapshotNode) {
  return { type: "child_added", snapshotNode, childName };
}
function changeChildRemoved(childName, snapshotNode) {
  return { type: "child_removed", snapshotNode, childName };
}
function changeChildChanged(childName, snapshotNode, oldSnap) {
  return {
    type: "child_changed",
    snapshotNode,
    childName,
    oldSnap
  };
}
function changeChildMoved(childName, snapshotNode) {
  return { type: "child_moved", snapshotNode, childName };
}
function queryParamsToRestQueryStringParameters(queryParams) {
  const qs = {};
  if (queryParams.isDefault()) {
    return qs;
  }
  let orderBy;
  if (queryParams.index_ === PRIORITY_INDEX) {
    orderBy = "$priority";
  } else if (queryParams.index_ === VALUE_INDEX) {
    orderBy = "$value";
  } else if (queryParams.index_ === KEY_INDEX) {
    orderBy = "$key";
  } else {
    assert$1(queryParams.index_ instanceof PathIndex, "Unrecognized index type!");
    orderBy = queryParams.index_.toString();
  }
  qs["orderBy"] = stringify(orderBy);
  if (queryParams.startSet_) {
    qs["startAt"] = stringify(queryParams.indexStartValue_);
    if (queryParams.startNameSet_) {
      qs["startAt"] += "," + stringify(queryParams.indexStartName_);
    }
  }
  if (queryParams.endSet_) {
    qs["endAt"] = stringify(queryParams.indexEndValue_);
    if (queryParams.endNameSet_) {
      qs["endAt"] += "," + stringify(queryParams.indexEndName_);
    }
  }
  if (queryParams.limitSet_) {
    if (queryParams.isViewFromLeft()) {
      qs["limitToFirst"] = queryParams.limit_;
    } else {
      qs["limitToLast"] = queryParams.limit_;
    }
  }
  return qs;
}
function queryParamsGetQueryObject(queryParams) {
  const obj = {};
  if (queryParams.startSet_) {
    obj["sp"] = queryParams.indexStartValue_;
    if (queryParams.startNameSet_) {
      obj["sn"] = queryParams.indexStartName_;
    }
  }
  if (queryParams.endSet_) {
    obj["ep"] = queryParams.indexEndValue_;
    if (queryParams.endNameSet_) {
      obj["en"] = queryParams.indexEndName_;
    }
  }
  if (queryParams.limitSet_) {
    obj["l"] = queryParams.limit_;
    let viewFrom = queryParams.viewFrom_;
    if (viewFrom === "") {
      if (queryParams.isViewFromLeft()) {
        viewFrom = "l";
      } else {
        viewFrom = "r";
      }
    }
    obj["vf"] = viewFrom;
  }
  if (queryParams.index_ !== PRIORITY_INDEX) {
    obj["i"] = queryParams.index_.toString();
  }
  return obj;
}
function newSparseSnapshotTree() {
  return {
    value: null,
    children: new Map()
  };
}
function sparseSnapshotTreeRemember(sparseSnapshotTree, path, data) {
  if (pathIsEmpty(path)) {
    sparseSnapshotTree.value = data;
    sparseSnapshotTree.children.clear();
  } else if (sparseSnapshotTree.value !== null) {
    sparseSnapshotTree.value = sparseSnapshotTree.value.updateChild(path, data);
  } else {
    const childKey = pathGetFront(path);
    if (!sparseSnapshotTree.children.has(childKey)) {
      sparseSnapshotTree.children.set(childKey, newSparseSnapshotTree());
    }
    const child = sparseSnapshotTree.children.get(childKey);
    path = pathPopFront(path);
    sparseSnapshotTreeRemember(child, path, data);
  }
}
function sparseSnapshotTreeForEachTree(sparseSnapshotTree, prefixPath, func) {
  if (sparseSnapshotTree.value !== null) {
    func(prefixPath, sparseSnapshotTree.value);
  } else {
    sparseSnapshotTreeForEachChild(sparseSnapshotTree, (key, tree) => {
      const path = new Path(prefixPath.toString() + "/" + key);
      sparseSnapshotTreeForEachTree(tree, path, func);
    });
  }
}
function sparseSnapshotTreeForEachChild(sparseSnapshotTree, func) {
  sparseSnapshotTree.children.forEach((tree, key) => {
    func(key, tree);
  });
}
function newOperationSourceUser() {
  return {
    fromUser: true,
    fromServer: false,
    queryId: null,
    tagged: false
  };
}
function newOperationSourceServer() {
  return {
    fromUser: false,
    fromServer: true,
    queryId: null,
    tagged: false
  };
}
function newOperationSourceServerTaggedQuery(queryId) {
  return {
    fromUser: false,
    fromServer: true,
    queryId,
    tagged: true
  };
}
function eventGeneratorGenerateEventsForChanges(eventGenerator, changes, eventCache, eventRegistrations) {
  const events = [];
  const moves = [];
  changes.forEach((change) => {
    if (change.type === "child_changed" && eventGenerator.index_.indexedValueChanged(change.oldSnap, change.snapshotNode)) {
      moves.push(changeChildMoved(change.childName, change.snapshotNode));
    }
  });
  eventGeneratorGenerateEventsForType(eventGenerator, events, "child_removed", changes, eventRegistrations, eventCache);
  eventGeneratorGenerateEventsForType(eventGenerator, events, "child_added", changes, eventRegistrations, eventCache);
  eventGeneratorGenerateEventsForType(eventGenerator, events, "child_moved", moves, eventRegistrations, eventCache);
  eventGeneratorGenerateEventsForType(eventGenerator, events, "child_changed", changes, eventRegistrations, eventCache);
  eventGeneratorGenerateEventsForType(eventGenerator, events, "value", changes, eventRegistrations, eventCache);
  return events;
}
function eventGeneratorGenerateEventsForType(eventGenerator, events, eventType, changes, registrations, eventCache) {
  const filteredChanges = changes.filter((change) => change.type === eventType);
  filteredChanges.sort((a, b) => eventGeneratorCompareChanges(eventGenerator, a, b));
  filteredChanges.forEach((change) => {
    const materializedChange = eventGeneratorMaterializeSingleChange(eventGenerator, change, eventCache);
    registrations.forEach((registration) => {
      if (registration.respondsTo(change.type)) {
        events.push(registration.createEvent(materializedChange, eventGenerator.query_));
      }
    });
  });
}
function eventGeneratorMaterializeSingleChange(eventGenerator, change, eventCache) {
  if (change.type === "value" || change.type === "child_removed") {
    return change;
  } else {
    change.prevName = eventCache.getPredecessorChildName(change.childName, change.snapshotNode, eventGenerator.index_);
    return change;
  }
}
function eventGeneratorCompareChanges(eventGenerator, a, b) {
  if (a.childName == null || b.childName == null) {
    throw assertionError("Should only compare child_ events.");
  }
  const aWrapped = new NamedNode(a.childName, a.snapshotNode);
  const bWrapped = new NamedNode(b.childName, b.snapshotNode);
  return eventGenerator.index_.compare(aWrapped, bWrapped);
}
function newViewCache(eventCache, serverCache) {
  return { eventCache, serverCache };
}
function viewCacheUpdateEventSnap(viewCache, eventSnap, complete, filtered) {
  return newViewCache(new CacheNode(eventSnap, complete, filtered), viewCache.serverCache);
}
function viewCacheUpdateServerSnap(viewCache, serverSnap, complete, filtered) {
  return newViewCache(viewCache.eventCache, new CacheNode(serverSnap, complete, filtered));
}
function viewCacheGetCompleteEventSnap(viewCache) {
  return viewCache.eventCache.isFullyInitialized() ? viewCache.eventCache.getNode() : null;
}
function viewCacheGetCompleteServerSnap(viewCache) {
  return viewCache.serverCache.isFullyInitialized() ? viewCache.serverCache.getNode() : null;
}
function compoundWriteAddWrite(compoundWrite, path, node) {
  if (pathIsEmpty(path)) {
    return new CompoundWrite(new ImmutableTree(node));
  } else {
    const rootmost = compoundWrite.writeTree_.findRootMostValueAndPath(path);
    if (rootmost != null) {
      const rootMostPath = rootmost.path;
      let value = rootmost.value;
      const relativePath = newRelativePath(rootMostPath, path);
      value = value.updateChild(relativePath, node);
      return new CompoundWrite(compoundWrite.writeTree_.set(rootMostPath, value));
    } else {
      const subtree = new ImmutableTree(node);
      const newWriteTree2 = compoundWrite.writeTree_.setTree(path, subtree);
      return new CompoundWrite(newWriteTree2);
    }
  }
}
function compoundWriteAddWrites(compoundWrite, path, updates) {
  let newWrite = compoundWrite;
  each(updates, (childKey, node) => {
    newWrite = compoundWriteAddWrite(newWrite, pathChild(path, childKey), node);
  });
  return newWrite;
}
function compoundWriteRemoveWrite(compoundWrite, path) {
  if (pathIsEmpty(path)) {
    return CompoundWrite.empty();
  } else {
    const newWriteTree2 = compoundWrite.writeTree_.setTree(path, new ImmutableTree(null));
    return new CompoundWrite(newWriteTree2);
  }
}
function compoundWriteHasCompleteWrite(compoundWrite, path) {
  return compoundWriteGetCompleteNode(compoundWrite, path) != null;
}
function compoundWriteGetCompleteNode(compoundWrite, path) {
  const rootmost = compoundWrite.writeTree_.findRootMostValueAndPath(path);
  if (rootmost != null) {
    return compoundWrite.writeTree_.get(rootmost.path).getChild(newRelativePath(rootmost.path, path));
  } else {
    return null;
  }
}
function compoundWriteGetCompleteChildren(compoundWrite) {
  const children = [];
  const node = compoundWrite.writeTree_.value;
  if (node != null) {
    if (!node.isLeafNode()) {
      node.forEachChild(PRIORITY_INDEX, (childName, childNode) => {
        children.push(new NamedNode(childName, childNode));
      });
    }
  } else {
    compoundWrite.writeTree_.children.inorderTraversal((childName, childTree) => {
      if (childTree.value != null) {
        children.push(new NamedNode(childName, childTree.value));
      }
    });
  }
  return children;
}
function compoundWriteChildCompoundWrite(compoundWrite, path) {
  if (pathIsEmpty(path)) {
    return compoundWrite;
  } else {
    const shadowingNode = compoundWriteGetCompleteNode(compoundWrite, path);
    if (shadowingNode != null) {
      return new CompoundWrite(new ImmutableTree(shadowingNode));
    } else {
      return new CompoundWrite(compoundWrite.writeTree_.subtree(path));
    }
  }
}
function compoundWriteIsEmpty(compoundWrite) {
  return compoundWrite.writeTree_.isEmpty();
}
function compoundWriteApply(compoundWrite, node) {
  return applySubtreeWrite(newEmptyPath(), compoundWrite.writeTree_, node);
}
function applySubtreeWrite(relativePath, writeTree, node) {
  if (writeTree.value != null) {
    return node.updateChild(relativePath, writeTree.value);
  } else {
    let priorityWrite = null;
    writeTree.children.inorderTraversal((childKey, childTree) => {
      if (childKey === ".priority") {
        assert$1(childTree.value !== null, "Priority writes must always be leaf nodes");
        priorityWrite = childTree.value;
      } else {
        node = applySubtreeWrite(pathChild(relativePath, childKey), childTree, node);
      }
    });
    if (!node.getChild(relativePath).isEmpty() && priorityWrite !== null) {
      node = node.updateChild(pathChild(relativePath, ".priority"), priorityWrite);
    }
    return node;
  }
}
function writeTreeChildWrites(writeTree, path) {
  return newWriteTreeRef(path, writeTree);
}
function writeTreeAddOverwrite(writeTree, path, snap, writeId, visible) {
  assert$1(writeId > writeTree.lastWriteId, "Stacking an older write on top of newer ones");
  if (visible === void 0) {
    visible = true;
  }
  writeTree.allWrites.push({
    path,
    snap,
    writeId,
    visible
  });
  if (visible) {
    writeTree.visibleWrites = compoundWriteAddWrite(writeTree.visibleWrites, path, snap);
  }
  writeTree.lastWriteId = writeId;
}
function writeTreeGetWrite(writeTree, writeId) {
  for (let i = 0; i < writeTree.allWrites.length; i++) {
    const record = writeTree.allWrites[i];
    if (record.writeId === writeId) {
      return record;
    }
  }
  return null;
}
function writeTreeRemoveWrite(writeTree, writeId) {
  const idx = writeTree.allWrites.findIndex((s2) => {
    return s2.writeId === writeId;
  });
  assert$1(idx >= 0, "removeWrite called with nonexistent writeId.");
  const writeToRemove = writeTree.allWrites[idx];
  writeTree.allWrites.splice(idx, 1);
  let removedWriteWasVisible = writeToRemove.visible;
  let removedWriteOverlapsWithOtherWrites = false;
  let i = writeTree.allWrites.length - 1;
  while (removedWriteWasVisible && i >= 0) {
    const currentWrite = writeTree.allWrites[i];
    if (currentWrite.visible) {
      if (i >= idx && writeTreeRecordContainsPath_(currentWrite, writeToRemove.path)) {
        removedWriteWasVisible = false;
      } else if (pathContains(writeToRemove.path, currentWrite.path)) {
        removedWriteOverlapsWithOtherWrites = true;
      }
    }
    i--;
  }
  if (!removedWriteWasVisible) {
    return false;
  } else if (removedWriteOverlapsWithOtherWrites) {
    writeTreeResetTree_(writeTree);
    return true;
  } else {
    if (writeToRemove.snap) {
      writeTree.visibleWrites = compoundWriteRemoveWrite(writeTree.visibleWrites, writeToRemove.path);
    } else {
      const children = writeToRemove.children;
      each(children, (childName) => {
        writeTree.visibleWrites = compoundWriteRemoveWrite(writeTree.visibleWrites, pathChild(writeToRemove.path, childName));
      });
    }
    return true;
  }
}
function writeTreeRecordContainsPath_(writeRecord, path) {
  if (writeRecord.snap) {
    return pathContains(writeRecord.path, path);
  } else {
    for (const childName in writeRecord.children) {
      if (writeRecord.children.hasOwnProperty(childName) && pathContains(pathChild(writeRecord.path, childName), path)) {
        return true;
      }
    }
    return false;
  }
}
function writeTreeResetTree_(writeTree) {
  writeTree.visibleWrites = writeTreeLayerTree_(writeTree.allWrites, writeTreeDefaultFilter_, newEmptyPath());
  if (writeTree.allWrites.length > 0) {
    writeTree.lastWriteId = writeTree.allWrites[writeTree.allWrites.length - 1].writeId;
  } else {
    writeTree.lastWriteId = -1;
  }
}
function writeTreeDefaultFilter_(write) {
  return write.visible;
}
function writeTreeLayerTree_(writes, filter, treeRoot) {
  let compoundWrite = CompoundWrite.empty();
  for (let i = 0; i < writes.length; ++i) {
    const write = writes[i];
    if (filter(write)) {
      const writePath = write.path;
      let relativePath;
      if (write.snap) {
        if (pathContains(treeRoot, writePath)) {
          relativePath = newRelativePath(treeRoot, writePath);
          compoundWrite = compoundWriteAddWrite(compoundWrite, relativePath, write.snap);
        } else if (pathContains(writePath, treeRoot)) {
          relativePath = newRelativePath(writePath, treeRoot);
          compoundWrite = compoundWriteAddWrite(compoundWrite, newEmptyPath(), write.snap.getChild(relativePath));
        } else
          ;
      } else if (write.children) {
        if (pathContains(treeRoot, writePath)) {
          relativePath = newRelativePath(treeRoot, writePath);
          compoundWrite = compoundWriteAddWrites(compoundWrite, relativePath, write.children);
        } else if (pathContains(writePath, treeRoot)) {
          relativePath = newRelativePath(writePath, treeRoot);
          if (pathIsEmpty(relativePath)) {
            compoundWrite = compoundWriteAddWrites(compoundWrite, newEmptyPath(), write.children);
          } else {
            const child = safeGet(write.children, pathGetFront(relativePath));
            if (child) {
              const deepNode = child.getChild(pathPopFront(relativePath));
              compoundWrite = compoundWriteAddWrite(compoundWrite, newEmptyPath(), deepNode);
            }
          }
        } else
          ;
      } else {
        throw assertionError("WriteRecord should have .snap or .children");
      }
    }
  }
  return compoundWrite;
}
function writeTreeCalcCompleteEventCache(writeTree, treePath, completeServerCache, writeIdsToExclude, includeHiddenWrites) {
  if (!writeIdsToExclude && !includeHiddenWrites) {
    const shadowingNode = compoundWriteGetCompleteNode(writeTree.visibleWrites, treePath);
    if (shadowingNode != null) {
      return shadowingNode;
    } else {
      const subMerge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
      if (compoundWriteIsEmpty(subMerge)) {
        return completeServerCache;
      } else if (completeServerCache == null && !compoundWriteHasCompleteWrite(subMerge, newEmptyPath())) {
        return null;
      } else {
        const layeredCache = completeServerCache || ChildrenNode.EMPTY_NODE;
        return compoundWriteApply(subMerge, layeredCache);
      }
    }
  } else {
    const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
    if (!includeHiddenWrites && compoundWriteIsEmpty(merge)) {
      return completeServerCache;
    } else {
      if (!includeHiddenWrites && completeServerCache == null && !compoundWriteHasCompleteWrite(merge, newEmptyPath())) {
        return null;
      } else {
        const filter = function(write) {
          return (write.visible || includeHiddenWrites) && (!writeIdsToExclude || !~writeIdsToExclude.indexOf(write.writeId)) && (pathContains(write.path, treePath) || pathContains(treePath, write.path));
        };
        const mergeAtPath = writeTreeLayerTree_(writeTree.allWrites, filter, treePath);
        const layeredCache = completeServerCache || ChildrenNode.EMPTY_NODE;
        return compoundWriteApply(mergeAtPath, layeredCache);
      }
    }
  }
}
function writeTreeCalcCompleteEventChildren(writeTree, treePath, completeServerChildren) {
  let completeChildren = ChildrenNode.EMPTY_NODE;
  const topLevelSet = compoundWriteGetCompleteNode(writeTree.visibleWrites, treePath);
  if (topLevelSet) {
    if (!topLevelSet.isLeafNode()) {
      topLevelSet.forEachChild(PRIORITY_INDEX, (childName, childSnap) => {
        completeChildren = completeChildren.updateImmediateChild(childName, childSnap);
      });
    }
    return completeChildren;
  } else if (completeServerChildren) {
    const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
    completeServerChildren.forEachChild(PRIORITY_INDEX, (childName, childNode) => {
      const node = compoundWriteApply(compoundWriteChildCompoundWrite(merge, new Path(childName)), childNode);
      completeChildren = completeChildren.updateImmediateChild(childName, node);
    });
    compoundWriteGetCompleteChildren(merge).forEach((namedNode) => {
      completeChildren = completeChildren.updateImmediateChild(namedNode.name, namedNode.node);
    });
    return completeChildren;
  } else {
    const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
    compoundWriteGetCompleteChildren(merge).forEach((namedNode) => {
      completeChildren = completeChildren.updateImmediateChild(namedNode.name, namedNode.node);
    });
    return completeChildren;
  }
}
function writeTreeCalcEventCacheAfterServerOverwrite(writeTree, treePath, childPath, existingEventSnap, existingServerSnap) {
  assert$1(existingEventSnap || existingServerSnap, "Either existingEventSnap or existingServerSnap must exist");
  const path = pathChild(treePath, childPath);
  if (compoundWriteHasCompleteWrite(writeTree.visibleWrites, path)) {
    return null;
  } else {
    const childMerge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, path);
    if (compoundWriteIsEmpty(childMerge)) {
      return existingServerSnap.getChild(childPath);
    } else {
      return compoundWriteApply(childMerge, existingServerSnap.getChild(childPath));
    }
  }
}
function writeTreeCalcCompleteChild(writeTree, treePath, childKey, existingServerSnap) {
  const path = pathChild(treePath, childKey);
  const shadowingNode = compoundWriteGetCompleteNode(writeTree.visibleWrites, path);
  if (shadowingNode != null) {
    return shadowingNode;
  } else {
    if (existingServerSnap.isCompleteForChild(childKey)) {
      const childMerge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, path);
      return compoundWriteApply(childMerge, existingServerSnap.getNode().getImmediateChild(childKey));
    } else {
      return null;
    }
  }
}
function writeTreeShadowingWrite(writeTree, path) {
  return compoundWriteGetCompleteNode(writeTree.visibleWrites, path);
}
function writeTreeCalcIndexedSlice(writeTree, treePath, completeServerData, startPost, count, reverse, index) {
  let toIterate;
  const merge = compoundWriteChildCompoundWrite(writeTree.visibleWrites, treePath);
  const shadowingNode = compoundWriteGetCompleteNode(merge, newEmptyPath());
  if (shadowingNode != null) {
    toIterate = shadowingNode;
  } else if (completeServerData != null) {
    toIterate = compoundWriteApply(merge, completeServerData);
  } else {
    return [];
  }
  toIterate = toIterate.withIndex(index);
  if (!toIterate.isEmpty() && !toIterate.isLeafNode()) {
    const nodes = [];
    const cmp = index.getCompare();
    const iter = reverse ? toIterate.getReverseIteratorFrom(startPost, index) : toIterate.getIteratorFrom(startPost, index);
    let next = iter.getNext();
    while (next && nodes.length < count) {
      if (cmp(next, startPost) !== 0) {
        nodes.push(next);
      }
      next = iter.getNext();
    }
    return nodes;
  } else {
    return [];
  }
}
function newWriteTree() {
  return {
    visibleWrites: CompoundWrite.empty(),
    allWrites: [],
    lastWriteId: -1
  };
}
function writeTreeRefCalcCompleteEventCache(writeTreeRef, completeServerCache, writeIdsToExclude, includeHiddenWrites) {
  return writeTreeCalcCompleteEventCache(writeTreeRef.writeTree, writeTreeRef.treePath, completeServerCache, writeIdsToExclude, includeHiddenWrites);
}
function writeTreeRefCalcCompleteEventChildren(writeTreeRef, completeServerChildren) {
  return writeTreeCalcCompleteEventChildren(writeTreeRef.writeTree, writeTreeRef.treePath, completeServerChildren);
}
function writeTreeRefCalcEventCacheAfterServerOverwrite(writeTreeRef, path, existingEventSnap, existingServerSnap) {
  return writeTreeCalcEventCacheAfterServerOverwrite(writeTreeRef.writeTree, writeTreeRef.treePath, path, existingEventSnap, existingServerSnap);
}
function writeTreeRefShadowingWrite(writeTreeRef, path) {
  return writeTreeShadowingWrite(writeTreeRef.writeTree, pathChild(writeTreeRef.treePath, path));
}
function writeTreeRefCalcIndexedSlice(writeTreeRef, completeServerData, startPost, count, reverse, index) {
  return writeTreeCalcIndexedSlice(writeTreeRef.writeTree, writeTreeRef.treePath, completeServerData, startPost, count, reverse, index);
}
function writeTreeRefCalcCompleteChild(writeTreeRef, childKey, existingServerCache) {
  return writeTreeCalcCompleteChild(writeTreeRef.writeTree, writeTreeRef.treePath, childKey, existingServerCache);
}
function writeTreeRefChild(writeTreeRef, childName) {
  return newWriteTreeRef(pathChild(writeTreeRef.treePath, childName), writeTreeRef.writeTree);
}
function newWriteTreeRef(path, writeTree) {
  return {
    treePath: path,
    writeTree
  };
}
function viewProcessorAssertIndexed(viewProcessor, viewCache) {
  assert$1(viewCache.eventCache.getNode().isIndexed(viewProcessor.filter.getIndex()), "Event snap not indexed");
  assert$1(viewCache.serverCache.getNode().isIndexed(viewProcessor.filter.getIndex()), "Server snap not indexed");
}
function viewProcessorApplyOperation(viewProcessor, oldViewCache, operation, writesCache, completeCache) {
  const accumulator = new ChildChangeAccumulator();
  let newViewCache2, filterServerNode;
  if (operation.type === OperationType.OVERWRITE) {
    const overwrite = operation;
    if (overwrite.source.fromUser) {
      newViewCache2 = viewProcessorApplyUserOverwrite(viewProcessor, oldViewCache, overwrite.path, overwrite.snap, writesCache, completeCache, accumulator);
    } else {
      assert$1(overwrite.source.fromServer, "Unknown source.");
      filterServerNode = overwrite.source.tagged || oldViewCache.serverCache.isFiltered() && !pathIsEmpty(overwrite.path);
      newViewCache2 = viewProcessorApplyServerOverwrite(viewProcessor, oldViewCache, overwrite.path, overwrite.snap, writesCache, completeCache, filterServerNode, accumulator);
    }
  } else if (operation.type === OperationType.MERGE) {
    const merge = operation;
    if (merge.source.fromUser) {
      newViewCache2 = viewProcessorApplyUserMerge(viewProcessor, oldViewCache, merge.path, merge.children, writesCache, completeCache, accumulator);
    } else {
      assert$1(merge.source.fromServer, "Unknown source.");
      filterServerNode = merge.source.tagged || oldViewCache.serverCache.isFiltered();
      newViewCache2 = viewProcessorApplyServerMerge(viewProcessor, oldViewCache, merge.path, merge.children, writesCache, completeCache, filterServerNode, accumulator);
    }
  } else if (operation.type === OperationType.ACK_USER_WRITE) {
    const ackUserWrite = operation;
    if (!ackUserWrite.revert) {
      newViewCache2 = viewProcessorAckUserWrite(viewProcessor, oldViewCache, ackUserWrite.path, ackUserWrite.affectedTree, writesCache, completeCache, accumulator);
    } else {
      newViewCache2 = viewProcessorRevertUserWrite(viewProcessor, oldViewCache, ackUserWrite.path, writesCache, completeCache, accumulator);
    }
  } else if (operation.type === OperationType.LISTEN_COMPLETE) {
    newViewCache2 = viewProcessorListenComplete(viewProcessor, oldViewCache, operation.path, writesCache, accumulator);
  } else {
    throw assertionError("Unknown operation type: " + operation.type);
  }
  const changes = accumulator.getChanges();
  viewProcessorMaybeAddValueEvent(oldViewCache, newViewCache2, changes);
  return { viewCache: newViewCache2, changes };
}
function viewProcessorMaybeAddValueEvent(oldViewCache, newViewCache2, accumulator) {
  const eventSnap = newViewCache2.eventCache;
  if (eventSnap.isFullyInitialized()) {
    const isLeafOrEmpty = eventSnap.getNode().isLeafNode() || eventSnap.getNode().isEmpty();
    const oldCompleteSnap = viewCacheGetCompleteEventSnap(oldViewCache);
    if (accumulator.length > 0 || !oldViewCache.eventCache.isFullyInitialized() || isLeafOrEmpty && !eventSnap.getNode().equals(oldCompleteSnap) || !eventSnap.getNode().getPriority().equals(oldCompleteSnap.getPriority())) {
      accumulator.push(changeValue(viewCacheGetCompleteEventSnap(newViewCache2)));
    }
  }
}
function viewProcessorGenerateEventCacheAfterServerEvent(viewProcessor, viewCache, changePath, writesCache, source, accumulator) {
  const oldEventSnap = viewCache.eventCache;
  if (writeTreeRefShadowingWrite(writesCache, changePath) != null) {
    return viewCache;
  } else {
    let newEventCache, serverNode;
    if (pathIsEmpty(changePath)) {
      assert$1(viewCache.serverCache.isFullyInitialized(), "If change path is empty, we must have complete server data");
      if (viewCache.serverCache.isFiltered()) {
        const serverCache = viewCacheGetCompleteServerSnap(viewCache);
        const completeChildren = serverCache instanceof ChildrenNode ? serverCache : ChildrenNode.EMPTY_NODE;
        const completeEventChildren = writeTreeRefCalcCompleteEventChildren(writesCache, completeChildren);
        newEventCache = viewProcessor.filter.updateFullNode(viewCache.eventCache.getNode(), completeEventChildren, accumulator);
      } else {
        const completeNode = writeTreeRefCalcCompleteEventCache(writesCache, viewCacheGetCompleteServerSnap(viewCache));
        newEventCache = viewProcessor.filter.updateFullNode(viewCache.eventCache.getNode(), completeNode, accumulator);
      }
    } else {
      const childKey = pathGetFront(changePath);
      if (childKey === ".priority") {
        assert$1(pathGetLength(changePath) === 1, "Can't have a priority with additional path components");
        const oldEventNode = oldEventSnap.getNode();
        serverNode = viewCache.serverCache.getNode();
        const updatedPriority = writeTreeRefCalcEventCacheAfterServerOverwrite(writesCache, changePath, oldEventNode, serverNode);
        if (updatedPriority != null) {
          newEventCache = viewProcessor.filter.updatePriority(oldEventNode, updatedPriority);
        } else {
          newEventCache = oldEventSnap.getNode();
        }
      } else {
        const childChangePath = pathPopFront(changePath);
        let newEventChild;
        if (oldEventSnap.isCompleteForChild(childKey)) {
          serverNode = viewCache.serverCache.getNode();
          const eventChildUpdate = writeTreeRefCalcEventCacheAfterServerOverwrite(writesCache, changePath, oldEventSnap.getNode(), serverNode);
          if (eventChildUpdate != null) {
            newEventChild = oldEventSnap.getNode().getImmediateChild(childKey).updateChild(childChangePath, eventChildUpdate);
          } else {
            newEventChild = oldEventSnap.getNode().getImmediateChild(childKey);
          }
        } else {
          newEventChild = writeTreeRefCalcCompleteChild(writesCache, childKey, viewCache.serverCache);
        }
        if (newEventChild != null) {
          newEventCache = viewProcessor.filter.updateChild(oldEventSnap.getNode(), childKey, newEventChild, childChangePath, source, accumulator);
        } else {
          newEventCache = oldEventSnap.getNode();
        }
      }
    }
    return viewCacheUpdateEventSnap(viewCache, newEventCache, oldEventSnap.isFullyInitialized() || pathIsEmpty(changePath), viewProcessor.filter.filtersNodes());
  }
}
function viewProcessorApplyServerOverwrite(viewProcessor, oldViewCache, changePath, changedSnap, writesCache, completeCache, filterServerNode, accumulator) {
  const oldServerSnap = oldViewCache.serverCache;
  let newServerCache;
  const serverFilter = filterServerNode ? viewProcessor.filter : viewProcessor.filter.getIndexedFilter();
  if (pathIsEmpty(changePath)) {
    newServerCache = serverFilter.updateFullNode(oldServerSnap.getNode(), changedSnap, null);
  } else if (serverFilter.filtersNodes() && !oldServerSnap.isFiltered()) {
    const newServerNode = oldServerSnap.getNode().updateChild(changePath, changedSnap);
    newServerCache = serverFilter.updateFullNode(oldServerSnap.getNode(), newServerNode, null);
  } else {
    const childKey = pathGetFront(changePath);
    if (!oldServerSnap.isCompleteForPath(changePath) && pathGetLength(changePath) > 1) {
      return oldViewCache;
    }
    const childChangePath = pathPopFront(changePath);
    const childNode = oldServerSnap.getNode().getImmediateChild(childKey);
    const newChildNode = childNode.updateChild(childChangePath, changedSnap);
    if (childKey === ".priority") {
      newServerCache = serverFilter.updatePriority(oldServerSnap.getNode(), newChildNode);
    } else {
      newServerCache = serverFilter.updateChild(oldServerSnap.getNode(), childKey, newChildNode, childChangePath, NO_COMPLETE_CHILD_SOURCE, null);
    }
  }
  const newViewCache2 = viewCacheUpdateServerSnap(oldViewCache, newServerCache, oldServerSnap.isFullyInitialized() || pathIsEmpty(changePath), serverFilter.filtersNodes());
  const source = new WriteTreeCompleteChildSource(writesCache, newViewCache2, completeCache);
  return viewProcessorGenerateEventCacheAfterServerEvent(viewProcessor, newViewCache2, changePath, writesCache, source, accumulator);
}
function viewProcessorApplyUserOverwrite(viewProcessor, oldViewCache, changePath, changedSnap, writesCache, completeCache, accumulator) {
  const oldEventSnap = oldViewCache.eventCache;
  let newViewCache2, newEventCache;
  const source = new WriteTreeCompleteChildSource(writesCache, oldViewCache, completeCache);
  if (pathIsEmpty(changePath)) {
    newEventCache = viewProcessor.filter.updateFullNode(oldViewCache.eventCache.getNode(), changedSnap, accumulator);
    newViewCache2 = viewCacheUpdateEventSnap(oldViewCache, newEventCache, true, viewProcessor.filter.filtersNodes());
  } else {
    const childKey = pathGetFront(changePath);
    if (childKey === ".priority") {
      newEventCache = viewProcessor.filter.updatePriority(oldViewCache.eventCache.getNode(), changedSnap);
      newViewCache2 = viewCacheUpdateEventSnap(oldViewCache, newEventCache, oldEventSnap.isFullyInitialized(), oldEventSnap.isFiltered());
    } else {
      const childChangePath = pathPopFront(changePath);
      const oldChild = oldEventSnap.getNode().getImmediateChild(childKey);
      let newChild;
      if (pathIsEmpty(childChangePath)) {
        newChild = changedSnap;
      } else {
        const childNode = source.getCompleteChild(childKey);
        if (childNode != null) {
          if (pathGetBack(childChangePath) === ".priority" && childNode.getChild(pathParent(childChangePath)).isEmpty()) {
            newChild = childNode;
          } else {
            newChild = childNode.updateChild(childChangePath, changedSnap);
          }
        } else {
          newChild = ChildrenNode.EMPTY_NODE;
        }
      }
      if (!oldChild.equals(newChild)) {
        const newEventSnap = viewProcessor.filter.updateChild(oldEventSnap.getNode(), childKey, newChild, childChangePath, source, accumulator);
        newViewCache2 = viewCacheUpdateEventSnap(oldViewCache, newEventSnap, oldEventSnap.isFullyInitialized(), viewProcessor.filter.filtersNodes());
      } else {
        newViewCache2 = oldViewCache;
      }
    }
  }
  return newViewCache2;
}
function viewProcessorCacheHasChild(viewCache, childKey) {
  return viewCache.eventCache.isCompleteForChild(childKey);
}
function viewProcessorApplyUserMerge(viewProcessor, viewCache, path, changedChildren, writesCache, serverCache, accumulator) {
  let curViewCache = viewCache;
  changedChildren.foreach((relativePath, childNode) => {
    const writePath = pathChild(path, relativePath);
    if (viewProcessorCacheHasChild(viewCache, pathGetFront(writePath))) {
      curViewCache = viewProcessorApplyUserOverwrite(viewProcessor, curViewCache, writePath, childNode, writesCache, serverCache, accumulator);
    }
  });
  changedChildren.foreach((relativePath, childNode) => {
    const writePath = pathChild(path, relativePath);
    if (!viewProcessorCacheHasChild(viewCache, pathGetFront(writePath))) {
      curViewCache = viewProcessorApplyUserOverwrite(viewProcessor, curViewCache, writePath, childNode, writesCache, serverCache, accumulator);
    }
  });
  return curViewCache;
}
function viewProcessorApplyMerge(viewProcessor, node, merge) {
  merge.foreach((relativePath, childNode) => {
    node = node.updateChild(relativePath, childNode);
  });
  return node;
}
function viewProcessorApplyServerMerge(viewProcessor, viewCache, path, changedChildren, writesCache, serverCache, filterServerNode, accumulator) {
  if (viewCache.serverCache.getNode().isEmpty() && !viewCache.serverCache.isFullyInitialized()) {
    return viewCache;
  }
  let curViewCache = viewCache;
  let viewMergeTree;
  if (pathIsEmpty(path)) {
    viewMergeTree = changedChildren;
  } else {
    viewMergeTree = new ImmutableTree(null).setTree(path, changedChildren);
  }
  const serverNode = viewCache.serverCache.getNode();
  viewMergeTree.children.inorderTraversal((childKey, childTree) => {
    if (serverNode.hasChild(childKey)) {
      const serverChild = viewCache.serverCache.getNode().getImmediateChild(childKey);
      const newChild = viewProcessorApplyMerge(viewProcessor, serverChild, childTree);
      curViewCache = viewProcessorApplyServerOverwrite(viewProcessor, curViewCache, new Path(childKey), newChild, writesCache, serverCache, filterServerNode, accumulator);
    }
  });
  viewMergeTree.children.inorderTraversal((childKey, childMergeTree) => {
    const isUnknownDeepMerge = !viewCache.serverCache.isCompleteForChild(childKey) && childMergeTree.value === void 0;
    if (!serverNode.hasChild(childKey) && !isUnknownDeepMerge) {
      const serverChild = viewCache.serverCache.getNode().getImmediateChild(childKey);
      const newChild = viewProcessorApplyMerge(viewProcessor, serverChild, childMergeTree);
      curViewCache = viewProcessorApplyServerOverwrite(viewProcessor, curViewCache, new Path(childKey), newChild, writesCache, serverCache, filterServerNode, accumulator);
    }
  });
  return curViewCache;
}
function viewProcessorAckUserWrite(viewProcessor, viewCache, ackPath, affectedTree, writesCache, completeCache, accumulator) {
  if (writeTreeRefShadowingWrite(writesCache, ackPath) != null) {
    return viewCache;
  }
  const filterServerNode = viewCache.serverCache.isFiltered();
  const serverCache = viewCache.serverCache;
  if (affectedTree.value != null) {
    if (pathIsEmpty(ackPath) && serverCache.isFullyInitialized() || serverCache.isCompleteForPath(ackPath)) {
      return viewProcessorApplyServerOverwrite(viewProcessor, viewCache, ackPath, serverCache.getNode().getChild(ackPath), writesCache, completeCache, filterServerNode, accumulator);
    } else if (pathIsEmpty(ackPath)) {
      let changedChildren = new ImmutableTree(null);
      serverCache.getNode().forEachChild(KEY_INDEX, (name2, node) => {
        changedChildren = changedChildren.set(new Path(name2), node);
      });
      return viewProcessorApplyServerMerge(viewProcessor, viewCache, ackPath, changedChildren, writesCache, completeCache, filterServerNode, accumulator);
    } else {
      return viewCache;
    }
  } else {
    let changedChildren = new ImmutableTree(null);
    affectedTree.foreach((mergePath, value) => {
      const serverCachePath = pathChild(ackPath, mergePath);
      if (serverCache.isCompleteForPath(serverCachePath)) {
        changedChildren = changedChildren.set(mergePath, serverCache.getNode().getChild(serverCachePath));
      }
    });
    return viewProcessorApplyServerMerge(viewProcessor, viewCache, ackPath, changedChildren, writesCache, completeCache, filterServerNode, accumulator);
  }
}
function viewProcessorListenComplete(viewProcessor, viewCache, path, writesCache, accumulator) {
  const oldServerNode = viewCache.serverCache;
  const newViewCache2 = viewCacheUpdateServerSnap(viewCache, oldServerNode.getNode(), oldServerNode.isFullyInitialized() || pathIsEmpty(path), oldServerNode.isFiltered());
  return viewProcessorGenerateEventCacheAfterServerEvent(viewProcessor, newViewCache2, path, writesCache, NO_COMPLETE_CHILD_SOURCE, accumulator);
}
function viewProcessorRevertUserWrite(viewProcessor, viewCache, path, writesCache, completeServerCache, accumulator) {
  let complete;
  if (writeTreeRefShadowingWrite(writesCache, path) != null) {
    return viewCache;
  } else {
    const source = new WriteTreeCompleteChildSource(writesCache, viewCache, completeServerCache);
    const oldEventCache = viewCache.eventCache.getNode();
    let newEventCache;
    if (pathIsEmpty(path) || pathGetFront(path) === ".priority") {
      let newNode;
      if (viewCache.serverCache.isFullyInitialized()) {
        newNode = writeTreeRefCalcCompleteEventCache(writesCache, viewCacheGetCompleteServerSnap(viewCache));
      } else {
        const serverChildren = viewCache.serverCache.getNode();
        assert$1(serverChildren instanceof ChildrenNode, "serverChildren would be complete if leaf node");
        newNode = writeTreeRefCalcCompleteEventChildren(writesCache, serverChildren);
      }
      newNode = newNode;
      newEventCache = viewProcessor.filter.updateFullNode(oldEventCache, newNode, accumulator);
    } else {
      const childKey = pathGetFront(path);
      let newChild = writeTreeRefCalcCompleteChild(writesCache, childKey, viewCache.serverCache);
      if (newChild == null && viewCache.serverCache.isCompleteForChild(childKey)) {
        newChild = oldEventCache.getImmediateChild(childKey);
      }
      if (newChild != null) {
        newEventCache = viewProcessor.filter.updateChild(oldEventCache, childKey, newChild, pathPopFront(path), source, accumulator);
      } else if (viewCache.eventCache.getNode().hasChild(childKey)) {
        newEventCache = viewProcessor.filter.updateChild(oldEventCache, childKey, ChildrenNode.EMPTY_NODE, pathPopFront(path), source, accumulator);
      } else {
        newEventCache = oldEventCache;
      }
      if (newEventCache.isEmpty() && viewCache.serverCache.isFullyInitialized()) {
        complete = writeTreeRefCalcCompleteEventCache(writesCache, viewCacheGetCompleteServerSnap(viewCache));
        if (complete.isLeafNode()) {
          newEventCache = viewProcessor.filter.updateFullNode(newEventCache, complete, accumulator);
        }
      }
    }
    complete = viewCache.serverCache.isFullyInitialized() || writeTreeRefShadowingWrite(writesCache, newEmptyPath()) != null;
    return viewCacheUpdateEventSnap(viewCache, newEventCache, complete, viewProcessor.filter.filtersNodes());
  }
}
function viewGetCompleteServerCache(view, path) {
  const cache = viewCacheGetCompleteServerSnap(view.viewCache_);
  if (cache) {
    if (view.query._queryParams.loadsAllData() || !pathIsEmpty(path) && !cache.getImmediateChild(pathGetFront(path)).isEmpty()) {
      return cache.getChild(path);
    }
  }
  return null;
}
function viewApplyOperation(view, operation, writesCache, completeServerCache) {
  if (operation.type === OperationType.MERGE && operation.source.queryId !== null) {
    assert$1(viewCacheGetCompleteServerSnap(view.viewCache_), "We should always have a full cache before handling merges");
    assert$1(viewCacheGetCompleteEventSnap(view.viewCache_), "Missing event cache, even though we have a server cache");
  }
  const oldViewCache = view.viewCache_;
  const result = viewProcessorApplyOperation(view.processor_, oldViewCache, operation, writesCache, completeServerCache);
  viewProcessorAssertIndexed(view.processor_, result.viewCache);
  assert$1(result.viewCache.serverCache.isFullyInitialized() || !oldViewCache.serverCache.isFullyInitialized(), "Once a server snap is complete, it should never go back");
  view.viewCache_ = result.viewCache;
  return viewGenerateEventsForChanges_(view, result.changes, result.viewCache.eventCache.getNode(), null);
}
function viewGenerateEventsForChanges_(view, changes, eventCache, eventRegistration) {
  const registrations = eventRegistration ? [eventRegistration] : view.eventRegistrations_;
  return eventGeneratorGenerateEventsForChanges(view.eventGenerator_, changes, eventCache, registrations);
}
function syncPointSetReferenceConstructor(val) {
  assert$1(!referenceConstructor$1, "__referenceConstructor has already been defined");
  referenceConstructor$1 = val;
}
function syncPointApplyOperation(syncPoint, operation, writesCache, optCompleteServerCache) {
  const queryId = operation.source.queryId;
  if (queryId !== null) {
    const view = syncPoint.views.get(queryId);
    assert$1(view != null, "SyncTree gave us an op for an invalid query.");
    return viewApplyOperation(view, operation, writesCache, optCompleteServerCache);
  } else {
    let events = [];
    for (const view of syncPoint.views.values()) {
      events = events.concat(viewApplyOperation(view, operation, writesCache, optCompleteServerCache));
    }
    return events;
  }
}
function syncPointGetCompleteServerCache(syncPoint, path) {
  let serverCache = null;
  for (const view of syncPoint.views.values()) {
    serverCache = serverCache || viewGetCompleteServerCache(view, path);
  }
  return serverCache;
}
function syncTreeSetReferenceConstructor(val) {
  assert$1(!referenceConstructor, "__referenceConstructor has already been defined");
  referenceConstructor = val;
}
function syncTreeApplyUserOverwrite(syncTree, path, newData, writeId, visible) {
  writeTreeAddOverwrite(syncTree.pendingWriteTree_, path, newData, writeId, visible);
  if (!visible) {
    return [];
  } else {
    return syncTreeApplyOperationToSyncPoints_(syncTree, new Overwrite(newOperationSourceUser(), path, newData));
  }
}
function syncTreeAckUserWrite(syncTree, writeId, revert = false) {
  const write = writeTreeGetWrite(syncTree.pendingWriteTree_, writeId);
  const needToReevaluate = writeTreeRemoveWrite(syncTree.pendingWriteTree_, writeId);
  if (!needToReevaluate) {
    return [];
  } else {
    let affectedTree = new ImmutableTree(null);
    if (write.snap != null) {
      affectedTree = affectedTree.set(newEmptyPath(), true);
    } else {
      each(write.children, (pathString) => {
        affectedTree = affectedTree.set(new Path(pathString), true);
      });
    }
    return syncTreeApplyOperationToSyncPoints_(syncTree, new AckUserWrite(write.path, affectedTree, revert));
  }
}
function syncTreeApplyServerOverwrite(syncTree, path, newData) {
  return syncTreeApplyOperationToSyncPoints_(syncTree, new Overwrite(newOperationSourceServer(), path, newData));
}
function syncTreeApplyServerMerge(syncTree, path, changedChildren) {
  const changeTree = ImmutableTree.fromObject(changedChildren);
  return syncTreeApplyOperationToSyncPoints_(syncTree, new Merge(newOperationSourceServer(), path, changeTree));
}
function syncTreeApplyTaggedQueryOverwrite(syncTree, path, snap, tag) {
  const queryKey = syncTreeQueryKeyForTag_(syncTree, tag);
  if (queryKey != null) {
    const r = syncTreeParseQueryKey_(queryKey);
    const queryPath = r.path, queryId = r.queryId;
    const relativePath = newRelativePath(queryPath, path);
    const op = new Overwrite(newOperationSourceServerTaggedQuery(queryId), relativePath, snap);
    return syncTreeApplyTaggedOperation_(syncTree, queryPath, op);
  } else {
    return [];
  }
}
function syncTreeApplyTaggedQueryMerge(syncTree, path, changedChildren, tag) {
  const queryKey = syncTreeQueryKeyForTag_(syncTree, tag);
  if (queryKey) {
    const r = syncTreeParseQueryKey_(queryKey);
    const queryPath = r.path, queryId = r.queryId;
    const relativePath = newRelativePath(queryPath, path);
    const changeTree = ImmutableTree.fromObject(changedChildren);
    const op = new Merge(newOperationSourceServerTaggedQuery(queryId), relativePath, changeTree);
    return syncTreeApplyTaggedOperation_(syncTree, queryPath, op);
  } else {
    return [];
  }
}
function syncTreeCalcCompleteEventCache(syncTree, path, writeIdsToExclude) {
  const includeHiddenSets = true;
  const writeTree = syncTree.pendingWriteTree_;
  const serverCache = syncTree.syncPointTree_.findOnPath(path, (pathSoFar, syncPoint) => {
    const relativePath = newRelativePath(pathSoFar, path);
    const serverCache2 = syncPointGetCompleteServerCache(syncPoint, relativePath);
    if (serverCache2) {
      return serverCache2;
    }
  });
  return writeTreeCalcCompleteEventCache(writeTree, path, serverCache, writeIdsToExclude, includeHiddenSets);
}
function syncTreeApplyOperationToSyncPoints_(syncTree, operation) {
  return syncTreeApplyOperationHelper_(operation, syncTree.syncPointTree_, null, writeTreeChildWrites(syncTree.pendingWriteTree_, newEmptyPath()));
}
function syncTreeApplyOperationHelper_(operation, syncPointTree, serverCache, writesCache) {
  if (pathIsEmpty(operation.path)) {
    return syncTreeApplyOperationDescendantsHelper_(operation, syncPointTree, serverCache, writesCache);
  } else {
    const syncPoint = syncPointTree.get(newEmptyPath());
    if (serverCache == null && syncPoint != null) {
      serverCache = syncPointGetCompleteServerCache(syncPoint, newEmptyPath());
    }
    let events = [];
    const childName = pathGetFront(operation.path);
    const childOperation = operation.operationForChild(childName);
    const childTree = syncPointTree.children.get(childName);
    if (childTree && childOperation) {
      const childServerCache = serverCache ? serverCache.getImmediateChild(childName) : null;
      const childWritesCache = writeTreeRefChild(writesCache, childName);
      events = events.concat(syncTreeApplyOperationHelper_(childOperation, childTree, childServerCache, childWritesCache));
    }
    if (syncPoint) {
      events = events.concat(syncPointApplyOperation(syncPoint, operation, writesCache, serverCache));
    }
    return events;
  }
}
function syncTreeApplyOperationDescendantsHelper_(operation, syncPointTree, serverCache, writesCache) {
  const syncPoint = syncPointTree.get(newEmptyPath());
  if (serverCache == null && syncPoint != null) {
    serverCache = syncPointGetCompleteServerCache(syncPoint, newEmptyPath());
  }
  let events = [];
  syncPointTree.children.inorderTraversal((childName, childTree) => {
    const childServerCache = serverCache ? serverCache.getImmediateChild(childName) : null;
    const childWritesCache = writeTreeRefChild(writesCache, childName);
    const childOperation = operation.operationForChild(childName);
    if (childOperation) {
      events = events.concat(syncTreeApplyOperationDescendantsHelper_(childOperation, childTree, childServerCache, childWritesCache));
    }
  });
  if (syncPoint) {
    events = events.concat(syncPointApplyOperation(syncPoint, operation, writesCache, serverCache));
  }
  return events;
}
function syncTreeQueryKeyForTag_(syncTree, tag) {
  return syncTree.tagToQueryMap.get(tag);
}
function syncTreeParseQueryKey_(queryKey) {
  const splitIndex = queryKey.indexOf("$");
  assert$1(splitIndex !== -1 && splitIndex < queryKey.length - 1, "Bad queryKey.");
  return {
    queryId: queryKey.substr(splitIndex + 1),
    path: new Path(queryKey.substr(0, splitIndex))
  };
}
function syncTreeApplyTaggedOperation_(syncTree, queryPath, operation) {
  const syncPoint = syncTree.syncPointTree_.get(queryPath);
  assert$1(syncPoint, "Missing sync point for query tag that we're tracking");
  const writesCache = writeTreeChildWrites(syncTree.pendingWriteTree_, queryPath);
  return syncPointApplyOperation(syncPoint, operation, writesCache, null);
}
function resolveDeferredValue(node, existingVal, serverValues) {
  const rawPri = node.getPriority().val();
  const priority = resolveDeferredLeafValue(rawPri, existingVal.getImmediateChild(".priority"), serverValues);
  let newNode;
  if (node.isLeafNode()) {
    const leafNode = node;
    const value = resolveDeferredLeafValue(leafNode.getValue(), existingVal, serverValues);
    if (value !== leafNode.getValue() || priority !== leafNode.getPriority().val()) {
      return new LeafNode(value, nodeFromJSON(priority));
    } else {
      return node;
    }
  } else {
    const childrenNode = node;
    newNode = childrenNode;
    if (priority !== childrenNode.getPriority().val()) {
      newNode = newNode.updatePriority(new LeafNode(priority));
    }
    childrenNode.forEachChild(PRIORITY_INDEX, (childName, childNode) => {
      const newChildNode = resolveDeferredValue(childNode, existingVal.getImmediateChild(childName), serverValues);
      if (newChildNode !== childNode) {
        newNode = newNode.updateImmediateChild(childName, newChildNode);
      }
    });
    return newNode;
  }
}
function treeSubTree(tree, pathObj) {
  let path = pathObj instanceof Path ? pathObj : new Path(pathObj);
  let child = tree, next = pathGetFront(path);
  while (next !== null) {
    const childNode = safeGet(child.node.children, next) || {
      children: {},
      childCount: 0
    };
    child = new Tree(next, child, childNode);
    path = pathPopFront(path);
    next = pathGetFront(path);
  }
  return child;
}
function treeGetValue(tree) {
  return tree.node.value;
}
function treeSetValue(tree, value) {
  tree.node.value = value;
  treeUpdateParents(tree);
}
function treeHasChildren(tree) {
  return tree.node.childCount > 0;
}
function treeIsEmpty(tree) {
  return treeGetValue(tree) === void 0 && !treeHasChildren(tree);
}
function treeForEachChild(tree, action) {
  each(tree.node.children, (child, childTree) => {
    action(new Tree(child, tree, childTree));
  });
}
function treeForEachDescendant(tree, action, includeSelf, childrenFirst) {
  if (includeSelf && !childrenFirst) {
    action(tree);
  }
  treeForEachChild(tree, (child) => {
    treeForEachDescendant(child, action, true, childrenFirst);
  });
  if (includeSelf && childrenFirst) {
    action(tree);
  }
}
function treeForEachAncestor(tree, action, includeSelf) {
  let node = includeSelf ? tree : tree.parent;
  while (node !== null) {
    if (action(node)) {
      return true;
    }
    node = node.parent;
  }
  return false;
}
function treeGetPath(tree) {
  return new Path(tree.parent === null ? tree.name : treeGetPath(tree.parent) + "/" + tree.name);
}
function treeUpdateParents(tree) {
  if (tree.parent !== null) {
    treeUpdateChild(tree.parent, tree.name, tree);
  }
}
function treeUpdateChild(tree, childName, child) {
  const childEmpty = treeIsEmpty(child);
  const childExists = contains(tree.node.children, childName);
  if (childEmpty && childExists) {
    delete tree.node.children[childName];
    tree.node.childCount--;
    treeUpdateParents(tree);
  } else if (!childEmpty && !childExists) {
    tree.node.children[childName] = child.node;
    tree.node.childCount++;
    treeUpdateParents(tree);
  }
}
function eventQueueQueueEvents(eventQueue, eventDataList) {
  let currList = null;
  for (let i = 0; i < eventDataList.length; i++) {
    const data = eventDataList[i];
    const path = data.getPath();
    if (currList !== null && !pathEquals(path, currList.path)) {
      eventQueue.eventLists_.push(currList);
      currList = null;
    }
    if (currList === null) {
      currList = { events: [], path };
    }
    currList.events.push(data);
  }
  if (currList) {
    eventQueue.eventLists_.push(currList);
  }
}
function eventQueueRaiseEventsForChangedPath(eventQueue, changedPath, eventDataList) {
  eventQueueQueueEvents(eventQueue, eventDataList);
  eventQueueRaiseQueuedEventsMatchingPredicate(eventQueue, (eventPath) => pathContains(eventPath, changedPath) || pathContains(changedPath, eventPath));
}
function eventQueueRaiseQueuedEventsMatchingPredicate(eventQueue, predicate) {
  eventQueue.recursionDepth_++;
  let sentAll = true;
  for (let i = 0; i < eventQueue.eventLists_.length; i++) {
    const eventList = eventQueue.eventLists_[i];
    if (eventList) {
      const eventPath = eventList.path;
      if (predicate(eventPath)) {
        eventListRaise(eventQueue.eventLists_[i]);
        eventQueue.eventLists_[i] = null;
      } else {
        sentAll = false;
      }
    }
  }
  if (sentAll) {
    eventQueue.eventLists_ = [];
  }
  eventQueue.recursionDepth_--;
}
function eventListRaise(eventList) {
  for (let i = 0; i < eventList.events.length; i++) {
    const eventData = eventList.events[i];
    if (eventData !== null) {
      eventList.events[i] = null;
      const eventFn = eventData.getEventRunner();
      if (logger) {
        log("event: " + eventData.toString());
      }
      exceptionGuard(eventFn);
    }
  }
}
function repoStart(repo, appId, authOverride) {
  repo.stats_ = statsManagerGetCollection(repo.repoInfo_);
  if (repo.forceRestClient_ || beingCrawled()) {
    repo.server_ = new ReadonlyRestClient(repo.repoInfo_, (pathString, data, isMerge, tag) => {
      repoOnDataUpdate(repo, pathString, data, isMerge, tag);
    }, repo.authTokenProvider_, repo.appCheckProvider_);
    setTimeout(() => repoOnConnectStatus(repo, true), 0);
  } else {
    if (typeof authOverride !== "undefined" && authOverride !== null) {
      if (typeof authOverride !== "object") {
        throw new Error("Only objects are supported for option databaseAuthVariableOverride");
      }
      try {
        stringify(authOverride);
      } catch (e) {
        throw new Error("Invalid authOverride provided: " + e);
      }
    }
    repo.persistentConnection_ = new PersistentConnection(repo.repoInfo_, appId, (pathString, data, isMerge, tag) => {
      repoOnDataUpdate(repo, pathString, data, isMerge, tag);
    }, (connectStatus) => {
      repoOnConnectStatus(repo, connectStatus);
    }, (updates) => {
      repoOnServerInfoUpdate(repo, updates);
    }, repo.authTokenProvider_, repo.appCheckProvider_, authOverride);
    repo.server_ = repo.persistentConnection_;
  }
  repo.authTokenProvider_.addTokenChangeListener((token) => {
    repo.server_.refreshAuthToken(token);
  });
  repo.appCheckProvider_.addTokenChangeListener((result) => {
    repo.server_.refreshAppCheckToken(result.token);
  });
  repo.statsReporter_ = statsManagerGetOrCreateReporter(repo.repoInfo_, () => new StatsReporter(repo.stats_, repo.server_));
  repo.infoData_ = new SnapshotHolder();
  repo.infoSyncTree_ = new SyncTree({
    startListening: (query, tag, currentHashFn, onComplete) => {
      let infoEvents = [];
      const node = repo.infoData_.getNode(query._path);
      if (!node.isEmpty()) {
        infoEvents = syncTreeApplyServerOverwrite(repo.infoSyncTree_, query._path, node);
        setTimeout(() => {
          onComplete("ok");
        }, 0);
      }
      return infoEvents;
    },
    stopListening: () => {
    }
  });
  repoUpdateInfo(repo, "connected", false);
  repo.serverSyncTree_ = new SyncTree({
    startListening: (query, tag, currentHashFn, onComplete) => {
      repo.server_.listen(query, currentHashFn, tag, (status, data) => {
        const events = onComplete(status, data);
        eventQueueRaiseEventsForChangedPath(repo.eventQueue_, query._path, events);
      });
      return [];
    },
    stopListening: (query, tag) => {
      repo.server_.unlisten(query, tag);
    }
  });
}
function repoServerTime(repo) {
  const offsetNode = repo.infoData_.getNode(new Path(".info/serverTimeOffset"));
  const offset = offsetNode.val() || 0;
  return new Date().getTime() + offset;
}
function repoGenerateServerValues(repo) {
  return generateWithValues({
    timestamp: repoServerTime(repo)
  });
}
function repoOnDataUpdate(repo, pathString, data, isMerge, tag) {
  repo.dataUpdateCount++;
  const path = new Path(pathString);
  data = repo.interceptServerDataCallback_ ? repo.interceptServerDataCallback_(pathString, data) : data;
  let events = [];
  if (tag) {
    if (isMerge) {
      const taggedChildren = map(data, (raw) => nodeFromJSON(raw));
      events = syncTreeApplyTaggedQueryMerge(repo.serverSyncTree_, path, taggedChildren, tag);
    } else {
      const taggedSnap = nodeFromJSON(data);
      events = syncTreeApplyTaggedQueryOverwrite(repo.serverSyncTree_, path, taggedSnap, tag);
    }
  } else if (isMerge) {
    const changedChildren = map(data, (raw) => nodeFromJSON(raw));
    events = syncTreeApplyServerMerge(repo.serverSyncTree_, path, changedChildren);
  } else {
    const snap = nodeFromJSON(data);
    events = syncTreeApplyServerOverwrite(repo.serverSyncTree_, path, snap);
  }
  let affectedPath = path;
  if (events.length > 0) {
    affectedPath = repoRerunTransactions(repo, path);
  }
  eventQueueRaiseEventsForChangedPath(repo.eventQueue_, affectedPath, events);
}
function repoOnConnectStatus(repo, connectStatus) {
  repoUpdateInfo(repo, "connected", connectStatus);
  if (connectStatus === false) {
    repoRunOnDisconnectEvents(repo);
  }
}
function repoOnServerInfoUpdate(repo, updates) {
  each(updates, (key, value) => {
    repoUpdateInfo(repo, key, value);
  });
}
function repoUpdateInfo(repo, pathString, value) {
  const path = new Path("/.info/" + pathString);
  const newNode = nodeFromJSON(value);
  repo.infoData_.updateSnapshot(path, newNode);
  const events = syncTreeApplyServerOverwrite(repo.infoSyncTree_, path, newNode);
  eventQueueRaiseEventsForChangedPath(repo.eventQueue_, path, events);
}
function repoGetNextWriteId(repo) {
  return repo.nextWriteId_++;
}
function repoRunOnDisconnectEvents(repo) {
  repoLog(repo, "onDisconnectEvents");
  const serverValues = repoGenerateServerValues(repo);
  const resolvedOnDisconnectTree = newSparseSnapshotTree();
  sparseSnapshotTreeForEachTree(repo.onDisconnect_, newEmptyPath(), (path, node) => {
    const resolved = resolveDeferredValueTree(path, node, repo.serverSyncTree_, serverValues);
    sparseSnapshotTreeRemember(resolvedOnDisconnectTree, path, resolved);
  });
  let events = [];
  sparseSnapshotTreeForEachTree(resolvedOnDisconnectTree, newEmptyPath(), (path, snap) => {
    events = events.concat(syncTreeApplyServerOverwrite(repo.serverSyncTree_, path, snap));
    const affectedPath = repoAbortTransactions(repo, path);
    repoRerunTransactions(repo, affectedPath);
  });
  repo.onDisconnect_ = newSparseSnapshotTree();
  eventQueueRaiseEventsForChangedPath(repo.eventQueue_, newEmptyPath(), events);
}
function repoInterrupt(repo) {
  if (repo.persistentConnection_) {
    repo.persistentConnection_.interrupt(INTERRUPT_REASON);
  }
}
function repoLog(repo, ...varArgs) {
  let prefix = "";
  if (repo.persistentConnection_) {
    prefix = repo.persistentConnection_.id + ":";
  }
  log(prefix, ...varArgs);
}
function repoGetLatestState(repo, path, excludeSets) {
  return syncTreeCalcCompleteEventCache(repo.serverSyncTree_, path, excludeSets) || ChildrenNode.EMPTY_NODE;
}
function repoSendReadyTransactions(repo, node = repo.transactionQueueTree_) {
  if (!node) {
    repoPruneCompletedTransactionsBelowNode(repo, node);
  }
  if (treeGetValue(node)) {
    const queue = repoBuildTransactionQueue(repo, node);
    assert$1(queue.length > 0, "Sending zero length transaction queue");
    const allRun = queue.every((transaction) => transaction.status === 0);
    if (allRun) {
      repoSendTransactionQueue(repo, treeGetPath(node), queue);
    }
  } else if (treeHasChildren(node)) {
    treeForEachChild(node, (childNode) => {
      repoSendReadyTransactions(repo, childNode);
    });
  }
}
function repoSendTransactionQueue(repo, path, queue) {
  const setsToIgnore = queue.map((txn) => {
    return txn.currentWriteId;
  });
  const latestState = repoGetLatestState(repo, path, setsToIgnore);
  let snapToSend = latestState;
  const latestHash = latestState.hash();
  for (let i = 0; i < queue.length; i++) {
    const txn = queue[i];
    assert$1(txn.status === 0, "tryToSendTransactionQueue_: items in queue should all be run.");
    txn.status = 1;
    txn.retryCount++;
    const relativePath = newRelativePath(path, txn.path);
    snapToSend = snapToSend.updateChild(relativePath, txn.currentOutputSnapshotRaw);
  }
  const dataToSend = snapToSend.val(true);
  const pathToSend = path;
  repo.server_.put(pathToSend.toString(), dataToSend, (status) => {
    repoLog(repo, "transaction put response", {
      path: pathToSend.toString(),
      status
    });
    let events = [];
    if (status === "ok") {
      const callbacks = [];
      for (let i = 0; i < queue.length; i++) {
        queue[i].status = 2;
        events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, queue[i].currentWriteId));
        if (queue[i].onComplete) {
          callbacks.push(() => queue[i].onComplete(null, true, queue[i].currentOutputSnapshotResolved));
        }
        queue[i].unwatcher();
      }
      repoPruneCompletedTransactionsBelowNode(repo, treeSubTree(repo.transactionQueueTree_, path));
      repoSendReadyTransactions(repo, repo.transactionQueueTree_);
      eventQueueRaiseEventsForChangedPath(repo.eventQueue_, path, events);
      for (let i = 0; i < callbacks.length; i++) {
        exceptionGuard(callbacks[i]);
      }
    } else {
      if (status === "datastale") {
        for (let i = 0; i < queue.length; i++) {
          if (queue[i].status === 3) {
            queue[i].status = 4;
          } else {
            queue[i].status = 0;
          }
        }
      } else {
        warn("transaction at " + pathToSend.toString() + " failed: " + status);
        for (let i = 0; i < queue.length; i++) {
          queue[i].status = 4;
          queue[i].abortReason = status;
        }
      }
      repoRerunTransactions(repo, path);
    }
  }, latestHash);
}
function repoRerunTransactions(repo, changedPath) {
  const rootMostTransactionNode = repoGetAncestorTransactionNode(repo, changedPath);
  const path = treeGetPath(rootMostTransactionNode);
  const queue = repoBuildTransactionQueue(repo, rootMostTransactionNode);
  repoRerunTransactionQueue(repo, queue, path);
  return path;
}
function repoRerunTransactionQueue(repo, queue, path) {
  if (queue.length === 0) {
    return;
  }
  const callbacks = [];
  let events = [];
  const txnsToRerun = queue.filter((q) => {
    return q.status === 0;
  });
  const setsToIgnore = txnsToRerun.map((q) => {
    return q.currentWriteId;
  });
  for (let i = 0; i < queue.length; i++) {
    const transaction = queue[i];
    const relativePath = newRelativePath(path, transaction.path);
    let abortTransaction = false, abortReason;
    assert$1(relativePath !== null, "rerunTransactionsUnderNode_: relativePath should not be null.");
    if (transaction.status === 4) {
      abortTransaction = true;
      abortReason = transaction.abortReason;
      events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, transaction.currentWriteId, true));
    } else if (transaction.status === 0) {
      if (transaction.retryCount >= MAX_TRANSACTION_RETRIES) {
        abortTransaction = true;
        abortReason = "maxretry";
        events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, transaction.currentWriteId, true));
      } else {
        const currentNode = repoGetLatestState(repo, transaction.path, setsToIgnore);
        transaction.currentInputSnapshot = currentNode;
        const newData = queue[i].update(currentNode.val());
        if (newData !== void 0) {
          validateFirebaseData("transaction failed: Data returned ", newData, transaction.path);
          let newDataNode = nodeFromJSON(newData);
          const hasExplicitPriority = typeof newData === "object" && newData != null && contains(newData, ".priority");
          if (!hasExplicitPriority) {
            newDataNode = newDataNode.updatePriority(currentNode.getPriority());
          }
          const oldWriteId = transaction.currentWriteId;
          const serverValues = repoGenerateServerValues(repo);
          const newNodeResolved = resolveDeferredValueSnapshot(newDataNode, currentNode, serverValues);
          transaction.currentOutputSnapshotRaw = newDataNode;
          transaction.currentOutputSnapshotResolved = newNodeResolved;
          transaction.currentWriteId = repoGetNextWriteId(repo);
          setsToIgnore.splice(setsToIgnore.indexOf(oldWriteId), 1);
          events = events.concat(syncTreeApplyUserOverwrite(repo.serverSyncTree_, transaction.path, newNodeResolved, transaction.currentWriteId, transaction.applyLocally));
          events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, oldWriteId, true));
        } else {
          abortTransaction = true;
          abortReason = "nodata";
          events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, transaction.currentWriteId, true));
        }
      }
    }
    eventQueueRaiseEventsForChangedPath(repo.eventQueue_, path, events);
    events = [];
    if (abortTransaction) {
      queue[i].status = 2;
      (function(unwatcher) {
        setTimeout(unwatcher, Math.floor(0));
      })(queue[i].unwatcher);
      if (queue[i].onComplete) {
        if (abortReason === "nodata") {
          callbacks.push(() => queue[i].onComplete(null, false, queue[i].currentInputSnapshot));
        } else {
          callbacks.push(() => queue[i].onComplete(new Error(abortReason), false, null));
        }
      }
    }
  }
  repoPruneCompletedTransactionsBelowNode(repo, repo.transactionQueueTree_);
  for (let i = 0; i < callbacks.length; i++) {
    exceptionGuard(callbacks[i]);
  }
  repoSendReadyTransactions(repo, repo.transactionQueueTree_);
}
function repoGetAncestorTransactionNode(repo, path) {
  let front;
  let transactionNode = repo.transactionQueueTree_;
  front = pathGetFront(path);
  while (front !== null && treeGetValue(transactionNode) === void 0) {
    transactionNode = treeSubTree(transactionNode, front);
    path = pathPopFront(path);
    front = pathGetFront(path);
  }
  return transactionNode;
}
function repoBuildTransactionQueue(repo, transactionNode) {
  const transactionQueue = [];
  repoAggregateTransactionQueuesForNode(repo, transactionNode, transactionQueue);
  transactionQueue.sort((a, b) => a.order - b.order);
  return transactionQueue;
}
function repoAggregateTransactionQueuesForNode(repo, node, queue) {
  const nodeQueue = treeGetValue(node);
  if (nodeQueue) {
    for (let i = 0; i < nodeQueue.length; i++) {
      queue.push(nodeQueue[i]);
    }
  }
  treeForEachChild(node, (child) => {
    repoAggregateTransactionQueuesForNode(repo, child, queue);
  });
}
function repoPruneCompletedTransactionsBelowNode(repo, node) {
  const queue = treeGetValue(node);
  if (queue) {
    let to = 0;
    for (let from = 0; from < queue.length; from++) {
      if (queue[from].status !== 2) {
        queue[to] = queue[from];
        to++;
      }
    }
    queue.length = to;
    treeSetValue(node, queue.length > 0 ? queue : void 0);
  }
  treeForEachChild(node, (childNode) => {
    repoPruneCompletedTransactionsBelowNode(repo, childNode);
  });
}
function repoAbortTransactions(repo, path) {
  const affectedPath = treeGetPath(repoGetAncestorTransactionNode(repo, path));
  const transactionNode = treeSubTree(repo.transactionQueueTree_, path);
  treeForEachAncestor(transactionNode, (node) => {
    repoAbortTransactionsOnNode(repo, node);
  });
  repoAbortTransactionsOnNode(repo, transactionNode);
  treeForEachDescendant(transactionNode, (node) => {
    repoAbortTransactionsOnNode(repo, node);
  });
  return affectedPath;
}
function repoAbortTransactionsOnNode(repo, node) {
  const queue = treeGetValue(node);
  if (queue) {
    const callbacks = [];
    let events = [];
    let lastSent = -1;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 3)
        ;
      else if (queue[i].status === 1) {
        assert$1(lastSent === i - 1, "All SENT items should be at beginning of queue.");
        lastSent = i;
        queue[i].status = 3;
        queue[i].abortReason = "set";
      } else {
        assert$1(queue[i].status === 0, "Unexpected transaction status in abort");
        queue[i].unwatcher();
        events = events.concat(syncTreeAckUserWrite(repo.serverSyncTree_, queue[i].currentWriteId, true));
        if (queue[i].onComplete) {
          callbacks.push(queue[i].onComplete.bind(null, new Error("set"), false, null));
        }
      }
    }
    if (lastSent === -1) {
      treeSetValue(node, void 0);
    } else {
      queue.length = lastSent + 1;
    }
    eventQueueRaiseEventsForChangedPath(repo.eventQueue_, treeGetPath(node), events);
    for (let i = 0; i < callbacks.length; i++) {
      exceptionGuard(callbacks[i]);
    }
  }
}
function decodePath(pathString) {
  let pathStringDecoded = "";
  const pieces = pathString.split("/");
  for (let i = 0; i < pieces.length; i++) {
    if (pieces[i].length > 0) {
      let piece = pieces[i];
      try {
        piece = decodeURIComponent(piece.replace(/\+/g, " "));
      } catch (e) {
      }
      pathStringDecoded += "/" + piece;
    }
  }
  return pathStringDecoded;
}
function decodeQuery(queryString) {
  const results = {};
  if (queryString.charAt(0) === "?") {
    queryString = queryString.substring(1);
  }
  for (const segment of queryString.split("&")) {
    if (segment.length === 0) {
      continue;
    }
    const kv = segment.split("=");
    if (kv.length === 2) {
      results[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    } else {
      warn(`Invalid query segment '${segment}' in query '${queryString}'`);
    }
  }
  return results;
}
function repoManagerDatabaseFromApp(app2, authProvider, appCheckProvider, url2, nodeAdmin) {
  let dbUrl = url2 || app2.options.databaseURL;
  if (dbUrl === void 0) {
    if (!app2.options.projectId) {
      fatal("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp().");
    }
    log("Using default host for project ", app2.options.projectId);
    dbUrl = `${app2.options.projectId}-default-rtdb.firebaseio.com`;
  }
  let parsedUrl = parseRepoInfo(dbUrl, nodeAdmin);
  let repoInfo = parsedUrl.repoInfo;
  let isEmulator;
  let dbEmulatorHost = void 0;
  if (typeof process !== "undefined") {
    dbEmulatorHost = process.env[FIREBASE_DATABASE_EMULATOR_HOST_VAR];
  }
  if (dbEmulatorHost) {
    isEmulator = true;
    dbUrl = `http://${dbEmulatorHost}?ns=${repoInfo.namespace}`;
    parsedUrl = parseRepoInfo(dbUrl, nodeAdmin);
    repoInfo = parsedUrl.repoInfo;
  } else {
    isEmulator = !parsedUrl.repoInfo.secure;
  }
  const authTokenProvider = nodeAdmin && isEmulator ? new EmulatorTokenProvider(EmulatorTokenProvider.OWNER) : new FirebaseAuthTokenProvider(app2.name, app2.options, authProvider);
  validateUrl("Invalid Firebase Database URL", parsedUrl);
  if (!pathIsEmpty(parsedUrl.path)) {
    fatal("Database URL must point to the root of a Firebase Database (not including a child path).");
  }
  const repo = repoManagerCreateRepo(repoInfo, app2, authTokenProvider, new AppCheckTokenProvider(app2.name, appCheckProvider));
  return new Database(repo, app2);
}
function repoManagerDeleteRepo(repo, appName) {
  const appRepos = repos[appName];
  if (!appRepos || appRepos[repo.key] !== repo) {
    fatal(`Database ${appName}(${repo.repoInfo_}) has already been deleted.`);
  }
  repoInterrupt(repo);
  delete appRepos[repo.key];
}
function repoManagerCreateRepo(repoInfo, app2, authTokenProvider, appCheckProvider) {
  let appRepos = repos[app2.name];
  if (!appRepos) {
    appRepos = {};
    repos[app2.name] = appRepos;
  }
  let repo = appRepos[repoInfo.toURLString()];
  if (repo) {
    fatal("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call.");
  }
  repo = new Repo(repoInfo, useRestClient, authTokenProvider, appCheckProvider);
  appRepos[repoInfo.toURLString()] = repo;
  return repo;
}
function registerDatabase(variant) {
  setSDKVersion(SDK_VERSION$1);
  _registerComponent(new Component("database", (container, { instanceIdentifier: url2 }) => {
    const app2 = container.getProvider("app").getImmediate();
    const authProvider = container.getProvider("auth-internal");
    const appCheckProvider = container.getProvider("app-check-internal");
    return repoManagerDatabaseFromApp(app2, authProvider, appCheckProvider, url2);
  }, "PUBLIC").setMultipleInstances(true));
  registerVersion(name, version, variant);
  registerVersion(name, version, "esm2017");
}
var import_util2, import_buffer, import_events, import_stream2, import_crypto2, import_url2, import_assert, import_net, import_tls, CONSTANTS, assert$1, assertionError, stringToByteArray$1, byteArrayToString, base64, base64Encode, base64Decode, Deferred, decode, isValidFormat, isAdmin, Sha1, stringToByteArray, stringLength, Component, LogLevel, levelStringToEnum, defaultLogLevel, ConsoleMethod, defaultLogHandler, Logger, PlatformLoggerServiceImpl, name$o, version$1$1, logger$1, name$n, name$m, name$l, name$k, name$j, name$i, name$h, name$g, name$f, name$e, name$d, name$c, name$b, name$a, name$9, name$8, name$7, name$6, name$5, name$4, name$3, name$2, name$1$1, name$p, version$2, PLATFORM_LOG_STRING, _apps, _components, SDK_VERSION$1, name$1, version$1, safeBuffer, streams$1, Stream$3, util$b, IO, Messages, Headers$3, headers, Buffer$9, StreamReader, stream_reader, Buffer$8, Emitter, util$a, streams, Headers$2, Reader, Base$7, instance$b, key$b, base, httpParser, assert, kOnHeaders, kOnHeadersComplete, kOnBody, kOnMessageComplete, compatMode0_12, methods, method_connect, headerState, stateFinishAllowed, headerExp, headerContinueExp, requestExp, responseExp, NodeHTTPParser, Buffer$7, TYPES, HttpParser$3, VERSION, http_parser, TOKEN, NOTOKEN, QUOTED, PARAM, EXT, EXT_LIST, NUMBER, hasOwnProperty, Parser$1, Offers, parser, RingBuffer$2, ring_buffer, RingBuffer$1, Functor$1, functor, RingBuffer, Pledge$2, pledge, Functor, Pledge$1, Cell$1, cell, Cell, Pledge, Pipeline$1, pipeline2, Parser, Pipeline, Extensions$1, instance$a, key$a, websocket_extensions, Frame$1, instance$9, key$9, frame, Buffer$6, Message$1, instance$8, key$8, message, Buffer$5, crypto$2, util$9, Extensions, Base$6, Frame, Message, Hybi$2, instance$7, key$7, hybi, Buffer$4, Stream$2, url$2, util$8, Base$5, Headers$1, HttpParser$2, PORTS, Proxy$1, instance$6, key$6, proxy, Buffer$3, crypto$1, url$1, util$7, HttpParser$1, Base$4, Hybi$1, Proxy2, Client$2, instance$5, key$5, client$1, Buffer$2, Base$3, util$6, Draft75$2, instance$4, key$4, draft75, Buffer$1, Base$2, Draft75$1, crypto, util$5, numberFromKey, spacesInKey, Draft76$1, instance$3, key$3, draft76, util$4, HttpParser, Base$1, Draft75, Draft76, Hybi, Server$1, instance$2, key$2, server, Base, Client$1, Server, Driver, driver$4, Event$3, event, Event$2, EventTarget$2, event_target, Stream$1, util$3, driver$3, EventTarget$1, Event$1, API$3, instance$1, method$1, key$1, api, util$2, net, tls, url, driver$2, API$2, DEFAULT_PORTS, SECURE_PROTOCOLS, Client, client, Stream2, util$1, driver$1, Headers2, API$1, EventTarget, Event, EventSource, instance, method, key, eventsource, util, driver, API, WebSocket$1, websocket, PROTOCOL_VERSION, VERSION_PARAM, TRANSPORT_SESSION_PARAM, REFERER_PARAM, FORGE_REF, FORGE_DOMAIN_RE, LAST_SESSION_PARAM, APPLICATION_ID_PARAM, APP_CHECK_TOKEN_PARAM, WEBSOCKET, LONG_POLLING, DOMStorageWrapper, MemoryStorage, createStoragefor, PersistentStorage, SessionStorage, logClient, LUIDGenerator, sha1, buildLogMessage_, logger, firstLog_, enableLogging$1, log, logWrapper, error, fatal, warn, warnIfPageIsSecure, isInvalidJSONNumber, executeWhenDOMReady, MIN_NAME, MAX_NAME, nameCompare, stringCompare, requireKey, ObjectToUniqueKey, splitStringBySize, doubleToIEEE754String, isChromeExtensionContentScript, isWindowsStoreApp, INTEGER_REGEXP_, INTEGER_32_MIN, INTEGER_32_MAX, tryParseInt, exceptionGuard, beingCrawled, setTimeoutNonBlocking, RepoInfo, StatsCollection, collections, reporters, SDK_VERSION, WEBSOCKET_MAX_FRAME_SIZE, WEBSOCKET_KEEPALIVE_INTERVAL, WebSocketImpl, WebSocketConnection, name, version, AppCheckTokenProvider, FirebaseAuthTokenProvider, EmulatorTokenProvider, PacketReceiver, FIREBASE_LONGPOLL_START_PARAM, FIREBASE_LONGPOLL_CLOSE_COMMAND, FIREBASE_LONGPOLL_COMMAND_CB_NAME, FIREBASE_LONGPOLL_DATA_CB_NAME, FIREBASE_LONGPOLL_ID_PARAM, FIREBASE_LONGPOLL_PW_PARAM, FIREBASE_LONGPOLL_SERIAL_PARAM, FIREBASE_LONGPOLL_CALLBACK_ID_PARAM, FIREBASE_LONGPOLL_SEGMENT_NUM_PARAM, FIREBASE_LONGPOLL_SEGMENTS_IN_PACKET, FIREBASE_LONGPOLL_DATA_PARAM, FIREBASE_LONGPOLL_DISCONN_FRAME_REQUEST_PARAM, MAX_URL_DATA_SIZE, SEG_HEADER_SIZE, MAX_PAYLOAD_SIZE, KEEPALIVE_REQUEST_INTERVAL, LP_CONNECT_TIMEOUT, BrowserPollConnection, FirebaseIFrameScriptHolder, TransportManager, UPGRADE_TIMEOUT, DELAY_BEFORE_SENDING_EXTRA_REQUESTS, BYTES_SENT_HEALTHY_OVERRIDE, BYTES_RECEIVED_HEALTHY_OVERRIDE, MESSAGE_TYPE, MESSAGE_DATA, CONTROL_SHUTDOWN, CONTROL_RESET, CONTROL_ERROR, CONTROL_PONG, SWITCH_ACK, END_TRANSMISSION, PING, SERVER_HELLO, Connection, ServerActions, EventEmitter, OnlineMonitor, MAX_PATH_DEPTH, MAX_PATH_LENGTH_BYTES, Path, ValidationPath, VisibilityMonitor, RECONNECT_MIN_DELAY, RECONNECT_MAX_DELAY_DEFAULT, GET_CONNECT_TIMEOUT, RECONNECT_MAX_DELAY_FOR_ADMINS, RECONNECT_DELAY_MULTIPLIER, RECONNECT_DELAY_RESET_TIMEOUT, SERVER_KILL_INTERRUPT_REASON, INVALID_TOKEN_THRESHOLD, PersistentConnection, NamedNode, Index, __EMPTY_NODE, KeyIndex, KEY_INDEX, SortedMapIterator, LLRBNode, LLRBEmptyNode, SortedMap, MAX_NODE$2, priorityHashText, validatePriorityNode, __childrenNodeConstructor, LeafNode, nodeFromJSON$1, MAX_NODE$1, PriorityIndex, PRIORITY_INDEX, LOG_2, Base12Num, buildChildSet, _defaultIndexMap, fallbackObject, IndexMap, EMPTY_NODE, ChildrenNode, MaxNode, MAX_NODE, USE_HINZE, PathIndex, ValueIndex, VALUE_INDEX, QueryParams, ReadonlyRestClient, SnapshotHolder, StatsListener, FIRST_STATS_MIN_TIME, FIRST_STATS_MAX_TIME, REPORT_STATS_INTERVAL, StatsReporter, OperationType, AckUserWrite, Overwrite, Merge, CacheNode, emptyChildrenSingleton, EmptyChildren, ImmutableTree, CompoundWrite, ChildChangeAccumulator, NoCompleteChildSource_, NO_COMPLETE_CHILD_SOURCE, WriteTreeCompleteChildSource, referenceConstructor$1, referenceConstructor, SyncTree, ExistingValueProvider, DeferredValueProvider, generateWithValues, resolveDeferredLeafValue, resolveScalarDeferredValue, resolveComplexDeferredValue, resolveDeferredValueTree, resolveDeferredValueSnapshot, Tree, INVALID_KEY_REGEX_, INVALID_PATH_REGEX_, MAX_LEAF_SIZE_, isValidKey, isValidPathString, isValidRootPathString, validateFirebaseData, validateUrl, EventQueue, INTERRUPT_REASON, MAX_TRANSACTION_RETRIES, Repo, parseRepoInfo, parseDatabaseURL, QueryImpl, ReferenceImpl, FIREBASE_DATABASE_EMULATOR_HOST_VAR, repos, useRestClient, Database, css, NavBar, ToolButton, ToolBar, _layout;
var init_layout_2812f51c = __esm({
  ".svelte-kit/output/server/chunks/__layout-2812f51c.js"() {
    init_shims();
    init_app_a5a3d39a();
    import_util2 = __toModule(require("util"));
    import_buffer = __toModule(require("buffer"));
    import_events = __toModule(require("events"));
    import_stream2 = __toModule(require("stream"));
    import_crypto2 = __toModule(require("crypto"));
    import_url2 = __toModule(require("url"));
    import_assert = __toModule(require("assert"));
    import_net = __toModule(require("net"));
    import_tls = __toModule(require("tls"));
    CONSTANTS = {
      NODE_CLIENT: false,
      NODE_ADMIN: false,
      SDK_VERSION: "${JSCORE_VERSION}"
    };
    assert$1 = function(assertion, message2) {
      if (!assertion) {
        throw assertionError(message2);
      }
    };
    assertionError = function(message2) {
      return new Error("Firebase Database (" + CONSTANTS.SDK_VERSION + ") INTERNAL ASSERT FAILED: " + message2);
    };
    stringToByteArray$1 = function(str) {
      const out = [];
      let p = 0;
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 128) {
          out[p++] = c;
        } else if (c < 2048) {
          out[p++] = c >> 6 | 192;
          out[p++] = c & 63 | 128;
        } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
          c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
          out[p++] = c >> 18 | 240;
          out[p++] = c >> 12 & 63 | 128;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        } else {
          out[p++] = c >> 12 | 224;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        }
      }
      return out;
    };
    byteArrayToString = function(bytes) {
      const out = [];
      let pos = 0, c = 0;
      while (pos < bytes.length) {
        const c1 = bytes[pos++];
        if (c1 < 128) {
          out[c++] = String.fromCharCode(c1);
        } else if (c1 > 191 && c1 < 224) {
          const c2 = bytes[pos++];
          out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
        } else if (c1 > 239 && c1 < 365) {
          const c2 = bytes[pos++];
          const c3 = bytes[pos++];
          const c4 = bytes[pos++];
          const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
          out[c++] = String.fromCharCode(55296 + (u >> 10));
          out[c++] = String.fromCharCode(56320 + (u & 1023));
        } else {
          const c2 = bytes[pos++];
          const c3 = bytes[pos++];
          out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
      }
      return out.join("");
    };
    base64 = {
      byteToCharMap_: null,
      charToByteMap_: null,
      byteToCharMapWebSafe_: null,
      charToByteMapWebSafe_: null,
      ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      get ENCODED_VALS() {
        return this.ENCODED_VALS_BASE + "+/=";
      },
      get ENCODED_VALS_WEBSAFE() {
        return this.ENCODED_VALS_BASE + "-_.";
      },
      HAS_NATIVE_SUPPORT: typeof atob === "function",
      encodeByteArray(input, webSafe) {
        if (!Array.isArray(input)) {
          throw Error("encodeByteArray takes an array as a parameter");
        }
        this.init_();
        const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
        const output = [];
        for (let i = 0; i < input.length; i += 3) {
          const byte1 = input[i];
          const haveByte2 = i + 1 < input.length;
          const byte2 = haveByte2 ? input[i + 1] : 0;
          const haveByte3 = i + 2 < input.length;
          const byte3 = haveByte3 ? input[i + 2] : 0;
          const outByte1 = byte1 >> 2;
          const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
          let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
          let outByte4 = byte3 & 63;
          if (!haveByte3) {
            outByte4 = 64;
            if (!haveByte2) {
              outByte3 = 64;
            }
          }
          output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
        }
        return output.join("");
      },
      encodeString(input, webSafe) {
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
          return btoa(input);
        }
        return this.encodeByteArray(stringToByteArray$1(input), webSafe);
      },
      decodeString(input, webSafe) {
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
          return atob(input);
        }
        return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
      },
      decodeStringToByteArray(input, webSafe) {
        this.init_();
        const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
        const output = [];
        for (let i = 0; i < input.length; ) {
          const byte1 = charToByteMap[input.charAt(i++)];
          const haveByte2 = i < input.length;
          const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
          ++i;
          const haveByte3 = i < input.length;
          const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
          ++i;
          const haveByte4 = i < input.length;
          const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
          ++i;
          if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
            throw Error();
          }
          const outByte1 = byte1 << 2 | byte2 >> 4;
          output.push(outByte1);
          if (byte3 !== 64) {
            const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
            output.push(outByte2);
            if (byte4 !== 64) {
              const outByte3 = byte3 << 6 & 192 | byte4;
              output.push(outByte3);
            }
          }
        }
        return output;
      },
      init_() {
        if (!this.byteToCharMap_) {
          this.byteToCharMap_ = {};
          this.charToByteMap_ = {};
          this.byteToCharMapWebSafe_ = {};
          this.charToByteMapWebSafe_ = {};
          for (let i = 0; i < this.ENCODED_VALS.length; i++) {
            this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
            this.charToByteMap_[this.byteToCharMap_[i]] = i;
            this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
            this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
            if (i >= this.ENCODED_VALS_BASE.length) {
              this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
              this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
            }
          }
        }
      }
    };
    base64Encode = function(str) {
      const utf8Bytes = stringToByteArray$1(str);
      return base64.encodeByteArray(utf8Bytes, true);
    };
    base64Decode = function(str) {
      try {
        return base64.decodeString(str, true);
      } catch (e) {
        console.error("base64Decode failed: ", e);
      }
      return null;
    };
    Deferred = class {
      constructor() {
        this.reject = () => {
        };
        this.resolve = () => {
        };
        this.promise = new Promise((resolve2, reject) => {
          this.resolve = resolve2;
          this.reject = reject;
        });
      }
      wrapCallback(callback) {
        return (error22, value) => {
          if (error22) {
            this.reject(error22);
          } else {
            this.resolve(value);
          }
          if (typeof callback === "function") {
            this.promise.catch(() => {
            });
            if (callback.length === 1) {
              callback(error22);
            } else {
              callback(error22, value);
            }
          }
        };
      }
    };
    decode = function(token) {
      let header = {}, claims = {}, data = {}, signature = "";
      try {
        const parts = token.split(".");
        header = jsonEval(base64Decode(parts[0]) || "");
        claims = jsonEval(base64Decode(parts[1]) || "");
        signature = parts[2];
        data = claims["d"] || {};
        delete claims["d"];
      } catch (e) {
      }
      return {
        header,
        claims,
        data,
        signature
      };
    };
    isValidFormat = function(token) {
      const decoded = decode(token), claims = decoded.claims;
      return !!claims && typeof claims === "object" && claims.hasOwnProperty("iat");
    };
    isAdmin = function(token) {
      const claims = decode(token).claims;
      return typeof claims === "object" && claims["admin"] === true;
    };
    Sha1 = class {
      constructor() {
        this.chain_ = [];
        this.buf_ = [];
        this.W_ = [];
        this.pad_ = [];
        this.inbuf_ = 0;
        this.total_ = 0;
        this.blockSize = 512 / 8;
        this.pad_[0] = 128;
        for (let i = 1; i < this.blockSize; ++i) {
          this.pad_[i] = 0;
        }
        this.reset();
      }
      reset() {
        this.chain_[0] = 1732584193;
        this.chain_[1] = 4023233417;
        this.chain_[2] = 2562383102;
        this.chain_[3] = 271733878;
        this.chain_[4] = 3285377520;
        this.inbuf_ = 0;
        this.total_ = 0;
      }
      compress_(buf, offset) {
        if (!offset) {
          offset = 0;
        }
        const W = this.W_;
        if (typeof buf === "string") {
          for (let i = 0; i < 16; i++) {
            W[i] = buf.charCodeAt(offset) << 24 | buf.charCodeAt(offset + 1) << 16 | buf.charCodeAt(offset + 2) << 8 | buf.charCodeAt(offset + 3);
            offset += 4;
          }
        } else {
          for (let i = 0; i < 16; i++) {
            W[i] = buf[offset] << 24 | buf[offset + 1] << 16 | buf[offset + 2] << 8 | buf[offset + 3];
            offset += 4;
          }
        }
        for (let i = 16; i < 80; i++) {
          const t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
          W[i] = (t << 1 | t >>> 31) & 4294967295;
        }
        let a = this.chain_[0];
        let b = this.chain_[1];
        let c = this.chain_[2];
        let d = this.chain_[3];
        let e = this.chain_[4];
        let f, k;
        for (let i = 0; i < 80; i++) {
          if (i < 40) {
            if (i < 20) {
              f = d ^ b & (c ^ d);
              k = 1518500249;
            } else {
              f = b ^ c ^ d;
              k = 1859775393;
            }
          } else {
            if (i < 60) {
              f = b & c | d & (b | c);
              k = 2400959708;
            } else {
              f = b ^ c ^ d;
              k = 3395469782;
            }
          }
          const t = (a << 5 | a >>> 27) + f + e + k + W[i] & 4294967295;
          e = d;
          d = c;
          c = (b << 30 | b >>> 2) & 4294967295;
          b = a;
          a = t;
        }
        this.chain_[0] = this.chain_[0] + a & 4294967295;
        this.chain_[1] = this.chain_[1] + b & 4294967295;
        this.chain_[2] = this.chain_[2] + c & 4294967295;
        this.chain_[3] = this.chain_[3] + d & 4294967295;
        this.chain_[4] = this.chain_[4] + e & 4294967295;
      }
      update(bytes, length) {
        if (bytes == null) {
          return;
        }
        if (length === void 0) {
          length = bytes.length;
        }
        const lengthMinusBlock = length - this.blockSize;
        let n = 0;
        const buf = this.buf_;
        let inbuf = this.inbuf_;
        while (n < length) {
          if (inbuf === 0) {
            while (n <= lengthMinusBlock) {
              this.compress_(bytes, n);
              n += this.blockSize;
            }
          }
          if (typeof bytes === "string") {
            while (n < length) {
              buf[inbuf] = bytes.charCodeAt(n);
              ++inbuf;
              ++n;
              if (inbuf === this.blockSize) {
                this.compress_(buf);
                inbuf = 0;
                break;
              }
            }
          } else {
            while (n < length) {
              buf[inbuf] = bytes[n];
              ++inbuf;
              ++n;
              if (inbuf === this.blockSize) {
                this.compress_(buf);
                inbuf = 0;
                break;
              }
            }
          }
        }
        this.inbuf_ = inbuf;
        this.total_ += length;
      }
      digest() {
        const digest = [];
        let totalBits = this.total_ * 8;
        if (this.inbuf_ < 56) {
          this.update(this.pad_, 56 - this.inbuf_);
        } else {
          this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
        }
        for (let i = this.blockSize - 1; i >= 56; i--) {
          this.buf_[i] = totalBits & 255;
          totalBits /= 256;
        }
        this.compress_(this.buf_);
        let n = 0;
        for (let i = 0; i < 5; i++) {
          for (let j = 24; j >= 0; j -= 8) {
            digest[n] = this.chain_[i] >> j & 255;
            ++n;
          }
        }
        return digest;
      }
    };
    stringToByteArray = function(str) {
      const out = [];
      let p = 0;
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c >= 55296 && c <= 56319) {
          const high = c - 55296;
          i++;
          assert$1(i < str.length, "Surrogate pair missing trail surrogate.");
          const low = str.charCodeAt(i) - 56320;
          c = 65536 + (high << 10) + low;
        }
        if (c < 128) {
          out[p++] = c;
        } else if (c < 2048) {
          out[p++] = c >> 6 | 192;
          out[p++] = c & 63 | 128;
        } else if (c < 65536) {
          out[p++] = c >> 12 | 224;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        } else {
          out[p++] = c >> 18 | 240;
          out[p++] = c >> 12 & 63 | 128;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        }
      }
      return out;
    };
    stringLength = function(str) {
      let p = 0;
      for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c < 128) {
          p++;
        } else if (c < 2048) {
          p += 2;
        } else if (c >= 55296 && c <= 56319) {
          p += 4;
          i++;
        } else {
          p += 3;
        }
      }
      return p;
    };
    CONSTANTS.NODE_CLIENT = true;
    Component = class {
      constructor(name2, instanceFactory, type) {
        this.name = name2;
        this.instanceFactory = instanceFactory;
        this.type = type;
        this.multipleInstances = false;
        this.serviceProps = {};
        this.instantiationMode = "LAZY";
        this.onInstanceCreated = null;
      }
      setInstantiationMode(mode) {
        this.instantiationMode = mode;
        return this;
      }
      setMultipleInstances(multipleInstances) {
        this.multipleInstances = multipleInstances;
        return this;
      }
      setServiceProps(props) {
        this.serviceProps = props;
        return this;
      }
      setInstanceCreatedCallback(callback) {
        this.onInstanceCreated = callback;
        return this;
      }
    };
    (function(LogLevel2) {
      LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
      LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
      LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
      LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
      LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
      LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
    })(LogLevel || (LogLevel = {}));
    levelStringToEnum = {
      "debug": LogLevel.DEBUG,
      "verbose": LogLevel.VERBOSE,
      "info": LogLevel.INFO,
      "warn": LogLevel.WARN,
      "error": LogLevel.ERROR,
      "silent": LogLevel.SILENT
    };
    defaultLogLevel = LogLevel.INFO;
    ConsoleMethod = {
      [LogLevel.DEBUG]: "log",
      [LogLevel.VERBOSE]: "log",
      [LogLevel.INFO]: "info",
      [LogLevel.WARN]: "warn",
      [LogLevel.ERROR]: "error"
    };
    defaultLogHandler = (instance2, logType, ...args) => {
      if (logType < instance2.logLevel) {
        return;
      }
      const now = new Date().toISOString();
      const method = ConsoleMethod[logType];
      if (method) {
        console[method](`[${now}]  ${instance2.name}:`, ...args);
      } else {
        throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
      }
    };
    Logger = class {
      constructor(name2) {
        this.name = name2;
        this._logLevel = defaultLogLevel;
        this._logHandler = defaultLogHandler;
        this._userLogHandler = null;
      }
      get logLevel() {
        return this._logLevel;
      }
      set logLevel(val) {
        if (!(val in LogLevel)) {
          throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
        }
        this._logLevel = val;
      }
      setLogLevel(val) {
        this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
      }
      get logHandler() {
        return this._logHandler;
      }
      set logHandler(val) {
        if (typeof val !== "function") {
          throw new TypeError("Value assigned to `logHandler` must be a function");
        }
        this._logHandler = val;
      }
      get userLogHandler() {
        return this._userLogHandler;
      }
      set userLogHandler(val) {
        this._userLogHandler = val;
      }
      debug(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
        this._logHandler(this, LogLevel.DEBUG, ...args);
      }
      log(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
        this._logHandler(this, LogLevel.VERBOSE, ...args);
      }
      info(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
        this._logHandler(this, LogLevel.INFO, ...args);
      }
      warn(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
        this._logHandler(this, LogLevel.WARN, ...args);
      }
      error(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
        this._logHandler(this, LogLevel.ERROR, ...args);
      }
    };
    PlatformLoggerServiceImpl = class {
      constructor(container) {
        this.container = container;
      }
      getPlatformInfoString() {
        const providers = this.container.getProviders();
        return providers.map((provider) => {
          if (isVersionServiceProvider(provider)) {
            const service = provider.getImmediate();
            return `${service.library}/${service.version}`;
          } else {
            return null;
          }
        }).filter((logString) => logString).join(" ");
      }
    };
    name$o = "@firebase/app";
    version$1$1 = "0.7.10";
    logger$1 = new Logger("@firebase/app");
    name$n = "@firebase/app-compat";
    name$m = "@firebase/analytics-compat";
    name$l = "@firebase/analytics";
    name$k = "@firebase/app-check-compat";
    name$j = "@firebase/app-check";
    name$i = "@firebase/auth";
    name$h = "@firebase/auth-compat";
    name$g = "@firebase/database";
    name$f = "@firebase/database-compat";
    name$e = "@firebase/functions";
    name$d = "@firebase/functions-compat";
    name$c = "@firebase/installations";
    name$b = "@firebase/installations-compat";
    name$a = "@firebase/messaging";
    name$9 = "@firebase/messaging-compat";
    name$8 = "@firebase/performance";
    name$7 = "@firebase/performance-compat";
    name$6 = "@firebase/remote-config";
    name$5 = "@firebase/remote-config-compat";
    name$4 = "@firebase/storage";
    name$3 = "@firebase/storage-compat";
    name$2 = "@firebase/firestore";
    name$1$1 = "@firebase/firestore-compat";
    name$p = "firebase";
    version$2 = "9.6.0";
    PLATFORM_LOG_STRING = {
      [name$o]: "fire-core",
      [name$n]: "fire-core-compat",
      [name$l]: "fire-analytics",
      [name$m]: "fire-analytics-compat",
      [name$j]: "fire-app-check",
      [name$k]: "fire-app-check-compat",
      [name$i]: "fire-auth",
      [name$h]: "fire-auth-compat",
      [name$g]: "fire-rtdb",
      [name$f]: "fire-rtdb-compat",
      [name$e]: "fire-fn",
      [name$d]: "fire-fn-compat",
      [name$c]: "fire-iid",
      [name$b]: "fire-iid-compat",
      [name$a]: "fire-fcm",
      [name$9]: "fire-fcm-compat",
      [name$8]: "fire-perf",
      [name$7]: "fire-perf-compat",
      [name$6]: "fire-rc",
      [name$5]: "fire-rc-compat",
      [name$4]: "fire-gcs",
      [name$3]: "fire-gcs-compat",
      [name$2]: "fire-fst",
      [name$1$1]: "fire-fst-compat",
      "fire-js": "fire-js",
      [name$p]: "fire-js-all"
    };
    _apps = new Map();
    _components = new Map();
    SDK_VERSION$1 = version$2;
    registerCoreComponents("");
    name$1 = "firebase";
    version$1 = "9.6.0";
    registerVersion(name$1, version$1, "app");
    safeBuffer = { exports: {} };
    (function(module2, exports) {
      var buffer = import_buffer.default;
      var Buffer2 = buffer.Buffer;
      function copyProps(src2, dst) {
        for (var key in src2) {
          dst[key] = src2[key];
        }
      }
      if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
        module2.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer2(arg, encodingOrOffset, length);
      }
      copyProps(Buffer2, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer2(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer2(size);
        if (fill !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer2(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    })(safeBuffer, safeBuffer.exports);
    streams$1 = {};
    Stream$3 = import_stream2.default.Stream;
    util$b = import_util2.default;
    IO = function(driver2) {
      this.readable = this.writable = true;
      this._paused = false;
      this._driver = driver2;
    };
    util$b.inherits(IO, Stream$3);
    IO.prototype.pause = function() {
      this._paused = true;
      this._driver.messages._paused = true;
    };
    IO.prototype.resume = function() {
      this._paused = false;
      this.emit("drain");
      var messages = this._driver.messages;
      messages._paused = false;
      messages.emit("drain");
    };
    IO.prototype.write = function(chunk) {
      if (!this.writable)
        return false;
      this._driver.parse(chunk);
      return !this._paused;
    };
    IO.prototype.end = function(chunk) {
      if (!this.writable)
        return;
      if (chunk !== void 0)
        this.write(chunk);
      this.writable = false;
      var messages = this._driver.messages;
      if (messages.readable) {
        messages.readable = messages.writable = false;
        messages.emit("end");
      }
    };
    IO.prototype.destroy = function() {
      this.end();
    };
    Messages = function(driver2) {
      this.readable = this.writable = true;
      this._paused = false;
      this._driver = driver2;
    };
    util$b.inherits(Messages, Stream$3);
    Messages.prototype.pause = function() {
      this._driver.io._paused = true;
    };
    Messages.prototype.resume = function() {
      this._driver.io._paused = false;
      this._driver.io.emit("drain");
    };
    Messages.prototype.write = function(message2) {
      if (!this.writable)
        return false;
      if (typeof message2 === "string")
        this._driver.text(message2);
      else
        this._driver.binary(message2);
      return !this._paused;
    };
    Messages.prototype.end = function(message2) {
      if (message2 !== void 0)
        this.write(message2);
    };
    Messages.prototype.destroy = function() {
    };
    streams$1.IO = IO;
    streams$1.Messages = Messages;
    Headers$3 = function() {
      this.clear();
    };
    Headers$3.prototype.ALLOWED_DUPLICATES = ["set-cookie", "set-cookie2", "warning", "www-authenticate"];
    Headers$3.prototype.clear = function() {
      this._sent = {};
      this._lines = [];
    };
    Headers$3.prototype.set = function(name2, value) {
      if (value === void 0)
        return;
      name2 = this._strip(name2);
      value = this._strip(value);
      var key = name2.toLowerCase();
      if (!this._sent.hasOwnProperty(key) || this.ALLOWED_DUPLICATES.indexOf(key) >= 0) {
        this._sent[key] = true;
        this._lines.push(name2 + ": " + value + "\r\n");
      }
    };
    Headers$3.prototype.toString = function() {
      return this._lines.join("");
    };
    Headers$3.prototype._strip = function(string) {
      return string.toString().replace(/^ */, "").replace(/ *$/, "");
    };
    headers = Headers$3;
    Buffer$9 = safeBuffer.exports.Buffer;
    StreamReader = function() {
      this._queue = [];
      this._queueSize = 0;
      this._offset = 0;
    };
    StreamReader.prototype.put = function(buffer) {
      if (!buffer || buffer.length === 0)
        return;
      if (!Buffer$9.isBuffer(buffer))
        buffer = Buffer$9.from(buffer);
      this._queue.push(buffer);
      this._queueSize += buffer.length;
    };
    StreamReader.prototype.read = function(length) {
      if (length > this._queueSize)
        return null;
      if (length === 0)
        return Buffer$9.alloc(0);
      this._queueSize -= length;
      var queue = this._queue, remain = length, first = queue[0], buffers, buffer;
      if (first.length >= length) {
        if (first.length === length) {
          return queue.shift();
        } else {
          buffer = first.slice(0, length);
          queue[0] = first.slice(length);
          return buffer;
        }
      }
      for (var i = 0, n = queue.length; i < n; i++) {
        if (remain < queue[i].length)
          break;
        remain -= queue[i].length;
      }
      buffers = queue.splice(0, i);
      if (remain > 0 && queue.length > 0) {
        buffers.push(queue[0].slice(0, remain));
        queue[0] = queue[0].slice(remain);
      }
      return Buffer$9.concat(buffers, length);
    };
    StreamReader.prototype.eachByte = function(callback, context) {
      var buffer, n, index;
      while (this._queue.length > 0) {
        buffer = this._queue[0];
        n = buffer.length;
        while (this._offset < n) {
          index = this._offset;
          this._offset += 1;
          callback.call(context, buffer[index]);
        }
        this._offset = 0;
        this._queue.shift();
      }
    };
    stream_reader = StreamReader;
    Buffer$8 = safeBuffer.exports.Buffer;
    Emitter = import_events.default.EventEmitter;
    util$a = import_util2.default;
    streams = streams$1;
    Headers$2 = headers;
    Reader = stream_reader;
    Base$7 = function(request, url2, options2) {
      Emitter.call(this);
      Base$7.validateOptions(options2 || {}, ["maxLength", "masking", "requireMasking", "protocols"]);
      this._request = request;
      this._reader = new Reader();
      this._options = options2 || {};
      this._maxLength = this._options.maxLength || this.MAX_LENGTH;
      this._headers = new Headers$2();
      this.__queue = [];
      this.readyState = 0;
      this.url = url2;
      this.io = new streams.IO(this);
      this.messages = new streams.Messages(this);
      this._bindEventListeners();
    };
    util$a.inherits(Base$7, Emitter);
    Base$7.isWebSocket = function(request) {
      var connection = request.headers.connection || "", upgrade = request.headers.upgrade || "";
      return request.method === "GET" && connection.toLowerCase().split(/ *, */).indexOf("upgrade") >= 0 && upgrade.toLowerCase() === "websocket";
    };
    Base$7.validateOptions = function(options2, validKeys) {
      for (var key in options2) {
        if (validKeys.indexOf(key) < 0)
          throw new Error("Unrecognized option: " + key);
      }
    };
    instance$b = {
      MAX_LENGTH: 67108863,
      STATES: ["connecting", "open", "closing", "closed"],
      _bindEventListeners: function() {
        var self2 = this;
        this.messages.on("error", function() {
        });
        this.on("message", function(event2) {
          var messages = self2.messages;
          if (messages.readable)
            messages.emit("data", event2.data);
        });
        this.on("error", function(error22) {
          var messages = self2.messages;
          if (messages.readable)
            messages.emit("error", error22);
        });
        this.on("close", function() {
          var messages = self2.messages;
          if (!messages.readable)
            return;
          messages.readable = messages.writable = false;
          messages.emit("end");
        });
      },
      getState: function() {
        return this.STATES[this.readyState] || null;
      },
      addExtension: function(extension) {
        return false;
      },
      setHeader: function(name2, value) {
        if (this.readyState > 0)
          return false;
        this._headers.set(name2, value);
        return true;
      },
      start: function() {
        if (this.readyState !== 0)
          return false;
        if (!Base$7.isWebSocket(this._request))
          return this._failHandshake(new Error("Not a WebSocket request"));
        var response;
        try {
          response = this._handshakeResponse();
        } catch (error22) {
          return this._failHandshake(error22);
        }
        this._write(response);
        if (this._stage !== -1)
          this._open();
        return true;
      },
      _failHandshake: function(error22) {
        var headers2 = new Headers$2();
        headers2.set("Content-Type", "text/plain");
        headers2.set("Content-Length", Buffer$8.byteLength(error22.message, "utf8"));
        headers2 = ["HTTP/1.1 400 Bad Request", headers2.toString(), error22.message];
        this._write(Buffer$8.from(headers2.join("\r\n"), "utf8"));
        this._fail("protocol_error", error22.message);
        return false;
      },
      text: function(message2) {
        return this.frame(message2);
      },
      binary: function(message2) {
        return false;
      },
      ping: function() {
        return false;
      },
      pong: function() {
        return false;
      },
      close: function(reason, code) {
        if (this.readyState !== 1)
          return false;
        this.readyState = 3;
        this.emit("close", new Base$7.CloseEvent(null, null));
        return true;
      },
      _open: function() {
        this.readyState = 1;
        this.__queue.forEach(function(args) {
          this.frame.apply(this, args);
        }, this);
        this.__queue = [];
        this.emit("open", new Base$7.OpenEvent());
      },
      _queue: function(message2) {
        this.__queue.push(message2);
        return true;
      },
      _write: function(chunk) {
        var io = this.io;
        if (io.readable)
          io.emit("data", chunk);
      },
      _fail: function(type, message2) {
        this.readyState = 2;
        this.emit("error", new Error(message2));
        this.close();
      }
    };
    for (key$b in instance$b)
      Base$7.prototype[key$b] = instance$b[key$b];
    Base$7.ConnectEvent = function() {
    };
    Base$7.OpenEvent = function() {
    };
    Base$7.CloseEvent = function(code, reason) {
      this.code = code;
      this.reason = reason;
    };
    Base$7.MessageEvent = function(data) {
      this.data = data;
    };
    Base$7.PingEvent = function(data) {
      this.data = data;
    };
    Base$7.PongEvent = function(data) {
      this.data = data;
    };
    base = Base$7;
    httpParser = {};
    assert = import_assert.default;
    httpParser.HTTPParser = HTTPParser;
    HTTPParser.prototype.initialize = function(type, async_resource) {
      assert.ok(type === HTTPParser.REQUEST || type === HTTPParser.RESPONSE);
      this.type = type;
      this.state = type + "_LINE";
      this.info = {
        headers: [],
        upgrade: false
      };
      this.trailers = [];
      this.line = "";
      this.isChunked = false;
      this.connection = "";
      this.headerSize = 0;
      this.body_bytes = null;
      this.isUserCall = false;
      this.hadError = false;
    };
    HTTPParser.encoding = "ascii";
    HTTPParser.maxHeaderSize = 80 * 1024;
    HTTPParser.REQUEST = "REQUEST";
    HTTPParser.RESPONSE = "RESPONSE";
    kOnHeaders = HTTPParser.kOnHeaders = 1;
    kOnHeadersComplete = HTTPParser.kOnHeadersComplete = 2;
    kOnBody = HTTPParser.kOnBody = 3;
    kOnMessageComplete = HTTPParser.kOnMessageComplete = 4;
    HTTPParser.prototype[kOnHeaders] = HTTPParser.prototype[kOnHeadersComplete] = HTTPParser.prototype[kOnBody] = HTTPParser.prototype[kOnMessageComplete] = function() {
    };
    compatMode0_12 = true;
    Object.defineProperty(HTTPParser, "kOnExecute", {
      get: function() {
        compatMode0_12 = false;
        return 99;
      }
    });
    methods = httpParser.methods = HTTPParser.methods = [
      "DELETE",
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "CONNECT",
      "OPTIONS",
      "TRACE",
      "COPY",
      "LOCK",
      "MKCOL",
      "MOVE",
      "PROPFIND",
      "PROPPATCH",
      "SEARCH",
      "UNLOCK",
      "BIND",
      "REBIND",
      "UNBIND",
      "ACL",
      "REPORT",
      "MKACTIVITY",
      "CHECKOUT",
      "MERGE",
      "M-SEARCH",
      "NOTIFY",
      "SUBSCRIBE",
      "UNSUBSCRIBE",
      "PATCH",
      "PURGE",
      "MKCALENDAR",
      "LINK",
      "UNLINK"
    ];
    method_connect = methods.indexOf("CONNECT");
    HTTPParser.prototype.reinitialize = HTTPParser;
    HTTPParser.prototype.close = HTTPParser.prototype.pause = HTTPParser.prototype.resume = HTTPParser.prototype.free = function() {
    };
    HTTPParser.prototype._compatMode0_11 = false;
    HTTPParser.prototype.getAsyncId = function() {
      return 0;
    };
    headerState = {
      REQUEST_LINE: true,
      RESPONSE_LINE: true,
      HEADER: true
    };
    HTTPParser.prototype.execute = function(chunk, start, length) {
      if (!(this instanceof HTTPParser)) {
        throw new TypeError("not a HTTPParser");
      }
      start = start || 0;
      length = typeof length === "number" ? length : chunk.length;
      this.chunk = chunk;
      this.offset = start;
      var end = this.end = start + length;
      try {
        while (this.offset < end) {
          if (this[this.state]()) {
            break;
          }
        }
      } catch (err) {
        if (this.isUserCall) {
          throw err;
        }
        this.hadError = true;
        return err;
      }
      this.chunk = null;
      length = this.offset - start;
      if (headerState[this.state]) {
        this.headerSize += length;
        if (this.headerSize > HTTPParser.maxHeaderSize) {
          return new Error("max header size exceeded");
        }
      }
      return length;
    };
    stateFinishAllowed = {
      REQUEST_LINE: true,
      RESPONSE_LINE: true,
      BODY_RAW: true
    };
    HTTPParser.prototype.finish = function() {
      if (this.hadError) {
        return;
      }
      if (!stateFinishAllowed[this.state]) {
        return new Error("invalid state for EOF");
      }
      if (this.state === "BODY_RAW") {
        this.userCall()(this[kOnMessageComplete]());
      }
    };
    HTTPParser.prototype.consume = HTTPParser.prototype.unconsume = HTTPParser.prototype.getCurrentBuffer = function() {
    };
    HTTPParser.prototype.userCall = function() {
      this.isUserCall = true;
      var self2 = this;
      return function(ret) {
        self2.isUserCall = false;
        return ret;
      };
    };
    HTTPParser.prototype.nextRequest = function() {
      this.userCall()(this[kOnMessageComplete]());
      this.reinitialize(this.type);
    };
    HTTPParser.prototype.consumeLine = function() {
      var end = this.end, chunk = this.chunk;
      for (var i = this.offset; i < end; i++) {
        if (chunk[i] === 10) {
          var line = this.line + chunk.toString(HTTPParser.encoding, this.offset, i);
          if (line.charAt(line.length - 1) === "\r") {
            line = line.substr(0, line.length - 1);
          }
          this.line = "";
          this.offset = i + 1;
          return line;
        }
      }
      this.line += chunk.toString(HTTPParser.encoding, this.offset, this.end);
      this.offset = this.end;
    };
    headerExp = /^([^: \t]+):[ \t]*((?:.*[^ \t])|)/;
    headerContinueExp = /^[ \t]+(.*[^ \t])/;
    HTTPParser.prototype.parseHeader = function(line, headers2) {
      if (line.indexOf("\r") !== -1) {
        throw parseErrorCode("HPE_LF_EXPECTED");
      }
      var match = headerExp.exec(line);
      var k = match && match[1];
      if (k) {
        headers2.push(k);
        headers2.push(match[2]);
      } else {
        var matchContinue = headerContinueExp.exec(line);
        if (matchContinue && headers2.length) {
          if (headers2[headers2.length - 1]) {
            headers2[headers2.length - 1] += " ";
          }
          headers2[headers2.length - 1] += matchContinue[1];
        }
      }
    };
    requestExp = /^([A-Z-]+) ([^ ]+) HTTP\/(\d)\.(\d)$/;
    HTTPParser.prototype.REQUEST_LINE = function() {
      var line = this.consumeLine();
      if (!line) {
        return;
      }
      var match = requestExp.exec(line);
      if (match === null) {
        throw parseErrorCode("HPE_INVALID_CONSTANT");
      }
      this.info.method = this._compatMode0_11 ? match[1] : methods.indexOf(match[1]);
      if (this.info.method === -1) {
        throw new Error("invalid request method");
      }
      this.info.url = match[2];
      this.info.versionMajor = +match[3];
      this.info.versionMinor = +match[4];
      this.body_bytes = 0;
      this.state = "HEADER";
    };
    responseExp = /^HTTP\/(\d)\.(\d) (\d{3}) ?(.*)$/;
    HTTPParser.prototype.RESPONSE_LINE = function() {
      var line = this.consumeLine();
      if (!line) {
        return;
      }
      var match = responseExp.exec(line);
      if (match === null) {
        throw parseErrorCode("HPE_INVALID_CONSTANT");
      }
      this.info.versionMajor = +match[1];
      this.info.versionMinor = +match[2];
      var statusCode = this.info.statusCode = +match[3];
      this.info.statusMessage = match[4];
      if ((statusCode / 100 | 0) === 1 || statusCode === 204 || statusCode === 304) {
        this.body_bytes = 0;
      }
      this.state = "HEADER";
    };
    HTTPParser.prototype.shouldKeepAlive = function() {
      if (this.info.versionMajor > 0 && this.info.versionMinor > 0) {
        if (this.connection.indexOf("close") !== -1) {
          return false;
        }
      } else if (this.connection.indexOf("keep-alive") === -1) {
        return false;
      }
      if (this.body_bytes !== null || this.isChunked) {
        return true;
      }
      return false;
    };
    HTTPParser.prototype.HEADER = function() {
      var line = this.consumeLine();
      if (line === void 0) {
        return;
      }
      var info = this.info;
      if (line) {
        this.parseHeader(line, info.headers);
      } else {
        var headers2 = info.headers;
        var hasContentLength = false;
        var currentContentLengthValue;
        var hasUpgradeHeader = false;
        for (var i = 0; i < headers2.length; i += 2) {
          switch (headers2[i].toLowerCase()) {
            case "transfer-encoding":
              this.isChunked = headers2[i + 1].toLowerCase() === "chunked";
              break;
            case "content-length":
              currentContentLengthValue = +headers2[i + 1];
              if (hasContentLength) {
                if (currentContentLengthValue !== this.body_bytes) {
                  throw parseErrorCode("HPE_UNEXPECTED_CONTENT_LENGTH");
                }
              } else {
                hasContentLength = true;
                this.body_bytes = currentContentLengthValue;
              }
              break;
            case "connection":
              this.connection += headers2[i + 1].toLowerCase();
              break;
            case "upgrade":
              hasUpgradeHeader = true;
              break;
          }
        }
        if (this.isChunked && hasContentLength) {
          hasContentLength = false;
          this.body_bytes = null;
        }
        if (hasUpgradeHeader && this.connection.indexOf("upgrade") != -1) {
          info.upgrade = this.type === HTTPParser.REQUEST || info.statusCode === 101;
        } else {
          info.upgrade = info.method === method_connect;
        }
        if (this.isChunked && info.upgrade) {
          this.isChunked = false;
        }
        info.shouldKeepAlive = this.shouldKeepAlive();
        var skipBody;
        if (compatMode0_12) {
          skipBody = this.userCall()(this[kOnHeadersComplete](info));
        } else {
          skipBody = this.userCall()(this[kOnHeadersComplete](info.versionMajor, info.versionMinor, info.headers, info.method, info.url, info.statusCode, info.statusMessage, info.upgrade, info.shouldKeepAlive));
        }
        if (skipBody === 2) {
          this.nextRequest();
          return true;
        } else if (this.isChunked && !skipBody) {
          this.state = "BODY_CHUNKHEAD";
        } else if (skipBody || this.body_bytes === 0) {
          this.nextRequest();
          return info.upgrade;
        } else if (this.body_bytes === null) {
          this.state = "BODY_RAW";
        } else {
          this.state = "BODY_SIZED";
        }
      }
    };
    HTTPParser.prototype.BODY_CHUNKHEAD = function() {
      var line = this.consumeLine();
      if (line === void 0) {
        return;
      }
      this.body_bytes = parseInt(line, 16);
      if (!this.body_bytes) {
        this.state = "BODY_CHUNKTRAILERS";
      } else {
        this.state = "BODY_CHUNK";
      }
    };
    HTTPParser.prototype.BODY_CHUNK = function() {
      var length = Math.min(this.end - this.offset, this.body_bytes);
      this.userCall()(this[kOnBody](this.chunk, this.offset, length));
      this.offset += length;
      this.body_bytes -= length;
      if (!this.body_bytes) {
        this.state = "BODY_CHUNKEMPTYLINE";
      }
    };
    HTTPParser.prototype.BODY_CHUNKEMPTYLINE = function() {
      var line = this.consumeLine();
      if (line === void 0) {
        return;
      }
      assert.equal(line, "");
      this.state = "BODY_CHUNKHEAD";
    };
    HTTPParser.prototype.BODY_CHUNKTRAILERS = function() {
      var line = this.consumeLine();
      if (line === void 0) {
        return;
      }
      if (line) {
        this.parseHeader(line, this.trailers);
      } else {
        if (this.trailers.length) {
          this.userCall()(this[kOnHeaders](this.trailers, ""));
        }
        this.nextRequest();
      }
    };
    HTTPParser.prototype.BODY_RAW = function() {
      var length = this.end - this.offset;
      this.userCall()(this[kOnBody](this.chunk, this.offset, length));
      this.offset = this.end;
    };
    HTTPParser.prototype.BODY_SIZED = function() {
      var length = Math.min(this.end - this.offset, this.body_bytes);
      this.userCall()(this[kOnBody](this.chunk, this.offset, length));
      this.offset += length;
      this.body_bytes -= length;
      if (!this.body_bytes) {
        this.nextRequest();
      }
    };
    ["Headers", "HeadersComplete", "Body", "MessageComplete"].forEach(function(name2) {
      var k = HTTPParser["kOn" + name2];
      Object.defineProperty(HTTPParser.prototype, "on" + name2, {
        get: function() {
          return this[k];
        },
        set: function(to) {
          this._compatMode0_11 = true;
          method_connect = "CONNECT";
          return this[k] = to;
        }
      });
    });
    NodeHTTPParser = httpParser.HTTPParser;
    Buffer$7 = safeBuffer.exports.Buffer;
    TYPES = {
      request: NodeHTTPParser.REQUEST || "request",
      response: NodeHTTPParser.RESPONSE || "response"
    };
    HttpParser$3 = function(type) {
      this._type = type;
      this._parser = new NodeHTTPParser(TYPES[type]);
      this._complete = false;
      this.headers = {};
      var current = null, self2 = this;
      this._parser.onHeaderField = function(b, start, length) {
        current = b.toString("utf8", start, start + length).toLowerCase();
      };
      this._parser.onHeaderValue = function(b, start, length) {
        var value = b.toString("utf8", start, start + length);
        if (self2.headers.hasOwnProperty(current))
          self2.headers[current] += ", " + value;
        else
          self2.headers[current] = value;
      };
      this._parser.onHeadersComplete = this._parser[NodeHTTPParser.kOnHeadersComplete] = function(majorVersion, minorVersion, headers2, method, pathname, statusCode) {
        var info = arguments[0];
        if (typeof info === "object") {
          method = info.method;
          pathname = info.url;
          statusCode = info.statusCode;
          headers2 = info.headers;
        }
        self2.method = typeof method === "number" ? HttpParser$3.METHODS[method] : method;
        self2.statusCode = statusCode;
        self2.url = pathname;
        if (!headers2)
          return;
        for (var i = 0, n = headers2.length, key, value; i < n; i += 2) {
          key = headers2[i].toLowerCase();
          value = headers2[i + 1];
          if (self2.headers.hasOwnProperty(key))
            self2.headers[key] += ", " + value;
          else
            self2.headers[key] = value;
        }
        self2._complete = true;
      };
    };
    HttpParser$3.METHODS = {
      0: "DELETE",
      1: "GET",
      2: "HEAD",
      3: "POST",
      4: "PUT",
      5: "CONNECT",
      6: "OPTIONS",
      7: "TRACE",
      8: "COPY",
      9: "LOCK",
      10: "MKCOL",
      11: "MOVE",
      12: "PROPFIND",
      13: "PROPPATCH",
      14: "SEARCH",
      15: "UNLOCK",
      16: "BIND",
      17: "REBIND",
      18: "UNBIND",
      19: "ACL",
      20: "REPORT",
      21: "MKACTIVITY",
      22: "CHECKOUT",
      23: "MERGE",
      24: "M-SEARCH",
      25: "NOTIFY",
      26: "SUBSCRIBE",
      27: "UNSUBSCRIBE",
      28: "PATCH",
      29: "PURGE",
      30: "MKCALENDAR",
      31: "LINK",
      32: "UNLINK"
    };
    VERSION = process.version ? process.version.match(/[0-9]+/g).map(function(n) {
      return parseInt(n, 10);
    }) : [];
    if (VERSION[0] === 0 && VERSION[1] === 12) {
      HttpParser$3.METHODS[16] = "REPORT";
      HttpParser$3.METHODS[17] = "MKACTIVITY";
      HttpParser$3.METHODS[18] = "CHECKOUT";
      HttpParser$3.METHODS[19] = "MERGE";
      HttpParser$3.METHODS[20] = "M-SEARCH";
      HttpParser$3.METHODS[21] = "NOTIFY";
      HttpParser$3.METHODS[22] = "SUBSCRIBE";
      HttpParser$3.METHODS[23] = "UNSUBSCRIBE";
      HttpParser$3.METHODS[24] = "PATCH";
      HttpParser$3.METHODS[25] = "PURGE";
    }
    HttpParser$3.prototype.isComplete = function() {
      return this._complete;
    };
    HttpParser$3.prototype.parse = function(chunk) {
      var consumed = this._parser.execute(chunk, 0, chunk.length);
      if (typeof consumed !== "number") {
        this.error = consumed;
        this._complete = true;
        return;
      }
      if (this._complete)
        this.body = consumed < chunk.length ? chunk.slice(consumed) : Buffer$7.alloc(0);
    };
    http_parser = HttpParser$3;
    TOKEN = /([!#\$%&'\*\+\-\.\^_`\|~0-9A-Za-z]+)/;
    NOTOKEN = /([^!#\$%&'\*\+\-\.\^_`\|~0-9A-Za-z])/g;
    QUOTED = /"((?:\\[\x00-\x7f]|[^\x00-\x08\x0a-\x1f\x7f"\\])*)"/;
    PARAM = new RegExp(TOKEN.source + "(?:=(?:" + TOKEN.source + "|" + QUOTED.source + "))?");
    EXT = new RegExp(TOKEN.source + "(?: *; *" + PARAM.source + ")*", "g");
    EXT_LIST = new RegExp("^" + EXT.source + "(?: *, *" + EXT.source + ")*$");
    NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;
    hasOwnProperty = Object.prototype.hasOwnProperty;
    Parser$1 = {
      parseHeader: function(header) {
        var offers = new Offers();
        if (header === "" || header === void 0)
          return offers;
        if (!EXT_LIST.test(header))
          throw new SyntaxError("Invalid Sec-WebSocket-Extensions header: " + header);
        var values = header.match(EXT);
        values.forEach(function(value) {
          var params = value.match(new RegExp(PARAM.source, "g")), name2 = params.shift(), offer = {};
          params.forEach(function(param) {
            var args = param.match(PARAM), key = args[1], data;
            if (args[2] !== void 0) {
              data = args[2];
            } else if (args[3] !== void 0) {
              data = args[3].replace(/\\/g, "");
            } else {
              data = true;
            }
            if (NUMBER.test(data))
              data = parseFloat(data);
            if (hasOwnProperty.call(offer, key)) {
              offer[key] = [].concat(offer[key]);
              offer[key].push(data);
            } else {
              offer[key] = data;
            }
          }, this);
          offers.push(name2, offer);
        }, this);
        return offers;
      },
      serializeParams: function(name2, params) {
        var values = [];
        var print = function(key2, value) {
          if (value instanceof Array) {
            value.forEach(function(v) {
              print(key2, v);
            });
          } else if (value === true) {
            values.push(key2);
          } else if (typeof value === "number") {
            values.push(key2 + "=" + value);
          } else if (NOTOKEN.test(value)) {
            values.push(key2 + '="' + value.replace(/"/g, '\\"') + '"');
          } else {
            values.push(key2 + "=" + value);
          }
        };
        for (var key in params)
          print(key, params[key]);
        return [name2].concat(values).join("; ");
      }
    };
    Offers = function() {
      this._byName = {};
      this._inOrder = [];
    };
    Offers.prototype.push = function(name2, params) {
      if (!hasOwnProperty.call(this._byName, name2))
        this._byName[name2] = [];
      this._byName[name2].push(params);
      this._inOrder.push({ name: name2, params });
    };
    Offers.prototype.eachOffer = function(callback, context) {
      var list = this._inOrder;
      for (var i = 0, n = list.length; i < n; i++)
        callback.call(context, list[i].name, list[i].params);
    };
    Offers.prototype.byName = function(name2) {
      return this._byName[name2] || [];
    };
    Offers.prototype.toArray = function() {
      return this._inOrder.slice();
    };
    parser = Parser$1;
    RingBuffer$2 = function(bufferSize) {
      this._bufferSize = bufferSize;
      this.clear();
    };
    RingBuffer$2.prototype.clear = function() {
      this._buffer = new Array(this._bufferSize);
      this._ringOffset = 0;
      this._ringSize = this._bufferSize;
      this._head = 0;
      this._tail = 0;
      this.length = 0;
    };
    RingBuffer$2.prototype.push = function(value) {
      var expandBuffer = false, expandRing = false;
      if (this._ringSize < this._bufferSize) {
        expandBuffer = this._tail === 0;
      } else if (this._ringOffset === this._ringSize) {
        expandBuffer = true;
        expandRing = this._tail === 0;
      }
      if (expandBuffer) {
        this._tail = this._bufferSize;
        this._buffer = this._buffer.concat(new Array(this._bufferSize));
        this._bufferSize = this._buffer.length;
        if (expandRing)
          this._ringSize = this._bufferSize;
      }
      this._buffer[this._tail] = value;
      this.length += 1;
      if (this._tail < this._ringSize)
        this._ringOffset += 1;
      this._tail = (this._tail + 1) % this._bufferSize;
    };
    RingBuffer$2.prototype.peek = function() {
      if (this.length === 0)
        return void 0;
      return this._buffer[this._head];
    };
    RingBuffer$2.prototype.shift = function() {
      if (this.length === 0)
        return void 0;
      var value = this._buffer[this._head];
      this._buffer[this._head] = void 0;
      this.length -= 1;
      this._ringOffset -= 1;
      if (this._ringOffset === 0 && this.length > 0) {
        this._head = this._ringSize;
        this._ringOffset = this.length;
        this._ringSize = this._bufferSize;
      } else {
        this._head = (this._head + 1) % this._ringSize;
      }
      return value;
    };
    ring_buffer = RingBuffer$2;
    RingBuffer$1 = ring_buffer;
    Functor$1 = function(session, method) {
      this._session = session;
      this._method = method;
      this._queue = new RingBuffer$1(Functor$1.QUEUE_SIZE);
      this._stopped = false;
      this.pending = 0;
    };
    Functor$1.QUEUE_SIZE = 8;
    Functor$1.prototype.call = function(error22, message2, callback, context) {
      if (this._stopped)
        return;
      var record = { error: error22, message: message2, callback, context, done: false }, called = false, self2 = this;
      this._queue.push(record);
      if (record.error) {
        record.done = true;
        this._stop();
        return this._flushQueue();
      }
      var handler = function(err, msg) {
        if (!(called ^ (called = true)))
          return;
        if (err) {
          self2._stop();
          record.error = err;
          record.message = null;
        } else {
          record.message = msg;
        }
        record.done = true;
        self2._flushQueue();
      };
      try {
        this._session[this._method](message2, handler);
      } catch (err) {
        handler(err);
      }
    };
    Functor$1.prototype._stop = function() {
      this.pending = this._queue.length;
      this._stopped = true;
    };
    Functor$1.prototype._flushQueue = function() {
      var queue = this._queue, record;
      while (queue.length > 0 && queue.peek().done) {
        record = queue.shift();
        if (record.error) {
          this.pending = 0;
          queue.clear();
        } else {
          this.pending -= 1;
        }
        record.callback.call(record.context, record.error, record.message);
      }
    };
    functor = Functor$1;
    RingBuffer = ring_buffer;
    Pledge$2 = function() {
      this._complete = false;
      this._callbacks = new RingBuffer(Pledge$2.QUEUE_SIZE);
    };
    Pledge$2.QUEUE_SIZE = 4;
    Pledge$2.all = function(list) {
      var pledge2 = new Pledge$2(), pending = list.length, n = pending;
      if (pending === 0)
        pledge2.done();
      while (n--)
        list[n].then(function() {
          pending -= 1;
          if (pending === 0)
            pledge2.done();
        });
      return pledge2;
    };
    Pledge$2.prototype.then = function(callback) {
      if (this._complete)
        callback();
      else
        this._callbacks.push(callback);
    };
    Pledge$2.prototype.done = function() {
      this._complete = true;
      var callbacks = this._callbacks, callback;
      while (callback = callbacks.shift())
        callback();
    };
    pledge = Pledge$2;
    Functor = functor;
    Pledge$1 = pledge;
    Cell$1 = function(tuple) {
      this._ext = tuple[0];
      this._session = tuple[1];
      this._functors = {
        incoming: new Functor(this._session, "processIncomingMessage"),
        outgoing: new Functor(this._session, "processOutgoingMessage")
      };
    };
    Cell$1.prototype.pending = function(direction) {
      var functor2 = this._functors[direction];
      if (!functor2._stopped)
        functor2.pending += 1;
    };
    Cell$1.prototype.incoming = function(error22, message2, callback, context) {
      this._exec("incoming", error22, message2, callback, context);
    };
    Cell$1.prototype.outgoing = function(error22, message2, callback, context) {
      this._exec("outgoing", error22, message2, callback, context);
    };
    Cell$1.prototype.close = function() {
      this._closed = this._closed || new Pledge$1();
      this._doClose();
      return this._closed;
    };
    Cell$1.prototype._exec = function(direction, error22, message2, callback, context) {
      this._functors[direction].call(error22, message2, function(err, msg) {
        if (err)
          err.message = this._ext.name + ": " + err.message;
        callback.call(context, err, msg);
        this._doClose();
      }, this);
    };
    Cell$1.prototype._doClose = function() {
      var fin = this._functors.incoming, fout = this._functors.outgoing;
      if (!this._closed || fin.pending + fout.pending !== 0)
        return;
      if (this._session)
        this._session.close();
      this._session = null;
      this._closed.done();
    };
    cell = Cell$1;
    Cell = cell;
    Pledge = pledge;
    Pipeline$1 = function(sessions) {
      this._cells = sessions.map(function(session) {
        return new Cell(session);
      });
      this._stopped = { incoming: false, outgoing: false };
    };
    Pipeline$1.prototype.processIncomingMessage = function(message2, callback, context) {
      if (this._stopped.incoming)
        return;
      this._loop("incoming", this._cells.length - 1, -1, -1, message2, callback, context);
    };
    Pipeline$1.prototype.processOutgoingMessage = function(message2, callback, context) {
      if (this._stopped.outgoing)
        return;
      this._loop("outgoing", 0, this._cells.length, 1, message2, callback, context);
    };
    Pipeline$1.prototype.close = function(callback, context) {
      this._stopped = { incoming: true, outgoing: true };
      var closed = this._cells.map(function(a) {
        return a.close();
      });
      if (callback)
        Pledge.all(closed).then(function() {
          callback.call(context);
        });
    };
    Pipeline$1.prototype._loop = function(direction, start, end, step, message2, callback, context) {
      var cells = this._cells, n = cells.length, self2 = this;
      while (n--)
        cells[n].pending(direction);
      var pipe = function(index, error22, msg) {
        if (index === end)
          return callback.call(context, error22, msg);
        cells[index][direction](error22, msg, function(err, m) {
          if (err)
            self2._stopped[direction] = true;
          pipe(index + step, err, m);
        });
      };
      pipe(start, null, message2);
    };
    pipeline2 = Pipeline$1;
    Parser = parser;
    Pipeline = pipeline2;
    Extensions$1 = function() {
      this._rsv1 = this._rsv2 = this._rsv3 = null;
      this._byName = {};
      this._inOrder = [];
      this._sessions = [];
      this._index = {};
    };
    Extensions$1.MESSAGE_OPCODES = [1, 2];
    instance$a = {
      add: function(ext) {
        if (typeof ext.name !== "string")
          throw new TypeError("extension.name must be a string");
        if (ext.type !== "permessage")
          throw new TypeError('extension.type must be "permessage"');
        if (typeof ext.rsv1 !== "boolean")
          throw new TypeError("extension.rsv1 must be true or false");
        if (typeof ext.rsv2 !== "boolean")
          throw new TypeError("extension.rsv2 must be true or false");
        if (typeof ext.rsv3 !== "boolean")
          throw new TypeError("extension.rsv3 must be true or false");
        if (this._byName.hasOwnProperty(ext.name))
          throw new TypeError('An extension with name "' + ext.name + '" is already registered');
        this._byName[ext.name] = ext;
        this._inOrder.push(ext);
      },
      generateOffer: function() {
        var sessions = [], offer = [], index = {};
        this._inOrder.forEach(function(ext) {
          var session = ext.createClientSession();
          if (!session)
            return;
          var record = [ext, session];
          sessions.push(record);
          index[ext.name] = record;
          var offers = session.generateOffer();
          offers = offers ? [].concat(offers) : [];
          offers.forEach(function(off) {
            offer.push(Parser.serializeParams(ext.name, off));
          }, this);
        }, this);
        this._sessions = sessions;
        this._index = index;
        return offer.length > 0 ? offer.join(", ") : null;
      },
      activate: function(header) {
        var responses = Parser.parseHeader(header), sessions = [];
        responses.eachOffer(function(name2, params) {
          var record = this._index[name2];
          if (!record)
            throw new Error('Server sent an extension response for unknown extension "' + name2 + '"');
          var ext = record[0], session = record[1], reserved2 = this._reserved(ext);
          if (reserved2)
            throw new Error("Server sent two extension responses that use the RSV" + reserved2[0] + ' bit: "' + reserved2[1] + '" and "' + ext.name + '"');
          if (session.activate(params) !== true)
            throw new Error("Server sent unacceptable extension parameters: " + Parser.serializeParams(name2, params));
          this._reserve(ext);
          sessions.push(record);
        }, this);
        this._sessions = sessions;
        this._pipeline = new Pipeline(sessions);
      },
      generateResponse: function(header) {
        var sessions = [], response = [], offers = Parser.parseHeader(header);
        this._inOrder.forEach(function(ext) {
          var offer = offers.byName(ext.name);
          if (offer.length === 0 || this._reserved(ext))
            return;
          var session = ext.createServerSession(offer);
          if (!session)
            return;
          this._reserve(ext);
          sessions.push([ext, session]);
          response.push(Parser.serializeParams(ext.name, session.generateResponse()));
        }, this);
        this._sessions = sessions;
        this._pipeline = new Pipeline(sessions);
        return response.length > 0 ? response.join(", ") : null;
      },
      validFrameRsv: function(frame2) {
        var allowed = { rsv1: false, rsv2: false, rsv3: false }, ext;
        if (Extensions$1.MESSAGE_OPCODES.indexOf(frame2.opcode) >= 0) {
          for (var i = 0, n = this._sessions.length; i < n; i++) {
            ext = this._sessions[i][0];
            allowed.rsv1 = allowed.rsv1 || ext.rsv1;
            allowed.rsv2 = allowed.rsv2 || ext.rsv2;
            allowed.rsv3 = allowed.rsv3 || ext.rsv3;
          }
        }
        return (allowed.rsv1 || !frame2.rsv1) && (allowed.rsv2 || !frame2.rsv2) && (allowed.rsv3 || !frame2.rsv3);
      },
      processIncomingMessage: function(message2, callback, context) {
        this._pipeline.processIncomingMessage(message2, callback, context);
      },
      processOutgoingMessage: function(message2, callback, context) {
        this._pipeline.processOutgoingMessage(message2, callback, context);
      },
      close: function(callback, context) {
        if (!this._pipeline)
          return callback.call(context);
        this._pipeline.close(callback, context);
      },
      _reserve: function(ext) {
        this._rsv1 = this._rsv1 || ext.rsv1 && ext.name;
        this._rsv2 = this._rsv2 || ext.rsv2 && ext.name;
        this._rsv3 = this._rsv3 || ext.rsv3 && ext.name;
      },
      _reserved: function(ext) {
        if (this._rsv1 && ext.rsv1)
          return [1, this._rsv1];
        if (this._rsv2 && ext.rsv2)
          return [2, this._rsv2];
        if (this._rsv3 && ext.rsv3)
          return [3, this._rsv3];
        return false;
      }
    };
    for (key$a in instance$a)
      Extensions$1.prototype[key$a] = instance$a[key$a];
    websocket_extensions = Extensions$1;
    Frame$1 = function() {
    };
    instance$9 = {
      final: false,
      rsv1: false,
      rsv2: false,
      rsv3: false,
      opcode: null,
      masked: false,
      maskingKey: null,
      lengthBytes: 1,
      length: 0,
      payload: null
    };
    for (key$9 in instance$9)
      Frame$1.prototype[key$9] = instance$9[key$9];
    frame = Frame$1;
    Buffer$6 = safeBuffer.exports.Buffer;
    Message$1 = function() {
      this.rsv1 = false;
      this.rsv2 = false;
      this.rsv3 = false;
      this.opcode = null;
      this.length = 0;
      this._chunks = [];
    };
    instance$8 = {
      read: function() {
        return this.data = this.data || Buffer$6.concat(this._chunks, this.length);
      },
      pushFrame: function(frame2) {
        this.rsv1 = this.rsv1 || frame2.rsv1;
        this.rsv2 = this.rsv2 || frame2.rsv2;
        this.rsv3 = this.rsv3 || frame2.rsv3;
        if (this.opcode === null)
          this.opcode = frame2.opcode;
        this._chunks.push(frame2.payload);
        this.length += frame2.length;
      }
    };
    for (key$8 in instance$8)
      Message$1.prototype[key$8] = instance$8[key$8];
    message = Message$1;
    Buffer$5 = safeBuffer.exports.Buffer;
    crypto$2 = import_crypto2.default;
    util$9 = import_util2.default;
    Extensions = websocket_extensions;
    Base$6 = base;
    Frame = frame;
    Message = message;
    Hybi$2 = function(request, url2, options2) {
      Base$6.apply(this, arguments);
      this._extensions = new Extensions();
      this._stage = 0;
      this._masking = this._options.masking;
      this._protocols = this._options.protocols || [];
      this._requireMasking = this._options.requireMasking;
      this._pingCallbacks = {};
      if (typeof this._protocols === "string")
        this._protocols = this._protocols.split(/ *, */);
      if (!this._request)
        return;
      var protos = this._request.headers["sec-websocket-protocol"], supported = this._protocols;
      if (protos !== void 0) {
        if (typeof protos === "string")
          protos = protos.split(/ *, */);
        this.protocol = protos.filter(function(p) {
          return supported.indexOf(p) >= 0;
        })[0];
      }
      this.version = "hybi-" + Hybi$2.VERSION;
    };
    util$9.inherits(Hybi$2, Base$6);
    Hybi$2.VERSION = "13";
    Hybi$2.mask = function(payload, mask, offset) {
      if (!mask || mask.length === 0)
        return payload;
      offset = offset || 0;
      for (var i = 0, n = payload.length - offset; i < n; i++) {
        payload[offset + i] = payload[offset + i] ^ mask[i % 4];
      }
      return payload;
    };
    Hybi$2.generateAccept = function(key) {
      var sha12 = crypto$2.createHash("sha1");
      sha12.update(key + Hybi$2.GUID);
      return sha12.digest("base64");
    };
    Hybi$2.GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    instance$7 = {
      FIN: 128,
      MASK: 128,
      RSV1: 64,
      RSV2: 32,
      RSV3: 16,
      OPCODE: 15,
      LENGTH: 127,
      OPCODES: {
        continuation: 0,
        text: 1,
        binary: 2,
        close: 8,
        ping: 9,
        pong: 10
      },
      OPCODE_CODES: [0, 1, 2, 8, 9, 10],
      MESSAGE_OPCODES: [0, 1, 2],
      OPENING_OPCODES: [1, 2],
      ERRORS: {
        normal_closure: 1e3,
        going_away: 1001,
        protocol_error: 1002,
        unacceptable: 1003,
        encoding_error: 1007,
        policy_violation: 1008,
        too_large: 1009,
        extension_error: 1010,
        unexpected_condition: 1011
      },
      ERROR_CODES: [1e3, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011],
      DEFAULT_ERROR_CODE: 1e3,
      MIN_RESERVED_ERROR: 3e3,
      MAX_RESERVED_ERROR: 4999,
      UTF8_MATCH: /^([\x00-\x7F]|[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2})*$/,
      addExtension: function(extension) {
        this._extensions.add(extension);
        return true;
      },
      parse: function(chunk) {
        this._reader.put(chunk);
        var buffer = true;
        while (buffer) {
          switch (this._stage) {
            case 0:
              buffer = this._reader.read(1);
              if (buffer)
                this._parseOpcode(buffer[0]);
              break;
            case 1:
              buffer = this._reader.read(1);
              if (buffer)
                this._parseLength(buffer[0]);
              break;
            case 2:
              buffer = this._reader.read(this._frame.lengthBytes);
              if (buffer)
                this._parseExtendedLength(buffer);
              break;
            case 3:
              buffer = this._reader.read(4);
              if (buffer) {
                this._stage = 4;
                this._frame.maskingKey = buffer;
              }
              break;
            case 4:
              buffer = this._reader.read(this._frame.length);
              if (buffer) {
                this._stage = 0;
                this._emitFrame(buffer);
              }
              break;
            default:
              buffer = null;
          }
        }
      },
      text: function(message2) {
        if (this.readyState > 1)
          return false;
        return this.frame(message2, "text");
      },
      binary: function(message2) {
        if (this.readyState > 1)
          return false;
        return this.frame(message2, "binary");
      },
      ping: function(message2, callback) {
        if (this.readyState > 1)
          return false;
        message2 = message2 || "";
        if (callback)
          this._pingCallbacks[message2] = callback;
        return this.frame(message2, "ping");
      },
      pong: function(message2) {
        if (this.readyState > 1)
          return false;
        message2 = message2 || "";
        return this.frame(message2, "pong");
      },
      close: function(reason, code) {
        reason = reason || "";
        code = code || this.ERRORS.normal_closure;
        if (this.readyState <= 0) {
          this.readyState = 3;
          this.emit("close", new Base$6.CloseEvent(code, reason));
          return true;
        } else if (this.readyState === 1) {
          this.readyState = 2;
          this._extensions.close(function() {
            this.frame(reason, "close", code);
          }, this);
          return true;
        } else {
          return false;
        }
      },
      frame: function(buffer, type, code) {
        if (this.readyState <= 0)
          return this._queue([buffer, type, code]);
        if (this.readyState > 2)
          return false;
        if (buffer instanceof Array)
          buffer = Buffer$5.from(buffer);
        if (typeof buffer === "number")
          buffer = buffer.toString();
        var message2 = new Message(), isText = typeof buffer === "string", payload, copy;
        message2.rsv1 = message2.rsv2 = message2.rsv3 = false;
        message2.opcode = this.OPCODES[type || (isText ? "text" : "binary")];
        payload = isText ? Buffer$5.from(buffer, "utf8") : buffer;
        if (code) {
          copy = payload;
          payload = Buffer$5.allocUnsafe(2 + copy.length);
          payload.writeUInt16BE(code, 0);
          copy.copy(payload, 2);
        }
        message2.data = payload;
        var onMessageReady = function(message3) {
          var frame2 = new Frame();
          frame2.final = true;
          frame2.rsv1 = message3.rsv1;
          frame2.rsv2 = message3.rsv2;
          frame2.rsv3 = message3.rsv3;
          frame2.opcode = message3.opcode;
          frame2.masked = !!this._masking;
          frame2.length = message3.data.length;
          frame2.payload = message3.data;
          if (frame2.masked)
            frame2.maskingKey = crypto$2.randomBytes(4);
          this._sendFrame(frame2);
        };
        if (this.MESSAGE_OPCODES.indexOf(message2.opcode) >= 0)
          this._extensions.processOutgoingMessage(message2, function(error22, message3) {
            if (error22)
              return this._fail("extension_error", error22.message);
            onMessageReady.call(this, message3);
          }, this);
        else
          onMessageReady.call(this, message2);
        return true;
      },
      _sendFrame: function(frame2) {
        var length = frame2.length, header = length <= 125 ? 2 : length <= 65535 ? 4 : 10, offset = header + (frame2.masked ? 4 : 0), buffer = Buffer$5.allocUnsafe(offset + length), masked = frame2.masked ? this.MASK : 0;
        buffer[0] = (frame2.final ? this.FIN : 0) | (frame2.rsv1 ? this.RSV1 : 0) | (frame2.rsv2 ? this.RSV2 : 0) | (frame2.rsv3 ? this.RSV3 : 0) | frame2.opcode;
        if (length <= 125) {
          buffer[1] = masked | length;
        } else if (length <= 65535) {
          buffer[1] = masked | 126;
          buffer.writeUInt16BE(length, 2);
        } else {
          buffer[1] = masked | 127;
          buffer.writeUInt32BE(Math.floor(length / 4294967296), 2);
          buffer.writeUInt32BE(length % 4294967296, 6);
        }
        frame2.payload.copy(buffer, offset);
        if (frame2.masked) {
          frame2.maskingKey.copy(buffer, header);
          Hybi$2.mask(buffer, frame2.maskingKey, offset);
        }
        this._write(buffer);
      },
      _handshakeResponse: function() {
        var secKey = this._request.headers["sec-websocket-key"], version2 = this._request.headers["sec-websocket-version"];
        if (version2 !== Hybi$2.VERSION)
          throw new Error("Unsupported WebSocket version: " + version2);
        if (typeof secKey !== "string")
          throw new Error("Missing handshake request header: Sec-WebSocket-Key");
        this._headers.set("Upgrade", "websocket");
        this._headers.set("Connection", "Upgrade");
        this._headers.set("Sec-WebSocket-Accept", Hybi$2.generateAccept(secKey));
        if (this.protocol)
          this._headers.set("Sec-WebSocket-Protocol", this.protocol);
        var extensions = this._extensions.generateResponse(this._request.headers["sec-websocket-extensions"]);
        if (extensions)
          this._headers.set("Sec-WebSocket-Extensions", extensions);
        var start = "HTTP/1.1 101 Switching Protocols", headers2 = [start, this._headers.toString(), ""];
        return Buffer$5.from(headers2.join("\r\n"), "utf8");
      },
      _shutdown: function(code, reason, error22) {
        delete this._frame;
        delete this._message;
        this._stage = 5;
        var sendCloseFrame = this.readyState === 1;
        this.readyState = 2;
        this._extensions.close(function() {
          if (sendCloseFrame)
            this.frame(reason, "close", code);
          this.readyState = 3;
          if (error22)
            this.emit("error", new Error(reason));
          this.emit("close", new Base$6.CloseEvent(code, reason));
        }, this);
      },
      _fail: function(type, message2) {
        if (this.readyState > 1)
          return;
        this._shutdown(this.ERRORS[type], message2, true);
      },
      _parseOpcode: function(octet) {
        var rsvs = [this.RSV1, this.RSV2, this.RSV3].map(function(rsv) {
          return (octet & rsv) === rsv;
        });
        var frame2 = this._frame = new Frame();
        frame2.final = (octet & this.FIN) === this.FIN;
        frame2.rsv1 = rsvs[0];
        frame2.rsv2 = rsvs[1];
        frame2.rsv3 = rsvs[2];
        frame2.opcode = octet & this.OPCODE;
        this._stage = 1;
        if (!this._extensions.validFrameRsv(frame2))
          return this._fail("protocol_error", "One or more reserved bits are on: reserved1 = " + (frame2.rsv1 ? 1 : 0) + ", reserved2 = " + (frame2.rsv2 ? 1 : 0) + ", reserved3 = " + (frame2.rsv3 ? 1 : 0));
        if (this.OPCODE_CODES.indexOf(frame2.opcode) < 0)
          return this._fail("protocol_error", "Unrecognized frame opcode: " + frame2.opcode);
        if (this.MESSAGE_OPCODES.indexOf(frame2.opcode) < 0 && !frame2.final)
          return this._fail("protocol_error", "Received fragmented control frame: opcode = " + frame2.opcode);
        if (this._message && this.OPENING_OPCODES.indexOf(frame2.opcode) >= 0)
          return this._fail("protocol_error", "Received new data frame but previous continuous frame is unfinished");
      },
      _parseLength: function(octet) {
        var frame2 = this._frame;
        frame2.masked = (octet & this.MASK) === this.MASK;
        frame2.length = octet & this.LENGTH;
        if (frame2.length >= 0 && frame2.length <= 125) {
          this._stage = frame2.masked ? 3 : 4;
          if (!this._checkFrameLength())
            return;
        } else {
          this._stage = 2;
          frame2.lengthBytes = frame2.length === 126 ? 2 : 8;
        }
        if (this._requireMasking && !frame2.masked)
          return this._fail("unacceptable", "Received unmasked frame but masking is required");
      },
      _parseExtendedLength: function(buffer) {
        var frame2 = this._frame;
        frame2.length = this._readUInt(buffer);
        this._stage = frame2.masked ? 3 : 4;
        if (this.MESSAGE_OPCODES.indexOf(frame2.opcode) < 0 && frame2.length > 125)
          return this._fail("protocol_error", "Received control frame having too long payload: " + frame2.length);
        if (!this._checkFrameLength())
          return;
      },
      _checkFrameLength: function() {
        var length = this._message ? this._message.length : 0;
        if (length + this._frame.length > this._maxLength) {
          this._fail("too_large", "WebSocket frame length too large");
          return false;
        } else {
          return true;
        }
      },
      _emitFrame: function(buffer) {
        var frame2 = this._frame, payload = frame2.payload = Hybi$2.mask(buffer, frame2.maskingKey), opcode = frame2.opcode, message2, code, reason, callbacks, callback;
        delete this._frame;
        if (opcode === this.OPCODES.continuation) {
          if (!this._message)
            return this._fail("protocol_error", "Received unexpected continuation frame");
          this._message.pushFrame(frame2);
        }
        if (opcode === this.OPCODES.text || opcode === this.OPCODES.binary) {
          this._message = new Message();
          this._message.pushFrame(frame2);
        }
        if (frame2.final && this.MESSAGE_OPCODES.indexOf(opcode) >= 0)
          return this._emitMessage(this._message);
        if (opcode === this.OPCODES.close) {
          code = payload.length >= 2 ? payload.readUInt16BE(0) : null;
          reason = payload.length > 2 ? this._encode(payload.slice(2)) : null;
          if (!(payload.length === 0) && !(code !== null && code >= this.MIN_RESERVED_ERROR && code <= this.MAX_RESERVED_ERROR) && this.ERROR_CODES.indexOf(code) < 0)
            code = this.ERRORS.protocol_error;
          if (payload.length > 125 || payload.length > 2 && !reason)
            code = this.ERRORS.protocol_error;
          this._shutdown(code || this.DEFAULT_ERROR_CODE, reason || "");
        }
        if (opcode === this.OPCODES.ping) {
          this.frame(payload, "pong");
          this.emit("ping", new Base$6.PingEvent(payload.toString()));
        }
        if (opcode === this.OPCODES.pong) {
          callbacks = this._pingCallbacks;
          message2 = this._encode(payload);
          callback = callbacks[message2];
          delete callbacks[message2];
          if (callback)
            callback();
          this.emit("pong", new Base$6.PongEvent(payload.toString()));
        }
      },
      _emitMessage: function(message2) {
        var message2 = this._message;
        message2.read();
        delete this._message;
        this._extensions.processIncomingMessage(message2, function(error22, message3) {
          if (error22)
            return this._fail("extension_error", error22.message);
          var payload = message3.data;
          if (message3.opcode === this.OPCODES.text)
            payload = this._encode(payload);
          if (payload === null)
            return this._fail("encoding_error", "Could not decode a text frame as UTF-8");
          else
            this.emit("message", new Base$6.MessageEvent(payload));
        }, this);
      },
      _encode: function(buffer) {
        try {
          var string = buffer.toString("binary", 0, buffer.length);
          if (!this.UTF8_MATCH.test(string))
            return null;
        } catch (e) {
        }
        return buffer.toString("utf8", 0, buffer.length);
      },
      _readUInt: function(buffer) {
        if (buffer.length === 2)
          return buffer.readUInt16BE(0);
        return buffer.readUInt32BE(0) * 4294967296 + buffer.readUInt32BE(4);
      }
    };
    for (key$7 in instance$7)
      Hybi$2.prototype[key$7] = instance$7[key$7];
    hybi = Hybi$2;
    Buffer$4 = safeBuffer.exports.Buffer;
    Stream$2 = import_stream2.default.Stream;
    url$2 = import_url2.default;
    util$8 = import_util2.default;
    Base$5 = base;
    Headers$1 = headers;
    HttpParser$2 = http_parser;
    PORTS = { "ws:": 80, "wss:": 443 };
    Proxy$1 = function(client2, origin, options2) {
      this._client = client2;
      this._http = new HttpParser$2("response");
      this._origin = typeof client2.url === "object" ? client2.url : url$2.parse(client2.url);
      this._url = typeof origin === "object" ? origin : url$2.parse(origin);
      this._options = options2 || {};
      this._state = 0;
      this.readable = this.writable = true;
      this._paused = false;
      this._headers = new Headers$1();
      this._headers.set("Host", this._origin.host);
      this._headers.set("Connection", "keep-alive");
      this._headers.set("Proxy-Connection", "keep-alive");
      var auth = this._url.auth && Buffer$4.from(this._url.auth, "utf8").toString("base64");
      if (auth)
        this._headers.set("Proxy-Authorization", "Basic " + auth);
    };
    util$8.inherits(Proxy$1, Stream$2);
    instance$6 = {
      setHeader: function(name2, value) {
        if (this._state !== 0)
          return false;
        this._headers.set(name2, value);
        return true;
      },
      start: function() {
        if (this._state !== 0)
          return false;
        this._state = 1;
        var origin = this._origin, port = origin.port || PORTS[origin.protocol], start = "CONNECT " + origin.hostname + ":" + port + " HTTP/1.1";
        var headers2 = [start, this._headers.toString(), ""];
        this.emit("data", Buffer$4.from(headers2.join("\r\n"), "utf8"));
        return true;
      },
      pause: function() {
        this._paused = true;
      },
      resume: function() {
        this._paused = false;
        this.emit("drain");
      },
      write: function(chunk) {
        if (!this.writable)
          return false;
        this._http.parse(chunk);
        if (!this._http.isComplete())
          return !this._paused;
        this.statusCode = this._http.statusCode;
        this.headers = this._http.headers;
        if (this.statusCode === 200) {
          this.emit("connect", new Base$5.ConnectEvent());
        } else {
          var message2 = "Can't establish a connection to the server at " + this._origin.href;
          this.emit("error", new Error(message2));
        }
        this.end();
        return !this._paused;
      },
      end: function(chunk) {
        if (!this.writable)
          return;
        if (chunk !== void 0)
          this.write(chunk);
        this.readable = this.writable = false;
        this.emit("close");
        this.emit("end");
      },
      destroy: function() {
        this.end();
      }
    };
    for (key$6 in instance$6)
      Proxy$1.prototype[key$6] = instance$6[key$6];
    proxy = Proxy$1;
    Buffer$3 = safeBuffer.exports.Buffer;
    crypto$1 = import_crypto2.default;
    url$1 = import_url2.default;
    util$7 = import_util2.default;
    HttpParser$1 = http_parser;
    Base$4 = base;
    Hybi$1 = hybi;
    Proxy2 = proxy;
    Client$2 = function(_url, options2) {
      this.version = "hybi-" + Hybi$1.VERSION;
      Hybi$1.call(this, null, _url, options2);
      this.readyState = -1;
      this._key = Client$2.generateKey();
      this._accept = Hybi$1.generateAccept(this._key);
      this._http = new HttpParser$1("response");
      var uri = url$1.parse(this.url), auth = uri.auth && Buffer$3.from(uri.auth, "utf8").toString("base64");
      if (this.VALID_PROTOCOLS.indexOf(uri.protocol) < 0)
        throw new Error(this.url + " is not a valid WebSocket URL");
      this._pathname = (uri.pathname || "/") + (uri.search || "");
      this._headers.set("Host", uri.host);
      this._headers.set("Upgrade", "websocket");
      this._headers.set("Connection", "Upgrade");
      this._headers.set("Sec-WebSocket-Key", this._key);
      this._headers.set("Sec-WebSocket-Version", Hybi$1.VERSION);
      if (this._protocols.length > 0)
        this._headers.set("Sec-WebSocket-Protocol", this._protocols.join(", "));
      if (auth)
        this._headers.set("Authorization", "Basic " + auth);
    };
    util$7.inherits(Client$2, Hybi$1);
    Client$2.generateKey = function() {
      return crypto$1.randomBytes(16).toString("base64");
    };
    instance$5 = {
      VALID_PROTOCOLS: ["ws:", "wss:"],
      proxy: function(origin, options2) {
        return new Proxy2(this, origin, options2);
      },
      start: function() {
        if (this.readyState !== -1)
          return false;
        this._write(this._handshakeRequest());
        this.readyState = 0;
        return true;
      },
      parse: function(chunk) {
        if (this.readyState === 3)
          return;
        if (this.readyState > 0)
          return Hybi$1.prototype.parse.call(this, chunk);
        this._http.parse(chunk);
        if (!this._http.isComplete())
          return;
        this._validateHandshake();
        if (this.readyState === 3)
          return;
        this._open();
        this.parse(this._http.body);
      },
      _handshakeRequest: function() {
        var extensions = this._extensions.generateOffer();
        if (extensions)
          this._headers.set("Sec-WebSocket-Extensions", extensions);
        var start = "GET " + this._pathname + " HTTP/1.1", headers2 = [start, this._headers.toString(), ""];
        return Buffer$3.from(headers2.join("\r\n"), "utf8");
      },
      _failHandshake: function(message2) {
        message2 = "Error during WebSocket handshake: " + message2;
        this.readyState = 3;
        this.emit("error", new Error(message2));
        this.emit("close", new Base$4.CloseEvent(this.ERRORS.protocol_error, message2));
      },
      _validateHandshake: function() {
        this.statusCode = this._http.statusCode;
        this.headers = this._http.headers;
        if (this._http.error)
          return this._failHandshake(this._http.error.message);
        if (this._http.statusCode !== 101)
          return this._failHandshake("Unexpected response code: " + this._http.statusCode);
        var headers2 = this._http.headers, upgrade = headers2["upgrade"] || "", connection = headers2["connection"] || "", accept = headers2["sec-websocket-accept"] || "", protocol = headers2["sec-websocket-protocol"] || "";
        if (upgrade === "")
          return this._failHandshake("'Upgrade' header is missing");
        if (upgrade.toLowerCase() !== "websocket")
          return this._failHandshake("'Upgrade' header value is not 'WebSocket'");
        if (connection === "")
          return this._failHandshake("'Connection' header is missing");
        if (connection.toLowerCase() !== "upgrade")
          return this._failHandshake("'Connection' header value is not 'Upgrade'");
        if (accept !== this._accept)
          return this._failHandshake("Sec-WebSocket-Accept mismatch");
        this.protocol = null;
        if (protocol !== "") {
          if (this._protocols.indexOf(protocol) < 0)
            return this._failHandshake("Sec-WebSocket-Protocol mismatch");
          else
            this.protocol = protocol;
        }
        try {
          this._extensions.activate(this.headers["sec-websocket-extensions"]);
        } catch (e) {
          return this._failHandshake(e.message);
        }
      }
    };
    for (key$5 in instance$5)
      Client$2.prototype[key$5] = instance$5[key$5];
    client$1 = Client$2;
    Buffer$2 = safeBuffer.exports.Buffer;
    Base$3 = base;
    util$6 = import_util2.default;
    Draft75$2 = function(request, url2, options2) {
      Base$3.apply(this, arguments);
      this._stage = 0;
      this.version = "hixie-75";
      this._headers.set("Upgrade", "WebSocket");
      this._headers.set("Connection", "Upgrade");
      this._headers.set("WebSocket-Origin", this._request.headers.origin);
      this._headers.set("WebSocket-Location", this.url);
    };
    util$6.inherits(Draft75$2, Base$3);
    instance$4 = {
      close: function() {
        if (this.readyState === 3)
          return false;
        this.readyState = 3;
        this.emit("close", new Base$3.CloseEvent(null, null));
        return true;
      },
      parse: function(chunk) {
        if (this.readyState > 1)
          return;
        this._reader.put(chunk);
        this._reader.eachByte(function(octet) {
          var message2;
          switch (this._stage) {
            case -1:
              this._body.push(octet);
              this._sendHandshakeBody();
              break;
            case 0:
              this._parseLeadingByte(octet);
              break;
            case 1:
              this._length = (octet & 127) + 128 * this._length;
              if (this._closing && this._length === 0) {
                return this.close();
              } else if ((octet & 128) !== 128) {
                if (this._length === 0) {
                  this._stage = 0;
                } else {
                  this._skipped = 0;
                  this._stage = 2;
                }
              }
              break;
            case 2:
              if (octet === 255) {
                this._stage = 0;
                message2 = Buffer$2.from(this._buffer).toString("utf8", 0, this._buffer.length);
                this.emit("message", new Base$3.MessageEvent(message2));
              } else {
                if (this._length) {
                  this._skipped += 1;
                  if (this._skipped === this._length)
                    this._stage = 0;
                } else {
                  this._buffer.push(octet);
                  if (this._buffer.length > this._maxLength)
                    return this.close();
                }
              }
              break;
          }
        }, this);
      },
      frame: function(buffer) {
        if (this.readyState === 0)
          return this._queue([buffer]);
        if (this.readyState > 1)
          return false;
        if (typeof buffer !== "string")
          buffer = buffer.toString();
        var length = Buffer$2.byteLength(buffer), frame2 = Buffer$2.allocUnsafe(length + 2);
        frame2[0] = 0;
        frame2.write(buffer, 1);
        frame2[frame2.length - 1] = 255;
        this._write(frame2);
        return true;
      },
      _handshakeResponse: function() {
        var start = "HTTP/1.1 101 Web Socket Protocol Handshake", headers2 = [start, this._headers.toString(), ""];
        return Buffer$2.from(headers2.join("\r\n"), "utf8");
      },
      _parseLeadingByte: function(octet) {
        if ((octet & 128) === 128) {
          this._length = 0;
          this._stage = 1;
        } else {
          delete this._length;
          delete this._skipped;
          this._buffer = [];
          this._stage = 2;
        }
      }
    };
    for (key$4 in instance$4)
      Draft75$2.prototype[key$4] = instance$4[key$4];
    draft75 = Draft75$2;
    Buffer$1 = safeBuffer.exports.Buffer;
    Base$2 = base;
    Draft75$1 = draft75;
    crypto = import_crypto2.default;
    util$5 = import_util2.default;
    numberFromKey = function(key) {
      return parseInt((key.match(/[0-9]/g) || []).join(""), 10);
    };
    spacesInKey = function(key) {
      return (key.match(/ /g) || []).length;
    };
    Draft76$1 = function(request, url2, options2) {
      Draft75$1.apply(this, arguments);
      this._stage = -1;
      this._body = [];
      this.version = "hixie-76";
      this._headers.clear();
      this._headers.set("Upgrade", "WebSocket");
      this._headers.set("Connection", "Upgrade");
      this._headers.set("Sec-WebSocket-Origin", this._request.headers.origin);
      this._headers.set("Sec-WebSocket-Location", this.url);
    };
    util$5.inherits(Draft76$1, Draft75$1);
    instance$3 = {
      BODY_SIZE: 8,
      start: function() {
        if (!Draft75$1.prototype.start.call(this))
          return false;
        this._started = true;
        this._sendHandshakeBody();
        return true;
      },
      close: function() {
        if (this.readyState === 3)
          return false;
        if (this.readyState === 1)
          this._write(Buffer$1.from([255, 0]));
        this.readyState = 3;
        this.emit("close", new Base$2.CloseEvent(null, null));
        return true;
      },
      _handshakeResponse: function() {
        var headers2 = this._request.headers, key1 = headers2["sec-websocket-key1"], key2 = headers2["sec-websocket-key2"];
        if (!key1)
          throw new Error("Missing required header: Sec-WebSocket-Key1");
        if (!key2)
          throw new Error("Missing required header: Sec-WebSocket-Key2");
        var number1 = numberFromKey(key1), spaces1 = spacesInKey(key1), number2 = numberFromKey(key2), spaces2 = spacesInKey(key2);
        if (number1 % spaces1 !== 0 || number2 % spaces2 !== 0)
          throw new Error("Client sent invalid Sec-WebSocket-Key headers");
        this._keyValues = [number1 / spaces1, number2 / spaces2];
        var start = "HTTP/1.1 101 WebSocket Protocol Handshake", headers2 = [start, this._headers.toString(), ""];
        return Buffer$1.from(headers2.join("\r\n"), "binary");
      },
      _handshakeSignature: function() {
        if (this._body.length < this.BODY_SIZE)
          return null;
        var md5 = crypto.createHash("md5"), buffer = Buffer$1.allocUnsafe(8 + this.BODY_SIZE);
        buffer.writeUInt32BE(this._keyValues[0], 0);
        buffer.writeUInt32BE(this._keyValues[1], 4);
        Buffer$1.from(this._body).copy(buffer, 8, 0, this.BODY_SIZE);
        md5.update(buffer);
        return Buffer$1.from(md5.digest("binary"), "binary");
      },
      _sendHandshakeBody: function() {
        if (!this._started)
          return;
        var signature = this._handshakeSignature();
        if (!signature)
          return;
        this._write(signature);
        this._stage = 0;
        this._open();
        if (this._body.length > this.BODY_SIZE)
          this.parse(this._body.slice(this.BODY_SIZE));
      },
      _parseLeadingByte: function(octet) {
        if (octet !== 255)
          return Draft75$1.prototype._parseLeadingByte.call(this, octet);
        this._closing = true;
        this._length = 0;
        this._stage = 1;
      }
    };
    for (key$3 in instance$3)
      Draft76$1.prototype[key$3] = instance$3[key$3];
    draft76 = Draft76$1;
    util$4 = import_util2.default;
    HttpParser = http_parser;
    Base$1 = base;
    Draft75 = draft75;
    Draft76 = draft76;
    Hybi = hybi;
    Server$1 = function(options2) {
      Base$1.call(this, null, null, options2);
      this._http = new HttpParser("request");
    };
    util$4.inherits(Server$1, Base$1);
    instance$2 = {
      EVENTS: ["open", "message", "error", "close", "ping", "pong"],
      _bindEventListeners: function() {
        this.messages.on("error", function() {
        });
        this.on("error", function() {
        });
      },
      parse: function(chunk) {
        if (this._delegate)
          return this._delegate.parse(chunk);
        this._http.parse(chunk);
        if (!this._http.isComplete())
          return;
        this.method = this._http.method;
        this.url = this._http.url;
        this.headers = this._http.headers;
        this.body = this._http.body;
        var self2 = this;
        this._delegate = Server$1.http(this, this._options);
        this._delegate.messages = this.messages;
        this._delegate.io = this.io;
        this._open();
        this.EVENTS.forEach(function(event2) {
          this._delegate.on(event2, function(e) {
            self2.emit(event2, e);
          });
        }, this);
        this.protocol = this._delegate.protocol;
        this.version = this._delegate.version;
        this.parse(this._http.body);
        this.emit("connect", new Base$1.ConnectEvent());
      },
      _open: function() {
        this.__queue.forEach(function(msg) {
          this._delegate[msg[0]].apply(this._delegate, msg[1]);
        }, this);
        this.__queue = [];
      }
    };
    ["addExtension", "setHeader", "start", "frame", "text", "binary", "ping", "close"].forEach(function(method) {
      instance$2[method] = function() {
        if (this._delegate) {
          return this._delegate[method].apply(this._delegate, arguments);
        } else {
          this.__queue.push([method, arguments]);
          return true;
        }
      };
    });
    for (key$2 in instance$2)
      Server$1.prototype[key$2] = instance$2[key$2];
    Server$1.isSecureRequest = function(request) {
      if (request.connection && request.connection.authorized !== void 0)
        return true;
      if (request.socket && request.socket.secure)
        return true;
      var headers2 = request.headers;
      if (!headers2)
        return false;
      if (headers2["https"] === "on")
        return true;
      if (headers2["x-forwarded-ssl"] === "on")
        return true;
      if (headers2["x-forwarded-scheme"] === "https")
        return true;
      if (headers2["x-forwarded-proto"] === "https")
        return true;
      return false;
    };
    Server$1.determineUrl = function(request) {
      var scheme = this.isSecureRequest(request) ? "wss:" : "ws:";
      return scheme + "//" + request.headers.host + request.url;
    };
    Server$1.http = function(request, options2) {
      options2 = options2 || {};
      if (options2.requireMasking === void 0)
        options2.requireMasking = true;
      var headers2 = request.headers, version2 = headers2["sec-websocket-version"], key = headers2["sec-websocket-key"], key1 = headers2["sec-websocket-key1"], key2 = headers2["sec-websocket-key2"], url2 = this.determineUrl(request);
      if (version2 || key)
        return new Hybi(request, url2, options2);
      else if (key1 || key2)
        return new Draft76(request, url2, options2);
      else
        return new Draft75(request, url2, options2);
    };
    server = Server$1;
    Base = base;
    Client$1 = client$1;
    Server = server;
    Driver = {
      client: function(url2, options2) {
        options2 = options2 || {};
        if (options2.masking === void 0)
          options2.masking = true;
        return new Client$1(url2, options2);
      },
      server: function(options2) {
        options2 = options2 || {};
        if (options2.requireMasking === void 0)
          options2.requireMasking = true;
        return new Server(options2);
      },
      http: function() {
        return Server.http.apply(Server, arguments);
      },
      isSecureRequest: function(request) {
        return Server.isSecureRequest(request);
      },
      isWebSocket: function(request) {
        return Base.isWebSocket(request);
      },
      validateOptions: function(options2, validKeys) {
        Base.validateOptions(options2, validKeys);
      }
    };
    driver$4 = Driver;
    Event$3 = function(eventType, options2) {
      this.type = eventType;
      for (var key in options2)
        this[key] = options2[key];
    };
    Event$3.prototype.initEvent = function(eventType, canBubble, cancelable) {
      this.type = eventType;
      this.bubbles = canBubble;
      this.cancelable = cancelable;
    };
    Event$3.prototype.stopPropagation = function() {
    };
    Event$3.prototype.preventDefault = function() {
    };
    Event$3.CAPTURING_PHASE = 1;
    Event$3.AT_TARGET = 2;
    Event$3.BUBBLING_PHASE = 3;
    event = Event$3;
    Event$2 = event;
    EventTarget$2 = {
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      addEventListener: function(eventType, listener, useCapture) {
        this.on(eventType, listener);
      },
      removeEventListener: function(eventType, listener, useCapture) {
        this.removeListener(eventType, listener);
      },
      dispatchEvent: function(event2) {
        event2.target = event2.currentTarget = this;
        event2.eventPhase = Event$2.AT_TARGET;
        if (this["on" + event2.type])
          this["on" + event2.type](event2);
        this.emit(event2.type, event2);
      }
    };
    event_target = EventTarget$2;
    Stream$1 = import_stream2.default.Stream;
    util$3 = import_util2.default;
    driver$3 = driver$4;
    EventTarget$1 = event_target;
    Event$1 = event;
    API$3 = function(options2) {
      options2 = options2 || {};
      driver$3.validateOptions(options2, ["headers", "extensions", "maxLength", "ping", "proxy", "tls", "ca"]);
      this.readable = this.writable = true;
      var headers2 = options2.headers;
      if (headers2) {
        for (var name2 in headers2)
          this._driver.setHeader(name2, headers2[name2]);
      }
      var extensions = options2.extensions;
      if (extensions) {
        [].concat(extensions).forEach(this._driver.addExtension, this._driver);
      }
      this._ping = options2.ping;
      this._pingId = 0;
      this.readyState = API$3.CONNECTING;
      this.bufferedAmount = 0;
      this.protocol = "";
      this.url = this._driver.url;
      this.version = this._driver.version;
      var self2 = this;
      this._driver.on("open", function(e) {
        self2._open();
      });
      this._driver.on("message", function(e) {
        self2._receiveMessage(e.data);
      });
      this._driver.on("close", function(e) {
        self2._beginClose(e.reason, e.code);
      });
      this._driver.on("error", function(error22) {
        self2._emitError(error22.message);
      });
      this.on("error", function() {
      });
      this._driver.messages.on("drain", function() {
        self2.emit("drain");
      });
      if (this._ping)
        this._pingTimer = setInterval(function() {
          self2._pingId += 1;
          self2.ping(self2._pingId.toString());
        }, this._ping * 1e3);
      this._configureStream();
      if (!this._proxy) {
        this._stream.pipe(this._driver.io);
        this._driver.io.pipe(this._stream);
      }
    };
    util$3.inherits(API$3, Stream$1);
    API$3.CONNECTING = 0;
    API$3.OPEN = 1;
    API$3.CLOSING = 2;
    API$3.CLOSED = 3;
    API$3.CLOSE_TIMEOUT = 3e4;
    instance$1 = {
      write: function(data) {
        return this.send(data);
      },
      end: function(data) {
        if (data !== void 0)
          this.send(data);
        this.close();
      },
      pause: function() {
        return this._driver.messages.pause();
      },
      resume: function() {
        return this._driver.messages.resume();
      },
      send: function(data) {
        if (this.readyState > API$3.OPEN)
          return false;
        if (!(data instanceof Buffer))
          data = String(data);
        return this._driver.messages.write(data);
      },
      ping: function(message2, callback) {
        if (this.readyState > API$3.OPEN)
          return false;
        return this._driver.ping(message2, callback);
      },
      close: function(code, reason) {
        if (code === void 0)
          code = 1e3;
        if (reason === void 0)
          reason = "";
        if (code !== 1e3 && (code < 3e3 || code > 4999))
          throw new Error("Failed to execute 'close' on WebSocket: The code must be either 1000, or between 3000 and 4999. " + code + " is neither.");
        if (this.readyState < API$3.CLOSING) {
          var self2 = this;
          this._closeTimer = setTimeout(function() {
            self2._beginClose("", 1006);
          }, API$3.CLOSE_TIMEOUT);
        }
        if (this.readyState !== API$3.CLOSED)
          this.readyState = API$3.CLOSING;
        this._driver.close(reason, code);
      },
      _configureStream: function() {
        var self2 = this;
        this._stream.setTimeout(0);
        this._stream.setNoDelay(true);
        ["close", "end"].forEach(function(event2) {
          this._stream.on(event2, function() {
            self2._finalizeClose();
          });
        }, this);
        this._stream.on("error", function(error22) {
          self2._emitError("Network error: " + self2.url + ": " + error22.message);
          self2._finalizeClose();
        });
      },
      _open: function() {
        if (this.readyState !== API$3.CONNECTING)
          return;
        this.readyState = API$3.OPEN;
        this.protocol = this._driver.protocol || "";
        var event2 = new Event$1("open");
        event2.initEvent("open", false, false);
        this.dispatchEvent(event2);
      },
      _receiveMessage: function(data) {
        if (this.readyState > API$3.OPEN)
          return false;
        if (this.readable)
          this.emit("data", data);
        var event2 = new Event$1("message", { data });
        event2.initEvent("message", false, false);
        this.dispatchEvent(event2);
      },
      _emitError: function(message2) {
        if (this.readyState >= API$3.CLOSING)
          return;
        var event2 = new Event$1("error", { message: message2 });
        event2.initEvent("error", false, false);
        this.dispatchEvent(event2);
      },
      _beginClose: function(reason, code) {
        if (this.readyState === API$3.CLOSED)
          return;
        this.readyState = API$3.CLOSING;
        this._closeParams = [reason, code];
        if (this._stream) {
          this._stream.destroy();
          if (!this._stream.readable)
            this._finalizeClose();
        }
      },
      _finalizeClose: function() {
        if (this.readyState === API$3.CLOSED)
          return;
        this.readyState = API$3.CLOSED;
        if (this._closeTimer)
          clearTimeout(this._closeTimer);
        if (this._pingTimer)
          clearInterval(this._pingTimer);
        if (this._stream)
          this._stream.end();
        if (this.readable)
          this.emit("end");
        this.readable = this.writable = false;
        var reason = this._closeParams ? this._closeParams[0] : "", code = this._closeParams ? this._closeParams[1] : 1006;
        var event2 = new Event$1("close", { code, reason });
        event2.initEvent("close", false, false);
        this.dispatchEvent(event2);
      }
    };
    for (method$1 in instance$1)
      API$3.prototype[method$1] = instance$1[method$1];
    for (key$1 in EventTarget$1)
      API$3.prototype[key$1] = EventTarget$1[key$1];
    api = API$3;
    util$2 = import_util2.default;
    net = import_net.default;
    tls = import_tls.default;
    url = import_url2.default;
    driver$2 = driver$4;
    API$2 = api;
    DEFAULT_PORTS = { "http:": 80, "https:": 443, "ws:": 80, "wss:": 443 };
    SECURE_PROTOCOLS = ["https:", "wss:"];
    Client = function(_url, protocols, options2) {
      options2 = options2 || {};
      this.url = _url;
      this._driver = driver$2.client(this.url, { maxLength: options2.maxLength, protocols });
      ["open", "error"].forEach(function(event2) {
        this._driver.on(event2, function() {
          self2.headers = self2._driver.headers;
          self2.statusCode = self2._driver.statusCode;
        });
      }, this);
      var proxy2 = options2.proxy || {}, endpoint = url.parse(proxy2.origin || this.url), port = endpoint.port || DEFAULT_PORTS[endpoint.protocol], secure = SECURE_PROTOCOLS.indexOf(endpoint.protocol) >= 0, onConnect = function() {
        self2._onConnect();
      }, netOptions = options2.net || {}, originTLS = options2.tls || {}, socketTLS = proxy2.origin ? proxy2.tls || {} : originTLS, self2 = this;
      netOptions.host = socketTLS.host = endpoint.hostname;
      netOptions.port = socketTLS.port = port;
      originTLS.ca = originTLS.ca || options2.ca;
      socketTLS.servername = socketTLS.servername || endpoint.hostname;
      this._stream = secure ? tls.connect(socketTLS, onConnect) : net.connect(netOptions, onConnect);
      if (proxy2.origin)
        this._configureProxy(proxy2, originTLS);
      API$2.call(this, options2);
    };
    util$2.inherits(Client, API$2);
    Client.prototype._onConnect = function() {
      var worker = this._proxy || this._driver;
      worker.start();
    };
    Client.prototype._configureProxy = function(proxy2, originTLS) {
      var uri = url.parse(this.url), secure = SECURE_PROTOCOLS.indexOf(uri.protocol) >= 0, self2 = this, name2;
      this._proxy = this._driver.proxy(proxy2.origin);
      if (proxy2.headers) {
        for (name2 in proxy2.headers)
          this._proxy.setHeader(name2, proxy2.headers[name2]);
      }
      this._proxy.pipe(this._stream, { end: false });
      this._stream.pipe(this._proxy);
      this._proxy.on("connect", function() {
        if (secure) {
          var options2 = { socket: self2._stream, servername: uri.hostname };
          for (name2 in originTLS)
            options2[name2] = originTLS[name2];
          self2._stream = tls.connect(options2);
          self2._configureStream();
        }
        self2._driver.io.pipe(self2._stream);
        self2._stream.pipe(self2._driver.io);
        self2._driver.start();
      });
      this._proxy.on("error", function(error22) {
        self2._driver.emit("error", error22);
      });
    };
    client = Client;
    Stream2 = import_stream2.default.Stream;
    util$1 = import_util2.default;
    driver$1 = driver$4;
    Headers2 = headers;
    API$1 = api;
    EventTarget = event_target;
    Event = event;
    EventSource = function(request, response, options2) {
      this.writable = true;
      options2 = options2 || {};
      this._stream = response.socket;
      this._ping = options2.ping || this.DEFAULT_PING;
      this._retry = options2.retry || this.DEFAULT_RETRY;
      var scheme = driver$1.isSecureRequest(request) ? "https:" : "http:";
      this.url = scheme + "//" + request.headers.host + request.url;
      this.lastEventId = request.headers["last-event-id"] || "";
      this.readyState = API$1.CONNECTING;
      var headers2 = new Headers2(), self2 = this;
      if (options2.headers) {
        for (var key in options2.headers)
          headers2.set(key, options2.headers[key]);
      }
      if (!this._stream || !this._stream.writable)
        return;
      process.nextTick(function() {
        self2._open();
      });
      this._stream.setTimeout(0);
      this._stream.setNoDelay(true);
      var handshake = "HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nCache-Control: no-cache, no-store\r\nConnection: close\r\n" + headers2.toString() + "\r\nretry: " + Math.floor(this._retry * 1e3) + "\r\n\r\n";
      this._write(handshake);
      this._stream.on("drain", function() {
        self2.emit("drain");
      });
      if (this._ping)
        this._pingTimer = setInterval(function() {
          self2.ping();
        }, this._ping * 1e3);
      ["error", "end"].forEach(function(event2) {
        self2._stream.on(event2, function() {
          self2.close();
        });
      });
    };
    util$1.inherits(EventSource, Stream2);
    EventSource.isEventSource = function(request) {
      if (request.method !== "GET")
        return false;
      var accept = (request.headers.accept || "").split(/\s*,\s*/);
      return accept.indexOf("text/event-stream") >= 0;
    };
    instance = {
      DEFAULT_PING: 10,
      DEFAULT_RETRY: 5,
      _write: function(chunk) {
        if (!this.writable)
          return false;
        try {
          return this._stream.write(chunk, "utf8");
        } catch (e) {
          return false;
        }
      },
      _open: function() {
        if (this.readyState !== API$1.CONNECTING)
          return;
        this.readyState = API$1.OPEN;
        var event2 = new Event("open");
        event2.initEvent("open", false, false);
        this.dispatchEvent(event2);
      },
      write: function(message2) {
        return this.send(message2);
      },
      end: function(message2) {
        if (message2 !== void 0)
          this.write(message2);
        this.close();
      },
      send: function(message2, options2) {
        if (this.readyState > API$1.OPEN)
          return false;
        message2 = String(message2).replace(/(\r\n|\r|\n)/g, "$1data: ");
        options2 = options2 || {};
        var frame2 = "";
        if (options2.event)
          frame2 += "event: " + options2.event + "\r\n";
        if (options2.id)
          frame2 += "id: " + options2.id + "\r\n";
        frame2 += "data: " + message2 + "\r\n\r\n";
        return this._write(frame2);
      },
      ping: function() {
        return this._write(":\r\n\r\n");
      },
      close: function() {
        if (this.readyState > API$1.OPEN)
          return false;
        this.readyState = API$1.CLOSED;
        this.writable = false;
        if (this._pingTimer)
          clearInterval(this._pingTimer);
        if (this._stream)
          this._stream.end();
        var event2 = new Event("close");
        event2.initEvent("close", false, false);
        this.dispatchEvent(event2);
        return true;
      }
    };
    for (method in instance)
      EventSource.prototype[method] = instance[method];
    for (key in EventTarget)
      EventSource.prototype[key] = EventTarget[key];
    eventsource = EventSource;
    util = import_util2.default;
    driver = driver$4;
    API = api;
    WebSocket$1 = function(request, socket, body, protocols, options2) {
      options2 = options2 || {};
      this._stream = socket;
      this._driver = driver.http(request, { maxLength: options2.maxLength, protocols });
      var self2 = this;
      if (!this._stream || !this._stream.writable)
        return;
      if (!this._stream.readable)
        return this._stream.end();
      var catchup = function() {
        self2._stream.removeListener("data", catchup);
      };
      this._stream.on("data", catchup);
      API.call(this, options2);
      process.nextTick(function() {
        self2._driver.start();
        self2._driver.io.write(body);
      });
    };
    util.inherits(WebSocket$1, API);
    WebSocket$1.isWebSocket = function(request) {
      return driver.isWebSocket(request);
    };
    WebSocket$1.validateOptions = function(options2, validKeys) {
      driver.validateOptions(options2, validKeys);
    };
    WebSocket$1.WebSocket = WebSocket$1;
    WebSocket$1.Client = client;
    WebSocket$1.EventSource = eventsource;
    websocket = WebSocket$1;
    PROTOCOL_VERSION = "5";
    VERSION_PARAM = "v";
    TRANSPORT_SESSION_PARAM = "s";
    REFERER_PARAM = "r";
    FORGE_REF = "f";
    FORGE_DOMAIN_RE = /(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/;
    LAST_SESSION_PARAM = "ls";
    APPLICATION_ID_PARAM = "p";
    APP_CHECK_TOKEN_PARAM = "ac";
    WEBSOCKET = "websocket";
    LONG_POLLING = "long_polling";
    DOMStorageWrapper = class {
      constructor(domStorage_) {
        this.domStorage_ = domStorage_;
        this.prefix_ = "firebase:";
      }
      set(key, value) {
        if (value == null) {
          this.domStorage_.removeItem(this.prefixedName_(key));
        } else {
          this.domStorage_.setItem(this.prefixedName_(key), stringify(value));
        }
      }
      get(key) {
        const storedVal = this.domStorage_.getItem(this.prefixedName_(key));
        if (storedVal == null) {
          return null;
        } else {
          return jsonEval(storedVal);
        }
      }
      remove(key) {
        this.domStorage_.removeItem(this.prefixedName_(key));
      }
      prefixedName_(name2) {
        return this.prefix_ + name2;
      }
      toString() {
        return this.domStorage_.toString();
      }
    };
    MemoryStorage = class {
      constructor() {
        this.cache_ = {};
        this.isInMemoryStorage = true;
      }
      set(key, value) {
        if (value == null) {
          delete this.cache_[key];
        } else {
          this.cache_[key] = value;
        }
      }
      get(key) {
        if (contains(this.cache_, key)) {
          return this.cache_[key];
        }
        return null;
      }
      remove(key) {
        delete this.cache_[key];
      }
    };
    createStoragefor = function(domStorageName) {
      try {
        if (typeof window !== "undefined" && typeof window[domStorageName] !== "undefined") {
          const domStorage = window[domStorageName];
          domStorage.setItem("firebase:sentinel", "cache");
          domStorage.removeItem("firebase:sentinel");
          return new DOMStorageWrapper(domStorage);
        }
      } catch (e) {
      }
      return new MemoryStorage();
    };
    PersistentStorage = createStoragefor("localStorage");
    SessionStorage = createStoragefor("sessionStorage");
    logClient = new Logger("@firebase/database");
    LUIDGenerator = function() {
      let id = 1;
      return function() {
        return id++;
      };
    }();
    sha1 = function(str) {
      const utf8Bytes = stringToByteArray(str);
      const sha12 = new Sha1();
      sha12.update(utf8Bytes);
      const sha1Bytes = sha12.digest();
      return base64.encodeByteArray(sha1Bytes);
    };
    buildLogMessage_ = function(...varArgs) {
      let message2 = "";
      for (let i = 0; i < varArgs.length; i++) {
        const arg = varArgs[i];
        if (Array.isArray(arg) || arg && typeof arg === "object" && typeof arg.length === "number") {
          message2 += buildLogMessage_.apply(null, arg);
        } else if (typeof arg === "object") {
          message2 += stringify(arg);
        } else {
          message2 += arg;
        }
        message2 += " ";
      }
      return message2;
    };
    logger = null;
    firstLog_ = true;
    enableLogging$1 = function(logger_, persistent) {
      assert$1(!persistent || logger_ === true || logger_ === false, "Can't turn on custom loggers persistently.");
      if (logger_ === true) {
        logClient.logLevel = LogLevel.VERBOSE;
        logger = logClient.log.bind(logClient);
        if (persistent) {
          SessionStorage.set("logging_enabled", true);
        }
      } else if (typeof logger_ === "function") {
        logger = logger_;
      } else {
        logger = null;
        SessionStorage.remove("logging_enabled");
      }
    };
    log = function(...varArgs) {
      if (firstLog_ === true) {
        firstLog_ = false;
        if (logger === null && SessionStorage.get("logging_enabled") === true) {
          enableLogging$1(true);
        }
      }
      if (logger) {
        const message2 = buildLogMessage_.apply(null, varArgs);
        logger(message2);
      }
    };
    logWrapper = function(prefix) {
      return function(...varArgs) {
        log(prefix, ...varArgs);
      };
    };
    error = function(...varArgs) {
      const message2 = "FIREBASE INTERNAL ERROR: " + buildLogMessage_(...varArgs);
      logClient.error(message2);
    };
    fatal = function(...varArgs) {
      const message2 = `FIREBASE FATAL ERROR: ${buildLogMessage_(...varArgs)}`;
      logClient.error(message2);
      throw new Error(message2);
    };
    warn = function(...varArgs) {
      const message2 = "FIREBASE WARNING: " + buildLogMessage_(...varArgs);
      logClient.warn(message2);
    };
    warnIfPageIsSecure = function() {
      if (typeof window !== "undefined" && window.location && window.location.protocol && window.location.protocol.indexOf("https:") !== -1) {
        warn("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");
      }
    };
    isInvalidJSONNumber = function(data) {
      return typeof data === "number" && (data !== data || data === Number.POSITIVE_INFINITY || data === Number.NEGATIVE_INFINITY);
    };
    executeWhenDOMReady = function(fn) {
      if (isNodeSdk() || document.readyState === "complete") {
        fn();
      } else {
        let called = false;
        const wrappedFn = function() {
          if (!document.body) {
            setTimeout(wrappedFn, Math.floor(10));
            return;
          }
          if (!called) {
            called = true;
            fn();
          }
        };
        if (document.addEventListener) {
          document.addEventListener("DOMContentLoaded", wrappedFn, false);
          window.addEventListener("load", wrappedFn, false);
        } else if (document.attachEvent) {
          document.attachEvent("onreadystatechange", () => {
            if (document.readyState === "complete") {
              wrappedFn();
            }
          });
          window.attachEvent("onload", wrappedFn);
        }
      }
    };
    MIN_NAME = "[MIN_NAME]";
    MAX_NAME = "[MAX_NAME]";
    nameCompare = function(a, b) {
      if (a === b) {
        return 0;
      } else if (a === MIN_NAME || b === MAX_NAME) {
        return -1;
      } else if (b === MIN_NAME || a === MAX_NAME) {
        return 1;
      } else {
        const aAsInt = tryParseInt(a), bAsInt = tryParseInt(b);
        if (aAsInt !== null) {
          if (bAsInt !== null) {
            return aAsInt - bAsInt === 0 ? a.length - b.length : aAsInt - bAsInt;
          } else {
            return -1;
          }
        } else if (bAsInt !== null) {
          return 1;
        } else {
          return a < b ? -1 : 1;
        }
      }
    };
    stringCompare = function(a, b) {
      if (a === b) {
        return 0;
      } else if (a < b) {
        return -1;
      } else {
        return 1;
      }
    };
    requireKey = function(key, obj) {
      if (obj && key in obj) {
        return obj[key];
      } else {
        throw new Error("Missing required key (" + key + ") in object: " + stringify(obj));
      }
    };
    ObjectToUniqueKey = function(obj) {
      if (typeof obj !== "object" || obj === null) {
        return stringify(obj);
      }
      const keys = [];
      for (const k in obj) {
        keys.push(k);
      }
      keys.sort();
      let key = "{";
      for (let i = 0; i < keys.length; i++) {
        if (i !== 0) {
          key += ",";
        }
        key += stringify(keys[i]);
        key += ":";
        key += ObjectToUniqueKey(obj[keys[i]]);
      }
      key += "}";
      return key;
    };
    splitStringBySize = function(str, segsize) {
      const len = str.length;
      if (len <= segsize) {
        return [str];
      }
      const dataSegs = [];
      for (let c = 0; c < len; c += segsize) {
        if (c + segsize > len) {
          dataSegs.push(str.substring(c, len));
        } else {
          dataSegs.push(str.substring(c, c + segsize));
        }
      }
      return dataSegs;
    };
    doubleToIEEE754String = function(v) {
      assert$1(!isInvalidJSONNumber(v), "Invalid JSON number");
      const ebits = 11, fbits = 52;
      const bias = (1 << ebits - 1) - 1;
      let s2, e, f, ln, i;
      if (v === 0) {
        e = 0;
        f = 0;
        s2 = 1 / v === -Infinity ? 1 : 0;
      } else {
        s2 = v < 0;
        v = Math.abs(v);
        if (v >= Math.pow(2, 1 - bias)) {
          ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
          e = ln + bias;
          f = Math.round(v * Math.pow(2, fbits - ln) - Math.pow(2, fbits));
        } else {
          e = 0;
          f = Math.round(v / Math.pow(2, 1 - bias - fbits));
        }
      }
      const bits = [];
      for (i = fbits; i; i -= 1) {
        bits.push(f % 2 ? 1 : 0);
        f = Math.floor(f / 2);
      }
      for (i = ebits; i; i -= 1) {
        bits.push(e % 2 ? 1 : 0);
        e = Math.floor(e / 2);
      }
      bits.push(s2 ? 1 : 0);
      bits.reverse();
      const str = bits.join("");
      let hexByteString = "";
      for (i = 0; i < 64; i += 8) {
        let hexByte = parseInt(str.substr(i, 8), 2).toString(16);
        if (hexByte.length === 1) {
          hexByte = "0" + hexByte;
        }
        hexByteString = hexByteString + hexByte;
      }
      return hexByteString.toLowerCase();
    };
    isChromeExtensionContentScript = function() {
      return !!(typeof window === "object" && window["chrome"] && window["chrome"]["extension"] && !/^chrome/.test(window.location.href));
    };
    isWindowsStoreApp = function() {
      return typeof Windows === "object" && typeof Windows.UI === "object";
    };
    INTEGER_REGEXP_ = new RegExp("^-?(0*)\\d{1,10}$");
    INTEGER_32_MIN = -2147483648;
    INTEGER_32_MAX = 2147483647;
    tryParseInt = function(str) {
      if (INTEGER_REGEXP_.test(str)) {
        const intVal = Number(str);
        if (intVal >= INTEGER_32_MIN && intVal <= INTEGER_32_MAX) {
          return intVal;
        }
      }
      return null;
    };
    exceptionGuard = function(fn) {
      try {
        fn();
      } catch (e) {
        setTimeout(() => {
          const stack = e.stack || "";
          warn("Exception was thrown by user callback.", stack);
          throw e;
        }, Math.floor(0));
      }
    };
    beingCrawled = function() {
      const userAgent = typeof window === "object" && window["navigator"] && window["navigator"]["userAgent"] || "";
      return userAgent.search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i) >= 0;
    };
    setTimeoutNonBlocking = function(fn, time) {
      const timeout = setTimeout(fn, time);
      if (typeof timeout === "object" && timeout["unref"]) {
        timeout["unref"]();
      }
      return timeout;
    };
    RepoInfo = class {
      constructor(host, secure, namespace, webSocketOnly, nodeAdmin = false, persistenceKey = "", includeNamespaceInQueryParams = false) {
        this.secure = secure;
        this.namespace = namespace;
        this.webSocketOnly = webSocketOnly;
        this.nodeAdmin = nodeAdmin;
        this.persistenceKey = persistenceKey;
        this.includeNamespaceInQueryParams = includeNamespaceInQueryParams;
        this._host = host.toLowerCase();
        this._domain = this._host.substr(this._host.indexOf(".") + 1);
        this.internalHost = PersistentStorage.get("host:" + host) || this._host;
      }
      isCacheableHost() {
        return this.internalHost.substr(0, 2) === "s-";
      }
      isCustomHost() {
        return this._domain !== "firebaseio.com" && this._domain !== "firebaseio-demo.com";
      }
      get host() {
        return this._host;
      }
      set host(newHost) {
        if (newHost !== this.internalHost) {
          this.internalHost = newHost;
          if (this.isCacheableHost()) {
            PersistentStorage.set("host:" + this._host, this.internalHost);
          }
        }
      }
      toString() {
        let str = this.toURLString();
        if (this.persistenceKey) {
          str += "<" + this.persistenceKey + ">";
        }
        return str;
      }
      toURLString() {
        const protocol = this.secure ? "https://" : "http://";
        const query = this.includeNamespaceInQueryParams ? `?ns=${this.namespace}` : "";
        return `${protocol}${this.host}/${query}`;
      }
    };
    StatsCollection = class {
      constructor() {
        this.counters_ = {};
      }
      incrementCounter(name2, amount = 1) {
        if (!contains(this.counters_, name2)) {
          this.counters_[name2] = 0;
        }
        this.counters_[name2] += amount;
      }
      get() {
        return deepCopy(this.counters_);
      }
    };
    collections = {};
    reporters = {};
    SDK_VERSION = "";
    WEBSOCKET_MAX_FRAME_SIZE = 16384;
    WEBSOCKET_KEEPALIVE_INTERVAL = 45e3;
    WebSocketImpl = null;
    if (typeof MozWebSocket !== "undefined") {
      WebSocketImpl = MozWebSocket;
    } else if (typeof WebSocket !== "undefined") {
      WebSocketImpl = WebSocket;
    }
    WebSocketConnection = class {
      constructor(connId, repoInfo, applicationId, appCheckToken, authToken, transportSessionId, lastSessionId) {
        this.connId = connId;
        this.applicationId = applicationId;
        this.appCheckToken = appCheckToken;
        this.authToken = authToken;
        this.keepaliveTimer = null;
        this.frames = null;
        this.totalFrames = 0;
        this.bytesSent = 0;
        this.bytesReceived = 0;
        this.log_ = logWrapper(this.connId);
        this.stats_ = statsManagerGetCollection(repoInfo);
        this.connURL = WebSocketConnection.connectionURL_(repoInfo, transportSessionId, lastSessionId, appCheckToken);
        this.nodeAdmin = repoInfo.nodeAdmin;
      }
      static connectionURL_(repoInfo, transportSessionId, lastSessionId, appCheckToken) {
        const urlParams = {};
        urlParams[VERSION_PARAM] = PROTOCOL_VERSION;
        if (!isNodeSdk() && typeof location !== "undefined" && location.hostname && FORGE_DOMAIN_RE.test(location.hostname)) {
          urlParams[REFERER_PARAM] = FORGE_REF;
        }
        if (transportSessionId) {
          urlParams[TRANSPORT_SESSION_PARAM] = transportSessionId;
        }
        if (lastSessionId) {
          urlParams[LAST_SESSION_PARAM] = lastSessionId;
        }
        if (appCheckToken) {
          urlParams[APP_CHECK_TOKEN_PARAM] = appCheckToken;
        }
        return repoInfoConnectionURL(repoInfo, WEBSOCKET, urlParams);
      }
      open(onMessage, onDisconnect) {
        this.onDisconnect = onDisconnect;
        this.onMessage = onMessage;
        this.log_("Websocket connecting to " + this.connURL);
        this.everConnected_ = false;
        PersistentStorage.set("previous_websocket_failure", true);
        try {
          if (isNodeSdk()) {
            const device = this.nodeAdmin ? "AdminNode" : "Node";
            const options2 = {
              headers: {
                "User-Agent": `Firebase/${PROTOCOL_VERSION}/${SDK_VERSION}/${process.platform}/${device}`,
                "X-Firebase-GMPID": this.applicationId || ""
              }
            };
            if (this.authToken) {
              options2.headers["Authorization"] = `Bearer ${this.authToken}`;
            }
            if (this.appCheckToken) {
              options2.headers["X-Firebase-AppCheck"] = this.appCheckToken;
            }
            const env = process["env"];
            const proxy2 = this.connURL.indexOf("wss://") === 0 ? env["HTTPS_PROXY"] || env["https_proxy"] : env["HTTP_PROXY"] || env["http_proxy"];
            if (proxy2) {
              options2["proxy"] = { origin: proxy2 };
            }
            this.mySock = new WebSocketImpl(this.connURL, [], options2);
          } else {
            const options2 = {
              headers: {
                "X-Firebase-GMPID": this.applicationId || "",
                "X-Firebase-AppCheck": this.appCheckToken || ""
              }
            };
            this.mySock = new WebSocketImpl(this.connURL, [], options2);
          }
        } catch (e) {
          this.log_("Error instantiating WebSocket.");
          const error22 = e.message || e.data;
          if (error22) {
            this.log_(error22);
          }
          this.onClosed_();
          return;
        }
        this.mySock.onopen = () => {
          this.log_("Websocket connected.");
          this.everConnected_ = true;
        };
        this.mySock.onclose = () => {
          this.log_("Websocket connection was disconnected.");
          this.mySock = null;
          this.onClosed_();
        };
        this.mySock.onmessage = (m) => {
          this.handleIncomingFrame(m);
        };
        this.mySock.onerror = (e) => {
          this.log_("WebSocket error.  Closing connection.");
          const error22 = e.message || e.data;
          if (error22) {
            this.log_(error22);
          }
          this.onClosed_();
        };
      }
      start() {
      }
      static forceDisallow() {
        WebSocketConnection.forceDisallow_ = true;
      }
      static isAvailable() {
        let isOldAndroid = false;
        if (typeof navigator !== "undefined" && navigator.userAgent) {
          const oldAndroidRegex = /Android ([0-9]{0,}\.[0-9]{0,})/;
          const oldAndroidMatch = navigator.userAgent.match(oldAndroidRegex);
          if (oldAndroidMatch && oldAndroidMatch.length > 1) {
            if (parseFloat(oldAndroidMatch[1]) < 4.4) {
              isOldAndroid = true;
            }
          }
        }
        return !isOldAndroid && WebSocketImpl !== null && !WebSocketConnection.forceDisallow_;
      }
      static previouslyFailed() {
        return PersistentStorage.isInMemoryStorage || PersistentStorage.get("previous_websocket_failure") === true;
      }
      markConnectionHealthy() {
        PersistentStorage.remove("previous_websocket_failure");
      }
      appendFrame_(data) {
        this.frames.push(data);
        if (this.frames.length === this.totalFrames) {
          const fullMess = this.frames.join("");
          this.frames = null;
          const jsonMess = jsonEval(fullMess);
          this.onMessage(jsonMess);
        }
      }
      handleNewFrameCount_(frameCount) {
        this.totalFrames = frameCount;
        this.frames = [];
      }
      extractFrameCount_(data) {
        assert$1(this.frames === null, "We already have a frame buffer");
        if (data.length <= 6) {
          const frameCount = Number(data);
          if (!isNaN(frameCount)) {
            this.handleNewFrameCount_(frameCount);
            return null;
          }
        }
        this.handleNewFrameCount_(1);
        return data;
      }
      handleIncomingFrame(mess) {
        if (this.mySock === null) {
          return;
        }
        const data = mess["data"];
        this.bytesReceived += data.length;
        this.stats_.incrementCounter("bytes_received", data.length);
        this.resetKeepAlive();
        if (this.frames !== null) {
          this.appendFrame_(data);
        } else {
          const remainingData = this.extractFrameCount_(data);
          if (remainingData !== null) {
            this.appendFrame_(remainingData);
          }
        }
      }
      send(data) {
        this.resetKeepAlive();
        const dataStr = stringify(data);
        this.bytesSent += dataStr.length;
        this.stats_.incrementCounter("bytes_sent", dataStr.length);
        const dataSegs = splitStringBySize(dataStr, WEBSOCKET_MAX_FRAME_SIZE);
        if (dataSegs.length > 1) {
          this.sendString_(String(dataSegs.length));
        }
        for (let i = 0; i < dataSegs.length; i++) {
          this.sendString_(dataSegs[i]);
        }
      }
      shutdown_() {
        this.isClosed_ = true;
        if (this.keepaliveTimer) {
          clearInterval(this.keepaliveTimer);
          this.keepaliveTimer = null;
        }
        if (this.mySock) {
          this.mySock.close();
          this.mySock = null;
        }
      }
      onClosed_() {
        if (!this.isClosed_) {
          this.log_("WebSocket is closing itself");
          this.shutdown_();
          if (this.onDisconnect) {
            this.onDisconnect(this.everConnected_);
            this.onDisconnect = null;
          }
        }
      }
      close() {
        if (!this.isClosed_) {
          this.log_("WebSocket is being closed");
          this.shutdown_();
        }
      }
      resetKeepAlive() {
        clearInterval(this.keepaliveTimer);
        this.keepaliveTimer = setInterval(() => {
          if (this.mySock) {
            this.sendString_("0");
          }
          this.resetKeepAlive();
        }, Math.floor(WEBSOCKET_KEEPALIVE_INTERVAL));
      }
      sendString_(str) {
        try {
          this.mySock.send(str);
        } catch (e) {
          this.log_("Exception thrown from WebSocket.send():", e.message || e.data, "Closing connection.");
          setTimeout(this.onClosed_.bind(this), 0);
        }
      }
    };
    WebSocketConnection.responsesRequiredToBeHealthy = 2;
    WebSocketConnection.healthyTimeout = 3e4;
    name = "@firebase/database";
    version = "0.12.4";
    AppCheckTokenProvider = class {
      constructor(appName_, appCheckProvider) {
        this.appName_ = appName_;
        this.appCheckProvider = appCheckProvider;
        this.appCheck = appCheckProvider === null || appCheckProvider === void 0 ? void 0 : appCheckProvider.getImmediate({ optional: true });
        if (!this.appCheck) {
          appCheckProvider === null || appCheckProvider === void 0 ? void 0 : appCheckProvider.get().then((appCheck) => this.appCheck = appCheck);
        }
      }
      getToken(forceRefresh) {
        if (!this.appCheck) {
          return new Promise((resolve2, reject) => {
            setTimeout(() => {
              if (this.appCheck) {
                this.getToken(forceRefresh).then(resolve2, reject);
              } else {
                resolve2(null);
              }
            }, 0);
          });
        }
        return this.appCheck.getToken(forceRefresh);
      }
      addTokenChangeListener(listener) {
        var _a2;
        (_a2 = this.appCheckProvider) === null || _a2 === void 0 ? void 0 : _a2.get().then((appCheck) => appCheck.addTokenListener(listener));
      }
      notifyForInvalidToken() {
        warn(`Provided AppCheck credentials for the app named "${this.appName_}" are invalid. This usually indicates your app was not initialized correctly.`);
      }
    };
    FirebaseAuthTokenProvider = class {
      constructor(appName_, firebaseOptions_, authProvider_) {
        this.appName_ = appName_;
        this.firebaseOptions_ = firebaseOptions_;
        this.authProvider_ = authProvider_;
        this.auth_ = null;
        this.auth_ = authProvider_.getImmediate({ optional: true });
        if (!this.auth_) {
          authProvider_.onInit((auth) => this.auth_ = auth);
        }
      }
      getToken(forceRefresh) {
        if (!this.auth_) {
          return new Promise((resolve2, reject) => {
            setTimeout(() => {
              if (this.auth_) {
                this.getToken(forceRefresh).then(resolve2, reject);
              } else {
                resolve2(null);
              }
            }, 0);
          });
        }
        return this.auth_.getToken(forceRefresh).catch((error22) => {
          if (error22 && error22.code === "auth/token-not-initialized") {
            log("Got auth/token-not-initialized error.  Treating as null token.");
            return null;
          } else {
            return Promise.reject(error22);
          }
        });
      }
      addTokenChangeListener(listener) {
        if (this.auth_) {
          this.auth_.addAuthTokenListener(listener);
        } else {
          this.authProvider_.get().then((auth) => auth.addAuthTokenListener(listener));
        }
      }
      removeTokenChangeListener(listener) {
        this.authProvider_.get().then((auth) => auth.removeAuthTokenListener(listener));
      }
      notifyForInvalidToken() {
        let errorMessage = 'Provided authentication credentials for the app named "' + this.appName_ + '" are invalid. This usually indicates your app was not initialized correctly. ';
        if ("credential" in this.firebaseOptions_) {
          errorMessage += 'Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.';
        } else if ("serviceAccount" in this.firebaseOptions_) {
          errorMessage += 'Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.';
        } else {
          errorMessage += 'Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.';
        }
        warn(errorMessage);
      }
    };
    EmulatorTokenProvider = class {
      constructor(accessToken) {
        this.accessToken = accessToken;
      }
      getToken(forceRefresh) {
        return Promise.resolve({
          accessToken: this.accessToken
        });
      }
      addTokenChangeListener(listener) {
        listener(this.accessToken);
      }
      removeTokenChangeListener(listener) {
      }
      notifyForInvalidToken() {
      }
    };
    EmulatorTokenProvider.OWNER = "owner";
    PacketReceiver = class {
      constructor(onMessage_) {
        this.onMessage_ = onMessage_;
        this.pendingResponses = [];
        this.currentResponseNum = 0;
        this.closeAfterResponse = -1;
        this.onClose = null;
      }
      closeAfter(responseNum, callback) {
        this.closeAfterResponse = responseNum;
        this.onClose = callback;
        if (this.closeAfterResponse < this.currentResponseNum) {
          this.onClose();
          this.onClose = null;
        }
      }
      handleResponse(requestNum, data) {
        this.pendingResponses[requestNum] = data;
        while (this.pendingResponses[this.currentResponseNum]) {
          const toProcess = this.pendingResponses[this.currentResponseNum];
          delete this.pendingResponses[this.currentResponseNum];
          for (let i = 0; i < toProcess.length; ++i) {
            if (toProcess[i]) {
              exceptionGuard(() => {
                this.onMessage_(toProcess[i]);
              });
            }
          }
          if (this.currentResponseNum === this.closeAfterResponse) {
            if (this.onClose) {
              this.onClose();
              this.onClose = null;
            }
            break;
          }
          this.currentResponseNum++;
        }
      }
    };
    FIREBASE_LONGPOLL_START_PARAM = "start";
    FIREBASE_LONGPOLL_CLOSE_COMMAND = "close";
    FIREBASE_LONGPOLL_COMMAND_CB_NAME = "pLPCommand";
    FIREBASE_LONGPOLL_DATA_CB_NAME = "pRTLPCB";
    FIREBASE_LONGPOLL_ID_PARAM = "id";
    FIREBASE_LONGPOLL_PW_PARAM = "pw";
    FIREBASE_LONGPOLL_SERIAL_PARAM = "ser";
    FIREBASE_LONGPOLL_CALLBACK_ID_PARAM = "cb";
    FIREBASE_LONGPOLL_SEGMENT_NUM_PARAM = "seg";
    FIREBASE_LONGPOLL_SEGMENTS_IN_PACKET = "ts";
    FIREBASE_LONGPOLL_DATA_PARAM = "d";
    FIREBASE_LONGPOLL_DISCONN_FRAME_REQUEST_PARAM = "dframe";
    MAX_URL_DATA_SIZE = 1870;
    SEG_HEADER_SIZE = 30;
    MAX_PAYLOAD_SIZE = MAX_URL_DATA_SIZE - SEG_HEADER_SIZE;
    KEEPALIVE_REQUEST_INTERVAL = 25e3;
    LP_CONNECT_TIMEOUT = 3e4;
    BrowserPollConnection = class {
      constructor(connId, repoInfo, applicationId, appCheckToken, authToken, transportSessionId, lastSessionId) {
        this.connId = connId;
        this.repoInfo = repoInfo;
        this.applicationId = applicationId;
        this.appCheckToken = appCheckToken;
        this.authToken = authToken;
        this.transportSessionId = transportSessionId;
        this.lastSessionId = lastSessionId;
        this.bytesSent = 0;
        this.bytesReceived = 0;
        this.everConnected_ = false;
        this.log_ = logWrapper(connId);
        this.stats_ = statsManagerGetCollection(repoInfo);
        this.urlFn = (params) => {
          if (this.appCheckToken) {
            params[APP_CHECK_TOKEN_PARAM] = this.appCheckToken;
          }
          return repoInfoConnectionURL(repoInfo, LONG_POLLING, params);
        };
      }
      open(onMessage, onDisconnect) {
        this.curSegmentNum = 0;
        this.onDisconnect_ = onDisconnect;
        this.myPacketOrderer = new PacketReceiver(onMessage);
        this.isClosed_ = false;
        this.connectTimeoutTimer_ = setTimeout(() => {
          this.log_("Timed out trying to connect.");
          this.onClosed_();
          this.connectTimeoutTimer_ = null;
        }, Math.floor(LP_CONNECT_TIMEOUT));
        executeWhenDOMReady(() => {
          if (this.isClosed_) {
            return;
          }
          this.scriptTagHolder = new FirebaseIFrameScriptHolder((...args) => {
            const [command, arg1, arg2, arg3, arg4] = args;
            this.incrementIncomingBytes_(args);
            if (!this.scriptTagHolder) {
              return;
            }
            if (this.connectTimeoutTimer_) {
              clearTimeout(this.connectTimeoutTimer_);
              this.connectTimeoutTimer_ = null;
            }
            this.everConnected_ = true;
            if (command === FIREBASE_LONGPOLL_START_PARAM) {
              this.id = arg1;
              this.password = arg2;
            } else if (command === FIREBASE_LONGPOLL_CLOSE_COMMAND) {
              if (arg1) {
                this.scriptTagHolder.sendNewPolls = false;
                this.myPacketOrderer.closeAfter(arg1, () => {
                  this.onClosed_();
                });
              } else {
                this.onClosed_();
              }
            } else {
              throw new Error("Unrecognized command received: " + command);
            }
          }, (...args) => {
            const [pN, data] = args;
            this.incrementIncomingBytes_(args);
            this.myPacketOrderer.handleResponse(pN, data);
          }, () => {
            this.onClosed_();
          }, this.urlFn);
          const urlParams = {};
          urlParams[FIREBASE_LONGPOLL_START_PARAM] = "t";
          urlParams[FIREBASE_LONGPOLL_SERIAL_PARAM] = Math.floor(Math.random() * 1e8);
          if (this.scriptTagHolder.uniqueCallbackIdentifier) {
            urlParams[FIREBASE_LONGPOLL_CALLBACK_ID_PARAM] = this.scriptTagHolder.uniqueCallbackIdentifier;
          }
          urlParams[VERSION_PARAM] = PROTOCOL_VERSION;
          if (this.transportSessionId) {
            urlParams[TRANSPORT_SESSION_PARAM] = this.transportSessionId;
          }
          if (this.lastSessionId) {
            urlParams[LAST_SESSION_PARAM] = this.lastSessionId;
          }
          if (this.applicationId) {
            urlParams[APPLICATION_ID_PARAM] = this.applicationId;
          }
          if (this.appCheckToken) {
            urlParams[APP_CHECK_TOKEN_PARAM] = this.appCheckToken;
          }
          if (typeof location !== "undefined" && location.hostname && FORGE_DOMAIN_RE.test(location.hostname)) {
            urlParams[REFERER_PARAM] = FORGE_REF;
          }
          const connectURL = this.urlFn(urlParams);
          this.log_("Connecting via long-poll to " + connectURL);
          this.scriptTagHolder.addTag(connectURL, () => {
          });
        });
      }
      start() {
        this.scriptTagHolder.startLongPoll(this.id, this.password);
        this.addDisconnectPingFrame(this.id, this.password);
      }
      static forceAllow() {
        BrowserPollConnection.forceAllow_ = true;
      }
      static forceDisallow() {
        BrowserPollConnection.forceDisallow_ = true;
      }
      static isAvailable() {
        if (isNodeSdk()) {
          return false;
        } else if (BrowserPollConnection.forceAllow_) {
          return true;
        } else {
          return !BrowserPollConnection.forceDisallow_ && typeof document !== "undefined" && document.createElement != null && !isChromeExtensionContentScript() && !isWindowsStoreApp();
        }
      }
      markConnectionHealthy() {
      }
      shutdown_() {
        this.isClosed_ = true;
        if (this.scriptTagHolder) {
          this.scriptTagHolder.close();
          this.scriptTagHolder = null;
        }
        if (this.myDisconnFrame) {
          document.body.removeChild(this.myDisconnFrame);
          this.myDisconnFrame = null;
        }
        if (this.connectTimeoutTimer_) {
          clearTimeout(this.connectTimeoutTimer_);
          this.connectTimeoutTimer_ = null;
        }
      }
      onClosed_() {
        if (!this.isClosed_) {
          this.log_("Longpoll is closing itself");
          this.shutdown_();
          if (this.onDisconnect_) {
            this.onDisconnect_(this.everConnected_);
            this.onDisconnect_ = null;
          }
        }
      }
      close() {
        if (!this.isClosed_) {
          this.log_("Longpoll is being closed.");
          this.shutdown_();
        }
      }
      send(data) {
        const dataStr = stringify(data);
        this.bytesSent += dataStr.length;
        this.stats_.incrementCounter("bytes_sent", dataStr.length);
        const base64data = base64Encode(dataStr);
        const dataSegs = splitStringBySize(base64data, MAX_PAYLOAD_SIZE);
        for (let i = 0; i < dataSegs.length; i++) {
          this.scriptTagHolder.enqueueSegment(this.curSegmentNum, dataSegs.length, dataSegs[i]);
          this.curSegmentNum++;
        }
      }
      addDisconnectPingFrame(id, pw) {
        if (isNodeSdk()) {
          return;
        }
        this.myDisconnFrame = document.createElement("iframe");
        const urlParams = {};
        urlParams[FIREBASE_LONGPOLL_DISCONN_FRAME_REQUEST_PARAM] = "t";
        urlParams[FIREBASE_LONGPOLL_ID_PARAM] = id;
        urlParams[FIREBASE_LONGPOLL_PW_PARAM] = pw;
        this.myDisconnFrame.src = this.urlFn(urlParams);
        this.myDisconnFrame.style.display = "none";
        document.body.appendChild(this.myDisconnFrame);
      }
      incrementIncomingBytes_(args) {
        const bytesReceived = stringify(args).length;
        this.bytesReceived += bytesReceived;
        this.stats_.incrementCounter("bytes_received", bytesReceived);
      }
    };
    FirebaseIFrameScriptHolder = class {
      constructor(commandCB, onMessageCB, onDisconnect, urlFn) {
        this.onDisconnect = onDisconnect;
        this.urlFn = urlFn;
        this.outstandingRequests = new Set();
        this.pendingSegs = [];
        this.currentSerial = Math.floor(Math.random() * 1e8);
        this.sendNewPolls = true;
        if (!isNodeSdk()) {
          this.uniqueCallbackIdentifier = LUIDGenerator();
          window[FIREBASE_LONGPOLL_COMMAND_CB_NAME + this.uniqueCallbackIdentifier] = commandCB;
          window[FIREBASE_LONGPOLL_DATA_CB_NAME + this.uniqueCallbackIdentifier] = onMessageCB;
          this.myIFrame = FirebaseIFrameScriptHolder.createIFrame_();
          let script = "";
          if (this.myIFrame.src && this.myIFrame.src.substr(0, "javascript:".length) === "javascript:") {
            const currentDomain = document.domain;
            script = '<script>document.domain="' + currentDomain + '";<\/script>';
          }
          const iframeContents = "<html><body>" + script + "</body></html>";
          try {
            this.myIFrame.doc.open();
            this.myIFrame.doc.write(iframeContents);
            this.myIFrame.doc.close();
          } catch (e) {
            log("frame writing exception");
            if (e.stack) {
              log(e.stack);
            }
            log(e);
          }
        } else {
          this.commandCB = commandCB;
          this.onMessageCB = onMessageCB;
        }
      }
      static createIFrame_() {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        if (document.body) {
          document.body.appendChild(iframe);
          try {
            const a = iframe.contentWindow.document;
            if (!a) {
              log("No IE domain setting required");
            }
          } catch (e) {
            const domain = document.domain;
            iframe.src = "javascript:void((function(){document.open();document.domain='" + domain + "';document.close();})())";
          }
        } else {
          throw "Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
        }
        if (iframe.contentDocument) {
          iframe.doc = iframe.contentDocument;
        } else if (iframe.contentWindow) {
          iframe.doc = iframe.contentWindow.document;
        } else if (iframe.document) {
          iframe.doc = iframe.document;
        }
        return iframe;
      }
      close() {
        this.alive = false;
        if (this.myIFrame) {
          this.myIFrame.doc.body.innerHTML = "";
          setTimeout(() => {
            if (this.myIFrame !== null) {
              document.body.removeChild(this.myIFrame);
              this.myIFrame = null;
            }
          }, Math.floor(0));
        }
        const onDisconnect = this.onDisconnect;
        if (onDisconnect) {
          this.onDisconnect = null;
          onDisconnect();
        }
      }
      startLongPoll(id, pw) {
        this.myID = id;
        this.myPW = pw;
        this.alive = true;
        while (this.newRequest_()) {
        }
      }
      newRequest_() {
        if (this.alive && this.sendNewPolls && this.outstandingRequests.size < (this.pendingSegs.length > 0 ? 2 : 1)) {
          this.currentSerial++;
          const urlParams = {};
          urlParams[FIREBASE_LONGPOLL_ID_PARAM] = this.myID;
          urlParams[FIREBASE_LONGPOLL_PW_PARAM] = this.myPW;
          urlParams[FIREBASE_LONGPOLL_SERIAL_PARAM] = this.currentSerial;
          let theURL = this.urlFn(urlParams);
          let curDataString = "";
          let i = 0;
          while (this.pendingSegs.length > 0) {
            const nextSeg = this.pendingSegs[0];
            if (nextSeg.d.length + SEG_HEADER_SIZE + curDataString.length <= MAX_URL_DATA_SIZE) {
              const theSeg = this.pendingSegs.shift();
              curDataString = curDataString + "&" + FIREBASE_LONGPOLL_SEGMENT_NUM_PARAM + i + "=" + theSeg.seg + "&" + FIREBASE_LONGPOLL_SEGMENTS_IN_PACKET + i + "=" + theSeg.ts + "&" + FIREBASE_LONGPOLL_DATA_PARAM + i + "=" + theSeg.d;
              i++;
            } else {
              break;
            }
          }
          theURL = theURL + curDataString;
          this.addLongPollTag_(theURL, this.currentSerial);
          return true;
        } else {
          return false;
        }
      }
      enqueueSegment(segnum, totalsegs, data) {
        this.pendingSegs.push({ seg: segnum, ts: totalsegs, d: data });
        if (this.alive) {
          this.newRequest_();
        }
      }
      addLongPollTag_(url2, serial) {
        this.outstandingRequests.add(serial);
        const doNewRequest = () => {
          this.outstandingRequests.delete(serial);
          this.newRequest_();
        };
        const keepaliveTimeout = setTimeout(doNewRequest, Math.floor(KEEPALIVE_REQUEST_INTERVAL));
        const readyStateCB = () => {
          clearTimeout(keepaliveTimeout);
          doNewRequest();
        };
        this.addTag(url2, readyStateCB);
      }
      addTag(url2, loadCB) {
        if (isNodeSdk()) {
          this.doNodeLongPoll(url2, loadCB);
        } else {
          setTimeout(() => {
            try {
              if (!this.sendNewPolls) {
                return;
              }
              const newScript = this.myIFrame.doc.createElement("script");
              newScript.type = "text/javascript";
              newScript.async = true;
              newScript.src = url2;
              newScript.onload = newScript.onreadystatechange = function() {
                const rstate = newScript.readyState;
                if (!rstate || rstate === "loaded" || rstate === "complete") {
                  newScript.onload = newScript.onreadystatechange = null;
                  if (newScript.parentNode) {
                    newScript.parentNode.removeChild(newScript);
                  }
                  loadCB();
                }
              };
              newScript.onerror = () => {
                log("Long-poll script failed to load: " + url2);
                this.sendNewPolls = false;
                this.close();
              };
              this.myIFrame.doc.body.appendChild(newScript);
            } catch (e) {
            }
          }, Math.floor(1));
        }
      }
    };
    TransportManager = class {
      constructor(repoInfo) {
        this.initTransports_(repoInfo);
      }
      static get ALL_TRANSPORTS() {
        return [BrowserPollConnection, WebSocketConnection];
      }
      initTransports_(repoInfo) {
        const isWebSocketsAvailable = WebSocketConnection && WebSocketConnection["isAvailable"]();
        let isSkipPollConnection = isWebSocketsAvailable && !WebSocketConnection.previouslyFailed();
        if (repoInfo.webSocketOnly) {
          if (!isWebSocketsAvailable) {
            warn("wss:// URL used, but browser isn't known to support websockets.  Trying anyway.");
          }
          isSkipPollConnection = true;
        }
        if (isSkipPollConnection) {
          this.transports_ = [WebSocketConnection];
        } else {
          const transports = this.transports_ = [];
          for (const transport of TransportManager.ALL_TRANSPORTS) {
            if (transport && transport["isAvailable"]()) {
              transports.push(transport);
            }
          }
        }
      }
      initialTransport() {
        if (this.transports_.length > 0) {
          return this.transports_[0];
        } else {
          throw new Error("No transports available");
        }
      }
      upgradeTransport() {
        if (this.transports_.length > 1) {
          return this.transports_[1];
        } else {
          return null;
        }
      }
    };
    UPGRADE_TIMEOUT = 6e4;
    DELAY_BEFORE_SENDING_EXTRA_REQUESTS = 5e3;
    BYTES_SENT_HEALTHY_OVERRIDE = 10 * 1024;
    BYTES_RECEIVED_HEALTHY_OVERRIDE = 100 * 1024;
    MESSAGE_TYPE = "t";
    MESSAGE_DATA = "d";
    CONTROL_SHUTDOWN = "s";
    CONTROL_RESET = "r";
    CONTROL_ERROR = "e";
    CONTROL_PONG = "o";
    SWITCH_ACK = "a";
    END_TRANSMISSION = "n";
    PING = "p";
    SERVER_HELLO = "h";
    Connection = class {
      constructor(id, repoInfo_, applicationId_, appCheckToken_, authToken_, onMessage_, onReady_, onDisconnect_, onKill_, lastSessionId) {
        this.id = id;
        this.repoInfo_ = repoInfo_;
        this.applicationId_ = applicationId_;
        this.appCheckToken_ = appCheckToken_;
        this.authToken_ = authToken_;
        this.onMessage_ = onMessage_;
        this.onReady_ = onReady_;
        this.onDisconnect_ = onDisconnect_;
        this.onKill_ = onKill_;
        this.lastSessionId = lastSessionId;
        this.connectionCount = 0;
        this.pendingDataMessages = [];
        this.state_ = 0;
        this.log_ = logWrapper("c:" + this.id + ":");
        this.transportManager_ = new TransportManager(repoInfo_);
        this.log_("Connection created");
        this.start_();
      }
      start_() {
        const conn = this.transportManager_.initialTransport();
        this.conn_ = new conn(this.nextTransportId_(), this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, null, this.lastSessionId);
        this.primaryResponsesRequired_ = conn["responsesRequiredToBeHealthy"] || 0;
        const onMessageReceived = this.connReceiver_(this.conn_);
        const onConnectionLost = this.disconnReceiver_(this.conn_);
        this.tx_ = this.conn_;
        this.rx_ = this.conn_;
        this.secondaryConn_ = null;
        this.isHealthy_ = false;
        setTimeout(() => {
          this.conn_ && this.conn_.open(onMessageReceived, onConnectionLost);
        }, Math.floor(0));
        const healthyTimeoutMS = conn["healthyTimeout"] || 0;
        if (healthyTimeoutMS > 0) {
          this.healthyTimeout_ = setTimeoutNonBlocking(() => {
            this.healthyTimeout_ = null;
            if (!this.isHealthy_) {
              if (this.conn_ && this.conn_.bytesReceived > BYTES_RECEIVED_HEALTHY_OVERRIDE) {
                this.log_("Connection exceeded healthy timeout but has received " + this.conn_.bytesReceived + " bytes.  Marking connection healthy.");
                this.isHealthy_ = true;
                this.conn_.markConnectionHealthy();
              } else if (this.conn_ && this.conn_.bytesSent > BYTES_SENT_HEALTHY_OVERRIDE) {
                this.log_("Connection exceeded healthy timeout but has sent " + this.conn_.bytesSent + " bytes.  Leaving connection alive.");
              } else {
                this.log_("Closing unhealthy connection after timeout.");
                this.close();
              }
            }
          }, Math.floor(healthyTimeoutMS));
        }
      }
      nextTransportId_() {
        return "c:" + this.id + ":" + this.connectionCount++;
      }
      disconnReceiver_(conn) {
        return (everConnected) => {
          if (conn === this.conn_) {
            this.onConnectionLost_(everConnected);
          } else if (conn === this.secondaryConn_) {
            this.log_("Secondary connection lost.");
            this.onSecondaryConnectionLost_();
          } else {
            this.log_("closing an old connection");
          }
        };
      }
      connReceiver_(conn) {
        return (message2) => {
          if (this.state_ !== 2) {
            if (conn === this.rx_) {
              this.onPrimaryMessageReceived_(message2);
            } else if (conn === this.secondaryConn_) {
              this.onSecondaryMessageReceived_(message2);
            } else {
              this.log_("message on old connection");
            }
          }
        };
      }
      sendRequest(dataMsg) {
        const msg = { t: "d", d: dataMsg };
        this.sendData_(msg);
      }
      tryCleanupConnection() {
        if (this.tx_ === this.secondaryConn_ && this.rx_ === this.secondaryConn_) {
          this.log_("cleaning up and promoting a connection: " + this.secondaryConn_.connId);
          this.conn_ = this.secondaryConn_;
          this.secondaryConn_ = null;
        }
      }
      onSecondaryControl_(controlData) {
        if (MESSAGE_TYPE in controlData) {
          const cmd = controlData[MESSAGE_TYPE];
          if (cmd === SWITCH_ACK) {
            this.upgradeIfSecondaryHealthy_();
          } else if (cmd === CONTROL_RESET) {
            this.log_("Got a reset on secondary, closing it");
            this.secondaryConn_.close();
            if (this.tx_ === this.secondaryConn_ || this.rx_ === this.secondaryConn_) {
              this.close();
            }
          } else if (cmd === CONTROL_PONG) {
            this.log_("got pong on secondary.");
            this.secondaryResponsesRequired_--;
            this.upgradeIfSecondaryHealthy_();
          }
        }
      }
      onSecondaryMessageReceived_(parsedData) {
        const layer = requireKey("t", parsedData);
        const data = requireKey("d", parsedData);
        if (layer === "c") {
          this.onSecondaryControl_(data);
        } else if (layer === "d") {
          this.pendingDataMessages.push(data);
        } else {
          throw new Error("Unknown protocol layer: " + layer);
        }
      }
      upgradeIfSecondaryHealthy_() {
        if (this.secondaryResponsesRequired_ <= 0) {
          this.log_("Secondary connection is healthy.");
          this.isHealthy_ = true;
          this.secondaryConn_.markConnectionHealthy();
          this.proceedWithUpgrade_();
        } else {
          this.log_("sending ping on secondary.");
          this.secondaryConn_.send({ t: "c", d: { t: PING, d: {} } });
        }
      }
      proceedWithUpgrade_() {
        this.secondaryConn_.start();
        this.log_("sending client ack on secondary");
        this.secondaryConn_.send({ t: "c", d: { t: SWITCH_ACK, d: {} } });
        this.log_("Ending transmission on primary");
        this.conn_.send({ t: "c", d: { t: END_TRANSMISSION, d: {} } });
        this.tx_ = this.secondaryConn_;
        this.tryCleanupConnection();
      }
      onPrimaryMessageReceived_(parsedData) {
        const layer = requireKey("t", parsedData);
        const data = requireKey("d", parsedData);
        if (layer === "c") {
          this.onControl_(data);
        } else if (layer === "d") {
          this.onDataMessage_(data);
        }
      }
      onDataMessage_(message2) {
        this.onPrimaryResponse_();
        this.onMessage_(message2);
      }
      onPrimaryResponse_() {
        if (!this.isHealthy_) {
          this.primaryResponsesRequired_--;
          if (this.primaryResponsesRequired_ <= 0) {
            this.log_("Primary connection is healthy.");
            this.isHealthy_ = true;
            this.conn_.markConnectionHealthy();
          }
        }
      }
      onControl_(controlData) {
        const cmd = requireKey(MESSAGE_TYPE, controlData);
        if (MESSAGE_DATA in controlData) {
          const payload = controlData[MESSAGE_DATA];
          if (cmd === SERVER_HELLO) {
            this.onHandshake_(payload);
          } else if (cmd === END_TRANSMISSION) {
            this.log_("recvd end transmission on primary");
            this.rx_ = this.secondaryConn_;
            for (let i = 0; i < this.pendingDataMessages.length; ++i) {
              this.onDataMessage_(this.pendingDataMessages[i]);
            }
            this.pendingDataMessages = [];
            this.tryCleanupConnection();
          } else if (cmd === CONTROL_SHUTDOWN) {
            this.onConnectionShutdown_(payload);
          } else if (cmd === CONTROL_RESET) {
            this.onReset_(payload);
          } else if (cmd === CONTROL_ERROR) {
            error("Server Error: " + payload);
          } else if (cmd === CONTROL_PONG) {
            this.log_("got pong on primary.");
            this.onPrimaryResponse_();
            this.sendPingOnPrimaryIfNecessary_();
          } else {
            error("Unknown control packet command: " + cmd);
          }
        }
      }
      onHandshake_(handshake) {
        const timestamp = handshake.ts;
        const version2 = handshake.v;
        const host = handshake.h;
        this.sessionId = handshake.s;
        this.repoInfo_.host = host;
        if (this.state_ === 0) {
          this.conn_.start();
          this.onConnectionEstablished_(this.conn_, timestamp);
          if (PROTOCOL_VERSION !== version2) {
            warn("Protocol version mismatch detected");
          }
          this.tryStartUpgrade_();
        }
      }
      tryStartUpgrade_() {
        const conn = this.transportManager_.upgradeTransport();
        if (conn) {
          this.startUpgrade_(conn);
        }
      }
      startUpgrade_(conn) {
        this.secondaryConn_ = new conn(this.nextTransportId_(), this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, this.sessionId);
        this.secondaryResponsesRequired_ = conn["responsesRequiredToBeHealthy"] || 0;
        const onMessage = this.connReceiver_(this.secondaryConn_);
        const onDisconnect = this.disconnReceiver_(this.secondaryConn_);
        this.secondaryConn_.open(onMessage, onDisconnect);
        setTimeoutNonBlocking(() => {
          if (this.secondaryConn_) {
            this.log_("Timed out trying to upgrade.");
            this.secondaryConn_.close();
          }
        }, Math.floor(UPGRADE_TIMEOUT));
      }
      onReset_(host) {
        this.log_("Reset packet received.  New host: " + host);
        this.repoInfo_.host = host;
        if (this.state_ === 1) {
          this.close();
        } else {
          this.closeConnections_();
          this.start_();
        }
      }
      onConnectionEstablished_(conn, timestamp) {
        this.log_("Realtime connection established.");
        this.conn_ = conn;
        this.state_ = 1;
        if (this.onReady_) {
          this.onReady_(timestamp, this.sessionId);
          this.onReady_ = null;
        }
        if (this.primaryResponsesRequired_ === 0) {
          this.log_("Primary connection is healthy.");
          this.isHealthy_ = true;
        } else {
          setTimeoutNonBlocking(() => {
            this.sendPingOnPrimaryIfNecessary_();
          }, Math.floor(DELAY_BEFORE_SENDING_EXTRA_REQUESTS));
        }
      }
      sendPingOnPrimaryIfNecessary_() {
        if (!this.isHealthy_ && this.state_ === 1) {
          this.log_("sending ping on primary.");
          this.sendData_({ t: "c", d: { t: PING, d: {} } });
        }
      }
      onSecondaryConnectionLost_() {
        const conn = this.secondaryConn_;
        this.secondaryConn_ = null;
        if (this.tx_ === conn || this.rx_ === conn) {
          this.close();
        }
      }
      onConnectionLost_(everConnected) {
        this.conn_ = null;
        if (!everConnected && this.state_ === 0) {
          this.log_("Realtime connection failed.");
          if (this.repoInfo_.isCacheableHost()) {
            PersistentStorage.remove("host:" + this.repoInfo_.host);
            this.repoInfo_.internalHost = this.repoInfo_.host;
          }
        } else if (this.state_ === 1) {
          this.log_("Realtime connection lost.");
        }
        this.close();
      }
      onConnectionShutdown_(reason) {
        this.log_("Connection shutdown command received. Shutting down...");
        if (this.onKill_) {
          this.onKill_(reason);
          this.onKill_ = null;
        }
        this.onDisconnect_ = null;
        this.close();
      }
      sendData_(data) {
        if (this.state_ !== 1) {
          throw "Connection is not connected";
        } else {
          this.tx_.send(data);
        }
      }
      close() {
        if (this.state_ !== 2) {
          this.log_("Closing realtime connection.");
          this.state_ = 2;
          this.closeConnections_();
          if (this.onDisconnect_) {
            this.onDisconnect_();
            this.onDisconnect_ = null;
          }
        }
      }
      closeConnections_() {
        this.log_("Shutting down all connections");
        if (this.conn_) {
          this.conn_.close();
          this.conn_ = null;
        }
        if (this.secondaryConn_) {
          this.secondaryConn_.close();
          this.secondaryConn_ = null;
        }
        if (this.healthyTimeout_) {
          clearTimeout(this.healthyTimeout_);
          this.healthyTimeout_ = null;
        }
      }
    };
    ServerActions = class {
      put(pathString, data, onComplete, hash2) {
      }
      merge(pathString, data, onComplete, hash2) {
      }
      refreshAuthToken(token) {
      }
      refreshAppCheckToken(token) {
      }
      onDisconnectPut(pathString, data, onComplete) {
      }
      onDisconnectMerge(pathString, data, onComplete) {
      }
      onDisconnectCancel(pathString, onComplete) {
      }
      reportStats(stats) {
      }
    };
    EventEmitter = class {
      constructor(allowedEvents_) {
        this.allowedEvents_ = allowedEvents_;
        this.listeners_ = {};
        assert$1(Array.isArray(allowedEvents_) && allowedEvents_.length > 0, "Requires a non-empty array");
      }
      trigger(eventType, ...varArgs) {
        if (Array.isArray(this.listeners_[eventType])) {
          const listeners = [...this.listeners_[eventType]];
          for (let i = 0; i < listeners.length; i++) {
            listeners[i].callback.apply(listeners[i].context, varArgs);
          }
        }
      }
      on(eventType, callback, context) {
        this.validateEventType_(eventType);
        this.listeners_[eventType] = this.listeners_[eventType] || [];
        this.listeners_[eventType].push({ callback, context });
        const eventData = this.getInitialEvent(eventType);
        if (eventData) {
          callback.apply(context, eventData);
        }
      }
      off(eventType, callback, context) {
        this.validateEventType_(eventType);
        const listeners = this.listeners_[eventType] || [];
        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i].callback === callback && (!context || context === listeners[i].context)) {
            listeners.splice(i, 1);
            return;
          }
        }
      }
      validateEventType_(eventType) {
        assert$1(this.allowedEvents_.find((et) => {
          return et === eventType;
        }), "Unknown event: " + eventType);
      }
    };
    OnlineMonitor = class extends EventEmitter {
      constructor() {
        super(["online"]);
        this.online_ = true;
        if (typeof window !== "undefined" && typeof window.addEventListener !== "undefined" && !isMobileCordova()) {
          window.addEventListener("online", () => {
            if (!this.online_) {
              this.online_ = true;
              this.trigger("online", true);
            }
          }, false);
          window.addEventListener("offline", () => {
            if (this.online_) {
              this.online_ = false;
              this.trigger("online", false);
            }
          }, false);
        }
      }
      static getInstance() {
        return new OnlineMonitor();
      }
      getInitialEvent(eventType) {
        assert$1(eventType === "online", "Unknown event type: " + eventType);
        return [this.online_];
      }
      currentlyOnline() {
        return this.online_;
      }
    };
    MAX_PATH_DEPTH = 32;
    MAX_PATH_LENGTH_BYTES = 768;
    Path = class {
      constructor(pathOrString, pieceNum) {
        if (pieceNum === void 0) {
          this.pieces_ = pathOrString.split("/");
          let copyTo = 0;
          for (let i = 0; i < this.pieces_.length; i++) {
            if (this.pieces_[i].length > 0) {
              this.pieces_[copyTo] = this.pieces_[i];
              copyTo++;
            }
          }
          this.pieces_.length = copyTo;
          this.pieceNum_ = 0;
        } else {
          this.pieces_ = pathOrString;
          this.pieceNum_ = pieceNum;
        }
      }
      toString() {
        let pathString = "";
        for (let i = this.pieceNum_; i < this.pieces_.length; i++) {
          if (this.pieces_[i] !== "") {
            pathString += "/" + this.pieces_[i];
          }
        }
        return pathString || "/";
      }
    };
    ValidationPath = class {
      constructor(path, errorPrefix_) {
        this.errorPrefix_ = errorPrefix_;
        this.parts_ = pathSlice(path, 0);
        this.byteLength_ = Math.max(1, this.parts_.length);
        for (let i = 0; i < this.parts_.length; i++) {
          this.byteLength_ += stringLength(this.parts_[i]);
        }
        validationPathCheckValid(this);
      }
    };
    VisibilityMonitor = class extends EventEmitter {
      constructor() {
        super(["visible"]);
        let hidden;
        let visibilityChange;
        if (typeof document !== "undefined" && typeof document.addEventListener !== "undefined") {
          if (typeof document["hidden"] !== "undefined") {
            visibilityChange = "visibilitychange";
            hidden = "hidden";
          } else if (typeof document["mozHidden"] !== "undefined") {
            visibilityChange = "mozvisibilitychange";
            hidden = "mozHidden";
          } else if (typeof document["msHidden"] !== "undefined") {
            visibilityChange = "msvisibilitychange";
            hidden = "msHidden";
          } else if (typeof document["webkitHidden"] !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
            hidden = "webkitHidden";
          }
        }
        this.visible_ = true;
        if (visibilityChange) {
          document.addEventListener(visibilityChange, () => {
            const visible = !document[hidden];
            if (visible !== this.visible_) {
              this.visible_ = visible;
              this.trigger("visible", visible);
            }
          }, false);
        }
      }
      static getInstance() {
        return new VisibilityMonitor();
      }
      getInitialEvent(eventType) {
        assert$1(eventType === "visible", "Unknown event type: " + eventType);
        return [this.visible_];
      }
    };
    RECONNECT_MIN_DELAY = 1e3;
    RECONNECT_MAX_DELAY_DEFAULT = 60 * 5 * 1e3;
    GET_CONNECT_TIMEOUT = 3 * 1e3;
    RECONNECT_MAX_DELAY_FOR_ADMINS = 30 * 1e3;
    RECONNECT_DELAY_MULTIPLIER = 1.3;
    RECONNECT_DELAY_RESET_TIMEOUT = 3e4;
    SERVER_KILL_INTERRUPT_REASON = "server_kill";
    INVALID_TOKEN_THRESHOLD = 3;
    PersistentConnection = class extends ServerActions {
      constructor(repoInfo_, applicationId_, onDataUpdate_, onConnectStatus_, onServerInfoUpdate_, authTokenProvider_, appCheckTokenProvider_, authOverride_) {
        super();
        this.repoInfo_ = repoInfo_;
        this.applicationId_ = applicationId_;
        this.onDataUpdate_ = onDataUpdate_;
        this.onConnectStatus_ = onConnectStatus_;
        this.onServerInfoUpdate_ = onServerInfoUpdate_;
        this.authTokenProvider_ = authTokenProvider_;
        this.appCheckTokenProvider_ = appCheckTokenProvider_;
        this.authOverride_ = authOverride_;
        this.id = PersistentConnection.nextPersistentConnectionId_++;
        this.log_ = logWrapper("p:" + this.id + ":");
        this.interruptReasons_ = {};
        this.listens = new Map();
        this.outstandingPuts_ = [];
        this.outstandingGets_ = [];
        this.outstandingPutCount_ = 0;
        this.outstandingGetCount_ = 0;
        this.onDisconnectRequestQueue_ = [];
        this.connected_ = false;
        this.reconnectDelay_ = RECONNECT_MIN_DELAY;
        this.maxReconnectDelay_ = RECONNECT_MAX_DELAY_DEFAULT;
        this.securityDebugCallback_ = null;
        this.lastSessionId = null;
        this.establishConnectionTimer_ = null;
        this.visible_ = false;
        this.requestCBHash_ = {};
        this.requestNumber_ = 0;
        this.realtime_ = null;
        this.authToken_ = null;
        this.appCheckToken_ = null;
        this.forceTokenRefresh_ = false;
        this.invalidAuthTokenCount_ = 0;
        this.invalidAppCheckTokenCount_ = 0;
        this.firstConnection_ = true;
        this.lastConnectionAttemptTime_ = null;
        this.lastConnectionEstablishedTime_ = null;
        if (authOverride_ && !isNodeSdk()) {
          throw new Error("Auth override specified in options, but not supported on non Node.js platforms");
        }
        VisibilityMonitor.getInstance().on("visible", this.onVisible_, this);
        if (repoInfo_.host.indexOf("fblocal") === -1) {
          OnlineMonitor.getInstance().on("online", this.onOnline_, this);
        }
      }
      sendRequest(action, body, onResponse) {
        const curReqNum = ++this.requestNumber_;
        const msg = { r: curReqNum, a: action, b: body };
        this.log_(stringify(msg));
        assert$1(this.connected_, "sendRequest call when we're not connected not allowed.");
        this.realtime_.sendRequest(msg);
        if (onResponse) {
          this.requestCBHash_[curReqNum] = onResponse;
        }
      }
      get(query) {
        this.initConnection_();
        const deferred = new Deferred();
        const request = {
          p: query._path.toString(),
          q: query._queryObject
        };
        const outstandingGet = {
          action: "g",
          request,
          onComplete: (message2) => {
            const payload = message2["d"];
            if (message2["s"] === "ok") {
              this.onDataUpdate_(request["p"], payload, false, null);
              deferred.resolve(payload);
            } else {
              deferred.reject(payload);
            }
          }
        };
        this.outstandingGets_.push(outstandingGet);
        this.outstandingGetCount_++;
        const index = this.outstandingGets_.length - 1;
        if (!this.connected_) {
          setTimeout(() => {
            const get = this.outstandingGets_[index];
            if (get === void 0 || outstandingGet !== get) {
              return;
            }
            delete this.outstandingGets_[index];
            this.outstandingGetCount_--;
            if (this.outstandingGetCount_ === 0) {
              this.outstandingGets_ = [];
            }
            this.log_("get " + index + " timed out on connection");
            deferred.reject(new Error("Client is offline."));
          }, GET_CONNECT_TIMEOUT);
        }
        if (this.connected_) {
          this.sendGet_(index);
        }
        return deferred.promise;
      }
      listen(query, currentHashFn, tag, onComplete) {
        this.initConnection_();
        const queryId = query._queryIdentifier;
        const pathString = query._path.toString();
        this.log_("Listen called for " + pathString + " " + queryId);
        if (!this.listens.has(pathString)) {
          this.listens.set(pathString, new Map());
        }
        assert$1(query._queryParams.isDefault() || !query._queryParams.loadsAllData(), "listen() called for non-default but complete query");
        assert$1(!this.listens.get(pathString).has(queryId), "listen() called twice for same path/queryId.");
        const listenSpec = {
          onComplete,
          hashFn: currentHashFn,
          query,
          tag
        };
        this.listens.get(pathString).set(queryId, listenSpec);
        if (this.connected_) {
          this.sendListen_(listenSpec);
        }
      }
      sendGet_(index) {
        const get = this.outstandingGets_[index];
        this.sendRequest("g", get.request, (message2) => {
          delete this.outstandingGets_[index];
          this.outstandingGetCount_--;
          if (this.outstandingGetCount_ === 0) {
            this.outstandingGets_ = [];
          }
          if (get.onComplete) {
            get.onComplete(message2);
          }
        });
      }
      sendListen_(listenSpec) {
        const query = listenSpec.query;
        const pathString = query._path.toString();
        const queryId = query._queryIdentifier;
        this.log_("Listen on " + pathString + " for " + queryId);
        const req = { p: pathString };
        const action = "q";
        if (listenSpec.tag) {
          req["q"] = query._queryObject;
          req["t"] = listenSpec.tag;
        }
        req["h"] = listenSpec.hashFn();
        this.sendRequest(action, req, (message2) => {
          const payload = message2["d"];
          const status = message2["s"];
          PersistentConnection.warnOnListenWarnings_(payload, query);
          const currentListenSpec = this.listens.get(pathString) && this.listens.get(pathString).get(queryId);
          if (currentListenSpec === listenSpec) {
            this.log_("listen response", message2);
            if (status !== "ok") {
              this.removeListen_(pathString, queryId);
            }
            if (listenSpec.onComplete) {
              listenSpec.onComplete(status, payload);
            }
          }
        });
      }
      static warnOnListenWarnings_(payload, query) {
        if (payload && typeof payload === "object" && contains(payload, "w")) {
          const warnings = safeGet(payload, "w");
          if (Array.isArray(warnings) && ~warnings.indexOf("no_index")) {
            const indexSpec = '".indexOn": "' + query._queryParams.getIndex().toString() + '"';
            const indexPath = query._path.toString();
            warn(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${indexSpec} at ${indexPath} to your security rules for better performance.`);
          }
        }
      }
      refreshAuthToken(token) {
        this.authToken_ = token;
        this.log_("Auth token refreshed");
        if (this.authToken_) {
          this.tryAuth();
        } else {
          if (this.connected_) {
            this.sendRequest("unauth", {}, () => {
            });
          }
        }
        this.reduceReconnectDelayIfAdminCredential_(token);
      }
      reduceReconnectDelayIfAdminCredential_(credential) {
        const isFirebaseSecret = credential && credential.length === 40;
        if (isFirebaseSecret || isAdmin(credential)) {
          this.log_("Admin auth credential detected.  Reducing max reconnect time.");
          this.maxReconnectDelay_ = RECONNECT_MAX_DELAY_FOR_ADMINS;
        }
      }
      refreshAppCheckToken(token) {
        this.appCheckToken_ = token;
        this.log_("App check token refreshed");
        if (this.appCheckToken_) {
          this.tryAppCheck();
        } else {
          if (this.connected_) {
            this.sendRequest("unappeck", {}, () => {
            });
          }
        }
      }
      tryAuth() {
        if (this.connected_ && this.authToken_) {
          const token = this.authToken_;
          const authMethod = isValidFormat(token) ? "auth" : "gauth";
          const requestData = { cred: token };
          if (this.authOverride_ === null) {
            requestData["noauth"] = true;
          } else if (typeof this.authOverride_ === "object") {
            requestData["authvar"] = this.authOverride_;
          }
          this.sendRequest(authMethod, requestData, (res) => {
            const status = res["s"];
            const data = res["d"] || "error";
            if (this.authToken_ === token) {
              if (status === "ok") {
                this.invalidAuthTokenCount_ = 0;
              } else {
                this.onAuthRevoked_(status, data);
              }
            }
          });
        }
      }
      tryAppCheck() {
        if (this.connected_ && this.appCheckToken_) {
          this.sendRequest("appcheck", { "token": this.appCheckToken_ }, (res) => {
            const status = res["s"];
            const data = res["d"] || "error";
            if (status === "ok") {
              this.invalidAppCheckTokenCount_ = 0;
            } else {
              this.onAppCheckRevoked_(status, data);
            }
          });
        }
      }
      unlisten(query, tag) {
        const pathString = query._path.toString();
        const queryId = query._queryIdentifier;
        this.log_("Unlisten called for " + pathString + " " + queryId);
        assert$1(query._queryParams.isDefault() || !query._queryParams.loadsAllData(), "unlisten() called for non-default but complete query");
        const listen = this.removeListen_(pathString, queryId);
        if (listen && this.connected_) {
          this.sendUnlisten_(pathString, queryId, query._queryObject, tag);
        }
      }
      sendUnlisten_(pathString, queryId, queryObj, tag) {
        this.log_("Unlisten on " + pathString + " for " + queryId);
        const req = { p: pathString };
        const action = "n";
        if (tag) {
          req["q"] = queryObj;
          req["t"] = tag;
        }
        this.sendRequest(action, req);
      }
      onDisconnectPut(pathString, data, onComplete) {
        this.initConnection_();
        if (this.connected_) {
          this.sendOnDisconnect_("o", pathString, data, onComplete);
        } else {
          this.onDisconnectRequestQueue_.push({
            pathString,
            action: "o",
            data,
            onComplete
          });
        }
      }
      onDisconnectMerge(pathString, data, onComplete) {
        this.initConnection_();
        if (this.connected_) {
          this.sendOnDisconnect_("om", pathString, data, onComplete);
        } else {
          this.onDisconnectRequestQueue_.push({
            pathString,
            action: "om",
            data,
            onComplete
          });
        }
      }
      onDisconnectCancel(pathString, onComplete) {
        this.initConnection_();
        if (this.connected_) {
          this.sendOnDisconnect_("oc", pathString, null, onComplete);
        } else {
          this.onDisconnectRequestQueue_.push({
            pathString,
            action: "oc",
            data: null,
            onComplete
          });
        }
      }
      sendOnDisconnect_(action, pathString, data, onComplete) {
        const request = { p: pathString, d: data };
        this.log_("onDisconnect " + action, request);
        this.sendRequest(action, request, (response) => {
          if (onComplete) {
            setTimeout(() => {
              onComplete(response["s"], response["d"]);
            }, Math.floor(0));
          }
        });
      }
      put(pathString, data, onComplete, hash2) {
        this.putInternal("p", pathString, data, onComplete, hash2);
      }
      merge(pathString, data, onComplete, hash2) {
        this.putInternal("m", pathString, data, onComplete, hash2);
      }
      putInternal(action, pathString, data, onComplete, hash2) {
        this.initConnection_();
        const request = {
          p: pathString,
          d: data
        };
        if (hash2 !== void 0) {
          request["h"] = hash2;
        }
        this.outstandingPuts_.push({
          action,
          request,
          onComplete
        });
        this.outstandingPutCount_++;
        const index = this.outstandingPuts_.length - 1;
        if (this.connected_) {
          this.sendPut_(index);
        } else {
          this.log_("Buffering put: " + pathString);
        }
      }
      sendPut_(index) {
        const action = this.outstandingPuts_[index].action;
        const request = this.outstandingPuts_[index].request;
        const onComplete = this.outstandingPuts_[index].onComplete;
        this.outstandingPuts_[index].queued = this.connected_;
        this.sendRequest(action, request, (message2) => {
          this.log_(action + " response", message2);
          delete this.outstandingPuts_[index];
          this.outstandingPutCount_--;
          if (this.outstandingPutCount_ === 0) {
            this.outstandingPuts_ = [];
          }
          if (onComplete) {
            onComplete(message2["s"], message2["d"]);
          }
        });
      }
      reportStats(stats) {
        if (this.connected_) {
          const request = { c: stats };
          this.log_("reportStats", request);
          this.sendRequest("s", request, (result) => {
            const status = result["s"];
            if (status !== "ok") {
              const errorReason = result["d"];
              this.log_("reportStats", "Error sending stats: " + errorReason);
            }
          });
        }
      }
      onDataMessage_(message2) {
        if ("r" in message2) {
          this.log_("from server: " + stringify(message2));
          const reqNum = message2["r"];
          const onResponse = this.requestCBHash_[reqNum];
          if (onResponse) {
            delete this.requestCBHash_[reqNum];
            onResponse(message2["b"]);
          }
        } else if ("error" in message2) {
          throw "A server-side error has occurred: " + message2["error"];
        } else if ("a" in message2) {
          this.onDataPush_(message2["a"], message2["b"]);
        }
      }
      onDataPush_(action, body) {
        this.log_("handleServerMessage", action, body);
        if (action === "d") {
          this.onDataUpdate_(body["p"], body["d"], false, body["t"]);
        } else if (action === "m") {
          this.onDataUpdate_(body["p"], body["d"], true, body["t"]);
        } else if (action === "c") {
          this.onListenRevoked_(body["p"], body["q"]);
        } else if (action === "ac") {
          this.onAuthRevoked_(body["s"], body["d"]);
        } else if (action === "apc") {
          this.onAppCheckRevoked_(body["s"], body["d"]);
        } else if (action === "sd") {
          this.onSecurityDebugPacket_(body);
        } else {
          error("Unrecognized action received from server: " + stringify(action) + "\nAre you using the latest client?");
        }
      }
      onReady_(timestamp, sessionId) {
        this.log_("connection ready");
        this.connected_ = true;
        this.lastConnectionEstablishedTime_ = new Date().getTime();
        this.handleTimestamp_(timestamp);
        this.lastSessionId = sessionId;
        if (this.firstConnection_) {
          this.sendConnectStats_();
        }
        this.restoreState_();
        this.firstConnection_ = false;
        this.onConnectStatus_(true);
      }
      scheduleConnect_(timeout) {
        assert$1(!this.realtime_, "Scheduling a connect when we're already connected/ing?");
        if (this.establishConnectionTimer_) {
          clearTimeout(this.establishConnectionTimer_);
        }
        this.establishConnectionTimer_ = setTimeout(() => {
          this.establishConnectionTimer_ = null;
          this.establishConnection_();
        }, Math.floor(timeout));
      }
      initConnection_() {
        if (!this.realtime_ && this.firstConnection_) {
          this.scheduleConnect_(0);
        }
      }
      onVisible_(visible) {
        if (visible && !this.visible_ && this.reconnectDelay_ === this.maxReconnectDelay_) {
          this.log_("Window became visible.  Reducing delay.");
          this.reconnectDelay_ = RECONNECT_MIN_DELAY;
          if (!this.realtime_) {
            this.scheduleConnect_(0);
          }
        }
        this.visible_ = visible;
      }
      onOnline_(online) {
        if (online) {
          this.log_("Browser went online.");
          this.reconnectDelay_ = RECONNECT_MIN_DELAY;
          if (!this.realtime_) {
            this.scheduleConnect_(0);
          }
        } else {
          this.log_("Browser went offline.  Killing connection.");
          if (this.realtime_) {
            this.realtime_.close();
          }
        }
      }
      onRealtimeDisconnect_() {
        this.log_("data client disconnected");
        this.connected_ = false;
        this.realtime_ = null;
        this.cancelSentTransactions_();
        this.requestCBHash_ = {};
        if (this.shouldReconnect_()) {
          if (!this.visible_) {
            this.log_("Window isn't visible.  Delaying reconnect.");
            this.reconnectDelay_ = this.maxReconnectDelay_;
            this.lastConnectionAttemptTime_ = new Date().getTime();
          } else if (this.lastConnectionEstablishedTime_) {
            const timeSinceLastConnectSucceeded = new Date().getTime() - this.lastConnectionEstablishedTime_;
            if (timeSinceLastConnectSucceeded > RECONNECT_DELAY_RESET_TIMEOUT) {
              this.reconnectDelay_ = RECONNECT_MIN_DELAY;
            }
            this.lastConnectionEstablishedTime_ = null;
          }
          const timeSinceLastConnectAttempt = new Date().getTime() - this.lastConnectionAttemptTime_;
          let reconnectDelay = Math.max(0, this.reconnectDelay_ - timeSinceLastConnectAttempt);
          reconnectDelay = Math.random() * reconnectDelay;
          this.log_("Trying to reconnect in " + reconnectDelay + "ms");
          this.scheduleConnect_(reconnectDelay);
          this.reconnectDelay_ = Math.min(this.maxReconnectDelay_, this.reconnectDelay_ * RECONNECT_DELAY_MULTIPLIER);
        }
        this.onConnectStatus_(false);
      }
      async establishConnection_() {
        if (this.shouldReconnect_()) {
          this.log_("Making a connection attempt");
          this.lastConnectionAttemptTime_ = new Date().getTime();
          this.lastConnectionEstablishedTime_ = null;
          const onDataMessage = this.onDataMessage_.bind(this);
          const onReady = this.onReady_.bind(this);
          const onDisconnect = this.onRealtimeDisconnect_.bind(this);
          const connId = this.id + ":" + PersistentConnection.nextConnectionId_++;
          const lastSessionId = this.lastSessionId;
          let canceled = false;
          let connection = null;
          const closeFn = function() {
            if (connection) {
              connection.close();
            } else {
              canceled = true;
              onDisconnect();
            }
          };
          const sendRequestFn = function(msg) {
            assert$1(connection, "sendRequest call when we're not connected not allowed.");
            connection.sendRequest(msg);
          };
          this.realtime_ = {
            close: closeFn,
            sendRequest: sendRequestFn
          };
          const forceRefresh = this.forceTokenRefresh_;
          this.forceTokenRefresh_ = false;
          try {
            const [authToken, appCheckToken] = await Promise.all([
              this.authTokenProvider_.getToken(forceRefresh),
              this.appCheckTokenProvider_.getToken(forceRefresh)
            ]);
            if (!canceled) {
              log("getToken() completed. Creating connection.");
              this.authToken_ = authToken && authToken.accessToken;
              this.appCheckToken_ = appCheckToken && appCheckToken.token;
              connection = new Connection(connId, this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, onDataMessage, onReady, onDisconnect, (reason) => {
                warn(reason + " (" + this.repoInfo_.toString() + ")");
                this.interrupt(SERVER_KILL_INTERRUPT_REASON);
              }, lastSessionId);
            } else {
              log("getToken() completed but was canceled");
            }
          } catch (error22) {
            this.log_("Failed to get token: " + error22);
            if (!canceled) {
              if (this.repoInfo_.nodeAdmin) {
                warn(error22);
              }
              closeFn();
            }
          }
        }
      }
      interrupt(reason) {
        log("Interrupting connection for reason: " + reason);
        this.interruptReasons_[reason] = true;
        if (this.realtime_) {
          this.realtime_.close();
        } else {
          if (this.establishConnectionTimer_) {
            clearTimeout(this.establishConnectionTimer_);
            this.establishConnectionTimer_ = null;
          }
          if (this.connected_) {
            this.onRealtimeDisconnect_();
          }
        }
      }
      resume(reason) {
        log("Resuming connection for reason: " + reason);
        delete this.interruptReasons_[reason];
        if (isEmpty(this.interruptReasons_)) {
          this.reconnectDelay_ = RECONNECT_MIN_DELAY;
          if (!this.realtime_) {
            this.scheduleConnect_(0);
          }
        }
      }
      handleTimestamp_(timestamp) {
        const delta = timestamp - new Date().getTime();
        this.onServerInfoUpdate_({ serverTimeOffset: delta });
      }
      cancelSentTransactions_() {
        for (let i = 0; i < this.outstandingPuts_.length; i++) {
          const put = this.outstandingPuts_[i];
          if (put && "h" in put.request && put.queued) {
            if (put.onComplete) {
              put.onComplete("disconnect");
            }
            delete this.outstandingPuts_[i];
            this.outstandingPutCount_--;
          }
        }
        if (this.outstandingPutCount_ === 0) {
          this.outstandingPuts_ = [];
        }
      }
      onListenRevoked_(pathString, query) {
        let queryId;
        if (!query) {
          queryId = "default";
        } else {
          queryId = query.map((q) => ObjectToUniqueKey(q)).join("$");
        }
        const listen = this.removeListen_(pathString, queryId);
        if (listen && listen.onComplete) {
          listen.onComplete("permission_denied");
        }
      }
      removeListen_(pathString, queryId) {
        const normalizedPathString = new Path(pathString).toString();
        let listen;
        if (this.listens.has(normalizedPathString)) {
          const map2 = this.listens.get(normalizedPathString);
          listen = map2.get(queryId);
          map2.delete(queryId);
          if (map2.size === 0) {
            this.listens.delete(normalizedPathString);
          }
        } else {
          listen = void 0;
        }
        return listen;
      }
      onAuthRevoked_(statusCode, explanation) {
        log("Auth token revoked: " + statusCode + "/" + explanation);
        this.authToken_ = null;
        this.forceTokenRefresh_ = true;
        this.realtime_.close();
        if (statusCode === "invalid_token" || statusCode === "permission_denied") {
          this.invalidAuthTokenCount_++;
          if (this.invalidAuthTokenCount_ >= INVALID_TOKEN_THRESHOLD) {
            this.reconnectDelay_ = RECONNECT_MAX_DELAY_FOR_ADMINS;
            this.authTokenProvider_.notifyForInvalidToken();
          }
        }
      }
      onAppCheckRevoked_(statusCode, explanation) {
        log("App check token revoked: " + statusCode + "/" + explanation);
        this.appCheckToken_ = null;
        this.forceTokenRefresh_ = true;
        if (statusCode === "invalid_token" || statusCode === "permission_denied") {
          this.invalidAppCheckTokenCount_++;
          if (this.invalidAppCheckTokenCount_ >= INVALID_TOKEN_THRESHOLD) {
            this.appCheckTokenProvider_.notifyForInvalidToken();
          }
        }
      }
      onSecurityDebugPacket_(body) {
        if (this.securityDebugCallback_) {
          this.securityDebugCallback_(body);
        } else {
          if ("msg" in body) {
            console.log("FIREBASE: " + body["msg"].replace("\n", "\nFIREBASE: "));
          }
        }
      }
      restoreState_() {
        this.tryAuth();
        this.tryAppCheck();
        for (const queries of this.listens.values()) {
          for (const listenSpec of queries.values()) {
            this.sendListen_(listenSpec);
          }
        }
        for (let i = 0; i < this.outstandingPuts_.length; i++) {
          if (this.outstandingPuts_[i]) {
            this.sendPut_(i);
          }
        }
        while (this.onDisconnectRequestQueue_.length) {
          const request = this.onDisconnectRequestQueue_.shift();
          this.sendOnDisconnect_(request.action, request.pathString, request.data, request.onComplete);
        }
        for (let i = 0; i < this.outstandingGets_.length; i++) {
          if (this.outstandingGets_[i]) {
            this.sendGet_(i);
          }
        }
      }
      sendConnectStats_() {
        const stats = {};
        let clientName = "js";
        if (isNodeSdk()) {
          if (this.repoInfo_.nodeAdmin) {
            clientName = "admin_node";
          } else {
            clientName = "node";
          }
        }
        stats["sdk." + clientName + "." + SDK_VERSION.replace(/\./g, "-")] = 1;
        if (isMobileCordova()) {
          stats["framework.cordova"] = 1;
        } else if (isReactNative()) {
          stats["framework.reactnative"] = 1;
        }
        this.reportStats(stats);
      }
      shouldReconnect_() {
        const online = OnlineMonitor.getInstance().currentlyOnline();
        return isEmpty(this.interruptReasons_) && online;
      }
    };
    PersistentConnection.nextPersistentConnectionId_ = 0;
    PersistentConnection.nextConnectionId_ = 0;
    NamedNode = class {
      constructor(name2, node) {
        this.name = name2;
        this.node = node;
      }
      static Wrap(name2, node) {
        return new NamedNode(name2, node);
      }
    };
    Index = class {
      getCompare() {
        return this.compare.bind(this);
      }
      indexedValueChanged(oldNode, newNode) {
        const oldWrapped = new NamedNode(MIN_NAME, oldNode);
        const newWrapped = new NamedNode(MIN_NAME, newNode);
        return this.compare(oldWrapped, newWrapped) !== 0;
      }
      minPost() {
        return NamedNode.MIN;
      }
    };
    KeyIndex = class extends Index {
      static get __EMPTY_NODE() {
        return __EMPTY_NODE;
      }
      static set __EMPTY_NODE(val) {
        __EMPTY_NODE = val;
      }
      compare(a, b) {
        return nameCompare(a.name, b.name);
      }
      isDefinedOn(node) {
        throw assertionError("KeyIndex.isDefinedOn not expected to be called.");
      }
      indexedValueChanged(oldNode, newNode) {
        return false;
      }
      minPost() {
        return NamedNode.MIN;
      }
      maxPost() {
        return new NamedNode(MAX_NAME, __EMPTY_NODE);
      }
      makePost(indexValue, name2) {
        assert$1(typeof indexValue === "string", "KeyIndex indexValue must always be a string.");
        return new NamedNode(indexValue, __EMPTY_NODE);
      }
      toString() {
        return ".key";
      }
    };
    KEY_INDEX = new KeyIndex();
    SortedMapIterator = class {
      constructor(node, startKey, comparator, isReverse_, resultGenerator_ = null) {
        this.isReverse_ = isReverse_;
        this.resultGenerator_ = resultGenerator_;
        this.nodeStack_ = [];
        let cmp = 1;
        while (!node.isEmpty()) {
          node = node;
          cmp = startKey ? comparator(node.key, startKey) : 1;
          if (isReverse_) {
            cmp *= -1;
          }
          if (cmp < 0) {
            if (this.isReverse_) {
              node = node.left;
            } else {
              node = node.right;
            }
          } else if (cmp === 0) {
            this.nodeStack_.push(node);
            break;
          } else {
            this.nodeStack_.push(node);
            if (this.isReverse_) {
              node = node.right;
            } else {
              node = node.left;
            }
          }
        }
      }
      getNext() {
        if (this.nodeStack_.length === 0) {
          return null;
        }
        let node = this.nodeStack_.pop();
        let result;
        if (this.resultGenerator_) {
          result = this.resultGenerator_(node.key, node.value);
        } else {
          result = { key: node.key, value: node.value };
        }
        if (this.isReverse_) {
          node = node.left;
          while (!node.isEmpty()) {
            this.nodeStack_.push(node);
            node = node.right;
          }
        } else {
          node = node.right;
          while (!node.isEmpty()) {
            this.nodeStack_.push(node);
            node = node.left;
          }
        }
        return result;
      }
      hasNext() {
        return this.nodeStack_.length > 0;
      }
      peek() {
        if (this.nodeStack_.length === 0) {
          return null;
        }
        const node = this.nodeStack_[this.nodeStack_.length - 1];
        if (this.resultGenerator_) {
          return this.resultGenerator_(node.key, node.value);
        } else {
          return { key: node.key, value: node.value };
        }
      }
    };
    LLRBNode = class {
      constructor(key, value, color, left, right) {
        this.key = key;
        this.value = value;
        this.color = color != null ? color : LLRBNode.RED;
        this.left = left != null ? left : SortedMap.EMPTY_NODE;
        this.right = right != null ? right : SortedMap.EMPTY_NODE;
      }
      copy(key, value, color, left, right) {
        return new LLRBNode(key != null ? key : this.key, value != null ? value : this.value, color != null ? color : this.color, left != null ? left : this.left, right != null ? right : this.right);
      }
      count() {
        return this.left.count() + 1 + this.right.count();
      }
      isEmpty() {
        return false;
      }
      inorderTraversal(action) {
        return this.left.inorderTraversal(action) || !!action(this.key, this.value) || this.right.inorderTraversal(action);
      }
      reverseTraversal(action) {
        return this.right.reverseTraversal(action) || action(this.key, this.value) || this.left.reverseTraversal(action);
      }
      min_() {
        if (this.left.isEmpty()) {
          return this;
        } else {
          return this.left.min_();
        }
      }
      minKey() {
        return this.min_().key;
      }
      maxKey() {
        if (this.right.isEmpty()) {
          return this.key;
        } else {
          return this.right.maxKey();
        }
      }
      insert(key, value, comparator) {
        let n = this;
        const cmp = comparator(key, n.key);
        if (cmp < 0) {
          n = n.copy(null, null, null, n.left.insert(key, value, comparator), null);
        } else if (cmp === 0) {
          n = n.copy(null, value, null, null, null);
        } else {
          n = n.copy(null, null, null, null, n.right.insert(key, value, comparator));
        }
        return n.fixUp_();
      }
      removeMin_() {
        if (this.left.isEmpty()) {
          return SortedMap.EMPTY_NODE;
        }
        let n = this;
        if (!n.left.isRed_() && !n.left.left.isRed_()) {
          n = n.moveRedLeft_();
        }
        n = n.copy(null, null, null, n.left.removeMin_(), null);
        return n.fixUp_();
      }
      remove(key, comparator) {
        let n, smallest;
        n = this;
        if (comparator(key, n.key) < 0) {
          if (!n.left.isEmpty() && !n.left.isRed_() && !n.left.left.isRed_()) {
            n = n.moveRedLeft_();
          }
          n = n.copy(null, null, null, n.left.remove(key, comparator), null);
        } else {
          if (n.left.isRed_()) {
            n = n.rotateRight_();
          }
          if (!n.right.isEmpty() && !n.right.isRed_() && !n.right.left.isRed_()) {
            n = n.moveRedRight_();
          }
          if (comparator(key, n.key) === 0) {
            if (n.right.isEmpty()) {
              return SortedMap.EMPTY_NODE;
            } else {
              smallest = n.right.min_();
              n = n.copy(smallest.key, smallest.value, null, null, n.right.removeMin_());
            }
          }
          n = n.copy(null, null, null, null, n.right.remove(key, comparator));
        }
        return n.fixUp_();
      }
      isRed_() {
        return this.color;
      }
      fixUp_() {
        let n = this;
        if (n.right.isRed_() && !n.left.isRed_()) {
          n = n.rotateLeft_();
        }
        if (n.left.isRed_() && n.left.left.isRed_()) {
          n = n.rotateRight_();
        }
        if (n.left.isRed_() && n.right.isRed_()) {
          n = n.colorFlip_();
        }
        return n;
      }
      moveRedLeft_() {
        let n = this.colorFlip_();
        if (n.right.left.isRed_()) {
          n = n.copy(null, null, null, null, n.right.rotateRight_());
          n = n.rotateLeft_();
          n = n.colorFlip_();
        }
        return n;
      }
      moveRedRight_() {
        let n = this.colorFlip_();
        if (n.left.left.isRed_()) {
          n = n.rotateRight_();
          n = n.colorFlip_();
        }
        return n;
      }
      rotateLeft_() {
        const nl = this.copy(null, null, LLRBNode.RED, null, this.right.left);
        return this.right.copy(null, null, this.color, nl, null);
      }
      rotateRight_() {
        const nr = this.copy(null, null, LLRBNode.RED, this.left.right, null);
        return this.left.copy(null, null, this.color, null, nr);
      }
      colorFlip_() {
        const left = this.left.copy(null, null, !this.left.color, null, null);
        const right = this.right.copy(null, null, !this.right.color, null, null);
        return this.copy(null, null, !this.color, left, right);
      }
      checkMaxDepth_() {
        const blackDepth = this.check_();
        return Math.pow(2, blackDepth) <= this.count() + 1;
      }
      check_() {
        if (this.isRed_() && this.left.isRed_()) {
          throw new Error("Red node has red child(" + this.key + "," + this.value + ")");
        }
        if (this.right.isRed_()) {
          throw new Error("Right child of (" + this.key + "," + this.value + ") is red");
        }
        const blackDepth = this.left.check_();
        if (blackDepth !== this.right.check_()) {
          throw new Error("Black depths differ");
        } else {
          return blackDepth + (this.isRed_() ? 0 : 1);
        }
      }
    };
    LLRBNode.RED = true;
    LLRBNode.BLACK = false;
    LLRBEmptyNode = class {
      copy(key, value, color, left, right) {
        return this;
      }
      insert(key, value, comparator) {
        return new LLRBNode(key, value, null);
      }
      remove(key, comparator) {
        return this;
      }
      count() {
        return 0;
      }
      isEmpty() {
        return true;
      }
      inorderTraversal(action) {
        return false;
      }
      reverseTraversal(action) {
        return false;
      }
      minKey() {
        return null;
      }
      maxKey() {
        return null;
      }
      check_() {
        return 0;
      }
      isRed_() {
        return false;
      }
    };
    SortedMap = class {
      constructor(comparator_, root_ = SortedMap.EMPTY_NODE) {
        this.comparator_ = comparator_;
        this.root_ = root_;
      }
      insert(key, value) {
        return new SortedMap(this.comparator_, this.root_.insert(key, value, this.comparator_).copy(null, null, LLRBNode.BLACK, null, null));
      }
      remove(key) {
        return new SortedMap(this.comparator_, this.root_.remove(key, this.comparator_).copy(null, null, LLRBNode.BLACK, null, null));
      }
      get(key) {
        let cmp;
        let node = this.root_;
        while (!node.isEmpty()) {
          cmp = this.comparator_(key, node.key);
          if (cmp === 0) {
            return node.value;
          } else if (cmp < 0) {
            node = node.left;
          } else if (cmp > 0) {
            node = node.right;
          }
        }
        return null;
      }
      getPredecessorKey(key) {
        let cmp, node = this.root_, rightParent = null;
        while (!node.isEmpty()) {
          cmp = this.comparator_(key, node.key);
          if (cmp === 0) {
            if (!node.left.isEmpty()) {
              node = node.left;
              while (!node.right.isEmpty()) {
                node = node.right;
              }
              return node.key;
            } else if (rightParent) {
              return rightParent.key;
            } else {
              return null;
            }
          } else if (cmp < 0) {
            node = node.left;
          } else if (cmp > 0) {
            rightParent = node;
            node = node.right;
          }
        }
        throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?");
      }
      isEmpty() {
        return this.root_.isEmpty();
      }
      count() {
        return this.root_.count();
      }
      minKey() {
        return this.root_.minKey();
      }
      maxKey() {
        return this.root_.maxKey();
      }
      inorderTraversal(action) {
        return this.root_.inorderTraversal(action);
      }
      reverseTraversal(action) {
        return this.root_.reverseTraversal(action);
      }
      getIterator(resultGenerator) {
        return new SortedMapIterator(this.root_, null, this.comparator_, false, resultGenerator);
      }
      getIteratorFrom(key, resultGenerator) {
        return new SortedMapIterator(this.root_, key, this.comparator_, false, resultGenerator);
      }
      getReverseIteratorFrom(key, resultGenerator) {
        return new SortedMapIterator(this.root_, key, this.comparator_, true, resultGenerator);
      }
      getReverseIterator(resultGenerator) {
        return new SortedMapIterator(this.root_, null, this.comparator_, true, resultGenerator);
      }
    };
    SortedMap.EMPTY_NODE = new LLRBEmptyNode();
    priorityHashText = function(priority) {
      if (typeof priority === "number") {
        return "number:" + doubleToIEEE754String(priority);
      } else {
        return "string:" + priority;
      }
    };
    validatePriorityNode = function(priorityNode) {
      if (priorityNode.isLeafNode()) {
        const val = priorityNode.val();
        assert$1(typeof val === "string" || typeof val === "number" || typeof val === "object" && contains(val, ".sv"), "Priority must be a string or number.");
      } else {
        assert$1(priorityNode === MAX_NODE$2 || priorityNode.isEmpty(), "priority of unexpected type.");
      }
      assert$1(priorityNode === MAX_NODE$2 || priorityNode.getPriority().isEmpty(), "Priority nodes can't have a priority of their own.");
    };
    LeafNode = class {
      constructor(value_, priorityNode_ = LeafNode.__childrenNodeConstructor.EMPTY_NODE) {
        this.value_ = value_;
        this.priorityNode_ = priorityNode_;
        this.lazyHash_ = null;
        assert$1(this.value_ !== void 0 && this.value_ !== null, "LeafNode shouldn't be created with null/undefined value.");
        validatePriorityNode(this.priorityNode_);
      }
      static set __childrenNodeConstructor(val) {
        __childrenNodeConstructor = val;
      }
      static get __childrenNodeConstructor() {
        return __childrenNodeConstructor;
      }
      isLeafNode() {
        return true;
      }
      getPriority() {
        return this.priorityNode_;
      }
      updatePriority(newPriorityNode) {
        return new LeafNode(this.value_, newPriorityNode);
      }
      getImmediateChild(childName) {
        if (childName === ".priority") {
          return this.priorityNode_;
        } else {
          return LeafNode.__childrenNodeConstructor.EMPTY_NODE;
        }
      }
      getChild(path) {
        if (pathIsEmpty(path)) {
          return this;
        } else if (pathGetFront(path) === ".priority") {
          return this.priorityNode_;
        } else {
          return LeafNode.__childrenNodeConstructor.EMPTY_NODE;
        }
      }
      hasChild() {
        return false;
      }
      getPredecessorChildName(childName, childNode) {
        return null;
      }
      updateImmediateChild(childName, newChildNode) {
        if (childName === ".priority") {
          return this.updatePriority(newChildNode);
        } else if (newChildNode.isEmpty() && childName !== ".priority") {
          return this;
        } else {
          return LeafNode.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(childName, newChildNode).updatePriority(this.priorityNode_);
        }
      }
      updateChild(path, newChildNode) {
        const front = pathGetFront(path);
        if (front === null) {
          return newChildNode;
        } else if (newChildNode.isEmpty() && front !== ".priority") {
          return this;
        } else {
          assert$1(front !== ".priority" || pathGetLength(path) === 1, ".priority must be the last token in a path");
          return this.updateImmediateChild(front, LeafNode.__childrenNodeConstructor.EMPTY_NODE.updateChild(pathPopFront(path), newChildNode));
        }
      }
      isEmpty() {
        return false;
      }
      numChildren() {
        return 0;
      }
      forEachChild(index, action) {
        return false;
      }
      val(exportFormat) {
        if (exportFormat && !this.getPriority().isEmpty()) {
          return {
            ".value": this.getValue(),
            ".priority": this.getPriority().val()
          };
        } else {
          return this.getValue();
        }
      }
      hash() {
        if (this.lazyHash_ === null) {
          let toHash = "";
          if (!this.priorityNode_.isEmpty()) {
            toHash += "priority:" + priorityHashText(this.priorityNode_.val()) + ":";
          }
          const type = typeof this.value_;
          toHash += type + ":";
          if (type === "number") {
            toHash += doubleToIEEE754String(this.value_);
          } else {
            toHash += this.value_;
          }
          this.lazyHash_ = sha1(toHash);
        }
        return this.lazyHash_;
      }
      getValue() {
        return this.value_;
      }
      compareTo(other) {
        if (other === LeafNode.__childrenNodeConstructor.EMPTY_NODE) {
          return 1;
        } else if (other instanceof LeafNode.__childrenNodeConstructor) {
          return -1;
        } else {
          assert$1(other.isLeafNode(), "Unknown node type");
          return this.compareToLeafNode_(other);
        }
      }
      compareToLeafNode_(otherLeaf) {
        const otherLeafType = typeof otherLeaf.value_;
        const thisLeafType = typeof this.value_;
        const otherIndex = LeafNode.VALUE_TYPE_ORDER.indexOf(otherLeafType);
        const thisIndex = LeafNode.VALUE_TYPE_ORDER.indexOf(thisLeafType);
        assert$1(otherIndex >= 0, "Unknown leaf type: " + otherLeafType);
        assert$1(thisIndex >= 0, "Unknown leaf type: " + thisLeafType);
        if (otherIndex === thisIndex) {
          if (thisLeafType === "object") {
            return 0;
          } else {
            if (this.value_ < otherLeaf.value_) {
              return -1;
            } else if (this.value_ === otherLeaf.value_) {
              return 0;
            } else {
              return 1;
            }
          }
        } else {
          return thisIndex - otherIndex;
        }
      }
      withIndex() {
        return this;
      }
      isIndexed() {
        return true;
      }
      equals(other) {
        if (other === this) {
          return true;
        } else if (other.isLeafNode()) {
          const otherLeaf = other;
          return this.value_ === otherLeaf.value_ && this.priorityNode_.equals(otherLeaf.priorityNode_);
        } else {
          return false;
        }
      }
    };
    LeafNode.VALUE_TYPE_ORDER = ["object", "boolean", "number", "string"];
    PriorityIndex = class extends Index {
      compare(a, b) {
        const aPriority = a.node.getPriority();
        const bPriority = b.node.getPriority();
        const indexCmp = aPriority.compareTo(bPriority);
        if (indexCmp === 0) {
          return nameCompare(a.name, b.name);
        } else {
          return indexCmp;
        }
      }
      isDefinedOn(node) {
        return !node.getPriority().isEmpty();
      }
      indexedValueChanged(oldNode, newNode) {
        return !oldNode.getPriority().equals(newNode.getPriority());
      }
      minPost() {
        return NamedNode.MIN;
      }
      maxPost() {
        return new NamedNode(MAX_NAME, new LeafNode("[PRIORITY-POST]", MAX_NODE$1));
      }
      makePost(indexValue, name2) {
        const priorityNode = nodeFromJSON$1(indexValue);
        return new NamedNode(name2, new LeafNode("[PRIORITY-POST]", priorityNode));
      }
      toString() {
        return ".priority";
      }
    };
    PRIORITY_INDEX = new PriorityIndex();
    LOG_2 = Math.log(2);
    Base12Num = class {
      constructor(length) {
        const logBase2 = (num) => parseInt(Math.log(num) / LOG_2, 10);
        const bitMask = (bits) => parseInt(Array(bits + 1).join("1"), 2);
        this.count = logBase2(length + 1);
        this.current_ = this.count - 1;
        const mask = bitMask(this.count);
        this.bits_ = length + 1 & mask;
      }
      nextBitIsOne() {
        const result = !(this.bits_ & 1 << this.current_);
        this.current_--;
        return result;
      }
    };
    buildChildSet = function(childList, cmp, keyFn, mapSortFn) {
      childList.sort(cmp);
      const buildBalancedTree = function(low, high) {
        const length = high - low;
        let namedNode;
        let key;
        if (length === 0) {
          return null;
        } else if (length === 1) {
          namedNode = childList[low];
          key = keyFn ? keyFn(namedNode) : namedNode;
          return new LLRBNode(key, namedNode.node, LLRBNode.BLACK, null, null);
        } else {
          const middle = parseInt(length / 2, 10) + low;
          const left = buildBalancedTree(low, middle);
          const right = buildBalancedTree(middle + 1, high);
          namedNode = childList[middle];
          key = keyFn ? keyFn(namedNode) : namedNode;
          return new LLRBNode(key, namedNode.node, LLRBNode.BLACK, left, right);
        }
      };
      const buildFrom12Array = function(base122) {
        let node = null;
        let root2 = null;
        let index = childList.length;
        const buildPennant = function(chunkSize, color) {
          const low = index - chunkSize;
          const high = index;
          index -= chunkSize;
          const childTree = buildBalancedTree(low + 1, high);
          const namedNode = childList[low];
          const key = keyFn ? keyFn(namedNode) : namedNode;
          attachPennant(new LLRBNode(key, namedNode.node, color, null, childTree));
        };
        const attachPennant = function(pennant) {
          if (node) {
            node.left = pennant;
            node = pennant;
          } else {
            root2 = pennant;
            node = pennant;
          }
        };
        for (let i = 0; i < base122.count; ++i) {
          const isOne = base122.nextBitIsOne();
          const chunkSize = Math.pow(2, base122.count - (i + 1));
          if (isOne) {
            buildPennant(chunkSize, LLRBNode.BLACK);
          } else {
            buildPennant(chunkSize, LLRBNode.BLACK);
            buildPennant(chunkSize, LLRBNode.RED);
          }
        }
        return root2;
      };
      const base12 = new Base12Num(childList.length);
      const root = buildFrom12Array(base12);
      return new SortedMap(mapSortFn || cmp, root);
    };
    fallbackObject = {};
    IndexMap = class {
      constructor(indexes_, indexSet_) {
        this.indexes_ = indexes_;
        this.indexSet_ = indexSet_;
      }
      static get Default() {
        assert$1(fallbackObject && PRIORITY_INDEX, "ChildrenNode.ts has not been loaded");
        _defaultIndexMap = _defaultIndexMap || new IndexMap({ ".priority": fallbackObject }, { ".priority": PRIORITY_INDEX });
        return _defaultIndexMap;
      }
      get(indexKey) {
        const sortedMap = safeGet(this.indexes_, indexKey);
        if (!sortedMap) {
          throw new Error("No index defined for " + indexKey);
        }
        if (sortedMap instanceof SortedMap) {
          return sortedMap;
        } else {
          return null;
        }
      }
      hasIndex(indexDefinition) {
        return contains(this.indexSet_, indexDefinition.toString());
      }
      addIndex(indexDefinition, existingChildren) {
        assert$1(indexDefinition !== KEY_INDEX, "KeyIndex always exists and isn't meant to be added to the IndexMap.");
        const childList = [];
        let sawIndexedValue = false;
        const iter = existingChildren.getIterator(NamedNode.Wrap);
        let next = iter.getNext();
        while (next) {
          sawIndexedValue = sawIndexedValue || indexDefinition.isDefinedOn(next.node);
          childList.push(next);
          next = iter.getNext();
        }
        let newIndex;
        if (sawIndexedValue) {
          newIndex = buildChildSet(childList, indexDefinition.getCompare());
        } else {
          newIndex = fallbackObject;
        }
        const indexName = indexDefinition.toString();
        const newIndexSet = Object.assign({}, this.indexSet_);
        newIndexSet[indexName] = indexDefinition;
        const newIndexes = Object.assign({}, this.indexes_);
        newIndexes[indexName] = newIndex;
        return new IndexMap(newIndexes, newIndexSet);
      }
      addToIndexes(namedNode, existingChildren) {
        const newIndexes = map(this.indexes_, (indexedChildren, indexName) => {
          const index = safeGet(this.indexSet_, indexName);
          assert$1(index, "Missing index implementation for " + indexName);
          if (indexedChildren === fallbackObject) {
            if (index.isDefinedOn(namedNode.node)) {
              const childList = [];
              const iter = existingChildren.getIterator(NamedNode.Wrap);
              let next = iter.getNext();
              while (next) {
                if (next.name !== namedNode.name) {
                  childList.push(next);
                }
                next = iter.getNext();
              }
              childList.push(namedNode);
              return buildChildSet(childList, index.getCompare());
            } else {
              return fallbackObject;
            }
          } else {
            const existingSnap = existingChildren.get(namedNode.name);
            let newChildren = indexedChildren;
            if (existingSnap) {
              newChildren = newChildren.remove(new NamedNode(namedNode.name, existingSnap));
            }
            return newChildren.insert(namedNode, namedNode.node);
          }
        });
        return new IndexMap(newIndexes, this.indexSet_);
      }
      removeFromIndexes(namedNode, existingChildren) {
        const newIndexes = map(this.indexes_, (indexedChildren) => {
          if (indexedChildren === fallbackObject) {
            return indexedChildren;
          } else {
            const existingSnap = existingChildren.get(namedNode.name);
            if (existingSnap) {
              return indexedChildren.remove(new NamedNode(namedNode.name, existingSnap));
            } else {
              return indexedChildren;
            }
          }
        });
        return new IndexMap(newIndexes, this.indexSet_);
      }
    };
    ChildrenNode = class {
      constructor(children_, priorityNode_, indexMap_) {
        this.children_ = children_;
        this.priorityNode_ = priorityNode_;
        this.indexMap_ = indexMap_;
        this.lazyHash_ = null;
        if (this.priorityNode_) {
          validatePriorityNode(this.priorityNode_);
        }
        if (this.children_.isEmpty()) {
          assert$1(!this.priorityNode_ || this.priorityNode_.isEmpty(), "An empty node cannot have a priority");
        }
      }
      static get EMPTY_NODE() {
        return EMPTY_NODE || (EMPTY_NODE = new ChildrenNode(new SortedMap(NAME_COMPARATOR), null, IndexMap.Default));
      }
      isLeafNode() {
        return false;
      }
      getPriority() {
        return this.priorityNode_ || EMPTY_NODE;
      }
      updatePriority(newPriorityNode) {
        if (this.children_.isEmpty()) {
          return this;
        } else {
          return new ChildrenNode(this.children_, newPriorityNode, this.indexMap_);
        }
      }
      getImmediateChild(childName) {
        if (childName === ".priority") {
          return this.getPriority();
        } else {
          const child = this.children_.get(childName);
          return child === null ? EMPTY_NODE : child;
        }
      }
      getChild(path) {
        const front = pathGetFront(path);
        if (front === null) {
          return this;
        }
        return this.getImmediateChild(front).getChild(pathPopFront(path));
      }
      hasChild(childName) {
        return this.children_.get(childName) !== null;
      }
      updateImmediateChild(childName, newChildNode) {
        assert$1(newChildNode, "We should always be passing snapshot nodes");
        if (childName === ".priority") {
          return this.updatePriority(newChildNode);
        } else {
          const namedNode = new NamedNode(childName, newChildNode);
          let newChildren, newIndexMap;
          if (newChildNode.isEmpty()) {
            newChildren = this.children_.remove(childName);
            newIndexMap = this.indexMap_.removeFromIndexes(namedNode, this.children_);
          } else {
            newChildren = this.children_.insert(childName, newChildNode);
            newIndexMap = this.indexMap_.addToIndexes(namedNode, this.children_);
          }
          const newPriority = newChildren.isEmpty() ? EMPTY_NODE : this.priorityNode_;
          return new ChildrenNode(newChildren, newPriority, newIndexMap);
        }
      }
      updateChild(path, newChildNode) {
        const front = pathGetFront(path);
        if (front === null) {
          return newChildNode;
        } else {
          assert$1(pathGetFront(path) !== ".priority" || pathGetLength(path) === 1, ".priority must be the last token in a path");
          const newImmediateChild = this.getImmediateChild(front).updateChild(pathPopFront(path), newChildNode);
          return this.updateImmediateChild(front, newImmediateChild);
        }
      }
      isEmpty() {
        return this.children_.isEmpty();
      }
      numChildren() {
        return this.children_.count();
      }
      val(exportFormat) {
        if (this.isEmpty()) {
          return null;
        }
        const obj = {};
        let numKeys = 0, maxKey = 0, allIntegerKeys = true;
        this.forEachChild(PRIORITY_INDEX, (key, childNode) => {
          obj[key] = childNode.val(exportFormat);
          numKeys++;
          if (allIntegerKeys && ChildrenNode.INTEGER_REGEXP_.test(key)) {
            maxKey = Math.max(maxKey, Number(key));
          } else {
            allIntegerKeys = false;
          }
        });
        if (!exportFormat && allIntegerKeys && maxKey < 2 * numKeys) {
          const array = [];
          for (const key in obj) {
            array[key] = obj[key];
          }
          return array;
        } else {
          if (exportFormat && !this.getPriority().isEmpty()) {
            obj[".priority"] = this.getPriority().val();
          }
          return obj;
        }
      }
      hash() {
        if (this.lazyHash_ === null) {
          let toHash = "";
          if (!this.getPriority().isEmpty()) {
            toHash += "priority:" + priorityHashText(this.getPriority().val()) + ":";
          }
          this.forEachChild(PRIORITY_INDEX, (key, childNode) => {
            const childHash = childNode.hash();
            if (childHash !== "") {
              toHash += ":" + key + ":" + childHash;
            }
          });
          this.lazyHash_ = toHash === "" ? "" : sha1(toHash);
        }
        return this.lazyHash_;
      }
      getPredecessorChildName(childName, childNode, index) {
        const idx = this.resolveIndex_(index);
        if (idx) {
          const predecessor = idx.getPredecessorKey(new NamedNode(childName, childNode));
          return predecessor ? predecessor.name : null;
        } else {
          return this.children_.getPredecessorKey(childName);
        }
      }
      getFirstChildName(indexDefinition) {
        const idx = this.resolveIndex_(indexDefinition);
        if (idx) {
          const minKey = idx.minKey();
          return minKey && minKey.name;
        } else {
          return this.children_.minKey();
        }
      }
      getFirstChild(indexDefinition) {
        const minKey = this.getFirstChildName(indexDefinition);
        if (minKey) {
          return new NamedNode(minKey, this.children_.get(minKey));
        } else {
          return null;
        }
      }
      getLastChildName(indexDefinition) {
        const idx = this.resolveIndex_(indexDefinition);
        if (idx) {
          const maxKey = idx.maxKey();
          return maxKey && maxKey.name;
        } else {
          return this.children_.maxKey();
        }
      }
      getLastChild(indexDefinition) {
        const maxKey = this.getLastChildName(indexDefinition);
        if (maxKey) {
          return new NamedNode(maxKey, this.children_.get(maxKey));
        } else {
          return null;
        }
      }
      forEachChild(index, action) {
        const idx = this.resolveIndex_(index);
        if (idx) {
          return idx.inorderTraversal((wrappedNode) => {
            return action(wrappedNode.name, wrappedNode.node);
          });
        } else {
          return this.children_.inorderTraversal(action);
        }
      }
      getIterator(indexDefinition) {
        return this.getIteratorFrom(indexDefinition.minPost(), indexDefinition);
      }
      getIteratorFrom(startPost, indexDefinition) {
        const idx = this.resolveIndex_(indexDefinition);
        if (idx) {
          return idx.getIteratorFrom(startPost, (key) => key);
        } else {
          const iterator = this.children_.getIteratorFrom(startPost.name, NamedNode.Wrap);
          let next = iterator.peek();
          while (next != null && indexDefinition.compare(next, startPost) < 0) {
            iterator.getNext();
            next = iterator.peek();
          }
          return iterator;
        }
      }
      getReverseIterator(indexDefinition) {
        return this.getReverseIteratorFrom(indexDefinition.maxPost(), indexDefinition);
      }
      getReverseIteratorFrom(endPost, indexDefinition) {
        const idx = this.resolveIndex_(indexDefinition);
        if (idx) {
          return idx.getReverseIteratorFrom(endPost, (key) => {
            return key;
          });
        } else {
          const iterator = this.children_.getReverseIteratorFrom(endPost.name, NamedNode.Wrap);
          let next = iterator.peek();
          while (next != null && indexDefinition.compare(next, endPost) > 0) {
            iterator.getNext();
            next = iterator.peek();
          }
          return iterator;
        }
      }
      compareTo(other) {
        if (this.isEmpty()) {
          if (other.isEmpty()) {
            return 0;
          } else {
            return -1;
          }
        } else if (other.isLeafNode() || other.isEmpty()) {
          return 1;
        } else if (other === MAX_NODE) {
          return -1;
        } else {
          return 0;
        }
      }
      withIndex(indexDefinition) {
        if (indexDefinition === KEY_INDEX || this.indexMap_.hasIndex(indexDefinition)) {
          return this;
        } else {
          const newIndexMap = this.indexMap_.addIndex(indexDefinition, this.children_);
          return new ChildrenNode(this.children_, this.priorityNode_, newIndexMap);
        }
      }
      isIndexed(index) {
        return index === KEY_INDEX || this.indexMap_.hasIndex(index);
      }
      equals(other) {
        if (other === this) {
          return true;
        } else if (other.isLeafNode()) {
          return false;
        } else {
          const otherChildrenNode = other;
          if (!this.getPriority().equals(otherChildrenNode.getPriority())) {
            return false;
          } else if (this.children_.count() === otherChildrenNode.children_.count()) {
            const thisIter = this.getIterator(PRIORITY_INDEX);
            const otherIter = otherChildrenNode.getIterator(PRIORITY_INDEX);
            let thisCurrent = thisIter.getNext();
            let otherCurrent = otherIter.getNext();
            while (thisCurrent && otherCurrent) {
              if (thisCurrent.name !== otherCurrent.name || !thisCurrent.node.equals(otherCurrent.node)) {
                return false;
              }
              thisCurrent = thisIter.getNext();
              otherCurrent = otherIter.getNext();
            }
            return thisCurrent === null && otherCurrent === null;
          } else {
            return false;
          }
        }
      }
      resolveIndex_(indexDefinition) {
        if (indexDefinition === KEY_INDEX) {
          return null;
        } else {
          return this.indexMap_.get(indexDefinition.toString());
        }
      }
    };
    ChildrenNode.INTEGER_REGEXP_ = /^(0|[1-9]\d*)$/;
    MaxNode = class extends ChildrenNode {
      constructor() {
        super(new SortedMap(NAME_COMPARATOR), ChildrenNode.EMPTY_NODE, IndexMap.Default);
      }
      compareTo(other) {
        if (other === this) {
          return 0;
        } else {
          return 1;
        }
      }
      equals(other) {
        return other === this;
      }
      getPriority() {
        return this;
      }
      getImmediateChild(childName) {
        return ChildrenNode.EMPTY_NODE;
      }
      isEmpty() {
        return false;
      }
    };
    MAX_NODE = new MaxNode();
    Object.defineProperties(NamedNode, {
      MIN: {
        value: new NamedNode(MIN_NAME, ChildrenNode.EMPTY_NODE)
      },
      MAX: {
        value: new NamedNode(MAX_NAME, MAX_NODE)
      }
    });
    KeyIndex.__EMPTY_NODE = ChildrenNode.EMPTY_NODE;
    LeafNode.__childrenNodeConstructor = ChildrenNode;
    setMaxNode$1(MAX_NODE);
    setMaxNode(MAX_NODE);
    USE_HINZE = true;
    setNodeFromJSON(nodeFromJSON);
    PathIndex = class extends Index {
      constructor(indexPath_) {
        super();
        this.indexPath_ = indexPath_;
        assert$1(!pathIsEmpty(indexPath_) && pathGetFront(indexPath_) !== ".priority", "Can't create PathIndex with empty path or .priority key");
      }
      extractChild(snap) {
        return snap.getChild(this.indexPath_);
      }
      isDefinedOn(node) {
        return !node.getChild(this.indexPath_).isEmpty();
      }
      compare(a, b) {
        const aChild = this.extractChild(a.node);
        const bChild = this.extractChild(b.node);
        const indexCmp = aChild.compareTo(bChild);
        if (indexCmp === 0) {
          return nameCompare(a.name, b.name);
        } else {
          return indexCmp;
        }
      }
      makePost(indexValue, name2) {
        const valueNode = nodeFromJSON(indexValue);
        const node = ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, valueNode);
        return new NamedNode(name2, node);
      }
      maxPost() {
        const node = ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, MAX_NODE);
        return new NamedNode(MAX_NAME, node);
      }
      toString() {
        return pathSlice(this.indexPath_, 0).join("/");
      }
    };
    ValueIndex = class extends Index {
      compare(a, b) {
        const indexCmp = a.node.compareTo(b.node);
        if (indexCmp === 0) {
          return nameCompare(a.name, b.name);
        } else {
          return indexCmp;
        }
      }
      isDefinedOn(node) {
        return true;
      }
      indexedValueChanged(oldNode, newNode) {
        return !oldNode.equals(newNode);
      }
      minPost() {
        return NamedNode.MIN;
      }
      maxPost() {
        return NamedNode.MAX;
      }
      makePost(indexValue, name2) {
        const valueNode = nodeFromJSON(indexValue);
        return new NamedNode(name2, valueNode);
      }
      toString() {
        return ".value";
      }
    };
    VALUE_INDEX = new ValueIndex();
    QueryParams = class {
      constructor() {
        this.limitSet_ = false;
        this.startSet_ = false;
        this.startNameSet_ = false;
        this.startAfterSet_ = false;
        this.endSet_ = false;
        this.endNameSet_ = false;
        this.endBeforeSet_ = false;
        this.limit_ = 0;
        this.viewFrom_ = "";
        this.indexStartValue_ = null;
        this.indexStartName_ = "";
        this.indexEndValue_ = null;
        this.indexEndName_ = "";
        this.index_ = PRIORITY_INDEX;
      }
      hasStart() {
        return this.startSet_;
      }
      hasStartAfter() {
        return this.startAfterSet_;
      }
      hasEndBefore() {
        return this.endBeforeSet_;
      }
      isViewFromLeft() {
        if (this.viewFrom_ === "") {
          return this.startSet_;
        } else {
          return this.viewFrom_ === "l";
        }
      }
      getIndexStartValue() {
        assert$1(this.startSet_, "Only valid if start has been set");
        return this.indexStartValue_;
      }
      getIndexStartName() {
        assert$1(this.startSet_, "Only valid if start has been set");
        if (this.startNameSet_) {
          return this.indexStartName_;
        } else {
          return MIN_NAME;
        }
      }
      hasEnd() {
        return this.endSet_;
      }
      getIndexEndValue() {
        assert$1(this.endSet_, "Only valid if end has been set");
        return this.indexEndValue_;
      }
      getIndexEndName() {
        assert$1(this.endSet_, "Only valid if end has been set");
        if (this.endNameSet_) {
          return this.indexEndName_;
        } else {
          return MAX_NAME;
        }
      }
      hasLimit() {
        return this.limitSet_;
      }
      hasAnchoredLimit() {
        return this.limitSet_ && this.viewFrom_ !== "";
      }
      getLimit() {
        assert$1(this.limitSet_, "Only valid if limit has been set");
        return this.limit_;
      }
      getIndex() {
        return this.index_;
      }
      loadsAllData() {
        return !(this.startSet_ || this.endSet_ || this.limitSet_);
      }
      isDefault() {
        return this.loadsAllData() && this.index_ === PRIORITY_INDEX;
      }
      copy() {
        const copy = new QueryParams();
        copy.limitSet_ = this.limitSet_;
        copy.limit_ = this.limit_;
        copy.startSet_ = this.startSet_;
        copy.indexStartValue_ = this.indexStartValue_;
        copy.startNameSet_ = this.startNameSet_;
        copy.indexStartName_ = this.indexStartName_;
        copy.endSet_ = this.endSet_;
        copy.indexEndValue_ = this.indexEndValue_;
        copy.endNameSet_ = this.endNameSet_;
        copy.indexEndName_ = this.indexEndName_;
        copy.index_ = this.index_;
        copy.viewFrom_ = this.viewFrom_;
        return copy;
      }
    };
    ReadonlyRestClient = class extends ServerActions {
      constructor(repoInfo_, onDataUpdate_, authTokenProvider_, appCheckTokenProvider_) {
        super();
        this.repoInfo_ = repoInfo_;
        this.onDataUpdate_ = onDataUpdate_;
        this.authTokenProvider_ = authTokenProvider_;
        this.appCheckTokenProvider_ = appCheckTokenProvider_;
        this.log_ = logWrapper("p:rest:");
        this.listens_ = {};
      }
      reportStats(stats) {
        throw new Error("Method not implemented.");
      }
      static getListenId_(query, tag) {
        if (tag !== void 0) {
          return "tag$" + tag;
        } else {
          assert$1(query._queryParams.isDefault(), "should have a tag if it's not a default query.");
          return query._path.toString();
        }
      }
      listen(query, currentHashFn, tag, onComplete) {
        const pathString = query._path.toString();
        this.log_("Listen called for " + pathString + " " + query._queryIdentifier);
        const listenId = ReadonlyRestClient.getListenId_(query, tag);
        const thisListen = {};
        this.listens_[listenId] = thisListen;
        const queryStringParameters = queryParamsToRestQueryStringParameters(query._queryParams);
        this.restRequest_(pathString + ".json", queryStringParameters, (error22, result) => {
          let data = result;
          if (error22 === 404) {
            data = null;
            error22 = null;
          }
          if (error22 === null) {
            this.onDataUpdate_(pathString, data, false, tag);
          }
          if (safeGet(this.listens_, listenId) === thisListen) {
            let status;
            if (!error22) {
              status = "ok";
            } else if (error22 === 401) {
              status = "permission_denied";
            } else {
              status = "rest_error:" + error22;
            }
            onComplete(status, null);
          }
        });
      }
      unlisten(query, tag) {
        const listenId = ReadonlyRestClient.getListenId_(query, tag);
        delete this.listens_[listenId];
      }
      get(query) {
        const queryStringParameters = queryParamsToRestQueryStringParameters(query._queryParams);
        const pathString = query._path.toString();
        const deferred = new Deferred();
        this.restRequest_(pathString + ".json", queryStringParameters, (error22, result) => {
          let data = result;
          if (error22 === 404) {
            data = null;
            error22 = null;
          }
          if (error22 === null) {
            this.onDataUpdate_(pathString, data, false, null);
            deferred.resolve(data);
          } else {
            deferred.reject(new Error(data));
          }
        });
        return deferred.promise;
      }
      refreshAuthToken(token) {
      }
      restRequest_(pathString, queryStringParameters = {}, callback) {
        queryStringParameters["format"] = "export";
        return Promise.all([
          this.authTokenProvider_.getToken(false),
          this.appCheckTokenProvider_.getToken(false)
        ]).then(([authToken, appCheckToken]) => {
          if (authToken && authToken.accessToken) {
            queryStringParameters["auth"] = authToken.accessToken;
          }
          if (appCheckToken && appCheckToken.token) {
            queryStringParameters["ac"] = appCheckToken.token;
          }
          const url2 = (this.repoInfo_.secure ? "https://" : "http://") + this.repoInfo_.host + pathString + "?ns=" + this.repoInfo_.namespace + querystring(queryStringParameters);
          this.log_("Sending REST request for " + url2);
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = () => {
            if (callback && xhr.readyState === 4) {
              this.log_("REST Response for " + url2 + " received. status:", xhr.status, "response:", xhr.responseText);
              let res = null;
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  res = jsonEval(xhr.responseText);
                } catch (e) {
                  warn("Failed to parse JSON response for " + url2 + ": " + xhr.responseText);
                }
                callback(null, res);
              } else {
                if (xhr.status !== 401 && xhr.status !== 404) {
                  warn("Got unsuccessful REST response for " + url2 + " Status: " + xhr.status);
                }
                callback(xhr.status);
              }
              callback = null;
            }
          };
          xhr.open("GET", url2, true);
          xhr.send();
        });
      }
    };
    SnapshotHolder = class {
      constructor() {
        this.rootNode_ = ChildrenNode.EMPTY_NODE;
      }
      getNode(path) {
        return this.rootNode_.getChild(path);
      }
      updateSnapshot(path, newSnapshotNode) {
        this.rootNode_ = this.rootNode_.updateChild(path, newSnapshotNode);
      }
    };
    StatsListener = class {
      constructor(collection_) {
        this.collection_ = collection_;
        this.last_ = null;
      }
      get() {
        const newStats = this.collection_.get();
        const delta = Object.assign({}, newStats);
        if (this.last_) {
          each(this.last_, (stat, value) => {
            delta[stat] = delta[stat] - value;
          });
        }
        this.last_ = newStats;
        return delta;
      }
    };
    FIRST_STATS_MIN_TIME = 10 * 1e3;
    FIRST_STATS_MAX_TIME = 30 * 1e3;
    REPORT_STATS_INTERVAL = 5 * 60 * 1e3;
    StatsReporter = class {
      constructor(collection, server_) {
        this.server_ = server_;
        this.statsToReport_ = {};
        this.statsListener_ = new StatsListener(collection);
        const timeout = FIRST_STATS_MIN_TIME + (FIRST_STATS_MAX_TIME - FIRST_STATS_MIN_TIME) * Math.random();
        setTimeoutNonBlocking(this.reportStats_.bind(this), Math.floor(timeout));
      }
      reportStats_() {
        const stats = this.statsListener_.get();
        const reportedStats = {};
        let haveStatsToReport = false;
        each(stats, (stat, value) => {
          if (value > 0 && contains(this.statsToReport_, stat)) {
            reportedStats[stat] = value;
            haveStatsToReport = true;
          }
        });
        if (haveStatsToReport) {
          this.server_.reportStats(reportedStats);
        }
        setTimeoutNonBlocking(this.reportStats_.bind(this), Math.floor(Math.random() * 2 * REPORT_STATS_INTERVAL));
      }
    };
    (function(OperationType2) {
      OperationType2[OperationType2["OVERWRITE"] = 0] = "OVERWRITE";
      OperationType2[OperationType2["MERGE"] = 1] = "MERGE";
      OperationType2[OperationType2["ACK_USER_WRITE"] = 2] = "ACK_USER_WRITE";
      OperationType2[OperationType2["LISTEN_COMPLETE"] = 3] = "LISTEN_COMPLETE";
    })(OperationType || (OperationType = {}));
    AckUserWrite = class {
      constructor(path, affectedTree, revert) {
        this.path = path;
        this.affectedTree = affectedTree;
        this.revert = revert;
        this.type = OperationType.ACK_USER_WRITE;
        this.source = newOperationSourceUser();
      }
      operationForChild(childName) {
        if (!pathIsEmpty(this.path)) {
          assert$1(pathGetFront(this.path) === childName, "operationForChild called for unrelated child.");
          return new AckUserWrite(pathPopFront(this.path), this.affectedTree, this.revert);
        } else if (this.affectedTree.value != null) {
          assert$1(this.affectedTree.children.isEmpty(), "affectedTree should not have overlapping affected paths.");
          return this;
        } else {
          const childTree = this.affectedTree.subtree(new Path(childName));
          return new AckUserWrite(newEmptyPath(), childTree, this.revert);
        }
      }
    };
    Overwrite = class {
      constructor(source, path, snap) {
        this.source = source;
        this.path = path;
        this.snap = snap;
        this.type = OperationType.OVERWRITE;
      }
      operationForChild(childName) {
        if (pathIsEmpty(this.path)) {
          return new Overwrite(this.source, newEmptyPath(), this.snap.getImmediateChild(childName));
        } else {
          return new Overwrite(this.source, pathPopFront(this.path), this.snap);
        }
      }
    };
    Merge = class {
      constructor(source, path, children) {
        this.source = source;
        this.path = path;
        this.children = children;
        this.type = OperationType.MERGE;
      }
      operationForChild(childName) {
        if (pathIsEmpty(this.path)) {
          const childTree = this.children.subtree(new Path(childName));
          if (childTree.isEmpty()) {
            return null;
          } else if (childTree.value) {
            return new Overwrite(this.source, newEmptyPath(), childTree.value);
          } else {
            return new Merge(this.source, newEmptyPath(), childTree);
          }
        } else {
          assert$1(pathGetFront(this.path) === childName, "Can't get a merge for a child not on the path of the operation");
          return new Merge(this.source, pathPopFront(this.path), this.children);
        }
      }
      toString() {
        return "Operation(" + this.path + ": " + this.source.toString() + " merge: " + this.children.toString() + ")";
      }
    };
    CacheNode = class {
      constructor(node_, fullyInitialized_, filtered_) {
        this.node_ = node_;
        this.fullyInitialized_ = fullyInitialized_;
        this.filtered_ = filtered_;
      }
      isFullyInitialized() {
        return this.fullyInitialized_;
      }
      isFiltered() {
        return this.filtered_;
      }
      isCompleteForPath(path) {
        if (pathIsEmpty(path)) {
          return this.isFullyInitialized() && !this.filtered_;
        }
        const childKey = pathGetFront(path);
        return this.isCompleteForChild(childKey);
      }
      isCompleteForChild(key) {
        return this.isFullyInitialized() && !this.filtered_ || this.node_.hasChild(key);
      }
      getNode() {
        return this.node_;
      }
    };
    EmptyChildren = () => {
      if (!emptyChildrenSingleton) {
        emptyChildrenSingleton = new SortedMap(stringCompare);
      }
      return emptyChildrenSingleton;
    };
    ImmutableTree = class {
      constructor(value, children = EmptyChildren()) {
        this.value = value;
        this.children = children;
      }
      static fromObject(obj) {
        let tree = new ImmutableTree(null);
        each(obj, (childPath, childSnap) => {
          tree = tree.set(new Path(childPath), childSnap);
        });
        return tree;
      }
      isEmpty() {
        return this.value === null && this.children.isEmpty();
      }
      findRootMostMatchingPathAndValue(relativePath, predicate) {
        if (this.value != null && predicate(this.value)) {
          return { path: newEmptyPath(), value: this.value };
        } else {
          if (pathIsEmpty(relativePath)) {
            return null;
          } else {
            const front = pathGetFront(relativePath);
            const child = this.children.get(front);
            if (child !== null) {
              const childExistingPathAndValue = child.findRootMostMatchingPathAndValue(pathPopFront(relativePath), predicate);
              if (childExistingPathAndValue != null) {
                const fullPath = pathChild(new Path(front), childExistingPathAndValue.path);
                return { path: fullPath, value: childExistingPathAndValue.value };
              } else {
                return null;
              }
            } else {
              return null;
            }
          }
        }
      }
      findRootMostValueAndPath(relativePath) {
        return this.findRootMostMatchingPathAndValue(relativePath, () => true);
      }
      subtree(relativePath) {
        if (pathIsEmpty(relativePath)) {
          return this;
        } else {
          const front = pathGetFront(relativePath);
          const childTree = this.children.get(front);
          if (childTree !== null) {
            return childTree.subtree(pathPopFront(relativePath));
          } else {
            return new ImmutableTree(null);
          }
        }
      }
      set(relativePath, toSet) {
        if (pathIsEmpty(relativePath)) {
          return new ImmutableTree(toSet, this.children);
        } else {
          const front = pathGetFront(relativePath);
          const child = this.children.get(front) || new ImmutableTree(null);
          const newChild = child.set(pathPopFront(relativePath), toSet);
          const newChildren = this.children.insert(front, newChild);
          return new ImmutableTree(this.value, newChildren);
        }
      }
      remove(relativePath) {
        if (pathIsEmpty(relativePath)) {
          if (this.children.isEmpty()) {
            return new ImmutableTree(null);
          } else {
            return new ImmutableTree(null, this.children);
          }
        } else {
          const front = pathGetFront(relativePath);
          const child = this.children.get(front);
          if (child) {
            const newChild = child.remove(pathPopFront(relativePath));
            let newChildren;
            if (newChild.isEmpty()) {
              newChildren = this.children.remove(front);
            } else {
              newChildren = this.children.insert(front, newChild);
            }
            if (this.value === null && newChildren.isEmpty()) {
              return new ImmutableTree(null);
            } else {
              return new ImmutableTree(this.value, newChildren);
            }
          } else {
            return this;
          }
        }
      }
      get(relativePath) {
        if (pathIsEmpty(relativePath)) {
          return this.value;
        } else {
          const front = pathGetFront(relativePath);
          const child = this.children.get(front);
          if (child) {
            return child.get(pathPopFront(relativePath));
          } else {
            return null;
          }
        }
      }
      setTree(relativePath, newTree) {
        if (pathIsEmpty(relativePath)) {
          return newTree;
        } else {
          const front = pathGetFront(relativePath);
          const child = this.children.get(front) || new ImmutableTree(null);
          const newChild = child.setTree(pathPopFront(relativePath), newTree);
          let newChildren;
          if (newChild.isEmpty()) {
            newChildren = this.children.remove(front);
          } else {
            newChildren = this.children.insert(front, newChild);
          }
          return new ImmutableTree(this.value, newChildren);
        }
      }
      fold(fn) {
        return this.fold_(newEmptyPath(), fn);
      }
      fold_(pathSoFar, fn) {
        const accum = {};
        this.children.inorderTraversal((childKey, childTree) => {
          accum[childKey] = childTree.fold_(pathChild(pathSoFar, childKey), fn);
        });
        return fn(pathSoFar, this.value, accum);
      }
      findOnPath(path, f) {
        return this.findOnPath_(path, newEmptyPath(), f);
      }
      findOnPath_(pathToFollow, pathSoFar, f) {
        const result = this.value ? f(pathSoFar, this.value) : false;
        if (result) {
          return result;
        } else {
          if (pathIsEmpty(pathToFollow)) {
            return null;
          } else {
            const front = pathGetFront(pathToFollow);
            const nextChild = this.children.get(front);
            if (nextChild) {
              return nextChild.findOnPath_(pathPopFront(pathToFollow), pathChild(pathSoFar, front), f);
            } else {
              return null;
            }
          }
        }
      }
      foreachOnPath(path, f) {
        return this.foreachOnPath_(path, newEmptyPath(), f);
      }
      foreachOnPath_(pathToFollow, currentRelativePath, f) {
        if (pathIsEmpty(pathToFollow)) {
          return this;
        } else {
          if (this.value) {
            f(currentRelativePath, this.value);
          }
          const front = pathGetFront(pathToFollow);
          const nextChild = this.children.get(front);
          if (nextChild) {
            return nextChild.foreachOnPath_(pathPopFront(pathToFollow), pathChild(currentRelativePath, front), f);
          } else {
            return new ImmutableTree(null);
          }
        }
      }
      foreach(f) {
        this.foreach_(newEmptyPath(), f);
      }
      foreach_(currentRelativePath, f) {
        this.children.inorderTraversal((childName, childTree) => {
          childTree.foreach_(pathChild(currentRelativePath, childName), f);
        });
        if (this.value) {
          f(currentRelativePath, this.value);
        }
      }
      foreachChild(f) {
        this.children.inorderTraversal((childName, childTree) => {
          if (childTree.value) {
            f(childName, childTree.value);
          }
        });
      }
    };
    CompoundWrite = class {
      constructor(writeTree_) {
        this.writeTree_ = writeTree_;
      }
      static empty() {
        return new CompoundWrite(new ImmutableTree(null));
      }
    };
    ChildChangeAccumulator = class {
      constructor() {
        this.changeMap = new Map();
      }
      trackChildChange(change) {
        const type = change.type;
        const childKey = change.childName;
        assert$1(type === "child_added" || type === "child_changed" || type === "child_removed", "Only child changes supported for tracking");
        assert$1(childKey !== ".priority", "Only non-priority child changes can be tracked.");
        const oldChange = this.changeMap.get(childKey);
        if (oldChange) {
          const oldType = oldChange.type;
          if (type === "child_added" && oldType === "child_removed") {
            this.changeMap.set(childKey, changeChildChanged(childKey, change.snapshotNode, oldChange.snapshotNode));
          } else if (type === "child_removed" && oldType === "child_added") {
            this.changeMap.delete(childKey);
          } else if (type === "child_removed" && oldType === "child_changed") {
            this.changeMap.set(childKey, changeChildRemoved(childKey, oldChange.oldSnap));
          } else if (type === "child_changed" && oldType === "child_added") {
            this.changeMap.set(childKey, changeChildAdded(childKey, change.snapshotNode));
          } else if (type === "child_changed" && oldType === "child_changed") {
            this.changeMap.set(childKey, changeChildChanged(childKey, change.snapshotNode, oldChange.oldSnap));
          } else {
            throw assertionError("Illegal combination of changes: " + change + " occurred after " + oldChange);
          }
        } else {
          this.changeMap.set(childKey, change);
        }
      }
      getChanges() {
        return Array.from(this.changeMap.values());
      }
    };
    NoCompleteChildSource_ = class {
      getCompleteChild(childKey) {
        return null;
      }
      getChildAfterChild(index, child, reverse) {
        return null;
      }
    };
    NO_COMPLETE_CHILD_SOURCE = new NoCompleteChildSource_();
    WriteTreeCompleteChildSource = class {
      constructor(writes_, viewCache_, optCompleteServerCache_ = null) {
        this.writes_ = writes_;
        this.viewCache_ = viewCache_;
        this.optCompleteServerCache_ = optCompleteServerCache_;
      }
      getCompleteChild(childKey) {
        const node = this.viewCache_.eventCache;
        if (node.isCompleteForChild(childKey)) {
          return node.getNode().getImmediateChild(childKey);
        } else {
          const serverNode = this.optCompleteServerCache_ != null ? new CacheNode(this.optCompleteServerCache_, true, false) : this.viewCache_.serverCache;
          return writeTreeRefCalcCompleteChild(this.writes_, childKey, serverNode);
        }
      }
      getChildAfterChild(index, child, reverse) {
        const completeServerData = this.optCompleteServerCache_ != null ? this.optCompleteServerCache_ : viewCacheGetCompleteServerSnap(this.viewCache_);
        const nodes = writeTreeRefCalcIndexedSlice(this.writes_, completeServerData, child, 1, reverse, index);
        if (nodes.length === 0) {
          return null;
        } else {
          return nodes[0];
        }
      }
    };
    SyncTree = class {
      constructor(listenProvider_) {
        this.listenProvider_ = listenProvider_;
        this.syncPointTree_ = new ImmutableTree(null);
        this.pendingWriteTree_ = newWriteTree();
        this.tagToQueryMap = new Map();
        this.queryToTagMap = new Map();
      }
    };
    ExistingValueProvider = class {
      constructor(node_) {
        this.node_ = node_;
      }
      getImmediateChild(childName) {
        const child = this.node_.getImmediateChild(childName);
        return new ExistingValueProvider(child);
      }
      node() {
        return this.node_;
      }
    };
    DeferredValueProvider = class {
      constructor(syncTree, path) {
        this.syncTree_ = syncTree;
        this.path_ = path;
      }
      getImmediateChild(childName) {
        const childPath = pathChild(this.path_, childName);
        return new DeferredValueProvider(this.syncTree_, childPath);
      }
      node() {
        return syncTreeCalcCompleteEventCache(this.syncTree_, this.path_);
      }
    };
    generateWithValues = function(values) {
      values = values || {};
      values["timestamp"] = values["timestamp"] || new Date().getTime();
      return values;
    };
    resolveDeferredLeafValue = function(value, existingVal, serverValues) {
      if (!value || typeof value !== "object") {
        return value;
      }
      assert$1(".sv" in value, "Unexpected leaf node or priority contents");
      if (typeof value[".sv"] === "string") {
        return resolveScalarDeferredValue(value[".sv"], existingVal, serverValues);
      } else if (typeof value[".sv"] === "object") {
        return resolveComplexDeferredValue(value[".sv"], existingVal);
      } else {
        assert$1(false, "Unexpected server value: " + JSON.stringify(value, null, 2));
      }
    };
    resolveScalarDeferredValue = function(op, existing, serverValues) {
      switch (op) {
        case "timestamp":
          return serverValues["timestamp"];
        default:
          assert$1(false, "Unexpected server value: " + op);
      }
    };
    resolveComplexDeferredValue = function(op, existing, unused) {
      if (!op.hasOwnProperty("increment")) {
        assert$1(false, "Unexpected server value: " + JSON.stringify(op, null, 2));
      }
      const delta = op["increment"];
      if (typeof delta !== "number") {
        assert$1(false, "Unexpected increment value: " + delta);
      }
      const existingNode = existing.node();
      assert$1(existingNode !== null && typeof existingNode !== "undefined", "Expected ChildrenNode.EMPTY_NODE for nulls");
      if (!existingNode.isLeafNode()) {
        return delta;
      }
      const leaf = existingNode;
      const existingVal = leaf.getValue();
      if (typeof existingVal !== "number") {
        return delta;
      }
      return existingVal + delta;
    };
    resolveDeferredValueTree = function(path, node, syncTree, serverValues) {
      return resolveDeferredValue(node, new DeferredValueProvider(syncTree, path), serverValues);
    };
    resolveDeferredValueSnapshot = function(node, existing, serverValues) {
      return resolveDeferredValue(node, new ExistingValueProvider(existing), serverValues);
    };
    Tree = class {
      constructor(name2 = "", parent = null, node = { children: {}, childCount: 0 }) {
        this.name = name2;
        this.parent = parent;
        this.node = node;
      }
    };
    INVALID_KEY_REGEX_ = /[\[\].#$\/\u0000-\u001F\u007F]/;
    INVALID_PATH_REGEX_ = /[\[\].#$\u0000-\u001F\u007F]/;
    MAX_LEAF_SIZE_ = 10 * 1024 * 1024;
    isValidKey = function(key) {
      return typeof key === "string" && key.length !== 0 && !INVALID_KEY_REGEX_.test(key);
    };
    isValidPathString = function(pathString) {
      return typeof pathString === "string" && pathString.length !== 0 && !INVALID_PATH_REGEX_.test(pathString);
    };
    isValidRootPathString = function(pathString) {
      if (pathString) {
        pathString = pathString.replace(/^\/*\.info(\/|$)/, "/");
      }
      return isValidPathString(pathString);
    };
    validateFirebaseData = function(errorPrefix2, data, path_) {
      const path = path_ instanceof Path ? new ValidationPath(path_, errorPrefix2) : path_;
      if (data === void 0) {
        throw new Error(errorPrefix2 + "contains undefined " + validationPathToErrorString(path));
      }
      if (typeof data === "function") {
        throw new Error(errorPrefix2 + "contains a function " + validationPathToErrorString(path) + " with contents = " + data.toString());
      }
      if (isInvalidJSONNumber(data)) {
        throw new Error(errorPrefix2 + "contains " + data.toString() + " " + validationPathToErrorString(path));
      }
      if (typeof data === "string" && data.length > MAX_LEAF_SIZE_ / 3 && stringLength(data) > MAX_LEAF_SIZE_) {
        throw new Error(errorPrefix2 + "contains a string greater than " + MAX_LEAF_SIZE_ + " utf8 bytes " + validationPathToErrorString(path) + " ('" + data.substring(0, 50) + "...')");
      }
      if (data && typeof data === "object") {
        let hasDotValue = false;
        let hasActualChild = false;
        each(data, (key, value) => {
          if (key === ".value") {
            hasDotValue = true;
          } else if (key !== ".priority" && key !== ".sv") {
            hasActualChild = true;
            if (!isValidKey(key)) {
              throw new Error(errorPrefix2 + " contains an invalid key (" + key + ") " + validationPathToErrorString(path) + `.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);
            }
          }
          validationPathPush(path, key);
          validateFirebaseData(errorPrefix2, value, path);
          validationPathPop(path);
        });
        if (hasDotValue && hasActualChild) {
          throw new Error(errorPrefix2 + ' contains ".value" child ' + validationPathToErrorString(path) + " in addition to actual children.");
        }
      }
    };
    validateUrl = function(fnName, parsedUrl) {
      const pathString = parsedUrl.path.toString();
      if (!(typeof parsedUrl.repoInfo.host === "string") || parsedUrl.repoInfo.host.length === 0 || !isValidKey(parsedUrl.repoInfo.namespace) && parsedUrl.repoInfo.host.split(":")[0] !== "localhost" || pathString.length !== 0 && !isValidRootPathString(pathString)) {
        throw new Error(errorPrefix(fnName, "url") + `must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`);
      }
    };
    EventQueue = class {
      constructor() {
        this.eventLists_ = [];
        this.recursionDepth_ = 0;
      }
    };
    INTERRUPT_REASON = "repo_interrupt";
    MAX_TRANSACTION_RETRIES = 25;
    Repo = class {
      constructor(repoInfo_, forceRestClient_, authTokenProvider_, appCheckProvider_) {
        this.repoInfo_ = repoInfo_;
        this.forceRestClient_ = forceRestClient_;
        this.authTokenProvider_ = authTokenProvider_;
        this.appCheckProvider_ = appCheckProvider_;
        this.dataUpdateCount = 0;
        this.statsListener_ = null;
        this.eventQueue_ = new EventQueue();
        this.nextWriteId_ = 1;
        this.interceptServerDataCallback_ = null;
        this.onDisconnect_ = newSparseSnapshotTree();
        this.transactionQueueTree_ = new Tree();
        this.persistentConnection_ = null;
        this.key = this.repoInfo_.toURLString();
      }
      toString() {
        return (this.repoInfo_.secure ? "https://" : "http://") + this.repoInfo_.host;
      }
    };
    parseRepoInfo = function(dataURL, nodeAdmin) {
      const parsedUrl = parseDatabaseURL(dataURL), namespace = parsedUrl.namespace;
      if (parsedUrl.domain === "firebase.com") {
        fatal(parsedUrl.host + " is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");
      }
      if ((!namespace || namespace === "undefined") && parsedUrl.domain !== "localhost") {
        fatal("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");
      }
      if (!parsedUrl.secure) {
        warnIfPageIsSecure();
      }
      const webSocketOnly = parsedUrl.scheme === "ws" || parsedUrl.scheme === "wss";
      return {
        repoInfo: new RepoInfo(parsedUrl.host, parsedUrl.secure, namespace, nodeAdmin, webSocketOnly, "", namespace !== parsedUrl.subdomain),
        path: new Path(parsedUrl.pathString)
      };
    };
    parseDatabaseURL = function(dataURL) {
      let host = "", domain = "", subdomain = "", pathString = "", namespace = "";
      let secure = true, scheme = "https", port = 443;
      if (typeof dataURL === "string") {
        let colonInd = dataURL.indexOf("//");
        if (colonInd >= 0) {
          scheme = dataURL.substring(0, colonInd - 1);
          dataURL = dataURL.substring(colonInd + 2);
        }
        let slashInd = dataURL.indexOf("/");
        if (slashInd === -1) {
          slashInd = dataURL.length;
        }
        let questionMarkInd = dataURL.indexOf("?");
        if (questionMarkInd === -1) {
          questionMarkInd = dataURL.length;
        }
        host = dataURL.substring(0, Math.min(slashInd, questionMarkInd));
        if (slashInd < questionMarkInd) {
          pathString = decodePath(dataURL.substring(slashInd, questionMarkInd));
        }
        const queryParams = decodeQuery(dataURL.substring(Math.min(dataURL.length, questionMarkInd)));
        colonInd = host.indexOf(":");
        if (colonInd >= 0) {
          secure = scheme === "https" || scheme === "wss";
          port = parseInt(host.substring(colonInd + 1), 10);
        } else {
          colonInd = host.length;
        }
        const hostWithoutPort = host.slice(0, colonInd);
        if (hostWithoutPort.toLowerCase() === "localhost") {
          domain = "localhost";
        } else if (hostWithoutPort.split(".").length <= 2) {
          domain = hostWithoutPort;
        } else {
          const dotInd = host.indexOf(".");
          subdomain = host.substring(0, dotInd).toLowerCase();
          domain = host.substring(dotInd + 1);
          namespace = subdomain;
        }
        if ("ns" in queryParams) {
          namespace = queryParams["ns"];
        }
      }
      return {
        host,
        port,
        domain,
        subdomain,
        secure,
        scheme,
        pathString,
        namespace
      };
    };
    QueryImpl = class {
      constructor(_repo, _path, _queryParams, _orderByCalled) {
        this._repo = _repo;
        this._path = _path;
        this._queryParams = _queryParams;
        this._orderByCalled = _orderByCalled;
      }
      get key() {
        if (pathIsEmpty(this._path)) {
          return null;
        } else {
          return pathGetBack(this._path);
        }
      }
      get ref() {
        return new ReferenceImpl(this._repo, this._path);
      }
      get _queryIdentifier() {
        const obj = queryParamsGetQueryObject(this._queryParams);
        const id = ObjectToUniqueKey(obj);
        return id === "{}" ? "default" : id;
      }
      get _queryObject() {
        return queryParamsGetQueryObject(this._queryParams);
      }
      isEqual(other) {
        other = getModularInstance(other);
        if (!(other instanceof QueryImpl)) {
          return false;
        }
        const sameRepo = this._repo === other._repo;
        const samePath = pathEquals(this._path, other._path);
        const sameQueryIdentifier = this._queryIdentifier === other._queryIdentifier;
        return sameRepo && samePath && sameQueryIdentifier;
      }
      toJSON() {
        return this.toString();
      }
      toString() {
        return this._repo.toString() + pathToUrlEncodedString(this._path);
      }
    };
    ReferenceImpl = class extends QueryImpl {
      constructor(repo, path) {
        super(repo, path, new QueryParams(), false);
      }
      get parent() {
        const parentPath = pathParent(this._path);
        return parentPath === null ? null : new ReferenceImpl(this._repo, parentPath);
      }
      get root() {
        let ref = this;
        while (ref.parent !== null) {
          ref = ref.parent;
        }
        return ref;
      }
    };
    syncPointSetReferenceConstructor(ReferenceImpl);
    syncTreeSetReferenceConstructor(ReferenceImpl);
    FIREBASE_DATABASE_EMULATOR_HOST_VAR = "FIREBASE_DATABASE_EMULATOR_HOST";
    repos = {};
    useRestClient = false;
    Database = class {
      constructor(_repoInternal, app2) {
        this._repoInternal = _repoInternal;
        this.app = app2;
        this["type"] = "database";
        this._instanceStarted = false;
      }
      get _repo() {
        if (!this._instanceStarted) {
          repoStart(this._repoInternal, this.app.options.appId, this.app.options["databaseAuthVariableOverride"]);
          this._instanceStarted = true;
        }
        return this._repoInternal;
      }
      get _root() {
        if (!this._rootInternal) {
          this._rootInternal = new ReferenceImpl(this._repo, newEmptyPath());
        }
        return this._rootInternal;
      }
      _delete() {
        if (this._rootInternal !== null) {
          repoManagerDeleteRepo(this._repo, this.app.name);
          this._repoInternal = null;
          this._rootInternal = null;
        }
        return Promise.resolve();
      }
      _checkNotDeleted(apiName) {
        if (this._rootInternal === null) {
          fatal("Cannot call " + apiName + " on a deleted database.");
        }
      }
    };
    PersistentConnection.prototype.simpleListen = function(pathString, onComplete) {
      this.sendRequest("q", { p: pathString }, onComplete);
    };
    PersistentConnection.prototype.echo = function(data, onEcho) {
      this.sendRequest("echo", { d: data }, onEcho);
    };
    setWebSocketImpl(websocket.Client);
    registerDatabase("node");
    css = {
      code: ".navigation.svelte-1n6vqxg{background-image:url('/images/banner.png');background-repeat:repeat-x;background-size:auto 100%}.mi.svelte-1n6vqxg{vertical-align:middle}.u-sr-only.svelte-1n6vqxg{position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden}",
      map: null
    };
    NavBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      $$result.css.add(css);
      return `<div class="${"flex navigation content-start svelte-1n6vqxg"}"><a href="${"/"}"><img src="${"/images/logo_128.png"}" alt="${"Searles Logo"}" width="${"128"}"></a>
	<div class="${"flex-grow"}"></div>
	<div><button class="${"text-4xl text-yellow"}"><i class="${"mi mi-menu svelte-1n6vqxg"}"><span class="${"u-sr-only svelte-1n6vqxg"}">Menu</span></i></button></div>
</div>`;
    });
    ToolButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { src: src2 } = $$props;
      if ($$props.src === void 0 && $$bindings.src && src2 !== void 0)
        $$bindings.src(src2);
      return `<button class="${"rounded-xl bg-yellow-dark w-12 h-12 flex justify-center justify-items-center items-center"}"><img${add_attribute("src", src2, 0)} alt="${"icon button"}" class="${"flex-grow-0"}"></button>`;
    });
    ToolBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `<div class="${"flex p-3 justify-around bg-yellow"}">${validate_component(ToolButton, "ToolButton").$$render($$result, { src: "/icons/booking.svg" }, {}, {})}
	${validate_component(ToolButton, "ToolButton").$$render($$result, { src: "/icons/location.svg" }, {}, {})}
	${validate_component(ToolButton, "ToolButton").$$render($$result, { src: "/icons/call.svg" }, {}, {})}
	${validate_component(ToolButton, "ToolButton").$$render($$result, { src: "/icons/facebook.svg" }, {}, {})}
	${validate_component(ToolButton, "ToolButton").$$render($$result, { src: "/icons/instagram.svg" }, {}, {})}</div>`;
    });
    _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${$$result.head += `<style data-svelte="svelte-11ymluc">body {
			background: #1a1a1a;
		}
	</style>`, ""}

<div class="${"flex flex-col h-screen"}">${validate_component(NavBar, "NavBar").$$render($$result, {}, {}, {})}

	${slots.default ? slots.default({}) : ``}

	${validate_component(ToolBar, "ToolBar").$$render($$result, {}, {}, {})}</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/error-28507a7c.js
var error_28507a7c_exports = {};
__export(error_28507a7c_exports, {
  default: () => Error2,
  load: () => load
});
function load({ error: error3, status }) {
  return { props: { error: error3, status } };
}
var Error2;
var init_error_28507a7c = __esm({
  ".svelte-kit/output/server/chunks/error-28507a7c.js"() {
    init_shims();
    init_app_a5a3d39a();
    Error2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { status } = $$props;
      let { error: error3 } = $$props;
      if ($$props.status === void 0 && $$bindings.status && status !== void 0)
        $$bindings.status(status);
      if ($$props.error === void 0 && $$bindings.error && error3 !== void 0)
        $$bindings.error(error3);
      return `<h1>${escape(status)}</h1>

<pre>${escape(error3.message)}</pre>



${error3.frame ? `<pre>${escape(error3.frame)}</pre>` : ``}
${error3.stack ? `<pre>${escape(error3.stack)}</pre>` : ``}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-ffbec005.js
var index_ffbec005_exports = {};
__export(index_ffbec005_exports, {
  default: () => Routes
});
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
var subscriber_queue, homeLayout, HomeItem, Routes;
var init_index_ffbec005 = __esm({
  ".svelte-kit/output/server/chunks/index-ffbec005.js"() {
    init_shims();
    init_app_a5a3d39a();
    subscriber_queue = [];
    homeLayout = writable({
      order: ["Events"],
      Events: ["Blackboard Menu", "Upcoming Events", "Latest Posts"]
    });
    HomeItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { title } = $$props;
      let { items } = $$props;
      if ($$props.title === void 0 && $$bindings.title && title !== void 0)
        $$bindings.title(title);
      if ($$props.items === void 0 && $$bindings.items && items !== void 0)
        $$bindings.items(items);
      return `<a href="${"/" + escape(title.toLowerCase())}" class="${"bg-blue text-yellow flex-1 flex flex-col justify-around p-3"}"><h2 class="${"text-xl font-bold uppercase"}">${escape(title)}</h2>
	${each2(items, (item) => `<a href="${"/" + escape(title.toLowerCase()) + "#" + escape(item.toLowerCase().replace(/ /g, "-"))}"><h3 class="${"text-base"}">${escape(item)}</h3></a>`)}</a>`;
    });
    Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let layout;
      homeLayout.subscribe((value) => {
        layout = value;
        console.log(value);
      });
      return `${$$result.head += `${$$result.title = `<title>Searles Garagiste</title>`, ""}`, ""}

<div class="${"flex flex-col justify-around flex-grow gap-3 py-3"}">${each2(layout.order, (key) => `${validate_component(HomeItem, "HomeItem").$$render($$result, { title: key, items: layout[key] }, {}, {})}`)}</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/app-a5a3d39a.js
function get_single_valued_header(headers2, key) {
  const value = headers2[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error2(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler(__spreadProps(__spreadValues({}, request), { params }));
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error2(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers: headers2 = {} } = response;
  headers2 = lowercase_keys(headers2);
  const type = get_single_valued_header(headers2, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error2(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers2 = __spreadProps(__spreadValues({}, headers2), { "content-type": "application/json; charset=utf-8" });
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers: headers2 };
}
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
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
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify2(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify2(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify2(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify2).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify2(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify2(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name2, thing) {
      params_1.push(name2);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify2(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name2 + "[" + i + "]=" + stringify2(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name2 + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify2(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name2 + "." + Array.from(thing).map(function(_a2) {
            var k = _a2[0], v = _a2[1];
            return "set(" + stringify2(k) + ", " + stringify2(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name2 + safeProp(key) + "=" + stringify2(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name2 = "";
  do {
    name2 = chars[num % chars.length] + name2;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name2) ? name2 + "_" : name2;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal$1(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function writable2(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal$1(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue2.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error22,
  page
}) {
  const css22 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error22) {
    error22.stack = options2.get_stack(error22);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url2) => css22.add(url2));
      if (node.js)
        node.js.forEach((url2) => js.add(url2));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable2($session);
    const props = {
      stores: {
        page: writable2(null),
        navigating: writable2(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css22).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error22)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${page && page.path ? try_serialize(page.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page && page.query ? s$1(page.query.toString()) : ""}),
						params: ${page && page.params ? try_serialize(page.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url: url2, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url2)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers2 = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers2["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers2["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers: headers2,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error22) {
  if (!error22)
    return null;
  let serialized = try_serialize(error22);
  if (!serialized) {
    const { name: name2, message: message2, stack } = error22;
    serialized = try_serialize(__spreadProps(__spreadValues({}, error22), { name: name2, message: message2, stack }));
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error22 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error22 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error22}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error22 };
    }
    return { status, error: error22 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error22
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url2;
        if (typeof resource === "string") {
          url2 = resource;
        } else {
          url2 = resource.url;
          opts = __spreadValues({
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity
          }, opts);
        }
        const resolved = resolve(request.path, url2.split("?")[0]);
        let response;
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers2 = __spreadValues({}, opts.headers);
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers2.cookie = request.headers.cookie;
            if (!headers2.authorization) {
              headers2.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url2.includes("?") ? url2.slice(url2.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers: headers2,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url2,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url2}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url2);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = __spreadProps(__spreadValues({}, opts.headers), {
                cookie: request.headers.cookie
              });
            }
          }
          const external_request = new Request(url2, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy2 = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers2 = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers2[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url: url2,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers2)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy2;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: __spreadValues({}, stuff)
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error22;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
function resolve(base22, path) {
  const base_match = absolute.exec(base22);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base22}"`);
  }
  const baseparts = path_match ? [] : base22.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error22 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error22
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error22,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {}
    };
  }
  let branch = [];
  let status = 200;
  let error22;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node(__spreadProps(__spreadValues({}, opts), {
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            }));
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error22 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error22 = e;
          }
          if (loaded && !error22) {
            branch.push(loaded);
          }
          if (error22) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node(__spreadProps(__spreadValues({}, opts), {
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error22
                  }));
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error22
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = __spreadValues(__spreadValues({}, stuff), loaded.loaded.stuff);
        }
      }
    }
  try {
    return with_cookies(await render_response(__spreadProps(__spreadValues({}, opts), {
      page_config,
      status,
      error: error22,
      branch: branch.filter(Boolean)
    })), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error(__spreadProps(__spreadValues({}, opts), {
      status: 500,
      error: error3
    })), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map2 = new Map();
  return {
    append(key, value) {
      if (map2.has(key)) {
        (map2.get(key) || []).push(value);
      } else {
        map2.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map2)
  };
}
function parse_body(raw, headers2) {
  if (!raw)
    return raw;
  const content_type = headers2["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers2["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers2 = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name2, value] = raw_header.split(": ");
      name2 = name2.toLowerCase();
      headers2[name2] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name22, value2] = raw_directive.split("=");
        directives[name22] = JSON.parse(value2);
      });
      if (name2 === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers2 = lowercase_keys(incoming.headers);
  const request = __spreadProps(__spreadValues({}, incoming), {
    headers: headers2,
    body: parse_body(incoming.rawBody, headers2),
    params: {},
    locals: {}
  });
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {}
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each2(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
function validate_component(component, name2) {
  if (!component || !component.$$render) {
    if (name2 === "svelte:component")
      name2 += " this={...}";
    throw new Error(`<${name2}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css22) => css22.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name2, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name2}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
function set_paths(paths) {
  base2 = paths.base;
  assets = paths.assets || base2;
}
function set_prerendering(value) {
}
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-6032bbc6.js",
      css: [assets + "/_app/assets/start-d5b4de3e.css"],
      js: [assets + "/_app/start-6032bbc6.js", assets + "/_app/chunks/vendor-050cc242.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22, request) => {
      hooks.handleError({ error: error22, request });
      error22.stack = options.get_stack(error22);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
async function load_component(file) {
  const { entry, css: css22, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css22.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond(__spreadProps(__spreadValues({}, request), { host }), options, { prerender });
}
var __accessCheck2, __privateGet2, __privateAdd2, __privateSet2, _map, chars, unsafeChars, reserved, escaped$1, objectProtoOwnPropertyNames, subscriber_queue2, escape_json_string_in_html_dict, escape_html_attr_dict, s$1, s, absolute, ReadOnlyFormData, current_component, escaped, missing_component, on_destroy, css2, Root, base2, assets, user_hooks, template, options, default_settings, empty, manifest, get_hooks, module_lookup, metadata_lookup;
var init_app_a5a3d39a = __esm({
  ".svelte-kit/output/server/chunks/app-a5a3d39a.js"() {
    init_shims();
    __accessCheck2 = (obj, member, msg) => {
      if (!member.has(obj))
        throw TypeError("Cannot " + msg);
    };
    __privateGet2 = (obj, member, getter) => {
      __accessCheck2(obj, member, "read from private field");
      return getter ? getter.call(obj) : member.get(obj);
    };
    __privateAdd2 = (obj, member, value) => {
      if (member.has(obj))
        throw TypeError("Cannot add the same private member more than once");
      member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
    };
    __privateSet2 = (obj, member, value, setter) => {
      __accessCheck2(obj, member, "write to private field");
      setter ? setter.call(obj, value) : member.set(obj, value);
      return value;
    };
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
    unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
    reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
    escaped$1 = {
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
    objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
    Promise.resolve();
    subscriber_queue2 = [];
    escape_json_string_in_html_dict = {
      '"': '\\"',
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
    escape_html_attr_dict = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    };
    s$1 = JSON.stringify;
    s = JSON.stringify;
    absolute = /^([a-z]+:)?\/?\//;
    ReadOnlyFormData = class {
      constructor(map2) {
        __privateAdd2(this, _map, void 0);
        __privateSet2(this, _map, map2);
      }
      get(key) {
        const value = __privateGet2(this, _map).get(key);
        return value && value[0];
      }
      getAll(key) {
        return __privateGet2(this, _map).get(key);
      }
      has(key) {
        return __privateGet2(this, _map).has(key);
      }
      *[Symbol.iterator]() {
        for (const [key, value] of __privateGet2(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *entries() {
        for (const [key, value] of __privateGet2(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *keys() {
        for (const [key] of __privateGet2(this, _map))
          yield key;
      }
      *values() {
        for (const [, value] of __privateGet2(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield value[i];
          }
        }
      }
    };
    _map = new WeakMap();
    Promise.resolve();
    escaped = {
      '"': "&quot;",
      "'": "&#39;",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;"
    };
    missing_component = {
      $$render: () => ""
    };
    css2 = {
      code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
      map: null
    };
    Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { stores } = $$props;
      let { page } = $$props;
      let { components } = $$props;
      let { props_0 = null } = $$props;
      let { props_1 = null } = $$props;
      let { props_2 = null } = $$props;
      setContext("__svelte__", stores);
      afterUpdate(stores.page.notify);
      if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
        $$bindings.stores(stores);
      if ($$props.page === void 0 && $$bindings.page && page !== void 0)
        $$bindings.page(page);
      if ($$props.components === void 0 && $$bindings.components && components !== void 0)
        $$bindings.components(components);
      if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
        $$bindings.props_0(props_0);
      if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
        $$bindings.props_1(props_1);
      if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
        $$bindings.props_2(props_2);
      $$result.css.add(css2);
      {
        stores.page.set(page);
      }
      return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
        default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
          default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
        })}` : ``}`
      })}

${``}`;
    });
    base2 = "";
    assets = "";
    user_hooks = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      [Symbol.toStringTag]: "Module"
    });
    template = ({ head, body }) => '<!DOCTYPE html>\r\n<html lang="en">\r\n	<head>\r\n		<meta charset="utf-8" />\r\n		<link rel="icon" href="/favicon.png" />\r\n		<link rel="preconnect" href="https://fonts.googleapis.com" />\r\n		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\r\n		<link\r\n			href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400&display=swap"\r\n			rel="stylesheet"\r\n		/>\r\n		<link rel="stylesheet" href="https://unpkg.com/mono-icons@1.0.5/iconfont/icons.css" />\r\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\r\n		' + head + '\r\n	</head>\r\n	<body>\r\n		<div id="svelte">' + body + "</div>\r\n	</body>\r\n</html>\r\n";
    options = null;
    default_settings = { paths: { "base": "", "assets": "" } };
    empty = () => ({});
    manifest = {
      assets: [{ "file": "favicon.png", "size": 1982, "type": "image/png" }, { "file": "icons/booking.svg", "size": 470, "type": "image/svg+xml" }, { "file": "icons/call.svg", "size": 472, "type": "image/svg+xml" }, { "file": "icons/facebook.svg", "size": 742, "type": "image/svg+xml" }, { "file": "icons/instagram.svg", "size": 1015, "type": "image/svg+xml" }, { "file": "icons/location.svg", "size": 356, "type": "image/svg+xml" }, { "file": "images/banner.png", "size": 1670, "type": "image/png" }, { "file": "images/logo.png", "size": 998074, "type": "image/png" }, { "file": "images/logo_128.png", "size": 17731, "type": "image/png" }],
      layout: "src/routes/__layout.svelte",
      error: ".svelte-kit/build/components/error.svelte",
      routes: [
        {
          type: "page",
          pattern: /^\/$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        }
      ]
    };
    get_hooks = (hooks) => ({
      getSession: hooks.getSession || (() => ({})),
      handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
      handleError: hooks.handleError || (({ error: error22 }) => console.error(error22.stack)),
      externalFetch: hooks.externalFetch || fetch
    });
    module_lookup = {
      "src/routes/__layout.svelte": () => Promise.resolve().then(() => (init_layout_2812f51c(), layout_2812f51c_exports)),
      ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(() => (init_error_28507a7c(), error_28507a7c_exports)),
      "src/routes/index.svelte": () => Promise.resolve().then(() => (init_index_ffbec005(), index_ffbec005_exports))
    };
    metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-85b48afc.js", "css": ["assets/pages/__layout.svelte-c1a3a88b.css"], "js": ["pages/__layout.svelte-85b48afc.js", "chunks/vendor-050cc242.js", "chunks/stores-8375f353.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-38352f2d.js", "css": [], "js": ["error.svelte-38352f2d.js", "chunks/vendor-050cc242.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-4d5940bf.js", "css": [], "js": ["pages/index.svelte-4d5940bf.js", "chunks/vendor-050cc242.js", "chunks/stores-8375f353.js"], "styles": [] } };
  }
});

// .svelte-kit/firebase/entry.js
__export(exports, {
  default: () => svelteKit
});
init_shims();

// .svelte-kit/output/server/app.js
var app_exports = {};
__export(app_exports, {
  init: () => init,
  render: () => render
});
init_shims();
init_app_a5a3d39a();

// .svelte-kit/firebase/firebase-to-svelte-kit.js
init_shims();
function toSvelteKitRequest(request) {
  const host = `${request.headers["x-forwarded-proto"]}://${request.headers.host}`;
  const { pathname, searchParams: searchParameters } = new URL(request.url || "", host);
  return {
    method: request.method,
    headers: toSvelteKitHeaders(request.headers),
    rawBody: request.rawBody ? request.rawBody : null,
    host,
    path: pathname,
    query: searchParameters
  };
}
function toSvelteKitHeaders(headers2) {
  const finalHeaders = {};
  for (const [key, value] of Object.entries(headers2)) {
    finalHeaders[key] = Array.isArray(value) ? value.join(",") : value;
  }
  return finalHeaders;
}

// .svelte-kit/firebase/entry.js
var app = app_exports;
app.init();
async function svelteKit(request, response) {
  const rendered = await app.render(toSvelteKitRequest(request));
  return rendered ? response.writeHead(rendered.status, rendered.headers).end(rendered.body) : response.writeHead(404, "Not Found").end();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
