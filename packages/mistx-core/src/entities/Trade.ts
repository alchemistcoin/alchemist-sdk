import invariant from 'tiny-invariant'
import { BigintIsh, Exchange, ONE, TradeType, ZERO} from '../constants'
import { sortedInsert, computePriceImpact } from '../utils'
import { Currency } from './Currency'
import { CurrencyAmount } from './CurrencyAmount'
import { Fraction } from './Fraction'
import { Percent } from './Percent'
import { Price } from './Price'
import { Pair } from './Pair'
import { Route } from './Route'
import { currencyEquals, Token } from './Token'
import { WETH } from './weth'


// minimal interface so the input output comparator may be shared across types
interface InputOutput<TInput extends Currency, TOutput extends Currency> {
  readonly inputAmount: CurrencyAmount<TInput>
  readonly outputAmount: CurrencyAmount<TOutput>
}

export type MinTradeEstimate = { [tradeType in TradeType]: CurrencyAmount<Token|Currency> }

// comparator function that allows sorting trades by their output amounts, in decreasing order, and then input amounts
// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first
export function inputOutputComparator<
  TInput extends Currency,
  TOutput extends Currency
>(a: InputOutput<TInput, TOutput>, b: InputOutput<TInput, TOutput>): number {
  // must have same input and output token for comparison
  invariant(
    a.inputAmount.currency.equals(b.inputAmount.currency),
    'INPUT_CURRENCY'
  )
  invariant(
    a.outputAmount.currency.equals(b.outputAmount.currency),
    'OUTPUT_CURRENCY'
  )
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0
    }
    // trade A requires less input than trade B, so A should come first
    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1
    } else {
      return 1
    }
  } else {
    // tradeA has less output than trade B, so should come second
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1
    } else {
      return -1
    }
  }
}

// extension of the input output comparator that also considers other dimensions of the trade in ranking them
export function tradeComparator<
  TInput extends Currency,
  TOutput extends Currency,
  TTradeType extends TradeType
>(
  a: Trade<TInput, TOutput, TTradeType>,
  b: Trade<TInput, TOutput, TTradeType>
) {
  const ioComp = inputOutputComparator(a, b)
  if (ioComp !== 0) {
    return ioComp
  }

  // consider lowest slippage next, since these are less likely to fail
  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1
  } else if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1
  }

  // finally consider the number of hops since each hop costs gas
  return a.route.path.length - b.route.path.length
}

