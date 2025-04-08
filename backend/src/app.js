const express = require('express');
const cors = require('cors');
const app = express();

// settings
app.set('port', process.env.PORT || 4000);

// middlewares
app.use(cors());
app.use(express.json());

// routes 
app.use('/api/users', require('./routes/users'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/epics', require('./routes/epics'))
app.use('/api/userStories', require('./routes/userStories'))
app.use('/api/moscowPriorities', require('./routes/moscowPriorities'))
app.use('/api/notifications', require('./routes/notifications'))


module.exports = app;