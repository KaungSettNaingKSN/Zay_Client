import React from 'react'
import {IoMdTime} from 'react-icons/io'
import Button from '@mui/material/Button'
import { IoIosBook } from "react-icons/io";

const BlogItem = () => {
  return (
    <div className="item bg-gray-100 rounded-md shadow-md border-1 border-gray-200 bg-white flex flex-col group">
        <img
            src="https://serviceapi.spicezgold.com/download/1760239113701_NewProject(4).jpg"
            alt=""
            className="w-full rounded-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300"
        />
        <div className="flex items-center gap-2 px-4 pt-3 text-gray-500 text-sm">
            <IoMdTime className="text-[16px]" />
            <span>Jan 10, 2024</span>
        </div>
        <div className="info p-4 flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Blog Post Title</h3>
            <p className="text-gray-600 text-sm">
                This is a brief description of the blog post content. It provides an overview of what the post is about.
            </p>
            <Button className="link">
                Read More <IoIosBook className='!ml-1' size={20}/>
            </Button>
        </div>
    </div>
  )
}

export default BlogItem
