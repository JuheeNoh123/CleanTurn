const express = require('express');
const Member = require('../../models/memberModel'); 
const cron = require("node-cron");
//const dayjs = require('dayjs');

const router = express.Router();

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

cron.schedule('0 0 * * *', async (req, res) => {
    try {
        const { id, email } = req.user;
        const today = dayjs().format('YYYY-MM-DD'); //오늘 날짜
        const todayDayIndex = dayjs().day(); //오늘 요일

    } catch {
        
    }
});

module.exports = router;