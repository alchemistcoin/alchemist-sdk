import JSBI from 'jsbi';
export declare type BigintIsh = JSBI | number | string;
export { JSBI };
export declare enum ChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GÖRLI = 5,
    KOVAN = 42,
    HARDHAT = 1337
}
export declare enum Exchange {
    UNI = 0,
    SUSHI = 1,
    UNDEFINED = 2
}
export declare enum TradeType {
    EXACT_INPUT = 0,
    EXACT_OUTPUT = 1
}
export declare enum Rounding {
    ROUND_DOWN = 0,
    ROUND_HALF_UP = 1,
    ROUND_UP = 2
}
export declare const MaxUint256: JSBI;
export declare const FACTORY_ADDRESS: {
    [exchange in Exchange]: string;
};
export declare const ROUTER_ADDRESS: {
    [exchange in Exchange]: string;
};
export declare const INIT_CODE_HASH: {
    [exchange in Exchange]: string;
};
export declare const MINIMUM_LIQUIDITY: JSBI;
export declare const ZERO: JSBI;
export declare const ONE: JSBI;
export declare const TWO: JSBI;
export declare const THREE: JSBI;
export declare const FIVE: JSBI;
export declare const TEN: JSBI;
export declare const _100: JSBI;
export declare const _997: JSBI;
export declare const _1000: JSBI;
export declare enum SolidityType {
    uint8 = "uint8",
    uint256 = "uint256"
}
export declare const SOLIDITY_TYPE_MAXIMA: {
    uint8: JSBI;
    uint256: JSBI;
};
export declare enum MethodName {
    swapETHForExactTokens = "swapETHForExactTokens",
    swapExactETHForTokens = "swapExactETHForTokens",
    swapExactTokensForETH = "swapExactTokensForETH",
    swapExactTokensForTokens = "swapExactTokensForTokens",
    swapTokensForExactETH = "swapTokensForExactETH",
    swapTokensForExactTokens = "swapTokensForExactTokens"
}
export declare const GAS_ESTIMATES: {
    [methodName: string]: BigintIsh;
};