export interface BestTradeOptions {
  // how many results to return
  maxNumResults?: number
  // the maximum number of hops a trade should contain
  maxHops?: number
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class Trade<
  TInput extends Currency,
  TOutput extends Currency,
  TTradeType extends TradeType
> {
  /**
   * The exchange of the trade e.g. Uni, Sushi
   */
  public readonly exchange: Exchange

  /**
   * The route of the trade, i.e. which pairs the trade goes through.
   */
  public readonly route: Route<TInput, TOutput>
  /**
   * The type of the trade, either exact in or exact out.
   */
  public readonly tradeType: TTradeType
  /**
   * The input amount for the trade assuming no slippage.
   */
  public readonly inputAmount: CurrencyAmount<TInput>
  /**
   * The output amount for the trade assuming no slippage.
   */
  public readonly outputAmount: CurrencyAmount<TOutput>
  /**
   * The bribe amount needed to execute the trade
   */
  public readonly protectionFee: CurrencyAmount<Token>
  /**
   * The price expressed in terms of output amount/input amount.
   */
  public readonly executionPrice: Price<TInput, TOutput>
  
  /**
   * The percent difference between the mid price before the trade and the trade execution price.
   */
  public readonly priceImpact: Percent

  /**
    * Constructs an exact in trade with the given amount in and route
    * @param route route of the exact in trade
    * @param amountIn the amount being passed in
    * @param protectionFeeAmount the eth fee amount paid out of the quote
    */
    public static exactIn<TInput extends Currency, TOutput extends Currency>(
    route: Route<TInput, TOutput>,
    amountIn: CurrencyAmount<TInput>,
    protectionFeeAmount: BigintIsh,
  ): Trade<TInput, TOutput, TradeType.EXACT_INPUT> {
    return new Trade(route, amountIn, TradeType.EXACT_INPUT, protectionFeeAmount)
  }

  /**
   * Constructs an exact out trade with the given amount out and route
   * @param route route of the exact out trade
   * @param amountOut the amount returned by the trade
   * @param protectionFeeAmount the eth fee amount paid out of the quote
   */
   public static exactOut<TInput extends Currency, TOutput extends Currency>(
    route: Route<TInput, TOutput>,
    amountOut: CurrencyAmount<TOutput>,
    protectionFeeAmount: BigintIsh
  ): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT> {
    return new Trade(route, amountOut, TradeType.EXACT_OUTPUT, protectionFeeAmount)
  }

  public constructor(
    route: Route<TInput, TOutput>,
    amount: TTradeType extends TradeType.EXACT_INPUT
      ? CurrencyAmount<TInput>
      : CurrencyAmount<TOutput>,
    tradeType: TTradeType,
    protectionFeeAmount: BigintIsh,
  ) {
    this.route = route
    this.tradeType = tradeType
    this.protectionFee = CurrencyAmount.fromRawAmount(WETH[route.chainId], protectionFeeAmount)

    const amounts: CurrencyAmount<Token>[] = new Array(route.path.length)
    const nextPairs: Pair[] = new Array(route.pairs.length)
    const etherIn = route.input.isNative
    const etherOut = route.output.isNative
    
    

    let modifiedInput: CurrencyAmount<Token> = amount.wrapped
    let modifiedOutput: CurrencyAmount<Token> = amount.wrapped

    if (tradeType === TradeType.EXACT_INPUT) {
      invariant(currencyEquals(amount.currency, route.input), 'INPUT')

      amounts[0] = amount.wrapped

      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i]

        let inputAmount = amounts[i]
        // if the input is ETH, calculate the output amount with the
        // the input reduced by the minerBribe
        if (etherIn && i === 0) {
          // reduce the inputAmount by this.minerBribe
          invariant(
            inputAmount.greaterThan(this.protectionFee),
            `Miner bribe ${this.protectionFee.toExact()} is greater than input ETH ${inputAmount.toExact()}`
          )
          const modifiedAmount = inputAmount.subtract(this.protectionFee)
          // console.log('original amount in', inputAmount.toExact())
          // console.log('modified amount in', modifiedAmount.toExact())
          inputAmount = modifiedAmount
          modifiedInput = modifiedAmount
        }
        
        const [outputAmount, nextPair] = pair.getOutputAmount(inputAmount)

        // if the output is ETH, reduce the output amount
        // by the miner bribe
        if (etherOut && i === route.path.length - 2) {
          // reduce the outputAmount by this.minerBribe
          invariant(
            outputAmount.greaterThan(this.protectionFee),
            `Miner bribe ${this.protectionFee.toExact()} is greater than output ETH ${outputAmount.toExact()}`
          )
          const modifiedAmount = outputAmount.subtract(this.protectionFee)
          // console.log('original amount out', outputAmount.toExact())
          // console.log('modified amount out', modifiedAmount.toExact())
          amounts[i + 1] = modifiedAmount
          modifiedOutput = outputAmount
        } else {
          modifiedOutput = outputAmount
          amounts[i + 1] = outputAmount
        }

        nextPairs[i] = nextPair
      }
    } else {
      invariant(currencyEquals(amount.currency, route.output), 'OUTPUT')
      amounts[amounts.length - 1] = amount.wrapped
      for (let i = route.path.length - 1; i > 0; i--) {
        let outputAmount = amounts[i]
        // if the output is ETH, calculate the input amount with the
        // the output increased by the minerBribe
        if (etherOut && i === route.path.length - 1) {
          // increase the outputAmount by this.minerBribe
          const modifiedAmount = outputAmount.add(this.protectionFee)
          // console.log('original amount out', outputAmount.toExact())
          // console.log('modified amount out', modifiedAmount.toExact())
          outputAmount = modifiedAmount
          modifiedOutput = modifiedAmount
        } else if (i === route.path.length - 1) {
          modifiedOutput = outputAmount
        }
        const pair = route.pairs[i - 1]
        const [inputAmount, nextPair] = pair.getInputAmount(outputAmount)
        // if the input is ETH, increase the input amount
        // by the miner bribe
        if (etherIn && i === 1) {
          // increase the input amount by this.minerBribe
          const modifiedAmount = inputAmount.add(this.protectionFee)
          // console.log('original amount in', inputAmount.toExact())
          // console.log('modified amount in', modifiedAmount.toExact())
          amounts[i - 1] = modifiedAmount
          modifiedInput = inputAmount
        } else if (i === 1) {
          modifiedInput = inputAmount
          amounts[i - 1] = modifiedInput
        } else {
          amounts[i - 1] = inputAmount
        }
        nextPairs[i - 1] = nextPair
      }
    }

