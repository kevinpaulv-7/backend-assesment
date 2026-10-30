const UserService=require('../services/user.services')

class UserController{
    async signup(req,res){
        try{
        const {name,email,password,role}=req.body
        if(!name || !email||!password||!role){
                return res.status(400).json({message:"All fields are required!"})
            }
            if(!["teacher", "student"].includes(role)){
                return res.status(400).json({message:"Role must be either teacher or student"})
            }
            const result=await UserService.signup(name,email,password,role)
            return res.status(201).json({message:"User created successfully",data:result});
        }catch(err){           
            return res.status(500).json({message:err.message})
        }

    }
    async login(req,res){
        try {
            const{email,password}=req.body
            if(!email||!password){
                return res.status(400).json({message:'Both "email" and "password" are required'})
            }
            const loginData=await UserService.loginUser(email,password)
            return res.status(200).json(loginData)
        } catch (error) {
            res.status(401).json({error:error.message})
        }
    }
    async getAllUsers(req,res){
        if(!req.user || req.user.role !== "teacher"){
            return res.status(403).json({message:"Only teachers can view all users"});
        }

        try {
            const result=await UserService.getAllUsers()
            return res.status(200).json({message:"Users fetched successfully",data:result});

        } catch (err) {
            return res.status(500).json({message:err.message})
            
        }
    }
    async getUsersByRole(req,res,role){
        if(!req.user || req.user.role !== "teacher"){
            return res.status(403).json({message:"Only teachers can view user details"});
        }

        try{
            const result=await UserService.getUsersByRole(role);
            return res.status(200).json({message:`fetched successfully`});
        }catch(err){
            return res.status(500).json({message:err.message});
        }
    }
    async getAllStudents(req,res){
        return this.getUsersByRole(req,res,"student");
    }
    async getAllTeachers(req,res){
        return this.getUsersByRole(req,res,"teacher");
    }
    async updateMyDetails(req,res){
        const updates=req.body;
        if(!updates || typeof updates!=="object" || Array.isArray(updates)){
            return res.status(400).json({message:"Request body must be an object"});
        }

        const allowedFields=["name","email","age","dob","address","currentPassword","newPassword"];
        const invalidFields=Object.keys(updates).filter(field=>!allowedFields.includes(field));

        if(invalidFields.length || Object.keys(updates).length===0){
            return res.status(400).json({message:"Provide valid account, profile, or password fields to update"});
        }

        for(const field of ["name","email","dob","address","currentPassword","newPassword"]){
            if(Object.hasOwn(updates,field) && (typeof updates[field]!=="string" || !updates[field].trim())){
                return res.status(400).json({message:`${field} must be a non-empty string`});
            }
        }
        if(Object.hasOwn(updates,"age") && (!Number.isFinite(Number(updates.age)) || Number(updates.age)<0)){
            return res.status(400).json({message:"age must be a non-negative number"});
        }

        try{
            const result=await UserService.updateUserDetails(req.user.id,updates);
            return res.status(200).json(result);
        }catch(err){
            if(err.code===11000){
                return res.status(409).json({message:"Email is already in use"});
            }
            return res.status(err.status || 500).json({message:err.message});
        }
    }
    async updateStudentDetails(req,res){
        if(!req.user || req.user.role !== "teacher"){
            return res.status(403).json({message:"Only teachers can update student details"});
        }

        const updates=req.body;
        if(!updates || typeof updates!=="object" || Array.isArray(updates)){
            return res.status(400).json({message:"Request body must be an object"});
        }

        const allowedFields=["name","email","age","dob","address"];
        const invalidFields=Object.keys(updates).filter(field=>!allowedFields.includes(field));
        if(invalidFields.length || Object.keys(updates).length===0){
            return res.status(400).json({message:"Provide valid student account or profile fields to update"});
        }
        for(const field of ["name","email","dob","address"]){
            if(Object.hasOwn(updates,field) && (typeof updates[field]!=="string" || !updates[field].trim())){
                return res.status(400).json({message:`${field} must be a non-empty string`});
            }
        }
        if(Object.hasOwn(updates,"age") && (!Number.isFinite(Number(updates.age)) || Number(updates.age)<0)){
            return res.status(400).json({message:"age must be a non-negative number"});
        }

        try{
            const result=await UserService.updateStudentDetails(req.params.id,updates);
            return res.status(200).json(result);
        }catch(err){
            if(err.code===11000){
                return res.status(409).json({message:"Email is already in use"});
            }
            return res.status(err.status || 500).json({message:err.message});
        }
    }
    async addUserProfile(req,res){
        try{
            const userId=req.user.id;
            const{age,dob,address}=req.body;
            if(!userId){
                return res.status(400).json({message:"User Id is required"});
            }

            const newUserProfile = await UserService.addUserProfile(userId,{age,dob,address});
            res.status(201).json(newUserProfile);
        }catch(err){
            if(err.code===11000){
                return res.status(409).json({message:"A profile for this user already exist"});
            }
            console.log(err);
            res.status(400).json({error:err.message});
        }
    }
    async softDeleteUser(req,res){
        if(!req.user || req.user.role !== "teacher"){
            return res.status(403).json({message:"Only teachers can delete users"});
        }

        try{
            const{id}=req.params
            const result =await UserService.softDeleteUser(id)
            return res.status(201).json({message:"User deleted successfully",data:result});

        }
    catch(err){
            return res.status(500).json({message:err.message})
        }
    }
}

module.exports= new UserController();