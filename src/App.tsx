import React from "react";
import GCanvas from "./gravity/GCanvas";

type AppProps = Record<string, never>

const App: React.FC<AppProps> = () => (
    <GCanvas
        width={800}
        height={400}
    />
);

export default App;
