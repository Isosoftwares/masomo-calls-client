import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { auth, setAuth } = useAuth();

  const logout = async () => {
    try {
      await axios.post(`auth/logout`, {
        withCredentials: true,
      });
      setAuth({});
      localStorage.removeItem("userId");
      localStorage.removeItem("activeDashboard");
    } catch (err) {
      setAuth({});
      // localStorage.clear();
      localStorage.removeItem("userId");
      localStorage.removeItem("activeDashboard");
    }
  };

  return logout;
};

export default useLogout;
