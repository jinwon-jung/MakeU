/*
    Author:     Marek Mihalech
    Year:       2016
    
    Description:
    Basic functionalities for setiing up oAuth connection for Google APIs
*/


//Configuration
//Replace these values with your google app credentials
var CLIENT_SECRET = "7GfyvqWdY6BMgvluzLmtBlfL";
var CLIENT_ID = "208640292902-ihrbkar0bk4ijmce4fqb1bu8hehi53u9.apps.googleusercontent.com";
var CLIENT_REDIRECT = "http://localhost:63342";
//End-Configuration


var OAUTHURL = 'https://accounts.google.com/o/oauth2/auth';
var SCOPES_FITNESS = 'https://www.googleapis.com/auth/fitness.activity.read+https://www.googleapis.com/auth/fitness.body.read+https://www.googleapis.com/auth/fitness.location.read';
    
var COOKIE_GOOGLE_AUTH_CODE = "google_auth_code";
var COOKIE_ACCESS_TOKEN = "google_access_token";
var COOKIE_REFRESH_TOKEN = "google_refresh_token";


/*
    Initial request for Google authentication code
    Opens google auth window
    returns Google Auth token
*/
function requestGoogleoAuthCode() {    
    var deffer = new $.Deferred();
    var popupurl = OAUTHURL + '?scope=' + SCOPES_FITNESS + '&client_id=' + CLIENT_ID + '&redirect_uri=' + CLIENT_REDIRECT + '&response_type=code&approval_prompt=force&access_type=offline';
    var win = window.open(popupurl, "googleauthwindow", 'width=800, height=600');
    var pollTimer = window.setInterval(function () {
        try {
            if (win.document.URL.indexOf(CLIENT_REDIRECT) != -1) {
                window.clearInterval(pollTimer);
                var response_url = win.document.URL;
                var CODE = response_url.substr(response_url.indexOf("code=") + 5, response_url.length - (response_url.indexOf("code=") + 5) - 1);
                console.log("Got Google Auth Code");
                deffer.resolve(CODE);
                win.close();
            }
        } catch (e) { }
    }, 500);    
    return deffer.promise();
}


/*
    Uses Google Auth code to get Access Token and Refresh Token
    returns object with access token, refresh token and access token expiration
*/
function getAccessToken(google_auth_code) {
    var retVal = null;
    jQuery.ajax({
        url: "https://www.googleapis.com/oauth2/v3/token?code=" + google_auth_code + "&redirect_uri=" + CLIENT_REDIRECT + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&scope=&grant_type=authorization_code",
        type: "post",
        success: function (result) {
            console.log("Got Access Token And Refresh Token");
            retVal = result;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error during getAccessToken");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            retVal = null;
        },
        async: false
    });
    return retVal;
}


/*
    Uses Refresh token to obtain new access token
    returns new access token with expiration
*/
function refreshAccessToken(refresh_token) {
    var retVal = null;
    jQuery.ajax({
        url: "https://www.googleapis.com/oauth2/v3/token?client_secret=" + CLIENT_SECRET + "&grant_type=refresh_token&refresh_token=" + refresh_token + "&client_id=" + CLIENT_ID,
        type: "post",
        success: function (result) {
            console.log("Refreshed Access Token");
            retVal = result;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error during refreshAccessToken");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            retVal = null;
        },
        async: false
    });
    return retVal;
}
