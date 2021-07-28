import { BigNumberish } from '@ethersproject/bignumber';
export declare enum Event {
    GAS_CHANGE = "GAS_CHANGE",
    SOCKET_SESSION = "SOCKET_SESSION",
    SOCKET_ERR = "SOCKET_ERR",
    MISTX_BUNDLE_REQUEST = "MISTX_BUNDLE_REQUEST",
    BUNDLE_STATUS_REQUEST = "BUNDLE_STATUS_REQUEST",
    BUNDLE_STATUS_RESPONSE = "BUNDLE_STATUS_RESPONSE",
    BUNDLE_RESPONSE = "BUNDLE_RESPONSE",
    BUNDLE_CANCEL_REQUEST = "BUNDLE_CANCEL_REQUEST"
}
export interface Gas {
    readonly rapid: string;
    readonly fast: string;
    readonly slow: string;
    readonly standard: string;
    readonly timestamp: number;
}
export declare enum Status {
    PENDING_BUNDLE = "PENDING_BUNDLE",
    FAILED_BUNDLE = "FAILED_BUNDLE",
    SUCCESSFUL_BUNDLE = "SUCCESSFUL_BUNDLE",
    CANCEL_BUNDLE_SUCCESSFUL = "CANCEL_BUNDLE_SUCCESSFUL",
    BUNDLE_NOT_FOUND = "BUNDLE_NOT_FOUND"
}
export declare const STATUS_LOCALES: Record<string, string>;
export declare enum Diagnosis {
    LOWER_THAN_TAIL = "LOWER_THAN_TAIL",
    NOT_A_FLASHBLOCK = "NOT_A_FLASHBLOCK",
    BUNDLE_OUTBID = "BUNDLE_OUTBID",
    ERROR_API_BEHIND = "ERROR_API_BEHIND",
    MISSING_BLOCK_DATA = "MISSING_BLOCK_DATA",
    ERROR_UNKNOWN = "ERROR_UNKNOWN"
}
export interface MistXVersion {
    api: string;
    client: string;
}
export interface SocketSession {
    token: string;
    version: MistXVersion | undefined;
}
export interface TransactionRes {
    transaction: TransactionProcessed;
    status: Status;
    message: string;
    error: string;
}
export interface TransactionDiagnosisRes {
    transaction: TransactionProcessed;
    blockNumber: number;
    flashbotsResolution: string;
    mistxDiagnosis: Diagnosis;
}
export interface TransactionReq {
    serialized: string;
    raw: SwapReq | undefined;
    estimatedGas?: number;
    estimatedEffectiveGasPrice?: number;
}
export interface TransactionProcessed {
    serialized: string;
    bundle: string;
    raw: SwapReq | undefined;
    estimatedGas: number;
    estimatedEffectiveGasPrice: number;
}
export interface BundleReq {
    transactions: TransactionReq[];
    chainId: number;
    bribe: string;
    from: string;
    deadline: BigNumberish;
    simulateOnly: boolean;
}
export interface SwapReq {
    amount0: BigNumberish;
    amount1: BigNumberish;
    path: Array<string>;
    to: string;
}
export interface BundleProcessed {
    serialized: string;
    transactions: TransactionProcessed[];
    bribe: BigNumberish;
    sessionToken: string;
    chainId: number;
    timestamp: number;
    totalEstimatedGas: number;
    totalEstimatedEffectiveGasPrice: number;
    from: string;
    deadline: BigNumberish;
    simulateOnly: boolean;
}
interface BundleRes {
    bundle: BundleProcessed;
    status: string;
    message: string;
    error: string;
}
interface BundleStatusRes {
    bundle: string | BundleProcessed;
    status: string;
    message: string;
    error: string;
}
interface SocketOptions {
    onConnect?: () => void;
    onConnectError?: (err: any) => void;
    onDisconnect?: (err: any) => void;
    onError?: (err: any) => void;
    onGasChange?: (gas: any) => void;
    onSocketSession: (session: any) => void;
    onTransactionResponse?: (response: BundleRes) => void;
    onTransactionUpdate?: (response: BundleStatusRes) => void;
}
export declare class MistxSocket {
    private socket;
    constructor(serverUrl?: string);
    private disconnect;
    init({ onConnect, onConnectError, onDisconnect, onError, onGasChange, onSocketSession, onTransactionResponse, onTransactionUpdate, }: SocketOptions): () => void;
    emitTransactionRequest(transaction: TransactionReq): void;
    emitStatusRequest(transaction: TransactionReq): void;
    emitTransactionCancellation(serialized: BundleStatusRes): void;
}
export {};
