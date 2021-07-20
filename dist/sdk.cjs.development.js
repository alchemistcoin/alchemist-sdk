'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var JSBI = _interopDefault(require('jsbi'));
var invariant = _interopDefault(require('tiny-invariant'));
var _Big = _interopDefault(require('big.js'));
var _Decimal = _interopDefault(require('decimal.js-light'));
var toFormat = _interopDefault(require('toformat'));
var warning = _interopDefault(require('tiny-warning'));
var address = require('@ethersproject/address');
var solidity = require('@ethersproject/solidity');
var contracts = require('@ethersproject/contracts');
var networks = require('@ethersproject/networks');
var providers = require('@ethersproject/providers');

var _FACTORY_ADDRESS, _ROUTER_ADDRESS, _INIT_CODE_HASH, _SOLIDITY_TYPE_MAXIMA;

(function (ChainId) {
  ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
  ChainId[ChainId["ROPSTEN"] = 3] = "ROPSTEN";
  ChainId[ChainId["RINKEBY"] = 4] = "RINKEBY";
  ChainId[ChainId["G\xD6RLI"] = 5] = "G\xD6RLI";
  ChainId[ChainId["KOVAN"] = 42] = "KOVAN";
  ChainId[ChainId["HARDHAT"] = 1337] = "HARDHAT";
})(exports.ChainId || (exports.ChainId = {}));

(function (Exchange) {
  Exchange[Exchange["UNI"] = 0] = "UNI";
  Exchange[Exchange["SUSHI"] = 1] = "SUSHI";
  Exchange[Exchange["UNDEFINED"] = 2] = "UNDEFINED";
})(exports.Exchange || (exports.Exchange = {}));

(function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(exports.TradeType || (exports.TradeType = {}));

(function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(exports.Rounding || (exports.Rounding = {}));

var MaxUint256 = /*#__PURE__*/JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
var FACTORY_ADDRESS = (_FACTORY_ADDRESS = {}, _FACTORY_ADDRESS[exports.Exchange.UNI] = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', _FACTORY_ADDRESS[exports.Exchange.SUSHI] = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac', _FACTORY_ADDRESS[exports.Exchange.UNDEFINED] = '0x0', _FACTORY_ADDRESS);
var ROUTER_ADDRESS = (_ROUTER_ADDRESS = {}, _ROUTER_ADDRESS[exports.Exchange.UNI] = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', _ROUTER_ADDRESS[exports.Exchange.SUSHI] = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9', _ROUTER_ADDRESS[exports.Exchange.UNDEFINED] = '0x0', _ROUTER_ADDRESS);
var INIT_CODE_HASH = (_INIT_CODE_HASH = {}, _INIT_CODE_HASH[exports.Exchange.UNI] = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f', _INIT_CODE_HASH[exports.Exchange.SUSHI] = '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303', _INIT_CODE_HASH[exports.Exchange.UNDEFINED] = '0x0', _INIT_CODE_HASH);
var MINIMUM_LIQUIDITY = /*#__PURE__*/JSBI.BigInt(1000); // exports for internal consumption

var ZERO = /*#__PURE__*/JSBI.BigInt(0);
var ONE = /*#__PURE__*/JSBI.BigInt(1);
var TWO = /*#__PURE__*/JSBI.BigInt(2);
var THREE = /*#__PURE__*/JSBI.BigInt(3);
var FIVE = /*#__PURE__*/JSBI.BigInt(5);
var TEN = /*#__PURE__*/JSBI.BigInt(10);
var _100 = /*#__PURE__*/JSBI.BigInt(100);
var _997 = /*#__PURE__*/JSBI.BigInt(997);
var _1000 = /*#__PURE__*/JSBI.BigInt(1000);

(function (SolidityType) {
  SolidityType["uint8"] = "uint8";
  SolidityType["uint256"] = "uint256";
})(exports.SolidityType || (exports.SolidityType = {}));

var SOLIDITY_TYPE_MAXIMA = (_SOLIDITY_TYPE_MAXIMA = {}, _SOLIDITY_TYPE_MAXIMA[exports.SolidityType.uint8] = /*#__PURE__*/JSBI.BigInt('0xff'), _SOLIDITY_TYPE_MAXIMA[exports.SolidityType.uint256] = /*#__PURE__*/JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), _SOLIDITY_TYPE_MAXIMA);

(function (MethodName) {
  MethodName["swapETHForExactTokens"] = "swapETHForExactTokens";
  MethodName["swapExactETHForTokens"] = "swapExactETHForTokens";
  MethodName["swapExactTokensForETH"] = "swapExactTokensForETH";
  MethodName["swapExactTokensForTokens"] = "swapExactTokensForTokens";
  MethodName["swapTokensForExactETH"] = "swapTokensForExactETH";
  MethodName["swapTokensForExactTokens"] = "swapTokensForExactTokens";
})(exports.MethodName || (exports.MethodName = {}));

var GAS_ESTIMATES = {
  swapETHForExactTokens: '155485',
  swapExactETHForTokens: '151393',
  swapExactTokensForETH: '165009',
  swapExactTokensForTokens: '250000',
  swapTokensForExactETH: '195192',
  swapTokensForExactTokens: '204584'
};

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

// see https://stackoverflow.com/a/41102306
var CAN_SET_PROTOTYPE = ('setPrototypeOf' in Object);
/**
 * Indicates that the pair has insufficient reserves for a desired output amount. I.e. the amount of output cannot be
 * obtained by sending any amount of input.
 */

var InsufficientReservesError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(InsufficientReservesError, _Error);

  function InsufficientReservesError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.isInsufficientReservesError = true;
    _this.name = _this.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_assertThisInitialized(_this), (this instanceof InsufficientReservesError ? this.constructor : void 0).prototype);
    return _this;
  }

  return InsufficientReservesError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
/**
 * Indicates that the input amount is too small to produce any amount of output. I.e. the amount of input sent is less
 * than the price of a single unit of output after fees.
 */

var InsufficientInputAmountError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(InsufficientInputAmountError, _Error2);

  function InsufficientInputAmountError() {
    var _this2;

    _this2 = _Error2.call(this) || this;
    _this2.isInsufficientInputAmountError = true;
    _this2.name = _this2.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_assertThisInitialized(_this2), (this instanceof InsufficientInputAmountError ? this.constructor : void 0).prototype);
    return _this2;
  }

  return InsufficientInputAmountError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */

var AbstractCurrency =
/**
 * Constructs an instance of the base class `BaseCurrency`.
 * @param chainId the chain ID on which this currency resides
 * @param decimals decimals of the currency
 * @param symbol symbol of the currency
 * @param name of the currency
 */
function AbstractCurrency(chainId, decimals, symbol, name) {
  !Number.isSafeInteger(chainId) ?  invariant(false, 'CHAIN_ID')  : void 0;
  !(decimals >= 0 && decimals < 255 && Number.isInteger(decimals)) ?  invariant(false, 'DECIMALS')  : void 0;
  this.chainId = chainId;
  this.decimals = decimals;
  this.symbol = symbol;
  this.name = name;
};

