# Text Component Usage

This document explains how to use the Text component from gluestack-ui in your project.

## Installation

The Text component is already installed in this project. If you need to add it to a new project, you can run:

```bash
npx gluestack-ui add text
```

## Basic Usage

To use the Text component in your file, include the following import statement:

```jsx
import { Text } from '@/components/ui/text';

export default () => <Text>Hello World</Text>;
```

## Available Sizes

The Text component supports various sizes:

- `xs`
- `sm`
- `md` (default)
- `lg`
- `xl`
- `2xl`
- `3xl`
- `4xl`
- `5xl`
- `6xl`

Example usage:

```jsx
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";

function TextSizesExample() {
  const sizes = [
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
  ];
  
  return (
    <Center>
      {sizes.map((size, index) => (
        <Text size={size} key={index} className="text-center">{size}</Text>
      ))}
    </Center>
  );
}
```

## Additional Props

The Text component also supports the following props:

- `bold`: Makes the text bold
- `italic`: Makes the text italic
- `underline`: Adds an underline to the text
- `strikeThrough`: Adds a strikethrough to the text
- `highlight`: Highlights the text with a yellow background
- `isTruncated`: Truncates the text with an ellipsis if it overflows

Example:

```jsx
<Text bold>Bold text</Text>
<Text italic>Italic text</Text>
<Text underline>Underlined text</Text>
<Text strikeThrough>Strikethrough text</Text>
<Text highlight>Highlighted text</Text>
<Text isTruncated>This text will be truncated if it's too long...</Text>
```

## Styling

You can add additional styling using the `className` prop, which accepts Tailwind CSS classes:

```jsx
<Text className="text-blue-500 font-bold">Blue bold text</Text>
```

For more information, refer to the [gluestack-ui documentation](https://gluestack.io/ui/docs/components/text).