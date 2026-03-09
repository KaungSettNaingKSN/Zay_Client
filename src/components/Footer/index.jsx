import React from 'react'
import { LiaShippingFastSolid } from 'react-icons/lia'
import { CiHeadphones } from 'react-icons/ci'
import { GoGift } from 'react-icons/go'
import { IoWalletOutline } from 'react-icons/io5'
import { LuRefreshCcwDot } from 'react-icons/lu'
import { AiOutlineFacebook } from 'react-icons/ai'
import { PiTiktokLogoThin } from 'react-icons/pi'
import { FaInstagram } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const BADGES = [
  { icon: LiaShippingFastSolid, label: 'Free Shipping',    sub: 'On orders over $200'     },
  { icon: LuRefreshCcwDot,      label: '30 Days Returns',  sub: 'For an exchange product'  },
  { icon: IoWalletOutline,      label: 'Secured Payment',  sub: 'All major cards accepted' },
  { icon: GoGift,               label: 'Special Gifts',    sub: 'On your first order'      },
  { icon: CiHeadphones,         label: 'Support 24/7',     sub: 'Contact us anytime'       },
]

const Footer = () => {
  return (
    <footer className='bg-white border-t border-gray-100'>

      {/* ── Trust badges ── */}
      <div className='border-b border-gray-100'>
        <div className='container px-4 py-6 sm:py-8'>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6'>
            {BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label}
                className='group flex flex-col items-center text-center gap-2 py-3 px-2
                           rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-default'>
                <div className='w-[50px] h-[50px] rounded-xl bg-[#f51111]/8 flex items-center justify-center
                                group-hover:bg-[#f51111]/15 transition-colors duration-300'>
                  <Icon size={26}
                    className='text-gray-500 group-hover:text-[#f51111]
                               group-hover:-translate-y-0.5 transition-all duration-300' />
                </div>
                <div>
                  <p className='text-[12px] sm:text-[13px] font-[700] text-gray-800 leading-tight'>{label}</p>
                  <p className='text-[10px] sm:text-[11px] text-gray-400 mt-0.5 leading-tight'>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className='container px-4 py-4 sm:py-5'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4'>

          {/* Copyright */}
          <p className='text-[11px] sm:text-[12px] text-gray-400 order-3 sm:order-1'>
            © 2026 <span className='font-[700] text-gray-600'>Zay</span>. All rights reserved.
          </p>

          {/* Links */}
          <div className='flex items-center gap-1 order-1 sm:order-2'>
            {['Terms', 'Privacy', 'Contact'].map((item, i) => (
              <React.Fragment key={item}>
                {i > 0 && <span className='text-gray-200 text-[10px]'>|</span>}
                <a href='#'
                  className='text-[11px] sm:text-[12px] text-gray-400 font-[500]
                             hover:text-[#f51111] transition-colors duration-200 px-2 py-1'>
                  {item}
                </a>
              </React.Fragment>
            ))}
          </div>

          {/* Social icons */}
          <div className='flex items-center gap-1 order-2 sm:order-3'>
            {[
              { icon: AiOutlineFacebook, href: '#', label: 'Facebook' },
              { icon: PiTiktokLogoThin,  href: '#', label: 'TikTok'   },
              { icon: FaInstagram,       href: '#', label: 'Instagram' },
            ].map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className='w-[34px] h-[34px] rounded-full flex items-center justify-center
                           text-gray-400 hover:text-[#f51111] hover:bg-[#f51111]/8
                           transition-all duration-200'>
                <Icon size={18} />
              </a>
            ))}
          </div>

        </div>
      </div>

    </footer>
  )
}

export default Footer