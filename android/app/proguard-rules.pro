# Razorpay
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**
-keep class * implements com.razorpay.PaymentResultListener { *; }

# Keep annotations
-keepattributes *Annotation*

# Prevent obfuscation issues for payments
-keepclassmembers class * {
    @com.razorpay.** *;
}

# OkHttp / Okio
-dontwarn okhttp3.**
-dontwarn okio.**

# React Native
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Gson
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**