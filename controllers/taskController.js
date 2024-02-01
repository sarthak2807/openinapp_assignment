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

// Create task - input is title, description and due_date with jwt auth token
exports.createTask = async (req, res) => {
  const { title, description, due_date } = req.body;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const task = await Task.create({
      title,
      description,
      due_date,
      status: 'TODO', // Default status
      priority: calculateTaskPriority(due_date), // Calculate priority based on due date
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { due_date, status } = req.body;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.due_date = due_date || task.due_date;
    task.status = status || task.status;
    task.priority = calculateTaskPriority(task.due_date); // Recalculate priority based on updated due date

    await task.save();

    // Update corresponding subtasks if needed
    await updateSubTasksStatus(task.id, task.status);

    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete Task (Soft Deletion)
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Perform soft deletion by updating the deleted_at field
    task.deleted_at = new Date();
    await task.save();

    // Soft delete corresponding subtasks
    await softDeleteSubTasks(task.id);

    return res.status(204).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get User Tasks
exports.getUserTasks = async (req, res) => {
  const { priority, due_date, page, pageSize } = req.query;
  const token = req.headers.authorization;

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let whereClause = { deleted_at: null }; // Soft deletion check

    if (priority) {
      whereClause.priority = priority;
    }

    if (due_date) {
      whereClause.due_date = due_date;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      order: [['due_date', 'ASC']],
      offset: page ? (page - 1) * pageSize : 0,
      limit: pageSize ? parseInt(pageSize) : null,
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to calculate task priority based on due date
const calculateTaskPriority = (due_date) => {
  const today = new Date();
  const dueDate = new Date(due_date);

  const timeDifference = dueDate.getTime() - today.getTime();
  const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  let priority;

  if (remainingDays === 0) {
    priority = 0; // Due date is today
  } else if (remainingDays <= 2) {
    priority = 1; // Due date is between tomorrow and day after tomorrow
  } else if (remainingDays <= 4) {
    priority = 2; // Due date is 3-4 days
  } else if (remainingDays <= 7) {
    priority = 3; // Due date is 5-7 days
  } else {
    priority = 4; // Due date is more than 7 days
  }

  return priority;
};

// Function to update subtasks' status based on task status
const updateSubTasksStatus = async (taskId, taskStatus) => {
  const subTasks = await SubTask.findAll({ where: { task_id: taskId, deleted_at: null } });

  if (subTasks) {
    await Promise.all(subTasks.map(async (subTask) => {
      subTask.status = taskStatus;
      await subTask.save();
    }));
  }
};

// Function to perform soft deletion of subtasks
const softDeleteSubTasks = async (taskId) => {
  const subTasks = await SubTask.findAll({ where: { task_id: taskId, deleted_at: null } });

  if (subTasks) {
    await Promise.all(subTasks.map(async (subTask) => {
      subTask.deleted_at = new Date();
      await subTask.save();
    }));
  }
};