var _toSignificantRoundin, _toFixedRounding;
var Decimal = /*#__PURE__*/toFormat(_Decimal);
var Big = /*#__PURE__*/toFormat(_Big);
var toSignificantRounding = (_toSignificantRoundin = {}, _toSignificantRoundin[exports.Rounding.ROUND_DOWN] = Decimal.ROUND_DOWN, _toSignificantRoundin[exports.Rounding.ROUND_HALF_UP] = Decimal.ROUND_HALF_UP, _toSignificantRoundin[exports.Rounding.ROUND_UP] = Decimal.ROUND_UP, _toSignificantRoundin);
var toFixedRounding = (_toFixedRounding = {}, _toFixedRounding[exports.Rounding.ROUND_DOWN] = 0, _toFixedRounding[exports.Rounding.ROUND_HALF_UP] = 1, _toFixedRounding[exports.Rounding.ROUND_UP] = 3, _toFixedRounding);
var Fraction = /*#__PURE__*/function () {
  function Fraction(numerator, denominator) {
    if (denominator === void 0) {
      denominator = JSBI.BigInt(1);
    }

    this.numerator = JSBI.BigInt(numerator);
    this.denominator = JSBI.BigInt(denominator);
  }

  Fraction.tryParseFraction = function tryParseFraction(fractionish) {
    if (fractionish instanceof JSBI || typeof fractionish === 'number' || typeof fractionish === 'string') return new Fraction(fractionish);
    if ('numerator' in fractionish && 'denominator' in fractionish) return fractionish;
    throw new Error('Could not parse fraction');
  } // performs floor division
  ;

  var _proto = Fraction.prototype;

  _proto.invert = function invert() {
    return new Fraction(this.denominator, this.numerator);
  };

  _proto.add = function add(other) {
    var otherParsed = Fraction.tryParseFraction(other);

    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator);
    }

    return new Fraction(JSBI.add(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.subtract = function subtract(other) {
    var otherParsed = Fraction.tryParseFraction(other);

    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }

    return new Fraction(JSBI.subtract(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.lessThan = function lessThan(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.lessThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.equalTo = function equalTo(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.equal(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.greaterThan = function greaterThan(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return JSBI.greaterThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.multiply = function multiply(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.numerator), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.divide = function divide(other) {
    var otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(this.denominator, otherParsed.numerator));
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(significantDigits) ?  invariant(false, significantDigits + " is not an integer.")  : void 0;
    !(significantDigits > 0) ?  invariant(false, significantDigits + " is not positive.")  : void 0;
    Decimal.set({
      precision: significantDigits + 1,
      rounding: toSignificantRounding[rounding]
    });
    var quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(decimalPlaces) ?  invariant(false, decimalPlaces + " is not an integer.")  : void 0;
    !(decimalPlaces >= 0) ?  invariant(false, decimalPlaces + " is negative.")  : void 0;
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  }
  /**
   * Helper method for converting any super class back to a fraction
   */
  ;

  _createClass(Fraction, [{
    key: "quotient",
    get: function get() {
      return JSBI.divide(this.numerator, this.denominator);
    } // remainder after floor division

  }, {
    key: "remainder",
    get: function get() {
      return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator);
    }
  }, {
    key: "asFraction",
    get: function get() {
      return new Fraction(this.numerator, this.denominator);
    }
  }]);

  return Fraction;
}();

var Big$1 = /*#__PURE__*/toFormat(_Big);
var CurrencyAmount = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose(CurrencyAmount, _Fraction);

  function CurrencyAmount(currency, numerator, denominator) {
    var _this;

    _this = _Fraction.call(this, numerator, denominator) || this;
    !JSBI.lessThanOrEqual(_this.quotient, MaxUint256) ?  invariant(false, 'AMOUNT')  : void 0;
    _this.currency = currency;
    _this.decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals));
    return _this;
  }
  /**
   * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
   * @param currency the currency in the amount
   * @param rawAmount the raw token or ether amount
   */


  CurrencyAmount.fromRawAmount = function fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount(currency, rawAmount);
  }
  /**
   * Construct a currency amount with a denominator that is not equal to 1
   * @param currency the currency
   * @param numerator the numerator of the fractional token amount
   * @param denominator the denominator of the fractional token amount
   */
  ;

  CurrencyAmount.fromFractionalAmount = function fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount(currency, numerator, denominator);
  };

  var _proto = CurrencyAmount.prototype;

  _proto.add = function add(other) {
    !this.currency.equals(other.currency) ?  invariant(false, 'CURRENCY')  : void 0;

    var added = _Fraction.prototype.add.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator);
  };

  _proto.subtract = function subtract(other) {
    !this.currency.equals(other.currency) ?  invariant(false, 'CURRENCY')  : void 0;

    var subtracted = _Fraction.prototype.subtract.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator);
  };

  _proto.multiply = function multiply(other) {
    var multiplied = _Fraction.prototype.multiply.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator);
  };

  _proto.divide = function divide(other) {
    var divided = _Fraction.prototype.divide.call(this, other);

    return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator);
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }

    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_DOWN;
    }

    return _Fraction.prototype.divide.call(this, this.decimalScale).toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = this.currency.decimals;
    }

    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_DOWN;
    }

    !(decimalPlaces <= this.currency.decimals) ?  invariant(false, 'DECIMALS')  : void 0;
    return _Fraction.prototype.divide.call(this, this.decimalScale).toFixed(decimalPlaces, format, rounding);
  };

  _proto.toExact = function toExact(format) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    Big$1.DP = this.currency.decimals;
    return new Big$1(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format);
  };

  _createClass(CurrencyAmount, [{
    key: "wrapped",
    get: function get() {
      if (this.currency.isToken) return this;
      return CurrencyAmount.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator);
    }
  }]);

  return CurrencyAmount;
}(Fraction);

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */

var NativeCurrency = /*#__PURE__*/function (_AbstractCurrency) {
  _inheritsLoose(NativeCurrency, _AbstractCurrency);

  function NativeCurrency() {
    var _this;

    _this = _AbstractCurrency.apply(this, arguments) || this;
    _this.isNative = true;
    _this.isToken = false;
    return _this;
  }

  return NativeCurrency;
}(AbstractCurrency);

var Price = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose(Price, _Fraction);

  /**
   * Construct a price, either with the base and quote currency amount, or the
   * @param args
   */
  function Price() {
    var _this;

    var baseCurrency, quoteCurrency, denominator, numerator;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 4) {
      baseCurrency = args[0];
      quoteCurrency = args[1];
      denominator = args[2];
      numerator = args[3];
    } else {
      var result = args[0].quoteAmount.divide(args[0].baseAmount);
      var _ref = [args[0].baseAmount.currency, args[0].quoteAmount.currency, result.denominator, result.numerator];
      baseCurrency = _ref[0];
      quoteCurrency = _ref[1];
      denominator = _ref[2];
      numerator = _ref[3];
    }

    _this = _Fraction.call(this, numerator, denominator) || this;
    _this.baseCurrency = baseCurrency;
    _this.quoteCurrency = quoteCurrency;
    _this.scalar = new Fraction(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(baseCurrency.decimals)), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(quoteCurrency.decimals)));
    return _this;
  }
  /**
   * Flip the price, switching the base and quote currency
   */


  var _proto = Price.prototype;

  _proto.invert = function invert() {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  }
  /**
   * Multiply the price by another price, returning a new price. The other price must have the same base currency as this price's quote currency
   * @param other the other price
   */
  ;

  _proto.multiply = function multiply(other) {
    !this.quoteCurrency.equals(other.baseCurrency) ?  invariant(false, 'TOKEN')  : void 0;

    var fraction = _Fraction.prototype.multiply.call(this, other);

    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  }
  /**
   * Return the amount of quote currency corresponding to a given amount of the base currency
   * @param currencyAmount the amount of base currency to quote against the price
   */
  ;

  _proto.quote = function quote(currencyAmount) {
    !currencyAmount.currency.equals(this.baseCurrency) ?  invariant(false, 'TOKEN')  : void 0;

    var result = _Fraction.prototype.multiply.call(this, currencyAmount);

    return CurrencyAmount.fromFractionalAmount(this.quoteCurrency, result.numerator, result.denominator);
  }
  /**
   * Get the value scaled by decimals for formatting
   * @private
   */
  ;

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }

    return this.adjustedForDecimals.toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 4;
    }

    return this.adjustedForDecimals.toFixed(decimalPlaces, format, rounding);
  };

  _createClass(Price, [{
    key: "adjustedForDecimals",
    get: function get() {
      return _Fraction.prototype.multiply.call(this, this.scalar);
    }
  }]);

  return Price;
}(Fraction);

