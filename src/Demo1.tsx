import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";
import {
  ExpandMore,
  Folder,
  FolderOpen,
  InsertDriveFile,
  Description,
  Image,
  Code,
} from "@mui/icons-material";

// ============================================
// REUSABLE TREE SELECTION COMPONENT
// ============================================

const defaultGetIcon = (iconType, isExpanded = false) => {
  switch (iconType) {
    case "folder":
      return isExpanded ? (
        <FolderOpen color="primary" />
      ) : (
        <Folder color="action" />
      );
    case "document":
      return <Description color="info" />;
    case "image":
      return <Image color="success" />;
    case "code":
      return <Code color="warning" />;
    default:
      return <InsertDriveFile color="action" />;
  }
};

const TreeNode = ({
  node,
  level = 0,
  selectedIds,
  onSelectionChange,
  multiSelect,
  showCheckboxes,
  getIcon,
  indentSize,
  minHeight,
  disableParentSelection,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  const handleSelect = (event) => {
    event.stopPropagation();

    if (disableParentSelection && hasChildren) {
      return; // Don't allow selecting parent nodes
    }

    if (multiSelect) {
      // Multi-select mode
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(node.id)) {
        newSelectedIds.delete(node.id);
      } else {
        newSelectedIds.add(node.id);
      }
      onSelectionChange(Array.from(newSelectedIds));
    } else {
      // Single-select mode
      const newSelection = selectedIds.includes(node.id) ? [] : [node.id];
      onSelectionChange(newSelection);
    }
  };

  const isSelected = selectedIds.includes(node.id);
  const isSelectable = !disableParentSelection || !hasChildren;

  if (!hasChildren) {
    // Leaf node - render as ListItem
    return (
      <ListItem disablePadding sx={{ pl: level * indentSize }}>
        <ListItemButton
          onClick={handleSelect}
          selected={isSelected}
          sx={{ minHeight }}
        >
          {showCheckboxes && (
            <Checkbox
              edge="start"
              checked={isSelected}
              tabIndex={-1}
              disableRipple
              sx={{ mr: 1 }}
            />
          )}
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
        "&:before": { display: "none" },
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          pl: level * indentSize,
          minHeight,
          flexDirection: "row-reverse",
          backgroundColor: isSelected ? "action.selected" : "transparent",
          "&.Mui-expanded": { minHeight },
          "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: 1,
            marginLeft: 0,
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            alignItems: "center",
            "&.Mui-expanded": { margin: "12px 0" },
          },
          "&:hover": {
            backgroundColor: isSelectable ? "action.hover" : "transparent",
          },
          cursor: isSelectable ? "pointer" : "default",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
          onClick={isSelectable ? handleSelect : undefined}
        >
          {showCheckboxes && isSelectable && (
            <Checkbox
              edge="start"
              checked={isSelected}
              tabIndex={-1}
              disableRipple
              onClick={handleSelect}
              sx={{ mr: 1 }}
            />
          )}
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
              selectedIds={selectedIds}
              onSelectionChange={onSelectionChange}
              multiSelect={multiSelect}
              showCheckboxes={showCheckboxes}
              getIcon={getIcon}
              indentSize={indentSize}
              minHeight={minHeight}
              disableParentSelection={disableParentSelection}
            />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

/**
 * Reusable Tree Selection Component
 * Optimized for selection interfaces rather than navigation
 *
 * @param {Object} props
 * @param {Array} props.data - Tree data structure (array of nodes)
 * @param {Array} props.selectedIds - Array of selected node IDs
 * @param {Function} props.onSelectionChange - Callback when selection changes (receives array of IDs)
 * @param {boolean} props.multiSelect - Enable multi-selection (default: true)
 * @param {boolean} props.showCheckboxes - Show checkboxes for selection (default: true)
 * @param {boolean} props.disableParentSelection - Disable selection of parent nodes (default: false)
 * @param {Function} props.getIcon - Custom icon renderer function
 * @param {number} props.indentSize - Indentation size per level (default: 3)
 * @param {number} props.minHeight - Minimum height for each node (default: 48)
 * @param {Object} props.containerSx - Custom sx props for the container
 * @param {boolean} props.showBorder - Show border around tree (default: true)
 */
export const TreeSelection = ({
  data = [],
  selectedIds = [],
  onSelectionChange,
  multiSelect = true,
  showCheckboxes = true,
  disableParentSelection = false,
  getIcon = defaultGetIcon,
  indentSize = 3,
  minHeight = 48,
  containerSx = {},
  showBorder = true,
}) => {
  return (
    <Box
      sx={{
        border: showBorder ? "1px solid" : "none",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        backgroundColor: "background.paper",
        ...containerSx,
      }}
    >
      <List disablePadding>
        {data.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            multiSelect={multiSelect}
            showCheckboxes={showCheckboxes}
            getIcon={getIcon}
            indentSize={indentSize}
            minHeight={minHeight}
            disableParentSelection={disableParentSelection}
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
    id: "1",
    label: "Documents",
    icon: "folder",
    children: [
      {
        id: "1-1",
        label: "Work",
        icon: "folder",
        children: [
          { id: "1-1-1", label: "Report.pdf", icon: "file" },
          { id: "1-1-2", label: "Presentation.pptx", icon: "file" },
        ],
      },
      {
        id: "1-2",
        label: "Personal",
        icon: "folder",
        children: [
          { id: "1-2-1", label: "Resume.docx", icon: "document" },
          { id: "1-2-2", label: "Photo.jpg", icon: "image" },
        ],
      },
    ],
  },
  {
    id: "2",
    label: "Projects",
    icon: "folder",
    children: [
      {
        id: "2-1",
        label: "Website",
        icon: "folder",
        children: [
          { id: "2-1-1", label: "index.html", icon: "code" },
          { id: "2-1-2", label: "styles.css", icon: "code" },
          { id: "2-1-3", label: "script.js", icon: "code" },
        ],
      },
      { id: "2-2", label: "README.md", icon: "document" },
    ],
  },
  {
    id: "3",
    label: "Downloads",
    icon: "folder",
    children: [
      { id: "3-1", label: "installer.exe", icon: "file" },
      { id: "3-2", label: "backup.zip", icon: "file" },
    ],
  },
];

export default function TreeSelectionExample() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [multiSelect, setMultiSelect] = useState(true);
  const [showCheckboxes, setShowCheckboxes] = useState(true);
  const [disableParentSelection, setDisableParentSelection] = useState(false);

  const handleSelectionChange = (newSelectedIds) => {
    setSelectedIds(newSelectedIds);
    console.log("Selected IDs:", newSelectedIds);
  };

  const getSelectedNodes = () => {
    const findNodes = (nodes, ids) => {
      let result = [];
      for (const node of nodes) {
        if (ids.includes(node.id)) {
          result.push(node);
        }
        if (node.children) {
          result = result.concat(findNodes(node.children, ids));
        }
      }
      return result;
    };
    return findNodes(sampleData, selectedIds);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Tree Selection Interface
      </Typography>

      {/* Controls */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Checkbox
            checked={multiSelect}
            onChange={(e) => setMultiSelect(e.target.checked)}
          />
          <Typography component="span">Multi-Select</Typography>
        </Box>
        <Box>
          <Checkbox
            checked={showCheckboxes}
            onChange={(e) => setShowCheckboxes(e.target.checked)}
          />
          <Typography component="span">Show Checkboxes</Typography>
        </Box>
        <Box>
          <Checkbox
            checked={disableParentSelection}
            onChange={(e) => setDisableParentSelection(e.target.checked)}
          />
          <Typography component="span">Disable Parent Selection</Typography>
        </Box>
      </Box>

      <TreeSelection
        data={sampleData}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        multiSelect={multiSelect}
        showCheckboxes={showCheckboxes}
        disableParentSelection={disableParentSelection}
        indentSize={3}
        minHeight={48}
        showBorder={true}
      />

      {/* Selection Summary */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Selected Items ({selectedIds.length}):
        </Typography>
        {selectedIds.length > 0 ? (
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            {getSelectedNodes().map((node) => (
              <Typography component="li" key={node.id} variant="body2">
                {node.label}{" "}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  ({node.id})
                </Typography>
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No items selected
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Installation required:
// npm install @mui/material @mui/icons-material @emotion/react @emotion/style
