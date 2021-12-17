import { io, Socket } from 'socket.io-client'
import { BigNumberish } from '@ethersproject/bignumber'

export enum Event {
  FEES_CHANGE = 'FEES_CHANGE',
  SOCKET_SESSION = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  BUNDLE_REQUEST = 'BUNDLE_REQUEST',
  MISTX_BUNDLE_REQUEST = 'MISTX_BUNDLE_REQUEST',
  BUNDLE_STATUS_REQUEST = 'BUNDLE_STATUS_REQUEST',
  BUNDLE_RESPONSE = 'BUNDLE_RESPONSE',
  BUNDLE_CANCEL_REQUEST = 'BUNDLE_CANCEL_REQUEST'
}

export interface Fee {
  maxFeePerGas: BigNumberish
  maxPriorityFeePerGas: BigNumberish
}

export interface Fees {
  block: number
  baseFeePerGas: BigNumberish
  default: Fee
  low: Fee
  med: Fee
  high: Fee
  chainId: number
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

export interface UserSettings {
  deadline: BigNumberish;
  priority: string;
  slippage: number;
  multihop: boolean;
}

export interface BundleReq {
  transactions: TransactionReq[] | string[]
  chainId?: number
  bribe?: string // BigNumber
  from?: string
  simulateOnly?: boolean
  userSettings?: UserSettings
}

export interface SwapReq {
  amount0: BigNumberish
  amount1: BigNumberish
  path: Array<string>
  to: string
}

export interface Backrun {
  best: {
    backrunner: string
    duration: number
    count: number
    transactions: IBackrunTransactionProcessed[]
    totalMaxPriorityFeePerGas: BigNumberish
    totalMaxFeePerGas: BigNumberish
    totalGasPrice: BigNumberish
    totalGasLimit: BigNumberish
    totalValueETH?: number
    totalValueUSD?: number
  }
}

export interface IBackrunTransactionProcessed {
  serializedOrigin: string
  serializedBackrun: string
  maxPriorityFeePerGas: BigNumberish
  maxFeePerGas: BigNumberish
  gasPrice: BigNumberish
  gasLimit: BigNumberish
  blockNumber?: number
  timestamp?: number
  valueETH?: number
  valueUSD?: number
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
  backrun: Backrun
}

export interface BundleRes {
  bundle: BundleProcessed
  status: string
  message: string
  error: string
}

export interface BundleResApi {
  bundle: {
    id: string;
    transactions: string[];
  };
  status: string;
  message: string;
  error: string;
}

interface QuoteEventsMap {
  [Event.SOCKET_SESSION]: (response: SocketSession) => void
  [Event.SOCKET_ERR]: (err: any) => void
  [Event.FEES_CHANGE]: (response: Fees) => void
  [Event.BUNDLE_REQUEST]: (response: any) => void
  [Event.MISTX_BUNDLE_REQUEST]: (response: any) => void
  [Event.BUNDLE_RESPONSE]: (response: BundleRes | BundleResApi) => void
  [Event.BUNDLE_CANCEL_REQUEST]: (serialized: any) => void // TO DO - any
  [Event.BUNDLE_STATUS_REQUEST]: (serialized: any) => void // TO DO - any
}

interface SocketOptions {
  onConnect?: () => void
  onConnectError?: (err: any) => void
  onDisconnect?: (err: any) => void
  onError?: (err: any) => void
  onFeesChange?: (fees: Fees) => void
  onSocketSession?: (session: any) => void
  onTransactionResponse?: (response: BundleRes | BundleResApi) => void
}

const defaultServerUrl = 'https://api.mistx.io'
const tokenKey = `MISTX_API_SESSION_TOKEN`

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
  }: SocketOptions): () => void {
    /**
     * onConnect
     */
    this.socket.on('connect', () => {
      // console.log('websocket connected')
      if (onConnect) onConnect()
    })
  
    /**
     * onConnectError
     */
    this.socket.on('connect_error', (err: any) => {
      // console.log('websocket connect error', err)
      if (onConnectError) onConnectError(err)
    })
  
    /**
     * onDisconnect
     */
    this.socket.on('disconnect', (err: any) => {
      // console.log('websocket disconnect', err)
      if (onDisconnect) onDisconnect(err)
    })
    
    /**
     * onError
     */
    this.socket.on(Event.SOCKET_ERR, (err: any) => {
      // console.log('websocket err', err)
      if (onError) onError(err)
    })
  
    /**
     * onSocketSession
     * - Store the session token in the browser local storage
     */
    this.socket.on(Event.SOCKET_SESSION, (session: any) => {
      localStorage.setItem(tokenKey, session.token)
      if (onSocketSession) onSocketSession(session)
    })
  
    /**
     * onFeesChange
     */
    this.socket.on(Event.FEES_CHANGE, (response: Fees) => {
      if (onFeesChange) onFeesChange(response)
    })
  
    /**
     * onTransactionResponse
     */
    this.socket.on(Event.BUNDLE_RESPONSE, (response: BundleRes | BundleResApi) => {
      if (onTransactionResponse) onTransactionResponse(response)
    })

    /**
     * Returns function used to stop listening to all connected socket events.
     */
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
    this.socket.emit(Event.BUNDLE_STATUS_REQUEST, { id })
  }
  
  public emitTransactionCancellation(id: string) {
    this.socket.emit(Event.BUNDLE_CANCEL_REQUEST, { id })
  }
}
