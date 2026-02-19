export const Input = ({
    label,
    type = 'text',
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    const baseStyles = 'w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all';
    const errorStyles = error
        ? 'border-red-500 focus:ring-red-500/50'
        : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/50';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    type={type}
                    className={`${baseStyles} ${errorStyles} ${Icon ? 'pl-10' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

export default Input;
