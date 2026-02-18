import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_ICONS = {
    pending: Clock,
    under_review: AlertCircle,
    approved: CheckCircle2,
    rejected: XCircle,
    completed: CheckCircle2,
};

const STATUS_COLORS = {
    pending: 'text-yellow-600 bg-yellow-100',
    under_review: 'text-blue-600 bg-blue-100',
    approved: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    completed: 'text-indigo-600 bg-indigo-100',
};

export function Timeline({ history }) {
    if (!history || history.length === 0) return null;

    // Sort history by date desc
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {sortedHistory.map((item, index) => {
                const Icon = STATUS_ICONS[item.status] || Clock;
                const colorClass = STATUS_COLORS[item.status] || 'text-gray-500 bg-gray-100';

                return (
                    <div key={item.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transform translate-x-0 z-10",
                            colorClass
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>

                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-900 capitalize text-sm">
                                    {item.status.replace('_', ' ')}
                                </div>
                                <time className="font-caveat font-medium text-xs text-indigo-500">
                                    {new Date(item.created_at).toLocaleString()}
                                </time>
                            </div>
                            <div className="text-slate-500 text-sm">
                                {item.notes}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
