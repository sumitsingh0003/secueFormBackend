const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const cors = require('cors');
const app = express();

mongoose.connect('mongodb+srv://secure-form:VK5fhHgUYKGiw3Bl@secure-form.xtivoku.mongodb.net/')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

const FormSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
});

const Form = mongoose.model('Form', FormSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(cors({
  origin: '*' 
}));

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, 'secret-key').toString();
};


const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, 'secret-key');
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

app.post('/api/forms', async (req, res) => {
  try {
    const decryptedData = decryptData(req.body.data);
    const newForm = new Form(decryptedData);
    console.log(newForm, 'newform')
    await newForm.save();
    res.status(200).send('Form submitted successfully');
  } catch (error) {
    res.status(500).send('Error submitting form');
  }
});

app.get('/api/forms', async (req, res) => {
  try {
      const forms = await Form.find();
      const encryptedData = forms.map(obj => {
          return encryptData(JSON.stringify(obj));
      });
      res.status(200).json({
          message: 'Forms data Fetch successfully.',
          data: encryptedData
      });

  } catch (error) {
      console.error('Error fetching forms:', error);
      res.status(500).json({
          message: 'An error occurred while fetching forms.',
          error: error.message
      });
  }
});

app.put('/api/forms/:id', async (req, res) => {
  try {
    const decryptedData = decryptData(req.body.data);
    console.log('decryptedData:-', decryptedData)
    const updatedForm = await Form.findByIdAndUpdate(req.params.id, { ...decryptedData, data: decryptedData }, { new: true });
    console.log('updatedForm:-', updatedForm)
    res.status(200).send('Form updated successfully');
  } catch (error) {
    res.status(500).send('Error updating form');
  }
});

app.delete('/api/forms/:id', async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.status(200).send('Form deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting form');
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
      const forms = await Form.findById(req.params.id);
      const encryptedData = encryptData(JSON.stringify(forms))
      res.status(200).json({
          message: 'Forms data Fetch successfully.',
          data: encryptedData
      });

  } catch (error) {
      console.error('Error fetching forms:', error);
      res.status(500).json({
          message: 'An error occurred while fetching forms.',
          error: error.message
      });
  }
});




app.listen(5000, () => {
  console.log('Server running on port 5000');
});

