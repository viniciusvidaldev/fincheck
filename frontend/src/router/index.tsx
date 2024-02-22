import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthLayout } from "../ui/layouts/AuthLayout";
import { Dashboard } from "../ui/pages/Dashboard";
import { Login } from "../ui/pages/Login";
import { Register } from "../ui/pages/Register";
import { AuthGuard } from "./AuthGuard";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGuard isPrivate={false} />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<AuthGuard isPrivate />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
} 