import "./App.scss";
import Auth from "./Components/Auth/Auth";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./Components/Chat/Chat";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
