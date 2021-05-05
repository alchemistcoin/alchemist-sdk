import { BigintIsh, Exchange, TradeType } from '../constants';
import { Currency } from './currency';
import { CurrencyAmount } from './fractions/currencyAmount';
import { Percent } from './fractions/percent';
import { Price } from './fractions/price';
import { TokenAmount } from './fractions/tokenAmount';
import { Pair } from './pair';
import { Route } from './route';
export declare type MinTradeEstimate = {
    [tradeType in TradeType]: CurrencyAmount;
};
interface InputOutput {
    readonly inputAmount: CurrencyAmount | TokenAmount;
    readonly outputAmount: CurrencyAmount | TokenAmount;
}
export declare function inputOutputComparator(a: InputOutput, b: InputOutput): number;
export declare function tradeComparator(a: Trade, b: Trade): number;
export interface BestTradeOptions {
    maxNumResults?: number;
    maxHops?: number;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare class Trade {
    /**
     * The exchange of the trade e.g. Uni, Sushi
     */
    readonly exchange: Exchange;
    /**
     * The route of the trade, i.e. which pairs the trade goes through.
     */
    readonly route: Route;
    /**
     * The type of the trade, either exact in or exact out.
     */
    readonly tradeType: TradeType;
    /**
     * The input amount for the trade assuming no slippage.
     */
    readonly inputAmount: CurrencyAmount;
    /**
     * The output amount for the trade assuming no slippage.
     */
    readonly outputAmount: CurrencyAmount;
    /**
     * The bribe amount needed to execute the trade
     */
    readonly minerBribe: CurrencyAmount;
    /**
     * The estimated gas used for the trade
     */
    readonly estimatedGas: BigintIsh;
    /**
     * The price expressed in terms of output amount/input amount.
     */
    readonly executionPrice: Price;
    /**
     * The mid price after the trade executes assuming no slippage.
     */
    readonly nextMidPrice: Price;
    /**
     * The percent difference between the mid price before the trade and the trade execution price.
     */
    readonly priceImpact: Percent;
    /**
     * Constructs an exact in trade with the given amount in and route
     * @param route route of the exact in trade
     * @param amountIn the amount being passed in
     */
    static exactIn(route: Route, amountIn: CurrencyAmount, exchange: Exchange, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh): Trade;
    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     */
    static exactOut(route: Route, amountOut: CurrencyAmount, exchange: Exchange, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh): Trade;
    constructor(route: Route, amount: CurrencyAmount, tradeType: TradeType, exchange: Exchange, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh);
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    minimumAmountOut(slippageTolerance: Percent): CurrencyAmount;
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    maximumAmountIn(slippageTolerance: Percent): CurrencyAmount;
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
    static bestTradeExactIn(pairs: Pair[], exchange: Exchange, currencyAmountIn: CurrencyAmount, currencyOut: Currency, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], originalAmountIn?: CurrencyAmount, bestTrades?: Trade[]): Trade[];
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
    static bestTradeExactOut(pairs: Pair[], exchange: Exchange, currencyIn: Currency, currencyAmountOut: CurrencyAmount, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], originalAmountOut?: CurrencyAmount, bestTrades?: Trade[]): Trade[];
    /**
     * return the mistX router method name for the trade
     * @param tradeType the type of trade, TradeType
     * @param etherIn the input currency is ether
     * @param etherOut the output currency is ether
     * @param useFeeOnTransfer Whether any of the tokens in the path are fee on transfer tokens, TradeOptions.feeOnTransfer
     * @param enforceUseFeeOnTransfer use to throw an invariant if there is no useFeeOnTransfer option for TradeType.EXACT_OUTPUT trades
     */
    static methodNameForTradeType(tradeType: TradeType, etherIn: boolean, etherOut: boolean, useFeeOnTransfer?: boolean): string;
    /**
     * return the mistX router method name for the trade
     * @param pairs
     * @param currencyIn
     * @param currencyOut
     * @param gasPriceToBeat
     * @param minerBribeMargin
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     */
    static estimateMinTradeAmounts(pairs: Pair[], currencyIn: Currency, currencyOut: Currency, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh, minTradeMargin: BigintIsh, { maxHops }?: BestTradeOptions): MinTradeEstimate | null;
}
export {};
