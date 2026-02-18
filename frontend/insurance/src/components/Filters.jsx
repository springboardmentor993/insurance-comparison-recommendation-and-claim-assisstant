import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

export default function Filters({ filters, onFilterChange, onClearFilters }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="policy_type">Policy Type</Label>

          <Select
            value={filters.policy_type ?? 'all'}
            onValueChange={(value) => {
              if (value === 'all') onFilterChange('policy_type', '');
              else onFilterChange('policy_type', value);
            }}
          >
            <SelectTrigger id="policy_type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>

            <SelectContent>
              {/* ✅ FIX: value must NOT be "" */}
              <SelectItem value="all">All Types</SelectItem>

              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="life">Life</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_premium">Min Premium (₹)</Label>
          <Input
            id="min_premium"
            type="number"
            placeholder="Min"
            value={filters.min_premium ?? ''}
            onChange={(e) => onFilterChange('min_premium', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_premium">Max Premium (₹)</Label>
          <Input
            id="max_premium"
            type="number"
            placeholder="Max"
            value={filters.max_premium ?? ''}
            onChange={(e) => onFilterChange('max_premium', e.target.value)}
          />
        </div>

        <Button onClick={onClearFilters} variant="outline" className="w-full" size="sm">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