var _100_PERCENT = /*#__PURE__*/new Fraction(_100);

var Percent = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose(Percent, _Fraction);

  function Percent() {
    return _Fraction.apply(this, arguments) || this;
  }

  var _proto = Percent.prototype;

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 5;
    }

    return this.multiply(_100_PERCENT).toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 2;
    }

    return this.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding);
  };

  return Percent;
}(Fraction);

function validateSolidityTypeInstance(value, solidityType) {
  !JSBI.greaterThanOrEqual(value, ZERO) ?  invariant(false, value + " is not a " + solidityType + ".")  : void 0;
  !JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]) ?  invariant(false, value + " is not a " + solidityType + ".")  : void 0;
} // warns if addresses are not checksummed

function validateAndParseAddress(address$1) {
  try {
    var checksummedAddress = address.getAddress(address$1); //console.log('checksum', checksummedAddress, address)

    "development" !== "production" ? warning(address$1 === checksummedAddress, address$1 + " is not checksummed.") : void 0;
    return checksummedAddress;
  } catch (error) {
      invariant(false, address$1 + " is not a valid address.")  ;
  }
}
function parseBigintIsh(bigintIsh) {
  return bigintIsh instanceof JSBI ? bigintIsh : typeof bigintIsh === 'bigint' ? JSBI.BigInt(bigintIsh) : JSBI.BigInt(bigintIsh);
}
function estimatedGasForMethod(methodName, numHops) {
  if (methodName === void 0) {
    methodName = 'swapTokensForExactETH';
  }

  if (numHops === void 0) {
    numHops = '1';
  }

  var gasBeforeHopFactor = parseBigintIsh(GAS_ESTIMATES[methodName]);
  var factor = parseBigintIsh('0'); // TODO: change this

  var additionalGas = JSBI.multiply(parseBigintIsh(numHops), factor);
  return JSBI.add(gasBeforeHopFactor, additionalGas);
}
function calculateMinerBribe(gasPriceToBeat, estimatedGas, margin) {
  gasPriceToBeat = parseBigintIsh(gasPriceToBeat);
  estimatedGas = parseBigintIsh(estimatedGas);
  var gasPriceToBeatWithMargin = calculateMargin(gasPriceToBeat, margin);
  return JSBI.multiply(gasPriceToBeatWithMargin, estimatedGas);
} // add x%

function calculateMargin(value, margin) {
  value = parseBigintIsh(value);
  margin = JSBI.multiply(parseBigintIsh(margin), parseBigintIsh('100'));
  var numerator = JSBI.multiply(value, JSBI.add(parseBigintIsh('10000'), margin));
  var denominator = parseBigintIsh('10000');
  return JSBI.divide(numerator, denominator);
} // mock the on-chain sqrt function

function sqrt(y) {
  validateSolidityTypeInstance(y, exports.SolidityType.uint256);
  var z = ZERO;
  var x;

  if (JSBI.greaterThan(y, THREE)) {
    z = y;
    x = JSBI.add(JSBI.divide(y, TWO), ONE);

    while (JSBI.lessThan(x, z)) {
      z = x;
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO);
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE;
  }

  return z;
} // given an array of items sorted by `comparator`, insert an item into its sort index and constrain the size to
// `maxSize` by removing the last item

function sortedInsert(items, add, maxSize, comparator) {
  !(maxSize > 0) ?  invariant(false, 'MAX_SIZE_ZERO')  : void 0; // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize

  !(items.length <= maxSize) ?  invariant(false, 'ITEMS_SIZE')  : void 0; // short circuit first item add

  if (items.length === 0) {
    items.push(add);
    return null;
  } else {
    var isFull = items.length === maxSize; // short circuit if full and the additional item does not come before the last item

    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add;
    }

    var lo = 0,
        hi = items.length;

    while (lo < hi) {
      var mid = lo + hi >>> 1;

      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    items.splice(lo, 0, add);
    return isFull ? items.pop() : null;
  }
}
var computePairAddress = function computePairAddress(_ref) {
  var exchange = _ref.exchange,
      tokenA = _ref.tokenA,
      tokenB = _ref.tokenB;

  var _ref2 = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA],
      token0 = _ref2[0],
      token1 = _ref2[1]; // does safety checks


  return address.getCreate2Address(FACTORY_ADDRESS[exchange], solidity.keccak256(['bytes'], [solidity.pack(['address', 'address'], [token0.address, token1.address])]), INIT_CODE_HASH[exchange]);
};
/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */

function computePriceImpact(midPrice, inputAmount, outputAmount) {
  var quotedOutputAmount = midPrice.quote(inputAmount); // calculate price impact := (exactQuote - outputAmount) / exactQuote

  var priceImpact = quotedOutputAmount.subtract(outputAmount).divide(quotedOutputAmount);
  return new Percent(priceImpact.numerator, priceImpact.denominator);
}

var _WETH;
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */

var Token = /*#__PURE__*/function (_AbstractCurrency) {
  _inheritsLoose(Token, _AbstractCurrency);

  function Token(chainId, address, decimals, symbol, name) {
    var _this;

    _this = _AbstractCurrency.call(this, chainId, decimals, symbol, name) || this;
    _this.isNative = false;
    _this.isToken = true;
    _this.chainId = chainId;
    _this.address = validateAndParseAddress(address);
    return _this;
  }
  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */


  var _proto = Token.prototype;

  _proto.equals = function equals(other) {
    return other.isToken && this.chainId === other.chainId && this.address === other.address;
  }
  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  ;

  _proto.sortsBefore = function sortsBefore(other) {
    !(this.chainId === other.chainId) ?  invariant(false, 'CHAIN_IDS')  : void 0;
    !(this.address !== other.address) ?  invariant(false, 'ADDRESSES')  : void 0;
    return this.address.toLowerCase() < other.address.toLowerCase();
  }
  /**
   * Return this token, which does not need to be wrapped
   */
  ;

  _createClass(Token, [{
    key: "wrapped",
    get: function get() {
      return this;
    }
  }]);

  return Token;
}(AbstractCurrency);
/**
 * Compares two currencies for equality
 */

