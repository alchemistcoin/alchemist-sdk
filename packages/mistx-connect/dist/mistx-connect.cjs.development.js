'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var socket_ioClient = require('socket.io-client');

(function (Event) {
  Event["GAS_CHANGE"] = "GAS_CHANGE";
  Event["SOCKET_SESSION"] = "SOCKET_SESSION";
  Event["SOCKET_ERR"] = "SOCKET_ERR";
  Event["MISTX_BUNDLE_REQUEST"] = "MISTX_BUNDLE_REQUEST";
  Event["BUNDLE_STATUS_REQUEST"] = "BUNDLE_STATUS_REQUEST";
  Event["BUNDLE_STATUS_RESPONSE"] = "BUNDLE_STATUS_RESPONSE";
  Event["BUNDLE_RESPONSE"] = "BUNDLE_RESPONSE";
  Event["BUNDLE_CANCEL_REQUEST"] = "BUNDLE_CANCEL_REQUEST";
})(exports.Event || (exports.Event = {}));

(function (Status) {
  Status["PENDING_BUNDLE"] = "PENDING_BUNDLE";
  Status["FAILED_BUNDLE"] = "FAILED_BUNDLE";
  Status["SUCCESSFUL_BUNDLE"] = "SUCCESSFUL_BUNDLE";
  Status["CANCEL_BUNDLE_SUCCESSFUL"] = "CANCEL_BUNDLE_SUCCESSFUL";
  Status["BUNDLE_NOT_FOUND"] = "BUNDLE_NOT_FOUND";
})(exports.Status || (exports.Status = {}));

var STATUS_LOCALES = {
  PENDING_BUNDLE: 'Flashbots working on including your swap',
  FAILED_BUNDLE: 'Failed',
  SUCCESSFUL_BUNDLE: 'Success',
  CANCEL_BUNDLE_SUCCESSFUL: 'Cancelled',
  BUNDLE_NOT_FOUND: 'Failed'
};

(function (Diagnosis) {
  Diagnosis["LOWER_THAN_TAIL"] = "LOWER_THAN_TAIL";
  Diagnosis["NOT_A_FLASHBLOCK"] = "NOT_A_FLASHBLOCK";
  Diagnosis["BUNDLE_OUTBID"] = "BUNDLE_OUTBID";
  Diagnosis["ERROR_API_BEHIND"] = "ERROR_API_BEHIND";
  Diagnosis["MISSING_BLOCK_DATA"] = "MISSING_BLOCK_DATA";
  Diagnosis["ERROR_UNKNOWN"] = "ERROR_UNKNOWN";
})(exports.Diagnosis || (exports.Diagnosis = {}));

var defaultServerUrl = 'https://mistx-app-goerli.herokuapp.com';
var tokenKey = "SESSION_TOKEN";
var MistxSocket = /*#__PURE__*/function () {
  function MistxSocket(serverUrl) {
    if (serverUrl === void 0) {
      serverUrl = defaultServerUrl;
    }

    var token = localStorage.getItem(tokenKey);
    var socket = socket_ioClient.io(serverUrl, {
      transports: ['websocket'],
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 5000,
      autoConnect: true
    });
    this.socket = socket;
  }

  var _proto = MistxSocket.prototype;

  _proto.disconnect = function disconnect() {
    this.socket.off('connect');
    this.socket.off('connect_error');
    this.socket.off(exports.Event.SOCKET_ERR);
    this.socket.off(exports.Event.SOCKET_SESSION);
    this.socket.off(exports.Event.GAS_CHANGE);
    this.socket.off(exports.Event.BUNDLE_RESPONSE);
    this.socket.off(exports.Event.BUNDLE_STATUS_RESPONSE);
  };

  _proto.init = function init(_ref) {
    var _this = this;

    var onConnect = _ref.onConnect,
        onConnectError = _ref.onConnectError,
        onDisconnect = _ref.onDisconnect,
        onError = _ref.onError,
        onGasChange = _ref.onGasChange,
        onSocketSession = _ref.onSocketSession,
        onTransactionResponse = _ref.onTransactionResponse,
        onTransactionUpdate = _ref.onTransactionUpdate;
    this.socket.on('connect', function () {
      // console.log('websocket connected')
      if (onConnect) onConnect();
    });
    this.socket.on('connect_error', function (err) {
      // console.log('websocket connect error', err)
      if (onConnectError) onConnectError(err);
    });
    this.socket.on('disconnect', function (err) {
      // console.log('websocket disconnect', err)
      if (onDisconnect) onDisconnect(err);
    });
    this.socket.on(exports.Event.SOCKET_ERR, function (err) {
      // console.log('websocket err', err)
      if (onError) onError(err);
    });
    this.socket.on(exports.Event.SOCKET_SESSION, function (session) {
      localStorage.setItem(tokenKey, session.token);
      if (onSocketSession) onSocketSession(session);
    });
    this.socket.on(exports.Event.GAS_CHANGE, function (gas) {
      if (onGasChange) onGasChange(gas);
    });
    this.socket.on(exports.Event.BUNDLE_RESPONSE, function (response) {
      if (onTransactionResponse) onTransactionResponse(response);
    });
    this.socket.on(exports.Event.BUNDLE_STATUS_RESPONSE, function (response) {
      if (onTransactionUpdate) onTransactionUpdate(response);
    });
    return function () {
      _this.disconnect();
    };
  };

  _proto.emitTransactionRequest = function emitTransactionRequest(transaction) {
    this.socket.emit(exports.Event.MISTX_BUNDLE_REQUEST, transaction);
  };

  _proto.emitStatusRequest = function emitStatusRequest(transaction) {
    this.socket.emit(exports.Event.BUNDLE_STATUS_REQUEST, transaction);
  };

  _proto.emitTransactionCancellation = function emitTransactionCancellation(serialized) {
    this.socket.emit(exports.Event.BUNDLE_CANCEL_REQUEST, serialized);
  };

  return MistxSocket;
}();

exports.MistxSocket = MistxSocket;
exports.STATUS_LOCALES = STATUS_LOCALES;
//# sourceMappingURL=mistx-connect.cjs.development.js.map
