import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import { Toaster } from "react-hot-toast";
// import Project from "../pages/Project";
import UserAuth from "../Auth/UserAuth";
import Messages from "../pages/Messages";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <UserAuth>
              <Home />
            </UserAuth>
          }
        >
          {/* Nested route for Messages */}
          <Route path="chat/:id" element={<Messages />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
