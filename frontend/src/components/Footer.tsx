import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const container = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2, duration: 0.6 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-black text-gray-300 pt-14 pb-8 px-6"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">

        {/* Logo Section */}
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold text-white mb-4">Zomato</h1>
          <p className="text-sm leading-relaxed">
            Discover the best food and drinks around you. Order from your
            favourite restaurants with fast delivery and great taste.
          </p>
        </motion.div>

        {/* Company */}
        <motion.div variants={item}>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            {["About", "Careers", "Blog", "Press"].map((link) => (
              <motion.li
                key={link}
                whileHover={{ x: 6 }}
                className="cursor-pointer hover:text-red-500"
              >
                {link}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* For Restaurants */}
        <motion.div variants={item}>
          <h3 className="text-white font-semibold mb-4">For Restaurants</h3>
          <ul className="space-y-2">
            {[
              "Partner With Us",
              "Apps For You",
              "Restaurant Dashboard",
              "Advertise"
            ].map((link) => (
              <motion.li
                key={link}
                whileHover={{ x: 6 }}
                className="cursor-pointer hover:text-red-500"
              >
                {link}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Social Section */}
        <motion.div variants={item}>
          <h3 className="text-white font-semibold mb-4">Connect With Us</h3>

          <div className="flex gap-4 text-lg">
            {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedin].map(
              (Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, color: "#ef4444" }}
                  className="cursor-pointer"
                >
                  <Icon />
                </motion.div>
              )
            )}
          </div>

          <p className="text-sm mt-6">
            Email: support@zomato.com
          </p>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
        © {new Date().getFullYear()} Zomato Clone. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;