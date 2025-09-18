const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add proxy configuration for development
  if (env.mode === 'development') {
    config.devServer = {
      ...config.devServer,
      proxy: {
        '/api/hebcal': {
          target: 'https://www.hebcal.com',
          changeOrigin: true,
          pathRewrite: { // Corrige le chemin pour pointer vers l'endpoint /shabbat
            '^/api/hebcal': '/api/v2/shabbat'
          },
          secure: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      }
    };
  }
  
  return config;
};