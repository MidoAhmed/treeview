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
  Radio,
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
  selectionType,
  getIcon,
  indentSize,
  minHeight,
  disableParentSelection,
  striped,
  getNextIndex,
  compact,
}) => {
  // Get current index for this node
  const currentIndex = getNextIndex();
  const isStriped = striped && currentIndex % 2 === 1;
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
      // Single-select mode (radio behavior)
      const newSelection = selectedIds.includes(node.id) ? [] : [node.id];
      onSelectionChange(newSelection);
    }
  };

  const isSelected = selectedIds.includes(node.id);
  const isSelectable = !disableParentSelection || !hasChildren;

  // Render selection control (checkbox or radio)
  const renderSelectionControl = () => {
    if (!showCheckboxes) return null;

    const size = compact ? "small" : "medium";
    const sx = { mr: compact ? 0.5 : 1 };

    if (selectionType === "radio") {
      return (
        <Radio
          edge="start"
          checked={isSelected}
          tabIndex={-1}
          disableRipple
          size={size}
          sx={sx}
        />
      );
    }

    return (
      <Checkbox
        edge="start"
        checked={isSelected}
        tabIndex={-1}
        disableRipple
        size={size}
        sx={sx}
      />
    );
  };

  if (!hasChildren) {
    // Leaf node - render as ListItem
    return (
      <ListItem
        disablePadding
        sx={{
          pl: level * indentSize,
          backgroundColor: isStriped ? "action.hover" : "transparent",
        }}
      >
        <ListItemButton
          onClick={handleSelect}
          selected={isSelected}
          sx={{
            minHeight,
            py: compact ? 0.5 : 1,
          }}
        >
          {renderSelectionControl()}
          <ListItemIcon sx={{ minWidth: compact ? 32 : 40 }}>
            {getIcon(node.icon, false)}
          </ListItemIcon>
          <ListItemText
            primary={node.label}
            primaryTypographyProps={{
              fontSize: compact ? "0.875rem" : "1rem",
            }}
          />
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
        backgroundColor: isStriped ? "action.hover" : "transparent",
        boxShadow: "none",
      }}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMore sx={{ fontSize: compact ? "1.25rem" : "1.5rem" }} />
        }
        sx={{
          pl: level * indentSize,
          minHeight,
          py: compact ? 0 : "auto",
          flexDirection: "row-reverse",
          backgroundColor: isSelected ? "action.selected" : "inherit",
          "&.Mui-expanded": { minHeight },
          "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: compact ? 0.5 : 1,
            marginLeft: 0,
          },
          "& .MuiAccordionSummary-content": {
            margin: compact ? "8px 0" : "12px 0",
            alignItems: "center",
            "&.Mui-expanded": { margin: compact ? "8px 0" : "12px 0" },
          },
          "&:hover": {
            backgroundColor: isSelectable ? "action.hover" : "inherit",
          },
          cursor: isSelectable ? "pointer" : "default",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: compact ? 0.5 : 1,
            flex: 1,
          }}
          onClick={isSelectable ? handleSelect : undefined}
        >
          {showCheckboxes && isSelectable && renderSelectionControl()}
          {getIcon(node.icon, expanded)}
          <Typography sx={{ fontSize: compact ? "0.875rem" : "1rem" }}>
            {node.label}
          </Typography>
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
              selectionType={selectionType}
              getIcon={getIcon}
              indentSize={indentSize}
              minHeight={minHeight}
              disableParentSelection={disableParentSelection}
              striped={striped}
              getNextIndex={getNextIndex}
              compact={compact}
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
 * @param {boolean} props.showCheckboxes - Show selection controls (default: true)
 * @param {string} props.selectionType - Type of selection control: 'checkbox' or 'radio' (default: 'checkbox')
 * @param {boolean} props.disableParentSelection - Disable selection of parent nodes (default: false)
 * @param {boolean} props.striped - Enable striped rows for better visual separation (default: false)
 * @param {boolean} props.compact - Enable compact mode with reduced spacing and smaller elements (default: false)
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
  selectionType = "checkbox",
  disableParentSelection = false,
  striped = false,
  compact = false,
  getIcon = defaultGetIcon,
  indentSize = 3,
  minHeight = 48,
  containerSx = {},
  showBorder = true,
}) => {
  // Counter for striped rows - counts all visible nodes
  let rowCounter = -1;
  const getNextIndex = () => {
    rowCounter += 1;
    return rowCounter;
  };

  // Adjust minHeight for compact mode
  const effectiveMinHeight = compact ? 36 : minHeight;

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
            selectionType={selectionType}
            getIcon={getIcon}
            indentSize={indentSize}
            minHeight={effectiveMinHeight}
            disableParentSelection={disableParentSelection}
            striped={striped}
            getNextIndex={getNextIndex}
            compact={compact}
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
  const [selectionType, setSelectionType] = useState("checkbox");
  const [disableParentSelection, setDisableParentSelection] = useState(false);
  const [striped, setStriped] = useState(false);
  const [compact, setCompact] = useState(false);

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
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Box>
          <Checkbox
            checked={multiSelect}
            onChange={(e) => {
              setMultiSelect(e.target.checked);
              if (!e.target.checked) {
                // Switch to radio when multi-select is disabled
                setSelectionType("radio");
              }
            }}
          />
          <Typography component="span">Multi-Select</Typography>
        </Box>
        <Box>
          <Checkbox
            checked={showCheckboxes}
            onChange={(e) => setShowCheckboxes(e.target.checked)}
          />
          <Typography component="span">Show Selection Controls</Typography>
        </Box>
        <Box>
          <Radio
            checked={selectionType === "radio"}
            onChange={() => {
              setSelectionType("radio");
              setMultiSelect(false);
            }}
          />
          <Typography component="span">Radio</Typography>
          <Radio
            checked={selectionType === "checkbox"}
            onChange={() => {
              setSelectionType("checkbox");
              setMultiSelect(true);
            }}
            sx={{ ml: 2 }}
          />
          <Typography component="span">Checkbox</Typography>
        </Box>
        <Box>
          <Checkbox
            checked={disableParentSelection}
            onChange={(e) => setDisableParentSelection(e.target.checked)}
          />
          <Typography component="span">Disable Parent Selection</Typography>
        </Box>
        <Box>
          <Checkbox
            checked={striped}
            onChange={(e) => setStriped(e.target.checked)}
          />
          <Typography component="span">Striped Rows</Typography>
        </Box>
        <Box>
          <Checkbox
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
          />
          <Typography component="span">Compact Mode</Typography>
        </Box>
      </Box>

      <TreeSelection
        data={sampleData}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        multiSelect={multiSelect}
        showCheckboxes={showCheckboxes}
        selectionType={selectionType}
        disableParentSelection={disableParentSelection}
        striped={striped}
        compact={compact}
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
// npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
