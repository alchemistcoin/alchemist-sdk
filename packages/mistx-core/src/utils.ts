import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import JSBI from 'jsbi'
import { getAddress, getCreate2Address } from '@ethersproject/address'
import { keccak256, pack } from '@ethersproject/solidity'
import { Exchange, BigintIsh, ZERO, ONE, TWO, THREE, SolidityType, SOLIDITY_TYPE_MAXIMA, GAS_ESTIMATES, INIT_CODE_HASH, FACTORY_ADDRESS} from './constants'
import { Currency } from './entities/Currency'
import { CurrencyAmount } from './entities/CurrencyAmount'
import { Percent } from './entities/Percent'
import { Price } from './entities/Price'
import { Token } from './entities/Token'

export function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void {
  invariant(JSBI.greaterThanOrEqual(value, ZERO), `${value} is not a ${solidityType}.`)
  invariant(JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`)
}

// warns if addresses are not checksummed
export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address)
    //console.log('checksum', checksummedAddress, address)
    warning(address === checksummedAddress, `${address} is not checksummed.`)
    return checksummedAddress
  } catch (error) {
    invariant(false, `${address} is not a valid address.`)
  }
}

export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === 'bigint'
    ? JSBI.BigInt(bigintIsh)
    : JSBI.BigInt(bigintIsh)
}

export function estimatedGasForMethod(methodName: string = 'swapTokensForExactETH', numHops: BigintIsh = '1'): JSBI {
  const gasBeforeHopFactor: BigintIsh = parseBigintIsh(GAS_ESTIMATES[methodName])
  const factor = parseBigintIsh('0') // TODO: change this
  const additionalGas = JSBI.multiply(parseBigintIsh(numHops), factor)
  return JSBI.add(gasBeforeHopFactor, additionalGas)
}

export function calculateMinerBribe(gasPriceToBeat: BigintIsh, estimatedGas: BigintIsh, margin: BigintIsh): JSBI {
  gasPriceToBeat = parseBigintIsh(gasPriceToBeat)
  estimatedGas = parseBigintIsh(estimatedGas)
  const gasPriceToBeatWithMargin = JSBI.subtract(calculateMargin(gasPriceToBeat, margin), gasPriceToBeat)
  return JSBI.multiply(gasPriceToBeatWithMargin, estimatedGas)
}

// add x%
export function calculateMargin(value: BigintIsh, margin: BigintIsh): JSBI {
  value = parseBigintIsh(value)
  margin = JSBI.multiply(parseBigintIsh(margin), parseBigintIsh('100'))
  const numerator = JSBI.multiply(value, JSBI.add(parseBigintIsh('10000'), margin))
  const denominator = parseBigintIsh('10000')
  return JSBI.divide(numerator, denominator)
}

// mock the on-chain sqrt function
export function sqrt(y: JSBI): JSBI {
  validateSolidityTypeInstance(y, SolidityType.uint256)
  let z: JSBI = ZERO
  let x: JSBI
  if (JSBI.greaterThan(y, THREE)) {
    z = y
    x = JSBI.add(JSBI.divide(y, TWO), ONE)
    while (JSBI.lessThan(x, z)) {
      z = x
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE
  }
  return z
}

// given an array of items sorted by `comparator`, insert an item into its sort index and constrain the size to
// `maxSize` by removing the last item
export function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null {
  invariant(maxSize > 0, 'MAX_SIZE_ZERO')
  // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize
  invariant(items.length <= maxSize, 'ITEMS_SIZE')

  // short circuit first item add
  if (items.length === 0) {
    items.push(add)
    return null
  } else {
    const isFull = items.length === maxSize
    // short circuit if full and the additional item does not come before the last item
    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add
    }

    let lo = 0,
      hi = items.length

    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    items.splice(lo, 0, add)
    return isFull ? items.pop()! : null
  }
}

export const computePairAddress = ({
  exchange,
  tokenA,
  tokenB,
}: {
  exchange: Exchange
  tokenA: Token
  tokenB: Token
}): string => {
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA] // does safety checks
  return getCreate2Address(
    FACTORY_ADDRESS[exchange],
    keccak256(
      ['bytes'],
      [pack(['address', 'address'], [token0.address, token1.address])]
    ),
    INIT_CODE_HASH[exchange]
  )
}

/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
export function computePriceImpact<
  TBase extends Currency,
  TQuote extends Currency
>(
  midPrice: Price<TBase, TQuote>,
  inputAmount: CurrencyAmount<TBase>,
  outputAmount: CurrencyAmount<TQuote>
): Percent {
  const quotedOutputAmount = midPrice.quote(inputAmount)
  // calculate price impact := (exactQuote - outputAmount) / exactQuote
  const priceImpact = quotedOutputAmount
    .subtract(outputAmount)
    .divide(quotedOutputAmount)
  return new Percent(priceImpact.numerator, priceImpact.denominator)
}


