import React from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { IoCloseSharp } from 'react-icons/io5'
import CategoryCollapse from '../../CategoryCollapse'

const CategoryPanel = (props) => {
  const close = () => props.setIsOpenCatPanel(false);

  const DrawerList = (
    <Box sx={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation" className='categoryPannel'>
      <div className='flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.1)] bg-white sticky top-0 z-10'>
        <h3 className="text-[15px] font-[600] text-gray-800">Shop By Categories</h3>
        <button
          onClick={close}
          className='w-[28px] h-[28px] flex items-center justify-center rounded-full
                     hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800'
        >
          <IoCloseSharp size={18} />
        </button>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <CategoryCollapse onClose={close} />
      </div>
    </Box>
  );

  return (
    <Drawer open={props.isOpenCatPanel} onClose={close}>
      {DrawerList}
    </Drawer>
  );
};

export default CategoryPanel;