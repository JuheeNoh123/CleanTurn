const db = require('../util/mysql')

module.exports = class CleanBoardModel{
    // 특정 회원의 청소 게시글 모두 조회
    static async findByMemberId(member_id){
        const row =  await db.execute(
            'select * from cleanBoard where member_id=?',
            [member_id]
        );
        return row[0];
    }

    // 특정 회원이 특정 그룹에 작성한 청소 게시글 조회
    static async findByMemberIdAndGroupId(member_id, group_id){
        const row =  await db.execute(
            'select * from cleanBoard where member_id=? and usergroup_id=?',
            [member_id,group_id]
        );
        return row[0];
    }

    // 새로운 청소 게시글 저장
    static async save(cleanTime, content, member_id, group_id) {
        return await db.execute(
            'insert into cleanboard (cleanTime, content, member_id, usergroup_id) values (?,?,?,?)',
            [cleanTime, content, member_id,group_id]
        )

    }

    // 청소 게시글에 이미지 저장
    static async saveImage(cleanBoardId, image) {
        return await db.execute(
            'insert into cleanBoardImage (board_id, imageName) values (?,?)',
            [cleanBoardId,image]
        )

    }

    // 게시글 ID로 이미지 조회
    static async findImageByBoardId(cleanBoardId) {
        const row= await db.execute(
            'select * from cleanBoardImage where board_id=?',
            [cleanBoardId]
        );
        return row[0];
    }

    // 특정 그룹에서 특정 기간 내 작성된 청소 게시글 조회
    static async findByGroupIdAndDate(group_id, start,end){
        const row =  await db.execute(
            'SELECT * FROM cleanBoard WHERE usergroup_id=? AND created_at BETWEEN ? AND ?',
            [group_id,start,end]
        );
        return row[0];
    }

    // 모든 청소 게시글 조회
    static async getAll(){
        const row = await db.execute('SELECT * FROM cleanBoard');
        return row[0];
    }
}