import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";

import { Link } from "react-router-dom";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LoginIcon from "@mui/icons-material/Login";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/userSlice";
// import { login as loginRedux } from "../store/userSlice";

//font
import "@fontsource/pixelify-sans";

const pages = [
  {
    title: "Home",
    icon: "",
    to: "/",
  },
  {
    title: "Course",
    icon: "",
    to: "/course",
  },
];

const authen = [
  {
    title: "Register",
    icon: <PeopleAltOutlinedIcon />,
    to: "/register",
  },
  {
    title: "Login",
    icon: <LoginIcon />,
    to: "/login",
  },
];

const settings = [
  {
    title: "Profile",
    icon: "",
    to: "/profile",
  },
  {
    title: "Logout",
    icon: "",
    to: "/",
  },
];

function HeaderBar() {
  const { user } = useSelector((state) => ({ ...state }));
  const { username } = useSelector((state) => state.user.user);
  let { searchTerm } = useSelector((state) => state.search);
  // let search= {searchTerm}
  // console.log(username)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // console.log("USER :",user.user.length);

  const handlelogout = () => {
    handleCloseNavMenu();
    dispatch(logout());
    navigate("/");
    navigate(0);
    
  };

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" style={{ backgroundColor: "#ffffff" }}>
      <Container maxWidth="false">
        {/* Left LOGO */}
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              textDecoration: "none",
            }}
          >
            <IconButton>
              <Avatar
                alt="Remy Sharp"
                src="/assets/RateMyTuLogo.jpeg"
                sx={{
                  width: 60, // width in pixels
                  height: 60, // height in pixels
                }}
              />
              <Typography
                sx={{
                  ml: 2,
                  display: { xs: "none", md: "flex" },
                  color: "black",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "'Pixelify Sans', sans-serif",
                  fontSize: "32px",
                  fontWeight: "500",
                }}
              >
                RateMy TU
              </Typography>
            </IconButton>
          </Typography>
          {/* Left LOGO */}

          {/* LOGO Minimize */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
            }}
          >
            <IconButton>
              <Avatar alt="Remy Sharp" src="/assets/RateMyTuLogo.jpeg" />
              <Typography
                sx={{
                  ml: 2,
                  display: { xs: "none", md: "flex" },
                  color: "black",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "'Pixelify Sans', sans-serif",
                  fontSize: "18px",
                  fontWeight: "500",
                }}
              >
                RateMy TU
              </Typography>
            </IconButton>
          </Typography>

          {/* /LOGO Minimize */}

          {/* Menu Left Full */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
            }}
          >
            {pages.map((page, index) => (
              <Link to={page.to}>
                <Button
                  key={index}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "black", mr: 5 }}
                >
                  {page.title}
                </Button>
              </Link>
            ))}
          </Box>
          {/* /Menu Left Full */}

          {/* Menu Right Full */}
          <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            {user.user.length === 0 &&
              authen.map((page, index) => (
                <Link to={page.to}>
                  <Button
                    key={index}
                    onClick={handleCloseNavMenu}
                    sx={{
                      my: 2,
                      color: "Black",
                      mr: 2,
                    }}
                    startIcon={page.icon}
                  >
                    {page.title}
                  </Button>
                </Link>
              ))}
          </Box>
          {/* /Menu Right Full */}

          {/* User Menu */}
          {user.user.length !== 0 && (
            <>
              <Box sx={{ flexGrow: 0, flexDirection: "column" }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src="" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {pages.map((page, index) => (
                    <MenuItem key={index} onClick={handleCloseNavMenu}>
                      <Link to={page.to} style={{ textDecoration: "none" }}>
                        <Typography textAlign="center">{page.title}</Typography>
                      </Link>
                    </MenuItem>
                  ))}
                  {settings.map((setting, index) => (
                    <MenuItem
                      key={index}
                      onClick={
                        setting.title === "Logout"
                          ? handlelogout
                          : handleCloseUserMenu
                      }
                    >
                      <Link to={setting.to} style={{ textDecoration: "none" }}>
                        <Typography textAlign="center">
                          {setting.title}
                        </Typography>
                      </Link>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Box
                sx={{
                  ml: 2,
                  flexGrow: 0,
                  fontFamily: "monospace",
                  color: "black",
                  textDecoration: "none",
                }}
              >
                <Typography>Hello, {username}</Typography>
              </Box>
            </>
          )}

          {/* /User Menu */}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default HeaderBar;
