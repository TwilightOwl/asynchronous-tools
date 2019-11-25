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
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var _this = undefined;
var queues = {};
var getQueue = function (queueId) { return queues[queueId] || (queues[queueId] = {
    tasks: [],
    meta: {
        isTaskRejected: false,
        isTaskRejectedInNotEmptyQueue: false
    }
}); };
var showLog = false;
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return showLog && console.log.apply(console, args);
};
var OnRejection;
(function (OnRejection) {
    OnRejection["RejectAllInQueue"] = "rejectAllInQueue";
    OnRejection["RejectAlways"] = "rejectAlways";
    OnRejection["None"] = "none";
})(OnRejection || (OnRejection = {}));
var queue = (function (queueId, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.onIsQueueProcessing, onIsQueueProcessing = _c === void 0 ? function (isProcessing) { } : _c, _d = _b.onRejection, onRejection = _d === void 0 ? OnRejection.None : _d;
    return function (process, tag) {
        if (tag === void 0) { tag = ''; }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new Promise(function (resolve, reject) {
                var _a = getQueue(queueId), tasks = _a.tasks, meta = _a.meta;
                var idle = !tasks.length;
                log("\n:: " + queueId + " :: CALL :: " + tag + " :: Queue: " + tasks);
                tasks.push({ process: function () { return process.apply(void 0, args); }, tag: tag, resolve: resolve, reject: reject });
                var doNext = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, process, tag, resolve, reject, _b, error_1;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!tasks.length)
                                    return [2 /*return*/];
                                _a = tasks[0], process = _a.process, tag = _a.tag, resolve = _a.resolve, reject = _a.reject;
                                log(":: " + queueId + " :: BEGIN :: " + tag);
                                if (!(onRejection === OnRejection.RejectAlways && meta.isTaskRejected ||
                                    onRejection === OnRejection.RejectAllInQueue && meta.isTaskRejectedInNotEmptyQueue)) return [3 /*break*/, 1];
                                reject("One of previous task in queue \"" + queueId + "\" was rejected");
                                return [3 /*break*/, 4];
                            case 1:
                                _c.trys.push([1, 3, , 4]);
                                _b = resolve;
                                return [4 /*yield*/, process()];
                            case 2:
                                _b.apply(void 0, [_c.sent()]);
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _c.sent();
                                meta.isTaskRejected = true;
                                meta.isTaskRejectedInNotEmptyQueue = true;
                                reject(error_1);
                                return [3 /*break*/, 4];
                            case 4:
                                tasks.shift();
                                log(":: " + queueId + " :: END :: " + tag + "\n");
                                if (tasks.length) {
                                    setTimeout(doNext, 0);
                                }
                                else {
                                    meta.isTaskRejectedInNotEmptyQueue = false;
                                    onIsQueueProcessing(false);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                if (idle) {
                    onIsQueueProcessing(true);
                    doNext();
                }
                else {
                    log(":: " + queueId + " :: Waiting... :: " + tag);
                }
            });
        };
    };
});

