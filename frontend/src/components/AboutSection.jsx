import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const AboutSection = () => {
  return (
    <div className="border-t border-gray-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
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
                alt="Store interior"
                className="h-48 w-full rounded-md border border-gray-200 object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Chef preparing food"
                className="h-64 w-full rounded-md border border-gray-200 object-cover shadow-sm"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Food plating"
                className="h-64 w-full rounded-md border border-gray-200 object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Store ambiance"
                className="h-48 w-full rounded-md border border-gray-200 object-cover shadow-sm"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              We're on a mission to
              <span className="text-gray-500"> change how you shop local</span>
            </h2>

            <p className="mb-6 text-lg text-gray-600">
              Gokart connects neighborhoods with food, grocery, and retail stores
              through one fast, reliable delivery experience.
            </p>

            <div className="mb-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-900"></div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">10,000+</span> partner stores across categories
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-900"></div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">5 million+</span> orders delivered successfully
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-900"></div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">4.8★</span> average rating from our customers
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="group inline-flex min-h-11 items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-900"
            >
              Join Us Today
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
