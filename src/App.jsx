import { PropTypes } from 'prop-types';
import { Box, Button } from '@chakra-ui/react';
import { useState } from 'react';

import { Database } from './api/Database';
import { Cache } from './api/Cache';

import './App.css';

const db = new Database();
const cache = new Cache(db);

cache.fetch(db.root.id);

cache.add('Hello', db.root.id);

function RenderNode({ node, offset = 0, onSelectNode, selectedNodeId }) {
  return (
    <>
      <Box
        pl={offset * 2}
        textAlign='left'
        pt={1}
        onClick={() => onSelectNode(node.id)}
        cursor='pointer'
        border={selectedNodeId === node.id && '2px solid green'}
      >
        {node.value}
      </Box>
      {node.children.map((child) => {
        return (
          <RenderNode
            key={child.id}
            node={child}
            offset={offset + 1}
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNodeId}
          />
        );
      })}
    </>
  );
}

RenderNode.propTypes = {
  node: PropTypes.object.isRequired,
  offset: PropTypes.number.isRequired,
  onSelectNode: PropTypes.func.isRequired,
  selectedNodeId: PropTypes.string,
};

function mapNodeChildrenWithData(node, data) {
  return {
    ...node,
    children: node.children
      .map((childId) => data[childId] ?? null)
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

function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const data = { ...cache.data, ...cache.changes };

  const displayData = Object.values(data).reduce((result, node) => {
    const isIncluded = result.some((item) => isChildOf(node, item));

    if (isIncluded) {
      return result;
    }

    const newNode = mapNodeChildrenWithData(node, data);

    result.push(newNode);

    return result;
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          if (!selectedNodeId) {
            return;
          }
          cache.add('New node', selectedNodeId);
          setSelectedNodeId(null);
        }}
      >
        Add new node
      </Button>
      <Box>
        {displayData.map((node) => {
          return (
            <RenderNode
              key={node.id}
              node={node}
              offset={0}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />
          );
        })}
      </Box>
    </>
  );
}

export default App;
