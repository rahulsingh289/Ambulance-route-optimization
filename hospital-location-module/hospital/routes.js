const express = require('express');
const router = express.Router();
const {
    getAllHospitals,
    getHospitalById,
    searchHospitalByName,
    getNearestHospital,
    addHospital,
    updateHospital,
    deleteHospital
} = require('./controller');

router.get('/', getAllHospitals);
router.get('/search', searchHospitalByName);   // ?name=xyz
router.get('/nearest', getNearestHospital);    // ?lat=x&lng=y
router.get('/:id', getHospitalById);
router.post('/', addHospital);
router.put('/:id', updateHospital);
router.delete('/:id', deleteHospital);

module.exports = router;
