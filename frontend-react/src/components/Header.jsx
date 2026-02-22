import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

/**
 * Header component - Navigation bar
 * Shows when user is authenticated
 * Provides navigation to main app sections
 */
export default function Header() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("user");
        localStorage.removeItem("is_admin");
        navigate("/login");
    };

    if (!token) return null;

    return (
        <>
            <style>{headerStyles}</style>
            <header style={styles.header}>
                <div style={styles.inner}>

                    {/* Logo */}
                    <div style={styles.logo} onClick={() => navigate("/dashboard")} className="logo-wrap">
                        <div style={styles.logoIcon}>🛡️</div>
                        <span style={styles.logoText}>InsureCompare</span>
                    </div>

                    {/* Nav links */}
                    <nav style={styles.nav}>
                        <button onClick={() => navigate("/dashboard")} style={styles.navBtn} className="nav-btn">
                            🏠 Home
                        </button>
                        <button onClick={() => navigate("/browse")} style={styles.navBtn} className="nav-btn">
                            🔍 Browse Policies
                        </button>
                        <button onClick={() => navigate("/profile")} style={styles.navBtn} className="nav-btn">
                            👤 My Profile
                        </button>

                        {/* Notification Bell */}
                        {token && <NotificationBell token={token} user={user} />}

                        {/* Dropdown */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                style={{ ...styles.menuBtn, background: showMenu ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.07)', borderColor: showMenu ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.12)' }}
                                className="menu-toggle"
                            >
                                More
                                <span style={{ ...styles.menuCaret, transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                            </button>

                            {showMenu && (
                                <div style={styles.dropdown}>
                                    <div style={styles.dropdownInner}>
                                        {[
                                            { icon: "📋", label: "Insurance Claims", path: "/claims" },
                                            { icon: "🛡️", label: "Fraud Monitoring", path: "/fraud" },
                                            { icon: "✨", label: "AI Recommendations", path: "/recommendations" },
                                        ].map(item => (
                                            <button
                                                key={item.path}
                                                onClick={() => { navigate(item.path); setShowMenu(false); }}
                                                style={styles.dropdownItem}
                                                className="dropdown-item"
                                            >
                                                <span style={styles.dropdownItemIcon}>{item.icon}</span>
                                                <span style={styles.dropdownItemLabel}>{item.label}</span>
                                            </button>
                                        ))}
                                        <div style={styles.dropdownDivider} />
                                        <button
                                            onClick={() => { handleLogout(); setShowMenu(false); }}
                                            style={styles.logoutItem}
                                            className="logout-item"
                                        >
                                            <span style={styles.dropdownItemIcon}>🚪</span>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
        </>
    );
}

const styles = {
    header: {
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    inner: {
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 24px', height: '64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    // Logo
    logo: {
        display: 'flex', alignItems: 'center', gap: '10px',
        cursor: 'pointer', userSelect: 'none',
    },
    logoIcon: {
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
    },
    logoText: {
        fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px',
        background: 'linear-gradient(135deg,#f1f5f9,#94a3b8)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    // Nav
    nav: {
        display: 'flex', alignItems: 'center', gap: '4px',
    },
    navBtn: {
        background: 'transparent', color: '#94a3b8',
        border: 'none', borderRadius: '8px',
        padding: '8px 14px', fontSize: '14px', fontWeight: '600',
        cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
        transition: 'all 0.15s', whiteSpace: 'nowrap',
    },
    menuBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        color: '#e2e8f0', border: '1px solid',
        borderRadius: '8px', padding: '8px 14px',
        fontSize: '14px', fontWeight: '600',
        cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
        transition: 'all 0.15s',
    },
    menuCaret: {
        fontSize: '9px', transition: 'transform 0.2s ease', display: 'inline-block',
    },
    // Dropdown
    dropdown: {
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        zIndex: 1000, minWidth: '210px',
    },
    dropdownInner: {
        background: 'rgba(13,20,40,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '8px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
    },
    dropdownItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '100%', textAlign: 'left',
        padding: '10px 14px', borderRadius: '8px',
        cursor: 'pointer', color: '#94a3b8',
        border: 'none', background: 'transparent',
        fontSize: '14px', fontWeight: '600',
        fontFamily: "'DM Sans',sans-serif",
        transition: 'all 0.12s',
    },
    dropdownItemIcon: { fontSize: '16px', flexShrink: 0 },
    dropdownItemLabel: {},
    dropdownDivider: {
        height: '1px', background: 'rgba(255,255,255,0.07)',
        margin: '6px 8px',
    },
    logoutItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '100%', textAlign: 'left',
        padding: '10px 14px', borderRadius: '8px',
        cursor: 'pointer', color: '#f87171',
        border: 'none', background: 'transparent',
        fontSize: '14px', fontWeight: '700',
        fontFamily: "'DM Sans',sans-serif",
        transition: 'all 0.12s',
    },
};

const headerStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

.logo-wrap:hover .logoText { opacity: 0.85; }

.nav-btn:hover {
    background: rgba(255,255,255,0.07) !important;
    color: #e2e8f0 !important;
}

.menu-toggle:hover {
    background: rgba(96,165,250,0.12) !important;
    border-color: rgba(96,165,250,0.3) !important;
    color: #60a5fa !important;
}

.dropdown-item:hover {
    background: rgba(255,255,255,0.07) !important;
    color: #e2e8f0 !important;
}

.logout-item:hover {
    background: rgba(248,113,113,0.12) !important;
    color: #fca5a5 !important;
}
`;
