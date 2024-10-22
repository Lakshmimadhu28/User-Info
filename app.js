const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/userDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

if (!fs.existsSync('data.json')) {
  fs.writeFileSync('data.json', JSON.stringify([], null, 2));
}

app.post('/api/users', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('phone').isMobilePhone().withMessage('Phone must be a valid mobile number'),
  body('email').isEmail().withMessage('Email must be a valid email address')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, phone, email } = req.body;

  try {
    const newUser = new User({ username, phone, email });
    await newUser.save(); 

    fs.readFile('data.json', (err, data) => {
      if (err) throw err;
      const users = JSON.parse(data);
      users.push(newUser.toObject()); 
      fs.writeFile('data.json', JSON.stringify(users, null, 2), (err) => {
        if (err) throw err;
      });
    });

    console.log('New User Created:', { username, phone, email });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/users', (req, res) => {
  fs.readFile('data.json', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    const users = JSON.parse(data);
    res.status(200).json(users);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
