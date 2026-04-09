import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'
import { MotionReveal } from '../ui/MotionReveal'
import { ArrowRight } from '../../assets/icons'

export function WorkShowcase() {
  return (
    <section className="bg-void py-[100px] relative section-divider-top overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,rgba(124,92,191,0.06)_0%,transparent_70%)] pointer-events-none" />

      <Container>
        <MotionReveal className="max-w-[600px] mb-14">
          <SectionLabel>Our Work</SectionLabel>
          <h2 className="font-serif font-light text-[48px] text-white mb-5 leading-[1.15]">
            See what we've<br />
            <span className="text-purple-glow">built in action.</span>
          </h2>
        </MotionReveal>

        {/* Laptop + Phone side by side */}
        <MotionReveal>
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            {/* Laptop — website video */}
            <div className="w-full lg:w-[62%]">
              <div className="relative">
                <div className="bg-[#1e1e22] rounded-t-xl pt-3 px-3 pb-3 shadow-[0_-2px_20px_rgba(0,0,0,0.3)]">
                  <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#2a2a2e] ring-1 ring-[#333]" />
                  <div className="rounded-[4px] overflow-hidden ring-1 ring-black/50">
                    <video muted playsInline autoPlay loop className="w-full aspect-[16/10] object-cover bg-white block">
                      <source src="/videos/stevia-cookies.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
                <div className="h-[4px] bg-[#1e1e22] rounded-b-[2px]" />
                <div className="relative mx-auto w-[94%]">
                  <div className="h-[8px] bg-gradient-to-b from-[#333] via-[#444] to-[#2a2a2c] rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </div>
                <div className="relative mx-auto w-[108%] -ml-[4%]">
                  <div className="h-[14px] bg-gradient-to-b from-[#c0bfbd] via-[#b5b4b2] to-[#a8a7a5] rounded-b-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                    <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[20%] h-[1px] bg-[#999] rounded-full opacity-40" />
                  </div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-[50%] rounded-t-xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              </div>
              <div className="mt-6">
                <h4 className="font-sans font-medium text-[14px] text-gold uppercase tracking-[2px]">F&B Website</h4>
                <p className="font-sans font-light text-sm text-grey-light mt-1">Website Development</p>
              </div>
            </div>

            {/* Phone — invitation video, height matched to laptop */}
            <div className="flex justify-center">
              <div>
                <div className="relative rounded-[3rem] bg-[#2c2c2e] p-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06)] h-[350px] md:h-[500px]">
                  <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/[0.12] pointer-events-none" />
                  <div className="absolute -left-[2px] top-[22%] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l" />
                  <div className="absolute -left-[2px] top-[33%] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l" />
                  <div className="absolute -right-[2px] top-[30%] w-[3px] h-[50px] bg-[#3a3a3c] rounded-r" />

                  <div className="relative rounded-[2.55rem] bg-black overflow-hidden ring-1 ring-black/80 h-full">
                    <video
                      muted
                      playsInline
                      autoPlay
                      loop
                      className="h-full aspect-[9/19.5] object-cover"
                    >
                      <source src="/videos/mak-gien-invitation.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-black/40 rounded-full z-20" />
                  </div>

                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mt-6 text-center">
                  <h4 className="font-sans font-medium text-[14px] text-gold uppercase tracking-[2px]">Digital Invitation</h4>
                  <p className="font-sans font-light text-sm text-grey-light mt-1">Online Invitation</p>
                </div>
              </div>
            </div>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.2} className="mt-14 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 font-sans text-base text-purple-glow hover:text-purple-bright transition-colors duration-200 group/all"
          >
            See all services
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/all:translate-x-1" />
          </Link>
        </MotionReveal>
      </Container>
    </section>
  )
}
