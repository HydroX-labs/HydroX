"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { connectLace, getLucid } from "@/lucid-lace";
import {
  Data,
  fromText,
  Constr,
  getAddressDetails,
  validatorToScriptHash,
  type SpendingValidator,
  type UTxO,
  type Data as DataType
} from "@lucid-evolution/lucid";
import { configApi, tradingApi, oracleApi } from "@/lib/api";

// Vault compiled code from plutus.json (PlutusV3) - Updated 2024-12-30 with final PnL fix (size*price_diff/(entry_price*100))
const VAULT_COMPILED_CODE = "590c2401010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e3300130093754007370e90024dc3a40013008375400891111991192cc004c01401226464b30013016002801c590131bad301400130103754017159800980480244c8c966002602c0050038b2026375a602800260206ea802e2b30013006004899192cc004c05800a00716404c6eb4c050004c040dd5005c56600266e1d2006004899194c004c966002602600315980099b8948010c0480062d1300c301200140451640506ea8c054006602c003375a602a0049112cc004c06400a264b3001300b3015375400313232323298009bae301d0019bae301d0049bad301d0039bad301d0024888966002604400b00f8b203e180e800980e000980d800980b1baa0018b202830180028b202c180a80098081baa00b8b201c4038807100e0acc004c010c038dd5000c660026024601e6ea80066e952000912cc004c018c040dd500144c8c8c8c8ca60026eb8c0640066eb8c0640166eb4c0640126eb4c06400e6eb8c0640092222259800980f803402e2c80e060320026030002602e002602c00260226ea800a2c807a460266028602860286028003230133014301400191809980a180a180a000c8c04cc050006601c6ea80292222222232332259800980780244c96600266e24dd69804180d9baa00c0018992cc004c044c06cdd5000c4c8c8c9660026028603c6ea8006264b30013371266e00c01cdd5980598101baa300b3020375400800c600e6eacc02cc080dd5000c4c966002602e60406ea8006264660220022b3001337106eb4c034c088dd50099bad300d3022375400315980099b8f375c601c60446ea8004dd7180718111baa0138acc004cdc79bae3010302237540026eb8c040c088dd5009c528c59020459020459020181218109baa0018b203e300d302037540031640786044603e6ea80062c80e8cc01cdd61805980f1baa01623375e6044603e6ea8004008c080c074dd51804180e9baa001301f301c3754003164068660066eb0c078c06cdd50098074590191bad301d301a375402b159800980980244c96600266e2120000018acc004cdc48009bad3006301b3754019132598009808980d9baa00189919912cc004cdc38029bad300a301f3754021159800980a191980080099198008009bac300e3021375403244b30010018a5eb8226644b30013375e604e60486ea800801e26604c004660080080031330040040014088604a002604c00281188966002003148002266e012002330020023025001408914a316407513259800980a980f9baa001899192cc004c060c084dd5000c4c8cc04800456600266e1cdd6980718119baa001337026eb4c038c08cdd500a004c56600266e24cdc080298051bab300e3023375400666e0ccdc10048029bad300e3023375402915980099b8f375c601e60466ea8004dd7180798119baa0148acc004cdc79bae3011302337540026eb8c044c08cdd500a4528c59021459021459021459021181298111baa0018b2040300e30213754002604660406ea80062c80f0cc020dd61806180f9baa01723375e604660406ea800400d01d1810180e9baa3008301d375400260086eacc020c074dd51804180e9baa001301f301c3754003164068660066eb0c078c06cdd50098074590194590191bad301d301a375402b159800980800244c9660026466446600400400244b30010018a508acc004cdc79bae30210010038a518998010011811000a038407c6eb0c07cc080c080c080c080c080c080c080c080c070dd500a1bae301e301b3754019132598009808980d9baa00189919192cc004c050c078dd5000c4c8c966002602e60406ea8006264660220022b30013371e6eb8c094c088dd50009bae30253022375402715980099b87375a601a60446ea8004dd6980698111baa0138acc004cdc39bad300f3022375400201115980099b8f375c601c60446ea8004dd7180718111baa0138acc004cdc79bae3010302237540026eb8c040c088dd5009c56600266e1cc024dd5980698111baa00330093756601a60446ea8c034c088dd50034528c59020459020459020459020459020459020181218109baa0018b203e300d302037540026044603e6ea80062c80e8cc01cdd61805980f1baa01623375e6044603e6ea8004008c080c074dd51804180e9baa001301f301c3754003164068660066eb0c078c06cdd50098074590191bad301d301a375402b132329800980a980d9baa301f001980f9810000cdd6980f8012444b3001325980099b89480000062b3001337120029044074660026eb8c030c080dd5008ccdc51bae30233020375400666e2a600294690084dd6980598101baa0035e4a600294690084dd6980698101baa0035e4a6eb8c030c080dd5001ae5516407916407866e04cdc1992cc004c064c07cdd5000c4dd6981198101baa0018a400080f0c088c07cdd51811180f9baa30223023302330233023302330233023301f375402e9068079bad300c301f375400513259800980a980f9baa001899192cc004c060c084dd5000c4c966002603060446ea8006264646464646464653001375c605c003375c605c011375a605c00f375a605c00d375a605c00b32598009816000c56600266e252004302b0018b44c094c0ac00502a45902d1baa302e0049bad302e0039bad302e00248888888966002606e013132325980099b87017375a6070005159800acc004066200319800800d28528a06640cd132598009815981a9baa00189919192cc004c0b8c0e0dd5000c4c8c966002606260746ea8006264660560022b30013371e6eb8c0fcc0f0dd50009bae303f303c375405b15980099b87375a604e60786ea8004dd69813981e1baa02d8acc004cdc39bad3029303c37540026eb4c0a4c0f0dd5016c56600266e3cdd71814181e1baa001375c605060786ea80b62b30013371e6eb8c0a8c0f0dd50009bae302a303c375405b1980098119bab3027303c3754604e60786ea801a60466eacc09cc0f0dd5001cc08cdd59813981e1baa3027303c37540389112cc00408e2b30013370e00466e0400c08629462c81ea2b30013371266e0000d6600266e200040862003102140f400514a31640f481e91640e91640e91640e91640e91640e8607c60766ea80062c81c8c09cc0e8dd5000981e181c9baa0018b206e330213758604a60706ea80c08cdd7981e181c9baa001002303a303737546044606e6ea8004c0e4c0d8dd5000c590341980e9bac30383035375405a0511640cd1640cc605a60666ea8c0dcc0e0004c8c96600266e25200000189981b9ba8001330379800a51a60103d87a8000a60103d879800040cc97ae089981b9ba83370290000009981bcc005285300103d87a8000a60103d879800040cc97ae040cc66e0ccdc11bad302030343754024b3001302d30333754604460686ea804a266e04004dd69810981a1baa012899b81375a604260686ea804800503219b82375a604260686ea804920c801375a603c60666ea805a2c81a0605c002605a0026058002605600260540026052002605000260466ea80062c8108c094c088dd5000c59020180718109baa300c30213754002604660406ea80062c80f0cc88cc0280088c966002603860446ea8006266e3cdd7181318119baa0010038a504084604a60446ea8c094c088dd5180698111baa00137586044603e6ea805cdd71806980f9baa0108b203a180f800980d1baa015406080c10181119801801119baf301e301b3754002004464b300130133019375400314800226eb4c074c068dd5000a03032598009809980c9baa0018a6103d87a8000899198008009bab301e301b375400444b30010018a6103d87a8000899192cc004cdc8a45045553444d000018acc004cdc7a441045553444d000018980719810180f00125eb82298103d87a80004071133004004302200340706eb8c070004c07c00501d203032330010010022259800800c5300103d87a8000899192cc004cdc8a451c2a76795ed9cb3fbea561af69342b5fcaa988871ca2c425ecd5593fd1000018acc004cdc7a4411c2a76795ed9cb3fbea561af69342b5fcaa988871ca2c425ecd5593fd100001898069980f980e80125eb82298103d87a8000406d1330040043021003406c6eb8c06c004c07800501c111919800800801912cc0040062980103d87a80008992cc004c010006260186603c00297ae089980180198100012034301e00140708b201a3010004301030110044590070c020004c00cdd5004452689b2b200201";

