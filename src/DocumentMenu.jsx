import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Fade,
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

/**
 * DocumentMenu
 * Props:
 *  - documents: Array of objects { id, fileName, fileSize, dateModified, category }
 *
 * Selection categories: "My Documents" (shows all), "Category_1", "Category_2", "Category_3"
 */
export default function DocumentMenu({ documents = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // const categories = ["My Documents", "Category_1", "Category_2", "Category_3"];

  const categories = useMemo(() => {
    // Collect unique, truthy category values from passed documents in insertion order
    const unique = Array.from(
      documents.reduce((acc, d) => {
        if (d && d.category) acc.add(d.category);
        return acc;
      }, new Set())
    );

    // Always have "My Documents" first, then the discovered categories
    return ["My Documents", ...unique];
  }, [documents]);

  const [selected, setSelected] = useState("My Documents"); // default on load
  const [anchorEl, setAnchorEl] = useState(null);

  const buttonId = "category-button"; // used for aria-labelledby
  const menuId = "category-menu";

  // Mobile menu handlers
  const handleMobileOpen = React.useCallback((e) => {
    setAnchorEl(e.currentTarget);
  }, []);
  const handleMobileClose = () => {
    setAnchorEl(null);
  };
  // const handleMobileOpen = (e) => {
  //   setAnchorEl(e.currentTarget);
  // };

  // const handleMobileClose = React.useCallback(() => {
  //   // store currently anchored element so we can return focus to it after closing
  //   const anchor = anchorEl;
  //   setAnchorEl(null);
  //   if (anchor && typeof anchor.focus === "function") {
  //     // delay focus restore slightly to let Menu close
  //     setTimeout(() => anchor.focus(), 0);
  //   }
  // }, [anchorEl]);
  const mobileOpen = Boolean(anchorEl);

  const handleSelect = (name) => {
    setSelected(name);
    handleMobileClose();
  };

  const filteredDocs =
    selected === "My Documents"
      ? documents
      : documents.filter((d) => d.category === selected);

  return (
    console.log("anchorEl", anchorEl),
    (
      <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={3}>
            {isMobile ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="text"
                  id={buttonId}
                  aria-controls={mobileOpen ? menuId : undefined}
                  aria-haspopup="true"
                  aria-expanded={mobileOpen ? "true" : undefined}
                  onClick={handleMobileOpen}
                  endIcon={<ExpandMoreIcon />}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    color: "text.primary",
                  }}
                  aria-controls={mobileOpen ? "category-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={mobileOpen ? "true" : undefined}
                >
                  <FolderIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">{selected}</Typography>
                </Button>

                <Menu
                  id="category-menu"
                  anchorEl={anchorEl}
                  open={mobileOpen}
                  onClose={handleMobileClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  MenuListProps={{ "aria-labelledby": "category-button" }}
                >
                  {categories.map((cat) => (
                    <MenuItem
                      key={cat}
                      selected={cat === selected}
                      onClick={() => handleSelect(cat)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {cat === selected ? (
                          <FolderIcon />
                        ) : (
                          <FolderOutlinedIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText>{cat}</ListItemText>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  borderRight: `1px solid ${theme.palette.divider}`,
                  minHeight: 240,
                }}
              >
                <List component="nav" sx={{ p: 0 }}>
                  {categories.map((cat) => (
                    <ListItemButton
                      key={cat}
                      selected={cat === selected}
                      onClick={() => handleSelect(cat)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        "&.Mui-selected": {
                          backgroundColor: theme.palette.action.selected,
                          borderRight: `4px solid ${theme.palette.primary.main}`,
                        },
                        textTransform: "none",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {cat === selected ? (
                          <FolderIcon />
                        ) : (
                          <FolderOutlinedIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              textTransform: "none",
                              color: "text.primary",
                            }}
                          >
                            {cat}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>

          {/* Right / content area */}
          <Grid item xs={12} sm={8} md={9}>
            <Box sx={{ pl: { xs: 0, sm: 3 }, pt: { xs: 1, sm: 0 } }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your service categories
              </Typography>

              <Fade in key={selected} appear timeout={250}>
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
                    {selected}
                  </Typography>

                  {/* Document list: show fileName and id (and optionally size/date) */}
                  {filteredDocs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No documents in this category.
                    </Typography>
                  ) : (
                    <List>
                      {filteredDocs.map((doc) => (
                        <ListItem key={doc.id} sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <InsertDriveFileOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body1">
                                {doc.fileName}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                id: {doc.id}
                                {doc.fileSize ? ` — ${doc.fileSize}` : ""}
                                {doc.dateModified
                                  ? ` — ${doc.dateModified}`
                                  : ""}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Fade>
            </Box>
          </Grid>
        </Grid>
      </Box>
    )
  );
}
