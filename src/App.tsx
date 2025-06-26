import { Navigate, Route, Routes } from "react-router";
import "./App.css";
import RegisterPage from "./components/Auth/RegisterPage";
import LoginPage from "./components/Auth/LoginPage";
import { TodoPage } from "./components/TodoPage";
import { AuthProvider } from "./contexts/authContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />}></Route>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/todo" element={<TodoPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
