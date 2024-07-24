import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  verificationToken: {
    type: String,
    required: true,
  },

  passwordResetToken: {
    type: String,
    required: false,
  },

  createdAt: {
    type: Date,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

const Token = mongoose.model("Token", TokenSchema);

export default Token;