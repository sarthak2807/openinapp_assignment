const Task = require('../models/task');
const SubTask = require('../models/subTask');

const jwt = require('jsonwebtoken');

const secretKey = '1234'; 

// Function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
};

// Create SubTask
exports.createSubTask = async (req, res) => {
  const { task_id } = req.body;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const task = await Task.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subTask = await SubTask.create({
      task_id,
      status: '0', // Default status
    });

    return res.status(201).json(subTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update SubTask
exports.updateSubTask = async (req, res) => {
  const { subTaskId } = req.params;
  const { status } = req.body;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const subTask = await SubTask.findByPk(subTaskId);

    if (!subTask) {
      return res.status(404).json({ error: 'SubTask not found' });
    }

    subTask.status = status;
    await subTask.save();

    return res.status(200).json(subTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete SubTask (Soft Deletion)
exports.deleteSubTask = async (req, res) => {
  const { subTaskId } = req.params;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const subTask = await SubTask.findByPk(subTaskId);

    if (!subTask) {
      return res.status(404).json({ error: 'SubTask not found' });
    }

    // Perform soft deletion by updating the deleted_at field
    subTask.deleted_at = new Date();
    await subTask.save();

    return res.status(204).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get User SubTasks
exports.getUserSubTasks = async (req, res) => {
  const { task_id } = req.query;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let whereClause = { deleted_at: null }; // Soft deletion check

    if (task_id) {
      whereClause.task_id = task_id;
    }

    const subTasks = await SubTask.findAll({
      where: whereClause,
    });

    return res.status(200).json(subTasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
