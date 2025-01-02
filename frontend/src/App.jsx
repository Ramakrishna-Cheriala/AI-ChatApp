import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/user.context";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
      <Toaster />
    </div>
  );
};

export default App;
