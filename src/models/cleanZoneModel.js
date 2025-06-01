const db = require('../util/mysql')
module.exports = class cleanZone{
    
    static async saveCleanZone(zoneName, group_id){
        return await db.execute(
            'insert into cleanzone (zoneName, group_id) values (?,?)',
            [zoneName, group_id]
        );
    }

    static async findByGroupId(group_id){
        const rows = await db.execute(
            'select * from cleanzone where group_id=?',
            [group_id]
        );
        return rows[0];
    }

    static async delete(group_id){
        return await db.execute(
            'delete from cleanzone where group_id=?',
            [group_id]
        );
    }
}