export const Badge = ({ children, variant = 'default', size = 'md' }) => {
    const variants = {
        default: 'bg-slate-700 text-slate-200',
        success: 'bg-green-500/20 text-green-400 border border-green-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
        info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        primary: 'bg-blue-600 text-white',
        secondary: 'bg-purple-600 text-white',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

export default Badge;
