import mocks from '../data/mocks.json'; // eslint-disable-line
import request from 'supertest';
import sinon from 'sinon';
import sizeOf from 'image-size';
import { expect } from 'chai';

import api from '../../server/src/lib/api';
import app from '../../server/src/index';
import config from 'config';

import shieldIONock from '../data/shields.io.nock';

mocks.backers = mocks.users.filter(u => u.tier == 'backer')

describe("avatar", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(api, 'get', () => {
      return Promise.resolve(mocks.users);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("wraps the avatar of a backer in a 64x64 SVG", (done) => {
    request(app)
      .get('/yeoman/backers/0/avatar.svg')
      .expect('content-type', 'image/svg+xml; charset=utf-8')
      .expect((res) => {
        res.body = sizeOf(res.body);
      })
      .expect(200, { width: 64, height: 64, type: 'svg' }, done);
  });

  it("wraps the logo of a sponsor in a SVG with maxHeight 64", (done) => {
    request(app)
      .get('/yeoman/sponsor/0/avatar.svg')
      .expect('content-type', 'image/svg+xml; charset=utf-8')
      .expect((res) => {
        res.body = sizeOf(res.body);
      })
      .expect(200, { width: 128, height: 64, type: 'svg' }, done);
  });

  it("redirects to the avatar url of the backer", (done) => {
    request(app)
      .get('/yeoman/backers/0/avatar.png')
      .expect('content-type', 'image/png')
      .expect(200, done);
  });

  it("redirects to 'become a backer' placeholder", (done) => {
    request(app)
      .get(`/yeoman/backers/${mocks.backers.length}/avatar`)
      .expect('Location', '/public/images/become_backer.svg')
      .expect(302, done);
  });

  it("redirects to the 1px transparent png if out of bound", (done) => {
    request(app)
      .get(`/yeoman/backers/${(mocks.backers.length+1)}/avatar`)
      .expect('Location', '/public/images/1px.png')
      .expect(302, done);
  });

  it("handles the avatarHeight option", (done) => {
    request(app)
      .get('/yeoman/backers/0/avatar.png?avatarHeight=256')
      .expect((res) => {
        res.body = sizeOf(res.body);
      })
      .expect(200, { width: 260, height: 260, type: 'png' }, done);
  });
});

describe("badge", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(api, 'get', () => {
      return Promise.resolve(mocks.users);
    });
  });

  beforeEach(shieldIONock);

  afterEach(() => {
    sandbox.restore();
  });

  it("generates a SVG with the number of backers", (done) => {
    request(app)
      .get('/yeoman/badge/backers.svg')
      .expect('content-type', 'image/svg+xml; charset=utf-8')
      .expect(200)
      .end(done);
  });
});

describe("redirect", () => {

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(api, 'get', () => {
      return Promise.resolve(mocks.users);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("494 if no backer at that position", (done) => {
    request(app)
      .get('/yeoman/backers/999/website')
      .expect(404, done);
  });

  it(`redirects to the website of the sponsor and keeps pre-existing utm tracking data`, (done) => {
    request(app)
      .get('/yeoman/sponsors/0/website')
      .expect('Location', `https://digitalocean.com/?utm_campaign=opensource&utm_medium=github&utm_source=oc`)
      .expect(301, done);
  });

  it(`redirects to profile of the backer (@${mocks.backers[2].twitterHandle})`, (done) => {
    request(app)
      .get('/yeoman/backers/2/website')
      .expect('Location', `${config.host.website}/${mocks.backers[2].twitterHandle}?utm_campaign=yeoman&utm_medium=github&utm_source=opencollective`)
      .expect(301, done);
  });

})

describe("banner", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(api, 'get', () => {
      return Promise.resolve(mocks.users);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("request the banner.svg", done => {
    request(app)
      .get('/yeoman/backers.svg')
      .expect('content-type', 'image/svg+xml; charset=utf-8')
      .expect(res => {
        const svg = new Buffer(res.body).toString('utf8');
        const firstLine = svg.substr(0, svg.indexOf('\n'));
        res.body = { firstLine };
      })
      .expect({
        firstLine: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="414" height="74">'
      })
      .expect(200, done);
  });

  it("request the banner.png", function(done) {
    this.timeout(10000);
    request(app)
      .get('/yeoman/backers.png')
      .expect('content-type', 'image/png')
      .expect(res => {
        res.body = { contentLength: Number(res.headers['content-length']) };
      })
      .expect({
        contentLength: 8738
      })
      .expect(200, done);
  });

  it("adds a margin the banner.svg", done => {
    request(app)
      .get('/yeoman/backers.svg?margin=20')
      .expect('content-type', 'image/svg+xml; charset=utf-8')
      .expect(res => {
        const svg = new Buffer(res.body).toString('utf8');
        const firstLine = svg.substr(0, svg.indexOf('\n'));
        res.body = { firstLine };
      })
      .expect({
        firstLine: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="504" height="104">'
      })
      .expect(200, done);
  });

  it("sets a max width for banner.svg", done => {
    request(app)
      .get('/yeoman/backers.svg?width=200')
      .expect('content-type', 'image/svg+xml; charset=utf-8')
      .expect(res => {
        const svg = new Buffer(res.body).toString('utf8');
        const firstLine = svg.substr(0, svg.indexOf('\n'));
        res.body = { firstLine };
      })
      .expect({
        firstLine: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="212">'
      })
      .expect(200, done);
  });

  it('has target blank on the links', (done) => {
    request(app)
      .get('/yeoman/backers.svg')
      .expect('content-type', 'image/svg+xml; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        const svg = new Buffer(res.body).toString('utf8');
        expect(svg).to.contain(`target="_blank"`);
        done();
      })
  });
})
