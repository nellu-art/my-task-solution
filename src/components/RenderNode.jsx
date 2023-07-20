import { PropTypes } from 'prop-types';
import { Box, Editable, EditableInput, EditablePreview, Button } from '@chakra-ui/react';

export function RenderNode({
  node,
  nestingLevel = 0,
  onSelectNode,
  selectedNodeId,
  isEditable = false,
}) {
  return (
    <>
      <Box mb={1}>
        <Node
          value={node.value}
          leftOffset={nestingLevel * 2}
          selected={selectedNodeId === node.id}
          onSelect={() => onSelectNode(node.id)}
          isEditable={isEditable}
        />
      </Box>
      {node.children.map((child) => {
        return (
          <RenderNode
            key={child.id}
            node={child}
            nestingLevel={nestingLevel + 1}
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNodeId}
            isEditable={isEditable}
          />
        );
      })}
    </>
  );
}

const Node = ({ value, leftOffset, deleted, isEditable, selected, onSelect }) => {
  if (isEditable) {
    return (
      <Editable defaultValue={value} isDisabled={deleted}>
        <EditablePreview />
        <EditableInput />
      </Editable>
    );
  }

  return (
    <Button
      colorScheme='teal'
      variant={selected ? 'outline' : 'ghost'}
      isDisabled={deleted}
      onClick={onSelect}
      ml={leftOffset}
    >
      {value}
    </Button>
  );
};

Node.propTypes = {
  value: PropTypes.string.isRequired,
  leftOffset: PropTypes.number.isRequired,
  deleted: PropTypes.bool,
  isEditable: PropTypes.bool,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
};

RenderNode.propTypes = {
  node: PropTypes.object.isRequired,
  nestingLevel: PropTypes.number.isRequired,
  onSelectNode: PropTypes.func.isRequired,
  selectedNodeId: PropTypes.string,
  isEditable: PropTypes.bool,
};
