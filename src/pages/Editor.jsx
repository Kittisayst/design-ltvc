import { CanvasProvider } from '../context/CanvasContext.jsx';
import App from '../App.jsx';

export default function Editor() {
    return (
        <CanvasProvider>
            <App />
        </CanvasProvider>
    );
}
