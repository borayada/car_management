const user=require("../models/userModel");
const asyncHandler=require("express-async-handler");
const {generateToken}=require("../config/jwtToken");
const {generateRefreshToken}=require("../config/refreshtoken");
const {isValidObjectId}=require("../utils/validatemongodbid");
const jwt = require('jsonwebtoken');
const crypto=require('crypto');
const {emailsender}=require('./emailCtrl');
const cloudinaryuploadImg=require("../utils/cloudinary");
const fs = require('fs');
const Order=require('../models/orderModel');

const createUser= asyncHandler(async(req,res)=>{
  console.log("1515");
   const email= req.body.email;
   const findUser= await user.findOne({email: email});
  
   if(!findUser){
      const newUser=user.create(req.body);
      res.json(newUser);
   }else{
      throw new Error("user already exists");
   }
  })
//login
  const loginUser= asyncHandler(async(req,res)=>{
   const { email, password } = req.body;

  const findUser=await user.findOne({email});
  if(findUser && (await findUser.comparePassword(password))){
    const refreshToken = await generateRefreshToken(findUser._id);
    const updateuser=await user.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken:refreshToken,
      },
      {new:true}
    );
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      maxAge:72*60*60*100,
    });
   res.json({
     id:findUser?._id,
      firstname:findUser?.firstname,
      lastname:findUser?.lastname,
      email:findUser?.email,
      mobile:findUser?.mobile,
      role:findUser?.role,
      profileImage:findUser?.profileImage,

      token:generateToken(findUser?._id),
   });
   }
  else{
   throw new Error("invallid credential");
  }
   
  });