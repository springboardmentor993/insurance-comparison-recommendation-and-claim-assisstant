import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { policiesAPI } from '@/services/api';
import Layout from '@/components/Layout';
import PolicyCard from '@/components/PolicyCard';
import Filters from '@/components/Filters';
import PremiumCalculator from '@/components/PremiumCalculator';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [filters, setFilters] = useState({
    policy_type: undefined,  // ✅ FIX: use undefined (not empty string) for shadcn Select placeholder
    min_premium: '',
    max_premium: '',
  });

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['policies', filters],
    queryFn: async () => {
      const res = await policiesAPI.getAll({
        ...(filters.policy_type ? { policy_type: filters.policy_type } : {}),
        ...(filters.min_premium ? { min_premium: Number(filters.min_premium) } : {}),
        ...(filters.max_premium ? { max_premium: Number(filters.max_premium) } : {}),
      });
      return res.data;
    },
  });

  const policies = Array.isArray(data) ? data : [];

  const handleFilterChange = (key, value) => {
    // ✅ FIX: if Select sends "all", treat it as clearing the policy_type
    if (key === 'policy_type' && value === 'all') {
      setFilters((prev) => ({ ...prev, policy_type: undefined }));
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? (key === 'policy_type' ? undefined : '') : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      policy_type: undefined, // ✅ FIX
      min_premium: '',
      max_premium: '',
    });
  };

  const handleCalculate = (policy) => {
    setSelectedPolicy(policy);
    setCalculatorOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Insurance Policies</h2>
          <p className="text-muted-foreground mt-1">
            Browse and compare available insurance policies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Filters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="lg:col-span-3">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <p className="text-destructive font-medium">
                  Failed to load policies.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {error?.message?.includes('Network Error')
                    ? 'Backend not reachable. Run: cd backend/backend then python run.py'
                    : Array.isArray(error?.response?.data?.detail)
                      ? error.response.data.detail.map((e) => e.msg || JSON.stringify(e)).join('; ')
                      : typeof error?.response?.data?.detail === 'string'
                        ? error.response.data.detail
                        : error?.message ?? 'Please try again.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !error && policies.length === 0 && (
              <div className="bg-muted/50 rounded-lg p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  No policies found matching your criteria
                </p>
              </div>
            )}

            {!isLoading && !error && policies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {policies.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onCalculate={handleCalculate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPolicy && (
        <PremiumCalculator
          open={calculatorOpen}
          onClose={() => setCalculatorOpen(false)}
          policy={selectedPolicy}
        />
      )}
    </Layout>
  );
}
