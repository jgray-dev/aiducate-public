import {CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, XMarkIcon} from '@heroicons/react/20/solid'
import { TailSpin } from 'react-loading-icons'


export default function Alert({text, setAlertText, alertType}) {
    const icons = {
        "info": <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />,
        "warn": <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" aria-hidden="true" />,
        "error": <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />,
        "loading": <TailSpin stroke="#0e7490" className="h-5 w-5" aria-hidden="true" />
    }
    
    const bgcolor = {
        "info": "bg-green-100",
        "warn": "bg-orange-100",
        "error": "bg-red-100",
        "loading": "bg-cyan-100"
    }
    
    const textcolor = {
        "info": "text-green-700",
        "warn": "text-orange-700",
        "error": "text-red-700",
        "loading": "text-cyan-700"
    }
    
    return (
        <div className="h-fit fixed z-50 bottom-10 right-10 shadow-xl shadow-black">
            <div className={`rounded-md bg-green-50 ${bgcolor[alertType]} p-4`}>
                <div className="flex">
                    <div className="flex-shrink-0">
                        {icons[alertType]}
                    </div>
                    <div className="ml-3">
                        <p className={`text-sm font-medium ${textcolor[alertType]}`}>{text}</p>
                    </div>
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                className={`inline-flex rounded-md ${bgcolor[alertType]}  p-1.5 ${textcolor[alertType]} hover:bg-opacity-60`}
                            >
                                <span className="sr-only">Dismiss</span>
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" onClick={(e)=>setAlertText("")}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
