const db = require('../util/mysql')

module.exports = class JoinGroupMember{
    static async saveJoinGroupMember(groupId, memberId){
        return await db.execute(
            'INSERT INTO joingroupmember (group_id, member_id) VALUES (?,?)',
            [groupId, memberId]
        );
    }

    static async findAllByUserId(member_id){
        const [rows] = await db.execute(
                'SELECT * FROM joingroupmember WHERE member_id = ?',
                [member_id]
            );

        return rows;
    }

    static async findByGroupId(group_id){
        return await db.execute(
                'SELECT * FROM joingroupmember WHERE group_id = ?',
                [group_id]
            );
    }

    static async deleteById(id){
        return await db.execute(
            'delete from joingroupmember where id=?',
            [id]
        );
    }
}

