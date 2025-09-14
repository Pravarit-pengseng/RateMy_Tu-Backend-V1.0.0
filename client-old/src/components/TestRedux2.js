import React from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "../store/userSlice";

const TestRedux2 = () => {
    const dispatch = useDispatch();


  return (
    <div>
      TestRedux2
      <button onClick={()=>dispatch(login())}>Hello Redux</button>
      <button onClick={()=>dispatch(logout())}>Hello Redux</button>
    </div>
  );
};

export default TestRedux2;
