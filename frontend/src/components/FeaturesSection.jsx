import { motion } from "framer-motion";
import {
  MdRestaurant,
  MdDeliveryDining,
  MdPayment,
  MdSecurity
} from "react-icons/md";
import { BiTimeFive, BiSupport } from "react-icons/bi";

const FeaturesSection = () => {
  const features = [
    {
      icon: <MdRestaurant className="text-4xl text-[#E23744]" />,
      title: "Wide Restaurant Selection",
      description: "Choose from 500+ restaurants with diverse cuisines"
    },
    {
      icon: <MdDeliveryDining className="text-4xl text-[#E23744]" />,
      title: "Fast Delivery",
      description: "Average delivery time under 30 minutes"
    },
    {
      icon: <BiTimeFive className="text-4xl text-[#E23744]" />,
      title: "Real-time Tracking",
      description: "Track your order from restaurant to doorstep"
    },
    {
      icon: <MdPayment className="text-4xl text-[#E23744]" />,
      title: "Secure Payments",
      description: "Multiple payment options with 100% security"
    },
    {
      icon: <BiSupport className="text-4xl text-[#E23744]" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service"
    },
    {
      icon: <MdSecurity className="text-4xl text-[#E23744]" />,
      title: "Quality Assured",
      description: "Strict quality checks for all restaurants"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-[#E23744]">Zomato</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing you with the best food delivery experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-red-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesSection;