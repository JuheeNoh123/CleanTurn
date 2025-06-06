const db = require('../util/mysql')
module.exports = class cleanZone{
    
    static async saveCleanZone(zoneName, group_id){
        return await db.execute(
            'insert into cleanzone (zoneName, group_id) values (?,?)',
            [zoneName, group_id]
        );
        //insert의 경우 값은 넣어주는거라 상관X
        //쿼리분 실행 결과, 해당 테이블 정보가 같이 출력됨
    }

    static async findByGroupId(group_id){
        const rows = await db.execute(
            'select * from cleanzone where group_id=?',
            [group_id]
        );
        return rows[0];
        //select의 경우 조회가 목적이라 필요한 값만 가지고 오기위해 배열에 넣고 첫번째 값만 가지고온다.
        
    }

    static async findById(id){
        const rows = await db.execute(
            'select * from cleanzone where id=?',
            [id]
        );
        return rows[0][0];
    }

    static async delete(group_id){
        return await db.execute(
            'delete from cleanzone where group_id=?',
            [group_id]
        );
    }
}