import { PropTypes } from 'prop-types';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Box, Button, Container, IconButton, Badge } from '@chakra-ui/react';
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  ArrowLeftIcon,
  AddIcon,
  EditIcon,
} from '@chakra-ui/icons';

import {
  readDatabase,
  readCache,
  loadNodeToCache,
  addNodeToCache,
  editNode,
} from './api/endpoints';

import { RenderNode } from './components/RenderNode';

function mapNodeChildrenWithData(node, data) {
  return {
    ...node,
    children: node.children
      .map((childId) => data.find((item) => item.id === childId))
      .filter((value) => !!value)
      .map((child) => mapNodeChildrenWithData(child, data)),
  };
}

function isChildOf(node, parent) {
  if (node.parentId === parent.id) {
    return true;
  }

  return parent.children.some((child) => isChildOf(node, child));
}

function DBTreeView({ renderActionToPortal, onCacheChanged }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [pagination, setPagination] = useState({
    offset: 0,
  });

  const displayNodes = nodes.reduce((result, node, _, list) => {
    const isIncluded = result.some((item) => isChildOf(node, item));

    if (isIncluded) {
      return result;
    }

    const newNode = mapNodeChildrenWithData(node, list);

    result.push(newNode);

    return result;
  }, []);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const selectedPage = Math.floor(pagination.offset / pagination.limit) + 1;

  const handleOpenNextPage = () => {
    const newOffset = pagination.offset + pagination.limit;

    if (newOffset > pagination.total) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };

  const handleOpenPrevPage = () => {
    const newOffset = pagination.offset - pagination.limit;

    if (newOffset < 0) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const newData = await readDatabase(pagination.offset);

      setNodes(newData.data);
      setPagination(newData.pagination);
    };

    try {
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [pagination.offset]);

  return (
    <>
      {renderActionToPortal(
        <Button
          leftIcon={<ArrowLeftIcon />}
          colorScheme='blue'
          variant='solid'
          isDisabled={!selectedNodeId}
          onClick={() => {
            if (!selectedNodeId) {
              return;
            }

            loadNodeToCache(selectedNodeId);
            onCacheChanged();
            setSelectedNodeId(null);
          }}
        >
          Load
        </Button>
      )}
      <Box height='500px' border='1px solid black' p={2} overflow='auto'>
        {displayNodes.map((node) => {
          return (
            <RenderNode
              key={node.id}
              node={node}
              nestingLevel={0}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />
          );
        })}
      </Box>
      <Box mt={3} display='flex' justifyContent='flex-end' alignItems='center'>
        <IconButton
          variant='outline'
          colorScheme='teal'
          aria-label='Go back'
          icon={<ArrowBackIcon />}
          onClick={handleOpenPrevPage}
          isDisabled={selectedPage === 1}
        />
        <Badge ml='1' mr='1'>
          {selectedPage} / {totalPages}
        </Badge>
        <IconButton
          variant='outline'
          colorScheme='teal'
          aria-label='Go forward'
          icon={<ArrowForwardIcon />}
          onClick={handleOpenNextPage}
          isDisabled={selectedPage === totalPages}
        />
      </Box>
    </>
  );
}

function mapNodeChildrenWithCacheData(node, cache) {
  return {
    ...node,
    children: node.children
      .map((childId) => cache[childId] ?? null)
      .filter((value) => !!value)
      .map((child) => mapNodeChildrenWithCacheData(child, cache)),
  };
}

function CachedTreeView({ cache, refresh }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editNodeId, setEditNodeId] = useState(null);

  const displayNodes = Object.values(cache)
    .map((node) => mapNodeChildrenWithCacheData(node, cache))
    .reduce((result, node, _, list) => {
      const isIncluded = list.some((item) => isChildOf(node, item));

      if (isIncluded) {
        return result;
      } else {
        result.push(node);
      }

      return result;
    }, []);

  return (
    <>
      <Box height='500px' border='1px solid black' p={2} overflow='auto'>
        {displayNodes.map((node) => {
          return (
            <RenderNode
              key={node.id}
              node={node}
              nestingLevel={0}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
              isEditable
              editNodeId={editNodeId}
              onEditDone={(nextValue) => {
                if (!editNodeId) {
                  return;
                }

                editNode(editNodeId, nextValue);
                refresh();
                setEditNodeId(null);
              }}
            />
          );
        })}
      </Box>
      <Box mt={3} display='flex' alignItems='center' gap={2}>
        <Button
          leftIcon={<AddIcon />}
          colorScheme='blue'
          variant='outline'
          isDisabled={!selectedNodeId}
          onClick={() => {
            if (!selectedNodeId) {
              return;
            }

            addNodeToCache(`child ${Date.now()}`, selectedNodeId);
            refresh();
            setSelectedNodeId(null);
          }}
        >
          Add
        </Button>
        <Button
          leftIcon={<EditIcon />}
          colorScheme='blue'
          variant='outline'
          isDisabled={!selectedNodeId}
          onClick={() => {
            if (!selectedNodeId) {
              return;
            }

            setEditNodeId(selectedNodeId);
            setSelectedNodeId(null);
          }}
        >
          Edit
        </Button>
      </Box>
    </>
  );
}

function App() {
  const middleItemRef = useRef(null);

  const [cache, setCache] = useState({});
  const [isCacheStale, setIsCacheStale] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const newData = await readCache();

      setCache(newData);
    };

    try {
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!isCacheStale) {
      return;
    }

    const fetchData = async () => {
      const newData = await readCache();

      setCache(newData);
    };

    try {
      fetchData();
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

DBTreeView.propTypes = {
  renderActionToPortal: PropTypes.func.isRequired,
  onCacheChanged: PropTypes.func.isRequired,
};

CachedTreeView.propTypes = {
  cache: PropTypes.object.isRequired,
  refresh: PropTypes.func.isRequired,
};
