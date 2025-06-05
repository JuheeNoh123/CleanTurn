const db = require('../util/mysql')
module.exports = class scheduleModel{
    static async save(joincleanzonegroupmember_id, repeatday){
        return await db.execute(
            'insert into schedule (joincleanzonegroupmember_id, repeatday) VALUES (?,?)',
            [joincleanzonegroupmember_id, repeatday]
        );
    }

    static async findByGCZMAndDay(joincleanzonegroupmember_id){
        const row =  await db.execute(
            'select * from schedule where joincleanzonegroupmember_id=?',
            [joincleanzonegroupmember_id]
        );
        return row[0];
    }

    static async deleteByJoinGCZMId(joincleanzonegroupmember_id){
        const row =  await db.execute(
            'delete from schedule where joincleanzonegroupmember_id=?',
            [joincleanzonegroupmember_id]
        );
        return row[0];
    }

    static async getAllByDay(day){
        const row =  await db.execute(
            'select * from schedule where repeatday=?',
            [day]
        );
        return row[0];
    }
}