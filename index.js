const express = require('express');
const multer = require('multer');
const tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/upload', upload.single('contract'), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  try {
    // Step 1: OCR - extract text from the uploaded file
    const { data: { text } } = await tesseract.recognize(filePath, 'eng');

    // Step 2: Send the extracted text to ChatGPT
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a real estate assistant. Extract and label important dates from this real estate contract.'
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    res.json({ timeline: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file' });
  } finally {
    fs.unlinkSync(filePath); // delete uploaded file after processing
  }
});

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
