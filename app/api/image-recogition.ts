import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import formidable, { File } from 'formidable';
import fs from 'fs';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const file = files.image as File;
    const filePath = file.filepath;
    const image = fs.readFileSync(filePath);

    try {
      const response = await openai.chat.createImageCompletion({
        model: 'gpt-4-o',
        prompt: `Describe the content of this image: ${image.toString('base64')}`,
      });

      res.status(200).json({ description: response.data.choices[0].text });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export default handler;