function currencyEquals(currencyA, currencyB) {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB);
  } else if (currencyA instanceof Token) {
    return false;
  } else if (currencyB instanceof Token) {
    return false;
  } else {
    return currencyA === currencyB;
  }
}
var WETH = (_WETH = {}, _WETH[exports.ChainId.MAINNET] = /*#__PURE__*/new Token(exports.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.HARDHAT] = /*#__PURE__*/new Token(exports.ChainId.HARDHAT, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.ROPSTEN] = /*#__PURE__*/new Token(exports.ChainId.ROPSTEN, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.RINKEBY] = /*#__PURE__*/new Token(exports.ChainId.RINKEBY, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.GÖRLI] = /*#__PURE__*/new Token(exports.ChainId.GÖRLI, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.KOVAN] = /*#__PURE__*/new Token(exports.ChainId.KOVAN, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'), _WETH);

var Pair = /*#__PURE__*/function () {
  function Pair(currencyAmountA, tokenAmountB, exchange) {
    var tokenAmounts = currencyAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [currencyAmountA, tokenAmountB] : [tokenAmountB, currencyAmountA];
    this.liquidityToken = new Token(tokenAmounts[0].currency.chainId, Pair.getAddress(tokenAmounts[0].currency, tokenAmounts[1].currency, exchange), 18, 'UNI-V2', 'Uniswap V2');
    this.tokenAmounts = tokenAmounts;
    this.exchange = exchange;
  }

  Pair.getAddress = function getAddress(tokenA, tokenB, exchange) {
    return computePairAddress({
      exchange: exchange,
      tokenA: tokenA,
      tokenB: tokenB
    });
  }
  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  ;

  var _proto = Pair.prototype;

  _proto.involvesToken = function involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  }
  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  ;

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  _proto.priceOf = function priceOf(token) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }
  /**
   * Returns the chain ID of the tokens in the pair.
   */
  ;

  _proto.reserveOf = function reserveOf(token) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  };

  _proto.getOutputAmount = function getOutputAmount(inputAmount) {
    !this.involvesToken(inputAmount.currency) ?  invariant(false, 'TOKEN')  : void 0;

    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO)) {
      throw new InsufficientReservesError();
    }

    var inputReserve = this.reserveOf(inputAmount.currency);
    var outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var inputAmountWithFee = JSBI.multiply(inputAmount.quotient, _997);
    var numerator = JSBI.multiply(inputAmountWithFee, outputReserve.quotient);
    var denominator = JSBI.add(JSBI.multiply(inputReserve.quotient, _1000), inputAmountWithFee);
    var outputAmount = CurrencyAmount.fromRawAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.divide(numerator, denominator));

    if (JSBI.equal(outputAmount.quotient, ZERO)) {
      throw new InsufficientInputAmountError();
    }

    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.exchange)];
  };

  _proto.getInputAmount = function getInputAmount(outputAmount) {
    !this.involvesToken(outputAmount.currency) ?  invariant(false, 'TOKEN')  : void 0;

    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO) || JSBI.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient)) {
      throw new InsufficientReservesError();
    }

    var outputReserve = this.reserveOf(outputAmount.currency);
    var inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var numerator = JSBI.multiply(JSBI.multiply(inputReserve.quotient, outputAmount.quotient), _1000);
    var denominator = JSBI.multiply(JSBI.subtract(outputReserve.quotient, outputAmount.quotient), _997);
    var inputAmount = CurrencyAmount.fromRawAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.exchange)];
  };

  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    !totalSupply.currency.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    var tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    !(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0;
    var liquidity;

    if (JSBI.equal(totalSupply.quotient, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)), MINIMUM_LIQUIDITY);
    } else {
      var amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].quotient, totalSupply.quotient), this.reserve0.quotient);
      var amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].quotient, totalSupply.quotient), this.reserve1.quotient);
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }

    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }

    return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity);
  };

  _proto.getLiquidityValue = function getLiquidityValue(token, totalSupply, liquidity, feeOn, kLast) {
    if (feeOn === void 0) {
      feeOn = false;
    }

    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    !totalSupply.currency.equals(this.liquidityToken) ?  invariant(false, 'TOTAL_SUPPLY')  : void 0;
    !liquidity.currency.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    !JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient) ?  invariant(false, 'LIQUIDITY')  : void 0;
    var totalSupplyAdjusted;

    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      !!!kLast ?  invariant(false, 'K_LAST')  : void 0;
      var kLastParsed = JSBI.BigInt(kLast);

      if (!JSBI.equal(kLastParsed, ZERO)) {
        var rootK = sqrt(JSBI.multiply(this.reserve0.quotient, this.reserve1.quotient));
        var rootKLast = sqrt(kLastParsed);

        if (JSBI.greaterThan(rootK, rootKLast)) {
          var numerator = JSBI.multiply(totalSupply.quotient, JSBI.subtract(rootK, rootKLast));
          var denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast);
          var feeLiquidity = JSBI.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(CurrencyAmount.fromRawAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }

    return CurrencyAmount.fromRawAmount(token, JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupplyAdjusted.quotient));
  };

  _createClass(Pair, [{
    key: "token0Price",
    get: function get() {
      var result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
      return new Price(this.token0, this.token1, result.denominator, result.numerator);
    }
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */

  }, {
    key: "token1Price",
    get: function get() {
      var result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
      return new Price(this.token1, this.token0, result.denominator, result.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.token0.chainId;
    }
  }, {
    key: "token0",
    get: function get() {
      return this.tokenAmounts[0].currency;
    }
  }, {
    key: "token1",
    get: function get() {
      return this.tokenAmounts[1].currency;
    }
  }, {
    key: "reserve0",
    get: function get() {
      return this.tokenAmounts[0];
    }
  }, {
    key: "reserve1",
    get: function get() {
      return this.tokenAmounts[1];
    }
  }]);

  return Pair;
}();

var Route = /*#__PURE__*/function () {
  function Route(pairs, input, output) {
    this._midPrice = null;
    !(pairs.length > 0) ?  invariant(false, 'PAIRS')  : void 0;
    var chainId = pairs[0].chainId;
    !pairs.every(function (pair) {
      return pair.chainId === chainId;
    }) ?  invariant(false, 'CHAIN_IDS')  : void 0;
    var wrappedInput = input.wrapped;
    !pairs[0].involvesToken(wrappedInput) ?  invariant(false, 'INPUT')  : void 0;
    !(typeof output === 'undefined' || pairs[pairs.length - 1].involvesToken(output.wrapped)) ?  invariant(false, 'OUTPUT')  : void 0;
    var path = [wrappedInput];

    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
          i = _step$value[0],
          pair = _step$value[1];
      var currentInput = path[i];
      !(currentInput.equals(pair.token0) || currentInput.equals(pair.token1)) ?  invariant(false, 'PATH')  : void 0;

      var _output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;

      path.push(_output);
    }

    this.pairs = pairs;
    this.path = path;
    this.input = input;
    this.output = output;
  }

  _createClass(Route, [{
    key: "midPrice",
    get: function get() {
      if (this._midPrice !== null) return this._midPrice;
      var prices = [];

      for (var _iterator2 = _createForOfIteratorHelperLoose(this.pairs.entries()), _step2; !(_step2 = _iterator2()).done;) {
        var _step2$value = _step2.value,
            i = _step2$value[0],
            pair = _step2$value[1];
        prices.push(this.path[i].equals(pair.token0) ? new Price(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.quotient, pair.reserve1.quotient) : new Price(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.quotient, pair.reserve0.quotient));
      }

      var reduced = prices.slice(1).reduce(function (accumulator, currentValue) {
        return accumulator.multiply(currentValue);
      }, prices[0]);
      return this._midPrice = new Price(this.input, this.output, reduced.denominator, reduced.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.pairs[0].chainId;
    }
  }]);

  return Route;
}();

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */

