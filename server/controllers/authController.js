// authController.js
const Users = require('../models/user');
const FriendRequests = require('../models/friendRequests'); // Import the FriendRequests model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log("req.body----", req.body);
    
    const { username, email, password } = req.body;
    let user = await Users.findOne({ email });
    if (user) {
      console.log("jhbdskfn");
      
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new Users({ username, email, password });

    console.log("user-----", user);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: { id: user.id, email: user.email, username: user.username }
    };
    console.log("payload----", payload);
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, payload });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    console.log("authController----login--------", req.body);
    
    const { email, password } = req.body;
    let user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User doesn\'t exist! Please register' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: { id: user.id, email: user.email, username: user.username }
    };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, payload });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
