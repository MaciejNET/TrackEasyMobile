import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';
import TextSizesExample from '@/components/examples/TextSizesExample';

export default function TextExampleScreen() {
  return (
    <ScrollView>
      <Box className="p-4">
        <Heading className="mb-4"><Text>Text Component Examples</Text></Heading>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Basic Usage</Text></Heading>
          <Text>This is a basic text component.</Text>
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Text Sizes</Text></Heading>
          <TextSizesExample />
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Text Styles</Text></Heading>
          <Text bold className="mb-1">Bold Text</Text>
          <Text italic className="mb-1">Italic Text</Text>
          <Text underline className="mb-1">Underlined Text</Text>
          <Text strikeThrough className="mb-1">Strikethrough Text</Text>
          <Text highlight className="mb-1">Highlighted Text</Text>
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Truncated Text</Text></Heading>
          <Text isTruncated className="mb-1">
            This is a very long text that will be truncated if it exceeds the width of its container.
            You can see that it gets cut off with an ellipsis at the end.
          </Text>
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Custom Styling</Text></Heading>
          <Text className="text-blue-500 mb-1">Blue Text</Text>
          <Text className="text-green-500 font-bold mb-1">Green Bold Text</Text>
          <Text className="text-red-500 italic mb-1">Red Italic Text</Text>
          <Text className="bg-yellow-200 p-1 rounded mb-1">Text with Background</Text>
        </Box>

        <Box className="mb-6">
          <Heading size="md" className="mb-2"><Text>Centered Text</Text></Heading>
          <Center>
            <Text>This text is centered</Text>
          </Center>
        </Box>
      </Box>
    </ScrollView>
  );
}
