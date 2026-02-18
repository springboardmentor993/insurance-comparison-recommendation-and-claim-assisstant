import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, DollarSign, Shield } from "lucide-react";

const policyTypeColors = {
  auto: "bg-blue-500",
  health: "bg-green-500",
  life: "bg-purple-500",
  home: "bg-orange-500",
  travel: "bg-pink-500",
};

export default function PolicyCard({ policy, onCalculate }) {
  const type = policy?.policy_type || "unknown";
  const badgeClass = policyTypeColors[type] || "bg-gray-500";

  // ✅ API mostly gives name, not title
  const title = policy?.name || policy?.title || "Untitled Policy";

  // ✅ provider might not exist
  const providerName = policy?.provider?.name || policy?.provider_name || "Insurer";

  // ✅ premium might be number/string
  const premiumNum = Number(policy?.premium ?? 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={`${badgeClass} text-white`}>
            {String(type).toUpperCase()}
          </Badge>
          <Shield className="h-5 w-5 text-muted-foreground" />
        </div>

        <CardTitle className="text-xl">{title}</CardTitle>

        <CardDescription className="flex items-center gap-1 mt-1">
          <Building2 className="h-3 w-3" />
          {providerName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Premium
          </span>
          <span className="font-semibold text-lg text-primary">
            ₹{premiumNum.toLocaleString()}
          </span>
        </div>

        {/* ✅ Optional fields only if backend provides */}
        {policy?.term_months != null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Term</span>
            <span className="font-medium">{policy.term_months} months</span>
          </div>
        )}

        {policy?.deductible != null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deductible</span>
            <span className="font-medium">₹{Number(policy.deductible).toLocaleString()}</span>
          </div>
        )}

        {policy?.coverage && typeof policy.coverage === 'object' && Object.keys(policy.coverage).length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1">Coverage</p>
            <div className="text-sm text-muted-foreground space-y-0.5">
              {Object.entries(policy.coverage).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium">{typeof value === 'number' ? `₹${value.toLocaleString()}` : value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={() => onCalculate?.(policy)} className="w-full">
          Calculate Premium
        </Button>
      </CardFooter>
    </Card>
  );
}
