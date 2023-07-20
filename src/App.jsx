import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Box, Container } from '@chakra-ui/react';

import { readCache } from './api/endpoints';

import { DBTreeView } from './components/DBTreeView';
import { CachedTreeView } from './components/CachedTreeView';

function App() {
  const middleItemRef = useRef(null);

  const [cache, setCache] = useState({});
  const [isCacheStale, setIsCacheStale] = useState(false);

  useEffect(() => {
    const fetchCacheData = async () => {
      const newData = await readCache();

      setCache(newData);
    };

    try {
      fetchCacheData();
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!isCacheStale) {
      return;
    }

    const fetchCacheData = async () => {
      const newData = await readCache();

      setCache(newData);
    };

    try {
      fetchCacheData();
      setIsCacheStale(false);
    } catch (error) {
      console.error(error);
    }
  }, [isCacheStale, setIsCacheStale]);

  return (
    <Container width='100vw' height='100vh' pt={10} maxWidth='60vw'>
      <Box display='flex' gap={4}>
        <Box flex={1} maxWidth='45%'>
          <CachedTreeView cache={cache} refresh={() => setIsCacheStale(true)} />
        </Box>
        <Box ref={middleItemRef} display='flex' alignItems='center' height='500px' />
        <Box flex={1} maxWidth='45%'>
          <DBTreeView
            renderActionToPortal={(children) =>
              middleItemRef.current && createPortal(children, middleItemRef.current)
            }
            onCacheChanged={() => setIsCacheStale(true)}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
