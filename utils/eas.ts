import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { BrowserProvider } from 'ethers';

// Initialize EAS
export const EASContractAddress: string =
  '0x0000000000000000000000000000000000000000';
export const EASContractOPSepoliaAddress: string =
  '0x4200000000000000000000000000000000000021';
export const EASNetwork = 'optimism-mainnet';
export const eas = new EAS(EASContractAddress);

// Your schema UIDs
export const documentSchemaUID: string =
  '0x91dbb634e5b814b76019e9330870af4abd073cd6f10273f87041e5977d522342';
export const signatureSchemaUID: string =
  '0x81eda0d9ce8c4b8b211e8700215bd854703d21f44da8f35985f7e9d25228a438';

// Schema encoders
export const documentSchemaEncoder = new SchemaEncoder(
  'uint8 requiredSignatures,string[] signatureUIDs,string ipfs,bool worldcoinProofRequired'
);
export const signatureSchemaEncoder = new SchemaEncoder(
  'string documentHash,bytes signature,bytes worldcoinProof'
);

export async function walletClientToSigner(walletClient: any) {
  const { account, chain, transport } = walletClient;
  if (!chain || !account) {
    return;
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new BrowserProvider(transport, network);
  const signer = await provider.getSigner(account.address);

  return signer;
}
