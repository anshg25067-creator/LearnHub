const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'teacher', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'student'
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    profileImage: {
      type: String,
      default: ''
    },
    headline: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Return safe user object omitting passwordHash
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    accountStatus: this.accountStatus,
    profileImage: this.profileImage,
    headline: this.headline,
    bio: this.bio,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