// Helper function to get vault compiled code
async function getVaultCompiledCode(): Promise<string> {
  return VAULT_COMPILED_CODE;
}

// Position datum schema for Lucid-Evolution
const PositionDatumSchema = Data.Object({
  owner: Data.Bytes(),
  symbol: Data.Bytes(),
  side: Data.Integer(),
  entry_price: Data.Integer(),
  amount: Data.Integer(),
  collateral: Data.Integer(),
  leverage: Data.Integer(),
  open_time: Data.Integer(),
});
type PositionDatum = Data.Static<typeof PositionDatumSchema>;

export interface OpenPositionParams {
  symbol: string;
  side: "Long" | "Short";
  entryPrice: number;
  amount: number;       // BTC amount
  collateral: number;   // USDM amount
  leverage: number;
}

export interface ClosePositionParams {
  positionId: string;
  symbol: string;       // e.g., "BTC" for oracle price lookup
  side?: 'Long' | 'Short';  // Position side (for logging)
  // UTxO reference for exact matching
  txHash: string;       // Transaction hash where position was created
  outputIndex: number;  // Output index in that transaction
}

export interface ClosePositionResult {
  txHash: string;
  closePrice: number;
  realizedPnl: number;
  pnlPercent: number;
}

export interface VaultDepositResult {
  txHash: string;
  amount: number;
  shares: number;
}

export interface VaultWithdrawResult {
  txHash: string;
  amount: number;
  sharesBurned: number;
}

