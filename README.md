# React WhatsApp Widget

A beautiful and customizable WhatsApp chat widget for React applications. This component provides a floating WhatsApp button that opens a chat-like interface, allowing users to start conversations directly through WhatsApp.

## Features

- 🎨 Fully customizable appearance
- 📱 Responsive design
- ⚡ Smooth animations
- 🔄 Exit intent detection
- 🎯 Event tracking
- 💬 Customizable chat messages
- 🌈 TypeScript support

## Installation

```bash
npm install @avena-health/whatsapp-widget
# or
yarn add @avena-health/whatsapp-widget
```

## Usage

```jsx
import { WhatsAppWidget } from '@avena-health/whatsapp-widget';

function App() {
  return (
    <WhatsAppWidget 
      phoneNumber="1234567890"
      companyName="Your Company"
      messages={[
        "Hello! 👋",
        "How can we help you?",
        "Feel free to ask any questions!"
      ]}
      onRedirect={() => {
        console.log('User clicked the redirect button');
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `phoneNumber` | string | Required | WhatsApp phone number in international format |
| `companyName` | string | - | Company or person name displayed in the header |
| `responseTime` | string | "Typically responds in minutes" | Response time message displayed under the name |
| `avatar` | string | - | URL to the avatar image |
| `messages` | string[] | Default messages | Array of messages to display in the chat |
| `defaultMessage` | string | - | Default message to send when clicking the WhatsApp button |
| `enableExitIntent` | boolean | true | Whether to enable exit intent detection |
| `exitIntentSensitivity` | number | 20 | Sensitivity for exit intent detection in pixels from top |
| `onOpen` | () => void | - | Callback when chat window opens |
| `onClose` | () => void | - | Callback when chat window closes |
| `onRedirect` | () => void | - | Callback when WhatsApp redirect button is clicked |
| `className` | string | - | Custom class name for the widget container |
| `showNotification` | boolean | true | Whether to show the notification dot |
| `style` | CSSProperties | - | Custom styles for the widget |

## Customization

The component can be customized using CSS variables or by overriding the default styles. The widget is built with pure CSS and follows BEM naming conventions.

### Example with Custom Styles

```jsx
<WhatsAppWidget
  phoneNumber="1234567890"
  style={{
    '--whatsapp-primary-color': '#25D366',
    '--whatsapp-button-size': '60px',
  }}
  className="my-custom-widget"
/>
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Build: `npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Avena Health
