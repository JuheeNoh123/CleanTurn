// multer 설정 (파일 업로드)
const multer = require('multer');
const path = require('path');
const uploadDir = 'uploads';

// 저장소 설정: 파일 저장 경로 및 파일명 구성
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);// uploads 폴더에 저장
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // 확장자 추출
    cb(null, file.fieldname + '-' + uniqueSuffix + ext); // 예: image-172839128.png
  },
});

const upload = multer({ storage });

module.exports = upload;