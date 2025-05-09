const express = require('express');
const router = express.Router();
const balansController = require('../controller/balansController');

router.post('/', balansController.createBalans);
router.get('/', balansController.getAllBalans);
router.get('/:id', balansController.getBalansById);
router.put('/:id', balansController.updateBalans);
router.delete('/:id', balansController.deleteBalans);

module.exports = router;
