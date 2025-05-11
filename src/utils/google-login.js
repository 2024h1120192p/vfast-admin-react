import { apiRequest, setAuthToken } from './api-client';

// Function to handle Google Sign-In response
function handleCredentialResponse(response) {
    // Execute reCAPTCHA v3; action name can be 'login'
    grecaptcha.ready(function() {
        grecaptcha.execute(
            '6Le-7tUqAAAAAPCCz_3w1K_MoMkrzxajcDZ_GTA9', 
            {action: 'login'}
        )
        .then(function(recaptchaToken) {
            console.log(recaptchaToken);
            apiRequest('/user/gauth', {
                method: 'POST',
                body: { 
                    token: response.credential,
                    recaptchaToken: recaptchaToken
                },
            }, false)
            .then(response => {
                setAuthToken(response.data.access_token);
                // No reset is needed for reCAPTCHA v3
                window.location.reload();
            })
            .catch(error => {
                console.error('Google Sign-In error:', error);
                alert('Google Sign-In failed: ' + error.message);
            });
        });
    });
}

// Expose handler to global for Google callback
let temp = typeof window !== 'undefined' ? window : this;
temp.handleCredentialResponse = handleCredentialResponse;

export default handleCredentialResponse;
