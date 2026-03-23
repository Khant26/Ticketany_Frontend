# Toast Notification System Guide

## Overview
Your app now has a comprehensive notification system using **React Toastify**. It displays warnings, errors, and success messages as pop-up toasts at the top-right of the screen.

## Features Implemented

### 1. **Sign In Section**
- ✅ **Success notifications** when user signs in
- ✅ **Error notifications** for invalid credentials
- ✅ **Warning notifications** for invalid OTP format
- ✅ **Session expiration warnings** with clear messages
- ✅ **Network error notifications**
- ✅ **System error handling** with detailed error messages

### 2. **OTP Verification**
- ✅ **Success toast** when OTP is sent
- ✅ **Error toasts** for OTP sending failures
- ✅ **Success toast** when email is verified
- ✅ **Error toasts** for OTP verification failures

### 3. **Session Management**
- ✅ **Automatic session expiration notifications**
- ✅ **Token refresh failure handling**
- ✅ **Auto-logout with clear messaging**

## How to Use in Your Components

### Basic Imports
```javascript
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo,
  showSessionExpired,
  showSystemError,
  showNetworkError 
} from '../utils/toastNotification';
```

### Examples

#### Success Notification
```javascript
showSuccess('Order placed successfully!');
```

#### Error Notification
```javascript
showError('Failed to process payment. Please try again.');
```

#### Warning Notification
```javascript
showWarning('Your session will expire in 5 minutes.');
```

#### Info Notification
```javascript
showInfo('Processing your order...');
```

#### Session Expiration
```javascript
showSessionExpired(); // Shows: "Your session has expired. Please sign in again."
```

#### System Error
```javascript
showSystemError('Database connection failed');
```

#### Network Error
```javascript
showNetworkError(); // Shows: "Network error. Please check your connection and try again."
```

## Customization Options

You can customize toast behavior by passing options:

```javascript
showSuccess('Custom message', {
  autoClose: 5000,        // Close after 5 seconds
  position: "bottom-left", // Position on screen
  hideProgressBar: true,   // Hide progress bar
  closeOnClick: true,      // Allow click to close
});
```

## Available Positions
- `"top-right"` (default)
- `"top-left"`
- `"top-center"`
- `"bottom-right"`
- `"bottom-left"`
- `"bottom-center"`

## Auto-Close Times
- **Success**: 3000ms (3 seconds)
- **Error**: 4000ms (4 seconds)
- **Warning**: 3500ms (3.5 seconds)
- **Info**: 3000ms (3 seconds)
- **Session Expired**: 5000ms (5 seconds)
- **System Error**: 5000ms (5 seconds)

## Components Updates

### SignIn.jsx
- Replaced inline error display with toast notifications
- OTP verification errors show as toasts
- Success messages show as success toasts
- Form validation warnings show as warning toasts

### AuthContext.jsx
- Session expiration shows notification
- 401 errors trigger session expiration toast
- Server errors (5xx) show error notifications
- User logout triggers notification

### apiClient.js
- Token expiration automatically shows notification
- Clear messaging for authentication failures

## Where Used

1. **Sign In Form**
   - Email/password validation
   - API errors
   - Success messages

2. **OTP Verification**
   - OTP sending feedback
   - OTP verification results
   - Resend success/failure

3. **Session Management**
   - Token expiration warning when session ends
   - Auto-logout notification
   - Redirect to login with explanation

## Tips for Better UX

1. **Use appropriate types:**
   - `showError()` for failures that need immediate attention
   - `showWarning()` for cautionary messages
   - `showSuccess()` for completed actions
   - `showInfo()` for informational messages

2. **Keep messages clear:**
   ```javascript
   ✅ showError('Invalid email format');
   ❌ showError('Error');
   ```

3. **For sensitive operations, use longer autoClose:**
   ```javascript
   showWarning('This action cannot be undone', { autoClose: 6000 });
   ```

4. **Chain operations with toast feedback:**
   ```javascript
   try {
     await submitOrder();
     showSuccess('Order submitted!');
   } catch (error) {
     showError(error.message);
   }
   ```

## To Add Notifications to Other Components

1. Import the notification utilities:
```javascript
import { showSuccess, showError, showWarning } from '../utils/toastNotification';
```

2. Call them in your handlers:
```javascript
const handleOrderSubmit = async () => {
  try {
    const response = await submitOrder(orderData);
    showSuccess('Order placed successfully!');
  } catch (error) {
    showError(error.message || 'Failed to place order');
  }
};
```

## Testing Locally

The notification system is ready to test:
1. Try signing in with invalid credentials → Error toast
2. Try signing in successfully → Success toast
3. Request OTP verification → Success toast
4. Wait for session to expire → Session expired notification

Enjoy your new notification system! 🎉
