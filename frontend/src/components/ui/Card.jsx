export const Card = ({ children, className = '', glass = false, hover = true }) => {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';
    const glassStyles = glass ? 'glass' : 'bg-slate-800/50 border border-slate-700/50';
    const hoverStyles = hover ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30' : '';

    return (
        <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
