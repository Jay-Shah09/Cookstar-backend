const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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

module.exports = mongoose.model('recipes',schema);