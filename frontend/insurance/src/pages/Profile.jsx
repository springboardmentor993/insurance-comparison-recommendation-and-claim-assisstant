import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { profileAPI } from '@/services/api';
import { User, Loader2, AlertCircle, CheckCircle, Sliders } from 'lucide-react';

const POLICY_TYPES = ['auto', 'health', 'life', 'home', 'travel'];

export default function Profile() {
  const queryClient = useQueryClient();
  const [details, setDetails] = useState({ name: '', dob: '' });
  const [preferences, setPreferences] = useState({
    preferred_policy_types: [],
    max_premium: '',
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.get().then((r) => r.data),
  });

  const profile = profileQuery.data;
  const profileLoading = profileQuery.isLoading;
  const profileError = profileQuery.error;

  useEffect(() => {
    if (!profile) return;
    setDetails({
      name: profile.name ?? '',
      dob: profile.dob ?? '',
    });
    const prefs = profile.preferences;
    setPreferences({
      preferred_policy_types: Array.isArray(prefs?.preferred_policy_types)
        ? prefs.preferred_policy_types
        : [],
      max_premium: prefs?.max_premium != null ? String(prefs.max_premium) : '',
    });
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload) => profileAPI.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const getDetailMessage = (err) => {
    const d = err?.response?.data?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((e) => e.msg || JSON.stringify(e)).join(', ');
    if (d && typeof d === 'object') return JSON.stringify(d);
    return 'Update failed. Try again.';
  };

  const toggleType = (t) => {
    setPreferences((prev) => {
      const arr = prev.preferred_policy_types.includes(t)
        ? prev.preferred_policy_types.filter((x) => x !== t)
        : [...prev.preferred_policy_types, t];
      return { ...prev, preferred_policy_types: arr };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mp = preferences.max_premium !== '' ? parseFloat(preferences.max_premium) : null;
    const payload = {
      ...(details.name && { name: details.name }),
      ...(details.dob && { dob: details.dob }),
      preferences: {
        preferred_policy_types: preferences.preferred_policy_types,
        max_premium: mp != null && !Number.isNaN(mp) ? mp : null,
      },
    };
    updateMutation.mutate(payload);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Profile</h2>
          <p className="text-muted-foreground mt-1">
            Manage your details and preferences for recommendations
          </p>
        </div>

        {profileLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {profileError && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>Failed to load profile. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {!profileLoading && !profileError && profile && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  <CardTitle>Your details</CardTitle>
                </div>
                <CardDescription>
                  Age {profile.age != null ? profile.age : '—'} · {profile.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={details.name}
                    onChange={(e) => setDetails((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={details.dob}
                    onChange={(e) => setDetails((p) => ({ ...p, dob: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sliders className="h-6 w-6 text-primary" />
                  <CardTitle>Preferences</CardTitle>
                </div>
                <CardDescription>
                  Used for policy recommendations. Set preferred types and max premium.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred policy types</Label>
                  <div className="flex flex-wrap gap-2">
                    {POLICY_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleType(t)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                          preferences.preferred_policy_types.includes(t)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-input hover:bg-muted'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_premium">Max premium (₹)</Label>
                  <Input
                    id="max_premium"
                    type="number"
                    placeholder="e.g. 20000"
                    value={preferences.max_premium}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, max_premium: e.target.value }))
                    }
                  />
                </div>

                {updateMutation.isError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {getDetailMessage(updateMutation.error)}
                  </div>
                )}
                {updateMutation.isSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Profile and preferences updated.
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </Layout>
  );
}
