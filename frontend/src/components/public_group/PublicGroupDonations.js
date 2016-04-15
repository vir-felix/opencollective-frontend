import React from 'react';
import { Link } from 'react-router';
import ActivityItem from '../../components/ActivityItem';

export default class PublicGroupDonations extends React.Component {
  render() {
    const {
      donations,
      users,
      group,
      i18n,
      itemsToShow = 3
    } = this.props;

    const emptyState = (
      <div className='center'>
        <div className='PublicGroup-emptyState-image flex items-center justify-center'>
          <img width='134' height='120'
            src='/static/images/collectives/activities-empty-state-image.jpg'
            srcSet='/static/images/collectives/activities-empty-state-image@2x.jpg 2x'/>
        </div>
        <p className='h3 -fw-bold'>{i18n.getString('activitiesPlaceholderTitle')}</p>
        <p className='h5 muted'>{i18n.getString('activitiesPlaceholderText')}</p>
      </div>
    );

    return (
      <div className='PublicGroup-donations col md-col-6 col-12 px2 mb3'>
        <div className='border-bottom border-gray pb2 mb3'>
          <h2 className='PublicGroup-title m0 -ff-sec -fw-bold'>{i18n.getString('latestActivities')}</h2>
        </div>
        {(donations.length === 0) && emptyState}
        <div className='PublicGroup-transactions-list'>
          {donations.map(donation => <ActivityItem key={`pgd_${donation.id}`} donation={donation} user={users[donation.UserId]} className='mb2' />)}
        </div>
        {(donations.length >= itemsToShow) && (
          <div className='center pt2'>
            <Link className='-btn -btn-medium -btn-outline -border-green -ttu -ff-sec -fw-bold' to={`/${group.slug}/donations`}>
              {i18n.getString('allActivities')}
            </Link>
          </div>
        )}
      </div>
    );
  }
};
