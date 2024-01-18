import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFilterController,
  productListController,
  productPhotoController,
  relatedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

//update products

router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get products

router.get("/get-product", getProductController);

//single product
router.get("/get-product/:slug", getSingleProductController);

//get photo
router.get("/product-photo/:pid", productPhotoController);

//delete rproduct
router.delete("/delete-product/:pid", deleteProductController);

//filter products

router.post("/product-filter", productFilterController);

//count product

router.get("/product-count", productCountController);

//product per page

router.get("/product-list/:page", productListController);

//search product

router.get("/search/:keyword", searchProductController);

//similar product

router.get("/related-product/:pid/:cid", relatedProductController);

//category wise

router.get("/product-category/:slug", productCategoryController);

//payment routes
//token

router.get("/braintree/token", braintreeTokenController);

//payments

router.post("/braintree/payment", requireSignIn, braintreePaymentController);

export default router;
