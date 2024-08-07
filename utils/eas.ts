import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

// Initialize EAS
export const EASContractAddress: string =
  '0x0000000000000000000000000000000000000000';
export const EASNetwork = 'optimism-mainnet';
export const eas = new EAS(EASContractAddress);

// Your schema UIDs
export const documentSchemaUID: string =
  '0xb882e2b7e92030c758903470105e4941c74b67ec13a92676a4004ef2492deed1';
export const signatureSchemaUID: string =
  '0x81eda0d9ce8c4b8b211e8700215bd854703d21f44da8f35985f7e9d25228a438';

// Schema encoders
export const documentSchemaEncoder = new SchemaEncoder(
  'uint8 requiredSignatures,bytes32[] signatureUIDs,bytes32 ipfs,bool worldcoinProofRequired'
);
export const signatureSchemaEncoder = new SchemaEncoder(
  'string documentHash,bytes signature,bytes worldcoinProof'
);
