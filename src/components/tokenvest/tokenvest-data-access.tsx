'use client'

import { getTokenvestProgram, getTokenvestProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useTokenvestProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTokenvestProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTokenvestProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['tokenvest', 'all', { cluster }],
    queryFn: () => program.account.tokenvest.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['tokenvest', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ tokenvest: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useTokenvestProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useTokenvestProgram()

  const accountQuery = useQuery({
    queryKey: ['tokenvest', 'fetch', { cluster, account }],
    queryFn: () => program.account.tokenvest.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['tokenvest', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ tokenvest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['tokenvest', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ tokenvest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['tokenvest', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ tokenvest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['tokenvest', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ tokenvest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
