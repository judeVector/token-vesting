"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useTokenvestProgram } from "./tokenvest-data-access";
import { TokenvestCreate, TokenvestList } from "./tokenvest-ui";

export default function TokenvestFeature() {
  const { publicKey } = useWallet();
  const { programId } = useTokenvestProgram();

  return publicKey ? (
    <div>
      <AppHero title="Token Vesting" subtitle={"Create a new vesting account below."}>
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <TokenvestCreate />
      </AppHero>
      <TokenvestList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
