const bcrypt=require('bcrypt');
const User = require('../models/user.models')
const tokenService = require('../jwt/token.service')
const mongoose=require('mongoose');
const UserProfile=require('../models/user.profile.models')


class UserServices{
    async signup(name,email,password,role){
            const existingUser = await User.findOne({email});

        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const user=await User.create({name,email,password:hashedPassword,role})
        return user;
    }
    async getAllUsers(){
        const user=await User.find({isActive:true}).populate('profile')
        return user
    }
    async getUsersByRole(role){
        return User.find({isActive:true,role}).populate('profile')
    }
    async loginUser(email,password){
        const user=await User.findOne({email}).select("+password")
        if(!user){
            throw new Error("User not Found")
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            throw new Error("Invalid credentials")
        }
        const payload={
            id:user._id,
            email:user.email,
            isActive:user.isActive,
            role:user.role,
        }
        const token=tokenService.generateToken(payload)
        const userWithoutPassword=user.toObject()
        delete userWithoutPassword.password
        return{user:userWithoutPassword,token}
    }
    async softDeleteUser(id){
        const user=await User.findById(id)
        if(!user){
            throw new Error("User not found")
        }
        user.isActive=false
        await user.save()
        return user
    }
    async updateUserDetails(userId,updates){
        if(!mongoose.isValidObjectId(userId)){
            const error=new Error("Invalid User Id");
            error.status=400;
            throw error;
        }

        const user=await User.findById(userId).select("+password");
        if(!user || !user.isActive){
            const error=new Error("User not found");
            error.status=404;
            throw error;
        }

        if(Object.hasOwn(updates,"name")){
            user.name=updates.name.trim();
        }
        if(Object.hasOwn(updates,"email")){
            user.email=updates.email.trim().toLowerCase();
        }

        if(Object.hasOwn(updates,"currentPassword") || Object.hasOwn(updates,"newPassword")){
            if(!updates.currentPassword || !updates.newPassword){
                const error=new Error("Current password and new password are required");
                error.status=400;
                throw error;
            }
            if(!await bcrypt.compare(updates.currentPassword,user.password)){
                const error=new Error("Current password is incorrect");
                error.status=401;
                throw error;
            }
            user.password=await bcrypt.hash(updates.newPassword,10);
        }

        const profileUpdates={};
        for(const field of ["age","dob","address"]){
            if(Object.hasOwn(updates,field)){
                profileUpdates[field]=updates[field];
            }
        }

        if(Object.keys(profileUpdates).length > 0){
            const profile=await UserProfile.findOneAndUpdate(
                {user:user._id},
                {$set:profileUpdates},
                {new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}
            );
            if(!user.profile || !user.profile.equals(profile._id)){
                user.profile=profile._id;
            }
        }

        await user.save();
        const userWithoutPassword=user.toObject();
        delete userWithoutPassword.password;
        return {user:userWithoutPassword};
    }
    async updateStudentDetails(studentId,updates){
        if(!mongoose.isValidObjectId(studentId)){
            const error=new Error("Invalid Student Id");
            error.status=400;
            throw error;
        }

        const student=await User.findOne({_id:studentId,role:"student",isActive:true});
        if(!student){
            const error=new Error("Active student not found");
            error.status=404;
            throw error;
        }

        if(Object.hasOwn(updates,"name")){
            student.name=updates.name.trim();
        }
        if(Object.hasOwn(updates,"email")){
            student.email=updates.email.trim().toLowerCase();
        }

        const profileUpdates={};
        for(const field of ["age","dob","address"]){
            if(Object.hasOwn(updates,field)){
                profileUpdates[field]=updates[field];
            }
        }

        if(Object.keys(profileUpdates).length > 0){
            const profile=await UserProfile.findOneAndUpdate(
                {user:student._id},
                {$set:profileUpdates},
                {new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}
            );
            student.profile=profile._id;
        }

        await student.save();
        await student.populate("profile");
        return {user:student.toObject()};
    }
    async addUserProfile(userId,profileData){
        if(!mongoose.isValidObjectId(userId)){
            throw new Error("Invalid User Id");
        }

        const user = await User.findById(userId);

        if(!user){
            throw new Error("User not Found");
        }

        const userProfile=await UserProfile.create({
            user:userId,
            age:profileData.age,
            dob:profileData.dob,
            address:profileData.address,
        });
        user.profile=userProfile._id;
        await user.save();

        return userProfile;
    }
}

module.exports=new UserServices();