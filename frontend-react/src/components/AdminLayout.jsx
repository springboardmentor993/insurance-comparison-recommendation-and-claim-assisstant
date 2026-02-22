import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white p-6">
                <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
                <nav className="flex flex-col gap-4">
                    <Link to="/" className="hover:text-blue-200 text-base">🏠 Home</Link>
                    <Link to="/admin/dashboard" className="hover:text-blue-200 text-base">📊 Dashboard</Link>
                    <Link to="/admin/claims" className="hover:text-blue-200 text-base">📋 Claims Review</Link>
                    <Link to="/admin/documents" className="hover:text-blue-200 text-base">📄 Documents</Link>
                    <Link to="/admin/fraud" className="hover:text-blue-200 text-base">🛡️ Fraud Monitoring</Link>
                </nav>
            </aside>
            <main className="flex-1 bg-gray-50 p-8">
                <Outlet />
            </main>
        </div>
    );
}
