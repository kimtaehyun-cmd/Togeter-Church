module.exports = {
  apps: [
    {
      name: 'together-church',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3000',
        TRUST_PROXY_HEADERS: process.env.TRUST_PROXY_HEADERS || 'true',
      },
    },
  ],
};
