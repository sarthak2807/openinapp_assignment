var router = require('express').Router()
const { getUserPriority } = require('../controllers/userController');

router.get('/:userId/priority', getUserPriority);

module.exports = router;
