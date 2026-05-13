import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Null-safe array accessor. */
const toArray = (val) => val ?? [];

/** Number of documents directly inside a subcategory. */
const subDocCount = (sub) => toArray(sub.documents).length;

/** Total document count for a category: own docs + all subcategory docs. */
const catDocCount = (cat) =>
  toArray(cat.documents).length +
  toArray(cat.subCategories).reduce((sum, sub) => sum + subDocCount(sub), 0);

/** Shared sx for every sidebar / menu list item. */
const sidebarItemSx = (theme) => ({
  py: 1.5,
  px: 2,
  textTransform: "none",
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.selected, // TODO: update to #EBF5FF from theme color
    borderRight: `2px solid ${theme.palette.primary.main}`, // TODO:update to #003368 from theme color
  },
});

const selectedFolderIconSx = (theme) => ({
  color: theme.palette.primary.main, // TODO: update to #003368 from theme color
});

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Folder icon that switches between filled and outlined based on selection. */
const FolderItemIcon = ({ selected, size }) => (
  <ListItemIcon sx={{ minWidth: 36 }}>
    {selected ? (
      <FolderIcon sx={selectedFolderIconSx} fontSize={size} />
    ) : (
      <FolderOutlinedIcon fontSize={size} />
    )}
  </ListItemIcon>
);

// ---------------------------------------------------------------------------
// DocumentMenu
// ---------------------------------------------------------------------------

/**
 * Props:
 *  - documents: Array of category objects
 *    { id, displayCategoryName, subCategories, documents, ... }
 */
