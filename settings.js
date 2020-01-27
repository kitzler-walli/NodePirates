settings = {
	wakeup_retry_count: 20,
	wakeup_wait_time: 1000,
	grid_size: 10,
	pvp_games_count: 1,
	parallel_games_count: 10,
	db_connectionstring: 'mongodb://127.0.0.1:27017/nodepirates',
	//host+port is used on windows, path otherwise
	docker_socketPath: '/var/run/docker.sock',
	docker_host: '127.0.0.1',
	docker_port: '2375',
	triggerMatchMakerInterval: 60000
};
settings['docker_connection_opts'] = process.platform === "win32" ?
	{host: settings.docker_host, port: settings.docker_port} :
	{socketPath: settings.docker_socketPath};

module.exports = exports = settings;