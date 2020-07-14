package com.getcapacitor.community.auth0;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

import androidx.browser.customtabs.CustomTabsIntent;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class Auth0 extends Plugin {

    private static final int CANCEL_EVENT_DELAY = 100;
    private final int CHROME_CUSTOM_TAB_REQUEST_CODE = 100;

    private Context applicationContext;
    private boolean mCustomTabsOpened = false; // TODO: Improve

    @Override
    public void load() {
        super.load();

        if (applicationContext == null) {
            this.applicationContext = this.bridge.getContext();
        }
    }

    @Override
    protected void handleOnResume() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                PluginCall call = getSavedCall();
                Intent intent = getBridge().getActivity().getIntent();
                String action = intent.getAction();

                if (call != null && mCustomTabsOpened && (action != null && !action.equals("android.intent.action.VIEW"))) {
                    final JSObject error = new JSObject();
                    error.put("error", "a0.session.user_cancelled");
                    error.put("error_description", "User cancelled the Auth");
                    call.success(error);
                    freeSavedCall();
                }
            }
        }, CANCEL_EVENT_DELAY);
    }

    @PluginMethod()
    public void getConstants(PluginCall call) {
        JSObject object = new JSObject();
        object.put("bundleIdentifier", applicationContext.getApplicationInfo().packageName);
        call.success(object);
    }

    @PluginMethod()
    public void showUrl(PluginCall call) {
        if (!call.hasOption("url")) {
            call.error("url property is missing");
            return;
        }

        final Activity activity = this.bridge.getActivity();
        String url = call.getString("url");

        saveCall(call);
        if (activity != null) {
            mCustomTabsOpened = true;
            CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
            CustomTabsIntent customTabsIntent = builder.build();
            customTabsIntent.launchUrl(activity, Uri.parse(url));
        } else {
            mCustomTabsOpened = true;
            final Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setData(Uri.parse(url));
            this.applicationContext.startActivity(intent);
        }
    }

    @PluginMethod()
    public void oauthParameters(PluginCall call) {
        final String verifier = Utils.generateRandomValue();
        final JSObject parameters = new JSObject();
        parameters.put("verifier", verifier);
        parameters.put("code_challenge", Utils.generateCodeChallenge(verifier));
        parameters.put("code_challenge_method", "S256");
        parameters.put("state", Utils.generateRandomValue());
        call.success(parameters);
    }
}
