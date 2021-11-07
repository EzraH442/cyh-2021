import React from "react";
import { Colors } from "./graphics/Color";
import GCanvas from "./gravity/GCanvas";

type AppProps = Record<string, never>

const App: React.FC<AppProps> = () => (
    <GCanvas
        width={800}
        height={400}
        FPS={100}
        fillColor={Colors.Black}
        constants={{
            GC: 10,
            E_LOSS_COLLISION: 1.0,
        }}
    />
);

export default App;
