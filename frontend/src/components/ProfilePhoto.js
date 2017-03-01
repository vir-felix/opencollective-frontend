import React, { PropTypes } from 'react';
import { resizeImage } from '../lib/utils';

const ProfilePhoto = ({url, spinner, hasBorder=false}) => {

  const backgroundImage = url ? resizeImage(url, { height: 128 }) : '/public/images/default_avatar.svg';

  const border = hasBorder ? {
    border: '3px solid white',
    boxShadow: '0px 0px 0px 1px #7FADF2'
  } : {};

  const divStyle = {
    ...border,
    backgroundImage: `url(${backgroundImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };

  return (
    <div className='ProfilePhoto' style={divStyle}>
      {spinner ? <div className='spinner-loader center-element' /> : null }
    </div>
  );
}

ProfilePhoto.propTypes = {
  url: PropTypes.string,
  spinner: PropTypes.string
};

export default ProfilePhoto;
