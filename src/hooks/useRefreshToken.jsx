import { toast } from "react-toastify";
import axios from "../api/axios";
import useAuth from "./useAuth";
import useLogout from "./useLogout";

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const userId = JSON.parse(localStorage.getItem("userId")) || "";

  const logout = useLogout();

  const refresh = async () => {
    const response = await axios.get(`auth/refresh-token/${userId}`, {
      withCredentials: true,
    });

    if (response?.data?.message === "Unauthorized") {
      toast.info("Your session expired");
      await logout();

      return 0;
    }

    setAuth((prev) => {
      return {
        ...prev,
        roles: [response?.data?.data?.user?.role],
        accessToken: response?.data?.data?.accessToken,
        user: response?.data?.data?.user || {},
        userId: response?.data?.data?.user?._id || {},
      };
    });
    return response?.data?.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
