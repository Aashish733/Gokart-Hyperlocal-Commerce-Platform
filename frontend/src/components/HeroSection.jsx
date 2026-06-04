import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { BiTimeFive } from "react-icons/bi";
import { MdDeliveryDining } from "react-icons/md";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden border-b border-gray-200 bg-white">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-1/2 -top-1/2 h-64 w-64 rounded-full border border-gray-100"></div>
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full border border-gray-100"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gray-900"
          >
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Hyperlocal commerce, delivered fast
            </h1>
            <p className="mb-8 text-lg text-gray-600 md:text-xl">
              From food to groceries and more — discover stores near you with
              reliable doorstep delivery.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex min-h-11 items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-900"
              >
                Get Started
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-semibold text-gray-900 transition-colors hover:border-black"
              >
                Explore Stores
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-gray-500">Stores</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50k+</div>
                <div className="text-sm text-gray-500">Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">30min</div>
                <div className="text-sm text-gray-500">Avg. delivery</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-md border border-gray-200 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Delicious Food"
                className="h-auto w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -left-4 max-w-[200px] rounded-md border border-gray-200 bg-white p-4 shadow-sm sm:-left-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-gray-200 p-2">
                  <MdDeliveryDining className="text-xl text-gray-900" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Free Delivery</div>
                  <div className="text-sm text-gray-500">On orders ₹250+</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute -right-4 -top-6 max-w-[180px] rounded-md border border-gray-200 bg-white p-4 shadow-sm sm:-right-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-gray-200 p-2">
                  <BiTimeFive className="text-xl text-gray-700" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">30 Mins</div>
                  <div className="text-sm text-gray-500">Fast delivery</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
