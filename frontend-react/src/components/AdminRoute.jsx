import { Navigate } from 'react-router-dom';

const AUTHORIZED_ADMIN_EMAIL = "elchuritejaharshini@gmail.com";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    let isAdmin = false;
    let userEmail = null;

    try {
        if (user) {
            const userData = JSON.parse(user);
            isAdmin = userData.is_admin === true;
            userEmail = userData.email;
        }
    } catch (e) {
        // Fallback to is_admin localStorage key
        isAdmin = localStorage.getItem('is_admin') === 'true';
    }

    // Strict validation: must have token, be marked as admin, and have the authorized email
    if (!token) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    if (userEmail !== AUTHORIZED_ADMIN_EMAIL) return <Navigate to="/" replace />;

    return children;
}
