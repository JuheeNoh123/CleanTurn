const db = require('../util/mysql')

module.exports = class userGroup{
    constructor(title){
        this.title = title;
    }

    // 유저 그룹 저장
    async saveUserGroup(){
        return await db.execute(
            'INSERT INTO usergroup (title) VALUES (?)',
            [this.title]
        );
    }

    // 그룹 제목으로 조회
    static async findBytitle(title){
        const [rows] =  await db.execute(
            'select * from usergroup where title= ? ',
            [title]
        );
        return rows[0];
    }

    // 그룹 ID로 조회
    static async findById(id){
        const [rows] =  await db.execute(
            'select * from usergroup where id = ? ',
            [id]
        );
        return rows[0];
    }

    // 그룹 ID로 제목 수정
    static async updateById(title, id){
        const [rows] =  await db.execute(
            'update usergroup set title = ? where id = ? ',
            [title,id]
        );
        return rows[0];
    }
    
    
}


