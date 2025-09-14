import axios from "axios";

// search
export const searchCourses = async (searchTerm) =>
  await axios.post(process.env.REACT_APP_API + "/search", { searchTerm });

// save search history
export const saveSearchHistory = async (searchTerm) =>
  await axios.post(process.env.REACT_APP_API + "/history", { searchTerm });

// get search history
export const getSearchHistory = async () =>
  await axios.get(process.env.REACT_APP_API + "/history");

// delete search history item
export const deleteSearchHistory = async (historyId) =>
  await axios.delete(process.env.REACT_APP_API + `/history/${historyId}`);

// get popular searches
export const getPopularSearches = async () =>
  await axios.get(process.env.REACT_APP_API + "/popular");

//  increase popularity when user clicks
export const increasePopularity = async (courseId) =>
  await axios.post(process.env.REACT_APP_API + `/popularity/${courseId}`);
