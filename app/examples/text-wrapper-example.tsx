import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';

export default function TextWrapperExampleScreen() {
  return (
    <ScrollView>
      <Box className="p-4">
        <Heading className="mb-4"><Text>Text Wrapper Examples</Text></Heading>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Incorrect Usage (Causes Error)</Text></Heading>
          {/* 
            The following would cause an error in React Native:
            <Heading className="text-lg font-bold">Ticket Details</Heading>
            Some text here ❌
          */}
          <Text className="text-red-500">
            The code above would cause an error because the text "Some text here" is not wrapped in a Text component.
          </Text>
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Correct Usage</Text></Heading>
          <Heading className="text-lg font-bold"><Text>Ticket Details</Text></Heading>
          <Text>Some text here ✅</Text>
          <Text className="text-green-500">
            The code above is correct because the text "Some text here" is properly wrapped in a Text component.
          </Text>
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Why This Happens</Text></Heading>
          <Text className="mb-2">
            In React Native, unlike in web development, all text must be wrapped in a Text component.
            This is because React Native uses native components for rendering, and text needs to be
            rendered using the appropriate native text component.
          </Text>
          <Text className="mb-2">
            Common patterns that can cause this error:
          </Text>
          <Text className="mb-1">1. Bare text after a component</Text>
          <Text className="mb-1">2. Conditional rendering with && that might render text directly</Text>
          <Text className="mb-1">3. Template literals that might render as text</Text>
          <Text className="mb-1">4. Comments accidentally not in {'{/* */}'}</Text>
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Conditional Rendering</Text></Heading>
          <Text className="mb-2">Incorrect:</Text>
          <Text className="text-red-500 mb-2">
            {'{someString && <Text>{someString}</Text>}'}
          </Text>
          <Text className="mb-2">
            If someString is '', 0, or another falsy non-boolean, React Native tries to render that string/number directly, which causes the error.
          </Text>

          <Text className="mb-2">Correct:</Text>
          <Text className="text-green-500 mb-2">
            {'{someString ? <Text>{someString}</Text> : null}'}
          </Text>
          <Text>
            Always use the ternary operator (? :) for conditional rendering in React Native to avoid this error.
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
}
