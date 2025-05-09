const express = require('express');
const groups = express.Router();
const {
    createRegistration,
    getRegistration,
    deleteRegistration,
    getAllRegistrations,
    updateTeachers,
    updateRegistration,
    getGroupsByTeacher,
} = require('../controller/groupsCtrl');

groups.post('/groups/', createRegistration);
groups.get('/groups/', getAllRegistrations);
groups.get('/groups/:id', getRegistration);
groups.get('/groups/by-teacher', getGroupsByTeacher);
groups.put('/groups/:id', updateRegistration);
groups.delete('/groups/:id', deleteRegistration);
groups.put('/groups/:id/update-teachers', updateTeachers);


module.exports = groups;



