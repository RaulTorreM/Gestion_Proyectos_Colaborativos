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
app.use('/api/priorities', require('./routes/priorities'))
app.use('/api/userStories', require('./routes/userStories'))
app.use('/api/comments', require('./routes/comments'))
app.use('/api/versions', require('./routes/versions'))
app.use('/api/notifications', require('./routes/notifications'))

module.exports = app;