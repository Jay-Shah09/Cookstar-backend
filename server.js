require('dotenv').config();
const express=require('express');
const cors=require('cors');
const multer=require('multer');
const path=require('path');

const connectDB = require('./db/connect');
const recipesRouter = require('./routes/recipes');
const recipes = require('./models/recipes');
const authModal = require('./models/users');
const {verifyToken} = require('./authorization/auth');

const app = express();

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'../frontend/public')
    },
    filename:(req,file,cb)=>{
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
});

app.use(cors());

app.use(express.json());

// app.use(verifyToken);

const upload = multer({storage:storage,limits:{fieldSize:10*1024*1024}});

app.get('/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send("welcome Home");
});

app.post('/recipeData',[verifyToken,upload.single('imager')],function(req, res) {
    // console.log(req.file);
    // console.log(req.body);
    // console.log(req);
    console.log(req.headers['authorization']);
    
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
        image:req.file.filename,
        email:formdatas.email,
        temp_id:formdatas.temp_id
    });
    doc.save(function(err,result){
        if (err){
            console.log(err);
            res.status(200).send('success');
        }
        else{
            console.log(result)
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
        res.setHeader('Access-Control-Allow-Origin', '*');
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

// app.get('/getSaved',(req,res)=>{
//     res.send();
// })

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