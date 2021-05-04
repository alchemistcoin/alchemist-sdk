import invariant from 'tiny-invariant'
import { validateAndParseAddress } from './utils'
import { CurrencyAmount, ETHER, Percent, Trade } from './entities'
import { ROUTER_ADDRESS } from './constants'

/**
 * Options for producing the arguments to send call to the router.
 */
export interface TradeOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  allowedSlippage: Percent
  /**
   * How long the swap is valid until it expires, in seconds.
   * This will be used to produce a `deadline` parameter which is computed from when the swap call parameters
   * are generated.
   */
  ttl: number
  /**
   * The account that should receive the output of the swap.
   */
  recipient: string

  /**
   * Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
   */
  feeOnTransfer?: boolean
}

export interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
  /**
   * When the transaction expires.
   * This is an atlernate to specifying the ttl, for when you do not want to use local time.
   */
  deadline: number
}

/**
 * The parameters to use in the call to the Uniswap V2 Router to execute a trade.
 */
export interface SwapParameters {
  /**
   * The method to call on the Uniswap V2 Router.
   */
  methodName: string
  /**
   * The arguments to pass to the method, all hex encoded.
   */
  args: [SwapDataArr, string, string]
  /**
   * The amount of wei to send in hex.
   */
  value: string
}

export interface SwapData {
  amount0: string
  amount1: string
  path: string[]
  to: string
  deadline: string
}

export type SwapDataArr = [string, string, string[], string, string]

function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}

const ZERO_HEX = '0x0'

/**
 * Represents the Uniswap V2 Router, and has static methods for helping execute trades.
 */
export abstract class Router {
  /**
   * Cannot be constructed.
   */
  private constructor() {}
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(trade: Trade, options: TradeOptions | TradeOptionsDeadline): SwapParameters {
    const etherIn = trade.inputAmount.currency === ETHER
    const etherOut = trade.outputAmount.currency === ETHER
    // the router does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL')

    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(trade.maximumAmountIn(options.allowedSlippage))
    const amountOut: string = toHex(trade.minimumAmountOut(options.allowedSlippage))
    const minerBribe: string = toHex(trade.minerBribe)
    const path: string[] = trade.route.path.map(token => token.address)
    const deadline =
      'ttl' in options
        ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
        : `0x${options.deadline.toString(16)}`

    const useFeeOnTransfer = Boolean(options.feeOnTransfer)
    const routerAddress = ROUTER_ADDRESS[trade.exchange]
    const swapData: SwapData = {
      amount0: amountIn,
      amount1: amountOut,
      path,
      to,
      deadline
    }
    let value: string
    const methodName = Trade.methodNameForTradeType(trade.tradeType, etherIn, etherOut, useFeeOnTransfer)
    
    switch (methodName) {
      case 'swapExactETHForTokens':
        swapData.amount0 = amountIn
        swapData.amount1 = amountOut
        value = amountIn
        break
      case 'swapExactTokensForETH':
        swapData.amount0 = amountIn
        swapData.amount1 = amountOut
        value = ZERO_HEX
        break
      case 'swapExactTokensForTokens':
        swapData.amount0 = amountIn
        swapData.amount1 = amountOut
        value = ZERO_HEX
        break
      case 'swapETHForExactTokens':
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        swapData.amount0 = amountIn
        swapData.amount1 = amountOut
        value = amountIn
        break
      case 'swapTokensForExactETH':
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        swapData.amount0 = amountOut
        swapData.amount1 = amountIn
        value = minerBribe
        break
      case 'swapTokensForExactTokens':
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        swapData.amount0 = amountOut
        swapData.amount1 = amountIn
        value = minerBribe
        break
      default:
        // args = []
        value = ''
    }
    const swapDataArr: SwapDataArr = [swapData.amount0, swapData.amount1, swapData.path, swapData.to, swapData.deadline]
    const args: [SwapDataArr, string, string] = [swapDataArr, routerAddress, minerBribe]

    invariant((methodName && args && value), 'CALL_PARAMS_MISSING')
    return {
      methodName,
      args,
      value
    }
  }
}
