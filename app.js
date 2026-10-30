const express = require('express');
require('dotenv').config()
const connectDB=require('./config/db')
const userRoutes=require('./routes/user.routes')
const app=express();

app.use(express.json())
app.use('/api/user/',userRoutes)
const port=process.env.PORT

app.get('/',(req,res)=>{
    res.status(200).json({message:"Hello"})
})

connectDB().then(()=>{
    app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})
}).catch((err)=>{
    console.error('Failed to start server due to mongoDB:',err.message)
    process.exit(1)
})