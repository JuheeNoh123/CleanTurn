const db = require('../util/mysql')

module.exports = class cleanboard {
    static async save(imageName, cleanTime, content, member_id) {
        return await db.execute(
            'insert into cleanboard (imageName, cleanTime, content, member_id) values (?,?,?,?)',
            [imageName, cleanTime, content, member_id]
        )
    }
}