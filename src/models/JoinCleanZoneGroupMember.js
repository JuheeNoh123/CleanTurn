const db = require('../util/mysql')
module.exports = class cleanZoneGroupMember{
    constructor(cleanZone_id,joinGroupMember_id) {
        this.cleanZoneId = cleanZone_id;
        this.joinGroupMemberId = joinGroupMember_id;
    }
    static async findByJoinGroupMemberId(joinGroupMember_id){
        return await db.execute(
            'select * from joincleanZoneGroupMember where joinGroupMember_id=?',
            [joinGroupMember_id]
        );
    }

    static async findByCleanZoneId(cleanZone_id){
        const row= await db.execute(
            'select * from joincleanZoneGroupMember where cleanZone_id=?',
            [cleanZone_id]
        );
        return row[0];
    }

    static async deleteById(id){
        return await db.execute(
            'delete from joincleanZoneGroupMember where id=?',
            [id]
        );
    }

    async save(){
        return await db.execute(
            'insert into joincleanZoneGroupMember (joingroupmember_id, cleanzone_id) VALUES (?,?)',
            [this.joinGroupMemberId, this.cleanZoneId]
        );
    }
}