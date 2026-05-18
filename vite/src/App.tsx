import {
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Billing from "./pages/Billing";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Login from "./pages/Login";
import { useAuth } from "./hooks/useAuth";
import { UserContext } from "./context/UserContext";

function ProtectedRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function App() {
  const { user, loading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-canvas flex items-center justify-center">
        <section className="text-center">
          <p className="text-eyebrow uppercase text-ink tracking-wide">
            Loading
          </p>
          <h1 className="text-display-lg font-light text-ink mt-md">
            Preparing your workspace...
          </h1>
        </section>
      </div>
    );
  }

  return (
    <UserContext value={user}>
      <div className="flex flex-col min-h-screen bg-canvas">
        <nav className="flex items-center justify-between px-lg py-md bg-canvas border-b border-hairline">
          <div className="flex items-center gap-xl">
            <span className="text-headline font-bold text-ink">QEG</span>
            <div className="flex gap-lg">
              <Link
                to="/"
                className="text-body-sm text-ink hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/projects"
                className="text-body-sm text-ink hover:text-primary transition-colors"
              >
                Projects
              </Link>
              <Link
                to="/billing"
                className="text-body-sm text-ink hover:text-primary transition-colors"
              >
                Billing
              </Link>
              <Link
                to="/about"
                className="text-body-sm text-ink hover:text-primary transition-colors"
              >
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-lg">
            {user ? (
              <>
                <span className="text-body-sm text-ink">{user.email}</span>
                <button
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="px-lg py-xs bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-70 transition-opacity"
                >
                  {isSigningOut ? "Signing out..." : "Logout"}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-lg py-xs bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 transition-opacity inline-block"
              >
                Login
              </Link>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route element={<ProtectedRoute isAuthenticated={!!user} />}>
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/billing" element={<Billing />} />
          </Route>
        </Routes>
      </div>
    </UserContext>
  );
}

export default App;
