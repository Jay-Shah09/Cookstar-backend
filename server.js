require('dotenv').config();
const express=require('express');
const cors=require('cors');
const cloudinary=require('cloudinary');
const multer=require('multer');
const path=require('path');

const connectDB = require('./db/connect');
const recipesRouter = require('./routes/recipes');
const recipes = require('./models/recipes');
const authModal = require('./models/users');
const {verifyToken} = require('./authorization/auth');

const app = express();

app.use(cors());

app.use(express.json());

// app.use(verifyToken);

cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME ,
    api_key:process.env.API_KEY , 
    api_secret: process.env.API_SECRET 
});

const storage = multer.diskStorage({});
const upload=multer({storage:storage,limits:{fieldSize:10*1024*1024},fileFilter:(req,file,cb)=>{
    let ext=path.extname(file.originalname);
    console.log('====================================');
    console.log(ext);
    console.log('====================================');
    if(ext!=='.jpg' && ext!=='.png' && ext!=='.jpeg')
    {
        cb(new Error('File Type Not Supported'),false);
        return;
    }
    cb(null,true);
}});
// const upload = multer({storage:storage,limits:{fieldSize:10*1024*1024}});

app.get('/', function(req, res) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.send("welcome Home");
});

app.post('/recipeData',[verifyToken,upload.single('imager')],async function(req, res) {
    // console.log(req.file);
    // console.log(req.body);
    // console.log(req);
    console.log(req.headers['authorization']);
    const result= await cloudinary.uploader.upload(req.file.path);
    const formdatas=req.body;

    const doc=new recipes({
        recipetitle: formdatas.recipetitle,
        recipeContent:formdatas.recipecontent,
        recipeOrigin:formdatas.recipeorigin,
        serves:formdatas.serves,
        cooktime:formdatas.cooktime,
        ingrid:formdatas.ings,
        steps:formdatas.steps,
        username:req.auth.username,
        _id:Math.random()*5,
        image:result.secure_url,
        email:formdatas.email,
        temp_id:formdatas.temp_id
    });
    doc.save(function(err,result){
        if (err){
            console.log(err);
        }
        else{
            console.log(result)
            res.status(200).send('success');
        }
    });
});

app.use(recipesRouter);

app.get('/me',verifyToken,(req,res) => {
        recipes.find({email:req.auth.email},function(err,result){
            console.log(result);
        res.send(result);
    });
});

app.get('/info',(req,res)=>{
    const id = req.query.emails;
    recipes.find({email:id}, function (err, result){
     if(err){
        res.send(err);
     }
     else{ 
        //res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(result);
     }
 });
})

app.post('/getUser',(req,res) => {
    //console.log(req.body);
        authModal.find({email:req.body.email},function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});

app.put('/recipeData/like',verifyToken,function(req,res){
    recipes.findByIdAndUpdate(req.body.id,
        {
            $push:{like:req.body.email}
        },
        {
            new:true
        }).exec((err,result)=>{
            if(err){return res.status(422).json({error:err})}
            else{return res.json(result)}
        }
    )
});
    
app.put('/recipeData/dislike',verifyToken,function(req,res){
    recipes.findByIdAndUpdate(req.body.id,
        {
            $pull:{like:req.body.email}
        },
        {
            new:true
        }).exec((err,result)=>{
            if(err){return res.status(422).json({error:err})}
            else{return res.send(result)}
        }   
    )   
});

app.put('/recipeData/bookmark',verifyToken,function(req,res){
    recipes.findByIdAndUpdate(req.body.id,
        {
            $push:{bookmark:req.body.email}
        },
        {
            new:true
        }).exec((err,result)=>{
            if(err){return res.status(422).json({error:err})}
            else{return res.send(result)}
        }
    ) 
});

app.put('/recipeData/unbookmark',verifyToken,function(req,res){
    recipes.findByIdAndUpdate(req.body.id,
        {
            $pull:{bookmark:req.body.email}
        },
        {
            new:true
        }).exec((err,result)=>{
            if(err){return res.status(422).json({error:err})}
            else{return res.send(result)}
        }
    ) 
});

const start = async() => {
    try {
        await connectDB('mongodb+srv://smit-admin:555admin@cluster0.12u2y.mongodb.net/RecipeData');
        app.listen(3001,console.log(`server is listening on port : 3001`));
    } 
    catch (error) {
        console.log(error);   
    }
}
start();