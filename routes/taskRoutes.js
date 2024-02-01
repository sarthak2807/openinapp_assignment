var router = require('express').Router()
// const router = require('router');

const { createTask, updateTask, deleteTask, getUserTasks } = require('../controllers/taskController');

router.post('/api/createTask', createTask);
router.put('/updateTask/:taskId', updateTask);
router.delete('/deleteTask/:taskId', deleteTask);
router.get('/getUserTasks/', getUserTasks);

module.exports = router;
