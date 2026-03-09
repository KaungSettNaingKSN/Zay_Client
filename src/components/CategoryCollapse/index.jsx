import React, { useState } from 'react'
import { FaRegSquarePlus } from 'react-icons/fa6'
import { FiMinusSquare } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import { Mycontext } from '../../App'

/**
 * Builds a product-listing URL for every level of the category tree.
 *
 * Top-level  → ?catId=...&catName=...
 * Sub-level  → ?catId=...&catName=...&subCatId=...&subCat=...
 * Third-level→ ?catId=...&catName=...&subCatId=...&subCat=...&thirdSubCatId=...&thirdSubCat=...
 *
 * We always carry the parent names/IDs so the breadcrumb in ProductListing
 * can render the full path.
 */
const toListingUrl = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return `/productListing?${qs.toString()}`;
};

const CategoryCollapse = ({ onClose }) => {
  const context = React.useContext(Mycontext);
  const [submenuIndex,      setSubmenuIndex]      = useState(null);
  const [innerSubmenuIndex, setInnerSubmenuIndex] = useState(null);

  const toggleSubmenu      = (index) => setSubmenuIndex(prev => (prev === index ? null : index));
  const toggleInnerSubmenu = (key)   => setInnerSubmenuIndex(prev => (prev === key ? null : key));

  const topLevel = (context.categories || []).filter(c => !c.parentId);

  return (
    <div className='scroll overflow-y-auto'>
      <ul className='w-full'>
        {topLevel.map((cat, i) => {
          const hasChildren = cat.children?.length > 0;

          return (
            <li
              key={cat._id}
              className='list-none flex items-center relative flex-col border-b border-[rgba(0,0,0,0.06)]'
            >
              {/* ── Top-level category ── */}
              {hasChildren ? (
                <Button
                  className='w-full !text-left !justify-start !text-black !px-3 !capitalize !text-[13px]'
                  onClick={() => { toggleSubmenu(i); setInnerSubmenuIndex(null); }}
                >
                  {cat.name}
                  {submenuIndex === i
                    ? <FiMinusSquare className='absolute top-[10px] right-[15px] text-blue-500' />
                    : <FaRegSquarePlus className='absolute top-[10px] right-[15px] text-gray-400' />}
                </Button>
              ) : (
                <Link
                  to={toListingUrl({ catId: cat._id, catName: cat.name })}
                  className='w-full'
                  onClick={onClose}
                >
                  <Button className='w-full !text-left !justify-start !text-black !px-3 !capitalize !text-[13px]'>
                    {cat.name}
                  </Button>
                </Link>
              )}

              {/* ── Sub-categories ── */}
              {submenuIndex === i && hasChildren && (
                <ul className='submenu w-full bg-[#fafafa]'>
                  {cat.children.map((sub, j) => {
                    const hasInner = sub.children?.length > 0;
                    const innerKey = `${i}-${j}`;

                    return (
                      <li
                        key={sub._id}
                        className='list-none relative border-t border-[rgba(0,0,0,0.04)]'
                      >
                        {hasInner ? (
                          <Button
                            className='w-full !text-left !justify-start !text-black !px-3 !pl-6 !capitalize !text-[13px]'
                            onClick={() => toggleInnerSubmenu(innerKey)}
                          >
                            <span className='w-[6px] h-[6px] rounded-full bg-gray-400 !mr-2 flex-shrink-0' />
                            {sub.name}
                            {innerSubmenuIndex === innerKey
                              ? <FiMinusSquare className='absolute top-[10px] right-[15px] text-blue-500' />
                              : <FaRegSquarePlus className='absolute top-[10px] right-[15px] text-gray-400' />}
                          </Button>
                        ) : (
                          /* Sub-category leaf → pass catId + subCatId */
                          <Link
                            to={toListingUrl({
                              catId:   cat._id,
                              catName: cat.name,
                              subCatId: sub._id,
                              subCat:   sub.name,
                            })}
                            className='w-full'
                            onClick={onClose}
                          >
                            <Button className='w-full !text-left !justify-start !text-black !px-3 !pl-6 !capitalize !text-[13px]'>
                              <span className='w-[6px] h-[6px] rounded-full bg-gray-400 !mr-2 flex-shrink-0' />
                              {sub.name}
                            </Button>
                          </Link>
                        )}

                        {/* ── Third-level sub-categories ── */}
                        {innerSubmenuIndex === innerKey && hasInner && (
                          <ul className='inner_submenu w-full bg-[#f3f3f3]'>
                            {sub.children.map(third => (
                              <li
                                key={third._id}
                                className='list-none border-t border-[rgba(0,0,0,0.04)]'
                              >
                                <Link
                                  to={toListingUrl({
                                    catId:         cat._id,
                                    catName:       cat.name,
                                    subCatId:      sub._id,
                                    subCat:        sub.name,
                                    thirdSubCatId: third._id,
                                    thirdSubCat:   third.name,
                                  })}
                                  className='w-full'
                                  onClick={onClose}
                                >
                                  <Button className='w-full !text-left !justify-start !text-gray-600 !px-3 !pl-10 !capitalize !text-[12px]'>
                                    <span className='w-[4px] h-[4px] rounded-full bg-gray-300 !mr-2 flex-shrink-0' />
                                    {third.name}
                                  </Button>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryCollapse;