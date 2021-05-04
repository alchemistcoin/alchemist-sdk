import invariant from 'tiny-invariant'
import { Swap, ChainId, CurrencyAmount, ETHER, Pair, Percent, Route, Router, Token, TokenAmount, Trade, WETH, Exchange } from '../src'
import JSBI from 'jsbi'

function checkDeadline(deadline: string[] | string): void {
  expect(typeof deadline).toBe('string')
  invariant(typeof deadline === 'string')
  // less than 5 seconds on the deadline
  expect(new Date().getTime() / 1000 - parseInt(deadline)).toBeLessThanOrEqual(5)
}

describe('Router', () => {
  const token0 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1')

  const pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token1, JSBI.BigInt(1000)), Exchange.UNI,)

  const pair_weth_0 = new Pair(new TokenAmount(WETH[ChainId.MAINNET], '1000'), new TokenAmount(token0, '1000'), Exchange.UNI,)
  
  const gas_price_to_beat = `0`
  const miner_bribe_margin = `0`

  describe('#swapCallParameters', () => {
    describe('exact in', () => {
      it('ether to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(new Route([pair_weth_0, pair_0_1], ETHER, token1), CurrencyAmount.ether(JSBI.BigInt(100)), Exchange.UNI, gas_price_to_beat, miner_bribe_margin),
          { ttl: 50, recipient: '0x0000000000000000000000000000000000000004', allowedSlippage: new Percent('1', '100') }
        )
        const swap = result.args[0] as Swap
        expect(result.methodName).toEqual('swapExactETHForTokens')
        expect(swap.amount1).toEqual('0x51')
        expect(swap.path).toEqual([WETH[ChainId.MAINNET].address, token0.address, token1.address])
        expect(swap.to).toEqual('0x0000000000000000000000000000000000000004')
        expect(result.value).toEqual('0x64')
        checkDeadline(swap.deadline)
      })

      it('deadline specified', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(new Route([pair_weth_0, pair_0_1], ETHER, token1), CurrencyAmount.ether(JSBI.BigInt(100)), Exchange.UNI, gas_price_to_beat, miner_bribe_margin),
          {
            deadline: 50,
            recipient: '0x0000000000000000000000000000000000000004',
            allowedSlippage: new Percent('1', '100')
          }
        )
        const swap = result.args[0] as Swap
        expect(result.methodName).toEqual('swapExactETHForTokens')
        expect(swap.amount1).toEqual('0x51')
        expect(swap.path).toEqual([WETH[ChainId.MAINNET].address, token0.address, token1.address])
        expect(swap.to).toEqual('0x0000000000000000000000000000000000000004')
        expect(swap.deadline).toEqual('0x32')
        expect(result.value).toEqual('0x64')
      })

      it('token1 to ether', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(new Route([pair_0_1, pair_weth_0], token1, ETHER), new TokenAmount(token1, JSBI.BigInt(100)), Exchange.UNI, gas_price_to_beat, miner_bribe_margin),
          { ttl: 50, recipient: '0x0000000000000000000000000000000000000004', allowedSlippage: new Percent('1', '100') }
        )
        const swap = result.args[0] as Swap
        expect(result.methodName).toEqual('swapExactTokensForETH')
        expect(swap.amount0).toEqual('0x64')
        expect(swap.amount1).toEqual('0x51')
        expect(swap.path).toEqual([token1.address, token0.address, WETH[ChainId.MAINNET].address])
        expect(swap.to).toEqual('0x0000000000000000000000000000000000000004')
        expect(result.value).toEqual('0x0')
        checkDeadline(swap.deadline)
      })
      it('token0 to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(new Route([pair_0_1], token0, token1), new TokenAmount(token0, JSBI.BigInt(100)), Exchange.UNI, gas_price_to_beat, miner_bribe_margin),
          { ttl: 50, recipient: '0x0000000000000000000000000000000000000004', allowedSlippage: new Percent('1', '100') }
        )
        const swap = result.args[0] as Swap
        expect(result.methodName).toEqual('swapExactTokensForTokens')
        expect(swap.amount0).toEqual('0x64')
        expect(swap.amount1).toEqual('0x59')
        expect(swap.path).toEqual([token0.address, token1.address])
        expect(swap.to).toEqual('0x0000000000000000000000000000000000000004')
        expect(result.value).toEqual('0x0')
        checkDeadline(swap.deadline)
      })
    })
    describe('exact out', () => {
      it('ether to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactOut(new Route([pair_weth_0, pair_0_1], ETHER, token1), new TokenAmount(token1, JSBI.BigInt(100)), Exchange.UNI, gas_price_to_beat, miner_bribe_margin),
          { ttl: 50, recipient: '0x0000000000000000000000000000000000000004', allowedSlippage: new Percent('1', '100') }
        )
        const swap = result.args[0] as Swap
        expect(result.methodName).toEqual('swapETHForExactTokens')
        expect(swap.amount1).toEqual('0x64')
        expect(swap.path).toEqual([WETH[ChainId.MAINNET].address, token0.address, token1.address])
        expect(swap.to).toEqual('0x0000000000000000000000000000000000000004')
        expect(result.value).toEqual('0x80')        
        checkDeadline(swap.deadline)
      })
      it('token1 to ether', () => {
        const result = Router.swapCallParameters(
          Trade.exactOut(new Route([pair_0_1, pair_weth_0], token1, ETHER), CurrencyAmount.ether(JSBI.BigInt(100)), Exchange.UNI, gas_price_to_beat, miner_bribe_margin),
          { ttl: 50, recipient: '0x0000000000000000000000000000000000000004', allowedSlippage: new Percent('1', '100') }
        )
        const swap = result.args[0] as Swap
        expect(result.methodName).toEqual('swapTokensForExactETH')
        expect(swap.amount0).toEqual('0x64')
        expect(swap.amount1).toEqual('0x80')
        expect(swap.path).toEqual([token1.address, token0.address, WETH[ChainId.MAINNET].address])
        expect(swap.to).toEqual('0x0000000000000000000000000000000000000004')
        expect(result.value).toEqual('0x0')
        checkDeadline(swap.deadline)
      })
      it('token0 to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactOut(new Route([pair_0_1], token0, token1), new TokenAmount(token1, JSBI.BigInt(100)), Exchange.UNI, gas_price_to_beat, miner_bribe_margin),
          { ttl: 50, recipient: '0x0000000000000000000000000000000000000004', allowedSlippage: new Percent('1', '100') }
        )
        const swap = result.args[0] as Swap
        expect(result.methodName).toEqual('swapTokensForExactTokens')
        expect(swap.amount0).toEqual('0x64')
        expect(swap.amount1).toEqual('0x71')
        expect(swap.path).toEqual([token0.address, token1.address])
        expect(swap.to).toEqual('0x0000000000000000000000000000000000000004')
        expect(result.value).toEqual('0x0')
        checkDeadline(swap.deadline)
      })
    })
  })
})
