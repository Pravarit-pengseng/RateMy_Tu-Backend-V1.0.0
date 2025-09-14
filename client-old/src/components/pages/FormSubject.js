import React, { useEffect, useState } from "react";
import {
  Card,
  Box,
  CardContent,
  Typography,
  Grid,
  Container,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Search from "../Search/Search";
import { searchCourses } from "../../functions/searchEngine"; // ✅ ใช้ searchCourses
import { getdata } from "../../functions/subject";

const FormSubject = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSelector((state) => state.search);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getdata(); // โหลดข้อมูลทั้งหมดก่อน
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Re-filter subjects based on searchTerm
  useEffect(() => {
    if (!searchTerm) {
      loadData(); // ถ้าไม่มี searchTerm → โหลดทั้งหมดกลับมา
      return;
    }

    const delay = setTimeout(() => {
      fetchDataSearch(searchTerm);
    }, 200); // debounce เล็กน้อย
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fetchDataSearch = async (searchTerm) => {
    try {
      const res = await searchCourses(searchTerm); // ✅ ใช้ searchCourses
      setSubjects(res.data);
    } catch (err) {
      console.error("Axios ERROR:", err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading subjects...</Typography>
      </Container>
    );
  }

  return (
    <Grid
      sx={{
        bgcolor: "#2d2f3b",
        height: "100vh",
        width: "100vw",
        overflowY: "auto",
      }}
    >
      <Container>
        <Box display="flex" justifyContent="center" my={3}>
          <Search /> {/* ช่อง Search */}
        </Box>

        <Grid container spacing={3}>
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <Grid item xs={12} sm={6} md={3} key={subject._id}>
                <Card
                  sx={{
                    height: "100%",
                    boxShadow: 3,
                    borderRadius: 3,
                    "&:hover": {
                      backgroundColor: "#F2F2F2",
                      boxShadow: 10,
                    },
                  }}
                  onClick={() =>
                    navigate(`/course/${subject.code}/${subject._id}`)
                  }
                >
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Code: {subject.code}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {subject.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Teacher: <b>{subject.teacher}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {subject.detail}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{
                m: "3vh",
                color: "white",
                alignItems: "center",
                display: "flex",
                textAlign: "center",
              }}
            >
              No subjects available.
            </Typography>
          )}
        </Grid>
      </Container>
    </Grid>
  );
};

export default FormSubject;
