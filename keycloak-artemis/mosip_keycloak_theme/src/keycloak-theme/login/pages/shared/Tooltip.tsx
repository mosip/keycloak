import { useState, useRef } from "react";
import { FC} from "react";

interface Props {
    children: any;
    tooltip?: string;
    dir?:string;
}

const ToolTip: FC<Props> = ({ children, tooltip,  dir }): JSX.Element => {

    const [showInfoMsg, setShowInfoMsg] = useState(false);
    const infoRef = useRef<HTMLSpanElement>(null);
    const iconRef = useRef<HTMLImageElement>(null);

    window.addEventListener("click", (e) => {
        if(!infoRef.current?.contains(e.target as Node) && !iconRef.current?.contains(e.target as Node)){
            setShowInfoMsg(false)
        }
    })

    return (
        <div
            className="relative inline-block"
        >
            <img ref={iconRef} onClick={() => setShowInfoMsg(!showInfoMsg)} className="mx-2 cursor-pointer mt-1" alt="info" src={children} />
            {(tooltip && showInfoMsg) ? (
                <>
                    <span ref={infoRef}
                        className={`opacity-100 transition bg-white text-gray shadow-lg border p-2 rounded absolute top-1/2 -translate-y-1/2 border-gray-300 z-50 w-80 h-[80px] overflow-auto text-lg text-hTextColor font-semibold ${dir !== 'ar' ? 'left-[calc(100%+5px)]' : 'right-[calc(100%+5px)]' } `}
                    >
                        {tooltip}
                        <div className={`absolute h-[9px] w-[9px] border border-gray-300 -translate-x-1/2 rotate-45 bg-white content-none top-[45%] ${dir !== 'ar' ? '-left-[.8px] border-r-0 border-t-0' : '-right-[9.6px] border-l-0 border-b-0' }`}>

                        </div>
                    </span>

                </>
            ) : null}
        </div>
    );
};

export default ToolTip;