    this.exchange = route.pairs[0].exchange
    this.inputAmount = CurrencyAmount.fromFractionalAmount(
      route.input,
      amounts[0].numerator,
      amounts[0].denominator
    )
    // this.inputAmount =
    //   tradeType === TradeType.EXACT_INPUT
    //     ? amount
    //     : route.input === ETHER
    //     ? CurrencyAmount.ether(amounts[0].raw)
    //     : amounts[0]
    this.outputAmount = CurrencyAmount.fromFractionalAmount(
      route.output,
      amounts[amounts.length - 1].numerator,
      amounts[amounts.length - 1].denominator
    )
    // this.outputAmount =
    //   tradeType === TradeType.EXACT_OUTPUT
    //     ? amount
    //     : route.output === ETHER
    //     ? CurrencyAmount.ether(amounts[amounts.length - 1].raw)
    //     : amounts[amounts.length - 1]
    this.executionPrice = new Price(
      route.input,
      route.output,
      modifiedInput.quotient,
      modifiedOutput.quotient
    )
    // this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount)
    this.priceImpact = computePriceImpact(
      route.midPrice, 
      CurrencyAmount.fromFractionalAmount(
        route.input,
        modifiedInput.numerator,
        modifiedInput.denominator
      ), 
      CurrencyAmount.fromFractionalAmount(
        route.output,
        modifiedOutput.numerator,
        modifiedOutput.denominator
      )
    )
    
    // console.log('old price impact', computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount).toSignificant(6))
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
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount<TOutput> {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(slippageTolerance)
        .invert()
        .multiply(this.outputAmount.quotient).quotient
      return CurrencyAmount.fromRawAmount(
        this.outputAmount.currency,
        slippageAdjustedAmountOut
      )
    }
  }

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount<TInput> {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient
      return CurrencyAmount.fromRawAmount(
        this.inputAmount.currency,
        slippageAdjustedAmountIn
      )
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
   * @param protectionFeeAmount the eth fee amount paid out of the quote
   */
  public static bestTradeExactIn<
    TInput extends Currency,
    TOutput extends Currency
>(
    pairs: Pair[],
    currencyAmountIn: CurrencyAmount<TInput>,
    currencyOut: TOutput,
    protectionFeeAmount: BigintIsh,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    // used in recursion.
    currentPairs: Pair[] = [],
    nextAmountIn: CurrencyAmount<Currency> = currencyAmountIn,
    bestTrades: Trade<TInput, TOutput, TradeType.EXACT_INPUT>[] = []
  ): Trade<TInput, TOutput, TradeType.EXACT_INPUT>[] {
    invariant(pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(nextAmountIn === currencyAmountIn || currentPairs.length > 0, 'INVALID_RECURSION')
    const tradeType = TradeType.EXACT_INPUT
    const amountIn = nextAmountIn.wrapped//wrappedAmount(currencyAmountIn, chainId)
    const tokenOut = currencyOut.wrapped//wrappedCurrency(currencyOut, chainId)

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      // pair irrelevant
      if (!pair.token0.equals(amountIn.currency) && !pair.token1.equals(amountIn.currency)) continue
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

      let amountOut: CurrencyAmount<Token>
      try {
        ;[amountOut] = pair.getOutputAmount(amountIn)
      } catch (error) {
        // input too low
        if (error.isInsufficientInputAmountError) {
          continue
        }
        throw error
      }
      // we have arrived at the output token, so this is the final trade of one of the paths
      if (amountOut.currency.equals(tokenOut)) {
        try {
          const newTrade = new Trade(
            new Route([...currentPairs, pair], currencyAmountIn.currency, currencyOut),
            currencyAmountIn,
            tradeType,
            protectionFeeAmount
          )
          sortedInsert(
            bestTrades,
            newTrade,
            maxNumResults,
            tradeComparator
          )
        } catch (e) {
          // catch the invariant
          // console.log('trade constructor err', e)
        }
        
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))

        // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
        Trade.bestTradeExactIn(
          pairsExcludingThisPair,
          currencyAmountIn,
          currencyOut,
          protectionFeeAmount,
          {
            maxNumResults,
            maxHops: maxHops - 1
          },
          [...currentPairs, pair],
          amountOut,
          bestTrades
        )
      }
    }

    return bestTrades
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
   * @param protectionFeeAmount the eth fee amount paid out of the quote
   */
  public static bestTradeExactOut<
    TInput extends Currency,
    TOutput extends Currency
