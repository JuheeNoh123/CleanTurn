const express = require('express');
const sendEmail = require('../../util/sendmail');
const router = express.Router();
function getTodayDate() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
}
cron.schedule('0 9 * * *', async () => {
    const today = getTodayDate();
    
});
module.exports = router;