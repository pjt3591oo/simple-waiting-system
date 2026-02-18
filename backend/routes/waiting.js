const express = require('express');
const redisClient = require('../utils/redis');

const router = express.Router();


const NEXT_PROCESSING_COUNT = 1;
const WAITING_LIST_KEY = 'waitingList';
const WAITING_TOKEN_KEY = 'wating-token';

// 웨이팅 체크
router.get('/check', async function(req, res, next) {
  const { userId } = req.query;
  
  try {
    const rank = await redisClient.zrank(WAITING_LIST_KEY, userId);
    const totalCount = await redisClient.zcard(WAITING_LIST_KEY);
    const token = await redisClient.hget(WAITING_TOKEN_KEY, userId);
    
    if (rank === null && !token) {
      return res.status(404).json({ message: '유저가 웨이팅 리스트에 없습니다.' });
    }

    let estimatedWaitTime = null;
    try {
      const metrics = await redisClient.hgetall('processing_metrics');
      console.log(metrics)
      if (metrics && metrics.last_processed_count && metrics.interval_seconds && rank !== null) {
        const lastProcessedCount = parseInt(metrics.last_processed_count, 10);
        const intervalSeconds = parseInt(metrics.interval_seconds, 10);

        if (lastProcessedCount > 0) {
          const timePerUser = intervalSeconds / lastProcessedCount;
          estimatedWaitTime = Math.round(rank * timePerUser);
        }
      }
    } catch (metricError) {
      console.error('Could not calculate estimated wait time:', metricError);
      // Fail silently and just don't return an estimate
    }

    res.json({ 
      rank, 
      totalCount, 
      token, 
      processingCount: NEXT_PROCESSING_COUNT,
      estimatedWaitTime, // in seconds
    });
    
  } catch (err) {
    return res.status(500).json({ message: '웨이팅 체크 실패', error: err.message });
  }
});


// 웨이팅 등록
router.post('/add', async function(req, res, next) {
  const { userId } = req.body;

  const result = await redisClient.zrank(WAITING_LIST_KEY, userId);
  
  if (result !== null) {
    return res.status(400).json({ message: '이미 웨이팅 리스트에 등록된 유저입니다.' });
  } 

  try {
    const result = await redisClient.zadd(WAITING_LIST_KEY, Date.now(), userId);
  } catch (err) {
    return res.status(500).json({ message: '웨이팅 등록 실패', error: err.message });
  }
  
  res.status(201).json({ message: '웨이팅 등록 성공' });
});

module.exports = router;
