import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/services/api";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
  });

  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      setTimeout(() => navigate("/login"), 1500);
    },
  });

  // ✅ Always send DOB in YYYY-MM-DD or null (FastAPI friendly)
  const normalizeDob = (dobValue) => {
    if (!dobValue) return null;

    // if already "YYYY-MM-DD", keep it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dobValue)) return dobValue;

    // fallback: try converting (covers edge cases)
    const d = new Date(dobValue);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name || undefined,
      email: formData.email,
      password: formData.password,
      dob: normalizeDob(formData.dob),
    };
    registerMutation.mutate(payload);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // keep the value as typed; normalize only on submit
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Safely format FastAPI / backend errors for display
  const getErrorMessage = () => {
    const err = registerMutation.error;
    const detail = err?.response?.data?.detail;

    if (!detail) {
      // handle common axios/network errors too
      if (err?.message?.includes("Network Error")) {
        return "Backend not reachable. Please start backend on http://localhost:8001";
      }
      return "Registration failed. Please try again.";
    }

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      // FastAPI 422 validation errors: array of { loc, msg, type }
      return detail
        .map((e) => {
          const field = Array.isArray(e.loc) ? e.loc.join(".") : "field";
          return `${field}: ${e.msg}`;
        })
        .join("\n");
    }

    if (typeof detail === "object") {
      return JSON.stringify(detail, null, 2);
    }

    return "Registration failed. Please try again.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Join Insurenz to explore insurance policies
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Roopa"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            {/* ERROR (safe rendering) */}
            {registerMutation.isError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <pre className="whitespace-pre-wrap m-0 leading-snug">{getErrorMessage()}</pre>
              </div>
            )}

            {/* ✅ SUCCESS */}
            {registerMutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Registration successful! Redirecting to login...</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
