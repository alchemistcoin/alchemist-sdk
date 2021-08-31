import { io, Socket } from 'socket.io-client'
import { BigNumberish, BigNumber } from '@ethersproject/bignumber'

export enum Event {
  FEES_CHANGE = 'FEES_CHANGE',
  SOCKET_SESSION = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  BUNDLE_REQUEST = 'BUNDLE_REQUEST',
  MISTX_BUNDLE_REQUEST = 'MISTX_BUNDLE_REQUEST',
  BUNDLE_STATUS_REQUEST = 'BUNDLE_STATUS_REQUEST',
  BUNDLE_STATUS_RESPONSE = 'BUNDLE_STATUS_RESPONSE',
  BUNDLE_RESPONSE = 'BUNDLE_RESPONSE',
  BUNDLE_CANCEL_REQUEST = 'BUNDLE_CANCEL_REQUEST'
}

export interface Fee {
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
}
export interface Fees {
  block: number
  baseFeePerGas: BigNumber
  default: Fee
  low: Fee
  med: Fee
  high: Fee
}

export enum Status {
  PENDING_BUNDLE = 'PENDING_BUNDLE',
  FAILED_BUNDLE = 'FAILED_BUNDLE',
  SUCCESSFUL_BUNDLE = 'SUCCESSFUL_BUNDLE',
  CANCEL_BUNDLE_SUCCESSFUL = 'CANCEL_BUNDLE_SUCCESSFUL',
  BUNDLE_NOT_FOUND = 'BUNDLE_NOT_FOUND'
}

export const STATUS_LOCALES: Record<string, string> = {
  PENDING_BUNDLE: 'Flashbots working on including your swap',
  FAILED_BUNDLE: 'Failed',
  SUCCESSFUL_BUNDLE: 'Success',
  CANCEL_BUNDLE_SUCCESSFUL: 'Cancelled',
  BUNDLE_NOT_FOUND: 'Failed'
}

export enum Diagnosis {
  LOWER_THAN_TAIL = 'LOWER_THAN_TAIL',
  NOT_A_FLASHBLOCK = 'NOT_A_FLASHBLOCK',
  BUNDLE_OUTBID = 'BUNDLE_OUTBID',
  ERROR_API_BEHIND = 'ERROR_API_BEHIND',
  MISSING_BLOCK_DATA = 'MISSING_BLOCK_DATA',
  ERROR_UNKNOWN = 'ERROR_UNKNOWN'
}

export interface MistXVersion {
  api: string
  client: string
}

export interface SocketSession {
  token: string
  version: MistXVersion | undefined
}

export interface TransactionReq {
  serialized: string // serialized transaction
  raw: SwapReq | undefined // raw def. of each type of trade
  estimatedGas?: number
  estimatedEffectiveGasPrice?: number
}

export interface TransactionProcessed {
  serialized: string // serialized transaction
  bundle: string // bundle.id
  raw: SwapReq | undefined // raw def. of each type of trade
  estimatedGas: number
  estimatedEffectiveGasPrice: number
}

export interface BundleReq {
  transactions: TransactionReq[] | string[]
  chainId?: number
  bribe?: string // BigNumber
  from?: string
  deadline?: BigNumberish
  simulateOnly?: boolean
}

export interface SwapReq {
  amount0: BigNumberish
  amount1: BigNumberish
  path: Array<string>
  to: string
}

export interface BundleProcessed {
  id: string
  transactions: TransactionProcessed[]
  bribe: BigNumberish
  sessionToken: string
  chainId: number
  timestamp: number // EPOCH,
  totalEstimatedGas: number
  totalEstimatedEffectiveGasPrice: number
  from: string
  deadline: BigNumberish
  simulateOnly: boolean
}

export interface BundleRes {
  bundle: BundleProcessed
  status: string
  message: string
  error: string
}

export interface BundleStatusRes {
  bundle: string | BundleProcessed // BundleProcessed.serialized
  status: string
  message: string
  error: string
}

interface QuoteEventsMap {
  [Event.SOCKET_SESSION]: (response: SocketSession) => void
  [Event.SOCKET_ERR]: (err: any) => void
  [Event.FEES_CHANGE]: (response: Fees) => void
  [Event.BUNDLE_REQUEST]: (response: any) => void
  [Event.MISTX_BUNDLE_REQUEST]: (response: any) => void
  [Event.BUNDLE_RESPONSE]: (response: BundleRes) => void
  [Event.BUNDLE_CANCEL_REQUEST]: (serialized: any) => void // TO DO - any
  [Event.BUNDLE_STATUS_REQUEST]: (serialized: any) => void // TO DO - any
  [Event.BUNDLE_STATUS_RESPONSE]: (serialized: BundleStatusRes) => void // TO DO - any
}

