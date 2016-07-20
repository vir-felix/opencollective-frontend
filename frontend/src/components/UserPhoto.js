import React from 'react';
import getAvatarByNumber from '../lib/avatar_by_number';

const cloudinaryUrl = (url) => {
  return `https://res.cloudinary.com/opencollective/image/fetch/h_128/${encodeURIComponent(url)}`;
};

export default class UserPhoto extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
    addBadge: React.PropTypes.bool
  };

  static defaultProps = {
    addBadge: false
  };

  componentDidMount() {
    const { user } = this.props;
    if (user.avatar) {
      const image = new Image();
      image.onerror = () => this.setState({avatar: getAvatarByNumber(user.id)});
      image.onload = () => this.setState({avatar: user.avatar});
      image.src = user.avatar;
    } else {
      this.setState({avatar: getAvatarByNumber(user.id)});
    }
  }

  constructor(props) {
    super(props);
    this.state = {avatar: ''};
  }

  render() {
    const { className, user, addBadge, onMouseEnter, onMouseLeave, customBadgeSize, customBadge } = this.props;
    const avatar = (!this.state.avatar || this.state.avatar.indexOf('/static/') === 0) ? this.state.avatar : cloudinaryUrl(this.state.avatar);
    const styles = {
      backgroundImage: `url(${avatar})`
    };

    return (
      <div className={`UserPhoto bg-no-repeat bg-center relative ${user.tier} ${className} ${avatar ? 'UserPhoto--loaded' : ''} `} onMouseEnter={ onMouseEnter } onMouseLeave={ onMouseLeave }>
        <div className='width-100 height-100 bg-contain bg-no-repeat bg-center' style={styles}></div>
        {addBadge ? (
          <div className='UserPhoto-badge absolute bg-white'>
            <svg className='block -green' width={`${customBadgeSize ? customBadgeSize : '14'}`} height={`${customBadgeSize ? customBadgeSize : '14'}`}>
              <use xlinkHref={`#${customBadge ? customBadge : 'svg-isotype'}`}/>
            </svg>
          </div>
        ) : null}
      </div>
    );
  }
}