export default function DocumentMenu({ documents = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // TODO: confirm sm breakpoint starts at 767px when integrating

  // null = "My Documents" (all docs)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null); // desktop only
  const [anchorEl, setAnchorEl] = useState(null); // mobile menu anchor

  const mobileOpen = Boolean(anchorEl);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const selectedCategory = useMemo(
    () => documents.find((c) => c.id === selectedCategoryId) ?? null,
    [documents, selectedCategoryId],
  );

  const selectedSubCategory = useMemo(
    () =>
      selectedCategory?.subCategories?.find(
        (s) => s.id === selectedSubCategoryId,
      ) ?? null,
    [selectedCategory, selectedSubCategoryId],
  );

  // The label shown in the mobile button and the content-area heading.
  const activeLabel =
    selectedSubCategory?.displaySubCategoryName ??
    selectedCategory?.displayCategoryName ??
    "My Documents";

  const displayedDocs = useMemo(() => {
    if (!selectedCategoryId) {
      // "My Documents" — flatten all docs across every category and subcategory
      return documents.flatMap((cat) => [
        ...toArray(cat.documents),
        ...toArray(cat.subCategories).flatMap((sub) => toArray(sub.documents)),
      ]);
    }
    if (!selectedCategory) return [];
    if (selectedSubCategory) return toArray(selectedSubCategory.documents);
    // Category with no subcategories (e.g. "Other Documents")
    return toArray(selectedCategory.documents);
  }, [documents, selectedCategoryId, selectedCategory, selectedSubCategory]);

  // Categories / subcategories that have at least one document (used in both views).
  const visibleCategories = useMemo(
    () => documents.filter((cat) => catDocCount(cat) > 0),
    [documents],
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(null);
    setExpandedCategoryId((prev) => (catId && prev !== catId ? catId : null));
    setAnchorEl(null);
  };

  const handleSubCategorySelect = (catId, subId) => {
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(subId);
    setAnchorEl(null);
  };

  // ---------------------------------------------------------------------------
  // Render: document list (content area) - ***IGNORE THIS PART WHEN INTEGRATING***
  // ---------------------------------------------------------------------------

  const renderDocumentList = () => {
    if (!displayedDocs.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          No documents in this category.
        </Typography>
      );
    }
    return (
      <List disablePadding>
        {displayedDocs.map((doc) => (
          <ListItem key={doc.documentTransactionalId} sx={{ py: 1, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <InsertDriveFileOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary={doc.title}
              secondary={[
                doc.fileDate &&
                  new Date(doc.fileDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                doc.fileType && doc.fileType.toUpperCase(),
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: desktop sidebar
  // ---------------------------------------------------------------------------

  const renderDesktopSidebar = () => (
    <Paper
      elevation={0}
      sx={{ borderRight: `1px solid ${theme.palette.divider}`, minHeight: 240 }}
      className="side-bar-wrapper h-full"
    >
      {/* TODO: update to desired divider color ^ from theme */}
      <List component="nav" disablePadding>
        {/* My Documents */}
        <ListItemButton
          selected={selectedCategoryId === null}
          onClick={() => handleCategorySelect(null)}
          sx={sidebarItemSx(theme)}
        >
          <FolderItemIcon selected={selectedCategoryId === null} />
          <ListItemText primary="My Documents" />
        </ListItemButton>

        {/* Categories */}
        {visibleCategories.map((cat) => {
          const isCatSelected = selectedCategoryId === cat.id;
          const isExpanded = expandedCategoryId === cat.id;
          const visibleSubs = toArray(cat.subCategories).filter(
            (sub) => subDocCount(sub) > 0,
          );

          return (
            <React.Fragment key={cat.id}>
              <ListItemButton
                selected={isCatSelected && !selectedSubCategoryId}
                onClick={() => handleCategorySelect(cat.id)}
                sx={sidebarItemSx(theme)}
              >
                <FolderItemIcon selected={isCatSelected} />
                <ListItemText primary={cat.displayCategoryName} />
                {visibleSubs.length > 0 &&
                  (isExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  ))}
              </ListItemButton>

              {visibleSubs.length > 0 && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {visibleSubs.map((sub) => {
                      const isSubSelected =
                        isCatSelected && selectedSubCategoryId === sub.id;
                      return (
                        <ListItemButton
                          key={sub.id}
                          selected={isSubSelected}
                          onClick={() =>
                            handleSubCategorySelect(cat.id, sub.id)
                          }
                          sx={{ ...sidebarItemSx(theme), pl: 5 }}
                        >
                          <FolderItemIcon
                            selected={isSubSelected}
                            size="small"
                          />
                          <ListItemText
                            primaryTypographyProps={{ variant: "body2" }}
                            primary={sub.displaySubCategoryName}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );

  // ---------------------------------------------------------------------------
  // Render: mobile dropdown
  // ---------------------------------------------------------------------------

  const renderMobileDropdown = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        variant="text"
        id="category-button"
        aria-controls={mobileOpen ? "category-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={mobileOpen ? "true" : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ExpandMoreIcon />}
        sx={{
          justifyContent: "flex-start",
          textTransform: "none",
          color: "text.primary",
        }}
      >
        <FolderIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        {/* TODO: update ^ to desired color from theme */}
        <Typography variant="subtitle1">{activeLabel}</Typography>
      </Button>

      <Menu
        id="category-menu"
        anchorEl={anchorEl}
        open={mobileOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        MenuListProps={{ "aria-labelledby": "category-button" }}
      >
        {/* My Documents */}
        <MenuItem
          selected={selectedCategoryId === null}
          onClick={() => handleCategorySelect(null)}
        >
          <FolderItemIcon selected={selectedCategoryId === null} />
          <ListItemText>My Documents</ListItemText>
        </MenuItem>

        {/* Categories + indented subcategories */}
        {visibleCategories.map((cat) => {
          const isCatSelected = selectedCategoryId === cat.id;
          const visibleSubs = toArray(cat.subCategories).filter(
            (sub) => subDocCount(sub) > 0,
          );

          return (
            <React.Fragment key={cat.id}>
              <MenuItem
                selected={isCatSelected && !selectedSubCategoryId}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <FolderItemIcon selected={isCatSelected} />
                <ListItemText>{cat.displayCategoryName}</ListItemText>
              </MenuItem>

              {visibleSubs.map((sub) => {
                const isSubSelected =
                  isCatSelected && selectedSubCategoryId === sub.id;
                return (
                  <MenuItem
                    key={sub.id}
                    selected={isSubSelected}
                    onClick={() => handleSubCategorySelect(cat.id, sub.id)}
                    sx={{ pl: 5 }}
                  >
                    <FolderItemIcon selected={isSubSelected} size="small" />
                    <ListItemText>
                      <Typography variant="body2">
                        {sub.displaySubCategoryName}
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                );
              })}
            </React.Fragment>
          );
        })}
      </Menu>
    </Box>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  // True when a category with visible subcategories is selected but none chosen yet.
  const awaitingSubCategorySelection =
    selectedCategory &&
    !selectedSubCategoryId &&
    toArray(selectedCategory.subCategories).some((sub) => subDocCount(sub) > 0);

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4, md: 3 }} className="side-bar-grid">
          {isMobile ? renderMobileDropdown() : renderDesktopSidebar()}
        </Grid>

        {/* ***IGNORE THIS PART WHEN INTEGRATING*** */}
        <Grid size={{ xs: 12, sm: 8, md: 9 }}>
          <Box sx={{ pl: { xs: 0, sm: 3 }, pt: { xs: 1, sm: 0 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your service categories
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "background.paper",
                boxShadow: 1,
                minHeight: 160,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {activeLabel}
              </Typography>

              {awaitingSubCategorySelection ? (
                <Typography variant="body2" color="text.secondary">
                  Select a subcategory to view documents.
                </Typography>
              ) : (
                renderDocumentList()
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
