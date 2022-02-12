// const recipes = require('../models/recipes');
// const authModel = require('../models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const recipeData=mongoose.createConnection('mongodb+srv://smit-admin:555admin@cluster0.12u2y.mongodb.net/RecipeData',{useNewUrlParser:true,useUnifiedTopology:true});
const recipeSchema= new mongoose.Schema({
recipetitle:String,
recipeContent:String,
recipeOrigin:String,
serves:Number,  
_id:String,
email:String,
cooktime:String,
username:String,
ingrid:[String],
steps:[String],
image:String,
like:[{type:String}],
bookmark:[{type:String}]
});

const authSchema=new mongoose.Schema({
    username:{type:String},
    email:{type:String},
    password:{type:String},
    location:{type:String},
    bio:{type:String}
    // cpassword:{type:String,required:true}
});

const  authModel=recipeData.model('auth',authSchema);
const models =  recipeData.model('recipes',recipeSchema);

const showRecipes = (req, res) => {
    models.find(function(err,result){
    res.send(result);
   });
}

const showSingleRecipe = (req, res) => {
    const id = req.query.ids;
    console.log(id);
    models.find({_id:id}, function (err, result) {
        if(err){
            res.send(err);
        }
        else{ 
            res.setHeader('Access-Control-Allow-Origin', '*');
            console.log(result);
            res.send(result);
        }
    });
 }

const updateProfile = (req,res) => {
    console.log(req.body);
    authModel.findOne({email:req.body.email},function(err,result){
        if(result){
            res.status(403).send('Email Already Exists')      
        }
        else{
            updatee(req,res);
        }
    });
}

const updatee = async(req,res) => {
    const userData = await authModel.findOneAndUpdate({_id:req.body.id},req.body,{
        new:true,
        runValidators:true
    });

    const recipeData = await models.updateMany({email:req.body.old_email},req.body,{
        new:true,
        runValidators:true
    });
    //console.log(userData);
    console.log(recipeData);
    res.send(userData);
}
    


const registerUser = (req,res) => {  
    //if((req.body.username).length>7){return res.status(403).send('Username Should be less than 7')}
        authModel.findOne({email:req.body.email},function(err,result){
        if(result){
            res.status(403).send('Email Already Exists')      
        }
        else{                                    
            if((req.body.password === req.body.cpassword)){   
                bcrypt.hash(req.body.password,10,(err,hash)=>{
                    const doc=new authModel({
                        username:req.body.username,
                        email:req.body.email,
                        password:hash,
                        location:req.body.location,
                        bio:req.body.bio
                    });
                    doc.save(function(err,result){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.send('Success');
                            console.log(result);
                        }
                    });
                });
            }
            else{
                res.status(403).send('Password Didnt Matched');
            }
        }
    });
}

const loginUser = (req,res)=>{
    try{ 
        const emails=req.body.email;
        const pass=req.body.password;
        authModel.findOne({email:emails}, function(err, result){
            if(result)
            {
                bcrypt.compare(pass,result.password,function(errr,ress)
                {
                    if(ress){
                        jwt.sign({email:emails,username:result.username},'secretkey',function(err,token){
                                if(err){console.log(err);}
                                else{
                                   res.send({token:token,username:result.username,email:result.email});
                                }
                        });                        
                    }
                    else{
                        res.status(403).send('User not registered');
                    }
                });
            }
            else{
                res.status(403).send('User not registered');
            }
        });
    }
    catch(err){
        res.status(400).send(err);
    }
}

module.exports = {
    showRecipes,
    showSingleRecipe,
    updateProfile,
    registerUser,
    loginUser,
}
