// Home — CIO-default surface. Minimal layout is the canonical Home.
// HomeDense remains exported for use as a future "Detail" view toggle.
import React from 'react';
import { HomeMinimal } from './HomeMinimal.jsx';

export function Home({ openDash }) {
  return <HomeMinimal openDash={openDash}/>;
}
