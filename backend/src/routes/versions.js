const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const validateObjectIdArray = require('../middlewares/validateObjectIdArray');
const { validateCreateVersion, validateUpdateVersion } = require('../middlewares/validateVersion');
const Version = require('../models/Version');
const router = Router();

const { getVersions, getVersion, createVersion, updateVersion, deleteVersion, getVersionsBulk } = require('../controllers/versions.controller');

router.route('/')
	.get(getVersions)
	.post(validateCreateVersion, createVersion);

router.route('/:id')
	.all(validateObjectId(Version))
	.get(getVersion)
	.put(validateUpdateVersion, updateVersion)
	.delete(deleteVersion);

router.post('/bulk/ids',
	validateObjectIdArray(Version), 
	getVersionsBulk
	);

module.exports = router;