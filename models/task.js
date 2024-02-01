const { DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE'),
        defaultValue: 'TODO',
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});
