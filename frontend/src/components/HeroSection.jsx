import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { BiFoodMenu, BiTimeFive } from "react-icons/bi";
import { MdDeliveryDining } from "react-icons/md";

const HeroSection = () => {
  return (
    <div className="relative bg-linear-to-br from-[#E23744] to-[#ff6b6b] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover the Best Food & Drinks in Your City
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              From local favorites to global cuisines, experience the finest restaurants delivered to your doorstep.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 bg-white text-[#E23744] px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#E23744] transition-all duration-200"
              >
                Explore Restaurants
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm opacity-80">Restaurants</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50k+</div>
                <div className="text-sm opacity-80">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">30min</div>
                <div className="text-sm opacity-80">Delivery Time</div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Delicious Food"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 max-w-[200px]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <MdDeliveryDining className="text-green-600 text-xl" />
                </div>
                <div>
                  <div className="font-semibold">Free Delivery</div>
                  <div className="text-sm text-gray-600">On orders $50+</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-6 -right-6 bg-white rounded-lg shadow-xl p-4 max-w-[180px]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <BiTimeFive className="text-orange-600 text-xl" />
                </div>
                <div>
                  <div className="font-semibold">30 Mins</div>
                  <div className="text-sm text-gray-600">Fast delivery</div>
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