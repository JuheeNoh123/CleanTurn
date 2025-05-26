const db = require('../util/mysql')
class userGroup{
    constructor(title){
        this.title = title;
    }

    async saveUserGroup(){
        return await db.execute(
            'INSERT INTO usergroup (title) VALUES (?)',
            [this.title]
        );
    }

    static async findBytitle(title){
        const [rows] =  await db.execute(
            'select * from usergroup where title= ? ',
            [title]
        );
        return rows[0];
    }
    
}

class JoinGroupMember{
    static async saveJoinGroupMember(groupId, memberId){
        return await db.execute(
            'INSERT INTO joingroupmember (group_id, member_id) VALUES (?,?)',
            [groupId, memberId]
        );
    }

    
}

module.exports = { userGroup, JoinGroupMember };