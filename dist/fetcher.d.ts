import { ChainId } from './constants';
import { Token } from './entities/token';
/**
 * Contains methods for constructing instances of pairs and tokens from on-chain data.
 */
export declare abstract class Fetcher {
    /**
     * Cannot be constructed.
     */
    private constructor();
    /**
     * Fetch information for a given token on the given chain, using the given ethers provider.
     * @param chainId chain of the token
     * @param address address of the token on the chain
     * @param provider provider used to fetch the token
     * @param symbol optional symbol of the token
     * @param name optional name of the token
     */
    static fetchTokenData(chainId: ChainId, address: string, provider?: import("@ethersproject/providers").BaseProvider, symbol?: string, name?: string): Promise<Token>;
}
