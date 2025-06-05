const db = require('../util/mysql')

module.exports = class Feedback {
    
    async saveUserFeedback() {
        return await db.execute(
        'insert into feedback (id, member_id, cleanBoard_id, content) values (?,?,?,?)',
        [id, member_id, cleanBoard_id, content]
        );
    }
}