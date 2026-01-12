import { useRoutes } from "react-router-dom";
import { Suspense } from "react";

import { routes } from "@/routes";

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      {useRoutes(routes)}
    </Suspense>
  );
}

export default App;
