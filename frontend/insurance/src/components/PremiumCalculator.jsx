import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { policiesAPI } from '@/services/api';
import { Calculator, TrendingUp } from 'lucide-react';

export default function PremiumCalculator({ open, onClose, policy }) {
  const [formData, setFormData] = useState({
    age: '',
    coverage_amount: '',
    term_years: '',
  });

  const calculationMutation = useMutation({
    mutationFn: (data) => policiesAPI.calculate(data),
  });

  const handleCalculate = () => {
    calculationMutation.mutate({
      policy_id: policy.id,
      age: parseInt(formData.age),
      coverage_amount: parseFloat(formData.coverage_amount),
      term_years: parseInt(formData.term_years),
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Premium Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate your personalized premium for {policy?.title || policy?.name || 'this policy'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverage_amount">Coverage Amount (₹)</Label>
            <Input
              id="coverage_amount"
              name="coverage_amount"
              type="number"
              placeholder="e.g. 500000"
              value={formData.coverage_amount}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="term_years">Term (Years)</Label>
            <Input
              id="term_years"
              name="term_years"
              type="number"
              placeholder="e.g., 10"
              value={formData.term_years}
              onChange={handleChange}
            />
          </div>

          {calculationMutation.isSuccess && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                Calculation Results
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Premium:</span>
                  <span className="font-medium">₹{calculationMutation.data?.data?.base_premium?.toLocaleString() ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loading Factor:</span>
                  <span className="font-medium">{calculationMutation.data?.data?.loading_factor?.toFixed(2) ?? '—'}x</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Final Premium:</span>
                  <span className="font-bold text-lg text-primary">
                    ₹{(calculationMutation.data?.data?.final_premium ?? 0).toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>
          )}

          {calculationMutation.isError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              Error calculating premium. Please try again.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={handleCalculate} 
            disabled={calculationMutation.isPending || !formData.age || !formData.coverage_amount || !formData.term_years}
          >
            {calculationMutation.isPending ? 'Calculating...' : 'Calculate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}