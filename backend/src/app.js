const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const { validateToken } = require('./middlewares/validateToken');

// settings
app.set('port', process.env.PORT || 4000);

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// routes 
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);
app.use('/api/users', validateToken, require('./routes/users'))
app.use('/api/projects', validateToken, require('./routes/projects'))
app.use('/api/epics', validateToken, require('./routes/epics'))
app.use('/api/priorities', validateToken, require('./routes/priorities'))
app.use('/api/userStories', validateToken, require('./routes/userStories'))
app.use('/api/comments', validateToken, require('./routes/comments'))
app.use('/api/versions', validateToken, require('./routes/versions'))
app.use('/api/notifications', require('./routes/notifications'))

module.exports = app;