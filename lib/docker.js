const settings = require("../settings");
const dockerode = require("dockerode");
const docker = new dockerode(settings.docker_connection_opts);

const NODEPIRATES_PORT_LABEL = "nodepirates.port";

function getImageName(playerName) {
	return 'nodepirates/' + playerName + ":latest";
}

async function getDockerPort(playerName) {
	let images = await docker.listImages({filter: getImageName(playerName)});
	if (images.length === 0) {
		throw new Error("cannot find image " + getImageName());
	}
	//query can only return one item since we also specify the tag
	let image = await docker.getImage(images[0].Id).inspect();
	if (!!image.Config && !!image.Config.Labels && !!image.Config.Labels[NODEPIRATES_PORT_LABEL]) {
		return image.Config.Labels[NODEPIRATES_PORT_LABEL];
	}
	if (!!image.Config && !!image.Config.ExposedPorts) {
		portMappings = Object.keys(image.Config.ExposedPorts);
		if (portMappings.length !== 0) {
			return portMappings[0].substring(0, portMappings[0].indexOf("/"));
		}
	}
	//fallback, just guessing
	return "8080";
}

module.exports = exports = {
	getImageName,
	getDockerPort
};