const express = require('express');
const Model = require('../models/model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const EnigmaEncrypt = require('../enigma');
const cryptico = require('cryptico');
require('dotenv').config();
const router = express.Router();
module.exports = router;

var RSAkey = cryptico.generateRSAKey(process.env.PASS_PHRASE, parseInt(process.env.BITS));



router.post('/signup', async (req, res) => {
    
    const data = new Model({
        name: req.body.name,
        password: req.body.password,
        symptoms: req.body.symptoms
    });
     data.setPassword(req.body.password)

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)         
    }
      catch (error) {
        res.status(400).json({message: error.message})
    }
})


// router.get('/getAll', async (req, res) => {
//     try {
//         const data = await Model.find();
//         res.json(data)
//     }
//     catch(error){
//         res.status(500).json({message: error.message})
//     }
// })


// router.get('/get', async (req, res) => {
//     try {
//         const data = await Model.findOne({name:req.body.name});
//         res.json(data)
//     }
//     catch(error){
//         res.status(500).json({message: error.message})
//     }
// })


router.post('/login', async (req, res) => {
    async function getUser(obj) {
      const user = await  Model.findOne(obj);
      return user
    }
    getUser({name:req.body.name}).then(function(theUser){
        if (theUser) {
            const reqHash = crypto.pbkdf2Sync(req.body.password, theUser.salt, 1000, 64, `sha512`).toString(`hex`)
            if (theUser.hash === reqHash) {
                const accessToken = jwt.sign(theUser.toJSON(), process.env.ACCESS_TOKEN_SECRET); 
                res.json({ userData:theUser , accessToken })
               
                return
            }
            if (theUser.hash !== reqHash) {
                res.status(400).json({'invalid': 'password'})
                return
            }

        }
        res.status(400).json({"error":'User not found'})
    }) 



})


router.patch('/update/:name', authenticateToken, async (req, res) => {

 const user = await Model.findOneAndUpdate({name:req.params.name}, {symptoms: req.body.symptoms} )
 if (user) {
     res.send(user);
    return;

 }
res.send('failed to update')
 
})

router.patch('/messages', authenticateToken, async (req, res) => {
    
    const encrypt = req.body.encrypt
    let cycles = 0;
    var PublicKeyString = await cryptico.publicKeyString(RSAkey);
  
    
    
    if (encrypt === true) {
    const user = await Model.findOne({name:req.body.name})
    if (user)    {
    var msgBody = req.body.messages
    for (let i = 0; i < msgBody.length; i++) {
        console.log('before enigma')
        msgBody[i].content = new EnigmaEncrypt(msgBody[i].content, [1,2,3], cycles).enigma();
        cycles = msgBody[i].content.length;
        console.log('hello')
        msgBody[i].content = await cryptico.encrypt(msgBody[i].content, PublicKeyString).cipher
        console.log('there')}

    const userMessage = await Model.findOneAndUpdate({name:req.body.name}, {messages: msgBody} );
    res.send(userMessage.messages);
    return;
 }
   res.send("Unable to find user");
   return;

 }


   if (encrypt === false) {
    const user = await Model.findOne({name:req.body.name})
    if (user) {
        var msgBody = user.messages;
        
        for (let i = 0; i < msgBody.length; i++) {
            
            msgBody[i].content = cryptico.decrypt(msgBody[i].content, RSAkey).plaintext
           
            
            msgBody[i].content = new EnigmaEncrypt(msgBody[i].content, [1,2,3], cycles).enigma().toLocaleLowerCase();
            cycles = msgBody[i].content.length
        }

        res.send(msgBody);
        return;
    }

    res.send('failed to find user')
    return ;
   }



   })


router.delete('/delete/:name', authenticateToken, async (req, res) => {

    try {
        const data = await Model.findOneAndDelete({name:req.params.name})
        res.send(data.name)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
    
})

function authenticateToken(req,res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {return res.sendStatus(401)}

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user
        next()

    })

}