import { ThemeProvider } from "./components/theme/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>Hello World</div>
    </ThemeProvider>
  )
}

export default App