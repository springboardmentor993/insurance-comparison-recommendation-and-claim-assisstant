# Backend Changes & Frontend Updates Summary

## Backend Changes Detected

### 1. **User Model (models.py)** - New Fields Added
Three new fields added to the User model:
- `income` (Integer) - User's yearly income
- `budget` (Integer) - User's preferred maximum premium budget
- `preferred_policy_type` (String) - User's preferred policy type (health, life, auto, home)

### 2. **Schemas (schemas.py)** - New Schemas & Updated Models
- **UserCreate**: Now includes optional fields: `income`, `budget`, `preferred_policy_type`
- **UserPreferencesUpdate**: New schema for updating user preferences
- **RecommendationRequest**: `policy_type` and `budget` are now optional (uses user preferences if not provided)

### 3. **Profile Routes (routes/profile.py)** - New Endpoint
- **New Endpoint**: `PATCH /profile/preferences` - Update user's insurance preferences
- Updates income, budget, and preferred_policy_type

### 4. **Recommendations Engine (routes/recommendations.py)** - Enhanced Logic
- Now uses user's saved `budget` if not provided in request
- Now uses user's saved `preferred_policy_type` if not provided in request
- Added income-based scoring in recommendation algorithm
- Enhanced scoring components include income matching and preference matching

---

## Frontend Updates Applied

### 1. **Register Page (Register.jsx)** ✅
**What Changed:**
- Added optional preference fields during registration:
  - Annual Income (₹)
  - Maximum Premium Budget (₹)
  - Preferred Policy Type dropdown

**Benefits:**
- Users can set their preferences right at registration
- Better onboarding experience
- Immediate personalized recommendations

### 2. **Profile Page (Profile.jsx)** ✅
**What Changed:**
- Added new "Insurance Preferences" section
- New form to update:
  - Annual Income
  - Maximum Premium Budget
  - Preferred Policy Type
- Separate update buttons for Risk Profile and Preferences

**Benefits:**
- Users can update preferences anytime
- Better organization of profile information
- Clear separation between risk profile and insurance preferences

### 3. **Recommendations Page (Recommendations.jsx)** ✅
**What Changed:**
- Policy Type field is now **optional** (uses saved preference)
- Budget field is now **optional** (uses saved budget)
- Added info banner explaining smart defaults
- Better UX with "Use my preference" and "Use my saved budget" placeholders

**Benefits:**
- One-click recommendations using saved preferences
- Still allows override for custom searches
- Smarter, more personalized experience

### 4. **API Service (api.js)** ✅
**What Changed:**
- Added new endpoint: `profileAPI.updatePreferences()`
- Maps to `PATCH /profile/preferences`

**Benefits:**
- Clean API integration
- Proper error handling
- Consistent with existing API patterns

---

## User Flow Updates

### **Old Flow:**
1. Register → Basic info only
2. Create Risk Profile → Set dependents and risk level
3. Generate Recommendations → Must specify type and budget every time

### **New Flow (Enhanced):**
1. **Register** → Basic info + Optional preferences (income, budget, preferred type)
2. **Create Risk Profile** → Set dependents and risk level
3. **Set Preferences** (anytime) → Update income, budget, preferred policy type in Profile page
4. **Generate Recommendations** → 
   - **Option A**: Click "Generate" without any input → Uses all saved preferences
   - **Option B**: Override specific fields for custom search

---

## API Changes Summary

### Updated Endpoints:

| Endpoint | Method | Changes | Frontend Impact |
|----------|--------|---------|----------------|
| `/auth/register` | POST | Accepts `income`, `budget`, `preferred_policy_type` | Register form updated |
| `/profile/preferences` | PATCH | **NEW** - Updates user preferences | New form in Profile page |
| `/recommendations/generate` | POST | `policy_type` and `budget` now optional | Recommendations form simplified |

---

## Testing Checklist

### ✅ Registration Flow
- [ ] Register with basic info only (preferences empty) → Should work
- [ ] Register with all preferences filled → Should save to database
- [ ] Verify preferences are optional, not required

### ✅ Profile Page
- [ ] View existing risk profile → Should display correctly
- [ ] Update risk profile → Should save successfully
- [ ] Open preferences form → Should show income, budget, policy type fields
- [ ] Update preferences → Should call PATCH endpoint
- [ ] Verify success message after update

### ✅ Recommendations
- [ ] Generate without selecting type/budget → Should use saved preferences
- [ ] Generate with custom type → Should override saved preference
- [ ] Generate with custom budget → Should override saved budget
- [ ] Verify error message if no preferences set and no input provided

---

## Database Schema Changes

Your backend should have already updated the database schema. Verify with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('income', 'budget', 'preferred_policy_type');
```

Expected result:
```
   column_name        | data_type
----------------------+-----------
 income               | integer
 budget               | integer
 preferred_policy_type| character varying
```

---

## Key Benefits

### For Users:
1. **Faster Recommendations**: Don't need to enter type/budget every time
2. **Personalized Experience**: System remembers preferences
3. **Better Matches**: Income-based scoring provides more suitable options
4. **Flexibility**: Can still override preferences for specific searches

### For System:
1. **Better Data**: Collect user income and budget preferences
2. **Smarter Algorithm**: More scoring factors for recommendations
3. **User Retention**: Personalized experience keeps users engaged

---

## Migration Notes

If you have existing users in your database:
- The new fields (`income`, `budget`, `preferred_policy_type`) will be NULL for existing users
- This is fine - the system handles NULL values
- Users can update their preferences anytime via the Profile page
- Recommendations will work with or without preferences (just less personalized without them)

---

**Last Updated**: 2026-01-19  
**Frontend Version**: Updated to match backend v2  
**Status**: ✅ All changes applied and ready for testing
