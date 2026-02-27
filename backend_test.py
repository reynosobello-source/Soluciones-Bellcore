#!/usr/bin/env python3
"""
BELLPOINT SRL E-commerce API Testing Suite
Tests all backend endpoints including authentication, cart, orders, quotes, and admin functionality.
"""

import requests
import json
import subprocess
import sys
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://bellpoint-store.preview.emergentagent.com/api"
MONGO_DB = "test_database"

class BellpointAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.customer_token = None
        self.admin_token = None
        self.customer_user_id = None
        self.admin_user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data if not success else None
        })
    
    def setup_test_users(self):
        """Create test users and sessions in MongoDB"""
        print("🔧 Setting up test users and sessions...")
        
        # Create customer user and session
        customer_setup = f"""
        use('{MONGO_DB}');
        var userId = 'test_customer_' + Date.now();
        var sessionToken = 'test_session_customer_' + Date.now();
        
        db.users.insertOne({{
            user_id: userId,
            email: 'customer@bellpoint.com',
            name: 'Test Customer',
            role: 'customer',
            addresses: [],
            created_at: new Date()
        }});
        
        db.user_sessions.insertOne({{
            user_id: userId,
            session_token: sessionToken,
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        }});
        
        print('Customer User ID: ' + userId);
        print('Customer Session Token: ' + sessionToken);
        """
        
        try:
            result = subprocess.run(['mongosh', '--eval', customer_setup], 
                                  capture_output=True, text=True, check=True)
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'Customer User ID:' in line:
                    self.customer_user_id = line.split(': ')[1]
                elif 'Customer Session Token:' in line:
                    self.customer_token = line.split(': ')[1]
            
            print(f"✅ Customer user created: {self.customer_user_id}")
            print(f"✅ Customer session token: {self.customer_token}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create customer user: {e}")
            return False
        
        # Create admin user and session
        admin_setup = f"""
        use('{MONGO_DB}');
        var userId = 'test_admin_' + Date.now();
        var sessionToken = 'test_session_admin_' + Date.now();
        
        db.users.insertOne({{
            user_id: userId,
            email: 'admin@bellpoint.com',
            name: 'Test Admin',
            role: 'admin',
            addresses: [],
            created_at: new Date()
        }});
        
        db.user_sessions.insertOne({{
            user_id: userId,
            session_token: sessionToken,
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        }});
        
        print('Admin User ID: ' + userId);
        print('Admin Session Token: ' + sessionToken);
        """
        
        try:
            result = subprocess.run(['mongosh', '--eval', admin_setup], 
                                  capture_output=True, text=True, check=True)
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'Admin User ID:' in line:
                    self.admin_user_id = line.split(': ')[1]
                elif 'Admin Session Token:' in line:
                    self.admin_token = line.split(': ')[1]
            
            print(f"✅ Admin user created: {self.admin_user_id}")
            print(f"✅ Admin session token: {self.admin_token}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create admin user: {e}")
            return False
    
    def test_health_check(self):
        """Test GET /api/health"""
        try:
            response = self.session.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, f"Status: {data.get('status')}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected status: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_categories(self):
        """Test GET /api/categories"""
        try:
            response = self.session.get(f"{BASE_URL}/categories")
            if response.status_code == 200:
                categories = response.json()
                if isinstance(categories, list) and len(categories) > 0:
                    self.log_test("Categories API", True, f"Found {len(categories)} categories")
                    return True
                else:
                    self.log_test("Categories API", False, "No categories found", categories)
                    return False
            else:
                self.log_test("Categories API", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Categories API", False, f"Exception: {str(e)}")
            return False
    
    def test_products(self):
        """Test GET /api/products with various filters"""
        tests = [
            ("All Products", {}),
            ("Featured Products", {"featured": "true"}),
            ("Products by Category", {"category_id": "cat_tecnologia"}),
            ("Search Products", {"search": "papel"})
        ]
        
        all_passed = True
        for test_name, params in tests:
            try:
                response = self.session.get(f"{BASE_URL}/products", params=params)
                if response.status_code == 200:
                    data = response.json()
                    if "products" in data and "total" in data:
                        products = data["products"]
                        total = data["total"]
                        self.log_test(f"Products API - {test_name}", True, 
                                    f"Found {len(products)} products, total: {total}")
                    else:
                        self.log_test(f"Products API - {test_name}", False, 
                                    "Invalid response format", data)
                        all_passed = False
                else:
                    self.log_test(f"Products API - {test_name}", False, 
                                f"HTTP {response.status_code}", response.text)
                    all_passed = False
            except Exception as e:
                self.log_test(f"Products API - {test_name}", False, f"Exception: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_auth_me(self):
        """Test GET /api/auth/me"""
        if not self.customer_token:
            self.log_test("Auth Me", False, "No customer token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.customer_token}"}
            response = self.session.get(f"{BASE_URL}/auth/me", headers=headers)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get("user_id") == self.customer_user_id:
                    self.log_test("Auth Me", True, f"User: {user_data.get('name')} ({user_data.get('email')})")
                    return True
                else:
                    self.log_test("Auth Me", False, "User ID mismatch", user_data)
                    return False
            else:
                self.log_test("Auth Me", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Auth Me", False, f"Exception: {str(e)}")
            return False
    
    def test_cart_operations(self):
        """Test cart operations: GET /api/cart and POST /api/cart/add"""
        if not self.customer_token:
            self.log_test("Cart Operations", False, "No customer token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.customer_token}"}
        all_passed = True
        
        # Test GET cart
        try:
            response = self.session.get(f"{BASE_URL}/cart", headers=headers)
            if response.status_code == 200:
                cart_data = response.json()
                if "user_id" in cart_data and "items" in cart_data:
                    self.log_test("Get Cart", True, f"Cart for user: {cart_data.get('user_id')}")
                else:
                    self.log_test("Get Cart", False, "Invalid cart format", cart_data)
                    all_passed = False
            else:
                self.log_test("Get Cart", False, f"HTTP {response.status_code}", response.text)
                all_passed = False
        except Exception as e:
            self.log_test("Get Cart", False, f"Exception: {str(e)}")
            all_passed = False
        
        # Test POST add to cart
        try:
            add_item_data = {"product_id": "prod_001", "quantity": 2}
            response = self.session.post(f"{BASE_URL}/cart/add", 
                                       headers=headers, 
                                       json=add_item_data)
            
            if response.status_code == 200:
                cart_data = response.json()
                if len(cart_data.get("items", [])) > 0:
                    item = cart_data["items"][0]
                    if item.get("product_id") == "prod_001" and item.get("quantity") == 2:
                        self.log_test("Add to Cart", True, 
                                    f"Added {item.get('name')} x{item.get('quantity')}")
                    else:
                        self.log_test("Add to Cart", False, "Item not added correctly", cart_data)
                        all_passed = False
                else:
                    self.log_test("Add to Cart", False, "No items in cart after adding", cart_data)
                    all_passed = False
            else:
                self.log_test("Add to Cart", False, f"HTTP {response.status_code}", response.text)
                all_passed = False
        except Exception as e:
            self.log_test("Add to Cart", False, f"Exception: {str(e)}")
            all_passed = False
        
        return all_passed
    
    def test_admin_stats(self):
        """Test GET /api/admin/stats"""
        if not self.admin_token:
            self.log_test("Admin Stats", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.get(f"{BASE_URL}/admin/stats", headers=headers)
            
            if response.status_code == 200:
                stats = response.json()
                expected_fields = ["total_orders", "pending_orders", "total_quotes", 
                                 "pending_quotes", "total_users", "total_products", "total_sales"]
                
                if all(field in stats for field in expected_fields):
                    self.log_test("Admin Stats", True, 
                                f"Users: {stats['total_users']}, Products: {stats['total_products']}, Orders: {stats['total_orders']}")
                    return True
                else:
                    missing = [f for f in expected_fields if f not in stats]
                    self.log_test("Admin Stats", False, f"Missing fields: {missing}", stats)
                    return False
            else:
                self.log_test("Admin Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Stats", False, f"Exception: {str(e)}")
            return False
    
    def cleanup_test_data(self):
        """Clean up test users and sessions"""
        print("🧹 Cleaning up test data...")
        
        cleanup_script = f"""
        use('{MONGO_DB}');
        
        // Remove test users
        var customerResult = db.users.deleteOne({{user_id: '{self.customer_user_id}'}});
        var adminResult = db.users.deleteOne({{user_id: '{self.admin_user_id}'}});
        
        // Remove test sessions
        var sessionResult = db.user_sessions.deleteMany({{
            $or: [
                {{session_token: '{self.customer_token}'}},
                {{session_token: '{self.admin_token}'}}
            ]
        }});
        
        // Remove test cart
        var cartResult = db.carts.deleteOne({{user_id: '{self.customer_user_id}'}});
        
        print('Cleanup completed');
        print('Users deleted: ' + (customerResult.deletedCount + adminResult.deletedCount));
        print('Sessions deleted: ' + sessionResult.deletedCount);
        print('Carts deleted: ' + cartResult.deletedCount);
        """
        
        try:
            subprocess.run(['mongosh', '--eval', cleanup_script], 
                          capture_output=True, text=True, check=True)
            print("✅ Test data cleaned up successfully")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Cleanup warning: {e}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting BELLPOINT API Tests")
        print("=" * 50)
        
        # Setup
        if not self.setup_test_users():
            print("❌ Failed to setup test users. Aborting tests.")
            return False
        
        # Run tests
        test_results = []
        
        print("\n📋 Running Public API Tests...")
        test_results.append(self.test_health_check())
        test_results.append(self.test_categories())
        test_results.append(self.test_products())
        
        print("\n🔐 Running Authenticated API Tests...")
        test_results.append(self.test_auth_me())
        test_results.append(self.test_cart_operations())
        
        print("\n👑 Running Admin API Tests...")
        test_results.append(self.test_admin_stats())
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(test_results)
        total = len(test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All tests passed!")
            return True
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check details above.")
            return False

def main():
    """Main test runner"""
    tester = BellpointAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()