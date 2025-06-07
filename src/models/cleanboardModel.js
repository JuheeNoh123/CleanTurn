const db = require('../util/mysql')

module.exports = class CleanBoardModel{
    static async findByMemberId(member_id){
        const row =  await db.execute(
            'select * from cleanBoard where member_id=?',
            [member_id]
        );
        return row[0];
    }

    static async findByMemberIdAndGroupId(member_id, group_id){
        const row =  await db.execute(
            'select * from cleanBoard where member_id=? and usergroup_id=?',
            [member_id,group_id]
        );
        return row[0];
    }

    static async save(cleanTime, content, member_id, group_id) {
        return await db.execute(
            'insert into cleanboard (cleanTime, content, member_id, usergroup_id) values (?,?,?,?)',
            [cleanTime, content, member_id,group_id]
        )

    }

    static async saveImage(cleanBoardId, image) {
        return await db.execute(
            'insert into cleanBoardImage (board_id, imageName) values (?,?)',
            [cleanBoardId,image]
        )

    }

    static async findImageByBoardId(cleanBoardId) {
        const row= await db.execute(
            'select * from cleanBoardImage where board_id=?',
            [cleanBoardId]
        );
        return row[0];
    }

    static async findByGroupIdAndDate(group_id, start,end){
        const row =  await db.execute(
            'SELECT * FROM cleanBoard WHERE usergroup_id=? AND created_at BETWEEN ? AND ?',
            [group_id,start,end]
        );
        return row[0];
    }
}