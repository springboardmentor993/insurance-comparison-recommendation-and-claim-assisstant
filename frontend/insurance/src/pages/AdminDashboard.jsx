import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertTriangle, DollarSign, FileText, CheckCircle2, XCircle, Clock, Download, Search } from 'lucide-react';
import api from '@/services/api';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [fraudFilter, setFraudFilter] = useState(false);

    // Fetch Stats
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await api.get('/admin/claims/stats');
            return res.data;
        }
    });

    // Fetch Claims
    const { data: claims, isLoading } = useQuery({
        queryKey: ['admin-claims', statusFilter, fraudFilter],
        queryFn: async () => {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (fraudFilter) params.fraud_only = true;

            const res = await api.get('/admin/claims/all', { params });
            return res.data;
        }
    });

    // Approve/Reject Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, notes }) => {
            return api.patch(`/claims/${id}/status`, { status, status_notes: notes });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-claims']);
            queryClient.invalidateQueries(['admin-stats']);
        }
    });

    const handleStatusUpdate = (id, newStatus) => {
        if (confirm(`Are you sure you want to mark this claim as ${newStatus}?`)) {
            updateStatusMutation.mutate({ id, status: newStatus, notes: `Admin updated to ${newStatus}` });
        }
    };

    const exportCSV = () => {
        if (!claims) return;

        const headers = ["Claim ID", "User Policy ID", "Type", "Amount", "Status", "Date", "Fraud Risk"];
        const rows = claims.map(c => [
            c.claim_number,
            c.user_policy_id,
            c.claim_type,
            c.claim_amount,
            c.status,
            new Date(c.created_at).toLocaleDateString(),
            c.fraud_flags.length > 0 ? "HIGH RISK" : "Normal"
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "claims_export.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <Button variant="outline" onClick={exportCSV} disabled={!claims || claims.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_claims || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pending_claims || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(stats?.total_payout || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.fraud_alerts || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex-1">
                    <h3 className="text-sm font-medium mb-1">Status Filter</h3>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant={fraudFilter ? "destructive" : "outline"}
                        onClick={() => setFraudFilter(!fraudFilter)}
                    >
                        {fraudFilter ? "Showing High Risk Only" : "Show High Risk Only"}
                    </Button>
                </div>
            </div>

            {/* Claims Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Claims</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-4">Claim ID</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Risk Level</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr><td colSpan="7" className="p-4 text-center">Loading...</td></tr>
                                ) : claims?.length === 0 ? (
                                    <tr><td colSpan="7" className="p-4 text-center">No claims found.</td></tr>
                                ) : (
                                    claims?.map((claim) => (
                                        <tr key={claim.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4 font-medium">{claim.claim_number}</td>
                                            <td className="p-4">{claim.claim_type}</td>
                                            <td className="p-4">{new Date(claim.incident_date).toLocaleDateString()}</td>
                                            <td className="p-4 font-mono">${claim.claim_amount.toLocaleString()}</td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {claim.status.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {claim.fraud_flags && claim.fraud_flags.filter(f => !f.is_resolved).length > 0 ? (
                                                    <div className="flex items-center text-red-600 font-bold">
                                                        <AlertTriangle className="w-4 h-4 mr-1" /> HIGH RISK
                                                    </div>
                                                ) : (
                                                    <span className="text-green-600 flex items-center">
                                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Low
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {claim.status === 'pending' || claim.status === 'under_review' ? (
                                                    <>
                                                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() => handleStatusUpdate(claim.id, 'approved')}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => handleStatusUpdate(claim.id, 'rejected')}>
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
