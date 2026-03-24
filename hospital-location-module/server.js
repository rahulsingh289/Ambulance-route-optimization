require('dotenv').config();
const express = require('express');
const cors = require('cors');

const hospitalRoutes = require('./hospital/routes');
const locationRoutes = require('./location/routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/locations', locationRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Hospital & Location Management Module running' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
