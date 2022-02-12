const jwt = require('jsonwebtoken');

function verifyToken(req,res,next){
    const bearerHeader = req.headers['authorization'];
    const bearer = bearerHeader && bearerHeader.split(' ')[1];
    if(bearer==null){return res.status(401).send('UnAuthorizeddd');}
      jwt.verify(bearer,'secretkey',(err,authData)=>{
        if(err){return res.status(401).send('UnAuthorized');}
        else{
          console.log(authData);
          req.auth = authData;
          next();
        }
});
}

module.exports = {verifyToken};