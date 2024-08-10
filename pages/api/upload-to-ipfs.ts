import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Files, Fields } from 'formidable';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

interface PinataMetadata {
  [key: string]: string | number | null;
}

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
      const timestamp = Date.now();
      const originalName = file.originalFilename || 'unnamed';
      const fileNameWithTimestamp = `${timestamp}-${originalName}`;

      const metadata: PinataMetadata = {
        name: fileNameWithTimestamp,
        timestamp: timestamp,
        originalFileName: originalName,
      };

      // Read the file content
      const fileContent = await fs.promises.readFile(file.filepath);

      // Append the timestamp to the file content
      const modifiedContent = Buffer.concat([
        fileContent,
        Buffer.from(`\n${timestamp}`),
      ]);

      // Create a readable stream from the modified content
      const readableStream = new Readable();
      readableStream.push(modifiedContent);
      readableStream.push(null);

      const result = await pinata.pinFileToIPFS(readableStream, {
        pinataMetadata: metadata,
      });

      res.status(200).json({
        ipfsHash: result.IpfsHash,
        fileName: fileNameWithTimestamp,
      });
    } catch (error) {
      console.error('IPFS upload error:', error);
      res.status(500).json({ error: 'Failed to upload to IPFS' });
    }
  });
}
