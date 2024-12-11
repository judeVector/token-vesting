import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Tokenvest} from '../target/types/tokenvest'

describe('tokenvest', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Tokenvest as Program<Tokenvest>

  const tokenvestKeypair = Keypair.generate()

  it('Initialize Tokenvest', async () => {
    await program.methods
      .initialize()
      .accounts({
        tokenvest: tokenvestKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([tokenvestKeypair])
      .rpc()

    const currentCount = await program.account.tokenvest.fetch(tokenvestKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Tokenvest', async () => {
    await program.methods.increment().accounts({ tokenvest: tokenvestKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenvest.fetch(tokenvestKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Tokenvest Again', async () => {
    await program.methods.increment().accounts({ tokenvest: tokenvestKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenvest.fetch(tokenvestKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Tokenvest', async () => {
    await program.methods.decrement().accounts({ tokenvest: tokenvestKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenvest.fetch(tokenvestKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set tokenvest value', async () => {
    await program.methods.set(42).accounts({ tokenvest: tokenvestKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenvest.fetch(tokenvestKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the tokenvest account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        tokenvest: tokenvestKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.tokenvest.fetchNullable(tokenvestKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
