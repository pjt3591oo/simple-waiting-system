const redisClient = require('./utils/redis');
const { generateToken } = require('./utils/token');
const WAITING_LIST_KEY = 'waitingList';

let isProcessing = false;

const TIMER_INTERVAL = 10000; // 1.5초마다 실행  
const PROCESSING_COUNT = 1; // 한 번에 처리할 웨이팅 수
const TOKEN_KEY = 'wating-token';

async function processWaitingList() {
  if (isProcessing) return; // 이미 처리 중이면 중복 실행 방지
  isProcessing = true;

  try {
    // 여기에 웨이팅 리스트 처리 로직을 구현하세요.
    console.log('웨이팅 리스트 처리 시작');
    
    // 예시: Redis에서 웨이팅 리스트를 가져와서 처리
    const waitings = await redisClient.zrange(WAITING_LIST_KEY, 0, -1);
    
    for await (const userId of waitings.slice(0, PROCESSING_COUNT)) {
      console.log(`처리 중인 유저: ${userId}`);
      // 실제 처리 로직을 여기에 구현하세요 (예: DB 업데이트, 알림 발송 등)
      const token = await generateToken({ userId }); // 예시로 토큰 생성
      console.log(`생성된 토큰: ${token}`);
      // 처리 완료 후 웨이팅 리스트에서 제거
      await redisClient.zrem(WAITING_LIST_KEY, userId);

      await redisClient.hset(TOKEN_KEY, userId, token); // 토큰 저장 (예시)
    }
    
    console.log('웨이팅 리스트 처리 완료');
  } catch (err) {
    console.error('웨이팅 리스트 처리 중 오류 발생:', err);
  } finally {
    isProcessing = false; // 처리 완료 후 플래그 초기화ㅁ
  }
}

setInterval(processWaitingList, TIMER_INTERVAL);