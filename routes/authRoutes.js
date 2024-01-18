import express from 'express'
import {registerController,loginController,testController,forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController} from '../controllers/authController.js'
import {requireSignIn,isAdmin} from "../middlewares/authMiddleware.js"
//router object

const router=express.Router()

//routing
//register method post

router.post('/register',registerController)

//login ||post


router.post('/login',loginController)

//forgot password ||post
router.post('/forgot-password',forgotPasswordController)





//test routes
router.get('/test',requireSignIn,isAdmin,testController)

//protected route for user

router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
});

// protected routte for admin
router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
});

//update profile

router.put("/profile",requireSignIn,updateProfileController);

//orders

router.get('/orders',requireSignIn,getOrdersController);

//all orders

router.get('/all-orders',requireSignIn,isAdmin,getAllOrdersController);

//order update sttaus

router.put("/order-status/:orderId",requireSignIn,isAdmin,orderStatusController);

export default router;