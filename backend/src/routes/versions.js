const { Router } = require('express');
const router = Router();

const { getVersions, getVersion, createVersion, 
		updateVersion, deleteVersion } = require('../controllers/versions.controller');

router.route('/')
	.get(getVersions)
	.post(createVersion);

router.route('/:id')
	.get(getVersion)
	.put(updateVersion)
	.delete(deleteVersion);

module.exports = router;