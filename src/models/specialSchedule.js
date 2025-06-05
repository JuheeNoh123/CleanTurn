const db = require('../util/mysql')
module.exports = class specialScheduleModel{
    static async save(joincleanzonegroupmember_id, cleanDate){
        return await db.execute(
            'insert into specialSchedule (joincleanzonegroupmember_id, cleandate) VALUES (?,?)',
            [joincleanzonegroupmember_id, cleanDate]
        );
    }
}