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
  onSessionResponse?: (session: any) => void
  onTransactionResponse?: (transaction: TransactionRes) => void
  onTransactionUpdate?: (transaction: TransactionDiagnosisRes) => void
}

const defaultServerUrl = 'https://mistx-app-goerli.herokuapp.com'

export default function init(serverUrl: string = defaultServerUrl) {
  const tokenKey = `SESSION_TOKEN`
  const token = localStorage.getItem(tokenKey)
  const socket: Socket<QuoteEventsMap, QuoteEventsMap> = io(serverUrl, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 5000,
    autoConnect: true
  })

  function disconnect() {
    socket.off('connect')
    socket.off('connect_error')
    socket.off(Event.SOCKET_ERR)
    socket.off(Event.SOCKET_SESSION_RESPONSE)
    socket.off(Event.GAS_CHANGE)
    socket.off(Event.TRANSACTION_RESPONSE)
    socket.off(Event.TRANSACTION_DIAGNOSIS)
  }

  function Sockets({
    onConnect,
    onConnectError,
    onDisconnect,
    onError,
    onGasChange,
    onSessionResponse,
    onTransactionResponse,
    onTransactionUpdate,
  }: SocketOptions) {
    socket.on('connect', () => {
      // console.log('websocket connected')
      if (onConnect) onConnect()
    })
  
    socket.on('connect_error', (err: any) => {
      // console.log('websocket connect error', err)
      if (onConnectError) onConnectError(err)
    })
  
    socket.on('disconnect', (err: any) => {
      // console.log('websocket disconnect', err)
      if (onDisconnect) onDisconnect(err)
    })
  
    socket.on(Event.SOCKET_ERR, (err: any) => {
      // console.log('websocket err', err)
      if (onError) onError(err)
    })
  
    socket.on(Event.SOCKET_SESSION_RESPONSE, (session: any) => {
      if (onSessionResponse) onSessionResponse(session)
    })
  
    socket.on(Event.GAS_CHANGE, (gas: any) => {
      if (onGasChange) onGasChange(gas)
    })
  
    socket.on(Event.TRANSACTION_RESPONSE, (transaction: TransactionRes) => {
      if (onTransactionResponse) onTransactionResponse(transaction)
    })
  
    socket.on(Event.TRANSACTION_DIAGNOSIS, (diagnosis: TransactionDiagnosisRes) => {
      if (onTransactionUpdate) onTransactionUpdate(diagnosis)
    })
  
    return () => {
      disconnect()
    }
  }
  
  Sockets.prototype.emitRequest = function emitTransactionRequest(transaction: TransactionReq) {
    socket.emit(Event.TRANSACTION_REQUEST, transaction)
  }
  
  Sockets.prototype.emitCancellation = function emitTransactionCancellation(transaction: TransactionProcessed) {
    socket.emit(Event.TRANSACTION_CANCEL_REQUEST, transaction)
  }

  return Sockets
}
