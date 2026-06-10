import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TicketList from "./components/TicketList.jsx";
import CreateTicket from "./components/CreateTicket.jsx";
import EditTicket from "./components/EditTicket.jsx";
import TicketDetails from "./components/TicketDetails.jsx";
import Navbar from "./components/Navbar.jsx";
import UsersList from "./components/UsersList.jsx";
import UserForm from "./components/UserForm.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Register from "./components/Register.jsx";

function App() {
  const Router = import.meta.env.BASE_URL === "/" ? BrowserRouter : HashRouter;

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
          <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
          <Route path="/tickets/:id/edit" element={<ProtectedRoute><EditTicket /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
