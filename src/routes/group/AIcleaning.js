const express = require('express');
const router = express.Router();
const { callGPT } = require('../gpt/gpt');
const { callAI } = require('../gpt/cohere');
router.get('/AIcleanlist',async(req,res)=>{
    const response = await callAI();
    if(response){
        const str = response.content;
        const areas = str.split(', ');
        res.status(200).send(areas);
    }else{
        res.status(500).json({'error':'Failed to get response from ChatGPT API'});
    }
});
module.exports = router;