import React, { useEffect, useRef } from 'react';
import { func, bool, node, number } from 'prop-types';
import Preloader from '../preloader';
import Box from '@mui/material/Box';
import { throttle } from 'lodash';
import { useLocation } from 'react-router-dom';


function Loader() {
  return (
    <Box display='flex' justifyContent='center' width='100%' key='preloader' mt={3} height={50}>
      <Preloader size={50} />
    </Box>
  );
}

function InfiniteScroll({ loadMore, hasMore, children, threshold, isLoading }) {
  const boxRef = useRef(null);
  const pageRef = useRef(1);
  const { search } = useLocation();

  useEffect(() => {
    pageRef.current = 1;
    loadMore(1, true);
  }, [search]);

  useEffect(() => {
    const trackScroll = throttle(() => {
      if (isLoading || !hasMore) {
        return;
      }

      const box = boxRef.current;
      if (!box) {
        return;
      }

      const currentBottom = box.getBoundingClientRect().bottom;
      const parentStyle = getComputedStyle(box.parentNode);
      const paddingBottom = parseFloat(parentStyle.paddingBottom);
      const maxReachableBottom = window.innerHeight - paddingBottom;

      if (currentBottom - maxReachableBottom <= threshold) {
        loadMore(pageRef.current++);
      }
    }, 200);

    window.addEventListener('scroll', trackScroll);
    return () => window.removeEventListener('scroll', trackScroll);
  }, [isLoading, hasMore]);

  return (
    <Box ref={boxRef}>
      {children}
      {isLoading && <Loader />}
    </Box>
  );
}

InfiniteScroll.propTypes = {
  loadMore: func.isRequired,
  hasMore: bool,
  children: node,
  threshold: number,
  isLoading: bool
};

InfiniteScroll.defaultProps = {
  threshold: 250
};

export default InfiniteScroll;