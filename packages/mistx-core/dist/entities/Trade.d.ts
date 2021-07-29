import { BigintIsh, Exchange, TradeType, MethodName } from '../constants';
import { Currency } from './Currency';
import { CurrencyAmount } from './CurrencyAmount';
import { Percent } from './Percent';
import { Price } from './Price';
import { Pair } from './Pair';
import { Route } from './Route';
import { Token } from './Token';
interface InputOutput<TInput extends Currency, TOutput extends Currency> {
    readonly inputAmount: CurrencyAmount<TInput>;
    readonly outputAmount: CurrencyAmount<TOutput>;
}
export declare type MinTradeEstimate = {
    [tradeType in TradeType]: CurrencyAmount<Token | Currency>;
};
declare type BribeEstimates = {
    [methodName in MethodName]: CurrencyAmount<Currency>;
};
export declare type BribeEstimate = {
    estimates: BribeEstimates;
    minBribe: CurrencyAmount<Currency>;
    maxBribe: CurrencyAmount<Currency>;
    meanBribe: CurrencyAmount<Currency>;
};
export declare function inputOutputComparator<TInput extends Currency, TOutput extends Currency>(a: InputOutput<TInput, TOutput>, b: InputOutput<TInput, TOutput>): number;
export declare function tradeComparator<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType>(a: Trade<TInput, TOutput, TTradeType>, b: Trade<TInput, TOutput, TTradeType>): number;
export interface BestTradeOptions {
    maxNumResults?: number;
    maxHops?: number;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare class Trade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
    /**
     * The exchange of the trade e.g. Uni, Sushi
     */
    readonly exchange: Exchange;
    /**
     * The route of the trade, i.e. which pairs the trade goes through.
     */
    readonly route: Route<TInput, TOutput>;
    /**
     * The type of the trade, either exact in or exact out.
     */
    readonly tradeType: TTradeType;
    /**
     * The input amount for the trade assuming no slippage.
     */
    readonly inputAmount: CurrencyAmount<TInput>;
    /**
     * The output amount for the trade assuming no slippage.
     */
    readonly outputAmount: CurrencyAmount<TOutput>;
    /**
     * The bribe amount needed to execute the trade
     */
    readonly minerBribe: CurrencyAmount<Token>;
    /**
     * The estimated gas used for the trade
     */
    readonly estimatedGas: BigintIsh;
    /**
     * The price expressed in terms of output amount/input amount.
     */
    readonly executionPrice: Price<TInput, TOutput>;
    /**
     * The percent difference between the mid price before the trade and the trade execution price.
     */
    readonly priceImpact: Percent;
    /**
      * Constructs an exact in trade with the given amount in and route
      * @param route route of the exact in trade
      * @param amountIn the amount being passed in
      * @param gasPriceToBeat the gas price used to calculate the bribe
      * @param minerBribeMargin the margin to beat the gas price by
      */
    static exactIn<TInput extends Currency, TOutput extends Currency>(route: Route<TInput, TOutput>, amountIn: CurrencyAmount<TInput>, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh): Trade<TInput, TOutput, TradeType.EXACT_INPUT>;
    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     * @param gasPriceToBeat the gas price used to calculate the bribe
    * @param minerBribeMargin the margin to beat the gas price by
     */
    static exactOut<TInput extends Currency, TOutput extends Currency>(route: Route<TInput, TOutput>, amountOut: CurrencyAmount<TOutput>, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>;
    constructor(route: Route<TInput, TOutput>, amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>, tradeType: TTradeType, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh);
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    minimumAmountOut(slippageTolerance: Percent): CurrencyAmount<TOutput>;
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    maximumAmountIn(slippageTolerance: Percent): CurrencyAmount<TInput>;
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
    static bestTradeExactIn<TInput extends Currency, TOutput extends Currency>(pairs: Pair[], currencyAmountIn: CurrencyAmount<TInput>, currencyOut: TOutput, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], nextAmountIn?: CurrencyAmount<Currency>, bestTrades?: Trade<TInput, TOutput, TradeType.EXACT_INPUT>[]): Trade<TInput, TOutput, TradeType.EXACT_INPUT>[];
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
    static bestTradeExactOut<TInput extends Currency, TOutput extends Currency>(pairs: Pair[], currencyIn: TInput, currencyAmountOut: CurrencyAmount<TOutput>, gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], nextAmountOut?: CurrencyAmount<Currency>, bestTrades?: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[]): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[];
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
    /**
     * Estimate bribe amounts given gas price and margin
     * @param gasPriceToBeat
     * @param minerBribeMargin
     */
    static estimateBribeAmounts(gasPriceToBeat: BigintIsh, minerBribeMargin: BigintIsh): BribeEstimate | null;
}
export {};
