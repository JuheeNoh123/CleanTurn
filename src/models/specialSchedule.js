const db = require('../util/mysql')
module.exports = class specialScheduleModel{

    // 특수일정 저장
    static async save(joincleanzonegroupmember_id, cleanDate){
        return await db.execute(
            'insert into specialSchedule (joincleanzonegroupmember_id, cleandate) VALUES (?,?)',
            [joincleanzonegroupmember_id, cleanDate]
        );
    }

    // 특정 날짜의 특수일정 전체 조회
    static async findByDate(date){
        const row = await db.execute(
            'select * from specialSchedule where cleanDate=?',
            [date]
        );
        return row[0];
    }

    // 특정 날짜 + 사용자로 특수일정 조회
    static async findByDateAndJGCZM(date, jgczm_id){
        const row = await db.execute(
            'select * from specialSchedule where cleanDate=? and joinCleanZoneGroupMember_id=?',
            [date,jgczm_id]
        );
        return row[0];
    }


    // 특정 구성원의 특수일정 전체 삭제
    static async deleteByJoinGCZMId(joincleanzonegroupmember_id){
        const row =  await db.execute(
            'delete from specialSchedule where joincleanzonegroupmember_id=?',
            [joincleanzonegroupmember_id]
        );
        return row[0];
    }

    // 특정 날짜의 모든 특수일정 가져오기
    static async getAllByDate(cleanDate){
        const row =  await db.execute(
            'select * from specialschedule where cleanDate=?',
            [cleanDate]
        );
        return row[0];
    }
}