var Ether = /*#__PURE__*/function (_NativeCurrency) {
  _inheritsLoose(Ether, _NativeCurrency);

  function Ether(chainId) {
    return _NativeCurrency.call(this, chainId, 18, 'ETH', 'Ether') || this;
  }

  Ether.onChain = function onChain(chainId) {
    var _this$_etherCache$cha;

    return (_this$_etherCache$cha = this._etherCache[chainId]) !== null && _this$_etherCache$cha !== void 0 ? _this$_etherCache$cha : this._etherCache[chainId] = new Ether(chainId);
  };

  var _proto = Ether.prototype;

  _proto.equals = function equals(other) {
    return other.isNative && other.chainId === this.chainId;
  };

  _createClass(Ether, [{
    key: "wrapped",
    get: function get() {
      var weth = WETH[this.chainId];
      !!!weth ?  invariant(false, 'WRAPPED')  : void 0;
      return weth;
    }
  }]);

  return Ether;
}(NativeCurrency);
Ether._etherCache = {};

// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first

function inputOutputComparator(a, b) {
  // must have same input and output token for comparison
  !a.inputAmount.currency.equals(b.inputAmount.currency) ?  invariant(false, 'INPUT_CURRENCY')  : void 0;
  !a.outputAmount.currency.equals(b.outputAmount.currency) ?  invariant(false, 'OUTPUT_CURRENCY')  : void 0;

  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0;
    } // trade A requires less input than trade B, so A should come first


    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    // tradeA has less output than trade B, so should come second
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1;
    } else {
      return -1;
    }
  }
} // extension of the input output comparator that also considers other dimensions of the trade in ranking them

function tradeComparator(a, b) {
  var ioComp = inputOutputComparator(a, b);

  if (ioComp !== 0) {
    return ioComp;
  } // consider lowest slippage next, since these are less likely to fail


  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1;
  } else if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1;
  } // finally consider the number of hops since each hop costs gas


  return a.route.path.length - b.route.path.length;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */

