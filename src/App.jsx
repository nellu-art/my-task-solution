import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Box, Container, Badge } from '@chakra-ui/react';

import { readCache } from './api/endpoints';

import { DBTreeView } from './components/DBTreeView';
import { CachedTreeView } from './components/CachedTreeView';

function App() {
  const topContainerRef = useRef(null);
  const middleItemRef = useRef(null);

  const [cache, setCache] = useState({});
  const [isCacheStale, setIsCacheStale] = useState(false);
  const [isDBUpdated, setIsDBUpdated] = useState(false);

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
    <Container width='100vw' height='100vh' pt={10} maxWidth='container.lg'>
      <Box display='flex' justifyContent='space-between'>
        <Box ref={topContainerRef} maxWidth='45%' pr={4} flex={1} />
        <Box flex={1} display='flex' maxWidth='45%' justifyContent='center' alignItems='center'>
          <Badge colorScheme='purple'>Select node to start</Badge>
        </Box>
      </Box>
      <Box display='flex' gap={4}>
        <Box flex={1} maxWidth='45%'>
          <CachedTreeView
            cache={cache}
            refresh={(options) => {
              setIsCacheStale(true);
              if (options?.dbUpdated) {
                setIsDBUpdated(true);
              }
            }}
            renderActions={(children) =>
              topContainerRef.current && createPortal(children, topContainerRef.current)
            }
          />
        </Box>
        <Box ref={middleItemRef} display='flex' alignItems='center' height='500px' />
        <Box flex={1} maxWidth='45%'>
          <DBTreeView
            renderActionToPortal={(children) =>
              middleItemRef.current && createPortal(children, middleItemRef.current)
            }
            onCacheChanged={() => setIsCacheStale(true)}
            isDBUpdated={isDBUpdated}
            onDoneDBUpdate={() => setIsDBUpdated(false)}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
