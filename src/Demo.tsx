import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography
} from '@mui/material';
import {
  ExpandMore,
  Folder,
  FolderOpen,
  InsertDriveFile,
  Description,
  Image,
  Code
} from '@mui/icons-material';

// ============================================
// REUSABLE TREE VIEW COMPONENT
// ============================================

const defaultGetIcon = (iconType, isExpanded = false) => {
  switch (iconType) {
    case 'folder':
      return isExpanded ? <FolderOpen color="primary" /> : <Folder color="action" />;
    case 'document':
      return <Description color="info" />;
    case 'image':
      return <Image color="success" />;
    case 'code':
      return <Code color="warning" />;
    default:
      return <InsertDriveFile color="action" />;
  }
};

const TreeNode = ({ 
  node, 
  level = 0, 
  onSelect, 
  selectedId,
  getIcon,
  indentSize,
  minHeight
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(node);
    }
  };

  const isSelected = selectedId === node.id;

  if (!hasChildren) {
    // Leaf node - render as ListItem
    return (
      <ListItem 
        disablePadding 
        sx={{ pl: level * indentSize }}
      >
        <ListItemButton 
          onClick={handleClick}
          selected={isSelected}
          sx={{ minHeight }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {getIcon(node.icon, false)}
          </ListItemIcon>
          <ListItemText primary={node.label} />
        </ListItemButton>
      </ListItem>
    );
  }

  // Parent node - render as Accordion
  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionChange}
      disableGutters
      elevation={0}
      sx={{
        '&:before': { display: 'none' },
        backgroundColor: 'transparent',
        boxShadow: 'none'
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          pl: level * indentSize,
          minHeight,
          flexDirection: 'row-reverse',
          '&.Mui-expanded': { minHeight },
          '& .MuiAccordionSummary-expandIconWrapper': {
            marginRight: 1,
            marginLeft: 0
          },
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
            alignItems: 'center',
            '&.Mui-expanded': { margin: '12px 0' }
          },
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
        onClick={handleClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIcon(node.icon, expanded)}
          <Typography>{node.label}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <List disablePadding>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              getIcon={getIcon}
              indentSize={indentSize}
              minHeight={minHeight}
            />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

/**
 * Reusable Tree View Component
 * 
 * @param {Object} props
 * @param {Array} props.data - Tree data structure (array of nodes)
 * @param {Function} props.onNodeSelect - Callback when a node is selected
 * @param {string} props.selectedId - ID of the currently selected node
 * @param {Function} props.getIcon - Custom icon renderer function
 * @param {number} props.indentSize - Indentation size per level (default: 3)
 * @param {number} props.minHeight - Minimum height for each node (default: 48)
 * @param {Object} props.containerSx - Custom sx props for the container
 * @param {boolean} props.showBorder - Show border around tree (default: true)
 */
export const TreeView = ({
  data = [],
  onNodeSelect,
  selectedId,
  getIcon = defaultGetIcon,
  indentSize = 3,
  minHeight = 48,
  containerSx = {},
  showBorder = true
}) => {
  return (
    <Box
      sx={{
        border: showBorder ? '1px solid' : 'none',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        ...containerSx
      }}
    >
      <List disablePadding>
        {data.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            onSelect={onNodeSelect}
            selectedId={selectedId}
            getIcon={getIcon}
            indentSize={indentSize}
            minHeight={minHeight}
          />
        ))}
      </List>
    </Box>
  );
};

// ============================================
// EXAMPLE USAGE
// ============================================

const sampleData = [
  {
    id: '1',
    label: 'Documents',
    icon: 'folder',
    children: [
      {
        id: '1-1',
        label: 'Work',
        icon: 'folder',
        children: [
          { id: '1-1-1', label: 'Report.pdf', icon: 'file' },
          { id: '1-1-2', label: 'Presentation.pptx', icon: 'file' }
        ]
      },
      {
        id: '1-2',
        label: 'Personal',
        icon: 'folder',
        children: [
          { id: '1-2-1', label: 'Resume.docx', icon: 'document' },
          { id: '1-2-2', label: 'Photo.jpg', icon: 'image' }
        ]
      }
    ]
  },
  {
    id: '2',
    label: 'Projects',
    icon: 'folder',
    children: [
      {
        id: '2-1',
        label: 'Website',
        icon: 'folder',
        children: [
          { id: '2-1-1', label: 'index.html', icon: 'code' },
          { id: '2-1-2', label: 'styles.css', icon: 'code' },
          { id: '2-1-3', label: 'script.js', icon: 'code' }
        ]
      },
      { id: '2-2', label: 'README.md', icon: 'document' }
    ]
  },
  {
    id: '3',
    label: 'Downloads',
    icon: 'folder',
    children: [
      { id: '3-1', label: 'installer.exe', icon: 'file' },
      { id: '3-2', label: 'backup.zip', icon: 'file' }
    ]
  }
];

export default function TreeViewExample() {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    console.log('Selected:', node);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Reusable Tree View Component
      </Typography>
      
      <TreeView
        data={sampleData}
        onNodeSelect={handleNodeSelect}
        selectedId={selectedNode?.id}
        indentSize={3}
        minHeight={48}
        showBorder={true}
      />

      {selectedNode && (
        <Box 
          sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            border: '1px solid', 
            borderColor: 'divider' 
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Selected Item:
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
            {selectedNode.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {selectedNode.id}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Type: {selectedNode.children ? 'Folder' : 'File'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Installation required:
// npm install @mui/material @mui/icons-material @emotion/react @emotion/styled