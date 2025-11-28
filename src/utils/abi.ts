// src/utils/abi.ts

// Alamat Smart Contract (dari link Blockscout Lisk Sepolia yang Anda berikan)
export const CONTRACT_ADDRESS = "0x57472feF0B62745862F81E8020e17e94bCcA335b";

// Alamat Mock USDT (Jangan diubah jika masih menggunakan token yang sama)
export const USDT_ADDRESS = "0x69a58006574BBf7032afb321341661Db8754d21b";

// ABI untuk TransendFreeMultiToken (Sesuai dengan kode Solidity sebelumnya)
export const MULTI_SENDER_ABI = [
  // Error jika transfer token gagal (dari library SafeERC20)
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  // Event yang dipancarkan setelah pembayaran sukses
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRecipients",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalNativeSent",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalERC20Sent",
        type: "uint256",
      },
    ],
    name: "MultiPaymentExecuted",
    type: "event",
  },
  // Fungsi Utama: multiPay
  {
    inputs: [
      { internalType: "address[]", name: "recipients", type: "address[]" },
      { internalType: "address[]", name: "tokens", type: "address[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    name: "multiPay",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// ABI Standar untuk Token ERC20 (USDT, dll)
export const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
