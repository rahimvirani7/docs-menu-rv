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
  styled,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// TODO: Identify all "theme" properties and map them to the provided design specifics at the time of integration.
const DesktopMenuItem = styled(ListItemButton)`
  ${({ theme }) => `
    padding: 7px 12px;
    
    &.Mui-selected {
      background-color: ${theme.palette.action.selected};
      border-right: 2px solid ${theme.palette.primary.main};
      
      .MuiListItemText-root {
        color: ${theme.palette.primary.main};
      }
    },

    &.Mui-selected.sub-category-menu-item {
      border-bottom: 2px solid ${theme.palette.primary.main};
      border-right: none;
      background-color: unset;
    },

    &.selected-category-menu-item {
      background-color: ${theme.palette.action.selected};

      .MuiListItemText-root {
        color: ${theme.palette.primary.main};
      }
    }

    .MuiTypography-root {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  `}
`;

const MobileMenuItem = styled(MenuItem)`
  min-height: unset;
  padding: 8px 16px;

  .MuiListItemIcon-root {
    min-width: 32px;
  }

  &.mobile-menu-subcategory .MuiListItemIcon-root {
    min-width: 28px;
  }
`;

// --------------------------------------------------
// Utilities
// --------------------------------------------------

/** Null-safe array accessor. */
const toArray = (val) => val ?? [];

/** Number of documents directly inside a subcategory. */
const subDocCount = (sub) => toArray(sub.documents).length;

/** Total document count for a category: own docs + all subcategory docs. */
const catDocCount = (cat) =>
  toArray(cat.documents).length +
  toArray(cat.subCategories).reduce((sum, sub) => sum + subDocCount(sub), 0);

const selectedFolderIconSx = (theme) => ({
  color: theme.palette.primary.main, // TODO: update to #003368 from theme color
});

// --------------------------------------------------
// Sub-components
// --------------------------------------------------

/** Folder icon that switches between filled and outlined based on selection. */
const FolderItemIcon = ({ selected, size, sx }) => (
  <ListItemIcon sx={{ minWidth: 32, ...sx }}>
    {selected ? (
      <FolderIcon sx={selectedFolderIconSx} fontSize={size} />
    ) : (
      <FolderOutlinedIcon fontSize={size} />
    )}
  </ListItemIcon>
);

// Sentinel entry that represents the "show all" state.
// id: null matches the selectedCategoryId initial value and all related checks.
const MY_DOCUMENTS = {
  id: null,
  displayCategoryName: "My Documents",
  subCategories: null,
  documents: null,
};

// --------------------------------------------------
// DocumentMenu
// --------------------------------------------------

/**
 * Props:
 *  - documents: Array of category objects
 *    { id, displayCategoryName, subCategories, documents, ... }
 */
export default function DocumentMenu({ documents = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // TODO: confirm sm breakpoint starts at 767px when integrating

  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null = "My Documents" (all docs)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null); // desktop only
  const [anchorEl, setAnchorEl] = useState(null); // mobile menu anchor HTML elements

  const mobileOpen = Boolean(anchorEl);

  // --------------------------------------------------
  // Derived data
  // --------------------------------------------------

  // TODO: Check for duplicacy
  const selectedCategory = useMemo(
    () => documents.find((c) => c.id === selectedCategoryId) ?? null,
    [documents, selectedCategoryId],
  );

  // TODO: Check for duplicacy
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
    // Category selected — return own docs + all subcategory docs
    return [
      ...toArray(selectedCategory.documents),
      ...toArray(selectedCategory.subCategories).flatMap((sub) =>
        toArray(sub.documents),
      ),
    ];
  }, [documents, selectedCategoryId, selectedCategory, selectedSubCategory]);

  // Categories / subcategories that have at least one document (used in both views).
  const visibleCategories = useMemo(
    () => [MY_DOCUMENTS, ...documents.filter((cat) => catDocCount(cat) > 0)],
    [documents],
  );

  // --------------------------------------------------
  // Event Handlers
  // --------------------------------------------------

  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(null);
    setExpandedCategoryId((prev) => (catId && prev !== catId ? catId : null));
    setAnchorEl(null);
  };

  const handleSubCategorySelect = (catId, subId) => {
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(subId);
    setExpandedCategoryId(catId); // keep parent expanded on desktop
    setAnchorEl(null);
  };

  // --------------------------------------------------
  // Render: document list (content area) - ***IGNORE THIS PART WHEN INTEGRATING***
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Render: desktop sidebar
  // --------------------------------------------------

  const renderDesktopSidebar = () => (
    <Paper
      elevation={0}
      sx={{
        borderRight: `1px solid ${theme.palette.divider}`,
        minHeight: 240,
        borderRadius: 0,
      }}
      className="side-bar-wrapper h-full"
    >
      {/* TODO: update to desired divider color ^ from theme */}
      <List component="nav" disablePadding>
        {/* Categories (includes "My Documents" sentinel at index 0) */}
        {visibleCategories.map((cat) => {
          const isCatSelected = selectedCategoryId === cat.id;
          const isExpanded = expandedCategoryId === cat.id;
          const visibleSubs = toArray(cat.subCategories).filter(
            (sub) => subDocCount(sub) > 0,
          );

          return (
            <React.Fragment key={cat.id ?? "my-documents"}>
              <DesktopMenuItem
                selected={isCatSelected && !selectedSubCategoryId}
                onClick={() => handleCategorySelect(cat.id)}
                className={
                  isCatSelected && selectedSubCategoryId
                    ? "selected-category-menu-item"
                    : ""
                }
              >
                <FolderItemIcon
                  selected={isCatSelected && !selectedSubCategoryId}
                />
                <ListItemText primary={cat.displayCategoryName} />
                {visibleSubs.length > 0 &&
                  (isExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  ))}
              </DesktopMenuItem>

              {visibleSubs.length > 0 && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {visibleSubs.map((sub) => {
                      const isSubSelected =
                        isCatSelected && selectedSubCategoryId === sub.id;
                      return (
                        <DesktopMenuItem
                          key={sub.id}
                          selected={isSubSelected}
                          onClick={() =>
                            handleSubCategorySelect(cat.id, sub.id)
                          }
                          sx={{ pl: 3 }}
                          className="sub-category-menu-item"
                        >
                          <FolderItemIcon
                            selected={isSubSelected}
                            size="small"
                            sx={{ minWidth: 28 }} // overrides default minWidth 32px for subcategories
                          />
                          <ListItemText primary={sub.displaySubCategoryName} />
                        </DesktopMenuItem>
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

  // --------------------------------------------------
  // Render: mobile dropdown
  // --------------------------------------------------

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
          pl: 0,
          py: 1,
        }}
      >
        <FolderIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        {/* TODO: update ^ to desired color from theme */}
        <Typography variant="subtitle1" sx={{ lineHeight: 1.5 }}>
          {activeLabel}
        </Typography>
      </Button>

      <Menu
        id="category-menu"
        anchorEl={anchorEl}
        open={mobileOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        aria-labelledby="category-button"
      >
        {/* Categories + indented subcategories (includes "My Documents" sentinel at index 0) */}
        {visibleCategories.map((cat) => {
          const isCatSelected = selectedCategoryId === cat.id;
          const visibleSubs = toArray(cat.subCategories).filter(
            (sub) => subDocCount(sub) > 0,
          );

          return (
            <React.Fragment key={cat.id ?? "my-documents"}>
              <MobileMenuItem
                selected={isCatSelected && !selectedSubCategoryId}
                onClick={() => handleCategorySelect(cat.id)}
                className="mobile-menu-category"
              >
                <FolderItemIcon selected={isCatSelected} />
                <ListItemText>{cat.displayCategoryName}</ListItemText>
              </MobileMenuItem>

              {visibleSubs.map((sub) => {
                const isSubSelected =
                  isCatSelected && selectedSubCategoryId === sub.id;
                return (
                  <MobileMenuItem
                    key={sub.id}
                    selected={isSubSelected}
                    onClick={() => handleSubCategorySelect(cat.id, sub.id)}
                    sx={{ pl: 4 }}
                    className="mobile-menu-subcategory"
                  >
                    <FolderItemIcon selected={isSubSelected} size="small" />
                    <ListItemText>
                      <Typography variant="body1">
                        {sub.displaySubCategoryName}
                      </Typography>
                    </ListItemText>
                  </MobileMenuItem>
                );
              })}
            </React.Fragment>
          );
        })}
      </Menu>
    </Box>
  );

  // --------------------------------------------------
  // Main render
  // --------------------------------------------------

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4, md: 2 }} className="side-bar-grid">
          {isMobile ? renderMobileDropdown() : renderDesktopSidebar()}
        </Grid>

        {/* ***IGNORE THIS PART WHEN INTEGRATING*** */}
        <Grid size={{ xs: 12, sm: 8, md: 10 }}>
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
              <Typography
                sx={{ color: theme.palette.primary.main }}
                variant="subtitle1"
                gutterBottom
              >
                <i>
                  {selectedSubCategory &&
                    `${selectedCategory.displayCategoryName} > `}
                  {activeLabel}
                </i>
              </Typography>

              {renderDocumentList()}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
