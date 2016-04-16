import config from 'config';
import request from 'request';
import filterCollection from '../../frontend/src/lib/filter_collection';

const filterUsersByTier = (users, tiername) => {
  return filterCollection(users, { tier: tiername });
}

module.exports = {
  
  index: (req, res) => {
    res.render('backers', {
      users: req.users
    });
  },
  
  markdown: (req, res) => {
    const slug = req.params.slug;
    const positions = [];
    const spots = req.params.spots || 30;
    const tiername = req.params.tier || '';

    for(var i=0; i<spots; i++) {
      positions[i] = { position: i };
    }

    var tiers = req.group.tiers;
    tiers.map(t => { t.positions = positions; });
    if(tiername) {
      tiers = tiers.filter(t => t.title.toLowerCase() == tiername );
    }

    res.render('bannermd', {
      layout: false,
      base_url: config.host.website,
      tiers,
      slug,
      positions
    })
  },

  avatar: (req, res) => {
    const tier = req.params.tier || '';
    const tierSingular = tier.replace(/s$/,'');
    const users = filterUsersByTier(req.users, tierSingular);
    const position = parseInt(req.params.position, 10);
        
    const user = (position < users.length) ?  users[position] : {};

    // We only record a page view when loading the first avatar
    if(position==0) {
      req.ga.pageview();
    }
    
    var imageUrl = "/static/images/user.svg";
    if(user.avatar) {
      const avatarEncoded = encodeURIComponent(user.avatar);
      imageUrl = `https://res.cloudinary.com/opencollective/image/fetch/h_64/${avatarEncoded}`;
    }
    
    if(position == users.length)
      imageUrl = `/static/images/become_${tierSingular}.svg`;
    if(position > users.length)
      imageUrl = "/static/images/1px.png";

    if(imageUrl.substr(0,1) === '/')    
      return res.redirect(imageUrl);
    else {
      req
        .pipe(request(imageUrl))
        .on('response', (res) => {
          res.headers['Cache-Control'] = 'public, max-age=300';
        })
        .pipe(res);
    }

  },
  
  badge: (req, res) => {
    const tier = req.params.tier;
    const users = filterUsersByTier(req.users, tier.replace(/s$/,''));
    const count = users.length;
    const filename = `${tier}-${count}-brightgreen.svg`;
    const imageUrl = `https://img.shields.io/badge/${filename}`;

    request(imageUrl, (err, response, body) => {
      res.setHeader('content-type','image/svg+xml;charset=utf-8');
      res.send(body);
    });
  },

  redirect: (req, res) => {
    const tier = req.params.tier;
    const users = filterUsersByTier(req.users, tier.replace(/s$/,''));
    const slug = req.params.slug;
    const position = parseInt(req.params.position, 10);

    req.ga.event("GithubWidget", `${tier}-click`, "slug", slug);

    const user = (position < users.length) ?  users[position] : {};
    user.twitter = (user.twitterHandle) ? `https://twitter.com/${user.twitterHandle}` : null;
    
    var redirectUrl = user.website || user.twitter || `https://opencollective.com/${slug}`;
    if(position === users.length) {
      redirectUrl = `https://opencollective.com/${slug}#support`;
    }
    
    res.redirect(redirectUrl);      
  }
};
