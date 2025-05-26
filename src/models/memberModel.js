const db = require('../util/mysql')
const bcrypt = require('bcrypt');
module.exports = class Member {
    constructor(name,email,pw) {
        this.name = name;
        this.email = email;
        this.pw = pw;
    }

    async save() {
	    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(this.pw, 10); // 두 번째 매개변수는 salt의 자릿

    // INSERT INTO table-name : 지정 column-name 순 번으로, row-data를 생성합니다. 
	    return await db.execute(
            'INSERT INTO member (name, email, password, cleaningscore) VALUES (?, ?, ?, ?)',
            [this.name, this.email, hashedPassword, 100]
        );
    }

    // 이메일로 회원 조회 (로그인용)
    static async findByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM Member WHERE email = ?',
                [email]
            );
            if (rows.length === 0) {
                return null;
            }
            console.log(rows[0]);
            return rows[0];
        } catch (err) {
            console.error('DB error in findByEmail:', err);
            throw err;
        }
    }

    // static async findById(id){
    //     try{
    //         return await db.execute(
    //             'select * from member where id=?',
    //             [id]
    //         )
    //     }
    //     catch (err) {
    //         console.error('DB error in findById:', err);
    //         throw err;
    //     }
    // }
};
