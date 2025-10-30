import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ReviewButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'again' | 'hard' | 'good' | 'easy';
  disabled?: boolean;
}

export function ReviewButton({ label, onPress, variant = 'good', disabled }: ReviewButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  again: {
    backgroundColor: '#FF3B30',
  },
  hard: {
    backgroundColor: '#FF9500',
  },
  good: {
    backgroundColor: '#34C759',
  },
  easy: {
    backgroundColor: '#007AFF',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
