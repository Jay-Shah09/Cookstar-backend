const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  },()=>console.log('successfully connected'))
}

module.exports = connectDB