import React from "react";
import { useSelector } from "react-redux";
import HeaderBar from "../layout/HeaderBar";
import NotFound404 from "../components/pages/NotFound404";
const UserRoute = ({ children }) => {
  const { user } = useSelector((state) => ({ ...state }));
  console.log("Userroute", user);
  return user && user.user.token ? (
    <>
      <HeaderBar />
      {children}
    </>
  ) : (
    <NotFound404 text="You need to Login"/>
  );
};

export default UserRoute;