// TODO: make function version without decorators
// TODO: make the queue when init decorator have been applied, 
//    if method is called without init decorator at all, throw "you should apply init"
//    if method is called just before decorated init function, throw "you should call initialize function before any @method functions"
// TODO: unit tests
// TODO: think about reinitialization, how should it work?
var generateQueue = function (name) { return queue(name + "-" + Date.now() + "-" + Math.random(), {
    onIsQueueProcessing: function (isProcessing) { },
    onRejection: OnRejection.RejectAlways
}); };
var initialComplete = function () {
    throw 'Call complete before initialization';
};
var generateInitialPromise = function (target) { return target.__queue(function () { return new Promise(function (resolve, reject) {
    target.__complete = function (ok) {
        target.__init = ok;
        (ok ? resolve : reject)();
    };
}); }); };
var aiWithAsyncInit = function (constructor) {
    var Wrapper = /** @class */ (function (_super) {
        __extends(Wrapper, _super);
        function Wrapper() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, args) || this;
            _this.__queue = generateQueue('QUEUE-INSTANCE');
            _this.__complete = initialComplete;
            _this.__init = false;
            _this.__initPromise = generateInitialPromise(_this);
            _this.__initPromise().catch(function () { });
            return _this;
        }
        /**
          We should use unique keys for static fields, like this:
          ```
            const _queue = Symbol('queue');
    
            class Wrapper extends constructor {
              static [_queue] = ...
            }
          ```
          But TS crashes, see https://github.com/microsoft/TypeScript/issues/23736
        */
        Wrapper.__queue = generateQueue('QUEUE');
        Wrapper.__complete = initialComplete;
        Wrapper.__init = false;
        Wrapper.__initPromise = generateInitialPromise(Wrapper);
        Wrapper._ = Wrapper.__initPromise().catch(function () { });
        return Wrapper;
    }(constructor));
    return Wrapper;
};
var aiInit = function (target, key, value) { return ({
    //@ts-ignore
    value: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var isStatic, object, result, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isStatic = !this.constructor.__initPromise;
                        object = this;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        if (!value.initializer) return [3 /*break*/, 3];
                        return [4 /*yield*/, value.initializer.apply(this).apply(void 0, args)];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, value.value.apply(this, args)];
                    case 4:
                        _a = _b.sent();
                        _b.label = 5;
                    case 5:
                        result = _a;
                        object.__complete(true);
                        return [2 /*return*/, result];
                    case 6:
                        error_1 = _b.sent();
                        object.__complete(false);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
}); };
var aiMethod = function (target, key, value) { return ({
    //@ts-ignore
    value: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var func, wrapped, unwrap, isStatic, object, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        func = function () { return value.initializer
                            ? value.initializer.apply(_this).apply(void 0, args) : value.value.apply(_this, args); };
                        wrapped = function () { return Promise
                            .resolve(func())
                            .then(function (result) { return ({ ok: true, result: result }); })
                            .catch(function (result) { return ({ ok: false, result: result }); }); };
                        unwrap = function (_a) {
                            var _b = _a.ok, ok = _b === void 0 ? true : _b, _c = _a.result, result = _c === void 0 ? undefined : _c;
                            return ok
                                ? Promise.resolve(result)
                                : Promise.reject(result);
                        };
                        isStatic = !this.constructor.__initPromise;
                        object = this;
                        if (!object.__init) return [3 /*break*/, 2];
                        return [4 /*yield*/, func()];
                    case 1:
                        _a = _c.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        _b = unwrap;
                        return [4 /*yield*/, object.__queue(wrapped)()];
                    case 3:
                        _a = _b.apply(void 0, [_c.sent()]);
                        _c.label = 4;
                    case 4: // isStatic ? this : this.constructor;
                    return [2 /*return*/, _a];
                }
            });
        });
    }
}); };

/**
 * @overview utility to prevent several function calls at the same time
 * @author Denis Zhelnerovich
 * @version 1.0
 */
var singular = function (func, params) {
    if (params === void 0) { params = {}; }
    var _a = params.onStatusChanged, onStatusChanged = _a === void 0 ? function () { } : _a, _b = params.onFailure, onFailure = _b === void 0 ? function () { } : _b, _c = params.enabled, enabled = _c === void 0 ? true : _c;
    var setEnabled = function (value) {
        enabled = value;
        onStatusChanged(enabled);
        return false;
    };
    var release = function () { return setEnabled(true); };
    var resultFunction = (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return enabled
            ? setEnabled(false) || func.apply(void 0, [release].concat(args))
            : onFailure();
    });
    //I've added following properties just for future use cases
    resultFunction.release = release;
    resultFunction.function = func;
    resultFunction.setOnStatusChanged = function (handler) { return (onStatusChanged = handler); };
    resultFunction.setOnFailure = function (handler) { return (onFailure = handler); };
    return resultFunction;
};

var _handlers = {};
var subscribe = function (event, handler) {
    var queue = _handlers[event] || (_handlers[event] = []);
    queue.push(handler);
    var isSubscribed = true;
    return function () {
        if (!isSubscribed)
            return;
        var index = queue.indexOf(handler);
        if (~index)
            queue.splice(index, 1);
        isSubscribed = false;
    };
};
var invokeHandlers = function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    // сделал здесь новый массив, т.к. при двух хэндлерах с одним ивентом, если первый отпишет себя то в _handlers[event] собъются индексы и второй хэндлер не вызовется
    var handlers = (_handlers[event] || []).slice();
    //TODO: make it configurable, wait for async result
    handlers.forEach(function (handler) { return handler.apply(void 0, args); });
};

export { queue, OnRejection, singular, aiWithAsyncInit, aiInit, aiMethod, subscribe, invokeHandlers };
//# sourceMappingURL=asynchronous-tools.js.map
