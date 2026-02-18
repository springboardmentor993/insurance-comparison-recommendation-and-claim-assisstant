import api from "./api"; // path adjust

const handleLogin = async () => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  // IMPORTANT
  localStorage.setItem("token", res.data.access_token);
};
