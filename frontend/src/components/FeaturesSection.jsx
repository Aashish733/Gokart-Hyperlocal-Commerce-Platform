import { motion } from "framer-motion";
import {
  MdStore,
  MdDeliveryDining,
  MdPayment,
  MdSecurity
} from "react-icons/md";
import { BiTimeFive, BiSupport } from "react-icons/bi";

const FeaturesSection = () => {
  const features = [
    {
      icon: <MdStore className="text-4xl text-gray-900" />,
      title: "Wide Store Selection",
      description: "Choose from 500+ stores across multiple categories"
    },
    {
      icon: <MdDeliveryDining className="text-4xl text-gray-900" />,
      title: "Fast Delivery",
      description: "Average delivery time under 30 minutes"
    },
    {
      icon: <BiTimeFive className="text-4xl text-gray-900" />,
      title: "Real-time Tracking",
      description: "Track your order from store to doorstep"
    },
    {
      icon: <MdPayment className="text-4xl text-gray-900" />,
      title: "Secure Payments",
      description: "Multiple payment options with 100% security"
    },
    {
      icon: <BiSupport className="text-4xl text-gray-900" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service"
    },
    {
      icon: <MdSecurity className="text-4xl text-gray-900" />,
      title: "Quality Assured",
      description: "Strict quality checks for all stores"
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
    <div className="border-t border-gray-200 bg-[#fafafa] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Why Choose <span className="text-gray-500">Gokart</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            A modern hyperlocal platform built for speed, clarity, and trust
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="rounded-md border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-gray-200 bg-gray-50">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
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
