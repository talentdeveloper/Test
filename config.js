'use strict';

exports.hostname = process.env.hostname || 'localhost';
exports.port = process.env.PORT || 80;
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/nj-birddogs'
};
exports.companyName = 'Arthur Kao';
exports.projectName = 'Angular Drywall';
exports.systemEmail = 'a@email.com';
exports.cryptoKey = 'k3yb0ardc4t';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};
exports.requireAccountVerification = false;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName +' Website',
    address: process.env.SMTP_FROM_ADDRESS || 'a@email.com'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    host: process.env.SMTP_HOST || '',
    ssl: true
  }
};
exports.oauth = {
  twitter: {
    // Not yet implemented
    key: process.env.TWITTER_OAUTH_KEY || '',
    secret: process.env.TWITTER_OAUTH_SECRET || ''
  },
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '466922947016838',
    secret: process.env.FACEBOOK_OAUTH_SECRET || '1850272938dc5e64f7baa0c305b093c7'
  },
  github: {
    // Not yet implemented
    key: process.env.GITHUB_OAUTH_KEY || '',
    secret: process.env.GITHUB_OAUTH_SECRET || ''
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '',
    secret: process.env.GOOGLE_OAUTH_SECRET || ''
  },
  tumblr: {
    // Not yet implemented
    key: process.env.TUMBLR_OAUTH_KEY || '',
    secret: process.env.TUMBLR_OAUTH_SECRET || ''
  }
};
