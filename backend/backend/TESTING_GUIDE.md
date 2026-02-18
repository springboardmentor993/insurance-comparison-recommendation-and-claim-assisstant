# Claims Workflow Testing Guide

This guide provides step-by-step instructions for testing the complete claims workflow.

## 🧪 Test Scenarios

### Scenario 1: Complete Claim Filing Flow

#### Prerequisites
- User is registered and logged in
- User has at least one active policy

#### Test Steps

1. **Get User Policies** (to select policy for claim)
   ```bash
   curl -X GET "http://localhost:8000/policies/my" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
   
   Expected: List of user's policies with policy numbers

2. **Prepare Test Documents**
   - Create test PDF file: `test_claim_document.pdf`
   - Create test image: `test_claim_photo.jpg`

3. **File a Claim**
   ```bash
   curl -X POST "http://localhost:8000/claims" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "user_policy_id=1" \
     -F "claim_type=medical" \
     -F "incident_date=2026-02-05" \
     -F "description=Emergency medical treatment for injury" \
     -F "claim_amount=7500.00" \
     -F "files=@test_claim_document.pdf" \
     -F "files=@test_claim_photo.jpg"
   ```
   
   Expected Response:
   - Status: 200 OK
   - Claim created with unique claim number (e.g., CLM-20260210-ABC123)
   - Status: "pending"
   - Documents uploaded with S3 URLs
   - User receives claim submission email

4. **Verify Email Notification**
   - Check user's email inbox
   - Should receive "Claim Submitted Successfully" email
   - Email should contain claim number, type, amount, and status

5. **Retrieve Claim Details**
   ```bash
   curl -X GET "http://localhost:8000/claims/1" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
   
   Expected: Complete claim details with documents

### Scenario 2: Claim Status Tracking

1. **Get All User Claims**
   ```bash
   curl -X GET "http://localhost:8000/claims" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
   
   Expected: List of all claims ordered by creation date (newest first)

2. **Update Claim Status to Under Review**
   ```bash
   curl -X PATCH "http://localhost:8000/claims/1/status" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "under_review",
       "status_notes": "Claim documents are being reviewed by our team"
     }'
   ```
   
   Expected:
   - Status updated to "under_review"
   - User receives status update email

3. **Approve Claim**
   ```bash
   curl -X PATCH "http://localhost:8000/claims/1/status" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "approved",
       "status_notes": "Claim approved. Payment will be processed within 5 business days.",
       "approved_amount": 7000.00
     }'
   ```
   
   Expected:
   - Status updated to "approved"
   - Approved amount set to 7000.00
   - User receives approval email with amount

4. **Complete Claim**
   ```bash
   curl -X PATCH "http://localhost:8000/claims/1/status" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "completed",
       "status_notes": "Payment has been processed and transferred to your account"
     }'
   ```
   
   Expected:
   - Status updated to "completed"
   - User receives completion email

### Scenario 3: Document Management

1. **Access Document URL**
   - Extract S3 URL from claim details
   - Open URL in browser
   - Expected: Document should be viewable/downloadable

2. **Refresh Expired URL**
   ```bash
   curl -X GET "http://localhost:8000/claims/1/documents/1/refresh-url" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
   
   Expected: New presigned URL with 7-day validity

### Scenario 4: Error Handling

1. **Test File Size Limit**
   ```bash
   # Try uploading file larger than 10MB
   curl -X POST "http://localhost:8000/claims" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "user_policy_id=1" \
     -F "claim_type=medical" \
     -F "incident_date=2026-02-05" \
     -F "description=Test claim" \
     -F "claim_amount=5000" \
     -F "files=@large_file.pdf"
   ```
   
   Expected: 400 Bad Request - File exceeds maximum size

2. **Test Invalid File Type**
   ```bash
   # Try uploading .exe file
   curl -X POST "http://localhost:8000/claims" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "user_policy_id=1" \
     -F "claim_type=medical" \
     -F "incident_date=2026-02-05" \
     -F "description=Test claim" \
     -F "claim_amount=5000" \
     -F "files=@test.exe"
   ```
   
   Expected: 400 Bad Request - File type not allowed

3. **Test Missing Documents**
   ```bash
   curl -X POST "http://localhost:8000/claims" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "user_policy_id=1" \
     -F "claim_type=medical" \
     -F "incident_date=2026-02-05" \
     -F "description=Test claim" \
     -F "claim_amount=5000"
   ```
   
   Expected: 400 Bad Request - At least one document is required

4. **Test Inactive Policy**
   ```bash
   # Try filing claim for inactive/expired policy
   curl -X POST "http://localhost:8000/claims" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "user_policy_id=2" \
     -F "claim_type=medical" \
     -F "incident_date=2026-02-05" \
     -F "description=Test claim" \
     -F "claim_amount=5000" \
     -F "files=@test.pdf"
   ```
   
   Expected: 400 Bad Request - Cannot file claim for inactive policy

5. **Test Invalid Status Transition**
   ```bash
   curl -X PATCH "http://localhost:8000/claims/1/status" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "invalid_status"
     }'
   ```
   
   Expected: 400 Bad Request - Invalid status

## 📊 Test Data Setup

### Create Test User

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "Test123!",
    "dob": "1990-01-15"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!"
  }'
