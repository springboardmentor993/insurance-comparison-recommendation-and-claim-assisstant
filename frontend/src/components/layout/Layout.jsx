import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <footer className="mt-16 border-t border-slate-700/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
                    <p>&copy; 2026 InsureMe. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
