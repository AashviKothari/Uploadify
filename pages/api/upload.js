import fs from 'fs-extra';
import { MongoClient } from 'mongodb';
import multiparty from 'multiparty';


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const form = new multiparty.Form();
  
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to process the form' });
          return;
        }
  
        try {
          const { name, email } = fields;
          const { image } = files;
  
          // Connect to MongoDB
          const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });
          const db = client.db('mydatabase');
  
          // Save form data to MongoDB
          await db.collection('users').insertOne({ name: name[0], email: email[0] });
  
          // Move the uploaded image to the specified folder
          const newPath = `./public/uploads/${image[0].originalFilename}`;
          await fs.move(image[0].path, newPath);
  
          // Close the MongoDB connection
          client.close();
  
          res.status(200).json({ message: 'Form submitted successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to save the form data' });
        }
      });
    } else {
      res.status(405).end();
    }
  }
  
