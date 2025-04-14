const versionControllers = {};

const Version = require('../models/Version');

versionControllers.getVersions = async (req, res) => {
	const versions = await Version.find(); 
	res.json(versions)
}

versionControllers.getVersion = async (req, res) => {
	const version = await Version.findById(req.params.id)
	res.json(version)
}

versionControllers.createVersion = async (req, res) => {
	const { name, description, projectId, status, 
			startDate, releaseDate, userStories } = req.body 
	
	const newVersion = new Version({
		name,
		description,
		projectId,
		status,
		startDate,
		releaseDate,
		userStories,
	})

	await newVersion.save();

	res.json({message: 'Version Saved'});
}

versionControllers.updateVersion = async (req, res) => {
	const { name, description, projectId, status, 
			startDate, releaseDate, userStories } = req.body 

	await Version.findByIdAndUpdate(req.params.id, {
		name,
		description,
		projectId,
		status,
		startDate,
		releaseDate,
		userStories,
	})

	res.json({message: 'Version Updated'})
}

versionControllers.deleteVersion = async (req, res) => {
	await Version.findByIdAndDelete(req.params.id)
	res.json({message: 'Version Deleted'})
}

module.exports = versionControllers;
