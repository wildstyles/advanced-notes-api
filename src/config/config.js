const env = process.env.NODE_ENV || 'development';
import config from './config.json';
// чтобы лишняя инфа не выходила в репозиторий. Конфиг.json gitignore
if (env === 'development' || env === 'test') {
  var envConfig = config[env];

  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}