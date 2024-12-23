import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { startAnchor, ProgramTestContext, BanksClient, Clock } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
// @ts-ignore
import { createMint, mintTo } from "spl-token-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

// Import type and IDL
import IDL from "../target/idl/tokenvest.json";
import { Tokenvest } from "../target/types/tokenvest";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";

describe("Vesting Smart Contract Tests", () => {
  const COMPANY_NAME = "companyName";
  const INITIAL_BALANCE = 10_000_000_000; // 10 SOL

  let context: ProgramTestContext;
  let banksClient: BanksClient;

  // Participant Keypairs
  let employer: Keypair;
  let beneficiary: Keypair;

  // Blockchain Providers
  let employerProvider: BankrunProvider;
  let beneficiaryProvider: BankrunProvider;

  // Program and Token References
  let program: anchor.Program<Tokenvest>;
  let program2: anchor.Program<Tokenvest>;
  let mint: PublicKey;

  // Derived Account Addresses
  let vestingAccountKey: PublicKey;
  let treasuryTokenAccount: PublicKey;
  let employeeAccount: PublicKey;

  beforeAll(async () => {
    setupKeypairs();

    await initializeTestContext();

    setupProviders();

    await initializeMintAndProgram();

    deriveProgramAccounts();
  });

  // Keypair Setup Helper
  function setupKeypairs() {
    // Generate keypairs for employer and beneficiary
    employer = anchor.web3.Keypair.generate();
    beneficiary = anchor.web3.Keypair.generate();
  }

  async function initializeTestContext() {
    // Create test context with initial account setup
    context = await startAnchor(
      "", // Empty workspace name
      [
        {
          name: "tokenvest",
          programId: new PublicKey(IDL.address),
        },
      ],
      [
        {
          address: beneficiary.publicKey,
          info: {
            lamports: INITIAL_BALANCE,
            // @ts-ignore
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
        {
          address: employer.publicKey,
          info: {
            lamports: INITIAL_BALANCE,
            // @ts-ignore
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ]
    );

    // Initialize banks client
    banksClient = context.banksClient;
  }

  function setupProviders() {
    // Create provider for employer with correct wallet
    employerProvider = new BankrunProvider(context);
    employerProvider.wallet = new NodeWallet(employer);
    anchor.setProvider(employerProvider);

    // Create provider for beneficiary
    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiary);
  }

  async function initializeMintAndProgram() {
    // Create mint with employer as authority
    mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

    // Initialize program with employer provider
    program = new anchor.Program<Tokenvest>(IDL as Tokenvest, employerProvider);
    program2 = new anchor.Program<Tokenvest>(IDL as Tokenvest, beneficiaryProvider);
  }

  // Derive Program-Specific Accounts
  function deriveProgramAccounts() {
    // Derive vesting account address
    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(COMPANY_NAME)],
      program.programId
    );

    // Derive treasury account address
    [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_trasury"), Buffer.from(COMPANY_NAME)],
      program.programId
    );

    // Derive employee account address
    [employeeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        beneficiary.publicKey.toBuffer(),
        vestingAccountKey.toBuffer(),
      ],
      program.programId
    );
  }

  it("should create a vesting account", async () => {
    const tx = await program.methods
      .initializeVestingAccount(COMPANY_NAME)
      .accounts({
        signer: employer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([employer]) // Explicitly add employer as a signer
      .rpc({ commitment: "confirmed" });

    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccountKey,
      "confirmed"
    );

    console.log("Vesting Account data:", vestingAccountData, null, 2);
    console.log(`Create vesting account: ${tx}`);
  });

  it("should fund the trasury token account", async () => {
    const amount = 10_000 * 10 ** 9;
    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccountKey,
      "confirmed"
    );
    const mintTx = await mintTo(
      banksClient,
      employer,
      mint,
      vestingAccountData.treasuryTokenAccount,
      employer,
      amount
    );

    console.log("Mint Treasury Token Account:", mintTx);
  });

  it("should create employee vesting account", async () => {
    const tx2 = await program.methods
      .createEmployeeAccount(new BN(0), new BN(100), new BN(100), new BN(0))
      .accounts({
        beneficiary: beneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      })
      .rpc({ commitment: "confirmed", skipPreflight: true });

    console.log("Create Employee Account Tx:", tx2);
    console.log("Employee Account:", employeeAccount.toBase58());
  });

  it("should claim the employee's vested token", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        BigInt(1000)
      )
    );

    console.log(program2);
    const tx3 = await program2.methods
      .claimToken(COMPANY_NAME)
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Claim Token Tx:", tx3);
  });
});
