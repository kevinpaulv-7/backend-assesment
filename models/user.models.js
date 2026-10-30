const mongoose=require('mongoose');
const userSchema = new mongoose.Schema(
     {
        name:{
            type:String,
            required:[true, "Name is required"],
            trim:true,
        },
        email:{
            type:String,
            required:[true, "Email is required"],
            unique:true,
            trim:true,
            lowercase:true,
        },
        password:{
            type:String,
            required:[true, "Password is required"],
            select:false,
        },
        isActive:{
            type:Boolean,
            default:true,
        },
        profile:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"UserProfile",
            default:null
        },
        role: {
        type: String,
        enum: ["teacher", "student"],
        required: true
    }
    },
    {
        timestamps:true,
    }
)

const User=mongoose.model("User",userSchema);

module.exports=User;