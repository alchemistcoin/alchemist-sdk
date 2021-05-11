import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  HARDHAT = 1337
}

export enum Exchange {
  UNI,
  SUSHI,
  UNDEFINED
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

export const FACTORY_ADDRESS: { [exchange in Exchange]: string } = {
  [Exchange.UNI]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  [Exchange.SUSHI]: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
  [Exchange.UNDEFINED]: '0x0'
}

export const ROUTER_ADDRESS: { [exchange in Exchange]: string } = {
  [Exchange.UNI]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  [Exchange.SUSHI]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9',
  [Exchange.UNDEFINED]: '0x0'
}

export const INIT_CODE_HASH: { [exchange in Exchange]: string } = {
  [Exchange.UNI]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
  [Exchange.SUSHI]: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
  [Exchange.UNDEFINED]: '0x0'
}

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}

export const GAS_ESTIMATES: { [methodName: string]: BigintIsh } = {
  swapETHForExactTokens: '174552',
  swapExactETHForTokens: '161308',
  swapExactTokensForETH: '146057',
  swapExactTokensForTokens: '143216',
  swapTokensForExactETH: '189218',
  swapTokensForExactTokens: '185096'
}
