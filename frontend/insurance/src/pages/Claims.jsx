import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText, Download, Calendar, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { claimsAPI } from '@/services/api';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    variant: 'default',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  under_review: {
    label: 'Under Review',
    variant: 'secondary',
    icon: AlertCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    icon: CheckCircle2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
};

import { Timeline } from '@/components/Timeline';

function ClaimCard({ claim }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const statusConfig = STATUS_CONFIG[claim.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const hasDocuments = claim.documents && claim.documents.length > 0;
  const hasHistory = claim.history && claim.history.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <CardTitle className="text-lg truncate">{claim.claim_number}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">{claim.description}</CardDescription>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} shrink-0`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Claim Type</p>
            <p className="font-medium text-sm">{claim.claim_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Incident Date</p>
            <p className="font-medium text-sm flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(claim.incident_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Claim Amount</p>
            <p className="font-medium text-sm flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {parseFloat(claim.claim_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Submitted</p>
            <p className="font-medium text-sm">
              {new Date(claim.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {claim.approved_amount && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Approved Amount: </span>
              ${parseFloat(claim.approved_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {claim.status_notes && (
          <div className="bg-muted rounded-md p-3">
            <p className="text-sm font-semibold mb-1">Status Notes</p>
            <p className="text-sm text-muted-foreground">{claim.status_notes}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? 'Hide' : 'Show'} Details
          </button>

          {expanded && (
            <div className="mt-4">
              <div className="flex border-b mb-4">
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'documents'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents ({claim.documents?.length || 0})
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
              </div>

              {activeTab === 'documents' && (
                <div className="space-y-2">
                  {hasDocuments ? (
                    claim.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.s3_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No documents attached.</p>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="py-2">
                  {hasHistory ? (
                    <Timeline history={claim.history} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No history available.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Claims() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: claims, isLoading, error } = useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const response = await claimsAPI.getAll();
      return response.data;
    },
  });

  const filteredClaims = claims?.filter(claim =>
    statusFilter === 'all' || claim.status === statusFilter
  ) || [];

  const stats = {
    total: claims?.length || 0,
    pending: claims?.filter(c => c.status === 'pending').length || 0,
    approved: claims?.filter(c => c.status === 'approved').length || 0,
    rejected: claims?.filter(c => c.status === 'rejected').length || 0,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Claims</h1>
            <p className="text-muted-foreground">Track and manage your insurance claims</p>
          </div>
          <Button onClick={() => navigate('/claims/file')}>
            <Plus className="h-4 w-4 mr-2" />
            File New Claim
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Claims</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All Claims
            </Button>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Claims List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading claims...</p>
          </div>
        ) : error ? (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-semibold">Error loading claims</p>
              </div>
              <p className="text-sm mt-2">{error.message}</p>
            </CardContent>
          </Card>
        ) : filteredClaims.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter === 'all' ? 'No claims yet' : `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} claims`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'all'
                  ? 'Get started by filing your first claim'
                  : 'Try selecting a different filter'}
              </p>
              {statusFilter === 'all' && (
                <Button onClick={() => navigate('/claims/file')}>
                  <Plus className="h-4 w-4 mr-2" />
                  File Your First Claim
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
