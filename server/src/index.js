if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  require('dotenv').load();
}

import sepia from 'sepia';
import path from 'path';

sepia.fixtureDir(path.join(process.cwd(), '/test/fixtures'));
if (process.env.DEBUG && process.env.DEBUG.match(/sepia/)) {
  sepia.configure({
    verbose: true,
    debug: true
  });
}
sepia.filter({
  url: /connected-accounts\/github/,
  urlFilter: function(url) {
    return url.replace(/&code=[^&]+/, '');
  }
});

import 'babel-register';
import './global';

import app from './app';

export default app;
