const express = require('express');
const router = express.Router();
const Member = require('../../models/memberModel'); 
router.get('/',async(req,res)=>{
    const{id, email} = req.user;
    const user = await Member.findByEmail(email);
    
    return res.status(200).send({
        id: id,
        name: user.name,
        email: email,
        cleanScore: user.cleaningScore
    });
});
module.exports = router;