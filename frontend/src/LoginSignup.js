import { useState } from "react";

function LoginSignup({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);

  // LOGIN STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SIGNUP STATE
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // LOGIN HANDLER
  const handleLogin = async () => {
    if (email === "") {
      alert("Email is required");
      return;
    }

    if (password === "") {
      alert("Password is required");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      alert(data.message);

      // INFORM APP THAT LOGIN IS SUCCESSFUL
      onLoginSuccess();
    } catch (error) {
      alert("Backend not reachable");
    }
  };

  // SIGNUP HANDLER (UI only)
  const handleSignup = () => {
    if (signupPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    alert("Signup validation passed");
  };

  return (
    <>
      {/* APP HEADER */}
      <div className="app-header">
        <h1 className="app-title">CoverMate</h1>
        <p className="app-subtitle">
          Insurance Comparison & Claim Assistant
        </p>
      </div>

      {/* LOGIN / SIGNUP CARD */}
      <div className="login-container">
        {isSignup ? (
          <>
            <h2>Signup</h2>

            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Email</label>
            <input
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="primary-btn" onClick={handleSignup}>
              Signup
            </button>

            <button
              className="secondary-btn"
              onClick={() => setIsSignup(false)}
            >
              Login
            </button>
          </>
        ) : (
          <>
            <h2>Login</h2>

            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="primary-btn" onClick={handleLogin}>
              Login
            </button>

            <button
              className="secondary-btn"
              onClick={() => setIsSignup(true)}
            >
              Signup
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default LoginSignup;






































// import { useState } from "react";

// function LoginSignup({ onLoginSuccess }) {
//   const [isSignup, setIsSignup] = useState(false);

//   // LOGIN STATE
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // SIGNUP STATE
//   const [name, setName] = useState("");
//   const [signupEmail, setSignupEmail] = useState("");
//   const [signupPassword, setSignupPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   // LOGIN HANDLER
//   const handleLogin = async () => {
//     if (email === "") {
//       alert("Email is required");
//       return;
//     }

//     if (password === "") {
//       alert("Password is required");
//       return;
//     }

//     try {
//       const response = await fetch("http://127.0.0.1:8000/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: email,
//           password: password,
//         }),
//       });

//       const data = await response.json();
//       alert(data.message);

//       // 👉 INFORM APP THAT LOGIN IS SUCCESSFUL
//       onLoginSuccess();

//     } catch (error) {
//       alert("Backend not reachable");
//     }
//   };

//   // SIGNUP HANDLER (UI only)
//   const handleSignup = () => {
//     if (signupPassword !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     alert("Signup validation passed");
//   };

//   return (
//     <div className="login-container">
//       {isSignup ? (
//         <>
//           <h2>Signup Page</h2>

//           <label>Name</label>
//           <input value={name} onChange={(e) => setName(e.target.value)} />

//           <label>Email</label>
//           <input value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />

//           <label>Password</label>
//           <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />

//           <label>Confirm Password</label>
//           <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

//           <button className="primary-btn" onClick={handleSignup}>Signup</button>

//           <button className="secondary-btn" onClick={() => setIsSignup(false)}>
//             Login
//           </button>
//         </>
//       ) : (
//         <>
//           <h2>Login Page</h2>

//           <label>Email</label>
//           <input value={email} onChange={(e) => setEmail(e.target.value)} />

//           <label>Password</label>
//           <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

//           <button className="primary-btn" onClick={handleLogin}>Login</button>

//           <button className="secondary-btn" onClick={() => setIsSignup(true)}>
//             Signup
//           </button>
//         </>
//       )}
//     </div>
//   );
// }

// export default LoginSignup;

// import { useState } from "react";

// function LoginSignup({ onLoginSuccess }) {
//   const [isSignup, setIsSignup] = useState(false);

//   // LOGIN STATE
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // SIGNUP STATE
//   const [name, setName] = useState("");
//   const [signupEmail, setSignupEmail] = useState("");
//   const [signupPassword, setSignupPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   // LOGIN HANDLER
//   const handleLogin = async () => {
//     if (email === "") {
//       alert("Email is required");
//       return;
//     }

//     if (password === "") {
//       alert("Password is required");
//       return;
//     }

//     try {
//       const response = await fetch("http://127.0.0.1:8000/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: email,
//           password: password,
//         }),
//       });

//       const data = await response.json();
//       alert(data.message);

//       // 👉 INFORM APP THAT LOGIN IS SUCCESSFUL
//       onLoginSuccess();

//     } catch (error) {
//       alert("Backend not reachable");
//     }
//   };

//   // SIGNUP HANDLER (UI only)
//   const handleSignup = () => {
//     if (signupPassword !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     alert("Signup validation passed");
//   };

//   return (
//     <div className="login-container">
//       {isSignup ? (
//         <>
//           <h2>Signup Page</h2>

//           <label>Name</label>
//           <input value={name} onChange={(e) => setName(e.target.value)} />

//           <label>Email</label>
//           <input value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />

//           <label>Password</label>
//           <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />

//           <label>Confirm Password</label>
//           <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

//           <button className="primary-btn" onClick={handleSignup}>Signup</button>

//           <button className="secondary-btn" onClick={() => setIsSignup(false)}>
//             Login
//           </button>
//         </>
//       ) : (
//         <>
//           <h2>Login Page</h2>

//           <label>Email</label>
//           <input value={email} onChange={(e) => setEmail(e.target.value)} />

//           <label>Password</label>
//           <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

//           <button className="primary-btn" onClick={handleLogin}>Login</button>

//           <button className="secondary-btn" onClick={() => setIsSignup(true)}>
//             Signup
//           </button>
//         </>
//       )}
//     </div>
//   );
// }

// export default LoginSignup;