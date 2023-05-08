import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <Link to='/chat/123'>Room: 123</Link>
      <br />
      <Link to='/chat/456'>Room: 456</Link>
    </>
  );
};

export default Home;
