const db = require('../util/mysql')

module.exports = class JoinGroupMember{
    
    // 그룹과 사용자 연결 저장
    static async saveJoinGroupMember(groupId, memberId){
        return await db.execute(
            'INSERT INTO joingroupmember (group_id, member_id) VALUES (?,?)',
            [groupId, memberId]
        );
    }

    // 사용자 ID로 속한 그룹 전체 조회
    static async findAllByUserId(member_id){
        const [rows] = await db.execute(
                'SELECT * FROM joingroupmember WHERE member_id = ?',
                [member_id]
            );

        return rows;
    }

    // 그룹 ID로 해당 그룹의 멤버 조회
    static async findByGroupId(group_id){
        return await db.execute(
                'SELECT * FROM joingroupmember WHERE group_id = ?',
                [group_id]
            );
    }

    // 그룹 ID + 사용자 ID로 데이터 조회
    static async findByGroupAndMemberId(group_id,member_id){
        const row= await db.execute(
                'SELECT * FROM joingroupmember WHERE group_id = ? and member_id=?',
                [group_id,member_id]
            );
        return row[0];
    }

    // ID로 단일 데이터 조회
    static async findById(id){
        const row= await db.execute(
                'SELECT * FROM joingroupmember WHERE id=?',
                [id]
            );
        return row[0];
    }


    // ID로 삭제
    static async deleteById(id){
        return await db.execute(
            'delete from joingroupmember where id=?',
            [id]
        );
    }

    
}

