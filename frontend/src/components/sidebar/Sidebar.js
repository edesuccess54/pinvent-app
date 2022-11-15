import './Sidebar.scss'
import { HiMenuAlt3 } from 'react-icons/hi'
import { RiProductHuntLine } from 'react-icons/ri'
import menu from '../../data/sidebar'
import SidebarItem from './SidebarItem'

const Sidebar = ({children}) => {
  return (
    <div className="layout">
      <div className="sidebar">
        
        <div className="top_section">
          <div className="logo">
            <RiProductHuntLine  size={35} style={{cursor: "pointer"}}/>
          </div>
          <div className="bars">
            <HiMenuAlt3 />
          </div>
        </div>

      </div>
      <main>
        {children}
      </main>
    </div>
  )
}

export default Sidebar