>(
    pairs: Pair[],
    currencyIn: TInput,
    currencyAmountOut: CurrencyAmount<TOutput>,
    protectionFeeAmount: BigintIsh,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    // used in recursion.
    currentPairs: Pair[] = [],
    nextAmountOut: CurrencyAmount<Currency> = currencyAmountOut,
    bestTrades: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] = []
  ): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] {
    invariant(pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(nextAmountOut === currencyAmountOut || currentPairs.length > 0, 'INVALID_RECURSION')
    

    const amountOut = nextAmountOut.wrapped
    const tokenIn = currencyIn.wrapped
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      // pair irrelevant
      if (!pair.token0.equals(amountOut.currency) && !pair.token1.equals(amountOut.currency)) continue
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

      let amountIn: CurrencyAmount<Token>
      try {
        ;[amountIn] = pair.getInputAmount(amountOut)
      } catch (error) {
        // not enough liquidity in this pair
        if (error.isInsufficientReservesError) {
          continue
        }
        throw error
      }
      // we have arrived at the input token, so this is the first trade of one of the paths
      if (amountIn.currency.equals(tokenIn)) {
        try {
          const newTrade = new Trade(
            new Route([pair, ...currentPairs], currencyIn, currencyAmountOut.currency),
            currencyAmountOut,
            TradeType.EXACT_OUTPUT,
            protectionFeeAmount
          )
          sortedInsert(
            bestTrades,
            newTrade,
            maxNumResults,
            tradeComparator
          )
        } catch (e) {
          // catch the invariant
          // console.log('trade constructor err', e)
        }
        
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))

        // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops
        Trade.bestTradeExactOut(
          pairsExcludingThisPair,
          currencyIn,
          currencyAmountOut,
          protectionFeeAmount,
          {
            maxNumResults,
            maxHops: maxHops - 1
          },
          [pair, ...currentPairs],
          amountIn,
          bestTrades
        )
      }
    }

    return bestTrades
  }

  /**
   * return the mistX router method name for the trade
   * @param tradeType the type of trade, TradeType
   * @param etherIn the input currency is ether
   * @param etherOut the output currency is ether
   * @param useFeeOnTransfer Whether any of the tokens in the path are fee on transfer tokens, TradeOptions.feeOnTransfer
   * @param enforceUseFeeOnTransfer use to throw an invariant if there is no useFeeOnTransfer option for TradeType.EXACT_OUTPUT trades
   */
  public static methodNameForTradeType(
    tradeType: TradeType,
    etherIn: boolean,
    etherOut: boolean,
    useFeeOnTransfer?: boolean
  ): string {
    let methodName: string
    switch (tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = 'swapExactETHForTokens'
        } else if (etherOut) {
          methodName = 'swapExactTokensForETH'
        } else {
          methodName = 'swapExactTokensForTokens'
        }
        break
      case TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        if (etherIn) {
          methodName = 'swapETHForExactTokens'
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'
        } else {
          methodName = 'swapTokensForExactTokens'
        }
        break
    }
    return methodName
  }

  /**
   * return the mistX router method name for the trade
   * @param pairs
   * @param currencyIn
   * @param currencyOut
   * @param protectionFeeAmount the eth fee amount paid out of the quote
   */
  public static estimateMinTradeAmounts(
    pairs: Pair[],
    currencyIn: Currency,
    currencyOut: Currency,
    protectionFeeAmount: BigintIsh
  ): MinTradeEstimate | null {
    
    const etherIn = currencyIn.isNative
    const etherOut = currencyOut.isNative

    if (!etherIn && !etherOut) return null

    let minTokenAmountIn: CurrencyAmount<Token|Currency> | undefined
    let minTokenAmountOut: CurrencyAmount<Token|Currency> | undefined
    if (etherIn){
      const outTrade = Trade.bestTradeExactOut(
        pairs,
        currencyOut,
        CurrencyAmount.fromRawAmount(currencyIn, protectionFeeAmount),
        '0',
      )[0]
      if (outTrade){
        minTokenAmountIn = CurrencyAmount.fromRawAmount(currencyIn, protectionFeeAmount)
        minTokenAmountOut = outTrade.inputAmount
      }
    } else if (etherOut){
      const inTrade = Trade.bestTradeExactIn(
        pairs,
        CurrencyAmount.fromRawAmount(currencyOut, protectionFeeAmount),
        currencyIn,
        '0',
      )[0]
      if (inTrade){
        minTokenAmountIn = inTrade.outputAmount
        minTokenAmountOut = CurrencyAmount.fromRawAmount(currencyIn, protectionFeeAmount)
      }
      
    }
    if (!minTokenAmountIn || !minTokenAmountOut) return null

    return {
      [TradeType.EXACT_INPUT]: minTokenAmountIn,
      [TradeType.EXACT_OUTPUT]: minTokenAmountOut
    }
  }
}
