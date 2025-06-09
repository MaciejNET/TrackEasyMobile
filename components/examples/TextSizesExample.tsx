import React from 'react';
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function TextSizesExample() {
  const sizes = [
    '2xs',
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
    '6xl',
  ] as const;

  return (
    <VStack space="sm">
      {sizes.map((size, index) => (
        <Text size={size} key={index}>
          Text size: {size}
        </Text>
      ))}
    </VStack>
  );
}
