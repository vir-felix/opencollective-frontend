import React from 'react';
import env from '../../lib/env';

export default ({ utmSource }) => (
  <div className='OnBoardingHero'>
    <div className='-title'>
      Apply to create an open collective for your <strong>open source</strong> project.
    </div>
    <div className='-subtitle'>
      We are starting to accept new open collectives. Reserve your spot today.
    </div>
    <div className='-button-container'>
      <a href={`${env.API_ROOT}/connected-accounts/github?utm_source=${utmSource}`}>
        <div className='OnBoardingButton'>Connect GitHub</div>
      </a>
    </div>
    <div className="-requirements">
      You'll need a GitHub account, a repository with over 100 stars that you own & at least 2 contributors.
      <br />
      <a href="https://docs.google.com/document/u/1/d/1HRYVADHN1-4B6wGCxIA6dx28jHtcAVIvt95hkjEZVQE/pub">Terms of Service</a>
    </div>
  </div>
)
