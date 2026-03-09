import React, { useState } from 'react'
import { Button } from '@mui/material';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const QutyBox = () => {
    const [qtyVal, setQtyVal] = useState(1);
    const pulsQty = () => {
    setQtyVal((prev) => prev + 1)
    }
    const minusQty = () => {
        setQtyVal((prev) => (prev > 1 ? prev - 1 : 1))
    }

  return (
    <div className='qtyBox flex items-center relative'>
        <input type="number" readOnly value={qtyVal} className='w-full !no-spinner h-[40px] p-2 text-[15px] focus:outline-none border-1 border-black rounded-md'/>
        <div className='flex flex-col items-center justify-between absolute top-0 right-0 z-50'>
        <Button onClick={pulsQty} className='!min-w-[30px] !w-[30px] !h-[20px] !text-black'><FaAngleUp/></Button>
        <Button onClick={minusQty} className='!min-w-[30px] !w-[30px] !h-[20px] !text-black'><FaAngleDown/></Button>
        </div>
    </div>
  )
}

export default QutyBox;