var Trade = /*#__PURE__*/function () {
  function Trade(route, amount, tradeType, gasPriceToBeat, minerBribeMargin) {
    this.route = route;
    this.tradeType = tradeType;
    var amounts = new Array(route.path.length);
    var nextPairs = new Array(route.pairs.length);
    var etherIn = route.input.isNative;
    var etherOut = route.output.isNative;
    var methodName = Trade.methodNameForTradeType(tradeType, etherIn, etherOut);
    var estimatedGas = estimatedGasForMethod(methodName, (route.path.length - 1).toString());
    var minerBribe = calculateMinerBribe(gasPriceToBeat, estimatedGas, minerBribeMargin);
    this.estimatedGas = estimatedGas.toString();
    this.minerBribe = CurrencyAmount.fromRawAmount(WETH[route.chainId], minerBribe); // this.minerBribe = CurrencyAmount.ether(minerBribe)

    var modifiedInput = amount.wrapped;
    var modifiedOutput = amount.wrapped;

    if (tradeType === exports.TradeType.EXACT_INPUT) {
      !currencyEquals(amount.currency, route.input) ?  invariant(false, 'INPUT')  : void 0;
      amounts[0] = amount.wrapped;

      for (var i = 0; i < route.path.length - 1; i++) {
        var pair = route.pairs[i];
        var inputAmount = amounts[i]; // if the input is ETH, calculate the output amount with the
        // the input reduced by the minerBribe

        if (etherIn && i === 0) {
          // reduce the inputAmount by this.minerBribe
          !inputAmount.greaterThan(this.minerBribe) ?  invariant(false, "Miner bribe " + this.minerBribe.toExact() + " is greater than input ETH " + inputAmount.toExact())  : void 0;
          var modifiedAmount = inputAmount.subtract(this.minerBribe); // console.log('original amount in', inputAmount.toExact())
          // console.log('modified amount in', modifiedAmount.toExact())

          inputAmount = modifiedAmount;
          modifiedInput = modifiedAmount;
        }

        var _pair$getOutputAmount = pair.getOutputAmount(inputAmount),
            outputAmount = _pair$getOutputAmount[0],
            nextPair = _pair$getOutputAmount[1]; // if the output is ETH, reduce the output amount
        // by the miner bribe


        if (etherOut && i === route.path.length - 2) {
          // reduce the outputAmount by this.minerBribe
          !outputAmount.greaterThan(this.minerBribe) ?  invariant(false, "Miner bribe " + this.minerBribe.toExact() + " is greater than output ETH " + outputAmount.toExact())  : void 0;

          var _modifiedAmount = outputAmount.subtract(this.minerBribe); // console.log('original amount out', outputAmount.toExact())
          // console.log('modified amount out', modifiedAmount.toExact())


          amounts[i + 1] = _modifiedAmount;
          modifiedOutput = outputAmount;
        } else {
          modifiedOutput = outputAmount;
          amounts[i + 1] = outputAmount;
        }

        nextPairs[i] = nextPair;
      }
    } else {
      !currencyEquals(amount.currency, route.output) ?  invariant(false, 'OUTPUT')  : void 0;
      amounts[amounts.length - 1] = amount.wrapped;

      for (var _i = route.path.length - 1; _i > 0; _i--) {
        var _outputAmount = amounts[_i]; // if the output is ETH, calculate the input amount with the
        // the output increased by the minerBribe

        if (etherOut && _i === route.path.length - 1) {
          // increase the outputAmount by this.minerBribe
          var _modifiedAmount2 = _outputAmount.add(this.minerBribe); // console.log('original amount out', outputAmount.toExact())
          // console.log('modified amount out', modifiedAmount.toExact())


          _outputAmount = _modifiedAmount2;
          modifiedOutput = _modifiedAmount2;
        } else if (_i === route.path.length - 1) {
          modifiedOutput = _outputAmount;
        }

        var _pair = route.pairs[_i - 1];

        var _pair$getInputAmount = _pair.getInputAmount(_outputAmount),
            _inputAmount = _pair$getInputAmount[0],
            _nextPair = _pair$getInputAmount[1]; // if the input is ETH, increase the input amount
        // by the miner bribe


        if (etherIn && _i === 1) {
          // increase the input amount by this.minerBribe
          var _modifiedAmount3 = _inputAmount.add(this.minerBribe); // console.log('original amount in', inputAmount.toExact())
          // console.log('modified amount in', modifiedAmount.toExact())


          amounts[_i - 1] = _modifiedAmount3;
          modifiedInput = _inputAmount;
        } else if (_i === 1) {
          modifiedInput = _inputAmount;
          amounts[_i - 1] = modifiedInput;
        } else {
          amounts[_i - 1] = _inputAmount;
        }

        nextPairs[_i - 1] = _nextPair;
      }
    }

    this.exchange = route.pairs[0].exchange;
    this.inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amounts[0].numerator, amounts[0].denominator); // this.inputAmount =
    //   tradeType === TradeType.EXACT_INPUT
    //     ? amount
    //     : route.input === ETHER
    //     ? CurrencyAmount.ether(amounts[0].raw)
    //     : amounts[0]

    this.outputAmount = CurrencyAmount.fromFractionalAmount(route.output, amounts[amounts.length - 1].numerator, amounts[amounts.length - 1].denominator); // this.outputAmount =
    //   tradeType === TradeType.EXACT_OUTPUT
    //     ? amount
    //     : route.output === ETHER
    //     ? CurrencyAmount.ether(amounts[amounts.length - 1].raw)
    //     : amounts[amounts.length - 1]

    this.executionPrice = new Price(route.input, route.output, modifiedInput.quotient, modifiedOutput.quotient); // this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount)

    this.priceImpact = computePriceImpact(route.midPrice, CurrencyAmount.fromFractionalAmount(route.input, modifiedInput.numerator, modifiedInput.denominator), CurrencyAmount.fromFractionalAmount(route.output, modifiedOutput.numerator, modifiedOutput.denominator)); // console.log('old price impact', computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount).toSignificant(6))
    // console.log('******************')
    // console.log('*** TRADE START **')
    // console.log('******************')
    // console.log('inputAmount', this.inputAmount.toSignificant(6))
    // console.log('outputAmount', this.outputAmount.toSignificant(6))
    // console.log('executionPrice', this.executionPrice.toSignificant(6))
    // console.log('nextMidPrice', this.nextMidPrice.toSignificant(6))
    // console.log('priceImpact', this.priceImpact.toSignificant(6))
    // console.log('minerBribe', this.minerBribe.toSignificant(6))
    // console.log('estimatedGas', this.estimatedGas)
    // console.log('******************')
    // console.log('*** TRADE END **')
    // console.log('******************')
  }
  /**
    * Constructs an exact in trade with the given amount in and route
    * @param route route of the exact in trade
    * @param amountIn the amount being passed in
    * @param gasPriceToBeat the gas price used to calculate the bribe
    * @param minerBribeMargin the margin to beat the gas price by
    */


  Trade.exactIn = function exactIn(route, amountIn, gasPriceToBeat, minerBribeMargin) {
    return new Trade(route, amountIn, exports.TradeType.EXACT_INPUT, gasPriceToBeat, minerBribeMargin);
  }
  /**
   * Constructs an exact out trade with the given amount out and route
   * @param route route of the exact out trade
   * @param amountOut the amount returned by the trade
   * @param gasPriceToBeat the gas price used to calculate the bribe
  * @param minerBribeMargin the margin to beat the gas price by
   */
  ;

  Trade.exactOut = function exactOut(route, amountOut, gasPriceToBeat, minerBribeMargin) {
    return new Trade(route, amountOut, exports.TradeType.EXACT_OUTPUT, gasPriceToBeat, minerBribeMargin);
  }
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  ;

  var _proto = Trade.prototype;

  _proto.minimumAmountOut = function minimumAmountOut(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ?  invariant(false, 'SLIPPAGE_TOLERANCE')  : void 0;

    if (this.tradeType === exports.TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    } else {
      var slippageAdjustedAmountOut = new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.quotient).quotient;
      return CurrencyAmount.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
    }
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  ;

  _proto.maximumAmountIn = function maximumAmountIn(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ?  invariant(false, 'SLIPPAGE_TOLERANCE')  : void 0;

    if (this.tradeType === exports.TradeType.EXACT_INPUT) {
      return this.inputAmount;
    } else {
      var slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient;
      return CurrencyAmount.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
    }
  }
  /**
   * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
   * amount to an output token, making at most `maxHops` hops.
   * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param pairs the pairs to consider in finding the best trade
   * @param exchange the exchange this trade will be performed on
   * @param currencyAmountIn exact amount of input currency to spend
   * @param currencyOut the desired currency out
   * @param maxNumResults maximum number of results to return
   * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
   * @param currentPairs used in recursion; the current list of pairs
   * @param originalAmountIn used in recursion; the original value of the currencyAmountIn parameter
   * @param bestTrades used in recursion; the current list of best trades
   * @param gasPriceToBeat used to calculate the miner bribe
   * @param minerBribeMargin used as the margin for the miner bribe calculation
   */
  ;

  Trade.bestTradeExactIn = function bestTradeExactIn(pairs, currencyAmountIn, currencyOut, gasPriceToBeat, minerBribeMargin, _temp, // used in recursion.
  currentPairs, nextAmountIn, bestTrades) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$maxNumResults = _ref.maxNumResults,
        maxNumResults = _ref$maxNumResults === void 0 ? 3 : _ref$maxNumResults,
        _ref$maxHops = _ref.maxHops,
        maxHops = _ref$maxHops === void 0 ? 3 : _ref$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (nextAmountIn === void 0) {
      nextAmountIn = currencyAmountIn;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    !(pairs.length > 0) ?  invariant(false, 'PAIRS')  : void 0;
    !(maxHops > 0) ?  invariant(false, 'MAX_HOPS')  : void 0;
    !(nextAmountIn === currencyAmountIn || currentPairs.length > 0) ?  invariant(false, 'INVALID_RECURSION')  : void 0;
    var tradeType = exports.TradeType.EXACT_INPUT;
    var amountIn = nextAmountIn.wrapped; //wrappedAmount(currencyAmountIn, chainId)

    var tokenOut = currencyOut.wrapped; //wrappedCurrency(currencyOut, chainId)

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]; // pair irrelevant

      if (!pair.token0.equals(amountIn.currency) && !pair.token1.equals(amountIn.currency)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;
      var amountOut = void 0;

      try {
        ;

        var _pair$getOutputAmount2 = pair.getOutputAmount(amountIn);

        amountOut = _pair$getOutputAmount2[0];
      } catch (error) {
        // input too low
        if (error.isInsufficientInputAmountError) {
          continue;
        }

        throw error;
      } // we have arrived at the output token, so this is the final trade of one of the paths


      if (amountOut.currency.equals(tokenOut)) {
        try {
          var newTrade = new Trade(new Route([].concat(currentPairs, [pair]), currencyAmountIn.currency, currencyOut), currencyAmountIn, tradeType, gasPriceToBeat, minerBribeMargin);
          sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
        } catch (e) {// catch the invariant
          // console.log('trade constructor err', e)
        }
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops

        Trade.bestTradeExactIn(pairsExcludingThisPair, currencyAmountIn, currencyOut, gasPriceToBeat, minerBribeMargin, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [].concat(currentPairs, [pair]), amountOut, bestTrades);
      }
    }

    return bestTrades;
  }
  /**
   * similar to the above method but instead targets a fixed output amount
   * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
   * to an output token amount, making at most `maxHops` hops
   * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param pairs the pairs to consider in finding the best trade
   * @param exchange the exchange this trade will be performed on
   * @param currencyIn the currency to spend
   * @param currencyAmountOut the exact amount of currency out
   * @param maxNumResults maximum number of results to return
   * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
   * @param currentPairs used in recursion; the current list of pairs
   * @param originalAmountOut used in recursion; the original value of the currencyAmountOut parameter
   * @param bestTrades used in recursion; the current list of best trades
   * @param gasPriceToBeat used to calculate the miner bribe
   * @param minerBribeMargin used as the margin for the miner bribe calculation
   */
  ;

  Trade.bestTradeExactOut = function bestTradeExactOut(pairs, currencyIn, currencyAmountOut, gasPriceToBeat, minerBribeMargin, _temp2, // used in recursion.
  currentPairs, nextAmountOut, bestTrades) {
    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$maxNumResults = _ref2.maxNumResults,
        maxNumResults = _ref2$maxNumResults === void 0 ? 3 : _ref2$maxNumResults,
        _ref2$maxHops = _ref2.maxHops,
        maxHops = _ref2$maxHops === void 0 ? 3 : _ref2$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (nextAmountOut === void 0) {
      nextAmountOut = currencyAmountOut;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    !(pairs.length > 0) ?  invariant(false, 'PAIRS')  : void 0;
    !(maxHops > 0) ?  invariant(false, 'MAX_HOPS')  : void 0;
    !(nextAmountOut === currencyAmountOut || currentPairs.length > 0) ?  invariant(false, 'INVALID_RECURSION')  : void 0;
    var amountOut = nextAmountOut.wrapped;
    var tokenIn = currencyIn.wrapped;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]; // pair irrelevant

      if (!pair.token0.equals(amountOut.currency) && !pair.token1.equals(amountOut.currency)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;
      var amountIn = void 0;

      try {
        ;

        var _pair$getInputAmount2 = pair.getInputAmount(amountOut);

        amountIn = _pair$getInputAmount2[0];
      } catch (error) {
        // not enough liquidity in this pair
        if (error.isInsufficientReservesError) {
          continue;
        }

        throw error;
      } // we have arrived at the input token, so this is the first trade of one of the paths


      if (amountIn.currency.equals(tokenIn)) {
        try {
          var newTrade = new Trade(new Route([pair].concat(currentPairs), currencyIn, currencyAmountOut.currency), currencyAmountOut, exports.TradeType.EXACT_OUTPUT, gasPriceToBeat, minerBribeMargin);
          sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
        } catch (e) {// catch the invariant
          // console.log('trade constructor err', e)
        }
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops

        Trade.bestTradeExactOut(pairsExcludingThisPair, currencyIn, currencyAmountOut, gasPriceToBeat, minerBribeMargin, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [pair].concat(currentPairs), amountIn, bestTrades);
      }
    }

    return bestTrades;
  }
  /**
   * return the mistX router method name for the trade
   * @param tradeType the type of trade, TradeType
   * @param etherIn the input currency is ether
   * @param etherOut the output currency is ether
   * @param useFeeOnTransfer Whether any of the tokens in the path are fee on transfer tokens, TradeOptions.feeOnTransfer
   * @param enforceUseFeeOnTransfer use to throw an invariant if there is no useFeeOnTransfer option for TradeType.EXACT_OUTPUT trades
   */
  ;

  Trade.methodNameForTradeType = function methodNameForTradeType(tradeType, etherIn, etherOut, useFeeOnTransfer) {
    var methodName;

    switch (tradeType) {
      case exports.TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = 'swapExactETHForTokens';
        } else if (etherOut) {
          methodName = 'swapExactTokensForETH';
        } else {
          methodName = 'swapExactTokensForTokens';
        }

        break;

      case exports.TradeType.EXACT_OUTPUT:
        !!useFeeOnTransfer ?  invariant(false, 'EXACT_OUT_FOT')  : void 0;

        if (etherIn) {
          methodName = 'swapETHForExactTokens';
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH';
        } else {
          methodName = 'swapTokensForExactTokens';
        }

        break;
    }

    return methodName;
  }
  /**
   * return the mistX router method name for the trade
   * @param pairs
   * @param currencyIn
   * @param currencyOut
   * @param gasPriceToBeat
   * @param minerBribeMargin
   * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
   */
  ;

  Trade.estimateMinTradeAmounts = function estimateMinTradeAmounts(pairs, currencyIn, currencyOut, gasPriceToBeat, minerBribeMargin, minTradeMargin, _temp3) {
    var _ref4;

    var _ref3 = _temp3 === void 0 ? {} : _temp3,
        _ref3$maxHops = _ref3.maxHops,
        maxHops = _ref3$maxHops === void 0 ? 3 : _ref3$maxHops;

    var etherIn = currencyIn.isNative;
    var etherOut = currencyOut.isNative;
    if (!etherIn && !etherOut) return null;
    var exactInGas = estimatedGasForMethod(Trade.methodNameForTradeType(exports.TradeType.EXACT_INPUT, etherIn, etherOut), maxHops.toString());
    var exactOutGas = estimatedGasForMethod(Trade.methodNameForTradeType(exports.TradeType.EXACT_OUTPUT, etherIn, etherOut), maxHops.toString());
    var exactInBribe = calculateMargin(calculateMinerBribe(gasPriceToBeat, exactInGas, minerBribeMargin), minTradeMargin);
    var exactOutBribe = calculateMargin(calculateMinerBribe(gasPriceToBeat, exactOutGas, minerBribeMargin), minTradeMargin);
    var minTokenAmountIn;
    var minTokenAmountOut;

    if (etherIn) {
      var outTrade = Trade.bestTradeExactOut(pairs, currencyOut, CurrencyAmount.fromRawAmount(currencyIn, exactOutBribe), '0', '0')[0];

      if (outTrade) {
        minTokenAmountIn = CurrencyAmount.fromRawAmount(currencyIn, exactInBribe);
        minTokenAmountOut = outTrade.inputAmount;
      }
    } else if (etherOut) {
      var inTrade = Trade.bestTradeExactIn(pairs, CurrencyAmount.fromRawAmount(currencyIn, exactInBribe), currencyIn, '0', '0')[0];

      if (inTrade) {
        minTokenAmountIn = inTrade.outputAmount;
        minTokenAmountOut = CurrencyAmount.fromRawAmount(currencyIn, exactOutBribe);
      }
    }

    if (!minTokenAmountIn || !minTokenAmountOut) return null;
    return _ref4 = {}, _ref4[exports.TradeType.EXACT_INPUT] = minTokenAmountIn, _ref4[exports.TradeType.EXACT_OUTPUT] = minTokenAmountOut, _ref4;
  }
  /**
   * Estimate bribe amounts given gas price and margin
   * @param gasPriceToBeat
   * @param minerBribeMargin
   */
  ;

  Trade.estimateBribeAmounts = function estimateBribeAmounts(gasPriceToBeat, minerBribeMargin) {
    var _bribesByMethod;

    var ETH = Ether.onChain(1);
    var bribesByMethod = (_bribesByMethod = {}, _bribesByMethod[exports.MethodName.swapETHForExactTokens] = CurrencyAmount.fromRawAmount(ETH, calculateMinerBribe(gasPriceToBeat, estimatedGasForMethod('swapETHForExactTokens'), minerBribeMargin)), _bribesByMethod[exports.MethodName.swapExactETHForTokens] = CurrencyAmount.fromRawAmount(ETH, calculateMinerBribe(gasPriceToBeat, estimatedGasForMethod('swapExactETHForTokens'), minerBribeMargin)), _bribesByMethod[exports.MethodName.swapExactTokensForETH] = CurrencyAmount.fromRawAmount(ETH, calculateMinerBribe(gasPriceToBeat, estimatedGasForMethod('swapExactTokensForETH'), minerBribeMargin)), _bribesByMethod[exports.MethodName.swapExactTokensForTokens] = CurrencyAmount.fromRawAmount(ETH, calculateMinerBribe(gasPriceToBeat, estimatedGasForMethod('swapExactTokensForTokens'), minerBribeMargin)), _bribesByMethod[exports.MethodName.swapTokensForExactETH] = CurrencyAmount.fromRawAmount(ETH, calculateMinerBribe(gasPriceToBeat, estimatedGasForMethod('swapTokensForExactETH'), minerBribeMargin)), _bribesByMethod[exports.MethodName.swapTokensForExactTokens] = CurrencyAmount.fromRawAmount(ETH, calculateMinerBribe(gasPriceToBeat, estimatedGasForMethod('swapTokensForExactTokens'), minerBribeMargin)), _bribesByMethod);
    var minBribe = CurrencyAmount.fromRawAmount(ETH, '1000000000000000000000000000000000000000000000000');
    var maxBribe = CurrencyAmount.fromRawAmount(ETH, '0');
    var totalBribe = CurrencyAmount.fromRawAmount(ETH, '0');

    for (var methodName in exports.MethodName) {
      var bribe = bribesByMethod[methodName];
      totalBribe.add(bribe);
      if (bribe.lessThan(minBribe)) minBribe = bribe;
      if (bribe.greaterThan(maxBribe)) maxBribe = bribe;
    }

    var meanfraction = totalBribe.divide(String(Object.keys(exports.MethodName).length));
    var meanBribe = CurrencyAmount.fromRawAmount(ETH, JSBI.divide(meanfraction.numerator, meanfraction.denominator));
    return {
      estimates: bribesByMethod,
      minBribe: minBribe,
      maxBribe: maxBribe,
      meanBribe: meanBribe
    };
  };

  return Trade;
}();

