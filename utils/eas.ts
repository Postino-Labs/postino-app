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
  '0xf431a5baa7c9ce87e7539c353a17c23d1ec65a3319b102fff44d73d13cb84f32';

// Schema encoders
export const documentSchemaEncoder = new SchemaEncoder(
  'uint8 requiredSignatures,bytes32[] signatureUIDs,bytes32 ipfs,bool worldcoinProofRequired'
);
export const signatureSchemaEncoder = new SchemaEncoder(
  'bytes32 documentHash,bytes signature,bytes worldcoinProof'
);
