import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import { searchReducer } from "./searchReducer";

export const store = configureStore({
  reducer: {
    user: userSlice,
    search: searchReducer,
  },
});
