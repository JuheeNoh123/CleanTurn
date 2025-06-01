const db = require('../util/mysql')
module.exports = class scheduleModel{
    static async save(joincleanzonegroupmember_id, repeatday){
        return await db.execute(
            'insert into schedule (joincleanzonegroupmember_id, repeatday) VALUES (?,?)',
            [joincleanzonegroupmember_id, repeatday]
        );
    }
}