import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Files, Fields } from 'formidable';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err: Error, fields: Fields, files: Files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const fileArray = files.file;
    if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    try {
      const readableStream = fs.createReadStream(file.filepath);
      const result = await pinata.pinFileToIPFS(readableStream, {
        pinataMetadata: { name: file.originalFilename || 'unnamed' },
      });
      res.status(200).json({ ipfsHash: result.IpfsHash });
    } catch (error) {
      console.error('IPFS upload error:', error);
      res.status(500).json({ error: 'Failed to upload to IPFS' });
    }
  });
}
