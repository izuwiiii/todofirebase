import { useState, type FormEvent } from "react";
import { Navigate, Link } from "react-router";
import { doSignInWithEmailAndPassword } from "../../firebase/auth";
import { useAuth } from "../../contexts/authContext";

const Login = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password)
          .catch(() => {
            setErrorMessage("User does not exist");
          })
          .finally(() => {
            setIsSigningIn(false);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      {userLoggedIn && <Navigate to={"/todo"} replace={true} />}

      <main className="w-full min-h-screen flex self-center place-content-center place-items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h3>
            <p className="text-gray-600 mt-2">
              Sign in to continue to your tasks
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500 font-medium"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500 font-medium"
                placeholder="Enter your password"
              />
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <span className="text-red-600 font-bold text-sm">
                  {errorMessage}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className={`w-full py-4 rounded-xl font-medium transition-all duration-200 ${
                isSigningIn
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              {isSigningIn ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to={"/register"}
                className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
