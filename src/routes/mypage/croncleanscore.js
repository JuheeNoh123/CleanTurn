const cron = require('node-cron');
const router = express.Router();
cron.schedule('0 0 * * *', async () => {

},{
    timezone: "Asia/Seoul"
});

module.exports = router;