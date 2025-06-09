const db = require('../util/mysql')
module.exports = class scheduleModel{

    // 반복 일정 저장
    static async save(joincleanzonegroupmember_id, repeatday){
        return await db.execute(
            'insert into schedule (joincleanzonegroupmember_id, repeatday) VALUES (?,?)',
            [joincleanzonegroupmember_id, repeatday]
        );
    }

    // 특정 구성원의 모든 반복 일정 조회
    static async findByGCZM(joincleanzonegroupmember_id){
        const row =  await db.execute(
            'select * from schedule where joincleanzonegroupmember_id=?',
            [joincleanzonegroupmember_id]
        );
        return row[0];
    }

    // 특정 구성원의 특정 요일 반복 일정 조회
    static async findByGCZMAndDay(joincleanzonegroupmember_id, repeatDay){
        const row =  await db.execute(
            'select * from schedule where joincleanzonegroupmember_id=? and repeatDay = ?',
            [joincleanzonegroupmember_id,repeatDay]
        );
        return row[0];
    }

    // 특정 구성원의 반복 일정 삭제
    static async deleteByJoinGCZMId(joincleanzonegroupmember_id){
        const row =  await db.execute(
            'delete from schedule where joincleanzonegroupmember_id=?',
            [joincleanzonegroupmember_id]
        );
        return row[0];
    }

    // 특정 요일의 반복 일정 전체 조회
    static async getAllByDay(day){
        const row =  await db.execute(
            'select * from schedule where repeatday=?',
            [day]
        );
        return row[0];
    }
}