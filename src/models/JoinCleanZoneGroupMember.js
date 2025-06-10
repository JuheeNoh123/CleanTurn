const db = require('../util/mysql')
module.exports = class cleanZoneGroupMember{
    constructor(cleanZone_id,joinGroupMember_id) {
        this.cleanZoneId = cleanZone_id;
        this.joinGroupMemberId = joinGroupMember_id;
    }
    // 특정 그룹 멤버(joinGroupMember_id)가 속한 청소 구역-그룹 멤버 관계 조회
    static async findByJoinGroupMemberId(joinGroupMember_id){
        return await db.execute(
            'select * from joincleanZoneGroupMember where joinGroupMember_id=?',
            [joinGroupMember_id]
        );
    }

    // 특정 청소 구역(cleanZone_id)에 속한 그룹 멤버 관계 조회
    static async findByCleanZoneId(cleanZone_id){
        const row= await db.execute(
            'select * from joincleanZoneGroupMember where cleanZone_id=?',
            [cleanZone_id]
        );
        return row[0];
    }

    // 특정 관계 ID로 조회
    static async findById(id){
        const row= await db.execute(
            'select * from joincleanZoneGroupMember where id=?',
            [id]
        );
        return row[0];
    }

    // 특정 관계 ID로 삭제
    static async deleteById(id){
        return await db.execute(
            'delete from joincleanZoneGroupMember where id=?',
            [id]
        );
    }

    // 인스턴스 멤버를 DB에 저장 (청소 구역과 그룹 멤버 관계 생성)
    async save(){
        return await db.execute(
            'insert into joincleanZoneGroupMember (joingroupmember_id, cleanzone_id) VALUES (?,?)',
            [this.joinGroupMemberId, this.cleanZoneId]
        );
    }

    // 청소 게시글(cleanBoard_id)에 청소 구역 이름 연결 저장
    static async saveJoinBoardGCZM(cleanBoard_id, cleanZoneName){
        return await db.execute(
            'insert into JoinBoardGCZM (cleanBoard_id, cleanZoneName) VALUES (?,?)',
            [cleanBoard_id, cleanZoneName]
        );
    }

    // 청소 게시글 ID로 청소 구역-게시글 관계 조회
    static async findJoinBoardGCZMByBoardId(cleanBoard_id){
        const row= await db.execute(
            'select * from JoinBoardGCZM where cleanBoard_id=?',
            [cleanBoard_id]
        );
        return row[0];
    }
}