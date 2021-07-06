import { BigNumberish } from '@ethersproject/bignumber';
import { ChainId } from './constants';
export declare enum Event {
    GAS_CHANGE = "GAS_CHANGE",
    SOCKET_SESSION_RESPONSE = "SOCKET_SESSION",
    SOCKET_ERR = "SOCKET_ERR",
    TRANSACTION_REQUEST = "TRANSACTION_REQUEST",
    TRANSACTION_CANCEL_REQUEST = "TRANSACTION_CANCEL_REQUEST",
    TRANSACTION_RESPONSE = "TRANSACTION_RESPONSE",
    TRANSACTION_DIAGNOSIS = "TRANSACTION_DIAGNOSIS",
    TRANSACTION_STATUS_REQUEST = "TRANSACTION_STATUS_REQUEST",
    TRANSACTION_CANCEL_RESPONSE = "TRANSACTION_CANCEL_RESPONSE"
}
export interface Gas {
    readonly rapid: string;
    readonly fast: string;
    readonly slow: string;
    readonly standard: string;
    readonly timestamp: number;
}
export declare enum Status {
    PENDING_TRANSACTION = "PENDING_TRANSACTION",
    FAILED_TRANSACTION = "FAILED_TRANSACTION",
    SUCCESSFUL_TRANSACTION = "SUCCESSFUL_TRANSACTION",
    CANCEL_TRANSACTION_SUCCESSFUL = "CANCEL_TRANSACTION_SUCCESSFUL"
}
export declare enum Diagnosis {
    LOWER_THAN_TAIL = "LOWER_THAN_TAIL",
    NOT_A_FLASHBLOCK = "NOT_A_FLASHBLOCK",
    BUNDLE_OUTBID = "BUNDLE_OUTBID",
    ERROR_API_BEHIND = "ERROR_API_BEHIND",
    MISSING_BLOCK_DATA = "MISSING_BLOCK_DATA",
    ERROR_UNKNOWN = "ERROR_UNKNOWN"
}
export interface SocketSession {
    token: string;
}
export interface SwapReq {
    amount0: BigNumberish;
    amount1: BigNumberish;
    path: Array<string>;
    to: string;
    deadline: string | string[];
}
export interface TransactionReq {
    chainId: ChainId;
    serializedSwap: string;
    serializedApprove: string | undefined;
    swap: SwapReq;
    bribe: BigNumberish;
    routerAddress: string;
    estimatedEffectiveGasPrice?: number;
    estimatedGas?: number;
    from: string;
    timestamp?: number;
}
export interface TransactionRes {
    transaction: TransactionProcessed;
    status: Status;
    message: string;
    error: string;
}
export interface TransactionProcessed {
    serializedSwap: string;
    serializedApprove: string | undefined;
    swap: SwapReq;
    bribe: BigNumberish;
    routerAddress: string;
    estimatedEffectiveGasPrice: number;
    estimatedGas: number;
    timestamp: number;
    sessionToken: string;
    chainId: number;
    simulateOnly: boolean;
    from: string;
}
export interface TransactionDiagnosisRes {
    transaction: TransactionProcessed;
    blockNumber: number;
    flashbotsResolution: string;
    mistxDiagnosis: Diagnosis;
}
interface SocketOptions {
    onConnect?: () => void;
    onConnectError?: (err: any) => void;
    onDisconnect?: (err: any) => void;
    onError?: (err: any) => void;
    onGasChange?: (gas: any) => void;
    onSessionResponse?: (session: any) => void;
    onTransactionResponse?: (transaction: TransactionRes) => void;
    onTransactionUpdate?: (transaction: TransactionDiagnosisRes) => void;
}
export default function init(serverUrl?: string): ({ onConnect, onConnectError, onDisconnect, onError, onGasChange, onSessionResponse, onTransactionResponse, onTransactionUpdate, }: SocketOptions) => () => void;
export {};
