import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../context/ResponsiveContext';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});

/**
 * Default safe-area edges: top + sides. Omit bottom when a bottom tab bar handles the inset.
 *
 * @param {import('react-native-safe-area-context').Edge[]} [edges]
 * @param {boolean} [keyboardAvoiding] — wrap with KeyboardAvoidingView (use on form screens)
 * @param {boolean} [scroll] — wrap children in ScrollView with flexGrow content
 */
export function ResponsiveScreen({
  children,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
  keyboardAvoiding = false,
  keyboardVerticalOffset = 0,
  scroll = false,
  scrollProps = {},
  ...safeAreaProps
}) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  const inner = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView style={[styles.flex, style]} edges={edges} {...safeAreaProps}>
      {inner}
    </SafeAreaView>
  );
}

/**
 * Text with font size from useResponsive(). Prefer this for body copy on new screens.
 */
export function ScaledText({ size = 14, style, children, ...props }) {
  const { font } = useResponsive();
  return (
    <Text style={[{ fontSize: font(size) }, style]} allowFontScaling {...props}>
      {children}
    </Text>
  );
}
