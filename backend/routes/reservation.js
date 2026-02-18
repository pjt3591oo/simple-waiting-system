
const express = require('express');
const { tokenCheckMiddleware } = require('../middleware/token');

const router = express.Router();

router.get('/', tokenCheckMiddleware, function(req, res, next) {
  const user = req.user; 

  console.log('Authenticated user:', user);
  // res.render('index', { title: 'Express' });
  res.json({ message: 'Hello, World!', user });
});

module.exports = router;
