import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import nssGroupImg from '../assets/nss_group_photo.jpeg'
import pranavImg from '../assets/pranav.jpeg'
import jayantImg from '../assets/jayant.jpeg'
import divyaImg from '../assets/divya.jpeg'
import rushikeshImg from '../assets/rushikesh.jpeg'
import sidImg from '../assets/sid.jpeg'
import somebodyImg from '../assets/somebody.jpeg'
import rutujaImg from '../assets/rutuja.jpeg'

const TESTIMONIALS = [
  {
    name: "Pranav Dangare",
    role: "PICT NSS Alumni",
    avatar: pranavImg,
    text: "Being part of NSS PICT was one of the most rewarding experiences of my college life. The values I learned, the people I met, and the change we created together shaped who I am today. NSS taught me the importance of service, teamwork, and resilience—lessons I carry forward in my professional journey."
  },
  {
    name: "Jayant Khandebharad",
    role: "PICT NSS Alumni",
    avatar: jayantImg,
    text: "My time as a volunteer with PICT NSS has been the best time of my life. Handling responsibilities like getting permissions from the administration, arranging things for events, and managing teams taught me so much. These experiences have made me a better person and have also been very helpful in my career. I always look back fondly with time and try to visit whenever I can because I love my juniors."
  },
  {
    name: "Divya Khandare",
    role: "PICT NSS Alumni",
    avatar: divyaImg,
    text: "When we stand for change, we ignite the potential to spark a powerful and widespread movement. This movement possesses the ability to wield significant influence, creating ripples that touch every corner of society. This movement draws upon the collective genius of individuals coming together, each contributing their unique talents and insights. United, we can achieve remarkable feats, inspire others, and create a legacy of transformation that resonates for generations."
  },
  {
    name: "Rushikesh Edne",
    role: "PICT NSS Alumni",
    avatar: rushikeshImg,
    text: "Serving as the NSS Treasurer helped me bridge the gap between financial accountability and community service. I learned to optimize resources and audit funds transparently. Truly a life-changing experience."
  },
  {
    name: "Siddhesh Chavan",
    role: "PICT NSS Volunteer",
    avatar: sidImg,
    text: "NSS camps taught me how a unified group of youth can uplift a whole village. Managing budgets for food, tools, and travel made me value every single rupee. A beautiful journey with PICT NSS."
  },
  {
    name: "Ujwal Khairnar",
    role: "PICT NSS Alumni",
    avatar: somebodyImg,
    text: "NSS is not just a college club, it is a family. The bonds formed while working under hot sun or building check dams are permanent. Highly recommend every student to experience this service."
  },
  {
    name: "Rutuja Uplenchwar",
    role: "PICT NSS Volunteer",
    avatar: rutujaImg,
    text: "The financial transparency that we maintained during our annual camps set a benchmark. NSS Treasurer app makes it extremely simple to track college grants and manage receipts on the fly."
  }
]

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Slice testimonials to show 3 at a time, wrapping around the end of the array
  const getVisibleTestimonials = () => {
    const list = []
    for (let i = 0; i < 3; i++) {
      list.push(TESTIMONIALS[(activeIndex + i) % TESTIMONIALS.length])
    }
    return list
  }

  const visibleTestimonials = getVisibleTestimonials()

  return (
    <div className="pt-24 min-h-screen bg-white flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl px-4 py-16 flex flex-col items-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-[#1e293b] sm:text-7xl leading-tight">
          Audit Finances of NSS <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            with Intelligence
          </span>
        </h1>
        <p className="text-xl font-bold text-gray-700 tracking-wide uppercase">
          " NOT ME BUT YOU "
        </p>
        <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
          Our vision is to build the youth with the mind and spirit to serve the society and work for the social uplift of the down-trodden masses of our nation as a movement.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/dashboard">
            <Button size="lg" className="text-sm px-8 bg-[#1e293b] hover:bg-slate-800 text-white font-bold h-12 rounded-lg">
              Get Started
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-sm px-8 border-gray-300 hover:bg-gray-50 font-bold h-12 rounded-lg" onClick={() => toast.info('Demo video playback simulated.')}>
            Watch Demo
          </Button>
        </div>
      </div>

      {/* NSS Group Photo Section */}
      <div className="w-full max-w-6xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-gray-100 bg-white">
          <img
            src={nssGroupImg}
            alt="NSS PICT Family Group Photo"
            className="w-full object-cover max-h-[550px]"
          />
        </div>
      </div>

      {/* Testimonials Carousel Section */}
      <div className="w-full bg-gray-50/50 py-24 flex flex-col items-center border-t border-gray-100 mt-16">
        <div className="max-w-6xl w-full px-4 space-y-12">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight">
            What Our Seniors Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ease-in-out">
            {visibleTestimonials.map((t, idx) => (
              <Card key={`${t.name}-${idx}`} className="border-none shadow-lg bg-white rounded-2xl p-6 space-y-4 hover:scale-[1.02] transition-transform flex flex-col justify-between min-h-[300px]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-50"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{t.name}</h4>
                      <p className="text-xs text-muted-foreground font-semibold">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
