const { findTrainsBetweenStations } = require('../services/reservation');

async function searchTrains(req, res) {
    try {
        const { origin, destination, date } = req.query;
        if (!origin || !destination || !date) {
            return res.status(400).json({ error: 'Please provide origin, destination, and date (YYYY-MM-DD)' });
        }

        const trains = await findTrainsBetweenStations(origin, destination, date);
        res.json(trains);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { searchTrains };
