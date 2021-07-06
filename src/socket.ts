import { io, Socket } from 'socket.io-client'
import { BigNumberish } from '@ethersproject/bignumber'
import { ChainId } from './constants'

export enum Event {
  GAS_CHANGE = 'GAS_CHANGE',
  SOCKET_SESSION_RESPONSE = 'SOCKET_SESSION',
  SOCKET_ERR = 'SOCKET_ERR',
  TRANSACTION_REQUEST = 'TRANSACTION_REQUEST',
  TRANSACTION_CANCEL_REQUEST = 'TRANSACTION_CANCEL_REQUEST',
  TRANSACTION_RESPONSE = 'TRANSACTION_RESPONSE',
  TRANSACTION_DIAGNOSIS = 'TRANSACTION_DIAGNOSIS',
  TRANSACTION_STATUS_REQUEST = 'TRANSACTION_STATUS_REQUEST',
  TRANSACTION_CANCEL_RESPONSE = 'TRANSACTION_CANCEL_RESPONSE'
}

export interface Gas {
  readonly rapid: string
  readonly fast: string
  readonly slow: string
  readonly standard: string
  readonly timestamp: number
}

export enum Status {
  PENDING_TRANSACTION = 'PENDING_TRANSACTION',
  FAILED_TRANSACTION = 'FAILED_TRANSACTION',
  SUCCESSFUL_TRANSACTION = 'SUCCESSFUL_TRANSACTION',
  CANCEL_TRANSACTION_SUCCESSFUL = 'CANCEL_TRANSACTION_SUCCESSFUL'
}

export enum Diagnosis {
  LOWER_THAN_TAIL = 'LOWER_THAN_TAIL',
  NOT_A_FLASHBLOCK = 'NOT_A_FLASHBLOCK',
  BUNDLE_OUTBID = 'BUNDLE_OUTBID',
  ERROR_API_BEHIND = 'ERROR_API_BEHIND',
  MISSING_BLOCK_DATA = 'MISSING_BLOCK_DATA',
  ERROR_UNKNOWN = 'ERROR_UNKNOWN'
}

export interface SocketSession {
  token: string
}
export interface SwapReq {
  amount0: BigNumberish
  amount1: BigNumberish
  path: Array<string>
  to: string
  deadline: string | string[]
}

export interface TransactionReq {
  chainId: ChainId
  serializedSwap: string
  serializedApprove: string | undefined
  swap: SwapReq
  bribe: BigNumberish
  routerAddress: string
  estimatedEffectiveGasPrice?: number
  estimatedGas?: number
  from: string
  timestamp?: number
}

export interface TransactionRes {
  transaction: TransactionProcessed
  status: Status
  message: string
  error: string
}

export interface TransactionProcessed {
  serializedSwap: string
  serializedApprove: string | undefined
  swap: SwapReq
  bribe: BigNumberish
  routerAddress: string
  estimatedEffectiveGasPrice: number
  estimatedGas: number
  timestamp: number // EPOCH
  sessionToken: string
  chainId: number
  simulateOnly: boolean
  from: string
}

export interface TransactionDiagnosisRes {
  transaction: TransactionProcessed
  blockNumber: number
  flashbotsResolution: string
  mistxDiagnosis: Diagnosis
}

interface QuoteEventsMap {
  [Event.SOCKET_SESSION_RESPONSE]: (response: SocketSession) => void
  [Event.SOCKET_ERR]: (err: any) => void
  [Event.GAS_CHANGE]: (response: Gas) => void
  [Event.TRANSACTION_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_CANCEL_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_RESPONSE]: (response: TransactionRes) => void
  [Event.TRANSACTION_DIAGNOSIS]: (response: TransactionDiagnosisRes) => void
  [Event.TRANSACTION_STATUS_REQUEST]: (response: TransactionReq) => void
  [Event.TRANSACTION_CANCEL_RESPONSE]: (response: any) => void
}

interface SocketOptions {
  onConnect?: () => void
  onConnectError?: (err: any) => void
  onDisconnect?: (err: any) => void
  onError?: (err: any) => void
  onGasChange?: (gas: any) => void
  onTransactionResponse?: (transaction: TransactionRes) => void
  onTransactionUpdate?: (transaction: TransactionDiagnosisRes) => void
}

const defaultServerUrl = 'https://mistx-app-goerli.herokuapp.com'
const tokenKey = `SESSION_TOKEN`
const token = localStorage.getItem(tokenKey)

export class MistxSocket {
  private socket: Socket<QuoteEventsMap, QuoteEventsMap>

  constructor(serverUrl: string = defaultServerUrl) {
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
    this.socket.off(Event.SOCKET_SESSION_RESPONSE)
    this.socket.off(Event.GAS_CHANGE)
    this.socket.off(Event.TRANSACTION_RESPONSE)
    this.socket.off(Event.TRANSACTION_DIAGNOSIS)
  }

  public init({
    onConnect,
    onConnectError,
    onDisconnect,
    onError,
    onGasChange,
    onTransactionResponse,
    onTransactionUpdate,
  }: SocketOptions) {
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
  
    this.socket.on(Event.SOCKET_SESSION_RESPONSE, (session: any) => {
      localStorage.setItem(tokenKey, session.token)
    })
  
    this.socket.on(Event.GAS_CHANGE, (gas: any) => {
      if (onGasChange) onGasChange(gas)
    })
  
    this.socket.on(Event.TRANSACTION_RESPONSE, (transaction: TransactionRes) => {
      if (onTransactionResponse) onTransactionResponse(transaction)
    })
  
    this.socket.on(Event.TRANSACTION_DIAGNOSIS, (diagnosis: TransactionDiagnosisRes) => {
      if (onTransactionUpdate) onTransactionUpdate(diagnosis)
    })
  
    return () => {
      this.disconnect()
    }
  }

  public emitTransactionRequest(transaction: TransactionReq) {
    this.socket.emit(Event.TRANSACTION_REQUEST, transaction)
  }

  public emitStatusRequest(transaction: TransactionReq) {
    this.socket.emit(Event.TRANSACTION_STATUS_REQUEST, transaction)
  }
  
  public emitTransactionCancellation(transaction: TransactionProcessed) {
    this.socket.emit(Event.TRANSACTION_CANCEL_REQUEST, transaction)
  }
}
