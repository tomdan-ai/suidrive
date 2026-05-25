import { WalrusClient } from "@mysten/walrus";
import { suiClient } from "@/lib/sui/client";

export const walrusClient = new WalrusClient({
  network: "testnet",
  suiClient,
});
