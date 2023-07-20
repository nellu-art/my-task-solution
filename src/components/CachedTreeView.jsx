import { PropTypes } from 'prop-types';
import { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { isEmpty, merge } from 'lodash';

import { addNodeToCache, editNode, deleteNode, saveChanges, cancelChanges } from '../api/endpoints';
import { isChildOf } from '../utils/isChildOf';

import { RenderNode } from './RenderNode';

function mapNodeChildrenWithCacheData(node, cache) {
  return {
    ...node,
    children: node.children
      .map((childId) => cache[childId] ?? null)
      .filter((value) => !!value)
      .map((child) => mapNodeChildrenWithCacheData(child, cache)),
  };
}

export function CachedTreeView({ cache, refresh, renderActions }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editNodeId, setEditNodeId] = useState(null);

  const allChanges = merge(cache.data, cache.changes);

  const displayNodes = Object.values(allChanges)
    .map((node) => mapNodeChildrenWithCacheData(node, allChanges))
    .reduce((result, node, _, list) => {
      const isIncluded = list.some((item) => isChildOf(node, item));

      if (isIncluded) {
        return result;
      } else {
        result.push(node);
      }

      return result;
    }, []);

  const hasChanges = !isEmpty(cache.changes);

  return (
    <>
      {renderActions(
        <Box display='flex' mb={3} gap={3}>
          <Button
            colorScheme='green'
            isDisabled={!hasChanges}
            onClick={() => {
              saveChanges();
              refresh({ dbUpdated: true });
            }}
          >
            Apply
          </Button>
          <Button
            isDisabled={!hasChanges}
            onClick={() => {
              cancelChanges();
              refresh();
            }}
          >
            Cancel
          </Button>
        </Box>
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
      <Box mt={3} display='flex'>
        <Box display='flex' gap={2} flex={1}>
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
        <Button
          leftIcon={<DeleteIcon />}
          colorScheme='red'
          variant='solid'
          isDisabled={!selectedNodeId}
          onClick={() => {
            if (!selectedNodeId) {
              return;
            }

            deleteNode(selectedNodeId);
            refresh();
            setSelectedNodeId(null);
          }}
        >
          Delete
        </Button>
      </Box>
    </>
  );
}

CachedTreeView.propTypes = {
  cache: PropTypes.object.isRequired,
  refresh: PropTypes.func.isRequired,
  renderActions: PropTypes.func.isRequired,
};
