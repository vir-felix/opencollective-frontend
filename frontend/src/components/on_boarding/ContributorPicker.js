import React from 'react';

import ContributorPickerItem from './ContributorPickerItem'

export default class ContributorPicker extends React.Component {

  constructor(props)
  {
    super(props);
  }
  
  render()
  {
    const { } = this.props;
    return (
      <div className="ContributorPicker">
      	<ContributorPickerItem />
      </div>
    )
  }
}
