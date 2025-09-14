import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import HeaderBar from "../layout/HeaderBar";
import { useSelector } from "react-redux";
import { currentAdmin } from "../functions/auth";
import NotFound404 from "../components/pages/NotFound404";



const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [ok, setOk] = useState(false);
  console.log("adminroute", user.user.role);

  useEffect(() => {
    if (user && user.user.token)
      currentAdmin(user.user.token)
        .then((res) => {
          // console.log(res)
          setOk(true);
        })
        .catch((err) => {
          console.log(err);
          setOk(false);
        });
  }, [user]);
  const text = "NO PERMISSION!!";
  return ok ? (
    <div className="app">
      {/* <SideBar /> */}
      <main className="content">
        <HeaderBar />
        <div className="content_body">
          <Box>{children}</Box>
        </div>
      </main>
    </div>
  ) : <NotFound404 text={text} />
};

export default AdminRoute;
