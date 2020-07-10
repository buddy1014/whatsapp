module.exports = {
  apps: [
    {
      name: "WA app 1",
      script: "./bin/www",
      instances: 0,
      exec_mode: "cluster",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
