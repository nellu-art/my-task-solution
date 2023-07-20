import { PropTypes } from 'prop-types';
import { Box } from '@chakra-ui/react';

export function RenderNode({ node, nestingLevel = 0, onSelectNode, selectedNodeId }) {
  return (
    <>
      <Box
        pl={nestingLevel * 2}
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
            nestingLevel={nestingLevel + 1}
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
  nestingLevel: PropTypes.number.isRequired,
  onSelectNode: PropTypes.func.isRequired,
  selectedNodeId: PropTypes.string,
};
