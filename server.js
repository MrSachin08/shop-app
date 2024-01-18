import express from "express";
import dotenv from "dotenv"
import morgan from "morgan"
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js'
import cors from "cors";
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import {path} from path;
import {fileURLToPath} from 'url';



//config env

dotenv.config();

//db config

connectDB();

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);


const app = express();

//middleware
app.use(cors());

app.use(express.json())
app.use(morgan('dev'))

app.use(express.static(path.join(__dirname,"./client/build")))

//routes
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/category",categoryRoutes);
app.use("/api/v1/product",productRoutes); 

app.use('*',function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html'))
});


app.get("/",(req,res)=>{
    res.send("welcome to my new server");
})

const port=process.env.port || 8000;

app.listen(port,()=>{
    console.log(`Server is running at port ${port}`);
})