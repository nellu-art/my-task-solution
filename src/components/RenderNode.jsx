import { PropTypes } from 'prop-types';
import { Box, Editable, EditableInput, EditablePreview, Button } from '@chakra-ui/react';

export function RenderNode({
  node,
  nestingLevel,
  onSelectNode,
  selectedNodeId,
  isEditable = false,
  editNodeId,
  onEditDone,
}) {
  return (
    <>
      <Box mb={1}>
        <Node
          value={node.value}
          leftOffset={nestingLevel * 16}
          selected={selectedNodeId === node.id}
          onSelect={() => onSelectNode(node.id)}
          isEditable={isEditable && editNodeId === node.id}
          onEditDone={onEditDone}
          deleted={node.deleted}
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
            editNodeId={editNodeId}
            onEditDone={onEditDone}
          />
        );
      })}
    </>
  );
}

const Node = ({ value, leftOffset, deleted, isEditable, selected, onSelect, onEditDone }) => {
  if (isEditable) {
    return (
      <Editable
        defaultValue={value}
        isDisabled={deleted}
        ml={`${leftOffset}px`}
        startWithEditView
        onSubmit={onEditDone}
      >
        <EditablePreview />
        <EditableInput onBlur={(e) => onEditDone?.(e.target.value)} />
      </Editable>
    );
  }

  return (
    <Button
      colorScheme='teal'
      variant={selected ? 'outline' : 'ghost'}
      isDisabled={deleted}
      onClick={onSelect}
      ml={`${leftOffset}px`}
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
  onEditDone: PropTypes.func,
};

RenderNode.propTypes = {
  node: PropTypes.object.isRequired,
  nestingLevel: PropTypes.number.isRequired,
  onSelectNode: PropTypes.func.isRequired,
  selectedNodeId: PropTypes.string,
  isEditable: PropTypes.bool,
  editNodeId: PropTypes.string,
  onEditDone: PropTypes.func,
};
