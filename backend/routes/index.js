const express = require('express');
const router = express.Router();

router.use('/waiting', require('./waiting'));
router.use('/reservation', require('./reservation'));

module.exports = router;
