// Apply a raw loader to import a .txt file as a JavaScript module
import rawText from '../../../../data.txt' with { turbopackLoader: 'raw-loader', turbopackAs: '*.js' }

export default function Page() {
  return <pre>{rawText}</pre>
}
