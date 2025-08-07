import { AudioLibrary } from '@/components/AudioLibrary'
import { AppointmentForm } from '@/components/AppointmentForm'
import { Navigation } from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            声音疗愈之旅
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            通过古老的颂钵和现代声音疗法，让心灵回归宁静，身体获得疗愈
          </p>
        </section>

        {/* Audio Library Section */}
        <section id="audio-section">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            疗愈音频库
          </h2>
          <AudioLibrary />
        </section>

        {/* Appointment Section */}
        <section id="appointment-section">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            预约个案疗愈
          </h2>
          <div className="max-w-2xl mx-auto">
            <AppointmentForm />
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 声音疗愈中心. 让声音带来内心的平静与疗愈
          </p>
        </div>
      </footer>
    </div>
  )
}
