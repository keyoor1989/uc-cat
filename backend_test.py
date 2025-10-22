import requests
import sys
import json
from datetime import datetime

class CatalogueAPITester:
    def __init__(self, base_url="https://product-portfolio-10.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data storage
        self.created_category_id = None
        self.created_product_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login functionality"""
        print("\n" + "="*50)
        print("TESTING ADMIN AUTHENTICATION")
        print("="*50)
        
        # Test valid login
        success, response = self.run_test(
            "Admin Login (Valid Credentials)",
            "POST",
            "admin/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
        else:
            print("   ❌ Failed to get token from login response")
            return False

        # Test invalid login
        self.run_test(
            "Admin Login (Invalid Credentials)",
            "POST", 
            "admin/login",
            401,
            data={"username": "wrong", "password": "wrong"}
        )

        # Test token verification
        if self.token:
            self.run_test(
                "Admin Token Verification",
                "GET",
                "admin/verify",
                200,
                auth_required=True
            )

        return True

    def test_categories_crud(self):
        """Test category CRUD operations"""
        print("\n" + "="*50)
        print("TESTING CATEGORIES CRUD")
        print("="*50)

        if not self.token:
            print("❌ No auth token available, skipping category tests")
            return False

        # Test get categories (empty initially)
        self.run_test(
            "Get Categories (Initial)",
            "GET",
            "categories",
            200
        )

        # Test create category
        category_data = {
            "name": "Test Category",
            "description": "A test category for testing"
        }
        
        success, response = self.run_test(
            "Create Category",
            "POST",
            "categories",
            200,
            data=category_data,
            auth_required=True
        )
        
        if success and 'id' in response:
            self.created_category_id = response['id']
            print(f"   Created category ID: {self.created_category_id}")

        # Test get categories (should have one now)
        self.run_test(
            "Get Categories (After Creation)",
            "GET",
            "categories",
            200
        )

        # Test get specific category
        if self.created_category_id:
            self.run_test(
                "Get Specific Category",
                "GET",
                f"categories/{self.created_category_id}",
                200
            )

        # Test update category
        if self.created_category_id:
            update_data = {
                "name": "Updated Test Category",
                "description": "Updated description"
            }
            self.run_test(
                "Update Category",
                "PUT",
                f"categories/{self.created_category_id}",
                200,
                data=update_data,
                auth_required=True
            )

        return True

    def test_products_crud(self):
        """Test product CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PRODUCTS CRUD")
        print("="*50)

        if not self.token or not self.created_category_id:
            print("❌ No auth token or category ID available, skipping product tests")
            return False

        # Test get products (empty initially)
        self.run_test(
            "Get Products (Initial)",
            "GET",
            "products",
            200
        )

        # Test create product
        product_data = {
            "name": "Test Product",
            "description": "A test product for testing",
            "price": 99.99,
            "category_id": self.created_category_id,
            "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="],
            "youtube_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=product_data,
            auth_required=True
        )
        
        if success and 'id' in response:
            self.created_product_id = response['id']
            print(f"   Created product ID: {self.created_product_id}")

        # Test get products (should have one now)
        self.run_test(
            "Get Products (After Creation)",
            "GET",
            "products",
            200
        )

        # Test get products by category
        if self.created_category_id:
            self.run_test(
                "Get Products by Category",
                "GET",
                f"products?category_id={self.created_category_id}",
                200
            )

        # Test get specific product
        if self.created_product_id:
            self.run_test(
                "Get Specific Product",
                "GET",
                f"products/{self.created_product_id}",
                200
            )

        # Test update product
        if self.created_product_id:
            update_data = {
                "name": "Updated Test Product",
                "description": "Updated description",
                "price": 149.99,
                "category_id": self.created_category_id,
                "images": [],
                "youtube_link": ""
            }
            self.run_test(
                "Update Product",
                "PUT",
                f"products/{self.created_product_id}",
                200,
                data=update_data,
                auth_required=True
            )

        return True

    def test_settings(self):
        """Test settings functionality"""
        print("\n" + "="*50)
        print("TESTING SETTINGS")
        print("="*50)

        if not self.token:
            print("❌ No auth token available, skipping settings tests")
            return False

        # Test get settings
        self.run_test(
            "Get Settings",
            "GET",
            "settings",
            200
        )

        # Test update settings
        settings_data = {
            "whatsapp_number": "919876543210",
            "company_logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
        
        self.run_test(
            "Update Settings",
            "PUT",
            "settings",
            200,
            data=settings_data,
            auth_required=True
        )

        return True

    def test_pdf_generation(self):
        """Test PDF generation"""
        print("\n" + "="*50)
        print("TESTING PDF GENERATION")
        print("="*50)

        if not self.created_product_id:
            print("❌ No product ID available, skipping PDF generation test")
            return False

        # Test PDF generation
        pdf_data = {
            "product_ids": [self.created_product_id]
        }
        
        success, response = self.run_test(
            "Generate PDF",
            "POST",
            "generate-pdf",
            200,
            data=pdf_data
        )

        return success

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n" + "="*50)
        print("CLEANING UP TEST DATA")
        print("="*50)

        if not self.token:
            return

        # Delete test product
        if self.created_product_id:
            self.run_test(
                "Delete Test Product",
                "DELETE",
                f"products/{self.created_product_id}",
                200,
                auth_required=True
            )

        # Delete test category
        if self.created_category_id:
            self.run_test(
                "Delete Test Category",
                "DELETE",
                f"categories/{self.created_category_id}",
                200,
                auth_required=True
            )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['details']}")

def main():
    print("🚀 Starting Catalogue API Testing...")
    print(f"Testing against: https://product-portfolio-10.preview.emergentagent.com/api")
    
    tester = CatalogueAPITester()
    
    try:
        # Run all tests
        tester.test_admin_login()
        tester.test_categories_crud()
        tester.test_products_crud()
        tester.test_settings()
        tester.test_pdf_generation()
        
        # Cleanup
        tester.cleanup_test_data()
        
        # Print summary
        tester.print_summary()
        
        # Return appropriate exit code
        if tester.tests_passed == tester.tests_run:
            print("\n🎉 All tests passed!")
            return 0
        else:
            print(f"\n⚠️  {tester.tests_run - tester.tests_passed} tests failed")
            return 1
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Testing interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n❌ Unexpected error during testing: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())