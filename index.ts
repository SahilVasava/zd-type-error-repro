import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  KernelAccountClient,
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { ENTRYPOINT_ADDRESS_V07_TYPE, EntryPoint } from "permissionless/types/entrypoint";
import { createPublicClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
const projectId = "";
const bundlerUrl = `https://rpc.zerodev.app/api/v2/bundler/${projectId}`;
const paymasterUrl = `https://rpc.zerodev.app/api/v2/paymaster/${projectId}`;
const publicClient = createPublicClient({
  transport: http(bundlerUrl),
});
const signer = privateKeyToAccount(generatePrivateKey());
const entryPoint = ENTRYPOINT_ADDRESS_V07;
const chain = sepolia;
let client: KernelAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE>;

async function main() {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
  });
  const account = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: ecdsaValidator,
    },
  });
  const paymasterClient = createZeroDevPaymasterClient({
    entryPoint,
    chain,
    transport: http(paymasterUrl),
  });
  
  // This assignment throws the type error
  client = createKernelAccountClient({
    account,
    entryPoint,
    chain,
    bundlerTransport: http(bundlerUrl),
    middleware: {
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  });
}

main();
