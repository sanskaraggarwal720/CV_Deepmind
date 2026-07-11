import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TemplateId } from '../types';

interface TemplateChipProps {
  label: string;
  value: TemplateId;
  selected: boolean;
  onPress: (value: TemplateId) => void;
}

export default function TemplateChip({ label, value, selected, onPress }: TemplateChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#7C5CFF',
  },
  chipUnselected: {
    backgroundColor: '#17171D',
    borderWidth: 1,
    borderColor: '#3D3D50',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  labelUnselected: {
    color: '#8A8A94',
  },
});