```

Save the `access_token` from response for subsequent requests.

### Create Test Documents

**PDF Document:**
```powershell
# Create a simple text file and convert to PDF
"This is a test claim document." | Out-File -FilePath test_claim_document.txt
# Use a PDF converter or just use the text file for testing
```

**Image Document:**
```powershell
# Create a simple image (requires ImageMagick or similar)
# Or just use any existing JPG file
```

## 🔍 Monitoring & Logs

### Check Celery Worker Logs
Monitor the Celery terminal window for task execution logs:
```
[2026-02-10 10:30:00,000: INFO/MainProcess] Task tasks.send_claim_submitted_notification[...] received
[2026-02-10 10:30:01,500: INFO/ForkPoolWorker-1] Email sent successfully to testuser@example.com
[2026-02-10 10:30:01,600: INFO/ForkPoolWorker-1] Task tasks.send_claim_submitted_notification[...] succeeded
```

### Check FastAPI Logs
Monitor the FastAPI terminal window for API request logs:
```
INFO:     127.0.0.1:52000 - "POST /claims HTTP/1.1" 200 OK
INFO:     127.0.0.1:52001 - "GET /claims/1 HTTP/1.1" 200 OK
```

### Check Redis
```powershell
redis-cli
> KEYS *
> GET celery-task-meta-<task-id>
```

## ✅ Test Checklist

Use this checklist to verify all features are working:

- [ ] User can file a claim with multiple documents
- [ ] Documents are successfully uploaded to S3
- [ ] Claim submission email is sent
- [ ] Claim number is generated (format: CLM-YYYYMMDD-XXXXXXXX)
- [ ] User can retrieve all their claims
- [ ] User can retrieve specific claim details
- [ ] Claim status can be updated
- [ ] Status update email is sent on status change
- [ ] Document presigned URLs are generated
- [ ] Expired document URLs can be refreshed
- [ ] File type validation works (rejects invalid types)
- [ ] File size validation works (rejects > 10MB)
- [ ] Cannot file claim without documents
- [ ] Cannot file claim for inactive policy
- [ ] Invalid status values are rejected
- [ ] Celery tasks are executed successfully
- [ ] Redis is properly configured
- [ ] S3 uploads are working
- [ ] SMTP email sending is working

## 🐛 Common Issues

### Issue: Celery task pending but not executing
**Check:**
1. Is Celery worker running?
2. Is Redis running?
3. Check Celery worker logs for errors

### Issue: S3 upload fails
**Check:**
1. AWS credentials in .env
2. S3 bucket name is correct
3. S3 bucket permissions allow upload
4. Network connectivity to AWS

### Issue: Email not received
**Check:**
1. SMTP credentials in .env
2. Email might be in spam folder
3. Check Celery worker logs for SMTP errors
4. For Gmail, ensure "Less secure app access" is enabled or use app password

### Issue: Presigned URL returns 403
**Check:**
1. S3 bucket permissions
2. AWS credentials are valid
3. URL has not expired (7 days validity)
4. Use refresh-url endpoint to get new URL

## 📈 Performance Testing

### Test Multiple Concurrent Claims

```powershell
# Create multiple claims simultaneously
for ($i=1; $i -le 10; $i++) {
    curl -X POST "http://localhost:8000/claims" `
      -H "Authorization: Bearer YOUR_JWT_TOKEN" `
      -F "user_policy_id=1" `
      -F "claim_type=medical" `
      -F "incident_date=2026-02-05" `
      -F "description=Test claim $i" `
      -F "claim_amount=$($i * 1000)" `
      -F "files=@test.pdf" &
}
```

Expected: All claims should be created successfully

### Test Large File Upload

```powershell
# Create a 9MB test file (just under 10MB limit)
$bytes = new-object byte[] 9437184  # 9MB
(new-object Random).NextBytes($bytes)
[System.IO.File]::WriteAllBytes("large_test.pdf", $bytes)

# Upload
curl -X POST "http://localhost:8000/claims" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -F "user_policy_id=1" `
  -F "claim_type=medical" `
  -F "incident_date=2026-02-05" `
  -F "description=Large file test" `
  -F "claim_amount=5000" `
  -F "files=@large_test.pdf"
```

Expected: Should upload successfully (may take longer)

## 🎯 Success Criteria

The claims workflow is fully functional if all the following are true:

✅ Claims can be filed with document uploads  
✅ Documents are stored in S3 with presigned URLs  
✅ Claim submission emails are sent automatically  
✅ Claims can be retrieved and tracked  
✅ Claim status can be updated  
✅ Status update emails are sent on status changes  
✅ Document URLs can be refreshed  
✅ All validation rules are enforced  
✅ Error handling works correctly  
✅ Celery tasks execute successfully  

## 📝 Test Report Template

```
# Claim Workflow Test Report
Date: [Date]
Tester: [Name]
Environment: [Development/Staging/Production]

## Test Results

### Claim Filing
- [ ] PASS / [ ] FAIL - File claim with single document
- [ ] PASS / [ ] FAIL - File claim with multiple documents
- [ ] PASS / [ ] FAIL - Submission email sent
- [ ] PASS / [ ] FAIL - S3 upload successful

### Claim Tracking
- [ ] PASS / [ ] FAIL - Retrieve all claims
- [ ] PASS / [ ] FAIL - Retrieve specific claim
- [ ] PASS / [ ] FAIL - Claim details accurate

### Status Updates
- [ ] PASS / [ ] FAIL - Update to under_review
- [ ] PASS / [ ] FAIL - Update to approved
- [ ] PASS / [ ] FAIL - Update to completed
- [ ] PASS / [ ] FAIL - Status update emails sent

### Document Management
- [ ] PASS / [ ] FAIL - Access document URL
- [ ] PASS / [ ] FAIL - Refresh expired URL

### Validation
- [ ] PASS / [ ] FAIL - File size limit enforced
- [ ] PASS / [ ] FAIL - File type validation
- [ ] PASS / [ ] FAIL - Required documents check
- [ ] PASS / [ ] FAIL - Inactive policy check

## Issues Found
1. [Issue description]
   - Steps to reproduce
   - Expected vs Actual behavior
   - Severity: [Low/Medium/High/Critical]

## Recommendations
[Any recommendations for improvements]
```