function toHex(currencyAmount) {
  return "0x" + currencyAmount.quotient.toString(16);
}

var ZERO_HEX = '0x0';
/**
 * Represents the Uniswap V2 Router, and has static methods for helping execute trades.
 */

var Router = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function Router() {}
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */


  Router.swapCallParameters = function swapCallParameters(trade, options) {
    var etherIn = trade.inputAmount.currency.isNative;
    var etherOut = trade.outputAmount.currency.isNative; // the router does not support both ether in and out

    !!(etherIn && etherOut) ?  invariant(false, 'ETHER_IN_OUT')  : void 0;
    !(!('ttl' in options) || options.ttl > 0) ?  invariant(false, 'TTL')  : void 0;
    var to = validateAndParseAddress(options.recipient);
    var amountIn = toHex(trade.maximumAmountIn(options.allowedSlippage));
    var amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage));
    var minerBribe = toHex(trade.minerBribe);
    var path = trade.route.path.map(function (token) {
      return token.address;
    });
    var deadline = 'ttl' in options ? "0x" + (Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16) : "0x" + options.deadline.toString(16);
    var useFeeOnTransfer = Boolean(options.feeOnTransfer);
    var swapData = {
      amount0: amountIn,
      amount1: amountOut,
      path: path,
      to: to,
      deadline: deadline
    };
    var value;
    var methodName = Trade.methodNameForTradeType(trade.tradeType, etherIn, etherOut, useFeeOnTransfer);

    switch (methodName) {
      case 'swapExactETHForTokens':
        swapData.amount0 = amountIn;
        swapData.amount1 = amountOut;
        value = amountIn;
        break;

      case 'swapExactTokensForETH':
        swapData.amount0 = amountIn;
        swapData.amount1 = amountOut;
        value = ZERO_HEX;
        break;

      case 'swapExactTokensForTokens':
        swapData.amount0 = amountIn;
        swapData.amount1 = amountOut;
        value = minerBribe;
        break;

      case 'swapETHForExactTokens':
        !!useFeeOnTransfer ?  invariant(false, 'EXACT_OUT_FOT')  : void 0;
        swapData.amount0 = amountIn;
        swapData.amount1 = amountOut;
        value = amountIn;
        break;

      case 'swapTokensForExactETH':
        !!useFeeOnTransfer ?  invariant(false, 'EXACT_OUT_FOT')  : void 0;
        swapData.amount0 = amountOut;
        swapData.amount1 = amountIn;
        value = minerBribe;
        break;

      case 'swapTokensForExactTokens':
        !!useFeeOnTransfer ?  invariant(false, 'EXACT_OUT_FOT')  : void 0;
        swapData.amount0 = amountOut;
        swapData.amount1 = amountIn;
        value = minerBribe;
        break;

      default:
        // args = []
        value = '';
    }

    var swapDataArr = [swapData.amount0, swapData.amount1, swapData.path, swapData.to, swapData.deadline];
    var args = [swapDataArr, minerBribe];
    !(methodName && args && value) ?  invariant(false, 'CALL_PARAMS_MISSING')  : void 0;
    return {
      methodName: methodName,
      args: args,
      value: value
    };
  };

  return Router;
}();

