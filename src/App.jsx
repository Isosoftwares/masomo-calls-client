import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import PersistLogin from "./components/PersistLogin";
import RequireAuth from "./components/RequireAuth";
import F404Page from "./F404Page";
import Login from "./Login";
import Unauthorized from "./Unauthorized";

// Main Pages
import Home from "./website/Home";

// Layout
import useScrollToTop from "./components/useScrollToTop";
import CallHistory from "./website/CallHistory";
import AgentManagement from "./website/AgentManagement";

import PhoneNumbers from "./website/numbers/PhoneNumbers";

import Layout from "./website/components/Layout";
import Softphone from "./website/SoftPhone";

import SystemSettings from "./website/settings/SystemSettings";
import Profile from "./website/profile/Profile";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  const location = useLocation();
  useScrollToTop();

  return (
    <div className="relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<PersistLogin />}>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route
              element={<RequireAuth allowedRoles={["supervisor", "admin"]} />}
            >
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
                <Route path="softphone" element={<Softphone />} />
                <Route path="calls/history" element={<CallHistory />} />
                <Route path="agents" element={<AgentManagement />} />
                <Route path="phone-numbers" element={<PhoneNumbers />} />
                <Route path="system-settings" element={<SystemSettings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="/*" element={<F404Page />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </div>
  );
}

export default App;
