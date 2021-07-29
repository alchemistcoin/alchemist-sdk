import JSBI from 'jsbi';
import { Exchange, BigintIsh, SolidityType } from './constants';
import { Currency } from './entities/Currency';
import { CurrencyAmount } from './entities/CurrencyAmount';
import { Percent } from './entities/Percent';
import { Price } from './entities/Price';
import { Token } from './entities/Token';
export declare function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void;
export declare function validateAndParseAddress(address: string): string;
export declare function parseBigintIsh(bigintIsh: BigintIsh): JSBI;
export declare function estimatedGasForMethod(methodName?: string, numHops?: BigintIsh): JSBI;
export declare function calculateMinerBribe(gasPriceToBeat: BigintIsh, estimatedGas: BigintIsh, margin: BigintIsh): JSBI;
export declare function calculateMargin(value: BigintIsh, margin: BigintIsh): JSBI;
export declare function sqrt(y: JSBI): JSBI;
export declare function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null;
export declare const computePairAddress: ({ exchange, tokenA, tokenB, }: {
    exchange: Exchange;
    tokenA: Token;
    tokenB: Token;
}) => string;
/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
export declare function computePriceImpact<TBase extends Currency, TQuote extends Currency>(midPrice: Price<TBase, TQuote>, inputAmount: CurrencyAmount<TBase>, outputAmount: CurrencyAmount<TQuote>): Percent;
