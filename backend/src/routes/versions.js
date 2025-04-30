const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateVersion, validateUpdateVersion } = require('../middlewares/validateVersion');
const Version = require('../models/Version');
const router = Router();

const { getVersions, getVersion, createVersion, updateVersion, deleteVersion } = require('../controllers/versions.controller');

router.route('/')
	.get(getVersions)
	.post(validateCreateVersion, createVersion);

router.route('/:id')
	.all(validateObjectId(Version))
	.get(getVersion)
	.put(validateUpdateVersion, updateVersion)
	.delete(deleteVersion);

module.exports = router;