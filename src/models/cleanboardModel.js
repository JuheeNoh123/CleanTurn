const db = require('../util/mysql')

module.exports = class cleanboard {
    //게시판 생성
    static async save(imageName, cleanTime, content, member_id) {
        return await db.execute(
            'insert into cleanboard (imageName, cleanTime, content, member_id) values (?,?,?,?)',
            [imageName, cleanTime, content, member_id]
        );
    }

    //게시판 조회
    static async findByAllcleanboard(cleanBoard_id) {

    }
}