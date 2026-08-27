package com.formgym.form;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ProgressBar loadingIndicator;
    private WebViewAssetLoader assetLoader;

    private static final String APP_HOST = "appassets.androidplatform.net";
    private static final String ASSET_URL = "https://appassets.androidplatform.net/assets/index.html";
    private static final String FALLBACK_URL = "file:///android_asset/index.html";

    @Override
    @SuppressLint({"SetJavaScriptEnabled", "RequiresFeature"})
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Keep screen active during gym workouts
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = findViewById(R.id.webview);
        loadingIndicator = findViewById(R.id.loading_indicator);

        setupAssetLoader();
        setupWebView();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            loadApp();
        }
    }

    private void setupAssetLoader() {
        try {
            assetLoader = new WebViewAssetLoader.Builder()
                    .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                    .build();
        } catch (Throwable t) {
            assetLoader = null;
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // Enable JavaScript and HTML5 local storage (crucial for workout logs, PRs, and favorites)
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // File and content access
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        // Media autoplay without gesture (for workout demo animations/videos)
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Viewport and zoom
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // Caching
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Modern rendering flags
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setBackgroundColor(0xFF171816);

        webView.setWebViewClient(new FormWebViewClient());
        webView.setWebChromeClient(new FormWebChromeClient());
    }

    private void loadApp() {
        if (assetLoader != null) {
            webView.loadUrl(ASSET_URL);
        } else {
            webView.loadUrl(FALLBACK_URL);
        }
    }

    private class FormWebViewClient extends WebViewClient {

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            if (assetLoader != null) {
                WebResourceResponse response = assetLoader.shouldInterceptRequest(request.getUrl());
                if (response != null) {
                    return response;
                }
            }
            return super.shouldInterceptRequest(view, request);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleUrl(request.getUrl().toString());
        }

        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleUrl(url);
        }

        private boolean handleUrl(String url) {
            if (url == null) return false;

            // Internal assets and app URLs stay in WebView
            if (url.startsWith("file:///android_asset/") ||
                url.contains(APP_HOST) ||
                url.startsWith("about:blank") ||
                url.startsWith("data:")) {
                return false;
            }

            // External links (e.g. YouTube tutorial cues) open in external app/browser
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            if (loadingIndicator != null) {
                loadingIndicator.setVisibility(View.VISIBLE);
            }
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            if (loadingIndicator != null) {
                loadingIndicator.setVisibility(View.GONE);
            }
        }

        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            // If asset loader fails for any reason, fallback to file:///android_asset/
            if (failingUrl != null && failingUrl.contains(APP_HOST)) {
                view.loadUrl(FALLBACK_URL);
            }
        }
    }

    private class FormWebChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            if (loadingIndicator != null) {
                loadingIndicator.setProgress(newProgress);
                if (newProgress >= 100) {
                    loadingIndicator.setVisibility(View.GONE);
                }
            }
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            return super.onConsoleMessage(consoleMessage);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
