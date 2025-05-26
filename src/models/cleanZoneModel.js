const db = require('../util/mysql')
module.exports = class cleanZone{
    
    static async saveCleanZone(zoneName, group_id){
        return await db.execute(
            'insert into cleanzone (zoneName, group_id) values (?,?)',
            [zoneName, group_id]
        )
    }
}