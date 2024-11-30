import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: "Ijeoma Ogugua",
    role: "Crypto Trader",
    avatar: "/public/images/placeeholder-user.jpg", 
    content: "TrustBank has made my crypto trading experience smooth and secure. I couldn't ask for a better platform.",
    rating: 4
  },
  {
    name: "Michael Massamba",
    role: "Investment Analyst",
    avatar: "/public/images/placeeholder-user.jpg", 
    content: "The real-time market data and user-friendly interface have significantly improved my trading strategies.",
    rating: 3
  },
  {
    name: "Vivian Vincent",
    role: "Business Owner",
    avatar: "/public/images/placeeholder-user.jpg", 
    content: "TrustBank's security features give me peace of mind. I can trade confidently knowing my assets are protected.",
    rating: 4
  },
  {
    name: "Austin Obinna",
    role: "Day Trader",
    avatar: "/public/images/placeeholder-user.jpg", 
    content: "The community support is incredible. I've learned so much from other traders!",
    rating: 3
  },
  {
    name: "Kate Chukwu",
    role: "Trader",
    avatar: "/public/images/placeeholder-user.jpg", 
    content: "The platform is easy to use and the customer support is top-notch. I've been able to make consistent profits since joining.",
    rating: 3
  },
  {
    name: "Aminu Sanni",
    role: "Entrepreneur",
    avatar: "/public/images/placeeholder-user.jpg", 
    content: "TrustBank has been a game-changer for me. The platform's features and the community support have made a significant difference in my trading success.",
    rating: 3
  }
];

export function UserFeedback() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold mb-2">Community Voices</h2>
          <p className="text-md text-muted-foreground">Real stories from our growing community</p>
        </motion.div>

        <div className="relative h-[400px]">
          <motion.div
            animate={{
              x: [0, -2400],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex gap-6 absolute"
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card key={index} className="w-[350px] p-6 flex-shrink-0 bg-white dark:bg-gray-800">
                <div className="flex items-start gap-4 mb-2">
                  <Avatar className="w-4 h-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <Quote className="w-6 h-6 text-green-600/20 mb-2" />
                <p className="text-muted-foreground mb-2 text-md">{testimonial.content}</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}