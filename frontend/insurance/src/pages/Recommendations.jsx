import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { recommendationsAPI } from '@/services/api';
import PremiumCalculator from '@/components/PremiumCalculator';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Building2,
  DollarSign,
  Calculator,
} from 'lucide-react';

const policyTypeColors = {
  auto: 'bg-blue-500',
  health: 'bg-green-500',
  life: 'bg-purple-500',
  home: 'bg-orange-500',
  travel: 'bg-pink-500',
};

export default function Recommendations() {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationsAPI.get().then((r) => r.data),
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Recommendations</h2>
          <p className="text-muted-foreground mt-1">
            Policies tailored to your profile and preferences. Update preferences in{' '}
            <Link to="/profile" className="text-primary font-medium hover:underline">
              Profile
            </Link>
            .
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>Failed to load recommendations. Set preferences in Profile and try again.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && Array.isArray(recommendations) && recommendations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations yet. Set preferred policy types and max premium in Profile.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && Array.isArray(recommendations) && recommendations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {recommendations.map((rec, idx) => {
              const policy = rec.policy ?? rec;
              const score = rec.score;
              const reasons = rec.reasons ?? [];
              const type = policy?.policy_type || 'unknown';
              const badgeClass = policyTypeColors[type] || 'bg-gray-500';
              const title = policy?.title || policy?.name || 'Untitled Policy';
              const providerName = policy?.provider?.name ?? '—';
              const premiumNum = Number(policy?.premium ?? 0);
              return (
                <Card key={policy?.id ?? idx} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge className={`${badgeClass} text-white`}>Score {score}</Badge>
                      <Badge variant="outline">{String(type).toUpperCase()}</Badge>
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {providerName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Premium
                      </span>
                      <span className="font-semibold text-primary">₹{premiumNum.toLocaleString()}</span>
                    </div>
                    {policy?.term_months != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Term</span>
                        <span className="font-medium">{policy.term_months} months</span>
                      </div>
                    )}
                    {policy?.deductible != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deductible</span>
                        <span className="font-medium">₹{Number(policy.deductible).toLocaleString()}</span>
                      </div>
                    )}
                    {reasons.length > 0 && (
                      <div className="pt-3 mt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Why recommended</p>
                        <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">
                          {reasons.slice(0, 4).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setCalculatorOpen(true);
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Premium
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
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
