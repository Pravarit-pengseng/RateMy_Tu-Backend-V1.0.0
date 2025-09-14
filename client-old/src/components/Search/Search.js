import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  searchCourses,
  saveSearchHistory,
  increasePopularity,
} from "../../functions/searchEngine";

import {
  Box,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  ClickAwayListener,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NorthEastIcon from "@mui/icons-material/NorthEast";

const Search = ({ onSearch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchTerm } = useSelector((state) => state.search);
  const { role } = useSelector((state) => state.user.user);

  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // ปิด dropdown ถ้าไม่ได้อยู่หน้า home
  useEffect(() => {
    if (location.pathname !== "/") {
      setShowDropdown(false);
    }
  }, [location.pathname]);

  // live search (debounce)
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      fetchDataSearch(searchTerm);
    }, 100);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fetchDataSearch = async (searchTerm) => {
    try {
      const res = await searchCourses(searchTerm);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("Search ERROR:", err.response?.data || err.message);
    }
  };

  // save searchTerm ลง DB (debounce 1.5s)
  useEffect(() => {
    if (!searchTerm) return;

    const delay = setTimeout(async () => {
      try {
        await saveSearchHistory(searchTerm);
        console.log("Saved search:", searchTerm);
      } catch (err) {
        console.error("Save search error:", err);
      }
    }, 1500);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleChange = (e) => {
    dispatch({
      type: "SEARCH_QUERY",
      payload: { searchTerm: e.target.value },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate("/course?" + searchTerm);
      setShowDropdown(false);
    }
  };

  const handleFocus = () => setShowDropdown(true);
  const handleClickAway = () => setShowDropdown(false);

  const handleResultClick = async (subject) => {
    dispatch({
      type: "SEARCH_QUERY",
      payload: { searchTerm: subject.name },
    });

    try {
      await increasePopularity(subject._id); // เพิ่ม popularity ตอนคลิก
    } catch (err) {
      console.error("Increase popularity error:", err);
    }

    if (onSearch) {
      onSearch(subject);
    }

    navigate(`/course/${subject.code}/${subject._id}`);
    setShowDropdown(false);
  };

  // reset search เมื่อกลับมาหน้า home
  useEffect(() => {
    if (location.pathname === "/") {
      dispatch({
        type: "SEARCH_QUERY",
        payload: { searchTerm: "" },
      });
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [location.pathname, dispatch]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: "relative", width: 450 }}>
        {/* Search Input */}
        <Box
          component="form"
          ref={searchRef}
          sx={{
            width: "100%",
            height: 50,
            border: "2.5px solid white",
            borderRadius: showDropdown ? "25px 25px 8px 8px" : "25px",
            display: "flex",
            alignItems: "center",
            px: "10px",
            bgcolor: "#2d2f3b",
            transition: "0.2s ease",
            zIndex: 1000,
            position: "relative",
          }}
          onSubmit={handleSubmit}
        >
          <SearchIcon sx={{ color: "white", mr: 1 }} />
          <InputBase
            ref={inputRef}
            value={searchTerm || ""}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Search..."
            type="text"
            fullWidth
            sx={{
              color: "white",
              "& input": {
                "&::placeholder": {
                  color: "rgba(255, 255, 255, 0.7)",
                  opacity: 1,
                },
              },
            }}
          />
          {role === "admin" && (
            <AddCircleIcon
              sx={{ color: "white", ml: 1, cursor: "pointer" }}
              onClick={() => navigate("/add-subject")}
            />
          )}
        </Box>

        {/* Dropdown */}
        {showDropdown && (
          <Paper
            sx={{
              position: "absolute",
              top: "48px",
              left: 0,
              right: 0,
              maxHeight: 300,
              overflowY: "auto",
              zIndex: 999,
              borderRadius: "0 0 16px 16px",
              border: "2px solid white",
              borderTop: "none",
              bgcolor: "#2d2f3b",
              color: "white",
              p: "2px",
            }}
          >
            <List sx={{ py: 0 }}>
              {/* Search Results */}
              {searchResults.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="caption" sx={{ ml: 1, color: "gray" }}>
                      Search Results
                    </Typography>
                  </ListItem>
                  {searchResults.map((subject) => (
                    <ListItem
                      key={subject._id}
                      button
                      onClick={() => handleResultClick(subject)}
                      sx={{
                        py: 1,
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      <ListItemIcon>
                        <NorthEastIcon sx={{ color: "gray" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${subject.code} - ${subject.name}`}
                        sx={{ color: "white" }}
                      />
                    </ListItem>
                  ))}
                </>
              )}

              {/* No Results */}
              {searchTerm && searchResults.length === 0 && (
                <ListItem sx={{ py: 2 }}>
                  <ListItemText
                    primary="No matches found"
                    sx={{ textAlign: "center", color: "gray" }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default Search;
