const mongoose = require("mongoose");
const makeModel = require("./modelFactory");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    unique: [true, "username is not available"],
    minlength: [3, "must not be less that 3 charatcters"],
    maxlength: [20, "must not be longer than 20 characters"],
  },
  password: {
    type: String,
    minlength: [5, "must not be less that 5 charatcters"],
    required: [true, "password is required"],
  },
  name: {
    type: String,
    required: [true, "name is required"],
  },
  surname: {
    type: String,
    required: [true, "surname is required"],
  },
  email: {
    type: String,
    unique: [true, "this email is registered to a different account"],
    required: [true, "email is required"],
    validate: [validateEmail, "please fill a valid email address"],
  },
  avatarImageURL: {
    type: String,
  },
  pinnedBoards: [
    {
      _id: false,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
    },
  ],
  notifications: [
    {
      title: String,
      info: String,
      url: String,
    },
  ],
});

userSchema.plugin(uniqueValidator, { message: "{VALUE} is not available" });

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = makeModel("User", userSchema);
