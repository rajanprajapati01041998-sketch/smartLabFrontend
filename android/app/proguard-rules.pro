# Razorpay (MANDATORY)
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# Keep annotations
-keepattributes *Annotation*

# Prevent obfuscation issues for payments
-keepclassmembers class * {
    @com.razorpay.** *;
}

# Keep okhttp (used internally sometimes)
-dontwarn okhttp3.**
-dontwarn okio.**

# React Native (safe rules)
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Gson (if used anywhere)
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**