const { verifyToken } = require('../utils/token');

const tokenCheckMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];


  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  const tokenValue = token.split(' ')[1]; //

  try {
    // 예시: JWT 검증
    const decoded = verifyToken(tokenValue);
    req.user = decoded; // 검증된 사용자 정보 저장

    next(); // 토큰이 유효하면 다음 미들웨어로 이동
  } catch (err) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = { tokenCheckMiddleware };