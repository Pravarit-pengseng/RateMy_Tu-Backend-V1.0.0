import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Layout
// import HeaderBar from "./layout/HeaderBar";
import { CssBaseline, Box, TextField } from "@mui/material";

// import SideBar from "./layout/SideBar";

import FormSubject from "./components/pages/FormSubject";
import EditSubject from "./components/pages/EditSubject";
// import TestRedux1 from "./components/TestRedux1";
// import TestRedux2 from "./components/TestRedux2";

// pages
import Register from "./components/pages/auth/Register";
import Login from "./components/pages/auth/Login";

//admin
import HomepageAdmin from "./components/pages/admin/HomepageAdmin";

//user
import HomepageUser from "./components/pages/user/HomepageUser";
import AdminRoute from "./Routes/AdminRoute";
import UserRoute from "./Routes/UserRoute";

//function
import { currentUser } from "./functions/auth";
import { useDispatch } from "react-redux";
import { login } from "./store/userSlice";
import NotFound404 from "./components/pages/NotFound404";
import HeaderBar from "./layout/HeaderBar";


//toastify alert
import { ToastContainer } from "react-toastify";

function App() {
  // javascript
  const dispatch = useDispatch();
  const idToken = localStorage.getItem("token");
  // console.log("token", idToken);
  currentUser(idToken)
    .then((res) => {
      // console.log(res);
      dispatch(
        login({
          studentId: res.data.studentId,
          username: res.data.username,
          role: res.data.role,
          token: idToken,
        })
      );
    })
    .catch((err) => console.log(err));

  return (
    <BrowserRouter>
      <>
        <CssBaseline />
        <ToastContainer />
        {/* public */}
        <Routes>
          <Route
            path="*"
            element={
              <NotFound404
                text="The page you’re looking for doesn’t exist."
                Back="/"
              />
            }
          />
          <Route
            path="/"
            element={
              <>
                <HeaderBar />
                <HomepageUser />
              </>
            }
          />
          <Route
            path="/course"
            element={
              <>
                <HeaderBar />
                <FormSubject />
              </>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* public */}

          {/* user */}
          <Route
            path="/"
            element={
              <UserRoute>
                <HomepageUser />
              </UserRoute>
            }
          />

          {/* admin */}
          <Route
            path="/" //can custom path
            element={
              <AdminRoute>
                <HomepageUser />
              </AdminRoute>
            }
          />
          
          <Route
            path="/edit/:id"
            element={<AdminRoute>{/* <EditSubject /> */}</AdminRoute>}
          />

          {/* <TestRedux1 />
        <hr />
        <TestRedux2 /> */}
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;