var ERC20 = [
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	}
];

var _TOKEN_DECIMALS_CACHE;
var TOKEN_DECIMALS_CACHE = (_TOKEN_DECIMALS_CACHE = {}, _TOKEN_DECIMALS_CACHE[exports.ChainId.MAINNET] = {
  '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': 9 // DGD

}, _TOKEN_DECIMALS_CACHE);
/**
 * Contains methods for constructing instances of pairs and tokens from on-chain data.
 */

var Fetcher = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function Fetcher() {}
  /**
   * Fetch information for a given token on the given chain, using the given ethers provider.
   * @param chainId chain of the token
   * @param address address of the token on the chain
   * @param provider provider used to fetch the token
   * @param symbol optional symbol of the token
   * @param name optional name of the token
   */


  Fetcher.fetchTokenData = function fetchTokenData(chainId, address, provider, symbol, name) {
    try {
      var _TOKEN_DECIMALS_CACHE2, _TOKEN_DECIMALS_CACHE3;

      var _temp3 = function _temp3(parsedDecimals) {
        return new Token(chainId, address, parsedDecimals, symbol, name);
      };

      if (provider === undefined) provider = providers.getDefaultProvider(networks.getNetwork(chainId));

      var _temp4 = typeof ((_TOKEN_DECIMALS_CACHE2 = TOKEN_DECIMALS_CACHE) === null || _TOKEN_DECIMALS_CACHE2 === void 0 ? void 0 : (_TOKEN_DECIMALS_CACHE3 = _TOKEN_DECIMALS_CACHE2[chainId]) === null || _TOKEN_DECIMALS_CACHE3 === void 0 ? void 0 : _TOKEN_DECIMALS_CACHE3[address]) === 'number';

      return Promise.resolve(_temp4 ? _temp3(TOKEN_DECIMALS_CACHE[chainId][address]) : Promise.resolve(new contracts.Contract(address, ERC20, provider).decimals().then(function (decimals) {
        var _TOKEN_DECIMALS_CACHE4, _extends2, _extends3;

        TOKEN_DECIMALS_CACHE = _extends({}, TOKEN_DECIMALS_CACHE, (_extends3 = {}, _extends3[chainId] = _extends({}, (_TOKEN_DECIMALS_CACHE4 = TOKEN_DECIMALS_CACHE) === null || _TOKEN_DECIMALS_CACHE4 === void 0 ? void 0 : _TOKEN_DECIMALS_CACHE4[chainId], (_extends2 = {}, _extends2[address] = decimals, _extends2)), _extends3));
        return decimals;
      })).then(_temp3));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return Fetcher;
}();

exports.JSBI = JSBI;
exports.AbstractCurrency = AbstractCurrency;
exports.CurrencyAmount = CurrencyAmount;
exports.Ether = Ether;
exports.FACTORY_ADDRESS = FACTORY_ADDRESS;
exports.FIVE = FIVE;
exports.Fetcher = Fetcher;
exports.Fraction = Fraction;
exports.GAS_ESTIMATES = GAS_ESTIMATES;
exports.INIT_CODE_HASH = INIT_CODE_HASH;
exports.InsufficientInputAmountError = InsufficientInputAmountError;
exports.InsufficientReservesError = InsufficientReservesError;
exports.MINIMUM_LIQUIDITY = MINIMUM_LIQUIDITY;
exports.MaxUint256 = MaxUint256;
exports.NativeCurrency = NativeCurrency;
exports.ONE = ONE;
exports.Pair = Pair;
exports.Percent = Percent;
exports.Price = Price;
exports.ROUTER_ADDRESS = ROUTER_ADDRESS;
exports.Route = Route;
exports.Router = Router;
exports.SOLIDITY_TYPE_MAXIMA = SOLIDITY_TYPE_MAXIMA;
exports.TEN = TEN;
exports.THREE = THREE;
exports.TWO = TWO;
exports.Token = Token;
exports.Trade = Trade;
exports.WETH = WETH;
exports.ZERO = ZERO;
exports._100 = _100;
exports._1000 = _1000;
exports._997 = _997;
exports.currencyEquals = currencyEquals;
exports.inputOutputComparator = inputOutputComparator;
exports.tradeComparator = tradeComparator;
//# sourceMappingURL=sdk.cjs.development.js.map
