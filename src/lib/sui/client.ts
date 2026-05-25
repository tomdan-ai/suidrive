import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";

const network = (process.env.SUI_NETWORK ?? "testnet") as "testnet" | "mainnet" | "devnet" | "localnet";
const url = process.env.TATUM_SUI_RPC_URL ?? getJsonRpcFullnodeUrl(network);

export const suiClient = new SuiJsonRpcClient({ url, network });
