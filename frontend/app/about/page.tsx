import { Github, Linkedin, Mail, MapPin, Calendar } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-center">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-8 max-w-2xl w-full">
          {/* Profile Header */}
          <div className="text-center mb-8">
            {/* Profile Photo Placeholder */}
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">JD</span>
            </div>

            {/* Name and Title */}
            <h1 className="text-3xl font-bold text-green-800 mb-2">John Doe</h1>
            <p className="text-xl text-gray-600 mb-4">AI Engineer & Agricultural Technologist</p>

            {/* Location and Experience */}
            <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm mb-6">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>5+ years experience</span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-4">About Me</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                I'm passionate about leveraging artificial intelligence to solve real-world agricultural challenges.
                With a background in machine learning and sustainable farming practices, I created kangtani.ai to bridge
                the gap between cutting-edge technology and traditional agriculture.
              </p>
              <p>
                My mission is to democratize access to agricultural intelligence, helping farmers of all sizes make
                data-driven decisions that improve yields while protecting our environment. Through kangtani.ai, I aim
                to contribute to global food security and sustainable farming practices.
              </p>
              <p>
                When I'm not coding or researching agricultural innovations, you can find me tending to my own small
                urban garden, experimenting with permaculture techniques, or collaborating with farming communities to
                understand their real-world challenges.
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Expertise</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Machine Learning",
                "Agricultural Science",
                "Data Analytics",
                "Sustainable Farming",
                "Computer Vision",
                "IoT Systems",
                "Climate Modeling",
                "Crop Management",
              ].map((skill) => (
                <div key={skill} className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Connect With Me</h2>
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com/johndoe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>

              <a
                href="https://linkedin.com/in/johndoe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>

              <a
                href="mailto:john@kangtani.ai"
                className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 px-4 py-2 rounded-lg transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
            <h3 className="text-lg font-semibold mb-2">Let's Collaborate!</h3>
            <p className="text-green-100 text-sm">
              Interested in agricultural technology or have ideas for improving kangtani.ai? I'd love to hear from you
              and explore potential collaborations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