interface WalletContextType {
  walletAddress: string | null;
  network: string | null;
  isConnecting: boolean;
  isLaceAvailable: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  openPosition: (params: OpenPositionParams) => Promise<string>;
  closePosition: (params: ClosePositionParams) => Promise<ClosePositionResult>;
  depositToVault: (amount: number) => Promise<VaultDepositResult>;
  withdrawFromVault: (shares: number) => Promise<VaultWithdrawResult>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLaceAvailable, setIsLaceAvailable] = useState(false);

  // Check if Lace wallet is installed and auto-reconnect if previously connected
  useEffect(() => {
    const checkWalletAvailability = async () => {
      if (typeof window !== "undefined" && window.cardano?.lace) {
        setIsLaceAvailable(true);

        // Check if we should auto-reconnect
        const wasConnected = localStorage.getItem("hydrox_wallet_connected");
        if (wasConnected === "true" && !walletAddress && !isConnecting) {
          console.log("Auto-reconnecting wallet...");
          try {
            const result = await connectLace();
            setWalletAddress(result.address);
            setNetwork(result.network);
            console.log("Auto-reconnected:", result.address);
          } catch (err) {
            console.error("Auto-reconnect failed:", err);
            // Clear the flag if auto-reconnect fails
            localStorage.removeItem("hydrox_wallet_connected");
          }
        }
        return true;
      }
      return false;
    };

    // Check immediately
    checkWalletAvailability();

    // Lace may take time to inject, check multiple times with increasing delays
    const delays = [100, 300, 500, 1000, 2000, 3000];
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    delays.forEach((delay) => {
      timeoutIds.push(setTimeout(() => {
        checkWalletAvailability();
      }, delay));
    });

    // Also set up an interval as fallback (but stop after wallet is found)
    const intervalId = setInterval(() => {
      if (isLaceAvailable) {
        clearInterval(intervalId);
        return;
      }
      checkWalletAvailability();
    }, 2000);

    return () => {
      timeoutIds.forEach(clearTimeout);
      clearInterval(intervalId);
    };
  }, [walletAddress, isConnecting, isLaceAvailable]);

  const connectWallet = useCallback(async () => {
    if (!isLaceAvailable) {
      throw new Error("Lace wallet is not installed. Please install Lace wallet extension.");
    }

    setIsConnecting(true);

    try {
      // Use Lucid to connect and get bech32 address
      const result = await connectLace();
      setWalletAddress(result.address);
      setNetwork(result.network);
      // Save connection state to localStorage for auto-reconnect on page refresh
      localStorage.setItem("hydrox_wallet_connected", "true");
    } catch (error: unknown) {
      console.error("Error connecting wallet:", error);
      const err = error as { code?: number; message?: string };
      if (err.code === 4001 || err.message?.includes("reject")) {
        throw new Error("Wallet connection was rejected.");
      } else if (err.message?.includes("timeout")) {
        throw new Error("Connection timeout. Please try again.");
      } else if (err.message?.includes("Blockfrost")) {
        throw new Error("Blockfrost configuration error. Please check settings.");
      } else {
        throw new Error(err.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isLaceAvailable]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setNetwork(null);
    // Clear auto-reconnect flag
    localStorage.removeItem("hydrox_wallet_connected");
  }, []);

  // Open position using Lucid to build TX
  const openPosition = useCallback(async (params: OpenPositionParams): Promise<string> => {
    const lucid = getLucid();
    if (!lucid || !walletAddress) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }

    try {
      // Get contract config from backend
      const config = await configApi.getContractConfig();
      console.log("Contract config:", config);

      // Get payment key hash from wallet address
      const addressDetails = getAddressDetails(walletAddress);
      const ownerPkh = addressDetails.paymentCredential?.hash;
      if (!ownerPkh) {
        throw new Error("Could not extract payment key hash from address");
      }

      // Get vault script hash for datum
      // Extract hash from vault script address (addr_test1wq... -> script hash)
      const vaultAddrDetails = getAddressDetails(config.vault_script_addr);
      const vaultScriptHash = vaultAddrDetails.paymentCredential?.hash || "";

      // Create position datum matching on-chain PositionDatum:
      // [trader, collateral, entry_price, size, is_long(Bool), leverage, timestamp, vault_script_hash]
      // is_long: Bool = Constr(1,[]) for True (Long), Constr(0,[]) for False (Short)
      const isLongBool = params.side === "Long" ? new Constr(1, []) : new Constr(0, []);

      const datumConstr = new Constr(0, [
        ownerPkh,                                                    // trader: VerificationKeyHash
        BigInt(Math.round(params.collateral)),                       // collateral: Int (USDM, no decimals)
        BigInt(Math.round(params.entryPrice * 1_000_000)),           // entry_price: Int (scaled 1e6)
        BigInt(Math.round(params.amount * 100_000_000)),             // size: Int (scaled 1e8 for BTC)
        isLongBool,                                                   // is_long: Bool
        BigInt(params.leverage),                                      // leverage: Int
        BigInt(Math.floor(Date.now() / 1000)),                       // timestamp: Int (POSIX seconds)
        vaultScriptHash,                                              // vault_script_hash: ByteArray
      ]);

      console.log("Position datum fields:", {
        trader: ownerPkh,
        collateral: params.collateral,
        entry_price: params.entryPrice * 1_000_000,
        size: params.amount * 100_000_000,
        is_long: params.side === "Long",
        leverage: params.leverage,
        timestamp: Math.floor(Date.now() / 1000),
        vault_script_hash: vaultScriptHash,
      });

      console.log("Building TX with datum");

      // USDM asset unit = policy_id + asset_name
      const usdmUnit = config.usdm_policy_id + config.usdm_asset_name;

      // Collateral amount in USDM (no decimals - USDM is stored as whole units)
      const collateralAmount = BigInt(Math.round(params.collateral));

      console.log("USDM unit:", usdmUnit);
      console.log("Collateral amount:", collateralAmount.toString());

      // Build the transaction with USDM collateral
      // lucid-evolution uses pay.ToContract
      const tx = await lucid
        .newTx()
        .pay.ToContract(
          config.position_script_addr,
          { kind: "inline", value: Data.to(datumConstr) },
          {
            lovelace: BigInt(1_500_000), // ~1.5 ADA - minimum for UTxO with datum + token
            [usdmUnit]: collateralAmount  // USDM collateral
          }
        )
        .complete();

      console.log("TX built, signing...");

      // Sign and submit with lucid-evolution
      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      console.log("Transaction submitted:", txHash);

      // The position UTxO is the first output (index 0) of this transaction
      const outputIndex = 0;
      console.log("Position UTxO reference:", txHash, "#", outputIndex);

      // Save position to DB after successful on-chain submission
      // Include tx_hash and output_index for later UTxO matching
      try {
        await tradingApi.createPosition({
          address: walletAddress,
          symbol: params.symbol,
          side: params.side,
          entry_price: params.entryPrice,
          amount: params.amount,
          collateral: params.collateral,
          leverage: params.leverage,
          tx_hash: txHash,
          output_index: outputIndex,
        });
        console.log("Position saved to DB with UTxO reference");
      } catch (dbError) {
        console.error("Failed to save position to DB:", dbError);
        // Don't throw - TX already succeeded on-chain
      }

      return txHash;
    } catch (error) {
      console.error("Error opening position:", error);
      throw error;
    }
  }, [walletAddress]);

  // Close position with oracle-signed price - full on-chain transaction
  const closePosition = useCallback(async (params: ClosePositionParams): Promise<ClosePositionResult> => {
    const lucid = getLucid();
    if (!lucid || !walletAddress) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }

    try {
      // 1. Get contract config
      const config = await configApi.getContractConfig();
      console.log("Contract config:", config);

      // 2. Get signed oracle price for the symbol (with logging context)
      console.log(`Fetching signed oracle price for ${params.symbol}...`);
      const oracleFeed = await oracleApi.getSignedPrice(params.symbol, {
        address: walletAddress,
        action: 'close',
        side: params.side,
        positionId: params.positionId,
      });
      console.log("Oracle price feed:", oracleFeed);

      // 3. Find the position UTxO at the script address
      const positionUtxos = await lucid.utxosAt(config.position_script_addr);
      console.log(`Found ${positionUtxos.length} UTxOs at position script`);

      // Get trader's payment key hash
      const addressDetails = getAddressDetails(walletAddress);
      const traderPkh = addressDetails.paymentCredential?.hash;
      if (!traderPkh) {
        throw new Error("Could not extract payment key hash from address");
      }

      // Find the specific position UTxO by txHash#outputIndex
      // NEW datum format: [trader, collateral, entry_price, size, is_long(Bool), leverage, timestamp, vault_script_hash]
      let positionUtxo: UTxO | null = null;
      let positionDatumData: unknown[] | null = null;

      console.log("Looking for UTxO:", params.txHash, "#", params.outputIndex);
      console.log("Looking for trader PKH:", traderPkh);

      for (const utxo of positionUtxos) {
        // Match by txHash and outputIndex
        if (utxo.txHash !== params.txHash || utxo.outputIndex !== params.outputIndex) {
          continue;
        }

        console.log("Found target UTxO:", utxo.txHash, utxo.outputIndex);

        if (!utxo.datum) {
          throw new Error("Position UTxO found but has no datum");
        }

        try {
          const datum = Data.from(utxo.datum);
          const datumFields = (datum as { fields: unknown[] }).fields;

          // Verify this position belongs to the trader
          if (datumFields[0] !== traderPkh) {
            throw new Error("Position does not belong to this wallet");
          }

          // Verify vault_script_hash matches
          const positionVaultHash = datumFields?.[7] as string;
          if (positionVaultHash !== config.vault_script_hash) {
            throw new Error("Position belongs to a different vault");
          }

          positionUtxo = utxo;
          positionDatumData = datumFields;
          console.log("Parsed datum:", JSON.stringify(datum, (_, v) => typeof v === 'bigint' ? v.toString() : v));
          break;
        } catch (parseErr) {
          console.log("Failed to parse datum:", parseErr);
          throw parseErr;
        }
      }

      if (!positionUtxo || !positionDatumData) {
        throw new Error("Position UTxO not found on-chain. It may have already been closed.");
      }

      // 4. Extract position data from datum for PnL calculation
      // On-chain PositionDatum fields: [trader, collateral, entry_price, size, is_long(Bool), leverage, timestamp, vault_script_hash]
      // Note: is_long is a Bool (Constr(0,[]) = False, Constr(1,[]) = True)
      console.log("Position datum fields:", positionDatumData);
      console.log("Field types:", positionDatumData.map((f, i) => `[${i}]: ${typeof f} = ${f}`));

      // Use BigInt for precise on-chain matching arithmetic
      const collateralBig = BigInt(positionDatumData[1] as bigint);
      const entryPriceBig = BigInt(positionDatumData[2] as bigint);  // scaled by 1e6
      const sizeBig = BigInt(positionDatumData[3] as bigint);        // position size
      // is_long is a Constr: Constr(1,[]) = True (Long), Constr(0,[]) = False (Short)
      const isLongConstr = positionDatumData[4] as { index: number };
      const isLong = isLongConstr.index === 1;
      const leverageBig = BigInt(positionDatumData[5] as bigint);

      console.log("Parsed values (BigInt):", {
        collateral: collateralBig.toString(),
        entryPrice: entryPriceBig.toString(),
        size: sizeBig.toString(),
        isLong,
        leverage: leverageBig.toString()
      });

      // Calculate PnL exactly as on-chain does (using BigInt for exact match):
      // let price_diff = if is_long { current_price - entry_price } else { entry_price - current_price }
      // let pnl_scaled = size * price_diff
      // let pnl = pnl_scaled / (entry_price * 100)
      // NOTE: leverage is NOT multiplied here because size already includes leverage effect
      // The 100 factor converts from (1e8 size scale / 1e6 price scale) to USDM units
      const currentPriceBig = BigInt(oracleFeed.price);  // scaled by 1e6
      const priceDiffBig = isLong
        ? currentPriceBig - entryPriceBig
        : entryPriceBig - currentPriceBig;

      // On-chain: pnl = (size * price_diff) / (entry_price * 100)
      // size already has leverage baked in, so we do NOT multiply by leverage here
      const pnlScaledBig = sizeBig * priceDiffBig;
      const pnlBig = pnlScaledBig / (entryPriceBig * BigInt(100));  // BigInt division (truncates toward zero)

      // Determine if profit or loss
      const isProfit = pnlBig >= BigInt(0);
      const pnlAmountAbs = pnlBig >= BigInt(0) ? pnlBig : -pnlBig;

      console.log("PnL calculation (BigInt):", {
        currentPrice: currentPriceBig.toString(),
        priceDiff: priceDiffBig.toString(),
        pnlScaled: pnlScaledBig.toString(),
        pnl: pnlBig.toString(),
        isProfit,
        pnlAmountAbs: pnlAmountAbs.toString()
      });

      // Convert to Number for display purposes only
      const collateral = Number(collateralBig);
      const leverage = Number(leverageBig);
      const closePrice = Number(currentPriceBig) / 1_000_000;
      const entryPrice = Number(entryPriceBig) / 1_000_000;
      const realizedPnl = Number(pnlBig);
      const pnlPercent = collateral > 0 ? (realizedPnl / collateral) * 100 : 0;

      console.log(`Position details: entry=${entryPrice}, close=${closePrice}, collateral=${collateral}, leverage=${leverage}x`);
      console.log(`PnL calculation: ${isLong ? "Long" : "Short"}, realized=${realizedPnl.toFixed(2)} USDM (${pnlPercent.toFixed(2)}%)`);

      // 5. Build ClosePosition redeemer with oracle price feed
      // OraclePriceFeed: Constr(0, [symbol: ByteArray, price: Int, timestamp: Int, signature: ByteArray])
      // ClosePosition: Constr(1, [OraclePriceFeed])
      // Note: In Lucid-evolution, ByteArray fields should be hex strings (not wrapped in fromText for hex data)
      const symbolHex = fromText(oracleFeed.symbol);  // "BTC" -> "425443"

      console.log("Building redeemer with:");
      console.log("  symbol (hex):", symbolHex);
      console.log("  price:", oracleFeed.price);
      console.log("  timestamp:", oracleFeed.timestamp);
      console.log("  signature:", oracleFeed.signature.substring(0, 32) + "...");

      const oracleFeedConstr = new Constr(0, [
        symbolHex,                              // symbol as ByteArray (hex string)
        BigInt(oracleFeed.price),              // price as Int
        BigInt(oracleFeed.timestamp),          // timestamp as Int
        oracleFeed.signature,                   // signature as ByteArray (hex string)
      ]);

      const closeRedeemer = Data.to(new Constr(1, [oracleFeedConstr]));
      console.log("Close redeemer CBOR:", closeRedeemer);

      // 6. Load the position validator script (PlutusV3) - Updated 2024-12-30 with final PnL fix (size*price_diff/(entry_price*100))
      const positionCompiledCode = "590af701010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e3300130093754007370e90024dc3a4001300837540089111199119912cc004c0180162b3001301137540190028b20248acc004c028016264b30013016001899801180a800801c5901318089baa00c8acc004c01c016264b30013016001899801180a800801c5901318089baa00c8acc004cdc3a400c00b1323259800980b80140122c80a0dd6980a80098089baa00c8b201e403c807900f0acc004c010c038dd5000c660026024601e6ea8006460266028602860286028602860286028003374a900048c04cc050c050c050c050c050c050c050c05000644646600200200644b30010018a508acc004cdc79bae30160010038a51899801001180b800a022405123013301430143014301400191809980a180a000c8c04cc050c050c050006460266028003230133014301430143014301400198071baa00a9b8848001222222222222323322598009809802c566002660166eb0c030c078dd500b1bae3021301e375401f15980099b894832004dd69803980f1baa00f8acc004cdc4a40046eb4c018c078dd5007c56600266e24dd69803180f1baa00f48320062b30013004375a6010603c6ea803e264b30013014301e375400315980099b89375a6010603e6ea8040c008dd59804180f9baa3008301f37546044603e6ea800629462c80ea2c80e8cc008dd61810980f1baa0160118b20388b20388b20388b20388b20388cc004888c96600266e2520000018acc004cdc4800a41101d19800801ccdc51bae30253022375400866e2a600294690084dd6980598111baa0045e4a600294690084dd6980698111baa0045e4a6eb8c030c088dd50022e5516408116408066e04cdc1800a41a01e6eb4c030c084dd5001c8c9660026032603e6ea800626eb4c08cc080dd5000c5200040786044603e6ea8c088c07cdd51807980f9baa001912cc004c054c07cdd500144c8c8c8c8ca60026eb8c0a00066eb8c0a00166eb4c0a00126eb4c0a000e6eb8c0a000922222598009817003402e2c81586050002604e002604c002604a00260406ea800a2c80f2446600a004464b3001301b3021375400313371e6eb8c094c088dd5000801c5282040302430213754604860426ea8c028c084dd5000a4444b3001301b0098992cc004cc040dd6180898119baa01b375c604c60466ea8052264b300130193023375400313259800980d98121baa001899198030008acc0066002009375c6020604c6ea8006600e03c80422646644b3001301e302837540031325980099b8959800981198149baa302d302e004899b80001003899b810015980099b880010038800c400d028205032330010013758602c60566ea808c89660020031480022646644b30013024302e375400515980099b8f375c6064605e6ea8008dd7181918179baa020899b80001301237566030605e6ea800e2002816a20028168c0c0c0b4dd5181818169baa001330030033031002302f00140b514a31640a060186eacc048c0a4dd5180918149baa302c3029375400316409c6eb4c0a8004cc02cdd6181518139baa01f01a32325980099b89480000062660546ea0004cc0aa6002946980103d87a8000a60103d8798000409897ae08998151ba8337029000000998154c005285300103d87a8000a60103d8798000409897ae0409866e0ccdc11bad301130273754030b30013020302637546026604e6ea8062266e04004dd6980918139baa018899b81375a6024604e6ea806000502519b82375a6024604e6ea806120c801375a601e604c6ea80122c8120c0a0c094dd5000c59023180798121baa300d30243754604e60486ea80062c8110cc008dd6181318119baa01b375c602660466ea80522c8108c094c088dd500ec56600260300131332259800980c98119baa0018992cc004c06cc090dd5000c4c8cc01800456600330010049bae301030263754003300701e402115980099912cc004c084c09cdd5180a18141baa019899b89002001899b8900100240986eb4c03cc098dd5002192cc004c080c098dd5180998139baa018899b81375a6024604e6ea8060006266e00dd6980918139baa018001409466e0ccdc119b82375a601e604c6ea805d2010375a6022604c6ea805ccdc119b82375a6020604c6ea805cdd6980718131baa01748052264b3001301c3026375400313232598009807800c566002601e66e0400800629462c813a2c8138cdc199b820014802920c801300a37566020604e6ea8c040c09cdd5181518139baa0018b204a3300a37586052604c6ea80780662c81222c8120c0a0c094dd5000c59023180798121baa300d30243754604e60486ea80062c8110c094c088dd500e998009bac3025302237540346eb8c048c088dd5009c4c966002660206eb0c044c08cdd500d9bae3026302337540291598009804800c4c966002603260466ea80062646464b3001301c302637540031325980099b893370060166eacc044c0a0dd5180898141baa004006300b3756602260506ea8006264b3001301f3028375400313259800980f98149baa001899191919191919194c004dd7181a800cdd7181a8044dd6981a803cdd6981a8034dd6981a802cc966002606600315980099b8948010c0c80062d1302c303200140c51640d06ea8c0d40126eb4c0d400e6eb4c0d40092222222259800981f004c56600266e1cdd69811981d1baa011337006eb4c08cc0e8dd501580c456600266e3cdd7181e981d1baa011375c607a60746ea80ae2b30013370e6eb4c094c0e8dd50089bad3025303a375405715980099b87375a604860746ea8044dd69812181d1baa02b8acc00566002606660726ea8c098c0e8dd5008c4c0ccc0e4dd51813181d1baa02b8cc004c0ccc0e4dd51813181d1baa02ba50a5140e081c22b30013370e6eb4c088c0e8dd50089bad3022303a375405715980099b8f375c605460746ea8044dd71815181d1baa02b8a518b20708b20708b20708b20708b20708b20708b20708b2076181a800981a0009819800981900098188009818000981780098151baa0018b2050302c3029375400316409c602660506ea80062c8130c0a8c09cdd5000c59025198059bac30113026375403c466ebcc0a8c09cdd5000801181418129baa300e30253754002604e60486ea80062c8110cc01cdd6181318119baa01b0168b20428b2042375a604a60446ea807502020402038223300300223375e6044603e6ea80040088c966002602e603a6ea80062900044dd69810980f1baa001407064b30013017301d375400314c0103d87a8000899198008009bab3022301f375400444b30010018a6103d87a8000899192cc004cdc8a45045553444d000018acc004cdc7a441045553444d000018980899812181100125eb82298103d87a80004081133004004302600340806eb8c080004c08c005021203832330010010022259800800c5300103d87a8000899192cc004cdc8a451c2a76795ed9cb3fbea561af69342b5fcaa988871ca2c425ecd5593fd1000018acc004cdc7a4411c2a76795ed9cb3fbea561af69342b5fcaa988871ca2c425ecd5593fd1000018980819811981080125eb82298103d87a8000407d1330040043025003407c6eb8c07c004c088005020111919800800801912cc0040062980103d87a80008992cc004c0100062601e6604400297ae08998018019812001203c302200140808b201a2259800980318081baa0028991919194c004dd7180c000cdd7180c0024dd6980c001cdd6980c00124444b3001301d005804c5901a0c060004c05c004c058004c044dd500145900f18080021808180880222c8038601000260066ea802229344d9590011";

      // Create script object for Lucid-Evolution (supports PlutusV3!)
      const positionScript: SpendingValidator = {
        type: "PlutusV3",
        script: positionCompiledCode,
      };

      // DEBUG: Calculate and verify script hash
      const calculatedPositionHash = validatorToScriptHash(positionScript);
      console.log(`Position script hash (calculated by Lucid): ${calculatedPositionHash}`);
      console.log(`Position script hash (expected):            cfc0eb68637023ddd7a580207eec35f59c6da69076816496fd726f67`);
      console.log(`Position script hash MATCH: ${calculatedPositionHash === "cfc0eb68637023ddd7a580207eec35f59c6da69076816496fd726f67"}`);
      console.log(`Position compiled code length: ${positionCompiledCode.length}`);
      console.log(`Position compiled code starts with: ${positionCompiledCode.substring(0, 20)}`);

      // 7. Find Vault UTxO - Position script needs vault input in tx.inputs (not reference)
      const vaultUtxos = await lucid.utxosAt(config.vault_script_addr);
      console.log(`Found ${vaultUtxos.length} UTxOs at vault script`);

      if (vaultUtxos.length === 0) {
        throw new Error("Vault UTxO not found. Cannot close position without vault.");
      }

      // Find the main vault UTxO (the one with datum)
      const vaultUtxo = vaultUtxos.find(u => u.datum);
      if (!vaultUtxo || !vaultUtxo.datum) {
        throw new Error("Vault UTxO with datum not found.");
      }
      console.log("Vault UTxO:", vaultUtxo.txHash, vaultUtxo.outputIndex);

      // 8. Build the transaction
      const usdmUnit = config.usdm_policy_id + config.usdm_asset_name;

      // Use BigInt throughout to match on-chain calculations exactly
      // returnAmountBig: collateral +/- PnL (all in BigInt)
      let returnAmountBig: bigint;
      if (isProfit) {
        returnAmountBig = collateralBig + pnlAmountAbs;
      } else {
        // Loss: capped at collateral
        const cappedLoss = pnlAmountAbs > collateralBig ? collateralBig : pnlAmountAbs;
        returnAmountBig = collateralBig - cappedLoss;
      }
      if (returnAmountBig < BigInt(0)) {
        returnAmountBig = BigInt(0);
      }

      // Get the assets from the position UTxO
      const positionLovelace = positionUtxo.assets["lovelace"] || BigInt(0);

      // Parse vault datum to preserve for continuing output
      const vaultDatumParsed = Data.from(vaultUtxo.datum);
      const vaultDatumFields = (vaultDatumParsed as { fields: unknown[] }).fields;

      // Vault USDM balance calculation (keep as BigInt)
      const vaultUsdmBig = vaultUtxo.assets[usdmUnit] || BigInt(0);
      const vaultLovelace = vaultUtxo.assets["lovelace"] || BigInt(0);

      // New vault USDM: if profit, vault pays trader. if loss, vault receives from position
      let newVaultUsdmBig: bigint;
      if (isProfit) {
        newVaultUsdmBig = vaultUsdmBig - pnlAmountAbs;
      } else {
        // Loss: vault receives the loss (capped at collateral)
        const cappedLoss = pnlAmountAbs > collateralBig ? collateralBig : pnlAmountAbs;
        newVaultUsdmBig = vaultUsdmBig + cappedLoss;
      }

      console.log(`Building TX: consuming position UTxO AND vault UTxO`);
      console.log(`  Position has: ${positionLovelace} lovelace, ${collateralBig} USDM`);
      console.log(`  Vault has: ${vaultUsdmBig} USDM`);
      console.log(`  PnL: ${isProfit ? "+" : "-"}${pnlAmountAbs} USDM (${isProfit ? "profit" : "loss"})`);
      console.log(`  Returning to trader: ${returnAmountBig} USDM + ADA`);
      console.log(`  New vault USDM: ${newVaultUsdmBig}`);

      // Build SettlePnL redeemer for vault
      // SettlePnL: Constr(3, [pnl_amount: Int, is_profit: Bool, oracle_feed: OraclePriceFeed])
      // Bool: Constr(1, []) = True, Constr(0, []) = False
      const isProfitConstr = new Constr(isProfit ? 1 : 0, []);
      const settlePnLRedeemer = Data.to(new Constr(3, [
        pnlAmountAbs,  // Already BigInt from calculation
        isProfitConstr,
        oracleFeedConstr,  // Same oracle feed as position close
      ]));
      console.log("SettlePnL redeemer built");

      // Load vault script
      const vaultCompiledCode = await getVaultCompiledCode();
      const vaultScript: SpendingValidator = {
        type: "PlutusV3",
        script: vaultCompiledCode,
      };

      // DEBUG: Calculate and verify vault script hash
      const calculatedVaultHash = validatorToScriptHash(vaultScript);
      console.log(`Vault script hash (calculated by Lucid): ${calculatedVaultHash}`);
      console.log(`Vault script hash (expected):            cd1e8b34087ffa8099f9c74b11d2df722862601d14e1c8c9e26274f5`);
      console.log(`Vault script hash MATCH: ${calculatedVaultHash === "cd1e8b34087ffa8099f9c74b11d2df722862601d14e1c8c9e26274f5"}`);

      // Create continuing vault datum (unchanged for SettlePnL)
      const continuingVaultDatum = new Constr(0, [
        vaultDatumFields[0] as DataType,  // admin
        vaultDatumFields[1] as DataType,  // total_shares (unchanged)
        vaultDatumFields[2] as DataType,  // min_deposit
        vaultDatumFields[3] as DataType,  // oracle_pubkey
        vaultDatumFields[4] as DataType,  // position_script_hash
      ]);

      // Build transaction: consume BOTH position and vault UTxOs
      // Prepare trader output - only include USDM if returnAmountBig > 0
      const traderOutput: Record<string, bigint> = {
        lovelace: positionLovelace,
      };
      if (returnAmountBig > BigInt(0)) {
        traderOutput[usdmUnit] = returnAmountBig;
      }

      const tx = await lucid
        .newTx()
        .collectFrom([positionUtxo], closeRedeemer)
        .collectFrom([vaultUtxo], settlePnLRedeemer)
        .attach.SpendingValidator(positionScript)
        .attach.SpendingValidator(vaultScript)
        .pay.ToAddress(walletAddress, traderOutput)
        .pay.ToContract(
          config.vault_script_addr,
          { kind: "inline", value: Data.to(continuingVaultDatum as DataType) },
          {
            lovelace: vaultLovelace,
            [usdmUnit]: newVaultUsdmBig,
          }
        )
        .addSignerKey(traderPkh)
        // Set validity based on oracle timestamp to pass age check on-chain
        // On-chain checks: current_time - oracle_timestamp <= 300 seconds
        // Lucid uses milliseconds, so convert oracle timestamp (seconds) to ms
        .validFrom(oracleFeed.timestamp * 1000)  // Oracle timestamp as lower bound
        .validTo(oracleFeed.timestamp * 1000 + 300000)  // Oracle timestamp + 5 minutes
        .complete();

      console.log("TX built, signing...");

      // Sign and submit
      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      console.log("Transaction submitted:", txHash);

      // Update backend DB after successful on-chain close
      try {
        await tradingApi.closePosition(params.positionId, walletAddress);
        console.log("Position marked as closed in DB");
      } catch (dbError) {
        console.error("Failed to update position in DB:", dbError);
      }

      const closeResult: ClosePositionResult = {
        txHash,
        closePrice,
        realizedPnl,
        pnlPercent,
      };

      console.log("Position closed successfully:", closeResult);
      return closeResult;
    } catch (error) {
      console.error("Error closing position:", error);
      throw error;
    }
  }, [walletAddress]);

  // Deposit USDM to Vault (LP)
  // If vault is empty, this initializes the vault with VaultDatum
  const depositToVault = useCallback(async (amount: number): Promise<VaultDepositResult> => {
    const lucid = getLucid();
    if (!lucid || !walletAddress) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }

    try {
      const config = await configApi.getContractConfig();
      console.log("Depositing to vault:", amount, "USDM");

      // Get depositor's payment key hash
      const addressDetails = getAddressDetails(walletAddress);
      const depositorPkh = addressDetails.paymentCredential?.hash;
      if (!depositorPkh) {
        throw new Error("Could not extract payment key hash from address");
      }

      // Check if vault already has UTxO (initialized)
      const vaultUtxos = await lucid.utxosAt(config.vault_script_addr);
      console.log(`Found ${vaultUtxos.length} UTxOs at vault`);

      const usdmUnit = config.usdm_policy_id + config.usdm_asset_name;
      const depositAmount = BigInt(Math.round(amount));

      // Get oracle pubkey and position script hash from API config
      // These values come from root .env via backend gateway
      const oraclePubkey = "ae349591d0cf933849d4c9a667cca669ad2386c4fc4b33e97324164fde0f03ac";
      const positionScriptHash = config.position_script_hash;
      if (!positionScriptHash) {
        throw new Error("position_script_hash not configured in backend. Check .env");
      }
      console.log("Using position_script_hash from config:", positionScriptHash);

      let tx;
      let newShares: number;

      if (vaultUtxos.length === 0) {
        // INITIALIZE VAULT: First deposit creates the vault UTxO
        console.log("Initializing vault with first deposit...");

        // VaultDatum: [admin, total_shares, min_deposit, oracle_pubkey, position_script_hash]
        const vaultDatum = new Constr(0, [
          depositorPkh,                    // admin: VerificationKeyHash
          depositAmount,                   // total_shares: Int (1:1 for first deposit)
          BigInt(100),                     // min_deposit: Int (100 USDM minimum)
          oraclePubkey,                    // oracle_pubkey: ByteArray
          positionScriptHash,              // position_script_hash: ByteArray
        ]);

        console.log("VaultDatum:", {
          admin: depositorPkh,
          total_shares: depositAmount.toString(),
          min_deposit: 100,
          oracle_pubkey: oraclePubkey,
          position_script_hash: positionScriptHash,
        });

        tx = await lucid
          .newTx()
          .pay.ToContract(
            config.vault_script_addr,
            { kind: "inline", value: Data.to(vaultDatum) },
            {
              lovelace: BigInt(2_000_000), // ~2 ADA for UTxO
              [usdmUnit]: depositAmount,
            }
          )
          .complete();

        newShares = amount; // 1:1 for first deposit
      } else {
        // ADD TO EXISTING VAULT: Deposit more liquidity
        console.log("Adding liquidity to existing vault...");

        const vaultUtxo = vaultUtxos.find(u => u.datum);
        if (!vaultUtxo || !vaultUtxo.datum) {
          throw new Error("Vault UTxO with datum not found");
        }

        // Parse existing vault datum
        const existingDatum = Data.from(vaultUtxo.datum);
        const datumFields = (existingDatum as { fields: unknown[] }).fields;

        const currentShares = Number(datumFields[1] as bigint);
        const currentUsdm = Number(vaultUtxo.assets[usdmUnit] || BigInt(0));

        // Calculate new shares: (deposit * total_shares) / total_usdm
        newShares = currentUsdm > 0 ? (amount * currentShares) / currentUsdm : amount;
        const newTotalShares = BigInt(Math.round(currentShares + newShares));

        // Create updated VaultDatum with proper type casting
        const updatedVaultDatum = new Constr(0, [
          datumFields[0] as DataType,      // admin (unchanged)
          newTotalShares,                  // total_shares (increased)
          datumFields[2] as DataType,      // min_deposit (unchanged)
          datumFields[3] as DataType,      // oracle_pubkey (unchanged)
          datumFields[4] as DataType,      // position_script_hash (unchanged)
        ]);

        // DepositLiquidity redeemer: Constr(0, [amount])
        const depositRedeemer = Data.to(new Constr(0, [depositAmount]));

        // Load vault script
        const vaultCompiledCode = await getVaultCompiledCode();
        const vaultScript: SpendingValidator = {
          type: "PlutusV3",
          script: vaultCompiledCode,
        };

        const newVaultLovelace = (vaultUtxo.assets["lovelace"] || BigInt(0));
        const newVaultUsdm = BigInt(currentUsdm) + depositAmount;

        tx = await lucid
          .newTx()
          .collectFrom([vaultUtxo], depositRedeemer)
          .attach.SpendingValidator(vaultScript)
          .pay.ToContract(
            config.vault_script_addr,
            { kind: "inline", value: Data.to(updatedVaultDatum as DataType) },
            {
              lovelace: newVaultLovelace,
              [usdmUnit]: newVaultUsdm,
            }
          )
          .complete();
      }

      console.log("TX built, signing...");
      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      console.log("Vault deposit submitted:", txHash);

      return {
        txHash,
        amount,
        shares: newShares,
      };
    } catch (error) {
      console.error("Error depositing to vault:", error);
      throw error;
    }
  }, [walletAddress]);

  // Withdraw USDM from Vault by burning shares
  const withdrawFromVault = useCallback(async (shares: number): Promise<VaultWithdrawResult> => {
    const lucid = getLucid();
    if (!lucid || !walletAddress) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }

    try {
      const config = await configApi.getContractConfig();
      console.log("Withdrawing from vault:", shares, "shares");

      const vaultUtxos = await lucid.utxosAt(config.vault_script_addr);
      const vaultUtxo = vaultUtxos.find(u => u.datum);

      if (!vaultUtxo || !vaultUtxo.datum) {
        throw new Error("Vault UTxO not found");
      }

      const usdmUnit = config.usdm_policy_id + config.usdm_asset_name;

      // Parse existing vault datum
      const existingDatum = Data.from(vaultUtxo.datum);
      const datumFields = (existingDatum as { fields: unknown[] }).fields;

      const totalShares = Number(datumFields[1] as bigint);
      const totalUsdm = Number(vaultUtxo.assets[usdmUnit] || BigInt(0));

      // Calculate withdrawal amount: (shares * total_usdm) / total_shares
      const withdrawAmount = Math.floor((shares * totalUsdm) / totalShares);
      const sharesToBurn = BigInt(Math.round(shares));
      const newTotalShares = BigInt(Math.round(totalShares - shares));

      console.log(`Withdrawing ${withdrawAmount} USDM for ${shares} shares`);

      // Create updated VaultDatum with proper type casting
      const updatedVaultDatum = new Constr(0, [
        datumFields[0] as DataType,      // admin (unchanged)
        newTotalShares,                  // total_shares (decreased)
        datumFields[2] as DataType,      // min_deposit (unchanged)
        datumFields[3] as DataType,      // oracle_pubkey (unchanged)
        datumFields[4] as DataType,      // position_script_hash (unchanged)
      ]);

      // WithdrawLiquidity redeemer: Constr(1, [shares_to_burn])
      const withdrawRedeemer = Data.to(new Constr(1, [sharesToBurn]));

      // Load vault script
      const vaultCompiledCode = await getVaultCompiledCode();
      const vaultScript: SpendingValidator = {
        type: "PlutusV3",
        script: vaultCompiledCode,
      };

      const newVaultLovelace = vaultUtxo.assets["lovelace"] || BigInt(0);
      const newVaultUsdm = BigInt(totalUsdm - withdrawAmount);

      // Check if this is a full withdrawal (emptying the vault)
      const isFullWithdrawal = shares >= totalShares;

      let tx;
      if (isFullWithdrawal) {
        // Full withdrawal: no continuing vault output
        // Return all USDM and ADA to the withdrawer
        console.log("Full withdrawal detected - emptying vault completely");
        tx = await lucid
          .newTx()
          .collectFrom([vaultUtxo], withdrawRedeemer)
          .attach.SpendingValidator(vaultScript)
          .pay.ToAddress(walletAddress, {
            lovelace: newVaultLovelace,
            [usdmUnit]: BigInt(totalUsdm),
          })
          .complete();
      } else {
        // Partial withdrawal: create continuing vault output
        tx = await lucid
          .newTx()
          .collectFrom([vaultUtxo], withdrawRedeemer)
          .attach.SpendingValidator(vaultScript)
          .pay.ToContract(
            config.vault_script_addr,
            { kind: "inline", value: Data.to(updatedVaultDatum as DataType) },
            {
              lovelace: newVaultLovelace,
              [usdmUnit]: newVaultUsdm,
            }
          )
          .pay.ToAddress(walletAddress, {
            [usdmUnit]: BigInt(withdrawAmount),
          })
          .complete();
      }

      console.log("TX built, signing...");
      const signedTx = await tx.sign.withWallet().complete();
      const txHash = await signedTx.submit();

      console.log("Vault withdrawal submitted:", txHash);

      return {
        txHash,
        amount: withdrawAmount,
        sharesBurned: shares,
      };
    } catch (error) {
      console.error("Error withdrawing from vault:", error);
      throw error;
    }
  }, [walletAddress]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        network,
        isConnecting,
        isLaceAvailable,
        connectWallet,
        disconnectWallet,
        openPosition,
        closePosition,
        depositToVault,
        withdrawFromVault,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
