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

/** Shared sx for desktop sidebar list items */
function sidebarItemSx(theme) {
  return {
    py: 1.5,
    px: 2,
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
      borderRight: `4px solid ${theme.palette.primary.main}`,
    },
    textTransform: "none",
  };
}

/**
 * DocumentMenu
 * Props:
 *  - documents: Array of category objects matching the new data shape
 *    { id, displayCategoryName, seCategoryName, subCategories, documents }
 */
export default function DocumentMenu({ documents = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // --- Selection state ---
  // selectedCategoryId: null = "My Documents"
  // selectedSubCategoryId: null = show subcategory list for the selected category
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);

  // Desktop: track which category is expanded in the sidebar
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  // Mobile menu anchor
  const [anchorEl, setAnchorEl] = useState(null);
  const mobileOpen = Boolean(anchorEl);

  // --- Derived data ---
  const selectedCategory = useMemo(
    () => documents.find((c) => c.id === selectedCategoryId) ?? null,
    [documents, selectedCategoryId],
  );

  const selectedSubCategory = useMemo(() => {
    if (!selectedCategory || !selectedSubCategoryId) return null;
    return (
      selectedCategory.subCategories?.find(
        (s) => s.id === selectedSubCategoryId,
      ) ?? null
    );
  }, [selectedCategory, selectedSubCategoryId]);

  /** Safe accessor - returns [] when the field is null/undefined */
  const safeDocs = (arr) => arr ?? [];
  const safeSubCats = (arr) => arr ?? [];

  /** Total document count for a subcategory */
  const subDocCount = (sub) => safeDocs(sub.documents).length;

  /** Total document count for a category (own docs + all subcategory docs) */
  const catDocCount = (cat) =>
    safeDocs(cat.documents).length +
    safeSubCats(cat.subCategories).reduce((sum, sub) => sum + subDocCount(sub), 0);

  /** Documents to display in the content area */
  const displayedDocs = useMemo(() => {
    // "My Documents" - flatten everything
    if (!selectedCategoryId) {
      return documents.flatMap((cat) => [
        ...safeDocs(cat.documents),
        ...safeSubCats(cat.subCategories).flatMap((sub) =>
          safeDocs(sub.documents),
        ),
      ]);
    }
    if (!selectedCategory) return [];

    // A subcategory is selected
    if (selectedSubCategoryId && selectedSubCategory) {
      return safeDocs(selectedSubCategory.documents);
    }

    // Category selected but no subcategory - show category-level docs
    // (for categories like "Other Documents" that have no subCategories)
    return safeDocs(selectedCategory.documents);
  }, [
    documents,
    selectedCategoryId,
    selectedCategory,
    selectedSubCategoryId,
    selectedSubCategory,
  ]);

  // --- Handlers ---
  const handleMobileOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMobileClose = () => setAnchorEl(null);

  /** Called when a category row is clicked (desktop sidebar or mobile menu) */
  const handleCategorySelect = (catId) => {
    if (catId === null) {
      // "My Documents"
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setExpandedCategoryId(null);
      handleMobileClose();
      return;
    }
    const cat = documents.find((c) => c.id === catId);
    if (!cat) return;

    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(null);

    // Desktop: toggle expand
    setExpandedCategoryId((prev) => (prev === catId ? null : catId));
    handleMobileClose();
  };

  /** Called when a subcategory row is clicked */
  const handleSubCategorySelect = (subId) => {
    setSelectedSubCategoryId(subId);
    handleMobileClose();
  };

  // --- Label for the mobile button ---
  const mobileLabel = useMemo(() => {
    if (selectedSubCategory) return selectedSubCategory.displaySubCategoryName;
    if (selectedCategory) return selectedCategory.displayCategoryName;
    return "My Documents";
  }, [selectedCategory, selectedSubCategory]);

  // --- Content area heading ---
  const contentHeading = useMemo(() => {
    if (selectedSubCategory) return selectedSubCategory.displaySubCategoryName;
    if (selectedCategory) return selectedCategory.displayCategoryName;
    return "My Documents";
  }, [selectedCategory, selectedSubCategory]);

  // --- Render helpers ---
  const renderDocumentList = (docs) => {
    if (!docs || docs.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No documents in this category.
        </Typography>
      );
    }
    return (
      <List disablePadding>
        {docs.map((doc) => (
          <ListItem key={doc.documentTransactionalId} sx={{ py: 1, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <InsertDriveFileOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body1">{doc.title}</Typography>}
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {doc.fileDate
                    ? new Date(doc.fileDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                  {doc.fileType ? ` - ${doc.fileType.toUpperCase()}` : ""}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  // --- Desktop sidebar ---
  const renderDesktopSidebar = () => (
    <Paper
      elevation={0}
      sx={{
        borderRight: `1px solid ${theme.palette.divider}`,
        minHeight: 240,
      }}
    >
      <List component="nav" disablePadding>
        {/* My Documents */}
        <ListItemButton
          selected={selectedCategoryId === null}
          onClick={() => handleCategorySelect(null)}
          sx={sidebarItemSx(theme)}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {selectedCategoryId === null ? (
              <FolderIcon />
            ) : (
              <FolderOutlinedIcon />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body1"
                sx={{ textTransform: "none", color: "text.primary" }}
              >
                My Documents
              </Typography>
            }
          />
        </ListItemButton>

        {/* Categories */}
        {documents.filter((cat) => catDocCount(cat) > 0).map((cat) => {
          const isCatSelected = selectedCategoryId === cat.id;
          const isExpanded = expandedCategoryId === cat.id;
          const hasSubCats =
            cat.subCategories != null &&
            cat.subCategories.some((sub) => subDocCount(sub) > 0);

          return (
            <React.Fragment key={cat.id}>
              <ListItemButton
                selected={isCatSelected && !selectedSubCategoryId}
                onClick={() => handleCategorySelect(cat.id)}
                sx={sidebarItemSx(theme)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isCatSelected ? <FolderIcon /> : <FolderOutlinedIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{ textTransform: "none", color: "text.primary" }}
                    >
                      {cat.displayCategoryName}
                    </Typography>
                  }
                />
                {hasSubCats &&
                  (isExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  ))}
              </ListItemButton>

              {hasSubCats && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {(cat.subCategories ?? []).filter((sub) => subDocCount(sub) > 0).map((sub) => {
                      const isSubSelected =
                        isCatSelected && selectedSubCategoryId === sub.id;
                      return (
                        <ListItemButton
                          key={sub.id}
                          selected={isSubSelected}
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            handleSubCategorySelect(sub.id);
                          }}
                          sx={{
                            ...sidebarItemSx(theme),
                            pl: 5, // indent
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {isSubSelected ? (
                              <FolderIcon fontSize="small" />
                            ) : (
                              <FolderOutlinedIcon fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{
                                  textTransform: "none",
                                  color: "text.primary",
                                }}
                              >
                                {sub.displaySubCategoryName}
                              </Typography>
                            }
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

  // --- Mobile dropdown ---
  const renderMobileDropdown = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        variant="text"
        id="category-button"
        aria-controls={mobileOpen ? "category-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={mobileOpen ? "true" : undefined}
        onClick={handleMobileOpen}
        endIcon={<ExpandMoreIcon />}
        sx={{
          justifyContent: "flex-start",
          textTransform: "none",
          color: "text.primary",
        }}
      >
        <FolderIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1">{mobileLabel}</Typography>
      </Button>

      <Menu
        id="category-menu"
        anchorEl={anchorEl}
        open={mobileOpen}
        onClose={handleMobileClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        MenuListProps={{ "aria-labelledby": "category-button" }}
      >
        {/* My Documents */}
        <MenuItem
          selected={selectedCategoryId === null}
          onClick={() => handleCategorySelect(null)}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {selectedCategoryId === null ? (
              <FolderIcon />
            ) : (
              <FolderOutlinedIcon />
            )}
          </ListItemIcon>
          <ListItemText>My Documents</ListItemText>
        </MenuItem>

        {/* Categories + their subcategories */}
        {documents.filter((cat) => catDocCount(cat) > 0).map((cat) => {
          const isCatSelected = selectedCategoryId === cat.id;
          return (
            <React.Fragment key={cat.id}>
              <MenuItem
                selected={isCatSelected && !selectedSubCategoryId}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isCatSelected ? <FolderIcon /> : <FolderOutlinedIcon />}
                </ListItemIcon>
                <ListItemText>{cat.displayCategoryName}</ListItemText>
              </MenuItem>

              {/* Subcategories indented */}
              {(cat.subCategories ?? []).filter((sub) => subDocCount(sub) > 0).map((sub) => {
                const isSubSelected =
                  isCatSelected && selectedSubCategoryId === sub.id;
                return (
                  <MenuItem
                    key={sub.id}
                    selected={isSubSelected}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      handleSubCategorySelect(sub.id);
                    }}
                    sx={{ pl: 5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {isSubSelected ? (
                        <FolderIcon fontSize="small" />
                      ) : (
                        <FolderOutlinedIcon fontSize="small" />
                      )}
                    </ListItemIcon>
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

  // --- Main render ---
  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2}>
        {/* Left / nav */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          {isMobile ? renderMobileDropdown() : renderDesktopSidebar()}
        </Grid>

        {/* Right / content */}
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
                {contentHeading}
              </Typography>

              {/* If a category is selected but no subcategory yet, and it has subcategories,
                    show a prompt to pick a subcategory */}
              {selectedCategory &&
              !selectedSubCategoryId &&
              (selectedCategory.subCategories ?? []).length > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Select a subcategory to view documents.
                </Typography>
              ) : (
                renderDocumentList(displayedDocs)
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
