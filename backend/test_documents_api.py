"""
Test Script for PostgreSQL-Based Claim Documents Storage

This script tests the new document storage endpoints.
Requires a running backend server on http://localhost:8000

Usage:
  python test_documents_api.py <user_token> <admin_token>

Or with hardcoded tokens (uncomment below):
  python test_documents_api.py
"""

import requests
import json
import sys
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"

# Test tokens (replace with actual tokens)
USER_TOKEN = None
ADMIN_TOKEN = None

# Sample files for testing
TEST_FILES = {
    "test.pdf": b"%PDF-1.4\n%Sample PDF content for testing",
    "test.jpg": b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 50,  # JPEG header
    "test.png": b"\x89PNG\r\n\x1a\n" + b"\x00" * 50,  # PNG header
}

def print_header(title):
    """Print section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def print_step(step_num, description):
    """Print step description"""
    print(f"\n[Step {step_num}] {description}")
    print("-" * 70)

def print_result(success, message):
    """Print result with status"""
    status = "✓ SUCCESS" if success else "✗ FAILED"
    print(f"{status}: {message}")

def get_tokens():
    """Get tokens from command line or use hardcoded values"""
    global USER_TOKEN, ADMIN_TOKEN
    
    if len(sys.argv) >= 3:
        USER_TOKEN = sys.argv[1]
        ADMIN_TOKEN = sys.argv[2]
    else:
        print("\n⚠️  WARNING: Using test/placeholder tokens")
        print("   For real testing, provide actual tokens:")
        print("   python test_documents_api.py <user_token> <admin_token>\n")
        
        # Placeholder tokens - replace with real ones
        USER_TOKEN = "test_user_token"
        ADMIN_TOKEN = "test_admin_token"

def test_health():
    """Test 1: Health check"""
    print_step(1, "Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        success = response.status_code == 200
        print_result(success, f"Health endpoint: {response.json()}")
        return success
    except Exception as e:
        print_result(False, f"Failed to connect: {e}")
        return False

def test_create_test_files():
    """Create test files for upload"""
    print_step(2, "Create Test Files")
    
    test_dir = Path("/tmp/test_documents")
    test_dir.mkdir(exist_ok=True)
    
    created_files = {}
    for filename, content in TEST_FILES.items():
        filepath = test_dir / filename
        filepath.write_bytes(content)
        created_files[filename] = str(filepath)
        print(f"  ✓ Created: {filename}")
    
    return created_files

def test_upload_document(claim_id, file_path, doc_type, token):
    """Test 3: Upload document"""
    print_step(3, f"Upload Document ({Path(file_path).name})")
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            params = {
                'claim_id': claim_id,
                'token': token,
                'doc_type': doc_type
            }
            
            response = requests.post(
                f"{BASE_URL}/claims/{claim_id}/documents",
                files=files,
                params=params
            )
        
        if response.status_code in [200, 201]:
            data = response.json()
            print_result(True, f"Document uploaded: ID={data.get('id')}")
            print(f"  Response: {json.dumps(data, indent=2)}")
            return data.get('id')
        else:
            print_result(False, f"Status {response.status_code}")
            print(f"  Response: {response.text}")
            return None
            
    except Exception as e:
        print_result(False, f"Upload failed: {e}")
        return None

def test_list_documents(admin_token):
    """Test 4: List all documents (admin)"""
    print_step(4, "List All Documents (Admin)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/claim-documents",
            params={'token': admin_token}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Retrieved {data.get('total', 0)} documents")
            print(f"  Response: {json.dumps(data, indent=2)}")
            return data.get('documents', [])
        else:
            print_result(False, f"Status {response.status_code}")
            print(f"  Response: {response.text}")
            return None
            
    except Exception as e:
        print_result(False, f"List failed: {e}")
        return None

def test_download_document(doc_id, admin_token):
    """Test 5: Download document (admin)"""
    print_step(5, f"Download Document (ID={doc_id})")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/claim-documents/{doc_id}",
            params={'token': admin_token}
        )
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', 'unknown')
            size = len(response.content)
            print_result(True, f"Downloaded {size} bytes ({content_type})")
            
            # Save downloaded file
            output_path = f"/tmp/test_documents/downloaded_{doc_id}"
            with open(output_path, 'wb') as f:
                f.write(response.content)
            print(f"  Saved to: {output_path}")
            return True
        else:
            print_result(False, f"Status {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Download failed: {e}")
        return False

def test_error_handling():
    """Test 6: Error handling"""
    print_step(6, "Error Handling")
    
    tests_passed = 0
    tests_total = 0
    
    # Test 6a: Invalid token
    tests_total += 1
    print("\n  6a. Invalid token access:")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/claim-documents",
            params={'token': 'invalid_token_12345'}
        )
        if response.status_code in [401, 403]:
            print("     ✓ Correctly rejected invalid token")
            tests_passed += 1
        else:
            print(f"     ✗ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"     ✗ Error: {e}")
    
    # Test 6b: Non-existent document
    tests_total += 1
    print("\n  6b. Non-existent document:")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/claim-documents/99999",
            params={'token': ADMIN_TOKEN}
        )
        if response.status_code == 404:
            print("     ✓ Correctly returned 404 for missing document")
            tests_passed += 1
        else:
            print(f"     ✗ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"     ✗ Error: {e}")
    
    print(f"\nError handling: {tests_passed}/{tests_total} tests passed")
    return tests_passed == tests_total

def main():
    """Run all tests"""
    print_header("Claim Documents API Test Suite")
    
    get_tokens()
    
    print("""
Configuration:
  Base URL: """ + BASE_URL + """
  User Token: """ + (USER_TOKEN[:20] + "..." if USER_TOKEN else "NOT SET") + """
  Admin Token: """ + (ADMIN_TOKEN[:20] + "..." if ADMIN_TOKEN else "NOT SET") + """
""")
    
    results = {
        "Health Check": test_health(),
    }
    
    if not results["Health Check"]:
        print("\n❌ Backend is not running!")
        print("   Start the backend with:")
        print("   cd c:\\newproject")
        print("   .venv\\Scripts\\python -m uvicorn backend.main:app --reload")
        return
    
    # Continue with other tests
    test_files = test_create_test_files()
    
    # Test upload
    doc_id = test_upload_document(
        claim_id=1,
        file_path=test_files['test.pdf'],
        doc_type='invoice',
        token=USER_TOKEN
    )
    results["Upload Document"] = doc_id is not None
    
    if doc_id:
        # Test list
        documents = test_list_documents(ADMIN_TOKEN)
        results["List Documents"] = documents is not None
        
        # Test download
        if documents:
            results["Download Document"] = test_download_document(
                doc_id=documents[0]['id'],
                admin_token=ADMIN_TOKEN
            )
    
    # Test error handling
    results["Error Handling"] = test_error_handling()
    
    # Summary
    print_header("Test Summary")
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed\n")
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status}: {test_name}")
    
    if passed_tests == total_tests:
        print("\n✅ All tests passed! Implementation is working correctly.")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Check output above.")

if __name__ == "__main__":
    main()
