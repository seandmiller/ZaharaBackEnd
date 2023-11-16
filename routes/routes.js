const express = require('express');
const Model = require('../models/model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();
module.exports = router;

router.post('/post', async (req, res) => {
    
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


router.get('/getAll', async (req, res) => {
    try {
        const data = await Model.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


router.get('/get', async (req, res) => {
    try {
        const data = await Model.findOne({name:req.body.name});
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


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