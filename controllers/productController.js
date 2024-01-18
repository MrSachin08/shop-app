import slugify from "slugify";
import ProductModels from "../models/ProductModels.js";
import fs from "fs";
import React from "react";
import categoryModel from "../models/categoryModel.js";
import orderModels from "../models/orderModels.js";
import dotenv from "dotenv";

dotenv.config();
//payment gateway
import braintree from "braintree";

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return res.status(500).send({
          error: "name is required",
        });

      case !description:
        return res.status(500).send({
          error: "description is required",
        });
      case !price:
        return res.status(500).send({
          error: "price is required",
        });
      case !category:
        return res.status(500).send({
          error: "category is required",
        });
      case !quantity:
        return res.status(500).send({
          error: "quantity is required",
        });
      case photo && photo.size > 1000000:
        return res.status(500).send({
          error:
            "photo  is required and the size of photo should be less than 1 MB",
        });
    }

    const products = new ProductModels({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    products.save();

    res.status(201).send({
      sucess: true,
      coutTotal: products.length,
      message: "Products Created Succesfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "error in creatting products",
    });
  }
};

//get all products

export const getProductController = async (req, res) => {
  try {
    const products = await ProductModels.find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      sucess: true,
      message: "all products",
      products,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "errror in getttinr all products",
      e,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModels.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await ProductModels.findById(req.params.pid).select(
      "photo"
    );
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await ProductModels.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate producta
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = await ProductModels.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update product",
    });
  }
};

//product filters

export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;

    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await ProductModels.find(args);
    res.status(200).send({
      success: true,
      message: "succesfully fetched the filter items",
      products,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      success: false,
      message: "error while filtering products",
      e,
    });
  }
};

//product count controller

export const productCountController = async (req, res) => {
  try {
    const total = await ProductModels.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
      message: "success in getting the total",
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      success: true,
      message: "error in pagination",
      e,
    });
  }
};

//product list per page

export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await ProductModels.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      success: false,
      message: "error in per page control",
      e,
    });
  }
};

//for search
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await ProductModels.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    res.json(results);
  } catch (e) {
    console.log(e);
    res.status(400).send({
      success: false,
      message: "error in search poduct",
      e,
    });
  }
};

//related product controller

export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await ProductModels.find({
      category: cid,
      _id: { $ne: pid },
    })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      message: "success in getting similar produicr",
      products,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      success: false,
      message: "error while gettoing similar products",
      e,
    });
  }
};

//product category controller

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await ProductModels.find({ category }).populate(
      "category"
    );
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      success: false,
      e,
      message: "error in categorymodel",
    });
  }
};

//payment routes
//token controller

export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (e) {
    console.log(e);
  }
};

//paymenet

export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModels({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
};
