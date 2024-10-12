// authController.js
const Users = require('../models/user');
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
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' }, (err, token) => {
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
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, payload });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getDetails = async (req, res) => {
  try {
    console.log("getDetails--------", req.params);
    const userId = req.params.userId;

    let userData = await Users.findById(userId);
    console.log(userData);
    
    return res.status(200).json({ user: userData });

  } catch (error) {
    console.error('Error getting your profile details:', error);
    res.status(500).send('Server error');
  }
};

exports.updateBio = async (req, res) => {
  try {
    console.log("updateBio",req.body);
    
    const bio = req.body.bio;
    const userId = req.body.user.id;
    
    let user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.bio = bio;
    await user.save();
    
    res.status(200).json({ message: 'Bio updated successfully', userData: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    let user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken
    const existingUser = await Users.findOne({ username });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    user.username = username || user.username;
    await user.save();

    res.json({ message: 'Username updated successfully', username: user.username });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
