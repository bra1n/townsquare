module.exports = {
  apps: [
    {
      name: "townsquare",
      script: "index.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "750M",
      watch: true,
      env: {}
    }
  ]
};
