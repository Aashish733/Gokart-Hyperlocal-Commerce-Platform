import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const AboutSection = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Restaurant interior"
                className="rounded-2xl shadow-lg h-48 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Chef preparing food"
                className="rounded-2xl shadow-lg h-64 w-full object-cover"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Food plating"
                className="rounded-2xl shadow-lg h-64 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Restaurant ambiance"
                className="rounded-2xl shadow-lg h-48 w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              We're on a Mission to
              <span className="text-[#E23744]"> Change the Way You Eat</span>
            </h2>

            <p className="text-lg text-gray-600 mb-6">
              Founded in 2020, Zomato has grown from a small startup to one of the leading food delivery platforms. We believe that great food should be accessible to everyone, anytime, anywhere.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E23744] mt-2"></div>
                <p className="text-gray-600">
                  <span className="font-semibold">10,000+</span> partner restaurants across the country
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E23744] mt-2"></div>
                <p className="text-gray-600">
                  <span className="font-semibold">5 million+</span> orders delivered successfully
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E23744] mt-2"></div>
                <p className="text-gray-600">
                  <span className="font-semibold">4.8★</span> average rating from our customers
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="group inline-flex items-center gap-2 bg-[#E23744] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#c41e2b] hover:shadow-lg transition-all duration-200"
            >
              Join Us Today
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;