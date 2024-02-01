var router = require('express').Router()
const { createSubTask, updateSubTask, deleteSubTask, getUserSubTasks } = require('../controllers/subTaskController');

router.post('/createSubTask/', createSubTask);
router.put('/updateSubTask/:subTaskId', updateSubTask);
router.delete('/deleteSubTask/:subTaskId', deleteSubTask);
router.get('/getUserSubTasks/', getUserSubTasks);

module.exports = router;
