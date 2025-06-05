const express = require('express');
const Member = require('../../models/memberModel'); 
const userGroup = require('../../models/userGroupModel');
const cleanZone = require('../../models/cleanZoneModel'); 

const router = express.Router();

router.post('/makeCleanBoard', async(req,res)=>{
    console.log('makeCleanBoard에 접속함');
});

module.exports = router;