import { TrendingUp, Users, Leaf, Globe } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Impact & Vision</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Transforming agriculture through AI-powered insights and sustainable farming practices
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-green-700">12,450</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Queries Answered</p>
              <p className="text-2xl font-bold text-green-700">89,234</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Crops Analyzed</p>
              <p className="text-2xl font-bold text-green-700">156</p>
            </div>
            <Leaf className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Countries Served</p>
              <p className="text-2xl font-bold text-green-700">23</p>
            </div>
            <Globe className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card - Text Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Our Agricultural Impact</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              kangtani.ai is revolutionizing modern agriculture by providing farmers with intelligent, data-driven
              insights that optimize crop yields while promoting sustainable farming practices.
            </p>
            <p>
              Our AI-powered platform analyzes soil conditions, weather patterns, and crop health to deliver
              personalized recommendations that help farmers make informed decisions about planting, irrigation,
              fertilization, and pest management.
            </p>
            <p>
              Through advanced machine learning algorithms and agricultural expertise, we're helping farmers increase
              productivity by up to 30% while reducing water usage and chemical inputs, contributing to a more
              sustainable future for agriculture.
            </p>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-6">
              <p className="text-green-800 font-medium">
                "Technology should serve humanity, and in agriculture, it should serve those who feed the world."
              </p>
            </div>
          </div>
        </div>

        {/* Right Card - Video */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Vision in Action</h2>
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="kangtani.ai Agricultural Innovation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Key Features Demonstrated:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time crop health monitoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Intelligent irrigation scheduling</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Predictive pest and disease alerts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sustainable farming recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
        <p className="text-xl text-green-100 max-w-3xl mx-auto">
          To empower farmers worldwide with cutting-edge AI technology that promotes sustainable agriculture, increases
          food security, and protects our planet for future generations.
        </p>
      </div>
    </div>
  )
}
