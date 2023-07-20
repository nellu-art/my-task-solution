import { PropTypes } from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Badge } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon, ArrowLeftIcon } from '@chakra-ui/icons';

import { readDatabase, loadNodeToCache } from '../api/endpoints';
import { isChildOf } from '../utils/isChildOf';

import { RenderNode } from './RenderNode';

function mapNodeChildrenWithData(node, data) {
  return {
    ...node,
    children: node.children
      .map((childId) => data.find((item) => item.id === childId))
      .filter((value) => !!value)
      .map((child) => mapNodeChildrenWithData(child, data)),
  };
}

export function DBTreeView({ renderActionToPortal, onCacheChanged, isDBUpdated, onDoneDBUpdate }) {
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

  useEffect(() => {
    if (!isDBUpdated) {
      return;
    }

    const fetchData = async () => {
      const newData = await readDatabase(pagination.offset);

      setNodes(newData.data);
      setPagination(newData.pagination);
    };

    try {
      fetchData();
      onDoneDBUpdate();
    } catch (error) {
      console.error(error);
    }
  }, [isDBUpdated, onDoneDBUpdate, pagination.offset]);

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

DBTreeView.propTypes = {
  renderActionToPortal: PropTypes.func.isRequired,
  onCacheChanged: PropTypes.func.isRequired,
  isDBUpdated: PropTypes.bool.isRequired,
  onDoneDBUpdate: PropTypes.func.isRequired,
};
