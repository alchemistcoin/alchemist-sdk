import { io, Socket } from 'socket.io-client'
import { BigNumberish } from '@ethersproject/bignumber'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  MISTX_BUNDLE_REQUEST = 'MISTX_BUNDLE_REQUEST',
  BUNDLE_STATUS_REQUEST = 'BUNDLE_STATUS_REQUEST',
  BUNDLE_STATUS_RESPONSE = 'BUNDLE_STATUS_RESPONSE',
  BUNDLE_RESPONSE = 'BUNDLE_RESPONSE',
  BUNDLE_CANCEL_REQUEST = 'BUNDLE_CANCEL_REQUEST'
}

export interface Gas {
  readonly rapid: string
  readonly fast: string
  readonly slow: string
  readonly standard: string
  readonly timestamp: number
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
  bundle: string // bundle.serialized
  raw: SwapReq | undefined // raw def. of each type of trade
  estimatedGas: number
  estimatedEffectiveGasPrice: number
}

export interface BundleReq {
  transactions: TransactionReq[]
  chainId: number
  bribe: string // BigNumber
  from: string
  deadline: BigNumberish
  simulateOnly: boolean
}

export interface SwapReq {
  amount0: BigNumberish
  amount1: BigNumberish
  path: Array<string>
  to: string
}

export interface BundleProcessed {
  serialized: string
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
  [Event.GAS_CHANGE]: (response: Gas) => void
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
  onGasChange?: (gas: any) => void
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
    this.socket.off(Event.GAS_CHANGE)
    this.socket.off(Event.BUNDLE_RESPONSE)
    this.socket.off(Event.BUNDLE_STATUS_RESPONSE)
  }

  public init({
    onConnect,
    onConnectError,
    onDisconnect,
    onError,
    onGasChange,
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
  
    this.socket.on(Event.GAS_CHANGE, (gas: any) => {
      if (onGasChange) onGasChange(gas)
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

  public emitTransactionRequest(bundle: BundleReq) {
    this.socket.emit(Event.MISTX_BUNDLE_REQUEST, bundle)
  }

  public emitStatusRequest(id: string) {
    this.socket.emit(Event.BUNDLE_STATUS_REQUEST, {
      serialized: id
    })
  }
  
  public emitTransactionCancellation(id: string) {
    this.socket.emit(Event.BUNDLE_CANCEL_REQUEST, {
      serialized: id
    })
  }
}
