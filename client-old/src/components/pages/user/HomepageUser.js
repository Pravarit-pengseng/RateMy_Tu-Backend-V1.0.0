import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CardContent,
  Paper,
  Grid,
  Box,
} from "@mui/material";
import Search from "../../Search/Search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HomepageUser() {
  const [subjects, setSubjects] = useState([]); // store fetched data
  const [loading, setLoading] = useState(true); // loading state
  const [error, setError] = useState(null); // error state
  const navigate = useNavigate();

  // Fetch top 5 searched subjects
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API + "/popular");
        setSubjects(res.data); // set API response
      } catch (err) {
        console.error("Error fetching popular searches:", err);
        setError("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "#2d2f3b",
        height: "100vh",
        width: "100vw",
        overflowY: "scroll",
        xs: 4,
        sm: 8,
        md: 12,
      }}
    >
      <Container maxWidth="vw">
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, sm: 12, ml: 12 },
            backgroundImage: "url('/assets/home-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            imageRendering: "-moz-crisp-edges",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              mt: { xs: 1, sm: 8 },
              mb: { xs: 1, sm: 8 },
              fontSize: { xs: "32px", sm: "48px", md: "64px", lg: "80px" },
            }}
          >
            Find your <ins>FAVORITE</ins> subject
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              mb: { xs: 3, sm: 5 },
              px: { xs: 2, sm: 10 },
            }}
          >
            Explore friends review, rating and professor to make informed
            academic choice
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: { xs: 4, sm: 8 },
            }}
          >
            <Search />
          </Box>
        </Box>

        {/* Top 5 Section */}
        <Box>
          <Box sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <hr style={{ height: "5px", backgroundColor: "#ffffff" }} />
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: "#fff",
                textAlign: "left",
                ml: 1,
              }}
            >
              TOP 5 Searched Subject
            </Typography>

            {loading ? (
              <Typography
                sx={{
                  color: "white",
                  textAlign: "center",
                  justifyItems: "center",
                }}
              >
                Loading...
              </Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Grid container spacing={3}>
                {subjects.map((subject, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        // textAlign: "center",
                        height: "100%",
                        transition: "0.3s",
                        "&:hover": {
                          backgroundColor: "#f9f9f9",
                          transform: "translateY(-5px)",
                          boxShadow: 10,
                        },
                      }}
                      onClick={() =>
                        navigate(`/course/${subject.code}/${subject._id}`)
                      }
                    >
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Code: {subject.code}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "primary.main" }}
                        >
                          {subject.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Teacher: <b>{subject.teacher}</b>
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {subject.detail}
                        </Typography>
                      </CardContent>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
            <br />
            <br />
            <br />
            <br />
            <br />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HomepageUser;
