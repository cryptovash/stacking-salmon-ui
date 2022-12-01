
import clsx from 'clsx';

import OverallStats from './OverallStats';
// TODO: Add in CreateNewMarketLinkButton
// import CreateNewMarketLinkButton from './CreateNewMarketLinkButton';
import LendingPools from './LendingPools';
import React from 'react';

const Home = (): JSX.Element => {
  return (
    <div
      className={clsx(
        'space-y-12'
      )}>
      <OverallStats />
      {/* TODO: Add in CreateNewMarketLinkButton */}
      {/* <CreateNewMarketLinkButton /> */}
      <LendingPools />
    </div>
  );
};

export default Home;
