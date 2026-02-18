import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { claimsAPI, policiesAPI } from '@/services/api';
import api from '@/services/api';

const STEPS = [
  { id: 1, title: 'Policy Selection', description: 'Select the policy for this claim' },
  { id: 2, title: 'Claim Details', description: 'Provide incident information' },
  { id: 3, title: 'Upload Documents', description: 'Attach supporting documents' },
  { id: 4, title: 'Review & Submit', description: 'Review and submit your claim' },
];

const CLAIM_TYPES = [
  'Medical Expense',
  'Accident',
  'Property Damage',
  'Theft',
  'Fire',
  'Natural Disaster',
  'Other',
];

export default function FileClaim() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    user_policy_id: '',
    claim_type: '',
    incident_date: '',
    description: '',
    claim_amount: '',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch user policies
  const { data: policiesData } = useQuery({
    queryKey: ['user-policies'],
    queryFn: async () => {
      const response = await policiesAPI.getUserPolicies();
      return response.data;
    },
  });

  const userPolicies = policiesData?.filter(p => p.status === 'active') || [];

  const fileClaimMutation = useMutation({
    mutationFn: (data) => claimsAPI.create(data),
    onSuccess: () => {
      navigate('/claims');
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const validFiles = selectedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, files: `File ${file.name} is not a supported format` }));
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, files: `File ${file.name} exceeds 10MB limit` }));
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.user_policy_id) {
        newErrors.user_policy_id = 'Please select a policy';
      }
    }

    if (step === 2) {
      if (!formData.claim_type) newErrors.claim_type = 'Please select a claim type';
      if (!formData.incident_date) newErrors.incident_date = 'Please select incident date';
      if (!formData.description) newErrors.description = 'Please provide a description';
      if (!formData.claim_amount || formData.claim_amount <= 0) {
        newErrors.claim_amount = 'Please enter a valid claim amount';
      }
    }

    if (step === 3) {
      if (files.length === 0) {
        newErrors.files = 'Please upload at least one document';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    const submitData = new FormData();
    submitData.append('user_policy_id', formData.user_policy_id);
    submitData.append('claim_type', formData.claim_type);
    submitData.append('incident_date', formData.incident_date);
    submitData.append('description', formData.description);
    submitData.append('claim_amount', formData.claim_amount);

    files.forEach(file => {
      submitData.append('files', file);
    });

    fileClaimMutation.mutate(submitData);
  };

  const selectedPolicy = userPolicies.find(p => p.id === parseInt(formData.user_policy_id));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">File a Claim</h1>
          <p className="text-muted-foreground">Submit a new insurance claim with supporting documents</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors ${currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.id
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground'
                      }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-6 w-6" /> : step.id}
                  </div>
                  <div className="text-center mt-2">
                    <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${currentStep > step.id ? 'bg-primary' : 'bg-muted'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Policy Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="policy">Select Policy *</Label>
                  <Select
                    value={formData.user_policy_id}
                    onValueChange={(value) => handleInputChange('user_policy_id', value)}
                  >
                    <SelectTrigger className="w-full mt-1.5">
                      <SelectValue placeholder="Select a policy..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userPolicies.map(policy => (
                        <SelectItem key={policy.id} value={String(policy.id)}>
                          {policy.policy?.title || 'Policy'} - {policy.policy_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user_policy_id && (
                    <p className="text-sm text-destructive mt-1">{errors.user_policy_id}</p>
                  )}
                </div>

                {selectedPolicy && (
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <h4 className="font-semibold">Selected Policy Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Policy Number:</span> {selectedPolicy.policy_number}</div>
                      <div><span className="text-muted-foreground">Type:</span> {selectedPolicy.policy?.policy_type}</div>
                      <div><span className="text-muted-foreground">Coverage:</span> {selectedPolicy.policy?.coverage && typeof selectedPolicy.policy.coverage === 'object' ? Object.entries(selectedPolicy.policy.coverage).map(([k, v]) => `${k}: ${v}`).join(', ') : selectedPolicy.policy?.coverage || 'N/A'}</div>
                      <div><span className="text-muted-foreground">Valid Until:</span> {new Date(selectedPolicy.end_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Claim Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="claim_type">Claim Type *</Label>
                  <Select
                    value={formData.claim_type}
                    onValueChange={(value) => handleInputChange('claim_type', value)}
                  >
                    <SelectTrigger className="w-full mt-1.5">
                      <SelectValue placeholder="Select claim type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CLAIM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.claim_type && (
                    <p className="text-sm text-destructive mt-1">{errors.claim_type}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="incident_date">Incident Date *</Label>
                  <Input
                    id="incident_date"
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => handleInputChange('incident_date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.incident_date && (
                    <p className="text-sm text-destructive mt-1">{errors.incident_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="claim_amount">Claim Amount ($) *</Label>
                  <Input
                    id="claim_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.claim_amount}
                    onChange={(e) => handleInputChange('claim_amount', e.target.value)}
                    placeholder="0.00"
                  />
                  {errors.claim_amount && (
                    <p className="text-sm text-destructive mt-1">{errors.claim_amount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what happened in detail..."
                    rows={5}
                    className="w-full mt-1.5 px-3 py-2 border rounded-md bg-background resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Upload Supporting Documents *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                  </p>

                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload files</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {errors.files && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.files}
                    </p>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({files.length})</Label>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-md space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Claim Summary</h4>
                    <div className="grid gap-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Policy:</span>
                        <span className="font-medium">{selectedPolicy?.policy_number}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Claim Type:</span>
                        <span className="font-medium">{formData.claim_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Incident Date:</span>
                        <span className="font-medium">{new Date(formData.incident_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Claim Amount:</span>
                        <span className="font-medium">${parseFloat(formData.claim_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Documents:</span>
                        <span className="font-medium">{files.length} file(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                </div>

                {fileClaimMutation.isError && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Error submitting claim</p>
                      <p className="text-sm">
                        {(() => {
                          const errorDetail = fileClaimMutation.error?.response?.data?.detail;
                          if (typeof errorDetail === 'string') return errorDetail;
                          if (Array.isArray(errorDetail)) return errorDetail.map(e => e.msg).join(', ');
                          if (typeof errorDetail === 'object') return JSON.stringify(errorDetail);
                          return 'Please try again';
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || fileClaimMutation.isPending}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/claims')}
                  disabled={fileClaimMutation.isPending}
                >
                  Cancel
                </Button>

                {currentStep < STEPS.length ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={fileClaimMutation.isPending}
                  >
                    {fileClaimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
