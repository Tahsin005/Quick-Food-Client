import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <main className="max-w-screen-xl mx-auto px-8 md:px-16 lg:px-24 py-5">
      <div className="relative bg-gradient-to-r h-screen text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="./top-view-table-full-delicious-food-composition.jpg"
            alt="Background Image"
            className="object-cover object-center w-full h-full"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
          <div className="typewriter mb-8">
            <p className="lekha text-4xl font-bold leading-tight">
              Welcome to <br />
              Quick Food
            </p>
          </div>

          <p className="text-2xl text-white mb-12 font-semibold">
            Savor the Flavor of Freshness <br />
            Delight in every bite with our farm-to-table delicacies. <br />
            Explore a world where taste meets tradition.
          </p>

          <Link
            to="/restaurants"
            className="bg-blue-500 text-white hover:text-black hover:bg-white py-2 px-4 rounded text-xl font-bold transition duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg"
          >
            Explore Restaurants
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
