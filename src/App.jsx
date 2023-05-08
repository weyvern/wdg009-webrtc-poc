import { Outlet, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Chat from './components/Chat';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Outlet />}>
        <Route index element={<Home />} />
        <Route path='chat/:roomId' element={<Chat />} />
      </Route>
    </Routes>
  );
};

export default App;
