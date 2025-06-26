import { useState, type FormEvent } from "react";
import { Navigate, Link } from "react-router";
import { useAuth } from "../../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from "../../firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

const Register = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { userLoggedIn } = useAuth();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Password doesn't match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email");
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      setErrorMessage("");
      try {
        await doCreateUserWithEmailAndPassword(email, password).finally(() => {
          setIsRegistering(false);
        });
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, "Users", user.uid), {
            name: name,
            email: email,
          });
        }
        console.log("User reg succesfully");
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={"/todo"} replace={true} />}

      <main className="w-full min-h-screen flex self-center place-content-center place-items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create a New Account
            </h3>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500 font-medium"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
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
                disabled={isRegistering}
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Create a strong password"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                disabled={isRegistering}
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setconfirmPassword(e.target.value);
                }}
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 outline-none placeholder-gray-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Confirm your password"
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
              disabled={isRegistering}
              className={`w-full py-4 rounded-xl font-medium transition-all duration-200 ${
                isRegistering
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              {isRegistering ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Signing Up...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to={"/login"}
                  className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;
