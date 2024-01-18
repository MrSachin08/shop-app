import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import orderModels from "../models/orderModels.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, question } = req.body;
    //validation
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone number  is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    if (!question) {
      return res.send({ message: "question is required" });
    }
    //check  users
    const existinguser = await userModel.findOne({ email });

    //check exitsing users
    if (existinguser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login again with new id",
      });
    }

    //register user

    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      question,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Succesfull",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

//POST LOGIN

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotpasswordcontroller

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, question, newpassword } = req.body;
    if (!email) {
      res.status(400).send({
        message: "email is required",
      });
    }
    if (!question) {
      res.status(400).send({
        message: "answer is required",
      });
    }
    if (!newpassword) {
      res.status(400).send({
        message: "new password is required",
      });
    }
    //check

    const user = await userModel.findOne({ email, question });

    //validation

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }

    const hashed = await hashPassword(newpassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    res.status(200).send({
      success: true,
      message: "password reset succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller

export const testController = (req, res) => {
  try {
    res.send("protected Route");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//update profile

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.JSON({
        error: "password is requires and must be of 6 characters long",
      });
    }
    //problem in hashing the password so after updating there is problem in login
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "success in updatinf the profile data",
      updatedUser,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      success: false,
      message: "error in updating proffile",
      e,
    });
  }
};

export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModels
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "Error while getting ORders",
      e,
    });
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModels
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "Error while getting ORders",
      e,
    });
  }
};

//order statyus controller
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModels.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "Error while updating ORders sttatus",
      e,
    });
  }
};
