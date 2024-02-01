const cron = require('node-cron');
const Task = require('./models/task');
const User = require('./models/user');
const twilio = require('twilio');

const accountSid = 'ACUS3195557d04c3c11f3bc0b8a95e90c305';
const authToken = 'MP46CAUW8B55URUUPCKH8CDM';
const twilioClient = new twilio(accountSid, authToken);

// Cron logic for changing priority of task based on due_date of task
cron.schedule('0 0 * * *', async () => {
  try {
    const tasks = await Task.findAll({ where: { deleted_at: null } });

    if (tasks) {
      await Promise.all(tasks.map(async (task) => {
        task.priority = calculateTaskPriority(task.due_date); // Recalculate priority based on due date
        await task.save();
      }));
    }
  } catch (error) {
    console.error(error);
  }
});



// Cron logic for voice calling using Twilio
cron.schedule('0 1 * * *', async () => {
  try {
    const users = await User.findAll({ order: [['priority', 'ASC']], where: { deleted_at: null } });

    if (users) {
      await Promise.all(users.map(async (user) => {
        const tasks = await Task.findAll({
          where: { priority: user.priority, status: 'TODO', due_date: { [Op.lt]: new Date() } },
        });

        if (tasks && tasks.length > 0) {
          // Make voice call using Twilio
          await makeVoiceCall(user.phone_number);

          // Log the call
          console.log(`Voice call made to ${user.phone_number}`);
        }
      }));
    }
  } catch (error) {
    console.error(error);
  }
});
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
// Function to make voice call using Twilio
const makeVoiceCall = async (phoneNumber) => {
  try {
    await twilioClient.calls.create({
      url: 'your-twilio-voice-url', // Replace with your actual Twilio voice URL
      to: phoneNumber,
      from: 'your-twilio-phone-number', // Replace with your actual Twilio phone number
    });
  } catch (error) {
    console.error(error);
  }
};
