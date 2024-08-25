import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {IoMdHome} from "react-icons/io";
import {IoLibrarySharp} from "react-icons/io5";
import {FaCirclePlus} from "react-icons/fa6";
import {FaFileCode, FaSearch, FaUser} from "react-icons/fa";


export default function Navbar() {
    const [currentPage, updateCurrentPage] = useState(`/${location.pathname.split("/")[1]}`)
    const pages = ["learn", "browse", "add", "user", "debug"]
    const navigate = useNavigate()
    const icons = {
        "learn": <IoMdHome className="w-8 h-8 hover:text-white duration-150"/>,
        "add": <FaCirclePlus className="w-8 h-8 hover:text-white duration-150"/>,
        "browse": <IoLibrarySharp className="w-8 h-8 hover:text-white duration-150"/>,
        "user": <FaUser className="w-8 h-8 hover:text-white duration-150 mt-20"/>,
        "debug": <FaFileCode className="w-8 h-8 hover:text-zinc-600 text-zinc-700 duration-150 mt-80"/>
    }

    function handleNavigate(destination
    ) {
        if (`${currentPage}` !== `/${destination}`) {
            navigate(`/${destination.toLowerCase()}`)
            updateCurrentPage(`/${destination}`)
        }
    }

    return (
        <div className="bg-zinc-800 mr-4 h-screen fixed left-0 overflow-hidden select-none min-w-16">
            {pages.map((page) => {
                let classes
                (`/${page.toLowerCase()}` === currentPage.toLowerCase()) ? classes = "text-white" : classes = "text-zinc-500"
                return <div
                    key={page}
                    className={`${classes} flex flex-col items-center mt-8`}
                    onClick={() => handleNavigate(page)}>{icons[page]}
                </div>
            })
            }
        </div>
    )
}