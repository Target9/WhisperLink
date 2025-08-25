import { ThemeProvider } from "./components/theme/theme-provider"
import { ChatApp } from "./components/chat/ChatApp"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ChatApp />
    </ThemeProvider>
  )
}

export default App