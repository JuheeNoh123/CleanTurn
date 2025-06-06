const db = require('../util/mysql')

module.exports = class feedback {
    //피드백 작성
    static async saveUserFeedback(member_id, cleanBoard_id, content) {
        return await db.execute(
            'insert into feedback (member_id, cleanBoard_id, content) values (?, ?, ?)',
            [member_id, cleanBoard_id, content]
        );
    }

    //피드백 조회
    static async findByAllFeedback(cleanBoard_id) {
        const rows = await db.execute(
            'select * from feedback where cleanBoard_id = ?',
            [cleanBoard_id]
        );
        return rows[0];
    }
}
