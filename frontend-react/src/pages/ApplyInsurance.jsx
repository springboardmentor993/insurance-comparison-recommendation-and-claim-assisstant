import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ApplyInsurance.css";

export default function ApplyInsurance() {
    const { policyId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        nomineeName: "",
        nomineeRelation: "",
        nomineePhone: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchPolicy();
    }, [policyId, token, navigate]);

    const fetchPolicy = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8000/policies/${policyId}`);
            if (!res.ok) throw new Error("Failed to load policy");
            const data = await res.json();
            setPolicy(data);
            setError("");
        } catch (err) {
            console.error("Error:", err);
            setError("Error loading policy: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) newErrors.phoneNumber = "Invalid phone number (10 digits)";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.nomineeName.trim()) newErrors.nomineeName = "Nominee name is required";
        if (!formData.nomineeRelation) newErrors.nomineeRelation = "Nominee relation is required";
        if (!formData.nomineePhone.trim()) newErrors.nomineePhone = "Nominee phone is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            setError("Please fix the errors below");
            return;
        }

        setSubmitting(true);
        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append("policy_id", policyId);
            params.append("full_name", formData.fullName);
            params.append("email", formData.email);
            params.append("phone_number", formData.phoneNumber);
            params.append("date_of_birth", formData.dateOfBirth);
            params.append("gender", formData.gender);
            params.append("address", formData.address);
            params.append("nominee_name", formData.nomineeName);
            params.append("nominee_relation", formData.nomineeRelation);
            params.append("nominee_phone", formData.nomineePhone);
            params.append("token", token);

            const response = await fetch(
                `http://localhost:8000/user-applications?${params.toString()}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to submit application");
            }

            const data = await response.json();
            setSuccess("✅ Application submitted successfully! We'll contact you within 24 hours.");

            setTimeout(() => {
                navigate("/browse");
            }, 3000);
        } catch (err) {
            console.error("Error:", err);
            setError("Error submitting application: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <div style={{ color: "white", fontSize: "18px" }}>⏳ Loading...</div>
        </div>
    );

    if (error && !policy) return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "12px",
                maxWidth: "500px",
                textAlign: "center"
            }}>
                <h2 style={{ color: "#d32f2f", margin: "0 0 15px 0" }}>⚠️ Error</h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>{error}</p>
                <button
                    onClick={() => navigate("/browse")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#667eea",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    ← Back to Browse
                </button>
            </div>
        </div>
    );

    if (!policy) return null;

    return (
        <div className="apply-insurance-page">
            <div className="apply-container">
                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="apply-card">
                    <h1>📋 Insurance Application Form</h1>
                    <p className="policy-info">
                        Applying for: <strong>{policy.title}</strong>
                    </p>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setError("")}>✕</button>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <span>{success}</span>
                            <button onClick={() => setSuccess("")}>✕</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="apply-form">
                        {/* Personal Information Section */}
                        <div className="form-section">
                            <h2>Personal Information</h2>

                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    disabled={submitting}
                                />
                                {errors.fullName && <span className="error">{errors.fullName}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        disabled={submitting}
                                    />
                                    {errors.email && <span className="error">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Enter 10-digit phone number"
                                        disabled={submitting}
                                    />
                                    {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date of Birth *</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Gender *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={submitting}
                                    >
                                        <option value="">-- Select --</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <span className="error">{errors.gender}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address *</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter your full address"
                                    rows="3"
                                    disabled={submitting}
                                />
                                {errors.address && <span className="error">{errors.address}</span>}
                            </div>
                        </div>

                        {/* Nominee Information Section */}
                        <div className="form-section">
                            <h2>Nominee Details</h2>

                            <div className="form-group">
                                <label>Nominee Name *</label>
                                <input
                                    type="text"
                                    name="nomineeName"
                                    value={formData.nomineeName}
                                    onChange={handleChange}
                                    placeholder="Enter nominee's full name"
                                    disabled={submitting}
                                />
                                {errors.nomineeName && <span className="error">{errors.nomineeName}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Relation to Nominee *</label>
                                    <select
                                        name="nomineeRelation"
                                        value={formData.nomineeRelation}
                                        onChange={handleChange}
                                        disabled={submitting}
                                    >
                                        <option value="">-- Select --</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Child">Child</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Friend">Friend</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.nomineeRelation && <span className="error">{errors.nomineeRelation}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Nominee Phone *</label>
                                    <input
                                        type="tel"
                                        name="nomineePhone"
                                        value={formData.nomineePhone}
                                        onChange={handleChange}
                                        placeholder="Enter nominee's phone"
                                        disabled={submitting}
                                    />
                                    {errors.nomineePhone && <span className="error">{errors.nomineePhone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(-1)}
                                disabled={submitting}
                            >
                                ← Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? "⏳ Submitting..." : "✅ Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
