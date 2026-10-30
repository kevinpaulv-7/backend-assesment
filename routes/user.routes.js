const express=require('express')
const router=express.Router();
const UserController=require('../controllers/user.controllers')
const auth = require('../middleware/auth.middleware')

router.post('/signup',UserController.signup);
router.post('/login',UserController.login);
router.get('/getAllUsers',auth,UserController.getAllUsers)
router.get('/get/students',auth,UserController.getAllStudents.bind(UserController))
router.get('/get/teachers',auth,UserController.getAllTeachers.bind(UserController))
router.patch('/me',auth,UserController.updateMyDetails)
router.patch('/students/:id',auth,UserController.updateStudentDetails)
router.post('/newprofile',auth,UserController.addUserProfile)
router.delete('/softDelete/:id',auth,UserController.softDeleteUser)

module.exports=router