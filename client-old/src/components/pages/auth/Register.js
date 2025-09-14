import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
//pasword visible
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { useState } from "react";
// function
import { register } from "../../../functions/auth";
//toastify
import { toast } from "react-toastify";
//navigate
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const user = {
      studentId: data.get("studentId"),
      username: data.get("username"),
      password: data.get("password"),
    };
    if (!user.studentId || !user.username || !user.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    register(user)
      .then((res) => {
        console.log(res);
        toast.success(res.data);
        if (res.data === "Register success!!") {
          navigate("/login");
        }
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  return (
    // html
    <ThemeProvider theme={defaultTheme}>
      {/* body */}
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          width:"100vw",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          bgcolor: "#222831",
        }}
      >
        {/* <CssBaseline /> */}
        {/* <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(/assets/Login.jpg)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"F
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        /> */}
        {/* container */}
        <Grid
          name="container"
          xs={12}
          sm={8}
          md={10}
          component={Paper}
          //shadow container
          elevation={20}
          square
          sx={{
            flex: 1,
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            flexDirection: "row",
            width: "1050px",
            height: "650px",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0px 4px 15px rgba(0,0,0,0,0.2)",
            bgcolor: "#31363F",
          }}
        >
          {/* form */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "50px",
              minHeight: "calc(100vh - 128px)",
            }}
          >
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: "bold",
                mb: 8,
                color: "#F5F5F5",
              }}
            >
              Getting Started!
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1, width: "100%", maxWidth: 400 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="studentId"
                label="StudentId"
                name="studentId"
                autoComplete="studentId"
                autoFocus
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "#959eafff",
                    boxShadow: "0px 4px 8px #00000092",
                  },
                  "& label.Mui-focused": {
                    color: "#F5F5F5",
                  },
                  "& .MuiInputBase-input:focus": {
                    fontSize: "20px",
                  },
                  "& .MuiInputBase-input": {
                    color: "#F5F5F5",
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "#959eafff",
                    boxShadow: "0px 4px 8px #00000092",
                  },
                  "& label.Mui-focused": {
                    color: "#F5F5F5",
                  },
                  "& .MuiInputBase-input:focus": {
                    fontSize: "20px",
                  },
                  "& .MuiInputBase-input": {
                    color: "#F5F5F5",
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "#959eafff",
                    boxShadow: "0px 4px 8px #00000092",
                  },
                  "& label.Mui-focused": {
                    color: "#F5F5F5",
                  },
                  "& .MuiInputBase-input:focus": {
                    fontSize: "20px",
                  },
                  "& .MuiInputBase-input": {
                    color: "#F5F5F5",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                }}
              >
                Register
              </Button>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="#F5F5F5">
                  Are you dont have an account?{" "}
                  <Link
                    href="/login"
                    variant="body2"
                    color={"#9be0fbff"}
                    sx={{ fontWeight: 600 }}
                  >
                    Login
                  </Link>
                </Typography>
              </Box>
              {/* <Copyright sx={{ mt: 5 }} /> */}
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              borderRadius: "15px",
              boxShadow: "-4px 0px 10px #000000ff",
              height: "100%",
              width: "500px",
              objectFit: "cover",
            }}
            style={{}}
          >
            <img
              src="/assets/Register.jpeg"
              alt="Regiter"
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
