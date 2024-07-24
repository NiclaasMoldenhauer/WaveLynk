import asynchandler from 'express-async-handler';
import User from '../../models/auth/userModel.js';

export const deleteUser = asynchandler (async (req, res) => {
  const {id} = req.params;

  // attempt to find and delete user
  try {
    const user = await User.findByIdAndDelete (id);
    if (user) {
      res.status (200).json ({message: 'User wurde gelöscht'});
    } else {
      res.status (404).json ({message: 'User nicht gefunden'});
    }
  } catch (error) {
    res.status (500).json ({message: 'User kann nicht gelöscht werden'});
  }
});

// get all users
export const getAllUsers = asynchandler (async (req, res) => {
  try {
    const users = await User.find ();
    
    if (!users) {
      res.status (404).json ({message: 'Keine User gefunden'});
    }
    res.status (200).json (users);
  } catch (error) {
    res.status (500).json ({message: 'User konnten nicht gefunden werden'});
  }
});
