// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TokenvestIDL from '../target/idl/tokenvest.json'
import type { Tokenvest } from '../target/types/tokenvest'

// Re-export the generated IDL and type
export { Tokenvest, TokenvestIDL }

// The programId is imported from the program IDL.
export const TOKENVEST_PROGRAM_ID = new PublicKey(TokenvestIDL.address)

// This is a helper function to get the Tokenvest Anchor program.
export function getTokenvestProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...TokenvestIDL, address: address ? address.toBase58() : TokenvestIDL.address } as Tokenvest, provider)
}

// This is a helper function to get the program ID for the Tokenvest program depending on the cluster.
export function getTokenvestProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Tokenvest program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return TOKENVEST_PROGRAM_ID
  }
}
