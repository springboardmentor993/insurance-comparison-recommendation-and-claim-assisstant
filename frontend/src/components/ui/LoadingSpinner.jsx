export const LoadingSpinner = ({ size = 'md', overlay = false }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    const spinner = (
        <div className="flex items-center justify-center">
            <div className={`${sizes[size]} border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin`} />
        </div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="glass rounded-2xl p-8">
                    {spinner}
                    <p className="mt-4 text-slate-300 text-center">Loading...</p>
                </div>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
