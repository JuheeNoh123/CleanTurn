const db = require('../util/mysql')
module.exports = class scheduleModel{
    static async save(joincleanzonegroupmember_id, cleanDate){
        return await db.execute(
            'insert into schedule (joincleanzonegroupmember_id, cleanDate) VALUES (?,?)',
            [joincleanzonegroupmember_id, cleanDate]
        );
    }
}