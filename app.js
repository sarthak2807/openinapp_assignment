const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const sequelize = require('sequelize'); // Initialize Sequelize


app.use(bodyParser.json());

// Define routes for each API
const taskRoutes = require('./routes/taskRoutes');
const subTaskRoutes = require('./routes/subTaskRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/tasks', taskRoutes);
app.use('/subtasks', subTaskRoutes);
app.use('/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
