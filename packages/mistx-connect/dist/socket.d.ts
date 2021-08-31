import { BigNumberish, BigNumber } from '@ethersproject/bignumber';
export declare enum Event {
    FEES_CHANGE = "FEES_CHANGE",
    SOCKET_SESSION = "SOCKET_SESSION",
    SOCKET_ERR = "SOCKET_ERR",
    BUNDLE_REQUEST = "BUNDLE_REQUEST",
    MISTX_BUNDLE_REQUEST = "MISTX_BUNDLE_REQUEST",
    BUNDLE_STATUS_REQUEST = "BUNDLE_STATUS_REQUEST",
    BUNDLE_STATUS_RESPONSE = "BUNDLE_STATUS_RESPONSE",
    BUNDLE_RESPONSE = "BUNDLE_RESPONSE",
    BUNDLE_CANCEL_REQUEST = "BUNDLE_CANCEL_REQUEST"
}
export interface Fee {
    maxFeePerGas: BigNumber;
    maxPriorityFeePerGas: BigNumber;
}
export interface Fees {
    block: number;
    baseFeePerGas: BigNumber;
    default: Fee;
    low: Fee;
    med: Fee;
    high: Fee;
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
    transactions: TransactionReq[] | string[];
    chainId?: number;
    bribe?: string;
    from?: string;
    deadline?: BigNumberish;
    simulateOnly?: boolean;
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
export interface BundleRes {
    bundle: BundleProcessed;
    status: string;
    message: string;
    error: string;
}
export interface BundleStatusRes {
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
    onFeesChange?: (fees: Fees) => void;
    onSocketSession: (session: any) => void;
    onTransactionResponse?: (response: BundleRes) => void;
    onTransactionUpdate?: (response: BundleStatusRes) => void;
}
export declare class MistxSocket {
    private socket;
    constructor(serverUrl?: string);
    private disconnect;
    closeConnection(): void;
    init({ onConnect, onConnectError, onDisconnect, onError, onFeesChange, onSocketSession, onTransactionResponse, onTransactionUpdate, }: SocketOptions): () => void;
    emitBundleRequest(bundle: BundleReq): void;
    emitTransactionRequest(bundle: BundleReq): void;
    emitStatusRequest(id: string): void;
    emitTransactionCancellation(id: string): void;
}
export {};
