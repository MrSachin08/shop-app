import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true

    },
    phone:{
        type:String,
        required:true
    },
    address:{
        type:{},
        required:true
    },
    question:{
        type:String,
        required:true,
    },

    role:{
        type:Number,
        default:0,
    }



},{timestamps:true});
//when new user is created its created time gets added using timestamps

export default mongoose.model('users',userSchema)