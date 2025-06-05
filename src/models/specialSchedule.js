const db = require('../util/mysql')
module.exports = class specialScheduleModel{
    static async save(joincleanzonegroupmember_id, cleanDate){
        return await db.execute(
            'insert into specialSchedule (joincleanzonegroupmember_id, cleandate) VALUES (?,?)',
            [joincleanzonegroupmember_id, cleanDate]
        );
    }

    static async findByDate(date){
        const row = await db.execute(
            'select * from specialSchedule where cleanDate=?',
            [date]
        );
        return row[0];
    }

    static async deleteByJoinGCZMId(joincleanzonegroupmember_id){
        const row =  await db.execute(
            'delete from specialSchedule where joincleanzonegroupmember_id=?',
            [joincleanzonegroupmember_id]
        );
        return row[0];
    }

    static async getAllByDate(cleanDate){
        const row =  await db.execute(
            'select * from specialschedule where cleanDate=?',
            [cleanDate]
        );
        return row[0];
    }
}