const db = require('../util/mysql')
module.exports = class CleanBoardModel{
    static async findByMemberId(member_id){
        const row =  await db.execute(
            'select * from cleanBoard where member_id=?',
            [member_id]
        );
        return row[0];
    }
}