interface SocketOptions {
  onConnect?: () => void
  onConnectError?: (err: any) => void
  onDisconnect?: (err: any) => void
  onError?: (err: any) => void
  onFeesChange?: (fees: Fees) => void
  onSocketSession: (session: any) => void
  onTransactionResponse?: (response: BundleRes) => void
  onTransactionUpdate?: (response: BundleStatusRes) => void
}

const defaultServerUrl = 'https://mistx-app-goerli.herokuapp.com'
const tokenKey = `SESSION_TOKEN`

export class MistxSocket {
  private socket: Socket<QuoteEventsMap, QuoteEventsMap>

  constructor(serverUrl: string = defaultServerUrl) {
    const token = localStorage.getItem(tokenKey)
    const socket: Socket<QuoteEventsMap, QuoteEventsMap> = io(serverUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 5000,
      autoConnect: true
    })
    this.socket = socket
  }

  private disconnect() {
    this.socket.off('connect')
    this.socket.off('connect_error')
    this.socket.off(Event.SOCKET_ERR)
    this.socket.off(Event.SOCKET_SESSION)
    this.socket.off(Event.FEES_CHANGE)
    this.socket.off(Event.BUNDLE_RESPONSE)
    this.socket.off(Event.BUNDLE_STATUS_RESPONSE)
  }

  public closeConnection() {
    this.socket.disconnect()
  }

  public init({
    onConnect,
    onConnectError,
    onDisconnect,
    onError,
    onFeesChange,
    onSocketSession,
    onTransactionResponse,
    onTransactionUpdate,
  }: SocketOptions): () => void {
    this.socket.on('connect', () => {
      // console.log('websocket connected')
      if (onConnect) onConnect()
    })
  
    this.socket.on('connect_error', (err: any) => {
      // console.log('websocket connect error', err)
      if (onConnectError) onConnectError(err)
    })
  
    this.socket.on('disconnect', (err: any) => {
      // console.log('websocket disconnect', err)
      if (onDisconnect) onDisconnect(err)
    })
  
    this.socket.on(Event.SOCKET_ERR, (err: any) => {
      // console.log('websocket err', err)
      if (onError) onError(err)
    })
  
    this.socket.on(Event.SOCKET_SESSION, (session: any) => {
      localStorage.setItem(tokenKey, session.token)
      if (onSocketSession) onSocketSession(session)
    })
  
    this.socket.on(Event.FEES_CHANGE, (response: Fees) => {
      if (onFeesChange) {
        const fees: Fees = {
          block: response.block,
          baseFeePerGas: BigNumber.from(response.baseFeePerGas),
          default: {
            maxFeePerGas: BigNumber.from(response.default.maxFeePerGas),
            maxPriorityFeePerGas: BigNumber.from(response.default.maxPriorityFeePerGas)
          },
          low: {
            maxFeePerGas: BigNumber.from(response.low.maxFeePerGas),
            maxPriorityFeePerGas: BigNumber.from(response.low.maxPriorityFeePerGas)
          },
          med: {
            maxFeePerGas: BigNumber.from(response.med.maxFeePerGas),
            maxPriorityFeePerGas: BigNumber.from(response.med.maxPriorityFeePerGas)
          },
          high: {
            maxFeePerGas: BigNumber.from(response.high.maxFeePerGas),
            maxPriorityFeePerGas: BigNumber.from(response.high.maxPriorityFeePerGas)
          },
        }
        onFeesChange(fees)
      }
    })
  
    this.socket.on(Event.BUNDLE_RESPONSE, (response: BundleRes) => {
      if (onTransactionResponse) onTransactionResponse(response)
    })
  
    this.socket.on(Event.BUNDLE_STATUS_RESPONSE, (response: BundleStatusRes) => {
      if (onTransactionUpdate) onTransactionUpdate(response)
    })
  
    return () => {
      this.disconnect()
    }
  }

  public emitBundleRequest(bundle: BundleReq) {
    this.socket.emit(Event.BUNDLE_REQUEST, bundle)
  }

  public emitTransactionRequest(bundle: BundleReq) {
    this.socket.emit(Event.MISTX_BUNDLE_REQUEST, bundle)
  }

  public emitStatusRequest(id: string) {
    this.socket.emit(Event.BUNDLE_STATUS_REQUEST, {
      id
    })
  }
  
  public emitTransactionCancellation(id: string) {
    this.socket.emit(Event.BUNDLE_CANCEL_REQUEST, {
      id
    })
  }
}
