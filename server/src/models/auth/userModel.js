import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema (
  {
    name: {
      type: String,
      required: [true, 'Füge deinen Namen hinzu'],
    },

    email: {
      type: String,
      required: [true, 'Füge deine Email hinzu'],
      unique: true,
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'Füge eine gültige Email hinzu',
      ],
    },
    password: {
      type: String,
      required: [true, 'Füge dein Passwort hinzu'],
    },
    photo: {
      type: String,
      default: 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg',
    },

    bio: {
      type: String,
      default: 'Hi! Ich bin neu hier!',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'creator'],
      default: 'user',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true, minimize: true}
);

// password encryption
userSchema.pre ('save', async function (next) {
    // check if password is modified
  if (!this.isModified ('password')) {
    return next ();
  }

  // hash password SHA256 bcrypt
  // generate salt
  const salt = await bcrypt.genSalt (10);
  // hash password with salt
  const hashedPassword = await bcrypt.hash (this.password, salt);
 // replace password with hashed password
  this.password = hashedPassword; 

  // call next middleware
  next ();
});

const User = mongoose.model ('User', userSchema);

export default User;
