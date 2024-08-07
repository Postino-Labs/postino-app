import type { NextApiRequest, NextApiResponse } from 'next';
import { VerificationLevel } from '@worldcoin/idkit-core';
import { verifyCloudProof } from '@worldcoin/idkit-core/backend';

type VerifyReply = {
  success: boolean;
  code?: string;
  attribute?: string | null;
  detail?: string;
};

interface IVerifyRequest {
  proof: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: VerificationLevel;
  };
}

const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
const action = process.env.NEXT_PUBLIC_WLD_ACTION as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyReply>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, detail: 'Method not allowed' });
  }

  try {
    const { proof } = req.body as IVerifyRequest;

    if (!proof) {
      return res
        .status(400)
        .json({ success: false, detail: 'Proof is required' });
    }

    const verifyRes = await verifyCloudProof(proof, app_id, action);

    if (verifyRes.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({
        success: false,
        code: verifyRes.code,
        attribute: verifyRes.attribute,
        detail: verifyRes.detail,
      });
    }
  } catch (error) {
    console.error('Error verifying WorldID proof:', error);
    return res
      .status(500)
      .json({ success: false, detail: 'Internal server error' });
  }
}
