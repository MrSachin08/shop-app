import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
    products:[{
        type:mongoose.ObjectId,
        ref:"Products",

    },],
    payments:{},
    buyer:{
        type:mongoose.ObjectId,
        ref:"users",
    },
    status:{
        type:String,
        default:"Not Process",
        enum:{values:["Not Process","Processing","Shipped","delieveries","Cancel"], message: 'Status is required.'}
    
    },
},{timestamps:true}

);

export default mongoose.model("Order",orderSchema);